/* Editor Superadmin — edit data asli (bukan dashboard ringkasan / data contoh). */
(()=>{
'use strict';
const page=document.getElementById('f4-account-page'),resident=document.getElementById('f4-warga-panel');
if(!page)return;
const main=page.querySelector('main'),side=page.querySelector('aside');
const base='https://api.flamboyan4.web.id/api/v2/admin/content/';
const types={
 arisan:{label:'Jadwal Arisan',section:'portal',columns:[['period_on','Bulan pelaksanaan','date',true],['host_name','Tuan rumah dan nomor rumah','text',true],['status','Status','text']]},
 jersey:{label:'Pesanan Jersey',section:'portal',columns:[['group_key','Kelompok (bapak/ibu)','text',true],['sort_order','Nomor urut','number'],['resident','Nama dan rumah','text',true],['sleeves','Lengan','text'],['size','Ukuran','text'],['printed_name','Nama dan nomor punggung','text'],['payment_status','Status pembayaran','text'],['nominal_rp','Harga (Rp)','number'],['method','Metode','text']]},
 projects:{label:'Project Card',section:'portal',columns:[['title','Nama projek','text',true],['description','Deskripsi','textarea'],['image_ref','Foto / gambar Google Drive','url'],['target_url','Link tujuan / #bagian','text'],['sort_order','Urutan','number'],['active','Aktif','boolean']]},
 agenda:{label:'Rencana Kegiatan',section:'portal',columns:[['title','Nama kegiatan','text',true],['starts_on','Tanggal mulai','date'],['ends_on','Tanggal selesai','date'],['location','Lokasi','text'],['description','Deskripsi','textarea'],['image_ref','Foto Google Drive','url'],['status','Status kegiatan','text'],['visibility','Tampilkan ke publik','visibility'],['sort_order','Urutan','number']]},
 documentation:{label:'Dokumentasi',section:'portal',columns:[['title','Judul dokumentasi','text',true],['event_on','Tanggal','date'],['description','Deskripsi','textarea'],['drive_url','Tautan album/folder Google Drive (foto dan video)','url'],['category','Kategori dokumentasi','category'],['sort_order','Urutan','number'],['visibility','Akses','visibility'],['active','Aktif','boolean']]},
 inventory:{label:'Inventaris',section:'portal',columns:[['name','Nama barang','text',true],['quantity','Jumlah','number'],['unit','Satuan','text'],['description','Kondisi, lokasi dan keterangan barang','textarea'],['category','Kategori barang','text'],['photo_ref','Tautan foto barang (Google Drive)','url'],['visibility','Akses','visibility']]},
 banners:{label:'Banner Slider',section:'portal',columns:[['title','Judul banner','text'],['image_ref','URL gambar Google Drive','url',true],['target_url','URL tujuan atau #bagian','text'],['sort_order','Urutan tampil','number'],['active','Aktif','boolean']]},
 meetings:{label:'Hasil Rapat',section:'portal',columns:[['title','Judul rapat','text',true],['meeting_on','Tanggal rapat','date'],['summary','Ringkasan rapat','textarea'],['document_ref','URL hasil rapat Google Docs / Drive','url'],['visibility','Akses','visibility']]},
 tariffs:{label:'Tarif Iuran',section:'book',key:'contribution_type',columns:[['contribution_type','Jenis Iuran','readonly'],['amount_rp','Tarif / iuran (Rp)','number',true]]},
 settings:{label:'Aturan Tanggal',section:'book',key:'setting_key',columns:[['setting_key','Aturan','readonly'],['setting_value','Tanggal (1–31)','number',true],['description','Keterangan','readonly']]},
 bank_progress:{label:'Kegiatan Bank Sampah',section:'portal',columns:[]},
 bank_albums:{label:'Dokumentasi Bank Sampah',section:'portal',columns:[]},
 bank_inventory:{label:'Inventaris Bank Sampah',section:'portal',columns:[]},
 obligations:{label:'Kewajiban Iuran Warga',section:'book',key:'payer_id',columns:[['nama','Nama warga','readonly'],['rumah','Rumah','readonly'],['qty_iuran_bulanan','Iuran bulanan (x)','number',true],['qty_kebersihan','Kebersihan (x)','number',true],['qty_kas_lorong','Kas lorong (x)','number',true],['qty_arisan','Arisan (x)','number',true]]}
};
const categories={
 portal:[['projects','Project Card'],['agenda','Rencana Kegiatan'],['documentation','Dokumentasi'],['inventory','Inventaris'],['bank_progress','Kegiatan Bank Sampah'],['banners','Banner Slider'],['meetings','Hasil Rapat'],['arisan','Jadwal Arisan'],['jersey','Pesanan Jersey']],
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
 header(def.label,'Pilih Edit untuk memperbarui data tanpa mengubah transaksi warga.');
 const tools=node('div',undefined,'f4-admin-controls');
 const search=node('input');search.placeholder='Cari data';search.value=filter;search.oninput=()=>{filter=search.value;populate();};
 tools.append(search);
 if(def.section==='portal')tools.append(btn('+ Tambah '+def.label,()=>showForm(null)));
 if(active==='jersey')tools.append(btn('Cetak Laporan Jersey',printJerseyReport,'f4-admin-primary'));
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
 if(['arisan','agenda','documentation','inventory','meetings','obligations','jersey'].includes(active)){
  const fields={
   arisan:[['host_name','Nama tuan rumah'],['house_arisan','No. rumah'],['period_on','Jadwal'],['status','Status']],
   agenda:[['title','Nama kegiatan'],['starts_on','Mulai'],['ends_on','Selesai'],['status','Status']],
   documentation:[['title','Judul dokumentasi'],['event_on','Tanggal'],['category','Kategori'],['drive_url','Album / Drive'],['visibility','Akses']],
   inventory:[['name','Nama barang'],['quantity','Jumlah'],['unit','Satuan'],['category','Kategori'],['description','Kondisi / Keterangan']],
   meetings:[['title','Judul rapat'],['meeting_on','Tanggal'],['summary','Ringkasan'],['document_ref','Dokumen']],
   obligations:[['nama','Nama warga'],['rumah','Rumah'],['qty_iuran_bulanan','Iuran bulanan'],['qty_kebersihan','Kebersihan'],['qty_kas_lorong','Kas lorong'],['qty_arisan','Arisan']],
   jersey:[['group_key','Kelompok'],['sort_order','No'],['resident','Nama & Rumah'],['sleeves','Lengan'],['size','Ukuran'],['printed_name','Nama/No Punggung'],['nominal_rp','Nilai Pesanan'],['payment_status','Status Pembayaran'],['method','Keterangan']]
  }[active];
  const scroll=node('div',undefined,'f4-obligation-scroll');
  const table=node('table',undefined,'f4-obligation-grid'),thead=node('thead'),head=node('tr');table.dataset.module=active;
  for(const [,label] of fields)head.append(node('th',label));
  head.append(node('th','Aksi'));thead.append(head);table.append(thead);
  const body=node('tbody');
  const dateText=v=>{const raw=String(v||'');const m=raw.match(/^(\d{4})-(\d\d)-(\d\d)/);return m?m[3]+'/'+m[2]+'/'+m[1]:raw};
  const showValue=(x,key)=>{
   const raw=x[key];
   if(active==='arisan'&&(key==='host_name'||key==='house_arisan')){
    const full=String(x.host_name||'').trim(),match=full.match(/\b([A-Z]\d{1,2}\s*\/\s*\d{1,3})\s*$/i);
    const storedHouse=String(x.house_arisan||x.rumah||'').trim();
    const house=storedHouse|| (match?match[1].replace(/\s/g,'').toUpperCase():'—');
    const name=match?full.slice(0,match.index).replace(/[—,\s]+$/,'').trim()||full:full;
    return node('span',key==='house_arisan'?house:name);
   }
   if(key==='drive_url'||key==='document_ref'){
    if(!raw)return node('span','Belum ada','f4-admin-muted');
    try{const url=new URL(raw);if(!['https:','http:'].includes(url.protocol))throw Error();
     const a=node('a','Buka tautan ↗');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.className='f4-admin-source-link';return a;}
    catch{return node('span','Tautan perlu diperiksa','f4-admin-muted')}
   }
   const v=key==='category'&&x._f4_bank_kind
    ?(bankScoped(x)?'Bank Sampah':'Belum ditentukan')+' • '+bankCategoryLabel(raw)
    :raw==null||raw===''?'—':String(raw);
   const formatted=key==='nominal_rp'?'Rp '+Number(raw||0).toLocaleString('id-ID'):/(_on|starts_on|ends_on)$/.test(key)?dateText(v):v;
   const cell=node('span',formatted);if(key==='description'||key==='summary')cell.className='f4-admin-truncate';
   return cell;
  };
  for(const x of rows){
   const tr=node('tr');
   for(const [key] of fields){const td=node('td');td.append(showValue(x,key));tr.append(td)}
   const action=node('td');action.append(btn('Edit',()=>x._f4_bank_kind?showBankForm(x._f4_bank_kind,x):showForm(x)));tr.append(action);body.append(tr);
  }
  if(!rows.length){const tr=node('tr'),td=node('td','Tidak ada data yang cocok.');td.colSpan=fields.length+1;tr.append(td);body.append(tr)}
  table.append(body);scroll.append(table);list.append(scroll);return;
 }
 for(const x of rows){
  const item=node('article',undefined,'f4-admin-item');
  const info=node('div');
  const title=x.title||x.name||x.nama||x.contribution_type||x.setting_key||x.id;
  info.append(node('strong',title||'Tanpa judul'));
  const detail=[x.starts_on||x.event_on||x.meeting_on||x.rumah||'',x.status||x.visibility||''].filter(Boolean).join(' • ');
  info.append(node('small',detail));
  item.append(info,btn('Edit',()=>x._f4_bank_kind?showBankForm(x._f4_bank_kind,x):showForm(x)));list.append(item);
 }
 if(!rows.length)list.append(node('p','Tidak ada data yang cocok.','f4-admin-note'));
}
function printJerseyReport(){
 if(active!=='jersey'||!Array.isArray(records)||!records.length){
  alert('Belum ada pesanan Jersey untuk dicetak.');return;
 }
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=v=>'Rp '+Number(v||0).toLocaleString('id-ID');
 const incoming=row=>{
  const value=Number(row.nominal_rp||0);
  const text=String(row.payment_status||'').trim().toLowerCase();
  if(text.includes('lunas'))return value;
  const digits=text.match(/[0-9]+/g);
  if(digits){
   let amount=Number(digits.join(''));
   if(amount>0&&amount<1000)amount*=1000;
   return amount;
  }
  return text.includes('dp')||text.includes('cicil')?value*0.5:0;
 };
 const sections=[];
 let allOrders=0,allTotal=0,allReceived=0;
 for(const [kind,label] of [['bapak','Bapak-Bapak'],['ibu','Ibu-Ibu']]){
  const people=records.filter(x=>String(x.group_key||'').toLowerCase()===kind)
   .sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0));
  let total=0,received=0;
  const rows=people.map(x=>{
   const invoice=Number(x.nominal_rp||0),paid=incoming(x);
   total+=invoice;received+=paid;
   return '<tr><td class="center">'+esc(x.sort_order??'-')+'</td><td>'+esc(x.resident)+'</td>'+
    '<td>'+esc(x.sleeves||'-')+'</td><td>'+esc(x.size||'-')+'</td>'+
    '<td>'+esc(x.printed_name||'-')+'</td><td class="number">'+money(invoice)+'</td>'+
    '<td class="number">'+money(paid)+'</td><td>'+esc(x.payment_status||'-')+'</td></tr>';
  }).join('');
  allOrders+=people.length;allTotal+=total;allReceived+=received;
  sections.push('<section><h2>Pesanan '+label+' ('+people.length+' orang)</h2>'+
   '<table><thead><tr><th>No</th><th>Nama & Rumah</th><th>Lengan</th><th>Ukuran</th>'+
   '<th>Nama / No. Punggung</th><th>Nilai Pesanan</th><th>Dana Masuk</th><th>Status</th></tr></thead>'+
   '<tbody>'+(rows||'<tr><td colspan="8">Belum ada pesanan.</td></tr>')+'</tbody></table>'+
   '<p class="sub">Nilai pesanan: '+money(total)+' &nbsp;|&nbsp; Dana masuk: '+money(received)+
   ' &nbsp;|&nbsp; Kekurangan: '+money(Math.max(0,total-received))+'</p></section>');
 }
 const date=new Date().toLocaleDateString('id-ID',{dateStyle:'long'});
 const html='<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan Jersey Flamboyan 4</title>'+
 '<style>@page{size:A4 landscape;margin:11mm}*{box-sizing:border-box}body{font:11px Arial,sans-serif;color:#17223b;margin:0}'+
 'h1{font-size:19px;margin:0 0 5px}h2{font-size:13px;margin:14px 0 6px}header{border-bottom:2px solid #334155;padding-bottom:9px;margin-bottom:10px}'+
 'p{margin:4px 0}.meta{color:#475569}.summary{display:flex;gap:8px;margin:10px 0;break-inside:avoid}.box{border:1px solid #cbd5e1;flex:1;padding:8px;border-radius:5px}'+
 '.box strong{display:block;font-size:14px;margin-top:4px}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}'+
 'th{background:#edf2f9}th,td{border:1px solid #cbd5e1;padding:5px 4px;vertical-align:middle;overflow-wrap:anywhere}'+
 'tr{break-inside:avoid}th{text-align:left}.number{text-align:right;white-space:nowrap}.center{text-align:center}.sub{font-weight:bold;margin-top:6px}'+
 '.approval{text-align:right;margin-top:28px;break-inside:avoid}.approval strong{display:block;margin-top:45px}'+
 '.foot{font-size:10px;color:#64748b;border-top:1px solid #dbe3ef;margin-top:16px;padding-top:6px}'+
 '@media screen{body{max-width:1100px;margin:16px auto;padding:0 12px}}</style></head><body>'+
 '<header><h1>LAPORAN PESANAN JERSEY WARGA FLAMBOYAN 4</h1>'+
 '<p class="meta">RT 001 RW 026 Pesona Kahuripan 2 • Dicetak '+esc(date)+'</p></header>'+
 '<div class="summary"><div class="box">Jumlah Pemesan<strong>'+allOrders+' orang</strong></div>'+
 '<div class="box">Nilai Seluruh Pesanan<strong>'+money(allTotal)+'</strong></div>'+
 '<div class="box">Dana Terkumpul<strong>'+money(allReceived)+'</strong></div>'+
 '<div class="box">Sisa Kekurangan<strong>'+money(Math.max(0,allTotal-allReceived))+'</strong></div></div>'+
 sections.join('')+
 '<p class="meta">Catatan: dana masuk dihitung dari status Lunas/nominal DP. Status DP tanpa nominal menggunakan estimasi 50%, sesuai ringkasan portal.</p>'+
 '<div class="approval">Mengetahui, Humas Flamboyan 4<strong>Heri Juwandi</strong></div>'+
 '<p class="foot">Sumber: data pesanan Jersey pada flamboyan4.web.id</p>'+
 '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>';
 const w=window.open('','_blank');
 if(!w){alert('Izinkan pop-up laporan untuk mencetak atau menyimpan PDF.');return}
 w.document.write(html);w.document.close();
}
function showForm(record){
 if(!inContext())return;
 editing=true;
 if(record?._f4_bank_kind)return showBankForm(record._f4_bank_kind,record);
 const def=types[active],isNew=!record;
 header((isNew?'Tambah ':'Edit ')+def.label,'Formulir ini mengubah data master yang ditampilkan di portal. Tautan foto/video tetap berada di Google Drive.');
 const form=node('form',undefined,'f4-admin-editor');form.noValidate=true;main.append(form);
 if(active==='documentation'||active==='inventory'){
  const scopeField=node('label'),caption=node('span','Tujuan publikasi'),scope=node('select');
  scope.append(new Option('Portal Utama','portal'),new Option('Bank Sampah','bank-sampah'));
  scope.value='portal';scope.disabled=!!record&&!record._f4_bank_record;
  scope.onchange=()=>{
   if(scope.value!=='bank-sampah')return;
   if(active==='documentation'&&record?._f4_bank_record)showBankForm('bank_albums',record._f4_bank_record);
   else showBankForm(active==='documentation'?'bank_albums':'bank_inventory',null);
  };
  scopeField.append(caption,scope);form.append(scopeField);
 }
 const grid=node('div',undefined,'f4-admin-fields');form.append(grid);
 for(const [key,label,type,required] of def.columns){
  const field=node('label');field.append(node('span',label));
  let input;
  if(type==='textarea'){input=node('textarea');input.rows=3;}
  else if(active==='jersey'&&key==='group_key'){
   input=node('select');
   input.append(new Option('Bapak-Bapak','bapak'),new Option('Ibu-Ibu','ibu'));
  }
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
 actions.append(btn('Batal',viewList),btn('Simpan Perubahan',()=>{if(form.reportValidity())form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))},'f4-admin-primary'));
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
   else{
     obj.payer_id=record.payer_id;
     // Worker requires the complete four-component obligation record.
     // Partial edit payloads previously sent Number(undefined) -> NaN -> HTTP 400.
     const keys=['qty_iuran_bulanan','qty_kebersihan','qty_kas_lorong','qty_arisan'];
     for(const key of keys){
       const control=form.elements.namedItem(key);
       const raw=String(control?.value??'').trim(),amount=Number(raw);
       if(!raw||!Number.isInteger(amount)||amount<0||amount>100){
         notice.textContent='Periksa kewajiban '+key+' (angka 0–100).';
         control?.focus();return;
       }
       obj[key]=amount;
     }
   }
  }else {
   if(record&&!Object.keys(values).length){notice.textContent='Belum ada perubahan untuk disimpan.';return;}
   obj.values=values;
  }
  const submit=actions.lastChild;submit.disabled=true;notice.textContent='Menyimpan…';
  try{
   await send(base+active,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
   await fetchData(active);
   viewList(); const info=main.querySelector('.f4-admin-note');if(info)info.textContent='Data berhasil disimpan. '+records.length+' baris tersedia.';
  }catch(err){notice.textContent='Gagal menyimpan: '+err.message}
  finally{submit.disabled=false}
 });
}
async function fetchData(kind){
 const d=await send(base+kind);
 const portalRows=Array.isArray(d.data)?d.data:[];
 if(kind!=='documentation')return portalRows;
 // One Documentation tab, two independent D1 collections.
 // Only explicitly Bank Sampah-scoped albums are included in that section.
 try{
  const bank=await send(bankApi+'albums?limit=500');
  const bankRows=(Array.isArray(bank.data)?bank.data:[])
   .map(x=>({...x,drive_url:'',_f4_bank_kind:'bank_albums'}));
  const bankById=new Map(bankRows.map(x=>[String(x.id),x]));
  const portalIds=new Set(portalRows.map(x=>String(x.id)));
  // Legacy unassigned albums are visible for classification, not published to Bank Sampah.
  const linkedPortal=portalRows
   .filter(x=>!bankScoped(bankById.get(String(x.id))||{}))
   .map(x=>({...x,_f4_bank_record:bankById.get(String(x.id))||null}));
  const scoped=bankRows.filter(x=>bankScoped(x));
  const orphaned=bankRows.filter(x=>!bankScoped(x)&&!portalIds.has(String(x.id)));
  return [...linkedPortal,...scoped,...orphaned];
 }catch(error){
  console.warn('Dokumentasi Bank Sampah belum dapat ditampilkan:',error);
  return portalRows;
 }
}

