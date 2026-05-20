import { state, salons, masters, services, salonTransactions } from '../../state.js';
import { formatPrice, getSalonPrice, showToast, getSalonServices } from '../../utils.js';
import { render } from '../../core/engine.js';

// ==========================================
// 1. DATA ACCESS & PERSISTENCE (LOCAL STORAGE)
// ==========================================

export function initFinanceData(salonId) {
    if (!localStorage.getItem('wallets_' + salonId)) {
        const defaultWallets = [
            { id: 'w-cash-' + salonId, salonId, name: 'Наличная касса точки', type: 'cash', currency: 'KGS' },
            { id: 'w-mbank-' + salonId, salonId, name: 'MBank', type: 'bank', currency: 'KGS' },
            { id: 'w-optima-' + salonId, salonId, name: 'Optima Bank', type: 'bank', currency: 'KGS' },
            { id: 'w-omoney-' + salonId, salonId, name: 'О!Деньги', type: 'bank', currency: 'KGS' }
        ];
        localStorage.setItem('wallets_' + salonId, JSON.stringify(defaultWallets));
    }

    if (!localStorage.getItem('articles_' + salonId)) {
        const defaultArticles = [
            { id: 'art-revenue', salonId, name: 'Выручка от услуг', type: 'income', dds: true, opu: true, dzkz: false },
            { id: 'art-rent', salonId, name: 'Аренда помещения', type: 'expense', dds: true, opu: true, dzkz: false },
            { id: 'art-salary', salonId, name: 'Зарплата мастеров', type: 'expense', dds: true, opu: true, dzkz: false },
            { id: 'art-goods', salonId, name: 'Закупка расходных материалов', type: 'expense', dds: true, opu: true, dzkz: false },
            { id: 'art-other', salonId, name: 'Прочие расходы', type: 'expense', dds: true, opu: true, dzkz: false },
            { id: 'art-correction-inc', salonId, name: 'Корректировка (Излишек)', type: 'income', dds: true, opu: false, dzkz: false },
            { id: 'art-correction-exp', salonId, name: 'Корректировка (Недостача)', type: 'expense', dds: true, opu: false, dzkz: false }
        ];
        localStorage.setItem('articles_' + salonId, JSON.stringify(defaultArticles));
    }

    if (!localStorage.getItem('counterparties_' + salonId)) {
        const defaultCounterparties = [
            { id: 'cp-landlord', salonId, name: 'Собственник помещения (Аренда)', phone: '+996 550 999 111', role: 'partner' },
            { id: 'cp-estel', salonId, name: 'Поставщик Estel Professional', phone: '+996 700 222 333', role: 'supplier' }
        ];
        localStorage.setItem('counterparties_' + salonId, JSON.stringify(defaultCounterparties));
    }

    if (!localStorage.getItem('transactions_' + salonId)) {
        localStorage.setItem('transactions_' + salonId, JSON.stringify([]));
    }

    if (!localStorage.getItem('shifts_' + salonId)) {
        localStorage.setItem('shifts_' + salonId, JSON.stringify([]));
    }
}

// Getters and Setters that scope by Salon ID
export function getWallets(salonId) {
    initFinanceData(salonId);
    return JSON.parse(localStorage.getItem('wallets_' + salonId));
}

export function saveWallets(salonId, list) {
    localStorage.setItem('wallets_' + salonId, JSON.stringify(list));
}

export function getArticles(salonId) {
    initFinanceData(salonId);
    return JSON.parse(localStorage.getItem('articles_' + salonId));
}

export function saveArticles(salonId, list) {
    localStorage.setItem('articles_' + salonId, JSON.stringify(list));
}

export function getCounterparties(salonId) {
    initFinanceData(salonId);
    const cps = JSON.parse(localStorage.getItem('counterparties_' + salonId)) || [];
    // Synchronize counterparties with salon masters automatically so they are selectable for salary
    const salonMasters = masters.filter(m => m.salonId === salonId);
    salonMasters.forEach(m => {
        const exist = cps.some(c => c.id === 'master-' + m.id);
        if (!exist) {
            cps.push({
                id: 'master-' + m.id,
                salonId,
                name: m.name + ' (Мастер)',
                phone: '+996 XXX XXX XXX',
                role: 'partner'
            });
        }
    });
    return cps;
}

export function saveCounterparties(salonId, list) {
    localStorage.setItem('counterparties_' + salonId, JSON.stringify(list));
}

export function getTransactions(salonId) {
    initFinanceData(salonId);
    return JSON.parse(localStorage.getItem('transactions_' + salonId)) || [];
}

export function saveTransactions(salonId, list) {
    localStorage.setItem('transactions_' + salonId, JSON.stringify(list));
}

export function getShifts(salonId) {
    initFinanceData(salonId);
    return JSON.parse(localStorage.getItem('shifts_' + salonId)) || [];
}

export function saveShifts(salonId, list) {
    localStorage.setItem('shifts_' + salonId, JSON.stringify(list));
}

// Active shift helper
export function getActiveShift(salonId) {
    const list = getShifts(salonId);
    return list.find(s => s.status === 'open') || null;
}

// Calculate Wallet Balance: sum up all transactions
export function getWalletBalance(salonId, walletId) {
    const txs = getTransactions(salonId);
    let balance = 0;
    
    // Check if wallet has a hardcoded initial balance
    if (walletId.includes('cash')) balance = 5000;
    else if (walletId.includes('mbank')) balance = 12000;
    else if (walletId.includes('optima')) balance = 8500;
    else if (walletId.includes('omoney')) balance = 3400;

    txs.forEach(t => {
        if (t.type === 'income' && t.walletId === walletId) {
            balance += t.amount;
        } else if (t.type === 'expense' && t.walletId === walletId) {
            balance -= t.amount;
        } else if (t.type === 'transfer') {
            if (t.fromWalletId === walletId) balance -= t.amount;
            if (t.toWalletId === walletId) balance += t.amount;
        }
    });
    return balance;
}

// ==========================================
// 2. TRANSACTION AND SHIFT LOGIC (MUTATORS)
// ==========================================

export function addTransaction(salonId, { type, amount, walletId, fromWalletId, toWalletId, itemId, counterpartyId, description, bookingId }) {
    const activeShift = getActiveShift(salonId);
    if (!activeShift) {
        showToast('Ошибка: Кассовая смена закрыта! Откройте смену для проведения финансовых операций.');
        return null;
    }
    const txs = getTransactions(salonId);

    const newTx = {
        id: 'TX-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        salonId,
        shiftId: activeShift ? activeShift.id : null,
        type,
        amount: Number(amount),
        walletId: walletId || null,
        fromWalletId: fromWalletId || null,
        toWalletId: toWalletId || null,
        itemId: itemId || null,
        counterpartyId: counterpartyId || null,
        description: description || '',
        date: new Date().toISOString()
    };

    if (bookingId) newTx.bookingId = bookingId;

    txs.push(newTx);
    saveTransactions(salonId, txs);
    return newTx;
}

export function openShift(salonId, userName, startBalance) {
    const list = getShifts(salonId);
    if (getActiveShift(salonId)) {
        showToast('Кассовая смена уже открыта!');
        return false;
    }

    const newShift = {
        id: 'SH-' + Date.now(),
        salonId,
        openedAt: new Date().toISOString(),
        closedAt: null,
        openedBy: userName,
        closedBy: null,
        startBalance: Number(startBalance),
        endBalance: null,
        computedEndBalance: null,
        status: 'open',
        stats: null
    };

    list.unshift(newShift); // Insert at beginning so newest are first
    saveShifts(salonId, list);
    showToast('Кассовая смена успешно открыта!');
    return true;
}

export function parseBookingDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

export function getStuckBookingsForShift(salonId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return state.bookings.filter(b => {
        let belongs = false;
        if (b.type === 'salon' && b.targetId === salonId) {
            belongs = true;
        } else if (b.type === 'master') {
            const mId = b.masterId || b.targetId;
            const master = masters.find(m => String(m.id) === String(mId));
            if (master && master.salonId === salonId) {
                belongs = true;
            }
        }
        
        if (!belongs) return false;
        if (b.status !== 'pending' && b.status !== 'confirmed') return false;
        
        const bDate = parseBookingDate(b.date);
        return bDate && bDate <= today;
    });
}

export function closeShift(salonId, userName, endBalance) {
    const list = getShifts(salonId);
    const active = list.find(s => s.status === 'open');
    if (!active) {
        showToast('Нет открытой кассовой смены!');
        return false;
    }

    const stuck = getStuckBookingsForShift(salonId);
    if (stuck.length > 0) {
        showToast('Ошибка: Нельзя закрыть смену, пока есть зависшие записи за эту смену! Завершите или отмените их.');
        return false;
    }


    const txs = getTransactions(salonId).filter(t => t.shiftId === active.id);
    let netChange = 0;
    txs.forEach(t => {
        // We only track cash wallet change for cash balance, but let's compute on ALL wallets or explicitly Cash Desk
        // Let's compute net change on CASH wallets since typically "Кассовая смена" checks cash balance.
        // Or if we check total shifts money, let's track shift transactions. Let's calculate based on Cash Desk:
        const isCashDesk = (id) => id && id.includes('cash');
        if (t.type === 'income' && isCashDesk(t.walletId)) netChange += t.amount;
        if (t.type === 'expense' && isCashDesk(t.walletId)) netChange -= t.amount;
        if (t.type === 'transfer') {
            if (isCashDesk(t.toWalletId)) netChange += t.amount;
            if (isCashDesk(t.fromWalletId)) netChange -= t.amount;
        }
    });

    const computedEndBalance = active.startBalance + netChange;

    // Compile statistics: сколько клиентов завершено, отменено, сколько выручка, доход мастеров, прибыль, выплачено мастерам.
    // Filter bookings completed/cancelled or paid inside this shift
    const salonBookings = state.bookings.filter(b => b.type === 'salon' && b.targetId === salonId);
    const shiftBookings = salonBookings.filter(b => {
        return b.completedShiftId === active.id || b.cancelledShiftId === active.id || b.paidShiftId === active.id;
    });

    const completedCount = shiftBookings.filter(b => b.status === 'completed').length;
    const cancelledCount = shiftBookings.filter(b => b.status === 'cancelled').length;

    // Revenue: sum booking payments received in this shift
    let revenue = 0;
    shiftBookings.forEach(b => {
        if (b.paid && b.status === 'completed') {
            const m = masters.find(mast => mast.id === b.masterId);
            if (m && m.tariff_type === 'rent') return; // Do not count rent master revenue
            revenue += getSalonPrice(salonId, b.serviceId, services, b.masterId);
        }
    });

    // Masters' Income: sum masters share from completed bookings which are processed in shift
    let mastersIncome = 0;
    shiftBookings.forEach(b => {
        if (b.status === 'completed') {
            const m = masters.find(mast => mast.id === b.masterId);
            if (m) {
                if (m.tariff_type === 'rent') return; // Rent master doesn't earn percentages
                const price = getSalonPrice(salonId, b.serviceId, services, b.masterId);
                const pct = m.tariff_details?.percentage_value || 40;
                mastersIncome += (price * pct) / 100;
            }
        }
    });

    // Paid to masters: expenses with art-salary
    let paidToMasters = 0;
    txs.forEach(t => {
        if (t.type === 'expense' && t.itemId === 'art-salary') {
            paidToMasters += t.amount;
        }
    });

    // Profit = Revenue - Masters Commission - Other expenses (excluding masters salary which is paid out, since salary is already accrued in salon commission profit calculation)
    // Actually standard: Profit = Revenue - Masters Earned Commission - Other Expenses (like rent, goods, materials)
    let otherExpenses = 0;
    txs.forEach(t => {
        // excluding salaries to avoid double counting if salary matches masters commission
        if (t.type === 'expense' && t.itemId !== 'art-salary') {
            otherExpenses += t.amount;
        }
    });
    const computedProfit = revenue - mastersIncome - otherExpenses;

    active.closedAt = new Date().toISOString();
    active.closedBy = userName;
    active.endBalance = Number(endBalance);
    active.computedEndBalance = computedEndBalance;
    active.status = 'closed';
    active.stats = {
        clientsCompleted: completedCount,
        clientsCancelled: cancelledCount,
        revenue: revenue,
        mastersIncome: mastersIncome,
        profit: computedProfit,
        paidToMasters: paidToMasters
    };

    saveShifts(salonId, list);
    showToast('Кассовая смена успешно закрыта!');
    return true;
}


// ==========================================
// 3. UI RENDERING FOR FINANCE WORKFLOWS
// ==========================================

