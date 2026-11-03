/* Bank Sampah: global purchase policy kept in the existing Harga Barang screen.
   Only superadmins can save. Server validates immutable future-dated policy. */
(()=>{
 "use strict";
 const $=id=>document.getElementById(id);
 const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
 const endpoint="https://api.flamboyan4.web.id/api/admin/bank/policy";
 const today=()=>new Date(Date.now()+7*3600000).toISOString().slice(0,10);
 let loading=false;
 async function fetchPolicy(){
  const r=await fetch(endpoint,{credentials:"include",cache:"no-store",headers:{Accept:"application/json"}});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||d.ok===false)throw Error(d.error||"Gagal memuat aturan harga");
  return d;
 }
 function init(){
  const page=$("pageMaster");if(!page||$("f4BankPolicyCard"))return;
  // Permission is verified by the API before showing the policy editor.
  const card=el("details","f4-bank-policy-card");card.id="f4BankPolicyCard";card.hidden=true;
  const head=el("summary","f4-bank-policy-summary");
  const title=el("strong","","Aturan Harga & Bagi Hasil");
  const current=el("span","f4-bank-policy-current","Memuat aturan...");current.id="f4BankPolicyCurrent";
  head.append(title,current);
  const desc=el("p","f4-bank-policy-desc","Aturan baru hanya berlaku ke depan. Transaksi sah lama tidak berubah.");
  const form=el("form","f4-bank-policy-form");
  const method=el("select");method.name="method";method.required=true;
  method.add(new Option("Bagi hasil persentase","percentage"));
  method.add(new Option("Harga beli tetap per jenis","fixed_buy_price"));
  const effective=el("input");effective.type="date";effective.min=today();effective.value=today();effective.name="effectiveFrom";effective.required=true;
  const pct=el("input");pct.type="number";pct.min="1";pct.max="99";pct.step="1";pct.value="50";pct.name="wargaPercent";pct.required=true;
  const group=(name,input)=>{const label=el("label");label.append(el("span","",name),input);return label};
  const pctLabel=group("Hak warga (%)",pct);
  const change=()=>{pctLabel.hidden=method.value!=="percentage";pct.required=method.value==="percentage"};
  method.onchange=change;change();
  form.append(group("Metode yang berlaku",method),group("Mulai tanggal",effective),pctLabel);
  const submit=el("button","f4-bank-gold-action","Simpan Aturan Baru");
  submit.type="submit";form.append(submit);
  const message=el("p","f4-bank-policy-status","");message.id="f4BankPolicyStatus";message.setAttribute("role","status");
  card.append(head,desc,form,message);
  page.prepend(card);
  form.onsubmit=async event=>{
   event.preventDefault();if(loading)return;
   if(!window.confirm("Aturan baru berlaku untuk penjualan yang disiapkan setelah tanggal efektif. Data sah lama tidak berubah. Simpan?"))return;
   const payload={method:method.value,effectiveFrom:effective.value,wargaPercent:method.value==="percentage"?Number(pct.value):50};
   loading=true;submit.disabled=true;message.textContent="Menyimpan versi kebijakan...";
   try{
    const r=await fetch(endpoint,{method:"POST",credentials:"include",cache:"no-store",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
    const result=await r.json().catch(()=>({}));
    if(!r.ok||result.ok===false)throw Error(result.error||"Tidak dapat menyimpan");
    message.textContent=result.duplicate?"Tanggal aturan ini sudah tercatat.":"Versi aturan baru tersimpan. Setoran dan penjualan lama tidak dihitung ulang.";
    await load();
   }catch(e){message.textContent=e.message||"Gagal menyimpan aturan."}
   finally{loading=false;submit.disabled=false}
  };
  const load=async()=>{
   try{
    const data=await fetchPolicy(),active=data.current||{};
    if(data.canEdit!==true){card.remove();return;}
    card.hidden=false;
    form.hidden=false;
    desc.textContent=data.canEdit===true?
      "Aturan baru berlaku untuk penjualan berikutnya. Transaksi sah lama tetap.":
      "Perubahan aturan hanya untuk Superadmin.";
    current.textContent="Aktif: "+(active.method==="fixed_buy_price"?"Harga beli tetap per jenis":"Bagi hasil "+active.wargaPercent+"% warga / "+(100-active.wargaPercent)+"% Bank")+
      (active.effectiveFrom?" · berlaku sejak "+active.effectiveFrom:" · metode lama");
    if(!form.dataset.initialized){
     method.value=active.method||"percentage";pct.value=String(active.wargaPercent??50);change();form.dataset.initialized="1";
    }
   }catch(e){
    // No privileged controls may leak through the Admin interface on API failure.
    card.remove();
   }
  };
  load();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
