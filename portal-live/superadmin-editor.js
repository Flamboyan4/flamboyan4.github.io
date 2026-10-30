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
 projects:{label:'Project Card',section:'portal',columns:[['title','Nama projek','text',true],['description','Deskripsi','textarea'],['image_ref','Foto / gambar Google Drive','url'],['target_url','Link tujuan / #bagian','text'],['project_kind','Jenis proyek','projectKind',true],['fund_source','Kategori kas terkait','text'],['fund_target_rp','Target dana (Rp)','number'],['linked_key','Portal / modul terhubung','projectModule'],['sort_order','Urutan','number'],['active','Aktif','boolean']]},
 agenda:{label:'Rencana Kegiatan',section:'portal',columns:[['title','Nama kegiatan','text',true],['starts_on','Tanggal mulai','date'],['ends_on','Tanggal selesai','date'],['location','Lokasi','text'],['description','Deskripsi','textarea'],['image_ref','Foto Google Drive','url'],['status','Status kegiatan','text'],['visibility','Tampilkan ke publik','visibility'],['sort_order','Urutan','number']]},
 documentation:{label:'Dokumentasi',section:'portal',columns:[['title','Judul dokumentasi','text',true],['event_on','Tanggal','date'],['description','Deskripsi','textarea'],['drive_url','Tautan album/folder Google Drive (foto dan video)','url'],['category','Kategori dokumentasi','category'],['sort_order','Urutan','number'],['visibility','Akses','visibility'],['active','Aktif','boolean']]},
 inventory:{label:'Inventaris',section:'portal',columns:[['name','Nama barang','text',true],['quantity','Jumlah','number'],['unit','Satuan','text'],['description','Kondisi, lokasi dan keterangan barang','textarea'],['category','Kategori barang','text'],['photo_ref','Tautan foto barang (Google Drive)','url'],['visibility','Akses','visibility']]},
 banners:{label:'Banner Slider',section:'portal',columns:[['title','Judul banner','text'],['image_ref','URL gambar Google Drive','url',true],['target_url','URL tujuan atau #bagian','text'],['sort_order','Urutan tampil','number'],['active','Aktif','boolean']]},
 meetings:{label:'Hasil Rapat',section:'portal',columns:[['title','Judul rapat','text',true],['meeting_on','Tanggal rapat','date'],['summary','Ringkasan rapat','textarea'],['document_ref','URL hasil rapat Google Docs / Drive','url'],['visibility','Akses','visibility']]},
 tariffs:{label:'Tarif Iuran',section:'book',key:'contribution_type',columns:[['contribution_type','Jenis Iuran','readonly'],['amount_rp','Tarif / iuran (Rp)','number',true]]},
 settings:{label:'Aturan Tanggal',section:'book',key:'setting_key',columns:[['setting_key','Aturan','readonly'],['setting_value','Tanggal (1–31)','number',true],['description','Keterangan','readonly']]},
 bank_progress:{label:'Kegiatan Bank Sampah',section:'bank',columns:[]},
 bank_albums:{label:'Dokumentasi Bank Sampah',section:'bank',columns:[]},
 bank_inventory:{label:'Inventaris Bank Sampah',section:'bank',columns:[]},
 obligations:{label:'Kewajiban Iuran Warga',section:'book',key:'payer_id',columns:[['nama','Nama warga','readonly'],['rumah','Rumah','readonly'],['qty_iuran_bulanan','Iuran bulanan (x)','number',true],['qty_kebersihan','Kebersihan (x)','number',true],['qty_kas_lorong','Kas lorong (x)','number',true],['qty_arisan','Arisan (x)','number',true]]}
};

/* Jersey transitional storage in the existing D1 method field. This is a
   structured amount, not a new backend column or a new transaction record. */
const JERSEY_PAY_TAG=/\s*\[F4BAYAR:(\d{1,12})\]/g;
const JERSEY_SPLIT_TAG=/\s*\[F4SPLIT:(\d{1,12}):(\d{1,12})\]/g;
function plainJerseyMethod(value){return String(value||'').replace(JERSEY_PAY_TAG,'').replace(JERSEY_SPLIT_TAG,'').trim()}
function jerseySplitExact(row){
 const tagged=[...String(row?.method||'').matchAll(/\[F4SPLIT:(\d{1,12}):(\d{1,12})\]/g)];
 if(!tagged.length)return null;
 return {qris:Number(tagged[tagged.length-1][1]),cash:Number(tagged[tagged.length-1][2])};
}
function jerseyMethodKind(value){
 const method=plainJerseyMethod(value).toLowerCase();
 if(!method)return '';
 const qr=/(^|[^a-z])(qris|qr[ -]?code|qr)(?=$|[^a-z])/.test(method);
 const cash=/(^|[^a-z])(cash|tunai|kontan)(?=$|[^a-z])/.test(method);
 if(qr&&cash)return 'Campuran';
 if(qr)return 'QRIS';
 if(cash)return 'Cash';
 return 'Lainnya';
}
function jerseyMethodNote(value,kind){
 const method=plainJerseyMethod(value);
 if(!method)return '';
 if(kind==='Lainnya')return method;
 const leading=kind==='Campuran'?/^(?:qris\s*(?:\+|dan|&)\s*(?:cash|tunai)|(?:cash|tunai)\s*(?:\+|dan|&)\s*qris)/i:
  kind==='QRIS'?/^(?:qris|qr[ -]?code|qr)/i:/^(?:cash|tunai|kontan)/i;
 return method.replace(leading,'').replace(/^[\s:;|,./+–—-]+/,'').trim();
}
function paidJerseyExact(row){
 const tags=[...String(row?.method||'').matchAll(/\[F4BAYAR:(\d{1,12})\]/g)];
 return tags.length?Number(tags[tags.length-1][1]):null;
}
function paidJerseyAmount(row){
 const exact=paidJerseyExact(row);if(exact!==null)return exact;
 const price=Math.max(0,Number(row?.nominal_rp)||0);
 const st=String(row?.payment_status||'').toLowerCase();
 if(st.includes('lunas')&&!/\b(belum|blm|tidak|non)\s*lunas\b/.test(st))return price;
 if(!/dp|cicil/.test(st))return 0;
 const m=st.match(/(?:rp\s*)?(\d[\d.,]*)/i);
 if(!m)return 0;
 let sum=Number(m[1].replace(/[.,]/g,''));
 if(sum>0&&sum<1000)sum*=1000;
 return Number.isFinite(sum)?sum:0;
}
const jerseyRp=value=>'Rp '+(Number(value)||0).toLocaleString('id-ID');
/* Summary for the existing Jersey data, shared by Superadmin and print.
   Only explicit [F4BAYAR] amounts can be assigned to a payment channel.
   Historical status-derived amounts remain unclassified by payment method. */
function jerseyPaymentSummary(rows){
 const total={lunas:0,belumLunas:0,dp:0,belumBayar:0,hargaBelumAda:0,
  qris:0,cash:0,belumDirinci:0,nominalLama:0,perluRinci:0,danaMasuk:0,
  rincianBelumJelas:[]};
 for(const row of rows||[]){
  const price=Math.max(0,Number(row.nominal_rp)||0);
  const paid=Math.max(0,paidJerseyAmount(row));
  const exact=paidJerseyExact(row);
  if(price>0&&paid>=price)total.lunas++;
  else{
   total.belumLunas++;
   if(price===0)total.hargaBelumAda++;
   if(paid>0)total.dp++;else total.belumBayar++;
  }
  total.danaMasuk+=paid;
  if(exact===null){
   // Includes legacy "Lunas" amounts derived from nominal_rp and old DP statuses.
   total.nominalLama+=paid;
   total.belumDirinci+=paid;
   if(paid>0)total.rincianBelumJelas.push({row,amount:paid,
    reason:'Nilai dihitung dari status lama; uang diterima dan metode belum dikonfirmasi.'});
   continue;
  }
  const split=jerseySplitExact(row);
  if(split){
   if(Number.isSafeInteger(split.qris)&&Number.isSafeInteger(split.cash)&&split.qris>=0&&split.cash>=0&&split.qris+split.cash===exact){
    total.qris+=split.qris;total.cash+=split.cash;
   }else{
    total.belumDirinci+=paid;total.perluRinci+=paid;
    if(paid>0)total.rincianBelumJelas.push({row,amount:paid,
     reason:'Rincian QRIS dan Cash tidak sesuai total uang diterima.'});
   }
   continue;
  }
  const kind=jerseyMethodKind(row.method);
  if(kind==='QRIS')total.qris+=paid;
  else if(kind==='Cash')total.cash+=paid;
  else{
   total.belumDirinci+=paid;total.perluRinci+=paid;
   if(paid>0)total.rincianBelumJelas.push({row,amount:paid,
    reason:kind==='Campuran'?'Pembayaran campuran belum memiliki pembagian nominal QRIS/Cash.':
     kind==='Lainnya'?'Metode lain belum dimasukkan ke kelompok QRIS atau Cash.':
     'Nominal sudah dicatat, tetapi metode pembayarannya belum diisi.'});
  }
 }
 return total;
}


const categories={
 portal:[['projects','Project Card'],['agenda','Rencana Kegiatan'],['documentation','Dokumentasi'],['inventory','Inventaris'],['banners','Banner Slider'],['meetings','Hasil Rapat'],['arisan','Jadwal Arisan'],['jersey','Pesanan Jersey']],
 bank:[['bank_progress','Kegiatan'],['bank_albums','Dokumentasi'],['bank_inventory','Inventaris']],
 book:[['residents','Data Warga & Rumah'],['obligations','Kewajiban Iuran'],['tariffs','Tarif Iuran'],['settings','Aturan Tanggal']]
};
let active='',records=[],filter='',requestSerial=0,editing=false,lastSavedJerseyId=null,showZeroObligations=false;
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

