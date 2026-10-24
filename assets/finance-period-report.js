/**
 * Laporan mutasi Kas Warga, D1-only, baca-saja.
 * Selisih periode BUKAN saldo awal / saldo akhir / hasil tutup buku.
 * Tidak memakai Apps Script, Firebase, atau endpoint POST.
 */
import {api} from './api.js';
const rp=n=>'Rp '+new Intl.NumberFormat('id-ID').format(Number(n)||0);
const E=(tag,txt)=>{const x=document.createElement(tag);if(txt!==undefined)x.textContent=String(txt);return x};
const para=(host,msg,cls='muted')=>{const x=E('p',msg);x.className=cls;host.append(x);return x};
function table(host,headers,rows){
 const wrap=E('div');wrap.className='data-wrap';const t=E('table');t.className='data-table';
 const tr=E('tr');headers.forEach(h=>tr.append(E('th',h)));t.append(tr);
 for(const row of rows){const line=E('tr');row.forEach(x=>line.append(E('td',x===null||x===undefined?'—':x)));t.append(line)}
 wrap.append(t);host.append(wrap);
}
function validMonth(raw){return /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(raw)}
function lastDay(year,month){return new Date(Date.UTC(year,month,0)).toISOString().slice(0,10)}
export function showCashPeriodReport(host){
 host.replaceChildren();
 para(host,'Laporan mutasi kas langsung dari Cloudflare D1 (hanya baca). Ini bukan laporan saldo akhir atau arsip tahunan.','info-note');
 const form=E('form');form.className='panel-actions';
 const label=E('label');label.append(E('strong','Periode transaksi'));
 const input=E('input');input.type='month';input.setAttribute('aria-label','Pilih periode transaksi kas');
 const today=new Date();input.value=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0');
 label.append(input);
 const btn=E('button','Tampilkan transaksi kas');btn.type='submit';btn.className='btn';
 form.append(label,btn);host.append(form);
 const output=E('div');output.setAttribute('aria-live','polite');host.append(output);
 const refresh=async()=>{
  output.replaceChildren();if(!validMonth(input.value)){para(output,'Pilih bulan yang valid.','info-note');return}
  const [y,m]=input.value.split('-').map(Number);const from=input.value+'-01';const to=lastDay(y,m);
  btn.disabled=true;para(output,'Mengambil jurnal kas periode '+input.value+' dari D1…');
  try{
   const data=await api('/api/bookkeeping/cash?from='+from+'&to='+to+'&limit=500');
   const raw=Array.isArray(data.transaksi)?data.transaksi:[];
   const active=raw.filter(r=>String(r.status||'').toLowerCase()==='aktif');
   const debit=active.reduce((s,r)=>s+Number(r.debit_rp||0),0);
   const kredit=active.reduce((s,r)=>s+Number(r.credit_rp||0),0);
   output.replaceChildren();
   table(output,['Periode','Transaksi aktif','Debit','Kredit','Selisih periode'],
    [[input.value,active.length,rp(debit),rp(kredit),rp(debit-kredit)]]);
   if(raw.length===500)para(output,'Batas 500 transaksi tercapai. Total ini belum dapat dianggap lengkap; perlu laporan berpaginasi.','info-note');
   para(output,'Selisih periode = debit minus kredit. BUKAN saldo awal, saldo keseluruhan, atau saldo tutup buku.','info-note');
   table(output,['Tanggal','Jenis','Kategori','Debit','Kredit','Status'],
     raw.map(r=>[r.occurred_on,r.transaction_type||'—',r.category||'—',
       rp(r.debit_rp),rp(r.credit_rp),r.status||'—']));
   if(!raw.length)para(output,'Tidak ada transaksi kas tercatat untuk periode ini.');
  }catch(e){
   output.replaceChildren();
   para(output,'Gagal membaca kas D1: '+(e?.message||'API tidak tersedia')+'. Tidak ada perubahan data.','info-note');
  }finally{btn.disabled=false}
 };
 form.addEventListener('submit',e=>{e.preventDefault();refresh()});
 refresh();
}
