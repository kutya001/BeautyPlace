import { render } from '../../core/engine.js';
import { handleLogout } from '../../features/auth/actions.js';
import { renderThemeSwitcher, renderSalonMobileNav, renderToast } from '../../components/ui.js';
import { 
    renderSalonPricesTab, renderSalonDashboard, renderSalonBookings, 
    renderSalonMasters, renderSalonProfile, renderSalonApplicationsTab,
    renderSalonStaffTab, renderSalonSubscriptionTab
} from './dashboard.js';
import { state, salons, masters, salonSubscriptions, services, checkPermission, getSalonRole } from '../../state.js';
import { getUserBookings, getSalonPrice } from '../../utils.js';

import { renderBookingModal } from '../../features/booking/wizard.js';

export function renderSalonApp() {
    return `
${renderSalonHeader()}
<div class="flex min-h-screen">
    ${renderSalonSidebar()}
    <div class="flex-1 p-2 sm:p-5 pb-24 md:pb-6 relative w-full overflow-hidden">
        <div class="island mt-2 w-full animate-fade-in shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            ${renderSalonContent()}
        </div>
    </div>
</div>
${renderSalonMobileNav()}
${state.toast ? renderToast() : ''}
${state.bookingModal ? renderBookingModal() : ''}
    `;
}

window.renderSalonApp = renderSalonApp;

export function renderSalonHeader() {
    const salon = salons.find(s => s.id === state.currentUser.salonId);
    return `
    <div class="px-2 sm:px-4 pt-1 sm:pt-2 sticky top-1 sm:top-2 z-[100] transition-all">
        <header class="island-header max-w-7xl mx-auto px-3 sm:px-4">
            <div class="flex items-center justify-between h-11 sm:h-12">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
                        <span class="text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
                    </div>
                    <div class="flex flex-col">
                        <span class="leading-none text-base sm:text-lg font-bold text-system-text">SuluuBusiness</span>
                        <span class="leading-none text-[10px] sm:text-xs text-system-muted mt-0.5">${salon ? salon.name : 'Мой салон'}</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    ${renderThemeSwitcher()}
                    <button onclick="handleLogout()" class="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 font-medium transition-colors hidden sm:block">Выйти</button>
                    <button onclick="handleLogout()" class="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 sm:hidden">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline stroke-linecap="round" stroke-linejoin="round" points="16 17 21 12 16 7"/><line stroke-linecap="round" stroke-linejoin="round" x1="21" x2="9" y1="12" y2="12"/></svg>
                    </button>
                </div>
            </div>
        </header>
    </div>`;
}

window.renderSalonHeader = renderSalonHeader;

