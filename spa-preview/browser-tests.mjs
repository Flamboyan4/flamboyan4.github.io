/* Browser regression suite: all external traffic is mocked or blocked. */
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,firefox} from 'playwright';
const root=dirname(fileURLToPath(import.meta.url));
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+sep)){res.writeHead(403).end();return}
  const data=await readFile(file),types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(data);
 }catch{res.writeHead(404).end()}
});
await new Promise((done,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',done)});
const origin='http://127.0.0.1:'+server.address().port;
const fixtures={
 '/api/v2/public/portal':{agenda:[],documentation:[],inventory:[],meetings:[],arisan:[]},
 '/api/v2/public/bank':{overview:{activeMembers:1,recordedWeightKg:1.25,recordedDeposits:1,activeItems:1},catalog:[{id:'waste:1',name:'Kertas',category:'Kertas',priceRpPerKg:1000,active:1}],progress:[]},
 '/api/v2/public/bank/report':{summary:{beratKg:1.25,hasilPenjualan:1000,hakWarga:500,pendingWeightKg:0},monthly:[]},
 '/api/member/savings':{saldoTersediaRp:500,totalCairRp:0,riwayatLengkap:true,setoran:[],mutasi:[]},
 '/api/member/bank/payout-requests':{items:[]},'/api/admin/bank/payout-requests':{items:[{id:'request:bank:00000000-0000-4000-8000-000000000001',nama:'Warga uji',rumah:'A/1',status:'diajukan',amount_rp:500,balance_rp:1000}]},
 '/api/v2/admin/bank/members':{rows:[{id:'member:1',nama:'Warga uji',rumah:'A/1',status:'aktif'}]},
 '/api/v2/admin/bank/catalog':{rows:[{id:'waste:1',name:'Kertas',active:1}]},
 '/api/v2/admin/bank/batches':{rows:[{id:'batch1',status:'draft'}]},
 '/api/v2/admin/bank/sales':{rows:[{id:'sale-test',batch_id:'batch1',status:'draft',sold_on:'2026-11-26',buyer_name:'Lapak uji',amount_received_rp:10000}]},
 '/api/v2/admin/content/obligations':{rows:[{payer_id:'payer:1'}]},'/api/bookkeeping/iuran/tariffs':{config:{TEST:1}},
 '/api/v2/admin/residents':{rows:[{household_id:'h1',payer_id:'payer:1',nama:'Warga uji',rumah:'A/1',active:1}]},
 '/api/v2/admin/content/settings':{data:[]},
 '/api/bookkeeping/iuran/outstanding':{komponen:[{jenis:'IURAN_BULANAN',sisaRp:25000},{jenis:'KEBERSIHAN',sisaRp:20000},{jenis:'KAS_LORONG',sisaRp:10000},{jenis:'ARISAN',sisaRp:60000}]},
 '/api/bookkeeping/iuran/fines':{data:[{id:'fine1',sisaRp:20000}]},'/api/bookkeeping/talangan':{data:[]}
};
const assert=(v,m)=>{if(!v)throw Error(m)};
async function run(browser,role){
 const ctx=await browser.newContext({viewport:{width:360,height:812},deviceScaleFactor:2,hasTouch:true});
 const errors=[],posts=[],unknown=[];
 await ctx.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin===origin){await route.continue();return}
  if(url.origin!=='https://api.flamboyan4.web.id'){await route.abort();return}
  const headers={'access-control-allow-origin':origin,'access-control-allow-credentials':'true','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'};
  if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers});return}
  if(req.method()==='POST'&&url.pathname==='/api/admin/reconciliation/preview'){
   const body=req.postDataJSON();if(body.batchId!=='batch1'||!['admin','superadmin'].includes(role)){await route.fulfill({status:403,headers,json:{ok:false}});return}
   await route.fulfill({status:200,headers,json:{ok:true,batchId:'batch1',saleId:'sale-test',receivedRp:10000,grossRp:10000,citizenRightsRp:5000,environmentRp:5000,wargaPercent:50,weightDifferenceGrams:0,hasWeightDifference:false}});return;
  }
  if(req.method()!=='GET'){posts.push(url.pathname);await route.fulfill({status:403,headers,json:{ok:false}});return}
  const data=url.pathname==='/api/v2/auth/session'?{account:role==='public'?null:{id:'test-'+role,role:role==='warga'?'anggota':role,displayName:'Akun uji'}}:fixtures[url.pathname];
  if(data===undefined){unknown.push(url.pathname);await route.fulfill({status:404,headers,json:{ok:false}});return}
  if(url.pathname==='/api/v2/public/bank')await new Promise(r=>setTimeout(r,180));
  await route.fulfill({status:200,headers,json:data});
 });
 try{
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  const heading=name=>page.getByRole('heading',{name,exact:true}).waitFor({timeout:10000});
  const dock=page.locator('#app-dock'),click=key=>dock.locator('[data-route="'+key+'"]').click();
  const routeIs=key=>page.waitForFunction(key=>new URL(location.href).searchParams.get('portal')===key,key);
  await page.goto(origin);await heading('Portal Utama');await routeIs('home');
  await page.evaluate(()=>{window.testShell={header:document.getElementById('app-header'),dock:document.getElementById('app-dock'),items:[...document.querySelectorAll('#app-dock>button')]};});
  const identity=async()=>assert(await page.evaluate(()=>{const s=window.testShell;return s.header===document.getElementById('app-header')&&s.dock===document.getElementById('app-dock')&&s.items.every((n,i)=>n===document.querySelectorAll('#app-dock>button')[i]);}),'Header/dock node changed: '+role);
  await click('bank');await heading('Bank Sampah');await routeIs('bank-home');await identity();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow: '+role);
  if(role==='admin'||role==='superadmin'){
   await click('input');await heading('Catat setoran');await routeIs('bank-deposit');await identity();
   await page.getByLabel('Nama warga',{exact:true}).selectOption('member:1');
   await page.getByLabel('Jenis barang',{exact:true}).selectOption('waste:1');
   await page.getByLabel('Berat (kg)',{exact:true}).fill('1.25');
   await page.getByRole('button',{name:'Periksa hasil timbang',exact:true}).click();
   await page.getByText(/Simulasi kontrak transaksi berhasil/).waitFor();
   await click('bank');await heading('Bank Sampah');await identity();
   if(role==='admin'){
    await click('sale');await heading('Penjualan');await identity();
    await page.getByLabel('Batch',{exact:true}).selectOption('batch1');
    await page.getByLabel('Nama lapak',{exact:true}).fill('Lapak uji');
    await page.getByLabel('Jenis barang',{exact:true}).selectOption('waste:1');
    await page.getByLabel('Berat jual',{exact:true}).fill('1.25');
    await page.getByLabel('Harga per kg',{exact:true}).fill('2000');
    await page.getByLabel('Uang diterima (Rp)',{exact:true}).fill('2500');
    await page.getByRole('button',{name:'Periksa transaksi',exact:true}).click();
    await page.getByText(/Simulasi penjualan:/).waitFor();
    await page.getByLabel('Batch penjualan',{exact:true}).selectOption('batch1');
    await page.getByRole('button',{name:'Periksa hasil penjualan',exact:true}).click();
    await page.getByLabel('Kas Lorong (Rp)',{exact:true}).fill('5000');
    await page.getByLabel('Ketik ID batch: batch1',{exact:true}).fill('batch1');
    await page.getByLabel('Setujui hasil timbang dan alokasi',{exact:true}).check();
    await page.getByRole('button',{name:'Uji pengesahan',exact:true}).click();
    await page.getByText(/Kontrak pengesahan valid/).waitFor();
    await click('bank');await heading('Bank Sampah');await page.getByRole('button',{name:'Pencairan',exact:true}).click();await heading('Pencairan tabungan');await identity();
    await page.getByRole('button',{name:'Uji setujui',exact:true}).click();await page.getByText(/Validasi setujui berhasil/).waitFor();
   }else{
    await click('book');await heading('Pembukuan');await identity();
    await click('input');await heading('Input Iuran');await identity();
    await page.getByLabel('Nama warga',{exact:true}).selectOption('payer:1');
    await page.getByLabel('Nominal dibayar (Rp)',{exact:true}).fill('115000');
    await page.getByRole('button',{name:'Periksa alokasi',exact:true}).click();
    await page.getByText(/Validasi berhasil/).waitFor();
    await click('superadmin');await heading('Superadmin');await identity();
   }
  }else if(role==='warga'){
   await click('payout');await heading('Pengajuan pencairan');await identity();
   const amount=page.getByLabel('Nominal pencairan (Rp)',{exact:true});
   await amount.fill('501');await page.getByRole('button',{name:'Periksa pengajuan',exact:true}).click();await page.getByText(/Nominal atau catatan pengajuan tidak valid/).waitFor();
   await amount.fill('500');await page.getByRole('button',{name:'Periksa pengajuan',exact:true}).click();await page.getByText(/Simulasi pengajuan berhasil/).waitFor();
   await click('report');await heading('Laporan tabungan');await identity();
  }
  await click('home');await heading('Portal Utama');await routeIs('home');await identity();
  await page.goBack();await page.waitForFunction(()=>new URL(location.href).searchParams.get('portal')!=='home');await page.waitForFunction(()=>document.querySelector('#outlet')?.getAttribute('aria-busy')==='false');await identity();
  assert(posts.length===0,'Unexpected external POST: '+posts.join(','));
  assert(unknown.length===0,'Unmocked endpoint: '+unknown.join(','));
  assert(errors.length===0,'Browser JS error: '+errors.join(','));
  console.log('PASS browser '+role+' — same header/dock, routes, forms, zero external writes');
 }finally{await ctx.close()}
}
try{
 for(const engine of [chromium,firefox]){
  const browser=await engine.launch({headless:true});
  try{for(const role of ['public','warga','admin','superadmin'])await run(browser,role)}finally{await browser.close()}
 }
}finally{await new Promise(r=>server.close(r))}
