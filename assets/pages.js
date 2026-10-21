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
async function bank(){
 try{
  const [r]=await Promise.all([endpoints.bank(),bankReport()]);
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
  const s=await endpoints.session();if(!['admin','superadmin'].includes(s.account?.role)){$('admin-hint').textContent='Data admin hanya tersedia untuk pengelola.';return}
  $('bank-admin').hidden=false;$('admin-hint').textContent='Data administrasi dalam mode baca-saja. Tombol transaksi tetap dinonaktifkan di staging.';
  const configs={deposits:[['Tanggal','Warga','Berat','Status','Estimasi'],(x)=>[date(x.deposited_on),x.memberName,`${fmtNum(Number(x.total_grams)/1000)} kg`,x.status,fmtRp(x.estimated_total_rp)]],sales:[['Tanggal','Pembeli','Diterima','Status'],x=>[date(x.sold_on),x.buyer_name||'—',fmtRp(x.amount_received_rp),x.status]],savings:[['Warga','Blok','Saldo'],x=>[x.memberName,x.houseCode||'—',fmtRp(x.balanceRp)]]};
  async function loadAdmin(key){try{const out=await endpoints.bankAdmin(key),[heads,convert]=configs[key];setRows('admin-table',heads,(out.data||[]).map(convert));boxStatus('Data admin '+key+' berhasil dimuat.','success')}catch(e){failure(e)}}
  $('btn-deposits').onclick=()=>loadAdmin('deposits');$('btn-sales').onclick=()=>loadAdmin('sales');$('btn-savings').onclick=()=>loadAdmin('savings');
 }catch(e){if(e.status!==401)failure(e)}
}

async function book(){
 if(!sameSiteAuthAvailable()){$('book-locked').hidden=false;put('book-locked-text',requireAuthMessage());boxStatus('Ringkasan keuangan tidak dibuka karena login lintas domain belum aktif.','info');return}
 try{const r=await endpoints.session();if(r.account?.role!=='superadmin')throw Error('Hanya superadmin yang dapat mengakses Pembukuan.');$('book-content').hidden=false;boxStatus('Akses superadmin terverifikasi oleh Worker D1.','success')}
 catch(e){$('book-locked').hidden=false;put('book-locked-text',e.message||'Login superadmin diperlukan.');boxStatus('Akses laporan keuangan dibatasi.','info');return}
 async function loadOverview(month=''){
  const v=await endpoints.bookkeepingOverview(month);put('book-debit',fmtRp(v.cash?.debitRp));put('book-credit',fmtRp(v.cash?.creditRp));put('book-payments',fmtRp(v.payments?.totalRp));put('book-fines',fmtRp(Math.max(0,Number(v.fines?.chargedRp||0)-Number(v.fines?.paidRp||0))));
  put('book-loans',`${fmtNum(v.loans?.count||0)} pinjaman · Total ${fmtRp(v.loans?.loanRp)}`);put('book-advances',`${fmtNum(v.advances?.count||0)} talangan · Total ${fmtRp(v.advances?.advanceRp)} · Dikembalikan ${fmtRp(v.advances?.reimbursedRp)}`);
 }
 const form=$('book-period-form');
 form.addEventListener('submit',async(ev)=>{ev.preventDefault();try{await loadOverview($('book-month').value);boxStatus('Ringkasan pembukuan diperbarui.','success')}catch(e){failure(e)}});
 try{await loadOverview();const c=await endpoints.bookkeepingCash();setRows('book-cash',['Tanggal','Jenis','Kategori','Debit','Kredit','Status'],(c.transaksi||[]).map(t=>[date(t.occurred_on),t.transaction_type||'—',t.category||'—',fmtRp(t.debit_rp),fmtRp(t.credit_rp),t.status||'—']));}catch(e){failure(e)}
}

async function accountPage(){
 $('worker-login').href=apiURL('/akun/');
 if(!sameSiteAuthAvailable()){$('auth-configuration').hidden=false;$('auth-login').hidden=true;boxStatus('Frontend berhasil disiapkan. Konfigurasi Custom Domain API diperlukan untuk login lintas portal.','info');return}
 async function refresh(){
  try{
   const s=await endpoints.session();$('auth-login').hidden=true;$('auth-profile').hidden=false;
   put('profile-title',s.member?.nama||s.account?.username||'Akun aktif');put('profile-role',`${s.account?.role||'anggota'} · ${s.member?.rumah||'Tidak tertaut rumah'}`);
   const p=await endpoints.profile();$('profile-name').value=p.profile?.nama||'';const im=$('avatar-preview');im.style.display=p.profile?.hasPhoto?'block':'none';if(p.profile?.hasPhoto)im.src=apiURL('/api/member/avatar')+'?v='+Date.now();
   if(s.member){const [sav,pay]=await Promise.all([endpoints.savings(),endpoints.payments()]);put('member-summary',`Saldo tabungan dikonfirmasi: ${fmtRp(sav.saldoTersediaRp)}. Estimasi menunggu: ${fmtRp(sav.estimasiMenungguRp)}.`);setRows('member-payments',['Tanggal','Berat','Estimasi','Status'],(sav.setoran||[]).map(x=>[date(x.tanggal),`${fmtNum(Number(x.beratGram)/1000)} kg`,fmtRp(x.estimasiRp),x.status]));if(!pay.linked)put('member-summary',`Saldo tabungan ${fmtRp(sav.saldoTersediaRp)}. Data pembayaran belum tertaut.`)}
   else put('member-summary','Akun pengelola belum tertaut ke data tabungan warga.');
   boxStatus('Login aktif untuk seluruh layanan pada domain Flamboyan 4.','success');return true
  }catch(e){$('auth-login').hidden=false;$('auth-profile').hidden=true;return false}
 }
 $('login-form').addEventListener('submit',async(ev)=>{ev.preventDefault();const button=$('login-submit');button.disabled=true;try{await endpoints.login($('login-username').value,$('login-password').value);$('login-password').value='';const active=await refresh();if(!active)throw Error('Login diterima, tetapi sesi belum terbaca. Periksa cookie dan domain API.');await updateHeader()}catch(e){failure(e)}finally{button.disabled=false}});
 $('logout-btn').onclick=async()=>{try{await endpoints.logout();$('auth-profile').hidden=true;$('auth-login').hidden=false;await updateHeader();boxStatus('Kamu sudah keluar.','success')}catch(e){failure(e)}};
 $('profile-form').onsubmit=async(e)=>{e.preventDefault();try{await endpoints.saveProfile($('profile-name').value);boxStatus('Profil berhasil disimpan.','success');await refresh()}catch(err){failure(err)}};
 $('avatar-form').onsubmit=async(e)=>{e.preventDefault();const file=$('avatar-file').files?.[0];if(!file)return;if(file.size>2*1024*1024){boxStatus('Foto maksimal 2 MB.','error');return}try{await endpoints.avatar(file);$('avatar-file').value='';boxStatus('Foto berhasil diunggah ke R2.','success');await refresh()}catch(err){failure(err)}};
 await refresh();
}
if(page==='portal')portal();else if(page==='bank')bank();else if(page==='book')book();else if(page==='akun')accountPage();
