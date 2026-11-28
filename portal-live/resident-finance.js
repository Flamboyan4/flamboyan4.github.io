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


/* Resident transparency: read-only projections of the same posted journal as the homepage. */
const cashMonths=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const cashMonthKey=(year,index)=>year+'-'+String(index+1).padStart(2,'0');
const netCash=r=>r.debit-r.kredit;
function cashRows(data){
 const list=data?.data?.rows;
 if(!Array.isArray(list)||list.length!==data.data.jumlahTransaksi||list.some(r=>!r||!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(r.tanggal)||![r.debit,r.kredit].every(n=>Number.isSafeInteger(n)&&n>=0)||((r.debit>0)===(r.kredit>0))))throw Error('Jurnal kas lengkap belum tersedia.');
 return list.slice().sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
}
function cashStats(rows,year,month){
 const start=year+'-'+(month||'01'),end=year+'-'+(month||'12');
 const selected=rows.filter(r=>r.tanggal.slice(0,7)>=start&&r.tanggal.slice(0,7)<=end);
 const opening=rows.filter(r=>r.tanggal.slice(0,7)<start).reduce((s,r)=>s+netCash(r),0);
 const incoming=selected.reduce((s,r)=>s+r.debit,0),outgoing=selected.reduce((s,r)=>s+r.kredit,0);
 const closing=opening+incoming-outgoing;
 const buckets=Array.from({length:12},(_,i)=>({key:cashMonthKey(year,i),label:cashMonths[i],incoming:0,outgoing:0,closing:0}));
 let running=rows.filter(r=>r.tanggal<year+'-01-01').reduce((s,r)=>s+netCash(r),0);
 for(const r of rows){const b=buckets.find(x=>x.key===r.tanggal.slice(0,7));if(b){b.incoming+=r.debit;b.outgoing+=r.kredit}}
 for(const b of buckets){running+=b.incoming-b.outgoing;b.closing=running}
 const categories=new Map();
 for(const r of selected){if(r.kredit){const k=String(r.kategori||'Tanpa kategori').trim()||'Tanpa kategori';categories.set(k,(categories.get(k)||0)+r.kredit)}}
 return {selected,opening,incoming,outgoing,closing,buckets,categories:[...categories.entries()].sort((a,b)=>b[1]-a[1])};
}
const cashCompact=n=>new Intl.NumberFormat('id-ID',{notation:'compact',maximumFractionDigits:1}).format(n);
const cashEsc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cashNote=r=>{
 const note=String(r.keterangan||r.kategori||'Transaksi kas').trim();
 const fine=note.match(/^Denda Gorol\s+([A-Za-z]+)(?:\s+(20\d{2}))?/i),counts=[...note.matchAll(/\b(\d+)\s*(?:pembayaran|warga|orang)\b/gi)];
 if(fine&&counts.length&&Number(counts.at(-1)[1])>0)return 'Denda Gorol '+fine[1]+' '+(fine[2]||r.tanggal.slice(0,4))+' • '+counts.at(-1)[1]+' warga';
 return note.replace(/(\s*•\s*\d+\s+pembayaran)\1\s*$/i,'$1');
};
function financeHeading(view){
 const heading=el('div','rp-heading');heading.append(el('h1','','Keuangan'));
 const tabs=el('div','rp-finance-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Jenis keuangan');
 for(const [key,label] of [['environment','Lingkungan'],['personal','Pribadi']]){
  const b=btn(label,()=>{if(key!==view)void load(key)},'rp-tab');b.setAttribute('aria-pressed',String(key===view));tabs.append(b);
 }
 root.append(heading,tabs);
}
function financeCard(title){
 const card=el('section','rp-card rp-finance-card');card.append(el('h2','',title));return card;
}
function cashMetric(label,value,cls=''){
 const item=el('div','rp-cash-metric '+cls);item.append(el('small','',label),el('strong','',money(value)));return item;
}
function cashChart(title,buckets,line,year,month){
 const card=financeCard(title);card.append(el('p','rp-finance-caption','Per bulan · '+year+(month?' · Bulan dipilih disorot':'')));
 const W=360,H=183,left=43,right=8,top=12,bottom=29,plotW=W-left-right,plotH=H-top-bottom;
 const actual=buckets.filter(b=>b.key<=today().slice(0,7));
 const values=line?actual.map(b=>b.closing):actual.flatMap(b=>[b.incoming,b.outgoing]);
 const min=Math.min(0,...values),max=Math.max(0,...values),span=max-min||1;
 const y=v=>top+(max-v)/span*plotH,x=i=>left+(i+.5)*plotW/12;
 const step=plotW/12,zero=y(0);
 let svg='<svg class="rp-finance-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+cashEsc(title+' '+year)+'" xmlns="http://www.w3.org/2000/svg">';
 for(let i=0;i<=4;i++){const v=min+(max-min)*i/4,py=y(v);svg+='<path d="M'+left+' '+py+'H'+(W-right)+'" stroke="#e4e8f0" stroke-dasharray="3 3"/><text x="'+(left-5)+'" y="'+(py+3)+'" text-anchor="end" fill="#64748b" font-size="9">'+cashEsc(cashCompact(v))+'</text>'}
 if(month){const i=Number(month)-1;svg+='<rect x="'+(x(i)-step/2)+'" y="'+top+'" width="'+step+'" height="'+plotH+'" rx="3" fill="#eeebff"/>'}
 if(line){
  const points=actual.map((b,i)=>x(i)+','+y(b.closing)).join(' ');
  svg+='<polyline points="'+points+'" fill="none" stroke="#6550dd" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
  actual.forEach((b,i)=>{svg+='<circle cx="'+x(i)+'" cy="'+y(b.closing)+'" r="3" fill="#6550dd"><title>'+cashEsc(b.label+' '+money(b.closing))+'</title></circle>'});
 }else{
  actual.forEach((b,i)=>{for(const [v,offset,color,label] of [[b.incoming,-5,'#169b62','Kas masuk'],[b.outgoing,5,'#e65462','Kas keluar']]){svg+='<rect x="'+(x(i)+offset-4)+'" y="'+Math.min(y(v),zero)+'" width="8" height="'+Math.abs(zero-y(v))+'" rx="1.5" fill="'+color+'"><title>'+cashEsc(b.label+' · '+label+' '+money(v))+'</title></rect>'}});
 }
 buckets.forEach((b,i)=>{svg+='<text x="'+x(i)+'" y="'+(H-10)+'" text-anchor="middle" fill="#64748b" font-size="9">'+b.label+'</text>'});
 const graph=el('div');graph.innerHTML=svg+'</svg>';card.append(graph);
 const legend=el('div','rp-finance-legend');
 for(const [label,cls] of line?[['Saldo akhir','is-balance']]:[['Kas masuk','is-in'],['Kas keluar','is-out']]){const node=el('span',cls,label);legend.append(node)}
 card.append(legend);return card;
}
function cashPage(rows,requested,size=8){
 const pages=Math.max(1,Math.ceil(rows.length/size)),page=Math.min(pages,Math.max(1,requested));
 const start=(page-1)*size,end=Math.min(start+size,rows.length);
 return {page,pages,start,end,rows:rows.slice(start,end),total:rows.length};
}
function cashComposition(stats){
 const card=financeCard('Komposisi Pengeluaran');
 if(!stats.outgoing){card.append(el('p','rp-empty','Belum ada pengeluaran pada periode ini.'));return card}
 const colors=['#6550dd','#16a36a','#09a6cf','#f4a622','#e65462','#3483dc','#8b56bb'];
 const wrap=el('div','rp-finance-composition'),graph=el('div','rp-finance-donut'),legend=el('div','rp-finance-category-list');
 const categories=stats.categories.length>6?[...stats.categories.slice(0,6),['Lainnya',stats.categories.slice(6).reduce((sum,c)=>sum+c[1],0)]]:stats.categories;
 const C=2*Math.PI*43;let offset=0;
 let svg='<svg viewBox="0 0 116 116" role="img" aria-label="Komposisi pengeluaran" xmlns="http://www.w3.org/2000/svg"><circle cx="58" cy="58" r="43" fill="none" stroke="#edf0f5" stroke-width="16"/>';
 categories.forEach(([name,value],i)=>{const length=value/stats.outgoing*C;
  svg+='<circle cx="58" cy="58" r="43" fill="none" stroke="'+colors[i]+'" stroke-width="16" stroke-dasharray="'+length+' '+(C-length)+'" stroke-dashoffset="'+(-offset)+'" transform="rotate(-90 58 58)"><title>'+cashEsc(name+' '+money(value))+'</title></circle>';offset+=length;
  const row=el('div','rp-finance-category'),dot=el('span','rp-finance-dot'),info=el('div'),amount=el('strong','',money(value));dot.style.backgroundColor=colors[i];info.append(el('span','',name),el('small','',(100*value/stats.outgoing).toLocaleString('id-ID',{maximumFractionDigits:1})+'%'));row.append(dot,info,amount);legend.append(row);
 });
 graph.innerHTML=svg+'<text x="58" y="54" text-anchor="middle" fill="#64748b" font-size="9">Total keluar</text><text x="58" y="68" text-anchor="middle" fill="#27334d" font-size="12" font-weight="700">'+cashEsc(cashCompact(stats.outgoing))+'</text></svg>';
 wrap.append(graph,legend);card.append(wrap);return card;
}
function cashExport(stats,period){
 const title='Laporan Kas Lorong · '+period;
 const rows=stats.selected.slice().reverse().map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+cashEsc(shortDate(r.tanggal))+'</td><td>'+cashEsc(cashNote(r))+'</td><td class="num">'+(r.debit?cashEsc(money(r.debit)):'—')+'</td><td class="num">'+(r.kredit?cashEsc(money(r.kredit)):'—')+'</td></tr>').join('')||'<tr><td colspan="5">Tidak ada transaksi.</td></tr>';
 const summary=[['Saldo sebelum periode',stats.opening],['Kas masuk',stats.incoming],['Kas keluar',stats.outgoing],['Saldo akhir',stats.closing]].map(([label,v])=>'<div class="metric"><small>'+label+'</small><strong>'+cashEsc(money(v))+'</strong></div>').join('');
 const html='<!doctype html><html><head><meta charset="utf-8"><title>'+cashEsc(title)+'</title><style>@page{size:A4 portrait;margin:12mm}body{font:12px/1.45 Arial,sans-serif;color:#27334d}h1{font-size:19px;margin:0;color:#5145cd}p{margin:4px 0 12px}.summary{display:flex;gap:6px;margin:12px 0}.metric{flex:1;border:1px solid #ddd;padding:8px}.metric small,.metric strong{display:block}.metric strong{font-size:13px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px 5px;text-align:left}th{background:#ede9fe}.num{text-align:right;white-space:nowrap}small{color:#64748b}</style></head><body><h1>LAPORAN KEUANGAN KAS LORONG FLAMBOYAN 4</h1><p>RT 001 RW 026 · Pesona Kahuripan 2<br>'+cashEsc(period)+'</p><div class="summary">'+summary+'</div><h2>Rincian transaksi</h2><table><thead><tr><th>No</th><th>Tanggal</th><th>Keterangan</th><th>Masuk</th><th>Keluar</th></tr></thead><tbody>'+rows+'</tbody></table><p><small>Sumber: jurnal kas aktif Pembukuan Flamboyan 4. Saldo awal serah terima mengikuti pencatatan jurnal. Diunduh '+cashEsc(dateLabel(today()))+'.</small></p></body></html>';
 if(win.F4Pdf?.openHTML)void win.F4Pdf.openHTML(html,{title,format:'a4',orientation:'portrait'});else win.alert('Fitur PDF belum siap. Muat ulang halaman.');
}

