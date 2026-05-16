const fs = require('fs');

let code = fs.readFileSync('js/apps/client/pages.js', 'utf8');
// In Master Detail (line ~343)
// formatPrice(salon ? getSalonPrice(salon.id, svc.id, services) : svc.price)
code = code.replace(/getSalonPrice\(salon\.id,\s*svc\.id,\s*services\)/g, "getSalonPrice(salon.id, svc.id, services, typeof master !== 'undefined' ? master.id : undefined)");

// In Booking details (line ~481)
// formatPrice(getSalonPrice(b.targetId, svc.id, services))
code = code.replace(/getSalonPrice\(b\.targetId,\s*svc\.id,\s*services\)/g, "getSalonPrice(b.targetId, svc.id, services, b.masterId)");

fs.writeFileSync('js/apps/client/pages.js', code);

// Now for dashboard
let dash = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');
dash = dash.replace(/getSalonPrice\(salon\.id,\s*b\.serviceId,\s*services\)/g, "getSalonPrice(salon.id, b.serviceId, services, b.masterId)");

// Also for layout
let layout = fs.readFileSync('js/apps/salon/layout.js', 'utf8');
layout = layout.replace(/getSalonPrice\(salon\.id,\s*b\.serviceId,\s*services\)/g, "getSalonPrice(salon.id, b.serviceId, services, b.masterId)");

fs.writeFileSync('js/apps/salon/dashboard.js', dash);
fs.writeFileSync('js/apps/salon/layout.js', layout);

console.log("Replaced references");
