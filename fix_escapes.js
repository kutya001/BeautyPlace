const fs = require('fs');

let dash = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');
dash = dash.replace(/\\\'/g, "'").replace(/\\\\n/g, '\\n');
fs.writeFileSync('js/apps/salon/dashboard.js', dash);

let utils = fs.readFileSync('js/utils.js', 'utf8');
utils = utils.replace(/\\n/g, '\n').replace(/\\\'/g, "'");
fs.writeFileSync('js/utils.js', utils);

console.log('Fixed escaping');
