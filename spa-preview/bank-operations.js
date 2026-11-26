/* Preview-only operation runner. The original adapter builds request bodies.
   No real network access or database writes are possible in this simulation. */
import {createTransactionService} from './transactions.js';
export async function simulateBankOperation({role,kind,payload,crypto=globalThis.crypto}){
 const requests=[];
 const endpoints={deposit:['/api/v2/admin/bank/batches','/api/v2/admin/bank/deposits'],sale:['/api/admin/sales/draft'],payout:['/api/member/bank/payout-requests']}[kind];
 if(!endpoints)throw Error('Operasi simulasi tidak dikenal.');
 const service=createTransactionService({role,accountKey:'simulation-only',allowWrites:true,crypto,transport:async(path,body)=>{
  if(path!==endpoints[requests.length]||!body)throw Error('Kontrak simulasi tidak sesuai.');
  requests.push({path,body:JSON.parse(JSON.stringify(body))});
  return {id:kind==='deposit'&&requests.length===1?'SIMULASI-BATCH':'SIMULASI',ok:true,grossRp:0,receivedRp:0};
 }});
 if(kind==='deposit')await service.bank('bsV5BuatSetoran','',payload);
 else if(kind==='sale')await service.bank('bsV6SimpanPenjualan','',payload);
 else await service.payoutRequest(payload);
 if(requests.length!==endpoints.length)throw Error('Kontrak simulasi tidak lengkap.');
 return requests;
}
export function validateSale({batch,date,buyer,received,proof='',note='',items,nonce},batches,catalog){
 const eligible=x=>!['dibatalkan','terkonfirmasi','closed','cancelled'].includes(String(x.status).toLowerCase());
 if(!batches.some(x=>String(x.id)===batch&&eligible(x)))throw Error('Pilih batch terbuka yang valid.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||!buyer.trim()||!nonce||!items.length)throw Error('Lengkapi tanggal, lapak dan barang.');
 const used=new Set(),lines=items.map(x=>{
  const c=catalog.find(v=>String(v.id)===x.id&&v.active!==false&&String(v.active)!=='0');
  const w=Number(x.weight),g=Math.round(w*1000),price=Number(x.price),s=Number(x.unsold||0),sg=Math.round(s*1000);
  if(!c||used.has(x.id)||!Number.isSafeInteger(g)||g<=0||g>10000000||Math.abs(g/1000-w)>0.000001||!Number.isSafeInteger(price)||price<1||!Number.isSafeInteger(sg)||sg<0||Math.abs(sg/1000-s)>0.000001)throw Error('Periksa jenis barang, berat (0,001 kg), harga dan berat sisa.');
  used.add(x.id);return {kode:x.id,berat:w,harga:price,sisa:s};
 });
 const amount=Number(received);
 if(received===''||!Number.isSafeInteger(amount)||amount<0)throw Error('Uang diterima harus rupiah bulat minimal nol.');
 return {batch,tanggal:date,lapak:buyer.trim(),diterima:amount,bukti:proof.trim(),alasanSelisih:note.trim(),items:lines,nonce};
}
function draft(root,{el,panel,title,signal,submitLabel,execute}){
 const p=panel(root,title),form=el('form',null,'bank-draft'),status=el('p'),submit=el('button',submitLabel);
 status.setAttribute('role','status');submit.type='submit';let dirty=false,busy=false,revision=0;
 function change(){dirty=true;revision++;status.textContent=''}
 function field(label,node){const n=el('label',label);node.setAttribute('aria-label',label);n.append(node);return n}
 function input(type,value='',required=true){const n=el('input');n.type=type;n.value=value;n.required=required;return n}
 function select(choices){const n=el('select');n.required=true;for(const [v,t] of choices){const o=el('option',t);o.value=String(v);n.append(o)}return n}
 form.addEventListener('input',change);
 form.addEventListener('submit',async e=>{e.preventDefault();if(busy||submit.disabled)return;busy=true;submit.disabled=true;const rev=revision;try{const message=await execute();if(!signal.aborted&&rev===revision){status.textContent=message+' Tidak ada transaksi disimpan.';dirty=false}}catch(error){if(!signal.aborted&&rev===revision)status.textContent=error.message}finally{busy=false;submit.disabled=false}});
 p.append(form);
 return {form,submit,status,change,field,input,select,finish(){form.append(submit,status)},canLeave:()=>!busy&&(!dirty||window.confirm('Draf uji belum diperiksa. Tinggalkan halaman?'))};
}
export function attachSaleForm(root,{role,el,panel,batches,catalog,today,signal}){
 const eligible=x=>!['dibatalkan','terkonfirmasi','closed','cancelled'].includes(String(x.status).toLowerCase());
 const d=draft(root,{el,panel,title:'Uji catat penjualan',signal,submitLabel:'Periksa transaksi',execute:async()=>{
  const payload=validateSale({batch:batch.value,date:date.value,buyer:buyer.value,received:received.value,proof:proof.value,note:note.value,nonce:crypto.randomUUID(),items:[...items.children].map(x=>({id:x.children[0].value,weight:x.children[1].value,price:x.children[2].value,unsold:x.children[3].value}))},batches,catalog);
  const req=await simulateBankOperation({role,kind:'sale',payload});
  return 'Simulasi penjualan: '+req[0].body.lines.length+' jenis barang.';
 }});
 const batch=d.select([['','Pilih batch'],...batches.filter(eligible).map(x=>[x.id,x.month||x.period||x.id])]),date=d.input('date',today()),buyer=d.input('text'),received=d.input('number'),proof=d.input('text','',false),note=d.input('text','',false),items=el('div');
 received.min='0';received.step='1';
 function addLine(){
  const line=el('div',null,'bank-sale-line'),type=d.select([['','Jenis barang'],...catalog.filter(x=>x.active!==false&&String(x.active)!=='0').map(x=>[x.id,x.name||x.nama||'Barang'])]),weight=d.input('number'),price=d.input('number'),unsold=d.input('number','0',false),remove=el('button','Hapus');
  weight.min='0.001';weight.step='0.001';price.min='1';price.step='1';unsold.min='0';unsold.step='0.001';
  weight.placeholder='kg';price.placeholder='Rp/kg';unsold.placeholder='Sisa kg';
  for(const [n,label] of [[type,'Jenis barang'],[weight,'Berat jual'],[price,'Harga per kg'],[unsold,'Sisa berat']])n.setAttribute('aria-label',label);
  remove.type='button';remove.onclick=()=>{if(items.children.length>1){line.remove();d.change()}};line.append(type,weight,price,unsold,remove);items.append(line);
 }
 const add=el('button','Tambah jenis');add.type='button';add.onclick=()=>{addLine();d.change()};
 d.form.append(d.field('Batch',batch),d.field('Tanggal penjualan',date),d.field('Nama lapak',buyer),items,add,d.field('Uang diterima (Rp)',received),d.field('Nota atau URL bukti',proof),d.field('Alasan selisih',note));addLine();d.finish();return d.canLeave;
}
export function attachPayoutForm(root,{role,el,panel,balance,signal}){
 const d=draft(root,{el,panel,title:'Uji pengajuan pencairan',signal,submitLabel:'Periksa pengajuan',execute:async()=>{
  if(balance==null||!Number.isSafeInteger(Number(balance)))throw Error('Saldo belum dapat diverifikasi.');
  await simulateBankOperation({role,kind:'payout',payload:{requestKey:crypto.randomUUID(),amountRp:Number(amount.value),balanceRp:Number(balance),note:note.value}});
  return 'Simulasi pengajuan berhasil. Saldo tidak berubah.';
 }});
 const amount=d.input('number'),note=d.input('text','',false);amount.min='1';amount.step='1';amount.inputMode='numeric';note.maxLength=180;
 d.form.append(d.field('Nominal pencairan (Rp)',amount),d.field('Catatan (opsional)',note));d.finish();d.submit.disabled=balance==null||!Number.isSafeInteger(Number(balance))||Number(balance)<1;
 return d.canLeave;
}
