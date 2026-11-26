/* One persistent read-only inbox. No notification data retained across accounts. */
export function createInbox({button,dialog,list,badge,get,navigate,el}){
 let key='',role='public',controller=null,sequence=0,loadedAt=0,items=[],tasks=[],failure=false,busy=false;
 const count=v=>Number.isSafeInteger(Number(v))&&Number(v)>0?Number(v):0;
 const task=(title,value,route)=>({title,count:count(value),route});
 function paint(){
  const total=items.filter(x=>!x.read).length+tasks.reduce((n,x)=>n+x.count,0);
  badge.hidden=!total;badge.textContent=total>99?'99+':String(total);
  button.setAttribute('aria-label','Notifikasi'+(total?' ('+total+')':''));
  if(!dialog.open)return;
  list.replaceChildren();
  if(busy)list.append(el('p','Memuat notifikasi…'));
  if(failure){const retry=el('button','Coba lagi');retry.type='button';retry.onclick=()=>void refresh(true);list.append(el('p','Sebagian notifikasi belum dapat dimuat.'),retry)}
  if(tasks.length){
   list.append(el('h3','Tugas pengelola'));
   for(const t of tasks.filter(x=>x.count)){
    const b=el('button',t.title+' · '+t.count,'inbox-row');b.type='button';b.onclick=()=>{dialog.close();if(t.route==='treasury')location.assign('/superadmin/#sa-treasury');else navigate(t.route)};list.append(b);
   }
  }
  list.append(el('h3','Dokumentasi'));
  for(const item of items){
   const b=el('button',item.title||'Dokumentasi warga','inbox-row');b.type='button';
   b.onclick=()=>{dialog.close();navigate('home-docs')};
   list.append(b,el('small',item.read?'Sebelumnya':'Anda ditandai dalam sebuah foto'));
  }
  if(!busy&&!failure&&!items.length&&!tasks.some(x=>x.count))list.append(el('p','Belum ada notifikasi.'));
 }
 function reset(){
  ++sequence;controller?.abort();controller=null;key='';role='public';items=[];tasks=[];loadedAt=0;failure=false;busy=false;
  button.hidden=true;if(dialog.open)dialog.close();list.replaceChildren();paint();
 }
 async function refresh(force=false){
  if(!key||busy||(!force&&Date.now()-loadedAt<30000))return;
  const token=++sequence;controller?.abort();controller=new AbortController();const signal=controller.signal;busy=true;failure=false;paint();
  const jobs=[get('/api/v2/gallery/tag-notifications',signal,true)];
  if(['admin','superadmin'].includes(role))jobs.push(get('/api/admin/bank/action-counts',signal,true));
  if(role==='superadmin')jobs.push(get('/api/v2/admin/treasury?view=notifications',signal,true));
  const responses=await Promise.allSettled(jobs);
  if(token!==sequence||signal.aborted)return;
  const tag=responses[0];if(tag.status==='fulfilled'&&Array.isArray(tag.value.items))items=tag.value.items;else failure=true;
  tasks=[];
  if(responses[1]?.status==='fulfilled'){const b=responses[1].value;tasks.push(task('Setoran belum dijual',b.unsoldDeposits,'bank-sale'),task('Penjualan belum disahkan',b.pendingApprovals,'bank-sale'),task('Pengajuan pencairan',b.pendingPayouts,'bank-payout'))}
  if(responses[2]?.status==='fulfilled'){const t=responses[2].value;tasks.push(task('Dana menunggu pengesahan',t.pendingCount,'treasury'),task(t.needsOpening?'Saldo awal belum disahkan':'Perlu pemeriksaan',t.needsOpening?1:t.warningCount,'treasury'))}
  failure||=responses.some(x=>x.status==='rejected');busy=false;loadedAt=Date.now();paint();
 }
 button.onclick=()=>{if(!key)return;dialog.showModal();paint();void refresh(true)};
 function setAccount(accountId,nextRole){
  if(!accountId||!['warga','admin','superadmin'].includes(nextRole)){reset();return}
  const next=String(accountId);
  if(key===next&&role===nextRole){void refresh();return}
  reset();key=next;role=nextRole;button.hidden=false;void refresh(true);
 }
 return {setAccount,reset,refresh};
}
