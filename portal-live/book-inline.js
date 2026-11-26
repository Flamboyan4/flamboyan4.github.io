/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-1",function(__f4){



(function(){
  const RESIDENT_IDS=new __f4.globals.Set(['inp-warga','edit-warga','loan-warga','tal-warga','denda-warga','pm-payer']);
  const STATE=new __f4.globals.WeakMap();
  function getResidentMeta(value){
    const warga=(typeof __f4.globals.DATA!=='undefined'&&__f4.globals.DATA&&__f4.globals.Array.isArray(__f4.globals.DATA.warga))?__f4.globals.DATA.warga:[];
    const w=warga.find(x=>(0,__f4.globals.String)(x.idWarga)===(0,__f4.globals.String)(value));
    return w?{name:w.nama||'',house:[w.blok,w.noRumah].filter(__f4.globals.Boolean).join('/')}:null;
  }
  function residentMetaForOption(select,opt){
    if(!opt||!opt.value)return null;
    if(select.id==='pm-payer')return {name:opt.dataset.residentName||opt.textContent||'',house:opt.dataset.residentHouse||''};
    return getResidentMeta(opt.value);
  }
  function closeAll(except){__f4.globals.document.querySelectorAll('.custom-select-wrap.open').forEach(w=>{if(w!==except)w.classList.remove('open')})}
  function buildOption(select,opt,isResident){
    const btn=__f4.globals.document.createElement('button');btn.type='button';btn.className='cs-option'+((0,__f4.globals.String)(select.value)===(0,__f4.globals.String)(opt.value)?' selected':'');btn.dataset.value=opt.value;
    if(isResident && opt.value){
      const meta=residentMetaForOption(select,opt);const row=__f4.globals.document.createElement('span');row.className='cs-resident-row';
      const n=__f4.globals.document.createElement('span');n.className='cs-name';n.textContent=meta?.name||opt.textContent;
      const h=__f4.globals.document.createElement('span');h.className='cs-house';h.textContent=meta?.house||'';row.append(n,h);btn.append(row);
    } else { const t=__f4.globals.document.createElement('span');t.className='min-w-0';t.textContent=opt.textContent;btn.append(t); }
    const ck=__f4.globals.document.createElement('span');ck.className='cs-check';ck.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>';btn.append(ck);
    btn.addEventListener('click',()=>{select.value=opt.value;select.dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));refresh(select);const st=STATE.get(select);st?.wrap.classList.remove('open')});
    return btn;
  }
  function refresh(select){
    const st=STATE.get(select);if(!st)return;
    const isResident=RESIDENT_IDS.has(select.id);const selected=select.options[select.selectedIndex];
    st.value.classList.remove('resident-value');st.value.innerHTML='';
    if(isResident && selected?.value){
      const m=residentMetaForOption(select,selected);
      if(m){st.value.classList.add('resident-value');const n=__f4.globals.document.createElement('span');n.className='rv-name';n.textContent=m.name;const h=__f4.globals.document.createElement('span');h.className='rv-house';h.textContent=m.house;st.value.append(n,h)}
      else st.value.textContent=selected.textContent;
    }else st.value.textContent=selected?.textContent||'Pilih...';
    const q=(st.search?.value||'').trim().toLowerCase();st.list.innerHTML='';
    const opts=[...select.options].filter(o=>!o.disabled).filter(o=>{const m=isResident?residentMetaForOption(select,o):null;return !q||o.textContent.toLowerCase().includes(q)||(m&&(`${m.name} ${m.house}`).toLowerCase().includes(q));});
    if(isResident){const head=__f4.globals.document.createElement('div');head.className='cs-resident-head';head.innerHTML='<span>Nama Warga</span><span style="text-align:right">Blok/No</span>';st.list.append(head)}
    if(!opts.length){const e=__f4.globals.document.createElement('div');e.className='cs-empty';e.textContent='Tidak ada pilihan.';st.list.append(e);return}
    opts.forEach(o=>st.list.append(buildOption(select,o,isResident)));
  }
  function enhance(select){
    if(STATE.has(select)||select.dataset.noCustom==='1')return;
    const wrap=__f4.globals.document.createElement('div');wrap.className='custom-select-wrap';
    const btn=__f4.globals.document.createElement('button');btn.type='button';btn.className='custom-select-btn';btn.innerHTML='<span class="cs-value"></span><span class="cs-arrow" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>';
    const panel=__f4.globals.document.createElement('div');panel.className='custom-select-panel';
    const isResident=RESIDENT_IDS.has(select.id);let search=null;
    if(select.dataset.noSearch!=='1' && (isResident || select.options.length>8)){const sw=__f4.globals.document.createElement('div');sw.className='cs-search-wrap';search=__f4.globals.document.createElement('input');search.type='search';search.className='cs-search';search.placeholder=isResident?'Cari nama / blok rumah...':'Cari pilihan...';sw.append(search);panel.append(sw)}
    const list=__f4.globals.document.createElement('div');list.className='cs-list';panel.append(list);
    select.parentNode.insertBefore(wrap,select);wrap.append(select,btn,panel);select.classList.add('select-enhanced');
    STATE.set(select,{wrap,btn,panel,list,search,value:btn.querySelector('.cs-value')});
    btn.addEventListener('click',()=>{const will=!wrap.classList.contains('open');closeAll(wrap);wrap.classList.toggle('open',will);if(will){refresh(select);(0,__f4.globals.setTimeout)(()=>search?.focus(),40)}});
    search?.addEventListener('input',()=>refresh(select));
    select.addEventListener('change',()=>refresh(select));
    const mo=new __f4.globals.MutationObserver(()=>refresh(select));mo.observe(select,{childList:true,subtree:true,characterData:true});
    refresh(select);
  }
  function init(){__f4.globals.document.querySelectorAll('select.field').forEach(enhance);__f4.globals.document.addEventListener('click',e=>{if(!e.target.closest('.custom-select-wrap'))closeAll()});__f4.globals.document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});}
  if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',init);else init();
  __f4.window.refreshAllCustomSelects=()=>__f4.globals.document.querySelectorAll('select.field').forEach(s=>STATE.has(s)?refresh(s):enhance(s));
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-2",function(__f4){

__f4.expose("ymdFromAny",()=>ymdFromAny,value=>ymdFromAny=value);
__f4.expose("bukaEditKas",()=>bukaEditKas,value=>bukaEditKas=value);
__f4.expose("tutupEditKas",()=>tutupEditKas,value=>tutupEditKas=value);
__f4.expose("simpanEditKas",()=>simpanEditKas,value=>simpanEditKas=value);
__f4.expose("bukaEditPinjaman",()=>bukaEditPinjaman,value=>bukaEditPinjaman=value);
__f4.expose("tutupEditPinjaman",()=>tutupEditPinjaman,value=>tutupEditPinjaman=value);
__f4.expose("simpanEditPinjaman",()=>simpanEditPinjaman,value=>simpanEditPinjaman=value);
__f4.expose("hapusPinjamanPermanen",()=>hapusPinjamanPermanen,value=>hapusPinjamanPermanen=value);

