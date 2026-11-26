/* Pembukuan operation forms: original adapters, isolated write simulation.
   Read endpoints may use the authenticated server. Mutation endpoints never do. */
import {createTransactionService} from './transactions.js';
const writePaths={
 inputtransaksikas:'/api/bookkeeping/cash',buatdenda:'/api/bookkeeping/denda',bayardenda:'/api/bookkeeping/denda/bayar',
 buatpinjaman:'/api/bookkeeping/pinjaman',bayarpinjaman:'/api/bookkeeping/pinjaman/bayar',buattalangan:'/api/bookkeeping/talangan',
 simpaniuran:'/api/bookkeeping/iuran'
};
const readPaths=new Set(['/api/bookkeeping/denda','/api/bookkeeping/pinjaman/detail','/api/bookkeeping/talangan','/api/bookkeeping/iuran/outstanding','/api/bookkeeping/iuran/fines']);
export async function simulateBookOperation({action,params,accountKey,role,get,signal,crypto=globalThis.crypto}){
 if(role!=='superadmin'||!accountKey||!Object.hasOwn(writePaths,action))throw Error('Akses operasi ditolak.');
 const writes=[];
 const service=createTransactionService({role,accountKey,crypto,allowWrites:true,transport:async(path,body)=>{
  if(signal?.aborted)throw Error('Halaman telah ditutup.');
  if(body===undefined){if(!readPaths.has(path.split('?')[0]))throw Error('Jalur baca tidak terdaftar.');return get(path,signal,true)}
  if(path!==writePaths[action]||writes.length||!body.requestKey)throw Error('Kontrak transaksi tidak cocok.');
  writes.push({path,body:JSON.parse(JSON.stringify(body))});
  return {ok:true,status:'success',id:'SIMULASI',idPembayaran:'SIMULASI',kasId:'SIMULASI',jumlahRp:body.jumlahRp,totalDiterima:body.jumlahRp};
 }});
 const result=await service.book(action,params);
 if(writes.length!==1)throw Error('Transaksi uji tidak lengkap.');
 return {result,write:writes[0]};
}
const methods=[['Cash','Cash'],['QRIS','QRIS'],['Transfer Mandiri','Transfer Mandiri']];
const rupiah=v=>Number.isSafeInteger(Number(v))?'Rp '+Number(v).toLocaleString('id-ID'):'—';
const monthNames=Array.from({length:12},(_,i)=>[i+1,new Intl.DateTimeFormat('id-ID',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,i,1)))]);
export function attachBookOperations(root,{key,role,accountKey,get,read,signal,el,panel,row,today,records=[]}){
 let busy=false,revision=0;const dirty=new Set();
 const name=x=>[x.nama||'Nama belum tersedia',[x.blok,x.noRumah].filter(Boolean).join('/')].filter(Boolean).join(' · ');
 function make(title,action,fields){
  const p=panel(root,title),form=el('form',null,'bank-draft'),status=el('p'),submit=el('button','Periksa transaksi'),controls={};
  submit.type='submit';status.setAttribute('role','status');
  for(const f of fields){
   const label=el('label',f.label),n=el(f.choices?'select':'input');n.setAttribute('aria-label',f.label);n.required=f.required!==false;
   if(f.choices){for(const [v,t] of f.choices){const o=el('option',t);o.value=String(v);n.append(o)}}
   else{n.type=f.type||'text';if(f.type==='number'){n.min=String(f.min??1);n.step='1';n.inputMode='numeric'}else if(f.type!=='date')n.maxLength=f.maxLength||350;}
   if(f.value!==undefined)n.value=String(f.value);
   controls[f.key]=n;label.append(n);form.append(label);
  }
  form.addEventListener('input',()=>{dirty.add(form);revision++;status.textContent=''});
  form.addEventListener('submit',async e=>{
   e.preventDefault();if(busy)return;busy=true;submit.disabled=true;const token=revision;
   try{
    const params=Object.fromEntries(Object.entries(controls).map(([k,n])=>[k,n.type==='number'?Number(n.value):n.value]));
    const {write}=await simulateBookOperation({action,params,role,accountKey,get,signal});
    if(!signal.aborted&&token===revision){status.textContent='Validasi berhasil: '+rupiah(write.body.jumlahRp)+'. Tidak ada transaksi disimpan.';dirty.delete(form)}
   }catch(error){if(!signal.aborted&&token===revision)status.textContent=error.message}
   finally{busy=false;submit.disabled=false}
  });
  form.append(submit,status);p.append(form);
 }
 const date=(key='tanggal',label='Tanggal')=>({key,label,type:'date',value:today()});
 const amount={key:'nominal',label:'Nominal (Rp)',type:'number'};
 const method={key:'metode',label:'Metode',choices:methods};
 const note={key:'keterangan',label:'Keterangan',required:false};
 const picker=(key,label,choices)=>({key,label,choices:[['','Pilih '+label.toLowerCase()],...choices]});
 const memberChoices=async()=>{const d=await read('bootstrap');return d.warga.filter(x=>x.statusAktif==='Ya'&&x.idWarga).map(x=>[x.idWarga,name(x)])};
 async function mount(){
  if(key==='book-cash'){
   make('Uji pencatatan kas','inputtransaksikas',[date(),{key:'jenis',label:'Jenis transaksi',choices:[['pemasukan','Pemasukan'],['pengeluaran','Pengeluaran']]},{key:'kategori',label:'Kategori',maxLength:120},{...note,required:true,maxLength:500},amount,method]);
  }else if(key==='book-fines'){
   const members=await memberChoices();
   make('Uji catat denda','buatdenda',[picker('idWarga','Nama warga',members),date('tanggalKegiatan','Tanggal kegiatan'),{key:'namaKegiatan',label:'Kegiatan',choices:[['Gorol','Gorol']]},amount,note]);
   const unpaid=records.filter(x=>x.idDenda&&['BELUM','AKTIF','SEBAGIAN'].includes(x.status));
   if(unpaid.length&&records.length<200)make('Uji pembayaran denda','bayardenda',[picker('idDenda','Denda',unpaid.map(x=>[x.idDenda,name(x)+' · '+x.tanggalKegiatan])),date('tanggalBayar','Tanggal pembayaran'),method]);
  }else if(key==='book-loans'){
   const members=await memberChoices();
   make('Uji pencatatan pinjaman','buatpinjaman',[picker('idWarga','Nama warga',members),date(),amount,method,note]);
   const active=records.filter(x=>x.idPinjaman&&x.status==='AKTIF'&&x.sisaPinjaman>0);
   if(active.length)make('Uji angsuran pinjaman','bayarpinjaman',[picker('idPinjaman','Pinjaman',active.map(x=>[x.idPinjaman,name(x)+' · Sisa '+rupiah(x.sisaPinjaman)])),date('tanggal','Tanggal angsuran'),amount,method,note]);
  }else if(key==='book-advances'){
   const members=await memberChoices();
   make('Uji pencatatan talangan','buattalangan',[picker('idWarga','Nama warga',members),date(),{key:'tahun',label:'Tahun iuran',type:'number',min:2020,value:today().slice(0,4)},{key:'bulan',label:'Bulan iuran',choices:monthNames,value:Number(today().slice(5,7))},note]);
  }
  return ()=>!busy&&(!dirty.size||window.confirm('Draf uji belum diperiksa. Tinggalkan halaman?'));
 }
 return mount();
}
