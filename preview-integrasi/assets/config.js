// Ubah ke https://api.flamboyan4.web.id setelah Custom Domain Worker siap.
export const API_BASE="https://flamboyan4-terpadu-staging.hjbenalu.workers.dev";
export function sameSiteReady(){const w=location.hostname,a=new URL(API_BASE).hostname;const own=h=>h==="flamboyan4.web.id"||h.endsWith(".flamboyan4.web.id");return location.protocol==="https:"&&own(w)&&own(a)}
