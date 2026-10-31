/* Bank Sampah: ringkasan perkembangan warga, memakai agregat publik D1 saja. */
(()=>{
 'use strict';
 const API='https://api.flamboyan4.web.id';
 const state={range:'month',unit:'kg'};
 const n=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
 const idNum=value=>n(value).toLocaleString('id-ID',{maximumFractionDigits:2});
 const money=value=>'Rp '+Math.round(n(value)).toLocaleString('id-ID');
 const amount=(value,unit)=>unit==='kg'?idNum(value)+' kg':money(value);
 const shortAmount=(value,unit)=>{
   const v=n(value);
   if(unit==='kg')return idNum(v)+' kg';
   if(v>=1e9)return idNum(v/1e9)+' M';
   if(v>=1e6)return idNum(v/1e6)+' jt';
   if(v>=1e3)return idNum(v/1e3)+' rb';
   return v===0?'0':idNum(v);
 };
 const el=(tag,cls,text)=>{
   const node=document.createElement(tag);
   if(cls)node.className=cls;
   if(text!==undefined)node.textContent=String(text);
   return node;
 };
 const today=()=>{
   const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{
      timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'
   }).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
   return new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day,12));
 };
 const dayKey=d=>d.toISOString().slice(0,10);
 const monthKey=d=>dayKey(d).slice(0,7);
 const moved=(d,days)=>new Date(d.getTime()+days*86400000);
 const monthName=key=>{
   const date=/^\d{4}-\d{2}$/.test(key)?new Date(Date.UTC(+key.slice(0,4),+key.slice(5,7)-1,15)):null;
   return date?date.toLocaleDateString('id-ID',{timeZone:'UTC',month:'short'}):key;
 };
 const shortDay=key=>{
   const d=/^\d{4}-\d{2}-\d{2}$/.test(key)?new Date(key+'T12:00:00Z'):null;
   return d?d.toLocaleDateString('id-ID',{timeZone:'UTC',day:'numeric',month:'numeric'}):key;
 };
 const normalized=r=>({
    kg:n(r.beratKg),estimateKg:n(r.pendingWeightKg),
    rp:n(r.hasilPenjualan),estimateRp:n(r.pendingEstimateRp)
 });
 const entry=(label,values)=>({label,...values});
 function monthlyRows(data,report){
   const chosen=new Map();
   const official=Array.isArray(report?.bulanan)?report.bulanan:null;
   if(official)for(const row of official){
     const key=String(row.periode||'');
     if(/^\d{4}-\d{2}$/.test(key))chosen.set(key,normalized(row));
   }else for(const row of (Array.isArray(data.monthlyWeights)?data.monthlyWeights:[])){
     const key=String(row.month||'');
     if(/^\d{4}-\d{2}$/.test(key))chosen.set(key,{kg:n(row.beratKg),estimateKg:0,rp:0,estimateRp:0});
   }
   const current=today(),items=[];
   for(let offset=5;offset>=0;offset--){
     const date=new Date(Date.UTC(current.getUTCFullYear(),current.getUTCMonth()-offset,15,12));
     const key=monthKey(date);
     items.push(entry(monthName(key),chosen.get(key)||normalized({})));
   }
   return items;
 }
 function dailyRows(report,days){
   if(!Array.isArray(report?.harian))return null;
   const index=new Map();
   for(const row of report.harian){
     const date=String(row.tanggal||'');
     if(/^\d{4}-\d{2}-\d{2}$/.test(date))index.set(date,normalized(row));
   }
   const end=today(),start=moved(end,1-days),all=[];
   for(let i=0;i<days;i++){
     const date=dayKey(moved(start,i));
     all.push({date,...(index.get(date)||normalized({}))});
   }
   if(days===7)return all.map(x=>entry(shortDay(x.date),x));
   const grouped=[];
   for(let i=0;i<all.length;i+=5){
     const values=normalized({});
     for(const x of all.slice(i,i+5)){
       values.kg+=x.kg;values.estimateKg+=x.estimateKg;
       values.rp+=x.rp;values.estimateRp+=x.estimateRp;
     }
     grouped.push(entry(shortDay(all[i].date),values));
   }
   return grouped;
 }
 function metric(value,label,kind){
   const tile=el('div','f4-activity-metric'+(kind?' is-'+kind:''));
   tile.append(el('strong','',value),el('small','',label));
   return tile;
 }
 function toggleGroup(options,selected,onPick,groupLabel){
   const group=el('div','f4-activity-switch');
   group.setAttribute('role','group');group.setAttribute('aria-label',groupLabel);
   for(const [key,label] of options){
     const button=el('button',key===selected?'is-active':'',label);
     button.type='button';button.setAttribute('aria-pressed',String(key===selected));
     button.addEventListener('click',()=>onPick(key));
     group.append(button);
   }
   return group;
 }
 function chartCard(data,report){
   const card=el('section','f4-activity-panel f4-activity-chart');
   const head=el('div','f4-activity-panel-head');
   const heading=el('div');
   heading.append(el('h3','','Perkembangan setoran'),el('p','','Rekap dari transaksi Bank Sampah'));
   head.append(heading,el('span','f4-activity-mini-tag','6 bulan'));
   const rangeControl=el('div','f4-activity-control-line');
   const unitControl=el('div','f4-activity-control-line is-unit');
   const controls=el('div','f4-activity-controls');controls.append(rangeControl,unitControl);
   const bars=el('div','f4-activity-bars');
   bars.setAttribute('role','group');bars.setAttribute('aria-label','Grafik setoran Bank Sampah');
   const legend=el('div','f4-activity-legend');
   const footer=el('div','f4-activity-totals');
   const caption=el('p','f4-activity-chart-caption');
   card.append(head,controls,bars,legend,footer,caption);
   const dailyAvailable=Array.isArray(report?.harian);
   function draw(){
     const range=[['week','7 hari'],['days30','30 hari'],['month','Per bulan']];
     rangeControl.replaceChildren(toggleGroup(range,state.range,next=>{
       if(next!=='month'&&!dailyAvailable)return;
       state.range=next;draw();
     },'Rentang waktu'));
     for(const button of rangeControl.querySelectorAll('button')){
       if(button.textContent!=='Per bulan'&&!dailyAvailable){
         button.disabled=true;button.title='Rekap harian belum tersedia';
       }
     }
     unitControl.replaceChildren(toggleGroup([['kg','Kg'],['rp','Rp']],state.unit,next=>{
       state.unit=next;draw();
     },'Satuan grafik'));
     const isRupiah=state.unit==='rp';
     const hasRupiah=!!report;
     if(isRupiah&&!hasRupiah){
       bars.replaceChildren(el('p','f4-activity-empty','Nilai penjualan belum tersedia.'));
       footer.replaceChildren();legend.replaceChildren();
       caption.textContent='Berat tetap dapat dilihat melalui pilihan Kg.';
       return;
     }
     const rows=state.range==='week'?dailyRows(report,7):
                state.range==='days30'?dailyRows(report,30):monthlyRows(data,report);
     head.lastElementChild.textContent=state.range==='week'?'7 hari':
       state.range==='days30'?'30 hari':'6 bulan';
     if(!rows){
       bars.replaceChildren(el('p','f4-activity-empty','Rekap harian belum tersedia.'));
       footer.replaceChildren();legend.replaceChildren();caption.textContent='';return;
     }
     // Keep every period in one horizontal chart row (7 days = 7 columns; month/30 days = 6).
     bars.style.gridTemplateColumns='repeat('+rows.length+',minmax(0,1fr))';
     const key=isRupiah?'rp':'kg',pending=isRupiah?'estimateRp':'estimateKg';
     const maximum=Math.max(0,...rows.map(r=>r[key]+r[pending]));
     bars.replaceChildren();
     for(const row of rows){
       const total=row[key]+row[pending];
       const column=el('div','f4-activity-column');
       column.setAttribute('aria-label',row.label+': sah '+amount(row[key],state.unit)+
         ', belum sah '+amount(row[pending],state.unit));
       const value=el('b','',maximum===0?'—':(total>0?shortAmount(row[key],state.unit):'0'));
       const track=el('div','f4-activity-bar-track');
       const confirmed=el('span','f4-activity-bar-confirmed');
       const estimate=el('span','f4-activity-bar-pending');
       if(maximum>0){
         confirmed.style.height=(row[key]>0?Math.max(3,row[key]/maximum*100):0)+'%';
         estimate.style.height=(row[pending]>0?Math.max(3,row[pending]/maximum*100):0)+'%';
       }
       track.append(confirmed,estimate);
       column.append(value,track,el('span','f4-activity-axis-label',row.label));
       bars.append(column);
     }
     legend.replaceChildren();
     for(const [label,kind] of [[isRupiah?'Hasil jual sah':'Berat sah','confirmed'],[isRupiah?'Perkiraan belum sah':'Belum sah','pending']]){
       const item=el('span');item.append(el('i','is-'+kind),document.createTextNode(label));legend.append(item);
     }
     const sum=key=>rows.reduce((t,r)=>t+r[key],0);
     footer.replaceChildren(metric(amount(sum(key),state.unit),isRupiah?'Hasil jual sah':'Berat sah','confirmed'),
       metric(amount(sum(pending),state.unit),isRupiah?'Perkiraan':'Belum sah','pending'));
     caption.textContent=isRupiah?'Nilai kuning belum masuk saldo.':'Hijau = hasil sah • Kuning = belum sah.';
     if(maximum===0)bars.classList.add('is-empty');else bars.classList.remove('is-empty');
   }
   if(!dailyAvailable&&state.range!=='month')state.range='month';
   draw();
   return card;
 }
 const statusKind=text=>/selesai|tuntas|rampung/i.test(text)?'done':
   /berjalan|proses|berlangsung/i.test(text)?'active':'planned';
 const iconSvg=(kind)=>{
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
   svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
   svg.setAttribute('stroke-width','2');svg.setAttribute('stroke-linecap','round');
   svg.setAttribute('stroke-linejoin','round');
   svg.innerHTML=kind==='done'?'<path d="m5 12 4 4L19 6"/>':
     kind==='active'?'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>':
     '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 10h16"/>';
   return svg;
 };
 function activityItem(item){
   const status=String(item.status||'').trim()||'Tercatat';
   const kind=statusKind(status);
   const li=el('li','f4-activity-entry');
   const details=el('details','f4-activity-step is-'+kind);
   const summary=el('summary','f4-activity-step-summary');
   const avatar=el('span','f4-activity-step-icon');avatar.append(iconSvg(kind));
   const heading=el('span','f4-activity-step-copy');
   heading.append(el('strong','',item.title||'Kegiatan'));
   const timestamp=String(item.happened_on||'');
   const formatted=/^\d{4}-\d{2}-\d{2}$/.test(timestamp)?new Date(timestamp+'T12:00:00Z')
      .toLocaleDateString('id-ID',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'}):timestamp;
   heading.append(el('small','',[formatted,item.stage].filter(Boolean).join(' • ')));
   const right=el('span','f4-activity-step-right');
   right.append(el('span','f4-activity-status',status));
   const arrow=el('span','f4-activity-chevron');
   arrow.setAttribute('aria-hidden','true');arrow.textContent='⌄';right.append(arrow);
   summary.append(avatar,heading,right);
   const body=el('div','f4-activity-step-body');
   if(item.description)body.append(el('p','',item.description));
   if(item.next_step){
     const next=el('p','f4-activity-next');
     next.append(el('b','','Berikutnya: '),document.createTextNode(item.next_step));body.append(next);
   }
   const imgUrl=String(item.photoUrl||'');
   if(/^https:\/\/[^\s]+$/i.test(imgUrl)){
     const image=el('img','f4-activity-photo');image.src=imgUrl;image.alt='Dokumentasi '+(item.title||'kegiatan');
     image.loading='lazy';body.append(image);
   }
   if(!body.childElementCount)body.append(el('p','','Belum ada keterangan tambahan.'));
   details.append(summary,body);li.append(details);return li;
 }
 function allActivities(timeline){
   const focusBefore=document.activeElement,oldOverflow=document.body.style.overflow;
   document.querySelector('.f4-activity-dialog')?.remove();
   const overlay=el('div','f4-activity-dialog');
   overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
   overlay.setAttribute('aria-label','Semua kegiatan Bank Sampah');
   const panel=el('section','f4-activity-dialog-panel');
   const head=el('header','f4-activity-dialog-head');
   const title=el('h2','','Semua kegiatan');
   const close=el('button','f4-activity-dialog-close','×');close.type='button';
   close.setAttribute('aria-label','Tutup semua kegiatan');
   head.append(title,close);
   const scroll=el('div','f4-activity-dialog-scroll');scroll.tabIndex=0;
   const list=el('ol','f4-activity-list');for(const x of timeline)list.append(activityItem(x));
   scroll.append(list);panel.append(head,scroll);overlay.append(panel);
   function dismiss(){
     overlay.remove();document.body.style.overflow=oldOverflow;
     document.removeEventListener('keydown',keyboard);
     if(focusBefore?.isConnected)focusBefore.focus();
   }
   function keyboard(e){
     if(e.key==='Escape'){e.preventDefault();dismiss();}
     if(e.key==='Tab'){
       const items=[...panel.querySelectorAll('button,summary,[tabindex="0"]')];
       const first=items[0],last=items[items.length-1];
       if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
       else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
     }
   }
   close.onclick=dismiss;
   overlay.addEventListener('click',e=>{if(e.target===overlay)dismiss()});
   document.body.append(overlay);document.body.style.overflow='hidden';
   document.addEventListener('keydown',keyboard);close.focus();
 }
 function progressCard(rows){
   const card=el('section','f4-activity-panel f4-activity-timeline-panel');
   const total=rows.length,done=rows.filter(x=>statusKind(String(x.status||''))==='done').length;
   const active=rows.filter(x=>statusKind(String(x.status||''))==='active').length;
   const head=el('div','f4-activity-panel-head');
   const heading=el('div');heading.append(el('h3','','Kegiatan lingkungan'),el('p','','Perjalanan program Bank Sampah'));
   head.append(heading,el('span','f4-activity-mini-tag',total+' tahap'));
   const progress=el('div','f4-activity-progress');
   const line=el('div','f4-activity-progress-meta');
   line.append(el('strong','',done+' dari '+total+' selesai'),el('span','',active+' berjalan'));
   const meter=el('div','f4-activity-progress-track');meter.setAttribute('role','progressbar');
   meter.setAttribute('aria-label','Tahap kegiatan selesai');
   meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax',String(total||1));
   meter.setAttribute('aria-valuenow',String(done));
   const fill=el('span');fill.style.width=(total?done/total*100:0)+'%';meter.append(fill);
   progress.append(line,meter);
   const list=el('ol','f4-activity-list');
   rows.slice(0,3).forEach(x=>list.append(activityItem(x)));
   if(!total)list.append(el('li','f4-activity-empty','Belum ada kegiatan dipublikasikan.'));
   card.append(head,progress,list);
   if(total>3){
     const all=el('button','f4-activity-show-all','Lihat semua kegiatan');
     all.type='button';all.onclick=()=>allActivities(rows);card.append(all);
   }
   return card;
 }
 function render(area,data,report){
   area.replaceChildren();area.classList.add('f4-activity-app');
   const timeline=Array.isArray(data.progress)?data.progress:[];
   const stats=el('div','f4-activity-summary');
   stats.append(
     metric(idNum(data.overview?.activeMembers),'Anggota aktif','members'),
     metric(idNum(data.overview?.confirmedWeightKg)+' kg','Berat sah','weight'),
     metric(idNum(data.overview?.confirmedDeposits),'Setoran sah','deposits'),
     metric(idNum(timeline.length),'Kegiatan','events')
   );
   area.append(stats,chartCard(data,report),progressCard(timeline));
 }
 window.F4BankProgressApp={render};
})();