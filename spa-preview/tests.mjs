import {collectCommunityAlbums,normalizeBankMedia} from './gallery.js';
import {simulateApproval,simulatePayoutDecision,validateAllocation} from './bank-approval.js';
import {webcrypto} from 'node:crypto';
import {createPortalRouter} from './router.js';
import {createTransactionService} from './transactions.js';
import {createBankModule,bankRoutes} from './bank.js';
import {simulateBankOperation,validateSale} from './bank-operations.js';
import {createBookModule,bookRoutes} from './book.js';
import {createCommunityModule,communityRoutes,adminRoutes} from './community.js';
if(!globalThis.crypto)Object.defineProperty(globalThis,'crypto',{value:webcrypto});
const assert=(condition,message)=>{if(!condition)throw Error(message)};
class Node {
 constructor(tag,text,cls){this.tagName=tag;this.textContent=text??'';this.className=cls||'';this.children=[];this.attrs={};this.value='';this.listeners={};this.dataset={};}
 append(...items){this.children.push(...items)}
 replaceChildren(...items){this.children=items}
 setAttribute(k,v){this.attrs[k]=String(v)}
 removeAttribute(k){delete this.attrs[k]}
 addEventListener(k,v){this.listeners[k]=v}
 remove(){this.removed=true}
}
const el=(tag,text,cls)=>new Node(tag,text,cls),panel=(root,name)=>{const n=el('section',name);root.append(n);return n};
const row=(root,name,detail)=>root.append(el('div',name+' '+(detail??'')));
const metric=row,links=(root,items)=>{for(const [a,b] of items){const n=el('a',a);n.href=b;root.append(n)}};
const fixture={
 '/api/v2/gallery':{albums:[],photos:[],suppressedDriveIds:[]},
 '/api/v2/public/portal':{agenda:[{title:'Agenda uji',starts_on:'2026-11-29'}],documentation:[],inventory:[],meetings:[],arisan:[]},
 '/api/v2/public/bank':{overview:{activeMembers:1,recordedWeightKg:1.25,recordedDeposits:1,activeItems:1},catalog:[{id:'waste:1',name:'Kertas',category:'Kertas',priceRpPerKg:1000,active:1}],progress:[]},
 '/api/v2/public/bank/report':{summary:{beratKg:1.25,hasilPenjualan:1000,hakWarga:500,pendingWeightKg:0},monthly:[]},
 '/api/member/savings':{saldoTersediaRp:500,totalCairRp:0,riwayatLengkap:true,setoran:[{id:'d1',tanggal:'2026-11-15',status:'terkonfirmasi',beratSahGram:1250,nilaiSahRp:500}],mutasi:[]},
 '/api/member/bank/payout-requests':{items:[]},'/api/admin/bank/payout-requests':{items:[]},
 '/api/v2/admin/bank/deposits':{rows:[]},
 '/api/v2/admin/bank/members':{rows:[{id:'member:1',nama:'Warga uji',rumah:'A/1',status:'aktif'}]},
 '/api/v2/admin/bank/catalog':{rows:[{id:'waste:1',name:'Kertas',active:1}]},
 '/api/v2/admin/bank/savings':{rows:[{member_id:'member:1',balanceRp:500}]},
 '/api/v2/admin/bank/batches':{rows:[{id:'batch1',status:'draft'}]},'/api/v2/admin/bank/sales':{rows:[]},'/api/v2/admin/bank/cash':{rows:[]},
 '/api/v2/admin/content/obligations':{rows:[{payer_id:'payer:1'}]},
 '/api/bookkeeping/iuran/tariffs':{config:{TEST:1}},
 '/api/v2/admin/residents':{rows:[{household_id:'h1',payer_id:'payer:1',nama:'Warga uji',rumah:'A/1',active:1}]},
 '/api/v2/admin/content/settings':{data:[]},'/api/bookkeeping/iuran/history':{rows:[]},
 '/api/bookkeeping/cash':{rows:[]},'/api/bookkeeping/denda':{data:[]},'/api/bookkeeping/pinjaman':{data:[]},'/api/bookkeeping/talangan':{data:[]},
 '/api/bookkeeping/year-archives':{data:[]},'/api/bookkeeping/reports/yearly':{data:{ringkasan:{saldoRp:10000}}},
 '/api/superadmin/accounts/preview':{akun:[]},'/api/v2/admin/content/projects':{data:[]},'/api/public/bank/weighing-schedule':{ok:true},
 '/api/bookkeeping/iuran/outstanding':{komponen:[{jenis:'IURAN_BULANAN',sisaRp:25000},{jenis:'KEBERSIHAN',sisaRp:20000},{jenis:'KAS_LORONG',sisaRp:10000},{jenis:'ARISAN',sisaRp:60000}]},
 '/api/bookkeeping/iuran/fines':{data:[{id:'fine1',sisaRp:20000}]}
};
const get=async(path)=>{const value=fixture[path.split('?')[0]];if(value===undefined)throw Error('Fixture tidak tersedia: '+path);return JSON.parse(JSON.stringify(value))};
const base={get,el,panel,row,metric,links,go:()=>{},accountKey:'test'};
let mounted=0,denied=0;
for(const role of ['public','warga','admin','superadmin']){
 const bm=createBankModule({...base,role}),bk=createBookModule({...base,role}),cm=createCommunityModule({...base,role});
 for(const [routes,module,permission] of [[bankRoutes,bm,key=>bankRoutes[key].includes(role)],[bookRoutes,bk,()=>role==='superadmin'],[communityRoutes,cm,()=>true],[adminRoutes,cm,()=>role==='superadmin']]){
  for(const key of Object.keys(routes)){
   const allowed=permission(key);let view,error;
   try{view=await module.mount({key,signal:{aborted:false}})}catch(e){error=e}
   if(allowed){assert(view?.node&&!error,role+' '+key+': '+error?.message);mounted++}
   else{assert(!view&&/ditolak|diizinkan/.test(error?.message||''),'Role guard '+role+' '+key);denied++}
  }
 }
}
assert(mounted===70&&denied===58,'Matriks 128 kombinasi');
const service=createTransactionService({role:'superadmin',accountKey:'test',transport:(path,payload)=>{assert(payload===undefined,'POST tidak diperbolehkan');return get(path)},allowWrites:false});
const params={idWarga:'payer:1',tanggal:'2026-11-26',tahun:2026,bulan:11,jumlahBulan:1,nominalDibayar:115000,metode:'Cash',catatan:''};
const p=await service.book('previewiuran',params);
assert(p.alokasi.reduce((n,x)=>n+x.nominal,0)===95000&&p.denda.reduce((n,x)=>n+x.nominal,0)===20000,'Alokasi denda');
assert(!p.alokasi.some(x=>x.jenis==='KEBERSIHAN'),'Redirect kebersihan');
let refused=false;try{await service.book('simpaniuran',params)}catch(e){refused=e.message.includes('dinonaktifkan')}assert(refused,'No live write');
const outgoing=[],fakeTransport=async(path,payload)=>{outgoing.push({path,payload});return path.endsWith('/batches')?{id:'test-batch'}:{id:'test-deposit',totalGrams:1250,estimatedRp:500}};
const bankService=createTransactionService({role:'admin',accountKey:'test',transport:fakeTransport,allowWrites:true});
const deposit=await bankService.bank('bsV5BuatSetoran','',{tanggal:'2026-11-26',wargaId:'1',nonce:'same',items:[{kode:'1',berat:1.25}]});
assert(deposit.id==='test-deposit'&&outgoing[1].payload.requestKey==='same'&&outgoing[1].payload.items[0].grams===1250,'Kontrak setoran asli');
const scope=()=>{const signal={aborted:false};return {signal,abort(){signal.aborted=true}}};
const root=el('body'),header=el('header'),dock=el('nav'),outlet=el('main');root.append(header,outlet,dock);
let deferred,dirty=false,allowBook=true;const history=[];
const r=createPortalRouter({outlet,routes:{home:async()=>({mount:async()=>({node:el('section','home'),canLeave:()=>!dirty})}),bank:async()=>({mount:({signal})=>new Promise(resolve=>deferred={signal,resolve})}),book:async()=>({mount:async()=>({node:el('section','book')})}),bad:async()=>({mount:async()=>{throw Error('failed')}})},allowed:k=>k!=='book'||allowBook,read:()=> 'home',write:(...x)=>history.push(x),createScope:scope});
assert(await r.go('home'),'home mount');dirty=true;assert(!await r.go('book'),'draft guard');dirty=false;
const slow=r.go('bank');await Promise.resolve();await Promise.resolve();
assert(outlet.inert&&outlet.children[0].textContent==='home','keep old content');
assert(await r.go('home')&&deferred.signal.aborted,'cancel pending');deferred.resolve({node:el('section','bank')});assert(!await slow,'ignore stale response');
assert(await r.go('book'),'book mount');assert(!await r.go('bad')&&r.current()==='book','keep content on failure');
assert(root.children[0]===header&&root.children[2]===dock,'same header and dock nodes');
allowBook=false;assert(await r.go('book')&&r.current()==='home','role fallback');r.reset();assert(!outlet.children.length&&!outlet.inert,'reset');
console.log('PASS: '+mounted+' mount, '+denied+' role denial; allocation, transaction payload, navigation lifecycle. All API calls mocked.');

