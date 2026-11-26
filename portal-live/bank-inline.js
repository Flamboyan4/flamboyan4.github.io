/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/bank-sampah/index.html#inline-1",function(__f4){



(()=>{
'use strict';
// Nama/rasio pada panduan selalu berasal dari aturan yang sama dengan pengesahan D1.
const api='https://api.flamboyan4.web.id/api/public/bank-split';
let inFlight=null;
async function refresh(){
 const member=__f4.globals.document.getElementById('f4BankSplitMember');
 const env=__f4.globals.document.getElementById('f4BankSplitEnvironment');
 if(!member||!env||inFlight)return inFlight;
 inFlight=(async()=>{
  try{
   const response=await (0,__f4.globals.fetch)(api,{credentials:'omit',cache:'no-store'});
   const result=await response.json();
   if(!response.ok||result.ok===false||
      !__f4.globals.Number.isSafeInteger(result.wargaPercent)||result.wargaPercent<1||result.wargaPercent>99||
      result.lingkunganPercent!==100-result.wargaPercent)throw (0,__f4.globals.Error)('Aturan belum tersedia.');
   member.textContent=result.wargaPercent+'%';
   env.textContent=result.lingkunganPercent+'%';
   __f4.globals.document.getElementById('f4MemberFlow')?.setAttribute('data-warga-percent',(0,__f4.globals.String)(result.wargaPercent));
  }catch(error){
   member.textContent='—';env.textContent='—';
   member.title='Persentase belum dapat dimuat';env.title='Persentase belum dapat dimuat';
  }
 })();
 try{await inFlight}finally{inFlight=null}
}
__f4.globals.document.addEventListener('toggle',event=>{if(event.target?.id==='f4MemberFlow'&&event.target.open)refresh()},true);
__f4.globals.document.addEventListener('visibilitychange',()=>{if(!__f4.globals.document.hidden)refresh()});
__f4.window.addEventListener('pageshow',refresh);
if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',refresh);else refresh();
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/bank-sampah/index.html#inline-2",function(__f4){



/* Only portal integration: no replacement UI, fields, CSS, or Bank Sampah original functions. */
(()=>{
  'use strict';
  const inPortal=true; // Native shared shell is the host
  if(inPortal)__f4.globals.document.documentElement.classList.add('f4-bank-embedded');
  let currentRole='public',identity={},pendingSection='',lastAdminSection='',pendingProfile=false;
  const accountGroup=__f4.globals.v16Groups.find(group=>group.id==='settings');
  const originalAccountTabs=accountGroup?accountGroup.tabs.slice():[];
  function syncAccountTabs(){
    // Original account management stays visible for Superadmin when opening
    // "Pengaturan Akun Warga"; Dashboard is a separate root destination.
    if(accountGroup)accountGroup.tabs=originalAccountTabs.slice();
  }
  function openOriginalProfile(){
    if(currentRole==='public'||!__f4.globals.profile){pendingProfile=true;return;}
    pendingProfile=false;
    // The authenticated visitor may currently be on the public page.
    // goPage() alone changes a HIDDEN dashboard; reveal it first.
    if(__f4.globals.document.getElementById('dashboardView')?.classList.contains('hidden'))
      (0,__f4.globals.showDashboard)(__f4.globals.profile);
    (0,__f4.globals.goPage)('profile');
    if(inPortal)__f4.window.parent.postMessage({type:'f4:bank-profile-opened'},__f4.globals.location.origin);
  }
  __f4.window.f4OpenBankProfile=openOriginalProfile;
  // Back from a public page may restore a private view only if the same session is active.
  __f4.window.f4BankRevealPrivateForHistory=()=>{
    if(currentRole==='public'||!__f4.globals.profile)return false;
    const dashboard=__f4.globals.document.getElementById('dashboardView');
    if(dashboard?.classList.contains('hidden'))(0,__f4.globals.showDashboard)(__f4.globals.profile);
    return !dashboard?.classList.contains('hidden');
  };
  function openMemberSavings(){
    if(currentRole!=='warga'||!__f4.globals.profile||__f4.globals.profile.peran!=='Warga')return;
    if(__f4.globals.document.getElementById('dashboardView')?.classList.contains('hidden'))(0,__f4.globals.showDashboard)(__f4.globals.profile);
    (0,__f4.globals.goPage)('pribadi');
  }
  function syncPublicSavingsButton(){
    const banner=__f4.globals.document.querySelector('#v11Public .v17-public-banner');
    if(!banner)return;
    const left=banner.firstElementChild||banner;
    const isMember=currentRole==='warga'&&__f4.globals.profile?.peran==='Warga';
    const isManager=['admin','superadmin'].includes(currentRole)&&__f4.globals.profile?.peran==='Admin';
    let saving=__f4.globals.document.getElementById('f4-public-my-savings');
    let manage=__f4.globals.document.getElementById('f4-public-manage-bank');
    if(isMember){
      if(!saving){saving=__f4.globals.document.createElement('button');saving.id='f4-public-my-savings';saving.type='button';saving.className='f4-public-my-savings';saving.textContent='Lihat Tabungan Saya';saving.onclick=openMemberSavings;left.append(saving);}
    }else saving?.remove();
    if(isManager){
      if(!manage){manage=__f4.globals.document.createElement('button');manage.id='f4-public-manage-bank';manage.type='button';manage.className='f4-public-my-savings';manage.textContent='Kelola Bank Sampah';manage.onclick=()=>{
        if(__f4.globals.document.getElementById('dashboardView')?.classList.contains('hidden'))(0,__f4.globals.showDashboard)(__f4.globals.profile);
        (0,__f4.globals.goPage)('dashboard');
      };left.append(manage);}
    }else manage?.remove();
  }
  // Reuse the original Bank Sampah page for savings, profile and every
  // admin tab. Only a contextual shortcut is added to the public banner.
  const originalPublic=__f4.globals.v11ShowPublic;
  __f4.globals.v11ShowPublic=function(...args){
    const value=originalPublic(...args);
    syncPublicSavingsButton();
    return value;
  };
  function syncReturnButton(){
    const list=__f4.globals.document.getElementById('v16NavList');
    if(!list||currentRole==='public')return;
    let back=list.querySelector('.f4-back-management,.f4-back-account');
    if(!back){
      back=__f4.globals.document.createElement('button');back.type='button';
      list.appendChild(back);
    }
    back.className='v16-item '+(currentRole==='superadmin'?'f4-back-management':'f4-back-account');
    const label=currentRole==='superadmin'?'Menu Pengelolaan':currentRole==='warga'?'Kartu & Profil':'Profil pengurus';
    const labelNode=__f4.globals.document.createElement('span');labelNode.className='f4-bank-nav-label';labelNode.textContent=label;
    back.setAttribute('aria-label',label);back.replaceChildren((0,__f4.globals.v16Icon)(currentRole==='superadmin'?'back':'user'),labelNode);
    back.onclick=()=>currentRole==='superadmin'
      ?__f4.window.parent.postMessage({type:'f4:manage-home'},__f4.globals.location.origin)
      :openOriginalProfile();
  }
  const originalNavBuilder=__f4.globals.v16BuildNav;
  __f4.globals.v16BuildNav=function(...args){
    const result=originalNavBuilder(...args);
    syncReturnButton();
    return result;
  };
  const invokeLogin=()=>{
    if(inPortal)__f4.window.parent.postMessage({type:'f4:show-login'},__f4.globals.location.origin);
    else __f4.globals.document.getElementById('authView')?.classList.remove('hidden');
  };
  if(inPortal){
    __f4.globals.document.body.classList.add('f4-embedded-bank');
    // Tag <base target="_top"> dapat membuka tautan keluar dari
    // iframe. Biarkan tautan #v17... tetap membuka bagian dalam halaman.
    const base=__f4.globals.document.querySelector('base[target="_top"]');
    if(base)base.target='_self';
    __f4.globals.v11ShowLogin=invokeLogin;
    __f4.globals.doLogout=()=>{
      const button=__f4.window.parent.document?.querySelector('[data-account-action="logout"]');
      if(button)button.click();
      else __f4.window.parent.postMessage({type:'f4:logout-request'},__f4.globals.location.origin);
    };
  }
  let activeAccountKey='public';
  function activate(role,account){
    try{
    const nextRole=role||'public';
    const nextIdentity=account||{};
    const nextAccountKey=nextRole==='public'?'public':
      (0,__f4.globals.String)(nextIdentity.accountId||'').trim()
      ?'account:'+(0,__f4.globals.String)(nextIdentity.accountId).trim()
      :nextRole+':'+(0,__f4.globals.String)(nextIdentity.wargaId||nextIdentity.nama||'').trim();
    const matching=!!__f4.globals.profile&&currentRole===nextRole&&activeAccountKey===nextAccountKey;
    if(!matching){
      // Reset before the next role is applied. No prior account's private
      // cards, media, observers, or pending navigation can bleed across logins.
      __f4.window.f4BankResetForAccountSwitch?.();
      lastAdminSection='';pendingSection='';pendingProfile=false;
    }
    activeAccountKey=nextAccountKey;
    currentRole=nextRole;identity=nextIdentity;
    __f4.globals.document.body.dataset.f4BankRole=currentRole;
    syncAccountTabs();
    if(matching&&currentRole!=='public'){
      // Satu akun, satu nama tampilan. Sinkronkan header/kartu saat nama diedit,
      // tanpa memuat ulang data transaksi atau mengganti identitas pembukuan.
      if(__f4.globals.profile&&identity.nama&&identity.nama!==__f4.globals.profile.nama){
        __f4.globals.profile.nama=identity.nama;
        (0,__f4.globals.$)('pName').textContent=__f4.globals.profile.nama;
        (0,__f4.globals.$)('greeting').textContent='Halo, '+(__f4.globals.profile.peran==='Admin'?__f4.globals.profile.nama:(0,__f4.globals.f4BankDisplayWargaName)(__f4.globals.profile.nama));
        (0,__f4.globals.$)('welcomeName').textContent=(0,__f4.globals.f4BankDisplayWargaName)(__f4.globals.profile.nama);
        if((0,__f4.globals.$)('v15AccountName'))(0,__f4.globals.$)('v15AccountName').textContent=__f4.globals.profile.peran==='Admin'?__f4.globals.profile.nama:(0,__f4.globals.f4BankDisplayWargaName)(__f4.globals.profile.nama);
        __f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-bank-display-name-synced',{detail:{nama:__f4.globals.profile.nama}}));
      }
      syncReturnButton();
      if(pendingProfile)openOriginalProfile();
      else if(pendingSection){const page=pendingSection;pendingSection='';openAdmin(page);}
      else syncPublicSavingsButton();
      return;
    }
    if(currentRole==='public'){
      __f4.globals.token='';__f4.globals.profile=null;lastAdminSection='';pendingSection='';pendingProfile=false;
      (0,__f4.globals.v11ShowPublic)();__f4.window.f4BankReconcileAccount?.();
      return;
    }
    __f4.globals.token='cloudflare-session-readonly';
    const p={
      nama:identity.nama||'Akun aktif',
      peran:currentRole==='warga'||currentRole==='anggota'?'Warga':'Admin',
      rumah:identity.rumah||'',wargaId:identity.wargaId||''
    };
    (0,__f4.globals.showDashboard)(p);
    __f4.window.f4BankReconcileAccount?.();
    syncReturnButton();
    const requested=pendingSection||lastAdminSection;
    pendingSection='';
    if(pendingProfile){openOriginalProfile();return;}
    if(requested&&['admin','superadmin'].includes(currentRole))openAdmin(requested);
    }finally{
      // Release initial screen only after the selected public/private view is ready.
      __f4.globals.document.documentElement.classList.remove('f4-bank-auth-pending');
    }
  }
  function openAdmin(section){
    const allowed=['dashboard','setoran','riwayat','penjualan','riwayatJual','rekonsiliasi','pengesahan','tabungan','biaya','laporan','kegiatan','dokumentasi','inventaris','master','admin','progress'];
    const target=currentRole==='superadmin'&&section==='kegiatan'?'dokumentasi':
      allowed.includes(section)?section:'dashboard';
    // Pesan bisa tiba sebelum pesan login/role; jangan hilangkan pilihan menu.
    if(currentRole==='public'){pendingSection=target;return;}
    if(!['admin','superadmin'].includes(currentRole))return;
    lastAdminSection=target;
    if(!__f4.globals.profile){pendingSection=target;return;}
    // Do not switch a hidden admin tab while public content stays visible.
    if(__f4.globals.document.getElementById('dashboardView')?.classList.contains('hidden'))
      (0,__f4.globals.showDashboard)(__f4.globals.profile);
    (0,__f4.globals.goPage)(target);
    if(inPortal)__f4.window.parent.postMessage({type:'f4:bank-admin-opened',section:target},__f4.globals.location.origin);
  }
  __f4.window.addEventListener('message',event=>{
    if(!inPortal||event.origin!==__f4.globals.location.origin||event.source!==__f4.window.parent)return;
    if(event.data?.type==='f4:demo-role')activate(event.data.role,event.data.identity);
    if(event.data?.type==='f4:open-bank-admin')openAdmin((0,__f4.globals.String)(event.data.section||'dashboard'));
    if(event.data?.type==='f4:open-bank-profile')openOriginalProfile();
  });
  const bankMenuIsPublic=()=>__f4.globals.document.getElementById('dashboardView')?.classList.contains('hidden');
  const bankMenuOpen=()=>bankMenuIsPublic()
    ?!!__f4.globals.document.getElementById('v18PublicSide')?.classList.contains('open')
    :!!__f4.globals.document.getElementById('sideNav')?.classList.contains('open');
  function bankMenuClose(){
    __f4.globals.document.getElementById('v18PublicSide')?.classList.remove('open');
    __f4.globals.document.getElementById('v18PublicBackdrop')?.classList.remove('open');
    __f4.globals.document.getElementById('sideNav')?.classList.remove('open');
    __f4.globals.document.getElementById('v16Backdrop')?.classList.remove('open');
    if(inPortal)__f4.window.parent.postMessage({type:'f4:sidebar-state',portal:'bank-sampah',open:false},__f4.globals.location.origin);
  }
  __f4.window.f4ToggleBankMenu=()=>{
    if(bankMenuOpen()){
      if(__f4.globals.history.state?.f4BankSidebarOverlay)__f4.globals.history.back();
      else bankMenuClose();
      return;
    }
    if(inPortal)__f4.globals.history.pushState({...__f4.globals.history.state,f4BankSidebarOverlay:true},'',__f4.globals.location.href);
    if(bankMenuIsPublic()){
      __f4.globals.document.getElementById('v18PublicSide')?.classList.add('open');
      __f4.globals.document.getElementById('v18PublicBackdrop')?.classList.add('open');
    }else{
      __f4.globals.document.getElementById('sideNav')?.classList.add('open');
      __f4.globals.document.getElementById('v16Backdrop')?.classList.add('open');
    }
    if(inPortal)__f4.window.parent.postMessage({type:'f4:sidebar-state',portal:'bank-sampah',open:true},__f4.globals.location.origin);
  };
  if(inPortal){
    __f4.window.addEventListener('popstate',()=>{
      if(!__f4.globals.history.state?.f4BankSidebarOverlay)bankMenuClose();
    });
    __f4.globals.document.addEventListener('click',e=>{
      if(!bankMenuOpen())return;
      if(['v18PublicBackdrop','v16Backdrop'].includes(e.target?.id)){
        e.preventDefault();e.stopImmediatePropagation();
        __f4.window.f4ToggleBankMenu();
      }else if(e.target.closest('#v18PublicSide button,#sideNav button')){
        // Biarkan onclick navigasi berjalan dahulu. history.back() secara sinkron
        // di capture phase pernah memulihkan halaman sebelum menu dapat dibuka di HP.
        // Timer menunggu event click selesai di semua fase, termasuk onclick tombol.
        (0,__f4.globals.setTimeout)(()=>{
          if(__f4.globals.history.state?.f4BankSidebarOverlay)
            __f4.globals.history.replaceState({...__f4.globals.history.state,f4BankSidebarOverlay:false},'',__f4.globals.location.href);
          bankMenuClose();
        },0);
      }
    },true);
    __f4.globals.document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&bankMenuOpen()){e.preventDefault();e.stopImmediatePropagation();__f4.window.f4ToggleBankMenu();}
    },true);
  }
  if(inPortal){
    const photoStatus=__f4.globals.document.getElementById('v15PhotoStatus');
    if(photoStatus)new __f4.globals.MutationObserver(()=>{
      if(/berhasil disimpan/i.test(photoStatus.textContent||''))
        __f4.window.parent.postMessage({type:'f4:bank-avatar-updated'},__f4.globals.location.origin);
    }).observe(photoStatus,{childList:true,subtree:true,characterData:true});
    __f4.window.parent.postMessage({type:'f4:ready',portal:'bank-sampah'},__f4.globals.location.origin);
  }
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/bank-sampah/index.html#inline-3",function(__f4){



/* Keep original Bank Sampah UI, call its existing D1-connected form handlers
   from real button clicks. Browsers did not dispatch native submit in
   the integrated portal. This does not bypass any server authorisation. */
(function(){
 'use strict';
 const allowed=new __f4.globals.Set([
  'submitSetoran','submitSale','doChangePassword',
  'v8Confirm','v9Cairkan','v10SaveExpense',
  'v11SaveProgress','v11SaveAlbum','v11SaveMedia','v11SaveInventory',
  'v24SaveProgress','v27CancelBatch'
 ]);
 __f4.globals.document.addEventListener('click',function(event){
  const button=event.target?.closest?.('button[type="submit"]');
  const form=button?.form;if(!form||button.disabled)return;
  let name=(0,__f4.globals.String)(form.getAttribute('onsubmit')||'').match(/^([A-Za-z][A-Za-z0-9]*)\(event\)$/)?.[1]||'';
  if(form.id==='v24EditForm')name='v24SaveProgress';
  if(form.id==='v27CancelForm')name='v27CancelBatch';
  if(!allowed.has(name))return;
  event.preventDefault();
  if(!form.reportValidity())return;
  const fn=__f4.window[name];
  if(typeof fn!=='function'){__f4.globals.console.error('Bank form handler unavailable:',name);return;}
  event.stopPropagation();
  // Legacy handlers use e.target/e.currentTarget as the FORM, not the button.
  const submitEvent={preventDefault:()=>event.preventDefault(),target:form,currentTarget:form};
  __f4.globals.Promise.resolve(fn(submitEvent)).catch(err=>__f4.globals.console.error('Bank save handler error:',name,err));
 },true);
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/bank-sampah/index.html#inline-4",function(__f4){



(()=>{
 'use strict';
 const watched=['setWarga','v9Member'];
 let active=null;
 const parsed=label=>{
  const t=(0,__f4.globals.String)(label||'').replace(/\s*\(member:[^)]+\)/ig,'').trim();
  const m=t.match(/(?:[—•-]\s*|\s+)([A-Z]\d{1,2}\s*\/\s*\d{1,3})\b/i);
  return {nama:m?t.slice(0,m.index).trim():t,rumah:m?m[1].replace(/\s/g,'').toUpperCase():'—'};
 };
 // The member ID/full registered name stays intact in the original select.
 // Only the visible picker row and chosen label use 'Pak + first name'.
 const shortName=full=>__f4.window.f4BankDisplayWargaName(full);
 function enhance(select){
  if(!select||select.dataset.f4Picker)return;
  select.dataset.f4Picker='1';
  const wrap=__f4.globals.document.createElement('div');wrap.className='f4-warga-picker';
  select.parentNode.insertBefore(wrap,select);wrap.append(select);
  const trigger=__f4.globals.document.createElement('button');trigger.type='button';trigger.className='f4-warga-picker-open';trigger.setAttribute('aria-haspopup','listbox');
  const label=__f4.globals.document.createElement('span');trigger.append(label);
  const panel=__f4.globals.document.createElement('div');panel.className='f4-warga-picker-pop';panel.hidden=true;
  const search=__f4.globals.document.createElement('input');search.type='search';search.placeholder='Cari nama atau nomor rumah...';search.setAttribute('aria-label','Cari warga');
  const head=__f4.globals.document.createElement('div');head.className='f4-warga-picker-head';head.innerHTML='<span>Nama warga</span><span>Rumah</span>';
  const list=__f4.globals.document.createElement('div');list.className='f4-warga-picker-table';list.setAttribute('role','listbox');
  panel.append(search,head,list);wrap.append(trigger);__f4.globals.document.body.append(panel);
  const sync=()=>{
   const opt=select.selectedOptions[0];
   label.textContent=select.value&&opt?shortName(parsed(opt.textContent).nama):'Pilih warga';
  };
  function close(){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(active===panel)active=null}
  panel.f4Close=close;
  function render(){
   list.replaceChildren();
   const q=search.value.trim().toLocaleLowerCase('id-ID');
   const opts=[...select.options].filter(x=>x.value&&x.textContent.trim()!=='');
   for(const opt of opts){
    const info=parsed(opt.textContent);if(q&&!(0,__f4.globals.String)((opt.dataset.fullName||info.nama)+' '+info.nama+' '+info.rumah).toLocaleLowerCase('id-ID').includes(q))continue;
    const row=__f4.globals.document.createElement('button');row.type='button';row.className='f4-warga-picker-row';row.setAttribute('role','option');row.setAttribute('aria-selected',(0,__f4.globals.String)(select.value===opt.value));
    const name=__f4.globals.document.createElement('span');name.textContent=shortName(info.nama);
    const home=__f4.globals.document.createElement('span');home.textContent=info.rumah;home.className='f4-warga-home';
    row.append(name,home);row.onclick=()=>{select.value=opt.value;select.dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));sync();close();trigger.focus()};
    list.append(row);
   }
   if(!list.childElementCount){const empty=__f4.globals.document.createElement('p');empty.textContent='Warga tidak ditemukan';empty.style.padding='10px';list.append(empty)}
  }
  function place(){
   if(panel.hidden)return;
   const r=trigger.getBoundingClientRect(),vv=__f4.window.visualViewport;
   const vtop=vv?.offsetTop||0,vbottom=vtop+(vv?.height||__f4.window.innerHeight);
   const below=vbottom-r.bottom-8,above=r.top-vtop-8;
   const down=below>=200||below>=above;
   const height=__f4.globals.Math.min(390,__f4.globals.Math.max(110,down?below:above));
   const vleft=vv?.offsetLeft||0,vwidth=vv?.width||__f4.window.innerWidth;
   const width=__f4.globals.Math.min(__f4.globals.Math.max(r.width,310),vwidth-20);
   panel.style.width=width+'px';panel.style.maxHeight=height+'px';
   panel.style.left=__f4.globals.Math.max(vleft+10,__f4.globals.Math.min(vleft+vwidth-width-10,r.left))+'px';
   panel.style.top=(down?r.bottom+5:__f4.globals.Math.max(vtop+4,r.top-height-5))+'px';
   panel.style.bottom='auto';
  }
  trigger.onclick=()=>{
   if(!panel.hidden){close();return}
   if(active)active.f4Close?.();
   active=panel;panel.hidden=false;
   trigger.setAttribute('aria-expanded','true');search.value='';render();place();
  };
  __f4.window.addEventListener('resize',place,{passive:true});
  // Focusing the search box or collapsing browser chrome can scroll the
  // document. Keep the anchored picker positioned; do not close it.
  __f4.window.addEventListener('scroll',()=>{if(!panel.hidden)place()},{passive:true});
  __f4.window.visualViewport?.addEventListener('resize',place,{passive:true});
  __f4.window.visualViewport?.addEventListener('scroll',place,{passive:true});
  
  search.oninput=render;
  search.onkeydown=e=>{if(e.key==='Escape'){close();trigger.focus()}if(e.key==='Enter'){e.preventDefault();list.querySelector('button')?.click()}};
  select.addEventListener('change',sync);
  new __f4.globals.MutationObserver(sync).observe(select,{childList:true,subtree:true,attributes:true,attributeFilter:['selected']});
  sync();
  __f4.globals.document.addEventListener('pointerdown',e=>{if(!wrap.contains(e.target)&&!panel.contains(e.target))close()});
  __f4.globals.document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 }
 function scan(){watched.forEach(id=>enhance(__f4.globals.document.getElementById(id)))}
 if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',scan);else scan();
 const observer=new __f4.globals.MutationObserver(mutations=>{if(mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('select')||n.querySelector?.('select')))))scan()});
 observer.observe(__f4.globals.document.body,{childList:true,subtree:true});
})();

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/bank-sampah/index.html#inline-5",function(__f4){



