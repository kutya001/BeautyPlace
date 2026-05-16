const fs = require('fs');

let utils = fs.readFileSync('js/utils.js', 'utf8');
const newFn = `export function getServicePrice(salonId, masterId, serviceId, servicesList) {
    if (masterId) {
        const m = (window.masters || window.state?.masters || require('./state.js').masters || []).find(x => x.id === masterId);
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
utils = utils.replace('export function getSalonPrice', newFn + '\\nexport function getSalonPrice');
fs.writeFileSync('js/utils.js', utils);
