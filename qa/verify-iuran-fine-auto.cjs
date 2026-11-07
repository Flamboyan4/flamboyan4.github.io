'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const bridge=fs.readFileSync('portal-live/f4-book-write-bridge.js','utf8');
const worker=fs.readFileSync('cloudflare/worker-terpadu-operasional-teruji.js','utf8');
const book=fs.readFileSync('pembukuan/index.html','utf8');
new vm.Script(bridge,{filename:'f4-book-write-bridge.js'});
assert(worker.includes('async function f4IuranFineDue'));
assert(worker.includes('fine_via_iuran'));
assert(worker.includes("fine-pay"));
assert(worker.includes('sum-totalFineRp'));
assert(worker.includes('if(total+totalFineRp !== sum)'));
assert(worker.includes("json_extract('invalid-fine-state','$')"));
assert(worker.includes('Iuran ini telah melunasi Denda otomatis'));
assert(book.includes('pv-denda-otomatis'));
assert(book.includes('20261107-denda-kebersihan-v1'));
const start=bridge.indexOf('async function buildPayment(p)');
const end=bridge.indexOf('async function saveIuran',start);
assert(start>=0&&end>start);
const source=bridge.slice(start,end);
const factory=new Function('fetchApi','checkAdvances','kinds','i','URLSearchParams',source+';return buildPayment');
const kinds=['IURAN_BULANAN','KEBERSIHAN','KAS_LORONG','ARISAN'];
const components=[['IURAN_BULANAN',25000],['KEBERSIHAN',20000],['KAS_LORONG',10000],['ARISAN',0]];
const cases=[
 ['Tanpa denda penuh',55000,[],[25000,20000,10000,0]],
 ['Tanpa denda parsial',50000,[],[25000,20000,5000,0]],
 ['Denda penuh',55000,[{id:'f1',sisaRp:20000}],[25000,0,10000,20000]],
 ['Denda parsial',50000,[{id:'f1',sisaRp:20000}],[25000,0,5000,20000]],
 ['Denda kas kosong',45000,[{id:'f1',sisaRp:20000}],[25000,0,0,20000]],
 ['Denda dua tagihan',55000,[{id:'f1',sisaRp:20000},{id:'f2',sisaRp:20000}],[25000,0,10000,20000]]
];
async function run(){
 for(const [label,amount,fines,expected] of cases){
  const fetchApi=async path=>{
   if(path.includes('/outstanding'))return {komponen:components.map(([jenis,sisaRp])=>({jenis,sisaRp}))};
   if(path.includes('/fines'))return {data:fines};
   throw Error('Unknown request '+path);
  };
  const build=factory(fetchApi,async()=>null,kinds,Number,URLSearchParams);
  const result=await build({payerId:'payer',tanggal:'2026-11-07',tahun:2026,bulan:11,jumlahBulan:1,jumlahRp:amount,metode:'Cash',catatan:''});
  const values=kinds.slice(0,3).map(kind=>result.alokasi.filter(x=>x.jenis===kind).reduce((s,x)=>s+x.nominal,0));
  values.push(result.denda.reduce((s,x)=>s+x.nominal,0));
  assert.deepEqual(values,expected,label);
  assert.equal(values.reduce((a,b)=>a+b,0),amount,label+' must reconcile');
 }
 const bad=factory(async path=>{
  if(path.includes('/outstanding'))return {komponen:components.map(([jenis,sisaRp])=>({jenis,sisaRp}))};
  return {data:[]};
 },async()=>null,kinds,Number,URLSearchParams);
 await assert.rejects(()=>bad({payerId:'payer',tanggal:'2026-11-07',tahun:2026,bulan:11,jumlahBulan:1,jumlahRp:40000,metode:'Cash',catatan:''}),/Nominal/);
 const startWorker=worker.indexOf('async function f4IuranFineDue');
 const beginCreate=worker.indexOf('async function createIuranPayment',startWorker);
 const endCreate=worker.indexOf('__name(createIuranPayment',beginCreate);
 assert(startWorker>=0&&beginCreate>startWorker&&endCreate>beginCreate);
 const helper=worker.slice(startWorker,beginCreate).replace(/__name\([^\n]*\);/g,'');
 const create=worker.slice(beginCreate,endCreate);
 const maker=new Function('requestJson','validDateOnly','validRupiah','safeError','json','tokenHash','getIuranTariffs','f4PeriodObligation','f4IuranAmounts','crypto','__name',helper+create+';return createIuranPayment;');
 for(const withFine of [false,true]){
  const calls=[];
  const db={
   prepare(sql){return{bind(...values){return{
    sql,values,
    async first(){
     if(sql.includes('bookkeeping_payment_request_keys WHERE'))return null;
     if(sql.includes('SELECT id,household_id,active FROM bookkeeping_payers'))return{id:'payer',household_id:'house',active:1};
     if(sql.includes('bookkeeping_year_archives'))return null;
     throw Error('Unexpected first '+sql);
    },
    async all(){
     if(sql.includes('FROM bookkeeping_advances'))return {results:[]};
     if(sql.includes('FROM bookkeeping_payment_allocations a')&&sql.includes('paid_rp'))return {results:[]};
     if(sql.includes('FROM bookkeeping_fines WHERE'))return {results:withFine?[{id:'f1',event_on:'2026-10-01',fine_type:'gorol',amount_rp:20000,paid_rp:0,status:'belum'}]:[]};
     throw Error('Unexpected all '+sql);
    }
   }}}},
   async batch(batch){calls.push(...batch);return batch.map(()=>({meta:{changes:1}}))}
  };
  const payload={
   requestKey:'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
   payerId:'payer',tanggal:'2026-11-07',metode:'Cash',catatan:'',
   jumlahRp:55000,
   alokasi:withFine?[
    {tahun:2026,bulan:11,jenis:'IURAN_BULANAN',nominal:25000},
    {tahun:2026,bulan:11,jenis:'KAS_LORONG',nominal:10000}
   ]:[
    {tahun:2026,bulan:11,jenis:'IURAN_BULANAN',nominal:25000},
    {tahun:2026,bulan:11,jenis:'KEBERSIHAN',nominal:20000},
    {tahun:2026,bulan:11,jenis:'KAS_LORONG',nominal:10000}
   ],
   denda:withFine?[{id:'f1',nominal:20000}]:[]
  };
  const execute=maker(async()=>payload,x=>/^\d{4}-\d\d-\d\d$/.test(x),n=>Number.isSafeInteger(n)&&n>0,(message,status)=>({ok:false,message,status}),(data,status)=>({...data,status,ok:true}),async()=>'hashed',async()=>({TARIF_BULANAN:25000,TARIF_KEBERSIHAN:20000,TARIF_KAS_LORONG:10000,TARIF_ARISAN:0}),async()=>({qty_iuran_bulanan:1,qty_kebersihan:1,qty_kas_lorong:1,qty_arisan:0}),(v,t)=>({IURAN_BULANAN:t.TARIF_BULANAN,KEBERSIHAN:t.TARIF_KEBERSIHAN,KAS_LORONG:t.TARIF_KAS_LORONG,ARISAN:0}),{randomUUID:()=>'00000000-0000-0000-0000-000000000001'},()=>{});
  const response=await execute({},{DB:db,FINANCE_WRITE_ENABLED:'true',IURAN_WRITE_ENABLED:'true',DENDA_PINJAMAN_WRITE_ENABLED:'true'},{id:'admin'});
  assert.equal(response.ok,true,'Server should accept valid request');
  const payment=calls.find(x=>x.sql.includes('INSERT INTO bookkeeping_payments('));
  const fines=calls.filter(x=>x.sql.includes('INSERT INTO bookkeeping_fine_payments('));
  const allocations=calls.filter(x=>x.sql.includes('INSERT INTO bookkeeping_payment_allocations('));
  assert.equal(payment.values[5],withFine?35000:55000);
  assert.equal(fines.length,withFine?1:0);
  assert.equal(allocations.reduce((n,x)=>n+x.values[6],0),payment.values[5]);
  assert.equal(payment.values[5]+fines.reduce((n,x)=>n+x.values[3],0),55000);
 }
 console.log('F4_IURAN_FINE_AUTO_OK');
}
run().catch(err=>{console.error(err);process.exitCode=1});