const sim=await simulateBankOperation({role:'admin',kind:'deposit',payload:{tanggal:'2026-11-26',wargaId:'member:1',nonce:'test',items:[{kode:'waste:1',berat:1.25}]}});
assert(sim.length===2&&sim[1].body.items[0].grams===1250,'Simulated deposit');
const sale=validateSale({batch:'batch1',date:'2026-11-26',buyer:'Lapak uji',received:'2500',items:[{id:'waste:1',weight:'1.25',price:'2000',unsold:'0'}],nonce:'test'},[{id:'batch1',status:'draft'}],[{id:'waste:1',active:1}]);
const saleReq=await simulateBankOperation({role:'admin',kind:'sale',payload:sale});assert(saleReq[0].body.lines[0].grams===1250,'Simulated sale');
const payoutReq=await simulateBankOperation({role:'warga',kind:'payout',payload:{requestKey:'test',amountRp:500,balanceRp:500,note:'uji'}});assert(payoutReq[0].body.amountRp===500,'Simulated payout');
console.log('PASS: isolated Bank Sampah forms payloads');

const reconciled={ok:true,batchId:'batch-test',saleId:'sale-test',receivedRp:10000,grossRp:10000,citizenRightsRp:5000,environmentRp:5000,wargaPercent:50,weightDifferenceGrams:100,hasWeightDifference:true};
const allocation={confirmation:'batch-test',allSold:true,reserve:'1000',neighborhood:'2000',operation:'2000',note:'Selisih timbang'};
const approved=await simulateApproval({role:'admin',preview:reconciled,form:allocation});
assert(approved.reserveRp===1000&&approved.neighborhoodRp===2000&&approved.operationRp===2000&&approved.expectedWargaPercent===50,'Approval allocation payload');
for(const patch of [{reserve:'1001'},{confirmation:'other'},{note:''},{allSold:false}]){
 let failed=false;try{validateAllocation(reconciled,{...allocation,...patch})}catch{failed=true}assert(failed,'Invalid approval accepted');
}
const request={id:'request:bank:00000000-0000-4000-8000-000000000001',status:'diajukan',amount_rp:500,balance_rp:1000};
const review=await simulatePayoutDecision({role:'admin',item:request,action:'setujui'});
assert(review.action==='setujui','Payout review');
const paid=await simulatePayoutDecision({role:'superadmin',item:{...request,status:'disetujui'},action:'dibayar',paidOn:'2026-11-27'});
assert(paid.paidOn==='2026-11-27','Payout paid payload');
let invalid=false;try{await simulatePayoutDecision({role:'admin',item:request,action:'dibayar',paidOn:'2026-11-27'})}catch{invalid=true}assert(invalid,'Cannot pay unapproved request');
console.log('PASS: approval and payout management simulation');

const archiveTest=collectCommunityAlbums({albums:[{id:'galbum:test',title:'Album'}],photos:[{id:'gphoto:test',albumId:'galbum:test',driveId:'abcdefghijkl',url:'https://lh3.googleusercontent.com/d/abcdefghijkl'}],suppressedDriveIds:['abcdefghijkl']},[{id:'private',visibility:'privat',drive_url:'https://drive.google.com/drive/folders/abcdefghijkl'}],{folders:{abcdefghijkl:[{id:'abcdefghijkl',type:'foto'}]}});
assert(archiveTest.length===1&&archiveTest[0].media.length===0,'Private or suppressed photo excluded');
assert(normalizeBankMedia({id:'video-test',media_type:'video',external_url:'https://drive.google.com/file/d/abcdefghijkl/view'}).url.endsWith('/public-video/abcdefghijkl'),'Native video proxy');
console.log('PASS: shared gallery privacy and video normalization');