// Jersey has its own D1 order tables, not the generic project_order module.
// Match the existing Portal Utama payment rules: explicit receipts first,
// then full payment or a stated DP amount. Never guess a percentage.
function jerseyFinance(data){
 const groups=['jerseyBapak','jerseyIbu','jerseyAnak'];
 if(!groups.every(k=>Array.isArray(data[k])))return null;
 if(groups.some(k=>data[k].length>=200))return null; // source has a 200-row cap
 const rows=groups.flatMap(k=>data[k]);
 if(!rows.length)return null; // source errors can also return empty arrays
 const result={orders:rows.length,tagihan:0,paid:0,remaining:0,credit:0,unknown:0};
 for(const r of rows){
  const price=Number(r.nominal_rp);
  if(!Number.isSafeInteger(price)||price<0||r.nominal_rp==null)return null;
  const status=String(r.payment_status||'').toLowerCase();
  const tags=[...String(r.method||'').matchAll(/\[F4BAYAR:(\d{1,12})\]/g)];
  let paid=0;
  if(tags.length)paid=Number(tags.at(-1)[1]);
  else if(status.includes('lunas')&&!/belum\s+lunas/.test(status))paid=price;
  else if(/dp|cicil/.test(status)){
   const m=status.match(/(?:rp\s*)?(\d[\d.,]*)/i);
   // A percentage is not a receipt amount.
   if(!m||/^\s*%/.test(status.slice(m.index+m[0].length))){result.unknown++;continue}
   paid=Number(m[1].replace(/[.,]/g,''));if(paid>0&&paid<1000)paid*=1000;
  }
  if(!Number.isSafeInteger(paid)||paid<0)return null;
  result.tagihan+=price;result.paid+=paid;result.remaining+=Math.max(0,price-paid);result.credit+=Math.max(0,paid-price);
 }
 return result.unknown?null:result;
}
const bankReportFields=['hasilPenjualan','hakWarga','kasLorong','operasional','cadangan','pengeluaran','pendingCount','pendingEstimateRp','batch'];
function bankReportTotals(report,period=''){
 if(!report||!Array.isArray(report.bulanan))return null;
 const rows=report.bulanan.filter(r=>!period||r.periode===period);
 if(!rows.length&&period)return null;
 const aggregate=report.ringkasan;
 if(!period&&aggregate&&bankReportFields.every(k=>Number.isSafeInteger(aggregate[k])&&aggregate[k]>=0)&&Number.isFinite(aggregate.pendingWeightKg)&&aggregate.pendingWeightKg>=0)return aggregate;
 if(!rows.length||!rows.every(r=>bankReportFields.every(k=>Number.isSafeInteger(r[k])&&r[k]>=0)&&Number.isFinite(r.pendingWeightKg)&&r.pendingWeightKg>=0))return null;
 return Object.fromEntries([...bankReportFields,'pendingWeightKg'].map(k=>[k,rows.reduce((sum,r)=>sum+r[k],0)]));
}

