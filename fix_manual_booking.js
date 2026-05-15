const fs = require('fs');

// 1. Update dashboard.js
let dashPath = 'js/apps/salon/dashboard.js';
let dashContent = fs.readFileSync(dashPath, 'utf8');

dashContent = dashContent.replace(
    '<h1 class="text-2xl font-bold text-system-text">Записи салона</h1>',
    `<div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-system-text">Записи салона</h1>
            <button onclick="window.openBookingForSalon(\${salon.id})" class="btn-primary px-4 py-2 rounded-xl text-white font-semibold text-sm flex items-center gap-1"><span class="text-lg leading-none">+</span> Добавить запись</button>
        </div>`
);

fs.writeFileSync(dashPath, dashContent);

// 2. Update features/booking/actions.js
let actsPath = 'js/features/booking/actions.js';
let actsContent = fs.readFileSync(actsPath, 'utf8');

// Replace `clientUserId: state.currentUser ? state.currentUser.id : null`
// with `clientUserId: (state.currentUser && state.currentUser.role === 'client') ? state.currentUser.id : null`
actsContent = actsContent.replace(
    'clientUserId: state.currentUser ? state.currentUser.id : null',
    'clientUserId: (state.currentUser && state.currentUser.role === \'client\') ? state.currentUser.id : null'
);

// We should also set status to confirmed if it's created by the salon owner
actsContent = actsContent.replace(
    "status: 'pending',",
    `status: (state.currentUser && ['salon', 'master'].includes(state.currentUser.role)) ? 'confirmed' : 'pending',`
);

fs.writeFileSync(actsPath, actsContent);
console.log("Updated both files successfully");
