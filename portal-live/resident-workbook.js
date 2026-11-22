import './vendor/jszip.min.js';

const sheetNS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const officeRel = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const pkgRel = 'http://schemas.openxmlformats.org/package/2006/relationships';
const xml = value => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g,'')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function worksheet(rows, widths, moneyColumns) {
  const cols = widths.map((width,i) => '<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+width+'" customWidth="1"/>').join('');
  const data = rows.map((row,r) => '<row r="'+(r+1)+'">' + row.map((value,c) => {
    const ref = String.fromCharCode(65+c) + (r+1);
    if (typeof value === 'number') return '<c r="'+ref+'" s="'+(moneyColumns.includes(c)?2:0)+'"><v>'+value+'</v></c>';
    return '<c r="'+ref+'" s="'+(r===0?1:0)+'" t="inlineStr"><is><t xml:space="preserve">'+xml(value)+'</t></is></c>';
  }).join('') + '</row>').join('');
  return '<worksheet xmlns="'+sheetNS+'"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" state="frozen"/></sheetView></sheetViews><cols>'+cols+'</cols><sheetData>'+data+'</sheetData></worksheet>';
}
const styles = '<styleSheet xmlns="'+sheetNS+'"><numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;Rp &quot;#,##0"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF5936AA"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
export async function workbook({profile, payments, allocations}, categories) {
  const profileRows = [
    ['Data pribadi','Keterangan'],['Nama',profile.nama],['Nomor rumah',profile.rumah],['Nomor HP',profile.nomor_hp],
    ['Status tinggal',profile.status_tinggal],['Status warga',profile.active?'Aktif':'Nonaktif'],
    ...Object.entries({tanggal_lahir:'Tanggal lahir',status_perkawinan:'Status perkawinan',agama:'Agama',kategori_sosial:'Kategori sosial'})
      .filter(([key])=>Object.hasOwn(profile,key)).map(([key,label])=>[label,profile[key]]),
    ['Status anggota Bank Sampah',profile.status_anggota],['Keterangan warga',profile.keterangan],['ID pembayar',profile.id],
    ['Jumlah pembayaran aktif',payments.filter(p=>p.status === 'aktif').length],
    ['Total diterima dari pembayaran aktif (Rp)',payments.reduce((sum,p)=>sum+(p.status==='aktif'?p.amount_rp:0),0)]
  ];
  const receipts = [['ID pembayaran','Tanggal diterima','Metode','Jumlah diterima','Status','Catatan'],
    ...payments.map(p => [p.id,p.paid_on,p.payment_method,p.amount_rp,p.status,p.description])];
  const details = [['ID pembayaran','Tanggal diterima','Bulan iuran','Pos iuran','Nominal alokasi','Status pembayaran','Status alokasi'],
    ...allocations.map(a => [a.payment_id,a.paid_on,a.period_year+'-'+String(a.period_month).padStart(2,'0'),
      categories[a.contribution_type] || a.contribution_type,a.amount_rp,a.payment_status,a.allocation_status])];
  const sheets = [
    ['Profil warga',profileRows,[42,48],[]],
    ['Pembayaran',receipts,[44,20,21,22,18,52],[3]],
    ['Rincian iuran',details,[44,20,18,22,22,22,20],[4]]
  ];
  const zip = new globalThis.JSZip();
  const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.';
  const items = [], relationships = [], types = [];
  for (const [i,[name,rows,widths,moneyColumns]] of sheets.entries()) {
    const id = i+1, target = 'worksheets/sheet'+id+'.xml';
    zip.file('xl/'+target,worksheet(rows,widths,moneyColumns));
    items.push('<sheet name="'+xml(name)+'" sheetId="'+id+'" r:id="rId'+id+'"/>');
    relationships.push('<Relationship Id="rId'+id+'" Type="'+officeRel+'/worksheet" Target="'+target+'"/>');
    types.push('<Override PartName="/xl/'+target+'" ContentType="'+contentType+'worksheet+xml"/>');
  }
  zip.file('_rels/.rels','<Relationships xmlns="'+pkgRel+'"><Relationship Id="rId1" Type="'+officeRel+'/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.file('xl/workbook.xml','<workbook xmlns="'+sheetNS+'" xmlns:r="'+officeRel+'"><sheets>'+items.join('')+'</sheets></workbook>');
  zip.file('xl/styles.xml',styles);
  zip.file('xl/_rels/workbook.xml.rels','<Relationships xmlns="'+pkgRel+'">'+relationships.join('')+'<Relationship Id="rStyles" Type="'+officeRel+'/styles" Target="styles.xml"/></Relationships>');
  zip.file('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="'+contentType+'sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="'+contentType+'styles+xml"/>'+types.join('')+'</Types>');
  return zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:contentType+'sheet'});
}
