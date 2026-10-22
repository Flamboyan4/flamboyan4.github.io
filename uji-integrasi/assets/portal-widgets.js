
import {elem,fmtNum} from './ui.js';
import {openMediaViewer} from './media-viewer.js';
const $=id=>document.getElementById(id);
function short(s,max=140){return String(s||'').slice(0,max)}
function standardDate(s){const v=String(s||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:null}
function monthText(y,m){return new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric'}).format(new Date(y,m,1))}

export function renderPortalCalendar(events){
 const root=$('portal-calendar-grid');if(!root)return;
 const list=(Array.isArray(events)?events:[]).filter(x=>standardDate(x.starts_on||x.event_on||x.date)).map(x=>({
  ...x,iso:standardDate(x.starts_on||x.event_on||x.date),title:short(x.title||'Kegiatan Warga'),description:short(x.description||'',500),
  isWork:/gorol|kerja bakti|bersih/i.test(String(x.title||'')),isArisan:/arisan/i.test(String(x.title||''))
 }));
 const now=new Date(),current={y:now.getFullYear(),m:now.getMonth()},title=$('portal-calendar-title'),upcoming=$('portal-upcoming');
 const todayISO=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 const statusRank=a=>{
   const status=String(a.status||a.event_status||a.state||'').toLowerCase().trim();
   if(/selesai|completed?|finished|done|batal|cancel/.test(status))return 3;
   if(/berjalan|progress|proses|aktif|ongoing|in.progress/.test(status))return 0;
   if(/rencana|planned?|upcoming|pending|akan/.test(status))return 1;
   return a.iso>=todayISO?1:2;
 };
 const sorted=list.slice().sort((a,b)=>{
   const x=statusRank(a),y=statusRank(b);
   if(x!==y)return x-y;
   // Berjalan/selesai = terbaru lebih atas; rencana = yang terdekat lebih atas.
   return x===1?a.iso.localeCompare(b.iso):b.iso.localeCompare(a.iso);
 });
 let dlg=$('f4-agenda-dialog');
 if(!dlg){
  dlg=elem('dialog',undefined,'f4-agenda-dialog');dlg.id='f4-agenda-dialog';
  dlg.innerHTML='<div class="f4-agenda-head"><h2 id="f4-agenda-title">Agenda Warga</h2><button type="button" id="f4-agenda-close" aria-label="Tutup">×</button></div><div class="f4-agenda-share"><span>Bagikan agenda ini kepada warga</span><button type="button" id="f4-agenda-copy">Salin Link Agenda</button></div><div id="f4-agenda-items" class="f4-agenda-items"></div>';
  document.body.append(dlg);$('f4-agenda-close').innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19"/></svg>';$('f4-agenda-close').onclick=()=>dlg.close();dlg.onclick=e=>{if(e.target===dlg)dlg.close()};
 }
 function openDay(iso){
  const records=list.filter(x=>x.iso===iso);if(!records.length)return;
  $('f4-agenda-title').textContent='Kegiatan: '+new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(new Date(iso+'T12:00:00'));
  const area=$('f4-agenda-items');area.replaceChildren();
  records.forEach(a=>{
   const box=elem('article',undefined,'f4-agenda-event'+(a.isWork?' work':''));
   box.append(elem('small',a.isWork?'GOROL / KERJA BAKTI':a.isArisan?'ARISAN':'KEGIATAN WARGA','f4-event-type'),
    elem('strong',a.title),elem('p',a.description||'Informasi kegiatan warga.'));
   if(a.status)box.append(elem('span',String(a.status).slice(0,50),'f4-event-status'));area.append(box);
  });
  const copy=$('f4-agenda-copy');copy.textContent='Salin Link Agenda';
  copy.onclick=async()=>{
   const url=location.origin+'/uji-integrasi/#agenda-'+iso;
   try{await navigator.clipboard.writeText(url);copy.textContent='Link tersalin'}
   catch{const input=elem('textarea',url);document.body.append(input);input.select();const yes=document.execCommand('copy');input.remove();copy.textContent=yes?'Link tersalin':'Gagal menyalin'}
  };
  if(!dlg.open)dlg.showModal();
 }
 function render(){
  const {y,m}=current;title.textContent=monthText(y,m);root.replaceChildren();
  const offset=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),total=Math.ceil((offset+days)/7)*7;
  for(let i=0;i<total;i++){
   const day=i-offset+1,outside=day<1||day>days,cell=elem('div',undefined,'portal-day'+(outside?' out':''));
   const date=new Date(y,m,day);if(outside){cell.append(elem('span',date.getDate(),'portal-day-num'));root.append(cell);continue}
   const iso=[y,String(m+1).padStart(2,'0'),String(day).padStart(2,'0')].join('-'),records=list.filter(x=>x.iso===iso);
   if(iso===[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'))cell.classList.add('today');
   cell.append(elem('span',day,'portal-day-num'));
   if(records.length){
    const first=records[0],b=elem('button',first.isWork?'Gorol':first.isArisan?'Arisan':'Acara','portal-event-badge'+(first.isWork?' work':''));b.type='button';b.title=records.map(x=>x.title).join(', ');b.onclick=()=>openDay(iso);cell.append(b);
    if(records.length>1)cell.append(elem('span','+'+(records.length-1),'portal-event-more'));
   }root.append(cell);
  }
  upcoming.replaceChildren();
  const shown=sorted;
  if(!shown.length)upcoming.append(elem('p','Belum ada kegiatan terjadwal.','muted'));
  shown.forEach(x=>{
   const card=elem('button',undefined,'portal-agenda-item');card.type='button';card.append(elem('small',x.iso,'portal-agenda-date'),elem('strong',x.title));
   if(x.description)card.append(elem('p',x.description,'muted'));card.onclick=()=>openDay(x.iso);upcoming.append(card);
  });
 }
 $('portal-prev-month').innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>';$('portal-next-month').innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
 $('portal-prev-month').onclick=()=>{current.m--;if(current.m<0){current.y--;current.m=11}render()};
 $('portal-next-month').onclick=()=>{current.m++;if(current.m>11){current.y++;current.m=0}render()};
 $('portal-current-month').onclick=()=>{current.y=now.getFullYear();current.m=now.getMonth();render()};
 const match=location.hash.match(/^#agenda-(\d{4}-\d{2}-\d{2})$/);
 if(match){const d=new Date(match[1]+'T12:00:00');if(!Number.isNaN(d.valueOf())){current.y=d.getFullYear();current.m=d.getMonth()}}
 render();if(match)window.setTimeout(()=>openDay(match[1]),130);
}


export function renderPortalInventory(records,targetId='inventory',countId='portal-inventory-count'){
 const node=$(targetId);if(!node)return;node.replaceChildren();
 const items=Array.isArray(records)?records:[],count=$(countId);if(count)count.textContent=items.length+' Item';
 if(!items.length){node.append(elem('p','Belum ada inventaris publik yang tercatat.','muted'));return}
 items.forEach(x=>{
  const photo=x.imageUrl||x.photoUrl||x.photo_url||x.foto||'';
  const row=elem('div',undefined,'portal-inventory-row'),visual=elem('span',undefined,'portal-inventory-icon');
  if(photo){const img=document.createElement('img');img.src=photo;img.alt='Foto '+short(x.name);img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>img.replaceWith(elem('span','▣'));visual.append(img)}
  else visual.append(elem('span','▣'));
  const detail=elem('div',undefined,'portal-inventory-copy');
  detail.append(elem('strong',short(x.name||'Barang Warga',80)),elem('small',short(x.condition||x.category||'Tercatat',60),'muted'));
  row.append(visual,detail,elem('span',fmtNum(x.quantity)+' '+short(x.unit||'Unit',15),'portal-inventory-qty'));
  if(photo){row.classList.add('has-photo');row.tabIndex=0;row.setAttribute('role','button');row.title='Lihat foto '+short(x.name);
   row.onclick=()=>openMediaViewer('Inventaris: '+short(x.name),[{url:photo,type:'foto'}]);
   row.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();row.click()}};
  }node.append(row);
 });
}

export function renderBankProgress(items){
 const chart=$('bank-progress-chart'),line=$('progress');if(!line)return;
 line.replaceChildren();line.className='bank-progress-timeline';
 const records=Array.isArray(items)?items:[];
 if(chart){chart.replaceChildren();const note=elem('div','Grafik berat sampah terkonfirmasi memerlukan seri bulanan dari transaksi yang telah disahkan.','muted small');chart.append(note)}
 if(!records.length){line.append(elem('p','Belum ada perkembangan publik yang tercatat.','muted'));return}
 records.slice(0,10).forEach(x=>{
  const row=elem('article',undefined,'bank-timeline-item');
  row.append(elem('small',short(x.happened_on||'',10),'muted'));
  row.append(elem('strong',short(x.title||'Perkembangan kegiatan',120)));
  row.append(elem('p',short(x.description||x.stage||'',240),'muted'));line.append(row);
 });
}
export async function renderBankAlbumPreviews(albums,detailsLoader){
 const target=$('albums');if(!target)return;target.replaceChildren();
 const recent=Array.isArray(albums)?albums.slice(0,2):[];
 if(!recent.length){target.append(elem('p','Belum ada album dokumentasi publik.','muted'));return}
 for(const a of recent){
  const link=elem('a',undefined,'bank-album-preview');link.href='dokumentasi/';
  const visual=elem('div','▧','bank-album-visual');
  try{
   const detail=await detailsLoader(a.id);
   const media=(detail?.media||[]).find(m=>m.media_type==='foto'||m.mediaUrl);
   const src=media?.mediaUrl||media?.external_url||'';
   if(src){const u=new URL(src,src.startsWith('/')?'https://api.flamboyan4.web.id':location.origin);if(['https:','http:'].includes(u.protocol)){const img=document.createElement('img');img.src=u.href;img.alt='Foto album '+short(a.title,80);img.loading='lazy';img.onerror=()=>img.remove();visual.replaceChildren(img)}}
  }catch{}
  const info=elem('div',undefined,'bank-album-info');
  info.append(elem('small',short(a.category||'Dokumentasi',50),'chip'));
  info.append(elem('strong',short(a.title||'Album Warga',100)));
  info.append(elem('small',short(a.event_on||'',10),'muted'));
  link.append(visual,info);target.append(link);
 }
}
