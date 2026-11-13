/* Donatur Flamboyan 4 — satu akun, satu pemilik laporan, ditetapkan oleh server. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id';
const $=id=>document.getElementById(id);
const node=(tag,value,cls)=>{
 const e=document.createElement(tag);
 if(value!==undefined)e.textContent=String(value);
 if(cls)e.className=cls;
 return e;
};
const rupiah=value=>'Rp '+Math.round(Number(value)||0).toLocaleString('id-ID');
const tanggal=value=>{
 const s=String(value||'').slice(0,10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return '—';
 return new Date(s+'T12:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
};
const https=value=>{
 try{const u=new URL(String(value||''));return u.protocol==='https:'?u.href:null}catch{return null}
};
const empty=(message)=>node('p',message,'empty');
async function api(path,options={}){
 const response=await fetch(API+path,{credentials:'include',cache:'no-store',...options});
 const data=await response.json().catch(()=>({error:'Respons server tidak valid.'}));
 if(!response.ok||!data.ok){
   const error=new Error(data.error||'Permintaan gagal.');
   error.status=response.status;
   throw error;
 }
 return data;
}
function show(section){
 for(const id of ['startup','signin','denied','dashboard'])$(id).hidden=id!==section;
 $('logout').hidden=section!=='dashboard';
}
function tab(page){
 for(const button of document.querySelectorAll('[data-page]'))
  button.setAttribute('aria-current',button.dataset.page===page?'page':'false');
 for(const key of ['program','transaction','update','report'])
  $('page-'+key).hidden=page!==key;
}
function fact(parent,label,value){
 const box=node('div');
 box.append(node('span',label),node('strong',value));
 parent.append(box);
}
function renderPrograms(data){
 const target=$('program-grid');target.replaceChildren();
 const last=new Map();
 for(const item of [...data.updates].reverse())last.set(item.programId,item);
 if(!data.programs.length){target.append(empty('Belum ada donasi yang ditautkan ke program perusahaan ini.'));return}
 for(const p of data.programs){
  const card=node('article',undefined,'program-card');
  card.append(node('h3',p.title),node('p',p.description||'Pendanaan kegiatan lingkungan Flamboyan 4.','description'));
  const facts=node('div',undefined,'program-facts');
  fact(facts,'Donasi',rupiah(p.receivedRp));
  fact(facts,'Digunakan',rupiah(p.spentRp));
  card.append(facts);
  const remain=node('div',undefined,'remaining');
  remain.append(node('span','Sisa dana program'),node('strong',rupiah(Number(p.receivedRp)-Number(p.spentRp))));
  card.append(remain);
  const progress=last.get(p.programId);
  if(progress&&progress.progressPercent!==null&&Number.isFinite(Number(progress.progressPercent))){
   const area=node('div',undefined,'progress');
   const heading=node('div',undefined,'progress-label');
   heading.append(node('span','Kemajuan kegiatan'),node('span',Number(progress.progressPercent)+'%'));
   const track=node('div',undefined,'progress-track');
   const bar=node('div',undefined,'progress-bar');bar.style.width=Math.min(100,Math.max(0,Number(progress.progressPercent)))+'%';
   track.append(bar);area.append(heading,track);card.append(area);
  }
  target.append(card);
 }
}
function proofLink(value){
 const valid=https(value);
 if(!valid)return node('span','—');
 const a=node('a','Lihat bukti','proof');
 a.href=valid;a.target='_blank';a.rel='noopener noreferrer';
 return a;
}
function renderTable(parent,transactions,report=false){
 parent.replaceChildren();
 if(!transactions.length){parent.append(empty('Belum ada transaksi yang disahkan untuk perusahaan ini.'));return}
 const wrap=node('div',undefined,report?'':'transaction-table');
 const table=node('table');
 const thead=node('thead'),head=node('tr');
 for(const h of ['Tanggal','Program / Keperluan','Nominal','Jenis','Bukti'])head.append(node('th',h));
 thead.append(head);table.append(thead);
 const tbody=node('tbody');
 for(const tx of transactions){
  const row=node('tr');
  const date=node('td',tanggal(tx.occurredOn));
  const title=node('td');
  title.append(node('strong',tx.programTitle||'Program'));
  title.append(node('span',tx.note||tx.treasuryNote||'Transaksi disahkan','tx-detail'));
  const amount=node('td',rupiah(tx.amountRp),'num '+(tx.kind==='incoming'?'incoming':'outgoing'));
  const kind=node('td',tx.kind==='incoming'?'Donasi masuk':'Penggunaan dana');
  const proof=node('td');proof.append(proofLink(tx.proofUrl));
  row.append(date,title,amount,kind,proof);tbody.append(row);
 }
 table.append(tbody);wrap.append(table);parent.append(wrap);
}
function renderUpdates(data){
 const target=$('updates');target.replaceChildren();
 const map=new Map(data.programs.map(p=>[p.programId,p.title]));
 if(!data.updates.length){target.append(empty('Belum ada kabar perkembangan program yang diterbitkan.'));return}
 for(const update of data.updates){
  const article=node('article');
  const header=node('div',undefined,'update-meta');
  header.append(node('strong',map.get(update.programId)||'Program'),node('span',tanggal(update.occurredOn)));
  if(update.progressPercent!==null)header.append(node('span','Progres '+Number(update.progressPercent)+'%'));
  article.append(header,node('h3',update.title));
  if(update.summary)article.append(node('p',update.summary));
  const photo=https(update.photoUrl);
  if(photo){
   const a=node('a');a.href=photo;a.target='_blank';a.rel='noopener noreferrer';
   const img=node('img',undefined,'update-photo');img.src=photo;img.loading='lazy';img.alt='Dokumentasi: '+update.title;
   a.append(img);article.append(a);
  }
  target.append(article);
 }
}
function renderReport(data){
 $('report-title').textContent='Laporan Donatur — '+data.donor.name;
 const times=data.transactions.map(t=>t.occurredOn).filter(Boolean).sort();
 $('report-period').textContent=times.length?'Periode '+tanggal(times[0])+' s.d. '+tanggal(times[times.length-1]):'Belum ada transaksi tercatat';
 const boxes=$('report-summary');boxes.replaceChildren();
 const row=node('div',undefined,'report-totals');
 fact(row,'Donasi Diterima',rupiah(data.summary.receivedRp));
 fact(row,'Penggunaan Dana',rupiah(data.summary.spentRp));
 fact(row,'Sisa Dana',rupiah(data.summary.remainingRp));
 boxes.append(row);
 renderTable($('report-table'),data.transactions,true);
 if(data.historyPartial)boxes.append(node('p','Perhatian: rincian di halaman dibatasi 500 baris. Mintalah laporan lengkap kepada pengurus.','muted'));
}
function render(data){
 $('company-name').textContent=data.donor.name;
 $('amount-received').textContent=rupiah(data.summary.receivedRp);
 $('amount-spent').textContent=rupiah(data.summary.spentRp);
 $('amount-remaining').textContent=rupiah(data.summary.remainingRp);
 $('program-count').textContent=String(data.summary.programCount||0);
 renderPrograms(data);
 renderTable($('transactions'),data.transactions);
 renderUpdates(data);
 renderReport(data);
 $('partial-warning').hidden=!data.historyPartial;
 tab('program');show('dashboard');
}
async function load(){
 show('startup');
 try{render(await api('/api/donor/dashboard'))}
 catch(e){
  if(e.status===401){show('signin');return}
  $('denied-message').textContent=e.message||'Silakan hubungi pengurus Flamboyan 4.';
  show('denied');
 }
}
$('login-form').addEventListener('submit',async event=>{
 event.preventDefault();
 const submit=event.target.querySelector('[type=submit]');
 submit.disabled=true;$('login-error').textContent='';
 try{
  await api('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},
   body:JSON.stringify({username:$('username').value.trim(),password:$('password').value})});
  $('password').value='';await load();
 }catch(e){$('login-error').textContent=e.message||'Login gagal.'}
 finally{submit.disabled=false}
});
$('change-password-form').addEventListener('submit',async event=>{
 event.preventDefault();
 const form=event.currentTarget,status=$('password-status');
 const current=form.elements.currentPassword.value;
 const next=form.elements.newPassword.value;
 const confirm=form.elements.confirmPassword.value;
 if(next!==confirm){status.textContent='Pengulangan password belum sama.';return}
 const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='';
 try{
  await api('/api/auth/change-password',{method:'POST',headers:{'content-type':'application/json'},
   body:JSON.stringify({currentPassword:current,newPassword:next})});
  form.reset();$('username').value='';$('password').value='';
  show('signin');$('login-error').textContent='Password berhasil diganti. Silakan login kembali.';
 }catch(e){status.textContent=e.message||'Password belum berhasil diubah.'}
 finally{button.disabled=false}
});
$('logout').addEventListener('click',async()=>{
 try{await api('/api/auth/logout',{method:'POST'})}catch{}
 $('username').value='';$('password').value='';
 show('signin');
});
for(const button of document.querySelectorAll('[data-page]'))button.addEventListener('click',()=>tab(button.dataset.page));
const print=()=>{
 document.body.classList.add('printing-report');
 const clear=()=>document.body.classList.remove('printing-report');
 window.addEventListener('afterprint',clear,{once:true});
 window.print();
};
$('print-header').addEventListener('click',print);
$('print-report').addEventListener('click',print);
void load();
})();