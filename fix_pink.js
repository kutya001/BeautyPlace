const fs = require('fs');

function replacePink(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/pink-/g, 'primary-');
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
