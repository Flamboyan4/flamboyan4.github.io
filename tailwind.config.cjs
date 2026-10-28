/* Non-production static-build preview. Do not remove the CDN until visual parity passes. */
module.exports = {
  content: [
    './index.html',
    './cctv.html',
    './*.html',
    './portal-live/**/*.html',
    './portal-live/**/*.js'
  ],
  theme: { extend: {} },
  plugins: [],
};
