const fs = require('fs');

const modalsAdditions = `
export function renderBecomeMasterModal() {
    return \`
    <div class="fixed inset-0 z-[100] flex items-center justify-center modal-overlay" onclick="state.showBecomeMasterModal=false; render()">
        <div class="bg-system-surface w-full max-w-md rounded-3xl p-6 animate-slide-up" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-system-text">Стать мастером</h2>
                <button onclick="state.showBecomeMasterModal=false; render()" class="text-system-muted hover:bg-system-main rounded-full w-8 h-8 flex items-center justify-center">✕</button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-system-text mb-1.5">Специальность *</label>
                    <input type="text" id="bm-specialty" placeholder="Например: Стилист-колорист" class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-sm bg-system-surface" value="\${state.bmSpecialty || ''}" oninput="state.bmSpecialty=this.value">
                </div>
                <div>
                    <label class="block text-sm font-medium text-system-text mb-1.5">Опыт работы (лет)</label>
                    <input type="number" id="bm-experience" placeholder="5" class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-sm bg-system-surface" value="\${state.bmExperience || ''}" oninput="state.bmExperience=this.value">
                </div>
                \${state.bmError ? \`<p class="text-red-500 text-sm font-medium">\${state.bmError}</p>\` : ''}
                <button onclick="submitBecomeMaster()" class="w-full btn-primary py-3.5 rounded-2xl text-white font-semibold text-sm">Создать профиль мастера</button>
            </div>
        </div>
    </div>\`;
}

window.renderBecomeMasterModal = renderBecomeMasterModal;

export function submitBecomeMaster() {
    const specialty = (state.bmSpecialty || '').trim();
    if (!specialty) {
        state.bmError = 'Введите специальность';
        render();
        return;
    }
    
    // Add master to state
    const newMasterId = state.masters.length + 1;
    const newMaster = {
        id: newMasterId, 
        name: state.currentUser.name || 'Новый мастер', 
        specialty: specialty,
        experience: parseInt(state.bmExperience) || 0,
        rating: 0, reviews: 0, priceLevel: 2,
        avatar: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><circle cx="40" cy="40" r="40" fill="#fce7f3"/><circle cx="40" cy="32" r="14" fill="#f9a8d4"/><ellipse cx="40" cy="65" rx="22" ry="18" fill="#f9a8d4"/></svg>'),
        categories: [], salonId: null, worksInSalon: false,
        services: [], available: true, userId: state.currentUser.id,
        about: ''
    };
    state.masters.push(newMaster);
    
    // Update user
    state.currentUser.masterId = newMasterId;
    state.currentUser.role = 'master'; // Automatically switch to master role
    
    // Clean up
    state.showBecomeMasterModal = false;
    state.bmError = '';
    state.bmSpecialty = '';
    state.bmExperience = '';
    
    window.showToast('Профиль мастера создан!');
    window.navigate('schedule');
    render();
}

window.submitBecomeMaster = submitBecomeMaster;

export function renderBecomeSalonModal() {
    return \`
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay overflow-y-auto" onclick="state.showBecomeSalonModal=false; render()">
        <div class="bg-system-surface w-full max-w-md rounded-3xl p-6 animate-slide-up my-auto shadow-2xl" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-system-text">Регистрация салона</h2>
                <button onclick="state.showBecomeSalonModal=false; render()" class="text-system-muted hover:bg-system-main rounded-full w-8 h-8 flex items-center justify-center">✕</button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-system-text mb-1.5">Форма собственности (ИП, ОсОО) *</label>
                    <input type="text" placeholder="Например: ОсОО 'Аура'" class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-sm bg-system-surface" value="\${state.bsOrgType || ''}" oninput="state.bsOrgType=this.value">
                </div>
                <div>
                    <label class="block text-sm font-medium text-system-text mb-1.5">ИНН *</label>
                    <input type="text" placeholder="14-значный ИНН" maxlength="14" class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-sm bg-system-surface" value="\${state.bsInn || ''}" oninput="state.bsInn=this.value.replace(/[^0-9]/g, '')">
                </div>
                <div>
                    <label class="block text-sm font-medium text-system-text mb-1.5">Название салона *</label>
                    <input type="text" placeholder="Suluu Luxe" class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-sm bg-system-surface" value="\${state.bsName || ''}" oninput="state.bsName=this.value">
                </div>
                <div>
                    <label class="block text-sm font-medium text-system-text mb-1.5">Адрес *</label>
                    <input type="text" placeholder="ул. Токтогула, 125" class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-sm bg-system-surface" value="\${state.bsAddress || ''}" oninput="state.bsAddress=this.value">
                </div>
                \${state.bsError ? \`<p class="text-red-500 text-sm font-medium">\${state.bsError}</p>\` : ''}
                <button onclick="submitBecomeSalon()" class="w-full btn-primary py-3.5 rounded-2xl text-white font-semibold text-sm mt-2">Открыть салон</button>
            </div>
        </div>
    </div>\`;
}

window.renderBecomeSalonModal = renderBecomeSalonModal;

export function submitBecomeSalon() {
    const org = (state.bsOrgType || '').trim();
    const inn = (state.bsInn || '').trim();
    const name = (state.bsName || '').trim();
    const address = (state.bsAddress || '').trim();

    if (!org) { state.bsError = 'Введите форму собственности'; render(); return; }
    if (inn.length !== 14) { state.bsError = 'ИНН должен состоять из 14 цифр'; render(); return; }
    if (!name) { state.bsError = 'Введите название салона'; render(); return; }
    if (!address) { state.bsError = 'Введите адрес салона'; render(); return; }

    const newSalonId = state.salons.length + 1;
    const newSalon = {
        id: newSalonId, 
        name: name, 
        address: address,
        inn: inn,
        orgType: org,
        city: 'Бишкек', metro: '', rating: 0, reviews: 0, priceLevel: 2,
        image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#fce7f3"/><text x="200" y="100" text-anchor="middle" font-size="48"><svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path stroke-linecap="round" stroke-linejoin="round" d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path stroke-linecap="round" stroke-linejoin="round" d="M10 6h4"/><path stroke-linecap="round" stroke-linejoin="round" d="M10 10h4"/><path stroke-linecap="round" stroke-linejoin="round" d="M10 14h4"/><path stroke-linecap="round" stroke-linejoin="round" d="M10 18h4"/></svg></text></svg>'),
        categories: [], masters: 0, openTime: '9:00', closeTime: '21:00',
        features: [], verified: false, ownerId: state.currentUser.id
    };
    state.salons.push(newSalon);
    
    // Add staff
    state.salonStaff.push({
        id: 'ST' + Date.now(),
        userId: state.currentUser.id,
        salonId: newSalonId,
        baseRole: 'owner',
        permissions: ['view_all_schedules', 'manage_bookings', 'view_applications', 'process_applications', 'manage_staff_permissions', 'manage_services', 'manage_salon_settings'],
        status: 'active'
    });

    state.salonSubscriptions.push({
        salonId: newSalonId,
        planId: 'basic',
        status: 'active',
        expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString()
    });

    state.currentUser.salonId = newSalonId;
    state.currentUser.role = 'salon';

    state.showBecomeSalonModal = false;
    state.bsError = '';
    state.bsOrgType = '';
    state.bsInn = '';
    state.bsName = '';
    state.bsAddress = '';

    window.showToast('Салон успешно зарегистрирован!');
    window.navigate('dashboard');
    render();
}

window.submitBecomeSalon = submitBecomeSalon;
`;

