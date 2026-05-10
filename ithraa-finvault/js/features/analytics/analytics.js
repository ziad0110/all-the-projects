// =====================================================
// ANALYTICS — uses real transaction data
// =====================================================

window.initAnalytics = function initAnalytics() {
    if (typeof Chart === 'undefined') {
        // Wait briefly and retry once
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                initPieChart(); initLineChart(); initBarChart();
                updateFinancialHealthScore();
            }
        }, 500);
        return;
    }
    initPieChart();
    initLineChart();
    initBarChart();
    updateFinancialHealthScore();
};

function getCategoryBreakdown() {
    const now = new Date();
    const txs = AppData.transactions.filter(t => {
        if (t.cancelled) return false;
        if (t.amount >= 0) return false;
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const map = window._budgetCategoryMap || {};
    const totals = {};
    txs.forEach(t => {
        const cat = map[t.category] || 'أخرى';
        totals[cat] = (totals[cat] || 0) + Math.abs(t.amount);
    });
    return totals;
}

window.updateFinancialHealthScore = function updateFinancialHealthScore() {
    const el = document.getElementById('financial-health-score');
    if (!el) return;
    let score = 50;

    const totalVaults = AppData.vaults.reduce((a, v) => a + v.currentAmount, 0);
    if (totalVaults > 5000) score += 15;
    else if (totalVaults > 1000) score += 8;

    const balance = getAvailableBalance();
    if (balance > 20000) score += 15;
    else if (balance > 10000) score += 10;
    else if (balance > 5000) score += 5;

    const unpaid = AppData.bills.filter(b => !b.paid).length;
    score -= unpaid * 5;

    const debt = (typeof getOutstandingDebt === 'function') ? getOutstandingDebt() : 0;
    if (debt > 0) score -= 10;

    const now = new Date();
    const thisMonth = AppData.transactions.filter(t => {
        if (t.cancelled) return false;
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const income = thisMonth.filter(t => t.type === 'income').reduce((a, t) => a + Math.abs(t.amount), 0);
    const expense = thisMonth.filter(t => t.amount < 0)
        .reduce((a, t) => a + Math.abs(t.amount), 0);
    if (income > 0 && expense / income < 0.6) score += 10;
    else if (income > 0 && expense / income < 0.8) score += 5;

    score = Math.max(0, Math.min(100, score));
    el.textContent = score;
};

window.initDashboardChart = function initDashboardChart() {
    const ctx = document.getElementById("dashboard-chart");
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts.dashboard) charts.dashboard.destroy();

    const breakdown = getCategoryBreakdown();
    const labels = Object.keys(breakdown);
    const data = Object.values(breakdown);
    if (labels.length === 0) { labels.push('لا توجد بيانات'); data.push(1); }

    charts.dashboard = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: ["#f43f5e", "#d0bcff", "#ffb869", "#4cd7f6", "#a855f7", "#10b981", "#f97316", "#06b6d4", "#37333d"],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom", labels: { color: "#94a3b8", font: { family: "Cairo" }, padding: 15 } }
            },
            cutout: "70%"
        }
    });
};

window.initPieChart = function initPieChart() {
    const ctx = document.getElementById("pie-chart");
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts.pie) charts.pie.destroy();

    const breakdown = getCategoryBreakdown();
    const labels = Object.keys(breakdown);
    const data = Object.values(breakdown);
    if (labels.length === 0) { labels.push('لا توجد بيانات'); data.push(1); }

    charts.pie = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: ["#f43f5e", "#d0bcff", "#ffb869", "#4cd7f6", "#a855f7", "#10b981", "#f97316", "#06b6d4"],
                borderWidth: 2,
                borderColor: "#050505"
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom", labels: { color: "#94a3b8", font: { family: "Cairo" } } }
            }
        }
    });
};

function getLast6MonthsData() {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const now = new Date();
    const labels = []; const incomeArr = []; const expenseArr = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(months[d.getMonth()]);
        const inc = AppData.transactions.filter(t => {
            if (t.cancelled || t.type !== 'income') return false;
            const tx = new Date(t.date);
            return tx.getMonth() === d.getMonth() && tx.getFullYear() === d.getFullYear();
        }).reduce((a, t) => a + Math.abs(t.amount), 0);
        const exp = AppData.transactions.filter(t => {
            if (t.cancelled || t.amount >= 0) return false;
            const tx = new Date(t.date);
            return tx.getMonth() === d.getMonth() && tx.getFullYear() === d.getFullYear();
        }).reduce((a, t) => a + Math.abs(t.amount), 0);
        incomeArr.push(inc);
        expenseArr.push(exp);
    }
    return { labels, incomeArr, expenseArr };
}

window.initLineChart = function initLineChart() {
    const ctx = document.getElementById("line-chart");
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts.line) charts.line.destroy();

    const { labels, incomeArr, expenseArr } = getLast6MonthsData();

    charts.line = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                { label: "الدخل", data: incomeArr, borderColor: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.1)", fill: true, tension: 0.4 },
                { label: "الإنفاق", data: expenseArr, borderColor: "#f43f5e", backgroundColor: "rgba(244, 63, 94, 0.1)", fill: true, tension: 0.4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#94a3b8", font: { family: "Cairo" } } } },
            scales: {
                y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
                x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
            }
        }
    });
};

window.initBarChart = function initBarChart() {
    const ctx = document.getElementById("bar-chart");
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts.bar) charts.bar.destroy();

    const now = new Date();
    const weekData = (offsetMonths) => {
        const d = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
        const weeks = [0, 0, 0, 0];
        AppData.transactions.forEach(t => {
            if (t.cancelled || t.amount >= 0) return;
            const tx = new Date(t.date);
            if (tx.getMonth() !== d.getMonth() || tx.getFullYear() !== d.getFullYear()) return;
            const wk = Math.min(3, Math.floor((tx.getDate() - 1) / 7));
            weeks[wk] += Math.abs(t.amount);
        });
        return weeks;
    };

    charts.bar = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["الأسبوع 1", "الأسبوع 2", "الأسبوع 3", "الأسبوع 4"],
            datasets: [
                { label: "هذا الشهر", data: weekData(0), backgroundColor: "#d0bcff", borderRadius: 8 },
                { label: "الشهر الماضي", data: weekData(-1), backgroundColor: "rgba(208, 188, 255, 0.3)", borderRadius: 8 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#94a3b8", font: { family: "Cairo" } } } },
            scales: {
                y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
                x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
            }
        }
    });
};