// Dialog HTML milik website, tidak menggunakan window.confirm() yang dapat diblokir browser.
let f4ConfirmOpen=false;
function f4ContentDialog(title,description,acceptLabel='Ya, Hapus',danger=true,hasCancel=true){
 return new Promise(resolve=>{
  if(f4ConfirmOpen){resolve(false);return}
  f4ConfirmOpen=true;
  const shade=document.createElement('div');shade.id='f4-superadmin-confirm';
  const panel=document.createElement('section');panel.className='f4-sa-confirm-panel';
  panel.setAttribute('role','alertdialog');panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-labelledby','f4-sa-confirm-title');panel.setAttribute('aria-describedby','f4-sa-confirm-description');
  const h=document.createElement('h2');h.id='f4-sa-confirm-title';h.textContent=title;
  const p=document.createElement('p');p.id='f4-sa-confirm-description';p.textContent=description;
  const actions=document.createElement('div');actions.className='f4-sa-confirm-actions';
  const cancel=document.createElement('button');cancel.type='button';cancel.className='f4-sa-confirm-cancel';cancel.textContent='Batal';
  const accept=document.createElement('button');accept.type='button';accept.className=danger?'f4-sa-confirm-delete':'f4-sa-confirm-accept';accept.textContent=acceptLabel;
  const previous=document.activeElement;
  function finish(result){
   document.removeEventListener('keydown',keyHandler,true);
   shade.remove();f4ConfirmOpen=false;
   if(previous?.isConnected&&typeof previous.focus==='function')previous.focus();
   resolve(result);
  }
  function keyHandler(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false)}}
  cancel.onclick=()=>finish(false);accept.onclick=()=>finish(true);
  shade.onclick=e=>{if(e.target===shade)finish(false)};
  if(hasCancel)actions.append(cancel);actions.append(accept);
  panel.append(h,p,actions);shade.append(panel);document.body.append(shade);
  document.addEventListener('keydown',keyHandler,true);
  (hasCancel?cancel:accept).focus();
 });
}
function isLegacyJerseyProject(record){
 return String(record?.linked_key||'')==='jersey'||/^(pemesanan\s*)?jersey$/i.test(String(record?.title||'').trim());
}
function deletionActions(record,kind=active){
 const wrap=node('span',undefined,'f4-admin-action-set');
 wrap.append(btn('Edit',()=>showForm(record)));
 if(kind==='projects'&&isLegacyJerseyProject(record)){
  wrap.append(btn('Kelola Jersey',()=>window.openSuperadminEditor?.('jersey'),'f4-admin-btn f4-admin-primary'));
 }else if(kind==='projects'&&['pesanan','penggalangan'].includes(record.project_kind)){
  wrap.append(btn(record.project_kind==='pesanan'?'Kelola Pesanan':'Kelola Kontribusi',
   ()=>window.F4ProjectModule?.open(record),'f4-admin-btn f4-admin-primary'));
 }
 if(!(kind==='projects'&&Number(record.active)===0)){
  const del=btn(kind==='projects'?'Arsipkan':'Hapus',()=>removeContentRecord(record,kind,del),'f4-admin-btn f4-admin-danger');
  wrap.append(del);
 }
 return wrap;
}
async function removeContentRecord(record,kind,button){
 if(!inContext())return;
 const scope=kind.startsWith('bank_')?kind:record._f4_bank_kind;
 const bankType=scope==='bank_albums'?'albums':scope==='bank_inventory'?'inventory':scope==='bank_progress'?'progress':null;
 const label=String(record.title||record.name||record.resident||record.host_name||record.id||'konten');
 const archived=bankType==='inventory'||kind==='projects';
 if(button.disabled)return;
 button.disabled=true;
 const approved=await f4ContentDialog(
  archived?(kind==='projects'?'Arsipkan proyek?':'Arsipkan inventaris?'):'Hapus konten ini?',
  '"'+label+'"\n\n'+(archived?'Kartu proyek tidak lagi tampil, tetapi daftar pesanan, dana, dan riwayat tetap tersimpan.':
  'Konten akan dihapus permanen, salinan data sebelum penghapusan tercatat di audit.'),
  archived?'Arsipkan':'Ya, Hapus');
 if(!approved){button.disabled=false;return}
 button.textContent=archived?'Mengarsipkan…':'Menghapus…';
 try{
  const url=bankType?bankApi+bankType+'/delete':base+kind;
  const payload=bankType?{id:record.id}:{action:'delete',id:record.id};
  await send(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(kind.startsWith('bank_'))await openBankAdminEditor(kind);
  else await window.openSuperadminEditor(kind);
 }catch(error){
  button.disabled=false;button.textContent='Hapus';
  await f4ContentDialog('Penghapusan gagal','Konten belum dihapus. '+error.message,'Tutup',false,false);
 }
}
function header(label,description){
 window.f4SuperadminRememberTabScroll?.();
 main.replaceChildren();
 const def=types[active];
 const category=def?.section==='bank'?'Bank Sampah':def?.section==='portal'?'Portal Utama':'Data Acuan';
 const h=node('header',undefined,'f4-work-heading');
 h.append(node('h2',category),node('p',def?.section==='bank'?'Anda sedang mengelola konten Bank Sampah.':def?.section==='portal'?'Anda sedang mengelola konten Portal Utama.':'Data warga dan aturan iuran bersama.'));
 main.append(h);
 window.f4SuperadminRenderTabs?.();
 const sub=node('section',undefined,'sa-module-heading');
 sub.append(node('h3','Kelola '+label),node('p',description));
 main.append(sub);
}
const OBLIGATION_KEYS=['qty_iuran_bulanan','qty_kebersihan','qty_kas_lorong','qty_arisan'];
const obligationActive=r=>OBLIGATION_KEYS.some(k=>Number(r?.[k]||0)>0);

async function removeObligation(record){
 if(active!=='obligations'||!record?.payer_id||!obligationActive(record))return;
 const approved=await f4ContentDialog('Hapus dari Kewajiban?',
   'Kewajiban '+String(record.nama||'')+' ('+String(record.rumah||'')+') akan dibuat 0. Identitas warga dan riwayat pembayaran tetap disimpan. Untuk mengaktifkan kembali, pilih Lihat Tanpa Kewajiban lalu Edit.',
   'Ya, Hapus Kewajiban',true,true);
 if(!approved)return;
 try{
   await send(base+'obligations',{method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({action:'save',payer_id:record.payer_id,
       qty_iuran_bulanan:0,qty_kebersihan:0,qty_kas_lorong:0,qty_arisan:0})});
   const refreshed=await fetchData('obligations');
   const saved=refreshed.find(x=>String(x.payer_id)===String(record.payer_id));
   if(!saved||obligationActive(saved))throw Error('API merespons, tetapi kewajiban belum terverifikasi. Periksa data sebelum mengulang.');
   records=refreshed;viewList();
   const info=main.querySelector('.f4-admin-note');
   if(info)info.textContent='Kewajiban '+String(record.nama||'')+' sudah dinolkan. Data warga dan transaksi lama tetap aman.';
 }catch(error){await f4ContentDialog('Belum dapat menghapus kewajiban',error.message,'Tutup',false,false)}
}

async function showAddObligationPayer(){
 if(active!=='obligations'||!inContext())return;
 editing=true;
 header('Tambah Pembayar Iuran','Gunakan rumah yang sudah terdaftar. TPQ boleh dicatat sebagai pembayar tanpa membuat akun login atau anggota Bank Sampah.');
 const form=node('form',undefined,'f4-admin-editor');form.noValidate=true;main.append(form);
 const addField=(name,label,type='number')=>{
   const wrap=node('label'),caption=node('span',label),field=node('input');
   field.name=name;field.type=type;field.required=true;
   if(type==='number'){field.min='0';field.max='100';field.step='1';field.value='0'}
   if(type==='text'){field.maxLength=160;field.placeholder='Contoh: TPQ'}
   wrap.append(caption,field);form.append(wrap);return field;
 };
 const houseWrap=node('label'),houseCaption=node('span','Rumah / lokasi'),house=node('select');
 house.name='household_id';house.required=true;
 house.append(new Option('Memuat rumah…',''));houseWrap.append(houseCaption,house);form.append(houseWrap);
 const name=addField('nama','Nama pembayar (warga atau TPQ)','text');
 const labels=[['qty_iuran_bulanan','Iuran bulanan (x)'],
  ['qty_kebersihan','Kebersihan (x)'],['qty_kas_lorong','Kas Lorong (x)'],['qty_arisan','Arisan (x)']];
 const numbers=labels.map(([k,label])=>addField(k,label));
 const notice=node('p','','f4-admin-message');form.append(notice);
 const actions=node('div',undefined,'f4-warga-form-actions'),
   submit=btn('Simpan Pembayar',()=>{if(form.reportValidity())form.requestSubmit()},'f4-admin-primary');
 actions.append(btn('Batal',viewList),submit);form.append(actions);
 try{
   const data=await send('https://api.flamboyan4.web.id/api/v2/admin/residents');
   const unique=new Map();
   for(const r of data.rows||[]){
     if(r.household_id&&!unique.has(String(r.household_id)))
       unique.set(String(r.household_id),String(r.rumah||'Rumah tanpa nomor'));
   }
   const entries=[...unique].sort((a,b)=>a[1].localeCompare(b[1],'id',{numeric:true}));
   house.replaceChildren(new Option('Pilih rumah…',''));
   for(const [id,label] of entries)house.append(new Option(label,id));
   if(!entries.length)notice.textContent='Belum ada rumah. Tambahkan rumah terlebih dahulu di Data Warga & Rumah.';
 }catch(e){notice.textContent='Gagal mengambil daftar rumah: '+e.message;submit.disabled=true}
 form.addEventListener('submit',async event=>{
   event.preventDefault();if(submit.disabled)return;
   const nama=name.value.trim(),household_id=house.value;
   const vals=Object.fromEntries(labels.map(([k],i)=>[k,Number(numbers[i].value)]));
   if(!household_id||!nama||nama.length>160||Object.values(vals).some(v=>!Number.isInteger(v)||v<0||v>100)||!Object.values(vals).some(v=>v>0)){
     notice.textContent='Pilih rumah, isi nama, dan minimal satu kewajiban lebih dari 0.';return;
   }
   submit.disabled=true;notice.textContent='Menyimpan pembayar ke D1…';
   try{
     const created=await send(base+'obligations',{method:'POST',
       headers:{'Content-Type':'application/json'},
       body:JSON.stringify({action:'add_payer',household_id,nama,...vals})});
     const refreshed=await fetchData('obligations');
     const actual=refreshed.find(x=>String(x.payer_id)===String(created.id));
     if(!actual||String(actual.nama)!==nama||labels.some(([k])=>Number(actual[k])!==vals[k])){
       notice.textContent='Pembayar mungkin sudah dibuat tetapi daftar belum sinkron. Jangan simpan ulang; muat ulang dan periksa.';return;
     }
     records=refreshed;filter=nama;showZeroObligations=false;viewList();
     const info=main.querySelector('.f4-admin-note');
     if(info)info.textContent=nama+' berhasil ditambahkan dan diverifikasi dari D1. Tidak ada akun login/Bank Sampah baru.';
   }catch(error){notice.textContent='Gagal menyimpan pembayar: '+error.message}
   finally{submit.disabled=false}
 });
}

function viewList(){
 const def=types[active];if(!def)return;
 editing=false;
 header(def.label,active==='obligations'?'Kelola kewajiban pembayar tanpa menghapus warga atau riwayat transaksi.':'Pilih Edit untuk memperbarui data tanpa mengubah transaksi warga.');
 const tools=node('div',undefined,'f4-admin-controls');
 const search=node('input');search.placeholder='Cari data';search.value=filter;search.oninput=()=>{filter=search.value;populate();};
 tools.append(search);
 if(def.section==='portal')tools.append(btn('+ Tambah '+def.label,()=>showForm(null)));
 if(active==='obligations'){
   tools.append(btn('+ Tambah Warga/TPQ',showAddObligationPayer,'f4-admin-btn f4-admin-primary'));
   tools.append(btn(showZeroObligations?'Tampilkan Aktif':'Lihat Tanpa Kewajiban',()=>{
     showZeroObligations=!showZeroObligations;viewList();
   }));
 }
 if(active==='jersey')tools.append(btn('Cetak Laporan Jersey',()=>printJerseyReport(),'f4-admin-primary'));
 tools.append(btn('Muat Ulang',()=>window.openSuperadminEditor(active)));
 main.append(tools);
 const obligationCount=records.filter(obligationActive).length;
 const summary=active==='obligations'
   ?obligationCount+' pembayar berkewajiban • '+(records.length-obligationCount)+' tanpa kewajiban. Hapus hanya menghentikan kewajiban, bukan menghapus transaksi.'
   :records.length+' data tersedia';
 const info=node('p',summary,'f4-admin-note');main.append(info);
 if(active==='jersey'){
  const t=jerseyPaymentSummary(records);
  const panel=node('section',undefined,'f4-jersey-payment-snapshot');
  panel.setAttribute('aria-label','Ringkasan status dan cara bayar jersey');
  const statuses=node('p');
  statuses.append(node('strong','Status: '),
   node('span','Lunas '+t.lunas+' • Belum lunas '+t.belumLunas+' (DP '+t.dp+' • Belum bayar '+t.belumBayar+')'));
  const methods=node('p');
  methods.append(node('strong','Rekap pembayaran: '),
   node('span','QRIS '+jerseyRp(t.qris)+' • Cash '+jerseyRp(t.cash)+
    ' • Metode belum jelas '+jerseyRp(t.perluRinci)+
    ' • Berdasarkan status lama '+jerseyRp(t.nominalLama)));
  panel.append(statuses,methods);
  if(t.nominalLama>0)panel.append(node('small',
   'Status lama '+jerseyRp(t.nominalLama)+' adalah nilai perkiraan dari status Lunas/DP, bukan penerimaan yang sudah diverifikasi. Jangan gabungkan ke QRIS atau Cash sebelum dikonfirmasi.'));
  if(t.rincianBelumJelas.length){
   const detail=node('details',undefined,'f4-jersey-payment-reconciliation');
   const head=node('summary');
   head.append(node('strong','Lihat rincian '+jerseyRp(t.belumDirinci)),
    node('span',t.rincianBelumJelas.length+' pemesan membutuhkan pemeriksaan'));
   detail.append(head);
   const list=node('div',undefined,'f4-jersey-unclassified-list');
   for(const entry of t.rincianBelumJelas){
    const line=node('div',undefined,'f4-jersey-unclassified-row');
    const info=node('div');
    info.append(node('strong',String(entry.row.resident||'Pemesan tidak bernama')),
     node('span',entry.reason),
     node('small','Catatan metode: '+(plainJerseyMethod(entry.row.method)||'—')+
      ' • Status: '+String(entry.row.payment_status||'—')));
    line.append(info,node('b',jerseyRp(entry.amount)),
     btn('Edit',()=>showForm(entry.row),'f4-admin-btn'));
    list.append(line);
   }
   detail.append(list);panel.append(detail);
  }
  main.append(panel);
 }
 const container=node('div',undefined,'f4-admin-list');container.id='f4-admin-list';main.append(container);
 populate();
}
function populateJersey(rows,list,query){
 const groups=[['bapak','Bapak-bapak'],['ibu','Ibu-ibu']];
 const normalized=value=>String(value||'').trim().toLowerCase().replace(/[^a-z]/g,'');
 const formatCurrency=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
 const wrap=node('div',undefined,'f4-jersey-groups');
 for(const [key,label] of groups){
  const members=rows.filter(row=>{
   const code=normalized(row.group_key);
   return key==='bapak'?(/^(bapak|bapakbapak|pria|laki|laki2|putra)$/.test(code)):
    /^(ibu|ibuibu|wanita|perempuan|putri)$/.test(code);
  }).sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0)||
    String(a.resident||'').localeCompare(String(b.resident||''),'id'));
  const group=node('details',undefined,'f4-jersey-group');
  group.open=!!query||members.some(x=>String(x.id)===String(lastSavedJerseyId));
  const summary=node('summary',undefined,'f4-jersey-group-head');
  const left=node('span',undefined,'f4-jersey-group-title');
  left.append(node('strong',label),node('small',members.length+' pesanan'));
  const total=members.reduce((n,x)=>n+Number(x.nominal_rp||0),0);
  summary.append(left,node('span',formatCurrency(total),'f4-jersey-group-total'));
  group.append(summary);
  const content=node('div',undefined,'f4-jersey-group-body');
  if(!members.length)content.append(node('p',query?'Tidak ada hasil pencarian di kelompok ini.':'Belum ada pesanan.','f4-admin-note'));
  for(const x of members){
   const item=node('details',undefined,'f4-jersey-person');
   if(String(x.id)===String(lastSavedJerseyId)){item.open=true;item.classList.add('f4-jersey-saved')}
   const head=node('summary',undefined,'f4-jersey-person-head');
   const text=node('span',undefined,'f4-jersey-person-identity');
   text.append(node('strong',String(x.resident||'').trim()||'Nama warga belum tercatat'));
   const paid=paidJerseyAmount(x),price=Math.max(0,Number(x.nominal_rp)||0);
   const sub=[x.size?'Ukuran '+x.size:'',x.payment_status||'Belum bayar',
    paidJerseyExact(x)!==null?'Diterima '+jerseyRp(paid):''].filter(Boolean).join(' • ');
   if(sub)text.append(node('small',sub));
   head.append(text);item.append(head);
   const body=node('div',undefined,'f4-jersey-person-detail');
   const fields=[['Nomor urut',x.sort_order],['Lengan',x.sleeves],
    ['Ukuran',x.size],['Nama dan nomor punggung',x.printed_name],
    ['Harga pesanan',jerseyRp(price)],
    ['Status pembayaran',x.payment_status||'Belum bayar'],
    ['Uang diterima',paidJerseyExact(x)===null?'Belum dicatat nominalnya':jerseyRp(paid)],
    ['Titipan kelebihan',paidJerseyExact(x)===null?'—':jerseyRp(Math.max(0,paid-price))],
    ['Metode / keterangan',plainJerseyMethod(x.method)]];
   for(const [caption,raw] of fields){
    const line=node('div',undefined,'f4-jersey-person-field');
    line.append(node('small',caption),node('span',raw===undefined||raw===null||String(raw).trim()===''?'—':String(raw)));
    body.append(line);
   }
   body.append(deletionActions(x,'jersey'));
   item.append(body);content.append(item);
  }
  group.append(content);wrap.append(group);
 }
 const recognized=rows.filter(row=>groups.some(([key])=>key==='bapak'
  ?/^(bapak|bapakbapak|pria|laki|laki2|putra)$/.test(normalized(row.group_key))
  :/^(ibu|ibuibu|wanita|perempuan|putri)$/.test(normalized(row.group_key))));
 if(recognized.length!==rows.length){
  const other=node('details',undefined,'f4-jersey-group');
  const missing=rows.filter(row=>!recognized.includes(row));
  const title=node('summary',undefined,'f4-jersey-group-head');title.append(node('strong','Belum dikelompokkan'),node('small',missing.length+' pesanan'));other.append(title);
  const body=node('div',undefined,'f4-jersey-group-body');
  for(const x of missing){
   const line=node('article',undefined,'f4-jersey-person f4-jersey-ungrouped');
   line.append(node('strong',x.resident||'Nama warga belum tercatat'),deletionActions(x,'jersey'));body.append(line);
  }
  other.append(body);wrap.append(other);
 }
 list.append(wrap);
}
function populate(){
 const list=document.getElementById('f4-admin-list');if(!list)return;
 list.replaceChildren();
 const query=filter.trim().toLowerCase();
 const def=types[active];
 const rows=records.filter(x=>(active!=='obligations'||showZeroObligations||obligationActive(x))&&(!query||JSON.stringify(x).toLowerCase().includes(query)));
 if(active==='jersey'){populateJersey(rows,list,query);return;}
 if(['arisan','agenda','documentation','inventory','meetings','obligations'].includes(active)){
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
   const action=node('td');
   if(active==='obligations'){
     action.append(btn('Edit',()=>showForm(x)));
     if(obligationActive(x)){
       const remove=btn('Hapus',()=>removeObligation(x));
       remove.title='Hapus dari daftar kewajiban tanpa menghapus identitas dan riwayat pembayaran';
       action.append(remove);
     }
   }else action.append(def.section==='portal'?deletionActions(x):btn('Edit',()=>showForm(x)));
   tr.append(action);body.append(tr);
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
  if(detail)info.append(node('small',detail));
  else item.classList.add('f4-inline-record');
  item.append(info,def.section==='portal'?deletionActions(x):btn('Edit',()=>showForm(x)));list.append(item);
 }
 if(!rows.length)list.append(node('p','Tidak ada data yang cocok.','f4-admin-note'));
}
function printJerseyReport(includeFunds=null){
 if(active!=='jersey'||!Array.isArray(records)||!records.length){
  window.f4UiDialog.alert('Belum ada pesanan Jersey untuk dicetak.');return;
 }

 if(includeFunds===null){
  document.getElementById('f4-jersey-print-options')?.remove();
  const veil=node('div',undefined,'f4-jersey-print-veil');veil.id='f4-jersey-print-options';
  const dialog=node('section',undefined,'f4-jersey-print-dialog');
  dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
  dialog.setAttribute('aria-labelledby','f4-jersey-print-title');
  const title=node('h3','Cetak Laporan Jersey');title.id='f4-jersey-print-title';
  dialog.append(title,node('p','Pilih laporan dengan format A4 portrait.','f4-jersey-print-hint'));
  const choices=node('div',undefined,'f4-jersey-print-choices');
  for(const [value,label,desc] of [
   ['all','Laporan lengkap','Data pesanan dan rincian dana pembayaran.'],
   ['no-funds','Tanpa laporan dana','Hanya nama pemesan, ukuran, lengan, dan nama/nomor punggung.']]){
   const item=node('label',undefined,'f4-jersey-print-choice');
   const radio=document.createElement('input');radio.type='radio';radio.name='f4-jersey-print-mode';radio.value=value;radio.checked=value==='all';
   const detail=node('span');detail.append(node('strong',label),node('small',desc));
   item.append(radio,detail);choices.append(item);
  }
  const actions=node('div',undefined,'f4-jersey-print-actions');
  actions.append(btn('Batal',()=>veil.remove(),'f4-jersey-print-cancel'),btn('Cetak / Simpan PDF',()=>{
   const choice=choices.querySelector('input:checked')?.value;
   veil.remove();printJerseyReport(choice!=='no-funds');
  },'f4-jersey-print-submit'));
  dialog.append(choices,actions);veil.append(dialog);
  veil.onclick=e=>{if(e.target===veil)veil.remove()};
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();veil.remove()}});
  document.body.append(veil);choices.querySelector('input:checked')?.focus();return;
 }

 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=v=>'Rp '+Number(v||0).toLocaleString('id-ID');
 const sections=[];
 let allOrders=0,allTotal=0,allReceived=0,allTitipan=0,allOutstanding=0;
 const paymentReport=jerseyPaymentSummary(records);
 for(const [kind,label] of [['bapak','Bapak-Bapak'],['ibu','Ibu-Ibu']]){
  const people=records.filter(x=>String(x.group_key||'').toLowerCase()===kind)
   .sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0));
  let total=0,received=0,titipan=0,outstanding=0;
  const rows=people.map(x=>{
   const invoice=Number(x.nominal_rp||0),paid=paidJerseyAmount(x);
   total+=invoice;received+=paid;outstanding+=Math.max(0,invoice-paid);titipan+=Math.max(0,paid-invoice);
   return '<tr><td class="center">'+esc(x.sort_order??'-')+'</td><td>'+esc(x.resident)+'</td>'+
    '<td>'+esc(x.sleeves||'-')+'</td><td>'+esc(x.size||'-')+'</td>'+
    '<td>'+esc(x.printed_name||'-')+'</td>'+
    (includeFunds?'<td class="number">'+money(invoice)+'</td>'+
      '<td class="number">'+money(paid)+'</td><td>'+esc(x.payment_status||'-')+'</td>':'')+'</tr>';
  }).join('');
  allOrders+=people.length;allTotal+=total;allReceived+=received;allOutstanding+=outstanding;allTitipan+=titipan;
  sections.push('<section><h2>Pesanan '+label+' ('+people.length+' orang)</h2>'+
   '<table><thead><tr><th>No</th><th>Nama & Rumah</th><th>Lengan</th><th>Ukuran</th>'+
   '<th>Nama / No. Punggung</th>'+
   (includeFunds?'<th>Nilai</th><th>Masuk</th><th>Status</th>':'')+'</tr></thead>'+
   '<tbody>'+(rows||'<tr><td colspan="'+(includeFunds?8:5)+'">Belum ada pesanan.</td></tr>')+'</tbody></table>'+
   (includeFunds?'<p class="sub">Nilai pesanan: '+money(total)+' &nbsp;|&nbsp; Dana masuk: '+money(received)+
   ' &nbsp;|&nbsp; Kekurangan: '+money(outstanding)+' &nbsp;|&nbsp; Titipan: '+money(titipan)+'</p>':'')+'</section>');
 }
 const date=new Date().toLocaleDateString('id-ID',{dateStyle:'long'});
 // Inline SVG is printable *content*, not a browser-suppressed CSS background.
 // It preserves the blue table headers even when Firefox's "Print backgrounds"
 // option is disabled when the Superadmin saves the report as PDF.
 const paintedSections=sections.join('').replace(/<th>([^<]*)<\/th>/g,(_tag,label)=>
  '<th><svg class="f4-print-th-fill" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 10 10" preserveAspectRatio="none">'+
  '<rect x="0" y="0" width="10" height="10" fill="#E8F0FA"/></svg>'+
  '<span class="f4-print-th-label">'+label+'</span></th>');
 const html='<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan Jersey Flamboyan 4</title>'+
 '<style>@page{size:A4 portrait;margin:8mm 10mm 9mm}*{box-sizing:border-box}body{font:8.7px/1.22 Arial,sans-serif;color:#17223b;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
 'h1{font-size:15px;margin:0 0 3px}h2{font-size:10.5px;margin:8px 0 4px;break-after:avoid}header{border-bottom:1.5px solid #000;padding-bottom:6px;margin-bottom:7px}section{break-inside:auto}'+
 'p{margin:3px 0}.meta{color:#475569;font-size:8px}.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin:6px 0;break-inside:avoid}.box{border:1px solid #000;min-width:0;padding:4px 4px;border-radius:4px}'+
 '.box strong{display:block;font-size:10px;margin-top:2px}table{width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 4px}thead{display:table-header-group}'+
 'th{background:#e8f0fa!important;position:relative;isolation:isolate;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}'+
 '.f4-print-th-fill{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}'+
 '.f4-print-th-label{position:relative;z-index:1}'+
 'th,td{border:1px solid #000;padding:2px 2px;vertical-align:middle;overflow-wrap:anywhere;font-size:8.4px;line-height:1.14}'+
 'tr{break-inside:avoid}th{text-align:left}.number{text-align:right;white-space:normal}.center{text-align:center}.sub{font-weight:bold;margin:3px 0 5px;font-size:8px}'+
 '.approval{text-align:right;margin-top:12px;break-inside:avoid;font-size:8px}.approval strong{display:block;margin-top:22px}'+
 '.foot{font-size:8px;color:#64748b;border-top:1px solid #000;margin-top:8px;padding-top:4px}'+
 "@media screen{body{max-width:850px;margin:16px auto;padding:0 12px}}\n@media print{\nbody.no-funds{font-size:11.5px!important;line-height:1.3!important}\nbody.with-funds{font-size:10.1px!important;line-height:1.22!important}\nbody h1{font-size:16px!important;line-height:1.25!important;margin:0 0 4px!important}\nbody h2{font-size:12px!important;line-height:1.25!important;margin:10px 0 5px!important}\nbody .meta{font-size:9.5px!important;line-height:1.3!important}\nbody .summary{margin:7px 0!important;gap:5px!important}\nbody .box{padding:5px!important;font-size:10px!important}\nbody .box strong{font-size:11px!important}\nbody table{width:100%!important;border-collapse:collapse!important;table-layout:fixed!important;margin:0 0 7px!important}\nbody.no-funds th,body.no-funds td{\nfont-size:11.5px!important;line-height:1.25!important;padding:4px 4px!important}\nbody.with-funds th,body.with-funds td{\nfont-size:10.1px!important;line-height:1.19!important;padding:3px 3px!important}\nbody tr{break-inside:avoid!important}\nbody .sub{font-size:9.5px!important;line-height:1.3!important;margin:4px 0 5px!important}\nbody .approval{margin-top:15px!important;font-size:10px!important;line-height:1.3!important;break-inside:avoid!important}\nbody .approval strong{margin-top:25px!important;font-size:10px!important}\nbody .foot{font-size:9px!important;margin-top:9px!important;padding-top:5px!important}\nbody th{background:#e8f0fa!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}\n}\n\n@media print{\n  body.no-funds th,body.no-funds td{\n    font-size:11.5px!important;line-height:1.22!important;padding:3.5px 4px!important\n  }\n  body.with-funds th,body.with-funds td{\n    font-size:10.8px!important;line-height:1.2!important;padding:3.2px!important\n  }\n  body.no-funds table :is(th,td):nth-child(1){width:6%!important}\n  body.no-funds table :is(th,td):nth-child(2){width:27%!important}\n  body.no-funds table :is(th,td):nth-child(3){width:13%!important}\n  body.no-funds table :is(th,td):nth-child(4){width:10%!important}\n  body.no-funds table :is(th,td):nth-child(5){width:44%!important}\n  body.with-funds table :is(th,td):nth-child(1){width:5%!important}\n  body.with-funds table :is(th,td):nth-child(2){width:24%!important}\n  body.with-funds table :is(th,td):nth-child(3){width:10%!important}\n  body.with-funds table :is(th,td):nth-child(4){width:8%!important}\n  body.with-funds table :is(th,td):nth-child(5){width:20%!important}\n  body.with-funds table :is(th,td):nth-child(6){width:11%!important}\n  body.with-funds table :is(th,td):nth-child(7){width:11%!important}\n  body.with-funds table :is(th,td):nth-child(8){width:11%!important}\n}\n\n@media print{\n .f4-jersey-finance-compact{font-size:9px;line-height:1.25;margin:5px 0 7px;padding:4px 6px;border:1px solid #000;break-inside:avoid}\n .f4-jersey-finance-compact>div+div{margin-top:2px}\n .f4-jersey-finance-compact strong{color:#263650}\n}\n\n</style></head><body class=\""+(includeFunds?'with-funds':'no-funds')+'">'+
 '<header><h1>LAPORAN PESANAN JERSEY WARGA FLAMBOYAN 4</h1>'+
 '<p class="meta">RT 001 RW 026 Pesona Kahuripan 2 • Dicetak '+esc(date)+' • A4 Portrait • '+(includeFunds?'Lengkap':'Tanpa dana')+'</p></header>'+
 (includeFunds?'<div class="summary"><div class="box">Jumlah Pemesan<strong>'+allOrders+' orang</strong></div>'+
 '<div class="box">Nilai Seluruh Pesanan<strong>'+money(allTotal)+'</strong></div>'+
 '<div class="box">Dana Terkumpul<strong>'+money(allReceived)+'</strong></div>'+
 '<div class="box">Sisa Kekurangan<strong>'+money(allOutstanding)+'</strong></div></div><p class="meta"><strong>Titipan sementara: '+money(allTitipan)+'</strong> — sudah termasuk uang diterima, belum dihitung sebagai pesanan bawahan</p>':
 '<p class="meta">Total pemesan: <strong>'+allOrders+' orang</strong></p>')+
 (includeFunds?
  '<div class="f4-jersey-finance-compact">'+
    '<div><strong>Status pembayaran:</strong> Lunas <b>'+paymentReport.lunas+'</b> • Belum lunas <b>'+paymentReport.belumLunas+
       '</b> (DP '+paymentReport.dp+' • Belum bayar '+paymentReport.belumBayar+')</div>'+
    '<div><strong>Dana menurut metode:</strong> QRIS <b>'+money(paymentReport.qris)+
       '</b> • Cash <b>'+money(paymentReport.cash)+
       '</b> • Metode belum jelas <b>'+money(paymentReport.perluRinci)+
       '</b> • Berdasarkan status lama <b>'+money(paymentReport.nominalLama)+'</b></div>'+
  '</div>':'')+
 paintedSections+
 (includeFunds?'<p class="meta">Catatan: nilai dari status pembayaran lama ('+money(paymentReport.nominalLama)+') masih perkiraan, belum termasuk nominal penerimaan terkonfirmasi. Metode belum jelas ('+money(paymentReport.perluRinci)+') harus ditelusuri sebelum diklasifikasikan sebagai QRIS/Cash. Titipan tidak mengurangi kekurangan pemesan lain.</p>':'')+
 '<div class="approval">Mengetahui, Humas Flamboyan 4<strong>Heri Juwandi</strong></div>'+
 '<p class="foot">Sumber: data pesanan Jersey pada flamboyan4.web.id</p>'+
 '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>';
 const w=window.open('','_blank');
 if(!w){window.f4UiDialog.alert('Izinkan pop-up laporan untuk mencetak atau menyimpan PDF.');return}
 w.document.write(html);w.document.close();
}
// One layout and destination selector for both content collections.
// A destination change uses the audited atomic transfer API; no local copying.
function showUnifiedForm(kind,record=null,defaultDestination='portal'){
 if(!inContext())return;
 editing=true;
 const isDoc=kind==='documentation';
 const source=record?record._f4_bank_kind?'bank-sampah':'portal':defaultDestination;
 const listKind=source==='bank-sampah'?(isDoc?'bank_albums':'bank_inventory'):kind;
 active=listKind;
 const returnToList=()=>window.f4SuperadminSwitchModule?window.f4SuperadminSwitchModule(listKind):window.openSuperadminEditor(listKind);
 const label=isDoc?'Dokumentasi':'Inventaris';
 header((record?'Edit ':'Tambah ')+label,'Lengkapi data untuk '+(source==='bank-sampah'?'Bank Sampah.':'Portal Utama.'));
 const form=node('form',undefined,'f4-admin-editor');main.append(form);
 const scopeWrap=node('label',undefined,'f4-content-destination'),scopeLabel=node('span','Tujuan publikasi'),
  scope=node('select');
 scope.name='destination';
 scope.append(new Option('Portal Utama','portal'),new Option('Bank Sampah','bank-sampah'));
 scope.value=source;
 scopeWrap.append(scopeLabel,scope);
 if(record){
  const transfer=node('details',undefined,'f4-transfer-options');
  transfer.append(node('summary','Pindahkan ke portal lain'),scopeWrap);form.append(transfer);
 }else{scope.disabled=true;form.append(scopeWrap)}
 const grid=node('div',undefined,'f4-admin-fields');form.append(grid);
 const fields={},formField=(key,label,type='text',val='',required=false)=>{
  const input=bankField(grid,key,label,type,val,required);fields[key]=input;return input;
 };
 const legacyInventoryCategory=record?._f4_bank_kind==='bank_inventory'
  ?String(record.condition||'').match(/^Kategori:\s*([^\n]+)/i)?.[1]||'' : '';
 const rawCategory=legacyInventoryCategory||String(record?.category||'').replace(/^(?:Bank Sampah|Portal Utama)\s*[:/]\s*/i,'');
 let fromUrl=String(record?.drive_url||record?.photo_ref||'');
 const descRaw=String(record?.description||record?.condition||'');
 const folderLine=descRaw.match(/(?:^|\n)Tautan folder:\s*(https:\/\/\S+)/i);
 if(!fromUrl&&folderLine)fromUrl=folderLine[1];
 const cleanDesc=folderLine?descRaw.replace(folderLine[0],'').trim():descRaw.replace(/^Kategori:\s*[^\n]+\n?/i,'');
 if(isDoc){
  formField('title','Judul dokumentasi','text',record?.title||'',true);
  formField('event_on','Tanggal kegiatan','date',record?.event_on||'');
  formField('description','Deskripsi','textarea',cleanDesc);
  formField('url','Tautan album/folder Google Drive (foto dan video)','url',fromUrl);
  formField('category','Kategori dokumentasi','select');
  formField('sort_order','Urutan','number',record?.sort_order??0).min='0';
  formField('visibility','Akses','select');
  formField('active','Aktif','select');
 }else{
  const condition=String(record?.condition||'');
  const parsedCategory=condition.match(/^Kategori:\s*([^\n]+)/i)?.[1]||'';
  formField('name','Nama barang','text',record?.name||'',true);
  const amount=formField('quantity','Jumlah','number',record?.quantity??1,true);amount.min='0.001';amount.step='0.001';
  formField('unit','Satuan','text',record?.unit||'unit');
  formField('description','Kondisi, lokasi dan keterangan barang','textarea',record?._f4_bank_kind?condition.replace(/^Kategori:\s*[^\n]+\n?/i,'').trim()||record?.location||'':record?.description||'');
  formField('category','Kategori barang','select');
  formField('url','Tautan foto barang (Google Drive)','url',fromUrl);
  formField('visibility','Akses','select');
  if(parsedCategory)fields.category.dataset.originalCategory=parsedCategory;
 }
 const hint=node('p','','f4-admin-note');form.append(hint);
 const media=btn('Buka tautan media',()=>{
  const url=String(fields.url.value||'').trim();
  try{const parsed=new URL(url);if(!['https:','http:'].includes(parsed.protocol))throw Error();
   window.open(parsed.href,'_blank','noopener,noreferrer');
  }catch{hint.textContent='Masukkan tautan Google Drive HTTPS terlebih dahulu.'}
 });
 form.append(media);
 const note=node('p','','f4-admin-message');note.setAttribute('role','status');form.append(note);
 const actions=node('div',undefined,'f4-warga-form-actions');
 const save=btn('Simpan Perubahan',()=>form.requestSubmit(),'f4-admin-primary');
 actions.append(btn('Batal',returnToList),save);form.append(actions);
 const categories=()=>{
  const selected=String(fields.category.value||'').trim()||rawCategory||String(fields.category.dataset.originalCategory||'');
  const portal=isDoc?['Kerja Bakti','Arisan','Acara','Lainnya']:['Peralatan','Perlengkapan','Fasilitas','Lainnya'];
  const bank=isDoc?['Kerja Bakti','Penimbangan','Acara','Lainnya']:['Alat Timbang','Peralatan','Perlengkapan','Drop Point','Lainnya'];
  const values=scope.value==='bank-sampah'?bank:portal;
  fields.category.replaceChildren();
  const keepLegacy=scope.value===source&&!isDoc&&rawCategory&&!values.includes(rawCategory);
  for(const option of [...new Set([...values,...(keepLegacy?[rawCategory]:[])])])
   fields.category.add(new Option(option,option));
  fields.category.value=values.includes(selected)?selected:keepLegacy?rawCategory:
   values.includes(rawCategory)?rawCategory:values[0];
 };
 const updateOptions=()=>{
  categories();
  fields.visibility.replaceChildren(new Option('Publik','publik'),new Option('Privat','privat'));
  fields.visibility.value=record?.visibility||'publik';
  if(scope.value==='bank-sampah'&&!isDoc){
   fields.visibility.value='publik';fields.visibility.disabled=true;
   hint.textContent='Inventaris Bank Sampah ditampilkan sebagai inventaris program. Pilih Portal Utama untuk pengaturan akses publik/privat.';
  }else{
   fields.visibility.disabled=false;
   hint.textContent=scope.value==='bank-sampah'&&isDoc
    ?'Gunakan tautan foto/video langsung agar tampil dalam galeri. Tautan folder tetap disimpan sebagai referensi album.'
    :isDoc?'Untuk banyak foto/video, gunakan satu tautan folder atau album Google Drive.':'Gunakan tautan Google Drive untuk foto barang.';
  }
  if(isDoc){
   const bank=scope.value==='bank-sampah';
   fields.sort_order.disabled=bank;
   fields.active.replaceChildren(new Option('Ya / aktif','1'),new Option('Tidak / nonaktif','0'));
   fields.active.value=record?.active===0?'0':'1';
   fields.active.disabled=bank;
  }
 };
 scope.onchange=updateOptions;updateOptions();
 form.onsubmit=async e=>{
  e.preventDefault();note.textContent='';
  if(!form.reportValidity())return;
  const value=key=>String(fields[key]?.value||'').trim();
  const dest=scope.value;
  const data={category:value('category'),description:value('description'),
   visibility:value('visibility')||'publik',url:value('url')};
  if(isDoc){Object.assign(data,{title:value('title'),event_on:value('event_on'),
    sort_order:Number(value('sort_order')||0),active:fields.active.value==='1'});}
  else{Object.assign(data,{name:value('name'),quantity:Number(value('quantity')),
    unit:value('unit')||'unit',location:''});}
  save.disabled=true;note.textContent='Menyimpan perubahan…';
  try{
   const post=(endpoint,obj)=>send(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
   if(record&&source!==dest){
    if(!await f4ContentDialog('Konfirmasi pemindahan', 'Pindahkan '+label+' dari '+(source==='portal'?'Portal Utama':'Bank Sampah')+
     ' ke '+(dest==='portal'?'Portal Utama':'Bank Sampah')+'? Data asal tetap disimpan sebagai arsip.','Ya, Pindahkan',false)){note.textContent='Pemindahan dibatalkan.';return;}
    await post(base+'transfer',{kind,source,destination:dest,id:record.id,values:data});
   }else if(dest==='portal'){
    const values=isDoc?{
     title:data.title,event_on:data.event_on,description:data.description,drive_url:data.url,
     category:data.category,sort_order:data.sort_order,visibility:data.visibility,
     active:data.active?1:0
    }:{
     name:data.name,quantity:data.quantity,unit:data.unit,description:data.description,
     category:data.category,photo_ref:data.url,visibility:data.visibility
    };
    if(record){
     const changed={};
     for(const [key,val] of Object.entries(values))
      if(String(record[key]??'')!==String(val))changed[key]=val;
     if(!Object.keys(changed).length){note.textContent='Tidak ada perubahan untuk disimpan.';return;}
     await post(base+kind,{action:'save',id:record.id,values:changed});
    }else await post(base+kind,{action:'save',values});
   }else if(isDoc){
    const category=bankCategory(data.category);
    const folder=/drive\.google\.com\/drive\/folders\//i.test(data.url);
    const desc=data.description+(folder&&data.url?'\nTautan folder: '+data.url:'');
    if(record){
     await post(bankApi+'albums/edit',{id:record.id,title:data.title,eventOn:data.event_on,
      description:desc,category,visibility:data.visibility});
     if(data.url&&!folder){
      await post(bankApi+'media-link',{requestKey:'media_'+crypto.randomUUID().replace(/-/g,''),
       albumId:record.id,mediaType:/\.(mp4|webm)(\?|$)|youtu|youtube/i.test(data.url)?'video':'foto',
       url:data.url,caption:data.title});
     }
    }else{
     const made=await post(bankApi+'albums',{title:data.title,eventOn:data.event_on,
      description:desc,category,visibility:data.visibility});
     if(data.url&&!folder){
      try{await post(bankApi+'media-link',{requestKey:'media_'+crypto.randomUUID().replace(/-/g,''),
       albumId:made.id,mediaType:/\.(mp4|webm)(\?|$)|youtu|youtube/i.test(data.url)?'video':'foto',
       url:data.url,caption:data.title});}
      catch(error){note.textContent='Album sudah tersimpan tetapi media gagal ditambahkan: '+error.message+'. Periksa daftar sebelum membuat ulang.';return;}
     }
    }
    // Existing media are retained; supplied new links are added, not replaced.
   }else if(record){
    await post(base+'transfer',{kind,source,destination:dest,id:record.id,values:data});
   }else{
    await post(bankApi+'inventory',{requestKey:'stock_'+crypto.randomUUID().replace(/-/g,''),
     name:data.name,quantity:data.quantity,unit:data.unit,subcategory:data.category,
     location:data.location,description:data.description,photoUrl:data.url});
   }
   await returnToList();
  }catch(error){note.textContent='Gagal menyimpan: '+error.message;}
  finally{save.disabled=false;}
 };
}

function showForm(record){
 if(!inContext())return;
 if(active==='documentation'||active==='inventory')return showUnifiedForm(active,record);
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
  else if(active==='projects'&&key==='project_kind'){
   input=node('select');
   for(const [value,caption] of [
    ['informasi','Informasi / kegiatan'],['kas','Dana dari Pembukuan / Kas'],
    ['penggalangan','Penggalangan Dana'],['pesanan','Pemesanan Barang'],
    ['portal','Terhubung portal lain']])input.add(new Option(caption,value));
  }
  else if(active==='projects'&&key==='fund_source'){
   input=node('select');
   input.add(new Option('Pilih kategori kas Pembukuan',''));
   if(record?.fund_source)input.add(new Option(record.fund_source,record.fund_source));
  }
  else if(active==='projects'&&key==='linked_key'){
   input=node('select');
   for(const [value,caption] of [
    ['','Tidak terhubung'],['bank-sampah','Portal Bank Sampah'],['jersey','Modul Jersey lama']])
    input.add(new Option(caption,value));
  }
  else if(active==='jersey'&&key==='method'){
   input=node('select');
   for(const [value,caption] of [['','Belum diketahui / pilih metode'],['QRIS','QRIS'],['Cash','Cash (tunai)'],
    ['Campuran','Campuran (QRIS + Cash)'],['Lainnya','Metode lain / keterangan']]){
    input.append(new Option(caption,value));
   }
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
  else if(type==='projectKind')input.value='informasi';
  else if(type==='number')input.value='0';
  field.append(input);grid.append(field);
 }
 if(active==='projects'){
  const typeField=form.elements.namedItem('project_kind');
  const category=form.elements.namedItem('fund_source');
  const goal=form.elements.namedItem('fund_target_rp');
  const linked=form.elements.namedItem('linked_key');
  const note=node('p','', 'f4-admin-note');form.append(note);
  const refreshKind=()=>{
   const kind=typeField?.value||'informasi';
   const isGapuraKas=kind==='kas'&&String(form.elements.namedItem('title')?.value||'').trim().toLowerCase()==='gapura';
   if(category?.parentElement)category.parentElement.hidden=kind!=='kas'||isGapuraKas;
   if(goal?.parentElement)goal.parentElement.hidden=!['kas','penggalangan'].includes(kind);
   if(linked?.parentElement)linked.parentElement.hidden=!['informasi','portal','pesanan'].includes(kind);
   note.textContent=isLegacyJerseyProject({title:form.elements.namedItem('title')?.value,linked_key:linked?.value})
    ?'Jersey lama: daftar Bapak-bapak dan Ibu-ibu, status bayar, QRIS/Cash, laporan, dan tombol lama tetap memakai modul Jersey D1 yang sudah ada. Tidak membuat tabel pesanan kosong.'
    :kind==='pesanan'
    ?'Setelah proyek disimpan, tombol Kelola Pesanan otomatis tersedia. Setiap proyek memiliki daftar pesanan tersendiri (berdasarkan ID proyek). Bukan tabel Jersey lama.'
    :kind==='penggalangan'
    ?'Setelah proyek disimpan, tombol Kelola Kontribusi tersedia. Dana yang dicatat di sini terpisah dari jurnal kas lorong.'
    :kind==='kas'
    ?(isGapuraKas?'Gapura memakai saldo kas total Pembukuan, termasuk saldo awal.':'Pilih kategori kas yang sesuai di Pembukuan. Tidak membuat transaksi baru.')
    :kind==='portal'
    ?'Pilih portal atau modul yang sudah ada. Kartu menjadi penghubung, bukan menyalin transaksi.'
    :'Proyek informasi menampilkan judul, gambar, deskripsi, dan tautan.';
  };
  typeField?.addEventListener('change',refreshKind);
  linked?.addEventListener('change',refreshKind);
  form.elements.namedItem('title')?.addEventListener('input',refreshKind);
  refreshKind();
  send('https://api.flamboyan4.web.id/api/v2/admin/projects/categories').then(data=>{
   if(!form.isConnected||!category)return;
   const chosen=category.value,seen=new Set();
   const labels=[];
   for(const label of (Array.isArray(data.data)?data.data:[])){
    const item=String(label||'').trim(),lower=item.toLowerCase();
    if(!item||seen.has(lower))continue;
    seen.add(lower);labels.push(item);
   }
   const popular=/^(kas lorong|perbaikan\s*\/\s*fasilitas|donasi)$/i;
   const important=labels.filter(x=>popular.test(x)||x===chosen);
   const remaining=labels.filter(x=>!important.includes(x));
   function refill(expanded){
    category.replaceChildren(new Option('Pilih kategori kas terkait',''));
    for(const item of [...important,...(expanded?remaining:[])])category.add(new Option(item,item));
    if(chosen&&!labels.includes(chosen))category.add(new Option(chosen+' (kategori lama)',chosen));
    category.value=chosen;
   }
   refill(false);
   if(remaining.length){
    const more=btn('Lihat '+remaining.length+' kategori lainnya',()=>{
     const selected=category.value;
     refill(true);category.value=selected;
     more.remove();
    },'f4-admin-btn');
    more.setAttribute('aria-label','Tampilkan semua kategori kas Pembukuan');
    category.parentElement.append(more);
   }
  }).catch(error=>{if(form.isConnected)note.textContent+=' Kategori kas tidak dapat dimuat: '+error.message});
  if(record&&isLegacyJerseyProject(record))
   form.append(btn('Buka Tabel Jersey Lama',()=>window.openSuperadminEditor?.('jersey'),'f4-admin-btn f4-admin-primary'));
  else if(record&&['pesanan','penggalangan'].includes(record.project_kind))
   form.append(btn(record.project_kind==='pesanan'?'Buka Tabel Pesanan':'Buka Tabel Kontribusi',
    ()=>window.F4ProjectModule?.open(record),'f4-admin-btn f4-admin-primary'));
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

 // Jersey received cash is a separate visual field, encoded on save into the
 // supported method column with the F4BAYAR marker.
 let receivedField=null;
 let methodChoice=null,methodDetails=null,qrisSplitField=null,cashSplitField=null;
 if(active==='jersey'){
  const label=node('label',undefined,'f4-jersey-received-field');
  label.append(node('span','Uang diterima (Rp)'));
  receivedField=node('input');receivedField.type='number';
  receivedField.min='0';receivedField.step='1';receivedField.inputMode='numeric';
  receivedField.placeholder='Contoh: 120000';
  const exact=paidJerseyExact(record);
  if(exact!==null)receivedField.value=String(exact);
  label.append(receivedField,node('small',
   'Jumlah uang yang benar-benar masuk. Jika lebih dari harga, selisih menjadi titipan, bukan otomatis celana.',
   'f4-admin-note'));
  grid.append(label);
  const preview=node('div',undefined,'f4-jersey-payment-preview');
  methodChoice=form.elements.namedItem('method');
  const initialKind=jerseyMethodKind(record?.method);
  const initialNote=jerseyMethodNote(record?.method,initialKind);
  methodChoice.value=initialKind;
  const extraLabel=node('label',undefined,'f4-jersey-method-details');
  extraLabel.append(node('span','Keterangan metode (opsional)'));
  methodDetails=node('input');methodDetails.type='text';
  methodDetails.placeholder='Contoh: transfer bank / catatan penerimaan';
  methodDetails.value=initialNote;extraLabel.append(methodDetails);
  grid.append(extraLabel);
  const splitLabel=node('div',undefined,'f4-jersey-split-fields');
  const priorSplit=jerseySplitExact(record);
  const qrLabel=node('label');qrLabel.append(node('span','QRIS (Rp)'));
  qrisSplitField=node('input');qrisSplitField.type='number';qrisSplitField.min='0';qrisSplitField.step='1';
  qrisSplitField.inputMode='numeric';qrisSplitField.placeholder='0';
  if(priorSplit)qrisSplitField.value=String(priorSplit.qris);
  qrLabel.append(qrisSplitField);
  const cashLabel=node('label');cashLabel.append(node('span','Cash (Rp)'));
  cashSplitField=node('input');cashSplitField.type='number';cashSplitField.min='0';cashSplitField.step='1';
  cashSplitField.inputMode='numeric';cashSplitField.placeholder='0';
  if(priorSplit)cashSplitField.value=String(priorSplit.cash);
  cashLabel.append(cashSplitField);splitLabel.append(qrLabel,cashLabel);
  grid.append(splitLabel);
  const update=()=>{
   const price=Math.max(0,Number(form.elements.namedItem('nominal_rp')?.value||0));
   const paid=receivedField.value.trim()===''?null:Number(receivedField.value);
   const kind=methodChoice.value;
   const label=kind==='QRIS'?'QRIS':kind==='Cash'?'Cash':kind==='Campuran'?'Campuran QRIS + Cash':
    kind==='Lainnya'?'Metode lain':'Belum diketahui';
   splitLabel.hidden=kind!=='Campuran';
   extraLabel.hidden=kind!=='Lainnya'&&!methodDetails.value.trim();
   if(paid===null){
    preview.textContent='Metode: '+label+' • Nominal belum tercatat; pembayaran lama tetap mengikuti data tersimpan.';
    return;
   }
   const splitInfo=kind==='Campuran'&&qrisSplitField.value!==''&&cashSplitField.value!==''?
    ' • QRIS '+jerseyRp(qrisSplitField.value)+' + Cash '+jerseyRp(cashSplitField.value):'';
   preview.textContent='Metode: '+label+' • Harga '+jerseyRp(price)+' • Diterima '+jerseyRp(paid)+
    ' • Sisa '+jerseyRp(Math.max(0,price-paid))+
    ' • Titipan '+jerseyRp(Math.max(0,paid-price))+splitInfo;
  };
  receivedField.addEventListener('input',update);
  form.elements.namedItem('nominal_rp')?.addEventListener('input',update);
  methodChoice.addEventListener('change',update);
  methodDetails.addEventListener('input',update);
  qrisSplitField.addEventListener('input',update);
  cashSplitField.addEventListener('input',update);
  grid.append(preview);update();
 }
 const notice=node('p','','f4-admin-message');form.append(notice);
 const actions=node('div',undefined,'f4-warga-form-actions');
 actions.append(btn('Batal',viewList),btn(record?'Simpan Perubahan':'Tambah Pesanan',()=>{if(form.reportValidity())form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))},'f4-admin-primary'));
 form.append(actions);
 form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const values={},obj={action:'save'};
  if(record)obj.id=record[def.key||'id'];
  for(const input of form.querySelectorAll('[name]')){
   const value=input.value.trim();
   if(input.required&&!value){notice.textContent=input.name+' wajib diisi.';input.focus();return}
   if(input.readOnly)continue;
   if(active==='jersey'&&input.name==='method')continue; // Serialized below with amount and audit markers.
   const next=input.type==='number'?Number(value):input.name==='active'?Number(value):value;
   // Edit parsial: jangan mengirim ulang kolom lama yang tidak disentuh.
   // Misalnya URL relatif pada data projek lama tetap utuh tanpa melewati validasi URL baru.
   if(record&&Object.hasOwn(record,input.name)&&String(record[input.name]??'')===String(next))continue;
   values[input.name]=next;
  }
  if(active==='jersey'){
    const price=Math.max(0,Number(form.elements.namedItem('nominal_rp')?.value||0));
    const kind=methodChoice.value,remark=methodDetails.value.trim();
    const oldKind=jerseyMethodKind(record?.method),oldRemark=jerseyMethodNote(record?.method,oldKind);
    const sameBase=!!record&&kind===oldKind&&remark===oldRemark;
    const rootMethod=sameBase?plainJerseyMethod(record?.method):
      (kind==='Lainnya'?remark:(kind==='Campuran'?'QRIS + Cash':kind)+(remark?' — '+remark:''));
    const raw=receivedField?.value.trim()||'';
    let splitTag='';
    if(kind==='Campuran'){
      const oldSplit=jerseySplitExact(record);
      const splitProvided=qrisSplitField.value.trim()!==''||cashSplitField.value.trim()!=='';
      if(splitProvided){
       const q=Number(qrisSplitField.value||0),c=Number(cashSplitField.value||0);
       if(!Number.isSafeInteger(q)||!Number.isSafeInteger(c)||q<0||c<0||q+c!==Number(raw)){
        notice.textContent='Jumlah QRIS + Cash harus sama persis dengan uang diterima.';
        qrisSplitField.focus();return;
       }
       splitTag='[F4SPLIT:'+q+':'+c+']';
      }else if(raw!==''&&(!sameBase||!record)){
       notice.textContent='Untuk pembayaran campuran, isi nominal QRIS dan Cash agar laporan tepat.';
       qrisSplitField.focus();return;
      }else if(oldSplit&&sameBase&&raw!==''){
       splitTag='[F4SPLIT:'+oldSplit.qris+':'+oldSplit.cash+']';
      }
    }
    if(kind==='Lainnya'&&!remark){
      notice.textContent='Masukkan keterangan metode lain atau pilih QRIS/Cash.';
      methodDetails.focus();return;
    }
    if(raw!==''){
      const paid=Number(raw);
      if(!Number.isSafeInteger(paid)||paid<0||paid>999999999999){
        notice.textContent='Uang diterima harus berupa bilangan rupiah bulat, minimal nol.';
        receivedField.focus();return;
      }
      const stored=(rootMethod?rootMethod+' ':'')+
        (splitTag?splitTag+' ':'')+'[F4BAYAR:'+paid+']';
      if(!record||stored!==String(record.method||''))values.method=stored;
      const status=price>0&&paid>=price?'Lunas':paid>0?'DP Rp'+paid:'Belum bayar';
      if(!record||status!==String(record.payment_status||''))values.payment_status=status;
    }else if(record&&paidJerseyExact(record)!==null){
      notice.textContent='Uang yang sudah tercatat tidak boleh dikosongkan. Isi 0 hanya jika uang benar-benar dikembalikan, lalu konfirmasi koreksi.';
      receivedField.focus();return;
    }else{
      if(kind==='Campuran'&&splitTag){
       notice.textContent='Isi uang diterima sebelum merinci pembayaran campuran.';
       receivedField.focus();return;
      }
      if(!record||rootMethod!==String(record.method||''))values.method=rootMethod;
    }
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
  const submit=actions.lastChild;if(submit.disabled)return;
  if(active==='jersey'&&record){
   const previous=paidJerseyExact(record),nextRaw=receivedField?.value.trim()||'';
   if(previous!==null&&nextRaw!==''&&Number(nextRaw)<previous){
    submit.disabled=true;
    const approved=await f4ContentDialog('Konfirmasi pengurangan uang diterima',
     'Nominal berubah dari '+jerseyRp(previous)+' menjadi '+jerseyRp(Number(nextRaw))+'. Pastikan pengembalian atau koreksi uang benar-benar terjadi. Riwayat perubahan tercatat di audit.',
     'Simpan Koreksi',false,true);
    submit.disabled=false;
    if(!approved){notice.textContent='Koreksi nominal dibatalkan.';return}
   }
  }
  submit.disabled=true;notice.textContent='Menyimpan…';
  try{
   const saved=await send(base+active,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
   records=await fetchData(active);
   if(active==='jersey'){
    const savedId=String(record?.id||saved.id||'');
    const latest=records.find(x=>String(x.id)===savedId);
    const mismatched=Object.entries(obj.values||{}).filter(([key,value])=>String(latest?.[key]??'')!==String(value));
    if(!savedId||!latest||mismatched.length){
     notice.textContent='API menerima permintaan, tetapi baca ulang belum sesuai pada '+(mismatched.map(x=>x[0]).join(', ')||'ID pesanan')+'. Jangan input pesanan kedua; muat ulang dan periksa datanya.';
     return;
    }
    filter='';lastSavedJerseyId=savedId;
   }
   viewList();
   const info=main.querySelector('.f4-admin-note');
   if(info)info.textContent='Data berhasil disimpan dan diverifikasi dari server. '+records.length+' baris tersedia.';
   if(active==='projects'&&!record&&saved?.id){
    const newest=records.find(x=>String(x.id)===String(saved.id));
    if(newest&&['pesanan','penggalangan'].includes(newest.project_kind)){
     await window.F4ProjectModule?.open(newest);
    }
   }
   if(active==='jersey'){
    main.querySelector('.f4-jersey-saved')?.scrollIntoView({behavior:'smooth',block:'nearest'});
    lastSavedJerseyId=null;
   }
  }catch(err){notice.textContent='Gagal menyimpan: '+err.message}
  finally{submit.disabled=false}
 });
}
async function fetchData(kind){
 const d=await send(base+kind);
 const portalRows=Array.isArray(d.data)?d.data:[];
 if(kind!=='documentation'&&kind!=='inventory')return portalRows;
 // Portal Utama lists only its own publication scope.
 // Read legacy bank links to avoid showing an album twice across the two areas.
 try{
  const bank=await send(bankApi+(kind==='documentation'?'albums':'inventory')+'?limit=500');
  const bankRows=(Array.isArray(bank.data)?bank.data:[])
   .filter(x=>kind==='documentation'?x.status==='aktif'&&!/^Portal Utama\s*[:/]/i.test(x.category||''):
    String(x.category||'')==='bank_sampah'&&Number(x.active)===1)
   .map(x=>({...x,_f4_bank_kind:kind==='documentation'?'bank_albums':'bank_inventory',
    drive_url:kind==='documentation'?bankFolderLink(x):'',
    photo_ref:kind==='inventory'?String(x.photoUrl||''):''
   }));
  const bankById=new Map(bankRows.map(x=>[String(x.id),x]));
  if(kind==='inventory')return portalRows.filter(x=>!/^Pindah Bank Sampah\s*[:/]/i.test(x.category||'')&&!bankScoped(x));
  const linkedPortal=portalRows
   .filter(x=>!/^Pindah Bank Sampah\s*[:/]/i.test(x.category||'')&&!bankScoped(x)&&!bankScoped(bankById.get(String(x.id))||{}))
   .map(x=>({...x,_f4_bank_record:bankById.get(String(x.id))||null}));
  return linkedPortal;
 }catch(error){
  console.warn('Dokumentasi Bank Sampah belum dapat ditampilkan:',error);
  return portalRows.filter(x=>!/^Pindah Bank Sampah\s*[:/]/i.test(x.category||'')&&!bankScoped(x));
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
const bankScoped=a=>{
 const category=String(a.category||a.kategori||'');
 const scope=String(a.portal_scope||a.source_portal||a.scope||a.portal||a.program||'')
  .replace(/[\s_-]+/g,'').toLowerCase();
 return a.bank_sampah===true||a.is_bank_sampah===true||
  ['banksampah','wastebank'].includes(scope)||
  /^Bank Sampah\s*[:/]/i.test(category)||/^(bank[_ -]?sampah|wastebank)$/i.test(category)||
  (/(gorol|drop point)/i.test(String(a.title||a.judul||a.name||''))&&
    String(a.event_on||a.eventOn||a.tanggal||a.date||a.happened_on||'').startsWith('2026-10-11'));
};
const bankFolderLink=record=>{
 const description=String(record?.description||'');
 const fromDescription=description.match(/(?:^|\n)\s*Tautan folder:\s*(https:\/\/drive\.google\.com\/drive\/folders\/[^\s]+)/i)?.[1]||'';
 const candidate=String(record?.drive_url||record?.folderUrl||record?.sourceFolder||fromDescription||'').trim();
 if(candidate&&/^https:\/\/drive\.google\.com\/drive\/folders\/[\w-]+/i.test(candidate))return candidate;
 // Link arsip kegiatan Gorol yang telah diverifikasi dari metadata sumber.
 if(/gorol|drop point/i.test(String(record?.title||''))&&
    String(record?.event_on||'').startsWith('2026-10-11'))
  return 'https://drive.google.com/drive/folders/1ywp2v8rUH-oAGcM91PQyVrO7Wx9iLdCA';
 return '';
};
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
 const serial=++requestSerial;sideMenu();
 const def=bankModules[kind];
 header(def.label.replace(' Bank Sampah',''),'Data dan publikasi khusus Bank Sampah.');
 const tools=node('div',undefined,'f4-admin-controls'),q=node('input');
 q.placeholder='Cari data Bank Sampah';tools.append(q,btn('+ Tambah '+({bank_albums:'album',bank_inventory:'barang',bank_progress:'kegiatan'}[kind]),()=>showBankForm(kind,null)),btn('Muat Ulang',()=>openBankAdminEditor(kind)));
 main.append(tools);
 const info=node('p','Memuat data Bank Sampah…','f4-admin-note');main.append(info);
 const box=node('div',undefined,'f4-admin-list');main.append(box);
 try{
  const payload=await send(bankApi+(kind==='bank_albums'?'albums':def.listKey)+'?limit=500');
  if(active!==kind||serial!==requestSerial||!main.contains(box))return;
  let rows=Array.isArray(payload.data)?payload.data:
   Array.isArray(payload.rows)?payload.rows:
   Array.isArray(payload.albums)?payload.albums:
   Array.isArray(payload.data?.rows)?payload.data.rows:[];
  if(kind==='bank_inventory')rows=rows.filter(item=>String(item.category||'')==='bank_sampah'&&Number(item.active)===1);
  // Album tanpa penanda dipertahankan agar Superadmin dapat mengklasifikasikan
  // arsip lama secara eksplisit; tidak otomatis dijadikan album Bank Sampah.
  if(kind==='bank_albums')rows=rows.filter(bankScoped); // Retain legacy Gorol album without rewriting its D1 category.
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
    const actions=node('span',undefined,'f4-admin-action-set');
    if(kind==='bank_albums'){
     const sourceUrl=bankFolderLink(record);
     if(sourceUrl){
      const link=node('a','Buka folder foto/video','f4-admin-source-link');
      link.href=sourceUrl;link.target='_blank';link.rel='noopener noreferrer';
      actions.append(link);
     }
    }
    actions.append(btn('Edit',()=>showBankForm(kind,record)));
    const del=btn('Hapus',()=>removeContentRecord(record,kind,del),'f4-admin-btn f4-admin-danger');
    actions.append(del);article.append(actions);box.append(article);
   }
   if(!found.length)box.append(node('p','Tidak ada data yang cocok.','f4-admin-note'));
  };
  q.oninput=draw;draw();
 }catch(e){if(serial===requestSerial&&main.contains(info))info.textContent='Gagal memuat konten Bank Sampah: '+e.message}
}
function showBankForm(kind,record){
 if(!inContext())return;
 if(kind==='bank_albums'||kind==='bank_inventory'){
  const module=kind==='bank_albums'?'documentation':'inventory';
  return showUnifiedForm(module,record?{...record,_f4_bank_kind:kind}:null,'bank-sampah');
 }
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
  add('status','Status kegiatan','select','',true);
  for(const value of ['Perencanaan','Berjalan','Selesai'])controls.status.add(new Option(value,value));
  const previous=record?.status||'Berjalan';
  if(![...controls.status.options].some(o=>o.value===previous))controls.status.add(new Option(previous,previous));
  controls.status.value=previous;
  add('nextStep','Agenda berikutnya','text',record?.next_step||'');
  add('photoUrl','Tautan foto HTTPS (opsional)','url',record?.photoUrl||'');
  add('publicVisible','Tampilkan di portal publik','checkbox');
  controls.publicVisible.checked=record?.public_visible!==0;
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
      status:get('status'),nextStep:get('nextStep'),photoUrl:get('photoUrl'),publicVisible:controls.publicVisible.checked};
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