/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/home-accessibility.js",function(__f4){


/* Keyboard access for existing clickable cards; no finance or session behavior changed. */
(()=>{'use strict';
  function makeKeyboardClickable(node,label){
    if(!node||node.getAttribute('role')==='button')return;
    node.setAttribute('role','button');
    node.setAttribute('tabindex','0');
    if(label)node.setAttribute('aria-label',label);
    node.addEventListener('keydown',event=>{
      if(event.target!==node || (event.key!=='Enter' && event.key!==' '))return;
      event.preventDefault();
      node.click();
    });
  }
  function init(){
    __f4.globals.document.querySelectorAll('div[onclick^="openModalArisan("]').forEach((node,index)=>
      makeKeyboardClickable(node,index===0?'Lihat arisan berjalan':'Lihat arisan berikutnya'));
    makeKeyboardClickable(__f4.globals.document.getElementById('bank-sampah'),'Buka portal Bank Sampah');
    makeKeyboardClickable(__f4.globals.document.getElementById('container-foto-jersey-single'),'Lihat galeri desain Jersey');
    makeKeyboardClickable(__f4.globals.document.getElementById('container-foto-gapura'),'Lihat galeri pembangunan Gapura');
    __f4.globals.document.querySelectorAll('div[onclick^="openDokumentasiPreviewAktif("]').forEach(node=>
      makeKeyboardClickable(node,'Lihat dokumentasi kegiatan'));
  }
  if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

});
