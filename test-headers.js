const http = require('http');

http.get('http://localhost:3000/admin', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers);
});
