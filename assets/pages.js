import {CONFIG,apiURL,sameSiteAuthAvailable} from './config.js';
import {initPortalExtras,renderMeetingArchive} from './portal-extras.js';
import {renderPortalCalendar,renderPortalInventory,renderBankProgress,renderBankAlbumPreviews} from './portal-widgets.js';
import {api,endpoints} from './api.js';
import {$,fmtRp,fmtNum,elem,put,boxStatus,setRows,setCards,initShell,url,renderAlbum,requireAuthMessage,updateHeader,setModuleView} from './ui.js';
const page=document.body.dataset.page;
initShell(page);
document.querySelectorAll('[data-go]').forEach(a=>a.href=url(a.dataset.go));
function failure(e){boxStatus(e?.message||'Gagal memuat data.','error')}
function date(d){return String(d||'—').slice(0,10)}


function renderPortalSlider(apiBanners){
 const container=document.querySelector('.app-body .hero');if(!container)return;
 const input=Array.isArray(apiBanners)?apiBanners:[];
 const slides=input.length?input.map(b=>({
  title:String(b.title||'Informasi Flamboyan 4'),text:String(b.description||b.subtitle||''),
  image:b.imageUrl||b.image_url||b.photoUrl||'',link:b.linkUrl||b.url||''
 })):[
  {title:'Transparansi & Kebersamaan',text:'Informasi kegiatan dan pembangunan warga Flamboyan 4.'},
  {title:'Bank Sampah Flamboyan 4',text:'Kelola lingkungan bersama dan ikuti perkembangan kegiatan.'},
  {title:'Informasi & Dokumentasi',text:'Agenda, proyek, hasil rapat, dan inventaris warga dalam satu portal.'}
 ];
 let active=0,timer=null,touchStart=0;
 container.replaceChildren();container.classList.add('has-banner-slider');
 const frame=elem('div',undefined,'banner-frame'),track=elem('div',undefined,'banner-track');
 const dots=elem('div',undefined,'banner-dots');
 const dotButtons=[];
 slides.forEach((s,i)=>{
  const slide=elem('article',undefined,'banner-slide');slide.setAttribute('aria-label','Banner '+(i+1));
  let image='';
  try{const url=new URL(s.image);if(url.protocol==='https:')image=url.href}catch{}
  if(image){const pic=document.createElement('img');pic.src=image;pic.alt='';pic.loading=i===0?'eager':'lazy';pic.className='banner-image';slide.append(pic)}
  const words=elem('div',undefined,'banner-copy');words.append(elem('span','PORTAL WARGA FLAMBOYAN 4','banner-eyebrow'));
  words.append(elem('h1',s.title));if(s.text)words.append(elem('p',s.text));
  if(s.link){try{const dest=new URL(s.link,location.origin);if(['https:','http:'].includes(dest.protocol)){const a=elem('a','Lihat informasi →','banner-link');a.href=dest.href;words.append(a)}}catch{}}
  slide.append(words);track.append(slide);
  const b=elem('button',undefined,'banner-dot');b.type='button';b.setAttribute('aria-label','Tampilkan banner '+(i+1));b.onclick=()=>{move(i);reset()};dotButtons.push(b);dots.append(b);
 });
 function move(index){active=(index+slides.length)%slides.length;track.style.transform='translateX(-'+(100*active)+'%)';dotButtons.forEach((b,i)=>b.setAttribute('aria-current',i===active?'true':'false'))}
 function reset(){if(timer)clearInterval(timer);if(slides.length>1&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>{if(!document.hidden)move(active+1)},6000)}
 const prev=elem('button','‹','banner-arrow prev'),next=elem('button','›','banner-arrow next');prev.type=next.type='button';
 prev.setAttribute('aria-label','Banner sebelumnya');next.setAttribute('aria-label','Banner berikutnya');
 prev.onclick=()=>{move(active-1);reset()};next.onclick=()=>{move(active+1);reset()};
 if(slides.length<2){prev.hidden=true;next.hidden=true;dots.hidden=true}
 frame.append(track,prev,next,dots);container.append(frame);move(0);reset();
 frame.addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].screenX},{passive:true});
 frame.addEventListener('touchend',e=>{const diff=e.changedTouches[0].screenX-touchStart;if(Math.abs(diff)>45){move(active+(diff<0?1:-1));reset()}},{passive:true});
}