let codeStr = fs.readFileSync('js/components/modals.js', 'utf8');
if (!codeStr.includes('renderBecomeMasterModal')) {
    codeStr += modalsAdditions;
    fs.writeFileSync('js/components/modals.js', codeStr, 'utf8');
    console.log("Appended to modals.js");
} else {
    console.log("Modals already appended");
}

let layoutFile = 'js/apps/client/layout.js';
let layout = fs.readFileSync(layoutFile, 'utf8');
if (!layout.includes('renderBecomeMasterModal')) {
    layout = layout.replace(
        /import \{([^}]+)\} from '\.\.\/\.\.\/components\/modals\.js';/, 
        "import { $1, renderBecomeMasterModal, renderBecomeSalonModal } from '../../components/modals.js';"
    );
    layout = layout.replace(
        /\$\{state\.showProfileEdit \? renderProfileEditModal\(\) \: ''\}/,
        `\${state.showProfileEdit ? renderProfileEditModal() : ''}
\${state.showBecomeMasterModal ? renderBecomeMasterModal() : ''}
\${state.showBecomeSalonModal ? renderBecomeSalonModal() : ''}`
    );
    fs.writeFileSync(layoutFile, layout, 'utf8');
    console.log("Updated layout.js");
} else {
    console.log("layout.js already updated");
}
