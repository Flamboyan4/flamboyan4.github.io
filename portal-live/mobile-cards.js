/* Flamboyan 4: compact mobile records, no changes to API or callbacks. */
(()=>{
'use strict';
const ico={
 detail:'<path d="m9 18 6-6-6-6"/>',
 edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2 2 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
 reset:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7"/>',
 deactivate:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M17 8h5"/>',
 activate:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 10 2 2 4-4"/>',
 handover:'<path d="M16 3h5v5"/><path d="m21 3-6 6"/><path d="M8 7a4 4 0 1 0 0 8"/><path d="M2 21a6 6 0 0 1 9.8-4.6"/><path d="m16 16 3 3 3-3"/>',
 delete:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5m4-5v5"/>',
 cancel:'<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
 view:'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>',
 add:'<path d="M12 5v14m-7-7h14"/>',
 refresh:'<path d="M20 11a8 8 0 1 0-1.5 5"/><path d="M20 4v7h-7"/>',
 save:'<path d="M4 3h14l3 3v15H3V3h1"/><path d="M7 3v6h10V3"/><path d="M7 21v-8h10v8"/>',
 print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 15h12v6H6z"/>',
 download:'<path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 17v4h16v-4"/>',
 money:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 9h20"/><circle cx="12" cy="14" r="2"/>',
 chart:'<path d="M3 3v18h18"/><path d="M7 17v-5m5 5V7m5 10v-9"/>',
 settings:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 close:'<path d="M6 6l12 12M18 6 6 18"/>'
};
function svg(name){
 const s=document.createElementNS('http://www.w3.org/2000/svg','svg');
 s.setAttribute('viewBox','0 0 24 24');s.setAttribute('width','19');s.setAttribute('height','19');
 s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','1.9');
 s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');
 s.setAttribute('aria-hidden','true');s.innerHTML=ico[name]||ico.view;return s;
}
function nameFor(label){
 const l=String(label||'').toLowerCase();
 if(/reset|password/.test(l))return'reset';
 if(/penghuni/.test(l))return'handover';
 if(/nonaktif|blokir/.test(l))return'deactivate';
 if(/aktifkan|siapkan akun/.test(l))return'activate';
 if(/hapus|buang/.test(l))return'delete';
 if(/batalkan|pembatalan|batal/.test(l))return'cancel';
 if(/edit|ubah/.test(l))return'edit';
 if(/tarif|atur/.test(l))return'settings';
 if(/lihat rincian|tutup rincian|lihat detail|rincian|detail/.test(l))return'view';
 if(/muat ulang|perbarui|refresh/.test(l))return'refresh';
 if(/tambah|buat|input/.test(l))return'add';
 if(/simpan|catat|posting|penerimaan|bayar|cairkan/.test(l))return'money';
 if(/unduh|csv|download/.test(l))return'download';
 if(/cetak|print|pdf/.test(l))return'print';
 if(/sahkan|konfirmasi|setuju/.test(l))return'check';
 if(/laporan|rekap/.test(l))return'chart';
 if(/tutup|selesai/.test(l))return'close';
 return null;
}
function iconify(button){
 if(!button||button.classList.contains('f4-card-detail-toggle'))return;
 if(button.closest('form')&&!button.closest('td'))return;
 const label=button.dataset.f4ActionOriginal||button.textContent.trim().replace(/\s+/g,' ');
 const type=nameFor(label);
 if(!type)return;
 if(button.dataset.f4ActionOriginal===label&&button.querySelector('.f4-action-symbol'))return;
 button.dataset.f4ActionOriginal=label;
 let wrap=document.createElement('span');wrap.className='f4-action-symbol';wrap.append(svg(type));
 const text=document.createElement('span');text.className='f4-action-label';text.textContent=label;
 button.replaceChildren(wrap,text);
 button.classList.add('f4-icon-action');
 button.setAttribute('aria-label',label);button.title=label;
}
function toggle(container,after){
 const button=document.createElement('button');button.type='button';
 button.className='f4-card-detail-toggle';button.append(svg('detail'));
 const update=()=>{
  const isOpen=container.classList.contains('f4-card-expanded');
  button.setAttribute('aria-expanded',String(isOpen));
  button.setAttribute('aria-label',isOpen?'Tutup rincian':'Lihat rincian');
  button.title=isOpen?'Tutup rincian':'Lihat rincian';
 };
 button.onclick=e=>{
  e.stopPropagation();
  container.classList.toggle('f4-card-expanded');update();
  if(after)after(container.classList.contains('f4-card-expanded'));
 };
 update();return button;
}
function enrichTable(table){
 if(table.closest('#v10Print,#v27PrintReport,#v25PrintReport,#f4-superadmin-confirm,[data-print-only]'))return;
 // Do not collapse tabular data-entry forms or editable controls.
 if(table.querySelector('input:not([type=hidden]),select,textarea'))return;
 table.classList.add('f4-mobile-card-table');
 const headers=[...table.querySelectorAll(':scope > thead > tr:first-child > th')].map(n=>n.textContent.trim());
 const rows=table.tBodies[0]?.rows||[];
 for(const row of rows){
  if(row.dataset.f4CardEnhanced)continue;
  const cells=[...row.cells];
  if(cells.length<2||cells.some(td=>td.colSpan>1))continue;
  const titleIndex=headers.findIndex(h=>/^(nama warga|nama kegiatan|nama|judul|nama barang|jenis barang|anggota|warga|nama tuan rumah|jenis|barang|lapak)$/i.test(h));
  let first=titleIndex>=0?titleIndex:0;
  if(/^id\b|^kode\b/i.test(headers[first]||'')){const n=headers.findIndex((h,i)=>i!==first&&!/id|kode/i.test(h));if(n>=0)first=n;}
  const last=cells.length-1;
  const actionIndex=/^(aksi|tindakan|actions?)$/i.test(headers[last]||'')?last:-1;
  cells.forEach((td,i)=>{
   if(!td.dataset.label)td.dataset.label=headers[i]||'Rincian';
   if(i===first){td.classList.add('f4-card-title');return;}
   if(i===actionIndex){td.classList.add('f4-card-action');td.querySelectorAll('button').forEach(iconify);return;}
   td.classList.add('f4-card-secondary');
  });
  row.dataset.f4CardEnhanced='1';row.classList.add('f4-compact-record');
  cells[first].append(toggle(row));
  row.onclick=e=>{
   if(e.target.closest('button,a,input,select,textarea,summary,label'))return;
   if(e.target.closest('.f4-card-title'))cells[first].querySelector('.f4-card-detail-toggle')?.click();
  };
 }
}
function enrichBankCard(card){
 if(card.dataset.f4CompactCard)return;
 let header=card.querySelector(':scope > .toolbar');
 let title=header?.querySelector('strong');
 // Cash/expense activity has no toolbar; build a title bar without changing the record.
 if(!header){
  title=card.querySelector(':scope > strong');
  if(!title)return;
  header=document.createElement('div');header.className='toolbar f4-bank-activity-head';
  card.insertBefore(header,title);header.append(title);
 }
 if(!title)return;
 card.dataset.f4CompactCard='1';card.classList.add('f4-compact-bank-card');
 const btns=[...card.querySelectorAll('button')];
 btns.forEach(iconify);
 // The existing detailed API record is opened with the same tap when available.
 const detailed=btns.find(b=>/lihat rincian|tutup rincian/i.test(b.dataset.f4ActionOriginal||b.textContent));
 const chevron=toggle(card,open=>{
  if(detailed&&!detailed.disabled){
   const loaded=!!card.querySelector(':scope > div:last-child table, :scope > div:last-child .details-panel');
   const wantsOpen=/lihat rincian/i.test(detailed.dataset.f4ActionOriginal||detailed.textContent);
   if(open&&!loaded&&wantsOpen)detailed.click();
  }
 });
 header.append(chevron);
 header.onclick=e=>{if(e.target.closest('button,a'))return;chevron.click()};
 if(detailed){detailed.classList.add('f4-nested-detail-action');}
}
function enrichSuperItem(item){
 if(item.dataset.f4CompactCard)return;
 const strong=item.querySelector('strong');
 if(!strong)return;
 item.dataset.f4CompactCard='1';item.classList.add('f4-compact-super-card');
 item.querySelectorAll('button').forEach(iconify);
 const btn=toggle(item);item.append(btn);
 item.onclick=e=>{if(e.target.closest('button,a,input'))return;btn.click()};
}
function run(){
 document.querySelectorAll('#f4-account-page table,#dashboardView table,#v11Public table').forEach(enrichTable);
 document.querySelectorAll('#dashboardView #riwayatList .stat,#dashboardView #riwayatJualList .stat,#dashboardView #v9History .stat,#dashboardView #v10History .stat').forEach(enrichBankCard);
 document.querySelectorAll('#f4-account-page .f4-admin-item').forEach(enrichSuperItem);
 // Action buttons generated by other Bank Sampah screens need the same 19px pictograms.
 document.querySelectorAll('#dashboardView .toolbar button,#dashboardView .v14-head button,#dashboardView #v9Sync,#f4-account-page .f4-admin-action-set button').forEach(iconify);
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;run()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(mutations=>{
 if(mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(
  n.matches?.('table,tr,td,button,.stat,.f4-admin-item,#dashboardView,#f4-account-page')
   ||n.querySelector?.('table,.stat,.f4-admin-item')))))schedule();
}).observe(document.documentElement,{childList:true,subtree:true});
})();
