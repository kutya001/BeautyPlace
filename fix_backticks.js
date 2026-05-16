import fs from 'fs';
let content = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');

// Replace \` with ' wherever needed
content = content.replace(/\\\`<button/g, "'<button");
content = content.replace(/<\/button>\\\`/g, "</button>'");

// Let's also replace other potential \` inside ${}
content = content.replace(/\\\`<(div|th|td|label|div)/g, "'<$1");
content = content.replace(/<\/(div|th|td|label|div)>\\\`/g, "</$1>'");

fs.writeFileSync('js/apps/salon/dashboard.js', content, 'utf8');
console.log("Success");
