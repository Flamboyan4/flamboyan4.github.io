/** SETELAH membuat Custom Domain Worker api.flamboyan4.web.id, ganti nilai apiBase di bawah.
 * Jangan memasukkan kata sandi, API token, atau rahasia apa pun ke folder GitHub Pages.
 * Login lintas portal dengan cookie SameSite=Lax HANYA didukung apabila website
 * dan API sama-sama memakai *.flamboyan4.web.id melalui HTTPS.
 */
export const CONFIG = Object.freeze({
  apiBase: 'https://flamboyan4-terpadu-staging.hjbenalu.workers.dev',
  siteBase: '/', // custom domain flamboyan4.web.id. Untuk github.io/repo/: '/nama-repo/'
  name: 'Flamboyan 4',
  staging: true,
});
export const apiURL = (path) => CONFIG.apiBase.replace(/\/+$/,'') + path;
export function sameSiteAuthAvailable(){
  try{
    const a=new URL(CONFIG.apiBase),w=location;
    const root=(host)=>host==='flamboyan4.web.id'||host.endsWith('.flamboyan4.web.id');
    return w.protocol==='https:' && a.protocol==='https:' && root(a.hostname)&&root(w.hostname);
  }catch{return false}
}
