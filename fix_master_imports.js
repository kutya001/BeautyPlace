const fs = require('fs');
let code = fs.readFileSync('js/apps/master/app.js', 'utf8');

code = code.replace(/import { state, masters, salons, services, timeSlots, salonApplications, users } from '\.\.\/\.\.\/state\.js';/, 
"import { state, masters, salons, services, timeSlots, salonApplications, users, categories } from '../../state.js';");

fs.writeFileSync('js/apps/master/app.js', code);