async function portal(){
 try{
  const r=await endpoints.portal();
  renderPortalSlider(r.banners||r.slides||[]);
  put('count-agenda',r.agenda?.length||0);put('count-projects',r.projects?.length||0);put('count-inventory',r.inventory?.length||0);put('count-meetings',r.meetings?.length||0);
  renderPortalCalendar(r.agenda||[]);
  setCards('projects',(r.projects||[]).slice(0,3).map(x=>({title:x.title,text:x.description,url:x.target_url})));
  renderPortalInventory(r.inventory||[]);
  boxStatus('Data portal publik berhasil dimuat dari D1.','success');
 }catch(e){renderPortalSlider([]);failure(e)}
}

async function bankReport(month=''){
 const r=await endpoints.bankReport(month);put('bank-cash-in',fmtRp(r.cash?.masukRp));put('bank-cash-out',fmtRp(r.cash?.keluarRp));
 setCards('cash-detail',[{title:'Periode laporan',text:month||'Keseluruhan'},{title:'Penjualan terkonfirmasi',text:fmtRp(r.sales?.diterimaRp)},{title:'Pengeluaran lunas',text:fmtRp(r.expenses?.pengeluaranRp)}]);
}

async function memberBankPanel(session){
 const area=$('bank-member-section');if(!area)return;
 area.hidden=false;area.replaceChildren();
 const who=session.member?.nama||'Warga',home=session.member?.rumah||'Belum tertaut';
 const summary=elem('div',undefined,'member-overview');summary.id='bank-member-overview';
 summary.append(elem('h2','Halo, '+who,'bank-member-head'));
 summary.append(elem('p','Ringkasan tabungan dan setoran atas nama akun ini.','muted'));
 const grid=elem('div',undefined,'bank-member-grid');
 const stats=[['Nama anggota',who],['Nomor rumah',home],['Saldo terkonfirmasi','Memuat…'],['Estimasi menunggu','Memuat…']];
 stats.forEach(([label,value])=>{
  const card=elem('article',undefined,'stat');card.append(elem('small',label));card.append(elem('strong',value));grid.append(card);
 });
 summary.append(grid);area.append(summary);
 const panel=elem('section',undefined,'panel');panel.id='bank-member-savings';
 panel.append(elem('h3','Tabungan Saya'));
 const subtitle=elem('p','Hanya setoran yang terkonfirmasi masuk saldo.','muted');panel.append(subtitle);
 const table=elem('div',undefined,'data-wrap');table.id='bank-my-savings';panel.append(table);area.append(panel);
 try{
  const res=await endpoints.savings();
  grid.children[2].querySelector('strong').textContent=fmtRp(res.saldoTersediaRp);
  grid.children[3].querySelector('strong').textContent=fmtRp(res.estimasiMenungguRp);
  setRows('bank-my-savings',['Tanggal','Berat','Estimasi','Status'],(res.setoran||[]).map(v=>[date(v.tanggal),fmtNum(Number(v.beratGram)/1000)+' kg',fmtRp(v.estimasiRp),v.status||'—']));
 }catch(e){
  grid.children[2].querySelector('strong').textContent='—';grid.children[3].querySelector('strong').textContent='—';
  subtitle.textContent='Data tabungan belum bisa dimuat: '+(e.message||'API error');
 }
 setModuleView(document.body.dataset.activeView||'summary','anggota');
}

