const http = require('http');

http.get('http://localhost:3000/student/profile', (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    const rxMatches = data.match(/\$RX\([^)]+\)/g);
    if (rxMatches) {
      console.log('RX ERRORS FOUND:', rxMatches);
    } else {
      console.log('NO RX ERRORS');
    }
  });
});
