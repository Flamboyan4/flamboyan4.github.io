(()=>{'use strict';window.__F4_DEMO__=true;
  // Membuka sub-URL secara langsung tetap masuk ke navigasi dan login terpadu.
  if(window===window.top){
   const parts=location.pathname.split('/').filter(Boolean);
   const index=parts.indexOf('uji-terpadu');
   const target=parts[index+1]||'portal';
   if(['portal','rapat','bank-sampah','pembukuan'].includes(target)){
    location.replace(location.origin+'/uji-terpadu/#'+target);return;
   }
  }
  window.__f4DemoNotify=(s)=>{try{window.parent.postMessage({type:'f4:notice',message:String(s)},location.origin)}catch{}};
  document.addEventListener('DOMContentLoaded',()=>{
    // Tidak membuat bar kuning tambahan: identitas demo tersedia pada dialog Login.

    document.querySelectorAll('a[href]').forEach(a=>{
       const href=a.getAttribute('href')||'';
       if(href.startsWith('/'))a.addEventListener('click',e=>{
         e.preventDefault();
         const p=href.toLowerCase();
         const target=p.includes('banksampah')||p.includes('bank-sampah')?'bank-sampah':p.includes('pembukuan')?'pembukuan':'portal';
         window.parent.postMessage({type:'f4:navigate',target},location.origin);
       });
    });
  });
  const originalFetch=window.fetch?.bind(window);
  // GET requests use the real source. No fabricated success/empty datasets.
  window.fetch=(input,init={})=>{
    const method=String(init?.method||((typeof input==='object'&&input?.method)||'GET')).toUpperCase();
    if(method==='GET'||method==='HEAD')return originalFetch(input,init);
    window.__f4DemoNotify('Penyimpanan dari integrasi masih dikunci sampai izin backend tervalidasi.');
    return Promise.reject(Error('Penulisan data belum diaktifkan pada Uji Terpadu.'));
  };
  const origOpen=window.open?.bind(window);window.open=(url,...args)=>{if(!url||url==='about:blank')return origOpen?.('about:blank',...args)||null;window.__f4DemoNotify('Tautan eksternal tidak dibuka otomatis dari pratinjau.');return null};
  window.addEventListener('message',e=>{if(e.origin!==location.origin||!e.data||e.data.type!=='f4:demo-role')return;document.body.dataset.previewRole=e.data.role});
})();