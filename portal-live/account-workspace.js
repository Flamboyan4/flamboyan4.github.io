// Akun dan halaman pengelolaan terpadu — tanpa data contoh.
// Data diambil dari Worker Cloudflare dan setiap endpoint memverifikasi hak akses server.
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const page=$('f4-account-page'), panel=$('f4-warga-panel');
 if(!page)return;
 const money=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
 const clean=v=>String(v??'');
 const role=()=>document.body.classList.contains('role-superadmin')?'superadmin':document.body.classList.contains('role-admin')?'admin':document.body.classList.contains('role-warga')?'anggota':'publik';
 const portal=()=>document.body.classList.contains('book-mode')?'pembukuan':document.body.classList.contains('bank-mode')?'bank-sampah':'portal';
 const api=async path=>{
   const r=await fetch('https://api.flamboyan4.web.id'+path,{credentials:'include',cache:'no-store'});
   const p=await r.json().catch(()=>({error:'Respons server bukan JSON'}));
   if(!r.ok||p.ok===false)throw new Error(p.error||'HTTP '+r.status);
   return p;
 };
 const el=(name,text,cls)=>{
   const n=document.createElement(name);if(cls)n.className=cls;
   if(text!==undefined)n.textContent=clean(text);return n;
 };
 const link=(label,handler,cls)=>{
   const b=el('button',label,cls||'f4-work-button');b.type='button';b.onclick=handler;return b;
 };
 const area=page.querySelector('main');
 const side=page.querySelector('aside');
 let requestId=0;
 function navigate(target,section){
   page.hidden=true;if(panel)panel.hidden=true;
   const frame=document.getElementById('appframe');
   const before=frame?.getAttribute('src');
   document.querySelector('nav [data-target="'+target+'"]')?.click();
   if(!section||!frame)return;
   const activate=()=>{
     try{
       const win=frame.contentWindow;
       if(target==='pembukuan'&&typeof win.pilihMenu==='function')win.pilihMenu(section);
       if(target==='bank-sampah'&&typeof win.goPage==='function')win.goPage(section);
     }catch(e){console.warn('Menu asli belum siap:',e)}
   };
   if(before!==frame.getAttribute('src'))frame.addEventListener('load',activate,{once:true});
   else setTimeout(activate,120);
 }
 function profile(){page.hidden=true;document.querySelector('[data-account-action="settings"]')?.click()}
 function navItem(name,handler,active=false){
   const b=link(name,handler,active?'active':'');
   side.append(b);return b;
 }
 function card(label,value,note=''){
   const box=el('article',undefined,'f4-work-stat');
   box.append(el('small',label),el('strong',value),el('span',note));
   return box;
 }
 function section(title,description){
   const box=el('section',undefined,'f4-work-section');
   box.append(el('h3',title));
   if(description)box.append(el('p',description));
   area.append(box);return box;
 }
 function info(title,message){
   const box=section(title);
   box.append(el('p',message,'f4-work-detail'));return box;
 }
 function columns(cards){
   const wrap=el('div',undefined,'f4-work-cards');cards.forEach(c=>wrap.append(c));
   area.append(wrap);return wrap;
 }
 function heading(title,caption){
   area.replaceChildren();
   const header=el('header',undefined,'f4-work-heading');
   header.append(el('h2',title));
   if(caption)header.append(el('p',caption));
   header.append(link('← Kembali ke portal',()=>page.hidden=true,'f4-work-back'));
   area.append(header);
 }
 function actions(title,arr){
   const x=section(title);
   const row=el('div',undefined,'f4-work-actions');
   arr.forEach(([label,cb])=>row.append(link(label,cb)));
   x.append(row);
 }
 function portalTasks(){
   const p=portal(),edit=type=>window.openSuperadminEditor?.(type);
   if(p==='pembukuan')return [['Data Rumah & Warga',()=>openWarga()],['Kewajiban Iuran',()=>edit('obligations')],['Tarif Iuran',()=>edit('tariffs')],['Aturan Tanggal',()=>edit('settings')]];
   if(p==='bank-sampah')return [['Dashboard Admin',()=>window.f4OpenBankAdmin?.('dashboard')],['Pencatatan',()=>window.f4OpenBankAdmin?.('setoran')],['Keuangan',()=>window.f4OpenBankAdmin?.('rekonsiliasi')],['Kegiatan',()=>window.f4OpenBankAdmin?.('kegiatan')],['Data & Anggota',()=>window.f4OpenBankAdmin?.('master')]];
   return [['Project Card',()=>edit('projects')],['Rencana Kegiatan',()=>edit('agenda')],['Dokumentasi',()=>edit('documentation')],['Inventaris',()=>edit('inventory')],['Banner Slider',()=>edit('banners')],['Hasil Rapat',()=>edit('meetings')]];
 }
 function openWarga(){
   page.hidden=true;
   window.openWarga?.();
 }
 async function show(){
   const ticket=++requestId,p=portal(),r=role();
   const titles={portal:'Portal Utama',pembukuan:'Pembukuan', 'bank-sampah':'Bank Sampah'};
   page.hidden=false;
   side.replaceChildren();
   side.append(el('strong',titles[p]+' — '+(r==='superadmin'?'Superadmin':r==='admin'?'Admin':'Anggota'),'f4-work-brand'));
   navItem('Ringkasan',show,true);
   if(r==='superadmin'){
     if(p==='pembukuan'){
       [['Iuran','input'],['Kas','kas'],['Denda','denda'],['Pinjaman','pinjaman'],['Talangan','talangan'],['Riwayat','riwayat'],['Rekap Laporan','laporan'],['Tutup Buku & Arsip','laporan'],['Tarif & Aturan','config']].forEach(([name,tab])=>navItem(name,()=>navigate('pembukuan',tab)));
     }
     if(p==='bank-sampah'){
       [['Ringkasan','dashboard'],['Pencatatan','setoran'],['Keuangan','rekonsiliasi'],['Kegiatan','kegiatan'],['Data & Anggota','master']].forEach(([name,tab])=>navItem(name,()=>window.f4OpenBankAdmin?.(tab)));
     }
     if(p==='portal')navItem('Kelola Portal Utama',()=>navigate('portal'));
     navItem('Data Warga & Rumah',openWarga);
     if(p!=='bank-sampah')navItem('Bank Sampah',()=>navigate('bank-sampah','dashboard'));
   }else if(r==='admin'){
     [['Ringkasan','dashboard'],['Pencatatan','setoran'],['Keuangan','rekonsiliasi'],['Kegiatan','kegiatan'],['Data & Anggota','master']].forEach(([name,tab])=>navItem(name,()=>navigate('bank-sampah',tab)));
   }else if(r==='anggota'){
     navItem('Tabungan Saya',()=>navigate('bank-sampah','pribadi'));
     navItem('Perkembangan',()=>navigate('bank-sampah','progress'));
   }
   if(p==='portal')navItem('Rincian Kas & Cetak',()=>window.f4OpenFinanceReport?.());
   navItem('Pengaturan Profil',profile);
   navItem('Kembali',()=>page.hidden=true);
   heading(titles[p]+' — '+(r==='superadmin'?'Superadmin':r==='admin'?'Admin':'Akun Anggota'),
    'Ringkasan akun · '+$('account-name').textContent);
   const loading=el('p','Mengambil data terbaru…','f4-work-info');area.append(loading);
   try{
     if(r==='superadmin'&&p==='pembukuan'){
       const d=await api('/api/v2/bookkeeping/overview');if(ticket!==requestId)return;
       loading.remove();
       columns([
         card('Pembayaran iuran',money(d.payments?.totalRp),clean(d.payments?.count)+' transaksi'),
         card('Denda tercatat',money(d.fines?.chargedRp),clean(d.fines?.count)+' catatan'),
         card('Kas masuk (debit)',money(d.cash?.debitRp),clean(d.cash?.count)+' baris kas'),
         card('Kas keluar (kredit)',money(d.cash?.creditRp),'Bukan saldo akhir')
       ]);
       info('Data Pembukuan','Ringkasan ini bukan saldo akhir atau persetujuan tutup buku. Menu lengkap Iuran, Kas, Denda, Pinjaman, Talangan, Arsip, dan laporan tetap berada pada halaman Pembukuan asli.');
       actions('Akses pengelolaan',portalTasks());
     }else if(r==='superadmin'&&p==='portal'){
       const [w,portalData,publicData]=await Promise.all([api('/api/v2/admin/residents'),api('/api/v2/public/portal'),api('/api/public/overview')]);if(ticket!==requestId)return;
       loading.remove();
       const houses=new Set((w.rows||[]).map(x=>x.household_id));
       columns([
         card('Rumah terdata',houses.size,'Satu data induk'),
         card('Warga tercatat',(w.rows||[]).filter(x=>x.payer_id).length,'Pembukuan terhubung'),
         card('Agenda portal',(portalData.agenda||[]).length,'Konten tersedia'),
         card('Inventaris portal',(portalData.inventory||[]).length,'Data tersedia')
       ]);
       actions('Kelola konten dan data',[...portalTasks(),['Rincian Kas & Cetak Laporan',()=>window.f4OpenFinanceReport?.()]]);
       info('Sinkronisasi data','Portal Utama, Pembukuan, dan Bank Sampah berbagi ID rumah dan warga. Foto/video dokumentasi tetap menggunakan tautan Google Drive.');
     }else if((r==='superadmin'||r==='admin')&&p==='bank-sampah'){
       const [members,items,dep,sale]=await Promise.all([
         api('/api/v2/admin/bank/members'),api('/api/v2/admin/bank/catalog'),
         api('/api/v2/admin/bank/deposits'),api('/api/v2/admin/bank/sales')]);if(ticket!==requestId)return;
       loading.remove();
       columns([
         card('Anggota aktif',(members.data||[]).filter(x=>x.status==='aktif').length,'Data anggota'),
         card('Jenis barang aktif',(items.data||[]).filter(x=>x.active).length,'Master harga'),
         card('Setoran terkonfirmasi',(dep.data||[]).filter(x=>x.status==='terkonfirmasi').length,'Tidak termasuk data uji'),
         card('Penjualan terkonfirmasi',(sale.data||[]).filter(x=>x.status==='terkonfirmasi').length,'Tidak termasuk draft')
       ]);
       actions('Menu operasional',[['Buka Dashboard Bank Sampah',()=>navigate('bank-sampah')],...(r==='superadmin'?[['Data Warga & Rumah',openWarga]]:[])]);
       info('Status transaksi','Pencatatan dan pengesahan transaksi tetap mengikuti pembatasan keamanan Worker. Ringkasan tidak menghitung transaksi dibatalkan sebagai saldo.');
     }else if((r==='anggota'||r==='admin')&&p==='portal'){
       const [overview,ownPayments,ownSavings]=await Promise.allSettled([
         api('/api/public/overview'),
         r==='anggota'?api('/api/member/payments'):Promise.resolve(null),
         r==='anggota'?api('/api/member/savings'):Promise.resolve(null)
       ]);if(ticket!==requestId)return;
       loading.remove();
       const o=overview.status==='fulfilled'?overview.value:{};
       const pmt=ownPayments.status==='fulfilled'?ownPayments.value:null;
       const sav=ownSavings.status==='fulfilled'?ownSavings.value:null;
       if(r==='anggota'){
         columns([
           card('Pembayaran iuran saya',pmt?money(pmt.totalDiterimaRp):'—','Riwayat pribadi'),
           card('Tabungan terkonfirmasi',sav?money(sav.saldoTersediaRp):'—','Hak tabungan'),
           card('Estimasi menunggu',sav?money(sav.estimasiMenungguRp):'—','Belum disahkan'),
           card('Agenda publik',o.agendaPublik??'—','Portal Utama')
         ]);
         actions('Akses anggota',[['Tabungan & Riwayat',()=>navigate('bank-sampah')],['Pengaturan Profil',profile]]);
         if(!pmt||!sav)info('Data pribadi','Sebagian riwayat belum dapat dibaca. Gunakan menu Tabungan untuk memeriksa perinciannya.');
       }else{
         columns([
           card('Agenda publik',o.agendaPublik??'—','Portal Utama'),
           card('Kas lingkungan','Lihat ringkasan publik','Tanpa rincian transaksi pribadi')
         ]);
         actions('Akses pengelolaan',[['Dashboard Bank Sampah',()=>navigate('bank-sampah')]]);
       }
     }else if(r==='anggota'){
       const [s,pay]=await Promise.allSettled([api('/api/member/savings'),api('/api/member/payments')]);if(ticket!==requestId)return;
       loading.remove();
       const savings=s.status==='fulfilled'?s.value:null, payments=pay.status==='fulfilled'?pay.value:null;
       if(savings||payments){
         columns([
           card('Tabungan terkonfirmasi',money(savings?.saldoTersediaRp),'Hak warga'),
           card('Estimasi menunggu',money(savings?.estimasiMenungguRp),'Belum disahkan'),
           card('Riwayat setoran',savings?.setoran?.length??'—','Hanya data akun sendiri'),
           card('Pembayaran iuran saya',money(payments?.totalDiterimaRp),'Riwayat pribadi')
         ]);
       }
       if(!savings||!payments)info('Pembacaan pribadi', 'Sebagian data belum bisa dibaca: '+[s,pay].filter(x=>x.status==='rejected').map(x=>x.reason.message).join('; '));
       actions('Akses anggota',[['Buka Tabungan & Riwayat',()=>navigate('bank-sampah')],['Pengaturan Profil',profile]]);
     }else{
       loading.textContent='Akun belum terautentikasi. Masuk kembali untuk membuka halaman pribadi.';
     }
   }catch(e){
     if(ticket!==requestId)return;
     loading.textContent='Gagal memuat ringkasan: '+e.message+'. Data tidak diganti contoh.';
     if(r==='superadmin')actions('Menu pengelolaan',portalTasks());
   }
 }
 // Halaman anggota tetap memakai workspace yang ada; seluruh data dari endpoint /api/member.
 // Backwards-compatible route: the original Bank Sampah profile is the only
// account settings UI for members. No parallel "Akun Saya" workspace.
window.f4OpenMemberAccount=()=>document.querySelector('[data-account-action="settings"]')?.click();
 window.openAccountPage=()=>{
 const p=portal(),r=role();
 if(r==='anggota')return window.f4OpenMemberAccount();
 if(r==='superadmin'&&p==='portal')return window.openSuperadminEditor?.('projects');
 if(r==='superadmin'&&p==='pembukuan')return window.openSuperadminEditor?.('obligations');
 if(p==='bank-sampah'&&(r==='superadmin'||r==='admin'))return window.f4OpenBankAdmin?.('dashboard');
 if(p==='bank-sampah'&&r==='anggota')return navigate('bank-sampah','pribadi');
 return show();
};
})();
