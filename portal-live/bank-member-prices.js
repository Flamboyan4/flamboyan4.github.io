/* Harga Sampah untuk warga — hanya tarif warga, bukan nilai jual lapak. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=text;
 return node;
};
const rp=v=>"Rp "+Number(v||0).toLocaleString("id-ID");
let requestId=0;
function shortcut(home){
 if($("f4MemberPriceShortcut"))return;
 const b=el("button","f4-bank-price-shortcut");
 b.id="f4MemberPriceShortcut";b.type="button";
 const copy=el("span","f4-bank-price-shortcut-copy");
 copy.append(el("strong","f4-bank-price-shortcut-label","Daftar Harga"),
  el("small","","Tarif warga per kg"));
 const icon=el("span","f4-bank-price-shortcut-icon");
 const recycle=document.createElementNS("http://www.w3.org/2000/svg","svg");
 recycle.setAttribute("viewBox","0 0 24 24");recycle.setAttribute("aria-hidden","true");
 recycle.innerHTML='<path d="m3 12 9-9h8v8l-9 9-8-8Z"/><circle cx="16" cy="8" r="1.2"/>';
 recycle.setAttribute("fill","none");recycle.setAttribute("stroke","currentColor");recycle.setAttribute("stroke-width","1.9");recycle.setAttribute("stroke-linecap","round");recycle.setAttribute("stroke-linejoin","round");
 icon.append(recycle);
 const arrow=el("span","f4-bank-price-shortcut-arrow");
 const chevron=document.createElementNS("http://www.w3.org/2000/svg","svg");
 chevron.setAttribute("viewBox","0 0 24 24");chevron.setAttribute("aria-hidden","true");
 chevron.innerHTML='<path d="m9 18 6-6-6-6"/>';
 arrow.append(chevron);
 b.append(icon,copy,arrow);
 b.setAttribute("aria-label","Lihat daftar harga sampah untuk warga");
 b.onclick=show;
 home.append(b);
}
function show(){
 let page=$("bank-prices");
 if(!page){
  page=el("dialog","f4-bank-prices-screen f4-bank-sheet-modal");page.id="bank-prices";
  page.setAttribute("aria-label","Daftar harga sampah warga");
  const heading=el("div","f4-bank-modal-heading");
  heading.append(el("h2","","Daftar Harga"));
  const close=el("button","f4-bank-modal-close");close.type="button";
  close.setAttribute("aria-label","Tutup daftar harga");
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("fill","none");
  svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","2");
  svg.setAttribute("stroke-linecap","round");svg.setAttribute("aria-hidden","true");
  svg.innerHTML='<path d="M18 6 6 18M6 6l12 12"/>';close.append(svg);
  close.onclick=()=>page.close();heading.append(close);page.append(heading);
  page.append(el("p","f4-bank-prices-intro","Tarif khusus anggota per kg."));
  const search=el("input","f4-bank-price-search");search.type="search";search.id="f4BankPriceSearch";
  search.placeholder="Cari jenis sampah...";search.setAttribute("aria-label","Cari jenis sampah");
  const status=el("p","f4-bank-prices-status","Memuat harga warga...");status.id="f4BankPriceStatus";
  status.setAttribute("role","status");
  const list=el("div","f4-bank-prices-groups");list.id="f4BankPriceList";
  page.append(search,status,list);
  page.addEventListener("click",event=>{if(event.target===page)page.close();});
  document.body.append(page);
 }
 page.classList.remove("hidden");
 if(!page.open)page.showModal();
 const req=++requestId,status=$("f4BankPriceStatus"),host=$("f4BankPriceList"),search=$("f4BankPriceSearch");
 status.textContent="Memuat daftar harga terbaru...";
 fetch("https://api.flamboyan4.web.id/api/member/bank/prices",{
  credentials:"include",mode:"cors",cache:"no-store",headers:{Accept:"application/json"}
 }).then(async response=>{
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.ok===false)throw Error(data.error||"Layanan harga belum tersedia");
  return {rows:Array.isArray(data.items)?data.items:[],method:data.method||"percentage"};
 }).then(result=>{
  const rows=result.rows;
  const intro=$("bank-prices")?.querySelector(".f4-bank-prices-intro");
  if(intro)intro.textContent=result.method==="fixed_buy_price"?
   "Harga beli warga per kg. Berlaku sesuai periode.":
   "Tarif perkiraan warga per kg. Nilai akhir setelah penjualan sah.";
  if(requestId!==req)return;
  const render=()=>{
   const query=search.value.trim().toLocaleLowerCase("id-ID");
   const selected=rows.filter(r=>String(r.name||"").toLocaleLowerCase("id-ID").includes(query));
   const groups=new Map();
   for(const item of selected){
    const cat=String(item.category||"Lainnya").trim()||"Lainnya";
    if(!groups.has(cat))groups.set(cat,[]);
    groups.get(cat).push(item);
   }
   host.replaceChildren();
   for(const cat of [...groups.keys()].sort((a,b)=>a.localeCompare(b,"id"))){
    const block=el("section","f4-bank-prices-group");
    block.append(el("h3","",cat));
    const sorted=groups.get(cat).sort((a,b)=>{
     const price=x=>Number.isSafeInteger(Number(x.priceRpPerKg))&&Number(x.priceRpPerKg)>0?Number(x.priceRpPerKg):Infinity;
     return price(a)-price(b)||String(a.name||"").localeCompare(String(b.name||""),"id");
    });
    for(const item of sorted){
     const row=el("div","f4-bank-price-row");
     const price=Number(item.priceRpPerKg);
     row.append(el("span","",item.name||"Barang"),
      el("strong","",Number.isSafeInteger(price)&&price>0?rp(price)+"/kg":"Belum ditetapkan"));
     block.append(row);
    }
    host.append(block);
   }
   status.textContent=selected.length+" jenis sampah"+(query?" ditemukan":" tersedia");
   if(!selected.length)host.append(el("p","f4-bank-empty","Tidak ada jenis sampah yang cocok."));
  };
  search.oninput=render;render();
 }).catch(error=>{
  if(requestId!==req)return;
  status.textContent="Tidak dapat memuat harga: "+(error.message||error);
  host.replaceChildren();
 });
}
window.F4MemberPrices={shortcut,show,close:()=>{const dialog=$("bank-prices");if(dialog?.open)dialog.close();}};
})();