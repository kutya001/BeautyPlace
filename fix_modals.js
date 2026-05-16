import fs from 'fs';

let content = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');

const modalStr = `export function renderContactModal() {
    if (!state.contactBookingId) return '';
    const b = state.bookings.find(x => x.id === state.contactBookingId);
    if (!b) return '';
    const salon = salons.find(s => s.id === (state.currentUser && state.currentUser.salonId)) || salons.find(s => s.id === b.targetId) || salons[0];
    const phone = b.clientPhone || '';

    const templates = [
        {
            title: 'Подтверждение записи',
            text: \\\`Добрый день, \\\${b.clientName}! Пишем из \\\${salon.name}. Записали вас на \\\${b.date} в \\\${b.time}. Ожидаем вас!\\\`
        },
        {
             title: 'Напоминание и адрес',
             text: \\\`Добрый день, \\\${b.clientName}! Напоминаем о записи на \\\${b.date} в \\\${b.time} в \\\${salon.name}. Наш адрес: \\\${salon.address || ''}. Будем рады видеть вас!\\\`
        },
        {
             title: 'Уточнение (Опоздание)',
             text: \\\`Добрый день, \\\${b.clientName}! У вас запись на \\\${b.date} в \\\${b.time} в \\\${salon.name}. Подскажите, пожалуйста, задержитесь ли вы?\\\`
        }
    ];

    let templatesHtml = '';
    templates.forEach(t => {
        templatesHtml += \\\`
            <div class="mb-3 p-4 rounded-xl shadow-sm border border-system-border bg-system-surface transition-all">
                <div class="text-sm font-bold text-system-text mb-2">\\\${t.title}</div>
                <div class="text-xs text-system-muted mb-4 line-clamp-2 leading-relaxed italic bg-system-main p-2 rounded-lg">«\\\${t.text}»</div>
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="window.sendMessage('whatsapp', '\\\${phone}', '\\\${t.text.replace(/'/g, "\\\\\\'")}')" class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-all font-bold text-xs border border-[#25D366]/20">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 0C5.385 0 0 5.385 0 12.032c0 2.13.551 4.2 1.597 6.03L.044 24l6.096-1.597c1.782.951 3.75 1.452 5.86 1.452h.005c6.641 0 12.023-5.384 12.023-12.031C24 5.21 18.636 0 12.031 0zm0 21.848h-.004c-1.802 0-3.565-.483-5.111-1.398l-.367-.217-3.8.995 1.01-3.7-.238-.378c-1.002-1.59-1.53-3.41-1.53-5.281 0-5.518 4.49-10.005 10.04-10.005 5.518 0 10.006 4.486 10.006 10.005 0 5.517-4.488 10.004-10.006 10.004zm5.519-7.514c-.302-.152-1.79-.884-2.066-.985-.276-.102-.477-.152-.678.151-.202.302-.78 1.01-.956 1.218-.176.208-.352.233-.654.081-1.314-.582-2.5-1.464-3.418-2.548-.286-.337-.123-.5.029-.652.138-.138.303-.353.454-.53.15-.175.2-.301.301-.502.101-.201.05-.378-.026-.53-.075-.151-.678-1.636-.928-2.241-.244-.59-.492-.51-.678-.52-.175-.008-.376-.011-.577-.011-.201 0-.528.075-.804.377-.276.302-1.054 1.03-1.054 2.511s1.079 2.913 1.23 3.115c.15.202 2.122 3.238 5.14 4.54 1.838.79 2.569.851 3.5.72 1.03-.146 3.167-1.294 3.619-2.541.452-1.246.452-2.316.317-2.54-.135-.224-.502-.352-.804-.504z"/></svg> WhatsApp
                    </button>
                    <button onclick="window.sendMessage('telegram', '\\\${phone}', '\\\${t.text.replace(/'/g, "\\\\\\'")}')" class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-all font-bold text-xs border border-[#0088cc]/20">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.18-.02-.27 0-.14.03-2.29 1.45-3.26 2.1-.14.09-.28.14-.42.14-.14 0-.41-.08-.6-.14-.24-.08-.55-.12-.52-.26.02-.07.13-.14.24-.22 2.62-1.63 4.39-2.39 5.28-2.75.42-.17.75-.19.91-.04.14.12.16.32.14.46z"/></svg> Telegram
                    </button>
                </div>
            </div>
        \\\`;
    });

    return \\\`
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onclick="window.closeContactModal()">
        <div class="bg-system-surface w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl animate-scale-in" onclick="event.stopPropagation()">
            <div class="sticky top-0 z-10 p-5 border-b border-system-border bg-system-main flex items-center justify-between">
                <h3 class="text-lg font-bold text-system-text flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    Связаться с клиентом
                </h3>
                <button onclick="window.closeContactModal()" class="w-8 h-8 rounded-full bg-system-surface flex items-center justify-center text-system-muted hover:text-system-text shadow-sm border border-system-border text-lg">&times;</button>
            </div>
            <div class="p-5 flex flex-col gap-6">
                <div class="flex items-center gap-4 p-4 bg-system-main rounded-2xl border border-system-border shadow-sm">
                    <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">\\\${b.clientName[0].toUpperCase()}</div>
                    <div class="overflow-hidden">
                        <div class="font-bold text-system-text truncate text-lg">\\\${b.clientName}</div>
                        <div class="text-sm font-mono text-system-muted opacity-80 truncate mt-0.5">\\\${b.clientPhone}</div>
                    </div>
                </div>

                <div>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-system-muted opacity-80 mb-3 ml-1 flex items-center gap-2">
                        <span>Написать сообщение</span>
                        <div class="h-px bg-system-border flex-1"></div>
                    </h4>
                    \\\${templatesHtml}
                </div>
                
                <div class="pt-2 border-t border-system-border">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-system-muted opacity-80 mb-3 ml-1">Открыть чат без шаблона</h4>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="window.sendMessage('whatsapp', '\\\${phone}', '')" class="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#25D366]/5 text-[#128C7E] hover:bg-[#25D366]/15 transition-all border border-[#25D366]/20">
                            <svg class="w-7 h-7 mb-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 0C5.385 0 0 5.385 0 12.032c0 2.13.551 4.2 1.597 6.03L.044 24l6.096-1.597c1.782.951 3.75 1.452 5.86 1.452h.005c6.641 0 12.023-5.384 12.023-12.031C24 5.21 18.636 0 12.031 0zm0 21.848h-.004c-1.802 0-3.565-.483-5.111-1.398l-.367-.217-3.8.995 1.01-3.7-.238-.378c-1.002-1.59-1.53-3.41-1.53-5.281 0-5.518 4.49-10.005 10.04-10.005 5.518 0 10.006 4.486 10.006 10.005 0 5.517-4.488 10.004-10.006 10.004zm5.519-7.514c-.302-.152-1.79-.884-2.066-.985-.276-.102-.477-.152-.678.151-.202.302-.78 1.01-.956 1.218-.176.208-.352.233-.654.081-1.314-.582-2.5-1.464-3.418-2.548-.286-.337-.123-.5.029-.652.138-.138.303-.353.454-.53.15-.175.2-.301.301-.502.101-.201.05-.378-.026-.53-.075-.151-.678-1.636-.928-2.241-.244-.59-.492-.51-.678-.52-.175-.008-.376-.011-.577-.011-.201 0-.528.075-.804.377-.276.302-1.054 1.03-1.054 2.511s1.079 2.913 1.23 3.115c.15.202 2.122 3.238 5.14 4.54 1.838.79 2.569.851 3.5.72 1.03-.146 3.167-1.294 3.619-2.541.452-1.246.452-2.316.317-2.54-.135-.224-.502-.352-.804-.504z"/></svg>
                            <span class="font-bold text-sm">WhatsApp</span>
                        </button>
                        <button onclick="window.sendMessage('telegram', '\\\${phone}', '')" class="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0088cc]/5 text-[#0088cc] hover:bg-[#0088cc]/15 transition-all border border-[#0088cc]/20">
                            <svg class="w-7 h-7 mb-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.18-.02-.27 0-.14.03-2.29 1.45-3.26 2.1-.14.09-.28.14-.42.14-.14 0-.41-.08-.6-.14-.24-.08-.55-.12-.52-.26.02-.07.13-.14.24-.22 2.62-1.63 4.39-2.39 5.28-2.75.42-.17.75-.19.91-.04.14.12.16.32.14.46z"/></svg>
                            <span class="font-bold text-sm">Telegram</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>\\\`;
}`;

