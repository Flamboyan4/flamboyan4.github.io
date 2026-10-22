/* Editor Superadmin — edit data asli (bukan dashboard ringkasan / data contoh). */
(()=>{
'use strict';
const page=document.getElementById('f4-account-page'),resident=document.getElementById('f4-warga-panel');
if(!page)return;
const main=page.querySelector('main'),side=page.querySelector('aside');
const base='https://api.flamboyan4.web.id/api/v2/admin/content/';
const types={
 projects:{label:'Project Card',section:'portal',columns:[['title','Nama projek','text',true],['description','Deskripsi','textarea'],['image_ref','Foto / gambar Google Drive','url'],['target_url','Link tujuan / #bagian','text'],['sort_order','Urutan','number'],['active','Aktif','boolean']]},
 agenda:{label:'Rencana Kegiatan',section:'portal',columns:[['title','Nama kegiatan','text',true],['starts_on','Tanggal mulai','date'],['ends_on','Tanggal selesai','date'],['location','Lokasi','text'],['description','Deskripsi','textarea'],['image_ref','Foto Google Drive','url'],['status','Status kegiatan','text'],['visibility','Tampilkan ke publik','visibility'],['sort_order','Urutan','number']]},
 documentation:{label:'Dokumentasi',section:'portal',columns:[['title','Judul dokumentasi','text',true],['event_on','Tanggal','date'],['description','Deskripsi','textarea'],['drive_url','URL Google Drive / album','url'],['category','Kategori','text'],['sort_order','Urutan','number'],['visibility','Akses','visibility'],['active','Aktif','boolean']]},
 inventory:{label:'Inventaris',section:'portal',columns:[['name','Nama barang','text',true],['quantity','Jumlah','number'],['unit','Satuan','text'],['description','Keterangan','textarea'],['category','Kategori','text'],['photo_ref','Foto / Google Drive','url'],['visibility','Akses','visibility']]},
 banners:{label:'Banner Slider',section:'portal',columns:[['title','Judul banner','text'],['image_ref','URL gambar Google Drive','url',true],['target_url','URL tujuan atau #bagian','text'],['sort_order','Urutan tampil','number'],['active','Aktif','boolean']]},
 meetings:{label:'Hasil Rapat',section:'portal',columns:[['title','Judul rapat','text',true],['meeting_on','Tanggal rapat','date'],['summary','Ringkasan rapat','textarea'],['document_ref','URL hasil rapat Google Docs / Drive','url'],['visibility','Akses','visibility']]},
 tariffs:{label:'Tarif Iuran',section:'book',key:'contribution_type',columns:[['contribution_type','Jenis Iuran','readonly'],['amount_rp','Tarif / iuran (Rp)','number',true]]},
 settings:{label:'Aturan Tanggal',section:'book',key:'setting_key',columns:[['setting_key','Aturan','readonly'],['setting_value','Tanggal (1–31)','number',true],['description','Keterangan','readonly']]},
 obligations:{label:'Kewajiban Iuran Warga',section:'book',key:'payer_id',columns:[['nama','Nama warga','readonly'],['rumah','Rumah','readonly'],['qty_iuran_bulanan','Iuran bulanan (x)','number',true],['qty_kebersihan','Kebersihan (x)','number',true],['qty_kas_lorong','Kas lorong (x)','number',true],['qty_arisan','Arisan (x)','number',true]]}
};
const categories={
 portal:[['projects','Project Card'],['agenda','Rencana Kegiatan'],['documentation','Dokumentasi'],['inventory','Inventaris'],['banners','Banner Slider'],['meetings','Hasil Rapat']],
 book:[['residents','Data Warga & Rumah'],['obligations','Kewajiban Iuran'],['tariffs','Tarif Iuran'],['settings','Aturan Tanggal']]
};
let active='',records=[],filter='',requestSerial=0,editing=false;
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text??'');if(cls)n.className=cls;return n};
function btn(text,fn,cls='f4-admin-btn'){const b=node('button',text,cls);b.type='button';b.onclick=fn;return b;}
function inContext(){return document.body.classList.contains('role-superadmin')}
function gotoOriginal(){
 page.hidden=true;
 const type=document.body.classList.contains('book-mode')?'pembukuan':'portal';
 document.querySelector('nav [data-target="'+type+'"]')?.click();
}
function nav(kind){
 if(kind==='residents'){page.hidden=true;window.openWarga?.();return}
 window.openSuperadminEditor(kind);
}
function sideMenu(){
 const tab=document.body.classList.contains('book-mode')?'book':'portal';
 const group=categories[tab];
 side.replaceChildren(node('strong',tab==='book'?'Pembukuan — Data Acuan':'Portal Utama — Kelola Konten','f4-work-brand'));
 for(const [id,label] of group)side.append(btn(label,()=>nav(id),id===active?'f4-admin-nav active':'f4-admin-nav'));
 side.append(btn('← Kembali ke Portal',gotoOriginal,'f4-admin-nav'));
}
async function send(url,options={}){
 const res=await fetch(url,{credentials:'include',cache:'no-store',...options});
 const d=await res.json().catch(()=>({error:'Respons API tidak dapat dibaca'}));
 if(!res.ok||d.ok===false)throw Error(d.error||'HTTP '+res.status);
 return d;
}
function header(label,description){
 main.replaceChildren();
 const h=node('header',undefined,'f4-work-heading');
 h.append(node('h2','Kelola '+label),node('p',description));
 h.append(btn('← Halaman Publik',gotoOriginal,'f4-work-back'));
 main.append(h);
}
function viewList(){
 const def=types[active];if(!def)return;
 editing=false;
 header(def.label,'Sumber Cloudflare D1 • Klik Edit untuk memperbarui data. Akun dan transaksi tidak berubah.');
 const tools=node('div',undefined,'f4-admin-controls');
 const search=node('input');search.placeholder='Cari data';search.value=filter;search.oninput=()=>{filter=search.value;populate();};
 tools.append(search);
 if(def.section==='portal')tools.append(btn('+ Tambah '+def.label,()=>showForm(null)));
 tools.append(btn('Muat Ulang',()=>window.openSuperadminEditor(active)));
 main.append(tools);
 const info=node('p',records.length+' data tersedia','f4-admin-note');main.append(info);
 const container=node('div',undefined,'f4-admin-list');container.id='f4-admin-list';main.append(container);
 populate();
}
function populate(){
 const list=document.getElementById('f4-admin-list');if(!list)return;
 list.replaceChildren();
 const query=filter.trim().toLowerCase();
 const def=types[active];
 const rows=records.filter(x=>!query||JSON.stringify(x).toLowerCase().includes(query));
 for(const x of rows){
  const item=node('article',undefined,'f4-admin-item');
  const info=node('div');
  const title=x.title||x.name||x.nama||x.contribution_type||x.setting_key||x.id;
  info.append(node('strong',title||'Tanpa judul'));
  const detail=[x.starts_on||x.event_on||x.meeting_on||x.rumah||'',x.status||x.visibility||''].filter(Boolean).join(' • ');
  info.append(node('small',detail));
  item.append(info,btn('Edit',()=>showForm(x)));list.append(item);
 }
 if(!rows.length)list.append(node('p','Tidak ada data yang cocok.','f4-admin-note'));
}
function showForm(record){
 if(!inContext())return;
 editing=true;
 const def=types[active],isNew=!record;
 header((isNew?'Tambah ':'Edit ')+def.label,'Formulir ini mengubah data master yang ditampilkan di portal. Tautan foto/video tetap berada di Google Drive.');
 const form=node('form',undefined,'f4-admin-editor');form.noValidate=true;
 const grid=node('div',undefined,'f4-admin-fields');form.append(grid);
 for(const [key,label,type,required] of def.columns){
  const field=node('label');field.append(node('span',label));
  let input;
  if(type==='textarea'){input=node('textarea');input.rows=3;}
  else if(type==='boolean'||type==='visibility'){
   input=node('select');
   const values=type==='boolean'?[['1','Ya / aktif'],['0','Tidak / nonaktif']]:[['publik','Publik'],['privat','Privat']];
   for(const [v,l] of values)input.append(new Option(l,v));
  }else{
   input=node('input');
   input.type=type==='readonly'?'text':type==='number'?'number':type==='date'?'date':'text';
   if(type==='number')input.min='0';
   if(type==='readonly')input.readOnly=true;
  }
  input.name=key;input.required=!!required;
  if(record&&record[key]!=null)input.value=String(record[key]);
  else if(type==='boolean')input.value='1';
  else if(type==='visibility')input.value='publik';
  else if(type==='number')input.value='0';
  field.append(input);grid.append(field);
 }
 const notice=node('p','','f4-admin-message');form.append(notice);
 const actions=node('div',undefined,'f4-warga-form-actions');
 actions.append(btn('Batal',viewList),btn('Simpan ke Cloudflare',()=>form.requestSubmit(),'f4-admin-primary'));
 form.append(actions);
 form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const values={},obj={action:'save'};
  if(record)obj.id=record[def.key||'id'];
  for(const input of form.querySelectorAll('[name]')){
   const value=input.value.trim();
   if(input.required&&!value){notice.textContent=input.name+' wajib diisi.';input.focus();return}
   if(input.readOnly)continue;
   const next=input.type==='number'?Number(value):input.name==='active'?Number(value):value;
   // Edit parsial: jangan mengirim ulang kolom lama yang tidak disentuh.
   // Misalnya URL relatif pada data projek lama tetap utuh tanpa melewati validasi URL baru.
   if(record&&Object.hasOwn(record,input.name)&&String(record[input.name]??'')===String(next))continue;
   values[input.name]=next;
  }
  if(def.section==='book'){
   if(active==='tariffs'){obj.contribution_type=record.contribution_type;obj.amount_rp=values.amount_rp;}
   else if(active==='settings'){obj.setting_key=record.setting_key;obj.setting_value=values.setting_value;}
   else{obj.payer_id=record.payer_id;Object.assign(obj,values);}
  }else {
   if(record&&!Object.keys(values).length){notice.textContent='Belum ada perubahan untuk disimpan.';return;}
   obj.values=values;
  }
  const submit=actions.lastChild;submit.disabled=true;notice.textContent='Menyimpan…';
  try{
   await send(base+active,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
   await fetchData(active);
   viewList(); const info=main.querySelector('.f4-admin-note');if(info)info.textContent='Data berhasil disimpan ke D1. '+records.length+' baris tersedia.';
  }catch(err){notice.textContent='Gagal menyimpan: '+err.message}
  finally{submit.disabled=false}
 });
 main.append(form);
}
async function fetchData(kind){
 const d=await send(base+kind);records=Array.isArray(d.data)?d.data:[];return records;
}
window.openSuperadminEditor=async(kind)=>{
 if(!inContext())return;
 if(kind==='residents'){nav(kind);return}
 if(!types[kind])return;
 active=kind;filter='';page.hidden=false;if(resident)resident.hidden=true;
 sideMenu();header(types[kind].label,'Mengambil data Cloudflare D1…');
 const serial=++requestSerial;
 const info=node('p','Memuat…','f4-admin-note');main.append(info);
 try{await fetchData(kind);if(serial!==requestSerial)return;viewList();}
 catch(e){if(serial!==requestSerial)return;info.textContent='Tidak dapat membaca '+types[kind].label+': '+e.message+'. Jika Dokumentasi, jalankan migrasi tabel dokumentasi dahulu.'}
};
window.f4AdminEditorTypes=categories;
})();