export function renderSalonSidebar() {
    const salon = salons.find(s => s.id === state.currentUser.salonId);
    const salonRole = getSalonRole(state.currentUser.id, salon.id) || 'owner';
    const canViewAll = ['owner', 'manager', 'receptionist'].includes(salonRole);
    const canManageStaff = salonRole === 'owner';
    const canManageSub = salonRole === 'owner';

    const tabs = [
        { id: 'dashboard', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18"/><path stroke-linecap="round" stroke-linejoin="round" d="M18 17V9"/><path stroke-linecap="round" stroke-linejoin="round" d="M13 17V5"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 17v-3"/></svg>', label: 'Дашборд', show: checkPermission(state.currentUser.id, salon.id, 'dashboard:view') },
        { id: 'bookings', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line stroke-linecap="round" stroke-linejoin="round" x1="16" x2="16" y1="2" y2="6"/><line stroke-linecap="round" stroke-linejoin="round" x1="8" x2="8" y1="2" y2="6"/><line stroke-linecap="round" stroke-linejoin="round" x1="3" x2="21" y1="10" y2="10"/></svg>', label: 'Записи', show: checkPermission(state.currentUser.id, salon.id, 'bookings:view') },
        { id: 'masters', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line stroke-linecap="round" stroke-linejoin="round" x1="20" x2="8.12" y1="4" y2="15.88"/><line stroke-linecap="round" stroke-linejoin="round" x1="14.47" x2="14.48" y1="14.48" y2="14.48"/><line stroke-linecap="round" stroke-linejoin="round" x1="20" x2="8.12" y1="20" y2="8.12"/></svg>', label: 'Мастера', show: checkPermission(state.currentUser.id, salon.id, 'masters:view') },
        { id: 'applications', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16"/><path stroke-linecap="round" stroke-linejoin="round" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>', label: 'Заявки', show: checkPermission(state.currentUser.id, salon.id, 'applications:view') },
        { id: 'staff', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87"/><path stroke-linecap="round" stroke-linejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', label: 'Штат', show: checkPermission(state.currentUser.id, salon.id, 'staff:view') },
        { id: 'services', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7h-3a2 2 0 0 1-2-2V2"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 15h6"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 18h6"/></svg>', label: 'Услуги', show: checkPermission(state.currentUser.id, salon.id, 'services:view') },
        { id: 'subscription', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 3h12l4 6-10 13L2 9Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M11 3 8 9l4 13"/><path stroke-linecap="round" stroke-linejoin="round" d="M13 3l3 6-4 13"/></svg>', label: 'Подписка', show: checkPermission(state.currentUser.id, salon.id, 'subscription:view') },
        { id: 'profile', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', label: 'Профиль', show: checkPermission(state.currentUser.id, salon.id, 'profile:view') },
    ];
    return `
    <aside class="w-56 min-h-[calc(100vh-64px)] p-3 hidden md:block pt-4 select-none bg-system-main bg-opacity-50">
        <nav class="space-y-1.5">
            ${tabs.filter(t => t.show).map(tab => `
                <a href="#" onclick="state.salonTab='${tab.id}';render()" 
                   class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm ${state.salonTab === tab.id ? 'bg-system-surface shadow-sm border border-system-border text-primary-600 font-bold scale-[1.02]' : 'text-system-muted hover:bg-system-surface hover:shadow-sm'}">
                    <span class="${state.salonTab === tab.id ? 'text-primary-600' : 'text-system-muted'}">${tab.icon}</span> 
                    <span>${tab.label}</span>
                </a>
            `).join('')}
        </nav>
    </aside>`;
}

window.renderSalonSidebar = renderSalonSidebar;

export function renderSalonContent() {
    const salon = salons.find(s => s.id === state.currentUser.salonId);
    if (!salon) return '<div class="text-center py-20 text-system-muted">Салон не найден</div>';

    const sub = salonSubscriptions.find(s => s.salonId === salon.id);
    const hasActiveSub = sub && sub.status === 'active' && new Date(sub.expiresAt) > new Date();

    if (!hasActiveSub && state.salonTab !== 'subscription') {
        return `
        <div class="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-lg shadow-red-100">
                <svg class="w-10 h-10 inline-block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line stroke-linecap="round" stroke-linejoin="round" x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <h2 class="text-2xl font-bold text-system-text mb-2">Подписка не активна</h2>
            <p class="text-system-muted mb-8 max-w-sm text-center">Для продолжения работы в системе необходимо выбрать тарифный план и оплатить подписку.</p>
            <button onclick="state.salonTab='subscription';render()" class="btn-primary px-8 py-4 rounded-2xl text-white font-bold shadow-xl shadow-primary-100">Перейти к тарифам</button>
        </div>
        `;
    }

    const salonBookings = getUserBookings();
    const salonMasters = masters.filter(m => m.salonId === salon.id);
    const confirmedRevenue = salonBookings.filter(b => b.status === 'confirmed').reduce((sum, b) => {
        return sum + getSalonPrice(salon.id, b.serviceId, services);
    }, 0);

    // RBAC: определяем роль внутри салона
    const tab = state.salonTab;

    if (tab === 'dashboard' && checkPermission(state.currentUser.id, salon.id, 'dashboard:view')) {
        return renderSalonDashboard(salon, salonBookings, confirmedRevenue, salonMasters);
    } else if (tab === 'bookings' && checkPermission(state.currentUser.id, salon.id, 'bookings:view')) {
        return renderSalonBookings(salonBookings);
    } else if (tab === 'masters' && checkPermission(state.currentUser.id, salon.id, 'masters:view')) {
        return renderSalonMasters(salonMasters, salon);
    } else if (tab === 'applications' && checkPermission(state.currentUser.id, salon.id, 'applications:view')) {
        return renderSalonApplicationsTab(salon);
    } else if (tab === 'staff' && checkPermission(state.currentUser.id, salon.id, 'staff:view')) {
        return renderSalonStaffTab(salon);
    } else if (tab === 'services' && checkPermission(state.currentUser.id, salon.id, 'services:view')) {
        return renderSalonPricesTab(salon, services);
    } else if (tab === 'subscription' && checkPermission(state.currentUser.id, salon.id, 'subscription:view')) {
        return renderSalonSubscriptionTab(salon);
    } else if (tab === 'profile' && checkPermission(state.currentUser.id, salon.id, 'profile:view')) {
        return renderSalonProfile(salon);
    }
    // Fallback — записи
    return renderSalonBookings(salonBookings);
}

window.renderSalonContent = renderSalonContent;
