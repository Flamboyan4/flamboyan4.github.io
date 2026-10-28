/* Extracted verbatim from inline home script, 20261028-maintenance. Keep classic synchronous loading and global handlers intact. */

    // BERSIHKAN BUNTUT #index.html DAN HASHTAG MODAL DARI SEARCH BAR BROWSER
    if (window.location.hash || window.location.pathname.endsWith('index.html')) {
      history.replaceState(null, document.title, window.location.pathname.replace(/index\.html$/, '') + window.location.search);
    }

    lucide.createIcons();

    window.addEventListener('scroll', function() {
      const btnScroll = document.getElementById('btn-scroll-top');
      if (!btnScroll) return;
      if (window.scrollY > 250) {
        btnScroll.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        btnScroll.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
      } else {
        btnScroll.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        btnScroll.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
      }
    });

    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // SYSTEM CONTROL MODAL & HANDLER TOMBOL BACK HP (HISTORY API)
    let activeModalsStack = [];
    const f4ModalPreviousFocus = new Map();
    const f4ModalTabbables = root => [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el => el.getClientRects().length && getComputedStyle(el).visibility!=='hidden');
    let suppressNextModalPopstate = false; // cegah history.back() menutup modal induk juga

    function openModal(id) {
      const el = document.getElementById(id);
      if (!el) return;

      if (!activeModalsStack.includes(id)) f4ModalPreviousFocus.set(id,document.activeElement);
      el.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      const dialog=el.querySelector('[role="dialog"]')||el.querySelector(':scope > div')||el;
      dialog.setAttribute('role','dialog');
      dialog.setAttribute('aria-modal','true');
      if(!dialog.hasAttribute('aria-label')&&!dialog.hasAttribute('aria-labelledby')) {
        const heading=dialog.querySelector('h1,h2,h3,h4');
        dialog.setAttribute('aria-label',heading?.textContent?.trim()||'Jendela dialog Flamboyan 4');
      }
      if(!dialog.hasAttribute('tabindex'))dialog.setAttribute('tabindex','-1');
      setTimeout(()=>{
        if(el.classList.contains('hidden')||activeModalsStack[activeModalsStack.length-1]!==id)return;
        (f4ModalTabbables(el)[0]||dialog).focus({preventScroll:true});
      },0);

      if (!activeModalsStack.includes(id)) {
        activeModalsStack.push(id);
        history.pushState({ modalId: id }, '', window.location.pathname + window.location.search);
      }

      if (id === 'modal-saran') {
        setTimeout(() => {
          el.classList.remove('opacity-0');
          el.children[0].classList.remove('scale-95');
        }, 10);
      }
    }

    function closeModalDirect(id, isPopState = false) {
      const el = document.getElementById(id);
      if (!el || el.classList.contains('hidden')) return;

      if (id === 'modal-saran') {
        el.classList.add('opacity-0');
        el.children[0].classList.add('scale-95');
        setTimeout(() => {
          el.classList.add('hidden');
          const statusEl = document.getElementById('saran-status');
          if (statusEl) statusEl.classList.add('hidden');
          const formEl = document.getElementById('form-saran');
          if (formEl) formEl.reset();
        }, 300);
      } else {
        el.classList.add('hidden');
      }

      if (id === 'lightbox-modal') {
        const container = document.getElementById('lightbox-media-container');
        if (container) container.innerHTML = '';
        resetLightboxZoom();
      }

      const idx = activeModalsStack.indexOf(id);
      if (idx > -1) {
        activeModalsStack.splice(idx, 1);
      }

      if (!isPopState) {
        // Saat tombol X / backdrop menutup modal, sinkronkan history tanpa
        // memicu popstate untuk menutup modal induk (mis. daftar album).
        suppressNextModalPopstate = true;
        history.back();
      }

      if (activeModalsStack.length === 0) {
        document.body.style.overflow = 'auto';
      }
      const previous=f4ModalPreviousFocus.get(id);
      f4ModalPreviousFocus.delete(id);
      if(previous?.isConnected) setTimeout(()=>previous.focus({preventScroll:true}),0);
    }

    function closeLightboxModal() {
      closeModalDirect('lightbox-modal');
    }

    window.addEventListener('popstate', function (e) {
      if (suppressNextModalPopstate) {
        suppressNextModalPopstate = false;
        return;
      }
      if (activeModalsStack.length > 0) {
        const topModalId = activeModalsStack[activeModalsStack.length - 1];
        closeModalDirect(topModalId, true);
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.keyCode === 123) return false;
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) return false;
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) return false;
      if (e.ctrlKey && e.keyCode === 85) return false;

      if (activeModalsStack.length > 0) {
        const topModalId = activeModalsStack[activeModalsStack.length - 1];
        if(e.key==='Tab'){
          const root=document.getElementById(topModalId);
          const tabbables=root?f4ModalTabbables(root):[];
          if(tabbables.length){
            const first=tabbables[0],last=tabbables[tabbables.length-1];
            if(e.shiftKey && (document.activeElement===first||!root.contains(document.activeElement))){
              e.preventDefault();last.focus();
            }else if(!e.shiftKey && (document.activeElement===last||!root.contains(document.activeElement))){
              e.preventDefault();first.focus();
            }
          }else{e.preventDefault();(root?.querySelector('[role="dialog"]')||root)?.focus();}
          return;
        }

        if (topModalId === 'lightbox-modal') {
          if (e.key === 'ArrowRight') nextLightboxMedia(e);
          else if (e.key === 'ArrowLeft') prevLightboxMedia(e);
          else if (e.key === 'Escape') closeModalDirect('lightbox-modal');
        } else {
          if (e.key === 'Escape') closeModalDirect(topModalId);
        }
        return;
      }

      if (e.key === 'ArrowRight') scrollDokumentasi(1);
      else if (e.key === 'ArrowLeft') scrollDokumentasi(-1);
    });

    function disableInspect(e) {
      if (e.keyCode === 123) return false;
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) return false;
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) return false;
      if (e.ctrlKey && e.keyCode === 85) return false;
    }

    function salinNorekEx(norek, btnId, textId) {
      navigator.clipboard.writeText(norek).then(() => {
        const textSpan = document.getElementById(textId);
        const btn = document.getElementById(btnId);
        
        textSpan.innerText = "Tersalin!";
        btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
        btn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
        
        setTimeout(() => {
          textSpan.innerText = "Salin Norek";
          btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
          btn.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
        }, 2000);
      }).catch(err => {
        alert("Gagal menyalin nomor rekening.");
      });
    }

    // LIST LINK CSV TERPUSAT
    // Keuangan publik menggunakan Cloudflare D1, bukan endpoint Apps Script lama.
    // Keuangan laman utama sekarang langsung membaca Buku Kas dari backend Pembukuan.
    // CSV_KEUANGAN_URL lama tidak dipakai lagi.
    const CSV_DOKUMENTASI_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=0&single=true&output=csv';
    // Isi URL CSV sheet inventaris warga di sini jika sheet sudah tersedia.
    const CSV_INVENTARIS_WARGA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=492423764&single=true&output=csv';
    const CSV_ARISAN_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=53284271&single=true&output=csv';
    const CSV_RENCANA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=781301604&single=true&output=csv';
    const CSV_JERSEY_BAPAK_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=878370178&single=true&output=csv';
    const CSV_JERSEY_IBU_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=1755921986&single=true&output=csv';

    const FOLDER_JERSEY_URL = 'https://drive.google.com/drive/folders/1_VH_MHlOhA_tSXPsw1ztJEf3fVydU7gE';
    const FOLDER_GAPURA_URL = 'https://drive.google.com/drive/folders/1Zs2RlbHTvNc9RDhbc1TlgcptXeNhnrQ5';
    const FOLDER_API_URL = 'https://script.google.com/macros/s/AKfycbyes6A9_9EQ8vIYtf75cGgC9sKAZBvMewxEhYRSThjMAlBYqnkmKpa3yoPOtN0FEG92Zg/exec';

    // INISIALISASI FIREBASE REALTIME DATABASE UNTUK CHAT
    const firebaseConfig = {
      apiKey: "AIzaSyAZ8gg6e0oTJ7xGoFudQxyCdzObRipWk_4",
      authDomain: "flamboyan4-chat.firebaseapp.com",
      databaseURL: "https://flamboyan4-chat-default-rtdb.firebaseio.com",
      projectId: "flamboyan4-chat",
      storageBucket: "flamboyan4-chat.firebasestorage.app",
      messagingSenderId: "28700002867",
      appId: "1:28700002867:web:047bb6930d4436ed837146",
      measurementId: "G-DB8E547HKY"
    };

    if (window.firebase?.database && !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const dbRef = window.firebase?.database ? firebase.database().ref('komentar_warga') : null;

    // Kotak Saran tetap menggunakan Cloudflare D1. Obrolan Warga tetap Firebase.

    const TARGET_DANA_GAPURA = 6500000;
    const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='100%25' height='100%25' fill='%231e1b4b'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%23818cf8' text-anchor='middle' dy='.3em'%3EDokumentasi Kegiatan Warga%3C/text%3E%3C/svg%3E";

    let currentMediaList = [];
    let globalDokumentasiPreview = [];
    let dokumentasiPreviewIndex = 0;
    let dokumentasiPreviewTimer = null;
    let currentPhotoIndex = 0;
    let currentPhotoCaption = '';
    let globalKeuanganData = [];
    let globalArisanData = [];
    
    let globalJerseyBapakData = [];
    let globalJerseyIbuData = [];
    let currentJerseyTab = 'bapak';

    let globalRencanaData = [];
    let currentArisanIdxGlobal = -1;
    let nextArisanIdxGlobal = -1;
    let arisanLastMonthKey = '';
    const folderCache = {};

    let monthlyKeuanganList = []; 
    let currentPemasukanMonthIndex = 0;
    let currentPengeluaranMonthIndex = 0;

    let calendarDate = new Date();

    function formatRupiah(angka) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    }

    function extractFolderId(url) {
      if (!url) return null;
      let cleanUrl = url.toString().replace(/[\[\]'"]/g, '').trim();
      cleanUrl = cleanUrl.split('?')[0];
      const match = cleanUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    function extractDriveFileId(url) {
      if (!url) return null;
      let cleanUrl = url.toString().replace(/[\[\]'"]/g, '').trim();
      const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    function fixDriveUrl(url) {
      if (!url) return PLACEHOLDER_IMG;
      let cleanUrl = url.toString().replace(/[\[\]'"]/g, '').trim();
      cleanUrl = cleanUrl.replace(/^httphttps:/i, 'https:').replace(/^http:/i, 'https:');
      
      const fileId = extractDriveFileId(cleanUrl);
      if (fileId) {
        return 'https://lh3.googleusercontent.com/d/' + fileId;
      }
      return cleanUrl;
    }

    // Riwayat komentar berasal dari D1; Firebase tidak lagi menjadi sumber aktif.
    let globalKomentarList = [];
    const F4_FEEDBACK_API='https://api.flamboyan4.web.id/api/v2/public/portal';
    function insertEmoticon(emot) {
      const txt=document.getElementById('komentar-pesan');
      if(!txt)return;
      txt.value+=emot;txt.focus();
    }
    function renderKomentarWarga(){
      const container=document.getElementById('container-komentar-list');
      const badge=document.getElementById('total-komentar-badge');
      if(!container)return;
      if(badge)badge.textContent=globalKomentarList.length+' Pesan';
      container.replaceChildren();
      if(!globalKomentarList.length){
        const p=document.createElement('p');
        p.className='text-slate-400 text-xs italic text-center py-8';
        p.textContent='Belum ada pesan. Ayo menyapa!';
        container.append(p);return;
      }
      for(const item of globalKomentarList){
        const card=document.createElement('div');card.className='bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-start justify-between gap-2 hover:bg-slate-100/50 transition';
        const body=document.createElement('div');body.className='space-y-1 w-full';
        const head=document.createElement('div');head.className='flex items-center justify-between';
        const name=document.createElement('span');name.className='font-bold text-xs md:text-sm text-indigo-950';name.textContent=item.nama||'Warga';
        const time=document.createElement('span');time.className='text-[10px] text-slate-400 font-mono';time.textContent=item.waktu||'';
        const text=document.createElement('p');text.className='text-xs md:text-sm text-slate-700 leading-relaxed break-words whitespace-pre-line';text.textContent=item.pesan||'';
        head.append(name,time);body.append(head,text);card.append(body);container.append(card);
      }
    }
    function listenKomentarFirebase(){
      const container=document.getElementById('container-komentar-list');
      if(!dbRef){
        if(container)container.textContent='Firebase tidak termuat. Periksa koneksi jaringan.';
        return;
      }
      if(container)container.textContent='Menghubungkan riwayat Firebase…';
      dbRef.limitToLast(50).on('value',snapshot=>{
        const raw=snapshot.val()||{};
        globalKomentarList=Object.keys(raw).map(key=>({id:key,...raw[key]}))
          .sort((a,b)=>(Number(b.timestamp)||0)-(Number(a.timestamp)||0));
        renderKomentarWarga();
      },error=>{
        console.error('Gagal membaca riwayat Firebase:',error);
        if(container)container.textContent='Riwayat Firebase tidak dapat dibaca: '+(error?.message||'Periksa izin baca Firebase dan jaringan');
      });
    }
    let f4LastChatAt=0;
    async function tambahKomentarWarga(e){
      e.preventDefault();
      const nama=document.getElementById('komentar-nama')?.value.trim()||'';
      const pesan=document.getElementById('komentar-pesan')?.value.trim()||'';
      const btn=document.getElementById('btn-submit-chat');
      if(!nama||!pesan)return;
      if(nama.length<2||nama.length>60||pesan.length<2||pesan.length>1000){
        alert('Nama maksimal 60 karakter, pesan maksimal 1000 karakter.');
        return;
      }
      if(Date.now()-f4LastChatAt<30000){
        alert('Mohon beri jeda 30 detik sebelum mengirim komentar berikutnya.');
        return;
      }
      if(!dbRef){alert('Firebase belum tersambung. Periksa jaringan, kemudian coba lagi.');return}
      const oldHtml=btn?.innerHTML;
      if(btn){btn.disabled=true;btn.textContent='Mengirim…'}
      try{
        const now=new Date();
        const waktu=now.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})
          +', '+now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
        await dbRef.push({nama,pesan,waktu,timestamp:firebase.database.ServerValue.TIMESTAMP});
        f4LastChatAt=Date.now();
        document.getElementById('komentar-pesan').value='';
        // Realtime listener updates the visible chat; no D1 write or page reset.
      }catch(error){alert('Gagal mengirim pesan ke Firebase: '+error.message)}
      finally{
        if(btn){btn.disabled=false;btn.innerHTML=oldHtml;window.lucide?.createIcons?.()}
      }
    }
let currentKeuanganFilterType = 'all'; // 'all', 'pemasukan', 'pengeluaran'

    function f4CanReadKas(){return document.body.dataset.previewRole && document.body.dataset.previewRole!=='public'}
    function openModalKeuangan() {
      if (!f4CanReadKas()) return;
      currentKeuanganFilterType = 'all';
      document.getElementById('modal-keuangan-title').innerText = 'Arsip Seluruh Transaksi Kas';
      document.getElementById('search-keuangan').placeholder = 'Cari transaksi...';
      document.getElementById('search-keuangan').value = '';
      filterKeuanganModal();
      openModal('modal-keuangan');
    }

    function openModalKeuanganFiltered(filterType) {
      if (!f4CanReadKas()) return;
      currentKeuanganFilterType = filterType;
      
      let targetMonthObj = null;
      if (filterType === 'pemasukan' && monthlyKeuanganList.length > 0) {
        targetMonthObj = monthlyKeuanganList[currentPemasukanMonthIndex];
      } else if (filterType === 'pengeluaran' && monthlyKeuanganList.length > 0) {
        targetMonthObj = monthlyKeuanganList[currentPengeluaranMonthIndex];
      }

      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      
      if (targetMonthObj) {
        const titleText = filterType === 'pemasukan' ? 'Rincian Pemasukan' : 'Rincian Pengeluaran';
        const monthLabel = `${monthNames[targetMonthObj.month]} ${targetMonthObj.year}`;
        document.getElementById('modal-keuangan-title').innerText = `${titleText} (${monthLabel})`;
        document.getElementById('search-keuangan').placeholder = `Cari transaksi ${filterType} ${monthLabel}...`;
      } else {
        document.getElementById('modal-keuangan-title').innerText = 'Arsip Seluruh Transaksi Kas';
        document.getElementById('search-keuangan').placeholder = 'Cari transaksi...';
      }

      document.getElementById('search-keuangan').value = '';
      filterKeuanganModal();
      openModal('modal-keuangan');
    }

    function openModalArisan(which = 'current') {
      refreshArisanCards();
      document.getElementById('search-arisan').value = '';
      filterArisanModal();
      openModal('modal-arisan');
      // After modal layout, show the selected month in the scrollable schedule.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const index = which === 'next' ? nextArisanIdxGlobal : currentArisanIdxGlobal;
        const table = document.getElementById('tabel-arisan-all');
        const row = index >= 0 ? table?.rows[index] : null;
        if (!row) return;
        row.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});
        row.setAttribute('tabindex','-1');
        row.focus({preventScroll:true});
      }));
    }
    
    function openModalJersey() {
      document.getElementById('search-jersey').value = '';
      switchJerseyTab('bapak');
      openModal('modal-jersey'); 
    }

    function openModalDokumentasi() {
  // Gallery preview in the landing page is only a shortcut to the complete
  // Dokumentasi page; don't show a second album popup.
  if(window.parent!==window)window.parent.postMessage({type:'f4:navigate',target:'dokumentasi'},location.origin);
  else window.location.href='/dokumentasi/';
}
    function openModalSaran() { openModal('modal-saran'); }

   function openModalEventDetail(dateStr, eventItems, dateIso) {
  document.getElementById('modal-event-date').innerText = `Kegiatan: ${dateStr}`;
  
  // Gunakan Query Parameter ?event= agar aman dibuka dari WhatsApp/Browser
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = dateIso ? `${baseUrl}?event=${dateIso}` : baseUrl;

  let html = `
    <div class="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
      <span class="text-[11px] text-slate-500">Bagikan agenda:</span>
      <button onclick="salinLinkAgenda('${shareUrl}')" id="btn-copy-agenda" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1.5 shadow-sm active:scale-95">
        <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
        <span id="text-copy-agenda">Salin Link Agenda</span>
      </button>
    </div>
  `;

  eventItems.forEach(item => {
    const isGorol = item.isGorol;
    const isArisan = item.isArisan;
    
    let badgeBg = 'bg-indigo-50 text-indigo-900 border-indigo-100';
    let typeLabel = '📌 KEGIATAN WARGA';

    if (isGorol) {
      badgeBg = 'bg-amber-100 text-amber-900 border-amber-200';
      typeLabel = '🧹 GOROL / KERJA BAKTI';
    } else if (isArisan) {
      badgeBg = 'bg-indigo-100 text-indigo-900 border-indigo-200';
      typeLabel = '🏠 ARISAN WARGA';
    }
    
    html += `
      <div class="p-3 rounded-xl border ${badgeBg} space-y-1 mb-2">
        <span class="font-extrabold text-[10px] uppercase tracking-wider block">${typeLabel}</span>
        <h5 class="font-bold text-sm text-slate-800">${item.judul}</h5>
        <p class="text-slate-600 text-xs">${item.deskripsi || 'Tidak ada catatan tambahan.'}</p>
        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 mt-1">${item.status}</span>
      </div>
    `;
  });

  document.getElementById('modal-event-body').innerHTML = html;
  openModal('modal-event-detail');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function salinLinkAgenda(url) {
  navigator.clipboard.writeText(url).then(() => {
    const txt = document.getElementById('text-copy-agenda');
    if (txt) {
      txt.innerText = 'Link Tersalin!';
      setTimeout(() => { txt.innerText = 'Salin Link Agenda'; }, 2000);
    }
  }).catch(() => {
    alert("Link agenda: " + url);
  });
}

    async function fetchFolderFiles(folderId) {
      if (!FOLDER_API_URL || !FOLDER_API_URL.startsWith('http')) return [];
      if (folderCache[folderId]) return folderCache[folderId];
      
      try {
        const response = await fetch(`${FOLDER_API_URL}?folderId=${folderId}`);
        const data = await response.json();
        let rawItems = [];
        
        if (data && data.files && Array.isArray(data.files) && data.files.length > 0) {
          rawItems = data.files;
        } else if (data && data.images && Array.isArray(data.images) && data.images.length > 0) {
          rawItems = data.images;
        } else if (Array.isArray(data) && data.length > 0) {
          rawItems = data;
        }

        let items = rawItems.map((f, i) => {
          if (typeof f === 'string' || typeof f === 'number') {
            const strVal = String(f);
            return { type: 'image', url: fixDriveUrl(strVal), rawUrl: strVal, name: strVal };
          }
          const rawUrl = f.url || f.link || f.src || f.downloadUrl || '';
          const nameVal = f.name !== undefined && f.name !== null ? String(f.name) : (f.title !== undefined && f.title !== null ? String(f.title) : String(i + 1));
          
          const isVid = f.type === 'video' || (f.mimeType && f.mimeType.includes('video')) || /\.(mp4|mkv|mov|webm|avi)$/i.test(nameVal);
          
          return {
            type: isVid ? 'video' : 'image',
            url: isVid ? rawUrl : fixDriveUrl(rawUrl),
            rawUrl: rawUrl,
            name: nameVal
          };
        }).filter(item => item.url && item.url !== '' && item.url !== PLACEHOLDER_IMG);

        if (items.length > 0) {
          items.sort((a, b) => {
            const nameA = String(a.name || '');
            const nameB = String(b.name || '');
            return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
          });
          
          folderCache[folderId] = items;
          return items;
        }
      } catch (e) {
        console.error("Gagal membaca folder:", e);
      }
      return [];
    }

    async function openGalleryGridModal(rawString, title) {
      document.getElementById('gallery-grid-title').innerText = title || "Galeri Album";
      document.getElementById('gallery-grid-container').innerHTML = '<p class="text-slate-400 text-xs col-span-full text-center py-8">Memuat album...</p>';
      
      openModal('modal-gallery-grid');

      const folderId = extractFolderId(rawString);
      let mediaItems = [];

      if (folderId && FOLDER_API_URL.startsWith('http')) {
        mediaItems = await fetchFolderFiles(folderId);
      } else {
        const rawUrls = rawString.split(',');
        mediaItems = rawUrls.map(u => {
          const isVid = /\.(mp4|mkv|mov|webm|avi)$/i.test(u);
          return {
            type: isVid ? 'video' : 'image',
            url: isVid ? u : fixDriveUrl(u),
            rawUrl: u
          };
        }).filter(u => u.url && u.url !== '');
      }

      if (!mediaItems || mediaItems.length === 0) mediaItems = [{ type: 'image', url: PLACEHOLDER_IMG }];
      currentMediaList = mediaItems;
      currentPhotoCaption = title;

      let gridHTML = '';
      mediaItems.forEach((item, index) => {
        if (item.type === 'video') {
          gridHTML += `
            <div class="h-40 md:h-48 relative group cursor-pointer bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 flex items-center justify-center" onclick="openLightboxFromIndex(${index})">
              <div class="p-3 bg-red-600/90 text-white rounded-full shadow-lg group-hover:scale-110 transition duration-300 z-10">
                <i data-lucide="play" class="w-6 h-6 fill-current"></i>
              </div>
              <span class="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase z-10">Video</span>
            </div>
          `;
        } else {
          gridHTML += `
            <div class="h-40 md:h-48 relative group cursor-pointer bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200" onclick="openLightboxFromIndex(${index})">
              <img src="${item.url}" alt="Foto ${index+1}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                <i data-lucide="maximize-2" class="w-5 h-5"></i>
              </div>
            </div>
          `;
        }
      });

      document.getElementById('gallery-grid-subtitle').innerText = `${mediaItems.length} File media ditemukan - Klik untuk membuka/memutar`;
      document.getElementById('gallery-grid-container').innerHTML = gridHTML;
      lucide.createIcons();
    }

    function openLightboxFromIndex(index) {
      currentPhotoIndex = index;
      openModal('lightbox-modal');
      updateLightboxView();
    }

    function nextLightboxMedia(event) {
        if(event) event.stopPropagation();
        if (currentMediaList.length <= 1) return;
        currentPhotoIndex = (currentPhotoIndex + 1) % currentMediaList.length;
        updateLightboxView();
    }

    function prevLightboxMedia(event) {
        if(event) event.stopPropagation();
        if (currentMediaList.length <= 1) return;
        currentPhotoIndex = (currentPhotoIndex - 1 + currentMediaList.length) % currentMediaList.length;
        updateLightboxView();
    }

    let zoomScale = 1;
    let translateX = 0;
    let translateY = 0;
    let startDist = 0;
    let startScale = 1;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastTapTime = 0;

    let lightboxTouchStartX = 0;
    let lightboxTouchStartY = 0;
    let lightboxTouchEndX = 0;
    let lightboxTouchEndY = 0;

    function initLightboxSwipe() {
      const modal = document.getElementById('lightbox-modal');
      if (!modal) return;

      modal.addEventListener('touchstart', function(e) {
        lightboxTouchStartX = e.changedTouches[0].screenX;
        lightboxTouchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      modal.addEventListener('touchend', function(e) {
        lightboxTouchEndX = e.changedTouches[0].screenX;
        lightboxTouchEndY = e.changedTouches[0].screenY;
        handleLightboxSwipe();
      }, { passive: true });
    }

    function handleLightboxSwipe() {
      if (zoomScale > 1.05) return;
      const diffX = lightboxTouchEndX - lightboxTouchStartX;
      const diffY = lightboxTouchEndY - lightboxTouchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX < 0) {
          nextLightboxMedia();
        } else {
          prevLightboxMedia();
        }
      }
    }

    function applyTransform(img) {
      if (!img) return;
      img.style.transform = `translate3d(${translateX}px, ${translateY}px, 0px) scale(${zoomScale})`;
      const resetBtn = document.getElementById('btn-reset-zoom');
      if (resetBtn) {
        if (zoomScale > 1.05) resetBtn.classList.remove('hidden');
        else resetBtn.classList.add('hidden');
      }
    }

    function resetLightboxZoom(event) {
      if (event) event.stopPropagation();
      zoomScale = 1;
      translateX = 0;
      translateY = 0;
      const img = document.getElementById('lightbox-active-img');
      if (img) {
        img.style.transition = 'transform 0.2s ease-out';
        applyTransform(img);
        setTimeout(() => { img.style.transition = 'none'; }, 200);
      }
    }

    function initImageZoomEvents(img) {
      zoomScale = 1;
      translateX = 0;
      translateY = 0;
      applyTransform(img);

      img.parentElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.3 : 0.3;
        zoomScale = Math.min(Math.max(zoomScale + delta, 1), 5);
        if (zoomScale === 1) { translateX = 0; translateY = 0; }
        img.style.cursor = zoomScale > 1 ? 'grab' : 'default';
        applyTransform(img);
      }, { passive: false });

      img.addEventListener('mousedown', (e) => {
        if (zoomScale > 1) {
          e.preventDefault();
          isDragging = true;
          startX = e.clientX - translateX;
          startY = e.clientY - translateY;
          img.style.cursor = 'grabbing';
        }
      });

      const handleGlobalMouseMove = (e) => {
        if (isDragging && zoomScale > 1) {
          e.preventDefault();
          translateX = e.clientX - startX;
          translateY = e.clientY - startY;
          requestAnimationFrame(() => applyTransform(img));
        }
      };

      const handleGlobalMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          if (img) img.style.cursor = zoomScale > 1 ? 'grab' : 'default';
        }
      };

      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      img.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          startDist = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          );
          startScale = zoomScale;
        } else if (e.touches.length === 1) {
          isDragging = true;
          startX = e.touches[0].pageX - translateX;
          startY = e.touches[0].pageY - translateY;

          const currentTime = new Date().getTime();
          const tapLength = currentTime - lastTapTime;
          if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            if (zoomScale > 1) {
              resetLightboxZoom();
            } else {
              zoomScale = 2.5;
              translateX = 0;
              translateY = 0;
              img.style.transition = 'transform 0.2s ease-out';
              applyTransform(img);
              setTimeout(() => { img.style.transition = 'none'; }, 200);
            }
          }
          lastTapTime = currentTime;
        }
      }, { passive: false });

      img.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const currentDist = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          );
          zoomScale = Math.min(Math.max(startScale * (currentDist / startDist), 1), 5);
          if (zoomScale === 1) { translateX = 0; translateY = 0; }
          applyTransform(img);
        } else if (e.touches.length === 1 && isDragging && zoomScale > 1) {
          e.preventDefault();
          translateX = e.touches[0].pageX - startX;
          translateY = e.touches[0].pageY - startY;
          requestAnimationFrame(() => applyTransform(img));
        }
      }, { passive: false });

      img.addEventListener('touchend', () => { isDragging = false; });
    }

    function updateLightboxView() {
      const item = currentMediaList[currentPhotoIndex];
      const container = document.getElementById('lightbox-media-container');

      const resetBtn = document.getElementById('btn-reset-zoom');
      if (resetBtn) resetBtn.classList.add('hidden');

      if (item.type === 'video') {
        const fileId = extractDriveFileId(item.rawUrl || item.url);
        const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : item.url;
        const viewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/view` : (item.rawUrl || item.url);

        container.innerHTML = `
          <div class="relative w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto rounded-xl overflow-hidden bg-black shadow-2xl flex flex-col items-center justify-center" style="max-height:calc(100dvh - 8.5rem);" onclick="event.stopPropagation()">
            <div class="w-full relative bg-black flex items-center justify-center" style="height:min(62dvh, calc(100dvh - 12rem)); min-height:280px;">
              <iframe src="${embedUrl}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen class="absolute inset-0 w-full h-full border-0 block"></iframe>
            </div>
            <div class="p-2.5 w-full bg-slate-900 border-t border-slate-800 flex items-center justify-between px-3 sm:px-4 shrink-0">
                <span class="text-[10px] text-slate-400">Video bermasalah?</span>
                <a href="${viewUrl}" target="_blank" class="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow flex items-center space-x-1 transition active:scale-95">
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                    <span>Buka Video di Tab Baru</span>
                </a>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <img id="lightbox-active-img" src="${item.url}" alt="Foto Full" class="max-w-full max-h-[75vh] rounded-lg shadow-2xl object-contain select-none transition-transform duration-75" onclick="event.stopPropagation()">
        `;
        const img = document.getElementById('lightbox-active-img');
        if (img) initImageZoomEvents(img);
      }

      document.getElementById('lightbox-caption').innerText = currentPhotoCaption;

      const counter = document.getElementById('lightbox-counter');
      const btnPrev = document.getElementById('lightbox-prev');
      const btnNext = document.getElementById('lightbox-next');

      if (currentMediaList.length > 1) {
        counter.classList.remove('hidden');
        counter.innerText = `Media ${currentPhotoIndex + 1} dari ${currentMediaList.length}`;
        btnPrev.classList.remove('hidden');
        btnNext.classList.remove('hidden');
      } else {
        counter.classList.add('hidden');
        btnPrev.classList.add('hidden');
        btnNext.classList.add('hidden');
      }
      lucide.createIcons();
    }

    function initCardGesturesAndKeyboard() {
      setupCardInteractions('card-pemasukan', changeMonthPemasukan);
      setupCardInteractions('card-pengeluaran', changeMonthPengeluaran);
    }

    function setupCardInteractions(cardId, changeMonthFn) {
      const card = document.getElementById(cardId);
      if (!card) return;

      let touchStartX = 0;
      let touchStartY = 0;
      let touchEndX = 0;
      let touchEndY = 0;

      card.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      card.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
          if (diffX < 0) {
            changeMonthFn(1);
          } else {
            changeMonthFn(-1);
          }
        }
      }, { passive: true });

      let isHovered = false;
      card.addEventListener('mouseenter', () => { isHovered = true; });
      card.addEventListener('mouseleave', () => { isHovered = false; });

      document.addEventListener('keydown', function(e) {
        if (activeModalsStack.length > 0) return;
        if (isHovered || document.activeElement === card) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            changeMonthFn(-1);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            changeMonthFn(1);
          }
        }
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      initLightboxSwipe();
      initCardGesturesAndKeyboard();
      listenKomentarFirebase();
    });

    function scrollProjek(direction) {
      const slider = document.getElementById('slider-projek');
      if (!slider) return;
      const cardWidth = slider.querySelector('div')?.offsetWidth || 320;
      slider.scrollBy({ left: direction * (cardWidth + 16), behavior: 'smooth' });
    }

    const formSaran=document.getElementById('form-saran');
    let f4LastSuggestionAt=0;
    formSaran.addEventListener('submit',async function(event){
      event.preventDefault();
      if(formSaran.elements.website?.value)return;
      if(Date.now()-f4LastSuggestionAt<60000){
        alert('Saran baru dapat dikirim lagi setelah satu menit.');
        return;
      }
      const button=formSaran.querySelector('button[type="submit"]');
      if(button)button.disabled=true;
      try{
        const pesan=String(new FormData(formSaran).get('pesan')||'').trim();
        if(pesan.length<5||pesan.length>2000)throw Error('Saran harus berisi 5–2000 karakter.');
        const response=await fetch(F4_FEEDBACK_API+'/suggestions',{method:'POST',
          headers:{'Content-Type':'application/json'},body:JSON.stringify({pesan})});
        const result=await response.json();
        if(!response.ok||result.ok===false)throw Error(result.error||'HTTP '+response.status);
        f4LastSuggestionAt=Date.now();
        document.getElementById('saran-status').classList.remove('hidden');
        formSaran.reset();
        setTimeout(()=>closeModalDirect('modal-saran'),2500);
      }catch(error){alert('Saran belum berhasil disimpan: '+error.message)}
      finally{if(button)button.disabled=false}
    });

    function formatTanggalKeuanganDisplay(value) {
      const raw = String(value || '').trim();
      if (!raw) return '-';
      // Backend dapat mengirim tanggal sebagai "dd/mm/yyyy HH:mm:ss".
      // Web utama hanya menampilkan tanggal karena jam tidak pernah diinput warga.
      const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (m) return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${m[3]}`;
      const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (iso) return `${iso[3].padStart(2,'0')}/${iso[2].padStart(2,'0')}/${iso[1]}`;
      // Fallback aman: buang bagian jam bila ada.
      return raw.replace(/\s+\d{1,2}:\d{2}(?::\d{2})?.*$/, '');
    }

    function renderTableRow(row) {
      const keys = Object.keys(row);
      const tanggal = formatTanggalKeuanganDisplay(row[keys[0]]);
      const keterangan = row[keys[1]] || '-';
      const kategori = (row[keys[2]] || '').trim();
      const rawJumlah = row[keys[3]];

      if (!rawJumlah) return '';

      let cleanedJumlah = rawJumlah.toString().replace(/\./g, '').replace(/,/g, '');
      const jumlah = parseFloat(cleanedJumlah.replace(/[^0-9-]/g, '')) || 0;

      let badgeKategori = '';
      let textJumlah = '';

      if (kategori.toLowerCase() === 'pemasukan') {
        badgeKategori = `<span class="px-2.5 py-1 text-sm bg-emerald-100 text-emerald-800 rounded">Pemasukan</span>`;
        textJumlah = `<span class="text-emerald-600 font-semibold">+ ${formatRupiah(jumlah)}</span>`;
      } else {
        badgeKategori = `<span class="px-2.5 py-1 text-sm bg-rose-100 text-rose-800 rounded">Pengeluaran</span>`;
        textJumlah = `<span class="text-rose-600 font-semibold">- ${formatRupiah(jumlah)}</span>`;
      }

      return `
        <tr>
          <td class="px-3 py-2 text-slate-600 whitespace-nowrap">${escapeJerseyText(tanggal)}</td>
          <td class="px-3 py-2 font-medium break-words text-slate-800">${escapeJerseyText(keterangan)}</td>
          <td class="px-3 py-2">${badgeKategori}</td>
          <td class="px-3 py-2 text-right whitespace-nowrap">${textJumlah}</td>
        </tr>
      `;
    }

    function renderArisanRow(row, isCurrent = false, isNext = false) {
      const keys = Object.keys(row);
      const bulan = row[keys[0]] || '-';
      const namaBlok = row[keys[1]] || '-';
      const statusRaw = (row[keys[2]] || '').toString().trim();

      let statusBadge = `<span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Belum</span>`;
      if (statusRaw.toLowerCase().includes('sudah') || statusRaw.toLowerCase().includes('selesai') || statusRaw.toLowerCase().includes('lunas')) {
        statusBadge = `<span class="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-semibold rounded">✓ Sudah</span>`;
      }

      let rowBg = '';
      let badgeTag = '';

      if (isCurrent) {
        rowBg = 'bg-indigo-50/90 font-bold border-l-4 border-indigo-600';
        badgeTag = `<span class="ml-2 px-2 py-0.5 text-[10px] bg-indigo-600 text-white font-extrabold rounded-md uppercase tracking-wider inline-block">🏠 Bulan Ini</span>`;
      } else if (isNext) {
        rowBg = 'bg-amber-50/70 border-l-4 border-amber-500';
        badgeTag = `<span class="ml-2 px-2 py-0.5 text-[10px] bg-amber-500 text-white font-extrabold rounded-md uppercase tracking-wider inline-block">📅 Bulan Depan</span>`;
      }

      return `
        <tr class="${rowBg} hover:bg-slate-100/60 transition">
          <td class="p-3 text-slate-700 whitespace-nowrap font-medium">
            <span>${bulan}</span>
            ${badgeTag}
          </td>
          <td class="p-3 font-semibold text-slate-800 break-words">${namaBlok}</td>
          <td class="p-3 text-center whitespace-nowrap">${statusBadge}</td>
        </tr>
      `;
    }

    function filterArisanModal() {
      const keyword = document.getElementById('search-arisan').value.toLowerCase();
      let html = '';
      globalArisanData.forEach((row, idx) => {
        const text = Object.values(row).join(' ').toLowerCase();
        if (text.includes(keyword)) {
          const isCurrent = (idx === currentArisanIdxGlobal);
          const isNext = (idx === nextArisanIdxGlobal);
          html += renderArisanRow(row, isCurrent, isNext);
        }
      });
      document.getElementById('tabel-arisan-all').innerHTML = html || '<tr><td colspan="3" class="p-4 text-center text-slate-400">Jadwal tidak ditemukan</td></tr>';
    }

    function filterKeuanganModal() {
      const keyword = document.getElementById('search-keuangan').value.toLowerCase();
      
      let targetMonthObj = null;
      if (currentKeuanganFilterType === 'pemasukan' && monthlyKeuanganList.length > 0) {
        targetMonthObj = monthlyKeuanganList[currentPemasukanMonthIndex];
      } else if (currentKeuanganFilterType === 'pengeluaran' && monthlyKeuanganList.length > 0) {
        targetMonthObj = monthlyKeuanganList[currentPengeluaranMonthIndex];
      }

      let html = '';
      let filteredCount = 0;

      globalKeuanganData.forEach(row => {
        const keys = Object.keys(row);
        if (keys.length < 4) return;

        const tglStr = row[keys[0]];
        const kategori = (row[keys[2]] || '').trim().toLowerCase();
        const textFull = Object.values(row).join(' ').toLowerCase();

        // 1. Filter Jenis Transaksi (Pemasukan / Pengeluaran)
        if (currentKeuanganFilterType !== 'all' && kategori !== currentKeuanganFilterType) {
          return;
        }

        // 2. Filter Sesuai Bulan Aktif Card
        if (targetMonthObj) {
          const parsed = parseRowDate(tglStr);
          if (!parsed || parsed.month !== targetMonthObj.month || parsed.year !== targetMonthObj.year) {
            return;
          }
        }

        // 3. Filter Kata Kunci Pencarian
        if (keyword && !textFull.includes(keyword)) {
          return;
        }

        html += renderTableRow(row);
        filteredCount++;
      });

      document.getElementById('tabel-transaksi-all').innerHTML = html || `<tr><td colspan="4" class="p-6 text-center text-slate-400 text-xs">Belum ada transaksi untuk periode ini.</td></tr>`;
    }

    function parseRowDate(dateStr) {
      if (!dateStr) return null;
      let cleanStr = dateStr.toString().trim().toLowerCase();
      
      const monthMap = {
        'jan': 0, 'januari': 0, 'january': 0,
        'feb': 1, 'februari': 1, 'february': 1,
        'mar': 2, 'maret': 2, 'march': 2,
        'apr': 3, 'april': 3,
        'mei': 4, 'may': 4,
        'jun': 5, 'juni': 5, 'june': 5,
        'jul': 6, 'juli': 6, 'july': 6,
        'agu': 7, 'agustus': 7, 'aug': 7, 'august': 7,
        'sep': 8, 'september': 8,
        'okt': 9, 'oktober': 9, 'oct': 9, 'october': 9,
        'nov': 10, 'november': 10,
        'des': 11, 'desember': 11, 'dec': 11, 'december': 11
      };

      const parts = cleanStr.split(/[\s\-\/\.]+/);
      if (parts.length >= 3) {
        let day, month, year;

        if (parts[0].length === 4) {
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          day = parseInt(parts[2]);
        } else {
          day = parseInt(parts[0]);
          if (isNaN(parts[1])) {
            month = monthMap[parts[1]] !== undefined ? monthMap[parts[1]] : -1;
          } else {
            month = parseInt(parts[1]) - 1;
          }
          year = parseInt(parts[2]);
          if (year < 100) year += 2000;
        }

        if (month >= 0 && month <= 11 && year > 2000) {
          return { day, month, year };
        }
      }
      return null;
    }

    let currentSaldoMonthIndex = 0;

    function updateSaldoCardView() {
      if (monthlyKeuanganList.length === 0) return;
      const m = monthlyKeuanganList[currentSaldoMonthIndex];
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const saldoBulan = (m.pemasukan || 0) - (m.pengeluaran || 0);
      const label = document.getElementById('label-saldo-bulan');
      const value = document.getElementById('saldo-bulan');
      if (label) label.innerText = `Saldo ${monthNames[m.month]} ${m.year}`;
      if (value) {
        value.innerText = formatRupiah(saldoBulan);
        value.classList.toggle('text-rose-300', saldoBulan < 0);
        value.classList.toggle('text-white', saldoBulan >= 0);
      }
    }

    function changeMonthSaldo(direction) {
      if (monthlyKeuanganList.length === 0) return;
      currentSaldoMonthIndex += direction;
      if (currentSaldoMonthIndex < 0) currentSaldoMonthIndex = 0;
      if (currentSaldoMonthIndex >= monthlyKeuanganList.length) currentSaldoMonthIndex = monthlyKeuanganList.length - 1;
      updateSaldoCardView();
    }

    function updatePemasukanCardView() {
      if (monthlyKeuanganList.length === 0) return;
      const m = monthlyKeuanganList[currentPemasukanMonthIndex];
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const labelPemasukan = document.getElementById('label-pemasukan-bulan');
      const periodePemasukan = document.createElement('span');
      periodePemasukan.className = 'f4-period-nowrap';
      periodePemasukan.textContent = `(${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m.month]} ${m.year})`;
      labelPemasukan.replaceChildren(document.createTextNode('Masuk '), periodePemasukan);
      document.getElementById('pemasukan-bulan-ini').innerText = formatRupiah(m.pemasukan);
    }

    function updatePengeluaranCardView() {
      if (monthlyKeuanganList.length === 0) return;
      const m = monthlyKeuanganList[currentPengeluaranMonthIndex];
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const labelPengeluaran = document.getElementById('label-pengeluaran-bulan');
      const periodePengeluaran = document.createElement('span');
      periodePengeluaran.className = 'f4-period-nowrap';
      periodePengeluaran.textContent = `(${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m.month]} ${m.year})`;
      labelPengeluaran.replaceChildren(document.createTextNode('Keluar '), periodePengeluaran);
      document.getElementById('pengeluaran-bulan-ini').innerText = formatRupiah(m.pengeluaran);
    }

    function changeMonthPemasukan(direction) {
      if (monthlyKeuanganList.length === 0) return;
      currentPemasukanMonthIndex += direction;
      if (currentPemasukanMonthIndex < 0) currentPemasukanMonthIndex = 0;
      if (currentPemasukanMonthIndex >= monthlyKeuanganList.length) currentPemasukanMonthIndex = monthlyKeuanganList.length - 1;
      updatePemasukanCardView();
    }

    function changeMonthPengeluaran(direction) {
      if (monthlyKeuanganList.length === 0) return;
      currentPengeluaranMonthIndex += direction;
      if (currentPengeluaranMonthIndex < 0) currentPengeluaranMonthIndex = 0;
      if (currentPengeluaranMonthIndex >= monthlyKeuanganList.length) currentPengeluaranMonthIndex = monthlyKeuanganList.length - 1;
      updatePengeluaranCardView();
    }

    // CETAK LAPORAN KEUANGAN KAS
    const bulanNamaCetakKas = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    function isiSelectBulanCetakKas() {
      const ids = ['cetak-kas-bulan', 'cetak-kas-bulan-awal', 'cetak-kas-bulan-akhir'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el || el.options.length) return;
        bulanNamaCetakKas.forEach((nama, i) => {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = nama;
          el.appendChild(opt);
        });
      });
    }

    function openModalCetakKas() {
      if (!f4CanReadKas()) return;
      isiSelectBulanCetakKas();
      const now = new Date();
      let month = now.getMonth(), year = now.getFullYear();
      if (monthlyKeuanganList.length) {
        const last = monthlyKeuanganList[monthlyKeuanganList.length - 1];
        month = last.month; year = last.year;
      }
      document.getElementById('cetak-kas-bulan').value = month;
      document.getElementById('cetak-kas-bulan-awal').value = month;
      document.getElementById('cetak-kas-bulan-akhir').value = month;
      document.getElementById('cetak-kas-tahun').value = year;
      document.getElementById('cetak-kas-tahun-rentang').value = year;
      document.getElementById('cetak-kas-tahun-full').value = year;
      document.getElementById('cetak-kas-tipe').value = 'bulanan';
      updateCetakKasFields();
      document.getElementById('modal-cetak-kas').classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closeModalCetakKas() {
      document.getElementById('modal-cetak-kas')?.classList.add('hidden');
    }

    function updateCetakKasFields() {
      const tipe = document.getElementById('cetak-kas-tipe')?.value || 'bulanan';
      document.getElementById('cetak-kas-bulanan')?.classList.toggle('hidden', tipe !== 'bulanan');
      document.getElementById('cetak-kas-rentang')?.classList.toggle('hidden', tipe !== 'rentang');
      document.getElementById('cetak-kas-tahunan')?.classList.toggle('hidden', tipe !== 'tahunan');
    }

    function escapeCetakKas(v) {
      return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    function nominalCetakKas(raw) {
      if (typeof raw === 'number') return raw;
      const s = String(raw ?? '').replace(/\./g,'').replace(/,/g,'').replace(/[^0-9-]/g,'');
      return parseFloat(s) || 0;
    }

    function cetakLaporanKas() {
      if (!Array.isArray(globalKeuanganData) || globalKeuanganData.length === 0) {
        alert('Data keuangan belum tersedia. Tunggu data selesai dimuat lalu coba kembali.');
        return;
      }

      const tipe = document.getElementById('cetak-kas-tipe').value;
      let periode = 'Semua Transaksi';
      let labelSaldoAkhir = 'Saldo Akhir';
      let labelSaldoKasPeriode = 'Saldo Kas Periode';
      let filterFn = () => true;
      let batasAwalSaldo = null;

      if (tipe === 'bulanan') {
        const month = Number(document.getElementById('cetak-kas-bulan').value);
        const year = Number(document.getElementById('cetak-kas-tahun').value);
        periode = `Periode ${bulanNamaCetakKas[month]} ${year}`;
        labelSaldoAkhir = `Saldo Akhir ${bulanNamaCetakKas[month]} ${year}`;
        labelSaldoKasPeriode = `Saldo Kas ${bulanNamaCetakKas[month]} ${year}`;
        batasAwalSaldo = new Date(year, month, 1, 0, 0, 0, 0);
        filterFn = row => {
          const keys = Object.keys(row), d = parseRowDate(row[keys[0]]);
          return d && d.month === month && d.year === year;
        };
      } else if (tipe === 'rentang') {
        const awal = Number(document.getElementById('cetak-kas-bulan-awal').value);
        const akhir = Number(document.getElementById('cetak-kas-bulan-akhir').value);
        const year = Number(document.getElementById('cetak-kas-tahun-rentang').value);
        if (awal > akhir) return alert('Bulan awal tidak boleh lebih besar dari bulan akhir.');
        periode = `Periode ${bulanNamaCetakKas[awal]} s.d. ${bulanNamaCetakKas[akhir]} ${year}`;
        labelSaldoAkhir = `Saldo Akhir ${bulanNamaCetakKas[awal]}–${bulanNamaCetakKas[akhir]} ${year}`;
        labelSaldoKasPeriode = `Saldo Kas ${bulanNamaCetakKas[awal]}–${bulanNamaCetakKas[akhir]} ${year}`;
        batasAwalSaldo = new Date(year, awal, 1, 0, 0, 0, 0);
        filterFn = row => {
          const keys = Object.keys(row), d = parseRowDate(row[keys[0]]);
          return d && d.year === year && d.month >= awal && d.month <= akhir;
        };
      } else if (tipe === 'tahunan') {
        const year = Number(document.getElementById('cetak-kas-tahun-full').value);
        periode = `Laporan Tahunan ${year}`;
        labelSaldoAkhir = `Saldo Akhir Tahun ${year}`;
        labelSaldoKasPeriode = `Saldo Kas Tahun ${year}`;
        batasAwalSaldo = new Date(year, 0, 1, 0, 0, 0, 0);
        filterFn = row => {
          const keys = Object.keys(row), d = parseRowDate(row[keys[0]]);
          return d && d.year === year;
        };
      }

      let data = globalKeuanganData.filter(filterFn).slice();
      data.sort((a,b) => {
        const ka=Object.keys(a), kb=Object.keys(b);
        const da=parseRowDate(a[ka[0]]), db=parseRowDate(b[kb[0]]);
        if (!da || !db) return 0;
        return new Date(da.year,da.month,da.day||1) - new Date(db.year,db.month,db.day||1);
      });

      let totalMasuk=0, totalKeluar=0;
      let rows='';
      data.forEach((row,idx) => {
        const keys=Object.keys(row);
        if (keys.length < 4) return;
        const tanggal=row[keys[0]] || '-';
        const keterangan=row[keys[1]] || '-';
        const kategori=String(row[keys[2]] || '').trim();
        const jumlah=nominalCetakKas(row[keys[3]]);
        if (kategori.toLowerCase()==='pemasukan') totalMasuk += jumlah;
        if (kategori.toLowerCase()==='pengeluaran') totalKeluar += jumlah;
        const isMasuk = kategori.toLowerCase()==='pemasukan';
        const isKeluar = kategori.toLowerCase()==='pengeluaran';
        rows += `<tr>
          <td class="c">${idx+1}</td>
          <td class="nowrap">${escapeCetakKas(tanggal)}</td>
          <td>${escapeCetakKas(keterangan)}</td>
          <td class="r masuk">${isMasuk ? escapeCetakKas(formatRupiah(jumlah)) : ''}</td>
          <td class="r keluar">${isKeluar ? escapeCetakKas(formatRupiah(jumlah)) : ''}</td>
        </tr>`;
      });
      if (!rows) rows='<tr><td colspan="5" class="empty">Tidak ada transaksi pada periode ini.</td></tr>';
      const saldo=totalMasuk-totalKeluar;

      // Saldo tersedia = akumulasi seluruh transaksi sampai akhir periode laporan.
      // Dengan begitu laporan bulanan tetap menampilkan saldo bulan tersebut,
      // sekaligus saldo kas nyata yang tersedia setelah memperhitungkan bulan-bulan sebelumnya.
      let batasSaldo = null;
      if (tipe === 'bulanan') {
        const month = Number(document.getElementById('cetak-kas-bulan').value);
        const year = Number(document.getElementById('cetak-kas-tahun').value);
        batasSaldo = new Date(year, month + 1, 0, 23, 59, 59, 999);
      } else if (tipe === 'rentang') {
        const akhir = Number(document.getElementById('cetak-kas-bulan-akhir').value);
        const year = Number(document.getElementById('cetak-kas-tahun-rentang').value);
        batasSaldo = new Date(year, akhir + 1, 0, 23, 59, 59, 999);
      } else if (tipe === 'tahunan') {
        const year = Number(document.getElementById('cetak-kas-tahun-full').value);
        batasSaldo = new Date(year, 11, 31, 23, 59, 59, 999);
      }

      let totalMasukKumulatif = 0, totalKeluarKumulatif = 0;
      let masukSebelumnya = 0, keluarSebelumnya = 0;
      globalKeuanganData.forEach(row => {
        const keys = Object.keys(row);
        if (keys.length < 4) return;
        const d = parseRowDate(row[keys[0]]);
        if (!d) return;
        const dt = new Date(d.year, d.month, d.day || 1);
        const kategori = String(row[keys[2]] || '').trim().toLowerCase();
        const jumlah = nominalCetakKas(row[keys[3]]);

        if (!batasSaldo || dt <= batasSaldo) {
          if (kategori === 'pemasukan') totalMasukKumulatif += jumlah;
          if (kategori === 'pengeluaran') totalKeluarKumulatif += jumlah;
        }
        if (batasAwalSaldo && dt < batasAwalSaldo) {
          if (kategori === 'pemasukan') masukSebelumnya += jumlah;
          if (kategori === 'pengeluaran') keluarSebelumnya += jumlah;
        }
      });
      const saldoSebelumnya = batasAwalSaldo ? (masukSebelumnya - keluarSebelumnya) : 0;
      const saldoTersedia = totalMasukKumulatif - totalKeluarKumulatif;

      const tanggalCetak = new Date().toLocaleDateString('id-ID', {day:'2-digit',month:'long',year:'numeric'});

      const w=window.open('', '_blank');
      if (!w) return alert('Pop-up diblokir. Izinkan pop-up lalu coba kembali.');
      w.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Laporan Keuangan Kas - ${escapeCetakKas(periode)}</title>
<style>
@page{size:A4 portrait;margin:11mm 12mm 12mm}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#1e293b;font-size:10.5px;line-height:1.42;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.header{display:flex;align-items:center;gap:12px;border-bottom:2px solid #1e293b;padding-bottom:9px;margin-bottom:10px;break-inside:avoid;page-break-inside:avoid}.logo{width:54px;height:54px;object-fit:contain}.headtext{flex:1}.headtext h1{font-size:17px;margin:0 0 3px;font-weight:800}.headtext p{margin:2px 0;color:#475569}.periode{font-weight:700;color:#312e81!important}.badge{font-size:9px;font-weight:700;border:1px solid #c7d2fe;background:#eef2ff;color:#3730a3;padding:4px 7px;border-radius:12px;white-space:nowrap}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:9px 0 11px;break-inside:avoid;page-break-inside:avoid}.metric{border:1px solid #cbd5e1;border-radius:5px;padding:8px}.mlabel{font-size:8.5px;color:#64748b;text-transform:uppercase;font-weight:700}.mvalue{font-size:13.5px;font-weight:800;margin-top:3px}.masuk{color:#047857}.keluar{color:#be123c}.saldo{color:#3730a3}.tersedia{color:#0f766e}
h2{font-size:12px;margin:10px 0 5px;color:#1e293b}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}tfoot{display:table-footer-group}tr{break-inside:avoid;page-break-inside:avoid}th{background:#f1f5f9;color:#334155;font-size:10.5px;text-align:center;border:1px solid #cbd5e1;padding:3px 5px}td{border:1px solid #dbe3ec;padding:3px 5px;vertical-align:middle;overflow-wrap:anywhere}.c{text-align:center}.r{text-align:right}.nowrap{white-space:nowrap}.empty{text-align:center;color:#64748b;padding:12px}
.totalbox{margin-top:8px;border:1px solid #cbd5e1;background:#f8fafc;padding:7px 9px;display:grid;grid-template-columns:1fr auto;gap:3px 12px;break-inside:avoid;page-break-inside:avoid}.totalbox strong{font-size:11.5px}.approval{margin-top:15mm;text-align:center;break-inside:avoid;page-break-inside:avoid}.approval>div{width:75mm;max-width:100%;margin:0 auto}.sign-title{font-size:10px;margin-bottom:23mm}.sign-line{border-top:1px solid #475569;padding-top:4px;font-size:10px;font-weight:700}.note{margin-top:8px;font-size:8.5px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:5px}
@media screen{body{max-width:186mm;margin:14px auto;padding:0 4px;background:white}}
</style></head><body>
<header class="header"><img class="logo" src="https://flamboyan4.web.id/assets/logo-flamboyan.svg?v=official-20261027-v2" alt="Logo"><div class="headtext"><h1>LAPORAN KEUANGAN KAS WARGA FLAMBOYAN 4</h1><p>RT 001 RW 026 Pesona Kahuripan 2</p><p class="periode">${escapeCetakKas(periode)}</p></div><span class="badge">LAPORAN KAS</span></header>
<div class="summary"><div class="metric"><div class="mlabel">Saldo Sebelumnya</div><div class="mvalue saldo">${escapeCetakKas(formatRupiah(saldoSebelumnya))}</div></div><div class="metric"><div class="mlabel">${escapeCetakKas(labelSaldoKasPeriode)}</div><div class="mvalue masuk">${escapeCetakKas(formatRupiah(saldo))}</div></div><div class="metric"><div class="mlabel">${escapeCetakKas(labelSaldoAkhir)}</div><div class="mvalue tersedia">${escapeCetakKas(formatRupiah(saldoTersedia))}</div></div></div>
<h2>Rincian Transaksi</h2><table><colgroup><col style="width:6%"><col style="width:17%"><col style="width:43%"><col style="width:17%"><col style="width:17%"></colgroup><thead><tr><th class="c">No</th><th>Tanggal</th><th>Keterangan</th><th class="r">Debit</th><th class="r">Kredit</th></tr></thead><tbody>${rows}</tbody></table>
<div class="totalbox"><span>Total Kas Masuk</span><strong class="masuk">${escapeCetakKas(formatRupiah(totalMasuk))}</strong><span>Total Kas Keluar</span><strong class="keluar">${escapeCetakKas(formatRupiah(totalKeluar))}</strong></div>

<section class="approval"><div><div class="sign-title">Mengetahui,<br>Humas Flamboyan 4</div><div class="sign-line">Heri Juwandi</div></div></section>
<div class="note">Dicetak pada ${escapeCetakKas(tanggalCetak)} • Flamboyan 4 • Data bersumber dari pembukuan kas pada flamboyan4.web.id</div>
<script>window.onload=()=>{setTimeout(()=>window.print(),350)}<\/script></body></html>`);
      w.document.close();
      closeModalCetakKas();
    }

    // Konsisten dengan judul transaksi di Pembukuan; hanya mengubah teks tampilan.
    // Jurnal D1, kategori, nominal dan tanggal sama sekali tidak dimodifikasi.
    function f4PublicCashReadableNote(item) {
      const note=String(item?.keterangan||item?.kategori||'-').trim();
      const isFine=/^Denda Gorol\b/i.test(note);
      if(isFine){
        const parts=note.match(/^Denda Gorol\s+([A-Za-z]+)(?:\s+(20\d{2}))?/i);
        const countMatches=[...note.matchAll(/\b(\d+)\s*(?:pembayaran|warga|orang)\b/gi)];
        const count=Number(countMatches.at(-1)?.[1]||0);
        const year=parts?.[2]||String(item?.tanggal||'').slice(0,4);
        if(parts?.[1]&&count>0)
          return 'Denda Gorol '+parts[1]+( /^20\d{2}$/.test(year)?' '+year:'' )+' • '+count+' warga';
      }
      return note.replace(/(\s*•\s*\d+\s+pembayaran)\1\s*$/i,'$1');
    }

    // PROSES PERHITUNGAN KEUANGAN - LANGSUNG DARI BACKEND PEMBUKUAN
    async function loadKeuanganDariPembukuan() {
      try {
        const statusEl = document.getElementById('loading-status');
        const kasToken=F4Loading.begin(statusEl,'Memuat laporan keuangan warga…');

        // Public D1 report; never fall back to old Google Apps Script JSONP.
        const response=await fetch('https://api.flamboyan4.web.id/api/v2/public/portal/cash',{
          mode:'cors',cache:'no-store',headers:{'Accept':'application/json'}
        });
        const result=await response.json().catch(()=>{throw Error('Respons laporan kas tidak dapat dibaca.');});
        if(!response.ok||result?.ok!==true||!Array.isArray(result?.data?.rows))
          throw Error(result?.error||'Laporan kas belum dapat dibaca.');
        const sourceRows = Array.isArray(result.data.rows) ? result.data.rows : [];

        // Bentuk data disamakan dengan struktur lama supaya tampilan, modal,
        // pencarian dan cetak laporan yang sudah stabil tidak perlu dirombak.
        const rawData = sourceRows.map(item => {
          const jenisBackend = (item.jenis || '').toString().trim().toLowerCase();
          const debit = Number(item.debit || 0);
          const kredit = Number(item.kredit || 0);

          // Backend Pembukuan memakai istilah Debit/Kredit, sedangkan laman utama
          // sejak awal memakai Pemasukan/Pengeluaran. Normalisasi di sini agar
          // seluruh fungsi lama (card, modal, filter, cetak) tetap bekerja.
          let jenis = '';
          let nominal = 0;
          if (jenisBackend === 'debit' || debit > 0) {
            jenis = 'Pemasukan';
            nominal = debit;
          } else if (jenisBackend === 'kredit' || kredit > 0) {
            jenis = 'Pengeluaran';
            nominal = kredit;
          }

          return {
            'Tanggal': item.tanggal || '',
            'Keterangan': f4PublicCashReadableNote(item),
            'Jenis': jenis,
            'Nominal': nominal,
            'Catatan': item.catatan || '',
            '_idTransaksi': item.idTransaksi || '',
            '_kategori': item.kategori || '',
            '_metode': item.metode || '',
            '_sumber': item.sumber || ''
          };
        }).filter(row => row.Tanggal && row.Nominal > 0 && row.Jenis);

        let totalPemasukanAll = 0;
        let totalPengeluaranAll = 0;
        const monthlyMap = {};

        rawData.forEach(row => {
          const kategori = (row.Jenis || '').trim().toLowerCase();
          const jumlah = Number(row.Nominal || 0);

          if (kategori === 'pemasukan') totalPemasukanAll += jumlah;
          else if (kategori === 'pengeluaran') totalPengeluaranAll += jumlah;

          const parsed = parseRowDate(row.Tanggal);
          if (parsed) {
            const key = `${parsed.year}-${String(parsed.month + 1).padStart(2, '0')}`;
            if (!monthlyMap[key]) {
              monthlyMap[key] = { year: parsed.year, month: parsed.month, pemasukan: 0, pengeluaran: 0 };
            }
            if (kategori === 'pemasukan') monthlyMap[key].pemasukan += jumlah;
            else if (kategori === 'pengeluaran') monthlyMap[key].pengeluaran += jumlah;
          }
        });

        monthlyKeuanganList = Object.values(monthlyMap).sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });

        if (monthlyKeuanganList.length > 0) {
          currentPemasukanMonthIndex = monthlyKeuanganList.length - 1;
          currentPengeluaranMonthIndex = monthlyKeuanganList.length - 1;
          currentSaldoMonthIndex = monthlyKeuanganList.length - 1;
          updatePemasukanCardView();
          updatePengeluaranCardView();
          updateSaldoCardView();
        }

        const sisaSaldo = totalPemasukanAll - totalPengeluaranAll;
        if (!monthlyKeuanganList.length) {
          for (const id of ['pemasukan-bulan-ini','pengeluaran-bulan-ini','saldo-bulan']) {
            const el=document.getElementById(id);
            if(el)el.textContent='Rp 0';
          }
        }

        // Semua card, arsip dan rincian bulanan harus membaca satu daftar identik.
        // Urutkan menurut TANGGAL TRANSAKSI (bukan posisi baris spreadsheet).
        // Data migrasi bisa ditambahkan belakangan walau tanggalnya lebih lama;
        // jika mengikuti urutan baris, transaksi seperti Konsumsi gorol
        // tampak jauh di bawah pada Arsip Seluruh Transaksi.
        // Sort stabil: transaksi bertanggal sama mempertahankan urutan dari backend.
        globalKeuanganData = rawData.map((row, originalIndex) => ({row, originalIndex}))
          .sort((a, b) => {
            const da = parseRowDate(a.row.Tanggal);
            const db = parseRowDate(b.row.Tanggal);
            const ta = da ? new Date(da.year, da.month, da.day || 1).getTime() : 0;
            const tb = db ? new Date(db.year, db.month, db.day || 1).getTime() : 0;
            return tb - ta || a.originalIndex - b.originalIndex;
          }).map(item => item.row);
        const top6Data = globalKeuanganData.slice(0, 6);

        let tbodyHTML = '';
        top6Data.forEach(row => { tbodyHTML += renderTableRow(row); });

        let tbodyAllHTML = '';
        globalKeuanganData.forEach(row => { tbodyAllHTML += renderTableRow(row); });

        document.getElementById('tabel-transaksi').innerHTML = tbodyHTML || '<tr><td colspan="4" class="p-4 text-center text-slate-400">Belum ada transaksi</td></tr>';
        document.getElementById('tabel-transaksi-all').innerHTML = tbodyAllHTML || '<tr><td colspan="4" class="p-4 text-center text-slate-400">Belum ada transaksi</td></tr>';

        document.getElementById('total-pemasukan-all').innerText = formatRupiah(totalPemasukanAll);
        document.getElementById('total-pengeluaran-all').innerText = formatRupiah(totalPengeluaranAll);
        document.getElementById('sisa-saldo').innerText = formatRupiah(sisaSaldo);

        F4Loading.success(statusEl,kasToken);

        if (globalKeuanganData.length > 6) {
          document.getElementById('btn-container-keuangan-all').classList.remove('hidden');
        } else {
          document.getElementById('btn-container-keuangan-all').classList.add('hidden');
        }

        // Update mengikuti transaksi paling baru dari Buku Kas.
        if (globalKeuanganData.length > 0 && globalKeuanganData[0].Tanggal) {
          const updateEl = document.getElementById('label-update-kas');
          if (updateEl) updateEl.innerText = 'Update: ' + formatTanggalKeuanganDisplay(globalKeuanganData[0].Tanggal);
        }

        // Saldo kas total tidak boleh dianggap dana Gapura.
        // Widget proyek hanya membaca kategori kas terpilih dari D1 melalui loadProjectCards().

      } catch (err) {
        console.error('Gagal memuat keuangan dari Pembukuan:', err);
        const statusEl = document.getElementById('loading-status');
        F4Loading.error(statusEl,'Gagal menghubungkan keuangan: '+(err.message||err));
        for (const id of ['pemasukan-bulan-ini','pengeluaran-bulan-ini','saldo-bulan','total-pemasukan-all','total-pengeluaran-all','sisa-saldo']) {
          const el=document.getElementById(id);
          if(el)el.textContent='—';
        }
      }
    }

    if (document.readyState === 'complete') {
      setTimeout(loadKeuanganDariPembukuan, 0);
    } else {
      window.addEventListener('load', loadKeuanganDariPembukuan, { once: true });
    }

    // Calendar-aware Arisan cards. The source schedule is read as-is; only
    // month selection and the scroll target change, never the source data.
    const f4ArisanMonthNames=['januari','februari','maret','april','mei','juni',
      'juli','agustus','september','oktober','november','desember'];
    function f4ArisanCurrentPeriod(){
      const parts=new Intl.DateTimeFormat('en-GB',{
        timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit'
      }).formatToParts(new Date());
      const year=Number(parts.find(x=>x.type==='year')?.value);
      const month=Number(parts.find(x=>x.type==='month')?.value);
      return {year,month,key:year*12+month};
    }
    function f4ArisanRowPeriod(row){
      const raw=String(Object.values(row||{})[0]||'').toLowerCase().trim();
      const numeric=raw.match(/(?:^|\D)(20\d{2})[-/](0?[1-9]|1[012])(?:\D|$)/);
      if(numeric)return Number(numeric[1])*12+Number(numeric[2]);
      const year=(raw.match(/\b20\d{2}\b/)||[])[0];
      const month=f4ArisanMonthNames.findIndex(name=>
        new RegExp('(?:^|[^a-z])'+name+'(?:[^a-z]|$)').test(raw));
      return year&&month>=0?Number(year)*12+month+1:null;
    }
    function refreshArisanCards(){
      if(!globalArisanData.length)return;
      const now=f4ArisanCurrentPeriod();
      arisanLastMonthKey=String(now.key);
      currentArisanIdxGlobal=globalArisanData.findIndex(row=>f4ArisanRowPeriod(row)===now.key);
      nextArisanIdxGlobal=globalArisanData.findIndex(row=>f4ArisanRowPeriod(row)===now.key+1);
      // A missing month should never silently display the first historical row.
      // The next host may be the first known future schedule if one month is skipped.
      if(nextArisanIdxGlobal<0){
        const future=globalArisanData.map((row,index)=>({index,key:f4ArisanRowPeriod(row)}))
          .filter(x=>x.key!==null&&x.key>now.key).sort((a,b)=>a.key-b.key);
        if(future.length)nextArisanIdxGlobal=future[0].index;
      }
      const current=currentArisanIdxGlobal>=0?globalArisanData[currentArisanIdxGlobal]:null;
      const following=nextArisanIdxGlobal>=0?globalArisanData[nextArisanIdxGlobal]:null;
      const get=(id)=>document.getElementById(id);
      const values=row=>Object.values(row||{});
      get('arisan-bulan-ini-nama').textContent=current?String(values(current)[1]||'-'):'Belum dijadwalkan';
      get('arisan-bulan-ini-tgl').textContent=current?String(values(current)[0]||'-'):
        f4ArisanMonthNames[now.month-1]+' '+now.year;
      get('arisan-selanjutnya-nama').textContent=following?String(values(following)[1]||'-'):'Belum dijadwalkan';
      get('arisan-selanjutnya-tgl').textContent=following?
        'Pelaksanaan: '+String(values(following)[0]||'-'):'Menunggu jadwal berikutnya';
      const icon=get('arisan-bulan-ini-icon-bg');
      if(icon){
        const status=String(values(current)[2]||'').toLowerCase();
        const done=/sudah|selesai|lunas/.test(status);
        icon.className=done?'p-3 rounded-full bg-emerald-500/30 text-emerald-300':
          'p-3 rounded-full bg-white/20 backdrop-blur-sm text-white';
        icon.innerHTML=done?
          '<i data-lucide="check-circle-2" class="w-6 h-6"></i>':
          '<i data-lucide="home" class="w-6 h-6"></i>';
        window.lucide?.createIcons();
      }
      filterArisanModal();
    }
    function checkArisanMonthChange(){
      if(!globalArisanData.length)return;
      if(String(f4ArisanCurrentPeriod().key)!==arisanLastMonthKey)refreshArisanCards();
    }
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkArisanMonthChange()});
    window.addEventListener('pageshow',checkArisanMonthChange);
    // Also rolls the card forward while the page stays open across midnight.
    window.setInterval(()=>{if(!document.hidden)checkArisanMonthChange()},60000);

    if (CSV_ARISAN_URL && CSV_ARISAN_URL.startsWith('http')) {
      Papa.parse(CSV_ARISAN_URL, {
        download: true,
        header: true,
        complete: function(results) {
          const rawData = results.data.filter(row => {
            const values = Object.values(row);
            return values.length >= 2 && values[0] && values[0].toString().trim() !== '';
          });

          globalArisanData = rawData;

          refreshArisanCards();
          F4Loading.success('loading-status-arisan');
          lucide.createIcons();
        },
        error:function(err){F4Loading.error('loading-status-arisan','Gagal memuat jadwal arisan: '+(err.message||err));}
      });
    } else {
      F4Loading.empty('loading-status-arisan','Sumber jadwal arisan belum terhubung.');
    }

    function getNominalHargaJerseyRow(row) {
      if (!row) return 0;
      const keys = Object.keys(row);
      if (keys.length === 0) return 0;

      let targetKey = keys.find(k => {
        const lk = k.toLowerCase().trim();
        return lk === 'pembayaran' || (lk.includes('pembayaran') && !lk.includes('status'));
      });

      if (!targetKey) {
        targetKey = keys.find(k => {
          const lk = k.toLowerCase().trim();
          return lk.includes('harga') || lk.includes('nominal') || lk.includes('tagihan');
        });
      }

      if (!targetKey) {
        if (keys.length >= 7) targetKey = keys[6];
        else targetKey = keys[keys.length - 1];
      }

      const val = row[targetKey];
      if (!val) return 0;

      let strVal = val.toString().trim();
      strVal = strVal.replace(/rp/gi, '').replace(/\s+/g, '');
      strVal = strVal.replace(/\./g, '');
      strVal = strVal.replace(/,/g, '.');

      const num = parseFloat(strVal) || 0;
      return num;
    }

    function getStatusJerseyRow(row) {
      if (!row) return '';
      const keys = Object.keys(row);
      
      let targetKey = keys.find(k => k.toLowerCase().trim().includes('status'));

      if (!targetKey) {
        if (keys.length >= 6) targetKey = keys[5];
        else targetKey = keys[keys.length - 1];
      }

      return (row[targetKey] || '').toString().trim();
    }

    function getJerseyTerimaEksplisit(row){
      const methodKey=Object.keys(row||{}).find(k=>/keterangan|metode|method/i.test(k));
      const method=String(row?.[methodKey]||'');
      const tags=[...method.matchAll(/\[F4BAYAR:(\d{1,12})\]/g)];
      return tags.length?Number(tags[tags.length-1][1]):null;
    }
    function getNominalJerseyMasuk(row) {
      if(!row)return 0;
      const exact=getJerseyTerimaEksplisit(row);
      if(exact!==null)return exact;
      const statusRaw=getStatusJerseyRow(row).toLowerCase();
      const price=getNominalHargaJerseyRow(row);
      if(statusRaw.includes('lunas'))return price;
      if(!/dp|cicil/.test(statusRaw))return 0;
      const matches=statusRaw.match(/(?:rp\s*)?(\d[\d.,]*)/i);
      if(!matches)return 0; // DP tanpa nominal tidak ditebak 50%.
      let amount=Number(matches[1].replace(/[.,]/g,''));
      if(amount>0&&amount<1000)amount*=1000;
      return Number.isFinite(amount)?amount:0;
    }
    function switchJerseyTab(tab) {
      currentJerseyTab = tab;
      const btnBapak = document.getElementById('tab-jersey-bapak');
      const btnIbu = document.getElementById('tab-jersey-ibu');
      const labelTab = document.getElementById('label-tab-kategori');

      if (tab === 'bapak') {
        btnBapak.className = "flex-1 py-2 px-3 rounded-xl font-bold text-xs md:text-sm border transition flex items-center justify-center space-x-2 bg-indigo-600 text-white border-indigo-600 shadow-sm";
        btnIbu.className = "flex-1 py-2 px-3 rounded-xl font-bold text-xs md:text-sm border transition flex items-center justify-center space-x-2 bg-white text-slate-600 border-slate-200 hover:bg-slate-100";
        if (labelTab) labelTab.innerText = "(Bapak-bapak)";
      } else {
        btnIbu.className = "flex-1 py-2 px-3 rounded-xl font-bold text-xs md:text-sm border transition flex items-center justify-center space-x-2 bg-indigo-600 text-white border-indigo-600 shadow-sm";
        btnBapak.className = "flex-1 py-2 px-3 rounded-xl font-bold text-xs md:text-sm border transition flex items-center justify-center space-x-2 bg-white text-slate-600 border-slate-200 hover:bg-slate-100";
        if (labelTab) labelTab.innerText = "(Ibu-ibu)";
      }
      filterJerseyModal();
    }

    function escapeJerseyText(value) {
      return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function renderJerseyRow(row) {
      const keys = Object.keys(row);
      
      const no = escapeJerseyText(row[keys[0]] || '-');
      // A guest only sees a pseudonymous row. The API must separately enforce its own privacy policy.
      const namaBlok = f4CanReadKas() ? escapeJerseyText(row[keys[1]] || '-') : ('Pemesan ' + no);
      const lengan = escapeJerseyText(row[keys[2]] || '-');
      const ukuran = escapeJerseyText(row[keys[3]] || '-');
      const namaNoPunggung = f4CanReadKas() ? escapeJerseyText(row[keys[4]] || '-') : '—';
      
      const totalHarga = getNominalHargaJerseyRow(row);
      const nominalMasuk = getNominalJerseyMasuk(row);
      const statusRaw = getStatusJerseyRow(row).toLowerCase();

      let statusBadge = `<span class="px-2 py-0.5 text-xs bg-slate-100 text-slate-400 rounded">-</span>`;

      if (totalHarga > 0 && nominalMasuk >= totalHarga) {
        statusBadge = `<span class="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-semibold rounded">Lunas</span>`;
      } else if (nominalMasuk > 0 && totalHarga > 0) {
        const persen = Math.min(99, Math.round((nominalMasuk / totalHarga) * 100));
        statusBadge = `<span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 font-semibold rounded">DP ${persen}%</span>`;
      }

      if (!f4CanReadKas()) statusBadge = '<span class="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">Terdaftar</span>';
      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 text-center text-slate-500 font-mono">${no}</td>
          <td class="p-3 font-bold text-slate-800 break-words">${namaBlok}</td>
          <td class="p-3 text-slate-600 whitespace-nowrap">${lengan}</td>
          <td class="p-3 font-semibold text-indigo-700 whitespace-nowrap">${ukuran}</td>
          <td class="p-3 text-slate-700 break-words">${namaNoPunggung}</td>
          <td class="p-3 text-right font-bold text-slate-800 whitespace-nowrap">${f4CanReadKas() && nominalMasuk > 0 ? formatRupiah(nominalMasuk) : '—'}</td>
          <td class="p-3 text-center whitespace-nowrap">${statusBadge}</td>
        </tr>
      `;
    }

    function filterJerseyModal() {
      const keyword = (document.getElementById('search-jersey').value || '').toLowerCase();
      const activeData = (currentJerseyTab === 'bapak') ? globalJerseyBapakData : globalJerseyIbuData;

      let html = '';
      let activeTotalTagihan = 0;
      let activeTerkumpul = 0;
      let activeSisa=0;
      let activeTitipan=0;

      activeData.forEach(row => {
        const text = Object.values(row).join(' ').toLowerCase();
        if (text.includes(keyword)) {
          html += renderJerseyRow(row);
        }

        const totalHarga = getNominalHargaJerseyRow(row);
        const nominalMasuk = getNominalJerseyMasuk(row);

        activeTotalTagihan += totalHarga;
        activeTerkumpul += nominalMasuk;
        activeSisa+=Math.max(0,totalHarga-nominalMasuk);
        activeTitipan+=Math.max(0,nominalMasuk-totalHarga);
      });

      // Jangan gunakan titipan kelebihan satu warga untuk melunasi warga lain.

      document.getElementById('modal-jersey-total-tagihan').innerText = formatRupiah(activeTotalTagihan);
      document.getElementById('modal-jersey-terkumpul').innerText = formatRupiah(activeTerkumpul);
      document.getElementById('modal-jersey-sisa').innerText = formatRupiah(activeSisa);
      const labelTitipan=document.getElementById('modal-jersey-titipan');
      if(labelTitipan){
        labelTitipan.hidden=activeTitipan<=0;
        labelTitipan.textContent=activeTitipan>0?'Titipan: '+formatRupiah(activeTitipan):'';
      }

      document.getElementById('tabel-jersey-all').innerHTML = html || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Tidak ada pemesan ${currentJerseyTab === 'bapak' ? 'Bapak-bapak' : 'Ibu-ibu'} yang cocok</td></tr>`;
    }

    function calculateTotalJerseyRekap() {
      const allCombined = [...globalJerseyBapakData, ...globalJerseyIbuData];
      let countLunas = 0;
      let countDP = 0;
      let grandTotalTerkumpul = 0;

      allCombined.forEach(row => {
        const harga = getNominalHargaJerseyRow(row);
        const nominalMasuk = getNominalJerseyMasuk(row);

        grandTotalTerkumpul += nominalMasuk;

        if (harga > 0 && nominalMasuk >= harga) {
          countLunas++;
        } else if (nominalMasuk > 0) {
          countDP++;
        }
      });

      document.getElementById('total-pemesan-jersey').innerText = `${allCombined.length} Orang`;
      document.getElementById('total-lunas-jersey').innerText = `${countLunas} Orang`;
      document.getElementById('total-dp-jersey').innerText = `${countDP} Orang`;

      document.getElementById('card-jersey-terkumpul').innerText = formatRupiah(grandTotalTerkumpul);

      document.getElementById('badge-count-bapak').innerText = globalJerseyBapakData.length;
      document.getElementById('badge-count-ibu').innerText = globalJerseyIbuData.length;
    }

    if (CSV_JERSEY_BAPAK_URL && CSV_JERSEY_BAPAK_URL.startsWith('http')) {
      Papa.parse(CSV_JERSEY_BAPAK_URL, {
        download: true,
        header: true,
        complete: function(results) {
          globalJerseyBapakData = results.data.filter(row => {
            const values = Object.values(row);
            return values.length >= 2 && values[1] && values[1].toString().trim() !== '';
          });
          calculateTotalJerseyRekap();
          filterJerseyModal();
        }
      });
    }

    if (CSV_JERSEY_IBU_URL && CSV_JERSEY_IBU_URL.startsWith('http')) {
      Papa.parse(CSV_JERSEY_IBU_URL, {
        download: true,
        header: true,
        complete: function(results) {
          globalJerseyIbuData = results.data.filter(row => {
            const values = Object.values(row);
            return values.length >= 2 && values[1] && values[1].toString().trim() !== '';
          });
          calculateTotalJerseyRekap();
          filterJerseyModal();
        }
      });
    }

    (async function loadJerseyAndGapuraImages() {
      const folderJerseyId = extractFolderId(FOLDER_JERSEY_URL);
      if (folderJerseyId && FOLDER_API_URL.startsWith('http')) {
        const files = await fetchFolderFiles(folderJerseyId);
        if (files && files.length > 0) {
          const firstImg = files.find(f => f.type === 'image') || files[0];
          document.getElementById('container-foto-jersey-single').innerHTML = `
            <img src="${firstImg.url}" alt="Desain Jersey" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold space-x-1 backdrop-blur-[1px]">
              <i data-lucide="layout-grid" class="w-4 h-4"></i>
              <span>Galeri Foto Jersey (${files.length})</span>
            </div>
          `;
        }
      }

      const folderGapuraId = extractFolderId(FOLDER_GAPURA_URL);
      if (folderGapuraId && FOLDER_API_URL.startsWith('http')) {
        const gapuraFiles = await fetchFolderFiles(folderGapuraId);
        if (gapuraFiles && gapuraFiles.length > 0) {
          const firstGapuraImg = gapuraFiles.find(f => f.type === 'image') || gapuraFiles[0];
          document.getElementById('container-foto-gapura').innerHTML = `
            <img src="${firstGapuraImg.url}" alt="Desain Gapura" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold space-x-1 backdrop-blur-[1px]">
              <i data-lucide="layout-grid" class="w-4 h-4"></i>
              <span>Desain Gapura (${gapuraFiles.length})</span>
            </div>
          `;
        }
      }
      lucide.createIcons();
    })();

    function scrollDokumentasi(direction) {
      // Dipertahankan untuk kompatibilitas tombol/skrip lama jika masih terpanggil.
      const slider = document.getElementById('slider-dokumentasi');
      if (!slider) return;
      const cardWidth = slider.querySelector('div')?.offsetWidth || 320;
      slider.scrollBy({ left: direction * (cardWidth + 16), behavior: 'smooth' });
    }

    function updateDokumentasiPreview() {
      if (!globalDokumentasiPreview.length) return;
      if (dokumentasiPreviewIndex >= globalDokumentasiPreview.length) dokumentasiPreviewIndex = 0;
      const item = globalDokumentasiPreview[dokumentasiPreviewIndex];
      const img = document.getElementById('dokumentasi-preview-img');
      const tanggal = document.getElementById('dokumentasi-preview-tanggal');
      const judul = document.getElementById('dokumentasi-preview-judul');
      const desc = document.getElementById('dokumentasi-preview-desc');
      const counter = document.getElementById('dokumentasi-preview-counter');
      if (!img) return;

      img.style.opacity = '0.25';
      setTimeout(() => {
        img.src = item.preview || PLACEHOLDER_IMG;
        img.onload = () => { img.style.opacity = '0.85'; };
        img.onerror = () => { img.src = PLACEHOLDER_IMG; img.style.opacity = '0.85'; };
        if (tanggal) tanggal.innerText = item.tanggal || 'Dokumentasi';
        if (judul) judul.innerText = item.judul || 'Album Kegiatan Warga';
        if (desc) desc.innerText = item.deskripsi || 'Klik untuk membuka album';
        if (counter) counter.innerText = `${dokumentasiPreviewIndex + 1} / ${globalDokumentasiPreview.length}`;
      }, 180);
    }

    function mulaiRotasiDokumentasiPreview() {
      if (dokumentasiPreviewTimer) clearInterval(dokumentasiPreviewTimer);
      if (globalDokumentasiPreview.length <= 1) return;
      dokumentasiPreviewTimer = setInterval(() => {
        dokumentasiPreviewIndex = (dokumentasiPreviewIndex + 1) % globalDokumentasiPreview.length;
        updateDokumentasiPreview();
      }, 5000);
    }

    function openDokumentasiPreviewAktif() {
      openModalDokumentasi();
    }

    function openInventarisWargaFoto(url, title) {
      if (!url) return;
      currentMediaList = [{ type: 'image', url: url, rawUrl: url }];
      currentPhotoIndex = 0;
      currentPhotoCaption = title || 'Inventaris Warga';
      openModal('lightbox-modal');
      // Gunakan renderer lightbox yang sama dengan galeri dokumentasi.
      // Sebelumnya memanggil renderLightboxMedia() yang tidak tersedia,
      // sehingga modal terbuka tetapi isinya kosong.
      updateLightboxView();
    }

    function loadInventarisWarga() {
      const container = document.getElementById('container-inventaris-warga');
      const badge = document.getElementById('inventaris-warga-count');
      if (!container) return;

      if (!CSV_INVENTARIS_WARGA_URL || !CSV_INVENTARIS_WARGA_URL.startsWith('http')) {
        container.innerHTML = `<div class="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
          <i data-lucide="clipboard-list" class="w-5 h-5 text-slate-400 mx-auto mb-2"></i>
          <p class="text-xs font-semibold text-slate-600">Data inventaris</p>
          <p class="text-[10px] text-slate-400 mt-1">Inventaris belum tersedia.</p>
        </div>`;
        if (badge) badge.innerText = 'Belum Terhubung';
        if (window.lucide) lucide.createIcons();
        return;
      }

      Papa.parse(CSV_INVENTARIS_WARGA_URL, {
        download: true,
        header: true,
        complete: function(results) {
          const rows = results.data.filter(row => Object.values(row).some(v => String(v || '').trim() !== ''));
          let items = [];
          rows.forEach(row => {
            const vals = Object.values(row);
            const nama = String(vals[0] || '').trim();
            if (!nama || nama.toLowerCase().includes('nama barang')) return;
            const qty = String(vals[1] || '0').trim();
            const kondisi = String(vals[2] || '').trim();
            const rawFoto = String(vals[3] || '').trim();
            items.push({ nama, qty, kondisi, foto: rawFoto ? fixDriveUrl(rawFoto) : '' });
          });

          if (badge) badge.innerText = `${items.length} Item`;
          if (!items.length) {
            container.innerHTML = '<p class="text-xs text-slate-400 italic">Belum ada data inventaris.</p>';
            return;
          }

          container.innerHTML = items.map(item => {
            const safeTitle = item.nama.replace(/'/g, "\'");
            const safeFoto = item.foto.replace(/'/g, "\'");
            return `<div ${item.foto ? `onclick="openInventarisWargaFoto('${safeFoto}', '${safeTitle}')"` : ''} class="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs sm:text-sm ${item.foto ? 'cursor-pointer hover:border-indigo-300 transition' : ''}">
              <div class="flex items-center gap-2.5 min-w-0">
                ${item.foto ? `<img src="${item.foto}" class="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200" onerror="this.style.display='none'">` : `<div class="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700"><i data-lucide="box" class="w-4 h-4"></i></div>`}
                <div class="min-w-0">
                  <span class="font-semibold text-slate-700 truncate block">${item.nama}</span>
                  ${item.kondisi ? `<span class="text-[10px] text-slate-400 truncate block">${item.kondisi}</span>` : ''}
                </div>
              </div>
              <span class="bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full text-xs shrink-0 ml-2">${item.qty} Unit</span>
            </div>`;
          }).join('');
          if (window.lucide) lucide.createIcons();
        },
        error: function() {
          container.innerHTML = '<p class="text-xs text-rose-500">Gagal memuat inventaris warga.</p>';
        }
      });
    }

    if (CSV_DOKUMENTASI_URL && CSV_DOKUMENTASI_URL.startsWith('http')) {
      Papa.parse(CSV_DOKUMENTASI_URL, {
        download: true,
        header: true,
        complete: async function(results) {
          const rawData = results.data.filter(row => {
            const values = Object.values(row);
            return values.length >= 2 && values[0] && values[0].toString().trim() !== '';
          });

          const displayData = [...rawData].reverse();
          let allHTML = '';
          globalDokumentasiPreview = [];

          for (let index = 0; index < displayData.length; index++) {
            const row = displayData[index];
            const keys = Object.keys(row);
            const tanggal = row[keys[0]];
            const judul = row[keys[1]];
            const deskripsi = row[keys[2]] || '';
            let rawFotoString = row[keys[3]] || '';

            const folderId = extractFolderId(rawFotoString);
            let firstFoto = PLACEHOLDER_IMG;
            let badgeText = '';

            if (folderId) {
              badgeText = 'Album Media';
              const files = await fetchFolderFiles(folderId);
              if (files && files.length > 0) {
                const imgItem = files.find(f => f.type === 'image') || files[0];
                firstFoto = imgItem.url;
                badgeText = `${files.length} Media`;
              }
            } else {
              const photoList = rawFotoString.split(',').filter(p => p.trim() !== '');
              firstFoto = fixDriveUrl(photoList[0] || '');
              if (photoList.length > 1) badgeText = `${photoList.length} Foto`;
            }

            globalDokumentasiPreview.push({ tanggal, judul, deskripsi, rawFotoString, preview: firstFoto });

            const safePhotoString = rawFotoString.replace(/'/g, "\'");
            const safeTitle = (judul + ' - ' + tanggal).replace(/'/g, "\'");
            let badgeMultiPhoto = '';
            if (badgeText) {
              badgeMultiPhoto = `<span data-folder-badge="${folderId || ''}" class="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1 z-10 shadow-sm"><i data-lucide="folder" class="w-3.5 h-3.5"></i><span>${badgeText}</span></span>`;
            }

            allHTML += `<div role="button" tabindex="0" onclick="openGalleryGridModal('${safePhotoString}', '${safeTitle}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openGalleryGridModal('${safePhotoString}', '${safeTitle}')}" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-300 transition flex flex-col w-full h-full cursor-pointer group active:scale-[0.99]">
              <div class="p-3.5 bg-slate-50 border-b border-slate-100">
                <span class="text-[10px] text-indigo-600 font-bold block uppercase tracking-wider mb-0.5">${tanggal}</span>
                <h4 class="text-slate-800 font-bold text-sm md:text-base leading-snug break-words group-hover:text-indigo-700 transition">${judul}</h4>
              </div>
              <div class="relative overflow-hidden bg-slate-100 h-40 md:h-48 w-full items-center justify-center shrink-0 hidden sm:flex" data-folder-id="${folderId || ''}">
                <img src="${firstFoto}" alt="${judul}" loading="lazy" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.src='${PLACEHOLDER_IMG}'">
                ${badgeMultiPhoto}
                <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold space-x-1 z-20"><i data-lucide="layout-grid" class="w-4 h-4"></i><span>Buka Galeri Media</span></div>
              </div>
              <div class="p-4 flex-grow flex items-center justify-between gap-3">
                <p class="text-slate-600 text-xs md:text-sm break-words line-clamp-2">${deskripsi || 'Lihat album'}</p>
                <i data-lucide="chevron-right" class="w-4 h-4 text-indigo-500 shrink-0 sm:hidden"></i>
              </div>
            </div>`;
          }

          const previewImg = document.getElementById('dokumentasi-preview-img');
          if (!globalDokumentasiPreview.length && previewImg) {
            previewImg.src = PLACEHOLDER_IMG;
            document.getElementById('dokumentasi-preview-judul').innerText = 'Belum ada dokumentasi';
            document.getElementById('dokumentasi-preview-desc').innerText = 'Dokumentasi kegiatan akan tampil di sini';
            document.getElementById('dokumentasi-preview-tanggal').innerText = 'Dokumentasi';
          } else {
            dokumentasiPreviewIndex = 0;
            updateDokumentasiPreview();
            mulaiRotasiDokumentasiPreview();
          }

          document.getElementById('container-dokumentasi-all').innerHTML = allHTML || '<p class="text-slate-400 text-sm col-span-1 md:col-span-3">Belum ada album.</p>';
          if (window.lucide) lucide.createIcons();
        },
        error:function(err){
          const holder=document.getElementById('container-dokumentasi-all');
          if(holder&&!globalDokumentasiPreview.length){
            holder.replaceChildren();
            const message=document.createElement('p');
            message.className='text-xs text-rose-700';message.textContent='Dokumentasi belum dapat diperbarui: '+(err.message||err);
            const retry=document.createElement('button');retry.type='button';retry.textContent='Coba Lagi';retry.onclick=()=>location.reload();
            holder.append(message,retry);
            document.getElementById('dokumentasi-preview-judul').textContent='Galeri gagal dimuat';
          }
        }
      });
    }

    loadInventarisWarga();

    // FUNGSI RENDER KALENDER TERBARU
    function renderCalendar() {
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();

      document.getElementById('calendar-month-year').innerText = `${monthNames[month]} ${year}`;

      const firstDayObj = new Date(year, month, 1);
      const firstDay = firstDayObj.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();
      
      const today = new Date();
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

      const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      const hasSpecificArisanInCsv = globalRencanaData.some(item => {
        if (!item.parsedDate || !item.parsedDate.startsWith(monthPrefix)) return false;
        const txt = (item.judul + " " + item.deskripsi).toLowerCase();
        return txt.includes('arisan');
      });

      let secondSaturdayDate = null;
      if (!hasSpecificArisanInCsv) {
        let saturdayList = [];
        for (let d = 1; d <= daysInMonth; d++) {
          let checkDate = new Date(year, month, d);
          if (checkDate.getDay() === 6) {
            saturdayList.push(d);
          }
        }

        if (firstDay >= 4) {
          if (saturdayList[0] <= 3 && saturdayList.length > 2) {
            secondSaturdayDate = saturdayList[2];
          } else {
            secondSaturdayDate = saturdayList[1];
          }
        } else {
          secondSaturdayDate = saturdayList[1] || null;
        }
      }

      let gridHTML = '';

      for (let i = firstDay - 1; i >= 0; i--) {
        const prevDayNum = prevMonthDays - i;
        gridHTML += `
          <div class="p-1.5 min-h-[44px] border border-slate-100/60 rounded-lg flex flex-col items-center justify-start bg-slate-50/50 opacity-40 select-none">
            <span class="text-slate-400 text-xs font-normal">${prevDayNum}</span>
          </div>
        `;
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        let dayEvents = globalRencanaData.filter(item => item.parsedDate === dateKey);

        if (day === secondSaturdayDate) {
          dayEvents.push({
            tanggalStr: `${day} ${monthNames[month]} ${year}`,
            parsedDate: dateKey,
            judul: "Arisan Warga Flamboyan 4",
            deskripsi: "Putaran bulanan arisan warga rutin.",
            status: "Terjadwal",
            isGorol: false,
            isArisan: true
          });
        }

        let isGorol = false;
        let isArisan = false;
        let hasEvent = dayEvents.length > 0;

        if (hasEvent) {
          isGorol = dayEvents.some(e => e.isGorol);
          isArisan = dayEvents.some(e => {
            if (e.isArisan) return true;
            const txt = (e.judul + " " + (e.deskripsi || '')).toLowerCase();
            return txt.includes('arisan');
          });
        }

        let dayClass = "p-1.5 min-h-[44px] border border-slate-100 rounded-lg flex flex-col items-center justify-between relative transition hover:border-indigo-300 bg-white";
        let badgeClass = "";

        if (isCurrentMonth && day === today.getDate()) {
          dayClass += " bg-indigo-50/60 font-bold border-indigo-200 ring-1 ring-indigo-300";
        }

        if (hasEvent) {
          dayClass += " cursor-pointer shadow-sm";
          if (isGorol) {
            badgeClass = "bg-amber-500 text-white font-bold";
            dayClass += " bg-amber-50 border-amber-300 hover:bg-amber-100";
          } else {
            badgeClass = "bg-indigo-600 text-white font-bold";
            dayClass += " bg-indigo-50 border-indigo-300 hover:bg-indigo-100";
          }
        }

        const safeDateStr = `${day} ${monthNames[month]} ${year}`;
       const clickAttr = hasEvent ? `onclick='openModalEventDetail("${safeDateStr}", ${JSON.stringify(dayEvents).replace(/'/g, "&apos;")}, "${dateKey}")'` : '';
        
        let badgeLabel = '📌 Acara';
        if (isArisan) badgeLabel = '🏠 Arisan';
        else if (isGorol) badgeLabel = '🧹 Gorol';

        gridHTML += `
          <div class="${dayClass}" ${clickAttr}>
            <span class="${isCurrentMonth && day === today.getDate() ? 'text-indigo-700 font-black' : 'text-slate-700'}">${day}</span>
            ${hasEvent ? `
              <span class="w-full text-[9px] py-0.5 px-1 rounded truncate text-center mt-1 ${badgeClass}">
                ${badgeLabel}
              </span>
            ` : ''}
          </div>
        `;
      }

      const totalCellsUsed = firstDay + daysInMonth;
      const totalGridCells = totalCellsUsed <= 35 ? 35 : 42;
      const nextDaysCount = totalGridCells - totalCellsUsed;

      for (let nextDayNum = 1; nextDayNum <= nextDaysCount; nextDayNum++) {
        gridHTML += `
          <div class="p-1.5 min-h-[44px] border border-slate-100/60 rounded-lg flex flex-col items-center justify-start bg-slate-50/50 opacity-40 select-none">
            <span class="text-slate-400 text-xs font-normal">${nextDayNum}</span>
          </div>
        `;
      }

      document.getElementById('calendar-days-grid').innerHTML = gridHTML;
      lucide.createIcons();
    }

    function changeMonth(direction) {
      calendarDate.setMonth(calendarDate.getMonth() + direction);
      renderCalendar();
    }

    function resetToCurrentMonth() {
      calendarDate = new Date();
      renderCalendar();
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const calWrapper = document.getElementById('calendar-wrapper');
    if (calWrapper) {
      calWrapper.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      calWrapper.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleCalendarSwipe();
      }, { passive: true });
    }

    function handleCalendarSwipe() {
      const swipeDistanceX = touchEndX - touchStartX;
      const swipeDistanceY = touchEndY - touchStartY;
      
      if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) && Math.abs(swipeDistanceX) > 40) {
        if (swipeDistanceX < 0) {
          changeMonth(1);
        } else {
          changeMonth(-1);
        }
      }
    }

    if (CSV_RENCANA_URL && CSV_RENCANA_URL.startsWith('http')) {
      Papa.parse(CSV_RENCANA_URL, {
        download: true,
        header: true,
        complete: function(results) {
          const rawData = results.data.filter(row => {
            const values = Object.values(row);
            return values.length >= 2 && values[0] && values[0].toString().trim() !== '';
          });

          globalRencanaData = rawData.map(row => {
            const keys = Object.keys(row);
            const tanggalStr = row[keys[0]] || '';
            const judul = row[keys[1]] || '';
            const deskripsi = row[keys[2]] || '';
            const status = row[keys[3]] || 'Direncanakan';

            const combinedText = (judul + " " + deskripsi).toLowerCase();
            const isGorol = combinedText.includes('gorol') || combinedText.includes('golor') || combinedText.includes('kerja bakti') || combinedText.includes('kerjabakti') || combinedText.includes('gotong royong');

            let parsedDate = '';
            const dateParts = tanggalStr.trim().split(/[\s\-\/\.]+/);
            if (dateParts.length >= 3) {
              let day = dateParts[0].padStart(2, '0');
              let month = dateParts[1];
              let year = dateParts[2];

              const monthMap = { 'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mei': '05', 'jun': '06', 'jul': '07', 'agu': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'des': '12' };
              for (let key in monthMap) {
                if (month.toLowerCase().startsWith(key)) {
                  month = monthMap[key];
                  break;
                }
              }
              if (month.length === 1) month = month.padStart(2, '0');
              if (year.length === 2) year = '20' + year;

              parsedDate = `${year}-${month}-${day}`;
            }

            return {
              tanggalStr,
              parsedDate,
              judul,
              deskripsi,
              status,
              isGorol
            };
          });

          const onProgressList = [];
          const direncanakanList = [];
          const selesaiList = [];

          globalRencanaData.forEach(item => {
            const statusLcase = item.status.toLowerCase();
            if (statusLcase.includes('progress') || statusLcase.includes('rancang') || statusLcase.includes('jalan')) {
              onProgressList.push(item);
            } else if (statusLcase.includes('selesai')) {
              selesaiList.push(item);
            } else {
              direncanakanList.push(item);
            }
          });

          // Urutan status tetap: On Progress → Direncanakan → Selesai.
          // Di dalam setiap status, tanggal paling baru harus di atas,
          // bukan sekadar membalik urutan baris spreadsheet.
          const latestFirst=(a,b)=>{
            const aDate=/^\d{4}-\d{2}-\d{2}$/.test(a.parsedDate||'')?a.parsedDate:'';
            const bDate=/^\d{4}-\d{2}-\d{2}$/.test(b.parsedDate||'')?b.parsedDate:'';
            return bDate.localeCompare(aDate);
          };
          onProgressList.sort(latestFirst);
          direncanakanList.sort(latestFirst);
          selesaiList.sort(latestFirst);
          const displayData = [...onProgressList, ...direncanakanList, ...selesaiList];

          let rencanaHTML = '';
          displayData.forEach(item => {
            let statusBadge = `<span class="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">Direncanakan</span>`;
            if (item.status.toLowerCase().includes('progress') || item.status.toLowerCase().includes('rancang') || item.status.toLowerCase().includes('jalan')) {
              statusBadge = `<span class="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">On Progress</span>`;
            } else if (item.status.toLowerCase().includes('selesai')) {
              statusBadge = `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">Selesai</span>`;
            }

            const gorolTag = item.isGorol ? `<span class="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-1">🧹 Gorol</span>` : '';

            rencanaHTML += `
              <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-indigo-600">${item.tanggalStr}</span>
                  ${statusBadge}
                </div>
                <h5 class="font-bold text-slate-800 text-xs md:text-sm mt-0.5">${gorolTag}${item.judul}</h5>
                <p class="text-slate-500 text-[11px]">${item.deskripsi}</p>
              </div>
            `;
          });

          document.getElementById('container-rencana').innerHTML = rencanaHTML || '<p class="text-slate-400 text-xs">Belum ada agenda.</p>';
          renderCalendar();
          // Deteksi Otomatis parameter ?event=YYYY-MM-DD saat link dibuka dari WhatsApp
          const urlParams = new URLSearchParams(window.location.search);
          const targetDateIso = urlParams.get('event');

          if (targetDateIso) {
            const matchingEvents = globalRencanaData.filter(item => item.parsedDate === targetDateIso);
            
            if (matchingEvents.length > 0) {
              const dateParts = targetDateIso.split('-');
              const year = dateParts[0];
              const month = parseInt(dateParts[1]);
              const day = parseInt(dateParts[2]);
              const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
              const safeDateStr = `${day} ${monthNames[month - 1]} ${year}`;
              
              setTimeout(() => {
                const elRencana = document.getElementById('rencana');
                if (elRencana) elRencana.scrollIntoView({ behavior: 'smooth' });
                openModalEventDetail(safeDateStr, matchingEvents, targetDateIso);
              }, 700);
            }
          }
        },
        error:function(err){
          const area=document.getElementById('container-rencana');
          if(area){
            area.replaceChildren();
            const msg=document.createElement('p');msg.className='text-xs text-rose-700';
            msg.textContent='Agenda gagal dimuat: '+(err.message||err);
            const retry=document.createElement('button');retry.textContent='Coba Lagi';retry.type='button';retry.onclick=()=>location.reload();
            area.append(msg,retry);
          }
          renderCalendar();
        }
      });
    } else {
      const area=document.getElementById('container-rencana');
      if(area)area.textContent='Agenda belum tersedia.';
      renderCalendar();
    }

   // ==========================================
// BANNER SLIDER SCRIPT (DIRECT DRIVE FIX)
// ==========================================
(function() {
  const CSV_BANNER_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=780113187&single=true&output=csv";

  let bannerData = [];
  let currentBannerIndex = 0;
  let bannerInterval = null;
  let touchStartX = 0;
  let touchEndX = 0;

  // Konversi otomatis link Google Drive biasa menjadi Direct Image URL yang tidak diblokir browser
  function formatImageUrl(rawUrl) {
    if (!rawUrl) return '';
    let url = rawUrl.trim();
    // Three published, frequently viewed banners are mirrored as static GitHub
    // assets. Keep the D1 banner configuration and Drive URLs unchanged so
    // Superadmin can still reorder, disable or replace banners normally.
    const hostedBannerImages = {
      '1nOxXTLBEFCCYFD_t29ldzIDxpeJFWlZm': '/assets/banner-jersey.jpg',
      '1B6TIRYqGoNFN7tr78e-yhssvDK71cRRZ': '/assets/banner-gapura.jpg',
      '1DoYOS0C1Evu43mwJEnpohcos-Kj0a0-L': '/assets/banner-bank-sampah.jpg'
    };
    if (/^https:\/\/(?:drive\.google\.com|lh3\.googleusercontent\.com)\//i.test(url)) {
      const driveFile = url.match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]+)/);
      if (driveFile && hostedBannerImages[driveFile[1]]) return hostedBannerImages[driveFile[1]];
    }
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return url;
  }

  function initBanner() {
    if (typeof Papa === 'undefined' || !CSV_BANNER_URL) return;

    Papa.parse(CSV_BANNER_URL, {
      download: true,
      header: true,
      complete: function(results) {
        if (results && results.data) {
          bannerData = results.data.filter(row => {
            const values = Object.values(row);
            const photoUrl = values[1] || values[0];
            return photoUrl && photoUrl.toString().trim() !== '';
          });

          if (bannerData.length > 0) {
            renderBannerSlider();
            startAutoSlide();
            setupBannerGestures();
          }else{
            const track=document.getElementById('banner-track');
            if(track)track.textContent='Belum ada banner.';
          }
        }
      },
      error:function(err){
        const track=document.getElementById('banner-track');
        if(track){track.replaceChildren();
          const msg=document.createElement('p');msg.textContent='Banner belum dapat dimuat: '+(err.message||err);
          const retry=document.createElement('button');retry.type='button';retry.textContent='Coba Lagi';retry.onclick=initBanner;
          track.append(msg,retry);
        }
      }
    });
  }

  function renderBannerSlider() {
    const track = document.getElementById('banner-track');
    const dotsContainer = document.getElementById('banner-dots');
    if (!track) return;

    let trackHTML = '';
    let dotsHTML = '';

    bannerData.forEach((item, index) => {
      const values = Object.values(item);
      const rawImgUrl = values[1] || ''; // Kolom B: Link Foto
      const linkTarget = values[2] || '#'; // Kolom C: Link Tujuan

      const imgUrl = formatImageUrl(rawImgUrl);

      trackHTML += `
  <a href="${linkTarget}" class="w-full h-full flex-shrink-0 relative block overflow-hidden">
    <img src="${imgUrl}" alt="" class="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.02]" />
  </a>
`;

      dotsHTML += `
        <button onclick="window.goToBanner(${index})" class="banner-dot w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/50 transition-all ${index === 0 ? 'bg-white w-5 sm:w-6' : ''}"></button>
      `;
    });

    track.innerHTML = trackHTML;
    // Banner Bank Sampah lama diarahkan lewat shell agar tidak memuat portal bersarang di iframe.
    track.querySelectorAll('a[href]').forEach(anchor => {
      let destination;
      try { destination = new URL(anchor.getAttribute('href'), location.href); } catch { return; }
      if (destination.origin === location.origin && /(?:^|\/)banksampah(?:\.html|\/)?$/i.test(destination.pathname)) {
        anchor.addEventListener('click', event => {
          event.preventDefault();
          if (typeof window.f4GoBank === 'function') window.f4GoBank();
          else window.location.href = '/bank-sampah/';
        });
      }
    });
    if (dotsContainer) dotsContainer.innerHTML = dotsHTML;
    updateBannerPosition();
  }

  function updateBannerPosition() {
    const track = document.getElementById('banner-track');
    if (!track) return;

    track.style.transform = `translateX(-${currentBannerIndex * 100}%)`;

    const dots = document.querySelectorAll('.banner-dot');
    dots.forEach((dot, idx) => {
      if (idx === currentBannerIndex) {
        dot.className = 'banner-dot h-2 sm:h-2.5 rounded-full bg-white w-5 sm:w-6 transition-all';
      } else {
        dot.className = 'banner-dot w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/50 transition-all';
      }
    });
  }

  window.moveBanner = function(direction) {
    if (bannerData.length === 0) return;
    currentBannerIndex = (currentBannerIndex + direction + bannerData.length) % bannerData.length;
    updateBannerPosition();
    resetAutoSlide();
  };

  window.goToBanner = function(index) {
    currentBannerIndex = index;
    updateBannerPosition();
    resetAutoSlide();
  };

  function startAutoSlide() {
    if (bannerInterval) clearInterval(bannerInterval);
    bannerInterval = setInterval(() => { window.moveBanner(1); }, 4500);
  }

  function resetAutoSlide() {
    startAutoSlide();
  }

  function setupBannerGestures() {
    const container = document.getElementById('banner-slider-container');
    if (!container) return;

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 40;
      if (touchEndX < touchStartX - swipeThreshold) window.moveBanner(1);
      else if (touchEndX > touchStartX + swipeThreshold) window.moveBanner(-1);
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      const rect = container.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        if (e.key === 'ArrowLeft') window.moveBanner(-1);
        if (e.key === 'ArrowRight') window.moveBanner(1);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();

    // Projek Portal Utama langsung dari D1. Tidak ada sumber CSV atau fallback kartu statis.
    const PROJECT_API='https://api.flamboyan4.web.id/api/v2/public/portal';
    const f4ProjectNumber=value=>Number.isFinite(Number(value))?Number(value):0;
    const f4ProjectRp=value=>'Rp '+f4ProjectNumber(value).toLocaleString('id-ID');
    const f4ProjectType=(value)=>String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
    const f4ProjectBadge=(value)=>{
      const st=String(value||'').toLowerCase();
      if(st.includes('selesai'))return 'bg-emerald-100 text-emerald-800';
      if(st.includes('dana')||st.includes('dp')||st.includes('cicil'))return 'bg-amber-100 text-amber-800';
      return 'bg-indigo-100 text-indigo-800';
    };
    function f4ProjectCardEl(tag,cls,text){
      const element=document.createElement(tag);
      if(cls)element.className=cls;
      if(text!==undefined)element.textContent=String(text);
      return element;
    }
    function f4ProjectImage(source){
      const raw=String(source||'').trim();
      const file=raw.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)||
        raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if(file)return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(file[1])+'&sz=w640';
      return /^https:\/\//i.test(raw)&&!/drive\.google\.com\/drive\/folders\//i.test(raw)?raw:'';
    }
    function f4ProjectLink(raw){
      const t=String(raw||'').trim();
      // Samakan tautan lama dengan path asli Portal Bank Sampah.
      if(/^\/banksampah\/?$/i.test(t))return '/bank-sampah/';
      if(/^\/(?!\/)[a-zA-Z0-9_/#?=&%.-]*$/.test(t)||/^#[a-zA-Z0-9_-]+$/.test(t))return t;
      try{const u=new URL(t);return u.protocol==='https:'?u.href:'';}catch{return ''}
    }
    function f4ProjectStatus(row){
      const description=String(row.description||'').trim();
      if(description.length&&description.length<=34)return description;
      const names={informasi:'Kegiatan',kas:'Dana Kas',penggalangan:'Penggalangan Dana',pesanan:'Pemesanan Barang',portal:'Portal Terhubung'};
      return names[row.project_kind]||'Aktif';
    }
    function f4ProjectGeneric(row){
      const container=f4ProjectCardEl('article',
        'snap-start shrink-0 w-[88%] sm:w-[340px] md:w-[360px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col');
      container.dataset.dynamicProject='true';
      container.dataset.projectId=String(row.id||'');
      container.style.order=String(Number(row.sort_order)||0);
      const header=f4ProjectCardEl('div','flex items-center justify-between gap-2 mb-3');
      header.append(
        f4ProjectCardEl('h4','font-bold text-slate-900 text-base min-w-0',row.title||'Proyek warga'),
        f4ProjectCardEl('span','text-[10px] font-semibold rounded-full px-2 py-1 shrink-0 '+f4ProjectBadge(f4ProjectStatus(row)),f4ProjectStatus(row))
      );
      container.append(header);
      const photo=f4ProjectImage(row.image_ref);
      if(photo){
        const img=f4ProjectCardEl('img','w-full h-28 object-contain rounded-lg bg-slate-50 mb-3');
        img.src=photo;img.loading='lazy';img.alt='Foto proyek '+String(row.title||'');container.append(img);
      }
      const desc=String(row.description||'').trim();
      if(desc&&desc!==f4ProjectStatus(row))container.append(f4ProjectCardEl('p','text-xs text-slate-600 leading-relaxed mb-3',desc));
      const kind=String(row.project_kind||'informasi');
      const stat=row.ringkasan||{},goal=f4ProjectNumber(row.fund_target_rp);
      const money=kind==='kas'?f4ProjectNumber(stat.danaMasukRp)-f4ProjectNumber(stat.danaKeluarRp):
        f4ProjectNumber(stat.danaMasukRp);
      const panel=f4ProjectCardEl('div','rounded-xl bg-emerald-50/70 border border-emerald-100 px-3 py-3 mt-auto');
      const add=(name,value)=>{const line=f4ProjectCardEl('div','flex justify-between items-start gap-3 text-xs py-1');
        line.append(f4ProjectCardEl('span','text-slate-600',name),f4ProjectCardEl('strong','text-right font-bold text-emerald-800',value));panel.append(line)};
      if(kind==='pesanan'){
        add('Pesanan',f4ProjectNumber(stat.jumlahPesanan)+' orang');
        add('Lunas',f4ProjectNumber(stat.lunas)+' pesanan');
        add('Dana diterima',f4ProjectRp(money));
        add('Sisa tagihan',f4ProjectRp(Math.max(0,f4ProjectNumber(stat.totalTagihanRp)-money)));
      }else if(kind==='kas'||kind==='penggalangan'){
        if(kind==='kas'&&!String(row.fund_source||'').trim())add('Sumber kas','Belum diatur');
        else add(kind==='kas'?'Saldo dana terkait':'Dana terkumpul',f4ProjectRp(money));
        if(goal>0){
          add('Target',f4ProjectRp(goal));add('Kekurangan',f4ProjectRp(Math.max(0,goal-money)));
          const line=f4ProjectCardEl('div','w-full h-2 rounded-full bg-emerald-100 mt-2 overflow-hidden');
          const fill=f4ProjectCardEl('div','h-full rounded-full bg-emerald-600');
          fill.style.width=Math.max(0,Math.min(100,money/goal*100))+'%';line.append(fill);panel.append(line);
        }
        if(kind==='penggalangan')add('Kontributor',f4ProjectNumber(stat.jumlahKontributor)+' orang');
      }else if(kind==='portal'){
        add('Jenis','Terhubung portal');
      }else{
        add('Informasi','Proyek lingkungan');
      }
      container.append(panel);
      const link=f4ProjectLink(row.target_url)||
        (String(row.linked_key||'')==='bank-sampah'?'/bank-sampah/':'');
      if(link){
        const action=f4ProjectCardEl('a','mt-3 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 rounded-lg border border-indigo-100 text-xs text-center','Buka Projek');
        action.href=link;container.append(action);
      }
      return container;
    }
    // Untuk Gapura: saldo kas SELURUH Pembukuan, termasuk saldo awal serah-terima.
    // Kategori transaksi tetap tersedia bagi Project Card kas lainnya.
    async function f4ProjectFullCashBalance(){
      const response=await fetch('https://api.flamboyan4.web.id/api/v2/public/portal/cash',{
        cache:'no-store',headers:{Accept:'application/json'}
      });
      const data=await response.json().catch(()=>null);
      const rows=data?.data?.rows;
      if(!response.ok||data?.ok!==true||!Array.isArray(rows))
        throw Error(data?.error||'Saldo kas belum tersedia.');
      const balance=rows.reduce((sum,item)=>{
        const debit=Number(item.debit),kredit=Number(item.kredit);
        if(!Number.isSafeInteger(debit)||!Number.isSafeInteger(kredit)||
           debit<0||kredit<0||(debit>0&&kredit>0)||(debit===0&&kredit===0))
          throw Error('Jurnal kas memerlukan pemeriksaan.');
        return sum+debit-kredit;
      },0);
      if(!Number.isSafeInteger(balance))throw Error('Saldo kas tidak valid.');
      return balance;
    }
    async function loadProjectCards(){
      let fullCashPromise;
      const slider=document.getElementById('slider-projek');
      if(!slider)return;
      const known={
        'bank-sampah':document.getElementById('bank-sampah'),
        gapura:document.getElementById('gapura'),
        jersey:document.getElementById('jersey')
      };
      Object.values(known).forEach(card=>{if(card)card.dataset.f4ProjectInactive='true'});
      slider.querySelectorAll('[data-dynamic-project="true"]').forEach(card=>card.remove());
      let empty=document.getElementById('f4-project-empty');
      if(!empty){empty=f4ProjectCardEl('p','text-xs text-slate-500 w-full py-4','Memuat proyek…');empty.id='f4-project-empty';slider.append(empty);}
      try{
        const response=await fetch(PROJECT_API,{cache:'no-store',headers:{Accept:'application/json'}});
        if(!response.ok)throw Error('HTTP '+response.status);
        const data=await response.json();
        if(data.ok===false||!Array.isArray(data.projects))throw Error(data.error||'Data proyek tidak tersedia');
        const used=new Set();
        const rows=data.projects.filter(row=>row&&row.active!==false&&String(row.active??1)!=='0')
          .sort((a,b)=>f4ProjectNumber(a.sort_order)-f4ProjectNumber(b.sort_order));
        for(const row of rows){
          const key=String(row.linked_key||'').trim();
          const title=f4ProjectType(row.title);
          let special=key==='bank-sampah'?'bank-sampah':key==='jersey'?'jersey':
            title==='banksampahlorong'?'bank-sampah':title==='gapura'?'gapura':
            ['pemesananjersey','jersey'].includes(title)?'jersey':'';
          // Tipe Pemesanan Barang lainnya tidak boleh menumpang tabel Jersey lama.
          if(row.project_kind==='pesanan'&&key!=='jersey'&&!['pemesananjersey','jersey'].includes(title))special='';
          let card=known[special];
          if(card&&!used.has(special)){
            used.add(special);card.dataset.f4ProjectInactive='false';
            card.style.order=String(f4ProjectNumber(row.sort_order));
            const titles={'bank-sampah':'project-title-banksampah',gapura:'project-title-gapura',jersey:'project-title-jersey'};
            const t=document.getElementById(titles[special]);if(t)t.textContent=String(row.title||t.textContent);
            const status=special==='bank-sampah'?'bs-status-badge':special==='gapura'?'project-status-gapura':'project-status-jersey';
            const badge=document.getElementById(status);
            if(badge){badge.textContent=f4ProjectStatus(row);badge.className='text-[10px] font-semibold rounded-full px-2 py-0.5 '+f4ProjectBadge(f4ProjectStatus(row));}
            if(special==='gapura'){
              const target=document.getElementById('gapura-target');
              if(target)target.textContent=Number(row.fund_target_rp)>0?f4ProjectRp(row.fund_target_rp):'Belum diatur';
              const fromKas=row.project_kind==='kas';
              const progressLabel=document.getElementById('gapura-percent')?.previousElementSibling;
              if(progressLabel)progressLabel.textContent=fromKas?'Kas / Target':'Progres Dana';
              const availableLabel=document.getElementById('gapura-terkumpul')?.previousElementSibling;
              if(availableLabel){
                availableLabel.textContent=fromKas?'Saldo Kas':'Terkumpul';
                availableLabel.title=fromKas?'Saldo seluruh kas Pembukuan, bukan dana khusus Gapura.':'';
              }
            }
            if(special==='gapura'&&['kas','penggalangan'].includes(row.project_kind)){
              const fromKas=row.project_kind==='kas';
              const goal=f4ProjectNumber(row.fund_target_rp);
              try{
                // Saldo kas Gapura harus persis seperti "Saldo Kas" di Portal Utama:
                // seluruh debit-kredit jurnal aktif, bukan satu kategori kas saja.
                if(fromKas&&!fullCashPromise)fullCashPromise=f4ProjectFullCashBalance();
                const money=fromKas?await fullCashPromise:
                  f4ProjectNumber(row.ringkasan?.danaMasukRp);
                const percent=goal>0?Math.max(0,Math.min(100,money/goal*100)):0;
                const labels=[
                  ['gapura-terkumpul',f4ProjectRp(money)],
                  ['gapura-kurang',goal?f4ProjectRp(Math.max(0,goal-money)):'—'],
                  ['gapura-percent',goal?Math.round(percent)+'%':'—']
                ];
                labels.forEach(([id,value])=>{const node=document.getElementById(id);if(node)node.textContent=value});
                const bar=document.getElementById('gapura-progress-bar');
                if(bar)bar.style.width=percent+'%';
              }catch(error){
                console.warn('Saldo kas Gapura belum tersedia:',error);
                const labels=[['gapura-terkumpul','Tidak tersedia'],['gapura-kurang','—'],['gapura-percent','—']];
                labels.forEach(([id,value])=>{const node=document.getElementById(id);if(node)node.textContent=value});
                const bar=document.getElementById('gapura-progress-bar');
                if(bar)bar.style.width='0%';
              }
            }
            continue;
          }
          slider.append(f4ProjectGeneric(row));
        }
        empty.textContent=rows.length?'':'Belum ada projek.';
        empty.hidden=rows.length>0;
        if(window.lucide)window.lucide.createIcons();
      }catch(error){
        // No stale project and no ghost card after a failed public D1 request.
        empty.hidden=false;empty.textContent='Projek gagal dimuat. Coba muat ulang.';
        console.warn('Project Card D1:',error);
      }
    }
    document.addEventListener('DOMContentLoaded',loadProjectCards);


    // URL CSV Progres Bank Sampah
// Bank Sampah progress card reads D1 through the existing public Worker API.
function formatDriveImgUrl(url) {
  if (!url) return '';
  const match = String(url).match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? 'https://lh3.googleusercontent.com/d/' + match[1] : String(url);
}
async function loadProgresBankSampahIndex(){
 const target=document.getElementById('bs-step-title');if(!target)return;
 const card=target.closest('.group')||target.closest('[id*=project]')||target.parentElement;
 try{
  const response=await fetch('https://api.flamboyan4.web.id/api/v2/public/bank',{mode:'cors',cache:'no-store'});
  const payload=await response.json();
  if(!response.ok||payload.ok===false)throw Error(payload.error||'HTTP '+response.status);
  const progress=Array.isArray(payload.progress)?payload.progress:[];
  const items=progress.map(row=>({
   title:String(row.title||row.judul||row.name||'Perkembangan Bank Sampah'),
   stage:String(row.stage||row.langkah||'Tahap perkembangan'),
   description:String(row.description||row.deskripsi||''),
   status:String(row.status||''),
   date:String(row.happened_on||row.tanggal||row.date||''),
   next:String(row.next_step||row.nextStep||row.agenda||row.nextAgenda||''),
   photo:String(row.photo_url||row.photoUrl||row.foto||row.imageUrl||'')
  })).sort((a,b)=>b.date.localeCompare(a.date));
  // Card Bank Sampah menampilkan progres terbaru sekali saja pada banner, bukan daftar berulang.
  document.getElementById('bs-project-timeline')?.remove();
  if(!items.length){
   target.textContent='Belum ada perkembangan';
   return;
  }
  const active=items[0]; // satu progres terbaru menurut tanggal
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value||'—')};
  set('bs-step-tag','Terbaru');
  set('bs-step-title',active.title);
  set('bs-info-1','Tahap: '+active.stage.replace(/^Tahap:\s*/i,''));
  set('bs-info-2',active.next?'Agenda: '+active.next.replace(/^Agenda:\s*/i,''):'Status: '+(active.status||'Dicatat'));
  const photo=document.getElementById('bs-step-img');
  if(photo){const img=formatDriveImgUrl(active.photo);if(img)photo.src=img;photo.alt='Dokumentasi '+active.title;}
  const status=document.getElementById('bs-status-badge');
  if(status)status.textContent=active.status||'Aktif';
 }catch(error){
  console.error('Progres Bank Sampah tidak dapat dimuat:',error);
  const host=document.getElementById('bs-step-title');
  if(host)host.textContent='Perkembangan belum tersedia';
  const txt=document.getElementById('bs-step-desc');
  if(txt)txt.textContent='Info Bank Sampah belum tersedia.';
 }
}

// Jalankan otomatis saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadProgresBankSampahIndex);
    
  
