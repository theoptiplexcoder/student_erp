const fs = require('fs');
const file = 'apps/web/src/app/error.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  'useEffect(() => {',
  'console.log("ERROR RECEIVED IN BOUNDARY:", error.message || error);\n  useEffect(() => {',
);
fs.writeFileSync(file, code);
