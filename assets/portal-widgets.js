
import {elem,fmtNum} from './ui.js';
const $=id=>document.getElementById(id);
function short(s,max=140){return String(s||'').slice(0,max)}
function standardDate(s){const v=String(s||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:null}
function monthText(y,m){return new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric'}).format(new Date(y,m,1))}
export function renderPortalCalendar(events){
 const root=$('portal-calendar-grid');if(!root)return;
 const list=(Array.isArray(events)?events:[]).filter(x=>standardDate(x.starts_on||x.event_on||x.date)).map(x=>({
  ...x,iso:standardDate(x.starts_on||x.event_on||x.date),title:short(x.title||'Kegiatan Warga'),description:short(x.description||'',300),
  isWork:/gorol|kerja bakti|bersih/i.test(String(x.title||''))
 }));
 const now=new Date(),current={y:now.getFullYear(),m:now.getMonth()};
 const title=$('portal-calendar-title'),upcoming=$('portal-upcoming');
 const eventsSorted=list.slice().sort((a,b)=>a.iso.localeCompare(b.iso));
 function render(){
  const {y,m}=current;title.textContent=monthText(y,m);root.replaceChildren();
  const offset=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),n=Math.ceil((offset+days)/7)*7;
  for(let c=0;c<n;c++){
   const day=c-offset+1;
   const cell=elem('div',undefined,'portal-day'+(day<1||day>days?' out':''));
   if(day>=1&&day<=days){
    const iso=[y,String(m+1).padStart(2,'0'),String(day).padStart(2,'0')].join('-');
    const dayEvents=list.filter(e=>e.iso===iso);
    if(iso===[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'))cell.classList.add('today');
    cell.append(elem('span',day,'portal-day-num'));
    if(dayEvents.length){
     const show=dayEvents[0];const btn=elem('button',show.isWork?'Gorol':/arisan/i.test(show.title)?'Arisan':'Acara','portal-event-badge'+(show.isWork?' work':''));btn.type='button';
     btn.title=dayEvents.map(x=>x.title).join(', ');
     btn.onclick=()=>{
      const box=$('portal-calendar-selected');if(!box)return;
      box.replaceChildren();box.append(elem('strong',iso));dayEvents.forEach(x=>{box.append(elem('p',x.title));if(x.description)box.append(elem('small',x.description,'muted'))});
      box.hidden=false;
     };
     cell.append(btn);
     if(dayEvents.length>1)cell.append(elem('span','+'+(dayEvents.length-1),'portal-event-more'));
    }
   }else{const d=new Date(y,m,day);cell.append(elem('span',d.getDate(),'portal-day-num'))}
   root.append(cell);
  }
  const box=$('portal-calendar-selected');if(box)box.hidden=true;
  upcoming.replaceChildren();
  const monthRows=eventsSorted.filter(x=>x.iso>=new Date(now.getFullYear(),now.getMonth(),now.getDate()).toLocaleDateString('en-CA')||false);
  const shown=monthRows.length?monthRows:eventsSorted.slice(-5);
  if(!shown.length)upcoming.append(elem('p','Belum ada kegiatan terjadwal yang tercatat.','muted'));
  shown.slice(0,8).forEach(x=>{
   const card=elem('article',undefined,'portal-agenda-item');
   card.append(elem('small',x.iso,'portal-agenda-date'));card.append(elem('strong',x.title));
   if(x.description)card.append(elem('p',x.description,'muted'));upcoming.append(card);
  });
 }
 $('portal-prev-month').onclick=()=>{current.m--;if(current.m<0){current.m=11;current.y--}render()};
 $('portal-next-month').onclick=()=>{current.m++;if(current.m>11){current.m=0;current.y++}render()};
 $('portal-current-month').onclick=()=>{current.y=now.getFullYear();current.m=now.getMonth();render()};
 if(!document.getElementById('portal-calendar-selected')){const p=elem('aside',undefined,'portal-calendar-selected');p.id='portal-calendar-selected';p.hidden=true;root.after(p)}
 render();
}
export function renderPortalInventory(records){
 const node=$('inventory');if(!node)return;
 node.replaceChildren();
 const items=Array.isArray(records)?records:[];
 const count=$('portal-inventory-count');if(count)count.textContent=items.length+' Item · Lihat Semua ↗';
 if(!items.length){node.append(elem('p','Belum ada inventaris publik yang tercatat di D1.','muted'));return}
 items.slice(0,4).forEach(x=>{
  const row=elem('div',undefined,'portal-inventory-row');
  row.append(elem('span','▣','portal-inventory-icon'));
  const details=elem('div',undefined,'portal-inventory-copy');
  details.append(elem('strong',short(x.name||'Barang Warga',80)));
  details.append(elem('small',short(x.condition||x.category||'Tercatat',60),'muted'));
  row.append(details,elem('span',fmtNum(x.quantity)+' '+short(x.unit||'Unit',15),'portal-inventory-qty'));
  node.append(row);
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
   if(src){const u=new URL(src,location.origin);if(['https:','http:'].includes(u.protocol)){const img=document.createElement('img');img.src=u.href;img.alt='Foto album '+short(a.title,80);img.loading='lazy';img.onerror=()=>img.remove();visual.replaceChildren(img)}}
  }catch{}
  const info=elem('div',undefined,'bank-album-info');
  info.append(elem('small',short(a.category||'Dokumentasi',50),'chip'));
  info.append(elem('strong',short(a.title||'Album Warga',100)));
  info.append(elem('small',short(a.event_on||'',10),'muted'));
  link.append(visual,info);target.append(link);
 }
}
