/* Flamboyan 4 Pembukuan — compact unpaid view and personal JPG receipts.
   Read only. Uses the existing D1 suggested-period API; never alters accounting.
   No total is inferred from the number of transactions. */
(()=>{
 'use strict';
 if(window.F4BookExtras)return;
 const api='https://api.flamboyan4.web.id/api/bookkeeping/iuran/suggested-period';
 const outstandingApi='https://api.flamboyan4.web.id/api/bookkeeping/iuran/outstanding';
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
 let unpaidPreviousOverflow='';
 const list=()=>document.getElementById('f4-book-unpaid-list');
 const toggleButton=()=>document.getElementById('f4-book-unpaid-toggle');
 function setList(html){const e=document.getElementById('f4-book-unpaid-content');if(e)e.innerHTML=html;}
 function reset(){
  requestId++;
  if(controller){controller.abort();controller=null;}
  if(openList)document.body.style.overflow=unpaidPreviousOverflow;
  openList=false;
  const e=list();if(e)e.hidden=true;
  const b=toggleButton();if(b)b.setAttribute('aria-expanded','false');
 }
 function closeUnpaid(){reset();}
 async function suggested(payerId,signal){
  const url=api+'?'+new URLSearchParams({payerId:String(payerId)});
  const res=await fetch(url,{credentials:'include',mode:'cors',cache:'no-store',signal});
  const data=await res.json().catch(()=>null);
  if(!res.ok||data?.ok!==true)throw new Error(data?.error||'Gagal memeriksa kewajiban (HTTP '+res.status+')');
  const m=/^(20\d{2})-(0[1-9]|1[0-2])(?:-01)?$/.exec(String(data.period||''));
  return {period:m?m[1]+'-'+m[2]:'',remaining:Number(data.remainingRp),lastLunas:String(data.lastLunas||'')};
 }
 async function outstanding(payerId,period,signal){
  const m=/^(20\d{2})-(0[1-9]|1[0-2])$/.exec(String(period||''));
  if(!m)throw Error('Bulan pemeriksaan tidak valid');
  const url=outstandingApi+'?'+new URLSearchParams({
   payerId:String(payerId),year:m[1],month:String(Number(m[2]))
  });
  const res=await fetch(url,{credentials:'include',mode:'cors',cache:'no-store',signal});
  const data=await res.json().catch(()=>null);
  if(!res.ok||!data||data.ok===false||!Array.isArray(data.komponen))
   throw Error(data?.error||'Gagal memeriksa kewajiban bulan (HTTP '+res.status+')');
  let total=0;
  for(const item of data.komponen){
   const value=Number(item.sisaRp);
   if(!Number.isFinite(value)||value<0)throw Error('Nominal kewajiban tidak valid');
   total+=value;
  }
  return total;
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
  unpaidPreviousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
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
  if(header)header.textContent='Kewajiban '+formatMonth(target);
  setList('<div class="f4-unpaid-feedback">Memeriksa kewajiban warga… 0/'+eligible.length+'</div>');
  const pending=[],errors=[];
  let cursor=0,done=0;
  const work=async()=>{
   while(cursor<eligible.length&&ticket===requestId){
    const w=eligible[cursor++];
    try{
     const remaining=await outstanding(w.idWarga,target,abort.signal);
     if(remaining>0)pending.push({w,period:target,amount:remaining,
       partial:receivedAt(w.idWarga,target)});
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
   setList('<div class="f4-unpaid-feedback">Semua kewajiban '+escapeHtml(formatMonth(target))+' sudah lunas.</div>');
   return;
  }
  const note='<div class="f4-unpaid-feedback">Nominal sisa berasal dari kewajiban '+escapeHtml(formatMonth(target))+', sesuai perhitungan Input Iuran.</div>';
  const rows=pending.map(item=>{
   const w=item.w,home=[w.blok,w.noRumah].filter(Boolean).join('/');
   return '<div class="f4-unpaid-row"><div><div class="f4-unpaid-name">'+escapeHtml(w.nama||'-')+
    '<span class="f4-unpaid-home">'+escapeHtml(home)+'</span></div><small>Periode '+escapeHtml(formatMonth(item.period))+
    '</small></div><div class="f4-unpaid-due"><strong>'+money(item.amount)+'</strong><span>'+
    (item.partial?'Kurang bayar':'Belum bayar')+'</span></div></div>';
  }).join('');
  const failed=errors.length?'<div class="f4-unpaid-feedback" role="alert">'+errors.length+
   ' warga belum berhasil diperiksa. Muat ulang untuk memastikan daftar lengkap.</div>':'';
  setList('<div class="f4-unpaid-feedback"><b>'+pending.length+
   ' warga belum lunas</b> untuk '+escapeHtml(formatMonth(target))+
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
   IURAN_BULANAN:'Iuran Bulanan',KEBERSIHAN:'Kebersihan',
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
  // Flamboyan 4 original purple mobile-banking-style paper receipt (JPG).
  // Canvas is measured first so long names, periods and transaction IDs are never cut off.
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Canvas untuk resi tidak tersedia pada browser.');
  const W=900,X=86,R=814,contentWidth=R-X;
  const ink='#201735',secondary='#605a71',purple='#5b21b6',muted='#6d28d9';
  function font(size,weight=500){return String(weight)+' '+size+'px system-ui,Arial,sans-serif';}
  function wrap(value,width,size,weight=500){
   const str=String(value==null||value===''?'-':value).replace(/\s+/g,' ').trim();
   ctx.font=font(size,weight);
   const words=str.split(' '),out=[];let current='';
   for(let word of words){
    const candidate=current?current+' '+word:word;
    if(ctx.measureText(candidate).width<=width){current=candidate;continue;}
    if(current){out.push(current);current='';}
    while(word && ctx.measureText(word).width>width){
     let n=1;
     while(n<word.length && ctx.measureText(word.slice(0,n+1)).width<=width)n++;
     out.push(word.slice(0,n));word=word.slice(n);
    }
    current=word;
   }
   if(current)out.push(current);
   return out.length?out:['-'];
  }
  const monthKeys=typeof paymentMonthKeys==='function'?paymentMonthKeys(x):[];
  const periodLabel=monthKeys.length
   ?monthKeys.map(formatMonth).join(', ')
   :(Array.isArray(x.periode)?x.periode.join(', '):String(x.periode||'-'));
  const rows=[
   ['Nama warga',x.nama||info.warga?.nama||'-'],
   ['Nomor rumah',info.rumah||'-'],
   ['Tanggal bayar',typeof histDate==='function'?histDate(x.tanggal):String(x.tanggal||'-')],
   ['Metode bayar',x.metode||'-'],
   ['Periode',periodLabel]
  ].map(([label,value])=>({label,lines:wrap(value,438,29,700)}));
  const items=itemized(x).map(item=>({amount:item.amount,lines:wrap(item.label,460,29,550)}));
  const status=String(check.status||'PERLU CEK').toUpperCase();
  const shortage=status==='KURANG BAYAR'&&Number.isFinite(check.remaining)&&check.remaining>0;
  const statusLabel=status==='LUNAS'?'LUNAS':status==='KURANG BAYAR'?'KURANG BAYAR':'PERLU CEK';
  const identifier=String(x.idPembayaran||'-');
  const idLines=wrap(identifier,contentWidth-40,24,650);
  const made=new Intl.DateTimeFormat('id-ID',{
   day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',
   timeZone:'Asia/Jakarta'
  }).format(new Date())+' WIB';
  const moneyValue=money(x.totalDiterima);
  // Compute all heights before painting, avoiding a fixed bottom gap.
  const top=28,headerY=53,headerH=278,amountY=365,detailsHeaderY=545;
  let y=584;
  for(const row of rows){row.y=y;y+=Math.max(62,26+row.lines.length*38);}
  const detailsEnd=y+10,itemsHeaderY=detailsEnd+36;
  y=itemsHeaderY+39;
  if(items.length){
   for(const item of items){item.y=y;y+=Math.max(57,25+item.lines.length*36);}
  }else{
   y+=63;
  }
  const statusY=y+39,statusH=shortage?188:144;
  const metaY=statusY+statusH+39;
  const metaHeight=70+idLines.length*34+55;
  const footerY=metaY+metaHeight+16;
  const paperBottom=footerY+140;
  const H=Math.ceil(paperBottom+28);
  canvas.width=W;canvas.height=H;
  const c=canvas.getContext('2d');
  if(!c)throw Error('Gagal menggambar resi JPG.');
  c.fillStyle='#f2ecff';c.fillRect(0,0,W,H);
  // One continuous receipt silhouette, with large inward notches top/bottom
  // and smaller notches on the sides. No dots, punched circles, or tiny zigzags.
  {
   const left=34,right=866,corner=18,upper=top-9,lower=paperBottom-18;
   const w=right-left-corner*2,h=lower-upper-corner*2;
   const nx=Math.max(8,Math.round(w/62)), ny=Math.max(8,Math.round(h/48));
   const dx=w/nx,dy=h/ny,depth=34,sideDepth=11;
   c.save();
   c.shadowColor='rgba(50,28,104,.12)';
   c.shadowBlur=15;c.shadowOffsetY=5;
   c.fillStyle='#ffffff';
   c.beginPath();
   let px=left+corner;
   c.moveTo(px,upper);
   for(let i=0;i<nx;i++){
    const next=left+corner+(i+1)*dx;
    c.bezierCurveTo(px+dx*.24,upper+depth,next-dx*.24,upper+depth,next,upper);
    px=next;
   }
   c.quadraticCurveTo(right,upper,right,upper+corner);
   let py=upper+corner;
   for(let i=0;i<ny;i++){
    const next=upper+corner+(i+1)*dy;
    c.bezierCurveTo(right-sideDepth,py+dy*.24,right-sideDepth,next-dy*.24,right,next);
    py=next;
   }
   c.quadraticCurveTo(right,lower,right-corner,lower);
   px=right-corner;
   for(let i=0;i<nx;i++){
    const next=right-corner-(i+1)*dx;
    c.bezierCurveTo(px-dx*.24,lower-depth,next+dx*.24,lower-depth,next,lower);
    px=next;
   }
   c.quadraticCurveTo(left,lower,left,lower-corner);
   py=lower-corner;
   for(let i=0;i<ny;i++){
    const next=lower-corner-(i+1)*dy;
    c.bezierCurveTo(left+sideDepth,py-dy*.24,left+sideDepth,next+dy*.24,left,next);
    py=next;
   }
   c.quadraticCurveTo(left,upper,left+corner,upper);
   c.closePath();
   c.fill();
   c.restore();
  }
  // Branded purple header, independently designed for Flamboyan 4.
  block(c,51,headerY,798,headerH,17,purple);
  c.fillStyle='rgba(255,255,255,.07)';
  c.beginPath();c.arc(805,85,115,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(84,330,110,0,Math.PI*2);c.fill();
  c.textAlign='center';
  c.fillStyle='#f4ecff';c.font=font(29,800);c.fillText('FLAMBOYAN 4',W/2,106);
  // Confirmation mark in a circle: a distinct non-bank mark.
  c.fillStyle='#ffffff';c.beginPath();c.arc(W/2,178,42,0,Math.PI*2);c.fill();
  c.strokeStyle=purple;c.lineWidth=8;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.moveTo(W/2-18,178);c.lineTo(W/2-3,192);c.lineTo(W/2+22,164);c.stroke();
  c.fillStyle='#ffffff';c.font=font(44,800);c.fillText('Pembayaran Berhasil',W/2,266,710);
  c.font=font(25,500);c.fillStyle='#efe7ff';c.fillText('Bukti Iuran Warga',W/2,302);
  // Amount is the primary element: legible after scaling for WhatsApp.
  c.fillStyle=secondary;c.font=font(25,750);c.fillText('TOTAL PEMBAYARAN',W/2,403);
  c.fillStyle=purple;c.font=font(66,850);c.fillText(moneyValue,W/2,478,690);
  c.textAlign='left';
  function dash(y0){
   c.save();c.setLineDash([11,9]);line(c,X,y0,R,y0,'#d9cdec');c.restore();
  }
  dash(514);
  c.fillStyle=muted;c.font=font(26,800);c.fillText('DETAIL PEMBAYARAN',X,detailsHeaderY);
  for(const row of rows){
   c.fillStyle=secondary;c.font=font(26,500);c.textAlign='left';
   c.fillText(row.label,X,row.y+29);
   c.fillStyle=ink;c.font=font(29,700);c.textAlign='right';
   row.lines.forEach((part,i)=>c.fillText(part,R,row.y+30+i*38,445));
  }
  c.textAlign='left';dash(detailsEnd+2);
  c.fillStyle=muted;c.font=font(26,800);c.fillText('RINCIAN IURAN',X,itemsHeaderY);
  if(!items.length){
   c.fillStyle=secondary;c.font=font(25,500);
   c.fillText('Rincian per pos tidak tersedia.',X,itemsHeaderY+63);
  }
  for(const item of items){
   c.fillStyle=ink;c.font=font(29,550);c.textAlign='left';
   item.lines.forEach((part,i)=>c.fillText(part,X,item.y+27+i*36,480));
   c.fillStyle=ink;c.font=font(29,750);c.textAlign='right';
   c.fillText(money(item.amount),R,item.y+27,260);
  }
  c.textAlign='left';dash(statusY-18);
  const good=status==='LUNAS',warn=status==='KURANG BAYAR';
  const bg=good?'#d5f7e9':warn?'#fff0ce':'#ede9f3';
  const tone=good?'#087554':warn?'#9b5506':'#584e6a';
  block(c,X,statusY,contentWidth,statusH,17,bg);
  c.fillStyle=tone;c.font=font(24,800);
  c.fillText('STATUS PEMBAYARAN',X+26,statusY+40);
  c.font=font(43,850);c.fillText(statusLabel,X+26,statusY+95);
  if(shortage){
   c.font=font(25,650);
   const s='Sisa '+formatMonth(check.period)+': '+money(check.remaining);
   c.fillText(s,X+26,statusY+147,contentWidth-52);
  }
  c.fillStyle=secondary;c.font=font(24,650);
  c.fillText('Nomor transaksi',X,metaY+27);
  c.fillStyle=ink;c.font=font(24,650);
  idLines.forEach((part,i)=>c.fillText(part,X,metaY+64+i*34,contentWidth));
  const dateY=metaY+70+idLines.length*34;
  c.fillStyle=secondary;c.font=font(24,500);c.fillText('Dibuat: '+made,X,dateY+21,contentWidth);
  dash(footerY-12);
  c.textAlign='center';c.fillStyle=purple;c.font=font(26,800);
  c.fillText('Flamboyan 4',W/2,footerY+35);
  c.fillStyle=secondary;c.font=font(22,500);
  c.fillText('Bukti pembayaran dari Pembukuan Warga',W/2,footerY+68,contentWidth);
  c.textAlign='left';
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
  const box=document.createElement('div');
  box.id='f4-book-unpaid-list';box.className='f4-ui-dialog f4-unpaid-overlay';box.hidden=true;
  box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
  box.setAttribute('aria-labelledby','f4-book-unpaid-heading');
  box.innerHTML='<section class="f4-ui-dialog-panel f4-unpaid-panel">'+
   '<div class="f4-unpaid-list-head">'+
   '<div><strong id="f4-book-unpaid-heading">Warga belum lunas</strong>'+
   '<small id="f4-book-unpaid-label"></small></div>'+
   '<button type="button" class="f4-unpaid-close" aria-label="Tutup daftar belum lunas" title="Tutup"><i data-lucide="x"></i></button>'+
   '</div><div id="f4-book-unpaid-content" class="f4-unpaid-list-content"></div></section>';
  box.addEventListener('click',event=>{if(event.target===box)closeUnpaid()});
  box.querySelector('.f4-unpaid-close').addEventListener('click',closeUnpaid);
  document.body.appendChild(box);
  try{window.lucide?.createIcons?.()}catch(e){}
  document.addEventListener('keydown',e=>{
   if(e.key==='Escape'){
    if(!document.getElementById('f4-book-receipt-modal')?.hidden)closeReceipt();
    else if(openList)closeUnpaid();
   }
  });
 }
 window.F4BookExtras={toggleUnpaid,receipt,reset,closeUnpaid,closeReceipt};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})();