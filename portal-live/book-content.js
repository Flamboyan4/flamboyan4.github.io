/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/book-content.js",function(__f4){

__f4.expose("APPS_SCRIPT_URL",()=>APPS_SCRIPT_URL,null);
__f4.expose("BATCH_SCRIPT_URL",()=>BATCH_SCRIPT_URL,null);
__f4.expose("DELETE_SCRIPT_URL",()=>DELETE_SCRIPT_URL,null);
__f4.expose("DATA",()=>DATA,value=>DATA=value);
__f4.expose("RIWAYAT_KAS",()=>RIWAYAT_KAS,value=>RIWAYAT_KAS=value);
__f4.expose("DATA_PINJAMAN",()=>DATA_PINJAMAN,value=>DATA_PINJAMAN=value);
__f4.expose("BULAN",()=>BULAN,null);
__f4.expose("rupiah",()=>rupiah,value=>rupiah=value);
__f4.expose("jsonp",()=>jsonp,value=>jsonp=value);
__f4.expose("status",()=>status,value=>status=value);
__f4.expose("hideStatus",()=>hideStatus,value=>hideStatus=value);
__f4.expose("muatUlang",()=>muatUlang,value=>muatUlang=value);
__f4.expose("renderSemua",()=>renderSemua,value=>renderSemua=value);
__f4.expose("isiForm",()=>isiForm,value=>isiForm=value);
__f4.expose("periodeList",()=>periodeList,value=>periodeList=value);
__f4.expose("F4_IURAN_PREVIEW",()=>F4_IURAN_PREVIEW,value=>F4_IURAN_PREVIEW=value);
__f4.expose("F4_IURAN_PREVIEW_SEQUENCE",()=>F4_IURAN_PREVIEW_SEQUENCE,value=>F4_IURAN_PREVIEW_SEQUENCE=value);
__f4.expose("F4_IURAN_SUGGEST_SEQ",()=>F4_IURAN_SUGGEST_SEQ,value=>F4_IURAN_SUGGEST_SEQ=value);
__f4.expose("F4_IURAN_PERIOD_BLOCKED",()=>F4_IURAN_PERIOD_BLOCKED,value=>F4_IURAN_PERIOD_BLOCKED=value);
__f4.expose("F4_IURAN_PERIOD_NOTICE_TIMER",()=>F4_IURAN_PERIOD_NOTICE_TIMER,value=>F4_IURAN_PERIOD_NOTICE_TIMER=value);
__f4.expose("f4IuranPeriodNotice",()=>f4IuranPeriodNotice,value=>f4IuranPeriodNotice=value);
__f4.expose("f4IuranManualPeriod",()=>f4IuranManualPeriod,value=>f4IuranManualPeriod=value);
__f4.expose("pilihWargaIuran",()=>pilihWargaIuran,value=>pilihWargaIuran=value);
__f4.expose("f4IuranPreviewKey",()=>f4IuranPreviewKey,value=>f4IuranPreviewKey=value);
__f4.expose("updatePreview",()=>updatePreview,value=>updatePreview=value);
__f4.expose("updateNominalParsialInfo",()=>updateNominalParsialInfo,value=>updateNominalParsialInfo=value);
__f4.expose("saveStatusTimer",()=>saveStatusTimer,value=>saveStatusTimer=value);
__f4.expose("hideSaveStatus",()=>hideSaveStatus,value=>hideSaveStatus=value);
__f4.expose("saveStatus",()=>saveStatus,value=>saveStatus=value);
__f4.expose("resetIuranFormAfterSave",()=>resetIuranFormAfterSave,value=>resetIuranFormAfterSave=value);
__f4.expose("simpanIuran",()=>simpanIuran,value=>simpanIuran=value);
__f4.expose("loadRiwayat",()=>loadRiwayat,value=>loadRiwayat=value);
__f4.expose("riwayatMsg",()=>riwayatMsg,value=>riwayatMsg=value);
__f4.expose("histDate",()=>histDate,value=>histDate=value);
__f4.expose("historyDateTs",()=>historyDateTs,value=>historyDateTs=value);
__f4.expose("newestFirst",()=>newestFirst,value=>newestFirst=value);
__f4.expose("refreshHistoryIcons",()=>refreshHistoryIcons,value=>refreshHistoryIcons=value);
__f4.expose("actionIcon",()=>actionIcon,value=>actionIcon=value);
__f4.expose("initRiwayatPeriodFilter",()=>initRiwayatPeriodFilter,value=>initRiwayatPeriodFilter=value);
__f4.expose("updateRiwayatPeriodControls",()=>updateRiwayatPeriodControls,value=>updateRiwayatPeriodControls=value);
__f4.expose("monthKeyFromLabel",()=>monthKeyFromLabel,value=>monthKeyFromLabel=value);
__f4.expose("paymentMonthKeys",()=>paymentMonthKeys,value=>paymentMonthKeys=value);
__f4.expose("matchRiwayatPeriod",()=>matchRiwayatPeriod,value=>matchRiwayatPeriod=value);
__f4.expose("iuranQuickPeriodLabel",()=>iuranQuickPeriodLabel,value=>iuranQuickPeriodLabel=value);
__f4.expose("f4IuranPeriodDisplay",()=>f4IuranPeriodDisplay,value=>f4IuranPeriodDisplay=value);
__f4.expose("IURAN_QUICK_DATA",()=>IURAN_QUICK_DATA,value=>IURAN_QUICK_DATA=value);
__f4.expose("IURAN_QUICK_REQ",()=>IURAN_QUICK_REQ,value=>IURAN_QUICK_REQ=value);
__f4.expose("iqCountHtml",()=>iqCountHtml,value=>iqCountHtml=value);
__f4.expose("f4RebuildQuickSummaryFromPaymentAllocations",()=>f4RebuildQuickSummaryFromPaymentAllocations,value=>f4RebuildQuickSummaryFromPaymentAllocations=value);
__f4.expose("renderIuranQuickSummary",()=>renderIuranQuickSummary,value=>renderIuranQuickSummary=value);
__f4.expose("loadIuranQuickSummary",()=>loadIuranQuickSummary,value=>loadIuranQuickSummary=value);
__f4.expose("normRiwayatSearch",()=>normRiwayatSearch,value=>normRiwayatSearch=value);
__f4.expose("riwayatResidentInfo",()=>riwayatResidentInfo,value=>riwayatResidentInfo=value);
__f4.expose("renderRiwayat",()=>renderRiwayat,value=>renderRiwayat=value);
__f4.expose("KOREKSI_MIGRASI_ID",()=>KOREKSI_MIGRASI_ID,value=>KOREKSI_MIGRASI_ID=value);
__f4.expose("bukaKoreksiMigrasi",()=>bukaKoreksiMigrasi,value=>bukaKoreksiMigrasi=value);
__f4.expose("tutupKoreksiMigrasi",()=>tutupKoreksiMigrasi,value=>tutupKoreksiMigrasi=value);
__f4.expose("simpanKoreksiMigrasi",()=>simpanKoreksiMigrasi,value=>simpanKoreksiMigrasi=value);
__f4.expose("isiEditOptions",()=>isiEditOptions,value=>isiEditOptions=value);
__f4.expose("bukaEdit",()=>bukaEdit,value=>bukaEdit=value);
__f4.expose("tutupEdit",()=>tutupEdit,value=>tutupEdit=value);
__f4.expose("updateEditPreview",()=>updateEditPreview,value=>updateEditPreview=value);
__f4.expose("editMsg",()=>editMsg,value=>editMsg=value);
__f4.expose("simpanEdit",()=>simpanEdit,value=>simpanEdit=value);
__f4.expose("batalkanPembayaran",()=>batalkanPembayaran,value=>batalkanPembayaran=value);
__f4.expose("hapusPembayaran",()=>hapusPembayaran,value=>hapusPembayaran=value);
__f4.expose("KAS_DATA",()=>KAS_DATA,value=>KAS_DATA=value);
__f4.expose("KAS_LOADED",()=>KAS_LOADED,value=>KAS_LOADED=value);
__f4.expose("f4ChangeKasSource",()=>f4ChangeKasSource,value=>f4ChangeKasSource=value);
__f4.expose("f4KasCategory",()=>f4KasCategory,value=>f4KasCategory=value);
__f4.expose("initKasUi",()=>initKasUi,value=>initKasUi=value);
__f4.expose("kasMsg",()=>kasMsg,value=>kasMsg=value);
__f4.expose("loadPembukuanKas",()=>loadPembukuanKas,value=>loadPembukuanKas=value);
__f4.expose("renderPembukuanKas",()=>renderPembukuanKas,value=>renderPembukuanKas=value);
__f4.expose("pilihSemuaKas",()=>pilihSemuaKas,value=>pilihSemuaKas=value);
__f4.expose("updateKasTerpilih",()=>updateKasTerpilih,value=>updateKasTerpilih=value);
__f4.expose("buatBatchKas",()=>buatBatchKas,value=>buatBatchKas=value);
__f4.expose("batalkanBatchKas",()=>batalkanBatchKas,value=>batalkanBatchKas=value);
__f4.expose("KATEGORI_PEMASUKAN",()=>KATEGORI_PEMASUKAN,null);
__f4.expose("KATEGORI_PENGELUARAN",()=>KATEGORI_PENGELUARAN,null);
__f4.expose("initTransaksiKasUi",()=>initTransaksiKasUi,value=>initTransaksiKasUi=value);
__f4.expose("setJenisKas",()=>setJenisKas,value=>setJenisKas=value);
__f4.expose("trxMsg",()=>trxMsg,value=>trxMsg=value);
__f4.expose("formatNominalInput",()=>formatNominalInput,value=>formatNominalInput=value);
__f4.expose("nominalAngka",()=>nominalAngka,value=>nominalAngka=value);
__f4.expose("simpanTransaksiKas",()=>simpanTransaksiKas,value=>simpanTransaksiKas=value);
__f4.expose("histKasMsg",()=>histKasMsg,value=>histKasMsg=value);
__f4.expose("loadRiwayatKas",()=>loadRiwayatKas,value=>loadRiwayatKas=value);
__f4.expose("f4BatchReadableNote",()=>f4BatchReadableNote,value=>f4BatchReadableNote=value);
__f4.expose("f4CashHumanTitle",()=>f4CashHumanTitle,value=>f4CashHumanTitle=value);
__f4.expose("f4ResiAction",()=>f4ResiAction,value=>f4ResiAction=value);
__f4.expose("f4CetakResiLain",()=>f4CetakResiLain,value=>f4CetakResiLain=value);
__f4.expose("f4SystemIdDetails",()=>f4SystemIdDetails,value=>f4SystemIdDetails=value);
__f4.expose("renderRiwayatKas",()=>renderRiwayatKas,value=>renderRiwayatKas=value);
__f4.expose("batalkanTransaksiKas",()=>batalkanTransaksiKas,value=>batalkanTransaksiKas=value);
__f4.expose("loanMsg",()=>loanMsg,value=>loanMsg=value);
__f4.expose("setLoanMode",()=>setLoanMode,value=>setLoanMode=value);
__f4.expose("initPinjamanUi",()=>initPinjamanUi,value=>initPinjamanUi=value);
__f4.expose("loadPinjaman",()=>loadPinjaman,value=>loadPinjaman=value);
__f4.expose("isiPinjamanAktif",()=>isiPinjamanAktif,value=>isiPinjamanAktif=value);
__f4.expose("previewPinjaman",()=>previewPinjaman,value=>previewPinjaman=value);
__f4.expose("simpanPinjaman",()=>simpanPinjaman,value=>simpanPinjaman=value);
__f4.expose("simpanPembayaranPinjaman",()=>simpanPembayaranPinjaman,value=>simpanPembayaranPinjaman=value);
__f4.expose("renderPinjaman",()=>renderPinjaman,value=>renderPinjaman=value);
__f4.expose("batalkanPembayaranPinjaman",()=>batalkanPembayaranPinjaman,value=>batalkanPembayaranPinjaman=value);
__f4.expose("batalkanPinjaman",()=>batalkanPinjaman,value=>batalkanPinjaman=value);
__f4.expose("pulihkanPinjaman",()=>pulihkanPinjaman,value=>pulihkanPinjaman=value);
__f4.expose("DATA_TALANGAN",()=>DATA_TALANGAN,value=>DATA_TALANGAN=value);
__f4.expose("talMsg",()=>talMsg,value=>talMsg=value);
__f4.expose("initTalanganUi",()=>initTalanganUi,value=>initTalanganUi=value);
__f4.expose("previewTalangan",()=>previewTalangan,value=>previewTalangan=value);
__f4.expose("simpanTalangan",()=>simpanTalangan,value=>simpanTalangan=value);
__f4.expose("loadTalangan",()=>loadTalangan,value=>loadTalangan=value);
__f4.expose("renderTalangan",()=>renderTalangan,value=>renderTalangan=value);
__f4.expose("batalkanTalangan",()=>batalkanTalangan,value=>batalkanTalangan=value);
__f4.expose("DATA_DENDA",()=>DATA_DENDA,value=>DATA_DENDA=value);
__f4.expose("DENDA_LOADED",()=>DENDA_LOADED,value=>DENDA_LOADED=value);
__f4.expose("DENDA_LOADING",()=>DENDA_LOADING,value=>DENDA_LOADING=value);
__f4.expose("REPORT_MODE",()=>REPORT_MODE,value=>REPORT_MODE=value);
__f4.expose("REPORT_DATA_KAS",()=>REPORT_DATA_KAS,value=>REPORT_DATA_KAS=value);
__f4.expose("REPORT_DATA_RT",()=>REPORT_DATA_RT,value=>REPORT_DATA_RT=value);
__f4.expose("REPORT_DATA_ARISAN",()=>REPORT_DATA_ARISAN,value=>REPORT_DATA_ARISAN=value);
__f4.expose("REPORT_DATA_DENDA",()=>REPORT_DATA_DENDA,value=>REPORT_DATA_DENDA=value);
__f4.expose("REPORT_DATA_PINJAMAN",()=>REPORT_DATA_PINJAMAN,value=>REPORT_DATA_PINJAMAN=value);
__f4.expose("REPORT_DATA_TALANGAN",()=>REPORT_DATA_TALANGAN,value=>REPORT_DATA_TALANGAN=value);
__f4.expose("REPORT_DATA_TAHUNAN",()=>REPORT_DATA_TAHUNAN,value=>REPORT_DATA_TAHUNAN=value);
__f4.expose("REPORT_ARSIP_TAHUNAN",()=>REPORT_ARSIP_TAHUNAN,value=>REPORT_ARSIP_TAHUNAN=value);
__f4.expose("dendaMsg",()=>dendaMsg,value=>dendaMsg=value);
__f4.expose("initDendaUi",()=>initDendaUi,value=>initDendaUi=value);
__f4.expose("setModeDenda",()=>setModeDenda,value=>setModeDenda=value);
__f4.expose("loadDenda",()=>loadDenda,value=>loadDenda=value);
__f4.expose("renderDendaBayarOptions",()=>renderDendaBayarOptions,value=>renderDendaBayarOptions=value);
__f4.expose("previewBayarDenda",()=>previewBayarDenda,value=>previewBayarDenda=value);
__f4.expose("simpanDenda",()=>simpanDenda,value=>simpanDenda=value);
__f4.expose("bayarDenda",()=>bayarDenda,value=>bayarDenda=value);
__f4.expose("renderDendaHistory",()=>renderDendaHistory,value=>renderDendaHistory=value);
__f4.expose("batalkanDenda",()=>batalkanDenda,value=>batalkanDenda=value);
__f4.expose("batalkanPembayaranDenda",()=>batalkanPembayaranDenda,value=>batalkanPembayaranDenda=value);
__f4.expose("isiBulanSelect",()=>isiBulanSelect,value=>isiBulanSelect=value);
__f4.expose("initLaporanUi",()=>initLaporanUi,value=>initLaporanUi=value);
__f4.expose("updateKasPeriodControls",()=>updateKasPeriodControls,value=>updateKasPeriodControls=value);
__f4.expose("setModeLaporan",()=>setModeLaporan,value=>setModeLaporan=value);
__f4.expose("reportMsg",()=>reportMsg,value=>reportMsg=value);
__f4.expose("getKasReportParams",()=>getKasReportParams,value=>getKasReportParams=value);
__f4.expose("REPORT_REQUEST_SEQ",()=>REPORT_REQUEST_SEQ,value=>REPORT_REQUEST_SEQ=value);
__f4.expose("loadLaporan",()=>loadLaporan,value=>loadLaporan=value);
__f4.expose("f4KasSignedNet",()=>f4KasSignedNet,value=>f4KasSignedNet=value);
__f4.expose("renderLaporanKas",()=>renderLaporanKas,value=>renderLaporanKas=value);
__f4.expose("F4_KAS_REKAP_SEQ",()=>F4_KAS_REKAP_SEQ,value=>F4_KAS_REKAP_SEQ=value);
__f4.expose("f4KasRowsBulanan",()=>f4KasRowsBulanan,value=>f4KasRowsBulanan=value);
__f4.expose("f4KasPaintMonthly",()=>f4KasPaintMonthly,value=>f4KasPaintMonthly=value);
__f4.expose("f4KasRefreshMonthlyRecap",()=>f4KasRefreshMonthlyRecap,value=>f4KasRefreshMonthlyRecap=value);
__f4.expose("esc",()=>esc,value=>esc=value);
__f4.expose("f4NamaCetak",()=>f4NamaCetak,value=>f4NamaCetak=value);
__f4.expose("keteranganCellClassRt",()=>keteranganCellClassRt,value=>keteranganCellClassRt=value);
__f4.expose("badgeKeteranganRt",()=>badgeKeteranganRt,value=>badgeKeteranganRt=value);
__f4.expose("reportKeteranganRt",()=>reportKeteranganRt,value=>reportKeteranganRt=value);
__f4.expose("sortedReportRtRows",()=>sortedReportRtRows,value=>sortedReportRtRows=value);
__f4.expose("f4RtLabelBulan",()=>f4RtLabelBulan,value=>f4RtLabelBulan=value);
__f4.expose("f4RtPaidPeriodLabel",()=>f4RtPaidPeriodLabel,value=>f4RtPaidPeriodLabel=value);
__f4.expose("f4RtKeteranganMarkup",()=>f4RtKeteranganMarkup,value=>f4RtKeteranganMarkup=value);
__f4.expose("f4RtPrepaidLabel",()=>f4RtPrepaidLabel,value=>f4RtPrepaidLabel=value);
__f4.expose("f4RtDueMissing",()=>f4RtDueMissing,value=>f4RtDueMissing=value);
__f4.expose("f4RtCellMarkup",()=>f4RtCellMarkup,value=>f4RtCellMarkup=value);
__f4.expose("f4RtCellWarning",()=>f4RtCellWarning,value=>f4RtCellWarning=value);
__f4.expose("F4_RT_POTONGAN_HUMAS",()=>F4_RT_POTONGAN_HUMAS,null);
__f4.expose("f4RtSettlement",()=>f4RtSettlement,value=>f4RtSettlement=value);
__f4.expose("f4RtSettlementNote",()=>f4RtSettlementNote,value=>f4RtSettlementNote=value);
__f4.expose("f4RtSettlementNoteHtml",()=>f4RtSettlementNoteHtml,value=>f4RtSettlementNoteHtml=value);
__f4.expose("renderLaporanRt",()=>renderLaporanRt,value=>renderLaporanRt=value);
__f4.expose("f4RtIsModern",()=>f4RtIsModern,value=>f4RtIsModern=value);
__f4.expose("f4RtShares",()=>f4RtShares,value=>f4RtShares=value);
__f4.expose("f4RtRefreshColumns",()=>f4RtRefreshColumns,value=>f4RtRefreshColumns=value);
__f4.expose("renderLaporanArisan",()=>renderLaporanArisan,value=>renderLaporanArisan=value);
__f4.expose("renderLaporanDenda",()=>renderLaporanDenda,value=>renderLaporanDenda=value);
__f4.expose("renderLaporanPinjaman",()=>renderLaporanPinjaman,value=>renderLaporanPinjaman=value);
__f4.expose("renderLaporanTalangan",()=>renderLaporanTalangan,value=>renderLaporanTalangan=value);
__f4.expose("loadArsipTahunan",()=>loadArsipTahunan,value=>loadArsipTahunan=value);
__f4.expose("renderArsipTahunan",()=>renderArsipTahunan,value=>renderArsipTahunan=value);
__f4.expose("renderLaporanTahunan",()=>renderLaporanTahunan,value=>renderLaporanTahunan=value);
__f4.expose("prosesTutupBuku",()=>prosesTutupBuku,value=>prosesTutupBuku=value);
__f4.expose("getNamaFileLaporan",()=>getNamaFileLaporan,value=>getNamaFileLaporan=value);
__f4.expose("escapePrint",()=>escapePrint,value=>escapePrint=value);
__f4.expose("printKasSepertiLamanUtama",()=>printKasSepertiLamanUtama,value=>printKasSepertiLamanUtama=value);
__f4.expose("printRtSepertiLamanUtama",()=>printRtSepertiLamanUtama,value=>printRtSepertiLamanUtama=value);
__f4.expose("printLaporan",()=>printLaporan,value=>printLaporan=value);
__f4.expose("bukaMenu",()=>bukaMenu,value=>bukaMenu=value);
__f4.expose("tutupMenu",()=>tutupMenu,value=>tutupMenu=value);
__f4.expose("pilihMenu",()=>pilihMenu,value=>pilihMenu=value);
__f4.expose("pilihRiwayat",()=>pilihRiwayat,value=>pilihRiwayat=value);
__f4.expose("initHistoryBatchFilters",()=>initHistoryBatchFilters,value=>initHistoryBatchFilters=value);
__f4.expose("muatRiwayatBatch",()=>muatRiwayatBatch,value=>muatRiwayatBatch=value);
__f4.expose("renderRumah",()=>renderRumah,value=>renderRumah=value);
__f4.expose("renderWarga",()=>renderWarga,value=>renderWarga=value);
__f4.expose("renderConfig",()=>renderConfig,value=>renderConfig=value);
__f4.expose("gantiTab",()=>gantiTab,value=>gantiTab=value);