async function bank(){
 try{
  const [r]=await Promise.all([endpoints.bank(),bankReport()]);
  const pub=$('bank-public-inventory-table');
  if(pub&&Array.isArray(r.inventory))setRows('bank-public-inventory-table',['Nama barang','Jumlah'],r.inventory.map(x=>[x.name||'—',fmtNum(x.quantity)+' '+(x.unit||'')]));
    put('count-catalog',r.overview?.activeItems??r.catalog?.length??0);put('count-confirmed',r.overview?.confirmedDeposits??0);
  setRows('catalog',['Jenis Sampah','Kelompok','Tarif per Kg'],(r.catalog||[]).map(x=>[x.name,x.category||'—',x.priceRpPerKg==null?'Belum ada tarif':fmtRp(x.priceRpPerKg)]));
  setCards('progress',(r.progress||[]).map(x=>({title:x.title,note:date(x.happened_on)+' · '+(x.stage||''),text:x.description||x.next_step||''})));
  const albums=$('albums');albums.replaceChildren();
  if(!r.albums?.length)albums.append(elem('p','Belum ada album dokumentasi publik.','muted'));
  for(const a of r.albums||[]){const card=elem('article',undefined,'info-card');card.append(elem('h3',a.title));card.append(elem('p',`${date(a.event_on)} · ${a.mediaCount??0} media`,'muted'));const btn=elem('button','Lihat galeri','btn outline');btn.type='button';btn.addEventListener('click',async()=>{btn.disabled=true;try{const d=await endpoints.bankAlbum(a.id);$('album-detail').hidden=false;renderAlbum($('album-detail'),d.album,d.media);$('album-detail').scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){failure(e)}finally{btn.disabled=false}});card.append(btn);albums.append(card)}
  boxStatus('Data publik Bank Sampah berhasil dimuat dari D1.','success');
 }catch(e){failure(e)}
 const form=$('bank-period-form');form.addEventListener('submit',async(ev)=>{ev.preventDefault();try{await bankReport($('bank-month').value);boxStatus('Laporan periode berhasil dimuat.','success')}catch(e){failure(e)}});
 if(!sameSiteAuthAvailable()){$('admin-hint').textContent=requireAuthMessage();return}
 try{
  const s=await endpoints.session();if(!['admin','superadmin'].includes(s.account?.role)){await memberBankPanel(s);return}
  $('bank-admin-section').hidden=false;$('bank-admin').hidden=false;$('admin-hint').textContent='Data administrasi dalam mode baca-saja. Tombol transaksi tetap dinonaktifkan di staging.';
  const views={
   deposits:{label:'Setoran',heads:['Tanggal','Warga','Batch','Berat','Estimasi','Status'],
    row:x=>[date(x.deposited_on),x.memberName||'—',x.batch_id||'—',fmtNum(Number(x.total_grams)/1000)+' kg',fmtRp(x.estimated_total_rp),x.status||'—'],detail:'deposit-detail'},
   sales:{label:'Penjualan',heads:['Tanggal','Pembeli','Batch','Diterima','Status'],
    row:x=>[date(x.sold_on),x.buyer_name||'—',x.batch_id||'—',fmtRp(x.amount_received_rp),x.status||'—'],detail:'sale-detail'},
   batches:{label:'Batch',heads:['ID','Nama batch','Status','Setoran','Berat','Estimasi'],
    row:x=>[x.id,x.label||'—',x.status||'—',fmtNum(x.deposits),fmtNum(Number(x.grams)/1000)+' kg',fmtRp(x.estimatedRp)]},
   savings:{label:'Tabungan warga',heads:['Warga','Blok/Rumah','Saldo'],
    row:x=>[x.memberName||'—',x.houseCode||'—',fmtRp(x.balanceRp)]},
   cash:{label:'Kas',heads:['Tanggal','Jenis','Pos','Masuk','Keluar','Status'],
    row:x=>[date(x.occurred_on),x.transaction_type||'—',x.fund_position||'—',fmtRp(x.cash_in_rp),fmtRp(x.cash_out_rp),x.status||'—']},
   expenses:{label:'Pengeluaran',heads:['Tanggal','Jenis','Keterangan','Nominal','Status'],
    row:x=>[date(x.incurred_on),x.kind||'—',x.description||x.budget_post||'—',fmtRp(x.amount_rp),x.status||'—']},
   catalog:{label:'Katalog & tarif',heads:['Nama','Kategori','Satuan','Tarif / kg','Aktif'],
    row:x=>[x.name,x.category||'—',x.unit||'—',x.priceRpPerKg==null?'Belum ditetapkan':fmtRp(x.priceRpPerKg),Number(x.active)===1?'Ya':'Tidak']},
   members:{label:'Daftar warga',heads:['Nama','Rumah','Status'],row:x=>[x.nama||'—',x.rumah||'—',x.status||'—']},
   albums:{label:'Album',heads:['Tanggal','Judul','Kategori','Akses','Status'],
    row:x=>[date(x.event_on),x.title||'—',x.category||'—',x.visibility||'—',x.status||'—']},
   progress:{label:'Perkembangan',heads:['Tanggal','Judul','Tahap','Status','Publik'],
    row:x=>[date(x.happened_on),x.title||'—',x.stage||'—',x.status||'—',Number(x.public_visible)===1?'Ya':'Tidak']},
   inventory:{label:'Inventaris',heads:['Barang','Jumlah','Lokasi','Kondisi','Aktif'],
    row:x=>[x.name,fmtNum(x.quantity)+' '+(x.unit||''),x.location||'—',x.condition||'—',Number(x.active)===1?'Ya':'Tidak']}
  };
  const nav=$('bank-admin-nav'),details=$('bank-detail');
  async function loadAdmin(key){
   const view=views[key];if(!view)return;
   nav.querySelectorAll('button').forEach(b=>{const active=b.dataset.kind===key;b.className='btn'+(active?'':' outline');b.setAttribute('aria-pressed',active?'true':'false')});
   details.hidden=true;
   const caption=$('bank-admin-caption');caption.textContent='Memuat '+view.label+' dari Cloudflare D1…';
   try{
    const result=await endpoints.bankAdmin(key);
    const rows=result.data||[];
    setRows('admin-table',view.heads.concat(view.detail?['Rincian']:[]),rows.map(view.row));
    if(view.detail&&rows.length){
     const tbody=$('admin-table').querySelector('tbody');
     rows.forEach((x,i)=>{
      const tr=tbody?.rows?.[i];if(!tr)return;
      const td=elem('td'),btn=elem('button','Rincian','btn outline');btn.type='button';
      btn.setAttribute('aria-label','Lihat rincian '+(x.memberName||x.buyer_name||x.id));
      btn.onclick=async()=>{
       btn.disabled=true;details.hidden=false;
       const panel=$('bank-detail-table');panel.replaceChildren(elem('p','Memuat rincian…','muted'));
       try{
        const d=await api('/api/v2/admin/bank/'+view.detail+'?id='+encodeURIComponent(x.id));
        const lines=d.lines||[];
        const lineHeads=key==='deposits'?['Jenis sampah','Berat','Tarif / kg','Estimasi']:['Jenis sampah','Berat','Tarif / kg','Total'];
        setRows('bank-detail-table',lineHeads,lines.map(l=>[l.name||'—',fmtNum(Number(l.grams)/1000)+' kg',fmtRp(l.priceRpPerKg),fmtRp(key==='deposits'?l.estimated_rp:l.total_rp)]));
        details.scrollIntoView({block:'nearest',behavior:'smooth'});
       }catch(e){panel.textContent='Rincian gagal dimuat: '+(e.message||'Error')}finally{btn.disabled=false}
      };
      td.append(btn);tr.append(td);
     });
    }
    caption.textContent=view.label+' · '+rows.length+' data (maksimum '+String(result.limit||300)+') · baca saja';
   }catch(e){caption.textContent='Gagal memuat '+view.label+': '+(e.message||'Error');$('admin-table').replaceChildren();}
  }

  const adminGroups={
   record:[
    {id:'deposit-entry',label:'Input setoran',notice:'Form Input setoran warga dari aplikasi asli belum tersambung ke API tulis Cloudflare. Catatan setoran tidak dibuat di mode staging ini.'},
    {id:'deposit-history',label:'Riwayat setoran',data:'deposits'},
    {id:'sale-entry',label:'Penjualan lapak',notice:'Form penjualan lapak belum dipindahkan. Pencatatan penjualan tetap nonaktif hingga validasi batch dan nominal selesai.'},
    {id:'sale-history',label:'Riwayat penjualan',data:'sales'}
   ],
   finance:[
    {id:'difference',label:'Pratinjau selisih',notice:'Pratinjau rekonsiliasi per batch belum dipindahkan. Tidak ada pembagian hasil, perubahan saldo, atau pengesahan.'},
    {id:'approval',label:'Pengesahan hasil',notice:'Pengesahan hasil dan jurnal tabungan belum diaktifkan. Langkah ini harus mengikuti aturan transaksi dari aplikasi asli.'},
    {id:'withdrawal',label:'Saldo & pencairan',data:'savings',hint:'Ini hanya daftar saldo warga dari D1. Fungsi pencairan belum tersedia.'},
    {id:'expenses',label:'Pembelian & pengeluaran',data:'expenses'},
    {id:'cash-report',label:'Laporan admin',data:'cash',hint:'Catatan kas operasional; bukan laporan rekonsiliasi atau laporan cetak lengkap.'}
   ],
   activities:[
    {id:'progress-entry',label:'Input perkembangan',notice:'Form input perkembangan dari aplikasi asli belum dihubungkan ke API tulis.'},
    {id:'album-list',label:'Dokumentasi',data:'albums'},
    {id:'inventory-list',label:'Inventaris',data:'inventory'},
    {id:'public-progress',label:'Progres publik',data:'progress'}
   ],
   members:[
    {id:'item-master',label:'Master barang',data:'catalog',hint:'Data tarif ini bersifat baca-saja; pengaturan Tarif Warga Aktif belum dipindahkan.'},
    {id:'citizen-accounts',label:'Akun warga',data:'members',hint:'Daftar warga baca-saja. Perubahan akun masih nonaktif.'}
   ]
  };
  function showAdminGroup(group){
   const tabs=adminGroups[group];if(!tabs)return;
   nav.replaceChildren();
   let selected=null;
   function selectTab(item,btn){
    selected=item.id;
    nav.querySelectorAll('button').forEach(b=>{
     const active=b===btn;b.className='btn'+(active?'':' outline');b.setAttribute('aria-pressed',String(active));
    });
    details.hidden=true;
    $('admin-table').replaceChildren();
    if(item.data){
     loadAdmin(item.data).then(()=>{
      if(item.hint&&selected===item.id)$('bank-admin-caption').textContent+=' · '+item.hint;
     });
    }else{
     $('bank-admin-caption').textContent=item.notice;
     $('admin-table').append(elem('p','Fitur ini menunggu migrasi fungsi asli. Belum ada perubahan data.','info-note'));
    }
   }
   tabs.forEach((item,i)=>{
    const b=elem('button',item.label,'btn outline');
    b.type='button';b.dataset.kind=item.data||item.id;
    b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>selectTab(item,b));nav.append(b);
    if(i===0)selectTab(item,b);
   });
  }
  nav.addEventListener('bank-group-select',e=>showAdminGroup(e.detail.group));
  setModuleView(document.body.dataset.activeView||'summary','admin');

 }catch(e){if(e.status!==401)failure(e)}
}