export function renderSalonFinanceTab(salon) {
    if (!state.financeSubTab) state.financeSubTab = 'wallets';

    const subTab = state.financeSubTab;
    const wallets = getWallets(salon.id);
    const articles = getArticles(salon.id);
    const txs = getTransactions(salon.id);
    const counterparties = getCounterparties(salon.id);

    // Filter txs
    const query = (state.txSearch || '').toLowerCase().trim();
    let filteredTxs = txs.filter(t => {
        // search in description, amount, etc.
        const descMatch = t.description && t.description.toLowerCase().includes(query);
        const amountMatch = String(t.amount).includes(query);
        const walletName = t.walletId ? (wallets.find(w => w.id === t.walletId)?.name || '') : '';
        const walletsMatch = walletName.toLowerCase().includes(query);
        const itemName = t.itemId ? (articles.find(a => a.id === t.itemId)?.name || '') : '';
        const itemsMatch = itemName.toLowerCase().includes(query);
        return !query || descMatch || amountMatch || walletsMatch || itemsMatch;
    });

    const renderWallets = () => {
        const getWalletMetrics = (w) => {
            let inflow = 0;
            let outflow = 0;
            txs.forEach(t => {
                if (t.type === 'income' && t.walletId === w.id) inflow += t.amount;
                if (t.type === 'expense' && t.walletId === w.id) outflow += t.amount;
                if (t.type === 'transfer') {
                    if (t.toWalletId === w.id) inflow += t.amount;
                    if (t.fromWalletId === w.id) outflow += t.amount;
                }
            });
            return { inflow, outflow };
        };

        return `
        <div class="space-y-6 animate-fade-in">
            <div class="flex items-center justify-between mb-4">
                <div class="text-left">
                    <h3 class="text-base font-bold text-system-text">Кошельки и Кассы</h3>
                    <p class="text-xs text-system-muted">Места накопления денежных средств салона</p>
                </div>
                <button onclick="state.showAddWalletModal = true; render();" class="px-3.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    Добавить кошелек
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${wallets.map(w => {
                    const bal = getWalletBalance(salon.id, w.id);
                    return `
                    <div class="bg-system-surface rounded-2xl border border-system-border p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div class="absolute -right-4 -bottom-4 w-20 h-20 text-system-muted opacity-[0.05] group-hover:scale-110 transition-transform select-none font-extrabold text-[80px]">
                            ${w.type === 'cash' ? '💵' : '💳'}
                        </div>
                        <div class="flex items-start justify-between mb-2">
                            <span class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${w.type === 'cash' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}">${w.type === 'cash' ? 'Наличные' : 'Безналичный'}</span>
                            <span class="text-xs font-bold text-system-muted">${w.currency}</span>
                        </div>
                        <h4 class="font-bold text-sm text-system-text mb-1 truncate text-left" title="${w.name}">${w.name}</h4>
                        <div class="text-xl font-black text-primary-600 mt-2 text-left">${formatPrice(bal)}</div>
                        
                        <!-- Редактирование и детализация -->
                        <div class="mt-4 flex flex-col gap-1 select-none font-sans">
                            <div class="flex gap-1 w-full">
                                <button onclick="state.viewingWalletId = '${w.id}'; state.showViewWalletModal = true; render();" class="flex-grow py-1 rounded-lg border border-system-border hover:bg-system-main font-bold text-[9px] text-system-muted hover:text-system-text transition-all">
                                    👁️ Детали
                                </button>
                                <button onclick="state.editingWalletId = '${w.id}'; state.showEditWalletModal = true; render();" class="flex-grow py-1 rounded-lg border border-system-border hover:bg-system-main font-bold text-[9px] text-system-muted hover:text-system-text transition-all">
                                    ✏️ Изменить
                                </button>
                            </div>
                            <div class="flex gap-1 w-full">
                                <button onclick="state.financeSubTab = 'transactions'; state.txSearch = '${w.name}'; render();" class="flex-1 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 font-bold text-[9px] text-primary-600 transition-all">
                                    📋 История
                                </button>
                                <button onclick="window.deleteWallet('${salon.id}', '${w.id}');" class="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 font-bold text-[9px] text-red-500 transition-all" title="Удалить кошелек">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>

            <!-- Детализация по кошелькам оборотов -->
            <div class="bg-system-surface rounded-2xl border border-system-border p-5 shadow-xs mt-6">
                <h4 class="font-extrabold text-sm text-system-text mb-1 text-left">Детализация оборотов по кошелькам</h4>
                <p class="text-[11px] text-system-muted mb-4 text-left">Сравнение приходов, расходов и чистых остатков по каждому расчетному счету</p>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-xs">
                        <thead>
                            <tr class="bg-system-main border-b border-system-border text-system-muted font-bold text-left">
                                <th class="p-3">Кошелек / Касса</th>
                                <th class="p-3">Тип</th>
                                <th class="p-3 text-right">Поступления (+ Приход)</th>
                                <th class="p-3 text-right font-medium text-rose-500">Списания (- Расход)</th>
                                <th class="p-3 text-right font-black">Текущий баланс</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-system-border/60">
                            ${wallets.map(w => {
                                const metrics = getWalletMetrics(w);
                                const bal = getWalletBalance(salon.id, w.id);
                                return `
                                <tr class="hover:bg-system-main/20 text-system-text">
                                    <td class="p-3 font-semibold text-left">${w.name}</td>
                                    <td class="p-3 text-left">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-medium ${w.type === 'cash' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}">
                                            ${w.type === 'cash' ? 'Наличные' : 'Безналичный'}
                                        </span>
                                    </td>
                                    <td class="p-3 text-right text-green-600 font-bold">+ ${formatPrice(metrics.inflow)}</td>
                                    <td class="p-3 text-right text-red-500 font-medium">- ${formatPrice(metrics.outflow)}</td>
                                    <td class="p-3 text-right font-black text-primary-600">${formatPrice(bal)}</td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Добавление кошелька модал -->
            ${state.showAddWalletModal ? `
                <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4" onclick="state.showAddWalletModal = false; render();">
                    <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                        <h4 class="text-lg font-extrabold text-system-text mb-4 text-left">Новый кошелек/касса</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1 text-left">Название</label>
                                <input type="text" id="new_wallet_name" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text focus:ring-2 focus:ring-primary-100 outline-none" placeholder="Например: Касса Бутик №2, MBank Салон">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs text-system-muted font-bold block mb-1 text-left">Вид оплаты</label>
                                    <select id="new_wallet_type" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none">
                                        <option value="cash">Наличный</option>
                                        <option value="bank">Безналичный</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs text-system-muted font-bold block mb-1 text-left">Валюта</label>
                                    <select id="new_wallet_currency" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none">
                                        <option value="KGS">KGS</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex gap-3 pt-2">
                                <button onclick="state.showAddWalletModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                                <button onclick="window.submitAddWallet('${salon.id}');" class="flex-1 py-3 text-sm font-bold bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Создать</button>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- Редактирование кошелька модал -->
            ${state.showEditWalletModal && state.editingWalletId ? (() => {
                const w = wallets.find(x => x.id === state.editingWalletId);
                if (!w) return '';
                return `
                <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4" onclick="state.showEditWalletModal = false; render();">
                    <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                        <h4 class="text-lg font-extrabold text-system-text mb-4 font-sans text-left">Редактирование кошелька</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1 text-left">Название</label>
                                <input type="text" id="edit_wallet_name" value="${w.name}" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text focus:ring-2 focus:ring-primary-100 outline-none">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs text-system-muted font-bold block mb-1 text-left">Вид оплаты</label>
                                    <select id="edit_wallet_type" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none">
                                        <option value="cash" ${w.type === 'cash' ? 'selected' : ''}>Наличный</option>
                                        <option value="bank" ${w.type === 'bank' ? 'selected' : ''}>Безналичный</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs text-system-muted font-bold block mb-1 text-left">Валюта</label>
                                    <select id="edit_wallet_currency" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none">
                                        <option value="KGS" ${w.currency === 'KGS' ? 'selected' : ''}>KGS</option>
                                        <option value="USD" ${w.currency === 'USD' ? 'selected' : ''}>USD</option>
                                        <option value="EUR" ${w.currency === 'EUR' ? 'selected' : ''}>EUR</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex gap-3 pt-2">
                                <button onclick="state.showEditWalletModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                                <button onclick="window.submitEditWallet('${salon.id}', '${w.id}');" class="flex-1 py-3 text-sm font-bold bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Сохранить</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            })() : ''}
        </div>`;
    };

    const renderArticles = () => {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between mb-4">
                <div class="text-left">
                    <h3 class="text-base font-bold text-system-text">Статьи Доходов и Расходов (ДР)</h3>
                    <p class="text-xs text-system-muted">Классификация финансовых потоков для отчетов прибыли</p>
                </div>
                <button onclick="state.showAddArticleModal = true; render();" class="px-3.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    Добавить статью
                </button>
            </div>

            <div class="bg-system-surface rounded-2xl border border-system-border overflow-hidden shadow-sm">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-system-main border-b border-system-border text-system-muted font-bold text-xs">
                            <th class="p-3.5 text-left">Название статьи</th>
                            <th class="p-3.5 text-left">Направление (Вид)</th>
                            <th class="p-3.5 text-center">ДДС (Движение денег)</th>
                            <th class="p-3.5 text-center">ОПУ (Прибыль/Убытки)</th>
                            <th class="p-3.5 text-center">Форм. задолженности (ДЗ/КЗ)</th>
                            <th class="p-3.5 text-center">Опции</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-system-border/60">
                        ${articles.map(a => `
                        <tr class="hover:bg-system-main/20 text-system-text">
                            <td class="p-3.5 font-semibold text-xs text-left">${a.name}</td>
                            <td class="p-3.5 text-left">
                                <span class="badge ${a.type === 'income' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}">
                                    ${a.type === 'income' ? 'Приход (Доход)' : 'Расход (Затрата)'}
                                </span>
                            </td>
                            <td class="p-3.5 text-center text-sm">${a.dds ? '✅' : '❌'}</td>
                            <td class="p-3.5 text-center text-sm">${a.opu ? '✅' : '❌'}</td>
                            <td class="p-3.5 text-center text-sm">${a.dzkz ? '✅' : '❌'}</td>
                            <td class="p-3.5 text-center flex items-center justify-center gap-1.5 font-sans">
                               <button onclick="state.viewingArticleId = '${a.id}'; state.showViewArticleModal = true; render();" class="p-1 px-2.5 bg-system-main hover:bg-system-border text-system-muted hover:text-system-text rounded font-bold text-[10px] transition-colors" title="Открыть детали">👁️</button>
                               <button onclick="state.editingArticleId = '${a.id}'; state.showEditArticleModal = true; render();" class="p-1 px-2.5 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded font-bold text-[10px] transition-colors" title="Редактировать">✏️</button>
                               <button onclick="window.deleteArticle('${salon.id}', '${a.id}');" class="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded font-bold text-[10px] transition-colors" title="Удалить">🗑️</button>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            ${state.showAddArticleModal ? `
                <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4" onclick="state.showAddArticleModal = false; render();">
                    <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                        <h4 class="text-lg font-extrabold text-system-text mb-4">Новая статья ДР</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1">Название статьи</label>
                                <input type="text" id="new_art_name" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text focus:ring-2 focus:ring-primary-100 outline-none" placeholder="Например: Закупка чая и кофе">
                            </div>
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1">Направление операции</label>
                                <select id="new_art_type" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none">
                                    <option value="income">Приход (Доход)</option>
                                    <option value="expense">Расход (Затрата)</option>
                                </select>
                            </div>
                            <div class="space-y-2 pt-2 border-t border-system-border/60">
                                <label class="text-xs text-system-muted font-bold block mb-1.5">Назначение статьи:</label>
                                <label class="flex items-center gap-3.5 cursor-pointer p-1.5 hover:bg-system-main/40 rounded-lg select-none text-xs text-system-text">
                                    <input type="checkbox" id="new_art_dds" checked class="w-4 h-4 rounded text-primary-500 focus:ring-primary-400">
                                    <div>
                                        <span class="font-bold block text-xs">Движение денег (ДДС)</span>
                                        <span class="text-[10px] text-system-muted">Статья участвует в отчетах денежного потока</span>
                                    </div>
                                </label>
                                <label class="flex items-center gap-3.5 cursor-pointer p-1.5 hover:bg-system-main/40 rounded-lg select-none text-xs text-system-text">
                                    <input type="checkbox" id="new_art_opu" checked class="w-4 h-4 rounded text-primary-500 focus:ring-primary-400">
                                    <div>
                                        <span class="font-bold block text-xs">Расчет прибыли/убытков (ОПУ)</span>
                                        <span class="text-[10px] text-system-muted">Статья влияет на операционную прибыль/убыток</span>
                                    </div>
                                </label>
                                <label class="flex items-center gap-3.5 cursor-pointer p-1.5 hover:bg-system-main/40 rounded-lg select-none text-xs text-system-text">
                                    <input type="checkbox" id="new_art_dzkz" class="w-4 h-4 rounded text-primary-500 focus:ring-primary-400">
                                    <div>
                                        <span class="font-bold block text-xs">Формирование задолженности (ДЗ/КЗ)</span>
                                        <span class="text-[10px] text-system-muted">Создает долг контрагента перед выполнением обязательств</span>
                                    </div>
                                </label>
                            </div>
                            <div class="flex gap-3 pt-2">
                                <button onclick="state.showAddArticleModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                                <button onclick="window.submitAddArticle('${salon.id}');" class="flex-1 py-3 text-sm font-bold bg-primary-505 bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Создать</button>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>`;
    };

    const renderTransactions = () => {
        return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h3 class="text-base font-bold text-system-text">Кассовые операции</h3>
                    <p class="text-xs text-system-muted">Полная история доходов, расходов и переводов денежных средств</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button onclick="state.showAddTxModal = 'income'; render();" class="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5">
                        ➕ Внести приход
                    </button>
                    <button onclick="state.showAddTxModal = 'expense'; render();" class="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5">
                        ➖ Оформить расход
                    </button>
                    <button onclick="state.showAddTxModal = 'transfer'; render();" class="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5">
                        ⇄ Перемещение
                    </button>
                </div>
            </div>

            <!-- Поиск и фильтры по транзакциям -->
            <div class="bg-system-surface p-4 rounded-2xl border border-system-border flex flex-wrap gap-3 items-center justify-between">
                <div class="relative w-full sm:w-80">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-system-muted">🔍</span>
                    <input type="text" class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-system-border bg-system-main text-system-text outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-system-muted" placeholder="Поиск по описанию, сумме, кошельку..." value="${state.txSearch || ''}" oninput="state.txSearch=this.value; render();">
                </div>
                <span class="text-xs text-system-muted">Всего операций: <b class="text-system-text">${filteredTxs.length}</b></span>
            </div>

            <!-- Таблица журнала транзакций -->
            <div class="bg-system-surface rounded-2xl border border-system-border overflow-hidden shadow-sm">
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-system-main border-b border-system-border text-system-muted font-bold text-xs">
                                <th class="p-3 text-left">Дата</th>
                                <th class="p-3 text-left">Вид</th>
                                <th class="p-3 text-left">Кошелек</th>
                                <th class="p-3 text-left">Статья движения</th>
                                <th class="p-3 text-left font-bold text-right">Сумма</th>
                                <th class="p-3 text-left">Контрагент</th>
                                <th class="p-3 text-left">Описание</th>
                                <th class="p-3 text-center">Опции</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-system-border/60">
                            ${filteredTxs.length > 0 ? filteredTxs.map(t => {
                                const wallet = t.walletId ? wallets.find(w => w.id === t.walletId) : null;
                                const fromW = t.fromWalletId ? wallets.find(w => w.id === t.fromWalletId) : null;
                                const toW = t.toWalletId ? wallets.find(w => w.id === t.toWalletId) : null;
                                const article = t.itemId ? articles.find(a => a.id === t.itemId) : null;
                                const cp = t.counterpartyId ? counterparties.find(c => c.id === t.counterpartyId) : null;
                                
                                return `
                                <tr class="hover:bg-system-main/20 text-system-text">
                                    <td class="p-3 text-xs text-system-muted whitespace-nowrap">${new Date(t.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td class="p-3">
                                        ${t.type === 'income' ? '<span class="text-green-600 font-extrabold text-xs">Приход ⇣</span>' : t.type === 'expense' ? '<span class="text-red-500 font-extrabold text-xs">Расход ⇡</span>' : '<span class="text-indigo-600 font-extrabold text-xs">Перевод ⇄</span>'}
                                    </td>
                                    <td class="p-3 text-xs whitespace-nowrap">
                                        ${t.type === 'transfer' ? `<span class="font-medium text-system-muted">${fromW?.name || 'н/д'}</span> → <span class="font-bold text-primary-600">${toW?.name || 'н/д'}</span>` : `<span class="font-medium">${wallet?.name || 'н/д'}</span>`}
                                    </td>
                                    <td class="p-3 text-xs font-semibold text-system-muted">${article ? article.name : (t.type === 'transfer' ? 'Внутренний перевод' : '-')}</td>
                                    <td class="p-3 text-right font-black text-xs ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : 'text-indigo-600'} whitespace-nowrap">
                                        ${t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}${formatPrice(t.amount)}
                                    </td>
                                    <td class="p-3 text-xs whitespace-nowrap">${cp ? cp.name : '<span class="text-system-muted opacity-60">—</span>'}</td>
                                    <td class="p-3 text-xs max-w-[200px] truncate message-wrap" title="${t.description}">${t.description || '<span class="italic opacity-50 text-[10px]">без описания</span>'}</td>
                                    <td class="p-3 text-center flex items-center justify-center gap-1.5 font-sans">
                                        <button onclick="state.viewingTransactionId = '${t.id}'; state.showViewTransactionModal = true; render();" class="p-1 px-2.5 bg-system-main hover:bg-system-border text-system-muted hover:text-system-text rounded font-bold text-[10px] transition-colors" title="Просмотр">👁️</button>
                                        <button onclick="state.editingTransactionId = '${t.id}'; state.showEditTransactionModal = true; render();" class="p-1 px-2.5 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded font-bold text-[10px] transition-colors" title="Редактировать">✏️</button>
                                        <button onclick="window.deleteTransaction('${salon.id}', '${t.id}');" class="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded font-bold text-[10px] transition-colors" title="Удалить запись">🗑️</button>
                                    </td>
                                </tr>
                                `;
                            }).join('') : `
                            <tr>
                                <td colspan="8" class="p-8 text-center text-system-muted italic text-xs">Нет операций в журнале</td>
                            </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Операционный модал -->
            ${state.showAddTxModal ? `
                <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4" onclick="state.showAddTxModal = false; render();">
                    <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                        <h4 class="text-lg font-extrabold text-system-text mb-4">
                            ${state.showAddTxModal === 'income' ? 'Внесение прихода' : state.showAddTxModal === 'expense' ? 'Формирование расхода' : 'Перемещение между кассами'}
                        </h4>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1">Сумма операции (KGS)</label>
                                <input type="number" id="tx_amount" min="1" class="w-full text-base border-2 border-primary-100 hover:border-primary-200 block text-primary-600 font-bold rounded-xl p-3 bg-system-main outline-none" placeholder="Сумма оплаты">
                            </div>

                            ${state.showAddTxModal === 'transfer' ? `
                                <div class="grid grid-cols-1 gap-4">
                                    <div>
                                        <label class="text-xs text-system-muted font-bold block mb-1">Из кошелька (Откуда)</label>
                                        <select id="tx_from_wallet" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                            ${wallets.map(w => `<option value="${w.id}">${w.name} (${formatPrice(getWalletBalance(salon.id, w.id))})</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-xs text-system-muted font-bold block mb-1">В кошелек (Куда)</label>
                                        <select id="tx_to_wallet" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                            ${wallets.map(w => `<option value="${w.id}">${w.name} (${formatPrice(getWalletBalance(salon.id, w.id))})</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                            ` : `
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs text-system-muted font-bold block mb-1">Касса/Кошелек</label>
                                        <select id="tx_wallet" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                            ${wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-xs text-system-muted font-bold block mb-1">Статья ДР</label>
                                        <select id="tx_item" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                            ${articles.filter(a => a.type === state.showAddTxModal).map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="text-xs text-system-muted font-bold block mb-1">Контрагент (Необязательно)</label>
                                    <select id="tx_counterparty" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                        <option value="">— Выберите получателя/плательщика —</option>
                                        ${counterparties.map(c => `<option value="${c.id}">${c.name} (${c.role === 'supplier' ? 'Поставщик' : 'Партнер'})</option>`).join('')}
                                    </select>
                                </div>
                            `}

                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1">Описание/Комментарий</label>
                                <textarea id="tx_description" rows="2" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-system-muted" placeholder="Назначение платежа, номер чека, накладной..."></textarea>
                            </div>
                            
                            <div class="flex gap-3 pt-2">
                                <button onclick="state.showAddTxModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                                <button onclick="window.submitAddTransaction('${salon.id}');" class="flex-1 py-3 text-sm font-bold bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Провести</button>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>`;
    };

    const renderCounterparties = () => {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="text-base font-bold text-system-text">Реестр контрагентов</h3>
                    <p class="text-xs text-system-muted">Данные поставщиков, собственников аренды, партнеров и мастеров салона</p>
                </div>
                <button onclick="state.showAddCpModal = true; render();" class="px-3.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    Добавить контрагента
                </button>
            </div>

            <div class="bg-system-surface rounded-2xl border border-system-border overflow-hidden shadow-sm">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-system-main border-b border-system-border text-system-muted font-bold text-xs">
                            <th class="p-3.5 text-left">ФИО / Название контрагента</th>
                            <th class="p-3.5 text-left">Номер телефона</th>
                            <th class="p-3.5 text-left">Категория (Роль)</th>
                            <th class="p-3.5 text-center">Опции</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-system-border/60">
                        ${counterparties.map(c => `
                        <tr class="hover:bg-system-main/20 text-system-text">
                            <td class="p-3.5 font-bold text-xs flex items-center gap-2">
                                <span class="text-base">👤</span>
                                ${c.name}
                            </td>
                            <td class="p-3.5 font-mono text-xs text-system-muted">${c.phone}</td>
                            <td class="p-3.5">
                                <span class="badge ${c.role === 'supplier' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'}">
                                    ${c.role === 'supplier' ? 'Поставщик материалов' : 'Партнер/Сотрудник'}
                                </span>
                            </td>
                            <td class="p-3.5 text-center flex items-center justify-center gap-1.5 font-sans">
                               <button onclick="state.viewingCounterpartyId = '${c.id}'; state.showViewCpModal = true; render();" class="p-1 px-2.5 bg-system-main hover:bg-system-border text-system-muted hover:text-system-text rounded font-bold text-[10px] transition-colors" title="Просмотр">👁️</button>
                               ${c.id.startsWith('master-') ? `<span class="text-[10px] text-system-muted italic font-medium select-none text-center">Синхронизирован с мастерами</span>` : `
                                   <button onclick="state.editingCounterpartyId = '${c.id}'; state.showEditCpModal = true; render();" class="p-1 px-2.5 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded font-bold text-[10px] transition-colors" title="Редактировать">✏️</button>
                                   <button onclick="window.deleteCounterparty('${salon.id}', '${c.id}');" class="p-1 px-2.5 text-red-500 hover:bg-red-50 rounded font-bold text-[10px] transition-colors" title="Удалить">🗑️</button>
                               `}
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            ${state.showAddCpModal ? `
                <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4" onclick="state.showAddCpModal = false; render();">
                    <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                        <h4 class="text-lg font-extrabold text-system-text mb-4">Новый контрагент</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1">ФИО или Название компании</label>
                                <input type="text" id="new_cp_name" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text focus:ring-2 focus:ring-primary-100 outline-none" placeholder="Например: Сапарбек (Отопление), ТД Ромашка">
                            </div>
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1">Номер телефона</label>
                                <input type="text" id="new_cp_phone" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text focus:ring-2 focus:ring-primary-100 outline-none" placeholder="Например: +996 550 123 456">
                            </div>
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1">Роль контрагента</label>
                                <select id="new_cp_role" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none">
                                    <option value="supplier">Поставщик услуг/материалов</option>
                                    <option value="partner">Партнер / Прочее</option>
                                </select>
                            </div>
                            <div class="flex gap-3 pt-2">
                                <button onclick="state.showAddCpModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                                <button onclick="window.submitAddCounterparty('${salon.id}');" class="flex-1 py-3 text-sm font-bold bg-primary-505 bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Добавить</button>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>`;
    };

    const renderCashFlow = () => {
        // Simple aggregate Cash Flow: Group incomes and expenses by Articles
        const incomes = filteredTxs.filter(t => t.type === 'income');
        const expenses = filteredTxs.filter(t => t.type === 'expense');

        const incByArt = {};
        let totalInc = 0;
        incomes.forEach(t => {
            const artId = t.itemId || 'other';
            const artName = articles.find(a => a.id === artId)?.name || 'Прочие поступления';
            incByArt[artName] = (incByArt[artName] || 0) + t.amount;
            totalInc += t.amount;
        });

        const expByArt = {};
        let totalExp = 0;
        expenses.forEach(t => {
            const artId = t.itemId || 'other';
            const artName = articles.find(a => a.id === artId)?.name || 'Прочие затраты';
            expByArt[artName] = (expByArt[artName] || 0) + t.amount;
            totalExp += t.amount;
        });

        const netCF = totalInc - totalExp;

        return `
        <div class="space-y-6">
            <div>
                <h3 class="text-base font-bold text-system-text">Отчет ДДС (Движение денежных средств)</h3>
                <p class="text-xs text-system-muted">Сводный отчет по статьям денежных потоков салона</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="bg-green-50/50 p-4 border border-green-100 rounded-2xl">
                    <span class="text-xs text-green-700 font-bold block uppercase mb-1">Всего поступлений (Приход)</span>
                    <span class="text-2xl font-black text-green-600">${formatPrice(totalInc)}</span>
                </div>
                <div class="bg-red-50/50 p-4 border border-red-100 rounded-2xl">
                    <span class="text-xs text-red-600 font-bold block uppercase mb-1">Всего выплат (Расход)</span>
                    <span class="text-2xl font-black text-red-500">${formatPrice(totalExp)}</span>
                </div>
                <div class="p-4 border ${netCF >= 0 ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700' : 'bg-orange-50/50 border-orange-100 text-orange-700'} rounded-2xl">
                    <span class="text-xs font-bold block uppercase mb-1">Чистый денежный поток (Net Cash Flow)</span>
                    <span class="text-2xl font-black">${formatPrice(netCF)}</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Incomes Table -->
                <div class="bg-system-surface rounded-2xl border border-system-border p-4 shadow-sm">
                    <h4 class="font-extrabold text-sm text-green-700 mb-3 border-b border-system-border/60 pb-2 flex justify-between">
                        <span>Поступления (Доходы)</span>
                        <span>${formatPrice(totalInc)}</span>
                    </h4>
                    <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
                        ${Object.keys(incByArt).map(name => `
                            <div class="flex items-center justify-between text-xs py-1.5 hover:bg-system-main/40 px-2 rounded-lg transition-colors text-system-text">
                                <span class="font-medium">${name}</span>
                                <span class="font-bold text-green-600">${formatPrice(incByArt[name])}</span>
                            </div>
                        `).join('')}
                        ${Object.keys(incByArt).length === 0 ? '<p class="text-xs text-system-muted italic py-5 text-center">Нет поступлений</p>' : ''}
                    </div>
                </div>

                <!-- Expenses Table -->
                <div class="bg-system-surface rounded-2xl border border-system-border p-4 shadow-sm">
                    <h4 class="font-extrabold text-sm text-red-600 mb-3 border-b border-system-border/60 pb-2 flex justify-between">
                        <span>Выплаты (Расходы)</span>
                        <span>${formatPrice(totalExp)}</span>
                    </h4>
                    <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
                        ${Object.keys(expByArt).map(name => `
                            <div class="flex items-center justify-between text-xs py-1.5 hover:bg-system-main/40 px-2 rounded-lg transition-colors text-system-text">
                                <span class="font-medium">${name}</span>
                                <span class="font-bold text-red-500">${formatPrice(expByArt[name])}</span>
                            </div>
                        `).join('')}
                        ${Object.keys(expByArt).length === 0 ? '<p class="text-xs text-system-muted italic py-5 text-center">Нет выплат</p>' : ''}
                    </div>
                </div>
            </div>
        </div>`;
    };


    const renderDebts = () => {
        const debts = getDebts(salon.id);
        const counterparties = getCounterparties(salon.id);

        let totalReceivable = 0; // ДЗ (Нам должны)
        let totalPayable = 0;    // КЗ (Мы должны)

        debts.forEach(d => {
            if (d.type === 'receivable') totalReceivable += d.amount;
            if (d.type === 'payable') totalPayable += d.amount;
        });

        return `
        <div class="space-y-6 animate-fade-in">
            <div class="flex items-center justify-between mb-4">
                <div class="text-left">
                    <h3 class="text-base font-bold text-system-text">Учет задолженностей (ДЗ / КЗ)</h3>
                    <p class="text-xs text-system-muted">Контроль взаиморасчетов, дебиторской (нам должны) и кредиторской (мы должны) задолженностей</p>
                </div>
                <button onclick="state.showAddDebtModal = true; render();" class="px-3.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    Добавить задолженность
                </button>
            </div>

            <!-- KPI Cards Block -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-left">
                <div class="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                    <div class="absolute -right-4 -bottom-4 text-indigo-400 opacity-10 text-[72px] font-black pointer-events-none select-none">ДЗ</div>
                    <span class="text-xs text-indigo-700 font-extrabold uppercase tracking-wider block mb-1">Дебиторская задолженность (Нам должны)</span>
                    <span class="text-2xl font-black text-indigo-600">${formatPrice(totalReceivable)}</span>
                    <p class="text-[10px] text-indigo-500 mt-1">Сумма долга контрагентов и клиентов перед салоном</p>
                </div>
                
                <div class="bg-rose-50/40 border border-rose-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                    <div class="absolute -right-4 -bottom-4 text-rose-400 opacity-10 text-[72px] font-black pointer-events-none select-none">КЗ</div>
                    <span class="text-xs text-rose-700 font-extrabold uppercase tracking-wider block mb-1">Кредиторская задолженность (Мы должны)</span>
                    <span class="text-2xl font-black text-rose-600">${formatPrice(totalPayable)}</span>
                    <p class="text-[10px] text-rose-500 mt-1">Обязательства салона перед поставщиками, партнерами и персоналом</p>
                </div>
            </div>

            <!-- Debts Table -->
            <div class="bg-system-surface rounded-2xl border border-system-border overflow-hidden shadow-sm">
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-xs">
                        <thead>
                            <tr class="bg-system-main border-b border-system-border text-system-muted font-bold text-left">
                                <th class="p-3">Дата формирования</th>
                                <th class="p-3">Контрагент / ФИО</th>
                                <th class="p-3">Вид задолженности</th>
                                <th class="p-3 text-right">Сумма долга</th>
                                <th class="p-3">Основание / Примечание</th>
                                <th class="p-3 text-center">Действия</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-system-border/60">
                            ${debts.length > 0 ? debts.map(d => {
                                const cp = counterparties.find(c => c.id === d.counterpartyId);
                                return `
                                <tr class="hover:bg-system-main/20 text-system-text">
                                    <td class="p-3 text-left text-system-muted font-medium whitespace-nowrap">${new Date(d.createdAt).toLocaleDateString('ru-RU')}</td>
                                    <td class="p-3 text-left font-bold text-system-text">
                                        👤 ${cp ? cp.name : 'Неизвестно'}
                                    </td>
                                    <td class="p-3 text-left">
                                        ${d.type === 'receivable' ? `
                                            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                                                ДЗ (Нам должны)
                                            </span>
                                        ` : `
                                            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wide">
                                                КЗ (Мы должны)
                                            </span>
                                        `}
                                    </td>
                                    <td class="p-3 text-right font-black ${d.type === 'receivable' ? 'text-indigo-600' : 'text-rose-600'} whitespace-nowrap">
                                        ${formatPrice(d.amount)}
                                    </td>
                                    <td class="p-3 text-left max-w-xs truncate" title="${d.description}">${d.description || '—'}</td>
                                    <td class="p-3 text-center flex items-center justify-center gap-1.5 whitespace-nowrap">
                                        <button onclick="window.payOrResolveDebt('${salon.id}', '${d.id}');" class="p-1 px-2.5 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-bold text-[10px] transition-colors border border-green-200" title="Зафиксировать погашение долга">Погасить долг</button>
                                        <button onclick="window.deleteDebt('${salon.id}', '${d.id}');" class="p-1 px-2.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 font-bold text-[10px] transition-colors border border-red-200" title="Удалить">Удалить</button>
                                    </td>
                                </tr>
                                `;
                            }).join('') : `
                            <tr>
                                <td colspan="6" class="p-8 text-center text-system-muted italic text-xs">Активных долгов или обязательств не зафиксировано</td>
                            </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal for Adding Debt -->
            ${state.showAddDebtModal ? `
                <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4" onclick="state.showAddDebtModal = false; render();">
                    <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                        <h4 class="text-lg font-extrabold text-system-text mb-4 text-left font-sans">Новое обязательство / задолженность</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1 text-left">Выберите контрагента</label>
                                <select id="debt_counterparty" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                    ${counterparties.map(c => `<option value="\${c.id}">\${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1 text-left">Тип обязательства</label>
                                <select id="debt_type" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                    <option value="receivable">Дебиторская задолженность (Нам должны)</option>
                                    <option value="payable">Кредиторская задолженность (Мы должны)</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1 text-left">Сумма (KGS)</label>
                                <input type="number" id="debt_amount" min="1" class="w-full text-base border-2 border-primary-100 hover:border-primary-200 block text-primary-600 font-bold rounded-xl p-3 bg-system-main outline-none" placeholder="Сумма долга">
                            </div>
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1 text-left">Основание / Описание долга</label>
                                <textarea id="debt_description" rows="2" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-system-muted" placeholder="Например: Закупка партии лаков Estel Professional, Накладная №31"></textarea>
                            </div>
                            <div class="flex gap-3 pt-2">
                                <button onclick="state.showAddDebtModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                                <button onclick="window.submitAddDebt('${salon.id}');" class="flex-1 py-3 text-sm font-bold bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Создать задолженность</button>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>`;
    };

    return `
    <div class="animate-fade-in p-2">
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-system-border">
            <div>
                <h1 class="text-2xl font-black text-system-text flex items-center gap-2">
                    <span>🏦</span> Финансовый модуль салона
                </h1>
                <p class="text-xs text-system-muted mt-0.5">Управление доходами, расходами, кассами и статьями ДДС</p>
            </div>
        </div>

        <!-- Вкладки подмодулей -->
        <div class="flex items-center gap-1 mb-6 border-b border-system-border pb-1 overflow-x-auto hide-scrollbar select-none">
            <button onclick="state.financeSubTab='wallets'; render();" class="px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${subTab === 'wallets' ? 'border-primary-500 text-primary-600 font-extrabold' : 'border-transparent text-system-muted hover:text-system-text'}">💵 Кошельки и кассы</button>
            <button onclick="state.financeSubTab='articles'; render();" class="px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${subTab === 'articles' ? 'border-primary-500 text-primary-600 font-extrabold' : 'border-transparent text-system-muted hover:text-system-text'}">📂 Статьи ДР</button>
            <button onclick="state.financeSubTab='transactions'; render();" class="px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${subTab === 'transactions' ? 'border-primary-500 text-primary-600 font-extrabold' : 'border-transparent text-system-muted hover:text-system-text'}">📝 Журнал операций</button>
            <button onclick="state.financeSubTab='counterparties'; render();" class="px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${subTab === 'counterparties' ? 'border-primary-500 text-primary-600 font-extrabold' : 'border-transparent text-system-muted hover:text-system-text'}">👤 Контрагенты</button>
            <button onclick="state.financeSubTab='debts'; render();" class="px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${subTab === 'debts' ? 'border-primary-500 text-primary-600 font-extrabold' : 'border-transparent text-system-muted hover:text-system-text'}">🤝 Задолженность (ДЗ/КЗ)</button>
            <button onclick="state.financeSubTab='cashflow'; render();" class="px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${subTab === 'cashflow' ? 'border-primary-500 text-primary-600 font-extrabold' : 'border-transparent text-system-muted hover:text-system-text'}">📊 Аналитика (ДДС)</button>
        </div>

        <div class="bg-system-surface rounded-2xl border border-system-border p-5 shadow-sm min-h-[300px]">
            ${subTab === 'wallets' ? renderWallets() : ''}
            ${subTab === 'articles' ? renderArticles() : ''}
            ${subTab === 'transactions' ? renderTransactions() : ''}
            ${subTab === 'counterparties' ? renderCounterparties() : ''}
            ${subTab === 'debts' ? renderDebts() : ''}
            ${subTab === 'cashflow' ? renderCashFlow() : ''}
        </div>

        <!-- View & Edit overlays for various finance directories & transactions (CRUD requirement) -->
        ${state.showViewWalletModal && state.viewingWalletId ? (() => {
            const w = wallets.find(x => x.id === state.viewingWalletId);
            if (!w) return '';
            const bal = getWalletBalance(salon.id, w.id);
            return `
            <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4 animate-fade-in" onclick="state.showViewWalletModal = false; render();">
                <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-sm p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                    <h4 class="text-lg font-extrabold text-system-text mb-4 text-left font-sans flex items-center gap-2">
                        <span>${w.type === 'cash' ? '💵' : '💳'}</span> Просмотр кошелька
                    </h4>
                    <div class="space-y-4 text-left font-sans">
                        <div class="bg-system-main p-3.5 rounded-2xl border border-system-border">
                            <p class="text-[10px] text-system-muted font-bold uppercase tracking-wider mb-0.5">Баланс кошелька</p>
                            <p class="text-xl font-black text-primary-600">${formatPrice(bal)}</p>
                        </div>
                        <div class="space-y-2.5">
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-xs text-system-muted font-bold">Название:</span>
                                <span class="text-xs font-black text-system-text">${w.name}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-xs text-system-muted font-bold">Тип оплаты:</span>
                                <span class="text-xs font-black text-system-text">${w.type === 'cash' ? 'Наличный кошелек' : 'Безналичный счет'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-xs text-system-muted font-bold">Валюта хранения:</span>
                                <span class="text-xs font-black text-system-text font-mono">${w.currency}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onclick="state.showViewWalletModal = false; state.editingWalletId = '${w.id}'; state.showEditWalletModal = true; render();" class="flex-grow py-2 rounded-xl text-xs font-bold bg-primary-500 text-white hover:bg-primary-600 shadow-sm transition-all">✏️ Изменить</button>
                            <button onclick="state.showViewWalletModal = false; render();" class="px-4 py-2 text-xs font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-all">Закрыть</button>
                        </div>
                    </div>
                </div>
            </div>`;
        })() : ''}

        ${state.showViewArticleModal && state.viewingArticleId ? (() => {
            const a = articles.find(x => x.id === state.viewingArticleId);
            if (!a) return '';
            return `
            <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4 animate-fade-in" onclick="state.showViewArticleModal = false; render();">
                <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-sm p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                    <h4 class="text-lg font-extrabold text-system-text mb-4 text-left font-sans flex items-center gap-2">
                        <span>📂</span> Просмотр статьи ДР
                    </h4>
                    <div class="space-y-4 text-left font-sans">
                        <div class="p-3.5 rounded-xl bg-system-main border border-system-border">
                            <p class="text-[10px] text-system-muted font-bold uppercase mb-0.5">Название финансовой статьи</p>
                            <p class="font-extrabold text-system-text text-sm">${a.name}</p>
                        </div>
                        <div class="space-y-2.5 text-xs">
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Направление:</span>
                                <span class="font-black text-system-text">${a.type === 'income' ? '📈 Приход (Доход)' : '📉 Расход (Затрата)'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Участие в ДДС (Поток денег):</span>
                                <span class="font-black text-system-text">${a.dds ? '✅ Да' : '❌ Нет'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Расчет прибыли (ОПУ):</span>
                                <span class="font-black text-system-text">${a.opu ? '✅ Да' : '❌ Нет'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Форм. задолженности ДЗ/КЗ:</span>
                                <span class="font-black text-system-text">${a.dzkz ? '✅ Да' : '❌ Нет'}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onclick="state.showViewArticleModal = false; state.editingArticleId = '${a.id}'; state.showEditArticleModal = true; render();" class="flex-grow py-2 text-xs font-bold bg-primary-500 text-white hover:bg-primary-600 shadow-sm transition-all">✏️ Изменить</button>
                            <button onclick="state.showViewArticleModal = false; render();" class="px-4 py-2 text-xs font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-all">Закрыть</button>
                        </div>
                    </div>
                </div>
            </div>`;
        })() : ''}

        ${state.showEditArticleModal && state.editingArticleId ? (() => {
            const a = articles.find(x => x.id === state.editingArticleId);
            if (!a) return '';
            return `
            <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4" onclick="state.showEditArticleModal = false; render();">
                <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                    <h4 class="text-lg font-extrabold text-system-text mb-4 text-left font-sans">Редактирование статьи ДР</h4>
                    <div class="space-y-4 font-sans">
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">Название статьи</label>
                            <input type="text" id="edit_art_name" value="${a.name}" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text focus:ring-2 focus:ring-primary-100 outline-none">
                        </div>
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">Направление операции</label>
                            <select id="edit_art_type" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                <option value="income" ${a.type === 'income' ? 'selected' : ''}>Приход (Доход)</option>
                                <option value="expense" ${a.type === 'expense' ? 'selected' : ''}>Расход (Затрата)</option>
                            </select>
                        </div>
                        <div class="space-y-2 pt-2 border-t border-system-border/60 text-left">
                            <label class="text-xs text-system-muted font-bold block mb-1.5">Параметры аналитики статьи:</label>
                            <label class="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-system-main/40 rounded-lg select-none text-xs text-system-text">
                                <input type="checkbox" id="edit_art_dds" ${a.dds ? 'checked' : ''} class="w-4 h-4 rounded border-system-border text-primary-500 focus:ring-primary-400">
                                <div>
                                    <span class="font-extrabold block text-xs">Движение денег (ДДС)</span>
                                    <span class="text-[10px] text-system-muted mt-0.5 block line-clamp-1">Отображается в отчетах фактического притока средств</span>
                                </div>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-system-main/40 rounded-lg select-none text-xs text-system-text">
                                <input type="checkbox" id="edit_art_opu" ${a.opu ? 'checked' : ''} class="w-4 h-4 rounded border-system-border text-primary-500 focus:ring-primary-400">
                                <div>
                                    <span class="font-extrabold block text-xs">Расчет прибыли/убытков (ОПУ)</span>
                                    <span class="text-[10px] text-system-muted mt-0.5 block line-clamp-1">Влияет на чистую рентабельность операционного бизнеса</span>
                                </div>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-system-main/40 rounded-lg select-none text-xs text-system-text">
                                <input type="checkbox" id="edit_art_dzkz" ${a.dzkz ? 'checked' : ''} class="w-4 h-4 rounded border-system-border text-primary-500 focus:ring-primary-400">
                                <div>
                                    <span class="font-extrabold block text-xs">Формирование задолженности (ДЗ/КЗ)</span>
                                    <span class="text-[10px] text-system-muted mt-0.5 block line-clamp-1">Создает обязательства контрагента</span>
                                </div>
                            </label>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button onclick="state.showEditArticleModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                            <button onclick="window.submitEditArticle('${salon.id}', '${a.id}');" class="flex-1 py-3 text-sm font-bold bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Сохранить изменения</button>
                        </div>
                    </div>
                </div>
            </div>`;
        })() : ''}

        ${state.showViewCpModal && state.viewingCounterpartyId ? (() => {
            const c = counterparties.find(x => x.id === state.viewingCounterpartyId);
            if (!c) return '';
            return `
            <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4 animate-fade-in" onclick="state.showViewCpModal = false; render();">
                <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-sm p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                    <h4 class="text-lg font-extrabold text-system-text mb-4 text-left font-sans flex items-center gap-2">
                        <span>👤</span> Просмотр контрагента
                    </h4>
                    <div class="space-y-4 text-left font-sans">
                        <div class="p-4 rounded-xl bg-system-main border border-system-border text-center">
                            <div class="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto text-xl font-bold mb-2">
                                ${c.name.charAt(0)}
                            </div>
                            <p class="font-extrabold text-system-text text-sm">${c.name}</p>
                            <p class="text-xs text-system-muted font-mono mt-1">${c.phone}</p>
                        </div>
                        <div class="space-y-2.5 text-xs">
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Роль в реестре:</span>
                                <span class="font-black text-system-text">${c.role === 'supplier' ? 'Поставщик материалов / арендодатель' : 'Инвестор / Партнер / Другое'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Код ID:</span>
                                <span class="font-mono text-xs text-system-muted">${c.id}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 pt-2">
                            ${!c.id.startsWith('master-') ? `
                                <button onclick="state.showViewCpModal = false; state.editingCounterpartyId = '${c.id}'; state.showEditCpModal = true; render();" class="flex-grow py-2 text-xs font-bold bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-sm transition-all">✏️ Изменить</button>
                            ` : ''}
                            <button onclick="state.showViewCpModal = false; render();" class="px-4 py-2 text-xs font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-all">Закрыть</button>
                        </div>
                    </div>
                </div>
            </div>`;
        })() : ''}

        ${state.showEditCpModal && state.editingCounterpartyId ? (() => {
            const c = counterparties.find(x => x.id === state.editingCounterpartyId);
            if (!c) return '';
            return `
            <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4 font-sans" onclick="state.showEditCpModal = false; render();">
                <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                    <h4 class="text-lg font-extrabold text-system-text mb-4 text-left">Редактирование контрагента</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">ФИО или Название контрагента</label>
                            <input type="text" id="edit_cp_name" value="${c.name}" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text focus:ring-2 focus:ring-primary-100 outline-none">
                        </div>
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">Номер телефона</label>
                            <input type="text" id="edit_cp_phone" value="${c.phone}" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text focus:ring-2 focus:ring-primary-100 outline-none">
                        </div>
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">Категория контрагента</label>
                            <select id="edit_cp_role" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                <option value="supplier" ${c.role === 'supplier' ? 'selected' : ''}>Поставщик услуг/материалов/аренды</option>
                                <option value="partner" ${c.role === 'partner' ? 'selected' : ''}>Партнер / Прочее</option>
                            </select>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button onclick="state.showEditCpModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                            <button onclick="window.submitEditCounterparty('${salon.id}', '${c.id}');" class="flex-grow py-3 text-sm font-bold bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Сохранить</button>
                        </div>
                    </div>
                </div>
            </div>`;
        })() : ''}

        ${state.showViewDebtModal && state.viewingDebtId ? (() => {
            const d = debts.find(x => x.id === state.viewingDebtId);
            if (!d) return '';
            const cp = counterparties.find(x => x.id === d.counterpartyId);
            return `
            <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4 animate-fade-in" onclick="state.showViewDebtModal = false; render();">
                <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-sm p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                    <h4 class="text-lg font-extrabold text-system-text mb-4 text-left font-sans flex items-center gap-2">
                        <span>🤝</span> Детали обязательства
                    </h4>
                    <div class="space-y-4 text-left font-sans">
                        <div class="p-3.5 rounded-xl bg-system-main border border-system-border">
                            <p class="text-[10px] text-system-muted font-bold uppercase mb-0.5">Взаиморасчет (Сумма долга)</p>
                            <p class="text-xl font-black ${d.type === 'receivable' ? 'text-green-600' : 'text-rose-600'}">${formatPrice(d.amount)}</p>
                        </div>
                        <div class="space-y-2.5 text-xs">
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Контрагент:</span>
                                <span class="font-black text-system-text">👤 ${cp ? cp.name : 'Неизвестно'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Классификация долга:</span>
                                <span class="font-black ${d.type === 'receivable' ? 'text-indigo-600' : 'text-rose-600'}">
                                    ${d.type === 'receivable' ? 'Дебиторская задолженность (Нам должны)' : 'Кредиторская задолженность (Мы должны)'}
                                </span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Комментарий / Накладная:</span>
                                <span class="font-black text-system-text text-right max-w-[200px] truncate" title="${d.description || ''}">${d.description || '—'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Дата регистрации:</span>
                                <span class="font-mono text-system-text font-bold">${new Date(d.createdAt).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onclick="state.showViewDebtModal = false; state.editingDebtId = '${d.id}'; state.showEditDebtModal = true; render();" class="flex-grow py-2 text-xs font-bold bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-sm transition-all">✏️ Изменить</button>
                            <button onclick="state.showViewDebtModal = false; render();" class="px-4 py-2 text-xs font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-all">Закрыть</button>
                        </div>
                    </div>
                </div>
            </div>`;
        })() : ''}

        ${state.showEditDebtModal && state.editingDebtId ? (() => {
            const d = debts.find(x => x.id === state.editingDebtId);
            if (!d) return '';
            return `
            <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4 font-sans" onclick="state.showEditDebtModal = false; render();">
                <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                    <h4 class="text-lg font-extrabold text-system-text mb-4 text-left">Редактирование задолженности</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">Выберите контрагента</label>
                            <select id="edit_debt_counterparty" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                ${counterparties.map(c => `<option value="${c.id}" ${d.counterpartyId === c.id ? 'selected' : ''}>${c.name} (${c.role === 'supplier' ? 'Поставщик' : 'Партнер'})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">Вид обязательства</label>
                            <select id="edit_debt_type" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                <option value="payable" ${d.type === 'payable' ? 'selected' : ''}>КЗ (Салон должен контрагенту)</option>
                                <option value="receivable" ${d.type === 'receivable' ? 'selected' : ''}>ДЗ (Контрагент должен салону)</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">Сумма обязательства (KGS)</label>
                            <input type="number" id="edit_debt_amount" value="${d.amount}" min="1" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text focus:ring-2 focus:ring-primary-100 outline-none">
                        </div>
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">Основание долга</label>
                            <textarea id="edit_debt_description" rows="2" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none focus:ring-2 focus:ring-primary-100">${d.description || ''}</textarea>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button onclick="state.showEditDebtModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                            <button onclick="window.submitEditDebt('${salon.id}', '${d.id}');" class="flex-grow py-3 text-sm font-bold bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Сохранить</button>
                        </div>
                     </div>
                </div>
            </div>`;
        })() : ''}

        ${state.showViewTransactionModal && state.viewingTransactionId ? (() => {
            const t = txs.find(x => x.id === state.viewingTransactionId);
            if (!t) return '';
            const wallet = t.walletId ? wallets.find(w => w.id === t.walletId) : null;
            const fromW = t.fromWalletId ? wallets.find(w => w.id === t.fromWalletId) : null;
            const toW = t.toWalletId ? wallets.find(w => w.id === t.toWalletId) : null;
            const article = t.itemId ? articles.find(a => a.id === t.itemId) : null;
            const cp = t.counterpartyId ? counterparties.find(c => c.id === t.counterpartyId) : null;
            return `
            <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4 animate-fade-in font-sans" onclick="state.showViewTransactionModal = false; render();">
                <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-sm p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                    <h4 class="text-lg font-extrabold text-system-text mb-4 text-left flex items-center gap-2">
                        <span>📝</span> Детали операции
                    </h4>
                    <div class="space-y-4 text-left">
                        <div class="p-4 rounded-xl bg-system-main border border-system-border">
                            <p class="text-[10px] text-system-muted font-bold uppercase tracking-wider mb-0.5">Сумма проводки</p>
                            <p class="text-2xl font-black ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : 'text-indigo-600'}">
                                ${t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}${formatPrice(t.amount)}
                            </p>
                        </div>
                        <div class="space-y-2.5 text-xs">
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Тип операции:</span>
                                <span class="font-black text-system-text">${t.type === 'income' ? '📈 Приход' : t.type === 'expense' ? '📉 Расход' : '⇄ Внутренний перевод'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Касса/Счет:</span>
                                <span class="font-black text-system-text">${t.type === 'transfer' ? `${fromW?.name || 'н/д'} → ${toW?.name || 'н/д'}` : `${wallet?.name || 'н/д'}`}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Статья ДДС:</span>
                                <span class="font-black text-system-text">${article ? article.name : (t.type === 'transfer' ? 'Внутренний перевод касс' : '—')}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Контрагент:</span>
                                <span class="font-black text-system-text">👤 ${cp ? cp.name : '—'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Комментарий:</span>
                                <span class="font-black text-system-text">${t.description || '—'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-system-border/60">
                                <span class="text-system-muted font-bold">Время внесения:</span>
                                <span class="font-mono text-system-text font-bold">${new Date(t.date).toLocaleString('ru-RU')}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onclick="state.showViewTransactionModal = false; state.editingTransactionId = '${t.id}'; state.showEditTransactionModal = true; render();" class="flex-grow py-2 text-xs font-bold bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-sm transition-all">✏️ Изменить</button>
                            <button onclick="state.showViewTransactionModal = false; render();" class="px-4 py-2 text-xs font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-all">Закрыть</button>
                        </div>
                    </div>
                </div>
            </div>`;
        })() : ''}

        ${state.showEditTransactionModal && state.editingTransactionId ? (() => {
            const t = txs.find(x => x.id === state.editingTransactionId);
            if (!t) return '';
            return `
            <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4 font-sans" onclick="state.showEditTransactionModal = false; render();">
                <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                    <h4 class="text-lg font-extrabold text-system-text mb-4 text-left">Редактирование кассовой операции</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="text-xs text-system-muted font-bold block mb-1 text-left">Сумма операции (KGS)</label>
                            <input type="number" id="edit_tx_amount" value="${t.amount}" min="1" class="w-full text-base border-2 border-primary-100 hover:border-primary-200 block text-primary-600 font-extrabold rounded-xl p-3 bg-system-main outline-none">
                        </div>
                        
                        ${t.type === 'transfer' ? `
                            <div class="grid grid-cols-1 gap-4 text-left">
                                <div>
                                    <label class="text-xs text-system-muted font-bold block mb-1">Из кошелька (Откуда)</label>
                                    <select id="edit_tx_from_wallet" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                        ${wallets.map(w => `<option value="${w.id}" ${t.fromWalletId === w.id ? 'selected' : ''}>${w.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs text-system-muted font-bold block mb-1">В кошелек (Куда)</label>
                                    <select id="edit_tx_to_wallet" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                        ${wallets.map(w => `<option value="${w.id}" ${t.toWalletId === w.id ? 'selected' : ''}>${w.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                        ` : `
                            <div class="grid grid-cols-2 gap-4 text-left">
                                <div>
                                    <label class="text-xs text-system-muted font-bold block mb-1">Касса/Кошелек</label>
                                    <select id="edit_tx_wallet" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                        ${wallets.map(w => `<option value="${w.id}" ${t.walletId === w.id ? 'selected' : ''}>${w.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs text-system-muted font-bold block mb-1">Статья ДР</label>
                                    <select id="edit_tx_item" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                        ${articles.filter(a => a.type === t.type).map(a => `<option value="${a.id}" ${t.itemId === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="text-left">
                                <label class="text-xs text-system-muted font-bold block mb-1">Контрагент (Необязательно)</label>
                                <select id="edit_tx_counterparty" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-semibold text-system-text outline-none">
                                    <option value="">— Выберите получателя/плательщика —</option>
                                    ${counterparties.map(c => `<option value="${c.id}" ${t.counterpartyId === c.id ? 'selected' : ''}>${c.name} (${c.role === 'supplier' ? 'Поставщик' : 'Партнер'})</option>`).join('')}
                                </select>
                            </div>
                        `}
                        
                        <div class="text-left">
                            <label class="text-xs text-system-muted font-bold block mb-1">Описание/Комментарий</label>
                            <textarea id="edit_tx_description" rows="2" class="w-full text-xs border border-system-border rounded-xl p-3 bg-system-main font-medium text-system-text outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-system-muted">${t.description || ''}</textarea>
                        </div>
                        
                        <div class="flex gap-3 pt-2">
                            <button onclick="state.showEditTransactionModal = false; render();" class="flex-1 py-3 text-sm font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                            <button onclick="window.submitEditTransaction('${salon.id}', '${t.id}');" class="flex-grow py-3 text-sm font-bold bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Сохранить</button>
                        </div>
                    </div>
                </div>
            </div>`;
        })() : ''}
    </div>`;
}

export function renderSalonCashShiftTab(salon) {
    const active = getActiveShift(salon.id);
    const shiftsLog = getShifts(salon.id);

    // Calculate current shift dynamic metrics
    let showActiveStats = '';
    if (active) {
        const stuckBookings = getStuckBookingsForShift(salon.id);
        const txs = getTransactions(salon.id).filter(t => t.shiftId === active.id);
        const salonBookings = state.bookings.filter(b => b.type === 'salon' && b.targetId === salon.id);
        const shiftBookings = salonBookings.filter(b => b.completedShiftId === active.id || b.cancelledShiftId === active.id || b.paidShiftId === active.id);

        const compCount = shiftBookings.filter(b => b.status === 'completed').length;
        const cancCount = shiftBookings.filter(b => b.status === 'cancelled').length;
        
        let revenue = 0;
        shiftBookings.forEach(b => {
            if (b.paid && b.status === 'completed') {
                const m = masters.find(mast => mast.id === b.masterId);
                if (m && m.tariff_type === 'rent') return;
                revenue += getSalonPrice(salon.id, b.serviceId, services, b.masterId);
            }
        });

        let mastersIncome = 0;
        shiftBookings.forEach(b => {
            if (b.status === 'completed') {
                const m = masters.find(mast => mast.id === b.masterId);
                if (m) {
                    if (m.tariff_type === 'rent') return;
                    const price = getSalonPrice(salon.id, b.serviceId, services, b.masterId);
                    const pct = m.tariff_details?.percentage_value || 40;
                    mastersIncome += (price * pct) / 100;
                }
            }
        });

        let paidToMastersAvailable = 0;
        let expenses = 0;
        txs.forEach(t => {
            if (t.type === 'expense') {
                expenses += t.amount;
                if (t.itemId === 'art-salary') {
                    paidToMastersAvailable += t.amount;
                }
            }
        });

        // Compute running balance for cash desk:
        let cashDeskNet = 0;
        txs.forEach(t => {
            const isCashDesk = (id) => id && id.includes('cash');
            if (t.type === 'income' && isCashDesk(t.walletId)) cashDeskNet += t.amount;
            if (t.type === 'expense' && isCashDesk(t.walletId)) cashDeskNet -= t.amount;
            if (t.type === 'transfer') {
                if (isCashDesk(t.toWalletId)) cashDeskNet += t.amount;
                if (isCashDesk(t.fromWalletId)) cashDeskNet -= t.amount;
            }
        });
        const currentDeskCash = active.startBalance + cashDeskNet;

        showActiveStats = `
        <div class="space-y-6">
            <div class="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm font-black animate-pulse">●</div>
                    <div>
                        <h3 class="font-extrabold text-sm text-amber-800">Кассовая смена ОТКРЫТА</h3>
                        <p class="text-xs text-amber-700">Начало смены: <b class="font-bold">${new Date(active.openedAt).toLocaleString('ru-RU')}</b> — Открыл: <b class="font-semibold">${active.openedBy}</b></p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="state.showCloseShiftModal = true; render();" class="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-extrabold text-xs text-white shadow-md flex items-center gap-1.5 active:scale-95 transition-all">
                        🔴 Закрыть смену
                    </button>
                </div>
            </div>

            <!-- Dynamic Shift Statistics Widgets -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-system-surface border border-system-border rounded-xl p-3.5 shadow-xs">
                    <span class="text-[10px] uppercase font-bold text-system-muted block mb-1">Начальный остаток</span>
                    <span class="text-lg font-black text-system-text">${formatPrice(active.startBalance)}</span>
                </div>
                <div class="bg-system-surface border border-system-border rounded-xl p-3.5 shadow-xs">
                    <span class="text-[10px] uppercase font-bold text-system-muted block mb-2">Записи статус</span>
                    <span class="text-xs font-bold text-system-text flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">${compCount} заверены</span>
                        <span class="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">${cancCount} отмены</span>
                    </span>
                </div>
                <div class="bg-system-surface border border-system-border rounded-xl p-3.5 shadow-xs">
                    <span class="text-[10px] uppercase font-bold text-system-muted block mb-1">Выручка (выполн.)</span>
                    <span class="text-base font-black text-green-600">${formatPrice(revenue)}</span>
                </div>
                <div class="bg-system-surface border border-system-border rounded-xl p-3.5 shadow-xs">
                    <span class="text-[10px] uppercase font-bold text-system-muted block mb-1">Расчетный остаток кассы</span>
                    <span class="text-lg font-black text-primary-600">${formatPrice(currentDeskCash)}</span>
                </div>
            </div>

            <!-- Журнал по мастерам и услугам за эту смену -->
            <div class="space-y-3">
                <h4 class="font-extrabold text-sm text-system-text">Ведение журнала записи по Мастерам/Услугам (текущая смена)</h4>
                <div class="bg-system-surface rounded-2xl border border-system-border overflow-hidden">
                    <table class="w-full text-sm">
                        <thead class="bg-system-main font-bold text-xs text-system-muted border-b border-system-border">
                            <tr>
                                <th class="p-3 text-left">Запись ID</th>
                                <th class="p-3 text-left">Клиент</th>
                                <th class="p-3 text-left">Мастер</th>
                                <th class="p-3 text-left">Услуга</th>
                                <th class="p-3 text-left">Время</th>
                                <th class="p-3 text-right">Сумма заказа</th>
                                <th class="p-3 text-center">Оплата</th>
                                <th class="p-3 text-center">Статус</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-system-border/60">
                            ${shiftBookings.length > 0 ? shiftBookings.map(b => {
                                const svc = services.find(s => s.id === b.serviceId);
                                const m = masters.find(mast => mast.id === b.masterId);
                                const price = getSalonPrice(salon.id, b.serviceId, services, b.masterId);
                                const isSalaryPayout = b.paid;
                                return `
                                <tr class="hover:bg-system-main/20 text-system-text text-sm">
                                    <td class="p-3 font-mono text-xs text-system-muted">${b.id}</td>
                                    <td class="p-3 font-semibold">${b.clientName || 'Гость'}</td>
                                    <td class="p-3 font-medium text-xs text-system-muted">${m ? m.name : 'н/д'}</td>
                                    <td class="p-3 text-xs text-system-text">${svc ? svc.name : 'н/д'}</td>
                                    <td class="p-3 text-xs text-system-muted whitespace-nowrap">${b.date} ${b.time}</td>
                                    <td class="p-3 text-right font-bold text-primary-600">${formatPrice(price)}</td>
                                    <td class="p-3 text-center text-xs">
                                        ${b.paid ? `
                                            <span class="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-extrabold" title="Оплачено через ${b.paymentWalletId}">✓ Оплачено</span>
                                        ` : `
                                            <button onclick="window.triggerPaymentFlow('${b.id}');" class="px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shadow-xs active:translate-y-0.5 transition-all">Принять оплату</button>
                                        `}
                                    </td>
                                    <td class="p-3 text-center">
                                        <span class="badge ${b.status === 'completed' ? 'bg-blue-50 text-blue-700' : b.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'}">
                                            ${b.status === 'completed' ? 'Завершена' : b.status === 'cancelled' ? 'Отклонена' : 'Активна'}
                                        </span>
                                    </td>
                                </tr>
                                `;
                            }).join('') : `
                            <tr>
                                <td colspan="8" class="p-6 text-center italic text-xs text-system-muted">Во время этой смены записей пока не проводилось</td>
                            </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Closing Modal -->
            ${state.showCloseShiftModal ? `
                <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4" onclick="state.showCloseShiftModal = false; render();">
                    <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-sm p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
                        <h4 class="text-base font-extrabold text-system-text mb-3">🔴 Закрытие кассовой смены</h4>
                        <p class="text-xs text-system-muted mb-4">Для правильного ведения отчетности, зафиксируйте фактическую сумму наличных в кассе на данный момент.</p>
                        <div class="space-y-4">
                            ${stuckBookings.length > 0 ? `
                                <div class="p-3 bg-red-50 border border-red-100 rounded-xl mb-2 text-xs text-red-600 leading-relaxed">
                                    <p class="font-bold mb-1">⚠ Имеются зависшие записи за эту смену:</p>
                                    <ul class="list-disc pl-4 space-y-0.5 text-[11px] max-h-24 overflow-y-auto">
                                        ${stuckBookings.map(b => `<li>${b.date} ${b.time} — ${b.clientName || 'Гость'}</li>`).join('')}
                                    </ul>
                                    <p class="mt-1.5 text-[10px] text-red-500 font-medium whitespace-normal">Закрытие смены невозможно, пока вы не завершите или не отмените эти записи.</p>
                                </div>
                            ` : ''}
                            <div>
                                <label class="text-xs text-system-muted font-bold block mb-1">Фактический остаток на конец смены (KGS)</label>
                                <input type="number" id="close_end_balance" value="${currentDeskCash}" min="0" class="w-full text-lg border border-system-border rounded-xl p-3 bg-system-main font-bold text-primary-600 focus:ring-2 focus:ring-primary-100 outline-none">
                            </div>
                            <div class="p-3 bg-system-main rounded-xl border border-system-border text-[11px] text-system-muted leading-relaxed space-y-1">
                                <div class="flex justify-between"><span>Начальный баланс:</span> <span>${formatPrice(active.startBalance)}</span></div>
                                <div class="flex justify-between"><span>Обороты (изменения):</span> <span class="${cashDeskNet >= 0 ? 'text-green-600' : 'text-red-500'}">${cashDeskNet >= 0 ? '+' : ''}${formatPrice(cashDeskNet)}</span></div>
                                <div class="flex justify-between font-bold text-system-text"><span>Расчетная сумма кассы:</span> <span>${formatPrice(currentDeskCash)}</span></div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="state.showCloseShiftModal = false; render();" class="flex-1 py-3 text-xs font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                                ${stuckBookings.length > 0 ? `
                                    <button disabled class="flex-1 py-3 text-xs font-bold bg-system-muted/40 text-system-text/40 rounded-xl cursor-not-allowed border border-system-border" title="Завершите или отмените зависшие записи">Закрыть смену</button>
                                ` : `
                                    <button onclick="window.submitCloseShift('${salon.id}');" class="flex-1 py-3 text-xs font-bold bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-colors">Закрыть смену</button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>`;
    } else {
        // Shift is CLOSED. Form to OPEN.
        showActiveStats = `
        <div class="bg-system-surface border border-system-border p-6 rounded-2xl shadow-xs text-center space-y-4">
            <div class="w-14 h-14 rounded-full bg-system-main flex items-center justify-center text-2xl mx-auto border border-system-border">🔒</div>
            <div>
                <h3 class="font-extrabold text-base text-system-text">Текущая кассовая смена ЗАКРЫТА</h3>
                <p class="text-xs text-system-muted max-w-sm mx-auto mt-1">Откройте новую смену для оформления кассовых операций и фиксации данных за сегодня.</p>
            </div>
            
            <div class="max-w-xs mx-auto text-left pt-2">
                <label class="text-xs text-system-muted font-bold block mb-1">Сумма в кассе на начало смены (KGS)</label>
                <input type="number" id="open_start_balance" value="5000" min="0" class="w-full text-sm border border-system-border rounded-xl p-3 bg-system-main font-bold text-system-text outline-none focus:ring-2 focus:ring-primary-100">
            </div>

            <button onclick="window.submitOpenShift('${salon.id}');" class="w-full max-w-xs py-3 rounded-xl bg-green-600 hover:bg-green-700 font-extrabold text-xs text-white shadow-md active:translate-y-0.5 transition-all">
                🟢 Открыть кассовую смену
            </button>
        </div>`;
    }

    // Historical Journal Row-by-Row rendering
    const closedShifts = shiftsLog.filter(s => s.status === 'closed');

    return `
    <div class="animate-fade-in p-2 select-none">
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-system-border">
            <div>
                <h1 class="text-2xl font-black text-system-text flex items-center gap-2">
                    <span>⌛</span> Кассовая смена
                </h1>
                <p class="text-xs text-system-muted mt-0.5">Операционное администрирование смен, фиксация остатков и результатов дня</p>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-6">
            <!-- Active Shift Management Section -->
            ${showActiveStats}

            <!-- Shifts Historical Logs Journal: Одна строка на каждый день/смену -->
            <div class="space-y-3 pt-4 border-t border-system-border/60">
                <h3 class="font-black text-base text-system-text flex items-center gap-1.5">
                    <span>📋</span> Журнал кассовых смен (Архив)
                </h3>
                <div class="bg-system-surface rounded-2xl border border-system-border overflow-hidden shadow-xs">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="bg-system-main border-b border-system-border text-system-muted font-bold text-xs text-left">
                                    <th class="p-3.5">Дата/Смена ID</th>
                                    <th class="p-3.5 text-center">Статус</th>
                                    <th class="p-3.5 text-right">Начало</th>
                                    <th class="p-3.5 text-right">Конец</th>
                                    <th class="p-3.5 text-center">Клиенты (Заверш/Отмен)</th>
                                    <th class="p-3.5 text-right font-bold text-green-700">Выручка</th>
                                    <th class="p-3.5 text-right font-bold text-orange-700">Доход мастеров</th>
                                    <th class="p-3.5 text-right font-bold text-purple-700">Выплачено</th>
                                    <th class="p-3.5 text-right font-bold text-primary-600">Прибыль салона</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-system-border/60">
                                ${closedShifts.length > 0 ? closedShifts.map(s => {
                                    const stats = s.stats || { clientsCompleted: 0, clientsCancelled: 0, revenue: 0, mastersIncome: 0, profit: 0, paidToMasters: 0 };
                                    const openedDate = new Date(s.openedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                    return `
                                    <tr class="hover:bg-system-main/20 text-system-text">
                                        <td class="p-3.5">
                                            <div class="font-extrabold text-xs text-system-text">${openedDate}</div>
                                            <div class="text-[9px] font-mono text-system-muted">${s.id}</div>
                                        </td>
                                        <td class="p-3.5 text-center">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-system-main text-system-muted border border-system-border">Закрыта</span>
                                        </td>
                                        <td class="p-3.5 text-right text-xs font-medium">${formatPrice(s.startBalance)}</td>
                                        <td class="p-3.5 text-right text-xs">
                                            <div class="font-semibold text-system-text">${formatPrice(s.endBalance)}</div>
                                            ${s.endBalance !== s.computedEndBalance ? `<div class="text-[9px] text-red-500 font-extrabold" title="Расхождение">Расх: ${formatPrice(s.endBalance - s.computedEndBalance)}</div>` : ''}
                                        </td>
                                        <td class="p-3.5 text-center text-xs">
                                            <span class="font-bold text-blue-600">${stats.clientsCompleted}</span>
                                            <span class="text-system-muted font-normal">/</span>
                                            <span class="font-medium text-red-500">${stats.clientsCancelled}</span>
                                        </td>
                                        <td class="p-3.5 text-right font-black text-green-600 text-xs">${formatPrice(stats.revenue)}</td>
                                        <td class="p-3.5 text-right text-xs font-semibold text-orange-600">${formatPrice(stats.mastersIncome)}</td>
                                        <td class="p-3.5 text-right text-xs font-semibold text-purple-600">${formatPrice(stats.paidToMasters)}</td>
                                        <td class="p-3.5 text-right font-black text-xs text-primary-600">${formatPrice(stats.profit)}</td>
                                    </tr>
                                    `;
                                }).join('') : `
                                <tr>
                                    <td colspan="9" class="p-8 text-center text-system-muted italic text-xs">Исторические смены отсутствуют</td>
                                </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

// Payment Flow Acceptance Popover Renderer
export function renderPaymentFlowModal() {
    if (!state.paymentBookingId) return '';

    const b = state.bookings.find(x => x.id === state.paymentBookingId);
    if (!b) return '';

    const salonId = state.currentUser?.salonId;
    if (!salonId) return '';

    const wallets = getWallets(salonId);
    const svc = services.find(s => s.id === b.serviceId);
    const m = masters.find(mast => mast.id === b.masterId);
    const price = getSalonPrice(salonId, b.serviceId, services, b.masterId);
    const activeShift = getActiveShift(salonId);

    return `
    <div class="fixed inset-0 z-[200] background-blur bg-black/40 flex items-center justify-center p-4 text-left select-none" onclick="state.paymentBookingId = null; render();">
        <div class="bg-system-surface rounded-3xl border border-system-border w-full max-w-md p-6 shadow-2xl relative animate-scale-up" onclick="event.stopPropagation()">
            <h4 class="text-lg font-extrabold text-system-text mb-2 flex items-center gap-1.5">
                <span>💸</span> Принять оплату услуги
            </h4>
            <p class="text-xs text-system-muted mb-4">Выберите платежную кассу для оприходования денег клиента.</p>

            <div class="p-3.5 bg-system-main rounded-2xl border border-system-border mb-4 space-y-2">
                <div class="flex justify-between items-center text-xs">
                    <span class="text-system-muted">Клиент:</span>
                    <span class="font-extrabold text-system-text">${b.clientName || 'Гость'} (${b.clientPhone})</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                    <span class="text-system-muted">Услуга:</span>
                    <span class="font-semibold text-system-text">${svc ? svc.name : 'н/д'}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                    <span class="text-system-muted">Мастер:</span>
                    <span class="font-semibold text-system-text">${m ? m.name : 'н/д'}</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-system-border/60">
                    <span class="font-bold text-xs text-system-text">К оплате:</span>
                    <span class="text-lg font-black text-primary-600">${formatPrice(price)}</span>
                </div>
            </div>

            ${!activeShift ? `
                <div class="p-2.5 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-600 leading-relaxed mb-4 flex gap-1.5 items-start">
                    <span class="text-sm">⚠</span>
                    <span><b>Внимание: Нет открытой кассовой смены!</b> Оплата будет проведена, но операция не запишется в журнал смены. Рекомендуется открыть смену в разделе «Кассовая смена» перед приемом платежей.</span>
                </div>
            ` : ''}

            <div class="space-y-3">
                <label class="text-xs text-system-muted font-bold block mb-1">Выберите кошелёк/кассу</label>
                <div class="grid grid-cols-2 gap-2.5">
                    ${wallets.map((w, index) => {
                        return `
                        <label class="flex items-center justify-between p-3 border-2 border-system-border rounded-xl cursor-pointer hover:bg-system-main/40 hover:border-primary-100 transition-all text-xs" onclick="window.selectPaymentWallet('${w.id}');">
                            <div class="flex flex-col gap-0.5">
                                <span class="font-bold text-system-text">${w.name}</span>
                                <span class="text-[9px] text-system-muted">${w.type === 'cash' ? 'Наличная' : 'Безналичная'}</span>
                            </div>
                            <input type="radio" name="payment_wallet_choice" id="payment_w_${w.id}" value="${w.id}" ${index === 0 ? 'checked' : ''} class="w-3.5 h-3.5 border-system-border text-primary-500 focus:ring-primary-400">
                        </label>
                        `;
                    }).join('')}
                </div>

                <div class="flex gap-2 pt-3">
                    <button onclick="state.paymentBookingId = null; render();" class="flex-1 py-3.5 text-xs font-bold border border-system-border rounded-xl text-system-muted hover:bg-system-main transition-colors">Отмена</button>
                    <button onclick="window.submitBookingPayment('${price}');" class="flex-1 py-3.5 text-xs font-bold bg-primary-505 bg-primary-500 text-white rounded-xl shadow-md hover:bg-primary-600 transition-colors">Подтвердить приём</button>
                </div>
            </div>
        </div>
    </div>
    `;
}


// ==========================================
// 4. ACTION CONTROLLERS & WINDOW API
// ==========================================

window.triggerPaymentFlow = function(bookingId) {
    state.paymentBookingId = bookingId;
    render();
};

window.selectPaymentWallet = function(walletId) {
    const radio = document.getElementById('payment_w_' + walletId);
    if (radio) radio.checked = true;
};

window.submitBookingPayment = function(amount) {
    const bookingId = state.paymentBookingId;
    if (!bookingId) return;

    const b = state.bookings.find(x => x.id === bookingId);
    if (!b) return;

    const salonId = state.currentUser?.salonId;
    if (!salonId) return;

    const active = getActiveShift(salonId);
    if (!active) {
        showToast('Ошибка: Кассовая смена закрыта! Приём оплаты невозможен.');
        return;
    }

    const selector = document.querySelector('input[name="payment_wallet_choice"]:checked');
    const walletId = selector ? selector.value : ('w-cash-' + salonId);

    // Make booking paid
    b.paid = true;
    b.paymentWalletId = walletId;
    b.paidAt = new Date().toISOString();
    
    b.paidShiftId = active.id;
    b.completedShiftId = active.id;

    if (state.autoCompleteBookingId === b.id) {
        if (b.status === 'confirmed') {
            b.status = 'completed';
        }
        state.autoCompleteBookingId = null;
    }

    // Auto add transaction of type income
    const svc = services.find(s => s.id === b.serviceId);
    let desc = `Оплата по записи #${b.id}`;
    if (svc) desc += ` за услугу "${svc.name}"`;
    desc += `, клиент: ${b.clientName || 'Гость'}`;

    addTransaction(salonId, {
        type: 'income',
        amount: Number(amount),
        walletId,
        itemId: 'art-revenue',
        counterpartyId: null,
        description: desc,
        bookingId: b.id
    });

    state.paymentBookingId = null;
    showToast('Оплата успешно зафиксирована!');
    render();
};

window.submitAddWallet = function(salonId) {
    const nameInput = document.getElementById('new_wallet_name');
    const typeSelect = document.getElementById('new_wallet_type');
    const currSelect = document.getElementById('new_wallet_currency');

    if (!nameInput || !nameInput.value.trim()) {
        showToast('Пожалуйста, введите название кошелька!');
        return;
    }

    const wallets = getWallets(salonId);
    const newW = {
        id: 'w-' + Date.now(),
        salonId,
        name: nameInput.value.trim(),
        type: typeSelect.value,
        currency: currSelect.value
    };

    wallets.push(newW);
    saveWallets(salonId, wallets);
    state.showAddWalletModal = false;
    showToast('Кошелек создан успешно!');
    render();
};

window.submitAddArticle = function(salonId) {
    const nameInput = document.getElementById('new_art_name');
    const typeSelect = document.getElementById('new_art_type');
    const ddsChecked = document.getElementById('new_art_dds')?.checked || false;
    const opuChecked = document.getElementById('new_art_opu')?.checked || false;
    const dzkzChecked = document.getElementById('new_art_dzkz')?.checked || false;

    if (!nameInput || !nameInput.value.trim()) {
        showToast('Пожалуйста, введите название статьи!');
        return;
    }

    const articles = getArticles(salonId);
    const newArt = {
        id: 'art-' + Date.now(),
        salonId,
        name: nameInput.value.trim(),
        type: typeSelect.value,
        dds: ddsChecked,
        opu: opuChecked,
        dzkz: dzkzChecked
    };

    articles.push(newArt);
    saveArticles(salonId, articles);
    state.showAddArticleModal = false;
    showToast('Статья ДР создана успешно!');
    render();
};

window.submitAddTransaction = function(salonId) {
    const amountVal = document.getElementById('tx_amount')?.value;
    const descVal = document.getElementById('tx_description')?.value;

    if (!amountVal || Number(amountVal) <= 0) {
        showToast('Введите корректную сумму операции!');
        return;
    }

    if (state.showAddTxModal === 'transfer') {
        const fromVal = document.getElementById('tx_from_wallet')?.value;
        const toVal = document.getElementById('tx_to_wallet')?.value;

        if (fromVal === toVal) {
            showToast('Нельзя переводить деньги на тот же кошелек!');
            return;
        }

        const balanceFrom = getWalletBalance(salonId, fromVal);
        if (balanceFrom < Number(amountVal)) {
            showToast('Недостаточно средств на кошельке назначения!');
            return;
        }

        addTransaction(salonId, {
            type: 'transfer',
            amount: Number(amountVal),
            fromWalletId: fromVal,
            toWalletId: toVal,
            description: descVal || 'Внутренний перевод'
        });
    } else {
        const walletVal = document.getElementById('tx_wallet')?.value;
        const itemVal = document.getElementById('tx_item')?.value;
        const cpVal = document.getElementById('tx_counterparty')?.value || null;

        addTransaction(salonId, {
            type: state.showAddTxModal,
            amount: Number(amountVal),
            walletId: walletVal,
            itemId: itemVal,
            counterpartyId: cpVal,
            description: descVal || ''
        });
    }

    state.showAddTxModal = false;
    showToast('Операция проведена успешно!');
    render();
};

window.submitAddCounterparty = function(salonId) {
    const nameVal = document.getElementById('new_cp_name')?.value;
    const phoneVal = document.getElementById('new_cp_phone')?.value;
    const roleVal = document.getElementById('new_cp_role')?.value;

    if (!nameVal || !nameVal.trim()) {
        showToast('Введите ФИО или название контрагента!');
        return;
    }

    const list = getCounterparties(salonId);
    const newCp = {
        id: 'cp-' + Date.now(),
        salonId,
        name: nameVal.trim(),
        phone: phoneVal || '+996 XXX XXX XXX',
        role: roleVal
    };

    list.push(newCp);
    saveCounterparties(salonId, list);
    state.showAddCpModal = false;
    showToast('Контрагент добавлен успешно!');
    render();
};

window.deleteTransaction = function(salonId, txId) {
    if (!confirm('Вы действительно хотите удалить эту операцию? Действие приведет к коррекции балансов.')) return;
    const txs = getTransactions(salonId);
    const filtered = txs.filter(t => t.id !== txId);
    saveTransactions(salonId, filtered);
    showToast('Операция удалена');
    render();
};

window.deleteCounterparty = function(salonId, cpId) {
    const list = getCounterparties(salonId);
    const filtered = list.filter(c => c.id !== cpId);
    saveCounterparties(salonId, filtered);
    showToast('Контрагент удален');
    render();
};

window.submitOpenShift = function(salonId) {
    const input = document.getElementById('open_start_balance');
    const bal = input ? Number(input.value) : 5000;
    
    // We can fetch manager's name
    const name = state.currentUser ? state.currentUser.name : 'Администратор';
    openShift(salonId, name, bal);
    render();
};

window.submitCloseShift = function(salonId) {
    const input = document.getElementById('close_end_balance');
    const bal = input ? Number(input.value) : 0;

    const name = state.currentUser ? state.currentUser.name : 'Администратор';
    closeShift(salonId, name, bal);
    state.showCloseShiftModal = false;
    render();
};


// ==========================================
// DEBTSPERSISTENCE & CONTROLLERS (DZK&Z)
// ==========================================
export function getDebts(salonId) {
    if (!localStorage.getItem('debts_' + salonId)) {
        const defaultDebts = [
            { id: 'debt-1', salonId, counterpartyId: 'cp-estel', type: 'payable', amount: 15200, description: 'Закупка крем-красок по накладной №82', createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
            { id: 'debt-2', salonId, counterpartyId: 'cp-landlord', type: 'payable', amount: 45000, description: 'Задолженность по аренде за текущий месяц', createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() }
        ];
        localStorage.setItem('debts_' + salonId, JSON.stringify(defaultDebts));
    }
    return JSON.parse(localStorage.getItem('debts_' + salonId)) || [];
}

export function saveDebts(salonId, list) {
    localStorage.setItem('debts_' + salonId, JSON.stringify(list));
}

window.submitAddDebt = function(salonId) {
    const cpSelect = document.getElementById('debt_counterparty');
    const typeSelect = document.getElementById('debt_type');
    const amountInput = document.getElementById('debt_amount');
    const descInput = document.getElementById('debt_description');

    if (!amountInput || Number(amountInput.value) <= 0) {
        showToast('Пожалуйста, введите корректную сумму задолженности!');
        return;
    }

    const list = getDebts(salonId);
    const newDebt = {
        id: 'debt-' + Date.now(),
        salonId,
        counterpartyId: cpSelect.value,
        type: typeSelect.value,
        amount: Number(amountInput.value),
        description: descInput ? descInput.value.trim() : '',
        createdAt: new Date().toISOString()
    };

    list.push(newDebt);
    saveDebts(salonId, list);
    state.showAddDebtModal = false;
    showToast('Задолженность успешно зарегистрирована!');
    render();
};

window.deleteDebt = function(salonId, debtId) {
    if (!confirm('Вы действительно хотите удалить запись этой задолженности?')) return;
    const list = getDebts(salonId);
    const filtered = list.filter(d => d.id !== debtId);
    saveDebts(salonId, filtered);
    showToast('Запись о задолженности удалена');
    render();
};

window.payOrResolveDebt = function(salonId, debtId) {
    const list = getDebts(salonId);
    const d = list.find(x => x.id === debtId);
    if (!d) return;

    const wallets = getWallets(salonId);
    const active = getActiveShift(salonId);

    if (active) {
        const option = confirm(`Хотите автоматически провести платеж по кассе?\n\nЕсли ДА - в кассу внесется приход/расход по долгу.\nЕсли НЕТ - долг просто спишется из реестра.`);
        if (option) {
            const defaultWalletId = wallets[0]?.id || ('w-cash-' + salonId);
            const counterparties = getCounterparties(salonId);
            const cpName = counterparties.find(c => c.id === d.counterpartyId)?.name || 'Контрагент';

            if (d.type === 'receivable') {
                addTransaction(salonId, {
                    type: 'income',
                    amount: d.amount,
                    walletId: defaultWalletId,
                    itemId: 'art-other',
                    counterpartyId: d.counterpartyId,
                    description: `Погашение дебиторской задолженности от: ${cpName}. Основание: ${d.description || ''}`
                });
            } else {
                addTransaction(salonId, {
                    type: 'expense',
                    amount: d.amount,
                    walletId: defaultWalletId,
                    itemId: 'art-other',
                    counterpartyId: d.counterpartyId,
                    description: `Погашение кредиторской задолженности перед: ${cpName}. Основание: ${d.description || ''}`
                });
            }
        }
    }

    const filtered = list.filter(x => x.id !== debtId);
    saveDebts(salonId, filtered);
    showToast('Задолженность успешно погашена и списана!');
    render();
};

window.submitEditWallet = function(salonId, walletId) {
    const nameInput = document.getElementById('edit_wallet_name');
    const typeSelect = document.getElementById('edit_wallet_type');
    const currencySelect = document.getElementById('edit_wallet_currency');

    if (!nameInput || !nameInput.value.trim()) {
        showToast('Пожалуйста, введите название кошелька!');
        return;
    }

    const wallets = getWallets(salonId);
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
        wallet.name = nameInput.value.trim();
        wallet.type = typeSelect.value;
        wallet.currency = currencySelect.value;
        saveWallets(salonId, wallets);
        state.showEditWalletModal = false;
        showToast('Кошелек успешно обновлен!');
        render();
    }
};

window.deleteWallet = function(salonId, walletId) {
    if (!confirm('Вы действительно хотите удалить этот кошелек/кассу?')) return;
    const list = getWallets(salonId);
    if (list.length <= 1) {
        showToast('В салоне должен быть как минимум один активный кошелек!');
        return;
    }
    const filtered = list.filter(w => w.id !== walletId);
    saveWallets(salonId, filtered);
    showToast('Кошелек успешно удален');
    render();
};

window.submitEditArticle = function(salonId, articleId) {
    const nameInput = document.getElementById('edit_art_name');
    const typeSelect = document.getElementById('edit_art_type');
    const ddsCheck = document.getElementById('edit_art_dds');
    const opuCheck = document.getElementById('edit_art_opu');
    const dzkzCheck = document.getElementById('edit_art_dzkz');

    if (!nameInput || !nameInput.value.trim()) {
        showToast('Пожалуйста, введите название статьи!');
        return;
    }

    const list = getArticles(salonId);
    const item = list.find(a => a.id === articleId);
    if (item) {
        item.name = nameInput.value.trim();
        item.type = typeSelect.value;
        item.dds = ddsCheck ? ddsCheck.checked : false;
        item.opu = opuCheck ? opuCheck.checked : false;
        item.dzkz = dzkzCheck ? dzkzCheck.checked : false;
        saveArticles(salonId, list);
        state.showEditArticleModal = false;
        showToast('Статья ДР успешно обновлена!');
        render();
    }
};

window.deleteArticle = function(salonId, articleId) {
    if (!confirm('Вы действительно хотите удалить эту статью ДР?')) return;
    const list = getArticles(salonId);
    if (list.length <= 1) {
        showToast('Нельзя удалить последнюю статью ДР!');
        return;
    }
    const filtered = list.filter(a => a.id !== articleId);
    saveArticles(salonId, filtered);
    showToast('Статья ДР была каскадно удалена');
    render();
};

window.submitEditCounterparty = function(salonId, cpId) {
    const nameInput = document.getElementById('edit_cp_name');
    const phoneInput = document.getElementById('edit_cp_phone');
    const roleSelect = document.getElementById('edit_cp_role');

    if (!nameInput || !nameInput.value.trim()) {
        showToast('Пожалуйста, введите наименование контрагента!');
        return;
    }

    const list = getCounterparties(salonId);
    const item = list.find(c => c.id === cpId);
    if (item) {
        item.name = nameInput.value.trim();
        item.phone = phoneInput ? phoneInput.value.trim() : '+996 XXX XXX XXX';
        item.role = roleSelect.value;
        saveCounterparties(salonId, list);
        state.showEditCpModal = false;
        showToast('Контрагент успешно обновлен!');
        render();
    }
};

window.submitEditDebt = function(salonId, debtId) {
    const cpSelect = document.getElementById('edit_debt_counterparty');
    const typeSelect = document.getElementById('edit_debt_type');
    const amountInput = document.getElementById('edit_debt_amount');
    const descInput = document.getElementById('edit_debt_description');

    if (!amountInput || Number(amountInput.value) <= 0) {
        showToast('Введите корректную сумму обязательства!');
        return;
    }

    const list = getDebts(salonId);
    const item = list.find(d => d.id === debtId);
    if (item) {
        item.counterpartyId = cpSelect.value;
        item.type = typeSelect.value;
        item.amount = Number(amountInput.value);
        item.description = descInput ? descInput.value.trim() : '';
        saveDebts(salonId, list);
        state.showEditDebtModal = false;
        showToast('Оригинал долга успешно изменен!');
        render();
    }
};

window.submitEditTransaction = function(salonId, txId) {
    const amountInput = document.getElementById('edit_tx_amount');
    const descInput = document.getElementById('edit_tx_description');

    if (!amountInput || Number(amountInput.value) <= 0) {
        showToast('Пожалуйста, введите корректную сумму операции!');
        return;
    }

    const list = getTransactions(salonId);
    const t = list.find(x => x.id === txId);
    if (t) {
        t.amount = Number(amountInput.value);
        t.description = descInput ? descInput.value.trim() : '';

        if (t.type === 'transfer') {
            const fromW = document.getElementById('edit_tx_from_wallet');
            const toW = document.getElementById('edit_tx_to_wallet');
            if (fromW) t.fromWalletId = fromW.value;
            if (toW) t.toWalletId = toW.value;
        } else {
            const wSelect = document.getElementById('edit_tx_wallet');
            const iSelect = document.getElementById('edit_tx_item');
            const cSelect = document.getElementById('edit_tx_counterparty');
            if (wSelect) t.walletId = wSelect.value;
            if (iSelect) t.itemId = iSelect.value;
            if (cSelect) t.counterpartyId = cSelect.value || null;
        }

        saveTransactions(salonId, list);
        state.showEditTransactionModal = false;
        showToast('Кассовая операция была успешно обновлена!');
        render();
    }
};
