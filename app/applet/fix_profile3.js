import fs from 'fs';
let content = fs.readFileSync('/app/applet/js/apps/salon/dashboard.js', 'utf8');

const target = `        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Время работы</label>
            <div class="flex gap-3">
                <input type="text" class="auth-input flex-1 px-4 py-3 rounded-xl border border-system-border outline-none text-base sm:text-sm" value="\${salon.openTime}" oninput="salons.find(s=>s.id===\${salon.id}).openTime=this.value">`;

const replacement = `        <div>
            <label class="block text-sm font-medium text-system-text mb-1.5">Тип Организации</label>
            <select class="auth-input w-full px-4 py-3 rounded-xl border border-system-border outline-none text-base sm:text-sm appearance-none bg-system-surface text-system-text bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]" onchange="salons.find(s=>s.id===\${salon.id}).orgType=this.value" style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E');">
                <option value="салон_красоты" \${salon.orgType === 'салон_красоты' ? 'selected' : ''}>Салон красоты</option>
                <option value="барбершоп" \${salon.orgType === 'барбершоп' ? 'selected' : ''}>Барбершоп</option>
                <option value="спа_центр" \${salon.orgType === 'спа_центр' ? 'selected' : ''}>SPA-центр</option>
                <option value="ногти" \${salon.orgType === 'ногти' ? 'selected' : ''}>Ногтевая студия</option>
                <option value="другое" \${!['салон_красоты', 'барбершоп', 'спа_центр', 'ногти'].includes(salon.orgType) && salon.orgType ? 'selected' : ''}>Другое</option>
            </select>
        </div>
` + target;

content = content.replace(target, replacement);
fs.writeFileSync('/app/applet/js/apps/salon/dashboard.js', content, 'utf8');
console.log("Success");
