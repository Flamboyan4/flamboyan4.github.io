/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/payment-footer.js",function(__f4){


/* Portal Utama: payment shortcut and account copy on desktop and mobile. */
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
 // The shell owns the canonical bank details.
 for(const account of __f4.globals.F4ResidentTools.accounts){
   for(const button of doc.querySelectorAll('[data-account-key="'+account.key+'"]')){
     button.dataset.accountCopy=account.number;
     const info=button.parentElement.querySelector('.f4-account-info,.f4-payment-desktop-info');
     if(info){info.querySelector('strong').textContent=account.bank;info.querySelector('small').textContent='a.n. '+account.owner;const number=info.querySelector('.f4-account-number');if(number)number.textContent=account.number;}
   }
 }
 const qris=options?.querySelector('.f4-payment-qris');if(qris)qris.href=__f4.globals.F4ResidentTools.qris;
 if(options){
   for(const row of root.querySelectorAll('.f4-account-item'))options.append(row.cloneNode(true));
   __f4.window.lucide?.createIcons?.();
 }
 function setOpen(open){
   if(!toggle||!menu)return;
   const visible=!!open;
   menu.hidden=!visible;toggle.setAttribute('aria-expanded',(0,__f4.globals.String)(visible));
 }
 if(toggle&&menu){
   toggle.addEventListener('click',()=>setOpen(menu.hidden));
   doc.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest?.('#f4-mobile-payment'))setOpen(false);});
   doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){setOpen(false);toggle.focus();}});
   __f4.window.f4OpenMobilePayment=()=>setOpen(true);
 }
 const copyNumber=value=>__f4.globals.F4ResidentTools.copyNumber(value);
 __f4.globals.document.addEventListener('click',async event=>{
   const button=event.target.closest?.('[data-account-copy]');
   if(!button||!button.closest('#modal-rekening,#f4-mobile-payment-menu'))return;
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