async function loadEnvironment(seq){
 const cash=el('div','rp-environment'),bank=financeCard('Keuangan Bank Sampah'),projects=financeCard('Pendanaan Projek');
 // Desktop: one aligned analysis row, followed by one aligned program row.
 const analysis=el('div','rp-cash-analysis'),programs=el('div','rp-finance-programs');
 const analysisStack=el('div','rp-cash-analysis-stack'),ledgerSlot=el('div','rp-cash-ledger-slot');
 analysis.append(analysisStack,ledgerSlot);programs.append(bank,projects);root.append(cash,analysis,programs);
 const active=()=>seq===serial&&!!account;
 cash.append(el('p','rp-empty','Memuat jurnal kas lorong…'));bank.append(el('p','rp-empty','Memuat keuangan Bank Sampah…'));projects.append(el('p','rp-empty','Memuat pendanaan projek…'));
 async function loadCash(){
  cash.replaceChildren(el('p','rp-empty','Memuat jurnal kas lorong…'));
  analysisStack.replaceChildren();ledgerSlot.replaceChildren();
  try{
   const rows=cashRows(await read('/api/v2/public/portal/cash'));if(!active())return;
   cash.replaceChildren();
   const toolbar=el('div','rp-finance-toolbar'),heading=el('div'),filters=el('div','rp-finance-filters'),year=el('select','rp-history-filter'),month=el('select','rp-history-filter');
   heading.append(el('h2','','Laporan Kas Lorong'),el('p','rp-finance-caption','Sumber: Pembukuan · '+(rows.length?'Transaksi terakhir '+shortDate(rows[0].tanggal):'Belum ada transaksi')));
   year.dataset.noCustom=month.dataset.noCustom='1';year.setAttribute('aria-label','Tahun laporan');month.setAttribute('aria-label','Bulan laporan');
   const option=(s,v,label)=>{const o=el('option','',label);o.value=v;s.append(o)};
   const current=today().slice(0,4);for(const y of [...new Set([current,...rows.map(r=>r.tanggal.slice(0,4))])].sort().reverse())option(year,y,y);
   year.value=current;option(month,'','Setahun');cashMonths.forEach((_,i)=>option(month,String(i+1).padStart(2,'0'),new Date(Date.UTC(2000,i,1)).toLocaleDateString('id-ID',{month:'long',timeZone:'UTC'})));
   filters.append(month,year);toolbar.append(heading,filters);cash.append(toolbar);
   const report=el('div','rp-environment');cash.append(report);
   function render(){
    const stats=cashStats(rows,year.value,month.value),period=month.value?month.options[month.selectedIndex].text+' '+year.value:'Tahun '+year.value;
    report.replaceChildren();analysisStack.replaceChildren();ledgerSlot.replaceChildren();
    const summary=el('section','rp-cash-report-hero'),head=el('div','rp-between'),main=el('div','rp-cash-main-value');
    main.append(el('small','','Saldo akhir · '+period),el('strong','',money(stats.closing)));
    const pdf=btn('PDF',()=>cashExport(stats,period),'rp-cash-pdf');pdf.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/></svg>');pdf.setAttribute('aria-label','Unduh laporan kas PDF');
    head.append(main,pdf);summary.append(head);
    const metrics=el('div','rp-cash-metrics');metrics.append(cashMetric('Saldo sebelumnya',stats.opening),cashMetric('Kas masuk',stats.incoming),cashMetric('Kas keluar',stats.outgoing));summary.append(metrics);report.append(summary);
    const graphs=el('div','rp-finance-graphs');graphs.append(cashChart('Kas Masuk & Keluar',stats.buckets,false,year.value,month.value),cashChart('Perkembangan Saldo',stats.buckets,true,year.value,month.value));report.append(graphs);
    const monthly=el('details','rp-card rp-finance-monthly'),monthlyTitle=el('summary','','Rincian angka grafik per bulan');monthly.append(monthlyTitle);
    const table=el('table'),thead=el('thead'),header=el('tr');for(const label of ['Bulan','Masuk','Keluar','Saldo akhir'])header.append(el('th','',label));thead.append(header);table.append(thead);const body=el('tbody');for(const b of stats.buckets.filter(b=>b.key<=today().slice(0,7))){const tr=el('tr');for(const value of [b.label,money(b.incoming),money(b.outgoing),money(b.closing)])tr.append(el('td','',value));body.append(tr)}table.append(body);monthly.append(table);
    analysisStack.append(monthly,cashComposition(stats));
    const detail=financeCard('Rincian Transaksi'),controls=el('div','rp-finance-filters'),direction=el('select','rp-history-filter'),search=el('input','rp-history-filter');
    direction.dataset.noCustom='1';direction.setAttribute('aria-label','Jenis transaksi');option(direction,'all','Semua transaksi');option(direction,'in','Kas masuk');option(direction,'out','Kas keluar');
    search.type='search';search.placeholder='Cari keterangan…';search.setAttribute('aria-label','Cari transaksi');
    controls.append(search,direction);detail.append(el('p','rp-finance-caption',period+' · Pengelompokan iuran mengikuti jurnal asli.'),controls);
    const list=el('div','rp-finance-ledger'),pager=el('nav','rp-finance-pager'),count=el('span','rp-finance-page-count'),buttons=el('div','rp-finance-page-buttons'),pageLabel=el('span','rp-finance-page-label');
    pager.setAttribute('aria-label','Halaman transaksi');count.setAttribute('aria-live','polite');
    let page=1;
    const prev=btn('',()=>{page--;paint()},'rp-small'),next=btn('',()=>{page++;paint()},'rp-small');
    prev.setAttribute('aria-label','Halaman sebelumnya');next.setAttribute('aria-label','Halaman berikutnya');
    prev.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
    next.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
    buttons.append(prev,pageLabel,next);pager.append(count,buttons);detail.append(list,pager);
    function paint(){
     list.replaceChildren();
     const q=search.value.trim().toLowerCase(),matching=stats.selected.filter(r=>(direction.value==='all'||(direction.value==='in'?r.debit>0:r.kredit>0))&&(!q||(cashNote(r)+' '+r.kategori+' '+r.tanggal).toLowerCase().includes(q)));
     const result=cashPage(matching,page);page=result.page;
     count.textContent=result.total?(result.start+1)+'–'+result.end+' dari '+result.total+' transaksi':'0 transaksi';
     pageLabel.textContent=page+' / '+result.pages;prev.disabled=page<=1;next.disabled=page>=result.pages;
     if(!matching.length){list.append(el('p','rp-empty','Tidak ada transaksi pada pilihan ini.'));return}
     result.rows.forEach(r=>{const row=el('div','rp-history-row'),text=el('div','rp-history-detail');text.append(el('strong','',cashNote(r)),el('small','',shortDate(r.tanggal)+(r.kategori?' · '+r.kategori:'')));row.append(text,el('strong','rp-history-amount '+(r.debit?'is-in':'is-out'),(r.debit?'+':'−')+money(r.debit||r.kredit)));list.append(row)});
    }
    search.oninput=direction.onchange=()=>{page=1;paint()};paint();ledgerSlot.append(detail);
   }
   year.onchange=month.onchange=render;render();
  }catch(e){if(active()){analysisStack.replaceChildren();ledgerSlot.replaceChildren();cash.replaceChildren(el('p','rp-empty',e.message||'Laporan kas belum dapat dimuat.'),btn('Coba lagi',loadCash,'rp-small'))}}
 }
 void loadCash();
 async function loadBank(){
  bank.replaceChildren(el('h2','','Keuangan Bank Sampah'),el('p','rp-empty','Memuat keuangan Bank Sampah…'));
  const results=await Promise.allSettled([read('/api/v2/bank/finance-summary'),read('/api/v2/public/bank/report')]);if(!active())return;
  bank.replaceChildren(el('h2','','Keuangan Bank Sampah'));
  const summary=results[0].status==='fulfilled'?results[0].value:null,report=results[1].status==='fulfilled'?results[1].value:null;
  if(summary&&[summary.totalPenjualanRp,summary.totalTabunganWargaRp,summary.kasBankSampahRp].every(Number.isSafeInteger)){
   bank.append(el('p','rp-finance-caption','Akumulasi keseluruhan · saldo tabungan terpisah dari kas bank'));
   const metrics=el('div','rp-finance-program-metrics');metrics.append(cashMetric('Penjualan disahkan',summary.totalPenjualanRp),cashMetric('Saldo tabungan warga',summary.totalTabunganWargaRp),cashMetric('Kas Bank Sampah',summary.kasBankSampahRp));bank.append(metrics);
  }else bank.append(el('p','rp-empty','Ringkasan saldo Bank Sampah belum tersedia.'));
  if(bankReportTotals(report)){
   const filter=el('select','rp-history-filter');filter.dataset.noCustom='1';filter.setAttribute('aria-label','Periode laporan Bank Sampah');
   const all=el('option','','Semua periode');all.value='';filter.append(all);
   for(const m of report.bulanan){const o=el('option','',m.periode);o.value=m.periode;filter.append(o)}
   const top=el('div','rp-finance-toolbar');top.append(el('h3','','Pembagian hasil penjualan'),filter);bank.append(top);
   const detail=el('div','rp-finance-program-detail');bank.append(detail);
   const fields=[['hasilPenjualan','Hasil penjualan'],['hakWarga','Hak warga'],['kasLorong','Bagian lingkungan'],['operasional','Operasional'],['cadangan','Cadangan'],['pengeluaran','Pengeluaran']];
   function paint(){
    const total=bankReportTotals(report,filter.value);detail.replaceChildren();
    if(!total){detail.append(el('p','rp-empty','Data periode belum tersedia.'));return}
    const pending=el('div','rp-finance-program-metrics');
    const weight=el('div','rp-cash-metric');weight.append(el('small','','Berat menunggu penjualan'),el('strong','',total.pendingWeightKg.toLocaleString('id-ID',{maximumFractionDigits:3})+' kg'));
    const count=el('div','rp-cash-metric');count.append(el('small','','Setoran menunggu penjualan'),el('strong','',String(total.pendingCount)));
    pending.append(weight,count,cashMetric('Estimasi setoran',total.pendingEstimateRp));detail.append(pending,el('p','rp-finance-caption','Estimasi belum menjadi saldo sah dan tidak dijumlahkan dengan hasil penjualan.'));
    if(total.batch===0)detail.append(el('p','rp-finance-caption','Belum ada penjualan yang disahkan pada periode ini.'));
    if(!filter.value&&summary&&Number.isSafeInteger(summary.totalPenjualanRp)&&summary.totalPenjualanRp!==total.hasilPenjualan){
     detail.append(el('p','rp-empty','Ringkasan penjualan dan rekap pembagian hasil belum sesuai. Rincian pembagian ditahan sampai data dapat diperiksa.'));
     return;
    }
    for(const [key,label] of fields){const row=el('div','rp-dues-row');row.append(el('span','',label),el('strong','',money(total[key])));detail.append(row)}
   }
   filter.onchange=paint;paint();
  }else bank.append(el('p','rp-empty','Laporan pembagian hasil belum dapat dimuat.'));
  if(!summary||!bankReportTotals(report))bank.append(btn('Muat ulang Bank Sampah',loadBank,'rp-small'));
  bank.append(link('Buka Bank Sampah','/bank-sampah/','rp-small'));
 }
 void loadBank();
 async function loadProjects(){
  projects.replaceChildren(el('h2','','Pendanaan Projek'),el('p','rp-empty','Memuat pendanaan projek…'));
  try{
   const data=await read('/api/v2/public/portal');if(!active())return;if(!Array.isArray(data.projects))throw Error('Data projek belum tersedia.');
   projects.replaceChildren(el('h2','','Pendanaan Projek'),el('p','rp-finance-caption','Dana setiap projek ditampilkan terpisah dan tidak dijumlahkan dengan saldo kas lorong.'));
   const funded=data.projects.filter(p=>['pesanan','penggalangan','kas'].includes(p.project_kind)&&p.ringkasan);
   if(!funded.length)projects.append(el('p','rp-empty','Belum ada projek dengan ringkasan pendanaan.'));
   for(const p of funded){const r=p.ringkasan,item=el('div','rp-finance-project'),target=p.project_kind==='pesanan'?r.totalTagihanRp:p.fund_target_rp;
    item.append(el('strong','',p.title||'Projek'));
    const projectKey=String(p.linked_key||'').toLowerCase(),projectTitle=String(p.title||'').toLowerCase().replace(/[^a-z0-9]/g,'');
    if(projectKey==='jersey'||['jersey','pemesananjersey'].includes(projectTitle)){
     const jersey=jerseyFinance(data);
     if(!jersey){item.append(el('p','rp-finance-caption','Rekap pembayaran Jersey belum lengkap atau belum tersedia.'));projects.append(item);continue}
     for(const [label,value] of [['Jumlah pesanan',jersey.orders],['Total tagihan',jersey.tagihan],['Dana masuk',jersey.paid],['Sisa tagihan',jersey.remaining],...(jersey.credit?[['Titipan kelebihan bayar',jersey.credit]]:[])]){
      const row=el('div','rp-dues-row');row.append(el('span','',label),el('strong','',label==='Jumlah pesanan'?String(value):money(value)));item.append(row);
     }
     item.append(el('small','rp-finance-caption','Sumber: rekap pemesanan Jersey bapak-bapak, ibu-ibu dan anak-anak. Dana masuk bukan saldo kas setelah pengeluaran vendor.'));
     projects.append(item);continue;
    }
    const fields=[...(p.project_kind==='kas'&&!p.fund_source?[]:[['Dana masuk',r.danaMasukRp]]),...(p.project_kind==='kas'&&p.fund_source?[['Pengeluaran tercatat',r.danaKeluarRp]]:[]),...(Number.isSafeInteger(target)&&target>0?[[p.project_kind==='pesanan'?'Total tagihan':'Target dana',target]]:[])];
    for(const [label,v] of fields){const row=el('div','rp-dues-row');row.append(el('span','',label),el('strong','',Number.isSafeInteger(v)?money(v):'—'));item.append(row)}
    if(p.project_kind==='kas'&&!p.fund_source)item.append(el('small','rp-finance-caption','Sumber dana belum dihubungkan.'));
    projects.append(item);
   }
  }catch(e){if(active())projects.replaceChildren(el('h2','','Pendanaan Projek'),el('p','rp-empty',e.message||'Data projek belum dapat dimuat.'),btn('Coba lagi',loadProjects,'rp-small'))}
 }
 void loadProjects();
}

