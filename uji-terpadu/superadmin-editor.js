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
 documentation:{label:'Dokumentasi',section:'portal',columns:[['title','Judul dokumentasi','text',true],['event_on','Tanggal','date'],['description','Deskripsi','textarea'],['drive_url','Tautan album/folder Google Drive (foto dan video)','url'],['category','Kategori dokumentasi','category'],['sort_order','Urutan','number'],['visibility','Akses','visibility'],['active','Aktif','boolean']]},
 inventory:{label:'Inventaris',section:'portal',columns:[['name','Nama barang','text',true],['quantity','Jumlah','number'],['unit','Satuan','text'],['description','Kondisi, lokasi dan keterangan barang','textarea'],['category','Kategori barang','text'],['photo_ref','Tautan foto barang (Google Drive)','url'],['visibility','Akses','visibility']]},
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
function gotoOriginal(){if(window.f4SuperadminNavigate)window.f4SuperadminNavigate('overview');else window.openManagementHub?.();}
function nav(kind){
 if(kind==='residents'){if(!window.f4SuperadminNavigate)page.hidden=true;window.openWarga?.();return}
 window.openSuperadminEditor(kind);
}
function sideMenu(){
 const tab=types[active]?.section||'portal',group=categories[tab];
 // Within the dedicated fourth portal the native five-item Superadmin sidebar
 // owns all navigation. Never overwrite it with the legacy 4-item management UI.
 if(window.f4SuperadminNavigate&&window.f4RenderManagementSidebar){
   window.f4RenderManagementSidebar(tab);
   return;
 }
 document.body.classList.remove('f4-manage-book','f4-manage-portal','f4-manage-bank');
 document.body.classList.add(tab==='book'?'f4-manage-book':'f4-manage-portal');
 // Keep the four Superadmin root links and page title above the active sub-menu.
 if(typeof window.f4RenderManagementSidebar==='function')
   window.f4RenderManagementSidebar(tab==='book'?'book':'portal');
 else side.replaceChildren(node('strong','Pengelolaan Superadmin','f4-work-brand'));
 const subheading=node('strong',tab==='book'?'Kelola Pembukuan':'Kelola Portal Utama','f4-work-brand f4-submenu-heading');
 side.append(subheading);
 for(const [id,label] of group)side.append(btn(label,()=>nav(id),id===active?'f4-admin-nav active':'f4-admin-nav'));
 side.append(btn('← Menu Pengelolaan',gotoOriginal,'f4-admin-nav'));
}
async function send(url,options={}){
 const res=await fetch(url,{credentials:'include',cache:'no-store',...options});
 const d=await res.json().catch(()=>({error:'Respons API tidak dapat dibaca'}));
 if(!res.ok||d.ok===false)throw Error(d.error||'HTTP '+res.status);
 return d;
}
function header(label,description){
 window.f4SuperadminRememberTabScroll?.();
 main.replaceChildren();
 const def=types[active];
 const category=def?.section==='portal'?'Konten & Publikasi':'Data Acuan';
 const h=node('header',undefined,'f4-work-heading');
 h.append(node('h2',category),node('p',def?.section==='portal'?'Kelola konten untuk Portal Utama dan Bank Sampah':'Satu sumber data induk untuk semua modul'));
 main.append(h);
 window.f4SuperadminRenderTabs?.();
 const sub=node('section',undefined,'sa-module-heading');
 sub.append(node('h3','Kelola '+label),node('p',description));
 main.append(sub);
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
 if(['agenda','documentation','inventory','meetings','obligations'].includes(active)){
  const fields={
   agenda:[['title','Nama kegiatan'],['starts_on','Mulai'],['ends_on','Selesai'],['status','Status']],
   documentation:[['title','Judul dokumentasi'],['event_on','Tanggal'],['category','Kategori'],['drive_url','Album / Drive'],['visibility','Akses']],
   inventory:[['name','Nama barang'],['quantity','Jumlah'],['unit','Satuan'],['category','Kategori'],['description','Kondisi / Keterangan']],
   meetings:[['title','Judul rapat'],['meeting_on','Tanggal'],['summary','Ringkasan'],['document_ref','Dokumen']],
   obligations:[['nama','Nama warga'],['rumah','Rumah'],['qty_iuran_bulanan','Iuran bulanan'],['qty_kebersihan','Kebersihan'],['qty_kas_lorong','Kas lorong'],['qty_arisan','Arisan']]
  }[active];
  const scroll=node('div',undefined,'f4-obligation-scroll');
  const table=node('table',undefined,'f4-obligation-grid'),thead=node('thead'),head=node('tr');
  for(const [,label] of fields)head.append(node('th',label));
  head.append(node('th','Aksi'));thead.append(head);table.append(thead);
  const body=node('tbody');
  const dateText=v=>{const raw=String(v||'');const m=raw.match(/^(\\d{4})-(\\d\\d)-(\\d\\d)/);return m?m[3]+'/'+m[2]+'/'+m[1]:raw};
  const showValue=(x,key)=>{
   const raw=x[key];
   if(key==='drive_url'||key==='document_ref'){
    if(!raw)return node('span','Belum ada','f4-admin-muted');
    try{const url=new URL(raw);if(!['https:','http:'].includes(url.protocol))throw Error();
     const a=node('a','Buka tautan ↗');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.className='f4-admin-source-link';return a;}
    catch{return node('span','Tautan perlu diperiksa','f4-admin-muted')}
   }
   const v=raw==null||raw===''?'—':String(raw);
   const formatted=/(_on|starts_on|ends_on)$/.test(key)?dateText(v):v;
   const cell=node('span',formatted);if(key==='description'||key==='summary')cell.className='f4-admin-truncate';
   return cell;
  };
  for(const x of rows){
   const tr=node('tr');
   for(const [key] of fields){const td=node('td');td.append(showValue(x,key));tr.append(td)}
   const action=node('td');action.append(btn('Edit',()=>showForm(x)));tr.append(action);body.append(tr);
  }
  if(!rows.length){const tr=node('tr'),td=node('td','Tidak ada data yang cocok.');td.colSpan=fields.length+1;tr.append(td);body.append(tr)}
  table.append(body);scroll.append(table);list.append(scroll);return;
 }
  const scroll=node('div',undefined,'f4-obligation-scroll');
  const table=node('table',undefined,'f4-obligation-grid'),thead=node('thead'),tr=node('tr');
  for(const label of ['Nama warga','Rumah','Iuran bulanan','Kebersihan','Kas lorong','Arisan','Aksi'])tr.append(node('th',label));
  thead.append(tr);table.append(thead);
  const tbody=node('tbody');
  for(const x of rows){
   const row=node('tr');
   for(const key of ['nama','rumah','qty_iuran_bulanan','qty_kebersihan','qty_kas_lorong','qty_arisan'])
    row.append(node('td',String(x[key]??(key.startsWith('qty_')?'—':''))));
   const action=node('td');action.append(btn('Edit',()=>showForm(x)));row.append(action);tbody.append(row);
  }
  if(!rows.length){const row=node('tr'),cell=node('td','Tidak ada data yang cocok.');cell.colSpan=7;row.append(cell);tbody.append(row)}
  table.append(tbody);scroll.append(table);list.append(scroll);
  return;
 }
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
  else if(type==='category'){
   input=node('select');
   const cats=['Kerja Bakti','Arisan','Acara','Lainnya'];
   if(record?.[key]&&!cats.includes(record[key]))cats.unshift(record[key]);
   for(const c of cats)input.append(new Option(c,c));
  }
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
  const examples={title:'Contoh: Kerja Bakti Lingkungan',description:'Contoh: Kegiatan membersihkan lorong bersama warga',drive_url:'Contoh: https://drive.google.com/drive/folders/...',photo_ref:'Contoh: https://drive.google.com/file/d/.../view',rumah:'Contoh: A5/41',nama:'Contoh: Pak Heri',qty_iuran_bulanan:'Contoh: 1 (kali)',qty_kebersihan:'Contoh: 1 (kali)',qty_kas_lorong:'Contoh: 1 (kali)',qty_arisan:'Contoh: 0 (tidak ikut)',setting_value:'Contoh: 10 (tanggal setiap bulan)',amount_rp:'Contoh: 25000',summary:'Contoh: Hasil kesepakatan rapat warga',event_on:'Pilih tanggal kegiatan'};
  if(input.tagName!=='SELECT'&&type!=='readonly')input.placeholder=examples[key]||'Isi '+label.toLowerCase();
  if(record&&record[key]!=null)input.value=String(record[key]);
  else if(type==='boolean')input.value='1';
  else if(type==='visibility')input.value='publik';
  else if(type==='number')input.value='0';
  field.append(input);grid.append(field);
 }
 if(active==='documentation'||active==='inventory'){
  const msg=node('p',active==='documentation'?'Untuk banyak foto/video, gunakan satu tautan folder atau album Google Drive.':'Gunakan tautan Google Drive untuk foto barang. Foto tidak diunggah ke R2.','f4-admin-note');
  form.append(msg);
  const valueInput=form.querySelector('[name="'+(active==='documentation'?'drive_url':'photo_ref')+'"]');
  const media=btn('Buka tautan media',()=>{
    const url=String(valueInput?.value||'').trim();
    try{
      const parsed=new URL(url);
      if(!['https:','http:'].includes(parsed.protocol))throw Error();
      window.open(parsed.href,'_blank','noopener,noreferrer');
    }catch{msg.textContent='Masukkan URL Google Drive lengkap terlebih dahulu.'}
  },'f4-admin-btn');
  form.append(media);
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
 const d=await send(base+kind);
 return Array.isArray(d.data)?d.data:[];
}
window.f4CancelSuperadminEditor=()=>{requestSerial++;};
window.openSuperadminEditor=async(kind)=>{
 if(!inContext())return;
 if(kind==='residents'){nav(kind);return}
 if(!types[kind])return;
 active=kind;filter='';page.hidden=false;if(resident)resident.hidden=true;
 sideMenu();header(types[kind].label,'Mengambil data Cloudflare D1…');
 const serial=++requestSerial;
 const info=node('p','Memuat…','f4-admin-note');main.append(info);
 try{
  const nextRecords=await fetchData(kind);
  if(serial!==requestSerial||!main.contains(info))return;
  records=nextRecords;
  viewList();
 }
 catch(e){
  if(serial!==requestSerial||!main.contains(info))return;
  info.textContent='Tidak dapat membaca '+types[kind].label+': '+e.message+'. Jika Dokumentasi, jalankan migrasi tabel dokumentasi dahulu.';
 }
};
window.f4AdminEditorTypes=categories;
})();