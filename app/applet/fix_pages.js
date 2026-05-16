const fs = require('fs');
let content = fs.readFileSync('js/apps/client/pages.js', 'utf8');

const updatedFunc = `export function renderSalonDetailPage() {
    const salon = salons.find(s => s.id === state.selectedSalon);
    if (!salon) return '<div class="text-center py-20"><p>Салон не найден</p></div>';
    const salonMasters = masters.filter(m => m.salonId === salon.id);
    const mastersCount = salonMasters.length;
    const isPrivateMaster = mastersCount === 1;
    const salonServices = getSalonServices(salon, services);

    return \\\`
    <main class="island max-w-7xl mx-auto px-4 sm:px-6 mt-6 mx-4">
<button onclick="navigate('salons')" class="flex items-center gap-2 text-sm text-system-muted hover:text-primary-500 mb-6 transition-colors">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
    Назад к салонам
</button>
<div class="bg-system-surface rounded-3xl border border-system-border overflow-hidden mb-8 animate-fade-in">
    <img src="\\\${salon.image}" alt="\\\${salon.name}" class="w-full h-64 md:h-80 object-cover">
    <div class="p-6 md:p-8">
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <h1 class="text-3xl font-bold text-system-text">\\\${salon.name}\\\${isPrivateMaster ? ' <span class="text-lg font-normal text-system-muted opacity-70 ml-2">Частный мастер</span>' : ''}</h1>
                    \\\${salon.verified ? '<span class="badge bg-blue-100 text-blue-600">✓ Проверен</span>' : ''}
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="star">★</span><span class="font-semibold text-system-text opacity-90">\\\${salon.rating}</span>
                    <span class="text-system-muted opacity-80">(\\\${salon.reviews} отзывов)</span>
                    <span class="text-system-muted opacity-80 ml-2">\\\${getPriceLevel(salon.priceLevel)}</span>
                </div>
                <p class="text-system-muted">📍 \\\${salon.address}, \\\${salon.city || 'Бишкек'}</p>
                <p class="text-system-muted opacity-80 text-sm mt-1">🕐 \\\${salon.openTime}–\\\${salon.closeTime} · \\\${isPrivateMaster ? 'Частный мастер' : mastersCount + ' мастеров'}</p>
            </div>
            <button onclick="openBookingForSalon(\\\${salon.id})" class="btn-primary px-8 py-3 rounded-2xl text-white font-semibold whitespace-nowrap">Записаться</button>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
            \\\${salon.features.map(f => \\\`<span class="badge bg-green-50 text-green-700">\\\${f}</span>\\\`).join('')}
        </div>
    </div>
</div>
<div class="mb-8">
    <h2 class="text-xl font-bold text-system-text mb-4">Услуги \\\${isPrivateMaster ? 'мастера' : 'салона'}</h2>\`;

content = content.replace(/export function renderSalonDetailPage\(\) \{[\s\S]*?<div class="mb-8">\s*<h2 class="text-xl font-bold text-system-text mb-4">Услуги салона<\/h2>/, updatedFunc);

fs.writeFileSync('js/apps/client/pages.js', content, 'utf8');
`;
