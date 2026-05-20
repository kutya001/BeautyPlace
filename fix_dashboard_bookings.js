import fs from 'fs';

const filePath = './js/apps/salon/dashboard.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Filter bookings step (add date filtering)
const originalFilterStep = `    // 1. Filter bookings
    let filtered = [...salonBookings];`;

const newFilterStep = `    // Initialize date filter to today if not set
    if (state.salonBookingDateFilter === undefined) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        state.salonBookingDateFilter = \`\${yyyy}-\${mm}-\${dd}\`;
    }

    // 1. Filter bookings
    let filtered = [...salonBookings];
    
    // Filter by date
    if (state.salonBookingDateFilter) {
        const parts = state.salonBookingDateFilter.split('-');
        if (parts.length === 3) {
            const formattedFilterDate = \`\${parts[2]}.\${parts[1]}.\${parts[0]}\`;
            filtered = filtered.filter(b => b.date === formattedFilterDate);
        }
    }`;

if (content.includes(originalFilterStep)) {
    content = content.replace(originalFilterStep, newFilterStep);
    console.log("✓ Filter step modification set.");
} else {
    // CRLF version
    const originalFilterStepCRLF = originalFilterStep.replace(/\n/g, '\r\n');
    const newFilterStepCRLF = newFilterStep.replace(/\n/g, '\r\n');
    if (content.includes(originalFilterStepCRLF)) {
        content = content.replace(originalFilterStepCRLF, newFilterStepCRLF);
        console.log("✓ Filter step modification set (CRLF).");
    } else {
        console.log("⚠ Could not find Filter step block!");
    }
}

// 2. Modify Timeline item to include payment indicator
const originalTimelineItem = `                                         <div>
                                             <div class="font-bold text-[10px] truncate leading-tight opacity-95">\${svc ? svc.name : 'Без услуги'}</div>
                                             <div class="text-[9px] font-medium truncate opacity-70 mt-0.5">\${booking.clientName}</div>
                                         </div>`;

const newTimelineItem = `                                         <div>
                                             <div class="font-bold text-[10px] truncate leading-tight opacity-95 flex items-center gap-1">
                                                 \${booking.paid ? '<span class="text-green-500 font-extrabold text-[11px] leading-none" title="Оплачено">🟢</span>' : '<span class="text-red-500 font-extrabold text-[11px] leading-none" title="Не оплачено">🔴</span>'}
                                                 <span class="truncate">\${svc ? svc.name : 'Без услуги'}</span>
                                             </div>
                                             <div class="text-[9px] font-medium truncate opacity-70 mt-0.5">\${booking.clientName}</div>
                                         </div>`;

if (content.includes(originalTimelineItem)) {
    content = content.replace(originalTimelineItem, newTimelineItem);
    console.log("✓ Timeline item modification set.");
} else {
    const originalTimelineItemCRLF = originalTimelineItem.replace(/\n/g, '\r\n');
    const newTimelineItemCRLF = newTimelineItem.replace(/\n/g, '\r\n');
    if (content.includes(originalTimelineItemCRLF)) {
        content = content.replace(originalTimelineItemCRLF, newTimelineItemCRLF);
        console.log("✓ Timeline item modification set (CRLF).");
    } else {
        console.log("⚠ Could not find Timeline item block!");
    }
}

// 3. Render Date Filter UI inside search/filters area
const originalSearchStep = `            <div class="relative w-full lg:w-80">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-system-muted opacity-60">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </span>
                <input type="text" class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-system-border outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-system-main" placeholder="Поиск по клиенту, телефону..." value="\${state.bookingSearchQuery || ''}" oninput="state.bookingSearchQuery=this.value; render()">
            </div>`;

