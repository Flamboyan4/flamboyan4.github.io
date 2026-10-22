// Formulir admin warga dan rumah, dibatasi superadmin oleh Worker.
(()=>{
 'use strict';
 const panel=document.getElementById('f4-warga-panel');
 if(!panel)return;
 const root=panel.querySelector('.f4-warga-main');
 const status=document.getElementById('f4-warga-status');
 const list=document.getElementById('f4-warga-list');
 const tool=panel.querySelector('.f4-warga-tools');
 const form=document.createElement('form');
 form.id='f4-warga-editor';form.hidden=true;form.noValidate=true;
 list.after(form);
 let data={},mode='',busy=false;
 const config={
  edit_house:{title:'Edit Data Rumah',fields:[['rumah','Nomor rumah','text',true],['nama_pemilik','Nama pemilik','text'],['kontak_pemilik','Nomor HP / WA pemilik','tel'],['status_rumah','Status rumah','text'],['tipe_unit','Tipe / kegunaan rumah','text'],['deskripsi_rumah','Deskripsi rumah','textarea'],['keterangan_rumah','Keterangan','textarea']]},
  add_house:{title:'Tambah Rumah',fields:[['rumah','Nomor rumah','text',true],['nama_pemilik','Nama pemilik','text'],['kontak_pemilik','Nomor HP / WA pemilik','tel'],['status_rumah','Status rumah','text'],['tipe_unit','Tipe / kegunaan rumah','text'],['deskripsi_rumah','Deskripsi rumah','textarea'],['keterangan_rumah','Keterangan','textarea']]},
  edit_resident:{title:'Edit Data Warga',fields:[['nama','Nama warga','text',true],['status_tinggal','Status tinggal','text'],['status_aktif','Status warga','text'],['nomor_hp','Nomor HP / WhatsApp','tel'],['keterangan_warga','Keterangan warga','textarea']]},
  add_resident:{title:'Tambah Warga',fields:[['household_id','Nomor rumah','select',true],['nama','Nama warga','text',true],['status_tinggal','Status tinggal','text'],['status_aktif','Status warga','text'],['nomor_hp','Nomor HP / WhatsApp','tel'],['keterangan_warga','Keterangan warga','textarea']]}
 };
 const element=(tag,txt)=>{
   const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n;
 };
 const homes=()=>[...new Map((window.f4ResidentData||[]).map(x=>[x.household_id,x.rumah])).entries()].filter(([id,code])=>id&&code);
 function show(modeName,row={}){
   if(!document.body.classList.contains('role-superadmin'))return;
   mode=modeName;data=row;
   const conf=config[mode];if(!conf)return;
   form.replaceChildren(element('h3',conf.title));
   const grid=element('div');grid.className='f4-warga-fields';
   for(const [key,label,type,required] of conf.fields){
     const outer=element('label');outer.textContent=label;
     let input;
     if(type==='textarea'){input=element('textarea');input.rows=3}
     else if(type==='select'){
       input=element('select');
       input.append(new Option('Pilih rumah',''));
       for(const [id,code] of homes())input.append(new Option(code,id));
     }else{input=element('input');input.type=type}
     input.name=key;input.required=!!required;
     input.value=String(row[key]??'');input.maxLength=type==='textarea'?500:key==='rumah'?25:160;
     if(type==='tel')input.autocomplete='tel';
     outer.append(input);grid.append(outer);
   }
   form.append(grid);
   const actions=element('div');actions.className='f4-warga-form-actions';
   const cancel=element('button','Batal');cancel.type='button';cancel.onclick=close;
   const save=element('button',mode.startsWith('add_')?'Tambah':'Simpan Perubahan');save.type='submit';
   actions.append(cancel,save);form.append(actions);
   tool.hidden=true;list.hidden=true;form.hidden=false;
   form.querySelector('input,select,textarea')?.focus();
 }
 function close(){
   form.hidden=true;tool.hidden=false;list.hidden=false;status.textContent='Silakan pilih data yang akan dikelola.';
 }
 form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(busy)return;
   const changes={action:mode};
   for(const input of form.querySelectorAll('[name]')){
     const v=input.value.trim();
     if(input.required&&!v){input.focus();status.textContent='Wajib diisi: '+input.closest('label')?.firstChild?.textContent;return}
     changes[input.name]=v;
   }
   if(mode==='edit_house')changes.household_id=data.household_id;
   if(mode==='edit_resident'){changes.payer_id=data.payer_id;changes.active=data.active!==0}
   const save=form.querySelector('[type=submit]');
   save.disabled=true;busy=true;status.textContent='Menyimpan ke Cloudflare D1…';
   try{
     const res=await fetch('https://api.flamboyan4.web.id/api/v2/admin/residents',{
       method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(changes)
     });
     const result=await res.json().catch(()=>({error:'Respons tidak valid'}));
     if(!res.ok||result.ok===false)throw Error(result.error||'HTTP '+res.status);
     close();await window.openWarga();
     status.textContent='Data berhasil disimpan ke Cloudflare D1.';
   }catch(e){status.textContent='Gagal menyimpan: '+e.message}
   finally{busy=false;save.disabled=false}
 });
 document.getElementById('f4-warga-new-house').onclick=()=>show('add_house');
 document.getElementById('f4-warga-new-person').onclick=()=>show('add_resident');
 window.f4OpenResidentForm=show;
 const original=window.openWarga;
 window.openWarga=async()=>{
   close();
   return original?.();
 };
})();