const APPS_SCRIPT_URL = 'cloudflare-d1-only';
const BATCH_SCRIPT_URL = 'cloudflare-d1-only';
const DELETE_SCRIPT_URL = 'cloudflare-d1-only';
let DATA={config:{},rumah:[],warga:[],riwayat:[]};
let RIWAYAT_KAS=[];
let DATA_PINJAMAN={rows:[],aktif:[],ringkasan:{}};
const BULAN=['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function rupiah(n){return 'Rp '+__f4.globals.Math.round((0,__f4.globals.Number)(n)||0).toLocaleString('id-ID')}
function jsonp(_url,params={}) {
  // Sumber tunggal Pembukuan setelah migrasi: Cloudflare D1 melalui bridge.
  // Tidak ada fallback Apps Script atau data contoh saat bridge gagal.
  if (typeof __f4.window.__f4BookDemoCall!=='function')
    return __f4.globals.Promise.reject(new __f4.globals.Error('Koneksi data belum siap. Muat ulang halaman; data sebelumnya tidak berubah.'));
  try { return __f4.globals.Promise.resolve(__f4.window.__f4BookDemoCall(params)); }
  catch(error) { return __f4.globals.Promise.reject(error); }
}
function status(t,type='info'){const e=__f4.globals.document.getElementById('status-box');if(type==='success'&&/^Data berhasil dimuat\.?$/i.test(t)){__f4.globals.F4Loading.success(e);return}if(type==='info'&&/^Memuat /i.test(t)){__f4.globals.F4Loading.begin(e,t);return}if(type==='error'&&e.dataset.f4State==='loading')__f4.globals.F4Loading.error(e,t);e.dataset.f4State='notice';e.className='mb-5 rounded-xl border px-4 py-3 text-sm';if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');else if(type==='success')e.classList.add('bg-violet-50','border-violet-200','text-violet-700');else e.classList.add('bg-slate-50','border-slate-200','text-slate-600');e.textContent=t;e.hidden=false;e.classList.remove('hidden')}
function hideStatus(){__f4.globals.document.getElementById('status-box').classList.add('hidden')}
async function muatUlang(){status('Memuat data...');try{const r=await jsonp(APPS_SCRIPT_URL,{action:'bootstrap',t:__f4.globals.Date.now()});if(r.status!=='success')throw new __f4.globals.Error(r.message||'Gagal');DATA.config=r.config||{};__f4.globals.document.getElementById('backend-version').textContent=r.version?('Backend '+r.version):'Backend lama';DATA.rumah=r.rumah||[];DATA.warga=r.warga||[];renderSemua();status('Data berhasil dimuat.','success');
  // Buka Input Iuran tanpa menarik riwayat/utang yang belum diperlukan.
  // Perbarui modul aktif saja jika pengguna menekan Muat Ulang dari modul tersebut.
  if(!__f4.globals.document.getElementById('tab-riwayat')?.classList.contains('hidden'))loadRiwayat(true).catch(()=>{});
}catch(e){status(e.message,'error')}}
function renderSemua(){const total=DATA.rumah.length,dihuni=DATA.rumah.filter(x=>(x.statusRumah||'').toLowerCase()==='dihuni').length,kosong=DATA.rumah.filter(x=>(x.statusRumah||'').toLowerCase()==='kosong').length,aktif=DATA.warga.filter(x=>['ya','aktif'].includes((x.statusAktif||'').toLowerCase())).length,kontrak=DATA.warga.filter(x=>['ya','aktif'].includes((x.statusAktif||'').toLowerCase())&&(x.statusTinggal||'').toLowerCase()==='kontrak').length;__f4.globals.document.getElementById('sum-unit').textContent=total;__f4.globals.document.getElementById('sum-dihuni').textContent=dihuni;__f4.globals.document.getElementById('sum-kosong').textContent=kosong;__f4.globals.document.getElementById('sum-warga').textContent=aktif;__f4.globals.document.getElementById('sum-kontrak').textContent=kontrak;__f4.globals.document.getElementById('ringkasan-hunian').innerHTML=`<div class="flex justify-between py-2 border-b border-violet-50"><span>Total unit terdata</span><b>${total}</b></div><div class="flex justify-between py-2 border-b border-violet-50"><span>Dihuni</span><b class="text-violet-700">${dihuni}</b></div><div class="flex justify-between py-2 border-b border-violet-50"><span>Kosong</span><b class="text-amber-600">${kosong}</b></div><div class="flex justify-between py-2"><span>Kontrak aktif</span><b class="text-fuchsia-700">${kontrak}</b></div>`;__f4.globals.document.getElementById('ringkasan-tarif').innerHTML=`<div class="rounded-xl bg-violet-50/60 p-3"><div class="text-[10px] font-bold text-slate-400">IURAN BULANAN</div><div class="font-black mt-1">${rupiah(DATA.config.TARIF_BULANAN)}</div></div><div class="rounded-xl bg-violet-50/60 p-3"><div class="text-[10px] font-bold text-slate-400">KEBERSIHAN</div><div class="font-black mt-1">${rupiah(DATA.config.TARIF_KEBERSIHAN)}</div></div><div class="rounded-xl bg-violet-50/60 p-3"><div class="text-[10px] font-bold text-slate-400">KAS LORONG</div><div class="font-black mt-1">${rupiah(DATA.config.TARIF_KAS_LORONG)}</div></div><div class="rounded-xl bg-violet-50/60 p-3"><div class="text-[10px] font-bold text-slate-400">ARISAN</div><div class="font-black mt-1">${rupiah(DATA.config.TARIF_ARISAN)}</div></div>`;renderRumah();renderWarga();renderConfig();isiForm();__f4.globals.lucide.createIcons();initPinjamanUi();}
function isiForm(){const sel=__f4.globals.document.getElementById('inp-warga');const old=sel.value;sel.innerHTML='<option value="">Pilih warga...</option>'+DATA.warga.filter(w=>['ya','aktif'].includes((w.statusAktif||'').toLowerCase())&&[w.qtyIuranBulanan,w.qtyKebersihan,w.qtyKasLorong,w.qtyArisan].some(n=>(0,__f4.globals.Number)(n||0)>0)).map(w=>`<option value="${w.idWarga}">${w.nama} (${w.blok}/${w.noRumah})</option>`).join('');if(old)sel.value=old;const now=new __f4.globals.Date();__f4.globals.document.getElementById('inp-tanggal').value=now.toISOString().slice(0,10);__f4.globals.document.getElementById('inp-tahun').value=now.getFullYear();__f4.globals.document.getElementById('inp-bulan').innerHTML=BULAN.slice(1).map((b,i)=>`<option value="${i+1}">${b}</option>`).join('');__f4.globals.document.getElementById('inp-bulan').value=now.getMonth()+1;pilihWargaIuran()}
function periodeList(b,y,j){const a=[];let m=(0,__f4.globals.Number)(b),yr=(0,__f4.globals.Number)(y);for(let i=0;i<(0,__f4.globals.Number)(j);i++){a.push(BULAN[m]+' '+yr);m++;if(m>12){m=1;yr++}}return a}
let F4_IURAN_PREVIEW=null,F4_IURAN_PREVIEW_SEQUENCE=0;
let F4_IURAN_SUGGEST_SEQ=0,F4_IURAN_PERIOD_BLOCKED=false;
let F4_IURAN_PERIOD_NOTICE_TIMER=null;
function f4IuranPeriodNotice(message,type='info'){
 const el=__f4.globals.document.getElementById('inp-periode-status');
 if(F4_IURAN_PERIOD_NOTICE_TIMER!==null){
   (0,__f4.globals.clearTimeout)(F4_IURAN_PERIOD_NOTICE_TIMER);
   F4_IURAN_PERIOD_NOTICE_TIMER=null;
 }
 if(!el)return;
 // Informasi periode hanya untuk form Input Iuran yang sedang aktif.
 const active=!__f4.globals.document.getElementById('tab-input')?.classList.contains('hidden');
 const show=(0,__f4.globals.Boolean)(message)&&active;
 el.textContent=show?message:'';
 el.hidden=!show;
 el.dataset.state=type;
 // Hasil pemeriksaan sukses bukan label permanen: hilang setelah 3 detik.
 // Peringatan/kegagalan tetap terlihat agar instruksi koreksinya terbaca.
 if(show&&type==='success'){
   F4_IURAN_PERIOD_NOTICE_TIMER=(0,__f4.globals.setTimeout)(()=>{
     F4_IURAN_PERIOD_NOTICE_TIMER=null;
     el.textContent='';
     el.hidden=true;
   },3000);
 }
}
function f4IuranManualPeriod(){
 ++F4_IURAN_SUGGEST_SEQ;
 F4_IURAN_PERIOD_BLOCKED=false;
 f4IuranPeriodNotice('');
 updatePreview();
}
// Desktop-only identity preview. Independent of payment calculation and writes.
const f4IuranProfileMedia=__f4.globals.matchMedia('(min-width:1024px)');
const f4IuranProfileURL=__f4.globals.URL;
let f4IuranProfileSeq=0,f4IuranProfilePhoto='';
function f4IuranClearProfilePhoto(){
 if(f4IuranProfilePhoto){f4IuranProfileURL.revokeObjectURL(f4IuranProfilePhoto);f4IuranProfilePhoto=''}
}
__f4.cleanup(()=>{++f4IuranProfileSeq;f4IuranClearProfilePhoto()});
async function f4IuranProfile(id){
 const seq=++f4IuranProfileSeq,d=__f4.globals.document;
 const field=name=>d.getElementById('iuran-profile-'+name);
 const photo=field('photo');if(!photo)return;
 photo.hidden=true;photo.removeAttribute('src');f4IuranClearProfilePhoto();
 const w=f4IuranProfileMedia.matches?DATA.warga.find(x=>String(x.idWarga)===String(id)):null;
 const show=(name,value)=>{field(name).textContent=value};
 show('name',w?.nama||'Pilih warga');field('name').title=w?.nama||'';
 show('house',w?[w.blok,w.noRumah].filter(Boolean).join('/')||'—':'Nomor rumah —');
 show('stay',w?.statusTinggal||'—');show('phone',w?.noHP||'—');
 for(const k of ['loan','fine']){show(k,w?'Memeriksa…':'—');field(k).dataset.due='false'}
 show('note',w?'Memeriksa tanggungan…':'Pilih nama warga untuk memeriksa.');
 if(!w)return;
 const current=()=>seq===f4IuranProfileSeq&&photo.isConnected&&f4IuranProfileMedia.matches&&String(d.getElementById('inp-warga')?.value)===String(id);
 const read=async path=>{
  const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id'+path,{credentials:'include',cache:'no-store',mode:'cors'});
  const data=await response.json();if(!response.ok||data.ok!==true)throw Error(data.error||'Data tidak tersedia.');return data;
 };
 // Photos use the existing authenticated, member-ID-bound avatar endpoint.
 if(w.memberId){void (async()=>{try{
  const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/v2/admin/bank/member-avatar?memberId='+encodeURIComponent(w.memberId),{credentials:'include',cache:'no-store',mode:'cors'});
  if(!response.ok)return;const blob=await response.blob();if(!current()||!blob.type.startsWith('image/'))return;
  const url=f4IuranProfileURL.createObjectURL(blob);f4IuranProfilePhoto=url;photo.onload=()=>{if(current()&&photo.src===url)photo.hidden=false};photo.onerror=()=>{if(current())photo.hidden=true};photo.src=url;
 }catch{}})()}
 const today=new __f4.globals.Date(__f4.globals.Date.now()+7*60*60*1000).toISOString().slice(0,10);
 const debts=await __f4.globals.Promise.allSettled([
  read('/api/bookkeeping/pinjaman?limit=200').then(r=>{
   if(!Array.isArray(r.data)||r.data.length>=200)throw Error('Daftar pinjaman belum lengkap.');
   const rows=r.data.filter(x=>String(x.payerId)===String(id)&&!['batal','dibatalkan'].includes(String(x.status).toLowerCase()));
   if(rows.some(x=>x.perluRekonsiliasi||!Number.isSafeInteger(x.sisaRp)||x.sisaRp<0))throw Error('Pinjaman perlu diperiksa.');
   return rows.filter(x=>String(x.status).toLowerCase()==='aktif').reduce((n,x)=>n+x.sisaRp,0);
  }),
  read('/api/bookkeeping/iuran/fines?'+new __f4.globals.URLSearchParams({payerId:String(id),tanggal:today})).then(r=>{
   if(!Number.isSafeInteger(r.totalDendaRp)||r.totalDendaRp<0)throw Error('Denda perlu diperiksa.');return r.totalDendaRp;
  })
 ]);
 if(!current())return;
 let failed=false,hasDue=false;
 ['loan','fine'].forEach((k,i)=>{
  const result=debts[i];if(result.status!=='fulfilled'){show(k,'Perlu cek');failed=true;return}
  show(k,rupiah(result.value));field(k).dataset.due=String(result.value>0);if(result.value>0)hasDue=true;
 });
 show('note',failed?'Sebagian data belum dapat dipastikan.':hasDue?'Di luar tagihan iuran.':'Tidak ada tanggungan tercatat.');
}
f4IuranProfileMedia.addEventListener('change',()=>{void f4IuranProfile(__f4.globals.document.getElementById('inp-warga')?.value||'')});
async function pilihWargaIuran(){
 const ticket=++F4_IURAN_SUGGEST_SEQ;
 ++F4_IURAN_PREVIEW_SEQUENCE;
 F4_IURAN_PREVIEW=null;
 const id=(0,__f4.globals.String)(__f4.globals.document.getElementById('inp-warga')?.value||'');
 const bulan=__f4.globals.document.getElementById('inp-bulan'),tahun=__f4.globals.document.getElementById('inp-tahun');
 void f4IuranProfile(id);
 F4_IURAN_PERIOD_BLOCKED=!!id;
 if(!id){
   f4IuranPeriodNotice('');
   updatePreview();
   return;
 }
 // Hari ini hanya titik awal sementara, BUKAN tanda periode yang belum dibayar.
 const today=new __f4.globals.Date(__f4.globals.Date.now()+7*60*60*1000);
 bulan.value=(0,__f4.globals.String)(today.getUTCMonth()+1);
 tahun.value=(0,__f4.globals.String)(today.getUTCFullYear());
 __f4.window.refreshAllCustomSelects?.();
 f4IuranPeriodNotice('Memeriksa bulan yang belum lunas dari Pembukuan…');
 const empty=__f4.globals.document.getElementById('preview-empty'),details=__f4.globals.document.getElementById('preview-detail');
 if(empty){empty.textContent='Memeriksa riwayat pembayaran warga…';empty.classList.remove('hidden');}
 details?.classList.add('hidden');
 try{
   const url='https://api.flamboyan4.web.id/api/bookkeeping/iuran/suggested-period?'+new __f4.globals.URLSearchParams({payerId:id});
   const res=await (0,__f4.globals.fetch)(url,{credentials:'include',mode:'cors',cache:'no-store'});
   const result=await res.json().catch(()=>null);
   if(!res.ok||result?.ok!==true)throw (0,__f4.globals.Error)(result?.error||'Permintaan periode gagal (HTTP '+res.status+').');
   if(ticket!==F4_IURAN_SUGGEST_SEQ||(0,__f4.globals.String)(__f4.globals.document.getElementById('inp-warga')?.value)!==id)return;
   const match=(0,__f4.globals.String)(result.period||'').match(/^(20\d{2})-(0[1-9]|1[0-2])-01$/);
   if(!match){
     F4_IURAN_PERIOD_BLOCKED=true;
     f4IuranPeriodNotice('Tidak ditemukan bulan yang perlu dibayar. Periksa riwayat, atau pilih periode manual.','warning');
     empty.textContent='Tidak ada periode otomatis yang belum lunas. Pilih bulan secara manual bila ingin memeriksa.';
     empty.classList.remove('hidden');
     return;
   }
   const selectedYear=(0,__f4.globals.Number)(match[1]),selectedMonth=(0,__f4.globals.Number)(match[2]);
   if(selectedYear!==(0,__f4.globals.Number)(result.year)||selectedMonth!==(0,__f4.globals.Number)(result.month)||
      !__f4.globals.Number.isSafeInteger(result.remainingRp)||result.remainingRp<=0)
     throw (0,__f4.globals.Error)('Hasil pemeriksaan periode tidak konsisten.');
   bulan.value=(0,__f4.globals.String)(selectedMonth);
   tahun.value=(0,__f4.globals.String)(selectedYear);
   F4_IURAN_PERIOD_BLOCKED=false;
   const periodName=BULAN[selectedMonth]+' '+selectedYear;
   const paidLabel=(0,__f4.globals.String)(result.lastLunas||'').match(/^(20\d{2})-(0[1-9]|1[0-2])/);
   const lastPaid=paidLabel?' • Lunas terakhir '+BULAN[(0,__f4.globals.Number)(paidLabel[2])]+' '+paidLabel[1]:'';
   f4IuranPeriodNotice('Periode belum lunas: '+periodName+lastPaid,'success');
 }catch(error){
   if(ticket!==F4_IURAN_SUGGEST_SEQ||(0,__f4.globals.String)(__f4.globals.document.getElementById('inp-warga')?.value)!==id)return;
   F4_IURAN_PERIOD_BLOCKED=true;
   f4IuranPeriodNotice('Bulan otomatis gagal diperiksa. Pilih bulan manual atau pilih ulang warga.','error');
   if(empty){
     empty.textContent='Tidak dapat memeriksa pembayaran sebelumnya: '+(error.message||error)+'. Pilih bulan manual sebelum menyimpan.';
     empty.classList.remove('hidden');
   }
   details?.classList.add('hidden');
   __f4.globals.console.warn('Pencarian bulan iuran gagal:',error);
   return;
 }
 if(ticket!==F4_IURAN_SUGGEST_SEQ)return;
 __f4.window.refreshAllCustomSelects?.();
 updatePreview();
}

function f4IuranPreviewKey(){
 return ['inp-warga','inp-bulan','inp-tahun','inp-jumlah','inp-tanggal'].map(id=>__f4.globals.document.getElementById(id)?.value||'').join('|');
}
async function updatePreview(){
 const ticket=++F4_IURAN_PREVIEW_SEQUENCE;
 const w=DATA.warga.find(x=>(0,__f4.globals.String)(x.idWarga)===(0,__f4.globals.String)(__f4.globals.document.getElementById('inp-warga').value));
 const empty=__f4.globals.document.getElementById('preview-empty'),detail=__f4.globals.document.getElementById('preview-detail');
 F4_IURAN_PREVIEW=null;
 if(!w){empty.textContent='Pilih warga untuk melihat rincian.';empty.classList.remove('hidden');detail.classList.add('hidden');return}
 if(F4_IURAN_PERIOD_BLOCKED){
   empty.textContent='Tentukan periode pembayaran berdasarkan riwayat. Pilih ulang warga atau pilih Bulan Awal secara manual.';
   empty.classList.remove('hidden');detail.classList.add('hidden');return;
 }
 const firstMonth=(0,__f4.globals.Number)(__f4.globals.document.getElementById('inp-bulan').value),
       year=(0,__f4.globals.Number)(__f4.globals.document.getElementById('inp-tahun').value),
       count=(0,__f4.globals.Number)(__f4.globals.document.getElementById('inp-jumlah').value||1),key=f4IuranPreviewKey();
 empty.textContent='Memeriksa kewajiban sesuai periode…';
 empty.classList.remove('hidden');detail.classList.add('hidden');
 if(!__f4.globals.Number.isInteger(firstMonth)||firstMonth<1||firstMonth>12||!__f4.globals.Number.isInteger(year)||year<2020||
    !__f4.globals.Number.isInteger(count)||count<1||count>12){empty.textContent='Periksa pilihan bulan dan tahun.';return}
 try{
   const periods=__f4.globals.Array.from({length:count},(_,i)=>{
     const point=new __f4.globals.Date(__f4.globals.Date.UTC(year,firstMonth-1+i,1));
     return {year:point.getUTCFullYear(),month:point.getUTCMonth()+1};
   });
   const rows=await __f4.globals.Promise.all(periods.map(async p=>{
     const url='https://api.flamboyan4.web.id/api/bookkeeping/iuran/outstanding?'+new __f4.globals.URLSearchParams({
       payerId:(0,__f4.globals.String)(w.idWarga),year:(0,__f4.globals.String)(p.year),month:(0,__f4.globals.String)(p.month)
     });
     const response=await (0,__f4.globals.fetch)(url,{credentials:'include',cache:'no-store',mode:'cors'});
     const body=await response.json().catch(()=>({}));
     if(!response.ok||body.ok===false)throw (0,__f4.globals.Error)(body.error||'Kewajiban periode '+p.month+'/'+p.year+' gagal dibaca.');
     return body;
   }));
   const fineURL='https://api.flamboyan4.web.id/api/bookkeeping/iuran/fines?'+new __f4.globals.URLSearchParams({payerId:(0,__f4.globals.String)(w.idWarga),tanggal:__f4.globals.document.getElementById('inp-tanggal')?.value||''});
   const fineResponse=await (0,__f4.globals.fetch)(fineURL,{credentials:'include',cache:'no-store',mode:'cors'});
   const fineBody=await fineResponse.json().catch(()=>({}));
   if(!fineResponse.ok||fineBody.ok===false)throw (0,__f4.globals.Error)(fineBody.error||'Daftar Denda gagal diperiksa.');
   if(ticket!==F4_IURAN_PREVIEW_SEQUENCE||key!==f4IuranPreviewKey())return;
   const sums={IURAN_BULANAN:0,KEBERSIHAN:0,KAS_LORONG:0,ARISAN:0};
   for(const row of rows)for(const item of row.komponen||[]){
     if(__f4.globals.Object.hasOwn(sums,item.jenis))sums[item.jenis]+=__f4.globals.Math.max(0,(0,__f4.globals.Number)(item.sisaRp)||0);
   }
   const bul=sums.IURAN_BULANAN,keb=sums.KEBERSIHAN,kas=sums.KAS_LORONG,ari=sums.ARISAN,total=bul+keb+kas+ari;
   if(total===0){
     F4_IURAN_PREVIEW=null;
     detail.classList.add('hidden');empty.textContent='Periode ini sudah lunas atau tidak memiliki kewajiban. Pilih periode lain.';
     empty.classList.remove('hidden');
     const input=__f4.globals.document.getElementById('inp-nominal-dibayar');
     if(input){input.value='';delete input.dataset.lastTotal;delete input.dataset.edited;}
     updateNominalParsialInfo();
     return;
   }
   const outstandingFine=__f4.globals.Math.max(0,(0,__f4.globals.Number)(fineBody.totalDendaRp)||0);
   const redirectedFine=__f4.globals.Math.min(keb,outstandingFine);
   F4_IURAN_PREVIEW={key,total,fixed:bul+keb+ari,kas,dendaDialihkan:redirectedFine};
   const finePreview=__f4.globals.document.getElementById('pv-denda-otomatis');
   if(finePreview){
     finePreview.classList.toggle('hidden',redirectedFine<=0);
     finePreview.textContent=redirectedFine>0
       ?'Denda otomatis '+rupiah(redirectedFine)+' dialihkan dari Kebersihan. Kebersihan masih terutang '+rupiah(redirectedFine)+'.'
       :'';
   }
   empty.classList.add('hidden');detail.classList.remove('hidden');
   __f4.globals.document.getElementById('pv-bulanan').textContent=rupiah(bul);
   __f4.globals.document.getElementById('pv-kebersihan').textContent=rupiah(keb);
   __f4.globals.document.getElementById('pv-kebersihan-x').textContent=count>1?'Total '+count+' periode':'';
   __f4.globals.document.getElementById('pv-kas').textContent=rupiah(kas);
   __f4.globals.document.getElementById('pv-arisan').textContent=rupiah(ari);
   __f4.globals.document.getElementById('pv-total').textContent=rupiah(total);
   __f4.globals.document.getElementById('pv-periode').textContent=periodeList(firstMonth,year,count).join(', ');
   const input=__f4.globals.document.getElementById('inp-nominal-dibayar'),last=(0,__f4.globals.Number)(input?.dataset.lastTotal||0);
   if(input){
     if(input.dataset.edited!=='1'||(0,__f4.globals.Number)(input.value||0)===last){input.value=(0,__f4.globals.String)(total);input.dataset.edited=''}
     input.dataset.lastTotal=(0,__f4.globals.String)(total);
   }
   updateNominalParsialInfo();
 }catch(error){
   if(ticket!==F4_IURAN_PREVIEW_SEQUENCE)return;
   empty.textContent='Tidak dapat menghitung tagihan: '+(error.message||error)+'. Pembayaran belum dapat disimpan.';
   empty.classList.remove('hidden');detail.classList.add('hidden');
   updateNominalParsialInfo();
 }
}
function updateNominalParsialInfo(){
 const input=__f4.globals.document.getElementById('inp-nominal-dibayar'),info=__f4.globals.document.getElementById('inp-parsial-info');
 if(!input||!info)return;
 const state=F4_IURAN_PREVIEW;
 if(!state||state.key!==f4IuranPreviewKey()){
   info.hidden=true;info.textContent='';return;
 }
 info.hidden=false;
 const total=state.total,required=state.fixed,paid=(0,__f4.globals.Number)(input.value||0),missing=__f4.globals.Math.max(0,total-paid),fine=(0,__f4.globals.Number)(state.dendaDialihkan||0);
 if(!paid){info.className='text-[11px] mt-1 text-red-600';info.textContent='Masukkan nominal yang diterima.';return}
 if(paid>total){info.className='text-[11px] mt-1 text-red-600';info.textContent='Melebihi sisa tagihan.';return}
 if(paid<required){info.className='text-[11px] mt-1 text-red-600';info.textContent='Minimal '+rupiah(required)+' untuk komponen selain Kas Lorong.';return}
 if(missing>0){info.className='text-[11px] mt-1 text-amber-700 font-bold';info.textContent=(fine?'Denda dibayar '+rupiah(fine)+' dari Kebersihan • Sisa Kebersihan '+rupiah(fine)+' • ':'')+'Sisa Kas Lorong '+rupiah(missing);return}
 if(fine>0){info.className='text-[11px] mt-1 text-amber-700 font-bold';info.textContent='Denda dialihkan '+rupiah(fine)+' dari Kebersihan; sisa Kebersihan '+rupiah(fine)+'.';return}
 info.hidden=true;info.textContent='';
}
let saveStatusTimer=null;
function hideSaveStatus(){const e=__f4.globals.document.getElementById('save-status');if(e)e.classList.add('hidden')}
function saveStatus(t,type='info',autoHideMs=0){
  const e=__f4.globals.document.getElementById('save-status');if(!e)return;
  if(saveStatusTimer){(0,__f4.globals.clearTimeout)(saveStatusTimer);saveStatusTimer=null}
  e.className='fixed z-[120] left-1/2 -translate-x-1/2 bottom-5 w-[calc(100%-2rem)] max-w-lg rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-sm';
  if(type==='error')e.classList.add('bg-red-50/95','border-red-200','text-red-700');
  else if(type==='success')e.classList.add('bg-violet-50/95','border-violet-200','text-violet-700');
  else e.classList.add('bg-white/95','border-slate-200','text-slate-600');
  e.textContent=t;
  if(autoHideMs>0)saveStatusTimer=(0,__f4.globals.setTimeout)(hideSaveStatus,autoHideMs);
}
function resetIuranFormAfterSave(){
  f4IuranPeriodNotice('');
  ++F4_IURAN_SUGGEST_SEQ;
  F4_IURAN_PERIOD_BLOCKED=false;
  const now=new __f4.globals.Date();
  const warga=__f4.globals.document.getElementById('inp-warga');if(warga)warga.value='';
  void f4IuranProfile('');
  const tanggal=__f4.globals.document.getElementById('inp-tanggal');if(tanggal)tanggal.value=now.toISOString().slice(0,10);
  const metode=__f4.globals.document.getElementById('inp-metode');if(metode)metode.value='Cash';
  const bulan=__f4.globals.document.getElementById('inp-bulan');if(bulan)bulan.value=(0,__f4.globals.String)(now.getMonth()+1);
  const tahun=__f4.globals.document.getElementById('inp-tahun');if(tahun)tahun.value=(0,__f4.globals.String)(now.getFullYear());
  const jumlah=__f4.globals.document.getElementById('inp-jumlah');if(jumlah)jumlah.value='1';
  const catatan=__f4.globals.document.getElementById('inp-catatan');if(catatan)catatan.value='';
  const nominal=__f4.globals.document.getElementById('inp-nominal-dibayar');if(nominal){nominal.value='';delete nominal.dataset.edited}
  updatePreview();
  updateNominalParsialInfo();
  __f4.window.refreshAllCustomSelects?.();
}
async function simpanIuran(ev){
  ev.preventDefault();
  const idWarga=__f4.globals.document.getElementById('inp-warga').value;
  if(!idWarga){saveStatus('Pilih warga terlebih dahulu.','error',2600);return}
  if(!F4_IURAN_PREVIEW||F4_IURAN_PREVIEW.key!==f4IuranPreviewKey()){
    saveStatus('Kewajiban periode belum terverifikasi. Periksa rincian sebelum menyimpan.','error',3800);return;
  }
  const btn=__f4.globals.document.getElementById('btn-simpan');btn.disabled=true;btn.classList.add('opacity-60');
  saveStatus('Menyimpan pembayaran...');
  try{
    const p={action:'simpaniuran',idWarga,tanggal:__f4.globals.document.getElementById('inp-tanggal').value,tahun:__f4.globals.document.getElementById('inp-tahun').value,bulan:__f4.globals.document.getElementById('inp-bulan').value,jumlahBulan:__f4.globals.document.getElementById('inp-jumlah').value,nominalDibayar:__f4.globals.document.getElementById('inp-nominal-dibayar').value,metode:__f4.globals.document.getElementById('inp-metode').value,catatan:__f4.globals.document.getElementById('inp-catatan').value,t:__f4.globals.Date.now()};
    const r=await jsonp(APPS_SCRIPT_URL,p);if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal menyimpan.');
    let talInfo='';
    try{const tr=await jsonp(BATCH_SCRIPT_URL,{action:'sinkrontalanganpembayaran',idPembayaran:r.idPembayaran,t:__f4.globals.Date.now()});if(tr?.status==='success'&&(0,__f4.globals.Number)(tr.nominal||0)>0)talInfo=` • Penggantian talangan ${rupiah(tr.nominal)}`}catch(te){__f4.globals.console.warn('Sinkron talangan:',te)}
    const periode=__f4.globals.Array.isArray(r.periode)?r.periode.join(', '):(r.periode||'');
    saveStatus(`Pembayaran berhasil disimpan${periode?` • ${periode}`:''} • diterima ${rupiah(r.totalDiterima)}${(0,__f4.globals.Number)(r.dendaDibayarRp||0)>0?` • Denda ${rupiah(r.dendaDibayarRp)} dari Kebersihan`:''}${(0,__f4.globals.Number)(r.kekuranganKasLorong||0)>0?` • kurang Kas ${rupiah(r.kekuranganKasLorong)}`:''}${talInfo}`,'success',3500);
    resetIuranFormAfterSave();
    await loadRiwayat(true);
  }catch(e){saveStatus(e.message||(0,__f4.globals.String)(e),'error',4200)}
  finally{btn.disabled=false;btn.classList.remove('opacity-60')}
}

__f4.globals.document.getElementById('inp-tanggal')?.addEventListener('change',()=>{void updatePreview()});
['inp-warga','inp-tanggal','inp-metode','inp-bulan','inp-tahun','inp-jumlah','inp-nominal-dibayar','inp-catatan'].forEach(id=>{
  const el=__f4.globals.document.getElementById(id);
  if(el){const clear=()=>{if(!__f4.globals.document.getElementById('save-status')?.classList.contains('hidden'))hideSaveStatus()};el.addEventListener('change',clear);el.addEventListener('input',clear)}
});


async function loadRiwayat(silent=false){
  try{
    if(!silent) riwayatMsg('Memuat riwayat...','info');
    const r=await jsonp(APPS_SCRIPT_URL,{action:'riwayatpembayaran',t:__f4.globals.Date.now()});
    if(!r||r.status!=='success') throw new __f4.globals.Error(r?.message||'Gagal memuat riwayat.');
    DATA.riwayat=r.data||[];
    __f4.window.F4BookExtras?.reset();
    renderRiwayat();
    loadIuranQuickSummary();
    void refreshIuranPosition();
    if(!silent)riwayatMsg('Riwayat diperbarui.','success')
  }catch(e){riwayatMsg(e.message||(0,__f4.globals.String)(e),'error')}
}
function riwayatMsg(t,type='info'){
  const e=__f4.globals.document.getElementById('riwayat-status');if(!e)return;
  if(type==='info'&&/^Memuat /i.test(t)){__f4.globals.F4Loading.begin(e,t);return}
  if(type==='success'&&/^Riwayat diperbarui\.?$/i.test(t)){__f4.globals.F4Loading.success(e);return}
  e.dataset.f4State='notice';e.className='mb-3 rounded-xl border px-4 py-3 text-sm';
  if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');
  else if(type==='success')e.classList.add('bg-violet-50','border-violet-200','text-violet-700');
  else e.classList.add('bg-slate-50','border-slate-200','text-slate-600');e.textContent=t;
}

function histDate(v){
  // Tampilan tanggal saja; jam dari spreadsheet bukan waktu transaksi.
  if(v == null || (0,__f4.globals.String)(v).trim() === '') return '-';
  const t=(0,__f4.globals.String)(v).trim();
  let m=t.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?=$|[T\s])/);
  if(m)return `${m[3].padStart(2,'0')}/${m[2].padStart(2,'0')}/${m[1]}`;
  m=t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?=$|[T\s])/);
  if(m)return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${m[3]}`;
  // Format tidak dikenal: buang jam yang berakhiran HH:MM(:SS) tanpa mengubah nilai sumber.
  return t.replace(/[T\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/,'');
}
function historyDateTs(v){
  const s=(0,__f4.globals.String)(v||'').trim(); if(!s)return 0;
  let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return new __f4.globals.Date(+m[1],+m[2]-1,+m[3]).getTime();
  m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);if(m)return new __f4.globals.Date(+m[3],+m[2]-1,+m[1]).getTime();
  const d=__f4.globals.Date.parse(s);return __f4.globals.Number.isFinite(d)?d:0;
}
function newestFirst(arr,key){return [...(arr||[])].sort((a,b)=>historyDateTs(b?.[key])-historyDateTs(a?.[key]))}
function refreshHistoryIcons(){(0,__f4.globals.requestAnimationFrame)(()=>{try{__f4.globals.lucide.createIcons()}catch(e){}})}
function actionIcon(icon,title,onclick,tone='violet'){
  const safeTitle=(0,__f4.globals.String)(title||'').replace(/"/g,'&quot;');
  return `<button type="button" class="action-icon ${tone}" title="${safeTitle}" aria-label="${safeTitle}" onclick="${onclick}"><i data-lucide="${icon}"></i></button>`;
}
function initRiwayatPeriodFilter(){
  const now=new __f4.globals.Date();
  const y=now.getFullYear(),m=(0,__f4.globals.String)(now.getMonth()+1).padStart(2,'0');
  const ym=`${y}-${m}`;
  const month=__f4.globals.document.getElementById('riwayat-period-month');
  const start=__f4.globals.document.getElementById('riwayat-period-start');
  const end=__f4.globals.document.getElementById('riwayat-period-end');
  const year=__f4.globals.document.getElementById('riwayat-period-year');

  /* Satu dropdown = Bulan + Tahun. Tidak ada input manual. */
  const firstYear=2020;
  const lastYear=__f4.globals.Math.max(y+5,2030);
  const monthOpts=[];
  for(let yy=lastYear;yy>=firstYear;yy--){
    for(let mm=12;mm>=1;mm--){
      monthOpts.push(`<option value="${yy}-${(0,__f4.globals.String)(mm).padStart(2,'0')}">${BULAN[mm]} ${yy}</option>`);
    }
  }
  const yearOpts=[];
  for(let yy=lastYear;yy>=firstYear;yy--) yearOpts.push(`<option value="${yy}">${yy}</option>`);
  [month,start,end].forEach(el=>{if(el&&!el.options.length)el.innerHTML=monthOpts.join('')});
  if(year&&!year.options.length)year.innerHTML=yearOpts.join('');

  if(month)month.value=ym;
  if(start)start.value=ym;
  if(end)end.value=ym;
  if(year)year.value=(0,__f4.globals.String)(y);
  updateRiwayatPeriodControls();
  __f4.window.refreshAllCustomSelects?.();
}
function updateRiwayatPeriodControls(){
  const mode=__f4.globals.document.getElementById('riwayat-period-mode')?.value||'bulan';
  __f4.globals.document.getElementById('riwayat-period-bulan')?.classList.toggle('hidden',mode!=='bulan');
  __f4.globals.document.getElementById('riwayat-period-rentang')?.classList.toggle('hidden',mode!=='rentang');
  __f4.globals.document.getElementById('riwayat-period-tahun')?.classList.toggle('hidden',mode!=='tahun');
}
function monthKeyFromLabel(label){
  const s=(0,__f4.globals.String)(label||'').trim();const m=s.match(/^([^\d]+?)\s+(\d{4})$/);if(!m)return '';
  const idx=BULAN.findIndex(x=>x.toLowerCase()===m[1].trim().toLowerCase());return idx>0?`${m[2]}-${(0,__f4.globals.String)(idx).padStart(2,'0')}`:'';
}
function paymentMonthKeys(x){
  let keys=(x?.periode||[]).map(monthKeyFromLabel).filter(__f4.globals.Boolean);
  if(!keys.length&&x?.tahunAwal&&x?.bulanAwal){
    let y=(0,__f4.globals.Number)(x.tahunAwal),m=(0,__f4.globals.Number)(x.bulanAwal),n=__f4.globals.Math.max(1,(0,__f4.globals.Number)(x.jumlahBulan)||1);
    for(let i=0;i<n;i++){keys.push(`${y}-${(0,__f4.globals.String)(m).padStart(2,'0')}`);m++;if(m>12){m=1;y++}}
  }
  return keys;
}
function matchRiwayatPeriod(x){
  const mode=__f4.globals.document.getElementById('riwayat-period-mode')?.value||'bulan';
  if(mode==='semua')return true;
  const keys=paymentMonthKeys(x);
  if(!keys.length)return true;
  if(mode==='bulan'){
    const k=__f4.globals.document.getElementById('riwayat-period-month')?.value||'';
    return !k||keys.includes(k);
  }
  if(mode==='tahun'){
    const y=(0,__f4.globals.String)(__f4.globals.document.getElementById('riwayat-period-year')?.value||'').trim();
    return !y||keys.some(k=>k.startsWith(y+'-'));
  }
  const a=__f4.globals.document.getElementById('riwayat-period-start')?.value||'';
  const b=__f4.globals.document.getElementById('riwayat-period-end')?.value||'';
  if(!a&&!b)return true;
  const lo=a||'0000-01',hi=b||'9999-12';
  return keys.some(k=>k>=lo&&k<=hi);
}

function iuranQuickPeriodLabel(){
  try{
    const a=__f4.globals.document.querySelector('.upr-control[data-key="history-iuran"][data-side="from"] .upr-field-text')?.textContent?.trim()||'';
    const b=__f4.globals.document.querySelector('.upr-control[data-key="history-iuran"][data-side="to"] .upr-field-text')?.textContent?.trim()||'';
    if(a&&b) return a===b?a:`${a} s.d. ${b}`;
  }catch(e){}
  return 'Periode aktif';
}
function f4IuranPeriodDisplay(label){
 const raw=(0,__f4.globals.String)(label||'').trim();
 const parts=raw.split(/\s+s\.d\.\s+/i);
 const parse=value=>{
  const m=/^(20\d{2})-(0[1-9]|1[0-2])$/.exec(value);
  if(!m)return null;
  const year=(0,__f4.globals.Number)(m[1]),month=(0,__f4.globals.Number)(m[2]);
  return {year,month,date:new __f4.globals.Date(__f4.globals.Date.UTC(year,month-1,1))};
 };
 const start=parse(parts[0]);
 if(!start||parts.length>2)return raw;
 const end=parts.length===2?parse(parts[1]):null;
 if(parts.length===2&&!end)return raw;
 const full=d=>new __f4.globals.Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric',timeZone:'UTC'}).format(d);
 const short=d=>new __f4.globals.Intl.DateTimeFormat('id-ID',{month:'short',year:'numeric',timeZone:'UTC'}).format(d);
 if(!end||start.year===end.year&&start.month===end.month)return full(start.date);
 return short(start.date)+' – '+short(end.date);
}
let IURAN_QUICK_DATA=null,IURAN_QUICK_REQ=0;
let iuranPositionLoading=false;
async function refreshIuranPosition(){
  const box=__f4.globals.document.getElementById('iq-current-position');
  if(!box?.open||iuranPositionLoading)return;
  const status=box.querySelector('#iq-current-status');
  const fields=[...box.querySelectorAll('[data-location]')];
  iuranPositionLoading=true;
  fields.forEach(x=>x.textContent='—');
  status.textContent='Memuat saldo Pusat Keuangan…';
  try{
    const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/v2/admin/treasury',{credentials:'include',cache:'no-store'});
    const data=await response.json();
    if(!response.ok||data.ok===false||!Array.isArray(data.balances))throw Error('Saldo tidak tersedia.');
    if(!data.confirmed){status.textContent='Saldo awal belum disahkan.';return;}
    const positions={'cash:kas_rt':0,qris:0,mandiri:0,total:0};
    for(const row of data.balances.filter(x=>x.fund_id==='kas_rt')){
      const amount=Number(row.amount_rp);
      if(!['cash:kas_rt','qris','mandiri'].includes(row.location_id)||!Number.isSafeInteger(amount))throw Error('Data saldo tidak valid.');
      positions[row.location_id]+=amount;
      positions.total+=amount;
    }
    fields.forEach(x=>x.textContent=rupiah(positions[x.dataset.location]));
    status.textContent='Saldo Kas Lorong terkini yang sudah disahkan di Pusat Keuangan. Tidak termasuk transaksi menunggu pengesahan.';
  }catch(e){status.textContent='Posisi uang belum dapat dimuat. Buka kembali untuk mencoba.';}
  finally{iuranPositionLoading=false;}
}
function iqCountHtml(c){
  c=c||{};const l=(0,__f4.globals.Number)(c.lunas||0),s=(0,__f4.globals.Number)(c.sebagian||0),b=(0,__f4.globals.Number)(c.belum||0);
  const paid=s>0?`${l} lunas${s?` · ${s} sebagian`:''}`:`${l} bayar`;
  const partial=s>0?`<span class="mitem" title="Sebagian"><i data-lucide="circle-dot"></i>${s}</span>`:'';
  return `<span class="iq-count-desktop"><span>${paid}</span><span>${b} belum</span></span><span class="iq-count-mobile"><span class="iq-count-mobile-line"><span class="mitem" title="Sudah bayar"><i data-lucide="circle-check"></i>${l}</span>${partial}</span><span class="iq-count-mobile-line"><span class="mitem" title="Belum bayar"><i data-lucide="circle"></i>${b}</span></span></span>`;
}
function f4RebuildQuickSummaryFromPaymentAllocations(server){
  // Baca alokasi pembayaran historis dari D1 yang sudah ada di browser.
  // Jangan memperkirakan pembagian berdasarkan total; lakukan hanya jika
  // seluruh nominal per alokasi cocok dengan total server.
  const rows=(DATA.riwayat||[]).filter(x=>x.status==='AKTIF');
  const period=__f4.window.UPR?.state?.('history-iuran');
  if(!period||!rows.length||!server?.totals)return null;
  const parts={rt:0,kas:0,arisan:0,total:0};
  // Perhitungan nominal tetap dari alokasi; jumlah warga berasal dari kewajiban aktif server.
  // Jangan menebak jumlah warga berdasarkan semua pembayar historis.

  const validTypes=new __f4.globals.Set(['IURAN_BULANAN','KEBERSIHAN','KAS_LORONG','ARISAN']);
  let found=0;
  for(const row of rows){
    const allocations=__f4.globals.Array.isArray(row.alokasi)?row.alokasi:[];
    for(const a of allocations){
      if((0,__f4.globals.String)(a.status||'aktif').toLowerCase()!=='aktif')continue;
      const type=(0,__f4.globals.String)(a.jenis||'').toUpperCase();
      if(!validTypes.has(type))continue;
      const amount=(0,__f4.globals.Number)(a.nominal??a.jumlahRp??0);
      if(!__f4.globals.Number.isSafeInteger(amount)||amount<0)return null;
      const periodKey=(0,__f4.globals.String)(a.tahun)+'-'+(0,__f4.globals.String)(a.bulan).padStart(2,'0');
      const qualifies=period.level==='date'?matchRiwayatPeriod(row):
        period.level==='year'?(0,__f4.globals.Number)(a.tahun)>=(0,__f4.globals.Number)(period.from)&&(0,__f4.globals.Number)(a.tahun)<=(0,__f4.globals.Number)(period.to):
        periodKey>=(0,__f4.globals.String)(period.from)&&periodKey<=(0,__f4.globals.String)(period.to);
      if(!qualifies)continue;
      found++;parts.total+=amount;
      const kind=type==='KAS_LORONG'?'kas':type==='ARISAN'?'arisan':'rt';
      parts[kind]+=amount;
      // Jumlah pembayar tidak dijumlahkan ulang di sini; server memakai himpunan warga wajib aktif.
    }
  }
  if(!found||parts.total!==(0,__f4.globals.Number)(server.totals.totalMasuk||0))return null;
  const totals={...server.totals,setoranRT:parts.rt,kasLorong:parts.kas,arisan:parts.arisan,
    selisih:(0,__f4.globals.Number)(server.totals.totalMasuk)-parts.rt-parts.kas-parts.arisan};
  return {...server,totals,counts:server.counts,source:'d1-payment-allocations-local-check'};
}
function renderIuranQuickSummary(data){
  const box=__f4.globals.document.getElementById('iuran-quick-summary');if(!box)return;
  if(data){
    // Jumlah pembayar berasal dari satu sumber D1; jangan hitung ulang di browser.
    IURAN_QUICK_DATA=__f4.globals.Math.abs((0,__f4.globals.Number)(data.totals?.selisih||0))>0?
      (f4RebuildQuickSummaryFromPaymentAllocations(data)||data):data;
  }
  const d=IURAN_QUICK_DATA;
  if(d&&d.totals){
    const t=d.totals,c=d.counts||{};const put=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=rupiah(v||0)};
    put('iq-total',t.totalMasuk);put('iq-rt',t.setoranRT);put('iq-kas',t.kasLorong);put('iq-arisan',t.arisan);put('iq-cash',t.cash);put('iq-qris',t.qris);put('iq-mandiri',t.mandiri);put('iq-selisih',t.selisih);
    ['total','rt','kas','arisan'].forEach(k=>{const e=__f4.globals.document.getElementById('iq-count-'+k);if(e)e.innerHTML=iqCountHtml(c[k])});
    const p=__f4.globals.document.getElementById('iuran-quick-period');if(p)p.textContent=f4IuranPeriodDisplay(d.labelPeriode||iuranQuickPeriodLabel());
    const sc=__f4.globals.document.getElementById('iq-selisih-card');if(sc)sc.classList.toggle('has-diff',__f4.globals.Math.abs((0,__f4.globals.Number)(t.selisih||0))>.5);
    const more=box.querySelector('#iq-original-methods');if(more&&__f4.globals.Math.abs((0,__f4.globals.Number)(t.selisih||0))>.5)more.open=true;
    try{__f4.globals.lucide.createIcons()}catch(_e){}
    return;
  }
  // Fallback lama bila backend baru belum dideploy.
  const active=(DATA.riwayat||[]).filter(x=>x.status==='AKTIF'&&matchRiwayatPeriod(x));
  const n=k=>active.reduce((s,x)=>s+((0,__f4.globals.Number)(x?.[k])||0),0),total=n('totalDiterima'),rt=n('totalSetoranRT'),kas=n('totalKasLorong'),arisan=n('totalArisan');let cash=0,qris=0,mandiri=0;
  active.forEach(x=>{const v=(0,__f4.globals.Number)(x.totalDiterima)||0,m=(0,__f4.globals.String)(x.metode||'').toLowerCase();if(m.includes('cash')||m.includes('tunai'))cash+=v;else if(m.includes('qris')||m==='qr'||m.includes('qr '))qris+=v;else if(m.includes('mandiri'))mandiri+=v});
  const selisih=__f4.globals.Math.round(total-rt-kas-arisan),put=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=rupiah(v)};put('iq-total',total);put('iq-rt',rt);put('iq-kas',kas);put('iq-arisan',arisan);put('iq-cash',cash);put('iq-qris',qris);put('iq-mandiri',mandiri);put('iq-selisih',selisih);const p=__f4.globals.document.getElementById('iuran-quick-period');if(p)p.textContent=f4IuranPeriodDisplay(iuranQuickPeriodLabel());const sc=__f4.globals.document.getElementById('iq-selisih-card');if(sc)sc.classList.toggle('has-diff',__f4.globals.Math.abs(selisih)>.5);
}
async function loadIuranQuickSummary(){
  const req=++IURAN_QUICK_REQ;
  try{const prm=__f4.window.UPR?.params?__f4.window.UPR.params('history-iuran'):{};const r=await jsonp(APPS_SCRIPT_URL,{action:'iuranquicksummary',...prm,t:__f4.globals.Date.now()});if(req!==IURAN_QUICK_REQ)return;if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal');renderIuranQuickSummary(r.data||null)}catch(e){if(req!==IURAN_QUICK_REQ)return;IURAN_QUICK_DATA=null;renderIuranQuickSummary()}
}

function normRiwayatSearch(v){
  return (0,__f4.globals.String)(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
}
function riwayatResidentInfo(x){
  const warga=(DATA.warga||[]).find(w=>(0,__f4.globals.String)(w.idWarga||'')===(0,__f4.globals.String)(x.idWarga||''));
  const blok=(0,__f4.globals.String)(x.blok||x.blokRumah||warga?.blok||'').trim();
  const noRumah=(0,__f4.globals.String)(x.noRumah||x.nomorRumah||x.no_rumah||warga?.noRumah||'').trim();
  const rumah=(0,__f4.globals.String)(x.rumah||'').trim() || [blok,noRumah].filter(__f4.globals.Boolean).join('/');
  return {warga,blok,noRumah,rumah};
}
function renderRiwayat(){
  const tbody=__f4.globals.document.getElementById('tbody-riwayat');if(!tbody)return;
  if(!IURAN_QUICK_DATA)renderIuranQuickSummary();
  const qRaw=(__f4.globals.document.getElementById('cari-riwayat')?.value||'').trim().toLowerCase();
  const qNorm=normRiwayatSearch(qRaw);
  const f=__f4.globals.document.getElementById('filter-riwayat')?.value||'AKTIF';
  let rows=(DATA.riwayat||[]).filter(x=>{
    if(f!=='SEMUA'&&x.status!==f)return false;
    if(!matchRiwayatPeriod(x))return false;
    if(!qRaw)return true;
    const info=riwayatResidentInfo(x);
    const nama=x.nama||info.warga?.nama||'';
    const rumahVariants=[info.rumah,[info.blok,info.noRumah].filter(__f4.globals.Boolean).join(' '),`${info.blok}${info.noRumah}`];
    const fields=[nama,x.idWarga,x.idPembayaran,x.metode,(x.periode||[]).join(' '),...rumahVariants];
    const hayRaw=fields.join(' ').toLowerCase();
    const hayNorm=normRiwayatSearch(fields.join(' '));
    return hayRaw.includes(qRaw) || (qNorm && hayNorm.includes(qNorm));
  }).sort((a,b)=>
    historyDateTs(b.tanggal)-historyDateTs(a.tanggal) ||
    ((0,__f4.globals.Number)(b.urutanInput)||0)-((0,__f4.globals.Number)(a.urutanInput)||0)
  );
  tbody.innerHTML=rows.map(x=>{
    const info=riwayatResidentInfo(x);
    const batal=x.status==='BATAL';
    const badge=batal?'<span class="px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">BATAL</span>':(x.locked?'<span class="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">TERKUNCI</span>':'<span class="px-2 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">AKTIF</span>');
    const bolehHapus=x.jenisPembayaran!=='PELUNASAN_KAS'||x.status==='BATAL';
    const actions=[];
    // Resi berbasis transaksi aktif, termasuk transaksi yang sudah dibukukan.
    if(!batal&&x.idPembayaran)actions.push(actionIcon('receipt-text','Resi JPG',`F4BookExtras.receipt(decodeURIComponent('${(0,__f4.globals.encodeURIComponent)((0,__f4.globals.String)(x.idPembayaran))}'))`,'violet'));
    if(x.locked){
      if(x.canCorrectMigrationDate)actions.push(`<button type="button" class="action-icon violet" title="Koreksi tanggal migrasi" aria-label="Koreksi tanggal migrasi" onclick="bukaKoreksiMigrasi('${x.idPembayaran}')"><span aria-hidden="true" class="f4-book-action-svg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg></span></button>`);
      actions.push('<span class="text-xs text-slate-400">Sudah dibukukan</span>');
    }
    else{
      if(x.canEdit)actions.push(actionIcon('pencil','Edit',`bukaEdit('${x.idPembayaran}')`,'violet'));
      if(x.canCancel&&x.status!=='BATAL')actions.push(actionIcon('circle-x','Batal',`batalkanPembayaran('${x.idPembayaran}')`,'amber'));
      if(bolehHapus)actions.push(actionIcon('trash-2','Hapus',`hapusPembayaran('${x.idPembayaran}')`,'red'));
    }
    const aksi=`<div class="action-icons">${actions.join('')}</div>`;
    return `<tr class="${batal?'opacity-55':''} hover:bg-violet-50/30"><td class="p-3 whitespace-nowrap">${histDate(x.tanggal)}</td><td class="p-3"><div class="font-bold whitespace-nowrap">${x.nama||'-'}</div><div class="text-xs text-slate-400 whitespace-nowrap">${info.rumah||'-'}</div></td><td class="p-3 text-right whitespace-nowrap"><div class="font-black">${rupiah(x.totalDiterima)}</div>${(0,__f4.globals.Number)(x.kekuranganKasLorong||0)>0?`<div class="text-xs font-bold text-amber-700">Kurang Kas ${rupiah(x.kekuranganKasLorong)}</div>`:''}${x.jenisPembayaran==='PELUNASAN_KAS'?'<div class="text-xs text-emerald-700 font-bold">Pelunasan Kas</div>':''}</td><td class="p-3 whitespace-nowrap">${x.metode||'-'}</td><td class="p-3 text-center">${badge}</td><td class="p-3 text-right">${aksi}</td></tr>`;
  }).join('')||'<tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada riwayat pembayaran pada periode ini.</td></tr>';
  refreshHistoryIcons();
}

