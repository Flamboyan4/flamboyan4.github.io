/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/home-legacy.js",function(__f4){

__f4.expose("scrollToTop",()=>scrollToTop,value=>scrollToTop=value);
__f4.expose("activeModalsStack",()=>activeModalsStack,value=>activeModalsStack=value);
__f4.expose("f4ModalPreviousFocus",()=>f4ModalPreviousFocus,null);
__f4.expose("f4ModalTabbables",()=>f4ModalTabbables,null);
__f4.expose("suppressNextModalPopstate",()=>suppressNextModalPopstate,value=>suppressNextModalPopstate=value);
__f4.expose("openModal",()=>openModal,value=>openModal=value);
__f4.expose("closeModalDirect",()=>closeModalDirect,value=>closeModalDirect=value);
__f4.expose("closeLightboxModal",()=>closeLightboxModal,value=>closeLightboxModal=value);
__f4.expose("disableInspect",()=>disableInspect,value=>disableInspect=value);
__f4.expose("salinNorekEx",()=>salinNorekEx,value=>salinNorekEx=value);
__f4.expose("CSV_DOKUMENTASI_URL",()=>CSV_DOKUMENTASI_URL,null);
__f4.expose("CSV_INVENTARIS_WARGA_URL",()=>CSV_INVENTARIS_WARGA_URL,null);
__f4.expose("CSV_ARISAN_URL",()=>CSV_ARISAN_URL,null);
__f4.expose("CSV_RENCANA_URL",()=>CSV_RENCANA_URL,null);
__f4.expose("CSV_JERSEY_BAPAK_URL",()=>CSV_JERSEY_BAPAK_URL,null);
__f4.expose("CSV_JERSEY_IBU_URL",()=>CSV_JERSEY_IBU_URL,null);
__f4.expose("FOLDER_JERSEY_URL",()=>FOLDER_JERSEY_URL,null);
__f4.expose("FOLDER_GAPURA_URL",()=>FOLDER_GAPURA_URL,null);
__f4.expose("firebaseConfig",()=>firebaseConfig,null);
__f4.expose("dbRef",()=>dbRef,null);
__f4.expose("TARGET_DANA_GAPURA",()=>TARGET_DANA_GAPURA,null);
__f4.expose("PLACEHOLDER_IMG",()=>PLACEHOLDER_IMG,null);
__f4.expose("currentMediaList",()=>currentMediaList,value=>currentMediaList=value);
__f4.expose("globalDokumentasiPreview",()=>globalDokumentasiPreview,value=>globalDokumentasiPreview=value);
__f4.expose("dokumentasiPreviewIndex",()=>dokumentasiPreviewIndex,value=>dokumentasiPreviewIndex=value);
__f4.expose("dokumentasiPreviewTimer",()=>dokumentasiPreviewTimer,value=>dokumentasiPreviewTimer=value);
__f4.expose("currentPhotoIndex",()=>currentPhotoIndex,value=>currentPhotoIndex=value);
__f4.expose("currentPhotoCaption",()=>currentPhotoCaption,value=>currentPhotoCaption=value);
__f4.expose("globalKeuanganData",()=>globalKeuanganData,value=>globalKeuanganData=value);
__f4.expose("globalArisanData",()=>globalArisanData,value=>globalArisanData=value);
__f4.expose("globalJerseyBapakData",()=>globalJerseyBapakData,value=>globalJerseyBapakData=value);
__f4.expose("globalJerseyIbuData",()=>globalJerseyIbuData,value=>globalJerseyIbuData=value);
__f4.expose("globalJerseyAnakData",()=>globalJerseyAnakData,value=>globalJerseyAnakData=value);
__f4.expose("currentJerseyTab",()=>currentJerseyTab,value=>currentJerseyTab=value);
__f4.expose("globalRencanaData",()=>globalRencanaData,value=>globalRencanaData=value);
__f4.expose("currentArisanIdxGlobal",()=>currentArisanIdxGlobal,value=>currentArisanIdxGlobal=value);
__f4.expose("nextArisanIdxGlobal",()=>nextArisanIdxGlobal,value=>nextArisanIdxGlobal=value);
__f4.expose("arisanLastMonthKey",()=>arisanLastMonthKey,value=>arisanLastMonthKey=value);
__f4.expose("monthlyKeuanganList",()=>monthlyKeuanganList,value=>monthlyKeuanganList=value);
__f4.expose("currentPemasukanMonthIndex",()=>currentPemasukanMonthIndex,value=>currentPemasukanMonthIndex=value);
__f4.expose("currentPengeluaranMonthIndex",()=>currentPengeluaranMonthIndex,value=>currentPengeluaranMonthIndex=value);
__f4.expose("calendarDate",()=>calendarDate,value=>calendarDate=value);
__f4.expose("formatRupiah",()=>formatRupiah,value=>formatRupiah=value);
__f4.expose("extractFolderId",()=>extractFolderId,value=>extractFolderId=value);
__f4.expose("extractDriveFileId",()=>extractDriveFileId,value=>extractDriveFileId=value);
__f4.expose("fixDriveUrl",()=>fixDriveUrl,value=>fixDriveUrl=value);
__f4.expose("globalKomentarList",()=>globalKomentarList,value=>globalKomentarList=value);
__f4.expose("F4_FEEDBACK_API",()=>F4_FEEDBACK_API,null);
__f4.expose("insertEmoticon",()=>insertEmoticon,value=>insertEmoticon=value);
__f4.expose("renderKomentarWarga",()=>renderKomentarWarga,value=>renderKomentarWarga=value);
__f4.expose("listenKomentarFirebase",()=>listenKomentarFirebase,value=>listenKomentarFirebase=value);
__f4.expose("f4SetChatCompose",()=>f4SetChatCompose,value=>f4SetChatCompose=value);
__f4.expose("f4LastChatAt",()=>f4LastChatAt,value=>f4LastChatAt=value);
__f4.expose("tambahKomentarWarga",()=>tambahKomentarWarga,value=>tambahKomentarWarga=value);
__f4.expose("currentKeuanganFilterType",()=>currentKeuanganFilterType,value=>currentKeuanganFilterType=value);
__f4.expose("f4CanReadKas",()=>f4CanReadKas,value=>f4CanReadKas=value);
__f4.expose("openModalKeuangan",()=>openModalKeuangan,value=>openModalKeuangan=value);
__f4.expose("openModalKeuanganFiltered",()=>openModalKeuanganFiltered,value=>openModalKeuanganFiltered=value);
__f4.expose("openModalArisan",()=>openModalArisan,value=>openModalArisan=value);
__f4.expose("openModalJersey",()=>openModalJersey,value=>openModalJersey=value);
__f4.expose("openModalDokumentasi",()=>openModalDokumentasi,value=>openModalDokumentasi=value);
__f4.expose("openModalSaran",()=>openModalSaran,value=>openModalSaran=value);
__f4.expose("openModalEventDetail",()=>openModalEventDetail,value=>openModalEventDetail=value);
__f4.expose("salinLinkAgenda",()=>salinLinkAgenda,value=>salinLinkAgenda=value);
__f4.expose("f4PortalPhotoIndexPromise",()=>f4PortalPhotoIndexPromise,value=>f4PortalPhotoIndexPromise=value);
__f4.expose("f4ReadPortalPhotoIndex",()=>f4ReadPortalPhotoIndex,value=>f4ReadPortalPhotoIndex=value);
__f4.expose("f4ProjectFolderItems",()=>f4ProjectFolderItems,value=>f4ProjectFolderItems=value);
__f4.expose("f4LoadProjectFolderItems",()=>f4LoadProjectFolderItems,value=>f4LoadProjectFolderItems=value);
__f4.expose("f4ProjectGalleryRequest",()=>f4ProjectGalleryRequest,value=>f4ProjectGalleryRequest=value);
__f4.expose("openGalleryGridModal",()=>openGalleryGridModal,value=>openGalleryGridModal=value);
__f4.expose("openLightboxFromIndex",()=>openLightboxFromIndex,value=>openLightboxFromIndex=value);
__f4.expose("nextLightboxMedia",()=>nextLightboxMedia,value=>nextLightboxMedia=value);
__f4.expose("prevLightboxMedia",()=>prevLightboxMedia,value=>prevLightboxMedia=value);
__f4.expose("zoomScale",()=>zoomScale,value=>zoomScale=value);
__f4.expose("translateX",()=>translateX,value=>translateX=value);
__f4.expose("translateY",()=>translateY,value=>translateY=value);
__f4.expose("startDist",()=>startDist,value=>startDist=value);
__f4.expose("startScale",()=>startScale,value=>startScale=value);
__f4.expose("isDragging",()=>isDragging,value=>isDragging=value);
__f4.expose("startX",()=>startX,value=>startX=value);
__f4.expose("startY",()=>startY,value=>startY=value);
__f4.expose("lastTapTime",()=>lastTapTime,value=>lastTapTime=value);
__f4.expose("lightboxTouchStartX",()=>lightboxTouchStartX,value=>lightboxTouchStartX=value);
__f4.expose("lightboxTouchStartY",()=>lightboxTouchStartY,value=>lightboxTouchStartY=value);
__f4.expose("lightboxTouchEndX",()=>lightboxTouchEndX,value=>lightboxTouchEndX=value);
__f4.expose("lightboxTouchEndY",()=>lightboxTouchEndY,value=>lightboxTouchEndY=value);
__f4.expose("initLightboxSwipe",()=>initLightboxSwipe,value=>initLightboxSwipe=value);
__f4.expose("handleLightboxSwipe",()=>handleLightboxSwipe,value=>handleLightboxSwipe=value);
__f4.expose("applyTransform",()=>applyTransform,value=>applyTransform=value);
__f4.expose("resetLightboxZoom",()=>resetLightboxZoom,value=>resetLightboxZoom=value);
__f4.expose("initImageZoomEvents",()=>initImageZoomEvents,value=>initImageZoomEvents=value);
__f4.expose("updateLightboxView",()=>updateLightboxView,value=>updateLightboxView=value);
__f4.expose("initCardGesturesAndKeyboard",()=>initCardGesturesAndKeyboard,value=>initCardGesturesAndKeyboard=value);
__f4.expose("setupCardInteractions",()=>setupCardInteractions,value=>setupCardInteractions=value);
__f4.expose("initHomeSummarySlides",()=>initHomeSummarySlides,value=>initHomeSummarySlides=value);
__f4.expose("f4ProjectSnapPositions",()=>f4ProjectSnapPositions,value=>f4ProjectSnapPositions=value);
__f4.expose("scrollProjek",()=>scrollProjek,value=>scrollProjek=value);
__f4.expose("initProjectCarousel",()=>initProjectCarousel,value=>initProjectCarousel=value);
__f4.expose("formSaran",()=>formSaran,null);
__f4.expose("f4LastSuggestionAt",()=>f4LastSuggestionAt,value=>f4LastSuggestionAt=value);
__f4.expose("formatTanggalKeuanganDisplay",()=>formatTanggalKeuanganDisplay,value=>formatTanggalKeuanganDisplay=value);
__f4.expose("renderTableRow",()=>renderTableRow,value=>renderTableRow=value);
__f4.expose("f4CashDesktopMedia",()=>f4CashDesktopMedia,null);
__f4.expose("renderKasWargaTransactions",()=>renderKasWargaTransactions,value=>renderKasWargaTransactions=value);
__f4.expose("filterKasWargaByDate",()=>filterKasWargaByDate,value=>filterKasWargaByDate=value);
__f4.expose("clearKasWargaDate",()=>clearKasWargaDate,value=>clearKasWargaDate=value);
__f4.expose("renderArisanRow",()=>renderArisanRow,value=>renderArisanRow=value);
__f4.expose("filterArisanModal",()=>filterArisanModal,value=>filterArisanModal=value);
__f4.expose("filterKeuanganModal",()=>filterKeuanganModal,value=>filterKeuanganModal=value);
__f4.expose("parseRowDate",()=>parseRowDate,value=>parseRowDate=value);
__f4.expose("currentSaldoMonthIndex",()=>currentSaldoMonthIndex,value=>currentSaldoMonthIndex=value);
__f4.expose("updateSaldoCardView",()=>updateSaldoCardView,value=>updateSaldoCardView=value);
__f4.expose("changeMonthSaldo",()=>changeMonthSaldo,value=>changeMonthSaldo=value);
__f4.expose("updatePemasukanCardView",()=>updatePemasukanCardView,value=>updatePemasukanCardView=value);
__f4.expose("updatePengeluaranCardView",()=>updatePengeluaranCardView,value=>updatePengeluaranCardView=value);
__f4.expose("changeMonthPemasukan",()=>changeMonthPemasukan,value=>changeMonthPemasukan=value);
__f4.expose("changeMonthPengeluaran",()=>changeMonthPengeluaran,value=>changeMonthPengeluaran=value);
__f4.expose("bulanNamaCetakKas",()=>bulanNamaCetakKas,null);
__f4.expose("isiSelectBulanCetakKas",()=>isiSelectBulanCetakKas,value=>isiSelectBulanCetakKas=value);
__f4.expose("openModalCetakKas",()=>openModalCetakKas,value=>openModalCetakKas=value);
__f4.expose("closeModalCetakKas",()=>closeModalCetakKas,value=>closeModalCetakKas=value);
__f4.expose("updateCetakKasFields",()=>updateCetakKasFields,value=>updateCetakKasFields=value);
__f4.expose("escapeCetakKas",()=>escapeCetakKas,value=>escapeCetakKas=value);
__f4.expose("nominalCetakKas",()=>nominalCetakKas,value=>nominalCetakKas=value);
__f4.expose("cetakLaporanKas",()=>cetakLaporanKas,value=>cetakLaporanKas=value);
__f4.expose("f4PublicCashReadableNote",()=>f4PublicCashReadableNote,value=>f4PublicCashReadableNote=value);
__f4.expose("f4CashLoadGeneration",()=>f4CashLoadGeneration,value=>f4CashLoadGeneration=value);
__f4.expose("loadKeuanganDariPembukuan",()=>loadKeuanganDariPembukuan,value=>loadKeuanganDariPembukuan=value);
__f4.expose("f4ArisanMonthNames",()=>f4ArisanMonthNames,null);
__f4.expose("f4ArisanCurrentPeriod",()=>f4ArisanCurrentPeriod,value=>f4ArisanCurrentPeriod=value);
__f4.expose("f4ArisanRowPeriod",()=>f4ArisanRowPeriod,value=>f4ArisanRowPeriod=value);
__f4.expose("refreshArisanCards",()=>refreshArisanCards,value=>refreshArisanCards=value);
__f4.expose("checkArisanMonthChange",()=>checkArisanMonthChange,value=>checkArisanMonthChange=value);
__f4.expose("getNominalHargaJerseyRow",()=>getNominalHargaJerseyRow,value=>getNominalHargaJerseyRow=value);
__f4.expose("getStatusJerseyRow",()=>getStatusJerseyRow,value=>getStatusJerseyRow=value);
__f4.expose("getJerseyTerimaEksplisit",()=>getJerseyTerimaEksplisit,value=>getJerseyTerimaEksplisit=value);
__f4.expose("getNominalJerseyMasuk",()=>getNominalJerseyMasuk,value=>getNominalJerseyMasuk=value);
__f4.expose("switchJerseyTab",()=>switchJerseyTab,value=>switchJerseyTab=value);
__f4.expose("escapeJerseyText",()=>escapeJerseyText,value=>escapeJerseyText=value);
__f4.expose("jerseyPublicBackParts",()=>jerseyPublicBackParts,value=>jerseyPublicBackParts=value);
__f4.expose("renderJerseyRow",()=>renderJerseyRow,value=>renderJerseyRow=value);
__f4.expose("filterJerseyModal",()=>filterJerseyModal,value=>filterJerseyModal=value);
__f4.expose("calculateTotalJerseyRekap",()=>calculateTotalJerseyRekap,value=>calculateTotalJerseyRekap=value);
__f4.expose("scrollDokumentasi",()=>scrollDokumentasi,value=>scrollDokumentasi=value);
__f4.expose("updateDokumentasiPreview",()=>updateDokumentasiPreview,value=>updateDokumentasiPreview=value);
__f4.expose("mulaiRotasiDokumentasiPreview",()=>mulaiRotasiDokumentasiPreview,value=>mulaiRotasiDokumentasiPreview=value);
__f4.expose("openDokumentasiPreviewAktif",()=>openDokumentasiPreviewAktif,value=>openDokumentasiPreviewAktif=value);
__f4.expose("openInventarisWargaFoto",()=>openInventarisWargaFoto,value=>openInventarisWargaFoto=value);
__f4.expose("loadInventarisWarga",()=>loadInventarisWarga,value=>loadInventarisWarga=value);
__f4.expose("f4AgendaPreview",()=>f4AgendaPreview,null);
__f4.expose("f4AgendaPagination",()=>f4AgendaPagination,null);
__f4.expose("f4OpenAgendaKey",()=>f4OpenAgendaKey,value=>f4OpenAgendaKey=value);
__f4.expose("f4AgendaSignature",()=>f4AgendaSignature,value=>f4AgendaSignature=value);
__f4.expose("f4AgendaKey",()=>f4AgendaKey,value=>f4AgendaKey=value);
__f4.expose("f4SyncAgendaCards",()=>f4SyncAgendaCards,value=>f4SyncAgendaCards=value);
__f4.expose("f4ToggleAgendaCalendar",()=>f4ToggleAgendaCalendar,value=>f4ToggleAgendaCalendar=value);
__f4.expose("f4AgendaCurrentIndex",()=>f4AgendaCurrentIndex,value=>f4AgendaCurrentIndex=value);
__f4.expose("f4UpdateAgendaPagination",()=>f4UpdateAgendaPagination,value=>f4UpdateAgendaPagination=value);
__f4.expose("f4AgendaPreviewCard",()=>f4AgendaPreviewCard,value=>f4AgendaPreviewCard=value);
__f4.expose("f4AgendaRow",()=>f4AgendaRow,value=>f4AgendaRow=value);
__f4.expose("f4BaseAgenda",()=>f4BaseAgenda,value=>f4BaseAgenda=value);
__f4.expose("f4BankAgenda",()=>f4BankAgenda,value=>f4BankAgenda=value);
__f4.expose("f4AgendaReady",()=>f4AgendaReady,value=>f4AgendaReady=value);
__f4.expose("f4BankAgendaBusy",()=>f4BankAgendaBusy,value=>f4BankAgendaBusy=value);
__f4.expose("f4BankAgendaCheckedAt",()=>f4BankAgendaCheckedAt,value=>f4BankAgendaCheckedAt=value);
__f4.expose("f4AgendaToday",()=>f4AgendaToday,null);
__f4.expose("f4AgendaTodayKey",()=>f4AgendaTodayKey,value=>f4AgendaTodayKey=value);
__f4.expose("f4ScheduleDate",()=>f4ScheduleDate,value=>f4ScheduleDate=value);
__f4.expose("f4BankScheduleRows",()=>f4BankScheduleRows,value=>f4BankScheduleRows=value);
__f4.expose("f4UpdateUnifiedAgenda",()=>f4UpdateUnifiedAgenda,value=>f4UpdateUnifiedAgenda=value);
__f4.expose("f4RefreshBankAgenda",()=>f4RefreshBankAgenda,value=>f4RefreshBankAgenda=value);
__f4.expose("f4InitialBankAgenda",()=>f4InitialBankAgenda,null);
__f4.expose("f4RenderAgenda",()=>f4RenderAgenda,value=>f4RenderAgenda=value);
__f4.expose("renderCalendar",()=>renderCalendar,value=>renderCalendar=value);
__f4.expose("changeMonth",()=>changeMonth,value=>changeMonth=value);
__f4.expose("resetToCurrentMonth",()=>resetToCurrentMonth,value=>resetToCurrentMonth=value);
__f4.expose("touchStartX",()=>touchStartX,value=>touchStartX=value);
__f4.expose("touchStartY",()=>touchStartY,value=>touchStartY=value);
__f4.expose("touchEndX",()=>touchEndX,value=>touchEndX=value);
__f4.expose("touchEndY",()=>touchEndY,value=>touchEndY=value);
__f4.expose("calWrapper",()=>calWrapper,null);
__f4.expose("handleCalendarSwipe",()=>handleCalendarSwipe,value=>handleCalendarSwipe=value);
__f4.expose("PROJECT_API",()=>PROJECT_API,null);
__f4.expose("f4ProjectNumber",()=>f4ProjectNumber,null);
__f4.expose("f4ProjectRp",()=>f4ProjectRp,null);
__f4.expose("f4ProjectType",()=>f4ProjectType,null);
__f4.expose("f4ProjectBadge",()=>f4ProjectBadge,null);
__f4.expose("f4ProjectCardEl",()=>f4ProjectCardEl,value=>f4ProjectCardEl=value);
__f4.expose("f4ProjectImage",()=>f4ProjectImage,value=>f4ProjectImage=value);
__f4.expose("f4ProjectLink",()=>f4ProjectLink,value=>f4ProjectLink=value);
__f4.expose("f4ProjectStatus",()=>f4ProjectStatus,value=>f4ProjectStatus=value);
__f4.expose("f4ProjectGeneric",()=>f4ProjectGeneric,value=>f4ProjectGeneric=value);
__f4.expose("f4ProjectCashMessage",()=>f4ProjectCashMessage,value=>f4ProjectCashMessage=value);
__f4.expose("f4ProjectFullCashBalance",()=>f4ProjectFullCashBalance,value=>f4ProjectFullCashBalance=value);
__f4.expose("f4ProjectLoadGeneration",()=>f4ProjectLoadGeneration,value=>f4ProjectLoadGeneration=value);
__f4.expose("loadProjectCards",()=>loadProjectCards,value=>loadProjectCards=value);
__f4.expose("f4BankProjectFallback",()=>f4BankProjectFallback,null);
__f4.expose("f4BankProjectPhotoCandidates",()=>f4BankProjectPhotoCandidates,value=>f4BankProjectPhotoCandidates=value);
__f4.expose("f4SetBankProjectPhoto",()=>f4SetBankProjectPhoto,value=>f4SetBankProjectPhoto=value);
__f4.expose("loadProgresBankSampahIndex",()=>loadProgresBankSampahIndex,value=>loadProgresBankSampahIndex=value);
/* Extracted verbatim from inline home script, 20261028-maintenance. Keep classic synchronous loading and global handlers intact. */

    // BERSIHKAN BUNTUT #index.html DAN HASHTAG MODAL DARI SEARCH BAR BROWSER
    if (__f4.window.location.hash || __f4.window.location.pathname.endsWith('index.html')) {
      __f4.globals.history.replaceState(null, __f4.globals.document.title, __f4.window.location.pathname.replace(/index\.html$/, '') + __f4.window.location.search);
    }

    __f4.globals.lucide.createIcons();

    __f4.window.addEventListener('scroll', function() {
      const btnScroll = __f4.globals.document.getElementById('btn-scroll-top');
      if (!btnScroll) return;
      if (__f4.window.scrollY > 250) {
        btnScroll.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        btnScroll.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
      } else {
        btnScroll.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        btnScroll.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
      }
    });

    function scrollToTop() {
      __f4.window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // SYSTEM CONTROL MODAL & HANDLER TOMBOL BACK HP (HISTORY API)
    let activeModalsStack = [];
    const f4ModalPreviousFocus = new __f4.globals.Map();
    const f4ModalTabbables = root => [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el => el.getClientRects().length && (0,__f4.globals.getComputedStyle)(el).visibility!=='hidden');
    let suppressNextModalPopstate = false; // cegah history.back() menutup modal induk juga

    function openModal(id) {
      const el = __f4.globals.document.getElementById(id);
      if (!el) return;

      if (!activeModalsStack.includes(id)) f4ModalPreviousFocus.set(id,__f4.globals.document.activeElement);
      el.classList.remove('hidden');
      __f4.globals.document.body.style.overflow = 'hidden';
      const dialog=el.querySelector('[role="dialog"]')||el.querySelector(':scope > div')||el;
      dialog.setAttribute('role','dialog');
      dialog.setAttribute('aria-modal','true');
      if(!dialog.hasAttribute('aria-label')&&!dialog.hasAttribute('aria-labelledby')) {
        const heading=dialog.querySelector('h1,h2,h3,h4');
        dialog.setAttribute('aria-label',heading?.textContent?.trim()||'Jendela dialog Flamboyan 4');
      }
      if(!dialog.hasAttribute('tabindex'))dialog.setAttribute('tabindex','-1');
      (0,__f4.globals.setTimeout)(()=>{
        if(el.classList.contains('hidden')||activeModalsStack[activeModalsStack.length-1]!==id)return;
        (f4ModalTabbables(el)[0]||dialog).focus({preventScroll:true});
      },0);

      if (!activeModalsStack.includes(id)) {
        activeModalsStack.push(id);
        __f4.globals.history.pushState({ modalId: id }, '', __f4.window.location.pathname + __f4.window.location.search);
      }

      if (id === 'modal-saran') {
        (0,__f4.globals.setTimeout)(() => {
          el.classList.remove('opacity-0');
          el.children[0].classList.remove('scale-95');
        }, 10);
      }
    }

    function closeModalDirect(id, isPopState = false) {
      const el = __f4.globals.document.getElementById(id);
      if (!el || el.classList.contains('hidden')) return;

      if (id === 'modal-saran') {
        el.classList.add('opacity-0');
        el.children[0].classList.add('scale-95');
        (0,__f4.globals.setTimeout)(() => {
          el.classList.add('hidden');
          const statusEl = __f4.globals.document.getElementById('saran-status');
          if (statusEl) statusEl.classList.add('hidden');
          const formEl = __f4.globals.document.getElementById('form-saran');
          if (formEl) formEl.reset();
        }, 300);
      } else {
        el.classList.add('hidden');
      }

      if (id === 'lightbox-modal') {
        const container = __f4.globals.document.getElementById('lightbox-media-container');
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
        __f4.globals.history.back();
      }

      if (activeModalsStack.length === 0) {
        __f4.globals.document.body.style.overflow = 'auto';
      }
      const previous=f4ModalPreviousFocus.get(id);
      f4ModalPreviousFocus.delete(id);
      if(previous?.isConnected) (0,__f4.globals.setTimeout)(()=>previous.focus({preventScroll:true}),0);
    }

    function closeLightboxModal() {
      closeModalDirect('lightbox-modal');
    }

    __f4.window.addEventListener('popstate', function (e) {
      if (suppressNextModalPopstate) {
        suppressNextModalPopstate = false;
        return;
      }
      if (activeModalsStack.length > 0) {
        const topModalId = activeModalsStack[activeModalsStack.length - 1];
        closeModalDirect(topModalId, true);
      }
    });

    __f4.globals.document.addEventListener('keydown', function(e) {
      if (e.keyCode === 123) return false;
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) return false;
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) return false;
      if (e.ctrlKey && e.keyCode === 85) return false;

      if (activeModalsStack.length > 0) {
        const topModalId = activeModalsStack[activeModalsStack.length - 1];
        if(e.key==='Tab'){
          const root=__f4.globals.document.getElementById(topModalId);
          const tabbables=root?f4ModalTabbables(root):[];
          if(tabbables.length){
            const first=tabbables[0],last=tabbables[tabbables.length-1];
            if(e.shiftKey && (__f4.globals.document.activeElement===first||!root.contains(__f4.globals.document.activeElement))){
              e.preventDefault();last.focus();
            }else if(!e.shiftKey && (__f4.globals.document.activeElement===last||!root.contains(__f4.globals.document.activeElement))){
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
      __f4.globals.navigator.clipboard.writeText(norek).then(() => {
        const textSpan = __f4.globals.document.getElementById(textId);
        const btn = __f4.globals.document.getElementById(btnId);
        
        textSpan.innerText = "Tersalin!";
        btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
        btn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
        
        (0,__f4.globals.setTimeout)(() => {
          textSpan.innerText = "Salin Norek";
          btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
          btn.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
        }, 2000);
      }).catch(err => {
        (0,__f4.globals.alert)("Gagal menyalin nomor rekening.");
      });
    }

    // LIST LINK CSV TERPUSAT
    // Keuangan publik menggunakan Cloudflare D1.
    // Keuangan laman utama sekarang langsung membaca Buku Kas dari backend Pembukuan.
    // CSV_KEUANGAN_URL lama tidak dipakai lagi.
    const CSV_DOKUMENTASI_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=0&single=true&output=csv';
    // Isi URL CSV sheet inventaris warga di sini jika sheet sudah tersedia.
    const CSV_INVENTARIS_WARGA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=492423764&single=true&output=csv';
    const CSV_ARISAN_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=53284271&single=true&output=csv';
    const CSV_RENCANA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=781301604&single=true&output=csv';
    const CSV_JERSEY_BAPAK_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=878370178&single=true&output=csv';
    const CSV_JERSEY_IBU_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=1755921986&single=true&output=csv';




    // Arsip media tetap bisa dibuka langsung melalui tautan Drive.
    const FOLDER_JERSEY_URL='https://drive.google.com/drive/folders/1_VH_MHlOhA_tSXPsw1ztJEf3fVydU7gE';
    const FOLDER_GAPURA_URL='https://drive.google.com/drive/folders/1Zs2RlbHTvNc9RDhbc1TlgcptXeNhnrQ5';

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

    if (__f4.window.firebase?.database && !__f4.globals.firebase.apps.length) {
      __f4.globals.firebase.initializeApp(firebaseConfig);
    }
    const dbRef = __f4.window.firebase?.database ? __f4.globals.firebase.database().ref('komentar_warga') : null;

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
    let globalJerseyAnakData = [];
    let currentJerseyTab = 'bapak';

    let globalRencanaData = [];
    let currentArisanIdxGlobal = -1;
    let nextArisanIdxGlobal = -1;
    let arisanLastMonthKey = '';


    let monthlyKeuanganList = []; 
    let currentPemasukanMonthIndex = 0;
    let currentPengeluaranMonthIndex = 0;

    let calendarDate = new __f4.globals.Date();

    function formatRupiah(angka) {
      return new __f4.globals.Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
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
      const txt=__f4.globals.document.getElementById('komentar-pesan');
      if(!txt)return;
      txt.value+=emot;txt.focus();
    }
    function renderKomentarWarga(){
      const container=__f4.globals.document.getElementById('container-komentar-list');
      const badge=__f4.globals.document.getElementById('total-komentar-badge');
      if(!container)return;
      if(badge)badge.textContent=globalKomentarList.length+' Pesan';
      container.replaceChildren();
      if(!globalKomentarList.length){
        const p=__f4.globals.document.createElement('p');
        p.className='text-slate-400 text-xs italic text-center py-8';
        p.textContent='Belum ada pesan. Ayo menyapa!';
        container.append(p);return;
      }
      for(const item of globalKomentarList){
        const card=__f4.globals.document.createElement('div');card.className='bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-start justify-between gap-2 hover:bg-slate-100/50 transition';
        const body=__f4.globals.document.createElement('div');body.className='space-y-1 w-full';
        const head=__f4.globals.document.createElement('div');head.className='flex items-center justify-between';
        const name=__f4.globals.document.createElement('span');name.className='font-bold text-xs md:text-sm text-indigo-950';name.textContent=item.nama||'Warga';
        const time=__f4.globals.document.createElement('span');time.className='text-[10px] text-slate-400 font-mono';time.textContent=item.waktu||'';
        const text=__f4.globals.document.createElement('p');text.className='text-xs md:text-sm text-slate-700 leading-relaxed break-words whitespace-pre-line';text.textContent=item.pesan||'';
        head.append(name,time);body.append(head,text);card.append(body);container.append(card);
      }
    }
    function listenKomentarFirebase(){
      const container=__f4.globals.document.getElementById('container-komentar-list');
      if(!dbRef){
        if(container)container.textContent='Firebase tidak termuat. Periksa koneksi jaringan.';
        return;
      }
      if(container)container.textContent='Menghubungkan riwayat Firebase…';
      const query=dbRef.limitToLast(50);
      query.on('value',snapshot=>{
        const raw=snapshot.val()||{};
        globalKomentarList=__f4.globals.Object.keys(raw).map(key=>({id:key,...raw[key]}))
          .sort((a,b)=>((0,__f4.globals.Number)(b.timestamp)||0)-((0,__f4.globals.Number)(a.timestamp)||0));
        renderKomentarWarga();
      },error=>{
        __f4.globals.console.error('Gagal membaca riwayat Firebase:',error);
        if(container)container.textContent='Riwayat Firebase tidak dapat dibaca: '+(error?.message||'Periksa izin baca Firebase dan jaringan');
      });
      __f4.cleanup(()=>query.off('value'));
    }
    const chatDoc=__f4.globals.document,chatCompose=chatDoc.getElementById('f4-chat-compose'),chatToggle=chatDoc.getElementById('f4-chat-toggle');
    const chatSection=chatDoc.getElementById('komentar-warga'),chatMedia=__f4.window.matchMedia('(max-width:767px)');
    const chatHome=chatCompose.parentNode,chatNext=chatCompose.nextSibling;
    const chatSheet=chatDoc.createElement('div');chatSheet.id='f4-chat-sheet';chatSheet.hidden=true;
    chatSheet.innerHTML='<div class="f4-chat-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="f4-chat-sheet-title"><div class="f4-chat-sheet-head"><span class="f4-chat-sheet-grip" aria-hidden="true"></span><h3 id="f4-chat-sheet-title">Tulis pesan</h3><button type="button" aria-label="Tutup" class="f4-chat-sheet-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="f4-chat-sheet-content"></div></div>';
    chatDoc.body.append(chatSheet);
    const chatPanel=chatSheet.querySelector('.f4-chat-sheet-panel'),chatContent=chatSheet.querySelector('.f4-chat-sheet-content');
    let chatPreviousOverflow='',chatToken='',chatFocusTimer=0;
    function chatViewport(){
      if(chatSheet.hidden)return;
      const viewport=__f4.window.visualViewport,offset=viewport?.offsetTop||0,height=viewport?.height||__f4.window.innerHeight;
      chatSheet.style.setProperty('--f4-chat-vv-top',offset+'px');
      chatSheet.style.setProperty('--f4-chat-vv-height',height+'px');
      chatSheet.dataset.keyboard=(0,__f4.globals.String)(__f4.window.innerHeight-height>120);
      const active=chatDoc.activeElement;
      if(active&&chatContent.contains(active)){
        const r=active.getBoundingClientRect(),p=chatContent.getBoundingClientRect();
        if(r.bottom>p.bottom||r.top<p.top)active.scrollIntoView({block:'nearest',inline:'nearest'});
      }
    }
    function chatRestore(){
      if(chatSheet.hidden)return;
      chatDoc.activeElement?.blur?.();
      chatSheet.hidden=true;chatHome.insertBefore(chatCompose,chatNext);
      chatDoc.body.style.overflow=chatPreviousOverflow;
      chatSection.dataset.composeOpen='false';chatToggle.setAttribute('aria-expanded','false');chatToggle.querySelector('span').textContent='Tulis pesan';
      chatToggle.focus({preventScroll:true});
    }
    function closeChatSheet(fromBack=false){
      if(chatSheet.hidden)return;
      const owns=__f4.globals.history.state?.f4ChatSheet===chatToken;
      chatRestore();chatToken='';
      if(owns&&!fromBack)__f4.globals.history.back();
    }
    function f4SetChatCompose(open,focus=false){
      if(!open){closeChatSheet();return}
      if(!chatMedia.matches)return;
      if(!chatSheet.hidden)return;
      chatPreviousOverflow=chatDoc.body.style.overflow;
      chatContent.append(chatCompose);chatSheet.hidden=false;
      __f4.window.F4MobileSheets?.sync?.(chatPanel);
      chatSection.dataset.composeOpen='true';chatToggle.setAttribute('aria-expanded','true');
      chatToggle.querySelector('span').textContent='Tutup';
      chatDoc.body.style.overflow='hidden';
      chatToken='chat-'+__f4.globals.Date.now();
      __f4.globals.history.pushState({...__f4.globals.history.state,f4ChatSheet:chatToken},'',__f4.globals.location.href);
      chatViewport();
      if(focus){
        const name=chatDoc.getElementById('komentar-nama');
        (name?.value.trim()?chatDoc.getElementById('komentar-pesan'):name)?.focus({preventScroll:true});
      }
    }
    chatToggle?.addEventListener('click',()=>{if(chatSheet.hidden)f4SetChatCompose(true,false);else closeChatSheet()});
    chatSheet.querySelector('.f4-chat-sheet-close').onclick=()=>closeChatSheet();
    chatSheet.addEventListener('click',e=>{if(e.target===chatSheet)closeChatSheet()});
    chatDoc.addEventListener('keydown',e=>{if(chatSheet.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeChatSheet()}else if(e.key==='Tab'){const nodes=[...chatPanel.querySelectorAll('button:not([disabled]),input:not([tabindex="-1"]),textarea')].filter(el=>el.getClientRects().length);const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(chatDoc.activeElement===first||!chatPanel.contains(chatDoc.activeElement))){e.preventDefault();last?.focus()}else if(!e.shiftKey&&(chatDoc.activeElement===last||!chatPanel.contains(chatDoc.activeElement))){e.preventDefault();first?.focus()}}},true);
    __f4.window.addEventListener('popstate',()=>{if(!chatSheet.hidden&&__f4.globals.history.state?.f4ChatSheet!==chatToken)closeChatSheet(true)});
    __f4.window.visualViewport?.addEventListener('resize',chatViewport,{passive:true});
    __f4.window.visualViewport?.addEventListener('scroll',chatViewport,{passive:true});
    __f4.window.addEventListener('resize',()=>{if(!chatMedia.matches)closeChatSheet();else chatViewport()});
    chatContent.addEventListener('focusin',()=>{chatViewport();if(chatFocusTimer)__f4.globals.clearTimeout(chatFocusTimer);chatFocusTimer=__f4.globals.setTimeout(chatViewport,280)});
    __f4.cleanup(()=>{if(!chatSheet.hidden){chatHome.insertBefore(chatCompose,chatNext);chatDoc.body.style.overflow=chatPreviousOverflow}chatSheet.remove()});

    let f4LastChatAt=0;
    async function tambahKomentarWarga(e){
      e.preventDefault();
      const nama=__f4.globals.document.getElementById('komentar-nama')?.value.trim()||'';
      const pesan=__f4.globals.document.getElementById('komentar-pesan')?.value.trim()||'';
      const btn=__f4.globals.document.getElementById('btn-submit-chat');
      if(!nama||!pesan)return;
      if(nama.length<2||nama.length>60||pesan.length<2||pesan.length>1000){
        (0,__f4.globals.alert)('Nama maksimal 60 karakter, pesan maksimal 1000 karakter.');
        return;
      }
      if(__f4.globals.Date.now()-f4LastChatAt<30000){
        (0,__f4.globals.alert)('Mohon beri jeda 30 detik sebelum mengirim komentar berikutnya.');
        return;
      }
      if(!dbRef){(0,__f4.globals.alert)('Firebase belum tersambung. Periksa jaringan, kemudian coba lagi.');return}
      const oldHtml=btn?.innerHTML;
      if(btn){btn.disabled=true;btn.textContent='Mengirim…'}
      try{
        const now=new __f4.globals.Date();
        const waktu=now.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})
          +', '+now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
        await dbRef.push({nama,pesan,waktu,timestamp:__f4.globals.firebase.database.ServerValue.TIMESTAMP});
        f4LastChatAt=__f4.globals.Date.now();
        __f4.globals.document.getElementById('komentar-pesan').value='';
        f4SetChatCompose(false);
        // Realtime listener updates the visible chat; no D1 write or page reset.
      }catch(error){(0,__f4.globals.alert)('Gagal mengirim pesan ke Firebase: '+error.message)}
      finally{
        if(btn){btn.disabled=false;btn.innerHTML=oldHtml;__f4.window.lucide?.createIcons?.()}
      }
    }
let currentKeuanganFilterType = 'all'; // 'all', 'pemasukan', 'pengeluaran'

    function f4CanReadKas(){return __f4.globals.document.body.dataset.previewRole && __f4.globals.document.body.dataset.previewRole!=='public'}
    function openModalKeuangan() {
      if (!f4CanReadKas()) return;
      currentKeuanganFilterType = 'all';
      __f4.globals.document.getElementById('modal-keuangan-title').innerText = 'Arsip Seluruh Transaksi Kas';
      __f4.globals.document.getElementById('search-keuangan').placeholder = 'Cari transaksi...';
      __f4.globals.document.getElementById('search-keuangan').value = '';
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
        __f4.globals.document.getElementById('modal-keuangan-title').innerText = `${titleText} (${monthLabel})`;
        __f4.globals.document.getElementById('search-keuangan').placeholder = `Cari transaksi ${filterType} ${monthLabel}...`;
      } else {
        __f4.globals.document.getElementById('modal-keuangan-title').innerText = 'Arsip Seluruh Transaksi Kas';
        __f4.globals.document.getElementById('search-keuangan').placeholder = 'Cari transaksi...';
      }

      __f4.globals.document.getElementById('search-keuangan').value = '';
      filterKeuanganModal();
      openModal('modal-keuangan');
    }

    function openModalArisan(which = 'current') {
      refreshArisanCards();
      __f4.globals.document.getElementById('search-arisan').value = '';
      filterArisanModal();
      openModal('modal-arisan');
      // After modal layout, show the selected month in the scrollable schedule.
      (0,__f4.globals.requestAnimationFrame)(() => (0,__f4.globals.requestAnimationFrame)(() => {
        const index = which === 'next' ? nextArisanIdxGlobal : currentArisanIdxGlobal;
        const table = __f4.globals.document.getElementById('tabel-arisan-all');
        const row = index >= 0 ? table?.rows[index] : null;
        if (!row) return;
        row.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});
        row.setAttribute('tabindex','-1');
        row.focus({preventScroll:true});
      }));
    }
    
    function openModalJersey() {
      __f4.globals.document.getElementById('search-jersey').value = '';
      switchJerseyTab('bapak');
      openModal('modal-jersey'); 
    }

    function openModalDokumentasi() {
  // Gallery preview in the landing page is only a shortcut to the complete
  // Dokumentasi page; don't show a second album popup.
  if(__f4.window.parent!==window)__f4.window.parent.postMessage({type:'f4:navigate',target:'dokumentasi'},__f4.globals.location.origin);
  else __f4.window.location.href='/dokumentasi/';
}
    function openModalSaran() { openModal('modal-saran'); }

   function openModalEventDetail(dateStr, eventItems, dateIso) {
  const escape=value=>(0,__f4.globals.String)(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  __f4.globals.document.getElementById('modal-event-date').innerText = `Kegiatan: ${dateStr}`;
  
  // Gunakan Query Parameter ?event= agar aman dibuka dari WhatsApp/Browser
  const baseUrl = __f4.window.location.origin + __f4.window.location.pathname;
  const shareUrl = /^\d{4}-\d{2}-\d{2}$/.test(dateIso||'') ? `https://api.flamboyan4.web.id/s/a${dateIso.replaceAll('-','')}` : baseUrl;

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

    if(item.isBank){
      badgeBg='bg-emerald-50 text-emerald-900 border-emerald-200';
      typeLabel='BANK SAMPAH';
    } else if (isGorol) {
      badgeBg = 'bg-amber-100 text-amber-900 border-amber-200';
      typeLabel = '🧹 GOROL / KERJA BAKTI';
    } else if (isArisan) {
      badgeBg = 'bg-indigo-100 text-indigo-900 border-indigo-200';
      typeLabel = '🏠 ARISAN WARGA';
    }
    
    html += `
      <div class="p-3 rounded-xl border ${badgeBg} space-y-1 mb-2">
        <span class="font-extrabold text-[10px] uppercase tracking-wider block">${typeLabel}</span>
        <h5 class="font-medium text-sm text-slate-800">${escape(item.judul)}</h5>
        <p class="text-slate-600 text-xs">${escape(item.deskripsi || 'Tidak ada catatan tambahan.')}</p>
        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 mt-1">${escape(item.status)}</span>
      </div>
    `;
  });

  __f4.globals.document.getElementById('modal-event-body').innerHTML = html;
  openModal('modal-event-detail');
  if (typeof __f4.globals.lucide !== 'undefined') __f4.globals.lucide.createIcons();
}

