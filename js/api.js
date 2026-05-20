// ==================== API: Эмуляция работы с данными ====================

import { 
    salonApplications, salonStaff, users, masters, subscriptionPlans, salonTransactions, salonSubscriptions 
} from './state.js';
import { DATABASE } from './db.js';

/**
 * Имитация загрузки БД
 */
async function loadDatabase() {
    // В режиме file:// данные берутся из глобальной переменной DATABASE в js/db.js
    return DATABASE;
}

/**
 * Генерация заглушек для изображений
 */
function getPlaceholderImage(width, height, text) {
    return `https://placehold.co/${width}x${height}/fce7f3/db2777?text=${encodeURIComponent(text)}`;
}

function getAvatarPlaceholder(name) {
    if (!name) return `https://ui-avatars.com/api/?name=U&background=fce7f3&color=db2777&bold=true`;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=fce7f3&color=db2777&bold=true`;
}

// ---- Новые функции управления салоном ----

async function applyToSalon(salonId, userId, baseRole = 'master') {
    const existing = salonApplications.find(a => a.salonId === salonId && a.userId === userId && a.status === 'pending');
    if (existing) return { success: false, error: 'Заявка уже подана' };

    const newApp = {
        id: 'APP' + Date.now(),
        salonId,
        userId,
        baseRole,
        status: 'pending',
        initiatedBy: 'master',
        createdAt: new Date().toISOString()
    };
    salonApplications.push(newApp);
    return { success: true, application: newApp };
}

async function processSalonApplication(appId, decision) {
    const app = salonApplications.find(a => a.id === appId);
    if (!app) return { success: false, error: 'Заявка не найдена' };

    app.status = decision === 'approve' ? 'approved' : 'rejected';
    return { success: true };
}

async function acceptSalonEmployment(appId) {
    const app = salonApplications.find(a => a.id === appId);
    if (!app) return { success: false, error: 'Заявка не найдена' };

    const user = users.find(u => u.id === app.userId);
    if (!user) return { success: false, error: 'Пользователь не найден' };

    if (user.role === 'master') {
        const master = masters.find(m => m.id === user.masterId);
        if (master) {
            if (master.salonId) {
                return { success: false, error: 'Вы уже работаете в другом салоне! Сначала выйдите из текущего.' };
            }
            master.salonId = app.salonId;
        }
    }
    user.salonId = app.salonId;

    app.status = 'hired';

    const defaultPermissions = app.baseRole === 'manager' 
        ? ['dashboard:view', 'bookings:view', 'bookings:edit', 'masters:view'] 
        : ['bookings:view', 'bookings:edit'];
    
    const exists = salonStaff.some(s => s.salonId === app.salonId && s.userId === app.userId);
    if (!exists) {
        const newStaff = {
            id: 'ST' + Date.now(),
            salonId: app.salonId,
            userId: app.userId,
            baseRole: app.baseRole,
            permissions: defaultPermissions,
            status: 'active'
        };
        salonStaff.push(newStaff);
    }

    return { success: true };
}

async function leaveCurrentSalon(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Пользователь не найден' };

    const previousSalonId = user.salonId;
    if (!previousSalonId) return { success: false, error: 'Вы не работаете в салоне' };

    if (user.role === 'master') {
        const master = masters.find(m => m.id === user.masterId);
        if (master) {
            master.salonId = '';
        }
    }
    user.salonId = '';

    const staffIdx = salonStaff.findIndex(s => s.salonId === previousSalonId && s.userId === userId);
    if (staffIdx >= 0) {
        salonStaff.splice(staffIdx, 1);
    }

    return { success: true };
}

async function updateStaffPermissions(staffId, permissionKey, value) {
    const staff = salonStaff.find(s => s.id === staffId);
    if (!staff) return { success: false };

    if (!staff.permissions) staff.permissions = [];
    
    if (value && !staff.permissions.includes(permissionKey)) {
        staff.permissions.push(permissionKey);
    } else if (!value && staff.permissions.includes(permissionKey)) {
        staff.permissions = staff.permissions.filter(p => p !== permissionKey);
    }
    
    return { success: true };
}

async function deleteStaff(staffId) {
    const idx = salonStaff.findIndex(s => s.id === staffId);
    if (idx >= 0) {
        salonStaff.splice(idx, 1);
        return { success: true };
    }
    return { success: false, error: 'Сотрудник не найден' };
}

async function buySubscription(salonId, planId) {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return { success: false };

    // Упрощенная транзакция
    const trx = {
        id: 'TRX' + Date.now(),
        salonId,
        amount: plan.price,
        date: new Date().toISOString(),
        planId: planId
    };
    salonTransactions.push(trx);

    const sub = salonSubscriptions.find(s => s.salonId === salonId);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    if (sub) {
        sub.planId = planId;
        sub.status = 'active';
        sub.expiresAt = expiresAt.toISOString();
    } else {
        salonSubscriptions.push({
            salonId,
            planId,
            status: 'active',
            expiresAt: expiresAt.toISOString()
        });
    }

    return { success: true };
}

window.getAvatarPlaceholder = getAvatarPlaceholder;
window.getPlaceholderImage = getPlaceholderImage;
window.applyToSalon = applyToSalon;
window.processSalonApplication = processSalonApplication;
window.acceptSalonEmployment = acceptSalonEmployment;
window.leaveCurrentSalon = leaveCurrentSalon;
window.updateStaffPermissions = updateStaffPermissions;
window.deleteStaff = deleteStaff;
window.buySubscription = buySubscription;

export {
    getAvatarPlaceholder,
    getPlaceholderImage,
    applyToSalon,
    processSalonApplication,
    acceptSalonEmployment,
    leaveCurrentSalon,
    updateStaffPermissions,
    deleteStaff,
    buySubscription
};