let KOREKSI_MIGRASI_ID='';
function bukaKoreksiMigrasi(id){
 const x=(DATA.riwayat||[]).find(r=>r.idPembayaran===id);
 if(!x||!x.canCorrectMigrationDate){riwayatMsg('Hanya transaksi migrasi terkunci yang dapat dikoreksi.','error');return;}
 KOREKSI_MIGRASI_ID=id;
 __f4.globals.document.getElementById('km-desc').textContent=`${x.nama||''} • ${id} • tanggal lama ${histDate(x.tanggal)}`;
 __f4.globals.document.getElementById('km-date').value=x.tanggalIso||'';
 __f4.globals.document.getElementById('km-status').classList.add('hidden');
 __f4.globals.document.getElementById('modal-koreksi-migrasi').style.display='flex';
}
function tutupKoreksiMigrasi(){__f4.globals.document.getElementById('modal-koreksi-migrasi').style.display='none';KOREKSI_MIGRASI_ID='';}
async function simpanKoreksiMigrasi(){
 const id=KOREKSI_MIGRASI_ID,tanggalBaru=__f4.globals.document.getElementById('km-date').value;
 const msg=__f4.globals.document.getElementById('km-status'),btn=__f4.globals.document.getElementById('km-save');
 msg.classList.remove('hidden');
 if(!tanggalBaru){msg.textContent='Pilih tanggal yang benar.';return;}
 if(!(0,__f4.globals.confirm)(`Koreksi tanggal bayar ${id} ke ${tanggalBaru}? Nominal, alokasi dan Kas gabungan tidak berubah.`))return;
 btn.disabled=true;msg.textContent='Menyimpan koreksi...';
 try{
  const r=await jsonp(APPS_SCRIPT_URL,{action:'koreksitanggalmigrasi',idPembayaran:id,tanggalBaru,t:__f4.globals.Date.now()});
  if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal menyimpan koreksi.');
  tutupKoreksiMigrasi();await loadRiwayat(true);riwayatMsg(r.message||'Koreksi tersimpan.','success');
 }catch(e){msg.textContent=e.message||(0,__f4.globals.String)(e)}finally{btn.disabled=false;}
}

