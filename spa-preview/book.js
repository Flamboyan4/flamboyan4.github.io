import {createReceiptViewer,bookReceipt} from './receipts.js';
/* Native Pembukuan preview routes. All reads use the original data mapper.
   Payment preview uses the existing allocation algorithm; it never posts. */
import {createBookReader} from './book-reader.js';
import {createTransactionService} from './transactions.js';
export const bookRoutes={
 book:'Pembukuan','book-input':'Input Iuran','book-history':'Riwayat Pembayaran',
 'book-cash':'Buku Kas','book-fines':'Denda','book-loans':'Pinjaman',
 'book-advances':'Talangan','book-report':'Laporan','book-residents':'Data Warga',
 'book-tariffs':'Tarif & Aturan','book-archive':'Arsip Tahunan'
};
const money=v=>v==null||v===''||!Number.isFinite(Number(v))?'—':'Rp '+new Intl.NumberFormat('id-ID').format(Number(v));
const today=()=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return o.year+'-'+o.month+'-'+o.day;};
const text=v=>v==null||v===''?'—':String(v);
export function createBookModule({role,accountKey,get,go,el,panel,row,metric,links}){
 function title(name){const n=el('section');n.append(el('h1',name));return n}
 function nav(root,items){const bar=el('div',null,'bank-route-links');for(const [key,label] of items){const b=el('button',label);b.type='button';b.onclick=()=>go(key);bar.append(b)}root.append(bar)}
 function note(root,items,limit){if(!items.length)row(root,'Belum ada data','');if(items.length>=limit)row(root,'Batas daftar '+limit+' baris tercapai','Gunakan laporan lengkap untuk memastikan seluruh periode tercakup.')}
 function legacy(root,label){links(root,[[label,'/pembukuan/']]);}
 function field(name,input){const l=el('label',name);input.setAttribute('aria-label',name);l.append(input);return l}
 function opt(value,name){const o=el('option',name);o.value=String(value);return o}
 function input(type,value){const n=el('input');n.type=type;n.value=value??'';n.required=true;return n}
 function select(items){const s=el('select');s.required=true;for(const [value,label] of items)s.append(opt(value,label));return s}
 function recordTitle(x){return [x.nama||'Nama belum tersedia',[x.blok,x.noRumah].filter(Boolean).join('/')].filter(Boolean).join(' · ')}
 function dateSort(items,key){return items.slice().sort((a,b)=>String(b[key]||'').localeCompare(String(a[key]||'')))}
 function list(root,items,titleFn,detailFn,limit){for(const x of items)row(root,titleFn(x),detailFn(x));note(root,items,limit);}
 function formStatus(p){p.setAttribute('role','status');p.setAttribute('aria-live','polite');return p}
 async function mount({key,signal}){
  if(role!=='superadmin'||!accountKey)throw Error('Akses Pembukuan ditolak.');
  if(!Object.prototype.hasOwnProperty.call(bookRoutes,key))throw Error('Rute tidak ditemukan.');
  const read=createBookReader(path=>get(path,signal,true));
  const root=title(bookRoutes[key]);
  if(key==='book'){
   nav(root,Object.entries(bookRoutes).filter(([k])=>k!=='book'));
   const p=panel(root,'Input Data');row(p,'Iuran, transaksi kas, dan kewajiban lain','Modul baca dan validasi sedang diuji. Penyimpanan tetap di portal asli.');
   legacy(root,'Pembukuan lengkap');return {node:root};
  }
  if(key==='book-input'){
   const d=await read('bootstrap'),members=d.warga.filter(x=>x.statusAktif==='Ya');
   const p=panel(root,'Uji alokasi pembayaran'),form=el('form',null,'bank-draft'),person=select([['','Pilih warga'],...members.map(x=>[x.idWarga,recordTitle(x)])]);
   const date=input('date',today()),year=input('number',today().slice(0,4)),month=select(Array.from({length:12},(_,i)=>[i+1,new Intl.DateTimeFormat('id-ID',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,i,1)))]));
   year.min='2020';year.max='2100';year.step='1';month.value=String(Number(today().slice(5,7)));
   const periods=select([[1,'1 bulan'],[2,'2 bulan'],[3,'3 bulan']]),amount=input('number','');amount.min='1';amount.step='1';amount.inputMode='numeric';
   const method=select([['Cash','Cash'],['QRIS','QRIS'],['Transfer Mandiri','Transfer Mandiri']]),memo=input('text','');memo.required=false;memo.maxLength=500;
   const check=el('button','Periksa alokasi');check.type='submit';const status=formStatus(el('p')),preview=el('div');let busy=false,dirty=false,revision=0;
   form.addEventListener('input',()=>{dirty=true;revision++;preview.replaceChildren();status.textContent=''});
   const service=createTransactionService({role,accountKey,allowWrites:false,transport:(path,payload)=>{if(payload!==undefined)throw Error('Mode uji tidak melakukan POST.');return get(path,signal,true)}});
   form.addEventListener('submit',async e=>{
    e.preventDefault();if(busy)return;busy=true;check.disabled=true;preview.replaceChildren();status.textContent='Memeriksa kewajiban…';const version=revision;
    try{
     const payload=await service.book('previewiuran',{idWarga:person.value,tanggal:date.value,tahun:Number(year.value),bulan:Number(month.value),jumlahBulan:Number(periods.value),nominalDibayar:Number(amount.value),metode:method.value,catatan:memo.value});
     if(signal.aborted||version!==revision)return;
     const result=panel(preview,'Rincian alokasi');const names={IURAN_BULANAN:'Iuran Bulanan',KEBERSIHAN:'Kebersihan',KAS_LORONG:'Kas Lorong',ARISAN:'Arisan'};
     for(const x of payload.alokasi)row(result,names[x.jenis]||x.jenis,x.bulan+'/'+x.tahun+' · '+money(x.nominal));
     if(payload.denda.length)row(result,'Denda dialokasikan',money(payload.denda.reduce((n,x)=>n+x.nominal,0)));
     if(payload.settleAdvanceId)row(result,'Talangan','Termasuk penggantian talangan sesuai periode.');
     row(result,'Total pembayaran',money(payload.jumlahRp));status.textContent='Validasi berhasil. Tidak ada pembayaran yang disimpan.';dirty=false;
    }catch(error){if(!signal.aborted&&revision===version)status.textContent=error.message;}finally{busy=false;check.disabled=false}
   });
   form.append(field('Nama warga',person),field('Tanggal pembayaran',date),field('Tahun iuran',year),field('Bulan iuran',month),field('Jumlah bulan',periods),field('Nominal dibayar (Rp)',amount),field('Metode',method),field('Catatan',memo),check,status,preview);p.append(form);
   links(root,[['Simpan pembayaran di portal asli','/pembukuan/?halaman=input']]);
   return {node:root,canLeave:()=>!busy&&(!dirty||window.confirm('Draf uji belum diperiksa. Tinggalkan halaman?'))};
  }
  if(key==='book-history'){
   const d=await read('riwayatpembayaran'),p=panel(root,'Pembayaran warga');
   const receipts=createReceiptViewer(root,{el,signal});
   for(const x of dateSort(d.data,'tanggalIso')){
    const item=el('div',null,'receipt-row');row(item,recordTitle(x),[x.tanggal,money(x.totalDiterima),x.metode,x.status].filter(Boolean).join(' · '));
    const button=receipts.button(bookReceipt(x));if(button)item.append(button);p.append(item);
   }
   note(p,d.data,1000);
  }else if(key==='book-cash'){
   const d=await read('datatransaksikas',{allPeriods:true}),p=panel(root,'Pemasukan & pengeluaran');
   list(p,dateSort(d.data,'tanggal'),x=>x.keterangan||x.kategori||x.jenis,x=>[x.tanggal,x.jenis,money(x.debit>0?x.debit:x.kredit),x.status].filter(Boolean).join(' · '),500);
  }else if(key==='book-fines'){
   const d=await read('datadenda'),p=panel(root,'Riwayat denda');
   list(p,dateSort(d.data.rows,'tanggalKegiatan'),recordTitle,x=>[x.tanggalKegiatan,x.namaKegiatan,money(x.nominal),x.status].filter(Boolean).join(' · '),200);
  }else if(key==='book-loans'){
   const d=await read('datapinjaman'),p=panel(root,'Riwayat pinjaman');
   list(p,dateSort(d.data.rows,'tanggalPinjaman'),recordTitle,x=>[x.tanggalPinjaman,'Pokok '+money(x.nominalPinjaman),'Sisa '+money(x.sisaPinjaman),x.status].join(' · '),200);
  }else if(key==='book-advances'){
   const d=await read('datatalangan'),p=panel(root,'Riwayat talangan');
   list(p,dateSort(d.data.rows,'tanggalTalangan'),recordTitle,x=>[x.tanggalTalangan,x.bulan+' '+x.tahun,'Sisa '+money(x.sisaTalangan),x.status,x.perluRekonsiliasi?'Perlu rekonsiliasi':''].filter(Boolean).join(' · '),200);
  }else if(key==='book-residents'){
   const d=await read('bootstrap'),p=panel(root,'Warga');
   list(p,d.warga,recordTitle,x=>x.statusAktif==='Ya'?'Aktif':'Tidak aktif',Infinity);
   const h=panel(root,'Rumah');list(h,d.rumah,x=>[x.blok,x.noRumah].filter(Boolean).join('/'),x=>x.statusRumah,Infinity);
  }else if(key==='book-tariffs'){
   const d=await read('bootstrap'),p=panel(root,'Konfigurasi dari server');
   for(const [k,v] of Object.entries(d.config||{}))if(['string','number','boolean'].includes(typeof v))row(p,k,text(v));
  }else if(key==='book-archive'){
   const d=await read('arsiptahunan'),p=panel(root,'Arsip buku tahunan');
   list(p,d.data,x=>text(x.tahun??x.year),x=>text(x.status??x.closed_on??x.ditutupPada),Infinity);
  }else if(key==='book-report'){
   const p=panel(root,'Laporan tahunan'),year=select(Array.from({length:8},(_,i)=>{const y=Number(today().slice(0,4))-i;return [y,y]}));
   const status=formStatus(el('p')),result=el('div');let revision=0;
   async function refresh(){const token=++revision;result.replaceChildren();status.textContent='Memuat laporan…';try{
    const d=await read('laporantahunan',{tahun:Number(year.value)});
    if(signal.aborted||token!==revision)return;
    // Do not manufacture totals from unrecognized response fields.
    if(!d.data||typeof d.data!=='object')throw Error('Laporan belum tersedia.');
    const data=d.data,fields=Object.entries(data.ringkasan||data.summary||{}).filter(([,v])=>typeof v==='number');
    if(fields.length){for(const [k,v] of fields)row(result,k,/rp|saldo|nominal|kas|masuk|keluar/i.test(k)?money(v):text(v));}
    else row(result,'Laporan tersedia dari server','Gunakan portal asli untuk tabel dan cetak dengan format lengkap.');
    status.textContent='';
   }catch(error){if(!signal.aborted&&token===revision)status.textContent=error.message;}}
   year.onchange=refresh;p.append(field('Tahun',year),status,result);await refresh();
  }
  legacy(root,'Buka fungsi lengkap dan cetak di portal asli');return {node:root};
 }
 return {mount};
}
