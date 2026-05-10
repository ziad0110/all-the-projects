// =====================================================
// CASHFLOW HEATMAP — uses real data including subscriptions
// =====================================================

window.initHeatmapChart = function initHeatmapChart() {
    const ctx = document.getElementById("heatmap-chart");
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts.heatmap) charts.heatmap.destroy();

    // Real weekly forecast: bills + subscriptions + recurring monthly average
    const weekData = [0, 0, 0, 0];
    const now = new Date();

    AppData.bills.filter(b => !b.paid).forEach(b => {
        const dueDate = new Date(b.dueDate);
        const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        const weekIdx = Math.min(3, Math.max(0, Math.floor(daysDiff / 7)));
        weekData[weekIdx] += b.amount;
    });

    // Subscription cycle: half on day 1, half on day 15
    const subTotal = AppData.subscriptions.reduce((a, s) => a + s.amount, 0);
    const subPerCycle = subTotal / 2;

    // Add average daily expense from recent history
    let avgDaily = 200;
    if (typeof CashFlowEngine !== 'undefined' && CashFlowEngine.getAvgDailyExpense) {
        avgDaily = CashFlowEngine.getAvgDailyExpense();
    }
    for (let i = 0; i < 4; i++) {
        weekData[i] += avgDaily * 7;
        // Add a sub charge every other week
        if (i === 0 || i === 2) weekData[i] += subPerCycle;
    }

    const colors = weekData.map(v => v > 2000 ? '#ef4444' : v > 1000 ? '#f59e0b' : '#10b981');

    charts.heatmap = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
            datasets: [{
                label: 'المصاريف المتوقعة',
                data: weekData.map(v => Math.round(v)),
                backgroundColor: colors,
                borderRadius: 10
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false },
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Cairo' } } }
            }
        }
    });

    const alertsEl = document.getElementById("heatmap-alerts");
    if (alertsEl) {
        alertsEl.innerHTML = weekData.map((val, i) => {
            const level = val > 2000 ? 'high' : val > 1000 ? 'medium' : 'low';
            const icon = level === 'high' ? 'fa-exclamation-triangle' : level === 'medium' ? 'fa-info-circle' : 'fa-check-circle';
            const msg = level === 'high' ? 'إنفاق مرتفع متوقع' : level === 'medium' ? 'إنفاق متوسط' : 'وضع مستقر';
            return `<div class="heatmap-alert ${level}">
                <i class="fas ${icon}"></i>
                <span>الأسبوع ${i + 1}: ${Math.round(val).toLocaleString()} ر.س - ${msg}</span>
            </div>`;
        }).join("");
    }
};