function ymdFromAny(v){if(!v)return'';const d=new __f4.globals.Date(v);if(!(0,__f4.globals.isNaN)(d))return `${d.getFullYear()}-${(0,__f4.globals.String)(d.getMonth()+1).padStart(2,'0')}-${(0,__f4.globals.String)(d.getDate()).padStart(2,'0')}`;const m=(0,__f4.globals.String)(v).match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);return m?`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`:''}
function bukaEditKas(id){const x=(__f4.globals.Array.isArray(__f4.globals.RIWAYAT_KAS)?__f4.globals.RIWAYAT_KAS:[]).find(v=>v.idTransaksi===id);if(!x)return;if(x.sumber!=='INPUT_WEB'){(0,__f4.globals.alert)('Transaksi ini berasal dari modul lain dan harus diedit dari modul asal.');return}__f4.globals.document.getElementById('edit-kas-id').value=id;__f4.globals.document.getElementById('edit-kas-tanggal').value=ymdFromAny(x.tanggal);__f4.globals.document.getElementById('edit-kas-jenis').value=x.jenis||'Pemasukan';__f4.globals.document.getElementById('edit-kas-kategori').value=x.kategori||'';__f4.globals.document.getElementById('edit-kas-keterangan').value=x.keterangan||'';__f4.globals.document.getElementById('edit-kas-nominal').value=(0,__f4.globals.Number)(x.debit||x.kredit||0);__f4.globals.document.getElementById('edit-kas-metode').value=x.metode||'Cash';__f4.globals.document.getElementById('edit-kas-catatan').value=x.catatan||'';__f4.globals.document.getElementById('modal-edit-kas').classList.add('open')}
function tutupEditKas(){__f4.globals.document.getElementById('modal-edit-kas')?.classList.remove('open')}
async function simpanEditKas(){try{(0,__f4.globals.histKasMsg)('Menyimpan perubahan transaksi...');const r=await (0,__f4.globals.jsonp)(__f4.globals.BATCH_SCRIPT_URL,{action:'edittransaksikas',idTransaksi:__f4.globals.document.getElementById('edit-kas-id').value,tanggal:__f4.globals.document.getElementById('edit-kas-tanggal').value,jenis:__f4.globals.document.getElementById('edit-kas-jenis').value,kategori:__f4.globals.document.getElementById('edit-kas-kategori').value,keterangan:__f4.globals.document.getElementById('edit-kas-keterangan').value,nominal:(0,__f4.globals.String)(__f4.globals.document.getElementById('edit-kas-nominal').value).replace(/[^0-9.-]/g,''),metode:__f4.globals.document.getElementById('edit-kas-metode').value,catatan:__f4.globals.document.getElementById('edit-kas-catatan').value,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal mengedit transaksi.');tutupEditKas();await (0,__f4.globals.loadRiwayatKas)(true);(0,__f4.globals.histKasMsg)(r.message||'Transaksi diperbarui.','success')}catch(e){(0,__f4.globals.histKasMsg)(e.message||(0,__f4.globals.String)(e),'error')}}

function bukaEditPinjaman(id){const x=(__f4.globals.DATA_PINJAMAN.rows||[]).find(v=>v.idPinjaman===id);if(!x)return;if(x.status==='LUNAS'){(0,__f4.globals.alert)('Pinjaman sudah lunas. Gunakan Hapus jika data ini memang data uji/fiktif.');return}__f4.globals.document.getElementById('edit-pin-id').value=id;__f4.globals.document.getElementById('edit-pin-tanggal').value=ymdFromAny(x.tanggalPinjaman);__f4.globals.document.getElementById('edit-pin-nominal').value=(0,__f4.globals.Number)(x.nominalPinjaman||0);__f4.globals.document.getElementById('edit-pin-metode').value=x.metode||'Cash';__f4.globals.document.getElementById('edit-pin-keterangan').value=x.keterangan||'';__f4.globals.document.getElementById('edit-pin-info').innerHTML=`<b>${x.nama||'-'} • ${x.blok||''}/${x.noRumah||''}</b><br>Sudah dibayar: ${(0,__f4.globals.rupiah)(x.totalDibayar||0)} • Sisa sekarang: ${(0,__f4.globals.rupiah)(x.sisaPinjaman||0)}<br><span class="text-xs">Nominal baru tidak boleh lebih kecil dari total yang sudah dibayar.</span>`;__f4.globals.document.getElementById('modal-edit-pinjaman').classList.add('open')}
function tutupEditPinjaman(){__f4.globals.document.getElementById('modal-edit-pinjaman')?.classList.remove('open')}
async function simpanEditPinjaman(){try{(0,__f4.globals.loanMsg)('hist-loan-status','Menyimpan perubahan pinjaman...');const r=await (0,__f4.globals.jsonp)(__f4.globals.BATCH_SCRIPT_URL,{action:'editpinjaman',idPinjaman:__f4.globals.document.getElementById('edit-pin-id').value,tanggal:__f4.globals.document.getElementById('edit-pin-tanggal').value,nominal:(0,__f4.globals.String)(__f4.globals.document.getElementById('edit-pin-nominal').value).replace(/[^0-9.-]/g,''),metode:__f4.globals.document.getElementById('edit-pin-metode').value,keterangan:__f4.globals.document.getElementById('edit-pin-keterangan').value,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal mengedit pinjaman.');tutupEditPinjaman();await (0,__f4.globals.loadPinjaman)(true);await (0,__f4.globals.loadRiwayatKas)(true);(0,__f4.globals.loanMsg)('hist-loan-status',r.message||'Pinjaman diperbarui.','success')}catch(e){(0,__f4.globals.loanMsg)('hist-loan-status',e.message||(0,__f4.globals.String)(e),'error')}}
async function hapusPinjamanPermanen(id){const x=(__f4.globals.DATA_PINJAMAN.rows||[]).find(v=>v.idPinjaman===id);const nama=x?.nama||id;if(!(0,__f4.globals.confirm)(`HAPUS PERMANEN pinjaman ${id} milik ${nama}?\n\nSemua pembayaran pinjaman dan transaksi kas terkait juga akan dihapus. Gunakan ini hanya untuk data uji/fiktif.`))return;if(!(0,__f4.globals.confirm)('Konfirmasi sekali lagi: data akan benar-benar dihapus dan tidak masuk histori. Lanjutkan?'))return;try{(0,__f4.globals.loanMsg)('hist-loan-status','Menghapus pinjaman dan transaksi terkait...');const r=await (0,__f4.globals.jsonp)(__f4.globals.BATCH_SCRIPT_URL,{action:'hapuspinjaman',idPinjaman:id,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal menghapus pinjaman.');await (0,__f4.globals.loadPinjaman)(true);await (0,__f4.globals.loadRiwayatKas)(true);(0,__f4.globals.loanMsg)('hist-loan-status',r.message||'Pinjaman dihapus permanen.','success')}catch(e){(0,__f4.globals.loanMsg)('hist-loan-status',e.message||(0,__f4.globals.String)(e),'error')}}

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-3",function(__f4){



(function(){
  // Make resident list truly two columns even when option text contains house in the last parentheses.
  function splitResidentText(text){
    text=(0,__f4.globals.String)(text||'').trim();
    const m=text.match(/\s*(?:[•·-]\s*|\()([A-Za-z0-9]+\/[A-Za-z0-9]+)\)?\s*$/);
    if(!m)return {name:text,house:''};
    return {name:text.slice(0,m.index).trim(),house:m[1]};
  }
  __f4.window.__splitResidentText=splitResidentText;

  // Inactive panels switch through buttons only; buttons remain usable and obvious.
  const oldLoan=__f4.window.setLoanMode;
  __f4.window.setLoanMode=function(mode){if(oldLoan)oldLoan(mode);
    __f4.globals.document.getElementById('loan-form-buat')?.classList.toggle('mode-inactive',mode!=='buat');
    __f4.globals.document.getElementById('loan-form-bayar')?.classList.toggle('mode-inactive',mode!=='bayar');
  };
  const oldDenda=__f4.window.setModeDenda;
  __f4.window.setModeDenda=function(mode){if(oldDenda)oldDenda(mode);
    __f4.globals.document.getElementById('denda-panel-catat')?.classList.toggle('mode-inactive',mode!=='catat');
    __f4.globals.document.getElementById('denda-panel-bayar')?.classList.toggle('mode-inactive',mode!=='bayar');
  };

  // Mobile back button closes custom dropdown first instead of leaving the page.
  let dropdownHistory=false, closingFromPop=false;
  function openWrap(){return __f4.globals.document.querySelector('.custom-select-wrap.open')}
  function closeDropdowns(fromPop){__f4.globals.document.querySelectorAll('.custom-select-wrap.open').forEach(w=>w.classList.remove('open'));if(dropdownHistory&&!fromPop){closingFromPop=true;__f4.globals.history.back()}dropdownHistory=false}
  __f4.globals.document.addEventListener('click',function(e){
    const open=openWrap();if(!open)return;
    const btn=e.target.closest('.custom-select-btn'),panel=e.target.closest('.custom-select-panel');
    if(!btn&&!panel){closeDropdowns(false)}
  },true);
  __f4.globals.document.addEventListener('click',function(e){
    const btn=e.target.closest('.custom-select-btn');if(!btn)return;
    (0,__f4.globals.setTimeout)(()=>{if(openWrap()&&!dropdownHistory){__f4.globals.history.pushState({customDropdown:true},'');dropdownHistory=true}},0);
  });
  __f4.window.addEventListener('popstate',function(){
    if(closingFromPop){closingFromPop=false;return}
    if(openWrap()||dropdownHistory){closeDropdowns(true)}
  });

  // After custom dropdowns exist, normalize resident rows using the visible option text as a fallback.
  function normalizeResidentRows(){
    __f4.globals.document.querySelectorAll('.custom-select-wrap').forEach(w=>{
      const sel=w.querySelector('select');if(!sel||!['inp-warga','edit-warga','loan-warga','tal-warga','denda-warga'].includes(sel.id))return;
      w.querySelectorAll('.cs-option').forEach(o=>{
        const val=o.dataset.value;if(!val)return;const opt=[...sel.options].find(x=>(0,__f4.globals.String)(x.value)===(0,__f4.globals.String)(val));if(!opt)return;
        const parts=splitResidentText(opt.textContent);const row=o.querySelector('.cs-resident-row');if(row){const n=row.querySelector('.cs-name'),h=row.querySelector('.cs-house');if(n)n.textContent=parts.name;if(h)h.textContent=parts.house}
      });
      const selected=sel.options[sel.selectedIndex];const value=w.querySelector('.cs-value.resident-value');if(selected&&selected.value&&value){const parts=splitResidentText(selected.textContent);value.querySelector('.rv-name')&&(value.querySelector('.rv-name').textContent=parts.name);value.querySelector('.rv-house')&&(value.querySelector('.rv-house').textContent=parts.house)}
    })
  }
  // Hindari MutationObserver pada seluruh body karena dapat memicu loop render terus-menerus.
  // Cukup normalisasi saat halaman siap, dropdown dibuka, dan nilai select berubah.
  function scheduleResidentNormalize(){
    if(__f4.window.__residentNormalizeTimer)(0,__f4.globals.clearTimeout)(__f4.window.__residentNormalizeTimer);
    __f4.window.__residentNormalizeTimer=(0,__f4.globals.setTimeout)(normalizeResidentRows,20);
  }
  if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',()=>(0,__f4.globals.setTimeout)(normalizeResidentRows,350),{once:true});
  else (0,__f4.globals.setTimeout)(normalizeResidentRows,350);
  __f4.globals.document.addEventListener('change',e=>{if(e.target.matches('select'))scheduleResidentNormalize()},true);
  __f4.globals.document.addEventListener('click',e=>{if(e.target.closest('.custom-select-btn'))scheduleResidentNormalize()},true);
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-4",function(__f4){



(function(){
  function apply(){
    const lb=__f4.globals.document.getElementById('loan-mode-buat');
    const db=__f4.globals.document.getElementById('btn-denda-catat');
    if(lb) lb.textContent='Buat';
    if(db) db.textContent='Buat';
  }
  if(__f4.globals.document.readyState==='loading') __f4.globals.document.addEventListener('DOMContentLoaded',apply); else apply();
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-5",function(__f4){



(function(){
const MF=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],MS=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],WK=['Min','Sen','Sel','Rab','Kam','Jum','Sab'],PS={};
const p2=n=>(0,__f4.globals.String)(n).padStart(2,'0'),now=()=>{const d=new __f4.globals.Date();return{y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate()}},def=()=>{const n=now(),v=`${n.y}-${p2(n.m)}`;return{level:'month',from:v,to:v}},st=k=>PS[k]||(PS[k]=def());
function pv(l,v){const n=now();if(l==='date'){const m=(0,__f4.globals.String)(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?{y:+m[1],m:+m[2],d:+m[3]}:n}if(l==='month'){const m=(0,__f4.globals.String)(v||'').match(/^(\d{4})-(\d{2})$/);return m?{y:+m[1],m:+m[2],d:1}:{y:n.y,m:n.m,d:1}}return{y:(0,__f4.globals.Number)(v)||n.y,m:1,d:1}}
function mv(l,p){return l==='date'?`${p.y}-${p2(p.m)}-${p2(p.d)}`:l==='month'?`${p.y}-${p2(p.m)}`:(0,__f4.globals.String)(p.y)}function show(l,v){const p=pv(l,v),hp=__f4.window.matchMedia('(max-width:767px)').matches;return l==='date'?`${p.d} ${MS[p.m-1]} ${hp?(0,__f4.globals.String)(p.y).slice(-2):p.y}`:l==='month'?`${hp?MS[p.m-1]:MF[p.m-1]} ${p.y}`:(0,__f4.globals.String)(p.y)}function rank(l,v){const p=pv(l,v);return l==='date'?new __f4.globals.Date(p.y,p.m-1,p.d).getTime():l==='month'?p.y*12+p.m:p.y}
function bounds(s){const a=pv(s.level,s.from),b=pv(s.level,s.to);let A,B;if(s.level==='date'){A=new __f4.globals.Date(a.y,a.m-1,a.d,0,0,0,0);B=new __f4.globals.Date(b.y,b.m-1,b.d,23,59,59,999)}else if(s.level==='month'){A=new __f4.globals.Date(a.y,a.m-1,1);B=new __f4.globals.Date(b.y,b.m,0,23,59,59,999)}else{A=new __f4.globals.Date(a.y,0,1);B=new __f4.globals.Date(b.y,11,31,23,59,59,999)}return{start:A.getTime(),end:B.getTime()}}
function html(k){return `<div class="upr-range"><div class="upr-control" data-key="${k}" data-side="from"><button type="button" class="upr-field" onclick="UPR.open('${k}','from',this)"><span class="upr-field-text"></span><i data-lucide="calendar-days"></i></button><div class="upr-pop"></div></div><span class="upr-sep">s.d.</span><div class="upr-control" data-key="${k}" data-side="to"><button type="button" class="upr-field" onclick="UPR.open('${k}','to',this)"><span class="upr-field-text"></span><i data-lucide="calendar-days"></i></button><div class="upr-pop"></div></div></div>`}
function rf(k){const s=st(k);__f4.globals.document.querySelectorAll(`.upr-control[data-key="${k}"]`).forEach(c=>{c.querySelector('.upr-field-text').textContent=show(s.level,s[c.dataset.side])});try{__f4.globals.lucide.createIcons()}catch(e){}}
function ca(){__f4.globals.document.querySelectorAll('.upr-control.open').forEach(x=>x.classList.remove('open'))}const VW={};
function day(k,side,v){const s=st(k),sel=pv(s.level,s[side]),y=v.y,m=v.m,f=new __f4.globals.Date(y,m-1,1),sd=f.getDay(),days=new __f4.globals.Date(y,m,0).getDate(),pd=new __f4.globals.Date(y,m-1,0).getDate(),td=now();let c='';for(let i=0;i<42;i++){let yy=y,mm=m,dd,mut=0;if(i<sd){dd=pd-sd+i+1;mm=m-1;if(mm<1){mm=12;yy--}mut=1}else if(i>=sd+days){dd=i-(sd+days)+1;mm=m+1;if(mm>12){mm=1;yy++}mut=1}else dd=i-sd+1;let se=s.level==='date'&&sel.y===yy&&sel.m===mm&&sel.d===dd,to=td.y===yy&&td.m===mm&&td.d===dd;c+=`<button type="button" class="upr-day ${mut?'muted':''} ${se?'selected':''} ${to?'today':''}" onclick="UPR.pick('${k}','${side}','date',${yy},${mm},${dd})">${dd}</button>`}return `<div class="upr-head"><button class="upr-nav" onclick="UPR.shift('${k}','${side}','day',-1)"><i data-lucide="chevron-left"></i></button><button class="upr-title" onclick="UPR.view('${k}','${side}','month')">${MF[m-1]} ${y}</button><button class="upr-nav" onclick="UPR.shift('${k}','${side}','day',1)"><i data-lucide="chevron-right"></i></button></div><div class="upr-level-note">Klik judul bulan untuk memilih per bulan</div><div class="upr-week">${WK.map(x=>`<div>${x}</div>`).join('')}</div><div class="upr-days">${c}</div>`}
function mon(k,side,v){const s=st(k),sel=pv(s.level,s[side]),y=v.y;return `<div class="upr-head"><button class="upr-nav" onclick="UPR.shift('${k}','${side}','month',-1)"><i data-lucide="chevron-left"></i></button><button class="upr-title" onclick="UPR.view('${k}','${side}','year')">${y}</button><button class="upr-nav" onclick="UPR.shift('${k}','${side}','month',1)"><i data-lucide="chevron-right"></i></button></div><div class="upr-level-note">Pilih bulan • klik tahun untuk memilih per tahun</div><div class="upr-months">${MS.map((n,i)=>`<button class="upr-month ${s.level==='month'&&sel.y===y&&sel.m===i+1?'selected':''}" onclick="UPR.pick('${k}','${side}','month',${y},${i+1},1)">${n}</button>`).join('')}</div>`}
function yr(k,side,v){const s=st(k),sel=pv(s.level,s[side]),a=__f4.globals.Math.floor(v.y/10)*10;let z='';for(let y=a-1;y<=a+10;y++)z+=`<button class="upr-year ${s.level==='year'&&sel.y===y?'selected':''}" onclick="UPR.pick('${k}','${side}','year',${y},1,1)">${y}</button>`;return `<div class="upr-head"><button class="upr-nav" onclick="UPR.shift('${k}','${side}','year',-1)"><i data-lucide="chevron-left"></i></button><div class="upr-title flex items-center justify-center">${a} – ${a+9}</div><button class="upr-nav" onclick="UPR.shift('${k}','${side}','year',1)"><i data-lucide="chevron-right"></i></button></div><div class="upr-level-note">Pilih tahun</div><div class="upr-years">${z}</div>`}
function rp(k,side){const c=__f4.globals.document.querySelector(`.upr-control[data-key="${k}"][data-side="${side}"]`);if(!c)return;const s=st(k),b=pv(s.level,s[side]),v=VW[k+'|'+side]||(VW[k+'|'+side]={mode:'day',y:b.y,m:b.m});c.querySelector('.upr-pop').innerHTML=v.mode==='month'?mon(k,side,v):v.mode==='year'?yr(k,side,v):day(k,side,v);try{__f4.globals.lucide.createIcons()}catch(e){}}
__f4.window.UPR={open(k,side,b){const c=b.closest('.upr-control'),w=c.classList.contains('open');ca();if(w)return;const s=st(k),p=pv(s.level,s[side]);VW[k+'|'+side]={mode:'day',y:p.y,m:p.m};c.classList.add('open');rp(k,side)},view(k,side,m){VW[k+'|'+side].mode=m;rp(k,side)},shift(k,side,m,d){const v=VW[k+'|'+side];if(m==='day'){v.m+=d;if(v.m<1){v.m=12;v.y--}if(v.m>12){v.m=1;v.y++}}else if(m==='month')v.y+=d;else v.y+=d*10;rp(k,side)},pick(k,side,l,y,m,d){const s=st(k),v=mv(l,{y,m,d});if(s.level!==l){s.level=l;s.from=v;s.to=v}else s[side]=v;if(rank(l,s.from)>rank(l,s.to)){if(side==='from')s.to=s.from;else s.from=s.to}rf(k);ca();if(k==='history-iuran'){__f4.window.IURAN_QUICK_DATA=null;__f4.window.F4BookExtras?.reset();__f4.window.renderRiwayat?.();__f4.window.loadIuranQuickSummary?.()}if(k==='history-kas'){__f4.window.f4KasAllPeriods=false;__f4.window.f4SyncKasPeriod?.();__f4.window.loadRiwayatKas?.(true)}},state:k=>({...st(k)}),params:k=>{const s=st(k);return{periodLevel:s.level,periodFrom:s.from,periodTo:s.to}},range:k=>bounds(st(k))};__f4.globals.document.addEventListener('pointerdown',e=>{if(!e.target.closest('.upr-control'))ca()});
function mount(){const b=__f4.globals.document.querySelector('#history-iuran-panel .history-period-box');if(b)b.innerHTML=html('history-iuran');rf('history-iuran');const cb=__f4.globals.document.getElementById('history-kas-period');if(cb){cb.innerHTML=html('history-kas');rf('history-kas');__f4.window.f4SyncKasPeriod?.()}const defs=[['report-kas-filter','report-kas',''],['report-rt-filter','report-rt',''],['report-arisan-filter','report-arisan',''],['report-denda-filter','report-denda','<select id="report-denda-status-filter" class="field upr-filter-status"><option value="SEMUA">Semua</option><option value="BELUM">Belum Bayar</option><option value="LUNAS">Lunas</option><option value="BATAL">Batal</option></select>'],['report-pinjaman-filter','report-pinjaman','<select id="report-pinjaman-status-filter" class="field upr-filter-status"><option value="SEMUA">Semua</option><option value="AKTIF">Aktif</option><option value="LUNAS">Lunas</option><option value="BATAL">Batal</option></select>'],['report-talangan-filter','report-talangan','<select id="report-talangan-status-filter" class="field upr-filter-status"><option value="SEMUA">Semua</option><option value="MENUNGGU">Menunggu</option><option value="LUNAS">Lunas</option><option value="BATAL">Batal</option></select>']];defs.forEach(([id,k,x])=>{const e=__f4.globals.document.getElementById(id);if(e){e.className=(e.className||'').replace(/\bgrid\b|\bspace-y-3\b|\bmax-w-\S+/g,'').trim();e.innerHTML=`<div class="report-universal-filter">${html(k)}${x}</div>`;rf(k)}});(0,__f4.globals.setTimeout)(()=>__f4.window.refreshAllCustomSelects?.(),30)}
__f4.window.matchRiwayatPeriod=function(x){
  const st=__f4.globals.UPR.state('history-iuran');
  const keys=(typeof __f4.globals.paymentMonthKeys==='function'?(0,__f4.globals.paymentMonthKeys)(x):[]).filter(__f4.globals.Boolean);
  if(st.level==='date'){
    const t=__f4.window.historyDateTs?.(x?.tanggal)||0;
    if(!t)return false;
    const r=__f4.globals.UPR.range('history-iuran');
    return t>=r.start&&t<=r.end;
  }
  if(!keys.length)return false;
  if(st.level==='month'){
    const lo=(0,__f4.globals.String)(st.from||'');
    const hi=(0,__f4.globals.String)(st.to||st.from||'');
    return keys.some(k=>k>=lo&&k<=hi);
  }
  const y1=(0,__f4.globals.Number)(st.from)||0,y2=(0,__f4.globals.Number)(st.to||st.from)||y1;
  return keys.some(k=>{const y=(0,__f4.globals.Number)((0,__f4.globals.String)(k).slice(0,4))||0;return y>=y1&&y<=y2});
};__f4.window.getKasReportParams=function(){return{action:'laporankas',...__f4.globals.UPR.params('report-kas'),t:__f4.globals.Date.now()}};
__f4.window.loadLaporan=async function(){const q=++__f4.globals.REPORT_REQUEST_SEQ;try{(0,__f4.globals.reportMsg)('Memuat laporan...');let p;if(__f4.globals.REPORT_MODE==='rt')p={action:'laporanrt',...__f4.globals.UPR.params('report-rt'),t:__f4.globals.Date.now()};else if(__f4.globals.REPORT_MODE==='arisan')p={action:'laporanarisan',...__f4.globals.UPR.params('report-arisan'),t:__f4.globals.Date.now()};else if(__f4.globals.REPORT_MODE==='denda')p={action:'laporandenda',...__f4.globals.UPR.params('report-denda'),status:__f4.globals.document.getElementById('report-denda-status-filter')?.value||'SEMUA',t:__f4.globals.Date.now()};else if(__f4.globals.REPORT_MODE==='pinjaman')p={action:'laporanpinjaman',...__f4.globals.UPR.params('report-pinjaman'),status:__f4.globals.document.getElementById('report-pinjaman-status-filter')?.value||'SEMUA',t:__f4.globals.Date.now()};else if(__f4.globals.REPORT_MODE==='talangan')p={action:'laporantalangan',...__f4.globals.UPR.params('report-talangan'),status:__f4.globals.document.getElementById('report-talangan-status-filter')?.value||'SEMUA',t:__f4.globals.Date.now()};else if(__f4.globals.REPORT_MODE==='tahunan'){const y=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-tahunan-tahun')?.value);if(!y){(0,__f4.globals.reportMsg)('Pilih tahun laporan.','error');return}p={action:'laporantahunan',tahun:y,t:__f4.globals.Date.now()}}else p=(0,__f4.globals.getKasReportParams)();const r=await (0,__f4.globals.jsonp)(__f4.globals.BATCH_SCRIPT_URL,p);if(q!==__f4.globals.REPORT_REQUEST_SEQ)return;if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memuat laporan.');if(__f4.globals.REPORT_MODE==='rt'){__f4.globals.REPORT_DATA_RT=r.data;(0,__f4.globals.renderLaporanRt)(r.data)}else if(__f4.globals.REPORT_MODE==='arisan'){__f4.globals.REPORT_DATA_ARISAN=r.data;(0,__f4.globals.renderLaporanArisan)(r.data)}else if(__f4.globals.REPORT_MODE==='denda'){__f4.globals.REPORT_DATA_DENDA=r.data;(0,__f4.globals.renderLaporanDenda)(r.data)}else if(__f4.globals.REPORT_MODE==='pinjaman'){__f4.globals.REPORT_DATA_PINJAMAN=r.data;(0,__f4.globals.renderLaporanPinjaman)(r.data)}else if(__f4.globals.REPORT_MODE==='talangan'){__f4.globals.REPORT_DATA_TALANGAN=r.data;(0,__f4.globals.renderLaporanTalangan)(r.data)}else if(__f4.globals.REPORT_MODE==='tahunan'){__f4.globals.REPORT_DATA_TAHUNAN=r.data;(0,__f4.globals.renderLaporanTahunan)(r.data)}else{__f4.globals.REPORT_DATA_KAS=r.data;(0,__f4.globals.renderLaporanKas)(r.data)}(0,__f4.globals.reportMsg)('Laporan berhasil dimuat.','success')}catch(e){if(q!==__f4.globals.REPORT_REQUEST_SEQ)return;(0,__f4.globals.reportMsg)(e.message||(0,__f4.globals.String)(e),'error')}};
function pl(d){const label=d?.labelPeriode||d?.periode?.label;if(label)return label;return [d?.namaBulan,d?.tahun].filter(v=>v!==__f4.globals.undefined&&v!==null&&v!=='').join(' ')}const a=__f4.window.renderLaporanRt;__f4.window.renderLaporanRt=function(d){a(d);const e=__f4.globals.document.getElementById('report-rt-period');if(e)e.textContent='Periode '+pl(d)};const b=__f4.window.renderLaporanArisan;__f4.window.renderLaporanArisan=function(d){b(d);const e=__f4.globals.document.getElementById('report-arisan-period');if(e)e.textContent='Periode '+pl(d)};const c=__f4.window.renderLaporanDenda;__f4.window.renderLaporanDenda=function(d){c(d);const e=__f4.globals.document.getElementById('report-denda-period');if(e)e.textContent='Periode '+pl(d)+(d?.statusFilter&&d.statusFilter!=='SEMUA'?' • '+d.statusFilter:'')};const d=__f4.window.renderLaporanPinjaman;__f4.window.renderLaporanPinjaman=function(x){d(x);const e=__f4.globals.document.getElementById('report-pinjaman-period');if(e)e.textContent='Posisi pinjaman terkini'+(x?.statusFilter&&x.statusFilter!=='SEMUA'?' • '+x.statusFilter:'')};const f=__f4.window.renderLaporanTalangan;__f4.window.renderLaporanTalangan=function(x){f(x);const e=__f4.globals.document.getElementById('report-talangan-period');if(e)e.textContent='Periode '+pl(x)+(x?.statusFilter&&x.statusFilter!=='SEMUA'?' • '+x.statusFilter:'')};mount();try{__f4.globals.lucide.createIcons()}catch(e){}
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-6",function(__f4){



(function(){
  const BASE = new __f4.globals.WeakMap();
  const ACTIVE = new __f4.globals.WeakMap();
  let raf1=0, raf2=0;

  function px(v){const n=(0,__f4.globals.parseFloat)(v);return __f4.globals.Number.isFinite(n)?n:0}

  function isUsableParent(el){
    if(!el || el===__f4.globals.document.body || el===__f4.globals.document.documentElement) return false;
    const r=el.getBoundingClientRect();
    return r.width>120 && r.height>70;
  }

  function findParent(anchor){
    /* Prioritas: card visual terdekat. Jika tidak ada, pakai section.card utama. */
    let n=anchor?.parentElement;
    while(n && n!==__f4.globals.document.body){
      if(n.matches?.('[data-dropdown-expand-parent], .rounded-2xl.border, .rounded-xl.border, section.card, .card') && isUsableParent(n)){
        /* Hindari menjadikan field/popup kecil sebagai parent. */
        if(!n.classList.contains('custom-select-panel') && !n.classList.contains('upr-pop')) return n;
      }
      n=n.parentElement;
    }
    return anchor?.closest?.('section.card, .card') || null;
  }

  function ensureBase(parent){
    if(!BASE.has(parent)){
      const cs=(0,__f4.globals.getComputedStyle)(parent);
      BASE.set(parent,{paddingBottom:px(cs.paddingBottom), inline:parent.style.paddingBottom||''});
    }
    parent.classList.add('dropdown-expand-parent');
    return BASE.get(parent);
  }

  function restore(parent){
    if(!parent) return;
    const b=BASE.get(parent);
    if(!b) return;
    parent.style.paddingBottom=b.inline;
    parent.classList.remove('dropdown-expand-parent');
    ACTIVE.delete(parent);
  }

  function panelIsOpen(panel){
    if(!panel) return false;
    const cs=(0,__f4.globals.getComputedStyle)(panel);
    if(cs.display==='none' || cs.visibility==='hidden' || (0,__f4.globals.Number)(cs.opacity)===0) return false;
    const r=panel.getBoundingClientRect();
    return r.width>0 && r.height>0;
  }

  function collectOpenAbsolutePanels(){
    const out=[];
    __f4.globals.document.querySelectorAll('.upr-control.open .upr-pop, .custom-select-wrap.open .custom-select-panel').forEach(panel=>{
      if(!panelIsOpen(panel)) return;
      const cs=(0,__f4.globals.getComputedStyle)(panel);
      /* Dropdown search HP yang fixed/naik di atas keyboard tidak ikut membesarkan card. */
      if(cs.position!=='absolute') return;
      const anchor=panel.closest('.upr-control, .custom-select-wrap');
      if(anchor) out.push({panel,anchor});
    });
    return out;
  }

  function recalc(){
    (0,__f4.globals.cancelAnimationFrame)(raf1);(0,__f4.globals.cancelAnimationFrame)(raf2);
    raf1=(0,__f4.globals.requestAnimationFrame)(()=>{
      raf2=(0,__f4.globals.requestAnimationFrame)(()=>{
        const items=collectOpenAbsolutePanels();
        const needed=new __f4.globals.Map();

        items.forEach(({panel,anchor})=>{
          const parent=findParent(anchor);if(!parent)return;
          const base=ensureBase(parent);

          /* Ukur dari kondisi dasar agar padding tidak terus bertambah tiap kalkulasi. */
          parent.style.paddingBottom=base.paddingBottom+'px';
          const pr=parent.getBoundingClientRect();
          const dr=panel.getBoundingClientRect();
          const extra=__f4.globals.Math.max(0, __f4.globals.Math.ceil(dr.bottom + 12 - pr.bottom));
          if(extra>0) needed.set(parent,__f4.globals.Math.max(needed.get(parent)||0,extra));
          else if(!needed.has(parent)) needed.set(parent,0);
        });

        /* Pulihkan parent lama yang dropdown-nya sudah tertutup. */
        __f4.globals.document.querySelectorAll('.dropdown-expand-parent').forEach(parent=>{
          if(!needed.has(parent)) restore(parent);
        });

        /* Tambahkan ruang hanya sebesar bagian dropdown yang keluar dari card. */
        needed.forEach((extra,parent)=>{
          const base=ensureBase(parent);
          if(extra>0){
            parent.style.paddingBottom=(base.paddingBottom+extra)+'px';
            ACTIVE.set(parent,extra);
          }else{
            restore(parent);
          }
        });
      });
    });
  }

  /* Pantau buka/tutup dropdown custom dan kalender universal. */
  const mo=new __f4.globals.MutationObserver(muts=>{
    if(muts.some(m=>m.type==='attributes' && m.attributeName==='class')) recalc();
  });
  mo.observe(__f4.globals.document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']});

  __f4.globals.document.addEventListener('click',()=>(0,__f4.globals.setTimeout)(recalc,0),true);
  __f4.window.addEventListener('resize',recalc,{passive:true});
  __f4.window.addEventListener('orientationchange',()=>(0,__f4.globals.setTimeout)(recalc,120),{passive:true});
  __f4.globals.document.addEventListener('scroll',()=>{
    if(__f4.globals.document.querySelector('.upr-control.open .upr-pop, .custom-select-wrap.open .custom-select-panel')) recalc();
  },true);

  /* Bila isi dropdown berubah setelah dibuka (mis. hasil search), ukur ulang. */
  const ro=('ResizeObserver' in window)?new __f4.globals.ResizeObserver(()=>recalc()):null;
  if(ro){
    const watch=()=>__f4.globals.document.querySelectorAll('.upr-pop,.custom-select-panel').forEach(x=>{try{ro.observe(x)}catch(e){}});
    watch();
    new __f4.globals.MutationObserver(watch).observe(__f4.globals.document.body,{childList:true,subtree:true});
  }

  __f4.window.recalcDropdownParentExpansion=recalc;
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-7",function(__f4){



(function(){
  const MONTH=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const MSHORT=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const WEEK=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const views=new __f4.globals.WeakMap();
  let calendarHistoryActive=false;
  let suppressNextPop=false;
  const isMobile=()=>__f4.window.matchMedia('(max-width:767px)').matches;
  const p2=n=>(0,__f4.globals.String)(n).padStart(2,'0');
  function parseDate(v){const m=(0,__f4.globals.String)(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);const d=new __f4.globals.Date();return m?{y:+m[1],m:+m[2],d:+m[3]}:{y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate()}}
  function label(v){if(!v)return 'Pilih tanggal';const p=parseDate(v);return `${p.d} ${MSHORT[p.m-1]} ${p.y}`}
  function anyCalendarOpen(){return !!__f4.globals.document.querySelector('.upr-control.open,.mdc-wrap.open')}
  function pushCalendarState(){
    if(!isMobile()||calendarHistoryActive)return;
    try{__f4.globals.history.pushState({...(__f4.globals.history.state||{}),__flamboyanCalendar:true},'',__f4.globals.location.href);calendarHistoryActive=true}catch(e){}
  }
  function releaseCalendarState(){
    if(!calendarHistoryActive)return;
    calendarHistoryActive=false;
    suppressNextPop=true;
    try{__f4.globals.history.back()}catch(e){suppressNextPop=false}
  }
  function closeAllCalendars(removeHistory){
    __f4.globals.document.querySelectorAll('.upr-control.open').forEach(x=>x.classList.remove('open'));
    __f4.globals.document.querySelectorAll('.mdc-wrap.open').forEach(x=>x.classList.remove('open'));
    if(removeHistory)releaseCalendarState();
  }
  __f4.window.addEventListener('popstate',function(){
    if(suppressNextPop){suppressNextPop=false;return}
    if(anyCalendarOpen()||calendarHistoryActive){
      __f4.globals.document.querySelectorAll('.upr-control.open').forEach(x=>x.classList.remove('open'));
      __f4.globals.document.querySelectorAll('.mdc-wrap.open').forEach(x=>x.classList.remove('open'));
      calendarHistoryActive=false;
    }
  });

  /* Kalender universal Riwayat/Laporan ikut masuk history overlay sehingga Back = tutup. */
  function hookUPR(){
    if(!__f4.window.UPR||__f4.window.UPR.__backHooked)return;
    const oldOpen=__f4.window.UPR.open;
    __f4.window.UPR.open=function(){const r=oldOpen.apply(this,arguments);(0,__f4.globals.setTimeout)(()=>{if(anyCalendarOpen())pushCalendarState()},0);return r};
    __f4.window.UPR.__backHooked=true;
  }

  function render(w){
    const input=w.querySelector('.mdc-source'),pop=w.querySelector('.mdc-pop'),sel=parseDate(input.value);let v=views.get(w)||{mode:'day',y:sel.y,m:sel.m};views.set(w,v);
    if(v.mode==='month'){
      pop.innerHTML=`<div class="mdc-head"><button type="button" class="mdc-nav" data-yshift="-1" aria-label="Sebelumnya"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><button type="button" class="mdc-title" data-mode="year">${v.y}</button><button type="button" class="mdc-nav" data-yshift="1" aria-label="Berikutnya"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button></div><div class="mdc-months">${MSHORT.map((n,i)=>`<button type="button" class="mdc-month ${sel.y===v.y&&sel.m===i+1?'selected':''}" data-month="${i+1}">${n}</button>`).join('')}</div>`;
    }else if(v.mode==='year'){
      const start=__f4.globals.Math.floor(v.y/10)*10;let ys='';for(let y=start-1;y<=start+10;y++)ys+=`<button type="button" class="mdc-year ${sel.y===y?'selected':''}" data-year="${y}">${y}</button>`;
      pop.innerHTML=`<div class="mdc-head"><button type="button" class="mdc-nav" data-decade="-10" aria-label="Sebelumnya"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><div class="mdc-title flex items-center justify-center">${start} – ${start+9}</div><button type="button" class="mdc-nav" data-decade="10" aria-label="Berikutnya"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button></div><div class="mdc-years">${ys}</div>`;
    }else{
      const first=new __f4.globals.Date(v.y,v.m-1,1),sd=first.getDay(),days=new __f4.globals.Date(v.y,v.m,0).getDate(),prev=new __f4.globals.Date(v.y,v.m-1,0).getDate(),today=new __f4.globals.Date();let cells='';
      for(let i=0;i<42;i++){let y=v.y,m=v.m,d,mut=false;if(i<sd){d=prev-sd+i+1;m--;if(m<1){m=12;y--}mut=true}else if(i>=sd+days){d=i-(sd+days)+1;m++;if(m>12){m=1;y++}mut=true}else d=i-sd+1;const s=sel.y===y&&sel.m===m&&sel.d===d,t=today.getFullYear()===y&&today.getMonth()+1===m&&today.getDate()===d;cells+=`<button type="button" class="mdc-day ${mut?'muted':''} ${s?'selected':''} ${t?'today':''}" data-date="${y}-${p2(m)}-${p2(d)}">${d}</button>`}
      pop.innerHTML=`<div class="mdc-head"><button type="button" class="mdc-nav" data-mshift="-1" aria-label="Sebelumnya"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><button type="button" class="mdc-title" data-mode="month">${MONTH[v.m-1]} ${v.y}</button><button type="button" class="mdc-nav" data-mshift="1" aria-label="Berikutnya"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button></div><div class="mdc-week">${WEEK.map(x=>`<div>${x}</div>`).join('')}</div><div class="mdc-days">${cells}</div>`;
    }
  }
  function sync(input){const w=input.closest('.mdc-wrap');if(!w)return;
    const s=w.querySelector('.mdc-text'),b=w.querySelector('.mdc-btn');
    const v=input.value,p=parseDate(v),width=w.getBoundingClientRect().width;
    const short=width>0&&width<170;
    if(s)s.textContent=!v?'Pilih tanggal':(short?`${p2(p.d)}/${p2(p.m)}/${p.y}`:label(v));
    if(b){const full=!v?'Pilih tanggal':`${p.d} ${MONTH[p.m-1]} ${p.y}`;
      b.setAttribute('aria-label','Tanggal: '+full);b.title=full}
  }
  function openCalendar(w){
    closeAllCalendars(false);
    const input=w.querySelector('.mdc-source'),p=parseDate(input.value);views.set(w,{mode:'day',y:p.y,m:p.m});render(w);w.classList.add('open');pushCalendarState();
  }
  function attach(input){
    if(input.dataset.mdcReady==='1'||!isMobile())return;
    input.dataset.mdcReady='1';input.classList.add('mdc-source');
    const w=__f4.globals.document.createElement('div');w.className='mdc-wrap';input.parentNode.insertBefore(w,input);w.appendChild(input);
    const b=__f4.globals.document.createElement('button');b.type='button';b.className='mdc-btn';b.innerHTML='<span class="mdc-text"></span><i data-lucide="calendar-days"></i>';w.appendChild(b);
    const pop=__f4.globals.document.createElement('div');pop.className='mdc-pop';w.appendChild(pop);sync(input);
    b.addEventListener('click',()=>w.classList.contains('open')?closeAllCalendars(true):openCalendar(w));
    pop.addEventListener('click',e=>{
      const v=views.get(w),input=w.querySelector('.mdc-source');
      let q=e.target.closest('[data-mode]');if(q){v.mode=q.dataset.mode;render(w);return}
      q=e.target.closest('[data-mshift]');if(q){v.m+=(0,__f4.globals.Number)(q.dataset.mshift);if(v.m<1){v.m=12;v.y--}if(v.m>12){v.m=1;v.y++}render(w);return}
      q=e.target.closest('[data-yshift]');if(q){v.y+=(0,__f4.globals.Number)(q.dataset.yshift);render(w);return}
      q=e.target.closest('[data-decade]');if(q){v.y+=(0,__f4.globals.Number)(q.dataset.decade);render(w);return}
      q=e.target.closest('[data-month]');if(q){v.m=(0,__f4.globals.Number)(q.dataset.month);v.mode='day';render(w);return}
      q=e.target.closest('[data-year]');if(q){v.y=(0,__f4.globals.Number)(q.dataset.year);v.mode='month';render(w);return}
      q=e.target.closest('[data-date]');if(q){input.value=q.dataset.date;input.dispatchEvent(new __f4.globals.Event('input',{bubbles:true}));input.dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));sync(input);closeAllCalendars(true)}
    });
    input.addEventListener('change',()=>sync(input));
  }
  function init(){
    if(!isMobile())return;
    __f4.globals.document.querySelectorAll('input[type="date"]').forEach(attach);
    hookUPR();
    try{__f4.globals.lucide.createIcons()}catch(e){}
    (0,__f4.globals.setInterval)(()=>{__f4.globals.document.querySelectorAll('input.mdc-source').forEach(sync);hookUPR()},700);
  }
  __f4.globals.document.addEventListener('pointerdown',e=>{if(!e.target.closest('.mdc-wrap,.upr-control')&&anyCalendarOpen())closeAllCalendars(true)},true);
  if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',()=>(0,__f4.globals.setTimeout)(init,250));else (0,__f4.globals.setTimeout)(init,250);
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-8",function(__f4){



(function(){
  let startX=0,startY=0,target=null;
  const MIN=42;
  function isCalendarPop(el){return !!el?.closest?.('.upr-pop,.mdc-pop')}
  __f4.globals.document.addEventListener('touchstart',function(e){
    const pop=e.target.closest?.('.upr-pop,.mdc-pop');
    if(!pop||!e.touches||e.touches.length!==1)return;
    target=pop;startX=e.touches[0].clientX;startY=e.touches[0].clientY;
  },{passive:true});
  __f4.globals.document.addEventListener('touchend',function(e){
    if(!target||!e.changedTouches||!e.changedTouches.length){target=null;return}
    const dx=e.changedTouches[0].clientX-startX;
    const dy=e.changedTouches[0].clientY-startY;
    const pop=target;target=null;
    if(__f4.globals.Math.abs(dx)<MIN||__f4.globals.Math.abs(dx)<=__f4.globals.Math.abs(dy)*1.15)return;
    const navs=pop.querySelectorAll('.upr-nav,.mdc-nav');
    if(navs.length<2)return;
    // geser ke kiri = periode berikutnya, geser ke kanan = periode sebelumnya
    const btn=dx<0?navs[navs.length-1]:navs[0];
    btn?.click();
  },{passive:true});
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-9",function(__f4){



(function(){
  const CLOSED_YEAR_CACHE={};
  const YEAR_SAVE_BUTTONS={
    input:['btn-simpan'],transaksi:['btn-trx-simpan'],kas:['kas-btn-buat'],talangan:['tal-btn-simpan'],denda:['denda-btn-simpan','bayar-denda-btn'],pinjaman:['loan-btn-simpan','payloan-btn-simpan']
  };
  function nYear(v){const n=(0,__f4.globals.Number)(v);return n>=2000&&n<=2200?n:0}
  function dateYear(v){const m=(0,__f4.globals.String)(v||'').match(/^(\\d{4})-/);return m?nYear(m[1]):0}
  async function getYearStatus(y,force=false){
    y=nYear(y);if(!y)return null;if(CLOSED_YEAR_CACHE[y]&&!force)return CLOSED_YEAR_CACHE[y];
    try{const r=await (0,__f4.globals.jsonp)(__f4.globals.APPS_SCRIPT_URL,{action:'statustahun',tahun:y,t:__f4.globals.Date.now()});if(r&&r.status==='success'){CLOSED_YEAR_CACHE[y]=r.data;return r.data}}catch(e){__f4.globals.console.warn('status tahun',e)}return null;
  }
  function fillYearSelect(){
    const s=__f4.globals.document.getElementById('report-tahunan-tahun');if(!s||s.tagName!=='SELECT')return;
    const now=new __f4.globals.Date().getFullYear(),cur=(0,__f4.globals.Number)(s.value)||now;let h='';
    for(let y=now+1;y>=2020;y--)h+=`<option value="${y}">${y}</option>`;s.innerHTML=h;s.value=(0,__f4.globals.String)(cur>=2020?cur:now);
    s.onchange=()=>{updateYearBadge();};
  }
  async function updateYearBadge(){
    const y=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-tahunan-tahun')?.value)||new __f4.globals.Date().getFullYear(),st=await getYearStatus(y);
    const b=__f4.globals.document.getElementById('year-lock-badge'),a=__f4.globals.document.getElementById('btn-year-archive');if(!b)return st;
    if(!st){b.className='year-lock-badge unknown';b.textContent='STATUS TIDAK TERSEDIA';a?.classList.add('hidden');return null;}const closed=!!st.ditutup;b.className='year-lock-badge '+(closed?'closed':'open');b.innerHTML=`<i data-lucide="${closed?'lock':'unlock'}" class="w-4 h-4"></i><span>${closed?'DITUTUP':'TERBUKA'}</span>`;
    a?.classList.toggle('hidden',!closed);try{__f4.globals.lucide.createIcons()}catch(e){}return st;
  }
  __f4.window.openYearArchive=async function(){
    const y=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-tahunan-tahun')?.value),host=__f4.globals.document.getElementById('year-archive-detail');if(!y||!host)return;
    host.classList.remove('hidden');host.innerHTML='<div class="text-sm text-slate-500">Memuat arsip resmi...</div>';
    try{const r=await (0,__f4.globals.jsonp)(__f4.globals.APPS_SCRIPT_URL,{action:'detailarsip',tahun:y,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memuat arsip.');const d=r.data||{},rec=d.record||{},mods=d.modul||{};
      const available=__f4.globals.Object.keys(mods).filter(k=>mods[k]);
      host.innerHTML=`<div class="flex items-center justify-between gap-3 mb-3"><div><div class="font-black text-violet-950">Arsip Resmi ${y}</div><div class="text-xs text-slate-500 mt-1">${rec.tanggalTutup?(0,__f4.globals.esc)((0,__f4.globals.histDate)(rec.tanggalTutup)):''} • ${(0,__f4.globals.esc)(rec.idArsip||'')}</div></div><span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">TERKUNCI</span></div><div class="year-archive-grid"><div class="year-archive-card"><div class="k">Saldo Awal</div><div class="v">${(0,__f4.globals.rupiah)(rec.saldoAwal||0)}</div></div><div class="year-archive-card"><div class="k">Pemasukan</div><div class="v text-emerald-700">${(0,__f4.globals.rupiah)(rec.pemasukan||0)}</div></div><div class="year-archive-card"><div class="k">Pengeluaran</div><div class="v text-red-600">${(0,__f4.globals.rupiah)(rec.pengeluaran||0)}</div></div><div class="year-archive-card"><div class="k">Saldo Akhir</div><div class="v">${(0,__f4.globals.rupiah)(rec.saldoAkhir||0)}</div></div></div><div class="text-xs text-slate-500 mt-3">Snapshot tersedia: ${available.map(__f4.globals.esc).join(' • ')||'-'}</div>`;
    }catch(e){host.innerHTML=`<div class="text-sm text-red-600">${(0,__f4.globals.esc)(e.message||(0,__f4.globals.String)(e))}</div>`}
  };
  const oldRenderArchive=__f4.window.renderArsipTahunan;
  __f4.window.renderArsipTahunan=function(){
    const e=__f4.globals.document.getElementById('report-tahunan-arsip');if(!e)return;const a=__f4.globals.REPORT_ARSIP_TAHUNAN||[];if(!a.length){e.classList.add('hidden');return}
    e.classList.remove('hidden');e.innerHTML=`<div class="font-black text-violet-950 mb-2">Arsip Tahun Ditutup</div><div class="archive-year-list">${a.map(x=>`<button type="button" class="archive-year-chip" onclick="document.getElementById('report-tahunan-tahun').value='${x.tahun}';loadLaporan();setTimeout(openYearArchive,250)"><i data-lucide="archive" class="w-4 h-4"></i>${x.tahun} • ${(0,__f4.globals.rupiah)(x.saldoAkhir||0)}</button>`).join('')}</div>`;try{__f4.globals.lucide.createIcons()}catch(err){}
  };
  const oldRenderYear=__f4.window.renderLaporanTahunan;
  __f4.window.renderLaporanTahunan=function(d){oldRenderYear(d);updateYearBadge();const detail=__f4.globals.document.getElementById('year-archive-detail');if(detail&&!d?.sudahDitutup)detail.classList.add('hidden');};
  const oldClose=__f4.window.prosesTutupBuku;
  __f4.window.prosesTutupBuku=async function(){await oldClose();__f4.globals.Object.keys(CLOSED_YEAR_CACHE).forEach(k=>delete CLOSED_YEAR_CACHE[k]);await updateYearBadge();};

  function activeYearForTab(tab){
    if(tab==='input')return nYear(__f4.globals.document.getElementById('inp-tahun')?.value)||dateYear(__f4.globals.document.getElementById('inp-tanggal')?.value);
    if(tab==='transaksi')return nYear(__f4.globals.document.getElementById('trx-tahun')?.value)||dateYear(__f4.globals.document.getElementById('trx-tanggal')?.value);
    if(tab==='kas')return nYear(__f4.globals.document.getElementById('kas-tahun-buku')?.value)||nYear(__f4.globals.document.getElementById('kas-tahun-iuran')?.value);
    if(tab==='talangan')return nYear(__f4.globals.document.getElementById('tal-tahun')?.value)||dateYear(__f4.globals.document.getElementById('tal-tanggal')?.value);
    if(tab==='denda'){const bayar=!__f4.globals.document.getElementById('denda-panel-bayar')?.classList.contains('hidden');return dateYear(__f4.globals.document.getElementById(bayar?'bayar-denda-tanggal':'denda-tanggal')?.value)}
    if(tab==='pinjaman'){const bayar=!__f4.globals.document.getElementById('loan-form-bayar')?.classList.contains('hidden');return dateYear(__f4.globals.document.getElementById(bayar?'payloan-tanggal':'loan-tanggal')?.value)}
    return 0;
  }
  async function applyInputYearLock(tab){
    const y=activeYearForTab(tab),ids=YEAR_SAVE_BUTTONS[tab]||[];if(!y)return;const st=await getYearStatus(y),locked=!!st?.ditutup;
    ids.forEach(id=>{const b=__f4.globals.document.getElementById(id);if(!b)return;b.disabled=locked;b.classList.toggle('year-locked-control',locked);b.title=locked?`Tahun ${y} sudah ditutup dan terkunci.`:''});
    const panel=__f4.globals.document.getElementById('tab-'+tab);if(!panel)return;let w=panel.querySelector(':scope > .year-lock-warning');if(locked){if(!w){w=__f4.globals.document.createElement('div');w.className='year-lock-warning';panel.prepend(w)}w.textContent=`Tahun ${y} sudah DITUTUP. Input/perubahan untuk tahun ini dikunci oleh backend.`}else w?.remove();
  }
  ['input','transaksi','kas','talangan','denda','pinjaman'].forEach(tab=>{
    const p=__f4.globals.document.getElementById('tab-'+tab);if(!p)return;p.addEventListener('change',()=>(0,__f4.globals.setTimeout)(()=>applyInputYearLock(tab),60));p.addEventListener('click',()=>(0,__f4.globals.setTimeout)(()=>applyInputYearLock(tab),80));
  });
  fillYearSelect();updateYearBadge();(0,__f4.globals.setTimeout)(()=>{try{__f4.globals.lucide.createIcons()}catch(e){}},20);
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-10",function(__f4){

__f4.expose("BULK",()=>BULK,null);
__f4.expose("bulkMsg",()=>bulkMsg,value=>bulkMsg=value);
__f4.expose("bulkCSV",()=>bulkCSV,value=>bulkCSV=value);
__f4.expose("bulkObjects",()=>bulkObjects,value=>bulkObjects=value);
__f4.expose("bulkMapIuran",()=>bulkMapIuran,value=>bulkMapIuran=value);
__f4.expose("bulkMapKas",()=>bulkMapKas,value=>bulkMapKas=value);
__f4.expose("bulkFileChanged",()=>bulkFileChanged,value=>bulkFileChanged=value);
__f4.expose("bulkRefreshControls",()=>bulkRefreshControls,value=>bulkRefreshControls=value);
__f4.expose("bulkChunks",()=>bulkChunks,value=>bulkChunks=value);
__f4.expose("bulkPreviewType",()=>bulkPreviewType,value=>bulkPreviewType=value);
__f4.expose("bulkStateBadge",()=>bulkStateBadge,value=>bulkStateBadge=value);
__f4.expose("bulkRenderPreview",()=>bulkRenderPreview,value=>bulkRenderPreview=value);
__f4.expose("bulkPreviewAll",()=>bulkPreviewAll,value=>bulkPreviewAll=value);
__f4.expose("bulkImportType",()=>bulkImportType,value=>bulkImportType=value);
__f4.expose("bulkImportAll",()=>bulkImportAll,value=>bulkImportAll=value);

/* v6.25.0 - Import Bulk CSV aman / authoritative */
const BULK={iuran:[],kas:[],preview:[],ready:false,busy:false};
function bulkMsg(msg,type='info'){const e=__f4.globals.document.getElementById('bulk-status');if(!e)return;e.className='mb-4 rounded-xl border px-4 py-3 text-sm';e.classList.remove('hidden');if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');else if(type==='success')e.classList.add('bg-emerald-50','border-emerald-200','text-emerald-700');else e.classList.add('bg-slate-50','border-slate-200','text-slate-600');e.textContent=msg}
function bulkCSV(text){const out=[];let row=[],cell='',q=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(q){if(c==='"'&&n==='"'){cell+='"';i++}else if(c==='"')q=false;else cell+=c}else{if(c==='"')q=true;else if(c===','){row.push(cell);cell=''}else if(c==='\n'){row.push(cell);out.push(row);row=[];cell=''}else if(c!=='\r')cell+=c}}if(cell.length||row.length){row.push(cell);out.push(row)}return out.filter(r=>r.some(x=>(0,__f4.globals.String)(x).trim()!==''))}
function bulkObjects(text){const a=bulkCSV(text);if(!a.length)return[];const head=a[0].map(x=>(0,__f4.globals.String)(x).replace(/^\uFEFF/,'').trim());return a.slice(1).map((r,i)=>{const o={rowNo:i+2};head.forEach((k,j)=>o[k]=(0,__f4.globals.String)(r[j]??'').trim());return o})}
function bulkMapIuran(rows){return rows.map(r=>({rowNo:r.rowNo,tanggalBayar:r['Tanggal Bayar']||r['Tanggal']||'',nama:r['Nama']||'',rumah:r['Rumah']||'',bulanIuran:r['Bulan Iuran']||r['Bulan']||'',tahun:r['Tahun']||r['Tahun Iuran']||'',nominal:r['Nominal']||'',metode:r['Metode']||'',catatan:r['Catatan']||''}))}
function bulkMapKas(rows){return rows.map(r=>({rowNo:r.rowNo,tanggal:r['Tanggal']||'',keterangan:r['Keterangan']||'',jenis:r['Jenis']||'',nominal:r['Nominal']||'',catatan:r['Catatan']||''}))}
async function bulkFileChanged(type,input){try{const f=input.files?.[0];if(!f)return;const txt=await f.text(),rows=bulkObjects(txt);BULK[type]=type==='iuran'?bulkMapIuran(rows):bulkMapKas(rows);__f4.globals.document.getElementById(`bulk-${type}-file-label`).textContent=`${f.name} • ${BULK[type].length} baris`;BULK.preview=[];BULK.ready=false;__f4.globals.document.getElementById('bulk-btn-import').disabled=true;__f4.globals.document.getElementById('bulk-preview-wrap').classList.add('hidden');__f4.globals.document.getElementById('bulk-summary').classList.add('hidden');bulkMsg(`${type==='iuran'?'Iuran':'Kas'} terbaca ${BULK[type].length} baris. Klik Periksa Data setelah kedua file dipilih.`);bulkRefreshControls()}catch(e){bulkMsg(e.message||(0,__f4.globals.String)(e),'error')}}
function bulkRefreshControls(){const b=__f4.globals.document.getElementById('bulk-btn-preview');if(b)b.disabled=BULK.busy||!BULK.iuran.length||!BULK.kas.length;const imp=__f4.globals.document.getElementById('bulk-btn-import');if(imp)imp.disabled=BULK.busy||!BULK.ready}
function bulkChunks(arr,n=10){const o=[];for(let i=0;i<arr.length;i+=n)o.push(arr.slice(i,i+n));return o}
async function bulkPreviewType(type,rows){const out=[];for(const c of bulkChunks(rows,10)){const r=await (0,__f4.globals.jsonp)(__f4.globals.APPS_SCRIPT_URL,{action:'bulkpreview',jenis:type,rows:__f4.globals.JSON.stringify(c),t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Preview bulk gagal.');out.push(...(r.data?.rows||[]))}return out.map(x=>({...x,source:type}))}
function bulkStateBadge(s,label){return `<span class="bulk-badge ${(0,__f4.globals.esc)(s)}">${(0,__f4.globals.esc)(label||s)}</span>`}
function bulkRenderPreview(){const rows=BULK.preview;const cnt={new:0,update:0,same:0,error:0,conflict:0};rows.forEach(x=>cnt[x.state]=(cnt[x.state]||0)+1);__f4.globals.document.getElementById('bulk-sum-total').textContent=rows.length;__f4.globals.document.getElementById('bulk-sum-new').textContent=cnt.new||0;__f4.globals.document.getElementById('bulk-sum-update').textContent=cnt.update||0;__f4.globals.document.getElementById('bulk-sum-same').textContent=cnt.same||0;__f4.globals.document.getElementById('bulk-sum-bad').textContent=(cnt.error||0)+(cnt.conflict||0);__f4.globals.document.getElementById('bulk-summary').classList.remove('hidden');__f4.globals.document.getElementById('bulk-preview-wrap').classList.remove('hidden');__f4.globals.document.getElementById('bulk-preview-body').innerHTML=rows.map(x=>{const data=x.source==='iuran'?`<div class="font-bold">${(0,__f4.globals.esc)(x.nama||'-')} • ${(0,__f4.globals.esc)(x.rumah||'-')}</div><div class="text-xs text-slate-400">${(0,__f4.globals.esc)(x.periode||'')} • bayar ${(0,__f4.globals.esc)((0,__f4.globals.histDate)(x.tanggal))}</div>`:`<div class="font-bold">${(0,__f4.globals.esc)(x.keterangan||'-')}</div><div class="text-xs text-slate-400">${(0,__f4.globals.esc)((0,__f4.globals.histDate)(x.tanggal))}</div>`;const warns=(x.warnings||[]).map(w=>`<div class="bulk-warning"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/></svg> ${(0,__f4.globals.esc)(w)}</div>`).join('');return `<tr><td class="p-3 font-bold">${x.source==='iuran'?'Iuran':'Kas'}</td><td class="p-3">${x.rowNo}</td><td class="p-3">${data}</td><td class="p-3 text-right font-black">${(0,__f4.globals.rupiah)(x.nominal||0)}</td><td class="p-3">${bulkStateBadge(x.state,x.label)}</td><td class="p-3">${(0,__f4.globals.esc)(x.detail||'')}${warns}</td></tr>`}).join('');__f4.globals.lucide.createIcons()}
async function bulkPreviewAll(){if(!BULK.iuran.length||!BULK.kas.length){bulkMsg('Pilih CSV Iuran dan CSV Kas terlebih dahulu.','error');return}BULK.busy=true;bulkRefreshControls();try{bulkMsg('Memeriksa data Iuran dan Kas...');const i=await bulkPreviewType('iuran',BULK.iuran),k=await bulkPreviewType('kas',BULK.kas);BULK.preview=[...i,...k];bulkRenderPreview();const hard=BULK.preview.filter(x=>['error','conflict'].includes(x.state));BULK.ready=hard.length===0;if(hard.length)bulkMsg(`Preview selesai. Ada ${hard.length} baris yang perlu diperiksa; import dikunci sampai masalah diperbaiki.`,'error');else bulkMsg(`Preview aman: ${BULK.preview.length} baris diperiksa. Data identik akan dilewati, data lama yang berbeda akan mengikuti CSV.`,'success')}catch(e){BULK.ready=false;bulkMsg(e.message||(0,__f4.globals.String)(e),'error')}finally{BULK.busy=false;bulkRefreshControls()}}
async function bulkImportType(action,rows,extra={}){const all=[];for(const c of bulkChunks(rows,8)){const r=await (0,__f4.globals.jsonp)(__f4.globals.APPS_SCRIPT_URL,{action,rows:__f4.globals.JSON.stringify(c),...extra,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Import gagal.');all.push(...(r.results||[]))}return all}
async function bulkImportAll(){if(!BULK.ready||BULK.busy)return;if(!(0,__f4.globals.confirm)(`Import ${BULK.iuran.length} baris Iuran dan ${BULK.kas.length} baris Kas?\n\nData identik tidak akan didobel. Jika ada data manual yang berbeda dan masih aman diedit, data CSV akan menjadi acuan.`))return;BULK.busy=true;bulkRefreshControls();try{bulkMsg('Mengimpor Kas terlebih dahulu...');const rk=await bulkImportType('bulkimportkas',BULK.kas);const badK=rk.filter(x=>['error','conflict'].includes(x.state));if(badK.length)throw new __f4.globals.Error(`Import Kas berhenti: ${badK.length} baris bermasalah.`);bulkMsg('Kas selesai. Mengimpor Iuran dan menandai porsi Kas historis sudah dibukukan...');const ri=await bulkImportType('bulkimportiuran',BULK.iuran,{historicalKasBooked:'1'});const badI=ri.filter(x=>['error','conflict'].includes(x.state));if(badI.length)throw new __f4.globals.Error(`Import Iuran selesai sebagian: ${badI.length} baris bermasalah.`);BULK.ready=false;await (0,__f4.globals.muatUlang)();await bulkPreviewAll();bulkMsg(`Import selesai. Kas: ${rk.filter(x=>x.state==='inserted').length} baru, ${rk.filter(x=>x.state==='updated').length} diperbarui. Iuran: ${ri.filter(x=>x.state==='inserted').length} baru, ${ri.filter(x=>x.state==='updated').length} diperbarui. Data sama tidak didobel.`,'success')}catch(e){bulkMsg(e.message||(0,__f4.globals.String)(e),'error')}finally{BULK.busy=false;bulkRefreshControls()}}

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-11",function(__f4){



(function(){
  'use strict';
  const configs=[
    ['tbody-riwayat',[1,0],[2,3,4]],
    ['kas-tbody-batch',[2,0],[4,3,1]],
    ['tbody-riwayat-talangan',[1,0],[2,5,4]],
    ['tbody-riwayat-denda',[1,0],[3,4,2]],
    ['tbody-riwayat-pinjaman',[1,0],[2,5,4]],
    ['tbody-riwayat-bayar-pinjaman',[1,0],[3,5,2]]
  ];
  const txt=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
  const escapeText=v=>(0,__f4.globals.String)(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function install(tbodyId,main,secondary){
    const tb=__f4.globals.document.getElementById(tbodyId); if(!tb||tb.dataset.mhistoryInstalled)return;
    const table=tb.closest('table'),wrap=table?.parentElement;if(!table||!wrap)return;
    tb.dataset.mhistoryInstalled='yes';
    wrap.classList.add('mhistory-source');
    const cards=__f4.globals.document.createElement('div'); cards.className='mhistory-cards';
    cards.setAttribute('aria-label','Daftar ringkas transaksi, ketuk untuk rincian');
    wrap.insertAdjacentElement('afterend',cards);
    let queued=false;
    function render(){queued=false;const heads=[...table.querySelectorAll('thead th')].map(txt);
      const rows=[...tb.querySelectorAll(':scope > tr')];
      const entries=rows.filter(tr=>tr.cells.length>1&&!tr.querySelector('td[colspan]'));
      if(!entries.length){cards.innerHTML='<div class="mhistory-empty">'+escapeText(txt(rows[0])||'Belum ada transaksi.')+'</div>';return;}
      const oldOpen=new __f4.globals.Set([...cards.querySelectorAll('details[open]')].map(d=>d.dataset.rkey));
      const frag=__f4.globals.document.createDocumentFragment();
      entries.forEach((tr,index)=>{
        const cells=[...tr.cells];
        const titleCell=cells[main[0]];
        const first=txt(titleCell?.querySelector('.f4-visible-title')||
          titleCell?.querySelector(':scope > div:first-child')||titleCell)||'-';
        const extra=[...(titleCell?.querySelectorAll(':scope > div:not(:first-child)')||[])].map(txt);
        let side=[...extra,...main.slice(1).map(i=>txt(cells[i]))].filter(__f4.globals.Boolean).join(' • ');
        let amount=secondary.map(i=>txt(cells[i])).find(t=>/Rp\s*[\d.]+/i.test(t))||txt(cells[secondary[0]])||'';
        let status=secondary.map(i=>txt(cells[i])).find(t=>/^(lunas|aktif|batal|terkunci|belum|menunggu|sudah)/i.test(t))||'';
        if(tbodyId==='tbody-riwayat-denda'){
          const house=txt(cells[1]?.querySelector(':scope > div:nth-child(2)'));
          const date=txt(cells[0]?.querySelector(':scope > div:first-child'));
          const event=txt(cells[2]?.querySelector(':scope > div:first-child'));
          side=[house,date,event].filter(__f4.globals.Boolean).join(' • ');
          amount=txt(cells[3])||'-';
          status=txt(cells[4])||'';
        }
        if(tbodyId==='tbody-riwayat-talangan'){
          const house=txt(cells[1]?.querySelector(':scope > div:nth-child(2)'));
          const period=txt(cells[0]?.querySelector(':scope > div:first-child'));
          const date=txt(cells[0]?.querySelector(':scope > div:nth-child(2)'));
          side=[house,period,date].filter(__f4.globals.Boolean).join(' • ');
          amount=txt(cells[2])||'-';
          status=txt(cells[5])||'';
        }
        const key=tbodyId+'-'+index+'-'+first+'-'+side;
        const details=__f4.globals.document.createElement('details');details.className='mhistory-entry';details.dataset.rkey=key;
        if(oldOpen.has(key))details.open=true;
        const summary=__f4.globals.document.createElement('summary');
        summary.innerHTML='<div class="mhistory-main"><div class="mhistory-primary">'+escapeText(first)+'</div><div class="mhistory-secondary">'+escapeText(side)+'</div></div><div class="mhistory-right"><div class="mhistory-amount">'+escapeText(amount)+'</div>'+(status&&(!/^aktif$/i.test(status)||tbodyId==='tbody-riwayat-talangan')?'<div class="mhistory-status'+(tbodyId==='tbody-riwayat-denda'&&/^belum$/i.test(status)?' is-unpaid':tbodyId==='tbody-riwayat-talangan'&&/^aktif$/i.test(status)?' is-active':(tbodyId==='tbody-riwayat-denda'||tbodyId==='tbody-riwayat-talangan')&&/^batal$/i.test(status)?' is-cancelled':'')+'">'+escapeText(status)+'</div>':'')+'<span class="mhistory-chevron" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></div>';
        details.appendChild(summary);
        const body=__f4.globals.document.createElement('div');body.className='mhistory-detail';
        const visibleCells=tbodyId==='kas-tbody-batch'?[1,3,5]:tbodyId==='tbody-riwayat-denda'?[2,5,6]:tbodyId==='tbody-riwayat-talangan'?[0,3,4,6,7,8]:cells.map((_td,i)=>i);
        visibleCells.forEach(i=>{
          const td=cells[i];
          const label=heads[i]||('Kolom '+(i+1));
          const line=__f4.globals.document.createElement('div');line.className='mhistory-line';
          const k=__f4.globals.document.createElement('span');k.className='mhistory-key';k.textContent=label;
          const v=__f4.globals.document.createElement('div');v.className='mhistory-value';
          // Batch Kas: cukup kategori, ID, jumlah dan aksi tanpa nested "Detail pencatatan".
          // Tombol Batal tetap memakai onclick asli dari tabel.
          if(tbodyId==='kas-tbody-batch'&&i===1){
            const category=td.querySelector(':scope > div:first-child');
            const idLine=td.querySelector('.f4-trans-ref div');
            v.textContent=txt(category)||'-';
            if(idLine){
              const ref=__f4.globals.document.createElement('small');
              ref.className='mhistory-batch-id';
              ref.textContent=txt(idLine);
              v.appendChild(ref);
            }
          }else if(tbodyId==='tbody-riwayat-talangan'&&i===0){
            const period=txt(td.querySelector(':scope > div:first-child'));
            const date=txt(td.querySelector(':scope > div:nth-child(2)'));
            const due=txt(td.querySelector('div.text-violet-600'));
            v.textContent=[period,date,due].filter(x=>x&&x!=='-').join(' • ')||'-';
          }else if(tbodyId==='tbody-riwayat-talangan'&&i===7){
            const paymentLabel=td.firstChild?.nodeType===3?td.firstChild.textContent.trim():'';
            const paidDate=txt(td.querySelector(':scope > div.text-xs'));
            v.textContent=[paymentLabel,paidDate].filter(__f4.globals.Boolean).join(' • ')||'-';
          }else if(tbodyId==='tbody-riwayat-talangan'&&i===6){
            v.textContent=txt(td)||'-';
          }else if(tbodyId==='tbody-riwayat-denda'&&i===5){
            const paidDate=td.firstChild?.nodeType===3?td.firstChild.textContent.trim():'';
            const method=txt(td.querySelector(':scope > div.text-xs'));
            v.textContent=[paidDate,method].filter(x=>x&&x!=='-').join(' • ')||'-';
          }else if(tbodyId==='tbody-riwayat-denda'&&i===2){
            const event=txt(td.querySelector(':scope > div:first-child'));
            const note=txt(td.querySelector(':scope > div:nth-child(2)'));
            v.textContent=[event,note].filter(__f4.globals.Boolean).join(' • ')||'-';
          }else{
            v.innerHTML=td.innerHTML;
            v.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
          }
          line.append(k,v);body.appendChild(line);
        });
        if(tbodyId==='tbody-riwayat-talangan'){
          const idText=txt(cells[0]?.querySelector('.f4-trans-ref div'));
          if(idText){
            const line=__f4.globals.document.createElement('div');line.className='mhistory-line';
            const k=__f4.globals.document.createElement('span');k.className='mhistory-key';k.textContent='ID Talangan';
            const v=__f4.globals.document.createElement('div');v.className='mhistory-value';
            v.textContent=idText.replace(/^ID:\s*/i,'');
            line.append(k,v);body.appendChild(line);
          }
        }
        if(tbodyId==='tbody-riwayat-denda'){
          const idText=txt(cells[0]?.querySelector('.f4-trans-ref div'));
          if(idText){
            const line=__f4.globals.document.createElement('div');line.className='mhistory-line';
            const k=__f4.globals.document.createElement('span');k.className='mhistory-key';k.textContent='ID Denda';
            const v=__f4.globals.document.createElement('div');v.className='mhistory-value';v.textContent=idText.replace(/^ID:\s*/i,'');
            line.append(k,v);body.appendChild(line);
          }
        }
        details.appendChild(body);frag.appendChild(details);
      });
      cards.replaceChildren(frag);
    }
    function schedule(){if(queued)return;queued=true;(0,__f4.globals.setTimeout)(render,0)}
    new __f4.globals.MutationObserver(schedule).observe(tb,{childList:true,subtree:true,characterData:true});
    render();
  }
  function init(){configs.forEach(c=>install(...c));}
  if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',init);else init();
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-12",function(__f4){



/* Explicitly connect the existing D1 save routines on the deployed form buttons.
   Browser acceptance found the form valid but native submit was not dispatched.
   Prevent native navigation; respect required fields and fiscal-year locks. */
(function(){
  'use strict';
  const handlers={
    'btn-simpan':'simpanIuran',
    'btn-trx-simpan':'simpanTransaksiKas',
    'loan-btn-simpan':'simpanPinjaman',
    'payloan-btn-simpan':'simpanPembayaranPinjaman',
    'tal-btn-simpan':'simpanTalangan',
    'denda-btn-simpan':'simpanDenda',
    'bayar-denda-btn':'bayarDenda'
  };
  __f4.globals.document.addEventListener('click',function(event){
    const button=event.target?.closest?.('button[id]');
    const action=button&&handlers[button.id];
    if(!action||button.disabled)return;
    event.preventDefault();
    if(button.classList.contains('year-locked-control'))return;
    if(button.form&&!button.form.reportValidity())return;
    const handler=__f4.window[action];
    if(typeof handler!=='function'){
      __f4.globals.console.error('Tombol Simpan tidak mempunyai handler:',action);
      return;
    }
    event.stopPropagation();
    __f4.globals.Promise.resolve(handler(event)).catch(error=>__f4.globals.console.error('D1 save handler failed:',action,error));
  },true);
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/pembukuan/index.html#inline-13",function(__f4){



(function(){
  const WRAPS='.custom-select-wrap,.mdc-wrap,.upr-control';
  const OPEN='.custom-select-wrap.open,.mdc-wrap.open,.upr-control.open';
  const MOBILE='(max-width:1023px)';
  let raf=0,observer;
  const viewport=()=>{
    const v=__f4.window.visualViewport;
    return {top:v?.offsetTop||0,left:v?.offsetLeft||0,
      height:v?.height||__f4.window.innerHeight,
      width:v?.width||__f4.window.innerWidth};
  };
  function setVar(el,k,val){
    if(el.style.getPropertyValue(k)!==val)el.style.setProperty(k,val);
  }
  function bounds(element,view){
    const r=element.getBoundingClientRect();
    return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,
      visible:r.bottom>view.top&&r.top<view.top+view.height};
  }
  function position(w){
    if(!w.classList.contains('open'))return;
    const panel=w.querySelector('.custom-select-panel,.mdc-pop,.upr-pop');
    const trigger=w.querySelector('.custom-select-btn,.mdc-btn,.upr-field');
    if(!panel||!trigger)return;
    const view=viewport();
    const r=bounds(trigger,view);
    // When the on-screen keyboard resizes the viewport, retain the popup
    // beside its field instead of pinning it to the keyboard.
    if(!r.visible)return;
    const isSelect=w.classList.contains('custom-select-wrap');
    const gap=6,pad=10;
    const preferred=isSelect?280:405;
    const vw=__f4.globals.Math.max(0,view.width-2*pad);
    const targetWidth=isSelect?__f4.globals.Math.max(r.width,__f4.globals.Math.min(310,vw)):__f4.globals.Math.min(326,vw);
    const width=__f4.globals.Math.max(140,__f4.globals.Math.min(vw,targetWidth));
    const left=__f4.globals.Math.max(view.left+pad,__f4.globals.Math.min(r.left,view.left+view.width-width-pad));
    const below=__f4.globals.Math.max(0,view.top+view.height-r.bottom-gap-pad);
    const above=__f4.globals.Math.max(0,r.top-view.top-gap-pad);
    const useAbove=(above>below&&below<preferred) || (below<135&&above>below);
    const free=useAbove?above:below;
    const height=__f4.globals.Math.max(55,__f4.globals.Math.min(preferred,free));
    const y=useAbove?r.top-gap-height:r.bottom+gap;
    const top=__f4.globals.Math.max(view.top+pad,__f4.globals.Math.min(y,view.top+view.height-height-pad));
    panel.classList.add('f4-anchor-panel');
    w.classList.remove('f4-keyboard');
    setVar(panel,'--f4-popup-left',__f4.globals.Math.round(left)+'px');
    setVar(panel,'--f4-popup-top',__f4.globals.Math.round(top)+'px');
    setVar(panel,'--f4-popup-width',__f4.globals.Math.round(width)+'px');
    setVar(panel,'--f4-popup-height',__f4.globals.Math.round(height)+'px');
    if(isSelect){
      const search=panel.querySelector('.cs-search-wrap');
      setVar(panel,'--f4-popup-search',__f4.globals.Math.ceil(search?.getBoundingClientRect().height||0)+'px');
    }
  }
  function run(){
    raf=0;
    if(!__f4.window.matchMedia(MOBILE).matches)return;
    __f4.globals.document.querySelectorAll(OPEN).forEach(position);
  }
  function schedule(){if(!raf)raf=(0,__f4.globals.requestAnimationFrame)(run)}
  const watch=new __f4.globals.MutationObserver(mutations=>{
    for(const mutation of mutations){
      if(mutation.type==='attributes'&&mutation.attributeName==='class'){
        const el=mutation.target;
        if(el.matches?.(WRAPS)){schedule();return}
      }
      if(mutation.type==='childList'){
        if(mutation.target.closest?.(OPEN)){schedule();return}
      }
    }
  });
  function init(){
    watch.observe(__f4.globals.document.body,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
    __f4.globals.document.addEventListener('click',schedule,true);
    __f4.globals.document.addEventListener('focusin',schedule,true);
    __f4.globals.document.addEventListener('input',event=>{
      if(event.target.matches('.cs-search'))schedule();
    },true);
    __f4.window.addEventListener('scroll',schedule,true);
    __f4.window.addEventListener('resize',schedule,{passive:true});
    __f4.window.addEventListener('orientationchange',schedule,{passive:true});
    __f4.window.visualViewport?.addEventListener('resize',schedule,{passive:true});
    __f4.window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
    if('ResizeObserver' in window){
      const ro=new __f4.globals.ResizeObserver(schedule);
      const seen=new __f4.globals.WeakSet();
      const track=()=>{
        __f4.globals.document.querySelectorAll('.custom-select-panel,.mdc-pop,.upr-pop').forEach(el=>{
          if(!seen.has(el)){seen.add(el);ro.observe(el)}
        });
      };
      track();
      new __f4.globals.MutationObserver(track).observe(__f4.globals.document.body,{childList:true,subtree:true});
    }
    schedule();
  }
  if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

});
