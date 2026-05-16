const fs = require('fs');
let code = fs.readFileSync('js/apps/salon/layout.js', 'utf8');

const newLogic = `    const confirmedRevenue = salonBookings.filter(b => b.status === 'confirmed').reduce((sum, b) => {
        const m = salonMasters.find(master => master.id === b.masterId);
        // Если мастер на аренде, не считаем его услуги в общую валовую выручку салона от услуг
        if (m && m.tariff_type === 'rent') return sum;
        return sum + getSalonPrice(salon.id, b.serviceId, services);
    }, 0);`;

code = code.replace(
    /const confirmedRevenue = salonBookings\.filter\(b => b\.status === 'confirmed'\)\.reduce\(\(sum, b\) => \{\s*return sum \+ getSalonPrice\(salon\.id, b\.serviceId, services\);\s*\}, 0\);/m,
    newLogic
);

fs.writeFileSync('js/apps/salon/layout.js', code);
console.log('done layout update');
