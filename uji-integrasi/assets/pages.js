import {CONFIG,apiURL,sameSiteAuthAvailable} from './config.js';
import {api,endpoints} from './api.js';
import {$,fmtRp,fmtNum,elem,put,boxStatus,setRows,setCards,initShell,url,renderAlbum,requireAuthMessage,updateHeader} from './ui.js';
const page=document.body.dataset.page;
initShell(page);
document.querySelectorAll('[data-go]').forEach(a=>a.href=url(a.dataset.go));
function failure(e){boxStatus(e?.message||'Gagal memuat data.','error')}
function date(d){return String(d||'—').slice(0,10)}

async function portal(){
 try{
  const r=await endpoints.portal();
  put('count-agenda',r.agenda?.length||0);put('count-projects',r.projects?.length||0);put('count-inventory',r.inventory?.length||0);put('count-meetings',r.meetings?.length||0);
  setCards('agenda',(r.agenda||[]).map(x=>({title:x.title,note:`${date(x.starts_on)} · ${x.location||'Lingkungan warga'}`,text:x.description||x.status||''})));
  setCards('projects',(r.projects||[]).map(x=>({title:x.title,text:x.description,url:x.target_url})));
  setRows('meetings',['Tanggal','Hasil rapat','Ringkasan'],(r.meetings||[]).map(x=>[date(x.meeting_on),x.title,x.summary||'—']));
  setRows('inventory',['Inventaris','Jumlah','Kategori'],(r.inventory||[]).map(x=>[x.name,`${fmtNum(x.quantity)} ${x.unit||''}`,x.category||'—']));
  boxStatus('Data portal publik berhasil dimuat dari D1.','success');
 }catch(e){failure(e)}
}

async function bankReport(month=''){
 const r=await endpoints.bankReport(month);put('bank-cash-in',fmtRp(r.cash?.masukRp));put('bank-cash-out',fmtRp(r.cash?.keluarRp));
 setCards('cash-detail',[{title:'Periode laporan',text:month||'Keseluruhan'},{title:'Penjualan terkonfirmasi',text:fmtRp(r.sales?.diterimaRp)},{title:'Pengeluaran lunas',text:fmtRp(r.expenses?.pengeluaranRp)}]);
}

async function memberBankPanel(session){
 const area=$('bank-member-section');if(!area)return;
 area.hidden=false;area.replaceChildren();
 const who=session.member?.nama||'Warga',home=session.member?.rumah||'Belum tertaut';
 area.append(elem('h2','Halo, '+who,'bank-member-head'));
 area.append(elem('p','Ringkasan tabungan dan setoran atas nama akun ini.','muted'));
 const grid=elem('div',undefined,'bank-member-grid');
 const stats=[['Nama anggota',who],['Nomor rumah',home],['Saldo terkonfirmasi','Memuat…'],['Estimasi menunggu','Memuat…']];
 stats.forEach(([label,value])=>{
  const card=elem('article',undefined,'stat');card.append(elem('small',label));card.append(elem('strong',value));grid.append(card);
 });
 area.append(grid);
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
  Object.entries(views).forEach(([key,view])=>{
   const button=elem('button',view.label,'btn outline');button.type='button';
   button.dataset.kind=key;button.setAttribute('aria-pressed','false');button.onclick=()=>loadAdmin(key);
   nav.append(button);
  });
  await loadAdmin('deposits');
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
 boxStatus('Akses superadmin terverifikasi oleh Worker D1.','success');
 async function loadOverview(month=''){
  const v=await endpoints.bookkeepingOverview(month);put('book-debit',fmtRp(v.cash?.debitRp));put('book-credit',fmtRp(v.cash?.creditRp));put('book-payments',fmtRp(v.payments?.totalRp));put('book-fines',fmtRp(Math.max(0,Number(v.fines?.chargedRp||0)-Number(v.fines?.paidRp||0))));
  put('book-loans',`${fmtNum(v.loans?.count||0)} pinjaman · Total ${fmtRp(v.loans?.loanRp)}`);put('book-advances',`${fmtNum(v.advances?.count||0)} talangan · Total ${fmtRp(v.advances?.advanceRp)} · Dikembalikan ${fmtRp(v.advances?.reimbursedRp)}`);
 }
 const form=$('book-period-form');
 form.addEventListener('submit',async(ev)=>{ev.preventDefault();try{await loadOverview($('book-month').value);boxStatus('Ringkasan pembukuan diperbarui.','success')}catch(e){failure(e)}});
 const ledgerViews={
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
  ledgerCaption.textContent='Memuat '+view.label+' dari D1…';
  try{
   const result=await api(view.path);const rows=result.data||result.transaksi||[];
   setRows('book-ledger-table',view.heads,rows.map(view.row));
   ledgerCaption.textContent=view.label+' · '+rows.length+' data · hanya baca. Tidak otomatis menjadi saldo akhir.';
  }catch(e){ledgerCaption.textContent='Gagal memuat '+view.label+': '+(e.message||'Error');$('book-ledger-table').replaceChildren()}
 }
 Object.entries(ledgerViews).forEach(([key,view])=>{
  const button=elem('button',view.label,'btn outline');button.type='button';
  button.dataset.kind=key;button.setAttribute('aria-pressed','false');button.onclick=()=>loadLedger(key);
  ledgerNav.append(button);
 });
 await loadLedger('iuran');
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
 $('avatar-form').onsubmit=async(e)=>{e.preventDefault();const file=$('avatar-file').files?.[0];if(!file)return;if(file.size>2*1024*1024){boxStatus('Foto maksimal 2 MB.','error');return}try{await endpoints.avatar(file);$('avatar-file').value='';boxStatus('Foto berhasil diunggah ke R2.','success');await refresh()}catch(err){failure(err)}};
 await refresh();
}
if(page==='portal')portal();else if(page==='bank')bank();else if(page==='book')book();else if(page==='akun')accountPage();
