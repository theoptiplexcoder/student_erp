const fs = require('fs');
const http = require('http');

const urls = [
  '/',
  '/admin',
  '/admin/admissions',
  '/student',
  '/student/profile',
  '/student/grievance',
  '/faculty/dashboard',
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    http
      .get(`http://localhost:3000${url}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (data.includes('Minified React error #441') || data.includes('digest')) {
            console.log(`ERROR 441 ON URL: ${url}`);
          } else if (res.statusCode >= 500) {
            console.log(`HTTP ${res.statusCode} ON URL: ${url}`);
          } else {
            console.log(`OK: ${url} (HTTP ${res.statusCode})`);
          }
          resolve();
        });
      })
      .on('error', (err) => {
        console.log(`FAILED TO CONNECT: ${err.message}`);
        resolve();
      });
  });
}

(async () => {
  for (const url of urls) {
    await checkUrl(url);
  }
})();
