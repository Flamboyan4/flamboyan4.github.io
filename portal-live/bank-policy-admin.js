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
  const page=$("pageMaster");
  if(!page||page.classList.contains("hidden")||$("f4BankPolicyCard"))return;
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
    if(!card.isConnected||page.classList.contains("hidden")){card.remove();return;}
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

 function initWeighing(){
  const page=$("pageMaster");
  if(!page||page.classList.contains("hidden")||$("f4BankWeighingCard"))return;
  const card=el("section","f4-bank-weighing-editor");card.id="f4BankWeighingCard";card.hidden=true;
  const heading=el("h3","","Jadwal Penimbangan");
  const form=el("form","f4-bank-weighing-form");
  const freq=el("select");
  [["weekly","Setiap minggu"],["biweekly","Setiap 2 minggu"],["monthly","Setiap bulan"]].forEach(([value,label])=>freq.add(new Option(label,value)));
  const weekday=el("select");
  ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].forEach((name,i)=>weekday.add(new Option(name,String(i))));
  const anchor=el("input");anchor.type="date";anchor.value=today();
  const dayOfMonth=el("select");for(let n=1;n<=31;n++)dayOfMonth.add(new Option("Tanggal "+n,String(n)));
  const labeled=(label,input)=>{const node=el("label");node.append(el("span","",label),input);return node;};
  const freqRow=labeled("Frekuensi",freq),dayRow=labeled("Hari penimbangan",weekday);
  const anchorRow=labeled("Tanggal pelaksanaan pertama",anchor),monthRow=labeled("Tanggal setiap bulan",dayOfMonth);
  const preview=el("p","f4-bank-weighing-preview","Memuat jadwal…");
  const status=el("p","f4-bank-weighing-status","");
  status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const save=el("button","f4-bank-gold-action","Simpan Jadwal");
  save.type="submit";save.disabled=true;
  form.append(freqRow,dayRow,anchorRow,monthRow,preview,save,status);
  card.append(heading,form);page.prepend(card);
  const endpoint="https://api.flamboyan4.web.id";
  let loaded=null,busy=false,supportsRecurrence=false;
  const parseDay=raw=>new Date(raw+"T00:00:00Z");
  const fmt=date=>new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(date);
  function calculate(){
   dayRow.hidden=freq.value==="monthly";
   anchorRow.hidden=freq.value!=="biweekly";
   monthRow.hidden=freq.value!=="monthly";
   const now=parseDay(today());let date=new Date(now);
   if(freq.value==="weekly"){
    date.setUTCDate(date.getUTCDate()+(Number(weekday.value)-date.getUTCDay()+7)%7);
   }else if(freq.value==="biweekly"){
    const start=parseDay(anchor.value);
    if(!Number.isFinite(start.getTime())){preview.textContent="Pilih tanggal pertama yang valid.";return;}
    const diff=Math.ceil((now-start)/86400000),cycles=Math.max(0,Math.ceil(diff/14));
    date=new Date(start);date.setUTCDate(start.getUTCDate()+cycles*14);
    if(anchor.value)weekday.value=String(start.getUTCDay());
   }else{
    const target=Number(dayOfMonth.value),y=date.getUTCFullYear(),m=date.getUTCMonth();
    date=new Date(Date.UTC(y,m,Math.min(target,new Date(Date.UTC(y,m+1,0)).getUTCDate())));
    if(date<now){
     date=new Date(Date.UTC(y,m+1,Math.min(target,new Date(Date.UTC(y,m+2,0)).getUTCDate())));
    }
   }
   preview.textContent="Penimbangan berikutnya: "+fmt(date);
  }
  function refresh(){
   calculate();
   // Legacy Worker currently only persists weekday. Never claim a recurrence was saved
   // without explicit confirmation of the enhanced server contract.
   const safe=freq.value==="weekly"||supportsRecurrence;
   save.disabled=busy||!loaded||!safe;
   if(!safe)status.textContent="Pilihan ini perlu dukungan API jadwal baru sebelum bisa disimpan.";
   else if(status.textContent.startsWith("Pilihan ini perlu"))status.textContent="";
  }
  [freq,weekday,anchor,dayOfMonth].forEach(input=>input.addEventListener("change",refresh));
  async function load(){
   busy=true;refresh();
   try{
    const privileges=await fetchPolicy();
    if(privileges.canEdit!==true){card.remove();return;}
    const response=await fetch(endpoint+"/api/public/bank/weighing-schedule",{credentials:"include",cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||data.ok===false||!Number.isInteger(data.weekday))throw Error(data.error||"Gagal memuat jadwal");
    loaded=data;
    supportsRecurrence=data.supportsRecurrence===true||data.schemaVersion>=2;
    freq.value=["weekly","biweekly","monthly"].includes(data.frequency)?data.frequency:"weekly";
    weekday.value=String(data.weekday);
    if(data.anchorDate)anchor.value=data.anchorDate;
    if(data.dayOfMonth)dayOfMonth.value=String(data.dayOfMonth);
    card.hidden=false;status.textContent="";
   }catch(error){
    card.hidden=false;loaded=null;
    status.textContent="Gagal memuat jadwal: "+(error.message||error);
   }finally{busy=false;refresh();}
  }
  form.addEventListener("submit",async event=>{
   event.preventDefault();if(save.disabled||busy)return;
   const payload={weekday:Number(weekday.value)};
   if(freq.value!=="weekly"){
    if(!supportsRecurrence)return;
    payload.frequency=freq.value;
    if(freq.value==="biweekly")payload.anchorDate=anchor.value;
    if(freq.value==="monthly")payload.dayOfMonth=Number(dayOfMonth.value);
   }else if(supportsRecurrence)payload.frequency="weekly";
   busy=true;refresh();status.textContent="Menyimpan jadwal…";
   try{
    const response=await fetch(endpoint+"/api/superadmin/bank/weighing-schedule",{
     method:"POST",credentials:"include",cache:"no-store",
     headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result.ok===false)throw Error(result.error||"Gagal menyimpan jadwal");
    if(freq.value!=="weekly"&&result.frequency!==freq.value)
     throw Error("Server belum mengonfirmasi frekuensi baru. Jadwal tidak dianggap tersimpan.");
    loaded=result;status.textContent="Jadwal tersimpan.";
   }catch(error){status.textContent="Gagal menyimpan: "+(error.message||error);}
   finally{busy=false;refresh();}
  });
  load();
 }

 function bind(){
  const page=$("pageMaster");if(!page)return;
  // Do not query privileged permissions while the visitor is still a guest.
  // Re-check after each visit so account switching never reuses prior privileges.
  new MutationObserver(()=>{
   if(page.classList.contains("hidden")){$("f4BankPolicyCard")?.remove();$("f4BankWeighingCard")?.remove();}
   else {init();initWeighing();}
  }).observe(page,{attributes:true,attributeFilter:["class"]});
  init();initWeighing();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();
