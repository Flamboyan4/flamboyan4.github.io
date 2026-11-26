/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/native-controls.js",function(__f4){


/* Flamboyan 4 native-control replacement on mobile.
   Keeps the original select/date/month elements for all existing form submissions. */
(()=>{
'use strict';
if(__f4.window.f4ModernControls)return;
const fields=new __f4.globals.WeakMap();
const isResident=field=>/^(setWarga|v9Member|pm-payer|(?:inp|edit|loan|tal|denda)-warga)$/i.test(field.id)||/^(resident_id|member_id|warga_id|payer_id)$/.test(field.name||'')||field.hasAttribute('data-f4-resident-picker');
function residentMeta(field,opt){
 const raw=(opt.textContent||'').replace(/\s*\(member:[^)]+\)/ig,'').trim();
 const match=raw.match(/(?:[—•-]\s*|\s+)([A-Z]\d{1,2}\s*\/\s*\d{1,3})\b/i);
 const residents=__f4.globals.DATA?.warga;
 const resident=Array.isArray(residents)?residents.find(x=>String(x.idWarga)===String(opt.value)):null;
 const name=opt.dataset.residentName||opt.dataset.fullName||resident?.nama||(match?raw.slice(0,match.index).trim():raw);
 const house=opt.dataset.residentHouse||(resident?[resident.blok,resident.noRumah].filter(Boolean).join('/'):'')||(match?match[1].replace(/\s/g,'').toUpperCase():'');
 return {name,house};
}
let overlay=null,historyToken=0;
const monthNames=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const fmtDate=value=>{
 const m=(0,__f4.globals.String)(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
 return m?(0,__f4.globals.Number)(m[3])+' '+monthNames[(0,__f4.globals.Number)(m[2])-1]+' '+m[1]:'Pilih tanggal';
};
function close(fromBack=false){
 if(!overlay)return;
 const last=overlay._trigger,stopPosition=overlay._stopPosition;
 stopPosition?.();
 overlay.remove();overlay=null;
 __f4.globals.document.body.classList.remove('f4-custom-picker-open');
 __f4.window.F4MobileSheets?.refresh?.();
 if(!fromBack&&__f4.globals.history.state?.f4PickerEntry)__f4.globals.history.back();
 last?.focus?.({preventScroll:true});
}
__f4.window.addEventListener('popstate',()=>{if(overlay)close(true)});
function start(trigger,title,dropdown=false,options={}){
 // Every portal uses the same anchored dropdown.
 const reuse=!!overlay;
 if(overlay)close(reuse);
 const mask=__f4.globals.document.createElement('div');mask.className='f4-control-overlay';mask.setAttribute('role','presentation');
 if(dropdown)mask.classList.add('f4-bank-select-dropdown');
 if(options.kind==='calendar')mask.classList.add('f4-bank-calendar-dropdown');
 const panel=__f4.globals.document.createElement('section');panel.className='f4-control-panel';
 panel.setAttribute('role',options.kind==='calendar'?'dialog':dropdown?'region':'dialog');
 if(!dropdown)panel.setAttribute('aria-modal','true');
 if(dropdown)panel.classList.add('f4-bank-select-popover');
 if(options.kind==='calendar')panel.classList.add('f4-bank-calendar-popover');
 panel.setAttribute('aria-label',title);
 const head=__f4.globals.document.createElement('header');head.className='f4-control-header';
 const h=__f4.globals.document.createElement('strong');h.textContent=title;
 const x=__f4.globals.document.createElement('button');x.type='button';x.className='f4-control-x';x.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
 x.setAttribute('aria-label','Tutup pilihan');x.onclick=()=>close();
 head.append(h,x);if(!dropdown)panel.append(head);mask.append(panel);
 mask.onclick=e=>{if(e.target===mask)close()};
 mask._trigger=trigger;mask._dropdown=dropdown;__f4.globals.document.body.append(mask);overlay=mask;
 if(dropdown){
  const position=()=>{
   if(!mask.isConnected)return;
   const r=trigger.getBoundingClientRect(),v=__f4.window.visualViewport;
   const left=v?.offsetLeft||0,top=v?.offsetTop||0;
   const vw=v?.width||__f4.globals.innerWidth,vh=v?.height||__f4.globals.innerHeight;
   const width=__f4.globals.Math.min(__f4.globals.Math.max(r.width,options.minWidth||0),__f4.globals.Math.max(0,vw-16));
   const x=__f4.globals.Math.max(left+8,__f4.globals.Math.min(r.left,left+vw-width-8));
   // Recalculate after options/calendar render. Never make the calendar as
   // narrow as its date input when the input occupies half a form row.
   panel.style.maxHeight='none';
   const natural=__f4.globals.Math.max(90,panel.scrollHeight);
   const desired=__f4.globals.Math.min(natural,options.kind==='calendar'?510:380);
   const below=__f4.globals.Math.max(0,top+vh-r.bottom-10);
   const above=__f4.globals.Math.max(0,r.top-top-10);
   const up=below<desired&&above>below;
   const maxHeight=__f4.globals.Math.max(90,__f4.globals.Math.min(desired,up?above:below,__f4.globals.Math.max(90,vh-16)));
   const y=up?__f4.globals.Math.max(top+8,r.top-maxHeight-6):__f4.globals.Math.min(top+vh-8-maxHeight,r.bottom+6);
   panel.style.left=x+'px';panel.style.width=width+'px';
   panel.style.maxHeight=maxHeight+'px';panel.style.top=__f4.globals.Math.max(top+8,y)+'px';
  };
  const onScroll=e=>{if(!mask.contains(e.target))position()};
  mask._reposition=position;
  mask._stopPosition=()=>{
   __f4.window.removeEventListener('resize',position);
   __f4.window.removeEventListener('scroll',onScroll,true);
   __f4.window.visualViewport?.removeEventListener('resize',position);
   __f4.window.visualViewport?.removeEventListener('scroll',position);
  };
  __f4.window.addEventListener('resize',position,{passive:true});
  __f4.window.addEventListener('scroll',onScroll,{passive:true,capture:true});
  __f4.window.visualViewport?.addEventListener('resize',position,{passive:true});
  __f4.window.visualViewport?.addEventListener('scroll',position,{passive:true});
  position();
 }
 __f4.globals.document.body.classList.add('f4-custom-picker-open');
 __f4.window.F4MobileSheets?.refresh?.();
 const state={...__f4.globals.history.state,f4PickerEntry:++historyToken};
 __f4.globals.history[reuse?'replaceState':'pushState'](state,'',__f4.globals.location.href);
 return panel;
}
function action(field,value){
 if(!field.isConnected)return;
 field.value=value;
 field.dispatchEvent(new __f4.globals.Event('input',{bubbles:true}));
 field.dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));
 close();
}
function selectPicker(field,trigger){
 const resident=isResident(field);
 const options=[...field.options].map(o=>({value:o.value,label:o.textContent,disabled:o.disabled||o.parentElement?.disabled,meta:resident&&o.value?residentMeta(field,o):null}));
 const dropdown=true;
 const goods=!!field.closest('#saleItems,#setBarang,#f4BankOwnLines');
 const panel=start(trigger,field.getAttribute('aria-label')||field.closest('label')?.querySelector('span')?.textContent||'Pilih pilihan',
  dropdown,{kind:'select',minWidth:resident?310:goods?300:options.length>10?276:0});
 if(resident||options.length>10){
  const searchRow=__f4.globals.document.createElement('div');searchRow.className='f4-bank-picker-search-row';
  const input=__f4.globals.document.createElement('input');input.type='search';input.className='f4-control-search';
  input.placeholder=resident?'Cari nama atau nomor rumah…':'Cari pilihan…';input.setAttribute('aria-label',resident?'Cari warga':'Cari pilihan');
  searchRow.append(input);panel.append(searchRow);
  input.oninput=()=>{paint(input.value);(0,__f4.globals.requestAnimationFrame)(()=>overlay?._reposition?.())};
 }
 const list=__f4.globals.document.createElement('div');list.className='f4-control-list';list.setAttribute('role','listbox');
 if(resident){const header=__f4.globals.document.createElement('div');header.className='f4-control-resident-head';header.innerHTML='<span>Nama warga</span><span>Rumah</span>';panel.append(header)}
 panel.append(list);
 function paint(q=''){
  list.replaceChildren();
  const matching=options.filter(o=>!q||[o.label,o.meta?.name,o.meta?.house].filter(Boolean).join(' ').toLocaleLowerCase('id-ID').includes(q.trim().toLocaleLowerCase('id-ID')));
  for(const o of matching){
   const b=__f4.globals.document.createElement('button');b.type='button';b.className='f4-control-choice';
   b.setAttribute('role','option');b.setAttribute('aria-selected',(0,__f4.globals.String)(o.value===field.value));
   b.disabled=o.disabled;
   const label=__f4.globals.document.createElement('span');label.textContent=o.label||'—';
   const mark=__f4.globals.document.createElement('span');mark.className='f4-control-check';
   mark.innerHTML=o.value===field.value?'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>':'';
   if(o.meta){label.className='f4-control-resident-row';label.textContent='';const name=__f4.globals.document.createElement('span');name.textContent=o.meta.name;const house=__f4.globals.document.createElement('span');house.textContent=o.meta.house||'—';label.append(name,house)}
   b.append(label,mark);b.onclick=()=>action(field,o.value);list.append(b);
  }
  if(!matching.length){const p=__f4.globals.document.createElement('p');p.className='f4-control-empty';p.textContent='Tidak ada pilihan cocok';list.append(p)}
 }
 paint();
 if(dropdown)(0,__f4.globals.requestAnimationFrame)(()=>overlay?._reposition?.());
 const current=list.querySelector('[aria-selected=true]');
 // Never scroll the document to a fixed dropdown or force the Android
 // keyboard when the user merely opens a choice list.
 if(current)list.scrollTop=__f4.globals.Math.max(0,current.offsetTop-list.offsetTop-8);

}
function formatValue(field){
 if(field.type==='month'){
  const m=(0,__f4.globals.String)(field.value||'').match(/^(\d{4})-(\d{2})$/);
  return m?monthNames[(0,__f4.globals.Number)(m[2])-1]+' '+m[1]:'Pilih bulan';
 }
 if(field.type==='date'&&/^f4BankReport(?:From|To)$/.test(field.id)){
  const m=(0,__f4.globals.String)(field.value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?(0,__f4.globals.Number)(m[3])+' '+monthNames[(0,__f4.globals.Number)(m[2])-1].slice(0,3)+' '+m[1]:'Pilih tanggal';
 }
 return fmtDate(field.value);
}
function calendar(field,trigger,settings={}){
 const kind=settings.kind|| (field.type==='month'?'month':'date');
 let y,m;
 const match=(0,__f4.globals.String)(field.value||'').match(/^(\d{4})-(\d{2})/);
 if(match){y=(0,__f4.globals.Number)(match[1]);m=(0,__f4.globals.Number)(match[2])-1}
 else{const now=new __f4.globals.Date();y=now.getFullYear();m=now.getMonth()}
 const anchored=true;
 const panel=start(trigger,kind==='month'?'Pilih bulan':'Pilih tanggal',anchored,
  {kind:'calendar',minWidth:318});
 const nav=__f4.globals.document.createElement('div');nav.className='f4-control-calendar-nav';
 const prev=__f4.globals.document.createElement('button');prev.type='button';prev.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';prev.setAttribute('aria-label','Bulan atau tahun sebelumnya');
 const heading=__f4.globals.document.createElement('button');heading.type='button';heading.className='f4-control-calendar-title';heading.setAttribute('aria-label','Pilih bulan atau tahun');
 const next=__f4.globals.document.createElement('button');next.type='button';next.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';next.setAttribute('aria-label','Bulan atau tahun berikutnya');
 nav.append(prev,heading,next);panel.append(nav);
 const grid=__f4.globals.document.createElement('div');grid.className='f4-control-calendar';
 panel.append(grid);
 const input=__f4.globals.document.createElement('input');input.type='text';input.className='f4-control-date-input';
 input.placeholder=kind==='month'?'YYYY-MM':'YYYY-MM-DD';input.setAttribute('aria-label','Masukkan tanggal manual');
 input.value=field.value;panel.append(input);
 const footer=__f4.globals.document.createElement('div');footer.className='f4-control-footer';
 const cancel=__f4.globals.document.createElement('button');cancel.type='button';cancel.textContent='Batal';cancel.onclick=()=>close();
 const accept=__f4.globals.document.createElement('button');accept.type='button';accept.textContent='Terapkan';
 accept.onclick=()=>{const v=input.value.trim();if(valid(v)){action(field,v)}else{input.setCustomValidity('Masukkan tanggal yang benar');input.reportValidity();input.setCustomValidity('')}};
 if(settings.allowClear){const clear=__f4.globals.document.createElement('button');clear.type='button';clear.textContent='Semua tanggal';clear.onclick=()=>action(field,'');footer.append(clear)}
 footer.append(cancel,accept);panel.append(footer);
 let mode=kind==='month'?'month':'day';
 function valid(v){
  if(kind==='month'){
   if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(v))return false;
  }else{
   const mt=v.match(/^(\d{4})-(\d\d)-(\d\d)$/);
   if(!mt)return false;
   const d=new __f4.globals.Date((0,__f4.globals.Number)(mt[1]),(0,__f4.globals.Number)(mt[2])-1,(0,__f4.globals.Number)(mt[3]));
   if(d.getFullYear()!==(0,__f4.globals.Number)(mt[1])||d.getMonth()+1!==(0,__f4.globals.Number)(mt[2])||d.getDate()!==(0,__f4.globals.Number)(mt[3]))return false;
  }
  if(field.min&&v<field.min)return false;
  if(field.max&&v>field.max)return false;
  return true;
 }
 function render(){
  grid.replaceChildren();
  heading.textContent=kind==='month'?(0,__f4.globals.String)(y):monthNames[m]+' '+y;
  grid.classList.toggle('f4-month-choice',mode!=='day');
  if(mode==='year'){
   const startYear=Math.floor(y/12)*12;heading.textContent=startYear+' – '+(startYear+11);grid.classList.add('f4-month-choice');
   for(let yr=startYear;yr<startYear+12;yr++){const b=__f4.globals.document.createElement('button');b.type='button';b.className='f4-control-day';b.textContent=String(yr);if(yr===y)b.classList.add('selected');b.onclick=()=>{y=yr;mode='month';render()};grid.append(b)}
   (0,__f4.globals.requestAnimationFrame)(()=>overlay?._reposition?.());return;
  }
  if(mode==='month'){
   heading.textContent=String(y);grid.classList.add('f4-month-choice');
   monthNames.forEach((name,index)=>{
    const v=y+'-'+(0,__f4.globals.String)(index+1).padStart(2,'0');
    const b=__f4.globals.document.createElement('button');b.type='button';b.textContent=name.slice(0,3);
    b.className='f4-control-day';b.disabled=kind==='month'&&!valid(v);
    if(field.value===v)b.classList.add('selected');
    b.onclick=()=>{if(kind==='month'){input.value=v;action(field,v)}else{m=index;mode='day';render()}};grid.append(b);
   });
   if(anchored)(0,__f4.globals.requestAnimationFrame)(()=>overlay?._reposition?.());
   return;
  }
  const weekdays=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  weekdays.forEach(d=>{const span=__f4.globals.document.createElement('span');span.className='f4-control-weekday';span.textContent=d;grid.append(span)});
  const lead=new __f4.globals.Date(y,m,1).getDay();
  for(let i=0;i<lead;i++)grid.append(__f4.globals.document.createElement('span'));
  const total=new __f4.globals.Date(y,m+1,0).getDate();
  for(let day=1;day<=total;day++){
   const v=y+'-'+(0,__f4.globals.String)(m+1).padStart(2,'0')+'-'+(0,__f4.globals.String)(day).padStart(2,'0');
   const b=__f4.globals.document.createElement('button');b.type='button';b.className='f4-control-day';b.textContent=(0,__f4.globals.String)(day);
   b.disabled=!valid(v);if(field.value===v)b.classList.add('selected');
   b.onclick=()=>action(field,v);grid.append(b);
  }
  if(anchored)(0,__f4.globals.requestAnimationFrame)(()=>overlay?._reposition?.());
 }
 heading.onclick=()=>{mode=mode==='day'?'month':mode==='month'?'year':kind==='month'?'month':'day';render()};
 prev.onclick=()=>{if(mode==='year')y-=12;else if(mode==='month')y--;else{m--;if(m<0){m=11;y--}}render()};
 next.onclick=()=>{if(mode==='year')y+=12;else if(mode==='month')y++;else{m++;if(m>11){m=0;y++}}render()};
 render();
}
function enhance(field){
 if(fields.has(field)){fields.get(field)();return}
 if(field.closest('.f4-warga-picker,.f4-control-overlay,.v18-custom-select,[data-f4-picker-skip],.mdc-wrap,.custom-select-wrap')||field.dataset.noCustom==='1')return;
 if(field.matches('select')){if(field.multiple||field.size>1)return}
 else if(!field.matches('input[type=date],input[type=month]'))return;
 field.dataset.f4ModernPicker='1';
 const button=__f4.globals.document.createElement('button');button.type='button';button.className='f4-control-trigger';
 const label=__f4.globals.document.createElement('span');label.className='f4-control-value';
 const icon=__f4.globals.document.createElement('span');icon.className='f4-control-icon';icon.innerHTML=field.matches('select')?'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>':'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></svg>';
 button.append(label,icon);button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',field.getAttribute('aria-label')||field.labels?.[0]?.textContent?.trim()||'Pilih');
 function sync(){
  if(!field.isConnected||!button.isConnected)return;
  button.disabled=field.disabled;button.hidden=field.hidden||field.classList.contains('hidden')||field.style.display==='none';
  const option=field.selectedOptions?.[0];
  const meta=option?.value&&isResident(field)?residentMeta(field,option):null;
  label.textContent=meta?[meta.name,meta.house].filter(Boolean).join(' · '):field.matches('select')?(option?.textContent||'Pilih'):formatValue(field);
  button.title=label.textContent;
 }
 button.onclick=()=>{sync();if(field.disabled)return;field.matches('select')?selectPicker(field,button):calendar(field,button)};
 button.addEventListener('focus',sync);
 field.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();button.click()},true);
 field.addEventListener('change',sync);field.addEventListener('input',sync);
 const m=new __f4.globals.MutationObserver(sync);m.observe(field,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','selected','class','hidden','style','value']});
 if(__f4.globals.document.body.classList.contains('f4-direct-book')&&field.matches('select.field')){
  const wrap=__f4.globals.document.createElement('div');wrap.className='custom-select-wrap';field.before(wrap);wrap.append(field,button);
 }else{field.insertAdjacentElement('afterend',button)}
 field.classList.add('f4-modern-native-hidden');field.tabIndex=-1;fields.set(field,sync);sync();
}
function scan(){__f4.globals.document.querySelectorAll('select,input[type=date],input[type=month]').forEach(enhance)}
let pending=false;function schedule(){
 if(pending)return;pending=true;(0,__f4.globals.requestAnimationFrame)(()=>{pending=false;scan()});
}
if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new __f4.globals.MutationObserver(ms=>{
 if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('select,input,form')||n.querySelector?.('select,input[type=date],input[type=month]')))))schedule();
}).observe(__f4.globals.document.documentElement,{childList:true,subtree:true});
__f4.window.f4ModernControls={scan,close,openDate:calendar};
__f4.cleanup(()=>{if(overlay){overlay.remove();overlay=null;__f4.globals.document.body.classList.remove('f4-custom-picker-open')}});
__f4.globals.document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay){e.preventDefault();close()}});
})();

});