/* Bank Sampah mempunyai tabel D1 khusus: albums, inventory, progress_entries.
   Editor ini tidak mencampurkannya dengan portal_documentation/portal_inventory. */
const bankModules={
 bank_progress:{listKey:'progress',label:'Kegiatan Bank Sampah'},
 bank_albums:{listKey:'albums',label:'Dokumentasi Bank Sampah'},
 bank_inventory:{listKey:'inventory',label:'Inventaris Bank Sampah'}
};
const bankApi='https://api.flamboyan4.web.id/api/v2/admin/bank/';
const bankCategory=c=>/^Bank Sampah\s*[:/]/i.test(String(c||''))?String(c):'Bank Sampah: '+String(c||'Lainnya');
const bankCategoryLabel=c=>String(c||'').replace(/^Bank Sampah\s*[:/]\s*/i,'')||'Lainnya';
const bankScoped=a=>/^Bank Sampah\s*[:/]/i.test(String(a.category||''))||/^(bank[_ -]?sampah|wastebank)$/i.test(String(a.category||''));
function bankField(form,key,label,type='text',value='',required=false){
 const wrapper=node('label'),title=node('span',label);let input;
 if(type==='textarea'){input=node('textarea');input.rows=3}
 else if(type==='select'){input=node('select');}
 else{input=node('input');input.type=type}
 input.name=key;if(type!=='select')input.value=value==null?'':String(value);
 input.required=required;wrapper.append(title,input);form.append(wrapper);return input;
}
async function openBankAdminEditor(kind){
 if(!inContext()||!bankModules[kind])return;
 active=kind;filter='';page.hidden=false;if(resident)resident.hidden=true;
 const def=bankModules[kind];
 header(def.label,'Konten khusus Bank Sampah; terpisah dari dokumentasi dan inventaris Portal Utama.');
 const tools=node('div',undefined,'f4-admin-controls'),q=node('input');
 q.placeholder='Cari data Bank Sampah';tools.append(q,btn('+ Tambah '+def.label,()=>showBankForm(kind,null)),btn('Muat Ulang',()=>openBankAdminEditor(kind)));
 main.append(tools);
 const info=node('p','Memuat data Bank Sampah…','f4-admin-note');main.append(info);
 const box=node('div',undefined,'f4-admin-list');main.append(box);
 try{
  const payload=await send(bankApi+(kind==='bank_albums'?'albums':def.listKey)+'?limit=500');
  if(active!==kind)return;
  let rows=Array.isArray(payload.data)?payload.data:[];
  if(kind==='bank_inventory')rows=rows.filter(item=>String(item.category||'')==='bank_sampah');
  // Album tanpa penanda dipertahankan agar Superadmin dapat mengklasifikasikan
  // arsip lama secara eksplisit; tidak otomatis dijadikan album Bank Sampah.
  if(kind==='bank_albums')rows=rows.filter(bankScoped);
  info.textContent=rows.length+' data tersedia';
  const draw=()=>{
   box.replaceChildren();const query=q.value.toLowerCase().trim(),found=rows.filter(x=>!query||JSON.stringify(x).toLowerCase().includes(query));
   for(const record of found){
    const article=node('article',undefined,'f4-admin-item'),text=node('div');
    text.append(node('strong',record.title||record.name||'Tanpa judul'));
    const detail=kind==='bank_progress'?[record.happened_on,record.stage,record.status].filter(Boolean):
      kind==='bank_inventory'?[record.quantity,record.unit].filter(v=>v!==undefined).concat(record.condition||''):
      [record.event_on,bankCategoryLabel(record.category),bankScoped(record)?'Bank Sampah':'Belum ditandai khusus Bank Sampah'].filter(Boolean);
    text.append(node('small',detail.join(' • ')));article.append(text);
    if(kind!=='bank_inventory')article.append(btn(kind==='bank_albums'?'Atur kategori':'Edit',()=>showBankForm(kind,record)));
    box.append(article);
   }
   if(!found.length)box.append(node('p','Tidak ada data yang cocok.','f4-admin-note'));
  };
  q.oninput=draw;draw();
 }catch(e){info.textContent='Gagal memuat konten Bank Sampah: '+e.message}
}
function showBankForm(kind,record){
 if(!inContext())return;
 const def=bankModules[kind];if(!def)return;
 const isEdit=!!record;header((isEdit?'Edit ':'Tambah ')+def.label,'Kelola konten Bank Sampah menggunakan akses Superadmin.');
 const form=node('form',undefined,'f4-admin-editor'),grid=node('div',undefined,'f4-admin-fields');main.append(form);
 if(kind==='bank_albums'||kind==='bank_inventory'){
  const dest=node('label'),label=node('span','Tujuan publikasi'),select=node('select');
  select.append(new Option('Bank Sampah','bank-sampah'),new Option('Portal Utama','portal'));
  select.value='bank-sampah';select.disabled=!!record;
  select.onchange=()=>{if(select.value==='portal')showForm(null)};
  dest.append(label,select);form.append(dest);
 }
 form.append(grid);const controls={};
 const add=(key,label,type='text',value='',required=false)=>controls[key]=bankField(grid,key,label,type,value,required);
 if(kind==='bank_progress'){
  add('date','Tanggal kegiatan','date',record?.happened_on||'',true);
  add('title','Judul kegiatan','text',record?.title||'',true);
  add('stage','Tahap / langkah','text',record?.stage||'');
  add('description','Uraian perkembangan','textarea',record?.description||'');
  add('status','Status','text',record?.status||'Berjalan',true);
  add('nextStep','Agenda berikutnya','text',record?.next_step||'');
  add('photoUrl','Tautan foto HTTPS','url',record?.photoUrl||'');
  add('publicVisible','Tampil di publik','select');
  controls.publicVisible.add(new Option('Ya / publik','1'),new Option('Tidak / privat','0'));
  controls.publicVisible.value=record?.public_visible===0?'0':'1';
 }else if(kind==='bank_albums'){
  add('title','Judul album','text',record?.title||'',true);
  add('eventOn','Tanggal kegiatan','date',record?.event_on||'');
  add('description','Deskripsi','textarea',record?.description||'');
  add('category','Kategori dokumentasi','select');
  for(const option of ['Kerja Bakti','Penimbangan','Arisan','Acara','Lainnya'])controls.category.add(new Option(option,option));
  const legacy=bankCategoryLabel(record?.category);if(record&&legacy&&!Array.from(controls.category.options).some(o=>o.value===legacy))controls.category.add(new Option(legacy,legacy));
  controls.category.value=record?legacy:'Kerja Bakti';
  if(!record){
   add('mediaUrl','Tautan foto/video Google Drive HTTPS','url','');
   add('mediaType','Jenis media','select');controls.mediaType.add(new Option('Foto','foto'),new Option('Video','video'));
   add('visibility','Akses','select');controls.visibility.add(new Option('Publik','publik'),new Option('Privat','privat'));
  }else{
   add('visibility','Akses','select');controls.visibility.add(new Option('Publik','publik'),new Option('Privat','privat'));controls.visibility.value=record.visibility||'publik';
   add('mediaUrl','Tambah tautan foto/video baru (opsional)','url','');
   add('mediaType','Jenis media baru','select');controls.mediaType.add(new Option('Foto','foto'),new Option('Video','video'));
   form.append(node('p','Judul, tanggal, deskripsi, kategori, dan akses dapat diedit; media baru akan ditambahkan tanpa menghapus media lama.','f4-admin-note'));
  }
 }else{
  add('name','Nama barang','text','',true);
  add('quantity','Jumlah','number','1',true);controls.quantity.min='0.001';controls.quantity.step='0.001';
  add('unit','Satuan','text','unit',true);add('subcategory','Kategori barang','text','');
  add('location','Lokasi','text','');add('photoUrl','Tautan foto HTTPS','url','');
 }
 const note=node('p','','f4-admin-message');form.append(note);
 const actions=node('div',undefined,'f4-warga-form-actions');
 actions.append(btn('Batal',()=>['documentation','inventory'].includes(active)?viewList():openBankAdminEditor(kind)));
 const save=btn('Simpan Perubahan',()=>{if(form.reportValidity())form.requestSubmit()},'f4-admin-primary');
 actions.append(save);form.append(actions);
 form.onsubmit=async e=>{
  e.preventDefault();save.disabled=true;note.textContent='Menyimpan…';
  const get=key=>String(controls[key]?.value||'').trim();
  try{
   if(kind==='bank_progress'){
    const p={date:get('date'),title:get('title'),stage:get('stage'),description:get('description'),
      status:get('status'),nextStep:get('nextStep'),photoUrl:get('photoUrl'),publicVisible:get('publicVisible')==='1'};
    if(record)p.id=record.id;
    await send(bankApi+(record?'progress/edit':'progress'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
   }else if(kind==='bank_albums'&&record){
    const category=bankCategory(get('category'));
    await send(bankApi+'albums/edit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      id:record.id,title:get('title'),eventOn:get('eventOn'),description:get('description'),visibility:get('visibility'),category})});
    // Matching legacy Portal Utama record is reclassified too, when available.
    // Never create a duplicate or delete a historical album.
    const mediaUrl=get('mediaUrl');
    if(mediaUrl){
     await send(bankApi+'media-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      requestKey:'media_'+crypto.randomUUID().replace(/-/g,''),albumId:record.id,mediaType:get('mediaType'),url:mediaUrl,caption:record.title||'Dokumentasi'})});
    }
    if(String(record.id).startsWith('portal:album:')){
     try{
      const d=await send(base+'documentation');
      if(d.data?.some(x=>String(x.id)===String(record.id))){
       await send(base+'documentation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save',id:record.id,values:{category}})});
      }
     }catch(error){note.textContent='Kategori Bank Sampah tersimpan; penandaan album Portal Utama belum selesai: '+error.message;save.disabled=false;return}
    }
   }else if(kind==='bank_albums'){
    const item=await send(bankApi+'albums',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      title:get('title'),eventOn:get('eventOn'),description:get('description'),category:bankCategory(get('category')),visibility:get('visibility')})});
    const url=get('mediaUrl');
    if(url){
     await send(bankApi+'media-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      requestKey:'media_'+crypto.randomUUID().replace(/-/g,''),albumId:item.id,mediaType:get('mediaType'),url,caption:get('title')})});
    }
   }else if(kind==='bank_inventory'){
    await send(bankApi+'inventory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
     requestKey:'stock_'+crypto.randomUUID().replace(/-/g,''),name:get('name'),quantity:Number(get('quantity')),
     unit:get('unit'),subcategory:get('subcategory'),location:get('location'),photoUrl:get('photoUrl')})});
   }
   if(['documentation','inventory'].includes(active))window.openSuperadminEditor(active);
   else openBankAdminEditor(kind);
  }catch(error){note.textContent='Gagal menyimpan: '+error.message;
    if(kind==='bank_albums'&&!record)note.textContent+=' Jika album berhasil dibuat tetapi media gagal, periksa daftar sebelum membuat ulang.'}
  finally{save.disabled=false}
 };
}

