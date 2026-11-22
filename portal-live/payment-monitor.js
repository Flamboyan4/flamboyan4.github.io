(() => {
  'use strict';
  const el = id => document.getElementById('pm-' + id);
  const node = (tag, text, cls) => {
    const item = document.createElement(tag);
    if (text != null) item.textContent = text;
    if (cls) item.className = cls;
    return item;
  };
  const rupiah = new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0});
  const monthName = (month, style) => new Date(month + '-01T12:00:00Z').toLocaleDateString('id-ID', {month:style,year:'numeric',timeZone:'UTC'});
  const names = {IURAN_BULANAN:'Iuran bulanan', KEBERSIHAN:'Kebersihan', KAS_LORONG:'Kas Lorong', ARISAN:'Arisan'};
  const states = {settled:'Lunas', partial:'Sebagian', unpaid:'Belum bayar', future:'Belum jatuh tempo', recorded:'Pembayaran tercatat', review:'Periksa ID warga', exempt:'Tanpa kewajiban'};
  const total = amounts => Object.values(amounts).reduce((sum, value) => sum + value, 0);
  let model, request, exportInProgress = false;

  async function read(path, params, signal) {
    const response = await fetch('https://api.flamboyan4.web.id/api/bookkeeping/reports/' + path + '?' + new URLSearchParams(params), {
      credentials:'include', cache:'no-store', signal
    });
    if (response.status === 401 || response.status === 403) throw Error('Silakan masuk dengan akun Superadmin.');
    if (!response.ok) throw Error('Layanan Pembukuan belum dapat diakses.');
    const data = await response.json();
    if (!data.ok) throw Error(data.error || 'Data belum dapat dimuat.');
    return data;
  }

  function amounts(member) {
    const paid = total(member.paid), due = total(member.due);
    const balance = Object.entries(member.due).reduce((sum,[type,amount]) =>
      sum + Math.max(0, amount - (member.paid[type] || 0)), 0);
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
    const payerId = el('payer').value, chosenStatus = el('status').value;
    const residents = model.records.filter(row => !payerId || row.id === payerId);
    const rows = residents.map(amounts);
    const visible = rows.filter(row => (payerId || row.member.active || row.paid) && (!chosenStatus || chosenStatus === row.state || (chosenStatus === 'paid' && row.paid > 0)));
    for (const key of ['paid','due','balance']) {
      el(key).textContent = rupiah.format(rows.reduce((sum,row) => sum + row[key], 0));
    }
    const periodLabel = monthName(model.period,'long');
    el('trend-caption').textContent = 'Alokasi iuran per bulan · ' + (residents.length === 1 ? residents[0].nama : 'Semua warga');
    const trend = model.months.map((_,index) => residents.reduce((sum,r) => sum+r.trend[index],0));
    const max = Math.max(...trend, 1);
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
    el('components').replaceChildren(...Object.entries(names).map(([type,name]) => {
      const div = node('div'); div.append(node('dt',name),node('dd',rupiah.format(residents.reduce((sum,r) => sum+(r.paid[type]||0),0))));
      return div;
    }));
    el('count').textContent = visible.length + ' warga · ' + periodLabel;
    el('rows').replaceChildren(...visible.map(({member,state,paid,balance}) => {
      const tr = node('tr'), identity = node('th'), tag = node('td');
      identity.scope = 'row';
      identity.append(node('strong',member.nama),node('small', [member.rumah,member.active ? '' : 'Nonaktif'].filter(Boolean).join(' · ')));
      const badge = node('span',states[state],'pm-status'); badge.dataset.state = state; tag.append(badge);
      if (member.review) tag.append(node('small','Ada pembayaran atas ID lain di rumah ini.'));
      const amountCell = node('td',rupiah.format(paid)), balanceCell = node('td',rupiah.format(balance));
      amountCell.dataset.label = 'Terbayar'; balanceCell.dataset.label = 'Sisa';
      tr.append(identity,tag,amountCell,balanceCell); return tr;
    }));
    if (!visible.length) {
      const empty = node('tr'), td = node('td','Tidak ada warga yang cocok dengan filter ini.','pm-empty');
      td.colSpan = 4; empty.append(td); el('rows').append(empty);
    }
    el('export').disabled = !payerId || exportInProgress;
    el('export-info').textContent = payerId ? 'Excel memuat profil dan seluruh riwayat iuran warga yang dipilih.' : 'Pilih satu warga untuk mengunduh profil dan seluruh riwayat iurannya.';
  }

  async function load() {
    request?.abort();
    const controller = new AbortController(); request = controller;
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
      el('payer').replaceChildren(new Option('Semua warga',''),...data.records.map(r => new Option([r.nama,r.rumah,r.active?'':'Nonaktif'].filter(Boolean).join(' · '),r.id)));
      el('payer').value = data.records.some(r => r.id === previousId) ? previousId : '';
      el('payer').disabled = false;
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
      const [statement,writer] = await Promise.all([read('resident-statement',{payerId}),import('./resident-workbook.js?v=1')]);
      if (statement.profile.id !== payerId) throw Error('Identitas warga pada unduhan tidak sesuai.');
      if (periodAtClick !== request || el('payer').value !== payerId) return;
      const file = await writer.workbook(statement,names);
      if (periodAtClick !== request || el('payer').value !== payerId) return;
      const url = URL.createObjectURL(file), link = document.createElement('a');
      link.href = url; link.download = ('Iuran-' + [statement.profile.nama,statement.profile.rumah].filter(Boolean).join('-')).replace(/[^\p{L}\p{N}._-]+/gu,'-') + '.xlsx';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url),60000);
      note = 'File Excel untuk ' + statement.profile.nama + ' sudah disiapkan.';
    } catch(error) { note = 'Unduhan gagal. ' + error.message; }
    finally {
      exportInProgress = false;
      if (model) render();
      if (note && periodAtClick === request && el('payer').value === payerId) el('export-info').textContent = note;
    }
  }

  el('status').add(new Option('Sudah bayar (semua)','paid'));
  for (const [value,label] of Object.entries(states)) el('status').add(new Option(label,value));
  el('month').value = new Date(Date.now()+7*3600000).toISOString().slice(0,7);
  el('month').addEventListener('change',load);
  el('retry').addEventListener('click',load);
  el('payer').addEventListener('change',render);
  el('status').addEventListener('change',render);
  el('export').addEventListener('click',download);
  window.F4PaymentMonitor = {open:load};
})();