function isiEditOptions(){
  __f4.globals.document.getElementById('edit-warga').innerHTML=DATA.warga.filter(w=>['ya','aktif'].includes((w.statusAktif||'').toLowerCase())).map(w=>`<option value="${w.idWarga}">${w.nama} (${w.blok}/${w.noRumah})</option>`).join('');
  __f4.globals.document.getElementById('edit-bulan').innerHTML=BULAN.slice(1).map((b,i)=>`<option value="${i+1}">${b}</option>`).join('');
}
function bukaEdit(id){
  const x=DATA.riwayat.find(r=>r.idPembayaran===id);if(!x||!x.canEdit){riwayatMsg('Transaksi ini tidak dapat diedit.','error');return}
  isiEditOptions();__f4.globals.document.getElementById('edit-id').value=id;__f4.globals.document.getElementById('edit-id-label').textContent=id;__f4.globals.document.getElementById('edit-warga').value=x.idWarga;__f4.globals.document.getElementById('edit-tanggal').value=x.tanggalIso||'';__f4.globals.document.getElementById('edit-metode').value=x.metode||'Cash';__f4.globals.document.getElementById('edit-bulan').value=x.bulanAwal||1;__f4.globals.document.getElementById('edit-tahun').value=x.tahunAwal||new __f4.globals.Date().getFullYear();__f4.globals.document.getElementById('edit-jumlah').value=(0,__f4.globals.String)(x.jumlahBulan||1);__f4.globals.document.getElementById('edit-catatan').value=x.catatan||'';// Alokasi/periode/pembayar tetap agar jurnal dan kas tidak berubah diam-diam.
  for(const key of ['edit-warga','edit-bulan','edit-tahun','edit-jumlah']){
   const field=__f4.globals.document.getElementById(key);if(field){field.disabled=true;field.title='Nominal dan alokasi tidak dapat diganti melalui edit. Batalkan transaksi yang belum dibukukan lalu buat yang baru.';}
  }
  __f4.globals.document.getElementById('edit-status').classList.remove('hidden');
  editMsg('Perubahan tanggal, metode, dan catatan dapat diedit. Untuk mengubah warga, periode, atau nominal, batalkan transaksi lalu input ulang.');
  updateEditPreview();const modal=__f4.globals.document.getElementById('modal-edit');modal.classList.remove('hidden');modal.scrollTop=0;const form=modal.querySelector('.f4-book-edit-form');if(form)form.scrollTop=0;__f4.globals.document.body.style.overflow='hidden';__f4.globals.lucide.createIcons();
}
function tutupEdit(){__f4.globals.document.getElementById('modal-edit').classList.add('hidden');__f4.globals.document.body.style.overflow=''}
function updateEditPreview(){
  const w=DATA.warga.find(x=>x.idWarga===__f4.globals.document.getElementById('edit-warga').value);const box=__f4.globals.document.getElementById('edit-preview');if(!w){box.textContent='Pilih warga.';return}const c=DATA.config;const per=(w.qtyIuranBulanan*(c.TARIF_BULANAN||0))+(w.qtyKebersihan*(c.TARIF_KEBERSIHAN||0))+(w.qtyKasLorong*(c.TARIF_KAS_LORONG||0))+(w.qtyArisan*(c.TARIF_ARISAN||0));const j=(0,__f4.globals.Number)(__f4.globals.document.getElementById('edit-jumlah').value||1);box.innerHTML=`<div class="flex flex-col sm:flex-row justify-between gap-2"><div><div class="text-xs text-slate-500">Periode</div><div class="font-bold">${periodeList(__f4.globals.document.getElementById('edit-bulan').value,__f4.globals.document.getElementById('edit-tahun').value,j).join(', ')}</div></div><div class="sm:text-right"><div class="text-xs text-slate-500">Total</div><div class="font-black text-xl text-violet-700">${rupiah(per*j)}</div></div></div>`;
}
function editMsg(t,type='info'){const e=__f4.globals.document.getElementById('edit-status');e.className='rounded-xl border px-4 py-3 text-sm';if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');else e.classList.add('bg-violet-50','border-violet-200','text-violet-700');e.textContent=t}
async function simpanEdit(ev){
  ev.preventDefault();const btn=__f4.globals.document.getElementById('btn-edit-save');btn.disabled=true;btn.classList.add('opacity-60');editMsg('Menyimpan perubahan...');try{const p={action:'updatepembayaran',idPembayaran:__f4.globals.document.getElementById('edit-id').value,idWarga:__f4.globals.document.getElementById('edit-warga').value,tanggal:__f4.globals.document.getElementById('edit-tanggal').value,metode:__f4.globals.document.getElementById('edit-metode').value,bulan:__f4.globals.document.getElementById('edit-bulan').value,tahun:__f4.globals.document.getElementById('edit-tahun').value,jumlahBulan:__f4.globals.document.getElementById('edit-jumlah').value,catatan:__f4.globals.document.getElementById('edit-catatan').value,t:__f4.globals.Date.now()};const r=await jsonp(APPS_SCRIPT_URL,p);if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memperbarui.');try{await jsonp(BATCH_SCRIPT_URL,{action:'sinkrontalanganpembayaran',idPembayaran:p.idPembayaran,t:__f4.globals.Date.now()})}catch(te){__f4.globals.console.warn('Sinkron talangan edit:',te)}editMsg('Perubahan berhasil disimpan.','success');await loadRiwayat(true);(0,__f4.globals.setTimeout)(()=>{tutupEdit();renderRiwayat()},500)}catch(e){editMsg(e.message||(0,__f4.globals.String)(e),'error')}finally{btn.disabled=false;btn.classList.remove('opacity-60')}
}
async function batalkanPembayaran(id){
  const x=DATA.riwayat.find(r=>r.idPembayaran===id);if(!x||!x.canCancel){riwayatMsg('Transaksi ini tidak dapat dibatalkan.','error');return}if(!(0,__f4.globals.confirm)(`Batalkan pembayaran ${x.nama} untuk ${(x.periode||[]).join(', ')}?\n\nData tidak dihapus permanen dan tetap tersimpan sebagai riwayat BATAL.`))return;try{riwayatMsg('Membatalkan transaksi...');const r=await jsonp(APPS_SCRIPT_URL,{action:'batalkanpembayaran',idPembayaran:id,alasan:'Dibatalkan dari web',t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membatalkan.');try{await jsonp(BATCH_SCRIPT_URL,{action:'batalkanpelunasantalangan',idPembayaran:id,alasan:'Pembayaran iuran dibatalkan',t:__f4.globals.Date.now()})}catch(te){__f4.globals.console.warn('Reverse talangan:',te)}await loadRiwayat(true);renderRiwayat();riwayatMsg(r.message||'Pembayaran dibatalkan.','success')}catch(e){riwayatMsg(e.message||(0,__f4.globals.String)(e),'error')}
}

async function hapusPembayaran(id){
  const x=DATA.riwayat.find(r=>r.idPembayaran===id);
  if(!x){riwayatMsg('Transaksi tidak ditemukan.','error');return}
  if(x.locked){riwayatMsg('Transaksi sudah masuk pembukuan kas dan tidak boleh dihapus. Batalkan batch terlebih dahulu.','error');return}
  const periode=(x.periode||[]).join(', ');
  if(!(0,__f4.globals.confirm)(`Hapus permanen pembayaran ${x.nama}${periode?` untuk ${periode}`:''}?\n\nData di PEMBAYARAN dan ALOKASI_IURAN akan dihapus. Tindakan ini tidak bisa dibatalkan.`))return;
  try{
    riwayatMsg('Menghapus permanen transaksi...');
    const r=await jsonp(DELETE_SCRIPT_URL,{action:'hapuspembayaran',idPembayaran:id,t:__f4.globals.Date.now()});
    if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal menghapus transaksi.');
    try{await jsonp(BATCH_SCRIPT_URL,{action:'batalkanpelunasantalangan',idPembayaran:id,alasan:'Pembayaran iuran dihapus permanen',t:__f4.globals.Date.now()})}catch(te){__f4.globals.console.warn('Reverse talangan hapus:',te)}
    await loadRiwayat(true);
    
    renderRiwayat();
    riwayatMsg(r.message||'Pembayaran berhasil dihapus permanen.','success');
  }catch(e){riwayatMsg(e.message||(0,__f4.globals.String)(e),'error')}
}



let KAS_DATA={belum:[],sudah:[],batches:[],ringkasan:{}};
let KAS_LOADED=false;
function f4ChangeKasSource(){
 KAS_LOADED=false;
 const type=__f4.globals.document.getElementById('kas-jenis-sumber')?.value||'kas_lorong';
 const text=__f4.globals.document.getElementById('kas-source-hint');
 if(text)text.textContent=type==='denda_gorol'
  ?'Denda yang siap dibukukan.'
  :'Kas Lorong yang siap dibukukan.';
 const title=__f4.globals.document.querySelector('#tab-kas .kas-batch-card .font-black');
 if(title)title.textContent=type==='denda_gorol'?'Buat Batch Denda Gorol':'Buat Batch Kas Lorong';
 const ket=__f4.globals.document.getElementById('kas-keterangan');if(ket){ket.dataset.edited='';ket.value=''}
 loadPembukuanKas();
}
function f4KasCategory(){return __f4.globals.document.getElementById('kas-jenis-sumber')?.value||'kas_lorong'}
function initKasUi(){
  const now=new __f4.globals.Date();
  const opts=BULAN.slice(1).map((b,i)=>`<option value="${i+1}">${b}</option>`).join('');
  const a=__f4.globals.document.getElementById('kas-bulan-iuran'),b=__f4.globals.document.getElementById('kas-bulan-buku');
  if(a){a.innerHTML=opts;a.value=now.getMonth()+1}
  if(b){b.innerHTML=opts;b.value=now.getMonth()+1}
  const y=__f4.globals.document.getElementById('kas-tahun-iuran'),yb=__f4.globals.document.getElementById('kas-tahun-buku'),d=__f4.globals.document.getElementById('kas-tanggal-buku');
  if(y)y.value=now.getFullYear();if(yb)yb.value=now.getFullYear();if(d)d.value=now.toISOString().slice(0,10);
  const ket=__f4.globals.document.getElementById('kas-keterangan');if(ket)ket.addEventListener('input',()=>ket.dataset.edited='1');
}
function kasMsg(t,type='info'){
  const e=__f4.globals.document.getElementById('kas-status');if(!e)return;if(type==='info'&&/^Memuat /i.test(t)){__f4.globals.F4Loading.begin(e,t);return}if(type==='error'&&e.dataset.f4State==='loading')__f4.globals.F4Loading.error(e,t);e.dataset.f4State='notice';e.className='mb-4 rounded-xl border px-4 py-3 text-sm';
  if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');else if(type==='success')e.classList.add('bg-violet-50','border-violet-200','text-violet-700');else e.classList.add('bg-slate-50','border-slate-200','text-slate-600');e.textContent=t;e.hidden=false;e.classList.remove('hidden');
}
async function loadPembukuanKas(){
  try{
    kasMsg('Memuat Pembukuan Kas...');
    const bulan=__f4.globals.document.getElementById('kas-bulan-iuran').value,tahun=__f4.globals.document.getElementById('kas-tahun-iuran').value;
    const r=await jsonp(BATCH_SCRIPT_URL,{action:'datapembukuankas',category:f4KasCategory(),bulan,tahun,t:__f4.globals.Date.now()});
    if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memuat Pembukuan Kas.');
    KAS_DATA=r.data||{belum:[],sudah:[],batches:[],ringkasan:{}};KAS_LOADED=true;renderPembukuanKas();
    __f4.globals.F4Loading.success('kas-status');
  }catch(e){kasMsg(e.message||(0,__f4.globals.String)(e),'error')}
}
function renderPembukuanKas(){
  const r=KAS_DATA.ringkasan||{};
  __f4.globals.document.getElementById('kas-count-belum').textContent=r.qtyBelum||0;__f4.globals.document.getElementById('kas-nominal-belum').textContent=rupiah(r.nominalBelum||0);__f4.globals.document.getElementById('kas-count-sudah').textContent=r.qtySudah||0;__f4.globals.document.getElementById('kas-nominal-sudah').textContent=rupiah(r.nominalSudah||0);
  __f4.globals.document.getElementById('kas-tbody-belum').innerHTML=(KAS_DATA.belum||[]).map(x=>`<tr class="hover:bg-violet-50/30"><td class="p-3 text-center"><input type="checkbox" class="kas-check w-4 h-4 accent-violet-600" value="${x.idAlokasi}" data-nominal="${(0,__f4.globals.Number)(x.nominalKasLorong)||0}"  onchange="updateKasTerpilih()"></td><td class="p-3"><div class="font-bold">${esc(x.nama||'-')}</div><div class="text-xs text-slate-400">${esc(x.blok||'')}/${esc(x.noRumah||'')}</div></td><td class="p-3">${histDate(x.tanggalBayar)}<small class="block text-slate-500">${esc(x.metode||'-')}</small></td><td class="p-3 text-right font-black">${rupiah(x.nominalKasLorong||0)}<small class="block font-normal text-slate-500">${x.qtyKasLorong||0}x</small></td></tr>`).join('')||'<tr><td colspan="4" class="p-6 text-center text-slate-400">Tidak ada transaksi yang belum dibukukan.</td></tr>';
  __f4.globals.document.getElementById('kas-tbody-batch').innerHTML=newestFirst(KAS_DATA.batches,'tanggalPembukuan').map(x=>`<tr class="hover:bg-violet-50/30"><td class="p-3">${histDate(x.tanggalPembukuan)}</td><td class="p-3"><div class="font-bold">${f4KasCategory()==='denda_gorol'?'Denda Gorol':'Kas Lorong'}</div>${f4SystemIdDetails(x.idBatch)}</td><td class="p-3">${esc(f4BatchReadableNote(x.keterangan||'-',f4KasCategory(),x.jumlahPembayaran,x.tanggalPembukuan))} ${x.status==='dibatalkan'?'• Dibatalkan':''}</td><td class="p-3 text-center">${x.jumlahPembayaran||0}</td><td class="p-3 text-right font-black">${rupiah(x.nominal||0)}</td><td class="p-3 text-right">${x.status==='dibatalkan'?'-':`<div class="action-icons">${actionIcon('circle-x','Batal',`batalkanBatchKas('${x.idBatch}')`,'red')}</div>`}</td></tr>`).join('')||'<tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada batch pada periode ini.</td></tr>';
  refreshHistoryIcons();
  updateKasTerpilih();
}
function pilihSemuaKas(){const a=[...__f4.globals.document.querySelectorAll('.kas-check:not(:disabled)')],all=a.length&&a.every(x=>x.checked);a.forEach(x=>x.checked=!all);updateKasTerpilih()}
function updateKasTerpilih(){
 const selected=[...__f4.globals.document.querySelectorAll('.kas-check:checked')];
 __f4.globals.document.getElementById('kas-terpilih-count').textContent=selected.length;
 __f4.globals.document.getElementById('kas-terpilih-total').textContent=rupiah(selected.reduce((s,x)=>s+((0,__f4.globals.Number)(x.dataset.nominal)||0),0));
 const input=__f4.globals.document.getElementById('kas-keterangan');
 if(input&&!input.dataset.edited){
  const month=__f4.globals.document.getElementById('kas-bulan-iuran'),name=month.options[month.selectedIndex]?.text||'';
  const fine=f4KasCategory()==='denda_gorol';
  const stage=__f4.globals.document.getElementById('kas-tahap-buku')?.value||'susulan';
  const label={setoran_rt:'Setoran RT',arisan:'Arisan',susulan:'Susulan'}[stage]||'Susulan';
  const year=__f4.globals.document.getElementById('kas-tahun-iuran')?.value||'';
  const unit=selected.length===1?'warga':'warga';
  input.value=selected.length?(fine
    ?`Denda Gorol ${name} ${year} • ${selected.length} ${unit}`
    :`Kas ${name} ${year} • ${label} • ${selected.length} ${unit}`):'';
 }
}
async function buatBatchKas(){
  const ids=[...__f4.globals.document.querySelectorAll('.kas-check:checked')].map(x=>x.value);if(!ids.length){kasMsg('Pilih minimal satu transaksi Kas Lorong.','error');return}
  const btn=__f4.globals.document.getElementById('kas-btn-buat');btn.disabled=true;btn.classList.add('opacity-60');
  try{kasMsg('Membuat batch...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'buatbatchkas',category:f4KasCategory(),stage:__f4.globals.document.getElementById('kas-tahap-buku').value,
  bulanSumber:__f4.globals.document.getElementById('kas-bulan-iuran').value,tahunSumber:__f4.globals.document.getElementById('kas-tahun-iuran').value,idAlokasi:ids.join(','),tanggalPembukuan:__f4.globals.document.getElementById('kas-tanggal-buku').value,bulanPembukuan:__f4.globals.document.getElementById('kas-bulan-buku').value,tahunPembukuan:__f4.globals.document.getElementById('kas-tahun-buku').value,keterangan:__f4.globals.document.getElementById('kas-keterangan').value,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membuat batch.');kasMsg(`Batch berhasil dibukukan: ${rupiah(r.nominal||0)}. Rincian warga tetap tersimpan.`,'success');__f4.globals.document.getElementById('kas-keterangan').dataset.edited='';await loadPembukuanKas();await loadRiwayat(true)}catch(e){kasMsg(e.message||(0,__f4.globals.String)(e),'error')}finally{btn.disabled=false;btn.classList.remove('opacity-60')}
}
async function batalkanBatchKas(id){if(!(0,__f4.globals.confirm)(`Batalkan batch ${id}?\n\nTransaksi akan kembali ke status BELUM.`))return;try{kasMsg('Membatalkan batch...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'batalkanbatchkas',idBatch:id,alasan:'Batch dibatalkan pengurus lewat portal',t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membatalkan batch.');kasMsg(r.message||'Batch dibatalkan.','success');await loadPembukuanKas();await loadRiwayat(true)}catch(e){kasMsg(e.message||(0,__f4.globals.String)(e),'error')}}



const KATEGORI_PEMASUKAN=['Donasi','Dana Kebersihan RT','Lainnya'];
const KATEGORI_PENGELUARAN=['Operasional','Kebersihan','Konsumsi','Kegiatan','Perbaikan / Fasilitas','Lainnya'];

function initTransaksiKasUi(){
  const now=new __f4.globals.Date();
  const t=__f4.globals.document.getElementById('trx-tanggal');if(t)t.value=now.toISOString().slice(0,10);
  const b=__f4.globals.document.getElementById('trx-bulan');if(b){b.innerHTML=BULAN.slice(1).map((x,i)=>`<option value="${i+1}">${x}</option>`).join('');b.value=now.getMonth()+1}
  const y=__f4.globals.document.getElementById('trx-tahun');if(y)y.value=now.getFullYear();
  setJenisKas('Pemasukan');
}

function setJenisKas(jenis){
  __f4.globals.document.getElementById('trx-jenis').value=jenis;
  const masuk=__f4.globals.document.getElementById('btn-jenis-pemasukan'),keluar=__f4.globals.document.getElementById('btn-jenis-pengeluaran');
  const aktif=['bg-violet-600','text-white','border-violet-200'];
  const non=['bg-white','text-slate-600','border-violet-100'];
  [masuk,keluar].forEach(x=>{if(!x)return;x.classList.remove(...aktif,...non,'active')});
  if(jenis==='Pemasukan'){masuk.classList.add(...aktif,'active');keluar.classList.add(...non)}else{keluar.classList.add(...aktif,'active');masuk.classList.add(...non)}
  const opts=jenis==='Pemasukan'?KATEGORI_PEMASUKAN:KATEGORI_PENGELUARAN;
  __f4.globals.document.getElementById('trx-kategori').innerHTML=opts.map(x=>`<option value="${x}">${x}</option>`).join('');

  // Metode disesuaikan dengan arah arus kas:
  // pemasukan boleh Cash / QRIS / Transfer Mandiri,
  // pengeluaran selalu berasal dari Kas Warga (Cash).
  const metode=__f4.globals.document.getElementById('trx-metode');
  if(metode){
    if(jenis==='Pemasukan'){
      metode.innerHTML='<option>Cash</option><option>QRIS</option><option>Transfer Mandiri</option>';
      metode.disabled=false;
      metode.classList.remove('bg-slate-50','text-slate-500');
    }else{
      metode.innerHTML='<option value="Cash">Cash (Kas Warga)</option>';
      metode.value='Cash';
      metode.disabled=true;
      metode.classList.add('bg-slate-50','text-slate-500');
    }
  }
}

function trxMsg(t,type='info'){
  const e=__f4.globals.document.getElementById('trx-status');if(!e)return;
  e.className='trx-status rounded-xl border px-4 py-3 text-sm';
  if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');
  else if(type==='success')e.classList.add('bg-violet-50','border-violet-200','text-violet-700');
  else e.classList.add('bg-slate-50','border-slate-200','text-slate-600');
  e.textContent=t;
}

function formatNominalInput(el){
  const angka=(0,__f4.globals.String)(el.value||'').replace(/\D/g,'');
  el.value=angka?(0,__f4.globals.Number)(angka).toLocaleString('id-ID'):'';
}
function nominalAngka(id){return (0,__f4.globals.String)(__f4.globals.document.getElementById(id)?.value||'').replace(/\D/g,'')}

async function simpanTransaksiKas(ev){
  ev.preventDefault();
  const btn=__f4.globals.document.getElementById('btn-trx-simpan');btn.disabled=true;btn.classList.add('opacity-60');
  try{
    trxMsg('Menyimpan transaksi...');
    const bulan=(0,__f4.globals.Number)(__f4.globals.document.getElementById('trx-bulan').value),tahun=(0,__f4.globals.Number)(__f4.globals.document.getElementById('trx-tahun').value);
    const r=await jsonp(BATCH_SCRIPT_URL,{action:'inputtransaksikas',tanggal:__f4.globals.document.getElementById('trx-tanggal').value,jenis:__f4.globals.document.getElementById('trx-jenis').value,kategori:__f4.globals.document.getElementById('trx-kategori').value,keterangan:__f4.globals.document.getElementById('trx-keterangan').value,nominal:nominalAngka('trx-nominal'),metode:__f4.globals.document.getElementById('trx-metode').value,periode:`${BULAN[bulan]} ${tahun}`,catatan:__f4.globals.document.getElementById('trx-catatan').value,t:__f4.globals.Date.now()});
    if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal menyimpan transaksi.');
    trxMsg('Transaksi berhasil disimpan. Rinciannya tersedia di Riwayat.','success');
    __f4.globals.document.getElementById('trx-keterangan').value='';__f4.globals.document.getElementById('trx-nominal').value='';__f4.globals.document.getElementById('trx-catatan').value='';
    await loadRiwayatKas(true);
  }catch(e){trxMsg(e.message||(0,__f4.globals.String)(e),'error')}finally{btn.disabled=false;btn.classList.remove('opacity-60')}
}

function histKasMsg(t,type='info'){
  const e=__f4.globals.document.getElementById('hist-kas-status');if(!e)return;if(type==='info'&&/^Memuat /i.test(t)){__f4.globals.F4Loading.begin(e,t);return}if(type==='error'&&e.dataset.f4State==='loading')__f4.globals.F4Loading.error(e,t);e.dataset.f4State='notice';e.className='mb-3 rounded-xl border px-4 py-3 text-sm';
  if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');else if(type==='success')e.classList.add('bg-violet-50','border-violet-200','text-violet-700');else e.classList.add('bg-slate-50','border-slate-200','text-slate-600');e.textContent=t;e.hidden=false;e.classList.remove('hidden');
}

async function loadRiwayatKas(silent=false){
  try{
    if(!silent)histKasMsg('Memuat riwayat kas...');
    const period=__f4.window.UPR?.params?.('history-kas')||{};
    const r=await jsonp(BATCH_SCRIPT_URL,{action:'datatransaksikas',status:'SEMUA',...period,allPeriods:!!__f4.window.f4KasAllPeriods,t:__f4.globals.Date.now()});
    if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memuat riwayat kas.');
    const rawKas = r.data;
    RIWAYAT_KAS = __f4.globals.Array.isArray(rawKas)
      ? rawKas
      : (__f4.globals.Array.isArray(rawKas?.rows)
          ? rawKas.rows
          : (__f4.globals.Array.isArray(rawKas?.data)
              ? rawKas.data
              : (__f4.globals.Array.isArray(r.rows)
                  ? r.rows
                  : (__f4.globals.Array.isArray(r.transaksi) ? r.transaksi : []))));
    renderRiwayatKas();
    if(RIWAYAT_KAS.length>=500)histKasMsg('Batas 500 transaksi pada periode ini tercapai. Pilih rentang tanggal yang lebih pendek agar seluruh data terbaca.','error');
    else if(!silent)__f4.globals.F4Loading.success('hist-kas-status')
  }catch(e){histKasMsg(e.message||(0,__f4.globals.String)(e),'error')}
}

function f4BatchReadableNote(raw,kind='',count=0,date=''){
  const note=(0,__f4.globals.String)(raw||'').trim();
  const isFine=kind==='denda_gorol'||/^Denda Gorol\b/i.test(note);
  const month=(0,__f4.globals.String)(note.match(/^Denda Gorol\s+([A-Za-z]+)(?:\s+(20\d{2}))?/i)?.[1]||'');
  const num=(0,__f4.globals.Number)(count)||(0,__f4.globals.Number)([...note.matchAll(/\b(\d+)\s*(?:pembayaran|warga|orang)\b/gi)].at(-1)?.[1]||0);
  const year=(0,__f4.globals.String)(note.match(/^Denda Gorol\s+[A-Za-z]+\s+(20\d{2})/i)?.[1]||(0,__f4.globals.String)(date||'').slice(0,4));
  if(isFine&&month&&num>0&&/\b\d+\s*(?:pembayaran|warga|orang)\b/i.test(note))
    return 'Denda Gorol '+month+(year?' '+year:'')+' • '+num+' warga';
  return note.replace(/(\s*•\s*\d+\s+pembayaran)\1\s*$/i,'$1');
}
function f4CashHumanTitle(x,forReport=false){
  const original=f4BatchReadableNote(x?.keterangan||'','',0,x?.tanggal||'').trim();
  const scrub=original
    .replace(/\b(?:payment|pembayaran|transaksi|transaction|source|reference|referensi|ref|id)\s*:\s*[a-z0-9_:-]{4,}\b/gi,'')
    .replace(/\b(?:PAY\d{3,}|pay-[a-f0-9-]{20,}|cash:[a-z0-9_-]{5,})\b/gi,'')
    .replace(/^[\s•,:;\-]+|[\s•,:;\-]+$/g,'').trim();
  if(scrub)return scrub;
  const category=(0,__f4.globals.String)(x?.kategori||'').trim();
  const resident=(0,__f4.globals.String)(x?.namaWarga||'').trim();
  if(category&&!/^(?:pay(?:ment)?|cash|trx|transaction)[:_-][a-z0-9_-]+$/i.test(category))
    return resident?category+' • '+(forReport?f4NamaCetak({...x,nama:resident}):resident):category;
  const type=(0,__f4.globals.String)(x?.jenis||'').toLowerCase();
  if(type.includes('iuran'))return 'Penerimaan Iuran Kas Lorong';
  if(type.includes('pinjaman'))return 'Transaksi Pinjaman Warga';
  if(type.includes('denda'))return 'Pembayaran Denda';
  if(type.includes('talangan'))return 'Pelunasan Talangan';
  return (0,__f4.globals.Number)(x?.debit)>0?'Penerimaan Kas':'Pengeluaran Kas';
}

/* Resi JPG untuk transaksi aktif yang sudah dimuat dari D1. Tidak memposting pembayaran. */
function f4ResiAction(kind,id){
 const safe=(0,__f4.globals.encodeURIComponent)((0,__f4.globals.String)(id||'')).replace(/'/g,'%27');
 return actionIcon('receipt-text','Resi JPG',
  "f4CetakResiLain('"+kind+"',decodeURIComponent('"+safe+"'))",'violet');
}
function f4CetakResiLain(kind,id){
 const open=__f4.window.F4TransactionReceipt?.open;
 if(!open){riwayatMsg('Fitur resi belum dimuat. Muat ulang portal.','error');return;}
 const name=x=>typeof f4NamaCetak==='function'?f4NamaCetak(x):(0,__f4.globals.String)(x?.nama||'-');
 const home=x=>[x.blok,x.noRumah].filter(__f4.globals.Boolean).join('/')||'-';
 const valid=x=>x&&!/batal|cancelled|canceled/i.test((0,__f4.globals.String)(x.status||'AKTIF'));
 let r=null;
 if(kind==='denda'){
  const x=(DATA_DENDA.rows||[]).find(v=>(0,__f4.globals.String)(v.idDenda)===(0,__f4.globals.String)(id));
  if(x&&x.status==='LUNAS'&&(0,__f4.globals.Number)(x.nominal)>0&&x.tanggalBayar)
   r={id:x.idTransaksiKas||x.idDenda,scope:'book',title:'Bukti Pembayaran Denda',
    party:name(x),house:home(x),date:histDate(x.tanggalBayar),method:x.metode||'-',
    amount:(0,__f4.globals.Number)(x.nominal),amountLabel:'Denda Dibayar',status:'LUNAS',
    details:[['ID denda',x.idDenda],['Kegiatan',x.namaKegiatan||'Denda Gorol']],
    note:'Pembayaran denda yang tercatat lunas dalam Pembukuan.'};
 }else if(kind==='pinjaman'){
  const x=(DATA_PINJAMAN.rows||[]).find(v=>(0,__f4.globals.String)(v.idPinjaman)===(0,__f4.globals.String)(id));
  if(valid(x)&&(0,__f4.globals.Number)(x.nominalPinjaman)>0)
   r={id:x.idPinjaman,scope:'book',title:'Bukti Pencatatan Pinjaman',
    party:name(x),house:home(x),date:histDate(x.tanggalPinjaman),
    method:x.metode||'Pembukuan',amount:(0,__f4.globals.Number)(x.nominalPinjaman),
    amountLabel:'Pokok Pinjaman',status:'TERCATAT',
    details:[['Sisa pinjaman',rupiah(x.sisaPinjaman||0)]],
    note:'Pencatatan pinjaman; bukan bukti bahwa pinjaman telah lunas.'};
 }else if(kind==='bayar-pinjaman'){
  let parent=null,payment=null;
  for(const x of DATA_PINJAMAN.rows||[]){
   const b=(x.pembayaran||[]).find(v=>(0,__f4.globals.String)(v.idPembayaranPinjaman)===(0,__f4.globals.String)(id));
   if(b){parent=x;payment=b;break;}
  }
  if(parent&&payment&&valid(payment)&&(0,__f4.globals.Number)(payment.nominalBayar)>0)
   r={id:payment.idPembayaranPinjaman,scope:'book',title:'Bukti Angsuran Pinjaman',
    party:name(parent),house:home(parent),date:histDate(payment.tanggalBayar),
    method:payment.metode||'-',amount:(0,__f4.globals.Number)(payment.nominalBayar),
    amountLabel:'Angsuran Diterima',status:'TERBAYAR',
    details:[['ID pinjaman',parent.idPinjaman]],
    note:'Bukti angsuran yang diterima; bukan tanda pelunasan seluruh pinjaman.'};
 }else if(kind==='talangan'||kind==='pelunasan-talangan'){
  const x=(DATA_TALANGAN.rows||[]).find(v=>(0,__f4.globals.String)(v.idTalangan)===(0,__f4.globals.String)(id));
  if(valid(x)&&(0,__f4.globals.Number)(x.nominalTalangan)>0){
   const paid=kind==='pelunasan-talangan';
   if(!paid||(x.status==='LUNAS'&&x.idPembayaranPelunasan&&(0,__f4.globals.Number)(x.nominalDiganti)>0))
    r={id:paid?x.idPembayaranPelunasan:x.idTalangan,scope:'book',
     title:paid?'Bukti Penggantian Talangan':'Bukti Pencatatan Talangan',
     party:name(x),house:home(x),
     date:histDate(paid?(x.tanggalLunas||x.tanggalTalangan):x.tanggalTalangan),
     method:paid?'Pembukuan':'Talangan Kas Lorong',
     amount:(0,__f4.globals.Number)(paid?x.nominalDiganti:x.nominalTalangan),
     amountLabel:paid?'Talangan Diganti':'Nilai Talangan',
     status:paid?'LUNAS':'TERCATAT',details:[['ID talangan',x.idTalangan],['Periode',x.bulan+' '+x.tahun]],
     note:paid?'Bukti penggantian talangan.':'Bukti talangan, bukan pembayaran warga.'};
  }
 }else if(kind==='kas'){
  const x=(RIWAYAT_KAS||[]).find(v=>(0,__f4.globals.String)(v.idTransaksi)===(0,__f4.globals.String)(id));
  if(valid(x)&&((0,__f4.globals.Number)(x.debit)>0||(0,__f4.globals.Number)(x.kredit)>0)){
   const masuk=(0,__f4.globals.Number)(x.debit)>0;
   r={id:x.idTransaksi,scope:'book',title:masuk?'Bukti Penerimaan Kas':'Bukti Pengeluaran Kas',
    party:x.namaWarga?name({nama:x.namaWarga}):'Kas Flamboyan 4',house:x.rumah||'-',
    date:histDate(x.tanggal),method:x.metode||'-',
    amount:(0,__f4.globals.Number)(masuk?x.debit:x.kredit),amountLabel:masuk?'Dana Masuk':'Dana Keluar',
    status:'TERCATAT',details:[['Pos dana',x.kategori||'-'],['Keterangan',f4CashHumanTitle(x)]],
    note:'Bukti jurnal kas aktif, bukan pelunasan otomatis untuk tagihan lain.'};
  }
 }
 if(!r){riwayatMsg('Resi tidak tersedia untuk transaksi batal, belum dibayar, atau data belum lengkap.','error');return;}
 open(r).catch(e=>riwayatMsg('Gagal membuat resi: '+(e.message||e),'error'));
}

function f4SystemIdDetails(id,source=''){
  if(!id&&!source)return '';
  return `<details class="f4-trans-ref no-print"><summary>Detail pencatatan</summary>${id?`<div>ID: ${esc(id)}</div>`:''}${source?`<div>Sumber: ${esc(source)}</div>`:''}</details>`;
}
__f4.window.f4KasAllPeriods=false;
__f4.window.f4SyncKasPeriod=function(){
  const all=!!__f4.window.f4KasAllPeriods;
  const b=__f4.globals.document.getElementById('history-kas-all');
  if(b){b.textContent=all?'Pilih periode':'Semua tanggal';b.setAttribute('aria-pressed',(0,__f4.globals.String)(all));b.classList.toggle('is-all',all)}
  const label=__f4.globals.document.getElementById('history-kas-period-info');
  if(label)label.textContent=all?'Menampilkan semua tanggal yang tersedia':'Dari – sampai, berdasarkan tanggal transaksi';
  __f4.globals.document.querySelector('#history-kas-period')?.classList.toggle('is-all',all);
};
__f4.window.f4ToggleKasAllPeriod=function(){
  __f4.window.f4KasAllPeriods=!__f4.window.f4KasAllPeriods;
  __f4.window.f4SyncKasPeriod();
  loadRiwayatKas(true);
};
function renderRiwayatKas(){
  const q=(__f4.globals.document.getElementById('cari-trx-kas')?.value||'').toLowerCase();const f=__f4.globals.document.getElementById('filter-trx-kas')?.value||'AKTIF';
  const sumberKas = __f4.globals.Array.isArray(RIWAYAT_KAS) ? RIWAYAT_KAS : [];
  const period=!__f4.window.f4KasAllPeriods&&__f4.window.UPR?.range?.('history-kas');
  const rows=sumberKas.filter(x=>{
    if(f!=='SEMUA'&&(x.status||'AKTIF')!==f)return false;
    if(period){const date=historyDateTs(x.tanggal);if(!date||date<period.start||date>period.end)return false}
    return [x.jenis,x.kategori,x.keterangan,x.metode,x.periode,x.idTransaksi].join(' ').toLowerCase().includes(q)
  }).sort((a,b)=>historyDateTs(b.tanggal)-historyDateTs(a.tanggal));
  const label=__f4.globals.document.getElementById('history-kas-period-info');
  if(label)label.textContent=rows.length+' transaksi';
  __f4.globals.document.getElementById('tbody-riwayat-kas').innerHTML=rows.map(x=>{
    const batal=x.status==='BATAL',debit=x.debit?rupiah(x.debit):'-',kredit=x.kredit?rupiah(x.kredit):'-';
    let aksi='-';
    if(!batal&&x.sumber==='INPUT_WEB'){
      aksi=`<div class="action-icons">${actionIcon('pencil','Edit',`bukaEditKas('${x.idTransaksi}')`,'violet')}${actionIcon('circle-x','Batal',`batalkanTransaksiKas('${x.idTransaksi}')`,'red')}</div>`;
    }else if(!batal&&x.sumber==='BATCH_KAS') aksi='<span class="text-xs text-slate-400">Kelola via Batch</span>';
    else if(!batal) aksi='<span class="text-xs text-slate-400">Edit via modul asal</span>';
    if(!batal&&((0,__f4.globals.Number)(x.debit)>0||(0,__f4.globals.Number)(x.kredit)>0)){
      const receipt=f4ResiAction('kas',x.idTransaksi);
      aksi=aksi.includes('class="action-icons"')?aksi.replace('</div>',receipt+'</div>'):`<div class="action-icons">${receipt}</div>`;
    }
    return `<tr class="${batal?'opacity-55':''} hover:bg-violet-50/30"><td class="p-3 whitespace-nowrap">${histDate(x.tanggal)}</td><td class="p-3">${x.kategori||'-'}</td><td class="p-3"><div class="font-bold f4-visible-title">${esc(f4CashHumanTitle(x))}</div>${f4SystemIdDetails(x.idTransaksi,x.sumber)}</td><td class="p-3 text-right font-black text-emerald-700">${debit}</td><td class="p-3 text-right font-black text-red-600">${kredit}</td><td class="p-3">${x.metode||'-'}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-bold ${batal?'bg-slate-100 text-slate-500':'bg-violet-100 text-violet-700'}">${x.status||'AKTIF'}</span></td><td class="p-3 text-center">${aksi}</td></tr>`
  }).join('')||'<tr><td colspan="8" class="p-6 text-center text-slate-400">Belum ada transaksi kas.</td></tr>';
  refreshHistoryIcons();
}

async function batalkanTransaksiKas(id){
  if(!(0,__f4.globals.confirm)(`Batalkan transaksi ${id}?`))return;
  try{histKasMsg('Membatalkan transaksi...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'batalkantransaksikas',idTransaksi:id,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membatalkan.');await loadRiwayatKas(true);histKasMsg(r.message||'Transaksi dibatalkan.','success')}catch(e){histKasMsg(e.message||(0,__f4.globals.String)(e),'error')}
}


function loanMsg(id,t,type='info'){
  const e=__f4.globals.document.getElementById(id);if(!e)return;if(type==='info'&&/^Memuat /i.test(t)){__f4.globals.F4Loading.begin(e,t);return}if(type==='error'&&e.dataset.f4State==='loading')__f4.globals.F4Loading.error(e,t);e.dataset.f4State='notice';e.className='rounded-xl border px-4 py-3 text-sm';
  if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');
  else if(type==='success')e.classList.add('bg-violet-50','border-violet-200','text-violet-700');
  else e.classList.add('bg-slate-50','border-slate-200','text-slate-600');
  e.textContent=t;e.hidden=false;e.classList.remove('hidden');
}
function setLoanMode(mode){
  const formBuat=__f4.globals.document.getElementById('loan-form-buat'),formBayar=__f4.globals.document.getElementById('loan-form-bayar');
  formBuat?.classList.toggle('hidden',mode!=='buat');formBayar?.classList.toggle('hidden',mode!=='bayar');
  formBuat?.classList.toggle('mode-inactive',mode!=='buat');formBayar?.classList.toggle('mode-inactive',mode!=='bayar');
  __f4.globals.document.querySelectorAll('.loan-mode-btn').forEach(x=>{
    x.classList.remove('active','bg-violet-600','text-white','border-violet-200');
    x.classList.add('bg-white','text-slate-600','border-violet-100');
  });
  const aktif=__f4.globals.document.getElementById('loan-mode-'+mode);
  if(aktif){
    aktif.classList.remove('bg-white','text-slate-600','border-violet-100');
    aktif.classList.add('active','bg-violet-600','text-white','border-violet-200');
  }
  if(mode==='bayar')previewPinjaman();
}
function initPinjamanUi(){
  const now=new __f4.globals.Date().toISOString().slice(0,10);
  const t1=__f4.globals.document.getElementById('loan-tanggal'),t2=__f4.globals.document.getElementById('payloan-tanggal');if(t1&&!t1.value)t1.value=now;if(t2&&!t2.value)t2.value=now;
  const s=__f4.globals.document.getElementById('loan-warga');
  if(s){const cur=s.value;const aktif=(DATA.warga||[]).filter(w=>{const st=(w.statusAktif||'').toString().trim().toLowerCase();return !st || st==='ya' || st==='aktif'});s.innerHTML='<option value="">Pilih warga...</option>'+aktif.map(w=>`<option value="${w.idWarga}">${w.nama} • ${w.blok}/${w.noRumah}</option>`).join('');if(aktif.some(w=>w.idWarga===cur))s.value=cur}
  setLoanMode('buat');
}
async function loadPinjaman(silent=false){
  try{
    if(!silent)loanMsg('hist-loan-status','Memuat data pinjaman...');
    const r=await jsonp(BATCH_SCRIPT_URL,{action:'datapinjaman',t:__f4.globals.Date.now()});
    if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memuat pinjaman.');
    DATA_PINJAMAN=r.data||{rows:[],aktif:[],ringkasan:{}};
    renderPinjaman();isiPinjamanAktif();
    if(!silent)__f4.globals.F4Loading.success('hist-loan-status')
  }catch(e){loanMsg('hist-loan-status',e.message||(0,__f4.globals.String)(e),'error')}
}
function isiPinjamanAktif(){
  const s=__f4.globals.document.getElementById('payloan-id');if(!s)return;const cur=s.value;
  s.innerHTML='<option value="">Pilih pinjaman...</option>'+(DATA_PINJAMAN.aktif||[]).map(x=>`<option value="${x.idPinjaman}">${x.nama} • ${x.blok}/${x.noRumah} • Sisa ${rupiah(x.sisaPinjaman)}</option>`).join('');
  if((DATA_PINJAMAN.aktif||[]).some(x=>x.idPinjaman===cur))s.value=cur;previewPinjaman();__f4.window.refreshAllCustomSelects?.();
}
function previewPinjaman(){
  const id=__f4.globals.document.getElementById('payloan-id')?.value;const e=__f4.globals.document.getElementById('payloan-preview');if(!e)return;
  const x=(DATA_PINJAMAN.rows||[]).find(a=>a.idPinjaman===id);
  e.innerHTML=x?`<div class="font-black text-violet-950">${x.nama} • ${x.blok}/${x.noRumah}</div><div class="grid grid-cols-3 gap-2 mt-2"><div><span class="text-xs text-slate-400">Pinjaman</span><div class="font-bold">${rupiah(x.nominalPinjaman)}</div></div><div><span class="text-xs text-slate-400">Dibayar</span><div class="font-bold text-emerald-700">${rupiah(x.totalDibayar)}</div></div><div><span class="text-xs text-slate-400">Sisa</span><div class="font-black text-red-600">${rupiah(x.sisaPinjaman)}</div></div></div>`:'Pilih pinjaman untuk melihat sisa.';
}
async function simpanPinjaman(ev){
  ev.preventDefault();const btn=__f4.globals.document.getElementById('loan-btn-simpan');btn.disabled=true;btn.classList.add('opacity-60');
  try{
    loanMsg('loan-status','Menyimpan pinjaman...');
    const r=await jsonp(BATCH_SCRIPT_URL,{action:'buatpinjaman',idWarga:__f4.globals.document.getElementById('loan-warga').value,tanggal:__f4.globals.document.getElementById('loan-tanggal').value,nominal:nominalAngka('loan-nominal'),metode:__f4.globals.document.getElementById('loan-metode').value,keterangan:__f4.globals.document.getElementById('loan-keterangan').value,t:__f4.globals.Date.now()});
    if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membuat pinjaman.');
    loanMsg('loan-status',`${r.idPinjaman} berhasil dibuat • ${rupiah(r.nominal||0)}`,'success');__f4.globals.document.getElementById('loan-nominal').value='';__f4.globals.document.getElementById('loan-keterangan').value='';await loadPinjaman(true);await loadRiwayatKas(true);
  }catch(e){loanMsg('loan-status',e.message||(0,__f4.globals.String)(e),'error')}finally{btn.disabled=false;btn.classList.remove('opacity-60')}
}
async function simpanPembayaranPinjaman(ev){
  ev.preventDefault();const btn=__f4.globals.document.getElementById('payloan-btn-simpan');btn.disabled=true;btn.classList.add('opacity-60');
  try{
    loanMsg('payloan-status','Menyimpan pembayaran...');
    const r=await jsonp(BATCH_SCRIPT_URL,{action:'bayarpinjaman',idPinjaman:__f4.globals.document.getElementById('payloan-id').value,tanggal:__f4.globals.document.getElementById('payloan-tanggal').value,nominal:nominalAngka('payloan-nominal'),metode:__f4.globals.document.getElementById('payloan-metode').value,keterangan:__f4.globals.document.getElementById('payloan-keterangan').value,t:__f4.globals.Date.now()});
    if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal menyimpan pembayaran.');
    loanMsg('payloan-status',`${r.idPembayaranPinjaman} berhasil • Sisa ${rupiah(r.sisaPinjaman||0)}`,'success');__f4.globals.document.getElementById('payloan-nominal').value='';__f4.globals.document.getElementById('payloan-keterangan').value='';await loadPinjaman(true);await loadRiwayatKas(true);
  }catch(e){loanMsg('payloan-status',e.message||(0,__f4.globals.String)(e),'error')}finally{btn.disabled=false;btn.classList.remove('opacity-60')}
}
function renderPinjaman(){
  const r=DATA_PINJAMAN.ringkasan||{};
  const el=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};el('loan-sum-count',r.jumlahPinjamanAktif||0);el('loan-sum-total',rupiah(r.totalPinjamanAktif||0));el('loan-sum-paid',rupiah(r.totalTerbayarAktif||0));el('loan-sum-sisa',rupiah(r.totalSisa||0));
  const tb=__f4.globals.document.getElementById('tbody-riwayat-pinjaman');if(!tb)return;
  const pinRows=newestFirst(DATA_PINJAMAN.rows,'tanggalPinjaman');
  tb.innerHTML=pinRows.map(x=>{
    const batal=x.status==='BATAL',lunas=x.status==='LUNAS';const badge=batal?'bg-slate-100 text-slate-500':(lunas?'bg-emerald-100 text-emerald-700':'bg-violet-100 text-violet-700');let aksi='-';
    if(!batal&&!lunas){
      const acts=[f4ResiAction('pinjaman',x.idPinjaman),actionIcon('wallet-cards','Bayar',`pilihMenu('pinjaman');setTimeout(()=>{setLoanMode('bayar');document.getElementById('payloan-id').value='${x.idPinjaman}';previewPinjaman()},50)`,'emerald'),actionIcon('pencil','Edit',`bukaEditPinjaman('${x.idPinjaman}')`,'violet')];
      if((x.totalDibayar||0)===0)acts.push(actionIcon('circle-x','Batal',`batalkanPinjaman('${x.idPinjaman}')`,'red'));
      aksi=`<div class="action-icons">${acts.join('')}</div>`;
    }else if(batal){aksi=`<div class="action-icons">${actionIcon('rotate-ccw','Pulihkan',`pulihkanPinjaman('${x.idPinjaman}')`,'violet')}</div>`}else if(lunas){aksi=`<div class="action-icons">${f4ResiAction('pinjaman',x.idPinjaman)}${actionIcon('trash-2','Hapus',`hapusPinjamanPermanen('${x.idPinjaman}')`,'red')}</div>`}
    return `<tr class="${batal?'opacity-55':''}"><td class="p-3 whitespace-nowrap">${histDate(x.tanggalPinjaman)}</td><td class="p-3"><div class="font-bold whitespace-nowrap">${x.nama||'-'}</div><div class="text-xs text-slate-400 whitespace-nowrap">${x.blok||''}/${x.noRumah||''}</div>${f4SystemIdDetails(x.idPinjaman)}</td><td class="p-3 text-right font-black">${rupiah(x.nominalPinjaman||0)}</td><td class="p-3 text-right font-bold text-emerald-700">${rupiah(x.totalDibayar||0)}</td><td class="p-3 text-right font-black text-red-600">${rupiah(x.sisaPinjaman||0)}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-bold ${badge}">${x.status}</span></td><td class="p-3">${x.keterangan||'-'}</td><td class="p-3 text-right whitespace-nowrap">${aksi}</td></tr>`
  }).join('')||'<tr><td colspan="8" class="p-6 text-center text-slate-400">Belum ada data pinjaman.</td></tr>';
  const tbBayar=__f4.globals.document.getElementById('tbody-riwayat-bayar-pinjaman');
  if(tbBayar){
    const bayar=[];pinRows.forEach(x=>(x.pembayaran||[]).forEach(b=>bayar.push({...b,nama:x.nama,blok:x.blok,noRumah:x.noRumah,idPinjaman:x.idPinjaman})));
    bayar.sort((a,b)=>historyDateTs(b.tanggalBayar)-historyDateTs(a.tanggalBayar));
    tbBayar.innerHTML=bayar.map(b=>{const batal=(b.status||'').toUpperCase()==='BATAL';const act=batal?'-':`<div class="action-icons">${f4ResiAction('bayar-pinjaman',b.idPembayaranPinjaman)}${actionIcon('circle-x','Batal',`batalkanPembayaranPinjaman('${b.idPembayaranPinjaman}')`,'red')}</div>`;return `<tr class="${batal?'opacity-55':''}"><td class="p-3 whitespace-nowrap">${histDate(b.tanggalBayar)}</td><td class="p-3"><div class="font-bold whitespace-nowrap">${b.nama||'-'}</div><div class="text-xs text-slate-400 whitespace-nowrap">${b.blok||''}/${b.noRumah||''}</div></td><td class="p-3"><span class="font-bold">Pembayaran Pinjaman</span>${f4SystemIdDetails(b.idPembayaranPinjaman,b.idPinjaman?'Pinjaman '+b.idPinjaman:'')}</td><td class="p-3 text-right font-black text-emerald-700">${rupiah(b.nominalBayar||0)}</td><td class="p-3">${b.metode||'-'}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-bold ${batal?'bg-slate-100 text-slate-500':'bg-violet-100 text-violet-700'}">${b.status||'AKTIF'}</span></td><td class="p-3 text-right">${act}</td></tr>`}).join('')||'<tr><td colspan="7" class="p-6 text-center text-slate-400">Belum ada pembayaran pinjaman.</td></tr>';
  }
  refreshHistoryIcons();
}

async function batalkanPembayaranPinjaman(id){if(!(0,__f4.globals.confirm)(`Batalkan pembayaran pinjaman ${id}?`))return;try{loanMsg('hist-loan-status','Membatalkan pembayaran...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'batalkanpembayaranpinjaman',idPembayaranPinjaman:id,alasan:'Dibatalkan dari web',t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membatalkan pembayaran.');await loadPinjaman(true);await loadRiwayatKas(true);loanMsg('hist-loan-status',r.message||'Pembayaran dibatalkan.','success')}catch(e){loanMsg('hist-loan-status',e.message||(0,__f4.globals.String)(e),'error')}}

async function batalkanPinjaman(id){if(!(0,__f4.globals.confirm)(`Batalkan pinjaman ${id}?`))return;try{loanMsg('hist-loan-status','Membatalkan pinjaman...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'batalkanpinjaman',idPinjaman:id,alasan:'Dibatalkan dari web',t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membatalkan pinjaman.');await loadPinjaman(true);await loadRiwayatKas(true);loanMsg('hist-loan-status',r.message||'Pinjaman dibatalkan.','success')}catch(e){loanMsg('hist-loan-status',e.message||(0,__f4.globals.String)(e),'error')}}

async function pulihkanPinjaman(id){if(!(0,__f4.globals.confirm)(`Pulihkan pinjaman ${id} menjadi AKTIF lagi?\n\nPinjaman akan dapat dibayar kembali. Setelah LUNAS, tombol Hapus akan tersedia untuk membersihkan data uji.`))return;try{loanMsg('hist-loan-status','Memulihkan pinjaman...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'pulihkanpinjaman',idPinjaman:id,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memulihkan pinjaman.');await loadPinjaman(true);await loadRiwayatKas(true);loanMsg('hist-loan-status',r.message||'Pinjaman dipulihkan.','success')}catch(e){loanMsg('hist-loan-status',e.message||(0,__f4.globals.String)(e),'error')}}

let DATA_TALANGAN={rows:[],aktif:[],ringkasan:{}};
function talMsg(id,t,type='info'){const e=__f4.globals.document.getElementById(id);if(!e)return;if(type==='info'&&/^Memuat /i.test(t)){__f4.globals.F4Loading.begin(e,t);return}if(type==='error'&&e.dataset.f4State==='loading')__f4.globals.F4Loading.error(e,t);e.dataset.f4State='notice';e.className='rounded-xl border px-4 py-3 text-sm';if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');else if(type==='success')e.classList.add('bg-violet-50','border-violet-200','text-violet-700');else e.classList.add('bg-slate-50','border-slate-200','text-slate-600');e.textContent=t;e.hidden=false;e.classList.remove('hidden')}
function initTalanganUi(){const now=new __f4.globals.Date(),s=__f4.globals.document.getElementById('tal-warga');if(s){const cur=s.value;s.innerHTML='<option value="">Pilih warga...</option>'+DATA.warga.filter(w=>['ya','aktif'].includes((w.statusAktif||'').toLowerCase())).map(w=>`<option value="${w.idWarga}">${w.nama} • ${w.blok}/${w.noRumah}</option>`).join('');if(DATA.warga.some(w=>w.idWarga===cur))s.value=cur}const b=__f4.globals.document.getElementById('tal-bulan');if(b&&!b.options.length){b.innerHTML=BULAN.slice(1).map((x,i)=>`<option value="${i+1}">${x}</option>`).join('');b.value=now.getMonth()+1}if(__f4.globals.document.getElementById('tal-tahun')&&!__f4.globals.document.getElementById('tal-tahun').value)__f4.globals.document.getElementById('tal-tahun').value=now.getFullYear();if(__f4.globals.document.getElementById('tal-tanggal')&&!__f4.globals.document.getElementById('tal-tanggal').value)__f4.globals.document.getElementById('tal-tanggal').value=(0,__f4.globals.localDateInput)();previewTalangan()}
function previewTalangan(){const id=__f4.globals.document.getElementById('tal-warga')?.value,e=__f4.globals.document.getElementById('tal-preview');if(!e)return;const w=DATA.warga.find(x=>x.idWarga===id);if(!w){e.textContent='Pilih warga untuk melihat nominal.';return}const c=DATA.config||{},bul=((0,__f4.globals.Number)(w.qtyIuranBulanan)||0)*((0,__f4.globals.Number)(c.TARIF_BULANAN)||0),keb=((0,__f4.globals.Number)(w.qtyKebersihan)||0)*((0,__f4.globals.Number)(c.TARIF_KEBERSIHAN)||0),total=bul+keb;e.innerHTML=`<div class="grid grid-cols-2 sm:grid-cols-3 gap-3"><div class="bg-white rounded-xl p-3"><div class="text-[10px] font-bold text-slate-400">IURAN BULANAN</div><div class="font-black mt-1">${rupiah(bul)}</div></div><div class="bg-white rounded-xl p-3"><div class="text-[10px] font-bold text-slate-400">KEBERSIHAN</div><div class="font-black mt-1">${rupiah(keb)}</div><div class="text-[11px] text-violet-600">${((0,__f4.globals.Number)(w.qtyKebersihan)||0)>1?(w.qtyKebersihan+'x pembayaran'):''}</div></div><div class="bg-white rounded-xl p-3 col-span-2 sm:col-span-1"><div class="text-[10px] font-bold text-slate-400">TOTAL TALANGAN</div><div class="font-black text-xl text-violet-700 mt-1">${rupiah(total)}</div></div></div><div class="text-xs text-slate-500 mt-3 space-y-1"><div>Kas Lorong dan Arisan tidak termasuk talangan.</div><div class="font-semibold text-violet-700">Talangan belum langsung masuk pembukuan kas. Baru dibukukan bila belum diganti sampai 14 hari setelah tanggal setor RT.</div></div>`}
async function simpanTalangan(ev){ev.preventDefault();const btn=__f4.globals.document.getElementById('tal-btn-simpan');btn.disabled=true;btn.classList.add('opacity-60');try{talMsg('tal-status','Menyimpan talangan...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'buattalangan',idWarga:__f4.globals.document.getElementById('tal-warga').value,tanggal:__f4.globals.document.getElementById('tal-tanggal').value,bulan:__f4.globals.document.getElementById('tal-bulan').value,tahun:__f4.globals.document.getElementById('tal-tahun').value,keterangan:__f4.globals.document.getElementById('tal-keterangan').value,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal menyimpan talangan.');talMsg('tal-status',`${r.idTalangan} berhasil dibuat • ${rupiah(r.nominal||0)} • ditahan dari pembukuan sampai ${r.tanggalJatuhTempo?histDate(r.tanggalJatuhTempo):'batas 14 hari'}`,'success');__f4.globals.document.getElementById('tal-keterangan').value='';await loadTalangan(true);await loadRiwayatKas(true)}catch(e){talMsg('tal-status',e.message||(0,__f4.globals.String)(e),'error')}finally{btn.disabled=false;btn.classList.remove('opacity-60')}}
async function loadTalangan(silent=false){try{if(!silent)talMsg('hist-tal-status','Memuat data talangan...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'datatalangan',t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memuat talangan.');DATA_TALANGAN=r.data||{rows:[],aktif:[],ringkasan:{}};renderTalangan();if(!silent)__f4.globals.F4Loading.success('hist-tal-status')}catch(e){talMsg('hist-tal-status',e.message||(0,__f4.globals.String)(e),'error')}}
function renderTalangan(){
  const r=DATA_TALANGAN.ringkasan||{},set=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};
  set('tal-sum-count',r.jumlahAktif||0);set('tal-sum-total',rupiah(r.totalTalanganAktif||0));set('tal-sum-paid',rupiah(r.totalSudahDigantiAktif||0));set('tal-sum-sisa',rupiah(r.totalSisa||0));
  const tb=__f4.globals.document.getElementById('tbody-riwayat-talangan');if(!tb)return;
  const rows=newestFirst(DATA_TALANGAN.rows,'tanggalTalangan');
  tb.innerHTML=rows.map(x=>{
    const batal=x.status==='BATAL',lunas=x.status==='LUNAS';
    const badge=batal?'bg-slate-100 text-slate-500':(lunas?'bg-emerald-100 text-emerald-700':'bg-violet-100 text-violet-700');
    const buku=x.statusPembukuan==='DIBUKUKAN'?'<span class="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">DIBUKUKAN</span>':(lunas?'<span class="px-2 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">BELUM MASUK</span>':'<span class="px-2 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700">DITAHAN</span>');
    const talActions=[];if(!batal){talActions.push(f4ResiAction('talangan',x.idTalangan));if(lunas&&x.idPembayaranPelunasan)talActions.push(f4ResiAction('pelunasan-talangan',x.idTalangan));if(!lunas&&(x.nominalDiganti||0)===0)talActions.push(actionIcon('circle-x','Batal',`batalkanTalangan('${x.idTalangan}')`,'red'));}const aksi=talActions.length?`<div class="action-icons">${talActions.join('')}</div>`:'-';
    return `<tr class="${batal?'opacity-55':''}"><td class="p-3"><div class="font-bold">${x.bulan} ${x.tahun}</div><div class="text-xs text-slate-400">${histDate(x.tanggalTalangan)}</div>${f4SystemIdDetails(x.idTalangan)}<div class="text-[11px] text-violet-600 mt-1">Batas: ${histDate(x.tanggalJatuhTempo)}</div></td><td class="p-3"><div class="font-bold whitespace-nowrap">${x.nama||'-'}</div><div class="text-xs text-slate-400 whitespace-nowrap">${x.blok||''}/${x.noRumah||''}</div></td><td class="p-3 text-right font-black">${rupiah(x.nominalTalangan||0)}</td><td class="p-3 text-right font-bold text-emerald-700">${rupiah(x.nominalDiganti||0)}</td><td class="p-3 text-right font-black text-red-600">${rupiah(x.sisaTalangan||0)}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-bold ${badge}">${x.status}</span></td><td class="p-3 text-center">${buku}</td><td class="p-3">${x.idPembayaranPelunasan?'Pelunasan talangan':'Belum lunas'}${x.tanggalLunas?`<div class="text-xs text-slate-400">${histDate(x.tanggalLunas)}</div>`:''}${f4SystemIdDetails(x.idPembayaranPelunasan)}</td><td class="p-3 text-right">${aksi}</td></tr>`
  }).join('')||'<tr><td colspan="9" class="p-6 text-center text-slate-400">Belum ada data talangan.</td></tr>';
  refreshHistoryIcons();
}

async function batalkanTalangan(id){if(!(0,__f4.globals.confirm)(`Batalkan talangan ${id}?\n\nJika talangan sudah sempat masuk pembukuan karena melewati batas 14 hari, transaksi pengeluarannya juga akan ikut dibatalkan.`))return;try{talMsg('hist-tal-status','Membatalkan talangan...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'batalkantalangan',idTalangan:id,alasan:'Dibatalkan dari web',t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membatalkan talangan.');await loadTalangan(true);await loadRiwayatKas(true);talMsg('hist-tal-status',r.message||'Talangan dibatalkan.','success')}catch(e){talMsg('hist-tal-status',e.message||(0,__f4.globals.String)(e),'error')}}


let DATA_DENDA={rows:[],aktif:[],ringkasan:{}};
let DENDA_LOADED=false, DENDA_LOADING=null;
let REPORT_MODE='kas', REPORT_DATA_KAS=null, REPORT_DATA_RT=null, REPORT_DATA_ARISAN=null, REPORT_DATA_DENDA=null, REPORT_DATA_PINJAMAN=null, REPORT_DATA_TALANGAN=null, REPORT_DATA_TAHUNAN=null, REPORT_ARSIP_TAHUNAN=null;
function dendaMsg(id,t,type='info'){const e=__f4.globals.document.getElementById(id);if(!e)return;if(type==='info'&&/^Memuat /i.test(t)){__f4.globals.F4Loading.begin(e,t);return}if(type==='error'&&e.dataset.f4State==='loading')__f4.globals.F4Loading.error(e,t);e.dataset.f4State='notice';e.className='rounded-xl border px-4 py-3 text-sm';if(type==='error')e.classList.add('bg-red-50','border-red-200','text-red-700');else if(type==='success')e.classList.add('bg-emerald-50','border-emerald-200','text-emerald-700');else e.classList.add('bg-slate-50','border-slate-200','text-slate-600');e.textContent=t;e.hidden=false;e.classList.remove('hidden')}
function initDendaUi(){
  const s=__f4.globals.document.getElementById('denda-warga');if(s){const cur=s.value;s.innerHTML='<option value="">Pilih warga...</option>'+DATA.warga.filter(w=>['ya','aktif'].includes((w.statusAktif||'').toLowerCase())).map(w=>`<option value="${w.idWarga}">${w.nama} • ${w.blok}/${w.noRumah}</option>`).join('');if(DATA.warga.some(w=>w.idWarga===cur))s.value=cur}
  const now=(0,__f4.globals.localDateInput)();if(__f4.globals.document.getElementById('denda-tanggal')&&!__f4.globals.document.getElementById('denda-tanggal').value)__f4.globals.document.getElementById('denda-tanggal').value=now;if(__f4.globals.document.getElementById('bayar-denda-tanggal')&&!__f4.globals.document.getElementById('bayar-denda-tanggal').value)__f4.globals.document.getElementById('bayar-denda-tanggal').value=now;
}
function setModeDenda(mode){
  const catat=__f4.globals.document.getElementById('denda-panel-catat'),bayar=__f4.globals.document.getElementById('denda-panel-bayar'),b1=__f4.globals.document.getElementById('btn-denda-catat'),b2=__f4.globals.document.getElementById('btn-denda-bayar');
  catat?.classList.toggle('hidden',mode!=='catat');bayar?.classList.toggle('hidden',mode!=='bayar');
  catat?.classList.toggle('mode-inactive',mode!=='catat');bayar?.classList.toggle('mode-inactive',mode!=='bayar');
  [b1,b2].forEach(b=>{if(!b)return;b.classList.remove('active','bg-violet-600','text-white','border-violet-200','bg-white','text-slate-600','border-violet-100')});
  const on=mode==='catat'?b1:b2,off=mode==='catat'?b2:b1;on?.classList.add('active','bg-violet-600','text-white','border-violet-200');off?.classList.add('bg-white','text-slate-600','border-violet-100');
  if(mode==='bayar'){if(!DENDA_LOADED)loadDenda(false);else{renderDendaBayarOptions();previewBayarDenda();__f4.window.refreshAllCustomSelects?.()}}
}
async function loadDenda(silent=false,force=false){
  if(DENDA_LOADED&&!force){renderDendaHistory();renderDendaBayarOptions();return DATA_DENDA}
  if(DENDA_LOADING&&!force)return DENDA_LOADING;
  DENDA_LOADING=(async()=>{
    try{
      if(!silent)dendaMsg('hist-denda-status','Memuat data denda...');
      const r=await jsonp(BATCH_SCRIPT_URL,{action:'datadenda',t:__f4.globals.Date.now()});
      if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memuat denda.');
      DATA_DENDA=r.data||{rows:[],aktif:[],ringkasan:{}}; DENDA_LOADED=true;
      renderDendaHistory();renderDendaBayarOptions();
      if(!silent)__f4.globals.F4Loading.success('hist-denda-status')
      return DATA_DENDA;
    }catch(e){dendaMsg('hist-denda-status',e.message||(0,__f4.globals.String)(e),'error');throw e}
    finally{DENDA_LOADING=null}
  })();
  return DENDA_LOADING;
}
function renderDendaBayarOptions(){const s=__f4.globals.document.getElementById('bayar-denda-id');if(!s)return;const cur=s.value;s.innerHTML='<option value="">Pilih denda...</option>'+((DATA_DENDA.aktif||[]).map(x=>`<option value="${x.idDenda}">${x.nama} • ${x.blok}/${x.noRumah} • ${histDate(x.tanggalKegiatan)} • ${rupiah(x.nominal)}</option>`).join(''));if((DATA_DENDA.aktif||[]).some(x=>x.idDenda===cur))s.value=cur;__f4.window.refreshAllCustomSelects?.()}
function previewBayarDenda(){const id=__f4.globals.document.getElementById('bayar-denda-id')?.value,e=__f4.globals.document.getElementById('bayar-denda-preview');if(!e)return;const x=(DATA_DENDA.aktif||[]).find(v=>v.idDenda===id);if(!x){e.textContent='Pilih denda untuk melihat detail.';return}e.innerHTML=`<div class="font-black text-violet-950">${x.nama} • ${x.blok}/${x.noRumah}</div><div class="mt-1">${x.namaKegiatan} • ${histDate(x.tanggalKegiatan)}</div><div class="text-xl font-black text-violet-700 mt-2">${rupiah(x.nominal)}</div>${x.keterangan?`<div class="text-xs text-slate-500 mt-1">${x.keterangan}</div>`:''}`}
async function simpanDenda(ev){ev.preventDefault();const btn=__f4.globals.document.getElementById('denda-btn-simpan');btn.disabled=true;btn.classList.add('opacity-60');try{dendaMsg('denda-status','Menyimpan denda...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'buatdenda',idWarga:__f4.globals.document.getElementById('denda-warga').value,tanggalKegiatan:__f4.globals.document.getElementById('denda-tanggal').value,namaKegiatan:__f4.globals.document.getElementById('denda-kegiatan').value,nominal:nominalAngka('denda-nominal'),keterangan:__f4.globals.document.getElementById('denda-keterangan').value,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal menyimpan denda.');dendaMsg('denda-status',`${r.idDenda} berhasil dicatat • ${rupiah(r.nominal||0)}`,'success');__f4.globals.document.getElementById('denda-warga').value='';__f4.globals.document.getElementById('denda-keterangan').value='';await loadDenda(true,true)}catch(e){dendaMsg('denda-status',e.message||(0,__f4.globals.String)(e),'error')}finally{btn.disabled=false;btn.classList.remove('opacity-60')}}
async function bayarDenda(ev){ev.preventDefault();const btn=__f4.globals.document.getElementById('bayar-denda-btn');btn.disabled=true;btn.classList.add('opacity-60');try{dendaMsg('bayar-denda-status','Menyimpan pembayaran...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'bayardenda',idDenda:__f4.globals.document.getElementById('bayar-denda-id').value,tanggalBayar:__f4.globals.document.getElementById('bayar-denda-tanggal').value,metode:__f4.globals.document.getElementById('bayar-denda-metode').value,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membayar denda.');dendaMsg('bayar-denda-status',`Pembayaran berhasil • ${rupiah(r.nominal||0)}`,'success');await loadDenda(true,true);await loadRiwayatKas(true);__f4.globals.document.getElementById('bayar-denda-id').value='';previewBayarDenda()}catch(e){dendaMsg('bayar-denda-status',e.message||(0,__f4.globals.String)(e),'error')}finally{btn.disabled=false;btn.classList.remove('opacity-60')}}
function renderDendaHistory(){
  const r=DATA_DENDA.ringkasan||{},set=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};set('denda-sum-belum-count',r.jumlahBelum||0);set('denda-sum-belum',rupiah(r.nominalBelum||0));set('denda-sum-lunas-count',r.jumlahLunas||0);set('denda-sum-lunas',rupiah(r.nominalLunas||0));const tb=__f4.globals.document.getElementById('tbody-riwayat-denda');if(!tb)return;
  const rows=newestFirst(DATA_DENDA.rows,'tanggalKegiatan');
  tb.innerHTML=rows.map(x=>{const batal=x.status==='BATAL',lunas=x.status==='LUNAS';const badge=batal?'bg-slate-100 text-slate-500':lunas?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700';let aksi='-';if(x.status==='BELUM')aksi=`<div class="action-icons">${actionIcon('circle-x','Batal',`batalkanDenda('${x.idDenda}')`,'red')}</div>`;if(lunas)aksi=`<div class="action-icons">${f4ResiAction('denda',x.idDenda)}${actionIcon('rotate-ccw','Batal Bayar',`batalkanPembayaranDenda('${x.idDenda}')`,'amber')}</div>`;return `<tr class="${batal?'opacity-55':''}"><td class="p-3"><div class="font-bold">${histDate(x.tanggalKegiatan)}</div>${f4SystemIdDetails(x.idDenda)}</td><td class="p-3"><div class="font-bold whitespace-nowrap">${x.nama||'-'}</div><div class="text-xs text-slate-400 whitespace-nowrap">${x.blok||''}/${x.noRumah||''}</div></td><td class="p-3"><div class="font-bold">${x.namaKegiatan||'-'}</div><div class="text-xs text-slate-400">${x.keterangan||''}</div></td><td class="p-3 text-right font-black">${rupiah(x.nominal||0)}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-bold ${badge}">${x.status||'BELUM'}</span></td><td class="p-3">${lunas?`${histDate(x.tanggalBayar)}<div class="text-xs text-slate-400">${esc(x.metode||'')}</div>${f4SystemIdDetails(x.idTransaksiKas)}`:'-'}</td><td class="p-3 text-right">${aksi}</td></tr>`}).join('')||'<tr><td colspan="7" class="p-6 text-center text-slate-400">Belum ada data denda.</td></tr>';
  refreshHistoryIcons();
}

async function batalkanDenda(id){if(!(0,__f4.globals.confirm)(`Batalkan denda ${id}?`))return;try{dendaMsg('hist-denda-status','Membatalkan denda...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'batalkandenda',idDenda:id,alasan:'Dibatalkan dari web',t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membatalkan denda.');await loadDenda(true,true);dendaMsg('hist-denda-status',r.message||'Denda dibatalkan.','success')}catch(e){dendaMsg('hist-denda-status',e.message||(0,__f4.globals.String)(e),'error')}}
async function batalkanPembayaranDenda(id){if(!(0,__f4.globals.confirm)(`Batalkan pembayaran denda ${id}?\n\nTransaksi pemasukan Kas Warga terkait juga akan dibatalkan.`))return;try{dendaMsg('hist-denda-status','Membatalkan pembayaran denda...');const r=await jsonp(BATCH_SCRIPT_URL,{action:'batalkanpembayarandenda',idDenda:id,t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal membatalkan pembayaran.');await loadDenda(true,true);await loadRiwayatKas(true);dendaMsg('hist-denda-status',r.message||'Pembayaran denda dibatalkan.','success')}catch(e){dendaMsg('hist-denda-status',e.message||(0,__f4.globals.String)(e),'error')}}


function isiBulanSelect(id){const e=__f4.globals.document.getElementById(id);if(e&&!e.options.length)e.innerHTML=BULAN.slice(1).map((b,i)=>`<option value="${i+1}">${b}</option>`).join('')}
function initLaporanUi(){
  const now=new __f4.globals.Date();
  ['report-bulan','report-arisan-bulan','report-denda-bulan','report-talangan-bulan','report-kas-bulan','report-kas-mulai-bulan','report-kas-sampai-bulan'].forEach(isiBulanSelect);
  const vals={
    'report-bulan':now.getMonth()+1,'report-tahun':now.getFullYear(),
    'report-arisan-bulan':now.getMonth()+1,'report-arisan-tahun':now.getFullYear(),
    'report-denda-bulan':now.getMonth()+1,'report-denda-tahun':now.getFullYear(),
    'report-talangan-bulan':now.getMonth()+1,'report-talangan-tahun':now.getFullYear(),
    'report-kas-bulan':now.getMonth()+1,'report-kas-tahun':now.getFullYear(),
    'report-kas-mulai-bulan':now.getMonth()+1,'report-kas-mulai-tahun':now.getFullYear(),
    'report-kas-sampai-bulan':now.getMonth()+1,'report-kas-sampai-tahun':now.getFullYear(),
    'report-kas-tahun-tunggal':now.getFullYear(),'report-kas-tahun-awal':now.getFullYear(),'report-kas-tahun-akhir':now.getFullYear(),'report-tahunan-tahun':now.getFullYear()
  };
  __f4.globals.Object.entries(vals).forEach(([id,v])=>{const e=__f4.globals.document.getElementById(id);if(e&&!e.value)e.value=v});
  updateKasPeriodControls();
  setModeLaporan(REPORT_MODE||'kas',false);
}
function updateKasPeriodControls(){
  const mode=__f4.globals.document.getElementById('report-kas-jenis')?.value||'bulan';
  const map={bulan:'report-kas-periode-bulan',rentang_bulan:'report-kas-periode-rentang-bulan',tahun:'report-kas-periode-tahun',rentang_tahun:'report-kas-periode-rentang-tahun'};
  __f4.globals.Object.values(map).forEach(id=>__f4.globals.document.getElementById(id)?.classList.add('hidden'));
  __f4.globals.document.getElementById(map[mode])?.classList.remove('hidden');
}
function setModeLaporan(mode,autoload=true){
  const allowed=['kas','rt','arisan','denda','pinjaman','talangan','tahunan'];REPORT_MODE=allowed.includes(mode)?mode:'kas';
  ['kas','rt','arisan','denda','pinjaman','talangan','tahunan'].forEach(x=>{__f4.globals.document.getElementById('report-'+x+'-panel')?.classList.toggle('hidden',REPORT_MODE!==x);__f4.globals.document.getElementById('report-'+x+'-filter')?.classList.toggle('hidden',REPORT_MODE!==x)});
  __f4.globals.document.querySelectorAll('.report-mode-btn').forEach(b=>{b.classList.remove('active','bg-violet-600','text-white');b.classList.add('bg-white','text-slate-600')});
  const a=__f4.globals.document.getElementById('report-mode-'+REPORT_MODE);if(a){a.classList.add('active','bg-violet-600','text-white');a.classList.remove('bg-white','text-slate-600')}
  const picker=__f4.globals.document.getElementById('f4-report-type');
  if(picker&&picker.value!==REPORT_MODE)picker.value=REPORT_MODE;
  if(autoload)loadLaporan();
}
function reportMsg(text,type='info'){const e=__f4.globals.document.getElementById('report-status');if(!e)return;if(type==='success'&&/^Laporan berhasil dimuat\.?$/i.test(text)){__f4.globals.F4Loading.success(e);return}if(type==='info'&&/^Memuat /i.test(text)){__f4.globals.F4Loading.begin(e,text);return}if(type==='error'&&e.dataset.f4State==='loading')__f4.globals.F4Loading.error(e,text);e.dataset.f4State='notice';e.className='mt-3 rounded-xl border px-4 py-3 text-sm '+(type==='error'?'border-red-200 bg-red-50 text-red-700':type==='success'?'border-emerald-200 bg-emerald-50 text-emerald-700':'border-violet-100 bg-violet-50 text-violet-700');e.textContent=text;e.hidden=false;e.classList.remove('hidden')}
function getKasReportParams(){
  const mode=__f4.globals.document.getElementById('report-kas-jenis')?.value||'bulan', p={action:'laporankas',mode,t:__f4.globals.Date.now()};
  if(mode==='bulan'){p.bulan=__f4.globals.document.getElementById('report-kas-bulan').value;p.tahun=__f4.globals.document.getElementById('report-kas-tahun').value}
  else if(mode==='rentang_bulan'){p.mulaiBulan=__f4.globals.document.getElementById('report-kas-mulai-bulan').value;p.mulaiTahun=__f4.globals.document.getElementById('report-kas-mulai-tahun').value;p.sampaiBulan=__f4.globals.document.getElementById('report-kas-sampai-bulan').value;p.sampaiTahun=__f4.globals.document.getElementById('report-kas-sampai-tahun').value}
  else if(mode==='tahun'){p.tahun=__f4.globals.document.getElementById('report-kas-tahun-tunggal').value}
  else {p.mulaiTahun=__f4.globals.document.getElementById('report-kas-tahun-awal').value;p.sampaiTahun=__f4.globals.document.getElementById('report-kas-tahun-akhir').value}
  return p;
}
let REPORT_REQUEST_SEQ=0;
async function loadLaporan(){
  const requestSeq=++REPORT_REQUEST_SEQ;
  try{
    reportMsg('Memuat laporan...');
    let p;
    if(REPORT_MODE==='rt'){
      const bulan=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-bulan')?.value),tahun=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-tahun')?.value);if(!bulan||!tahun){reportMsg('Pilih periode laporan yang lengkap.','error');return}p={action:'laporanrt',bulan,tahun,t:__f4.globals.Date.now()};
    }else if(REPORT_MODE==='arisan'){
      const bulan=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-arisan-bulan')?.value),tahun=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-arisan-tahun')?.value);if(!bulan||!tahun){reportMsg('Pilih periode laporan yang lengkap.','error');return}p={action:'laporanarisan',bulan,tahun,t:__f4.globals.Date.now()};
    }else if(REPORT_MODE==='denda'){
      const bulan=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-denda-bulan')?.value),tahun=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-denda-tahun')?.value),status=__f4.globals.document.getElementById('report-denda-status-filter')?.value||'SEMUA';if(!bulan||!tahun){reportMsg('Pilih periode laporan yang lengkap.','error');return}p={action:'laporandenda',bulan,tahun,status,t:__f4.globals.Date.now()};
    }else if(REPORT_MODE==='pinjaman'){
      const status=__f4.globals.document.getElementById('report-pinjaman-status-filter')?.value||'SEMUA';p={action:'laporanpinjaman',status,t:__f4.globals.Date.now()};
    }else if(REPORT_MODE==='talangan'){
      const bulan=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-talangan-bulan')?.value),tahun=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-talangan-tahun')?.value),status=__f4.globals.document.getElementById('report-talangan-status-filter')?.value||'SEMUA';if(!bulan||!tahun){reportMsg('Pilih periode laporan yang lengkap.','error');return}p={action:'laporantalangan',bulan,tahun,status,t:__f4.globals.Date.now()};
    }else if(REPORT_MODE==='tahunan'){
      const tahun=(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-tahunan-tahun')?.value);if(!tahun){reportMsg('Pilih tahun laporan.','error');return}p={action:'laporantahunan',tahun,t:__f4.globals.Date.now()};
    }else p=getKasReportParams();
    const r=await jsonp(BATCH_SCRIPT_URL,p);
    if(requestSeq!==REPORT_REQUEST_SEQ)return;
    if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memuat laporan.');
    if(REPORT_MODE==='rt'){REPORT_DATA_RT=r.data;renderLaporanRt(r.data)}
    else if(REPORT_MODE==='arisan'){REPORT_DATA_ARISAN=r.data;renderLaporanArisan(r.data)}
    else if(REPORT_MODE==='denda'){REPORT_DATA_DENDA=r.data;renderLaporanDenda(r.data)}
    else if(REPORT_MODE==='pinjaman'){REPORT_DATA_PINJAMAN=r.data;renderLaporanPinjaman(r.data)}
    else if(REPORT_MODE==='talangan'){REPORT_DATA_TALANGAN=r.data;renderLaporanTalangan(r.data)}
    else if(REPORT_MODE==='tahunan'){REPORT_DATA_TAHUNAN=r.data;renderLaporanTahunan(r.data)}
    else{REPORT_DATA_KAS=r.data;renderLaporanKas(r.data)}
    reportMsg('Laporan berhasil dimuat.','success')
  }catch(e){if(requestSeq!==REPORT_REQUEST_SEQ)return;reportMsg(e.message||(0,__f4.globals.String)(e),'error')}
}
function f4KasSignedNet(value){const amount=(0,__f4.globals.Number)(value||0);return (amount>0?'+':'')+rupiah(amount)}
function renderLaporanKas(d){
  d=d||{};const r=d.ringkasan||{};const set=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};
  const periode=(d.labelPeriode||'').replace(/^Periode\s*/i,'').trim();
  set('report-kas-title','LAPORAN KEUANGAN KAS WARGA FLAMBOYAN 4');set('report-kas-subtitle',periode?`Periode ${periode}`:'');
  set('rep-kas-awal',rupiah(r.saldoAwal||0));set('rep-kas-debit',rupiah(r.debit||0));set('rep-kas-kredit',rupiah(r.kredit||0));set('rep-kas-net',f4KasSignedNet(r.saldoPeriode));
  set('rep-kas-net-label','SELISIH KAS');
  const pos=d.posisiKas||null,hasReserve=!!(pos&&(0,__f4.globals.Number)(pos.danaTeralokasi||0)>0);set('rep-kas-akhir-label',hasReserve?'SALDO TERSEDIA':'SALDO AKHIR');set('rep-kas-akhir',rupiah(hasReserve?pos.saldoTersedia:(r.saldoAkhir||0)));
  const pe=__f4.globals.document.getElementById('rep-kas-posisi');if(pe){pe.classList.toggle('hidden',!hasReserve);if(hasReserve){pe.innerHTML=`<div class="kas-position-meta"><div>Riil ${rupiah(pos.saldoRiil||0)}</div><div>Teralokasi ${rupiah(pos.danaTeralokasi||0)}</div></div><div class="kas-position-mobile"><span class="mitem" title="Saldo riil"><i data-lucide="wallet-cards"></i>${rupiah(pos.saldoRiil||0)}</span><span class="mitem" title="Dana teralokasi bulan depan"><i data-lucide="lock-keyhole"></i>${rupiah(pos.danaTeralokasi||0)}</span></div>`;try{__f4.globals.lucide.createIcons()}catch(_e){}}else pe.innerHTML=''}
  const net=__f4.globals.document.getElementById('rep-kas-net');if(net){net.classList.remove('text-red-600','text-emerald-700','text-violet-700');net.classList.add((0,__f4.globals.Number)(r.saldoPeriode||0)<0?'text-red-600':(0,__f4.globals.Number)(r.saldoPeriode||0)>0?'text-emerald-700':'text-violet-700')}
  const tb=__f4.globals.document.getElementById('report-kas-tbody');if(tb){let saldoJalan=(0,__f4.globals.Number)(r.saldoAwal||0);tb.innerHTML=(d.rows||[]).map((x,i)=>{saldoJalan+=(0,__f4.globals.Number)(x.debit||0)-(0,__f4.globals.Number)(x.kredit||0);return `<tr><td class="text-center">${i+1}</td><td class="text-center whitespace-nowrap">${histDate(x.tanggal)}</td><td><div>${esc(f4CashHumanTitle(x,true))}</div>${f4SystemIdDetails(x.idTransaksi,x.sumber)}</td><td class="text-right font-bold text-emerald-700">${x.debit?rupiah(x.debit):''}</td><td class="text-right font-bold text-red-600">${x.kredit?rupiah(x.kredit):''}</td><td class="text-right font-bold text-slate-800">${rupiah(saldoJalan)}</td></tr>`}).join('')||'<tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada transaksi pada periode ini.</td></tr>'; }
  f4KasRefreshMonthlyRecap(d);
}

/* Rekap per bulan dari jurnal D1 dan laporan tahunan read-only. */
let F4_KAS_REKAP_SEQ=0;
function f4KasRowsBulanan(d){
  const grouped=new __f4.globals.Map();
  for(const x of (__f4.globals.Array.isArray(d?.rows)?d.rows:[])){
    const k=(0,__f4.globals.String)(x.tanggal||'').slice(0,7);
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(k))continue;
    if(!grouped.has(k))grouped.set(k,{tahun:(0,__f4.globals.Number)(k.slice(0,4)),namaBulan:BULAN[(0,__f4.globals.Number)(k.slice(5,7))],debit:0,kredit:0});
    const v=grouped.get(k);v.debit+=(0,__f4.globals.Number)(x.debit||0);v.kredit+=(0,__f4.globals.Number)(x.kredit||0);
  }
  return [...grouped].sort((a,b)=>a[0].localeCompare(b[0])).map(([,v])=>({...v,net:v.debit-v.kredit}));
}
function f4KasPaintMonthly(rows){
  const el=__f4.globals.document.getElementById('report-kas-tahunan');if(!el)return;
  if(!rows.length){el.innerHTML='<p class="text-sm text-slate-500">Belum ada pemasukan atau pengeluaran dalam periode ini.</p>';return;}
  el.innerHTML=rows.map(x=>{
    const masuk=(0,__f4.globals.Number)(x.debit??x.pemasukan??0),keluar=(0,__f4.globals.Number)(x.kredit??x.pengeluaran??0);
    const net=(0,__f4.globals.Number)(x.net??x.saldoPeriode??(masuk-keluar));
    return '<div class="rounded-xl border border-violet-100 p-3"><div class="font-bold">'+
      esc(x.namaBulan||BULAN[(0,__f4.globals.Number)(x.bulan)||0]||'')+' '+esc(x.tahun||'')+'</div>'+
      '<div class="mt-1 text-xs text-slate-600">Masuk '+rupiah(masuk)+'<br>Keluar '+rupiah(keluar)+'</div>'+
      '<div class="mt-1 font-black '+(net<0?'text-red-600':net>0?'text-emerald-700':'text-violet-700')+
      '">Selisih '+rupiah(net)+'</div></div>';
  }).join('');
}
function f4KasRefreshMonthlyRecap(d){
  const seq=++F4_KAS_REKAP_SEQ;
  const existing=__f4.globals.Array.isArray(d?.periodeBulanan)&&d.periodeBulanan.length?d.periodeBulanan:
    (__f4.globals.Array.isArray(d?.tahunan)&&d.tahunan.length?d.tahunan:[]);
  f4KasPaintMonthly(existing.length?existing:f4KasRowsBulanan(d));
  if(existing.length)return;
  const state=__f4.window.UPR?.state?.('report-kas');if(!state)return;
  if(!((state.level==='month'||state.level==='year')&&state.from===state.to))return;
  const tahun=(0,__f4.globals.Number)((0,__f4.globals.String)(state.from||'').slice(0,4));
  if(!__f4.globals.Number.isInteger(tahun)||tahun<2020||tahun>2100)return;
  jsonp(BATCH_SCRIPT_URL,{action:'laporantahunan',tahun,t:__f4.globals.Date.now()}).then(r=>{
    if(seq!==F4_KAS_REKAP_SEQ||REPORT_MODE!=='kas'||r?.status!=='success')return;
    const arr=__f4.globals.Array.isArray(r.data?.bulanan)?r.data.bulanan:[];
    const active=arr.filter(x=>(0,__f4.globals.Number)(x.pemasukan||0)!==0||(0,__f4.globals.Number)(x.pengeluaran||0)!==0)
      .map(x=>({...x,tahun}));
    if(active.length)f4KasPaintMonthly(active);
  }).catch(()=>{}); // Jika gagal, rekap transaksi pada periode terpilih tetap terlihat.
}

function esc(v){return (0,__f4.globals.String)(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

/* Nama cetak hanya untuk laporan dan resi; data master/riwayat tetap lengkap. */
function f4NamaCetak(value){
  const row=value&&typeof value==='object'?value:{nama:value};
  const key=(0,__f4.globals.String)(row.idWarga||row.payerId||row.payer_id||'').trim();
  const master=(typeof DATA!=='undefined'&&__f4.globals.Array.isArray(DATA.warga)&&key)
    ?DATA.warga.find(w=>(0,__f4.globals.String)(w.idWarga||'')===key):null;
  const clean=v=>(0,__f4.globals.String)(v||'').replace(/\s+/g,' ').trim();
  const full=clean(master?.nama||row.nama||row.namaWarga);
  const alias=clean(master?.namaPanggilan||master?.nama_panggilan||master?.panggilan||
    row.namaPanggilan||row.nama_panggilan||row.panggilan);
  if(!full&&!alias)return '-';
  const title=/^(bapak|bpk\.?|bp\.?|pak|ibu|bu|nyonya|ny\.?|mas|mbak)\s+/i;
  const detected=(alias.match(title)||full.match(title)||[])[1]||'';
  const gender=clean(master?.jenisKelamin||master?.gender||row.jenisKelamin||row.gender).toLowerCase();
  const female=/^(ibu|bu|nyonya|ny\.?|mbak)$/i.test(detected)||
    (!detected&&/^(p|perempuan|wanita|female)$/i.test(gender));
  const preferred=clean((alias||full).replace(title,''));
  const name=alias?preferred:preferred.split(' ')[0];
  return (female?'Bu ':'Pak ')+(name||'-');
}
__f4.window.F4NamaCetak=f4NamaCetak;

function keteranganCellClassRt(k){
  const t=(0,__f4.globals.String)(k||'').trim().toLowerCase();
  if(!t) return 'report-ket-empty';
  if(t.includes('humas')) return 'report-ket-humas';
  if(t.includes('ketua rt')) return 'report-ket-rt';
  if(t.includes('2x')||t.includes('2 x')||t.includes('dua kali')) return 'report-ket-keb2x';
  return 'report-ket-note';
}
function badgeKeteranganRt(k){
  const t=(0,__f4.globals.String)(k||'').trim();
  return t?esc(t):'<span class="text-slate-300">-</span>';
}
function reportKeteranganRt(x){
 const own=(0,__f4.globals.String)(x?.keterangan||x?.catatan||'').trim();
 if(own)return own;
 const members=__f4.globals.Array.isArray(DATA?.warga)?DATA.warga:[];
 const payer=(0,__f4.globals.String)(x?.idWarga||x?.payerId||x?.payer_id||'').trim();
 const home=(0,__f4.globals.String)(x?.rumah||[x?.blok,x?.noRumah].filter(__f4.globals.Boolean).join('/')).trim().toUpperCase().replace(/\s+/g,'');
 const resident=members.find(w=>payer&&(0,__f4.globals.String)(w.idWarga||'')===payer)
   ||members.find(w=>home&&(0,__f4.globals.String)([w.blok,w.noRumah].filter(__f4.globals.Boolean).join('/')).toUpperCase().replace(/\s+/g,'')===home);
 const current=(0,__f4.globals.String)(resident?.keterangan||resident?.keterangan_warga||'').trim();
 if(current)return current;
 // Historical notes read from the uploaded original DATA_WARGA/DATA_RUMAH workbooks.
 // Only used if the D1 resident master has no note; no financial value is inferred.
 const legacy=[
  ['W0011','A5/34','Ketua RT'],
  ['W0016','A5/40','Kebersihan 2x'],
  ['W0017','A5/41','Humas'],
  ['W0018','A5/43','Tempat Belajar']
 ];
 return legacy.find(([id,rumah])=>(payer&&payer===id)||(home&&home===rumah))?.[2]||'';
}

/* RT: one deterministic house-number order for on-screen tables and PDF.
   Original records and amounts are left untouched. */
function sortedReportRtRows(data){
 const rows=__f4.globals.Array.isArray(data?.rows)?data.rows:[];
 const house=x=>(0,__f4.globals.String)(x?.rumah||[x?.blok,x?.noRumah].filter(__f4.globals.Boolean).join('/')||'').replace(/\s+/g,'').toUpperCase();
 return [...rows].sort((a,b)=>{
  const ha=house(a),hb=house(b);
  if(!ha)return hb?1:0;
  if(!hb)return -1;
  return ha.localeCompare(hb,'id',{numeric:true,sensitivity:'base'})||
   (0,__f4.globals.String)(a.nama||'').localeCompare((0,__f4.globals.String)(b.nama||''),'id',{sensitivity:'base'});
 });
}
/* Label per bulan asli dari alokasi D1, bukan perkiraan total ÷ tarif. */
function f4RtLabelBulan(keys){
 const periods=[...new __f4.globals.Set((keys||[]).map(v=>(0,__f4.globals.String)(v||'').slice(0,7))
   .filter(v=>/^\d{4}-(0[1-9]|1[0-2])$/.test(v)))].sort();
 if(!periods.length)return '';
 const stamp=k=>{const [year,month]=k.split('-').map(__f4.globals.Number);
   return BULAN[month]+' '+year;};
 const adjacent=(a,b)=>{
   const [y,m]=a.split('-').map(__f4.globals.Number);
   return (0,__f4.globals.String)(m===12?y+1:y)+'-'+(0,__f4.globals.String)(m===12?1:m+1).padStart(2,'0')===b;
 };
 const consecutive=periods.every((v,i)=>i===0||adjacent(periods[i-1],v));
 const first=periods[0],last=periods.at(-1);
 let label;
 if(periods.length===1)label=stamp(first);
 else if(consecutive&&first.slice(0,4)===last.slice(0,4)){
   label=BULAN[(0,__f4.globals.Number)(first.slice(5,7))]+'–'+BULAN[(0,__f4.globals.Number)(last.slice(5,7))]+' '+first.slice(0,4);
 }else if(consecutive)label=stamp(first)+' – '+stamp(last);
 else label=periods.map(stamp).join(', ');
 return periods.length>1?periods.length+' bulan: '+label:label;
}
function f4RtPaidPeriodLabel(row){
 // Distinct actual allocation months only: 2x fees in ONE month != 2 months.
 const both=[...(__f4.globals.Array.isArray(row?.rincianBulanan)?row.rincianBulanan:[]),
             ...(__f4.globals.Array.isArray(row?.rincianKebersihan)?row.rincianKebersihan:[])];
 const periods=[...new __f4.globals.Set(both.filter(v=>(0,__f4.globals.Number)(v.nominalRp)>0).map(v=>(0,__f4.globals.String)(v.periode||'').slice(0,7)))];
 return periods.length>1?f4RtLabelBulan(periods):'';
}
function f4RtKeteranganMarkup(row){
 // Kolom Keterangan hanya berisi catatan resmi warga dan pembayaran
 // yang benar-benar mencakup beberapa bulan, bukan pelunasan bulan lain.
 const original=reportKeteranganRt(row),extra=f4RtPaidPeriodLabel(row);
 const base=original?'<span class="rt-base-note">'+esc(original)+'</span>':'';
 const paid=extra?'<span class="rt-paid-note block text-[11px] leading-snug font-semibold mt-1">'+esc(extra)+'</span>':'';
 return base||paid?base+paid:'<span class="text-slate-300">-</span>';
}
function f4RtPrepaidLabel(row,type){
 const category=type==='bulanan'?'IURAN_BULANAN':'KEBERSIHAN';
 const entries=__f4.globals.Array.isArray(row?.pelunasanDiMuka)?row.pelunasanDiMuka:[];
 const periods=[...new __f4.globals.Set(entries.filter(x=>x.jenis===category)
   .map(x=>(0,__f4.globals.String)(x.dibayarPada||'').slice(0,7))
   .filter(x=>/^\d{4}-(0[1-9]|1[0-2])$/.test(x)))].sort();
 if(!periods.length)return '';
 const label=periods.map(p=>{
   const year=p.slice(0,4),month=BULAN[(0,__f4.globals.Number)(p.slice(5,7))];
   // Tampilkan tahun hanya bila pembayaran dan periode kewajibannya berbeda tahun.
   const original=entries.find(x=>x.jenis===category&&x.dibayarPada===p);
   return month+(original?.periode?.slice(0,4)!==year?' '+year:'');
 }).join(', ');
 return 'Dibayar pada '+label;
}
function f4RtDueMissing(row,type){
 const field=type==='bulanan'?'wajibBulananPeriode':'wajibKebersihanPeriode';
 return (__f4.globals.Array.isArray(row?.[field])?row[field]:[]).filter(x=>
   (0,__f4.globals.Number)(x.wajibRp||0)>0&&(0,__f4.globals.Number)(x.dibayarRp||0)<(0,__f4.globals.Number)(x.wajibRp||0));
}
function f4RtCellMarkup(row,type){
 const amount=(0,__f4.globals.Number)(type==='bulanan'?row.nominalBulanan:row.nominalKebersihan)||0;
 const missing=f4RtDueMissing(row,type);
 const obligationField=type==='bulanan'?'wajibBulananPeriode':'wajibKebersihanPeriode';
 const expected=__f4.globals.Array.isArray(row?.[obligationField])?row[obligationField]:[];
 if(amount<=0&&missing.length===0){
   const prepaid=f4RtPrepaidLabel(row,type);
   // Tidak ada penerimaan baru: tulis sekali saja bulan kas diterima
   // di kolom yang tepat; warga bebas kewajiban tetap ditampilkan "-".
   return prepaid?'<span class="rt-prepaid block text-[11px] leading-snug font-semibold text-slate-600">'+esc(prepaid)+'</span>':
     '<span class="rt-dash text-slate-400">-</span>';
 }
 if(amount<=0){
   const partial=missing.some(x=>(0,__f4.globals.Number)(x.dibayarRp||0)>0);
   return '<strong class="rt-alert block text-red-700 text-xs">'+
     (partial?'Belum lunas':'Belum bayar')+'</strong>';
 }
 const value='<strong class="rt-money">'+esc(rupiah(amount))+'</strong>';
 // Jika ada penerimaan pada siklus ini, jangan beri 'Belum bayar'
 // hanya karena alokasinya untuk kewajiban bulan sebelumnya.
 const partial=missing.some(x=>(0,__f4.globals.Number)(x.dibayarRp||0)>0);
 return partial?value+'<span class="rt-alert block text-[10px] font-bold text-red-700 mt-1">Belum lunas</span>':value;
}
function f4RtCellWarning(row,type){
 const amount=(0,__f4.globals.Number)(type==='bulanan'?row.nominalBulanan:row.nominalKebersihan)||0;
 const missing=f4RtDueMissing(row,type);
 return amount>0?missing.some(x=>(0,__f4.globals.Number)(x.dibayarRp||0)>0):missing.length>0;
}


/* Potongan Humas hanya untuk perhitungan penyerahan RT, tidak mengubah D1. */
const F4_RT_POTONGAN_HUMAS=25000;
function f4RtSettlement(d){
  const rows=sortedReportRtRows(d);
  const modern=f4RtIsModern(d);
  const counted=rows.reduce((sum,x)=>sum+(0,__f4.globals.Number)(x.nominalBulanan||0)+(modern?0:(0,__f4.globals.Number)(x.nominalKebersihan||0)),0);
  const bruto=modern?counted:__f4.globals.Math.max(0,(0,__f4.globals.Number)(d?.ringkasan?.totalSetoran??counted)||0);
  const humas=bruto>=F4_RT_POTONGAN_HUMAS?F4_RT_POTONGAN_HUMAS:0;
  return {bruto,humas,neto:bruto-humas};
}
function f4RtSettlementNote(t){
  return t.humas?'Catatan: Sudah dipotong untuk Humas '+rupiah(t.humas)+'. Total disetor ke RT '+rupiah(t.neto)+'.':
    t.bruto?'Catatan: Potongan Humas belum diterapkan karena total setoran kurang dari Rp 25.000.':
    'Catatan: Tidak ada setoran maupun potongan Humas pada periode ini.';
}
function f4RtSettlementNoteHtml(t){
  if(!t.humas)return escapePrint(f4RtSettlementNote(t));
  return 'Catatan: Sudah dipotong untuk Humas '+escapePrint(rupiah(t.humas))+
    '. Total disetor ke RT <mark class="rt-net-highlight">'+escapePrint(rupiah(t.neto))+'</mark>.';
}

function renderLaporanRt(d){d=d||{};if(!f4RtIsModern(d))f4RtRefreshColumns(d);const r=d.ringkasan||{},rows=sortedReportRtRows(d),set=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};// Laporan Setoran RT menghitung UNIT SETORAN, bukan jumlah warga unik.
const unit=(fromApi,total,tariff)=>{
  if(fromApi!==null&&fromApi!==__f4.globals.undefined&&__f4.globals.Number.isFinite((0,__f4.globals.Number)(fromApi)))return (0,__f4.globals.Number)(fromApi);
  const rate=(0,__f4.globals.Number)(tariff||0);
  return rate>0?(0,__f4.globals.Number)(total||0)/rate:0;
};
const fmtCount=n=>(0,__f4.globals.Number)(n).toLocaleString('id-ID',{maximumFractionDigits:2});
const jumlahBulanan=unit(r.jumlahSetoranBulanan,r.totalBulanan,DATA.config?.TARIF_BULANAN);
const jumlahKebersihan=unit(r.jumlahSetoranKebersihan,r.totalKebersihan,DATA.config?.TARIF_KEBERSIHAN);set('report-rt-period',`Periode ${d.labelPeriode||[d.namaBulan,d.tahun].filter(__f4.globals.Boolean).join(' ')}`);set('report-rt-foot-bulanan',rupiah(r.totalBulanan||0));set('report-rt-foot-keb',rupiah(r.totalKebersihan||0));set('report-rt-foot-bulanan-count',`${fmtCount(jumlahBulanan)} setoran`);set('report-rt-foot-keb-count',`${fmtCount(jumlahKebersihan)} setoran`);const hasilRT=f4RtSettlement(d);set('report-rt-foot-total',rupiah(hasilRT.bruto));const noteHtml=__f4.globals.document.getElementById('report-rt-humas-note');if(noteHtml)noteHtml.innerHTML=f4RtSettlementNoteHtml(hasilRT);const note=__f4.globals.document.getElementById('rep-rt-talangan-note');if(note){note.classList.toggle('hidden',!(r.talanganCount>0));note.textContent=`Catatan internal: ${r.talanganCount||0} warga pada laporan ini ditutup melalui talangan. Keterangan ini tidak ikut saat dicetak.`}const tb=__f4.globals.document.getElementById('report-rt-tbody');if(tb)tb.innerHTML=rows.map((x,i)=>`<tr><td class="p-3 text-center">${i+1}</td><td class="p-3 font-bold">${esc(f4NamaCetak(x))}</td><td class="p-3">${esc(x.blok||'')}/${esc(x.noRumah||'')}</td><td class="p-3 ${keteranganCellClassRt(reportKeteranganRt(x))}">${f4RtKeteranganMarkup(x)}</td><td class="p-3 text-right ${f4RtCellWarning(x,'bulanan')?'bg-red-50 text-red-800':''}">${f4RtCellMarkup(x,'bulanan')}</td><td class="p-3 text-right ${f4RtCellWarning(x,'kebersihan')?'bg-red-50 text-red-800':''}">${f4RtCellMarkup(x,'kebersihan')}</td></tr>`).join('')||'<tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada data setoran pada periode ini.</td></tr>';f4RtRefreshColumns(d)}
function f4RtIsModern(d){
 const year=(0,__f4.globals.Number)(d?.tahun||__f4.globals.document.getElementById('report-tahun')?.value);
 const month=BULAN.indexOf(d?.namaBulan)>0?BULAN.indexOf(d.namaBulan):(0,__f4.globals.Number)(d?.bulan||__f4.globals.document.getElementById('report-bulan')?.value);
 return year>2026||(year===2026&&month>=12);
}
function f4RtShares(amount){
 const total=__f4.globals.Math.max(0,(0,__f4.globals.Number)(amount)||0),rt=__f4.globals.Math.floor(total*10/25),rw=__f4.globals.Math.floor(total*5/25);
 return [rt,rw,total-rt-rw];
}
function f4RtRefreshColumns(d){
 const table=__f4.globals.document.querySelector('#report-rt-panel table');
 if(!table)return;
 const head=table.tHead,foot=table.tFoot;
 if(!table.dataset.legacyHead){table.dataset.legacyHead=head.innerHTML;table.dataset.legacyFoot=foot.innerHTML;}
 if(!f4RtIsModern(d)){
   head.innerHTML=table.dataset.legacyHead;foot.innerHTML=table.dataset.legacyFoot;
   return;
 }
 const rows=sortedReportRtRows(d),sums=[0,0,0];
 head.innerHTML='<tr><th>No</th><th>Warga / rumah</th><th>Kas RT</th><th>Kas RW</th><th>Keamanan</th></tr>';
 __f4.globals.document.getElementById('report-rt-tbody').innerHTML=rows.map((x,i)=>{
   const values=f4RtShares(x.nominalBulanan);
   values.forEach((v,k)=>sums[k]+=v);
   const home=(0,__f4.globals.String)(x.rumah||[x.blok,x.noRumah].filter(__f4.globals.Boolean).join('/'));
   const description=reportKeteranganRt(x);
   return '<tr><td>'+(i+1)+'</td><td><strong>'+esc(f4NamaCetak(x))+'</strong><small>'+esc(home)+(description?' · '+esc(description):'')+'</small></td>'+values.map(v=>'<td>'+rupiah(v)+'</td>').join('')+'</tr>';
 }).join('')||'<tr><td colspan="5">Belum ada setoran pada periode ini.</td></tr>';
 foot.innerHTML='<tr><td colspan="2">Jumlah</td>'+sums.map(v=>'<td>'+rupiah(v)+'</td>').join('')+'</tr><tr><td colspan="2">Total disetor</td><td colspan="3">'+rupiah(sums.reduce((a,b)=>a+b,0))+'</td></tr>';
}
function renderLaporanArisan(d){
  d=d||{};
  const serverRows=__f4.globals.Array.isArray(d.rows)?d.rows:[];
  const tarif=(0,__f4.globals.Number)(DATA.config?.TARIF_ARISAN||0);
  const paidMap=new __f4.globals.Map(serverRows.map(x=>[(0,__f4.globals.String)(x.idWarga||''),x]));
  const activeMaster=(DATA.warga||[]).filter(w=>{
    const qty=(0,__f4.globals.Number)(w.qtyArisan||0);
    const st=(0,__f4.globals.String)(w.statusAktif||'').trim().toLowerCase();
    return qty>0 && (!st || st==='aktif' || st==='ya' || st==='yes');
  });
  const merged=[];
  activeMaster.forEach(w=>{
    const id=(0,__f4.globals.String)(w.idWarga||'');
    const py=paidMap.get(id);
    const qty=(0,__f4.globals.Number)(w.qtyArisan||py?.qtyArisan||1);
    merged.push(py?{...py,qtyArisan:qty,nominalWajib:(0,__f4.globals.Number)(py.nominalWajib||qty*tarif)}:{
      idWarga:id,nama:w.nama||id,blok:w.blok||'',noRumah:w.noRumah||'',qtyArisan:qty,
      nominalWajib:qty*tarif,nominalBayar:0,status:'BELUM',metode:''
    });
    paidMap.delete(id);
  });
  paidMap.forEach(py=>merged.push(py));
  const rows=merged;
  const jumlahLunas=rows.filter(x=>(0,__f4.globals.String)(x.status||'').toUpperCase()==='LUNAS').length;
  const jumlahBelum=rows.length-jumlahLunas;
  const totalBayar=rows.reduce((a,x)=>a+(0,__f4.globals.Number)(x.nominalBayar||0),0);
  const set=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};
  set('report-arisan-period',`Periode ${d.namaBulan||''} ${d.tahun||''}`);
  set('rep-arisan-peserta',rows.length);
  set('rep-arisan-lunas',jumlahLunas);
  set('rep-arisan-belum',jumlahBelum);
  set('rep-arisan-total',rupiah(totalBayar));
  set('report-arisan-foot-total',rupiah(totalBayar));
  const tb=__f4.globals.document.getElementById('report-arisan-tbody');
  if(tb)tb.innerHTML=rows.map((x,i)=>`<tr><td class="p-3 text-center">${i+1}</td><td class="p-3 font-bold">${esc(f4NamaCetak(x))}</td><td class="p-3">${esc(x.blok||'')}/${esc(x.noRumah||'')}</td><td class="p-3 text-center">${x.qtyArisan||1}x</td><td class="p-3 text-right font-bold">${rupiah(x.status==='LUNAS'?(x.nominalBayar||x.nominalWajib||0):(x.nominalWajib||0))}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-md text-xs font-bold ${x.status==='LUNAS'?'bg-emerald-600 text-white':'bg-red-600 text-white'}">${esc(x.status||'BELUM')}</span></td><td class="p-3">${esc(x.metode||'-')}</td></tr>`).join('')||'<tr><td colspan="7" class="p-6 text-center text-slate-400">Belum ada peserta arisan.</td></tr>';
}
function renderLaporanDenda(d){d=d||{};const r=d.ringkasan||{},rows=d.rows||[],set=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};set('report-denda-period',`Periode ${d.namaBulan||''} ${d.tahun||''}${d.statusFilter&&d.statusFilter!=='SEMUA'?' • '+d.statusFilter:''}`);set('rep-denda-belum',r.jumlahBelum||0);set('rep-denda-nominal-belum',rupiah(r.nominalBelum||0));set('rep-denda-lunas',r.jumlahLunas||0);set('rep-denda-nominal-lunas',rupiah(r.nominalLunas||0));const tb=__f4.globals.document.getElementById('report-denda-tbody');if(tb)tb.innerHTML=rows.map((x,i)=>`<tr><td class="p-3 text-center">${i+1}</td><td class="p-3 font-bold">${esc(f4NamaCetak(x))}</td><td class="p-3">${esc(x.blok||'')}/${esc(x.noRumah||'')}</td><td class="p-3"><div class="font-bold">${esc(x.namaKegiatan||'-')}</div><div class="text-xs text-slate-400">${x.tanggalKegiatan?histDate(x.tanggalKegiatan):''}</div></td><td class="p-3 text-right font-black">${rupiah(x.nominal||0)}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-bold ${x.status==='LUNAS'?'bg-emerald-100 text-emerald-700':x.status==='BATAL'?'bg-slate-100 text-slate-500':'bg-red-100 text-red-700'}">${esc(x.status||'BELUM')}</span></td><td class="p-3">${x.status==='LUNAS'?`${histDate(x.tanggalBayar)}<div class="text-xs text-slate-400">${esc(x.metode||'')}</div>`:'-'}</td></tr>`).join('')||'<tr><td colspan="7" class="p-6 text-center text-slate-400">Tidak ada data denda pada filter ini.</td></tr>'}
function renderLaporanPinjaman(d){d=d||{};const r=d.ringkasan||{},rows=d.rows||[],set=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};set('report-pinjaman-period',`Posisi pinjaman terkini${d.statusFilter&&d.statusFilter!=='SEMUA'?' • '+d.statusFilter:''}`);set('rep-pinjaman-aktif',r.jumlahAktif||0);set('rep-pinjaman-total',rupiah(r.totalPinjaman||0));set('rep-pinjaman-dibayar',rupiah(r.totalDibayar||0));set('rep-pinjaman-sisa',rupiah(r.totalSisa||0));const tb=__f4.globals.document.getElementById('report-pinjaman-tbody');if(tb)tb.innerHTML=rows.map((x,i)=>{const st=x.status||'AKTIF',badge=st==='LUNAS'?'bg-emerald-100 text-emerald-700':st==='BATAL'?'bg-slate-100 text-slate-500':'bg-amber-100 text-amber-700';return `<tr class="${st==='BATAL'?'opacity-55':''}"><td class="p-3 text-center">${i+1}</td><td class="p-3"><div class="font-bold">${esc(f4NamaCetak(x))}</div><div class="text-xs text-slate-400">${esc(x.blok||'')}/${esc(x.noRumah||'')}</div></td><td class="p-3 whitespace-nowrap">${histDate(x.tanggalPinjaman)}</td><td class="p-3 text-right font-black">${rupiah(x.nominalPinjaman||0)}</td><td class="p-3 text-right font-bold text-emerald-700">${rupiah(x.totalDibayar||0)}</td><td class="p-3 text-right font-black text-red-600">${rupiah(x.sisaPinjaman||0)}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-bold ${badge}">${esc(st)}</span></td><td class="p-3">${esc(x.keterangan||'-')}</td></tr>`}).join('')||'<tr><td colspan="8" class="p-6 text-center text-slate-400">Tidak ada data pinjaman pada filter ini.</td></tr>'}
function renderLaporanTalangan(d){d=d||{};const r=d.ringkasan||{},rows=d.rows||[],set=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};set('report-talangan-period',`Periode ${d.namaBulan||''} ${d.tahun||''}${d.statusFilter&&d.statusFilter!=='SEMUA'?' • '+d.statusFilter:''}`);set('rep-talangan-jumlah',r.jumlah||0);set('rep-talangan-total',rupiah(r.totalTalangan||0));set('rep-talangan-diganti',rupiah(r.totalDiganti||0));set('rep-talangan-sisa',rupiah(r.totalSisa||0));const missingCount=(0,__f4.globals.Number)(d.missingPeriodCount||0);
 const periodElement=__f4.globals.document.getElementById('report-talangan-period');
 if(periodElement&&missingCount){
  const note=__f4.globals.document.createElement('span');
  note.style.cssText='display:block;margin-top:6px;color:#b45309;font-weight:700;font-size:12px';
  note.textContent=missingCount+' transaksi belum memiliki tanggal/periode valid sehingga belum termasuk dalam laporan terfilter. Periksa migrasi Talangan.';
  periodElement.append(note);
 }
 const tb=__f4.globals.document.getElementById('report-talangan-tbody');if(tb)tb.innerHTML=rows.map((x,i)=>{const st=(0,__f4.globals.String)(x.status||'MENUNGGU').toUpperCase(),badge=st==='LUNAS'?'bg-emerald-100 text-emerald-700':st==='BATAL'?'bg-slate-100 text-slate-500':'bg-amber-100 text-amber-700';return `<tr class="${st==='BATAL'?'opacity-55':''}"><td class="p-3 text-center">${i+1}</td><td class="p-3"><div class="font-bold">${esc(f4NamaCetak(x))}</div><div class="text-xs text-slate-400">${esc(x.blok||'')}/${esc(x.noRumah||'')}</div></td><td class="p-3 text-right font-black">${rupiah(x.nominalTalangan||0)}</td><td class="p-3 text-right font-bold text-emerald-700">${rupiah(x.nominalDiganti||0)}</td><td class="p-3 text-right font-black text-red-600">${rupiah(x.sisaTalangan||0)}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-bold ${badge}">${esc(st)}</span></td><td class="p-3 text-center">${esc(x.statusPembukuan||'-')}</td><td class="p-3"><div>${esc(histDate(x.tanggalJatuhTempo))}</div>${x.tanggalLunas?`<div class="text-xs text-emerald-700 mt-1">Lunas ${esc(histDate(x.tanggalLunas))}</div>`:''}</td></tr>`}).join('')||'<tr><td colspan="8" class="p-6 text-center text-slate-400">Tidak ada data talangan pada filter ini.</td></tr>';const pt=__f4.globals.document.getElementById('report-talangan-print-tbody');if(pt)pt.innerHTML=(d.rekapStatus||[]).map(x=>`<tr><td class="p-3 font-bold">${esc(x.status)}</td><td class="p-3 text-center">${x.jumlah||0}</td><td class="p-3 text-right font-bold">${rupiah(x.nominal||0)}</td><td class="p-3 text-right font-black">${rupiah(x.sisa||0)}</td></tr>`).join('')}
