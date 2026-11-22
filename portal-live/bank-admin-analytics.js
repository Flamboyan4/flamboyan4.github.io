/* Analisis Setoran Pengelola — baca-saja dari API D1 yang sudah ada.
   Status draft/batal, setoran milik bank, dan data parsial tidak dimasukkan. */
(()=>{'use strict';
 const API='https://api.flamboyan4.web.id';
 const $=id=>document.getElementById(id);
 const cls='f4-analisis';
 const state={data:null,loadedAt:0,pending:null,generation:0,member:'',item:'',from:'',to:'',trend:'session',ranking:'active',allRanks:false,tab:'official'};
 const fmtKg=n=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format(Number(n)||0)+' kg';
 const fmtRp=n=>'Rp '+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(n)||0);
 const fmtInt=n=>new Intl.NumberFormat('id-ID').format(Number(n)||0);
 const isoDate=value=>String(value||'').slice(0,10);
 const normId=value=>String(value||'').trim().replace(/^member:/i,'');
 const dateLabel=value=>{const d=isoDate(value);if(!/^\d{4}-\d\d-\d\d$/.test(d))return d;return d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4)};
 const monthLabel=m=>{const names=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];return names[Number(String(m).slice(5,7))-1]+' '+String(m).slice(0,4)};
 const admin=()=>['admin','superadmin'].includes(String(document.body.dataset.f4BankRole||'').toLowerCase())
    &&!$('dashboardView')?.classList.contains('hidden');
 const node=(tag,className='',value)=>{const el=document.createElement(tag);if(className)el.className=className;if(value!==undefined)el.textContent=String(value);return el};
 const add=(p,...children)=>{children.forEach(x=>x&&p.append(x));return p};
 const options=(select,list,current)=>{select.replaceChildren();list.forEach(([value,label])=>select.add(new Option(label,value)));select.value=current;};
 const svg=(name)=>{
  const paths={
   chart:'<path d="M3 3v18h18M7 16l4-5 4 3 5-8"/>',
   recycle:'<path d="M7 7h9l-2.3-3M16 7l-3-5M16 17H6l2 3M6 17l3 5M4 10l-2 4 2 3h4M20 15l2-4-2-3h-4"/>',
   users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 11a3 3 0 1 0-1-6M17 15a5 5 0 0 1 4 5"/>',
   scale:'<path d="M12 3v18M4 7l8-4 8 4M4 7l-3 6h6zM20 7l-3 6h6zM6 21h12"/>',
   refresh:'<path d="M20 11a8 8 0 0 0-14.9-4L3 9m0-5v5h5M4 13a8 8 0 0 0 14.9 4L21 15m0 5v-5h-5"/>',
   trophy:'<path d="M7 4h10v7a5 5 0 0 1-10 0zM7 6H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4M12 16v4m-4 1h8"/>'
  };
  const el=document.createElementNS('http://www.w3.org/2000/svg','svg');
  el.setAttribute('viewBox','0 0 24 24');el.setAttribute('width','18');el.setAttribute('height','18');
  el.setAttribute('fill','none');el.setAttribute('stroke','currentColor');el.setAttribute('stroke-width','1.8');
  el.setAttribute('stroke-linecap','round');el.setAttribute('stroke-linejoin','round');
  el.setAttribute('aria-hidden','true');el.innerHTML=paths[name]||paths.chart;return el;
 };
 const get=async path=>{
  const response=await fetch(API+path,{credentials:'include',mode:'cors',cache:'no-store'});
  let payload;try{payload=await response.json()}catch(_){throw Error('Layanan tidak mengirim data JSON.')}
  if(!response.ok||payload?.ok===false)throw Error(payload?.error||'Akses data ditolak (HTTP '+response.status+').');
  return payload;
 };
 const toRows=result=>{
  const rows=Array.isArray(result)?result:Array.isArray(result?.rows)?result.rows:
   Array.isArray(result?.items)?result.items:Array.isArray(result?.data?.rows)?result.data.rows:
   Array.isArray(result?.data?.items)?result.data.items:Array.isArray(result?.data)?result.data:null;
  if(!rows)throw Error('Daftar dari server tidak lengkap; peringkat tidak ditampilkan.');
  return rows;
 };
 async function loadRecords(){
  const [rawMembers,rawDeposits,rawCatalog]=await Promise.all(['members','deposits','catalog'].map(name=>
    get('/api/v2/admin/bank/'+name+'?limit=300').then(toRows)));
  if([rawMembers,rawDeposits,rawCatalog].some(list=>list.length>=300))
   throw Error('Data mencapai batas 300 baris. Analisis dihentikan agar tidak menghasilkan peringkat yang keliru.');
  const members=rawMembers.map(x=>({id:normId(x.id),name:String(x.nama||'').trim(),house:String(x.rumah||'').trim()}))
    .filter(x=>x.id&&x.name);
  const memberById=new Map(members.map(x=>[x.id,x]));
  const catalog=rawCatalog.map(x=>({id:String(x.id||''),name:String(x.name||'').trim()}));
  const itemById=new Map(catalog.map(x=>[x.id,x]));
  const itemByName=new Map(catalog.map(x=>[x.name.toLowerCase(),x]));
  const deposits=rawDeposits.filter(x=>{
   const status=String(x.status||'').toLowerCase();
   return ['estimasi','terkonfirmasi'].includes(status)
    &&memberById.has(normId(x.member_id))&&/^\d{4}-\d\d-\d\d/.test(String(x.deposited_on||''));
  });
  const output=[];
  for(let i=0;i<deposits.length;i+=8){
   const batch=await Promise.all(deposits.slice(i,i+8).map(async deposit=>{
    const response=await get('/api/v2/admin/bank/deposit-detail?id='+encodeURIComponent(deposit.id));
    if(!Array.isArray(response.lines)||!response.lines.length)
     throw Error('Rincian setoran '+deposit.id+' tidak lengkap.');
    const lines=response.lines.map(line=>{
     const item=itemById.get(String(line.waste_item_id||''))||itemByName.get(String(line.name||'').trim().toLowerCase());
     const grams=Number(line.grams);
     if(!item||!Number.isFinite(grams)||grams<=0)
      throw Error('Rincian jenis/berat setoran '+deposit.id+' tidak valid.');
     return {item:item.id,name:item.name,kg:grams/1000};
    });
    const total=lines.reduce((sum,x)=>sum+x.kg,0);
    if(Math.abs(total-(Number(deposit.total_grams)||0)/1000)>0.002)
     throw Error('Berat barang tidak cocok pada setoran '+deposit.id+'.');
    return {id:String(deposit.id),member:normId(deposit.member_id),batch:String(deposit.batch_id||''),
     date:isoDate(deposit.deposited_on),month:isoDate(deposit.deposited_on).slice(0,7),
     total,estimate:Number(deposit.estimated_total_rp)||0,lines};
   }));
   output.push(...batch);
  }
  return {members,catalog,deposits:output};
 }
 const section=()=>$(cls+'-content');
 const status=(msg,error=false)=>{const el=$(cls+'-status');if(el){el.textContent=msg||'';el.hidden=!msg;el.classList.toggle('is-error',error)}};
 function clearPrivate(){
  state.generation++;state.data=null;state.loadedAt=0;state.pending=null;
  state.member='';state.item='';state.from='';state.to='';state.allRanks=false;
  const content=section();
  if(content){const blocks=$(cls+'-results');if(blocks)blocks.replaceChildren();}
  status('');
 }
 async function ensureData(force=false){
  if(!admin())return;
  if(!force&&state.data&&Date.now()-state.loadedAt<60000){render();return;}
  if(state.pending&&!force)return state.pending;
  const run=++state.generation;
  status('Memuat data setoran dari database…');
  const button=$(cls+'-refresh');if(button)button.disabled=true;
  const promise=(async()=>{
   try{
    const data=await loadRecords();
    if(run!==state.generation||!admin())return;
    state.data=data;state.loadedAt=Date.now();
    const months=[...new Set(data.deposits.map(x=>x.month))].sort();
    // Awali dari seluruh riwayat agar peringkat aktif/terbanyak tidak terkunci ke satu bulan.
    if(state.from&&!months.includes(state.from))state.from='';
    if(state.to&&!months.includes(state.to))state.to='';
    if(state.member&&!data.members.some(x=>x.id===state.member))state.member='';
    if(state.item&&!data.catalog.some(x=>x.id===state.item))state.item='';
    status('');render();
   }catch(error){
    if(run!==state.generation)return;
    state.data=null;status('Gagal membaca setoran: '+(error.message||error),true);
    $(cls+'-results')?.replaceChildren();
   }finally{
    if(run===state.generation){state.pending=null;if(button)button.disabled=false;}
   }
  })();
  state.pending=promise;return promise;
 }
 function makeMetric(iconName,label,value){
  const item=node('div','f4-analisis-metric');
  const head=add(node('div','f4-analisis-metric-head'),svg(iconName),node('span','',label));
  return add(item,head,node('strong','',value));
 }
 const memberTitle=m=>m?(m.name+(m.house?' · '+m.house:'')):'Warga tidak diketahui';
 function selectMember(id){state.member=state.member===id?'':id;render();}
 function selectItem(id){state.item=state.item===id?'':id;if(state.item&&state.ranking==='value')state.ranking='weight';render();}
 function render(){
  if(!admin()||!state.data||!section()||state.tab!=='analysis')return;
  const d=state.data;
  const months=[...new Set(d.deposits.map(x=>x.month))].sort();
  const monthOptions=months.map(m=>[m,monthLabel(m)]);
  options($(cls+'-from'),[['','Semua waktu'],...monthOptions],state.from);
  options($(cls+'-to'),[['','Semua waktu'],...monthOptions],state.to);
  options($(cls+'-member'),[['','Semua warga'],...d.members.slice().sort((a,b)=>a.name.localeCompare(b.name,'id')).map(m=>[m.id,memberTitle(m)])],state.member);
  const usedIds=new Set(d.deposits.flatMap(x=>x.lines.map(line=>line.item)));
  options($(cls+'-item'),[['','Semua jenis'],...d.catalog.filter(x=>usedIds.has(x.id)).sort((a,b)=>a.name.localeCompare(b.name,'id')).map(x=>[x.id,x.name])],state.item);
  const valueButton=$(cls+'-value-mode');
  valueButton.disabled=!!state.item;
  valueButton.title=state.item?'Nilai estimasi hanya untuk seluruh jenis barang.':'Berdasarkan estimasi saat penimbangan.';
  $(cls+'-ranking').querySelectorAll('button[data-mode]').forEach(b=>{
   const active=b.dataset.mode===state.ranking;
   b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));
  });
  $(cls+'-trend-select').value=state.trend;
  const start=state.from||'',end=state.to||'';
  if(start&&end&&start>end){
   status('Bulan awal melewati bulan akhir. Sesuaikan rentang.',true);
   $(cls+'-results')?.replaceChildren();return;
  }
  status('');
  const filtered=d.deposits.filter(x=>(!start||x.month>=start)&&(!end||x.month<=end)
   &&(!state.member||x.member===state.member)).map(x=>{
    const lines=state.item?x.lines.filter(line=>line.item===state.item):x.lines;
    return {...x,lines,weight:lines.reduce((s,line)=>s+line.kg,0)};
   }).filter(x=>x.lines.length);
  const totalKg=filtered.reduce((s,x)=>s+x.weight,0);
  const uniqueActive=new Set(filtered.map(x=>x.member));
  const itemTotals=new Map();
  filtered.forEach(x=>x.lines.forEach(line=>{
   const current=itemTotals.get(line.item)||{id:line.item,name:line.name,kg:0};
   current.kg+=line.kg;itemTotals.set(line.item,current);
  }));
  const categories=[...itemTotals.values()].sort((a,b)=>b.kg-a.kg||a.name.localeCompare(b.name,'id'));
  const ranks=d.members.filter(m=>!state.member||m.id===state.member).map(m=>{
   const mine=filtered.filter(x=>x.member===m.id);
   return {...m,active:new Set(mine.map(x=>x.batch||x.date)).size,weight:mine.reduce((sum,x)=>sum+x.weight,0),
    value:mine.reduce((sum,x)=>sum+x.estimate,0),records:mine.length};
  }).sort((a,b)=>b[state.ranking]-a[state.ranking]||b.weight-a.weight||a.name.localeCompare(b.name,'id'));
  const results=$(cls+'-results');results.replaceChildren();
  const metrics=node('div','f4-analisis-metrics');
  add(metrics,makeMetric('scale','Berat terkumpul',fmtKg(totalKg)),
    makeMetric('chart','Jumlah setoran',fmtInt(filtered.length)),
    makeMetric('users','Warga berpartisipasi',fmtInt(uniqueActive.size)+' / '+fmtInt(state.member?1:d.members.length)),
    makeMetric('recycle','Jenis terbanyak',categories[0]?.name||'—'));
  results.append(metrics);
  const charts=node('div','f4-analisis-charts');
  const trendBox=node('section','f4-analisis-panel');
  const trendHead=node('div','f4-analisis-panel-head');
  add(trendHead,node('h3','','Perkembangan Setoran'),node('small','','Berat setoran, bukan hasil penjualan'));
  trendBox.append(trendHead);
  const series=new Map();
  filtered.forEach(x=>{const k=state.trend==='month'?x.month:x.date;series.set(k,(series.get(k)||0)+x.weight);});
  const entries=[...series.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
  if(!entries.length)trendBox.append(node('p','f4-analisis-empty','Belum ada setoran pada filter ini.'));
  else{
   const chart=node('div','f4-analisis-trend');
   const visible=entries.slice(-12),max=Math.max(...visible.map(x=>x[1]),0.001);
   visible.forEach(([key,total])=>{
    const col=node('div','f4-analisis-trend-item');
    col.title=(state.trend==='month'?monthLabel(key):dateLabel(key))+' — '+fmtKg(total);
    const bar=node('div','f4-analisis-trend-track');
    const fill=node('div','f4-analisis-trend-bar');
    fill.style.height=Math.max(5,100*total/max)+'%';bar.append(fill);
    add(col,node('span','f4-analisis-trend-value',fmtKg(total)),bar,
     node('small','',state.trend==='month'?monthLabel(key):dateLabel(key).slice(0,5)));
    chart.append(col);
   });
   trendBox.append(chart);
   if(entries.length>12)trendBox.append(node('p','f4-analisis-hint','Grafik menampilkan 12 periode terakhir dari rentang yang dipilih.'));
  }
  const typeBox=node('section','f4-analisis-panel');
  add(typeBox,node('h3','','Jenis Sampah Terbanyak'));
  if(!categories.length)typeBox.append(node('p','f4-analisis-empty','Belum ada rincian barang.'));
  else{
   const max=categories[0].kg;
   categories.slice(0,8).forEach((entry,i)=>{
    const btn=node('button','f4-analisis-rankrow'+(state.item===entry.id?' is-selected':''));
    btn.type='button';btn.title='Filter jenis '+entry.name;
    const top=add(node('div','f4-analisis-rankrow-head'),
     node('span','',String(i+1)+'. '+entry.name),node('strong','',fmtKg(entry.kg)));
    const track=node('div','f4-analisis-horizontal-track');
    const fill=node('div','f4-analisis-horizontal-fill');fill.style.width=(100*entry.kg/max)+'%';track.append(fill);
    btn.append(top,track);btn.addEventListener('click',()=>selectItem(entry.id));typeBox.append(btn);
   });
   if(categories.length>8)typeBox.append(node('p','f4-analisis-hint','8 jenis teratas. Filter jenis untuk melihat rincian penyetornya.'));
  }
  charts.append(trendBox,typeBox);results.append(charts);
  const rankSection=node('section','f4-analisis-panel f4-analisis-people');
  const peopleHeading=add(node('div','f4-analisis-panel-head'),node('h3','','Peringkat Warga'),
   node('small','',state.ranking==='active'?'Keikutsertaan pada tanggal timbang berbeda':
    state.ranking==='weight'?'Total kilogram yang disetor':'Estimasi nilai saat penimbangan'));
  rankSection.append(peopleHeading);
  const rankList=node('div','f4-analisis-people-list');
  const maxRank=Math.max(...ranks.map(r=>r[state.ranking]),1);
  const label=r=>state.ranking==='active'?fmtInt(r.active)+' periode':
    state.ranking==='weight'?fmtKg(r.weight):fmtRp(r.value);
  ranks.slice(0,state.allRanks?undefined:8).forEach((r,i)=>{
   const row=node('button','f4-analisis-person'+(state.member===r.id?' is-selected':''));
   row.type='button';row.title='Lihat setoran '+r.name;
   const number=node('span','f4-analisis-place',i===0?'1':String(i+1));
   const who=node('div','f4-analisis-person-name');
   add(who,node('strong','',memberTitle(r)),node('small','',fmtKg(r.weight)+' · '+fmtInt(r.active)+' periode'));
   const amount=node('strong','f4-analisis-person-value',label(r));
   const progress=node('div','f4-analisis-person-progress');
   const fill=node('div','');fill.style.width=(100*r[state.ranking]/maxRank)+'%';progress.append(fill);
   add(row,number,who,amount,progress);row.addEventListener('click',()=>selectMember(r.id));rankList.append(row);
  });
  rankSection.append(rankList);
  if(ranks.length>8){const toggle=node('button','f4-analisis-more',state.allRanks?'Tampilkan lebih sedikit':'Lihat seluruh '+ranks.length+' warga');toggle.type='button';toggle.onclick=()=>{state.allRanks=!state.allRanks;render()};rankSection.append(toggle);}
  if(!ranks.length)rankSection.append(node('p','f4-analisis-empty','Daftar anggota tidak tersedia.'));
  if(state.ranking==='active')rankSection.append(node('p','f4-analisis-hint','Satu tanggal penimbangan dihitung 1 kali hadir per warga, meskipun menyetor beberapa jenis barang.'));
  results.append(rankSection);
  const detailBox=node('section','f4-analisis-panel f4-analisis-detail');
  const detailHead=add(node('div','f4-analisis-panel-head'),node('h3','','Rincian Setoran'),
   node('small','',fmtInt(filtered.length)+' transaksi'));
  detailBox.append(detailHead);
  if(!filtered.length)detailBox.append(node('p','f4-analisis-empty','Tidak ada setoran yang sesuai dengan filter.'));
  else{
   const byId=new Map(d.members.map(m=>[m.id,m]));
   filtered.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)).forEach((r,i)=>{
    const wrap=node('details','f4-analisis-record');
    const summary=node('summary','f4-analisis-record-summary');
    const main=node('div','f4-analisis-record-main');
    add(main,node('strong','',memberTitle(byId.get(r.member))),
     node('small','',dateLabel(r.date)+' · '+fmtInt(r.lines.length)+' jenis'));
    add(summary,node('span','f4-analisis-record-index',String(i+1)),main,node('strong','f4-analisis-record-weight',fmtKg(r.weight)));
    wrap.append(summary);
    const list=node('div','f4-analisis-record-lines');
    r.lines.forEach(line=>{
     add(list,add(node('div','f4-analisis-record-line'),node('span','',line.name),
      node('strong','',fmtKg(line.kg))));
    });
    if(!state.item)list.append(node('p','f4-analisis-hint','Nilai setoran saat timbang: '+fmtRp(r.estimate)+' (estimasi, bukan saldo pencairan).'));
    wrap.append(list);detailBox.append(wrap);
   });
  }
  results.append(detailBox);
 }
 function mount(){
  const report=$('pageLaporan');if(!report)return false;
  if($(cls+'-tabs'))return true;
  const heading=report.querySelector(':scope > h2');
  const tabs=node('div','f4-analisis-tabs');tabs.id=cls+'-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Jenis laporan pengelola');
  const official=node('button','is-active','Laporan Resmi');official.type='button';official.setAttribute('role','tab');official.setAttribute('aria-selected','true');official.id=cls+'-tab-official';
  const analysis=node('button','','Analisis Setoran');analysis.type='button';analysis.setAttribute('role','tab');analysis.setAttribute('aria-selected','false');analysis.id=cls+'-tab-analysis';
  tabs.append(official,analysis);
  // Pertahankan semua elemen laporan resmi di posisi semula agar CSS dan handler lama tidak berubah.
  const content=node('section','f4-analisis-content');content.id=cls+'-content';content.hidden=true;content.setAttribute('role','tabpanel');content.setAttribute('aria-labelledby',analysis.id);
  const syncOfficial=()=>Array.from(report.children).filter(el=>el!==heading&&el!==tabs&&el!==content)
   .forEach(el=>el.classList.toggle('f4-analisis-official-off',state.tab==='analysis'));
  const titlebar=node('div','f4-analisis-titlebar');
  const title=add(node('div'),node('h3','','Analisis Setoran Warga'),node('p','','Pantau keaktifan, berat, jenis barang, dan riwayat penimbangan.'));
  const refresh=node('button','f4-analisis-refresh');refresh.id=cls+'-refresh';refresh.type='button';add(refresh,svg('refresh'),node('span','','Muat ulang'));refresh.onclick=()=>ensureData(true);
  titlebar.append(title,refresh);
  const controls=node('div','f4-analisis-controls');
  function picker(id,label){const cell=node('label','f4-analisis-filter');cell.append(node('span','',label));const select=node('select');select.id=cls+'-'+id;cell.append(select);return cell;}
  controls.append(picker('from','Dari bulan'),picker('to','Sampai bulan'),picker('member','Nama warga'),picker('item','Jenis sampah'));
  const buttons=node('div','f4-analisis-mode-row');
  const toggleLabel=node('strong','','Urutkan warga');
  const ranking=node('div','f4-analisis-ranking');ranking.id=cls+'-ranking';
  [['active','Paling aktif'],['weight','Berat terbanyak'],['value','Nilai estimasi']].forEach(([mode,label])=>{
   const button=node('button','',label);button.type='button';button.dataset.mode=mode;if(mode==='value')button.id=cls+'-value-mode';
   button.addEventListener('click',()=>{state.ranking=mode;render()});ranking.append(button);
  });
  const trendGroup=picker('trend-select','Grafik berdasarkan');
  const trendSelect=trendGroup.querySelector('select');
  trendSelect.add(new Option('Per penimbangan','session'));trendSelect.add(new Option('Per bulan','month'));
  buttons.append(toggleLabel,ranking,trendGroup);
  const alert=node('div','f4-analisis-status');alert.id=cls+'-status';alert.setAttribute('role','status');alert.setAttribute('aria-live','polite');alert.hidden=true;
  const results=node('div','f4-analisis-results');results.id=cls+'-results';
  content.append(titlebar,controls,buttons,alert,results);
  if(heading)heading.after(tabs);else report.prepend(tabs);
  report.append(content);
  syncOfficial();
  // Komponen laporan resmi lain dapat ditambahkan sesudah mount; tetap sembunyikan hanya saat tab analisis aktif.
  new MutationObserver(syncOfficial).observe(report,{childList:true});
  function switchTo(which){
   if(!admin())return;
   state.tab=which;syncOfficial();content.hidden=which!=='analysis';
   official.classList.toggle('is-active',which==='official');
   analysis.classList.toggle('is-active',which==='analysis');
   official.setAttribute('aria-selected',String(which==='official'));analysis.setAttribute('aria-selected',String(which==='analysis'));
   if(which==='analysis')ensureData();
  }
  official.onclick=()=>switchTo('official');
  analysis.onclick=()=>switchTo('analysis');
  $(cls+'-from').onchange=e=>{state.from=e.target.value;render()};
  $(cls+'-to').onchange=e=>{state.to=e.target.value;render()};
  $(cls+'-member').onchange=e=>{state.member=e.target.value;render()};
  $(cls+'-item').onchange=e=>{state.item=e.target.value;if(state.item&&state.ranking==='value')state.ranking='weight';render()};
  trendSelect.onchange=e=>{state.trend=e.target.value;render()};
  const previousReset=window.f4BankResetForAccountSwitch;
  window.f4BankResetForAccountSwitch=function(...args){
   clearPrivate();return typeof previousReset==='function'?previousReset.apply(this,args):undefined;
  };
  const observer=new MutationObserver(()=>{
   if(!admin()){if(state.data||state.pending)clearPrivate();switchToOfficialOnLogout();}
  });
  function switchToOfficialOnLogout(){
   state.tab='official';syncOfficial();content.hidden=true;
   official.classList.add('is-active');analysis.classList.remove('is-active');
   official.setAttribute('aria-selected','true');analysis.setAttribute('aria-selected','false');
  }
  observer.observe(document.body,{attributes:true,attributeFilter:['data-f4-bank-role']});
  const dashboard=$('dashboardView');if(dashboard)observer.observe(dashboard,{attributes:true,attributeFilter:['class']});
  return true;
 }
 // Halaman laporan dibuat secara dinamis oleh halaman Bank Sampah lama.
 // Pasang tab walau halaman laporannya baru muncul setelah DOM siap.
 function start(){
  if(mount())return;
  const watch=new MutationObserver(()=>{if(mount())watch.disconnect();});
  watch.observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();