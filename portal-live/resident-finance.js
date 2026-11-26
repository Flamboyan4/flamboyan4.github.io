window.F4PortalRuntime.define("/portal-live/resident-finance.js",function(__f4){

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
__f4.cleanup(()=>{serial++;identity=null;account='';});

const eye=(shown)=>'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shown?'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>':'<path d="M3 3l18 18M9.8 5.3A11 11 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.4 3.3M6.2 6.2C3.5 8.2 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.3-.9"/>')+'</svg>';
const status=(due,paid)=>paid>=due?'Lunas':paid>0?'Kurang bayar':'Belum bayar';
const names={IURAN_BULANAN:'Iuran RT, RW & Keamanan',KAS_LORONG:'Kas Lorong',KEBERSIHAN:'Kebersihan',ARISAN:'Arisan'};
let historySeq=0;
async function load(){
 const seq=++serial;historySeq++;root.replaceChildren();busy=true;
 const heading=el('div','rp-heading');heading.append(el('h1','','Keuangan Saya'));root.append(heading);
 const bank=el('section','rp-bank');bank.innerHTML='<div class="rp-between"><h2>Tabungan Bank Sampah</h2><button type="button" class="rp-eye" aria-label="Tampilkan saldo" aria-pressed="false"></button></div><p>Total saldo belum dicairkan</p><strong class="rp-saldo" data-amount="total">Rp ••••••</strong><div class="rp-split"><div><small>Bisa dicairkan</small><b data-amount="available">Rp ••••</b></div><div><small>Menunggu penjualan</small><b data-amount="pending">Rp ••••</b></div></div>';
 bank.append(link('Lihat tabungan','/bank-sampah/','rp-bank-link'));root.append(bank);
 let shown=false,savings=null;
 const toggle=bank.querySelector('.rp-eye');
 function paint(){toggle.innerHTML=eye(shown);toggle.setAttribute('aria-pressed',String(shown));toggle.setAttribute('aria-label',shown?'Sembunyikan saldo':'Tampilkan saldo');for(const [key,v] of [['total',savings?savings.saldoTersediaRp+savings.estimasiMenungguRp:null],['available',savings?.saldoTersediaRp],['pending',savings?.estimasiMenungguRp]])bank.querySelector('[data-amount="'+key+'"]').textContent=shown?(Number.isFinite(v)?money(v):'Belum tersedia'):'Rp ••••'}
 toggle.onclick=()=>{shown=!shown;paint()};paint();
 const dues=el('section','rp-card'),top=el('div','rp-between'),period=el('input','rp-month');period.type='month';period.value=today().slice(0,7);period.setAttribute('aria-label','Periode kewajiban');top.append(el('h2','','Kewajiban bulanan'),period);dues.append(top);const dueBody=el('div');dues.append(dueBody);root.append(dues);
 let dueSeq=0;
 async function loadDues(){const request=++dueSeq;dueBody.replaceChildren(el('p','rp-empty','Memuat kewajiban…'));try{const data=await read('/api/member/dues?month='+encodeURIComponent(period.value));if(seq!==serial||request!==dueSeq)return;dueBody.replaceChildren();if(!data.linked||!data.configured){dueBody.append(el('p','rp-empty','Kewajiban belum tersedia untuk periode ini.'));return}
 for(const item of data.components||[]){const due=Number(item.wajibRp),paid=Number(item.terbayarRp);if(!Number.isFinite(due)||!Number.isFinite(paid)||due<=0)continue;const row=el('div','rp-line');const info=el('div');info.append(el('strong','',names[item.jenis]||item.jenis),el('small','rp-state '+(paid>=due?'paid':'unpaid'),status(due,paid)));row.append(info,el('b','',money(due)));dueBody.append(row)}
 const total=el('div','rp-total');total.append(el('span','','Sisa kewajiban'),el('strong','',money(data.totalSisaRp)));dueBody.append(total);
 }catch(e){if(seq===serial&&request===dueSeq)dueBody.replaceChildren(el('p','rp-empty','Kewajiban belum dapat dimuat.'),btn('Coba lagi',loadDues,'rp-small'))}}
 period.onchange=loadDues;void loadDues();
 const reminders=el('section','rp-reminders');reminders.hidden=true;root.append(reminders);
 const history=el('section','rp-card');history.append(el('h2','','Riwayat pembayaran'));
 const controls=el('div','rp-tabs');const historyBody=el('div');history.append(controls,historyBody);root.append(history);
 const types=[['payments','Iuran'],['arisan','Arisan'],['fines','Denda'],['loans','Pinjaman']];
 let selected='payments';const cache={};
 async function showHistory(kind){selected=kind;const req=++historySeq;for(const b of controls.children)b.setAttribute('aria-pressed',String(b.dataset.kind===kind));historyBody.replaceChildren(el('p','rp-empty','Memuat riwayat…'));
 try{const data=cache[kind]||await read('/api/member/'+kind);if(seq!==serial||req!==historySeq)return;cache[kind]=data;historyBody.replaceChildren();const rows=Array.isArray(data.rows)?data.rows:[];if(!rows.length){historyBody.append(el('p','rp-empty',data.linked===false?'Akun belum terhubung ke pembukuan.':'Belum ada catatan.'));return}
 const ordered=rows.slice().sort((a,b)=>String(b.tanggal||'').localeCompare(String(a.tanggal||'')));let limit=5;
 function paintHistory(){historyBody.replaceChildren();for(const row of ordered.slice(0,limit)){const line=el('div','rp-line');const info=el('div');info.append(el('strong','',names[row.jenis]||row.jenis||types.find(x=>x[0]===kind)?.[1]||'Transaksi'),el('small','', [row.periode,dateLabel(row.tanggal),row.status].filter(Boolean).join(' · ')));line.append(info,el('b','',Number.isFinite(Number(row.nominalRp))?money(row.nominalRp):'—'));historyBody.append(line)}if(ordered.length>limit)historyBody.append(btn('Tampilkan lainnya',()=>{limit+=10;paintHistory()},'rp-small'))}
 paintHistory();
 }catch(e){if(seq===serial&&req===historySeq)historyBody.replaceChildren(el('p','rp-empty','Riwayat belum dapat dimuat.'),btn('Coba lagi',()=>showHistory(kind),'rp-small'))}}
 for(const [kind,label] of types){const b=btn(label,()=>showHistory(kind),'rp-tab');b.dataset.kind=kind;controls.append(b)}void showHistory(selected);
 read('/api/member/savings').then(b=>{if(seq!==serial)return;if(Number.isFinite(b.saldoTersediaRp)&&Number.isFinite(b.estimasiMenungguRp))savings=b;paint()}).catch(()=>{if(seq===serial)paint()});
 for(const [kind,label] of [['fines','Denda'],['loans','Pinjaman']])read('/api/member/'+kind).then(data=>{if(seq!==serial)return;cache[kind]=data;if(data.linked===false)throw Error('Akun belum terhubung');const total=(data.rows||[]).filter(r=>!['dibatalkan','batal','lunas'].includes(String(r.status||'').toLowerCase())).reduce((sum,r)=>sum+Math.max(0,(Number(r.nominalRp)||0)-(Number(r.dibayarRp)||0)),0);if(total>0){if(reminders.hidden){reminders.hidden=false;reminders.append(el('h2','','Perlu perhatian'))}const b=btn('',()=>{void showHistory(kind);history.scrollIntoView({block:'start',behavior:'instant'})},'rp-warning');b.append(el('span','',label+' belum lunas'),el('strong','',money(total)));reminders.append(b)}}).catch(()=>{if(seq!==serial)return;if(reminders.hidden){reminders.hidden=false;reminders.append(el('h2','','Perlu perhatian'))}reminders.append(el('p','rp-empty','Status '+label.toLowerCase()+' belum dapat diperiksa.'))});
 busy=false;
}

});
