const fs = require('fs');

function replacePink(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/pink-/g, 'primary-');
    content = content.replace(/bg-white/g, 'bg-system-surface'); // Also fix bg-white that breaks in dark mode
    content = content.replace(/text-gray-900/g, 'text-system-text');
    content = content.replace(/text-gray-800/g, 'text-system-text');
    content = content.replace(/text-gray-600/g, 'text-system-muted');
    content = content.replace(/text-gray-500/g, 'text-system-muted');
    content = content.replace(/text-gray-400/g, 'text-system-muted opacity-70');
    content = content.replace(/border-gray-200/g, 'border-system-border');
    content = content.replace(/border-gray-100/g, 'border-system-border/50');
    content = content.replace(/bg-gray-50/g, 'bg-system-main');
    fs.writeFileSync(file, content, 'utf8');
}

const files = [
    'js/pages/home.js',
    'js/pages/auth.js',
    'js/apps/client/pages.js',
    'js/apps/client/layout.js',
    'js/components/cards.js',
    'js/components/header.js',
    'js/components/ui.js',
    'js/state.js'
];

files.forEach(replacePink);
console.log("Pink replaced");
