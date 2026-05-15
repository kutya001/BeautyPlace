const fs = require('fs');

let content = fs.readFileSync('js/features/booking/wizard.js', 'utf8');

const sIdx = content.indexOf('<div class="space-y-4 animate-fade-in">');
const eIdx = content.indexOf('<button onclick="nextStepDefault()" class="w-full py-4 rounded-2xl bg-primary-50 text-primary-500 font-bold hover:bg-primary-50 transition-colors mt-6">Далее →</button>');

const replacement = `<div class="space-y-4 animate-fade-in">
    <div class="mb-4 bg-system-main rounded-2xl p-4">
        <h4 class="text-sm text-system-muted font-medium">Вы записываетесь к</h4>
        <p class="font-bold text-system-text text-lg mt-0.5">\${targetName}</p>
        \${targetSubtitle ? \`<p class="text-xs text-primary-500 mt-1">📍 \${targetSubtitle}</p>\` : ''}
    </div>
    <h3 class="font-bold text-system-text text-lg mb-2">Выберите услугу</h3>
    <div class="space-y-6">
        \${Object.keys(grouped).length > 0 ? Object.keys(grouped).map(gKey => \`
            <div>
                <h4 class="font-black text-xl text-system-text mb-4 border-b-2 border-system-border pb-2">\${genderGroups[gKey] || gKey}</h4>
                <div class="space-y-5">
                    \${Object.keys(grouped[gKey]).map(cId => {
                        const cat = categories.find(c => String(c.id) === String(cId));
                        const catName = cat ? \\\`\\\${cat.icon} \\\${cat.name}\\\` : 'Другое';
                        return \\\`
                        <div>
                            <h5 class="font-bold text-system-muted mb-3 flex items-center gap-2">
                                <span class="bg-system-main px-3 py-1 rounded-lg text-sm">\\\${catName}</span>
                            </h5>
                            <div class="grid grid-cols-1 gap-3">
                                \\\${grouped[gKey][cId].map(svc => {
                                    const price = (bd.type === 'master' && !masters.find(m => m.id === bd.targetId).salonId) 
                                        ? svc.price 
                                        : getSalonPrice(priceTargetId, svc.id, services);
                                    return \\\`
                                    <div onclick="state.bookingData.serviceId = \\\${svc.id}; goToBookingStep(2)" 
                                         class="p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg \\\${bd.serviceId === svc.id ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-50' : 'border-system-border hover:border-primary-400'}">
                                        <div class="flex justify-between items-center">
                                            <span class="font-bold \\\${bd.serviceId === svc.id ? 'text-primary-500' : 'text-system-text'} text-lg">\\\${svc.name}</span>
                                            <span class="text-xs text-system-muted font-medium ml-2 min-w-[70px]">⏳ \\\${svc.duration} мин</span>
                                            <span class="font-black text-primary-500 ml-auto whitespace-nowrap pl-2">\\\${formatPrice(price)}</span>
                                        </div>
                                    </div>
                                    \\\`;
                                }).join('')}
                            </div>
                        </div>
                        \\\`;
                    }).join('')}
                </div>
            </div>
        \`).join('') : '<p class="text-system-muted py-4">Нет доступных услуг</p>'}
    </div>
    `;

content = content.substring(0, sIdx) + replacement + content.substring(eIdx);
fs.writeFileSync('js/features/booking/wizard.js', content, 'utf8');