async function loadArsipTahunan(force=false){
  if(REPORT_ARSIP_TAHUNAN&&!force){renderArsipTahunan();return REPORT_ARSIP_TAHUNAN}
  try{const r=await jsonp(BATCH_SCRIPT_URL,{action:'arsiptahunan',t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal memuat arsip.');REPORT_ARSIP_TAHUNAN=__f4.globals.Array.isArray(r.data)?r.data:[];renderArsipTahunan();return REPORT_ARSIP_TAHUNAN}catch(e){__f4.globals.console.warn('Arsip tahunan:',e);return []}
}
function renderArsipTahunan(){
  const e=__f4.globals.document.getElementById('report-tahunan-arsip');if(!e)return;const a=REPORT_ARSIP_TAHUNAN||[];
  if(!a.length){e.classList.add('hidden');return}
  e.classList.remove('hidden');e.innerHTML=`<div class="font-black text-violet-950 mb-2">Arsip Tutup Buku</div><div class="flex flex-wrap gap-2">${a.map(x=>`<button type="button" onclick="document.getElementById('report-tahunan-tahun').value='${x.tahun}';loadLaporan()" class="px-3 py-2 rounded-lg border border-violet-100 bg-violet-50 text-violet-800 font-bold">${x.tahun} • ${rupiah(x.saldoAkhir||0)}</button>`).join('')}</div>`
}

function renderLaporanTahunan(d){
  d=d||{};const r=d.ringkasan||{},set=(id,v)=>{const e=__f4.globals.document.getElementById(id);if(e)e.textContent=v};
  set('report-tahunan-period',`Tahun ${d.tahun||''}`);
  const annualCaption=__f4.globals.document.getElementById('report-tahunan-period');
  if(annualCaption&&d.laporanSementara===true){
    const warning=__f4.globals.document.createElement('span');
    warning.style.cssText='display:block;margin-top:5px;font-weight:700;color:#9a3412;font-size:11px';
    const gap=d.pembayaranTanpaRelasiJurnal||{};
    warning.textContent='REKAP SEMENTARA • Belum merupakan saldo final atau Tutup Buku.'
       +((0,__f4.globals.Number)(gap.jumlah||0)>0?' '+gap.jumlah+' pembayaran iuran senilai '+rupiah(gap.nominalRp||0)+' belum memiliki relasi otomatis ke jurnal kas; belum tentu belum dibukukan.':'');
    annualCaption.appendChild(warning);
  }set('rep-tahunan-awal',rupiah(r.saldoAwal||0));set('rep-tahunan-masuk',rupiah(r.pemasukan||0));set('rep-tahunan-keluar',rupiah(r.pengeluaran||0));set('rep-tahunan-net',rupiah(r.saldoPeriode||0));set('rep-tahunan-akhir',rupiah(r.saldoAkhir||0));set('rep-tahunan-rt',rupiah(r.totalSetoranRT||0));set('rep-tahunan-arisan',rupiah(r.totalArisan||0));set('rep-tahunan-denda',rupiah(r.totalDendaMasuk||0));set('rep-tahunan-pinjaman',rupiah(r.sisaPinjaman||0));set('rep-tahunan-talangan',rupiah(r.sisaTalangan||0));
  const tb=__f4.globals.document.getElementById('report-tahunan-tbody');if(tb)tb.innerHTML=(d.bulanan||[]).map(x=>`<tr><td class="p-2">${esc(x.namaBulan||'-')}</td><td class="p-2 text-right">${rupiah(x.pemasukan||0)}</td><td class="p-2 text-right">${rupiah(x.pengeluaran||0)}</td><td class="p-2 text-right ${(0,__f4.globals.Number)(x.saldoPeriode||0)<0?'text-red-600':'text-emerald-700'}">${rupiah(x.saldoPeriode||0)}</td><td class="p-2 text-right">${rupiah(x.setoranRT||0)}</td><td class="p-2 text-right">${rupiah(x.arisan||0)}</td><td class="p-2 text-right">${rupiah(x.dendaMasuk||0)}</td></tr>`).join('');
  const st=__f4.globals.document.getElementById('report-tahunan-status'),btn=__f4.globals.document.getElementById('btn-tutup-buku');if(st){if(d.sudahDitutup){st.className='no-print mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800';st.textContent=`Tahun ${d.tahun} sudah ditutup${d.tutupBuku?.tanggalTutup?' pada '+histDate(d.tutupBuku.tanggalTutup):''}. Saldo awal ${(0,__f4.globals.Number)(d.tahun)+1}: ${rupiah(d.saldoAwalTahunBerikutnya||0)}.`}else if(d.bisaDitutup){st.className='no-print mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800';st.textContent=`Rekap ${d.tahun} siap ditutup. Saldo akhir akan menjadi saldo awal ${(0,__f4.globals.Number)(d.tahun)+1}.`}else{st.className='no-print mb-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800';st.textContent=`Rekap ${d.tahun} dapat dipantau sekarang. Tutup buku baru aktif pada 31 Desember ${d.tahun} atau setelah tahun berakhir.`}}
  if(btn){btn.classList.toggle('hidden',!d.bisaDitutup);btn.textContent=`Tutup Buku ${d.tahun||''}`};loadArsipTahunan()
}
async function prosesTutupBuku(){const d=REPORT_DATA_TAHUNAN;if(!d?.bisaDitutup)return;const tahun=d.tahun;if(!(0,__f4.globals.confirm)(`Tutup buku tahun ${tahun}?\n\nSaldo akhir akan disimpan sebagai snapshot penutup tahun. Data transaksi lama tidak dihapus.`))return;try{reportMsg(`Menutup buku ${tahun}...`);const r=await jsonp(BATCH_SCRIPT_URL,{action:'tutupbuku',tahun,konfirmasi:'TUTUP',t:__f4.globals.Date.now()});if(!r||r.status!=='success')throw new __f4.globals.Error(r?.message||'Gagal menutup buku.');await loadLaporan();await loadArsipTahunan(true);reportMsg(r.message||`Tutup buku ${tahun} berhasil.`,'success')}catch(e){reportMsg(e.message||(0,__f4.globals.String)(e),'error')}}
function getNamaFileLaporan(){
  const clean=s=>(0,__f4.globals.String)(s||'').replace(/[\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim();
  if(REPORT_MODE==='rt'){
    const namaBulan=REPORT_DATA_RT?.namaBulan||BULAN[(0,__f4.globals.Number)(__f4.globals.document.getElementById('report-bulan')?.value||0)-1]||'';
    const tahun=REPORT_DATA_RT?.tahun||__f4.globals.document.getElementById('report-tahun')?.value||'';
    return clean(`Laporan Setoran RT ${REPORT_DATA_RT?.labelPeriode||[namaBulan,tahun].filter(__f4.globals.Boolean).join(' ')}`);
  }
  if(REPORT_MODE==='arisan')return clean(`Laporan Arisan ${REPORT_DATA_ARISAN?.namaBulan||''} ${REPORT_DATA_ARISAN?.tahun||''}`);
  if(REPORT_MODE==='denda')return clean(`Laporan Denda Gorol ${REPORT_DATA_DENDA?.namaBulan||''} ${REPORT_DATA_DENDA?.tahun||''}`);
  if(REPORT_MODE==='pinjaman')return clean(`Laporan Pinjaman Warga ${REPORT_DATA_PINJAMAN?.statusFilter&&REPORT_DATA_PINJAMAN.statusFilter!=='SEMUA'?REPORT_DATA_PINJAMAN.statusFilter:''}`);
  if(REPORT_MODE==='talangan')return clean(`Rekap Talangan Iuran ${REPORT_DATA_TALANGAN?.namaBulan||''} ${REPORT_DATA_TALANGAN?.tahun||''}`);
  if(REPORT_MODE==='tahunan')return clean(`Tutup Buku Flamboyan 4 ${REPORT_DATA_TAHUNAN?.tahun||__f4.globals.document.getElementById('report-tahunan-tahun')?.value||''}`);
  const label=REPORT_DATA_KAS?.labelPeriode||__f4.globals.document.getElementById('report-kas-subtitle')?.textContent||'';
  return clean(`Laporan Pembukuan Kas ${label}`);
}
function escapePrint(v){return (0,__f4.globals.String)(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function printKasSepertiLamanUtama(){
  const d=REPORT_DATA_KAS||{}; const r=d.ringkasan||{};
  const periode=(d.labelPeriode||'').replace(/^Periode\s*/i,'').trim();
  let saldoJalan=(0,__f4.globals.Number)(r.saldoAwal||0);
  const rows=(d.rows||[]).map((x,i)=>{saldoJalan+=(0,__f4.globals.Number)(x.debit||0)-(0,__f4.globals.Number)(x.kredit||0);return `<tr><td class="c">${i+1}</td><td class="c nowrap">${escapePrint(histDate(x.tanggal))}</td><td>${escapePrint(f4CashHumanTitle(x,true))}</td><td class="r masuk nowrap">${x.debit?escapePrint(rupiah(x.debit)):''}</td><td class="r keluar nowrap">${x.kredit?escapePrint(rupiah(x.kredit)):''}</td><td class="r nowrap"><strong>${escapePrint(rupiah(saldoJalan))}</strong></td></tr>`}).join('')||'<tr><td colspan="6" class="empty">Belum ada transaksi pada periode ini.</td></tr>';
  const pos=d.posisiKas||null, hasReserve=!!(pos&&(0,__f4.globals.Number)(pos.danaTeralokasi||0)>0);
  const saldoAkhir=hasReserve?(0,__f4.globals.Number)(pos.saldoTersedia||0):(0,__f4.globals.Number)(r.saldoAkhir||0);
  const labelSaldoAkhir=hasReserve?'SALDO TERSEDIA':'SALDO AKHIR';
  const labelSaldoKas='SELISIH KAS';
  const tanggalCetak=new __f4.globals.Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
  __f4.globals.F4Pdf.openHTML(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapePrint(getNamaFileLaporan())}</title><style>
@page{size:A4 portrait;margin:10mm 11mm 11mm}
*{box-sizing:border-box}
html,body{padding:0;margin:0}
body{font:11px/1.36 Arial,Helvetica,sans-serif;color:#172238;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.header{display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:9px;border-bottom:1.5px solid #334155;padding:0 0 7px;margin:0 0 7px;break-inside:avoid}
.logo{display:block;width:38px;height:38px;object-fit:contain}
.headtext{min-width:0}
.headtext h1{font-size:13px;line-height:1.22;font-weight:800;letter-spacing:-.12px;margin:0 0 3px}
.headtext p{font-size:9.5px;line-height:1.25;margin:2px 0;color:#475569}
.headtext .periode{font-size:9.5px;color:#312e81;font-weight:700}
.badge{align-self:start;font-size:8px;line-height:1;border:1px solid #a5b4fc;background:#eef2ff;color:#3730a3;font-weight:700;padding:5px 6px;border-radius:6px;white-space:nowrap}
.summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:7px 0 9px;break-inside:avoid}
.metric{min-width:0;border:1px solid #cbd5e1;border-radius:5px;padding:6px 8px;background:#fff}
.mlabel{font-size:8.5px;line-height:1.25;color:#64748b;text-transform:uppercase;font-weight:700}
.mvalue{font-size:12px;line-height:1.3;font-weight:800;margin-top:3px;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
.masuk{color:#047857}.keluar{color:#be123c}.saldo{color:#3730a3}.tersedia{color:#0f766e}
h2{font-size:12px;line-height:1.25;margin:9px 0 5px;font-weight:800;color:#1e293b}
table{width:100%;min-width:0;border-collapse:collapse;table-layout:fixed;font-size:10.6px;line-height:1.28;font-variant-numeric:tabular-nums}
thead{display:table-header-group}
th,td{border:1px solid #334155;padding:5px 5px;vertical-align:top}
th{background:#e8eef7;color:#1e293b;font-size:10px;line-height:1.25;font-weight:800;text-align:center;vertical-align:middle}
td{overflow-wrap:break-word;word-break:normal}
tr{break-inside:avoid;page-break-inside:avoid}
.c{text-align:center}.r{text-align:right}.nowrap{white-space:nowrap}
.empty{padding:16px 6px;color:#64748b;text-align:center}
tfoot{display:table-row-group}
tfoot tr{break-inside:avoid;page-break-inside:avoid}
tfoot td{background:#f1f5f9;color:#1e293b;font-weight:800;border-top:1.5px solid #334155;padding:6px 5px}
.total-label{text-align:left}
.approval{margin:4mm 0 0;text-align:right;font-size:9.2px;line-height:1.45;font-weight:600;break-inside:avoid;page-break-inside:avoid}
.note{font-size:8px;line-height:1.3;color:#64748b;border-top:1px solid #cbd5e1;margin:9px 0 0;padding-top:5px}
@media screen{body{width:min(188mm,calc(100% - 24px));margin:12px auto;padding:0 0 18px}}
</style></head><body>
<header class="header"><img class="logo" src="https://flamboyan4.web.id/assets/logo-flamboyan.svg?v=official-20261027-v2" alt="Logo"><div class="headtext"><h1>LAPORAN KEUANGAN KAS WARGA FLAMBOYAN 4</h1><p>RT 001 RW 026 Pesona Kahuripan 2</p><p class="periode">${escapePrint(periode?`Periode ${periode}`:'')}</p></div><span class="badge">LAPORAN KAS</span></header>
<div class="summary"><div class="metric"><div class="mlabel">Saldo Awal</div><div class="mvalue saldo">${escapePrint(rupiah(r.saldoAwal||0))}</div></div><div class="metric"><div class="mlabel">${escapePrint(labelSaldoKas)}</div><div class="mvalue masuk">${escapePrint(f4KasSignedNet(r.saldoPeriode))}</div></div><div class="metric"><div class="mlabel">${escapePrint(labelSaldoAkhir)}</div><div class="mvalue tersedia">${escapePrint(rupiah(saldoAkhir))}</div></div></div>
<h2>Rincian Transaksi</h2><table><colgroup><col style="width:6%"><col style="width:16%"><col style="width:31%"><col style="width:15%"><col style="width:14%"><col style="width:18%"></colgroup><thead><tr><th>No</th><th>Tanggal</th><th>Keterangan</th><th class="r">Debit</th><th class="r">Kredit</th><th class="r">Saldo Berjalan</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="3" class="total-label">Total Periode</td><td class="r masuk nowrap">${escapePrint(rupiah(r.debit||0))}</td><td class="r keluar nowrap">${escapePrint(rupiah(r.kredit||0))}</td><td class="r nowrap" style="color:#64748b">—</td></tr></tfoot></table>
<section class="approval">Mengetahui,<br>Humas Flamboyan 4</section>
<div class="note">Dicetak pada ${escapePrint(tanggalCetak)} • Flamboyan 4 • Data bersumber dari pembukuan kas pada flamboyan4.web.id</div><script>window.onload=()=>{setTimeout(()=>window.print(),350)}<\/script>



</body></html>`);
}
function printRtSepertiLamanUtama(){
  if(f4RtIsModern(REPORT_DATA_RT)){
    const table=__f4.globals.document.querySelector('#report-rt-panel table');
    const period=__f4.globals.document.getElementById('report-rt-period')?.textContent||'';
    const note=__f4.globals.document.getElementById('report-rt-humas-note')?.textContent||'';
    __f4.globals.F4Pdf.openHTML('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan Setoran RT</title><style>@page{size:A4 portrait;margin:12mm}body{font:12px Arial,sans-serif;color:#202539}h1{font-size:18px}p{color:#526078}table{width:100%;border-collapse:collapse}th,td{border:1px solid #aab4c8;padding:8px;text-align:right}th:nth-child(-n+2),td:nth-child(-n+2){text-align:left}th{background:#eeeaff}small{display:block;color:#657086;margin-top:2px}tfoot{font-weight:bold;background:#f5f2ff}.note{margin-top:18px}</style></head><body><h1>Laporan Setoran RT</h1><p>'+escapePrint(period)+'</p>'+table.outerHTML+'<div class="note">'+escapePrint(note)+'</div><p style="text-align:right">Mengetahui,<br>Humas Flamboyan 4</p></body></html>');
    return;
  }
  const d=REPORT_DATA_RT||{}; const rows=sortedReportRtRows(d); const periode=d.labelPeriode||[d.namaBulan,d.tahun].filter(__f4.globals.Boolean).join(' ');
  // Kolom cetak wajib sama dengan renderLaporanRt pada layar: nominalBulanan/nominalKebersihan.
  const nominalBulanan=x=>(0,__f4.globals.Number)(x.nominalBulanan??x.iuranBulanan??x.bulanan??0);
  const nominalKebersihan=x=>(0,__f4.globals.Number)(x.nominalKebersihan??x.kebersihan??0);
  const rumah=x=>x.rumah||[x.blok,x.noRumah].filter(__f4.globals.Boolean).join('/')||'-';
  const noteClass=k=>{
   const t=(0,__f4.globals.String)(k||'').toLowerCase();
   return t.includes('ketua rt')?'n-rt':t.includes('kebersihan 2')?'n-keb':t.includes('humas')?'n-humas':t.includes('tempat belajar')?'n-tpq':'';
  };
  const body=rows.map((x,i)=>{const ket=reportKeteranganRt(x);return `<tr><td class="c">${i+1}</td><td>${escapePrint(f4NamaCetak(x))}</td><td>${escapePrint(rumah(x))}</td><td class="${noteClass(ket)}">${f4RtKeteranganMarkup(x)}</td><td class="r ${f4RtCellWarning(x,'bulanan')?'rt-warning':''}">${f4RtCellMarkup(x,'bulanan')}</td><td class="r ${f4RtCellWarning(x,'kebersihan')?'rt-warning':''}">${f4RtCellMarkup(x,'kebersihan')}</td></tr>`}).join('')||'<tr><td colspan="6" class="empty">Belum ada data.</td></tr>';
  const totalBulanan=rows.reduce((a,x)=>a+nominalBulanan(x),0), totalKeb=rows.reduce((a,x)=>a+nominalKebersihan(x),0);
  const countBulanan=(0,__f4.globals.Number)(d.ringkasan?.jumlahSetoranBulanan??0), countKeb=(0,__f4.globals.Number)(d.ringkasan?.jumlahSetoranKebersihan??0);
  const hasilRT=f4RtSettlement(d);
  __f4.globals.F4Pdf.openHTML(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapePrint(getNamaFileLaporan())}</title><style>
@page{size:A4 portrait;margin:10mm 12mm 11mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#1e293b;font-size:10.5px;line-height:1.35;-webkit-print-color-adjust:exact;print-color-adjust:exact}.header{display:flex;align-items:center;gap:12px;border-bottom:2px solid #1e293b;padding-bottom:8px;margin-bottom:9px}.logo{width:50px;height:50px;object-fit:contain}.headtext{flex:1}.headtext h1{font-size:16px;margin:0 0 3px;font-weight:800}.headtext p{margin:2px 0;color:#475569}.periode{font-weight:700;color:#312e81}h2{font-size:12px;margin:9px 0 5px}table{width:100%;border-collapse:collapse;table-layout:fixed}th{background:#f1f5f9;color:#334155;font-size:10.3px;text-align:center;border:1px solid #000;padding:4px 5px}td{border:1px solid #000;padding:4px 5px;vertical-align:middle}.c{text-align:center}.r{text-align:right}.nowrap{white-space:nowrap}.empty{text-align:center;color:#64748b;padding:12px}.n-rt{background:#fff1c2;font-weight:700;color:#4c3b05}.n-keb{background:#dbfce6;font-weight:700;color:#155b31}.n-humas{background:#dff2ff;font-weight:700;color:#164465}.n-tpq{background:#ebe7ff;font-weight:700;color:#47318a}td.rt-warning{background:#fff1f2;color:#991b1b}td .rt-alert{color:#b91c1c;font-weight:700;font-size:9px}td .rt-paid-note{display:block;font-size:8.4px;line-height:1.2;margin-top:2px;color:#475569;font-weight:650;overflow-wrap:anywhere}td .rt-prepaid{display:block;color:#475569;font-size:9.5px;line-height:1.3;font-weight:600;white-space:normal;overflow-wrap:anywhere}td .rt-money{font-weight:700}td .rt-dash{color:#94a3b8}tfoot td{background:#f8fafc;font-weight:700}.muted{display:block;font-size:8.5px;color:#64748b;font-weight:600;margin-top:1px}.handover{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-top:7px;break-inside:avoid;page-break-inside:avoid}.handover .note{flex:1;min-width:0;font-size:9.2px;line-height:1.45;color:#334155}.handover .humas{flex:0 0 135px;text-align:right;font-size:10px;line-height:1.35;font-weight:700}.rt-net-highlight{background:#fde047;color:#422006;border:1px solid #eab308;border-radius:2px;padding:1px 3px;font-weight:800;-webkit-print-color-adjust:exact;print-color-adjust:exact}@media screen{body{max-width:186mm;margin:14px auto;padding:0 4px;background:#fff}}</style></head><body>
<header class="header"><img class="logo" src="https://flamboyan4.web.id/assets/logo-flamboyan.svg?v=official-20261027-v2" alt="Logo"><div class="headtext"><h1>LAPORAN SETORAN IURAN WARGA</h1><p>RT 001 RW 026 Pesona Kahuripan 2</p><p class="periode">${escapePrint(periode?`Periode ${periode}`:'')}</p></div></header>
<h2>Rincian Setoran</h2><table><colgroup><col style="width:6%"><col style="width:22%"><col style="width:13%"><col style="width:25%"><col style="width:17%"><col style="width:17%"></colgroup><thead><tr><th>No</th><th>Nama</th><th>Rumah</th><th>Keterangan</th><th>Iuran Bulanan</th><th>Kebersihan</th></tr></thead><tbody>${body}</tbody><tfoot><tr><td colspan="4" class="r">TOTAL</td><td class="r">${escapePrint(rupiah(totalBulanan))}<span class="muted">${countBulanan} setoran</span></td><td class="r">${escapePrint(rupiah(totalKeb))}<span class="muted">${countKeb} setoran</span></td></tr><tr><td colspan="4" class="r">TOTAL SETORAN</td><td colspan="2" class="r">${escapePrint(rupiah(hasilRT.bruto))}</td></tr></tfoot></table>
<div class="handover"><div class="note">${f4RtSettlementNoteHtml(hasilRT)}</div><div class="humas">Mengetahui,<br>Humas Flamboyan 4</div></div><script>window.onload=()=>{setTimeout(()=>window.print(),350)}<\/script></body></html>`);
}
function printLaporan(){
  // Print only a report successfully fetched for the active mode; never print placeholders.
  const dataByMode={kas:REPORT_DATA_KAS,rt:REPORT_DATA_RT,arisan:REPORT_DATA_ARISAN,
    denda:REPORT_DATA_DENDA,pinjaman:REPORT_DATA_PINJAMAN,talangan:REPORT_DATA_TALANGAN,tahunan:REPORT_DATA_TAHUNAN};
  if(!dataByMode[REPORT_MODE]){
    reportMsg('Muat laporan '+REPORT_MODE+' terlebih dahulu sebelum mencetak.','error');
    return;
  }
  if(REPORT_MODE==='kas'){printKasSepertiLamanUtama();return;}
  if(REPORT_MODE==='rt'){printRtSepertiLamanUtama();return;}
  const area=__f4.globals.document.getElementById('report-print-area');
  if(!area){reportMsg('Laporan belum tersedia.','error');return;}
  __f4.globals.F4Pdf.openElement(area,{title:getNamaFileLaporan()||'Laporan Pembukuan Flamboyan 4',size:'A4',orientation:'portrait',margins:'10mm 12mm'});
}

function bukaMenu(){__f4.globals.document.querySelectorAll('.custom-select-wrap.open').forEach(x=>x.classList.remove('open'));const d=__f4.globals.document.getElementById('side-drawer');d.classList.add('open');d.setAttribute('aria-hidden','false');__f4.globals.document.body.style.overflow='hidden';__f4.globals.lucide.createIcons()}
function tutupMenu(){const d=__f4.globals.document.getElementById('side-drawer');d.classList.remove('open');d.setAttribute('aria-hidden','true');__f4.globals.document.body.style.overflow=''}

let f4BookRouteInitialized=false,f4BookRestoring=false;
function pilihMenu(n,period=null){
  if(!__f4.globals.document.getElementById('tab-'+n))n='inputdata';
  const u=new __f4.globals.URL(__f4.globals.location.href),prior=u.searchParams.get('halaman')||'inputdata';
  if(n==='inputdata')u.searchParams.delete('halaman');else u.searchParams.set('halaman',n);
  const month=Number(period?.month),year=Number(period?.year);
  const selectedPeriod=n==='kas'&&Number.isInteger(month)&&month>=1&&month<=12&&Number.isInteger(year)&&year>=2020&&year<=2100;
  if(selectedPeriod){u.searchParams.set('bulan',month);u.searchParams.set('tahun',year);}else if(n!=='kas'){u.searchParams.delete('bulan');u.searchParams.delete('tahun');}
  if(!f4BookRestoring&&(!f4BookRouteInitialized||prior!==n||selectedPeriod&&u.search!==__f4.globals.location.search))__f4.globals.history[f4BookRouteInitialized?'pushState':'replaceState']({...__f4.globals.history.state,f4BookRoute:n},'',u.pathname+u.search);
  f4BookRouteInitialized=true;
  const viewToken=__f4.globals.F4PortalNavigation?.beginView();
  try{
  // Keterangan pemeriksaan periode tidak boleh tersimpan lintas menu.
  if(n!=='input')f4IuranPeriodNotice('');
  __f4.globals.document.querySelectorAll('.custom-select-wrap.open').forEach(x=>x.classList.remove('open'));
  const meta={
    monitor:['Pantau Pembayaran',''],
    inputdata:['Input Data',''],
    input:['Input Iuran Warga',''],
    transaksi:['Debit / Kredit',''],
    kas:['Pembukuan',''],
    pinjaman:['Pinjaman',''],
    importbulk:['Import Bulk Migrasi','Upload CSV Iuran dan Kas dengan pemeriksaan duplikat sebelum disimpan.'],
    talangan:['Talangan Iuran','Kelola talangan Iuran Bulanan + Kebersihan warga.'],
    denda:['Denda',''],
    laporan:['Laporan & Rekap',''],
    riwayat:['Riwayat Transaksi',''],
    dashboard:['Ringkasan Data','Ringkasan master hunian dan tarif sebagai data acuan.'],
    rumah:['Data Rumah','Data unit rumah sebagai acuan administrasi.'],
    warga:['Data Warga','Data warga aktif dan kondisi iurannya.'],
    config:['Tarif & Aturan','Tarif dan aturan yang menjadi acuan perhitungan.']
  };
  __f4.globals.document.querySelectorAll('.tab-panel').forEach(x=>x.classList.add('hidden'));
  const panel=__f4.globals.document.getElementById('tab-'+n);if(panel)panel.classList.remove('hidden');
  const inputGroup=['inputdata','input','transaksi','kas','pinjaman','talangan','denda'];
  const dataGroup=['dashboard','rumah','warga','config','importbulk'];
  const group=inputGroup.includes(n)?'inputdata':dataGroup.includes(n)?'dataacuan':n;
  __f4.globals.document.querySelectorAll('.drawer-item').forEach(x=>x.classList.remove('active'));
  __f4.globals.document.querySelector(`[data-menu-group="${group}"]`)?.classList.add('active');
  const inputNav=__f4.globals.document.getElementById('group-nav-inputdata');
  inputNav?.classList.toggle('hidden',group!=='inputdata'||n==='input');
  inputNav?.classList.toggle('f4-book-landing',n==='inputdata');
  __f4.globals.document.getElementById('f4-book-home-back')?.classList.toggle('hidden',group!=='inputdata'||n==='inputdata');
  __f4.globals.document.getElementById('group-nav-dataacuan')?.classList.toggle('hidden',group!=='dataacuan');
  __f4.globals.document.querySelectorAll('.process-btn').forEach(x=>x.classList.remove('active'));
  __f4.globals.document.querySelector(`[data-process-target="${n}"]`)?.classList.add('active');
  const section=n==='input'?'input':['transaksi','kas'].includes(n)?'kas':
    ['talangan','denda','pinjaman'].includes(n)?'lainnya':null;
  __f4.globals.document.querySelectorAll('[data-book-input-section]').forEach(b=>{
    const selected=group==='inputdata'&&b.dataset.bookInputSection===section;
    b.classList.toggle('active',selected);
    b.setAttribute('aria-pressed',(0,__f4.globals.String)(selected));
  });
  __f4.globals.document.getElementById('f4-book-subnav-kas')?.classList.toggle('hidden',section!=='kas'||group!=='inputdata');
  __f4.globals.document.getElementById('f4-book-subnav-lainnya')?.classList.toggle('hidden',section!=='lainnya'||group!=='inputdata');
  if(n==='importbulk')__f4.globals.document.querySelector('.f4-book-admin-tools')?.setAttribute('open','');
  __f4.globals.document.getElementById('page-title').textContent=meta[n]?.[0]||'Pembukuan Flamboyan 4';
  __f4.globals.document.getElementById('page-subtitle').textContent=meta[n]?.[1]||'';
  __f4.globals.document.getElementById('page-heading')?.classList.remove('hidden');
  if(n==='monitor')__f4.window.F4PaymentMonitor.open();
  if(n==='riwayat')pilihRiwayat('iuran');
  if(n==='transaksi')initTransaksiKasUi();
  if(n==='kas'){
   if(selectedPeriod){__f4.globals.document.getElementById('kas-bulan-iuran').value=month;__f4.globals.document.getElementById('kas-tahun-iuran').value=year;__f4.globals.document.getElementById('kas-jenis-sumber').value='kas_lorong';f4ChangeKasSource();}
   else if(!KAS_LOADED)loadPembukuanKas();else renderPembukuanKas();
  }
  if(n==='pinjaman'){initPinjamanUi();loadPinjaman(true)}
  if(n==='talangan'){initTalanganUi();loadTalangan(true)}
  if(n==='denda'){initDendaUi();loadDenda(true);}
  if(n==='laporan'){initLaporanUi();loadLaporan()}
  if(n==='importbulk'){(0,__f4.globals.bulkRefreshControls)();__f4.globals.lucide.createIcons()}
  tutupMenu();
  __f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-shared-book-route',{detail:n}));
  __f4.window.scrollTo({top:0,behavior:'auto'});
  }finally{__f4.globals.F4PortalNavigation?.endView(viewToken??null)}
}

function pilihRiwayat(type){
  __f4.globals.document.getElementById('history-iuran-panel')?.classList.toggle('hidden',type!=='iuran');
  __f4.globals.document.getElementById('history-kasumum-panel')?.classList.toggle('hidden',type!=='kasumum');
  __f4.globals.document.getElementById('history-batch-panel')?.classList.toggle('hidden',type!=='batch');
  __f4.globals.document.getElementById('history-pinjaman-panel')?.classList.toggle('hidden',type!=='pinjaman');
  __f4.globals.document.getElementById('history-talangan-panel')?.classList.toggle('hidden',type!=='talangan');
  __f4.globals.document.getElementById('history-denda-panel')?.classList.toggle('hidden',type!=='denda');
  __f4.globals.document.querySelectorAll('.history-btn').forEach(x=>x.classList.remove('active'));
  __f4.globals.document.getElementById('history-btn-'+type)?.classList.add('active');
  const picker=__f4.globals.document.getElementById('f4-history-type');
  if(picker&&picker.value!==type)picker.value=type;
  if(type==='iuran')loadRiwayat(true);
  if(type==='kasumum')loadRiwayatKas();
  if(type==='batch')muatRiwayatBatch();
  if(type==='pinjaman')loadPinjaman();
  if(type==='talangan')loadTalangan();
  if(type==='denda')loadDenda();
}

function initHistoryBatchFilters(){
  const now=new __f4.globals.Date();const opts=BULAN.slice(1).map((b,i)=>`<option value="${i+1}">${b}</option>`).join('');
  const m=__f4.globals.document.getElementById('hist-batch-bulan'),y=__f4.globals.document.getElementById('hist-batch-tahun');
  if(m){m.innerHTML=opts;m.value=now.getMonth()+1}if(y)y.value=now.getFullYear();
}

async function muatRiwayatBatch(){
  const m=__f4.globals.document.getElementById('hist-batch-bulan'),y=__f4.globals.document.getElementById('hist-batch-tahun');
  if(!m||!y)return;
  const kasM=__f4.globals.document.getElementById('kas-bulan-iuran'),kasY=__f4.globals.document.getElementById('kas-tahun-iuran');
  if(kasM)kasM.value=m.value;if(kasY)kasY.value=y.value;
  await loadPembukuanKas();
  renderPembukuanKas();
}

function renderRumah(){const q=(__f4.globals.document.getElementById('cari-rumah')?.value||'').toLowerCase();const a=DATA.rumah.filter(r=>[r.blok,r.noRumah,r.namaPemilik,r.statusRumah,r.tipeUnit,r.keterangan].join(' ').toLowerCase().includes(q));__f4.globals.document.getElementById('tbody-rumah').innerHTML=a.map(r=>`<tr class="hover:bg-violet-50/40"><td class="p-3 text-center text-slate-400">${r.noUrut||'-'}</td><td class="p-3 font-bold">${r.blok||'-'}</td><td class="p-3 font-bold">${r.noRumah||'-'}</td><td class="p-3">${r.statusRumah||'-'}</td><td class="p-3">${r.tipeUnit||'-'}</td><td class="p-3">${r.namaPemilik||'-'}</td><td class="p-3 text-slate-500">${r.keterangan||'-'}</td></tr>`).join('')||'<tr><td colspan="7" class="p-5 text-center text-slate-400">Tidak ada data.</td></tr>'}
function renderWarga(){const q=(__f4.globals.document.getElementById('cari-warga')?.value||'').toLowerCase();const a=DATA.warga.filter(r=>[r.nama,r.blok,r.noRumah,r.statusTinggal,r.keterangan].join(' ').toLowerCase().includes(q));__f4.globals.document.getElementById('tbody-warga').innerHTML=a.map((r,i)=>`<tr class="hover:bg-violet-50/40"><td class="p-3 text-center text-slate-400">${i+1}</td><td class="p-3 font-bold">${r.nama||'-'}</td><td class="p-3">${r.blok}/${r.noRumah}</td><td class="p-3">${r.statusTinggal||'-'}</td><td class="p-3 text-center">${r.statusAktif||'-'}</td><td class="p-3 text-center font-bold">${r.qtyIuranBulanan||0}x</td><td class="p-3 text-center font-bold">${r.qtyKebersihan||0}x</td><td class="p-3 text-center font-bold">${r.qtyKasLorong||0}x</td><td class="p-3 text-center font-bold">${r.qtyArisan||0}x</td><td class="p-3 text-slate-500">${r.keterangan||'-'}</td></tr>`).join('')||'<tr><td colspan="10" class="p-5 text-center text-slate-400">Tidak ada data.</td></tr>'}
function renderConfig(){const m={TARIF_BULANAN:'Tarif Iuran Bulanan',TARIF_KEBERSIHAN:'Tarif Kebersihan',TARIF_KAS_LORONG:'Tarif Kas Lorong',TARIF_ARISAN:'Tarif Arisan',TANGGAL_SETOR_RT:'Tanggal Setor RT',BATAS_PERIODE_KAS:'Batas Periode Kas'};__f4.globals.document.getElementById('config-list').innerHTML=__f4.globals.Object.entries(DATA.config).map(([k,v])=>`<div class="rounded-xl border border-violet-100 bg-white p-4"><div class="text-[11px] font-bold text-slate-400 uppercase">${m[k]||k}</div><div class="mt-1 font-black text-lg text-violet-950">${k.startsWith('TARIF_')?rupiah(v):v}</div></div>`).join('')}
function gantiTab(n,b){pilihMenu(n)}
__f4.window.addEventListener('popstate',()=>{const target=new __f4.globals.URLSearchParams(__f4.globals.location.search).get('halaman')||'inputdata';const active=__f4.globals.document.querySelector('.tab-panel:not(.hidden)');if(active?.id==='tab-'+target)return;f4BookRestoring=true;try{pilihMenu(target)}finally{f4BookRestoring=false}});
__f4.globals.document.addEventListener('DOMContentLoaded',()=>{
  __f4.globals.lucide.createIcons();
  initKasUi();initTransaksiKasUi();initHistoryBatchFilters();initRiwayatPeriodFilter();
  __f4.globals.document.getElementById('iq-current-position')?.addEventListener('toggle',()=>{void refreshIuranPosition()});
  const routeParams=new __f4.globals.URLSearchParams(__f4.globals.location.search);
  pilihMenu(routeParams.get('halaman')||'inputdata',{month:routeParams.get('bulan'),year:routeParams.get('tahun')});
  muatUlang();
});

});
