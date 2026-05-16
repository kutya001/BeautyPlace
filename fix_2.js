const fs = require('fs');
let code = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');

const targetStr = '<div class="mt-3 flex items-center justify-between text-[10px] text-system-muted">';
const replacementStr = '<div class="flex items-center justify-between text-[10px] text-system-muted mt-1"><span class="px-2 py-0.5 rounded-md bg-system-main font-bold ${m.tariff_type === \\\'rent\\\' ? \\\'text-green-600\\\' : \\\'text-primary-600\\\'} border border-system-border">${m.tariff_type === \\\'rent\\\' ? \\\'Аренда\\\' : \\\'Процент\\\'}</span></div>\\n                            <div class="mt-3 flex items-center justify-between text-[10px] text-system-muted">';

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('js/apps/salon/dashboard.js', code);
