const fs = require('fs');
const file = 'apps/web/src/middleware.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  'return await updateSession(request);',
  'return require("next/server").NextResponse.next();',
);
fs.writeFileSync(file, code);
