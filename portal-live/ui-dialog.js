/* Flamboyan 4 — website-owned asynchronous dialogs, mobile and desktop.
   Never intercept native window.confirm/alert/prompt globally. */
(()=>{
'use strict';
if(window.f4UiDialog)return;
const style=document.createElement('style');
style.textContent=`
.f4-ui-dialog{position:fixed!important;inset:0!important;z-index:2147483000!important;
 background:rgba(18,32,44,.54)!important;display:flex!important;align-items:center!important;
 justify-content:center!important;padding:18px!important;box-sizing:border-box!important;
 font-family:system-ui,-apple-system,"Segoe UI",sans-serif!important}
.f4-ui-dialog[hidden]{display:none!important}
.f4-ui-dialog *{box-sizing:border-box}
.f4-ui-dialog-panel{width:min(100%,440px);max-height:min(90dvh,700px);overflow-y:auto;
 background:#fff;border:1px solid #dce8e4;border-radius:20px;padding:24px;
 box-shadow:0 24px 70px rgba(12,27,23,.25)}
.f4-ui-dialog-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.f4-ui-dialog-icon{display:grid;place-items:center;width:42px;height:42px;flex:none;
 border-radius:13px;background:#eaf8f0;color:#087f5b}
.f4-ui-dialog[data-portal=superadmin] .f4-ui-dialog-icon{background:#f2edff;color:#6a50bd}
.f4-ui-dialog-icon svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.f4-ui-dialog h2{margin:0!important;font-size:19px!important;line-height:1.35!important;font-weight:750!important;color:#213b36!important}
.f4-ui-dialog p{margin:12px 0 20px!important;white-space:pre-line!important;overflow-wrap:anywhere!important;
 font-size:14px!important;line-height:1.55!important;color:#5a6e69!important}
.f4-ui-dialog input{display:block;width:100%;padding:12px 14px;margin:10px 0 20px;
 border:1px solid #ccdcd5;border-radius:11px;background:#fff;color:#263d34;font-size:15px}
.f4-ui-dialog-footer{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap}
.f4-ui-dialog button{min-width:100px;min-height:43px;padding:10px 15px;border:1px solid #dce7e1;
 border-radius:11px;font-size:13px;font-weight:700;cursor:pointer}
.f4-ui-dialog-cancel{background:#f5f7f7;color:#4b625c}
.f4-ui-dialog-accept{background:#087f5b;border-color:#087f5b!important;color:white}
.f4-ui-dialog[data-portal=superadmin] .f4-ui-dialog-accept{background:#6753bb;border-color:#6753bb!important}
.f4-ui-dialog[data-danger=true] .f4-ui-dialog-accept{background:#bd4646;border-color:#bd4646!important}
.f4-ui-dialog button:focus-visible,.f4-ui-dialog input:focus-visible{outline:3px solid #99d6c0;outline-offset:2px}
@media(max-width:500px){.f4-ui-dialog{padding:14px!important}.f4-ui-dialog-panel{padding:20px;border-radius:17px}.f4-ui-dialog-footer button{flex:1}}
`;
document.head.append(style);
let queue=Promise.resolve();
function openDialog({kind,message,title,danger=false,initial='',okText}){
 return new Promise(resolve=>{
  const portal=location.pathname.startsWith('/superadmin')?'superadmin':'bank';
  const overlay=document.createElement('div');
  overlay.className='f4-ui-dialog';overlay.dataset.portal=portal;
  overlay.dataset.danger=String(!!danger);
  const panel=document.createElement('section');panel.className='f4-ui-dialog-panel';
  panel.setAttribute('role',kind==='alert'?'alertdialog':'dialog');
  panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','f4-ui-dialog-h');
  panel.setAttribute('aria-describedby','f4-ui-dialog-p');
  const head=document.createElement('div');head.className='f4-ui-dialog-header';
  const pict=document.createElement('div');pict.className='f4-ui-dialog-icon';
  pict.innerHTML=danger?'<svg viewBox="0 0 24 24"><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3v.1"/></svg>'
   :'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></svg>';
  const h=document.createElement('h2');h.id='f4-ui-dialog-h';
  h.textContent=title||(kind==='prompt'?'Isi keterangan':kind==='alert'?'Pemberitahuan':danger?'Konfirmasi tindakan':'Konfirmasi');
  head.append(pict,h);
  const p=document.createElement('p');p.id='f4-ui-dialog-p';p.textContent=String(message||'');
  panel.append(head,p);
  let field=null;
  if(kind==='prompt'){
   field=document.createElement('input');field.type='text';field.value=String(initial??'');
   field.setAttribute('aria-label','Jawaban');field.autocomplete='off';
   panel.append(field);
  }
  const footer=document.createElement('div');footer.className='f4-ui-dialog-footer';
  let done=false;const last=document.activeElement;
  const close=value=>{
   if(done)return;done=true;
   document.removeEventListener('keydown',onKey,true);
   overlay.remove();if(last?.isConnected)last.focus({preventScroll:true});
   resolve(value);
  };
  const onKey=e=>{
   if(e.key==='Escape'){e.preventDefault();close(kind==='confirm'?false:null);}
   if(e.key==='Enter'&&kind!=='alert'&&(!field||e.target===field)){
    e.preventDefault();close(kind==='confirm'?true:field.value);
   }
  };
  if(kind!=='alert'){
   const cancel=document.createElement('button');cancel.type='button';cancel.className='f4-ui-dialog-cancel';cancel.textContent='Batal';
   cancel.onclick=()=>close(kind==='confirm'?false:null);footer.append(cancel);
  }
  const accept=document.createElement('button');accept.type='button';accept.className='f4-ui-dialog-accept';
  accept.textContent=okText||(kind==='alert'?'Tutup':danger?'Ya, lanjutkan':'Oke');
  accept.onclick=()=>close(kind==='confirm'?true:kind==='prompt'?field.value:undefined);
  footer.append(accept);panel.append(footer);overlay.append(panel);
  overlay.onclick=e=>{if(e.target===overlay)close(kind==='confirm'?false:null)};
  document.body.append(overlay);
  document.addEventListener('keydown',onKey,true);
  (field||accept).focus({preventScroll:true});
 });
}
function enqueue(options){
 const p=queue.then(()=>openDialog(options));queue=p.then(()=>{},()=>{});
 return p;
}
window.f4UiDialog={
 confirm:(message,options={})=>enqueue({kind:'confirm',message,...options}),
 prompt:(message,initial='',options={})=>enqueue({kind:'prompt',message,initial,...options}),
 alert:(message,options={})=>enqueue({kind:'alert',message,...options})
};
})();
