// ==================== STATE: Глобальное состояние приложения ====================

/** Коллекции данных (инициализируются из DATABASE) */
export let categories = [];
export let services = [];
export let salons = [];
export let masters = [];
export let users = [];
export let timeSlots = [];
export let salonPrices = [];
export let salonStaff = [];
export let salonApplications = [];
export let salonSubscriptions = [];
export let salonTransactions = [];
export let subscriptionPlans = [];

/**
 * Инициализация коллекций данными из БД
 */
export function initData(db) {
    categories = db.categories;
    services = db.services;
    salons = db.salons;
    masters = db.masters;
    users = db.users;
    timeSlots = db.timeSlots;
    salonPrices = db.salonPrices || [];
    salonStaff = db.salonStaff || [];
    salonApplications = db.salonApplications || [];
    salonSubscriptions = db.salonSubscriptions || [];
    salonTransactions = db.salonTransactions || [];
    subscriptionPlans = db.subscriptionPlans || [];
    state.bookings = db.bookings || [];
    try {
        const gb = JSON.parse(localStorage.getItem('guestBookings')||'[]');
        gb.forEach(g => {
            if (!state.bookings.find(b => b.id === g.id)) {
                state.bookings.push(g);
            }
        });
    } catch(e) {}
    state.reviews = db.reviews || [];

    // Обновляем window объекты
    window.categories = categories;
    window.services = services;
    window.salons = salons;
    window.masters = masters;
    window.users = users;
    window.timeSlots = timeSlots;
    window.salonPrices = salonPrices;
    window.salonStaff = salonStaff;
    window.salonApplications = salonApplications;
    window.salonSubscriptions = salonSubscriptions;
    window.salonTransactions = salonTransactions;
    window.subscriptionPlans = subscriptionPlans;
}

window.initData = initData;

/** RBAC: получить локальную роль пользователя внутри салона */
export function getSalonRole(userId, salonId) {
    const entry = salonStaff.find(s => s.userId === userId && s.salonId === salonId);
    return entry ? entry.baseRole : null;
}

/** RBAC: проверка доступа */
export function hasSalonAccess(userId, salonId, requiredRoles) {
    const role = getSalonRole(userId, salonId);
    return role && requiredRoles.includes(role);
}

/** RBAC: проверка доступа по ключу разрешения (формат module:action) */
export function checkPermission(userId, salonId, permission) {
    if (!userId || !salonId) return false;
    const staff = salonStaff.find(s => s.userId === userId && s.salonId === salonId);
    if (!staff) return false;
    
    // Владелец всегда имеет полный доступ
    if (staff.baseRole === 'owner') return true;
    
    // Мастера имеют фиксированные права (только расписание и услуги своего салона)
    if (staff.baseRole === 'master') {
        const masterOnlyPermissions = ['bookings:view', 'masters:view', 'services:view', 'profile:view'];
        return masterOnlyPermissions.includes(permission);
    }
    
    if (!staff.permissions) return false;

    // Если запрашивается базовый доступ к модулю (без действия), проверяем любое действие в этом модуле
    if (!permission.includes(':')) {
        return staff.permissions.some(p => p.startsWith(permission + ':'));
    }

    return staff.permissions.includes(permission);
}

window.checkPermission = checkPermission;
window.getSalonRole = getSalonRole;
window.hasSalonAccess = hasSalonAccess;

window.categories = categories;
window.services = services;
window.salons = salons;
window.masters = masters;
window.users = users;
window.timeSlots = timeSlots;
window.salonPrices = salonPrices;
window.salonStaff = salonStaff;

/** Реактивное состояние приложения */
export const state = {
    showAuthPage: false,
    isAuthenticated: false,
    currentUser: null,
    authMode: 'login',
    authError: '',
    loginPhone: '',
    loginPassword: '',
    regPhone: '',
    regPassword: '',
    regPasswordConfirm: '',
    regRole: 'client',
    regStep: 1,

    currentPage: 'home',
    activeCategory: null,
    searchQuery: '',
    mobileMenu: false,

    bookingModal: false,
    bookingStep: 1,
    bookingData: {
        type: null, targetId: null, serviceId: null,
        masterId: null,
        date: null, time: null,
        clientName: '', clientPhone: '', clientComment: ''
    },
    bookings: [],
    reviews: [],
    selectedSalon: null,
    selectedMaster: null,
    _calYear: null,
    _calMonth: null,

    adminTab: 'dashboard',
    salonTab: 'dashboard',
    masterTab: 'schedule',

    toast: null,
    showProfileEdit: false,
    showPriceHistory: null,

    // Шаг 2: Skill Matrix
    editingMasterId: null,    // ID мастера, чей профиль редактируется

    // Шаг 3: Аккордеоны прайса
    expandedCategories: {},   // { catId: true/false }

    // Шаг 4: Timeline
    salonViewMode: 'table',   // 'table' | 'timeline'
    timelineDate: null,        // дата для Timeline view
    dragBookingId: null,       // ID перетаскиваемой записи
};

window.state = state;
