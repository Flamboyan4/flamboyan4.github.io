/* Flamboyan 4 native-control replacement on mobile.
   Keeps the original select/date/month elements for all existing form submissions. */
(()=>{
'use strict';
if(window.f4ModernControls)return;
const small=()=>matchMedia('(max-width:760px)').matches;
let overlay=null,historyToken=0;
const monthNames=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const fmtDate=value=>{
 const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
 return m?Number(m[3])+' '+monthNames[Number(m[2])-1]+' '+m[1]:'Pilih tanggal';
};
function close(fromBack=false){
 if(!overlay)return;
 const last=overlay._trigger;
 overlay.remove();overlay=null;
 document.body.classList.remove('f4-custom-picker-open');
 if(!fromBack&&history.state?.f4PickerEntry)history.back();
 last?.focus?.({preventScroll:true});
}
window.addEventListener('popstate',()=>{if(overlay&&!history.state?.f4PickerEntry)close(true)});
function start(trigger,title){
 if(overlay)close();
 const mask=document.createElement('div');mask.className='f4-control-overlay';mask.setAttribute('role','presentation');
 const panel=document.createElement('section');panel.className='f4-control-panel';
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
 panel.setAttribute('aria-label',title);
 const head=document.createElement('header');head.className='f4-control-header';
 const h=document.createElement('strong');h.textContent=title;
 const x=document.createElement('button');x.type='button';x.className='f4-control-x';x.textContent='✕';
 x.setAttribute('aria-label','Tutup pilihan');x.onclick=()=>close();
 head.append(h,x);panel.append(head);mask.append(panel);
 mask.onclick=e=>{if(e.target===mask)close()};
 mask._trigger=trigger;document.body.append(mask);overlay=mask;
 document.body.classList.add('f4-custom-picker-open');
 history.pushState({...history.state,f4PickerEntry:++historyToken},'',location.href);
 return panel;
}
function action(field,value){
 if(!field.isConnected)return;
 field.value=value;
 field.dispatchEvent(new Event('input',{bubbles:true}));
 field.dispatchEvent(new Event('change',{bubbles:true}));
 close();
}
function selectPicker(field,trigger){
 const options=[...field.options].map(o=>({value:o.value,label:o.textContent,disabled:o.disabled,group:o.parentElement?.label||''}));
 const panel=start(trigger,field.getAttribute('aria-label')||field.closest('label')?.querySelector('span')?.textContent||'Pilih pilihan');
 if(options.length>10){
  const input=document.createElement('input');input.type='search';input.className='f4-control-search';
  input.placeholder='Cari pilihan…';input.setAttribute('aria-label','Cari pilihan');
  panel.append(input);
  input.oninput=()=>paint(input.value);
 }
 const list=document.createElement('div');list.className='f4-control-list';list.setAttribute('role','listbox');
 panel.append(list);
 function paint(q=''){
  list.replaceChildren();
  const matching=options.filter(o=>!q||o.label.toLocaleLowerCase('id-ID').includes(q.toLocaleLowerCase('id-ID')));
  for(const o of matching){
   const b=document.createElement('button');b.type='button';b.className='f4-control-choice';
   b.setAttribute('role','option');b.setAttribute('aria-selected',String(o.value===field.value));
   b.disabled=o.disabled;
   const label=document.createElement('span');label.textContent=o.label||'—';
   const mark=document.createElement('span');mark.className='f4-control-check';
   mark.textContent=o.value===field.value?'✓':'';
   b.append(label,mark);b.onclick=()=>action(field,o.value);list.append(b);
  }
  if(!matching.length){const p=document.createElement('p');p.className='f4-control-empty';p.textContent='Tidak ada pilihan cocok';list.append(p)}
 }
 paint();
 const current=list.querySelector('[aria-selected=true]');
 current?.scrollIntoView?.({block:'nearest'});
 panel.querySelector('.f4-control-search')?.focus();
}
function formatValue(field){
 if(field.type==='month'){
  const m=String(field.value||'').match(/^(\d{4})-(\d{2})$/);
  return m?monthNames[Number(m[2])-1]+' '+m[1]:'Pilih bulan';
 }
 return fmtDate(field.value);
}
function calendar(field,trigger){
 const kind=field.type;const hasValue=!!field.value;
 let y,m;
 const match=String(field.value||'').match(/^(\d{4})-(\d{2})/);
 if(match){y=Number(match[1]);m=Number(match[2])-1}
 else{const now=new Date();y=now.getFullYear();m=now.getMonth()}
 const panel=start(trigger,kind==='month'?'Pilih bulan':'Pilih tanggal');
 const nav=document.createElement('div');nav.className='f4-control-calendar-nav';
 const prev=document.createElement('button');prev.type='button';prev.textContent='‹';prev.setAttribute('aria-label','Bulan atau tahun sebelumnya');
 const heading=document.createElement('strong');
 const next=document.createElement('button');next.type='button';next.textContent='›';next.setAttribute('aria-label','Bulan atau tahun berikutnya');
 nav.append(prev,heading,next);panel.append(nav);
 const grid=document.createElement('div');grid.className='f4-control-calendar';
 panel.append(grid);
 const input=document.createElement('input');input.type='text';input.className='f4-control-date-input';
 input.placeholder=kind==='month'?'YYYY-MM':'YYYY-MM-DD';input.setAttribute('aria-label','Masukkan tanggal manual');
 input.value=field.value;panel.append(input);
 const footer=document.createElement('div');footer.className='f4-control-footer';
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Batal';cancel.onclick=()=>close();
 const accept=document.createElement('button');accept.type='button';accept.textContent='Terapkan';
 accept.onclick=()=>{const v=input.value.trim();if(valid(v)){action(field,v)}else{input.setCustomValidity('Masukkan tanggal yang benar');input.reportValidity();input.setCustomValidity('')}};
 footer.append(cancel,accept);panel.append(footer);
 function valid(v){
  if(kind==='month'){
   if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(v))return false;
  }else{
   const mt=v.match(/^(\d{4})-(\d\d)-(\d\d)$/);
   if(!mt)return false;
   const d=new Date(Number(mt[1]),Number(mt[2])-1,Number(mt[3]));
   if(d.getFullYear()!==Number(mt[1])||d.getMonth()+1!==Number(mt[2])||d.getDate()!==Number(mt[3]))return false;
  }
  if(field.min&&v<field.min)return false;
  if(field.max&&v>field.max)return false;
  return true;
 }
 function render(){
  grid.replaceChildren();
  heading.textContent=kind==='month'?String(y):monthNames[m]+' '+y;
  grid.classList.toggle('f4-month-choice',kind==='month');
  if(kind==='month'){
   monthNames.forEach((name,index)=>{
    const v=y+'-'+String(index+1).padStart(2,'0');
    const b=document.createElement('button');b.type='button';b.textContent=name.slice(0,3);
    b.className='f4-control-day';b.disabled=!valid(v);
    if(field.value===v)b.classList.add('selected');
    b.onclick=()=>{input.value=v;action(field,v)};grid.append(b);
   });
   return;
  }
  const weekdays=['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  weekdays.forEach(d=>{const span=document.createElement('span');span.className='f4-control-weekday';span.textContent=d;grid.append(span)});
  const lead=(new Date(y,m,1).getDay()+6)%7;
  for(let i=0;i<lead;i++)grid.append(document.createElement('span'));
  const total=new Date(y,m+1,0).getDate();
  for(let day=1;day<=total;day++){
   const v=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
   const b=document.createElement('button');b.type='button';b.className='f4-control-day';b.textContent=String(day);
   b.disabled=!valid(v);if(field.value===v)b.classList.add('selected');
   b.onclick=()=>action(field,v);grid.append(b);
  }
 }
 prev.onclick=()=>{if(kind==='month')y--;else{m--;if(m<0){m=11;y--}}render()};
 next.onclick=()=>{if(kind==='month')y++;else{m++;if(m>11){m=0;y++}}render()};
 render();
}
function enhance(field){
 if(field.dataset.f4ModernPicker)return;
 if(field.closest('.f4-warga-picker,.f4-control-overlay,.v18-custom-select,[data-f4-picker-skip]'))return;
 if(field.matches('select')){
  if(field.multiple||field.size>1)return;
 }else if(!field.matches('input[type=date],input[type=month]'))return;
 field.dataset.f4ModernPicker='1';
 const button=document.createElement('button');button.type='button';button.className='f4-control-trigger';
 button.setAttribute('aria-haspopup','dialog');
 function sync(){
  if(!field.isConnected||!button.isConnected)return;
  button.disabled=field.disabled;
  button.textContent=field.matches('select')?(field.selectedOptions[0]?.textContent||'Pilih') : formatValue(field);
  if(field.matches('select'))button.title=button.textContent;
 }
 button.onclick=()=>{
  sync();if(!small()||field.disabled)return;
  field.matches('select')?selectPicker(field,button):calendar(field,button);
 };
 button.addEventListener('focus',sync);
 // A click on an associated <label> normally opens Android's native picker.
 // Cancel the synthetic click and send it to our accessible website dialog.
 field.addEventListener('click',e=>{
  if(!small())return;
  e.preventDefault();e.stopImmediatePropagation();
  button.click();
 },true);
 field.addEventListener('change',sync);
 field.addEventListener('input',sync);
 const m=new MutationObserver(sync);m.observe(field,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','selected']});
 field.insertAdjacentElement('afterend',button);
 field.classList.add('f4-modern-native-hidden');sync();
}
function scan(){
 if(!small())return;
 document.querySelectorAll('select,input[type=date],input[type=month]').forEach(enhance);
}
let pending=false;function schedule(){
 if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;scan()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(ms=>{
 if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('select,input,form')||n.querySelector?.('select,input[type=date],input[type=month]')))))schedule();
}).observe(document.documentElement,{childList:true,subtree:true});
window.f4ModernControls={scan,close};
})();