async function book(){
 if(!sameSiteAuthAvailable()){$('book-locked').hidden=false;put('book-locked-text',requireAuthMessage());boxStatus('Ringkasan keuangan tidak dibuka karena login lintas domain belum aktif.','info');return}
 let session;
 try{session=await endpoints.session()}
 catch(e){
   $('book-locked').hidden=false;
   put('book-locked-text','Silakan masuk menggunakan akun superadmin untuk membuka Pembukuan.');
   boxStatus('Akses Pembukuan membutuhkan login superadmin.','info');
   return;
 }
 if(session.account?.role!=='superadmin'){
   $('book-locked').hidden=false;
   put('book-locked-text','Akun ini tidak memiliki izin Pembukuan. Menu tersebut hanya tersedia untuk superadmin.');
   const action=$('book-login-action');
   if(action){action.textContent='Kembali ke Portal Utama →';action.href=url('')}
   boxStatus('Akses dibatasi berdasarkan peran akun.','info');
   return;
 }
 $('book-content').hidden=false;
 setModuleView(document.body.dataset.activeView||'summary','superadmin');
 boxStatus('Akses superadmin terverifikasi oleh Worker D1.','success');
 async function loadOverview(month=''){
  const v=await endpoints.bookkeepingOverview(month);put('book-debit',fmtRp(v.cash?.debitRp));put('book-credit',fmtRp(v.cash?.creditRp));put('book-payments',fmtRp(v.payments?.totalRp));put('book-fines',fmtRp(Math.max(0,Number(v.fines?.chargedRp||0)-Number(v.fines?.paidRp||0))));
  put('book-loans',`${fmtNum(v.loans?.count||0)} pinjaman · Total ${fmtRp(v.loans?.loanRp)}`);put('book-advances',`${fmtNum(v.advances?.count||0)} talangan · Total ${fmtRp(v.advances?.advanceRp)} · Dikembalikan ${fmtRp(v.advances?.reimbursedRp)}`);
 }
 const form=$('book-period-form');
 form.addEventListener('submit',async(ev)=>{ev.preventDefault();try{await loadOverview($('book-month').value);boxStatus('Ringkasan pembukuan diperbarui.','success')}catch(e){failure(e)}});
 const ledgerViews={
  batch:{label:'Riwayat Batch Kas',path:null},
  iuran:{label:'Iuran',path:'/api/bookkeeping/iuran/history?limit=200',
   heads:['Tanggal','Warga','Periode','Diterima','Metode','Status'],
   row:x=>[date(x.tanggal),x.nama||'—',(x.periode||[]).join(', ')||'—',fmtRp(x.totalDiterima),x.metode||'—',x.status||'—']},
  denda:{label:'Denda',path:'/api/bookkeeping/denda?limit=200',
   heads:['Tanggal','Warga','Jenis','Tagihan','Dibayar','Sisa','Status'],
   row:x=>[date(x.tanggal),x.nama||'—',x.jenis||'—',fmtRp(x.nominalRp),fmtRp(x.terbayarRp),fmtRp(x.sisaRp),x.status||'—']},
  pinjaman:{label:'Pinjaman',path:'/api/bookkeeping/pinjaman?limit=200',
   heads:['Tanggal','Warga','Pokok','Angsuran','Sisa','Status'],
   row:x=>[date(x.tanggal),x.nama||'—',fmtRp(x.pokokRp),fmtRp(x.angsuranAktifRp),fmtRp(x.sisaRp),x.status||'—']},
  talangan:{label:'Talangan',path:'/api/bookkeeping/talangan?limit=200',
   heads:['ID','Pokok','Ringkasan kembali','Angsuran tercatat','Sisa','Status'],
   row:x=>[x.id,fmtRp(x.pokokRp),fmtRp(x.pelunasanRingkasanRp),fmtRp(x.angsuranTercatatRp),fmtRp(x.sisaMenurutRingkasanRp),x.status||'—']},
  kas:{label:'Kas',path:'/api/bookkeeping/cash?limit=300',
   heads:['Tanggal','Jenis','Kategori','Debit','Kredit','Status'],
   row:x=>[date(x.occurred_on),x.transaction_type||'—',x.category||'—',fmtRp(x.debit_rp),fmtRp(x.credit_rp),x.status||'—']}
 };
 const ledgerNav=$('book-ledger-nav'),ledgerCaption=$('book-ledger-caption');
 async function loadLedger(key){
  const view=ledgerViews[key];if(!view)return;
  ledgerNav.querySelectorAll('button').forEach(b=>{const active=b.dataset.kind===key;b.className='btn'+(active?'':' outline');b.setAttribute('aria-pressed',active?'true':'false')});
  if(!view.path){$('book-ledger-table').replaceChildren();ledgerCaption.textContent='Riwayat Batch Kas belum dipindahkan dari aplikasi asli; tidak ada data yang ditampilkan.';return}
  ledgerCaption.textContent='Memuat '+view.label+' dari D1…';
  try{
   const result=await api(view.path);const rows=result.data||result.transaksi||[];
   setRows('book-ledger-table',view.heads,rows.map(view.row));
   ledgerCaption.textContent=view.label+' · '+rows.length+' data · hanya baca. Tidak otomatis menjadi saldo akhir.';
  }catch(e){ledgerCaption.textContent='Gagal memuat '+view.label+': '+(e.message||'Error');$('book-ledger-table').replaceChildren()}
 }

 const historyLabels=[
  ['iuran','Riwayat Iuran'],['kas','Riwayat Kas'],['batch','Riwayat Batch Kas'],
  ['talangan','Riwayat Talangan'],['denda','Riwayat Denda'],['pinjaman','Riwayat Pinjaman']
 ];
 historyLabels.forEach(([key,label])=>{
  const b=elem('button',label,'btn outline');b.type='button';b.dataset.kind=key;
  b.setAttribute('aria-pressed','false');b.onclick=()=>loadLedger(key);ledgerNav.append(b);
 });
 await loadLedger('iuran');
 function renderReadOnlyTabs(navId,contentId,tabs){
  const nav=$(navId),panel=$(contentId);if(!nav||!panel)return;
  tabs.forEach(([label,note],i)=>{
   const button=elem('button',label,'btn outline');button.type='button';
   button.setAttribute('aria-pressed','false');
   const choose=()=>{
    nav.querySelectorAll('button').forEach(b=>{
     const active=b===button;b.className='btn'+(active?'':' outline');
     b.setAttribute('aria-pressed',String(active));
    });
    panel.replaceChildren();
    const h=elem('h3',label);panel.append(h);
    panel.append(elem('p',note,'info-note'));
   };
   button.onclick=choose;nav.append(button);if(i===0)choose();
  });
 }
 renderReadOnlyTabs('book-input-tabs','book-input-content',[
  ['Input Iuran','Form asli mencakup pilihan warga, tanggal, metode pembayaran, bulan pertama, tahun, jumlah bulan, nominal, dan rincian otomatis. Form ini belum terhubung ke API transaksi.'],
  ['Debit / Kredit','Form debit/kredit dari Pembukuan asli belum dipindahkan. Tidak ada jurnal baru dibuat.'],
  ['Buku Kas','Fungsi pencatatan buku kas dari aplikasi lama belum dipindahkan.'],
  ['Talangan','Form talangan dan angsurannya belum dipindahkan. Pencatatan keuangan masih dikunci.'],
  ['Denda','Pembuatan dan pembayaran denda belum dipindahkan.'],
  ['Pinjaman','Form pinjaman dan angsurannya belum dipindahkan.'],
  ['Import Bulk','Impor massal masih nonaktif sampai mapping dan pemeriksaan duplikasi diuji.']
 ]);
 renderReadOnlyTabs('book-report-tabs','book-report-content',[
  ['Kas Warga','Laporan kas asli menghitung saldo sebelumnya, saldo periode, saldo akhir, dan rincian transaksi. Perhitungan saldo akhir/arsip belum diintegrasikan; angka ringkasan API bukan penggantinya.'],
  ['Setoran RT','Laporan setoran RT dari aplikasi Pembukuan lama belum dipindahkan.'],
  ['Arisan','Laporan arisan belum dipindahkan.'],
  ['Denda','Laporan denda lengkap dan cetaknya belum dipindahkan.'],
  ['Talangan','Laporan talangan dan cetaknya belum dipindahkan.'],
  ['Pinjaman','Laporan pinjaman dan cetaknya belum dipindahkan.'],
  ['Tutup Buku & Arsip','Tutup buku dan arsip tahun tetap dinonaktifkan sampai prosedur resmi serta data histori diverifikasi.']
 ]);
 renderReadOnlyTabs('book-reference-tabs','book-reference-content',[
  ['Ringkasan','Ringkasan hunian dan tarif aktif dari sistem Pembukuan lama belum dipetakan sepenuhnya ke D1.'],
  ['Data Rumah','Master rumah dan status hunian masih dalam proses integrasi.'],
  ['Data Warga','Master warga dan hubungan penghuni masih dalam proses integrasi.'],
  ['Tarif & Aturan','Tarif iuran dan aturan per warga belum dapat disunting dari pratinjau.']
 ]);

 try{await loadOverview();const c=await endpoints.bookkeepingCash();setRows('book-cash',['Tanggal','Jenis','Kategori','Debit','Kredit','Status'],(c.transaksi||[]).map(t=>[date(t.occurred_on),t.transaction_type||'—',t.category||'—',fmtRp(t.debit_rp),fmtRp(t.credit_rp),t.status||'—']));}catch(e){failure(e)}
}

