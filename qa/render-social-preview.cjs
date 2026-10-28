/* Build a branded 1200x630 social preview from the repository's actual SVG logo.
   This script never touches private resident, finance, or API data. */
'use strict';
const sharp=require('sharp');
const fs=require('node:fs');
const path=require('node:path');

async function main(){
  const logoPath=path.join(__dirname,'../assets/logo-flamboyan.svg');
  if(!fs.existsSync(logoPath))throw Error('Official Flamboyan logo is missing');
  const officialLogo=await sharp(logoPath).resize(208,208,{fit:'contain'}).png().toBuffer();
  const source=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#f7f4ff"/><stop offset="100%" stop-color="#e8f7f0"/>
      </linearGradient>
      <linearGradient id="line" x1="0" x2="1">
        <stop offset="0%" stop-color="#6955d7"/><stop offset="100%" stop-color="#25a973"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="1160" cy="35" r="200" fill="#ded6ff" opacity=".6"/>
    <circle cx="38" cy="625" r="220" fill="#d5f4e5" opacity=".75"/>
    <rect x="48" y="52" width="1104" height="526" rx="38" fill="#ffffff" stroke="#dedcf0" stroke-width="2"/>
    <rect x="48" y="52" width="15" height="526" rx="8" fill="url(#line)"/>
    <circle cx="218" cy="254" r="116" fill="#f2f0ff"/>
    <text x="362" y="218" fill="#262544" font-family="Arial,DejaVu Sans,sans-serif" font-size="76" font-weight="700">Flamboyan 4</text>
    <text x="367" y="279" fill="#6250c4" font-family="Arial,DejaVu Sans,sans-serif" font-size="34" font-weight="700" letter-spacing="4">PORTAL WARGA</text>
    <rect x="364" y="321" width="680" height="5" rx="3" fill="url(#line)"/>
    <text x="365" y="381" fill="#4f526a" font-family="Arial,DejaVu Sans,sans-serif" font-size="26">Informasi lingkungan · Pembukuan · Bank Sampah</text>
    <rect x="365" y="423" width="312" height="58" rx="29" fill="#f0edff"/>
    <text x="399" y="461" fill="#5b4bbe" font-family="Arial,DejaVu Sans,sans-serif" font-size="24" font-weight="700">flamboyan4.web.id</text>
    <text x="84" y="536" fill="#8a89a6" font-family="Arial,DejaVu Sans,sans-serif" font-size="19">Portal resmi warga Lorong Flamboyan 4</text>
  </svg>`);
  const dest=path.join(__dirname,'../assets/og-flamboyan4.png');
  await sharp(source).composite([{input:officialLogo,left:114,top:150}]).png({compressionLevel:9}).toFile(dest);
  const meta=await sharp(dest).metadata();
  if(meta.width!==1200||meta.height!==630||meta.format!=='png')throw Error('Unexpected OG dimensions');
  console.log('OG_IMAGE_BUILT',meta.width,meta.height,fs.statSync(dest).size);
}
main().catch(e=>{console.error(e);process.exit(1)});
