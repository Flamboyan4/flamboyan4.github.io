/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/bank-setoran-date.js",function(__f4){


/* Bank Sampah Setoran: independent desktop date control.
   The D1 write contract keeps reading the original #setDate ISO input.
   Mobile keeps the existing portal date picker. */
(()=>{'use strict';
 const input=__f4.globals.document.getElementById('setDate');
 if(!input||__f4.window.matchMedia('(max-width:760px)').matches)return;
 if(input.dataset.f4BankDesktopDate==='1')return;
 input.dataset.f4BankDesktopDate='1';
 input.setAttribute('data-f4-picker-skip','');
 input.classList.add('f4-bs-date-native');
 const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
 const weekdays=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
 const pad=n=>(0,__f4.globals.String)(n).padStart(2,'0');
 const iso=(y,m,d)=>y+'-'+pad(m+1)+'-'+pad(d);
 const today=()=>{
  const p=new __f4.globals.Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new __f4.globals.Date());
  const x=n=>p.find(v=>v.type===n)?.value;
  return x('year')+'-'+x('month')+'-'+x('day');
 };
 const valid=v=>{
  const x=(0,__f4.globals.String)(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!x)return false;
  const d=new __f4.globals.Date(+x[1],+x[2]-1,+x[3]);
  return d.getFullYear()===+x[1]&&d.getMonth()+1===+x[2]&&d.getDate()===+x[3]&&
   (!input.min||v>=input.min)&&(!input.max||v<=input.max);
 };
 const make=(tag,cls,txt)=>{
  const e=__f4.globals.document.createElement(tag);e.className=cls||'';
  if(txt!==__f4.globals.undefined)e.textContent=txt;return e;
 };
 const button=make('button','f4-bs-date-trigger');button.type='button';
 button.setAttribute('aria-label','Pilih tanggal setoran');
 button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
 const label=make('span','f4-bs-date-label');
 const icon=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
 icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('width','18');icon.setAttribute('height','18');
 icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.8');
 const calendarPath=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','path');
 calendarPath.setAttribute('d','M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z');
 icon.append(calendarPath);icon.setAttribute('aria-hidden','true');button.append(label,icon);
 input.after(button);
 let pop=null,year=0,month=0;
 const formatted=v=>{
  const x=(0,__f4.globals.String)(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return x?+x[3]+' '+months[+x[2]-1].slice(0,3)+' '+x[1]:'Pilih tanggal';
 };
 const sync=()=>{label.textContent=formatted(input.value);button.disabled=input.disabled};
 input.addEventListener('input',sync);input.addEventListener('change',sync);sync();
 const close=()=>{if(!pop)return;pop.remove();pop=null;button.setAttribute('aria-expanded','false')};
 const position=()=>{
  if(!pop)return;
  const r=button.getBoundingClientRect(),w=__f4.globals.Math.min(320,__f4.globals.innerWidth-20);
  const h=pop.offsetHeight||345,below=__f4.globals.innerHeight-r.bottom,above=r.top;
  const y=below>=h+10||below>=above?r.bottom+7:__f4.globals.Math.max(10,r.top-h-7);
  pop.style.left=__f4.globals.Math.max(10,__f4.globals.Math.min(r.left,__f4.globals.innerWidth-w-10))+'px';
  pop.style.top=__f4.globals.Math.max(10,__f4.globals.Math.min(y,__f4.globals.innerHeight-h-10))+'px';pop.style.width=w+'px';
 };
 const choose=v=>{
  if(!valid(v))return;
  input.value=v;input.dispatchEvent(new __f4.globals.Event('input',{bubbles:true}));
  input.dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));close();button.focus({preventScroll:true});
 };
 const draw=()=>{
  if(!pop)return;pop.replaceChildren();
  const nav=make('div','f4-bs-calendar-nav');
  const prev=make('button','f4-bs-calendar-arrow'),title=make('strong','',months[month]+' '+year),next=make('button','f4-bs-calendar-arrow');
  prev.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:middle"><path d="m15 18-6-6 6-6"/></svg>';next.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:middle"><path d="m9 18 6-6-6-6"/></svg>';prev.type=next.type='button';prev.setAttribute('aria-label','Bulan sebelumnya');next.setAttribute('aria-label','Bulan berikutnya');
  prev.onclick=()=>{const d=new __f4.globals.Date(year,month-1,1);year=d.getFullYear();month=d.getMonth();draw()};
  next.onclick=()=>{const d=new __f4.globals.Date(year,month+1,1);year=d.getFullYear();month=d.getMonth();draw()};
  nav.append(prev,title,next);pop.append(nav);
  const grid=make('div','f4-bs-calendar-grid');
  weekdays.forEach(day=>grid.append(make('span','f4-bs-calendar-weekday',day)));
  const lead=new __f4.globals.Date(year,month,1).getDay();
  for(let j=0;j<lead;j++)grid.append(make('span','f4-bs-calendar-blank'));
  const total=new __f4.globals.Date(year,month+1,0).getDate();
  for(let day=1;day<=total;day++){
   const v=iso(year,month,day),b=make('button','f4-bs-calendar-day',(0,__f4.globals.String)(day));
   b.type='button';b.disabled=!valid(v);b.setAttribute('aria-label',day+' '+months[month]+' '+year);
   if(v===input.value)b.classList.add('is-selected');
   if(v===today())b.classList.add('is-today');
   b.onclick=()=>choose(v);grid.append(b);
  }
  pop.append(grid);
  const foot=make('div','f4-bs-calendar-footer');
  const now=make('button','f4-bs-calendar-today','Hari ini'),exit=make('button','f4-bs-calendar-close','Tutup');
  now.type=exit.type='button';now.disabled=!valid(today());now.onclick=()=>choose(today());exit.onclick=close;
  foot.append(now,exit);pop.append(foot);position();
 };
 button.onclick=()=>{
  if(pop){close();return}
  const current=valid(input.value)?input.value:today(),bits=current.split('-');
  year=(0,__f4.globals.Number)(bits[0]);month=(0,__f4.globals.Number)(bits[1])-1;
  pop=make('div','f4-bs-calendar-popup');pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Kalender tanggal setoran');
  __f4.globals.document.body.append(pop);button.setAttribute('aria-expanded','true');draw();
 };
 __f4.globals.document.addEventListener('pointerdown',e=>{if(pop&&!pop.contains(e.target)&&!button.contains(e.target))close()},true);
 __f4.globals.document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pop){e.preventDefault();close()}},true);
 (0,__f4.globals.addEventListener)('resize',position,{passive:true});
 (0,__f4.globals.addEventListener)('scroll',position,{capture:true,passive:true});
})();

});