window.f4CancelSuperadminEditor=()=>{requestSerial++;};
window.openSuperadminEditor=async(kind)=>{
 if(!inContext())return;
 if(kind==='residents'){nav(kind);return}
 if(bankModules[kind])return openBankAdminEditor(kind);
 if(!types[kind])return;
 active=kind;filter='';page.hidden=false;if(resident)resident.hidden=true;
 sideMenu();header(types[kind].label,'Kelola data acuan.');
 const serial=++requestSerial;
 const info=node('p','','f4-admin-note');main.append(info);
 const loadToken=window.F4Loading?.begin(info,'Memuat '+types[kind].label+'…');
 try{
  const nextRecords=await fetchData(kind);
  if(serial!==requestSerial||!main.contains(info))return;
  records=nextRecords;
  window.F4Loading?.success(info,loadToken);
  viewList();
 }
 catch(e){
  if(serial!==requestSerial||!main.contains(info))return;
  // Allow opening the real original create form even when a document collection
  // has not yet been populated. Save still uses Worker auth and must succeed.
  if(kind==='documentation'){
   records=[];viewList();
   const box=main.querySelector('.f4-admin-note');
   if(box)box.textContent='Daftar dokumentasi belum dapat dimuat ('+e.message+'). Periksa koneksi; data sebelumnya tetap tersimpan.';
  }else if(window.F4Loading)F4Loading.error(info,'Tidak dapat membaca '+types[kind].label+': '+e.message,loadToken);
  else info.textContent='Tidak dapat membaca '+types[kind].label+': '+e.message;
 }
};
window.f4AdminEditorTypes=categories;
})();