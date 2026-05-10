// =====================================================
// REWARDS — page entry point
// =====================================================
// All rendering & gamification logic lives in rewards-&-gamification.js.
// This file exists as a placeholder/entry-point referenced by main.js
// (in case it's referenced separately).

if (typeof window.initRewards !== 'function') {
    window.initRewards = function initRewards() {
        console.warn('initRewards from gamification module not loaded yet');
    };
}
