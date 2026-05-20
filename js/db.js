export const DATABASE = {
    categories: [
        { id: 1, name: 'Волосы', icon: '<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line stroke-linecap="round" stroke-linejoin="round" x1="20" x2="8.12" y1="4" y2="15.88"/><line stroke-linecap="round" stroke-linejoin="round" x1="14.47" x2="14.48" y1="14.48" y2="14.48"/><line stroke-linecap="round" stroke-linejoin="round" x1="20" x2="8.12" y1="20" y2="8.12"/></svg>' },
        { id: 2, name: 'Ногти', icon: '<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7h-3a2 2 0 0 1-2-2V2"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 15h6"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 18h6"/></svg>' },
        { id: 3, name: 'Брови и ресницы', icon: '👁' },
        { id: 4, name: 'Лицо', icon: '<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/></svg>' },
        { id: 5, name: 'Тело', icon: '💆‍♀️' },
        { id: 6, name: 'Мужской зал', icon: '🧔' }
    ],
    services: [
        { id: 1, name: 'Женская стрижка', category: 1, duration: 60, price: 1200, rating: 4.8, popular: true, gender: 'female' },
        { id: 2, name: 'Окрашивание в один тон', category: 1, duration: 120, price: 3500, rating: 4.9, popular: true, gender: 'female' },
        { id: 3, name: 'Укладка феном', category: 1, duration: 45, price: 800, rating: 4.7, gender: 'female' },
        { id: 4, name: 'Маникюр с покрытием гель-лак', category: 2, duration: 90, price: 1500, rating: 4.9, popular: true, gender: 'all' },
        { id: 5, name: 'Наращивание ногтей', category: 2, duration: 150, price: 2500, rating: 4.8, gender: 'female' },
        { id: 6, name: 'Мужская стрижка', category: 6, duration: 45, price: 1000, rating: 4.9, popular: true, gender: 'male' },
        { id: 7, name: 'Оформление бороды', category: 6, duration: 30, price: 600, rating: 4.8, gender: 'male' },
        { id: 8, name: 'Дневной макияж', category: 4, duration: 60, price: 2000, rating: 4.7, gender: 'female' },
        { id: 9, name: 'Коррекция бровей', category: 3, duration: 30, price: 500, rating: 4.9, popular: true, gender: 'all' },
        { id: 10, name: 'Наращивание ресниц (2D)', category: 3, duration: 120, price: 1800, rating: 4.8, gender: 'female' },
        { id: 11, name: 'Чистка лица', category: 4, duration: 90, price: 2500, rating: 4.7, gender: 'all' },
        { id: 12, name: 'Пилинг', category: 4, duration: 45, price: 2000, rating: 4.6, gender: 'all' },
        { id: 13, name: 'Классический массаж', category: 5, duration: 60, price: 1800, rating: 5.0, popular: true, gender: 'all' },
        { id: 14, name: 'Антицеллюлитный массаж', category: 5, duration: 45, price: 2200, rating: 4.9, gender: 'all' },
        { id: 15, name: 'SPA-программа "Релакс"', category: 5, duration: 120, price: 4500, rating: 5.0, gender: 'all' }
    ],
    salons: [
        { id: 1, name: 'Suluu Luxe', address: 'Бишкек, ул. Киевская, 124', phone: '+996 555 111 222', rating: 4.9, reviews: 128, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800', categories: [1, 2, 3, 4], openTime: '09:00', closeTime: '21:00', features: ['Wi-Fi', 'Кофе', 'Парковка'], theme: 'hair' },
        { id: 2, name: 'Aura Beauty', address: 'Бишкек, пр. Чуй, 150', phone: '+996 555 333 444', rating: 4.7, reviews: 85, image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800', categories: [1, 4, 6], openTime: '10:00', closeTime: '20:00', features: ['Детская зона', 'Оплата картой'], theme: 'barber' },
        { id: 3, name: 'Silk Road Spa', address: 'Бишкек, ул. Токтогула, 90', phone: '+996 555 555 666', rating: 5.0, reviews: 42, image: 'https://images.unsplash.com/photo-1519415510236-85591199766e?auto=format&fit=crop&q=80&w=800', categories: [5, 6], openTime: '08:00', closeTime: '22:00', features: ['Бассейн', 'Сауна'], theme: 'eco' }
    ],
    masters: [
        { id: 6, name: 'Камила Осмонова', specialty: 'Мастер ногтевого сервиса', rating: 4.8, reviews: 15, experience: 2, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', salonId: null, tariff_type: 'percentage', tariff_details: { percentage_value: 100 }, services: [4, 5], available: true, about: 'Принимаю на дому и на выезд.' },
        { id: 7, name: 'Жанна Алиева', specialty: 'Парикмахер', rating: 4.9, reviews: 110, experience: 7, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200', salonId: null, tariff_type: 'percentage', tariff_details: { percentage_value: 100 }, services: [1, 2, 3], available: true, about: 'Делаю лучшие стрижки в городе. Выезд на дом.' },
        { id: 1, name: 'Айпери Маратова', specialty: 'Топ-стилист', rating: 4.9, reviews: 56, experience: 8, avatar: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&q=80&w=200', salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, services: [1, 2, 3], available: true, about: 'Специализируюсь на сложных окрашиваниях и вечерних прическах.' },
        { id: 2, name: 'Елена Иванова', specialty: 'Мастер маникюра', rating: 4.8, reviews: 42, experience: 5, avatar: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=200', salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, services: [4, 5], available: true, about: 'Идеальный френч и укрепление ногтевой пластины.' },
        { id: 3, name: 'Бегимай Сатыбекова', specialty: 'Косметолог', rating: 5.0, reviews: 28, experience: 10, avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de2177?auto=format&fit=crop&q=80&w=200', salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, services: [11, 12], available: true, about: 'Врач-косметолог с высшим медицинским образованием.' },
        { id: 4, name: 'Арман Каримов', specialty: 'Барбер', rating: 4.7, reviews: 35, experience: 4, avatar: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&q=80&w=200', salonId: 2, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, services: [6, 7], available: true, about: 'Мужские стрижки и оформление бороды любой сложности.' },
        { id: 5, name: 'Диана Волкова', specialty: 'Визажист', rating: 4.9, reviews: 19, experience: 3, avatar: 'https://images.unsplash.com/photo-1567532939604-b6c5b0adcc2c?auto=format&fit=crop&q=80&w=200', salonId: 2, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, services: [8, 9, 10], available: true, about: 'Создаю образы для фотосессий и свадеб.' },
        { id: 6, name: 'Михаил Торопов', specialty: 'Массажист', rating: 4.9, reviews: 67, experience: 12, avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', salonId: 3, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, services: [13, 14, 15], available: true, about: 'Массаж спины и антистрессовые программы.' }
    ],
    // Шаг 1: RBAC — штатное расписание салонов
    salonStaff: [
        { id: 'ST001', userId: 2, salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, baseRole: 'owner', permissions: ['*:*'], status: 'active' },
        { id: 'ST002', userId: 3, salonId: 2, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, baseRole: 'owner', permissions: ['*:*'], status: 'active' },
        { id: 'ST003', userId: 9, salonId: 3, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, baseRole: 'owner', permissions: ['*:*'], status: 'active' },
        { id: 'ST004', userId: 13, salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, baseRole: 'manager', permissions: ['dashboard:view', 'bookings:view', 'bookings:edit', 'masters:view'], status: 'active' },
        { id: 'ST005', userId: 14, salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, baseRole: 'receptionist', permissions: ['bookings:view', 'bookings:edit'], status: 'active' }
    ],
    salonApplications: [
        { id: 'APP001', salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, userId: 10, baseRole: 'master', status: 'pending', createdAt: '2026-05-10T10:00:00Z' }
    ],
    salonSubscriptions: [
        { salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, planId: 'pro', status: 'active', expiresAt: '2026-06-10T00:00:00Z' },
        { salonId: 2, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, planId: 'basic', status: 'active', expiresAt: '2026-06-10T00:00:00Z' },
        { salonId: 3, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, planId: 'enterprise', status: 'active', expiresAt: '2026-06-10T00:00:00Z' }
    ],
    salonTransactions: [
        { id: 'TRX001', salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, amount: 2500, date: '2026-05-10T09:00:00Z', planId: 'pro' }
    ],
    subscriptionPlans: [
        { id: 'basic', name: 'Базовый', price: 1000, features: ['До 3 мастеров', 'Базовая аналитика'] },
        { id: 'pro', name: 'Профи', price: 2500, features: ['До 10 мастеров', 'Полная аналитика', 'Управление персоналом'] },
        { id: 'enterprise', name: 'Бизнес', price: 5000, features: ['Безлимитно', 'Приоритетная поддержка', 'API доступ'] }
    ],
    users: [
        { id: 1, phone: '+996 555 000 000', password: 'admin123', name: 'Супер Админ', role: 'superadmin' },
        { id: 8, phone: '+996 555 000 999', password: 'admin123', name: 'Админ 2', role: 'superadmin' },
        { id: 2, phone: '+996 555 111 111', password: 'salon123', name: 'Салон Suluu Luxe', role: 'salon', salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 } },
        { id: 3, phone: '+996 555 111 222', password: 'salon123', name: 'Салон Aura Beauty', role: 'salon', salonId: 2, tariff_type: 'percentage', tariff_details: { percentage_value: 40 } },
        { id: 9, phone: '+996 555 111 333', password: 'salon123', name: 'Салон Silk Road Spa', role: 'salon', salonId: 3, tariff_type: 'percentage', tariff_details: { percentage_value: 40 } },
        { id: 13, phone: '+996 555 200 111', password: 'manager1', name: 'Менеджер (Suluu)', role: 'salon', salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 } },
        { id: 14, phone: '+996 555 200 222', password: 'recept1', name: 'Ресепшн (Suluu)', role: 'salon', salonId: 1, tariff_type: 'percentage', tariff_details: { percentage_value: 40 } },
        { id: 4, phone: '+996 700 111 111', password: 'master123', name: 'Мастер Айпери (Волосы)', role: 'master', masterId: 1 },
        { id: 10, phone: '+996 700 333 333', password: 'master123', name: 'Мастер Елена (Маникюр)', role: 'master', masterId: 2 },
        { id: 5, phone: '+996 700 222 222', password: 'master123', name: 'Мастер Арман (Барбер)', role: 'master', masterId: 4 },
        { id: 11, phone: '+996 700 444 444', password: 'master123', name: 'Мастер Диана (Визаж)', role: 'master', masterId: 5 },
        { id: 6, phone: '+996 550 123 456', password: 'client123', name: 'Айбек (Клиент)', role: 'client', gender: 'male' },
        { id: 7, phone: '+996 550 111 222', password: 'client123', name: 'Мария (Клиент)', role: 'client', gender: 'female' },
        { id: 12, phone: '+996 550 999 888', password: 'client123', name: 'Нурлан (Клиент)', role: 'client', gender: 'male' }
    ],
    timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    bookings: [
        { id: 'BK001', type: 'salon', targetId: 1, serviceId: 1, masterId: 1, date: '09.05.2026', time: '10:00', clientName: 'Айбек', clientPhone: '+996 550 123 456', clientUserId: 6, status: 'confirmed', createdAt: '2026-05-01T10:00:00Z' },
        { id: 'BK002', type: 'salon', targetId: 1, serviceId: 4, masterId: 2, date: '09.05.2026', time: '11:00', clientName: 'Мария', clientPhone: '+996 550 111 222', clientUserId: 7, status: 'confirmed', createdAt: '2026-05-02T12:00:00Z' },
        { id: 'BK003', type: 'salon', targetId: 1, serviceId: 2, masterId: 1, date: '09.05.2026', time: '14:00', clientName: 'Нурлан', clientPhone: '+996 550 999 888', clientUserId: 12, status: 'pending', createdAt: '2026-05-05T09:00:00Z' },
        { id: 'BK004', type: 'salon', targetId: 1, serviceId: 11, masterId: 3, date: '10.05.2026', time: '15:00', clientName: 'Айбек', clientPhone: '+996 550 123 456', clientUserId: 6, status: 'pending', createdAt: '2026-05-06T14:00:00Z' },
        { id: 'BK005', type: 'salon', targetId: 1, serviceId: 1, masterId: 1, date: '10.05.2026', time: '16:00', clientName: 'Мария', clientPhone: '+996 550 111 222', clientUserId: 7, status: 'confirmed', createdAt: '2026-05-06T15:00:00Z' },
        { id: 'BK006', type: 'salon', targetId: 2, serviceId: 6, masterId: 4, date: '09.05.2026', time: '12:00', clientName: 'Нурлан', clientPhone: '+996 550 999 888', clientUserId: 12, status: 'confirmed', createdAt: '2026-05-04T10:00:00Z' },
        { id: 'BK007', type: 'salon', targetId: 1, serviceId: 4, masterId: 2, date: '08.05.2026', time: '10:00', clientName: 'Айбек', clientPhone: '+996 550 123 456', clientUserId: 6, status: 'confirmed', createdAt: '2026-04-20T10:00:00Z' },
        { id: 'BK008', type: 'salon', targetId: 1, serviceId: 1, masterId: 1, date: '05.05.2026', time: '11:00', clientName: 'Айбек', clientPhone: '+996 550 123 456', clientUserId: 6, status: 'cancelled', cancelReason: 'Клиент отменил', createdAt: '2026-04-28T10:00:00Z' },
        { id: 'BK009', type: 'salon', targetId: 1, serviceId: 2, masterId: 1, date: '03.05.2026', time: '14:00', clientName: 'Мария', clientPhone: '+996 550 111 222', clientUserId: 7, status: 'confirmed', createdAt: '2026-04-25T10:00:00Z' },
        { id: 'BK010', type: 'salon', targetId: 2, serviceId: 8, masterId: 5, date: '10.05.2026', time: '10:00', clientName: 'Рахат', clientPhone: '+996 550 555 666', clientUserId: null, status: 'pending', createdAt: '2026-05-07T12:00:00Z' },
        { id: 'BK011', type: 'salon', targetId: 3, serviceId: 13, masterId: 6, date: '11.05.2026', time: '18:00', clientName: 'Азамат', clientPhone: '+996 550 777 888', clientUserId: null, status: 'confirmed', createdAt: '2026-05-08T10:00:00Z' },
        { id: 'BK012', type: 'master', targetId: 4, salonId: 2, tariff_type: 'percentage', tariff_details: { percentage_value: 40 }, serviceId: 7, masterId: 4, date: '09.05.2026', time: '15:00', clientName: 'Айбек', clientPhone: '+996 550 123 456', clientUserId: 6, status: 'confirmed', createdAt: '2026-05-05T10:00:00Z' }
    ],
    priceHistory: [],
    reviews: [
        { id: 'RV001', type: 'salon', targetId: 1, userId: 6, rating: 5, comment: 'Отличный салон! Мастер супер.', date: '10.05.2026' }
    ]
};

window.DATABASE = DATABASE;
window.categories = DATABASE.categories;
window.services = DATABASE.services;
window.salons = DATABASE.salons;
window.masters = DATABASE.masters;
window.salonStaff = DATABASE.salonStaff;
window.salonApplications = DATABASE.salonApplications;
window.salonSubscriptions = DATABASE.salonSubscriptions;
window.salonTransactions = DATABASE.salonTransactions;
window.subscriptionPlans = DATABASE.subscriptionPlans;
window.users = DATABASE.users;
window.timeSlots = DATABASE.timeSlots;
window.bookings = DATABASE.bookings;
window.reviews = DATABASE.reviews;
window.priceHistory = DATABASE.priceHistory;
