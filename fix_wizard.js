const fs = require('fs');

let code = fs.readFileSync('js/features/booking/wizard.js', 'utf8');

// Replace standard getSalonPrice with passing bd.masterId if available.
code = code.replace(/getSalonPrice\(([^,]+),\s*([^,]+),\s*services\)/g, "getSalonPrice($1, $2, services, state.bookingData.masterId)");

fs.writeFileSync('js/features/booking/wizard.js', code);
