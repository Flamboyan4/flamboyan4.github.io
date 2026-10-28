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
    document.querySelectorAll('div[onclick^="openModalArisan("]').forEach((node,index)=>
      makeKeyboardClickable(node,index===0?'Lihat arisan berjalan':'Lihat arisan berikutnya'));
    makeKeyboardClickable(document.getElementById('bank-sampah'),'Buka portal Bank Sampah');
    makeKeyboardClickable(document.getElementById('container-foto-jersey-single'),'Lihat galeri desain Jersey');
    makeKeyboardClickable(document.getElementById('container-foto-gapura'),'Lihat galeri pembangunan Gapura');
    document.querySelectorAll('div[onclick^="openDokumentasiPreviewAktif("]').forEach(node=>
      makeKeyboardClickable(node,'Lihat dokumentasi kegiatan'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
