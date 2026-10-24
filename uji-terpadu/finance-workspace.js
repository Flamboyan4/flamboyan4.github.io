// Rincian kas lingkungan untuk Superadmin. Anggota hanya melihat data pribadi dan ringkasan publik.
(()=>{
 'use strict';
 const page=document.getElementById('f4-account-page');
 if(!page)return;
 const main=page.querySelector('main');
 const format=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
 const asText=v=>String(v??'');
 let activeRows=[],activePeriod='';
 const el=(tag,text,cls)=>{
   const x=document.createElement(tag);
   if(cls)x.className=cls;if(text!==undefined)x.textContent=asText(text);
   return x;
 };
 const escape=v=>asText(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function load(month=''){
   if(page.hidden)return;
   activePeriod=month;
   main.replaceChildren();
   const head=el('header',undefined,'f4-work-heading');
   head.append(el('h2','Rincian Kas Lingkungan'),el('p','Sumber: Cloudflare D1 · Khusus Superadmin'));
   head.append(el('button','← Ringkasan Akun','f4-work-back'));
   head.querySelector('button').onclick=()=>window.openAccountPage?.();
   main.append(head);
   const controls=el('div',undefined,'f4-finance-controls');
   const monthInput=el('input');monthInput.type='month';monthInput.value=month;
   const loadButton=el('button','Tampilkan','f4-work-button');
   const printButton=el('button','Cetak Laporan','f4-work-button');
   printButton.disabled=true;
   loadButton.onclick=()=>load(monthInput.value);
   controls.append(monthInput,loadButton,printButton);
   main.append(controls);
   const status=el('p','Mengambil rincian kas dari Cloudflare…','f4-work-info');main.append(status);
   try{
     const r=await fetch('https://api.flamboyan4.web.id/api/member/finance-report'+(month?'?month='+encodeURIComponent(month):''),{credentials:'include',cache:'no-store'});
     const result=await r.json().catch(()=>({error:'Respons API tidak valid'}));
     if(!r.ok||result.ok===false)throw Error(result.error||'HTTP '+r.status);
     activeRows=result.transaksi||[];
     const stats=el('div',undefined,'f4-work-cards');
     for(const [name,value,detail] of [
       ['Debit kas',format(result.totalDebitRp),'Kas masuk tercatat'],
       ['Kredit kas',format(result.totalKreditRp),'Kas keluar tercatat'],
       ['Selisih arus',format(result.selisihRp),'Bukan saldo total'],
       ['Jumlah transaksi',activeRows.length,'Baris yang ditampilkan']
     ]){
       const card=el('article',undefined,'f4-work-stat');
       card.append(el('small',name),el('strong',value),el('span',detail));stats.append(card);
     }
     main.append(stats);
     const wrap=el('div',undefined,'f4-finance-table-wrap');
     const table=el('table'),thead=el('thead'),tr=el('tr');
     ['Tanggal','Jenis','Kategori','Keterangan','Debit','Kredit'].forEach(x=>tr.append(el('th',x)));
     thead.append(tr);table.append(thead);
     const body=el('tbody');
     for(const x of activeRows){
       const row=el('tr');
       [x.tanggal,x.jenis,x.kategori,x.keterangan,format(x.debitRp),format(x.kreditRp)].forEach(v=>row.append(el('td',v)));
       body.append(row);
     }
     table.append(body);wrap.append(table);main.append(wrap);
     status.textContent=(result.catatan||'')+' Periode: '+(month||'semua')+'.';
     printButton.disabled=false;
     printButton.onclick=()=>{
       const w=window.open('','_blank');
       if(!w){status.textContent='Browser memblokir jendela cetak. Izinkan pop-up untuk halaman ini.';return}
       const columns=['Tanggal','Jenis','Kategori','Keterangan','Debit','Kredit'];
       const rows=activeRows.map(x=>[x.tanggal,x.jenis,x.kategori,x.keterangan,format(x.debitRp),format(x.kreditRp)]);
       const markup='<!doctype html><html lang="id"><head><meta charset="UTF-8"><title>Laporan Kas Flamboyan 4</title><style>body{font:12px Arial;margin:18px;color:#222}h1{font-size:18px;margin:0 0 3px}p{margin:4px 0 10px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #bbb;padding:6px;text-align:left}th{background:#eee}td:nth-last-child(-n+2){text-align:right}@page{size:A4 landscape;margin:12mm}</style></head><body><h1>LAPORAN RINCIAN KAS FLAMBOYAN 4</h1><p>Periode: '+escape(activePeriod||'Semua')+' | Dicetak: '+escape(new Date().toLocaleString('id-ID'))+'</p><p>Debit '+escape(format(result.totalDebitRp))+' • Kredit '+escape(format(result.totalKreditRp))+'</p><table><thead><tr>'+columns.map(x=>'<th>'+escape(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(cols=>'<tr>'+cols.map(x=>'<td>'+escape(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table><p>Rekap transaksi kas tercatat, bukan saldo total akhir.</p></body></html>';
       w.document.open();w.document.write(markup);w.document.close();w.focus();w.print();
     };
   }catch(e){
     status.textContent='Laporan tidak dapat dibaca: '+e.message+'. Rincian ini hanya tersedia bagi Superadmin.';
   }
 }
 window.f4OpenFinanceReport=()=>load('');
})();
