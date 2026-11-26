/* Original Flamboyan 4 receipt renderer, extracted from transaction-receipts.js.
   The viewer owns its lifecycle and never posts a transaction. */
const money=n=>'Rp '+Math.round(Number(n)||0).toLocaleString('id-ID');
const text=v=>String(v==null||v===''?'-':v).replace(/\s+/g,' ').trim();
const safePart=s=>text(s).replace(/[^a-z0-9-]+/gi,'-').replace(/^-|-$/g,'').slice(0,44)||'Transaksi';
 function draw(record){
  // Visual is deliberately based on buildReceipt() in bookkeeping-extras.js:
  // white scalloped ticket, generous purple/green banner, clear amount,
  // two-column detail list, dashed separators and a mint status card.
  const bank=record.scope==='bank';
  const theme=bank?{
   primary:'#198653',accent:'#177947',ink:'#183127',secondary:'#587064',
   paper:'#eaf6ee',pale:'#e3f5e9',headText:'#ecfff2',line:'#cce3d4',
   decoration:'rgba(255,255,255,.09)'
  }:{
   primary:'#5b21b6',accent:'#6d28d9',ink:'#201735',secondary:'#605a71',
   paper:'#f2ecff',pale:'#f4e9ff',headText:'#efe7ff',line:'#d9cdec',
   decoration:'rgba(255,255,255,.07)'
  };
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Browser tidak mendukung pembuatan JPG.');
  const W=900,X=86,R=814,CW=R-X;
  const font=(size,weight=500)=>String(weight)+' '+size+'px system-ui,Arial,sans-serif';
  const wrap=(value,maxWidth,size=29,weight=700)=>{
   const source=text(value);
   ctx.font=font(size,weight);
   const words=source.split(' '),out=[];
   let current='';
   for(let word of words){
    const candidate=current?current+' '+word:word;
    if(ctx.measureText(candidate).width<=maxWidth){current=candidate;continue;}
    if(current){out.push(current);current='';}
    while(word&&ctx.measureText(word).width>maxWidth){
     let n=1;
     while(n<word.length&&ctx.measureText(word.slice(0,n+1)).width<=maxWidth)n++;
     out.push(word.slice(0,n));word=word.slice(n);
    }
    current=word;
   }
   if(current)out.push(current);
   return out.length?out:['-'];
  };
  function rect(c,x,y,w,h,r,fill){
   const rad=Math.min(r,w/2,h/2);
   c.fillStyle=fill;c.beginPath();
   c.moveTo(x+rad,y);c.lineTo(x+w-rad,y);
   c.quadraticCurveTo(x+w,y,x+w,y+rad);
   c.lineTo(x+w,y+h-rad);c.quadraticCurveTo(x+w,y+h,x+w-rad,y+h);
   c.lineTo(x+rad,y+h);c.quadraticCurveTo(x,y+h,x,y+h-rad);
   c.lineTo(x,y+rad);c.quadraticCurveTo(x,y,x+rad,y);
   c.fill();
  }
  const status=text(record.status||'TERCATAT').toUpperCase();
  const complete=/^(LUNAS|TERBAYAR|DIBAYARKAN|DITERIMA|SUDAH DIBAYAR|TERKONFIRMASI)$/.test(status);
  const pending=/ESTIMASI|BELUM|SEBAGIAN|MENUNGGU|PROSES|PERIKSA|KURANG/.test(status);
  const green=complete;
  const indicator=green?'#d5f7e9':pending?'#fff0ce':'#e7f2ed';
  const indicatorInk=green?'#087554':pending?'#9b5506':theme.accent;
  const bannerTitle=String(record.heading||
   (status==='LUNAS'||status==='TERBAYAR'||status==='SUDAH DIBAYAR'||status==='DIBAYARKAN'
    ?'Pembayaran Berhasil'
    :status==='TERKONFIRMASI'?'Setoran Terkonfirmasi'
    :status==='DITERIMA'?'Penjualan Diterima'
    :bank?'Transaksi Tercatat':'Transaksi Tercatat'));
  const subtitle=String(record.title||'Bukti Transaksi');
  const details=[
   [bank?'Nama':'Nama warga',record.party||'-'],
   ['Nomor rumah',record.house||'-'],
   ['Tanggal '+(complete?'bayar':'transaksi'),record.date||'-'],
   ['Metode'+(complete?' bayar':''),record.method||'-']
  ];
  for(const field of Array.isArray(record.details)?record.details:[]){
   if(Array.isArray(field)&&field[0]&&field[1]!=null&&field[1]!=='')
    details.push([text(field[0]),text(field[1])]);
  }
  const rows=details.map(([label,value])=>({label,lines:wrap(value,438,29,700)}));
  const explicit=Array.isArray(record.items)?record.items.filter(x=>x&&x.label):[];
  // An item line is used for non-itemized records, just as iuran has
  // its per-component rows. No extra money is implied or created.
  const items=(explicit.length?explicit:[{
   label:record.amountLabel||'Nominal transaksi',amount:Number(record.amount)
  }]).map(x=>({
   lines:wrap(x.label,460,29,550),
   amount:Number.isSafeInteger(Number(x.amount))?Number(x.amount):null
  }));
  const identifier=text(record.id);
  const idLines=wrap(identifier,CW-40,24,650);
  const noteLines=wrap(record.note||'Bukti transaksi dari Flamboyan 4.',CW,22,500);
  const made=new Intl.DateTimeFormat('id-ID',{
   day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',
   timeZone:'Asia/Jakarta'
  }).format(new Date())+' WIB';
  const headerLines=wrap(bannerTitle,708,42,800);
  const subtitleLines=wrap(subtitle,710,25,500);
  const amountText=money(record.amount);
  const labelText=text(record.amountLabel||'TOTAL TRANSAKSI').toUpperCase();
  // Calculate size before drawing to keep receipt tight on tall phone screens.
  const top=28,headerY=53,headerH=278,amountY=365,detailsHeaderY=545;
  let y=584;
  for(const row of rows){row.y=y;y+=Math.max(62,26+row.lines.length*38);}
  const detailsEnd=y+10,itemsHeaderY=detailsEnd+36;
  y=itemsHeaderY+39;
  for(const item of items){item.y=y;y+=Math.max(57,25+item.lines.length*36);}
  const statusY=y+39,statusH=144;
  const metaY=statusY+statusH+39;
  const noteTop=metaY+70+idLines.length*34+48;
  const footerY=noteTop+noteLines.length*32+40;
  const paperBottom=footerY+140;
  const H=Math.ceil(paperBottom+28);
  canvas.width=W;canvas.height=H;
  const c=canvas.getContext('2d');
  if(!c)throw Error('Tidak bisa menggambar resi.');
  c.fillStyle=theme.paper;c.fillRect(0,0,W,H);
  // Same ticket-cut geometry as the original Iuran Warga receipt.
  {
   const left=34,right=866,upper=top+3,lower=paperBottom-6;
   const corner=11,topRadius=10,notchRadius=22;
   const notchY=Math.max(upper+60,Math.min(lower-60,detailsEnd+2));
   const width=right-left-corner*2;
   const count=Math.max(12,Math.round(width/31));
   const step=width/count;
   c.save();
   c.fillStyle='#fff';
   c.shadowColor=bank?'rgba(14,72,40,.11)':'rgba(44,25,92,.10)';
   c.shadowBlur=13;c.shadowOffsetY=4;
   c.beginPath();c.moveTo(left+corner,upper);
   for(let i=0;i<count;i++){
    const x0=left+corner+i*step,cx=x0+step/2;
    c.lineTo(cx-topRadius,upper);
    c.arc(cx,upper,topRadius,Math.PI,0,true);
   }
   c.lineTo(right-corner,upper);
   c.quadraticCurveTo(right,upper,right,upper+corner);
   c.lineTo(right,notchY-notchRadius);
   c.arc(right,notchY,notchRadius,-Math.PI/2,Math.PI/2,true);
   c.lineTo(right,lower-corner);
   c.quadraticCurveTo(right,lower,right-corner,lower);
   for(let i=count-1;i>=0;i--){
    const x0=left+corner+i*step,cx=x0+step/2;
    c.lineTo(cx+topRadius,lower);
    c.arc(cx,lower,topRadius,0,Math.PI,true);
   }
   c.lineTo(left+corner,lower);
   c.quadraticCurveTo(left,lower,left,lower-corner);
   c.lineTo(left,notchY+notchRadius);
   c.arc(left,notchY,notchRadius,Math.PI/2,-Math.PI/2,true);
   c.lineTo(left,upper+corner);
   c.quadraticCurveTo(left,upper,left+corner,upper);
   c.closePath();c.fill();c.restore();
  }
  rect(c,51,headerY,798,headerH,17,theme.primary);
  c.fillStyle=theme.decoration;c.beginPath();
  c.arc(805,85,115,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(84,330,110,0,Math.PI*2);c.fill();
  c.textAlign='center';
  c.fillStyle=theme.headText;c.font=font(bank?27:29,800);
  c.fillText(bank?'BANK SAMPAH FLAMBOYAN 4':'FLAMBOYAN 4',W/2,106,740);
  // White circular emblem, as in Iuran Warga. Use a clock mark when pending
  // so an estimate or unpaid sale never looks like payment confirmation.
  c.fillStyle='#fff';c.beginPath();c.arc(W/2,178,42,0,Math.PI*2);c.fill();
  c.strokeStyle=theme.primary;c.lineWidth=8;c.lineCap='round';c.lineJoin='round';
  if(pending){
   c.beginPath();c.arc(W/2,178,23,0,Math.PI*2);c.stroke();
   c.beginPath();c.moveTo(W/2,164);c.lineTo(W/2,179);c.lineTo(W/2+12,187);c.stroke();
  }else{
   c.beginPath();c.moveTo(W/2-18,178);c.lineTo(W/2-3,192);
   c.lineTo(W/2+22,164);c.stroke();
  }
  c.fillStyle='#fff';c.font=font(headerLines.length>1?32:42,800);
  headerLines.slice(0,2).forEach((line,i)=>
   c.fillText(line,W/2,headerLines.length>1?244+i*36:266,710));
  c.font=font(25,500);c.fillStyle=theme.headText;
  subtitleLines.slice(0,2).forEach((line,i)=>
   c.fillText(line,W/2,subtitleLines.length>1?295+i*26:302,710));
  c.fillStyle=theme.secondary;c.font=font(25,750);
  c.fillText(labelText,W/2,403,700);
  c.fillStyle=theme.primary;c.font=font(66,850);
  c.fillText(amountText,W/2,478,690);
  c.textAlign='left';
  function dash(yy){
   c.save();c.setLineDash([11,9]);
   c.strokeStyle=theme.line;c.lineWidth=2;
   c.beginPath();c.moveTo(X,yy);c.lineTo(R,yy);c.stroke();
   c.restore();
  }
  dash(514);
  c.fillStyle=theme.accent;c.font=font(26,800);
  c.fillText('DETAIL '+(complete?'PEMBAYARAN':'TRANSAKSI'),X,detailsHeaderY);
  for(const row of rows){
   c.fillStyle=theme.secondary;c.font=font(26,500);c.textAlign='left';
   c.fillText(row.label,X,row.y+29);
   c.fillStyle=theme.ink;c.font=font(29,700);c.textAlign='right';
   row.lines.forEach((part,i)=>c.fillText(part,R,row.y+30+i*38,445));
  }
  c.textAlign='left';dash(detailsEnd+2);
  c.fillStyle=theme.accent;c.font=font(26,800);
  c.fillText('RINCIAN '+(complete?'PEMBAYARAN':'TRANSAKSI'),X,itemsHeaderY);
  for(const item of items){
   c.fillStyle=theme.ink;c.font=font(29,550);c.textAlign='left';
   item.lines.forEach((part,i)=>c.fillText(part,X,item.y+27+i*36,480));
   if(item.amount!=null){
    c.fillStyle=theme.ink;c.font=font(29,750);c.textAlign='right';
    c.fillText(money(item.amount),R,item.y+27,260);
   }
  }
  c.textAlign='left';dash(statusY-18);
  rect(c,X,statusY,CW,statusH,17,indicator);
  c.fillStyle=indicatorInk;c.font=font(24,800);
  c.fillText('STATUS TRANSAKSI',X+26,statusY+40);
  c.font=font(40,850);
  c.fillText(status,X+26,statusY+95,CW-52);
  c.fillStyle=theme.secondary;c.font=font(24,650);
  c.fillText('Nomor transaksi',X,metaY+27);
  c.fillStyle=theme.ink;c.font=font(24,650);
  idLines.forEach((line,i)=>c.fillText(line,X,metaY+64+i*34,CW));
  c.fillStyle=theme.secondary;c.font=font(24,500);
  c.fillText('Dibuat: '+made,X,metaY+70+idLines.length*34+21,CW);
  c.fillStyle=theme.secondary;c.font=font(22,500);
  noteLines.forEach((line,i)=>c.fillText(line,X,noteTop+24+i*32,CW));
  dash(footerY-12);
  c.textAlign='center';c.fillStyle=theme.primary;c.font=font(26,800);
  c.fillText('Flamboyan 4',W/2,footerY+35);
  c.fillStyle=theme.secondary;c.font=font(22,500);
  c.fillText(bank?'Bukti transaksi dari Bank Sampah Flamboyan 4':
   'Bukti pembayaran dari Pembukuan Warga',W/2,footerY+68,CW);
  c.textAlign='left';
  return canvas;
 }

const positive=v=>typeof v==='number'&&Number.isSafeInteger(v)&&v>0;
const verifiedId=v=>typeof v==='string'&&v.trim()&&v.length<=180&&!/^D1-\d+$/i.test(v);
export function bookReceipt(x){
 if(!verifiedId(x.idPembayaran)||x.status!=='AKTIF'||!positive(x.totalDiterima)||!x.tanggalIso)return null;
 const a=Array.isArray(x.alokasi)?x.alokasi.filter(v=>v.status==='aktif'||v.status==='AKTIF'):[],types={IURAN_BULANAN:'Iuran Bulanan',KEBERSIHAN:'Kebersihan',KAS_LORONG:'Kas Lorong',ARISAN:'Arisan'};
 const valid=a.length&&a.every(v=>positive(v.nominal)&&Number.isInteger(v.bulan)&&v.bulan>=1&&v.bulan<=12&&Number.isInteger(v.tahun));
 const items=valid&&a.reduce((n,v)=>n+v.nominal,0)===x.totalDiterima?a.map(v=>({label:(types[v.jenis]||v.jenis)+' · '+v.bulan+'/'+v.tahun,amount:v.nominal})):undefined;
 return {scope:'book',id:x.idPembayaran,title:'Bukti Pembayaran Iuran',party:x.nama,house:[x.blok,x.noRumah].filter(Boolean).join('/'),date:x.tanggalIso,method:x.metode,amount:x.totalDiterima,amountLabel:'Total diterima',status:'TERBAYAR',items,note:'Bukti pembayaran yang tercatat aktif. Bukan pernyataan bahwa seluruh kewajiban telah lunas.'};
}
export function bankReceipt(x,{admin=false,member={}}={}){
 const confirmed=x.status==='terkonfirmasi',estimated=x.status==='estimasi',amount=confirmed?x.nilaiSahRp:admin?x.estimated_total_rp:x.estimasiRp;
 const date=admin?x.deposited_on:x.tanggal;
 if(!verifiedId(x.id)||(!confirmed&&!estimated)||!Number.isSafeInteger(amount)||amount<0||!date)return null;
 const weight=confirmed?x.beratSahGram:admin?x.total_grams:x.beratGram;
 return {scope:'bank',id:x.id,title:'Bukti Setoran Bank Sampah',party:admin?x.memberName:member.nama,house:admin?x.houseCode:member.rumah,date,method:'Bank Sampah',amount,amountLabel:confirmed?'Hak warga terkonfirmasi':'Estimasi setoran',status:confirmed?'TERKONFIRMASI':'ESTIMASI',details:Number.isSafeInteger(weight)&&weight>=0?[['Berat',new Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format(weight/1000)+' kg']]:[],note:confirmed?'Nominal berdasarkan jurnal yang telah disahkan.':'Nilai estimasi, belum merupakan saldo yang dapat dicairkan.'};
}
export function createReceiptViewer(root,{el,signal}){
 let dialog=null,url='',blob=null,version=0;
 function release(){version++;if(url)URL.revokeObjectURL(url);url='';blob=null;if(dialog){dialog.replaceChildren();if(dialog.open)dialog.close()}}
 signal.addEventListener?.('abort',release,{once:true});
 async function open(record){
  if(signal.aborted||!record||!verifiedId(record.id)||!Number.isSafeInteger(record.amount)||record.amount<0)throw Error('Data resi tidak valid.');
  release();const token=version,canvas=draw(record);
  const data=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Gagal membuat JPG')),'image/jpeg',.94));
  if(signal.aborted||token!==version)return;
  blob=data;url=URL.createObjectURL(data);
  if(!dialog){dialog=el('dialog',null,'receipt-viewer');dialog.setAttribute('aria-label','Bukti transaksi');dialog.addEventListener('close',()=>{if(!dialog.open)release()});root.append(dialog)}
  const head=el('header',null,'gallery-viewer-head'),close=el('button','Tutup');close.type='button';close.onclick=release;head.append(el('strong',record.title),close);
  const img=el('img');img.alt='Pratinjau bukti transaksi JPG';img.src=url;
  const foot=el('div',null,'gallery-tabs'),download=el('a','Simpan JPG'),filename='Resi-'+(record.scope==='bank'?'BankSampah':'Pembukuan')+'-'+safePart(record.id)+'.jpg';
  download.href=url;download.download=filename;foot.append(download);
  if(typeof navigator!=='undefined'&&navigator.share&&navigator.canShare){const file=new File([blob],filename,{type:'image/jpeg'});if(navigator.canShare({files:[file]})){const share=el('button','Bagikan');share.type='button';share.onclick=()=>navigator.share({files:[file]}).catch(()=>{});foot.append(share)}}
  dialog.replaceChildren(head,img,foot);dialog.showModal();
 }
 function button(record){
  if(!record)return null;
  const b=el('button','Resi JPG','receipt-button');b.type='button';b.setAttribute('aria-label','Resi JPG '+record.id);
  const wrap=el('div',null,'receipt-action'),status=el('small');b.onclick=async()=>{b.disabled=true;status.textContent='';try{await open(record)}catch(e){if(!signal.aborted)status.textContent=e.message}finally{b.disabled=false}};wrap.append(b,status);return wrap;
 }
 return {button,release};
}
