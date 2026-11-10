/* Flamboyan 4 Pembukuan — compact unpaid view and personal JPG receipts.
   Read only. Uses the existing D1 suggested-period API; never alters accounting.
   No total is inferred from the number of transactions. */
(()=>{
 'use strict';
 if(window.F4BookExtras)return;
 const api='https://api.flamboyan4.web.id/api/bookkeeping/iuran/suggested-period';
 const p2=n=>String(n).padStart(2,'0');
 const money=v=>'Rp '+Math.round(Number(v)||0).toLocaleString('id-ID');
 const months=['','Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'];
 const formatMonth=value=>{
  const m=/^(20\d{2})-(0[1-9]|1[0-2])/.exec(String(value||''));
  return m?months[Number(m[2])]+' '+m[1]:String(value||'-');
 };
 const shortName=str=>String(str||'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,42)||'Warga';
 const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const residents=()=>typeof DATA==='undefined'?[]:(DATA.warga||[]).filter(w=>
  ['ya','aktif'].includes(String(w.statusAktif||'').toLowerCase())&&
  ['qtyIuranBulanan','qtyKebersihan','qtyKasLorong','qtyArisan'].some(k=>Number(w[k]||0)>0));
 const payments=()=>typeof DATA==='undefined'?[]:(DATA.riwayat||[]).filter(r=>String(r.status||'').toUpperCase()==='AKTIF');
 const resident=id=>residents().find(w=>String(w.idWarga)===String(id));
 const feedback=msg=>{if(typeof riwayatMsg==='function')riwayatMsg(msg,'error');else alert(msg);};
 let requestId=0,controller=null,receiptBlob=null,receiptUrl='',receiptName='',openList=false;
 const list=()=>document.getElementById('f4-book-unpaid-list');
 const toggleButton=()=>document.getElementById('f4-book-unpaid-toggle');
 function setList(html){const e=document.getElementById('f4-book-unpaid-content');if(e)e.innerHTML=html;}
 function reset(){
  requestId++;
  if(controller){controller.abort();controller=null;}
  openList=false;
  const e=list();if(e)e.hidden=true;
  const b=toggleButton();if(b)b.setAttribute('aria-expanded','false');
 }
 async function suggested(payerId,signal){
  const url=api+'?'+new URLSearchParams({payerId:String(payerId)});
  const res=await fetch(url,{credentials:'include',mode:'cors',cache:'no-store',signal});
  const data=await res.json().catch(()=>null);
  if(!res.ok||data?.ok!==true)throw new Error(data?.error||'Gagal memeriksa kewajiban (HTTP '+res.status+')');
  const m=/^(20\d{2})-(0[1-9]|1[0-2])(?:-01)?$/.exec(String(data.period||''));
  return {period:m?m[1]+'-'+m[2]:'',remaining:Number(data.remainingRp),lastLunas:String(data.lastLunas||'')};
 }
 function receivedAt(id,period){
  return payments().filter(r=>String(r.idWarga)===String(id)).some(r=>{
   const allocated=(Array.isArray(r.alokasi)?r.alokasi:[]).some(a=>
    String(a.status||'aktif').toLowerCase()==='aktif' &&
    String(a.tahun)+'-'+p2(a.bulan)===period&&Number(a.nominal??a.jumlahRp??0)>0);
   if(allocated)return true;
   if(Array.isArray(r.alokasi)&&r.alokasi.length)return false;
   return (typeof paymentMonthKeys==='function'?paymentMonthKeys(r):[]).includes(period)
    &&Number(r.totalDiterima||0)>0;
  });
 }
 function currentPeriod(){
  const s=window.UPR?.state?.('history-iuran');
  if(s){
   if(s.level!=='month'||s.from!==s.to)return null;
   return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(s.from))?s.from:null;
  }
  const v=document.getElementById('riwayat-period-month')?.value;
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(v||''))?v:null;
 }
 async function toggleUnpaid(){
  const box=list(),btn=toggleButton();
  if(!box||!btn)return;
  if(openList){reset();return;}
  const target=currentPeriod();
  box.hidden=false;openList=true;btn.setAttribute('aria-expanded','true');
  if(!target){
   setList('<div class="f4-unpaid-feedback">Pilih satu bulan pada filter Riwayat Iuran untuk melihat warga yang belum lunas sampai bulan tersebut.</div>');
   return;
  }
  const eligible=residents();
  if(!eligible.length){
   setList('<div class="f4-unpaid-feedback">Tidak ada warga wajib bayar yang aktif pada data acuan.</div>');
   return;
  }
  const ticket=++requestId,abort=new AbortController();controller=abort;
  const header=document.getElementById('f4-book-unpaid-label');
  if(header)header.textContent='Belum lunas s.d. '+formatMonth(target);
  setList('<div class="f4-unpaid-feedback">Memeriksa kewajiban warga… 0/'+eligible.length+'</div>');
  const pending=[],errors=[];
  let cursor=0,done=0;
  const work=async()=>{
   while(cursor<eligible.length&&ticket===requestId){
    const w=eligible[cursor++];
    try{
     const r=await suggested(w.idWarga,abort.signal);
     if(!r.period||!Number.isFinite(r.remaining)||r.remaining<=0)throw Error('Periode atau sisa tagihan tidak tersedia');
     if(r.period<=target)pending.push({w,period:r.period,amount:r.remaining,partial:receivedAt(w.idWarga,r.period)});
    }catch(e){
     if(e.name==='AbortError')return;
     errors.push(String(w.nama||w.idWarga));
    }
    done++;
    if(ticket===requestId&&done<eligible.length)
     setList('<div class="f4-unpaid-feedback">Memeriksa kewajiban warga… '+done+'/'+eligible.length+'</div>');
   }
  };
  await Promise.all(Array.from({length:Math.min(4,eligible.length)},work));
  if(ticket!==requestId)return;
  controller=null;
  pending.sort((a,b)=>{
   const k=x=>String(x.w.blok||'')+'/'+String(x.w.noRumah||'');
   return k(a).localeCompare(k(b),'id',{numeric:true});
  });
  if(!pending.length&&!errors.length){
   setList('<div class="f4-unpaid-feedback">Tidak ada tunggakan sampai '+escapeHtml(formatMonth(target))+'.</div>');
   return;
  }
  const note='<div class="f4-unpaid-feedback">Sisa yang ditampilkan adalah tagihan pada <b>bulan tertua yang belum lunas</b>, bukan penjumlahan semua bulan.</div>';
  const rows=pending.map(item=>{
   const w=item.w,home=[w.blok,w.noRumah].filter(Boolean).join('/');
   return '<div class="f4-unpaid-row"><div><div class="f4-unpaid-name">'+escapeHtml(w.nama||'-')+
    '<span class="f4-unpaid-home">'+escapeHtml(home)+'</span></div><small>Tunggakan sejak '+escapeHtml(formatMonth(item.period))+
    '</small></div><div class="f4-unpaid-due"><strong>'+money(item.amount)+'</strong><span>'+
    (item.partial?'Kurang bayar':'Belum bayar')+'</span></div></div>';
  }).join('');
  const failed=errors.length?'<div class="f4-unpaid-feedback" role="alert">'+errors.length+
   ' warga belum berhasil diperiksa. Muat ulang untuk memastikan daftar lengkap.</div>':'';
  setList('<div class="f4-unpaid-feedback"><b>'+pending.length+
   ' warga terdeteksi belum lunas</b> sampai '+escapeHtml(formatMonth(target))+
   (errors.length?' (daftar belum lengkap)':'')+'.</div>'+rows+note+failed);
 }
 function prepareModal(){
  if(document.getElementById('f4-book-receipt-modal'))return;
  const root=document.createElement('div');
  root.id='f4-book-receipt-modal';
  root.className='f4-ui-dialog f4-book-receipt-overlay';
  root.hidden=true;
  root.setAttribute('role','dialog');
  root.setAttribute('aria-modal','true');
  root.setAttribute('aria-labelledby','f4-book-receipt-title');
  root.innerHTML='<section class="f4-ui-dialog-panel f4-book-receipt-panel">'+
   '<div class="f4-book-receipt-head"><h2 id="f4-book-receipt-title">Resi Pembayaran</h2>'+
   '<button type="button" class="f4-book-receipt-close" aria-label="Tutup resi">×</button></div>'+
   '<div class="f4-book-receipt-preview"><img id="f4-book-receipt-image" alt="Pratinjau resi pembayaran warga"></div>'+
   '<div class="f4-book-receipt-actions"><button type="button" id="f4-book-receipt-download" class="primary">Simpan JPG</button>'+
   '<button type="button" id="f4-book-receipt-share">Bagikan</button></div></section>';
  root.addEventListener('click',e=>{if(e.target===root)closeReceipt();});
  root.querySelector('.f4-book-receipt-close').addEventListener('click',closeReceipt);
  root.querySelector('#f4-book-receipt-download').addEventListener('click',download);
  root.querySelector('#f4-book-receipt-share').addEventListener('click',share);
  document.body.appendChild(root);
 }
 function closeReceipt(){
  const modal=document.getElementById('f4-book-receipt-modal');
  if(modal)modal.hidden=true;
  document.body.style.overflow=modal?.dataset.previousOverflow||'';
  if(receiptUrl){URL.revokeObjectURL(receiptUrl);receiptUrl='';}
  receiptBlob=null;
 }
 function download(){
  if(!receiptBlob||!receiptUrl)return;
  const a=document.createElement('a');
  a.href=receiptUrl;a.download=receiptName;
  document.body.appendChild(a);a.click();a.remove();
 }
 async function share(){
  if(!receiptBlob)return;
  const file=new File([receiptBlob],receiptName,{type:'image/jpeg'});
  if(navigator.share&&navigator.canShare?.({files:[file]})){
   try{await navigator.share({files:[file],title:'Bukti Pembayaran Flamboyan 4'});return;}
   catch(e){if(e.name==='AbortError')return;}
  }
  download();
  alert('Resi JPG sudah disimpan. Lampirkan file tersebut pada chat WhatsApp warga.');
 }
 function line(ctx,x1,y1,x2,y2,color='#e8e1f4'){
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
 }
 function block(ctx,x,y,w,h,r,fill){
  const radius=Math.min(r,w/2,h/2);
  ctx.fillStyle=fill;ctx.beginPath();
  ctx.moveTo(x+radius,y);ctx.lineTo(x+w-radius,y);ctx.quadraticCurveTo(x+w,y,x+w,y+radius);
  ctx.lineTo(x+w,y+h-radius);ctx.quadraticCurveTo(x+w,y+h,x+w-radius,y+h);
  ctx.lineTo(x+radius,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-radius);
  ctx.lineTo(x,y+radius);ctx.quadraticCurveTo(x,y,x+radius,y);ctx.fill();
 }
 function itemized(x){
  const labels={
   IURAN_BULANAN:'Iuran Bulanan / RT',KEBERSIHAN:'Kebersihan',
   KAS_LORONG:'Kas Lorong',ARISAN:'Arisan',DENDA:'Denda',
   DENDA_GOROL:'Denda Gorol'
  };
  const sums=new Map();
  for(const a of Array.isArray(x.alokasi)?x.alokasi:[]){
   if(String(a.status||'aktif').toLowerCase()!=='aktif')continue;
   const key=String(a.jenis||'').toUpperCase();
   const amount=Number(a.nominal??a.jumlahRp??0);
   if(!labels[key]||!Number.isFinite(amount)||amount<=0)continue;
   sums.set(key,(sums.get(key)||0)+amount);
  }
  return [...sums].map(([key,v])=>({label:labels[key],amount:v}));
 }
 function buildReceipt(x,info,check){
  const canvas=document.createElement('canvas');
  const items=itemized(x);
  canvas.width=900;canvas.height=1120+Math.max(0,items.length-4)*54;
  const c=canvas.getContext('2d');
  if(!c)throw Error('Canvas untuk resi tidak tersedia pada browser.');
  const W=canvas.width,H=canvas.height,L=62,R=838;
  c.fillStyle='#fff';c.fillRect(0,0,W,H);
  block(c,0,0,W,225,0,'#5b21b6');
  c.fillStyle='#ede9fe';c.font='600 25px system-ui,sans-serif';
  c.fillText('FLAMBOYAN 4',L,74);
  c.fillStyle='#fff';c.font='800 48px system-ui,sans-serif';
  c.fillText('BUKTI PEMBAYARAN',L,133,760);
  c.font='500 23px system-ui,sans-serif';
  c.fillText('Iuran Warga · Pembukuan',L,180);
  const total=Math.round(Number(x.totalDiterima)||0);
  block(c,L,256,776,134,18,'#f5f3ff');
  c.fillStyle='#64748b';c.font='600 21px system-ui,sans-serif';
  c.fillText('TOTAL DITERIMA',L+25,299);
  c.fillStyle='#4c1d95';c.font='800 46px system-ui,sans-serif';
  c.fillText(money(total),L+25,357,720);
  let y=439;
  function field(k,v){
   c.fillStyle='#64748b';c.font='600 21px system-ui,sans-serif';
   c.fillText(k,L,y);
   c.fillStyle='#1f2937';c.font='700 24px system-ui,sans-serif';
   c.textAlign='right';c.fillText(String(v||'-'),R,y,485);
   c.textAlign='left';y+=53;
  }
  const keys=typeof paymentMonthKeys==='function'?paymentMonthKeys(x):[];
  const periodLabel=keys.length
   ?keys.map(formatMonth).join(', '):(Array.isArray(x.periode)?x.periode.join(', '):String(x.periode||'-'));
  field('Nama warga',x.nama||info.warga?.nama||'-');
  field('Nomor rumah',info.rumah||'-');
  field('Tanggal bayar',typeof histDate==='function'?histDate(x.tanggal):String(x.tanggal||'-'));
  field('Metode',x.metode||'-');
  field('Periode',periodLabel);
  line(c,L,y-24,R,y-24);
  c.fillStyle='#4c1d95';c.font='800 23px system-ui,sans-serif';
  c.fillText('RINCIAN PEMBAYARAN',L,y+18);
  y+=63;
  if(!items.length){
   c.fillStyle='#64748b';c.font='500 19px system-ui,sans-serif';
   c.fillText('Rincian per pos belum tersedia dalam transaksi ini.',L,y);
   y+=42;
  }else{
   for(const it of items){
    c.fillStyle='#334155';c.font='500 23px system-ui,sans-serif';c.fillText(it.label,L,y);
    c.fillStyle='#1f2937';c.font='700 23px system-ui,sans-serif';
    c.textAlign='right';c.fillText(money(it.amount),R,y);c.textAlign='left';y+=51;
   }
  }
  y+=15;
  line(c,L,y-19,R,y-19);
  const remaining=check.status==='KURANG BAYAR'&&Number.isFinite(check.remaining)&&check.remaining>0;
  const statusColor=check.status==='LUNAS'?'#047857':check.status==='KURANG BAYAR'?'#9a5807':'#64748b';
  const statusBg=check.status==='LUNAS'?'#d1fae5':check.status==='KURANG BAYAR'?'#fef3c7':'#f1f5f9';
  block(c,L,y+5,776,105,14,statusBg);
  c.fillStyle=statusColor;c.font='800 19px system-ui,sans-serif';
  c.fillText('STATUS KEWAJIBAN SAAT RESI DIBUAT',L+22,y+40);
  c.font='900 34px system-ui,sans-serif';
  c.fillText(check.status,L+22,y+85);
  y+=146;
  if(remaining){
   c.fillStyle='#92400e';c.font='600 20px system-ui,sans-serif';
   c.fillText('Sisa pada tunggakan '+formatMonth(check.period)+': '+money(check.remaining),L,y,770);
   y+=39;
  }
  c.fillStyle='#64748b';c.font='500 17px system-ui,sans-serif';
  c.fillText('Nomor transaksi: '+String(x.idPembayaran||'-'),L,y+4,770);
  c.fillText('Dibuat: '+new Intl.DateTimeFormat('id-ID',{
   day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',
   timeZone:'Asia/Jakarta'}).format(new Date())+' WIB',L,y+35);
  const footerY=Math.max(y+65,H-77);
  line(c,L,footerY-22,R,footerY-22);
  c.fillStyle='#64748b';c.font='500 18px system-ui,sans-serif';
  c.fillText('Bukti ini dibuat dari transaksi Pembukuan Flamboyan 4.',L,footerY+12,775);
  return canvas;
 }
 async function receipt(id){
  const x=payments().find(r=>String(r.idPembayaran)===String(id));
  if(!x){feedback('Resi hanya dapat dibuat untuk transaksi aktif yang masih tercatat.');return;}
  const payer=String(x.idWarga||'');
  if(!payer){feedback('ID warga transaksi tidak tersedia untuk memeriksa status.');return;}
  try{
   const data=await suggested(payer);
   const keys=typeof paymentMonthKeys==='function'?paymentMonthKeys(x):[];
   const latest=keys.sort().at(-1)||'';
   let status='PERLU CEK';
   if(data.period&&latest)status=data.period<=latest?'KURANG BAYAR':'LUNAS';
   // A partial Kas Lorong allocation remains a shortage in its original payment,
   // even if another transaction was made later.
   if(Number(x.kekuranganKasLorong||0)>0&&status==='LUNAS'){
    // Current obligation is paid; the receipt uses current status, not historical status.
   }
   const info=typeof riwayatResidentInfo==='function'?riwayatResidentInfo(x):{warga:resident(payer),rumah:''};
   const canvas=buildReceipt(x,info,{status,period:data.period,remaining:data.remaining});
   const blob=await new Promise((resolve,reject)=>canvas.toBlob(
    b=>b?resolve(b):reject(Error('Gagal mengubah resi menjadi JPG.')),'image/jpeg',.94));
   prepareModal();
   closeReceipt();
   receiptBlob=blob;
   receiptName='Resi-Flamboyan4-'+shortName(x.nama||info.warga?.nama)+'-'+shortName(x.idPembayaran)+'.jpg';
   receiptUrl=URL.createObjectURL(blob);
   const modal=document.getElementById('f4-book-receipt-modal');
   modal.dataset.previousOverflow=document.body.style.overflow||'';
   modal.querySelector('#f4-book-receipt-image').src=receiptUrl;
   modal.hidden=false;
   document.body.style.overflow='hidden';
  }catch(e){feedback('Resi belum dapat dibuat: '+(e.message||String(e)));}
 }
 function mount(){
  prepareModal();
  const host=document.querySelector('#history-iuran-panel .iuran-quick-head');
  if(!host||document.getElementById('f4-book-unpaid-toggle'))return;
  const btn=document.createElement('button');
  btn.id='f4-book-unpaid-toggle';btn.type='button';
  btn.className='f4-unpaid-trigger';
  btn.setAttribute('aria-expanded','false');
  btn.setAttribute('aria-controls','f4-book-unpaid-list');
  btn.innerHTML='<i data-lucide="users-round"></i><span>Lihat Belum Lunas</span>';
  btn.addEventListener('click',toggleUnpaid);
  host.querySelector('.iuran-quick-note')?.replaceWith(btn);
  const quick=document.getElementById('iuran-quick-summary');
  const box=document.createElement('div');
  box.id='f4-book-unpaid-list';box.className='f4-unpaid-list';box.hidden=true;
  box.innerHTML='<div class="f4-unpaid-list-head"><strong>Warga belum lunas</strong>'+
   '<small id="f4-book-unpaid-label"></small></div><div id="f4-book-unpaid-content" class="f4-unpaid-list-content"></div>';
  quick?.insertAdjacentElement('afterend',box);
  try{window.lucide?.createIcons?.()}catch(e){}
  document.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&!document.getElementById('f4-book-receipt-modal')?.hidden)closeReceipt();
  });
 }
 window.F4BookExtras={toggleUnpaid,receipt,reset,closeReceipt};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})();