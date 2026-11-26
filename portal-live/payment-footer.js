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
 const doc=__f4.globals.document;
 const toggle=doc.getElementById('f4-mobile-payment-toggle');
 const menu=doc.getElementById('f4-mobile-payment-menu');
 const options=doc.getElementById('f4-mobile-payment-options');
 const mobileStatus=doc.getElementById('f4-mobile-payment-status');
 const mobile=__f4.window.matchMedia('(max-width:767px)');
 if(options){
   const qris=doc.querySelector('footer#pembayaran .f4-payment-qris');
   if(qris)options.append(qris.cloneNode(true));
   for(const row of root.querySelectorAll('.f4-account-item'))options.append(row.cloneNode(true));
   __f4.window.lucide?.createIcons?.();
 }
 function setOpen(open){
   if(!toggle||!menu)return;
   const visible=!!open&&mobile.matches;
   menu.hidden=!visible;toggle.setAttribute('aria-expanded',(0,__f4.globals.String)(visible));
 }
 if(toggle&&menu){
   toggle.addEventListener('click',()=>setOpen(menu.hidden));
   doc.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest?.('#f4-mobile-payment'))setOpen(false);});
   doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){setOpen(false);toggle.focus();}});
   __f4.window.addEventListener('resize',()=>{if(!mobile.matches)setOpen(false);});
   __f4.window.f4OpenMobilePayment=()=>setOpen(true);
 }
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
   if(!button||!button.closest('#modal-rekening,footer#pembayaran,#f4-mobile-payment-menu'))return;
   const inSheet=root.contains(button);
   const feedback=inSheet?status:menu?.contains(button)?mobileStatus:null;
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
   if(feedback)feedback.textContent=ok?'Nomor rekening berhasil disalin.':'Gagal menyalin. Tekan lama nomor rekening untuk menyalin.';
   const timer=(0,__f4.globals.setTimeout)(()=>{
     if(label)label.textContent='Salin';
     delete button.dataset.copied;
     if(feedback)feedback.textContent='';
     timers.delete(button);
   },1800);
   timers.set(button,timer);
 });
})();

});
