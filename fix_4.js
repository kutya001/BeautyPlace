const fs = require('fs');
let code = fs.readFileSync('js/apps/master/app.js', 'utf8');

const regex = /if \(tab === 'services'\) \{[\s\S]*?if \(tab === 'profile'\)/m;

const newServicesRenderer = `    if (tab === 'services') {
        const grouped = services.reduce((acc, svc) => {
            const catId = svc.category;
            if (!acc[catId]) { acc[catId] = { cat: categories.find(c => c.id === catId), services: [] }; }
            acc[catId].services.push(svc);
            return acc;
        }, {});

        return \`
<div class="animate-fade-in max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-system-text mb-6">Услуги и стоимость</h1>
    <div class="space-y-4">
        \${Object.values(grouped).map(g => {
            const isExpanded = state.expandedMasterCat !== undefined ? state.expandedMasterCat[g.cat?.id || 0] : false;
            const selectedCount = g.services.filter(s => (master.services || []).includes(s.id)).length;
            return \`
            <div class="bg-system-surface rounded-2xl border border-system-border overflow-hidden">
                <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-system-main transition-colors"
                     onclick="if(!state.expandedMasterCat) state.expandedMasterCat={}; state.expandedMasterCat[\${g.cat?.id || 0}] = !\${isExpanded}; render()">
                    <div class="flex items-center gap-3">
                        <span class="text-xl">\${g.cat ? g.cat.icon : '✨'}</span>
                        <h3 class="font-bold text-system-text">\${g.cat ? g.cat.name : 'Другое'}</h3>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-system-main text-system-muted">\${selectedCount}/\${g.services.length}</span>
                    </div>
                    <span class="text-system-muted transition-transform \${isExpanded ? 'rotate-180' : ''}">▾</span>
                </div>
                \${isExpanded ? \`
                <div class="border-t border-system-border divide-y divide-system-border">
                    \${g.services.map(svc => {
                        const isChecked = (master.services || []).includes(svc.id);
                        const customVal = (master.customPrices && master.customPrices[svc.id] !== undefined) ? master.customPrices[svc.id] : svc.price;
                        return \`
                        <div class="p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between hover:bg-system-main/50 transition-colors \${!isChecked ? 'opacity-60' : ''}">
                            <div class="flex items-start sm:items-center gap-3">
                                <input type="checkbox" \${isChecked ? 'checked' : ''} class="mt-1 sm:mt-0 w-5 h-5 rounded border-system-border text-primary-500 focus:ring-primary-400 cursor-pointer"
                                       onchange="toggleMasterSelfService(\${master.id}, \${svc.id})">
                                <div>
                                    <h4 class="text-sm font-medium text-system-text">\${svc.name}</h4>
                                    <p class="text-xs text-system-muted">\${Math.floor(svc.duration / 60) > 0 ? Math.floor(svc.duration / 60) + ' ч ' : ''}\${svc.duration % 60 > 0 ? (svc.duration % 60) + ' мин' : ''} · Базовая цена: \${svc.price} сом</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 self-end sm:self-auto">
                                <label class="text-[10px] text-system-muted font-medium w-16 text-right leading-tight">Ваша цена<br>(сом)</label>
                                <input type="number" min="0" \${!isChecked ? 'disabled' : ''} class="w-20 px-3 py-1.5 rounded-xl border border-system-border text-sm font-bold focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-center"
                                       value="\${customVal}" onchange="updateMasterSelfPrice(\${master.id}, \${svc.id}, this.value)">
                            </div>
                        </div>
                        \`;
                    }).join('')}
                </div>
                \` : ''}
            </div>
            \`;
        }).join('')}
    </div>
</div>\`;
    }

    if (tab === 'profile')`;

code = code.replace(regex, newServicesRenderer);

const funcsToAdd = `
window.toggleMasterSelfService = function(masterId, serviceId) {
    const m = masters.find(x => x.id === masterId);
    if (!m) return;
    if (!m.services) m.services = [];
    const idx = m.services.indexOf(serviceId);
    if (idx >= 0) { m.services.splice(idx, 1); }
    else { m.services.push(serviceId); }
    render();
};

window.updateMasterSelfPrice = function(masterId, serviceId, val) {
    const m = masters.find(x => x.id === masterId);
    if (!m) return;
    if (!m.customPrices) m.customPrices = {};
    m.customPrices[serviceId] = parseInt(val, 10) || 0;
    render();
};

`;

code = code.replace('window.renderMasterContent = renderMasterContent;', funcsToAdd + 'window.renderMasterContent = renderMasterContent;');

fs.writeFileSync('js/apps/master/app.js', code);