async function load(view='personal'){
 closeHistory(false);const seq=++serial;root.replaceChildren();busy=true;
 financeHeading(view);
 if(view==='environment'){busy=false;void loadEnvironment(seq);return;}
 const personal=el('div','rp-personal-layout'),personalStack=el('div','rp-personal-stack');personal.append(personalStack);root.append(personal);
 const bank=el('section','rp-bank');bank.innerHTML='<div class="rp-between"><h2>Tabungan Bank Sampah</h2><button type="button" class="rp-eye" aria-label="Tampilkan saldo" aria-pressed="false"></button></div><p>Total saldo belum dicairkan</p><strong class="rp-saldo" data-amount="total">Rp ••••••</strong><div class="rp-split"><div><small>Bisa dicairkan</small><b data-amount="available">Rp ••••</b></div><div><small>Menunggu penjualan</small><b data-amount="pending">Rp ••••</b></div></div>';
 const bankActions=el('div','rp-bank-actions');
 const savingsHistory=historyButton('Riwayat Tabungan',()=>showHistory('savings',savingsHistory,getSavings));
 bankActions.append(link('Lihat tabungan','/bank-sampah/','rp-bank-link'),savingsHistory);bank.append(bankActions);personalStack.append(bank);
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
 const receiptBody=el('div','rp-receipt-body'),band=el('div','rp-receipt-band'),badge=el('strong','','Memeriksa…');badge.setAttribute('role','status');band.append(el('span','','Status'),badge);receipt.append(receiptHead,receiptBody,band);const paymentHistory=historyButton('Riwayat Pembayaran',()=>showHistory('payments',paymentHistory));receipt.append(paymentHistory);personalStack.append(dues);personal.append(receipt);
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
 const reminders=el('section','rp-reminders');reminders.hidden=true;personal.append(reminders);
 getSavings().catch(()=>{if(seq===serial)paint()});
 for(const [kind,label] of [['fines','Denda'],['loans','Pinjaman']])read('/api/member/'+kind).then(data=>{if(seq!==serial)return;if(data.linked===false)throw Error('Akun belum terhubung');const total=(data.rows||[]).filter(r=>!['dibatalkan','batal','lunas'].includes(String(r.status||'').toLowerCase())).reduce((sum,r)=>sum+Math.max(0,(Number(r.nominalRp)||0)-(Number(r.dibayarRp)||0)),0);if(total>0){if(reminders.hidden){reminders.hidden=false;reminders.append(el('h2','','Perlu perhatian'))}const b=el('div','rp-warning');b.append(el('span','',label+' belum lunas'),el('strong','',money(total)));reminders.append(b)}}).catch(()=>{if(seq!==serial)return;if(reminders.hidden){reminders.hidden=false;reminders.append(el('h2','','Perlu perhatian'))}reminders.append(el('p','rp-empty','Status '+label.toLowerCase()+' belum dapat diperiksa.'))});
 busy=false;
}

});
