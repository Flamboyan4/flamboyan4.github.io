/* Riwayat Transaksi Kas: tampilan HP khusus.
   Tabel desktop tetap menjadi sumber data dan sumber aksi, tanpa menggandakan logika transaksi. */
(function () {
  'use strict';
  const tbody=document.getElementById('tbody-riwayat-kas');
  const panel=document.getElementById('history-kasumum-panel');
  if(!tbody||!panel)return;
  const table=tbody.closest('table');
  const wrapper=table&&table.parentElement;
  if(!wrapper)return;

  const escapeText=value=>String(value==null?'':value).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
  const plain=node=>(node&&node.textContent||'').replace(/\s+/g,' ').trim();
  const icons={
    more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
    down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    receipt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 3h16v18l-4-2-4 2-4-2-4 2zM8 8h8M8 12h8"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m16 4 4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11z"/></svg>',
    cancel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>'
  };
  const list=document.createElement('div');
  list.id='f4-kas-mobile-list';
  list.className='f4-kas-mobile-list';
  list.setAttribute('aria-label','Daftar transaksi kas');
  wrapper.insertAdjacentElement('afterend',list);

  const sheet=document.createElement('div');
  sheet.className='f4-kas-action-sheet';
  sheet.id='f4-kas-action-sheet';
  sheet.setAttribute('role','dialog');
  sheet.setAttribute('aria-modal','true');
  sheet.setAttribute('aria-labelledby','f4-kas-sheet-title');
  sheet.hidden=true;
  sheet.innerHTML=
    '<button type="button" class="f4-kas-sheet-backdrop" aria-label="Tutup menu aksi"></button>'+
    '<section class="f4-kas-sheet-panel" tabindex="-1">'+
    '<div class="f4-kas-sheet-handle" aria-hidden="true"></div>'+
    '<div class="f4-kas-sheet-heading"><div><small>Aksi transaksi</small><strong id="f4-kas-sheet-title"></strong></div>'+
    '<button type="button" class="f4-kas-sheet-close" aria-label="Tutup">'+icons.close+'</button></div>'+
    '<div class="f4-kas-sheet-options"></div>'+
    '</section>';
  document.body.appendChild(sheet);

  let savedScroll='',returnFocus=null,activeButtons=[],sheetOpen=false,pushed=false,frame=0;
  const getRows=()=>[...tbody.querySelectorAll(':scope > tr')].filter(tr=>tr.cells&&tr.cells.length===8);

  function itemMarkup(tr,i){
    const c=tr.cells;
    const date=plain(c[0]),category=plain(c[1]),method=plain(c[5]);
    const title=plain(c[2].querySelector('.f4-visible-title'))||plain(c[2])||'-';
    const debit=plain(c[3]),credit=plain(c[4]);
    const income=debit&&debit!=='-'&&debit!=='–';
    const expense=!income&&credit&&credit!=='-'&&credit!=='–';
    const nominal=(income?'+ ':expense?'− ':'')+(income?debit:expense?credit:'Rp 0');
    const status=plain(c[6]);
    const meta=[date,category,method].filter(v=>v&&v!=='-').join(' • ');
    const rawRefs=[...c[2].querySelectorAll('.f4-trans-ref div')].map(plain).filter(Boolean);
    const fields=[['Tanggal',date],['Kategori',category],['Metode',method]];
    rawRefs.forEach(value=>fields.push(['Pencatatan',value]));
    const more=c[7].querySelectorAll('button').length>0;
    return '<article class="f4-kas-mobile-entry'+(status.toUpperCase()==='BATAL'?' is-cancelled':'')+'">'+
      '<div class="f4-kas-entry-top"><div class="f4-kas-entry-copy">'+
      '<div class="f4-kas-entry-title">'+escapeText(title)+'</div>'+
      '<div class="f4-kas-entry-meta">'+escapeText(meta)+'</div>'+
      (status&&status.toUpperCase()!=='AKTIF'?'<span class="f4-kas-entry-status">'+escapeText(status)+'</span>':'')+
      '</div><div class="f4-kas-entry-money '+(income?'is-income':expense?'is-expense':'')+'">'+escapeText(nominal)+'</div></div>'+
      '<div class="f4-kas-entry-bottom">'+
      '<button type="button" class="f4-kas-detail-toggle" data-kas-detail="'+i+'" aria-expanded="false" aria-controls="f4-kas-extra-'+i+'">Detail '+icons.down+'</button>'+
      (more?'<button type="button" class="f4-kas-more-button" data-kas-actions="'+i+'" aria-label="Aksi transaksi '+escapeText(title)+'">'+icons.more+'</button>':'')+
      '</div><div class="f4-kas-extra" id="f4-kas-extra-'+i+'" hidden>'+
      fields.map(p=>'<div><span>'+escapeText(p[0])+'</span><span>'+escapeText(p[1]||'-')+'</span></div>').join('')+
      '</div></article>';
  }
  function render(){
    frame=0;
    if(sheetOpen)closeSheet();
    const rows=getRows();
    const openRows=new Set([...list.querySelectorAll('.f4-kas-entry-title')].filter(t=>t.closest('.f4-kas-mobile-entry').querySelector('.f4-kas-extra:not([hidden])')).map(t=>plain(t)));
    list.innerHTML=rows.length?rows.map(itemMarkup).join(''):'<p class="f4-kas-mobile-empty">'+escapeText(plain(tbody)||'Belum ada transaksi kas.')+'</p>';
    if(openRows.size){
      list.querySelectorAll('.f4-kas-mobile-entry').forEach(entry=>{
        if(!openRows.has(plain(entry.querySelector('.f4-kas-entry-title'))))return;
        const more=entry.querySelector('.f4-kas-extra'),toggle=entry.querySelector('.f4-kas-detail-toggle');
        if(more&&toggle){more.hidden=false;toggle.setAttribute('aria-expanded','true');}
      });
    }
    panel.classList.add('f4-kas-mobile-ready');
  }
  function schedule(){if(frame)return;frame=requestAnimationFrame(render);}
  function closeSheet(fromBack){
    if(!sheetOpen)return;
    sheetOpen=false;
    sheet.hidden=true;
    document.body.style.overflow=savedScroll;
    const returnTo=returnFocus;
    returnFocus=null;activeButtons=[];
    if(returnTo&&returnTo.isConnected) returnTo.focus({preventScroll:true});
    if(pushed){
      pushed=false;
      if(!fromBack&&history.state&&history.state.f4KasActions)history.back();
    }
  }
  function openSheet(index,button){
    const row=getRows()[index];if(!row)return;
    activeButtons=[...row.cells[7].querySelectorAll('button')];
    if(!activeButtons.length)return;
    const title=plain(row.cells[2].querySelector('.f4-visible-title'))||plain(row.cells[2]);
    sheet.querySelector('#f4-kas-sheet-title').textContent=title;
    sheet.querySelector('.f4-kas-sheet-options').innerHTML=activeButtons.map((src,i)=>{
      const original=src.getAttribute('aria-label')||src.title||'Aksi';
      const low=original.toLowerCase();
      const type=/resi|receipt/.test(low)?'receipt':/batal|cancel/.test(low)?'cancel':'edit';
      const label=type==='receipt'?'Lihat resi':type==='cancel'?'Batalkan transaksi':/edit/i.test(low)?'Edit transaksi':original;
      return '<button type="button" class="f4-kas-sheet-option '+(type==='cancel'?'is-danger':'')+'" data-kas-run="'+i+'">'+icons[type]+'<span>'+escapeText(label)+'</span></button>';
    }).join('');
    returnFocus=button;
    savedScroll=document.body.style.overflow;
    sheet.hidden=false;sheetOpen=true;
    document.body.style.overflow='hidden';
    try{history.pushState(Object.assign({},history.state||{},{f4KasActions:true}),'');pushed=true;}catch(e){pushed=false;}
    sheet.querySelector('.f4-kas-sheet-close').focus({preventScroll:true});
  }
  list.addEventListener('click',event=>{
    const detail=event.target.closest('[data-kas-detail]');
    if(detail){
      const extra=list.querySelector('#f4-kas-extra-'+detail.dataset.kasDetail);
      if(!extra)return;
      extra.hidden=!extra.hidden;
      detail.setAttribute('aria-expanded',String(!extra.hidden));
      return;
    }
    const action=event.target.closest('[data-kas-actions]');
    if(action)openSheet(Number(action.dataset.kasActions),action);
  });
  sheet.addEventListener('click',event=>{
    if(event.target.closest('.f4-kas-sheet-close,.f4-kas-sheet-backdrop')){closeSheet();return;}
    const action=event.target.closest('[data-kas-run]');
    if(!action)return;
    const src=activeButtons[Number(action.dataset.kasRun)];
    closeSheet();
    if(src&&src.isConnected)src.click();
  });
  document.addEventListener('keydown',event=>{
    if(!sheetOpen)return;
    if(event.key==='Escape'||event.key==='Backspace'){
      event.preventDefault();closeSheet();
    }
  });
  window.addEventListener('popstate',()=>{if(sheetOpen)closeSheet(true)});
  new MutationObserver(schedule).observe(tbody,{childList:true,subtree:true,characterData:true});
  render();
})();