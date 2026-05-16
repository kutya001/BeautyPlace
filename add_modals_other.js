const fs = require('fs');

function updateLayout(file) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes('renderBecomeMasterModal')) {
        code = code.replace(
            /import \{([^}]+)\} from '\.\.\/\.\.\/components\/modals\.js';/, 
            "import { $1, renderBecomeMasterModal, renderBecomeSalonModal } from '../../components/modals.js';"
        );
        code = code.replace(
            /\$\{state\.showProfileEdit \? renderProfileEditModal\(\) \: ''\}/,
            `\${state.showProfileEdit ? renderProfileEditModal() : ''}
\${state.showBecomeMasterModal ? renderBecomeMasterModal() : ''}
\${state.showBecomeSalonModal ? renderBecomeSalonModal() : ''}`
        );
        fs.writeFileSync(file, code, 'utf8');
        console.log("Updated " + file);
    }
}

updateLayout('js/apps/master/app.js');
updateLayout('js/apps/salon/layout.js');
