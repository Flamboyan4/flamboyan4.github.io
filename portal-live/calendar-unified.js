/* Uniform Indonesian custom date/month picker for OFFLINE preview. No backend access. */
(()=>{'use strict';
  const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const days=['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  let input=null,viewYear=0,viewMonth=0,pop=null;
  const two=n=>String(n).padStart(2,'0');
  const localToday=()=>{const d=new Date();return d.getFullYear()+'-'+two(d.getMonth()+1)+'-'+two(d.getDate())};
  const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
  const style=document.createElement('style');
  style.textContent=[
   'input.f4-date-target{cursor:pointer!important;caret-color:transparent}',
   'input.f4-date-target::-webkit-calendar-picker-indicator{pointer-events:none;opacity:.65}',
   '.f4-calendar{position:fixed;z-index:999999;min-width:288px;width:304px;max-width:calc(100vw - 20px);border:1px solid #dcd3fc;background:white;color:#261b45;border-radius:16px;padding:14px;box-shadow:0 18px 55px #210e493b;font:13px system-ui,-apple-system,Segoe UI,sans-serif}',
   '.f4-calendar *{box-sizing:border-box}', '.f4-cal-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}',
   '.f4-cal-head strong{font-size:14px;font-weight:750;color:#4f23a0;text-align:center}',
   '.f4-cal-btn{border:0!important;background:#f4f0ff!important;color:#5c26b0!important;border-radius:9px!important;width:35px;height:35px;padding:0!important;display:grid!important;place-items:center;font:700 19px system-ui!important;cursor:pointer}',
   '.f4-cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}',
   '.f4-cal-dayhead{font-size:11px;font-weight:700;color:#77809b;text-align:center;padding:8px 0}',
   '.f4-cal-cell{font:600 12px system-ui!important;min-height:35px!important;background:transparent!important;border:0!important;border-radius:10px!important;padding:0!important;color:#25233c!important;cursor:pointer}',
   '.f4-cal-cell:hover{background:#eee7ff!important}', '.f4-cal-cell.f4-selected{background:#7433ef!important;color:white!important}',
   '.f4-cal-cell.f4-out{color:#adb2c3!important}', '.f4-cal-cell.f4-today{outline:1px solid #8a5bff;outline-offset:-2px}',
   '.f4-cal-cell:disabled{opacity:.23;cursor:not-allowed}',
   '.f4-cal-months{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}',
   '.f4-cal-month{font:600 12px system-ui!important;border-radius:10px!important;padding:11px 5px!important;background:#f7f4ff!important;color:#47326d!important;border:0!important;cursor:pointer}',
   '.f4-cal-month.f4-selected{background:#7433ef!important;color:white!important}',
   '.f4-cal-foot{margin-top:12px;border-top:1px solid #eee8fc;padding-top:10px;display:flex;justify-content:space-between;gap:8px}',
   '.f4-cal-foot button{padding:7px 11px!important;border-radius:9px!important;background:#f2edff!important;color:#5329a6!important;border:0!important;font:650 12px system-ui!important;cursor:pointer}'
  ].join('');
  document.head.append(style);
  const inRange=value=>{
    if(!input)return false;
    const min=input.getAttribute('min'),max=input.getAttribute('max');
    return !(min&&value<min)&&!(max&&value>max);
  };
  function choose(value){
    if(!input||!inRange(value))return;
    const target=input;
    target.value=value;
    target.dispatchEvent(new Event('input',{bubbles:true}));
    target.dispatchEvent(new Event('change',{bubbles:true}));
    hide();target.focus({preventScroll:true});
  }
  function hide(){pop?.remove();pop=null;input=null}
  function position(){
    if(!input||!pop)return;const rect=input.getBoundingClientRect(),w=Math.min(304,innerWidth-20);
    const bottom=Math.max(0,innerHeight-rect.bottom),top=Math.max(0,rect.top);
    const expected=input.type==='month'?260:347;
    pop.style.width=w+'px';pop.style.left=Math.max(10,Math.min(rect.left,innerWidth-w-10))+'px';
    pop.style.top=bottom>=expected||bottom>=top?Math.min(innerHeight-10,rect.bottom+7)+'px':Math.max(10,rect.top-expected-7)+'px';
  }
  function draw(){
    if(!pop||!input)return;pop.replaceChildren();
    const head=mk('div','f4-cal-head'),prev=mk('button','f4-cal-btn','‹'),next=mk('button','f4-cal-btn','›');
    prev.type=next.type='button';prev.setAttribute('aria-label','Bulan sebelumnya');next.setAttribute('aria-label','Bulan berikutnya');
    const monthMode=input.type==='month',title=mk('strong','',monthMode?String(viewYear):months[viewMonth]+' '+viewYear);
    prev.onclick=()=>{if(monthMode)viewYear--;else {viewMonth--;if(viewMonth<0){viewMonth=11;viewYear--}}draw()};
    next.onclick=()=>{if(monthMode)viewYear++;else {viewMonth++;if(viewMonth>11){viewMonth=0;viewYear++}}draw()};
    head.append(prev,title,next);pop.append(head);
    if(monthMode){
      const grid=mk('div','f4-cal-months');for(let m=0;m<12;m++){
       const val=viewYear+'-'+two(m+1),btn=mk('button','f4-cal-month'+(input.value===val?' f4-selected':''),months[m].slice(0,3));
       btn.type='button';btn.disabled=!inRange(val);btn.onclick=()=>choose(val);btn.setAttribute('aria-label',months[m]+' '+viewYear);grid.append(btn);
      }pop.append(grid);
    }else{
      const grid=mk('div','f4-cal-grid');
      for(const day of days)grid.append(mk('span','f4-cal-dayhead',day));
      const first=new Date(viewYear,viewMonth,1),shift=(first.getDay()+6)%7;
      for(let i=0;i<42;i++){
        const date=new Date(viewYear,viewMonth,1-shift+i),iso=date.getFullYear()+'-'+two(date.getMonth()+1)+'-'+two(date.getDate());
        const out=date.getMonth()!==viewMonth;
        const btn=mk('button','f4-cal-cell'+(out?' f4-out':'')+(input.value===iso?' f4-selected':'')+(localToday()===iso?' f4-today':''),String(date.getDate()));
        btn.type='button';btn.disabled=!inRange(iso);btn.setAttribute('aria-label',iso);btn.onclick=()=>choose(iso);grid.append(btn);
      }pop.append(grid);
    }
    const foot=mk('div','f4-cal-foot'),todayBtn=mk('button','',monthMode?'Bulan ini':'Hari ini'),close=mk('button','','Tutup');
    todayBtn.type=close.type='button';const value=localToday().slice(0,monthMode?7:10);
    todayBtn.disabled=!inRange(value);todayBtn.onclick=()=>choose(value);close.onclick=hide;foot.append(todayBtn,close);pop.append(foot);position();
  }
  function open(target){
    if(input===target&&pop)return;
    hide();input=target;input.readOnly=true;input.classList.add('f4-date-target');
    const value=input.value||localToday(),parts=value.split('-');
    viewYear=Number(parts[0])||new Date().getFullYear();viewMonth=Math.max(0,Math.min(11,Number(parts[1]||1)-1));
    pop=mk('section','f4-calendar');pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Kalender pilihan tanggal');
    document.body.append(pop);draw();
  }
  document.addEventListener('pointerdown',e=>{
    const target=e.target.closest?.('input[type="date"],input[type="month"]');
    if(target){e.preventDefault();open(target);return}
    if(pop&&!pop.contains(e.target))hide();
  },true);
  document.addEventListener('focusin',e=>{
    const target=e.target.closest?.('input[type="date"],input[type="month"]');
    if(target){target.readOnly=true;target.classList.add('f4-date-target')}
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&pop){hide();return}
    if(e.target.matches?.('input[type="date"],input[type="month"]')&&['Enter',' ','ArrowDown'].includes(e.key)){e.preventDefault();open(e.target)}
  },true);
  addEventListener('resize',position);addEventListener('scroll',position,true);
})();