(()=>{
 const sections={setoran:'v17Transparansi',kegiatan:'v17Kegiatan',informasi:'v17Informasi'};
 __f4.globals.document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[data-bank-section]');
  if(!link)return;
  const target=__f4.globals.document.getElementById(link.dataset.bankSection);
  if(!target)return;
  event.preventDefault();
  if(target.id==='v17Informasi')__f4.globals.document.getElementById('f4PublicMoreInfo')?.setAttribute('open','');
  const url=new __f4.globals.URL(__f4.globals.location.href);url.searchParams.set('bagian',__f4.globals.Object.keys(sections).find(x=>sections[x]===target.id));url.hash='';
  __f4.globals.history.pushState({...__f4.globals.history.state,f4BankPublicSection:target.id},'',url.pathname+url.search);
  target.scrollIntoView({behavior:'smooth',block:'start'});
 });
 const previous=__f4.globals.location.hash.slice(1);
 if(sections[new __f4.globals.URLSearchParams(__f4.globals.location.search).get('bagian')]){
  __f4.window.addEventListener('load',()=>{
    const section=sections[new __f4.globals.URLSearchParams(__f4.globals.location.search).get('bagian')];
    if(section==='v17Informasi')__f4.globals.document.getElementById('f4PublicMoreInfo')?.setAttribute('open','');
    __f4.globals.document.getElementById(section)?.scrollIntoView({block:'start'});
  },{once:true});
 }else if(__f4.globals.Object.values(sections).includes(previous)){
  const url=new __f4.globals.URL(__f4.globals.location.href);url.searchParams.set('bagian',__f4.globals.Object.keys(sections).find(k=>sections[k]===previous));url.hash='';
  __f4.globals.history.replaceState(__f4.globals.history.state,'',url.pathname+url.search);
  __f4.window.addEventListener('load',()=>__f4.globals.document.getElementById(previous)?.scrollIntoView({block:'start'}),{once:true});
 }
})();

});
