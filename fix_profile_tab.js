const fs = require('fs');
let code = fs.readFileSync('js/apps/master/app.js', 'utf8');

// I'll revert my mistake.
// First, strip out my injected string.
const badString = `
        let tariffText = 'Работа за процент (40% по умолчанию)';
        if (master.tariff_type === 'rent') {
             tariffText = \\\`Аренда места: \${master.tariff_details ? master.tariff_details.rent_amount : 0} сом / \${master.tariff_details && master.tariff_details.rent_period === 'monthly' ? 'месяц' : master.tariff_details && master.tariff_details.rent_period === 'weekly' ? 'неделю' : 'день'}\\\`;
        } else if (master.tariff_type === 'percentage') {
             tariffText = \\\`Процент от услуг: \${master.tariff_details && master.tariff_details.percentage_value !== undefined ? master.tariff_details.percentage_value : (master.commissionRate || 40)}%\\\`;
        }

        const tariffBlock = \\\`
        <div class="p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-start gap-3 mb-2">
            <span class="text-primary-500 mt-0.5"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span>
            <div>
                <p class="text-xs font-bold text-primary-600 uppercase tracking-wide mb-1">Мой тариф</p>
                <p class="text-sm font-medium text-system-text">\${tariffText}</p>
                <p class="text-[10px] text-system-muted mt-1 leading-tight">Установлено вашим салоном. Для изменения свяжитесь с руководителем.</p>
            </div>
        </div>\\\`;
`;

// It might be hard to strip exactly due to interpolation. I'll just rewrite the `if (tab === 'profile')` block completely since it's quite small.
// Let's replace from `if (tab === 'profile') {` up to `window.renderMasterContent = renderMasterContent;`
const newTabProfile = `    if (tab === 'profile') {
        let tariffText = 'Работа за процент (40% по умолчанию)';
        if (master.tariff_type === 'rent') {
             tariffText = \`Аренда места: \${master.tariff_details ? master.tariff_details.rent_amount : 0} сом / \${master.tariff_details && master.tariff_details.rent_period === 'monthly' ? 'месяц' : master.tariff_details && master.tariff_details.rent_period === 'weekly' ? 'неделю' : 'день'}\`;
        } else if (master.tariff_type === 'percentage') {
             tariffText = \`Процент от услуг: \${master.tariff_details && master.tariff_details.percentage_value !== undefined ? master.tariff_details.percentage_value : (master.commissionRate || 40)}%\`;
        }

        return \`
<div class="animate-fade-in max-w-lg">
    <h1 class="text-2xl font-bold text-system-text mb-6">Мой профиль</h1>
    <div class="bg-system-surface rounded-2xl border border-system-border p-6 space-y-4">
        
        <div class="p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-start gap-3 mb-2">
            <span class="text-primary-500 mt-0.5"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span>
            <div>
                <p class="text-xs font-bold text-primary-600 uppercase tracking-wide mb-1">Мой тариф</p>
                <p class="text-sm font-medium text-system-text">\${tariffText}</p>
                <p class="text-[10px] text-system-muted mt-1 leading-tight">Установлено вашим салоном. Для изменения свяжитесь с руководителем.</p>
            </div>
        </div>

        <div class="flex items-center gap-4 mb-4">
            <img src="\${master.avatar}" class="w-20 h-20 rounded-full border-4 border-primary-100">
            <div>
                <h2 class="font-bold text-system-text text-lg">\${master.name}</h2>
                <p class="text-primary-500">\${master.specialty}</p>
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Специальность</label>
            <input type="text" class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-base sm:text-sm" value="\${master.specialty}" oninput="masters.find(m=>m.id===\${master.id}).specialty=this.value">
        </div>
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">О себе</label>
            <textarea class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-base sm:text-sm resize-none" rows="3" oninput="masters.find(m=>m.id===\${master.id}).about=this.value">\${master.about}</textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Статус</label>
            <div class="flex gap-3">
                <button onclick="masters.find(m=>m.id===\${master.id}).available=true;showToast('Статус: Доступна');render()" class="flex-1 py-2.5 rounded-xl border-2 \${master.available ? 'border-green-400 bg-green-50 text-green-700' : 'border-system-border text-system-muted'} text-sm font-medium">● Доступна</button>
                <button onclick="masters.find(m=>m.id===\${master.id}).available=false;showToast('Статус: Недоступна');render()" class="flex-1 py-2.5 rounded-xl border-2 \${!master.available ? 'border-red-400 bg-red-50 text-red-700' : 'border-system-border text-system-muted'} text-sm font-medium">○ Недоступна</button>
            </div>
        </div>
        <button onclick="showToast('Профиль сохранён')" class="w-full btn-primary py-3.5 rounded-2xl text-white font-semibold text-sm shadow-xl shadow-primary-200">Сохранить</button>
    </div>
</div>\`;
    }
}
`;

code = code.replace(/if \(tab === 'profile'\) \{[\s\S]*?\}\s*\}\s*window\.renderMasterContent = renderMasterContent;/m, newTabProfile + '\nwindow.renderMasterContent = renderMasterContent;');

fs.writeFileSync('js/apps/master/app.js', code);
