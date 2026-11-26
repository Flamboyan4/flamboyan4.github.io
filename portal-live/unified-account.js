/* Compatibility for earlier links. The only account editor is Bank Sampah's original profile. */
(()=>{'use strict';
document.getElementById('f4-unified-account')?.remove();
document.body.classList.remove('f4-account-open');
window.f4OpenUnifiedAccount=()=>window.f4OpenAccountProfile?.();
window.f4CloseUnifiedAccount=()=>{};
})();
