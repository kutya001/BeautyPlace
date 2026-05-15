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
    <div class="flex-1 p-4 sm:p-6 bg-system-main pb-24 md:pb-6">
        ${renderSalonContent()}
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
    const salonName = salon ? salon.name : (state.currentUser.name || 'Салон');
    return `
    <header class="bg-system-surface border-b border-system-border sticky top-0 z-50">
<div class="flex items-center justify-between h-16 px-6">
    <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span class="text-white text-sm">🏢</span>
        </div>
        <span class="text-lg font-bold text-system-text">${salonName} — Панель салона</span>
    </div>
    <div class="flex items-center gap-4">
        ${renderThemeSwitcher()}
        <span class="text-sm text-system-muted">${salonName}</span>
        <button onclick="handleLogout()" class="text-sm text-red-500 hover:text-red-700 font-medium">Выйти</button>
    </div>
</div>
    </header>`;
}

window.renderSalonHeader = renderSalonHeader;

export function renderSalonSidebar() {
    const salon = salons.find(s => s.id === state.currentUser.salonId);
    const salonRole = getSalonRole(state.currentUser.id, salon.id) || 'owner';
    const canViewAll = ['owner', 'manager', 'receptionist'].includes(salonRole);
    const canManageStaff = salonRole === 'owner';
    const canManageSub = salonRole === 'owner';

    const tabs = [
        { id: 'dashboard', icon: '📊', label: 'Дашборд', show: checkPermission(state.currentUser.id, salon.id, 'dashboard:view') },
        { id: 'bookings', icon: '📅', label: 'Записи', show: checkPermission(state.currentUser.id, salon.id, 'bookings:view') },
        { id: 'masters', icon: '💇‍♀️', label: 'Мастера', show: checkPermission(state.currentUser.id, salon.id, 'masters:view') },
        { id: 'applications', icon: '📩', label: 'Заявки', show: checkPermission(state.currentUser.id, salon.id, 'applications:view') },
        { id: 'staff', icon: '👥', label: 'Штат', show: checkPermission(state.currentUser.id, salon.id, 'staff:view') },
        { id: 'services', icon: '💰', label: 'Услуги', show: checkPermission(state.currentUser.id, salon.id, 'services:view') },
        { id: 'subscription', icon: '💳', label: 'Подписка', show: checkPermission(state.currentUser.id, salon.id, 'subscription:view') },
        { id: 'profile', icon: '⚙️', label: 'Профиль', show: checkPermission(state.currentUser.id, salon.id, 'profile:view') },
    ];
    return `
    <aside class="w-64 bg-system-surface border-r border-system-border min-h-screen p-4 hidden md:block">
<div class="space-y-1">
    ${tabs.filter(t => t.show).map(tab => `
        <a href="#" onclick="state.salonTab='${tab.id}';render()" class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${state.salonTab === tab.id ? 'active' : 'text-system-muted'}">
            <span>${tab.icon}</span> ${tab.label}
        </a>
    `).join('')}
</div>
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
            <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-lg shadow-red-100">💳</div>
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
