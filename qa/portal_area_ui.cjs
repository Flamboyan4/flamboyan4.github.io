/* Run: node qa/portal_area_ui.cjs. Requires Playwright Chromium.
   All API traffic is intercepted; these checks never read or write production data. */
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright' : 'playwright');
const assert=require('node:assert/strict'),fs=require('fs');
(async()=>{
const http=require('node:http'),path=require('node:path');
const server=http.createServer((req,res)=>{let file=path.join(__dirname,'..',decodeURIComponent(new URL(req.url,'http://local').pathname));if(file.endsWith('/'))file+='index.html';try{const data=fs.readFileSync(file);res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':'text/html');res.end(data)}catch{res.statusCode=404;res.end()}});
await new Promise(r=>server.listen(8765,'127.0.0.1',r));


const writes=[];let role='superadmin';
const bankAlbum={id:'b1',title:'Penimbangan Bank Sampah',event_on:'2026-10-11',category:'Bank Sampah: Penimbangan',status:'aktif',visibility:'publik',description:'Kegiatan bank',active:1};
const portalAlbum={id:'p1',title:'Rapat Warga Portal Utama',category:'Acara',event_on:'2026-10-10',visibility:'publik',active:1};
const bankStock={id:'b2',name:'Timbangan Bank Sampah',category:'bank_sampah',quantity:1,unit:'unit',active:1};
const portalStock={id:'p2',name:'Kursi Portal Utama',category:'Peralatan',quantity:20,unit:'unit'};
for(const width of [1365,390]){
 const browser=await chromium.launch({executablePath:process.env.F4_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage'],headless:true});
 const context=await browser.newContext({viewport:{width,height:900}});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='127.0.0.1')return route.continue();
  if(url.hostname!=='api.flamboyan4.web.id')return route.abort();
  const path=url.pathname;
  let data={ok:true,data:[]};
  if(path.endsWith('/auth/session'))data=role==='superadmin'?{ok:true,account:{id:'qa',role,username:'QA'},member:{id:'qa',nama:'Pengelola'}}:{ok:true};
  if(path.endsWith('/content/documentation'))data={ok:true,data:[portalAlbum]};
  if(path.endsWith('/content/inventory'))data={ok:true,data:[portalStock]};
  if(path.endsWith('/bank/albums'))data={ok:true,data:[bankAlbum,{...portalAlbum,status:'aktif'}]};
  if(path.endsWith('/bank/inventory'))data={ok:true,data:[bankStock]};
  if(path.endsWith('/bank/progress'))data={ok:true,data:[{id:'b3',title:'Pengumpulan sampah',happened_on:'2026-10-11',stage:'Penimbangan',status:'Berjalan'}]};
  if(path.endsWith('/public/bank'))data={ok:true,overview:{activeMembers:42,confirmedWeightKg:218,activeItems:11},progress:[{id:'b3',title:'Pengumpulan sampah',happened_on:'2026-10-11',stage:'Penimbangan',status:'Berjalan'}],inventory:[bankStock],albums:[bankAlbum],catalog:[]};
  if(route.request().method()==='POST'){writes.push({path,body:route.request().postDataJSON()});data={ok:true,id:'qa-created'};}
  return route.fulfill({json:data,headers:{'access-control-allow-origin':'http://127.0.0.1:8765','access-control-allow-credentials':'true'}});
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 role='superadmin';
 await page.goto('http://127.0.0.1:8765/superadmin/#sa-bank');
 await page.getByRole('tab',{name:'Dokumentasi',exact:true}).click();
 await page.getByText(bankAlbum.title,{exact:true}).waitFor();
 assert.equal(await page.getByText(portalAlbum.title,{exact:true}).count(),0);
 await page.screenshot({path:`/tmp/sa-bank-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'+ Tambah album',exact:true}).click();
 assert.equal(await page.locator('select[name=destination]').inputValue(),'bank-sampah');
 assert(await page.locator('select[name=destination]').isDisabled());
 await page.locator('input[name=title]').fill('Uji formulir Bank');
 await page.getByRole('button',{name:'Simpan Perubahan',exact:true}).click();
 await page.getByText(bankAlbum.title,{exact:true}).waitFor();
 assert.equal(writes.at(-1).path,'/api/v2/admin/bank/albums');
 assert.equal(await page.locator('body').getAttribute('data-sa-area'),'bank');
 await page.getByRole('tab',{name:'Inventaris',exact:true}).click();
 await page.getByText(bankStock.name,{exact:true}).waitFor();
 assert.equal(await page.getByText(portalStock.name,{exact:true}).count(),0);
 await page.getByRole('button',{name:'Edit',exact:true}).click();
 await page.locator('input[name=name]').fill('Timbangan Bank Baru');
 await page.getByRole('button',{name:'Simpan Perubahan',exact:true}).click();
 await page.getByText(bankStock.name,{exact:true}).waitFor();
 assert.equal(writes.at(-1).path,'/api/v2/admin/content/transfer');
 assert.equal(writes.at(-1).body.source,'bank-sampah');
 assert.equal(writes.at(-1).body.destination,'bank-sampah');
 // Exercise the actual mobile drawer when moving between areas.
 if(width<1024)await page.locator('#f4-mobile-menu').click();
 await page.locator('aside').getByRole('button',{name:'Portal Utama',exact:true}).click();
 await page.getByRole('tab',{name:'Dokumentasi',exact:true}).click();
 await page.getByText(portalAlbum.title,{exact:true}).waitFor();
 assert.equal(await page.getByText(bankAlbum.title,{exact:true}).count(),0);
 await page.getByRole('button',{name:'+ Tambah Dokumentasi',exact:true}).click();
 assert.equal(await page.locator('select[name=destination]').inputValue(),'portal');
 await page.locator('input[name=title]').fill('Uji formulir Portal');
 await page.getByRole('button',{name:'Simpan Perubahan',exact:true}).click();
 await page.getByText(portalAlbum.title,{exact:true}).waitFor();
 assert.equal(writes.at(-1).path,'/api/v2/admin/content/documentation');
 await page.getByRole('tab',{name:'Inventaris',exact:true}).click();
 await page.getByText(portalStock.name,{exact:true}).waitFor();
 assert.equal(await page.getByText(bankStock.name,{exact:true}).count(),0);
 await page.screenshot({path:`/tmp/sa-portal-${width}.png`,fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Superadmin overflow');
 await page.goto('http://127.0.0.1:8765/bank-sampah/');
 await page.locator('#dashboardView').waitFor({state:'visible'});
 await page.screenshot({path:`/tmp/bank-admin-${width}.png`,fullPage:false});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Bank admin overflow');
 role='public';await page.goto('http://127.0.0.1:8765/bank-sampah/');
 await page.locator('#v17PublicMetrics .v17-public-metric').first().waitFor();
 await page.screenshot({path:`/tmp/bank-${width}.png`,fullPage:false});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Bank overflow');
 assert.deepEqual(errors,[]);
 console.log('PASS',width,'separate lists, destinations, save/edit, navigation, overflow, runtime');
 await context.close();await browser.close();
}
server.close();
})().catch(e=>{console.error(e);process.exit(1)});
