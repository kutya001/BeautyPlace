const fs = require('fs');
let code = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');

code = code.replace(
    /<p class="text-system-muted opacity-70 text-\[10px\] sm:text-sm mb-0\.5 sm:mb-1">Общая выручка<\/p>\s*<p class="text-2xl font-bold">\$\{formatPrice\(confirmedRevenue\)\}<\/p>/,
    `<p class="text-system-muted opacity-70 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Выручка от услуг (Процент)</p>
<p class="text-2xl font-bold">\${formatPrice(grossServicesRevenue)}</p>`
);

code = code.replace(
    /<div>\s*<p class="text-system-muted opacity-70 text-\[10px\] sm:text-sm mb-0\.5 sm:mb-1">Выплачено мастерам<\/p>\s*<p class="text-2xl font-bold text-primary-400">\$\{formatPrice\(totalMastersEarnings\)\}<\/p>\s*<\/div>/,
    `<div>
    <p class="text-system-muted opacity-70 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Выплачено мастерам</p>
    <p class="text-2xl font-bold text-red-500">-\${formatPrice(totalMastersEarnings)}</p>
</div>
<div>
    <p class="text-system-muted opacity-70 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Доход с аренды</p>
    <p class="text-2xl font-bold text-green-400">+\${formatPrice(rentRevenue)}</p>
</div>`
);

code = code.replace('grid-cols-1 md:grid-cols-3', 'grid-cols-2 md:grid-cols-4');

fs.writeFileSync('js/apps/salon/dashboard.js', code);
console.log('done modifying dashboard HTML');
