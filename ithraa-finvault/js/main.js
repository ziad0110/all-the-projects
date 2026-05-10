// =====================================================
// MAIN ENTRY POINT — إثراء FinVault
// =====================================================
import './core/data.js';
import './core/router.js';
import './core/ui.js';

// Order matters: balance-helpers must load before features that use addTransaction
import './features/balance-helpers/balance-helpers.js';
import './features/auth/auth.js';
import './features/pin-screen/pin-screen.js';

// Education BEFORE rewards-&-gamification (depends on EducationData)
import './features/education-platform/education-platform.js';
import './features/rewards-&-gamification/rewards-&-gamification.js';
import './features/rewards/rewards.js';

import './features/ai-chat/ai-chat.js';
import './features/analytics/analytics.js';
import './features/auto-save-(radar-→-vault)/auto-save-(radar-→-vault).js';
import './features/bills/bills.js';
import './features/bridge-finance/bridge-finance.js';
import './features/bridge-finance-for-bills/bridge-finance-for-bills.js';
import './features/budget/budget.js';
import './features/cashflow-heatmap/cashflow-heatmap.js';
import './features/contract-completion-&-rating/contract-completion-&-rating.js';
import './features/contract-templates/contract-templates.js';
import './features/dashboard/dashboard.js';
import './features/dashboard-widgets/dashboard-widgets.js';
import './features/deposit-&-withdraw/deposit-&-withdraw.js';
import './features/finvision-ai/finvision-ai.js';
import './features/init/init.js';
import './features/international-transfer/international-transfer.js';
import './features/new-transfers-system/new-transfers-system.js';
import './features/notifications/notifications.js';
import './features/security/security.js';
import './features/sidebar-accordion/sidebar-accordion.js';
import './features/smart-cash-flow-radar-engine/smart-cash-flow-radar-engine.js';
import './features/smart-escrow-engine/smart-escrow-engine.js';
import './features/smart-vault/smart-vault.js';
import './features/subscriptions/subscriptions.js';
import './features/telecom-selector/telecom-selector.js';
import './features/transfers/transfers.js';
import './features/wallet/wallet.js';

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.initApp) window.initApp();
        if (window.navigateTo && document.getElementById('app-container').innerHTML.trim() === '') {
            window.navigateTo('dashboard');
        }
    }, 100);
});