async function salinLinkAgenda(url) {
  if(url.startsWith('https://api.flamboyan4.web.id/s/a')){
    const raw=url.slice(-8),date=raw.slice(0,4)+'-'+raw.slice(4,6)+'-'+raw.slice(6,8);
    try{
      const res=await (0,__f4.globals.fetch)(url,{method:'HEAD',cache:'no-store',credentials:'omit'});
      if(!res.ok||!res.headers.get('content-type')?.startsWith('text/html'))throw Error('Short link unavailable');
    }catch{url='https://flamboyan4.web.id/?event='+date}
  }
  __f4.globals.navigator.clipboard.writeText(url).then(() => {
    const txt = __f4.globals.document.getElementById('text-copy-agenda');
    if (txt) {
      txt.innerText = 'Link Tersalin!';
      (0,__f4.globals.setTimeout)(() => { txt.innerText = 'Salin Link Agenda'; }, 2000);
    }
  }).catch(() => {
    (0,__f4.globals.alert)("Link agenda: " + url);
  });
}

    // Satu indeks foto publik untuk galeri Portal Utama, termasuk album Projek.
    // Folder Google Drive hanya menjadi sumber ID; foto tetap dibuka di website.
    let f4PortalPhotoIndexPromise=null;
    function f4ReadPortalPhotoIndex(){
      if(!f4PortalPhotoIndexPromise){
        f4PortalPhotoIndexPromise=(0,__f4.globals.fetch)('/assets/data/portal-photo-index.json?v=20261123-project-media-v1',{cache:'no-store'})
          .then(response=>{if(!response.ok)throw (0,__f4.globals.Error)('Indeks foto tidak tersedia');return response.json();})
          .catch(error=>{f4PortalPhotoIndexPromise=null;throw error;});
      }
      return f4PortalPhotoIndexPromise;
    }
    function f4ProjectFolderItems(rows){
      return (__f4.globals.Array.isArray(rows)?rows:[]).map(record=>{
        const raw=(0,__f4.globals.String)(record?.id||'').replace(/^gdrive:/,'');
        const id=/^[A-Za-z0-9_-]{12,110}$/.test(raw)?raw:
          (0,__f4.globals.String)(record?.url||'').match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,110})/)?.[1];
        if(!id)return null;
        const video=(0,__f4.globals.String)(record?.type||'').toLowerCase()==='video';
        return {
          type:video?'video':'image',driveId:id,
          url:video
            ?'https://api.flamboyan4.web.id/api/v2/gallery/public-video/'+(0,__f4.globals.encodeURIComponent)(id)
            :'https://lh3.googleusercontent.com/d/'+(0,__f4.globals.encodeURIComponent)(id),
          rawUrl:'https://drive.google.com/file/d/'+(0,__f4.globals.encodeURIComponent)(id)+'/view',
          thumb:'https://drive.google.com/thumbnail?id='+(0,__f4.globals.encodeURIComponent)(id)+'&sz=w1000'
        };
      }).filter(__f4.globals.Boolean);
    }
    async function f4LoadProjectFolderItems(folderId){
      const index=await f4ReadPortalPhotoIndex();
      const stored=f4ProjectFolderItems(index.folders?.[folderId]);
      if(stored.length)return stored;
      // Untuk album lain yang belum diindeks, gunakan endpoint galeri publik
      // tanpa menampilkan tombol Drive kepada warga.
      const ctrl=new __f4.globals.AbortController(),timer=(0,__f4.globals.setTimeout)(()=>ctrl.abort(),5000);
      try{
        const response=await (0,__f4.globals.fetch)(
          'https://api.flamboyan4.web.id/api/v2/gallery/folder?album='+
          (0,__f4.globals.encodeURIComponent)('gfolder:'+folderId),{cache:'no-store',signal:ctrl.signal});
        if(!response.ok)throw (0,__f4.globals.Error)('Album belum dapat dimuat');
        const data=await response.json();
        return f4ProjectFolderItems(data.media);
      }finally{(0,__f4.globals.clearTimeout)(timer);}
    }
    let f4ProjectGalleryRequest=0;
    async function openGalleryGridModal(rawString, title) {
      const id=++f4ProjectGalleryRequest;
      const grid=__f4.globals.document.getElementById('gallery-grid-container');
      const caption=__f4.globals.document.getElementById('gallery-grid-subtitle');
      __f4.globals.document.getElementById('gallery-grid-title').textContent=title||'Galeri Album';
      grid.innerHTML='<p class="text-slate-400 text-xs col-span-full text-center py-8">Memuat foto album...</p>';
      caption.textContent='Foto dan video kegiatan';
      currentMediaList=[];
      openModal('modal-gallery-grid');

      let mediaItems=[];
      const folderId=extractFolderId(rawString);
      try{
        if(folderId)mediaItems=await f4LoadProjectFolderItems(folderId);
        else mediaItems=(0,__f4.globals.String)(rawString||'').split(',').map(x=>x.trim()).filter(__f4.globals.Boolean).map(url=>{
          const video=/\.(mp4|mkv|mov|webm|avi)(?:[?#]|$)/i.test(url);
          return {type:video?'video':'image',url:video?url:fixDriveUrl(url),rawUrl:url};
        });
      }catch(error){
        if(id!==f4ProjectGalleryRequest)return;
        __f4.globals.console.warn('Galeri Projek:',error.message||error);
      }
      if(id!==f4ProjectGalleryRequest)return;
      if(!mediaItems.length){
        grid.replaceChildren();
        const note=__f4.globals.document.createElement('p');
        note.className='text-slate-500 text-sm col-span-full text-center py-8';
        note.textContent='Foto album ini belum dapat ditampilkan. Silakan coba lagi nanti.';
        grid.append(note);
        caption.textContent='Belum ada media yang dapat dimuat';
        return;
      }
      currentMediaList=mediaItems;
      currentPhotoCaption=title;
      grid.replaceChildren();
      for(const [index,item] of mediaItems.entries()){
        const tile=__f4.globals.document.createElement('button');
        tile.type='button';
        tile.className='h-40 md:h-48 relative group cursor-pointer bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200';
        tile.setAttribute('aria-label',(item.type==='video'?'Putar video ':'Lihat foto ')+(index+1));
        tile.onclick=()=>openLightboxFromIndex(index);
        if(item.type==='video'){
          tile.classList.add('bg-slate-900');
          const thumb=__f4.globals.document.createElement('img');
          thumb.src=item.thumb||'';
          thumb.alt='Cuplikan video '+(index+1);
          thumb.loading='lazy';thumb.className='w-full h-full object-cover';
          thumb.onerror=()=>thumb.remove();
          if(item.thumb)tile.append(thumb);
          const play=__f4.globals.document.createElement('span');
          play.className='absolute inset-0 flex items-center justify-center text-white';
          play.innerHTML='<svg viewBox="0 0 24 24" width="42" height="42" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>';
          tile.append(play);
        }else{
          const image=__f4.globals.document.createElement('img');
          image.src=item.url;image.alt='Foto '+(index+1);
          image.loading='lazy';image.className='w-full h-full object-cover group-hover:scale-105 transition duration-300';
          if(item.driveId){
            let fallback=false;
            image.onerror=()=>{
              if(!fallback){fallback=true;image.src=item.thumb;}
              else image.onerror=null;
            };
          }
          tile.append(image);
        }
        grid.append(tile);
      }
      caption.textContent=mediaItems.length+' foto/video · Klik untuk melihat';
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
      const modal = __f4.globals.document.getElementById('lightbox-modal');
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

      if (__f4.globals.Math.abs(diffX) > __f4.globals.Math.abs(diffY) && __f4.globals.Math.abs(diffX) > 50) {
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
      const resetBtn = __f4.globals.document.getElementById('btn-reset-zoom');
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
      const img = __f4.globals.document.getElementById('lightbox-active-img');
      if (img) {
        img.style.transition = 'transform 0.2s ease-out';
        applyTransform(img);
        (0,__f4.globals.setTimeout)(() => { img.style.transition = 'none'; }, 200);
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
        zoomScale = __f4.globals.Math.min(__f4.globals.Math.max(zoomScale + delta, 1), 5);
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
          (0,__f4.globals.requestAnimationFrame)(() => applyTransform(img));
        }
      };

      const handleGlobalMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          if (img) img.style.cursor = zoomScale > 1 ? 'grab' : 'default';
        }
      };

      __f4.window.removeEventListener('mousemove', handleGlobalMouseMove);
      __f4.window.removeEventListener('mouseup', handleGlobalMouseUp);
      __f4.window.addEventListener('mousemove', handleGlobalMouseMove);
      __f4.window.addEventListener('mouseup', handleGlobalMouseUp);

      img.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          startDist = __f4.globals.Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          );
          startScale = zoomScale;
        } else if (e.touches.length === 1) {
          isDragging = true;
          startX = e.touches[0].pageX - translateX;
          startY = e.touches[0].pageY - translateY;

          const currentTime = new __f4.globals.Date().getTime();
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
              (0,__f4.globals.setTimeout)(() => { img.style.transition = 'none'; }, 200);
            }
          }
          lastTapTime = currentTime;
        }
      }, { passive: false });

      img.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const currentDist = __f4.globals.Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          );
          zoomScale = __f4.globals.Math.min(__f4.globals.Math.max(startScale * (currentDist / startDist), 1), 5);
          if (zoomScale === 1) { translateX = 0; translateY = 0; }
          applyTransform(img);
        } else if (e.touches.length === 1 && isDragging && zoomScale > 1) {
          e.preventDefault();
          translateX = e.touches[0].pageX - startX;
          translateY = e.touches[0].pageY - startY;
          (0,__f4.globals.requestAnimationFrame)(() => applyTransform(img));
        }
      }, { passive: false });

      img.addEventListener('touchend', () => { isDragging = false; });
    }

    function updateLightboxView() {
      const item = currentMediaList[currentPhotoIndex];
      const container = __f4.globals.document.getElementById('lightbox-media-container');

      const resetBtn = __f4.globals.document.getElementById('btn-reset-zoom');
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
        const img = __f4.globals.document.getElementById('lightbox-active-img');
        if (img) initImageZoomEvents(img);
      }

      __f4.globals.document.getElementById('lightbox-caption').innerText = currentPhotoCaption;

      const counter = __f4.globals.document.getElementById('lightbox-counter');
      const btnPrev = __f4.globals.document.getElementById('lightbox-prev');
      const btnNext = __f4.globals.document.getElementById('lightbox-next');

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
      __f4.globals.lucide.createIcons();
    }

    function initCardGesturesAndKeyboard() {
      setupCardInteractions('card-pemasukan', changeMonthPemasukan);
      setupCardInteractions('card-pengeluaran', changeMonthPengeluaran);
    }

    function setupCardInteractions(cardId, changeMonthFn) {
      const card = __f4.globals.document.getElementById(cardId);
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
        // On mobile, native horizontal swipe switches the overview card.
        // Month navigation remains available through its own arrow buttons.
        if(__f4.window.matchMedia('(max-width:767px)').matches)return;
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (__f4.globals.Math.abs(diffX) > __f4.globals.Math.abs(diffY) && __f4.globals.Math.abs(diffX) > 35) {
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

      __f4.globals.document.addEventListener('keydown', function(e) {
        if (activeModalsStack.length > 0) return;
        if (isHovered || __f4.globals.document.activeElement === card) {
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

    function initHomeSummarySlides(){
      const mobile=__f4.window.matchMedia('(max-width:767px)');
      for(const [id,labels] of [['f4-cash-summary-slides',['Saldo kas','Kas masuk dan kas keluar']]]){
        const track=__f4.globals.document.getElementById(id),nav=__f4.globals.document.querySelector('[data-slide-nav="'+id+'"]');
        if(!track||!nav)continue;
        const cards=[...track.children];
        const dots=cards.map((card,index)=>{
          const b=__f4.globals.document.createElement('button');b.type='button';b.setAttribute('aria-label',labels[index]||('Kartu '+(index+1)));
          b.addEventListener('click',()=>{track.scrollTo({left:card.getBoundingClientRect().left-track.getBoundingClientRect().left+track.scrollLeft-(parseFloat(__f4.window.getComputedStyle(track).scrollPaddingLeft)||0),behavior:'smooth'});});
          return b;
        });
        nav.replaceChildren(...dots);
        const update=()=>{
          if(!mobile.matches||!track.clientWidth)return;
          const left=track.getBoundingClientRect().left+(parseFloat(__f4.window.getComputedStyle(track).scrollPaddingLeft)||0);
          let index=0;
          for(let i=1;i<cards.length;i++)if(__f4.globals.Math.abs(cards[i].getBoundingClientRect().left-left)<__f4.globals.Math.abs(cards[index].getBoundingClientRect().left-left))index=i;
          dots.forEach((dot,i)=>dot.setAttribute('aria-current',(0,__f4.globals.String)(i===index)));
        };
        track.addEventListener('scroll',update,{passive:true});
        __f4.window.addEventListener('resize',update,{passive:true});
        if(typeof __f4.globals.ResizeObserver==='function')new __f4.globals.ResizeObserver(update).observe(track);
        dots[0]?.setAttribute('aria-current','true');update();
      }
    }
    __f4.globals.document.addEventListener('DOMContentLoaded', () => {
      initHomeSummarySlides();
      initLightboxSwipe();
      initCardGesturesAndKeyboard();
      listenKomentarFirebase();
    });

    function f4ProjectSnapPositions(slider) {
      const origin=slider.getBoundingClientRect().left+slider.clientLeft+(parseFloat(__f4.window.getComputedStyle(slider).scrollPaddingLeft)||0);
      const max=__f4.globals.Math.max(0,slider.scrollWidth-slider.clientWidth);
      const positions=[0,max,...__f4.globals.Array.from(slider.querySelectorAll(':scope > .f4-project-card'))
        .filter(card=>card.getClientRects().length)
        .map(card=>__f4.globals.Math.max(0,__f4.globals.Math.min(max,slider.scrollLeft+card.getBoundingClientRect().left-origin)))];
      return positions.sort((a,b)=>a-b).filter((x,i,a)=>i===0||x-a[i-1]>1);
    }
    function scrollProjek(direction) {
      const slider=__f4.globals.document.getElementById('slider-projek');
      if(!slider||!direction)return;
      const stops=f4ProjectSnapPositions(slider),left=slider.scrollLeft;
      const target=direction>0?stops.find(x=>x>left+2):[...stops].reverse().find(x=>x<left-2);
      if(target!==__f4.globals.undefined)slider.scrollTo({left:target,behavior:__f4.window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
    function initProjectCarousel(){
      const slider=__f4.globals.document.getElementById('slider-projek'),nav=__f4.globals.document.getElementById('f4-project-nav');
      if(!slider||!nav)return;
      const [prev,next]=nav.querySelectorAll('button');
      const update=()=>{
        const max=__f4.globals.Math.max(0,slider.scrollWidth-slider.clientWidth);
        nav.hidden=max<=2;
        prev.disabled=slider.scrollLeft<=2;
        next.disabled=slider.scrollLeft>=max-2;
      };
      slider.addEventListener('scroll',update,{passive:true});
      __f4.window.addEventListener('resize',update,{passive:true});
      if(typeof __f4.globals.ResizeObserver==='function')new __f4.globals.ResizeObserver(update).observe(slider);
      new __f4.globals.MutationObserver(update).observe(slider,{childList:true,subtree:true,attributes:true,attributeFilter:['data-f4-project-inactive','hidden']});
      update();
    }
    __f4.globals.document.addEventListener('DOMContentLoaded',initProjectCarousel);

    const formSaran=__f4.globals.document.getElementById('form-saran');
    let f4LastSuggestionAt=0;
    formSaran.addEventListener('submit',async function(event){
      event.preventDefault();
      if(formSaran.elements.website?.value)return;
      if(__f4.globals.Date.now()-f4LastSuggestionAt<60000){
        (0,__f4.globals.alert)('Saran baru dapat dikirim lagi setelah satu menit.');
        return;
      }
      const button=formSaran.querySelector('button[type="submit"]');
      if(button)button.disabled=true;
      try{
        const pesan=(0,__f4.globals.String)(new __f4.globals.FormData(formSaran).get('pesan')||'').trim();
        if(pesan.length<5||pesan.length>2000)throw (0,__f4.globals.Error)('Saran harus berisi 5–2000 karakter.');
        const response=await (0,__f4.globals.fetch)(F4_FEEDBACK_API+'/suggestions',{method:'POST',
          headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify({pesan})});
        const result=await response.json();
        if(!response.ok||result.ok===false)throw (0,__f4.globals.Error)(result.error||'HTTP '+response.status);
        f4LastSuggestionAt=__f4.globals.Date.now();
        __f4.globals.document.getElementById('saran-status').classList.remove('hidden');
        formSaran.reset();
        (0,__f4.globals.setTimeout)(()=>closeModalDirect('modal-saran'),2500);
      }catch(error){(0,__f4.globals.alert)('Saran belum berhasil disimpan: '+error.message)}
      finally{if(button)button.disabled=false}
    });

    function formatTanggalKeuanganDisplay(value) {
      const raw = (0,__f4.globals.String)(value || '').trim();
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

    function renderTableRow(row, rowNumber = null) {
      const keys = __f4.globals.Object.keys(row);
      const tanggal = formatTanggalKeuanganDisplay(row[keys[0]]);
      const keterangan = row[keys[1]] || '-';
      const kategori = (row[keys[2]] || '').trim();
      const rawJumlah = row[keys[3]];

      if (!rawJumlah) return '';

      let cleanedJumlah = rawJumlah.toString().replace(/\./g, '').replace(/,/g, '');
      const jumlah = (0,__f4.globals.parseFloat)(cleanedJumlah.replace(/[^0-9-]/g, '')) || 0;

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
          ${__f4.globals.Number.isInteger(rowNumber) ? `<td class="f4-cash-number-cell">${rowNumber}</td>` : ''}
          <td class="px-3 py-2 text-slate-600 whitespace-nowrap">${escapeJerseyText(tanggal)}</td>
          <td class="px-3 py-2 font-medium break-words text-slate-800">${escapeJerseyText(keterangan)}</td>
          <td class="px-3 py-2">${badgeKategori}</td>
          <td class="px-3 py-2 text-right whitespace-nowrap">${textJumlah}</td>
        </tr>
      `;
    }

    // Kas Warga: full scrollable PC journal, three recent rows on HP.
    // The same authenticated D1 rows feed the cards, archive and printed report.
    const f4CashDesktopMedia=__f4.window.matchMedia('(min-width:768px)');
    function renderKasWargaTransactions() {
      const body=__f4.globals.document.getElementById('tabel-transaksi');
      if(!body||!f4CanReadKas())return;
      const calendar=__f4.globals.document.getElementById('f4-cash-date-filter');
      const selectedDate=(0,__f4.globals.String)(calendar?.value||'');
      const clear=__f4.globals.document.getElementById('f4-cash-date-clear');
      if(clear)clear.hidden=!selectedDate;
      const matching=globalKeuanganData.filter(row=>{
        if(!selectedDate)return true;
        const parsed=parseRowDate(row.Tanggal);
        return !!parsed&&[parsed.year,(0,__f4.globals.String)(parsed.month+1).padStart(2,'0'),(0,__f4.globals.String)(parsed.day).padStart(2,'0')].join('-')===selectedDate;
      });
      const isDesktop=f4CashDesktopMedia.matches;
      const title=__f4.globals.document.getElementById('f4-cash-activity-title');
      if(title)title.textContent=selectedDate?'Aktivitas Kas pada Tanggal Terpilih':'Aktivitas Kas Terbaru';
      const visible=isDesktop||selectedDate?matching:matching.slice(0,3);
      body.innerHTML=visible.map((row,index)=>renderTableRow(row,index+1)).join('')||
        '<tr><td colspan="5" class="f4-cash-no-results">'+
        (selectedDate?'Tidak ada transaksi pada tanggal tersebut.':'Belum ada transaksi.')+'</td></tr>';
      const more=__f4.globals.document.getElementById('btn-container-keuangan-all');
      if(more)more.classList.toggle('hidden',isDesktop||!!selectedDate||matching.length<=3);
    }
    function filterKasWargaByDate(){renderKasWargaTransactions()}
    function clearKasWargaDate(){
      const input=__f4.globals.document.getElementById('f4-cash-date-filter');
      if(input)input.value='';
      renderKasWargaTransactions();
    }
    f4CashDesktopMedia.addEventListener?.('change',renderKasWargaTransactions);

    function renderArisanRow(row, isCurrent = false, isNext = false) {
      const keys = __f4.globals.Object.keys(row);
      const bulan = row[keys[0]] || '-';
      const namaBlok = row[keys[1]] || '-';
      const statusRaw = (row[keys[2]] || '').toString().trim();

      let statusBadge = `<span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Belum</span>`;
      if (statusRaw.toLowerCase().includes('sudah') || statusRaw.toLowerCase().includes('selesai') || statusRaw.toLowerCase().includes('lunas')) {
        statusBadge = `<span class="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-semibold rounded"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-2px"><path d="m5 12 4 4L19 6"/></svg> Sudah</span>`;
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
      const keyword = __f4.globals.document.getElementById('search-arisan').value.toLowerCase();
      let html = '';
      globalArisanData.forEach((row, idx) => {
        const text = __f4.globals.Object.values(row).join(' ').toLowerCase();
        if (text.includes(keyword)) {
          const isCurrent = (idx === currentArisanIdxGlobal);
          const isNext = (idx === nextArisanIdxGlobal);
          html += renderArisanRow(row, isCurrent, isNext);
        }
      });
      __f4.globals.document.getElementById('tabel-arisan-all').innerHTML = html || '<tr><td colspan="3" class="p-4 text-center text-slate-400">Jadwal tidak ditemukan</td></tr>';
    }

    function filterKeuanganModal() {
      const keyword = __f4.globals.document.getElementById('search-keuangan').value.toLowerCase();
      
      let targetMonthObj = null;
      if (currentKeuanganFilterType === 'pemasukan' && monthlyKeuanganList.length > 0) {
        targetMonthObj = monthlyKeuanganList[currentPemasukanMonthIndex];
      } else if (currentKeuanganFilterType === 'pengeluaran' && monthlyKeuanganList.length > 0) {
        targetMonthObj = monthlyKeuanganList[currentPengeluaranMonthIndex];
      }

      let html = '';
      let filteredCount = 0;

      globalKeuanganData.forEach(row => {
        const keys = __f4.globals.Object.keys(row);
        if (keys.length < 4) return;

        const tglStr = row[keys[0]];
        const kategori = (row[keys[2]] || '').trim().toLowerCase();
        const textFull = __f4.globals.Object.values(row).join(' ').toLowerCase();

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

      __f4.globals.document.getElementById('tabel-transaksi-all').innerHTML = html || `<tr><td colspan="4" class="p-6 text-center text-slate-400 text-xs">Belum ada transaksi untuk periode ini.</td></tr>`;
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
          year = (0,__f4.globals.parseInt)(parts[0]);
          month = (0,__f4.globals.parseInt)(parts[1]) - 1;
          day = (0,__f4.globals.parseInt)(parts[2]);
        } else {
          day = (0,__f4.globals.parseInt)(parts[0]);
          if ((0,__f4.globals.isNaN)(parts[1])) {
            month = monthMap[parts[1]] !== __f4.globals.undefined ? monthMap[parts[1]] : -1;
          } else {
            month = (0,__f4.globals.parseInt)(parts[1]) - 1;
          }
          year = (0,__f4.globals.parseInt)(parts[2]);
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
      const label = __f4.globals.document.getElementById('label-saldo-bulan');
      const value = __f4.globals.document.getElementById('saldo-bulan');
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
      const labelPemasukan = __f4.globals.document.getElementById('label-pemasukan-bulan');
      const periodePemasukan = __f4.globals.document.createElement('span');
      periodePemasukan.className = 'f4-period-nowrap';
      periodePemasukan.textContent = `(${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m.month]} ${m.year})`;
      labelPemasukan.replaceChildren(__f4.globals.document.createTextNode('Masuk '), periodePemasukan);
      __f4.globals.document.getElementById('pemasukan-bulan-ini').innerText = formatRupiah(m.pemasukan);
    }

    function updatePengeluaranCardView() {
      if (monthlyKeuanganList.length === 0) return;
      const m = monthlyKeuanganList[currentPengeluaranMonthIndex];
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const labelPengeluaran = __f4.globals.document.getElementById('label-pengeluaran-bulan');
      const periodePengeluaran = __f4.globals.document.createElement('span');
      periodePengeluaran.className = 'f4-period-nowrap';
      periodePengeluaran.textContent = `(${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m.month]} ${m.year})`;
      labelPengeluaran.replaceChildren(__f4.globals.document.createTextNode('Keluar '), periodePengeluaran);
      __f4.globals.document.getElementById('pengeluaran-bulan-ini').innerText = formatRupiah(m.pengeluaran);
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
        const el = __f4.globals.document.getElementById(id);
        if (!el || el.options.length) return;
        bulanNamaCetakKas.forEach((nama, i) => {
          const opt = __f4.globals.document.createElement('option');
          opt.value = i;
          opt.textContent = nama;
          el.appendChild(opt);
        });
      });
    }

    function openModalCetakKas() {
      if (!f4CanReadKas()) return;
      isiSelectBulanCetakKas();
      const now = new __f4.globals.Date();
      let month = now.getMonth(), year = now.getFullYear();
      if (monthlyKeuanganList.length) {
        const last = monthlyKeuanganList[monthlyKeuanganList.length - 1];
        month = last.month; year = last.year;
      }
      __f4.globals.document.getElementById('cetak-kas-bulan').value = month;
      __f4.globals.document.getElementById('cetak-kas-bulan-awal').value = month;
      __f4.globals.document.getElementById('cetak-kas-bulan-akhir').value = month;
      __f4.globals.document.getElementById('cetak-kas-tahun').value = year;
      __f4.globals.document.getElementById('cetak-kas-tahun-rentang').value = year;
      __f4.globals.document.getElementById('cetak-kas-tahun-full').value = year;
      __f4.globals.document.getElementById('cetak-kas-tipe').value = 'bulanan';
      updateCetakKasFields();
      __f4.globals.document.getElementById('modal-cetak-kas').classList.remove('hidden');
      if (__f4.window.lucide) __f4.globals.lucide.createIcons();
    }

    function closeModalCetakKas() {
      __f4.globals.document.getElementById('modal-cetak-kas')?.classList.add('hidden');
    }

    function updateCetakKasFields() {
      const tipe = __f4.globals.document.getElementById('cetak-kas-tipe')?.value || 'bulanan';
      __f4.globals.document.getElementById('cetak-kas-bulanan')?.classList.toggle('hidden', tipe !== 'bulanan');
      __f4.globals.document.getElementById('cetak-kas-rentang')?.classList.toggle('hidden', tipe !== 'rentang');
      __f4.globals.document.getElementById('cetak-kas-tahunan')?.classList.toggle('hidden', tipe !== 'tahunan');
    }

    function escapeCetakKas(v) {
      return (0,__f4.globals.String)(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    function nominalCetakKas(raw) {
      if (typeof raw === 'number') return raw;
      const s = (0,__f4.globals.String)(raw ?? '').replace(/\./g,'').replace(/,/g,'').replace(/[^0-9-]/g,'');
      return (0,__f4.globals.parseFloat)(s) || 0;
    }

    function cetakLaporanKas() {
      if (!__f4.globals.Array.isArray(globalKeuanganData) || globalKeuanganData.length === 0) {
        (0,__f4.globals.alert)('Data keuangan belum tersedia. Tunggu data selesai dimuat lalu coba kembali.');
        return;
      }

      const tipe = __f4.globals.document.getElementById('cetak-kas-tipe').value;
      let periode = 'Semua Transaksi';
      let labelSaldoAkhir = 'Saldo Akhir';
      let labelSaldoKasPeriode = 'Saldo Kas Periode';
      let filterFn = () => true;
      let batasAwalSaldo = null;

      if (tipe === 'bulanan') {
        const month = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-bulan').value);
        const year = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-tahun').value);
        periode = `Periode ${bulanNamaCetakKas[month]} ${year}`;
        labelSaldoAkhir = `Saldo Akhir ${bulanNamaCetakKas[month]} ${year}`;
        labelSaldoKasPeriode = `Saldo Kas ${bulanNamaCetakKas[month]} ${year}`;
        batasAwalSaldo = new __f4.globals.Date(year, month, 1, 0, 0, 0, 0);
        filterFn = row => {
          const keys = __f4.globals.Object.keys(row), d = parseRowDate(row[keys[0]]);
          return d && d.month === month && d.year === year;
        };
      } else if (tipe === 'rentang') {
        const awal = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-bulan-awal').value);
        const akhir = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-bulan-akhir').value);
        const year = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-tahun-rentang').value);
        if (awal > akhir) return (0,__f4.globals.alert)('Bulan awal tidak boleh lebih besar dari bulan akhir.');
        periode = `Periode ${bulanNamaCetakKas[awal]} s.d. ${bulanNamaCetakKas[akhir]} ${year}`;
        labelSaldoAkhir = `Saldo Akhir ${bulanNamaCetakKas[awal]}–${bulanNamaCetakKas[akhir]} ${year}`;
        labelSaldoKasPeriode = `Saldo Kas ${bulanNamaCetakKas[awal]}–${bulanNamaCetakKas[akhir]} ${year}`;
        batasAwalSaldo = new __f4.globals.Date(year, awal, 1, 0, 0, 0, 0);
        filterFn = row => {
          const keys = __f4.globals.Object.keys(row), d = parseRowDate(row[keys[0]]);
          return d && d.year === year && d.month >= awal && d.month <= akhir;
        };
      } else if (tipe === 'tahunan') {
        const year = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-tahun-full').value);
        periode = `Laporan Tahunan ${year}`;
        labelSaldoAkhir = `Saldo Akhir Tahun ${year}`;
        labelSaldoKasPeriode = `Saldo Kas Tahun ${year}`;
        batasAwalSaldo = new __f4.globals.Date(year, 0, 1, 0, 0, 0, 0);
        filterFn = row => {
          const keys = __f4.globals.Object.keys(row), d = parseRowDate(row[keys[0]]);
          return d && d.year === year;
        };
      }

      let data = globalKeuanganData.filter(filterFn).slice();
      data.sort((a,b) => {
        const ka=__f4.globals.Object.keys(a), kb=__f4.globals.Object.keys(b);
        const da=parseRowDate(a[ka[0]]), db=parseRowDate(b[kb[0]]);
        if (!da || !db) return 0;
        return new __f4.globals.Date(da.year,da.month,da.day||1) - new __f4.globals.Date(db.year,db.month,db.day||1);
      });

      let totalMasuk=0, totalKeluar=0;
      let rows='';
      data.forEach((row,idx) => {
        const keys=__f4.globals.Object.keys(row);
        if (keys.length < 4) return;
        const tanggal=row[keys[0]] || '-';
        const keterangan=row[keys[1]] || '-';
        const kategori=(0,__f4.globals.String)(row[keys[2]] || '').trim();
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
        const month = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-bulan').value);
        const year = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-tahun').value);
        batasSaldo = new __f4.globals.Date(year, month + 1, 0, 23, 59, 59, 999);
      } else if (tipe === 'rentang') {
        const akhir = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-bulan-akhir').value);
        const year = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-tahun-rentang').value);
        batasSaldo = new __f4.globals.Date(year, akhir + 1, 0, 23, 59, 59, 999);
      } else if (tipe === 'tahunan') {
        const year = (0,__f4.globals.Number)(__f4.globals.document.getElementById('cetak-kas-tahun-full').value);
        batasSaldo = new __f4.globals.Date(year, 11, 31, 23, 59, 59, 999);
      }

      let totalMasukKumulatif = 0, totalKeluarKumulatif = 0;
      let masukSebelumnya = 0, keluarSebelumnya = 0;
      globalKeuanganData.forEach(row => {
        const keys = __f4.globals.Object.keys(row);
        if (keys.length < 4) return;
        const d = parseRowDate(row[keys[0]]);
        if (!d) return;
        const dt = new __f4.globals.Date(d.year, d.month, d.day || 1);
        const kategori = (0,__f4.globals.String)(row[keys[2]] || '').trim().toLowerCase();
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

      const tanggalCetak = new __f4.globals.Date().toLocaleDateString('id-ID', {day:'2-digit',month:'long',year:'numeric'});

      __f4.globals.F4Pdf.openHTML(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Laporan Keuangan Kas - ${escapeCetakKas(periode)}</title>
<style>
@page{size:A4 portrait;margin:11mm 12mm 12mm}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#1e293b;font-size:10.5px;line-height:1.42;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.header{display:flex;align-items:center;gap:12px;border-bottom:2px solid #1e293b;padding-bottom:9px;margin-bottom:10px;break-inside:avoid;page-break-inside:avoid}.logo{width:54px;height:54px;object-fit:contain}.headtext{flex:1}.headtext h1{font-size:17px;margin:0 0 3px;font-weight:800}.headtext p{margin:2px 0;color:#475569}.periode{font-weight:700;color:#312e81}.badge{font-size:9px;font-weight:700;border:1px solid #000;background:#eef2ff;color:#3730a3;padding:4px 7px;border-radius:12px;white-space:nowrap}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:9px 0 11px;break-inside:avoid;page-break-inside:avoid}.metric{border:1px solid #000;border-radius:5px;padding:8px}.mlabel{font-size:8.5px;color:#64748b;text-transform:uppercase;font-weight:700}.mvalue{font-size:13.5px;font-weight:800;margin-top:3px}.masuk{color:#047857}.keluar{color:#be123c}.saldo{color:#3730a3}.tersedia{color:#0f766e}
h2{font-size:12px;margin:10px 0 5px;color:#1e293b}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}tfoot{display:table-footer-group}tr{break-inside:avoid;page-break-inside:avoid}th{background:#f1f5f9;color:#334155;font-size:10.5px;text-align:center;border:1px solid #000;padding:3px 5px}td{border:1px solid #000;padding:3px 5px;vertical-align:middle;overflow-wrap:anywhere}.c{text-align:center}.r{text-align:right}.nowrap{white-space:nowrap}.empty{text-align:center;color:#64748b;padding:12px}
.totalbox{margin-top:8px;border:1px solid #000;background:#f8fafc;padding:7px 9px;display:grid;grid-template-columns:1fr auto;gap:3px 12px;break-inside:avoid;page-break-inside:avoid}.totalbox strong{font-size:11.5px}.approval{margin-top:15mm;text-align:center;break-inside:avoid;page-break-inside:avoid}.approval>div{width:75mm;max-width:100%;margin:0 auto}.sign-title{font-size:10px;margin-bottom:23mm}.sign-line{border-top:1px solid #000;padding-top:4px;font-size:10px;font-weight:700}.note{margin-top:8px;font-size:8.5px;color:#64748b;border-top:1px solid #000;padding-top:5px}
@media screen{body{max-width:186mm;margin:14px auto;padding:0 4px;background:white}}
</style></head><body>
<header class="header"><img class="logo" src="https://flamboyan4.web.id/assets/logo-flamboyan.svg?v=official-20261027-v2" alt="Logo"><div class="headtext"><h1>LAPORAN KEUANGAN KAS WARGA FLAMBOYAN 4</h1><p>RT 001 RW 026 Pesona Kahuripan 2</p><p class="periode">${escapeCetakKas(periode)}</p></div><span class="badge">LAPORAN KAS</span></header>
<div class="summary"><div class="metric"><div class="mlabel">Saldo Sebelumnya</div><div class="mvalue saldo">${escapeCetakKas(formatRupiah(saldoSebelumnya))}</div></div><div class="metric"><div class="mlabel">${escapeCetakKas(labelSaldoKasPeriode)}</div><div class="mvalue masuk">${escapeCetakKas(formatRupiah(saldo))}</div></div><div class="metric"><div class="mlabel">${escapeCetakKas(labelSaldoAkhir)}</div><div class="mvalue tersedia">${escapeCetakKas(formatRupiah(saldoTersedia))}</div></div></div>
<h2>Rincian Transaksi</h2><table><colgroup><col style="width:6%"><col style="width:17%"><col style="width:43%"><col style="width:17%"><col style="width:17%"></colgroup><thead><tr><th class="c">No</th><th>Tanggal</th><th>Keterangan</th><th class="r">Debit</th><th class="r">Kredit</th></tr></thead><tbody>${rows}</tbody></table>
<div class="totalbox"><span>Total Kas Masuk</span><strong class="masuk">${escapeCetakKas(formatRupiah(totalMasuk))}</strong><span>Total Kas Keluar</span><strong class="keluar">${escapeCetakKas(formatRupiah(totalKeluar))}</strong></div>

<section class="approval"><div><div class="sign-title">Mengetahui,<br>Humas Flamboyan 4</div><div class="sign-line">Heri Juwandi</div></div></section>
<div class="note">Dicetak pada ${escapeCetakKas(tanggalCetak)} • Flamboyan 4 • Data bersumber dari pembukuan kas pada flamboyan4.web.id</div>
</body></html>`);
      closeModalCetakKas();
    }

    // Konsisten dengan judul transaksi di Pembukuan; hanya mengubah teks tampilan.
    // Jurnal D1, kategori, nominal dan tanggal sama sekali tidak dimodifikasi.
    function f4PublicCashReadableNote(item) {
      const note=(0,__f4.globals.String)(item?.keterangan||item?.kategori||'-').trim();
      const isFine=/^Denda Gorol\b/i.test(note);
      if(isFine){
        const parts=note.match(/^Denda Gorol\s+([A-Za-z]+)(?:\s+(20\d{2}))?/i);
        const countMatches=[...note.matchAll(/\b(\d+)\s*(?:pembayaran|warga|orang)\b/gi)];
        const count=(0,__f4.globals.Number)(countMatches.at(-1)?.[1]||0);
        const year=parts?.[2]||(0,__f4.globals.String)(item?.tanggal||'').slice(0,4);
        if(parts?.[1]&&count>0)
          return 'Denda Gorol '+parts[1]+( /^20\d{2}$/.test(year)?' '+year:'' )+' • '+count+' warga';
      }
      return note.replace(/(\s*•\s*\d+\s+pembayaran)\1\s*$/i,'$1');
    }

    // PROSES PERHITUNGAN KEUANGAN - LANGSUNG DARI BACKEND PEMBUKUAN
    let f4CashLoadGeneration=0;
    async function loadKeuanganDariPembukuan() {
      if(!f4CanReadKas())return;
      const generation=++f4CashLoadGeneration;
      try {
        const statusEl = __f4.globals.document.getElementById('loading-status');
        const kasToken=__f4.globals.F4Loading.begin(statusEl,'Memuat laporan keuangan warga…');

        // Laporan publik wajib memakai D1 dan tidak memakai data uji.
        const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/v2/public/portal/cash',{
          mode:'cors',credentials:'include',cache:'no-store',headers:{'Accept':'application/json'}
        });
        const result=await response.json().catch(()=>{throw (0,__f4.globals.Error)('Respons laporan kas tidak dapat dibaca.');});
        if(generation!==f4CashLoadGeneration||!f4CanReadKas())return;
        if(!response.ok||result?.ok!==true||!__f4.globals.Array.isArray(result?.data?.rows))
          throw (0,__f4.globals.Error)(result?.error||'Laporan kas belum dapat dibaca.');
        const sourceRows = __f4.globals.Array.isArray(result.data.rows) ? result.data.rows : [];

        // Bentuk data disamakan dengan struktur lama supaya tampilan, modal,
        // pencarian dan cetak laporan yang sudah stabil tidak perlu dirombak.
        const rawData = sourceRows.map(item => {
          const jenisBackend = (item.jenis || '').toString().trim().toLowerCase();
          const debit = (0,__f4.globals.Number)(item.debit || 0);
          const kredit = (0,__f4.globals.Number)(item.kredit || 0);

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
          const jumlah = (0,__f4.globals.Number)(row.Nominal || 0);

          if (kategori === 'pemasukan') totalPemasukanAll += jumlah;
          else if (kategori === 'pengeluaran') totalPengeluaranAll += jumlah;

          const parsed = parseRowDate(row.Tanggal);
          if (parsed) {
            const key = `${parsed.year}-${(0,__f4.globals.String)(parsed.month + 1).padStart(2, '0')}`;
            if (!monthlyMap[key]) {
              monthlyMap[key] = { year: parsed.year, month: parsed.month, pemasukan: 0, pengeluaran: 0 };
            }
            if (kategori === 'pemasukan') monthlyMap[key].pemasukan += jumlah;
            else if (kategori === 'pengeluaran') monthlyMap[key].pengeluaran += jumlah;
          }
        });

        monthlyKeuanganList = __f4.globals.Object.values(monthlyMap).sort((a, b) => {
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
            const el=__f4.globals.document.getElementById(id);
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
            const ta = da ? new __f4.globals.Date(da.year, da.month, da.day || 1).getTime() : 0;
            const tb = db ? new __f4.globals.Date(db.year, db.month, db.day || 1).getTime() : 0;
            return tb - ta || a.originalIndex - b.originalIndex;
          }).map(item => item.row);
        renderKasWargaTransactions();
        const tbodyAllHTML=globalKeuanganData.map(row=>renderTableRow(row)).join('');
        __f4.globals.document.getElementById('tabel-transaksi-all').innerHTML=tbodyAllHTML||
          '<tr><td colspan="4" class="p-4 text-center text-slate-400">Belum ada transaksi</td></tr>';

        __f4.globals.document.getElementById('total-pemasukan-all').innerText = formatRupiah(totalPemasukanAll);
        __f4.globals.document.getElementById('total-pengeluaran-all').innerText = formatRupiah(totalPengeluaranAll);
        __f4.globals.document.getElementById('sisa-saldo').innerText = formatRupiah(sisaSaldo);

        __f4.globals.F4Loading.success(statusEl,kasToken);

        // Update mengikuti transaksi paling baru dari Buku Kas.
        if (globalKeuanganData.length > 0 && globalKeuanganData[0].Tanggal) {
          const updateEl = __f4.globals.document.getElementById('label-update-kas');
          if (updateEl) updateEl.innerText = 'Transaksi terakhir: ' + formatTanggalKeuanganDisplay(globalKeuanganData[0].Tanggal);
        }

        // Saldo total Pembukuan dipakai sebagai pembanding target Gapura,
        // bukan berarti seluruh uang kas dialokasikan khusus untuk proyek.

      } catch (err) {
        if(generation!==f4CashLoadGeneration||!f4CanReadKas())return;
        __f4.globals.console.error('Gagal memuat keuangan dari Pembukuan:', err);
        const statusEl = __f4.globals.document.getElementById('loading-status');
        __f4.globals.F4Loading.error(statusEl,'Gagal menghubungkan keuangan: '+(err.message||err));
        for (const id of ['pemasukan-bulan-ini','pengeluaran-bulan-ini','saldo-bulan','total-pemasukan-all','total-pengeluaran-all','sisa-saldo']) {
          const el=__f4.globals.document.getElementById(id);
          if(el)el.textContent='—';
        }
      }
    }

    __f4.globals.document.addEventListener('f4:cash-access-change',()=>{
      ++f4CashLoadGeneration;
      if(f4CanReadKas()){void loadKeuanganDariPembukuan();return;}
      globalKeuanganData=[];monthlyKeuanganList=[];
      for(const id of ['modal-keuangan','modal-cetak-kas'])__f4.globals.document.getElementById(id)?.classList.add('hidden');
      for(const id of ['tabel-transaksi','tabel-transaksi-all'])__f4.globals.document.getElementById(id)?.replaceChildren();
      for(const id of ['pemasukan-bulan-ini','pengeluaran-bulan-ini','saldo-bulan','total-pemasukan-all','total-pengeluaran-all','sisa-saldo']){
        const node=__f4.globals.document.getElementById(id);if(node)node.textContent='—';
      }
      __f4.globals.document.getElementById('btn-container-keuangan-all')?.classList.add('hidden');
      const label=__f4.globals.document.getElementById('label-update-kas');if(label)label.textContent='Data Kas';
    });
    if (__f4.globals.document.readyState === 'complete') {
      (0,__f4.globals.setTimeout)(loadKeuanganDariPembukuan, 0);
    } else {
      __f4.window.addEventListener('load', loadKeuanganDariPembukuan, { once: true });
    }

    // Calendar-aware Arisan cards. The source schedule is read as-is; only
    // month selection and the scroll target change, never the source data.
    const f4ArisanMonthNames=['januari','februari','maret','april','mei','juni',
      'juli','agustus','september','oktober','november','desember'];
    function f4ArisanCurrentPeriod(){
      const parts=new __f4.globals.Intl.DateTimeFormat('en-GB',{
        timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit'
      }).formatToParts(new __f4.globals.Date());
      const year=(0,__f4.globals.Number)(parts.find(x=>x.type==='year')?.value);
      const month=(0,__f4.globals.Number)(parts.find(x=>x.type==='month')?.value);
      return {year,month,key:year*12+month};
    }
    function f4ArisanRowPeriod(row){
      const raw=(0,__f4.globals.String)(__f4.globals.Object.values(row||{})[0]||'').toLowerCase().trim();
      const numeric=raw.match(/(?:^|\D)(20\d{2})[-/](0?[1-9]|1[012])(?:\D|$)/);
      if(numeric)return (0,__f4.globals.Number)(numeric[1])*12+(0,__f4.globals.Number)(numeric[2]);
      const year=(raw.match(/\b20\d{2}\b/)||[])[0];
      const month=f4ArisanMonthNames.findIndex(name=>
        new __f4.globals.RegExp('(?:^|[^a-z])'+name+'(?:[^a-z]|$)').test(raw));
      return year&&month>=0?(0,__f4.globals.Number)(year)*12+month+1:null;
    }
    function refreshArisanCards(){
      if(!globalArisanData.length)return;
      const now=f4ArisanCurrentPeriod();
      arisanLastMonthKey=(0,__f4.globals.String)(now.key);
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
      const get=(id)=>__f4.globals.document.getElementById(id);
      const values=row=>__f4.globals.Object.values(row||{});
      const host=(prefix,row)=>{
        const raw=(0,__f4.globals.String)(values(row)[1]||'').trim();
        const match=raw.match(/(?:\s|^)(?:blok\s+)?([A-Za-z]\s*\d+\s*[/.-]\s*\d+[A-Za-z]?)\s*$/i);
        const name=get(prefix+'-nama'),address=get(prefix+'-alamat');
        name.textContent=raw?(match?raw.slice(0,match.index).trim():raw)||raw:'Belum dijadwalkan';
        address.textContent=match?match[1].replace(/\s+/g,'').toUpperCase():'';
        address.hidden=!match;
      };
      host('arisan-bulan-ini',current);
      const periodLabel=(raw)=>{
        const period=(0,__f4.globals.String)(raw||'').trim();
        const short=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        const compact=period.replace(/\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/gi,m=>short[f4ArisanMonthNames.indexOf(m.toLowerCase())]||m);
        return 'Arisan '+compact;
      };
      get('arisan-bulan-ini-tgl').textContent=periodLabel(current?values(current)[0]:f4ArisanMonthNames[now.month-1]+' '+now.year);
      host('arisan-selanjutnya',following);
      get('arisan-selanjutnya-tgl').textContent=following?
        periodLabel(values(following)[0]):'Arisan berikutnya';
      const icon=get('arisan-bulan-ini-icon-bg');
      if(icon){
        const status=(0,__f4.globals.String)(values(current)[2]||'').toLowerCase();
        const done=/sudah|selesai|lunas/.test(status);
        icon.className=done?'shrink-0 text-emerald-100':
          'shrink-0 text-white';
        icon.innerHTML='<i data-lucide="home" class="w-6 h-6"></i>';
        icon.title=done?'Arisan selesai':'';
        __f4.window.lucide?.createIcons();
      }
      filterArisanModal();
    }
    function checkArisanMonthChange(){
      if(!globalArisanData.length)return;
      if((0,__f4.globals.String)(f4ArisanCurrentPeriod().key)!==arisanLastMonthKey)refreshArisanCards();
    }
    __f4.globals.document.addEventListener('visibilitychange',()=>{if(!__f4.globals.document.hidden)checkArisanMonthChange()});
    __f4.window.addEventListener('pageshow',checkArisanMonthChange);
    // Also rolls the card forward while the page stays open across midnight.
    __f4.window.setInterval(()=>{if(!__f4.globals.document.hidden)checkArisanMonthChange()},60000);

    if (CSV_ARISAN_URL && CSV_ARISAN_URL.startsWith('http')) {
      __f4.globals.Papa.parse(CSV_ARISAN_URL, {
        download: true,
        header: true,
        complete: function(results) {
          const rawData = results.data.filter(row => {
            const values = __f4.globals.Object.values(row);
            return values.length >= 2 && values[0] && values[0].toString().trim() !== '';
          });

          globalArisanData = rawData;

          refreshArisanCards();
          __f4.globals.F4Loading.success('loading-status-arisan');
          __f4.globals.lucide.createIcons();
        },
        error:function(err){__f4.globals.F4Loading.error('loading-status-arisan','Gagal memuat jadwal arisan: '+(err.message||err));}
      });
    } else {
      __f4.globals.F4Loading.empty('loading-status-arisan','Sumber jadwal arisan belum terhubung.');
    }

    function getNominalHargaJerseyRow(row) {
      if (!row) return 0;
      const keys = __f4.globals.Object.keys(row);
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

      const num = (0,__f4.globals.parseFloat)(strVal) || 0;
      return num;
    }

    function getStatusJerseyRow(row) {
      if (!row) return '';
      const keys = __f4.globals.Object.keys(row);
      
      let targetKey = keys.find(k => k.toLowerCase().trim().includes('status'));

      if (!targetKey) {
        if (keys.length >= 6) targetKey = keys[5];
        else targetKey = keys[keys.length - 1];
      }

      return (row[targetKey] || '').toString().trim();
    }

    function getJerseyTerimaEksplisit(row){
      const methodKey=__f4.globals.Object.keys(row||{}).find(k=>/keterangan|metode|method/i.test(k));
      const method=(0,__f4.globals.String)(row?.[methodKey]||'');
      const tags=[...method.matchAll(/\[F4BAYAR:(\d{1,12})\]/g)];
      return tags.length?(0,__f4.globals.Number)(tags[tags.length-1][1]):null;
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
      let amount=(0,__f4.globals.Number)(matches[1].replace(/[.,]/g,''));
      if(amount>0&&amount<1000)amount*=1000;
      return __f4.globals.Number.isFinite(amount)?amount:0;
    }
    function switchJerseyTab(tab) {
      const labels={bapak:'Bapak-bapak',ibu:'Ibu-ibu',anak:'Anak-anak'};
      currentJerseyTab=__f4.globals.Object.hasOwn(labels,tab)?tab:'bapak';
      const activeClass="flex-1 py-2 px-3 rounded-xl font-bold text-xs md:text-sm border transition flex items-center justify-center space-x-2 bg-indigo-600 text-white border-indigo-600 shadow-sm";
      const idleClass="flex-1 py-2 px-3 rounded-xl font-bold text-xs md:text-sm border transition flex items-center justify-center space-x-2 bg-white text-slate-600 border-slate-200 hover:bg-slate-100";
      for(const key of __f4.globals.Object.keys(labels)){
        const button=__f4.globals.document.getElementById('tab-jersey-'+key);
        if(!button)continue;
        button.className=key===currentJerseyTab?activeClass:idleClass;
        button.setAttribute('aria-pressed',(0,__f4.globals.String)(key===currentJerseyTab));
      }
      const labelTab=__f4.globals.document.getElementById('label-tab-kategori');
      if(labelTab)labelTab.innerText='('+labels[currentJerseyTab]+')';
      filterJerseyModal();
    }

    function escapeJerseyText(value) {
      return (0,__f4.globals.String)(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function jerseyPublicBackParts(x){
      const ownName=(0,__f4.globals.String)(x?.back_name??'').trim(),ownNumber=(0,__f4.globals.String)(x?.back_number??'').trim();
      if(x?.back_name!=null||x?.back_number!=null)return {name:ownName,number:ownNumber};
      const old=(0,__f4.globals.String)(x?.printed_name||'').trim();
      if(!old||/^\(?tanpa\s+nama\s*(?:\/\s*(?:no|nomor))?\)?$/i.test(old))return {name:'',number:''};
      const numberOnly=old.match(/^(\d{1,3})\s*\(\s*tanpa\s+nama\s*\)$/i);
      if(numberOnly)return {name:'',number:numberOnly[1]};
      const trailing=old.match(/^(.+?)\s+(\d{1,3})$/);
      return trailing?{name:trailing[1].trim(),number:trailing[2]}:{name:old,number:''};
    }
    function renderJerseyRow(row) {
      const keys = __f4.globals.Object.keys(row);
      
      const no = escapeJerseyText(row[keys[0]] || '-');
      // A guest only sees a pseudonymous row. The API must separately enforce its own privacy policy.
      const namaBlok = f4CanReadKas() ? escapeJerseyText(row[keys[1]] || '-') : ('Pemesan ' + no);
      const lengan = escapeJerseyText(row[keys[2]] || '-');
      const ukuran = escapeJerseyText(row[keys[3]] || '-');
      const namaPunggung = f4CanReadKas() ? escapeJerseyText(row['Nama Punggung'] || '-') : '—';
      const nomorPunggung = f4CanReadKas() ? escapeJerseyText(row['Nomor Punggung'] || '-') : '—';
      const paket = escapeJerseyText(row.Paket || '—');
      
      const totalHarga = getNominalHargaJerseyRow(row);
      const nominalMasuk = getNominalJerseyMasuk(row);
      const statusRaw = getStatusJerseyRow(row).toLowerCase();

      let statusBadge = `<span class="px-2 py-0.5 text-xs bg-slate-100 text-slate-400 rounded">-</span>`;

      if (totalHarga > 0 && nominalMasuk >= totalHarga) {
        statusBadge = `<span class="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-semibold rounded">Lunas</span>`;
      } else if (nominalMasuk > 0 && totalHarga > 0) {
        const persen = __f4.globals.Math.min(99, __f4.globals.Math.round((nominalMasuk / totalHarga) * 100));
        statusBadge = `<span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 font-semibold rounded">DP ${persen}%</span>`;
      }

      if (!f4CanReadKas()) statusBadge = '<span class="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">Terdaftar</span>';
      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 text-center text-slate-500 font-mono">${no}</td>
          <td class="p-3 font-bold text-slate-800 break-words">${namaBlok}</td>
          <td class="p-3 text-slate-600 whitespace-nowrap">${paket}</td>
          <td class="p-3 text-slate-600 whitespace-nowrap">${lengan}</td>
          <td class="p-3 font-semibold text-indigo-700 whitespace-nowrap">${ukuran}</td>
          <td class="p-3 text-slate-700 break-words">${namaPunggung}</td>
          <td class="p-3 text-slate-700 text-center whitespace-nowrap">${nomorPunggung}</td>
          <td class="p-3 text-right font-bold text-slate-800 whitespace-nowrap">${f4CanReadKas() && nominalMasuk > 0 ? formatRupiah(nominalMasuk) : '—'}</td>
          <td class="p-3 text-center whitespace-nowrap">${statusBadge}</td>
        </tr>
      `;
    }

    function filterJerseyModal() {
      const keyword = (__f4.globals.document.getElementById('search-jersey').value || '').toLowerCase();
      const activeData = currentJerseyTab==='bapak'?globalJerseyBapakData:
        currentJerseyTab==='ibu'?globalJerseyIbuData:globalJerseyAnakData;

      let html = '';
      let activeTotalTagihan = 0;
      let activeTerkumpul = 0;
      let activeSisa=0;
      let activeTitipan=0;

      activeData.forEach(row => {
        const text = __f4.globals.Object.values(row).join(' ').toLowerCase();
        if (text.includes(keyword)) {
          html += renderJerseyRow(row);
        }

        const totalHarga = getNominalHargaJerseyRow(row);
        const nominalMasuk = getNominalJerseyMasuk(row);

        activeTotalTagihan += totalHarga;
        activeTerkumpul += nominalMasuk;
        activeSisa+=__f4.globals.Math.max(0,totalHarga-nominalMasuk);
        activeTitipan+=__f4.globals.Math.max(0,nominalMasuk-totalHarga);
      });

      // Jangan gunakan titipan kelebihan satu warga untuk melunasi warga lain.

      __f4.globals.document.getElementById('modal-jersey-total-tagihan').innerText = formatRupiah(activeTotalTagihan);
      __f4.globals.document.getElementById('modal-jersey-terkumpul').innerText = formatRupiah(activeTerkumpul);
      __f4.globals.document.getElementById('modal-jersey-sisa').innerText = formatRupiah(activeSisa);
      const labelTitipan=__f4.globals.document.getElementById('modal-jersey-titipan');
      if(labelTitipan){
        labelTitipan.hidden=activeTitipan<=0;
        labelTitipan.textContent=activeTitipan>0?'Titipan: '+formatRupiah(activeTitipan):'';
      }

      __f4.globals.document.getElementById('tabel-jersey-all').innerHTML = html || `<tr><td colspan="9" class="p-4 text-center text-slate-400">Tidak ada pemesan ${{bapak:'Bapak-bapak',ibu:'Ibu-ibu',anak:'Anak-anak'}[currentJerseyTab]} yang cocok</td></tr>`;
    }

    function calculateTotalJerseyRekap() {
      const allCombined = [...globalJerseyBapakData, ...globalJerseyIbuData, ...globalJerseyAnakData];
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

      __f4.globals.document.getElementById('total-pemesan-jersey').innerText = `${allCombined.length} Orang`;
      __f4.globals.document.getElementById('total-lunas-jersey').innerText = `${countLunas} Orang`;
      __f4.globals.document.getElementById('total-dp-jersey').innerText = `${countDP} Orang`;

      __f4.globals.document.getElementById('card-jersey-terkumpul').innerText = formatRupiah(grandTotalTerkumpul);

      __f4.globals.document.getElementById('badge-count-bapak').innerText = globalJerseyBapakData.length;
      __f4.globals.document.getElementById('badge-count-ibu').innerText = globalJerseyIbuData.length;
      __f4.globals.document.getElementById('badge-count-anak').innerText = globalJerseyAnakData.length;
    }

    // One D1 read for all three Jersey groups; no legacy CSV sheets.
    (async function loadJerseyOrders(){
      try{
        const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/v2/public/portal',{cache:'no-store'});
        if(!response.ok)throw (0,__f4.globals.Error)('HTTP '+response.status);
        const data=await response.json();
        if(data.ok===false)throw (0,__f4.globals.Error)(data.error||'Data tidak tersedia');
        const makeRow=x=>{
          const back=jerseyPublicBackParts(x);
          return {
            'No':x.sort_order,'Nama & Blok':x.resident,'Lengan':x.sleeves,
            'Ukuran':x.size,'Nama Punggung':back.name,'Nomor Punggung':back.number,
            'Status Pembayaran':x.payment_status,'Pembayaran':x.nominal_rp,
            'Keterangan':x.method,
            'Paket':x.package_type==='atasan'?'Atasan saja':x.package_type==='set'?'Atasan + Celana':''
          };
        };
        globalJerseyBapakData=(data.jerseyBapak||[]).map(makeRow);
        globalJerseyIbuData=(data.jerseyIbu||[]).map(makeRow);
        globalJerseyAnakData=(data.jerseyAnak||[]).map(makeRow);
        calculateTotalJerseyRekap();
        filterJerseyModal();
      }catch(error){
        __f4.globals.console.error('Daftar Jersey D1 gagal dimuat:',error);
      }
    })();

    if(__f4.window.lucide?.createIcons)__f4.window.lucide.createIcons();

    function scrollDokumentasi(direction) {
      // Dipertahankan untuk kompatibilitas tombol/skrip lama jika masih terpanggil.
      const slider = __f4.globals.document.getElementById('slider-dokumentasi');
      if (!slider) return;
      const cardWidth = slider.querySelector('div')?.offsetWidth || 320;
      slider.scrollBy({ left: direction * (cardWidth + 16), behavior: 'smooth' });
    }

    function updateDokumentasiPreview() {
      if (!globalDokumentasiPreview.length) return;
      if (dokumentasiPreviewIndex >= globalDokumentasiPreview.length) dokumentasiPreviewIndex = 0;
      const item = globalDokumentasiPreview[dokumentasiPreviewIndex];
      const img = __f4.globals.document.getElementById('dokumentasi-preview-img');
      const tanggal = __f4.globals.document.getElementById('dokumentasi-preview-tanggal');
      const judul = __f4.globals.document.getElementById('dokumentasi-preview-judul');
      const desc = __f4.globals.document.getElementById('dokumentasi-preview-desc');
      const counter = __f4.globals.document.getElementById('dokumentasi-preview-counter');
      if (!img) return;

      img.style.opacity = '0.25';
      (0,__f4.globals.setTimeout)(() => {
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
      if (dokumentasiPreviewTimer) (0,__f4.globals.clearInterval)(dokumentasiPreviewTimer);
      if (globalDokumentasiPreview.length <= 1) return;
      dokumentasiPreviewTimer = (0,__f4.globals.setInterval)(() => {
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
      const container = __f4.globals.document.getElementById('container-inventaris-warga');
      const badge = __f4.globals.document.getElementById('inventaris-warga-count');
      if (!container) return;

      if (!CSV_INVENTARIS_WARGA_URL || !CSV_INVENTARIS_WARGA_URL.startsWith('http')) {
        container.innerHTML = `<div class="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
          <i data-lucide="clipboard-list" class="w-5 h-5 text-slate-400 mx-auto mb-2"></i>
          <p class="text-xs font-semibold text-slate-600">Data inventaris</p>
          <p class="text-[10px] text-slate-400 mt-1">Inventaris belum tersedia.</p>
        </div>`;
        if (badge) badge.innerText = 'Belum Terhubung';
        if (__f4.window.lucide) __f4.globals.lucide.createIcons();
        return;
      }

      __f4.globals.Papa.parse(CSV_INVENTARIS_WARGA_URL, {
        download: true,
        header: true,
        complete: function(results) {
          const rows = results.data.filter(row => __f4.globals.Object.values(row).some(v => (0,__f4.globals.String)(v || '').trim() !== ''));
          let items = [];
          rows.forEach(row => {
            const vals = __f4.globals.Object.values(row);
            const nama = (0,__f4.globals.String)(vals[0] || '').trim();
            if (!nama || nama.toLowerCase().includes('nama barang')) return;
            const qty = (0,__f4.globals.String)(vals[1] || '0').trim();
            const kondisi = (0,__f4.globals.String)(vals[2] || '').trim();
            const rawFoto = (0,__f4.globals.String)(vals[3] || '').trim();
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
          if (__f4.window.lucide) __f4.globals.lucide.createIcons();
        },
        error: function() {
          container.innerHTML = '<p class="text-xs text-rose-500">Gagal memuat inventaris warga.</p>';
        }
      });
    }

    if (CSV_DOKUMENTASI_URL && CSV_DOKUMENTASI_URL.startsWith('http')) {
      __f4.globals.Papa.parse(CSV_DOKUMENTASI_URL, {
        download: true,
        header: true,
        complete: async function(results) {
          const rawData = results.data.filter(row => {
            const values = __f4.globals.Object.values(row);
            return values.length >= 2 && values[0] && values[0].toString().trim() !== '';
          });

          const displayData = [...rawData].reverse();
          const f4IndexedPhotos = await f4ReadPortalPhotoIndex().catch(()=>({folders:{}}));
          let allHTML = '';
          globalDokumentasiPreview = [];

          for (let index = 0; index < displayData.length; index++) {
            const row = displayData[index];
            const keys = __f4.globals.Object.keys(row);
            const tanggal = row[keys[0]];
            const judul = row[keys[1]];
            const deskripsi = row[keys[2]] || '';
            let rawFotoString = row[keys[3]] || '';

            const folderId = extractFolderId(rawFotoString);
            let firstFoto = PLACEHOLDER_IMG;
            let badgeText = '';

            if (folderId) {
              const indexed=f4ProjectFolderItems(f4IndexedPhotos.folders?.[folderId]);
              firstFoto=indexed.find(item=>item.type==='image')?.url||PLACEHOLDER_IMG;
              badgeText=indexed.length?indexed.length+' Foto/Video':'Album Media';
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

            allHTML += `<div role="button" tabindex="0" onclick="openGalleryGridModal('${safePhotoString}', '${safeTitle}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openGalleryGridModal('${safePhotoString}', '${safeTitle}')}" class="bg-white rounded-card shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-300 transition flex flex-col w-full h-full cursor-pointer group active:scale-[0.99]">
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

          const previewImg = __f4.globals.document.getElementById('dokumentasi-preview-img');
          if (!globalDokumentasiPreview.length && previewImg) {
            previewImg.src = PLACEHOLDER_IMG;
            __f4.globals.document.getElementById('dokumentasi-preview-judul').innerText = 'Belum ada dokumentasi';
            __f4.globals.document.getElementById('dokumentasi-preview-desc').innerText = 'Dokumentasi kegiatan akan tampil di sini';
            __f4.globals.document.getElementById('dokumentasi-preview-tanggal').innerText = 'Dokumentasi';
          } else {
            dokumentasiPreviewIndex = 0;
            updateDokumentasiPreview();
            mulaiRotasiDokumentasiPreview();
          }

          __f4.globals.document.getElementById('container-dokumentasi-all').innerHTML = allHTML || '<p class="text-slate-400 text-sm col-span-1 md:col-span-3">Belum ada album.</p>';
          if (__f4.window.lucide) __f4.globals.lucide.createIcons();
        },
        error:function(err){
          const holder=__f4.globals.document.getElementById('container-dokumentasi-all');
          if(holder&&!globalDokumentasiPreview.length){
            holder.replaceChildren();
            const message=__f4.globals.document.createElement('p');
            message.className='text-xs text-rose-700';message.textContent='Dokumentasi belum dapat diperbarui: '+(err.message||err);
            const retry=__f4.globals.document.createElement('button');retry.type='button';retry.textContent='Coba Lagi';retry.onclick=()=>__f4.globals.location.reload();
            holder.append(message,retry);
            __f4.globals.document.getElementById('dokumentasi-preview-judul').textContent='Galeri gagal dimuat';
          }
        }
      });
    }

    loadInventarisWarga();

    // Mobile calendar and upcoming preview use the same official agenda records.
    const f4AgendaPreview=__f4.globals.document.getElementById('f4-upcoming-agenda');
    const f4AgendaPagination=__f4.globals.document.getElementById('f4-agenda-pagination');
    let f4OpenAgendaKey='',f4AgendaSignature=null;
    function f4AgendaKey(item){return (item.parsedDate||'')+'|'+(item.judul||'');}
    function f4SyncAgendaCards(){
      const open=__f4.globals.document.getElementById('rencana').dataset.calendarOpen==='true';
      for(const card of f4AgendaPreview.querySelectorAll('button')){
        const expanded=open&&card.dataset.agendaKey===f4OpenAgendaKey;
        card.setAttribute('aria-expanded',(0,__f4.globals.String)(expanded));
        const arrow=card.querySelector('.f4-agenda-chevron');
        if(arrow)arrow.setAttribute('data-expanded',(0,__f4.globals.String)(expanded));
      }
    }
    function f4ToggleAgendaCalendar(item){
      const section=__f4.globals.document.getElementById('rencana'),key=item?f4AgendaKey(item):'';
      const open=section.dataset.calendarOpen!=='true'||f4OpenAgendaKey!==key;
      f4OpenAgendaKey=open?key:'';
      section.dataset.calendarOpen=(0,__f4.globals.String)(open);
      if(open&&item){
        const date=f4ScheduleDate(item.parsedDate);
        if(date)calendarDate=new __f4.globals.Date(date.getUTCFullYear(),date.getUTCMonth(),1);
        renderCalendar();
      }
      f4SyncAgendaCards();
    }
    function f4AgendaCurrentIndex(){
      const cards=[...f4AgendaPreview.children].filter(x=>x.matches('button'));
      if(!cards.length)return 0;
      let index=0;
      cards.forEach((card,i)=>{if(__f4.globals.Math.abs(card.offsetLeft-cards[0].offsetLeft-f4AgendaPreview.scrollLeft)<__f4.globals.Math.abs(cards[index].offsetLeft-cards[0].offsetLeft-f4AgendaPreview.scrollLeft))index=i;});
      return index;
    }
    function f4UpdateAgendaPagination(){
      const count=f4AgendaPreview.querySelectorAll('button').length;
      if(count<=1){f4AgendaPagination.replaceChildren();return;}
      const index=f4AgendaCurrentIndex(),progress=__f4.globals.document.createElement('span');
      progress.className='f4-agenda-page-track';progress.setAttribute('aria-hidden','true');
      const thumb=__f4.globals.document.createElement('span');thumb.className='f4-agenda-page-thumb';
      const width=__f4.globals.Math.max(15,100/count);
      thumb.style.width=width+'%';
      thumb.style.left=((100-width)*index/(count-1))+'%';
      progress.append(thumb);
      const label=__f4.globals.document.createElement('span');label.className='f4-agenda-page-count';label.textContent=(index+1)+' / '+count;
      f4AgendaPagination.replaceChildren(progress,label);
    }
    f4AgendaPreview.addEventListener('scroll',f4UpdateAgendaPagination,{passive:true});
    __f4.window.addEventListener('resize',f4UpdateAgendaPagination,{passive:true});
    function f4AgendaPreviewCard(item){
      const card=__f4.globals.document.createElement('button');card.type='button';card.className='f4-agenda-preview-card';
      card.dataset.agendaKey=f4AgendaKey(item);
      card.dataset.kind=item.isBank?'bank':item.isGorol?'gorol':'community';
      card.setAttribute('aria-controls','calendar-wrapper');
      card.setAttribute('aria-expanded','false');
      const make=(className,value)=>{const node=__f4.globals.document.createElement('span');node.className=className;if(value!==__f4.globals.undefined)node.textContent=value;return node;};
      const date=f4ScheduleDate(item.parsedDate);
      const format=options=>date?new __f4.globals.Intl.DateTimeFormat('id-ID',{...options,timeZone:'UTC'}).format(date):'';
      const tile=make('f4-agenda-date-tile');
      tile.append(make('f4-agenda-tile-month',format({month:'short'})),make('f4-agenda-tile-day',date?(0,__f4.globals.String)(date.getUTCDate()).padStart(2,'0'):'—'),make('f4-agenda-tile-year',format({year:'numeric'})));
      const copy=make('f4-agenda-preview-copy');
      const category=item.isBank?'Bank Sampah':item.isGorol?'Kerja Bakti':/arisan/i.test(item.judul||'')?'Arisan':'Kegiatan warga';
      copy.append(make('f4-agenda-preview-category',category),make('f4-agenda-preview-title',item.judul),make('f4-agenda-preview-weekday',format({weekday:'long'})));
      const arrow=make('f4-agenda-chevron');arrow.setAttribute('aria-hidden','true');
      arrow.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
      card.append(tile,copy,arrow);
      card.addEventListener('click',()=>f4ToggleAgendaCalendar(item));
      return card;
    }
    function f4AgendaRow(item){
      const button=__f4.globals.document.createElement('button');button.type='button';button.className='f4-agenda-row';
      const header=__f4.globals.document.createElement('span');header.className='f4-agenda-row-top';
      const date=__f4.globals.document.createElement('span');date.className='f4-agenda-date';date.textContent=item.tanggalStr;
      const badge=__f4.globals.document.createElement('span');badge.className='f4-agenda-status';
      const status=(0,__f4.globals.String)(item.status||'').toLowerCase();
      if(/progress|rancang|jalan/.test(status)){badge.classList.add('is-progress');badge.textContent='On Progress'}
      else if(/selesai/.test(status)){badge.classList.add('is-done');badge.textContent='Selesai'}
      else{badge.textContent='Direncanakan'}
      if(item.isBank){badge.classList.add('is-bank');badge.textContent='Bank Sampah';}
      header.append(date,badge);
      const title=__f4.globals.document.createElement('span');title.className='f4-agenda-title';title.textContent=item.judul;
      button.append(header,title);
      button.addEventListener('click',()=>openModalEventDetail(item.tanggalStr,[item],item.parsedDate));
      return button;
    }
    // Bank Sampah uses the exact same published D1 schedule as its own portal.
    let f4BaseAgenda=[],f4BankAgenda=[],f4AgendaReady=false,f4BankAgendaBusy=false,f4BankAgendaCheckedAt=0;
    const f4AgendaToday=()=>new __f4.globals.Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new __f4.globals.Date()).reduce((parts,p)=>{parts[p.type]=p.value;return parts;},{}); 
    function f4AgendaTodayKey(){const p=f4AgendaToday();return p.year+'-'+p.month+'-'+p.day;}
    function f4ScheduleDate(value){
      if(!/^\d{4}-\d{2}-\d{2}$/.test((0,__f4.globals.String)(value||'')))return null;
      const date=new __f4.globals.Date(value+'T00:00:00Z');
      return __f4.globals.Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?date:null;
    }
    function f4BankScheduleRows(rule){
      const first=f4ScheduleDate(rule?.nextOccurrence);
      if(!rule?.ok||!first)return [];
      const rows=[],limit=new __f4.globals.Date(first);
      limit.setUTCMonth(limit.getUTCMonth()+6);
      const frequency=rule.frequency,day=(0,__f4.globals.Number)(rule.dayOfMonth);
      const format=new __f4.globals.Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'});
      for(let i=0;i<28;i++){
        let date=new __f4.globals.Date(first);
        if(i){
          if(frequency==='weekly'||frequency==='biweekly')date.setUTCDate(date.getUTCDate()+i*(frequency==='weekly'?7:14));
          else if(frequency==='monthly'&&__f4.globals.Number.isInteger(day)&&day>=1&&day<=31){
            const month=new __f4.globals.Date(__f4.globals.Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+i,1));
            const last=new __f4.globals.Date(__f4.globals.Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();
            date=new __f4.globals.Date(__f4.globals.Date.UTC(month.getUTCFullYear(),month.getUTCMonth(),__f4.globals.Math.min(day,last)));
          }else break;
        }
        if(date>=limit)break;
        const iso=date.toISOString().slice(0,10);
        const place=(0,__f4.globals.String)(rule.lokasi||rule.location||'').trim();
        rows.push({tanggalStr:format.format(date),parsedDate:iso,judul:'Penimbangan Bank Sampah',deskripsi:'Jadwal penimbangan rutin dari Portal Bank Sampah.'+(place?' Lokasi: '+place:''),status:'Direncanakan',isBank:true,isGorol:false,source:'bank-weighing'});
      }
      return rows;
    }
    function f4UpdateUnifiedAgenda(){
      const today=f4AgendaTodayKey();
      const isBank=item=>item.isBank||/penimbangan.*(?:bank\s*sampah|sampah)|bank\s*sampah.*penimbangan/i.test(item.judul||'');
      const base=f4BaseAgenda.map(item=>isBank(item)?{...item,isBank:true}:item);
      const manualDates=new __f4.globals.Set(base.filter(isBank).map(item=>item.parsedDate));
      globalRencanaData=[...base,...f4BankAgenda.filter(item=>!manualDates.has(item.parsedDate))];
      // Show the next scheduled bank event once in the overview; all recurring
      // dates are visible on the calendar and can be opened individually.
      const bankNext=globalRencanaData.filter(x=>x.source==='bank-weighing'&&x.parsedDate>=today).sort((a,b)=>a.parsedDate.localeCompare(b.parsedDate))[0];
      const display=globalRencanaData.filter(x=>x.source!=='bank-weighing'||x===bankNext);
      // Status takes precedence over date: ongoing work stays pinned above upcoming events.
      const group=x=>/selesai/i.test(x.status)?3:/progress|rancang|jalan/i.test(x.status)?0:x.parsedDate>=today?1:2;
      display.sort((a,b)=>group(a)-group(b)||(group(a)===1?a.parsedDate.localeCompare(b.parsedDate):b.parsedDate.localeCompare(a.parsedDate)));
      f4RenderAgenda(display,today);
      renderCalendar();
    }
    async function f4RefreshBankAgenda(force=false){
      if(f4BankAgendaBusy||(!force&&__f4.globals.Date.now()-f4BankAgendaCheckedAt<60000))return;
      f4BankAgendaBusy=true;
      const controller=new __f4.globals.AbortController(),timer=(0,__f4.globals.setTimeout)(()=>controller.abort(),5000);
      try{
        const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/public/bank/weighing-schedule',{cache:'no-store',signal:controller.signal});
        if(!response.ok)throw (0,__f4.globals.Error)('HTTP '+response.status);
        const rule=await response.json();
        const rows=f4BankScheduleRows(rule);
        if(!rows.length)throw (0,__f4.globals.Error)('Jadwal penimbangan tidak valid');
        f4BankAgenda=rows;f4BankAgendaCheckedAt=__f4.globals.Date.now();
        if(f4AgendaReady)f4UpdateUnifiedAgenda();
      }catch(error){__f4.globals.console.warn('Jadwal Bank Sampah belum tersedia:',error.message);}
      finally{(0,__f4.globals.clearTimeout)(timer);f4BankAgendaBusy=false;}
    }
    const f4InitialBankAgenda=f4RefreshBankAgenda(true);
    __f4.window.addEventListener('focus',()=>{if(f4AgendaReady)f4RefreshBankAgenda();});
    __f4.globals.document.addEventListener('visibilitychange',()=>{if(!__f4.globals.document.hidden&&f4AgendaReady)f4RefreshBankAgenda();});
    function f4RenderAgenda(displayData,todayKey){
      const list=__f4.globals.document.getElementById('container-rencana'),preview=__f4.globals.document.getElementById('f4-upcoming-agenda');
      const empty=text=>{const p=__f4.globals.document.createElement('p');p.className='text-slate-500 text-xs';p.textContent=text;return p};
      list.replaceChildren(...(displayData.length?displayData.map(item=>f4AgendaRow(item)):[empty('Belum ada agenda.')]));
      const next=globalRencanaData.filter(item=>/^\d{4}-\d{2}-\d{2}$/.test(item.parsedDate)&&item.parsedDate>=todayKey&&!/selesai/i.test(item.status))
       .sort((a,b)=>a.parsedDate.localeCompare(b.parsedDate));
      const signature=__f4.globals.JSON.stringify(next.map(x=>[f4AgendaKey(x),x.tanggalStr,x.status,x.isBank]));
      if(signature===f4AgendaSignature)return;
      const previous=preview.children[f4AgendaCurrentIndex()]?.dataset.agendaKey;
      f4AgendaSignature=signature;
      const cards=next.map(f4AgendaPreviewCard);
      if(!cards.length){
        const button=__f4.globals.document.createElement('button');button.type='button';button.className='f4-agenda-preview-card is-empty';
        button.dataset.agendaKey='';button.setAttribute('aria-controls','calendar-wrapper');
        const title=__f4.globals.document.createElement('span');title.className='f4-agenda-preview-title';title.textContent='Belum ada agenda mendatang';
        const arrow=__f4.globals.document.createElement('span');arrow.className='f4-agenda-chevron';arrow.setAttribute('aria-hidden','true');
        arrow.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';
        button.append(title,arrow);button.addEventListener('click',()=>f4ToggleAgendaCalendar(null));cards.push(button);
      }
      preview.replaceChildren(...cards);
      const restored=cards.find(x=>x.dataset.agendaKey===previous)||cards[0];
      preview.scrollLeft=restored.offsetLeft-cards[0].offsetLeft;
      f4SyncAgendaCards();f4UpdateAgendaPagination();
    }
    // FUNGSI RENDER KALENDER TERBARU
    function renderCalendar() {
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();

      __f4.globals.document.getElementById('calendar-month-year').innerText = `${monthNames[month]} ${year}`;

      const firstDayObj = new __f4.globals.Date(year, month, 1);
      const firstDay = firstDayObj.getDay();
      const daysInMonth = new __f4.globals.Date(year, month + 1, 0).getDate();
      const prevMonthDays = new __f4.globals.Date(year, month, 0).getDate();
      
      const today = new __f4.globals.Date();
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

      // Agenda bridge resolves monthly arisan placeholders to the agreed Saturday
      // and preserves explicitly scheduled dates from D1.

      let gridHTML = '';

      for (let i = firstDay - 1; i >= 0; i--) {
        const prevDayNum = prevMonthDays - i;
        gridHTML += `
          <div class="f4-calendar-day f4-calendar-outside">
            <span class="f4-calendar-number">${prevDayNum}</span><span class="f4-calendar-dots" aria-hidden="true"></span>
          </div>
        `;
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${(0,__f4.globals.String)(month + 1).padStart(2, '0')}-${(0,__f4.globals.String)(day).padStart(2, '0')}`;
        
        let dayEvents = globalRencanaData.filter(item => item.parsedDate === dateKey);

        const hasEvent=dayEvents.length>0;
        const isToday=isCurrentMonth&&day===today.getDate();
        const kinds=new __f4.globals.Set();
        for(const event of dayEvents){
          if(event.isGorol)kinds.add('gorol');
          if(event.isBank)kinds.add('bank');
          if(event.isArisan||(!event.isGorol&&!event.isBank)||((event.judul||'')+' '+(event.deskripsi||'')).toLowerCase().includes('arisan'))kinds.add('activity');
        }
        const safeDateStr=`${day} ${monthNames[month]} ${year}`;
        const clickAttr=hasEvent?`role="button" tabindex="0" data-agenda-date="${dateKey}" aria-label="${safeDateStr}, ${dayEvents.length} kegiatan"`:'';
        const dots=['gorol','activity','bank'].filter(kind=>kinds.has(kind)).map(kind=>`<span class="f4-calendar-dot" data-kind="${kind}"></span>`).join('');
        gridHTML+=`
          <div class="f4-calendar-day${isToday?' f4-calendar-today':''}" ${clickAttr} ${isToday?'aria-current="date"':''}>
            <span class="f4-calendar-number">${day}</span>
            <span class="f4-calendar-dots" aria-hidden="true">${dots}</span>
          </div>
        `;
      }

      const totalCellsUsed = firstDay + daysInMonth;
      const totalGridCells = totalCellsUsed <= 35 ? 35 : 42;
      const nextDaysCount = totalGridCells - totalCellsUsed;

      for (let nextDayNum = 1; nextDayNum <= nextDaysCount; nextDayNum++) {
        gridHTML += `
          <div class="f4-calendar-day f4-calendar-outside">
            <span class="f4-calendar-number">${nextDayNum}</span><span class="f4-calendar-dots" aria-hidden="true"></span>
          </div>
        `;
      }

      const grid=__f4.globals.document.getElementById('calendar-days-grid');grid.innerHTML=gridHTML;
      for(const cell of grid.querySelectorAll('[data-agenda-date]')){
        const activate=()=>{const iso=cell.dataset.agendaDate;openModalEventDetail(new __f4.globals.Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new __f4.globals.Date(iso+'T00:00:00Z')),globalRencanaData.filter(x=>x.parsedDate===iso),iso);};
        cell.addEventListener('click',activate);cell.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});
      }
      __f4.window.lucide?.createIcons?.();
    }

    function changeMonth(direction) {
      calendarDate.setMonth(calendarDate.getMonth() + direction);
      renderCalendar();
    }

    function resetToCurrentMonth() {
      calendarDate = new __f4.globals.Date();
      renderCalendar();
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const calWrapper = __f4.globals.document.getElementById('calendar-wrapper');
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
      
      if (__f4.globals.Math.abs(swipeDistanceX) > __f4.globals.Math.abs(swipeDistanceY) && __f4.globals.Math.abs(swipeDistanceX) > 40) {
        if (swipeDistanceX < 0) {
          changeMonth(1);
        } else {
          changeMonth(-1);
        }
      }
    }

    if (CSV_RENCANA_URL && CSV_RENCANA_URL.startsWith('http')) {
      __f4.globals.Papa.parse(CSV_RENCANA_URL, {
        download: true,
        header: true,
        complete: async function(results) {
          const rawData = results.data.filter(row => {
            const values = __f4.globals.Object.values(row);
            return values.length >= 2 && values[0] && values[0].toString().trim() !== '';
          });

          f4BaseAgenda = rawData.map(row => {
            const keys = __f4.globals.Object.keys(row);
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

          f4AgendaReady=true;
          f4UpdateUnifiedAgenda();
          await f4InitialBankAgenda;
          f4UpdateUnifiedAgenda();
          // Deteksi Otomatis parameter ?event=YYYY-MM-DD saat link dibuka dari WhatsApp
          const urlParams = new __f4.globals.URLSearchParams(__f4.window.location.search);
          const targetDateIso = urlParams.get('event');

          if (targetDateIso) {
            const matchingEvents = globalRencanaData.filter(item => item.parsedDate === targetDateIso);
            
            if (matchingEvents.length > 0) {
              const dateParts = targetDateIso.split('-');
              const year = dateParts[0];
              const month = (0,__f4.globals.parseInt)(dateParts[1]);
              const day = (0,__f4.globals.parseInt)(dateParts[2]);
              const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
              const safeDateStr = `${day} ${monthNames[month - 1]} ${year}`;
              
              (0,__f4.globals.setTimeout)(() => {
                const elRencana = __f4.globals.document.getElementById('rencana');
                if (elRencana) elRencana.scrollIntoView({ behavior: 'smooth' });
                openModalEventDetail(safeDateStr, matchingEvents, targetDateIso);
              }, 700);
            }
          }
        },
        error:async function(err){
          f4AgendaReady=true;
          await f4InitialBankAgenda;
          if(f4BankAgenda.length){f4UpdateUnifiedAgenda();return;}
          const area=__f4.globals.document.getElementById('container-rencana');
          if(area){
            area.replaceChildren();
            const msg=__f4.globals.document.createElement('p');msg.className='text-xs text-rose-700';
            msg.textContent='Agenda gagal dimuat: '+(err.message||err);
            const retry=__f4.globals.document.createElement('button');retry.textContent='Coba Lagi';retry.type='button';retry.onclick=()=>__f4.globals.location.reload();
            area.append(msg,retry);
          }
          const preview=__f4.globals.document.getElementById('f4-upcoming-agenda');
          if(preview)preview.textContent='Agenda gagal dimuat. Muat ulang halaman.';
          renderCalendar();
        }
      });
    } else {
      f4AgendaReady=true;
      f4InitialBankAgenda.then(()=>{if(f4BankAgenda.length)f4UpdateUnifiedAgenda();});
      const preview=__f4.globals.document.getElementById('f4-upcoming-agenda');
      if(preview)preview.textContent='Agenda belum tersedia.';
      const area=__f4.globals.document.getElementById('container-rencana');
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
    if (typeof __f4.globals.Papa === 'undefined' || !CSV_BANNER_URL) return;

    __f4.globals.Papa.parse(CSV_BANNER_URL, {
      download: true,
      header: true,
      complete: function(results) {
        if (results && results.data) {
          bannerData = results.data.filter(row => {
            const values = __f4.globals.Object.values(row);
            const photoUrl = values[1] || values[0];
            return photoUrl && photoUrl.toString().trim() !== '';
          });

          if (bannerData.length > 0) {
            renderBannerSlider();
            startAutoSlide();
            setupBannerGestures();
          }else{
            const track=__f4.globals.document.getElementById('banner-track');
            if(track)track.textContent='Belum ada banner.';
          }
        }
      },
      error:function(err){
        const track=__f4.globals.document.getElementById('banner-track');
        if(track){track.replaceChildren();
          const msg=__f4.globals.document.createElement('p');msg.textContent='Banner belum dapat dimuat: '+(err.message||err);
          const retry=__f4.globals.document.createElement('button');retry.type='button';retry.textContent='Coba Lagi';retry.onclick=initBanner;
          track.append(msg,retry);
        }
      }
    });
  }

  function renderBannerSlider() {
    const track = __f4.globals.document.getElementById('banner-track');
    const dotsContainer = __f4.globals.document.getElementById('banner-dots');
    if (!track) return;

    let trackHTML = '';
    let dotsHTML = '';

    bannerData.forEach((item, index) => {
      const values = __f4.globals.Object.values(item);
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
      try { destination = new __f4.globals.URL(anchor.getAttribute('href'), __f4.globals.location.href); } catch { return; }
      if (destination.origin === __f4.globals.location.origin && /(?:^|\/)banksampah(?:\.html|\/)?$/i.test(destination.pathname)) {
        anchor.addEventListener('click', event => {
          event.preventDefault();
          if (typeof __f4.window.f4GoBank === 'function') __f4.window.f4GoBank();
          else __f4.window.location.href = '/bank-sampah/';
        });
      }
    });
    if (dotsContainer) dotsContainer.innerHTML = dotsHTML;
    updateBannerPosition();
  }

  function updateBannerPosition() {
    const track = __f4.globals.document.getElementById('banner-track');
    if (!track) return;

    track.style.transform = `translateX(-${currentBannerIndex * 100}%)`;

    const dots = __f4.globals.document.querySelectorAll('.banner-dot');
    dots.forEach((dot, idx) => {
      if (idx === currentBannerIndex) {
        dot.className = 'banner-dot h-2 sm:h-2.5 rounded-full bg-white w-5 sm:w-6 transition-all';
      } else {
        dot.className = 'banner-dot w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/50 transition-all';
      }
    });
  }

  __f4.window.moveBanner = function(direction) {
    if (bannerData.length === 0) return;
    currentBannerIndex = (currentBannerIndex + direction + bannerData.length) % bannerData.length;
    updateBannerPosition();
    resetAutoSlide();
  };

  __f4.window.goToBanner = function(index) {
    currentBannerIndex = index;
    updateBannerPosition();
    resetAutoSlide();
  };

  function startAutoSlide() {
    if (bannerInterval) (0,__f4.globals.clearInterval)(bannerInterval);
    bannerInterval = (0,__f4.globals.setInterval)(() => { __f4.window.moveBanner(1); }, 4500);
  }

  function resetAutoSlide() {
    startAutoSlide();
  }

  function setupBannerGestures() {
    const container = __f4.globals.document.getElementById('banner-slider-container');
    if (!container) return;

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 40;
      if (touchEndX < touchStartX - swipeThreshold) __f4.window.moveBanner(1);
      else if (touchEndX > touchStartX + swipeThreshold) __f4.window.moveBanner(-1);
    }, { passive: true });

    __f4.globals.document.addEventListener('keydown', (e) => {
      const rect = container.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= __f4.window.innerHeight) {
        if (e.key === 'ArrowLeft') __f4.window.moveBanner(-1);
        if (e.key === 'ArrowRight') __f4.window.moveBanner(1);
      }
    });
  }

  if (__f4.globals.document.readyState === 'loading') {
    __f4.globals.document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();

    // Projek Portal Utama langsung dari D1. Tidak ada sumber CSV atau fallback kartu statis.
    const PROJECT_API='https://api.flamboyan4.web.id/api/v2/public/portal';
    const f4ProjectNumber=value=>__f4.globals.Number.isFinite((0,__f4.globals.Number)(value))?(0,__f4.globals.Number)(value):0;
    const f4ProjectRp=value=>'Rp '+f4ProjectNumber(value).toLocaleString('id-ID');
    const f4ProjectType=(value)=>(0,__f4.globals.String)(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
    const f4ProjectBadge=(value)=>{
      const st=(0,__f4.globals.String)(value||'').toLowerCase();
      if(st.includes('selesai'))return 'bg-emerald-100 text-emerald-800';
      if(st.includes('dana')||st.includes('dp')||st.includes('cicil'))return 'bg-amber-100 text-amber-800';
      return 'bg-indigo-100 text-indigo-800';
    };
    function f4ProjectCardEl(tag,cls,text){
      const element=__f4.globals.document.createElement(tag);
      if(cls)element.className=cls;
      if(text!==__f4.globals.undefined)element.textContent=(0,__f4.globals.String)(text);
      return element;
    }
    function f4ProjectImage(source){
      const raw=(0,__f4.globals.String)(source||'').trim();
      const file=raw.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)||
        raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if(file)return 'https://drive.google.com/thumbnail?id='+(0,__f4.globals.encodeURIComponent)(file[1])+'&sz=w640';
      return /^https:\/\//i.test(raw)&&!/drive\.google\.com\/drive\/folders\//i.test(raw)?raw:'';
    }
    function f4ProjectLink(raw){
      const t=(0,__f4.globals.String)(raw||'').trim();
      // Samakan tautan lama dengan path asli Portal Bank Sampah.
      if(/^\/banksampah\/?$/i.test(t))return '/bank-sampah/';
      if(/^\/(?!\/)[a-zA-Z0-9_/#?=&%.-]*$/.test(t)||/^#[a-zA-Z0-9_-]+$/.test(t))return t;
      try{const u=new __f4.globals.URL(t);return u.protocol==='https:'?u.href:'';}catch{return ''}
    }
    function f4ProjectStatus(row){
      const description=(0,__f4.globals.String)(row.description||'').trim();
      if(description.length&&description.length<=34)return description;
      const names={informasi:'Kegiatan',kas:'Dana Kas',penggalangan:'Penggalangan Dana',pesanan:'Pemesanan Barang',portal:'Portal Terhubung'};
      return names[row.project_kind]||'Aktif';
    }
    function f4ProjectGeneric(row){
      const container=f4ProjectCardEl('article',
        'f4-project-card bg-white rounded-card border border-slate-200 p-4 flex flex-col');
      container.dataset.dynamicProject='true';
      container.dataset.projectId=(0,__f4.globals.String)(row.id||'');
      container.style.order=(0,__f4.globals.String)((0,__f4.globals.Number)(row.sort_order)||0);
      const header=f4ProjectCardEl('div','flex items-center justify-between gap-2 mb-3');
      header.append(
        f4ProjectCardEl('h4','font-bold text-slate-900 text-base min-w-0',row.title||'Proyek warga'),
        f4ProjectCardEl('span','text-[10px] font-semibold rounded-full px-2 py-1 shrink-0 '+f4ProjectBadge(f4ProjectStatus(row)),f4ProjectStatus(row))
      );
      container.append(header);
      const photo=f4ProjectImage(row.image_ref);
      if(photo){
        const img=f4ProjectCardEl('img','w-full h-28 object-contain rounded-lg bg-slate-50 mb-3');
        img.src=photo;img.loading='lazy';img.alt='Foto proyek '+(0,__f4.globals.String)(row.title||'');container.append(img);
      }
      const desc=(0,__f4.globals.String)(row.description||'').trim();
      if(desc&&desc!==f4ProjectStatus(row))container.append(f4ProjectCardEl('p','text-xs text-slate-600 leading-relaxed mb-3',desc));
      const kind=(0,__f4.globals.String)(row.project_kind||'informasi');
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
        add('Sisa tagihan',f4ProjectRp(__f4.globals.Math.max(0,f4ProjectNumber(stat.totalTagihanRp)-money)));
      }else if(kind==='kas'||kind==='penggalangan'){
        if(kind==='kas'&&!(0,__f4.globals.String)(row.fund_source||'').trim())add('Sumber kas','Belum diatur');
        else add(kind==='kas'?'Saldo dana terkait':'Dana terkumpul',f4ProjectRp(money));
        if(goal>0){
          add('Target',f4ProjectRp(goal));add('Kekurangan',f4ProjectRp(__f4.globals.Math.max(0,goal-money)));
          const line=f4ProjectCardEl('div','w-full h-2 rounded-full bg-emerald-100 mt-2 overflow-hidden');
          const fill=f4ProjectCardEl('div','h-full rounded-full bg-emerald-600');
          fill.style.width=__f4.globals.Math.max(0,__f4.globals.Math.min(100,money/goal*100))+'%';line.append(fill);panel.append(line);
        }
        if(kind==='penggalangan')add('Kontributor',f4ProjectNumber(stat.jumlahKontributor)+' orang');
      }else if(kind==='portal'){
        add('Jenis','Terhubung portal');
      }else{
        add('Informasi','Proyek lingkungan');
      }
      container.append(panel);
      const link=f4ProjectLink(row.target_url)||
        ((0,__f4.globals.String)(row.linked_key||'')==='bank-sampah'?'/bank-sampah/':'');
      if(link){
        const action=f4ProjectCardEl('a','mt-3 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 rounded-lg border border-indigo-100 text-xs text-center','Buka Projek');
        action.href=link;container.append(action);
      }
      return container;
    }
    // Sumber Gapura adalah saldo akhir seluruh jurnal aktif Pembukuan, termasuk
    // saldo awal serah terima. Permintaan tetap membutuhkan sesi login server.
    function f4ProjectCashMessage(message){
      for(const [id,value] of [
        ['gapura-terkumpul',message],
        ['gapura-kurang','—'],
        ['gapura-percent','—']
      ]){
        const field=__f4.globals.document.getElementById(id);
        if(field)field.textContent=value;
      }
      const progress=__f4.globals.document.getElementById('gapura-progress-bar');
      if(progress)progress.style.width='0%';
    }
    async function f4ProjectFullCashBalance(){
      const base='https://api.flamboyan4.web.id';
      const options={mode:'cors',credentials:'include',cache:'no-store',headers:{Accept:'application/json'}};
      let response=await (0,__f4.globals.fetch)(base+'/api/v2/portal/cash-balance',options);
      if(response.status===404){
        // Transisi saat Worker baru belum diterbitkan: endpoint laporan yang
        // sudah ada tetap aman karena memerlukan cookie sesi yang sama.
        response=await (0,__f4.globals.fetch)(base+'/api/v2/public/portal/cash',options);
        const old=await response.json().catch(()=>null);
        if(!response.ok||old?.ok!==true||!__f4.globals.Array.isArray(old?.data?.rows)){
          const error=new __f4.globals.Error(old?.error||'Saldo kas belum tersedia.');
          error.status=response.status;
          throw error;
        }
        const balance=old.data.rows.reduce((total,row)=>{
          const debit=(0,__f4.globals.Number)(row.debit),kredit=(0,__f4.globals.Number)(row.kredit);
          if(!__f4.globals.Number.isSafeInteger(debit)||!__f4.globals.Number.isSafeInteger(kredit)||
             debit<0||kredit<0||(debit>0&&kredit>0)||(debit===0&&kredit===0))
            throw (0,__f4.globals.Error)('Jurnal kas perlu diperiksa.');
          return total+debit-kredit;
        },0);
        if(!__f4.globals.Number.isSafeInteger(balance))throw (0,__f4.globals.Error)('Saldo Kas tidak valid.');
        return balance;
      }
      const data=await response.json().catch(()=>null);
      if(!response.ok||data?.ok!==true){
        const error=new __f4.globals.Error(data?.error||'Saldo Kas belum tersedia.');
        error.status=response.status;
        throw error;
      }
      const balance=data?.data?.saldoRp;
      if(!__f4.globals.Number.isSafeInteger(balance))throw (0,__f4.globals.Error)('Saldo Kas tidak valid.');
      return balance;
    }
    let f4ProjectLoadGeneration=0;
    async function loadProjectCards(){
      const generation=++f4ProjectLoadGeneration;
      let fullCashPromise;
      const slider=__f4.globals.document.getElementById('slider-projek');
      if(!slider)return;
      const known={
        'bank-sampah':__f4.globals.document.getElementById('bank-sampah'),
        gapura:__f4.globals.document.getElementById('gapura'),
        jersey:__f4.globals.document.getElementById('jersey')
      };
      __f4.globals.Object.values(known).forEach(card=>{if(card)card.dataset.f4ProjectInactive='true'});
      slider.querySelectorAll('[data-dynamic-project="true"]').forEach(card=>card.remove());
      let empty=__f4.globals.document.getElementById('f4-project-empty');
      if(!empty){empty=f4ProjectCardEl('p','text-xs text-slate-500 w-full py-4','Memuat proyek…');empty.id='f4-project-empty';slider.append(empty);}
      try{
        const response=await (0,__f4.globals.fetch)(PROJECT_API,{cache:'no-store',headers:{Accept:'application/json'}});
        if(generation!==f4ProjectLoadGeneration)return;
        if(!response.ok)throw (0,__f4.globals.Error)('HTTP '+response.status);
        const data=await response.json();
        if(data.ok===false||!__f4.globals.Array.isArray(data.projects))throw (0,__f4.globals.Error)(data.error||'Data proyek tidak tersedia');
        const used=new __f4.globals.Set();
        const rows=data.projects.filter(row=>row&&row.active!==false&&(0,__f4.globals.String)(row.active??1)!=='0')
          .sort((a,b)=>f4ProjectNumber(a.sort_order)-f4ProjectNumber(b.sort_order));
        for(const row of rows){
          const key=(0,__f4.globals.String)(row.linked_key||'').trim();
          const title=f4ProjectType(row.title);
          let special=f4ProjectType(key)==='banksampah'?'bank-sampah':key==='jersey'?'jersey':
            ['banksampah','banksampahlorong','banksampahflamboyan4','banksampahlorongflamboyan4'].includes(title)?'bank-sampah':title==='gapura'?'gapura':
            ['pemesananjersey','jersey'].includes(title)?'jersey':'';
          // Tipe Pemesanan Barang lainnya tidak boleh menumpang tabel Jersey lama.
          if(row.project_kind==='pesanan'&&key!=='jersey'&&!['pemesananjersey','jersey'].includes(title))special='';
          let card=known[special];
          if(card&&!used.has(special)){
            used.add(special);card.dataset.f4ProjectInactive='false';
            card.style.order=(0,__f4.globals.String)(f4ProjectNumber(row.sort_order));
            const titles={'bank-sampah':'project-title-banksampah',gapura:'project-title-gapura',jersey:'project-title-jersey'};
            const t=__f4.globals.document.getElementById(titles[special]);if(t)t.textContent=(0,__f4.globals.String)(row.title||t.textContent);
            const status=special==='bank-sampah'?'bs-status-badge':special==='gapura'?'project-status-gapura':'project-status-jersey';
            const badge=__f4.globals.document.getElementById(status);
            if(badge){badge.textContent=f4ProjectStatus(row);badge.className='text-[10px] font-semibold rounded-full px-2 py-0.5 '+f4ProjectBadge(f4ProjectStatus(row));}
            if(special==='gapura'){
              const target=__f4.globals.document.getElementById('gapura-target');
              if(target)target.textContent=(0,__f4.globals.Number)(row.fund_target_rp)>0?f4ProjectRp(row.fund_target_rp):'Belum diatur';
              const fromKas=row.project_kind==='kas';
              const progressLabel=__f4.globals.document.getElementById('gapura-percent')?.previousElementSibling;
              if(progressLabel)progressLabel.textContent=fromKas?'Kas / Target':'Progres Dana';
              const availableLabel=__f4.globals.document.getElementById('gapura-terkumpul')?.previousElementSibling;
              if(availableLabel){
                availableLabel.textContent=fromKas?'Saldo Kas':'Terkumpul';
                availableLabel.title=fromKas?'Saldo seluruh kas Pembukuan, bukan dana khusus Gapura.':'';
              }
            }
            if(special==='gapura'&&['kas','penggalangan'].includes(row.project_kind)){
              const fromKas=row.project_kind==='kas';
              const goal=f4ProjectNumber(row.fund_target_rp);
              if(fromKas&&!f4CanReadKas()){
                f4ProjectCashMessage('Login untuk lihat');
                continue;
              }
              try{
                if(fromKas&&!fullCashPromise)fullCashPromise=f4ProjectFullCashBalance();
                const money=fromKas?await fullCashPromise:
                  f4ProjectNumber(row.ringkasan?.danaMasukRp);
                // Jangan menampilkan saldo milik akun lama ketika sesi berubah.
                if(generation!==f4ProjectLoadGeneration||fromKas&&!f4CanReadKas())return;
                const percent=goal>0?__f4.globals.Math.max(0,__f4.globals.Math.min(100,money/goal*100)):0;
                const labels=[
                  ['gapura-terkumpul',f4ProjectRp(money)],
                  ['gapura-kurang',goal?f4ProjectRp(__f4.globals.Math.max(0,goal-money)):'—'],
                  ['gapura-percent',goal?__f4.globals.Math.round(percent)+'%':'—']
                ];
                labels.forEach(([id,value])=>{const node=__f4.globals.document.getElementById(id);if(node)node.textContent=value});
                const bar=__f4.globals.document.getElementById('gapura-progress-bar');
                if(bar)bar.style.width=percent+'%';
              }catch(error){
                if(generation!==f4ProjectLoadGeneration)return;
                __f4.globals.console.warn('Saldo kas Gapura belum tersedia:',error);
                f4ProjectCashMessage(error.status===401?'Login untuk lihat':'Saldo belum terbaca');
              }
            }
            continue;
          }
          slider.append(f4ProjectGeneric(row));
        }
        empty.textContent=rows.length?'':'Belum ada projek.';
        empty.hidden=rows.length>0;
        if(__f4.window.lucide)__f4.window.lucide.createIcons();
      }catch(error){
        if(generation!==f4ProjectLoadGeneration)return;
        // No stale project and no ghost card after a failed public D1 request.
        empty.hidden=false;empty.textContent='Projek gagal dimuat. Coba muat ulang.';
        __f4.globals.console.warn('Project Card D1:',error);
      }
    }
    __f4.globals.document.addEventListener('DOMContentLoaded',loadProjectCards);
    __f4.globals.document.addEventListener('f4:cash-access-change',()=>{
      // Segera sembunyikan saldo saat logout/pergantian akun.
      ++f4ProjectLoadGeneration;
      f4ProjectCashMessage(f4CanReadKas()?'Memuat saldo…':'Login untuk lihat');
      void loadProjectCards();
    });


// Bank progress preview uses public D1 data; a banner is only a visual fallback.
const f4BankProjectFallback='/assets/banner-bank-sampah.jpg';
function f4BankProjectPhotoCandidates(value){
 const raw=(0,__f4.globals.String)(value||'').trim();if(!raw)return [];
 try{
  const url=new __f4.globals.URL(raw,'https://api.flamboyan4.web.id');
  if(url.protocol!=='https:')return [];
  if(/(^|\.)drive\.google\.com$/.test(url.hostname)){
   const id=url.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]||url.searchParams.get('id');
   if(id&&/^[a-zA-Z0-9_-]+$/.test(id))return ['https://lh3.googleusercontent.com/d/'+id,'https://drive.google.com/thumbnail?id='+id+'&sz=w800'];
  }
  if(url.hostname==='lh3.googleusercontent.com'){
   const id=url.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
   if(id)return [url.href,'https://drive.google.com/thumbnail?id='+id+'&sz=w800'];
  }
  return [url.href];
 }catch{return []}
}
function f4SetBankProjectPhoto(item){
 const photo=__f4.globals.document.getElementById('bs-step-img');if(!photo)return;
 const candidates=f4BankProjectPhotoCandidates(item?.photo);let i=0;
 const next=()=>{
  if(i<candidates.length){photo.alt='Dokumentasi '+item.title;photo.src=candidates[i++];}
  else{photo.onerror=null;photo.alt='Banner Bank Sampah Flamboyan 4';photo.src=f4BankProjectFallback;}
 };
 photo.onerror=next;next();
}
async function loadProgresBankSampahIndex(){
 const target=__f4.globals.document.getElementById('bs-step-title');if(!target)return;
 const set=(id,value)=>{const el=__f4.globals.document.getElementById(id);if(el)el.textContent=(0,__f4.globals.String)(value||'—')};
 const fallback=message=>{set('bs-step-tag','Bank Sampah');set('bs-step-title',message);set('bs-info-1','—');set('bs-info-2','—');f4SetBankProjectPhoto(null);};
 const read=async(path,key,timeout)=>{
  const controller=new __f4.globals.AbortController();
  const timer=(0,__f4.globals.setTimeout)(()=>controller.abort(),timeout);
  try{
   const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id'+path,{mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal});
   if(!response.ok)throw (0,__f4.globals.Error)('HTTP '+response.status);
   const data=await response.json();
   if(data.ok===false||!__f4.globals.Array.isArray(data[key]))throw (0,__f4.globals.Error)(data.error||'Data perkembangan tidak tersedia');
   return data[key];
  }finally{(0,__f4.globals.clearTimeout)(timer)}
 };
 const normalize=row=>({
   title:(0,__f4.globals.String)(row.title||row.judul||row.name||'Perkembangan Bank Sampah'),
   stage:(0,__f4.globals.String)(row.stage||row.langkah||row.tahap||''),
   description:(0,__f4.globals.String)(row.description||row.deskripsi||row.keterangan||''),
   status:(0,__f4.globals.String)(row.status||''),
   date:(0,__f4.globals.String)(row.happened_on||row.tanggal||row.date||''),
   next:(0,__f4.globals.String)(row.next_step||row.nextStep||row.agenda||row.nextAgenda||row.berikutnya||''),
   photo:(0,__f4.globals.String)(row.photo_url||row.photoUrl||row.foto||row.imageUrl||'')
 });
 const paint=rows=>{
  if(!target.isConnected)return false;
  const items=rows.filter(row=>row&&typeof row==='object').map(normalize).sort((a,b)=>b.date.localeCompare(a.date));
  if(!items.length)return false;
  const active=items[0];
  set('bs-step-tag','Terbaru');
  set('bs-step-title',active.title);
  set('bs-info-1',active.stage?'Tahap: '+active.stage.replace(/^Tahap:\s*/i,''):active.description||'Perkembangan tercatat');
  set('bs-info-2',active.next?'Agenda: '+active.next.replace(/^Agenda:\s*/i,''):'Status: '+(active.status||'Dicatat'));
  f4SetBankProjectPhoto(active);
  if(active.status)set('bs-status-badge',active.status);
  return true;
 };
 // Both endpoints read the same public_visible progress_entries records.
 // Render the lightweight response immediately; enrich with the full bank data/photo.
 let displayed=false,success=false;
 const basic=read('/api/public/progress','perkembangan',6500).then(rows=>{
  success=true;if(!displayed)displayed=paint(rows);
 }).catch(error=>__f4.globals.console.warn('Progres publik:',error.message));
 const full=read('/api/v2/public/bank','progress',9500).then(rows=>{
  success=true;if(paint(rows))displayed=true;
 }).catch(error=>__f4.globals.console.warn('Progres bank:',error.message));
 await __f4.globals.Promise.all([basic,full]);
 if(!target.isConnected||displayed)return;
 fallback(success?'Belum ada perkembangan yang dipublikasikan':'Perkembangan gagal dimuat');
}
__f4.globals.document.addEventListener('DOMContentLoaded', loadProgresBankSampahIndex);
    
  

});
