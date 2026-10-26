/* Flamboyan 4 mobile record cards — accessibility and data preserved.
   Uses table headers, never changes API identifiers or event handlers. */
(()=>{
 'use strict';
 const selector='#f4-account-page table, #dashboardView table, #v11Public table';
 const excluded='#v10Print,#v27PrintReport,#v25PrintReport,#f4-superadmin-confirm,[data-print-only]';
 const icons={
  detail:'<path d="m6 9 6 6 6-6"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  reset:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7"/>',
  deactivate:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M17 8h5"/>',
  activate:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 10 2 2 4-4"/>',
  handover:'<path d="M16 3h5v5"/><path d="m21 3-6 6"/><path d="M8 7a4 4 0 1 0 0 8"/><path d="M2 21a6 6 0 0 1 9.8-4.6"/><path d="M16 17h6"/><path d="m19 14 3 3-3 3"/>',
  delete:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/>',
  cancel:'<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  settings:'<path d="M12 3v2m0 14v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M3 12h2m14 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/><circle cx="12" cy="12" r="4"/>',
  view:'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>'
 };
 function icon(name){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','19');svg.setAttribute('height','19');
  svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
  svg.setAttribute('stroke-width','1.9');svg.setAttribute('stroke-linecap','round');
  svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  svg.innerHTML=icons[name]||icons.view;
  return svg;
 }
 function iconName(label){
  const s=label.toLowerCase();
  if(s.includes('reset')||s.includes('password'))return'reset';
  if(s.includes('penghuni'))return'handover';
  if(s.includes('nonaktif')||s.includes('blokir'))return'deactivate';
  if(s.includes('aktifkan')||s.includes('siapkan akun'))return'activate';
  if(s.includes('hapus'))return'delete';
  if(s.includes('batal'))return'cancel';
  if(s.includes('edit')||s.includes('ubah'))return'edit';
  if(s.includes('tarif')||s.includes('atur'))return'settings';
  if(s.includes('detail')||s.includes('rincian'))return'view';
  return null;
 }
 function enhanceButton(btn){
  if(btn.dataset.f4Iconified==='1'||btn.querySelector('svg'))return;
  const label=btn.textContent.trim().replace(/\s+/g,' ');
  const glyph=iconName(label);
  if(!glyph)return;
  const text=document.createElement('span');text.className='f4-action-label';text.textContent=label;
  btn.replaceChildren(icon(glyph),text);
  btn.classList.add('f4-icon-action');btn.dataset.f4Iconified='1';
  btn.title=btn.title||label;btn.setAttribute('aria-label',label);
 }
 function isValue(cell){
  const text=String(cell.textContent||'').trim();
  return !!(text&&!/^(—|-|kosong|belum ada|tidak tersedia|n\/a)$/i.test(text))||!!cell.querySelector('a,input,select,textarea');
 }
 function enhance(){
  document.querySelectorAll(selector).forEach(table=>{
   if(table.closest(excluded))return;
   table.classList.add('f4-mobile-card-table');
   const headings=[...table.querySelectorAll(':scope > thead > tr:first-child > th')]
    .map(h=>h.textContent.trim());
   const tbody=table.tBodies[0];if(!tbody)return;
   for(const row of tbody.rows){
    if(row.dataset.f4CardEnhanced==='1')continue;
    const cells=[...row.cells].filter(c=>!c.classList.contains('f4-card-expand'));
    if(!cells.length||cells.some(c=>c.colSpan>1))continue;
    cells.forEach((td,i)=>{if(!td.dataset.label)td.dataset.label=headings[i]||'Detail';});
    // Two core fields, status, money, and action remain visible without opening.
    const primary=new Set([0,1]);
    const hasAction=(cells.length>0&&/^(aksi|tindakan|actions?)$/i.test(headings[cells.length-1]||''));
    if(hasAction)primary.add(cells.length-1);
    const statusIdx=headings.findIndex(h=>/\bstatus\b/i.test(h));
    if(statusIdx>=0)primary.add(statusIdx);
    const amountIdx=headings.findIndex(h=>/estimasi|saldo|nominal|nilai|jumlah uang|total bayar/i.test(h));
    if(amountIdx>=0)primary.add(amountIdx);
    // Residents need home + occupancy summary; contact / notes are optional.
    if(table.classList.contains('sa-resident-grid'))primary.add(2);
    // Catalog with <=4 fields stays fully visible, without a redundant detail button.
    if(cells.length<=4)cells.forEach((_,i)=>primary.add(i));
    let extraCount=0;
    cells.forEach((td,i)=>{
     if(hasAction&&i===cells.length-1){
      td.classList.add('f4-card-action');
      td.querySelectorAll('button').forEach(enhanceButton);
      return;
     }
     if(primary.has(i))return;
     if(isValue(td)){td.classList.add('f4-card-secondary');extraCount++;}
     else td.classList.add('f4-card-empty');
    });
    row.dataset.f4CardEnhanced='1';
    if(!extraCount)return; // No actual detail to expand.
    const extra=document.createElement('td');extra.className='f4-card-expand';
    const toggle=document.createElement('button');toggle.type='button';
    toggle.className='f4-card-detail-toggle';
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Lihat rincian');toggle.title='Lihat rincian';
    toggle.append(icon('detail'));
    toggle.addEventListener('click',()=>{
     const expanded=row.classList.toggle('f4-card-expanded');
     toggle.setAttribute('aria-expanded',String(expanded));
     toggle.setAttribute('aria-label',expanded?'Tutup rincian':'Lihat rincian');
     toggle.title=expanded?'Tutup rincian':'Lihat rincian';
    });
    extra.append(toggle);row.append(extra);
   }
  });
 }
 let pending=false;
 function schedule(){
  if(pending)return;pending=true;
  requestAnimationFrame(()=>{pending=false;enhance()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
 else schedule();
 new MutationObserver(records=>{
  if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(
   n.matches?.('table,tbody,tr,thead,#f4-account-page,#dashboardView,#v11Public')||
   n.querySelector?.('table,tbody,tr')))))schedule();
 }).observe(document.documentElement,{childList:true,subtree:true});
})();
