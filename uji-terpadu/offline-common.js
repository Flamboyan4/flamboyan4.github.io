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
  window.fetch=(input,init={})=>{const method=(init?.method||'GET').toUpperCase();
    // Only real Cloudflare GET reads can cross this old preview shim.
    // Write endpoints remain protected by the Worker staging feature flags.
    const url=String(typeof input==='string'?input:input?.url||'');
    if(method==='GET'&&url.startsWith('https://api.flamboyan4.web.id/')){
      return originalFetch(input,{...init,credentials:'include',mode:'cors',cache:'no-store'});
    }
    if(method==='GET' && /^https:\/\/(docs\.google\.com\/spreadsheets|lh3\.googleusercontent\.com)\//.test(url))return originalFetch(input,init);
    if(method!=='GET'){window.__f4DemoNotify('Aksi simpan diblokir: ini hanya pratinjau.');return Promise.resolve(new Response(JSON.stringify({ok:false,error:'Mode demo: tidak ada perubahan data.'}),{status:503,headers:{'content-type':'application/json'}}))}
    return Promise.resolve(new Response(JSON.stringify({ok:true,status:'success',data:[],transaksi:[],ringkasan:{},config:{},rumah:[],warga:[],riwayat:[]}),{status:200,headers:{'content-type':'application/json'}}));
  };
  const origOpen=window.open?.bind(window);window.open=(url,...args)=>{if(!url||url==='about:blank')return origOpen?.('about:blank',...args)||null;window.__f4DemoNotify('Tautan eksternal tidak dibuka otomatis dari pratinjau.');return null};
  window.addEventListener('message',e=>{if(e.origin!==location.origin||!e.data||e.data.type!=='f4:demo-role')return;document.body.dataset.previewRole=e.data.role});
})();