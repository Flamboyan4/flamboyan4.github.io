/* Beranda Portal Utama · ringkasan album Cerita Warga terbaru dan populer. */
(()=>{'use strict';
const section=document.getElementById('cerita-warga'),grid=document.getElementById('f4g-home-grid');
if(!section||!grid)return;
const latest=document.getElementById('f4g-home-latest'),popular=document.getElementById('f4g-home-popular');
const icon=name=>{
 const paths={heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
 comment:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.8-5.2a8.5 8.5 0 1 1 16.2-4.3z"/>'};
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'+paths[name]+'</svg>';
};
const el=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=String(content);return x};
let payload=null,albums=new Map(),mode='terbaru';
function card(item){
 const block=el('article','f4g-home-card');
 const url=new URL('/dokumentasi/',location.origin);
 url.searchParams.set('album',item.albumId);url.searchParams.set('foto',item.id);
 const photo=el('a','f4g-home-photo');photo.href=url.href;photo.title='Buka foto di Galeri Warga';
 const img=el('img');img.src=item.url;img.loading='lazy';img.alt=item.caption||'Foto kegiatan warga';
 photo.append(img);
 const body=el('div','f4g-home-card-content');
 const title=el('a','f4g-home-title',albums.get(item.albumId)||item.caption||'Dokumentasi Warga');
 title.href=url.href;
 const info=el('div','f4g-home-info');
 info.append(el('span','',item.uploader||'Warga'),el('span','',String(item.date||'').slice(0,10)));
 const stats=el('div','f4g-home-stats');
 const likes=el('span');likes.innerHTML=icon('heart');likes.append(el('span','',String(item.likes||0)));
 const comments=el('span');comments.innerHTML=icon('comment');
 comments.append(el('span','',String(item.commentCount??item.comments?.length??0)));
 stats.append(likes,comments);
 const preview=el('div','f4g-home-comments');
 for(const comment of (item.comments||[]).slice(0,2)){
  const line=el('div','f4g-home-comment'),name=el('b','',(comment.nama||'Warga')+': ');
  line.append(name,document.createTextNode(comment.message||''));preview.append(line);
 }
 if(!preview.childNodes.length)preview.append(el('p','f4g-home-comment','Belum ada komentar'));
 body.append(title,info,stats,preview);block.append(photo,body);return block;
}
function render(){
 const all=(mode==='populer'&&payload.popular?.length?payload.popular:payload.highlights)||[];
 const unique=[];const seen=new Set();
 for(const x of all){if(!x.albumId||seen.has(x.albumId))continue;seen.add(x.albumId);unique.push(x);if(unique.length>=3)break}
 grid.replaceChildren(...unique.map(card));
 if(!unique.length){
  const empty=el('div','f4g-home-empty');
  empty.append(el('strong','','Belum ada unggahan foto warga.'),el('span','','Foto dan album yang dibagikan warga akan muncul di sini.'));
  const link=el('a','','Buka Dokumentasi');link.href='/dokumentasi/';empty.append(link);grid.append(empty);
 }
 section.hidden=false;
 latest.setAttribute('aria-selected',String(mode==='terbaru'));
 popular.setAttribute('aria-selected',String(mode==='populer'));
}
latest.addEventListener('click',()=>{mode='terbaru';render()});
popular.addEventListener('click',()=>{mode='populer';render()});
(async()=>{
 try{
  const [g,p]=await Promise.all([
   fetch('https://api.flamboyan4.web.id/api/v2/gallery',{cache:'no-store'}),
   fetch('https://api.flamboyan4.web.id/api/v2/public/portal',{cache:'no-store'})
  ]);
  if(!g.ok)throw Error('Galeri belum tersedia');
  payload=await g.json();
  if(!payload.ok||!Array.isArray(payload.highlights))throw Error('Data galeri belum siap');
  for(const row of payload.albums||[])albums.set(row.id,row.title);
  if(p.ok){const data=await p.json();for(const row of data.documentation||[])albums.set(row.id,row.title)}
  render();
 }catch(e){console.warn('Cerita Warga:',e.message);section.hidden=true}
})();
})();