const newSearchStep = `            <div class="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
                <div class="relative w-full lg:w-80">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-system-muted opacity-60">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </span>
                    <input type="text" class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-system-border outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-system-main" placeholder="Поиск по клиенту, телефону..." value="\${state.bookingSearchQuery || ''}" oninput="state.bookingSearchQuery=this.value; render()">
                </div>
                
                <!-- ФИЛЬТР ПО ДАТЕ -->
                <div class="flex items-center gap-1.5 w-full sm:w-auto">
                    <span class="text-xs font-bold text-system-muted whitespace-nowrap">Дата:</span>
                    <input type="date" 
                           class="px-3 py-2 text-xs font-bold rounded-xl border border-system-border bg-system-main text-system-text outline-none focus:ring-2 focus:ring-primary-100 shadow-sm transition-all cursor-pointer h-[38px] \${state.salonBookingDateFilter ? 'border-primary-400 font-bold text-primary-600 bg-primary-50/10' : ''}" 
                           value="\${state.salonBookingDateFilter || ''}" 
                           onchange="state.salonBookingDateFilter=this.value; render();">
                    \${state.salonBookingDateFilter ? \`
                        <button onclick="state.salonBookingDateFilter=''; render();" class="px-2.5 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all h-[38px] flex items-center justify-center border border-dashed border-red-200" title="Все даты">
                            Все даты
                        </button>
                    \` : \`
                        <button onclick="const today = new Date(); const yyyy = today.getFullYear(); const mm = String(today.getMonth() + 1).padStart(2,'0'); const dd = String(today.getDate()).padStart(2,'0'); state.salonBookingDateFilter=\\\`\\\${yyyy}-\\\${mm}-\\\${dd}\\\`; render();" class="px-2.5 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 rounded-xl transition-all h-[38px] flex items-center justify-center border border-primary-200" title="Сегодня">
                            Сегодня
                        </button>
                    \`}
                </div>
            </div>`;

if (content.includes(originalSearchStep)) {
    content = content.replace(originalSearchStep, newSearchStep);
    console.log("✓ Search step configuration modified.");
} else {
    const originalSearchStepCRLF = originalSearchStep.replace(/\n/g, '\r\n');
    const newSearchStepCRLF = newSearchStep.replace(/\n/g, '\r\n');
    if (content.includes(originalSearchStepCRLF)) {
        content = content.replace(originalSearchStepCRLF, newSearchStepCRLF);
        console.log("✓ Search step configuration modified (CRLF).");
    } else {
        console.log("⚠ Could not find Search step block!");
    }
}

// 4. Modify Status Column to render Payment Badge stacked alongside Booking Status
const originalTableStatus = `                                \${activeColumns.includes('status') ? \`<td data-label="Статус" class="p-3 flex justify-end md:table-cell"><span class="badge \\\${statusColors[b.status]}">\\\${statusLabels[b.status]}</span></td>\` : ''}`;

const newTableStatus = `                                \${activeColumns.includes('status') ? \`
                                <td data-label="Статус" class="p-3 text-right md:text-left">
                                    <div class="flex flex-col md:items-start items-end gap-1">
                                        <span class="badge \${statusColors[b.status]}">\${statusLabels[b.status]}</span>
                                        \${b.paid ? \`
                                            <span class="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100" title="Оплачено">
                                                🟢 Оплачено
                                            </span>
                                        \` : \`
                                            <span class="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100" title="Не оплачено">
                                                🔴 Не оплачено
                                            </span>
                                        \`}
                                    </div>
                                </td>\` : ''}`;

if (content.includes(originalTableStatus)) {
    content = content.replace(originalTableStatus, newTableStatus);
    console.log("✓ Table status modification set.");
} else {
    // try different indentations or CRLF
    const originalTableStatusCRLF = originalTableStatus.replace(/\n/g, '\r\n');
    const newTableStatusCRLF = newTableStatus.replace(/\n/g, '\r\n');
    if (content.includes(originalTableStatusCRLF)) {
        content = content.replace(originalTableStatusCRLF, newTableStatusCRLF);
        console.log("✓ Table status modification set (CRLF).");
    } else {
         // let's do a more robust regex-like match
         console.log("⚠ Could not find absolute Table Status block, trying fallback strings...");
         const simplerTarget = `\${activeColumns.includes('status') ? \`<td data-label="Статус" class="p-3 flex justify-end md:table-cell"><span class="badge \${statusColors[b.status]}">\${statusLabels[b.status]}</span></td>\` : ''}`;
         const simplerTargetCRLF = simplerTarget.replace(/\n/g, '\r\n');
         if (content.includes(simplerTarget)) {
             content = content.replace(simplerTarget, newTableStatus);
             console.log("✓ Solved with simpler target (LF)");
         } else if (content.includes(simplerTargetCRLF)) {
             content = content.replace(simplerTargetCRLF, newTableStatusCRLF);
             console.log("✓ Solved with simpler target (CRLF)");
         } else {
             console.log("⚠ Could not replace Table Status via string replacement! Let's fail back to exact visual replace");
         }
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done!");
