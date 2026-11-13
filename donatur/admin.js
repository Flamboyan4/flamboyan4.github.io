/* Superadmin: seluruh operasi donatur divalidasi kembali di Worker. */
(()=>{
'use strict';
const API='https://api.flamboyan4.web.id';
const $=id=>document.getElementById(id);
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e};
const money=n=>'Rp '+Math.round(Number(n)||0).toLocaleString('id-ID');
const short=s=>String(s||'').length>55?String(s).slice(0,52)+'…':String(s||'');
let data=null,noticeTimer=null;
async function request(path,options={}){
 const r=await fetch(API+path,{credentials:'include',cache:'no-store',...options});
 const j=await r.json().catch(()=>({error:'Respons tidak valid'}));
 if(!r.ok||j.ok===false)throw Error(j.error||'Permintaan gagal');
 return j;
}
const message=(text,error=false)=>{
 const b=$('feedback');b.hidden=false;b.textContent=text;
 b.style.borderColor=error?'#f0bfcb':'#cdc9f1';
 b.style.color=error?'#a22043':'#493ba5';
 clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{b.hidden=true},6500);
};
function fill(select,items,placeholder){
 const chosen=select.value;select.replaceChildren(new Option(placeholder,''));
 for(const entry of items)select.add(new Option(entry.name,entry.id));
 if([...select.options].some(o=>o.value===chosen))select.value=chosen;
}
function record(parent,title,sub,badge){
 const row=node('div',undefined,'admin-record'),details=node('div');
 details.append(node('strong',title),node('small',sub));
 row.append(details);
 if(badge)row.append(node('span',badge,'pill'));
 parent.append(row);
}
function showList(id,arr,fn){
 const container=$(id);container.replaceChildren();
 if(!arr.length){container.append(node('p','Belum ada data.','muted'));return}
 arr.forEach(item=>fn(container,item));
}
function render(){
 $('count-org').textContent=data.organizations.length;
 $('count-users').textContent=data.accounts.length;
 $('count-programs').textContent=data.programs.length;
 const orgs=data.organizations.filter(x=>x.status==='aktif').map(x=>({id:x.id,name:x.name}));
 const programs=data.programs.filter(x=>x.status==='aktif').map(x=>({id:x.id,name:x.title}));
 const projects=data.projects.filter(x=>x.active&&!data.programs.some(p=>p.projectId===x.id)).map(x=>({id:x.id,name:x.title}));
 const funds=(data.catalog?.funds||[]).filter(f=>f.active!==false).map(f=>({id:f.id,name:f.name}));
 for(const select of document.querySelectorAll('.choose-org'))fill(select,orgs,'Pilih perusahaan');
 for(const select of document.querySelectorAll('.choose-program'))fill(select,programs,'Pilih program');
 fill($('choose-project'),projects,'Pilih projek yang belum dihubungkan');
 fill($('choose-fund'),funds,'Pilih pos dana yang sudah ada');
 showList('organizations',data.organizations,(parent,o)=>
  record(parent,o.name,[o.contactName,o.contactEmail].filter(Boolean).join(' · ')||'Belum ada kontak',o.status));
 const orgName=id=>data.organizations.find(x=>x.id===id)?.name||'Perusahaan';
 const programName=id=>data.programs.find(x=>x.id===id)?.title||'Program';
 showList('accounts',data.accounts,(parent,a)=>record(parent,a.username,orgName(a.organizationId),a.status));
 showList('programs',data.programs,(parent,p)=>record(parent,p.title,'Pos: '+(funds.find(f=>f.id===p.fundId)?.name||p.fundId),p.status));
 showList('allocations',data.links,(parent,l)=>record(parent,
  (l.kind==='incoming'?'Donasi · ':'Pengeluaran · ')+money(l.amountRp),
  orgName(l.organizationId)+' / '+programName(l.programId)+' / '+String(l.occurredOn||'').slice(0,10)));
 refreshEvents();
}
function refreshEvents(){
 const chosenProgram=$('form-transaction').elements.programId.value;
 const selected=data?.programs.find(p=>p.id===chosenProgram);
 const kind=$('choose-kind').value;
 const filtered=(data?.events||[]).filter(e=>e.kind===kind&&e.fundId===selected?.fundId);
 const el=$('choose-event'),old=el.value;el.replaceChildren(new Option('Pilih jurnal yang sudah disahkan',''));
 for(const e of filtered){
  const date=String(e.occurredOn||'').slice(0,10);
  el.add(new Option(date+' · '+money(e.amountRp)+' · '+short(e.note),e.id));
 }
 if([...el.options].some(o=>o.value===old))el.value=old;
 el.dispatchEvent(new Event('change'));
}
$('form-transaction').elements.programId.addEventListener('change',refreshEvents);
$('choose-kind').addEventListener('change',refreshEvents);
$('choose-event').addEventListener('change',()=>{
 const id=$('choose-event').value;
 const fundId=data?.programs.find(p=>p.id===$('form-transaction').elements.programId.value)?.fundId;
 const row=(data?.events||[]).find(x=>x.id===id&&x.fundId===fundId);
 $('event-amount').value=row?String(Math.round(Number(row.amountRp)||0)):'';
});
function formValues(form){
 const p=Object.fromEntries(new FormData(form).entries());
 for(const key of ['amountRp','progressPercent'])if(key in p&&p[key]!=='')p[key]=Number(p[key]);
 return p;
}
async function send(action,form){
 const submit=form.querySelector('[type=submit]');
 submit.disabled=true;
 try{
  const result=await request('/api/admin/donors',{method:'POST',headers:{'content-type':'application/json'},
   body:JSON.stringify({action,...formValues(form)})});
  if(!result.ok)throw Error('Penyimpanan gagal.');
  form.reset();
  await load();
  message('Data berhasil disimpan.');
 }catch(e){message(e.message||'Penyimpanan gagal.',true)}
 finally{submit.disabled=false}
}
const actions=[
 ['form-organization','create-organization'],
 ['form-account','create-account'],
 ['form-program','create-program'],
 ['form-transaction','link-transaction'],
 ['form-update','publish-update']
];
for(const [id,action] of actions){
 $(id).addEventListener('submit',event=>{event.preventDefault();void send(action,event.currentTarget)});
}
const now=new Date();$('form-update').elements.occurredOn.value=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
async function load(){
 try{
  data=await request('/api/admin/donors');
  render();$('admin-state').hidden=true;$('admin-app').hidden=false;
 }catch(e){
  $('admin-app').hidden=true;$('admin-state').hidden=false;
  $('admin-state').replaceChildren(node('h2','Tidak dapat memuat pengelolaan Donatur'),
   node('p',e.message||'Pastikan akun Superadmin aktif dan migrasi D1 sudah diterapkan.'));
 }
}
void load();
})();