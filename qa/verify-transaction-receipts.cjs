'use strict';
/* Shared resi regression: no real ledger, login, network, or finance writes. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const engine=fs.readFileSync('portal-live/transaction-receipts.js','utf8');
const book=fs.readFileSync('pembukuan/index.html','utf8');
const bank=fs.readFileSync('bank-sampah/index.html','utf8');
new vm.Script(engine,{filename:'transaction-receipts.js'});
for(const [label,html] of [['pembukuan',book],['bank-sampah',bank]]){
 const blocks=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(Boolean);
 for(const code of blocks)new vm.Script(code,{filename:label+' inline script'});
 assert(html.includes('transaction-receipts.js?v='),label+' must load the same resi engine');
}
assert(!engine.includes('!important'),'Receipt CSS must not use important');
const original=fs.readFileSync('portal-live/bookkeeping-extras.js','utf8');
assert(original.includes('const top=28,headerY=53,headerH=278'),'Original iuran ticket layout expected');
assert(engine.includes('const top=28,headerY=53,headerH=278'),'Shared JPG must match original iuran banner geometry');
assert(original.includes('const left=34,right=866,upper=top+3'),'Original iuran ticket scallops expected');
assert(engine.includes('const left=34,right=866,upper=top+3'),'Shared JPG must use original scalloped ticket edge');
assert(engine.includes('headerLines.slice(0,2)'),'Shared JPG must prevent overly long titles clipping');
assert(engine.includes('detailsEnd+2'),'Shared JPG keeps original receipt notches and dashed separators');
assert(engine.includes("status==='TERKONFIRMASI'"),'Confirmed bank deposit must show confirmation heading');
assert(engine.includes("if(pending){"),'Pending bank deposits must not look like a completed payment');
assert(!/\bfetch\s*\(|\bXMLHttpRequest\b|\bindexedDB\b/.test(engine),
 'Receipt renderer must remain local/read-only; never fetch or change ledger rows');
for(const kind of ['denda','pinjaman','bayar-pinjaman','talangan','pelunasan-talangan','kas']){
 assert(book.includes("kind==='"+kind+"'"),'Missing book receipt lookup '+kind);
}
assert(book.includes("x.status==='LUNAS'&&Number(x.nominal)>0"),
 'Denda receipt must require a settled fine');
assert(book.includes("valid(payment)&&Number(payment.nominalBayar)>0"),
 'Loan receipt must reject cancelled or empty payments');
assert(book.includes("if(!r){riwayatMsg('Resi tidak tersedia"),
 'Book receipt must refuse invalid source rows');
assert(bank.includes("title:final?'Bukti Hasil Setoran Sampah':'Bukti Penimbangan Sampah'"),
 'Bank deposit receipt must separate final vs estimated');
assert(bank.includes("amountLabel:final?'Hasil Setoran Sah':'Nilai Perkiraan'"),
 'Unconfirmed weights must never be presented as final revenue');
assert(bank.includes("status:final?'TERKONFIRMASI':'ESTIMASI — BELUM SAH'"),
 'Unconfirmed deposits need visible caution');
assert(bank.includes("received<gross?'BAYAR SEBAGIAN'"),'Partial sale payment status missing');
assert(bank.includes("if(x.id&&Number(x.nominal)>0&&String(x.status||'').toLowerCase()==='lunas')"),
 'Bank expense receipts require settled D1 expense rows');
assert(bank.includes("const personalMutations=(d.mutasi||[]).map(x=>"),
 'Member payout receipts must use own authenticated D1 statement');
assert(bank.includes("const receipt=f4BankReceiptIcon(s,()=>") &&
       bank.includes("summary.append(receipt)") &&
       bank.includes("row.append(summary);deposits.appendChild(row);") &&
       !bank.includes("details.appendChild(content);deposits.appendChild(details);"),
 'Member deposit list must stay flat; the receipt button beside each amount opens full details');
const logs=[];
const ctx=new Proxy({},{
 get(object,key){
  if(key==='measureText')return x=>({width:String(x).length*13});
  if(key==='fillText')return value=>logs.push(String(value));
  if(['beginPath','fill','stroke','fillRect','roundRect','arc','moveTo','lineTo','setLineDash','closePath','quadraticCurveTo','save','restore'].includes(key))return ()=>{};
  return object[key];
 },
 set(object,key,value){object[key]=value;return true}
});
const canvas={width:0,height:0,getContext:()=>ctx,toBlob:callback=>callback(new Blob(['jpg-image'],{type:'image/jpeg'}))};
const nodes=new Map();
const create=tag=>{
 if(tag==='canvas')return canvas;
 const node={tag,hidden:false,dataset:{},style:{},children:[],
  setAttribute(){},addEventListener(){},appendChild(child){this.children.push(child)},
  click(){},focus(){},remove(){},
  querySelector(sel){
   if(!this.q)this.q=new Map();
   if(!this.q.has(sel))this.q.set(sel,{dataset:{},style:{},focus(){},setAttribute(){}});
   return this.q.get(sel);
  }
 };
 return node;
};
const doc={head:{appendChild(){}},body:{style:{overflow:''},appendChild(n){if(n.id)nodes.set(n.id,n)}},
 createElement:create,getElementById:id=>nodes.get(id),addEventListener(){}};
let newObjectUrls=0;
const sandbox={window:{addEventListener(){}},document:doc,navigator:{},URL:{
 createObjectURL(){newObjectUrls++;return 'blob:mock'},
 revokeObjectURL(){}},Intl,Date,Number,Blob,File:class {},console};
vm.runInNewContext(engine,sandbox);
(async()=>{
 await sandbox.window.F4TransactionReceipt.open({
  scope:'bank',id:'deposit:qa-confirmed',title:'Bukti Hasil Setoran Sampah',
  party:'Bu Siti',house:'A5/43',date:'2026-11-10',method:'Setoran sampah',
  amount:20000,amountLabel:'Hasil Setoran Sah',status:'TERKONFIRMASI',
  details:[['Berat','4 kg']],note:'Bukan bukti pencairan'
 });
 assert.equal(newObjectUrls,1);
 assert(logs.some(x=>x.includes('TERKONFIRMASI')),'Rendered JPG missing final confirmation status');
 assert(logs.some(x=>x.includes('Setoran Terkonfirmasi')),'Successful bank receipt heading is wrong');
 assert(logs.some(x=>x.includes('Bukti Hasil Setoran Sampah')),'Subtitle must identify bank receipt');
 assert(logs.some(x=>x.includes('RINCIAN PEMBAYARAN')),'Shared JPG needs familiar iuran details section');
 assert(canvas.height>800,'Receipt paper should expand to fit its text');
 assert(logs.some(x=>x.includes('Rp 20.000')),'Rendered JPG missing actual amount');
 assert.equal(nodes.get('f4-tx-receipt-dialog').hidden,false);
 logs.length=0;
 await sandbox.window.F4TransactionReceipt.open({
  scope:'bank',id:'deposit:qa-pending',title:'Bukti Penimbangan Sampah',
  party:'Pak Heri',house:'A6/09',date:'2026-11-10',method:'Setoran sampah',
  amount:10000,amountLabel:'Nilai Perkiraan',status:'ESTIMASI — BELUM SAH'
 });
 assert(logs.some(x=>x.includes('ESTIMASI — BELUM SAH')),'Unconfirmed deposit must retain caution text');
 assert(!logs.some(x=>x.includes('Pembayaran Berhasil')),'Pending deposit must not claim successful payment');
 assert(logs.some(x=>x.includes('Bukti Penimbangan Sampah')),'Estimated deposit must use correct subtitle');
 await assert.rejects(()=>sandbox.window.F4TransactionReceipt.open({id:'',amount:1}),/Nomor atau nominal/);
 sandbox.window.F4TransactionReceipt.close();
 assert.equal(nodes.get('f4-tx-receipt-dialog').hidden,true);
 console.log('F4_TRANSACTION_RECEIPTS_OK');
})().catch(e=>{console.error(e);process.exitCode=1});
