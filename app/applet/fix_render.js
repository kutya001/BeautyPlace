const fs = require('fs');
let code = fs.readFileSync('js/features/auth/render.js', 'utf8');
code = code.replace(/\\`/g, '`');
code = code.replace(/\\x27/g, "'");
fs.writeFileSync('js/features/auth/render.js', code);
