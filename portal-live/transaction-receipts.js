/* Flamboyan 4 — reusable JPG receipt preview, download and share.
 * Presentation only: never changes ledgers or marks an unfinished transaction paid.
 * Call only with a validated, active record from an authenticated D1 history view. */
(()=>{
 'use strict';
 if(window.F4TransactionReceipt)return;
 let blob=null,url='',filename='',priorOverflow='';
 const p=n=>String(n||'').padStart(2,'0');
 const money=n=>'Rp '+Math.round(Number(n)||0).toLocaleString('id-ID');
 const text=v=>String(v==null||v===''?'-':v).replace(/\s+/g,' ').trim();
 const safePart=s=>text(s).replace(/[^a-z0-9-]+/gi,'-').replace(/^-|-$/g,'').slice(0,44)||'Transaksi';
 const svgIcon=name=>{
  const paths={
   x:'<path d="M18 6 6 18M6 6l12 12"/>',
   download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
   share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.8 13.5 6.4 4M15.2 6.5l-6.4 4"/>'
  };
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||'')+'</svg>';
 };
 function mount(){
  if(document.getElementById('f4-tx-receipt-dialog'))return;
  const style=document.createElement('style');
  style.id='f4-tx-receipt-style';
  style.textContent=
   '#f4-tx-receipt-dialog[hidden]{display:none}' +
   '#f4-tx-receipt-dialog{position:fixed;inset:0;z-index:2300;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(17,24,39,.68)}' +
   '#f4-tx-receipt-dialog .f4-tx-card{width:min(100%,520px);max-height:min(92dvh,920px);display:flex;flex-direction:column;overflow:hidden;border-radius:20px;background:#fff;box-shadow:0 20px 60px #1118;color:#1f2937}' +
   '#f4-tx-receipt-dialog .f4-tx-top{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb;gap:10px}' +
   '#f4-tx-receipt-dialog .f4-tx-top strong{font-size:16px}' +
   '#f4-tx-receipt-dialog button{font:inherit;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid #d1d5db;border-radius:11px;background:#fff;color:#334155;min-height:42px;padding:8px 12px;cursor:pointer}' +
   '#f4-tx-receipt-dialog .f4-tx-image-wrap{overflow:auto;background:#f5f3ff;flex:1;min-height:0;padding:14px;text-align:center}' +
   '#f4-tx-receipt-dialog img{display:block;width:min(100%,410px);height:auto;margin:0 auto;border-radius:7px}' +
   '#f4-tx-receipt-dialog .f4-tx-actions{display:flex;gap:9px;padding:12px 16px;justify-content:flex-end;border-top:1px solid #e5e7eb}' +
   '#f4-tx-receipt-dialog .f4-tx-actions button{flex:1}' +
   '#f4-tx-receipt-dialog .f4-tx-primary{background:#5b21b6;color:#fff;border-color:#5b21b6}' +
   '#f4-tx-receipt-dialog[data-scope=bank] .f4-tx-primary{background:#157347;border-color:#157347}' +
   '#f4-tx-receipt-dialog button:focus-visible{outline:3px solid #a78bfa;outline-offset:2px}' +
   '@media(max-width:640px){#f4-tx-receipt-dialog{align-items:flex-end;padding:0}' +
   '#f4-tx-receipt-dialog .f4-tx-card{width:100%;max-height:94dvh;border-radius:20px 20px 0 0}' +
   '#f4-tx-receipt-dialog .f4-tx-image-wrap{padding:8px;background:#fafafa}' +
   '#f4-tx-receipt-dialog .f4-tx-top{padding-top:18px}' +
   '#f4-tx-receipt-dialog .f4-tx-actions{padding-bottom:max(12px,env(safe-area-inset-bottom))}}';
  document.head.appendChild(style);
  const dialog=document.createElement('div');
  dialog.id='f4-tx-receipt-dialog';dialog.hidden=true;dialog.setAttribute('role','dialog');
  dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','f4-tx-receipt-heading');
  dialog.innerHTML='<section class="f4-tx-card"><div class="f4-tx-top"><strong id="f4-tx-receipt-heading">Bukti transaksi</strong>'+
   '<button class="f4-tx-close" type="button" aria-label="Tutup" title="Tutup">'+svgIcon('x')+'</button></div>'+
   '<div class="f4-tx-image-wrap"><img id="f4-tx-receipt-preview" alt="Pratinjau bukti transaksi dalam format JPG"></div>'+
   '<div class="f4-tx-actions"><button class="f4-tx-download" type="button">'+svgIcon('download')+' Simpan JPG</button>'+
   '<button class="f4-tx-share f4-tx-primary" type="button">'+svgIcon('share')+' Bagikan</button></div></section>';
  dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
  dialog.querySelector('.f4-tx-close').onclick=close;
  dialog.querySelector('.f4-tx-download').onclick=download;
  dialog.querySelector('.f4-tx-share').onclick=share;
  document.body.appendChild(dialog);
 }
 function close(){
  const d=document.getElementById('f4-tx-receipt-dialog');
  if(d)d.hidden=true;
  document.body.style.overflow=priorOverflow;
  if(url){URL.revokeObjectURL(url);url='';}
  blob=null;
 }
 function download(){
  if(!blob||!url)return;
  const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();a.remove();
 }
 async function share(){
  if(!blob)return;
  const file=new File([blob],filename,{type:'image/jpeg'});
  if(navigator.share && navigator.canShare?.({files:[file]})){
   try{await navigator.share({files:[file],title:'Bukti Transaksi Flamboyan 4'});return;}
   catch(e){if(e.name==='AbortError')return;}
  }
  download();
 }
 function draw(record){
  const scope=record.scope==='bank'?'bank':'book';
  const theme=scope==='bank'
   ?{primary:'#157347',surface:'#eaf6ec',ink:'#1a3a2a',accent:'#f0ce43',sub:'#52715b'}
   :{primary:'#5b21b6',surface:'#f4edff',ink:'#291b44',accent:'#e0c7ff',sub:'#665881'};
  const canvas=document.createElement('canvas'),c=canvas.getContext('2d');
  if(!c)throw Error('Browser tidak mendukung gambar resi.');
  const W=900,left=82,right=818,width=right-left;
  const font=(n,w=500)=>String(w)+' '+n+'px system-ui,Arial,sans-serif';
  const wrap=(value,maxWidth,sz=26,w=600)=>{
   c.font=font(sz,w);const source=text(value);
   const words=source.split(' '),lines=[];let current='';
   for(let word of words){
    const next=current?current+' '+word:word;
    if(c.measureText(next).width<=maxWidth){current=next;continue;}
    if(current){lines.push(current);current='';}
    while(word.length&&c.measureText(word).width>maxWidth){
     let i=1;while(i<word.length&&c.measureText(word.slice(0,i+1)).width<=maxWidth)i++;
     lines.push(word.slice(0,i));word=word.slice(i);
    }
    current=word;
   }
   if(current)lines.push(current);
   return lines.length?lines:['-'];
  };
  const fields=[
   ['Nama',record.party||'-'],['Nomor rumah',record.house||'-'],
   ['Tanggal',record.date||'-'],['Metode',record.method||'-']
  ];
  for(const v of Array.isArray(record.details)?record.details:[]){
   if(Array.isArray(v)&&v[0]&&v[1]!=null&&v[1]!=='')fields.push([text(v[0]),text(v[1])]);
  }
  const detailRows=fields.map(([label,value])=>({label,value:wrap(value,405,25,650)}));
  const items=(Array.isArray(record.items)?record.items:[]).filter(x=>x&&x.label).map(x=>({
   label:wrap(x.label,475,25,600),amount:Number(x.amount)
  }));
  const refLines=wrap(record.id,width-15,23,600);
  const titleLines=wrap(record.title||'Bukti Transaksi',width,36,800);
  const noteLines=wrap(record.note||'Dibuat dari riwayat transaksi Flamboyan 4.',width,23,500);
  let y=573;
  for(const row of detailRows){row.y=y;y+=Math.max(60,row.value.length*34+20);}
  const itemHeadingY=y+43;
  y=itemHeadingY+45;
  for(const item of items){item.y=y;y+=Math.max(54,item.label.length*31+18);}
  const statusY=y+37;const statusHeight=111;
  const refY=statusY+statusHeight+45;
  const footerY=refY+56+refLines.length*32+45+noteLines.length*32;
  const H=footerY+115;
  canvas.width=W;canvas.height=H;
  c.fillStyle=theme.surface;c.fillRect(0,0,W,H);
  c.fillStyle='#fff';c.beginPath();c.roundRect(30,25,W-60,H-50,17);c.fill();
  c.fillStyle=theme.primary;c.beginPath();c.roundRect(50,47,W-100,302,15);c.fill();
  c.textAlign='center';c.fillStyle='#fff';c.font=font(26,800);
  c.fillText(scope==='bank'?'BANK SAMPAH FLAMBOYAN 4':'PEMBUKUAN FLAMBOYAN 4',W/2,103,730);
  c.fillStyle=theme.accent;c.beginPath();c.arc(W/2,169,37,0,Math.PI*2);c.fill();
  c.strokeStyle=theme.primary;c.lineWidth=6;c.lineCap='round';
  c.beginPath();c.moveTo(428,170);c.lineTo(446,187);c.lineTo(472,155);c.stroke();
  c.fillStyle='#fff';c.font=font(35,800);
  titleLines.slice(0,2).forEach((t,i)=>c.fillText(t,W/2,268+i*38,740));
  c.fillStyle=theme.sub;c.font=font(26,700);c.fillText(text(record.amountLabel||'NOMINAL TRANSAKSI').toUpperCase(),W/2,406,680);
  c.fillStyle=theme.primary;c.font=font(65,850);c.fillText(money(record.amount),W/2,485,730);
  const drawLine=yy=>{c.strokeStyle='#d6dbe0';c.lineWidth=2;c.setLineDash([9,8]);c.beginPath();c.moveTo(left,yy);c.lineTo(right,yy);c.stroke();c.setLineDash([]);};
  drawLine(518);
  c.textAlign='left';c.fillStyle=theme.primary;c.font=font(26,800);c.fillText('DETAIL TRANSAKSI',left,555);
  for(const row of detailRows){
   c.textAlign='left';c.fillStyle=theme.sub;c.font=font(24,500);c.fillText(row.label,left,row.y+27,260);
   c.textAlign='right';c.fillStyle=theme.ink;c.font=font(25,680);
   row.value.forEach((line,i)=>c.fillText(line,right,row.y+28+i*34,405));
  }
  if(items.length){
   drawLine(itemHeadingY-26);
   c.textAlign='left';c.fillStyle=theme.primary;c.font=font(25,800);c.fillText('RINCIAN',left,itemHeadingY);
   for(const item of items){
    c.textAlign='left';c.fillStyle=theme.ink;c.font=font(25,560);
    item.label.forEach((line,i)=>c.fillText(line,left,item.y+25+i*31,475));
    if(Number.isFinite(item.amount)){
     c.textAlign='right';c.font=font(25,750);c.fillText(money(item.amount),right,item.y+25,250);
    }
   }
  }
  drawLine(statusY-18);
  c.fillStyle=theme.surface;c.beginPath();c.roundRect(left,statusY,width,statusHeight,15);c.fill();
  c.textAlign='left';c.fillStyle=theme.primary;c.font=font(25,750);c.fillText('STATUS TRANSAKSI',left+21,statusY+38);
  c.font=font(34,850);c.fillText(text(record.status||'TERCATAT').toUpperCase(),left+21,statusY+85,width-40);
  c.textAlign='left';c.fillStyle=theme.sub;c.font=font(24,650);c.fillText('Nomor transaksi',left,refY+5);
  c.fillStyle=theme.ink;c.font=font(23,650);
  refLines.forEach((x,i)=>c.fillText(x,left,refY+47+i*32,width));
  let yy=refY+76+refLines.length*32;
  c.fillStyle=theme.sub;c.font=font(23,500);
  noteLines.forEach((x,i)=>c.fillText(x,left,yy+i*32,width));
  drawLine(footerY-7);
  c.textAlign='center';c.fillStyle=theme.primary;c.font=font(26,850);c.fillText('Flamboyan 4',W/2,footerY+42);
  c.fillStyle=theme.sub;c.font=font(22,500);c.fillText('Bukti dari aplikasi • bukan bukti transfer bank',W/2,footerY+79);
  return canvas;
 }
 async function open(record){
  if(!record||typeof record!=='object')throw Error('Data resi tidak valid');
  if(!text(record.id)||text(record.id)==='-'||!Number.isSafeInteger(Number(record.amount))||Number(record.amount)<0)
   throw Error('Nomor atau nominal transaksi tidak valid; resi ditolak');
  mount();
  const canvas=draw(record);
  const data=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Gagal membuat JPG')),'image/jpeg',.94));
  close();blob=data;
  filename='Resi-'+(record.scope==='bank'?'BankSampah':'Pembukuan')+'-'+safePart(record.id)+'.jpg';
  url=URL.createObjectURL(blob);
  const dialog=document.getElementById('f4-tx-receipt-dialog');
  priorOverflow=document.body.style.overflow||'';
  dialog.dataset.scope=record.scope==='bank'?'bank':'book';
  dialog.querySelector('#f4-tx-receipt-heading').textContent=record.title||'Bukti Transaksi';
  dialog.querySelector('#f4-tx-receipt-preview').src=url;
  dialog.hidden=false;
  document.body.style.overflow='hidden';
  dialog.querySelector('.f4-tx-close').focus();
 }
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('f4-tx-receipt-dialog')?.hidden)close()});
 window.addEventListener('pagehide',close);
 window.F4TransactionReceipt={open,close};
})();
