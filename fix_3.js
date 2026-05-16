const fs = require('fs');
let code = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');

const targetStr = `<div class="flex items-center gap-2">
                                                <label class="text-[10px] text-system-muted w-12 text-right leading-tight">Комиссия:<br>(%)</label>
                                                <input type="number" min="0" max="100" class="w-16 px-2 py-1.5 rounded-lg border border-system-border text-sm focus:border-primary-400 outline-none text-center" 
                                                       value="\${currentComm}" \${!checked ? 'disabled' : ''} 
                                                       onchange="updateMasterServiceCommission(\${em.id}, \${svc.id}, this.value)">
                                            </div>`;

const replacementStr = `\${em.tariff_type === 'rent' ? \`
                                            <div class="flex items-center gap-2">
                                                <label class="text-[10px] text-system-muted w-14 text-right leading-tight">Стоимость:<br>(сом)</label>
                                                <input type="text" class="w-16 px-2 py-1.5 rounded-lg border border-system-border text-sm outline-none text-center bg-gray-50 text-system-muted cursor-not-allowed" 
                                                       value="\${em.customPrices && em.customPrices[svc.id] !== undefined ? em.customPrices[svc.id] : getSalonPrice(salon.id, svc.id, services)}" disabled title="Мастер на аренде сам устанавливает цены">
                                            </div>
                                            \` : \`
                                            <div class="flex items-center gap-2">
                                                <label class="text-[10px] text-system-muted w-12 text-right leading-tight">Комиссия:<br>(%)</label>
                                                <input type="number" min="0" max="100" class="w-16 px-2 py-1.5 rounded-lg border border-system-border text-sm focus:border-primary-400 outline-none text-center" 
                                                       value="\${currentComm}" \${!checked ? 'disabled' : ''} 
                                                       onchange="updateMasterServiceCommission(\${em.id}, \${svc.id}, this.value)">
                                            </div>
                                            \`}`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync('js/apps/salon/dashboard.js', code);
    console.log("Success");
} else {
    console.log("Target string not found in dashboard.js");
}
