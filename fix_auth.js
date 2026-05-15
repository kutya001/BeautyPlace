const fs = require('fs');

// 1. Fix js/features/auth/render.js
let renderJs = fs.readFileSync('js/features/auth/render.js', 'utf8');

// replace imports
if (!renderJs.includes('categories, services')) {
    renderJs = renderJs.replace("import { renderThemeSwitcher } from '../../components/ui.js';", "import { renderThemeSwitcher } from '../../components/ui.js';\nimport { state, categories, services } from '../../state.js';");
}

let authRegUiOld = `\${state.regRole === 'salon' ? \`
    <div class="space-y-3 mb-6">
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Название салона *</label>
            <input type="text" id="reg-salon-name" placeholder="Название вашего салона"
                class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-base sm:text-sm"
                value="\${state.regSalonName || ''}" oninput="state.regSalonName=this.value">
        </div>
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Адрес *</label>
            <input type="text" id="reg-salon-address" placeholder="ул. Чуйкова, 168, Бишкек"
                class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-base sm:text-sm"
                value="\${state.regSalonAddress || ''}" oninput="state.regSalonAddress=this.value">
        </div>
    </div>
\` : ''}`;

let authRegUiNew = `\${state.regRole === 'salon' ? \`
    <div class="space-y-3 mb-6 animate-slide-up">
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Вид организации *</label>
            <select id="reg-salon-type" class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-base sm:text-sm bg-system-surface font-medium text-system-text" onchange="state.regSalonType=this.value">
                <option value="Салон красоты" \${state.regSalonType === 'Салон красоты' ? 'selected' : ''}>Салон красоты</option>
                <option value="Барбер" \${state.regSalonType === 'Барбер' ? 'selected' : ''}>Барбер</option>
                <option value="Парикмахерская" \${state.regSalonType === 'Парикмахерская' ? 'selected' : ''}>Парикмахерская</option>
                <option value="СПА" \${state.regSalonType === 'СПА' ? 'selected' : ''}>СПА</option>
                <option value="Массажный салон" \${state.regSalonType === 'Массажный салон' ? 'selected' : ''}>Массажный салон</option>
                <option value="Лечебный салон" \${state.regSalonType === 'Лечебный салон' ? 'selected' : ''}>Лечебный салон</option>
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Название *</label>
            <input type="text" id="reg-salon-name" placeholder="Название вашей организации"
                class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-base sm:text-sm"
                value="\${state.regSalonName || ''}" oninput="state.regSalonName=this.value">
        </div>
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Адрес *</label>
            <input type="text" id="reg-salon-address" placeholder="ул. Чуйкова, 168, Бишкек"
                class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-base sm:text-sm"
                value="\${state.regSalonAddress || ''}" oninput="state.regSalonAddress=this.value">
        </div>
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Принимаемые категории</label>
            <div class="grid grid-cols-2 gap-2">
                \${categories.map(c => \`
                <label class="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-xl transition-colors \${state.regSalonCategories?.includes(c.id) ? 'border-primary-500 bg-primary-50 text-system-text shadow-sm' : 'border-system-border hover:border-primary-300 text-system-muted'}">
                    <input type="checkbox" class="hidden" 
                        \${state.regSalonCategories?.includes(c.id) ? 'checked' : ''}
                        onchange="
                            state.regSalonCategories = state.regSalonCategories || [];
                            if(this.checked) state.regSalonCategories.push(\${c.id});
                            else state.regSalonCategories = state.regSalonCategories.filter(id => id !== \${c.id});
                            window.render();
                        ">
                    <span class="text-lg">\${c.icon}</span> <span class="font-bold">\${c.name}</span>
                </label>
                \`).join('')}
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Оказываемые услуги</label>
            <div class="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                \${services.filter(s => !(state.regSalonCategories?.length > 0) || state.regSalonCategories.includes(s.category)).map(s => \`
                <label class="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-xl transition-colors shadow-sm \${state.regSalonServices?.includes(s.id) ? 'border-primary-500 bg-primary-50' : 'border-system-border hover:border-primary-300'}">
                    <input type="checkbox" class="hidden" 
                        \${state.regSalonServices?.includes(s.id) ? 'checked' : ''}
                        onchange="
                            state.regSalonServices = state.regSalonServices || [];
                            if(this.checked) state.regSalonServices.push(\${s.id});
                            else state.regSalonServices = state.regSalonServices.filter(id => id !== \${s.id});
                            window.render();
                        ">
                    <div class="flex flex-col flex-1 gap-0.5">
                        <span class="font-bold text-system-text">\${s.name}</span>
                        <span class="text-xs text-system-muted font-medium whitespace-nowrap overflow-hidden text-ellipsis w-64">\${s.price} сом · \${s.duration} мин</span>
                    </div>
                    <div class="w-6 h-6 rounded-md border-2 flex flex-shrink-0 items-center justify-center transition-colors \${state.regSalonServices?.includes(s.id) ? 'bg-primary-500 border-primary-500 text-white' : 'border-system-muted bg-system-surface shadow-inner'}">
                        \${state.regSalonServices?.includes(s.id) ? '<svg class="w-3 h-3 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"/></svg>' : ''}
                    </div>
                </label>
                \`).join('')}
            </div>
            \${(!state.regSalonCategories || state.regSalonCategories.length === 0) ? '<p class="text-xs text-system-muted font-medium mt-2">💡 Выберите категории выше, чтобы отфильтровать список услуг.</p>' : ''}
        </div>
    </div>
\` : ''}`;

