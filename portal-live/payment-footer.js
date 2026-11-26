/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/payment-footer.js",function(__f4){


/* Portal Utama: copy bank account numbers from inline desktop footer or mobile sheet.
   Opening/closing uses the existing global modal stack for Back and Escape. */
(()=>{
 'use strict';
 const root=__f4.globals.document.getElementById('modal-rekening');
 if(!root)return;
 const status=root.querySelector('#f4-account-copy-status');
 const timers=new __f4.globals.WeakMap();
 async function copyNumber(value){
   if(__f4.globals.navigator.clipboard?.writeText){
     try{await __f4.globals.navigator.clipboard.writeText(value);return true;}catch{}
   }
   const el=__f4.globals.document.createElement('textarea');
   el.value=value;
   el.setAttribute('readonly','');
   el.style.cssText='position:fixed;left:-9999px;top:0;opacity:0;';
   __f4.globals.document.body.appendChild(el);
   el.select();
   let ok=false;
   try{ok=__f4.globals.document.execCommand('copy');}catch{}
   el.remove();
   return ok;
 }
 __f4.globals.document.addEventListener('click',async event=>{
   const button=event.target.closest?.('[data-account-copy]');
   if(!button||!button.closest('#modal-rekening,footer#pembayaran'))return;
   const inSheet=root.contains(button);
   const number=button.getAttribute('data-account-copy')||'';
   if(!/^\d{8,20}$/.test(number))return;
   const label=button.querySelector('span');
   button.disabled=true;
   let ok=false;
   try{ok=await copyNumber(number)}finally{button.disabled=false;}
   if(inSheet&&(!root.isConnected||root.classList.contains('hidden')))return;
   const oldTimer=timers.get(button);
   if(oldTimer)(0,__f4.globals.clearTimeout)(oldTimer);
   if(label)label.textContent=ok?'Tersalin':'Salin';
   button.dataset.copied=(0,__f4.globals.String)(ok);
   if(status&&inSheet)status.textContent=ok?'Nomor rekening berhasil disalin.':'Gagal menyalin. Tekan lama nomor rekening untuk menyalin.';
   const timer=(0,__f4.globals.setTimeout)(()=>{
     if(label)label.textContent='Salin';
     delete button.dataset.copied;
     if(status&&inSheet)status.textContent='';
     timers.delete(button);
   },1800);
   timers.set(button,timer);
 });
})();

});
