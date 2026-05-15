// ==================== COMPONENTS: Header ====================
import { state } from '../state.js';
import { getUserBookings } from '../utils.js';

export function renderClientHeader() {
    const bookingCount = getUserBookings().filter(b => b.status === 'pending').length;
    const userName = state.currentUser ? (state.currentUser.name || state.currentUser.phone) : 'Гость';
    const initials = state.currentUser ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '<svg class="w-5 h-5 inline-block text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

    return `
    <header class="bg-system-surface/80 backdrop-blur-lg border-b border-system-border sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-2 cursor-pointer" onclick="navigate('home')">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <span class="text-white text-lg">✦</span>
                    </div>
                    <span class="font-bold text-lg gradient-text hidden sm:inline text-system-text">BeautyPlace</span>
                </div>

                <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-system-muted">
                    <a href="#" onclick="navigate('home')" class="hover:text-primary-500 transition-colors ${state.currentPage === 'home' ? 'text-primary-500 font-semibold' : ''}">Главная</a>
                    <a href="#" onclick="navigate('salons')" class="hover:text-primary-500 transition-colors ${state.currentPage === 'salons' || state.currentPage === 'salon-detail' ? 'text-primary-500 font-semibold' : ''}">Салоны</a>
                    <a href="#" onclick="navigate('masters')" class="hover:text-primary-500 transition-colors ${state.currentPage === 'masters' || state.currentPage === 'master-detail' ? 'text-primary-500 font-semibold' : ''}">Мастера</a>
                    <a href="#" onclick="navigate('services')" class="hover:text-primary-500 transition-colors ${state.currentPage === 'services' ? 'text-primary-500 font-semibold' : ''}">Услуги</a>
                    <a href="#" onclick="navigate('bookings')" class="hover:text-primary-500 transition-colors relative ${state.currentPage === 'bookings' ? 'text-primary-500 font-semibold' : ''}">
                        Мои записи
                        ${bookingCount > 0 ? `<span class="notification-badge">${bookingCount}</span>` : ''}
                    </a>
                </nav>

                <div class="flex items-center gap-3">
                    ${state.currentUser ? `
                    <div class="relative group">
                        <button class="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-system-main transition-colors" onclick="document.getElementById('userDropdown').classList.toggle('hidden')">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">${initials}</div>
                            <svg class="w-4 h-4 text-system-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        <div id="userDropdown" class="hidden">${renderUserDropdown()}</div>
                    </div>
                ` : `<button onclick="state.showAuthPage=true; render()" class="text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-xl transition-colors">Войти</button>`}
                    <button class="md:hidden" onclick="toggleMobileMenu()">
                        <svg class="w-6 h-6 text-system-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </header>`;
}

function renderUserDropdown() {
    const userName = state.currentUser.name || state.currentUser.phone;
    const roleLabels = { client: 'Клиент', master: 'Мастер', salon: 'Салон', superadmin: 'Админ' };
    return `
    <div class="absolute right-0 top-full mt-2 w-64 bg-system-surface rounded-2xl shadow-xl border border-system-border z-50 animate-scale-in">
        <div class="p-4 border-b border-system-border">
            <p class="font-semibold text-system-text text-sm">${userName}</p>
            <p class="text-xs text-system-muted">${roleLabels[state.currentUser.role]} · ${state.currentUser.phone}</p>
        </div>
        <div class="p-2">
            <a href="#" onclick="state.showProfileEdit=true;render()" class="sidebar-link block px-3 py-2 rounded-lg text-sm text-system-text">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 20v2"/><path stroke-linecap="round" stroke-linejoin="round" d="m4.93 4.93 1.41 1.41"/><path stroke-linecap="round" stroke-linejoin="round" d="m17.66 17.66 1.41 1.41"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h2"/><path stroke-linecap="round" stroke-linejoin="round" d="M20 12h2"/><path stroke-linecap="round" stroke-linejoin="round" d="m6.34 17.66-1.41 1.41"/><path stroke-linecap="round" stroke-linejoin="round" d="m19.07 4.93-1.41 1.41"/></svg> Настройки
            </a>
            <a href="#" onclick="navigate('bookings')" class="sidebar-link block px-3 py-2 rounded-lg text-sm text-system-text">
                <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line stroke-linecap="round" stroke-linejoin="round" x1="16" x2="16" y1="2" y2="6"/><line stroke-linecap="round" stroke-linejoin="round" x1="8" x2="8" y1="2" y2="6"/><line stroke-linecap="round" stroke-linejoin="round" x1="3" x2="21" y1="10" y2="10"/></svg> Мои записи
            </a>
            <a href="#" onclick="handleLogout()" class="sidebar-link block px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-600">
                🚪 Выйти
            </a>
        </div>
    </div>`;
}

export function renderClientFooter() {
    return `
    <footer class="bg-system-surface text-system-muted py-12 border-t border-system-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                            <span class="text-white text-lg">✦</span>
                        </div>
                        <span class="font-bold text-lg text-system-text">BeautyPlace</span>
                    </div>
                    <p class="text-sm">Маркетплейс beauty-услуг №1 в Кыргызстане</p>
                </div>
                <div>
                    <h4 class="font-semibold text-system-text mb-3 text-sm">Навигация</h4>
                    <div class="space-y-2 text-sm">
                        <a href="#" onclick="navigate('salons')" class="block hover:text-primary-500 transition-colors">Салоны</a>
                        <a href="#" onclick="navigate('masters')" class="block hover:text-primary-500 transition-colors">Мастера</a>
                        <a href="#" onclick="navigate('services')" class="block hover:text-primary-500 transition-colors">Услуги</a>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-system-text mb-3 text-sm">Контакты</h4>
                    <div class="space-y-2 text-sm">
                        <p>📞 +996 312 123 456</p>
                        <p>✉️ info@beautyplace.kg</p>
                        <p>📍 г. Бишкек, ул. Чуй 123</p>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-system-text mb-3 text-sm">Мы в соцсетях</h4>
                    <div class="flex gap-3">
                        <a href="#" class="w-10 h-10 rounded-xl bg-system-main flex items-center justify-center hover:bg-primary-500 transition-colors text-lg">📱</a>
                        <a href="#" class="w-10 h-10 rounded-xl bg-system-main flex items-center justify-center hover:bg-primary-500 transition-colors text-lg">💬</a>
                        <a href="#" class="w-10 h-10 rounded-xl bg-system-main flex items-center justify-center hover:bg-primary-500 transition-colors text-lg">📸</a>
                    </div>
                </div>
            </div>
            <div class="border-t border-system-border pt-6 text-center text-sm">
                <p>© 2024 Suluu. Все права защищены.</p>
            </div>
        </div>
    </footer>`;
}
