// ==================== UTILS: Вспомогательные функции ====================

import { state, categories, salonPrices, services, masters } from './state.js';

export function getStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

export function formatPrice(price) {
    return (price || 0).toLocaleString('ru-RU') + ' сом';
}

export function getPriceLevel(level) {
    return '₽'.repeat(level);
}

export function getDurationText(minutes) {
    if (minutes < 60) return minutes + ' мин';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? h + ' ч ' + m + ' мин' : h + ' ч';
}
window.getDurationText = getDurationText;

export function getCategoryName(catId) {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : '';
}

export function getDaysOfMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    return days;
}

export function getMonthName(month) {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return months[month];
}

export function formatDate(date) {
    if (!date) return '';
    const d = date.getDate();
    const m = date.getMonth();
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return d + ' ' + months[m];
}

export function formatDateToDDMMYYYY(date) {
    if (!date) return '';
    const d = date.getDate();
    const m = date.getMonth();
    const y = date.getFullYear();
    const dd = String(d).padStart(2, '0');
    const mm = String(m + 1).padStart(2, '0');
    return `${dd}.${mm}.${y}`;
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function validatePhone(phone) {
    if (!phone) return false;
    let clean = phone.replace(/\s+/g, ' ').trim();
    if (clean.length < 10) return false;
    return /^\+996 \d{3} \d{3} \d{3}$/.test(clean) || /^\(\+996\) \d{3} \d{3} \d{3}$/.test(clean) || /^\+996\d{9}$/.test(phone.replace(/\D/g, '').replace('996', '+996'));
}

let _renderFn = null;
export function setRenderFn(fn) { _renderFn = fn; }

export function showToast(message) {
    state.toast = message;
    if (window.render) window.render();
    setTimeout(() => { state.toast = null; if (window.render) window.render(); }, 3000);
}

export function getUserBookings() {
    if (!state.currentUser) {
        try {
            const gb = JSON.parse(localStorage.getItem('guestBookings')||'[]');
            return state.bookings.filter(b => gb.includes(b.id) || gb.some(g => g && g.id === b.id));
        } catch(e) {
            return [];
        }
    }
    if (state.currentUser.role === 'client') {
        return state.bookings.filter(b => b.clientUserId === state.currentUser.id);
    }
    if (state.currentUser.role === 'salon') {
        const salonId = state.currentUser.salonId;
        return state.bookings.filter(b => {
            if (b.type === 'salon') return b.targetId === salonId;
            if (b.type === 'master') {
                const master = masters.find(m => m.id === b.targetId);
                return master && master.salonId === salonId;
            }
            return false;
        });
    }
    if (state.currentUser.role === 'master') {
        const masterId = state.currentUser.masterId;
        return state.bookings.filter(b => b.masterId === masterId || (b.type === 'master' && b.targetId === masterId));
    }
    if (state.currentUser.role === 'admin' || state.currentUser.role === 'superadmin') {
        return state.bookings;
    }
    return [];
}

export function getPendingBookings() {
    return getUserBookings().filter(b => b.status === 'pending');
}

export function getServicePrice(salonId, masterId, serviceId, servicesList) {
    if (masterId) {
        const m = (window.masters || window.state?.masters || require('./state.js').masters || []).find(x => x.id === masterId);
        if (m && m.tariff_type === 'rent' && m.customPrices && m.customPrices[serviceId] !== undefined) {
            return m.customPrices[serviceId];
        }
    }
    const sp = (window.salonPrices || require('./state.js').salonPrices || []).find(p => p.salonId === salonId && p.serviceId === serviceId);
    if (sp && sp.price !== undefined) return sp.price;
    const svc = (servicesList || require('./state.js').services || []).find(s => s.id === serviceId);
    return svc ? svc.price : 0;
}


export function getSalonPrice(salonId, serviceId, servicesList, overrideMasterId) {
    if (overrideMasterId) {
        const m = (window.masters || window.state?.masters || require('./state.js').masters || []).find(x => x.id === overrideMasterId);
        if (m && m.tariff_type === 'rent' && m.customPrices && m.customPrices[serviceId] !== undefined) {
            return m.customPrices[serviceId];
        }
    }
    const sp = (window.salonPrices || require('./state.js').salonPrices || []).find(p => p.salonId === salonId && p.serviceId === serviceId);
    if (sp && sp.price !== undefined) return sp.price;
    const svc = (servicesList || require('./state.js').services || []).find(s => s.id === serviceId);
    return svc ? svc.price : 0;
}


export function getSalonDuration(salonId, serviceId, servicesList) {
    const sp = (salonPrices || []).find(p => p.salonId === salonId && p.serviceId === serviceId);
    if (sp && sp.duration !== undefined) return sp.duration;
    const svc = (servicesList || services || []).find(s => s.id === serviceId);
    return svc ? svc.duration : 60;
}

export function getSalonPriceHistory(salonId, serviceId) {
    const sp = (salonPrices || []).find(p => p.salonId === salonId && p.serviceId === serviceId);
    return sp ? sp.history || [] : [];
}

export function updateSalonPrice(salonId, serviceId, newPrice) {
    let sp = salonPrices.find(p => p.salonId === salonId && p.serviceId === serviceId);
    const today = new Date().toISOString().slice(0, 16).replace('T', ' '); // YYYY-MM-DD HH:mm
    if (!sp) {
        sp = { salonId, serviceId, price: newPrice, history: [{ type: 'price', newValue: newPrice, date: today }] };
        salonPrices.push(sp);
    } else if (sp.price !== newPrice) {
        const oldPrice = sp.price;
        sp.price = newPrice;
        if (!sp.history) sp.history = [];
        sp.history.push({ type: 'price', oldValue: oldPrice, newValue: newPrice, date: today });
    }
}

export function updateSalonDuration(salonId, serviceId, newDuration) {
    let sp = salonPrices.find(p => p.salonId === salonId && p.serviceId === serviceId);
    const today = new Date().toISOString().slice(0, 16).replace('T', ' ');
    if (!sp) {
        sp = { salonId, serviceId, duration: newDuration, history: [{ type: 'time', newValue: newDuration, date: today }] };
        salonPrices.push(sp);
    } else if (sp.duration !== newDuration) {
        const oldDuration = sp.duration;
        sp.duration = newDuration;
        if (!sp.history) sp.history = [];
        sp.history.push({ type: 'time', oldValue: oldDuration, newValue: newDuration, date: today });
    }
}

export function getSalonServices(salon, allServices) {
    if (!salon) return [];
    if (salon.providedServices && salon.providedServices.length > 0) {
        return allServices.filter(s => salon.providedServices.includes(s.id));
    }
    return allServices.filter(s => (salon.categories || []).includes(s.category));
}

window.getStars = getStars;
window.formatPrice = formatPrice;
window.getPriceLevel = getPriceLevel;
window.getDurationText = getDurationText;
window.getCategoryName = getCategoryName;
window.getDaysOfMonth = getDaysOfMonth;
window.getMonthName = getMonthName;
window.formatDate = formatDate;
window.formatDateToDDMMYYYY = formatDateToDDMMYYYY;
window.generateId = generateId;
window.formatPhoneInput = formatPhoneInput;
window.validatePhone = validatePhone;
window.setRenderFn = setRenderFn;
window.showToast = showToast;
window.getUserBookings = getUserBookings;
window.getPendingBookings = getPendingBookings;
window.getSalonPrice = getSalonPrice;
window.getSalonDuration = getSalonDuration;
window.getSalonPriceHistory = getSalonPriceHistory;
window.updateSalonPrice = updateSalonPrice;
window.updateSalonDuration = updateSalonDuration;
window.getSalonServices = getSalonServices;


export const ThemeManager = {
  setTheme: (themeName) => {
    const validThemes = ['beauty', 'barber', 'hair', 'eco', 'medical', 'graphite'];
    const theme = validThemes.includes(themeName) ? themeName : 'beauty';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
    if (state.currentUser) {
      state.currentUser.theme = theme;
    }
  },
  toggleTheme: () => {
    const themes = ['beauty', 'barber', 'hair', 'eco', 'medical', 'graphite'];
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'beauty';
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    ThemeManager.setTheme(nextTheme);
    if (window.render) window.render();
  },
  initTheme: () => {
    const savedTheme = localStorage.getItem('app_theme') || 'beauty';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
};
window.ThemeManager = ThemeManager;

export function formatPhoneInput(input) {
    if (!input) return;
    let raw = input.value ? input.value.replace(/\D/g, '') : '';
    if (raw.startsWith('0')) raw = '996' + raw.substring(1);
    if (!raw.startsWith('996') && raw.length > 0) raw = '996' + raw;
    if (raw.startsWith('996')) raw = raw.substring(3);
    
    let formatted = '+996';
    if (raw.length > 0) formatted += ' ' + raw.substring(0, 3);
    if (raw.length > 3) formatted += ' ' + raw.substring(3, 6);
    if (raw.length > 6) formatted += ' ' + raw.substring(6, 9);
    
    input.value = formatted;
}
window.formatPhoneInput = formatPhoneInput;
