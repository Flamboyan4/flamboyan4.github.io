(()=>{'use strict';window.__F4_DEMO__=true;
  window.__f4DemoNotify=(s)=>{try{window.parent.postMessage({type:'f4:notice',message:String(s)},location.origin)}catch{}};
  document.addEventListener('DOMContentLoaded',()=>{
    const flag=document.createElement('div');flag.setAttribute('role','note');flag.textContent='MODE PRATINJAU STRUKTUR — data contoh, tidak ada penyimpanan';
    flag.style.cssText='position:sticky;top:0;z-index:99999;background:#ffedb3;color:#604300;padding:7px 12px;text-align:center;font:700 12px system-ui;border-bottom:1px solid #deb250';
    document.body.prepend(flag);
    document.querySelectorAll('a[href]').forEach(a=>{
       const href=a.getAttribute('href')||'';
       if(href.startsWith('/'))a.addEventListener('click',e=>{e.preventDefault();window.__f4DemoNotify('Gunakan navigasi terpadu di bagian atas untuk berpindah portal.')});
    });
  });
  const originalFetch=window.fetch?.bind(window);
  window.fetch=(input,init={})=>{const method=(init?.method||'GET').toUpperCase();
    if(method!=='GET'){window.__f4DemoNotify('Aksi simpan diblokir: ini hanya pratinjau.');return Promise.resolve(new Response(JSON.stringify({ok:false,error:'Mode demo: tidak ada perubahan data.'}),{status:503,headers:{'content-type':'application/json'}}))}
    return Promise.resolve(new Response(JSON.stringify({ok:true,status:'success',data:[],transaksi:[],ringkasan:{},config:{},rumah:[],warga:[],riwayat:[]}),{status:200,headers:{'content-type':'application/json'}}));
  };
  const origOpen=window.open?.bind(window);window.open=(url,...args)=>{window.__f4DemoNotify('Tautan eksternal dan cetak dibatasi dalam pratinjau.');return null};
  window.addEventListener('message',e=>{if(e.origin!==location.origin||!e.data||e.data.type!=='f4:demo-role')return;document.body.dataset.previewRole=e.data.role});
})();