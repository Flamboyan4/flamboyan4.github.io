/* Kas Warga: custom Sunday-first calendar for the read-only date filter. */
(()=>{
 'use strict';
 const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
 const weekdays=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
 const pad=n=>String(n).padStart(2,'0');
 const isoFromDate=d=>[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-');
 const today=()=>{
   const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date());
   const part=type=>parts.find(x=>x.type===type)?.value||'';
   return [part('year'),part('month'),part('day')].join('-');
 };
 const icon=name=>{
   const paths={
     left:'<path d="m15 18-6-6 6-6"/>',
     right:'<path d="m9 18 6-6-6-6"/>',
     close:'<path d="M18 6 6 18M6 6l12 12"/>'
   };
   return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
 };
 let input=null,trigger=null,label=null,popup=null,backdrop=null,viewYear=0,viewMonth=0;
 function sync(){
   if(!input||!trigger||!label)return;
   const m=String(input.value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
   label.textContent=m&&Number(m[2])>=1&&Number(m[2])<=12
     ?Number(m[3])+' '+months[Number(m[2])-1].slice(0,3)+' '+m[1]
     :'Semua tanggal';
   trigger.classList.toggle('has-date',!!m);
 }
 function hide(restoreFocus=false){
   popup?.remove();popup=null;
   backdrop?.remove();backdrop=null;
   document.body.classList.remove('f4-cash-calendar-open');
   trigger?.setAttribute('aria-expanded','false');
   if(restoreFocus&&trigger?.isConnected)trigger.focus({preventScroll:true});
 }
 function position(){
   if(!popup||!trigger)return;
   const mobile=window.matchMedia('(max-width:767px)').matches;
   popup.classList.toggle('is-mobile',mobile);
   if(mobile){popup.style.left='';popup.style.top='';popup.style.width='';return}
   const rect=trigger.getBoundingClientRect(),box=popup.getBoundingClientRect();
   const width=box.width||310,height=box.height||370;
   const spaceBelow=window.innerHeight-rect.bottom;
   popup.style.left=Math.max(10,Math.min(rect.right-width,window.innerWidth-width-10))+'px';
   popup.style.top=(spaceBelow>=height+12||spaceBelow>=rect.top?rect.bottom+8:Math.max(10,rect.top-height-8))+'px';
 }
 function selectDate(iso){
   if(!input)return;
   input.value=iso;
   input.dispatchEvent(new Event('change',{bubbles:true}));
   sync();hide(true);
 }
 function draw(){
   if(!popup||viewMonth<0||viewMonth>11)return;
   const monthOptions=months.map((n,i)=>'<option value="'+i+'"'+(viewMonth===i?' selected':'')+'>'+n+'</option>').join('');
   const yearOptions=Array.from({length:61},(_,i)=>2000+i).map(y=>'<option value="'+y+'"'+(viewYear===y?' selected':'')+'>'+y+'</option>').join('');
   popup.innerHTML=
     '<div class="f4-cash-calendar-grip" aria-hidden="true"></div>'+
     '<div class="f4-cash-calendar-header"><strong>Pilih Tanggal</strong><button type="button" data-action="close" aria-label="Tutup kalender">'+icon('close')+'</button></div>'+
     '<div class="f4-cash-calendar-nav">'+
      '<button type="button" data-action="previous" aria-label="Bulan sebelumnya">'+icon('left')+'</button>'+
      '<div class="f4-cash-calendar-selects"><select data-change="month" aria-label="Bulan">'+monthOptions+'</select><select data-change="year" aria-label="Tahun">'+yearOptions+'</select></div>'+
      '<button type="button" data-action="next" aria-label="Bulan berikutnya">'+icon('right')+'</button>'+
     '</div>'+
     '<div class="f4-cash-calendar-weekdays">'+weekdays.map(d=>'<span>'+d+'</span>').join('')+'</div>'+
     '<div class="f4-cash-calendar-days"></div>'+
     '<div class="f4-cash-calendar-footer"><button type="button" data-action="today">Hari ini</button><button type="button" data-action="reset">Semua tanggal</button></div>';
   const grid=popup.querySelector('.f4-cash-calendar-days');
   const offset=new Date(viewYear,viewMonth,1).getDay(),now=today();
   for(let i=0;i<42;i++){
     const d=new Date(viewYear,viewMonth,1-offset+i),iso=isoFromDate(d);
     const b=document.createElement('button');
     b.type='button';b.dataset.date=iso;b.className='f4-cash-calendar-day';
     b.textContent=String(d.getDate());
     b.setAttribute('aria-label',new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(d));
     if(d.getMonth()!==viewMonth)b.classList.add('is-outside');
     if(iso===now)b.classList.add('is-today');
     if(iso===input?.value){b.classList.add('is-selected');b.setAttribute('aria-pressed','true')}
     grid.appendChild(b);
   }
   position();
 }
 function show(){
   if(!trigger||!input)return;
   if(popup){hide();return}
   const selected=/^\d{4}-\d{2}-\d{2}$/.test(input.value)?input.value:today();
   const m=selected.split('-');viewYear=Number(m[0]);viewMonth=Number(m[1])-1;
   popup=document.createElement('div');popup.id='f4-cash-calendar';popup.className='f4-cash-calendar';
   popup.setAttribute('role','dialog');popup.setAttribute('aria-label','Pilih tanggal transaksi');
   backdrop=document.createElement('div');backdrop.className='f4-cash-calendar-backdrop';
   backdrop.addEventListener('click',()=>hide(true));
   document.body.append(backdrop,popup);
   document.body.classList.add('f4-cash-calendar-open');
   trigger.setAttribute('aria-expanded','true');
   popup.addEventListener('click',e=>{
     const date=e.target.closest('[data-date]')?.dataset.date;
     if(date){selectDate(date);return}
     const action=e.target.closest('[data-action]')?.dataset.action;
     if(action==='close'){hide(true);return}
     if(action==='reset'){selectDate('');return}
     if(action==='today'){selectDate(today());return}
     if(action==='previous'||action==='next'){
       const next=new Date(viewYear,viewMonth+(action==='previous'?-1:1),1);
       viewYear=next.getFullYear();viewMonth=next.getMonth();draw();
     }
   });
   popup.addEventListener('change',e=>{
     const type=e.target.dataset.change;
     if(type==='month')viewMonth=Number(e.target.value);
     if(type==='year')viewYear=Number(e.target.value);
     if(type==='month'||type==='year')draw();
   });
   draw();
   popup.querySelector('.f4-cash-calendar-day.is-selected, .f4-cash-calendar-day.is-today')?.focus({preventScroll:true});
 }
 function init(){
   input=document.getElementById('f4-cash-date-filter');
   trigger=document.getElementById('f4-cash-date-trigger');
   label=document.getElementById('f4-cash-date-label');
   if(!input||!trigger||!label)return;
   sync();trigger.addEventListener('click',show);
   input.addEventListener('change',()=>{
     sync();
     if(typeof window.filterKasWargaByDate==='function')window.filterKasWargaByDate();
   });
   document.getElementById('f4-cash-date-clear')?.addEventListener('click',()=>queueMicrotask(sync));
   document.addEventListener('pointerdown',e=>{
     if(popup&&!popup.contains(e.target)&&!trigger.contains(e.target)&&!backdrop?.contains(e.target))hide();
   },true);
   document.addEventListener('keydown',e=>{
     if(e.key==='Escape'&&popup){e.preventDefault();hide(true)}
   },true);
   window.addEventListener('resize',position,{passive:true});
   document.addEventListener('scroll',position,true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