async function accountPage(){
 $('worker-login').href=apiURL('/akun/');
 if(!sameSiteAuthAvailable()){$('auth-configuration').hidden=false;$('auth-login').hidden=true;boxStatus('Frontend berhasil disiapkan. Konfigurasi Custom Domain API diperlukan untuk login lintas portal.','info');return}
 async function refresh(){
  let session;
  try{session=await endpoints.session()}
  catch(e){$('auth-login').hidden=false;$('auth-profile').hidden=true;return false}
  $('auth-login').hidden=true;$('auth-profile').hidden=false;
  put('profile-title',session.member?.nama||session.account?.username||'Akun aktif');
  put('profile-role',`${session.account?.role||'anggota'} · ${session.member?.rumah||'Tidak tertaut rumah'}`);
  let warning='';
  try{
   const p=await endpoints.profile();
   $('profile-name').value=p.profile?.nama||'';
   const im=$('avatar-preview');im.style.display=p.profile?.hasPhoto?'block':'none';
   if(p.profile?.hasPhoto)im.src=apiURL('/api/member/avatar')+'?v='+Date.now();
  }catch(e){warning='Profil belum dapat dimuat: '+(e?.message||'API error')}
  if(session.member){
   try{
    const [sav,pay]=await Promise.all([endpoints.savings(),endpoints.payments()]);
    put('member-summary',`Saldo tabungan dikonfirmasi: ${fmtRp(sav.saldoTersediaRp)}. Estimasi menunggu: ${fmtRp(sav.estimasiMenungguRp)}.`);
    setRows('member-payments',['Tanggal','Berat','Estimasi','Status'],(sav.setoran||[]).map(x=>[date(x.tanggal),`${fmtNum(Number(x.beratGram)/1000)} kg`,fmtRp(x.estimasiRp),x.status]));
    if(!pay.linked)put('member-summary',`Saldo tabungan ${fmtRp(sav.saldoTersediaRp)}. Data pembayaran belum tertaut.`);
   }catch(e){
    put('member-summary','Sesi login aktif. Data tabungan belum bisa dimuat.');
    warning=warning?warning+'; tabungan gagal dimuat':'Tabungan belum bisa dimuat: '+(e?.message||'API error');
   }
  }else put('member-summary','Akun pengelola belum tertaut ke data tabungan warga.');
  boxStatus(warning?'Login aktif, tetapi '+warning:'Login aktif untuk seluruh layanan pada domain Flamboyan 4.',warning?'info':'success');
  return true;
 }
 $('login-form').addEventListener('submit',async(ev)=>{ev.preventDefault();const button=$('login-submit');button.disabled=true;try{await endpoints.login($('login-username').value,$('login-password').value);$('login-password').value='';const active=await refresh();if(!active)throw Error('Login diterima, tetapi sesi belum terbaca. Periksa cookie dan domain API.');await updateHeader()}catch(e){failure(e)}finally{button.disabled=false}});
 $('logout-btn').onclick=async()=>{try{await endpoints.logout();$('auth-profile').hidden=true;$('auth-login').hidden=false;await updateHeader();boxStatus('Kamu sudah keluar.','success')}catch(e){failure(e)}};
 $('profile-form').onsubmit=async(e)=>{e.preventDefault();try{await endpoints.saveProfile($('profile-name').value);boxStatus('Profil berhasil disimpan.','success');await refresh()}catch(err){failure(err)}};
 $('avatar-form').onsubmit=async(e)=>{e.preventDefault();const file=$('avatar-file').files?.[0];if(!file)return;if(file.size>2*1024*1024){boxStatus('Foto maksimal 2 MB.','error');return}try{await endpoints.avatar(file);$('avatar-file').value='';boxStatus('Foto berhasil diunggah ke R2.','success');await refresh();await updateHeader()}catch(err){failure(err)}};
 await refresh();
}
if(page==='portal'){initPortalExtras();portal();}else if(page==='bank')bank();else if(page==='book')book();else if(page==='akun')accountPage();
