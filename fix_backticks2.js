const fs = require('fs');
let code = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('js/apps/salon/dashboard.js', code);
