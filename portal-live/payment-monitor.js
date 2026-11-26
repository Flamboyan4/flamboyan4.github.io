/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/portal-live/payment-monitor.js",function(__f4){


(() => {
  'use strict';
  const el = id => __f4.globals.document.getElementById('pm-' + id);
  const node = (tag, text, cls) => {
    const item = __f4.globals.document.createElement(tag);
    if (text != null) item.textContent = text;
    if (cls) item.className = cls;
    return item;
  };
  const rupiah = new __f4.globals.Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0});
  const monthName = (month, style) => new __f4.globals.Date(month + '-01T12:00:00Z').toLocaleDateString('id-ID', {month:style,year:'numeric',timeZone:'UTC'});
  const names = {IURAN_BULANAN:'Iuran bulanan', KEBERSIHAN:'Kebersihan', KAS_LORONG:'Kas Lorong', ARISAN:'Arisan'};
  const states = {settled:'Lunas', partial:'Sebagian', unpaid:'Belum bayar', future:'Belum jatuh tempo', recorded:'Pembayaran tercatat', review:'Periksa ID warga', exempt:'Tanpa kewajiban', archive:'Arsip belum diimpor'};
  const total = amounts => __f4.globals.Object.values(amounts).reduce((sum, value) => sum + value, 0);
  let model, request, yearRequest, yearModel, exportInProgress = false;

  async function read(path, params, signal) {
    const response = await (0,__f4.globals.fetch)('https://api.flamboyan4.web.id/api/bookkeeping/reports/' + path + '?' + new __f4.globals.URLSearchParams(params), {
      credentials:'include', cache:'no-store', signal
    });
    if (response.status === 401 || response.status === 403) throw (0,__f4.globals.Error)('Silakan masuk dengan akun Superadmin.');
    if (!response.ok) throw (0,__f4.globals.Error)('Layanan Pembukuan belum dapat diakses.');
    const data = await response.json();
    if (!data.ok) throw (0,__f4.globals.Error)(data.error || 'Data belum dapat dimuat.');
    return data;
  }

  function amounts(member) {
    const paid = total(member.paid), due = total(member.due);
    const balance = __f4.globals.Object.entries(member.due).reduce((sum,[type,amount]) =>
      sum + __f4.globals.Math.max(0, amount - (member.paid[type] || 0)), 0);
    let state;
    if (!due) state = paid ? 'recorded' : 'exempt';
    else if (member.review) state = 'review';
    else if (!balance) state = 'settled';
    else if (paid) state = 'partial';
    else state = model.period > model.today ? 'future' : 'unpaid';
    return {member,paid,due,balance,state};
  }

  function render() {
    if (!model) return;
    const payerId = el('payer').value;
    const residents = model.records.filter(row => !payerId || row.id === payerId);
    const rows = residents.map(amounts);
    for (const key of ['paid','due','balance']) {
      el(key).textContent = rupiah.format(rows.reduce((sum,row) => sum + row[key], 0));
    }
    const periodLabel = monthName(model.period,'long');
    el('trend-caption').textContent = 'Alokasi iuran per bulan · ' + (residents.length === 1 ? residents[0].nama : 'Semua warga');
    const trend = model.months.map((_,index) => residents.reduce((sum,r) => sum+r.trend[index],0));
    const max = __f4.globals.Math.max(...trend, 1);
    el('trend').replaceChildren(...trend.map((value,index) => {
      const li = node('li'), track = node('span',null,'pm-track'), bar = node('span');
      const available = model.months[index] >= model.firstMonth;
      track.setAttribute('aria-hidden','true');
      if (available) bar.style.width = (value/max*100) + '%';
      track.append(bar);
      li.append(node('span',monthName(model.months[index],'short')),track,node('strong',available ? rupiah.format(value) : '—'));
      return li;
    }));
    el('components-caption').textContent = periodLabel;
    el('components').replaceChildren(...__f4.globals.Object.entries(names)
      .filter(([type]) => type !== 'KEBERSIHAN' || model.period < '2026-12' ||
        residents.some(r => (r.paid[type] || 0) > 0))
      .map(([type,name]) => {
        const div = node('div');
        div.append(node('dt',name),node('dd',rupiah.format(residents.reduce((sum,r) => sum+(r.paid[type]||0),0))));
        return div;
      }));
    el('export').disabled = !payerId || exportInProgress;
    el('export-info').textContent = '';
    renderYear();
  }

  let activeDetail = null;
  const statementCache = new __f4.globals.Map();
  const formatDate = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test((0,__f4.globals.String)(value || ''))) return (0,__f4.globals.String)(value || '—');
    return new __f4.globals.Date(value + 'T12:00:00Z').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  };
  function closeDetail() {
    if (!activeDetail) return;
    activeDetail.anchor.setAttribute('aria-expanded','false');
    activeDetail.popup.remove();
    activeDetail = null;
  }
  function positionDetail() {
    if (!activeDetail) return;
    const {anchor,popup} = activeDetail, rect = anchor.getBoundingClientRect();
    const width = popup.offsetWidth, height = popup.offsetHeight;
    const left = __f4.globals.Math.max(8,__f4.globals.Math.min(rect.left+rect.width/2-width/2,__f4.window.innerWidth-width-8));
    const below = rect.bottom+12+height <= __f4.window.innerHeight-8 || rect.top < height+20;
    const top = below ? __f4.globals.Math.max(8,__f4.globals.Math.min(rect.bottom+12,__f4.window.innerHeight-height-8))
      : __f4.globals.Math.max(8,rect.top-height-12);
    popup.style.left = __f4.globals.Math.round(left) + 'px';
    popup.style.top = __f4.globals.Math.round(top) + 'px';
    popup.style.setProperty('--pm-pointer-x',__f4.globals.Math.max(15,__f4.globals.Math.min(width-15,rect.left+rect.width/2-left))+'px');
    popup.dataset.placement = below ? 'bottom' : 'top';
  }
  function getStatement(id) {
    if (!statementCache.has(id)) {
      const job = read('resident-statement',{payerId:id}).catch(error => {
        statementCache.delete(id);
        throw error;
      });
      statementCache.set(id,job);
    }
    return statementCache.get(id);
  }
  function openDetail(anchor, member, entry, state) {
    if (activeDetail?.anchor === anchor) {closeDetail();return;}
    closeDetail();
    const paid = total(entry.paid), due = total(entry.due);
    const balance = __f4.globals.Object.entries(entry.due).reduce((sum,[type,amount]) =>
      sum + __f4.globals.Math.max(0,amount-(entry.paid[type]||0)),0);
    const popup = node('section',null,'pm-detail-popover');
    popup.setAttribute('role','dialog');
    popup.setAttribute('aria-label','Rincian pembayaran '+member.nama+' '+monthName(entry.period,'long'));
    const heading = node('div',null,'pm-detail-heading');
    const title = node('div');
    title.append(node('strong',member.nama),node('small',[member.rumah,monthName(entry.period,'long')].filter(__f4.globals.Boolean).join(' · ')));
    const close = node('button','×','pm-detail-close');
    close.type='button';close.setAttribute('aria-label','Tutup rincian');close.addEventListener('click',closeDetail);
    heading.append(title,close);
    const badge = node('span',states[state],'pm-status');badge.dataset.state=state;
    const metrics = node('dl',null,'pm-detail-metrics');
    for (const [label,value] of [['Terbayar',paid],['Kewajiban',due],['Sisa',balance]]) {
      const item=node('div');item.append(node('dt',label),node('dd',rupiah.format(value)));metrics.append(item);
    }
    const breakdown = node('div',null,'pm-detail-breakdown');
    breakdown.append(node('strong','Rincian pos'));
    const items = __f4.globals.Object.entries(names).filter(([type]) => (entry.due[type]||0)>0 || (entry.paid[type]||0)>0);
    if (!items.length) breakdown.append(node('p','Tidak ada kewajiban tercatat untuk periode ini.'));
    else for (const [type,label] of items) {
      const item=node('div');
      item.append(node('span',label),node('b',rupiah.format(entry.paid[type]||0)+' / '+rupiah.format(entry.due[type]||0)));
      breakdown.append(item);
    }
    const dates = node('div',null,'pm-detail-dates');
    dates.append(node('strong','Tanggal pembayaran'));
    const dateContents=node('div',null,'pm-detail-date-list');
    dateContents.append(node('p',paid > 0 ? 'Memuat tanggal transaksi…' :
      state === 'archive' ? 'Riwayat sebelum data portal belum tersedia.' :
      state === 'future' ? 'Belum jatuh tempo dan belum ada pembayaran.' :
      'Belum ada pembayaran yang dialokasikan.'));
    dates.append(dateContents);
    popup.append(heading,badge,metrics,breakdown,dates);
    __f4.globals.document.body.append(popup);
    activeDetail={anchor,popup};
    anchor.setAttribute('aria-expanded','true');
    positionDetail();
    if (paid <= 0) return;
    getStatement(member.id).then(statement => {
      if (activeDetail?.popup !== popup) return;
      const perDate=new __f4.globals.Map();
      for (const a of statement.allocations || []) {
        if (a.period_year+'-'+(0,__f4.globals.String)(a.period_month).padStart(2,'0') !== entry.period ||
            a.payment_status !== 'aktif' || a.allocation_status !== 'aktif' || (0,__f4.globals.Number)(a.amount_rp)<=0) continue;
        perDate.set(a.paid_on,(perDate.get(a.paid_on)||0)+(0,__f4.globals.Number)(a.amount_rp));
      }
      dateContents.replaceChildren();
      if (!perDate.size) dateContents.append(node('p','Tanggal transaksi belum tersedia di riwayat aktif.'));
      else [...perDate].sort(([a],[b])=>a.localeCompare(b)).forEach(([date,amount]) => {
        const item=node('div');
        item.append(node('span',formatDate(date)),node('b',rupiah.format(amount)));
        dateContents.append(item);
      });
      positionDetail();
    }).catch(error => {
      if (activeDetail?.popup !== popup) return;
      dateContents.replaceChildren(node('p','Tanggal tidak dapat dimuat: '+error.message));
      positionDetail();
    });
  }
  __f4.globals.document.addEventListener('pointerdown',event => {
    if (activeDetail && !activeDetail.popup.contains(event.target) &&
        !activeDetail.anchor.contains(event.target)) closeDetail();
  });
  __f4.globals.document.addEventListener('keydown',event => {if (event.key==='Escape') closeDetail();});
  __f4.window.addEventListener('scroll',closeDetail,true);
  __f4.window.addEventListener('resize',closeDetail);

  function renderYear() {
    closeDetail();
    if (!yearModel) return;
    const selected = el('payer').value;
    const residents = yearModel.records.filter(row => !selected || row.id === selected);
    el('year-count').textContent = residents.length + ' warga · ' + yearModel.period.slice(0,4) +
      ' · Data portal sejak ' + monthName(yearModel.firstMonth,'long');
    const grid = el('year-grid');grid.replaceChildren();
    const header = node('div',null,'pm-year-row pm-year-header');
    header.append(node('strong','Warga'));
    for (const period of yearModel.months) header.append(node('span',monthName(period,'short').split(' ')[0]));
    grid.append(header);
    for (const member of residents) {
      const row = node('div',null,'pm-year-row');
      const name = node('strong',member.nama); name.append(node('small',member.rumah));row.append(name);
      for (const entry of member.years) {
        const paid = total(entry.paid), due = total(entry.due);
        const balance = __f4.globals.Object.entries(entry.due).reduce((sum,[type,amount]) =>
          sum+__f4.globals.Math.max(0,amount-(entry.paid[type]||0)),0);
        const state = entry.period < yearModel.firstMonth && !paid ? 'archive' :
          !due ? (paid ? 'recorded' : 'exempt') : balance === 0 ? 'settled' : paid ? 'partial' :
          entry.period > yearModel.today ? 'future' : 'unpaid';
        const cell = node('button',null,'pm-month-cell');cell.type = 'button';cell.dataset.state = state;
        cell.setAttribute('aria-label',member.nama+', '+monthName(entry.period,'long')+', '+states[state]+'. Lihat rincian.');
        cell.setAttribute('aria-haspopup','dialog');
        cell.setAttribute('aria-expanded','false');
        cell.title = states[state] + ' · Klik untuk rincian';
        const marks = {settled:'<path d="m4 9 3 3 6-7"/>',partial:'<circle cx="8" cy="8" r="6"/><path d="M8 2v6l4 4"/>',unpaid:'<path d="M3 8h10"/>',future:'<circle cx="8" cy="8" r="6"/>',exempt:'<path d="M3 8h10"/>',recorded:'<path d="m4 9 3 3 6-7"/>',review:'<path d="M8 2v7m0 3v1"/>',archive:'<path d="M3 5h10M3 8h10M3 11h7"/>'};
        const mark = node('b');mark.innerHTML='<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'+marks[state]+'</svg>';
        cell.append(mark);
        cell.addEventListener('click',()=>openDetail(cell,member,entry,state));
        row.append(cell);
      }
      grid.append(row);
    }
  }

  async function loadYear() {
    yearRequest?.abort();const controller = new __f4.globals.AbortController();yearRequest = controller;
    yearModel = null;el('year-grid').replaceChildren();el('year-state').textContent = 'Memuat pembayaran setahun…';
    try {
      const year = el('year').value;
      const data = await read('payment-monitor',{period:year+'-12',year:'1'},controller.signal);
      if (yearRequest !== controller) return;
      yearModel = data;el('year-state').textContent = '';renderYear();
    } catch (error) {
      if (!controller.signal.aborted) el('year-state').textContent = error.message;
    }
  }

  async function load() {
    request?.abort();
    const controller = new __f4.globals.AbortController(); request = controller;
    const period = el('month').value, previousId = el('payer').value;
    model = null;
    el('content').hidden = true; el('retry').hidden = true; el('export').disabled = true;
    el('payer').disabled = true; el('export-info').textContent = '';
    if (!/^20\d\d-(0[1-9]|1[0-2])$/.test(period)) {el('state').textContent = 'Pilih bulan iuran yang valid.'; return;}
    el('state').textContent = 'Memuat pembayaran…';
    try {
      const data = await read('payment-monitor',{period},controller.signal);
      if (request !== controller) return;
      model = data;
      const payerOptions = data.records.map(r => {
        const opt = new __f4.globals.Option([r.nama,r.rumah,r.active?'':'Nonaktif'].filter(__f4.globals.Boolean).join(' · '),r.id);
        opt.dataset.residentName = r.nama || '';
        opt.dataset.residentHouse = r.rumah || '';
        return opt;
      });
      el('payer').replaceChildren(new __f4.globals.Option('Semua warga',''),...payerOptions);
      el('payer').value = data.records.some(r => r.id === previousId) ? previousId : '';
      el('payer').disabled = false;
      __f4.window.refreshAllCustomSelects?.();
      el('state').textContent = period < data.firstMonth ? 'Periode ini mendahului riwayat iuran pertama.' : '';
      el('content').hidden = false; render();
    } catch(error) {
      if (request !== controller || controller.signal.aborted) return;
      el('state').textContent = error.message; el('retry').hidden = false;
    }
  }
  async function download() {
    const payerId = el('payer').value;
    if (!model || !payerId || exportInProgress) return;
    const periodAtClick = request;
    exportInProgress = true; el('export').disabled = true; el('export-info').textContent = 'Menyiapkan Excel…';
    let note = '';
    try {
      const [statement,writer] = await __f4.globals.Promise.all([read('resident-statement',{payerId}),import('./resident-workbook.js?v=1')]);
      if (statement.profile.id !== payerId) throw (0,__f4.globals.Error)('Identitas warga pada unduhan tidak sesuai.');
      if (periodAtClick !== request || el('payer').value !== payerId) return;
      const file = await writer.workbook(statement,names);
      if (periodAtClick !== request || el('payer').value !== payerId) return;
      const url = __f4.globals.URL.createObjectURL(file), link = __f4.globals.document.createElement('a');
      link.href = url; link.download = ('Iuran-' + [statement.profile.nama,statement.profile.rumah].filter(__f4.globals.Boolean).join('-')).replace(/[^\p{L}\p{N}._-]+/gu,'-') + '.xlsx';
      __f4.globals.document.body.append(link); link.click(); link.remove();
      (0,__f4.globals.setTimeout)(() => __f4.globals.URL.revokeObjectURL(url),60000);
      note = 'File Excel untuk ' + statement.profile.nama + ' sudah disiapkan.';
    } catch(error) { note = 'Unduhan gagal. ' + error.message; }
    finally {
      exportInProgress = false;
      if (model) render();
      if (note && periodAtClick === request && el('payer').value === payerId) el('export-info').textContent = note;
    }
  }

  el('month').value = new __f4.globals.Date(__f4.globals.Date.now()+7*3600000).toISOString().slice(0,7);
  const currentYear = (0,__f4.globals.Number)(el('month').value.slice(0,4));
  for (let year = currentYear; year >= 2026; year--) el('year').add(new __f4.globals.Option((0,__f4.globals.String)(year),(0,__f4.globals.String)(year)));
  el('year').addEventListener('change',loadYear);
  el('month').addEventListener('change',load);
  el('retry').addEventListener('click',load);
  el('payer').addEventListener('change',render);
  el('export').addEventListener('click',download);
  __f4.window.F4PaymentMonitor = {open:() => {load();loadYear();}};
})();

});
