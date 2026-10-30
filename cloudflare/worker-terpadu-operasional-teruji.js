var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/unified_api.js
var J = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
var ok = /* @__PURE__ */ __name((payload, status = 200) => new Response(JSON.stringify({ ok: true, ...payload }), { status, headers: J }), "ok");
var err = /* @__PURE__ */ __name((message, status = 400) => new Response(JSON.stringify({ ok: false, error: message }), { status, headers: J }), "err");
var admin = /* @__PURE__ */ __name((who) => !who ? err("Silakan login.", 401) : !["admin", "superadmin"].includes(who.role) ? err("Khusus pengelola.", 403) : null, "admin");
var superadmin = /* @__PURE__ */ __name((who) => !who ? err("Silakan login.", 401) : who.role !== "superadmin" ? err("Khusus superadmin.", 403) : null, "superadmin");
var integer = /* @__PURE__ */ __name((v) => Number.isSafeInteger(v) && v >= 0, "integer");
var validDate = /* @__PURE__ */ __name((v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + "T00:00:00Z")) && (/* @__PURE__ */ new Date(v + "T00:00:00Z")).toISOString().slice(0, 10) === v, "validDate");
var validMonth = /* @__PURE__ */ __name((s) => /^20\d{2}-(?:0[1-9]|1[0-2])$/.test(s || ""), "validMonth");
var paramLimit = /* @__PURE__ */ __name((u, max = 250) => { const raw = u.searchParams.get("limit"); const n = raw === null || raw.trim() === "" ? 100 : Number(raw); return Math.min(max, Math.max(1, Number.isSafeInteger(n) ? n : 100)); }, "paramLimit");
var list = /* @__PURE__ */ __name(async (db, sql, params = []) => {
  const q = db.prepare(sql).bind(...params);
  const r = await q.all();
  return r.results || [];
}, "list");
var one = /* @__PURE__ */ __name(async (db, sql, params = []) => db.prepare(sql).bind(...params).first(), "one");
var body = /* @__PURE__ */ __name(async (req) => {
  if (!/^application\/json\b/i.test(req.headers.get("content-type") || "")) throw Error("Harus menggunakan JSON.");
  if (Number(req.headers.get("content-length") || 0) > 2e4) throw Error("Permintaan terlalu besar.");
  const raw = await req.text();
  if (raw.length > 2e4) throw Error("Permintaan terlalu besar.");
  const p = JSON.parse(raw);
  if (!p || typeof p !== "object" || Array.isArray(p)) throw Error("Objek JSON diperlukan.");
  return p;
}, "body");
function guardedWrite(who, env) {
  const denial = admin(who);
  return denial || (env.BANK_WRITE_ENABLED === "true" ? null : err("Transaksi Bank Sampah belum diaktifkan pada staging.", 503));
}
__name(guardedWrite, "guardedWrite");
var urlSafe = /* @__PURE__ */ __name((url) => typeof url === "string" && /^https:\/\//i.test(url) ? url : null, "urlSafe");
var sha = /* @__PURE__ */ __name(async (str) => {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(h)].map((v) => v.toString(16).padStart(2, "0")).join("");
}, "sha");
var periodFilter = /* @__PURE__ */ __name((u) => {
  const s = u.searchParams.get("month");
  if (!s) return null;
  if (!validMonth(s)) throw Error("Bulan wajib YYYY-MM.");
  return s;
}, "periodFilter");
async function publicPortal(db) {
  const [agenda, banners, projects, inventory, meetings, documentation, orderSummary, contributionSummary, cashSummary] = await Promise.all([
    list(db, `SELECT id,title,starts_on,ends_on,location,description,status FROM portal_agenda WHERE visibility='publik' ORDER BY starts_on DESC LIMIT 40`),
    list(db, `SELECT id,title,image_ref,target_url FROM portal_banners WHERE active=1 ORDER BY sort_order,id LIMIT 20`),
    list(db, `SELECT id,title,description,image_ref,target_url,project_kind,fund_source,fund_target_rp,linked_key,sort_order FROM portal_project_cards WHERE active=1 ORDER BY sort_order,id LIMIT 60`),
    list(db, `SELECT id,name,description,quantity,unit,photo_ref,category FROM portal_inventory WHERE visibility='publik' ORDER BY rowid DESC LIMIT 250`),
    list(db, `SELECT id,title,meeting_on,summary,document_ref FROM portal_meeting_records WHERE visibility='publik' ORDER BY meeting_on DESC LIMIT 50`),
    list(db, `SELECT id,event_on,title,description,drive_url,category FROM portal_documentation WHERE visibility='publik' AND active=1 ORDER BY event_on DESC,sort_order LIMIT 100`),
    list(db, `SELECT project_id,COUNT(*) AS jumlah,COALESCE(SUM(amount_due_rp),0) AS tagihanRp,COALESCE(SUM(paid_rp),0) AS diterimaRp,COALESCE(SUM(CASE WHEN amount_due_rp>0 AND paid_rp>=amount_due_rp THEN 1 ELSE 0 END),0) AS lunas FROM portal_project_orders WHERE status='aktif' GROUP BY project_id`),
    list(db, `SELECT project_id,COUNT(*) AS jumlah,COALESCE(SUM(amount_rp),0) AS diterimaRp FROM portal_project_contributions WHERE status='aktif' GROUP BY project_id`),
    list(db, `SELECT category,COALESCE(SUM(debit_rp),0) AS masukRp,COALESCE(SUM(credit_rp),0) AS keluarRp FROM bookkeeping_cash_transactions_posted WHERE status='aktif' AND category IS NOT NULL GROUP BY category`)
  ]);
  // Arisan & Jersey were the last public Sheets CSV datasets. Absent migration
  // tables yield empty arrays instead of making the rest of Portal unavailable.
  const [arisan,jerseyBapak,jerseyIbu]=await Promise.all([
    list(db,"SELECT period_on,host_name,status FROM portal_arisan_schedule ORDER BY period_on LIMIT 200").catch(()=>[]),
    list(db,"SELECT sort_order,resident,sleeves,size,printed_name,payment_status,nominal_rp,method FROM portal_jersey_orders WHERE group_key='bapak' ORDER BY sort_order LIMIT 200").catch(()=>[]),
    list(db,"SELECT sort_order,resident,sleeves,size,printed_name,payment_status,nominal_rp,method FROM portal_jersey_orders WHERE group_key='ibu' ORDER BY sort_order LIMIT 200").catch(()=>[])
  ]);
  const ordersByProject=new Map(orderSummary.map(r=>[r.project_id,r]));
  const fundsByProject=new Map(contributionSummary.map(r=>[r.project_id,r]));
  const kasByCategory=new Map(cashSummary.map(r=>[String(r.category||"").trim().toLowerCase(),r]));
  const publicProjects=projects.map(p=>{
    const kind=String(p.project_kind||"informasi"),order=ordersByProject.get(p.id),funds=fundsByProject.get(p.id);
    const cash=kasByCategory.get(String(p.fund_source||"").trim().toLowerCase());
    return {...p,ringkasan:{
      jumlahPesanan:kind==="pesanan"?Number(order?.jumlah||0):0,
      lunas:kind==="pesanan"?Number(order?.lunas||0):0,
      totalTagihanRp:kind==="pesanan"?Number(order?.tagihanRp||0):0,
      danaMasukRp:kind==="pesanan"?Number(order?.diterimaRp||0):
        kind==="penggalangan"?Number(funds?.diterimaRp||0):
        kind==="kas"&&p.fund_source?Number(cash?.masukRp||0):0,
      danaKeluarRp:kind==="kas"&&p.fund_source?Number(cash?.keluarRp||0):0,
      jumlahKontributor:kind==="penggalangan"?Number(funds?.jumlah||0):0
    }};
  });
  return ok({agenda,banners,projects:publicProjects,inventory,meetings,documentation,arisan,jerseyBapak,jerseyIbu});
}
__name(publicPortal, "publicPortal");
// Public transparency report: read only, from the authoritative active D1 cash journal.
// No superadmin reports are exposed; only date, cash category and amounts as in the
// existing publicly displayed Kas Lingkungan report.
async function publicPortalCash(db){
  const found=await db.prepare(`SELECT id,occurred_on,transaction_type,category,debit_rp,credit_rp,note,payment_method
    FROM bookkeeping_cash_transactions_posted WHERE status='aktif'
    ORDER BY occurred_on DESC,id DESC LIMIT 1001`).all();
  const source=found.results||[];
  if(source.length>1000)return err("Laporan Kas D1 melebihi batas; jangan tampilkan saldo parsial.",503);
  if(!source.length)return err("Riwayat Kas belum tersedia di database D1.",503);
  const rows=source.map(x=>({
    idTransaksi:x.id,tanggal:x.occurred_on,jenis:Number(x.debit_rp)>0?"Debit":"Kredit",
    kategori:x.category||"",keterangan:x.note||x.category||"",
    debit:Number(x.debit_rp||0),kredit:Number(x.credit_rp||0),
    catatan:"",metode:x.payment_method||"",sumber:"Cloudflare D1"
  }));
  if(rows.some(x=>!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(x.tanggal)||!Number.isSafeInteger(x.debit)||!Number.isSafeInteger(x.kredit)||x.debit<0||x.kredit<0||
    (x.debit>0&&x.kredit>0)||(x.debit===0&&x.kredit===0)))
    return err("Jurnal Kas memerlukan pemeriksaan sebelum laporan publik diterbitkan.",409);
  return ok({data:{rows,jumlahTransaksi:rows.length,source:"cloudflare-d1"},readOnly:true});
}
__name(publicPortalCash,"publicPortalCash");
async function publicBank(db) {
  const [catalog, albums, progress, inventory, overview, monthlyWeights] = await Promise.all([
    list(db, `SELECT i.id,i.name,i.category,i.unit, p.citizen_rate_rp_per_kg AS priceRpPerKg,p.effective_from AS effectiveFrom FROM waste_items i LEFT JOIN waste_prices p ON p.id=(SELECT p2.id FROM waste_prices p2 WHERE p2.waste_item_id=i.id ORDER BY p2.effective_from DESC,p2.id DESC LIMIT 1) WHERE i.active=1 ORDER BY i.category,i.name`),
    list(db, `SELECT a.id,a.title,a.category,a.event_on,a.description,COUNT(m.id) AS mediaCount,(SELECT cm.external_url FROM album_media cm WHERE cm.album_id=a.id AND cm.media_type='foto' AND cm.status='aktif' AND cm.external_url IS NOT NULL ORDER BY cm.sort_order,cm.id LIMIT 1) AS coverUrl FROM albums a LEFT JOIN album_media m ON m.album_id=a.id AND m.status='aktif' WHERE a.visibility='publik' AND a.status='aktif' GROUP BY a.id ORDER BY a.event_on DESC,a.id DESC LIMIT 80`),
    list(db, `SELECT p.id,p.happened_on,p.title,p.stage,p.description,p.status,p.next_step,pm.photo_url AS photoUrl FROM progress_entries p LEFT JOIN bank_progress_photos pm ON pm.progress_id=p.id WHERE p.public_visible=1 ORDER BY p.happened_on DESC,p.id DESC LIMIT 70`),
    list(db, `SELECT i.id,i.name,i.quantity,i.unit,i.condition,im.external_url AS photoUrl
    FROM inventory i LEFT JOIN inventory_external_media im ON im.inventory_id=i.id
    WHERE i.active=1 AND i.category='bank_sampah' ORDER BY i.name LIMIT 150`),
    one(db, `SELECT (SELECT COUNT(*) FROM waste_deposits WHERE status='terkonfirmasi') AS confirmedDeposits,(SELECT COUNT(*) FROM members WHERE status='aktif') AS activeMembers,(SELECT COALESCE(SUM(sl.grams),0)/1000.0 FROM waste_sale_lines sl JOIN waste_sales sa ON sa.id=sl.sale_id JOIN waste_batches b ON b.id=sa.batch_id WHERE sa.status='terkonfirmasi' AND b.status='disahkan') AS confirmedWeightKg,
    (SELECT COALESCE(SUM(total_grams),0)/1000.0 FROM waste_deposits WHERE status='terkonfirmasi') AS weighedConfirmedKg,(SELECT COALESCE(SUM(sl.grams),0)/1000.0 FROM waste_sale_lines sl JOIN waste_sales sa ON sa.id=sl.sale_id WHERE sa.status='terkonfirmasi') AS confirmedSalesWeightKg,(SELECT COUNT(*) FROM waste_items WHERE active=1) AS activeItems,(SELECT COUNT(*) FROM albums WHERE visibility='publik' AND status='aktif') AS albumCount`),
    list(db, `SELECT substr(s.sold_on,1,7) AS month,COALESCE(SUM(l.grams),0)/1000.0 AS beratKg
      FROM waste_sale_lines l JOIN waste_sales s ON s.id=l.sale_id
      JOIN waste_batches b ON b.id=s.batch_id AND b.status='disahkan'
      WHERE s.status='terkonfirmasi'
      GROUP BY substr(s.sold_on,1,7) ORDER BY month DESC LIMIT 12`)
  ]);
  return ok({ catalog, albums:albums.map(a=>({...a,coverUrl:urlSafe(a.coverUrl)})), progress:progress.map(p=>({...p,photoUrl:urlSafe(p.photoUrl)})), monthlyWeights: monthlyWeights.slice().reverse(), inventory: inventory.map((x) => ({
    ...x,
    photoUrl: urlSafe(x.photoUrl)
  })), overview });
}
__name(publicBank, "publicBank");
async function publicBankReport(db, url) {
  const month=periodFilter(url);
  // One row per confirmed batch. Avoid multiplying totals by joining deposit lines
  // to sale lines. This endpoint is PUBLIC and contains no member identities.
  const [sales,expenses,pending]=await Promise.all([
    list(db,`SELECT substr(s.sold_on,1,7) AS periode,COUNT(*) AS batch,
      COALESCE(SUM(a.received_rp),0) AS hasilPenjualan,
      COALESCE(SUM(a.citizen_rights_rp),0) AS hakWarga,
      COALESCE(SUM(a.reserve_rp),0) AS cadangan,
      COALESCE(SUM(a.neighborhood_rp),0) AS kasLorong,
      COALESCE(SUM(a.operation_rp),0) AS operasional,
      COALESCE(SUM((SELECT COALESCE(SUM(l.grams),0)/1000.0
        FROM waste_sale_lines l WHERE l.sale_id=s.id)),0) AS beratKg
      FROM waste_allocations a
      JOIN waste_batches b ON b.id=a.batch_id AND b.status='disahkan'
      JOIN waste_sales s ON s.batch_id=a.batch_id AND s.status='terkonfirmasi'
      GROUP BY substr(s.sold_on,1,7) ORDER BY periode`),
    list(db,`SELECT substr(incurred_on,1,7) AS periode,COALESCE(SUM(amount_rp),0) AS pengeluaran
      FROM waste_expenses WHERE status='lunas'
      GROUP BY substr(incurred_on,1,7) ORDER BY periode`),
    list(db,`SELECT substr(d.deposited_on,1,7) AS periode,COUNT(*) AS pendingCount,
      COALESCE(SUM(d.estimated_total_rp),0) AS pendingEstimateRp,
      COALESCE(SUM(d.total_grams),0)/1000.0 AS pendingWeightKg
      FROM waste_deposits d JOIN waste_batches b ON b.id=d.batch_id
      WHERE d.status='estimasi' AND b.status IN ('draft','siap')
      GROUP BY substr(d.deposited_on,1,7) ORDER BY periode`)
  ]);
  const byMonth=new Map();
  const ensure=m=>{
    if(!byMonth.has(m))byMonth.set(m,{periode:m,batch:0,beratKg:0,hasilPenjualan:0,hakWarga:0,
      cadangan:0,kasLorong:0,operasional:0,pengeluaran:0,pendingCount:0,pendingEstimateRp:0,pendingWeightKg:0});
    return byMonth.get(m);
  };
  for(const r of sales){
    const row=ensure(r.periode);
    for(const k of ['batch','beratKg','hasilPenjualan','hakWarga','cadangan','kasLorong','operasional'])
      row[k]=Number(r[k]||0);
    if(!Number.isSafeInteger(row.hasilPenjualan)||row.hasilPenjualan<0||
      row.hakWarga+row.cadangan+row.kasLorong+row.operasional!==row.hasilPenjualan)
      return err('Alokasi hasil penjualan memerlukan rekonsiliasi sebelum ditampilkan.',409);
  }
  for(const r of expenses)ensure(r.periode).pengeluaran=Number(r.pengeluaran||0);
  for(const r of pending){
    const row=ensure(r.periode);
    row.pendingCount=Number(r.pendingCount||0);
    row.pendingEstimateRp=Number(r.pendingEstimateRp||0);
    row.pendingWeightKg=Number(r.pendingWeightKg||0);
    if(!Number.isSafeInteger(row.pendingEstimateRp)||row.pendingEstimateRp<0)
      return err('Estimasi setoran belum dapat diperiksa.',409);
  }
  const periodeTersedia=[...byMonth.keys()].sort().reverse();
  const bulanan=periodeTersedia.filter(m=>!month||m===month).map(m=>byMonth.get(m));
  const summary={batch:0,beratKg:0,hasilPenjualan:0,hakWarga:0,cadangan:0,kasLorong:0,operasional:0,pengeluaran:0,pendingCount:0,pendingEstimateRp:0,pendingWeightKg:0};
  for(const row of bulanan)for(const key of Object.keys(summary))summary[key]+=row[key];
  return ok({period:month||'semua',ringkasan:summary,bulanan,periodeTersedia,
    readOnly:true,source:'cloudflare-d1',
    notice:'Hasil jual hanya dari transaksi sah. Perkiraan menunggu disajikan terpisah dan tidak masuk saldo.'});
}
__name(publicBankReport, "publicBankReport");
async function publicAlbum(db, id) {
  const album = await one(db, `SELECT id,title,category,event_on,description FROM albums WHERE id=? AND visibility='publik' AND status='aktif'`, [id]);
  if (!album) return err("Album tidak ditemukan.", 404);
  const media = await list(db, `SELECT id,media_type,caption,external_url,sort_order,CASE WHEN storage_key IS NULL THEN 0 ELSE 1 END AS hasStoredMedia FROM album_media WHERE album_id=? AND status='aktif' ORDER BY sort_order,id`, [id]);
  return ok({ album, media: media.map((m) => ({ ...m, external_url: urlSafe(m.external_url), mediaUrl: m.hasStoredMedia ? "/api/v2/public/bank/media/" + encodeURIComponent(m.id) : null })) });
}
__name(publicAlbum, "publicAlbum");
async function publicAlbumMedia(env, id) {
  if (!env.PHOTOS) return err("Penyimpanan media tidak tersedia.", 503);
  const media = await one(env.DB, `SELECT m.storage_key FROM album_media m JOIN albums a ON a.id=m.album_id WHERE m.id=? AND m.status='aktif' AND a.visibility='publik' AND a.status='aktif'`, [id]);
  if (!media?.storage_key) return err("Media tidak tersedia.", 404);
  const obj = await env.PHOTOS.get(media.storage_key);
  if (!obj) return err("Media tidak ditemukan di penyimpanan.", 404);
  const type = obj.httpMetadata?.contentType || "";
  if (!/^image\/(jpeg|png|webp|gif)$/.test(type)) return err("Jenis media belum didukung.", 415);
  return new Response(obj.body, { headers: { "content-type": type, "cache-control": "public, max-age=3600", "x-content-type-options": "nosniff" } });
}
__name(publicAlbumMedia, "publicAlbumMedia");
async function adminBank(db, url) {
  const kind = url.pathname.split("/").pop(), limit = paramLimit(url, 300);
  const tables = {
    catalog: `SELECT i.id,i.name,i.category,i.unit,i.active,p.citizen_rate_rp_per_kg AS priceRpPerKg,p.effective_from AS effectiveFrom FROM waste_items i LEFT JOIN waste_prices p ON p.id=(SELECT p2.id FROM waste_prices p2 WHERE p2.waste_item_id=i.id ORDER BY p2.effective_from DESC,p2.id DESC LIMIT 1) ORDER BY i.category,i.name LIMIT ?`,
    members: `SELECT m.id,m.display_name AS nama,h.house_code AS rumah,m.status FROM members m LEFT JOIN households h ON h.id=m.household_id ORDER BY m.display_name LIMIT ?`,
    batches: `SELECT b.id,b.label,b.status,b.confirmed_at,COUNT(d.id) AS deposits,COALESCE(SUM(CASE WHEN d.status!='dibatalkan' THEN d.total_grams ELSE 0 END),0) AS grams,COALESCE(SUM(CASE WHEN d.status!='dibatalkan' THEN d.estimated_total_rp ELSE 0 END),0) AS estimatedRp FROM waste_batches b LEFT JOIN waste_deposits d ON d.batch_id=b.id GROUP BY b.id ORDER BY b.id DESC LIMIT ?`,
    deposits: `SELECT d.id,d.deposited_on,d.batch_id,d.member_id,m.display_name AS memberName,d.status,d.total_grams,d.estimated_total_rp,
      (SELECT sold_on FROM waste_sales s WHERE s.batch_id=d.batch_id AND s.status='terkonfirmasi' ORDER BY s.sold_on DESC LIMIT 1) AS sold_on
      FROM waste_deposits d JOIN members m ON m.id=d.member_id ORDER BY d.deposited_on DESC,d.id DESC LIMIT ?`,
    sales: `SELECT s.id,s.batch_id,s.sold_on,s.buyer_name,s.amount_gross_rp,s.amount_received_rp,s.status,
      COALESCE(r.receipt_no,'') AS receipt_no,COALESCE(r.evidence_url,'') AS evidence_url
      FROM waste_sales s LEFT JOIN waste_sale_receipts r ON r.sale_id=s.id
      ORDER BY s.sold_on DESC,s.id DESC LIMIT ?`,
    ledger: `SELECT id,member_id,transaction_on,kind,amount_rp,batch_id,reference_id,note FROM waste_savings_ledger ORDER BY transaction_on DESC,id DESC LIMIT ?`,
    allocations: `SELECT a.id,a.batch_id,b.label AS batchLabel,b.status AS batchStatus,a.received_rp AS receivedRp,a.citizen_rights_rp AS citizenRightsRp,a.reserve_rp AS reserveRp,a.neighborhood_rp AS neighborhoodRp,a.operation_rp AS operationRp,a.adjustment_rp AS adjustmentRp,a.created_at FROM waste_allocations a JOIN waste_batches b ON b.id=a.batch_id WHERE b.status='disahkan' ORDER BY a.created_at DESC,a.id DESC LIMIT ?`,
    savings: `SELECT s.member_id,m.display_name AS memberName,h.house_code AS houseCode,COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit') THEN s.amount_rp ELSE -s.amount_rp END),0) AS balanceRp FROM waste_savings_ledger s JOIN members m ON m.id=s.member_id LEFT JOIN households h ON h.id=m.household_id GROUP BY s.member_id ORDER BY m.display_name LIMIT ?`,
    expenses: `SELECT id,incurred_on,kind,budget_post,description,amount_rp,status,vendor FROM waste_expenses ORDER BY incurred_on DESC,id DESC LIMIT ?`,
    cash: `SELECT id,occurred_on,transaction_type,fund_position,cash_in_rp,cash_out_rp,status,note FROM waste_cash_ledger ORDER BY occurred_on DESC,id DESC LIMIT ?`,
    albums: `SELECT id,title,category,event_on,description,visibility,status FROM albums ORDER BY event_on DESC,id DESC LIMIT ?`,
    progress: `SELECT p.id,p.happened_on,p.title,p.stage,p.description,p.status,p.next_step,p.public_visible,pm.photo_url AS photoUrl FROM progress_entries p LEFT JOIN bank_progress_photos pm ON pm.progress_id=p.id ORDER BY p.happened_on DESC,p.id DESC LIMIT ?`,
    inventory: `SELECT id,name,quantity,unit,category,location,condition,active FROM inventory ORDER BY name LIMIT ?`
  };
  if (!tables[kind]) return null;
  const data=await list(db,tables[kind],[limit]);
  if(kind!=='deposits')return ok({data,limit});
  // Angka sah per setoran berasal dari kredit jurnal warga pada batch disahkan.
  // Untuk satu warga beberapa setoran: persis pembagian yang dipakai pada laporan pribadinya.
  const batchIds=[...new Set(data.filter(x=>x.status==='terkonfirmasi').map(x=>x.batch_id).filter(Boolean))];
  const actual=new Map();
  const finalGrams=await f4ConfirmedDepositGrams(db,batchIds);
  if(batchIds.length){
    const placeholders=batchIds.map(()=>'?').join(',');
    const confirmed=await list(db,`SELECT d.id,d.member_id,d.batch_id,d.estimated_total_rp,
      COALESCE(credits.credit_count,0) AS credit_count,COALESCE(credits.credit_rp,0) AS credit_rp
      FROM waste_deposits d JOIN waste_batches b ON b.id=d.batch_id
      JOIN waste_allocations a ON a.batch_id=d.batch_id
      JOIN waste_sales s ON s.batch_id=d.batch_id AND s.status='terkonfirmasi'
      LEFT JOIN (SELECT member_id,batch_id,COUNT(*) AS credit_count,SUM(amount_rp) AS credit_rp
        FROM waste_savings_ledger WHERE kind='kredit' GROUP BY member_id,batch_id) credits
        ON credits.member_id=d.member_id AND credits.batch_id=d.batch_id
      WHERE d.status='terkonfirmasi' AND b.status='disahkan'
        AND d.batch_id IN (${placeholders})
      ORDER BY d.batch_id,d.member_id,d.id`,batchIds);
    const groups=new Map();
    for(const x of confirmed){
      const key=x.batch_id+'|'+x.member_id;
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(x);
    }
    for(const rows of groups.values()){
      if(Number(rows[0].credit_count)!==1)continue;
      const portions=f4ShareConfirmedSavings(rows,Number(rows[0].credit_rp));
      if(portions)for(const x of portions)actual.set(x.id,x.nilaiSahRp);
    }
  }
  return ok({data:data.map(d=>({...d,
    nilaiSahRp:actual.has(d.id)?actual.get(d.id):null,
    beratSahGram:finalGrams.has(d.id)?finalGrams.get(d.id):null
  })),limit});
}
__name(adminBank, "adminBank");
async function detailBank(db, url) {
  if (!["/api/v2/admin/bank/deposit-detail", "/api/v2/admin/bank/sale-detail"].includes(url.pathname)) return null;
  const id = url.searchParams.get("id");
  if (!id || id.length > 128) return err("ID tidak valid.", 400);
  if (url.pathname === "/api/v2/admin/bank/deposit-detail") {
    const deposit = await one(db, `SELECT d.*,m.display_name AS memberName FROM waste_deposits d JOIN members m ON m.id=d.member_id WHERE d.id=?`, [id]);
    if (!deposit) return err("Setoran tidak ditemukan.", 404);
    const lines = await list(db, `SELECT l.id,l.waste_item_id,i.name,l.grams,l.citizen_rate_rp_per_kg AS priceRpPerKg,l.estimated_rp FROM waste_deposit_lines l JOIN waste_items i ON i.id=l.waste_item_id WHERE deposit_id=?`, [id]);
    return ok({ deposit, lines });
  }
  if (url.pathname === "/api/v2/admin/bank/sale-detail") {
    const sale = await one(db, `SELECT s.*,COALESCE(r.receipt_no,'') AS receipt_no,
      COALESCE(r.evidence_url,'') AS evidence_url
      FROM waste_sales s LEFT JOIN waste_sale_receipts r ON r.sale_id=s.id WHERE s.id=?`, [id]);
    if (!sale) return err("Penjualan tidak ditemukan.", 404);
    const lines = await list(db, `SELECT l.id,l.waste_item_id,i.name,l.grams,l.actual_rate_rp_per_kg AS priceRpPerKg,l.total_rp FROM waste_sale_lines l JOIN waste_items i ON i.id=l.waste_item_id WHERE sale_id=?`, [id]);
    return ok({ sale, lines });
  }
  return null;
}
__name(detailBank, "detailBank");
async function bankDeposit(request, env) {
  let p;
  try {
    p = await body(request);
  } catch (e) {
    return err(e.message, 400);
  }
  const key = p.requestKey;
  if (typeof key !== "string" || !/^[\w-]{16,100}$/.test(key)) return err("requestKey wajib 16\u2013100 karakter alfanumerik/_/-.", 400);
  const batchId = String(p.batchId || ""), memberId = String(p.memberId || ""), date = String(p.depositedOn || "");
  if (batchId.length > 120 || memberId.length > 120 || !validDate(date)) return err("Batch, warga, atau tanggal tidak valid.", 400);
  if (!Array.isArray(p.items) || !p.items.length || p.items.length > 40) return err("Isi 1\u201340 jenis barang.", 400);
  const merged = /* @__PURE__ */ new Map();
  for (const line of p.items) {
    const item = String(line?.itemId || "");
    const grams = Number(line?.grams);
    if (!item || item.length > 128 || !integer(grams) || grams < 1 || grams > 1e7) return err("Barang atau berat (gram) tidak valid.", 400);
    merged.set(item, (merged.get(item) || 0) + grams);
    if (merged.get(item) > 1e7) return err("Berat terlalu besar.", 400);
  }
  const normalized = [...merged].sort(([a], [b]) => a.localeCompare(b));
  const digest = await sha(JSON.stringify({ batchId, memberId, date, items: normalized }));
  const db = env.DB;
  if(await one(db,"SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year=?",[Number(date.slice(0,4))]))return err("Tahun setoran sudah ditutup.",409);
  const previous = await one(db, `SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='waste_deposit' AND source_row_key=? AND target_table='waste_deposits'`, [key]);
  if (previous) {
    if (previous.source_fingerprint !== digest) return err("requestKey dipakai untuk transaksi berbeda.", 409);
    return ok({ id: previous.target_id, status: "estimasi", duplicate: true });
  }
  const [batch, member] = await Promise.all([
    one(db, "SELECT id,status FROM waste_batches WHERE id=?", [batchId]),
    one(db, "SELECT id FROM members WHERE id=? AND status='aktif'", [memberId])
  ]);
  if (!batch || batch.status !== "draft" || !member) return err("Batch harus draft dan warga harus aktif.", 409);
  const hasSale = await one(db, "SELECT id FROM waste_sales WHERE batch_id=? AND status!='dibatalkan' LIMIT 1", [batchId]);
  if (hasSale) return err("Batch sudah memiliki penjualan aktif. Setoran baru tidak diizinkan.", 409);
  const prices = await list(db, `SELECT i.id,i.name,p.citizen_rate_rp_per_kg AS rateRp FROM waste_items i LEFT JOIN waste_prices p ON p.id=(SELECT id FROM waste_prices WHERE waste_item_id=i.id AND effective_from<=? ORDER BY effective_from DESC,id DESC LIMIT 1) WHERE i.active=1`, [date]);
  const catalog = new Map(prices.map((i) => [i.id, i]));
  let totalGrams = 0, totalRp = 0;
  const details = [];
  for (const [id, grams] of normalized) {
    const item = catalog.get(id);
    if (!item || !integer(item.rateRp) || item.rateRp <= 0) return err("Tarif barang belum aktif atau tidak tersedia: " + id, 409);
    const price = Math.round(grams * item.rateRp / 1e3);
    totalGrams += grams;
    totalRp += price;
    details.push({ id, grams, rate: item.rateRp, price });
  }
  if (!Number.isSafeInteger(totalRp) || totalRp < 0) return err("Total tidak valid.", 400);
  const depositId = "deposit:api:" + crypto.randomUUID();
  const sql = [
    db.prepare("INSERT INTO migration_source_map(source_system,source_sheet,source_row_key,target_table,target_id,source_fingerprint) VALUES('api_v2','waste_deposit',?,'waste_deposits',?,?)").bind(key, depositId, digest),
    db.prepare("INSERT INTO waste_deposits(id,batch_id,member_id,deposited_on,estimated_total_rp,total_grams,status) SELECT ?,?,?,?,?,?,'estimasi' WHERE EXISTS(SELECT 1 FROM waste_batches WHERE id=? AND status='draft') AND NOT EXISTS(SELECT 1 FROM waste_sales WHERE batch_id=? AND status!='dibatalkan')").bind(depositId, batchId, memberId, date, totalRp, totalGrams, batchId, batchId),
    ...details.map((d) => db.prepare("INSERT INTO waste_deposit_lines(id,deposit_id,waste_item_id,grams,citizen_rate_rp_per_kg,estimated_rp) VALUES(?,?,?,?,?,?)").bind("depositline:api:" + crypto.randomUUID(), depositId, d.id, d.grams, d.rate, d.price))
  ];
  try {
    await db.batch(sql);
  } catch (e) {
    const latest = await one(db, "SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='waste_deposit' AND source_row_key=? AND target_table='waste_deposits'", [key]);
    if (latest) {
      if (latest.source_fingerprint !== digest) return err("requestKey sudah dipakai untuk data lain.", 409);
      return ok({ id: latest.target_id, status: "estimasi", duplicate: true });
    }
    return err("Setoran gagal disimpan; tidak ada transaksi sebagian yang disahkan.", 409);
  }
  return ok({ id: depositId, status: "estimasi", totalGrams, estimatedRp: totalRp, duplicate: false }, 201);
}
__name(bankDeposit, "bankDeposit");
async function bankPrice(request, env, who) {
  let p;
  try {
    p = await body(request);
  } catch (e) {
    return err(e.message, 400);
  }
  const itemId = String(p.itemId || ""), effectiveFrom = String(p.effectiveFrom || ""), rate = Number(p.priceRpPerKg);
  if (!itemId || itemId.length > 128 || !validDate(effectiveFrom) || !integer(rate) || rate < 1 || rate > 1e6) return err("Tarif, tanggal atau barang tidak valid.", 400);
  if(await one(env.DB,"SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year=?",[Number(effectiveFrom.slice(0,4))]))return err("Tahun tarif sudah ditutup.",409);
  const item = await one(env.DB, "SELECT id FROM waste_items WHERE id=? AND active=1", [itemId]);
  if (!item) return err("Barang tidak aktif.", 404);
  const old = await one(env.DB, "SELECT id,citizen_rate_rp_per_kg FROM waste_prices WHERE waste_item_id=? AND effective_from=?", [itemId, effectiveFrom]);
  if (old) return old.citizen_rate_rp_per_kg === rate ? ok({ id: old.id, duplicate: true }) : err("Tarif di tanggal ini sudah ada; tidak menimpa histori.", 409);
  const id = "price:api:" + crypto.randomUUID();
  try {
    await env.DB.prepare("INSERT INTO waste_prices(id,waste_item_id,effective_from,citizen_rate_rp_per_kg,created_by) VALUES(?,?,?,?,?)").bind(id, itemId, effectiveFrom, rate, who.id).run();
  } catch {
    return err("Tarif gagal disimpan. Periksa tanggal yang mungkin sudah dipakai.", 409);
  }
  return ok({ id, itemId, effectiveFrom, priceRpPerKg: rate }, 201);
}
__name(bankPrice, "bankPrice");
// Batal hanya untuk data draft. Tidak membalik saldo atau transaksi yang telah disahkan.
async function cancelBankDraft(request,env,who,type){
  if(env.BANK_WRITE_ENABLED!=="true" || env.BANK_CANCEL_WRITE_ENABLED!=="true")
    return err('Pembatalan Bank Sampah masih terkunci.',503);
  let p;try{p=await body(request)}catch(e){return err(e.message,400)}
  const id=String(p.id||''),reason=String(p.reason||'').trim();
  if(!id||id.length>128||reason.length<5||reason.length>300)return err('ID dan alasan pembatalan minimal 5 karakter diperlukan.',400);
  const isSale=type==='sale';
  const tab=isSale?'waste_sales':'waste_deposits';
  const dateCol=isSale?'sold_on':'deposited_on';
  const data=await one(env.DB,`SELECT id,batch_id,status,${dateCol} AS date FROM ${tab} WHERE id=?`,[id]);
  if(!data)return err('Transaksi tidak ditemukan.',404);
  if(data.status==='dibatalkan')return ok({id,status:'dibatalkan',duplicate:true});
  if(data.status!==(isSale?'draft':'estimasi'))return err('Transaksi sudah diproses atau disahkan, tidak dapat dibatalkan dengan menu ini.',409);
  if(await one(env.DB,'SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year=?',[Number(data.date.slice(0,4))]))return err('Tahun transaksi sudah ditutup.',409);
  if(await one(env.DB,'SELECT id FROM waste_allocations WHERE batch_id=?',[data.batch_id]))return err('Batch sudah direkonsiliasi.',409);
  const sourceGuard=isSale?`AND NOT EXISTS(SELECT 1 FROM waste_cash_ledger c WHERE c.source_transaction_id=?)`:
    `AND NOT EXISTS(SELECT 1 FROM waste_sales s WHERE s.batch_id=${tab}.batch_id AND s.status!='dibatalkan')`;
  const sql=`UPDATE ${tab} SET status='dibatalkan' WHERE id=? AND status=?
    AND EXISTS(SELECT 1 FROM waste_batches b WHERE b.id=${tab}.batch_id AND b.status='draft')
    AND NOT EXISTS(SELECT 1 FROM waste_allocations a WHERE a.batch_id=${tab}.batch_id)
    ${sourceGuard}`;
  const auditId='audit:bank-cancel:'+type+':'+id;
  const updateParams=isSale?[id,'draft',id]:[id,'estimasi'];
  const auditSql=`INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason)
    SELECT ?,?,'banksampah',?,?,?,? WHERE changes()=1`;
  try{
    const results=await env.DB.batch([
      env.DB.prepare(sql).bind(...updateParams),
      env.DB.prepare(auditSql).bind(auditId,who.id,isSale?'cancel_draft_sale':'cancel_estimated_deposit',tab,id,reason)
    ]);
    if(Number(results[0]?.meta?.changes||0)!==1)return err('Batch tidak lagi terbuka untuk pembatalan. Muat ulang riwayat.',409);
  }catch(e){
    const latest=await one(env.DB,`SELECT status FROM ${tab} WHERE id=?`,[id]);
    if(latest?.status==='dibatalkan')return ok({id,status:'dibatalkan',duplicate:true});
    return err('Pembatalan gagal dan tidak ada transaksi disahkan yang diubah.',409);
  }
  return ok({id,status:'dibatalkan',duplicate:false});
}
__name(cancelBankDraft,"cancelBankDraft");
async function bookkeepingOverview(db, url) {
  const month = periodFilter(url);
  const f = month ? " AND substr(occurred_on,1,7)=?" : "";
  const fp = month ? " AND substr(paid_on,1,7)=?" : "";
  const fd = month ? " AND substr(event_on,1,7)=?" : "";
  const [cash, payments, fines, loans, advances] = await Promise.all([
    one(db, `SELECT COUNT(*) AS count,COALESCE(SUM(debit_rp),0) AS debitRp,COALESCE(SUM(credit_rp),0) AS creditRp FROM bookkeeping_cash_transactions_posted WHERE status='aktif'${f}`, month ? [month] : []),
    one(db, `SELECT COUNT(*) AS count,COALESCE(SUM(amount_rp),0) AS totalRp FROM bookkeeping_payments WHERE status='aktif'${fp}`, month ? [month] : []),
    one(db, `SELECT COUNT(*) AS count,COALESCE(SUM(amount_rp),0) AS chargedRp,COALESCE(SUM(paid_rp),0) AS paidRp FROM bookkeeping_fines WHERE status!='dibatalkan'${fd}`, month ? [month] : []),
    one(db, `SELECT COUNT(*) AS count,COALESCE(SUM(amount_rp),0) AS loanRp FROM bookkeeping_loans WHERE status!='dibatalkan'`, []),
    one(db, `SELECT COUNT(*) AS count,COALESCE(SUM(amount_rp),0) AS advanceRp,COALESCE(SUM(reimbursed_rp),0) AS reimbursedRp FROM bookkeeping_advances WHERE status='aktif'`, [])
  ]);
  return ok({ period: month || "semua", cash, payments, fines, loans, advances, notice: "Ringkasan operasional, bukan laporan saldo akhir atau izin tutup buku." });
}
__name(bookkeepingOverview, "bookkeepingOverview");
async function adminPortal(db, url) {
  const kind = url.pathname.split("/").pop(), limit = paramLimit(url, 250);
  const statements = {
    agenda: `SELECT * FROM portal_agenda ORDER BY starts_on DESC,id DESC LIMIT ?`,
    banners: `SELECT * FROM portal_banners ORDER BY sort_order,id LIMIT ?`,
    projects: `SELECT * FROM portal_project_cards ORDER BY sort_order,id LIMIT ?`,
    inventory: `SELECT * FROM portal_inventory ORDER BY rowid DESC LIMIT ?`,
    meetings: `SELECT * FROM portal_meeting_records ORDER BY meeting_on DESC,id DESC LIMIT ?`,
    comments: `SELECT id,display_name,body,status,created_at FROM portal_comments ORDER BY created_at DESC,id DESC LIMIT ?`
  };
  return statements[kind] ? ok({ data: await list(db, statements[kind], [limit]), limit }) : null;
}
__name(adminPortal, "adminPortal");
async function createPortalAgenda(request, env) {
  let p;
  try {
    p = await body(request);
  } catch (e) {
    return err(e.message, 400);
  }
  const title = String(p.title || "").trim(), startsOn = String(p.startsOn || "").trim(), endsOn = p.endsOn ? String(p.endsOn) : null;
  const location = p.location ? String(p.location).trim() : null, description = p.description ? String(p.description).trim() : null;
  if (title.length < 3 || title.length > 160 || !validDate(startsOn) || endsOn && !validDate(endsOn) || endsOn && endsOn < startsOn || location && location.length > 160 || description && description.length > 3e3) return err("Judul, tanggal atau deskripsi tidak valid.", 400);
  const id = "agenda:api:" + crypto.randomUUID();
  await env.DB.prepare("INSERT INTO portal_agenda(id,title,starts_on,ends_on,location,description,status,visibility,sort_order) VALUES(?,?,?,?,?,?,'Akan Datang','publik',0)").bind(id, title, startsOn, endsOn, location, description).run();
  return ok({ id }, 201);
}
__name(createPortalAgenda, "createPortalAgenda");
async function createBankBatch(request, env) {
  let p;
  try { p=await body(request); } catch(e){ return err(e.message,400); }
  const month=String(p.month||'');
  if(!validMonth(month))return err('Bulan harus YYYY-MM.',400);
  if(await one(env.DB,'SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year=?',[Number(month.slice(0,4))]))
    return err('Tahun setoran sudah ditutup.',409);
  const base='B'+month.replace('-',''), oldId='batch:'+base;
  // API lama tetap kompatibel: permintaan tanpa openForDeposits memakai batch dasar yang sudah ada.
  if(p.openForDeposits!==true){
    const old=await one(env.DB,'SELECT id,status FROM waste_batches WHERE id=?',[oldId]);
    if(old)return ok({...old,duplicate:true});
    try{await env.DB.prepare("INSERT INTO waste_batches(id,label,status) VALUES(?,?,'draft')").bind(oldId,base).run()}
    catch{return err('Batch dengan bulan ini sudah tersedia.',409)}
    return ok({id:oldId,status:'draft'},201);
  }
  // Satu bulan boleh berisi beberapa batch. Batch yang punya penjualan bukan tujuan setoran baru.
  const writableSql=`SELECT b.id,b.label FROM waste_batches b
    WHERE (b.id=? OR b.id LIKE ?) AND b.status='draft'
      AND NOT EXISTS(SELECT 1 FROM waste_sales s WHERE s.batch_id=b.id AND s.status!='dibatalkan')
    ORDER BY b.id DESC LIMIT 1`;
  const writable=()=>one(env.DB,writableSql,[oldId,oldId+'-%']);
  const ready=await writable();
  if(ready)return ok({id:ready.id,status:'draft',duplicate:true});
  const all=await list(env.DB,'SELECT id FROM waste_batches WHERE id=? OR id LIKE ?',[oldId,oldId+'-%']);
  const indexes=all.map(x=>x.id===oldId?1:Number(x.id.slice(oldId.length+1))).filter(x=>Number.isSafeInteger(x)&&x>0);
  const next=(indexes.length?Math.max(...indexes):0)+1;
  if(next>9999)return err('Jumlah batch bulanan sudah melampaui batas.',409);
  const label=next===1?base:base+'-'+String(next).padStart(2,'0'),id='batch:'+label;
  try{await env.DB.prepare("INSERT INTO waste_batches(id,label,status) VALUES(?,?,'draft')").bind(id,label).run()}
  catch{
    const concurrent=await writable();
    if(concurrent)return ok({id:concurrent.id,status:'draft',duplicate:true});
    return err('Gagal membuat batch lanjutan. Silakan muat ulang.',409);
  }
  return ok({id,status:'draft',duplicate:false},201);
}
__name(createBankBatch, "createBankBatch");

// Finalisasi pengeluaran dan inventaris, bersifat opt-in per operasi.
async function createBankExpense(request, env, who) {
  if(env.BANK_WRITE_ENABLED !== 'true' || env.BANK_EXPENSE_WRITE_ENABLED !== 'true')
    return err('Pengeluaran Bank Sampah belum diaktifkan.',503);
  let p;try{p=await body(request)}catch(e){return err(e.message,400)}
  const key=String(p.requestKey||''),date=String(p.incurredOn||''),kind=String(p.kind||''),post=String(p.budgetPost||'');
  const desc=String(p.description||'').trim(),vendor=String(p.vendor||'').trim();
  const qty=Number(p.quantity),unitPrice=p.unitPriceRp,unit=String(p.unit||'unit').trim(),extraNote=String(p.note||'').trim();
  const toInventory=p.toInventory===true,photoUrl=String(p.evidenceUrl||'').trim();
  const total=qty*Number(unitPrice);
  if(!/^[A-Za-z0-9_-]{12,100}$/.test(key)||!validDate(date)||!['pembelian','pengeluaran'].includes(kind)||
     !['operasional','kas_lorong','cadangan'].includes(post)||desc.length<3||desc.length>200||vendor.length>120||
     !Number.isFinite(qty)||qty<0.001||qty>1e6||Math.round(qty*1000)!==qty*1000||
     !Number.isSafeInteger(unitPrice)||unitPrice<=0||unitPrice>1e9||
     !Number.isSafeInteger(total)||total<1||total>1e12||unit.length>40||extraNote.length>400||
     (toInventory&&kind!=='pembelian')||(photoUrl&&!urlSafe(photoUrl))){
    return err('Data pengeluaran, pos kas, harga atau inventaris tidak valid.',400);
  }
  if(await one(env.DB,'SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year=?',[Number(date.slice(0,4))]))return err('Tahun pengeluaran sudah ditutup.',409);
  const hash=await sha(JSON.stringify({date,kind,post,desc,vendor,qty,unitPrice,unit,toInventory,photoUrl,extraNote}));
  const previous=await one(env.DB,"SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='bank_expense' AND source_row_key=? AND target_table='waste_expenses'",[key]);
  if(previous)return previous.source_fingerprint===hash?ok({id:previous.target_id,duplicate:true}):err('requestKey sudah digunakan untuk transaksi berbeda.',409);
  const expenseId='expense:api:'+crypto.randomUUID(),cashId='cash:expense:'+expenseId,invId='inventory:expense:'+expenseId;
  const statements=[
    env.DB.prepare("INSERT INTO migration_source_map(source_system,source_sheet,source_row_key,target_table,target_id,source_fingerprint) VALUES('api_v2','bank_expense',?,'waste_expenses',?,?)").bind(key,expenseId,hash),
    env.DB.prepare("INSERT INTO waste_expenses(id,incurred_on,kind,budget_post,description,amount_rp,status,vendor,evidence_ref,created_by) VALUES(?,?,?,?,?,?,'lunas',?,?,?)").bind(expenseId,date,kind,post,extraNote?desc+' — Catatan: '+extraNote:desc,total,vendor||null,photoUrl||null,who.id),
    env.DB.prepare(`INSERT INTO waste_cash_ledger(id,occurred_on,source_transaction_id,transaction_type,fund_position,cash_in_rp,cash_out_rp,status,note) VALUES(?,?,?,'pengeluaran',?,0,
      CASE WHEN (SELECT COALESCE(SUM(cash_in_rp-cash_out_rp),0) FROM waste_cash_ledger WHERE status='aktif' AND fund_position=?) >= ? THEN ? ELSE 0 END,'aktif',?)`)
      .bind(cashId,date,expenseId,post,post,total,total,extraNote?desc+' — '+extraNote:desc),
    ...(toInventory?[env.DB.prepare("INSERT INTO inventory(id,name,quantity,unit,category,location,condition,expense_id,active) VALUES(?,?,?,?,'bank_sampah',?,NULL,?,1)")
      .bind(invId,desc,qty,unit||'unit','Bank Sampah',expenseId)]:[]),
    env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'banksampah','record_expense','waste_expenses',?,?,?)")
      .bind('audit:'+expenseId,who.id,expenseId,'Pembayaran sudah dilakukan',JSON.stringify({date,kind,post,amountRp:total,inventoryId:toInventory?invId:null,extraNote}))
  ];
  try{await env.DB.batch(statements)}catch(e){
    const found=await one(env.DB,"SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='bank_expense' AND source_row_key=? AND target_table='waste_expenses'",[key]);
    if(found)return found.source_fingerprint===hash?ok({id:found.target_id,duplicate:true}):err('requestKey sudah digunakan untuk transaksi berbeda.',409);
    return err('Pengeluaran ditolak: saldo pos kas tidak cukup atau data tidak valid.',409);
  }
  return ok({id:expenseId,nominal:total,inventarisId:toInventory?invId:null,duplicate:false},201);
}
__name(createBankExpense,'createBankExpense');
async function createBankInventory(request, env, who) {
  if(env.BANK_WRITE_ENABLED !== 'true' || env.BANK_INVENTORY_WRITE_ENABLED !== 'true')
    return err('Inventaris Bank Sampah belum diaktifkan.',503);
  let p;try{p=await body(request)}catch(e){return err(e.message,400)}
  const key=String(p.requestKey||''),name=String(p.name||'').trim(),category=String(p.subcategory||'').trim(),location=String(p.location||'').trim(),photo=String(p.photoUrl||'').trim(),description=String(p.description||'').trim();
  const quantity=Number(p.quantity),unit=String(p.unit||'unit').trim();
  if(!/^[A-Za-z0-9_-]{12,100}$/.test(key)||name.length<3||name.length>160||category.length>100||location.length>100||
     !Number.isFinite(quantity)||quantity<=0||quantity>1e6||Math.round(quantity*1000)!==quantity*1000||unit.length<1||unit.length>40||
     (photo&&!urlSafe(photo))||description.length>1500)return err('Data inventaris, jumlah, satuan atau URL foto tidak valid.',400);
  const hash=await sha(JSON.stringify({name,category,location,photo,quantity,unit,description}));
  const previous=await one(env.DB,"SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='bank_inventory' AND source_row_key=? AND target_table='inventory'",[key]);
  if(previous)return previous.source_fingerprint===hash?ok({id:previous.target_id,duplicate:true}):err('requestKey sudah dipakai data inventaris lain.',409);
  const id='inventory:api:'+crypto.randomUUID();
  const stmts=[
    env.DB.prepare("INSERT INTO migration_source_map(source_system,source_sheet,source_row_key,target_table,target_id,source_fingerprint) VALUES('api_v2','bank_inventory',?,'inventory',?,?)").bind(key,id,hash),
    env.DB.prepare("INSERT INTO inventory(id,name,quantity,unit,category,location,condition,active) VALUES(?,?,?,?,'bank_sampah',?,?,1)")
      .bind(id,name,quantity,unit,location||null,(category?'Kategori: '+category+'\n':'')+description||null),
    ...(photo?[env.DB.prepare("INSERT INTO inventory_external_media(inventory_id,external_url,source_system,source_sheet,source_row_key) VALUES(?,?,'api_v2','bank_inventory',?)").bind(id,photo,key)]:[]),
    env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'banksampah','record_inventory','inventory',?,?,?)")
      .bind('audit:'+id,who.id,id,'Tambah inventaris nonpembelian',JSON.stringify({quantity,unit,category,location}))
  ];
  try{await env.DB.batch(stmts)}catch(e){
    const found=await one(env.DB,"SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='bank_inventory' AND source_row_key=? AND target_table='inventory'",[key]);
    if(found)return found.source_fingerprint===hash?ok({id:found.target_id,duplicate:true}):err('requestKey sudah dipakai data inventaris lain.',409);
    return err('Gagal menyimpan inventaris.',409);
  }
  return ok({id,duplicate:false},201);
}
__name(createBankInventory,'createBankInventory');

async function createBankMediaLink(request,env,who){
  if(env.BANK_WRITE_ENABLED!=='true'||env.BANK_MEDIA_WRITE_ENABLED!=='true')return err('Penulisan dokumentasi Bank Sampah masih terkunci.',503);
  let p;try{p=await body(request)}catch(e){return err(e.message,400)}
  const key=String(p.requestKey||''),albumId=String(p.albumId||''),type=String(p.mediaType||''),url=String(p.url||'').trim(),caption=String(p.caption||'').trim();
  if(!/^[A-Za-z0-9_-]{12,100}$/.test(key)||!albumId||albumId.length>128||!['foto','video'].includes(type)||!urlSafe(url)||url.length>2000||caption.length>350)
    return err('ID album, jenis media, tautan HTTPS, atau keterangan tidak valid.',400);
  if(!await one(env.DB,"SELECT id FROM albums WHERE id=? AND status='aktif'",[albumId]))return err('Album tidak aktif atau tidak ditemukan.',404);
  const digest=await sha(JSON.stringify({albumId,type,url,caption}));
  const old=await one(env.DB,"SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='bank_media_link' AND source_row_key=? AND target_table='album_media'",[key]);
  if(old)return old.source_fingerprint===digest?ok({id:old.target_id,duplicate:true}):err('requestKey sudah dipakai media lain.',409);
  const id='media:api:'+crypto.randomUUID();
  try{await env.DB.batch([
    env.DB.prepare("INSERT INTO migration_source_map(source_system,source_sheet,source_row_key,target_table,target_id,source_fingerprint) VALUES('api_v2','bank_media_link',?,'album_media',?,?)").bind(key,id,digest),
    env.DB.prepare("INSERT INTO album_media(id,album_id,media_type,external_url,caption,sort_order,status) VALUES(?,?,?,?,?,0,'aktif')").bind(id,albumId,type,url,caption||null),
    env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'banksampah','record_media_link','album_media',?,?,?)").bind('audit:'+id,who.id,id,'Tambah media album',JSON.stringify({albumId,type,caption}))
  ])}catch(e){
    const latest=await one(env.DB,"SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='bank_media_link' AND source_row_key=? AND target_table='album_media'",[key]);
    if(latest)return latest.source_fingerprint===digest?ok({id:latest.target_id,duplicate:true}):err('requestKey sudah dipakai media lain.',409);
    return err('Gagal menyimpan tautan media.',409);
  }
  return ok({id,duplicate:false},201);
}
__name(createBankMediaLink,'createBankMediaLink');
async function createBankAlbum(request, env) {
  let p;
  try {p=await body(request)} catch(e){return err(e.message,400)}
  const title=String(p.title||'').trim(),category=String(p.category||'Lainnya').trim();
  const eventOn=p.eventOn?String(p.eventOn):null,description=p.description?String(p.description).trim():null;
  const visibility=String(p.visibility||'publik'),coverUrl=String(p.coverUrl||'').trim();
  if(title.length<3||title.length>200||category.length<2||category.length>100||
    eventOn&&!validDate(eventOn)||description&&description.length>2500||
    !['publik','privat'].includes(visibility)||
    (coverUrl&&(!urlSafe(coverUrl)||coverUrl.length>2000)))
    return err('Data album atau tautan sampul HTTPS tidak valid.',400);
  const id='album:api:'+crypto.randomUUID();
  const statements=[env.DB.prepare("INSERT INTO albums(id,title,category,event_on,description,visibility,status) VALUES(?,?,?,?,?,?,'aktif')")
    .bind(id,title,category,eventOn,description,visibility)];
  if(coverUrl)statements.push(env.DB.prepare("INSERT INTO album_media(id,album_id,media_type,external_url,caption,sort_order,status) VALUES(?,?,'foto',?,?,0,'aktif')")
    .bind('media:cover:'+crypto.randomUUID(),id,coverUrl,'Sampul album'));
  try{await env.DB.batch(statements)}catch{return err('Album tidak berhasil disimpan; ulangi hanya setelah memeriksa daftar album.',409)}
  return ok({id,coverSaved:!!coverUrl},201);
}
__name(createBankAlbum, "createBankAlbum");
// Perubahan konten Bank Sampah — operasi terjaga dan diaudit (bukan keuangan).
async function bankAlbumCategoryUpdate(request,env,who){
  if(env.BANK_WRITE_ENABLED!=='true')return err('Pengelolaan album Bank Sampah masih terkunci.',503);
  let p;try{p=await body(request)}catch(e){return err(e.message,400)}
  const id=String(p.id||'').trim(),category=String(p.category||'').trim();
  if(!id||id.length>128||category.length<2||category.length>100)return err('Album atau kategori tidak valid.',400);
  const old=await one(env.DB,"SELECT id,category,status FROM albums WHERE id=?",[id]);
  if(!old||old.status!=='aktif')return err('Album tidak tersedia/aktif.',404);
  if(old.category===category)return ok({id,category,unchanged:true});
  const auditId='audit:bank-album-category:'+crypto.randomUUID();
  try{await env.DB.batch([
   env.DB.prepare("UPDATE albums SET category=? WHERE id=? AND status='aktif'").bind(category,id),
   env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,before_json,after_json) VALUES(?,?,'banksampah','update_album_category','albums',?,?,?,?)")
   .bind(auditId,who.id,id,'Kategori album diperbarui',JSON.stringify({category:old.category}),JSON.stringify({category}))
  ])}catch(e){return err('Gagal memperbarui kategori album.',409)}
  return ok({id,category,updated:true});
}
__name(bankAlbumCategoryUpdate,'bankAlbumCategoryUpdate');
async function bankAlbumDetailsUpdate(request,env,who){
  if(env.BANK_WRITE_ENABLED!=='true')return err('Pengelolaan album Bank Sampah masih terkunci.',503);
  let p;try{p=await body(request)}catch(e){return err(e.message,400)}
  const id=String(p.id||'').trim(),title=String(p.title||'').trim(),category=String(p.category||'').trim(),
    eventOn=p.eventOn?String(p.eventOn):null,description=p.description?String(p.description).trim():null,
    visibility=String(p.visibility||'publik');
  if(!id||id.length>128||title.length<3||title.length>200||category.length<2||category.length>100||
    eventOn&&!validDate(eventOn)||description&&description.length>2500||
    !['publik','privat'].includes(visibility))return err('Data album tidak valid.',400);
  const old=await one(env.DB,"SELECT id,title,category,event_on,description,visibility,status FROM albums WHERE id=?",[id]);
  if(!old||old.status!=='aktif')return err('Album tidak ditemukan atau tidak aktif.',404);
  const after={title,category,event_on:eventOn,description,visibility};
  if(Object.entries(after).every(([k,v])=>String(v??'')===String(old[k]??'')))return ok({id,unchanged:true});
  try{await env.DB.batch([
    env.DB.prepare("UPDATE albums SET title=?,category=?,event_on=?,description=?,visibility=? WHERE id=? AND status='aktif'")
      .bind(title,category,eventOn,description,visibility,id),
    env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,before_json,after_json) VALUES(?,?,'banksampah','update_album_details','albums',?,?,?,?)")
      .bind('audit:bank-album:'+crypto.randomUUID(),who.id,id,'Perbaikan detail album',JSON.stringify(old),JSON.stringify(after))
  ])}catch(e){return err('Perubahan album tidak berhasil disimpan.',409)}
  return ok({id,updated:true});
}
__name(bankAlbumDetailsUpdate,'bankAlbumDetailsUpdate');
async function bankProgressUpdate(request,env,who){
  if(env.BANK_WRITE_ENABLED!=='true')return err('Pengelolaan perkembangan Bank Sampah masih terkunci.',503);
  let p;try{p=await body(request)}catch(e){return err(e.message,400)}
  const id=String(p.id||''),date=String(p.date||''),title=String(p.title||'').trim(),stage=String(p.stage||'').trim();
  const description=String(p.description||'').trim(),status=String(p.status||'').trim();
  const next=p.nextStep?String(p.nextStep).trim():null,publicVisible=p.publicVisible===false?0:1;
  const photo=String(p.photoUrl||'').trim();
  if(!id||id.length>150||!validDate(date)||title.length<3||title.length>160||stage.length>100||
     description.length>4000||status.length<2||status.length>100||next&&next.length>1500||
     (photo&&(!urlSafe(photo)||photo.length>2000)))
    return err('Perkembangan atau URL foto HTTPS tidak valid.',400);
  const old=await one(env.DB,`SELECT p.id,p.happened_on,p.title,p.stage,p.description,p.status,p.next_step,p.public_visible,
    pm.photo_url AS photoUrl FROM progress_entries p
    LEFT JOIN bank_progress_photos pm ON pm.progress_id=p.id WHERE p.id=?`,[id]);
  if(!old)return err('Perkembangan tidak ditemukan.',404);
  const auditId='audit:bank-progress-edit:'+crypto.randomUUID();
  const statements=[
    env.DB.prepare('UPDATE progress_entries SET happened_on=?,title=?,stage=?,description=?,status=?,next_step=?,public_visible=? WHERE id=?')
      .bind(date,title,stage,description,status,next,publicVisible,id)
  ];
  if(photo){
    statements.push(env.DB.prepare(`INSERT INTO bank_progress_photos(progress_id,photo_url,updated_at)
      VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(progress_id)
      DO UPDATE SET photo_url=excluded.photo_url,updated_at=CURRENT_TIMESTAMP`).bind(id,photo));
  }else{
    statements.push(env.DB.prepare("DELETE FROM bank_progress_photos WHERE progress_id=?").bind(id));
  }
  statements.push(env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,before_json,after_json) VALUES(?,?,'banksampah','update_progress','progress_entries',?,?,?,?)")
    .bind(auditId,who.id,id,'Perkembangan diperbarui',JSON.stringify(old),
      JSON.stringify({date,title,stage,description,status,nextStep:next,publicVisible,photoUrl:photo})));
  try{await env.DB.batch(statements)}catch{return err('Gagal memperbarui perkembangan atau tautan foto.',409)}
  return ok({id,updated:true,photoUrl:photo||null});
}
__name(bankProgressUpdate,'bankProgressUpdate');
async function createBankProgress(request, env) {
  let p;try{p=await body(request)}catch(e){return err(e.message,400)}
  const date=String(p.date||''),title=String(p.title||'').trim(),stage=String(p.stage||'').trim();
  const description=String(p.description||'').trim(),status=String(p.status||'').trim();
  const next=p.nextStep?String(p.nextStep).trim():null,publicVisible=p.publicVisible===false?0:1;
  const photo=String(p.photoUrl||'').trim();
  if(!validDate(date)||title.length<3||title.length>160||stage.length>100||
     description.length>4000||status.length<2||status.length>100||next&&next.length>1500||
     (photo&&(!urlSafe(photo)||photo.length>2000)))
    return err('Perkembangan atau URL foto HTTPS tidak valid.',400);
  const id='progress:api:'+crypto.randomUUID();
  const statements=[
    env.DB.prepare("INSERT INTO progress_entries(id,happened_on,title,stage,description,status,next_step,public_visible) VALUES(?,?,?,?,?,?,?,?)")
      .bind(id,date,title,stage,description,status,next,publicVisible)
  ];
  if(photo)statements.push(env.DB.prepare("INSERT INTO bank_progress_photos(progress_id,photo_url) VALUES(?,?)").bind(id,photo));
  try{await env.DB.batch(statements)}catch{return err('Gagal menyimpan perkembangan dan fotonya; tidak ada catatan sebagian.',409)}
  return ok({id,photoSaved:!!photo},201);
}
__name(createBankProgress, "createBankProgress");
async function addBankMedia(request, env, who) {
  if (!env.PHOTOS) return err("R2 belum terhubung.", 503);
  const albumId = new URL(request.url).searchParams.get("albumId");
  if (!albumId || albumId.length > 128) return err("Album tidak valid.", 400);
  const album = await one(env.DB, "SELECT id,status FROM albums WHERE id=? AND status='aktif'", [albumId]);
  if (!album) return err("Album tidak ditemukan.", 404);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 5 * 1024 * 1024) return err("Foto maksimal 5 MB.", 413);
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength < 12 || bytes.byteLength > 5 * 1024 * 1024) return err("Ukuran foto tidak valid.", 400);
  const buf = new Uint8Array(bytes);
  let extension, type;
  if (buf[0] === 255 && buf[1] === 216 && buf[2] === 255) {
    extension = "jpg";
    type = "image/jpeg";
  } else if (buf[0] === 137 && buf[1] === 80 && buf[2] === 78 && buf[3] === 71 && buf[4] === 13 && buf[5] === 10) {
    extension = "png";
    type = "image/png";
  } else if (String.fromCharCode(...buf.slice(0, 4)) === "RIFF" && String.fromCharCode(...buf.slice(8, 12)) === "WEBP") {
    extension = "webp";
    type = "image/webp";
  } else return err("Unggah JPG, PNG atau WebP.", 415);
  const id = "media:api:" + crypto.randomUUID(), key = "albums/" + albumId.replace(/[^a-zA-Z0-9_-]/g, "_") + "/" + crypto.randomUUID() + "." + extension;
  await env.PHOTOS.put(key, bytes, { httpMetadata: { contentType: type } });
  try {
    await env.DB.prepare("INSERT INTO album_media(id,album_id,media_type,storage_key,caption,status) VALUES(?,?,'foto',?,?,'aktif')").bind(id, albumId, key, null).run();
  } catch {
    await env.PHOTOS.delete(key).catch(() => {
    });
    return err("Gagal menyimpan metadata foto.", 409);
  }
  return ok({ id, albumId, mediaUrl: "/api/v2/public/bank/media/" + encodeURIComponent(id) }, 201);
}
__name(addBankMedia, "addBankMedia");
var contentModel = {
  agenda: { table: "portal_agenda", fields: { title: "text", starts_on: "date", ends_on: "date", location: "text", description: "long", image_ref: "url", status: "text", visibility: "visibility", sort_order: "order" }, required: ["title"] },
  banners: { table: "portal_banners", fields: { title: "text", image_ref: "url", target_url: "urlOrAnchor", sort_order: "order", active: "bool" }, required: ["image_ref"] },
  projects: { table: "portal_project_cards", fields: { title: "text", description: "long", image_ref: "url", target_url: "urlOrAnchor", sort_order: "order", active: "bool", project_kind: "projectKind", fund_source: "text", fund_target_rp: "fundTarget", linked_key: "text" }, required: ["title"] },
  inventory: { table: "portal_inventory", fields: { name: "text", description: "long", quantity: "quantity", unit: "text", photo_ref: "url", category: "text", visibility: "visibility" }, required: ["name"] },
  meetings: { table: "portal_meeting_records", fields: { title: "text", meeting_on: "date", summary: "long", document_ref: "url", visibility: "visibility" }, required: ["title"] },
  documentation: { table: "portal_documentation", fields: { event_on: "date", title: "text", description: "long", drive_url: "url", category: "text", sort_order: "order", visibility: "visibility", active: "bool" }, required: ["title"] },
  arisan: { table: "portal_arisan_schedule", fields: {period_on:"date",host_name:"text",status:"text"}, required:["period_on","host_name"] },
  jersey: { table: "portal_jersey_orders", fields: {group_key:"text",sort_order:"order",resident:"text",sleeves:"text",size:"text",printed_name:"text",payment_status:"text",nominal_rp:"order",method:"text"}, required:["group_key","resident"] }
};
var contentPath = "/api/v2/admin/content/";
function normalizeContent(type, v) {
  if (v === void 0 || v === null || v === "") return null;
  if (type === "bool") return v === true || v === 1 || v === "1" ? 1 : 0;
  if (type === "projectKind") {
    const choice=String(v||"informasi").trim().toLowerCase();
    if(!["informasi","kas","penggalangan","pesanan","portal"].includes(choice))throw Error("Jenis proyek tidak dikenal.");
    return choice;
  }
  if (type === "fundTarget") {
    const n=Number(v||0);
    if(!Number.isSafeInteger(n)||n<0||n>100000000000)throw Error("Target dana harus rupiah bulat yang valid.");
    return n;
  }
  if (type === "order" || type === "quantity") {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 1e7 || type === "order" && !Number.isInteger(n)) throw Error("Angka tidak valid.");
    return n;
  }
  if (typeof v !== "string") throw Error("Kolom teks harus berupa teks.");
  const t = v.trim(), max = type === "long" ? 5e3 : 500;
  if (t.length > max) throw Error("Teks terlalu panjang.");
  if (type === "date" && !validDate(t)) throw Error("Tanggal harus YYYY-MM-DD.");
  if (type === "visibility" && !["publik", "privat"].includes(t)) throw Error("Visibilitas tidak valid.");
  if (type === "url" && t && !/^https:\/\//i.test(t)) throw Error("Gunakan tautan HTTPS, misalnya Google Drive.");
  if (type === "urlOrAnchor" && t && !/^https:\/\//i.test(t) && !/^#[a-zA-Z0-9_-]+$/.test(t) && !/^\/(?!\/)[a-zA-Z0-9_/#?=&%.-]*$/.test(t)) throw Error("Tautan target tidak valid.");
  return t || null;
}
__name(normalizeContent, "normalizeContent");
// Atomic, audited destination change for documentation and inventory.
async function transferF4Content(request,env,who){
 const denied=superadmin(who);if(denied)return denied;
 if(env.BANK_WRITE_ENABLED!=='true')return err('Pengelolaan Bank Sampah belum aktif.',503);
 let p;try{p=await body(request)}catch(e){return err(e.message,400)}
 const kind=String(p.kind||''),source=String(p.source||''),dest=String(p.destination||''),id=String(p.id||''),
       v=p.values||{},db=env.DB;
 if(!['documentation','inventory'].includes(kind)||!['portal','bank-sampah'].includes(source)||
 !['portal','bank-sampah'].includes(dest)||!id||id.length>128||!v||typeof v!=='object'||Array.isArray(v))return err('Pemindahan tidak valid.',400);
 if(kind==='inventory'&&env.BANK_INVENTORY_WRITE_ENABLED!=='true')return err('Pengelolaan inventaris Bank Sampah belum aktif.',503);
 const title=String(v.title||'').trim(),name=String(v.name||'').trim(),
 desc=String(v.description||'').trim(),cat=String(v.category||'Lainnya').trim(),
 date=String(v.event_on||''),url=String(v.url||'').trim(),vis=String(v.visibility||'publik'),
 qty=Number(v.quantity),unit=String(v.unit||'unit').trim(),sort=Number(v.sort_order||0),
 location=String(v.location||'').trim();
 if(!['publik','privat'].includes(vis)||cat.length>100||desc.length>2000||
 (url&&(!urlSafe(url)||url.length>2000)))return err('Isian tidak valid.',400);
 if(kind==='documentation'&&(!title||title.length>200||date&&!validDate(date)||!Number.isInteger(sort)||sort<0||sort>1e7))
 return err('Data dokumentasi tidak valid.',400);
 if(kind==='inventory'&&(!name||name.length>160||!Number.isFinite(qty)||qty<=0||qty>1e6||
 Math.round(qty*1000)!==qty*1000||!unit||unit.length>40||location.length>100))return err('Data inventaris tidak valid.',400);
 const table=kind==='documentation'?(source==='portal'?'portal_documentation':'albums'):
 (source==='portal'?'portal_inventory':'inventory');
 const old=await one(db,'SELECT * FROM '+table+' WHERE id=?',[id]);
 if(!old)return err('Data asal tidak ditemukan. Muat ulang daftar.',404);
 if(source==='portal'&&kind==='documentation'&&
  Number(old.active)===0&&/^Pindah Bank Sampah\s*[:/]/i.test(String(old.category||'')))
  return err('Dokumentasi ini sudah dipindahkan. Muat ulang daftar.',409);
 if(source==='portal'&&kind==='inventory'&&
  /^Pindah Bank Sampah\s*[:/]/i.test(String(old.category||'')))
  return err('Inventaris ini sudah dipindahkan. Muat ulang daftar.',409);
 if(source==='bank-sampah'&&kind==='documentation'&&
  (old.status!=='aktif'||/^Portal Utama\s*[:/]/i.test(String(old.category||''))))
  return err('Album ini sudah dipindahkan atau diarsipkan.',409);
 if(source==='bank-sampah'&&kind==='inventory'&&Number(old.active)!==1)
  return err('Inventaris ini sudah dipindahkan atau dinonaktifkan.',409);
 const q=[];
 const audit=(action,newId)=>db.prepare('INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)')
 .bind('audit:'+crypto.randomUUID(),who.id,'portal_content',action,table,id,JSON.stringify(old),JSON.stringify({destination:dest,targetId:newId,values:v}));
 if(source===dest){
  if(kind!=='inventory'||source!=='bank-sampah')return err('Gunakan penyimpanan editor biasa.',400);
  q.push(db.prepare("UPDATE inventory SET name=?,quantity=?,unit=?,location=?,condition=? WHERE id=? AND category='bank_sampah' AND active=1")
   .bind(name,qty,unit,location||null,(cat?'Kategori: '+cat+'\n':'')+desc,id));
  if(url){
   const media=await one(db,'SELECT inventory_id FROM inventory_external_media WHERE inventory_id=? LIMIT 1',[id]);
   q.push(media?db.prepare('UPDATE inventory_external_media SET external_url=? WHERE inventory_id=?').bind(url,id):
    db.prepare("INSERT INTO inventory_external_media(inventory_id,external_url,source_system,source_sheet,source_row_key) VALUES(?,?,'api_v2','bank_inventory_edit',?)")
    .bind(id,url,'edit_'+crypto.randomUUID()));
  }
  q.push(audit('edit_inventory',id));
  try{await db.batch(q)}catch{return err('Gagal memperbarui inventaris.',409)}
  return ok({id,updated:true});
 }
 let next=kind+':move:'+crypto.randomUUID();
 if(kind==='documentation'&&source==='portal'){
  const exists=await one(db,"SELECT id FROM albums WHERE id=? AND status='aktif'",[id]);
  if(exists)next=id;
  const bankCat='Bank Sampah: '+cat.replace(/^Bank Sampah\s*[:/]\s*/i,'');
  const folder=/drive\.google\.com\/drive\/folders\//i.test(url);
  const description=(desc+(folder&&url?'\nTautan folder: '+url:'')).trim();
  if(description.length>2500)return err('Deskripsi terlalu panjang.',400);
  q.push(exists?db.prepare('UPDATE albums SET title=?,category=?,event_on=?,description=?,visibility=? WHERE id=?')
    .bind(title,bankCat,date||null,description||null,vis,id):
   db.prepare("INSERT INTO albums(id,title,category,event_on,description,visibility,status) VALUES(?,?,?,?,?,?,'aktif')")
    .bind(next,title,bankCat,date||null,description||null,vis));
  if(url&&!folder)q.push(db.prepare("INSERT INTO album_media(id,album_id,media_type,external_url,caption,sort_order,status) VALUES(?,?,?,?,?,0,'aktif')")
   .bind('media:move:'+crypto.randomUUID(),next,/\.(mp4|webm)(\?|$)|youtu|youtube/i.test(url)?'video':'foto',url,title));
  q.push(db.prepare("UPDATE portal_documentation SET category=?,visibility='privat',active=0 WHERE id=?")
   .bind('Pindah Bank Sampah: '+cat,id));
 }else if(kind==='documentation'){
  const exists=await one(db,'SELECT id FROM portal_documentation WHERE id=?',[id]);
  if(exists)next=id;
  const media=await one(db,"SELECT external_url FROM album_media WHERE album_id=? AND status='aktif' ORDER BY sort_order,id LIMIT 1",[id]);
  const link=url||String(media?.external_url||'');
  q.push(exists?db.prepare('UPDATE portal_documentation SET title=?,event_on=?,description=?,drive_url=?,category=?,sort_order=?,visibility=?,active=1 WHERE id=?')
   .bind(title,date||null,desc||null,link||null,cat,sort,vis,id):
   db.prepare('INSERT INTO portal_documentation(id,event_on,title,description,drive_url,category,sort_order,visibility,active) VALUES(?,?,?,?,?,?,?,?,1)')
   .bind(next,date||null,title,desc||null,link||null,cat,sort,vis));
  q.push(db.prepare("UPDATE albums SET category=?,visibility='privat' WHERE id=?").bind('Portal Utama: '+cat,id));
 }else if(source==='portal'){
  q.push(db.prepare("INSERT INTO inventory(id,name,quantity,unit,category,location,condition,active) VALUES(?,?,?,?,'bank_sampah',?,?,1)")
   .bind(next,name,qty,unit,location||null,(cat?'Kategori: '+cat+'\n':'')+desc));
  if(url)q.push(db.prepare("INSERT INTO inventory_external_media(inventory_id,external_url,source_system,source_sheet,source_row_key) VALUES(?,?,'api_v2','portal_inventory_move',?)")
   .bind(next,url,'move_'+crypto.randomUUID()));
  q.push(db.prepare("UPDATE portal_inventory SET category=?,visibility='privat' WHERE id=?").bind('Pindah Bank Sampah: '+cat,id));
 }else{
  const media=await one(db,'SELECT external_url FROM inventory_external_media WHERE inventory_id=? LIMIT 1',[id]);
  q.push(db.prepare('INSERT INTO portal_inventory(id,name,description,quantity,unit,photo_ref,category,visibility) VALUES(?,?,?,?,?,?,?,?)')
    .bind(next,name,desc||String(old.condition||''),qty,unit,url||media?.external_url||null,cat,vis));
  q.push(db.prepare('UPDATE inventory SET active=0 WHERE id=?').bind(id));
 }
 q.push(audit('transfer_'+kind,next));
 try{await db.batch(q)}catch{return err('Pemindahan gagal. Data asal tetap utuh.',409)}
 return ok({id:next,sourceId:id,moved:true});
}
__name(transferF4Content,'transferF4Content');
async function handleAdminContent(request, env, who, url) {
  const denied = superadmin(who);
  if (denied) return denied;
  const kind = url.pathname.slice(contentPath.length), model = contentModel[kind], db = env.DB;
  if (!model && !["tariffs", "settings", "obligations"].includes(kind)) return err("Jenis data tidak dikenal.", 404);
  if (request.method === "GET") {
    if (model) {
      const order = kind === "arisan" ? "period_on ASC,id" : kind === "jersey" ? "group_key,sort_order,id" : kind === "agenda" ? "starts_on DESC,id DESC" : kind === "documentation" ? "event_on DESC,id DESC" : kind === "inventory" ? "rowid DESC" : kind === "meetings" ? "meeting_on DESC,id DESC" : "sort_order,id";
      const rows = await list(db, "SELECT * FROM " + model.table + " ORDER BY " + order + " LIMIT 500");
      return ok({ data: rows, kind });
    }
    if (kind === "tariffs") return ok({ data: await list(db, "SELECT contribution_type,amount_rp,active,updated_at FROM bookkeeping_contribution_tariffs ORDER BY contribution_type") });
    if (kind === "settings") return ok({ data: await list(db, "SELECT setting_key,setting_value,description FROM app_settings WHERE setting_key IN ('TANGGAL_SETOR_RT','BATAS_PERIODE_KAS')") });
    const payers=await list(db,"SELECT p.id AS payer_id,p.display_name AS nama,h.house_code AS rumah,p.active,COALESCE(pro.keterangan,'') AS keterangan FROM bookkeeping_payers p JOIN households h ON h.id=p.household_id LEFT JOIN resident_directory_profiles pro ON pro.payer_id=p.id WHERE p.payer_type='warga' ORDER BY h.house_code");
    const versions=await list(db,"SELECT payer_id,effective_from,qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan FROM bookkeeping_payer_obligation_periods ORDER BY payer_id,effective_from LIMIT 10000");
    const grouped=new Map();
    for(const v of versions){const id=String(v.payer_id);if(!grouped.has(id))grouped.set(id,[]);grouped.get(id).push(v)}
    const month=f4CurrentIuranMonth();
    const keys=["qty_iuran_bulanan","qty_kebersihan","qty_kas_lorong","qty_arisan"];
    return ok({ data:payers.map(p=>{
      const entries=grouped.get(String(p.payer_id))||[];
      const current=entries.filter(x=>x.effective_from<=month).at(-1)||null;
      const upcoming=entries.find(x=>x.effective_from>month)||null;
      const result={...p,effective_from:current?.effective_from||"",next_effective_from:upcoming?.effective_from||"",scheduled_versions:entries.filter(x=>x.effective_from>month)};
      for(const k of keys){
        result[k]=Number(current?.[k]||0);
        result["next_"+k]=upcoming?Number(upcoming[k]||0):null;
      }
      return result;
    }) });
  }
  if (request.method !== "POST") return err("Metode tidak didukung.", 405);
  const origin = request.headers.get("origin") || "";
  if (origin && !["https://flamboyan4.web.id", "https://www.flamboyan4.web.id"].includes(origin)) return err("Asal permintaan tidak diizinkan.", 403);
  let payload;
  try {
    payload = await body(request);
  } catch (e) {
    return err(e.message, 400);
  }
  const action = String(payload.action || "save"), id = String(payload.id || "");
  if (id.length > 150) return err("ID terlalu panjang.", 400);
  if(action==="delete"){
    if(!model)return err("Data acuan tidak boleh dihapus melalui editor konten.",403);
    if(!id)return err("ID konten wajib diisi.",400);
    const before=await one(db,"SELECT * FROM "+model.table+" WHERE id=?",[id]);
    if(!before)return err("Konten tidak ditemukan; muat ulang daftar.",404);
    // Project is presentation/configuration only. Archive instead of deleting money/order records.
    if(kind==="projects"){
      await db.batch([
        db.prepare("UPDATE portal_project_cards SET active=0 WHERE id=?").bind(id),
        db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)")
          .bind("audit:"+crypto.randomUUID(),who.id,"portal_content","archive","portal_project_cards",id,JSON.stringify(before),JSON.stringify({...before,active:0}))
      ]);
      return ok({id,archived:true});
    }
    try{
      await db.batch([
        db.prepare("DELETE FROM "+model.table+" WHERE id=?").bind(id),
        db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)")
          .bind("audit:"+crypto.randomUUID(),who.id,"portal_content","delete",model.table,id,JSON.stringify(before),null)
      ]);
    }catch(e){return err("Konten memiliki referensi terkait atau tidak dapat dihapus. Data tetap utuh.",409)}
    return ok({id,deleted:true});
  }
  if (!["save", "create"].includes(action) && !(kind === "obligations" && ["add_payer","update_note"].includes(action))) return err("Aksi tidak diizinkan.", 400);
  if (kind === "tariffs") {
    const tariff = String(payload.contribution_type || ""), amount = Number(payload.amount_rp);
    if (!["IURAN_BULANAN", "KEBERSIHAN", "KAS_LORONG", "ARISAN"].includes(tariff) || !Number.isSafeInteger(amount) || amount < 0 || amount > 5e6) return err("Tarif tidak valid.", 400);
    const before = await one(db, "SELECT * FROM bookkeeping_contribution_tariffs WHERE contribution_type=?", [tariff]);
    if (!before) return err("Tarif tidak ditemukan.", 404);
    await db.batch([
      db.prepare("UPDATE bookkeeping_contribution_tariffs SET amount_rp=?,updated_at=CURRENT_TIMESTAMP WHERE contribution_type=?").bind(amount, tariff),
      db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)").bind("audit:" + crypto.randomUUID(), who.id, "master_pembukuan", "ubah_tarif", "bookkeeping_contribution_tariffs", tariff, JSON.stringify(before), JSON.stringify({ amount_rp: amount }))
    ]);
    return ok({ id: tariff });
  }
  if (kind === "settings") {
    const key = String(payload.setting_key || ""), value2 = Number(payload.setting_value);
    if (!["TANGGAL_SETOR_RT", "BATAS_PERIODE_KAS"].includes(key) || !Number.isSafeInteger(value2) || value2 < 1 || value2 > 31) return err("Pengaturan tanggal harus 1 sampai 31.", 400);
    const before = await one(db, "SELECT * FROM app_settings WHERE setting_key=?", [key]);
    await db.batch([
      db.prepare("INSERT INTO app_settings(setting_key,setting_value,description,updated_at,updated_by) VALUES(?,?,?,CURRENT_TIMESTAMP,?) ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value,updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by").bind(key, String(value2), key === "TANGGAL_SETOR_RT" ? "Tanggal Setor RT" : "Batas Periode Kas", who.id),
      db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)").bind("audit:" + crypto.randomUUID(), who.id, "master_pembukuan", "ubah_aturan", "app_settings", key, JSON.stringify(before), JSON.stringify({ setting_value: value2 }))
    ]);
    return ok({ id: key });
  }
  if (kind === "obligations") {
    if(action==="update_note"){
      const payerId=String(payload.payer_id||"").trim();
      const remark=String(payload.keterangan??"").trim();
      if(!payerId||payerId.length>150||remark.length>500)
        return err("ID pembayar atau keterangan tidak valid (maksimal 500 karakter).",400);
      const found=await one(db,"SELECT id FROM bookkeeping_payers WHERE id=? AND payer_type='warga'",[payerId]);
      if(!found)return err("Pembayar tidak ditemukan.",404);
      const previous=await one(db,"SELECT keterangan FROM resident_directory_profiles WHERE payer_id=?",[payerId]);
      await db.batch([
        db.prepare("INSERT INTO resident_directory_profiles(payer_id,status_tinggal,status_aktif,nomor_hp,keterangan) VALUES(?,NULL,'Ya',NULL,?) ON CONFLICT(payer_id) DO UPDATE SET keterangan=excluded.keterangan").bind(payerId,remark||null),
        db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)").bind("audit:"+crypto.randomUUID(),who.id,"master_pembukuan","ubah_keterangan_pembayar","resident_directory_profiles",payerId,JSON.stringify(previous),JSON.stringify({keterangan:remark}))
      ]);
      return ok({id:payerId,keterangan:remark});
    }
    const effective=String(payload.effective_from||"").trim();
    const effectiveFrom=/^20\d{2}-(0[1-9]|1[0-2])$/.test(effective)?effective+"-01":"";
    const nextMonth=f4NextIuranMonth();
    const nowMonth=f4CurrentIuranMonth();
    if(!effectiveFrom)
      return err("Pilih bulan mulai berlaku (YYYY-MM); transaksi lama tidak boleh berubah.",400);
    if(action==="add_payer"&&effectiveFrom<nowMonth)
      return err("Pembayar baru hanya boleh mulai bulan ini atau sesudahnya.",409);
    if(action!=="add_payer"&&effectiveFrom<nextMonth)
      return err("Perubahan kewajiban hanya boleh berlaku mulai bulan depan. Periode sebelumnya terkunci.",409);
    if(action!=="add_payer"&&action!=="save")
      return err("Aksi kewajiban tidak dikenal.",400);
    if (action === "add_payer") {
      // A TPQ or other payer can pay iuran without becoming a Bank Sampah
      // member or receiving a login. Never alter an existing resident's identity.
      const householdId = String(payload.household_id || "").trim();
      const name = String(payload.nama || "").trim();
      const remark=String(payload.keterangan??"").trim();
      const keys = ["qty_iuran_bulanan", "qty_kebersihan", "qty_kas_lorong", "qty_arisan"];
      const vals = keys.map(k => Number(payload[k]));
      if (!householdId || householdId.length > 120 || !name || name.length > 160 ||
          /[\x00-\x1F\x7F]/.test(name))
        return err("Pilih rumah dan isi nama pembayar yang valid.", 400);
      if(remark.length>500)return err("Keterangan maksimal 500 karakter.",400);
      if (vals.some(n => !Number.isInteger(n) || n < 0 || n > 100) ||
          !vals.some(n => n > 0))
        return err("Isi minimal satu kewajiban bernilai 1 sampai 100.", 400);
      const house = await one(db, "SELECT id FROM households WHERE id=?", [householdId]);
      if (!house) return err("Rumah tidak ditemukan; muat ulang daftar.", 404);
      const existing = await one(db,
        "SELECT id FROM bookkeeping_payers WHERE household_id=? AND payer_type='warga' AND lower(trim(display_name))=lower(trim(?))",
        [householdId,name]);
      if (existing) return err("Pembayar sudah ada di rumah ini. Gunakan Edit atau tampilkan Tanpa Kewajiban untuk mengaktifkan lagi.", 409);
      const payerId="payer:"+crypto.randomUUID();
      await db.batch([
        db.prepare("INSERT INTO bookkeeping_payers(id,household_id,member_id,display_name,payer_type,active) VALUES(?,?,NULL,?,'warga',1)")
          .bind(payerId,householdId,name),
        db.prepare("INSERT INTO resident_directory_profiles(payer_id,status_tinggal,status_aktif,nomor_hp,keterangan) VALUES(?,?,?,?,?)")
          .bind(payerId,null,"Ya",null,remark||null),
        db.prepare("INSERT INTO bookkeeping_payer_iuran_obligations(payer_id,qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan) VALUES(?,?,?,?,?)")
          .bind(payerId,...vals),
        db.prepare("INSERT INTO bookkeeping_payer_obligation_periods(payer_id,effective_from,qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan,created_by) VALUES(?,?,?,?,?,?,?)")
          .bind(payerId,effectiveFrom,...vals,who.id),
        db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)")
          .bind("audit:"+crypto.randomUUID(),who.id,"master_pembukuan","tambah_pembayar_iuran","bookkeeping_payers",payerId,null,
            JSON.stringify({householdId,nama:name,keterangan:remark,effectiveFrom,obligations:Object.fromEntries(keys.map((k,i)=>[k,vals[i]])),memberCreated:false}))
      ]);
      return ok({id:payerId,effective_from:effectiveFrom,keterangan:remark,memberCreated:false});
    }
    const payer = String(payload.payer_id || "");
    if (!payer || payer.length > 130) return err("ID Warga wajib.", 400);
    const keys = ["qty_iuran_bulanan", "qty_kebersihan", "qty_kas_lorong", "qty_arisan"];
    const vals = keys.map((x) => Number(payload[x]));
    if (vals.some((x) => !Number.isInteger(x) || x < 0 || x > 100)) return err("Kewajiban harus 0\u2013100.", 400);
    const valid = await one(db, "SELECT id FROM bookkeeping_payers WHERE id=? AND payer_type='warga'", [payer]);
    if (!valid) return err("Warga tidak ditemukan.", 404);
    // Only the future-dated version can be inserted or edited. The baseline,
    // older schedules, and already-paid allocations never change.
    const prior=await one(db,"SELECT * FROM bookkeeping_payer_obligation_periods WHERE payer_id=? AND effective_from=?",[payer,effectiveFrom]);
    await db.batch([
      db.prepare("INSERT INTO bookkeeping_payer_obligation_periods(payer_id,effective_from,qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan,created_by) VALUES(?,?,?,?,?,?,?) ON CONFLICT(payer_id,effective_from) DO UPDATE SET qty_iuran_bulanan=excluded.qty_iuran_bulanan,qty_kebersihan=excluded.qty_kebersihan,qty_kas_lorong=excluded.qty_kas_lorong,qty_arisan=excluded.qty_arisan,created_by=excluded.created_by")
        .bind(payer,effectiveFrom,...vals,who.id),
      db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)")
        .bind("audit:" + crypto.randomUUID(),who.id,"master_pembukuan","jadwalkan_kewajiban","bookkeeping_payer_obligation_periods",payer,JSON.stringify(prior),JSON.stringify({effectiveFrom,qty:Object.fromEntries(keys.map((k,i)=>[k,vals[i]]))}))
    ]);
    return ok({id:payer,effective_from:effectiveFrom,scheduled:true});
  }
  if(kind==="jersey" && payload?.values?.group_key!==undefined && !["bapak","ibu"].includes(String(payload.values.group_key)))
    return err("Jenis pemesan Jersey harus bapak atau ibu.",400);
  const fields = Object.keys(model.fields), value = payload.values || {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return err("Isian tidak valid.", 400);
  const extraneous = Object.keys(value).filter((k) => !fields.includes(k));
  if (extraneous.length) return err("Kolom tidak didukung: " + extraneous.join(", "), 400);
  let clean = {};
  try {
    for (const key of fields) {
      if(!Object.hasOwn(value,key))continue;
      // Kolom relasi proyek memakai NOT NULL DEFAULT ''; kosong adalah nilai sah,
      // bukan NULL. Proyek pesanan tidak wajib punya relasi kas atau portal.
      if(kind==="projects"&&["fund_source","linked_key"].includes(key)){
        const raw=String(value[key]??"").trim();
        if(raw.length>500)throw Error("Kategori kas atau portal terlalu panjang.");
        clean[key]=raw;
      }else clean[key]=normalizeContent(model.fields[key],value[key]);
    }
  } catch (e) {
    return err(e.message, 400);
  }
  const exists = id ? await one(db, "SELECT * FROM " + model.table + " WHERE id=?", [id]) : null;
  if (id && !exists) return err("Data yang diedit tidak ditemukan.", 404);
  if (exists) {
    const updates = Object.keys(clean);
    if (!updates.length) return err("Tidak ada perubahan.", 400);
    // Jangan ganti jenis proyek yang sudah memiliki pesanan/kontribusi; catatan lama harus tetap bisa diaudit.
    if(kind==="projects"&&clean.project_kind&&clean.project_kind!==exists.project_kind){
      const [orders,contributions]=await Promise.all([
        one(db,"SELECT COUNT(*) AS n FROM portal_project_orders WHERE project_id=?",[id]),
        one(db,"SELECT COUNT(*) AS n FROM portal_project_contributions WHERE project_id=?",[id])
      ]);
      if(Number(orders?.n||0)+Number(contributions?.n||0)>0)
        return err("Jenis proyek sudah memiliki catatan. Arsipkan proyek dan buat proyek baru agar riwayat tetap aman.",409);
    }
    const changed = { ...exists, ...clean };
    if (model.required.some((k) => !changed[k])) return err("Kolom wajib belum diisi.", 400);
    const jerseyIncrease=kind==="jersey"?treasuryJerseyPaid(changed)-treasuryJerseyPaid(exists):0;
    const jerseyObserved=jerseyIncrease>0?treasuryReceiptObservation(db,"jersey",id,"jersey",jerseyIncrease,
      "Penerimaan Jersey — "+String(changed.resident||"").slice(0,90)):null;
    await db.batch([
      db.prepare("UPDATE " + model.table + " SET " + updates.map((k) => k + "=?").join(",") + " WHERE id=?").bind(...updates.map((k) => clean[k]), id),
      ...(jerseyObserved?[jerseyObserved]:[]),
      db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)").bind("audit:" + crypto.randomUUID(), who.id, "portal_content", "edit", model.table, id, JSON.stringify(exists), JSON.stringify(changed))
    ]);
    return ok({ id, updated: true });
  }
  for (const k of fields) if (!(k in clean)) clean[k] =
    kind==="projects"&&k==="project_kind"?"informasi":
    kind==="projects"&&["fund_source","linked_key"].includes(k)?"": 
    model.fields[k]==="bool"?1:["order","fundTarget"].includes(model.fields[k])?0:null;
  if (model.required.some((k) => !clean[k])) return err("Kolom wajib belum diisi.", 400);
  const newId = kind + ":web:" + crypto.randomUUID(), cols = ["id", ...fields];
  const jerseyPaid=kind==="jersey"?treasuryJerseyPaid(clean):0;
  const jerseyObserved=jerseyPaid>0?treasuryReceiptObservation(db,"jersey",newId,"jersey",jerseyPaid,
    "Penerimaan Jersey — "+String(clean.resident||"").slice(0,90)):null;
  await db.batch([
    db.prepare("INSERT INTO " + model.table + "(" + cols.join(",") + ") VALUES(" + cols.map(() => "?").join(",") + ")").bind(newId, ...fields.map((k) => clean[k])),
    ...(jerseyObserved?[jerseyObserved]:[]),
    db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)").bind("audit:" + crypto.randomUUID(), who.id, "portal_content", "create", model.table, newId, null, JSON.stringify(clean))
  ]);
  return ok({ id: newId, created: true }, 201);
}
__name(handleAdminContent, "handleAdminContent");
// Pusat Keuangan: dua dimensi per rupiah (pos dana + tempat uang).
// Jurnal ini add-only. Saldo awal ditetapkan sekali; tidak mengimpor buku kas historis.
async function treasuryCatalog(db){
  const funds=[
    {id:"kas_rt",name:"Kas Lorong",cash:"cash:kas_rt"},
    {id:"bank_warga",name:"Bank Sampah — Hak Warga",cash:"cash:bank_sampah"},
    {id:"bank_lingkungan",name:"Bank Sampah — Kas Pengelola",cash:"cash:bank_sampah"},
    {id:"bank_kas_lorong",name:"Bank Sampah — Bagian Kas Lorong",cash:"cash:bank_sampah"},
    {id:"bank_cadangan",name:"Bank Sampah — Cadangan",cash:"cash:bank_sampah"},
    {id:"jersey",name:"Jersey",cash:"cash:jersey"}
  ];
  const [projects,customFunds,usedFunds]=await Promise.all([
    list(db,"SELECT id,title,linked_key,active FROM portal_project_cards WHERE project_kind IN ('pesanan','penggalangan') ORDER BY sort_order,id LIMIT 150"),
    list(db,"SELECT id,name,cash_location,purpose,active FROM treasury_funds ORDER BY name LIMIT 150"),
    list(db,"SELECT DISTINCT fund_id FROM treasury_entries")
  ]);
  const used=new Set(usedFunds.map(x=>x.fund_id));
  for(const p of projects){
    // Avoid a second Jersey fund for a project card that links to the Jersey module.
    const linked=String(p.linked_key||"").trim().toLowerCase()==="jersey"||
      /^(?:pemesanan\s*)?jersey$/i.test(String(p.title||"").trim());
    if(linked){
      if(!used.has("project:"+p.id))continue;
    }
    if(!Number(p.active)){
      if(!used.has("project:"+p.id))continue;
    }
    funds.push({id:"project:"+p.id,name:"Projek — "+p.title,cash:"cash:project:"+p.id,kind:"project",active:!!Number(p.active)});
  }
  for(const f of customFunds){
    if(!Number(f.active)&&!used.has(f.id))continue;
    funds.push({id:f.id,name:f.name,cash:f.cash_location,kind:"custom",
      purpose:f.purpose,active:!!Number(f.active)});
  }
  const locations=[
    {id:"qris",name:"QRIS",type:"qris"},
    {id:"mandiri",name:"Mandiri",type:"bank"},
    ...[...new Map(funds.map(f=>[f.cash,{id:f.cash,name:"Tunai "+(f.cash==="cash:kas_rt"?"Kas Lorong":f.cash==="cash:bank_sampah"?"Bank Sampah":f.cash==="cash:jersey"?"Jersey":f.name.replace(/^Projek — /,"")),type:"cash"}])).values()]
  ];
  return {funds,locations,customFunds:customFunds.map(f=>({
    id:f.id,name:f.name,purpose:f.purpose,active:!!Number(f.active),hasHistory:used.has(f.id)
  }))};
}
__name(treasuryCatalog,"treasuryCatalog");
// Persis mengikuti fund_position hasil pengesahan penjualan Bank Sampah.
// Kas lorong dari Bank Sampah belum dianggap Cash Humas sampai ada serah terima.
function treasuryBankFund(position){
 const value=String(position||"").trim().toLowerCase();
 if(value==="tabungan_warga")return "bank_warga";
 if(value==="operasional"||value==="lingkungan")return "bank_lingkungan";
 if(value==="kas_lorong")return "bank_kas_lorong";
 if(value==="cadangan")return "bank_cadangan";
 return "";
}
__name(treasuryBankFund,"treasuryBankFund");
// Only posted Humas cash belongs to Kas Lorong. Never import Iuran RT,
// Kebersihan or Arisan payment allocations into the Humas treasury.
function treasuryBookCashEligible(row){
 const category=String(row?.category||"").trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ");
 const type=String(row?.transaction_type||"").trim().toLowerCase().replace(/[_-]+/g," ");
 if(!category&&!type)return false;
 if(/^(?:setoran\s*rt|iuran\s*rt|kebersihan|arisan|saldo\s*awal)(?:\s|$)/.test(category))return false;
 if(/^(?:setoran\s*rt|iuran\s*rt|kebersihan|arisan|saldo\s*awal)(?:\s|$)/.test(type))return false;
 return true;
}
__name(treasuryBookCashEligible,"treasuryBookCashEligible");
// Documented payment observations are proposals, NOT automatically booked cash.
function treasuryJerseyPaid(row){
  if(!row)return 0;
  const tags=[...String(row.method||"").matchAll(/\[F4BAYAR:(\d{1,12})\]/g)];
  if(tags.length)return Number(tags[tags.length-1][1]);
  const price=Math.max(0,Number(row.nominal_rp)||0);
  const st=String(row.payment_status||"").toLowerCase();
  if(st.includes("lunas")&&!/\b(belum|blm|tidak|non)\s*lunas\b/.test(st))return price;
  if(!/dp|cicil/.test(st))return 0;
  const m=st.match(/(?:rp\s*)?(\d[\d.,]*)/i);
  if(!m)return 0;
  let n=Number(m[1].replace(/[.,]/g,""));
  if(n>0&&n<1000)n*=1000;
  return Number.isSafeInteger(n)?n:0;
}
__name(treasuryJerseyPaid,"treasuryJerseyPaid");
function treasuryReceiptObservation(db,kind,id,fund,amount,note){
  if(!Number.isSafeInteger(amount)||amount<=0)return null;
  return db.prepare(`INSERT INTO treasury_receipt_observations
    (id,source_kind,source_id,fund_id,amount_rp,observed_on,note)
    SELECT ?,?,?,?,?,date('now','+7 hours'),?
    WHERE EXISTS(SELECT 1 FROM treasury_config WHERE id=1 AND confirmed_at IS NOT NULL)`)
    .bind("observation:"+crypto.randomUUID(),kind,id,fund,amount,String(note||"Penerimaan baru").slice(0,240));
}
__name(treasuryReceiptObservation,"treasuryReceiptObservation");
// Source references are classified independently; reading them NEVER changes balances.
function treasurySuggestedLocation(method){
 const text=String(method||"").toLowerCase().trim();
 const found=[
  /(?:qris|(?:^|\W)qr(?:\W|$))/.test(text)?"qris":"",
  /mandiri|transfer|rekening/.test(text)?"mandiri":"",
  /cash|tunai|kontan/.test(text)?"cash":""
 ].filter(Boolean);
 // Pembayaran campuran tidak boleh ditebak menjadi satu lokasi.
 if(found.length!==1)return "";
 return found[0]==="cash"?"cash":found[0];
}
__name(treasurySuggestedLocation,"treasurySuggestedLocation");
// Semua transaksi yang memenuhi syarat muncul otomatis untuk diperiksa.
// Deteksi tidak mengubah saldo; hanya pengesahan yang membuat mutasi terpusat.
async function treasurySources(db,confirmedOn){
 if(!confirmedOn)return {pending:[],partial:false,warnings:[]};
 const [cash,bank,contributions,observed,wCash,wBank,wContribution,wObservation]=await Promise.all([
  list(db,`SELECT c.id,c.occurred_on,c.transaction_type,c.category,c.note,c.debit_rp,c.credit_rp
    FROM bookkeeping_cash_transactions_posted c WHERE c.status='aktif' AND c.occurred_on>=?
      AND (c.debit_rp>0 OR c.credit_rp>0)
      AND LOWER(TRIM(COALESCE(c.category,''))) NOT LIKE 'setoran rt%'
      AND LOWER(TRIM(COALESCE(c.category,''))) NOT LIKE 'iuran rt%'
      AND LOWER(TRIM(COALESCE(c.category,''))) NOT LIKE 'kebersihan%'
      AND LOWER(TRIM(COALESCE(c.category,''))) NOT LIKE 'arisan%'
      AND LOWER(TRIM(COALESCE(c.category,''))) NOT LIKE 'saldo awal%'
      AND LOWER(TRIM(COALESCE(c.transaction_type,''))) NOT IN ('setoran_rt','iuran_rt','kebersihan','arisan','saldo_awal')
      AND NOT EXISTS(SELECT 1 FROM treasury_events t WHERE t.request_key='source:book:'||c.id)
      AND NOT EXISTS(SELECT 1 FROM treasury_source_exclusions e WHERE e.source_key='source:book:'||c.id)
    ORDER BY c.occurred_on,c.id LIMIT 101`,[confirmedOn]),
  list(db,`SELECT c.id,c.occurred_on,c.fund_position,c.transaction_type,c.note,c.cash_in_rp,c.cash_out_rp,
      b.confirmed_at AS sale_confirmed_at,
      CASE WHEN c.transaction_type='penjualan_terkonfirmasi' AND b.confirmed_at IS NOT NULL
        THEN substr(b.confirmed_at,1,10) ELSE c.occurred_on END AS treasury_date
    FROM waste_cash_ledger c
    LEFT JOIN waste_sales s ON c.transaction_type='penjualan_terkonfirmasi'
      AND s.id=c.source_transaction_id AND s.status='terkonfirmasi'
    LEFT JOIN waste_batches b ON b.id=s.batch_id AND b.status='disahkan'
    WHERE c.status='aktif'
      AND (c.transaction_type!='penjualan_terkonfirmasi' OR b.confirmed_at IS NOT NULL)
      AND (c.occurred_on>=? OR
        (c.transaction_type='penjualan_terkonfirmasi' AND b.confirmed_at>=
          (SELECT confirmed_at FROM treasury_config WHERE id=1)))
      AND (c.cash_in_rp>0 OR c.cash_out_rp>0)
      AND NOT EXISTS(SELECT 1 FROM treasury_events t WHERE t.request_key='source:bank:'||c.id)
      AND NOT EXISTS(SELECT 1 FROM treasury_source_exclusions e WHERE e.source_key='source:bank:'||c.id)
      AND NOT EXISTS(SELECT 1 FROM treasury_bank_source_coverage z WHERE z.source_id=c.id)
    ORDER BY treasury_date,c.id LIMIT 101`,[confirmedOn]),
  list(db,`SELECT c.id,c.project_id,c.contributor,c.amount_rp,c.payment_method,c.contributed_on,c.notes
    FROM portal_project_contributions c JOIN portal_project_cards p ON p.id=c.project_id
    WHERE c.status='aktif' AND p.project_kind='penggalangan' AND c.contributed_on>=? AND c.amount_rp>0
      AND NOT EXISTS(SELECT 1 FROM treasury_events t WHERE t.request_key='source:contribution:'||c.id)
      AND NOT EXISTS(SELECT 1 FROM treasury_source_exclusions e WHERE e.source_key='source:contribution:'||c.id)
    ORDER BY c.contributed_on,c.id LIMIT 101`,[confirmedOn]),
  list(db,`SELECT o.id,o.source_kind,o.source_id,o.fund_id,o.amount_rp,o.observed_on,o.note
    FROM treasury_receipt_observations o
    WHERE o.observed_on>=? AND o.created_at>=
       (SELECT confirmed_at FROM treasury_config WHERE id=1)
      AND NOT EXISTS(SELECT 1 FROM treasury_events t WHERE t.request_key='source:receipt:'||o.id)
      AND NOT EXISTS(SELECT 1 FROM treasury_source_exclusions e WHERE e.source_key='source:receipt:'||o.id)
    ORDER BY o.created_at,o.id LIMIT 101`,[confirmedOn]),
  list(db,`SELECT e.request_key AS source_key FROM treasury_events e
    LEFT JOIN bookkeeping_cash_transactions_posted c ON e.request_key='source:book:'||c.id AND c.status='aktif'
    WHERE e.request_key LIKE 'source:book:%' AND
      (c.id IS NULL OR COALESCE(c.debit_rp,0)-COALESCE(c.credit_rp,0) <>
        (SELECT COALESCE(SUM(x.amount_rp),0) FROM treasury_entries x WHERE x.event_id=e.id))
    LIMIT 25`),
  list(db,`SELECT e.request_key AS source_key FROM treasury_events e
    LEFT JOIN waste_cash_ledger c ON e.request_key='source:bank:'||c.id AND c.status='aktif'
    WHERE e.request_key LIKE 'source:bank:%' AND
      (c.id IS NULL OR COALESCE(c.cash_in_rp,0)-COALESCE(c.cash_out_rp,0) <>
        (SELECT COALESCE(SUM(x.amount_rp),0) FROM treasury_entries x WHERE x.event_id=e.id))
    LIMIT 25`),
  list(db,`SELECT e.request_key AS source_key FROM treasury_events e
    LEFT JOIN portal_project_contributions c ON e.request_key='source:contribution:'||c.id AND c.status='aktif'
    WHERE e.request_key LIKE 'source:contribution:%' AND
      (c.id IS NULL OR COALESCE(c.amount_rp,0) <>
        (SELECT COALESCE(SUM(x.amount_rp),0) FROM treasury_entries x WHERE x.event_id=e.id))
    LIMIT 25`),
  list(db,`SELECT e.request_key AS source_key FROM treasury_events e
    LEFT JOIN treasury_receipt_observations o ON e.request_key='source:receipt:'||o.id
    WHERE e.request_key LIKE 'source:receipt:%' AND
      (o.id IS NULL OR COALESCE(o.amount_rp,0) <>
        (SELECT COALESCE(SUM(x.amount_rp),0) FROM treasury_entries x WHERE x.event_id=e.id)
       OR (o.source_kind='project_order' AND NOT EXISTS(
         SELECT 1 FROM portal_project_orders p WHERE p.id=o.source_id AND p.status='aktif'))
       OR (o.source_kind='jersey' AND NOT EXISTS(
         SELECT 1 FROM portal_jersey_orders j WHERE j.id=o.source_id)))
    LIMIT 25`)
 ]);
 const pending=[
  ...cash.filter(treasuryBookCashEligible).slice(0,100).map(x=>({type:"book",id:x.id,date:x.occurred_on,
    fund:"kas_rt",note:[x.category,x.note].filter(Boolean).join(" — ").slice(0,240)||"Kas Lorong",
    category:x.category||"Kas Lorong",amountRp:Number(x.debit_rp||0)-Number(x.credit_rp||0),
    suggestedLocation:"cash:kas_rt",sourceLabel:"Pembukuan Kas Lorong"})),
  ...bank.slice(0,100).map(x=>({type:"bank",id:x.id,date:x.treasury_date||x.occurred_on,
    sourceDate:x.occurred_on,sourceConfirmedAt:x.sale_confirmed_at||"",
    fund:treasuryBankFund(x.fund_position),
    note:x.note||x.transaction_type||"Bank Sampah",category:"Bank Sampah",
    amountRp:Number(x.cash_in_rp||0)-Number(x.cash_out_rp||0),
    suggestedLocation:"",sourceLabel:"Bank Sampah"})),
  ...contributions.slice(0,100).map(x=>({type:"contribution",id:x.id,date:x.contributed_on,
    fund:"project:"+x.project_id,note:"Donasi — "+x.contributor+(x.notes?" · "+x.notes:""),
    category:"Donasi",amountRp:Number(x.amount_rp||0),
    suggestedLocation:treasurySuggestedLocation(x.payment_method)==="cash"?"cash:project:"+x.project_id:treasurySuggestedLocation(x.payment_method),
    sourceLabel:"Penggalangan Dana"})),
  ...observed.slice(0,100).map(x=>({type:"receipt",id:x.id,date:x.observed_on,
    fund:x.fund_id,note:x.note,category:x.source_kind==="jersey"?"Jersey":"Pesanan",
    amountRp:Number(x.amount_rp),suggestedLocation:"",sourceLabel:x.source_kind==="jersey"?"Jersey":"Pesanan Barang"}))
 ].filter(x=>!!x.fund&&Number.isSafeInteger(x.amountRp)&&x.amountRp!==0)
  .sort((a,b)=>b.date.localeCompare(a.date)||a.type.localeCompare(b.type));
 return {pending,partial:[cash,bank,contributions,observed].some(a=>a.length>100),
   warnings:[...wCash,...wBank,...wContribution,...wObservation].map(x=>x.source_key)};
}
__name(treasurySources,"treasurySources");
async function treasurySourceRow(db,type,id){
 if(type==="book"){
  const row=await one(db,`SELECT id,occurred_on,transaction_type,category,note,debit_rp,credit_rp FROM bookkeeping_cash_transactions_posted
    WHERE id=? AND status='aktif' LIMIT 1`,[id]);
  return row&&treasuryBookCashEligible(row)?{type,id,date:row.occurred_on,fund:"kas_rt",
    note:row.category||row.note||"Kas Lorong",amount:Number(row.debit_rp||0)-Number(row.credit_rp||0)}:null;
 }
 if(type==="bank"){
  const row=await one(db,`SELECT c.id,c.occurred_on,c.fund_position,c.transaction_type,c.note,c.cash_in_rp,c.cash_out_rp,
    b.confirmed_at AS sale_confirmed_at,
    CASE WHEN c.transaction_type='penjualan_terkonfirmasi' AND b.confirmed_at IS NOT NULL
      THEN substr(b.confirmed_at,1,10) ELSE c.occurred_on END AS treasury_date
    FROM waste_cash_ledger c
    LEFT JOIN waste_sales s ON c.transaction_type='penjualan_terkonfirmasi'
      AND s.id=c.source_transaction_id AND s.status='terkonfirmasi'
    LEFT JOIN waste_batches b ON b.id=s.batch_id AND b.status='disahkan'
    WHERE c.id=? AND c.status='aktif'
      AND (c.transaction_type!='penjualan_terkonfirmasi' OR b.confirmed_at IS NOT NULL)
    LIMIT 1`,[id]);
  if(!row||!treasuryBankFund(row.fund_position))return null;
  if(await one(db,"SELECT source_id FROM treasury_bank_source_coverage WHERE source_id=?",[id]))
    return null;
  const date=row.treasury_date||row.occurred_on;
  // Tanggal penjualan lama bukan tanggal dana disahkan; keduanya disimpan untuk audit.
  const note=(row.note||row.transaction_type||"Bank Sampah")+
    (row.sale_confirmed_at&&date!==row.occurred_on?" (jual "+row.occurred_on+")":"");
  return {type,id,date,fund:treasuryBankFund(row.fund_position),
    note:note.slice(0,240),amount:Number(row.cash_in_rp||0)-Number(row.cash_out_rp||0)};
 }
 if(type==="contribution"){
  const row=await one(db,`SELECT c.id,c.project_id,c.contributor,c.amount_rp,c.contributed_on,c.notes
    FROM portal_project_contributions c JOIN portal_project_cards p ON p.id=c.project_id
    WHERE c.id=? AND c.status='aktif' AND p.project_kind='penggalangan' LIMIT 1`,[id]);
  return row&&{type,id,date:row.contributed_on,fund:"project:"+row.project_id,
    note:"Donasi — "+row.contributor+(row.notes?" · "+row.notes:""),amount:Number(row.amount_rp||0)};
 }
 if(type==="receipt"){
  const row=await one(db,`SELECT o.id,o.source_kind,o.source_id,o.fund_id,o.amount_rp,o.observed_on,o.note,
    o.created_at FROM treasury_receipt_observations o WHERE o.id=? LIMIT 1`,[id]);
  if(!row)return null;
  const cfg=await one(db,"SELECT confirmed_at FROM treasury_config WHERE id=1");
  if(!cfg?.confirmed_at||row.created_at<cfg.confirmed_at)return null;
  // Observasi berasal dari kenaikan pembayaran di modul sumber; jika sumber
  // sudah dibatalkan/hilang, wajib diperiksa dulu dan tidak boleh disahkan.
  if(row.source_kind==="project_order"){
    const source=await one(db,"SELECT status,paid_rp FROM portal_project_orders WHERE id=?",[row.source_id]);
    if(!source||source.status!=="aktif"||Number(source.paid_rp)<Number(row.amount_rp))return null;
  }else if(row.source_kind==="jersey"){
    const source=await one(db,"SELECT payment_status,nominal_rp,method FROM portal_jersey_orders WHERE id=?",[row.source_id]);
    if(!source||treasuryJerseyPaid(source)<Number(row.amount_rp))return null;
  }
  return {type,id,date:row.observed_on,fund:row.fund_id,note:row.note,amount:Number(row.amount_rp)};
 }
 return null;
}
__name(treasurySourceRow,"treasurySourceRow");
async function treasurySourceBatch(env,who,rows,locationFor){
 const db=env.DB,statements=[];
 for(const src of rows){
  const location=locationFor(src);
  const amount=src.amount,kind=amount>0?"incoming":"outgoing";
  const requestKey="source:"+src.type+":"+src.id;
  const eventId="treasury:source:"+crypto.randomUUID();
  const fingerprint=await sha(JSON.stringify({requestKey,amount,location,fund:src.fund,date:src.date}));
  const note=(src.note||"Transaksi sumber").slice(0,240)||"Transaksi sumber";
  statements.push(db.prepare("INSERT INTO treasury_events(id,request_key,payload_hash,kind,occurred_on,note,created_by) VALUES(?,?,?,?,?,?,?)")
   .bind(eventId,requestKey,fingerprint,kind,src.date,note,who.id));
  const entryId=eventId+":0";
  if(amount<0)
   statements.push(db.prepare(`INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp)
     VALUES(?,?,?,?,CASE WHEN (SELECT COALESCE(SUM(amount_rp),0) FROM treasury_entries WHERE fund_id=? AND location_id=?)>=? THEN ? ELSE 0 END)`)
    .bind(entryId,eventId,src.fund,location,src.fund,location,-amount,amount));
  else statements.push(db.prepare("INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp) VALUES(?,?,?,?,?)")
    .bind(entryId,eventId,src.fund,location,amount));
  statements.push(db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'pusat_keuangan','link_source','treasury_events',?,?,?)")
    .bind("audit:"+crypto.randomUUID(),who.id,eventId,note,JSON.stringify({requestKey,amount,location,fund:src.fund})));
 }
 if(statements.length)await db.batch(statements);
 return rows.length;
}
__name(treasurySourceBatch,"treasurySourceBatch");

// Untuk pengecekan saldo Bank Sampah yang sudah ada di jurnal sumber,
// termasuk penjualan lama yang telah sah sebelum Pusat Keuangan diaktifkan.
function treasuryBankPositions(fundId){
 const map={
  bank_warga:["tabungan_warga"],
  bank_lingkungan:["operasional","lingkungan"],
  bank_kas_lorong:["kas_lorong"],
  bank_cadangan:["cadangan"]
 };
 return map[String(fundId||"")]||[];
}
__name(treasuryBankPositions,"treasuryBankPositions");
async function treasuryApproveBankBalance(db,who,catalog,req){
 const fundId=String(req.fundId||""),location=String(req.location||"");
 const positions=treasuryBankPositions(fundId),fund=catalog.funds.find(x=>x.id===fundId);
 const sourceExpected=req.expectedSourceRp,centralExpected=req.expectedCentralRp,
       availableExpected=req.expectedAvailableRp;
 const key=String(req.requestKey||"");
 if(!fund||fund.active===false||!positions.length||!["qris","mandiri",fund.cash].includes(location)||
    ![sourceExpected,centralExpected,availableExpected].every(Number.isSafeInteger)||
    !/^[a-f0-9-]{36}$/i.test(key)||req.confirmation!=="SUDAH COCOK")
   return err("Pos, tempat, atau nominal tidak valid.",400);
 const fingerprint=await sha(JSON.stringify({fundId,location,sourceExpected,centralExpected,availableExpected}));
 const prior=await one(db,"SELECT id,payload_hash FROM treasury_events WHERE request_key=?",[key]);
 if(prior)return prior.payload_hash===fingerprint?ok({approved:true,duplicate:true}):
   err("Transaksi ini dipakai untuk data berbeda.",409);
 const marks=positions.map(()=>"?").join(",");
 const rows=await list(db,`SELECT id,fund_position,cash_in_rp,cash_out_rp
   FROM waste_cash_ledger WHERE status='aktif' AND fund_position IN (${marks})
   AND (cash_in_rp<>0 OR cash_out_rp<>0) ORDER BY id LIMIT 151`,positions);
 if(rows.length>150)return err("Terlalu banyak transaksi. Periksa satu per satu.",409);
 if(!rows.length)return err("Belum ada dana Bank Sampah.",409);
 const snapshot=rows.map(x=>({id:x.id,position:x.fund_position,
   amount:Number(x.cash_in_rp||0)-Number(x.cash_out_rp||0)}));
 if(snapshot.some(x=>!Number.isSafeInteger(x.amount)))return err("Ada nominal tidak valid.",409);
 const sourceTotal=snapshot.reduce((n,x)=>n+x.amount,0);
 const centralRow=await one(db,"SELECT COALESCE(SUM(amount_rp),0) AS value FROM treasury_entries WHERE fund_id=?",[fundId]);
 const centralTotal=Number(centralRow?.value||0);
 const [coveredRows,linkedRows,excludedRows]=await Promise.all([
  list(db,"SELECT source_id,captured_amount_rp FROM treasury_bank_source_coverage WHERE fund_id=?",[fundId]),
  list(db,"SELECT request_key FROM treasury_events WHERE request_key LIKE 'source:bank:%'"),
  list(db,"SELECT source_key FROM treasury_source_exclusions WHERE source_key LIKE 'source:bank:%'")
 ]);
 const covered=new Map(coveredRows.map(x=>[x.source_id,Number(x.captured_amount_rp)]));
 const linked=new Set(linkedRows.map(x=>String(x.request_key)));
 const excluded=new Set(excludedRows.map(x=>String(x.source_key)));
 if(snapshot.some(x=>covered.has(x.id)&&covered.get(x.id)!==x.amount))
   return err("Data Bank Sampah yang sudah disahkan berubah. Periksa riwayat.",409);
 const fresh=snapshot.filter(x=>!covered.has(x.id)&&
   !linked.has("source:bank:"+x.id)&&!excluded.has("source:bank:"+x.id));
 const available=fresh.reduce((n,x)=>n+x.amount,0);
 // Selisih total bukan bukti dana baru: kas bisa sudah dibelanjakan/dipindahkan.
 // Hanya nominal yang belum pernah diperiksa boleh ditambahkan.
 const gap=sourceTotal-centralTotal;
 if(sourceExpected!==sourceTotal||centralExpected!==centralTotal||availableExpected!==available)
   return err("Nominal berubah. Muat ulang dan periksa lagi.",409);
 if(!Number.isSafeInteger(available)||available<=0||available>10000000000)
   return err("Tidak ada dana baru untuk disahkan.",409);
 if(gap<=0||available>gap)
   return err("Ada dana yang mungkin sudah masuk saldo awal. Periksa transaksi satu per satu.",409);
 const eventId="treasury:bank-review:"+crypto.randomUUID();
 const date=new Date(Date.now()+7*3600000).toISOString().slice(0,10);
 const eventNote=("Pengesahan Bank Sampah — "+fund.name).slice(0,240);
 const statements=[
   db.prepare("INSERT INTO treasury_events(id,request_key,payload_hash,kind,occurred_on,note,created_by) VALUES(?,?,?,?,?,?,?)")
     .bind(eventId,key,fingerprint,"incoming",date,eventNote,who.id),
   db.prepare(`INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp)
     VALUES(?,?,?,?,CASE WHEN
      (SELECT COALESCE(SUM(cash_in_rp-cash_out_rp),0) FROM waste_cash_ledger
       WHERE status='aktif' AND fund_position IN (${marks}))=?
      AND (SELECT COALESCE(SUM(amount_rp),0) FROM treasury_entries WHERE fund_id=?)=?
      THEN ? ELSE 0 END)`)
     .bind(eventId+":0",eventId,fundId,location,...positions,sourceTotal,fundId,centralTotal,available)
 ];
 for(const x of fresh){
   const sourceKey="source:bank:"+x.id;
   statements.push(db.prepare(`INSERT INTO treasury_bank_source_coverage
     (source_id,event_id,fund_id,captured_amount_rp)
     VALUES(?,?,?,CASE WHEN
      (SELECT cash_in_rp-cash_out_rp FROM waste_cash_ledger
       WHERE id=? AND status='aktif' AND fund_position=?)=?
      AND NOT EXISTS(SELECT 1 FROM treasury_events WHERE request_key=?)
      AND NOT EXISTS(SELECT 1 FROM treasury_source_exclusions WHERE source_key=?)
      THEN ? ELSE NULL END)`)
     .bind(x.id,eventId,fundId,x.id,x.position,x.amount,sourceKey,sourceKey,x.amount));
 }
 statements.push(db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'pusat_keuangan','approve_bank_balance','treasury_events',?,?,?)")
  .bind("audit:"+crypto.randomUUID(),who.id,eventId,"Pengesahan Bank Sampah",
     JSON.stringify({fundId,location,sourceTotal,centralTotal,available,sourceIds:fresh.map(x=>x.id)})));
 try{await db.batch(statements)}
 catch{
   const winner=await one(db,"SELECT id,payload_hash FROM treasury_events WHERE request_key=?",[key]);
   if(winner)return winner.payload_hash===fingerprint?ok({approved:true,duplicate:true}):
      err("Transaksi ini dipakai untuk data berbeda.",409);
   return err("Dana berubah atau sudah disahkan. Muat ulang.",409);
 }
 return ok({approved:true,amountRp:available,fundId,location},201);
}
__name(treasuryApproveBankBalance,"treasuryApproveBankBalance");

async function treasuryApi(request,env,who,url){
  const denied=superadmin(who);if(denied)return denied;
  const db=env.DB,method=request.method;
  const catalog=await treasuryCatalog(db);
  const config=await one(db,"SELECT confirmed_on,confirmed_at,confirmed_by FROM treasury_config WHERE id=1");
  if(!config)return err("Skema Pusat Keuangan belum tersedia.",503);
  if(method==="GET"){
    const [balances,history,openings,openingBalances]=await Promise.all([
      list(db,"SELECT fund_id,location_id,COALESCE(SUM(amount_rp),0) AS amount_rp FROM treasury_entries GROUP BY fund_id,location_id"),
      list(db,`SELECT v.id,v.kind,v.occurred_on,v.note,v.created_at,v.created_by,
            e.fund_id,e.location_id,e.amount_rp
            FROM treasury_events v JOIN treasury_entries e ON e.event_id=v.id
            ORDER BY v.occurred_on DESC,v.created_at DESC,v.id DESC,e.id LIMIT 801`),
      one(db,"SELECT COUNT(*) AS n,MIN(occurred_on) AS date_first,MAX(occurred_on) AS date_last FROM treasury_events WHERE kind='opening'"),
      list(db,`SELECT e.fund_id,e.location_id,COALESCE(SUM(e.amount_rp),0) AS amount_rp
        FROM treasury_entries e JOIN treasury_events t ON t.id=e.event_id
        WHERE t.kind='opening' GROUP BY e.fund_id,e.location_id`)
    ]);
    const total=balances.reduce((n,row)=>n+Number(row.amount_rp||0),0);
    const complete=history.length<=800;
    const [sources,exclusions,bankSourceTotals,bankUnreviewed,bankCoverageWarnings]=await Promise.all([
      treasurySources(db,config.confirmed_on),
      list(db,"SELECT source_key,reason,excluded_at FROM treasury_source_exclusions ORDER BY excluded_at DESC LIMIT 101"),
      list(db,`SELECT fund_position,COALESCE(SUM(cash_in_rp-cash_out_rp),0) AS amount_rp
        FROM waste_cash_ledger WHERE status='aktif' GROUP BY fund_position ORDER BY fund_position`),
      list(db,`SELECT c.fund_position,COUNT(*) AS count,
          COALESCE(SUM(c.cash_in_rp-c.cash_out_rp),0) AS amount_rp
        FROM waste_cash_ledger c WHERE c.status='aktif' AND (c.cash_in_rp<>0 OR c.cash_out_rp<>0)
        AND NOT EXISTS(SELECT 1 FROM treasury_bank_source_coverage x WHERE x.source_id=c.id)
        AND NOT EXISTS(SELECT 1 FROM treasury_events t WHERE t.request_key='source:bank:'||c.id)
        AND NOT EXISTS(SELECT 1 FROM treasury_source_exclusions e WHERE e.source_key='source:bank:'||c.id)
        GROUP BY c.fund_position`),
      list(db,`SELECT c.source_id FROM treasury_bank_source_coverage c
        LEFT JOIN waste_cash_ledger s ON s.id=c.source_id
        WHERE s.id IS NULL OR s.status!='aktif' OR
          c.captured_amount_rp<>COALESCE(s.cash_in_rp-s.cash_out_rp,0) LIMIT 25`)
    ]);
    return ok({catalog,confirmed:!!config.confirmed_at,confirmedOn:config.confirmed_on||null,
      openingCount:Number(openings?.n||0),openingDate:openings?.date_first||null,
      openingDateConsistent:!openings?.date_first||openings.date_first===openings.date_last,totalRp:total,balances,openingBalances,
      history:history.slice(0,800),riwayatLengkap:complete,
      sources:sources.pending,sourcePartial:sources.partial,sourceWarnings:sources.warnings,
      bankSourceBalances:bankSourceTotals.map(x=>({fundId:treasuryBankFund(x.fund_position),sourcePosition:x.fund_position,
        amountRp:Number(x.amount_rp||0)})).filter(x=>x.fundId),
      bankPendingCounts:bankUnreviewed.map(x=>({fundId:treasuryBankFund(x.fund_position),
        count:Number(x.count||0),amountRp:Number(x.amount_rp||0)})).filter(x=>x.fundId),
      bankCoverageWarnings:bankCoverageWarnings.map(x=>x.source_id),
      excludedSources:exclusions.slice(0,100),exclusionPartial:exclusions.length>100,
      sourceIntegration:"reconciliation-required"});
  }
  if(method!=="POST")return err("Metode tidak tersedia.",405);
  if(env.FINANCE_WRITE_ENABLED!=="true")return err("Pencatatan keuangan belum diaktifkan.",503);
  const origin=request.headers.get("origin")||"";
  if(origin&&!["https://flamboyan4.web.id","https://www.flamboyan4.web.id"].includes(origin))
    return err("Asal permintaan tidak diizinkan.",403);
  let p;try{p=await body(request)}catch(e){return err("Isian tidak valid.",400)}
  if(p.action==="approve-bank-balance"){
    if(!config.confirmed_at)return err("Sahkan saldo awal terlebih dahulu.",409);
    return treasuryApproveBankBalance(db,who,catalog,p);
  }
  if(p.action==="exclude-source"||p.action==="restore-source"){
    if(!config.confirmed_at)return err("Sahkan saldo awal terlebih dahulu.",409);
    const key=String(p.sourceKey||"");
    if(!/^source:(book|bank|contribution|receipt):.{1,180}$/.test(key))
      return err("Referensi sumber tidak dikenal.",400);
    if(p.action==="exclude-source"){
      const reason=String(p.reason||"").trim();
      if(reason.length<5||reason.length>240)return err("Isi alasan pengecualian minimal 5 karakter.",400);
      const [type,id]=[key.split(":")[1],key.slice("source:".length+key.split(":")[1].length+1)];
      const row=await treasurySourceRow(db,type,id);
      if(!row)return err("Sumber sudah tidak tersedia. Muat ulang.",409);
      if(await one(db,"SELECT id FROM treasury_events WHERE request_key=?",[key]))
        return err("Sumber sudah disahkan. Gunakan koreksi kas, bukan pengecualian.",409);
      try{
        await db.batch([
          db.prepare("INSERT INTO treasury_source_exclusions(source_key,reason,excluded_by) VALUES(?,?,?)")
            .bind(key,reason,who.id),
          db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'pusat_keuangan','exclude_source','treasury_source_exclusions',?,?,?)")
            .bind("audit:"+crypto.randomUUID(),who.id,key,reason,JSON.stringify({sourceKey:key,reason}))
        ]);
      }catch{return err("Sumber sudah dikecualikan atau terjadi konflik.",409)}
      return ok({excluded:true});
    }
    const existing=await one(db,"SELECT reason FROM treasury_source_exclusions WHERE source_key=?",[key]);
    if(!existing)return err("Pengecualian tidak ditemukan.",404);
    await db.batch([
      db.prepare("DELETE FROM treasury_source_exclusions WHERE source_key=?").bind(key),
      db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'pusat_keuangan','restore_source','treasury_source_exclusions',?,?,?)")
        .bind("audit:"+crypto.randomUUID(),who.id,key,"Pulihkan pemeriksaan",JSON.stringify({sourceKey:key,previousReason:existing.reason}))
    ]);
    return ok({restored:true});
  }
  if(p.action==="update-fund"){
    if(!config.confirmed_at)return err("Sahkan saldo awal dahulu.",409);
    const id=String(p.fundId||""),name=String(p.name||"").trim(),
      purpose=String(p.purpose||"").trim(),expectedName=String(p.expectedName||"");
    if(!/^fund:[a-f0-9-]{36}$/i.test(id)||name.length<3||name.length>70||
       purpose.length>200||/[\x00-\x1F\x7F]/.test(name+purpose))
      return err("Nama atau catatan tidak valid.",400);
    const existing=await one(db,"SELECT name,purpose FROM treasury_funds WHERE id=?",[id]);
    if(!existing)return err("Pos tidak ditemukan.",404);
    if(existing.name!==expectedName)return err("Pos berubah. Muat ulang.",409);
    if(catalog.funds.some(f=>f.id!==id&&f.name.toLowerCase()===name.toLowerCase()))
      return err("Nama pos sudah digunakan.",409);
    try{
      const results=await db.batch([
        db.prepare("UPDATE treasury_funds SET name=?,purpose=? WHERE id=? AND name=?")
          .bind(name,purpose,id,expectedName),
        db.prepare(`INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json)
          SELECT ?,?,'pusat_keuangan','update_fund','treasury_funds',?,?,?
          WHERE changes()=1`)
          .bind("audit:"+crypto.randomUUID(),who.id,id,JSON.stringify(existing),JSON.stringify({name,purpose}))
      ]);
      if(Number(results[0]?.meta?.changes||0)!==1)return err("Pos berubah. Muat ulang.",409);
    }catch{return err("Nama pos sudah dipakai atau gagal disimpan.",409)}
    return ok({updated:true});
  }
  if(p.action==="remove-fund"||p.action==="restore-fund"){
    if(!config.confirmed_at)return err("Sahkan saldo awal lebih dahulu.",409);
    const id=String(p.fundId||"");
    if(!/^fund:[a-f0-9-]{36}$/i.test(id))return err("Pos dana tidak valid.",400);
    const fund=await one(db,"SELECT id,name,active FROM treasury_funds WHERE id=?",[id]);
    if(!fund)return err("Pos dana sudah tidak ada.",404);
    const balance=await one(db,`SELECT COUNT(*) AS count,MAX(ABS(balance)) AS highest
      FROM (SELECT location_id,SUM(amount_rp) AS balance
        FROM treasury_entries WHERE fund_id=? GROUP BY location_id)`,[id]);
    if(p.action==="remove-fund"){
      if(!Number(fund.active))return err("Pos sudah tidak aktif.",409);
      if(Number(balance?.highest||0)!==0)return err("Masih ada uang. Pindahkan atau selesaikan saldonya dulu.",409);
      const hasHistory=Number(balance?.count||0)>0;
      const stmt=hasHistory?
        db.prepare(`UPDATE treasury_funds SET active=0 WHERE id=? AND active=1 AND NOT EXISTS(
         SELECT 1 FROM treasury_entries WHERE fund_id=? GROUP BY location_id HAVING SUM(amount_rp)<>0)`).bind(id,id):
        db.prepare("DELETE FROM treasury_funds WHERE id=? AND active=1 AND NOT EXISTS(SELECT 1 FROM treasury_entries WHERE fund_id=?)").bind(id,id);
      const results=await db.batch([
        stmt,
        db.prepare(`INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json)
         SELECT ?,?,'pusat_keuangan',?,'treasury_funds',?,?,?
         WHERE changes()=1`)
         .bind("audit:"+crypto.randomUUID(),who.id,hasHistory?"archive_fund":"delete_fund",
           id,fund.name,JSON.stringify({id,name:fund.name,hasHistory}))
      ]);
      if(Number(results[0]?.meta?.changes||0)!==1)return err("Pos berubah. Muat ulang.",409);
      return ok({removed:true,archived:hasHistory});
    }
    if(Number(fund.active))return err("Pos ini sudah aktif.",409);
    const results=await db.batch([
      db.prepare("UPDATE treasury_funds SET active=1 WHERE id=? AND active=0").bind(id),
      db.prepare(`INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json)
       SELECT ?,?,'pusat_keuangan','restore_fund','treasury_funds',?,?,?
       WHERE changes()=1`)
       .bind("audit:"+crypto.randomUUID(),who.id,id,fund.name,JSON.stringify({id,restored:true}))
    ]);
    if(Number(results[0]?.meta?.changes||0)!==1)return err("Gagal mengaktifkan pos.",409);
    return ok({restored:true});
  }
  if(p.action==="create-fund"){
    const name=String(p.name||"").trim(),purpose=String(p.purpose||"").trim();
    if(name.length<3||name.length>70||purpose.length>200||/[\x00-\x1F\x7F]/.test(name+purpose))
      return err("Nama pos harus 3–70 karakter dan catatan maksimal 200 karakter.",400);
    if(catalog.funds.some(f=>f.name.toLowerCase()===name.toLowerCase()))
      return err("Pos dana dengan nama ini sudah tersedia.",409);
    const id="fund:"+crypto.randomUUID(),location="cash:"+id;
    try{
      await db.batch([
        db.prepare("INSERT INTO treasury_funds(id,name,cash_location,purpose,created_by) VALUES(?,?,?,?,?)")
          .bind(id,name,location,purpose,who.id),
        db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'pusat_keuangan','create_fund','treasury_funds',?,?,?)")
          .bind("audit:"+crypto.randomUUID(),who.id,id,name,JSON.stringify({name,purpose,cash_location:location}))
      ]);
    }catch{return err("Pos dana gagal dibuat atau nama sudah dipakai.",409)}
    return ok({id,name,created:true},201);
  }
  // Periksa satu transaksi sumber, lalu sahkan. Tidak ada impor massal otomatis:
  // pencatatan yang sudah berada di saldo awal tidak boleh dihitung kedua kali.
  if(p.action==="link"||p.action==="sync-book"){
    if(!config.confirmed_at)return err("Sahkan saldo awal sebelum mencocokkan transaksi.",409);
    if(p.action==="sync-book")return err("Gunakan Periksa & Sahkan pada masing-masing transaksi.",409);
    const type=String(p.sourceType||""),id=String(p.sourceId||"");
    const location=String(p.location||"");
    if(!["bank","book","contribution","receipt"].includes(type)||id.length<1||id.length>180)
      return err("Referensi transaksi tidak valid.",400);
    const row=await treasurySourceRow(db,type,id);
    if(!row||!Number.isSafeInteger(row.amount)||row.amount===0)
      return err("Transaksi sumber berubah, dibatalkan, atau tidak valid.",409);
    if(row.date<config.confirmed_on)
      return err("Tanggal sebelum saldo awal, tidak boleh dibukukan ulang.",409);
    if(row.date===config.confirmed_on&&p.sameDayConfirmed!=="SUDAH DIPERIKSA")
      return err("Transaksi bertanggal saldo awal; pastikan uang belum dihitung lalu konfirmasi.",409);
    if(!Number.isSafeInteger(p.expectedAmountRp)||p.expectedAmountRp!==row.amount||
       String(p.expectedFundId||"")!==row.fund)
      return err("Nominal atau pos berubah di sumber. Muat ulang sebelum mengesahkan.",409);
    const fund=catalog.funds.find(f=>f.id===row.fund);
    if(!fund||fund.active===false||!["qris","mandiri",fund.cash].includes(location))
      return err("Pilih tempat uang yang sesuai.",400);
    const key="source:"+type+":"+id;
    if(await one(db,"SELECT source_key FROM treasury_source_exclusions WHERE source_key=?",[key]))
      return err("Sumber ini ditandai sudah tercakup. Pulihkan dahulu bila ingin disahkan.",409);
    if(await one(db,"SELECT id FROM treasury_events WHERE request_key=?",[key]))
      return err("Transaksi ini sudah dicocokkan.",409);
    try{await treasurySourceBatch(env,who,[row],()=>location)}
    catch{return err("Pengesahan ditolak: saldo sumber kurang, data berubah, atau sudah diproses.",409)}
    return ok({imported:1,approved:true});
  }
  // Saldo awal satu formulir: seluruh kombinasi pos/tempat disimpan atomik.
  // Koreksi sebelum disahkan berupa jurnal selisih, bukan UPDATE/DELETE sejarah.
  if(p.action==="opening-grid"){
    if(config.confirmed_at)return err("Saldo awal sudah disahkan dan tidak dapat diubah.",409);
    const date=String(p.date||""),key=String(p.requestKey||"");
    if(!validDate(date)||!/^[a-f0-9-]{36}$/i.test(key)||!Array.isArray(p.positions))
      return err("Tanggal atau format saldo awal tidak valid.",400);
    const allowedPositions=catalog.funds.flatMap(f=>[f.cash,"qris","mandiri"].map(l=>({fundId:f.id,locationId:l})));
    if(p.positions.length!==allowedPositions.length||allowedPositions.length>306)
      return err("Isian saldo awal belum lengkap. Muat ulang.",400);
    const allowedSet=new Set(allowedPositions.map(x=>x.fundId+"|"+x.locationId));
    const unique=new Set(),positions=[];
    for(const x of p.positions){
      const fund=String(x?.fundId||""),location=String(x?.locationId||""),value=x?.amountRp;
      const positionKey=fund+"|"+location;
      if(!allowedSet.has(positionKey)||unique.has(positionKey)||
         !Number.isSafeInteger(value)||value<0||value>10000000000)
        return err("Pos, tempat, atau nominal saldo awal tidak valid.",400);
      unique.add(positionKey);positions.push({fund,location,amount:value});
    }
    positions.sort((a,b)=>(a.fund+"|"+a.location).localeCompare(b.fund+"|"+b.location));
    const fingerprint=await sha(JSON.stringify({date,positions}));
    const previous=await one(db,"SELECT id,payload_hash FROM treasury_events WHERE request_key=?",[key]);
    if(previous)return previous.payload_hash===fingerprint?ok({id:previous.id,duplicate:true}):
      err("Kunci penyimpanan telah digunakan untuk data berbeda.",409);
    const existingDates=await one(db,"SELECT MIN(occurred_on) AS first_date,MAX(occurred_on) AS last_date FROM treasury_events WHERE kind='opening'");
    if(existingDates?.first_date&&(existingDates.first_date!==existingDates.last_date||existingDates.first_date!==date))
      return err("Tanggal saldo awal harus sama dengan tanggal yang sudah tersimpan.",409);
    const currentRows=await list(db,"SELECT fund_id,location_id,COALESCE(SUM(amount_rp),0) AS amount_rp FROM treasury_entries GROUP BY fund_id,location_id");
    const currentMap=new Map(currentRows.map(x=>[x.fund_id+"|"+x.location_id,Number(x.amount_rp)]));
    // Jangan anggap jurnal mutasi sebagai saldo pembuka jika ada transaksi yang tidak sah masuk sebelumnya.
    if(await one(db,"SELECT id FROM treasury_events WHERE kind!='opening' LIMIT 1"))
      return err("Ada transaksi bukan saldo awal. Periksa riwayat sebelum mengubah saldo pembuka.",409);
    const deltas=positions.map(x=>({...x,prior:currentMap.get(x.fund+"|"+x.location)||0}))
      .map(x=>({...x,delta:x.amount-x.prior})).filter(x=>x.delta!==0);
    if(!deltas.length)return ok({unchanged:true});
    const finalTotal=positions.reduce((n,x)=>n+x.amount,0);
    if(!Number.isSafeInteger(finalTotal)||finalTotal<=0)return err("Masukkan minimal satu saldo uang yang benar.",400);
    const eventId="treasury:opening-grid:"+crypto.randomUUID(),note="Saldo awal "+date;
    const statements=[db.prepare(`INSERT INTO treasury_events(id,request_key,payload_hash,kind,occurred_on,note,created_by)
      SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM treasury_config WHERE id=1 AND confirmed_at IS NULL)`)
      .bind(eventId,key,fingerprint,"opening",date,note,who.id)];
    for(const [i,x] of deltas.entries()){
      // Di dalam D1.batch, semua saldo dicek ulang; konflik akan rollback seluruh formulir.
      statements.push(db.prepare(`INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp)
        VALUES(?,?,?,?,CASE WHEN (SELECT COALESCE(SUM(amount_rp),0) FROM treasury_entries
        WHERE fund_id=? AND location_id=?)=? THEN ? ELSE 0 END)`)
        .bind(eventId+":"+i,eventId,x.fund,x.location,x.fund,x.location,x.prior,x.delta));
    }
    statements.push(db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'pusat_keuangan','opening_grid','treasury_events',?,?,?)")
      .bind("audit:"+crypto.randomUUID(),who.id,eventId,"Saldo awal per tempat",
        JSON.stringify({date,changes:deltas.map(x=>({fund:x.fund,location:x.location,from:x.prior,to:x.amount}))})));
    try{await db.batch(statements)}catch{
      const winner=await one(db,"SELECT id,payload_hash FROM treasury_events WHERE request_key=?",[key]);
      if(winner)return winner.payload_hash===fingerprint?ok({id:winner.id,duplicate:true}):
        err("Kunci penyimpanan telah digunakan untuk data berbeda.",409);
      return err("Saldo awal tidak tersimpan. Data mungkin berubah; muat ulang dan periksa kembali.",409);
    }
    return ok({saved:true,updatedPositions:deltas.length,totalRp:finalTotal},201);
  }
  if(p.action==="confirm"){
    const date=String(p.date||"");
    if(config.confirmed_at)return err("Saldo awal sudah dikunci.",409);
    if(p.confirmation!=="SALDO COCOK"||!validDate(date))return err("Tanggal atau konfirmasi saldo tidak benar.",400);
    const last=await one(db,"SELECT MAX(occurred_on) AS tanggal FROM treasury_events WHERE kind='opening'");
    if(!last?.tanggal||date<last.tanggal)return err("Isi saldo awal terlebih dahulu dan gunakan tanggal yang sesuai.",409);
    const checked=await one(db,"SELECT COUNT(*) AS n FROM (SELECT SUM(amount_rp) AS balance FROM treasury_entries GROUP BY fund_id,location_id HAVING balance<0)");
    if(Number(checked?.n||0))return err("Saldo awal memiliki posisi negatif.",409);
    const inconsistent=await one(db,"SELECT MIN(occurred_on) AS first_date,MAX(occurred_on) AS last_date FROM treasury_events WHERE kind='opening'");
    if(inconsistent?.first_date!==date||inconsistent?.last_date!==date)
      return err("Tanggal pengesahan harus sama dengan tanggal saldo awal.",409);
    const result=await db.prepare("UPDATE treasury_config SET confirmed_on=?,confirmed_at=CURRENT_TIMESTAMP,confirmed_by=? WHERE id=1 AND confirmed_at IS NULL").bind(date,who.id).run();
    return Number(result.meta?.changes||0)===1?ok({confirmed:true,confirmedOn:date}):err("Saldo awal sudah dikunci dari sesi lain.",409);
  }
  const kind=String(p.action||"");
  if(!["opening","incoming","outgoing","move","allocation"].includes(kind))return err("Jenis transaksi tidak dikenal.",400);
  if(kind==="opening"&&config.confirmed_at)return err("Saldo awal sudah dikunci; gunakan koreksi tercatat.",409);
  if(kind!=="opening"&&!config.confirmed_at)return err("Cocokkan dan sahkan saldo awal lebih dahulu.",409);
  const amount=Number(p.amountRp),date=String(p.date||""),note=String(p.note||"").trim(),key=String(p.requestKey||"");
  const fromFund=String(p.fromFund||""),fromLoc=String(p.fromLocation||"");
  const toFund=String(p.toFund||""),toLoc=String(p.toLocation||"");
  if(!Number.isSafeInteger(amount)||amount<1||amount>10000000000||!validDate(date)||
     note.length<4||note.length>240||!/^[a-f0-9-]{36}$/i.test(key)||
     config.confirmed_on&&date<config.confirmed_on)
    return err("Tanggal, nominal, keterangan, atau kunci transaksi tidak valid.",400);
  const lookup=new Map(catalog.funds.map(f=>[f.id,f]));
  const allowed=(fund,location)=>{
    const info=lookup.get(fund);
    return !!info&&info.active!==false&&["qris","mandiri",info.cash].includes(location);
  };
  let entries=[];
  if(kind==="opening"||kind==="incoming"){
    if(!allowed(toFund,toLoc))return err("Pilih pos dan tempat penerimaan yang sesuai.",400);
    entries=[{fund:toFund,location:toLoc,amount}];
  }else if(kind==="outgoing"){
    if(!allowed(fromFund,fromLoc))return err("Pilih pos dan tempat pengeluaran yang sesuai.",400);
    entries=[{fund:fromFund,location:fromLoc,amount:-amount}];
  }else if(kind==="move"){
    if(!allowed(fromFund,fromLoc)||!allowed(fromFund,toLoc)||fromLoc===toLoc)
      return err("Tempat asal dan tujuan harus berbeda dalam pos yang sama.",400);
    entries=[{fund:fromFund,location:fromLoc,amount:-amount},{fund:fromFund,location:toLoc,amount}];
  }else{
    if(!allowed(fromFund,fromLoc)||!allowed(toFund,toLoc)||fromFund===toFund)
      return err("Pilih dua pos berbeda dengan tempat dana yang sesuai.",400);
    entries=[{fund:fromFund,location:fromLoc,amount:-amount},{fund:toFund,location:toLoc,amount}];
  }
  if(kind==="opening"){
    const has=await one(db,"SELECT e.id FROM treasury_entries e WHERE e.fund_id=? AND e.location_id=? LIMIT 1",[toFund,toLoc]);
    if(has)return err("Saldo awal pos dan tempat ini sudah diisi.",409);
  }
  const fingerprint=await sha(JSON.stringify({kind,amount,date,note,entries}));
  const prev=await one(db,"SELECT id,payload_hash FROM treasury_events WHERE request_key=?",[key]);
  if(prev)return prev.payload_hash===fingerprint?ok({id:prev.id,duplicate:true}):err("Kunci permintaan telah dipakai untuk transaksi lain.",409);
  const eventId="treasury:"+crypto.randomUUID();
  const statements=[db.prepare("INSERT INTO treasury_events(id,request_key,payload_hash,kind,occurred_on,note,created_by) VALUES(?,?,?,?,?,?,?)")
    .bind(eventId,key,fingerprint,kind,date,note,who.id)];
  entries.forEach((line,index)=>{
    // Seluruh debit memeriksa saldo dalam transaksi D1 yang sama; CHECK melarang overdraft.
    // Untuk opening, pastikan rekening/pos ini tetap kosong meskipun ada request paralel.
    const sql=kind==="opening"?
      "INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp) VALUES(?,?,?,?,CASE WHEN NOT EXISTS(SELECT 1 FROM treasury_entries WHERE fund_id=? AND location_id=?) THEN ? ELSE 0 END)":
      line.amount<0?
      "INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp) VALUES(?,?,?,?,CASE WHEN (SELECT COALESCE(SUM(amount_rp),0) FROM treasury_entries WHERE fund_id=? AND location_id=?)>=? THEN ? ELSE 0 END)":
      "INSERT INTO treasury_entries(id,event_id,fund_id,location_id,amount_rp) VALUES(?,?,?,?,?)";
    const id=eventId+":"+index;
    statements.push(kind==="opening"?
      db.prepare(sql).bind(id,eventId,line.fund,line.location,line.fund,line.location,line.amount):
      line.amount<0?
        db.prepare(sql).bind(id,eventId,line.fund,line.location,line.fund,line.location,-line.amount,line.amount):
        db.prepare(sql).bind(id,eventId,line.fund,line.location,line.amount));
  });
  statements.push(db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'pusat_keuangan',?,'treasury_events',?,?,?)")
    .bind("audit:"+crypto.randomUUID(),who.id,kind,eventId,note,JSON.stringify({entries,date,amountRp:amount})));
  try{await db.batch(statements)}catch(e){
    const winner=await one(db,"SELECT id,payload_hash FROM treasury_events WHERE request_key=?",[key]);
    if(winner)return winner.payload_hash===fingerprint?ok({id:winner.id,duplicate:true}):err("Kunci permintaan tidak cocok.",409);
    return err("Tidak disimpan. Periksa saldo tersedia, saldo awal ganda, atau perubahan bersamaan.",409);
  }
  return ok({id:eventId,kind,amountRp:amount},201);
}
__name(treasuryApi,"treasuryApi");

// Reusable project data modules. Financial history is never deleted or cross-posted to the cash journal.
async function handleProjectModule(request,env,who,url){
  const denied=superadmin(who);if(denied)return denied;
  const mode=url.pathname.endsWith("/orders")?"orders":"contributions";
  const table=mode==="orders"?"portal_project_orders":"portal_project_contributions";
  const projectId=String(url.searchParams.get("projectId")||"").trim();
  if(!projectId||projectId.length>150)return err("Proyek wajib dipilih.",400);
  const db=env.DB;
  const project=await one(db,"SELECT id,title,project_kind FROM portal_project_cards WHERE id=?",[projectId]);
  if(!project)return err("Proyek tidak ditemukan.",404);
  if(project.project_kind!==(mode==="orders"?"pesanan":"penggalangan"))
    return err("Jenis proyek tidak mendukung tabel ini.",409);
  if(request.method==="GET"){
    const data=await list(db,"SELECT * FROM "+table+" WHERE project_id=? ORDER BY created_at DESC,id DESC LIMIT 501",[projectId]);
    if(data.length>500)return err("Daftar melebihi 500 baris. Tidak menampilkan laporan terpotong.",503);
    return ok({projectId,projectTitle:project.title,data});
  }
  if(request.method!=="POST")return err("Metode tidak didukung.",405);
  const origin=request.headers.get("origin")||"";
  if(origin&&!["https://flamboyan4.web.id","https://www.flamboyan4.web.id"].includes(origin))
    return err("Asal permintaan tidak diizinkan.",403);
  let payload;try{payload=await body(request)}catch(e){return err(e.message,400)}
  const action=String(payload.action||"save"),id=String(payload.id||"");
  if(!["save","cancel"].includes(action)||id.length>150)return err("Aksi atau ID tidak valid.",400);
  const old=id?await one(db,"SELECT * FROM "+table+" WHERE id=? AND project_id=?",[id,projectId]):null;
  if(id&&!old)return err("Catatan tidak ditemukan dalam proyek ini.",404);
  if(action==="cancel"){
    if(!old||old.status!=="aktif")return err("Hanya catatan aktif yang dapat dibatalkan.",409);
    await db.batch([
      db.prepare("UPDATE "+table+" SET status='dibatalkan',updated_at=CURRENT_TIMESTAMP WHERE id=? AND project_id=?").bind(id,projectId),
      db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)")
       .bind("audit:"+crypto.randomUUID(),who.id,"project_module","cancel",table,id,JSON.stringify(old),JSON.stringify({...old,status:"dibatalkan"}))
    ]);
    return ok({id,canceled:true});
  }
  if(old&&old.status!=="aktif")return err("Catatan dibatalkan bersifat arsip dan tidak dapat diedit.",409);
  const val=payload.values;
  if(!val||typeof val!=="object"||Array.isArray(val))return err("Isian proyek tidak valid.",400);
  const limitText=(v,limit)=>String(v??"").trim().slice(0,limit);
  const rupiahField=(v)=>{const n=Number(v);if(!Number.isSafeInteger(n)||n<0||n>100000000000)throw Error("Nominal rupiah harus bilangan bulat 0 sampai 100 miliar.");return n};
  const method=limitText(val.payment_method,70);
  if(method.length>70)return err("Metode pembayaran terlalu panjang.",400);
  const notes=limitText(val.notes,500);
  let clean,cols;
  try{
    if(mode==="orders"){
      const resident=limitText(val.resident,160),item=limitText(val.item_name,180);
      const quantity=Number(val.quantity),price=rupiahField(val.unit_price_rp),paid=rupiahField(val.paid_rp);
      if(!resident||!item||!Number.isSafeInteger(quantity)||quantity<1||quantity>10000)
        return err("Nama pemesan, barang, dan jumlah harus valid.",400);
      const due=quantity*price;if(!Number.isSafeInteger(due)||due>100000000000)return err("Total harga melebihi batas.",400);
      clean={resident,item_name:item,quantity,unit_price_rp:price,amount_due_rp:due,paid_rp:paid,payment_method:method,notes};
      cols=["resident","item_name","quantity","unit_price_rp","amount_due_rp","paid_rp","payment_method","notes"];
    }else{
      const contributor=limitText(val.contributor,160),amount=rupiahField(val.amount_rp);
      const date=String(val.contributed_on||"").trim();
      if(!contributor||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+"T12:00:00Z")))
        return err("Nama penyumbang dan tanggal harus valid.",400);
      clean={contributor,amount_rp:amount,payment_method:method,contributed_on:date,notes};
      cols=["contributor","amount_rp","payment_method","contributed_on","notes"];
    }
  }catch(e){return err(e.message||"Isian tidak valid.",400)}
  if(old){
    const next={...old,...clean};
    const increase=mode==="orders"?Number(clean.paid_rp)-Number(old.paid_rp||0):0;
    const observed=increase>0?treasuryReceiptObservation(db,"project_order",id,"project:"+projectId,increase,
      "Pembayaran barang — "+String(clean.resident||"").slice(0,95)):null;
    await db.batch([
      db.prepare("UPDATE "+table+" SET "+cols.map(k=>k+"=?").join(",")+",updated_at=CURRENT_TIMESTAMP WHERE id=? AND project_id=?")
        .bind(...cols.map(k=>clean[k]),id,projectId),
      ...(observed?[observed]:[]),
      db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)")
        .bind("audit:"+crypto.randomUUID(),who.id,"project_module","edit",table,id,JSON.stringify(old),JSON.stringify(next))
    ]);
    return ok({id,updated:true});
  }
  const newId=(mode==="orders"?"project-order:":"project-contribution:")+crypto.randomUUID();
  const observed=mode==="orders"&&Number(clean.paid_rp)>0?
    treasuryReceiptObservation(db,"project_order",newId,"project:"+projectId,Number(clean.paid_rp),
      "Pembayaran barang — "+String(clean.resident||"").slice(0,95)):null;
  await db.batch([
    db.prepare("INSERT INTO "+table+"(id,project_id,"+cols.join(",")+") VALUES("+Array(cols.length+2).fill("?").join(",")+")")
      .bind(newId,projectId,...cols.map(k=>clean[k])),
    ...(observed?[observed]:[]),
    db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)")
      .bind("audit:"+crypto.randomUUID(),who.id,"project_module","create",table,newId,null,JSON.stringify({project_id:projectId,...clean}))
  ]);
  return ok({id:newId,created:true},201);
}
__name(handleProjectModule,"handleProjectModule");
// Scoped deletion for publications, never transactions or account/master records.
async function deleteBankManagedContent(request,env,who,kind){
  const denied=superadmin(who);if(denied)return denied;
  const guard=guardedWrite(who,env);if(guard)return guard;
  const origin=request.headers.get("origin")||"";
  if(origin&&!["https://flamboyan4.web.id","https://www.flamboyan4.web.id"].includes(origin))return err("Asal permintaan tidak diizinkan.",403);
  let p;try{p=await body(request)}catch(e){return err(e.message,400)}
  const id=String(p.id||"");
  if(!id||id.length>150)return err("ID konten tidak valid.",400);
  const db=env.DB,table=kind==="albums"?"albums":kind==="progress"?"progress_entries":"inventory";
  const old=await one(db,"SELECT * FROM "+table+" WHERE id=?",[id]);
  if(!old)return err("Konten tidak ditemukan; muat ulang daftar.",404);
  if(kind==="inventory"&&(old.category!=="bank_sampah"||Number(old.active)!==1))
    return err("Hanya inventaris Bank Sampah aktif yang dapat diarsipkan.",403);
  const audit=db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,?,?,?,?,?,?)")
    .bind("audit:"+crypto.randomUUID(),who.id,"bank_content",kind==="inventory"?"archive":"delete",table,id,JSON.stringify(old),null);
  let queries;
  if(kind==="albums"){
    queries=[db.prepare("DELETE FROM album_media WHERE album_id=?").bind(id),db.prepare("DELETE FROM albums WHERE id=?").bind(id),audit];
  }else if(kind==="progress"){
    queries=[db.prepare("DELETE FROM bank_progress_photos WHERE progress_id=?").bind(id),db.prepare("DELETE FROM progress_entries WHERE id=?").bind(id),audit];
  }else{
    // Inventory may be referenced by cash purchases; retire it, preserve financial history.
    queries=[db.prepare("UPDATE inventory SET active=0 WHERE id=? AND category='bank_sampah' AND active=1").bind(id),audit];
  }
  try{await db.batch(queries)}catch(e){return err("Konten memiliki referensi atau gagal dihapus; tidak ada perubahan.",409)}
  return ok({id,deleted:true,archived:kind==="inventory"});
}
__name(deleteBankManagedContent,"deleteBankManagedContent");
async function handleUnifiedApi(request, env, who) {
  const url = new URL(request.url), path = url.pathname, method = request.method, db = env.DB;
  if (!path.startsWith("/api/v2/")) return null;
  if(path==='/api/v2/admin/content/transfer'&&method==='POST')return transferF4Content(request,env,who);
  if(path==="/api/v2/admin/projects/categories"&&method==="GET"){
    const denied=superadmin(who);if(denied)return denied;
    const rows=await list(db,"SELECT DISTINCT category FROM bookkeeping_cash_transactions_posted WHERE status='aktif' AND category IS NOT NULL AND TRIM(category)<>'' ORDER BY category LIMIT 150");
    return ok({data:rows.map(x=>String(x.category||"")).filter(Boolean)});
  }
  if(path==="/api/v2/admin/projects/orders"||path==="/api/v2/admin/projects/contributions")
    return handleProjectModule(request,env,who,url);
  if (path.startsWith(contentPath)) return handleAdminContent(request, env, who, url);
  if (method === "GET" && path === "/api/v2/system/features") return ok({ api: "v2", frontend: "github-pages", storage: "d1+r2", bankWrites: env.BANK_WRITE_ENABLED === "true", bookkeepingWrites: env.FINANCE_WRITE_ENABLED === "true", bankReconciliationWrites: env.BANK_WRITE_ENABLED === "true" && env.BANK_RECONCILIATION_WRITE_ENABLED === "true", bankCancellationWrites: env.BANK_WRITE_ENABLED === "true" && env.BANK_CANCEL_WRITE_ENABLED === "true", bankExpenseWrites: env.BANK_WRITE_ENABLED === "true" && env.BANK_EXPENSE_WRITE_ENABLED === "true", bankInventoryWrites: env.BANK_WRITE_ENABLED === "true" && env.BANK_INVENTORY_WRITE_ENABLED === "true", bankMediaWrites: env.BANK_WRITE_ENABLED === "true" && env.BANK_MEDIA_WRITE_ENABLED === "true", bankPayoutWrites: env.BANK_WRITE_ENABLED === "true" && env.BANK_PAYOUT_WRITE_ENABLED === "true" });
  if (method === "GET" && path === "/api/v2/auth/session") {
    if (!who) return err("Sesi tidak valid.", 401);
    const accountProfile = await myProfile(db, who);
    return ok({ account: { id: who.id, username: who.username, role: who.role, displayName: accountProfile.profile.nama },
      member: who.member_id ? { id: who.member_id, nama: who.display_name, rumah: who.house_code } : null });
  }
  if (method === "GET" && path === "/api/v2/public/portal") return publicPortal(db);
  if (method === "GET" && path === "/api/v2/public/portal/cash") return publicPortalCash(db);
  if (method === "GET" && path === "/api/v2/public/bank") return publicBank(db);
  if (method === "GET" && path === "/api/v2/public/bank/report") {
    try {
      return await publicBankReport(db, url);
    } catch (e) {
      return err(e.message, 400);
    }
  }
  if (method === "GET" && path.startsWith("/api/v2/public/bank/album/")) return publicAlbum(db, decodeURIComponent(path.split("/").pop()));
  if (method === "GET" && path.startsWith("/api/v2/public/bank/media/")) return publicAlbumMedia(env, decodeURIComponent(path.split("/").pop()));
  if (method === "GET" && path.startsWith("/api/v2/admin/portal/")) {
    const denied = superadmin(who);
    return denied || await adminPortal(db, url) || err("Endpoint admin portal tidak dikenal.", 404);
  }
  if (method === "POST" && path === "/api/v2/admin/portal/agenda") {
    const denied = superadmin(who);
    return denied || (env.PORTAL_WRITE_ENABLED === "true" ? createPortalAgenda(request, env) : err("Penulisan Portal belum diaktifkan.", 503));
  }
  if (method === "GET" && path === "/api/v2/bookkeeping/overview") {
    const denied = superadmin(who);
    return denied || await bookkeepingOverview(db, url).catch((e) => err(e.message, 400));
  }
  if (path.startsWith("/api/v2/admin/bank/")) {
    if(method==="POST"&&["albums","progress","inventory"].some(k=>path==="/api/v2/admin/bank/"+k+"/delete"))
      return deleteBankManagedContent(request,env,who,path.split("/")[5]);
    const denied = admin(who);
    if (denied) return denied;
    if (method === "GET") {
      if (path === "/api/v2/admin/bank/albums") return ok({data:await list(db,"SELECT id,title,category,event_on,description,visibility,status FROM albums WHERE status='aktif' ORDER BY event_on DESC,id DESC LIMIT 500")});
      const detail = await detailBank(db, url);
      if (detail) return detail;
      const result = await adminBank(db, url);
      if (result) return result;
    }
    if (method === "POST" && path === "/api/v2/admin/bank/deposits/cancel") return cancelBankDraft(request,env,who,"deposit");
    if (method === "POST" && path === "/api/v2/admin/bank/sales/cancel") return cancelBankDraft(request,env,who,"sale");
    if (method === "POST" && path === "/api/v2/admin/bank/withdrawals") {
      return bankWithdraw(request,env,who);
    }
    if (method === "POST" && path === "/api/v2/admin/bank/deposits") {
      const stop = guardedWrite(who, env);
      return stop || bankDeposit(request, env);
    }
    if (method === "POST" && path === "/api/v2/admin/bank/prices") {
      const stop = guardedWrite(who, env);
      return stop || bankPrice(request, env, who);
    }
    if (method === "POST" && path === "/api/v2/admin/bank/batches") {
      const stop = guardedWrite(who, env);
      return stop || createBankBatch(request, env);
    }
    if (method === "POST" && path === "/api/v2/admin/bank/media-link") return createBankMediaLink(request,env,who);
    if (method === "POST" && path === "/api/v2/admin/bank/expenses") return createBankExpense(request,env,who);
    if (method === "POST" && path === "/api/v2/admin/bank/inventory") return createBankInventory(request,env,who);
    if (method === "POST" && path === "/api/v2/admin/bank/albums/edit") {
      const denied=requireRole(who,["admin","superadmin"]);return denied||bankAlbumDetailsUpdate(request,env,who);
    }
    if (method === "POST" && path === "/api/v2/admin/bank/albums/category") {
      const denied=requireRole(who,["admin","superadmin"]);return denied||bankAlbumCategoryUpdate(request,env,who);
    }
    if (method === "POST" && path === "/api/v2/admin/bank/progress/edit") {
      const denied=requireRole(who,["admin","superadmin"]);return denied||bankProgressUpdate(request,env,who);
    }
    if (method === "POST" && path === "/api/v2/admin/bank/albums") {
      const stop = guardedWrite(who, env);
      return stop || createBankAlbum(request, env);
    }
    if (method === "POST" && path === "/api/v2/admin/bank/progress") {
      const stop = guardedWrite(who, env);
      return stop || createBankProgress(request, env);
    }
    if (method === "POST" && path === "/api/v2/admin/bank/upload") {
      const stop = guardedWrite(who, env);
      return stop || addBankMedia(request, env, who);
    }
  }
  return err("Endpoint API v2 tidak ditemukan.", 404);
}
__name(handleUnifiedApi, "handleUnifiedApi");

// src/worker.js
var jsonHeaders = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
var PASSWORD_ITERATIONS = 1e5;
function json(value, status = 200, extra = {}) {
  return new Response(JSON.stringify(value), { status, headers: { ...jsonHeaders, ...extra } });
}
__name(json, "json");
function safeError(message, status = 400) {
  return json({ ok: false, error: message }, status);
}
__name(safeError, "safeError");
function allowedOrigin(request, env) {
  const configured = String(env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || "https://flamboyan4.web.id").split(",").map((x) => x.trim()).filter(Boolean);
  const origin = request.headers.get("origin");
  return origin && (configured.includes(origin) || origin === new URL(request.url).origin) ? origin : null;
}
__name(allowedOrigin, "allowedOrigin");
function cors(origin) {
  return origin ? {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Authorization, Content-Type",
    "access-control-max-age": "300",
    "vary": "Origin"
  } : {};
}
__name(cors, "cors");
async function tokenHash(raw) {
  const bytes = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
__name(tokenHash, "tokenHash");
function toHex(bytes) {
  return [...bytes].map((x) => x.toString(16).padStart(2, "0")).join("");
}
__name(toHex, "toHex");
function fromHex(value) {
  if (!/^(?:[0-9a-f]{2})+$/i.test(value)) throw Error("Invalid encoded hash");
  return Uint8Array.from(value.match(/../g), (x) => parseInt(x, 16));
}
__name(fromHex, "fromHex");
function secureCompare(a, b) {
  const x = new TextEncoder().encode(String(a || "")), y = new TextEncoder().encode(String(b || ""));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}
__name(secureCompare, "secureCompare");
async function passwordDigest(password, salt, rounds) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: rounds }, key, 256);
  return new Uint8Array(derived);
}
__name(passwordDigest, "passwordDigest");
async function passwordHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await passwordDigest(password, salt, PASSWORD_ITERATIONS);
  return `pbkdf2-sha256:${PASSWORD_ITERATIONS}:${toHex(salt)}:${toHex(derived)}`;
}
__name(passwordHash, "passwordHash");
async function verifyPassword(password, stored) {
  const parts = String(stored || "").split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") return false;
  const rounds = Number(parts[1]);
  if (!Number.isInteger(rounds) || rounds !== PASSWORD_ITERATIONS) return false;
  const salt = fromHex(parts[2]), expected = fromHex(parts[3]);
  const actual = await passwordDigest(password, salt, rounds);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}
__name(verifyPassword, "verifyPassword");
function randomToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}
__name(randomToken, "randomToken");
async function requestJson(request) {
  if ((Number(request.headers.get("content-length")) || 0) > 4096) throw Error("Request too large");
  const body2 = await request.text();
  if (body2.length > 4096) throw Error("Request too large");
  return JSON.parse(body2);
}
__name(requestJson, "requestJson");
function future(minutes) {
  return new Date(Date.now() + minutes * 6e4).toISOString().slice(0, 19).replace("T", " ");
}
__name(future, "future");
async function login(request, env) {
  if (env.AUTH_ENABLED !== "true") return safeError("Login baru belum diaktifkan dalam fase migrasi.", 503);
  let payload;
  try {
    payload = await requestJson(request);
  } catch {
    return safeError("Format login tidak valid.", 400);
  }
  const username = String(payload.username || "").trim().toLowerCase();
  const password = String(payload.password || "");
  if (!username || username.length > 100 || !password || password.length > 128) return safeError("Akun atau password tidak sesuai.", 401);
  const account = await env.DB.prepare("SELECT id,password_hash,password_scheme,role,status,failed_attempts,locked_until,must_change_password FROM accounts WHERE username=? LIMIT 1").bind(username).first();
  if (!account || account.status !== "aktif" || !account.password_hash || account.password_scheme !== "pbkdf2-sha256") return safeError("Akun atau password tidak sesuai.", 401);
  if (account.locked_until && Date.parse(String(account.locked_until).replace(" ", "T") + "Z") > Date.now()) return safeError("Percobaan login terlalu banyak. Coba lagi nanti.", 429);
  const good = await verifyPassword(password, account.password_hash);
  if (!good) {
    const fail = Number(account.failed_attempts || 0) + 1;
    await env.DB.prepare("UPDATE accounts SET failed_attempts=?,locked_until=? WHERE id=?").bind(fail >= 8 ? 0 : fail, fail >= 8 ? future(15) : null, account.id).run();
    return safeError("Akun atau password tidak sesuai.", 401);
  }
  const token = randomToken(), digest = await tokenHash(token);
  const sessionId = crypto.randomUUID();
  await env.DB.batch([
    env.DB.prepare("UPDATE accounts SET failed_attempts=0,locked_until=NULL WHERE id=?").bind(account.id),
    env.DB.prepare("INSERT INTO sessions(id,account_id,token_hash,expires_at) VALUES (?,?,?,?)").bind(sessionId, account.id, digest, future(720))
  ]);
  return json({ ok: true, role: account.role, expiresInMinutes: 720 }, 200, { "set-cookie": `f4_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200` });
}
__name(login, "login");
async function changePassword(request, env, who) {
  if (!who) return safeError("Sesi tidak valid.", 401);
  let p;
  try {
    p = await requestJson(request);
  } catch {
    return safeError("Format permintaan tidak valid.", 400);
  }
  const old = String(p.currentPassword || ""), next = String(p.newPassword || "");
  // One minimum for member, admin and superadmin; rate limiting remains enforced at login.
  const min = 4;
  if (next.length < min || next.length > 128) return safeError(`Password minimal ${min} karakter.`, 400);
  const current = await env.DB.prepare("SELECT password_hash FROM accounts WHERE id=?").bind(who.id).first();
  if (!current || !await verifyPassword(old, current.password_hash)) return safeError("Password lama tidak sesuai.", 401);
  const hashed = await passwordHash(next);
  await env.DB.batch([
    env.DB.prepare("UPDATE accounts SET password_hash=?,password_scheme='pbkdf2-sha256',must_change_password=0,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(hashed, who.id),
    env.DB.prepare("UPDATE sessions SET revoked_at=CURRENT_TIMESTAMP WHERE account_id=? AND revoked_at IS NULL").bind(who.id)
  ]);
  return json({ ok: true, message: "Password diperbarui. Silakan login ulang." }, 200, { "set-cookie": "f4_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0" });
}
__name(changePassword, "changePassword");
async function bootstrapSuperadmin(request, env) {
  if (!env.SETUP_SECRET || env.SETUP_SECRET.length < 32) return safeError("Aktivasi belum dikonfigurasi.", 503);
  let data;
  try {
    data = await requestJson(request);
  } catch {
    return safeError("Format tidak valid.", 400);
  }
  const secret = String(data.secret || ""), password = String(data.password || "");
  if (!secureCompare(secret, env.SETUP_SECRET)) return safeError("Kode aktivasi tidak sesuai.", 403);
  if (password.length < 4 || password.length > 128) return safeError("Password superadmin minimal 4 karakter.", 400);
  const hashed = await passwordHash(password);
  const result = await env.DB.prepare("UPDATE accounts SET password_hash=?,password_scheme='pbkdf2-sha256',role='superadmin',status='aktif',must_change_password=0,updated_at=CURRENT_TIMESTAMP WHERE id='account:superadmin' AND role='superadmin' AND status='nonaktif' AND password_hash IS NULL").bind(hashed).run();
  if (result.meta?.changes !== 1) return safeError("Akun sudah diaktivasi atau belum tersedia.", 409);
  return json({ ok: true, message: "Superadmin aktif. Hapus SETUP_SECRET setelah aktivasi." });
}
__name(bootstrapSuperadmin, "bootstrapSuperadmin");
function bootstrapPage() {
  const html = `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aktivasi superadmin staging</title><body style="font:16px system-ui;max-width:450px;margin:40px auto;padding:15px"><h1>Aktivasi Superadmin</h1><p>Hanya untuk pengelola. Jangan bagikan kode aktivasi.</p><form id="f"><label>Kode rahasia<br><input id="s" type="password" autocomplete="off" required style="width:100%;padding:10px"></label><p><label>Password baru (minimal 4 karakter)<br><input id="p" type="password" minlength="4" autocomplete="new-password" required style="width:100%;padding:10px"></label></p><button>Aktifkan akun</button></form><p id="m" role="status"></p><script>document.getElementById('f').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{const r=await fetch('/api/auth/bootstrap-superadmin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:document.getElementById('s').value,password:document.getElementById('p').value})});const j=await r.json();document.getElementById('m').textContent=j.message||j.error||'Gagal';}catch{document.getElementById('m').textContent='Jaringan gagal';}b.disabled=false;};<\/script></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'" } });
}
__name(bootstrapPage, "bootstrapPage");
function stagingLoginPage() {
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Uji Login \xB7 Flamboyan 4</title><style>body{margin:0;background:#eff5ed;color:#24432c;font:16px system-ui,-apple-system,sans-serif;display:grid;place-items:center;min-height:100vh}.card{background:#fff;border-radius:20px;padding:28px;box-shadow:0 12px 35px #173e1715;width:min(390px,calc(100vw - 56px))}h1{font-size:24px;margin:0 0 7px}p{line-height:1.5;color:#5b715f}label{display:block;margin:16px 0 6px;font-weight:600}input{box-sizing:border-box;width:100%;font:inherit;padding:12px;border:1px solid #b7c9ba;border-radius:10px}button{font:inherit;background:#397a43;border:0;border-radius:10px;padding:12px 18px;color:white;cursor:pointer;margin-top:18px;width:100%}button:disabled{opacity:.6}#out{display:none;background:#e9f4e8;border-radius:12px;padding:14px;margin-top:18px}#msg{font-weight:500}small{color:#627569}</style></head><body><main class="card"><h1>Flamboyan 4</h1><p>Uji login superadmin \xB7 lingkungan staging.</p><form id="f"><label for="u">Username</label><input id="u" value="superadmin" autocomplete="username" required><label for="p">Password</label><input id="p" type="password" autocomplete="current-password" required><button id="submit">Masuk</button></form><p id="msg" role="status"></p><section id="out"><strong id="who"></strong><p id="access"></p><button id="logout" type="button">Keluar</button></section><small>Halaman uji sementara. Data website aktif tidak berubah.</small></main><script>let token='';const f=document.getElementById('f'),msg=document.getElementById('msg');f.onsubmit=async e=>{e.preventDefault();document.getElementById('submit').disabled=true;msg.textContent='Memeriksa akun\u2026';try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:document.getElementById('u').value,password:document.getElementById('p').value})});const j=await r.json();document.getElementById('p').value='';if(!r.ok){msg.textContent=j.error||'Login gagal';return;}token='cookie-session';const check=await fetch('/api/bookkeeping/status',{headers:{}});const c=await check.json();msg.textContent='Login berhasil';document.getElementById('who').textContent='Peran: '+j.role;document.getElementById('access').textContent=check.ok&&c.scope==='pembukuan-superadmin'?'Akses Pembukuan: diizinkan':'Akses Pembukuan: tidak diizinkan';document.getElementById('out').style.display='block';f.style.display='none';}catch{msg.textContent='Gagal menghubungi server.';}finally{document.getElementById('submit').disabled=false;}};document.getElementById('logout').onclick=async()=>{if(token)await fetch('/api/auth/logout',{method:'POST',headers:{}}).catch(()=>{});token='';document.getElementById('out').style.display='none';f.style.display='block';msg.textContent='Sudah keluar.';};<\/script></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'" } });
}
__name(stagingLoginPage, "stagingLoginPage");
function memberActivationPage() {
  const html = `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aktivasi Warga \xB7 Staging Flamboyan 4</title><style>body{font:15px system-ui,sans-serif;background:#eef5ec;color:#23432b;margin:0;padding:24px}main{max-width:820px;margin:auto;background:white;border-radius:18px;padding:24px;box-shadow:0 12px 40px #23432b16}h1{margin-top:0}input,button{font:inherit;padding:10px;border-radius:9px}input{border:1px solid #b0c7b4;max-width:100%}button{border:0;background:#347941;color:white;cursor:pointer}button:disabled{opacity:.45}form{display:flex;gap:10px;flex-wrap:wrap;align-items:end}label{display:grid;gap:4px}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{padding:9px 7px;border-bottom:1px solid #e6eee4;text-align:left}small{color:#5c725e}.scroll{overflow:auto}#content{display:none}#message{padding:9px 0}</style><main><h1>Aktivasi Akun Warga</h1><p>Lingkungan staging. Akun Bank Sampah lama belum terpengaruh.</p><form id="login"><label>Username<input id="u" value="superadmin" autocomplete="username" required></label><label>Password<input id="p" type="password" autocomplete="current-password" required></label><button>Masuk</button></form><p id="message" role="status"></p><section id="content"><h2>Daftar akun</h2><p id="summary"></p><small>Password awal tiap warga adalah 1234 dan dapat diganti sendiri setelah login. Kode hanya untuk akun baru di staging.</small><div class="scroll"><table><thead><tr><th>Username</th><th>Nama</th><th>Rumah</th><th>Status</th></tr></thead><tbody id="rows"></tbody></table></div><button id="activate">Aktifkan akun anggota yang belum aktif</button> <button id="logout" type="button">Keluar</button></section></main><script>let token='',pending=[];const $=id=>document.getElementById(id),headers=()=>({});async function refresh(){const r=await fetch('/api/superadmin/accounts/preview',{headers:headers()}),v=await r.json();if(!r.ok)throw Error(v.error||'Gagal membaca akun');pending=v.akun.filter(a=>a.role==='anggota'&&a.perluAktivasi);$('summary').textContent=v.akun.length+' akun tercatat, '+pending.length+' warga menunggu aktivasi';$('rows').replaceChildren();for(const a of v.akun){const tr=document.createElement('tr');for(const value of [a.username,a.nama||'\u2014',a.rumah||'\u2014',a.status]){const td=document.createElement('td');td.textContent=value;tr.append(td);}$('rows').append(tr);}$('activate').disabled=pending.length===0;} $('login').onsubmit=async e=>{e.preventDefault();$('message').textContent='Memeriksa akun\u2026';try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('u').value,password:$('p').value})}),v=await r.json();$('p').value='';if(!r.ok)throw Error(v.error||'Login gagal');if(v.role!=='superadmin')throw Error('Hanya superadmin yang dapat mengaktifkan warga');token='cookie-session';await refresh();$('login').style.display='none';$('content').style.display='block';$('message').textContent='Login superadmin berhasil.';}catch(err){$('message').textContent=err.message;}};$('activate').onclick=async()=>{if(!pending.length)return;if(!confirm('Aktifkan '+pending.length+' akun warga di staging menggunakan password awal 1234?'))return;$('activate').disabled=true;let done=0;for(const a of [...pending]){try{const r=await fetch('/api/superadmin/accounts/activate-member',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({accountId:a.id,confirmation:'AKTIFKAN AKUN WARGA'})}),v=await r.json();if(!r.ok)throw Error(a.username+': '+(v.error||'gagal'));done++;$('message').textContent='Aktivasi '+done+' dari '+pending.length+' akun\u2026';}catch(err){$('message').textContent='Berhenti: '+err.message;await refresh();return;}}await refresh();$('message').textContent=done+' akun warga berhasil diaktifkan.';};$('logout').onclick=async()=>{if(token)await fetch('/api/auth/logout',{method:'POST',headers:headers()}).catch(()=>{});token='';$('content').style.display='none';$('login').style.display='flex';$('message').textContent='Sudah keluar.';};<\/script>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'" } });
}
__name(memberActivationPage, "memberActivationPage");
function adminActivationPage() {
  const html = `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aktivasi Admin \xB7 Staging Flamboyan 4</title><style>body{background:#edf5ec;color:#29462e;font:16px system-ui;display:grid;place-items:center;min-height:100vh;margin:0}.card{background:white;width:min(420px,calc(100vw - 55px));padding:25px;border-radius:18px;box-shadow:0 12px 30px #25462818}h1{font-size:24px}label{display:block;margin-top:12px}input{box-sizing:border-box;display:block;width:100%;font:inherit;padding:11px;border:1px solid #b6cab8;border-radius:9px;margin-top:5px}button{background:#347a42;color:white;border:0;border-radius:9px;font:inherit;padding:12px 16px;margin-top:18px;cursor:pointer}button:disabled{opacity:.5}p,small{line-height:1.5;color:#5c735e}#activate{display:none}</style><main class="card"><h1>Aktivasi Admin Bank Sampah</h1><p>Hanya untuk superadmin di staging.</p><form id="login"><label>Username superadmin<input id="u" value="superadmin" required autocomplete="username"></label><label>Password superadmin<input id="s" type="password" required autocomplete="current-password"></label><button>Masuk</button></form><form id="activate"><label>Password baru untuk akun admin<input id="p" type="password" minlength="4" required autocomplete="new-password"></label><label>Ulangi password admin<input id="q" type="password" minlength="4" required autocomplete="new-password"></label><small>Minimal 4 karakter. Hindari sandi mudah ditebak dan PIN awal 1026.</small><button>Aktifkan admin</button></form><p id="msg" role="status"></p></main><script>let token='';const $=id=>document.getElementById(id),msg=$('msg');$('login').onsubmit=async e=>{e.preventDefault();msg.textContent='Memeriksa superadmin\u2026';try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('u').value,password:$('s').value})}),j=await r.json();$('s').value='';if(!r.ok)throw Error(j.error||'Login gagal');if(j.role!=='superadmin')throw Error('Akses khusus superadmin');token='cookie-session';$('login').style.display='none';$('activate').style.display='block';msg.textContent='Siapkan password admin yang baru.';}catch(err){msg.textContent=err.message;}};$('activate').onsubmit=async e=>{e.preventDefault();if($('p').value!==$('q').value){msg.textContent='Konfirmasi password belum sama.';return;}if(!confirm('Aktifkan akun admin Bank Sampah pada staging?'))return;msg.textContent='Memproses aktivasi\u2026';try{const r=await fetch('/api/superadmin/accounts/activate-admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('p').value,confirmation:'AKTIFKAN ADMIN'})}),j=await r.json();$('p').value='';$('q').value='';if(!r.ok)throw Error(j.error||'Aktivasi gagal');msg.textContent=j.message;$('activate').style.display='none';}catch(err){msg.textContent=err.message;}};<\/script>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'" } });
}
__name(adminActivationPage, "adminActivationPage");
function memberSavingsPage() {
  const html = `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tabungan Saya \xB7 Uji Staging</title><style>body{background:#eef5ed;color:#234329;font:15px system-ui;margin:0;padding:22px}main{max-width:760px;margin:30px auto;background:white;padding:26px;border-radius:19px;box-shadow:0 10px 30px #23432915}h1{margin:0}p{color:#56715c;line-height:1.5}form{display:flex;flex-wrap:wrap;align-items:end;gap:10px}label{display:grid;gap:5px}input{font:inherit;padding:10px;border:1px solid #b6c9b8;border-radius:8px}button{font:inherit;color:white;background:#347842;border:0;border-radius:8px;padding:11px 18px;cursor:pointer}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin:18px 0}.tile{background:#eef5ed;padding:16px;border-radius:12px}.tile strong{display:block;font-size:22px;margin-top:8px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #e4ede5;padding:10px 6px;text-align:left}.scroll{overflow:auto}#account{display:none}small{color:#607763}</style><main><h1>Tabungan Saya</h1><p>Uji privasi akun warga \xB7 data hanya berasal dari sesi login sendiri.</p><form id="login"><label>Username<input id="u" autocomplete="username" required placeholder="contoh: a5-24"></label><label>Password<input id="p" type="password" autocomplete="current-password" required></label><button>Masuk</button></form><p id="msg" role="status"></p><section id="account"><h2 id="name"></h2><div class="grid"><div class="tile">Saldo terkonfirmasi<strong id="balance"></strong></div><div class="tile">Estimasi belum disahkan<strong id="estimated"></strong></div></div><h3>Riwayat setoran</h3><div class="scroll"><table><thead><tr><th>Tanggal</th><th>Berat</th><th>Estimasi</th><th>Status</th><th>Rincian</th></tr></thead><tbody id="rows"></tbody></table></div><p><small>Saldo estimasi bukan hak tabungan sebelum rekonsiliasi disahkan.</small></p><button id="logout">Keluar</button></section></main><script>let token='';const $=id=>document.getElementById(id),rupiah=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0);$('login').onsubmit=async e=>{e.preventDefault();$('msg').textContent='Memeriksa akun\u2026';try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('u').value,password:$('p').value})}),v=await r.json();$('p').value='';if(!r.ok)throw Error(v.error||'Login gagal');token='cookie-session';const headers={};const [meRes,savRes]=await Promise.all([fetch('/api/member/me',{headers}),fetch('/api/member/savings',{headers})]);const me=await meRes.json(),sav=await savRes.json();if(!meRes.ok||!savRes.ok)throw Error(sav.error||me.error||'Akses tabungan ditolak');$('name').textContent=(me.member?.nama||'Warga')+' \xB7 '+(me.member?.rumah||'');$('balance').textContent=rupiah(sav.saldoTersediaRp);$('estimated').textContent=rupiah(sav.estimasiMenungguRp);$('rows').replaceChildren();for(const d of sav.setoran){const tr=document.createElement('tr');for(const value of [d.tanggal,(Number(d.beratGram)/1000).toLocaleString('id-ID')+' kg',rupiah(d.estimasiRp),d.status,d.rincian.map(l=>l.barang+' '+(l.beratGram/1000).toLocaleString('id-ID')+' kg').join(', ')]){const td=document.createElement('td');td.textContent=value;tr.append(td);}$('rows').append(tr);}if(!sav.setoran.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.textContent='Belum ada setoran yang dapat ditampilkan.';tr.append(td);$('rows').append(tr);}$('login').style.display='none';$('account').style.display='block';$('msg').textContent='Data pribadi berhasil dimuat.';}catch(err){$('msg').textContent=err.message;}};$('logout').onclick=async()=>{if(token)await fetch('/api/auth/logout',{method:'POST',headers:{}}).catch(()=>{});token='';$('account').style.display='none';$('login').style.display='flex';$('msg').textContent='Sudah keluar.';};<\/script>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'" } });
}
__name(memberSavingsPage, "memberSavingsPage");
async function identity(request, db) {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer ([A-Za-z0-9_-]{32,256})$/.exec(header);
  const cookie = /\bf4_session=([A-Za-z0-9_-]{32,256})(?:;|$)/.exec(request.headers.get("cookie") || "");
  const token = match?.[1] || cookie?.[1];
  if (!token) return null;
  const digest = await tokenHash(token);
  return db.prepare(`SELECT a.id,a.member_id,a.username,a.role,a.status,
    m.display_name,m.household_id,h.house_code
    FROM sessions s JOIN accounts a ON a.id=s.account_id
    LEFT JOIN members m ON m.id=a.member_id
    LEFT JOIN households h ON h.id=m.household_id
    WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at > CURRENT_TIMESTAMP
    AND a.status='aktif' LIMIT 1`).bind(digest).first();
}
__name(identity, "identity");
function requireRole(who, roles) {
  if (!who) return safeError("Sesi tidak valid atau sudah berakhir.", 401);
  if (!roles.includes(who.role)) return safeError("Akses tidak diizinkan.", 403);
  return null;
}
__name(requireRole, "requireRole");
async function myProfile(db, who) {
  const row = await db.prepare("SELECT display_name,avatar_key FROM member_account_profiles WHERE account_id=?").bind(who.id).first();
  return { ok: true, account: { username: who.username, role: who.role }, profile: {
    nama: row?.display_name || who.display_name || who.username,
    rumah: who.house_code || null,
    hasPhoto: !!row?.avatar_key,
    photoUrl: row?.avatar_key ? "/api/member/avatar" : null
  } };
}
__name(myProfile, "myProfile");
async function updateMyProfile(request, env, who) {
  const denied = requireRole(who, ["anggota", "admin", "superadmin"]);
  if (denied) return denied;
  let data;
  try {
    data = await requestJson(request);
  } catch {
    return safeError("Format profil tidak valid.", 400);
  }
  const name = String(data.nama || "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 100 || /[<>\x00-\x1f]/.test(name)) return safeError("Nama harus 2\u2013100 karakter tanpa karakter khusus.", 400);
  await env.DB.prepare(`INSERT INTO member_account_profiles(account_id,display_name,updated_at)
    VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(account_id) DO UPDATE SET
    display_name=excluded.display_name,updated_at=CURRENT_TIMESTAMP`).bind(who.id, name).run();
  return myProfile(env.DB, who);
}
__name(updateMyProfile, "updateMyProfile");
async function uploadMyAvatar(request, env, who) {
  const denied = requireRole(who, ["anggota", "admin", "superadmin"]);
  if (denied) return denied;
  if (!env.PHOTOS) return safeError("Penyimpanan foto R2 belum dikonfigurasi.", 503);
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 2 * 1024 * 1024) return safeError("Foto maksimal 2 MB.", 413);
  const raw = await request.arrayBuffer();
  if (raw.byteLength < 12 || raw.byteLength > 2 * 1024 * 1024) return safeError("Foto harus berukuran 12 byte\u20132 MB.", 400);
  const v = new Uint8Array(raw);
  let type, ext;
  if (v[0] === 255 && v[1] === 216 && v[2] === 255) {
    type = "image/jpeg";
    ext = "jpg";
  } else if (v[0] === 137 && v[1] === 80 && v[2] === 78 && v[3] === 71 && v[4] === 13 && v[5] === 10) {
    type = "image/png";
    ext = "png";
  } else if (String.fromCharCode(...v.slice(0, 4)) === "RIFF" && String.fromCharCode(...v.slice(8, 12)) === "WEBP") {
    type = "image/webp";
    ext = "webp";
  } else return safeError("Gunakan foto JPG, PNG, atau WebP.", 415);
  const key = `profiles/${who.id.replace(/[^a-zA-Z0-9_-]/g, "_")}/${crypto.randomUUID()}.${ext}`;
  const before = await env.DB.prepare("SELECT avatar_key FROM member_account_profiles WHERE account_id=?").bind(who.id).first();
  await env.PHOTOS.put(key, raw, { httpMetadata: { contentType: type } });
  try {
    await env.DB.prepare(`INSERT INTO member_account_profiles(account_id,avatar_key,updated_at)
    VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(account_id) DO UPDATE SET
    avatar_key=excluded.avatar_key,updated_at=CURRENT_TIMESTAMP`).bind(who.id, key).run();
  } catch (e) {
    await env.PHOTOS.delete(key);
    throw e;
  }
  if (before?.avatar_key && before.avatar_key !== key) await env.PHOTOS.delete(before.avatar_key).catch(() => {
  });
  return json({ ok: true, photoUrl: "/api/member/avatar" });
}
__name(uploadMyAvatar, "uploadMyAvatar");
async function getMyAvatar(env, who) {
  const denied = requireRole(who, ["anggota", "admin", "superadmin"]);
  if (denied) return denied;
  if (!env.PHOTOS) return safeError("Penyimpanan foto belum dikonfigurasi.", 503);
  const row = await env.DB.prepare("SELECT avatar_key FROM member_account_profiles WHERE account_id=?").bind(who.id).first();
  if (!row?.avatar_key) return safeError("Foto belum tersedia.", 404);
  const object = await env.PHOTOS.get(row.avatar_key);
  if (!object) return safeError("Foto tidak ditemukan.", 404);
  const headers = new Headers({ "cache-control": "private, no-store", "x-content-type-options": "nosniff", "content-type": object.httpMetadata?.contentType || "application/octet-stream" });
  return new Response(object.body, { headers });
}
__name(getMyAvatar, "getMyAvatar");
async function publicSummary(db) {
  const [members, albums, progress] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS n FROM members WHERE status='aktif'").first(),
    db.prepare("SELECT COUNT(*) AS n FROM albums WHERE visibility='publik' AND status='aktif'").first(),
    db.prepare("SELECT COUNT(*) AS n FROM progress_entries WHERE public_visible=1").first()
  ]);
  return { ok: true, anggotaAktif: members?.n || 0, albumPublik: albums?.n || 0, perkembanganPublik: progress?.n || 0 };
}
__name(publicSummary, "publicSummary");
async function publicOverview(db) {
  const [agenda, inventory, projects, media] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS n FROM portal_agenda WHERE visibility='publik'").first(),
    db.prepare("SELECT COUNT(*) AS n FROM portal_inventory WHERE visibility='publik'").first(),
    db.prepare("SELECT COUNT(*) AS n FROM portal_project_cards WHERE active=1").first(),
    db.prepare("SELECT COUNT(*) AS n FROM album_media am JOIN albums a ON a.id=am.album_id WHERE a.visibility='publik' AND a.status='aktif' AND am.status='aktif'").first()
  ]);
  return { ok: true, agendaPublik: agenda?.n || 0, inventarisPublik: inventory?.n || 0, proyekAktif: projects?.n || 0, mediaAlbumPublik: media?.n || 0 };
}
__name(publicOverview, "publicOverview");
async function publicAlbums(db) {
  const found = await db.prepare(`SELECT a.title,a.category,a.event_on,a.description,
    (SELECT am.external_url FROM album_media am WHERE am.album_id=a.id
     AND am.status='aktif' AND am.media_type='tautan_album'
     ORDER BY am.sort_order,am.id LIMIT 1) AS album_url
    FROM albums a WHERE a.visibility='publik' AND a.status='aktif'
    ORDER BY a.event_on DESC,a.title LIMIT 30`).all();
  const publicLink = /* @__PURE__ */ __name((raw) => {
    if (typeof raw !== "string") return null;
    const clean = raw.trim().replace(/^\[([^\]]+)\]$/, "$1");
    try {
      const url = new URL(clean);
      return url.protocol === "https:" && ["drive.google.com", "photos.google.com"].includes(url.hostname) ? url.href : null;
    } catch {
      return null;
    }
  }, "publicLink");
  return { ok: true, albums: (found.results || []).map((r) => ({ judul: r.title, kategori: r.category, tanggal: r.event_on, keterangan: r.description, tautanAlbum: publicLink(r.album_url) })) };
}
__name(publicAlbums, "publicAlbums");
async function publicProgress(db) {
  const found = await db.prepare("SELECT title,happened_on,stage,status,description,next_step FROM progress_entries WHERE public_visible=1 ORDER BY happened_on DESC,title LIMIT 30").all();
  return { ok: true, perkembangan: (found.results || []).map((r) => ({ judul: r.title, tanggal: r.happened_on, tahap: r.stage, status: r.status, keterangan: r.description, berikutnya: r.next_step })) };
}
__name(publicProgress, "publicProgress");
async function ownPayments(db, memberId) {
  const payer = await db.prepare("SELECT id,display_name FROM bookkeeping_payers WHERE member_id=? AND payer_type='warga' LIMIT 1").bind(memberId).first();
  if (!payer) return { ok: true, linked: false, pembayaran: [], totalDiterimaRp: 0 };
  const result = await db.prepare(`SELECT p.id,p.paid_on,p.amount_rp,p.payment_method,p.description,p.status,
    a.period_year,a.period_month,a.contribution_type,a.amount_rp AS allocation_rp,a.status AS allocation_status
    FROM bookkeeping_payments p
    LEFT JOIN bookkeeping_payment_allocations a ON a.payment_id=p.id
      WHERE p.payer_id=? ORDER BY p.paid_on DESC,p.id DESC,a.period_year,a.period_month LIMIT 501`).bind(payer.id).all();
  const byId = /* @__PURE__ */ new Map();
  const paymentHistoryTruncated=(result.results||[]).length>500;
  for (const r of (result.results||[]).slice(0,500)) {
    if (!byId.has(r.id)) byId.set(r.id, { id: r.id, tanggal: r.paid_on, jumlahRp: Number(r.amount_rp || 0), metode: r.payment_method || "", keterangan: r.description || "", status: r.status, alokasi: [] });
    if (r.period_year !== null) byId.get(r.id).alokasi.push({ tahun: r.period_year, bulan: r.period_month, jenis: r.contribution_type, jumlahRp: Number(r.allocation_rp || 0), status: r.allocation_status });
  }
  const payments = [...byId.values()];
  return {
    ok: true,
    linked: true,
    namaPembayar: payer.display_name,
    pembayaran: payments,
    totalDiterimaRp: Number((await db.prepare(`SELECT COALESCE(SUM(amount_rp),0) AS total
      FROM bookkeeping_payments WHERE payer_id=? AND status='aktif'`).bind(payer.id).first())?.total || 0),
    riwayatLengkap: !paymentHistoryTruncated
  };
}
__name(ownPayments, "ownPayments");

/* Personal finance: the payer identity is always derived from the authenticated
   session member_id. Never accept payerId from the browser. */
async function f4MemberPortalFinance(db, memberId, kind) {
  if(!["payments","arisan","fines","loans"].includes(kind))return safeError("Jenis data pribadi tidak tersedia.",404);
  const payers=await db.prepare("SELECT id FROM bookkeeping_payers WHERE member_id=? AND payer_type='warga' AND active=1 LIMIT 2").bind(memberId).all();
  if((payers.results||[]).length>1)return safeError("Akun terhubung ke lebih dari satu pembayar. Hubungi pengurus.",409);
  const payerId=payers.results?.[0]?.id;
  if(!payerId)return json({ok:true,rows:[],linked:false,readOnly:true,source:"cloudflare-d1"});
  let records=[];
  if(kind==="payments"){
    const data=await ownPayments(db,memberId);
    if(data.riwayatLengkap===false)return safeError("Riwayat pribadi melebihi batas; jangan menampilkan laporan terpotong.",409);
    // Source of truth: actual D1 allocation rows, not the combined received amount.
    records=(data.pembayaran||[]).flatMap(p=>{
      const alokasi=Array.isArray(p.alokasi)?p.alokasi:[];
      if(!alokasi.length)return [{
        id:p.id,tanggal:p.tanggal,nominalRp:p.jumlahRp,status:p.status,
        jenis:"TANPA_ALOKASI",periode:null,
        keterangan:"Pembayaran historis belum memiliki rincian kategori D1"
      }];
      return alokasi.map((a,index)=>({
        id:p.id+":"+index,paymentId:p.id,tanggal:p.tanggal,
        nominalRp:Number(a.jumlahRp||0),
        status:p.status==="aktif"&&a.status==="aktif"?"aktif":"dibatalkan",
        jenis:a.jenis,periode:a.tahun+"-"+String(a.bulan).padStart(2,"0"),
        keterangan:[a.tahun+"-"+String(a.bulan).padStart(2,"0"),p.keterangan].filter(Boolean).join(" • ")
      }));
    });
  }else if(kind==="arisan"){
    const rows=await db.prepare(`SELECT p.id,p.paid_on AS tanggal,p.status,p.description,a.period_year AS tahun,
       a.period_month AS bulan,a.amount_rp AS nominalRp,a.status AS alokasiStatus
       FROM bookkeeping_payment_allocations a
       JOIN bookkeeping_payments p ON p.id=a.payment_id
       WHERE a.payer_id=? AND a.contribution_type='ARISAN'
       ORDER BY p.paid_on DESC,p.id DESC LIMIT 501`).bind(payerId).all();
    if(rows.results.length>500)return safeError("Riwayat arisan melebihi batas laporan.",409);
    records=rows.results.map(x=>({id:x.id,tanggal:x.tanggal,status:x.status==="aktif"&&x.alokasiStatus==="aktif"?"aktif":"dibatalkan",
      nominalRp:Number(x.nominalRp||0),keterangan:"Arisan "+x.tahun+"-"+String(x.bulan).padStart(2,"0")+(x.description?" • "+x.description:"")}));
  }else if(kind==="fines"){
    const rows=await db.prepare(`SELECT id,event_on,amount_rp,paid_rp,status,note,fine_type
      FROM bookkeeping_fines WHERE payer_id=? ORDER BY event_on DESC,id DESC LIMIT 501`).bind(payerId).all();
    if(rows.results.length>500)return safeError("Riwayat denda melebihi batas laporan.",409);
    records=rows.results.map(x=>{
      // A migration timestamp stored as note is not the Gorol event/payment date.
      const raw=String(x.note||"").trim();
      const note=/^20[0-9]{2}-[0-9]{2}-[0-9]{2}(?:[ T][0-9]{2}:[0-9]{2}:[0-9]{2}(?:[.][0-9]+)?)?$/.test(raw)?"":raw;
      return {id:x.id,tanggal:x.event_on,status:x.status,nominalRp:Number(x.amount_rp||0),
        dibayarRp:Number(x.paid_rp||0),keterangan:(x.fine_type||"Denda")+(note?" • "+note:"")};
    });
  }else{
    const rows=await db.prepare(`SELECT l.id,l.loaned_on,l.amount_rp,l.status,l.note,
      COALESCE((SELECT SUM(r.amount_rp) FROM bookkeeping_loan_repayments r
        WHERE r.loan_id=l.id AND r.status='aktif'),0) AS repaidRp
      FROM bookkeeping_loans l WHERE l.payer_id=? ORDER BY l.loaned_on DESC,l.id DESC LIMIT 501`).bind(payerId).all();
    if(rows.results.length>500)return safeError("Riwayat pinjaman melebihi batas laporan.",409);
    records=rows.results.map(x=>({id:x.id,tanggal:x.loaned_on,status:x.status,nominalRp:Number(x.amount_rp||0),
      dibayarRp:Number(x.repaidRp||0),keterangan:x.note||"Pinjaman"}));
  }
  return json({ok:true,rows:records,linked:true,readOnly:true,source:"cloudflare-d1"});
}
__name(f4MemberPortalFinance,"f4MemberPortalFinance");

async function f4ContributionReport(db, request) {
  const params = new URL(request.url).searchParams, kind = params.get("kind") || "", level = params.get("level") || "month";
  if (!["rt", "arisan"].includes(kind)) return safeError("Jenis laporan tidak tersedia.", 400);
  const from = params.get("from") || "", to = params.get("to") || "";
  if (from && !validDateOnly(from) || to && !validDateOnly(to) || from && to && from > to) return safeError("Periode tidak valid.", 400);
  const where = ["a.status='aktif'", "p.status='aktif'"], bind = [];
  if (from) {
    where.push(level === "date" ? "p.paid_on>=?" : "printf('%04d-%02d',a.period_year,a.period_month)>=?");
    bind.push(level === "date" ? from : from.slice(0, 7));
  }
  if (to) {
    where.push(level === "date" ? "p.paid_on<=?" : "printf('%04d-%02d',a.period_year,a.period_month)<=?");
    bind.push(level === "date" ? to : to.slice(0, 7));
  }
  const found = await db.prepare(`SELECT a.id,p.id AS payment_id,bp.id AS payer_id,bp.display_name,
  h.house_code,p.payment_method,a.period_year,a.period_month,ad.contribution_type,ad.amount_rp AS line_rp
  FROM bookkeeping_payment_allocations a
  JOIN bookkeeping_payments p ON p.id=a.payment_id
  JOIN bookkeeping_payers bp ON bp.id=p.payer_id
  LEFT JOIN households h ON h.id=bp.household_id
  LEFT JOIN bookkeeping_allocation_details ad ON ad.allocation_id=a.id
  WHERE ${where.join(" AND ")} ORDER BY bp.display_name,a.period_year,a.period_month`).bind(...bind).all();
  const byPayer = /* @__PURE__ */ new Map();
  for (const x of found.results || []) {
    const payer = x.payer_id;
    if (!byPayer.has(payer)) {
      const split = String(x.house_code || "").split("/");
      byPayer.set(payer, {
        idWarga: payer,
        nama: x.display_name || "",
        blok: split[0] || "",
        noRumah: split.slice(1).join("/") || "",
        nominalBulanan: 0,
        nominalKebersihan: 0,
        nominalBayar: 0,
        metode: x.payment_method || "",
        keterangan: ""
      });
    }
    const entry = byPayer.get(payer), amount = Number(x.line_rp || 0);
    if (x.contribution_type === "bulanan") entry.nominalBulanan += amount;
    if (x.contribution_type === "kebersihan") entry.nominalKebersihan += amount;
    if (x.contribution_type === "arisan") entry.nominalBayar += amount;
  }
  const year = Number((from || to || "").slice(0, 4)) || (/* @__PURE__ */ new Date()).getUTCFullYear();
  const month = Number((from || to || "").slice(5, 7)) || (/* @__PURE__ */ new Date()).getUTCMonth() + 1;
  const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const entries = [...byPayer.values()];
  if (kind === "rt") {
    const rows2 = entries.filter((x) => x.nominalBulanan > 0 || x.nominalKebersihan > 0);
    const totalBulanan = rows2.reduce((a, x) => a + x.nominalBulanan, 0), totalKebersihan = rows2.reduce((a, x) => a + x.nominalKebersihan, 0);
    return json({ ok: true, data: {
      namaBulan: monthNames[month],
      tahun: year,
      ringkasan: { totalBulanan, totalKebersihan, totalSetoran: totalBulanan + totalKebersihan, talanganCount: 0 },
      rows: rows2,
      catatan: "Setoran RT berdasarkan alokasi iuran D1; talangan belum digabung otomatis."
    } });
  }
  const tariff = await db.prepare("SELECT amount_rp FROM bookkeeping_contribution_tariffs WHERE contribution_type='ARISAN'").first();
  const value = Number(tariff?.amount_rp || 0);
  const targetMonth=f4IuranMonth(year,month);
  const obligations = await db.prepare(`SELECT o.payer_id,o.qty_arisan FROM bookkeeping_payer_obligation_periods o
    WHERE o.effective_from=(SELECT MAX(v.effective_from) FROM bookkeeping_payer_obligation_periods v
      WHERE v.payer_id=o.payer_id AND v.effective_from<=?)`).bind(targetMonth).all();
  const qty = new Map((obligations.results || []).map(x=>[x.payer_id,Number(x.qty_arisan||0)]));
  const rows = entries.filter((x) => x.nominalBayar > 0).map((x) => {
    const periodQty=qty.has(x.idWarga)?qty.get(x.idWarga):0;
    const expected=value*periodQty;
    return {...x,qtyArisan:periodQty,nominalWajib:expected,status:expected>0&&x.nominalBayar>=expected?"LUNAS":"PERIKSA"};
  });
  return json({ ok: true, data: {
    namaBulan: monthNames[month],
    tahun: year,
    rows,
    ringkasan: { totalBayar: rows.reduce((a, x) => a + x.nominalBayar, 0) },
    catatan: "Arisan dari alokasi D1; status belum bayar dilengkapi master warga di frontend."
  } });
}
__name(f4ContributionReport, "f4ContributionReport");
async function f4CorrectPaymentDate(env, request, who) {
  let input;
  try {
    input = await requestJson(request);
  } catch {
    return safeError("Data koreksi tidak valid.", 400);
  }
  const paymentId = String(input.idPembayaran || "").trim();
  const newDate = String(input.tanggalBaru || "").trim();
  const reason = String(input.alasan || "Koreksi tanggal transaksi hasil migrasi").trim();
  if (!paymentId || paymentId.length > 128 || !validDateOnly(newDate) || reason.length < 10 || reason.length > 500)
    return safeError("ID, tanggal, atau alasan koreksi tidak valid.", 400);
  // Endpoint ini khusus koreksi tanggal riwayat migrasi terkunci.
  // Pembayaran D1 baru mengikuti aturan edit/cancel dan proteksi batch sendiri.
  if (/^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(paymentId))
    return safeError("Hanya tanggal pembayaran hasil migrasi terkunci yang bisa dikoreksi di sini.", 409);
  const old = await env.DB.prepare("SELECT id,paid_on,status,amount_rp,payer_id FROM bookkeeping_payments WHERE id=?").bind(paymentId).first();
  if (!old) return safeError("Pembayaran tidak ditemukan.", 404);
  if (String(old.status).toLowerCase() !== "aktif") return safeError("Hanya pembayaran aktif dapat dikoreksi.", 409);
  if (old.paid_on === newDate) return json({ ok: true, unchanged: true, tanggal: newDate });
  const years = [.../* @__PURE__ */ new Set([Number(String(old.paid_on).slice(0, 4)), Number(newDate.slice(0, 4))])];
  for (const year of years) {
    const closed = await env.DB.prepare("SELECT id FROM bookkeeping_year_archives WHERE fiscal_year=? AND status IN ('ditutup','terkunci','final') LIMIT 1").bind(year).first();
    if (closed) return safeError("Koreksi ditolak: tahun pembukuan sudah ditutup.", 409);
  }
  const linked = await env.DB.prepare("SELECT id,occurred_on,status FROM bookkeeping_cash_transactions WHERE source_payment_id=?").bind(paymentId).all();
  const cashRows = linked.results || [];
  if (cashRows.some((x) => String(x.status).toLowerCase() !== "aktif")) return safeError("Jurnal Kas terkait tidak aktif; perlu pemeriksaan manual.", 409);
  const actor = who?.id || null;
  try {
    const statements = [
      env.DB.prepare("UPDATE bookkeeping_payments SET paid_on=? WHERE id=? AND paid_on=?").bind(newDate, paymentId, old.paid_on),
      ...cashRows.map((x) => env.DB.prepare("UPDATE bookkeeping_cash_transactions SET occurred_on=? WHERE id=? AND occurred_on=?").bind(newDate, x.id, x.occurred_on)),
      env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,before_json,after_json) VALUES(?,?,?,?,?,?,?,?,?)").bind(
        crypto.randomUUID(),
        actor,
        "pembukuan",
        "correct_migrated_payment_date",
        "bookkeeping_payments",
        paymentId,
        reason,
        JSON.stringify({ paid_on: old.paid_on, linked_cash: cashRows.map((x) => ({ id: x.id, occurred_on: x.occurred_on })) }),
        JSON.stringify({ paid_on: newDate, linked_cash_count: cashRows.length })
      )
    ];
    await env.DB.batch(statements);
    return json({ ok: true, message: "Tanggal pembayaran dan jurnal terkait berhasil dikoreksi. Audit tersimpan.", tanggalBaru: newDate });
  } catch {
    return safeError("Koreksi gagal; tidak ada nominal yang boleh berubah.", 409);
  }
}
__name(f4CorrectPaymentDate, "f4CorrectPaymentDate");
async function f4QuickIuranSummary(db, request) {
  const q = new URL(request.url).searchParams, from = q.get("from") || "", to = q.get("to") || "", level = q.get("level") || "month";
  if (from && !validDateOnly(from) || to && !validDateOnly(to) || from && to && from > to) return safeError("Rentang tanggal tidak valid.", 400);
  const conditions = ["p.status='aktif'", "a.status='aktif'"], bind = [];
  if (from) {
    conditions.push(level === "date" ? "p.paid_on>=?" : "printf('%04d-%02d',a.period_year,a.period_month)>=?");
    bind.push(level === "date" ? from : from.slice(0, 7));
  }
  if (to) {
    conditions.push(level === "date" ? "p.paid_on<=?" : "printf('%04d-%02d',a.period_year,a.period_month)<=?");
    bind.push(level === "date" ? to : to.slice(0, 7));
  }
  // Pembagian iuran berasal dari alokasi pembayaran yang sah di D1.
  // Pemeriksaan audit: kategori RT, Kas Lorong, dan Arisan tidak boleh berasal dari posting batch saja.
  // bookkeeping_allocation_details adalah tahap pembukuan batch SETOR RT; transaksi
  // baru belum tentu memiliki detail tersebut. Jangan menghitung pembagian dari
  // tabel posting karena seluruh iuran baru akan tampak sebagai "Selisih".
  const found = await db.prepare(`SELECT a.id,a.payment_id,p.payer_id,a.amount_rp,p.payment_method,
    a.contribution_type
    FROM bookkeeping_payment_allocations a
    JOIN bookkeeping_payments p ON p.id=a.payment_id
    WHERE ${conditions.join(" AND ")} ORDER BY a.period_year,a.period_month,a.id`).bind(...bind).all();
  const allocations = /* @__PURE__ */ new Map();
  for (const x of found.results || []) {
    const kind = String(x.contribution_type || "").trim().toUpperCase();
    allocations.set(x.id, {
      payer: x.payer_id, amount: Number(x.amount_rp || 0),
      method: String(x.payment_method || "").toLowerCase(),
      detail: {
        bulanan: kind === "IURAN_BULANAN" ? Number(x.amount_rp || 0) : 0,
        kebersihan: kind === "KEBERSIHAN" ? Number(x.amount_rp || 0) : 0,
        kas_lorong: kind === "KAS_LORONG" ? Number(x.amount_rp || 0) : 0,
        arisan: kind === "ARISAN" ? Number(x.amount_rp || 0) : 0
      }
    });
  }
  const t = { totalMasuk: 0, setoranRT: 0, kasLorong: 0, arisan: 0, cash: 0, qris: 0, mandiri: 0, selisih: 0 };
  const grouped = { total: /* @__PURE__ */ new Set(), rt: /* @__PURE__ */ new Set(), kas: /* @__PURE__ */ new Set(), arisan: /* @__PURE__ */ new Set() };
  for (const p of allocations.values()) {
    t.totalMasuk += p.amount;
    grouped.total.add(p.payer);
    const rt = (p.detail.bulanan || 0) + (p.detail.kebersihan || 0), kas = p.detail.kas_lorong || 0, arisan = p.detail.arisan || 0;
    t.setoranRT += rt;
    t.kasLorong += kas;
    t.arisan += arisan;
    if (rt) grouped.rt.add(p.payer);
    if (kas) grouped.kas.add(p.payer);
    if (arisan) grouped.arisan.add(p.payer);
    if (p.method.includes("cash") || p.method.includes("tunai")) t.cash += p.amount;
    else if (p.method.includes("qris") || p.method === "qr") t.qris += p.amount;
    else if (p.method.includes("mandiri")) t.mandiri += p.amount;
  }
  t.selisih = t.totalMasuk - t.setoranRT - t.kasLorong - t.arisan;
  const summaryMonth=/^\d{4}-\d{2}/.test(to||from||"")?(to||from).slice(0,7)+"-01":f4CurrentIuranMonth();
  const obligationRows=await db.prepare(`SELECT o.payer_id,o.qty_iuran_bulanan,o.qty_kebersihan,o.qty_kas_lorong,o.qty_arisan
    FROM bookkeeping_payer_obligation_periods o JOIN bookkeeping_payers p ON p.id=o.payer_id
    WHERE o.effective_from=(SELECT MAX(v.effective_from) FROM bookkeeping_payer_obligation_periods v
    WHERE v.payer_id=o.payer_id AND v.effective_from<=?)`).bind(summaryMonth).all();
  const required = { total: /* @__PURE__ */ new Set(), rt: /* @__PURE__ */ new Set(), kas: /* @__PURE__ */ new Set(), arisan: /* @__PURE__ */ new Set() };
  for (const o of obligationRows.results || []) {
    const rt = Number(o.qty_iuran_bulanan || 0) + Number(o.qty_kebersihan || 0), kas = Number(o.qty_kas_lorong || 0), arisan = Number(o.qty_arisan || 0);
    if (rt + kas + arisan > 0) required.total.add(o.payer_id);
    if (rt) required.rt.add(o.payer_id);
    if (kas) required.kas.add(o.payer_id);
    if (arisan) required.arisan.add(o.payer_id);
  }
  const counts = Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k, {
    lunas: v.size,
    sebagian: 0,
    belum: [...required[k]].filter((x) => !v.has(x)).length
  }]));
  return json({ ok: true, data: { totals: t, counts, labelPeriode: from && to ? `${from.slice(0, 7)} s.d. ${to.slice(0, 7)}` : "Semua periode", source: "cloudflare-d1-periode-alokasi" } });
}
__name(f4QuickIuranSummary, "f4QuickIuranSummary");
async function f4CashReport(db, request) {
  const q = new URL(request.url).searchParams, from = q.get("from") || "", to = q.get("to") || "";
  if (from && !validDateOnly(from) || to && !validDateOnly(to) || from && to && from > to) return safeError("Rentang tanggal tidak valid.", 400);
  const clauses = ["status='aktif'"], args = [];
  if (from) {
    clauses.push("occurred_on>=?");
    args.push(from);
  }
  if (to) {
    clauses.push("occurred_on<=?");
    args.push(to);
  }
  const found = await db.prepare(`SELECT c.id,c.occurred_on,c.transaction_type,c.category,c.debit_rp,c.credit_rp,c.note,c.payment_method,
    COALESCE(p.display_name,'') AS payer_name
  FROM bookkeeping_cash_transactions_posted c LEFT JOIN bookkeeping_payers p ON p.id=c.payer_id
  WHERE ${clauses.join(" AND ")} ORDER BY c.occurred_on,c.id`).bind(...args).all();
  const before = from ? await db.prepare("SELECT COALESCE(SUM(debit_rp-credit_rp),0) AS amount FROM bookkeeping_cash_transactions_posted WHERE status='aktif' AND occurred_on<?").bind(from).first() : { amount: 0 };
  const rows = (found.results || []).map((x) => ({
    idTransaksi: x.id,
    tanggal: x.occurred_on,
    jenis: x.transaction_type,
    kategori: x.category || "",
    keterangan: x.note || x.category || "",
    namaWarga: x.payer_name || "",
    debit: Number(x.debit_rp || 0),
    kredit: Number(x.credit_rp || 0),
    sumber: "D1"
  }));
  const debit = rows.reduce((n, x) => n + x.debit, 0), kredit = rows.reduce((n, x) => n + x.kredit, 0), saldoAwal = Number(before?.amount || 0);
  return json({ ok: true, data: {
    labelPeriode: from && to ? `${from} s.d. ${to}` : "Seluruh periode",
    ringkasan: { saldoAwal, debit, kredit, saldoPeriode: debit - kredit, saldoAkhir: saldoAwal + debit - kredit },
    rows,
    catatan: "Kas tercatat pada Cloudflare D1; bukan pengesahan Tutup Buku."
  } });
}
__name(f4CashReport, "f4CashReport");

// Read-only year-end summary for the original Pembukuan report tab.
// Aggregates the cash journal once; RT/arisan amounts are memo details, NOT extra cash inflows.
async function f4YearlyReadOnlyReport(db, request) {
  const raw = new URL(request.url).searchParams.get('year') || '';
  if (!/^\d{4}$/.test(raw) || Number(raw)<2020 || Number(raw)>2100)
    return safeError('Tahun laporan tidak valid.',400);
  const year=Number(raw), begin=raw+'-01-01', end=raw+'-12-31';
  const names=['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const [opening,journal,allocation,loans,advances,unpostedPayments,archived] = await Promise.all([
    db.prepare(`SELECT COALESCE(SUM(debit_rp-credit_rp),0) AS amount FROM bookkeeping_cash_transactions_posted WHERE status='aktif' AND occurred_on<?`).bind(begin).first(),
    db.prepare(`SELECT substr(occurred_on,6,2) AS mon,
       COALESCE(SUM(debit_rp),0) AS debit,
       COALESCE(SUM(credit_rp),0) AS credit,
       -- KAS0011: uang saldo awal serah-terima pengurus, BUKAN pemasukan operasional.
       -- Tetap simpan jurnal aslinya; klasifikasi baca-saja dalam laporan tahunan.
       COALESCE(SUM(CASE WHEN id='cash:KAS0011'
         AND occurred_on='2026-08-31' AND category='Saldo Awal'
         AND note='Saldo Awal Serah Terima'
         AND debit_rp=794000 AND credit_rp=0
         THEN debit_rp ELSE 0 END),0) AS handover_opening,
       COALESCE(SUM(CASE WHEN lower(category) LIKE '%denda%' THEN debit_rp ELSE 0 END),0) AS denda
       FROM bookkeeping_cash_transactions_posted
       WHERE status='aktif' AND occurred_on>=? AND occurred_on<=?
       GROUP BY substr(occurred_on,6,2)`).bind(begin,end).all(),
    db.prepare(`SELECT substr(p.paid_on,6,2) AS mon,
       COALESCE(SUM(CASE WHEN ad.contribution_type IN ('bulanan','kebersihan') THEN ad.amount_rp ELSE 0 END),0) AS rt,
       COALESCE(SUM(CASE WHEN ad.contribution_type='arisan' THEN ad.amount_rp ELSE 0 END),0) AS arisan
       FROM bookkeeping_payment_allocations a
       JOIN bookkeeping_payments p ON p.id=a.payment_id
       JOIN bookkeeping_allocation_details ad ON ad.allocation_id=a.id
       WHERE p.status='aktif' AND a.status='aktif' AND p.paid_on>=? AND p.paid_on<=?
       GROUP BY substr(p.paid_on,6,2)`).bind(begin,end).all(),
    db.prepare(`SELECT COALESCE(SUM(max(0,l.amount_rp-COALESCE((SELECT SUM(r.amount_rp) FROM bookkeeping_loan_repayments r
       WHERE r.loan_id=l.id AND r.status='aktif' AND r.repaid_on<=?),0))),0) AS due
       FROM bookkeeping_loans l WHERE l.status!='dibatalkan' AND l.loaned_on<=?`).bind(end,end).first(),
    db.prepare(`SELECT COALESCE(SUM(max(0,a.amount_rp-COALESCE((SELECT SUM(r.amount_rp) FROM bookkeeping_advance_repayments r
       WHERE r.advance_id=a.id AND r.status='aktif' AND r.repaid_on<=?),a.reimbursed_rp,0))),0) AS due
       FROM bookkeeping_advances a WHERE a.status!='dibatalkan' AND a.advanced_on<=?`).bind(end,end).first(),
    db.prepare(`SELECT COUNT(*) AS jumlah,COALESCE(SUM(p.amount_rp),0) AS nominal_rp
       FROM bookkeeping_payments p
       WHERE p.status='aktif' AND p.paid_on>=? AND p.paid_on<=?
       AND NOT EXISTS (SELECT 1 FROM bookkeeping_cash_transactions c
          WHERE c.source_payment_id=p.id AND c.status='aktif')`).bind(begin,end).first(),
    db.prepare(`SELECT id,status,created_at FROM bookkeeping_year_archives WHERE fiscal_year=? LIMIT 1`).bind(year).first()
  ]);
  const cashByMonth=new Map((journal.results||[]).map(row=>[String(row.mon),row]));
  const allocByMonth=new Map((allocation.results||[]).map(row=>[String(row.mon),row]));
  const asNumber=v=>Number(v||0);
  const bulanan=Array.from({length:12},(_,index)=>{
    const m=String(index+1).padStart(2,'0'),c=cashByMonth.get(m)||{},a=allocByMonth.get(m)||{};
    const pemasukan=asNumber(c.debit)-asNumber(c.handover_opening),pengeluaran=asNumber(c.credit);
    return {bulan:index+1,namaBulan:names[index+1],pemasukan,pengeluaran,saldoPeriode:pemasukan-pengeluaran,
      setoranRT:asNumber(a.rt),arisan:asNumber(a.arisan),dendaMasuk:asNumber(c.denda)};
  });
  const sum=key=>bulanan.reduce((total,row)=>total+row[key],0);
  const sumOpening=(journal.results||[]).reduce((n,row)=>n+asNumber(row.handover_opening),0);
  const saldoBawaan=sumOpening, saldoAwal=asNumber(opening?.amount)+saldoBawaan,pemasukan=sum('pemasukan'),pengeluaran=sum('pengeluaran');
  const locked=archived&&['ditutup','terkunci','final'].includes(String(archived.status).toLowerCase());
  return json({ok:true,data:{tahun:year,bulanan,
    ringkasan:{saldoAwal,pemasukan,pengeluaran,saldoPeriode:pemasukan-pengeluaran,
      saldoAkhir:saldoAwal+pemasukan-pengeluaran,saldoBawaanSerahTerima:saldoBawaan,
      totalSetoranRT:sum('setoranRT'),totalArisan:sum('arisan'),
      totalDendaMasuk:sum('dendaMasuk'),sisaPinjaman:asNumber(loans?.due),sisaTalangan:asNumber(advances?.due)},
    sudahDitutup:!!locked,bisaDitutup:false,
    laporanSementara:true,
    belumRekonsiliasi:Number(unpostedPayments?.jumlah||0)>0,
    pembayaranTanpaRelasiJurnal:{jumlah:Number(unpostedPayments?.jumlah||0),nominalRp:Number(unpostedPayments?.nominal_rp||0)},
    tutupBuku:locked?{tanggalTutup:archived.created_at}:null,
    saldoAwalTahunBerikutnya:saldoAwal+pemasukan-pengeluaran,
    catatan:'REKAP SEMENTARA jurnal kas D1, belum menjadi saldo final atau Tutup Buku. Saldo serah-terima Rp794.000 adalah saldo pembuka, bukan pemasukan baru. Pembayaran iuran tanpa tautan otomatis ke jurnal kas memerlukan pencocokan, bukan berarti pasti belum dibukukan. Setoran RT dan Arisan hanya rincian alokasi, bukan tambahan kas.'}});
}

async function bookkeepingIuranHistory(db, request) {
  const url = new URL(request.url);
  const limit = Math.min(1e3, Math.max(1, Number(url.searchParams.get("limit")) || 500));
  const out = await db.prepare(`SELECT p.id,p.payer_id,p.paid_on,p.amount_rp,p.payment_method,p.description,p.status,p.payment_seq,
    bp.display_name,bp.member_id,m.household_id,h.house_code,
    a.period_year,a.period_month,a.contribution_type,a.amount_rp AS allocation_rp,a.status AS allocation_status
    FROM (SELECT rowid AS payment_seq,* FROM bookkeeping_payments ORDER BY paid_on DESC,rowid DESC LIMIT ?) p
    JOIN bookkeeping_payers bp ON bp.id=p.payer_id
    LEFT JOIN members m ON m.id=bp.member_id
    LEFT JOIN households h ON h.id=COALESCE(p.household_id,m.household_id)
    LEFT JOIN bookkeeping_payment_allocations a ON a.payment_id=p.id
    ORDER BY p.paid_on DESC,p.payment_seq DESC,a.period_year,a.period_month`).bind(limit).all();
  const byId = /* @__PURE__ */ new Map();
  for (const r of out.results || []) {
    if (!byId.has(r.id)) byId.set(r.id, {
      idPembayaran: r.id,
      idWarga: r.member_id || r.payer_id,
      nama: r.display_name || "",
      tanggal: r.paid_on,
      urutanInput: Number(r.payment_seq || 0),
      totalDiterima: Number(r.amount_rp || 0),
      metode: r.payment_method || "",
      catatan: r.description || "",
      status: String(r.status || "").toLowerCase() === "aktif" ? "AKTIF" : "BATAL",
      blok: (r.house_code || "").split("/")[0] || "",
      noRumah: (r.house_code || "").split("/").slice(1).join("/") || "",
      periode: [],
      alokasi: [],
      // Migrated history stays immutable. New pay-UUID can cancel but not edit/delete.
      canEdit: false,
      canCancel: /^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(r.id) && r.status === "aktif",
      locked: !(/^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(r.id) && r.status === "aktif"),
      canCorrectMigrationDate: !/^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(r.id) && r.status === "aktif"
    });
    if (r.period_year !== null) {
      const item = byId.get(r.id);
      item.alokasi.push({
        tahun: Number(r.period_year),
        bulan: Number(r.period_month),
        jenis: r.contribution_type,
        nominal: Number(r.allocation_rp || 0),
        status: r.allocation_status
      });
      const month = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][Number(r.period_month)];
      if (month) {
        const label = month + " " + r.period_year;
        if (!item.periode.includes(label)) item.periode.push(label);
      }
    }
  }
  return json({ ok: true, data: [...byId.values()], source: "cloudflare-d1", limit });
}
__name(bookkeepingIuranHistory, "bookkeepingIuranHistory");
async function auditIuranCash(db) {
  const checks = {
    tanpaJurnal: `SELECT p.id AS payment_id,p.amount_rp AS nilai,
      (SELECT COUNT(*) FROM bookkeeping_cash_transactions c WHERE c.source_payment_id=p.id AND c.status='aktif') AS jumlah_jurnal
      FROM bookkeeping_payments p WHERE p.status='aktif'
        AND NOT EXISTS (SELECT 1 FROM bookkeeping_cash_transactions c WHERE c.source_payment_id=p.id AND c.status='aktif')
      ORDER BY p.paid_on DESC LIMIT 100`,
    jurnalGanda: `SELECT p.id AS payment_id,p.amount_rp AS nilai,COUNT(c.id) AS jumlah_jurnal
      FROM bookkeeping_payments p JOIN bookkeeping_cash_transactions c ON c.source_payment_id=p.id AND c.status='aktif'
      WHERE p.status='aktif' GROUP BY p.id HAVING COUNT(c.id)>1 LIMIT 100`,
    selisihJurnal: `SELECT p.id AS payment_id,p.amount_rp AS nilai,
      COALESCE(SUM(c.debit_rp-c.credit_rp),0) AS nilai_jurnal
      FROM bookkeeping_payments p JOIN bookkeeping_cash_transactions c ON c.source_payment_id=p.id AND c.status='aktif'
      WHERE p.status='aktif' GROUP BY p.id HAVING SUM(c.debit_rp-c.credit_rp)<>p.amount_rp LIMIT 100`,
    selisihAlokasi: `SELECT p.id AS payment_id,p.amount_rp AS nilai,
      COALESCE(SUM(CASE WHEN a.status='aktif' THEN a.amount_rp ELSE 0 END),0) AS nilai_alokasi
      FROM bookkeeping_payments p LEFT JOIN bookkeeping_payment_allocations a ON a.payment_id=p.id
      WHERE p.status='aktif' GROUP BY p.id HAVING nilai_alokasi<>p.amount_rp LIMIT 100`
  };
  const result = {};
  for (const [name, sql] of Object.entries(checks)) {
    const rows = await db.prepare(sql).all();
    result[name] = rows.results || [];
  }
  return json({
    ok: true,
    scope: "audit-iuran-jurnal",
    readOnly: true,
    catatan: "Maksimum 100 temuan per jenis. Data impor lama bisa belum memiliki hubungan jurnal; verifikasi sebelum perubahan.",
    jumlahTerlihat: Object.fromEntries(Object.entries(result).map(([k, v]) => [k, v.length])),
    temuan: result
  });
}
__name(auditIuranCash, "auditIuranCash");
async function auditTalangan(db) {
  const queries = {
    angsuranTanpaTalangan: `SELECT r.id,r.advance_id,r.amount_rp FROM bookkeeping_advance_repayments r
      LEFT JOIN bookkeeping_advances a ON a.id=r.advance_id WHERE a.id IS NULL LIMIT 100`,
    jumlahTidakValid: `SELECT a.id,a.amount_rp,a.reimbursed_rp,a.status FROM bookkeeping_advances a
      WHERE a.amount_rp<0 OR a.reimbursed_rp<0 OR a.reimbursed_rp>a.amount_rp LIMIT 100`,
    angsuranMelebihiPokok: `SELECT a.id,a.amount_rp,a.reimbursed_rp,
      COALESCE(SUM(CASE WHEN r.status='aktif' THEN r.amount_rp ELSE 0 END),0) AS total_angsuran
      FROM bookkeeping_advances a LEFT JOIN bookkeeping_advance_repayments r ON r.advance_id=a.id
      WHERE a.status='aktif' GROUP BY a.id
      HAVING total_angsuran>a.amount_rp LIMIT 100`,
    perbedaanRingkasan: `SELECT a.id,a.amount_rp,a.reimbursed_rp,
      COALESCE(SUM(CASE WHEN r.status='aktif' THEN r.amount_rp ELSE 0 END),0) AS total_angsuran
      FROM bookkeeping_advances a LEFT JOIN bookkeeping_advance_repayments r ON r.advance_id=a.id
      WHERE a.status='aktif' GROUP BY a.id
      HAVING total_angsuran<>a.reimbursed_rp LIMIT 100`
  };
  const temuan = {};
  for (const [jenis, sql] of Object.entries(queries)) {
    const rows = await db.prepare(sql).all();
    temuan[jenis] = rows.results || [];
  }
  return json({
    ok: true,
    scope: "audit-talangan",
    readOnly: true,
    catatan: "Perbedaan ringkasan belum tentu kesalahan: pada impor lama reimbursed_rp bisa merepresentasikan saldo historis tanpa rincian angsuran. Tidak ada perubahan jurnal otomatis.",
    jumlahTerlihat: Object.fromEntries(Object.entries(temuan).map(([k, v]) => [k, v.length])),
    temuan
  });
}
__name(auditTalangan, "auditTalangan");
async function listTalanganD1(db, request) {
  const url = new URL(request.url);
  const limitValue = Number(url.searchParams.get("limit") || 100);
  if (!Number.isInteger(limitValue) || limitValue < 1 || limitValue > 200) return safeError("Batas daftar 1\u2013200.", 400);
  const advances = await db.prepare(`SELECT a.id,a.advanced_on,a.payer_id,a.due_on,a.description,
      a.amount_rp,a.reimbursed_rp,a.status,
      p.display_name AS payer_name,h.house_code AS rumah,
      COALESCE(r.jumlah,0) AS jumlah_angsuran,
      COALESCE(r.total,0) AS total_angsuran
    FROM bookkeeping_advances a
    LEFT JOIN bookkeeping_payers p ON p.id=a.payer_id
    LEFT JOIN households h ON h.id=p.household_id
    LEFT JOIN (
      SELECT advance_id,COUNT(*) AS jumlah,SUM(amount_rp) AS total
      FROM bookkeeping_advance_repayments
      WHERE status='aktif' GROUP BY advance_id
    ) r ON r.advance_id=a.id
    ORDER BY a.id DESC LIMIT ?`).bind(limitValue).all();
  const rows = (advances.results || []).map((advance) => {
    const pokok = Number(advance.amount_rp), ringkasan = Number(advance.reimbursed_rp), angsuran = Number(advance.total_angsuran || 0);
    return {
      id: advance.id,
      tanggal: advance.advanced_on,
      payerId: advance.payer_id,
      nama: advance.payer_name || "",
      rumah: advance.rumah || "",
      tanggalJatuhTempo: advance.due_on,
      keterangan: advance.description || "",
      status: advance.status,
      pokokRp: pokok,
      pelunasanRingkasanRp: ringkasan,
      angsuranTercatatRp: angsuran,
      jumlahAngsuran: Number(advance.jumlah_angsuran || 0),
      sisaMenurutRingkasanRp: pokok - ringkasan,
      perluRekonsiliasi: ringkasan !== angsuran
    };
  });
  return json({
    ok: true,
    source: "cloudflare-d1",
    readOnly: true,
    data: rows,
    catatan: "Selisih ringkasan dan angsuran bisa berasal dari impor historis. Jangan membuat jurnal otomatis berdasarkan selisih."
  });
}
__name(listTalanganD1, "listTalanganD1");
async function detailTalanganD1(db, request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("id") || "";
  if (!id || id.length > 150 || !/^[A-Za-z0-9_-]+$/.test(id))
    return safeError("ID talangan tidak valid.", 400);
  const a = await db.prepare(`SELECT id,advanced_on,payer_id,advanced_by,description,
    amount_rp,reimbursed_rp,status,created_at FROM bookkeeping_advances WHERE id=?`).bind(id).first();
  if (!a) return safeError("Talangan tidak ditemukan.", 404);
  const result = await db.prepare(`SELECT id,repaid_on,amount_rp,status,note
    FROM bookkeeping_advance_repayments WHERE advance_id=?
    ORDER BY repaid_on ASC,id ASC LIMIT 501`).bind(id).all();
  const repayments = result.results || [];
  if (repayments.length > 500) return safeError("Riwayat terlalu panjang; perlu paginasi sebelum ditampilkan.", 409);
  const active = repayments.filter((r) => r.status === "aktif");
  const total = active.reduce((n, r) => n + Number(r.amount_rp), 0);
  const pokok = Number(a.amount_rp), ringkasan = Number(a.reimbursed_rp);
  if (![total, pokok, ringkasan].every(Number.isSafeInteger))
    return safeError("Angka historis tidak valid; perlu pemeriksaan data.", 409);
  return json({
    ok: true,
    source: "cloudflare-d1",
    readOnly: true,
    talangan: {
      id: a.id,
      tanggal: a.advanced_on,
      payerId: a.payer_id,
      ditanggungOleh: a.advanced_by,
      keterangan: a.description,
      pokokRp: pokok,
      pelunasanRingkasanRp: ringkasan,
      status: a.status
    },
    angsuran: repayments.map((r) => ({
      id: r.id,
      tanggal: r.repaid_on,
      jumlahRp: Number(r.amount_rp),
      status: r.status,
      catatan: r.note
    })),
    jumlahAngsuranAktif: active.length,
    angsuranAktifRp: total,
    sisaMenurutRingkasanRp: pokok - ringkasan,
    selisihRingkasanRp: ringkasan - total,
    perluRekonsiliasi: ringkasan !== total,
    catatan: "Angsuran nonaktif ditampilkan sebagai audit, tidak ikut total. Selisih historis tidak membuat kas atau jurnal otomatis."
  });
}
__name(detailTalanganD1, "detailTalanganD1");
function auditLimit(request) {
  const raw = new URL(request.url).searchParams.get("limit") || "100";
  if (!/^[0-9]{1,3}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= 200 ? n : null;
}
__name(auditLimit, "auditLimit");
async function listDendaD1(db, request) {
  const limit = auditLimit(request);
  if (!limit) return safeError("Batas daftar harus 1\u2013200.", 400);
  const result = await db.prepare(`SELECT f.id,f.payer_id,f.household_id,f.event_on,
     f.fine_type,f.amount_rp,f.paid_rp,f.paid_on,f.status,f.note,
     p.display_name AS payer_name,h.house_code AS rumah
     FROM bookkeeping_fines f LEFT JOIN bookkeeping_payers p ON p.id=f.payer_id
     LEFT JOIN households h ON h.id=COALESCE(f.household_id,p.household_id)
     ORDER BY f.event_on DESC,f.id DESC LIMIT ?`).bind(limit).all();
  const rows = [];
  for (const r of result.results || []) {
    const amount = Number(r.amount_rp), paid = Number(r.paid_rp);
    if (!Number.isSafeInteger(amount) || !Number.isSafeInteger(paid)) return safeError("Nominal denda historis perlu diperiksa.", 409);
    rows.push({
      id: r.id,
      payerId: r.payer_id,
      nama: r.payer_name,
      rumah: r.rumah || "",
      householdId: r.household_id,
      tanggal: r.event_on,
      jenis: r.fine_type,
      nominalRp: amount,
      terbayarRp: paid,
      sisaRp: amount - paid,
      tanggalBayar: r.paid_on,
      status: r.status,
      catatan: r.note,
      perluRekonsiliasi: paid < 0 || paid > amount || r.status === "lunas" && paid !== amount || r.status === "belum" && paid >= amount
    });
  }
  return json({
    ok: true,
    readOnly: true,
    source: "cloudflare-d1",
    data: rows,
    catatan: "Status dan total denda historis diperiksa saja; belum ada penulisan kas atau perubahan denda."
  });
}
__name(listDendaD1, "listDendaD1");
async function listPinjamanD1(db, request) {
  const limit = auditLimit(request);
  if (!limit) return safeError("Batas daftar harus 1\u2013200.", 400);
  const result = await db.prepare(`SELECT l.id,l.payer_id,l.loaned_on,l.amount_rp,l.status,l.note,
    p.display_name AS payer_name,COALESCE(r.total,0) AS paid_rp,
    COALESCE(r.cnt,0) AS payment_count
    FROM bookkeeping_loans l LEFT JOIN bookkeeping_payers p ON p.id=l.payer_id
    LEFT JOIN (SELECT loan_id,SUM(amount_rp) AS total,COUNT(*) AS cnt
      FROM bookkeeping_loan_repayments WHERE status='aktif' GROUP BY loan_id) r ON r.loan_id=l.id
    ORDER BY l.loaned_on DESC,l.id DESC LIMIT ?`).bind(limit).all();
  const rows = [];
  for (const r of result.results || []) {
    const amount = Number(r.amount_rp), paid = Number(r.paid_rp);
    if (![amount, paid].every(Number.isSafeInteger)) return safeError("Nominal pinjaman historis perlu diperiksa.", 409);
    rows.push({
      id: r.id,
      payerId: r.payer_id,
      nama: r.payer_name,
      tanggal: r.loaned_on,
      pokokRp: amount,
      angsuranAktifRp: paid,
      jumlahAngsuran: Number(r.payment_count),
      sisaRp: amount - paid,
      status: r.status,
      catatan: r.note,
      perluRekonsiliasi: paid < 0 || paid > amount || r.status === "lunas" && paid !== amount
    });
  }
  return json({
    ok: true,
    readOnly: true,
    source: "cloudflare-d1",
    data: rows,
    catatan: "Total hanya menjumlah angsuran aktif. Tidak ada penulisan atau jurnal otomatis."
  });
}
__name(listPinjamanD1, "listPinjamanD1");
async function detailPinjamanD1(db, request) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[A-Za-z0-9_-]{1,150}$/.test(id)) return safeError("ID pinjaman tidak valid.", 400);
  const loan = await db.prepare(`SELECT l.id,l.payer_id,l.loaned_on,l.amount_rp,l.status,l.note,
    p.display_name AS payer_name FROM bookkeeping_loans l
    LEFT JOIN bookkeeping_payers p ON p.id=l.payer_id WHERE l.id=?`).bind(id).first();
  if (!loan) return safeError("Pinjaman tidak ditemukan.", 404);
  const res = await db.prepare(`SELECT id,repaid_on,amount_rp,status,note FROM bookkeeping_loan_repayments
    WHERE loan_id=? ORDER BY repaid_on ASC,id ASC LIMIT 501`).bind(id).all();
  if ((res.results || []).length > 500) return safeError("Riwayat melebihi 500; butuh paginasi.", 409);
  const items = (res.results || []).map((r) => ({
    id: r.id,
    tanggal: r.repaid_on,
    jumlahRp: Number(r.amount_rp),
    status: r.status,
    catatan: r.note
  }));
  if (!items.every((r) => Number.isSafeInteger(r.jumlahRp) && r.jumlahRp > 0)) return safeError("Nominal angsuran historis tidak valid.", 409);
  const paid = items.filter((r) => r.status === "aktif").reduce((n, r) => n + r.jumlahRp, 0);
  const principal = Number(loan.amount_rp);
  if (!Number.isSafeInteger(paid) || !Number.isSafeInteger(principal)) return safeError("Nominal pinjaman historis tidak valid.", 409);
  return json({
    ok: true,
    readOnly: true,
    source: "cloudflare-d1",
    pinjaman: {
      id: loan.id,
      payerId: loan.payer_id,
      nama: loan.payer_name,
      tanggal: loan.loaned_on,
      pokokRp: principal,
      status: loan.status,
      catatan: loan.note
    },
    angsuran: items,
    angsuranAktifRp: paid,
    sisaRp: principal - paid,
    perluRekonsiliasi: paid > principal || loan.status === "lunas" && paid !== principal
  });
}
__name(detailPinjamanD1, "detailPinjamanD1");
async function auditDendaPinjamanExceptions(db, request) {
  const limit = auditLimit(request);
  if (!limit) return safeError("Batas daftar harus 1\u2013200.", 400);
  const [fines, loans, orphans] = await Promise.all([
    db.prepare(`SELECT f.id,f.event_on,f.amount_rp,f.paid_rp,f.status,f.payer_id,
      p.display_name AS payer_name FROM bookkeeping_fines f
      LEFT JOIN bookkeeping_payers p ON p.id=f.payer_id
      WHERE f.amount_rp<0 OR f.paid_rp<0 OR f.paid_rp>f.amount_rp
        OR (f.status='lunas' AND f.paid_rp<>f.amount_rp)
        OR (f.status='belum' AND f.paid_rp>=f.amount_rp)
      ORDER BY f.event_on DESC,f.id DESC LIMIT ?`).bind(limit + 1).all(),
    db.prepare(`SELECT l.id,l.loaned_on,l.amount_rp,l.status,l.payer_id,
      p.display_name AS payer_name,COALESCE(r.total,0) AS paid_rp,
      COALESCE(r.invalid_count,0) AS invalid_count
      FROM bookkeeping_loans l LEFT JOIN bookkeeping_payers p ON p.id=l.payer_id
      LEFT JOIN (SELECT loan_id,SUM(CASE WHEN status='aktif' THEN amount_rp ELSE 0 END) AS total,
        SUM(CASE WHEN status='aktif' AND amount_rp<=0 THEN 1 ELSE 0 END) AS invalid_count
        FROM bookkeeping_loan_repayments GROUP BY loan_id) r ON r.loan_id=l.id
      WHERE l.amount_rp<=0 OR COALESCE(r.total,0)>l.amount_rp
        OR (l.status='lunas' AND COALESCE(r.total,0)<>l.amount_rp)
        OR COALESCE(r.invalid_count,0)>0
      ORDER BY l.loaned_on DESC,l.id DESC LIMIT ?`).bind(limit + 1).all(),
    db.prepare(`SELECT r.id,r.loan_id,r.repaid_on,r.amount_rp FROM bookkeeping_loan_repayments r
      LEFT JOIN bookkeeping_loans l ON l.id=r.loan_id WHERE l.id IS NULL
      ORDER BY r.repaid_on DESC,r.id DESC LIMIT ?`).bind(limit + 1).all()
  ]);
  const validNum = /* @__PURE__ */ __name((x) => Number.isSafeInteger(Number(x)), "validNum");
  const fd = fines.results || [], ld = loans.results || [], od = orphans.results || [];
  if ([...fd, ...ld, ...od].some((r) => !validNum(r.amount_rp) || r.paid_rp !== void 0 && !validNum(r.paid_rp))) return safeError("Nominal historis di luar rentang angka aman.", 409);
  const f = fd.slice(0, limit).map((r) => {
    const a = Number(r.amount_rp), b = Number(r.paid_rp), alasan = [];
    if (a < 0 || b < 0) alasan.push("nominal_negatif");
    if (b > a) alasan.push("kelebihan_bayar");
    if (r.status === "lunas" && b !== a) alasan.push("lunas_tidak_sesuai");
    if (r.status === "belum" && b >= a) alasan.push("status_belum_tidak_sesuai");
    return {
      id: r.id,
      tanggal: r.event_on,
      payerId: r.payer_id,
      nama: r.payer_name,
      nominalRp: a,
      terbayarRp: b,
      status: r.status,
      alasan
    };
  });
  const l = ld.slice(0, limit).map((r) => {
    const a = Number(r.amount_rp), b = Number(r.paid_rp), alasan = [];
    if (a <= 0) alasan.push("pokok_tidak_positif");
    if (b > a) alasan.push("kelebihan_angsuran");
    if (r.status === "lunas" && b !== a) alasan.push("lunas_tidak_sesuai");
    if (Number(r.invalid_count) > 0) alasan.push("angsuran_tidak_positif");
    return {
      id: r.id,
      tanggal: r.loaned_on,
      payerId: r.payer_id,
      nama: r.payer_name,
      pokokRp: a,
      angsuranAktifRp: b,
      status: r.status,
      alasan
    };
  });
  const o = od.slice(0, limit).map((r) => ({
    id: r.id,
    pinjamanId: r.loan_id,
    tanggal: r.repaid_on,
    jumlahRp: Number(r.amount_rp),
    alasan: ["induk_tidak_ditemukan"]
  }));
  return json({
    ok: true,
    readOnly: true,
    source: "cloudflare-d1",
    siapAktivasi: false,
    batasPerKategori: limit,
    terpotong: {
      denda: fd.length > limit,
      pinjaman: ld.length > limit,
      angsuranTanpaInduk: od.length > limit
    },
    denda: f,
    pinjaman: l,
    angsuranTanpaInduk: o,
    catatan: "Temuan bersifat audit; belum dibandingkan dengan jurnal kas, sumber lama, dan tutup buku."
  });
}
__name(auditDendaPinjamanExceptions, "auditDendaPinjamanExceptions");
async function auditDendaPinjamanCashCandidates(db, request) {
  const limit = auditLimit(request);
  if (!limit) return safeError("Batas daftar harus 1\u2013200.", 400);
  const params = new URL(request.url).searchParams;
  const kind = params.get("jenis") || "denda";
  if (!["denda", "angsuran_pinjaman"].includes(kind)) return safeError("Jenis audit tidak valid.", 400);
  const source = kind === "denda" ? `SELECT f.id AS source_id,f.payer_id,f.paid_on AS event_date,f.paid_rp AS amount_rp,
      f.status AS source_status FROM bookkeeping_fines f WHERE f.paid_rp>0 AND f.paid_on IS NOT NULL` : `SELECT r.id AS source_id,l.payer_id,r.repaid_on AS event_date,r.amount_rp,
      r.status AS source_status FROM bookkeeping_loan_repayments r
      JOIN bookkeeping_loans l ON l.id=r.loan_id WHERE r.status='aktif'`;
  const query = `WITH source_rows AS (${source})
    SELECT s.source_id,s.event_date,s.amount_rp,s.source_status,
      s.payer_id,COUNT(c.id) AS candidate_count,
      GROUP_CONCAT(c.id,',') AS candidate_ids
    FROM source_rows s LEFT JOIN bookkeeping_cash_transactions c
      ON c.payer_id=s.payer_id AND c.occurred_on=s.event_date
      AND c.debit_rp=s.amount_rp AND c.credit_rp=0 AND c.status='aktif'
      AND c.source_payment_id IS NULL
    GROUP BY s.source_id,s.event_date,s.amount_rp,s.source_status,s.payer_id
    ORDER BY s.event_date DESC,s.source_id DESC LIMIT ?`;
  const result = await db.prepare(query).bind(limit + 1).all();
  const rows = result.results || [];
  const data = rows.slice(0, limit).map((r) => ({
    id: r.source_id,
    payerId: r.payer_id,
    tanggal: r.event_date,
    nominalRp: Number(r.amount_rp),
    statusSumber: r.source_status,
    kandidatJurnal: Number(r.candidate_count),
    jurnalId: r.candidate_ids ? String(r.candidate_ids).split(",") : [],
    kesimpulan: Number(r.candidate_count) === 0 ? "tidak_ada_kandidat" : Number(r.candidate_count) === 1 ? "satu_kandidat_belum_terverifikasi" : "ambigu_banyak_kandidat"
  }));
  if (data.some((r) => !Number.isSafeInteger(r.nominalRp) || r.nominalRp <= 0))
    return safeError("Nilai historis tidak valid.", 409);
  return json({
    ok: true,
    readOnly: true,
    source: "cloudflare-d1",
    jenis: kind,
    siapAktivasi: false,
    terpotong: rows.length > limit,
    data,
    catatan: "Kandidat berdasarkan ID warga, tanggal dan nominal sama. Ini BUKAN bukti posting: verifikasi jurnal asli, transaksi impor, transaksi agregat, dan tutup buku tetap wajib. Tidak ada perubahan data."
  });
}
__name(auditDendaPinjamanCashCandidates, "auditDendaPinjamanCashCandidates");
async function auditDendaPinjamanReadiness(db) {
  const [fine, loan, repayment] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN amount_rp<0 OR paid_rp<0 OR paid_rp>amount_rp
        OR (status='lunas' AND paid_rp<>amount_rp)
        OR (status='belum' AND paid_rp>=amount_rp) THEN 1 ELSE 0 END),0) AS conflicts,
      COALESCE(SUM(CASE WHEN paid_rp>0 THEN 1 ELSE 0 END),0) AS paid_without_detail
      FROM bookkeeping_fines`).first(),
    db.prepare(`SELECT COUNT(*) AS total,COALESCE(SUM(CASE WHEN l.amount_rp<=0 OR
      COALESCE(r.paid,0)>l.amount_rp OR (l.status='lunas' AND COALESCE(r.paid,0)<>l.amount_rp)
      THEN 1 ELSE 0 END),0) AS conflicts FROM bookkeeping_loans l
      LEFT JOIN (SELECT loan_id,SUM(amount_rp) AS paid FROM bookkeeping_loan_repayments
        WHERE status='aktif' GROUP BY loan_id) r ON r.loan_id=l.id`).first(),
    db.prepare(`SELECT COUNT(*) AS orphan_count FROM bookkeeping_loan_repayments r
      LEFT JOIN bookkeeping_loans l ON l.id=r.loan_id WHERE l.id IS NULL`).first()
  ]);
  const n = /* @__PURE__ */ __name((x) => Number(x || 0), "n");
  return json({
    ok: true,
    readOnly: true,
    source: "cloudflare-d1",
    denda: {
      jumlah: n(fine?.total),
      perluRekonsiliasi: n(fine?.conflicts),
      pembayaranTanpaRincianTerpisah: n(fine?.paid_without_detail)
    },
    pinjaman: {
      jumlah: n(loan?.total),
      perluRekonsiliasi: n(loan?.conflicts),
      angsuranTanpaInduk: n(repayment?.orphan_count)
    },
    siapAktivasi: false,
    alasan: "Audit agregat tidak membuktikan kesesuaian jurnal kas, tutup buku, dan data sumber. Penulisan Denda dan Pinjaman belum diimplementasikan."
  });
}
__name(auditDendaPinjamanReadiness, "auditDendaPinjamanReadiness");
function validRp(x) {
  return Number.isSafeInteger(x) && x > 0 && x <= 1e9;
}
__name(validRp, "validRp");
function validDate2(x) {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const d = /* @__PURE__ */ new Date(x + "T00:00:00Z");
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === x;
}
__name(validDate2, "validDate");
function dueAfter14Days(x) {
  const d = /* @__PURE__ */ new Date(x + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 14);
  return d.toISOString().slice(0, 10);
}
__name(dueAfter14Days, "dueAfter14Days");
function validRequestKey(x) {
  return typeof x === "string" && /^[A-Za-z0-9_-]{16,100}$/.test(x);
}
__name(validRequestKey, "validRequestKey");
async function talanganReplay(db, key, kind, hash) {
  const old = await db.prepare("SELECT operation,payload_hash,result_id,cash_transaction_id FROM bookkeeping_advance_request_ledger WHERE request_key=?").bind(key).first();
  if (!old) return null;
  if (old.operation !== kind || old.payload_hash !== hash) return safeError("requestKey sudah digunakan untuk data berbeda.", 409);
  return json({ ok: true, id: old.result_id, kasId: old.cash_transaction_id || null, duplikat: true });
}
__name(talanganReplay, "talanganReplay");
async function talanganHash(kind, p) {
  return tokenHash(JSON.stringify(kind === "advance-create" ? { kind, tanggal: p.tanggal, payerId: p.payerId || null, ditanggungOleh: p.ditanggungOleh.trim(), keterangan: p.keterangan.trim(), jumlahRp: p.jumlahRp } : { kind, advanceId: p.advanceId, tanggal: p.tanggal, jumlahRp: p.jumlahRp, catatan: p.catatan.trim() }));
}
__name(talanganHash, "talanganHash");
async function newAdvanceD1(request, env) {
  if (env.FINANCE_WRITE_ENABLED !== "true" || env.TALANGAN_WRITE_ENABLED !== "true") return safeError("Penulisan Talangan D1 belum diaktifkan.", 503);
  let p;
  try {
    p = await request.json();
  } catch {
    return safeError("JSON tidak valid.", 400);
  }
  const { requestKey, tanggal, payerId, ditanggungOleh, keterangan, jumlahRp } = p || {};
  if (!validRequestKey(requestKey) || !validDate2(tanggal) || !validRp(jumlahRp) || typeof ditanggungOleh !== "string" || !ditanggungOleh.trim() || ditanggungOleh.length > 150 || typeof keterangan !== "string" || keterangan.length > 500 || payerId !== null && payerId !== void 0 && (typeof payerId !== "string" || payerId.length > 100))
    return safeError("Data talangan tidak valid.", 400);
  if (tanggal > new Date(Date.now()+7*60*60*1000).toISOString().slice(0,10)) return safeError("Tanggal talangan tidak boleh di masa depan.", 400);
  if (payerId) {
    const exists = await env.DB.prepare("SELECT id FROM bookkeeping_payers WHERE id=? AND active=1").bind(payerId).first();
    if (!exists) return safeError("Pembayar tidak aktif atau tidak ditemukan.", 400);
  }
  const hash = await talanganHash("advance-create", p);
  const replay = await talanganReplay(env.DB, requestKey, "advance-create", hash);
  if (replay) return replay;
  const id = "adv_" + crypto.randomUUID();
  try {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO bookkeeping_advance_request_ledger(request_key,operation,payload_hash,result_id) VALUES(?,?,?,?)`).bind(requestKey, "advance-create", hash, id),
      env.DB.prepare(`INSERT INTO bookkeeping_advances
       (id,advanced_on,payer_id,advanced_by,description,amount_rp,reimbursed_rp,status,request_key,due_on)
       VALUES(?,?,?,?,?,?,0,'aktif',?,?)`).bind(id, tanggal, payerId || null, ditanggungOleh.trim(), keterangan.trim(), jumlahRp, requestKey, dueAfter14Days(tanggal))
    ]);
  } catch (_) {
    const winner = await talanganReplay(env.DB, requestKey, "advance-create", hash);
    if (winner) return winner;
    return safeError("Talangan tidak tersimpan. Periksa validasi dan migrasi skema.", 409);
  }
  return json({ ok: true, id, jatuhTempo: dueAfter14Days(tanggal), catatan: "Pembuatan talangan belum mengurangi kas. Pengeluaran kas dicatat saat pelunasan." }, 201);
}
__name(newAdvanceD1, "newAdvanceD1");
async function repayAdvanceD1(request, env) {
  if (env.FINANCE_WRITE_ENABLED !== "true" || env.TALANGAN_WRITE_ENABLED !== "true") return safeError("Penulisan Talangan D1 belum diaktifkan.", 503);
  let p;
  try {
    p = await request.json();
  } catch {
    return safeError("JSON tidak valid.", 400);
  }
  const { requestKey, advanceId, tanggal, jumlahRp, catatan } = p || {};
  if (!validRequestKey(requestKey) || typeof advanceId !== "string" || !/^[A-Za-z0-9_-]{1,150}$/.test(advanceId) || !validDate2(tanggal) || !validRp(jumlahRp) || typeof catatan !== "string" || catatan.length > 500)
    return safeError("Data pelunasan tidak valid.", 400);
  if (tanggal > new Date(Date.now()+7*60*60*1000).toISOString().slice(0,10)) return safeError("Tanggal pelunasan tidak boleh di masa depan.", 400);
  const hash = await talanganHash("advance-repay", p);
  const replay = await talanganReplay(env.DB, requestKey, "advance-repay", hash);
  if (replay) return replay;
  const a = await env.DB.prepare(`SELECT id,advanced_on,amount_rp,reimbursed_rp,status,payer_id,
    (SELECT COALESCE(SUM(amount_rp),0) FROM bookkeeping_advance_repayments WHERE advance_id=? AND status='aktif') AS total
    FROM bookkeeping_advances WHERE id=?`).bind(advanceId, advanceId).first();
  if (!a || a.status !== "aktif") return safeError("Talangan tidak tersedia/aktif.", 404);
  if (tanggal < a.advanced_on) return safeError("Tanggal pelunasan mendahului talangan.", 400);
  if (a.reimbursed_rp !== a.total) return safeError("Data historis perlu rekonsiliasi sebelum pelunasan.", 409);
  if (jumlahRp > a.amount_rp - a.reimbursed_rp) return safeError("Pelunasan melebihi sisa talangan.", 409);
  const repayId = "ar_" + crypto.randomUUID(), cashId = "ac_" + crypto.randomUUID();
  try {
    // The real D1 schema has an immediate FK from advance_repayments.cash_transaction_id
    // to cash.id. Insert the cash journal BEFORE the repayment in the same atomic batch.
    await env.DB.batch([
      env.DB.prepare("INSERT INTO bookkeeping_advance_request_ledger(request_key,operation,payload_hash,result_id,cash_transaction_id) VALUES(?,?,?,?,?)").bind(requestKey, "advance-repay", hash, repayId, cashId),
      env.DB.prepare(`INSERT INTO bookkeeping_cash_transactions
        (id,occurred_on,payer_id,transaction_type,category,debit_rp,credit_rp,status,note,payment_method)
        VALUES(?,?,?,'pelunasan_talangan','Pelunasan Talangan',0,?,'aktif',?,'Cash')`).bind(cashId, tanggal, a.payer_id || null, jumlahRp, "Pelunasan talangan " + advanceId + " " + catatan.trim()),
      env.DB.prepare(`INSERT INTO bookkeeping_advance_repayments
        (id,advance_id,repaid_on,amount_rp,status,note,request_key,cash_transaction_id)
        VALUES(?,?,?,?,'aktif',?,?,?)`).bind(repayId, advanceId, tanggal, jumlahRp, catatan.trim(), requestKey, cashId)
    ]);
  } catch (_) {
    const winner = await talanganReplay(env.DB, requestKey, "advance-repay", hash);
    if (winner) return winner;
    return safeError("Pelunasan ditolak; periksa sisa dan migrasi skema.", 409);
  }
  return json({ ok: true, id: repayId, kasId: cashId, catatan: "Pelunasan dan pengeluaran kas dicatat secara atomik." }, 201);
}
__name(repayAdvanceD1, "repayAdvanceD1");
async function dpPayloadHash(kind, a) {
  const canonical = JSON.stringify({
    kind,
    tanggal: a.tanggal,
    jumlahRp: a.jumlahRp,
    payerId: kind === "fine-create" || kind === "loan-create" ? a.payerId : null,
    referenceId: kind === "fine-pay" || kind === "loan-pay" ? a.referenceId : null,
    catatan: a.catatan.trim(),
    // Maintain hashes for existing Cash keys: only non-Cash adds a discriminator.
    ...(kind !== "fine-create" && a.metode !== "Cash" ? { metode: a.metode } : {})
  });
  return tokenHash(canonical);
}
__name(dpPayloadHash, "dpPayloadHash");
async function writeDendaPinjaman(request, env, kind, who) {
  if (env.FINANCE_WRITE_ENABLED !== "true" || env.DENDA_PINJAMAN_WRITE_ENABLED !== "true")
    return safeError("Transaksi Denda/Pinjaman D1 belum diaktifkan.", 503);
  let a;
  try {
    a = await requestJson(request);
  } catch {
    return safeError("JSON tidak valid.", 400);
  }
  const key = a?.requestKey, date = a?.tanggal, amount = a?.jumlahRp, reference = a?.referenceId;
  const method = a?.metode === undefined ? "Cash" : a.metode;
  if (kind !== "fine-create" && !["Cash", "QRIS", "Transfer Mandiri"].includes(method))
    return safeError("Metode pembayaran tidak valid.", 400);
  if (kind === "fine-create" && a.metode !== undefined)
    return safeError("Denda baru belum menerima pembayaran; metode tidak boleh diisi.", 400);
  if (kind !== "fine-create") a.metode = method;
  if (!validRequestKey(key) || !validDate2(date) || !validRp(amount) || date > new Date(Date.now()+7*60*60*1000).toISOString().slice(0,10))
    return safeError("Tanggal, nominal, atau kunci permintaan tidak valid.", 400);
  const closedYear = await env.DB.prepare("SELECT fiscal_year FROM bookkeeping_year_archives WHERE fiscal_year=? AND status IN ('ditutup','terkunci','final') LIMIT 1").bind(Number(date.slice(0, 4))).first();
  if (closedYear) return safeError("Tahun pembukuan sudah ditutup; transaksi ditolak.", 409);
  if (typeof a.catatan !== "string" || a.catatan.length > 500) return safeError("Catatan tidak valid.", 400);
  const payerId = a.payerId;
  const payloadHash = await dpPayloadHash(kind, a);
  const prior = await env.DB.prepare("SELECT operation,payload_hash,result_id,cash_transaction_id FROM bookkeeping_dp_request_ledger WHERE request_key=?").bind(key).first();
  if (prior) {
    if (prior.operation !== kind || prior.payload_hash !== payloadHash) return safeError("requestKey sudah digunakan untuk transaksi berbeda.", 409);
    return json({ ok: true, id: prior.result_id, kasId: prior.cash_transaction_id || null, mode: "staging", replayed: true }, 200);
  }
  if (kind === "fine-create" || kind === "loan-create") {
    if (typeof payerId !== "string" || payerId.length > 100 || !payerId) return safeError("Pembayar wajib dipilih.", 400);
    const active = await env.DB.prepare("SELECT id FROM bookkeeping_payers WHERE id=? AND active=1").bind(payerId).first();
    if (!active) return safeError("Pembayar tidak ditemukan/aktif.", 400);
  }
  const id = crypto.randomUUID(), cashId = "dp_cash_" + crypto.randomUUID();
  const note = a.catatan.trim();
  let q = [];
  if (kind === "fine-create") {
    q = [env.DB.prepare(`INSERT INTO bookkeeping_fines(id,payer_id,event_on,fine_type,amount_rp,paid_rp,status,note,request_key)
      VALUES(?,?,?,'gorol',?,0,'belum',?,?)`).bind("fine_" + id, payerId, date, amount, note, key)];
  } else if (kind === "loan-create") {
    q = [
      env.DB.prepare(`INSERT INTO bookkeeping_loans(id,payer_id,loaned_on,amount_rp,status,note,request_key)
      VALUES(?,?,?,?,'aktif',?,?)`).bind("loan_" + id, payerId, date, amount, note, key),
      env.DB.prepare(`INSERT INTO bookkeeping_cash_transactions(id,occurred_on,payer_id,transaction_type,category,debit_rp,credit_rp,status,note,payment_method)
      VALUES(?,?,?,'pinjaman_keluar','Pinjaman',0,?,'aktif',?,?)`).bind(cashId, date, payerId, amount, "Pencairan pinjaman loan_" + id + " " + note, method),
      env.DB.prepare("INSERT INTO bookkeeping_dp_cash_links(request_key,source_type,source_id,cash_transaction_id) VALUES(?,?,?,?)").bind(key, "loan-create", "loan_" + id, cashId)
    ];
  } else if (kind === "fine-pay" || kind === "loan-pay") {
    if (typeof reference !== "string" || !/^[A-Za-z0-9_-]{1,150}$/.test(reference)) return safeError("Referensi transaksi tidak valid.", 400);
    const target = kind === "fine-pay" ? await env.DB.prepare("SELECT id,payer_id,event_on,amount_rp,paid_rp,status FROM bookkeeping_fines WHERE id=?").bind(reference).first() : await env.DB.prepare("SELECT id,payer_id,loaned_on,amount_rp,status FROM bookkeeping_loans WHERE id=?").bind(reference).first();
    if (!target) return safeError("Transaksi induk tidak ditemukan.", 404);
    if (date < (kind === "fine-pay" ? target.event_on : target.loaned_on)) return safeError("Tanggal mendahului transaksi induk.", 400);
    if (kind === "fine-pay") {
      if (target.status === "dibatalkan" || target.paid_rp > target.amount_rp) return safeError("Data denda perlu rekonsiliasi.", 409);
      q = [env.DB.prepare(`INSERT INTO bookkeeping_fine_payments(id,fine_id,paid_on,amount_rp,status,note,request_key,cash_transaction_id)
        VALUES(?,?,?,?,'aktif',?,?,?)`).bind("fp_" + id, reference, date, amount, note, key, cashId)];
    } else {
      if (target.status !== "aktif") return safeError("Pinjaman tidak aktif.", 409);
      q = [env.DB.prepare(`INSERT INTO bookkeeping_loan_repayments(id,loan_id,repaid_on,amount_rp,status,note,request_key,cash_transaction_id)
        VALUES(?,?,?,?,'aktif',?,?,?)`).bind("lr_" + id, reference, date, amount, note, key, cashId)];
    }
    q.push(env.DB.prepare(`INSERT INTO bookkeeping_cash_transactions(id,occurred_on,payer_id,transaction_type,category,debit_rp,credit_rp,status,note,payment_method)
       VALUES(?,?,?,? ,?, ?,0,'aktif',?,?)`).bind(cashId, date, target.payer_id, kind === "fine-pay" ? "denda_menunggu_buku" : "angsuran_pinjaman", kind === "fine-pay" ? "Denda Gorol" : "Angsuran Pinjaman", amount, note, method));
    // The real D1 schema has an immediate FK from loan_repayments.cash_transaction_id to cash.id.
    // Insert cash first inside the same atomic batch, otherwise valid loan instalments fail HTTP 409.
    if (kind === "loan-pay") q = [q[1], q[0]];
    q.push(env.DB.prepare("INSERT INTO bookkeeping_dp_cash_links(request_key,source_type,source_id,cash_transaction_id) VALUES(?,?,?,?)").bind(key, kind, kind === "fine-pay" ? "fp_" + id : "lr_" + id, cashId));
  } else return safeError("Operasi tidak tersedia.", 404);
  const resultId = kind === "fine-create" ? "fine_" + id : kind === "loan-create" ? "loan_" + id : kind === "fine-pay" ? "fp_" + id : "lr_" + id;
  q.unshift(env.DB.prepare(`INSERT INTO bookkeeping_dp_request_ledger(request_key,operation,payload_hash,result_id,cash_transaction_id)
    VALUES(?,?,?,?,?)`).bind(key, kind, payloadHash, resultId, kind === "fine-create" ? null : cashId));
  q.push(env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason) VALUES(?,?,?,?,?,?,?)").bind(crypto.randomUUID(), who.id, "pembukuan", kind, kind.startsWith("fine") ? "denda" : "pinjaman", reference || (kind === "fine-create" ? "fine_" : "loan_") + id, note || "Transaksi staging"));
  try {
    await env.DB.batch(q);
  } catch {
    const winner = await env.DB.prepare("SELECT operation,payload_hash,result_id,cash_transaction_id FROM bookkeeping_dp_request_ledger WHERE request_key=?").bind(key).first();
    if (winner) {
      if (winner.operation !== kind || winner.payload_hash !== payloadHash) return safeError("requestKey sudah digunakan untuk transaksi berbeda.", 409);
      return json({ ok: true, id: winner.result_id, kasId: winner.cash_transaction_id || null, mode: "staging", replayed: true }, 200);
    }
    return safeError("Transaksi ditolak: batas saldo, tahun tertutup, atau skema staging belum siap.", 409);
  }
  return json({ ok: true, id: resultId, kasId: kind === "fine-create" ? null : cashId, mode: "staging", replayed: false }, 201);
}
__name(writeDendaPinjaman, "writeDendaPinjaman");
var F4_RATE_MAP = { IURAN_BULANAN: "TARIF_BULANAN", KEBERSIHAN: "TARIF_KEBERSIHAN", KAS_LORONG: "TARIF_KAS_LORONG", ARISAN: "TARIF_ARISAN" };
async function getIuranTariffs(db) {
  const out = await db.prepare("SELECT contribution_type,amount_rp FROM bookkeeping_contribution_tariffs WHERE active=1").all();
  const rows = out.results || [], result = {};
  for (const r of rows) {
    if (!Object.hasOwn(F4_RATE_MAP, r.contribution_type) || !Number.isSafeInteger(r.amount_rp) || r.amount_rp < 0) continue;
    result[F4_RATE_MAP[r.contribution_type]] = r.amount_rp;
  }
  if (Object.keys(result).length !== 4) throw Error("Tarif D1 belum lengkap: perlu empat tarif resmi sebelum pembayaran diaktifkan.");
  return result;
}
__name(getIuranTariffs, "getIuranTariffs");
// Historical, period-effective obligations. Past months resolve to their
// original version, never to the current editing form values.
function f4IuranMonth(year, month) {
  return String(year).padStart(4,"0")+"-"+String(month).padStart(2,"0")+"-01";
}
function f4CurrentIuranMonth() {
  return new Date(Date.now()+7*3600*1000).toISOString().slice(0,7)+"-01";
}
function f4NextIuranMonth() {
  const current=f4CurrentIuranMonth();
  const dt=new Date(current+"T00:00:00Z");
  dt.setUTCMonth(dt.getUTCMonth()+1);
  return dt.toISOString().slice(0,10);
}
async function f4PeriodObligation(db,payerId,year,month) {
  return db.prepare("SELECT qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan,effective_from FROM bookkeeping_payer_obligation_periods WHERE payer_id=? AND effective_from<=? ORDER BY effective_from DESC LIMIT 1")
    .bind(payerId,f4IuranMonth(year,month)).first();
}
function f4IuranAmounts(obligation,tariff) {
  return {
    IURAN_BULANAN:Number(obligation.qty_iuran_bulanan)*tariff.TARIF_BULANAN,
    KEBERSIHAN:Number(obligation.qty_kebersihan)*tariff.TARIF_KEBERSIHAN,
    KAS_LORONG:Number(obligation.qty_kas_lorong)*tariff.TARIF_KAS_LORONG,
    ARISAN:Number(obligation.qty_arisan)*tariff.TARIF_ARISAN
  };
}

async function getIuranOutstanding(db, request) {
  const q = new URL(request.url).searchParams;
  const payerId = q.get("payerId") || "";
  const year = Number(q.get("year")), month = Number(q.get("month"));
  if (!payerId || payerId.length > 150 || !Number.isInteger(year) || year < 2e3 || year > 2200 || !Number.isInteger(month) || month < 1 || month > 12)
    return safeError("Pembayar, tahun, atau bulan tidak valid.", 400);
  const payer = await db.prepare("SELECT id,display_name,active FROM bookkeeping_payers WHERE id=?").bind(payerId).first();
  if (!payer) return safeError("Pembayar tidak ditemukan.", 404);
  // Historical outstanding remains readable even after a resident is inactive.
  const obligation = await f4PeriodObligation(db,payerId,year,month);
  if (!obligation) return safeError("Belum ada kewajiban untuk pembayar pada periode ini.",404);
  let tariff;
  try {
    tariff = await getIuranTariffs(db);
  } catch {
    return safeError("Tarif D1 belum dikonfigurasi.", 503);
  }
  const nominal=f4IuranAmounts(obligation,tariff);
  const paid = await db.prepare(`SELECT a.contribution_type AS jenis,COALESCE(SUM(a.amount_rp),0) AS jumlah
    FROM bookkeeping_payment_allocations a JOIN bookkeeping_payments p ON p.id=a.payment_id
    WHERE a.payer_id=? AND a.period_year=? AND a.period_month=?
      AND a.status='aktif' AND p.status='aktif'
    GROUP BY a.contribution_type`).bind(payerId, year, month).all();
  const totals = Object.fromEntries((paid.results || []).map((r) => [r.jenis, Number(r.jumlah)]));
  const components = Object.entries(nominal).map(([jenis, wajibRp]) => {
    const terbayarRp = totals[jenis] || 0;
    return { jenis, wajibRp, terbayarRp, sisaRp: Math.max(0, wajibRp - terbayarRp), kelebihanRp: Math.max(0, terbayarRp - wajibRp) };
  });
  return json({
    ok: true,
    payerId,
    nama: payer.display_name,
    tahun: year,
    bulan: month,
    komponen: components,
    totalSisaRp: components.reduce((s, c) => s + c.sisaRp, 0),
    catatan: "Sisa kewajiban dihitung dari alokasi aktif. Belum otomatis menjadi talangan."
  });
}
__name(getIuranOutstanding, "getIuranOutstanding");

function f4PeriodIndex(year,month){return Number(year)*12+Number(month)-1;}
function f4IndexPeriod(index){return {year:Math.floor(index/12),month:index%12+1};}
function f4SuggestIuranPeriod({current,versions,allocations,tariff,globalStartIndex}){
  // The 2000 migration baseline is not an actual start of billing.
  const today=f4PeriodIndex(current.year,current.month),oldest=today-47;
  const relevant=allocations.filter(x=>Number.isInteger(x.period_year)&&Number.isInteger(x.period_month)
    &&x.period_month>=1&&x.period_month<=12&&f4PeriodIndex(x.period_year,x.period_month)>=oldest);
  const indexes=relevant.map(x=>f4PeriodIndex(x.period_year,x.period_month));
  const versionsAsc=[...versions].sort((a,b)=>String(a.effective_from).localeCompare(String(b.effective_from)));
  const first=versionsAsc[0]?.effective_from;
  const firstIndex=first?f4PeriodIndex(Number(first.slice(0,4)),Number(first.slice(5,7))):today;
  // Start of the program comes from the first active recorded iuran
  // allocation anywhere, not from a fictitious year-2000 migration baseline.
  // This detects a missing September even when a payer only paid October.
  const knownStart=Number.isInteger(globalStartIndex)?globalStartIndex:today;
  const start=Math.max(oldest,firstIndex,Math.min(today,knownStart,...indexes));
  const stop=Math.max(today+1,indexes.length?Math.max(...indexes)+1:today+1,firstIndex);
  const paid=new Map();
  for(const item of relevant){
    const key=f4PeriodIndex(item.period_year,item.period_month)+':'+String(item.contribution_type);
    paid.set(key,(paid.get(key)||0)+Number(item.amount_rp||0));
  }
  let lastLunas=null,previousPaid=false;
  for(let index=start;index<=stop&&index<start+62;index++){
    const date=f4IndexPeriod(index),period=f4IuranMonth(date.year,date.month);
    const version=versionsAsc.filter(x=>String(x.effective_from)<=period).at(-1);
    if(!version)continue;
    const entries=Object.entries(f4IuranAmounts(version,tariff));
    if(!entries.some(([,due])=>due>0))continue;
    const paidHere=entries.reduce((sum,[kind])=>sum+(paid.get(index+':'+kind)||0),0);
    const remainingRp=entries.reduce((sum,[kind,due])=>sum+Math.max(0,due-(paid.get(index+':'+kind)||0)),0);
    if(remainingRp>0)return {...date,period,remainingRp,previousPaid,lastLunas,
      reason:paidHere>0?'sebagian':index<today?'tunggakan':index>today?'berikutnya':'bulan_ini'};
    if(paidHere>0){previousPaid=true;lastLunas=period;}
  }
  return {period:null,reason:'tanpa_kewajiban'};
}
async function getIuranSuggestedPeriod(db,request){
  const payerId=new URL(request.url).searchParams.get('payerId')||'';
  if(!payerId||payerId.length>150)return safeError('Pembayar tidak valid.',400);
  const payer=await db.prepare('SELECT id,active FROM bookkeeping_payers WHERE id=?').bind(payerId).first();
  if(!payer||Number(payer.active)!==1)return safeError('Pembayar tidak ditemukan atau tidak aktif.',404);
  const now=f4CurrentIuranMonth(),current={year:Number(now.slice(0,4)),month:Number(now.slice(5,7))};
  const [history,versions,tariff,firstActivity]=await Promise.all([
    db.prepare(`SELECT a.period_year,a.period_month,a.contribution_type,COALESCE(SUM(a.amount_rp),0) AS amount_rp
      FROM bookkeeping_payment_allocations a JOIN bookkeeping_payments p ON p.id=a.payment_id
      WHERE a.payer_id=? AND a.status='aktif' AND p.status='aktif'
        AND a.period_year BETWEEN ? AND ?
      GROUP BY a.period_year,a.period_month,a.contribution_type`)
      .bind(payerId,current.year-4,current.year+5).all(),
    db.prepare(`SELECT effective_from,qty_iuran_bulanan,qty_kebersihan,qty_kas_lorong,qty_arisan
      FROM bookkeeping_payer_obligation_periods WHERE payer_id=? ORDER BY effective_from`).bind(payerId).all(),
    getIuranTariffs(db),
    db.prepare(`SELECT MIN(a.period_year*12+a.period_month-1) AS first_month
      FROM bookkeeping_payment_allocations a JOIN bookkeeping_payments p ON p.id=a.payment_id
      WHERE a.status='aktif' AND p.status='aktif'
      AND a.period_year BETWEEN ? AND ?
      AND (a.period_year*12+a.period_month-1)<=?`)
      .bind(current.year-2,current.year,f4PeriodIndex(current.year,current.month)).first()
  ]);
  const entries=versions.results||[];
  if(!entries.length)return safeError('Belum ada kewajiban pembayar.',404);
  const selection=f4SuggestIuranPeriod({current,versions:entries,
    allocations:(history.results||[]).map(x=>({...x,period_year:Number(x.period_year),period_month:Number(x.period_month)})),
    globalStartIndex:firstActivity?.first_month==null?null:Number(firstActivity.first_month),tariff});
  return json({ok:true,source:'cloudflare-d1',payerId,...selection});
}
__name(getIuranSuggestedPeriod,"getIuranSuggestedPeriod");
async function createIuranPayment(request, env, who) {
  if (env.FINANCE_WRITE_ENABLED !== "true" || env.IURAN_WRITE_ENABLED !== "true") return safeError("Pencatatan iuran D1 belum diaktifkan.", 503);
  let d;
  try {
    d = await requestJson(request);
  } catch {
    return safeError("Format pembayaran tidak valid.", 400);
  }
  const key = String(d.requestKey || ""), payerId = String(d.payerId || ""), date = String(d.tanggal || ""), method = String(d.metode || ""), note = String(d.catatan || "").trim();
  const sum = Number(d.jumlahRp), items = d.alokasi;
  const settleAdvanceId = String(d.settleAdvanceId||"");
  if(settleAdvanceId&&!/^adv_[a-f0-9-]{36}$/i.test(settleAdvanceId))return safeError("Referensi Talangan tidak valid.",400);
  if (!/^[a-f0-9-]{36}$/i.test(key) || payerId.length < 1 || payerId.length > 150 || !validDateOnly(date) || !validRupiah(sum) || !["Cash", "QRIS", "Transfer Mandiri"].includes(method) || note.length > 500 || !Array.isArray(items) || items.length < 1 || items.length > 60) return safeError("Data pembayaran tidak valid.", 400);
  const allowed = ["IURAN_BULANAN", "KEBERSIHAN", "KAS_LORONG", "ARISAN"];
  const types = /* @__PURE__ */ new Set(), periods = /* @__PURE__ */ new Set();
  let total = 0;
  for (const a of items) {
    if (!a || !Number.isInteger(a.tahun) || a.tahun < 2e3 || a.tahun > 2200 || !Number.isInteger(a.bulan) || a.bulan < 1 || a.bulan > 12 || !allowed.includes(a.jenis) || !Number.isSafeInteger(a.nominal) || a.nominal < 0) return safeError("Rincian alokasi iuran tidak valid.", 400);
    const k = a.tahun + ":" + a.bulan + ":" + a.jenis;
    if (types.has(k)) return safeError("Rincian bulan dan komponen ganda.", 400);
    types.add(k);
    periods.add(a.tahun + ":" + a.bulan);
    total += a.nominal;
    if (!Number.isSafeInteger(total)) return safeError("Jumlah terlalu besar.", 400);
  }
  if (total !== sum) return safeError("Total alokasi tidak sama dengan uang diterima.", 400);
  const iuranHash = await tokenHash(JSON.stringify({ payerId, date, method, note, sum, ...(settleAdvanceId?{settleAdvanceId}:{}), alokasi: items.map((a) => ({ tahun: a.tahun, bulan: a.bulan, jenis: a.jenis, nominal: a.nominal })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) }));
  const old = await env.DB.prepare("SELECT payment_id,payload_hash FROM bookkeeping_payment_request_keys WHERE request_key=?").bind(key).first();
  if (old) {
    if (!old.payload_hash || old.payload_hash !== iuranHash) return safeError("requestKey iuran sudah digunakan atau berasal dari data lama tanpa fingerprint.", 409);
    const existing = await env.DB.prepare("SELECT status FROM bookkeeping_payments WHERE id=?").bind(old.payment_id).first();
    if (existing?.status !== "aktif") return safeError("RequestKey sudah dibatalkan. Buat pembayaran baru sesudah pemeriksaan.", 409);
    return json({ ok: true, idPembayaran: old.payment_id, duplikat: true });
  }
  // Explicit Talangan reference is verified server-side; never silently settle
  // an unrelated advance, never allow >1 active advance in one payment.
  const activeAdvances=await env.DB.prepare(`SELECT a.id,a.advanced_on,a.description,a.amount_rp,a.reimbursed_rp,
   (SELECT COALESCE(SUM(r.amount_rp),0) FROM bookkeeping_advance_repayments r
     WHERE r.advance_id=a.id AND r.status='aktif') AS repaid
   FROM bookkeeping_advances a WHERE a.payer_id=? AND a.status='aktif'
     AND a.amount_rp>COALESCE(a.reimbursed_rp,0) LIMIT 3`).bind(payerId).all();
  const advancing=activeAdvances.results||[];
  if(advancing.length>1)return safeError("Terdapat lebih dari satu Talangan aktif. Periksa rekonsiliasi dahulu.",409);
  if(advancing.length&&!settleAdvanceId)return safeError("Talangan aktif: pembayaran Iuran harus menyertakan referensi Talangan yang cocok.",409);
  if(!advancing.length&&settleAdvanceId)return safeError("Referensi Talangan sudah dilunasi atau tidak aktif.",409);
  const activeAdvance=advancing[0]||null;
  if(activeAdvance&&(activeAdvance.id!==settleAdvanceId||
      Number(activeAdvance.reimbursed_rp)!==Number(activeAdvance.repaid)||
      !/^\[Periode (20\d\d)-(0[1-9]|1[0-2])\]/.test(String(activeAdvance.description||""))||
      date<activeAdvance.advanced_on))
    return safeError("Talangan belum dapat dipasangkan otomatis: identitas, periode, tanggal atau jurnal tidak cocok.",409);

  try {
    await getIuranTariffs(env.DB);
  } catch {
    return safeError("Tarif iuran D1 belum dikonfigurasi dengan lengkap.", 503);
  }
  const tariff = await getIuranTariffs(env.DB);
  const requiredByPeriod=new Map();
  for(const period of periods){
    const [yr,mo]=period.split(":").map(Number);
    const version=await f4PeriodObligation(env.DB,payerId,yr,mo);
    if(!version)return safeError("Pembayar belum memiliki kewajiban pada "+mo+"/"+yr+".",409);
    const amounts=f4IuranAmounts(version,tariff);
    if(Object.values(amounts).some(v=>!Number.isSafeInteger(v)||v<0))
      return safeError("Kewajiban periode "+mo+"/"+yr+" tidak valid.",503);
    requiredByPeriod.set(period,amounts);
  }
  const submitted = new Map(items.map((a) => [a.tahun + ":" + a.bulan + ":" + a.jenis, a.nominal]));
  const years = [...new Set(items.map((a) => a.tahun))];
  const paidRows = await env.DB.prepare(`SELECT a.period_year,a.period_month,a.contribution_type,
       COALESCE(SUM(a.amount_rp),0) AS paid_rp
    FROM bookkeeping_payment_allocations a
    JOIN bookkeeping_payments p ON p.id=a.payment_id
    WHERE a.payer_id=? AND a.status='aktif' AND p.status='aktif'
      AND a.period_year IN (${years.map(() => "?").join(",")})
    GROUP BY a.period_year,a.period_month,a.contribution_type`).bind(payerId, ...years).all();
  const paidByKey = new Map((paidRows.results || []).map((r) => [
    r.period_year + ":" + r.period_month + ":" + r.contribution_type,
    Number(r.paid_rp)
  ]));
  for (const period of periods) {
    const [year, month] = period.split(":").map(Number);
    const required=requiredByPeriod.get(period);
    for (const kind of allowed) {
      const key2 = year + ":" + month + ":" + kind;
      const amount = submitted.get(key2) ?? 0;
      const prior = paidByKey.get(key2) ?? 0;
      const due = required[kind] - prior;
      if (!Number.isSafeInteger(prior) || prior < 0 || due < 0)
        return safeError("Riwayat kewajiban tidak konsisten. Periksa catatan sebelum melanjutkan.", 409);
      if (kind === "KAS_LORONG") {
        if (amount > due) return safeError("Pembayaran Kas Lorong melebihi sisa kewajiban.", 409);
      } else if (amount !== due) {
        return safeError("Komponen selain Kas Lorong harus melunasi tepat sisa kewajiban periode.", 409);
      }
    }
  }
  let talanganRepayRp=0;
  if(activeAdvance){
    const match=String(activeAdvance.description||"").match(/^\[Periode (20\d\d)-(0[1-9]|1[0-2])\]/);
    const periodYear=Number(match[1]),periodMonth=Number(match[2]);
    const forPeriod=items.filter(x=>x.tahun===periodYear&&x.bulan===periodMonth);
    const iuranCovered=forPeriod.filter(x=>["IURAN_BULANAN","KEBERSIHAN"].includes(x.jenis))
      .reduce((v,x)=>v+x.nominal,0);
    talanganRepayRp=Number(activeAdvance.amount_rp)-Number(activeAdvance.reimbursed_rp);
    const required=requiredByPeriod.get(periodYear+":"+periodMonth);
    // Only the full outstanding RT/Kebersihan portion for this exact month
    // can settle the matching advance; never use Arisan or Kas Lorong funds.
    if(!Number.isSafeInteger(talanganRepayRp)||talanganRepayRp<=0||
       iuranCovered!==talanganRepayRp||
       (required.IURAN_BULANAN+required.KEBERSIHAN)!==Number(activeAdvance.amount_rp))
      return safeError("Periode atau nilai pelunasan Talangan tidak cocok dengan Iuran/Kebersihan. Transaksi ditolak.",409);
    if(env.TALANGAN_WRITE_ENABLED!=="true")return safeError("Pelunasan Talangan belum aktif.",503);
  }
  const payer = await env.DB.prepare("SELECT id,household_id,active FROM bookkeeping_payers WHERE id=?").bind(payerId).first();
  if (!payer || payer.active !== 1) return safeError("Pembayar tidak aktif atau tidak ditemukan.", 404);
  const periodYears = [.../* @__PURE__ */ new Set([Number(date.slice(0, 4)), ...items.map((x) => x.tahun)])];
  const locks = await env.DB.prepare(`SELECT fiscal_year FROM bookkeeping_year_archives WHERE fiscal_year IN (${periodYears.map(() => "?").join(",")}) AND status IN ('ditutup','terkunci','final') LIMIT 1`).bind(...periodYears).first();
  if (locks) return safeError("Tahun transaksi atau periode iuran sudah ditutup.", 409);
  const id = "pay-" + crypto.randomUUID(), cashId = "cash-" + crypto.randomUUID();
  const q = [
    env.DB.prepare("INSERT INTO bookkeeping_payments(id,payer_id,household_id,paid_on,received_on,amount_rp,payment_method,description,status) VALUES(?,?,?,?,?,?,?,?,'aktif')").bind(id, payer.id, payer.household_id, date, date, sum, method, note),
    env.DB.prepare("INSERT INTO bookkeeping_payment_request_keys(request_key,payment_id,payload_hash) VALUES(?,?,?)").bind(key, id, iuranHash)
  ];
  for (const a of items) q.push(env.DB.prepare("INSERT INTO bookkeeping_payment_allocations(id,payment_id,payer_id,period_year,period_month,contribution_type,amount_rp,status) VALUES(?,?,?,?,?,?,?,'aktif')").bind("alloc-" + crypto.randomUUID(), id, payer.id, a.tahun, a.bulan, a.jenis, a.nominal));
  // Saldo Kas Warga hanya mencatat porsi KAS_LORONG. Komponen Iuran Bulanan,
  // Kebersihan, dan Arisan dicatat dalam alokasi administrasi, bukan debit Kas Warga.
  // Jangan mencatat Rp keseluruhan sebagai Kas karena akan menggandakan dana RT/Arisan.
  const kasLorongRp = items.filter((a) => a.jenis === "KAS_LORONG").reduce((total, a) => total + a.nominal, 0);
  if (kasLorongRp > 0) {
    q.push(env.DB.prepare("INSERT INTO bookkeeping_cash_transactions(id,occurred_on,payer_id,household_id,transaction_type,category,debit_rp,credit_rp,status,note,source_payment_id,payment_method) VALUES(?,?,?,?,?,'Kas Lorong',?,0,'aktif',?,?,?)").bind(cashId, date, payer.id, payer.household_id, "iuran", kasLorongRp, note, id, method));
  }
  if(activeAdvance){
    const repayId="ar_"+crypto.randomUUID(),cashRepay="ac_"+crypto.randomUUID(),repayKey="iuran_"+id;
    const noteRepay="Penggantian Talangan "+activeAdvance.id+" melalui Iuran "+id;
    const repayHash=await tokenHash(JSON.stringify({advanceId:activeAdvance.id,paymentId:id,amount:talanganRepayRp}));
    q.push(env.DB.prepare("INSERT INTO bookkeeping_advance_request_ledger(request_key,operation,payload_hash,result_id,cash_transaction_id) VALUES(?,'advance-repay',?,?,?)")
      .bind(repayKey,repayHash,repayId,cashRepay));
    q.push(env.DB.prepare("INSERT INTO bookkeeping_cash_transactions(id,occurred_on,payer_id,transaction_type,category,debit_rp,credit_rp,status,note,payment_method) VALUES(?,?,?,'pelunasan_talangan','Pelunasan Talangan',0,?,'aktif',?,?)")
      .bind(cashRepay,date,payerId,talanganRepayRp,noteRepay,method));
    q.push(env.DB.prepare("INSERT INTO bookkeeping_advance_repayments(id,advance_id,repaid_on,amount_rp,status,note,request_key,cash_transaction_id) VALUES(?,?,?,?,'aktif',?,?,?)")
      .bind(repayId,activeAdvance.id,date,talanganRepayRp,noteRepay,repayKey,cashRepay));
  }
  q.push(env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,after_json) VALUES(?,?,?,?,?,?,?)").bind(crypto.randomUUID(), who.id, "pembukuan", "create_iuran", "bookkeeping_payments", id, JSON.stringify({ tanggal: date, jumlahRp: sum, alokasi: items.length })));
  try {
    await env.DB.batch(q);
  } catch (e) {
    const existing = await env.DB.prepare("SELECT payment_id,payload_hash FROM bookkeeping_payment_request_keys WHERE request_key=?").bind(key).first();
    if (existing) {
      if (!existing.payload_hash || existing.payload_hash !== iuranHash) return safeError("requestKey iuran sudah digunakan untuk data berbeda.", 409);
      const paid = await env.DB.prepare("SELECT status FROM bookkeeping_payments WHERE id=?").bind(existing.payment_id).first();
      if (paid?.status !== "aktif") return safeError("Pembayaran sudah dibatalkan.", 409);
      return json({ ok: true, idPembayaran: existing.payment_id, duplikat: true });
    }
    return safeError("Gagal mencatat iuran secara utuh. Tidak ada transaksi parsial yang disimpan.", 409);
  }
  return json({ ok: true, idPembayaran: id, totalDiterima: sum, periode: [...periods].sort(), alokasi: items.length }, 201);
}
__name(createIuranPayment, "createIuranPayment");

function f4BatchType(x){return ['kas_lorong','denda_gorol'].includes(x)?x:null}
function f4BatchStage(x){return ['setoran_rt','arisan','susulan'].includes(x)?x:null}
async function f4BatchSources(db,type,year,month,ids){
 const params=[], placeholders=ids&&ids.length?' AND S.id IN ('+ids.map(()=>'?').join(',')+')':'';
 let sql;
 if(type==='kas_lorong'){
  sql="SELECT a.id AS id,a.amount_rp AS amount,p.id AS payment_id,p.paid_on AS date,p.payment_method AS method,"+
  " COALESCE(bp.display_name,'') AS name,COALESCE(h.house_code,'') AS house,"+
  " (SELECT COUNT(*) FROM bookkeeping_kas_batch_items bi WHERE bi.category='kas_lorong' AND bi.source_id=a.id AND bi.status='aktif') AS posted,"+
  " (SELECT COUNT(*) FROM bookkeeping_allocation_details old WHERE old.allocation_id=a.id) AS previousPosting"+
  " FROM bookkeeping_payment_allocations a JOIN bookkeeping_payments p ON p.id=a.payment_id"+
  " LEFT JOIN bookkeeping_payers bp ON bp.id=p.payer_id LEFT JOIN households h ON h.id=COALESCE(p.household_id,bp.household_id)"+
  " WHERE a.status='aktif' AND p.status='aktif' AND a.contribution_type='KAS_LORONG' AND a.period_year=? AND a.period_month=? AND a.amount_rp>0"+
  " AND p.id LIKE 'pay-%' AND NOT EXISTS (SELECT 1 FROM bookkeeping_allocation_details old WHERE old.allocation_id=a.id)"+
  (ids&&ids.length?' AND a.id IN ('+ids.map(()=>'?').join(',')+')':'')+" ORDER BY p.paid_on,a.id LIMIT 500";
  params.push(year,month,...(ids||[]));
 }else{
  sql="SELECT c.id AS id,c.debit_rp AS amount,c.occurred_on AS date,c.payment_method AS method,"+
  " COALESCE(bp.display_name,'') AS name,COALESCE(h.house_code,'') AS house,"+
  " (SELECT COUNT(*) FROM bookkeeping_kas_batch_items bi WHERE bi.category='denda_gorol' AND bi.source_id=c.id AND bi.status='aktif') AS posted"+
  " FROM bookkeeping_cash_transactions c LEFT JOIN bookkeeping_payers bp ON bp.id=c.payer_id LEFT JOIN households h ON h.id=bp.household_id"+
  " WHERE c.status='aktif' AND c.debit_rp>0 AND c.credit_rp=0 AND"+
  " c.transaction_type='denda_menunggu_buku'"+
  " AND substr(c.occurred_on,1,7)=?"+(ids&&ids.length?' AND c.id IN ('+ids.map(()=>'?').join(',')+')':'')+" ORDER BY c.occurred_on,c.id LIMIT 500";
  params.push(String(year)+'-'+String(month).padStart(2,'0'),...(ids||[]));
 }
 return (await db.prepare(sql).bind(...params).all()).results||[];
}
async function f4BatchRead(db,request){
 const q=new URL(request.url).searchParams,type=f4BatchType(q.get('category')||'kas_lorong');
 const year=Number(q.get('year')),month=Number(q.get('month'));
 if(!type||!Number.isInteger(year)||year<2020||year>2100||!Number.isInteger(month)||month<1||month>12)return safeError('Pilih jenis dan bulan yang valid.',400);
 const [data,groups]=await Promise.all([f4BatchSources(db,type,year,month),
  db.prepare("SELECT id,stage,booked_on,description,amount_rp,item_count,status FROM bookkeeping_kas_batches WHERE category=? AND period_year=? AND period_month=? ORDER BY booked_on DESC,created_at DESC LIMIT 120").bind(type,year,month).all()]);
 if(data.length>=500)return safeError('Batas 500 pembayaran tercapai, pisahkan bulan atau audit data.',409);
 // Riwayat bulk CSV sudah dibukukan dan dikunci sejak migrasi. Jangan ikutkan
 // sebagai antrean batch atau hitung di ringkasan batch, tetapi tetap simpan
 // seluruh transaksi aslinya agar riwayat serta koreksi tanggal tetap tersedia.
 const visible=data.filter(x=>type!=='kas_lorong'||(
   /^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(String(x.payment_id||''))&&
   Number(x.previousPosting||0)===0));
 const map=x=>{const house=String(x.house||'').split('/');return {idAlokasi:x.id,nama:x.name||'Nama belum terhubung',blok:house[0]||'',noRumah:house.slice(1).join('/'),tanggalBayar:x.date,qtyKasLorong:1,nominalKasLorong:Number(x.amount),metode:x.method||'—'}};
 const pending=visible.filter(x=>!x.posted),posted=visible.filter(x=>x.posted);
 const sum=a=>a.reduce((v,x)=>v+Number(x.amount||0),0);
 return json({ok:true,data:{belum:pending.map(map),sudah:posted.map(map),
  batches:(groups.results||[]).map(x=>({idBatch:x.id,tanggalPembukuan:x.booked_on,keterangan:x.description,jumlahPembayaran:x.item_count,nominal:x.amount_rp,tahap:x.stage,status:x.status})),
  ringkasan:{qtyBelum:pending.length,nominalBelum:sum(pending),qtySudah:posted.length,nominalSudah:sum(posted)}}});
}
async function f4BatchCreate(request,env,who){
 if(env.FINANCE_WRITE_ENABLED!=='true')return safeError('Pembukuan belum aktif.',503);
 let p;try{p=await requestJson(request)}catch{return safeError('Permintaan tidak valid.',400)}
 const type=f4BatchType(p?.category),stage=f4BatchStage(p?.stage),year=Number(p?.year),month=Number(p?.month);
 const date=String(p?.bookedOn||''),description=String(p?.description||'').trim(),ids=p?.sourceIds,key=String(p?.requestKey||'');
 if(!type||!stage||!Number.isInteger(year)||year<2020||year>2100||!Number.isInteger(month)||month<1||month>12||
  !validDateOnly(date)||description.length<4||description.length>250||!Array.isArray(ids)||!ids.length||ids.length>200||
  !validRequestKey(key)||ids.some(x=>typeof x!=='string'||!x||x.length>200)||new Set(ids).size!==ids.length)
  return safeError('Periksa periode, tanggal, tahapan, keterangan dan transaksi terpilih.',400);
 if((type==='kas_lorong'&&env.IURAN_WRITE_ENABLED!=='true')||(type==='denda_gorol'&&env.DENDA_PINJAMAN_WRITE_ENABLED!=='true'))
  return safeError('Modul keuangan belum diaktifkan.',503);
 const hash=await tokenHash(JSON.stringify({type,stage,year,month,date,description,ids:[...ids].sort()})),db=env.DB;
 const previous=await db.prepare('SELECT id,payload_hash,amount_rp,status FROM bookkeeping_kas_batches WHERE request_key=?').bind(key).first();
 if(previous)return previous.payload_hash===hash?json({ok:true,idBatch:previous.id,nominal:previous.amount_rp,status:previous.status,duplikat:true}):safeError('Kunci transaksi telah digunakan untuk data berbeda.',409);
 const years=[...new Set([year,Number(date.slice(0,4))])],slots=years.map(()=>'?').join(',');
 const [archived,closed]=await Promise.all([
  db.prepare('SELECT id FROM bookkeeping_year_archives WHERE fiscal_year IN ('+slots+") AND status IN ('closed','ditutup','terkunci','final') LIMIT 1").bind(...years).first(),
  db.prepare('SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year IN ('+slots+') LIMIT 1').bind(...years).first()]);
 if(archived||closed)return safeError('Periode atau tahun buku sudah ditutup.',409);
 const sources=await f4BatchSources(db,type,year,month,ids);
 if(sources.length!==ids.length||sources.some(x=>x.posted||Number(x.amount)<=0||!Number.isSafeInteger(Number(x.amount))||x.date>date))
  return safeError('Pembayaran sudah dibukukan atau tanggal pembukuan lebih awal dari penerimaan.',409);
 if(type==='kas_lorong'&&sources.some(x=>
    !/^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(String(x.payment_id||''))||
    Number(x.previousPosting||0)>0))
  return safeError('Pembayaran CSV lama sudah terkunci dalam riwayat dan tidak dapat dimasukkan ke batch baru.',409);
 const amount=sources.reduce((sum,x)=>sum+Number(x.amount),0);
 if(!Number.isSafeInteger(amount)||amount<=0)return safeError('Jumlah batch tidak valid.',409);
 const id='kasbatch:'+crypto.randomUUID(),cashId='cashbatch:'+crypto.randomUUID();
 const statements=[
  db.prepare("INSERT INTO bookkeeping_kas_batches(id,request_key,payload_hash,category,period_year,period_month,stage,booked_on,description,amount_rp,item_count,status,cash_transaction_id,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,'aktif',?,?)").bind(id,key,hash,type,year,month,stage,date,description,amount,sources.length,cashId,who.id),
  ...sources.map(x=>db.prepare("INSERT INTO bookkeeping_kas_batch_items(id,batch_id,category,source_id,amount_rp,status) VALUES(?,?,?,?,?,'aktif')").bind('kbi:'+crypto.randomUUID(),id,type,x.id,Number(x.amount))),
  db.prepare("INSERT INTO bookkeeping_cash_transactions(id,occurred_on,transaction_type,category,debit_rp,credit_rp,status,note,payment_method) VALUES(?,?,?,?,?,0,'aktif',?,'Gabungan')").bind(cashId,date,type==='kas_lorong'?'batch_kas_lorong':'batch_denda_gorol',type==='kas_lorong'?'Kas Lorong':'Denda Gorol',amount,description),
  db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'pembukuan','post_cash_batch','bookkeeping_kas_batches',?,?,?)").bind(crypto.randomUUID(),who.id,id,description,JSON.stringify({type,stage,year,month,amount,sourceIds:ids}))
 ];
 try{await db.batch(statements)}catch{
  const saved=await db.prepare('SELECT id,payload_hash,amount_rp FROM bookkeeping_kas_batches WHERE request_key=?').bind(key).first();
  return saved&&saved.payload_hash===hash?json({ok:true,idBatch:saved.id,nominal:saved.amount_rp,duplikat:true}):safeError('Batch tidak dibuat; sumber sudah diproses atau terjadi konflik. Tidak ada transaksi parsial.',409);
 }
 return json({ok:true,idBatch:id,nominal:amount,jumlahPembayaran:sources.length});
}
async function f4BatchCancel(request,env,who){
 if(env.FINANCE_WRITE_ENABLED!=='true')return safeError('Pembukuan belum aktif.',503);
 let p;try{p=await requestJson(request)}catch{return safeError('Permintaan tidak valid.',400)}
 const id=String(p?.idBatch||''),reason=String(p?.alasan||'').trim();
 if(!/^kasbatch:[a-f0-9-]{36}$/.test(id)||reason.length<5||reason.length>250)return safeError('Kode batch atau alasan tidak valid.',400);
 const db=env.DB,b=await db.prepare('SELECT status,cash_transaction_id,period_year,booked_on FROM bookkeeping_kas_batches WHERE id=?').bind(id).first();
 if(!b)return safeError('Batch tidak ditemukan.',404);
 if(b.status==='dibatalkan')return json({ok:true,idBatch:id,duplikat:true});
 const years=[...new Set([Number(b.period_year),Number(b.booked_on.slice(0,4))])],slots=years.map(()=>'?').join(',');
 const [archived,closed]=await Promise.all([
  db.prepare('SELECT id FROM bookkeeping_year_archives WHERE fiscal_year IN ('+slots+") AND status IN ('closed','ditutup','terkunci','final') LIMIT 1").bind(...years).first(),
  db.prepare('SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year IN ('+slots+') LIMIT 1').bind(...years).first()]);
 if(archived||closed)return safeError('Tahun telah ditutup, batch tidak dapat dibatalkan.',409);
 try{
  const out=await db.batch([
   db.prepare("UPDATE bookkeeping_kas_batches SET status='dibatalkan' WHERE id=? AND status='aktif'").bind(id),
   db.prepare("UPDATE bookkeeping_kas_batch_items SET status='dibatalkan' WHERE batch_id=? AND status='aktif'").bind(id),
   db.prepare("UPDATE bookkeeping_cash_transactions SET status='dibatalkan' WHERE id=? AND status='aktif' AND transaction_type IN ('batch_kas_lorong','batch_denda_gorol')").bind(b.cash_transaction_id),
   db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason) VALUES(?,?,'pembukuan','cancel_cash_batch','bookkeeping_kas_batches',?,?)").bind(crypto.randomUUID(),who.id,id,reason)
  ]);
  if(Number(out[0]?.meta?.changes)!==1||Number(out[2]?.meta?.changes)!==1)return safeError('Data batch perlu diperiksa.',409);
 }catch{return safeError('Pembatalan tidak disimpan; periksa data dahulu.',409)}
 return json({ok:true,idBatch:id,status:'dibatalkan'});
}

// Non-destructive cancellation: only newly created D1 pay-UUID, never historical records.
async function cancelNewIuranPayment(request,env,who){
  if(env.FINANCE_WRITE_ENABLED!=="true"||env.IURAN_WRITE_ENABLED!=="true")return safeError("Penulisan Iuran belum diaktifkan.",503);
  let input;try{input=await requestJson(request)}catch{return safeError("JSON tidak valid.",400)}
  const id=String(input?.idPembayaran||""),reason=String(input?.alasan||"").trim(),db=env.DB;
  if(!/^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)||reason.length<5||reason.length>300)
    return safeError("Hanya Iuran D1 baru dengan alasan pembatalan 5–300 karakter.",400);
  const payment=await db.prepare("SELECT id,payer_id,paid_on,status FROM bookkeeping_payments WHERE id=?").bind(id).first();
  if(!payment)return safeError("Pembayaran tidak ditemukan.",404);
  if(payment.status==="dibatalkan")return json({ok:true,idPembayaran:id,status:"dibatalkan",duplikat:true});
  if(payment.status!=="aktif")return safeError("Status pembayaran tidak dapat dibatalkan.",409);
  const found=await db.prepare("SELECT id,period_year,contribution_type,amount_rp,status FROM bookkeeping_payment_allocations WHERE payment_id=?").bind(id).all();
  const items=found.results||[];
  if(!items.length||items.some(x=>x.status!=="aktif"))return safeError("Alokasi tidak utuh; periksa sebelum pembatalan.",409);
  const years=[...new Set([Number(payment.paid_on.slice(0,4)),...items.map(x=>Number(x.period_year))])];
  const qs=years.map(()=>"?").join(",");
  const archive=await db.prepare(`SELECT fiscal_year FROM bookkeeping_year_archives WHERE fiscal_year IN (${qs}) AND status IN ('closed','ditutup','terkunci','final') LIMIT 1`).bind(...years).first();
  const closing=await db.prepare(`SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year IN (${qs}) LIMIT 1`).bind(...years).first();
  if(archive||closing)return safeError("Tahun pembukuan atau alokasi sudah dikunci.",409);
  const posted=await db.prepare("SELECT COUNT(*) AS n FROM bookkeeping_allocation_details WHERE allocation_id IN (SELECT id FROM bookkeeping_payment_allocations WHERE payment_id=?)").bind(id).first();
  const kasPosted=await db.prepare("SELECT COUNT(*) AS n FROM bookkeeping_kas_batch_items WHERE category='kas_lorong' AND status='aktif' AND source_id IN (SELECT id FROM bookkeeping_payment_allocations WHERE payment_id=?)").bind(id).first();
  if(Number(posted?.n||0)||Number(kasPosted?.n||0))return safeError("Iuran sudah dibukukan. Batalkan batch dahulu sebelum membatalkan pembayaran.",409);
  if(await db.prepare("SELECT id FROM bookkeeping_advance_repayments WHERE instr(note,?)>0 AND status='aktif' LIMIT 1").bind(" melalui Iuran "+id).first())
    return safeError("Pembayaran telah melunasi Talangan; pembatalan memerlukan jurnal pembalik terpisah.",409);
  const talangan=await db.prepare("SELECT id FROM bookkeeping_advances WHERE payer_id=? AND status='aktif' AND amount_rp>COALESCE(reimbursed_rp,0) LIMIT 1").bind(payment.payer_id).first();
  if(talangan)return safeError("Talangan masih aktif; pembatalan otomatis tidak aman.",409);
  const ledger=await db.prepare("SELECT id,status,transaction_type,debit_rp,credit_rp FROM bookkeeping_cash_transactions WHERE source_payment_id=?").bind(id).all();
  const cash=ledger.results||[],kas=items.filter(x=>x.contribution_type==="KAS_LORONG").reduce((s,x)=>s+Number(x.amount_rp),0);
  if(!Number.isSafeInteger(kas)||kas<0||cash.length!==(kas?1:0)||cash.some(c=>c.status!=="aktif"||c.transaction_type!=="iuran"||Number(c.debit_rp)!==kas||Number(c.credit_rp)!==0))
    return safeError("Jurnal kas tidak sama dengan alokasi Kas Lorong; pembatalan diblokir.",409);
  try{
    const out=await db.batch([
      db.prepare("UPDATE bookkeeping_payments SET status='dibatalkan' WHERE id=? AND status='aktif'").bind(id),
      db.prepare("UPDATE bookkeeping_payment_allocations SET status='dibatalkan' WHERE payment_id=? AND status='aktif'").bind(id),
      db.prepare("UPDATE bookkeeping_cash_transactions SET status='dibatalkan' WHERE source_payment_id=? AND transaction_type='iuran' AND status='aktif'").bind(id),
      db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason) VALUES(?,?,'pembukuan','cancel_new_iuran','bookkeeping_payments',?,?)").bind("audit:iuran-cancel:"+id,who.id,id,reason)
    ]);
    if(Number(out[0]?.meta?.changes)!==1)return safeError("Status pembayaran berubah; muat ulang.",409);
  }catch{
    const latest=await db.prepare("SELECT status FROM bookkeeping_payments WHERE id=?").bind(id).first();
    if(latest?.status==="dibatalkan")return json({ok:true,idPembayaran:id,status:"dibatalkan",duplikat:true});
    return safeError("Pembatalan gagal tanpa mengubah jurnal.",409);
  }
  return json({ok:true,idPembayaran:id,status:"dibatalkan",duplikat:false});
}
__name(cancelNewIuranPayment,"cancelNewIuranPayment");

/* Editing an unposted D1 iuran is deliberately metadata-only. Payer, amount,
   period and allocations remain immutable: changing those requires a formally
   cancelled/new transaction to avoid ever drifting RT/Arisan/Cash journals. */
async function f4EditNewIuran(request,env,who){
 try{
 if(env.FINANCE_WRITE_ENABLED!=="true"||env.IURAN_WRITE_ENABLED!=="true")return safeError("Penulisan Iuran D1 belum aktif.",503);
 let p;try{p=await requestJson(request)}catch{return safeError("Permintaan edit tidak valid.",400)}
 const id=String(p.idPembayaran||""),date=String(p.tanggal||""),method=String(p.metode||""),desc=String(p.catatan||"").trim();
 if(!/^pay-[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)||!validDateOnly(date)||!["Cash","QRIS","Transfer Mandiri"].includes(method)||desc.length>500)
   return safeError("Hanya Iuran baru dengan tanggal, metode dan catatan valid boleh diedit.",400);
 const db=env.DB;
 const prev=await db.prepare("SELECT id,payer_id,paid_on,amount_rp,payment_method,description,status FROM bookkeeping_payments WHERE id=?").bind(id).first();
 if(!prev)return safeError("Pembayaran tidak ditemukan.",404);
 if(prev.status!=="aktif")return safeError("Pembayaran tidak aktif.",409);
 const a=await db.prepare("SELECT id,period_year,status,contribution_type,amount_rp FROM bookkeeping_payment_allocations WHERE payment_id=?").bind(id).all();
 const rows=a.results||[];
 if(!rows.length||rows.some(x=>x.status!=="aktif"))return safeError("Alokasi tidak utuh.",409);
 const years=[...new Set([Number(prev.paid_on.slice(0,4)),Number(date.slice(0,4)),...rows.map(x=>Number(x.period_year))])];
 const flags=years.map(()=>"?").join(",");
 if(await db.prepare(`SELECT fiscal_year FROM bookkeeping_year_archives WHERE fiscal_year IN (${flags}) AND status IN ('ditutup','terkunci','final','closed') LIMIT 1`).bind(...years).first()||
    await db.prepare(`SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year IN (${flags}) LIMIT 1`).bind(...years).first())
   return safeError("Tahun buku sudah dikunci.",409);
 if(await db.prepare("SELECT id FROM bookkeeping_allocation_details WHERE allocation_id IN (SELECT id FROM bookkeeping_payment_allocations WHERE payment_id=?) LIMIT 1").bind(id).first()||
    await db.prepare("SELECT id FROM bookkeeping_kas_batch_items WHERE category='kas_lorong' AND status='aktif' AND source_id IN (SELECT id FROM bookkeeping_payment_allocations WHERE payment_id=?) LIMIT 1").bind(id).first())
   return safeError("Iuran sudah dibukukan. Batalkan batch sebelum mengedit tanggal atau metode.",409);
 const cash=(await db.prepare("SELECT id,occurred_on,status,transaction_type,debit_rp,credit_rp FROM bookkeeping_cash_transactions WHERE source_payment_id=?").bind(id).all()).results||[];
 const kas=rows.filter(x=>x.contribution_type==="KAS_LORONG").reduce((n,x)=>n+Number(x.amount_rp),0);
 if(cash.length!==(kas?1:0)||cash.some(x=>x.status!=="aktif"||x.transaction_type!=="iuran"||Number(x.debit_rp)!==kas||Number(x.credit_rp)!==0))
   return safeError("Jurnal Kas terkait belum cocok; pembaruan ditolak.",409);
 if(await db.prepare("SELECT id FROM bookkeeping_advance_repayments WHERE instr(note,?)>0 AND status='aktif' LIMIT 1").bind(" melalui Iuran "+id).first())
   return safeError("Iuran terkait pelunasan Talangan tidak dapat diedit tanpa jurnal pembalik.",409);
 const linked=await db.prepare("SELECT id FROM bookkeeping_advances WHERE payer_id=? AND status='aktif' AND amount_rp>COALESCE(reimbursed_rp,0) LIMIT 1").bind(prev.payer_id).first();
 if(linked)return safeError("Talangan aktif; selesaikan rekonsiliasi sebelum mengedit Iuran.",409);
 if(prev.paid_on===date&&prev.payment_method===method&&String(prev.description||"")===desc)return json({ok:true,unchanged:true});
 try{
  const batch=[
   db.prepare("UPDATE bookkeeping_payments SET paid_on=?,received_on=?,payment_method=?,description=? WHERE id=? AND paid_on=? AND status='aktif'").bind(date,date,method,desc,id,prev.paid_on),
   ...cash.map(c=>db.prepare("UPDATE bookkeeping_cash_transactions SET occurred_on=?,payment_method=?,note=? WHERE id=? AND occurred_on=? AND status='aktif'").bind(date,method,desc,c.id,c.occurred_on)),
   db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,'pembukuan','edit_iuran_metadata','bookkeeping_payments',?, ?, ?)").bind(crypto.randomUUID(),who.id,id,
    JSON.stringify({date:prev.paid_on,method:prev.payment_method,note:prev.description}),
    JSON.stringify({date,method,note:desc}))
  ];
  const out=await db.batch(batch);
  if(Number(out[0]?.meta?.changes)!==1)return safeError("Pembayaran berubah saat diedit; muat ulang.",409);
 }catch{return safeError("Perubahan Iuran gagal; tidak ada perubahan parsial.",409)}
 return json({ok:true,idPembayaran:id,status:"success",message:"Tanggal, metode dan catatan berhasil diperbarui; nominal dan alokasi tetap."});
 }catch(e){return safeError("Pemeriksaan edit Iuran gagal.",500)}
}
__name(f4EditNewIuran,"f4EditNewIuran");


// Bagikan hak warga dari jurnal penjualan sah ke setoran-setoran miliknya pada
// batch yang sama. Pembulatan largest-remainder menjamin jumlah persis sama
// dengan kredit tabungan member (bukan tarif estimasi per barang).
function f4ShareConfirmedSavings(rows, creditedRp) {
  if(!Number.isSafeInteger(creditedRp)||creditedRp<0||!rows.length)return null;
  const sorted=rows.slice().sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  const weights=sorted.map(x=>Number(x.estimated_total_rp));
  if(weights.some(n=>!Number.isSafeInteger(n)||n<0))return null;
  const total=weights.reduce((acc,n)=>acc+BigInt(n),0n);
  if(total<=0n)return null;
  const cash=BigInt(creditedRp);
  const portions=sorted.map((row,i)=>{
    const numerator=cash*BigInt(weights[i]);
    return {id:row.id,base:Number(numerator/total),remainder:numerator%total};
  });
  const missing=creditedRp-portions.reduce((acc,row)=>acc+row.base,0);
  const ranked=portions.slice().sort((a,b)=>
    a.remainder===b.remainder?String(a.id).localeCompare(String(b.id)):
    a.remainder>b.remainder?-1:1);
  if(missing<0||missing>ranked.length)return null;
  for(let i=0;i<missing;i++)ranked[i].base+=1;
  return portions.map(({id,base})=>({id,nilaiSahRp:base}));
}
__name(f4ShareConfirmedSavings,"f4ShareConfirmedSavings");

// Berat final berbeda dari berat timbang. Bagi berat JUAL yang terkonfirmasi
// menurut jenis barang, lalu menurut gram timbang setoran. Gram tidak dikarang.
function f4DivideGrams(entries,totalGrams){
  if(!Number.isSafeInteger(totalGrams)||totalGrams<0||!entries.length)return null;
  const sorted=entries.slice().sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  if(sorted.some(x=>!Number.isSafeInteger(x.grams)||x.grams<0))return null;
  const total=sorted.reduce((n,x)=>n+BigInt(x.grams),0n);
  if(total<=0n)return totalGrams===0?sorted.map(x=>({id:x.id,grams:0})):null;
  const rows=sorted.map(x=>({
    id:x.id,
    grams:Number(BigInt(totalGrams)*BigInt(x.grams)/total),
    mod:BigInt(totalGrams)*BigInt(x.grams)%total
  }));
  const leftover=totalGrams-rows.reduce((n,x)=>n+x.grams,0);
  if(leftover<0||leftover>rows.length)return null;
  const ranked=rows.slice().sort((a,b)=>a.mod===b.mod?String(a.id).localeCompare(String(b.id)):a.mod>b.mod?-1:1);
  for(let i=0;i<leftover;i++)ranked[i].grams++;
  return rows.map(x=>({id:x.id,grams:x.grams}));
}
__name(f4DivideGrams,"f4DivideGrams");
async function f4ConfirmedDepositGrams(db,batchIds){
  const ids=[...new Set(batchIds.filter(Boolean).map(String))];
  const values=new Map();
  if(!ids.length)return values;
  const qs=ids.map(()=>'?').join(',');
  const [taken,sold]=await Promise.all([
    list(db,`SELECT d.id AS depositId,d.batch_id AS batchId,l.waste_item_id AS itemId,
      COALESCE(SUM(l.grams),0) AS grams
      FROM waste_deposits d JOIN waste_batches b ON b.id=d.batch_id
      JOIN waste_deposit_lines l ON l.deposit_id=d.id
      WHERE d.status='terkonfirmasi' AND b.status='disahkan' AND d.batch_id IN (${qs})
      GROUP BY d.id,d.batch_id,l.waste_item_id ORDER BY d.batch_id,l.waste_item_id,d.id`,ids),
    list(db,`SELECT s.batch_id AS batchId,l.waste_item_id AS itemId,
      COALESCE(SUM(l.grams),0) AS grams
      FROM waste_sales s JOIN waste_batches b ON b.id=s.batch_id
      JOIN waste_allocations a ON a.batch_id=s.batch_id
      JOIN waste_sale_lines l ON l.sale_id=s.id
      WHERE s.status='terkonfirmasi' AND b.status='disahkan' AND s.batch_id IN (${qs})
      GROUP BY s.batch_id,l.waste_item_id`,ids)
  ]);
  const grouped=new Map(),soldByKey=new Map(),invalid=new Set();
  const batchDeposits=new Map(),batchTotals=new Map(),batchSales=new Map();
  for(const row of taken){
    const id=String(row.depositId),batch=String(row.batchId),key=batch+'|'+row.itemId,grams=Number(row.grams);
    if(!Number.isSafeInteger(grams)||grams<0){invalid.add(batch);continue}
    if(!grouped.has(key))grouped.set(key,[]);
    grouped.get(key).push({id,grams});
    if(!batchDeposits.has(batch))batchDeposits.set(batch,new Set());
    batchDeposits.get(batch).add(id);
  }
  for(const row of sold){
    const batch=String(row.batchId),key=batch+'|'+row.itemId,grams=Number(row.grams);
    if(!Number.isSafeInteger(grams)||grams<0||soldByKey.has(key)){invalid.add(batch);continue}
    soldByKey.set(key,grams);
    batchSales.set(batch,(batchSales.get(batch)||0)+grams);
    if(!grouped.has(key)&&grams>0)invalid.add(batch);
  }
  for(const [key,entries] of grouped){
    const batch=key.slice(0,key.indexOf('|'));
    if(invalid.has(batch))continue;
    const portion=f4DivideGrams(entries,soldByKey.get(key)||0);
    if(!portion){invalid.add(batch);continue}
    if(!batchTotals.has(batch))batchTotals.set(batch,new Map());
    const map=batchTotals.get(batch);
    for(const x of portion)map.set(x.id,(map.get(x.id)||0)+x.grams);
  }
  for(const [batch,deposits] of batchDeposits){
    if(invalid.has(batch)||!batchSales.has(batch))continue;
    const map=batchTotals.get(batch)||new Map();
    const sum=[...map.values()].reduce((n,v)=>n+v,0);
    if(sum!==batchSales.get(batch))continue;
    for(const id of deposits)values.set(id,map.get(id)||0);
  }
  return values;
}
__name(f4ConfirmedDepositGrams,"f4ConfirmedDepositGrams");
async function ownSavings(db, memberId) {
  const [balance, deposits, details, ledger] = await Promise.all([
    db.prepare(`SELECT COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit')
      THEN amount_rp ELSE -amount_rp END),0) AS available_rp,
      COALESCE(SUM(CASE WHEN kind='kredit' THEN amount_rp ELSE 0 END),0) AS credit_total_rp,
      COALESCE(SUM(CASE WHEN kind='pencairan' THEN amount_rp ELSE 0 END),0) AS payout_total_rp
      FROM waste_savings_ledger WHERE member_id=?`).bind(memberId).first(),
    db.prepare(`SELECT d.id,d.batch_id,d.deposited_on,d.status,d.total_grams,d.estimated_total_rp,
        (SELECT sold_on FROM waste_sales s WHERE s.batch_id=d.batch_id AND s.status='terkonfirmasi'
          ORDER BY s.sold_on DESC LIMIT 1) AS sold_on
      FROM waste_deposits d JOIN waste_batches b ON b.id=d.batch_id
      WHERE d.member_id=? AND d.status!='dibatalkan' AND b.status!='dibatalkan'
      ORDER BY d.deposited_on DESC,d.id DESC LIMIT 61`).bind(memberId).all(),
    db.prepare(`SELECT l.deposit_id,i.name AS item_name,l.grams,l.citizen_rate_rp_per_kg,l.estimated_rp
      FROM waste_deposit_lines l JOIN waste_deposits d ON d.id=l.deposit_id
      JOIN waste_batches b ON b.id=d.batch_id JOIN waste_items i ON i.id=l.waste_item_id
      WHERE d.member_id=? AND d.status!='dibatalkan' AND b.status!='dibatalkan'
      ORDER BY d.deposited_on DESC,l.deposit_id LIMIT 301`).bind(memberId).all(),
    db.prepare(`SELECT id,transaction_on,kind,amount_rp,note
      FROM waste_savings_ledger WHERE member_id=?
      ORDER BY transaction_on DESC,id DESC LIMIT 101`).bind(memberId).all()
  ]);
  // Kredit sah berasal dari waste_savings_ledger, bukan estimated_total_rp.
  // Hitung SEMUA setoran dalam batch terkait (meski sebagian lebih lama dari
  // batas 60 riwayat) agar alokasi per setoran tidak berubah saat data bertambah.
  const shownDeposits=(deposits.results||[]).slice(0,60);
  const confirmedBatchIds=[...new Set(shownDeposits.filter(d=>d.status==='terkonfirmasi')
    .map(d=>String(d.batch_id||'')).filter(Boolean))];
  const actualByDeposit=new Map();
  const finalGrams=await f4ConfirmedDepositGrams(db,confirmedBatchIds);
  if(confirmedBatchIds.length){
    const markers=confirmedBatchIds.map(()=>'?').join(',');
    const confirmedRows=await list(db,`SELECT d.id,d.batch_id,d.estimated_total_rp,
      (SELECT COUNT(*) FROM waste_savings_ledger l
         WHERE l.member_id=d.member_id AND l.batch_id=d.batch_id AND l.kind='kredit') AS credit_count,
      (SELECT COALESCE(SUM(l.amount_rp),0) FROM waste_savings_ledger l
         WHERE l.member_id=d.member_id AND l.batch_id=d.batch_id AND l.kind='kredit') AS credit_rp
      FROM waste_deposits d
      JOIN waste_batches b ON b.id=d.batch_id
      WHERE d.member_id=? AND d.status='terkonfirmasi' AND b.status='disahkan'
        AND d.batch_id IN (${markers})
        AND EXISTS(SELECT 1 FROM waste_allocations a WHERE a.batch_id=d.batch_id)
        AND EXISTS(SELECT 1 FROM waste_sales s
          WHERE s.batch_id=d.batch_id AND s.status='terkonfirmasi')
      ORDER BY d.batch_id,d.id`,[memberId,...confirmedBatchIds]);
    const perBatch=new Map();
    for(const row of confirmedRows){
      const group=perBatch.get(row.batch_id)||[];
      group.push(row);perBatch.set(row.batch_id,group);
    }
    for(const rows of perBatch.values()){
      // Tanpa jurnal kredit, nominal sah tidak boleh ditebak dari estimasi.
      if(!rows.length||Number(rows[0].credit_count)<1)continue;
      const shared=f4ShareConfirmedSavings(rows,Number(rows[0].credit_rp));
      if(shared)for(const amount of shared)actualByDeposit.set(amount.id,amount.nilaiSahRp);
    }
  }
  const hasMoreDeposits=(deposits.results||[]).length>60;
  const hasMoreDetails=(details.results||[]).length>300;
  const hasMoreLedger=(ledger.results||[]).length>100;
  const limitedDetails=(details.results||[]).slice(0,300);
  const ownDeposits = (deposits.results || []).slice(0,60).map((d) => ({
    id: d.id,
    tanggal: d.deposited_on,
    tanggalJual:d.sold_on||null,
    status: d.status,
    beratGram: d.total_grams,
    beratSahGram:finalGrams.has(d.id)?finalGrams.get(d.id):null,
    estimasiRp: d.estimated_total_rp,
    // Null berarti belum ada nominal jual sah yang bisa dibuktikan dari jurnal.
    nilaiSahRp: actualByDeposit.has(d.id)?actualByDeposit.get(d.id):null,
    rincian: limitedDetails.filter((l) => l.deposit_id === d.id).map((l) => ({
      barang: l.item_name,
      beratGram: l.grams,
      tarifWargaRpPerKg: l.citizen_rate_rp_per_kg,
      estimasiRp: l.estimated_rp
    }))
  }));
  const member=await one(db,`SELECT m.id,m.display_name AS nama,h.house_code AS rumah FROM members m
    LEFT JOIN households h ON h.id=m.household_id WHERE m.id=?`,[memberId]);
  return {
    ok: true,
    anggota:{id:member?.id||memberId,nama:member?.nama||'',rumah:member?.rumah||''},
    saldoTersediaRp: Number(balance?.available_rp || 0),
    totalMasukRp: Number(balance?.credit_total_rp || 0),
    totalCairRp: Number(balance?.payout_total_rp || 0),
    // Setoran menunggu dihitung atas SEMUA baris sah, bukan hanya 60 terbaru.
    estimasiMenungguRp: Number((await db.prepare(`SELECT COALESCE(SUM(d.estimated_total_rp),0) AS total
      FROM waste_deposits d JOIN waste_batches b ON b.id=d.batch_id
      WHERE d.member_id=? AND d.status='estimasi' AND b.status!='dibatalkan'`).bind(memberId).first())?.total || 0),
    riwayatLengkap: !(hasMoreDeposits||hasMoreDetails||hasMoreLedger),
    riwayatTerpotong: { setoran: hasMoreDeposits, rincian: hasMoreDetails, mutasi: hasMoreLedger },
    setoran: ownDeposits,
    mutasi: (ledger.results || []).slice(0,100).map((l) => ({ id: l.id, tanggal: l.transaction_on, jenis: l.kind, jumlahRp: l.amount_rp, keterangan: l.note }))
  };
}
__name(ownSavings, "ownSavings");
async function accountActivationPreview(db) {
  const result = await db.prepare(`SELECT a.id,a.member_id,a.username,a.role,a.status,a.password_scheme,
    h.house_code,m.display_name
    FROM accounts a LEFT JOIN members m ON m.id=a.member_id
    LEFT JOIN households h ON h.id=m.household_id
    WHERE a.role IN ('anggota','admin')
    ORDER BY a.role,a.username LIMIT 100`).all();
  const accounts = (result.results || []).map((a) => ({
    id: a.id,
    member_id: a.member_id || null,
    username: a.username,
    role: a.role,
    status: a.status,
    nama: a.display_name || null,
    rumah: a.house_code || null,
    perluAktivasi: a.status === "nonaktif" && a.password_scheme === "pending"
  }));
  return { ok: true, jumlah: accounts.length, akun: accounts };
}
__name(accountActivationPreview, "accountActivationPreview");

async function manageMemberIdentity(request,env,who){
 if(who?.role!=='superadmin')return safeError('Hanya Superadmin yang dapat mengubah identitas.',403);
 const origin=request.headers.get('origin')||'';
 if(origin&&!['https://flamboyan4.web.id','https://www.flamboyan4.web.id'].includes(origin))return safeError('Asal permintaan ditolak.',403);
 let p;try{p=await requestJson(request)}catch{return safeError('JSON tidak valid.',400)}
 const action=String(p.action||''),accountId=String(p.accountId||'');
 if(!['edit','deactivate','handover'].includes(action)||!/^account:[A-Za-z0-9_-]{1,100}$/.test(accountId))return safeError('Aksi/ID akun tidak valid.',400);
 const db=env.DB;
 const current=await db.prepare('SELECT a.id,a.username,a.member_id,a.role,a.status,m.household_id,m.display_name AS name,m.status AS member_status,h.house_code FROM accounts a JOIN members m ON m.id=a.member_id JOIN households h ON h.id=m.household_id WHERE a.id=? LIMIT 1').bind(accountId).first();
 if(!current||current.role!=='anggota')return safeError('Hanya akun anggota yang dapat diubah.',404);
 const name=String(p.name||'').trim();
 if(action!=='deactivate'&&(name.length<2||name.length>160))return safeError('Nama harus 2–160 karakter.',400);
 const audit=(type,target,before,after)=>db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json) VALUES(?,?,'accounts',?,'accounts',?,?,?)").bind('audit:'+crypto.randomUUID(),who.id,type,target,JSON.stringify(before),JSON.stringify(after));
 if(action==='edit'){
  if(current.status!=='aktif'||current.member_status!=='aktif')return safeError('Identitas lama sudah nonaktif.',409);
  if(name===current.name)return json({ok:true,unchanged:true});
  try{await db.batch([
   db.prepare('UPDATE members SET display_name=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(name,current.member_id),
   db.prepare('UPDATE member_account_profiles SET display_name=?,updated_at=CURRENT_TIMESTAMP WHERE account_id=?').bind(name,accountId),
   db.prepare('UPDATE bookkeeping_payers SET display_name=? WHERE member_id=?').bind(name,current.member_id),
   audit('edit_member_name',accountId,{name:current.name},{name})
  ])}catch{return safeError('Nama tidak tersimpan; database tetap utuh.',409)}
  return json({ok:true,updated:true});
 }
 if(current.status!=='aktif'||current.member_status!=='aktif')return safeError('Akun sudah nonaktif. Muat ulang.',409);
 if(action==='deactivate'){
  if(p.confirmation!=='NONAKTIFKAN AKUN')return safeError('Konfirmasi salah.',400);
  try{await db.batch([
   db.prepare("UPDATE accounts SET status='nonaktif',updated_at=CURRENT_TIMESTAMP WHERE id=? AND role='anggota' AND status='aktif'").bind(accountId),
   db.prepare("UPDATE members SET status='nonaktif',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(current.member_id),
   db.prepare('UPDATE bookkeeping_payers SET active=0 WHERE member_id=?').bind(current.member_id),
   db.prepare('UPDATE sessions SET revoked_at=CURRENT_TIMESTAMP WHERE account_id=? AND revoked_at IS NULL').bind(accountId),
   audit('deactivate_member',accountId,current,{status:'nonaktif'})
  ])}catch{return safeError('Penonaktifan gagal, semua perubahan dibatalkan.',409)}
  return json({ok:true,deactivated:true,historyPreserved:true});
 }
 if(p.confirmation!=='GANTI PENGHUNI')return safeError('Konfirmasi ganti penghuni salah.',400);
 const username=String(p.username||'').trim().toLowerCase();
 if(!/^[a-z0-9][a-z0-9-]{3,39}$/.test(username)||username===current.username)return safeError('Username baru wajib berbeda, 4–40 karakter huruf kecil/angka/tanda hubung.',400);
 if(await db.prepare('SELECT id FROM accounts WHERE username=? LIMIT 1').bind(username).first())return safeError('Username sudah dipakai.',409);
 const memberId='member:api:'+crypto.randomUUID(),payerId='payer:'+crypto.randomUUID(),newAccountId='account:'+crypto.randomUUID(),occupancyId='occupancy:api:'+crypto.randomUUID(),hash=await passwordHash('1234');
 const before={accountId,memberId:current.member_id,name:current.name,house:current.house_code};
 // Older staging databases may lack the optional occupancy end-date column.
 const occupancyColumns=await db.prepare('PRAGMA table_info(household_occupancy_history)').all();
 const hasEndDate=(occupancyColumns.results||[]).some(c=>c.name==='ended_on');
 const endOccupancy=hasEndDate?
   db.prepare("UPDATE household_occupancy_history SET status='selesai',ended_on=date('now') WHERE member_id=? AND status='aktif'").bind(current.member_id):
   db.prepare("UPDATE household_occupancy_history SET status='selesai' WHERE member_id=? AND status='aktif'").bind(current.member_id);
 try{await db.batch([
  db.prepare("UPDATE accounts SET status='nonaktif',updated_at=CURRENT_TIMESTAMP WHERE id=? AND role='anggota' AND status='aktif'").bind(accountId),
  db.prepare("UPDATE members SET status='nonaktif',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(current.member_id),
  db.prepare('UPDATE bookkeeping_payers SET active=0 WHERE member_id=?').bind(current.member_id),
  db.prepare('UPDATE sessions SET revoked_at=CURRENT_TIMESTAMP WHERE account_id=? AND revoked_at IS NULL').bind(accountId),
  endOccupancy,
  db.prepare("INSERT INTO members(id,household_id,display_name,status,joined_at) VALUES(?,?,?,'aktif',date('now'))").bind(memberId,current.household_id,name),
  db.prepare("INSERT INTO bookkeeping_payers(id,household_id,member_id,display_name,payer_type,active) VALUES(?,?,?,?,'warga',1)").bind(payerId,current.household_id,memberId,name),
  db.prepare("INSERT INTO household_occupancy_history(id,household_id,member_id,started_on,status) VALUES(?,?,?,date('now'),'aktif')").bind(occupancyId,current.household_id,memberId),
  db.prepare("INSERT INTO accounts(id,member_id,username,role,status,password_hash,password_scheme,must_change_password) VALUES(?,?,?,'anggota','aktif',?,'pbkdf2-sha256',0)").bind(newAccountId,memberId,username,hash),
  audit('handover_member',accountId,before,{newAccountId,newMemberId:memberId,name,username,house:current.house_code})
 ])}catch{return safeError('Ganti penghuni belum tersimpan. Seluruh perubahan database dibatalkan.',409)}
 return json({ok:true,transferred:true,historyPreserved:true,memberId,newAccountId,username,passwordAwal:'1234'});
}
__name(manageMemberIdentity,'manageMemberIdentity');
async function activateMemberAccount(request, env, who) {
  let payload;
  try {
    payload = await requestJson(request);
  } catch {
    return safeError("Format permintaan tidak valid.", 400);
  }
  if (payload?.confirmation !== "AKTIFKAN AKUN WARGA") return safeError("Konfirmasi aktivasi diperlukan.", 400);
  const id = String(payload.accountId || "");
  if (!/^account:[A-Za-z0-9_-]{1,100}$/.test(id)) return safeError("ID akun tidak valid.", 400);
  const account = await env.DB.prepare(`SELECT a.id,a.username,a.status,a.password_hash,a.password_scheme,
    a.role,m.status AS member_status,h.house_code
    FROM accounts a JOIN members m ON m.id=a.member_id
    JOIN households h ON h.id=m.household_id
    WHERE a.id=? LIMIT 1`).bind(id).first();
  if (!account || account.role !== "anggota" || account.member_status !== "aktif") return safeError("Akun warga tidak ditemukan atau tidak aktif.", 404);
  if (account.status !== "nonaktif" || account.password_hash || account.password_scheme !== "pending") return safeError("Akun sudah diaktifkan atau membutuhkan pemeriksaan.", 409);
  const normalHouse = String(account.house_code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const normalUsername = String(account.username || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!normalHouse || normalHouse !== normalUsername) return safeError("Nomor rumah dan username perlu diperiksa dahulu.", 409);
  const hashed = await passwordHash("1234");
  const updated = await env.DB.prepare(`UPDATE accounts SET password_hash=?,password_scheme='pbkdf2-sha256',
    status='aktif',must_change_password=0,failed_attempts=0,locked_until=NULL,
    updated_at=CURRENT_TIMESTAMP
    WHERE id=? AND role='anggota' AND status='nonaktif' AND password_hash IS NULL
    AND password_scheme='pending'`).bind(hashed, id).run();
  if (updated.meta?.changes !== 1) return safeError("Aktivasi sudah diproses. Muat ulang daftar akun.", 409);
  await env.DB.prepare(`INSERT INTO audit_log
    (id,actor_account_id,scope,action,target_type,target_id,reason)
    VALUES (?,?,?,?,?,?,?)`).bind(
    crypto.randomUUID(),
    who.id,
    "accounts",
    "activate_member",
    "accounts",
    id,
    "Aktivasi awal akun warga melalui superadmin staging"
  ).run();
  return json({ ok: true, message: "Akun warga berhasil diaktifkan.", username: account.username, passwordAwal: "1234" });
}
__name(activateMemberAccount, "activateMemberAccount");
async function resetMemberPassword(request,env,who) {
  let payload;
  try { payload=await requestJson(request) } catch { return safeError("Format permintaan tidak valid.",400) }
  if(payload?.confirmation!=="RESET PASSWORD WARGA") return safeError("Konfirmasi reset diperlukan.",400);
  const id=String(payload.accountId||"");
  if(!/^account:[A-Za-z0-9_-]{1,100}$/.test(id))return safeError("ID akun tidak valid.",400);
  const account=await env.DB.prepare(`SELECT a.id,a.username,a.role,a.status,a.password_scheme,
    m.status AS member_status FROM accounts a JOIN members m ON m.id=a.member_id
    WHERE a.id=? LIMIT 1`).bind(id).first();
  if(!account||account.role!=="anggota"||account.status!=="aktif"||account.member_status!=="aktif")
    return safeError("Akun anggota aktif tidak ditemukan.",404);
  if(account.password_scheme!=="pbkdf2-sha256")return safeError("Akun memerlukan pemeriksaan sebelum reset.",409);
  const hashed=await passwordHash("1234");
  await env.DB.batch([
    env.DB.prepare(`UPDATE accounts SET password_hash=?,password_scheme='pbkdf2-sha256',must_change_password=0,
      failed_attempts=0,locked_until=NULL,updated_at=CURRENT_TIMESTAMP
      WHERE id=? AND role='anggota' AND status='aktif'`).bind(hashed,id),
    env.DB.prepare("UPDATE sessions SET revoked_at=CURRENT_TIMESTAMP WHERE account_id=? AND revoked_at IS NULL").bind(id),
    env.DB.prepare(`INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason)
      VALUES(?,?,'accounts','reset_member_password','accounts',?,'Reset password awal oleh pengelola')`).bind(crypto.randomUUID(),who.id,id)
  ]);
  return json({ok:true,username:account.username,passwordAwal:"1234",message:"Password anggota direset dan semua sesi lamanya berakhir."});
}
__name(resetMemberPassword,"resetMemberPassword");
async function activateBankAdmin(request, env, who) {
  let payload;
  try {
    payload = await requestJson(request);
  } catch {
    return safeError("Format permintaan tidak valid.", 400);
  }
  const password = String(payload.password || "");
  if (payload.confirmation !== "AKTIFKAN ADMIN" || password.length < 4 || password.length > 128)
    return safeError("Konfirmasi dan password admin minimal 4 karakter diperlukan.", 400);
  const account = await env.DB.prepare("SELECT id,role,status,password_hash,password_scheme FROM accounts WHERE username=? LIMIT 1").bind("admin").first();
  if (!account || account.role !== "admin" || account.status !== "nonaktif" || account.password_hash || account.password_scheme !== "pending")
    return safeError("Akun admin tidak tersedia untuk aktivasi.", 409);
  const hashed = await passwordHash(password);
  const result = await env.DB.prepare(`UPDATE accounts SET password_hash=?,password_scheme='pbkdf2-sha256',
    status='aktif',must_change_password=0,failed_attempts=0,locked_until=NULL,
    updated_at=CURRENT_TIMESTAMP WHERE id=? AND role='admin' AND status='nonaktif'
    AND password_hash IS NULL AND password_scheme='pending'`).bind(hashed, account.id).run();
  if (result.meta?.changes !== 1) return safeError("Akun admin sudah diproses.", 409);
  await env.DB.prepare(`INSERT INTO audit_log
    (id,actor_account_id,scope,action,target_type,target_id,reason)
    VALUES (?,?,?,?,?,?,?)`).bind(
    crypto.randomUUID(),
    who.id,
    "accounts",
    "activate_admin",
    "accounts",
    account.id,
    "Aktivasi awal admin Bank Sampah melalui superadmin staging"
  ).run();
  return json({ ok: true, message: "Akun admin Bank Sampah berhasil diaktifkan." });
}
__name(activateBankAdmin, "activateBankAdmin");
function rupiahSaleLine(grams, rate) {
  if (!Number.isSafeInteger(grams) || grams <= 0 || grams > 1e9 || !Number.isSafeInteger(rate) || rate < 0 || rate > 1e7) throw new Error("Berat atau harga tidak valid");
  const raw = grams * rate;
  if (!Number.isSafeInteger(raw)) throw new Error("Nominal terlalu besar");
  return Math.round(raw / 1e3);
}
__name(rupiahSaleLine, "rupiahSaleLine");
function validatedSalePayload(input) {
  if (!input || typeof input !== "object") throw Error("Input tidak valid");
  if (typeof input.requestId !== "string" || !/^[a-f0-9-]{36}$/i.test(input.requestId)) throw Error("ID permintaan wajib berupa UUID");
  if (typeof input.batchId !== "string" || input.batchId.length > 100 || !input.batchId.trim()) throw Error("Batch tidak valid");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.soldOn || "")) throw Error("Tanggal tidak valid");
  if (!Array.isArray(input.lines) || !input.lines.length || input.lines.length > 30) throw Error("Masukkan 1\u201330 jenis barang");
  const seen = /* @__PURE__ */ new Set(), lines = [];
  for (const line of input.lines) {
    const item = String(line.itemId || "").trim();
    if (!item || item.length > 100 || seen.has(item)) throw Error("Jenis barang kosong atau ganda");
    seen.add(item);
    const grams = Number(line.grams), rate = Number(line.priceRpPerKg);
    lines.push({ item, grams, rate, total: rupiahSaleLine(grams, rate) });
  }
  const gross = lines.reduce((sum, l) => sum + l.total, 0);
  const received = Number(input.receivedRp);
  if (!Number.isSafeInteger(received) || received < 0 || received > gross) throw Error("Uang diterima di luar batas");
  const adjustment = String(input.adjustmentNote || "").trim();
  if (received !== gross && (!adjustment || adjustment.length > 300)) throw Error("Selisih uang wajib ada keterangan");
  const buyer = String(input.buyerName || "").trim();
  const receiptNo = String(input.receiptNo || "").trim();
  const evidenceUrl = String(input.evidenceUrl || "").trim();
  if (buyer.length > 100 || adjustment.length > 300) throw Error("Keterangan terlalu panjang");
  if (receiptNo.length > 80 || /[\x00-\x1F\x7F]/.test(receiptNo)) throw Error("Nomor nota maksimal 80 karakter tanpa baris baru");
  if (evidenceUrl && (evidenceUrl.length > 500 || !/^https:\/\//i.test(evidenceUrl))) throw Error("Link bukti harus HTTPS (maks. 500 karakter)");
  return { requestId: input.requestId, batchId: input.batchId, soldOn: input.soldOn, buyer, lines, gross, received, adjustment, receiptNo, evidenceUrl };
}
__name(validatedSalePayload, "validatedSalePayload");
async function salePreview(request, env, who) {
  const denied = requireRole(who, ["admin", "superadmin"]);
  if (denied) return denied;
  let input;
  try {
    input = validatedSalePayload(await requestJson(request));
  } catch (e) {
    return safeError(e.message, 400);
  }
  const batch = await env.DB.prepare("SELECT status FROM waste_batches WHERE id=?").bind(input.batchId).first();
  if (!batch || !["draft", "siap"].includes(batch.status)) return safeError("Batch tidak bisa digunakan untuk penjualan.", 409);
  const validItems = await env.DB.prepare("SELECT id FROM waste_items WHERE active=1").all();
  const itemIds = new Set((validItems.results || []).map((r) => r.id));
  if (input.lines.some((l) => !itemIds.has(l.item))) return safeError("Ada jenis barang tidak aktif.", 400);
  const prior = await env.DB.prepare("SELECT id FROM waste_sales WHERE batch_id=? AND status != 'dibatalkan' LIMIT 1").bind(input.batchId).first();
  if (prior) return safeError("Batch memiliki penjualan yang belum dibatalkan.", 409);
  return json({ ok: true, mode: "preview", batchId: input.batchId, lines: input.lines, grossRp: input.gross, receivedRp: input.received, differenceRp: input.gross - input.received, adjustmentNote: input.adjustment, status: "draft", note: "Pratinjau, tidak mengubah saldo." });
}
__name(salePreview, "salePreview");
async function saleCreateDraft(request, env, who) {
  const denied = requireRole(who, ["admin", "superadmin"]);
  if (denied) return denied;
  if (env.BANK_WRITE_ENABLED !== "true" || env.SALE_DRAFT_ENABLED !== "true") return safeError("Pencatatan draft penjualan Bank Sampah masih terkunci.", 503);
  let input;
  try {
    input = validatedSalePayload(await requestJson(request));
  } catch (e) {
    return safeError(e.message, 400);
  }
  const priorId = await env.DB.prepare("SELECT id FROM waste_sales WHERE id=?").bind(input.requestId).first();
  if (priorId) return safeError("Permintaan ini sudah dicatat.", 409);
  const batch = await env.DB.prepare("SELECT status FROM waste_batches WHERE id=?").bind(input.batchId).first();
  if (!batch || !["draft", "siap"].includes(batch.status)) return safeError("Batch tidak bisa dijual.", 409);
  const existing = await env.DB.prepare("SELECT id FROM waste_sales WHERE batch_id=? AND status != 'dibatalkan' LIMIT 1").bind(input.batchId).first();
  if (existing) return safeError("Penjualan aktif untuk batch ini sudah ada.", 409);
  const catalog = await env.DB.prepare("SELECT id FROM waste_items WHERE active=1").all();
  const permitted = new Set((catalog.results || []).map((r) => r.id));
  if (input.lines.some((l) => !permitted.has(l.item))) return safeError("Jenis barang tidak aktif.", 400);
  const sql = [env.DB.prepare("INSERT INTO waste_sales(id,batch_id,sold_on,buyer_name,amount_gross_rp,amount_received_rp,status,created_by) VALUES(?,?,?,?,?,?,'draft',?)").bind(input.requestId, input.batchId, input.soldOn, input.buyer || null, input.gross, input.received, who.id)];
  for (const l of input.lines) {
    sql.push(env.DB.prepare("INSERT INTO waste_sale_lines(id,sale_id,waste_item_id,grams,actual_rate_rp_per_kg,total_rp) VALUES(?,?,?,?,?,?)").bind(crypto.randomUUID(), input.requestId, l.item, l.grams, l.rate, l.total));
  }
  if (input.receiptNo || input.evidenceUrl) {
    sql.push(env.DB.prepare("INSERT INTO waste_sale_receipts(sale_id,receipt_no,evidence_url,updated_by) VALUES(?,?,?,?)")
      .bind(input.requestId,input.receiptNo,input.evidenceUrl,who.id));
  }
  sql.push(env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(), who.id, "banksampah", "create_sale_draft", "waste_sales", input.requestId, input.adjustment || "Penjualan tanpa penyesuaian", JSON.stringify({ grossRp: input.gross, receivedRp: input.received, lineCount: input.lines.length, receiptNo: input.receiptNo, evidenceUrl: input.evidenceUrl })));
  await env.DB.batch(sql);
  return json({ ok: true, id: input.requestId, status: "draft", grossRp: input.gross, receivedRp: input.received, confirmed: false });
}
__name(saleCreateDraft, "saleCreateDraft");
// Metadata bukti fisik dapat dilengkapi setelah penjualan tercatat, termasuk
// sesudah rekonsiliasi. Tidak mengubah nominal, status, tanggal, atau barang.
async function bankUpdateSaleReceipt(request,env,who) {
  const denied=requireRole(who,["admin","superadmin"]);
  if(denied)return denied;
  if(env.BANK_WRITE_ENABLED!=="true")return safeError("Pengelolaan nota penjualan belum diaktifkan.",503);
  let data;
  try{data=await requestJson(request)}catch(e){return safeError("Input nota tidak valid.",400)}
  const saleId=String(data?.saleId||"").trim();
  const receiptNo=String(data?.receiptNo||"").trim();
  const evidenceUrl=String(data?.evidenceUrl||"").trim();
  if(!saleId||saleId.length>128||/[\x00-\x1F\x7F]/.test(saleId))return safeError("Referensi penjualan tidak valid.",400);
  if(receiptNo.length>80||/[\x00-\x1F\x7F]/.test(receiptNo))return safeError("Nomor nota terlalu panjang atau tidak valid.",400);
  if(evidenceUrl&&(evidenceUrl.length>500||!/^https:\/\//i.test(evidenceUrl)))return safeError("Link bukti harus HTTPS, maksimal 500 karakter.",400);
  const prev=await env.DB.prepare(`SELECT s.status,COALESCE(r.receipt_no,'') AS receipt_no,COALESCE(r.evidence_url,'') AS evidence_url
    FROM waste_sales s LEFT JOIN waste_sale_receipts r ON r.sale_id=s.id WHERE s.id=?`).bind(saleId).first();
  if(!prev)return safeError("Penjualan tidak ditemukan.",404);
  if(prev.status==="dibatalkan")return safeError("Nomor nota transaksi batal tidak boleh diubah.",409);
  if(prev.receipt_no===receiptNo&&prev.evidence_url===evidenceUrl)
    return json({ok:true,id:saleId,receiptNo,evidenceUrl,unchanged:true});
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO waste_sale_receipts(sale_id,receipt_no,evidence_url,updated_by)
      VALUES(?,?,?,?) ON CONFLICT(sale_id) DO UPDATE SET receipt_no=excluded.receipt_no,
      evidence_url=excluded.evidence_url,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`)
      .bind(saleId,receiptNo,evidenceUrl,who.id),
    env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,before_json,after_json) VALUES(?,?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(),who.id,"banksampah","update_sale_receipt","waste_sales",saleId,
        "Koreksi nomor nota / bukti fisik",
        JSON.stringify({receiptNo:prev.receipt_no,evidenceUrl:prev.evidence_url}),
        JSON.stringify({receiptNo,evidenceUrl}))
  ]);
  return json({ok:true,id:saleId,receiptNo,evidenceUrl,message:"Nomor nota dan bukti penjualan diperbarui tanpa mengubah transaksi."});
}
__name(bankUpdateSaleReceipt, "bankUpdateSaleReceipt");
var rupiah = /* @__PURE__ */ __name((v) => Number.isSafeInteger(v) && v >= 0 && v <= 1e12, "rupiah");
// Satu aturan D1 untuk semua pengesahan baru. Transaksi yang sudah sah tetap utuh.
const F4_BANK_SPLIT_KEY="BANK_WARGA_PERCENT";
async function getBankSplitPolicy(db){
 const row=await one(db,"SELECT setting_value,updated_at FROM app_settings WHERE setting_key=?",[F4_BANK_SPLIT_KEY]);
 const raw=row?.setting_value, percent=raw===undefined||raw===null?50:Number(raw);
 if(!Number.isSafeInteger(percent)||percent<1||percent>99)throw Error("Aturan pembagian hasil tidak valid. Hubungi Superadmin.");
 return {wargaPercent:percent,lingkunganPercent:100-percent,updatedAt:row?.updated_at||null};
}
__name(getBankSplitPolicy,"getBankSplitPolicy");
async function saveBankSplitPolicy(request,env,who){
 const denied=requireRole(who,["superadmin"]);if(denied)return denied;
 let payload;try{payload=await requestJson(request)}catch{return safeError("Data persentase tidak dapat dibaca.",400)}
 const percent=payload?.wargaPercent;
 if(!Number.isSafeInteger(percent)||percent<1||percent>99)return safeError("Porsi warga harus bilangan bulat 1 sampai 99 persen.",400);
 const previous=await getBankSplitPolicy(env.DB);
 if(previous.wargaPercent===percent)return json({ok:true,...previous,unchanged:true});
 try{
  await env.DB.batch([
   env.DB.prepare(`INSERT INTO app_settings(setting_key,setting_value,description,updated_at,updated_by) VALUES(?,?,?,CURRENT_TIMESTAMP,?)
      ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value,description=excluded.description,
      updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by`)
     .bind(F4_BANK_SPLIT_KEY,String(percent),"Porsi warga dari penjualan Bank Sampah; sisanya untuk lingkungan",who.id),
   env.DB.prepare(`INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,before_json,after_json)
      VALUES(?,?,'banksampah','ubah_bagi_hasil','app_settings',?,?,?)`)
     .bind("audit:bank-split:"+crypto.randomUUID(),who.id,F4_BANK_SPLIT_KEY,JSON.stringify(previous),
      JSON.stringify({wargaPercent:percent,lingkunganPercent:100-percent,berlaku:"pengesahan baru"}))
  ]);
  return json({ok:true,...await getBankSplitPolicy(env.DB)});
 }catch{return safeError("Aturan bagi hasil gagal disimpan. Pengaturan lama tetap berlaku.",409)}
}
__name(saveBankSplitPolicy,"saveBankSplitPolicy");
// Hak tabungan dikonfirmasi dari uang hasil penjualan nyata, BUKAN nilai estimasi.
// Pembulatan deterministik: warga floor(hasil × persentase / 100), sisa ke lingkungan.
// Pembagian per warga memakai bobot estimasi historis; largest remainder menjaga total tepat.
function bankSplitRights(received, weights, wargaPercent) {
  if(!Number.isSafeInteger(wargaPercent)||wargaPercent<1||wargaPercent>99)throw Error('Porsi warga tidak valid');
  if (!Number.isSafeInteger(received) || received <= 0 || received > 1e12) throw Error("Uang penjualan tidak valid");
  const citizenRightsRp = Number(BigInt(received)*BigInt(wargaPercent)/100n);
  const environmentRp = received - citizenRightsRp;
  const sorted = weights.slice().sort((a,b)=>a.memberId.localeCompare(b.memberId));
  const total = sorted.reduce((sum,w)=>sum+BigInt(w.weightRp),0n);
  if (total <= 0n) throw Error("Bobot estimasi setoran tidak tersedia");
  const unit = BigInt(citizenRightsRp);
  const rights = sorted.map(w=>{
    const numerator=unit*BigInt(w.weightRp);
    return {memberId:w.memberId, amountRp:Number(numerator/total), remainder:numerator%total};
  });
  const allocated = rights.reduce((n,r)=>n+r.amountRp,0);
  const remainderCount = citizenRightsRp - allocated;
  const ranked = rights.slice().sort((a,b)=>{
    if (a.remainder===b.remainder) return a.memberId.localeCompare(b.memberId);
    return a.remainder>b.remainder?-1:1;
  });
  for(let i=0;i<remainderCount;i++) ranked[i].amountRp++;
  return {citizenRightsRp,environmentRp,rights:rights.map(({memberId,amountRp})=>({memberId,amountRp}))};
}
__name(bankSplitRights,"bankSplitRights");
async function reconcilePreview(db, batchId) {
  if (!batchId || typeof batchId!=="string" || batchId.length>120) throw Error("ID batch tidak valid");
  const batch = await one(db,"SELECT id,status FROM waste_batches WHERE id=?",[batchId]);
  if (!batch || !["draft","siap"].includes(batch.status)) throw Error("Batch tidak dapat direkonsiliasi");
  if (await one(db,"SELECT id FROM waste_allocations WHERE batch_id=?",[batchId])) throw Error("Batch sudah direkonsiliasi");
  const sales = await list(db,"SELECT id,status,sold_on,amount_received_rp,amount_gross_rp FROM waste_sales WHERE batch_id=? AND status!='dibatalkan'",[batchId]);
  if (sales.length!==1 || sales[0].status!=="draft") throw Error("Diperlukan tepat satu draft penjualan");
  const sale=sales[0];
  const lock = await one(db,"SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year=?",[Number(sale.sold_on?.slice(0,4))]);
  if (lock) throw Error("Tahun penjualan sudah ditutup");
  const lineStats=await one(db,"SELECT COUNT(*) n,COALESCE(SUM(total_rp),0) amount,COALESCE(SUM(grams),0) grams FROM waste_sale_lines WHERE sale_id=?",[sale.id]);
  if (!lineStats?.n || Number(lineStats.amount)!==Number(sale.amount_gross_rp) || !Number.isSafeInteger(sale.amount_received_rp) || sale.amount_received_rp>sale.amount_gross_rp) throw Error("Total rincian penjualan tidak konsisten");
  const deposits=await list(db,"SELECT id,member_id,estimated_total_rp,total_grams,deposited_on FROM waste_deposits WHERE batch_id=? AND status='estimasi' ORDER BY id",[batchId]);
  if (!deposits.length) throw Error("Setoran estimasi tidak ditemukan");
  const confirmed=await one(db,"SELECT COUNT(*) n FROM waste_deposits WHERE batch_id=? AND status='terkonfirmasi'",[batchId]);
  if (Number(confirmed?.n)) throw Error("Batch sudah memuat setoran terkonfirmasi");
  const details=await list(db,"SELECT d.id,COALESCE(SUM(l.grams),0) grams,COALESCE(SUM(l.estimated_rp),0) amount FROM waste_deposits d LEFT JOIN waste_deposit_lines l ON l.deposit_id=d.id WHERE d.batch_id=? AND d.status='estimasi' GROUP BY d.id",[batchId]);
  const byDeposit=new Map(details.map(x=>[x.id,x]));
  const weights=new Map();
  for(const d of deposits){
    if(await one(db,"SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year=?",[Number(d.deposited_on.slice(0,4))])) throw Error("Tahun setoran sudah ditutup");
    const row=byDeposit.get(d.id);
    if(!row || row.grams!==d.total_grams || row.amount!==d.estimated_total_rp || !Number.isSafeInteger(d.total_grams) || d.total_grams<=0 || !rupiah(d.estimated_total_rp)) throw Error("Rincian setoran dan total tidak sesuai");
    weights.set(d.member_id,(weights.get(d.member_id)||0)+d.estimated_total_rp);
  }
  // Berat yang dijual setiap kategori tidak boleh melampaui kategori dari setoran batch.
  const excess=await list(db,`SELECT sl.waste_item_id, SUM(sl.grams) sale_grams,COALESCE((
    SELECT SUM(dl.grams) FROM waste_deposit_lines dl JOIN waste_deposits d ON d.id=dl.deposit_id
    WHERE d.batch_id=? AND d.status='estimasi' AND dl.waste_item_id=sl.waste_item_id),0) deposit_grams
    FROM waste_sale_lines sl WHERE sl.sale_id=? GROUP BY sl.waste_item_id`,[batchId,sale.id]);
  if(excess.some(x=>x.sale_grams>x.deposit_grams || x.sale_grams<=0)) throw Error("Berat penjualan melebihi atau tidak sesuai setoran per kategori");
  const policy=await getBankSplitPolicy(db);
  const split=bankSplitRights(sale.amount_received_rp,[...weights].map(([memberId,weightRp])=>({memberId,weightRp})),policy.wargaPercent);
  return {batchId,saleId:sale.id,receivedRp:sale.amount_received_rp,grossRp:sale.amount_gross_rp,
    estimatedRp:[...weights.values()].reduce((a,b)=>a+b,0),
    citizenRightsRp:split.citizenRightsRp,environmentRp:split.environmentRp,
    wargaPercent:policy.wargaPercent,lingkunganPercent:policy.lingkunganPercent,
    remainingRp:split.environmentRp,rights:split.rights,depositIds:deposits.map(x=>x.id),
    warning:"Konfirmasi akan mengunci batch dan membagi hasil "+policy.wargaPercent+":"+policy.lingkunganPercent+" dari uang diterima; estimasi awal bukan saldo siap cair."};
}
__name(reconcilePreview,"reconcilePreview");

// Pencairan tabungan hanya dari hak warga yang telah terkonfirmasi.
async function bankWithdraw(request,env,who){
  const denied=requireRole(who,["admin","superadmin"]);if(denied)return denied;
  if(env.BANK_WRITE_ENABLED!=="true" || env.BANK_PAYOUT_WRITE_ENABLED!=="true") return safeError("Pencairan tabungan masih terkunci.",503);
  let p;try{p=await requestJson(request)}catch(e){return safeError("JSON tidak valid.",400)}
  const key=String(p.requestKey||""),memberId=String(p.memberId||""),on=String(p.withdrawnOn||""),amount=p.amountRp;
  if(!/^[A-Za-z0-9_-]{16,100}$/.test(key)||!memberId||memberId.length>128||!validDateOnly(on)||!validRupiah(amount)) return safeError("requestKey, anggota, tanggal atau nominal pencairan tidak valid.",400);
  const hash=await sha(JSON.stringify({memberId,on,amount}));
  const previous=await one(env.DB,"SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='bank_withdrawal' AND source_row_key=? AND target_table='waste_savings_ledger'",[key]);
  if(previous){if(previous.source_fingerprint!==hash)return safeError("requestKey digunakan untuk transaksi berbeda.",409);return json({ok:true,id:previous.target_id,duplicate:true})}
  if(await one(env.DB,"SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year=?",[Number(on.slice(0,4))])) return safeError("Tahun sudah ditutup.",409);
  if(!await one(env.DB,"SELECT id FROM members WHERE id=? AND status='aktif'",[memberId])) return safeError("Anggota tidak aktif atau tidak ditemukan.",404);
  const id="withdraw:bank:"+crypto.randomUUID(),note=String(p.note||"").trim().slice(0,250);
  const stmts=[
    env.DB.prepare("INSERT INTO migration_source_map(source_system,source_sheet,source_row_key,target_table,target_id,source_fingerprint) VALUES('api_v2','bank_withdrawal',?,'waste_savings_ledger',?,?)").bind(key,id,hash),
    // CASE returns zero if insufficient; CHECK(amount_rp>0) aborts entire D1.batch transaction.
    env.DB.prepare(`INSERT INTO waste_savings_ledger(id,member_id,transaction_on,kind,amount_rp,reference_id,note,created_by)
      VALUES(?,?,?,'pencairan',CASE WHEN (SELECT COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit') THEN amount_rp ELSE -amount_rp END),0) FROM waste_savings_ledger WHERE member_id=?)>=? THEN ? ELSE 0 END,?,?,?)`).bind(id,memberId,on,memberId,amount,amount,key,note||"Pencairan tabungan warga",who.id),
    env.DB.prepare(`INSERT INTO waste_cash_ledger(id,occurred_on,source_transaction_id,transaction_type,fund_position,cash_in_rp,cash_out_rp,status,note)
      VALUES(?,?,?,'pencairan_tabungan','tabungan_warga',0,
      CASE WHEN (SELECT COALESCE(SUM(cash_in_rp-cash_out_rp),0) FROM waste_cash_ledger WHERE status='aktif' AND fund_position='tabungan_warga')>=? THEN ? ELSE 0 END,
      'aktif',?)`).bind("cash:"+id,on,id,amount,amount,note||"Pencairan tabungan warga"),
    env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'banksampah','withdraw_savings','waste_savings_ledger',?,?,?)").bind("audit:"+id,who.id,id,note||"Pencairan tabungan",JSON.stringify({memberId,amountRp:amount,withdrawnOn:on}))
  ];
  try{await env.DB.batch(stmts)}catch(e){
    const latest=await one(env.DB,"SELECT target_id,source_fingerprint FROM migration_source_map WHERE source_system='api_v2' AND source_sheet='bank_withdrawal' AND source_row_key=? AND target_table='waste_savings_ledger'",[key]);
    if(latest){if(latest.source_fingerprint===hash)return json({ok:true,id:latest.target_id,duplicate:true});return safeError("requestKey digunakan untuk transaksi berbeda.",409)}
    return safeError("Pencairan ditolak: saldo terkonfirmasi tidak cukup atau transaksi tidak valid.",409);
  }
  return json({ok:true,id,memberId,amountRp:amount,withdrawnOn:on,duplicate:false},201);
}
__name(bankWithdraw,"bankWithdraw");
async function bankReconcileConfirm(request,env,who){
  const denied=requireRole(who,["admin","superadmin"]);
  if(denied)return denied;
  if(env.BANK_WRITE_ENABLED!=="true" || env.BANK_RECONCILIATION_WRITE_ENABLED!=="true") return safeError("Pengesahan Bank Sampah masih terkunci.",503);
  let p;try{p=await requestJson(request)}catch(e){return safeError("JSON tidak valid.",400)}
  const batchId=String(p.batchId||""),expectedSaleId=String(p.saleId||"");
  const operationRp=p.operationRp, neighborhoodRp=p.neighborhoodRp, reserveRp=p.reserveRp ?? 0;
  if(!batchId || batchId.length>120 || !expectedSaleId || expectedSaleId.length>120 || !Number.isSafeInteger(operationRp) || operationRp<0 || !Number.isSafeInteger(neighborhoodRp) || neighborhoodRp<0 || !Number.isSafeInteger(reserveRp) || reserveRp<0) return safeError("Wajib mengirim batchId, saleId, operationRp dan neighborhoodRp yang valid.",400);
  const existing=await one(env.DB,"SELECT a.*,s.id sale_id FROM waste_allocations a JOIN waste_sales s ON s.batch_id=a.batch_id AND s.status='terkonfirmasi' WHERE a.batch_id=?",[batchId]);
  if(existing){
    if(existing.sale_id===expectedSaleId && existing.operation_rp===operationRp && existing.neighborhood_rp===neighborhoodRp && existing.reserve_rp===reserveRp) return json({ok:true,batchId,status:"disahkan",duplicate:true,receivedRp:existing.received_rp,citizenRightsRp:existing.citizen_rights_rp});
    return safeError("Batch sudah pernah disahkan dengan alokasi lain.",409);
  }
  let preview;try{preview=await reconcilePreview(env.DB,batchId)}catch(e){return safeError(String(e.message||"Rekonsiliasi gagal"),409)}
  if(preview.saleId!==expectedSaleId || operationRp+neighborhoodRp+reserveRp!==preview.environmentRp) return safeError("ID penjualan atau pembagian lingkungan berbeda dari pratinjau.",409);
  if(p.expectedWargaPercent!==undefined && p.expectedWargaPercent!==preview.wargaPercent)
    return safeError("Persentase telah berubah. Muat ulang pratinjau sebelum mengesahkan.",409);
  const auditId="audit:bank-confirm:"+expectedSaleId;
  const allocId="alloc:bank:"+batchId;
  const date=String((await one(env.DB,"SELECT sold_on FROM waste_sales WHERE id=?",[expectedSaleId])).sold_on);
  const stmts=[
    // Check statuses inside the same transaction; otherwise the CHECK constraint aborts the batch.
    env.DB.prepare("INSERT INTO waste_allocations(id,batch_id,received_rp,citizen_rights_rp,reserve_rp,neighborhood_rp,operation_rp,adjustment_rp) VALUES(?,?,?,CASE WHEN EXISTS(SELECT 1 FROM waste_batches WHERE id=? AND status IN ('draft','siap')) AND EXISTS(SELECT 1 FROM waste_sales WHERE id=? AND batch_id=? AND status='draft') AND COALESCE((SELECT CAST(setting_value AS INTEGER) FROM app_settings WHERE setting_key='BANK_WARGA_PERCENT'),50)=? THEN ? ELSE -1 END,?,?,?,0)").bind(allocId,batchId,preview.receivedRp,batchId,expectedSaleId,batchId,preview.wargaPercent,preview.citizenRightsRp,reserveRp,neighborhoodRp,operationRp),
    env.DB.prepare("UPDATE waste_sales SET status='terkonfirmasi' WHERE id=? AND batch_id=? AND status='draft'").bind(expectedSaleId,batchId),
    env.DB.prepare("UPDATE waste_batches SET status='disahkan',confirmed_at=CURRENT_TIMESTAMP,confirmed_by=? WHERE id=? AND status IN ('draft','siap')").bind(who.id,batchId),
    ...preview.depositIds.map(id=>env.DB.prepare("UPDATE waste_deposits SET status='terkonfirmasi' WHERE id=? AND batch_id=? AND status='estimasi'").bind(id,batchId)),
    ...preview.rights.filter(r=>r.amountRp>0).map(r=>env.DB.prepare("INSERT INTO waste_savings_ledger(id,member_id,transaction_on,kind,amount_rp,batch_id,reference_id,note,created_by) VALUES(?,?,?,'kredit',?,?,?,?,?)").bind("bank-right:"+expectedSaleId+":"+r.memberId,r.memberId,date,r.amountRp,batchId,expectedSaleId+":"+r.memberId,"Hak tabungan "+preview.wargaPercent+"% dari penjualan",who.id)),
    ...[["tabungan_warga",preview.citizenRightsRp],["operasional",operationRp],["kas_lorong",neighborhoodRp],["cadangan",reserveRp]].filter(([_,amount])=>amount>0).map(([fund,amount])=>env.DB.prepare("INSERT INTO waste_cash_ledger(id,occurred_on,source_transaction_id,transaction_type,fund_position,cash_in_rp,cash_out_rp,status,note) VALUES(?,?,?,'penjualan_terkonfirmasi',?,?,0,'aktif',?)").bind("bank-sale-cash:"+expectedSaleId+":"+fund,date,expectedSaleId,fund,amount,"Pembagian hasil penjualan batch "+batchId)),
    env.DB.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?, 'banksampah','confirm_reconciliation','waste_batches',?,?,?)").bind(auditId,who.id,batchId,"Konfirmasi pembagian "+preview.wargaPercent+":"+preview.lingkunganPercent,JSON.stringify({wargaPercent:preview.wargaPercent,lingkunganPercent:preview.lingkunganPercent,saleId:expectedSaleId,receivedRp:preview.receivedRp,citizenRightsRp:preview.citizenRightsRp,operationRp,neighborhoodRp,reserveRp,rights:preview.rights}))
  ];
  try{
    const r=await env.DB.batch(stmts); // Cloudflare D1.batch: satu transaksi, gagal => seluruh perubahan rollback
    const checks=r.slice(1,3+preview.depositIds.length);
    if(checks.some(x=>Number(x?.meta?.changes||0)!==1)){
      // This indicates a concurrent/manual mutation; do not falsely claim success.
      return safeError("Hasil pembaruan perlu diverifikasi ulang sebelum digunakan.",409);
    }
  }catch(e){
    const latest=await one(env.DB,"SELECT id,received_rp,citizen_rights_rp,operation_rp,neighborhood_rp FROM waste_allocations WHERE batch_id=?",[batchId]);
    if(latest && latest.received_rp===preview.receivedRp && latest.operation_rp===operationRp && latest.neighborhood_rp===neighborhoodRp && latest.reserve_rp===reserveRp) return json({ok:true,batchId,status:"disahkan",duplicate:true});
    return safeError("Rekonsiliasi gagal; seluruh perubahan transaksi ditolak.",409);
  }
  return json({ok:true,batchId,saleId:expectedSaleId,status:"disahkan",receivedRp:preview.receivedRp,citizenRightsRp:preview.citizenRightsRp,wargaPercent:preview.wargaPercent,lingkunganPercent:preview.lingkunganPercent,operationRp,neighborhoodRp,reserveRp,rights:preview.rights},201);
}
__name(bankReconcileConfirm,"bankReconcileConfirm");

// Koreksi pengesahan hanya untuk batch API D1 baru, sebelum ada pencairan atau
// arus kas keluar. Hak warga dibalik melalui jurnal koreksi; histori asli tetap utuh.
// Satu DB.batch atomik: kegagalan pada jurnal koreksi membatalkan SEMUA perintah.
async function bankReverseConfirmed(request,env,who){
  const denied=requireRole(who,["admin","superadmin"]);if(denied)return denied;
  if(env.BANK_WRITE_ENABLED!=="true"||env.BANK_CANCEL_WRITE_ENABLED!=="true"||env.BANK_RECONCILIATION_WRITE_ENABLED!=="true")
    return safeError("Pembatalan pengesahan belum diaktifkan.",503);
  let input;try{input=await requestJson(request)}catch{return safeError("JSON pembatalan tidak valid.",400)}
  const batchId=String(input?.batch||""),confirmation=String(input?.konfirmasi||""),reason=String(input?.alasan||"").trim(),db=env.DB;
  if(!batchId||batchId.length>120||confirmation!==batchId||reason.length<10||reason.length>300)
    return safeError("Ketik ID batch dan alasan pembatalan 10–300 karakter.",400);
  const batch=await one(db,"SELECT id,status FROM waste_batches WHERE id=?",[batchId]);
  if(!batch)return safeError("Batch tidak ditemukan.",404);
  const auditKey="audit:bank-reverse:"+batchId;
  if(batch.status==="dibatalkan"){
    const done=await one(db,"SELECT id FROM audit_log WHERE id=?",[auditKey]);
    return done?json({ok:true,batch:batchId,status:"dibatalkan",duplicate:true}):
      safeError("Batch sudah dibatalkan di luar alur koreksi terverifikasi.",409);
  }
  if(batch.status!=="disahkan")return safeError("Hanya batch yang telah disahkan dapat dibalik.",409);
  const [sale,allocation,deposits]=await Promise.all([
    one(db,"SELECT id,sold_on,status,amount_received_rp FROM waste_sales WHERE batch_id=? AND status='terkonfirmasi' LIMIT 1",[batchId]),
    one(db,"SELECT * FROM waste_allocations WHERE id=? AND batch_id=?",["alloc:bank:"+batchId,batchId]),
    list(db,"SELECT id,deposited_on,status FROM waste_deposits WHERE batch_id=? ORDER BY id",[batchId])
  ]);
  if(!sale||!allocation||!deposits.length||deposits.some(x=>x.status!=="terkonfirmasi"||!x.id.startsWith("deposit:api:")))
    return safeError("Hanya pengesahan D1 baru yang utuh dapat dibatalkan otomatis; transaksi historis memerlukan audit.",409);
  const allSales=await one(db,"SELECT COUNT(*) AS n FROM waste_sales WHERE batch_id=?",[batchId]);
  if(Number(allSales?.n)!==1)return safeError("Batch memiliki lebih dari satu riwayat penjualan; audit manual diperlukan.",409);
  if(Number(allocation.received_rp)!==Number(sale.amount_received_rp) || !Number.isSafeInteger(allocation.citizen_rights_rp) || allocation.citizen_rights_rp<=0)
    return safeError("Nominal alokasi tidak sesuai dengan penjualan; pembatalan ditolak.",409);
  const amounts={
    tabungan_warga:Number(allocation.citizen_rights_rp),
    operasional:Number(allocation.operation_rp),
    kas_lorong:Number(allocation.neighborhood_rp),
    cadangan:Number(allocation.reserve_rp)
  };
  if(Object.values(amounts).some(n=>!Number.isSafeInteger(n)||n<0)||
     Object.values(amounts).reduce((a,b)=>a+b,0)!==Number(allocation.received_rp))
    return safeError("Pos kas pengesahan tidak seimbang.",409);
  const years=[...new Set([sale.sold_on,...deposits.map(x=>x.deposited_on)].map(d=>Number(String(d).slice(0,4))))];
  const locks=await db.prepare(`SELECT fiscal_year FROM fiscal_closings WHERE fiscal_year IN (${years.map(()=>"?").join(",")}) LIMIT 1`).bind(...years).first();
  if(locks)return safeError("Tahun transaksi sudah ditutup.",409);
  const credits=await list(db,"SELECT id,member_id,amount_rp FROM waste_savings_ledger WHERE batch_id=? AND kind='kredit' ORDER BY id",[batchId]);
  if(!credits.length||credits.some(x=>x.id!=="bank-right:"+sale.id+":"+x.member_id||!Number.isSafeInteger(x.amount_rp)||x.amount_rp<=0)||
     credits.reduce((n,x)=>n+x.amount_rp,0)!==amounts.tabungan_warga)
    return safeError("Hak tabungan pengesahan tidak cocok dengan alokasi.",409);
  const cash=await list(db,"SELECT id,transaction_type,fund_position,cash_in_rp,cash_out_rp,status FROM waste_cash_ledger WHERE source_transaction_id=? ORDER BY id",[sale.id]);
  const expectedCash=Object.entries(amounts).filter(([,value])=>value>0);
  if(cash.length!==expectedCash.length||cash.some(x=>x.id!=="bank-sale-cash:"+sale.id+":"+x.fund_position||
     x.transaction_type!=="penjualan_terkonfirmasi"||x.status!=="aktif"||Number(x.cash_out_rp)!==0||
     Number(x.cash_in_rp)!==amounts[x.fund_position]))
    return safeError("Jurnal kas pengesahan tidak utuh atau telah berubah.",409);
  const memberIds=credits.map(x=>x.member_id);
  const payoutQuery=`SELECT id FROM waste_savings_ledger WHERE member_id IN (${memberIds.map(()=>"?").join(",")}) AND kind='pencairan' LIMIT 1`;
  if(await db.prepare(payoutQuery).bind(...memberIds).first())
    return safeError("Pembatalan ditolak: salah satu warga sudah melakukan pencairan tabungan; perlukan audit manual.",409);
  const outgoing=await one(db,"SELECT id FROM waste_cash_ledger WHERE status='aktif' AND cash_out_rp>0 AND occurred_on>=? LIMIT 1",[sale.sold_on]);
  if(outgoing)return safeError("Pembatalan ditolak: terdapat arus kas keluar setelah tanggal penjualan.",409);
  for(const [fund,originalAmount] of expectedCash){
    const cashBalance=await one(db,"SELECT COALESCE(SUM(cash_in_rp-cash_out_rp),0) AS balance FROM waste_cash_ledger WHERE status='aktif' AND fund_position=?",[fund]);
    if(Number(cashBalance?.balance)<originalAmount)return safeError("Dana pos "+fund+" tidak mencukupi untuk pembalikan pengesahan.",409);
  }
  for(const credit of credits){
    const current=await one(db,`SELECT COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit') THEN amount_rp ELSE -amount_rp END),0) AS balance
      FROM waste_savings_ledger WHERE member_id=?`,[credit.member_id]);
    if(Number(current?.balance)<credit.amount_rp)return safeError("Saldo tabungan warga tidak cukup untuk koreksi.",409);
  }
  // Semua invariant kritis diulang di dalam INSERT transaksional melalui CHECK(amount_rp>0).
  // Seluruh koreksi dibatalkan bila status/arus kas berubah sejak pratinjau.
  const fundGuards=expectedCash.map(([fund,value])=>
    "(SELECT COALESCE(SUM(cash_in_rp-cash_out_rp),0) FROM waste_cash_ledger WHERE status='aktif' AND fund_position='"+fund+"')>="+value).join(" AND ");
  const guard=`(SELECT status FROM waste_batches WHERE id=?)='disahkan'
       AND (SELECT status FROM waste_sales WHERE id=?)='terkonfirmasi'
       AND NOT EXISTS(SELECT 1 FROM waste_cash_ledger WHERE status='aktif' AND cash_out_rp>0 AND occurred_on>=?)
       AND NOT EXISTS(SELECT 1 FROM waste_savings_ledger WHERE kind='pencairan' AND member_id IN (${memberIds.map(()=>"?").join(",")}))
       AND ${fundGuards}`;
  const reversalDate=new Date(Date.now()+7*3600000).toISOString().slice(0,10);
  const stmts=credits.map(credit=>
    db.prepare(`INSERT INTO waste_savings_ledger(id,member_id,transaction_on,kind,amount_rp,batch_id,reference_id,note,created_by)
      VALUES(?,?,?,'koreksi_debit',
       CASE WHEN ${guard} AND (SELECT COALESCE(SUM(CASE WHEN kind IN ('kredit','koreksi_kredit') THEN amount_rp ELSE -amount_rp END),0)
         FROM waste_savings_ledger WHERE member_id=?)>=? THEN ? ELSE 0 END,?,?,?,?)`)
      .bind("bank-reverse:"+sale.id+":"+credit.member_id,credit.member_id,reversalDate,
        batchId,sale.id,sale.sold_on,...memberIds,credit.member_id,credit.amount_rp,credit.amount_rp,
        batchId,sale.id+":"+credit.member_id,"Koreksi hak tabungan pengesahan dibatalkan: "+reason,who.id));
  stmts.push(
    db.prepare("UPDATE waste_cash_ledger SET status='dibatalkan' WHERE source_transaction_id=? AND transaction_type='penjualan_terkonfirmasi' AND status='aktif'").bind(sale.id),
    db.prepare("UPDATE waste_deposits SET status='dibatalkan' WHERE batch_id=? AND status='terkonfirmasi'").bind(batchId),
    db.prepare("UPDATE waste_sales SET status='dibatalkan' WHERE id=? AND batch_id=? AND status='terkonfirmasi'").bind(sale.id,batchId),
    db.prepare("UPDATE waste_batches SET status='dibatalkan' WHERE id=? AND status='disahkan'").bind(batchId),
    db.prepare("INSERT INTO audit_log(id,actor_account_id,scope,action,target_type,target_id,reason,after_json) VALUES(?,?,'banksampah','reverse_confirmed_batch','waste_batches',?,?,?)")
      .bind(auditKey,who.id,batchId,reason,JSON.stringify({saleId:sale.id,creditRp:amounts.tabungan_warga,cashReversed:amounts,memberCount:credits.length}))
  );
  try{
    const results=await db.batch(stmts);
    const cashUpdate=results[credits.length],depositUpdate=results[credits.length+1],saleUpdate=results[credits.length+2],batchUpdate=results[credits.length+3];
    if(Number(cashUpdate?.meta?.changes)!==cash.length||Number(depositUpdate?.meta?.changes)!==deposits.length||
       Number(saleUpdate?.meta?.changes)!==1||Number(batchUpdate?.meta?.changes)!==1)
      return safeError("Pembatalan tercatat, tetapi status akhir perlu diverifikasi sebelum transaksi lanjutan.",409);
  }catch{
    const latest=await one(db,"SELECT status FROM waste_batches WHERE id=?",[batchId]);
    if(latest?.status==="dibatalkan"&&await one(db,"SELECT id FROM audit_log WHERE id=?",[auditKey]))
      return json({ok:true,batch:batchId,status:"dibatalkan",duplicate:true});
    return safeError("Pembatalan ditolak, tidak ada koreksi parsial yang disimpan.",409);
  }
  return json({ok:true,batch:batchId,status:"dibatalkan",rightsReversedRp:amounts.tabungan_warga,
    cashReversedRp:Number(allocation.received_rp),duplicate:false},200);
}
__name(bankReverseConfirmed,"bankReverseConfirmed");

function validDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = /* @__PURE__ */ new Date(value + "T00:00:00Z");
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
__name(validDateOnly, "validDateOnly");
function validRupiah(value) {
  return Number.isSafeInteger(value) && value > 0 && value <= 1e12;
}
__name(validRupiah, "validRupiah");
async function listCashTransactions(db, request) {
  const params = new URL(request.url).searchParams;
  const from = params.get("from"), to = params.get("to");
  if (from && !validDateOnly(from) || to && !validDateOnly(to) || from && to && from > to) return safeError("Rentang tanggal tidak valid.", 400);
  const limit = Math.min(Math.max(Number(params.get("limit") || 100) || 100, 1), 500);
  const clauses = ["1=1"], values = [];
  if (from) {
    clauses.push("occurred_on >= ?");
    values.push(from);
  }
  if (to) {
    clauses.push("occurred_on <= ?");
    values.push(to);
  }
  const data = await db.prepare(`SELECT c.id,c.occurred_on,c.transaction_type,c.category,c.debit_rp,c.credit_rp,c.status,
    c.note,c.payment_method,c.extra_note,c.source_payment_id,c.created_at,
    COALESCE(p.display_name,'') AS payer_name
    FROM bookkeeping_cash_transactions_posted c LEFT JOIN bookkeeping_payers p ON p.id=c.payer_id
    WHERE ${clauses.join(" AND ")} ORDER BY c.occurred_on DESC,c.created_at DESC,c.id DESC LIMIT ?`).bind(...values, limit).all();
  return json({ ok: true, transaksi: data.results || [] });
}
__name(listCashTransactions, "listCashTransactions");
async function addCashTransaction(request, env) {
  if (env.FINANCE_WRITE_ENABLED !== "true" || env.MANUAL_CASH_WRITE_ENABLED !== "true") return safeError("Pencatatan kas manual masih dikunci.", 503);
  let data;
  try {
    data = await requestJson(request);
  } catch {
    return safeError("Format transaksi tidak valid.", 400);
  }
  const date = data.tanggal, kind = data.jenis, amount = data.jumlahRp, category = String(data.kategori || "").trim(), note = String(data.keterangan || "").trim();
  const method = String(data.metode || "Cash").trim(), extra = String(data.catatan || "").trim(), key = String(data.requestKey || "");
  if (!validRequestKey(key) || !validDateOnly(date) || !["debit", "kredit"].includes(kind) || !validRupiah(amount) || category.length > 120 || note.length > 500 || !["Cash", "QRIS", "Transfer Mandiri"].includes(method) || extra.length > 500 || kind === "kredit" && method !== "Cash")
    return safeError("Kunci permintaan, tanggal, jenis, atau nominal transaksi tidak valid.", 400);
  const fingerprint = await tokenHash(JSON.stringify({ date, kind, amount, category, note, method, extra }));
  async function previous() {
    const row = await env.DB.prepare("SELECT payload_hash,cash_transaction_id FROM bookkeeping_manual_cash_request_keys WHERE request_key=?").bind(key).first();
    if (!row) return null;
    if (row.payload_hash !== fingerprint) return safeError("requestKey sudah digunakan untuk transaksi Kas berbeda.", 409);
    return json({ ok: true, id: row.cash_transaction_id, tanggal: date, jenis: kind, jumlahRp: amount, duplikat: true });
  }
  __name(previous, "previous");
  const replay = await previous();
  if (replay) return replay;
  const year = Number(date.slice(0, 4));
  const closed = await env.DB.prepare("SELECT status FROM bookkeeping_year_archives WHERE fiscal_year=? AND status IN ('ditutup','terkunci','final') LIMIT 1").bind(year).first();
  if (closed) return safeError("Tahun pembukuan sudah ditutup.", 409);
  const id = "cash-" + crypto.randomUUID();
  const debit = kind === "debit" ? amount : 0, credit = kind === "kredit" ? amount : 0;
  try {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO bookkeeping_manual_cash_request_keys(request_key,payload_hash,cash_transaction_id) VALUES(?,?,?)").bind(key, fingerprint, id),
      env.DB.prepare(`INSERT INTO bookkeeping_cash_transactions
        (id,occurred_on,transaction_type,category,debit_rp,credit_rp,status,note,payment_method,extra_note)
        VALUES (?,?,?,?,?,?,'aktif',?,?,?)`).bind(id, date, "manual", category, debit, credit, note, method, extra)
    ]);
  } catch (_) {
    const winner = await previous();
    if (winner) return winner;
    return safeError("Transaksi Kas tidak tersimpan. Periksa migrasi SQL dan ulangi dengan requestKey yang sama.", 409);
  }
  return json({ ok: true, id, tanggal: date, jenis: kind, jumlahRp: amount }, 201);
}
__name(addCashTransaction, "addCashTransaction");
async function editCashTransaction(request, env) {
  if (env.FINANCE_WRITE_ENABLED !== "true" || env.MANUAL_CASH_WRITE_ENABLED !== "true") return safeError("Perubahan kas manual masih dikunci.", 503);
  let data;
  try {
    data = await requestJson(request);
  } catch {
    return safeError("Format perubahan tidak valid.", 400);
  }
  const id = String(data.id || "").trim(), date = data.tanggal, kind = data.jenis, amount = data.jumlahRp;
  const category = String(data.kategori || "").trim(), note = String(data.keterangan || "").trim();
  const method = String(data.metode || "Cash").trim(), extra = String(data.catatan || "").trim();
  if (!/^cash-[0-9a-f-]{36}$/.test(id) || !validDateOnly(date) || !["debit", "kredit"].includes(kind) || !validRupiah(amount) || category.length > 120 || note.length > 500 || !["Cash", "QRIS", "Transfer Mandiri"].includes(method) || extra.length > 500 || kind === "kredit" && method !== "Cash")
    return safeError("ID, tanggal, jenis, kategori atau nominal tidak valid.", 400);
  const row = await env.DB.prepare("SELECT occurred_on,status,transaction_type,source_payment_id FROM bookkeeping_cash_transactions WHERE id=?").bind(id).first();
  if (!row || row.status !== "aktif" || row.transaction_type !== "manual" || row.source_payment_id) return safeError("Hanya kas manual aktif yang dapat diedit.", 409);
  const years = [Number(row.occurred_on.slice(0, 4)), Number(date.slice(0, 4))];
  const closed = await env.DB.prepare("SELECT fiscal_year FROM bookkeeping_year_archives WHERE fiscal_year IN (?,?) AND status IN ('ditutup','terkunci','final') LIMIT 1").bind(...years).first();
  if (closed) return safeError("Tahun pembukuan asal atau tujuan sudah ditutup.", 409);
  const debit = kind === "debit" ? amount : 0, credit = kind === "kredit" ? amount : 0;
  const result = await env.DB.prepare("UPDATE bookkeeping_cash_transactions SET occurred_on=?,category=?,debit_rp=?,credit_rp=?,note=?,payment_method=?,extra_note=? WHERE id=? AND status='aktif' AND transaction_type='manual' AND source_payment_id IS NULL").bind(date, category, debit, credit, note, method, extra, id).run();
  if (result.meta?.changes !== 1) return safeError("Transaksi tidak dapat diperbarui.", 409);
  return json({ ok: true, id, updated: true });
}
__name(editCashTransaction, "editCashTransaction");
async function cancelCashTransaction(request, env) {
  if (env.FINANCE_WRITE_ENABLED !== "true" || env.MANUAL_CASH_WRITE_ENABLED !== "true") return safeError("Pembatalan kas manual masih dikunci.", 503);
  let data;
  try {
    data = await requestJson(request);
  } catch {
    return safeError("Format pembatalan tidak valid.", 400);
  }
  const id = String(data.id || "").trim();
  if (!/^cash-[0-9a-f-]{36}$/.test(id)) return safeError("Hanya transaksi kas manual baru yang dapat dibatalkan melalui endpoint ini.", 400);
  const row = await env.DB.prepare("SELECT occurred_on,status,transaction_type,source_payment_id FROM bookkeeping_cash_transactions WHERE id=?").bind(id).first();
  if (!row || row.status !== "aktif" || row.transaction_type !== "manual" || row.source_payment_id) return safeError("Hanya transaksi kas manual aktif yang bisa dibatalkan.", 409);
  const year = Number(row.occurred_on.slice(0, 4));
  const closed = await env.DB.prepare("SELECT status FROM bookkeeping_year_archives WHERE fiscal_year=? AND status IN ('ditutup','terkunci','final') LIMIT 1").bind(year).first();
  if (closed) return safeError("Tahun pembukuan sudah ditutup.", 409);
  const result = await env.DB.prepare("UPDATE bookkeeping_cash_transactions SET status='dibatalkan' WHERE id=? AND status='aktif' AND transaction_type='manual' AND source_payment_id IS NULL").bind(id).run();
  if (result.meta?.changes !== 1) return safeError("Transaksi sudah berubah.", 409);
  return json({ ok: true, id, status: "dibatalkan" });
}
__name(cancelCashTransaction, "cancelCashTransaction");
function parseArchiveSnapshot(row){
  try{
    const value=JSON.parse(String(row.snapshot_json||""));
    if(!value||Array.isArray(value)||typeof value!=="object")return null;
    return value;
  }catch{return null}
}
__name(parseArchiveSnapshot,"parseArchiveSnapshot");
function archiveMoney(snapshot,field){
  const r=snapshot?.ringkasan||snapshot||{};
  const n=Number(r[field]??r[field+"Rp"]);
  return Number.isSafeInteger(n)?n:null;
}
__name(archiveMoney,"archiveMoney");
async function readYearStatus(db,request){
  const raw=new URL(request.url).searchParams.get("year")||"";
  if(!/^(19|20)[0-9]{2}$/.test(raw))return safeError("Tahun harus berupa empat angka.",400);
  const year=Number(raw);
  const [archive,closing]=await Promise.all([
    db.prepare("SELECT id,status,created_at FROM bookkeeping_year_archives WHERE fiscal_year=?").bind(year).first(),
    db.prepare("SELECT id,closed_at FROM fiscal_closings WHERE fiscal_year=?").bind(year).first()
  ]);
  const archived=archive&&["closed","ditutup","terkunci","final"].includes(String(archive.status||"").toLowerCase());
  return json({ok:true,data:{tahun:year,ditutup:!!closing||!!archived,
    status:archive?.status||(closing?"closed":"open"),arsipTersedia:!!archive,
    tahunDitutup:closing?.closed_at||null}});
}
__name(readYearStatus,"readYearStatus");
async function readYearArchiveList(db){
  const data=await db.prepare("SELECT id,fiscal_year,status,snapshot_json,created_at FROM bookkeeping_year_archives ORDER BY fiscal_year DESC LIMIT 80").all();
  const result=[];
  for(const row of data.results||[]){
    const snapshot=parseArchiveSnapshot(row);
    if(!snapshot)return safeError("Ada snapshot arsip tahun "+row.fiscal_year+" yang tidak valid; periksa D1.",409);
    result.push({tahun:Number(row.fiscal_year),idArsip:row.id,status:row.status,
      saldoAkhir:archiveMoney(snapshot,"saldoAkhir"),tanggalTutup:row.created_at});
  }
  return json({ok:true,data:result});
}
__name(readYearArchiveList,"readYearArchiveList");
async function readYearArchiveDetail(db,request){
  const raw=new URL(request.url).searchParams.get("year")||"";
  if(!/^(19|20)[0-9]{2}$/.test(raw))return safeError("Tahun harus berupa empat angka.",400);
  const row=await db.prepare("SELECT * FROM bookkeeping_year_archives WHERE fiscal_year=?").bind(Number(raw)).first();
  if(!row)return safeError("Arsip tahun tersebut belum tersedia.",404);
  const snapshot=parseArchiveSnapshot(row);
  if(!snapshot)return safeError("Snapshot arsip tersimpan tidak valid.",409);
  const s=snapshot.ringkasan||snapshot;
  const record={idArsip:row.id,tahun:Number(row.fiscal_year),tanggalTutup:row.created_at,
    saldoAwal:archiveMoney(snapshot,"saldoAwal"),pemasukan:archiveMoney(snapshot,"pemasukan"),
    pengeluaran:archiveMoney(snapshot,"pengeluaran"),saldoAkhir:archiveMoney(snapshot,"saldoAkhir")};
  return json({ok:true,data:{record,modul:snapshot.modul||snapshot.modules||{},status:row.status},readOnly:true});
}
__name(readYearArchiveDetail,"readYearArchiveDetail");
async function yearEndPreflight(db, request) {
  const raw = new URL(request.url).searchParams.get("year") || "";
  if (!/^(20|19)\d{2}$/.test(raw)) return safeError("Parameter year harus berupa tahun empat digit.", 400);
  const year = Number(raw), from = `${raw}-01-01`, to = `${year + 1}-01-01`;
  const lock = await db.prepare("SELECT status FROM bookkeeping_year_archives WHERE fiscal_year=? LIMIT 1").bind(year).first();
  const totals = await db.prepare(`SELECT COUNT(*) AS jumlah,
    COALESCE(SUM(debit_rp),0) AS debit,COALESCE(SUM(credit_rp),0) AS kredit
    FROM bookkeeping_cash_transactions_posted WHERE status='aktif' AND occurred_on>=? AND occurred_on<?`).bind(from, to).first();
  const sources = await db.prepare(`SELECT transaction_type,COUNT(*) AS jumlah,
    COALESCE(SUM(debit_rp),0) AS debit,COALESCE(SUM(credit_rp),0) AS kredit
    FROM bookkeeping_cash_transactions_posted WHERE status='aktif' AND occurred_on>=? AND occurred_on<?
    GROUP BY transaction_type ORDER BY transaction_type`).bind(from, to).all();
  const invalid = await db.prepare(`SELECT COUNT(*) AS jumlah FROM bookkeeping_cash_transactions
    WHERE status='aktif' AND occurred_on>=? AND occurred_on<?
    AND (debit_rp IS NULL OR credit_rp IS NULL OR debit_rp<0 OR credit_rp<0 OR
      (debit_rp>0 AND credit_rp>0) OR (debit_rp=0 AND credit_rp=0))`).bind(from, to).first();
  const orphan = await db.prepare(`SELECT COUNT(*) AS jumlah FROM bookkeeping_cash_transactions c
    LEFT JOIN bookkeeping_payments p ON p.id=c.source_payment_id
    LEFT JOIN (SELECT payment_id,COALESCE(SUM(amount_rp),0) AS kas_lorong_rp
      FROM bookkeeping_payment_allocations WHERE status='aktif' AND contribution_type='KAS_LORONG'
      GROUP BY payment_id) al ON al.payment_id=p.id
    WHERE c.status='aktif' AND c.transaction_type='iuran' AND c.occurred_on>=? AND c.occurred_on<?
    AND (c.source_payment_id IS NULL OR p.id IS NULL OR p.status<>'aktif' OR
      c.debit_rp<>COALESCE(al.kas_lorong_rp,0) OR c.credit_rp<>0)`).bind(from, to).first();
  const financeTables = ["bookkeeping_dp_cash_links", "bookkeeping_fine_payments"];
  const presentTables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('bookkeeping_dp_cash_links','bookkeeping_fine_payments')").all();
  const presentNames = new Set((presentTables.results || []).map((r) => r.name));
  const missingTables = financeTables.filter((name) => !presentNames.has(name));
  if (missingTables.length) {
    return json({
      ok: true,
      readOnly: true,
      year,
      locked: !!lock,
      lockStatus: lock?.status || null,
      status: "BLOKIR_SKEMA",
      journal: {
        jumlah: Number(totals?.jumlah || 0),
        debitRp: Number(totals?.debit || 0),
        kreditRp: Number(totals?.kredit || 0),
        saldoPeriodeRp: Number(totals?.debit || 0) - Number(totals?.kredit || 0)
      },
      sources: sources.results || [],
      checks: {
        invalidCashRows: Number(invalid?.jumlah || 0),
        invalidLinkedIuranRows: Number(orphan?.jumlah || 0),
        missingFinanceTables: missingTables.length
      },
      missingTables,
      balanceArchive: { status: "BELUM_TERVERIFIKASI", openingBalanceVerified: false, archiveSnapshotVerified: false },
      warning: "Tutup buku DIBLOKIR. Skema Denda/Pinjaman masih belum lengkap (" + missingTables.join(", ") + "). Angka yang ditampilkan hanya jurnal transaksi; belum membuktikan saldo awal, arsip, atau rekonsiliasi kas."
    });
  }
  const dpInvalidLinks = await db.prepare(`SELECT COUNT(*) AS jumlah
    FROM bookkeeping_dp_cash_links l
    LEFT JOIN bookkeeping_cash_transactions c ON c.id=l.cash_transaction_id
    WHERE (c.occurred_on>=? AND c.occurred_on<?)
      AND (c.status<>'aktif' OR
        (l.source_type='fine-pay' AND (c.transaction_type<>'pembayaran_denda' OR c.credit_rp<>0)) OR
        (l.source_type='loan-pay' AND (c.transaction_type<>'angsuran_pinjaman' OR c.credit_rp<>0)) OR
        (l.source_type='loan-create' AND (c.transaction_type<>'pinjaman_keluar' OR c.debit_rp<>0)))`).bind(from, to).first();
  const dpUnlinkedCash = await db.prepare(`SELECT COUNT(*) AS jumlah
    FROM bookkeeping_cash_transactions c
    LEFT JOIN bookkeeping_dp_cash_links l ON l.cash_transaction_id=c.id
    WHERE c.occurred_on>=? AND c.occurred_on<? AND c.status='aktif'
      AND c.transaction_type IN ('pembayaran_denda','angsuran_pinjaman','pinjaman_keluar')
      AND l.cash_transaction_id IS NULL`).bind(from, to).first();
  const dpPaymentProblems = await db.prepare(`SELECT COUNT(*) AS jumlah FROM (
    SELECT fp.id FROM bookkeeping_fine_payments fp
      LEFT JOIN bookkeeping_dp_cash_links l ON l.source_id=fp.id AND l.source_type='fine-pay'
      LEFT JOIN bookkeeping_cash_transactions c ON c.id=l.cash_transaction_id
      WHERE fp.status='aktif' AND fp.paid_on>=? AND fp.paid_on<?
        AND (l.cash_transaction_id IS NULL OR c.status<>'aktif' OR c.debit_rp<>fp.amount_rp OR c.credit_rp<>0)
    UNION ALL
    SELECT lr.id FROM bookkeeping_loan_repayments lr
      LEFT JOIN bookkeeping_dp_cash_links l ON l.source_id=lr.id AND l.source_type='loan-pay'
      LEFT JOIN bookkeeping_cash_transactions c ON c.id=l.cash_transaction_id
      WHERE lr.status='aktif' AND lr.repaid_on>=? AND lr.repaid_on<?
        AND (l.cash_transaction_id IS NULL OR c.status<>'aktif' OR c.debit_rp<>lr.amount_rp OR c.credit_rp<>0)
  )`).bind(from, to, from, to).first();
  const advanceAudit = await db.prepare(`SELECT
    COALESCE(SUM(CASE WHEN r.cash_transaction_id IS NULL OR TRIM(r.cash_transaction_id)='' THEN 1 ELSE 0 END),0) AS unlinked,
    COALESCE(SUM(CASE WHEN r.cash_transaction_id IS NOT NULL AND TRIM(r.cash_transaction_id)<>''
      AND (c.id IS NULL OR c.status<>'aktif' OR c.transaction_type<>'pelunasan_talangan'
      OR c.debit_rp<>0 OR c.credit_rp<>r.amount_rp OR c.occurred_on<>r.repaid_on)
      THEN 1 ELSE 0 END),0) AS mismatched,
    COALESCE(SUM(CASE WHEN r.cash_transaction_id IS NOT NULL AND TRIM(r.cash_transaction_id)<>''
      AND c.id IS NOT NULL AND c.status='aktif' AND c.transaction_type='pelunasan_talangan'
      AND c.debit_rp=0 AND c.credit_rp=r.amount_rp AND c.occurred_on=r.repaid_on
      THEN 1 ELSE 0 END),0) AS matched
    FROM bookkeeping_advance_repayments r
    LEFT JOIN bookkeeping_cash_transactions c ON c.id=r.cash_transaction_id
    WHERE r.status='aktif' AND r.repaid_on>=? AND r.repaid_on<?`).bind(from, to).first();
  const advanceOrphanCash = await db.prepare(`SELECT COUNT(*) AS jumlah
    FROM bookkeeping_cash_transactions c
    LEFT JOIN bookkeeping_advance_repayments r ON r.cash_transaction_id=c.id AND r.status='aktif'
    WHERE c.status='aktif' AND c.transaction_type='pelunasan_talangan'
      AND c.occurred_on>=? AND c.occurred_on<? AND r.id IS NULL`).bind(from, to).first();
  const archiveRows = await db.prepare(`SELECT fiscal_year,status,snapshot_json,source_closing_id
    FROM bookkeeping_year_archives WHERE fiscal_year IN (?,?) ORDER BY fiscal_year`).bind(year - 1, year).all();
  const archiveByYear = new Map((archiveRows.results || []).map((r) => [Number(r.fiscal_year), r]));
  function inspectArchive(fiscalYear) {
    const row = archiveByYear.get(fiscalYear);
    if (!row) return { year: fiscalYear, exists: false, validJson: false, status: null, snapshotKeys: [], hasSourceClosingId: false };
    let validJson = false, keys = [];
    try {
      const parsed = JSON.parse(row.snapshot_json);
      validJson = parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
      if (validJson) keys = Object.keys(parsed).slice(0, 30);
    } catch (_ignored) {
    }
    return {
      year: fiscalYear,
      exists: true,
      validJson,
      status: row.status,
      snapshotKeys: keys,
      hasSourceClosingId: !!row.source_closing_id
    };
  }
  __name(inspectArchive, "inspectArchive");
  const priorArchive = inspectArchive(year - 1), currentArchive = inspectArchive(year);
  const archiveStructuralIssues = [priorArchive, currentArchive].filter((a) => a.exists && !a.validJson).length;
  const archiveChecks = {
    previousYearMissing: !priorArchive.exists,
    currentYearMissing: !currentArchive.exists,
    previousYearInvalidJson: priorArchive.exists && !priorArchive.validJson,
    currentYearInvalidJson: currentArchive.exists && !currentArchive.validJson,
    previousYearMissingClosingRef: priorArchive.exists && priorArchive.status === "closed" && !priorArchive.hasSourceClosingId,
    currentYearMissingClosingRef: currentArchive.exists && currentArchive.status === "closed" && !currentArchive.hasSourceClosingId
  };
  const archiveIssueCount = Object.values(archiveChecks).filter(Boolean).length;
  const unlinkedAdvances = Number(advanceAudit?.unlinked || 0);
  const mismatchedAdvances = Number(advanceAudit?.mismatched || 0);
  const orphanAdvanceCash = Number(advanceOrphanCash?.jumlah || 0);
  const anomalies = Number(invalid?.jumlah || 0) + Number(orphan?.jumlah || 0) + Number(dpInvalidLinks?.jumlah || 0) + Number(dpUnlinkedCash?.jumlah || 0) + Number(dpPaymentProblems?.jumlah || 0) + mismatchedAdvances + orphanAdvanceCash;
  const requiresReview = anomalies > 0 || unlinkedAdvances > 0 || archiveIssueCount > 0;
  return json({
    ok: true,
    readOnly: true,
    year,
    locked: !!lock,
    lockStatus: lock?.status || null,
    journal: {
      jumlah: Number(totals?.jumlah || 0),
      debitRp: Number(totals?.debit || 0),
      kreditRp: Number(totals?.kredit || 0),
      saldoPeriodeRp: Number(totals?.debit || 0) - Number(totals?.kredit || 0)
    },
    sources: sources.results || [],
    checks: {
      invalidCashRows: Number(invalid?.jumlah || 0),
      invalidLinkedIuranRows: Number(orphan?.jumlah || 0),
      invalidDpCashLinks: Number(dpInvalidLinks?.jumlah || 0),
      unlinkedDpCashRows: Number(dpUnlinkedCash?.jumlah || 0),
      unmatchedDpPayments: Number(dpPaymentProblems?.jumlah || 0),
      unverifiedAdvanceRepayments: unlinkedAdvances,
      matchedAdvanceRepayments: Number(advanceAudit?.matched || 0),
      mismatchedAdvanceRepayments: mismatchedAdvances,
      orphanAdvanceCashRows: orphanAdvanceCash
    },
    balanceArchive: {
      status: "BELUM_TERVERIFIKASI",
      openingBalanceVerified: false,
      archiveSnapshotVerified: false,
      previousYear: priorArchive,
      currentYear: currentArchive,
      invalidSnapshotCount: archiveStructuralIssues,
      archiveChecks,
      archiveIssueCount
    },
    status: requiresReview ? "PERLU_REKONSILIASI" : "PEMERIKSAAN_TERBATAS_LOLOS",
    warning: "Belum menjadi izin tutup buku. Talangan tanpa tautan jurnal harus direkonsiliasi; audit lain masih terbatas pada catatan yang tersedia. Metadata arsip diperiksa, tetapi saldo awal dan angka snapshot tahunan BELUM diverifikasi."
  });
}
__name(yearEndPreflight, "yearEndPreflight");
async function residentsApi(request, env, who) {
  const denied = requireRole(who, ["superadmin"]);
  if (denied) return denied;
  const db = env.DB, method = request.method;
  if (method === "GET") {
    const result = await db.prepare(`SELECT h.id AS household_id,h.house_code AS rumah,h.description AS deskripsi_rumah,
      d.status_rumah,d.tipe_unit,d.nama_pemilik,d.kontak_pemilik,d.keterangan AS keterangan_rumah,
      p.id AS payer_id,p.display_name AS nama,p.payer_type,p.active,
      rp.source_warga_id,rp.status_tinggal,rp.status_aktif,rp.nomor_hp,rp.keterangan AS keterangan_warga,
      rp.qty_iuran_bulanan,rp.qty_kebersihan,rp.qty_kas_lorong,rp.qty_arisan,
      m.id AS member_id,m.status AS status_anggota
      FROM households h LEFT JOIN household_details d ON d.household_id=h.id
      LEFT JOIN bookkeeping_payers p ON p.household_id=h.id AND p.payer_type='warga'
      LEFT JOIN resident_directory_profiles rp ON rp.payer_id=p.id
      LEFT JOIN members m ON m.id=p.member_id
      ORDER BY h.house_code COLLATE NOCASE,p.display_name COLLATE NOCASE`).all();
    return json({ ok: true, rows: result.results || [] });
  }
  if (method !== "POST") return safeError("Metode tidak didukung.", 405);
  let data;
  try {
    data = await requestJson(request);
  } catch {
    return safeError("JSON tidak valid atau terlalu besar.", 400);
  }
  const action = String(data.action || "");
  const str = /* @__PURE__ */ __name((name, max = 150) => {
    if (data[name] === undefined || data[name] === null || data[name] === "") return null;
    if (typeof data[name] !== "string" || data[name].length > max) throw Error("Kolom " + name + " tidak valid.");
    return data[name].trim() || null;
  }, "str");
  try {
    if (action === "edit_house") {
      const id = str("household_id", 120);
      if (!id) return safeError("ID rumah wajib.", 400);
      const code = str("rumah", 25);
      if (!code) return safeError("Nomor rumah wajib.", 400);
      const exists = await db.prepare("SELECT id,description FROM households WHERE id=?").bind(id).first();
      if (!exists) return safeError("Rumah tidak ditemukan.", 404);
      const description=data.deskripsi_rumah===undefined?exists.description:str("deskripsi_rumah",500);
      await db.batch([
        db.prepare("UPDATE households SET house_code=?,description=? WHERE id=?").bind(code, description, id),
        db.prepare(`INSERT INTO household_details(household_id,status_rumah,tipe_unit,nama_pemilik,kontak_pemilik,keterangan)
          VALUES(?,?,?,?,?,?) ON CONFLICT(household_id) DO UPDATE SET status_rumah=excluded.status_rumah,tipe_unit=excluded.tipe_unit,nama_pemilik=excluded.nama_pemilik,kontak_pemilik=excluded.kontak_pemilik,keterangan=excluded.keterangan`).bind(id, str("status_rumah", 40), str("tipe_unit", 80), str("nama_pemilik"), str("kontak_pemilik", 80), str("keterangan_rumah", 500))
      ]);
      return json({ ok: true, id });
    }
    if (action === "edit_resident") {
      const id = str("payer_id", 120);
      if (!id) return safeError("ID warga wajib.", 400);
      const name = str("nama", 160);
      if (!name) return safeError("Nama wajib.", 400);
      const old = await db.prepare("SELECT id,display_name FROM bookkeeping_payers WHERE id=? AND payer_type='warga'").bind(id).first();
      if (!old) return safeError("Warga tidak ditemukan.", 404);
      if(name!==old.display_name){
        const financial=await db.prepare(`SELECT
          EXISTS(SELECT 1 FROM bookkeeping_payments WHERE payer_id=? LIMIT 1) AS payments,
          EXISTS(SELECT 1 FROM bookkeeping_cash_transactions WHERE payer_id=? LIMIT 1) AS cash,
          EXISTS(SELECT 1 FROM bookkeeping_fines WHERE payer_id=? LIMIT 1) AS fines,
          EXISTS(SELECT 1 FROM bookkeeping_loans WHERE payer_id=? LIMIT 1) AS loans,
          EXISTS(SELECT 1 FROM bookkeeping_advances WHERE payer_id=? LIMIT 1) AS advances`).bind(id,id,id,id,id).first();
        if(financial&&Object.values(financial).some(Boolean))
          return safeError("Nama pembayar sudah tercatat dalam transaksi. Jangan mengganti penghuni lama; tambahkan warga baru pada nomor rumah yang sama.",409);
      }
      const cols = ["status_tinggal", "status_aktif", "nomor_hp", "keterangan_warga"];
      const vals = cols.map((x) => str(x, x === "keterangan_warga" ? 500 : 80));
      const active = data.active === false ? 0 : 1;
      const payer = await db.prepare("SELECT member_id FROM bookkeeping_payers WHERE id=?").bind(id).first();
      const updates = [
        db.prepare("UPDATE bookkeeping_payers SET display_name=?,active=? WHERE id=?").bind(name, active, id),
        db.prepare(`INSERT INTO resident_directory_profiles(payer_id,status_tinggal,status_aktif,nomor_hp,keterangan)
          VALUES(?,?,?,?,?) ON CONFLICT(payer_id) DO UPDATE SET status_tinggal=excluded.status_tinggal,status_aktif=excluded.status_aktif,nomor_hp=excluded.nomor_hp,keterangan=excluded.keterangan`).bind(id, ...vals)
      ];
      if (payer?.member_id) {
        updates.push(db.prepare("UPDATE members SET display_name=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(name, active ? "aktif" : "nonaktif", payer.member_id));
      }
      await db.batch(updates);
      return json({ ok: true, id, linkedMemberId: payer?.member_id || null });
    }
    if (action === "add_house") {
      const house = str("rumah", 25);
      if (!house || !/^[A-Za-z0-9][A-Za-z0-9/ -]{1,24}$/.test(house)) return safeError("Nomor rumah tidak valid.", 400);
      const id = "house:" + crypto.randomUUID();
      await db.batch([
        db.prepare("INSERT INTO households(id,house_code,description) VALUES(?,?,?)").bind(id, house, str("deskripsi_rumah", 500)),
        db.prepare("INSERT INTO household_details(household_id,status_rumah,tipe_unit,nama_pemilik,kontak_pemilik,keterangan) VALUES(?,?,?,?,?,?)").bind(id, str("status_rumah", 40), str("tipe_unit", 80), str("nama_pemilik"), str("kontak_pemilik", 80), str("keterangan_rumah", 500))
      ]);
      return json({ ok: true, id }, 201);
    }
    if (action === "add_resident") {
      const house = str("household_id", 120), name = str("nama", 160);
      if (!house || !name) return safeError("Rumah dan nama wajib.", 400);
      if (!await db.prepare("SELECT id FROM households WHERE id=?").bind(house).first()) return safeError("Rumah tidak ditemukan.", 404);
      const id = "payer:" + crypto.randomUUID(), memberId = "member:api:" + crypto.randomUUID();
      const occupancyId = "occupancy:api:" + crypto.randomUUID();
      await db.batch([
        // Tambah identitas anggota lebih dulu, kemudian pembayar iuran terkait.
        // Tidak membuat akun/password otomatis: akun baru disiapkan oleh Admin/Superadmin.
        db.prepare("INSERT INTO members(id,household_id,display_name,status,joined_at) VALUES(?,?,?,'aktif',date('now'))").bind(memberId, house, name),
        db.prepare("INSERT INTO bookkeeping_payers(id,household_id,member_id,display_name,payer_type,active) VALUES(?,?,?,?,'warga',1)").bind(id, house, memberId, name),
        db.prepare("INSERT INTO resident_directory_profiles(payer_id,status_tinggal,status_aktif,nomor_hp,keterangan) VALUES(?,?,?,?,?)").bind(id, str("status_tinggal", 80), str("status_aktif", 80), str("nomor_hp", 80), str("keterangan_warga", 500)),
        db.prepare("INSERT INTO household_occupancy_history(id,household_id,member_id,started_on,status) VALUES(?,?,?,date('now'),'aktif')").bind(occupancyId, house, memberId)
      ]);
      return json({ ok: true, id, memberId, accountCreated: false }, 201);
    }
    return safeError("Aksi tidak dikenal.", 400);
  } catch (e) {
    if (/UNIQUE constraint failed/i.test(String(e.message))) return safeError("Nomor rumah atau data tersebut sudah digunakan.", 409);
    throw e;
  }
}
__name(residentsApi, "residentsApi");

async function handle(request, env) {
  if (!env.DB) return safeError("Database belum dikonfigurasi.", 503);
  const url = new URL(request.url), path = url.pathname.replace(/\/+$/, "") || "/";
  if (path === "/api/health" && request.method === "GET") return json({ ok: true, service: "flamboyan4-api", mode: "migration-preview" });
  if (path === "/api/public/bank-split" && request.method === "GET") {
    try{return json({ok:true,...await getBankSplitPolicy(env.DB)})}
    catch{return safeError("Aturan bagi hasil belum tersedia.",503)}
  }
  if (path === "/api/public/summary" && request.method === "GET") return json(await publicSummary(env.DB));
  if (path === "/api/public/overview" && request.method === "GET") return json(await publicOverview(env.DB));
  if (path === "/api/public/albums" && request.method === "GET") return json(await publicAlbums(env.DB));
  if (path === "/api/public/progress" && request.method === "GET") return json(await publicProgress(env.DB));
  if (path === "/login-staging" && request.method === "GET") return stagingLoginPage();
  if (path === "/activate-members-staging" && request.method === "GET") return memberActivationPage();
  if (path === "/activate-admin-staging" && request.method === "GET") return adminActivationPage();
  if (path === "/member-savings-staging" && request.method === "GET") return memberSavingsPage();
  if (path === "/setup-superadmin" && request.method === "GET") return bootstrapPage();
  if (path === "/api/auth/bootstrap-superadmin" && request.method === "POST") return bootstrapSuperadmin(request, env);
  if (path === "/api/auth/login" && request.method === "POST") return login(request, env);
  const who = await identity(request, env.DB);
  if (path === "/api/superadmin/bank-split" && request.method === "POST") return saveBankSplitPolicy(request,env,who);
  if (path === "/api/v2/admin/residents") return residentsApi(request, env, who);
  // Rute nota spesifik harus ditangani sebelum fallback umum /api/v2/.
  if (path === "/api/v2/admin/bank/sale-receipt" && request.method === "POST") return bankUpdateSaleReceipt(request,env,who);
  if (path === "/api/v2/admin/treasury") return treasuryApi(request,env,who,url);
  if (path.startsWith("/api/v2/")) return handleUnifiedApi(request, env, who);
  if (path === "/api/auth/change-password" && request.method === "POST") return changePassword(request, env, who);
  if (path === "/api/auth/logout" && request.method === "POST") {
    if (!who) return safeError("Sesi tidak valid.", 401);
    const bearer = /^Bearer ([A-Za-z0-9_-]{32,256})$/.exec(request.headers.get("authorization") || "");
    const cookie = /\bf4_session=([A-Za-z0-9_-]{32,256})(?:;|$)/.exec(request.headers.get("cookie") || "");
    const token = bearer?.[1] || cookie?.[1];
    await env.DB.prepare("UPDATE sessions SET revoked_at=CURRENT_TIMESTAMP WHERE token_hash=?").bind(await tokenHash(token)).run();
    return json({ ok: true }, 200, { "set-cookie": "f4_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0" });
  }
  if (path === "/api/member/profile" && request.method === "GET") {
    const denied = requireRole(who, ["anggota", "admin", "superadmin"]);
    if (denied) return denied;
    return json(await myProfile(env.DB, who));
  }
  if (path === "/api/member/profile" && request.method === "POST") return updateMyProfile(request, env, who);
  if (path === "/api/member/avatar" && request.method === "POST") return uploadMyAvatar(request, env, who);
  if (path === "/api/member/avatar" && request.method === "GET") return getMyAvatar(env, who);
  if (path === "/api/member/me" && request.method === "GET") {
    const denied = requireRole(who, ["anggota", "admin", "superadmin"]);
    if (denied) return denied;
    return json({
      ok: true,
      account: { id: who.id, username: who.username, role: who.role,
        displayName: (await myProfile(env.DB, who)).profile.nama },
      member: who.member_id ? { id: who.member_id, nama: who.display_name, rumah: who.house_code } : null
    });
  }
  if (path === "/api/member/finance-report" && request.method === "GET") {
    // Detailed bookkeeping cash notes belong to superadmin. Other roles use
    // the public aggregate overview, or their own payment/savings reports.
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    const month = url.searchParams.get("month") || "";
    if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return safeError("Periode tidak valid (YYYY-MM).", 400);
    // Aggregate from all matching D1 transactions, not only the bounded history list.
    const [aggregate,rows] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) AS total_rows,
        COALESCE(SUM(debit_rp),0) AS total_debit_rp,
        COALESCE(SUM(credit_rp),0) AS total_credit_rp
        FROM bookkeeping_cash_transactions_posted
        WHERE status='aktif' AND (?='' OR substr(occurred_on,1,7)=?)`).bind(month,month).first(),
      env.DB.prepare(`SELECT occurred_on,transaction_type,category,
        debit_rp,credit_rp,status,note
        FROM bookkeeping_cash_transactions_posted
        WHERE status='aktif' AND (?='' OR substr(occurred_on,1,7)=?)
        ORDER BY occurred_on DESC,id DESC LIMIT 1501`).bind(month,month).all()
    ]);
    const fullRows = rows.results || [];
    const isTruncated = fullRows.length > 1500;
    const items = fullRows.slice(0,1500).map((row) => ({
      tanggal: row.occurred_on,
      jenis: row.transaction_type,
      kategori: row.category,
      debitRp: Number(row.debit_rp || 0),
      kreditRp: Number(row.credit_rp || 0),
      keterangan: row.note || ""
    }));
    const totalDebitRp = Number(aggregate?.total_debit_rp || 0);
    const totalKreditRp = Number(aggregate?.total_credit_rp || 0);
    return json({
      ok: true,
      periode: month || "semua",
      transaksi: items,
      jumlahTransaksi: Number(aggregate?.total_rows || 0),
      riwayatLengkap: !isTruncated,
      totalDebitRp,
      totalKreditRp,
      selisihRp: totalDebitRp - totalKreditRp,
      catatan: isTruncated
        ? "Total dari seluruh D1, tetapi rincian dibatasi 1500 baris. Cetak rincian harus menggunakan paginasi."
        : "Laporan arus transaksi kas yang tercatat, bukan saldo keseluruhan atau laporan tutup buku."
    });
  }
  if (request.method === "GET" && ["/api/member/payments","/api/member/arisan","/api/member/fines","/api/member/loans"].includes(path)) {
    const denied=requireRole(who,["anggota","admin","superadmin"]);if(denied)return denied;
    if(!who.member_id)return safeError("Akun belum terhubung ke data warga.",403);
    return f4MemberPortalFinance(env.DB,who.member_id,path.split("/").pop());
  }
  if (path === "/api/member/savings" && request.method === "GET") {
    const denied = requireRole(who, ["anggota", "admin", "superadmin"]);
    if (denied) return denied;
    if (!who.member_id) return safeError("Akun belum ditautkan ke data anggota.", 403);
    return json(await ownSavings(env.DB, who.member_id));
  }
  if (path === "/api/bookkeeping/iuran/suggested-period" && request.method === "GET") {
    const denied=requireRole(who,["superadmin"]);
    if(denied)return denied;
    return getIuranSuggestedPeriod(env.DB,request);
  }
  if (path === "/api/bookkeeping/iuran/outstanding" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return getIuranOutstanding(env.DB, request);
  }
  if (path === "/api/bookkeeping/iuran/tariffs" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    try {
      return json({ ok: true, config: await getIuranTariffs(env.DB), source: "cloudflare-d1" });
    } catch {
      return safeError("Tarif iuran D1 belum tersedia/lengkap.", 503);
    }
  }
  if (path === "/api/bookkeeping/iuran/payers" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    const out = await env.DB.prepare(`SELECT bp.id AS payerId,bp.display_name AS nama,bp.member_id AS memberId,
      CASE WHEN instr(h.house_code,'/')>0 THEN substr(h.house_code,1,instr(h.house_code,'/')-1) ELSE h.house_code END AS blok,
      CASE WHEN instr(h.house_code,'/')>0 THEN substr(h.house_code,instr(h.house_code,'/')+1) ELSE '' END AS noRumah
      FROM bookkeeping_payers bp
      LEFT JOIN members m ON m.id=bp.member_id
      LEFT JOIN households h ON h.id=COALESCE(bp.household_id,m.household_id)
      WHERE bp.active=1 AND bp.payer_type IN ('warga','lembaga') ORDER BY bp.display_name`).all();
    return json({ ok: true, data: out.results || [] });
  }
  if (path === "/api/bookkeeping/iuran" && request.method === "POST") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return createIuranPayment(request, env, who);
  }
  if(path==="/api/bookkeeping/iuran/edit"&&request.method==="POST"){
    const denied=requireRole(who,["superadmin"]);if(denied)return denied;
    return f4EditNewIuran(request,env,who);
  }
  if(path==="/api/bookkeeping/iuran/cancel"&&request.method==="POST"){
    const denied=requireRole(who,["superadmin"]);if(denied)return denied;
    return cancelNewIuranPayment(request,env,who);
  }
  const dpWrites = {
    "/api/bookkeeping/denda": "fine-create",
    "/api/bookkeeping/denda/bayar": "fine-pay",
    "/api/bookkeeping/pinjaman": "loan-create",
    "/api/bookkeeping/pinjaman/bayar": "loan-pay"
  };
  if (request.method === "POST" && Object.hasOwn(dpWrites, path)) {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return writeDendaPinjaman(request, env, dpWrites[path], who);
  }
  if (path === "/api/bookkeeping/denda-pinjaman/exceptions" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return auditDendaPinjamanExceptions(env.DB, request);
  }
  if (path === "/api/bookkeeping/denda-pinjaman/cash-candidates" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return auditDendaPinjamanCashCandidates(env.DB, request);
  }
  if (path === "/api/bookkeeping/denda-pinjaman/readiness" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return auditDendaPinjamanReadiness(env.DB);
  }
  if (path === "/api/bookkeeping/denda" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return listDendaD1(env.DB, request);
  }
  if (path === "/api/bookkeeping/pinjaman" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return listPinjamanD1(env.DB, request);
  }
  if (path === "/api/bookkeeping/pinjaman/detail" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return detailPinjamanD1(env.DB, request);
  }
  if (path === "/api/bookkeeping/talangan" && request.method === "POST") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return newAdvanceD1(request, env);
  }
  if (path === "/api/bookkeeping/talangan/repay" && request.method === "POST") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return repayAdvanceD1(request, env);
  }
  if (path === "/api/bookkeeping/talangan" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return listTalanganD1(env.DB, request);
  }
  if (path === "/api/bookkeeping/talangan/detail" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return detailTalanganD1(env.DB, request);
  }
  if (path === "/api/bookkeeping/talangan/audit" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return auditTalangan(env.DB);
  }
  if (request.method==="GET" && path==="/api/bookkeeping/year-status"){
    const denied=requireRole(who,["superadmin"]);if(denied)return denied;
    return readYearStatus(env.DB,request);
  }
  if (request.method==="GET" && path==="/api/bookkeeping/year-archives"){
    const denied=requireRole(who,["superadmin"]);if(denied)return denied;
    return readYearArchiveList(env.DB);
  }
  if (request.method==="GET" && path==="/api/bookkeeping/year-archive"){
    const denied=requireRole(who,["superadmin"]);if(denied)return denied;
    return readYearArchiveDetail(env.DB,request);
  }
  if (path === "/api/bookkeeping/year-end/preflight" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return yearEndPreflight(env.DB, request);
  }
  if (path === "/api/bookkeeping/iuran/audit" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return auditIuranCash(env.DB);
  }
  if (path === "/api/bookkeeping/iuran/correct-date" && request.method === "POST") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return f4CorrectPaymentDate(env, request, who);
  }
  if (path === "/api/bookkeeping/iuran/quick-summary" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return f4QuickIuranSummary(env.DB, request);
  }
  if (path === "/api/bookkeeping/reports/contributions" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return f4ContributionReport(env.DB, request);
  }
  if (path === "/api/bookkeeping/reports/yearly" && request.method === "GET") {
    const denied=requireRole(who,["superadmin"]);
    if (denied) return denied;
    return f4YearlyReadOnlyReport(env.DB,request);
  }
  if (path === "/api/bookkeeping/reports/cash" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return f4CashReport(env.DB, request);
  }
  if(path==='/api/bookkeeping/kas-batches'&&request.method==='GET'){
    const denied=requireRole(who,['superadmin']);if(denied)return denied;return f4BatchRead(env.DB,request);
  }
  if(path==='/api/bookkeeping/kas-batches'&&request.method==='POST'){
    const denied=requireRole(who,['superadmin']);if(denied)return denied;return f4BatchCreate(request,env,who);
  }
  if(path==='/api/bookkeeping/kas-batches/cancel'&&request.method==='POST'){
    const denied=requireRole(who,['superadmin']);if(denied)return denied;return f4BatchCancel(request,env,who);
  }
  if (path === "/api/bookkeeping/iuran/history" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return bookkeepingIuranHistory(env.DB, request);
  }
  if (path === "/api/bookkeeping/cash" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return listCashTransactions(env.DB, request);
  }
  if (path === "/api/bookkeeping/cash" && request.method === "POST") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return addCashTransaction(request, env);
  }
  if (path === "/api/bookkeeping/cash/edit" && request.method === "POST") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return editCashTransaction(request, env);
  }
  if (path === "/api/bookkeeping/cash/cancel" && request.method === "POST") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return cancelCashTransaction(request, env);
  }
  if (path === "/api/admin/sales/preview" && request.method === "POST") return salePreview(request, env, who);
  if (path === "/api/admin/sales/draft" && request.method === "POST") return saleCreateDraft(request, env, who);
  if (path === "/api/admin/reconciliation/preview" && request.method === "POST") {
    const denied = requireRole(who, ["admin", "superadmin"]);
    if (denied) return denied;
    try {
      const payload = await requestJson(request);
      return json({ ok: true, ...await reconcilePreview(env.DB, String(payload.batchId || "")) });
    } catch (_error) {
      return safeError("Pratinjau gagal. Periksa data batch dan transaksi.", 409);
    }
  }
  if (path === "/api/admin/reconciliation/confirm" && request.method === "POST") {
    return bankReconcileConfirm(request,env,who);
  }
  if (path === "/api/admin/reconciliation/cancel" && request.method === "POST") {
    return bankReverseConfirmed(request,env,who);
  }
  if (path === "/api/admin/status" && request.method === "GET") {
    const denied = requireRole(who, ["admin", "superadmin"]);
    if (denied) return denied;
    return json({ ok: true, scope: "banksampah-admin" });
  }
  if (path === "/api/bookkeeping/status" && request.method === "GET") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return json({ ok: true, scope: "pembukuan-superadmin" });
  }
  if (path === "/api/superadmin/accounts/preview" && request.method === "GET") {
    const denied = requireRole(who, ["admin","superadmin"]);
    if (denied) return denied;
    const preview=await accountActivationPreview(env.DB);
    if(who.role==="admin")preview.akun=preview.akun.filter(a=>a.role==="anggota");
    preview.jumlah=preview.akun.length;
    return json(preview);
  }
  if (path === "/api/superadmin/accounts/activate-member" && request.method === "POST") {
    const denied = requireRole(who, ["admin","superadmin"]);
    if (denied) return denied;
    return activateMemberAccount(request, env, who);
  }
  if (path === "/api/superadmin/accounts/manage-member" && request.method === "POST") {
    const denied=requireRole(who,["superadmin"]);
    return denied||manageMemberIdentity(request,env,who);
  }
  if (path === "/api/superadmin/accounts/reset-member" && request.method === "POST") {
    const denied = requireRole(who, ["admin","superadmin"]);
    if (denied) return denied;
    return resetMemberPassword(request,env,who);
  }
  if (path === "/api/superadmin/accounts/activate-admin" && request.method === "POST") {
    const denied = requireRole(who, ["superadmin"]);
    if (denied) return denied;
    return activateBankAdmin(request, env, who);
  }
  return safeError("Endpoint belum tersedia.", 404);
}
__name(handle, "handle");
var worker_default = {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    if (!pathname.startsWith("/api/") && !["/login-staging", "/member-savings-staging", "/activate-members-staging", "/activate-admin-staging"].includes(pathname)) {
      if (pathname.includes("/legacy.html")) return new Response("Tidak tersedia", { status: 404 });
      if (pathname === "/pembukuan/" || pathname === "/pembukuan" || pathname === "/pembukuan/index.html") {
        const current = await identity(request, env.DB);
        if (!current) return Response.redirect(new URL("/akun/?next=%2Fpembukuan%2F", request.url), 302);
        if (current.role !== "superadmin") return new Response("Akses khusus superadmin.", { status: 403, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
      }
      // Non-API routes require static assets, which may not be bound in the
      // Cloudflare editor Preview. Keep all API routes unchanged.
      if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
        return new Response("Halaman ini tersedia melalui GitHub Pages; Worker ini melayani API.", {
          status: 404,
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }
        });
      }
      const asset = await env.ASSETS.fetch(request);
      if (pathname.startsWith("/pembukuan")) {
        const h = new Headers(asset.headers);
        h.set("cache-control", "no-store");
        h.set("x-robots-tag", "noindex");
        return new Response(asset.body, { status: asset.status, headers: h });
      }
      return asset;
    }
    const origin = allowedOrigin(request, env), requestedOrigin = request.headers.get("origin");
    if (requestedOrigin && !origin) return safeError("Origin tidak diizinkan.", 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    try {
      const result = await handle(request, env);
      const headers = new Headers(result.headers);
      Object.entries(cors(origin)).forEach(([k, v]) => headers.set(k, v));
      headers.set("referrer-policy", "no-referrer");
      return new Response(result.body, { status: result.status, headers });
    } catch (_error) {
      console.error("flamboyan4-api failure", {
        path: new URL(request.url).pathname,
        type: String(_error?.name || "Error"),
        detail: String(_error?.message || "No message").slice(0, 300)
      });
      return json({ ok: false, error: "Terjadi kesalahan server." }, 500, cors(origin));
    }
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
