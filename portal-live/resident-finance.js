window.F4PortalRuntime.define("/portal-live/resident-finance.js",function(__f4){

'use strict';
const doc=__f4.globals.document,win=__f4.window,root=doc.getElementById('f4-resident-content');
if(!root)return;
const API='https://api.flamboyan4.web.id';
const el=(tag,cls='',value)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
const btn=(label,fn,cls='rp-button')=>{const b=el('button',cls,label);b.type='button';b.onclick=fn;return b};
const link=(label,href,cls='rp-button')=>{const a=el('a',cls,label);a.href=href;return a};
const read=async path=>{const r=await __f4.globals.fetch(API+path,{credentials:'include',cache:'no-store'});const data=await r.json();if(!r.ok||data.ok===false)throw Error(data.error||'Data tidak tersedia');return data};
const money=value=>'Rp'+Number(value).toLocaleString('id-ID',{maximumFractionDigits:0});
const today=()=>new Date(Date.now()+7*3600000).toISOString().slice(0,10);
const dateLabel=s=>/^\d{4}-\d{2}-\d{2}/.test(String(s||''))?new Date(s.slice(0,10)+'T00:00:00Z').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'—';
let serial=0,identity=null,account='',busy=false;
const message=(value)=>{root.replaceChildren(el('p','rp-empty',value))};
function roleChanged(e){
 if(e.origin!==__f4.globals.location.origin||e.source!==window||e.data?.type!=='f4:demo-role')return;
 const valid=e.data.role==='warga'&&e.data.identity?.accountId;
 if(!valid){serial++;account='';identity=null;busy=false;message('Masuk sebagai warga untuk membuka halaman ini.');root.append(btn('Masuk',()=>win.f4ShowLogin?.()));return}
 identity=e.data.identity;
 if(account===identity.accountId)return;
 account=identity.accountId;void load();
}
win.addEventListener('message',roleChanged);
__f4.cleanup(()=>{serial++;identity=null;account='';});

const eye=(shown)=>'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shown?'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>':'<path d="M3 3l18 18M9.8 5.3A11 11 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.4 3.3M6.2 6.2C3.5 8.2 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.3-.9"/>')+'</svg>';
const names={IURAN_BULANAN:'Iuran RT, RW & Keamanan',KAS_LORONG:'Kas Lorong',KEBERSIHAN:'Kebersihan',ARISAN:'Arisan'};
let historySeq=0;
async function load(){
 const seq=++serial;historySeq++;root.replaceChildren();busy=true;
 const heading=el('div','rp-heading');heading.append(el('h1','','Keuangan Saya'));root.append(heading);
 const bank=el('section','rp-bank');bank.innerHTML='<div class="rp-between"><h2>Tabungan Bank Sampah</h2><button type="button" class="rp-eye" aria-label="Tampilkan saldo" aria-pressed="false"></button></div><p>Total saldo belum dicairkan</p><strong class="rp-saldo" data-amount="total">Rp ••••••</strong><div class="rp-split"><div><small>Bisa dicairkan</small><b data-amount="available">Rp ••••</b></div><div><small>Menunggu penjualan</small><b data-amount="pending">Rp ••••</b></div></div>';
 bank.append(link('Lihat tabungan','/bank-sampah/','rp-bank-link'));root.append(bank);
 let shown=false,savings=null;
 const toggle=bank.querySelector('.rp-eye');
 function paint(){toggle.innerHTML=eye(shown);toggle.setAttribute('aria-pressed',String(shown));toggle.setAttribute('aria-label',shown?'Sembunyikan saldo':'Tampilkan saldo');for(const [key,v] of [['total',savings?savings.saldoTersediaRp+savings.estimasiMenungguRp:null],['available',savings?.saldoTersediaRp],['pending',savings?.estimasiMenungguRp]])bank.querySelector('[data-amount="'+key+'"]').textContent=shown?(Number.isFinite(v)?money(v):'Belum tersedia'):'Rp ••••'}
 toggle.onclick=()=>{shown=!shown;paint()};paint();
 const dues=el('section','rp-card rp-dues-card'),top=el('div','rp-between'),period=el('input','rp-month');period.type='month';period.value=today().slice(0,7);period.setAttribute('aria-label','Periode kewajiban');top.append(el('h2','','Rincian Kewajiban'),period);dues.append(top);const dueBody=el('div');dues.append(dueBody);root.append(dues);
 // A standalone receipt, using the visual hierarchy of Portal Utama / Kas Saya.
 const receipt=el('section','rp-receipt');receipt.setAttribute('aria-label','Status Pembayaran');
 const receiptHead=el('div','rp-receipt-head'),receiptTitle=el('div'),receiptPeriod=el('p'),receiptIcon=el('span','rp-receipt-icon');
 const receiptSvg=paid=>'<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paid?'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>':'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>')+'</svg>';
 receiptIcon.innerHTML=receiptSvg(false);receiptTitle.append(el('span','rp-receipt-brand','FLAMBOYAN 4'),el('h2','','Status Pembayaran'),receiptPeriod);receiptHead.append(receiptTitle,receiptIcon);
 const receiptBody=el('div','rp-receipt-body'),band=el('div','rp-receipt-band'),badge=el('strong','','Memeriksa…');badge.setAttribute('role','status');band.append(el('span','','Status'),badge);receipt.append(receiptHead,receiptBody,band);root.append(receipt);
 function renderReceipt(data,state){
  const month=data?.period||period.value;
  receiptPeriod.textContent=/^\d{4}-\d{2}$/.test(month)?new Date(month+'-01T00:00:00Z').toLocaleDateString('id-ID',{month:'long',year:'numeric',timeZone:'UTC'}):'Bulan berjalan';
  receiptBody.replaceChildren();band.className='rp-receipt-band';badge.textContent=state||'Belum tersedia';receiptIcon.innerHTML=receiptSvg(false);
  if(!data){receiptBody.append(el('p','rp-empty',state==='Memeriksa…'?'Memeriksa pembayaran…':'Status pembayaran belum dapat diperiksa.'));return}
  const due=data.totalWajibRp,paid=data.totalTerbayarRp,remaining=data.totalSisaRp;
  if(![due,paid,remaining].every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0)){receiptBody.append(el('p','rp-empty','Status pembayaran belum dapat diperiksa.'));return}
  const total=el('div','rp-receipt-total');total.append(el('span','','TOTAL DIBAYAR'),el('strong','',money(paid)));receiptBody.append(total);
  if(due===0){badge.textContent='TANPA TAGIHAN';receiptBody.append(el('p','rp-empty','Tidak ada kewajiban rutin untuk bulan ini.'))}
  else if(remaining===0){badge.textContent='LUNAS';band.classList.add('paid');receiptIcon.innerHTML=receiptSvg(true)}
  else if(paid===0){badge.textContent='BELUM BAYAR';band.classList.add('unpaid');receiptBody.append(el('p','rp-empty','Belum ada pembayaran yang tercatat.'))}
  else{badge.textContent='KURANG BAYAR';band.classList.add('partial')}
  if(remaining>0){const missing=el('div','rp-receipt-due');missing.append(el('span','','Sisa kewajiban'),el('strong','',money(remaining)));receiptBody.append(missing)}
  if(due>0&&paid>0){
   const details=el('dl','rp-receipt-details');
   function info(label,value){if(!value)return;const row=el('div');row.append(el('dt','',label),el('dd','',value));details.append(row)}
   const last=data.pembayaranTerakhir;
   info('Warga',data.nama||identity?.nama);info('Rumah',data.rumah||identity?.rumah);
   if(last){if(last.tanggal)info('Bayar terakhir',dateLabel(last.tanggal));info('Metode',last.metode||'Tidak tercatat')}
   receiptBody.append(details);
   if(last?.id){const id=el('div','rp-receipt-id');id.append(el('span','','Transaksi terakhir'),el('span','',last.id));receiptBody.append(id)}
  }
 }
 let dueSeq=0;
 async function loadDues(){
  const request=++dueSeq;dueBody.replaceChildren(el('p','rp-empty','Memuat kewajiban…'));renderReceipt(null,'Memeriksa…');
  try{
   const data=await read('/api/member/dues?month='+encodeURIComponent(period.value));if(seq!==serial||request!==dueSeq)return;dueBody.replaceChildren();
   if(!data.linked||!data.configured||!Array.isArray(data.components)){dueBody.append(el('p','rp-empty','Kewajiban belum tersedia untuk periode ini.'));renderReceipt(null,'Belum tersedia');return}
   const rows=el('div','rp-dues-rows');
   function row(label,amount){const line=el('div','rp-dues-row');line.append(el('span','',label),el('strong','',money(amount)));rows.append(line)}
   for(const item of data.components){const due=item.wajibRp;if(typeof due!=='number'||!Number.isFinite(due)||due<=0)continue;
    if(item.jenis==='IURAN_BULANAN'&&due%25000===0){const count=due/25000;row('Kas RT',10000*count);row('Kas RW',5000*count);row('Keamanan',10000*count)}
    else row(names[item.jenis]||item.jenis,due);
   }
   if(!rows.children.length)rows.append(el('p','rp-empty','Tidak ada iuran rutin untuk periode ini.'));
   const total=el('div','rp-dues-total');total.append(el('span','','Total per bulan'),el('strong','',typeof data.totalWajibRp==='number'&&Number.isFinite(data.totalWajibRp)?money(data.totalWajibRp):'—'));dueBody.append(rows,total);
   renderReceipt(data);
  }catch(e){if(seq===serial&&request===dueSeq){dueBody.replaceChildren(el('p','rp-empty','Kewajiban belum dapat dimuat.'),btn('Coba lagi',loadDues,'rp-small'));renderReceipt(null,'Belum tersedia')}}
 }
 period.onchange=loadDues;void loadDues();
 const reminders=el('section','rp-reminders');reminders.hidden=true;root.append(reminders);
 const history=el('section','rp-card rp-history-card');history.append(el('h2','','Riwayat pembayaran'));
 const controls=el('div','rp-tabs rp-history-tabs');const historyBody=el('div');history.append(controls,historyBody);root.append(history);
 const types=[['payments','Iuran'],['arisan','Arisan'],['fines','Denda'],['loans','Pinjaman']];
 let selected='payments';const cache={};
 async function showHistory(kind){selected=kind;const req=++historySeq;for(const b of controls.children)b.setAttribute('aria-pressed',String(b.dataset.kind===kind));historyBody.replaceChildren(el('p','rp-empty','Memuat riwayat…'));
 try{const data=cache[kind]||await read('/api/member/'+kind);if(seq!==serial||req!==historySeq)return;cache[kind]=data;historyBody.replaceChildren();const rows=Array.isArray(data.rows)?data.rows:[];if(!rows.length){historyBody.append(el('p','rp-empty',data.linked===false?'Akun belum terhubung ke pembukuan.':'Belum ada catatan.'));return}
 const ordered=rows.slice().sort((a,b)=>String(b.tanggal||'').localeCompare(String(a.tanggal||'')));let limit=5;
 function paintHistory(){historyBody.replaceChildren();for(const row of ordered.slice(0,limit)){const line=el('div','rp-line');const info=el('div');info.append(el('strong','',names[row.jenis]||row.jenis||types.find(x=>x[0]===kind)?.[1]||'Transaksi'),el('small','', [row.periode,dateLabel(row.tanggal),row.status].filter(Boolean).join(' · ')));line.append(info,el('b','',Number.isFinite(Number(row.nominalRp))?money(row.nominalRp):'—'));historyBody.append(line)}if(ordered.length>limit)historyBody.append(btn('Tampilkan lainnya',()=>{limit+=10;paintHistory()},'rp-small rp-history-more'))}
 paintHistory();
 }catch(e){if(seq===serial&&req===historySeq)historyBody.replaceChildren(el('p','rp-empty','Riwayat belum dapat dimuat.'),btn('Coba lagi',()=>showHistory(kind),'rp-small'))}}
 for(const [kind,label] of types){const b=btn(label,()=>showHistory(kind),'rp-tab');b.dataset.kind=kind;controls.append(b)}void showHistory(selected);
 read('/api/member/savings').then(b=>{if(seq!==serial)return;if(Number.isFinite(b.saldoTersediaRp)&&Number.isFinite(b.estimasiMenungguRp))savings=b;paint()}).catch(()=>{if(seq===serial)paint()});
 for(const [kind,label] of [['fines','Denda'],['loans','Pinjaman']])read('/api/member/'+kind).then(data=>{if(seq!==serial)return;cache[kind]=data;if(data.linked===false)throw Error('Akun belum terhubung');const total=(data.rows||[]).filter(r=>!['dibatalkan','batal','lunas'].includes(String(r.status||'').toLowerCase())).reduce((sum,r)=>sum+Math.max(0,(Number(r.nominalRp)||0)-(Number(r.dibayarRp)||0)),0);if(total>0){if(reminders.hidden){reminders.hidden=false;reminders.append(el('h2','','Perlu perhatian'))}const b=btn('',()=>{void showHistory(kind);history.scrollIntoView({block:'start',behavior:'instant'})},'rp-warning');b.append(el('span','',label+' belum lunas'),el('strong','',money(total)));reminders.append(b)}}).catch(()=>{if(seq!==serial)return;if(reminders.hidden){reminders.hidden=false;reminders.append(el('h2','','Perlu perhatian'))}reminders.append(el('p','rp-empty','Status '+label.toLowerCase()+' belum dapat diperiksa.'))});
 busy=false;
}

});
