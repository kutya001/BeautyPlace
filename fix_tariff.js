const fs = require('fs');
let code = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');

// The replacement logic:
const newMasterUI = `<div class="mb-6 bg-primary-50 p-5 rounded-2xl border border-primary-100">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-sm font-bold text-system-text">Условия сотрудничества</h3>
                        </div>

                        <div class="flex gap-4 mb-4">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="tariff_type" value="percentage" \${em.tariff_type === 'percentage' || !em.tariff_type ? 'checked' : ''} onchange="updateMasterTariff(\${em.id}, 'percentage')" class="text-primary-500 focus:ring-primary-400">
                                <span class="text-sm font-medium text-system-text">Работа за процент</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="tariff_type" value="rent" \${em.tariff_type === 'rent' ? 'checked' : ''} onchange="updateMasterTariff(\${em.id}, 'rent')" class="text-primary-500 focus:ring-primary-400">
                                <span class="text-sm font-medium text-system-text">Аренда места</span>
                            </label>
                        </div>
                        
                        \${em.tariff_type === 'rent' ? \`
                            <div class="flex items-center gap-3 animate-fade-in">
                                <div>
                                    <label class="block text-xs font-medium text-system-muted mb-1">Сумма аренды</label>
                                    <div class="flex items-center gap-2">
                                        <input type="number" min="0" class="w-24 px-3 py-2 rounded-xl border border-primary-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none font-bold" value="\${em.tariff_details ? em.tariff_details.rent_amount : 0}" onchange="updateMasterRentAmount(\${em.id}, this.value)">
                                        <span class="text-system-muted font-medium">сом</span>
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <label class="block text-xs font-medium text-system-muted mb-1">Период</label>
                                    <select class="w-full px-3 py-2 rounded-xl border border-primary-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none font-medium" onchange="updateMasterRentPeriod(\${em.id}, this.value)">
                                        <option value="daily" \${em.tariff_details && em.tariff_details.rent_period === 'daily' ? 'selected' : ''}>В день</option>
                                        <option value="weekly" \${em.tariff_details && em.tariff_details.rent_period === 'weekly' ? 'selected' : ''}>В неделю</option>
                                        <option value="monthly" \${em.tariff_details && em.tariff_details.rent_period === 'monthly' ? 'selected' : ''}>В месяц</option>
                                    </select>
                                </div>
                            </div>
                        \` : \`
                            <div class="flex items-center gap-3 animate-fade-in mt-2 border-t border-primary-100 pt-3">
                                <div>
                                    <label class="block text-xs font-medium text-system-muted mb-1">Доля мастера</label>
                                    <div class="flex items-center gap-2">
                                        <input type="number" min="0" max="100" class="w-20 px-3 py-2 rounded-xl border border-primary-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-center font-bold" value="\${em.tariff_details ? (em.tariff_details.percentage_value !== undefined ? em.tariff_details.percentage_value : (em.commissionRate || 40)) : 40}" onchange="updateMasterCommission(\${em.id}, this.value)">
                                        <span class="text-system-muted font-medium">%</span>
                                    </div>
                                </div>
                                <p class="text-xs text-system-muted ml-2 mt-4">Применяется ко всем услугам по умолчанию</p>
                            </div>
                        \`}
                    </div>`;

code = code.replace(
    /<div class="mb-6 bg-primary-50 p-5 rounded-2xl border border-primary-100">[\s\S]*?<p class="text-xs text-system-muted ml-2">Применяется ко всем услугам по умолчанию<\/p>\s*<\/div>\s*<\/div>/m,
    newMasterUI
);

const newFunctions = `
window.updateMasterTariff = function(masterId, type) {
    const m = masters.find(x => x.id === masterId);
    if (!m) return;
    m.tariff_type = type;
    if (type === 'rent') {
        if (!m.tariff_details || typeof m.tariff_details.rent_amount === 'undefined') {
            m.tariff_details = { rent_amount: 1000, rent_period: 'daily' };
        }
    } else {
        if (!m.tariff_details || typeof m.tariff_details.percentage_value === 'undefined') {
            m.tariff_details = { percentage_value: m.commissionRate || 40 };
        }
    }
    render();
};

window.updateMasterRentAmount = function(masterId, amount) {
    const m = masters.find(x => x.id === masterId);
    if (!m) return;
    if (!m.tariff_details) m.tariff_details = {};
    m.tariff_details.rent_amount = parseInt(amount, 10) || 0;
    render();
};

window.updateMasterRentPeriod = function(masterId, period) {
    const m = masters.find(x => x.id === masterId);
    if (!m) return;
    if (!m.tariff_details) m.tariff_details = {};
    m.tariff_details.rent_period = period;
    render();
};
`;

code = code.replace('export function updateMasterCommission(masterId, value) {', newFunctions + '\\nexport function updateMasterCommission(masterId, value) {');

code = code.replace(
    'm.commissionRate = rate;',
    'm.commissionRate = rate; if(!m.tariff_details) m.tariff_details = {}; m.tariff_details.percentage_value = rate;'
);

code = code.replace(
    'return master.commissionRate || 40;',
    'return (master.tariff_details && master.tariff_details.percentage_value !== undefined) ? master.tariff_details.percentage_value : (master.commissionRate || 40);'
);

fs.writeFileSync('js/apps/salon/dashboard.js', code);
