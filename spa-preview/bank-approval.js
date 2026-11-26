/* Read-only reconciliation and isolated payout-management checks. */
import {createTransactionService} from './transactions.js';
const integer=v=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
const amount=v=>v===''||v==null?NaN:Number(v);
const money=v=>integer(v)?'Rp '+v.toLocaleString('id-ID'):'—';
export function validateReconciliation(p,batch){
 if(!p||p.ok===false||p.batchId!==batch||!p.saleId||!integer(p.grossRp)||!integer(p.receivedRp)||p.grossRp!==p.receivedRp||p.grossRp<=0||!integer(p.citizenRightsRp)||!integer(p.environmentRp)||p.citizenRightsRp+p.environmentRp!==p.receivedRp||!integer(p.weightDifferenceGrams)||p.ready===false||p.siap===false||p.canConfirm===false)throw Error('Pratinjau server belum siap atau hasil alokasi tidak seimbang.');
 if(!Number.isSafeInteger(p.wargaPercent)||p.wargaPercent<0||p.wargaPercent>100)throw Error('Kebijakan bagi hasil tidak valid.');
 return p;
}
export function validateAllocation(p,{confirmation,allSold,reserve,neighborhood,operation,note}){
 validateReconciliation(p,p.batchId);
 const values=[reserve,neighborhood,operation].map(amount);
 if(confirmation!==p.batchId||allSold!==true)throw Error('Ketik ulang ID batch dan setujui hasil timbang.');
 if(!values.every(integer)||values.reduce((a,b)=>a+b,0)!==p.environmentRp)throw Error('Total alokasi lingkungan harus sama dengan hasil lingkungan.');
 if(p.hasWeightDifference&&String(note||'').trim().length<5)throw Error('Jelaskan selisih timbang minimal 5 karakter.');
 return {batch:p.batchId,konfirmasi:confirmation,semuaTerjual:allSold,cadangan:values[0],kasLorong:values[1],operasional:values[2],alasanSelisihBerat:String(note||'').trim()};
}
export async function simulateApproval({role,preview,form,crypto=globalThis.crypto}){
 const p=validateReconciliation(preview,preview.batchId),payload=validateAllocation(p,form);let confirmation=null;
 const service=createTransactionService({role,accountKey:'simulation-only',allowWrites:true,crypto,transport:async(path,body)=>{
  if(path==='/api/admin/reconciliation/preview'&&body?.batchId===p.batchId)return p;
  if(path==='/api/v2/admin/bank/batches'&&!body)return {rows:[{id:p.batchId,grams:0}]};
  if(path==='/api/v2/admin/bank/sale-detail?id='+encodeURIComponent(p.saleId)&&!body)return {lines:[],sale:{amount_gross_rp:p.grossRp,amount_received_rp:p.receivedRp}};
  if(path==='/api/admin/reconciliation/confirm'&&body?.batchId===p.batchId&&body?.saleId===p.saleId){confirmation=body;return {status:'SIMULASI',citizenRightsRp:p.citizenRightsRp}}
  throw Error('Endpoint simulasi tidak diizinkan.');
 }});
 await service.bank('bsV8SahkanBatch','',payload);
 if(!confirmation)throw Error('Kontrak pengesahan belum lengkap.');
 return confirmation;
}
export async function simulatePayoutDecision({role,item,action,note='',paidOn,crypto=globalThis.crypto}){
 if(!/^request:bank:[a-f0-9-]{36}$/i.test(String(item?.id||'')))throw Error('ID pengajuan tidak valid.');
 if(action==='dibayar'){
  if(item.status!=='disetujui'||!integer(item.amount_rp)||item.amount_rp<1||!integer(item.balance_rp)||item.amount_rp>item.balance_rp)throw Error('Pengajuan harus disetujui dan saldo mencukupi.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(paidOn)||!Number.isFinite(Date.parse(paidOn+'T00:00:00Z'))||new Date(paidOn+'T00:00:00Z').toISOString().slice(0,10)!==paidOn)throw Error('Tanggal tidak valid.');
 }else if(item.status!=='diajukan'||!['setujui','tolak'].includes(action))throw Error('Status pengajuan tidak sesuai.');
 if(String(note).trim().length>250)throw Error('Catatan maksimal 250 karakter.');
 let result;
 const expected='/api/admin/bank/payout-requests/'+(action==='dibayar'?'paid':'review');
 const service=createTransactionService({role,accountKey:'simulation-only',allowWrites:true,crypto,transport:async(path,body)=>{
  if(path!==expected||body?.id!==item.id)throw Error('Kontrak pengajuan tidak sesuai.');
  result=body;return {ok:true,status:'SIMULASI'};
 }});
 if(action==='dibayar')await service.payoutPaid({id:item.id,paidOn});
 else await service.payoutReview({id:item.id,action,note});
 return result;
}
export function attachApproval(root,{el,panel,row,role,sales,previewRequest,signal}){
 const p=panel(root,'Pratinjau pengesahan'),drafts=sales.filter(x=>x.status==='draft'&&x.batch_id);
 const select=el('select'),read=el('button','Periksa hasil penjualan'),status=el('p'),result=el('div'),label=el('label','Batch penjualan');
 const option=el('option','Pilih batch');option.value='';select.append(option);
 for(const x of drafts){const o=el('option',[x.sold_on,x.buyer_name,x.batch_id].filter(Boolean).join(' · '));o.value=String(x.batch_id);select.append(o)}
 label.append(select);read.type='button';read.disabled=!drafts.length||typeof previewRequest!=='function';status.setAttribute('role','status');
 let rev=0,busy=false,dirty=false;
 select.onchange=()=>{rev++;result.replaceChildren();status.textContent='';dirty=false};
 read.onclick=async()=>{if(!select.value||busy)return;const version=++rev;busy=true;read.disabled=true;result.replaceChildren();status.textContent='Memeriksa alokasi dari server…';dirty=false;
  try{
   const preview=validateReconciliation(await previewRequest(select.value,signal),select.value);
   if(signal.aborted||version!==rev)return;
   row(result,'Total diterima',money(preview.receivedRp));row(result,'Hak warga',money(preview.citizenRightsRp));row(result,'Hak lingkungan',money(preview.environmentRp));
   row(result,'Selisih timbang',String(preview.weightDifferenceGrams/1000)+' kg');
   if(integer(preview.remainingStockGrams))row(result,'Sisa belum terjual',String(preview.remainingStockGrams/1000)+' kg');
   row(result,'Metode',preview.method==='fixed_buy_price'?'Harga beli tetap':'Bagi hasil '+preview.wargaPercent+'% warga');
   if(preview.warning)result.append(el('p',preview.warning));
   const form=el('form',null,'bank-draft'),field=(name,node)=>{const l=el('label',name);l.append(node);return l};
   const input=(type,value)=>{const n=el('input');n.type=type;n.value=value;n.required=true;return n};
   const reserve=input('number','0'),neighborhood=input('number','0'),operation=input('number','0'),confirmation=input('text',''),all=el('input'),note=input('text',''),submit=el('button','Uji pengesahan'),message=el('p');
   for(const n of [reserve,neighborhood,operation]){n.min='0';n.step='1'}all.type='checkbox';all.required=true;note.required=Boolean(preview.hasWeightDifference);note.maxLength=300;submit.type='submit';
   form.addEventListener('input',()=>{dirty=true;message.textContent=''});
   form.addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;submit.disabled=true;try{await simulateApproval({role,preview,form:{confirmation:confirmation.value,allSold:all.checked,reserve:reserve.value,neighborhood:neighborhood.value,operation:operation.value,note:note.value}});if(!signal.aborted&&version===rev){message.textContent='Kontrak pengesahan valid. Simulasi saja — tidak ada saldo atau status yang diubah.';dirty=false}}catch(error){if(!signal.aborted&&version===rev)message.textContent=error.message}finally{busy=false;submit.disabled=false}});
   form.append(field('Cadangan (Rp)',reserve),field('Kas Lorong (Rp)',neighborhood),field('Operasional (Rp)',operation),field('Ketik ID batch: '+preview.batchId,confirmation),field('Setujui hasil timbang dan alokasi',all),field('Alasan selisih timbang',note),submit,message);result.append(form);status.textContent='Hasil server (baca saja). Pengesahan masih dalam mode simulasi.';
  }catch(error){if(!signal.aborted&&version===rev)status.textContent=error.message}finally{busy=false;read.disabled=!drafts.length||typeof previewRequest!=='function'}};
 p.append(label,read,status,result);
 if(!drafts.length)status.textContent='Belum ada draft penjualan yang dapat diperiksa.';
 return ()=>!busy&&(!dirty||window.confirm('Draf pengesahan belum diperiksa. Tinggalkan halaman?'));
}
export function attachPayoutManager(root,{el,panel,row,role,items,today,signal}){
 const p=panel(root,'Uji pengelolaan pengajuan');let busy=false,dirty=false;
 for(const item of items.filter(x=>['diajukan','disetujui'].includes(x.status))){
  const card=el('div',null,'bank-draft'),status=el('p'),note=el('input'),buttons=[];
  row(card,[item.nama,item.rumah].filter(Boolean).join(' · ')||'Anggota',money(item.amount_rp)+' · '+item.status);
  const actions=item.status==='diajukan'?[['Uji setujui','setujui'],['Uji tolak','tolak']]:[['Uji sudah dibayar','dibayar']];
  if(item.status==='diajukan'){note.placeholder='Alasan penolakan';note.maxLength=250;note.setAttribute('aria-label','Alasan penolakan');note.oninput=()=>{dirty=true;status.textContent=''};card.append(note)}
  for(const [name,action] of actions){const b=el('button',name);b.type='button';buttons.push(b);
   b.onclick=async()=>{if(busy)return;busy=true;buttons.forEach(x=>x.disabled=true);try{await simulatePayoutDecision({role,item,action,note:note.value,paidOn:today()});if(!signal.aborted){status.textContent='Validasi '+action+' berhasil. Status dan saldo asli tidak berubah.';dirty=false}}catch(error){if(!signal.aborted)status.textContent=error.message}finally{busy=false;buttons.forEach(x=>x.disabled=false)}};card.append(b)}
  card.append(status);p.append(card);
 }
 if(!items.some(x=>['diajukan','disetujui'].includes(x.status)))row(p,'Belum ada pengajuan aktif','');
 return ()=>!busy&&(!dirty||window.confirm('Catatan uji belum diperiksa. Tinggalkan halaman?'));
}
