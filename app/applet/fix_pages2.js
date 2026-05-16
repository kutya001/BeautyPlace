const fs = require('fs');
let code = fs.readFileSync('js/apps/client/pages.js', 'utf8');

let newCode = code.replace(
'export function renderSalonDetailPage() {\n    const salon = salons.find(s => s.id === state.selectedSalon);',
'export function renderSalonDetailPage() {\n    const salon = salons.find(s => s.id === state.selectedSalon);\n    const salonMasters = masters.filter(m => m.salonId === salon.id);\n    const isPrivateMaster = salonMasters.length === 1;'
);

newCode = newCode.replace(
'<h1 class="text-3xl font-bold text-system-text">${salon.name}</h1>',
'<h1 class="text-3xl font-bold text-system-text">${salon.name}${isPrivateMaster ? \' <span class="text-lg font-normal text-system-muted opacity-70 ml-2">Частный мастер</span>\' : \'\'}</h1>'
);

newCode = newCode.replace(
'<p class="text-system-muted opacity-80 text-sm mt-1">🕐 ${salon.openTime}–${salon.closeTime} · ${salon.masters} мастеров</p>',
'<p class="text-system-muted opacity-80 text-sm mt-1">🕐 ${salon.openTime}–${salon.closeTime} · ${isPrivateMaster ? \'Частный мастер\' : salonMasters.length + \' мастеров\'}</p>'
);

newCode = newCode.replace(
'<h2 class="text-xl font-bold text-system-text mb-4">Услуги салона</h2>',
'<h2 class="text-xl font-bold text-system-text mb-4">Услуги ${isPrivateMaster ? \'мастера\' : \'салона\'}</h2>'
);

fs.writeFileSync('js/apps/client/pages.js', newCode);
console.log('done');
