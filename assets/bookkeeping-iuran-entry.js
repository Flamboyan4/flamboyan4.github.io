/* Input Iuran D1 — staging; GET preview, atomic POST (only if Worker write flags enabled). */
import {api} from './api.js';
const names={IURAN_BULANAN:'Iuran bulanan',KEBERSIHAN:'Kebersihan',KAS_LORONG:'Kas lorong',ARISAN:'Arisan'};
const kinds=Object.keys(names);
const money=x=>'Rp '+new Intl.NumberFormat('id-ID').format(Number(x)||0);
const el=(tag,text)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=String(text);return x};
const msg=(parent,s,cls='info-note')=>{const x=el('p',s);x.className=cls;parent.append(x)};
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function field(title,type,value){
 const label=el('label');label.style.cssText='display:grid;gap:5px;min-width:165px';label.append(el('strong',title));
 const control=el(type==='select'?'select':'input');
 if(type!=='select')control.type=type;if(value!==undefined)control.value=value;
 control.style.cssText='width:100%;padding:10px;border:1px solid #ced1db;border-radius:8px';
 label.append(control);return {label,control};
}
function periodsFrom(start,count){
 if(!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(start)||!Number.isInteger(count)||count<1||count>12)throw Error('Periode tidak valid: pilih 1–12 bulan.');
 const [y,m]=start.split('-').map(Number);
 return Array.from({length:count},(_,i)=>{const n=y*12+m-1+i;return {tahun:Math.floor(n/12),bulan:n%12+1}})
}
export function makePayment({payerId,tanggal,metode,catatan,requestKey,statements,partialKas={}}){
 if(!payerId||!requestKey||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(tanggal))throw Error('ID warga/tanggal tidak valid.');
 if(!['Cash','QRIS','Transfer Mandiri'].includes(metode))throw Error('Metode tidak valid.');
 if(!Array.isArray(statements)||statements.length<1||statements.length>12)throw Error('Periode harus 1–12 bulan.');
 const alokasi=[],seen=new Set();
 for(const p of statements){
  const label=p.tahun+'-'+String(p.bulan).padStart(2,'0');
  if(p.payerId!==payerId||seen.has(label))throw Error('Kewajiban warga/periode tidak konsisten.');
  seen.add(label);
  const map=new Map((p.komponen||[]).map(c=>[c.jenis,c]));
  if(map.size!==4||kinds.some(x=>!map.has(x)))throw Error('Komponen iuran D1 tidak lengkap.');
  for(const jenis of kinds){
   const due=Number(map.get(jenis).sisaRp),override=partialKas[label];
   const value=jenis==='KAS_LORONG'&&override!==undefined?Number(override):due;
   if(!Number.isSafeInteger(value)||!Number.isSafeInteger(due)||value<0||value>due)throw Error('Kas lorong tidak boleh melebihi sisa kewajiban.');
   alokasi.push({tahun:p.tahun,bulan:p.bulan,jenis,nominal:value});
  }
 }
 const jumlahRp=alokasi.reduce((n,a)=>n+a.nominal,0);
 if(!Number.isSafeInteger(jumlahRp)||jumlahRp<=0)throw Error('Periode terpilih sudah lunas atau tanpa tagihan.');
 return {payerId,tanggal,metode,catatan:catatan.trim(),requestKey,jumlahRp,alokasi};
}
export async function showIuranEntry(host){
 host.replaceChildren();
 msg(host,'Input iuran lengkap dari D1. Satu pembayaran menyimpan seluruh alokasi dan satu jurnal kas secara atomik. Selama flag Worker belum diaktifkan, tombol simpan akan ditolak tanpa mengubah data.','info-note');
 const form=el('form');form.className='panel-actions';form.noValidate=true;
 const payer=field('Pembayar','select'),start=field('Bulan pertama','month',today().slice(0,7));
 const count=field('Jumlah bulan','number','1'),date=field('Tanggal diterima','date',today());
 const method=field('Metode','select'),note=field('Catatan','text','');
 count.control.min='1';count.control.max='12';
 const choose=el('option','Pilih pembayar');choose.value='';payer.control.append(choose);
 for(const name of ['Cash','QRIS','Transfer Mandiri']){const item=el('option',name);item.value=name;method.control.append(item)}
 const check=el('button','Periksa tagihan D1');check.type='submit';check.className='btn';
 form.append(payer.label,start.label,count.label,date.label,method.label,note.label,check);
 host.append(form);const status=el('div');status.setAttribute('aria-live','polite');host.append(status);
 const area=el('div');host.append(area);
 let generation=0;
 const reset=()=>{generation++;area.replaceChildren();status.replaceChildren()};
 for(const ctrl of [payer.control,start.control,count.control,date.control,method.control,note.control]){
  ctrl.addEventListener('change',reset);ctrl.addEventListener('input',reset);
 }
 try{
  const r=await api('/api/bookkeeping/iuran/payers');
  for(const p of r.data||[]){const o=el('option',[p.nama,p.blok,p.noRumah].filter(Boolean).join(' · '));o.value=p.payerId;payer.control.append(o)}
 }catch(e){msg(status,'Pembayar D1 belum tersedia: '+(e?.message||'API error'))}
 form.addEventListener('submit',async event=>{
  event.preventDefault();reset();
  if(!payer.control.value){msg(status,'Pilih pembayar dahulu.');return}
  let periods;try{periods=periodsFrom(start.control.value,Number(count.control.value))}catch(e){msg(status,e.message);return}
  const serial=generation;check.disabled=true;msg(status,'Memuat kewajiban '+periods.length+' bulan…','muted');
  const payerId=payer.control.value;
  try{
   const statements=await Promise.all(periods.map(p=>api('/api/bookkeeping/iuran/outstanding?payerId='+encodeURIComponent(payerId)+'&year='+p.tahun+'&month='+p.bulan)));
   if(serial!==generation)return;
   if(statements.some(p=>p.payerId!==payerId))throw Error('Data warga tidak sesuai.');
   status.replaceChildren();render(statements,payerId);
  }catch(e){if(serial===generation){status.replaceChildren();msg(status,'Pratinjau D1 gagal: '+(e.message||'API error')+'. Tidak ada pembayaran yang dicatat.')}}
  finally{check.disabled=false}
 });
 function render(statements,payerId){
  area.replaceChildren();const kas={},request={value:crypto.randomUUID()};
  const wrap=el('div');wrap.className='data-wrap';const table=el('table');table.className='data-table';
  const head=el('tr');['Periode','Komponen','Wajib','Terbayar','Sisa','Nominal bayar'].forEach(t=>head.append(el('th',t)));table.append(head);
  const kasFields=[];
  for(const period of statements){
   const per=period.tahun+'-'+String(period.bulan).padStart(2,'0');
   for(const c of period.komponen){
    const line=el('tr');[per,names[c.jenis]||c.jenis,money(c.wajibRp),money(c.terbayarRp),money(c.sisaRp)].forEach(v=>line.append(el('td',v)));
    const td=el('td');
    if(c.jenis==='KAS_LORONG'&&Number(c.sisaRp)>0){
     const input=el('input');input.type='number';input.min='0';input.max=String(c.sisaRp);input.step='1';input.value=String(c.sisaRp);
     input.style.cssText='width:125px;max-width:100%';input.setAttribute('aria-label','Bayar kas lorong '+per);
     input.addEventListener('input',()=>{kas[per]=input.value===''?-1:Number(input.value);update()});td.append(input);kasFields.push(input);
    }else td.textContent=money(c.sisaRp);
    line.append(td);table.append(line);
   }
  }
  wrap.append(table);area.append(wrap);
  const total=el('p');total.style.fontWeight='bold';area.append(total);
  const confirm=el('label');confirm.style.cssText='display:flex;gap:8px;align-items:start;margin:12px 0';
  const checkbox=el('input');checkbox.type='checkbox';confirm.append(checkbox,el('span','Saya sudah menerima dana sesuai nominal, periode, dan metode yang diperiksa.'));area.append(confirm);
  const save=el('button','Simpan pembayaran ke D1');save.type='button';save.className='btn';save.disabled=true;area.append(save);
  msg(area,'Penyimpanan tetap dikunci oleh FINANCE_WRITE_ENABLED dan IURAN_WRITE_ENABLED di Worker staging sampai siap diaktifkan.','muted small');
  const result=el('div');result.setAttribute('aria-live','polite');area.append(result);
  let payload=null,submitted=false,complete=false;
  function update(){
   if(submitted||complete){save.disabled=true;return}
   request.value=crypto.randomUUID();checkbox.checked=false;
   try{payload=makePayment({payerId,tanggal:date.control.value,metode:method.control.value,catatan:note.control.value,requestKey:request.value,statements,partialKas:kas});
    total.textContent='Jumlah diterima: '+money(payload.jumlahRp);save.disabled=true;
   }catch(e){payload=null;total.textContent=e.message;save.disabled=true}
  }
  checkbox.addEventListener('change',()=>{save.disabled=!checkbox.checked||!payload||submitted||complete});
  kasFields.forEach(f=>f.addEventListener('change',update));
  update();
  save.addEventListener('click',async()=>{
   if(!payload||!checkbox.checked||submitted||complete)return;
   submitted=true;save.disabled=true;checkbox.disabled=true;result.replaceChildren();msg(result,'Mengirim satu pembayaran atomik ke D1…','muted');
   // Keep this exact requestKey & payload on retries: never mint another key after a network error.
   const fixed=JSON.parse(JSON.stringify(payload));
   try{
    const r=await api('/api/bookkeeping/iuran',{method:'POST',json:fixed});
    complete=true;result.replaceChildren();msg(result,(r.duplikat?'Pembayaran sudah tersimpan sebelumnya. ':'Pembayaran berhasil disimpan. ')+
      'ID: '+r.idPembayaran+' · '+money(fixed.jumlahRp)+'. Periksa di Riwayat Iuran dan Kas.');
    save.textContent='Tersimpan';save.disabled=true;
   }catch(e){
    result.replaceChildren();
    if(e.status===503){msg(result,'Worker staging masih menolak transaksi tulis. Ini bukan kegagalan data.');submitted=false;checkbox.disabled=false;save.disabled=!checkbox.checked}
    else if(e.status===0){msg(result,'Koneksi terputus: status transaksi BELUM PASTI. Coba ulangi kunci yang sama atau cek Riwayat sebelum membuat transaksi baru.');submitted=false;checkbox.disabled=false;save.disabled=false;save.textContent='Ulangi permintaan yang sama'}
    else if(e.status===409){msg(result,'Ditolak: tagihan berubah, lunas, atau periode terkunci. Periksa ulang sebelum mencoba lagi.')}
    else msg(result,'Penyimpanan belum terkonfirmasi: '+(e.message||'Kesalahan API')+'. Periksa riwayat sebelum membuat ulang.');
   }
  });
 }
}