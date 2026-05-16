const fs = require('fs');
let code = fs.readFileSync('js/components/modals.js', 'utf8');

const replacement = `<div class="bg-primary-50 rounded-xl p-4">
            <div class="flex justify-between items-center mb-3">
                <p class="text-sm font-semibold text-system-text mb-0">Текущая роль: \${{ client: 'Клиент', master: 'Мастер', salon: 'Салон', superadmin: 'Супер-админ', admin: 'Супер-админ' }[user.role]}</p>
            </div>
            <div class="space-y-2">
                \${user.role !== 'client' ? \`<button onclick="state.currentUser.role='client'; window.navigate('home'); window.render()" class="w-full text-left px-3 py-2 text-sm bg-white rounded-lg border border-primary-100 hover:border-primary-300 transition-colors flex items-center gap-2">👤 Перейти в SuluuMarket</button>\` : ''}
                
                \${user.role !== 'master' ? 
                    (user.masterId ? 
                        \`<button onclick="state.currentUser.role='master'; window.navigate('schedule'); window.render()" class="w-full text-left px-3 py-2 text-sm bg-white rounded-lg border border-primary-100 hover:border-primary-300 transition-colors flex items-center gap-2">✂️ Перейти в SuluuMaster</button>\` 
                        : \`<button onclick="state.showBecomeMasterModal=true; render()" class="w-full text-left px-3 py-2 text-sm bg-white rounded-lg border border-primary-100 hover:border-primary-300 transition-colors flex items-center gap-2 text-primary-600 font-medium shadow-sm">✂️ Стать мастером</button>\`)
                : ''}

                \${user.role !== 'salon' ? 
                    (user.salonId ? 
                        \`<button onclick="state.currentUser.role='salon'; window.navigate('dashboard'); window.render()" class="w-full text-left px-3 py-2 text-sm bg-white rounded-lg border border-primary-100 hover:border-primary-300 transition-colors flex items-center gap-2">🏢 Перейти в SuluuBusiness</button>\`
                        : \`<button onclick="state.showBecomeSalonModal=true; render()" class="w-full text-left px-3 py-2 text-sm bg-white rounded-lg border border-primary-100 hover:border-primary-300 transition-colors flex items-center gap-2 text-primary-600 font-medium shadow-sm">🏢 Открыть салон</button>\`)
                : ''}
            </div>
        </div>`;

let start = code.indexOf('<div class="bg-primary-50 rounded-xl p-4">');
let end = code.indexOf('</div>', start) + 6;
let replaced = code.substring(0, start) + replacement + code.substring(end);
fs.writeFileSync('js/components/modals.js', replaced);
console.log('Success replacing profile block');
