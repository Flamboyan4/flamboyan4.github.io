/* Flamboyan 4 — responsive records for Bank Sampah and Superadmin.
   Presentational only: leaves row data, links, buttons and API payloads intact. */
(()=>{
 'use strict';
 const selectors='#f4-account-page table, #dashboardView table, #v11Public table';
 const excluded='#v10Print,#v27PrintReport,#v25PrintReport,#f4-superadmin-confirm,[data-print-only]';
 function enhance(){
  document.querySelectorAll(selectors).forEach(table=>{
   if(table.closest(excluded))return;
   table.classList.add('f4-mobile-card-table');
   const headings=[...table.querySelectorAll(':scope > thead > tr:first-child > th')].map(h=>h.textContent.trim());
   const tbody=table.tBodies[0];if(!tbody)return;
   for(const row of tbody.rows){
    const cells=[...row.cells].filter(c=>!c.classList.contains('f4-card-expand'));
    if(!cells.length||cells.some(c=>c.colSpan>1))continue;
    cells.forEach((td,i)=>{
     if(!td.dataset.label)td.dataset.label=headings[i]||'Detail';
    });
    if(cells.length<=4||row.querySelector('.f4-card-expand'))continue;
    const extra=document.createElement('td');extra.className='f4-card-expand';
    const toggle=document.createElement('button');toggle.type='button';
    toggle.className='f4-card-detail-toggle';toggle.textContent='Lihat rincian';
    toggle.setAttribute('aria-expanded','false');
    toggle.addEventListener('click',()=>{
     const expanded=row.classList.toggle('f4-card-expanded');
     toggle.textContent=expanded?'Tutup rincian':'Lihat rincian';
     toggle.setAttribute('aria-expanded',String(expanded));
    });
    extra.append(toggle);row.append(extra);
   }
  });
 }
 let scheduled=false;
 function requestEnhance(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;enhance()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',requestEnhance,{once:true});
 else requestEnhance();
 new MutationObserver(records=>{
  if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(
   n.matches?.('table,tbody,tr,thead,#f4-account-page,#dashboardView,#v11Public')||
   n.querySelector?.('table,tbody,tr')))))requestEnhance();
 }).observe(document.documentElement,{childList:true,subtree:true});
})();
