import {mountGallery} from './gallery.js';
import {attachApproval,attachPayoutManager} from './bank-approval.js';
import {simulateBankOperation,attachSaleForm,attachPayoutForm} from './bank-operations.js';
/* Bank Sampah native SPA module — read-only migration preview.
   No global handlers, no DOM outside the route outlet, no write API calls. */
export const bankRoutes={
 'bank-home':['public','warga','admin','superadmin'],
 'bank-history':['warga','admin','superadmin'],
 'bank-report':['warga','admin','superadmin'],
 'bank-payout':['warga','admin','superadmin'],
 'bank-deposit':['admin','superadmin'],
 'bank-sale':['admin','superadmin'],
 'bank-savings':['warga','admin','superadmin'],
 'bank-cash':['admin','superadmin'],
 'bank-prices':['public','warga','admin','superadmin'],
 'bank-docs':['public','warga','admin','superadmin']
};
const count=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?new Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format(Number(v)):'—';
const rp=v=>count(v)==='—'?'—':'Rp '+count(v);
const kg=v=>count(v)==='—'?'—':count(v)+' kg';
const fromGrams=v=>v==null||v===''?null:Number(v)/1000;
const array=x=>Array.isArray(x)?x:Array.isArray(x?.rows)?x.rows:Array.isArray(x?.items)?x.items:Array.isArray(x?.data)?x.data:Array.isArray(x?.data?.rows)?x.data.rows:Array.isArray(x?.data?.items)?x.data.items:null;
function requiredRows(x){const r=array(x);if(!r)throw Error('Format daftar dari server belum lengkap.');return r}
const idOf=x=>String(x??'').replace(/^member:/i,'');
const rolesAdmin=r=>r==='admin'||r==='superadmin';
function today(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=Object.fromEntries(p.map(x=>[x.type,x.value]));return v.year+'-'+v.month+'-'+v.day;}
export function gramsFromKg(value){
 const n=Number(value),g=Math.round(n*1000);
 if(!Number.isFinite(n)||!Number.isSafeInteger(g)||g<=0||g>10000000||Math.abs(g/1000-n)>0.000001)throw Error('Berat wajib positif, maksimal 10.000 kg, ketelitian 0,001 kg.');
 return g;
}
export function validateDeposit({date,member,items,nonce},members,catalog){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||!nonce||!member||!items.length)throw Error('Tanggal, warga dan jenis barang wajib diisi.');
 const person=members.find(x=>idOf(x.id)===idOf(member)&&x.status==='aktif');
 if(!person)throw Error('Anggota aktif tidak ditemukan.');
 const used=new Set(),lines=items.map(x=>{
  const id=String(x.id||'');
  const item=catalog.find(a=>String(a.id)===id&&a.active!==false&&a.active!==0&&String(a.active)!=='0');
  if(!item||used.has(id))throw Error('Pilih jenis barang aktif yang berbeda pada setiap baris.');
  used.add(id);return {itemId:id.startsWith('waste:')?id:'waste:'+id,grams:gramsFromKg(x.kg)};
 });
 return {month:date.slice(0,7),requestKey:nonce,memberId:'member:'+idOf(member),depositedOn:date,items:lines};
}
export function createBankModule({get,role,go,el,panel,row,metric,links,previewRequest,socialWrite}){
 const admin=rolesAdmin(role),member=role==='warga',read=(p,s,priv=true)=>get(p,s,priv);
 const list=async(name,s)=>requiredRows(await read('/api/v2/admin/bank/'+name+'?limit=300',s));
 const savings=s=>read('/api/member/savings',s);
 const publicData=s=>read('/api/v2/public/bank',s,false);
 const report=s=>read('/api/v2/public/bank/report',s,false);
 function nav(root,items){const bar=el('div',null,'bank-route-links');for(const [label,key] of items){const b=el('button',label);b.type='button';b.onclick=()=>go(key);bar.append(b)}root.append(bar)}
 function title(name){const root=el('section');root.append(el('h1',name));return root}
 function empty(p,items){if(!items.length)row(p,'Belum ada data','')}
 function capped(p,items){if(items.length>=300)row(p,'Daftar dibatasi 300 baris','Bukan laporan lengkap. Gunakan portal asli untuk pemeriksaan.')}
 function privacy(root,items){const b=el('button','Tampilkan saldo','bank-privacy');b.type='button';let shown=false;for(const [n,v] of items)n.textContent='••••••';b.onclick=()=>{shown=!shown;b.textContent=shown?'Sembunyikan saldo':'Tampilkan saldo';for(const [n,v] of items)n.textContent=shown?v:'••••••'};root.append(b)}
 function balance(root,values){const grid=el('div',null,'metrics');const nodes=[];for(const [label,value] of values){const card=el('div',null,'metric'),strong=el('strong','••••••');card.append(el('small',label),strong);grid.append(card);nodes.push([strong,value]);}root.append(grid);privacy(root,nodes)}
 function checkStatement(d){if(d.riwayatLengkap===false)throw Error('Riwayat tabungan tidak lengkap; laporan ditahan.');if(!Array.isArray(d.setoran)||!Array.isArray(d.mutasi))throw Error('Riwayat tabungan belum lengkap.');return d;}
 function sorted(items,field){return items.slice().sort((a,b)=>String(b[field]||'').localeCompare(String(a[field]||'')))}
 function historyRows(root,items,admin){const p=panel(root,'Riwayat setoran');for(const x of sorted(items,admin?'deposited_on':'tanggal')){const date=admin?x.deposited_on:x.tanggal;const weight=x.status==='terkonfirmasi'?(admin?x.beratSahGram:x.beratSahGram):(admin?x.total_grams:x.beratGram);const label=admin?[x.memberName||'Nama warga belum tersedia',x.houseCode||x.house_code||x.rumah].filter(Boolean).join(' · '):date||'Setoran';row(p,label,[admin?date:'',kg(fromGrams(weight)),x.status||'Status belum tersedia',x.status==='terkonfirmasi'?rp(x.nilaiSahRp):rp(admin?x.estimated_total_rp:x.estimasiRp)].filter(Boolean).join(' · '));}empty(p,items);if(admin)capped(p,items)}
 async function home(s){
  const root=title('Bank Sampah'),d=await publicData(s),o=d.overview||{},p=panel(root,'Ringkasan setoran'),m=el('div',null,'metrics');p.append(m);
  metric(m,'Anggota aktif',count(o.activeMembers??o.memberCount??o.members??d.membersCount));metric(m,'Berat tercatat',kg(o.recordedWeightKg));metric(m,'Setoran tercatat',count(o.recordedDeposits));metric(m,'Jenis barang',count(o.activeItems??d.catalog?.length));
  if(member){
   const st=await savings(s);const confirmed=Number(st.saldoTersediaRp);
   const pending=Array.isArray(st.setoran)&&st.riwayatLengkap!==false?st.setoran.filter(x=>!['terkonfirmasi','dibatalkan'].includes(x.status)).map(x=>x.estimasiRp):null;
   const estimate=pending&&pending.every(x=>x!=null&&Number.isSafeInteger(Number(x)))?pending.reduce((a,b)=>a+Number(b),0):null;
   const validConfirmed=st.saldoTersediaRp!=null&&Number.isSafeInteger(confirmed)&&confirmed>=0;
   balance(root,[['Total saldo belum dicairkan',validConfirmed&&estimate!==null?rp(confirmed+estimate):'—'],['Saldo bisa dicairkan',validConfirmed?rp(confirmed):'—'],['Saldo menunggu penjualan',rp(estimate)]]);
   nav(root,[['Tabungan','bank-savings'],['Pencairan','bank-payout'],['Riwayat','bank-history'],['Laporan','bank-report'],['Harga Barang','bank-prices']]);
  }else if(admin)nav(root,[['Catat setoran','bank-deposit'],['Penjualan','bank-sale'],['Riwayat','bank-history'],['Saldo warga','bank-savings'],['Debit/Kredit','bank-cash'],['Pencairan','bank-payout'],['Laporan','bank-report'],['Harga Barang','bank-prices']]);
  else nav(root,[['Harga Barang','bank-prices']]);
  nav(root,[['Dokumentasi','bank-docs']]);
  const q=panel(root,'Tahap Bank Sampah');for(const x of (array(d.progress)||[]))row(q,x.title||x.judul||x.stage||'Tahap',x.status);empty(q,array(d.progress)||[]);return root;
 }
 async function history(s){const root=title('Riwayat');if(member){const d=checkStatement(await savings(s));historyRows(root,d.setoran,false);const p=panel(root,'Mutasi tabungan');for(const x of sorted(d.mutasi,'tanggal'))row(p,x.tanggal||'Mutasi',[x.jenis,rp(x.jumlahRp),x.keterangan].filter(Boolean).join(' · '));empty(p,d.mutasi)}else historyRows(root,await list('deposits',s),true);return root}
 async function balances(s){const root=title('Tabungan');if(member){const d=await savings(s);balance(root,[['Saldo bisa dicairkan',rp(d.saldoTersediaRp)],['Total dicairkan',rp(d.totalCairRp)]]);nav(root,[['Riwayat','bank-history'],['Pencairan','bank-payout']]);}else{const [people,values]=await Promise.all([list('members',s),list('savings',s)]),p=panel(root,'Saldo warga');const map=new Map(values.map(x=>[idOf(x.member_id),x.balanceRp]));for(const x of people)row(p,[x.nama||'Nama belum tersedia',x.rumah].filter(Boolean).join(' · '),rp(map.get(idOf(x.id))));empty(p,people);capped(p,people);capped(p,values)}return root}
 async function reports(s){const root=title(member?'Laporan tabungan':'Laporan Bank Sampah');if(member){const d=checkStatement(await savings(s));balance(root,[['Saldo tersedia',rp(d.saldoTersediaRp)],['Total dicairkan',rp(d.totalCairRp)]]);historyRows(root,d.setoran,false);links(root,[['Cetak laporan lengkap di portal asli','/bank-sampah/?halaman=bank-report']]);return root}
  const d=await report(s),sum=d.summary||d.ringkasan||{},sale=d.sales||{},p=panel(root,'Ringkasan laporan sah'),m=el('div',null,'metrics');p.append(m);
  if(!('sales'in d||'summary'in d||'ringkasan'in d))throw Error('Ringkasan laporan belum lengkap.');
  metric(m,'Berat sah',kg(sum.beratKg??sum.confirmedKg??d.confirmedKg));metric(m,'Hasil penjualan',rp(sum.hasilPenjualan??sale.diterimaRp));metric(m,'Hak warga',rp(sum.hakWarga??sale.savingsRp));metric(m,'Belum terjual',kg(sum.pendingWeightKg));
  const q=panel(root,'Per bulan'),items=array(d.bulanan||d.monthly||d.periods)||[];for(const x of items)row(q,x.periode||x.month||x.period||'Periode',[kg(x.beratKg??x.confirmedKg),rp(x.hasilPenjualan??x.salesRp)].join(' · '));empty(q,items);links(root,[['Laporan pengelola lengkap','/bank-sampah/?halaman=laporan']]);return root;
 }
 async function payout(s){const root=title(member?'Pengajuan pencairan':'Pencairan tabungan'),d=await read(member?'/api/member/bank/payout-requests':'/api/admin/bank/payout-requests',s),items=requiredRows(d);let canLeave;if(member){const st=await savings(s);balance(root,[['Saldo bisa dicairkan',rp(st.saldoTersediaRp)]]);const active=items.filter(x=>['diajukan','disetujui'].includes(x.status));const reserved=active.every(x=>Number.isSafeInteger(x.amount_rp)&&x.amount_rp>0)?active.reduce((n,x)=>n+x.amount_rp,0):null;const available=reserved!==null&&Number.isSafeInteger(st.saldoTersediaRp)&&items.length<100?Math.max(0,st.saldoTersediaRp-reserved):null;canLeave=attachPayoutForm(root,{role,el,panel,balance:available,signal:s});}else{canLeave=attachPayoutManager(root,{role,el,panel,row,items,today,signal:s});}const p=panel(root,'Riwayat pengajuan');for(const x of items)row(p,member?rp(x.amount_rp):[x.nama||'Nama belum tersedia',x.rumah,rp(x.amount_rp)].filter(Boolean).join(' · '),[String(x.requested_at||'').slice(0,10),x.status,x.note].filter(Boolean).join(' · '));empty(p,items);links(root,[[member?'Ajukan pencairan':'Kelola pencairan',member?'/bank-sampah/?halaman=bank-payout':'/bank-sampah/?halaman=bank-payout-admin']]);return {node:root,canLeave}}
 async function sale(s){const root=title('Penjualan'),[items,batches,catalog]=await Promise.all([list('sales',s),list('batches',s),list('catalog',s)]),canLeaveSale=attachSaleForm(root,{role,el,panel,batches,catalog,today,signal:s}),canLeaveApproval=attachApproval(root,{role,el,panel,row,sales:items,previewRequest,signal:s}),p=panel(root,'Riwayat penjualan');for(const x of sorted(items,'sold_on'))row(p,[x.buyer_name||'Lapak',x.sold_on].filter(Boolean).join(' · '),[rp(x.amount_received_rp),x.status].filter(Boolean).join(' · '));empty(p,items);capped(p,items);links(root,[['Catat penjualan dan sahkan di portal asli','/bank-sampah/?halaman=penjualan']]);return {node:root,canLeave:()=>canLeaveSale()&&canLeaveApproval()}}
 async function cash(s){const root=title('Debit/Kredit'),items=await list('cash',s),p=panel(root,'Riwayat kas');for(const x of sorted(items,'occurred_on'))row(p,[x.occurred_on,x.fund_position,x.note].filter(Boolean).join(' · '),['Masuk '+rp(x.cash_in_rp),'Keluar '+rp(x.cash_out_rp),x.status].join(' · '));empty(p,items);capped(p,items);links(root,[['Kelola kas di portal asli','/bank-sampah/?halaman=bank-admin-cash']]);return root}
 async function prices(s){const root=title('Harga Barang'),d=await publicData(s),p=panel(root,'Daftar harga'),items=requiredRows(d.catalog);for(const x of items)row(p,x.name||'Jenis barang',[(/duplex|dupleks/i.test(x.name||'')?'Kertas':x.category),x.priceRpPerKg==null?'Tarif belum tersedia':rp(x.priceRpPerKg)+'/kg'].filter(Boolean).join(' · '));empty(p,items);return root}
 async function deposit(s){
  const root=title('Catat setoran'),[members,catalog]=await Promise.all([list('members',s),list('catalog',s)]);
  const p=panel(root,'Uji formulir setoran'),form=el('form',null,'bank-draft'),date=el('input'),select=el('select'),items=el('div'),result=el('p');
  date.type='date';date.required=true;date.value=today();
  const field=(name,node)=>{const label=el('label',name);node.setAttribute('aria-label',name);label.append(node);return label};
  const opt=(value,label)=>{const o=el('option',label);o.value=value;return o};
  select.required=true;select.append(opt('','Pilih warga'));
  for(const x of members.filter(x=>x.status==='aktif'))select.append(opt(String(x.id),[x.nama,x.rumah].filter(Boolean).join(' · ')));
  function addLine(){const r=el('div',null,'bank-draft-line'),type=el('select'),weight=el('input'),remove=el('button','Hapus');type.required=true;type.append(opt('','Jenis barang'));for(const x of catalog.filter(x=>x.active!==false&&x.active!==0&&String(x.active)!=='0'))type.append(opt(String(x.id),x.name||x.nama||'Jenis barang'));weight.type='number';weight.min='0.001';weight.max='10000';weight.step='0.001';weight.required=true;weight.placeholder='kg';weight.setAttribute('aria-label','Berat (kg)');type.setAttribute('aria-label','Jenis barang');remove.type='button';remove.onclick=()=>{if(items.children.length>1){r.remove();changed()}};r.append(type,weight,remove);items.append(r)}
  const add=el('button','Tambah jenis');add.type='button';add.onclick=addLine;const check=el('button','Periksa hasil timbang');check.type='submit';
  let dirty=false,busy=false,revision=0;
  const changed=()=>{dirty=true;revision++;result.textContent=''};
  form.addEventListener('input',changed);add.onclick=()=>{addLine();changed()};
  form.addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;check.disabled=true;const rev=revision;try{const nonce=crypto.randomUUID(),payload=validateDeposit({date:date.value,member:select.value,items:[...items.children].map(r=>({id:r.children[0].value,kg:r.children[1].value})),nonce},members,catalog);
   const requests=await simulateBankOperation({role,kind:'deposit',payload:{tanggal:payload.depositedOn,wargaId:payload.memberId,nonce:payload.requestKey,items:payload.items.map(x=>({kode:x.itemId,berat:x.grams/1000}))}});
   if(s.aborted||revision!==rev)return;
   const lines=requests[1].body.items;result.textContent='Hasil timbang '+kg(lines.reduce((n,x)=>n+x.grams,0)/1000)+' · '+lines.length+' jenis. Simulasi kontrak transaksi berhasil. Tidak ada transaksi dikirim.';dirty=false;
  }catch(error){if(!s.aborted&&revision===rev)result.textContent=error.message;}finally{busy=false;check.disabled=false}});
  form.append(field('Nama warga',select),field('Tanggal setoran',date),items,add,check,result);p.append(form);addLine();
  row(root,'Mode uji','Form ini hanya memeriksa hasil timbang, tidak menyimpan ke database.');links(root,[['Simpan setoran melalui portal asli','/bank-sampah/?halaman=setoran']]);return {node:root,canLeave:()=>!busy&&(!dirty||window.confirm('Draf uji belum diperiksa. Tinggalkan halaman?'))};
 }
 const views={'bank-home':home,'bank-history':history,'bank-report':reports,'bank-payout':payout,'bank-deposit':deposit,'bank-sale':sale,'bank-savings':balances,'bank-cash':cash,'bank-prices':prices,'bank-docs':async s=>mountGallery({root:title('Dokumentasi Bank Sampah'),role,get,socialWrite,el,signal:s,bank:true,bankData:await publicData(s)})};
 return {async mount({key,signal}){if(!bankRoutes[key]?.includes(role))throw Error('Akses tidak diizinkan.');const view=await views[key](signal);return view?.node?view:{node:view}}};
}
