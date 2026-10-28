/* Proyek dinamis Flamboyan 4: daftar pesanan / kontribusi terpisah per proyek.
 * Tidak pernah mengubah kas Pembukuan atau Jersey lama. Hanya Superadmin.
 */
(()=>{
'use strict';
const ORIGIN='https://api.flamboyan4.web.id/api/v2/admin/projects/';
const mount=document.querySelector('#f4-account-page main');
if(!mount)return;
const rupiah=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
const button=(label,cb,cls='f4-pm-btn')=>{const b=el('button',cls,label);b.type='button';b.addEventListener('click',cb);return b};
const text=(label,value)=>{const p=el('div','f4-pm-kpi');p.append(el('span','',label),el('strong','',value));return p};
const api=async(path,options={})=>{
 const response=await fetch(ORIGIN+path,{credentials:'include',cache:'no-store',...options});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||data.ok===false)throw Error(data.error||'HTTP '+response.status);
 return data;
};
const safeCsv=x=>{const v=String(x??'');const x2=/^[=+@-]/.test(v)?'\''+v:v;return '"'+x2.replaceAll('"','""')+'"'};
function downloadCsv(title,rows,columns){
 const lines=[columns.map(c=>safeCsv(c[1])).join(','),...rows.map(r=>columns.map(([key])=>safeCsv(r[key])).join(','))];
 const blob=new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),link=el('a');
 link.href=url;link.download='Proyek_'+String(title||'Data').replace(/[^a-z0-9_-]/gi,'_').slice(0,65)+'.csv';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
let current=null;
function field(form,key,label,type='text',value='',required=false){
 const wrap=el('label','f4-pm-field');
 wrap.append(el('span','',label));
 let control;
 if(type==='select'){
  control=el('select');for(const [v,title] of [
   ['','Belum dicatat'],['QRIS','QRIS'],['Cash','Cash (tunai)'],
   ['Campuran','Campuran'],['Transfer','Transfer'],['Lainnya','Lainnya']
  ])control.add(new Option(title,v));
 }else{
  control=el('input');control.type=type;
  if(type==='number'){control.min='0';control.step='1';control.inputMode='numeric'}
 }
 control.name=key;control.required=required;
 control.value=value==null?'':String(value);
 wrap.append(control);form.append(wrap);
 return control;
}
async function confirmCancel(label){
 return new Promise(resolve=>{
  const shade=el('div','f4-pm-shade');
  const box=el('section','f4-pm-dialog');
  box.setAttribute('role','alertdialog');box.setAttribute('aria-modal','true');
  box.append(el('h3','','Batalkan catatan?'),el('p','','Catatan '+label+' tetap disimpan untuk audit dan tidak dihitung dalam ringkasan.'));
  const controls=el('div','f4-pm-actions');
  const done=approved=>{shade.remove();resolve(approved)};
  controls.append(button('Kembali',()=>done(false)),button('Ya, batalkan',()=>done(true),'f4-pm-btn f4-pm-danger'));
  box.append(controls);shade.append(box);document.body.append(shade);
  shade.addEventListener('click',e=>{if(e.target===shade)done(false)});
 });
}
async function open(record){
 if(!document.body.classList.contains('role-superadmin'))return;
 if(!record?.id)return;
 const orders=record.project_kind==='pesanan';
 const contributions=record.project_kind==='penggalangan';
 if(!orders&&!contributions)return;
 current={id:record.id};
 const mode=orders?'orders':'contributions';
 mount.replaceChildren();
 const panel=el('section','f4-pm-panel');
 const head=el('div','f4-pm-head'),left=el('div');
 left.append(el('p','f4-pm-eyebrow','Portal Utama / Proyek'),el('h2','',record.title||'Proyek'));
 const sub=el('p','',orders?'Daftar Pesanan Barang':'Daftar Penggalangan Dana');
 left.append(sub);
 head.append(left,button('← Kembali ke Project Card',()=>window.openSuperadminEditor?.('projects')));
 panel.append(head);
 const description=el('p','f4-pm-message','Memuat catatan proyek…');
 panel.append(description);
 const stats=el('div','f4-pm-stats');panel.append(stats);
 const controls=el('div','f4-pm-controls');panel.append(controls);
 const list=el('div','f4-pm-list');panel.append(list);
 const editor=el('section','f4-pm-editor');panel.append(editor);
 mount.append(panel);
 async function reload(){
  list.replaceChildren();stats.replaceChildren();
  try{
   const data=await api(mode+'?projectId='+encodeURIComponent(record.id));
   if(current?.id!==record.id||!panel.isConnected)return;
   const rows=Array.isArray(data.data)?data.data:[];
   const active=rows.filter(r=>r.status==='aktif');
   if(orders){
    const totalDue=active.reduce((n,r)=>n+Number(r.amount_due_rp||0),0);
    const totalPaid=active.reduce((n,r)=>n+Number(r.paid_rp||0),0);
    const owing=active.reduce((n,r)=>n+Math.max(0,Number(r.amount_due_rp||0)-Number(r.paid_rp||0)),0);
    const excess=active.reduce((n,r)=>n+Math.max(0,Number(r.paid_rp||0)-Number(r.amount_due_rp||0)),0);
    const lunas=active.filter(r=>Number(r.paid_rp||0)>=Number(r.amount_due_rp||0)).length;
    stats.append(text('Pesanan aktif',active.length),text('Lunas',lunas),text('Dana diterima',rupiah(totalPaid)),text('Sisa pembayaran',rupiah(owing)),text('Titipan / kelebihan',rupiah(excess)));
    description.textContent='Setiap pesanan tersimpan hanya untuk proyek ini. Pembayaran di sini tidak otomatis masuk kas lorong.';
   }else{
    const amount=active.reduce((n,r)=>n+Number(r.amount_rp||0),0);
    stats.append(text('Kontributor',active.length),text('Dana tercatat',rupiah(amount)),text('Target dana',rupiah(record.fund_target_rp||0)));
    description.textContent='Kontribusi disimpan di buku dana proyek. Ini bukan jurnal kas lorong dan tidak membuat transaksi kas otomatis.';
   }
   controls.replaceChildren(
    button(orders?'+ Tambah Pesanan':'+ Catat Kontribusi',()=>edit(null),'f4-pm-btn f4-pm-primary'),
    button('Unduh CSV',()=>downloadCsv(record.title,rows,orders?
      [['resident','Nama pemesan'],['item_name','Barang'],['quantity','Jumlah'],['unit_price_rp','Harga satuan'],['amount_due_rp','Tagihan'],['paid_rp','Diterima'],['payment_method','Metode'],['status','Status'],['notes','Keterangan']]:
      [['contributor','Nama kontributor'],['contributed_on','Tanggal'],['amount_rp','Jumlah'],['payment_method','Metode'],['status','Status'],['notes','Keterangan']])),
    button('Perbarui',reload)
   );
   if(!rows.length)list.append(el('p','f4-pm-empty','Belum ada catatan. Gunakan tombol tambah untuk mulai.'));
   for(const r of rows){
    const card=el('article','f4-pm-record'+(r.status!=='aktif'?' is-canceled':''));
    const title=el('div','f4-pm-record-head');
    title.append(el('strong','',orders?r.resident:r.contributor),
      el('span','',r.status!=='aktif'?'Dibatalkan':orders?
        Number(r.paid_rp)>=Number(r.amount_due_rp)?'Lunas':Number(r.paid_rp)>0?'DP / Cicil':'Belum bayar':'Aktif'));
    const details=el('p','',orders?
      r.item_name+' • '+r.quantity+' × '+rupiah(r.unit_price_rp)+' • Tagihan '+rupiah(r.amount_due_rp)+
      ' • Diterima '+rupiah(r.paid_rp)+(r.payment_method?' ('+r.payment_method+')':''):
      (r.contributed_on||'')+' • '+rupiah(r.amount_rp)+(r.payment_method?' • '+r.payment_method:''));
    card.append(title,details);
    if(r.notes)card.append(el('small','',r.notes));
    if(r.status==='aktif'){
      const actions=el('div','f4-pm-actions');
      actions.append(button('Edit',()=>edit(r)));
      actions.append(button('Batalkan',async()=>{
       if(!await confirmCancel(orders?r.resident:r.contributor))return;
       try{
        await api(mode+'?projectId='+encodeURIComponent(record.id),{
         method:'POST',headers:{'Content-Type':'application/json'},
         body:JSON.stringify({action:'cancel',id:r.id})
        });
        editor.replaceChildren();await reload();
       }catch(error){description.textContent='Pembatalan belum berhasil: '+error.message}
      },'f4-pm-btn f4-pm-danger'));
      card.append(actions);
    }
    list.append(card);
   }
  }catch(error){description.textContent='Belum bisa memuat modul proyek: '+error.message}
 }
 function edit(row){
  editor.replaceChildren();
  const heading=el('h3','',row?'Edit catatan':'Tambah catatan baru');
  const form=el('form','f4-pm-form');form.noValidate=false;
  const fields=el('div','f4-pm-form-grid');form.append(fields);
  if(orders){
   field(fields,'resident','Nama pemesan & rumah','text',row?.resident||'',true);
   field(fields,'item_name','Barang / pilihan','text',row?.item_name||'',true);
   field(fields,'quantity','Jumlah','number',row?.quantity??1,true);
   field(fields,'unit_price_rp','Harga per barang (Rp)','number',row?.unit_price_rp??0,true);
   field(fields,'paid_rp','Uang diterima (Rp)','number',row?.paid_rp??0,true);
  }else{
   field(fields,'contributor','Nama penyumbang & rumah','text',row?.contributor||'',true);
   field(fields,'amount_rp','Nominal kontribusi (Rp)','number',row?.amount_rp??0,true);
   field(fields,'contributed_on','Tanggal','date',row?.contributed_on||new Date().toLocaleDateString('sv-SE'),true);
  }
  field(fields,'payment_method','Cara bayar','select',row?.payment_method||'');
  field(fields,'notes','Keterangan (opsional)','text',row?.notes||'');
  const message=el('p','f4-pm-message');
  const buttons=el('div','f4-pm-actions');
  const save=el('button','f4-pm-btn f4-pm-primary','Simpan catatan');save.type='submit';
  buttons.append(button('Batal',()=>editor.replaceChildren()),save);
  form.append(message,buttons);
  form.onsubmit=async event=>{
   event.preventDefault();
   if(!form.reportValidity())return;
   const values=Object.fromEntries(new FormData(form).entries());
   for(const key of (orders?['quantity','unit_price_rp','paid_rp']:['amount_rp']))values[key]=Number(values[key]);
   save.disabled=true;message.textContent='Menyimpan dan memverifikasi data…';
   try{
    await api(mode+'?projectId='+encodeURIComponent(record.id),{
     method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({action:'save',id:row?.id||'',values})
    });
    editor.replaceChildren();await reload();
   }catch(error){message.textContent='Gagal menyimpan: '+error.message;save.disabled=false}
  };
  editor.append(heading,form);editor.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 await reload();
}
window.F4ProjectModule={open};
const style=document.createElement('style');style.id='f4-project-module-style-20261028';
style.textContent=`
.f4-pm-panel{display:grid;gap:14px;max-width:1180px;margin:0 auto;padding:10px 0 28px;color:#233c32}
.f4-pm-head{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.f4-pm-head h2{font-size:23px;font-weight:800;margin:2px 0}.f4-pm-head p{font-size:13px;color:#66796e;margin:0}
.f4-pm-eyebrow{font-size:11px!important;font-weight:700!important;color:#7055c3!important}
.f4-pm-btn{border:1px solid #dfe7e2!important;border-radius:10px!important;background:#fff!important;
 color:#345646!important;padding:10px 14px!important;font-size:13px!important;font-weight:750!important;cursor:pointer}
.f4-pm-btn:hover{background:#f2f8f3!important}
.f4-pm-primary{background:#087f5b!important;border-color:#087f5b!important;color:#fff!important}
.f4-pm-primary:hover{background:#086a4f!important}
.f4-pm-danger{color:#9e3b32!important;background:#fff6f4!important;border-color:#f3d5d0!important}
.f4-pm-btn:disabled{opacity:.5!important;cursor:wait}
.f4-pm-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:9px}
.f4-pm-kpi{border:1px solid #e1ebe4;border-radius:13px;background:#fff;padding:12px 14px;min-width:0}
.f4-pm-kpi span{display:block;font-size:12px;color:#64796e}
.f4-pm-kpi strong{display:block;font-size:20px;font-weight:800;color:#285a43;margin-top:4px;overflow-wrap:anywhere}
.f4-pm-message{font-size:12px;color:#64796e}
.f4-pm-controls,.f4-pm-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.f4-pm-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
.f4-pm-record{padding:14px;border:1px solid #e0eae3;background:#fff;border-radius:14px;min-width:0}
.f4-pm-record.is-canceled{opacity:.68;background:#f7f9f7}
.f4-pm-record-head{display:flex;justify-content:space-between;align-items:center;gap:8px}
.f4-pm-record-head strong{font-size:14px;color:#213d2d;overflow-wrap:anywhere}
.f4-pm-record-head span{font-size:11px;color:#43745a;background:#eff8ef;border-radius:8px;padding:3px 7px;white-space:nowrap}
.f4-pm-record p{font-size:12px;line-height:1.55;color:#5c7464;margin:8px 0}
.f4-pm-record>small{display:block;margin:7px 0;color:#75897d}
.f4-pm-editor{scroll-margin-top:96px}
.f4-pm-editor:not(:empty){border:1px solid #dce9de;border-radius:15px;background:#fff;padding:17px}
.f4-pm-editor h3{font-size:17px;margin:0 0 12px}
.f4-pm-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.f4-pm-field{min-width:0;display:flex;flex-direction:column;gap:6px}
.f4-pm-field>span{font-size:12px;color:#405f4c;font-weight:750}
.f4-pm-field input,.f4-pm-field select{width:100%;min-width:0;max-width:100%;border:1px solid #d5e3d9;
 border-radius:10px;padding:10px 12px;min-height:42px;background:white;color:#244532;font-size:14px}
.f4-pm-form .f4-pm-actions{margin-top:16px}
.f4-pm-empty{border:1px dashed #cfdfd3;border-radius:12px;padding:18px;color:#6a8373}
.f4-pm-shade{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;background:#192c2299;padding:20px}
.f4-pm-dialog{background:#fff;border-radius:16px;max-width:420px;width:100%;padding:24px;color:#304538}
.f4-pm-dialog h3{font-size:18px;margin:0 0 8px}.f4-pm-dialog p{font-size:13px;line-height:1.55;margin:0 0 18px}
@media(max-width:620px){.f4-pm-form-grid{grid-template-columns:1fr}.f4-pm-panel{padding:3px 0 20px}
.f4-pm-head h2{font-size:19px}.f4-pm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
.f4-pm-kpi strong{font-size:18px}}
`;
document.head.append(style);
})();
