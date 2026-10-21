import {apiURL} from './config.js';
export class APIError extends Error {constructor(message,status){super(message);this.status=status}}
/** Semua pemanggilan API di satu tempat. Cookie sesi HttpOnly, tidak disimpan di JS. */
export async function api(path,{method='GET',json,body,headers={}}={}){
  const options={method,credentials:'include',mode:'cors',cache:'no-store',headers:{...headers}};
  if(json!==undefined){options.headers['content-type']='application/json';options.body=JSON.stringify(json)}
  if(body!==undefined)options.body=body;
  let response;
  try {response=await fetch(apiURL(path),options)}
  catch{throw new APIError('API tidak dapat dijangkau dari domain ini. Periksa Custom Domain API dan CORS.',0)}
  let payload;
  try {payload=await response.json()}catch{throw new APIError('Respons API bukan JSON.',response.status)}
  if(!response.ok||payload.ok===false)throw new APIError(payload.error||`Permintaan ditolak (${response.status}).`,response.status);
  return payload;
}
export const endpoints=Object.freeze({
  portal:()=>api('/api/v2/public/portal'),
  bank:()=>api('/api/v2/public/bank'),
  bankReport:(month='')=>api('/api/v2/public/bank/report'+(month?'?month='+encodeURIComponent(month):'')),
  bankAlbum:(id)=>api('/api/v2/public/bank/album/'+encodeURIComponent(id)),
  bankAdmin:(key)=>api('/api/v2/admin/bank/'+encodeURIComponent(key)),
  bookkeepingOverview:(month='')=>api('/api/v2/bookkeeping/overview'+(month?'?month='+encodeURIComponent(month):'')),
  bookkeepingCash:()=>api('/api/bookkeeping/cash'),
  session:()=>api('/api/v2/auth/session'),
  login:(username,password)=>api('/api/auth/login',{method:'POST',json:{username,password}}),
  logout:()=>api('/api/auth/logout',{method:'POST'}),
  profile:()=>api('/api/member/profile'),
  saveProfile:(nama)=>api('/api/member/profile',{method:'POST',json:{nama}}),
  savings:()=>api('/api/member/savings'),
  payments:()=>api('/api/member/payments'),
  avatar:(file)=>api('/api/member/avatar',{method:'POST',body:file,headers:{'content-type':file.type}}),
  memberMe:()=>api('/api/member/me')
});
