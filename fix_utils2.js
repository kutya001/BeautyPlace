const fs = require('fs');

let code = fs.readFileSync('js/utils.js', 'utf8');

const newGetSalonPrice = `
export function getSalonPrice(salonId, serviceId, servicesList, overrideMasterId) {
    if (overrideMasterId) {
        const m = (window.masters || window.state?.masters || require('./state.js').masters || []).find(x => x.id === overrideMasterId);
        if (m && m.tariff_type === 'rent' && m.customPrices && m.customPrices[serviceId] !== undefined) {
            return m.customPrices[serviceId];
        }
    }
    const sp = (window.salonPrices || require('./state.js').salonPrices || []).find(p => p.salonId === salonId && p.serviceId === serviceId);
    if (sp && sp.price !== undefined) return sp.price;
    const svc = (servicesList || require('./state.js').services || []).find(s => s.id === serviceId);
    return svc ? svc.price : 0;
}
`;

code = code.replace(/export function getSalonPrice\([^)]*\)[^{]*\{[\s\S]*?return svc \? svc\.price : 0;\n\}/g, newGetSalonPrice);

fs.writeFileSync('js/utils.js', code);
