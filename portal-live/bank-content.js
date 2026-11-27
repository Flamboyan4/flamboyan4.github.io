/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/bank-content.js",function(__f4){

  'use strict';
__f4.expose("$",()=>$,null);
__f4.expose("bankLocalToday",()=>bankLocalToday,null);
__f4.expose("token",()=>token,value=>token=value);
__f4.expose("profile",()=>profile,value=>profile=value);
__f4.expose("accounts",()=>accounts,value=>accounts=value);
__f4.expose("currentCredential",()=>currentCredential,value=>currentCredential=value);
__f4.expose("setCatalog",()=>setCatalog,value=>setCatalog=value);
__f4.expose("setNonce",()=>setNonce,value=>setNonce=value);
__f4.expose("setEditId",()=>setEditId,value=>setEditId=value);
__f4.expose("setEditPayload",()=>setEditPayload,value=>setEditPayload=value);
__f4.expose("saleCatalog",()=>saleCatalog,value=>saleCatalog=value);
__f4.expose("saleNonce",()=>saleNonce,value=>saleNonce=value);
__f4.expose("note",()=>note,value=>note=value);
__f4.expose("call",()=>call,value=>call=value);
__f4.expose("busy",()=>busy,value=>busy=value);
__f4.expose("showAuth",()=>showAuth,value=>showAuth=value);
__f4.expose("showDashboard",()=>showDashboard,value=>showDashboard=value);
__f4.expose("goPage",()=>goPage,value=>goPage=value);
__f4.expose("toggleMenu",()=>toggleMenu,value=>toggleMenu=value);
__f4.expose("doLogin",()=>doLogin,value=>doLogin=value);
__f4.expose("doLogout",()=>doLogout,value=>doLogout=value);
__f4.expose("doChangePassword",()=>doChangePassword,value=>doChangePassword=value);
__f4.expose("cell",()=>cell,value=>cell=value);
__f4.expose("rupiah",()=>rupiah,null);
__f4.expose("kg",()=>kg,null);
__f4.expose("f4BankDisplayWargaName",()=>f4BankDisplayWargaName,value=>f4BankDisplayWargaName=value);
__f4.expose("f4BankPersonInitial",()=>f4BankPersonInitial,value=>f4BankPersonInitial=value);
__f4.expose("f4BankPersonAvatar",()=>f4BankPersonAvatar,value=>f4BankPersonAvatar=value);
__f4.expose("metric",()=>metric,value=>metric=value);
__f4.expose("loadDashboard",()=>loadDashboard,value=>loadDashboard=value);
__f4.expose("loadMaster",()=>loadMaster,value=>loadMaster=value);
__f4.expose("editTarif",()=>editTarif,value=>editTarif=value);
__f4.expose("editSetoran",()=>editSetoran,value=>editSetoran=value);
__f4.expose("applySetoranEdit",()=>applySetoranEdit,value=>applySetoranEdit=value);
__f4.expose("loadSetoran",()=>loadSetoran,value=>loadSetoran=value);
__f4.expose("addSetoranItemRow",()=>addSetoranItemRow,value=>addSetoranItemRow=value);
__f4.expose("getSetItems",()=>getSetItems,value=>getSetItems=value);
__f4.expose("previewSetoran",()=>previewSetoran,value=>previewSetoran=value);
__f4.expose("submitSetoran",()=>submitSetoran,value=>submitSetoran=value);
__f4.expose("loadRiwayat",()=>loadRiwayat,value=>loadRiwayat=value);
__f4.expose("cancelSetoran",()=>cancelSetoran,value=>cancelSetoran=value);
__f4.expose("loadPenjualan",()=>loadPenjualan,value=>loadPenjualan=value);
__f4.expose("addSaleItemRow",()=>addSaleItemRow,value=>addSaleItemRow=value);
__f4.expose("saleItems",()=>saleItems,value=>saleItems=value);
__f4.expose("updateSaleTotals",()=>updateSaleTotals,value=>updateSaleTotals=value);
__f4.expose("loadBatchRekon",()=>loadBatchRekon,value=>loadBatchRekon=value);
__f4.expose("v7DetailTable",()=>v7DetailTable,value=>v7DetailTable=value);
__f4.expose("v7SetDetailsButton",()=>v7SetDetailsButton,value=>v7SetDetailsButton=value);
__f4.expose("v7ToggleDetails",()=>v7ToggleDetails,value=>v7ToggleDetails=value);
__f4.expose("v7SettleSale",()=>v7SettleSale,value=>v7SettleSale=value);
__f4.expose("f4BankReceiptIcon",()=>f4BankReceiptIcon,value=>f4BankReceiptIcon=value);
__f4.expose("f4BankDepositReceiptReady",()=>f4BankDepositReceiptReady,value=>f4BankDepositReceiptReady=value);
__f4.expose("f4BankDepositReceipt",()=>f4BankDepositReceipt,value=>f4BankDepositReceipt=value);
__f4.expose("f4BankDepositDetailPayload",()=>f4BankDepositDetailPayload,value=>f4BankDepositDetailPayload=value);
__f4.expose("f4BankSaleReceipt",()=>f4BankSaleReceipt,value=>f4BankSaleReceipt=value);
__f4.expose("v7HistoryCard",()=>v7HistoryCard,value=>v7HistoryCard=value);
__f4.expose("v7EditSaleReceipt",()=>v7EditSaleReceipt,value=>v7EditSaleReceipt=value);
__f4.expose("loadRiwayatV7",()=>loadRiwayatV7,value=>loadRiwayatV7=value);
__f4.expose("loadRiwayatJual",()=>loadRiwayatJual,value=>loadRiwayatJual=value);
__f4.expose("v7CancelSale",()=>v7CancelSale,value=>v7CancelSale=value);
__f4.expose("v7EnsureSaleReason",()=>v7EnsureSaleReason,value=>v7EnsureSaleReason=value);
__f4.expose("submitSale",()=>submitSale,value=>submitSale=value);
__f4.expose("loadRekonsiliasi",()=>loadRekonsiliasi,value=>loadRekonsiliasi=value);
__f4.expose("loadProgress",()=>loadProgress,value=>loadProgress=value);
__f4.expose("loadAccounts",()=>loadAccounts,value=>loadAccounts=value);
__f4.expose("resetDefault",()=>resetDefault,value=>resetDefault=value);
__f4.expose("provisionAll",()=>provisionAll,value=>provisionAll=value);
__f4.expose("showCredential",()=>showCredential,value=>showCredential=value);
__f4.expose("closeCredential",()=>closeCredential,value=>closeCredential=value);
__f4.expose("copyCredential",()=>copyCredential,value=>copyCredential=value);
__f4.expose("v8PreviewData",()=>v8PreviewData,value=>v8PreviewData=value);
__f4.expose("v8ValidatedBatch",()=>v8ValidatedBatch,value=>v8ValidatedBatch=value);
__f4.expose("v8PendingBatch",()=>v8PendingBatch,value=>v8PendingBatch=value);
__f4.expose("v8Setup",()=>v8Setup,value=>v8Setup=value);
__f4.expose("v8LoadBatches",()=>v8LoadBatches,value=>v8LoadBatches=value);
__f4.expose("v8Preview",()=>v8Preview,value=>v8Preview=value);
__f4.expose("v8Recalculate",()=>v8Recalculate,value=>v8Recalculate=value);
__f4.expose("v8IsiSisa",()=>v8IsiSisa,value=>v8IsiSisa=value);
__f4.expose("v8Confirm",()=>v8Confirm,value=>v8Confirm=value);
__f4.expose("v9Nonce",()=>v9Nonce,value=>v9Nonce=value);
__f4.expose("v9Members",()=>v9Members,value=>v9Members=value);
__f4.expose("v9Setup",()=>v9Setup,value=>v9Setup=value);
__f4.expose("v28SetupSaldoFinder",()=>v28SetupSaldoFinder,value=>v28SetupSaldoFinder=value);
__f4.expose("v9RenderKas",()=>v9RenderKas,value=>v9RenderKas=value);
__f4.expose("v9Load",()=>v9Load,value=>v9Load=value);
__f4.expose("v9ShowBalance",()=>v9ShowBalance,value=>v9ShowBalance=value);
__f4.expose("v9PostCash",()=>v9PostCash,value=>v9PostCash=value);
__f4.expose("v9Cairkan",()=>v9Cairkan,value=>v9Cairkan=value);
__f4.expose("v10Nonce",()=>v10Nonce,value=>v10Nonce=value);
__f4.expose("v10ReportData",()=>v10ReportData,value=>v10ReportData=value);
__f4.expose("v10Setup",()=>v10Setup,value=>v10Setup=value);
__f4.expose("v10TypeChange",()=>v10TypeChange,value=>v10TypeChange=value);
__f4.expose("v10Calc",()=>v10Calc,value=>v10Calc=value);
__f4.expose("v10LoadBiaya",()=>v10LoadBiaya,value=>v10LoadBiaya=value);
__f4.expose("v10SaveExpense",()=>v10SaveExpense,value=>v10SaveExpense=value);
__f4.expose("v10LoadReport",()=>v10LoadReport,value=>v10LoadReport=value);
__f4.expose("v10Specs",()=>v10Specs,null);
__f4.expose("v10SelectedSections",()=>v10SelectedSections,value=>v10SelectedSections=value);
__f4.expose("v10ReportGridUnits",()=>v10ReportGridUnits,null);
__f4.expose("v10ReportGridSix",()=>v10ReportGridSix,null);
__f4.expose("v10ReportGridFive",()=>v10ReportGridFive,null);
__f4.expose("v10ReportOrder",()=>v10ReportOrder,null);
__f4.expose("v10ReportFields",()=>v10ReportFields,value=>v10ReportFields=value);
__f4.expose("f4BankPeriodGroups",()=>f4BankPeriodGroups,value=>f4BankPeriodGroups=value);
__f4.expose("f4BankPeriodHeading",()=>f4BankPeriodHeading,value=>f4BankPeriodHeading=value);
__f4.expose("v10MakeTable",()=>v10MakeTable,value=>v10MakeTable=value);
__f4.expose("f4BankMakeCodeLegend",()=>f4BankMakeCodeLegend,value=>f4BankMakeCodeLegend=value);
__f4.expose("v10MakeCodeLegend",()=>v10MakeCodeLegend,value=>v10MakeCodeLegend=value);
__f4.expose("v10RenderReport",()=>v10RenderReport,value=>v10RenderReport=value);
__f4.expose("v10PrintReport",()=>v10PrintReport,value=>v10PrintReport=value);
__f4.expose("v10DownloadCSV",()=>v10DownloadCSV,value=>v10DownloadCSV=value);
__f4.expose("v11Albums",()=>v11Albums,value=>v11Albums=value);
__f4.expose("v11Setup",()=>v11Setup,value=>v11Setup=value);
__f4.expose("v11ShowPublic",()=>v11ShowPublic,value=>v11ShowPublic=value);
__f4.expose("v11ShowLogin",()=>v11ShowLogin,value=>v11ShowLogin=value);
__f4.expose("v11External",()=>v11External,value=>v11External=value);
__f4.expose("v11Tile",()=>v11Tile,value=>v11Tile=value);
__f4.expose("v11AttachImage",()=>v11AttachImage,value=>v11AttachImage=value);
__f4.expose("v11LoadPublic",()=>v11LoadPublic,value=>v11LoadPublic=value);
__f4.expose("v11RenderAlbums",()=>v11RenderAlbums,value=>v11RenderAlbums=value);
__f4.expose("v11OpenAlbum",()=>v11OpenAlbum,value=>v11OpenAlbum=value);
__f4.expose("v11SaveProgress",()=>v11SaveProgress,value=>v11SaveProgress=value);
__f4.expose("v11LoadAlbums",()=>v11LoadAlbums,value=>v11LoadAlbums=value);
__f4.expose("v11SaveAlbum",()=>v11SaveAlbum,value=>v11SaveAlbum=value);
__f4.expose("v11SaveMedia",()=>v11SaveMedia,value=>v11SaveMedia=value);
__f4.expose("v11LoadInventory",()=>v11LoadInventory,value=>v11LoadInventory=value);
__f4.expose("v11SaveInventory",()=>v11SaveInventory,value=>v11SaveInventory=value);
__f4.expose("v12Data",()=>v12Data,value=>v12Data=value);
__f4.expose("v12Show",()=>v12Show,null);
__f4.expose("v12Go",()=>v12Go,null);
__f4.expose("v12Auth",()=>v12Auth,null);
__f4.expose("v12Setup",()=>v12Setup,value=>v12Setup=value);
__f4.expose("f4MemberDateID",()=>f4MemberDateID,value=>f4MemberDateID=value);
__f4.expose("v12Table",()=>v12Table,value=>v12Table=value);
__f4.expose("v12Kg",()=>v12Kg,null);
__f4.expose("f4MemberDepositDisplay",()=>f4MemberDepositDisplay,value=>f4MemberDepositDisplay=value);
__f4.expose("v12Load",()=>v12Load,value=>v12Load=value);
__f4.expose("v12PrintOldestFirst",()=>v12PrintOldestFirst,null);
__f4.expose("v12ConfirmedItemKg",()=>v12ConfirmedItemKg,value=>v12ConfirmedItemKg=value);
__f4.expose("v12MakeItemMatrix",()=>v12MakeItemMatrix,value=>v12MakeItemMatrix=value);
__f4.expose("v12Print",()=>v12Print,value=>v12Print=value);
__f4.expose("v12CSV",()=>v12CSV,value=>v12CSV=value);
__f4.expose("v13ShowAccount",()=>v13ShowAccount,null);
__f4.expose("v13GoPage",()=>v13GoPage,null);
__f4.expose("v13ShowPublicOld",()=>v13ShowPublicOld,null);
__f4.expose("v13ShowAuthOld",()=>v13ShowAuthOld,null);
__f4.expose("v13GroupNav",()=>v13GroupNav,value=>v13GroupNav=value);
__f4.expose("v13HighlightGroups",()=>v13HighlightGroups,value=>v13HighlightGroups=value);
__f4.expose("v13PublicButton",()=>v13PublicButton,value=>v13PublicButton=value);
__f4.expose("v14Setup",()=>v14Setup,value=>v14Setup=value);
__f4.expose("f4CompactSummaryAmount",()=>f4CompactSummaryAmount,value=>f4CompactSummaryAmount=value);
__f4.expose("v10CompactSummaryMetric",()=>v10CompactSummaryMetric,value=>v10CompactSummaryMetric=value);
__f4.expose("v14Stat",()=>v14Stat,value=>v14Stat=value);
__f4.expose("v14ExtraStat",()=>v14ExtraStat,value=>v14ExtraStat=value);
__f4.expose("v14RecentTable",()=>v14RecentTable,value=>v14RecentTable=value);
__f4.expose("v14WeightTrend",()=>v14WeightTrend,value=>v14WeightTrend=value);
__f4.expose("v37MemberWeightChart",()=>v37MemberWeightChart,value=>v37MemberWeightChart=value);
__f4.expose("v14LoadDashboard",()=>v14LoadDashboard,value=>v14LoadDashboard=value);
__f4.expose("v14Activities",()=>v14Activities,value=>v14Activities=value);
__f4.expose("v15AvatarData",()=>v15AvatarData,value=>v15AvatarData=value);
__f4.expose("v15PendingFile",()=>v15PendingFile,value=>v15PendingFile=value);
__f4.expose("v15ShowAccountOld",()=>v15ShowAccountOld,null);
__f4.expose("v15ShowPublicOld",()=>v15ShowPublicOld,null);
__f4.expose("v15ShowAuthOld",()=>v15ShowAuthOld,null);
__f4.expose("v15SetupProfile",()=>v15SetupProfile,value=>v15SetupProfile=value);
__f4.expose("v15UpdateAccount",()=>v15UpdateAccount,value=>v15UpdateAccount=value);
__f4.expose("v15PaintAvatar",()=>v15PaintAvatar,value=>v15PaintAvatar=value);
__f4.expose("v15LoadAvatar",()=>v15LoadAvatar,value=>v15LoadAvatar=value);
__f4.expose("v15SaveAvatar",()=>v15SaveAvatar,value=>v15SaveAvatar=value);
__f4.expose("v15UpdatePublicButton",()=>v15UpdatePublicButton,value=>v15UpdatePublicButton=value);
__f4.expose("v16AdminSidebar",()=>v16AdminSidebar,null);
__f4.expose("v16Groups",()=>v16Groups,null);
__f4.expose("v16SvgPaths",()=>v16SvgPaths,null);
__f4.expose("v16LogoURL",()=>v16LogoURL,null);
__f4.expose("v16PrevShow",()=>v16PrevShow,null);
__f4.expose("v16PrevGo",()=>v16PrevGo,null);
__f4.expose("v16PrevAuth",()=>v16PrevAuth,null);
__f4.expose("v16PrevPublic",()=>v16PrevPublic,null);
__f4.expose("v16PrevToggle",()=>v16PrevToggle,null);
__f4.expose("v16CloseMenu",()=>v16CloseMenu,value=>v16CloseMenu=value);
__f4.expose("v16Icon",()=>v16Icon,value=>v16Icon=value);
__f4.expose("v16BuildNav",()=>v16BuildNav,value=>v16BuildNav=value);
__f4.expose("v16Sync",()=>v16Sync,value=>v16Sync=value);
__f4.expose("v17PrevShow",()=>v17PrevShow,null);
__f4.expose("v17PrevGo",()=>v17PrevGo,null);
__f4.expose("v17PrevPublic",()=>v17PrevPublic,null);
__f4.expose("v17PrevAuth",()=>v17PrevAuth,null);
__f4.expose("v17State",()=>v17State,value=>v17State=value);
__f4.expose("v17SetupFinance",()=>v17SetupFinance,value=>v17SetupFinance=value);
__f4.expose("v17Kpi",()=>v17Kpi,value=>v17Kpi=value);
__f4.expose("v17Label",()=>v17Label,value=>v17Label=value);
__f4.expose("v17Chart",()=>v17Chart,value=>v17Chart=value);
__f4.expose("v17LoadFinance",()=>v17LoadFinance,value=>v17LoadFinance=value);
__f4.expose("v17Logo",()=>v17Logo,null);
__f4.expose("v17SetupPublic",()=>v17SetupPublic,value=>v17SetupPublic=value);
__f4.expose("v17PublicAccount",()=>v17PublicAccount,value=>v17PublicAccount=value);
__f4.expose("v17PublicAccountClick",()=>v17PublicAccountClick,value=>v17PublicAccountClick=value);
__f4.expose("v17PublicStat",()=>v17PublicStat,value=>v17PublicStat=value);
__f4.expose("v17PublicWasteIcon",()=>v17PublicWasteIcon,value=>v17PublicWasteIcon=value);
__f4.expose("v17WasteBubble",()=>v17WasteBubble,value=>v17WasteBubble=value);
__f4.expose("v17WasteBubbleTrigger",()=>v17WasteBubbleTrigger,value=>v17WasteBubbleTrigger=value);
__f4.expose("v17CloseWasteBubble",()=>v17CloseWasteBubble,value=>v17CloseWasteBubble=value);
__f4.expose("v17PlaceWasteBubble",()=>v17PlaceWasteBubble,value=>v17PlaceWasteBubble=value);
__f4.expose("v17EnsureWasteBubble",()=>v17EnsureWasteBubble,value=>v17EnsureWasteBubble=value);
__f4.expose("v17OpenWasteBubble",()=>v17OpenWasteBubble,value=>v17OpenWasteBubble=value);
__f4.expose("v17RenderPublicWaste",()=>v17RenderPublicWaste,value=>v17RenderPublicWaste=value);
__f4.expose("v17AlbumCard",()=>v17AlbumCard,value=>v17AlbumCard=value);
__f4.expose("v17PublicChartMode",()=>v17PublicChartMode,value=>v17PublicChartMode=value);
__f4.expose("v17PublicChartRange",()=>v17PublicChartRange,value=>v17PublicChartRange=value);
__f4.expose("v17PublicChartRows",()=>v17PublicChartRows,value=>v17PublicChartRows=value);
__f4.expose("v17PublicDailyRows",()=>v17PublicDailyRows,value=>v17PublicDailyRows=value);
__f4.expose("v17PublicChartSource",()=>v17PublicChartSource,value=>v17PublicChartSource=value);
__f4.expose("v17PublicReportReady",()=>v17PublicReportReady,value=>v17PublicReportReady=value);
__f4.expose("v17PublicReportFailed",()=>v17PublicReportFailed,value=>v17PublicReportFailed=value);
__f4.expose("v17PublicLoadSerial",()=>v17PublicLoadSerial,value=>v17PublicLoadSerial=value);
__f4.expose("v17ProgressCount",()=>v17ProgressCount,value=>v17ProgressCount=value);
__f4.expose("f4DevUnit",()=>f4DevUnit,value=>f4DevUnit=value);
__f4.expose("f4DevShort",()=>f4DevShort,value=>f4DevShort=value);
__f4.expose("f4DevTodayWib",()=>f4DevTodayWib,value=>f4DevTodayWib=value);
__f4.expose("f4DevDataRows",()=>f4DevDataRows,value=>f4DevDataRows=value);
__f4.expose("f4DevMakeStat",()=>f4DevMakeStat,value=>f4DevMakeStat=value);
__f4.expose("v17RenderPublicChart",()=>v17RenderPublicChart,value=>v17RenderPublicChart=value);
__f4.expose("v17BindPublicChart",()=>v17BindPublicChart,value=>v17BindPublicChart=value);
__f4.expose("f4PublicInsightHome",()=>f4PublicInsightHome,value=>f4PublicInsightHome=value);
__f4.expose("f4PublicTrendMode",()=>f4PublicTrendMode,value=>f4PublicTrendMode=value);
__f4.expose("f4PublicNum",()=>f4PublicNum,null);
__f4.expose("f4PublicKg",()=>f4PublicKg,null);
__f4.expose("f4PublicColors",()=>f4PublicColors,null);
__f4.expose("f4PublicRenderInsights",()=>f4PublicRenderInsights,value=>f4PublicRenderInsights=value);
__f4.expose("scheduleReadUntil",()=>scheduleReadUntil,value=>scheduleReadUntil=value);
__f4.expose("refreshPublicSchedule",()=>refreshPublicSchedule,value=>refreshPublicSchedule=value);
__f4.expose("v17LoadPublic",()=>v17LoadPublic,value=>v17LoadPublic=value);
__f4.expose("v18PrevShow",()=>v18PrevShow,null);
__f4.expose("v18PrevPublic",()=>v18PrevPublic,null);
__f4.expose("v18PrevAuth",()=>v18PrevAuth,null);
__f4.expose("v18PreparePrivate",()=>v18PreparePrivate,value=>v18PreparePrivate=value);
__f4.expose("v18AddEyes",()=>v18AddEyes,value=>v18AddEyes=value);
__f4.expose("v18DepositHistoryCard",()=>v18DepositHistoryCard,value=>v18DepositHistoryCard=value);
__f4.expose("v18SaleHistoryCard",()=>v18SaleHistoryCard,value=>v18SaleHistoryCard=value);
__f4.expose("v18OldHistoryCard",()=>v18OldHistoryCard,null);
__f4.expose("v18PreparePublic",()=>v18PreparePublic,value=>v18PreparePublic=value);
__f4.expose("v18TogglePublic",()=>v18TogglePublic,value=>v18TogglePublic=value);
__f4.expose("v18ClosePublic",()=>v18ClosePublic,value=>v18ClosePublic=value);
__f4.expose("v19OldShowPublic",()=>v19OldShowPublic,null);
__f4.expose("v19OldPublicAccount",()=>v19OldPublicAccount,null);
__f4.expose("v19SyncAccountFooter",()=>v19SyncAccountFooter,value=>v19SyncAccountFooter=value);
__f4.expose("v19PreparePublic",()=>v19PreparePublic,value=>v19PreparePublic=value);
__f4.expose("v19ScrollSpyInstalled",()=>v19ScrollSpyInstalled,value=>v19ScrollSpyInstalled=value);
__f4.expose("v19ScrollSpyFrame",()=>v19ScrollSpyFrame,value=>v19ScrollSpyFrame=value);
__f4.expose("v19PublicSections",()=>v19PublicSections,null);
__f4.expose("v19ScheduleScrollSpy",()=>v19ScheduleScrollSpy,value=>v19ScheduleScrollSpy=value);
__f4.expose("v19SetupScrollSpy",()=>v19SetupScrollSpy,value=>v19SetupScrollSpy=value);
__f4.expose("v20SetupMedia",()=>v20SetupMedia,value=>v20SetupMedia=value);
__f4.expose("v20MediaTypeChange",()=>v20MediaTypeChange,value=>v20MediaTypeChange=value);
__f4.expose("v21Albums",()=>v21Albums,value=>v21Albums=value);
__f4.expose("v21OpenedAlbum",()=>v21OpenedAlbum,value=>v21OpenedAlbum=value);
__f4.expose("v21MediaIndex",()=>v21MediaIndex,value=>v21MediaIndex=value);
__f4.expose("v21Node",()=>v21Node,value=>v21Node=value);
__f4.expose("v21IconNode",()=>v21IconNode,value=>v21IconNode=value);
__f4.expose("v21ImageSrc",()=>v21ImageSrc,value=>v21ImageSrc=value);
__f4.expose("v21Photo",()=>v21Photo,value=>v21Photo=value);
__f4.expose("v21PrepareSections",()=>v21PrepareSections,value=>v21PrepareSections=value);
__f4.expose("v21PublicFeedPhotos",()=>v21PublicFeedPhotos,value=>v21PublicFeedPhotos=value);
__f4.expose("v21RenderAlbumCover",()=>v21RenderAlbumCover,value=>v21RenderAlbumCover=value);
__f4.expose("v21InventoryRow",()=>v21InventoryRow,value=>v21InventoryRow=value);
__f4.expose("v21NotifyOverlay",()=>v21NotifyOverlay,value=>v21NotifyOverlay=value);
__f4.expose("v21EnsureModals",()=>v21EnsureModals,value=>v21EnsureModals=value);
__f4.expose("v21ShowModal",()=>v21ShowModal,value=>v21ShowModal=value);
__f4.expose("v21CloseGallery",()=>v21CloseGallery,value=>v21CloseGallery=value);
__f4.expose("v21ShowAlbumArchive",()=>v21ShowAlbumArchive,value=>v21ShowAlbumArchive=value);
__f4.expose("v21DriveFolderCache",()=>v21DriveFolderCache,null);
__f4.expose("v21FolderId",()=>v21FolderId,value=>v21FolderId=value);
__f4.expose("v21CleanAlbumDescription",()=>v21CleanAlbumDescription,value=>v21CleanAlbumDescription=value);
__f4.expose("v21DriveMedia",()=>v21DriveMedia,value=>v21DriveMedia=value);
__f4.expose("v21ReadDriveFolder",()=>v21ReadDriveFolder,value=>v21ReadDriveFolder=value);
__f4.expose("v21LegacyAlbum",()=>v21LegacyAlbum,value=>v21LegacyAlbum=value);
__f4.expose("v21OpenAlbum",()=>v21OpenAlbum,value=>v21OpenAlbum=value);
__f4.expose("v21SocialSerial",()=>v21SocialSerial,value=>v21SocialSerial=value);
__f4.expose("v21SocialPhotoId",()=>v21SocialPhotoId,null);
__f4.expose("v21SocialRequest",()=>v21SocialRequest,value=>v21SocialRequest=value);
__f4.expose("v21LoadSocial",()=>v21LoadSocial,value=>v21LoadSocial=value);
__f4.expose("v21SocialAction",()=>v21SocialAction,value=>v21SocialAction=value);
__f4.expose("v21OpenLightbox",()=>v21OpenLightbox,value=>v21OpenLightbox=value);
__f4.expose("v21PublicMP4Ids",()=>v21PublicMP4Ids,null);
__f4.expose("v21VideoSource",()=>v21VideoSource,value=>v21VideoSource=value);
__f4.expose("v21VideoClock",()=>v21VideoClock,null);
__f4.expose("v21VideoIcon",()=>v21VideoIcon,value=>v21VideoIcon=value);
__f4.expose("v21CreateVideoPlayer",()=>v21CreateVideoPlayer,value=>v21CreateVideoPlayer=value);
__f4.expose("v21TogglePhotoZoom",()=>v21TogglePhotoZoom,value=>v21TogglePhotoZoom=value);
__f4.expose("v21PaintLightbox",()=>v21PaintLightbox,value=>v21PaintLightbox=value);
__f4.expose("v21ShiftMedia",()=>v21ShiftMedia,value=>v21ShiftMedia=value);
__f4.expose("v21CloseLightbox",()=>v21CloseLightbox,value=>v21CloseLightbox=value);
__f4.expose("v21ShowInventory",()=>v21ShowInventory,value=>v21ShowInventory=value);
__f4.expose("v22Categories",()=>v22Categories,null);
__f4.expose("v22Query",()=>v22Query,value=>v22Query=value);
__f4.expose("v23CategoryLabel",()=>v23CategoryLabel,value=>v23CategoryLabel=value);
__f4.expose("v23CategoryValue",()=>v23CategoryValue,value=>v23CategoryValue=value);
__f4.expose("v22SetupAdmin",()=>v22SetupAdmin,value=>v22SetupAdmin=value);
__f4.expose("v22RenderAlbumAdmin",()=>v22RenderAlbumAdmin,value=>v22RenderAlbumAdmin=value);
__f4.expose("v22SetupDocs",()=>v22SetupDocs,value=>v22SetupDocs=value);
__f4.expose("v22OpenDocs",()=>v22OpenDocs,value=>v22OpenDocs=value);
__f4.expose("v22BackHome",()=>v22BackHome,value=>v22BackHome=value);
__f4.expose("v22AlbumMedia",()=>v22AlbumMedia,value=>v22AlbumMedia=value);
__f4.expose("v22OpenFeedMedia",()=>v22OpenFeedMedia,value=>v22OpenFeedMedia=value);
__f4.expose("v22RenderDocs",()=>v22RenderDocs,value=>v22RenderDocs=value);
__f4.expose("v23NormalizeSearch",()=>v23NormalizeSearch,value=>v23NormalizeSearch=value);
__f4.expose("v23RenderAccounts",()=>v23RenderAccounts,value=>v23RenderAccounts=value);
__f4.expose("v24EditingId",()=>v24EditingId,value=>v24EditingId=value);
__f4.expose("v24ProgressRows",()=>v24ProgressRows,value=>v24ProgressRows=value);
__f4.expose("v24EnsureEditor",()=>v24EnsureEditor,value=>v24EnsureEditor=value);
__f4.expose("v24CloseEditor",()=>v24CloseEditor,value=>v24CloseEditor=value);
__f4.expose("v24OpenEditor",()=>v24OpenEditor,value=>v24OpenEditor=value);
__f4.expose("v24SaveProgress",()=>v24SaveProgress,value=>v24SaveProgress=value);
__f4.expose("v25ShowProgress",()=>v25ShowProgress,value=>v25ShowProgress=value);
__f4.expose("v17ProgressItems",()=>v17ProgressItems,value=>v17ProgressItems=value);
__f4.expose("v17ShowAllProgress",()=>v17ShowAllProgress,value=>v17ShowAllProgress=value);
__f4.expose("f4DevStatusKind",()=>f4DevStatusKind,value=>f4DevStatusKind=value);
__f4.expose("v25RenderTimeline",()=>v25RenderTimeline,value=>v25RenderTimeline=value);
__f4.expose("v25PreviewURL",()=>v25PreviewURL,value=>v25PreviewURL=value);
__f4.expose("v25AttachPreview",()=>v25AttachPreview,value=>v25AttachPreview=value);
__f4.expose("v25OldOpenEditor",()=>v25OldOpenEditor,null);
__f4.expose("v26OldShowAuth",()=>v26OldShowAuth,null);
__f4.expose("v27SetupCancel",()=>v27SetupCancel,value=>v27SetupCancel=value);
__f4.expose("v27LoadFinal",()=>v27LoadFinal,value=>v27LoadFinal=value);
__f4.expose("v27CancelBatch",()=>v27CancelBatch,value=>v27CancelBatch=value);
__f4.expose("v27OldGoPage",()=>v27OldGoPage,null);
__f4.expose("v27AlbumPhotoPicker",()=>v27AlbumPhotoPicker,value=>v27AlbumPhotoPicker=value);
__f4.expose("v27OldOpenEditor",()=>v27OldOpenEditor,null);
__f4.expose("v27PrintNode",()=>v27PrintNode,value=>v27PrintNode=value);
__f4.expose("v29Styles",()=>v29Styles,null);
__f4.expose("v29Kop",()=>v29Kop,value=>v29Kop=value);
__f4.expose("v31SetupScrollTop",()=>v31SetupScrollTop,value=>v31SetupScrollTop=value);
__f4.expose("v29SetupAudit",()=>v29SetupAudit,value=>v29SetupAudit=value);
__f4.expose("v29OldSetup",()=>v29OldSetup,null);
__f4.expose("v29OldLoad",()=>v29OldLoad,null);
__f4.expose("v36PrintLogoPng",()=>v36PrintLogoPng,value=>v36PrintLogoPng=value);
__f4.expose("v36PrintLogoTask",()=>v36PrintLogoTask,value=>v36PrintLogoTask=value);
__f4.expose("v36PreparePrintLogo",()=>v36PreparePrintLogo,value=>v36PreparePrintLogo=value);
__f4.expose("v36BankPrint",()=>v36BankPrint,value=>v36BankPrint=value);
__f4.expose("v29OldMemberPrint",()=>v29OldMemberPrint,null);
__f4.expose("v37IndividualTrend",()=>v37IndividualTrend,value=>v37IndividualTrend=value);
__f4.expose("v37IndividualTable",()=>v37IndividualTable,value=>v37IndividualTable=value);
__f4.expose("v37MemberChoicesTask",()=>v37MemberChoicesTask,value=>v37MemberChoicesTask=value);
__f4.expose("v37FillMemberChoices",()=>v37FillMemberChoices,value=>v37FillMemberChoices=value);
__f4.expose("v37PrintIndividual",()=>v37PrintIndividual,value=>v37PrintIndividual=value);
__f4.expose("v33SetupReportControls",()=>v33SetupReportControls,value=>v33SetupReportControls=value);

  const $=id=>__f4.globals.document.getElementById(id);
  // D1 date-only transactions follow the Indonesia business calendar, not UTC.
  // UTC's ISO date lags one day in Jakarta between 00:00 and 06:59.
  const bankLocalToday=()=>{
    const p=__f4.globals.Object.fromEntries(new __f4.globals.Intl.DateTimeFormat('en-US',{
      timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'
    }).formatToParts(new __f4.globals.Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return p.year+'-'+p.month+'-'+p.day;
  };
  __f4.globals.sessionStorage.removeItem('bs4_session');
  let token=__f4.globals.sessionStorage.getItem('bs4_session')||'',profile=null,accounts=[],currentCredential=null,setCatalog=[],setNonce='',setEditId='',setEditPayload=null,saleCatalog=[],saleNonce='';
  function note(target,message,error=false){const e=$(target);if(!e)return;e.textContent=message||'';e.className=message?'notice'+(error?' error':''):'';e.hidden=!message;e.dataset.f4State=message?'notice':'success';}
  function call(name,...args){
    // Satu jalur transaksi: bridge Cloudflare/D1.
    return __f4.globals.Promise.resolve().then(()=>{
      if(name==='authLogout')return {ok:true};
      if(name==='authLogin')throw (0,__f4.globals.Error)('Masuk melalui tombol LOGIN pada portal terpadu.');
      if(name==='authMe')throw (0,__f4.globals.Error)('Gunakan akun dari portal terpadu.');
      if(typeof __f4.window.__f4BankDemoCall!=='function')throw (0,__f4.globals.Error)('Koneksi layanan belum tersedia.');
      return __f4.window.__f4BankDemoCall(name,args);
    });
  }
  function busy(form,active){form.querySelectorAll('button').forEach(b=>b.disabled=active);}
  function showAuth(){profile=null;token='';__f4.globals.sessionStorage.removeItem('bs4_session');$('dashboardView').classList.add('hidden');$('authView').classList.remove('hidden');}
  function showDashboard(p){profile=p;$('authView').classList.add('hidden');$('dashboardView').classList.remove('hidden');$('greeting').textContent='Halo, '+(p.peran==='Admin'?p.nama:f4BankDisplayWargaName(p.nama));$('roleBadge').textContent=p.peran;$('pName').textContent=p.nama;$('pHome').textContent=p.rumah||'—';$('pId').textContent=(0,__f4.globals.String)(p.wargaId||'Administrator').replace(/^member:/i,'');$('pageProfile').querySelector('.f4-profile-meta').hidden=p.peran==='Warga';if(!$('navRiwayatJual')){const btn=__f4.globals.document.createElement('button');btn.id='navRiwayatJual';btn.className='secondary';btn.textContent='Riwayat penjualan';btn.onclick=()=>goPage('riwayatJual');$('navPenjualan').after(btn);}v7EnsureSaleReason();v8Setup();v9Setup();v10Setup();v11Setup();$('v11Public').classList.add('hidden');['Admin','Master','Setoran','Riwayat','RiwayatJual','Penjualan','Rekonsiliasi','Pengesahan','Tabungan','Biaya','Laporan','Kegiatan','Dokumentasi','Inventaris'].forEach(id=>$('nav'+id).classList.toggle('hidden',p.peran!=='Admin'));goPage('dashboard');}
  function goPage(page){if(['admin','master','setoran','riwayat','riwayatJual','penjualan','rekonsiliasi','pengesahan','tabungan','biaya','laporan','kegiatan','dokumentasi','inventaris'].includes(page)&&(!profile||profile.peran!=='Admin'))return;['dashboard','profile','setoran','riwayat','riwayatJual','penjualan','rekonsiliasi','pengesahan','tabungan','biaya','laporan','kegiatan','dokumentasi','inventaris','master','admin','progress','password'].forEach(name=>{$('page'+name[0].toUpperCase()+name.slice(1)).classList.toggle('hidden',name!==page);$('nav'+name[0].toUpperCase()+name.slice(1)).classList.toggle('active',name===page)});$('sideNav').classList.remove('open');note('dashNotice','');if(page==='dashboard')loadDashboard();if(page==='admin')loadAccounts();if(page==='master')loadMaster();if(page==='progress')loadProgress();if(page==='setoran')loadSetoran();if(page==='riwayat')loadRiwayatV7();if(page==='riwayatJual')loadRiwayatJual();if(page==='penjualan')loadPenjualan();if(page==='rekonsiliasi')loadBatchRekon();if(page==='pengesahan')v8LoadBatches();if(page==='tabungan')v9Load();if(page==='biaya')v10LoadBiaya();if(page==='laporan')v10LoadReport();if(page==='dokumentasi')v11LoadAlbums();if(page==='inventaris')v11LoadInventory();}
  function toggleMenu(){$('sideNav').classList.toggle('open');}
  async function doLogin(e){e.preventDefault();busy(e.target,true);note('authNotice','Memeriksa akun...');try{const r=await call('authLogin',$('loginUser').value,$('loginPass').value);token=r.token;__f4.globals.sessionStorage.setItem('bs4_session',token);$('loginPass').value='';showDashboard(r.profil);}catch(e){note('authNotice',e.message||'Login gagal.',true);}finally{busy(e.target,false);}}
  async function doLogout(){const old=token;showAuth();try{await call('authLogout',old);}catch(e){/* Sesi lokal sudah dihapus. */}}
  async function doChangePassword(e){e.preventDefault();busy(e.target,true);try{const r=await call('authChangePassword',token,$('oldPass').value,$('newPass').value);e.target.reset();showAuth();__f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-account-password-updated'));if(__f4.window.parent!==window)__f4.window.parent.postMessage({type:'f4:auth-changed'},__f4.globals.location.origin);note('authNotice',r.pesan);}catch(e){note('dashNotice',e.message||'Gagal mengganti password.',true);}finally{busy(e.target,false);}}
  function cell(tr,value,label){const td=__f4.globals.document.createElement('td');td.dataset.label=label;td.textContent=value||'—';tr.appendChild(td);return td;}
  const rupiah=v=>'Rp '+(0,__f4.globals.Number)(v||0).toLocaleString('id-ID',{maximumFractionDigits:0});
  const kg=v=>(0,__f4.globals.Number)(v||0).toLocaleString('id-ID',{maximumFractionDigits:2})+' kg';
  // UI-only short names: keep registered names and transaction IDs unchanged.
  function f4BankDisplayWargaName(raw){
    const full=(0,__f4.globals.String)(raw||'').trim().replace(/\s+/g,' ');
    if(!full)return 'Nama warga belum tersedia';
    if(/^(?:nama (?:warga|anggota) (?:belum|tidak) tersedia|warga (?:tidak|belum) tersedia|anggota(?: bank sampah)?|—)$/i.test(full))return full;
    const words=full.split(' ');let title='Pak';
    while(words.length&&/^(?:pak|bapak|bpk|bp|bu|ibu)\.?$/i.test(words[0])){
      if(/^(?:bu|ibu)\.?$/i.test(words[0]))title='Bu';
      words.shift();
    }
    return words.length?title+' '+words[0]:full;
  }
  __f4.window.f4BankDisplayWargaName=f4BankDisplayWargaName;
  // One avatar rule for every Bank Sampah administrator screen.
  function f4BankPersonInitial(name,kind="resident"){
    const raw=(0,__f4.globals.String)(name||"").normalize("NFKC").replace(/\([^)]*\)/g," ").trim();
    const plain=kind==="resident"?raw.replace(/^(?:(?:pak|bapak|bpk|bp|bu|ibu|mas|mbak)\.?\s+)+/i,""):raw;
    const words=plain.match(/\p{L}[\p{L}\p{M}]*/gu)||[];
    if(!words.length)return "?";
    const a=__f4.globals.Array.from(words[0])[0];
    const b=kind==="buyer"&&words.length>1?__f4.globals.Array.from(words[words.length-1])[0]:"";
    return (a+b).toLocaleUpperCase("id-ID");
  }
  function f4BankPersonAvatar(name,{className="",kind="resident",memberId="",hasAvatar=false}={}){
    const avatar=__f4.globals.document.createElement("span");
    avatar.className=(className+" f4-bank-person-avatar").trim();
    avatar.setAttribute("aria-hidden","true");
    avatar.textContent=f4BankPersonInitial(name,kind);
    const raw=(0,__f4.globals.String)(name||"").normalize("NFKC").replace(/\([^)]*\)/g," ").trim();
    const plain=kind==="resident"?raw.replace(/^(?:(?:pak|bapak|bpk|bp|bu|ibu|mas|mbak)\.?\s+)+/i,""):raw;
    const seed=(plain.match(/\p{L}[\p{L}\p{M}]*/u)?.[0]||"warga").toLocaleLowerCase("id-ID");
    const palette=["#009788","#5969da","#43a047","#277fc6","#b452ba","#d94880","#eb6a48","#087b56"];
    let hash=0;for(const ch of seed)hash=(__f4.globals.Math.imul(hash,31)+ch.codePointAt(0))>>>0;
    avatar.style.setProperty("--f4-bank-person-bg",palette[hash%palette.length]);
    const id=(0,__f4.globals.String)(memberId||"").replace(/^member:/i,"").trim();
    if(hasAvatar&&/^[a-zA-Z0-9:_-]{1,128}$/.test(id)){
      const photo=__f4.globals.document.createElement("img");photo.alt="";
      photo.loading="lazy";photo.decoding="async";photo.referrerPolicy="no-referrer";
      photo.onerror=()=>photo.remove();
      photo.src="https://api.flamboyan4.web.id/api/v2/admin/bank/member-avatar?memberId="+(0,__f4.globals.encodeURIComponent)(id);
      avatar.append(photo);
    }
    return avatar;
  }
  function metric(label,value){const b=__f4.globals.document.createElement('div');b.className='metric';const small=__f4.globals.document.createElement('small');small.textContent=label;const strong=__f4.globals.document.createElement('strong');strong.textContent=value;b.append(small,strong);return b;}
  async function loadDashboard(){if(!profile)return;$('adminMetrics').classList.toggle('hidden',profile.peran!=='Admin');$('memberWelcome').classList.toggle('hidden',profile.peran==='Admin');if(profile.peran!=='Admin'){$('welcomeName').textContent=f4BankDisplayWargaName(profile.nama);$('welcomeHouse').textContent=profile.rumah||'—';$('welcomeId').textContent=profile.wargaId||'—';$('metricStatus').textContent='Informasi keuangan pribadi belum diaktifkan.';return;}const adminStatusToken=__f4.globals.F4Loading.begin('metricStatus','Memuat ringkasan Bank Sampah…');try{const d=await call('bsDashboardAdmin',token);const list=[['Anggota aktif',d.wargaAktif],['Jenis barang aktif',d.jenisBarangAktif],['Total berat setoran',kg(d.beratSetoranKg)],['Setoran',d.jumlahSetoran],['Perkiraan belum sah',rupiah(d.estimasiSetoranRp)],['Penjualan lapak',d.jumlahPenjualan],['Berat terjual',kg(d.beratPenjualanKg)],['Diterima dari lapak',rupiah(d.diterimaLapakRp)],['Riwayat tabungan tercatat',rupiah(d.netMutasiTabunganRp)],['Net kas tercatat',rupiah(d.netKasRp)]];$('metricGrid').replaceChildren(...list.map(([l,v])=>metric(l,v)));$('dashboardWarnings').textContent=d.tarifBelumDitetapkan+' jenis barang masih belum memiliki Tarif Warga Aktif. Nilai estimasi tidak sama dengan tabungan terkonfirmasi.';__f4.globals.F4Loading.success('metricStatus',adminStatusToken);}catch(e){__f4.globals.F4Loading.error('metricStatus','Gagal mengambil dashboard: '+(e.message||e),adminStatusToken);}}
  async function loadMaster(){
    const area=$('masterList'),previous=$('f4MasterSearch')?.value||'';
    area.textContent='Memuat harga...';
    try{
      const data=await call('bsDashboardMasterBarang',token);
      const wrap=__f4.globals.document.createElement('div');
      const tools=__f4.globals.document.createElement('div');tools.className='f4-master-tools';
      const field=__f4.globals.document.createElement('div');field.className='f4-master-search';
      field.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
      const search=__f4.globals.document.createElement('input');search.id='f4MasterSearch';search.type='search';search.placeholder='Cari jenis sampah';search.setAttribute('aria-label','Cari jenis sampah');
      const count=__f4.globals.document.createElement('span');count.id='f4MasterCount';
      const list=__f4.globals.document.createElement('div');list.className='f4-master-rows';
      const normalize=x=>(0,__f4.globals.String)(x||'').toLocaleLowerCase('id-ID').trim();
      // Open only categories deliberately selected by the user.
      // Search can expand matching categories temporarily without altering this choice.
      const expandedCategories=new __f4.globals.Set();
      function draw(){
        const query=normalize(search.value);
        const rows=data.filter(b=>!query||[b.nama,b.kode,b.kelompok].some(v=>normalize(v).includes(query)));
        count.textContent=rows.length+' jenis';
        list.replaceChildren();
        const grouped=new __f4.globals.Map();
        const categoryOrder=['Kertas','Plastik','Logam','Campuran'];
        const categoryOf=raw=>{
          const name=normalize(raw);
          if(name==='kertas')return 'Kertas';
          if(name==='plastik')return 'Plastik';
          if(name==='logam')return 'Logam';
          if(name==='campuran'||name==='umum')return 'Campuran';
          return 'Lainnya';
        };
        rows.forEach(b=>{
          const category=categoryOf(b.kelompok);
          let group=grouped.get(category);
          if(!group){
            const section=__f4.globals.document.createElement('details');section.className='f4-master-group';
            section.dataset.category=category;
            section.open=(0,__f4.globals.Boolean)(query)||expandedCategories.has(category);
            const head=__f4.globals.document.createElement('summary');head.className='f4-master-group-heading';
            head.setAttribute('aria-label','Lihat jenis sampah kategori '+category);
            const label=__f4.globals.document.createElement('h3');label.textContent=category;
            const meta=__f4.globals.document.createElement('span');meta.className='f4-master-group-meta';
            const number=__f4.globals.document.createElement('span');number.className='f4-master-group-count';
            const arrow=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
            arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('fill','none');
            arrow.setAttribute('stroke-width','2');arrow.setAttribute('stroke-linecap','round');
            arrow.setAttribute('stroke-linejoin','round');arrow.setAttribute('aria-hidden','true');
            arrow.classList.add('f4-master-group-chevron');
            arrow.innerHTML='<path d="m9 5 7 7-7 7"/>';
            meta.append(number,arrow);head.append(label,meta);
            head.addEventListener('click',()=>{
              if(section.open)expandedCategories.delete(category);
              else expandedCategories.add(category);
            });
            const body=__f4.globals.document.createElement('div');body.className='f4-master-group-list';
            section.append(head,body);
            group={section,body,number,count:0};grouped.set(category,group);
          }
          group.number.textContent=++group.count+' jenis';
          const item=__f4.globals.document.createElement('details');item.className='f4-master-row';
          item.dataset.priced=(0,__f4.globals.String)((0,__f4.globals.Number)(b.tarif)>0);
          const summary=__f4.globals.document.createElement('summary');summary.className='f4-master-summary';
          const identity=__f4.globals.document.createElement('span');identity.className='f4-master-identity';
          const name=__f4.globals.document.createElement('strong');name.textContent=b.nama||'Barang';
          identity.append(name);
          const price=__f4.globals.document.createElement('span');price.className='f4-master-amount';
          const value=__f4.globals.document.createElement('strong');value.textContent=(0,__f4.globals.Number)(b.tarif)>0?rupiah(b.tarif)+'/kg':'Belum ada tarif';
          price.append(value);
          const arrow=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
          arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('fill','none');arrow.setAttribute('stroke-width','2');
          arrow.setAttribute('stroke-linecap','round');arrow.setAttribute('aria-hidden','true');arrow.classList.add('f4-master-chevron');arrow.innerHTML='<path d="m9 5 7 7-7 7"/>';
          summary.append(identity,price,arrow);
          const detail=__f4.globals.document.createElement('div');detail.className='f4-master-detail';
          const meta=__f4.globals.document.createElement('div');meta.className='f4-master-meta';
          const line=(label,value)=>{const box=__f4.globals.document.createElement('span'),small=__f4.globals.document.createElement('small');small.textContent=label;const bold=__f4.globals.document.createElement('strong');bold.textContent=(0,__f4.globals.String)(value||'—');box.append(small,bold);return box};
          meta.append(line('Harga lapak',rupiah(b.acuan)+'/kg'),line('Kode',b.kode),line('Status',b.status));
          const button=__f4.globals.document.createElement('button');button.type='button';button.textContent='Atur tarif';button.onclick=()=>editTarif(b);
          detail.append(meta,button);item.append(summary,detail);group.body.append(item);
        });
        for(const category of [...categoryOrder,...[...grouped.keys()].filter(x=>!categoryOrder.includes(x))]){
          const group=grouped.get(category);
          if(group)list.append(group.section);
        }
        if(!rows.length){const empty=__f4.globals.document.createElement('div');empty.className='f4-master-empty';empty.textContent='Barang tidak ditemukan.';list.append(empty);}
      }
      search.oninput=draw;search.value=previous;field.append(search);tools.append(field,count);
      wrap.append(tools,list);area.replaceChildren(wrap);draw();
    }catch(e){area.textContent='Gagal memuat harga barang: '+(e.message||e);}
  }
  async function editTarif(b){const raw=await __f4.window.f4UiDialog.prompt('Tarif SETORAN WARGA untuk '+b.nama+' (Rp per kg). Harga acuan lapak '+rupiah(b.acuan)+'.',b.tarif>0?(0,__f4.globals.String)(b.tarif):'');if(raw===null)return;const rate=(0,__f4.globals.Number)(raw);if(!__f4.globals.Number.isSafeInteger(rate)||rate<=0){__f4.window.f4UiDialog.alert('Masukkan tarif positif dalam rupiah bulat.');return;}if(!await __f4.window.f4UiDialog.confirm('Simpan tarif '+b.nama+' sebesar '+rupiah(rate)+'/kg? Tarif setoran yang sudah dicatat tidak berubah.'))return;try{await call('bsV5SimpanTarif',token,b.kode,rate);await loadMaster();note('dashNotice','Tarif '+b.nama+' berhasil disimpan.');}catch(e){note('dashNotice','Gagal menyimpan tarif: '+(e.message||e),true);}}
  async function editSetoran(r){
    if((0,__f4.globals.String)(r?.status)!=='Estimasi')return;
    try{
      const detail=await call('bsV32DetailSetoran',token,r.id);
      if(!detail?.deposit||detail.deposit.status!=='estimasi'||!__f4.globals.Array.isArray(detail.lines)||!detail.lines.length)
        throw (0,__f4.globals.Error)('Setoran tidak bisa diedit karena sudah diproses atau rincian tidak tersedia.');
      setEditId=(0,__f4.globals.String)(r.id);setEditPayload=detail;
      goPage('setoran');
      note('setoranNotice','Mode edit: ubah nama warga, tanggal, jenis atau berat lalu simpan koreksi.');
    }catch(e){note('riwayatNotice','Gagal membuka edit: '+(e.message||e),true)}
  }
  function applySetoranEdit(){
    const submit=$('saveSetoranBtn');if(!submit)return;
    let dismiss=$('f4SetEditDismiss');
    if(!setEditId||!setEditPayload){
      submit.textContent='Simpan setoran estimasi';dismiss?.remove();return;
    }
    const data=setEditPayload.deposit,lines=setEditPayload.lines;
    const id=(0,__f4.globals.String)(data.member_id||'').replace(/^member:/,'');
    if(![...$('setWarga').options].some(o=>o.value===id)){
      note('setoranNotice','Warga tidak tersedia dalam daftar anggota aktif.',true);return;
    }
    $('setWarga').value=id;$('setWarga').dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));
    $('setDate').value=(0,__f4.globals.String)(data.deposited_on||'');$('setDate').dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));
    const host=$('setBarang')?.querySelector('.f4-compact-rows');if(!host)return;
    host.replaceChildren();
    for(const item of lines){
      const code=(0,__f4.globals.String)(item.waste_item_id||'').replace(/^waste:/,'');
      if(!setCatalog.some(x=>x.kode===code)){
        note('setoranNotice','Jenis sampah lama tidak aktif. Koreksi otomatis tidak tersedia.',true);
        host.replaceChildren();addSetoranItemRow();return;
      }
      addSetoranItemRow();
      const row=host.lastElementChild;
      row.querySelector('select').value=code;
      row.querySelector('input[type=number]').value=(0,__f4.globals.String)((0,__f4.globals.Number)(item.grams)/1000);
    }
    previewSetoran();submit.textContent='Simpan koreksi setoran';
    if(!dismiss){
      dismiss=__f4.globals.document.createElement('button');dismiss.type='button';dismiss.id='f4SetEditDismiss';
      dismiss.className='secondary f4-set-edit-dismiss';dismiss.textContent='Batal edit';
      submit.before(dismiss);
    }
    dismiss.onclick=()=>{
      setEditId='';setEditPayload=null;$('setoranForm').reset();loadSetoran();
      note('setoranNotice','Mode edit dibatalkan.');
    };
  }
  async function loadSetoran(){const warga=$('setWarga'),barang=$('setBarang');barang.textContent='Memuat daftar barang...';warga.replaceChildren(new __f4.globals.Option('Pilih warga',''));$('setDate').value=$('setDate').value||bankLocalToday();$('setDate').dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));if(!setNonce)setNonce='N'+__f4.globals.Date.now().toString(36)+__f4.globals.Math.random().toString(36).slice(2,12);try{const [members,items]=await __f4.globals.Promise.all([call('bsV9SaldoAdmin',token),call('bsDashboardMasterBarang',token)]);const activeMembers=members.filter(w=>w.status==='Aktif'&&w.wargaId);activeMembers.sort((a,b)=>(0,__f4.globals.String)(a.rumah||'').localeCompare((0,__f4.globals.String)(b.rumah||''),'id',{numeric:true})||(0,__f4.globals.String)(a.nama||'').localeCompare((0,__f4.globals.String)(b.nama||''),'id'));activeMembers.forEach(w=>{const opt=new __f4.globals.Option(f4BankDisplayWargaName(w.nama)+' — '+w.rumah+' ('+w.wargaId+')',w.wargaId);opt.dataset.fullName=w.nama||'';warga.appendChild(opt)});if(!activeMembers.length)note('setoranNotice','Tidak ada anggota Bank Sampah aktif. Periksa data anggota terlebih dahulu.',true);setCatalog=items.filter(b=>b.status.toLowerCase()==='aktif');barang.replaceChildren();const list=__f4.globals.document.createElement('div');list.className='f4-compact-rows';barang.append(list);addSetoranItemRow();applySetoranEdit();}catch(e){barang.textContent='Gagal menyiapkan form: '+(e.message||e);}}
  function addSetoranItemRow(){
    const container=$('setBarang')?.querySelector('.f4-compact-rows');if(!container||container.children.length>=30)return;
    const row=__f4.globals.document.createElement('div');row.className='f4-compact-row';
    const type=__f4.globals.document.createElement('select');type.setAttribute('aria-label','Jenis sampah');
    type.add(new __f4.globals.Option('Pilih jenis',''));
    setCatalog.forEach(item=>{const opt=new __f4.globals.Option(item.nama+(item.tarif>0?'':' · tarif belum ada'),item.kode);opt.disabled=!(item.tarif>0);type.add(opt)});
    const weight=__f4.globals.document.createElement('input');weight.type='number';weight.min='0.001';weight.step='0.001';weight.max='10000';
    weight.placeholder='Kg';weight.setAttribute('aria-label','Berat sampah (kg)');
    const remove=__f4.globals.document.createElement('button');remove.type='button';remove.className='f4-compact-remove';
    remove.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';remove.title='Hapus jenis';remove.setAttribute('aria-label','Hapus jenis sampah');
    type.onchange=()=>{weight.value='';weight.setAttribute('aria-label','Berat '+(setCatalog.find(x=>x.kode===type.value)?.nama||'sampah')+' (kg)');previewSetoran()};
    weight.oninput=previewSetoran;
    remove.onclick=()=>{row.remove();if(!container.children.length)addSetoranItemRow();previewSetoran()};
    const amountGroup=__f4.globals.document.createElement('div');amountGroup.className='f4-compact-entry-group';
    amountGroup.append(weight,remove);
    row.append(type,amountGroup);container.append(row);previewSetoran();
  }
  function getSetItems(){return [...$('setBarang').querySelectorAll('.f4-compact-row')].map(row=>({kode:row.querySelector('select')?.value,berat:(0,__f4.globals.Number)(row.querySelector('input')?.value)})).filter(item=>item.kode&&item.berat>0);}
  function previewSetoran(){const items=getSetItems();$('setBarang').querySelectorAll('.f4-compact-row').forEach(row=>row.classList.toggle('f4-entry-filled',(0,__f4.globals.Number)(row.querySelector('input')?.value)>0));let kgTotal=0,rpTotal=0;items.forEach(item=>{const b=setCatalog.find(v=>v.kode===item.kode);kgTotal+=item.berat;rpTotal+=__f4.globals.Math.round(item.berat*(b?.tarif||0));});$('previewKg').textContent=kg(kgTotal);$('previewRp').textContent=rupiah(rpTotal);}
  async function submitSetoran(e){e.preventDefault();const items=getSetItems();if(!items.length){note('setoranNotice','Isi berat minimal satu jenis barang.',true);return;}if([...$('setBarang').querySelectorAll('.f4-compact-row')].some(row=>{const code=row.querySelector('select')?.value,kg=(0,__f4.globals.Number)(row.querySelector('input')?.value||0);return (code||kg>0)&&(!code||kg<=0)})){note('setoranNotice','Lengkapi jenis dan berat yang dipilih.',true);return;}if(new __f4.globals.Set(items.map(x=>x.kode)).size!==items.length){note('setoranNotice','Jenis sampah yang sama cukup satu baris.',true);return;}const member=$('setWarga').value;if(!member){note('setoranNotice','Pilih warga terlebih dahulu.',true);return;}const preview=$('previewRp').textContent;if(!await __f4.window.f4UiDialog.confirm('Simpan setoran '+member+' sebagai ESTIMASI sebesar '+preview+'?'))return;const form=e.target;busy(form,true);note('setoranNotice','Menyimpan transaksi...');try{const editing=!!setEditId;const result=await call(editing?'bsV32EditSetoran':'bsV5BuatSetoran',token,{...(editing?{id:setEditId,alasan:'Koreksi salah input dari riwayat setoran'}:{nonce:setNonce}),wargaId:member,tanggal:$('setDate').value,catatan:$('setNotes').value,items});setEditId='';setEditPayload=null;setNonce='';form.reset();await loadSetoran();note('setoranNotice',(editing?'Koreksi setoran ':'Setoran ')+result.id+' berhasil disimpan • '+kg(result.beratKg)+' • estimasi '+rupiah(result.estimasiRp)+'. Belum menjadi saldo sah.');}catch(e){note('setoranNotice','Gagal menyimpan: '+(e.message||e),true);}finally{busy(form,false);}}
  async function loadRiwayat(){const area=$('riwayatList');area.textContent='Memuat riwayat...';try{const rows=await call('bsV6SetoranAdmin',token);if(!rows.length){area.textContent='Belum ada setoran.';return;}const table=__f4.globals.document.createElement('table'),body=__f4.globals.document.createElement('tbody'),head=__f4.globals.document.createElement('tr');['Nama warga','Tanggal','Berat','Estimasi','Status','Aksi'].forEach(t=>{const th=__f4.globals.document.createElement('th');th.textContent=t;head.appendChild(th)});const thead=__f4.globals.document.createElement('thead');thead.appendChild(head);table.appendChild(thead);rows.forEach(r=>{const tr=__f4.globals.document.createElement('tr');cell(tr,f4BankDisplayWargaName(r.namaWarga),'Nama warga');cell(tr,r.tanggal,'Tanggal');cell(tr,kg(r.berat),'Berat');cell(tr,rupiah(r.estimasi),'Estimasi');cell(tr,r.status,'Status');const td=__f4.globals.document.createElement('td');const btn=__f4.globals.document.createElement('button');btn.className='warning';btn.textContent='Batalkan';btn.disabled=r.status!=='Estimasi';btn.onclick=()=>cancelSetoran(r);td.appendChild(btn);tr.appendChild(td);body.appendChild(tr)});table.appendChild(body);area.replaceChildren(table);}catch(e){area.textContent='Gagal memuat riwayat: '+(e.message||e);}}
  async function cancelSetoran(r){const reason=await __f4.window.f4UiDialog.prompt('Alasan pembatalan '+r.id+' (minimal 5 karakter):','Data uji');if(reason===null)return;if(reason.trim().length<5){note('riwayatNotice','Tulis alasan minimal 5 karakter.',true);return;}if(!await __f4.window.f4UiDialog.confirm('Batalkan '+r.id+'? Riwayat tetap tersimpan dan tidak dihitung di dashboard.'))return;note('riwayatNotice','Membatalkan...');try{await call('bsV6BatalkanSetoran',token,r.id,reason.trim());note('riwayatNotice',r.id+' dibatalkan.');await loadRiwayatV7();}catch(e){note('riwayatNotice','Gagal membatalkan: '+(e.message||e),true);}}
  async function loadPenjualan(){const area=$('saleItems');area.textContent='Memuat daftar barang...';$('saleDate').value=$('saleDate').value||bankLocalToday();if(!saleNonce)saleNonce='N'+__f4.globals.Date.now().toString(36)+__f4.globals.Math.random().toString(36).slice(2,12);try{const [batches,items,sales]=await __f4.globals.Promise.all([call('bsV6BatchAdmin',token),call('bsDashboardMasterBarang',token),call('bsV7PenjualanAdmin',token)]);
    const soldBatchIds=new __f4.globals.Set(sales.filter(s=>s.status!=='Dibatalkan').map(s=>(0,__f4.globals.String)(s.batchId||'')));
    const available=batches.filter(b=>['draft','siap'].includes((0,__f4.globals.String)(b.status||'').toLowerCase())&&(0,__f4.globals.Number)(b.jumlahSetoran)>0&&!soldBatchIds.has((0,__f4.globals.String)(b.id)));
    const select=$('saleBatch'),old=select.value,previousWasValid=available.some(b=>b.id===old);
    select.replaceChildren(new __f4.globals.Option(available.length?'Pilih kelompok':'Belum ada kelompok siap dijual',''));
    available.forEach(b=>select.appendChild(new __f4.globals.Option(b.id+' • '+kg(b.berat)+' • '+b.jumlahSetoran+' setoran',b.id)));
    select.value=previousWasValid?old:'';
    select.disabled=available.length===0;
    saleCatalog=items.filter(b=>b.status.toLowerCase()==='aktif');area.replaceChildren();const list=__f4.globals.document.createElement('div');list.className='f4-compact-rows f4-compact-sale-rows';area.append(list);$('saleReceived').dataset.manual='';$('saleReceived').oninput=()=>{$('saleReceived').dataset.manual='1'};addSaleItemRow();__f4.window.F4SaleSheet?.refresh();}catch(e){area.textContent='Gagal memuat form: '+(e.message||e);}}
  function addSaleItemRow(){
    const container=$('saleItems')?.querySelector('.f4-compact-rows');if(!container||container.children.length>=30)return;
    const row=__f4.globals.document.createElement('div');row.className='f4-compact-row f4-compact-sale-row';
    const type=__f4.globals.document.createElement('select');type.setAttribute('aria-label','Jenis sampah terjual');
    type.add(new __f4.globals.Option('Pilih jenis',''));saleCatalog.forEach(item=>type.add(new __f4.globals.Option(item.nama,item.kode)));
    const weight=__f4.globals.document.createElement('input');weight.type='number';weight.min='0.001';weight.step='0.001';weight.max='10000';
    weight.placeholder='Kg';weight.setAttribute('aria-label','Berat terjual (kg)');
    const price=__f4.globals.document.createElement('input');price.type='number';price.min='1';price.step='1';
    price.placeholder='Rp/kg';price.setAttribute('aria-label','Harga lapak per kilogram');
    const remove=__f4.globals.document.createElement('button');remove.type='button';remove.className='f4-compact-remove';
    remove.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';remove.title='Hapus jenis';remove.setAttribute('aria-label','Hapus jenis sampah');
    type.onchange=()=>{const item=saleCatalog.find(x=>x.kode===type.value);price.value='';updateSaleTotals()};
    weight.oninput=updateSaleTotals;price.oninput=updateSaleTotals;
    remove.onclick=()=>{row.remove();if(!container.children.length)addSaleItemRow();updateSaleTotals()};
    const priceGroup=__f4.globals.document.createElement('div');priceGroup.className='f4-compact-entry-group';
    priceGroup.append(price,remove);
    row.append(type,weight,priceGroup);container.append(row);updateSaleTotals();
  }
  function saleItems(){return [...$('saleItems').querySelectorAll('.f4-compact-sale-row')].map(row=>({kode:row.querySelector('select')?.value,berat:(0,__f4.globals.Number)(row.querySelectorAll('input')[0]?.value),harga:(0,__f4.globals.Number)(row.querySelectorAll('input')[1]?.value),sisa:(0,__f4.globals.Number)(row.querySelector('[data-bank-unsold]')?.value||0)})).filter(item=>item.kode&&item.berat>0);}
  function updateSaleTotals(){const items=saleItems();$('saleItems').querySelectorAll('.f4-compact-row').forEach(row=>row.classList.toggle('f4-entry-filled',(0,__f4.globals.Number)(row.querySelector('input')?.value)>0));const weight=items.reduce((s,r)=>s+r.berat,0),gross=items.reduce((s,r)=>s+__f4.globals.Math.round(r.berat*r.harga),0);$('saleWeight').textContent=kg(weight);$('saleGross').textContent=rupiah(gross);const received=$('saleReceived');received.disabled=$('saleStatus').value==='Belum Bayar';if(received.disabled)received.value='0';else if(!received.dataset.manual)received.value=(0,__f4.globals.String)(gross);}
  async function loadBatchRekon(){
    const select=$('reconBatch'),old=select.value;
    select.replaceChildren(new __f4.globals.Option('Pilih kelompok',''));
    $('reconResult').textContent='Memuat kelompok...';
    try{
      const rows=await call('bsV6BatchAdmin',token);
      const eligible=(__f4.globals.Array.isArray(rows)?rows:[]).filter(b=>
        ['draft','siap'].includes((0,__f4.globals.String)(b.status||'').trim().toLowerCase()));
      eligible.forEach(b=>select.add(new __f4.globals.Option(b.id+' • '+kg(b.berat),b.id)));
      if(eligible.some(b=>b.id===old)){
        select.value=old;
        await loadRekonsiliasi();
      }else{
        select.value='';
        $('reconResult').textContent=eligible.length
          ?'Pilih kelompok untuk melihat pratinjau selisih.'
          :'Tidak ada kelompok yang perlu dicek.';
      }
    }catch(error){$('reconResult').textContent=error.message||'Gagal memuat kelompok.';}
  }
  function v7DetailTable(items,type){const wrap=__f4.globals.document.createElement('div');wrap.className='details-panel';const table=__f4.globals.document.createElement('table'),body=__f4.globals.document.createElement('tbody');items.forEach(x=>{const tr=__f4.globals.document.createElement('tr');cell(tr,x.barang,'Barang');cell(tr,kg(x.berat),'Berat');cell(tr,rupiah(type==='setoran'?x.tarif:x.harga)+'/kg','Tarif / harga');cell(tr,rupiah(x.nilai),'Nilai');body.appendChild(tr)});table.appendChild(body);wrap.appendChild(table);if(!items.length)wrap.textContent='Belum ada rincian.';return wrap;}
  // Aksi rincian selalu ikon mata; jangan menimpa SVG dengan textContent ketika status berubah.
  function v7SetDetailsButton(button,isOpen){
    const svg=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('width','20');svg.setAttribute('height','20');
    svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
    svg.setAttribute('stroke-width','1.9');svg.setAttribute('stroke-linecap','round');
    svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
    svg.innerHTML=isOpen
      ?'<path d="m3 3 18 18"/><path d="M10.6 6.1A12 12 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.7"/><path d="M6.1 8.1C3.5 9.8 2 12 2 12s3.6 6 10 6c1.2 0 2.5-.2 3.6-.6"/><path d="M10 10a3 3 0 0 0 4 4"/>'
      :'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>';
    button.replaceChildren(svg);
    const label=isOpen?'Sembunyikan rincian':'Lihat rincian';
    button.setAttribute('aria-label',label);button.title=label;
    button.setAttribute('aria-expanded',(0,__f4.globals.String)(isOpen));
  }
  async function v7ToggleDetails(container,id,type,button){
    if(container.childElementCount){container.replaceChildren();v7SetDetailsButton(button,false);return;}
    button.disabled=true;
    try{
      const items=await call(type==='setoran'?'bsV7RincianSetoran':'bsV7RincianPenjualan',token,id);
      container.appendChild(v7DetailTable(items,type));
      if(type==='penjualan'){
        const print=__f4.globals.document.createElement('button');print.type='button';
        print.className='secondary f4-bank-sale-receipt-action';
        print.textContent='Unduh PDF Transaksi';
        print.onclick=()=>__f4.window.F4SaleReport?.(id);
        container.appendChild(print);
      }
      v7SetDetailsButton(button,true);
    }catch(e){container.textContent='Gagal: '+(e.message||e);v7SetDetailsButton(button,false);}
    finally{button.disabled=false;}
  }
  async function v7SettleSale(r){
    const prior=(0,__f4.globals.Number)(r.diterima),total=(0,__f4.globals.Number)(r.bruto);
    if(!__f4.globals.Number.isSafeInteger(prior)||!__f4.globals.Number.isSafeInteger(total)||prior>=total)return;
    const raw=await __f4.window.f4UiDialog.prompt('Total pembayaran lapak yang sudah diterima (termasuk uang sebelumnya):',(0,__f4.globals.String)(total));
    if(raw===null)return;
    const receivedRp=(0,__f4.globals.Number)(raw);
    if(!__f4.globals.Number.isSafeInteger(receivedRp)||receivedRp<=prior||receivedRp>total){__f4.window.f4UiDialog.alert('Nominal harus lebih besar dari yang sudah diterima dan tidak melebihi total jual.');return;}
    const noteText=await __f4.window.f4UiDialog.prompt('Keterangan pembayaran:','Pelunasan penjualan lapak');
    if(noteText===null)return;
    const reason=(0,__f4.globals.String)(noteText).trim();
    if(reason.length<5||reason.length>250){__f4.window.f4UiDialog.alert('Isi keterangan 5–250 karakter.');return;}
    if(!await __f4.window.f4UiDialog.confirm('Tambahkan pembayaran '+rupiah(receivedRp-prior)+' ke penjualan ini?'))return;
    note('riwayatJualNotice','Menyimpan pembayaran...');
    try{
      const res=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/admin/bank/sales/payment',{
        method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},
        body:__f4.globals.JSON.stringify({saleId:r.id,receivedRp,note:reason})
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok||data.ok===false)throw (0,__f4.globals.Error)(data.error||'HTTP '+res.status);
      await loadRiwayatJual();
      note('riwayatJualNotice','Pembayaran tercatat. Status pengesahan tetap terpisah.');
    }catch(error){note('riwayatJualNotice','Periksa pembayaran: '+(error.message||error),true);}
  }

  /* Resi Bank Sampah: memakai data aktif dari D1; estimasi tidak disebut pembayaran sah. */
  function f4BankReceiptIcon(record,onClick){
    const b=__f4.globals.document.createElement('button');
    b.type='button';b.className='secondary f4-bank-receipt-action';
    b.title='Resi JPG';b.setAttribute('aria-label','Resi JPG');
    b.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 3h16v18l-4-2-4 2-4-2-4 2V3Z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>';
    b.onclick=async()=>{
      if(!__f4.window.F4TransactionReceipt){note('riwayatJualNotice','Resi belum tersedia. Muat ulang halaman.',true);return;}
      if(record&&/batal|dibatalkan/i.test((0,__f4.globals.String)(record.status||'')))return;
      try{const payload=await onClick();
        if(payload&&__f4.globals.Number.isSafeInteger((0,__f4.globals.Number)(payload.amount))&&payload.id)
          await __f4.window.F4TransactionReceipt.open(payload);
      }catch(e){__f4.window.f4UiDialog?.alert?.('Tidak dapat membuat resi: '+(e.message||e));}
    };
    return b;
  }
  async function f4BankDepositReceiptReady(r){
    let who=null;
    const wanted=(0,__f4.globals.String)(r.wargaId||'').replace(/^member:/,'');
    if(wanted){
      const roster=__f4.globals.Array.isArray(v9Members)&&v9Members.length?v9Members:
        await call('bsV9SaldoAdmin',token);
      who=roster.find(m=>(0,__f4.globals.String)(m.wargaId||'').replace(/^member:/,'')===wanted)||null;
    }
    return f4BankDepositReceipt(r,who);
  }
  function f4BankDepositReceipt(r,who){
    const final=/terkonfirmasi|confirmed|sah/i.test((0,__f4.globals.String)(r.status||''))&&
      r.nilaiSahRp!=null&&__f4.globals.Number.isSafeInteger((0,__f4.globals.Number)(r.nilaiSahRp));
    const data=r.estimasiRp??r.estimasi??0;
    return {scope:'bank',id:r.id,title:final?'Bukti Hasil Setoran Sampah':'Bukti Penimbangan Sampah',
      party:who?.nama||r.namaWarga||'Anggota Bank Sampah',
      house:who?.rumah||r.rumahWarga||'-',date:r.tanggal||'-',
      method:'Setoran sampah',
      amount:(0,__f4.globals.Number)(final?r.nilaiSahRp:data),
      amountLabel:final?'Hasil Setoran Sah':'Nilai Perkiraan',
      status:final?'TERKONFIRMASI':'ESTIMASI — BELUM TERJUAL',
      details:[['Berat ditimbang',r.beratTimbangKg!=null?r.beratTimbangKg+' kg':r.beratTimbang!=null?r.beratTimbang+' kg':r.beratKg!=null?r.beratKg+' kg':r.berat!=null?r.berat+' kg':'-'],
       ['Berat terjual',r.beratSahKg!=null?r.beratSahKg+' kg':r.beratSah!=null?r.beratSah+' kg':'-'],
       ['Status asal',r.status||'-']],
      note:final?'Hasil setoran sudah disahkan. Bukan bukti pencairan tabungan.':
       'Perkiraan saat penimbangan; belum menjadi saldo tabungan atau bukti pembayaran.'};
  }
  // Satu pemuat rincian untuk Beranda dan Resi pada Riwayat Setoran.
  async function f4BankDepositDetailPayload(r){
    if(!r?.id)throw (0,__f4.globals.Error)('ID setoran tidak tersedia.');
    const [payload,items]=await __f4.globals.Promise.all([
      f4BankDepositReceiptReady(r),
      call('bsV7RincianSetoran',token,r.id)
    ]);
    if(!__f4.globals.Array.isArray(items))throw (0,__f4.globals.Error)('Rincian barang tidak dapat dibaca. Coba ulang.');
    payload.details.push(['Jumlah jenis barang',(0,__f4.globals.String)(items.length)]);
    for(const item of items){
      const grams=(0,__f4.globals.Number)(item.berat);
      const estimate=(0,__f4.globals.Number)(item.nilai);
      const desc=[__f4.globals.Number.isFinite(grams)?kg(grams):'-',
        __f4.globals.Number.isFinite(estimate)?'Perkiraan '+rupiah(estimate):null].filter(__f4.globals.Boolean).join(' · ');
      payload.details.push([(0,__f4.globals.String)(item.barang||'Jenis sampah'),desc]);
    }
    if(/batal/i.test((0,__f4.globals.String)(r.status||''))){
      payload.title='Arsip Setoran Dibatalkan';
      payload.heading='Setoran Dibatalkan';
      payload.status='DIBATALKAN';
      payload.amount=__f4.globals.Number.isSafeInteger((0,__f4.globals.Number)(r.estimasi))?(0,__f4.globals.Number)(r.estimasi):0;
      payload.amountLabel='Nilai Perkiraan (Batal)';
      payload.note='Transaksi ini dibatalkan. Nilainya tidak menambah saldo warga maupun kas lingkungan.';
    }
    return payload;
  }
  function f4BankSaleReceipt(r){
    const received=(0,__f4.globals.Number)(r.diterima||0),gross=(0,__f4.globals.Number)(r.bruto||0);
    const status=received<=0?'BELUM DIBAYAR':received<gross?'BAYAR SEBAGIAN':'DITERIMA';
    return {scope:'bank',id:r.id,title:'Bukti Penjualan Sampah',
      party:r.lapak||'Lapak pembeli',house:'Bank Sampah Flamboyan 4',date:r.tanggal||'-',
      method:'Penjualan ke lapak',amount:received,amountLabel:'Dana Diterima',
      status,details:[['Total penjualan',rupiah(gross)],
       ['Sisa dibayar',rupiah(__f4.globals.Math.max(0,gross-received))],
       ['Nomor bukti lapak',r.nota||'-'],['Status penjualan',r.status||'-']],
      note:'Bukti transaksi penjualan; pengesahan pembagian hasil dilakukan terpisah.'};
  }

  function v7HistoryCard(r,type){const box=__f4.globals.document.createElement('div');box.className='stat';box.style.marginBottom='10px';const header=__f4.globals.document.createElement('div');header.className='toolbar';const title=__f4.globals.document.createElement('strong');title.textContent=type==='setoran'?f4BankDisplayWargaName(r.namaWarga)+(r.rumahWarga?' • '+r.rumahWarga:''):'Penjualan • '+(r.lapak||'Lapak');const badge=__f4.globals.document.createElement('span');badge.className='tag';badge.textContent=r.status;header.append(title,badge);const info=__f4.globals.document.createElement('p');info.className='tiny';info.textContent=[r.tanggal,...(type==='setoran'?[r.berat==null?'Berat jual belum tersedia':kg(r.berat)]:__f4.globals.Number.isFinite((0,__f4.globals.Number)(r.berat))&&(0,__f4.globals.Number)(r.berat)>0?[kg(r.berat)]:[]),type==='setoran'?(r.status==='Terkonfirmasi'?
  (r.nilaiSahRp==null?'Hasil jual belum tersedia':'Hasil jual '+rupiah(r.nilaiSahRp)):
  'Perkiraan '+rupiah(r.estimasi)):'Total '+rupiah(r.bruto)+' • Diterima '+rupiah(r.diterima)].join(' • ');const actions=__f4.globals.document.createElement('div');actions.className='toolbar';const details=__f4.globals.document.createElement('button');details.type='button';details.className='secondary f4-bs-detail-button';details.dataset.f4ActionOriginal='Lihat rincian';v7SetDetailsButton(details,false);const detailArea=__f4.globals.document.createElement('div');details.onclick=()=>v7ToggleDetails(detailArea,r.id,type,details);const cancel=__f4.globals.document.createElement('button');cancel.className='warning';cancel.textContent='Batalkan';cancel.disabled=type==='setoran'?r.status!=='Estimasi':r.status==='Dibatalkan';cancel.onclick=()=>type==='setoran'?cancelSetoran(r):v7CancelSale(r);actions.append(details,cancel);if(!/batal|dibatalkan/i.test((0,__f4.globals.String)(r.status||'')))actions.appendChild(f4BankReceiptIcon(r,()=>type==='setoran'?f4BankDepositReceiptReady(r):f4BankSaleReceipt(r)));if(type==='penjualan'&&r.status!=='Dibatalkan'){const receipt=__f4.globals.document.createElement('button');receipt.type='button';receipt.className='secondary';receipt.textContent=r.nota?'Ubah No. Bukti':'Isi No. Bukti';receipt.setAttribute('aria-label','Isi atau koreksi nomor bukti lapak');receipt.onclick=()=>v7EditSaleReceipt(r);actions.appendChild(receipt);if(/^draft$/i.test((0,__f4.globals.String)(r.status))&&(0,__f4.globals.Number)(r.diterima)<(0,__f4.globals.Number)(r.bruto)){const settle=__f4.globals.document.createElement('button');settle.type='button';settle.className='secondary';settle.textContent='Catat Pelunasan';settle.onclick=()=>v7SettleSale(r);actions.appendChild(settle);}}box.append(header,info,actions,detailArea);if(type==='penjualan'){const notaInfo=__f4.globals.document.createElement('span');notaInfo.className='f4-sale-note-caption';notaInfo.textContent='Bukti lapak: '+(r.nota||'lembar timbang bertanda tangan');info.append(' • ');info.appendChild(notaInfo);}if(type==='penjualan'&&r.bruto!==r.diterima){const p=__f4.globals.document.createElement('p');p.className='tiny';p.textContent='Selisih penerimaan '+rupiah(r.bruto-r.diterima)+' • '+(r.alasanSelisih||'Belum ada alasan pada transaksi lama');box.appendChild(p);}return box;}
  async function v7EditSaleReceipt(record){
    const original=(0,__f4.globals.String)(record.nota||'').trim();
    const raw=await __f4.window.f4UiDialog.prompt('Nomor bukti dari lapak untuk penjualan '+record.tanggal+' (boleh dikosongkan bila belum ada):',original);
    if(raw===null)return;
    const receiptNo=(0,__f4.globals.String)(raw).trim();
    if(receiptNo.length>80||/[\x00-\x1F\x7F]/.test(receiptNo)){
      note('riwayatJualNotice','Nomor bukti maksimal 80 karakter, tanpa baris baru.',true);return;
    }
    if(receiptNo===original)return;
    let accepted=false;
    try{
      note('riwayatJualNotice','Menyimpan dan memeriksa nomor bukti...');
      const endpoint='https://api.flamboyan4.web.id/api/v2/admin/bank/sale-receipt';
      const response=await (0,__f4.globals.fetch)(endpoint,{
        method:'POST',credentials:'include',mode:'cors',cache:'no-store',
        headers:{'Content-Type':'application/json'},
        body:__f4.globals.JSON.stringify({saleId:record.id,receiptNo,evidenceUrl:(0,__f4.globals.String)(record.bukti||'')})
      });
      const result=await response.json().catch(()=>({}));
      if(!response.ok||result.ok===false){
        if(response.status===404&&/endpoint|api v2|tidak ditemukan/i.test((0,__f4.globals.String)(result.error||'')))
          throw (0,__f4.globals.Error)('API simpan nota belum tersedia di Worker aktif. Periksa rilis Cloudflare; data belum berubah.');
        throw (0,__f4.globals.Error)(result.error||'Gagal menyimpan (HTTP '+response.status+').');
      }
      accepted=true;
      // Jangan tampilkan berhasil sebelum nilai terbaru terbaca kembali dari D1.
      const detailRes=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/v2/admin/bank/sale-detail?id='+(0,__f4.globals.encodeURIComponent)(record.id),{
        credentials:'include',mode:'cors',cache:'no-store'
      });
      const detail=await detailRes.json().catch(()=>({}));
      if(!detailRes.ok||detail.ok===false)throw (0,__f4.globals.Error)('Data tersimpan, tetapi rincian belum dapat diperiksa.');
      const verified=(0,__f4.globals.String)(detail.sale?.receipt_no||'').trim();
      if(verified!==receiptNo)throw (0,__f4.globals.Error)('API menerima perubahan, tetapi nomor nota belum terbaca kembali dari D1. Jangan mengisi ulang sebelum memeriksa.');
      const refreshed=await call('bsV7PenjualanAdmin',token);
      const current=refreshed.find(x=>(0,__f4.globals.String)(x.id)===(0,__f4.globals.String)(record.id));
      if(!current||(0,__f4.globals.String)(current.nota||'').trim()!==receiptNo)
        throw (0,__f4.globals.Error)('Nomor nota sudah tersimpan, tetapi daftar penjualan belum sinkron. Muat ulang halaman untuk memeriksa.');
      const area=$('riwayatJualList');
      area.replaceChildren(...refreshed.map(r=>v7HistoryCard(r,'penjualan')));
      note('riwayatJualNotice','Nomor nota tersimpan dan terverifikasi. Form serah terima sudah memakai nomor terbaru.');
    }catch(e){
      note('riwayatJualNotice',(accepted?'Perlu pemeriksaan: ':'Gagal menyimpan nota: ')+(e.message||e),true);
    }
  }
  async function loadRiwayatV7(){const area=$('riwayatList');area.textContent='Memuat riwayat...';try{const data=await call('bsV6SetoranAdmin',token);area.replaceChildren(...data.map(r=>v7HistoryCard(r,'setoran')));if(!data.length)area.textContent='Belum ada setoran.';}catch(e){area.textContent='Gagal: '+(e.message||e);}}
  async function loadRiwayatJual(){const area=$('riwayatJualList');area.classList.add('f4-bs-history-list');area.textContent='Memuat penjualan...';try{const data=await call('bsV7PenjualanAdmin',token);area.replaceChildren(...data.map(r=>v7HistoryCard(r,'penjualan')));if(!data.length)area.textContent='Belum ada penjualan.';}catch(e){area.textContent='Gagal: '+(e.message||e);}}
  async function v7CancelSale(r){const reason=await __f4.window.f4UiDialog.prompt('Alasan pembatalan '+r.id+' (min. 5 karakter):','Data uji');if(reason===null)return;if(reason.trim().length<5){note('riwayatJualNotice','Alasan terlalu pendek.',true);return;}if(!await __f4.window.f4UiDialog.confirm('Batalkan penjualan '+r.id+'? Riwayat tetap tersimpan.'))return;try{await call('bsV7BatalkanPenjualan',token,r.id,reason.trim());note('riwayatJualNotice','Penjualan '+r.id+' dibatalkan.');await loadRiwayatJual();}catch(e){note('riwayatJualNotice','Gagal: '+(e.message||e),true);}}
  function v7EnsureSaleReason(){if($('saleReason'))return;const wrap=__f4.globals.document.createElement('div');wrap.className='field f4-field-stack';const label=__f4.globals.document.createElement('label');label.htmlFor='saleReason';label.textContent='Catatan pembayaran';const input=__f4.globals.document.createElement('input');input.id='saleReason';input.maxLength=200;input.placeholder='Misal: pelunasan bertahap / potongan';wrap.append(label,input);$('saleProof').closest('.field').after(wrap);}
  async function submitSale(e){
    e.preventDefault();
    const form=e.target;
    const rows=[...$('saleItems').querySelectorAll('.f4-compact-sale-row')];
    const items=saleItems(),batch=$('saleBatch').value;
    if(!batch||!items.length){note('saleNotice','Pilih nomor penjualan dan isi sedikitnya satu jenis barang.',true);return;}
    if(!__f4.window.F4SaleSheet?.ready?.()){
      note('saleNotice','Siapkan dan cetak Lembar Timbang lebih dulu agar setoran terkunci. Setelah dari lapak, isi hasil timbangan nyata.',true);return;
    }
    if(rows.some(row=>{
      const code=row.querySelector('select')?.value;
      const weight=(0,__f4.globals.Number)(row.querySelectorAll('input')[0]?.value||0);
      return (code||weight>0)&&(!code||weight<=0);
    })){note('saleNotice','Lengkapi jenis dan berat hasil timbang.',true);return;}
    if(new __f4.globals.Set(items.map(x=>x.kode)).size!==items.length){
      note('saleNotice','Jenis sampah yang sama cukup satu baris.',true);return;
    }
    if(items.some(i=>!__f4.globals.Number.isFinite(i.sisa)||i.sisa<0||__f4.globals.Math.round(i.sisa*1000)>10000000)){
      note('saleNotice','Sisa stok tidak valid. Isi 0 jika semuanya terjual.',true);return;
    }
    if(items.some(i=>!__f4.globals.Number.isFinite(i.berat)||i.berat<=0||!__f4.globals.Number.isSafeInteger(i.harga)||i.harga<=0)){
      note('saleNotice','Periksa berat dan harga setiap jenis.',true);return;
    }
    const gross=items.reduce((sum,i)=>sum+__f4.globals.Math.round(i.berat*i.harga),0);
    const statusBayar=$('saleStatus').value;
    const diterima=statusBayar==='Belum Bayar'?0:(0,__f4.globals.Number)($('saleReceived').value);
    if(!__f4.globals.Number.isSafeInteger(gross)||gross<=0||!__f4.globals.Number.isSafeInteger(diterima)||diterima<0||diterima>gross){
      note('saleNotice','Nominal penjualan atau uang diterima tidak valid.',true);return;
    }
    if((statusBayar==='Lunas'&&diterima!==gross)||
      (statusBayar==='Belum Bayar'&&diterima!==0)||
      (statusBayar==='Sebagian'&&!(diterima>0&&diterima<gross))){
      note('saleNotice','Sesuaikan uang diterima dengan status pembayaran.',true);return;
    }
    const inputNote=(0,__f4.globals.String)($('saleReason')?.value||'').trim();
    const alasanSelisih=inputNote||(statusBayar==='Belum Bayar'?'Belum dibayar oleh lapak':
      statusBayar==='Sebagian'?'Pembayaran sebagian, sisa belum diterima':'');
    if(alasanSelisih.length>300){
      note('saleNotice','Catatan pembayaran maksimal 300 karakter.',true);return;
    }
    if(gross!==diterima&&alasanSelisih.length<5){
      note('saleNotice','Tambahkan keterangan pembayaran yang belum lunas.',true);return;
    }
    const proofUrl=(0,__f4.globals.String)($('saleProofUrl')?.value||'').trim();
    if(proofUrl){
      try{
        const u=new __f4.globals.URL(proofUrl);
        if(u.protocol!=='https:'||!u.hostname||u.username||u.password)throw (0,__f4.globals.Error)();
      }catch{note('saleNotice','Bukti transaksi harus berupa link HTTPS yang valid.',true);return;}
    }
    if(!await __f4.window.f4UiDialog.confirm('Catat penjualan '+batch+' senilai '+rupiah(gross)+' sebagai '+
      statusBayar+'? Tabungan warga belum disahkan.'))return;
    busy(form,true);note('saleNotice','Menyimpan penjualan...');
    try{
      const result=await call('bsV6SimpanPenjualan',token,{
        nonce:saleNonce,batch,tanggal:$('saleDate').value,lapak:$('saleLapak').value,
        statusBayar,diterima,bukti:$('saleProof').value,buktiUrl:proofUrl,alasanSelisih,items
      });
      const number=__f4.window.F4SaleSheet?.number?.()||batch;
      note('saleNotice','Penjualan '+number+' tersimpan ('+statusBayar+'). Tabungan belum disahkan.');
      const reviewAction=__f4.globals.document.createElement('button');
      reviewAction.type='button';reviewAction.className='secondary f4-bank-sale-receipt-action';
      reviewAction.textContent='Periksa & Sahkan';
      reviewAction.onclick=()=>{v8PendingBatch=batch;goPage('pengesahan');};
      $('saleNotice').appendChild(reviewAction);
      saleNonce='';form.reset();const extras=$('f4SaleExtras');if(extras)extras.open=false;
      await loadPenjualan();
    }catch(error){note('saleNotice','Gagal mencatat penjualan: '+(error.message||error),true);}
    finally{busy(form,false);}
  }
  async function loadRekonsiliasi(){const batch=$('reconBatch').value,area=$('reconResult');if(!batch){area.textContent='Pilih kelompok terlebih dahulu.';return;}area.textContent='Menghitung...';try{const r=await call('bsV6PratinjauRekonsiliasi',token,batch);const fields=[['Setoran',r.setoran],['Penjualan',r.penjualan],['Berat warga',kg(r.beratSetoran)],['Berat lapak',kg(r.beratLapak)],['Selisih berat',kg(r.selisihKg)],['Perkiraan warga',rupiah(r.estimasiWarga)],['Total jual',rupiah(r.bruto)],['Diterima',rupiah(r.diterima)],['Selisih bayar',rupiah(r.selisihPenerimaan)],['Sisa sementara',rupiah(r.marginSementara)]];area.replaceChildren(...fields.map(([l,v])=>metric(l,v)));area.style.display='grid';area.style.gridTemplateColumns='repeat(auto-fit,minmax(170px,1fr))';const section=__f4.globals.document.createElement('div');section.style.gridColumn='1/-1';const title=__f4.globals.document.createElement('h2');title.textContent='Selisih per barang';section.appendChild(title);(r.rincian||[]).forEach(item=>{const box=__f4.globals.document.createElement('div');box.className='details-panel';const heading=__f4.globals.document.createElement('strong');heading.textContent=item.barang;const p=__f4.globals.document.createElement('div');p.textContent='Warga '+kg(item.beratWarga)+' → Lapak '+kg(item.beratLapak)+' • Selisih '+kg(__f4.globals.Math.round((item.beratWarga-item.beratLapak)*1000)/1000);const values=__f4.globals.document.createElement('div');values.className='tiny';values.textContent='Perkiraan warga '+rupiah(item.estimasiWarga)+' • Total jual '+rupiah(item.hasilJual);box.append(heading,p,values);section.appendChild(box)});(r.alasanSelisih||[]).forEach(x=>{const p=__f4.globals.document.createElement('p');p.className='pill-note';p.textContent='Koreksi '+x.id+': '+x.alasan;section.appendChild(p)});const caution=__f4.globals.document.createElement('p');caution.className='pill-note';caution.textContent=r.siapDiperiksa?'Siap dicek. Belum sah.':'Periksa pembayaran dan selisih.';
      caution.insertAdjacentHTML('afterbegin',r.siapDiperiksa?'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/></svg>');section.appendChild(caution);area.appendChild(section);}catch(e){area.textContent='Gagal: '+(e.message||e);}}
  async function loadProgress(){const area=$('progressList');area.textContent='Memuat perkembangan...';try{const rows=await call(profile?.peran==='Admin'?'bsDashboardProgressPublik':'bsV14ProgressPublik',token);if(!rows.length){area.textContent='Belum ada perkembangan kegiatan yang dipublikasikan.';return;}area.replaceChildren(...rows.map(p=>{const b=__f4.globals.document.createElement('div');b.className='stat';b.style.marginBottom='10px';const title=__f4.globals.document.createElement('strong');title.textContent=p.judul||p.langkah||'Kegiatan';const desc=__f4.globals.document.createElement('div');desc.textContent=p.deskripsi||'';const caption=__f4.globals.document.createElement('small');caption.textContent=[p.tanggal,p.status].filter(__f4.globals.Boolean).join(' • ');b.append(title,desc,caption);return b}));}catch(e){area.textContent='Gagal memuat progres: '+(e.message||e);}}
  async function loadAccounts(){const target=$('accountList');target.textContent='Memuat akun...';try{accounts=await call('authAdminAccounts',token);const table=__f4.globals.document.createElement('table'),thead=__f4.globals.document.createElement('thead'),head=__f4.globals.document.createElement('tr');['Warga','Rumah','Username','Status','Aksi'].forEach(h=>{const th=__f4.globals.document.createElement('th');th.textContent=h;head.appendChild(th)});thead.appendChild(head);table.appendChild(thead);const body=__f4.globals.document.createElement('tbody');accounts.forEach(a=>{const tr=__f4.globals.document.createElement('tr');cell(tr,f4BankDisplayWargaName(a.nama),'Warga');cell(tr,a.rumah,'Rumah');cell(tr,a.username.toUpperCase(),'Username');cell(tr,a.status,'Status');const td=__f4.globals.document.createElement('td');const btn=__f4.globals.document.createElement('button');btn.className='warning';btn.textContent=a.status==='Aktif'?'Reset password':'Siapkan akun';btn.onclick=()=>resetDefault(a.akunId,a.nama,a.status==='Aktif');const detail=__f4.globals.document.createElement('button');detail.className='ghost mobile-detail';detail.textContent='Lihat detail';detail.style.marginRight='6px';detail.onclick=()=>{tr.classList.toggle('expanded');detail.textContent=tr.classList.contains('expanded')?'Tutup detail':'Lihat detail';};td.appendChild(detail);td.appendChild(btn);tr.appendChild(td);body.appendChild(tr)});table.appendChild(body);target.replaceChildren(table);}catch(e){target.textContent=e.message||'Gagal memuat akun.';}}
  async function resetDefault(id,nama,aktif){const message=aktif?'Reset password '+nama+' ke format awal? Semua sesi warga ini akan berakhir.':'Siapkan akun '+nama+' dan tampilkan informasi login khusus pengurus?';if(!await __f4.window.f4UiDialog.confirm(message))return;note('dashNotice','Memproses akun...');try{const result=await call('authAdminResetDefault',token,id);await loadAccounts();showCredential(result.username,result.passwordAwal,nama);note('dashNotice','Akun sudah siap. Password awal tampil pada popup.');}catch(e){note('dashNotice',e.message||'Gagal menyiapkan akun.',true);}}
  async function provisionAll(){if(!await __f4.window.f4UiDialog.confirm('Siapkan semua akun warga yang Belum Aktivasi? Akun yang sudah Aktif tidak akan diubah.'))return;const btn=$('bulkBtn');btn.disabled=true;let total=0;try{for(let i=0;i<30;i++){const result=await call('authAdminProvisionBatch',token);total+=result.dibuat;$('bulkProgress').textContent='Akun baru disiapkan: '+total+' • Sisa: '+result.tersisa;if(result.tersisa===0)break;if(result.dibuat===0)throw new __f4.globals.Error('Proses tidak maju; periksa status anggota.');}await loadAccounts();note('dashNotice',total+' akun baru disiapkan. Akun lama tetap dipertahankan.');}catch(e){note('dashNotice','Proses terhenti setelah '+total+' akun. Aman untuk dilanjutkan kembali. '+(e.message||''),true);await loadAccounts();}finally{btn.disabled=false;}}
  function showCredential(username,password,nama){currentCredential={username,password,nama};$('credentialTitle').textContent='Akun '+nama;$('credUser').textContent=username;$('credPass').textContent=password;$('copyCred').textContent='Salin akun';$('credentialModal').classList.remove('hidden');}
  function closeCredential(){currentCredential=null;$('credUser').textContent='';$('credPass').textContent='';$('credentialModal').classList.add('hidden');}
  async function copyCredential(){if(!currentCredential)return;const c=currentCredential;const value='Bank Sampah Flamboyan 4\nNama: '+c.nama+'\nUsername: '+c.username+'\nPassword awal: '+c.password+'\nSilakan login melalui portal Bank Sampah.';try{await __f4.globals.navigator.clipboard.writeText(value);$('copyCred').textContent='Tersalin';}catch(e){$('copyCred').textContent='Salin manual';}}
  let v8PreviewData=null,v8ValidatedBatch='',v8PendingBatch='';
  function v8Setup(){if($('pagePengesahan'))return;const nav=__f4.globals.document.createElement('button');nav.id='navPengesahan';nav.className='secondary';nav.textContent='Sahkan hasil';nav.onclick=()=>goPage('pengesahan');$('navRekonsiliasi').after(nav);const page=__f4.globals.document.createElement('div');page.id='pagePengesahan';page.className='card hidden';page.innerHTML=`
  <div class="f4-approval-heading"><h2>Sahkan penjualan</h2></div>
  <div class="f4-approval-caution"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/></svg> Sahkan setelah penjualan selesai; saldo warga akan diperbarui.</div>
  <div class="field f4-approval-picker">
    <label for="v8Batch">Kelompok setoran</label>
    <select id="v8Batch" onchange="v8Preview()"><option value="">Pilih kelompok</option></select>
  </div>
  <div id="v8Preview" class="f4-approval-summary">Pilih kelompok terlebih dahulu.</div>
  <form id="v8Form" class="hidden f4-approval-form" onsubmit="v8Confirm(event)">
    <div class="f4-approval-section-heading">
      <h3>Pembagian sisa</h3>
      <p class="hint">Jumlah pembagian harus sama dengan sisa.</p>
    </div>
    <div class="f4-approval-alloc-grid">
      <div class="field"><label for="v8Cadangan">Cadangan (Rp)</label><input id="v8Cadangan" type="number" min="0" step="1" required value="0" oninput="v8Recalculate()"></div>
      <div class="field"><label for="v8Lorong">Kas lorong (Rp)</label><input id="v8Lorong" type="number" min="0" step="1" required value="0" oninput="v8Recalculate()"></div>
      <div class="field"><label for="v8Operasional">Operasional (Rp)</label><input id="v8Operasional" type="number" min="0" step="1" required value="0" oninput="v8Recalculate()"></div>
    </div>
    <div class="f4-approval-balance">
      <div id="v8Sisa" class="f4-approval-sisa" role="status"></div>
      <button type="button" class="secondary" onclick="v8IsiSisa()">Isi sisa ke operasional</button>
    </div>
    <div class="f4-approval-final">
      <div class="field"><label for="v8Reason">Selisih berat (opsional)</label><input id="v8Reason" maxlength="300" placeholder="Misalnya: penyusutan saat ditimbang lapak"></div>
      <div class="f4-approval-auto-id"><small>Kelompok</small><strong id="v8SelectedLabel">—</strong></div>
    </div>
    <button id="v8Submit" type="submit" class="wide f4-approval-submit">Sahkan hasil</button>
  </form>
  <div id="v8Notice" role="status"></div>`;$('pageRekonsiliasi').after(page);}
  async function v8LoadBatches(){
    const sel=$('v8Batch');
    v8PreviewData=null;v8ValidatedBatch='';
    $('pagePengesahan').classList.remove('is-empty','has-selection');
    $('v8Form').classList.add('hidden');
    $('v8Preview').textContent='Memuat kelompok...';
    const old=v8PendingBatch||sel.value;
    v8PendingBatch='';
    sel.replaceChildren(new __f4.globals.Option('Pilih kelompok',''));
    try{
      const rows=await call('bsV6BatchAdmin',token);
      // D1 already reports the actual batch status; never offer finalized/canceled ones again.
      const eligible=(__f4.globals.Array.isArray(rows)?rows:[]).filter(b=>
        ['draft','siap'].includes((0,__f4.globals.String)(b.status||'').trim().toLowerCase()));
      eligible.forEach(b=>sel.add(new __f4.globals.Option(b.id+' • '+kg(b.berat)+' • '+b.jumlahSetoran+' setoran',b.id)));
      sel.disabled=!eligible.length;
      $('pagePengesahan').classList.toggle('is-empty',!eligible.length);
      const reconDetails=$('f4BankReconDetails');if(reconDetails)reconDetails.hidden=!eligible.length;
      if(eligible.some(b=>b.id===old)){
        sel.value=old;
        await v8Preview();
      }else{
        sel.value='';
        const area=$('v8Preview');area.replaceChildren();
        if(!eligible.length){
          const empty=__f4.globals.document.createElement('div');empty.className='f4-approval-empty';
          empty.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span>Belum ada penjualan yang perlu disahkan.</span>';
          area.appendChild(empty);
        }
      }
    }catch(e){
      $('v8Preview').textContent='Gagal memuat kelompok: '+(e.message||e);
    }
  }
  async function v8Preview(){const batch=$('v8Batch').value;v8PreviewData=null;v8ValidatedBatch='';$('v8Form').classList.add('hidden');$('pagePengesahan').classList.toggle('has-selection',!!batch);note('v8Notice','');if(!batch){$('v8Preview').textContent='';return;}$('v8Preview').textContent='Memeriksa kelompok...';try{const p=await call('bsV8BatchSiap',token,batch);if($('v8Batch').value!==batch)return;v8PreviewData=p;v8ValidatedBatch=batch;const rows=[['Setoran',p.setoran],['Penjualan',p.penjualan],['Berat warga',kg(p.beratSetoran)],['Berat lapak',kg(p.beratLapak)],['Bagi hasil',p.wargaPercent+'% warga · '+p.lingkunganPercent+'% lingkungan'],['Hak warga',rupiah(p.estimasiWarga)],['Uang diterima',rupiah(p.diterima)],['Sisa dibagi',rupiah(p.marginBank)]];const grid=__f4.globals.document.createElement('div');grid.className='metric-grid';rows.forEach(([l,v])=>grid.appendChild(metric(l,v)));const area=$('v8Preview');area.replaceChildren(grid);if(!p.siap){const warning=__f4.globals.document.createElement('div');warning.className='notice error';warning.textContent=p.peringatan.join(' ');area.appendChild(warning);return;}const msg=__f4.globals.document.createElement('p');msg.className='notice';msg.textContent='Siap. Periksa pembagian.';area.appendChild(msg);$('v8Form').classList.remove('hidden');$('v8Cadangan').value='0';$('v8Lorong').value='0';$('v8Operasional').value='0';$('v8SelectedLabel').textContent=batch;$('v8Reason').value='';$('v8Reason').required=!!p.hasWeightDifference;$('v8Reason').placeholder=p.hasWeightDifference?'Wajib: alasan hasil timbang berbeda':'Misalnya: penyusutan saat ditimbang lapak';v8Recalculate();}catch(e){$('v8Preview').textContent='Gagal memeriksa: '+(e.message||e);}}
  function v8Recalculate(){if(!v8PreviewData)return;const amounts=['v8Cadangan','v8Lorong','v8Operasional'].map(k=>(0,__f4.globals.Number)($(k).value));const valid=amounts.every(v=>__f4.globals.Number.isSafeInteger(v)&&v>=0);const sum=amounts.reduce((a,b)=>a+b,0);const delta=v8PreviewData.marginBank-sum;const balanced=valid&&delta===0;const indicator=$('v8Sisa');indicator.textContent=balanced?'Pas • Sisa Rp 0':'Sisa: '+rupiah(delta)+(valid?'':' • Isi rupiah bulat');indicator.classList.toggle('is-balanced',balanced);indicator.classList.toggle('is-outstanding',!balanced);$('v8Submit').disabled=!balanced;}
  function v8IsiSisa(){if(!v8PreviewData)return;const remainder=v8PreviewData.marginBank-(0,__f4.globals.Number)($('v8Cadangan').value||0)-(0,__f4.globals.Number)($('v8Lorong').value||0);if(remainder<0){note('v8Notice','Cadangan dan kas lorong melebihi margin.',true);return;}$('v8Operasional').value=(0,__f4.globals.String)(remainder);v8Recalculate();}
  async function v8Confirm(e){e.preventDefault();if(!v8PreviewData||!v8PreviewData.siap)return;const batch=$('v8Batch').value;if(!batch||v8ValidatedBatch!==batch){note('v8Notice','Batch berubah. Muat kembali rincian sebelum disahkan.',true);return;}if(!await __f4.window.f4UiDialog.confirm('Apakah SEMUA barang pada batch '+batch+' sudah dijual dan selisih stoknya sudah diperiksa? Jika masih ada barang tersisa, pilih Batal.'))return;const payload={batch,konfirmasi:batch,cadangan:(0,__f4.globals.Number)($('v8Cadangan').value),kasLorong:(0,__f4.globals.Number)($('v8Lorong').value),operasional:(0,__f4.globals.Number)($('v8Operasional').value),alasanSelisihBerat:$('v8Reason').value.trim(),semuaTerjual:true};if(!await __f4.window.f4UiDialog.confirm('PERINGATAN: Sahkan hak tabungan warga '+rupiah(v8PreviewData.estimasiWarga)+' untuk '+batch+'? Tindakan ini mencatat hak tabungan dan alokasi.'))return;busy(e.target,true);note('v8Notice','Sedang mengesahkan. Jangan tutup halaman.');try{const result=await call('bsV8SahkanBatch',token,payload);$('v8Form').classList.add('hidden');await v8LoadBatches();note('v8Notice','Batch '+result.batch+' berhasil disahkan. Hak warga '+rupiah(result.hakWarga)+' • margin bank '+rupiah(result.marginBank)+'.');}catch(err){note('v8Notice','Gagal mengesahkan: '+(err.message||err)+'. Jika ada status Diproses, jangan ulangi tanpa pemeriksaan.',true);}finally{busy(e.target,false);}}
  let v9Nonce='',v9Members=[];
  function v9Setup(){
    if($('pageTabungan'))return;
    const nav=__f4.globals.document.createElement('button');nav.id='navTabungan';nav.className='secondary';
    nav.textContent='Saldo warga';nav.onclick=()=>goPage('tabungan');$('navPengesahan').after(nav);
    const page=__f4.globals.document.createElement('div');page.id='pageTabungan';page.className='card hidden';
    page.innerHTML=`
      <div class="f4-savings-head">
        <h2>Saldo Warga</h2><p>Tabungan anggota dan posisi kas.</p>
      </div>
      <div class="f4-saldo-workspace">
        <div class="f4-saldo-left">
          <section id="v9KasInfo" class="f4-savings-kpis" aria-label="Ringkasan posisi kas">Memuat ringkasan...</section>
          <div class="f4-savings-utility">
            <button id="v9Sync" type="button" class="secondary" onclick="v9PostCash()">Cek kesesuaian kas</button>
          </div>
          <div id="v9CashCheckStatus" class="f4-savings-check-status" role="status" aria-live="polite" hidden></div>
        </div>
        <div class="f4-saldo-right">
          <div class="f4-savings-main">
            <section class="f4-savings-roster f4-savings-members" aria-label="Daftar saldo anggota">
              <div class="f4-savings-panel-title"><h3>Saldo anggota</h3></div>
              <div id="v9List">Memuat saldo warga...</div>
            </section>
            <section class="f4-savings-panel f4-savings-payout" aria-label="Formulir pencairan">
          <form id="v9Form" onsubmit="v9Cairkan(event)">
            <h3>Catat pencairan</h3>
            
            <div class="field f4-payout-member"><label for="v9Member">Warga penerima</label><select id="v9Member" required onchange="v9ShowBalance()"><option value="">Pilih warga</option></select></div>
            <div id="v9MemberBalance" class="f4-payout-available" role="status">Pilih warga terlebih dahulu.</div>
            <div class="field f4-payout-amount"><label for="v9Amount">Nominal dibayarkan (Rp)</label><input type="number" id="v9Amount" min="1" step="1" required></div>
            <div class="field f4-payout-receiver"><label for="v9Receiver">Nama penerima uang</label><input id="v9Receiver" required maxlength="100" placeholder="Nama warga / kuasa penerima"></div>
            <div class="field f4-payout-notes"><label for="v9Notes">Catatan (opsional)</label><input id="v9Notes" maxlength="300" placeholder="Misal: dibayar tunai saat kegiatan"></div>
            <button type="submit" class="wide f4-payout-submit">Catat sudah dibayar</button>
          </form>
          <div id="v9Notice" role="status"></div>
            </section>
          </div>
        </div>
      </div>
      <section class="f4-savings-history">
        <h3>Riwayat pencairan</h3>
        <div id="v9History">Belum dimuat.</div>
      </section>`;
    $('pagePengesahan').after(page);v28SetupSaldoFinder();
  }
  /* Ledger anggota: pencarian dan pagination tanpa memotong data dari Worker. */
  function v28SetupSaldoFinder(){
    const host=$('v9List');if(!host||host.dataset.f4FinderReady)return;
    host.dataset.f4FinderReady='1';
    const bar=__f4.globals.document.createElement('div');bar.className='f4-bs-saldo-finder';
    const search=__f4.globals.document.createElement('input');search.type='search';
    search.placeholder='Cari nama atau nomor rumah';
    search.setAttribute('aria-label','Cari saldo berdasarkan anggota atau nomor rumah');
    const status=__f4.globals.document.createElement('span');status.className='f4-bs-saldo-count';
    status.setAttribute('role','status');
    
    const field=__f4.globals.document.createElement('div');field.className='f4-bs-saldo-search';
    field.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
    field.append(search);bar.append(field);
    const heading=host.closest('.f4-savings-roster')?.querySelector('.f4-savings-panel-title');
    if(heading)heading.append(status);else bar.append(status);
    host.before(bar);
    // Semua anggota ada di tabel; pembatas hanya tinggi scroll, bukan jumlah data.
    const update=()=>{
      const all=[...host.querySelectorAll('.f4-saldo-row')];
      const query=search.value.trim().toLocaleLowerCase('id-ID');
      let matching=0;
      all.forEach(row=>{
        const visible=!query||(0,__f4.globals.String)(row.dataset.search||row.textContent).toLocaleLowerCase('id-ID').includes(query);
        row.hidden=!visible;if(visible)matching++;
      });
      status.textContent=!all.length?'Belum ada anggota bersaldo':
        query?(matching+' dari '+all.length+' bersaldo'):
        (all.length+' anggota bersaldo');
    };
    search.addEventListener('input',update);
    new __f4.globals.MutationObserver(update).observe(host,{childList:true});
    update();
  }

  function v9RenderKas(cash,sum){
    const hero=__f4.globals.document.createElement('div');hero.className='f4-saldo-hero';
    const primary=__f4.globals.document.createElement('div');primary.className='f4-saldo-primary';
    primary.innerHTML='<small>Total dana tercatat</small><strong></strong><span>Gabungan seluruh pos kas & tabungan</span>';
    primary.querySelector('strong').textContent=rupiah(cash.saldoKasTercatat);
    const parts=__f4.globals.document.createElement('div');parts.className='f4-saldo-parts';
    [
      ['Tabungan warga',sum],
      ['Kas bank sampah',cash.kasMilikBankRp],
      ['Kas lingkungan',cash.kasLingkunganRp]
    ].forEach(([label,value])=>{
      const tile=__f4.globals.document.createElement('div');tile.className='f4-saldo-part';
      tile.innerHTML='<small></small><strong></strong>';
      tile.querySelector('small').textContent=label;
      tile.querySelector('strong').textContent=rupiah(value);
      parts.append(tile);
    });
    hero.append(primary,parts);$('v9KasInfo').replaceChildren(hero);
  }

  async function v9Load(){if(!v9Nonce)v9Nonce='N'+__f4.globals.Date.now().toString(36)+__f4.globals.Math.random().toString(36).slice(2,12);$('v9List').textContent='Memuat saldo...';try{const [members,cash,history]=await __f4.globals.Promise.all([call('bsV9SaldoAdmin',token),call('bsV9StatusKasAdmin',token),call('bsV9RiwayatPencairan',token)]);v9Members=members;const sum=members.reduce((s,x)=>s+x.saldo,0);v9RenderKas(cash,sum);const select=$('v9Member'),old=select.value;select.replaceChildren(new __f4.globals.Option('Pilih warga',''));members.filter(m=>m.status.toLowerCase()==='aktif').forEach(m=>{const opt=new __f4.globals.Option(f4BankDisplayWargaName(m.nama)+' • '+m.rumah,m.wargaId);opt.dataset.fullName=m.nama||'';select.appendChild(opt)});select.value=old;v9ShowBalance();const list=$('v9List');const roster=__f4.globals.document.createElement('div');roster.className='f4-saldo-list';roster.setAttribute('role','list');
members.filter(m=>(0,__f4.globals.Number)(m.saldo)>0).sort((a,b)=>new __f4.globals.Intl.Collator('id',{numeric:true,sensitivity:'base'}).compare((0,__f4.globals.String)(a.rumah||''),(0,__f4.globals.String)(b.rumah||''))||(0,__f4.globals.String)(a.nama||'').localeCompare((0,__f4.globals.String)(b.nama||''),'id')).forEach(m=>{
 const row=__f4.globals.document.createElement('div');row.className='f4-saldo-row';row.setAttribute('role','listitem');
  const avatar=f4BankPersonAvatar(m.nama,{className:'f4-saldo-avatar',
    memberId:m.wargaId,hasAvatar:m.hasAvatar===true||m.hasAvatar===1||m.hasAvatar==='1'});
   row.dataset.balance='positive';row.dataset.search=[m.nama||'',m.rumah||'',f4BankDisplayWargaName(m.nama)].join(' ');
 const person=__f4.globals.document.createElement('div');person.className='f4-saldo-person';
 const name=__f4.globals.document.createElement('strong');name.className='f4-saldo-name';name.textContent=f4BankDisplayWargaName(m.nama);name.title=m.nama||'';
 const house=__f4.globals.document.createElement('small');house.className='f4-saldo-house';house.textContent=m.rumah||'—';
 const balance=__f4.globals.document.createElement('strong');balance.className='f4-saldo-amount';balance.textContent=rupiah(m.saldo);
 row.setAttribute('aria-label',name.textContent+', rumah '+house.textContent+', saldo '+balance.textContent);
 person.append(name,house);row.append(avatar,person,balance);roster.append(row);
});
if(!roster.childElementCount){const empty=__f4.globals.document.createElement('p');empty.className='f4-saldo-empty';empty.textContent='Belum ada anggota dengan saldo tabungan.';roster.append(empty)}list.replaceChildren(roster);const historyArea=$('v9History');historyArea.replaceChildren(...history.map(h=>{const div=__f4.globals.document.createElement('div');div.className='stat';div.style.marginBottom='8px';const a=__f4.globals.document.createElement('strong');a.textContent=f4BankDisplayWargaName(members.find(m=>(0,__f4.globals.String)(m.wargaId)===(0,__f4.globals.String)(h.wargaId||'').replace(/^member:/,''))?.nama)+' • '+rupiah(h.nominal);const p=__f4.globals.document.createElement('small');p.textContent=h.status+' • '+h.tanggal+' • '+h.catatan;div.append(a,p);
  if(h.id&&(0,__f4.globals.Number)(h.nominal)>0&&!/batal|ditolak|diproses|menunggu/i.test((0,__f4.globals.String)(h.status||''))){
   const member=members.find(m=>(0,__f4.globals.String)(m.wargaId)===(0,__f4.globals.String)(h.wargaId||'').replace(/^member:/,''));
   div.appendChild(f4BankReceiptIcon(h,()=>({
    scope:'bank',id:h.id,title:'Bukti Pencairan Tabungan',
    party:member?.nama||'Anggota Bank Sampah',house:member?.rumah||'-',
    date:h.tanggal||'-',method:'Dicatat pengurus',amount:(0,__f4.globals.Number)(h.nominal),
    amountLabel:'Tabungan Dicairkan',status:'DIBAYARKAN',
    details:[['Penerima',h.penerima||member?.nama||'-'],['Catatan',h.catatan||'-']],
    note:'Bukti pencairan tabungan yang sudah dibayar dan dicatat pengurus.'
   })));
  }
  return div}));if(!history.length)historyArea.textContent='Belum ada pencairan.';}catch(e){$('v9List').textContent='Gagal memuat: '+(e.message||e);}}
  function v9ShowBalance(){const member=v9Members.find(m=>m.wargaId===$('v9Member').value);$('v9MemberBalance').textContent=member?'Saldo tersedia '+f4BankDisplayWargaName(member.nama)+': '+rupiah(member.saldo):'Pilih warga terlebih dahulu.';}
  async function v9PostCash(){
    const button=$('v9Sync'),status=$('v9CashCheckStatus');
    if(!button||button.disabled)return;
    const label=button.textContent;
    button.disabled=true;
    button.textContent='Memeriksa kas...';
    note('v9CashCheckStatus','Memeriksa penjualan, alokasi hasil, dan buku kas. Tidak ada transaksi yang diubah.');
    if(status)status.dataset.checkState='loading';
    try{
      // Fungsi adapter hanya memeriksa data D1; tidak menambah/memposting kas.
      const result=await call('bsV9PostingKasPenjualan',token);
      const total=(0,__f4.globals.Number)(result?.diposting||0);
      const message=total>0
        ?'Kas sesuai. '+total+' batch disahkan cocok dengan catatan penjualan dan buku kas. Kas gabungan '+rupiah(result.kas)+'. Tidak ada transaksi baru.'
        :'Pemeriksaan selesai. Belum ada batch disahkan untuk dicocokkan. Kas gabungan '+rupiah(result.kas)+'.';
      note('v9CashCheckStatus',message);
      if(status)status.dataset.checkState='success';
    }catch(error){
      note('v9CashCheckStatus','Pemeriksaan belum berhasil: '+(error.message||error)+'. Tidak ada transaksi yang diubah. Periksa riwayat sebelum melakukan koreksi.',true);
      if(status)status.dataset.checkState='error';
    }finally{
      button.disabled=false;
      button.textContent=label;
    }
  }
  async function v9Cairkan(e){e.preventDefault();const member=v9Members.find(m=>m.wargaId===$('v9Member').value),nominal=(0,__f4.globals.Number)($('v9Amount').value),receiver=$('v9Receiver').value.trim();if(!member||!__f4.globals.Number.isSafeInteger(nominal)||nominal<=0||nominal>member.saldo){note('v9Notice','Nominal harus positif dan tidak melebihi saldo terkonfirmasi.',true);return;}if(!await __f4.window.f4UiDialog.confirm('Apakah uang '+rupiah(nominal)+' BENAR-BENAR sudah dibayarkan kepada '+receiver+' untuk tabungan '+member.nama+'?'))return;busy(e.target,true);note('v9Notice','Mencatat pencairan...');try{const r=await call('bsV9CairkanTabungan',token,{nonce:v9Nonce,wargaId:member.wargaId,nominal,penerima:receiver,catatan:$('v9Notes').value});v9Nonce='';e.target.reset();await v9Load();note('v9Notice','Pencairan '+r.id+' tercatat • saldo akhir '+rupiah(r.saldoAkhir)+'.');}catch(err){note('v9Notice','Gagal mencatat: '+(err.message||err)+'. Jika status Diproses, jangan ulangi sebelum pemeriksaan.',true);}finally{busy(e.target,false);}}
  let v10Nonce='',v10ReportData=null;
  function v10Setup(){if($('pageBiaya'))return;const nav=__f4.globals.document.createElement('button');nav.id='navBiaya';nav.className='secondary';nav.textContent='Pembelian & pengeluaran';nav.onclick=()=>goPage('biaya');$('navTabungan').after(nav);const reports=__f4.globals.document.createElement('button');reports.id='navLaporan';reports.className='secondary';reports.textContent='Laporan admin';reports.onclick=()=>goPage('laporan');nav.after(reports);const page=__f4.globals.document.createElement('div');page.id='pageBiaya';page.className='card hidden';page.innerHTML=`<h2>Pembelian dan pengeluaran</h2><div id="v10Budget" class="metric-grid">Memuat anggaran...</div><form id="v10ExpenseForm" class="block-gap" onsubmit="v10SaveExpense(event)"><div class="field"><label for="v10Type">Jenis transaksi</label><select id="v10Type" onchange="v10TypeChange()"><option value="Pengeluaran">Pengeluaran</option><option value="Pembelian">Pembelian barang</option></select></div><div class="field"><label for="v10Date">Tanggal</label><input type="date" id="v10Date" required></div><div class="field"><label for="v10Position">Pos dana</label><select id="v10Position"><option>Operasional</option><option>Kas Lorong</option><option>Cadangan</option></select></div><div class="field"><label for="v10Description">Keterangan / nama barang</label><input id="v10Description" required maxlength="200" placeholder="Contoh: pembelian timbangan digital"></div><div class="field"><label for="v10Qty">Jumlah</label><input type="number" id="v10Qty" min="0.001" step="0.001" value="1" required oninput="v10Calc()"></div><div class="field"><label for="v10Unit">Satuan</label><input id="v10Unit" maxlength="40" value="unit" placeholder="unit, dus, lembar"></div><div class="field"><label for="v10Price">Harga satuan (Rp)</label><input type="number" id="v10Price" min="1" step="1" required oninput="v10Calc()"></div><div class="summary-box"><div><small>Total dibayar</small><strong id="v10Amount" style="display:block">Rp0</strong></div></div><div class="field block-gap"><label for="v10Vendor">Toko / penerima pembayaran</label><input id="v10Vendor" maxlength="120"></div><div id="v10InventoryBox" class="field hidden"><label><input id="v10Inventory" type="checkbox" style="width:auto"> Masukkan pembelian ke daftar inventaris</label></div><div class="field"><label for="v10Proof">Nomor nota / tautan bukti (opsional)</label><input id="v10Proof" maxlength="500"></div><div class="field"><label for="v10Notes">Catatan (opsional)</label><input id="v10Notes" maxlength="300"></div><button type="submit" class="wide">Catat biaya yang sudah dibayar</button></form><div id="v10ExpenseNotice" role="status"></div><h2 class="block-gap" style="font-size:16px">Riwayat biaya</h2><div id="v10History">Memuat...</div>`; $('pageTabungan').after(page);const report=__f4.globals.document.createElement('div');report.id='pageLaporan';report.className='card hidden';report.innerHTML=`<h2>Laporan administrasi</h2><p class="desc"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg> Laporan memuat data warga.</p><div class="field"><label for="v10Month">Periode laporan</label><input id="v10Month" type="month"></div><div class="field"><label for="v10ReportType">Jenis data</label><select id="v10ReportType" onchange="v10RenderReport()"><option value="semua">Seluruh laporan</option><option value="setoran">Setoran warga</option><option value="penjualan">Penjualan lapak</option><option value="pengeluaran">Pembelian & pengeluaran</option><option value="mutasi">Riwayat tabungan</option></select></div><div class="toolbar"><button class="secondary" onclick="v10LoadReport()">Muat laporan</button><button onclick="v10PrintReport()">Cetak / PDF</button><button class="ghost" onclick="v10DownloadCSV()">Unduh CSV</button></div><div id="v10ReportSummary" class="metric-grid block-gap"></div><div id="v10ReportTable" class="block-gap">Belum dimuat.</div><div id="v10ReportNotice" role="status"></div>`;page.after(report);const printable=__f4.globals.document.createElement('div');printable.id='v10Print';printable.className='hidden';__f4.globals.document.body.appendChild(printable);}
  function v10TypeChange(){$('v10InventoryBox').classList.toggle('hidden',$('v10Type').value!=='Pembelian');if($('v10Type').value!=='Pembelian')$('v10Inventory').checked=false;}
  function v10Calc(){const total=__f4.globals.Math.round((0,__f4.globals.Number)($('v10Qty').value||0)*(0,__f4.globals.Number)($('v10Price').value||0));$('v10Amount').textContent=rupiah(total);}
  async function v10LoadBiaya(){if(!v10Nonce)v10Nonce='N'+__f4.globals.Date.now().toString(36)+__f4.globals.Math.random().toString(36).slice(2,12);$('v10Date').value=$('v10Date').value||bankLocalToday();v10TypeChange();try{const [budget,history]=await __f4.globals.Promise.all([call('bsV10KasPosAdmin',token),call('bsV10PengeluaranAdmin',token)]);const target=$('v10Budget');target.replaceChildren(metric('Kas gabungan',rupiah(budget.kasGabungan)),...budget.pos.map(x=>metric('Sisa '+x.nama,rupiah(x.tersedia))));const h=$('v10History');h.replaceChildren(...history.map(x=>{const b=__f4.globals.document.createElement('div');b.className='stat';b.style.marginBottom='9px';const title=__f4.globals.document.createElement('strong');title.textContent=(x.kategori||x.jenis||'Pengeluaran')+' • '+rupiah(x.nominal);const info=__f4.globals.document.createElement('small');info.textContent=[x.tanggal,x.keterangan,x.pos,x.status,x.inventarisId?'Inventaris '+x.inventarisId:''].filter(__f4.globals.Boolean).join(' • ');b.append(title,info);
 if(x.id&&(0,__f4.globals.Number)(x.nominal)>0&&(0,__f4.globals.String)(x.status||'').toLowerCase()==='lunas'){
  b.appendChild(f4BankReceiptIcon(x,()=>({
   scope:'bank',id:x.id,title:/pembelian/i.test((0,__f4.globals.String)(x.kategori||x.jenis||''))?'Bukti Pembelian Bank Sampah':'Bukti Pengeluaran Bank Sampah',
   party:x.toko||x.vendor||'Bank Sampah Flamboyan 4',house:'Kas Bank Sampah',date:x.tanggal||'-',
   method:x.metode||'Dicatat pengurus',amount:(0,__f4.globals.Number)(x.nominal),amountLabel:'Dana Dibayarkan',
   status:'SUDAH DIBAYAR',
   details:[['Jenis',x.kategori||x.jenis||'-'],['Pos dana',x.pos||'-'],
    ['Keterangan',x.keterangan||'-'],['Nomor nota',x.bukti||'-']],
   note:'Bukti pengeluaran yang sudah lunas dan tercatat dalam kas Bank Sampah.'
  })));
 }
 return b}));if(!history.length)h.textContent='Belum ada pembelian atau pengeluaran.';}catch(e){$('v10History').textContent='Gagal memuat: '+(e.message||e);}}
  async function v10SaveExpense(e){e.preventDefault();const nominal=__f4.globals.Math.round((0,__f4.globals.Number)($('v10Qty').value)*(0,__f4.globals.Number)($('v10Price').value));if(!(nominal>0)){note('v10ExpenseNotice','Isi jumlah dan harga terlebih dahulu.',true);return;}if(!await __f4.window.f4UiDialog.confirm('Apakah biaya '+$('v10Type').value+' '+rupiah(nominal)+' SUDAH DIBAYAR? Transaksi akan mengurangi kas dan anggaran pos.'))return;busy(e.target,true);note('v10ExpenseNotice','Menyimpan biaya...');try{const r=await call('bsV10CatatBiaya',token,{nonce:v10Nonce,tanggal:$('v10Date').value,jenis:$('v10Type').value,pos:$('v10Position').value,keterangan:$('v10Description').value,jumlah:(0,__f4.globals.Number)($('v10Qty').value),hargaSatuan:(0,__f4.globals.Number)($('v10Price').value),satuan:$('v10Unit').value,toko:$('v10Vendor').value,inventaris:$('v10Inventory').checked,bukti:$('v10Proof').value,catatan:$('v10Notes').value});v10Nonce='';e.target.reset();v10Calc();await v10LoadBiaya();note('v10ExpenseNotice',r.id+' tercatat: '+rupiah(r.nominal)+(r.inventarisId?' • inventaris '+r.inventarisId:''));__f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-bank-expense-saved',{detail:{id:r.id}}));}catch(err){note('v10ExpenseNotice','Gagal: '+(err.message||err)+'. Jika ada Diproses, jangan ulangi sebelum audit.',true);}finally{busy(e.target,false);}}
  async function v10LoadReport(){const tokenLoading=__f4.globals.F4Loading.begin('v10ReportNotice','Memuat laporan Bank Sampah…');try{v10ReportData=await call('bsV10LaporanAdmin',token,$('v10Month').value);v10RenderReport();__f4.globals.F4Loading.success('v10ReportNotice',tokenLoading);}catch(e){__f4.globals.F4Loading.error('v10ReportNotice','Gagal: '+(e.message||e),tokenLoading);}}
  const v10Specs={setoran:{title:'Setoran warga',fields:[['no','No'],['warga','Nama'],['total','Total']]},penjualan:{title:'Penjualan lapak',fields:[['lapak','Lapak'],['tanggal','Tanggal'],['bruto','Bruto Rp'],['diterima','Diterima Rp'],['disahkan','Disahkan']]},pengeluaran:{title:'Pembelian & pengeluaran',fields:[['jenis','Jenis'],['tanggal','Tanggal'],['keterangan','Keterangan'],['pos','Pos'],['nominal','Nominal Rp'],['status','Status']]},mutasi:{title:'Riwayat tabungan',fields:[['warga','Nama warga'],['tanggal','Tanggal'],['jenis','Jenis'],['kredit','Masuk Rp'],['debit','Dicairkan Rp'],['koreksi','Koreksi Rp']]},setoranBank:{title:'Setoran milik Bank Sampah',fields:[['tanggal','Tanggal'],['barang','Jenis sampah'],['berat','Berat (kg)'],['diterima','Diterima Rp'],['keterangan','Catatan']]}};
  function v10SelectedSections(){
    if(!v10ReportData)return[];
    const choices=[...__f4.globals.document.querySelectorAll('#v33ReportControls input[data-report-section]:checked')].map(el=>el.value);
    const active=__f4.globals.document.getElementById('v33ReportControls')?choices:null;
    const legacy=$('v10ReportType')?.value||'semua';
    return __f4.globals.Object.entries(v10Specs).filter(([key])=>active?active.includes(key):(legacy==='semua'||key===legacy))
      .map(([key,spec])=>({key,spec,rows:v10ReportData[key]||[]}));
  }
  // Semua bagian laporan menggunakan garis kisi global 16 unit.
  // Tabel 5 kolom menggabungkan dua slot tengah; garis kolom lain tetap
  // tepat sejajar dengan tabel 6 kolom, seperti merged cells di Excel.
  const v10ReportGridUnits=16;
  const v10ReportGridSix=[4,2,2,2,3,3];
  const v10ReportGridFive=[4,2,4,3,3];
  const v10ReportOrder={
    // Kolom deskripsi lebar ditaruh di kolom pertama yang berukuran 4 unit.
    pengeluaran:['keterangan','tanggal','jenis','pos','nominal','status'],
    setoranBank:['barang','tanggal','berat','diterima','keterangan']
  };
  function v10ReportFields(spec,kind){
    const source=kind==='setoran'?[
      ['no','No'],['warga','Nama'],
      ...(v10ReportData?.kodeBarang||[]).map(item=>['item_'+item.kode,item.kode]),
      ['total','Total']
    ]:spec.fields;
    const preferred=v10ReportOrder[kind];
    if(kind==='setoran')return source;
    const ordered=preferred?
      preferred.map(key=>source.find(([field])=>field===key)).filter(__f4.globals.Boolean)
        .concat(source.filter(([field])=>!preferred.includes(field))):source;
    return [['no','No'],...ordered];
  }
  // Group by the weighing date, not just month: two rounds can occur in one month.
  function f4BankPeriodGroups(rows){
    const byDate=new __f4.globals.Map();
    for(const record of rows){
      const date=(0,__f4.globals.String)(record.tanggal||'').slice(0,10);
      if(!byDate.has(date))byDate.set(date,[]);
      byDate.get(date).push(record);
    }
    return [...byDate.keys()].sort().map(date=>{
      const records=byDate.get(date);
      const valid=/^\d{4}-\d{2}-\d{2}$/.test(date);
      const stamp=valid?new __f4.globals.Date(date+'T12:00:00Z'):null;
      const dateLabel=stamp&&!__f4.globals.Number.isNaN(stamp.getTime())?
        new __f4.globals.Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(stamp):
        (date||'Tanggal belum tercatat');
      const weight=records.reduce((sum,row)=>sum+((0,__f4.globals.Number)(row.total??row.beratTimbangKg??row.beratKg)||0),0);
      return {date,rows:records,label:'Periode '+dateLabel+' · '+records.length+' setoran · '+
        new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format(weight)+' kg'};
    });
  }
  function f4BankPeriodHeading(label,columns){
    const tr=__f4.globals.document.createElement('tr');tr.className='f4-report-period-row';
    const th=__f4.globals.document.createElement('th');th.colSpan=columns;th.scope='rowgroup';
    th.className='f4-report-period-label';th.textContent=label;
    tr.appendChild(th);return tr;
  }
  function v10MakeTable(spec,rows,kind){
    const fields=v10ReportFields(spec,kind);
    const baseCount=kind==='setoran'?fields.length:fields.length-1;
    const spans=kind==='mutasi'?[4,2,4,2,2,2]:baseCount===6?v10ReportGridSix:
      baseCount===5?v10ReportGridFive:null;
    const table=__f4.globals.document.createElement('table');
    table.className='f4-admin-report-table';
    table.dataset.gridUnits=(0,__f4.globals.String)(v10ReportGridUnits);
    table.dataset.reportKind=kind;
    if(kind==='setoran'){
      const itemCount=__f4.globals.Math.max(0,fields.length-3);
      table.style.setProperty('--f4-setoran-min-width',(280+itemCount*38)+'px');
    }
    // Jenis barang bisa 11+ kolom; nama dan tanggal tetap cukup lebar.
    const colgroup=__f4.globals.document.createElement('colgroup');
    const columnPercents=kind==='setoran'?
      [4,32,...(0,__f4.globals.Array)(__f4.globals.Math.max(0,fields.length-3)).fill(58/__f4.globals.Math.max(1,fields.length-3)),6]:
      [5,...(spans||(0,__f4.globals.Array)(baseCount).fill(1)).map(units=>
        units/(spans?spans.reduce((sum,n)=>sum+n,0):baseCount)*95)];
    columnPercents.forEach(percent=>{
      const col=__f4.globals.document.createElement('col');
      col.style.width=percent+'%';
      colgroup.appendChild(col);
    });
    table.appendChild(colgroup);
    const thead=__f4.globals.document.createElement('thead'),heading=__f4.globals.document.createElement('tr');
    const numeric=new __f4.globals.Set(['berat','beratTimbang','nilai','bruto','diterima','nominal','kredit','debit','koreksi']);
    const isNumeric=key=>numeric.has(key)||key==='no'||kind==='setoran'&&(key==='total'||key.startsWith('item_'));
    const isCentered=key=>key==='no'||kind==='setoran'&&(key==='total'||key.startsWith('item_'));
    fields.forEach(([key,label])=>{
      const th=__f4.globals.document.createElement('th');th.scope='col';th.textContent=label;
      if(isNumeric(key))th.classList.add('f4-report-num');
      if(isCentered(key)||key==='tanggal'||key==='status'||key==='disahkan')th.classList.add('f4-report-center');
      heading.appendChild(th);
    });
    thead.appendChild(heading);table.appendChild(thead);
    const tbody=__f4.globals.document.createElement('tbody');
    const displayGroups=kind==='setoran'?f4BankPeriodGroups(rows):[{rows}];
    displayGroups.forEach(group=>{
      if(kind==='setoran')tbody.appendChild(f4BankPeriodHeading(group.label,fields.length));
      group.rows.forEach((record,rowIndex)=>{
        const tr=__f4.globals.document.createElement('tr');
        if(/batal/i.test((0,__f4.globals.String)(record.status||'')))tr.classList.add('f4-report-row-canceled');
        fields.forEach(([key,label])=>{
        const td=__f4.globals.document.createElement('td');td.dataset.label=label;
        const value=key==='no'?rowIndex+1:record[key];
        if(kind==='setoran'){
          if(key.startsWith('item_')&&!((0,__f4.globals.Number)(value)>0)){
            td.classList.add('f4-report-empty-cell');
            td.setAttribute('aria-label',label+': tidak ada setoran');
          }
          td.textContent=key.startsWith('item_')?((0,__f4.globals.Number)(value)>0?
            (0,__f4.globals.Number)(value).toLocaleString('id-ID',{maximumFractionDigits:3}):''):
            key==='total'?((0,__f4.globals.Number)(value)||0).toLocaleString('id-ID',{maximumFractionDigits:3}):
            key==='tanggal'&&/^\d{4}-\d{2}-\d{2}$/.test((0,__f4.globals.String)(value||''))?
              (0,__f4.globals.String)(value).slice(8,10)+'/'+(0,__f4.globals.String)(value).slice(5,7)+'/'+(0,__f4.globals.String)(value).slice(2,4):
            (0,__f4.globals.String)(value??'');
        }else{
          td.textContent=typeof value==='boolean'?(value?'Ya':'Tidak'):
            (numeric.has(key)||key==='no')&&typeof value==='number'?
              value.toLocaleString('id-ID',{maximumFractionDigits:3}):(0,__f4.globals.String)(value??'');
        }
        if(isNumeric(key))td.classList.add('f4-report-num');
        if(isCentered(key)||key==='tanggal'||key==='status'||key==='disahkan')td.classList.add('f4-report-center');
        if(key==='status'){
          td.classList.add('f4-report-status');
          if(/batal/i.test(td.textContent))td.dataset.state='batal';
          else if(/sah|final|selesai|lunas/i.test(td.textContent))td.dataset.state='sah';
        }
        tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    });
    if(!rows.length){
      const tr=__f4.globals.document.createElement('tr'),td=__f4.globals.document.createElement('td');
      td.colSpan=fields.length;td.className='f4-report-empty';
      td.textContent='Tidak ada transaksi pada periode ini.';
      tr.appendChild(td);tbody.appendChild(tr);
    }
    table.appendChild(tbody);return table;
  }

  function f4BankMakeCodeLegend(items){
    if(!items.length)return null;
    const section=__f4.globals.document.createElement('section');section.className='f4-bank-code-legend';
    const title=__f4.globals.document.createElement('h3');title.textContent='Keterangan kode barang';
    const unit=__f4.globals.document.createElement('p');unit.textContent='Semua angka berat menggunakan kilogram (kg).';
    const grid=__f4.globals.document.createElement('div');grid.className='f4-bank-code-grid';
    for(const item of items){
      const entry=__f4.globals.document.createElement('span'),code=__f4.globals.document.createElement('strong');
      code.textContent=item.kode;entry.append(code,__f4.globals.document.createTextNode(' = '+item.nama));
      grid.appendChild(entry);
    }
    section.append(title,unit,grid);return section;
  }
  function v10MakeCodeLegend(){return f4BankMakeCodeLegend(v10ReportData?.kodeBarang||[]);}
  function v10RenderReport(){
    if(!v10ReportData)return;
    if($('v37MemberSelect'))v37FillMemberChoices().catch(error=>
      note('v10ReportNotice','Gagal memuat daftar warga: '+(error.message||error),true));
    const r=v10ReportData.ringkasan,summary=$('v10ReportSummary');
    summary.replaceChildren(
      v10CompactSummaryMetric('Setoran tercatat',r.jumlahSetoran),v10CompactSummaryMetric('Penjualan',r.jumlahPenjualan),
      v10CompactSummaryMetric('Diterima lapak',rupiah(r.diterima)),v10CompactSummaryMetric('Kas saat laporan',rupiah(r.saldoKasKini))
    );
    let extra=$('v33ReportMore');
    if(!extra){
      extra=__f4.globals.document.createElement('details');extra.id='v33ReportMore';extra.className='v33-report-more';
      const label=__f4.globals.document.createElement('summary');label.className='v33-report-table-title';label.textContent='Rincian dana';
      const grid=__f4.globals.document.createElement('div');grid.id='v33ReportMoreMetrics';grid.className='f4-report-money-grid';
      extra.append(label,grid);summary.insertAdjacentElement('afterend',extra);
    }
    const moneyRow=(label,value)=>{
      const item=v10CompactSummaryMetric(label,value);
      item.className='f4-report-money-row';
      return item;
    };
    $('v33ReportMoreMetrics').replaceChildren(
      moneyRow('Setoran tersedia',r.jumlahSetoranTersedia??0),moneyRow('Hak warga',rupiah(r.hakWargaDikredit)),
      moneyRow('Tabungan dicairkan',rupiah(r.tabunganDicairkan)),moneyRow('Biaya dibayar',rupiah(r.biaya)),
      moneyRow('Setoran milik Bank',rupiah(r.setoranBankRp||0))
    );
    const area=$('v10ReportTable');area.replaceChildren();
    const sections=v10SelectedSections();
    if(!sections.length){area.textContent='Pilih jenis laporan.';return;}
    const emptyNames=[];
    sections.forEach(({key,spec,rows})=>{
      if(!rows.length){emptyNames.push(spec.title);return;}
      const section=__f4.globals.document.createElement('details');section.className='f4-report-section';section.name='f4-bank-report-sections';section.open=area.querySelectorAll('.f4-report-section').length===0;
      const title=__f4.globals.document.createElement('summary');title.className='v33-report-table-title';
      const concise={setoran:'Setoran',penjualan:'Penjualan',pengeluaran:'Pengeluaran',tabungan:'Tabungan',setoranBank:'Setoran bank'};
      const name=__f4.globals.document.createElement('span');name.textContent=concise[key]||spec.title;
      const count=__f4.globals.document.createElement('small');count.textContent=(0,__f4.globals.String)(rows.length);count.setAttribute('aria-label',rows.length+' transaksi');
      title.append(name,count);
      const scroll=__f4.globals.document.createElement('div');scroll.className='f4-report-table-scroll';
      scroll.appendChild(v10MakeTable(spec,rows,key));
      section.append(title,scroll);area.appendChild(section);
    });
    if(emptyNames.length){
      const detail=__f4.globals.document.createElement('details');detail.className='f4-report-empty-group';
      const summary=__f4.globals.document.createElement('summary');
      summary.textContent=emptyNames.length===sections.length
        ?'Tidak ada transaksi'
        :emptyNames.length+' kategori kosong';
      const details=__f4.globals.document.createElement('p');details.textContent=emptyNames.join(' · ');
      detail.append(summary,details);area.append(detail);
    }
    if(sections.some(section=>section.key==='setoran')){
      const legend=v10MakeCodeLegend();if(legend)area.appendChild(legend);
    }
  }
  function v10PrintReport(){if(!v10ReportData){note('v10ReportNotice','Muat laporan dahulu.',true);return;}const root=$('v10Print');root.replaceChildren();const title=__f4.globals.document.createElement('h1');title.textContent='BANK SAMPAH FLAMBOYAN 4';const sub=__f4.globals.document.createElement('p');sub.textContent='Laporan administrasi • '+v10ReportData.periode+' • Dicetak '+new __f4.globals.Date().toLocaleDateString('id-ID');root.append(title,sub);const summary=__f4.globals.document.createElement('p');const r=v10ReportData.ringkasan;summary.textContent='Setoran '+r.jumlahSetoran+' | Penjualan '+r.jumlahPenjualan+' | Uang diterima '+rupiah(r.diterima)+' | Hak warga '+rupiah(r.hakWargaDikredit)+' | Dicairkan '+rupiah(r.tabunganDicairkan)+' | Biaya '+rupiah(r.biaya)+' | Setoran Bank '+rupiah(r.setoranBankRp||0);root.appendChild(summary);v10SelectedSections().forEach(({key,spec,rows})=>{const heading=__f4.globals.document.createElement('h2');heading.textContent=spec.title;root.append(heading,v10MakeTable(spec,rows,key));});if(v10SelectedSections().some(section=>section.key==='setoran')){const legend=v10MakeCodeLegend();if(legend)root.append(legend);}const footer=__f4.globals.document.createElement('p');footer.style.marginTop='28px';footer.textContent='Mengetahui, Humas Flamboyan 4 — Heri Juwandi';root.appendChild(footer);__f4.window.print();}
  function v10DownloadCSV(){if(!v10ReportData){note('v10ReportNotice','Muat laporan dahulu.',true);return;}const sections=v10SelectedSections(),lines=[];if(!sections.length){note('v10ReportNotice','Pilih minimal satu jenis data.',true);return;}const safe=value=>{let s=(0,__f4.globals.String)(value??'');if(/^[=+@\-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};sections.forEach(({key,spec,rows})=>{
    lines.push([safe(spec.title)]);const fields=v10ReportFields(spec,key);
    lines.push(fields.map(([,label])=>safe(label)));
    const groups=key==='setoran'?f4BankPeriodGroups(rows):[{rows}];
    groups.forEach(group=>{
      if(key==='setoran')lines.push([safe(group.label)]);
      group.rows.forEach((r,index)=>lines.push(fields.map(([field])=>
        safe(field==='no'?index+1:(field.startsWith('item_')?(r[field]||''):r[field])))));
    });lines.push([]);
  });if(sections.some(section=>section.key==='setoran')){lines.push([safe('Keterangan kode barang')]);(v10ReportData.kodeBarang||[]).forEach(item=>lines.push([safe(item.kode),safe(item.nama)]));lines.push([]);}const csv='\ufeff'+lines.map(r=>r.join(',')).join('\r\n');const blob=new __f4.globals.Blob([csv],{type:'text/csv;charset=utf-8'}),url=__f4.globals.URL.createObjectURL(blob),link=__f4.globals.document.createElement('a');link.href=url;link.download='BankSampah_Flamboyan4_'+(v10ReportData.periode||'semua')+'_'+sections.map(x=>x.key).join('-')+'.csv';__f4.globals.document.body.appendChild(link);link.click();link.remove();(0,__f4.globals.setTimeout)(()=>__f4.globals.URL.revokeObjectURL(url),3000);}
  let v11Albums=[];
  function v11Setup(){if($('v11Public'))return;const pub=__f4.globals.document.createElement('section');pub.id='v11Public';pub.className='hidden';pub.innerHTML=`<div class="public-hero"><div class="toolbar"><div><span class="tag"><img src="/assets/icons/bank.svg" width="18" height="18" alt="" aria-hidden="true"> Bersama menjaga lingkungan</span><h1>Bank Sampah Flamboyan 4</h1><p>Setor sampah, rawat lingkungan, dan ikuti perkembangan kegiatan warga.</p></div><button onclick="v11ShowLogin()">Masuk akun warga / admin</button></div></div><div id="v11Metrics" class="metric-grid"></div><div class="public-section"><h2>Program dan perkembangan</h2><div id="v11ProgressCards" class="public-grid">Memuat...</div></div><div class="public-section"><h2>Dokumentasi kegiatan</h2><div id="v11AlbumCards" class="public-grid">Memuat...</div><div id="v11MediaDetail"></div></div><div class="public-section"><h2>Inventaris kegiatan</h2><div id="v11InventoryCards" class="public-grid">Memuat...</div></div><div class="public-section"><div class="notice">Data tabungan dan identitas pribadi warga hanya tersedia melalui akses akun yang sesuai. Informasi publik tidak menampilkan saldo pribadi.</div></div>`;$('authView').before(pub);const items=[['Kegiatan','Input progres'],['Dokumentasi','Kelola dokumentasi'],['Inventaris','Input inventaris']];items.forEach(([id,label])=>{const nav=__f4.globals.document.createElement('button');nav.id='nav'+id;nav.className='secondary';nav.textContent=label;nav.onclick=()=>goPage(id.toLowerCase());$('navLaporan').after(nav)});const activity=__f4.globals.document.createElement('div');activity.id='pageKegiatan';activity.className='card hidden';activity.innerHTML=`<h2>Input perkembangan Bank Sampah</h2><form onsubmit="v11SaveProgress(event)"><div class="field"><label for="v11ProDate">Tanggal kegiatan</label><input type="date" id="v11ProDate" required></div><div class="field"><label for="v11ProTitle">Judul kegiatan</label><input id="v11ProTitle" required maxlength="160"></div><div class="field"><label for="v11ProStep">Tahap / langkah</label><input id="v11ProStep" maxlength="100" placeholder="Contoh: persiapan drop point"></div><div class="field"><label for="v11ProDesc">Uraian perkembangan</label><textarea id="v11ProDesc" rows="4" maxlength="1500"></textarea></div><div class="field"><label for="v11ProStatus">Status kegiatan</label><select id="v11ProStatus"><option>Perencanaan</option><option>Berjalan</option><option>Selesai</option></select></div><div class="field"><label for="v11ProAgenda">Agenda berikutnya</label><input id="v11ProAgenda" maxlength="400"></div><div class="field"><label for="v11ProPhoto">Tautan foto HTTPS (opsional)</label><input id="v11ProPhoto" type="url" placeholder="https://drive.google.com/..."></div><div class="field"><label><input id="v11ProPublic" type="checkbox" checked style="width:auto"> Tampilkan di portal publik</label></div><button type="submit" class="wide">Simpan perkembangan</button></form><div id="v11ProNotice" role="status"></div>`;$('pageLaporan').after(activity);const docs=__f4.globals.document.createElement('div');docs.id='pageDokumentasi';docs.className='card hidden';docs.innerHTML=`<h2>Kelola album dokumentasi</h2><div class="pill-note">Unggah foto/video ke Google Drive atau YouTube terlebih dahulu, lalu tempel tautannya. File besar tidak disimpan di Spreadsheet.</div><form onsubmit="v11SaveAlbum(event)"><h2 style="font-size:16px">Buat album</h2><div class="field"><label for="v11AlbumDate">Tanggal kegiatan</label><input type="date" id="v11AlbumDate" required></div><div class="field"><label for="v11AlbumTitle">Judul album</label><input id="v11AlbumTitle" required maxlength="160"></div><div class="field"><label for="v11AlbumDesc">Deskripsi</label><textarea id="v11AlbumDesc" rows="3" maxlength="1000"></textarea></div><div class="field"><label for="v11AlbumCover">Link foto sampul HTTPS (opsional)</label><input type="url" id="v11AlbumCover"></div><div class="field"><label for="v11AlbumMediaUrl">Tautan foto/video Google Drive HTTPS (opsional)</label><input id="v11AlbumMediaUrl" type="url" placeholder="https://drive.google.com/..."></div><div class="field"><label for="v11AlbumMediaType">Jenis media</label><select id="v11AlbumMediaType"><option>Foto</option><option>Video</option></select></div><div class="field"><label><input type="checkbox" id="v11AlbumPublic" checked style="width:auto"> Tampilkan di portal publik</label></div><button type="submit" class="wide">Simpan album</button></form><div id="v11AlbumNotice" role="status"></div><div class="divider block-gap"></div><form onsubmit="v11SaveMedia(event)"><h2 style="font-size:16px">Tambahkan foto / video ke album</h2><div class="field"><label for="v11MediaAlbum">Pilih album</label><select id="v11MediaAlbum" required></select></div><div class="field"><label for="v11MediaType">Jenis media</label><select id="v11MediaType"><option>Foto</option><option>Video</option></select></div><div class="field"><label for="v11MediaURL">Tautan foto / video HTTPS</label><input type="url" id="v11MediaURL" required></div><div class="field"><label for="v11MediaCaption">Keterangan</label><input id="v11MediaCaption" maxlength="350"></div><button type="submit" class="wide">Simpan media</button></form><div id="v11MediaNotice" role="status"></div>`;activity.after(docs);
docs.querySelectorAll('form').forEach(form=>{form.hidden=true;form.setAttribute('aria-hidden','true')});
const docsHeader=docs.querySelector('h2');if(docsHeader)docsHeader.textContent='Dokumentasi Bank Sampah';
const centralUpload=__f4.globals.document.createElement('div');centralUpload.className='notice';
centralUpload.innerHTML='<strong>Unggah dokumentasi sekarang terpusat di Portal Utama.</strong><p>Foto dan album yang diberi kategori Bank Sampah otomatis muncul di galeri ini.</p><a href="/dokumentasi/" class="btn" style="display:inline-flex;padding:10px 14px;background:#2f7b4c;color:white;border-radius:10px;text-decoration:none">Buka Galeri Portal Utama</a>';
docs.querySelector('.pill-note')?.replaceWith(centralUpload);
const inv=__f4.globals.document.createElement('div');inv.id='pageInventaris';inv.className='card hidden';inv.innerHTML=`<h2>Inventaris Bank Sampah</h2><form onsubmit="v11SaveInventory(event)"><div class="field"><label for="v11InvName">Nama barang</label><input id="v11InvName" maxlength="160" required></div><div class="field"><label for="v11InvAmount">Jumlah</label><input id="v11InvAmount" type="number" min="0.001" step="0.001" value="1" required></div><div class="field"><label for="v11InvUnit">Satuan</label><input id="v11InvUnit" maxlength="40" value="unit" required placeholder="unit, kg, dus"></div><div class="field"><label for="v11InvCategory">Kategori</label><input id="v11InvCategory" maxlength="100" placeholder="Contoh: alat timbang"></div><div class="field"><label for="v11InvLocation">Lokasi</label><input id="v11InvLocation" maxlength="100" placeholder="Contoh: drop point A6/08"></div><div class="field"><label for="v11InvPhoto">Link foto HTTPS (opsional)</label><input type="url" id="v11InvPhoto"></div><button type="submit" class="wide">Simpan inventaris</button></form><div id="v11InvNotice" role="status"></div>`;docs.after(inv);}
  function v11ShowPublic(){v11Setup();$('authView').classList.add('hidden');$('dashboardView').classList.add('hidden');$('v11Public').classList.remove('hidden');v11LoadPublic();}
  function v11ShowLogin(){$('v11Public').classList.add('hidden');if(profile&&token)showDashboard(profile);else $('authView').classList.remove('hidden');}
  function v11External(url,label){const a=__f4.globals.document.createElement('a');a.textContent=label||'Buka media';if(/^https:\/\//i.test(url)){a.href=url;a.target='_blank';a.rel='noopener noreferrer';}else a.textContent='Tautan belum tersedia';return a;}
  function v11Tile(title,description){const b=__f4.globals.document.createElement('div');b.className='public-tile';const h=__f4.globals.document.createElement('h3');h.textContent=title;const p=__f4.globals.document.createElement('p');p.textContent=description||'';b.append(h,p);return b;}
  function v11AttachImage(tile,url){if(!/^https:\/\//i.test(url))return;if(!/\.(png|jpe?g|webp)(\?|$)/i.test(url))return;const pic=__f4.globals.document.createElement('img');pic.className='public-image';pic.alt='Foto kegiatan';pic.loading='lazy';pic.src=url;tile.appendChild(pic);}
  async function v11LoadPublic(){const prog=$('v11ProgressCards'),albums=$('v11AlbumCards'),inv=$('v11InventoryCards');prog.textContent='Memuat perkembangan...';try{const [home,items]=await __f4.globals.Promise.all([call('bsV11PublicHome'),call('bsV11PublicAlbums')]);$('v11Metrics').replaceChildren(metric('Anggota aktif',home.anggotaAktif),metric('Jenis barang',home.jenisBarang),metric('Berat terkonfirmasi',kg(home.beratTerkonfirmasi)),metric('Perkembangan publik',home.kegiatan));prog.replaceChildren(...home.progres.map(p=>{const c=v11Tile(p.judul||p.langkah,p.deskripsi);const small=__f4.globals.document.createElement('small');small.textContent=[p.tanggal,p.status,p.agenda?'Agenda: '+p.agenda:''].filter(__f4.globals.Boolean).join(' • ');c.appendChild(small);v11AttachImage(c,p.foto);if(p.foto)c.appendChild(v11External(p.foto,'Lihat foto'));return c}));if(!home.progres.length)prog.textContent='Belum ada pembaruan kegiatan.';v11Albums=items;v11RenderAlbums();inv.replaceChildren(...home.inventaris.map(x=>{const c=v11Tile(x.nama,x.jumlah+' • '+x.kondisi);v11AttachImage(c,x.foto);if(x.foto)c.appendChild(v11External(x.foto,'Lihat foto'));return c}));if(!home.inventaris.length)inv.textContent='Inventaris belum dipublikasikan.';}catch(e){prog.textContent='Informasi belum dapat dimuat: '+(e.message||e);}}
  function v11RenderAlbums(){const area=$('v11AlbumCards');area.replaceChildren(...v11Albums.map(a=>{const tile=v11Tile(a.judul,a.tanggal+' • '+a.deskripsi);v11AttachImage(tile,a.sampul);const btn=__f4.globals.document.createElement('button');btn.className='secondary';btn.textContent='Lihat album ('+a.media.length+')';btn.onclick=()=>v11OpenAlbum(a.id);tile.appendChild(btn);return tile}));$('v11MediaDetail').replaceChildren();if(!v11Albums.length)area.textContent='Album dokumentasi belum tersedia.';}
  function v11OpenAlbum(id){const album=v11Albums.find(a=>a.id===id);if(!album)return;const area=$('v11MediaDetail');const wrap=__f4.globals.document.createElement('div');wrap.className='public-section';const toolbar=__f4.globals.document.createElement('div');toolbar.className='toolbar';const heading=__f4.globals.document.createElement('h2');heading.textContent=album.judul;const back=__f4.globals.document.createElement('button');back.className='secondary';back.textContent='Kembali ke album';back.insertAdjacentHTML('afterbegin','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7M5 12h14"/></svg>');back.onclick=()=>v11RenderAlbums();toolbar.append(heading,back);wrap.appendChild(toolbar);const grid=__f4.globals.document.createElement('div');grid.className='public-grid';album.media.forEach(m=>{const c=v11Tile(m.caption||m.jenis,m.jenis);v11AttachImage(c,m.url);c.appendChild(v11External(m.url,'Buka '+m.jenis.toLowerCase()));grid.appendChild(c)});wrap.appendChild(grid);if(!album.media.length){const p=__f4.globals.document.createElement('p');p.textContent='Album ini belum berisi foto/video.';wrap.appendChild(p);}area.replaceChildren(wrap);area.scrollIntoView({behavior:'smooth',block:'start'});}
  async function v11SaveProgress(e){e.preventDefault();busy(e.target,true);try{const r=await call('bsV11TambahProgress',token,{tanggal:$('v11ProDate').value,judul:$('v11ProTitle').value,langkah:$('v11ProStep').value,deskripsi:$('v11ProDesc').value,status:$('v11ProStatus').value,agenda:$('v11ProAgenda').value,foto:$('v11ProPhoto').value,publik:$('v11ProPublic').checked});note('v11ProNotice','Perkembangan '+r.id+' tersimpan.');e.target.reset();}catch(err){note('v11ProNotice','Gagal: '+(err.message||err),true);}finally{busy(e.target,false);}}
  async function v11LoadAlbums(){try{const rows=await call('bsV22AlbumAdmin',token),select=$('v11MediaAlbum');select.replaceChildren(new __f4.globals.Option('Pilih album',''));rows.filter(a=>a.status==='Aktif').forEach(a=>select.appendChild(new __f4.globals.Option(a.judul+' ('+a.id+') • '+a.visibilitas,a.id)));$('v11AlbumDate').value=$('v11AlbumDate').value||bankLocalToday();v22RenderAlbumAdmin(rows);}catch(e){note('v11AlbumNotice','Gagal memuat album: '+(e.message||e),true);}}
  async function v11SaveAlbum(e){e.preventDefault();busy(e.target,true);try{const r=await call('bsV22TambahAlbum',token,{tanggal:$('v11AlbumDate').value,judul:$('v11AlbumTitle').value,deskripsi:$('v11AlbumDesc').value,sampul:$('v11AlbumCover').value,kategori:$('v22AlbumCategory').value,publik:$('v11AlbumPublic').checked});let mediaError='';
    if($('v11AlbumMediaUrl').value.trim()){
     try{await call('bsV20TambahMedia',token,{albumId:r.id,jenis:$('v11AlbumMediaType').value,url:$('v11AlbumMediaUrl').value.trim(),caption:$('v11AlbumTitle').value.trim()});}
     catch(mediaFailure){mediaError=mediaFailure.message||(0,__f4.globals.String)(mediaFailure);}
    }
    note('v11AlbumNotice',mediaError
     ?'Album berhasil dibuat, tetapi media belum ditambahkan: '+mediaError+'. Gunakan form Tambahkan foto/video ke album di bawah tanpa membuat album baru.'
     :'Album berhasil dibuat'+($('v11AlbumMediaUrl').value.trim()?' beserta media pertamanya.':'.'),!!mediaError);
    e.target.reset();await v11LoadAlbums();}catch(err){note('v11AlbumNotice','Gagal: '+(err.message||err),true);}finally{busy(e.target,false);}}
  async function v11SaveMedia(e){e.preventDefault();busy(e.target,true);try{const r=await call('bsV20TambahMedia',token,{albumId:$('v11MediaAlbum').value,jenis:$('v11MediaType').value,url:$('v11MediaURL').value,caption:$('v11MediaCaption').value});note('v11MediaNotice','Dokumentasi '+r.id+' ditambahkan.');e.target.reset();v20MediaTypeChange();await v11LoadAlbums();}catch(err){note('v11MediaNotice','Gagal: '+(err.message||err),true);}finally{busy(e.target,false);}}
  async function v11LoadInventory(){/* Form tidak membutuhkan data personal; inventaris publik dimuat di beranda. */}
  async function v11SaveInventory(e){e.preventDefault();busy(e.target,true);try{const r=await call('bsV11TambahInventaris',token,{nama:$('v11InvName').value,jumlah:$('v11InvAmount').value+' '+$('v11InvUnit').value.trim(),kategori:$('v11InvCategory').value,lokasi:$('v11InvLocation').value,foto:$('v11InvPhoto').value});note('v11InvNotice',r.id+' tersimpan.');e.target.reset();}catch(err){note('v11InvNotice','Gagal: '+(err.message||err),true);}finally{busy(e.target,false);}}
  (async()=>{v8Setup();v9Setup();v10Setup();v11Setup();const entry=__f4.globals.document.createElement('button');entry.className='secondary wide';entry.textContent='Lihat portal publik';entry.onclick=v11ShowPublic;$('authNotice').before(entry);const nav=__f4.globals.document.createElement('button');nav.id='navPublic';nav.className='secondary';nav.textContent='Info Bank Sampah';nav.onclick=v11ShowPublic;$('navProgress').after(nav);if(token){try{showDashboard(await call('authMe',token));}catch(e){showAuth();v11ShowPublic();}}else if(!__f4.globals.document.documentElement.classList.contains('f4-bank-auth-pending'))v11ShowPublic();})();
  // v12 — hanya menampilkan rincian pribadi dari sesi warga yang sedang aktif.
  let v12Data=null;
  __f4.window.f4BankMemberPrintReady=()=>!!v12Data&&__f4.globals.Array.isArray(v12Data.mutasi)&&__f4.globals.Array.isArray(v12Data.setoran);
  const v12Show=showDashboard,v12Go=goPage,v12Auth=showAuth;
  showDashboard=function(p){v12Show(p);v12Setup();};
  showAuth=function(){v12Data=null;if($('v10Print'))$('v10Print').replaceChildren();if($('v12History'))$('v12History').replaceChildren();if($('v12Deposits'))$('v12Deposits').replaceChildren();v12Auth();};
  goPage=function(page){
    if(page==='pribadi'){
      if(!profile||profile.peran!=='Warga')return;
      v12Go('profile');$('pageProfile').classList.add('hidden');$('navProfile').classList.remove('active');
      $('pagePribadi').classList.remove('hidden');$('navPribadi').classList.add('active');
      $('sideNav').classList.remove('open');v12Load();return;
    }
    if($('pagePribadi')){$('pagePribadi').classList.add('hidden');$('navPribadi').classList.remove('active');}
    v12Go(page);
  };
  function v12Setup(){
    if($('memberWelcome'))$('memberWelcome').querySelector('.notice').textContent='Lihat saldo tabungan dan rincian setoran lewat menu Tabungan saya. Demi privasi, ganti password awal satu kali sebelum membukanya.';
    // Detail kartu dan profil sudah cukup; tidak perlu catatan pengulangan menu.
    if(!$('pagePribadi')){
      const nav=__f4.globals.document.createElement('button');nav.id='navPribadi';nav.className='secondary';nav.textContent='Tabungan saya';nav.insertAdjacentHTML('afterbegin','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/></svg>');nav.onclick=()=>goPage('pribadi');$('navProfile').after(nav);
      const page=__f4.globals.document.createElement('section');page.id='pagePribadi';page.className='card hidden';
      page.innerHTML=`<div id="v12Gate" class="notice" role="status">Memeriksa akses...</div><div id="v12Private" class="hidden"><div class="stats"><div class="stat"><small>Saldo tersedia</small><strong id="v12Balance">—</strong></div><div class="stat"><small>Masuk</small><strong id="v12Credit">—</strong></div><div class="stat"><small>Dicairkan</small><strong id="v12Debit">—</strong></div></div><p class="f4-member-payout-help">Pencairan lewat pengurus.</p><div class="toolbar block-gap f4-member-tools"><button class="secondary f4-member-refresh" type="button" onclick="v12Load()" title="Muat ulang data tabungan" aria-label="Muat ulang data tabungan"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.35 5.65"/><path d="M20 4v7h-7"/></svg></button><button type="button" onclick="v12Print()">Cetak / PDF</button><button type="button" class="ghost" onclick="v12CSV()">Unduh CSV</button></div><h2 class="block-gap">Riwayat</h2><div id="v12History" class="tablewrap"></div><h2 class="block-gap">Rincian barang</h2><p class="hint">Harga setoran = estimasi, bukan saldo sah.</p><div id="v12Deposits"></div></div>`;
      $('pageProfile').after(page);
    }
    $('navPribadi').classList.toggle('hidden',!profile||profile.peran!=='Warga');
  }
  // Hanya tampilan dan PDF; CSV/API tetap menyimpan tanggal ISO.
  function f4MemberDateID(raw){
    const text=(0,__f4.globals.String)(raw||'').trim(),m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if(!m)return text||'Tanggal belum tercatat';
    const y=(0,__f4.globals.Number)(m[1]),mo=(0,__f4.globals.Number)(m[2]),day=(0,__f4.globals.Number)(m[3]);
    const d=new __f4.globals.Date(__f4.globals.Date.UTC(y,mo-1,day,12));
    if(d.getUTCFullYear()!==y||d.getUTCMonth()!==mo-1||d.getUTCDate()!==day)return text;
    return new __f4.globals.Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(d);
  }
  function v12Table(headings,rows){
    const table=__f4.globals.document.createElement('table'),head=__f4.globals.document.createElement('thead'),hrow=__f4.globals.document.createElement('tr');
    headings.forEach(h=>{const th=__f4.globals.document.createElement('th');th.textContent=h;hrow.appendChild(th);});head.appendChild(hrow);table.appendChild(head);
    const body=__f4.globals.document.createElement('tbody');rows.forEach(row=>{const tr=__f4.globals.document.createElement('tr');row.forEach((val,i)=>{const td=__f4.globals.document.createElement('td');td.dataset.label=headings[i];if(val&&val.nodeType===1)td.appendChild(val);else td.textContent=(0,__f4.globals.String)(val??'—');tr.appendChild(td);});body.appendChild(tr);});table.appendChild(body);return table;
  }
  const v12Kg=n=>new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format(n||0)+' kg';
  // Nilai yang dipajang setelah sah berasal dari kredit jual dalam ledger.
  // Tidak pernah menampilkan estimasi seolah-olah merupakan hasil final.
  function f4MemberDepositDisplay(setoran){
    const confirmed=/terkonfirmasi|confirmed/i.test((0,__f4.globals.String)(setoran?.status||''));
    const value=setoran?.nilaiSahRp;
    const final=confirmed&&value!=null&&__f4.globals.Number.isSafeInteger((0,__f4.globals.Number)(value))&&(0,__f4.globals.Number)(value)>=0;
    return {
      status:confirmed?'Sudah sah':'Belum terjual',
      nominal:final?rupiah(value):confirmed?'—':rupiah(setoran?.estimasiRp||0),
      label:final?'Hasil jual':confirmed?'Belum tersedia':'Perkiraan',
      final:final?(0,__f4.globals.Number)(value):null
    };
  }
  async function v12Load(){
    const sessionToken=token,memberKey=(0,__f4.globals.String)(profile?.wargaId||'');
    v12Data=null;$('v12Private').classList.add('hidden');$('v12Gate').classList.remove('hidden');note('v12Gate','Memuat laporan pribadi...');
    try{
      const access=await call('bsV12AksesLaporan',sessionToken);
      if(sessionToken!==token||memberKey!==(0,__f4.globals.String)(profile?.wargaId||'')||profile?.peran!=='Warga')return;
      if(!access.siap){note('v12Gate',access.pesan);return;}
      const d=await call('bsV12Statement',sessionToken);
      if(sessionToken!==token||memberKey!==(0,__f4.globals.String)(profile?.wargaId||'')||profile?.peran!=='Warga')return;
      v12Data=d;
      $('v12Gate').classList.add('hidden');$('v12Private').classList.remove('hidden');
      $('v12Balance').textContent=rupiah(d.saldo);$('v12Credit').textContent=rupiah(d.totalMasuk);$('v12Debit').textContent=rupiah(d.totalCair);
      const history=$('v12History');history.replaceChildren();
      const personalMutations=(d.mutasi||[]).map(x=>{
        const withdrawn=/pencairan/i.test((0,__f4.globals.String)(x.jenis||''))&&(0,__f4.globals.Number)(x.debit)>0&&x.id;
        const receipt=withdrawn?f4BankReceiptIcon(x,()=>({
          scope:'bank',id:x.id,title:'Bukti Pencairan Tabungan',
          party:d.nama||profile?.nama||'Anggota Bank Sampah',house:d.rumah||profile?.rumah||'-',
          date:x.tanggal||'-',method:'Melalui pengurus',amount:(0,__f4.globals.Number)(x.debit),
          amountLabel:'Tabungan Dicairkan',status:'TERCATAT',
          details:[['Jenis transaksi',x.jenis],['Saldo sesudahnya',rupiah(x.saldo)]],
          note:'Bukti pencairan yang tercatat di mutasi tabungan anggota.'
        })):'—';
        return [f4MemberDateID(x.tanggal),x.jenis,rupiah(x.kredit),rupiah(x.debit),x.koreksi?rupiah(x.koreksi):'—',rupiah(x.saldo),receipt];
      });
      history.appendChild(v12Table(['No','Tanggal','Mutasi','Masuk','Dicairkan','Koreksi','Saldo','Resi'],personalMutations.map((row,index)=>[index+1,...row])));
      const deposits=$('v12Deposits');deposits.replaceChildren();deposits.classList.add('f4-member-tx-feed');
      // Daftar ringkas seperti mutasi bank. Harga awal tidak boleh disebut hasil akhir.
      // D1 hanya memberi hasil sah PER SETORAN; belum ada harga sah per jenis barang.
      let lastDate='';
      d.setoran.filter(s=>s.status!=='Dibatalkan').forEach(s=>{
        const info=f4MemberDepositDisplay(s),confirmed=info.status==='Sudah sah';
        const dateKey=(0,__f4.globals.String)(s.tanggal||''),dateText=f4MemberDateID(s.tanggal);
        if(dateKey!==lastDate){
          const divider=__f4.globals.document.createElement('div');divider.className='f4-member-tx-date';divider.textContent=dateText;
          deposits.appendChild(divider);lastDate=dateKey;
        }
        // Riwayat selalu ringkas; rincian hanya ada pada resi transaksi.
        const row=__f4.globals.document.createElement('div');row.className='f4-member-tx';
        const summary=__f4.globals.document.createElement('div');summary.className='f4-member-tx-summary';
        const icon=__f4.globals.document.createElement('span');icon.className='f4-member-tx-icon';icon.setAttribute('aria-hidden','true');
        const iconImage=__f4.globals.document.createElement('img');iconImage.src='/assets/icons/bank.svg';iconImage.alt='';
        iconImage.width=21;iconImage.height=21;icon.appendChild(iconImage);
        const copy=__f4.globals.document.createElement('span');copy.className='f4-member-tx-copy';
        const name=__f4.globals.document.createElement('strong');name.textContent='Setoran sampah';
        const sub=__f4.globals.document.createElement('small');
        const weight=s.beratKg==null?'Berat belum tersedia':v12Kg(s.beratKg);
        sub.textContent=weight+' · '+(confirmed?'Sudah terjual':'Belum terjual');
        copy.append(name,sub);
        const amount=__f4.globals.document.createElement('span');amount.className='f4-member-tx-amount';
        const nominal=__f4.globals.document.createElement('strong');
        nominal.textContent=confirmed?(info.final==null?'—':rupiah(info.final)):rupiah(s.estimasiRp);
        const caption=__f4.globals.document.createElement('small');
        caption.textContent=confirmed?(info.final==null?'Hasil belum tersedia':'Hasil jual'):'Perkiraan';
        amount.append(nominal,caption);
        summary.append(icon,copy,amount);
        if(s.id){
          // Reuse the existing D1-backed JPG receipt, not the retired accordion.
          const receipt=f4BankReceiptIcon(s,()=>{
            const payload=f4BankDepositReceipt({
              ...s,estimasi:s.estimasiRp,berat:s.beratKg,
              namaWarga:d.nama,rumahWarga:d.rumah
            },{nama:d.nama,rumah:d.rumah});
            for(const item of s.rincian||[]){
              payload.details.push([(0,__f4.globals.String)(item.barang||'Jenis sampah'),
                item.beratKg==null?'Berat tidak tersedia':v12Kg(item.beratKg)+' ditimbang']);
            }
            return payload;
          });
          receipt.classList.add('f4-member-deposit-receipt');
          receipt.setAttribute('aria-label','Lihat resi setoran '+dateText);
          receipt.title='Lihat rincian dan resi setoran';
          summary.append(receipt);
        }
        row.append(summary);deposits.appendChild(row);
      });
      if(!deposits.querySelector('.f4-member-tx'))deposits.textContent='Belum ada setoran tercatat.';
      __f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-bank-member-statement',{detail:d}));
    }catch(e){if(sessionToken===token&&memberKey===(0,__f4.globals.String)(profile?.wargaId||'')&&profile?.peran==='Warga')
      note('v12Gate','Laporan belum tersedia: '+(e.message||e),true);}
  }
  // Urutan cetak kronologis agar perubahan saldo dibaca dari atas ke bawah.
  // Sort stabil mempertahankan urutan asal bila beberapa transaksi bertanggal sama.
  const v12PrintOldestFirst=(a,b)=>(0,__f4.globals.String)(a.tanggal||'').localeCompare((0,__f4.globals.String)(b.tanggal||''));
  // Angka rincian sah berasal dari alokasi berat penjualan, bukan hasil timbang awal.
  // Backend lama hanya memiliki total setoran: aman dipakai jika setoran berisi tepat satu barang.
  function v12ConfirmedItemKg(deposit,line){
    if(f4MemberDepositDisplay(deposit).status!=='Sudah sah')return null;
    if(line.beratSahKg!=null&&__f4.globals.Number.isFinite((0,__f4.globals.Number)(line.beratSahKg)))return (0,__f4.globals.Number)(line.beratSahKg);
    if((deposit.rincian||[]).length===1&&deposit.beratSahKg!=null&&__f4.globals.Number.isFinite((0,__f4.globals.Number)(deposit.beratSahKg)))
      return (0,__f4.globals.Number)(deposit.beratSahKg);
    return null;
  }
  // Laporan anggota mencatat tanggal setiap setoran, tanpa nama atau pemisah
  // periode timbang karena data hanya milik satu warga.
  function v12MakeItemMatrix(d,setoran){
    const types=d.kodeBarang||[];
    const byName=new __f4.globals.Map(types.map(item=>[
      (0,__f4.globals.String)(item.namaAsli||item.nama||'').trim().toLocaleLowerCase('id-ID'),item.kode
    ]));
    const format=weight=>new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format((0,__f4.globals.Number)(weight)||0);
    const compactDate=raw=>{
      const date=(0,__f4.globals.String)(raw||'').slice(0,10);
      return /^\d{4}-\d{2}-\d{2}$/.test(date)?
        date.slice(8,10)+'/'+date.slice(5,7)+'/'+date.slice(0,4):date||'—';
    };
    const headers=['No','Tanggal',...types.map(item=>item.kode),'Total'];
    const rows=setoran.map((s,index)=>{
      const weights=new __f4.globals.Map();
      for(const line of s.rincian||[]){
        const code=byName.get((0,__f4.globals.String)(line.barang||'').trim().toLocaleLowerCase('id-ID'));
        if(!code)throw (0,__f4.globals.Error)('Jenis barang '+line.barang+' tidak ada pada daftar kode.');
        weights.set(code,(weights.get(code)||0)+(0,__f4.globals.Number)(line.beratKg||0));
      }
      return [index+1,compactDate(s.tanggal),
        ...types.map(item=>weights.has(item.kode)?format(weights.get(item.kode)):'—'),
        format(s.beratTimbangKg??s.beratKg)];
    });
    return {headers,rows,types};
  }
  function v12Print(){
    if(!v12Data)return;
    const d=v12Data,root=$('v10Print');root.replaceChildren();
    const selected=typeof __f4.window.f4BankReportPeriod==='function'?(0,__f4.globals.String)(__f4.window.f4BankReportPeriod()||''):'';
    const range=typeof __f4.window.f4BankReportRange==='function'?__f4.window.f4BankReportRange():null;
    const matchesPeriod=date=>range?date>=range.from&&date<=range.to:!selected||date.startsWith(selected);
    const periode=range?range.from+' s.d. '+range.to:(selected||'Semua');
    const mutasi=(d.mutasi||[]).filter(x=>matchesPeriod((0,__f4.globals.String)(x.tanggal||''))).sort(v12PrintOldestFirst);
    const setoran=(d.setoran||[]).filter(x=>matchesPeriod((0,__f4.globals.String)(x.tanggal||''))).sort(v12PrintOldestFirst);
    root.appendChild(v29Kop());
    const title=__f4.globals.document.createElement('h1');title.textContent='LAPORAN TABUNGAN WARGA — FLAMBOYAN 4';root.appendChild(title);
    const identity=__f4.globals.document.createElement('p');identity.className='f4-member-print-meta';
    identity.textContent=d.nama+' • '+d.rumah+' • '+d.dibuatPada+' • Periode '+periode;
    root.appendChild(identity);

    // Ringkasan satu baris, tanpa kartu tinggi.
    const summary=__f4.globals.document.createElement('div');summary.className='f4-member-print-summary';
    // Masuk bersih berasal dari saldo ledger setelah koreksi, bukan kredit bruto
    // dalam rentang tanggal yang mungkin sudah dibatalkan pada bulan lain.
    const income=(0,__f4.globals.Number)(d.totalMasuk||0);
    const expense=mutasi.reduce((sum,x)=>sum+(0,__f4.globals.Number)(x.debit||0),0);
    [['Saldo',d.saldo],['Masuk bersih total',income],['Dicairkan periode',expense]].forEach(([label,value])=>{
      const cell=__f4.globals.document.createElement('span');cell.className='f4-member-print-summary-item';
      const name=__f4.globals.document.createElement('small');name.textContent=label;
      const number=__f4.globals.document.createElement('strong');number.textContent=rupiah(value);
      cell.append(name,number);summary.appendChild(cell);
    });
    root.appendChild(summary);

    // Semua jenis, berat, dan nilai memakai data setoran yang diinput warga/pengurus.
    // Status penjualan tidak dipakai sebagai syarat menampilkan berat di laporan.
    function addTable(heading,headers,rows,kind=''){
      const h=__f4.globals.document.createElement('h2');h.textContent=heading;root.appendChild(h);
      const table=v12Table(headers,rows);table.className='f4-member-print-table';
      if(kind)table.dataset.reportKind=kind;
      const colgroup=__f4.globals.document.createElement('colgroup');
      (kind==='setoran'?[5,18,...(0,__f4.globals.Array)(__f4.globals.Math.max(0,headers.length-3)).fill(70/__f4.globals.Math.max(1,headers.length-3)),7]:
       headers.length===7?[5,13,27,13,13,14,15]:
       headers.length===6?[16,28,14,14,14,14]:
       headers.length===4?[20,42,18,20]:(0,__f4.globals.Array)(headers.length).fill(100/headers.length))
        .forEach(width=>{const col=__f4.globals.document.createElement('col');col.style.width=width+'%';colgroup.appendChild(col);});
      table.prepend(colgroup);root.appendChild(table);
    }
    addTable('Riwayat tabungan',['No','Tanggal','Keterangan','Masuk','Dicairkan','Koreksi','Saldo'],
      mutasi.map((x,index)=>[index+1,f4MemberDateID(x.tanggal),x.jenis,
        rupiah(x.kredit),rupiah(x.debit),x.koreksi?rupiah(x.koreksi):'—',rupiah(x.saldo)]));
    const matrix=v12MakeItemMatrix(d,setoran);
    addTable('Setoran warga',matrix.headers,matrix.rows,'setoran');
    const legend=f4BankMakeCodeLegend(matrix.types);if(legend)root.appendChild(legend);
    const signature=__f4.globals.document.createElement('div');signature.className='f4-bank-report-signature';
    signature.textContent='Mengetahui, Humas Flamboyan 4';
    const signName=__f4.globals.document.createElement('strong');signName.textContent='Heri Juwandi';
    signature.appendChild(signName);root.appendChild(signature);
    v36BankPrint(root,'member');
  }
  function v12CSV(){
    if(!v12Data)return;
    const d=v12Data,selected=typeof __f4.window.f4BankReportPeriod==='function'?(0,__f4.globals.String)(__f4.window.f4BankReportPeriod()||''):'',
    range=typeof __f4.window.f4BankReportRange==='function'?__f4.window.f4BankReportRange():null,
    inPeriod=x=>range?(0,__f4.globals.String)(x.tanggal||'')>=range.from&&(0,__f4.globals.String)(x.tanggal||'')<=range.to:!selected||(0,__f4.globals.String)(x.tanggal||'').startsWith(selected),
    mutasi=d.mutasi.filter(inPeriod).sort(v12PrintOldestFirst),
    setoran=d.setoran.filter(inPeriod).sort(v12PrintOldestFirst),
    matrix=v12MakeItemMatrix(d,setoran),rows=[
      ['LAPORAN TABUNGAN PRIBADI - FLAMBOYAN 4'],
      ['Nama',d.nama],['Rumah',d.rumah],['Dicetak',d.dibuatPada],['Periode',range?range.from+' s.d. '+range.to:selected||'Semua'],
      ['Saldo saat ini (Rp)',d.saldo],['Masuk bersih total (Rp)',d.totalMasuk],['Dicairkan periode (Rp)',mutasi.reduce((n,x)=>n+(0,__f4.globals.Number)(x.debit||0),0)],
      [],
       ['RIWAYAT TABUNGAN'],
       ['No','Tanggal','Jenis','Masuk Rp','Dicairkan Rp','Koreksi Rp','Saldo Rp'],
       ...mutasi.map((x,index)=>[index+1,x.tanggal,x.jenis,x.kredit,x.debit,x.koreksi||0,x.saldo]),
       [],
       ['SETORAN WARGA (BERAT KG)'],
       matrix.headers,
       ...matrix.rows,
       [],
       ['KETERANGAN KODE BARANG'],
       ...(d.kodeBarang||[]).map(item=>[item.kode,item.nama])
    ];
    const safe=v=>{
      const text=(0,__f4.globals.String)(v??'');
      return '"'+(/^\s*[=+\-@]/.test(text)?"'"+text:text).replace(/"/g,'""')+'"';
    };
    const csv='\uFEFF'+rows.map(row=>row.map(safe).join(',')).join('\r\n');
    const url=__f4.globals.URL.createObjectURL(new __f4.globals.Blob([csv],{type:'text/csv;charset=utf-8'})),a=__f4.globals.document.createElement('a');
    a.href=url;a.download='Tabungan_'+(0,__f4.globals.String)(d.nama||'Warga').replace(/[^a-z0-9_-]/gi,'_').slice(0,60)+'_'+(0,__f4.globals.String)(d.rumah||'').replace(/[^a-z0-9_-]/gi,'_')+'.csv';
    a.click();
    (0,__f4.globals.setTimeout)(()=>__f4.globals.URL.revokeObjectURL(url),5000);
  }
  // v13: navigasi bertingkat, seluruh tombol lama tetap ada dan bekerja.
  const v13ShowAccount=showDashboard,v13GoPage=goPage,v13ShowPublicOld=v11ShowPublic,v13ShowAuthOld=showAuth;
  showDashboard=function(p){v13ShowAccount(p);v13GroupNav();v13PublicButton();};
  goPage=function(page){v13GoPage(page);v13HighlightGroups();};
  showAuth=function(){v13ShowAuthOld();v13PublicButton();};
  v11ShowPublic=function(){v13ShowPublicOld();v13PublicButton();};
  function v13GroupNav(){
    const nav=$('sideNav');if(!nav)return;
    const definitions=[
      ['transaksi','Pencatatan & penjualan',['navSetoran','navRiwayat','navPenjualan','navRiwayatJual']],
      ['keuangan','Rekonsiliasi & keuangan',['navRekonsiliasi','navPengesahan','navTabungan','navBiaya','navLaporan']],
      ['konten','Kegiatan & pengelolaan',['navKegiatan','navDokumentasi','navInventaris','navMaster','navAdmin']]
    ];
    definitions.forEach(([key,title,ids])=>{
      let group=$('v13Group_'+key);
      if(!group){
        group=__f4.globals.document.createElement('details');group.id='v13Group_'+key;group.className='nav-group';
        const summary=__f4.globals.document.createElement('summary');summary.textContent=title;
        const items=__f4.globals.document.createElement('div');items.className='nav-group-items';group.append(summary,items);
        const logout=nav.querySelector('button.ghost');nav.insertBefore(group,logout);
      }
      ids.forEach(id=>{const el=$(id);if(el)group.querySelector('.nav-group-items').appendChild(el);});
      group.classList.toggle('hidden',!profile||profile.peran!=='Admin');
    });
    const userGroupId='v13Group_account';let user=$('v13Group_account');
    if(!user){user=__f4.globals.document.createElement('details');user.id=userGroupId;user.className='nav-group';user.innerHTML='<summary>Pengaturan akun</summary><div class="nav-group-items"></div>';nav.insertBefore(user,nav.querySelector('button.ghost'));}
    ['navProfile','navPassword'].forEach(id=>{const el=$(id);if(el)user.querySelector('.nav-group-items').appendChild(el);});
    // Letakkan tabungan sebelum kumpulan menu, supaya warga langsung menemukannya.
    if($('navPribadi')&&$('navDashboard'))$('navDashboard').after($('navPribadi'));
    v13HighlightGroups();
  }
  function v13HighlightGroups(){
    ['v13Group_transaksi','v13Group_keuangan','v13Group_konten','v13Group_account'].forEach(id=>{
      const group=$(id);if(group&&group.querySelector('button.active'))group.open=true;
    });
  }
  function v13PublicButton(){
    const b=__f4.globals.document.querySelector('#v11Public .public-hero button');if(!b)return;
    const logged=!!(profile&&token);
    b.textContent=logged?'Kembali ke dashboard saya':'Masuk akun warga / admin';
    if(logged)b.insertAdjacentHTML('afterbegin','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7M5 12h14"/></svg>');
    b.onclick=()=>{if(logged)showDashboard(profile);else v11ShowLogin();};
  }
  // Catatan: tabel & ringkasan diambil dari backend lama; yang berubah hanya presentasi.
  v13PublicButton();
  // v14: layar dashboard baru, sumber data tetap fungsi GAS yang sudah ada.
  function v14Setup(){
    const page=$('pageDashboard');
    // The live view may be reconstructed after account/route changes: a CSS class
    // alone cannot prove its original data anchors are still present.
    if(page.classList.contains('v14-home') &&
       ['v14Primary','v14Extra','v14Recent','v14Activities'].every(id=>page.querySelector('#'+id)))return;
    page.classList.add('v14-home','f4-eco-dashboard');
    page.innerHTML=`<div class="v14-head"><div class="f4-eco-head-copy"><h2 id="v14Title">Ringkasan</h2><p id="v14Subtitle">Perkembangan Flamboyan 4</p></div><button class="v14-action" id="v14QuickAction" type="button">+ Catat setoran</button></div>
      <div class="v14-hero"><div class="v14-hero-content"><span class="v14-eyebrow"><img src="/assets/icons/bank.svg" width="18" height="18" alt="" aria-hidden="true"> Bank Sampah</span><h3>Sampah terpilah. Manfaat bertambah.</h3><p id="v14HeroCopy">Bersama-sama menjaga lingkungan Flamboyan 4.</p></div><div class="v14-hero-art" aria-hidden="true"><img src="/assets/icons/bank.svg" width="64" height="64" alt=""></div></div>
      <div id="v14Primary" class="v14-primary"></div>
      <details id="f4MemberFlow" class="f4-member-flow" aria-label="Cara setor sampah">
        <summary class="f4-member-flow-head">
          <span class="f4-member-flow-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c-8 0-15 4-15 11a5 5 0 0 0 5 5c7 0 11-7 10-16Z"/><path d="M4 21c2-5 6-9 12-12"/></svg>
          </span>
          <span class="f4-member-flow-copy"><strong>Cara setor sampah</strong><small>Pilah <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></span> Antar <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></span> Timbang <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></span> Saldo</small></span>
          <span class="f4-member-flow-toggle" aria-hidden="true"><span>Lihat alur</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
        </summary>
        <div class="f4-member-flow-body">
          <ol class="f4-member-flow-steps">
            <li class="f4-flow-pilah">
              <span class="f4-member-flow-number" aria-hidden="true"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c-8 0-15 4-15 11a5 5 0 0 0 5 5c7 0 11-7 10-16Z"/><path d="M4 21c2-5 6-9 12-12"/></svg><b>1</b></span>
              <div><strong>Pilah di rumah</strong><p>Pisahkan per jenis, bersihkan, lalu keringkan.</p></div>
            </li>
            <li class="f4-flow-antar">
              <span class="f4-member-flow-number" aria-hidden="true"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 12 4l9 6v10H3V10Z"/><path d="M8 20v-8h8v8M8 15h8"/></svg><b>2</b></span>
              <div><strong>Antar ke gudang</strong><p>Datang saat ada petugas. Sedikit pun boleh.</p></div>
            </li>
            <li class="f4-flow-timbang">
              <span class="f4-member-flow-number" aria-hidden="true"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 7h14M3 13l3-6 3 6H3Zm12 0 3-6 3 6h-6ZM8 21h8"/></svg><b>3</b></span>
              <div><strong>Timbang &amp; catat</strong><p>Petugas mencatat atas nama Anda. Perkiraan muncul di Tabungan saya.</p></div>
            </li>
            <li class="f4-flow-saldo">
              <span class="f4-member-flow-number" aria-hidden="true"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18v13H3V7Z"/><path d="M3 7V4h15M15 13h6v4h-6a2 2 0 0 1 0-4Z"/></svg><b>4</b></span>
              <div><strong>Saldo sah</strong><p>Setelah dijual dan disahkan, saldo mengikuti harga jual sebenarnya.</p></div>
            </li>
          </ol>
          <div class="f4-member-flow-foot">
            <p class="f4-member-flow-note"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/></svg><span>Setelah ditimbang, sampah digabung per jenis. Tidak perlu karung per rumah.</span></p>
            <div class="f4-member-flow-share" aria-label="Pembagian hasil penjualan yang berlaku">
              <span class="f4-flow-share-warga"><b id="f4BankSplitMember">—</b> Tabungan warga</span>
              <span class="f4-flow-share-lingkungan"><b id="f4BankSplitEnvironment">—</b> Lingkungan</span>
            </div>
          </div>
        </div>
      </details>
      <div class="v14-panels"><section class="v14-panel"><div class="v14-panel-head"><div class="f4-eco-panel-heading"><h3 id="v14RecentTitle">Setoran terbaru</h3></div><button id="v14AllDeposits" class="v14-link" type="button">Lihat riwayat</button></div><div class="tablewrap" id="v14Recent">Memuat setoran...</div></section><section class="v14-panel"><div class="v14-panel-head"><div class="f4-eco-panel-heading"><h3>Perkembangan kegiatan</h3></div><button class="v14-link" type="button" onclick="goPage('progress')">Lihat semua</button></div><div class="v14-activity" id="v14Activities">Memuat kegiatan...</div></section></div>
      <div id="v14Extra" class="v14-stats-extra"></div><div id="v14Status" role="status" aria-live="polite"></div>`;
  }

  // Format ringkas hanya pada kartu layar. Angka sumber, transaksi, CSV dan PDF tetap utuh.
  function f4CompactSummaryAmount(element,value){
    const full=(0,__f4.globals.String)(value??'').trim();
    const found=/^Rp\s*(-?[\d.,]+)$/i.exec(full);
    if(!found)return;
    const amount=(0,__f4.globals.Number)(found[1].replace(/\./g,'').replace(',','.'));
    if(!__f4.globals.Number.isFinite(amount)||__f4.globals.Math.abs(amount)<100000)return;
    const abs=__f4.globals.Math.abs(amount),sign=amount<0?'-':'';
    let divisor=abs>=1e9?1e9:abs>=1e6?1e6:1e3;
    let unit=divisor===1e9?'M':divisor===1e6?'jt':'rb';
    let rounded=__f4.globals.Math.round(abs/divisor*10)/10;
    if(divisor===1e3&&rounded>=1000){divisor=1e6;unit='jt';rounded=__f4.globals.Math.round(abs/divisor*10)/10;}
    if(divisor===1e6&&rounded>=1000){divisor=1e9;unit='M';rounded=__f4.globals.Math.round(abs/divisor*10)/10;}
    const short='Rp '+sign+rounded.toLocaleString('id-ID',{maximumFractionDigits:1})+' '+unit;
    if(short===full)return;
    element.dataset.f4FullValue=full;
    element.dataset.f4CompactValue=short;
    element.textContent=short;
    element.title='Nilai lengkap: '+full+'. Ketuk untuk menampilkan.';
    element.setAttribute('role','button');
    element.setAttribute('tabindex','0');
    element.setAttribute('aria-label',full+'. Ketuk untuk menampilkan nilai lengkap.');
    const toggle=()=>{element.textContent=element.textContent===short?full:short};
    element.addEventListener('click',toggle);
    element.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}
    });
  }
  function v10CompactSummaryMetric(label,value){
    const card=metric(label,value);
    const amount=card.querySelector('strong');
    if(amount)f4CompactSummaryAmount(amount,value);
    return card;
  }

  function v14Stat(label,value,note){
    const card=__f4.globals.document.createElement('div');card.className='v14-kpi f4-eco-kpi';
    const caption=__f4.globals.document.createElement('div');caption.className='v14-kpi-label';caption.textContent=label;
    const strong=__f4.globals.document.createElement('strong');strong.textContent=(0,__f4.globals.String)(value);f4CompactSummaryAmount(strong,value);
    const small=__f4.globals.document.createElement('small');small.textContent=note;
    const symbol=__f4.globals.document.createElement('span');symbol.className='f4-eco-icon';symbol.setAttribute('aria-hidden','true');
    const mode=/anggota/i.test(label)?1:/lapak|saldo|tabungan/i.test(label)?2:/jumlah setoran/i.test(label)?3:0;
    // Reuse the repository's validated monochrome icon files; no custom SVG paths.
    const iconNames=['bank','user','cash','calendar'];
    const icon=__f4.globals.document.createElement('img');
    icon.src='/assets/icons/'+iconNames[mode]+'.svg';
    icon.alt='';icon.width=22;icon.height=22;icon.decoding='async';
    symbol.replaceChildren(icon);
    card.append(symbol,caption,strong);if(note)card.appendChild(small);return card;
  }
  function v14ExtraStat(label,value){
    const card=__f4.globals.document.createElement('div');card.className='v14-extra';
    const small=__f4.globals.document.createElement('small');small.textContent=label;
    const strong=__f4.globals.document.createElement('strong');strong.textContent=(0,__f4.globals.String)(value);f4CompactSummaryAmount(strong,value);
    card.append(small,strong);return card;
  }
  function v14RecentTable(rows){
    const list=__f4.globals.document.createElement('div');list.className='f4-recent-list';
    rows.forEach(r=>{
      const item=__f4.globals.document.createElement('article');item.className='f4-recent-item';
      const who=__f4.globals.document.createElement('div');
      const avatar=f4BankPersonAvatar(r.namaWarga||r.nama,{className:'f4-recent-avatar',
        memberId:r.wargaId||r.member_id,hasAvatar:r.hasAvatar===true||r.hasAvatar===1||r.hasAvatar==='1'});
      const nameLine=__f4.globals.document.createElement('div');nameLine.className='f4-recent-name-line';
      const name=__f4.globals.document.createElement('strong');
      name.textContent=f4BankDisplayWargaName(r.namaWarga||r.nama);
      const house=__f4.globals.document.createElement('span');house.className='f4-recent-house';
      const houseCode=(0,__f4.globals.String)(r.rumahWarga||r.houseCode||'').trim();
      house.textContent=houseCode||'Rumah belum terdata';
      house.title=houseCode?'Rumah '+houseCode:'Nomor rumah belum tersedia di database';
      nameLine.append(name,house);
      const desc=__f4.globals.document.createElement('small');
      desc.textContent=[r.tanggal?f4MemberDateID(r.tanggal):'',
        r.berat==null?'Berat jual belum tersedia':kg(r.berat)].filter(__f4.globals.Boolean).join(' • ');
      who.append(nameLine,desc);
      const value=__f4.globals.document.createElement('div');value.className='f4-recent-value';
      const confirmed=r.status==='Terkonfirmasi';
      const amount=__f4.globals.document.createElement('b');
      amount.textContent=confirmed?(r.nilaiSahRp==null?'—':rupiah(r.nilaiSahRp)):rupiah(r.estimasi);
      const hint=__f4.globals.document.createElement('span');
      hint.textContent=confirmed?(r.nilaiSahRp==null?'Belum tersedia':'Hasil jual'):'Perkiraan';
      value.append(amount,hint);item.append(avatar,who,value);
      item.setAttribute('role','link');
      item.tabIndex=0;
      item.dataset.f4HistoryLink='true';
      item.setAttribute('aria-label','Buka Riwayat Setoran '+f4BankDisplayWargaName(r.namaWarga||r.nama));
      item.onclick=()=>__f4.window.goPage('bank-admin-history');
      item.onkeydown=event=>{
        if(event.key==='Enter'){event.preventDefault();item.click();}
      };
      list.append(item);
    });
    return list;
  }
  function v14WeightTrend(rows){
    let section=$('f4-monthly-trend');
    if(!section){section=__f4.globals.document.createElement('section');section.id='f4-monthly-trend';section.className='f4-trend';$('v14Extra').before(section);}
    section.replaceChildren();
    const now=new __f4.globals.Date(),periods=[];
    for(let offset=5;offset>=0;offset--){
      const month=new __f4.globals.Date(now.getFullYear(),now.getMonth()-offset,1);
      periods.push({key:month.getFullYear()+'-'+(0,__f4.globals.String)(month.getMonth()+1).padStart(2,'0'),
       name:month.toLocaleDateString('id-ID',{month:'short'}),weight:0,sah:0,estimasi:0,missing:0});
    }
    const byMonth=new __f4.globals.Map(periods.map(p=>[p.key,p]));
    for(const item of rows||[]){
      if(item.status==='Dibatalkan')continue;
      const period=byMonth.get((0,__f4.globals.String)(item.status==='Terkonfirmasi'?(item.tanggalJual||item.tanggal):item.tanggal).slice(0,7));if(!period)continue;
      if(item.status==='Terkonfirmasi'&&item.berat==null)period.missingWeight=(period.missingWeight||0)+1;
      else period.weight+=(0,__f4.globals.Number)(item.berat)||0;
      if(item.status==='Terkonfirmasi'){
        if(item.nilaiSahRp===null||item.nilaiSahRp===__f4.globals.undefined)period.missing++;
        else period.sah+=(0,__f4.globals.Number)(item.nilaiSahRp)||0;
      }else if(item.status==='Estimasi')period.estimasi+=(0,__f4.globals.Number)(item.estimasi)||0;
    }
    const title=__f4.globals.document.createElement('h3');
    const caption=__f4.globals.document.createElement('p');caption.textContent='6 bulan terakhir';
    const controls=__f4.globals.document.createElement('div');controls.className='f4-chart-view-toggle';
    const head=__f4.globals.document.createElement('div');head.className='f4-chart-admin-head';
    const heading=__f4.globals.document.createElement('div');heading.append(title,caption);head.append(heading,controls);
    const bars=__f4.globals.document.createElement('div');bars.className='f4-trend-bars';
    const legend=__f4.globals.document.createElement('div');legend.className='f4-member-chart-legend';
    const note=__f4.globals.document.createElement('p');note.className='f4-member-chart-note';
    section.append(head,bars,legend,note);
    section.dataset.chartMode=__f4.window.f4AdminChartMode==='berat'?'berat':'nilai';
    for(const [mode,label] of [['nilai','Nilai (Rp)'],['berat','Berat (kg)']]){
      const button=__f4.globals.document.createElement('button');button.type='button';button.className='f4-chart-toggle-btn';
      button.textContent=label;button.dataset.mode=mode;
      button.onclick=()=>{section.dataset.chartMode=mode;render();};controls.appendChild(button);
    }
    function render(){
      const mode=section.dataset.chartMode;__f4.window.f4AdminChartMode=mode;
      title.textContent=mode==='nilai'?'Perkembangan nilai setoran':'Berat setoran per bulan';
      bars.replaceChildren();legend.replaceChildren();
      controls.querySelectorAll('button').forEach(b=>{const yes=b.dataset.mode===mode;
        b.classList.toggle('active',yes);b.setAttribute('aria-pressed',(0,__f4.globals.String)(yes));});
      const top=__f4.globals.Math.max(1,...periods.map(p=>mode==='nilai'?p.sah+p.estimasi:p.weight));
      for(const p of periods){
        const block=__f4.globals.document.createElement('div');block.className='f4-trend-month';
        const track=__f4.globals.document.createElement('div');track.className='f4-trend-track';
        const segments=mode==='nilai'?[['sah','confirmed'],['estimasi','estimate']]:[['weight','weight']];
        for(const [key,kind] of segments){
          if(p[key]<=0)continue;
          const fill=__f4.globals.document.createElement('span');fill.className='f4-trend-fill f4-chart-'+kind;
          fill.style.height=__f4.globals.Math.max(5,__f4.globals.Math.round(p[key]/top*100))+'%';
          fill.title=p.key+' • '+(kind==='confirmed'?'Hasil jual':kind==='estimate'?'Perkiraan':'Berat')+
            ' '+(mode==='nilai'?rupiah(p[key]):kg(p[key]));
          track.appendChild(fill);
        }
        const month=__f4.globals.document.createElement('span');month.textContent=p.name;
        const amount=__f4.globals.document.createElement('b');
        amount.textContent=mode==='nilai'?(p.missing&&p.sah+p.estimasi===0?'—':rupiah(p.sah+p.estimasi)):
          p.missingWeight?'—':kg(p.weight);
        block.append(track,month,amount);bars.append(block);
      }
      if(mode==='nilai'){
        legend.innerHTML='<span><i class="f4-legend-confirmed"></i>Hasil jual</span><span><i class="f4-legend-estimate"></i>Perkiraan</span>';
        note.textContent=periods.some(p=>p.missing)?'Ada setoran sah tanpa nilai jurnal. Tidak dihitung sebagai perkiraan.':
          'Nilai sah berasal dari jurnal penjualan; perkiraan belum masuk saldo.';
      }else note.textContent=periods.some(p=>p.missingWeight)?
         'Ada berat jual sah yang belum tersedia; angka tidak ditebak dari timbang awal.':
         'Belum terjual: bulan penimbangan. Sudah terjual: bulan penjualan dan berat akhir.';
    }
    render();
  }
  // Grafik PRIVAT: hanya dari setoran akun yang sedang login, tanpa permintaan admin atau data warga lain.
  function v37MemberWeightChart(rows){
    const dashboard=$('pageDashboard'),anchor=dashboard?.querySelector('.f4-member-finance-note');
    if(!dashboard||!anchor)return;
    let section=$('f4-member-weight-chart');
    if(!section){
      section=__f4.globals.document.createElement('section');section.id='f4-member-weight-chart';
      section.className='f4-member-weight-chart';
      anchor.after(section);
    }
    section.replaceChildren();
    const titleRow=__f4.globals.document.createElement('div');titleRow.className='f4-member-chart-head';
    const headings=__f4.globals.document.createElement('div');
    const title=__f4.globals.document.createElement('h3'),caption=__f4.globals.document.createElement('p');
    headings.append(title,caption);titleRow.appendChild(headings);
    const switches=__f4.globals.document.createElement('div');switches.className='f4-chart-view-toggle';
    const active=(__f4.globals.Array.isArray(rows)?rows:[]).filter(x=>
      !/batal|cancel/i.test((0,__f4.globals.String)(x.status||'')) &&
      /^\d{4}-\d{2}-\d{2}$/.test((0,__f4.globals.String)(x.tanggal||'')) &&
      __f4.globals.Number.isFinite((0,__f4.globals.Number)(x.beratKg)) && (0,__f4.globals.Number)(x.beratKg)>=0
    ).sort((a,b)=>(0,__f4.globals.String)(a.tanggal).localeCompare((0,__f4.globals.String)(b.tanggal))||
       (0,__f4.globals.String)(a.id||'').localeCompare((0,__f4.globals.String)(b.id||'')));
    const monthly=active.length>=7;
    const points=monthly?(()=>{
      const grouped=new __f4.globals.Map();
      for(const item of active){
        const key=(0,__f4.globals.String)(f4MemberDepositDisplay(item).status==='Sudah sah'?(item.tanggalJual||item.tanggal):item.tanggal).slice(0,7);
        if(!grouped.has(key))grouped.set(key,{key,berat:0,sah:0,estimasi:0,belumAda:0,count:0,sahCount:0,pendingCount:0});
        const target=grouped.get(key),info=f4MemberDepositDisplay(item);
        if(item.beratKg==null)target.missingWeight=(target.missingWeight||0)+1;
        else target.berat+=(0,__f4.globals.Number)(item.beratKg);
        target.count++;
        if(info.status==='Sudah sah'){
          target.sahCount++;
          if(info.final===null)target.belumAda++;
          else target.sah+=info.final;
        }else{
          target.pendingCount++;
          target.estimasi+=(0,__f4.globals.Number)(item.estimasiRp)||0;
        }
      }
      return [...grouped.values()].slice(-8).map(x=>({...x,
        name:new __f4.globals.Date(x.key+'-15T12:00:00').toLocaleDateString('id-ID',{month:'short',year:'2-digit'}),
        detail:x.key}));
    })():active.slice(-6).map(x=>{
      const info=f4MemberDepositDisplay(x);
      return {name:new __f4.globals.Date(x.tanggal+'T12:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'}),
       detail:x.tanggal,berat:x.beratKg==null?0:(0,__f4.globals.Number)(x.beratKg),
       missingWeight:x.beratKg==null?1:0,sah:info.final===null?0:info.final,
       estimasi:info.status==='Sudah sah'?0:(0,__f4.globals.Number)(x.estimasiRp)||0,
       belumAda:info.status==='Sudah sah'&&info.final===null?1:0,count:1,
       sahCount:info.status==='Sudah sah'?1:0,pendingCount:info.status==='Sudah sah'?0:1};
    });
    const hasPending=points.some(p=>p.estimasi>0)||
      active.some(x=>f4MemberDepositDisplay(x).status!=='Sudah sah');
    const hasConfirmed=active.some(x=>f4MemberDepositDisplay(x).status==='Sudah sah');
    const missing=points.some(p=>p.belumAda>0);
    const chart=__f4.globals.document.createElement('div');chart.className='f4-member-chart-bars';
    const note=__f4.globals.document.createElement('p');note.className='f4-member-chart-note';
    const legend=__f4.globals.document.createElement('div');legend.className='f4-member-chart-legend';
    for(const [name,label] of [['nilai','Nilai (Rp)'],['berat','Berat (kg)']]){
      const button=__f4.globals.document.createElement('button');button.type='button';
      button.className='f4-chart-toggle-btn';button.textContent=label;
      button.onclick=()=>{section.dataset.chartMode=name;render();};
      button.dataset.mode=name;switches.appendChild(button);
    }
    titleRow.appendChild(switches);section.append(titleRow,chart,legend,note);
    section.dataset.chartMode=__f4.window.f4MemberChartMode==='berat'?'berat':'nilai';
    function render(){
      const mode=section.dataset.chartMode;
      __f4.window.f4MemberChartMode=mode;
      section.setAttribute('aria-label',mode==='nilai'?'Grafik nilai setoran pribadi':'Grafik berat setoran pribadi');
      title.textContent=mode==='nilai'?'Nilai setoran saya':'Berat sampah saya';
      caption.textContent=points.length+(monthly?' bulan':' setoran')+(mode==='nilai'?' · sesuai status transaksi':' · timbang awal / berat jual sah');
      switches.querySelectorAll('button').forEach(b=>{
        const selected=b.dataset.mode===mode;
        b.classList.toggle('active',selected);b.setAttribute('aria-pressed',(0,__f4.globals.String)(selected));
      });
      chart.replaceChildren();legend.replaceChildren();
      if(!points.length){
        const empty=__f4.globals.document.createElement('p');empty.className='f4-member-chart-empty';
        empty.textContent='Belum ada setoran yang dapat ditampilkan.';chart.appendChild(empty);
        note.textContent='Setoran batal tidak dihitung.';return;
      }
      const max=__f4.globals.Math.max(1,...points.map(p=>mode==='berat'?p.berat:p.sah+p.estimasi));
      const descriptions=[];
      for(const p of points){
        const column=__f4.globals.document.createElement('div');column.className='f4-member-chart-column';
        const amount=__f4.globals.document.createElement('strong');
        const sum=p.sah+p.estimasi;
        amount.textContent=mode==='berat'?(p.missingWeight?'—':kg(p.berat)):sum===0&&p.belumAda?'—':rupiah(sum);
        const track=__f4.globals.document.createElement('div');track.className='f4-member-chart-track';
        track.setAttribute('role','presentation');
        const segments=mode==='berat'?[{value:p.berat,type:'weight'}]:
          [{value:p.sah,type:'confirmed'},{value:p.estimasi,type:'estimate'}];
        for(const seg of segments){
          if(seg.value<=0)continue;
          const fill=__f4.globals.document.createElement('span');fill.className='f4-member-chart-fill f4-chart-'+seg.type;
          fill.style.height=__f4.globals.Math.max(5,__f4.globals.Math.round(seg.value/max*100))+'%';
          fill.title=(seg.type==='confirmed'?'Hasil jual':seg.type==='estimate'?'Perkiraan':'Berat')+
             ': '+(mode==='berat'?kg(seg.value):rupiah(seg.value));
          track.appendChild(fill);
        }
        const label=__f4.globals.document.createElement('small');label.textContent=p.name;
        column.append(amount,track,label);
        if(mode==='nilai'){
          const sub=__f4.globals.document.createElement('em');sub.className='f4-chart-bar-status';
          sub.textContent=p.belumAda?'Perlu cek':p.sahCount>0&&p.pendingCount>0?'Campuran':p.sahCount>0?'Hasil jual':'Perkiraan';
          sub.classList.add(p.belumAda?'is-missing':p.pendingCount>0?'is-estimate':'is-confirmed');
          column.appendChild(sub);
          descriptions.push(p.detail+': '+(p.sahCount>0?'hasil jual '+rupiah(p.sah)+' ':'')+
            (p.pendingCount>0?'perkiraan '+rupiah(p.estimasi):'')+
            (p.belumAda?' nominal sah belum tersedia':''));
        }else descriptions.push(p.detail+': '+kg(p.berat));
        chart.appendChild(column);
      }
      chart.setAttribute('role','img');chart.setAttribute('aria-label',descriptions.join('; '));
      if(mode==='nilai'){
        if(hasConfirmed)legend.appendChild(f4ChartLegend('Hasil jual','#20936e'));
        if(hasPending)legend.appendChild(f4ChartLegend('Perkiraan','#e7a82c'));
        note.textContent=missing?'Ada setoran sah tanpa nominal jurnal. Angkanya tidak ditebak dari perkiraan.':
          hasPending?'Perkiraan belum masuk saldo; hasil jual hanya dari setoran sah.':
          'Seluruh nilai mengikuti hasil jual sah, bukan perkiraan awal.';
      }else{
        note.textContent=points.some(p=>p.missingWeight)?
          'Ada berat jual sah yang belum tersedia; tidak ditampilkan sebagai 0 kg.':
          'Belum terjual: berat timbang awal. Sudah terjual: berat akhir penjualan. Setoran batal tidak dihitung.';
      }
    }
    function f4ChartLegend(text,color){
      const item=__f4.globals.document.createElement('span'),dot=__f4.globals.document.createElement('i');
      dot.style.backgroundColor=color;item.append(dot,__f4.globals.document.createTextNode(text));return item;
    }
    render();
  }
  async function v14LoadDashboard(){
    if(!profile||__f4.window.f4BankSkipDashboardLoad)return;v14Setup();const isAdmin=profile.peran==='Admin',currentToken=token;
    $('pageDashboard').classList.toggle('f4-member-dashboard',!isAdmin);
    // Bersihkan komponen peran sebelumnya ketika sesi berpindah.
    $('f4-member-weight-chart')?.remove();
    $('f4-monthly-trend')?.remove();
    $('v14Primary')?.parentElement?.querySelectorAll('.f4-member-finance-note').forEach(n=>n.remove());
    $('v14Title').textContent=isAdmin?'Ringkasan':'Halo, '+f4BankDisplayWargaName(profile.nama);
    $('v14Subtitle').textContent=isAdmin?'Setoran • Penjualan • Kegiatan':(profile.rumah?'Rumah '+profile.rumah+' • ':'')+'Tabungan saya';
    $('v14QuickAction').textContent=isAdmin?'+ Catat setoran':'Lihat tabungan saya';
    $('v14QuickAction').onclick=()=>goPage(isAdmin?'setoran':'pribadi');
    $('v14AllDeposits').textContent=isAdmin?'Lihat riwayat':'Tabungan saya';
    $('v14AllDeposits').onclick=()=>goPage(isAdmin?'riwayat':'pribadi');
    $('v14HeroCopy').textContent=isAdmin?'Setoran, penjualan, dan kegiatan warga.':'Terima kasih sudah memilah.';
    $('v14Primary').textContent='Memuat ringkasan...';$('v14Recent').textContent='Memuat...';$('v14Activities').textContent='Memuat...';$('v14Extra').replaceChildren();
    $('v14Status').textContent='Mengambil data terbaru...';
    if(!isAdmin){
      const primary=$('v14Primary'),extra=$('v14Extra');
      primary.replaceChildren(
       v14Stat('Saldo sah','—','Hasil penjualan sah'),
       v14Stat('Perkiraan setoran','—','Belum masuk tabungan'),
       v14Stat('Berat','—','Total setoran'),
       v14Stat('Setoran','—','Setoran tercatat'));
      extra.replaceChildren();
      $('v14RecentTitle').textContent='Mutasi Setoran';
      $('v14RecentTitle').closest('.f4-eco-panel-heading')?.querySelector('p')?.remove();
      $('v14Recent').textContent='Memuat riwayat setoran…';
      $('v14Activities').textContent='Memuat perkembangan program…';
      primary.parentElement.querySelectorAll('.f4-member-finance-note').forEach(n=>n.remove());
      const brief=__f4.globals.document.createElement('p');brief.className='f4-member-finance-note';
      brief.textContent='Memeriksa status setoran…';
      // Notice lama tidak ditempel ke UI anggota modern.
      const report=__f4.globals.Promise.resolve(call('bsV12Statement',token));
      const progress=__f4.globals.Promise.resolve(call('bsV14ProgressPublik',token));
      const settled=await __f4.globals.Promise.allSettled([report,progress]);
      if(token!==currentToken||!profile||profile.peran==='Admin'){brief.remove();return}
      const [statement,activities]=settled;
      if(statement.status==='fulfilled'){
       const d=statement.value||{},deposits=__f4.globals.Array.isArray(d.setoran)?d.setoran:[];
       __f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-bank-member-statement',{detail:d}));
       const active=deposits.filter(x=>!/batal|cancel/i.test((0,__f4.globals.String)(x.status||'')));
       const unconfirmed=active.filter(x=>!/terkonfirmasi|confirmed/i.test((0,__f4.globals.String)(x.status||'')));
       // Keterangan harus sesuai status nyata, bukan tulisan tetap saat saldo sudah disahkan.
       if(!active.length){
         brief.textContent='Belum ada setoran tercatat.';
       }else if(!unconfirmed.length){
         brief.textContent='Semua setoran sudah sah. Saldo sesuai hasil penjualan.';
       }else if(unconfirmed.length===active.length){
         brief.textContent='Setoran belum terjual. Nilainya masih perkiraan dan belum masuk saldo.';
       }else{
         brief.textContent=unconfirmed.length+' setoran belum terjual. Saldo hanya dari hasil penjualan yang telah disahkan.';
       }
       const weightMissing=active.some(x=>x.beratKg==null);
       const weight=weightMissing?null:active.reduce((sum,x)=>sum+(0,__f4.globals.Number)(x.beratKg||0),0);
       // Grafik anggota hanya ditampilkan di Tabungan.
       primary.replaceChildren(
        v14Stat('Saldo sah',rupiah(d.saldo||0),'Sudah sah'),
        v14Stat('Perkiraan setoran',rupiah(unconfirmed.reduce((sum,x)=>sum+(0,__f4.globals.Number)(x.estimasiRp||0),0)),'Belum terjual'),
        v14Stat('Berat',weight===null?'—':kg(weight),'Sesuai status'),
        v14Stat('Setoran',(0,__f4.globals.String)(active.length),''));
       // Mutasi saldo yang sah: gunakan ledger, bukan daftar setoran.
       // Setoran estimasi belum menambah tabungan, dan pencairan wajib terlihat.
       const recent=(__f4.globals.Array.isArray(d.mutasi)?d.mutasi:[])
        .filter(x=>(0,__f4.globals.Number)(x.kredit||0)>0||(0,__f4.globals.Number)(x.debit||0)>0)
        .map((x,index)=>({entry:x,index}))
        .sort((a,b)=>(0,__f4.globals.String)(b.entry.tanggal||'').localeCompare((0,__f4.globals.String)(a.entry.tanggal||''))||a.index-b.index)
        .slice(0,3);
       const recentBox=$('v14Recent');recentBox.replaceChildren();
       if(!recent.length)recentBox.textContent='Belum ada mutasi tabungan.';
       for(const {entry:x} of recent){
        const amountIn=(0,__f4.globals.Number)(x.kredit||0),amountOut=(0,__f4.globals.Number)(x.debit||0);
        const isDebit=amountOut>0;
        const jenis=(0,__f4.globals.String)(x.jenis||'').toLowerCase();
        const label=jenis==='pencairan'?'Pencairan Tabungan'
          :jenis==='koreksi_debit'?'Penyesuaian Saldo Keluar'
          :jenis==='koreksi_kredit'?'Penyesuaian Saldo Masuk'
          :'Hasil Penjualan Sampah';
        const article=__f4.globals.document.createElement('div');
        article.className='f4-member-recent'+(isDebit?' is-debit':'');
        const icon=__f4.globals.document.createElement('span');icon.className='f4-member-recent-icon';
        const svg=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
        svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
        svg.setAttribute('stroke-width','2');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
        const arrow=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','path');
        arrow.setAttribute('d',isDebit?'M7 17 17 7M9 7h8v8':'M17 7 7 17M7 9v8h8');
        svg.append(arrow);icon.append(svg);
        const summary=__f4.globals.document.createElement('div');summary.className='f4-member-recent-copy';
        const title=__f4.globals.document.createElement('strong');title.textContent=label;
        const sub=__f4.globals.document.createElement('small');
        sub.textContent=f4MemberDateID(x.tanggal)+' • '+(isDebit?'Pencairan tercatat':'Saldo masuk');
        summary.append(title,sub);
        const value=__f4.globals.document.createElement('div');value.className='f4-member-recent-value';
        const amount=__f4.globals.document.createElement('b');
        amount.textContent=(isDebit?'− ':'+ ')+rupiah(isDebit?amountOut:amountIn);
        const amountLabel=__f4.globals.document.createElement('small');
        amountLabel.textContent='Berhasil';
        value.append(amount,amountLabel);
        article.append(icon,summary,value);recentBox.append(article);
       }
       $('v14Status').textContent='';
      }else{
       brief.textContent='Status setoran belum dapat dimuat.';
       $('v14Recent').textContent='Ringkasan belum ada. Buka Tabungan saya.';
       $('v14Status').textContent='Data saldo belum dapat dimuat: '+(0,__f4.globals.String)(statement.reason?.message||statement.reason||'Koneksi data terputus');
      }
      if(activities.status==='fulfilled')v14Activities(activities.value);
      else $('v14Activities').textContent='Perkembangan belum tersedia.';
      return;
    }
    $('v14RecentTitle').textContent='Setoran terbaru';
    const results=await __f4.globals.Promise.allSettled([call('bsDashboardAdmin',token),call('bsV6SetoranAdmin',token),call('bsDashboardProgressPublik')]);
    if(token!==currentToken||!profile||profile.peran!=='Admin')return;
    const [stats,deposits,progress]=results;
    if(stats.status==='fulfilled'){
      const d=stats.value;
      __f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-bank-admin-overview',{detail:d}));
      $('v14Primary').replaceChildren(
        v14Stat('Berat tercatat',d.beratSetoranKg==null?'—':kg(d.beratSetoranKg),'Timbang / hasil jual'),
        v14Stat('Anggota aktif',d.wargaAktif,''),
        v14Stat('Hasil diterima lapak',rupiah(d.diterimaLapakRp),''),
        v14Stat('Setoran',d.jumlahSetoran,'')
      );
      $('v14Extra').replaceChildren(v14ExtraStat('Menunggu sah',rupiah(d.estimasiSetoranRp)),v14ExtraStat('Barang aktif',d.jenisBarangAktif+' jenis'),v14ExtraStat('Kas gabungan',rupiah(d.kasGabunganRp)),v14ExtraStat('Berat terjual',d.beratPenjualanKg==null?'—':kg(d.beratPenjualanKg)),v14ExtraStat('Riwayat tabungan',rupiah(d.netMutasiTabunganRp)),v14ExtraStat('Jumlah penjualan',d.jumlahPenjualan));
      $('v14Status').textContent=(d.tarifBelumDitetapkan?'Perhatian: '+d.tarifBelumDitetapkan+' barang belum memiliki tarif warga. ':'')+'';
    }else{$('v14Primary').textContent='Ringkasan belum tersedia.';$('v14Status').textContent=(0,__f4.globals.String)(stats.reason?.message||stats.reason);__f4.window.dispatchEvent(new __f4.globals.CustomEvent('f4-bank-admin-overview-error',{detail:$('v14Status').textContent}));}
    if(deposits.status==='fulfilled')v14WeightTrend(deposits.value);
    const recent=deposits.status==='fulfilled'?deposits.value.filter(r=>r.status!=='Dibatalkan').slice(0,5):[];
    const recentBox=$('v14Recent');recentBox.replaceChildren();if(recent.length)recentBox.appendChild(v14RecentTable(recent));else recentBox.textContent='Belum ada setoran terbaru.';
    recentBox.scrollTop=0;
    if(progress.status==='fulfilled')v14Activities(progress.value);else $('v14Activities').textContent='Perkembangan belum dapat dimuat.';
  }
  function v14Activities(rows){
    const box=$('v14Activities');box.replaceChildren();
    (__f4.globals.Array.isArray(rows)?rows:[]).slice(0,3).forEach(r=>{
      const item=__f4.globals.document.createElement('div');item.className='v14-activity-item';
      const title=__f4.globals.document.createElement('strong');title.textContent=r.judul||r.langkah||'Perkembangan kegiatan';
      const note=__f4.globals.document.createElement('small');note.textContent=[r.tanggal?f4MemberDateID(r.tanggal):'',r.status].filter(__f4.globals.Boolean).join(' • ');
      item.append(title,note);item.classList.add('f4-eco-activity-link');
      // The exact right-chevron artwork already used by the Bank Sampah gallery.
      const chevron=__f4.globals.document.createElement('span');chevron.className='f4-eco-activity-arrow';
      chevron.setAttribute('aria-hidden','true');
      chevron.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
      item.appendChild(chevron);
      item.tabIndex=0;item.setAttribute('role','button');item.setAttribute('aria-label','Lihat perkembangan: '+title.textContent);
      item.onclick=()=>goPage('progress');
      item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();goPage('progress')}});
      box.appendChild(item);
    });
    if(!box.childElementCount)box.textContent='Belum ada pembaruan kegiatan yang dipublikasikan.';
  }
  __f4.window.f4BankEnsureLegacyDashboard=v14Setup;
  v14Setup();loadDashboard=v14LoadDashboard;
  // v15 — panel akun di bawah sidebar dan foto profil privat.
  let v15AvatarData='',v15PendingFile=null;
  const v15ShowAccountOld=showDashboard,v15ShowPublicOld=v11ShowPublic,v15ShowAuthOld=showAuth;
  showDashboard=function(p){v15ShowAccountOld(p);v15SetupProfile();v15UpdateAccount(p);v15UpdatePublicButton();v15LoadAvatar();};
  v11ShowPublic=function(){v15ShowPublicOld();v15UpdatePublicButton();};
  showAuth=function(){v15AvatarData='';v15PendingFile=null;v15ShowAuthOld();v15UpdatePublicButton();};
  function v15SetupProfile(){
    const side=$('sideNav');if(!side)return;
    if($('v13Group_account'))$('v13Group_account').classList.add('hidden');
    ['navProfile','navPassword'].forEach(id=>{const b=$(id);if(b)b.classList.add('hidden');});
    const oldLogout=side.querySelector(':scope > button.ghost');if(oldLogout)oldLogout.classList.add('hidden');
    if(!$('v15Footer')){
      const footer=__f4.globals.document.createElement('div');footer.id='v15Footer';footer.className='side-footer';
      const account=__f4.globals.document.createElement('button');account.type='button';account.className='account-entry';account.title='Buka Profil saya';account.onclick=()=>goPage('profile');
      const avatar=__f4.globals.document.createElement('span');avatar.id='v15Avatar';avatar.className='account-avatar';avatar.textContent='?';
      const identity=__f4.globals.document.createElement('span');identity.style.minWidth='0';
      const name=__f4.globals.document.createElement('span');name.id='v15AccountName';name.className='account-name';name.style.display='block';
      const role=__f4.globals.document.createElement('span');role.id='v15AccountRole';role.className='account-role';role.style.display='block';
      identity.append(name,role);account.append(avatar,identity);
      const logout=__f4.globals.document.createElement('button');logout.type='button';logout.className='account-exit';logout.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>';logout.title='Keluar dari akun';logout.setAttribute('aria-label','Keluar dari akun');logout.onclick=()=>doLogout();
      footer.append(account,logout);side.appendChild(footer);
    }
    const photoInput=$('v15PhotoInput'),photoSave=$('v15PhotoSave'),fileName=$('f4ProfileFilename');
    if(photoInput&&photoSave&&!photoInput.dataset.f4Bound){
      photoInput.dataset.f4Bound='1';
      photoInput.addEventListener('change',event=>{
        v15PendingFile=event.target.files?.[0]||null;
        fileName.textContent=v15PendingFile?v15PendingFile.name:'JPG, PNG, WebP · maks. 6 MB';
        photoSave.disabled=!v15PendingFile;
        note('v15PhotoStatus','');
      });
      photoSave.addEventListener('click',v15SaveAvatar);
    }
    if(!$('v15PasswordBox')){
      const target=__f4.globals.document.createElement('details');target.id='v15PasswordBox';
      const summary=__f4.globals.document.createElement('summary');summary.textContent='Ganti password';target.append(summary);
      const form=$('pagePassword').querySelector('form');target.appendChild(form);$('pageProfile').appendChild(target);
    }
  }
  function v15UpdateAccount(p){
    $('v15AccountName').textContent=p.peran==='Admin'?p.nama:f4BankDisplayWargaName(p.nama);
    $('v15AccountRole').textContent=p.peran==='Admin'?'Administrator':(p.rumah||'Anggota');
    v15PaintAvatar();
  }
  function v15PaintAvatar(){
    const node=$('v15Avatar'),preview=$('v15PhotoPreview');if(!node)return;
    node.replaceChildren();
    const initials=f4BankPersonInitial(profile?.nama);
    const fallback=$('f4ProfileInitials');
    if(v15AvatarData){
      const img=__f4.globals.document.createElement('img');img.src=v15AvatarData;img.alt='';node.appendChild(img);
      if(preview){preview.src=v15AvatarData;preview.hidden=false;}
      if(fallback)fallback.hidden=true;
    }else{
      node.textContent=initials;
      if(preview){preview.hidden=true;preview.removeAttribute('src');}
      if(fallback){fallback.textContent=initials;fallback.hidden=false;}
    }
  }
  async function v15LoadAvatar(){
    if(!token||!profile)return;const existingToken=token;
    try{const r=await call('bsV15FotoSaya',existingToken);
      if(token!==existingToken)return;
      v15AvatarData=r.ada&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(r.data)?r.data:'';
      v15PaintAvatar();
      if(r.pesan)note('v15PhotoStatus',r.pesan,true);
    }catch(e){if(token===existingToken)note('v15PhotoStatus','Foto profil belum tersedia. '+(e.message||''),true);}
  }
  async function v15SaveAvatar(){
    const file=v15PendingFile;if(!file){note('v15PhotoStatus','Pilih foto terlebih dahulu.',true);return;}
    if(file.size>6*1024*1024){note('v15PhotoStatus','Foto awal maksimal 6 MB.',true);return;}
    const button=$('v15PhotoSave');button.disabled=true;note('v15PhotoStatus','Menyiapkan foto...');
    let url='';
    try{
      url=__f4.globals.URL.createObjectURL(file);const img=new __f4.globals.Image();img.src=url;await img.decode();
      const canvas=__f4.globals.document.createElement('canvas');canvas.width=256;canvas.height=256;
      const ctx=canvas.getContext('2d');const ratio=__f4.globals.Math.max(256/img.width,256/img.height);
      const w=img.width*ratio,h=img.height*ratio;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,256,256);
      ctx.drawImage(img,(256-w)/2,(256-h)/2,w,h);
      const encoded=canvas.toDataURL('image/jpeg',.76).split(',')[1];
      if(encoded.length>340000)throw new __f4.globals.Error('Foto terlalu besar setelah diproses.');
      await call('bsV15SimpanFoto',token,encoded);v15AvatarData='data:image/jpeg;base64,'+encoded;
      v15PaintAvatar();v15PendingFile=null;$('v15PhotoInput').value='';$('f4ProfileFilename').textContent='JPG, PNG, WebP · maks. 6 MB';note('v15PhotoStatus','Foto profil berhasil disimpan.');
    }catch(e){note('v15PhotoStatus','Gagal menyimpan foto: '+(e.message||e),true);}
    finally{if(url)__f4.globals.URL.revokeObjectURL(url);button.disabled=!v15PendingFile;}
  }
  function v15UpdatePublicButton(){
    const b=__f4.globals.document.querySelector('#v11Public .public-hero button');if(!b)return;
    const valid=!!(token&&profile);
    b.textContent=valid?'Kembali ke akun saya':'Masuk akun warga / admin';
    if(valid)b.insertAdjacentHTML('afterbegin','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7M5 12h14"/></svg>');
    b.onclick=()=>{if(token&&profile)showDashboard(profile);else v11ShowLogin();};
  }
  v15UpdatePublicButton();
  // v16: satu menu utama per kategori; submenu ditampilkan sebagai tab konten.
  // Keanggotaan grup dipertahankan untuk pemetaan rute dan fitur, tetapi sidebar
  // pengelola hanya berisi tiga navigasi utama; fitur lain melalui Akses Cepat.
  const v16AdminSidebar=new __f4.globals.Set(['home','deposit','sale']);
  const v16Groups=[
    {id:'home',label:'Beranda',icon:'home',admin:true,member:true,tabs:[['dashboard','Beranda']]},
    {id:'deposit',label:'Setoran',icon:'edit',admin:true,tabs:[['setoran','Catat setoran'],['bank-admin-history','Riwayat setoran']]},
    {id:'sale',label:'Penjualan',icon:'wallet',admin:true,tabs:[['penjualan','Catat penjualan'],['bank-admin-sale-history','Riwayat penjualan'],['rekonsiliasi','Cek & sahkan']]},
    {id:'finance',label:'Keuangan',icon:'wallet',admin:true,tabs:[['bank-admin-cash','Debit/Kredit'],['tabungan','Saldo warga'],['bank-payout-admin','Pencairan']]},
    {id:'management',label:'Pengelolaan',icon:'user',admin:true,tabs:[['admin','Data anggota'],['master','Harga barang'],['bank-admin-docs','Dokumentasi & inventaris']]},
    {id:'report',label:'Laporan',icon:'database',admin:true,tabs:[['laporan','Laporan keuangan'],['bank-admin-progress','Perkembangan']]},
    {id:'saving',label:'Tabungan',icon:'wallet',member:true,tabs:[['pribadi','Tabungan saya']]},
    {id:'withdrawal',label:'Pencairan',icon:'wallet',member:true,tabs:[['bank-payout','Ajukan pencairan']]},
    {id:'statement',label:'Riwayat',icon:'edit',member:true,tabs:[['bank-history','Riwayat transaksi']]},
    {id:'memberreport',label:'Laporan',icon:'database',member:true,tabs:[['bank-report','Laporan tabungan']]},
    {id:'memberinfo',label:'Info Bank Sampah',icon:'globe',member:true,tabs:[['bank-member-info','Info Bank Sampah']]},
    {id:'memberdocs',label:'Dokumentasi',icon:'image',member:true,tabs:[['bank-member-docs','Dokumentasi']]}
  ];
  const v16SvgPaths={
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    back:'<path d="m15 18-6-6 6-6"/><path d="M9 12h12"/>',
    edit:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M7 13h5M7 17h8"/>',
    wallet:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M16 15h2M7 3h12"/>',
    leaf:'<path d="M20 4c-8 0-15 4-15 11a5 5 0 0 0 5 5c7 0 11-7 10-16Z"/><path d="M4 21c2-5 6-9 12-12"/>',
    database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 2 4 3 9 3s9-1 9-3V5M3 12c0 2 4 3 9 3s9-1 9-3"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2c0-4 3.6-6 8-6s8 2 8 6v2"/>'
  };
  const v16LogoURL='/assets/logo-flamboyan.svg?v=official-20261027-v2';
  const v16PrevShow=showDashboard,v16PrevGo=goPage,v16PrevAuth=showAuth,v16PrevPublic=v11ShowPublic,v16PrevToggle=toggleMenu;
  showDashboard=function(p){v16PrevShow(p);v16BuildNav();v16Sync('dashboard');};
  goPage=function(page){v16PrevGo(page);v16Sync(page);v16CloseMenu();};
  showAuth=function(){v16PrevAuth();v16CloseMenu();};
  v11ShowPublic=function(){v16PrevPublic();v16Sync('public');v16CloseMenu();};
  toggleMenu=function(){
    $('sideNav').classList.toggle('open');const opened=$('sideNav').classList.contains('open');
    $('v16Backdrop').classList.toggle('open',opened);
    __f4.globals.document.body.classList.toggle('f4-bank-drawer-open',opened);
  };
  function v16CloseMenu(){if($('sideNav'))$('sideNav').classList.remove('open');if($('v16Backdrop'))$('v16Backdrop').classList.remove('open');__f4.globals.document.body.classList.remove('f4-bank-drawer-open');}
  function v16Icon(id){const svg=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.innerHTML=v16SvgPaths[id]||v16SvgPaths.home;return svg;}
  function v16BuildNav(){
    const side=$('sideNav');if(!side)return;
    const topLogo=__f4.globals.document.querySelector('.top .logo');
    if(topLogo&&!topLogo.querySelector('img')){
      topLogo.textContent='';const img=__f4.globals.document.createElement('img');img.src=v16LogoURL;img.alt='Logo Flamboyan 4';
      img.style.cssText='width:35px;height:35px;object-fit:contain';
      img.addEventListener('error',()=>{topLogo.innerHTML='<img src="/assets/icons/bank.svg" width="18" height="18" alt="" aria-hidden="true">';},{once:true});topLogo.appendChild(img);
    }
    __f4.globals.Array.from(side.children).forEach(child=>{
      if(child.id!=='v16Brand'&&child.id!=='v16Navigation'&&child.id!=='v15Footer')child.classList.add('hidden');
    });
    let brand=$('v16Brand');
    if(!brand){
      brand=__f4.globals.document.createElement('div');brand.id='v16Brand';brand.className='v16-brand';
      const img=__f4.globals.document.createElement('img');img.alt='Logo Flamboyan 4';
      img.src=v16LogoURL;
      img.addEventListener('error',()=>{const fallback=__f4.globals.document.createElement('span');fallback.innerHTML='<img src="/assets/icons/bank.svg" width="18" height="18" alt="" aria-hidden="true">';img.replaceWith(fallback);},{once:true});
      const title=__f4.globals.document.createElement('div');const strong=__f4.globals.document.createElement('strong');strong.textContent='Bank Sampah';
      const subtitle=__f4.globals.document.createElement('small');subtitle.textContent='Flamboyan 4';
      title.append(strong,subtitle);brand.append(img,title);side.prepend(brand);
    }
    let nav=$('v16Navigation');
    if(!nav){
      nav=__f4.globals.document.createElement('div');nav.id='v16Navigation';
      const label=__f4.globals.document.createElement('div');label.className='v16-nav-caption';label.textContent='MENU';
      const list=__f4.globals.document.createElement('div');list.id='v16NavList';list.className='v16-nav-list';nav.append(label,list);brand.after(nav);
    }
    const list=$('v16NavList');list.replaceChildren();
    v16Groups.filter(g=>/admin/i.test((0,__f4.globals.String)(profile?.peran||''))?(g.admin&&v16AdminSidebar.has(g.id)):g.member).forEach(g=>{
      if(!/admin/i.test((0,__f4.globals.String)(profile?.peran||''))&&g.id==='memberinfo'){
       const other=__f4.globals.document.createElement('div');
       other.className='f4-bank-nav-divider';other.textContent='LAINNYA';
       other.setAttribute('role','presentation');list.appendChild(other);
      }
      const b=__f4.globals.document.createElement('button');b.type='button';b.className='v16-item';b.dataset.group=g.id;
      const symbol=v16Icon(g.icon);
      const label=__f4.globals.document.createElement('span');label.className='f4-bank-nav-label';label.textContent=g.label;
      b.setAttribute('aria-label',g.label);b.append(symbol,label);
      b.onclick=()=>{
       const target=g.id==='public'?'public':g.tabs[0]?.[0]||'dashboard';
       // Close the drawer BEFORE loading API-driven pages: load errors must never
       // strand the mobile sidebar over the app or freeze its active state.
       v16CloseMenu();
       try{
        if(target==='public')v11ShowPublic();
        else{
         if($('dashboardView')?.classList.contains('hidden')&&profile)showDashboard(profile);
         goPage(target);
        }
       }catch(error){
        __f4.globals.console.error('Navigasi Bank Sampah:',target,error);
        note('dashNotice','Halaman '+g.label+' dibuka, tetapi sebagian data belum dapat dimuat. '+(0,__f4.globals.String)(error?.message||''),true);
       }finally{
        v16Sync(target);
        v16CloseMenu();
       }
     };
      list.appendChild(b);
    });
    // Akses Cepat membuka fitur langsung: tidak menyalin Keuangan, Pengelolaan,
    // Riwayat, dan Laporan ke sidebar pengelola. Navigasi warga tidak berubah.
    if(!$('v16Tabs')){
      const tabs=__f4.globals.document.createElement('div');tabs.id='v16Tabs';tabs.className='v16-tabs hidden';
      const section=$('dashboardView').querySelector('.section');section.querySelector(':scope > .toolbar').after(tabs);
    }
    if(!$('v16Backdrop')){
      const backdrop=__f4.globals.document.createElement('div');backdrop.id='v16Backdrop';backdrop.className='v16-backdrop';backdrop.onclick=v16CloseMenu;__f4.globals.document.body.appendChild(backdrop);
    }
  }
  function v16Sync(page){
    const tabs=$('v16Tabs');if(!tabs||!profile)return;
    const available=v16Groups.filter(g=>/admin/i.test((0,__f4.globals.String)(profile?.peran||''))?g.admin:g.member);
    const group=available.find(g=>g.tabs.some(t=>t[0]===page)||g.id==='public'&&page==='public')||
      (page==='profile'||page==='password'?null:available.find(g=>g.id==='home'));
    __f4.globals.document.querySelectorAll('#v16NavList .v16-item').forEach(button=>{
      const selected=button.dataset.bankAppRoute
        ?button.dataset.bankAppRoute===page
        :!!group&&button.dataset.group===group.id;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-current',selected?'page':'false');
    });
    __f4.globals.document.body.dataset.f4BankSection=group?.id||'account';
    tabs.replaceChildren();
    // Setiap laman pengelola berdiri sendiri di PC dan HP.
    // Jangan munculkan tab kategori kedua yang menduplikasi Akses Cepat.
    if(/admin/i.test((0,__f4.globals.String)(profile?.peran||''))){
      tabs.classList.add('hidden');return;
    }
    if(!group||group.tabs.length<2){tabs.classList.add('hidden');return;}
    group.tabs.forEach(([name,label])=>{
      const b=__f4.globals.document.createElement('button');b.type='button';b.textContent=label;
      b.className=name===page?'active':'';b.onclick=()=>{
       try{goPage(name);}
       catch(error){__f4.globals.console.error('Tab Bank Sampah:',name,error);note('dashNotice',(0,__f4.globals.String)(error?.message||error),true);}
       finally{v16Sync(name);v16CloseMenu();}
      };tabs.appendChild(b);
    });
    tabs.classList.remove('hidden');
  }
  // Custom operational screens must be able to activate their parent tab.
  __f4.window.v16Sync=v16Sync;
  if(profile&&token){v16BuildNav();v16Sync('dashboard');}
  // v17 — tata letak tunggal dan ringkasan kas admin.
  const v17PrevShow=showDashboard,v17PrevGo=goPage,v17PrevPublic=v11ShowPublic,v17PrevAuth=showAuth;
  showDashboard=function(p){v17PrevShow(p);v17State('dashboard');};
  goPage=function(page){v17PrevGo(page);if(page==='laporan')v17LoadFinance();};
  showAuth=function(){v17PrevAuth();v17State('auth');};
  v11ShowPublic=function(){v17SetupPublic();v17PrevPublic();v17State('public');v17PublicAccount();};
  function v17State(page){__f4.globals.document.body.classList.toggle('v17-dashboard',page==='dashboard');__f4.globals.document.body.classList.toggle('v17-public',page==='public');}
  function v17SetupFinance(){
    const page=$('pageLaporan');if(!page||$('v17Finance'))return;
    const header=page.querySelector('h2');if(header)header.textContent='Laporan';
    const box=__f4.globals.document.createElement('section');box.id='v17Finance';
    box.innerHTML=`<div class="v17-finance-kpis" id="v17FinanceKpis">Memuat...<button id="v17FinanceRefresh" class="v17-finance-refresh" type="button" onclick="v17LoadFinance()" title="Muat ulang saldo" aria-label="Muat ulang saldo"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v6h-6"/></svg></button></div><section class="v17-finance-analysis" aria-label="Grafik dan rincian arus kas"><div class="v17-finance-grid"><div class="v17-panel"><h3>Arus kas 6 bulan terakhir</h3><div class="v17-bars" id="v17FinanceBars"></div><p class="v17-legend"><span style="background:#347b54"></span> Masuk &nbsp; <span style="background:#e5bb75"></span> Keluar</p></div><div class="v17-panel"><h3>Rincian periode terpilih</h3><div id="v17FinanceDetails">Memuat...</div></div></div></section><p id="v17FinanceNote" class="v17-subtle"></p>`;
    page.prepend(box);
    const month=$('v10Month');if(month){month.value=month.value||new __f4.globals.Date().toISOString().slice(0,7);month.addEventListener('change',v17LoadFinance);}
  }
  function v17Kpi(title,value,emphasis=false){
    const card=__f4.globals.document.createElement('div');card.className='v17-finance-kpi'+(emphasis?' first':'');
    const small=__f4.globals.document.createElement('small');small.textContent=title;const strong=__f4.globals.document.createElement('strong');strong.textContent=value;
    card.append(small,strong);return card;
  }
  function v17Label(month){
    // Grafik publik memakai `bulan`, sedangkan arus kas admin memakai `periode`.
    // Jangan memanggil split pada tanggal yang belum tersedia.
    const value=(0,__f4.globals.String)(month||'').trim();
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))return '—';
    const [year,number]=value.split('-').map(__f4.globals.Number);
    return new __f4.globals.Date(year,number-1,1).toLocaleDateString('id-ID',{month:'short'});
  }
  function v17Chart(root,rows,keys,colorNames){
    root.replaceChildren();
    const data=__f4.globals.Array.isArray(rows)?rows:[];
    root.classList.toggle('is-empty',!data.length);
    if(!data.length){root.textContent='Belum ada data pada periode ini.';return;}
    const max=__f4.globals.Math.max(1,...data.flatMap(r=>keys.map(k=>__f4.globals.Math.max(0,(0,__f4.globals.Number)(r?.[k])||0))));
    data.forEach(r=>{
      const month=r?.periode??r?.bulan??r?.month??'';
      const group=__f4.globals.document.createElement('div');group.className='v17-bar-group';
      const details=[];
      keys.forEach((key,i)=>{
        const value=__f4.globals.Math.max(0,(0,__f4.globals.Number)(r?.[key])||0);
        const isWeight=key==='beratKg'||key==='pendingWeightKg';
        const display=isWeight?kg(value):rupiah(value);
        const name=colorNames[i]||key;
        const bar=__f4.globals.document.createElement('div');bar.className='v17-bar'+(i?' out':'');
        bar.style.height=value/max*100+'%';
        bar.title=name+': '+display+' • '+(month||'Periode tidak tersedia');
        details.push(name+' '+display);group.appendChild(bar);
      });
      group.setAttribute('aria-label',v17Label(month)+': '+details.join(', '));
      const label=__f4.globals.document.createElement('span');label.className='v17-bar-label';
      label.textContent=v17Label(month);group.appendChild(label);root.appendChild(group);
    });
  }
  async function v17LoadFinance(){
    if(!profile||profile.peran!=='Admin')return;v17SetupFinance();
    const seenToken=token,period=$('v10Month')?.value||'';$('v17FinanceNote').textContent='Memuat arus kas...';
    try{const [d,members]=await __f4.globals.Promise.all([call('bsV17RingkasanKasAdmin',seenToken,period),call('bsV9SaldoAdmin',seenToken)]);if(token!==seenToken)return;
      const warga=members.reduce((n,x)=>n+(0,__f4.globals.Number)(x.saldo||0),0);
      const balancePanel=$('v17FinanceKpis'),reloadButton=$('v17FinanceRefresh');
      balancePanel.replaceChildren(v17Kpi('Kas gabungan',rupiah(d.kasTercatat),true),v17Kpi('Kas milik Bank Sampah',rupiah(d.kasMilikBankRp)),v17Kpi('Hak warga',rupiah(warga)),v17Kpi('Kas lingkungan',rupiah(d.kasLingkunganRp)));
      if(reloadButton)balancePanel.append(reloadButton);
      v17Chart($('v17FinanceBars'),d.bulanan,['masuk','keluar'],['Masuk','Keluar']);
      const list=$('v17FinanceDetails');list.replaceChildren();
      d.rincian.forEach(x=>{const line=__f4.globals.document.createElement('div');line.className='v17-line';const name=__f4.globals.document.createElement('span');name.textContent=x.jenis;
        const amount=__f4.globals.document.createElement('strong');amount.textContent=(x.masuk?'+'+rupiah(x.masuk):'')+(x.masuk&&x.keluar?' / ':'')+(x.keluar?'-'+rupiah(x.keluar):'');line.append(name,amount);list.appendChild(line);});
      if(!d.rincian.length)list.textContent='Belum ada transaksi kas periode ini.';
      $('v17FinanceNote').textContent=(0,__f4.globals.Number)(d.transaksi)>0?d.catatan+' • '+d.transaksi+' transaksi pada '+d.periode+'.':'';
    }catch(e){$('v17FinanceNote').textContent='Gagal memuat ringkasan kas: '+(e.message||e);}
  }
  v17SetupFinance();
  // v17 — beranda publik berisi grafik, program, dokumentasi, inventaris, transparansi.
  const v17Logo='/assets/logo-flamboyan.svg?v=official-20261027-v2';
  function v17SetupPublic(){
    const pub=$('v11Public');if(!pub)return;
    if(pub.classList.contains('v17-public'))return;pub.classList.add('v17-public');
    pub.innerHTML=`<div class="v17-public-head"><div class="v17-public-logo"><img id="v17Logo" alt="Logo Flamboyan 4"><span><strong>Bank Sampah</strong><small>Flamboyan 4</small></span></div><nav class="v17-public-links" aria-label="Navigasi portal publik"><a href="?bagian=setoran" data-bank-section="v17Transparansi">Setoran</a><a href="?bagian=kegiatan" data-bank-section="v17Kegiatan">Kegiatan</a><a href="?bagian=informasi" data-bank-section="v17Informasi">Informasi</a></nav><button id="v17PublicAccount" class="v17-public-account" type="button" title="Akun atau masuk" aria-label="Akun atau masuk"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg></button></div>
      <div class="v17-public-main">
        <div class="v17-public-banner">
          <div class="f4-public-hero-copy">
            <span class="f4-public-hero-eyebrow">PROGRAM LINGKUNGAN WARGA</span>
            <h1>Sampah terpilah, jadi tabungan warga.</h1>
            <p class="f4-impact-intro">Pilah sampah bernilai dari rumah, setorkan saat penimbangan, lalu pantau hasilnya bersama Bank Sampah Flamboyan 4.</p>
            <div class="bank-public-links">
              <button id="f4PublicSeeProgress" type="button" class="f4-public-hero-action">Cara ikut menyetor</button>
              <button id="f4PublicSeeReport" type="button">Lihat laporan</button>
            </div>
          </div>
          <section class="bank-public-schedule" aria-labelledby="bank-next-label">
            <div><img src="/assets/icons/calendar.svg" alt=""><h2 id="bank-next-label">Penimbangan berikutnya</h2></div>
            <strong id="bank-next-day">Memuat jadwal…</strong><span id="bank-next-date"></span>
            <small id="bank-next-location" hidden></small>
          </section>
        </div>
        <div id="v17PublicMetrics" class="v17-public-metrics" aria-label="Hasil bersama Bank Sampah">Memuat ringkasan...</div>
        <div class="f4-public-participation">
        <section id="v17WasteTypes" class="f4-public-waste" aria-labelledby="f4PublicWasteHeading">
          <div class="f4-public-section-heading"><div><span class="f4-public-eyebrow">MULAI DARI RUMAH</span><h2 id="f4PublicWasteHeading">Sampah apa yang bisa disetor?</h2><p>Pilih kategorinya untuk melihat jenis sampah yang diterima serta harga acuan warga.</p></div><span id="f4PublicWasteCount" class="f4-public-count" aria-live="polite"></span></div>
          <div id="f4PublicWasteList" class="f4-public-waste-list" aria-live="polite">Memuat jenis sampah...</div>
          <p class="f4-public-waste-note">Harga adalah acuan dan dapat berubah mengikuti hasil penjualan. Nilai tabungan mengikuti hasil yang telah disahkan.</p>
        </section>
        <section id="v17Program" class="f4-bank-program" aria-labelledby="f4BankProgramTitle">
          <div class="f4-bank-program-heading">
            <div><span class="f4-public-eyebrow">CARA KERJA</span><h2 id="f4BankProgramTitle">Dari sampah menjadi tabungan</h2></div>
            <span class="f4-bank-program-kicker">3 langkah</span>
          </div>
          <div class="f4-bank-program-illustration">
            <img src="data:image/webp;base64,UklGRmQWAABXRUJQVlA4IFgWAAAwhQCdASpYAsgAPpVKoEulpCanpBMZ4PASiU3fCmcm5qh3P4v/pd3zHfvH9L58tx/xv04/Othy+p88f+D+/flL80f+F+tHux/U3/h9wz9gOmp9AHwO/Zv1iP+T6zP7n6g/9Z/4nWn+gB5dns3f2X/p+k7qvXn60z0Hw8a4uOJV6d7yQj13d3d3d3d3d3d3d3d3d3d3d3ZoDLlv15b5T0loZOoYHsX/98rKdpxpqNzEpSUmr5Ap90V77DNJLg+RnBeMlBXd3Z38fBSpDt88QcwGUvuYVkScTf0fxdoSmS+ApaypeS5a0jZ/oRQHg45l5euC9FB6IPdzOybSXx6RQOltZbV+pepXwanggeYgEFbeVgaVUGuLdAETkp3pxQCXm9zzco/r5E6jO7nTpI0Qo4G84R8unj0V9v/c8X/GhKNzKhT+4k5W7F+OjI31PSiXgB1oPzIxjXdNlrws8TXdYwGQap1X82BiTzcPtNHkgWw2EN8k8LhWf6yusug2rljjvd0jWF13S/hZz7t2bvGa4WOO0d+HJ4nq2q/1WXpQ354J2C+k45Sfehqg9YOD3GLdbIeTrTLAx6vgllBmoDrIDbpOEywFfeAUIxo2iinF1OAGJpLHx3fYvG/BldXG+UlpSOowGJ9cyhOSkVx9lio9nu26mcpMB4LcvYyefUmXZoN0ybkxdcAnSZb145v9Lsiw5Mm1XcCPfgOfuIcNMoaJ0XHncUQoBwhyuM5V+zjDUyiOj2EqWJAK4AVYZjU7+VFZ+Osms9guWcDfWlce6HcA4/aUspcm0LiXztrPkb2E5e4XLYJSDv8WSs3iBgbDt9LsuvcsWpIx6jAe6jClB9XN7hS5w/enyf14/WftXPfawAaGJyHM8PFIswYqKp72dn11zMNTuNsJyl/4i4tVP+XJf9mRIO3MSWlgLHO+7LjYwQnlDURJQtULXf/MGWfll8iOPgrxGvmNTkyr8hTPhGKUXJli+lIPm39ZYVlrgAUTmF5r33Lam8otbd0xjSctfZiyImue01pd62SzvivrtDOnj1GJXufdN5rhXxxK0SMuxNS3arXSLLkiEJeJYjCLWPWQl1uu46FGKK20dP7uPGM2c4PKdJVFfEJS9PkCDyT8bugvhnOx0led1IKIplQzHWqJSxPv/H0+BO6WEiPs3dMDiZrMU/HA1MSrJkDTDnO6hRv50/3aE3pZ1jxS9yNbaMjOvuCNLBi5NgG2b7iiIj2Pw2ZmaATSorZSZlYXBCCSa3pjTfREUnTF9K6XZs88abyauLVP0hClJnjqC2gbp2GF1PV+rRxTtyaVOLxiJkg8uZ0HW8yxIqWU2ogSY1Ha4TNlP+JbvgtjLe4WQ1E52mBJRzIIKs0yFuK8JN++SeAlbX7XePyXZzh2zPN8qcH6qYDGVVVVVVVVVVVVVVVVVVVVVVVVUAAA/vmbgAAAAAAAAAQmbByFhJfgRYBSxGZm7HGgGmk4FMvhi1BAVobB8f5iJhl/ftpzZs2Y66pThWHD5RwqO7QF+IeG93PNDjKTmY8gqtJOtgBHG+YCqEdA3Xq9ZlC5ZNEs+sFUhr0aNgbND8ILJYeNAzPN4UBdJi/cKtVld/zmuLxLCpyYrCc8TMMY7rODbSfocMY3AnVy6LQyq/Au8QvJn9aUZi/9BLP9VUHNWFl68Cth0zYORLNAArZ9DtN6FnVXAuwyU1e5If0YARWe30qVR3cYez2BK1kDB9P4rpvRWFgKFz6VSfWwTpqrG9ey9aT6Uq+Mv5NcC0b/TPhbd7qMdek6aO7Su3OlIx7eMsViC4gbDvdgXZaMjzkwmnDdkCVFCx8rbYkL8AYu2rDTbymzsPjdFOhtbv+7v5A4woJt/rvrkSBBGksFsy1hxEIObD7rqG7CjPR/U/kuQTZZ59WqAKcsmRKWLHULH8bkgvI9YokNfv4bNNi473j3t+nwCpMrBoOAXX4WMt9j8T8Kyr7phSdFap7EiV8DOJXKhW/Xkm8GTmZveRzBleQ/LqB1C/x3hm7GWP5+XJYBlydCXNRtpm2nQB11Y9YmizWvetrD8EATtMGaNbe0eQC/ExL/9V42Fw49zWynzO3+YfqtGCqz1KdD9lBJ1td/NPD34XKwOZTbuvoA8mjvvfRWEJ+Jd9p+roeruCPsJDzBdXcM+hLOlYCxyI10mfpbaQvebN9fb/sLwwgvQx5Bmvu1IPIONCOAAmmMf+BhgLzzTPI+cs2FqXKZa3eCh6W8AH/pUuM3CapI7jeMWUmOb184WpfaZ3vFgfRLDX16jgNmf25tNuHgJUOzapEq9gkLqGXA/8bvBW964C9FJimtNNuwX1WrFTf3+xA7y+pTjQN3D98IuuE+L3aLaCM3ECbBs1cDqz0mPtpNjmEgZYzcCSHyf8OWXDY3IkCf9F0u29hlWfoai6OzyKws3Y3vR5DwniRU3pIDbjhM47aVq06bvzgsSqJQJWOiIdnZCAU23Nvfl3/OLseEDo/SwyQ/TyqF78BA8kvcIiPjZHsD84pyI+q+1e/12yUxDoNtfWX7bMelveTl6DYxbAsLwy5aOD3h+ksE0Dex0PrANRoFZBiQs29NVEz/+R9BRck1xgk/Ho1TJDDjOuwC3cSQT2GSXbgiYLf+8sDGElVhSRhNuRNL7ngHY55WGYwsT0j4wAsf5edKXcXtM8/iysaAEYoW/Bc79wA11544D9d8voMCw9Dqio7I2z3kcPXPk/D4MuFc57atbDJYWSdSBD6LULQHUC5XV3reXqjFHSf/fR9Y4I8D8mi8L044B5P+ebehDZjR9hVx3acJ6/7+nzC8Rp8q5vkhnhTnVEU3tvh5RRySOUJN0hHNx3UMDDSf4fGzRuetdYe6FRU3PFwbtD0sJw20tu6Hh7teYsDdSQvzCcHaopLxJwVgXb+okYx/OXRNQ67COdk6igr4N0T0vJgDXBcn4JZBAuOrGQte5f+rd8uF8yWDspB8E/gFXopmCpunzR28kRKkSaIkPtZJ4drSo6XiWZEgiJtdzt3QcEJaVYksuWh+mX/RLA1/Gec++7LBEngQzx7Gr7PBmquwtvBLLXGAEdSRkhCmsaAuG7CDqu1TB/3Dc9f8EFpsEJFQfZniseV3CsriozCY/Xy3UnZpeRlQCT4JwXXK2Xxfvf8gxf/zZhFi1NjsaFFR7n+m3O8sT4IBPrvwpCtgssZom4fqkNDLXulR7Mu4wu2OVU/bb4CjiCn7rg6+Gx9rG83a1LXLEtdV4v6j6S9IfTpOI5D5Pj3CkPWo9klCUf9wFcF2fFSnlso8sJZs43V+/UgC0b4AhtOvYGWNfrLCYPw7Joq7l6W4YGuRzVn64JM5vVBaIDDUEufyOKOcDVuMUJK4KSDPcbVgy+hmIehbUd/mz2OoZSAQ/4D6B2rkQm0CgnIPqA3jJ4j4IbB/Vjl/4GPa06PRJrBui3j9MVnDoHZP+XJECB61jJeQQ2HP0bxfuppcdS6qdP7C9HL21IWvNr6iiRj1+fRt3NWA8uEUSXK+Oox6cbekW9QNsV49JcqYrG2HysAoK0LknJ3TpjbQu0oZX5bw/sBJc0kjIfqqa2rk6Rx0KceIQjuwqCTD1+QtkRjR/gLlzdNOwNwfn2gM6hHPrKeC4d2Abl2PqvV5IW+QpQwtv/EHVpIvSkPG1342yjCa2jNIa3Ur1Rq/L7ZCygm1q4fXTehdYemW8uWxaYpRPJ0Y/S464MWFSAxfPdDc9rEPV3YAhhruLbd5Aoz+cID117SJnryaTV8rcKCsb8K2RM/8mOXttYfgeBQ3+2fLdMhcgNh4FWxKKLIO46fyPs5Lc2ymhs35Ni3bAYr7B+PNxg0O/RUD1MMUqiGHb+gfx25EQo8wL2sQfswZTy837zpTNEnortT+ewJABxunHdi2iZt4tXQe+7PnJsfERbGoZY4Gatt0Cux+dfJjz+0oE5lBjedOADylxiElTLbbuErouU3XNGy7IoN90Xv7DzgZNiywxdKZsVEZ8CpQE5t/o+lbei9+VxzCHmFGO6/K3Cgz9qIS6LLEFNVzNpqczN6vJ9cMttqaFQC/xgbeKk/YQ7TXYB8jFgcE95LkcfjG+A0X0gNRrhm4Ln8SKfTnSx0dagGcRNr/pRRu/wn6yrxlavJXUnwFEl/u7lK7WI0N46HZn+xKeXevwR1oprWirfIRVWgJSkR9DWPMyM8iZ4jTHb8Ak2JPli2pkWUSii1FrELc0CEMUJKQWG6RCZU+9JNkHvbWFhfU/wkIT87YSocJqOhmArQFeUZnH2ZjKEOf4jZyr2x34zS/EHIa+avdRZKbQl9EuTTLwlE5mfah7Uxn89DyY39cSe6qZ2RgZZsG/bcSKZloI4pNTswzfTg3kVG0ZCV1pl3sKRh11UxNpda0d0RtBpHxviL+GdZ19eqM7gRX0fchVP5pYLYTkS2UZ/PcnAjyzSEQ2UnG9faj9GnSa9Z8r2zhJ/2RxsNCwGvQxorMzrK5y9Mh58sp36Gd4ZLeb1V1GL7v1wrH9NEAGU6IoON7JvrFnrw5aQqdYrGiZJD4Rz4pa3lM3OfQUGCyE3iYb4vlMVuTYhOn6QvZxWi//EugXh4TxmIKcVLWiDmNG+lvWWKEI+U8FAapn5A3+7/esq62tXCdS+cMBnlUlJAhue8KG4eDkmX3o8aDb7ftzufxJHkFJReIkN2SqSvnm66FEmmOuMtRQfwzXpqm7qZyfGhUVcMKRZ+mv/Ot6aoQ46BBHimQyfs04zb3Ve4wQzb8H9yzl7sgkWnxgKnJQOA5N+NqFgm+9dM25BgBJi8KaoM1KwQS6C8T/4X1J+ANDAyOMxQ22IBSM5OyEmcwCnQynAawFtad2nd6IXs27+p6zdm6brMaitLbZT6cBQoLr3Zd76xHsr/5OEh6D+qIMcGt0nraNkVIdnY1BPVETESLfBJVQQVM6QHd5tOORVk3vOSavmJVVIBQZk6UYkhIczp7m1ltex0cutEz1mWogq6YV+7clRnZjYoYNCXZIRPAzuJgYL6ZLG72RCBSYXGsZLdjtxD7Yt2J0tcDzwsIUolUoGftycybGMXuvBb6vf2VTmthuXpu0UdLyMLzAqK9YSaW5ZHwcmEWYc0ff1LA/VATkNkPQr5+ZBiycU5kOh7BbWGv3cKuWBoHEsI+OU3ikb1FbbRExKAsTUQ+s3L7eL/0M/jpT3GZOLBpFrQdlIgAS4Aq9VaWBkSkbEOx424nUKFGfBH0dAZrEgRh68UD/r5jTRRJorZKbLH9dN1AMH5fJvnk3YQbqLveUzsMtSOr/acPfP+LFtjF3ILOeuMAviBqgCWi7JiQOU1zi6mblTqD5Jqmk5tl+hlQpnqdp7uORAYBhnUDSCWrP7vNSKrKXICVQiv7/JliY7H1oJLSdCYkX/3yb5ThedGeJYHASPhnb1eESoFcXnBOheETM+qgey1FwdllCCeSarkV5n2jJF4UvnIAu6Dybd4SXpkgnTU4y8Ck1ckc38+HwK0tpYTcQ0/B7sSXqBmDXMJZ7y8O5h+So5eBtkF0/f9qSFoh/OQQP9ls/eMbiwpEb6EpC2dBupNH34cflhzhhAlg1edPMHSoYuWYg9wHF0FZGrg0rgNX4mIv0q6cXvhjhu/3tDTmcW5apU0+df4Ni2X45taqjHGLvxuvPP44YWmhXKKE0zO+GXT1Drku5s+eyD+pmbesuPu+/F2EQsVHgX7blWfW/OyTV72BydCUXqj8t2WvXj3anjcscLuX+3Zw8SEKVcJXtxc2TIsk3XuIz1eoVFUdxCS714Rj1bZQ9rI+e8OlkvStSeuX6LrMfQxK7JuL7vOv35Fo/LwYmlUIdff/BLTzWHw4SsncfjAwNCNyQSPEKzWL58MpK7iXl7GSq9ePBxfnt5tn8cuJ2kOH+3dVUtsV57g/x/UtezahUnv7DhyMDoLA0LYtKpZ+3Ff2pWE9t6ES8n1LY5RKdVFFn/GU2jiK6StTRn4rJj6oIoXgGKsYNXFz+dQXmJjKlT57eVCC5rA8Xd83lthY3gQCI79koxEtyQcx09dGPSpxNOEjuvXpxC9263p0UI+kO4/K7FpqnkMb/Xd4mgeKqD6qglRbDcP8ddUvet9rJ8lApD0iS9e2tA5VO2FuSxxqbLxnaPNoVahy+EuVzxXzbxLRlJEf9PjqQbC7n15SJAlqSL7LqPPhnsNvmQPat78fFEboh0hNmBYdv45HmDBVVhKTsEo4Bm0w2+DOgdeE8SEmJSqx4v2p3frpdg3UBXths68mU65/qSxlS9EjbVo6oalEprOUpDa14QNAyNS3cOzg28V8atPMN8y2Zum2NrBlDjf+xOWAprjzFLOonFTuTyAZNAUy8hHx26BRIPdovKmvnCKclzYo1m0dshV+A1PF59eu1gRQVxtcgFaE5XRbALLrB5OsLReypyROEnWP0HuvG/s6lVOmVBoLvOtq1rTb3Z6EsnW4kT73Ux0i+pxlQpD178YucHrACBTXPcn9Q8docF0CXz0MMIxHezRC1fwv1g3LSWHN3I1oDL3PTp2tU6kB0OS3778uBFfQh1O96klIjTG+1onJoLCMMJkQCcx/IaSeD2MISnJzTNpaHZIzILmIvLeAIsQ5ybBVgZEH+l13RWf60LYdG7NiGX2zKA0IHEIz4E/8kukTVJ9yKhFqqWLRG8oe9Zcp+3IkmO65MajfylGcapEYtxFnXI+o9Z4XY92NVrKAd7daAoyOQTDgzYcibcPS9AGKYA6O98Dgxd02wwa3Tsaqn3AuQJSNPXOamODy+qkyPqNZErQ2BE540eGMa/GittGMBcAhFzgFkSZGNTjg6Enay/iK/k/DdYU39/oLsFBRr/b7cfaYy/IiKOml3ZSqWUlt1eGvR3SlDChPY4Txnw5DHjRhinLi2EVHw7mj8ZgqZef9OifSCss9f9ayRv7FQaN4jnf0EBQhIaer4l7Xd/wtNJMUzHcWMDt7cn/R5QGCZMVBZGReEdKHH3IJ0f2w80jtSncuX84+8jXxJ6LOYaXLI0VGkloJVZ1OBbRmv+labnNkFDpMEMLSetUTWWxQDIGYwUn6UgebCDcaV68XM2OMNaNs8xkiq0p1kZFmLu0f5uyEUk5Q/FuFzhF69j6uQxzZDl5W+D5owcmM27XAQ6HcmLKK/cNXXfD4dRjtwOQQT+1hd3W3mUf/eZxOvSJBwde5TKVK4fd8NcWdjNOBlrgNci2QA1JtPOEIe9SwlZi15fVYYvGeKQMuHL5P44FAN+A8xqNPpV6JqPxD6pUrwgznHl6fMN0Is/XRmd0mbvQUGIXxBA80OweWhIeBVCHGrDkIB9oxLPhIYARjOJk1Bh7XY5HdLrXJ9oEc+KwuG1Fdeeb7qbaDEpTZa7ihAXcDNTC4HFA0ibXwrZRIp5dRNXKyf/yCBLB/jVOK1cPUdvqS1RSvamw6jBd2NwWDwOm2PHtfGQwXeFThCbHNFNJvS3UaAL9aMqEHsApU+t5Z/I5/OGR4aXqzm6y63682SFKV8Zt9hfxB/xkIwxTnVN+zd8oRr74tMeF4BIj4zLH1seZABfcfgneeFwiAS6ZfSRa8kFpvPx1wsJSf6cnLGgAQC+KVmx81E7x6BA2fUEfNN0Ty7gj6NjhXBMmXjDkf9nrqQyBFeIAAAAAAAAAAAAAAAA==" width="600" height="200" loading="lazy" decoding="async" alt="Ilustrasi tiga langkah: pilah sampah, timbang sampah, lalu hasilnya menjadi tabungan rupiah">
          </div>
          <ol class="f4-bank-program-flow">
            <li class="f4-bank-program-step"><strong>Pilah &amp; setor</strong><p>Pisahkan sampah bernilai, lalu bawa saat penimbangan.</p></li>
            <li class="f4-bank-program-step"><strong>Timbang &amp; jual</strong><p>Berat dicatat dan hasil penjualan disahkan pengurus.</p></li>
            <li class="f4-bank-program-step"><strong>Tabungan tercatat</strong><p>Hasil dibagi sesuai aturan untuk warga dan dana program.</p></li>
          </ol>
          <p class="f4-public-program-note">Pantau setoran dan tabungan, serta ajukan pencairan melalui akun warga.</p>
        </section>
        </div>
        <section id="v17Transparansi" class="v17-section f4-public-transparency" aria-label="Tren dan jenis sampah yang disetor">
          <div class="f4-public-insights">
            <section class="f4-public-insight" aria-labelledby="f4PubTrendTitle">
              <div class="f4-public-insight-top">
                <h2 id="f4PubTrendTitle">Tren Setoran</h2>
                <select id="f4PubTrendMode" aria-label="Tampilan grafik setoran"><option value="period">Periode</option><option value="month">Bulanan</option></select>
              </div>
              <div id="f4PubTrendBars" class="f4-public-trend-bars" role="img" aria-label="Grafik berat setoran per periode">Memuat tren setoran...</div>
            </section>
            <section class="f4-public-insight" aria-labelledby="f4PubTypesTitle">
              <div class="f4-public-insight-top"><h2 id="f4PubTypesTitle">Jenis Sampah</h2></div>
              <div class="f4-public-types-layout">
                <div class="f4-public-donut-stage">
                  <svg id="f4PubTypesDonut" class="f4-public-donut" viewBox="0 0 180 180" role="img" aria-label="Persentase berat per jenis sampah"></svg>
                  <div class="f4-public-donut-label"><strong id="f4PubTypesTotal">—</strong><small>Total berat</small></div>
                </div>
                <div id="f4PubTypesLegend" class="f4-public-types-list" aria-live="polite">Memuat jenis sampah...</div>
              </div>
              <small id="f4PubTypesNote" class="f4-public-types-note"></small>
            </section>
          </div>
        </section>
        <section id="v17Kegiatan" class="f4-public-stories" aria-label="Enam foto kegiatan Bank Sampah terbaru">
          <section id="v17Dokumentasi" class="v17-section">
            <div id="v17Albums" class="v17-photo-feed" aria-live="polite">Memuat foto terbaru...</div>
          </section>
        </section>
        <section id="v17Informasi" class="f4-public-info" aria-labelledby="f4PublicInfoHeading">
          <h2 id="f4PublicInfoHeading">Informasi lainnya</h2>
          <details id="f4PublicMoreInfo" class="f4-public-more">
            <summary><span><strong>Perkembangan program &amp; inventaris</strong><small>Lihat kegiatan terbaru, tahapan program, dan perlengkapan.</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
            <div class="f4-public-more-content">
                    <section id="v17Perkembangan" class="v17-section f4-dev" aria-label="Tahapan kegiatan program">
          <div class="f4-dev-grid">
            <section class="f4-dev-activity-card" aria-labelledby="f4DevActivityTitle">
              <div class="f4-dev-head"><h3 id="f4DevActivityTitle">Progres program</h3><small id="f4DevStepCount" class="f4-dev-head-note"></small></div>
              <div id="f4DevStepTrack" class="f4-dev-step-track" aria-label="Tahapan kegiatan"></div>
              <div class="f4-dev-timeline-head"><strong>Kegiatan terbaru</strong><button id="f4DevShowAll" class="f4-dev-show-more" type="button" hidden>Lihat semua</button></div>
              <ol id="v17Timeline" class="f4-dev-timeline"><li class="f4-dev-empty-activity">Memuat kegiatan...</li></ol>
            </section>
          </div>
        </section>

              <section id="v17Inventaris" class="v17-section"><h2>Inventaris kegiatan</h2><div id="v17Inventory" class="v17-inventory">Memuat inventaris...</div></section>
            </div>
          </details>
        </section>
      </div>`;
    $('v17Logo').src=v17Logo;
    $('v17Logo').addEventListener('error',()=>{$('v17Logo').replaceWith(__f4.globals.Object.assign(__f4.globals.document.createElement('img'),{src:'/assets/icons/bank.svg',alt:'Bank Sampah'}));},{once:true});
    $('v17PublicAccount').onclick=v17PublicAccountClick;
    $('f4PublicSeeReport').onclick=()=>$('v17Transparansi')?.scrollIntoView({behavior:'smooth',block:'start'});
    $('f4PublicSeeProgress').onclick=()=>$('v17WasteTypes')?.scrollIntoView({behavior:'smooth',block:'start'});
    v17PublicAccount();
  }
  function v17PublicAccount(){
    const btn=$('v17PublicAccount');if(!btn)return;btn.replaceChildren();
    if(token&&profile){
      btn.title='Kembali ke akun saya';btn.setAttribute('aria-label','Kembali ke akun saya');
      if(v15AvatarData){const img=__f4.globals.document.createElement('img');img.src=v15AvatarData;img.alt='';btn.appendChild(img);}
      else btn.textContent=(profile.nama||'?').slice(0,1).toUpperCase();
    }else{btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>';btn.title='Masuk akun';btn.setAttribute('aria-label','Masuk akun');}
  }
  function v17PublicAccountClick(){
    if(token&&profile)showDashboard(profile);
    else{v17State('auth');v11ShowLogin();}
  }
  function v17PublicStat(label,value){
    const c=__f4.globals.document.createElement('div');c.className='v17-public-metric';c.dataset.metric=/setoran/i.test(label)?'deposit':/anggota/i.test(label)?'user':/jenis/i.test(label)?'inventory':/berat/i.test(label)?'bank':/kegiatan/i.test(label)?'calendar':'cash';const small=__f4.globals.document.createElement('small');small.textContent=label;
    const strong=__f4.globals.document.createElement('strong');strong.textContent=value;c.append(small,strong);return c;
  }
  // Flat, illustrated category tiles. All categories and rates still come from live catalog data.
  function v17PublicWasteIcon(category){
    const icons={
      Kertas:'<rect x="18" y="12" width="45" height="50" rx="5" fill="#F4F9FF" stroke="#2D80BF" stroke-width="3"/><path d="M29 27h24M29 36h24M29 45h17" stroke="#6DB5E4" stroke-width="3" stroke-linecap="round"/><path d="M38 12V7h31v43h-6" fill="none" stroke="#70B5E2" stroke-width="3" stroke-linecap="round"/>',
      Plastik:'<path d="M30 13h23v8H30z" fill="#3A91CA"/><path d="M34 21h15v8c0 6 9 10 9 19v12c0 5-4 8-8 8H33c-5 0-8-3-8-8V48c0-9 9-13 9-19z" fill="#61C7E5" stroke="#2386BB" stroke-width="3"/><path d="M27 43h29M27 55h29" stroke="#DDF8FB" stroke-width="3"/><path d="M30 13h23" stroke="#2386BB" stroke-width="3" stroke-linecap="round"/>',
      Logam:'<path d="M15 16c0-3.5 5-6 13-6s13 2.5 13 6v47c0 4-5 6-13 6s-13-2-13-6z" fill="#76C4E5" stroke="#287FA9" stroke-width="2.6"/><ellipse cx="28" cy="16" rx="13" ry="5" fill="#E5F5FB" stroke="#287FA9" stroke-width="2.6"/><path d="M23 16h10" stroke="#79A6BC" stroke-width="1.9" stroke-linecap="round"/><path d="M16.5 31h23v23h-23z" fill="#EAF8FC"/><path d="M21 39h14M23 46h10" stroke="#3897BB" stroke-width="2.7" stroke-linecap="round"/><path d="M43 35c0-3.5 6-6 16-6s16 2.5 16 6v25c0 5-6 8-16 8s-16-3-16-8z" fill="#B3CDE1" stroke="#557F9E" stroke-width="2.6"/><ellipse cx="59" cy="35" rx="16" ry="5.5" fill="#EFF7FC" stroke="#557F9E" stroke-width="2.6"/><path d="M44.5 46h29v14c-4.5 4-24.5 4-29 0z" fill="#E7F3FA"/><path d="M50 53h18" stroke="#648FB0" stroke-width="2.8" stroke-linecap="round"/><path d="M49 60h20" stroke="#9FBACE" stroke-width="1.5" stroke-linecap="round"/>',
      Campuran:'<rect x="15" y="26" width="53" height="38" rx="5" fill="#E9C6F0" stroke="#9B4AAF" stroke-width="3"/><path d="M15 36h53M41 26v38" stroke="#9B4AAF" stroke-width="3"/><path d="m26 25 6-12 22 12" fill="#F5DB9E" stroke="#BF8D32" stroke-width="3" stroke-linejoin="round"/><circle cx="56" cy="19" r="8" fill="#74C9A6" stroke="#30996B" stroke-width="2.5"/>',
      Lainnya:'<rect x="20" y="23" width="46" height="43" rx="9" fill="#C5E6A6" stroke="#569B38" stroke-width="3"/><path d="M31 23v-9h24v9M43 36l-8 13h16l-5 7" fill="none" stroke="#367C36" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
    };
    const svg=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 84 78');
    svg.setAttribute('aria-hidden','true');
    svg.setAttribute('focusable','false');
    svg.innerHTML=icons[category]||icons.Lainnya;
    return svg;
  }
  // Reuse the public category artwork in the authenticated member price dialog.
  __f4.window.f4BankWasteCategoryIcon=v17PublicWasteIcon;
  // Exactly one anchored, floating price bubble; category tiles never change height.
  let v17WasteBubble=null,v17WasteBubbleTrigger=null;
  function v17CloseWasteBubble(restoreFocus=false){
    if(!v17WasteBubble)return;
    v17WasteBubble.hidden=true;
    if(v17WasteBubbleTrigger){
      const trigger=v17WasteBubbleTrigger;
      trigger.setAttribute('aria-expanded','false');
      trigger.closest('.f4-public-waste-category')?.classList.remove('is-active');
      v17WasteBubbleTrigger=null;
      if(restoreFocus&&trigger.isConnected)trigger.focus({preventScroll:true});
    }
  }
  function v17PlaceWasteBubble(){
    if(!v17WasteBubble||v17WasteBubble.hidden||!v17WasteBubbleTrigger)return;
    const rect=v17WasteBubbleTrigger.getBoundingClientRect();
    const viewport=__f4.window.visualViewport;
    const vWidth=viewport?.width||__f4.window.innerWidth;
    const vHeight=viewport?.height||__f4.window.innerHeight;
    const vLeft=viewport?.offsetLeft||0;
    const vTop=viewport?.offsetTop||0;
    if(rect.bottom<vTop||rect.top>vTop+vHeight){v17CloseWasteBubble();return;}
    const bubble=v17WasteBubble;
    bubble.style.maxHeight=__f4.globals.Math.max(140,vHeight-24)+'px';
    const width=bubble.offsetWidth;
    const height=bubble.offsetHeight;
    const x=__f4.globals.Math.max(vLeft+12,__f4.globals.Math.min(rect.left,vLeft+vWidth-width-12));
    const gap=9;
    const spaceBelow=vTop+vHeight-rect.bottom-12;
    const spaceAbove=rect.top-vTop-12;
    const placeAbove=spaceBelow<height+gap&&spaceAbove>spaceBelow;
    let y=placeAbove?rect.top-height-gap:rect.bottom+gap;
    y=__f4.globals.Math.max(vTop+12,__f4.globals.Math.min(y,vTop+vHeight-height-12));
    bubble.style.left=__f4.globals.Math.round(x)+'px';
    bubble.style.top=__f4.globals.Math.round(y)+'px';
    bubble.classList.toggle('is-above',placeAbove);
  }
  function v17EnsureWasteBubble(){
    if(v17WasteBubble?.isConnected)return v17WasteBubble;
    const bubble=__f4.globals.document.createElement('section');
    bubble.id='f4PublicWasteBubble';bubble.className='f4-public-waste-bubble';bubble.hidden=true;
    bubble.setAttribute('role','dialog');bubble.setAttribute('aria-modal','false');
    bubble.setAttribute('aria-labelledby','f4PublicWasteBubbleTitle');
    const header=__f4.globals.document.createElement('div');header.className='f4-public-waste-bubble-head';
    const info=__f4.globals.document.createElement('div');
    const title=__f4.globals.document.createElement('strong');title.id='f4PublicWasteBubbleTitle';
    const count=__f4.globals.document.createElement('small');count.id='f4PublicWasteBubbleCount';
    info.append(title,count);
    const close=__f4.globals.document.createElement('button');close.type='button';
    close.className='f4-public-waste-bubble-close';
    close.setAttribute('aria-label','Tutup rincian harga sampah');
    close.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    close.onclick=()=>v17CloseWasteBubble(true);
    header.append(info,close);
    const list=__f4.globals.document.createElement('div');list.id='f4PublicWasteBubbleItems';list.className='f4-public-waste-bubble-list';
    const hint=__f4.globals.document.createElement('p');hint.className='f4-public-waste-bubble-note';hint.textContent='Harga acuan per kg, dapat berubah mengikuti hasil penjualan.';
    bubble.append(header,list,hint);__f4.globals.document.body.append(bubble);
    v17WasteBubble=bubble;
    __f4.globals.document.addEventListener('pointerdown',event=>{
      if(bubble.hidden)return;
      if(!bubble.contains(event.target)&&!v17WasteBubbleTrigger?.contains(event.target))v17CloseWasteBubble();
    },true);
    __f4.globals.document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!bubble.hidden){event.preventDefault();v17CloseWasteBubble(true);}
    });
    // Capture scrolling in nested content too; the bubble stays anchored without layout shifts.
    __f4.window.addEventListener('scroll',v17PlaceWasteBubble,true);
    __f4.window.addEventListener('resize',v17PlaceWasteBubble,{passive:true});
    __f4.window.visualViewport?.addEventListener('resize',v17PlaceWasteBubble,{passive:true});
    __f4.window.visualViewport?.addEventListener('scroll',v17PlaceWasteBubble,{passive:true});
    return bubble;
  }
  function v17OpenWasteBubble(trigger,category,goods){
    const bubble=v17EnsureWasteBubble();
    if(!bubble.hidden&&v17WasteBubbleTrigger===trigger){
      v17CloseWasteBubble(true);return;
    }
    v17CloseWasteBubble();
    v17WasteBubbleTrigger=trigger;
    trigger.setAttribute('aria-expanded','true');
    trigger.closest('.f4-public-waste-category')?.classList.add('is-active');
    $('f4PublicWasteBubbleTitle').textContent=category;
    $('f4PublicWasteBubbleCount').textContent=goods.length+' jenis sampah';
    const list=$('f4PublicWasteBubbleItems');list.replaceChildren();
    for(const item of goods){
      const row=__f4.globals.document.createElement('div');row.className='f4-public-waste-bubble-item';
      const label=__f4.globals.document.createElement('span');label.textContent=item.nama;
      const price=__f4.globals.document.createElement('strong');const rate=(0,__f4.globals.Number)(item.hargaAcuan);
      price.textContent=__f4.globals.Number.isFinite(rate)&&rate>0?'Rp '+rate.toLocaleString('id-ID')+'/kg':'Tarif belum tersedia';
      row.append(label,price);list.append(row);
    }
    bubble.hidden=false;
    v17PlaceWasteBubble();
    bubble.querySelector('.f4-public-waste-bubble-close')?.focus({preventScroll:true});
  }
  function v17RenderPublicWaste(items){
    const root=$('f4PublicWasteList'),count=$('f4PublicWasteCount');if(!root)return;
    v17CloseWasteBubble();
    root.replaceChildren();
    const categories=new __f4.globals.Map();
    const names=['Kertas','Plastik','Logam','Campuran','Lainnya'];
    const classify=value=>{
      const key=(0,__f4.globals.String)(value||'').trim().toLocaleLowerCase('id-ID');
      return names.find(name=>name.toLocaleLowerCase('id-ID')===key)||
        (key==='umum'?'Campuran':'Lainnya');
    };
    const goods=__f4.globals.Array.isArray(items)?items.filter(x=>x&&(0,__f4.globals.String)(x.nama||'').trim()):[];
    if(count)count.textContent=goods.length?goods.length+' jenis':'';
    for(const good of goods){
      const group=classify(good.kelompok);
      if(!categories.has(group))categories.set(group,[]);
      categories.get(group).push(good);
    }
    for(const category of names){
      const goodsInCategory=categories.get(category);
      if(!goodsInCategory?.length)continue;
      goodsInCategory.sort((a,b)=>a.nama.localeCompare(b.nama,'id'));
      const tile=__f4.globals.document.createElement('div');tile.className='f4-public-waste-category';
      tile.dataset.category=category;
      const button=__f4.globals.document.createElement('button');button.type='button';
      button.className='f4-public-waste-category-head';
      button.setAttribute('aria-label','Lihat jenis dan harga sampah '+category);
      button.setAttribute('aria-controls','f4PublicWasteBubble');
      button.setAttribute('aria-haspopup','dialog');
      button.setAttribute('aria-expanded','false');
      const picture=__f4.globals.document.createElement('span');picture.className='f4-public-waste-picture';
      picture.append(v17PublicWasteIcon(category));
      const title=__f4.globals.document.createElement('strong');title.textContent=category;
      const meta=__f4.globals.document.createElement('span');meta.className='f4-public-waste-category-meta';
      const amount=__f4.globals.document.createElement('small');amount.textContent=goodsInCategory.length+' jenis';
      const arrow=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
      arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('fill','none');arrow.setAttribute('stroke','currentColor');
      arrow.setAttribute('stroke-width','2');arrow.setAttribute('stroke-linecap','round');arrow.setAttribute('stroke-linejoin','round');
      arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<path d="m9 18 6-6-6-6"/>';
      meta.append(amount,arrow);button.append(picture,title,meta);
      button.onclick=()=>v17OpenWasteBubble(button,category,goodsInCategory);
      tile.append(button);root.append(tile);
    }
    if(!root.childElementCount)root.textContent=__f4.globals.Array.isArray(items)?
      'Jenis sampah yang diterima belum dipublikasikan.':'Jenis sampah belum dapat dimuat.';
  }

  function v17AlbumCard(a){
    const d=__f4.globals.document.createElement('details');d.className='v17-album';
    if(/^https:\/\//.test(a.sampul||'')){const img=__f4.globals.document.createElement('img');img.src=a.sampul;img.alt='Sampul '+a.judul;img.loading='lazy';d.appendChild(img);}
    const s=__f4.globals.document.createElement('summary');s.textContent=a.judul||'Album kegiatan';d.appendChild(s);
    const p=__f4.globals.document.createElement('p');p.textContent=[a.tanggal,(a.media?.length||0)+' media',a.deskripsi].filter(__f4.globals.Boolean).join(' • ');d.appendChild(p);
    if(a.media?.length){const list=__f4.globals.document.createElement('div');list.className='v17-media-list';a.media.forEach(m=>{
      if(!/^https:\/\//.test(m.url||''))return;
      const link=__f4.globals.document.createElement('a');link.href=m.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=m.jenis==='Album Google Drive'?'Buka folder foto & video'+(m.caption?' — '+m.caption:''):(m.jenis||'Media')+' — '+(m.caption||'Lihat foto/video');
      if(m.jenis==='Album Google Drive')link.insertAdjacentHTML('afterbegin','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9H3Z"/></svg>');
      list.appendChild(link);
    });d.appendChild(list);}
    return d;
  }
  let v17PublicChartMode='berat',v17PublicChartRange='bulan';
  let v17PublicChartRows=[],v17PublicDailyRows=null,v17PublicChartSource='penjualan',v17PublicReportReady=false,v17PublicReportFailed=false,v17PublicLoadSerial=0;
  let v17ProgressCount=0;
  function f4DevUnit(value,mode='berat'){
    const n=(0,__f4.globals.Number)(value)||0;
    return mode==='nilai'?rupiah(__f4.globals.Math.round(n)):new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(n)+' kg';
  }
  function f4DevShort(value,mode){
    const n=__f4.globals.Math.max(0,(0,__f4.globals.Number)(value)||0);
    if(mode==='nilai'){
      if(n>=1000000)return new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(n/1000000)+' jt';
      if(n>=1000)return new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(n/1000)+' rb';
      return new __f4.globals.Intl.NumberFormat('id-ID').format(n);
    }
    return new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(n);
  }
  function f4DevTodayWib(){
    const parts=new __f4.globals.Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new __f4.globals.Date());
    const o=__f4.globals.Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
    return __f4.globals.Date.UTC((0,__f4.globals.Number)(o.year),(0,__f4.globals.Number)(o.month)-1,(0,__f4.globals.Number)(o.day));
  }
  function f4DevDataRows(){
    const fields=['beratKg','pendingWeightKg','hasilPenjualan'];
    const normalize=(row,label,full)=>({
      label,full,
      beratKg:__f4.globals.Math.max(0,(0,__f4.globals.Number)(row?.beratKg)||0),
      pendingWeightKg:__f4.globals.Math.max(0,(0,__f4.globals.Number)(row?.pendingWeightKg)||0),
      hasilPenjualan:__f4.globals.Math.max(0,(0,__f4.globals.Number)(row?.hasilPenjualan)||0)
    });
    if(v17PublicChartRange==='bulan')return v17PublicChartRows
      .filter(row=>/^\d{4}-(0[1-9]|1[0-2])$/.test((0,__f4.globals.String)(row.periode||row.bulan||'')))
      .sort((x,y)=>(0,__f4.globals.String)(x.periode||x.bulan).localeCompare((0,__f4.globals.String)(y.periode||y.bulan)))
      .slice(-6).map(row=>{
        const code=(0,__f4.globals.String)(row.periode||row.bulan);
        return normalize(row,v17Label(code),code);
      });
    if(!v17PublicReportReady||!__f4.globals.Array.isArray(v17PublicDailyRows))return null;
    const byDay=new __f4.globals.Map(v17PublicDailyRows.map(row=>[(0,__f4.globals.String)(row.tanggal||''),row]));
    const windowDays=30;
    const today=f4DevTodayWib();
    const days=__f4.globals.Array.from({length:windowDays},(_,i)=>{
      const date=new __f4.globals.Date(today-(windowDays-1-i)*86400000);
      const key=date.toISOString().slice(0,10);
      const label=(0,__f4.globals.String)(date.getUTCDate()).padStart(2,'0')+'/'+(0,__f4.globals.String)(date.getUTCMonth()+1).padStart(2,'0');
      return normalize(byDay.get(key),label,key);
    });
    // Periode: only dates with actual deposits/sales. Do not fabricate empty transactions.
    if(v17PublicChartRange==='period')return days.filter(row=>
      row.beratKg>0||row.pendingWeightKg>0||row.hasilPenjualan>0);
    const groups=[];
    for(let i=0;i<days.length;i+=5){
      const block=days.slice(i,i+5);
      const start=block[0],end=block[block.length-1];
      const row={};fields.forEach(key=>{row[key]=block.reduce((sum,d)=>sum+d[key],0)});
      groups.push(normalize(row,start.label,start.full+' s.d. '+end.full));
    }
    return groups;
  }
  function f4DevMakeStat(label,value,icon){
    const box=__f4.globals.document.createElement('div');box.className='f4-dev-stat';
    const symbol=__f4.globals.document.createElement('span');symbol.className='f4-dev-stat-icon';
    const svg=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
    const paths={
      weight:'<path d="M5 8h14l2 12H3L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/><path d="M12 12v4"/>',
      pending:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      sales:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/><path d="M6 15h5"/>',
      steps:'<path d="M4 20V4h12v4"/><path d="m9 14 4 4 8-9"/>'
    };
    svg.innerHTML=paths[icon]||paths.weight;symbol.append(svg);
    const copy=__f4.globals.document.createElement('div');copy.className='f4-dev-stat-copy';
    const small=__f4.globals.document.createElement('small');small.className='f4-dev-stat-label';small.textContent=label;
    const strong=__f4.globals.document.createElement('strong');strong.className='f4-dev-stat-value';strong.textContent=value;
    copy.append(small,strong);box.append(symbol,copy);return box;
  }
  function v17RenderPublicChart(){
    const root=$('f4DevChart'),note=$('f4DevChartNote'),legend=$('f4DevLegend'),stats=$('f4DevStats'),summary=$('f4DevChartSummary');
    if(!root||!note||!legend||!stats||!summary)return;
    const valueMode=v17PublicChartMode==='nilai';
    $('v17Perkembangan').querySelectorAll('[data-dev-mode],[data-dev-range]').forEach(button=>{
      const selected=button.dataset.devMode===v17PublicChartMode||button.dataset.devRange===v17PublicChartRange;
      button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',(0,__f4.globals.String)(selected));
    });
    const periodLabel=v17PublicChartRange==='period'?'Periode setoran':v17PublicChartRange==='30'?'30 hari terakhir':'6 bulan terakhir';
    $('f4DevChartPeriod').textContent=periodLabel;
    const data=f4DevDataRows();
    const dataAvailable=data!==null&&(!valueMode||v17PublicReportReady);
    const rows=dataAvailable?data:[];
    const amount=key=>rows.reduce((sum,row)=>sum+row[key],0);
    const weight=amount('beratKg'),pending=amount('pendingWeightKg'),sales=amount('hasilPenjualan');
    stats.replaceChildren(
      f4DevMakeStat('Berat sah',dataAvailable?f4DevUnit(weight):'—','weight'),
      f4DevMakeStat('Tahap kegiatan',(0,__f4.globals.String)(v17ProgressCount),'steps')
    );
    const strong=__f4.globals.document.createElement('strong');strong.textContent=dataAvailable?f4DevUnit(valueMode?sales:weight,v17PublicChartMode):'—';
    const descriptor=__f4.globals.document.createElement('small');descriptor.textContent=valueMode?'Hasil penjualan sah':v17PublicReportReady?'Berat sah':v17PublicChartSource==='setoran'?'Berat sampah disetor':'Berat penjualan sah';
    summary.replaceChildren(strong,descriptor);
    root.replaceChildren();legend.replaceChildren();
    root.style.setProperty('--dev-count',(0,__f4.globals.String)(__f4.globals.Math.max(1,rows.length)));
    const incomplete=!v17PublicReportReady&&v17PublicReportFailed;
    if(!dataAvailable){
      const info=__f4.globals.document.createElement('div');info.className='f4-dev-empty';
      info.textContent=v17PublicChartRange!=='bulan'?'Rekap harian belum tersedia.':incomplete?'Nominal belum dapat dimuat.':'Memuat laporan...';
      root.append(info);
      note.textContent=v17PublicChartRange==='period'?'Periode menggunakan tanggal setoran dari rekap harian yang tersedia.':v17PublicChartRange==='30'?'Rekap 30 hari belum tersedia.':'Grafik nilai hanya menampilkan hasil jual yang sudah sah.';
      return;
    }
    if(!rows.length){
      const empty=__f4.globals.document.createElement('div');empty.className='f4-dev-empty';empty.textContent='Belum ada transaksi pada periode ini.';root.append(empty);
    }else{
      const key=valueMode?'hasilPenjualan':'beratKg';
      const max=__f4.globals.Math.max(1,...rows.map(row=>valueMode?row.hasilPenjualan:__f4.globals.Math.max(row.beratKg,row.pendingWeightKg)));
      rows.forEach(row=>{
        const col=__f4.globals.document.createElement('div');col.className='f4-dev-column';
        col.setAttribute('aria-label',row.full+': '+f4DevUnit(row[key],v17PublicChartMode)+(valueMode?'':', belum terjual '+f4DevUnit(row.pendingWeightKg)));
        const number=__f4.globals.document.createElement('span');number.className='f4-dev-column-value';
        number.textContent=f4DevShort(row[key],v17PublicChartMode)+(valueMode?'':'');
        const track=__f4.globals.document.createElement('div');track.className='f4-dev-column-track';
        const confirmed=__f4.globals.document.createElement('span');confirmed.className='f4-dev-column-bar';confirmed.style.setProperty('--dev-height',row[key]>0?__f4.globals.Math.max(3,row[key]/max*100)+'%':'0%');
        confirmed.title=(v17PublicReportReady?'Sah: ':v17PublicChartSource==='setoran'?'Disetor: ':'Terjual: ')+f4DevUnit(row[key],v17PublicChartMode)+' • '+row.full;track.append(confirmed);
        if(!valueMode&&v17PublicReportReady){
          const waiting=__f4.globals.document.createElement('span');waiting.className='f4-dev-column-bar is-pending';
          waiting.style.setProperty('--dev-height',row.pendingWeightKg>0?__f4.globals.Math.max(3,row.pendingWeightKg/max*100)+'%':'0%');
          waiting.title='Belum terjual: '+f4DevUnit(row.pendingWeightKg)+' • '+row.full;track.append(waiting);
        }
        const label=__f4.globals.document.createElement('span');label.className='f4-dev-column-label';label.textContent=row.label;
        col.append(number,track,label);root.append(col);
      });
    }
    const addLegend=(label,pending=false)=>{
      const item=__f4.globals.document.createElement('span');if(pending)item.className='is-pending';
      const dot=__f4.globals.document.createElement('i');dot.setAttribute('aria-hidden','true');item.append(dot,__f4.globals.document.createTextNode(label));legend.append(item);
    };
    addLegend(valueMode?'Hasil jual sah':v17PublicReportReady?'Berat sah':v17PublicChartSource==='setoran'?'Setoran tercatat':'Berat penjualan sah');
    if(!valueMode&&v17PublicReportReady)addLegend('Belum terjual',true);
    root.setAttribute('aria-label',(valueMode?'Hasil jual rupiah':'Berat sampah kilogram')+' — '+periodLabel+'. '+rows.map(row=>row.full+': '+f4DevUnit(row[valueMode?'hasilPenjualan':'beratKg'],v17PublicChartMode)).join('; '));
    note.textContent=!v17PublicReportReady?
      (incomplete?'Rincian transaksi belum tersedia.':''):
      v17PublicChartRange==='30'?'Setiap batang mewakili 5 hari. Nominal hanya transaksi sah.':
      v17PublicChartRange==='period'?'Periode berdasarkan tanggal yang tercatat dalam 30 hari terakhir.':
      valueMode?'Hanya hasil penjualan sah, bukan perkiraan.':'Berat terjual dan belum terjual ditampilkan terpisah.';
  }
  function v17BindPublicChart(){
    $('v17Perkembangan')?.querySelectorAll('[data-dev-mode],[data-dev-range]').forEach(button=>{
      if(button.dataset.chartBound==='1')return;
      button.dataset.chartBound='1';
      button.addEventListener('click',()=>{
        if(button.dataset.devMode)v17PublicChartMode=button.dataset.devMode;
        if(button.dataset.devRange)v17PublicChartRange=button.dataset.devRange;
        v17RenderPublicChart();
      });
    });
  }
  // Public charts share weighed data only: date totals and waste-type totals.
  let f4PublicInsightHome=null,f4PublicTrendMode='period';
  const f4PublicNum=n=>new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(__f4.globals.Math.max(0,(0,__f4.globals.Number)(n)||0));
  const f4PublicKg=n=>f4PublicNum(n)+' kg';
  const f4PublicColors=['#5965DA','#D58C1B','#F7B916','#39A04D','#0EAD84','#B043BB','#91A49A','#149DD1','#F06E3B','#774CD1','#35B4B1','#C55A89'];
  function f4PublicRenderInsights(){
    const root=$('f4PubTrendBars'),donut=$('f4PubTypesDonut'),legend=$('f4PubTypesLegend');
    const totalLabel=$('f4PubTypesTotal'),note=$('f4PubTypesNote'),picker=$('f4PubTrendMode');
    if(!root||!donut||!legend||!totalLabel||!note||!picker)return;
    if(picker.dataset.bound!=='1'){
      picker.dataset.bound='1';
      picker.onchange=()=>{f4PublicTrendMode=picker.value;f4PublicRenderInsights();};
    }
    const days=__f4.globals.Array.isArray(f4PublicInsightHome?.depositPeriods)?f4PublicInsightHome.depositPeriods:null;
    const monthly=v17PublicChartSource==='setoran'?v17PublicChartRows:[];
    const hasPeriods=__f4.globals.Array.isArray(days);
    picker.querySelector('option[value="period"]').disabled=!hasPeriods;
    if(!hasPeriods&&f4PublicTrendMode==='period')f4PublicTrendMode='month';
    picker.value=f4PublicTrendMode;
    const months=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    let rows=[];
    if(f4PublicTrendMode==='period'){
      rows=(days||[]).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.tanggal))
        .sort((a,b)=>a.tanggal.localeCompare(b.tanggal)).slice(-6)
        .map(x=>({label:x.tanggal.slice(8,10)+'/'+x.tanggal.slice(5,7),
          full:x.tanggal,kg:__f4.globals.Math.max(0,(0,__f4.globals.Number)(x.beratKg)||0)}));
    }else{
      rows=(monthly||[]).filter(x=>/^\d{4}-\d{2}$/.test((0,__f4.globals.String)(x.bulan||x.periode||'')))
        .slice(-6).map(x=>{
          const date=(0,__f4.globals.String)(x.bulan||x.periode);
          return {label:months[(0,__f4.globals.Number)(date.slice(5,7))-1]||date,full:date,
            kg:__f4.globals.Math.max(0,(0,__f4.globals.Number)(x.beratKg)||0)};
        });
    }
    root.replaceChildren();
    if(!rows.length){
      root.classList.add('is-empty');root.textContent='Belum ada setoran untuk ditampilkan.';
      root.setAttribute('aria-label','Belum ada data perkembangan setoran.');
    }else{
      root.classList.remove('is-empty');
      root.style.setProperty('--f4-bar-count',(0,__f4.globals.String)(rows.length));
      const top=__f4.globals.Math.max(1,...rows.map(x=>x.kg));
      root.setAttribute('aria-label',rows.map(x=>x.full+': '+f4PublicKg(x.kg)).join('; '));
      rows.forEach(row=>{
        const item=__f4.globals.document.createElement('div');item.className='f4-public-bar-item';
        item.title=row.full+' • '+f4PublicKg(row.kg);
        const value=__f4.globals.document.createElement('strong');value.className='f4-public-bar-number';value.textContent=f4PublicKg(row.kg);
        const shaft=__f4.globals.document.createElement('div');shaft.className='f4-public-bar-shaft';
        const bar=__f4.globals.document.createElement('span');bar.className='f4-public-bar-fill';
        bar.style.height=row.kg>0?__f4.globals.Math.max(3,row.kg/top*100)+'%':'0%';
        shaft.append(bar);
        const caption=__f4.globals.document.createElement('small');caption.textContent=row.label;
        item.append(value,shaft,caption);root.append(item);
      });
    }
    const kinds=__f4.globals.Array.isArray(f4PublicInsightHome?.itemWeights)?f4PublicInsightHome.itemWeights:null;
    const items=(kinds||[]).filter(x=>(0,__f4.globals.Number)(x.beratKg)>0).slice()
      .sort((a,b)=>(0,__f4.globals.Number)(b.beratKg)-(0,__f4.globals.Number)(a.beratKg)||(0,__f4.globals.String)(a.nama).localeCompare((0,__f4.globals.String)(b.nama),'id'));
    const total=items.reduce((sum,x)=>sum+(0,__f4.globals.Number)(x.beratKg),0);
    const svgNS='http://www.w3.org/2000/svg',r=65,stroke=24,circ=2*__f4.globals.Math.PI*r;
    donut.replaceChildren();legend.replaceChildren();
    const ring=(color,dash,offset)=>{
      const circle=__f4.globals.document.createElementNS(svgNS,'circle');
      circle.setAttribute('cx','90');circle.setAttribute('cy','90');circle.setAttribute('r',(0,__f4.globals.String)(r));
      circle.setAttribute('fill','none');circle.setAttribute('stroke',color);
      circle.setAttribute('stroke-width',(0,__f4.globals.String)(stroke));
      circle.setAttribute('transform','rotate(-90 90 90)');
      if(dash!==__f4.globals.undefined){
        circle.setAttribute('stroke-dasharray',dash+' '+circ);
        circle.setAttribute('stroke-dashoffset',(0,__f4.globals.String)(-offset));
      }
      donut.append(circle);return circle;
    };
    ring('#e9efea');
    totalLabel.textContent=total>0?f4PublicKg(total):'—';
    if(total<=0){
      legend.append(__f4.globals.document.createTextNode(kinds?'Belum ada berat sampah yang tercatat.':'Rincian jenis sampah belum tersedia.'));
      note.textContent=kinds?'0 jenis tercatat':'Menunggu data jenis sampah dari server.';
      donut.setAttribute('aria-label','Komposisi belum tersedia');
      return;
    }
    let offset=0;const descriptions=[];
    items.forEach((row,i)=>{
      const color=f4PublicColors[i%f4PublicColors.length],kg=(0,__f4.globals.Number)(row.beratKg),percentage=kg/total*100;
      const length=kg/total*circ;
      ring(color,__f4.globals.Math.max(0,length-(items.length>1?2.2:0)),offset+0.85);
      offset+=length;
      descriptions.push(row.nama+': '+f4PublicKg(kg)+' ('+f4PublicNum(percentage)+'%)');
      const line=__f4.globals.document.createElement('div');line.className='f4-public-type-row';
      const head=__f4.globals.document.createElement('div');head.className='f4-public-type-head';
      const name=__f4.globals.document.createElement('strong');name.className='f4-public-type-name';
      const marker=__f4.globals.document.createElement('i');marker.className='f4-public-type-dot';marker.style.backgroundColor=color;
      const label=__f4.globals.document.createElement('span');label.textContent=(0,__f4.globals.String)(row.nama||'Sampah');
      name.append(marker,label);
      const weight=__f4.globals.document.createElement('strong');weight.className='f4-public-type-weight';weight.textContent=f4PublicKg(kg);
      head.append(name,weight);
      const sub=__f4.globals.document.createElement('div');sub.className='f4-public-type-sub';
      const track=__f4.globals.document.createElement('div');track.className='f4-public-type-track';
      const fill=__f4.globals.document.createElement('span');fill.style.width=(kg/(0,__f4.globals.Number)(items[0].beratKg)*100)+'%';
      fill.style.backgroundColor=color;track.append(fill);
      const percent=__f4.globals.document.createElement('small');percent.textContent=f4PublicNum(percentage)+'%';
      sub.append(track,percent);
      line.append(head,sub);legend.append(line);
    });
    donut.setAttribute('aria-label',descriptions.join('; '));
    note.textContent=items.length+' jenis · geser daftar';
  }
  let scheduleReadUntil=0;
  async function refreshPublicSchedule(){
    if(__f4.globals.Date.now()<scheduleReadUntil)return;
    scheduleReadUntil=__f4.globals.Date.now()+60000;
    try{
      const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/public/bank/weighing-schedule',{cache:'no-store'});
      if(!response.ok)throw (0,__f4.globals.Error)();
      const rule=await response.json(),date=new __f4.globals.Date(rule.nextOccurrence+'T12:00:00+07:00');
      if(!rule.ok||!__f4.globals.Number.isFinite(date.getTime()))throw (0,__f4.globals.Error)();
      $('bank-next-day').textContent=date.toLocaleDateString('id-ID',{weekday:'long',timeZone:'Asia/Jakarta'});
      $('bank-next-date').textContent=date.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'});
      const location=$('bank-next-location');
      const place=(0,__f4.globals.String)(rule.lokasi||rule.location||'').trim();
      if(location){location.hidden=!place;location.textContent=place?'Lokasi: '+place:'';}
    }catch{
      $('bank-next-day').textContent='Jadwal belum tersedia';
      $('bank-next-date').textContent='';
      const location=$('bank-next-location');if(location){location.textContent='';location.hidden=true;}
    }
  }
  async function v17LoadPublic(){
    v17SetupPublic();refreshPublicSchedule();const chartSerial=++v17PublicLoadSerial;$('v17PublicMetrics').textContent='Memuat informasi...';
    // Independent public resources must not block each other: chart errors should
    // never leave inventory stuck on "Memuat inventaris..." or hide valid albums.
    const [homeResult,albumResult,chartResult]=await __f4.globals.Promise.allSettled([
      call('bsV11PublicHome'),call('bsV22AlbumIndexPublik'),call('bsV17GrafikPublik')
    ]);
    if(chartSerial!==v17PublicLoadSerial)return;
    if(homeResult.status==='fulfilled'){
      const home=homeResult.value;
      f4PublicInsightHome=home;
      $('v17PublicMetrics').replaceChildren(
        v17PublicStat('Berat Setoran',
          kg(home.beratSetoranTercatat??home.beratTerkonfirmasi)),
        v17PublicStat('Total Setoran',
          home.jumlahSetoranTercatat??home.jumlahSetoranTerkonfirmasi),
        v17PublicStat('Anggota Aktif',home.anggotaAktif)
      );
      v17RenderPublicWaste(home.barangDiterima);
      v25RenderTimeline(home.progres||[]);
      const inv=$('v17Inventory');
      if(inv){
        inv.replaceChildren();inv.classList.add('v21-inventory-list');
        (home.inventaris||[]).forEach(x=>inv.appendChild(v21InventoryRow(x)));
        if(!inv.childElementCount)inv.textContent='Inventaris yang dapat dilihat publik belum tersedia.';
      }
    }else{
      f4PublicInsightHome=null;
      $('v17PublicMetrics').textContent='Informasi publik gagal dimuat: '+(homeResult.reason?.message||'Gangguan layanan.');
      v17RenderPublicWaste(null);
      const inv=$('v17Inventory');
      if(inv)inv.textContent='Gagal memuat inventaris. Coba buka kembali halaman.';
      __f4.globals.console.error('Bank Sampah: data publik dan inventaris gagal dimuat',homeResult.reason);
    }
    if(albumResult.status==='fulfilled'){
      const albums=albumResult.value;
      await v21RenderAlbumCover(albums);
    }else{
      const list=$('v22DocList'),covers=$('v17Albums');
      if(list)list.textContent='Gagal memuat album. Coba buka kembali halaman.';
      if(covers)covers.textContent='Gagal memuat album dokumentasi.';
      __f4.globals.console.error('Bank Sampah: album gagal dimuat',albumResult.reason);
    }
    v17BindPublicChart();
    if(chartResult.status==='fulfilled'){
      const chart=chartResult.value;
      v17PublicChartRows=__f4.globals.Array.isArray(chart.bulan)?chart.bulan.slice(-6):[];
      v17PublicChartSource=chart.source==='setoran'?'setoran':'penjualan';
      v17PublicDailyRows=null;
      v17PublicReportReady=false;v17PublicReportFailed=false;
    }else{
      v17PublicChartRows=[];v17PublicDailyRows=null;v17PublicChartSource='penjualan';
      v17PublicReportReady=false;v17PublicReportFailed=true;
      __f4.globals.console.error('Bank Sampah: grafik publik gagal dimuat',chartResult.reason);
    }
    v17RenderPublicChart();
    f4PublicRenderInsights();
    v17PublicAccount();
  }
  // Rekap harian dan nominal hanya dimuat untuk akun aktif.
  __f4.window.f4BankLoadPrivateChart=()=>{
    if(!token||!profile)return;
    v17PublicChartRange='period';v17PublicChartMode='berat';
    call('bsV25LaporanPublik','semua').then(report=>{
      if(!token||!profile)return;
      v17PublicChartRows=(__f4.globals.Array.isArray(report.bulanan)?report.bulanan:[]).slice(-6);
      v17PublicChartSource='penjualan';
      v17PublicDailyRows=__f4.globals.Array.isArray(report.harian)?report.harian:null;
      v17PublicReportReady=true;v17PublicReportFailed=false;v17RenderPublicChart();
    }).catch(()=>{v17PublicReportReady=false;v17PublicReportFailed=true;v17RenderPublicChart();});
  };
  v11LoadPublic=v17LoadPublic;
  __f4.window.v17LoadPublic=v17LoadPublic;
  v17SetupPublic();
  if(!$('v11Public').classList.contains('hidden')){v17State('public');v17LoadPublic();}
  // v18 — navigasi perangkat kecil dan riwayat mudah dikenali warga.
  const v18PrevShow=showDashboard,v18PrevPublic=v11ShowPublic,v18PrevAuth=showAuth;
  showDashboard=function(p){$('v11Public')?.classList.add('hidden');v18PrevShow(p);v18PreparePrivate();v18AddEyes();};
  v11ShowPublic=function(){v18PrevPublic();v18PreparePublic();v18ClosePublic();};
  showAuth=function(){v18PrevAuth();v18ClosePublic();};
  function v18PreparePrivate(){
    const mobile=$('dashboardView')?.querySelector('.mobile-nav');
    if(!mobile)return;
    let button=$('v18PrivateMenuButton');
    if(!button){
      mobile.replaceChildren();
      button=__f4.globals.document.createElement('button');button.id='v18PrivateMenuButton';button.type='button';
      button.className='v18-hamburger';button.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';button.title='Buka menu';
      button.setAttribute('aria-label','Buka menu samping');button.onclick=toggleMenu;
      const text=__f4.globals.document.createElement('span');text.id='v18MobileTitle';text.textContent='Bank Sampah Flamboyan 4';
      mobile.append(button,text);
    }
    v16BuildNav();
  }
  function v18AddEyes(){
    __f4.globals.document.querySelectorAll('input[type="password"]').forEach(input=>{
      if(input.closest('.v18-secret-wrap,#f4-direct-dialog')||input.id==='f4-direct-password')return;
      const wrap=__f4.globals.document.createElement('div');wrap.className='v18-secret-wrap';
      input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
      const eye=__f4.globals.document.createElement('button');eye.type='button';eye.className='v18-eye';
      eye.title='Lihat password';eye.setAttribute('aria-label','Lihat password');
      eye.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
      eye.onclick=()=>{
        const show=input.type==='password';input.type=show?'text':'password';
        eye.title=show?'Sembunyikan password':'Lihat password';eye.setAttribute('aria-label',eye.title);
        eye.innerHTML=show?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.5 6.1A11.5 11.5 0 0 1 12 6c6.4 0 10 6 10 6a15 15 0 0 1-3.1 3.6M6.1 8C3.5 9.7 2 12 2 12s3.6 6 10 6c1.3 0 2.5-.3 3.5-.7M10 10a3 3 0 0 0 4 4"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
      };
      wrap.appendChild(eye);
    });
  }
  // Riwayat Setoran: satu kartu ringkas, tidak lagi membuat tombol mata,
  // elemen rincian, atau request detail sampai pengguna menekan Resi.
  // Riwayat Penjualan tetap memakai fitur nota dan pelunasan miliknya sendiri.
  function v18DepositHistoryCard(r){
    const status=(0,__f4.globals.String)(r.status||'Estimasi');
    const canceled=/batal/i.test(status);
    const confirmed=/terkonfirmasi/i.test(status);
    const card=__f4.globals.document.createElement('article');
    card.className='f4-admin-deposit-card'+(canceled?' is-canceled':'');
    const identity=__f4.globals.document.createElement('div');identity.className='f4-admin-deposit-identity';
    const fullName=(0,__f4.globals.String)(r.namaWarga||'Warga tidak tersedia').trim();
    const displayName=f4BankDisplayWargaName(fullName);
    const avatar=f4BankPersonAvatar(fullName,{className:'f4-admin-deposit-avatar',
      memberId:r.wargaId,hasAvatar:r.hasAvatar===true||r.hasAvatar===1||r.hasAvatar==='1'});
    const copy=__f4.globals.document.createElement('div');copy.className='f4-admin-deposit-copy';
    const name=__f4.globals.document.createElement('strong');name.textContent=displayName;name.title=fullName;
    const meta=__f4.globals.document.createElement('span');meta.className='f4-admin-deposit-meta';
    const houseCode=(0,__f4.globals.String)(r.rumahWarga||r.rumah||r.houseCode||r.nomorRumah||'').trim();
    const weight=(0,__f4.globals.Number)(r.beratTimbang??r.berat);
    meta.textContent=[houseCode?'Rumah '+houseCode:'Nomor rumah belum tersedia',
      r.tanggal||'Tanggal belum tersedia',
      __f4.globals.Number.isFinite(weight)&&weight>=0?kg(weight):'Berat belum tersedia'].join(' · ');
    // Di HP hanya rumah dan berat tampil pada list; tanggal lengkap ada di resi.
    const compactMeta=__f4.globals.document.createElement('span');
    compactMeta.className='f4-admin-deposit-mobile-meta';
    compactMeta.textContent=[houseCode?'Rumah '+houseCode:'Rumah belum tersedia',
      __f4.globals.Number.isFinite(weight)&&weight>=0?kg(weight):null].filter(__f4.globals.Boolean).join(' · ');
    copy.append(name,meta,compactMeta);identity.append(avatar,copy);
    const summary=__f4.globals.document.createElement('div');summary.className='f4-admin-deposit-summary';
    const amount=__f4.globals.document.createElement('strong');amount.className='f4-admin-deposit-amount';
    const money=confirmed?r.nilaiSahRp:r.estimasi;
    amount.textContent=money==null||!__f4.globals.Number.isFinite((0,__f4.globals.Number)(money))
      ?'Nilai belum tersedia':rupiah((0,__f4.globals.Number)(money));
    const amountHint=__f4.globals.document.createElement('span');
    amountHint.textContent=canceled?'Arsip · tidak dihitung':confirmed?'Hasil sah':'Nilai perkiraan';
    const badge=__f4.globals.document.createElement('span');badge.className='f4-admin-deposit-status'+
      (canceled?' is-canceled':confirmed?' is-confirmed':' is-estimated');
    badge.textContent=status;
    summary.append(amount,amountHint,badge);
    // Salinan teks ringkas khusus HP; status tetap terbaca, bukan hanya kode warna.
    const compactSummary=__f4.globals.document.createElement('span');
    compactSummary.className='f4-admin-deposit-mobile-summary';
    const compactAmount=__f4.globals.document.createElement('strong');
    compactAmount.textContent=amount.textContent;
    const compactStatus=__f4.globals.document.createElement('small');
    compactStatus.className='f4-admin-deposit-mobile-status'+
      (canceled?' is-canceled':confirmed?' is-confirmed':' is-estimated');
    compactStatus.textContent=canceled?'Batal':confirmed?'Sah':'Estimasi';
    compactSummary.append(compactAmount,compactStatus);
    copy.appendChild(compactSummary);
    const actions=__f4.globals.document.createElement('div');actions.className='f4-admin-deposit-actions';
    const receipt=f4BankReceiptIcon(null,()=>f4BankDepositDetailPayload(r));
    receipt.classList.add('f4-admin-deposit-receipt');
    receipt.title='Lihat resi setoran '+fullName;
    receipt.setAttribute('aria-label','Lihat resi setoran '+fullName);
    const receiptLabel=__f4.globals.document.createElement('span');
    receiptLabel.className='f4-admin-deposit-action-label';
    receiptLabel.textContent='Resi';
    receipt.appendChild(receiptLabel);
    const cancel=__f4.globals.document.createElement('button');cancel.type='button';
    cancel.className='f4-admin-deposit-cancel';
    cancel.innerHTML='<svg class="f4-admin-deposit-mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg><span class="f4-admin-deposit-action-label">Batalkan</span>';
    cancel.setAttribute('aria-label','Batalkan setoran '+fullName);
    cancel.disabled=status!=='Estimasi';
    cancel.title=cancel.disabled?(canceled?'Setoran sudah dibatalkan':'Setoran yang sudah disahkan tidak dapat dibatalkan dari riwayat'):'Batalkan setoran estimasi';
    cancel.onclick=()=>cancelSetoran(r);
    const edit=__f4.globals.document.createElement('button');edit.type='button';
    edit.className='f4-admin-deposit-edit';
    edit.innerHTML='<svg class="f4-admin-deposit-mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4.5-1 10.2-10.2a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z"/></svg><span class="f4-admin-deposit-action-label">Edit</span>';
    edit.setAttribute('aria-label','Edit setoran '+fullName);
    edit.disabled=status!=='Estimasi';
    edit.title=edit.disabled?'Hanya setoran estimasi yang bisa diedit':'Koreksi setoran sebelum penjualan';
    edit.onclick=()=>editSetoran(r);
    actions.append(receipt,edit,cancel);
    card.append(identity,summary,actions);
    return card;
  }
  // Penjualan uses the same compact list as Setoran: no eye button,
  // no expand panel and no per-row nota buttons. Financial maintenance
  // remains accessible from the receipt preview instead.
  function v18SaleHistoryCard(r){
    const status=(0,__f4.globals.String)(r.status||'Draft');
    const canceled=/batal/i.test(status);
    const confirmed=/terkonfirmasi/i.test(status);
    const card=__f4.globals.document.createElement('article');
    card.className='f4-admin-deposit-card f4-admin-sale-card'+(canceled?' is-canceled':'');
    const identity=__f4.globals.document.createElement('div');identity.className='f4-admin-deposit-identity';
    const buyer=(0,__f4.globals.String)(r.lapak||'Lapak tidak tersedia').trim();
    const avatar=f4BankPersonAvatar(buyer,{className:'f4-admin-deposit-avatar',kind:'buyer'});
    const copy=__f4.globals.document.createElement('div');copy.className='f4-admin-deposit-copy';
    const name=__f4.globals.document.createElement('strong');name.textContent=buyer;
    const meta=__f4.globals.document.createElement('span');meta.className='f4-admin-deposit-meta';
    meta.textContent=r.tanggal||'Tanggal belum tersedia';
    const compactMeta=__f4.globals.document.createElement('span');compactMeta.className='f4-admin-deposit-mobile-meta';
    compactMeta.textContent=r.tanggal||'Tanggal belum tersedia';
    copy.append(name,meta,compactMeta);identity.append(avatar,copy);
    const summary=__f4.globals.document.createElement('div');summary.className='f4-admin-deposit-summary';
    const gross=(0,__f4.globals.Number)(r.bruto),received=(0,__f4.globals.Number)(r.diterima);
    const amount=__f4.globals.document.createElement('strong');amount.className='f4-admin-deposit-amount';
    amount.textContent=__f4.globals.Number.isSafeInteger(gross)&&gross>=0?rupiah(gross):'Total belum tersedia';
    const amountHint=__f4.globals.document.createElement('span');
    amountHint.textContent=canceled?'Arsip · tidak dihitung':
      'Diterima '+(__f4.globals.Number.isSafeInteger(received)&&received>=0?rupiah(received):'belum tersedia');
    const badge=__f4.globals.document.createElement('span');badge.className='f4-admin-deposit-status'+
      (canceled?' is-canceled':confirmed?' is-confirmed':' is-estimated');
    badge.textContent=status;
    summary.append(amount,amountHint,badge);
    // HP: nominal dan status di bawah nama; detail penjualan tetap di resi.
    const compactSummary=__f4.globals.document.createElement('span');
    compactSummary.className='f4-admin-deposit-mobile-summary';
    const compactAmount=__f4.globals.document.createElement('strong');compactAmount.textContent=amount.textContent;
    const compactStatus=__f4.globals.document.createElement('small');
    compactStatus.className='f4-admin-deposit-mobile-status'+
      (canceled?' is-canceled':confirmed?' is-confirmed':' is-estimated');
    compactStatus.textContent=canceled?'Batal':confirmed?'Sah':status;
    compactSummary.append(compactAmount,compactStatus);copy.appendChild(compactSummary);
    const actions=__f4.globals.document.createElement('div');actions.className='f4-admin-deposit-actions';
    const receipt=f4BankReceiptIcon(null,async()=>{
      const [payload,items]=await __f4.globals.Promise.all([
        __f4.globals.Promise.resolve(f4BankSaleReceipt(r)),
        call('bsV7RincianPenjualan',token,r.id)
      ]);
      if(!__f4.globals.Array.isArray(items))throw (0,__f4.globals.Error)('Rincian barang penjualan tidak dapat dibaca.');
      payload.details.push(['Jumlah jenis barang',(0,__f4.globals.String)(items.length)]);
      for(const item of items){
        const weight=(0,__f4.globals.Number)(item.berat),rate=(0,__f4.globals.Number)(item.harga),total=(0,__f4.globals.Number)(item.nilai);
        const desc=[__f4.globals.Number.isFinite(weight)?kg(weight):'-',
          __f4.globals.Number.isFinite(rate)?rupiah(rate)+'/kg':null,
          __f4.globals.Number.isFinite(total)?'Nilai '+rupiah(total):null].filter(__f4.globals.Boolean).join(' · ');
        payload.details.push([(0,__f4.globals.String)(item.barang||'Jenis sampah'),desc]);
      }
      if(r.alasanSelisih)payload.details.push(['Keterangan selisih',(0,__f4.globals.String)(r.alasanSelisih)]);
      if(canceled){
        payload.title='Arsip Penjualan Dibatalkan';
        payload.heading='Penjualan Dibatalkan';
        payload.status='DIBATALKAN';
        payload.amountLabel='Nilai Sebelum Pembatalan';
        payload.amount=__f4.globals.Number.isSafeInteger(gross)&&gross>=0?gross:0;
        payload.note='Penjualan ini telah dibatalkan dan tidak dihitung sebagai pemasukan. Resi hanya untuk arsip.';
      }else{
        // Optional maintenance actions appear INSIDE the receipt dialog,
        // never on the history row and never inside its JPG image.
        payload.adminActions=[{
          label:r.nota?'Ubah No. Bukti':'Isi No. Bukti',
          onClick:()=>v7EditSaleReceipt(r)
        }];
        if(/^draft$/i.test(status)&&__f4.globals.Number.isSafeInteger(received)&&
           __f4.globals.Number.isSafeInteger(gross)&&received<gross){
          payload.adminActions.push({label:'Catat Pelunasan',onClick:()=>v7SettleSale(r)});
        }
      }
      return payload;
    });
    receipt.classList.add('f4-admin-deposit-receipt');
    receipt.title='Buka resi penjualan '+buyer;
    receipt.setAttribute('aria-label','Resi penjualan '+buyer);
    const receiptLabel=__f4.globals.document.createElement('span');receiptLabel.className='f4-admin-deposit-action-label';
    receiptLabel.textContent='Resi';receipt.appendChild(receiptLabel);
    const cancel=__f4.globals.document.createElement('button');cancel.type='button';
    cancel.className='f4-admin-deposit-cancel';
    cancel.innerHTML='<svg class="f4-admin-deposit-mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg><span class="f4-admin-deposit-action-label">Batalkan</span>';
    cancel.setAttribute('aria-label','Batalkan penjualan '+buyer);
    cancel.disabled=canceled;cancel.onclick=()=>v7CancelSale(r);
    cancel.title=canceled?'Penjualan sudah dibatalkan':
      confirmed?'Periksa penjualan sah sebelum dibatalkan':'Batalkan penjualan draft';
    actions.append(receipt,cancel);
    card.append(identity,summary,actions);
    return card;
  }
  const v18OldHistoryCard=v7HistoryCard;
  v7HistoryCard=function(r,type){
    if(type==='setoran')return v18DepositHistoryCard(r);
    if(type==='penjualan')return v18SaleHistoryCard(r);
    const card=v18OldHistoryCard(r,type);
    card.classList.add('f4-bs-history-row');
    return card;
  };
  loadRiwayatV7=async function(){
    const area=$('riwayatList');area.classList.add('f4-bs-history-list');area.textContent='Memuat riwayat setoran...';
    try{
      const rows=await call('bsV18RiwayatSetoranAdmin',token);
      // Gunakan ID anggota untuk mencari rumah, bukan nama depan yang bisa sama.
      const missing=rows.some(r=>!(0,__f4.globals.String)(r.rumahWarga||r.rumah||r.houseCode||r.nomorRumah||'').trim());
      if(missing){
        let members=__f4.globals.Array.isArray(v9Members)&&v9Members.length?v9Members:null;
        if(!members){
          try{members=await call('bsV9SaldoAdmin',token);}
          catch(e){__f4.globals.console.warn('Nomor rumah belum dapat dicocokkan:',e);}
        }
        if(__f4.globals.Array.isArray(members)){
          const memberKey=v=>(0,__f4.globals.String)(v??'').trim().replace(/^member:/i,'');
          const nameKey=v=>(0,__f4.globals.String)(v||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('id-ID');
          const byId=new __f4.globals.Map();
          const byFullName=new __f4.globals.Map();
          for(const m of members){
            const id=memberKey(m.wargaId);
            if(id)byId.set(id,m);
            const name=nameKey(m.nama);
            if(name)byFullName.set(name,byFullName.has(name)?null:m);
          }
          rows.forEach(r=>{
            if((0,__f4.globals.String)(r.rumahWarga||r.rumah||r.houseCode||r.nomorRumah||'').trim())return;
            const id=memberKey(r.wargaId||r.memberId||r.member_id);
            const member=(id?byId.get(id):null)||byFullName.get(nameKey(r.namaWarga));
            if(member&&(0,__f4.globals.String)(member.rumah||'').trim())r.rumahWarga=(0,__f4.globals.String)(member.rumah).trim();
          });
        }
      }
      area.replaceChildren(...rows.map(r=>v7HistoryCard(r,'setoran')));
      if(!rows.length)area.textContent='Belum ada setoran.';
    }catch(e){area.textContent='Gagal memuat riwayat: '+(e.message||e);}
  };
  function v18PreparePublic(){
    const pub=$('v11Public');if(!pub||$('v18PublicSide'))return;
    pub.classList.add('v18-public-shell');
    const head=pub.querySelector('.v17-public-head'),main=pub.querySelector('.v17-public-main');
    if(!head||!main)return;
    const side=__f4.globals.document.createElement('aside');side.id='v18PublicSide';side.setAttribute('aria-label','Menu portal publik');
    const logo=head.querySelector('.v17-public-logo');if(logo)side.appendChild(logo);
    const navLabel=__f4.globals.document.createElement('div');navLabel.className='f4-bank-public-nav-caption';
    navLabel.textContent='MENU';side.appendChild(navLabel);
    head.querySelector('.v17-public-links')?.remove();
    // Beranda already contains Program and Perkembangan; avoid duplicating their
    // destinations in the sidebar. Direct section URLs and hero CTA still work.
    const links=[['dashboard','Beranda','home',null],['setoran','Setoran','database','v17Transparansi'],['kegiatan','Kegiatan','image','v17Kegiatan'],['informasi','Informasi','leaf','v17Informasi']];
    links.forEach(([id,label,icon,target],i)=>{
      const b=__f4.globals.document.createElement('button');b.type='button';b.dataset.publicMenu=id;
      if(i===0)b.classList.add('active');b.setAttribute('aria-label',label);const labelNode=__f4.globals.document.createElement('span');labelNode.className='f4-bank-nav-label';labelNode.textContent=label;b.append(v16Icon(icon),labelNode);
      b.onclick=()=>{
        side.querySelectorAll('button').forEach(n=>n.classList.toggle('active',n===b));
        v18ClosePublic();
        if(target){if(target==='v17Informasi')$('f4PublicMoreInfo').open=true;$(target)?.scrollIntoView({behavior:'smooth',block:'start'});}
        else __f4.window.scrollTo({top:0,behavior:'smooth'});
      };side.appendChild(b);
    });
    const content=__f4.globals.document.createElement('div');content.id='v18PublicContent';
    pub.insertBefore(side,head);pub.insertBefore(content,head);content.append(head,main);
    const burger=__f4.globals.document.createElement('button');burger.id='v18PublicMenuButton';burger.type='button';burger.className='v18-hamburger';burger.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    burger.setAttribute('aria-label','Buka menu publik');burger.title='Buka menu samping';burger.onclick=v18TogglePublic;
    const title=__f4.globals.document.createElement('strong');title.id='v18PublicHeading';title.textContent='Bank Sampah Flamboyan 4';
    head.prepend(title);head.prepend(burger);
    const backdrop=__f4.globals.document.createElement('div');backdrop.id='v18PublicBackdrop';backdrop.onclick=v18ClosePublic;__f4.globals.document.body.appendChild(backdrop);
  }
  function v18TogglePublic(){const opened=$('v18PublicSide')?.classList.toggle('open');$('v18PublicBackdrop')?.classList.toggle('open',!!opened);}
  function v18ClosePublic(){$('v18PublicSide')?.classList.remove('open');$('v18PublicBackdrop')?.classList.remove('open');}
  v18AddEyes();v18PreparePrivate();v18PreparePublic();
  // v19 — menu publik tanpa bar atas; akun selalu di dasar sidebar.
  const v19OldShowPublic=v11ShowPublic,v19OldPublicAccount=v17PublicAccount;
  v11ShowPublic=function(){v19OldShowPublic();v19PreparePublic();};
  v17PublicAccount=function(){v19OldPublicAccount();v19SyncAccountFooter();};
  function v19SyncAccountFooter(){
    const label=$('v19PublicAccountText');if(!label)return;
    if(token&&profile){
      label.replaceChildren(__f4.globals.document.createTextNode(profile.nama||'Akun saya'));
      const small=__f4.globals.document.createElement('small');small.textContent='Kembali ke akun saya';label.appendChild(small);
    }else{
      label.replaceChildren(__f4.globals.document.createTextNode('Masuk akun'));
      const small=__f4.globals.document.createElement('small');small.textContent='Warga / Administrator';label.appendChild(small);
    }
  }
  function v19PreparePublic(){
    const pub=$('v11Public'),side=$('v18PublicSide'),content=$('v18PublicContent');
    if(!pub||!side||!content)return;
    const inv=$('v17Inventaris');if(inv){const heading=inv.querySelector('h2');if(heading)heading.textContent='Inventaris';}
    if(!$('v19PublicAccountFooter')){
      const footer=__f4.globals.document.createElement('div');footer.id='v19PublicAccountFooter';
      const avatar=$('v17PublicAccount');if(avatar){avatar.title=token&&profile?'Kembali ke akun saya':'Masuk akun';footer.appendChild(avatar);}
      const info=__f4.globals.document.createElement('div');info.id='v19PublicAccountText';footer.appendChild(info);
      footer.onclick=e=>{if(e.target.closest('button'))return;v18ClosePublic();v17PublicAccountClick();};
      footer.style.cursor='pointer';side.appendChild(footer);
    }
    // Header/akun atas versi sebelumnya dibuang sepenuhnya.
    content.querySelector('.v17-public-head')?.remove();
    if(!$('v19PublicFloatingMenu')){
      const button=__f4.globals.document.createElement('button');button.id='v19PublicFloatingMenu';button.type='button';
      button.className='v18-hamburger';button.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
      button.title='Buka menu samping';button.setAttribute('aria-label','Buka menu samping');
      button.onclick=v18TogglePublic;content.prepend(button);
    }
    v19SyncAccountFooter();
    v19SetupScrollSpy();
  }

  // Scroll spy publik: penanda menu mengikuti posisi halaman (seperti Portal Utama),
  // bukan hanya saat tombol menu diklik. Berfungsi pada scroll window atau kontainer.
  let v19ScrollSpyInstalled=false,v19ScrollSpyFrame=0;
  const v19PublicSections=[
    ['setoran','v17Transparansi'],
    ['kegiatan','v17Kegiatan'],
    ['informasi','v17Informasi']
  ];
  function v19ScheduleScrollSpy(){
    // Jangan jalankan pemantau menu publik selama pengelola melakukan scroll.
    const pub=$('v11Public');
    if(!pub||pub.classList.contains('hidden')||__f4.globals.document.body.classList.contains('v17-dashboard'))return;
    if(v19ScrollSpyFrame)return;
    v19ScrollSpyFrame=(0,__f4.globals.requestAnimationFrame)(()=>{
      v19ScrollSpyFrame=0;
      const pub=$('v11Public'),side=$('v18PublicSide');
      if(!pub||pub.classList.contains('hidden')||!side||__f4.globals.document.body.classList.contains('v17-dashboard'))return;
      // Pilih bagian terakhir yang sudah memasuki area baca di atas layar.
      // Ambang relatif membuatnya nyaman pada HP maupun PC dengan utility bar.
      const boundary=__f4.globals.Math.min(300,__f4.globals.Math.max(150,__f4.window.innerHeight*.34));
      let current='dashboard';
      for(const [id,target] of v19PublicSections){
        const section=$(target);
        if(section&&section.getBoundingClientRect().top<=boundary)current=id;
      }
      side.querySelectorAll('[data-public-menu]').forEach(button=>{
        const selected=button.dataset.publicMenu===current;
        button.classList.toggle('active',selected);
        if(selected)button.setAttribute('aria-current','location');
        else button.removeAttribute('aria-current');
      });
    });
  }
  function v19SetupScrollSpy(){
    if(!v19ScrollSpyInstalled){
      v19ScrollSpyInstalled=true;
      __f4.globals.document.addEventListener('scroll',v19ScheduleScrollSpy,true);
      __f4.window.addEventListener('scroll',v19ScheduleScrollSpy,{passive:true});
      __f4.window.addEventListener('resize',v19ScheduleScrollSpy,{passive:true});
      __f4.window.addEventListener('hashchange',v19ScheduleScrollSpy);
      // Konten publik tetap halaman yang sama; daftar dan media boleh berubah.
      $('v18PublicContent')?.addEventListener('scroll',v19ScheduleScrollSpy,{passive:true});
    }
    v19ScheduleScrollSpy();
  }
  v19PreparePublic();
  // v20 — satu folder Drive bisa berisi foto dan video bersama.
  function v20SetupMedia(){
    const select=$('v11MediaType'),url=$('v11MediaURL');if(!select||!url)return;
    if(![...select.options].some(o=>o.value==='Album Google Drive')){
      select.add(new __f4.globals.Option('Album Google Drive (foto + video)','Album Google Drive'));
      select.addEventListener('change',v20MediaTypeChange);
    }
    if(!$('v20MediaHint')){
      const hint=__f4.globals.document.createElement('p');hint.id='v20MediaHint';hint.className='hint';
      url.after(hint);
    }
    v20MediaTypeChange();
  }
  function v20MediaTypeChange(){
    const jenis=$('v11MediaType')?.value||'Foto';
    const label=__f4.globals.document.querySelector('label[for="v11MediaURL"]');
    const hint=$('v20MediaHint'),url=$('v11MediaURL');
    if(!url||!hint)return;
    if(jenis==='Album Google Drive'){
      if(label)label.textContent='Link folder Google Drive (berisi foto dan video)';
      url.placeholder='https://drive.google.com/drive/folders/ID_FOLDER';
      hint.textContent='Atur akses folder menjadi “Siapa saja yang memiliki link → Pelihat”. Warga membuka isi folder di Google Drive.';
    }else{
      if(label)label.textContent='Tautan '+(jenis==='Video'?'video':'foto')+' HTTPS';
      url.placeholder=jenis==='Video'?'https://youtu.be/...':'https://drive.google.com/file/d/...';
      hint.textContent='Satu tautan untuk satu '+(jenis==='Video'?'video':'foto')+'. Untuk banyak foto dan video, pilih Album Google Drive.';
    }
  }
  v20SetupMedia();
  // v21 — galeri publik langsung di website (tanpa menampilkan link folder Drive).
  let v21Albums=[],v21OpenedAlbum=null,v21MediaIndex=0;
  function v21Node(tag,cls,content){const el=__f4.globals.document.createElement(tag);if(cls)el.className=cls;if(content!==__f4.globals.undefined)el.textContent=content;return el;}
  function v21IconNode(tag,cls,icon){
    const element=v21Node(tag,cls);
    const paths={
      camera:'<path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="14" r="3"/>',
      box:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10"/>',
      play:'<path d="m8 5 11 7-11 7z"/>'
    };
    if(!paths[icon])throw (0,__f4.globals.Error)('Unknown Bank SVG icon');
    element.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[icon]+'</svg>';
    element.setAttribute('aria-hidden','true');return element;
  }
  function v21ImageSrc(url){
    if(!/^https:\/\//i.test(url||''))return '';
    const id=url.match(/drive\.google\.com\/file\/d\/([\w-]+)/i)||url.match(/[?&]id=([\w-]+)/i);
    return id?'https://drive.google.com/thumbnail?id='+id[1]+'&sz=w1200':url;
  }
  function v21Photo(url,alt){
    const img=__f4.globals.document.createElement('img');img.src=v21ImageSrc(url);img.alt=alt||'Foto dokumentasi';img.loading='lazy';
    img.addEventListener('error',()=>{if(img.parentNode){const fall=v21IconNode('div','v21-placeholder','camera');img.replaceWith(fall);}}, {once:true});return img;
  }
  function v21PrepareSections(){
    const docs=$('v17Dokumentasi'),inv=$('v17Inventaris');
    if(!docs||docs.dataset.f4PreviewReady==='1')return;
    docs.dataset.f4PreviewReady='1';
    docs.querySelector(':scope > .v17-subtle')?.remove();
    docs.querySelector(':scope > h2')?.remove();
    if(inv){
      inv.querySelector(':scope > .v17-subtle')?.remove();
      const ibar=v21Node('div','v21-section-bar');
      const ih=inv.querySelector(':scope > h2');
      if(ih)ibar.appendChild(ih);
      inv.prepend(ibar);
    }
    v21EnsureModals();
  }
  function v21PublicFeedPhotos(albums){
    const chosen=[];
    const sorted=[...(__f4.globals.Array.isArray(albums)?albums:[])].filter(a=>v23CategoryLabel(a.kategori)!=='Inventaris')
      .sort((a,b)=>(0,__f4.globals.String)(b.tanggal||'').localeCompare((0,__f4.globals.String)(a.tanggal||'')));
    for(const album of sorted){
      const media=__f4.globals.Array.isArray(album.media)?album.media:[];
      // Newest album first; last uploaded photo of each album first.
      for(let i=media.length-1;i>=0;i--){
        const item=media[i];
        const src=(0,__f4.globals.String)(item?.src||item?.url||item?.thumb||'').trim();
        const type=(0,__f4.globals.String)(item?.jenis||item?.type||'').toLowerCase();
        if(!/^https:\/\//i.test(src)||/video|youtube|folder/i.test(type))continue;
        chosen.push({album,item,src});
        if(chosen.length===6)return chosen;
      }
    }
    return chosen;
  }
  async function v21RenderAlbumCover(albums){
    v21PrepareSections();
    v21Albums=__f4.globals.Array.isArray(albums)?albums:[];
    v22RenderDocs();
    const area=$('v17Albums');if(!area)return;
    area.className='v17-photo-feed';area.replaceChildren();
    const recent=[...v21Albums].filter(a=>v23CategoryLabel(a.kategori)!=='Inventaris')
      .sort((a,b)=>(0,__f4.globals.String)(b.tanggal||'').localeCompare((0,__f4.globals.String)(a.tanggal||'')));
    for(const album of recent){
      if(v21PublicFeedPhotos(recent).length>=6)break;
      if(album.sourceFolder){
        try{
          const detail=await v21LegacyAlbum(album);
          if(__f4.globals.Array.isArray(detail.media)&&detail.media.length>(album.media?.length||0)){
            album.media=detail.media;
          }
        }catch(error){__f4.globals.console.warn('Foto album lama belum tersedia:',album.id,error)}
      }
    }
    // A published cover is used only if no photo is available for that album.
    for(const album of recent){
      if(v21PublicFeedPhotos(recent).length>=6)break;
      const hasPhoto=album.media?.some(m=>
        /^https:\/\//i.test((0,__f4.globals.String)(m.src||m.url||m.thumb||''))&&!/video/i.test((0,__f4.globals.String)(m.jenis||m.type||'')));
      if(!hasPhoto&&/^https:\/\//i.test(album.sampul||'')){
        album.media=[{jenis:'Foto',nama:album.judul||'Dokumentasi',src:album.sampul,thumb:album.sampul}];
      }
    }
    v22RenderDocs();
    const photos=v21PublicFeedPhotos(recent);
    if(!photos.length){area.textContent='Foto kegiatan belum tersedia.';return;}
    const galleryMedia=photos.map(({album,item,src})=>({
      id:(0,__f4.globals.String)(item.id||''),nama:item.nama||item.caption||album.judul||'Foto kegiatan',
      jenis:'Foto',src,thumb:item.thumb||src
    }));
    photos.forEach(({album,item,src},index)=>{
      const button=v21Node('button','v17-feed-photo');
      button.type='button';
      button.title=item.nama||item.caption||album.judul||'Lihat foto kegiatan';
      button.setAttribute('aria-label','Lihat foto '+(index+1)+' dari '+photos.length);
      button.appendChild(v21Photo(item.thumb||src,button.title));
      button.onclick=()=>{
        v21OpenedAlbum={judul:'Dokumentasi Bank Sampah',media:galleryMedia};
        v21EnsureModals();v21OpenLightbox(index);
      };
      area.appendChild(button);
    });
  }
  function v21InventoryRow(x){
    const row=v21Node('button','v21-inventory-row');row.type='button';
    if(x.foto)row.appendChild(v21Photo(x.foto,'Inventaris '+x.nama));
    else row.appendChild(v21IconNode('span','v21-inventory-placeholder','box'));
    row.append(v21Node('span','v21-inventory-name',x.nama||'Barang inventaris'),v21Node('span','v21-inventory-qty',x.jumlah||'—'));
    row.onclick=()=>v21ShowInventory(x);return row;
  }
  function v21NotifyOverlay(){
    const open=['v21GalleryModal','v21Lightbox'].some(id=>{
      const layer=$(id);return !!layer&&!layer.classList.contains('hidden');
    });
    // Do not let shell utility elements float above nested legacy modals.
    __f4.globals.document.documentElement.classList.toggle('f4-bank-gallery-open',open);
    __f4.globals.document.body.classList.toggle('f4-bank-gallery-open',open);
    if(__f4.window.parent!==window)__f4.window.parent.postMessage({type:'f4:overlay-state',portal:'bank-sampah',open},__f4.globals.location.origin);
  }
  function v21EnsureModals(){
    if($('v21GalleryModal'))return;
    const modal=v21Node('div','v21-modal hidden');modal.id='v21GalleryModal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    const card=v21Node('div','v21-modal-card');const head=v21Node('div','v21-modal-head');
    const meta=v21Node('div');meta.append(v21Node('h2','', 'Arsip Dokumentasi Kegiatan'),v21Node('p','', 'Pilih album kegiatan warga'));
    meta.id='v21GalleryMeta';const close=v21Node('button','v21-close');close.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6 18 18"/></svg>';close.type='button';close.title='Tutup galeri';close.setAttribute('aria-label','Tutup galeri');close.onclick=v21CloseGallery;
    head.append(meta,close);const body=v21Node('div','v21-modal-body');body.id='v21GalleryBody';card.append(head,body);modal.appendChild(card);__f4.globals.document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)v21CloseGallery();});
    const lightbox=v21Node('div','v21-modal v21-lightbox hidden');lightbox.id='v21Lightbox';
    lightbox.setAttribute('role','dialog');lightbox.setAttribute('aria-modal','true');
    lightbox.setAttribute('aria-label','Foto dan interaksi Bank Sampah');
    const shell=v21Node('div','v21-social-shell');
    const mediaPane=v21Node('div','v21-social-media-pane');
    const stage=v21Node('div','v21-stage');
    const prev=v21Node('button','v21-arrow is-prev'),next=v21Node('button','v21-arrow is-next');
    prev.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
    next.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
    prev.type=next.type='button';prev.title='Sebelumnya';next.title='Berikutnya';
    prev.setAttribute('aria-label','Foto sebelumnya');next.setAttribute('aria-label','Foto berikutnya');
    prev.onclick=()=>v21ShiftMedia(-1);next.onclick=()=>v21ShiftMedia(1);
    const scene=v21Node('div','v21-stage-content');scene.id='v21StageContent';stage.append(prev,scene,next);
    const mediaHead=v21Node('header','v21-media-head');
    const mediaTitle=v21Node('strong','','Dokumentasi');mediaTitle.id='v21MediaTitle';
    const mediaClose=v21Node('button','v21-media-close');mediaClose.type='button';mediaClose.title='Tutup foto/video';
    mediaClose.setAttribute('aria-label','Tutup foto dan video');
    mediaClose.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    mediaClose.onclick=v21CloseLightbox;
    const mediaActions=v21Node('div','v21-media-actions');
    const mediaZoom=v21Node('button','v21-media-zoom');mediaZoom.type='button';mediaZoom.id='v21MediaZoom';
    mediaZoom.title='Perbesar foto';mediaZoom.setAttribute('aria-label','Perbesar foto');mediaZoom.setAttribute('aria-pressed','false');
    mediaZoom.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7.5"/><path d="M16 16l5 5M7.5 10.5h6m-3-3v6"/></svg>';
    mediaZoom.onclick=()=>v21TogglePhotoZoom();
    mediaActions.append(mediaZoom,mediaClose);mediaHead.append(mediaTitle,mediaActions);
    const counter=v21Node('div','v21-gallery-count');counter.id='v21LightboxCount';
    mediaPane.append(mediaHead,stage,counter);
    let navTimer=0;
    const revealNavigation=()=>{stage.classList.add('is-navigation-visible');(0,__f4.globals.clearTimeout)(navTimer);navTimer=(0,__f4.globals.setTimeout)(()=>stage.classList.remove('is-navigation-visible'),2300)};
    stage.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')revealNavigation()},{passive:true});
    stage.addEventListener('pointerdown',revealNavigation,{passive:true});
    const panel=v21Node('aside','v21-social-panel');
    const socialHead=v21Node('header','v21-social-header');
    const identity=v21Node('div','v21-social-identity');
    const avatar=v21Node('img','v21-social-avatar');avatar.src='/assets/icons/bank.svg';avatar.alt='';
    const brand=v21Node('div','v21-social-brand');
    const socialTitle=v21Node('strong','','Dokumentasi');socialTitle.id='v21SocialAlbumName';
    brand.append(socialTitle,v21Node('small','','DOKUMENTASI BANK SAMPAH'));
    identity.append(avatar,brand);
    const socialClose=v21Node('button','v21-close v21-social-close');socialClose.type='button';
    socialClose.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    socialClose.title='Tutup foto';socialClose.setAttribute('aria-label','Tutup penampil foto');socialClose.onclick=v21CloseLightbox;
    socialHead.append(identity,socialClose);
    const comments=v21Node('div','v21-social-comments');comments.id='v21SocialComments';
    comments.setAttribute('aria-live','polite');
    const footer=v21Node('footer','v21-social-footer');
    const actions=v21Node('div','v21-social-actions');
    const like=v21Node('button','v21-social-like');like.id='v21SocialLike';like.type='button';
    like.setAttribute('aria-label','Sukai foto');
    like.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
    like.onclick=()=>v21SocialAction('react');
    const talk=v21Node('button','v21-social-talk');talk.type='button';talk.setAttribute('aria-label','Tulis komentar');
    talk.innerHTML='<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-4-.9L3 21l1.9-5.5a8.5 8.5 0 1 1 16.1-4Z"/></svg>';
    talk.onclick=()=>$('v21SocialInput')?.focus();
    const share=v21Node('button','v21-social-share');share.type='button';
    share.setAttribute('aria-label','Bagikan dokumentasi');share.title='Bagikan';
    share.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/></svg>';
    share.onclick=async()=>{
      const label=v21OpenedAlbum?.judul||'Dokumentasi Bank Sampah';
      const url=new __f4.globals.URL('/bank-sampah/',__f4.globals.location.origin);
      try{
        if(__f4.globals.navigator.share){await __f4.globals.navigator.share({title:label,url:url.href});return}
        if(__f4.globals.navigator.clipboard?.writeText){await __f4.globals.navigator.clipboard.writeText(url.href);$('v21SocialStatus').textContent='Tautan dokumentasi disalin.';return}
        __f4.window.prompt('Salin tautan dokumentasi',url.href);
      }catch(error){if(error?.name!=='AbortError')$('v21SocialStatus').textContent='Tautan belum dapat dibagikan.'}
    };
    actions.append(like,talk,share);
    const count=v21Node('div','v21-social-likes','Memuat suka...');count.id='v21SocialLikes';
    const status=v21Node('p','v21-social-status');status.id='v21SocialStatus';status.setAttribute('role','status');
    const form=v21Node('form','v21-social-form');form.id='v21SocialForm';
    const input=v21Node('input','v21-social-input');input.id='v21SocialInput';input.type='text';
    input.maxLength=500;input.autocomplete='off';input.placeholder='Tulis komentar...';input.setAttribute('aria-label','Tulis komentar');
    const send=v21Node('button','v21-social-send');send.type='submit';send.setAttribute('aria-label','Kirim komentar');
    send.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>';
    form.append(input,send);
    form.addEventListener('submit',event=>{event.preventDefault();v21SocialAction('comment');});
    footer.append(status,form);
    const commentTitle=v21Node('strong','v21-comment-heading','Komentar Warga');
    panel.append(socialHead,actions,count,commentTitle,comments,footer);
    shell.append(mediaPane,panel);lightbox.appendChild(shell);__f4.globals.document.body.appendChild(lightbox);
    // Click on the dark/empty backdrop to return to the album.
    lightbox.addEventListener('click',e=>{
      if(e.target===lightbox||e.target===stage||e.target===scene)v21CloseLightbox();
    });
    __f4.window.addEventListener('popstate',()=>{
      // A browser Back closes exactly one level; do not call history.back again
      // from inside popstate, or both photo and album can disappear together.
      if(!$('v21Lightbox')?.classList.contains('hidden')){v21CloseLightbox(true);return;}
      if(!$('v21GalleryModal')?.classList.contains('hidden')&&!__f4.globals.history.state?.f4BankAlbumOverlay)v21CloseGallery(true);
    });
    __f4.globals.document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){if(!$('v21Lightbox').classList.contains('hidden'))v21CloseLightbox();else v21CloseGallery();}
      if(!/^(INPUT|TEXTAREA)$/.test(__f4.globals.document.activeElement?.tagName||'')&&!$('v21Lightbox').classList.contains('hidden')){
        if(e.key==='ArrowRight')v21ShiftMedia(1);
        if(e.key==='ArrowLeft')v21ShiftMedia(-1);
      }
    });
  }
  function v21ShowModal(title,subtitle,body){
    v21EnsureModals();const meta=$('v21GalleryMeta');meta.replaceChildren(v21Node('h2','',title),v21Node('p','',subtitle||''));
    $('v21GalleryBody').replaceChildren(body);
    const modal=$('v21GalleryModal');
    if(modal.classList.contains('hidden')){
      // Overlay stays inside this iframe; no browser history entry or hash mutation.
      modal.classList.remove('hidden');
      v21NotifyOverlay();
    }
  }
  function v21CloseGallery(fromHistory=false){
    const modal=$('v21GalleryModal');
    if(!modal||modal.classList.contains('hidden'))return;
    if(!$('v21Lightbox')?.classList.contains('hidden')){v21CloseLightbox(fromHistory);return;}
    modal.classList.add('hidden');v21OpenedAlbum=null;v21NotifyOverlay();
  }
  function v21ShowAlbumArchive(){
    const grid=v21Node('div','v21-album-list');
    v21Albums.forEach(a=>{
      const btn=v21Node('button','v21-album-tile');btn.type='button';
      btn.appendChild(a.sampul?v21Photo(a.sampul,a.judul):v21IconNode('div','v21-placeholder','camera'));
      const info=v21Node('div','v21-album-label');info.append(v21Node('strong','',a.judul),v21Node('small','',a.tanggal||''));btn.appendChild(info);
      btn.onclick=()=>v21OpenAlbum(a.id);grid.appendChild(btn);
    });
    if(!v21Albums.length)grid.textContent='Belum ada album publik.';
    v21ShowModal('Arsip Dokumentasi Kegiatan','Pilih album untuk melihat foto dan video',grid);
  }
  // Media album menggunakan D1, dengan manifest terverifikasi untuk arsip Gorol.
  const v21DriveFolderCache=new __f4.globals.Map();
  function v21FolderId(url){
    return (0,__f4.globals.String)(url||'').match(/(?:\/folders\/|[?&]folderId=)([A-Za-z0-9_-]{12,})/)?.[1]||'';
  }
  function v21CleanAlbumDescription(text){
    return (0,__f4.globals.String)(text||'').replace(/(?:^|\n)\s*Tautan folder:\s*https?:\/\/[^\s]+/ig,'').trim();
  }
  function v21DriveMedia(rows){
    return (__f4.globals.Array.isArray(rows)?rows:[]).map((item,index)=>{
      const row=typeof item==='object'&&item!==null?item:{url:(0,__f4.globals.String)(item||'')};
      const raw=(0,__f4.globals.String)(row.url||row.link||row.src||row.downloadUrl||'');
      const id=(0,__f4.globals.String)(row.id||row.fileId||'')||raw.match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,})/)?.[1]||'';
      const name=(0,__f4.globals.String)(row.name||row.title||('Media '+(index+1)));
      const mime=(0,__f4.globals.String)(row.mime_type||row.mimeType||row.type||'').toLowerCase();
      const video=/video/.test(mime)||/\.(mp4|mov|mkv|avi|webm)(?:$|\?)/i.test(name);
      const url=/^https:\/\//i.test(raw)?raw:id?'https://drive.google.com/file/d/'+id+'/view':'';
      if(!url)return null;
      const thumb=id?'https://drive.google.com/thumbnail?id='+(0,__f4.globals.encodeURIComponent)(id)+'&sz=w1200':(!video?url:'');
      return {id:id||url,nama:name,jenis:video?'Video':'Foto',src:url,thumb};
    }).filter(__f4.globals.Boolean);
  }
  async function v21ReadDriveFolder(album){
    const id=v21FolderId(album.sourceFolder);
    if(!id)throw (0,__f4.globals.Error)('Folder album belum ditentukan.');
    if(v21DriveFolderCache.has(id))return v21DriveFolderCache.get(id);
    const load=(async()=>{
      let verified=[];
      if(id==='1ywp2v8rUH-oAGcM91PQyVrO7Wx9iLdCA'){
        try{
          const response=await (0,__f4.globals.fetch)('/assets/data/bank-gorol-20261011.json?v=20261026',{cache:'no-store'});
          if(response.ok){
            const manifest=await response.json();
            if(manifest.folderId===id)verified=v21DriveMedia(manifest.media.map(x=>({
              id:x.id,name:x.nama,type:x.jenis==='Video'?'video':'image',url:x.src
            })));
          }
        }catch(error){__f4.globals.console.warn('Cadangan metadata album tidak terbaca:',error)}
      }
      const sorted=items=>[...items].sort((a,b)=>(0,__f4.globals.String)(a.nama).localeCompare((0,__f4.globals.String)(b.nama),'id',{numeric:true}));
      // Manifest lokal untuk arsip terverifikasi; media lain dibaca dari D1.
      return sorted(verified);
    })();
    v21DriveFolderCache.set(id,load);
    try{return await load}catch(error){v21DriveFolderCache.delete(id);throw error}
  }
  async function v21LegacyAlbum(album){
    const base={judul:album.judul,tanggal:album.tanggal,
      deskripsi:v21CleanAlbumDescription(album.deskripsi),media:[],catatan:''};
    const fromDrive=await v21ReadDriveFolder(album);
    if(fromDrive.length)return {...base,media:fromDrive,catatan:''};
    // Public D1 linked media is a fallback when a folder listing isn't usable.
    try{
      const saved=await call('bsV21IsiAlbumPublik',album.id);
      const media=__f4.globals.Array.isArray(saved?.media)?saved.media:[];
      return {...base,media,catatan:media.length?'':'Foto dan video folder belum dapat dimuat. Periksa akses publik folder Drive.'};
    }catch{
      return {...base,catatan:'Foto dan video belum dapat dimuat. Periksa akses publik folder Drive.'};
    }
  }
  async function v21OpenAlbum(id){
    const a=v21Albums.find(x=>x.id===id);if(!a)return;
    v21ShowModal(a.judul,a.tanggal+' • '+(a.deskripsi||''),v21Node('p','','Memuat foto dan video...'));
    try{
      const data=a.sourceFolder?await v21LegacyAlbum(a):await call('bsV21IsiAlbumPublik',id);if($('v21GalleryModal').classList.contains('hidden'))return;
      v21OpenedAlbum=data;const wrap=v21Node('div');const back=v21Node('button','v21-back');back.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';back.type='button';back.title='Kembali ke semua album';back.setAttribute('aria-label','Kembali ke semua album');back.onclick=v21ShowAlbumArchive;wrap.appendChild(back);
      const grid=v21Node('div','v21-gallery-grid');(data.media||[]).forEach((m,i)=>{
        const tile=v21Node('button','v21-gallery-tile');tile.type='button';tile.title=m.nama||m.jenis;
        if(m.thumb)tile.appendChild(v21Photo(m.thumb,m.nama));else tile.appendChild(v21IconNode('span','v21-play','play'));
        if(m.jenis==='Video')tile.appendChild(v21IconNode('span','v21-play','play'));
        tile.onclick=()=>v21OpenLightbox(i);grid.appendChild(tile);
      });
      if(!grid.childElementCount)grid.textContent=data.catatan||'Album belum memiliki foto/video yang dapat ditampilkan.';
      wrap.appendChild(grid);if(data.catatan)wrap.appendChild(v21Node('p','v17-subtle',data.catatan));
      // Album is presented as native gallery; do not expose raw Drive URL.
      v21ShowModal(data.judul,data.tanggal+' • '+(data.deskripsi||''),wrap);
    }catch(e){v21ShowModal(a.judul,'',v21Node('p','', 'Galeri belum dapat dimuat: '+(e.message||e)));}
  }
  // Reuse the verified portal gallery social API; no browser-only likes.
  let v21SocialSerial=0;
  const v21SocialPhotoId=media=>{
    const id=(0,__f4.globals.String)(media?.id||'').trim();
    if(/^(?:f4photo:|gdrive:)[-\w:]{3,180}$/.test(id))return id;
    if(/^[A-Za-z0-9_-]{12,110}$/.test(id))return 'gdrive:'+id;
    const src=(0,__f4.globals.String)(media?.src||media?.url||'');
    const match=src.match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{12,110})/i);
    if(match)return 'gdrive:'+match[1];
    return /^media:[-\w:]{3,180}$/.test(id)?id:'';
  };
  async function v21SocialRequest(path,payload){
    const response=await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id'+path,{
      method:payload?'POST':'GET',credentials:'include',mode:'cors',cache:'no-store',
      ...(payload?{headers:{'Content-Type':'application/json'},body:__f4.globals.JSON.stringify(payload)}:{})
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok||data.ok===false){
      const error=new __f4.globals.Error(data.error||'Layanan interaksi belum tersedia.');
      error.status=response.status;throw error;
    }
    return data;
  }
  async function v21LoadSocial(){
    const panel=$('v21SocialComments'),like=$('v21SocialLike');
    const count=$('v21SocialLikes'),status=$('v21SocialStatus'),input=$('v21SocialInput');
    const send=$('v21SocialForm')?.querySelector('button[type="submit"]');
    if(!panel||!like||!count||!status||!input||!send)return;
    const id=v21SocialPhotoId(v21OpenedAlbum?.media?.[v21MediaIndex]);
    const serial=++v21SocialSerial;
    if(input.dataset.mediaId!==id){input.value='';input.dataset.mediaId=id;}
    panel.dataset.mediaId=id;panel.replaceChildren();
    like.classList.remove('is-liked');like.setAttribute('aria-pressed','false');
    count.textContent='';status.textContent='';
    like.disabled=!id;input.disabled=!id;send.disabled=!id;
    if(!id){panel.textContent='Interaksi foto ini belum tersedia.';return;}
    panel.textContent='Memuat komentar...';
    try{
      const data=await v21SocialRequest('/api/v2/gallery/social?type=photo&id='+(0,__f4.globals.encodeURIComponent)(id));
      if(serial!==v21SocialSerial||panel.dataset.mediaId!==id)return;
      const liked=(0,__f4.globals.Boolean)(data.liked);
      like.classList.toggle('is-liked',liked);like.setAttribute('aria-pressed',(0,__f4.globals.String)(liked));
      like.setAttribute('aria-label',liked?'Batal sukai foto':'Sukai foto');
      count.textContent=((0,__f4.globals.Number)(data.likes)||0)+' suka';
      panel.replaceChildren();
      const comments=__f4.globals.Array.isArray(data.comments)?data.comments:[];
      if(!comments.length)panel.appendChild(v21Node('p','v21-social-empty','Belum ada komentar. Jadilah yang pertama.'));
      comments.forEach(item=>{
        const row=v21Node('div','v21-social-comment');
        row.append(v21Node('strong','',item.author||'Warga'),v21Node('p','',item.message||''),
          v21Node('small','',(0,__f4.globals.String)(item.date||'').slice(0,10)));
        panel.appendChild(row);
      });
    }catch(error){
      if(serial!==v21SocialSerial)return;
      panel.textContent=error.status===404?'Interaksi foto ini belum tersedia.':'Komentar belum dapat dimuat.';
      status.textContent=error.status===404?'Foto masih bisa dilihat, tetapi fitur interaksi belum tersedia di server.':'';
      like.disabled=true;input.disabled=true;send.disabled=true;
    }
  }
  async function v21SocialAction(kind){
    const panel=$('v21SocialComments'),id=panel?.dataset.mediaId;
    const like=$('v21SocialLike'),input=$('v21SocialInput');
    const send=$('v21SocialForm')?.querySelector('button[type="submit"]');
    const status=$('v21SocialStatus');
    if(!id||!input||!status)return;
    const message=input.value.trim();
    if(kind==='comment'&&!message)return;
    const serial=v21SocialSerial;
    if(like)like.disabled=true;if(send)send.disabled=true;
    status.textContent='';
    try{
      await v21SocialRequest('/api/v2/gallery/'+(kind==='react'?'react':'comment'),{
        type:'photo',id,...(kind==='comment'?{message}:{})
      });
      if(serial!==v21SocialSerial)return;
      if(kind==='comment')input.value='';
      await v21LoadSocial();
    }catch(error){
      if(serial===v21SocialSerial){
        status.textContent=error.status===401?'Masuk dengan akun warga untuk memberi suka atau komentar.':error.message;
      }
    }finally{
      if(serial===v21SocialSerial){
        if(like)like.disabled=false;if(send)send.disabled=false;
      }
    }
  }
  function v21OpenLightbox(index){
    if(!v21OpenedAlbum?.media?.length)return;
    v21MediaIndex=index;
    if(!$('v21Lightbox').classList.contains('hidden'))return;
    $('v21Lightbox').classList.remove('hidden');v21PaintLightbox();v21NotifyOverlay();
  }
  // One video renderer shared by the public, member and manager documentation.
  // Six public archived Drive MP4s use the tested Cloudflare byte-range proxy.
  const v21PublicMP4Ids=new __f4.globals.Set([
    '1xfukAMXTvLEIdGejCdHN8R4OgHvgZKJR','1aFCJdelBT3KJmvVkJsZN48ZwXO1cXECZ',
    '1-tjDEoNoBbS57S5f_S8lveQeq8lhW8xl','1z_OvFon4dQ_CD8ucIvfR22ZZZp0rYYr9',
    '1GYWfE40Vc58XT1PLrYIOj6vvQZOZ72xp','1g0sdII2uOPhwdFvNeCHkmpclbUuOCbTS'
  ]);
  function v21VideoSource(media){
    const raw=(0,__f4.globals.String)(media.src||media.url||'');
    const fileId=(0,__f4.globals.String)(media.id||'').replace(/^gdrive:/,'');
    const matched=raw.match(/(?:\/file\/d\/|\/gallery\/(?:public-video|video)\/|[?&]id=)([A-Za-z0-9_-]{12,110})/i);
    const id=/^[A-Za-z0-9_-]{12,110}$/.test(fileId)?fileId:matched?.[1]||'';
    const youtube=raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/i)?.[1]||'';
    const proxyId=v21PublicMP4Ids.has(id)?id:'';
    const src=proxyId?'https://api.flamboyan4.web.id/api/v2/gallery/public-video/'+(0,__f4.globals.encodeURIComponent)(proxyId):
       /^https:\/\/.+\.(?:mp4|webm|ogg|mov)(?:[?#]|$)/i.test(raw)?raw:
       id?'https://drive.usercontent.google.com/download?id='+(0,__f4.globals.encodeURIComponent)(id)+'&export=download&confirm=t':'';
    const poster=/^https:\/\//i.test(media.thumb||'')?media.thumb:
       id?'https://drive.google.com/thumbnail?id='+(0,__f4.globals.encodeURIComponent)(id)+'&sz=w1200':'';
    return {src,poster,youtube,raw};
  }
  const v21VideoClock=value=>__f4.globals.Number.isFinite(value)&&value>=0?
    __f4.globals.Math.floor(value/60)+':'+(0,__f4.globals.String)(__f4.globals.Math.floor(value%60)).padStart(2,'0'):'0:00';
  function v21VideoIcon(name){
    const icons={
      play:'<path d="m8 5 11 7-11 7V5z"/>',
      pause:'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
      volume:'<path d="M11 5 6 9H3v6h3l5 4zM15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/>',
      muted:'<path d="M11 5 6 9H3v6h3l5 4zM16 9l5 6m0-6-5 6"/>',
      full:'<path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m13-5v4a1 1 0 0 1-1 1h-4"/>'
    };
    return '<svg viewBox="0 0 24 24" width="20" height="20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
  }
  function v21CreateVideoPlayer(media,source){
    const shell=v21Node('div','v21-video-shell'),video=v21Node('video');
    video.src=source.src;video.preload='metadata';video.playsInline=true;
    video.setAttribute('playsinline','');video.controls=false;
    if(source.poster)video.poster=source.poster;
    video.setAttribute('aria-label','Video '+(v21OpenedAlbum?.judul||'kegiatan'));
    const center=v21Node('button','v21-video-big-play');center.type='button';center.innerHTML=v21VideoIcon('play');
    center.setAttribute('aria-label','Putar video');
    const controls=v21Node('div','v21-video-controls');
    const toggle=v21Node('button');toggle.type='button';toggle.innerHTML=v21VideoIcon('play');toggle.setAttribute('aria-label','Putar video');
    const progress=v21Node('input','v21-video-progress');progress.type='range';progress.min='0';progress.max='1000';
    progress.step='1';progress.value='0';progress.setAttribute('aria-label','Posisi pemutaran video');
    const time=v21Node('output','v21-video-time','0:00 / 0:00');
    const mute=v21Node('button');mute.type='button';mute.innerHTML=v21VideoIcon('volume');mute.setAttribute('aria-label','Bisukan suara');
    const full=v21Node('button');full.type='button';full.innerHTML=v21VideoIcon('full');full.setAttribute('aria-label','Layar penuh');
    controls.append(toggle,progress,time,mute,full);shell.append(video,center,controls);
    let timer=0;
    const showControls=()=>{
      shell.classList.add('is-controls-visible');(0,__f4.globals.clearTimeout)(timer);
      if(!video.paused)timer=(0,__f4.globals.setTimeout)(()=>shell.classList.remove('is-controls-visible'),3200);
    };
    const update=()=>{
      const duration=__f4.globals.Number.isFinite(video.duration)?video.duration:0;
      progress.value=duration?(0,__f4.globals.String)(__f4.globals.Math.round(video.currentTime/duration*1000)):'0';
      progress.disabled=!duration;
      time.textContent=v21VideoClock(video.currentTime)+' / '+v21VideoClock(duration);
      const playing=!video.paused&&!video.ended;
      toggle.innerHTML=v21VideoIcon(playing?'pause':'play');
      toggle.setAttribute('aria-label',playing?'Jeda video':'Putar video');
      center.hidden=playing;
      shell.classList.toggle('v21-video-playing',playing);
      mute.innerHTML=v21VideoIcon(video.muted?'muted':'volume');
      mute.setAttribute('aria-label',video.muted?'Aktifkan suara':'Bisukan suara');
      if(!playing)showControls();
    };
    const play=()=>{
      if(video.paused||video.ended){
        if(video.ended)video.currentTime=0;
        video.play().catch(showControls);
      }else video.pause();
      showControls();
    };
    center.onclick=toggle.onclick=play;
    video.addEventListener('click',showControls);
    progress.addEventListener('input',()=>{if(__f4.globals.Number.isFinite(video.duration)&&video.duration>0)video.currentTime=video.duration*(0,__f4.globals.Number)(progress.value)/1000;showControls()});
    mute.onclick=()=>{video.muted=!video.muted;update();showControls()};
    full.onclick=()=>{
      if(__f4.globals.document.fullscreenElement){__f4.globals.document.exitFullscreen?.();return}
      if(shell.requestFullscreen)shell.requestFullscreen().catch(()=>{});
      else video.webkitEnterFullscreen?.();
    };
    shell.addEventListener('pointermove',showControls);
    shell.addEventListener('touchstart',showControls,{passive:true});
    for(const event of ['timeupdate','durationchange','loadedmetadata','play','pause','ended','volumechange'])
      video.addEventListener(event,update);
    video.addEventListener('error',()=>{
      if(shell.isConnected){
        (0,__f4.globals.clearTimeout)(timer);
        shell.replaceChildren(v21Node('p','v21-video-error','Video belum dapat diputar.'));
      }
    });
    update();return shell;
  }
  function v21TogglePhotoZoom(){
    const image=$('v21StageContent')?.querySelector('img');
    if(!image)return;
    const zoomed=image.dataset.zoomed==='true';
    image.dataset.zoomed=zoomed?'false':'true';
    image.style.transform=zoomed?'':'scale(2)';
    image.style.cursor=zoomed?'zoom-in':'zoom-out';
    const button=$('v21MediaZoom');if(button){
      button.setAttribute('aria-pressed',(0,__f4.globals.String)(!zoomed));
      button.setAttribute('aria-label',zoomed?'Perbesar foto':'Kembalikan ukuran foto');
      button.title=zoomed?'Perbesar foto':'Kembalikan ukuran foto';
    }
  }
  function v21PaintLightbox(){
    const list=v21OpenedAlbum?.media||[],m=list[v21MediaIndex];if(!m)return;
    const scene=$('v21StageContent');
    scene.querySelector('video')?.pause();
    scene.replaceChildren();
    if($('v21MediaTitle'))$('v21MediaTitle').textContent=v21OpenedAlbum?.judul||'Dokumentasi';
    if($('v21SocialAlbumName'))$('v21SocialAlbumName').textContent=v21OpenedAlbum?.judul||'Dokumentasi';
    const zoom=$('v21MediaZoom');if(zoom){
      zoom.hidden=m.jenis==='Video';zoom.setAttribute('aria-pressed','false');
      zoom.setAttribute('aria-label','Perbesar foto');zoom.title='Perbesar foto';
    }
    if(m.jenis==='Video'){
      const source=v21VideoSource(m);
      if(source.src)scene.append(v21CreateVideoPlayer(m,source));
      else if(source.youtube){
        const frame=__f4.globals.document.createElement('iframe');
        frame.src='https://www.youtube-nocookie.com/embed/'+(0,__f4.globals.encodeURIComponent)(source.youtube);
        frame.title='Video kegiatan';frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;
        scene.append(frame);
      }else scene.append(v21Node('p','v21-video-error','Video ini belum tersedia.'));
    }else{
      const img=v21Photo(m.src||m.url,'Foto kegiatan Bank Sampah');
      img.loading='eager';
      img.addEventListener('dblclick',v21TogglePhotoZoom);
      img.style.cursor='zoom-in';scene.append(img);
    }
    $('v21LightboxCount').textContent=(v21MediaIndex+1)+' / '+list.length;
    const arrows=$('v21Lightbox')?.querySelectorAll('.v21-arrow')||[];
    arrows.forEach(button=>{button.hidden=list.length<2});
    v21LoadSocial();
  }
  function v21ShiftMedia(delta){
    const list=v21OpenedAlbum?.media||[];if(!list.length)return;
    v21MediaIndex=(v21MediaIndex+delta+list.length)%list.length;v21PaintLightbox();
  }
  function v21CloseLightbox(fromHistory=false){
    const modal=$('v21Lightbox');if(!modal||modal.classList.contains('hidden'))return;
    modal.classList.add('hidden');v21SocialSerial++;$('v21StageContent')?.querySelector('video')?.pause();$('v21StageContent')?.replaceChildren();v21NotifyOverlay();
  }
  function v21ShowInventory(item){
    const view=v21Node('div');
    if(item.foto){const img=v21Photo(item.foto,item.nama);img.style.cssText='display:block;max-width:100%;max-height:60vh;object-fit:contain;margin:0 auto 13px;border-radius:12px';view.appendChild(img);}
    view.append(v21Node('h3','',item.nama||'Inventaris'),v21Node('p','',[(item.jumlah||'—'),item.kategori,item.kondisi].filter(__f4.globals.Boolean).join(' • ')));
    v21ShowModal('Detail Inventaris','Perlengkapan Bank Sampah Flamboyan 4',view);
  }
  v21PrepareSections();
  // v22 — halaman dokumentasi kategori, tanpa tombol galeri pada kartu preview.
  const v22Categories=['Semua','Kerja Bakti','Penimbangan','Arisan','Acara','Lainnya','Inventaris'];
  let v22Query='';
  // Label baru tanpa migrasi data lama: spreadsheet tetap menyimpan "Umum".
  function v23CategoryLabel(raw){return !raw||raw==='Umum'?'Lainnya':raw;}
  function v23CategoryValue(label){return label==='Lainnya'?'Umum':label;}
  function v22SetupAdmin(){
    if($('v22AlbumCategory'))return;
    const title=$('v11AlbumTitle');if(!title)return;
    const field=v21Node('div','field');
    const label=v21Node('label','','Kategori dokumentasi');label.htmlFor='v22AlbumCategory';
    const select=__f4.globals.document.createElement('select');select.id='v22AlbumCategory';
    v22Categories.slice(1).forEach(c=>select.add(new __f4.globals.Option(c,v23CategoryValue(c))));
    field.append(label,select);title.closest('.field')?.after(field);
    const form=title.closest('form');if(form){const editor=__f4.globals.document.createElement('details');editor.id='v22OldAlbumEditor';
      const summary=v21Node('summary','','Atur kategori album yang sudah ada');
      const body=v21Node('div');body.id='v22OldAlbumList';body.textContent='Buka menu Dokumentasi untuk memuat daftar album.';
      editor.append(summary,body);form.after(editor);}
  }
  function v22RenderAlbumAdmin(rows){
    v22SetupAdmin();const area=$('v22OldAlbumList');if(!area)return;area.replaceChildren();
    rows.forEach(a=>{
      const row=v21Node('div','v22-edit-row');row.appendChild(v21Node('span','',a.judul+' ('+a.id+')'));
      const select=__f4.globals.document.createElement('select');select.setAttribute('aria-label','Kategori '+a.judul);
      v22Categories.slice(1).forEach(c=>select.add(new __f4.globals.Option(c,v23CategoryValue(c))));
      select.value=a.kategori&&v22Categories.includes(v23CategoryLabel(a.kategori))?a.kategori:'Umum';
      select.onchange=async()=>{
        const value=select.value;select.disabled=true;
        try{await call('bsV22SetKategoriAlbum',token,a.id,value);note('v11AlbumNotice','Kategori album '+a.judul+' diperbarui.');}
        catch(e){note('v11AlbumNotice','Gagal mengatur kategori: '+(e.message||e),true);select.value=a.kategori||'Umum';}
        finally{select.disabled=false;}
      };row.appendChild(select);area.appendChild(row);
    });
    if(!rows.length)area.textContent='Belum ada album.';
  }
  function v22SetupDocs(){
    const main=$('v11Public')?.querySelector('.v17-public-main');if(!main||$('v22DocsPage'))return;
    const page=v21Node('section','hidden');page.id='v22DocsPage';
    const heading=v21Node('div','v22-doc-heading');const title=v21Node('div');
    title.append(v21Node('h1','','Dokumentasi'));
    const back=v21Node('button','v22-back-home','Beranda');back.type='button';
    back.insertAdjacentHTML('afterbegin','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7M5 12h14"/></svg>');back.onclick=v22BackHome;
    heading.append(title,back);
    const count=v21Node('p','v17-subtle');count.id='v22DocCount';
    const search=__f4.globals.document.createElement('input');search.id='v22DocSearch';search.className='v22-search';search.type='search';search.placeholder='Cari album kegiatan...';
    search.setAttribute('aria-label','Cari album');search.oninput=()=>{v22Query=search.value.trim().toLowerCase();v22RenderDocs();};
    const list=v21Node('div','v22-doc-list');list.id='v22DocList';
    const tools=v21Node('div','v22-doc-tools');tools.append(count,search);
    page.append(heading,tools,list);main.appendChild(page);
    const side=$('v18PublicSide');side?.querySelectorAll('button[data-public-menu]').forEach(btn=>{
      const old=btn.onclick;
      if(btn.dataset.publicMenu==='docs')btn.onclick=()=>{side.querySelectorAll('button').forEach(n=>n.classList.toggle('active',n===btn));v18ClosePublic();v22OpenDocs();};
      else btn.onclick=()=>{v22BackHome(false);if(old)old();};
    });
    v22RenderDocs();
  }
  function v22OpenDocs(){
    v22SetupDocs();const page=$('v22DocsPage'),main=page?.parentElement;if(!page||!main)return;
    v21CloseGallery();main.classList.add('v22-show-docs');page.classList.remove('hidden');
    v22RenderDocs();__f4.window.scrollTo({top:0,behavior:'smooth'});
  }
  function v22BackHome(scroll=true){
    const page=$('v22DocsPage');if(!page)return;
    page.classList.add('hidden');page.parentElement.classList.remove('v22-show-docs');
    if(scroll)__f4.window.scrollTo({top:0,behavior:'smooth'});
  }
  // One shared three-column photo feed for public, member and manager documentation.
  // The same album objects, search and social lightbox serve every role.
  function v22AlbumMedia(album){
    return (__f4.globals.Array.isArray(album.media)?album.media:[]).map(media=>{
      const src=(0,__f4.globals.String)(media?.src||media?.url||'').trim();
      const kind=(0,__f4.globals.String)(media?.jenis||media?.type||'foto').toLowerCase();
      if(!/^https:\/\//i.test(src)||/folder|tautan_album|album google drive|external_link/.test(kind)||/\/folders\//i.test(src))return null;
      const isVideo=/video|youtube/.test(kind);
      const rawThumb=(0,__f4.globals.String)(media?.thumb||'').trim();
      const explicitId=(0,__f4.globals.String)(media?.id||'').replace(/^gdrive:/,'');
      const driveMatch=src.match(/(?:\/file\/d\/|\/gallery\/video\/|[?&]id=)([A-Za-z0-9_-]{12,110})/i);
      const driveId=/^[A-Za-z0-9_-]{12,110}$/.test(explicitId)?explicitId:driveMatch?.[1]||'';
      const youtubeId=src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})(?:[?&#/]|$)/i)?.[1]||'';
      const thumb=isVideo
        ?(/^https:\/\//i.test(rawThumb)&&!/\.(mp4|mov|webm)(?:[?#]|$)/i.test(rawThumb)
          ?rawThumb:driveId?'https://drive.google.com/thumbnail?id='+(0,__f4.globals.encodeURIComponent)(driveId)+'&sz=w1200'
          :youtubeId?'https://img.youtube.com/vi/'+(0,__f4.globals.encodeURIComponent)(youtubeId)+'/hqdefault.jpg':'')
        :(/^https:\/\//i.test(rawThumb)?rawThumb:src);
      return {id:(0,__f4.globals.String)(media?.id||''),nama:(0,__f4.globals.String)(media?.caption||media?.nama||''),
        jenis:isVideo?'Video':'Foto',src,thumb};
    }).filter(__f4.globals.Boolean);
  }
  function v22OpenFeedMedia(album,mediaIndex){
    const media=v22AlbumMedia(album);
    if(!media.length){v21OpenAlbum(album.id);return;}
    v21OpenedAlbum={judul:album.judul||'Dokumentasi',tanggal:album.tanggal||'',media};
    v21EnsureModals();v21OpenLightbox(mediaIndex);
  }
  function v22RenderDocs(){
    const list=$('v22DocList');if(!list)return;
    const albums=v21Albums.filter(album=>
      v23CategoryLabel(album.kategori)!=='Inventaris'&&
      (!v22Query||[album.judul,album.deskripsi,album.kategori,
        ...(album.media||[]).map(media=>media.caption||media.nama||'')]
        .join(' ').toLowerCase().includes(v22Query)))
      .slice().sort((a,b)=>(0,__f4.globals.String)(b.tanggal||'').localeCompare((0,__f4.globals.String)(a.tanggal||'')));
    const count=$('v22DocCount');
    const hasAlbums=v21Albums.some(album=>v23CategoryLabel(album.kategori)!=='Inventaris');
    const search=$('v22DocSearch');if(search)search.hidden=!hasAlbums;
    list.replaceChildren();
    let photos=0;
    for(const album of albums){
      const items=v22AlbumMedia(album);
      if(!items.length){
        if(!/^https:\/\//i.test((0,__f4.globals.String)(album.sampul||'')))continue;
        const tile=v21Node('button','v22-doc-card v22-photo-tile');
        tile.type='button';tile.setAttribute('aria-label','Buka album '+(album.judul||'Dokumentasi'));
        tile.appendChild(v21Photo(album.sampul,'Sampul dokumentasi'));
        const meta=v21Node('span','v22-doc-card-info');
        meta.append(v21Node('strong','',album.judul||'Dokumentasi'),
          v21Node('small','',v23CategoryLabel(album.kategori)));
        tile.append(meta);tile.onclick=()=>v21OpenAlbum(album.id);
        list.append(tile);photos++;continue;
      }
      // Display photos, not a single album cover; latest photos first.
      for(let index=items.length-1;index>=0;index--){
        const media=items[index];
        const tile=v21Node('button','v22-doc-card v22-photo-tile');
        tile.type='button';
        tile.setAttribute('aria-label','Lihat '+(media.jenis==='Video'?'video':'foto')+' dari album '+(album.judul||'Dokumentasi'));
        if(/^https:\/\//i.test(media.thumb)){
          const img=v21Photo(media.thumb,media.jenis==='Video'?'Cuplikan video kegiatan':'Dokumentasi kegiatan');
          img.loading='lazy';tile.append(img);
        }else if(media.jenis==='Video'&&/^https:\/\//i.test(media.src)&&/\.(mp4|webm|mov)(?:[?#]|$)/i.test(media.src)){
          const preview=__f4.globals.document.createElement('video');preview.src=media.src.split('#')[0]+'#t=0.1';
          preview.preload='metadata';preview.muted=true;preview.playsInline=true;
          preview.setAttribute('muted','');preview.setAttribute('playsinline','');
          preview.setAttribute('aria-hidden','true');tile.append(preview);
        }else{
          tile.append(v21IconNode('div','v21-placeholder','camera'));
        }
        if(media.jenis==='Video')tile.classList.add('is-video');
        const meta=v21Node('span','v22-doc-card-info');
        meta.append(v21Node('strong','',album.judul||'Dokumentasi'),
          v21Node('small','',v23CategoryLabel(album.kategori)));
        tile.append(meta);
        if(media.jenis==='Video')tile.append(v21IconNode('span','v22-photo-play','play'));
        tile.onclick=()=>v22OpenFeedMedia(album,index);
        list.append(tile);photos++;
      }
    }
    if(count){count.textContent=photos+' foto/video · '+albums.length+' album';count.hidden=!photos;}
    if(!photos){
      const empty=v21Node('p','v22-doc-empty',!v21Albums.length?
        'Belum ada dokumentasi Bank Sampah.':'Belum ada foto yang cocok.');
      list.append(empty);
    }
  }
  // “Semua album” pada penampil kini kembali ke halaman kategori, bukan popup kedua.
  v21ShowAlbumArchive=v22OpenDocs;
  // Member screen reuses the existing public album directory and its D1-backed filters.
  __f4.window.f4BankRenderDocumentation=()=>{v22SetupDocs();v22RenderDocs();};
  v22SetupAdmin();v22SetupDocs();
  // v23 — pencarian akun berdasarkan nama atau nomor rumah, tanda baca diabaikan.
  function v23NormalizeSearch(value){return (0,__f4.globals.String)(value||'').toLocaleLowerCase('id-ID').replace(/[^a-z0-9]/g,'');}
  function v23RenderAccounts(){
    const target=$('v23AccountRows'),count=$('v23AccountCount'),search=$('v23AccountSearch');if(!target)return;
    const keyword=v23NormalizeSearch(search?.value),rows=(accounts||[]).filter(a=>
      !keyword||[a.nama,a.rumah,a.username].some(x=>v23NormalizeSearch(x).includes(keyword)));
    target.replaceChildren();
    count.textContent=keyword?rows.length+' / '+(accounts||[]).length:rows.length+' anggota';
    const desktop=__f4.window.matchMedia('(min-width:1024px)').matches;
    rows.forEach(a=>{
      const row=v21Node(desktop?'div':'details','v23-account-row'+(desktop?' v23-account-row-desktop':''));
      row.dataset.active=(0,__f4.globals.String)(a.status==='Aktif');
      const summary=v21Node(desktop?'div':'summary','v23-account-summary');
      const avatar=f4BankPersonAvatar(a.nama,{className:'v23-account-avatar',
        memberId:a.wargaId,hasAvatar:a.hasAvatar===true||a.hasAvatar===1||a.hasAvatar==='1'});
      const identity=v21Node('span','v23-account-identity');
      const name=v21Node('strong','',a.nama||'Tanpa nama');
      const placement=(0,__f4.globals.Number)(a.activityRank);
      if([1,2,3].includes(placement)){
        const crown=v21Node('span','f4-bank-activity-crown is-compact is-rank-'+placement);
        crown.setAttribute('aria-label','Peringkat '+placement+' warga teraktif');
        crown.title='Peringkat '+placement+' warga teraktif · seluruh periode';
        const icon=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
        icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('fill','none');
        icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.9');
        icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');
        icon.setAttribute('aria-hidden','true');
        icon.innerHTML='<path d="M2.5 7.5 6.5 11l5.5-7 5.5 7 4-3.5-2.4 11h-14z"/><path d="M6 21h12"/>';
        crown.append(icon,v21Node('b','',(0,__f4.globals.String)(placement)));
        name.append(__f4.globals.document.createTextNode(' '),crown);
      }
      identity.append(name,v21Node('small','',a.rumah||'Rumah belum tercatat'));
      identity.title=(0,__f4.globals.String)(a.nama||'Tanpa nama');
      const state=v21Node('span','v23-account-state',a.status||'—');
      const arrow=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
      arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('fill','none');arrow.setAttribute('stroke-width','2');
      arrow.setAttribute('stroke-linecap','round');arrow.setAttribute('aria-hidden','true');arrow.classList.add('v23-account-chevron');
      arrow.innerHTML='<path d="m9 5 7 7-7 7"/>';
      summary.append(avatar,identity,state);
      if(!desktop)summary.append(arrow);
      const detail=v21Node('div','v23-account-detail');
      const meta=v21Node('div','v23-account-meta');
      const field=(label,value)=>{const box=v21Node('span');box.title=label+': '+(0,__f4.globals.String)(value||'—');box.append(v21Node('small','',label),v21Node('strong','',value||'—'));return box};
      meta.append(field('Username',a.username),field('ID anggota',a.wargaId));
      const action=v21Node('button','secondary',a.status==='Aktif'?'Reset password':'Siapkan akun');
      action.type='button';action.onclick=()=>resetDefault(a.akunId,a.nama,a.status==='Aktif');
      detail.append(meta,action);row.append(summary,detail);target.append(row);
    });
    if(!rows.length)target.append(v21Node('div','v23-account-empty','Tidak ada akun yang cocok.'));
  }
  __f4.window.matchMedia('(min-width:1024px)').addEventListener('change',()=>{
    if($('v23AccountRows'))v23RenderAccounts();
  });
  loadAccounts=async function(){
    const target=$('accountList');target.textContent='Memuat akun...';
    try{
      accounts=await call('authAdminAccounts',token);
      const bulk=$('bulkBtn');if(bulk)bulk.hidden=!(accounts||[]).some(a=>a.status!=='Aktif');
      const wrap=v21Node('div','v23-accounts'),tools=v21Node('div','v23-account-tools');
      const field=v21Node('div','v23-account-search');
      field.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
      const search=__f4.globals.document.createElement('input');search.type='search';search.id='v23AccountSearch';
      search.placeholder='Cari nama atau rumah';search.setAttribute('aria-label','Cari nama atau nomor rumah');
      search.oninput=v23RenderAccounts;field.append(search);
      const counter=v21Node('p','hint');counter.id='v23AccountCount';
      tools.append(field,counter);
      const rows=v21Node('div');rows.id='v23AccountRows';wrap.append(tools,rows);target.replaceChildren(wrap);
      v23RenderAccounts();
    }catch(e){target.textContent='Gagal memuat daftar akun: '+(e.message||e);}
  };
  // In an embedded portal, modal close must never navigate the shared shell.
  // Escape, blank backdrop, and X use the same local close functions.
  // Sentuh dan geser untuk pindah foto/video; tidak mengganggu pemutaran video.
  (function(){
    const stage=$('v21StageContent'),lightbox=$('v21Lightbox'),gallery=$('v21GalleryModal');
    let beginX=0,beginY=0;
    stage?.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;beginX=e.touches[0].clientX;beginY=e.touches[0].clientY;},{passive:true});
    stage?.addEventListener('touchend',e=>{
      if(!beginX||!e.changedTouches.length)return;
      const dx=e.changedTouches[0].clientX-beginX,dy=e.changedTouches[0].clientY-beginY;beginX=0;
      if(__f4.globals.Math.abs(dx)>55&&__f4.globals.Math.abs(dx)>__f4.globals.Math.abs(dy)*1.4)v21ShiftMedia(dx<0?1:-1);
    },{passive:true});
    lightbox?.addEventListener('click',e=>{if(e.target===lightbox||e.target.classList.contains('v21-stage'))v21CloseLightbox();});
    gallery?.addEventListener('click',e=>{if(e.target===gallery)v21CloseGallery();});
  })();
  // v24 — admin dapat memperbarui progres yang sudah tercatat tanpa membuat ID baru.
  let v24EditingId='',v24ProgressRows=[];
  function v24EnsureEditor(){
    if($('v24ProgressOverlay'))return;
    const overlay=__f4.globals.document.createElement('div');overlay.id='v24ProgressOverlay';overlay.className='v24-edit-overlay hidden';
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','v24EditorTitle');
    overlay.innerHTML=`<div class="v24-edit-card"><div class="v24-edit-title"><h2 id="v24EditorTitle">Edit perkembangan</h2><button type="button" class="secondary" id="v24Close" aria-label="Tutup editor"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
      <form id="v24EditForm"><div class="v24-edit-grid"><div class="field"><label for="v24Date">Tanggal kegiatan</label><input type="date" id="v24Date" required></div>
      <div class="field"><label for="v24Status">Status kegiatan</label><select id="v24Status"><option>Perencanaan</option><option>Berjalan</option><option>Selesai</option></select></div></div>
      <div class="field"><label for="v24Title">Judul kegiatan</label><input id="v24Title" required minlength="3" maxlength="160"></div>
      <div class="field"><label for="v24Step">Tahap / langkah</label><input id="v24Step" maxlength="100"></div>
      <div class="field"><label for="v24Desc">Deskripsi</label><textarea id="v24Desc" rows="4" maxlength="1500"></textarea></div>
      <div class="field"><label for="v24Agenda">Agenda berikutnya</label><input id="v24Agenda" maxlength="400"></div>
      <div class="field"><label for="v24Photo">Tautan foto HTTPS (opsional)</label><input type="url" id="v24Photo" maxlength="1000"></div>
      <div class="field"><label><input type="checkbox" id="v24Public" style="width:auto"> Tampilkan di portal publik</label></div>
      <p id="v24EditNotice" role="status" class="hint"></p>
      <div class="v24-edit-actions"><button type="button" class="secondary" id="v24Cancel">Batal</button><button type="submit" id="v24Save">Simpan perubahan</button></div></form></div>`;
    __f4.globals.document.body.appendChild(overlay);
    overlay.onclick=e=>{if(e.target===overlay)v24CloseEditor();};
    $('v24Close').onclick=$('v24Cancel').onclick=v24CloseEditor;
    $('v24EditForm').onsubmit=v24SaveProgress;
    __f4.globals.document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.classList.contains('hidden'))v24CloseEditor();});
  }
  function v24CloseEditor(){$('v24ProgressOverlay')?.classList.add('hidden');v24EditingId='';}
  function v24OpenEditor(id){
    if(!profile||profile.peran!=='Admin')return;
    const r=v24ProgressRows.find(x=>x.id===id);if(!r)return;
    v24EnsureEditor();v24EditingId=r.id;
    [['v24Date','tanggal'],['v24Title','judul'],['v24Step','langkah'],['v24Desc','deskripsi'],
      ['v24Status','status'],['v24Agenda','agenda'],['v24Photo','foto']].forEach(([field,key])=>{$(field).value=r[key]||'';});
    $('v24Public').checked=!!r.publik;$('v24EditNotice').textContent='Memperbarui '+r.id+' tanpa membuat kegiatan baru.';
    $('v24ProgressOverlay').classList.remove('hidden');$('v24Title').focus();
  }
  async function v24SaveProgress(e){
    e.preventDefault();if(!v24EditingId||!profile||profile.peran!=='Admin')return;
    const form=e.currentTarget,save=$('v24Save'),id=v24EditingId;
    const payload={id,tanggal:$('v24Date').value,judul:$('v24Title').value,langkah:$('v24Step').value,
      deskripsi:$('v24Desc').value,status:$('v24Status').value,agenda:$('v24Agenda').value,
      foto:$('v24Photo').value,publik:$('v24Public').checked};
    save.disabled=true;$('v24EditNotice').textContent='Menyimpan perubahan...';
    try{
      await call('bsV24UbahProgress',token,payload);
      v24CloseEditor();await loadProgress();
      note('dashNotice','Perkembangan '+id+' berhasil diperbarui. Perubahan publik akan tampil setelah halaman dimuat ulang.');
    }catch(err){$('v24EditNotice').textContent='Gagal menyimpan: '+(err.message||err);}
    finally{save.disabled=false;}
  }
  loadProgress=async function(){
    const area=$('progressList');area.textContent='Memuat perkembangan...';
    const admin=profile?.peran==='Admin';
    if(!admin){
      try{
        const publicUrl='https://api.flamboyan4.web.id/api/v2/public/bank';
        const publicResponse=await (0,__f4.globals.fetch)(publicUrl,{credentials:'omit',cache:'no-store'});
        if(!publicResponse.ok)throw (0,__f4.globals.Error)('HTTP '+publicResponse.status);
        const data=await publicResponse.json();
        if(data.ok===false)throw (0,__f4.globals.Error)(data.error||'Layanan tidak tersedia');
        // Rekap rupiah dan harian memerlukan sesi anggota; bukan saldo pribadi.
        const report=await (0,__f4.globals.fetch)(publicUrl+'/report',{credentials:'include',cache:'no-store'})
          .then(async response=>{
            if(!response.ok)throw (0,__f4.globals.Error)('HTTP '+response.status);
            const result=await response.json();
            if(result.ok===false)throw (0,__f4.globals.Error)(result.error||'Rekap tidak tersedia');
            return result;
          }).catch(()=>null);
        if(typeof __f4.window.F4BankProgressApp?.render!=='function')
          throw (0,__f4.globals.Error)('Komponen grafik belum dimuat. Muat ulang halaman.');
        __f4.window.F4BankProgressApp.render(area,data,report);
      }catch(err){area.textContent='Perkembangan belum dapat dimuat: '+(err.message||err);}
      return;
    }
    try{
      const rows=await call('bsV24DaftarProgressAdmin',token);
      v24ProgressRows=rows;
      if(!rows.length){area.textContent=admin?'Belum ada perkembangan tercatat.':'Belum ada perkembangan yang ditampilkan.';return;}
      area.replaceChildren();
      if(admin){const hint=v21Node('p','v17-subtle','Pilih kegiatan untuk mengubah informasi, status, atau penayangan publik.');area.appendChild(hint);}
      rows.forEach(p=>{
        const item=v21Node(admin?'button':'div','v24-progress-item');if(admin){item.type='button';item.onclick=()=>v24OpenEditor(p.id);}
        const info=v21Node('div');info.append(v21Node('strong','',p.judul||p.langkah||'Kegiatan'),v21Node('p','',p.deskripsi||''));
        const meta=[p.tanggal,p.status].filter(__f4.globals.Boolean).join(' • ');
        const caption=v21Node('small','',meta);if(admin&&!p.publik)caption.appendChild(v21Node('span','v24-progress-hidden',' • Tidak tampil di publik'));
        info.appendChild(caption);item.appendChild(info);
        if(admin)item.appendChild(v21Node('span','v24-edit-tag','Edit'));
        area.appendChild(item);
      });
    }catch(err){area.textContent='Gagal memuat perkembangan: '+(err.message||err);}
  };
  // v25 — foto kegiatan terlihat langsung dalam linimasa dan detail di dalam web.
  function v25ShowProgress(p){
    const wrap=v21Node('div');
    if(p.foto&&v21ImageSrc(p.foto)){
      const photo=v21Photo(p.foto,p.judul||'Foto perkembangan');photo.classList.add('v25-detail-image');wrap.appendChild(photo);
    }
    const meta=v21Node('p','v17-subtle',[p.tanggal,p.status,p.langkah].filter(__f4.globals.Boolean).join(' • '));
    wrap.append(meta,v21Node('p','v25-detail-text',p.deskripsi||'Belum ada keterangan kegiatan.'));
    if(p.agenda)wrap.appendChild(v21Node('p','v25-detail-text','Agenda berikutnya: '+p.agenda));
    v21ShowModal(p.judul||'Perkembangan','Catatan perkembangan kegiatan',wrap);
  }
  // Linimasa publik: tiga kegiatan terbaru, tahap asli D1, detail penuh di modal.
  let v17ProgressItems=[],v17ShowAllProgress=false;
  function f4DevStatusKind(value){
    const s=(0,__f4.globals.String)(value||'').toLowerCase();
    if(/selesai|tuntas|terlaksana|rampung|sukses|done|completed/.test(s))return 'done';
    if(/berjalan|proses|berlangsung|dikerjakan|aktif|progress/.test(s))return 'active';
    return 'plan';
  }
  function v25RenderTimeline(items){
    const timeline=$('v17Timeline');if(!timeline)return;
    v17ProgressItems=(__f4.globals.Array.isArray(items)?items:[]).slice().sort((a,b)=>
      (0,__f4.globals.String)(b.tanggal||'').localeCompare((0,__f4.globals.String)(a.tanggal||'')));
    v17ProgressCount=v17ProgressItems.length;
    $('f4DevStepCount').textContent=v17ProgressCount+' tahap';
    const track=$('f4DevStepTrack');
    track.replaceChildren();
    const chronological=v17ProgressItems.slice().reverse().slice(0,6);
    track.style.setProperty('--dev-steps',(0,__f4.globals.String)(__f4.globals.Math.max(1,chronological.length)));
    chronological.forEach((p,i)=>{
      const step=__f4.globals.document.createElement('div');step.className='f4-dev-step';
      const status=f4DevStatusKind(p.status);if(status!=='plan')step.classList.add('is-'+status);
      const dot=__f4.globals.document.createElement('i');if(status==='done')dot.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>';else dot.textContent=(0,__f4.globals.String)(i+1);
      const title=__f4.globals.document.createElement('span');title.textContent='Tahap '+(i+1);
      step.title=(p.judul||p.langkah||'Kegiatan')+' • '+(p.status||'Direncanakan');
      step.append(dot,title);track.append(step);
    });
    const more=$('f4DevShowAll');
    more.hidden=v17ProgressCount<=3;
    more.textContent=v17ShowAllProgress?'Tampilkan 3':'Lihat semua';
    more.onclick=()=>{v17ShowAllProgress=!v17ShowAllProgress;v25RenderTimeline(v17ProgressItems)};
    timeline.replaceChildren();
    const visible=v17ShowAllProgress?v17ProgressItems:v17ProgressItems.slice(0,3);
    visible.forEach(p=>{
      const li=__f4.globals.document.createElement('li');
      const button=__f4.globals.document.createElement('button');button.type='button';button.className='f4-dev-activity';
      button.title='Lihat kegiatan '+(p.judul||p.langkah||'');
      button.onclick=()=>v25ShowProgress(p);
      if(p.foto&&v21ImageSrc(p.foto)){
        const img=v21Photo(p.foto,p.judul||'Foto kegiatan');img.classList.add('f4-dev-activity-img');button.append(img);
      }else{
        const icon=__f4.globals.document.createElement('span');icon.className='f4-dev-activity-icon';icon.innerHTML='<img src="/assets/icons/bank.svg" width="21" height="21" alt="" aria-hidden="true">';icon.setAttribute('aria-hidden','true');button.append(icon);
      }
      const info=__f4.globals.document.createElement('span');info.className='f4-dev-activity-info';
      const name=__f4.globals.document.createElement('strong');name.textContent=p.judul||p.langkah||'Kegiatan';
      const date=__f4.globals.document.createElement('small');date.textContent=p.tanggal||'Tanggal belum diisi';
      info.append(name,date);
      const state=__f4.globals.document.createElement('span');state.className='f4-dev-activity-state';
      const kind=f4DevStatusKind(p.status);if(kind==='plan')state.classList.add('is-plan');else if(kind==='active')state.classList.add('is-active');
      state.textContent=p.status||'Rencana';
      button.append(info,state);li.append(button);timeline.append(li);
    });
    if(!timeline.childElementCount){
      const empty=__f4.globals.document.createElement('li');empty.className='f4-dev-empty-activity';empty.textContent='Belum ada kegiatan yang dipublikasikan.';timeline.append(empty);
    }
    v17RenderPublicChart();
  }
  function v25PreviewURL(id){
    const input=$(id);if(!input)return;
    let preview=$(id+'Preview');if(!preview){preview=__f4.globals.document.createElement('img');preview.id=id+'Preview';preview.className='v25-photo-preview hidden';preview.alt='Pratinjau foto perkembangan';input.after(preview);}
    const src=v21ImageSrc(input.value.trim());preview.classList.toggle('hidden',!src);
    if(src)preview.src=src;else preview.removeAttribute('src');
  }
  function v25AttachPreview(id){
    const input=$(id);if(!input||input.dataset.v25Preview)return;
    input.dataset.v25Preview='1';input.addEventListener('input',()=>v25PreviewURL(id));v25PreviewURL(id);
  }
  v25AttachPreview('v11ProPhoto');
  const v25OldOpenEditor=v24OpenEditor;
  v24OpenEditor=function(id){v25OldOpenEditor(id);v25AttachPreview('v24Photo');v25PreviewURL('v24Photo');};


  // v26 — jangan biarkan logout tertahan oleh permintaan server.
  doLogout=function(){
    const oldToken=token;
    showAuth();note('authNotice','');
    $('loginPass').value='';
    v11ShowPublic();__f4.window.scrollTo({top:0,behavior:'instant'});
    if(oldToken)call('authLogout',oldToken).catch(()=>{});
  };
  const v26OldShowAuth=showAuth;
  showAuth=function(){v26OldShowAuth();note('authNotice','');};
  (function v26SetupLogin(){
    const auth=$('authView');auth?.classList.add('v26-simple-login');
    const legacyReturn=[...auth.querySelectorAll('button')].find(b=>b.textContent.trim()==='Lihat portal publik');
    legacyReturn?.remove();
    const back=v21Node('button','v26-return-public','Kembali ke portal publik');back.type='button';
    back.insertAdjacentHTML('afterbegin','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7M5 12h14"/></svg>');
    back.onclick=()=>{note('authNotice','');v11ShowPublic();__f4.window.scrollTo({top:0,behavior:'instant'});};
    auth.insertBefore(back,auth.firstChild);
    const brand=__f4.globals.document.querySelector('.shell > .top .brand');
    if(brand){brand.title='Kembali ke portal publik';brand.tabIndex=0;brand.setAttribute('role','button');
      brand.setAttribute('aria-label','Bank Sampah Flamboyan 4, kembali ke portal publik');
      brand.onclick=back.onclick;brand.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();back.onclick();}};}
    const title=auth.querySelector('h1');if(title)title.textContent='Masuk akun';
  })();
  // Admin: pembatalan batch final hanya melalui konfirmasi ID dan alasan audit.
  function v27SetupCancel(){
    const page=$('pagePengesahan');if(!page||$('v27CancelPanel'))return;
    const panel=__f4.globals.document.createElement('details');panel.id='v27CancelPanel';panel.className='v27-cancel-panel';
    panel.innerHTML=`<summary><span>Koreksi / batalkan pengesahan</span><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
      <p class="hint">Riwayat tetap ada. Pembatalan ditolak bila terkait pencairan atau kas.</p>
      <form id="v27CancelForm"><div class="field"><label for="v27Batch">Kelompok disahkan</label><select id="v27Batch" required><option value="">Memuat batch...</option></select></div>
      <div class="field"><label for="v27Reason">Alasan pembatalan</label><textarea id="v27Reason" required minlength="10" maxlength="300" rows="3" placeholder="Contoh: Data uji coba sistem, bukan transaksi resmi"></textarea></div>
      <div class="field"><label for="v27Confirm">Ketik ulang ID kelompok</label><input id="v27Confirm" autocomplete="off" required placeholder="B202610"></div>
      <button id="v27CancelBtn" type="submit">Batalkan pengesahan</button></form>
      <div id="v27CancelNotice" role="status" class="hint"></div>`;
    page.appendChild(panel);$('v27CancelForm').onsubmit=v27CancelBatch;
    panel.addEventListener('toggle',()=>{if(panel.open&&profile?.peran==='Admin')v27LoadFinal();});
  }
  async function v27LoadFinal(){
    if(profile?.peran!=='Admin'||!$('v27Batch'))return;
    const sel=$('v27Batch'),old=sel.value;sel.replaceChildren(new __f4.globals.Option('Memuat kelompok...',''));
    try{
      const rows=await call('bsV27FinalAdmin',token);
      sel.replaceChildren(new __f4.globals.Option('Pilih kelompok yang disahkan',''));
      rows.forEach(r=>sel.add(new __f4.globals.Option(r.batch+' • '+kg(r.beratWarga)+' • '+rupiah(r.hakWarga),r.batch)));
      if(rows.some(r=>r.batch===old))sel.value=old;
      if(!rows.length)$('v27CancelNotice').textContent='Belum ada kelompok disahkan.';
    }catch(e){sel.replaceChildren(new __f4.globals.Option('Gagal memuat kelompok',''));$('v27CancelNotice').textContent=e.message||(0,__f4.globals.String)(e);}
  }
  async function v27CancelBatch(e){
    e.preventDefault();if(profile?.peran!=='Admin')return;
    const batch=$('v27Batch').value,reason=$('v27Reason').value.trim(),confirmId=$('v27Confirm').value.trim();
    if(batch!==confirmId)return note('v27CancelNotice','ID konfirmasi tidak sama.',true);
    if(!await __f4.window.f4UiDialog.confirm('Batalkan pengesahan '+batch+' dan keluarkan nilainya dari seluruh laporan aktif? Riwayat tetap disimpan.'))return;
    if(!await __f4.window.f4UiDialog.confirm('Konfirmasi terakhir: pastikan batch ini tidak memiliki pencairan atau pengeluaran terkait. Lanjutkan?'))return;
    const button=$('v27CancelBtn');button.disabled=true;note('v27CancelNotice','Memproses pembatalan. Jangan tutup halaman.');
    try{
      const result=await call('bsV27BatalkanPengesahan',token,{batch,konfirmasi:confirmId,alasan:reason});
      $('v27CancelForm').reset();await v27LoadFinal();await v8LoadBatches();
      note('v27CancelNotice','Batch '+result.batch+' dibatalkan. Riwayat dan alasan tersimpan. Perbarui dashboard/laporan untuk melihat angka terbaru.');
    }catch(err){note('v27CancelNotice','Tidak dapat membatalkan: '+(err.message||err),true);}
    finally{button.disabled=false;}
  }
  const v27OldGoPage=goPage;
  goPage=function(page){if(__f4.globals.document.body.dataset.f4BankRole==='superadmin'&&page==='kegiatan')page='dokumentasi';v27OldGoPage(page);if(page==='pengesahan'&&profile?.peran==='Admin'){v27SetupCancel();v27LoadFinal();}};
  v27SetupCancel();
  // Admin bisa memakai sampul album yang sudah ada sebagai foto perkembangan.
  function v27AlbumPhotoPicker(inputId){
    const input=$(inputId);if(!input||$(inputId+'AlbumPicker'))return;
    const select=__f4.globals.document.createElement('select');select.id=inputId+'AlbumPicker';select.setAttribute('aria-label','Pilih sampul album dokumentasi');
    select.add(new __f4.globals.Option('Gunakan foto sampul album (opsional)',''));
    select.style.marginTop='8px';
    select.onchange=()=>{if(select.value){input.value=select.value;input.dispatchEvent(new __f4.globals.Event('input',{bubbles:true}));}};
    input.after(select);
    call('bsV22AlbumIndexPublik').then(rows=>{
      (rows||[]).filter(x=>x.sampul&&v21ImageSrc(x.sampul)).forEach(x=>select.add(new __f4.globals.Option(x.judul,x.sampul)));
    }).catch(()=>{select.title='Album belum bisa dimuat; tautan foto tetap dapat diisi manual.';});
  }
  v27AlbumPhotoPicker('v11ProPhoto');
  const v27OldOpenEditor=v24OpenEditor;
  v24OpenEditor=function(id){v27OldOpenEditor(id);v27AlbumPhotoPicker('v24Photo');};

  // Cetak dibuat dalam lembar khusus; tidak tergantung layout sidebar/screen.
  function v27PrintNode(tag,cls,value){return v21Node(tag,cls,value);}
  __f4.window.addEventListener('afterprint',()=>__f4.globals.document.body.classList.remove('v27-print-report'));
  // v29: kop resmi konsisten dan laporan audit opsional khusus administrator.
  const v29Styles=__f4.globals.document.createElement('style');v29Styles.textContent=`
    .v29-kop{display:flex;align-items:center;gap:13px;margin-bottom:15px;border-bottom:2px solid #356748;padding-bottom:12px}
    .v29-kop-logo{width:57px;height:57px;object-fit:contain;flex:none}
    .v29-audit-filter{display:flex;align-items:center;gap:8px;margin-top:12px;font-weight:500}
    #v27PrintReport .v29-kop strong{font-size:16pt;color:#235037}
    #v27PrintReport .v29-kop small{display:block;font-size:8pt;color:#526858}
    @media print{.v29-kop{break-inside:avoid}.v29-kop-logo{width:54px;height:54px}}
  `;__f4.globals.document.head.appendChild(v29Styles);
  function v29Kop(){
    const kop=__f4.globals.document.createElement('div');kop.className='v13-kop v29-kop';
    const logo=__f4.globals.document.createElement('img');logo.src=v36PrintLogoPng||v17Logo;logo.alt='Logo Bank Sampah Flamboyan 4';logo.className='v29-kop-logo';logo.decoding='sync';logo.loading='eager';
    const words=__f4.globals.document.createElement('div');const name=__f4.globals.document.createElement('strong');name.textContent='BANK SAMPAH FLAMBOYAN 4';
    const address=__f4.globals.document.createElement('small');address.textContent='RT 001 RW 026 • Pesona Kahuripan 2 • Desa Cikahuripan, Klapanunggal, Kabupaten Bogor';
    words.append(name,address);kop.append(logo,words);return kop;
  }
  function v31SetupScrollTop(){
    if($('v31ScrollTop'))return;
    const button=__f4.globals.document.createElement('button');button.id='v31ScrollTop';button.type='button';
    button.setAttribute('aria-label','Kembali ke atas');button.title='Ke atas';button.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>';
    button.onclick=()=>__f4.window.scrollTo({top:0,behavior:'smooth'});
    $('v11Public')?.appendChild(button);
    const refresh=()=>{
      if($('v11Public')?.classList.contains('hidden'))return;
      button.classList.toggle('v31-visible',__f4.window.scrollY>450);
    };
    __f4.window.addEventListener('scroll',refresh,{passive:true});refresh();
  }
  v31SetupScrollTop();
  function v29SetupAudit(){
    const report=$('pageLaporan'),type=$('v10ReportType');
    if(!report||!type||$('v29AuditFilter'))return;
    const wrap=__f4.globals.document.createElement('div');wrap.className='field';
    wrap.innerHTML='<label id="v29AuditFilter" class="v29-audit-filter"><input type="checkbox" id="v29ShowCanceled"><span>Sertakan transaksi dibatalkan</span></label>';
    type.closest('.field').before(wrap);
    $('v29ShowCanceled').addEventListener('change',()=>{
      v10ReportData=null;
      $('v10ReportTable').textContent='Muat ulang laporan untuk menerapkan pilihan transaksi batal.';
    });
  }
  const v29OldSetup=v10Setup;
  v10Setup=function(){v29OldSetup();v29SetupAudit();};
  v10Specs.penjualan.fields.push(['status','Status']);
  const v29OldLoad=v10LoadReport;
  v10LoadReport=async function(){
    v29SetupAudit();
    const include=$('v29ShowCanceled')?.checked===true;
    const start=$('v10Month').value;
    const combine=$('v33ReportCombine')?.checked===true;
    const until=combine?(0,__f4.globals.String)($('v33ReportEndValue')?.value||''):start;
    const statusToken=__f4.globals.F4Loading.begin('v10ReportNotice','Memuat laporan Bank Sampah…');
    try{
      if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(start)||!/^\d{4}-(0[1-9]|1[0-2])$/.test(until)||until<start)
        throw (0,__f4.globals.Error)('Pilih rentang bulan yang benar.');
      const span=((0,__f4.globals.Number)(until.slice(0,4))-(0,__f4.globals.Number)(start.slice(0,4)))*12+(0,__f4.globals.Number)(until.slice(5))-(0,__f4.globals.Number)(start.slice(5))+1;
      if(span>24)throw (0,__f4.globals.Error)('Maksimal 24 bulan per laporan. Persempit rentangnya.');
      const full=await call('bsV10LaporanAdmin',token,combine?'':start,include);
      if(!combine){v10ReportData=full;}
      else{
        const within=row=>{const date=(0,__f4.globals.String)(row?.tanggal||'').slice(0,7);return date>=start&&date<=until;};
        const subset=key=>(__f4.globals.Array.isArray(full[key])?full[key]:[]).filter(within);
        const setoran=subset('setoran').map((row,index)=>({...row,no:index+1})),penjualan=subset('penjualan'),pengeluaran=subset('pengeluaran'),
          mutasi=subset('mutasi'),setoranBank=subset('setoranBank');
        const sum=(rows,key)=>rows.reduce((n,r)=>n+((0,__f4.globals.Number)(r[key])||0),0);
        const soldDeposits=setoran.filter(r=>r.penjualan==='Terjual');
        const availableDeposits=setoran.filter(r=>r.penjualan==='Tersedia');
        const confirmedSales=penjualan.filter(r=>r.status==='Terkonfirmasi');
        const activeExpenses=pengeluaran.filter(r=>(0,__f4.globals.String)(r.status||'').toLowerCase()==='lunas');
        const withdrawals=mutasi.filter(r=>r.jenis==='Pencairan');
        v10ReportData={
          periode:start+' s.d. '+until,
          ringkasan:{
            jumlahSetoran:setoran.filter(r=>r.penjualan!=='Dibatalkan').length,
            jumlahSetoranTerjual:soldDeposits.length,jumlahSetoranTersedia:availableDeposits.length,
            jumlahPenjualan:confirmedSales.length,
            estimasi:sum(availableDeposits,'nilai'),diterima:sum(confirmedSales,'diterima'),
            hakWargaDikredit:sum(confirmedSales,'hakWarga'),tabunganDicairkan:sum(withdrawals,'debit'),
            biaya:sum(activeExpenses,'nominal'),setoranBankRp:sum(setoranBank,'diterima'),
            saldoKasKini:(0,__f4.globals.Number)(full.ringkasan?.saldoKasKini||0)
          },
          setoran,penjualan,pengeluaran,mutasi,setoranBank,kodeBarang:full.kodeBarang||[]
        };
      }
      v10RenderReport();
      if(include)__f4.globals.F4Loading.empty('v10ReportNotice','Transaksi dibatalkan ditampilkan sebagai riwayat, tanpa menambah saldo sah.',statusToken);
      else __f4.globals.F4Loading.success('v10ReportNotice',statusToken);
    }catch(e){v10ReportData=null;__f4.globals.F4Loading.error('v10ReportNotice','Gagal memuat laporan: '+(e.message||e),statusToken);}
  };
  v10PrintReport=function(){
    if(!v10ReportData){note('v10ReportNotice','Muat laporan dahulu.',true);return;}
    const root=$('v10Print');root.replaceChildren();root.appendChild(v29Kop());
    const incl=$('v29ShowCanceled')?.checked===true;
    const title=__f4.globals.document.createElement('h1');title.textContent='LAPORAN ADMINISTRASI';root.appendChild(title);
    const sub=__f4.globals.document.createElement('p');sub.textContent=v10ReportData.periode+' • Dicetak '+new __f4.globals.Date().toLocaleDateString('id-ID')+(incl?' • Termasuk transaksi dibatalkan':'');root.appendChild(sub);
    const r=v10ReportData.ringkasan;
    const summary=__f4.globals.document.createElement('div');summary.className='f4-admin-print-summary';
    const primary=__f4.globals.document.createElement('div');primary.className='f4-admin-print-primary';
    const secondary=__f4.globals.document.createElement('div');secondary.className='f4-admin-print-secondary';
    const item=(label,value)=>{
      const box=__f4.globals.document.createElement('div');box.className='f4-admin-print-metric';
      const caption=__f4.globals.document.createElement('small');caption.textContent=label;
      const amount=__f4.globals.document.createElement('strong');amount.textContent=(0,__f4.globals.String)(value??'—');
      box.append(caption,amount);return box;
    };
    primary.append(
      item('Setoran tercatat',r.jumlahSetoran),item('Terjual',r.jumlahSetoranTerjual??0),
      item('Tersedia',r.jumlahSetoranTersedia??0),item('Penjualan lapak',r.jumlahPenjualan)
    );
    secondary.append(
      item('Diterima lapak',rupiah(r.diterima)),item('Hak warga aktif',rupiah(r.hakWargaDikredit)),
      item('Dicairkan',rupiah(r.tabunganDicairkan)),item('Biaya',rupiah(r.biaya))
    );
    summary.append(primary,secondary);root.appendChild(summary);
    const selected=v10SelectedSections();
    selected.forEach(({key,spec,rows})=>{
      const heading=__f4.globals.document.createElement('h2');
      const groups=key==='setoran'?f4BankPeriodGroups(rows):[];
      const sameMonth=groups.length>0&&/^\d{4}-\d{2}-\d{2}$/.test(groups[0].date)&&
        groups.every(g=>g.date.slice(0,7)===groups[0].date.slice(0,7));
      const monthTitle=sameMonth?new __f4.globals.Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric',timeZone:'UTC'}).format(new __f4.globals.Date(groups[0].date+'T12:00:00Z')):'';
      heading.textContent=spec.title+(monthTitle?' — '+monthTitle:'')+' ('+rows.length+')';
      root.append(heading,v10MakeTable(spec,rows,key));
    });
    if(selected.some(section=>section.key==='setoran')){const legend=v10MakeCodeLegend();if(legend)root.appendChild(legend);}
    if(incl){const note=__f4.globals.document.createElement('p');note.textContent='Transaksi dibatalkan ditampilkan sebagai riwayat dan tidak menambah saldo maupun total transaksi sah.';root.appendChild(note);}
    const footer=__f4.globals.document.createElement('div');footer.className='f4-bank-report-signature';
    footer.textContent='Mengetahui, Humas Flamboyan 4';
    const signName=__f4.globals.document.createElement('strong');signName.textContent='Heri Juwandi';
    footer.appendChild(signName);root.appendChild(footer);
    v36BankPrint(root,'admin');
  };

  // Isolated print sheet, matching the Pembukuan A4 top/side margins.
  // The old in-page print combines several legacy @page rules and can print too low in Firefox.
  // Android Chrome may snapshot print preview before a linked SVG has painted.
  // Rasterize the official same-origin logo once and embed a decoded PNG in every report.
  let v36PrintLogoPng='';
  let v36PrintLogoTask=null;
  function v36PreparePrintLogo(){
    if(v36PrintLogoPng)return __f4.globals.Promise.resolve(v36PrintLogoPng);
    if(v36PrintLogoTask)return v36PrintLogoTask;
    v36PrintLogoTask=new __f4.globals.Promise((resolve,reject)=>{
      const source=new __f4.globals.Image();
      source.decoding='sync';
      source.onload=()=>{
        try{
          const canvas=__f4.globals.document.createElement('canvas');
          canvas.width=256;canvas.height=256;
          const ctx=canvas.getContext('2d');
          if(!ctx)throw new __f4.globals.Error('Kanvas logo tidak didukung.');
          ctx.clearRect(0,0,256,256);
          ctx.drawImage(source,0,0,256,256);
          const png=canvas.toDataURL('image/png');
          if(!png.startsWith('data:image/png;base64,'))throw new __f4.globals.Error('PNG logo tidak terbentuk.');
          const decoded=new __f4.globals.Image();
          decoded.onload=()=>{v36PrintLogoPng=png;resolve(png);};
          decoded.onerror=()=>reject(new __f4.globals.Error('Logo PNG tidak dapat dibaca.'));
          decoded.src=png;
        }catch(error){reject(error);}
      };
      source.onerror=()=>reject(new __f4.globals.Error('Logo resmi belum dapat dimuat.'));
      source.src=v17Logo;
    }).catch(error=>{
      v36PrintLogoTask=null;
      __f4.globals.console.warn('Logo PDF Bank Sampah belum siap:',error);
      return '';
    });
    return v36PrintLogoTask;
  }
  // Preload while the member/admin reads the page so printing stays a direct click.
  v36PreparePrintLogo();

  function v36BankPrint(root,kind){
    // Print the already prepared report once. The added clone caused duplicates.
    if(!root)return;
    __f4.globals.document.getElementById('f4-bank-print-sheet')?.remove();
    __f4.globals.document.getElementById('f4-bank-print-style')?.remove();
    __f4.globals.document.getElementById('f4-bank-one-print-style')?.remove();
    const isPublic=kind==='public';
    const orientation='portrait';
    const pageMargins=kind==='member'?'11mm 12mm 12mm':'5mm 12mm 11mm';
    __f4.globals.document.body.classList.toggle('f4-bank-print-member',kind==='member');
    __f4.globals.document.body.classList.toggle('f4-bank-print-admin',kind==='admin');
    __f4.globals.document.body.classList.toggle('v27-print-report',isPublic);
    __f4.globals.document.body.classList.add('f4-bank-single-print');
    const css=__f4.globals.document.createElement('style');
    css.id='f4-bank-one-print-style';
    css.textContent=
      '@page{size:A4 '+orientation+';margin:'+pageMargins+'}'+
      '@media print{'+
        'html,body{margin:0;padding:0;background:white}'+
        'body.f4-bank-single-print>*:not(#v10Print):not(#v27PrintReport){display:none}'+
        'body.f4-bank-single-print #v10Print,body.f4-bank-single-print #v27PrintReport{margin:0;padding:0;width:100%;max-width:none;overflow:visible}'+
        'body.f4-bank-single-print:not(.v27-print-report) #v10Print{display:block}'+
        'body.f4-bank-single-print:not(.v27-print-report) #v27PrintReport{display:none}'+
        'body.f4-bank-single-print.v27-print-report #v10Print{display:none}'+
        'body.f4-bank-single-print.v27-print-report #v27PrintReport{display:block;position:static}'+
        '#v10Print table,#v27PrintReport table{display:table;width:100%;border-collapse:collapse}'+
        '#v10Print thead,#v27PrintReport thead{display:table-header-group}'+
        '#v10Print tbody,#v27PrintReport tbody{display:table-row-group}'+
        '#v10Print tr,#v27PrintReport tr{display:table-row;break-inside:avoid}'+
        '#v10Print th,#v10Print td,#v27PrintReport th,#v27PrintReport td{display:table-cell}'+
        '#v10Print td[data-label]::before,#v27PrintReport td[data-label]::before{content:none;display:none}'+
        '#v10Print th,#v27PrintReport th{print-color-adjust:exact;-webkit-print-color-adjust:exact}'+
      '}';
    // Final scoped print rules override legacy global 9px print formatting.
    css.textContent += "\n@media print{\nbody.f4-bank-single-print{margin:0;padding:0;background:#fff}\nbody.f4-bank-single-print #v10Print,body.f4-bank-single-print #v27PrintReport{\nposition:static;inset:auto;transform:none;margin:0;padding:0;\nfont:12px/1.4 Arial,Helvetica,sans-serif;box-shadow:none}\nbody.f4-bank-single-print #v10Print .v29-kop,body.f4-bank-single-print #v27PrintReport .v29-kop{\ndisplay:flex;align-items:center;gap:10px;margin:0 0 9px;\npadding:0 0 7px;border-bottom:1.5px solid #000}\nbody.f4-bank-single-print .v29-kop-logo{width:47px;height:47px;object-fit:contain}\nbody.f4-bank-single-print #v10Print .v29-kop strong,body.f4-bank-single-print #v27PrintReport .v29-kop strong{\nfont-size:14px;line-height:1.28}\nbody.f4-bank-single-print #v10Print .v29-kop small,body.f4-bank-single-print #v27PrintReport .v29-kop small{\nfont-size:10px;line-height:1.3}\nbody.f4-bank-single-print #v10Print h1,body.f4-bank-single-print #v27PrintReport h1{\nfont-size:18px;line-height:1.25;margin:6px 0 5px}\nbody.f4-bank-single-print #v10Print h2,body.f4-bank-single-print #v27PrintReport h2{\nfont-size:13px;line-height:1.28;margin:12px 0 6px;break-after:avoid}\nbody.f4-bank-single-print #v10Print p,body.f4-bank-single-print #v27PrintReport p{\nfont-size:11px;line-height:1.38;margin:5px 0 8px}\nbody.f4-bank-single-print #v10Print table,body.f4-bank-single-print #v27PrintReport table{\ndisplay:table;width:calc(100% - 1mm);min-width:0;table-layout:auto;\nborder-collapse:collapse;border-right:1px solid #333;margin:0 0 10px}\nbody.f4-bank-single-print #v10Print thead,body.f4-bank-single-print #v27PrintReport thead{display:table-header-group}\nbody.f4-bank-single-print #v10Print tbody,body.f4-bank-single-print #v27PrintReport tbody{display:table-row-group}\nbody.f4-bank-single-print #v10Print tr,body.f4-bank-single-print #v27PrintReport tr{\ndisplay:table-row;break-inside:avoid;border-radius:0;background:#fff}\nbody.f4-bank-single-print #v10Print th,body.f4-bank-single-print #v10Print td,\nbody.f4-bank-single-print #v27PrintReport th,body.f4-bank-single-print #v27PrintReport td{\ndisplay:table-cell;font-size:10.5px;line-height:1.24;padding:4px 5px;\nvertical-align:top;white-space:normal;overflow-wrap:anywhere;\nborder:1px solid #333;background:#fff;color:#111}\nbody.f4-bank-single-print #v10Print th,body.f4-bank-single-print #v27PrintReport th{\nbackground:#edf6f0;color:#111;font-weight:750;\n-webkit-print-color-adjust:exact;print-color-adjust:exact}\nbody.f4-bank-single-print #v10Print td::before,body.f4-bank-single-print #v10Print td::after,\nbody.f4-bank-single-print #v27PrintReport td::before,body.f4-bank-single-print #v27PrintReport td::after{\ndisplay:none;content:none}\nbody.f4-bank-single-print #v10Print .f4-bank-report-signature{\nmargin:18px 0 0;padding:0 3px;font-size:11px;break-inside:avoid}\nbody.f4-bank-single-print #v10Print .f4-bank-report-signature strong{font-size:11px;margin-top:28px}\nbody.f4-bank-single-print.v27-print-report #v27PrintReport th,\nbody.f4-bank-single-print.v27-print-report #v27PrintReport td{\nfont-size:10.5px;line-height:1.26;padding:5px 4px}\n}";
    // Canonical print style: paper, summary surfaces and table headers remain white.
    css.textContent += "\n@media print{\n"+
      "body.f4-bank-single-print #v10Print,body.f4-bank-single-print #v27PrintReport{background:#fff;color:#111}\n"+
      "body.f4-bank-single-print #v10Print .f4-admin-print-summary,"+
      "body.f4-bank-single-print #v10Print .f4-admin-print-metric,"+
      "body.f4-bank-single-print #v10Print .f4-member-print-summary{background:#fff;color:#111}\n"+
      "body.f4-bank-single-print #v10Print table[data-report-kind=setoran] td:first-child{white-space:nowrap;overflow-wrap:normal;font-size:10px}\n"+
      "body.f4-bank-single-print #v10Print th,body.f4-bank-single-print #v27PrintReport th{background:#edf6f0;color:#111}\n"+
      "body.f4-bank-single-print #v10Print .v29-kop,body.f4-bank-single-print #v27PrintReport .v29-kop{background:#fff}\n"+
      "body.f4-bank-single-print #v10Print table tr>:first-child,body.f4-bank-single-print #v27PrintReport table tr>:first-child{text-align:center}\n"+
      "body.f4-bank-single-print #v10Print table tr>:last-child,body.f4-bank-single-print #v27PrintReport table tr>:last-child{border-right:1px solid #333}\n"+
      "}";
    // Reuse the existing print declaration; no additional override stylesheet.
    if(kind==='admin')css.textContent=css.textContent.replace('table-layout:auto;','table-layout:fixed;');
    __f4.globals.document.head.append(css);
    let cleaned=false;
    const cleanup=()=>{
      if(cleaned)return;
      cleaned=true;
      css.remove();
      __f4.window.removeEventListener('afterprint',cleanup);
      __f4.globals.document.body.classList.remove('f4-bank-single-print','v27-print-report','f4-bank-print-member','f4-bank-print-admin');
      // Keep the prepared member sheet until the next print or logout.
    };
    const printWithLogo=png=>{
      if(!png){
        cleanup();
        __f4.window.f4UiDialog?.alert?.('Logo kop PDF belum berhasil dimuat. Periksa koneksi lalu coba cetak lagi.');
        return;
      }
      // Data URI holds all PNG pixels inside the print sheet, no HTTP/SVG race on HP.
      root.querySelectorAll('.v29-kop-logo').forEach(img=>{img.src=png;img.loading='eager';});
      try{__f4.globals.F4Pdf.openElement(root,{title:root.querySelector('h1,h2')?.textContent||'Laporan Bank Sampah Flamboyan 4',size:'A4',orientation,margins:pageMargins});}
      finally{cleanup();}
    };
    if(v36PrintLogoPng)printWithLogo(v36PrintLogoPng);
    else v36PreparePrintLogo().then(printWithLogo).catch(error=>{
      cleanup();
      __f4.window.f4UiDialog?.alert?.('Gagal menyiapkan logo PDF: '+(error?.message||error));
    });
    (0,__f4.globals.setTimeout)(cleanup,120000);
  }

  // Keep transactions marked canceled out of members' printable deposit rows.
  const v29OldMemberPrint=v12Print;
  v12Print=function(){
    if(!v12Data)return;
    const original=v12Data;
    v12Data={...original,setoran:(original.setoran||[]).filter(s=>(0,__f4.globals.String)(s.status).toLowerCase()!=='dibatalkan')};
    try{v29OldMemberPrint();}
    finally{v12Data=original;}
  };

  /* Bank Sampah — compact, accessible multi-section admin report controls.
   * Existing v10Month is retained as the API/finance period source of truth. */

  // Grafik ringkas di laporan SETORAN SATU WARGA, bukan laporan administrasi semua warga.
  function v37IndividualTrend(records,codes=[]){
    const source=__f4.globals.Array.isArray(records)?records:[];
    const allGroups=f4BankPeriodGroups(source),groups=allGroups.slice(-8);
    const section=__f4.globals.document.createElement('section');section.className='f4-single-member-trend';
    const trend=__f4.globals.document.createElement('div');trend.className='f4-single-member-panel';
    const mix=__f4.globals.document.createElement('div');mix.className='f4-single-member-panel';
    const heading=__f4.globals.document.createElement('h2');heading.textContent='Perkembangan berat setoran';
    trend.append(heading);
    const ns='http://www.w3.org/2000/svg';
    const addSvg=(parent,tag,attrs,label)=>{
      const el=__f4.globals.document.createElementNS(ns,tag);
      __f4.globals.Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,(0,__f4.globals.String)(value)));
      if(label!==__f4.globals.undefined)el.textContent=(0,__f4.globals.String)(label);
      parent.append(el);return el;
    };
    const fmt=n=>new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format(n);
    if(groups.length){
      const svg=__f4.globals.document.createElementNS(ns,'svg');
      svg.classList.add('f4-single-member-svg');
      svg.setAttribute('viewBox','0 0 354 136');
      svg.setAttribute('role','img');
      svg.setAttribute('aria-label','Berat setoran per tanggal penimbangan');
      addSvg(svg,'line',{x1:12,x2:342,y1:107,y2:107,stroke:'#a9bfaf','stroke-width':1});
      const weights=groups.map(g=>g.rows.reduce((n,r)=>n+__f4.globals.Math.max(0,(0,__f4.globals.Number)(r.total)||0),0));
      const max=__f4.globals.Math.max(.001,...weights);
      const slot=330/groups.length,barWidth=__f4.globals.Math.min(48,slot*.54);
      groups.forEach((group,i)=>{
        const kg=weights[i],height=kg>0?__f4.globals.Math.max(4,__f4.globals.Math.round(kg/max*83)):0;
        const mid=12+(i+.5)*slot;
        if(height)addSvg(svg,'rect',{x:mid-barWidth/2,y:107-height,width:barWidth,height,rx:3,fill:'#15916d'});
        addSvg(svg,'text',{x:mid,y:__f4.globals.Math.max(13,101-height),'text-anchor':'middle','font-size':10,'font-weight':'bold',fill:'#174f39'},fmt(kg));
        const dt=(0,__f4.globals.String)(group.date||'');
        const label=/^\d{4}-\d{2}-\d{2}$/.test(dt)?
          dt.slice(8,10)+'/'+dt.slice(5,7)+(groups.length<=4?'/'+dt.slice(2,4):''):dt;
        addSvg(svg,'text',{x:mid,y:123,'text-anchor':'middle','font-size':9,fill:'#476b55'},label);
      });
      trend.append(svg);
    }else{
      const empty=__f4.globals.document.createElement('p');empty.textContent='Belum ada setoran.';
      trend.append(empty);
    }
    const note=__f4.globals.document.createElement('p');note.className='f4-single-member-chart-note';
    note.textContent=allGroups.length>8?'8 dari '+allGroups.length+' periode timbang terakhir':
      allGroups.length===1?'Baru satu periode penimbangan tercatat.':'Berat (kg) per tanggal penimbangan.';
    trend.append(note);

    const mixTitle=__f4.globals.document.createElement('h2');mixTitle.textContent='Komposisi jenis sampah';
    mix.append(mixTitle);
    const colors={AL:'#ee8538',BR:'#4ba783',BE:'#6d87c8',BPK:'#8359b9',
      BD:'#ffbc0b',DU:'#43b6b3',GA:'#8bbd38',GL:'#a17ad7',
      GB:'#4084d8',KL:'#e6a146',KD:'#009e91'};
    const fallback=['#0f9476','#e0a02e','#4786d8','#e27d45','#9c6ec4'];
    const items=(__f4.globals.Array.isArray(codes)?codes:[]).map((code,i)=>{
      const key=(0,__f4.globals.String)(code.kode||'');
      const kg=source.reduce((sum,row)=>sum+__f4.globals.Math.max(0,(0,__f4.globals.Number)(row['item_'+key])||0),0);
      return {name:(0,__f4.globals.String)(code.nama||key),kg,color:colors[key]||fallback[i%fallback.length]};
    }).filter(item=>item.kg>0).sort((a,b)=>b.kg-a.kg);
    const visible=items.slice(0,5),remaining=items.slice(5);
    if(remaining.length)visible.push({name:'Lainnya',kg:remaining.reduce((sum,item)=>sum+item.kg,0),color:'#91a89d'});
    const total=items.reduce((sum,item)=>sum+item.kg,0);
    if(total>0){
      const body=__f4.globals.document.createElement('div');body.className='f4-single-member-mix-body';
      const donut=__f4.globals.document.createElementNS(ns,'svg');
      donut.classList.add('f4-single-member-mix-svg');
      donut.setAttribute('viewBox','0 0 100 100');
      donut.setAttribute('role','img');
      donut.setAttribute('aria-label','Komposisi jenis sampah dari seluruh setoran warga');
      const radius=32,circumference=2*__f4.globals.Math.PI*radius;
      addSvg(donut,'circle',{cx:50,cy:50,r:radius,fill:'none',stroke:'#e7efe9','stroke-width':13});
      let offset=0;
      visible.forEach(item=>{
        const arc=item.kg/total*circumference;
        addSvg(donut,'circle',{cx:50,cy:50,r:radius,fill:'none',
          stroke:item.color,'stroke-width':13,
          'stroke-dasharray':arc+' '+circumference,'stroke-dashoffset':-offset,
          transform:'rotate(-90 50 50)'});
        offset+=arc;
      });
      addSvg(donut,'text',{x:50,y:49,'text-anchor':'middle','font-size':fmt(total).length>7?10:13,
        'font-weight':'bold',fill:'#104c36'},fmt(total));
      addSvg(donut,'text',{x:50,y:60,'text-anchor':'middle','font-size':9,fill:'#617b6b'},'kg');
      const legend=__f4.globals.document.createElement('div');legend.className='f4-single-member-mix-legend';
      visible.forEach(item=>{
        const entry=__f4.globals.document.createElement('div');entry.className='f4-single-member-mix-item';
        const dot=__f4.globals.document.createElementNS(ns,'svg');dot.classList.add('f4-single-member-mix-swatch');
        dot.setAttribute('viewBox','0 0 12 12');dot.setAttribute('aria-hidden','true');
        addSvg(dot,'rect',{x:.5,y:.5,width:11,height:11,rx:2,fill:item.color,stroke:item.color,'stroke-width':1});
        const name=__f4.globals.document.createElement('span');name.className='f4-single-member-mix-name';name.textContent=item.name;
        const weight=__f4.globals.document.createElement('strong');weight.className='f4-single-member-mix-weight';
        weight.textContent=fmt(item.kg)+' kg';
        entry.append(dot,name,weight);legend.append(entry);
      });
      body.append(donut,legend);mix.append(body);
    }else{
      const empty=__f4.globals.document.createElement('p');empty.textContent='Rincian jenis belum tersedia.';
      mix.append(empty);
    }
    const mixNote=__f4.globals.document.createElement('p');mixNote.className='f4-single-member-chart-note';
    mixNote.textContent='Akumulasi seluruh setoran tercatat.';
    mix.append(mixNote);
    section.append(trend,mix);return section;
  }
  function v37IndividualTable(report){
    const codes=report.kodeBarang||[];
    const fmt=n=>new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format((0,__f4.globals.Number)(n)||0);
    const headers=['No','Tanggal',...codes.map(code=>code.kode),'Total'];
    const rows=(report.setoran||[]).map((r,i)=>{
      const day=(0,__f4.globals.String)(r.tanggal||'');
      const label=/^\d{4}-\d{2}-\d{2}$/.test(day)?
        day.slice(8,10)+'/'+day.slice(5,7)+'/'+day.slice(0,4):day;
      return [i+1,label,...codes.map(code=>(0,__f4.globals.Number)(r['item_'+code.kode])>0?fmt(r['item_'+code.kode]):'—'),fmt(r.total)];
    });
    const table=v12Table(headers,rows);table.className='f4-admin-report-table f4-single-member-table';
    table.dataset.reportKind='setoran';
    const cols=__f4.globals.document.createElement('colgroup');
    [5,18,...(0,__f4.globals.Array)(codes.length).fill(70/__f4.globals.Math.max(1,codes.length)),7].forEach(size=>{
      const col=__f4.globals.document.createElement('col');col.style.width=size+'%';cols.append(col);
    });
    table.prepend(cols);return table;
  }
  let v37MemberChoicesTask=null;
  async function v37FillMemberChoices(){
    const select=$('v37MemberSelect');
    if(!select||select.dataset.ready==='1')return;
    if(v37MemberChoicesTask)return v37MemberChoicesTask;
    if(!/^(admin|superadmin)$/i.test((0,__f4.globals.String)(profile?.peran||'')))return;
    const activeToken=token;
    v37MemberChoicesTask=call('bsV37DaftarAnggotaLaporan',token).then(members=>{
      if(activeToken!==token||!select.isConnected)return;
      const previous=select.value;select.replaceChildren(new __f4.globals.Option('Pilih warga',''));
      const list=(__f4.globals.Array.isArray(members)?members:[])
        .filter(m=>(0,__f4.globals.String)(m.wargaId||'').trim())
        .sort((a,b)=>(0,__f4.globals.String)(a.nama||'').localeCompare((0,__f4.globals.String)(b.nama||''),'id'));
      list.forEach(m=>select.add(new __f4.globals.Option((0,__f4.globals.String)(m.nama||'Anggota')+(m.rumah?' · '+m.rumah:''),(0,__f4.globals.String)(m.wargaId))));
      if([...select.options].some(o=>o.value===previous))select.value=previous;
      select.dataset.ready='1';select.dispatchEvent(new __f4.globals.Event('change'));
    }).finally(()=>{v37MemberChoicesTask=null;});
    return v37MemberChoicesTask;
  }
  async function v37PrintIndividual(){
    const select=$('v37MemberSelect'),button=$('v37MemberPrint'),memberId=(0,__f4.globals.String)(select?.value||'');
    if(!memberId)return note('v10ReportNotice','Pilih warga terlebih dahulu.',true);
    if(button.disabled)return;
    const activeToken=token;button.disabled=true;button.textContent='Menyiapkan…';
    try{
      const report=await call('bsV37LaporanSetoranPerWarga',token,memberId);
      if(activeToken!==token||(0,__f4.globals.String)(report.wargaId)!==memberId)return;
      const root=$('v10Print');root.replaceChildren();root.append(v29Kop());
      const title=__f4.globals.document.createElement('h1');title.textContent='LAPORAN SETORAN WARGA';
      const subtitle=__f4.globals.document.createElement('p');
      subtitle.textContent=report.nama+(report.rumah?' · '+report.rumah:'')+
        ' · Seluruh riwayat · Dicetak '+new __f4.globals.Date().toLocaleDateString('id-ID');
      const fmt=n=>new __f4.globals.Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format((0,__f4.globals.Number)(n)||0);
      const summary=__f4.globals.document.createElement('p');summary.className='f4-single-member-summary';
      summary.textContent=report.jumlahSetoran+' setoran tercatat · Total '+fmt(report.totalBeratKg)+' kg';
      root.append(title,subtitle,summary,v37IndividualTrend(report.setoran||[],report.kodeBarang||[]));
      const h=__f4.globals.document.createElement('h2');h.textContent='Rincian barang disetor ('+report.jumlahSetoran+')';
      root.append(h,v37IndividualTable(report));
      const legend=f4BankMakeCodeLegend(report.kodeBarang||[]);if(legend)root.append(legend);
      const sign=__f4.globals.document.createElement('div');sign.className='f4-bank-report-signature';
      sign.textContent='Mengetahui, Humas Flamboyan 4';
      const name=__f4.globals.document.createElement('strong');name.textContent='Heri Juwandi';
      sign.append(name);root.append(sign);
      v36BankPrint(root,'admin');
    }catch(error){
      note('v10ReportNotice','Gagal mencetak setoran warga: '+(error.message||error),true);
    }finally{
      button.disabled=!select?.value;button.textContent='PDF + Grafik';
    }
  }
  function v33SetupReportControls(){
    const report=$('pageLaporan'),month=$('v10Month'),legacy=$('v10ReportType');
    if(!report||!month||!legacy||$('v33ReportControls'))return;
    const monthField=month.closest('.field'),typeField=legacy.closest('.field'),
          actions=report.querySelector('.toolbar');
    if(!monthField||!typeField||!actions)return;
    const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const now=new __f4.globals.Date(),fallback=now.getFullYear()+'-'+(0,__f4.globals.String)(now.getMonth()+1).padStart(2,'0');
    const initial=/^\d{4}-(0[1-9]|1[0-2])$/.test(month.value)?month.value:fallback;
    month.value=initial;
    const form=__f4.globals.document.createElement('section');form.id='v33ReportControls';form.className='v33-report-controls';
    // Judul halaman sudah memuat 'Laporan'; tidak perlu judul kedua dalam form.
    const row=__f4.globals.document.createElement('div');row.className='v33-report-row';
    const period=__f4.globals.document.createElement('div');period.className='v33-report-period';
    const makeTrigger=(title,id)=>{
      const group=__f4.globals.document.createElement('div');group.className='v33-report-period-group';
      const label=__f4.globals.document.createElement('label');label.textContent=title;label.htmlFor=id;
      const button=__f4.globals.document.createElement('button');button.type='button';button.id=id;
      button.className='v33-period-button';button.setAttribute('aria-haspopup','dialog');
      button.setAttribute('aria-expanded','false');
      const value=__f4.globals.document.createElement('span');
      const icon=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
      icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('width','16');icon.setAttribute('height','16');
      icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.8');
      icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');
      icon.innerHTML='<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m9 15 2 2 4-4"/>';
      button.append(value,icon);group.append(label,button);
      return {group,label,button,value};
    };
    const startPicker=makeTrigger('Bulan','v33PeriodStart');
    const endPicker=makeTrigger('Sampai bulan','v33PeriodEnd');
    endPicker.group.hidden=true;
    const endValue=__f4.globals.document.createElement('input');
    endValue.type='hidden';endValue.id='v33ReportEndValue';endValue.value=initial;
    endPicker.group.append(endValue);
    period.append(startPicker.group,endPicker.group);
    row.append(period);
    const periodLabel=value=>months[(0,__f4.globals.Number)((0,__f4.globals.String)(value).slice(5,7))-1]+' '+(0,__f4.globals.String)(value).slice(0,4);
    const refreshPickerLabels=()=>{
      startPicker.value.textContent=periodLabel(month.value);
      endPicker.value.textContent=periodLabel(endValue.value);
    };
    refreshPickerLabels();
    const combineRow=__f4.globals.document.createElement('div');combineRow.className='v33-report-combine';
    const combineLabel=__f4.globals.document.createElement('label');combineLabel.className='v33-report-combine-label';
    const combine=__f4.globals.document.createElement('input');combine.id='v33ReportCombine';combine.type='checkbox';
    const combineText=__f4.globals.document.createElement('span');combineText.textContent='Gabungkan beberapa bulan';
    combineLabel.append(combine,combineText);
    const canceledFilter=$('v29AuditFilter'),filterField=canceledFilter?.closest('.field');
    combineRow.append(combineLabel);
    if(canceledFilter){
      canceledFilter.hidden=false;canceledFilter.classList.remove('hidden');
      combineRow.append(canceledFilter);
      if(filterField)filterField.remove();
    }
    form.append(row,combineRow);
    const selections=__f4.globals.document.createElement('fieldset');selections.className='v33-report-choices';
    const legend=__f4.globals.document.createElement('legend');legend.textContent='Jenis data laporan';
    selections.append(legend);
    const list=__f4.globals.document.createElement('div');list.className='v33-report-chips';
    for(const [key,spec] of __f4.globals.Object.entries(v10Specs)){
      const label=__f4.globals.document.createElement('label');label.className='v33-report-chip';
      const checkbox=__f4.globals.document.createElement('input');checkbox.type='checkbox';checkbox.value=key;
      checkbox.dataset.reportSection='1';checkbox.checked=true;
      const text=__f4.globals.document.createElement('span');
      const shortLabels={setoran:'Setoran',penjualan:'Penjualan',pengeluaran:'Biaya',mutasi:'Tabungan',setoranBank:'Setoran bank'};
      text.textContent=shortLabels[key]||spec.title;
      checkbox.setAttribute('aria-label',spec.title);
      label.append(checkbox,text);list.append(label);
    }
    selections.append(list);
    const options=__f4.globals.document.createElement('details');options.className='v33-report-options';
    const optionsLabel=__f4.globals.document.createElement('summary');optionsLabel.textContent='Pilih data';
    options.append(optionsLabel);
    const foot=__f4.globals.document.createElement('div');foot.className='v33-report-choice-foot';
    const count=__f4.globals.document.createElement('small');count.id='v33SelectedCount';count.setAttribute('aria-live','polite');
    const all=__f4.globals.document.createElement('button');all.type='button';all.id='v33SelectAll';all.textContent='Pilih semua';
    all.className='secondary';
    all.onclick=()=>{list.querySelectorAll('input[data-report-section]').forEach(x=>x.checked=true);updateChoice();};
    foot.append(count,all);selections.append(foot);options.append(selections);
    monthField.hidden=true;monthField.style.display='none';
    typeField.hidden=true;typeField.style.display='none';
    legacy.value='semua';
    actions.classList.add('v33-report-actions','f4-control-actions');
    const loadButton=actions.querySelector('button[onclick*="v10LoadReport"]');
    const printButton=actions.querySelector('button[onclick*="v10PrintReport"]');
    if(loadButton)loadButton.textContent='Muat Laporan';
    if(printButton)printButton.textContent='Unduh PDF';
    // Cetak dan ekspor berada di atas posisi dana, grafik, dan rincian.
    const heading=report.querySelector(':scope > h2');
    if(heading){heading.textContent='Laporan Bank Sampah';report.prepend(heading);heading.after(form);}
    else report.prepend(form);
    // Put existing controls and the live finance card side by side on PC.
    // Keep their original nodes, handlers, API requests and report data.
    const finance=$('v17Finance');
    if(finance){
      const overview=__f4.globals.document.createElement('div');overview.id='f4BankAdminReportOverview';
      overview.className='f4-bank-report-overview';
      if(heading)heading.after(overview);else report.prepend(overview);
      overview.append(form,finance);
    }
    // Existing API/print handlers remain attached to their original buttons.
    // Feedback for load/print errors stays visible beside the report actions.
    // Independent print tool; it never narrows the normal admin report tables.
    const individual=__f4.globals.document.createElement('section');individual.className='f4-single-member-control';
    const memberHeading=__f4.globals.document.createElement('strong');memberHeading.textContent='PDF setoran per warga';
    const memberInfo=__f4.globals.document.createElement('small');memberInfo.textContent='Seluruh riwayat + grafik per penimbangan';
    const memberFields=__f4.globals.document.createElement('div');memberFields.className='f4-single-member-fields';
    const memberSelect=__f4.globals.document.createElement('select');memberSelect.id='v37MemberSelect';
    memberSelect.setAttribute('aria-label','Pilih warga untuk laporan setoran');
    memberSelect.append(new __f4.globals.Option('Pilih warga',''));
    const memberPrint=__f4.globals.document.createElement('button');memberPrint.type='button';
    memberPrint.id='v37MemberPrint';memberPrint.textContent='PDF + Grafik';memberPrint.disabled=true;
    memberSelect.addEventListener('change',()=>{memberPrint.disabled=!memberSelect.value;});
    memberSelect.addEventListener('focus',()=>v37FillMemberChoices().catch(error=>
      note('v10ReportNotice','Gagal memuat warga: '+(error.message||error),true)));
    memberPrint.addEventListener('click',v37PrintIndividual);
    memberFields.append(memberSelect,memberPrint);
    individual.append(memberHeading,memberInfo,memberFields);
    form.append(options,actions,individual);
    const notice=$('v10ReportNotice');
    if(notice)form.append(notice);
    // A single results surface groups the summary and transaction accordions.
    // Dynamic details (v33ReportMore) are inserted after the unchanged summary node.
    const summary=$('v10ReportSummary'),table=$('v10ReportTable');
    if(summary&&table&&!$('f4BankReportResults')){
      const results=__f4.globals.document.createElement('section');
      results.id='f4BankReportResults';
      results.className='f4-bank-report-results';
      results.setAttribute('aria-label','Ringkasan dan rincian laporan');
      summary.before(results);
      results.append(summary);
      const existingDetails=$('v33ReportMore');
      if(existingDetails)results.append(existingDetails);
      results.append(table);
    }
    const invalidate=()=>{
      v10ReportData=null;
      $('v10ReportSummary')?.replaceChildren();
      $('v33ReportMore')?.remove();
      if($('v10ReportTable'))$('v10ReportTable').textContent='Pilih “Muat laporan” untuk menampilkan periode baru.';
      if($('v10ReportNotice'))$('v10ReportNotice').textContent='';
    };
    const maxRangeEnd=start=>{
      const index=(0,__f4.globals.Number)(start.slice(0,4))*12+(0,__f4.globals.Number)(start.slice(5,7))-1;
      const last=__f4.globals.Math.min(2046*12+11,index+23);
      return (0,__f4.globals.String)(__f4.globals.Math.floor(last/12))+'-'+(0,__f4.globals.String)(last%12+1).padStart(2,'0');
    };
    const setPeriod=(kind,value)=>{
      if(kind==='start'){
        if(month.value!==value){
          month.value=value;
          month.dispatchEvent(new __f4.globals.Event('change',{bubbles:true}));
        }
        if(endValue.value<value||endValue.value>maxRangeEnd(value))endValue.value=value;
      }else endValue.value=value;
      refreshPickerLabels();invalidate();
    };
    let dismissPicker=()=>{};
    const openPicker=(kind,trigger)=>{
      dismissPicker();
      const isEnd=kind==='end';
      const current=isEnd?endValue.value:month.value;
      const min=isEnd?month.value:'2026-01';
      const max=isEnd?maxRangeEnd(month.value):'2046-12';
      let displayYear=(0,__f4.globals.Number)(current.slice(0,4));
      const popup=__f4.globals.document.createElement('section');popup.className='v33-month-popover';
      popup.setAttribute('role','dialog');popup.setAttribute('aria-label',isEnd?'Pilih bulan akhir':'Pilih bulan laporan');
      const head=__f4.globals.document.createElement('div');head.className='v33-month-head';
      const prev=__f4.globals.document.createElement('button');prev.type='button';prev.className='v33-month-arrow';
      prev.setAttribute('aria-label','Tahun sebelumnya');
      const makeArrow=(back)=>{
        const svg=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','17');
        svg.setAttribute('height','17');svg.setAttribute('fill','none');
        svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2');
        svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
        const path=__f4.globals.document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d',back?'m15 18-6-6 6-6':'m9 18 6-6-6-6');
        svg.append(path);return svg;
      };
      prev.append(makeArrow(true));
      const yearTitle=__f4.globals.document.createElement('strong');
      const next=__f4.globals.document.createElement('button');next.type='button';next.className='v33-month-arrow';
      next.setAttribute('aria-label','Tahun berikutnya');next.append(makeArrow(false));
      const grid=__f4.globals.document.createElement('div');grid.className='v33-month-grid';
      head.append(prev,yearTitle,next);popup.append(head,grid);
      __f4.globals.document.body.append(popup);trigger.setAttribute('aria-expanded','true');
      const position=()=>{
        if(!popup.isConnected)return;
        const rect=trigger.getBoundingClientRect(),w=popup.offsetWidth,h=popup.offsetHeight;
        const vw=__f4.globals.document.documentElement.clientWidth,vh=__f4.window.innerHeight;
        popup.style.left=__f4.globals.Math.max(8,__f4.globals.Math.min(rect.left,vw-w-8))+'px';
        const below=vh-rect.bottom-8;
        const top=below>=h||below>=rect.top-8?rect.bottom+5:rect.top-h-5;
        popup.style.top=__f4.globals.Math.max(8,__f4.globals.Math.min(top,vh-h-8))+'px';
      };
      const onOutside=event=>{
        if(!popup.contains(event.target)&&!trigger.contains(event.target))close();
      };
      const onKey=event=>{if(event.key==='Escape'){event.preventDefault();close();trigger.focus({preventScroll:true});}};
      const onScroll=event=>{if(!popup.contains(event.target))close();};
      const close=()=>{
        __f4.globals.document.removeEventListener('pointerdown',onOutside,true);
        __f4.globals.document.removeEventListener('keydown',onKey,true);
        __f4.window.removeEventListener('scroll',onScroll,true);
        __f4.window.removeEventListener('resize',position);
        popup.remove();trigger.setAttribute('aria-expanded','false');
        if(dismissPicker===close)dismissPicker=()=>{};
      };
      dismissPicker=close;
      function render(){
        yearTitle.textContent=(0,__f4.globals.String)(displayYear);
        prev.disabled=displayYear<=(0,__f4.globals.Number)(min.slice(0,4));
        next.disabled=displayYear>=(0,__f4.globals.Number)(max.slice(0,4));
        grid.replaceChildren();
        months.forEach((name,index)=>{
          const value=displayYear+'-'+(0,__f4.globals.String)(index+1).padStart(2,'0');
          const option=__f4.globals.document.createElement('button');
          option.type='button';option.textContent=name.slice(0,3);
          option.disabled=value<min||value>max;
          option.classList.toggle('is-selected',value===current);
          option.setAttribute('aria-pressed',(0,__f4.globals.String)(value===current));
          option.title=name+' '+displayYear;
          option.addEventListener('click',()=>{
            setPeriod(kind,value);close();trigger.focus({preventScroll:true});
          });
          grid.append(option);
        });
        position();
      }
      prev.addEventListener('click',()=>{if(displayYear>(0,__f4.globals.Number)(min.slice(0,4))){displayYear--;render();}});
      next.addEventListener('click',()=>{if(displayYear<(0,__f4.globals.Number)(max.slice(0,4))){displayYear++;render();}});
      __f4.globals.document.addEventListener('pointerdown',onOutside,true);
      __f4.globals.document.addEventListener('keydown',onKey,true);
      __f4.window.addEventListener('scroll',onScroll,true);
      __f4.window.addEventListener('resize',position);
      render();
    };
    startPicker.button.addEventListener('click',()=>openPicker('start',startPicker.button));
    endPicker.button.addEventListener('click',()=>openPicker('end',endPicker.button));
    const updateRange=()=>{
      dismissPicker();
      endPicker.group.hidden=!combine.checked;
      period.classList.toggle('is-range',combine.checked);
      startPicker.label.textContent=combine.checked?'Dari bulan':'Bulan';
      refreshPickerLabels();invalidate();
    };
    combine.addEventListener('change',updateRange);
    const updateChoice=()=>{
      const total=list.querySelectorAll('input[data-report-section]:checked').length;
      optionsLabel.textContent='Data ('+total+'/'+__f4.globals.Object.keys(v10Specs).length+')';
      count.textContent=total+' dari '+__f4.globals.Object.keys(v10Specs).length+' jenis data dipilih';
      all.hidden=total===__f4.globals.Object.keys(v10Specs).length;
      if(total===0)count.textContent='Pilih minimal 1 jenis data';
      if(v10ReportData)v10RenderReport();
    };
    list.addEventListener('change',updateChoice);
    // Prevent printing/downloading with an empty selection, including keyboard use.
    actions.addEventListener('click',e=>{
      const button=e.target.closest('button');
      if(!button||button===actions.querySelector('button:first-child'))return;
      if(!list.querySelector('input[data-report-section]:checked')){
        e.preventDefault();e.stopImmediatePropagation();
        note('v10ReportNotice','Pilih minimal satu jenis data sebelum mencetak atau mengunduh.',true);
      }
    },true);
    updateChoice();
    const desc=report.querySelector(':scope > .desc');
    if(desc)desc.remove();
  }
  v29SetupAudit();
  v33SetupReportControls();

});
