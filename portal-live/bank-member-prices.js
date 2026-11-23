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
 const priceTag=document.createElementNS("http://www.w3.org/2000/svg","svg");
 priceTag.setAttribute("viewBox","0 0 24 24");priceTag.setAttribute("aria-hidden","true");
 priceTag.innerHTML='<path d="m3 12 9-9h8v8l-9 9-8-8Z"/><circle cx="16" cy="8" r="1.2"/>';
 priceTag.setAttribute("fill","none");priceTag.setAttribute("stroke","currentColor");priceTag.setAttribute("stroke-width","1.9");priceTag.setAttribute("stroke-linecap","round");priceTag.setAttribute("stroke-linejoin","round");
 icon.append(priceTag);
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
const categories=["Kertas","Plastik","Logam","Campuran","Lainnya"];
let activeCategory=null;
function normalizedCategory(item){
 const value=window.f4BankItemCategory?.(item.name,item.category)||item.category||"Lainnya";
 const key=String(value).trim().toLocaleLowerCase("id-ID");
 if(/duplex|dupleks?/i.test(String(item.name||"")))return "Kertas";
 if(key==="umum")return "Campuran";
 return categories.find(cat=>cat.toLocaleLowerCase("id-ID")===key)||"Lainnya";
}
function closeCategory(restoreFocus=false){
 const bubble=$("f4BankPriceBubble");
 if(!bubble||bubble.hidden)return;
 bubble.hidden=true;
 if(activeCategory){
  const button=activeCategory;
  activeCategory=null;
  button.setAttribute("aria-expanded","false");
  button.closest(".f4-bank-prices-group")?.classList.remove("is-active");
  if(restoreFocus&&button.isConnected)button.focus({preventScroll:true});
 }
}
function positionCategory(){
 const page=$("bank-prices"),bubble=$("f4BankPriceBubble"),trigger=activeCategory;
 if(!page||!bubble||bubble.hidden||!trigger)return;
 const frame=page.getBoundingClientRect(),anchor=trigger.getBoundingClientRect();
 if(!frame.width||!frame.height)return;
 const width=Math.max(180,Math.min(350,frame.width-26));
 bubble.style.width=width+"px";
 bubble.style.maxHeight=Math.max(150,frame.height-26)+"px";
 const height=bubble.getBoundingClientRect().height;
 const left=Math.max(frame.left+12,Math.min(anchor.left,frame.right-width-12));
 const below=anchor.bottom+8,above=anchor.top-height-8;
 const top=below+height<=frame.bottom-12?below:
  above>=frame.top+12?above:Math.max(frame.top+12,Math.min(below,frame.bottom-height-12));
 bubble.style.left=Math.round(left)+"px";
 bubble.style.top=Math.round(top)+"px";
}
function openCategory(button,category,goods,method){
 const bubble=$("f4BankPriceBubble");
 if(!bubble)return;
 if(!bubble.hidden&&activeCategory===button){closeCategory(true);return;}
 closeCategory();
 activeCategory=button;
 button.setAttribute("aria-expanded","true");
 button.closest(".f4-bank-prices-group")?.classList.add("is-active");
 bubble.replaceChildren();
 const head=el("div","f4-bank-price-bubble-head");
 const info=el("div","");
 const title=el("strong","",category);
 title.id="f4BankPriceBubbleTitle";
 info.append(title,el("small","",goods.length+" jenis sampah"));
 const close=el("button","f4-bank-price-bubble-close");
 close.type="button";close.setAttribute("aria-label","Tutup rincian "+category);
 close.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
 close.onclick=()=>closeCategory(true);
 head.append(info,close);
 const list=el("div","f4-bank-price-bubble-list");
 for(const item of goods){
  const row=el("div","f4-bank-price-row");
  const amount=Number(item.priceRpPerKg);
  row.append(
   el("span","",item.name||"Barang"),
   el("strong","",Number.isSafeInteger(amount)&&amount>0?rp(amount)+"/kg":"Belum ditetapkan")
  );
  list.append(row);
 }
 const note=el("p","f4-bank-price-bubble-note",
  method==="fixed_buy_price"?"Harga beli warga per kg sesuai periode.":
  "Harga perkiraan per kg. Nilai akhir setelah penjualan sah.");
 bubble.append(head,list,note);
 bubble.hidden=false;
 positionCategory();
 close.focus({preventScroll:true});
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
  const status=el("p","f4-bank-prices-status","Memuat harga warga...");status.id="f4BankPriceStatus";
  status.setAttribute("role","status");
  const list=el("div","f4-bank-prices-groups");list.id="f4BankPriceList";
  const bubble=el("section","f4-bank-price-bubble");bubble.id="f4BankPriceBubble";
  bubble.setAttribute("role","region");bubble.setAttribute("aria-labelledby","f4BankPriceBubbleTitle");
  bubble.hidden=true;
  page.append(status,list,bubble);
  page.addEventListener("click",event=>{
   if(event.target===page){page.close();return;}
   if(!bubble.hidden&&!bubble.contains(event.target)&&!event.target.closest(".f4-bank-price-category-btn"))closeCategory();
  });
  page.addEventListener("keydown",event=>{
   if(event.key==="Escape"&&!bubble.hidden){
    event.preventDefault();event.stopPropagation();closeCategory(true);
   }
  },true);
  page.addEventListener("scroll",()=>{if(!bubble.hidden)closeCategory();},{passive:true});
  page.addEventListener("close",()=>{closeCategory();requestId++;});
  window.addEventListener("resize",positionCategory,{passive:true});
  window.visualViewport?.addEventListener("resize",positionCategory,{passive:true});
  document.body.append(page);
 }
 closeCategory();
 page.classList.remove("hidden");
 if(!page.open)page.showModal();
 const req=++requestId,status=$("f4BankPriceStatus"),host=$("f4BankPriceList");
 host.replaceChildren();
 status.textContent="Memuat daftar harga terbaru...";
 fetch("https://api.flamboyan4.web.id/api/member/bank/prices",{
  credentials:"include",mode:"cors",cache:"no-store",headers:{Accept:"application/json"}
 }).then(async response=>{
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.ok===false)throw Error(data.error||"Layanan harga belum tersedia");
  return {rows:Array.isArray(data.items)?data.items:[],method:data.method||"percentage"};
 }).then(result=>{
  if(requestId!==req)return;
  const rows=result.rows,method=result.method;
  const intro=page.querySelector(".f4-bank-prices-intro");
  if(intro)intro.textContent=method==="fixed_buy_price"?
   "Harga beli warga per kg. Berlaku sesuai periode.":
   "Tarif perkiraan warga per kg. Nilai akhir setelah penjualan sah.";
  const render=()=>{
   closeCategory();
   const selected=rows;
   const groups=new Map();
   for(const item of selected){
    const category=normalizedCategory(item);
    if(!groups.has(category))groups.set(category,[]);
    groups.get(category).push(item);
   }
   host.replaceChildren();
   for(const category of categories){
    const items=groups.get(category);
    if(!items?.length)continue;
    items.sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"id"));
    const tile=el("div","f4-bank-prices-group");
    const button=el("button","f4-bank-price-category-btn");
    button.type="button";button.setAttribute("aria-label","Lihat harga "+category);
    button.setAttribute("aria-controls","f4BankPriceBubble");
    button.setAttribute("aria-haspopup","true");button.setAttribute("aria-expanded","false");
    const picture=el("span","f4-bank-price-category-illustration");
    const icon=window.f4BankWasteCategoryIcon?.(category);
    if(icon)picture.append(icon);
    const title=el("strong","f4-bank-price-category-title",category);
    const meta=el("span","f4-bank-price-category-meta");
    const arrow=document.createElementNS("http://www.w3.org/2000/svg","svg");
    arrow.setAttribute("viewBox","0 0 24 24");arrow.setAttribute("fill","none");
    arrow.setAttribute("stroke","currentColor");arrow.setAttribute("stroke-width","2");
    arrow.setAttribute("stroke-linecap","round");arrow.setAttribute("stroke-linejoin","round");
    arrow.setAttribute("aria-hidden","true");arrow.innerHTML='<path d="m9 18 6-6-6-6"/>';
    meta.append(el("small","",items.length+" jenis"),arrow);
    button.append(picture,title,meta);
    button.onclick=()=>openCategory(button,category,items,method);
    tile.append(button);host.append(tile);
   }
   status.textContent=selected.length+" jenis sampah tersedia";
   if(!selected.length)host.append(el("p","f4-bank-empty","Belum ada harga sampah yang tersedia."));
  };
  render();
 }).catch(error=>{
  if(requestId!==req)return;
  status.textContent="Tidak dapat memuat harga: "+(error.message||error);
  host.replaceChildren();
 });
}
window.F4MemberPrices={shortcut,show,close:()=>{const dialog=$("bank-prices");if(dialog?.open)dialog.close();}};
})();