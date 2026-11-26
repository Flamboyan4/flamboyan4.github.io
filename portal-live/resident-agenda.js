window.F4PortalRuntime.define("/portal-live/resident-agenda.js",function(__f4){

'use strict';
const doc=__f4.globals.document,win=__f4.window,root=doc.getElementById('f4-resident-content');
if(!root)return;
const API='https://api.flamboyan4.web.id';
const el=(tag,cls='',value)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
const btn=(label,fn,cls='rp-button')=>{const b=el('button',cls,label);b.type='button';b.onclick=fn;return b};
const link=(label,href,cls='rp-button')=>{const a=el('a',cls,label);a.href=href;return a};
const read=async path=>{const r=await __f4.globals.fetch(API+path,{credentials:'include',cache:'no-store'});const data=await r.json();if(!r.ok||data.ok===false)throw Error(data.error||'Data tidak tersedia');return data};
const money=value=>'Rp'+Number(value).toLocaleString('id-ID',{maximumFractionDigits:0});
const today=()=>new Date(Date.now()+7*3600000).toISOString().slice(0,10);
const dateLabel=s=>/^\d{4}-\d{2}-\d{2}/.test(String(s||''))?new Date(s.slice(0,10)+'T00:00:00Z').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'—';
let serial=0,identity=null,account='',busy=false;
const message=(value)=>{root.replaceChildren(el('p','rp-empty',value))};
function roleChanged(e){
 if(e.origin!==__f4.globals.location.origin||e.source!==window||e.data?.type!=='f4:demo-role')return;
 const valid=e.data.role==='warga'&&e.data.identity?.accountId;
 if(!valid){serial++;account='';identity=null;busy=false;message('Masuk sebagai warga untuk membuka halaman ini.');root.append(btn('Masuk',()=>win.f4ShowLogin?.()));return}
 identity=e.data.identity;
 if(account===identity.accountId)return;
 account=identity.accountId;void load();
}
win.addEventListener('message',roleChanged);
let pullRefresh=null;
win.f4RefreshResidentPage=()=>{
 if(!identity||!account)return Promise.resolve();
 if(!pullRefresh)pullRefresh=Promise.resolve().then(()=>load()).finally(()=>{pullRefresh=null});
 return pullRefresh;
};
__f4.cleanup(()=>{serial++;identity=null;account='';});

const iso=d=>d.toISOString().slice(0,10);
const parse=s=>new Date(s+'T00:00:00Z');
const isDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||''))&&!Number.isNaN(parse(s).getTime());
const addDays=(s,n)=>{const d=parse(s);d.setUTCDate(d.getUTCDate()+n);return iso(d)};
const category=x=>/bank\s*sampah|penimbangan/i.test(x)?'bank':/gorol|kerja\s*bakti|gotong/i.test(x)?'gorol':'general';
function merge(data){
 const raw=(Array.isArray(data.agenda)?data.agenda:[]).filter(x=>isDate(String(x.starts_on||'').slice(0,10)));
 const arisan=(Array.isArray(data.arisan)?data.arisan:[]).filter(x=>isDate(x.period_on)&&!/batal/i.test(x.status||''));
 const matching=new Set(),events=[];
 for(const a of arisan){const month=a.period_on.slice(0,7),m=raw.find(x=>String(x.starts_on).startsWith(month)&&/\barisan\b/i.test(x.title+' '+x.description));if(m)matching.add(m);const first=parse(month+'-01'),weekday=first.getUTCDay();const date=a.period_on.endsWith('-01')?(m&&String(m.starts_on).slice(0,10)!==month+'-01'?String(m.starts_on).slice(0,10):month+'-'+String(1+(6-weekday+7)%7+7+(weekday>=4?7:0)).padStart(2,'0')):a.period_on;
 events.push({date,title:m?.title||'Arisan Warga',description:[a.host_name?'Tuan rumah: '+a.host_name:'',m?.description].filter(Boolean).join(' · '),location:m?.location||'',status:/sudah|selesai|terlaksana/i.test(a.status||'')?'Selesai':m?.status||'Direncanakan',kind:'general'});}
 for(const x of raw)if(!matching.has(x))events.push({date:String(x.starts_on).slice(0,10),title:x.title||'Kegiatan warga',description:x.description||'',location:x.location||'',status:x.status||'Direncanakan',kind:category(x.title||'')});return events;
}
function bankDates(rule,month){
 if(!rule||!isDate(rule.nextOccurrence))return [];
 const end=iso(new Date(Date.UTC(+month.slice(0,4),+month.slice(5,7),0)));let date=rule.nextOccurrence,rows=[];
 for(let i=0;i<1000&&date<=end;i++){if(date.startsWith(month))rows.push({date,title:'Penimbangan Bank Sampah',description:'Jadwal penimbangan rutin',location:'',status:'Direncanakan',kind:'bank'});
 if(rule.frequency==='monthly'){const d=parse(date),y=d.getUTCFullYear(),m=d.getUTCMonth()+1;date=iso(new Date(Date.UTC(y,m,Math.min(Number(rule.dayOfMonth)||1,new Date(Date.UTC(y,m+1,0)).getUTCDate()))))}else date=addDays(date,rule.frequency==='biweekly'?14:7)}
 return rows;
}
async function load(){
 const seq=++serial;root.replaceChildren();const head=el('div','rp-heading');head.append(el('h1','','Agenda'),btn('Muat ulang',()=>void load(),'rp-small'));root.append(head);
 const calendar=el('section','rp-card'),nav=el('div','rp-between'),title=el('h2'),grid=el('div','rp-calendar'),list=el('section','rp-card');let month=today().slice(0,7),selected='',events=[],rule=null,loaded=false;
 const move=n=>{const d=parse(month+'-01');d.setUTCMonth(d.getUTCMonth()+n);month=iso(d).slice(0,7);selected='';paint()};
 const arrow=(dir,fn)=>{const b=btn('',fn,'rp-arrow');b.setAttribute('aria-label',dir<0?'Bulan sebelumnya':'Bulan berikutnya');b.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="'+(dir<0?'m15 6-6 6 6 6':'m9 6 6 6-6 6')+'"/></svg>';return b};
 nav.append(arrow(-1,()=>move(-1)),title,arrow(1,()=>move(1)));calendar.append(nav,grid);const legend=el('div','rp-legend');for(const [kind,label] of [['general','Kegiatan / Arisan'],['gorol','Gorol'],['bank','Bank Sampah']]){const e=el('span');e.append(el('i','rp-dot '+kind),el('span','',label));legend.append(e)}calendar.append(legend);root.append(calendar,list);
 function paint(){
  const first=parse(month+'-01');title.textContent=first.toLocaleDateString('id-ID',{month:'long',year:'numeric',timeZone:'UTC'});grid.replaceChildren();
  const days=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
  const rows=events.filter(e=>e.date.startsWith(month));for(const e of bankDates(rule,month))if(!rows.some(x=>x.date===e.date&&x.kind==='bank'))rows.push(e);
  for(const weekday of ['Min','Sen','Sel','Rab','Kam','Jum','Sab'])grid.append(el('span','rp-weekday',weekday));
  for(let i=0;i<first.getUTCDay();i++)grid.append(el('span','rp-blank'));
  for(let day=1;day<=days;day++){const date=month+'-'+String(day).padStart(2,'0');const b=btn(String(day),()=>{selected=selected===date?'':date;paint()},'rp-day');b.setAttribute('aria-pressed',String(selected===date));if(date===today())b.classList.add('today');const dots=el('span','rp-dots');for(const kind of new Set(rows.filter(x=>x.date===date).map(x=>x.kind)))dots.append(el('i','rp-dot '+kind));b.append(dots);grid.append(b)}
  list.replaceChildren();const h=el('div','rp-between');h.append(el('h2','',selected?dateLabel(selected):'Kegiatan bulan ini'));if(selected)h.append(btn('Semua',()=>{selected='';paint()},'rp-small'));list.append(h);
  if(!loaded){list.append(el('p','rp-empty','Memuat jadwal…'));return}
  const show=rows.filter(e=>!selected||e.date===selected).sort((a,b)=>a.date.localeCompare(b.date));if(!show.length){list.append(el('p','rp-empty','Tidak ada kegiatan tercatat.'));return}
  for(const event of show){const item=el('details','rp-event');const summary=el('summary');const day=el('div','rp-date '+event.kind);day.append(el('b','',event.date.slice(-2)),el('small','',parse(event.date).toLocaleDateString('id-ID',{month:'short',timeZone:'UTC'})));const info=el('div');info.append(el('strong','',event.title),el('small','',event.status));summary.append(day,info);item.append(summary,el('p','rp-event-detail',[event.location,event.description].filter(Boolean).join(' · ')||'Tidak ada rincian tambahan.'));list.append(item)}
 }
 paint();const result=await Promise.allSettled([read('/api/v2/public/portal'),read('/api/public/bank/weighing-schedule')]);if(seq!==serial)return;loaded=true;if(result[0].status==='fulfilled')events=merge(result[0].value);if(result[1].status==='fulfilled')rule=result[1].value;paint();if(result.some(r=>r.status==='rejected'))root.append(el('p','rp-empty','Sebagian jadwal belum dapat dimuat. Gunakan Muat ulang.'));
}

});
