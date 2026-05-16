const fs = require('fs');
let dash = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');

dash = dash.replace(/td \+= 'onchange="window\.handleTogglePermission\('' \+ currentStaff\.id \+ '', '' \+ permKey \+ '', this\.checked\)">';/g, 
"td += 'onchange=\"window.handleTogglePermission(\\'' + currentStaff.id + '\\', \\'' + permKey + '\\', this.checked)\">';");

fs.writeFileSync('js/apps/salon/dashboard.js', dash);