const start1 = content.indexOf('export function renderContactModal() {');
const end1 = content.indexOf('window.renderWhatsAppModal = renderWhatsAppModal;') + 'window.renderWhatsAppModal = renderWhatsAppModal;'.length;

if (start1 !== -1 && end1 !== -1) {
    content = content.substring(0, start1) + modalStr + '\n\n' + content.substring(end1);
} else {
    console.log('could not perfectly match indices');
}

content = content.replace(/\$\{state\.whatsappBookingId \? renderWhatsAppModal\(\) : ''\}/g, '');

const sendMessageFunc = `\nwindow.sendMessage = (provider, phone, text) => {
    const encoded = text ? encodeURIComponent(text) : '';
    let p = phone.replace(/\\D/g, '');
    
    if (provider === 'whatsapp') {
        if (p.length < 9) {
            alert('Некорректный номер телефона');
            return;
        }
        window.open(\`https://wa.me/\${p}\${encoded ? '?text='+encoded : ''}\`, '_blank');
    } else if (provider === 'telegram') {
        if (!p.startsWith('996') && p.length === 9) p = '996' + p;
        else if (!p.startsWith('+')) p = '+' + p;
        window.open(\`https://t.me/\${p}\${encoded ? '?text='+encoded : ''}\`, '_blank');
    }
    
    window.closeContactModal();
};\n`;

if (!content.includes('window.sendMessage =')) {
    content += sendMessageFunc;
}

fs.writeFileSync('js/apps/salon/dashboard.js', content, 'utf8');
console.log("Replaced successfully!");
