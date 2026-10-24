/* Flamboyan 4: D1 read-only financial integration. No write actions. */
import {api} from './api.js';
const rupiah=n=>'Rp '+new Intl.NumberFormat('id-ID').format(Number(n)||0);
const E=(type,label)=>{const x=document.createElement(type);if(label!==undefined)x.textContent=String(label);return x};
const message=(host,t,cls='muted')=>{const p=E('p',t);p.className=cls;host.append(p)};
const fail=(host,e)=>message(host,'Data D1 gagal dimuat: '+(e?.message||'Permintaan tidak tersedia')+'. Tidak ada transaksi diubah.','info-note');
function grid(host,columns,rows){
 const wrap=E('div');wrap.className='data-wrap';const table=E('table');table.className='data-table';
 const head=E('tr');columns.forEach(c=>head.append(E('th',c)));table.append(head);
 rows.forEach(row=>{const tr=E('tr');row.forEach(v=>tr.append(E('td',v??'—')));table.append(tr)});
 wrap.append(table);host.append(wrap);
}
function field(title,kind='text'){
 const label=E('label');label.style.cssText='display:grid;gap:5px;min-width:150px';label.append(E('strong',title));
 const input=E(kind==='select'?'select':'input');if(kind!=='select')input.type=kind;
 input.style.cssText='width:100%;padding:10px;border:1px solid #c7d0db;border-radius:9px';label.append(input);
 return {label,input};
}
export async function showTariffs(host){
 host.replaceChildren();message(host,'Membaca tarif resmi Cloudflare D1…');
 try{const x=await api('/api/bookkeeping/iuran/tariffs');host.replaceChildren();
 const parts=[['TARIF_BULANAN','Iuran bulanan'],['TARIF_KEBERSIHAN','Kebersihan'],['TARIF_KAS_LORONG','Kas lorong'],['TARIF_ARISAN','Arisan']];
 grid(host,['Jenis','Tarif dasar'],parts.map(([id,t])=>[t,rupiah(x.config?.[id])]));
 message(host,'Tarif dasar bukan otomatis jumlah yang wajib dibayar oleh setiap warga.','info-note')
 }catch(e){host.replaceChildren();fail(host,e)}
}
export async function showPayers(host){
 host.replaceChildren();message(host,'Membaca daftar pembayar D1…');
 try{const response=await api('/api/bookkeeping/iuran/payers');const payers=response.data||[];host.replaceChildren();
 message(host,payers.length+' pembayar aktif terdaftar di D1 (bukan jumlah rumah).');
 const search=field('Cari nama atau blok');host.append(search.label);const result=E('div');host.append(result);
 const render=()=>{result.replaceChildren();const q=search.input.value.toLowerCase();
 const filtered=payers.filter(p=>[p.nama,p.blok,p.noRumah].some(x=>String(x??'').toLowerCase().includes(q)));
 grid(result,['Nama pembayar','Blok','Rumah'],filtered.slice(0,200).map(p=>[p.nama,p.blok,p.noRumah]));
 if(filtered.length>200)message(result,'Tampilkan maksimal 200. Gunakan pencarian.')};
 search.input.addEventListener('input',render);render();
 }catch(e){host.replaceChildren();fail(host,e)}
}
export async function showOutstanding(host){
 host.replaceChildren();message(host,'Membaca warga dan tarif D1…');
 try{const r=await api('/api/bookkeeping/iuran/payers');const all=r.data||[];host.replaceChildren();
 message(host,'Hitung sisa kewajiban per warga dan bulan berdasarkan alokasi aktif D1. Tidak menyimpan pembayaran atau membuat talangan.','info-note');
 if(!all.length){message(host,'Belum ada pembayar aktif.');return}
 const form=E('form');form.className='panel-actions';const payer=field('Pembayar','select');
 const opt=E('option','Pilih warga');opt.value='';payer.input.append(opt);
 all.forEach(p=>{const o=E('option',[p.nama,p.blok,p.noRumah].filter(Boolean).join(' · '));o.value=p.payerId;payer.input.append(o)});
 const month=field('Periode','month'),now=new Date();month.input.value=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
 const button=E('button','Periksa kewajiban');button.className='btn';button.type='submit';
 form.append(payer.label,month.label,button);host.append(form);const output=E('div');host.append(output);
 form.addEventListener('submit',async e=>{
  e.preventDefault();output.replaceChildren();
  if(!payer.input.value||!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month.input.value)){message(output,'Pilih warga dan periode yang benar.','info-note');return}
  const [year,m]=month.input.value.split('-').map(Number);
  button.disabled=true;message(output,'Mengambil alokasi D1…');
  try{const d=await api('/api/bookkeeping/iuran/outstanding?payerId='+encodeURIComponent(payer.input.value)+'&year='+year+'&month='+m);
   output.replaceChildren();grid(output,['Jenis','Wajib','Dibayar','Sisa','Lebih'],(d.komponen||[]).map(x=>[x.jenis,rupiah(x.wajibRp),rupiah(x.terbayarRp),rupiah(x.sisaRp),rupiah(x.kelebihanRp)]));
   message(output,'Sisa kewajiban '+rupiah(d.totalSisaRp)+'. '+(d.catatan||''),'info-note');
  }catch(err){output.replaceChildren();fail(output,err)}finally{button.disabled=false}
 });
 }catch(e){host.replaceChildren();fail(host,e)}
}
export async function showIuranAudit(host){
 host.replaceChildren();message(host,'Audit pembukuan D1…');
 try{const d=await api('/api/bookkeeping/iuran/audit');host.replaceChildren();
 const fields=[['tanpaJurnal','Pembayaran tanpa jurnal kas terkait'],['jurnalGanda','Jurnal ganda'],['selisihJurnal','Nominal jurnal tidak cocok'],['selisihAlokasi','Jumlah alokasi berbeda']];
 grid(host,['Pemeriksaan','Jumlah temuan (maks. 100)'],fields.map(([k,v])=>[v,d.jumlahTerlihat?.[k]??0]));
 message(host,d.catatan||'Temuan tidak otomatis menjadi koreksi jurnal.','info-note');
 }catch(e){host.replaceChildren();fail(host,e)}
}
export async function showYearPreflight(host){
 host.replaceChildren();message(host,'Pemeriksaan tahun di D1, bukan pengesahan atau penutupan buku.','info-note');
 const form=E('form');form.className='panel-actions';const year=field('Tahun','number');year.input.value='2026';year.input.min='2000';year.input.max='2200';
 const button=E('button','Periksa tahun');button.className='btn';button.type='submit';form.append(year.label,button);host.append(form);
 const out=E('div');host.append(out);
 form.addEventListener('submit',async e=>{
  e.preventDefault();out.replaceChildren();const y=Number(year.input.value);
  if(!Number.isInteger(y)||y<2000||y>2200){message(out,'Tahun tidak valid.','info-note');return}
  button.disabled=true;message(out,'Memeriksa jurnal dan metadata arsip…');
  try{const d=await api('/api/bookkeeping/year-end/preflight?year='+y);out.replaceChildren();
   message(out,'Status: '+d.status+'; tahun terkunci: '+(d.locked?'ya':'tidak'),'info-note');
   const j=d.journal||{};grid(out,['Transaksi','Debit','Kredit','Selisih periode (bukan saldo akhir)'],[[j.jumlah||0,rupiah(j.debitRp),rupiah(j.kreditRp),rupiah(j.saldoPeriodeRp)]]);
   grid(out,['Pemeriksaan','Temuan'],Object.entries(d.checks||{}));
   message(out,'Saldo awal/arsip: '+(d.balanceArchive?.status||'BELUM_TERVERIFIKASI'),'muted');
   if(d.warning)message(out,d.warning,'info-note');
  }catch(err){out.replaceChildren();fail(out,err)}finally{button.disabled=false}
 });
}
export async function showDendaReadiness(host){
 host.replaceChildren();message(host,'Membaca status rekonsiliasi Denda dan Pinjaman…');
 try{const d=await api('/api/bookkeeping/denda-pinjaman/readiness');host.replaceChildren();
 grid(host,['Jenis','Record','Perlu rekonsiliasi'],[
 ['Denda',d.denda?.jumlah||0,d.denda?.perluRekonsiliasi||0],
 ['Pinjaman',d.pinjaman?.jumlah||0,d.pinjaman?.perluRekonsiliasi||0],
 ['Denda dibayar tanpa rincian',d.denda?.pembayaranTanpaRincianTerpisah||0,'Perlu cek']]);
 message(host,d.alasan||'Belum dapat digunakan sebagai izin aktivasi pembayaran.','info-note');
 }catch(e){host.replaceChildren();fail(host,e)}
}