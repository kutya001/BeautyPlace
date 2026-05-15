// ==================== PAGES: Home ====================
import { state, categories, services, salons, masters } from '../state.js';
import { renderServiceCard, renderSalonCard, renderMasterCard } from '../components/cards.js';

export function renderHomePage() {
    const popularServices = services.filter(s => s.popular).slice(0, 8);
    const topSalons = [...salons].sort((a, b) => b.rating - a.rating).slice(0, 3);
    const topMasters = [...masters].filter(m => m.available).sort((a, b) => b.rating - a.rating).slice(0, 4);

    return `
    <main>
        <section class="hero-gradient py-16 md:py-24">
            <div class="max-w-7xl mx-auto px-4 sm:px-6">
                <div class="text-center max-w-3xl mx-auto animate-fade-in">
                    <h1 class="text-4xl md:text-6xl font-bold text-system-text mb-6 leading-tight">
                        Найдите идеального <span class="gradient-text">beauty-мастера</span>
                    </h1>
                    <p class="text-lg md:text-xl text-system-muted mb-10 leading-relaxed">
                        Записывайтесь в лучшие салоны красоты и к проверенным мастерам онлайн. Быстро, удобно, без звонков.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                        <div class="flex-1 relative">
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-system-muted opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input type="text" placeholder="Поиск услуги, салона или мастера..."
                                class="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-system-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-system-surface shadow-sm"
                                value="${state.searchQuery}" oninput="state.searchQuery=this.value" onkeydown="if(event.key==='Enter')performSearch()">
                        </div>
                        <button onclick="performSearch()" class="btn-primary px-8 py-3.5 rounded-2xl text-white font-semibold text-sm whitespace-nowrap">
                            Найти
                        </button>
                    </div>
                    <div class="flex flex-wrap justify-center gap-2 mt-6">
                        <span class="text-xs text-system-muted">Популярное:</span>
                        ${['Маникюр', 'Стрижка', 'Макияж', 'Массаж'].map(t =>
                            `<span class="text-xs text-primary-500 cursor-pointer hover:underline" onclick="state.searchQuery='${t}';performSearch()">${t}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        </section>

        <section class="py-12 bg-system-surface">
            <div class="max-w-7xl mx-auto px-4 sm:px-6">
                <h2 class="text-2xl font-bold text-system-text mb-8">Категории услуг</h2>
                <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    ${categories.map(cat => `
                        <div class="category-pill cursor-pointer bg-system-main hover:bg-primary-50 rounded-2xl p-4 text-center transition-all"
                             onclick="filterByCategory(${cat.id})">
                            <div class="text-3xl mb-2">${cat.icon}</div>
                            <div class="text-sm font-medium text-system-text">${cat.name}</div>
                            <div class="text-xs text-system-muted opacity-70 mt-1">${services.filter(s => s.category === cat.id).length} услуг</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <section class="py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-2xl font-bold text-system-text">Популярные услуги</h2>
                    <a href="#" onclick="navigate('services')" class="text-sm text-primary-500 font-medium hover:underline">Все услуги →</a>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${popularServices.map(svc => renderServiceCard(svc)).join('')}
                </div>
            </div>
        </section>

        <section class="py-12 bg-system-surface">
            <div class="max-w-7xl mx-auto px-4 sm:px-6">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-2xl font-bold text-system-text">Лучшие салоны</h2>
                    <a href="#" onclick="navigate('salons')" class="text-sm text-primary-500 font-medium hover:underline">Все салоны →</a>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${topSalons.map(salon => renderSalonCard(salon)).join('')}
                </div>
            </div>
        </section>

        <section class="py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-2xl font-bold text-system-text">Топ-мастера</h2>
                    <a href="#" onclick="navigate('masters')" class="text-sm text-primary-500 font-medium hover:underline">Все мастера →</a>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${topMasters.map(master => renderMasterCard(master)).join('')}
                </div>
            </div>
        </section>

        <section class="py-16 bg-gradient-to-r from-primary-500 to-purple-600">
            <div class="max-w-3xl mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold text-white mb-4">Вы beauty-мастер или владелец салона?</h2>
                <p class="text-primary-100 mb-8 text-lg">Присоединяйтесь к BeautyPlace KG и получайте новых клиентов каждый день</p>
                <button onclick="handleLogout()" class="bg-system-surface text-primary-600 px-8 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary-50 transition-colors shadow-lg">
                    Зарегистрироваться
                </button>
            </div>
        </section>
    </main>`;
}
