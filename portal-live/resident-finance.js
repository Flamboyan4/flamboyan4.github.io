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
 if(!valid){closeHistory(false);serial++;account='';identity=null;busy=false;message('Masuk sebagai warga untuk membuka halaman ini.');root.append(btn('Masuk',()=>win.f4ShowLogin?.()));return}
 identity=e.data.identity;
 if(account===identity.accountId)return;
 account=identity.accountId;void load();
}
win.addEventListener('message',roleChanged);
__f4.cleanup(()=>{serial++;identity=null;account='';});

const eye=(shown)=>'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shown?'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>':'<path d="M3 3l18 18M9.8 5.3A11 11 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.4 3.3M6.2 6.2C3.5 8.2 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.3-.9"/>')+'</svg>';
const names={IURAN_BULANAN:'Iuran RT, RW & Keamanan',KAS_LORONG:'Kas Lorong',KEBERSIHAN:'Kebersihan',ARISAN:'Arisan'};

const historyIcon='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2"/></svg>';
const shortDate=s=>/^\d{4}-\d{2}-\d{2}/.test(String(s||''))?new Date(s.slice(0,10)+'T00:00:00Z').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'—';
const paymentLabels={...names,TANPA_ALOKASI:'Pembayaran tanpa alokasi'};
const mutationLabels={kredit:'Hasil Penjualan Sampah',pencairan:'Pencairan Tabungan',koreksi_kredit:'Koreksi Saldo Masuk',koreksi_debit:'Koreksi Saldo Keluar'};
let historySheet=null,historySerial=0,historyTrigger=null;
function historyButton(label,fn){
 const b=btn('',fn,'rp-history-action');b.innerHTML=historyIcon; b.append(el('span','',label));b.setAttribute('aria-haspopup','dialog');return b;
}
function closeHistory(restore=true){
 historySerial++;
 if(!historySheet)return;
 historySheet.hidden=true;historySheet.querySelector('.rp-history-body').replaceChildren();
 doc.body.classList.remove('f4-resident-sheet-open');
 if(historyTrigger){historyTrigger.setAttribute('aria-expanded','false');if(restore&&historyTrigger.isConnected)historyTrigger.focus({preventScroll:true})}
 historyTrigger=null;win.F4MobileSheets?.refresh?.();
}
function ensureHistory(){
 if(historySheet?.isConnected)return historySheet;
 const overlay=el('div','f4-resident-sheet-overlay rp-history-overlay');overlay.id='f4-resident-sheet';overlay.hidden=true;
 const panel=el('section','f4-resident-sheet-panel rp-history-panel');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','rp-history-title');
 const top=el('div','rp-history-head'),title=el('h2');title.id='rp-history-title';
 const close=btn('',()=>closeHistory(),'rp-history-close');close.setAttribute('aria-label','Tutup riwayat');close.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
 top.append(title,close);const body=el('div','rp-history-body');body.setAttribute('aria-live','polite');panel.append(top,body);overlay.append(panel);
 overlay.addEventListener('click',e=>{if(e.target===overlay)closeHistory()});doc.body.append(overlay);historySheet=overlay;return overlay;
}
async function showHistory(kind,trigger,getSavings){
 closeHistory(false);const request=++historySerial,owner=account;
 const sheet=ensureHistory(),body=sheet.querySelector('.rp-history-body');historyTrigger=trigger;trigger.setAttribute('aria-expanded','true');
 sheet.dataset.kind=kind;sheet.querySelector('#rp-history-title').textContent=kind==='payments'?'Riwayat Pembayaran':'Riwayat Tabungan';
 body.replaceChildren(el('p','rp-empty','Memuat riwayat…'));doc.body.classList.add('f4-resident-sheet-open');sheet.hidden=false;
 sheet.querySelector('.rp-history-close').focus({preventScroll:true});win.F4MobileSheets?.refresh?.();
 try{
  const data=await (kind==='payments'?read('/api/member/payments'):getSavings());
  if(request!==historySerial||owner!==account||sheet.hidden)return;
  if(data.linked===false)throw Error('Akun belum terhubung dengan data warga.');
  const source=kind==='payments'?data.rows:data.mutasi;
  if(!Array.isArray(source))throw Error('Format riwayat tidak tersedia.');
  const rows=source.slice().sort((a,b)=>String(b.tanggal||'').localeCompare(String(a.tanggal||'')));
  body.replaceChildren();
  const filters=el('div','rp-history-filters'),filter=el('select','rp-history-filter'),year=el('select','rp-history-filter');
  filter.dataset.noCustom='1';year.dataset.noCustom='1';filter.setAttribute('aria-label',kind==='payments'?'Kategori pembayaran':'Jenis mutasi');year.setAttribute('aria-label','Tahun transaksi');
  function option(select,value,label){const o=el('option','',label);o.value=value;select.append(o)}
  option(filter,'all','Semua transaksi');
  if(kind==='payments'){for(const key of [...new Set(rows.map(r=>String(r.jenis||'TANPA_ALOKASI')))])option(filter,key,paymentLabels[key]||key)}
  else{option(filter,'in','Uang masuk');option(filter,'out','Uang keluar')}
  option(year,'all','Semua tahun');for(const y of [...new Set(rows.map(r=>String(r.tanggal||r.periode||'').slice(0,4)).filter(y=>/^\d{4}$/.test(y)))].sort().reverse())option(year,y,y);
  filters.append(filter,year);body.append(filters);
  if(kind==='savings'&&data.riwayatTerpotong?.mutasi)body.append(el('p','rp-history-note','Menampilkan 100 mutasi terbaru dari jurnal tabungan.'));
  const list=el('div','rp-history-list'),more=el('div','rp-history-more');body.append(list,more);
  let limit=20;
  const direction=r=>['kredit','koreksi_kredit'].includes(r.jenis)?'in':['pencairan','koreksi_debit'].includes(r.jenis)?'out':'unknown';
  function render(){
   const selected=rows.filter(r=>(year.value==='all'||String(r.tanggal||r.periode||'').slice(0,4)===year.value)&&(filter.value==='all'||(kind==='payments'?String(r.jenis||'TANPA_ALOKASI')===filter.value:direction(r)===filter.value)));
   list.replaceChildren();more.replaceChildren();
   if(!selected.length){list.append(el('p','rp-empty','Belum ada transaksi pada pilihan ini.'));return}
   for(const row of selected.slice(0,limit)){
    const item=el('article','rp-history-row'),detail=el('div','rp-history-detail');
    const canceled=['batal','dibatalkan','cancelled'].includes(String(row.status||'').toLowerCase());
    const label=kind==='payments'?(paymentLabels[row.jenis]||row.jenis||'Pembayaran'):(mutationLabels[row.jenis]||row.jenis||'Mutasi tabungan');
    detail.append(el('strong','',label));
    const info=[shortDate(row.tanggal),kind==='payments'&&row.periode?'Periode '+row.periode:'',canceled?'Dibatalkan':''].filter(Boolean).join(' · ');
    detail.append(el('small','',info));
    const raw=kind==='payments'?row.nominalRp:row.jumlahRp;
    const dir=kind==='savings'?direction(row):'';
    const amount=el('strong','rp-history-amount'+(dir==='in'?' is-in':dir==='out'?' is-out':'')+(canceled?' is-canceled':''),raw!==null&&raw!==undefined&&Number.isFinite(Number(raw))?(dir==='in'?'+':dir==='out'?'−':'')+money(Math.abs(Number(raw))):'—');
    item.append(detail,amount);list.append(item);
   }
   if(selected.length>limit)more.append(btn('Tampilkan berikutnya',()=>{limit+=20;render()},'rp-button'));
  }
  filter.onchange=year.onchange=()=>{limit=20;render()};render();
 }catch(e){if(request!==historySerial||owner!==account||sheet.hidden)return;body.replaceChildren(el('p','rp-empty',e.message||'Riwayat belum dapat dimuat.'),btn('Coba lagi',()=>showHistory(kind,trigger,getSavings),'rp-button'))}
}
doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&historySheet&&!historySheet.hidden){e.preventDefault();closeHistory()}});
doc.addEventListener('click',e=>{if(historySheet&&!historySheet.hidden&&e.target?.closest?.('#f4-direct-dock'))closeHistory(false)},true);
__f4.cleanup(()=>{closeHistory(false);historySheet?.remove();historySheet=null;win.F4MobileSheets?.refresh?.()});

