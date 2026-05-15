import { render } from './core/engine.js';
import './core/router.js'; // Imports logic
import { initData } from './state.js';
import { DATABASE } from './db.js';
import { ThemeManager } from './utils.js';

// Import ALL generated files to make sure they are evaluated and exported to window (as a fallback).
import './components/ui.js';
import './components/cards.js';
import './components/modals.js';
import './features/auth/render.js';
import './features/auth/actions.js';
import './features/booking/wizard.js';
import './features/booking/actions.js';
import './apps/client/pages.js';
import './apps/client/layout.js';
import './apps/salon/dashboard.js';
import './apps/salon/layout.js';
import './apps/admin/app.js';
import './apps/master/app.js';

// ==================== APP.JS: Инициализация ====================

window.render = render;
window.ThemeManager = ThemeManager;

// Инициализация: загрузить данные → заполнить state → первый render
(async function init() {
    ThemeManager.initTheme();
    // DATABASE определена в js/db.js
    initData(DATABASE);
    
    render();
})();

