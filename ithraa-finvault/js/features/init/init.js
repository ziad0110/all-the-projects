// =====================================================
// INIT — initial dashboard load
// =====================================================
window.initApp = function initApp() {
    initDashboard();
};

window.initDashboard = function initDashboard() {
    try { updateBalance(); } catch (e) { console.error(e); }
    try { renderCards(); } catch (e) { console.error(e); }
    try { renderRecentTransactions(); } catch (e) { console.error(e); }

    // Wait for Chart.js if not yet loaded (it's loaded with `defer`)
    const initCharts = () => {
        try { if (typeof initDashboardChart === 'function') initDashboardChart(); } catch (e) { console.error(e); }
        try { if (typeof initHeatmapChart === 'function') initHeatmapChart(); } catch (e) { console.error(e); }
    };
    if (typeof Chart !== 'undefined') initCharts();
    else setTimeout(initCharts, 600);

    try { if (typeof initFinVisionAI === 'function') initFinVisionAI(); } catch (e) { console.error(e); }
    try { if (typeof renderDashboardVaults === 'function') renderDashboardVaults(); } catch (e) { console.error(e); }
    try { if (typeof renderDashRadarWidget === 'function') renderDashRadarWidget(); } catch (e) { console.error(e); }
    try { if (typeof renderDashEscrowWidget === 'function') renderDashEscrowWidget(); } catch (e) { console.error(e); }
};