if(renderJs.indexOf(authRegUiOld) > -1) {
    renderJs = renderJs.replace(authRegUiOld, authRegUiNew);
    fs.writeFileSync('js/features/auth/render.js', renderJs, 'utf8');
    console.log("Updated render.js successfully");
} else {
    console.log("Could not find authRegUiOld in render.js!");
}

// 2. Fix js/features/auth/actions.js
let actionsJs = fs.readFileSync('js/features/auth/actions.js', 'utf8');
if (!actionsJs.includes('salonSubscriptions')) {
    actionsJs = actionsJs.replace(/import \{ state, users, masters, salons, salonStaff \} from '\.\.\/\.\.\/state\.js';/, 
                                  "import { state, users, masters, salons, salonStaff, salonSubscriptions } from '../../state.js';");
}

let s3Old = `    if (role === 'salon') {
        if (!(state.regSalonName || '').trim()) { state.authError = 'Введите название салона'; render(); return; }
        if (!(state.regSalonAddress || '').trim()) { state.authError = 'Введите адрес салона'; render(); return; }
    }`;
let s3New = `    if (role === 'salon') {
        if (!(state.regSalonName || '').trim()) { state.authError = 'Введите название организации'; render(); return; }
        if (!(state.regSalonAddress || '').trim()) { state.authError = 'Введите адрес организации'; render(); return; }
        if (!state.regSalonCategories || state.regSalonCategories.length === 0) { state.authError = 'Выберите хотя бы одну категорию'; render(); return; }
    }`;

let s3OldObj = `        const newSalon = {
            id: newSalonId, name: state.regSalonName, address: state.regSalonAddress,
            city: 'Бишкек', metro: '', rating: 0, reviews: 0, priceLevel: 2,
            image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#fce7f3"/><text x="200" y="100" text-anchor="middle" font-size="48">🏢</text></svg>'),
            categories: [], masters: 0, openTime: '9:00', closeTime: '21:00',
            features: [], verified: false, ownerId: newUser.id
        };`;
let s3NewObj = `        const newSalon = {
            id: newSalonId, name: state.regSalonName, address: state.regSalonAddress,
            organizationType: state.regSalonType || 'Салон красоты',
            city: 'Бишкек', metro: '', rating: 0, reviews: 0, priceLevel: 2,
            image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#fce7f3"/><text x="200" y="100" text-anchor="middle" font-size="48">🏢</text></svg>'),
            categories: state.regSalonCategories || [],
            services: state.regSalonServices || [],
            masters: 0, openTime: '9:00', closeTime: '21:00',
            features: [], verified: false, ownerId: newUser.id
        };`;

let clearOld = `    state.regPasswordConfirm = '';
    state.regName = '';
    state.regEmail = '';
    state.regRole = 'client';
    state.regSalonName = '';
    state.regSalonAddress = '';
    state.regMasterSpecialty = '';`;
let clearNew = `    state.regPasswordConfirm = '';
    state.regName = '';
    state.regEmail = '';
    state.regRole = 'client';
    state.regSalonType = 'Салон красоты';
    state.regSalonCategories = [];
    state.regSalonServices = [];
    state.regSalonName = '';
    state.regSalonAddress = '';
    state.regMasterSpecialty = '';`;

if(actionsJs.indexOf(s3Old) > -1) actionsJs = actionsJs.replace(s3Old, s3New);
if(actionsJs.indexOf(s3OldObj) > -1) actionsJs = actionsJs.replace(s3OldObj, s3NewObj);
if(actionsJs.indexOf(clearOld) > -1) actionsJs = actionsJs.replace(clearOld, clearNew);

fs.writeFileSync('js/features/auth/actions.js', actionsJs, 'utf8');
console.log("Updated actions.js successfully");
