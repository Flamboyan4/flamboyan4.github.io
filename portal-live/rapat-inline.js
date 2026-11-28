/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/rapat/index.html#inline-1",function(__f4){

__f4.expose("CSV_RAPAT_URL",()=>CSV_RAPAT_URL,null);
__f4.expose("PLACEHOLDER_IMG",()=>PLACEHOLDER_IMG,null);
__f4.expose("globalRapatData",()=>globalRapatData,value=>globalRapatData=value);
__f4.expose("currentActiveRapatId",()=>currentActiveRapatId,value=>currentActiveRapatId=value);
__f4.expose("isModalOpenStack",()=>isModalOpenStack,value=>isModalOpenStack=value);
__f4.expose("rapatZoom",()=>rapatZoom,value=>rapatZoom=value);
__f4.expose("zoomRapat",()=>zoomRapat,value=>zoomRapat=value);
__f4.expose("enableRapatPinch",()=>enableRapatPinch,value=>enableRapatPinch=value);
__f4.expose("extractDriveFileId",()=>extractDriveFileId,value=>extractDriveFileId=value);
__f4.expose("extractGoogleDocId",()=>extractGoogleDocId,value=>extractGoogleDocId=value);
__f4.expose("fixDriveUrl",()=>fixDriveUrl,value=>fixDriveUrl=value);
__f4.expose("openModalDocRapat",()=>openModalDocRapat,value=>openModalDocRapat=value);
__f4.expose("closeModalDocRapat",()=>closeModalDocRapat,value=>closeModalDocRapat=value);
__f4.expose("copyCurrentRapatLink",()=>copyCurrentRapatLink,value=>copyCurrentRapatLink=value);
__f4.expose("rapatFileDetails",()=>rapatFileDetails,value=>rapatFileDetails=value);
__f4.expose("renderRapatCards",()=>renderRapatCards,value=>renderRapatCards=value);
__f4.expose("rapatToken",()=>rapatToken,null);

    __f4.globals.lucide.createIcons();

    const CSV_RAPAT_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnRRJsbu9EBj7aRA1k-6Jz5tWxL7l6uZz37ckgt4POJSYm0d93qNC3rqbG048eY7a-Y5NCWNIgF3wV/pub?gid=449852491&single=true&output=csv';
    const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='100%25' height='100%25' fill='%231e1b4b'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%23818cf8' text-anchor='middle' dy='.3em'%3EHasil Rapat Warga%3C/text%3E%3C/svg%3E";

    let globalRapatData = [];
    let currentActiveRapatId = '';
    let isModalOpenStack = false;
    let rapatZoom = 1;
    function zoomRapat(delta) {
      rapatZoom=__f4.globals.Math.max(0.6,__f4.globals.Math.min(3,__f4.globals.Math.round((rapatZoom+delta)*10)/10));
      const viewer=__f4.globals.document.getElementById('modal-rapat-body');
      viewer.style.setProperty('--f4-doc-zoom',(0,__f4.globals.String)(rapatZoom));
      __f4.globals.document.getElementById('f4-rapat-zoom-level').textContent=__f4.globals.Math.round(rapatZoom*100)+'%';
    }
    function enableRapatPinch() {
      const viewer=__f4.globals.document.getElementById('modal-rapat-body');
      let distance=0;
      function begin(e){if(e.touches?.length===2)distance=__f4.globals.Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)}
      function move(e){if(e.touches?.length!==2||!distance)return;
       const next=__f4.globals.Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
       if(__f4.globals.Math.abs(next-distance)>14){zoomRapat(next>distance?0.1:-0.1);distance=next}
       if(e.cancelable)e.preventDefault();
      }
      viewer.addEventListener('touchstart',begin,{passive:true});
      viewer.addEventListener('touchmove',move,{passive:false});
      const observer=new __f4.globals.MutationObserver(()=>{
        const f=viewer.querySelector('iframe');
        if(!f||f.dataset.f4PinchReady)return;
        f.dataset.f4PinchReady='1';
        f.addEventListener('load',()=>{
          try{const doc=f.contentDocument;doc?.addEventListener('touchstart',begin,{passive:true});doc?.addEventListener('touchmove',move,{passive:false})}catch{}
        },{once:true});
      });
      observer.observe(viewer,{childList:true});
    }
    __f4.globals.document.addEventListener('DOMContentLoaded',enableRapatPinch);

    function extractDriveFileId(url) {
      if (!url) return null;
      let cleanUrl = url.toString().replace(/[\[\]'"]/g, '').trim();
      const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    function extractGoogleDocId(url) {
      if (!url) return null;
      let cleanUrl = url.toString().replace(/[\[\]'"]/g, '').trim();
      const match = cleanUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    function fixDriveUrl(url) {
      if (!url) return PLACEHOLDER_IMG;
      let cleanUrl = url.toString().replace(/[\[\]'"]/g, '').trim();
      const fileId = extractDriveFileId(cleanUrl);
      if (fileId) {
        return 'https://lh3.googleusercontent.com/d/' + fileId;
      }
      return cleanUrl;
    }

    function openModalDocRapat(rapatId, isFromHash = false) {
      const rapatItem = globalRapatData.find(item => item.id === rapatId || item.recordId === rapatId);
      if (!rapatItem) return;

      currentActiveRapatId = rapatItem.id;
      __f4.globals.document.getElementById('modal-rapat-tgl').innerText = rapatItem.tanggal;
      __f4.globals.document.getElementById('modal-rapat-judul').innerText = rapatItem.judul;
      rapatZoom=1; zoomRapat(0);

      __f4.globals.document.getElementById('modal-rapat-body').innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 space-y-3">
          <div class="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs text-slate-500 font-medium">Memuat dokumen...</p>
        </div>
      `;

      __f4.globals.document.getElementById('modal-doc-rapat').classList.remove('hidden');
      __f4.globals.document.body.style.overflow = 'hidden';

      if (!isFromHash) {
        const address=new __f4.globals.URL(__f4.globals.location.href);
        address.searchParams.set('doc',rapatId);address.hash='';
        __f4.globals.history.pushState({ rapatId },'',address.pathname+address.search);
      }
      isModalOpenStack = true;

      const rawUrl = rapatItem.docUrl || '';
      const docId = extractGoogleDocId(rawUrl);
      const driveFileId = extractDriveFileId(rawUrl);

      // GOOGLE DOCS -> HTML RESPONSIVE, TETAP MEMPERTAHANKAN STYLE ASLI GOOGLE DOCS
      if (docId) {
        const fetchUrl = `https://docs.google.com/feeds/download/documents/export/Export?id=${docId}&exportFormat=html`;

        (0,__f4.globals.fetch)(fetchUrl, { cache: 'no-store' })
          .then(res => {
            if (!res.ok) throw new __f4.globals.Error(`HTTP ${res.status}`);
            return res.text();
          })
          .then(htmlText => {
            const parser = new __f4.globals.DOMParser();
            const exportedDoc = parser.parseFromString(htmlText, 'text/html');

            // Jika Google mengembalikan halaman login / error, jangan ditampilkan sebagai dokumen.
            const exportedBodyText = (exportedDoc.body?.innerText || '').toLowerCase();
            if (
              !exportedDoc.body ||
              exportedBodyText.includes('sign in') ||
              exportedBodyText.includes('accounts.google.com')
            ) {
              throw new __f4.globals.Error('Google Doc tidak dapat diekspor sebagai HTML publik.');
            }

            // Tambahkan viewport di dokumen iframe agar pinch-zoom HP tetap diizinkan.
            let viewport = exportedDoc.querySelector('meta[name="viewport"]');
            if (!viewport) {
              viewport = exportedDoc.createElement('meta');
              viewport.setAttribute('name', 'viewport');
              exportedDoc.head.prepend(viewport);
            }
            viewport.setAttribute(
              'content',
              'width=device-width, initial-scale=1, minimum-scale=0.5, maximum-scale=5, user-scalable=yes'
            );

            // CSS ini hanya mengatur wadah agar responsif. Style teks, bold, ukuran huruf,
            // tabel, bullet dan numbering dari Google Docs tetap dipertahankan.
            const responsiveStyle = exportedDoc.createElement('style');
            responsiveStyle.textContent = `
              :root {
                color-scheme: light;
              }
              html {
                background: #ffffff ;
                min-height: 100%;
                touch-action: pan-x pan-y pinch-zoom;
              }
              body {
                box-sizing: border-box ;
                width: min(100%, 850px) ;
                max-width: 850px ;
                min-height: 100vh ;
                margin: 0 auto ;
                padding: clamp(18px, 5vw, 72px) ;
                background: #ffffff ;
                overflow-wrap: anywhere;
                -webkit-user-select: text ;
                user-select: text ;
                touch-action: pan-x pan-y pinch-zoom;
                box-shadow: 0 0 24px rgba(15, 23, 42, 0.10);
              }
              img, svg, canvas {
                max-width: 100% ;
                height: auto ;
              }
              table {
                max-width: 100% ;
              }
              td, th {
                overflow-wrap: anywhere;
              }

              /* Desktop: beri ruang baca yang lebih nyaman tanpa mengubah layout dokumen. */
              @media (min-width: 641px) {
                body {
                  font-size: 15px ;
                  line-height: 1.55 ;
                }
                body p {
                  line-height: 1.58 ;
                  margin-top: 0 ;
                  margin-bottom: 0.72em ;
                }
                body li {
                  line-height: 1.52 ;
                  margin-bottom: 0.28em ;
                }
                body ul, body ol {
                  margin-top: 0.38em ;
                  margin-bottom: 0.82em ;
                }
                body h1, body h2, body h3, body h4, body h5, body h6 {
                  line-height: 1.32 ;
                  margin-top: 0.85em ;
                  margin-bottom: 0.45em ;
                }
              }

              @media (max-width: 640px) {
                html {
                  background: #ffffff ;
                  overflow-x: hidden ;
                }
                body {
                  width: 100% ;
                  max-width: none ;
                  padding: 20px 18px 36px ;
                  box-shadow: none ;
                  overflow-x: hidden ;
                  font-size: 16px ;
                  line-height: 1.6 ;
                }

                /* Rapikan elemen Google Docs agar terasa seperti artikel di HP. */
                body, body * {
                  box-sizing: border-box ;
                }
                body p {
                  max-width: 100% ;
                  line-height: 1.62 ;
                  margin-top: 0 ;
                  margin-bottom: 0.85em ;
                }
                body li {
                  line-height: 1.58 ;
                  margin-bottom: 0.35em ;
                }
                body ul, body ol {
                  max-width: 100% ;
                  padding-left: 1.45rem ;
                  margin-top: 0.35em ;
                  margin-bottom: 0.9em ;
                }
                body div,
                body section,
                body article,
                body figure {
                  max-width: 100% ;
                }

                /* Gambar selalu mengikuti lebar area baca dan tidak merusak margin. */
                img, svg, canvas {
                  display: block ;
                  max-width: 100% ;
                  width: 100% ;
                  height: auto ;
                  object-fit: contain ;
                  margin-left: auto ;
                  margin-right: auto ;
                }
                figure, p > span:has(img), div:has(> img), span:has(> img) {
                  width: 100% ;
                  max-width: 100% ;
                  height: auto ;
                  overflow: visible ;
                  transform: none ;
                }

                /* Tables must remain readable at the screen width. Google
                   Docs exports fixed column widths: do not force max-content
                   or crop the first column inside a horizontally scrolled table. */
                table[data-f4-responsive-table] {
                  display: table;
                  width: 100%;
                  max-width: 100%;
                  min-width: 0;
                  table-layout: fixed;
                  border-collapse: collapse;
                  margin: 0;
                }
                table[data-f4-responsive-table] tr { width: 100%; }
                table[data-f4-responsive-table] td,
                table[data-f4-responsive-table] th {
                  border: 1px solid #333;
                }
                td, th {
                  min-width: 0;
                  max-width: 100%;
                  padding: 6px;
                  word-break: normal;
                  overflow-wrap: anywhere;
                  white-space: normal;
                  vertical-align: top;
                  line-height: 1.45;
                }
                td p, th p, td span, th span {
                  white-space: normal;
                  overflow-wrap: anywhere;
                }
              }
            `;
            exportedDoc.head.appendChild(responsiveStyle);

            // Rapikan gambar hasil export Google Docs. Google sering membungkus gambar
            // dengan span/div berukuran tetap sehingga di HP tetap melebar meskipun
            // tag <img> sudah max-width:100%. Lepaskan ukuran tetap pada gambar dan
            // wrapper terdekat agar benar-benar mengikuti lebar layar.
            exportedDoc.querySelectorAll('img').forEach((img) => {
              img.removeAttribute('width');
              img.removeAttribute('height');
              img.style.setProperty('max-width', '100%', 'important');
              img.style.setProperty('width', '100%', 'important');
              img.style.setProperty('height', 'auto', 'important');
              img.style.setProperty('object-fit', 'contain', 'important');
              img.style.setProperty('display', 'block', 'important');
              img.style.setProperty('margin-left', 'auto', 'important');
              img.style.setProperty('margin-right', 'auto', 'important');

              let parent = img.parentElement;
              let depth = 0;
              while (parent && parent !== exportedDoc.body && depth < 4) {
                const inline = parent.getAttribute('style') || '';
                // Wrapper gambar Google Docs biasanya memiliki width/height/overflow tetap.
                if (/width\s*:|height\s*:|overflow\s*:|transform\s*:/i.test(inline) ||
                    ['SPAN', 'DIV', 'P'].includes(parent.tagName)) {
                  parent.style.setProperty('max-width', '100%', 'important');
                  parent.style.setProperty('width', '100%', 'important');
                  parent.style.setProperty('height', 'auto', 'important');
                  parent.style.setProperty('overflow', 'visible', 'important');
                  parent.style.setProperty('transform', 'none', 'important');
                  if (parent.tagName === 'SPAN') {
                    parent.style.setProperty('display', 'block', 'important');
                  }
                }
                parent = parent.parentElement;
                depth++;
              }
            });

            // The exported document's body class carries its original A4/page
            // margins and width. On a phone it places the document outside
            // the iframe viewport, regardless of the responsive rules above.
            // Keep formatting of paragraphs and headings, but remove page geometry.
            exportedDoc.body.removeAttribute('class');
            exportedDoc.body.removeAttribute('style');
            exportedDoc.documentElement.removeAttribute('style');

            // Rebuild only table geometry, retaining real text, formatting,
            // links and row order. Google Docs class widths are otherwise
            // wider than the phone screen and can hide the second column.
            exportedDoc.querySelectorAll('table').forEach(original => {
              const table=exportedDoc.createElement('table');
              table.setAttribute('data-f4-responsive-table','');
              const rows=__f4.globals.Array.from(original.rows||[]);
              for(const sourceRow of rows){
                const tr=exportedDoc.createElement('tr');
                for(const sourceCell of __f4.globals.Array.from(sourceRow.cells||[])){
                  const cell=exportedDoc.createElement(sourceCell.tagName.toLowerCase());
                  if(sourceCell.colSpan>1)cell.colSpan=sourceCell.colSpan;
                  if(sourceCell.rowSpan>1)cell.rowSpan=sourceCell.rowSpan;
                  // Retain the document's bold/color spans without its fixed
                  // cell-width classes or oversized inline padding.
                  while(sourceCell.firstChild)cell.appendChild(sourceCell.firstChild);
                  tr.appendChild(cell);
                }
                table.appendChild(tr);
              }
              original.replaceWith(table);
            });

            const serializedHtml = '<!DOCTYPE html>\n' + exportedDoc.documentElement.outerHTML;
            const body = __f4.globals.document.getElementById('modal-rapat-body');

            // Iframe srcdoc mengisolasi CSS Google Docs dari CSS website.
            // Dengan begitu style asli Google Docs tidak saling timpa dengan Tailwind.
            const iframe = __f4.globals.document.createElement('iframe');
            iframe.setAttribute('title', rapatItem.judul || 'Dokumen hasil rapat');
            iframe.setAttribute('class', 'w-full h-full border-0 block bg-white');
            iframe.setAttribute('allow', 'fullscreen');
            iframe.srcdoc = serializedHtml;

            body.innerHTML = '';
            body.scrollLeft=0;
            body.scrollTop=0;
            iframe.addEventListener('load',()=>{
              try {
                iframe.contentWindow.scrollTo(0,0);
                iframe.contentDocument?.documentElement?.scrollTo(0,0);
              } catch {}
            },{once:true});
            body.appendChild(iframe);
          })
          .catch(err => {
            __f4.globals.console.error('Gagal memuat Google Doc sebagai HTML:', err);
            __f4.globals.document.getElementById('modal-rapat-body').innerHTML = `
              <div class="m-4 max-w-xl p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-2">
                <p class="font-bold">Dokumen gagal dibuka.</p>
                <p>Periksa izin akses dokumen.</p>
                
              </div>
            `;
          });
      } 
      // JIKA LINK PDF GOOGLE DRIVE
      else if (driveFileId) {
        const embedPdfUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
       __f4.globals.document.getElementById('modal-rapat-body').innerHTML = `
  <div class="f4-rapat-drive-container">
    <iframe src="${embedPdfUrl}" title="Pratinjau PDF hasil rapat" class="w-full h-full border-0 block mx-auto my-0" allow="autoplay"></iframe>
  </div>
`;
      } 
      else {
        __f4.globals.document.getElementById('modal-rapat-body').innerHTML = `
          <div class="p-6 text-center space-y-3">
            <p class="text-rose-500 text-xs font-semibold">Dokumen tidak bisa dibuka.</p>
            <p class="text-xs text-slate-500">Hubungi pengelola rapat.</p>
          </div>
        `;
      }
    }

    function closeModalDocRapat(isPopState = false) {
      const modal = __f4.globals.document.getElementById('modal-doc-rapat');
      if (!modal || modal.classList.contains('hidden')) return;

      modal.classList.add('hidden');
      __f4.globals.document.body.style.overflow = 'auto';
      isModalOpenStack = false;

      __f4.globals.document.getElementById('modal-rapat-body').innerHTML = '';

      if (!isPopState) {
        const address=new __f4.globals.URL(__f4.globals.location.href);
        address.searchParams.delete('doc');address.hash='';
        __f4.globals.history.pushState(null,'',address.pathname+address.search);
      }
    }

    __f4.window.addEventListener('popstate', function () {
      if (isModalOpenStack) {
        closeModalDocRapat(true);
      } else {
        const doc=new __f4.globals.URLSearchParams(__f4.globals.location.search).get('doc')||__f4.window.location.hash.slice(1);
        if(doc)openModalDocRapat(doc,true);
      }
    });

    function copyCurrentRapatLink() {
      let shareUrl=__f4.window.location.origin+'/rapat/?doc='+(0,__f4.globals.encodeURIComponent)(currentActiveRapatId);
      const share=async()=>{
        const item=globalRapatData.find(x=>x.id===currentActiveRapatId);
        if(item?.recordId){try{
          const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(item.recordId)));
          shareUrl='https://api.flamboyan4.web.id/s/r'+Array.from(bytes.slice(0,8),n=>n.toString(16).padStart(2,'0')).join('');
        }catch{}}
        if(__f4.globals.navigator.share){try{await __f4.globals.navigator.share({title:'Hasil Rapat Flamboyan 4',url:shareUrl});return}catch(e){if(e.name==='AbortError')return}}
        await __f4.globals.navigator.clipboard.writeText(shareUrl);
        const button=__f4.globals.document.querySelector('[onclick="copyCurrentRapatLink()"]');
        if(button){button.title='Tautan tersalin';(0,__f4.globals.setTimeout)(()=>button.title='Bagikan',2000)}
      };
      share().catch(()=>(0,__f4.globals.alert)('Gagal membagikan tautan.'));
    }

    function rapatFileDetails(docUrl) {
      const source = (0,__f4.globals.String)(docUrl || '').replace(/[\[\]'"]/g, '').trim();
      let link;
      try { link = new __f4.globals.URL(source); } catch { return { type: 'FILE', downloadUrl: '' }; }
      if (link.protocol !== 'https:' && link.protocol !== 'http:') return { type: 'FILE', downloadUrl: '' };
      const host = link.hostname.toLowerCase();
      const path = link.pathname.toLowerCase();
      const googleId = extractDriveFileId(source);
      if (host === 'docs.google.com' && path.startsWith('/document/d/') && googleId) {
        return { type: 'DOC', downloadUrl: 'https://docs.google.com/document/d/' + (0,__f4.globals.encodeURIComponent)(googleId) + '/export?format=pdf' };
      }
      if (host === 'drive.google.com' && googleId) {
        return { type: 'FILE', downloadUrl: 'https://drive.google.com/uc?export=download&id=' + (0,__f4.globals.encodeURIComponent)(googleId) };
      }
      if (path.endsWith('.pdf')) return { type: 'PDF', downloadUrl: link.href };
      if (path.endsWith('.doc') || path.endsWith('.docx')) return { type: 'DOC', downloadUrl: link.href };
      return { type: 'FILE', downloadUrl: link.href };
    }

    function renderRapatCards() {
      const container = __f4.globals.document.getElementById('container-grid-rapat');
      container.classList.add('f4-rapat-file-grid');
      if (globalRapatData.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400 text-xs">Belum ada hasil rapat.</div>';
        return;
      }
      container.replaceChildren();
      globalRapatData.forEach(item => {
        const detail = rapatFileDetails(item.docUrl);
        const hasFile = (0,__f4.globals.Boolean)(item.docUrl && detail.downloadUrl);
        const card = __f4.globals.document.createElement('article');
        card.className = 'f4-rapat-file-card';

        const iconPanel = __f4.globals.document.createElement('div');
        iconPanel.className = 'f4-rapat-file-icon';
        const fileIcon = __f4.globals.document.createElement('i');
        fileIcon.setAttribute('data-lucide', 'file-text');
        fileIcon.setAttribute('aria-hidden', 'true');
        const fileType = __f4.globals.document.createElement('span');
        fileType.className = 'f4-rapat-file-type';
        fileType.textContent = detail.type;
        iconPanel.append(fileIcon, fileType);

        const content = __f4.globals.document.createElement('div');
        content.className = 'f4-rapat-file-main';
        const title = __f4.globals.document.createElement('button');
        title.type = 'button';
        title.className = 'f4-rapat-file-title';
        title.textContent = item.judul || 'Hasil rapat warga';
        title.title = title.textContent;
        title.setAttribute('aria-label', 'Lihat hasil rapat: ' + title.textContent);
        title.disabled = !hasFile;
        title.addEventListener('click', () => openModalDocRapat(item.id));

        const meta = __f4.globals.document.createElement('div');
        meta.className = 'f4-rapat-file-meta';
        const category = __f4.globals.document.createElement('span');
        category.textContent = 'Hasil rapat';
        const date = __f4.globals.document.createElement('span');
        date.textContent = item.tanggal || '-';
        meta.append(category, date);
        content.append(title, meta);

        if (item.deskripsi && (0,__f4.globals.String)(item.deskripsi).trim()) {
          const description = __f4.globals.document.createElement('p');
          description.className = 'f4-rapat-file-desc';
          description.textContent = (0,__f4.globals.String)(item.deskripsi).trim();
          content.append(description);
        }
        if (hasFile) {
          const actions = __f4.globals.document.createElement('div');
          actions.className = 'f4-rapat-file-actions';
          const viewButton = __f4.globals.document.createElement('button');
          viewButton.type = 'button';
          viewButton.className = 'f4-rapat-file-view';
          viewButton.textContent = 'Lihat';
          viewButton.setAttribute('aria-label', 'Lihat ' + (item.judul || 'hasil rapat'));
          viewButton.addEventListener('click', () => openModalDocRapat(item.id));
          const download = __f4.globals.document.createElement('a');
          download.className = 'f4-rapat-file-download';
          download.href = detail.downloadUrl;
          download.target = '_blank';
          download.rel = 'noopener noreferrer';
          download.textContent = 'Unduh';
          download.setAttribute('aria-label', 'Unduh ' + (item.judul || 'hasil rapat'));
          actions.append(viewButton, download);
          content.append(actions);
        } else {
          const missing = __f4.globals.document.createElement('span');
          missing.className = 'f4-rapat-file-empty';
          missing.textContent = 'Berkas belum tersedia';
          content.append(missing);
        }
        card.append(iconPanel, content);
        container.append(card);
      });
      if (__f4.window.lucide && typeof __f4.globals.lucide.createIcons === 'function') __f4.globals.lucide.createIcons();

      const params=new __f4.globals.URLSearchParams(__f4.globals.location.search);
      const targetId = params.get('record') || params.get('doc') || __f4.window.location.hash.slice(1);
      if (targetId) openModalDocRapat(targetId, true);
    }

    const rapatToken=__f4.globals.F4Loading.begin('rapat-status-badge','Memuat daftar rapat…');
    if (CSV_RAPAT_URL && CSV_RAPAT_URL.startsWith('http')) {
      __f4.globals.Papa.parse(CSV_RAPAT_URL, {
        download: true,
        header: true,
        complete: function(results) {
          const rawData = results.data.filter(row => {
            const values = __f4.globals.Object.values(row);
            return values.length >= 2 && values[0] && values[0].toString().trim() !== '';
          });

          // PEMBARUAN URUTAN: DIBALIK AGAR KEGIATAN TERBARU MUNCUL PALING ATAS
          const sortedData = [...rawData].reverse();

          globalRapatData = sortedData.map((row, index) => {
            const keys = __f4.globals.Object.keys(row);
            return {
              id: 'rapat-' + (sortedData.length - index),
              tanggal: row[keys[0]] || '-',
              judul: row[keys[1]] || 'Hasil Rapat Warga',
              deskripsi: row[keys[2]] || '',
              fotoPreview: row[keys[3]] || '',
              docUrl: row[keys[4]] || '',
              recordId: row['Record ID'] || ''
            };
          });

          renderRapatCards();
          __f4.globals.F4Loading.success('rapat-status-badge',rapatToken);
        },
        error:function(error){
          __f4.globals.F4Loading.error('rapat-status-badge','Daftar rapat belum dapat dimuat: '+(error.message||error),rapatToken);
          const area=__f4.globals.document.getElementById('container-grid-rapat');area.replaceChildren();
          const button=__f4.globals.document.createElement('button');button.type='button';button.textContent='Coba Lagi';button.onclick=()=>__f4.globals.location.reload();
          area.append(button);
        }
      });
    }else __f4.globals.F4Loading.empty('rapat-status-badge','Sumber rapat belum tersedia.',rapatToken);
  
});