async function load(){
 closeHistory(false);const seq=++serial;root.replaceChildren();busy=true;
 const heading=el('div','rp-heading');heading.append(el('h1','','Keuangan Saya'));root.append(heading);
 const bank=el('section','rp-bank');bank.innerHTML='<div class="rp-between"><h2>Tabungan Bank Sampah</h2><button type="button" class="rp-eye" aria-label="Tampilkan saldo" aria-pressed="false"></button></div><p>Total saldo belum dicairkan</p><strong class="rp-saldo" data-amount="total">Rp ••••••</strong><div class="rp-split"><div><small>Bisa dicairkan</small><b data-amount="available">Rp ••••</b></div><div><small>Menunggu penjualan</small><b data-amount="pending">Rp ••••</b></div></div>';
 const bankActions=el('div','rp-bank-actions');
 const savingsHistory=historyButton('Riwayat Tabungan',()=>showHistory('savings',savingsHistory,getSavings));
 bankActions.append(link('Lihat tabungan','/bank-sampah/','rp-bank-link'),savingsHistory);bank.append(bankActions);root.append(bank);
 let shown=false,savings=null,savingsRequest=null;
 function getSavings(){if(savings)return Promise.resolve(savings);if(!savingsRequest)savingsRequest=read('/api/member/savings').then(b=>{if(seq===serial){savings=b;paint()}return b}).finally(()=>{savingsRequest=null});return savingsRequest}
 const toggle=bank.querySelector('.rp-eye');
 function paint(){toggle.innerHTML=eye(shown);toggle.setAttribute('aria-pressed',String(shown));toggle.setAttribute('aria-label',shown?'Sembunyikan saldo':'Tampilkan saldo');for(const [key,v] of [['total',Number.isFinite(savings?.saldoTersediaRp)&&Number.isFinite(savings?.estimasiMenungguRp)?savings.saldoTersediaRp+savings.estimasiMenungguRp:null],['available',savings?.saldoTersediaRp],['pending',savings?.estimasiMenungguRp]])bank.querySelector('[data-amount="'+key+'"]').textContent=shown?(Number.isFinite(v)?money(v):'Belum tersedia'):'Rp ••••'}
 toggle.onclick=()=>{shown=!shown;paint()};paint();
 const dues=el('section','rp-card rp-dues-card'),top=el('div','rp-between'),period=el('input','rp-month');period.type='month';period.dataset.f4CompactMonth='1';period.value=today().slice(0,7);period.setAttribute('aria-label','Periode kewajiban');top.append(el('h2','','Rincian Kewajiban'),period);dues.append(top);const dueBody=el('div');dues.append(dueBody);
 // A standalone receipt, using the visual hierarchy of Portal Utama / Kas Saya.
 const receipt=el('section','rp-receipt');receipt.setAttribute('aria-label','Status Pembayaran');
 const receiptHead=el('div','rp-receipt-head'),receiptTitle=el('div'),receiptPeriod=el('p'),receiptIcon=el('span','rp-receipt-icon');
 const receiptSvg=paid=>'<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paid?'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>':'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>')+'</svg>';
 receiptIcon.innerHTML=receiptSvg(false);receiptTitle.append(el('span','rp-receipt-brand','FLAMBOYAN 4'),el('h2','','Status Pembayaran'),receiptPeriod);receiptHead.append(receiptTitle,receiptIcon);
 const receiptBody=el('div','rp-receipt-body'),band=el('div','rp-receipt-band'),badge=el('strong','','Memeriksa…');badge.setAttribute('role','status');band.append(el('span','','Status'),badge);receipt.append(receiptHead,receiptBody,band);const paymentHistory=historyButton('Riwayat Pembayaran',()=>showHistory('payments',paymentHistory));receipt.append(paymentHistory);root.append(receipt,dues);
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
 getSavings().catch(()=>{if(seq===serial)paint()});
 for(const [kind,label] of [['fines','Denda'],['loans','Pinjaman']])read('/api/member/'+kind).then(data=>{if(seq!==serial)return;if(data.linked===false)throw Error('Akun belum terhubung');const total=(data.rows||[]).filter(r=>!['dibatalkan','batal','lunas'].includes(String(r.status||'').toLowerCase())).reduce((sum,r)=>sum+Math.max(0,(Number(r.nominalRp)||0)-(Number(r.dibayarRp)||0)),0);if(total>0){if(reminders.hidden){reminders.hidden=false;reminders.append(el('h2','','Perlu perhatian'))}const b=el('div','rp-warning');b.append(el('span','',label+' belum lunas'),el('strong','',money(total)));reminders.append(b)}}).catch(()=>{if(seq!==serial)return;if(reminders.hidden){reminders.hidden=false;reminders.append(el('h2','','Perlu perhatian'))}reminders.append(el('p','rp-empty','Status '+label.toLowerCase()+' belum dapat diperiksa.'))});
 busy=false;
}

});
