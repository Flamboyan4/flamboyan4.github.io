/* Flamboyan 4: mobile pull-to-refresh for the active same-origin portal iframe.
   The browser's native overscroll refresh is not reliable inside an iframe. */
(()=>{
  'use strict';
  const frame=document.getElementById('appframe');
  if(!frame)return;

  const style=document.createElement('style');
  style.id='f4-pull-refresh-style';
  style.textContent=[
    '#f4-pull-refresh{position:fixed;left:50%;top:65px;z-index:130;display:flex;align-items:center;gap:9px;visibility:hidden;opacity:0;pointer-events:none;padding:9px 15px;border:1px solid #dbe6df;border-radius:999px;background:#fff;color:#28533d;font:700 12px/1.3 system-ui,-apple-system,sans-serif;box-shadow:0 8px 28px #15352924;transform:translate(-50%,-18px);transition:opacity .15s,transform .15s}',
    '#f4-pull-refresh.show{visibility:visible;opacity:1;transform:translate(-50%,0)}',
    'body.portal-mode #f4-pull-refresh{border-color:#dedff0;color:#48418d}',
    'body.book-mode #f4-pull-refresh{border-color:#eddccc;color:#a7652f}',
    'body.superadmin-mode #f4-pull-refresh{border-color:#d8e5ef;color:#2d6593}',
    '#f4-pull-refresh .mark{font-size:21px;line-height:1;transform:rotate(-30deg)}',
    '#f4-pull-refresh.ready .mark{transform:rotate(50deg)}',
    '#f4-pull-refresh.loading .mark{animation:f4-pull-spin .75s linear infinite}',
    '@keyframes f4-pull-spin{to{transform:rotate(330deg)}}',
    '@media(min-width:1024px){#f4-pull-refresh{display:none!important}}',
    '@media(prefers-reduced-motion:reduce){#f4-pull-refresh{transition:none}#f4-pull-refresh.loading .mark{animation:none}}'
  ].join('\n');
  document.head.appendChild(style);

  const indicator=document.createElement('div');
  indicator.id='f4-pull-refresh';
  indicator.setAttribute('role','status');
  indicator.setAttribute('aria-live','polite');
  const mark=document.createElement('span');
  mark.className='mark';mark.textContent='↻';mark.setAttribute('aria-hidden','true');
  const label=document.createElement('span');
  label.textContent='Tarik untuk memperbarui';
  indicator.append(mark,label);
  document.body.appendChild(indicator);

  function install(){
    indicator.className='';
    if(window.innerWidth>1023)return;
    let doc,child;
    try{
      child=frame.contentWindow;doc=child.document;
      if(!doc?.body||doc.documentElement.dataset.f4PullRefreshAttached)return;
      doc.documentElement.dataset.f4PullRefreshAttached='1';
    }catch{return;}

    let tracking=false,pulled=0,originX=0,originY=0,reloading=false;
    const top=()=>Math.max(child.scrollY||0,doc.scrollingElement?.scrollTop||0,
      doc.documentElement.scrollTop||0,doc.body.scrollTop||0)<=3;
    function clear(){
      tracking=false;pulled=0;
      if(!reloading){indicator.className='';label.textContent='Tarik untuk memperbarui';}
    }
    function blocked(target){
      if(document.body.classList.contains('iframe-modal-open')||
         document.body.classList.contains('f4-menu-open')||
         document.getElementById('gate')?.classList.contains('visible')||
         !document.getElementById('login-shade').hidden||
         !document.getElementById('profile-shade').hidden||
         !document.getElementById('f4-account-page').hidden||
         !document.getElementById('f4-warga-panel').hidden)return true;
      if(target?.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"],.v21-modal,.v21-lightbox,.f4p-overlay'))return true;
      if(doc.querySelector('#sideNav.open,#v18PublicSide.open'))return true;
      // Do not refresh when a nested scroll area (table, sidebar, album) is scrolled.
      for(let el=target;el&&el!==doc.body&&el!==doc.documentElement;el=el.parentElement){
        if(el.nodeType!==1)continue;
        const css=child.getComputedStyle(el);
        if(el.scrollHeight>el.clientHeight+3&&/auto|scroll/.test(css.overflowY)&&el.scrollTop>2)return true;
      }
      return false;
    }
    doc.addEventListener('touchstart',e=>{
      clear();
      if(e.touches.length!==1||!top()||blocked(e.target))return;
      tracking=true;
      originX=e.touches[0].clientX;originY=e.touches[0].clientY;
    },{passive:true});
    doc.addEventListener('touchmove',e=>{
      if(!tracking||e.touches.length!==1)return;
      const x=e.touches[0].clientX-originX;
      const y=e.touches[0].clientY-originY;
      // Horizontal swipe (slider/album) and upward scroll must remain normal.
      if(y<0||Math.abs(x)>Math.max(18,y*.8)||!top()||blocked(e.target)){clear();return;}
      if(y<12)return;
      if(e.cancelable)e.preventDefault();
      pulled=y;
      indicator.classList.add('show');
      indicator.classList.toggle('ready',pulled>=95);
      label.textContent=pulled>=95?'Lepas untuk memperbarui':'Tarik untuk memperbarui';
    },{passive:false});
    doc.addEventListener('touchend',()=>{
      if(!tracking)return;
      if(pulled>=95&&!reloading&&top()){
        reloading=true;
        indicator.className='show loading';
        label.textContent='Memperbarui halaman…';
        // Full reload also rechecks the central session; cookies remain intact.
        window.location.reload();
      }else clear();
    },{passive:true});
    doc.addEventListener('touchcancel',clear,{passive:true});
  }


  // Full-screen account and management panels scroll inside their own containers.
  // Chrome does not trigger native pull-to-refresh for these fixed-height panels.
  function installOverlay(selector,isActive,restoreAccount=false){
    const scroller=document.querySelector(selector);
    if(!scroller)return;
    let tracking=false,pulled=0,originX=0,originY=0,reloading=false;
    const atTop=()=>scroller.scrollTop<=3;
    function clear(){
      tracking=false;pulled=0;
      if(!reloading){indicator.className='';label.textContent='Tarik untuk memperbarui';}
    }
    function blocked(target){
      if(target?.closest?.('input,textarea,select,button,[contenteditable="true"],[role="dialog"]'))return true;
      for(let el=target;el&&el!==scroller;el=el.parentElement){
        if(el.nodeType!==1)continue;
        const css=getComputedStyle(el);
        if(el.scrollHeight>el.clientHeight+3&&/auto|scroll/.test(css.overflowY)&&el.scrollTop>2)return true;
      }
      return false;
    }
    scroller.addEventListener('touchstart',e=>{
      clear();
      if(innerWidth>1023||!isActive()||e.touches.length!==1||!atTop()||blocked(e.target))return;
      tracking=true;originX=e.touches[0].clientX;originY=e.touches[0].clientY;
    },{passive:true});
    scroller.addEventListener('touchmove',e=>{
      if(!tracking||e.touches.length!==1)return;
      const dx=e.touches[0].clientX-originX;
      const dy=e.touches[0].clientY-originY;
      if(!isActive()||dy<0||Math.abs(dx)>Math.max(18,dy*.8)||!atTop()||blocked(e.target)){clear();return;}
      if(dy<12)return;
      if(e.cancelable)e.preventDefault();
      pulled=dy;indicator.classList.add('show');
      indicator.classList.toggle('ready',pulled>=95);
      label.textContent=pulled>=95?'Lepas untuk memperbarui':'Tarik untuk memperbarui';
    },{passive:false});
    scroller.addEventListener('touchend',()=>{
      if(!tracking)return;
      if(pulled>=95&&!reloading&&isActive()&&atTop()){
        reloading=true;indicator.className='show loading';
        label.textContent='Memperbarui halaman…';
        if(restoreAccount){
          try{sessionStorage.setItem('f4-pull-return-account','1')}catch{}
        }
        window.location.reload();
      }else clear();
    },{passive:true});
    scroller.addEventListener('touchcancel',clear,{passive:true});
  }

  installOverlay('#f4-unified-account .ua-content',()=>{
    const panel=document.getElementById('f4-unified-account');
    return !!panel&&!panel.hidden&&!panel.querySelector('.ua-side.open');
  },true);
  installOverlay('#f4-account-page main',()=>{
    const panel=document.getElementById('f4-account-page');
    return !!panel&&!panel.hidden;
  });
  installOverlay('#f4-warga-panel .f4-warga-main',()=>{
    const panel=document.getElementById('f4-warga-panel');
    return !!panel&&!panel.hidden;
  });

  frame.addEventListener('load',install);
  try{if(frame.contentDocument?.readyState==='complete')install();}catch{}
})();
