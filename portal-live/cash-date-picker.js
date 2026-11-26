/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/cash-date-picker.js",function(__f4){


/* Kas Warga: custom Sunday-first calendar for the read-only date filter. */
(()=>{
 'use strict';
 const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
 const weekdays=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
 const pad=n=>(0,__f4.globals.String)(n).padStart(2,'0');
 const isoFromDate=d=>[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-');
 const today=()=>{
   const parts=new __f4.globals.Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new __f4.globals.Date());
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
   const m=(0,__f4.globals.String)(input.value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
   label.textContent=m&&(0,__f4.globals.Number)(m[2])>=1&&(0,__f4.globals.Number)(m[2])<=12
     ?(0,__f4.globals.Number)(m[3])+' '+months[(0,__f4.globals.Number)(m[2])-1].slice(0,3)+' '+m[1]
     :'Semua tanggal';
   trigger.classList.toggle('has-date',!!m);
 }
 function hide(restoreFocus=false){
   popup?.remove();popup=null;
   backdrop?.remove();backdrop=null;
   __f4.globals.document.body.classList.remove('f4-cash-calendar-open');
   trigger?.setAttribute('aria-expanded','false');
   if(restoreFocus&&trigger?.isConnected)trigger.focus({preventScroll:true});
 }
 function position(){
   if(!popup||!trigger)return;
   const mobile=__f4.window.matchMedia('(max-width:767px)').matches;
   popup.classList.toggle('is-mobile',mobile);
   if(mobile){popup.style.left='';popup.style.top='';popup.style.width='';return}
   const rect=trigger.getBoundingClientRect(),box=popup.getBoundingClientRect();
   const width=box.width||310,height=box.height||370;
   const spaceBelow=__f4.window.innerHeight-rect.bottom;
   popup.style.left=__f4.globals.Math.max(10,__f4.globals.Math.min(rect.right-width,__f4.window.innerWidth-width-10))+'px';
   popup.style.top=(spaceBelow>=height+12||spaceBelow>=rect.top?rect.bottom+8:__f4.globals.Math.max(10,rect.top-height-8))+'px';
 }
 function selectDate(iso){
   if(!input)return;
   input.value=iso;
   input.dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));
   sync();hide(true);
 }
 function draw(){
   if(!popup||viewMonth<0||viewMonth>11)return;
   const monthOptions=months.map((n,i)=>'<option value="'+i+'"'+(viewMonth===i?' selected':'')+'>'+n+'</option>').join('');
   const yearOptions=__f4.globals.Array.from({length:61},(_,i)=>2000+i).map(y=>'<option value="'+y+'"'+(viewYear===y?' selected':'')+'>'+y+'</option>').join('');
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
   const offset=new __f4.globals.Date(viewYear,viewMonth,1).getDay(),now=today();
   for(let i=0;i<42;i++){
     const d=new __f4.globals.Date(viewYear,viewMonth,1-offset+i),iso=isoFromDate(d);
     const b=__f4.globals.document.createElement('button');
     b.type='button';b.dataset.date=iso;b.className='f4-cash-calendar-day';
     b.textContent=(0,__f4.globals.String)(d.getDate());
     b.setAttribute('aria-label',new __f4.globals.Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(d));
     if(d.getMonth()!==viewMonth)b.classList.add('is-outside');
     if(iso===now)b.classList.add('is-today');
     if(iso===input?.value){b.classList.add('is-selected');b.setAttribute('aria-pressed','true')}
     grid.appendChild(b);
   }
   position();
 }
 function show(){if(trigger&&input)__f4.window.f4ModernControls?.openDate(input,trigger,{kind:'date',allowClear:true})}
 function init(){
   input=__f4.globals.document.getElementById('f4-cash-date-filter');
   trigger=__f4.globals.document.getElementById('f4-cash-date-trigger');
   label=__f4.globals.document.getElementById('f4-cash-date-label');
   if(!input||!trigger||!label)return;
   sync();trigger.addEventListener('click',show);
   input.addEventListener('change',()=>{
     sync();
     if(typeof __f4.window.filterKasWargaByDate==='function')__f4.window.filterKasWargaByDate();
   });
   __f4.globals.document.getElementById('f4-cash-date-clear')?.addEventListener('click',()=>(0,__f4.globals.queueMicrotask)(sync));
   __f4.globals.document.addEventListener('pointerdown',e=>{
     if(popup&&!popup.contains(e.target)&&!trigger.contains(e.target)&&!backdrop?.contains(e.target))hide();
   },true);
   __f4.globals.document.addEventListener('keydown',e=>{
     if(e.key==='Escape'&&popup){e.preventDefault();hide(true)}
   },true);
   __f4.window.addEventListener('resize',position,{passive:true});
   __f4.globals.document.addEventListener('scroll',position,true);
 }
 if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();

});
