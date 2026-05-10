// =====================================================
// SMART CASH FLOW RADAR — proper Zakat (Hawl), real predictions
// =====================================================

// Nisab is configurable — based on current silver/gold price (approx values)
window.ZAKAT_CONFIG = {
    nisabSAR: 24000,    // ~595g silver in SAR (approximate, configurable)
    rate: 0.025         // 2.5%
};

window.CashFlowEngine = {
    predict30Days() {
        const balance = getAvailableBalance();
        const days = [];
        let runningBalance = balance;
        const today = new Date();

        // Calculate average daily expense from past 30 days of REAL transactions
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        const recentExpenses = AppData.transactions.filter(t =>
            t.amount < 0 && t.type === 'expense' && new Date(t.date) >= last30Days
        );
        const totalRecent = recentExpenses.reduce((a, t) => a + Math.abs(t.amount), 0);
        const avgDailyExpense = recentExpenses.length > 0 ? Math.round(totalRecent / 30) : 280;

        // Average monthly income from past 90 days
        const last90Days = new Date(today);
        last90Days.setDate(last90Days.getDate() - 90);
        const recentIncome = AppData.transactions.filter(t =>
            t.amount > 0 && t.type === 'income' && new Date(t.date) >= last90Days
        );
        const totalIncome90 = recentIncome.reduce((a, t) => a + t.amount, 0);
        const avgMonthlyIncome = Math.round(totalIncome90 / 3) || 15200;

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dayOfMonth = date.getDate();
            const dayOfWeek = date.getDay();

            // Salary on 1st of month
            let income = 0;
            if (dayOfMonth === 1) income = avgMonthlyIncome;

            // Daily expense — based on REAL avg, with weekday/weekend pattern
            let expense = avgDailyExpense * (dayOfWeek === 5 || dayOfWeek === 6 ? 1.4 : 0.9);

            // Bills due
            AppData.bills.forEach(b => {
                if (!b.paid && new Date(b.dueDate).getDate() === dayOfMonth) {
                    expense += b.amount;
                }
            });

            // Subscription charges
            if (dayOfMonth === 1 || dayOfMonth === 15) {
                expense += AppData.subscriptions.reduce((a, s) => a + s.amount / 2, 0);
            }

            runningBalance += income - expense;
            const confidence = Math.max(0.5, 1 - (i * 0.015));

            days.push({
                date: date.toISOString().split('T')[0],
                dayLabel: date.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' }),
                shortLabel: date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' }),
                income: Math.round(income),
                expense: Math.round(expense),
                balance: Math.round(runningBalance),
                confidence,
                risk: runningBalance < 5000 ? 'high' : runningBalance < 10000 ? 'medium' : 'low'
            });
        }
        return days;
    },

    calculateLiquidityScore(predictions) {
        const minBalance = Math.min(...predictions.map(p => p.balance));
        const avgBalance = predictions.reduce((a, p) => a + p.balance, 0) / predictions.length;
        const riskDays = predictions.filter(p => p.risk !== 'low').length;
        let score = 100;
        if (minBalance < 5000) score -= 30;
        else if (minBalance < 10000) score -= 15;
        score -= riskDays * 1.5;
        if (avgBalance > 20000) score += 5;
        return Math.max(10, Math.min(100, Math.round(score)));
    },

    generateAlerts(predictions) {
        const alerts = [];

        AppData.bills.filter(b => !b.paid).forEach(b => {
            const daysUntil = Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysUntil <= 3 && daysUntil >= 0) {
                alerts.push({ type: 'urgent', icon: 'fa-exclamation-triangle', color: 'rose', text: `${b.title} مستحقة خلال ${daysUntil} أيام (${b.amount} ر.س)`, billId: b.id });
            } else if (daysUntil <= 7 && daysUntil > 3) {
                alerts.push({ type: 'warning', icon: 'fa-clock', color: 'amber', text: `${b.title} مستحقة خلال ${daysUntil} أيام`, billId: b.id });
            }
        });

        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const daysToSalary = Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24));
        if (daysToSalary <= 10) {
            alerts.push({ type: 'info', icon: 'fa-money-bill-wave', color: 'emerald', text: `الراتب متوقع خلال ${daysToSalary} أيام` });
        }

        const lowDays = predictions.filter(p => p.risk === 'high');
        if (lowDays.length > 0) {
            alerts.push({ type: 'danger', icon: 'fa-chart-line', color: 'rose', text: `تحذير: ${lowDays.length} أيام بسيولة منخفضة متوقعة` });
        }

        const unused = (typeof detectUnusedSubscriptions === 'function') ? detectUnusedSubscriptions() : [];
        if (unused.length > 0) {
            const totalSavings = unused.reduce((a, s) => a + s.amount, 0);
            alerts.push({ type: 'tip', icon: 'fa-lightbulb', color: 'gold', text: `يمكنك توفير ${totalSavings} ر.س/شهرياً بإلغاء ${unused.length} اشتراكات غير مستخدمة` });
        }

        const reviewMilestones = AppData.escrowContracts.flatMap(c =>
            c.milestones.filter(m => m.status === 'review').map(m => ({ ...m, contract: c.title }))
        );
        if (reviewMilestones.length > 0) {
            const total = reviewMilestones.reduce((a, m) => a + m.amount, 0);
            alerts.push({ type: 'info', icon: 'fa-handshake', color: 'cyan', text: `${reviewMilestones.length} مراحل ضمان بانتظار الموافقة (${total.toLocaleString()} ر.س)` });
        }

        return alerts;
    },

    // =====================================================
    // ZAKAT — proper "Hawl" check + total wealth + Nisab
    // =====================================================
    getRecommendedActions(predictions, score) {
        const actions = [];
        const totalIncome = predictions.reduce((a, p) => a + p.income, 0);
        const totalExpense = predictions.reduce((a, p) => a + p.expense, 0);
        const surplus = totalIncome - totalExpense;

        // Zakat: sum of liquid + savings (NOT escrow money owed to others)
        const liquidWealth = getAvailableBalance() + getLockedInVaults();
        const nisab = window.ZAKAT_CONFIG.nisabSAR;
        const zakatRate = window.ZAKAT_CONFIG.rate;

        if (liquidWealth >= nisab) {
            // Track Hawl (Hijri-year period of holding wealth above Nisab)
            if (!AppData.user.zakatHawlStart) {
                AppData.user.zakatHawlStart = new Date().toISOString().split('T')[0];
                if (typeof markStateDirty === 'function') markStateDirty();
            }
            const hawlStartDate = new Date(AppData.user.zakatHawlStart);
            const today = new Date();
            const daysHeld = Math.floor((today - hawlStartDate) / (1000 * 60 * 60 * 24));
            const hijriYearDays = 354; // approximate Hijri year
            const hawlComplete = daysHeld >= hijriYearDays;

            const currentHijriYear = Math.floor((today - new Date('1970-01-01')) / (1000 * 60 * 60 * 24 * 354)) + 1389;
            const alreadyPaidThisYear = AppData.user.zakatLastPaidYear === currentHijriYear;

            if (alreadyPaidThisYear) {
                actions.push({
                    type: 'zakat', icon: 'fa-check-circle', color: 'emerald',
                    title: 'تم إخراج الزكاة هذا العام ✅',
                    description: 'بارك الله فيك — أديت زكاتك لهذا الحول',
                    buttonText: 'مكتمل ✓', amount: 0
                });
            } else if (!hawlComplete) {
                const daysRemaining = hijriYearDays - daysHeld;
                const zakatAmount = Math.round(liquidWealth * zakatRate);
                actions.push({
                    type: 'zakat-reminder', icon: 'fa-mosque', color: 'amber',
                    title: 'حسابك بلغ النصاب 🕌',
                    description: `الحول لم يكتمل بعد. متبقي ${daysRemaining} يوم. الزكاة المتوقعة: ${zakatAmount.toLocaleString()} ر.س`,
                    buttonText: 'تذكيرني عند اكتمال الحول', amount: 0
                });
            } else {
                const zakatAmount = Math.round(liquidWealth * zakatRate);
                actions.push({
                    type: 'zakat', icon: 'fa-mosque', color: 'emerald',
                    title: 'الزكاة الذكية',
                    description: `بلغت النصاب وانقضى الحول. الزكاة الواجبة: ${zakatAmount.toLocaleString()} ر.س (2.5% من ${liquidWealth.toLocaleString()})`,
                    buttonText: 'إخراج الزكاة', amount: zakatAmount
                });
            }
        } else {
            // Below nisab — reset hawl
            if (AppData.user.zakatHawlStart) {
                AppData.user.zakatHawlStart = null;
                if (typeof markStateDirty === 'function') markStateDirty();
            }
        }

        // Savings suggestion
        if (surplus > 0) {
            const savingsAmount = Math.round(surplus * 0.3);
            actions.push({
                type: 'savings', icon: 'fa-piggy-bank', color: 'purple',
                title: 'ادخار تلقائي ذكي',
                description: `فائض متوقع ${surplus.toLocaleString()} ر.س — نقترح ادخار 30% (${savingsAmount.toLocaleString()})`,
                buttonText: 'إيداع في الحصالة', amount: savingsAmount
            });
        }

        if (score < 50) {
            actions.push({
                type: 'loan', icon: 'fa-hand-holding-usd', color: 'amber',
                title: 'تمويل جسر مصغّر',
                description: 'سيولتك منخفضة — يمكنك طلب تمويل قصير الأجل حتى الراتب القادم',
                buttonText: 'طلب تمويل', amount: 2000
            });
        }

        if (actions.length < 3 && surplus > 3000) {
            actions.push({
                type: 'invest', icon: 'fa-chart-line', color: 'purple',
                title: 'فرصة استثمارية',
                description: `لديك فائض جيد. يمكنك استثمار ${Math.round(surplus * 0.2).toLocaleString()} ر.س`,
                buttonText: 'ابدأ الاستثمار', amount: Math.round(surplus * 0.2)
            });
        }

        return actions;
    }
};

window.initCashflowRadar = function initCashflowRadar() {
    try {
        const predictions = CashFlowEngine.predict30Days();
        const score = CashFlowEngine.calculateLiquidityScore(predictions);
        const alerts = CashFlowEngine.generateAlerts(predictions);
        const actions = CashFlowEngine.getRecommendedActions(predictions, score);

        const scoreEl = document.getElementById('radar-score');
        const ringEl = document.getElementById('radar-score-ring');
        const riskDot = document.getElementById('radar-risk-dot');
        const riskLabel = document.getElementById('radar-risk-label');

        if (scoreEl) scoreEl.textContent = score;
        if (ringEl) {
            const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
            ringEl.style.setProperty('--radar-color', color);
            ringEl.style.setProperty('--radar-percent', score);
            if (scoreEl) scoreEl.style.color = color;
        }
        if (riskDot) {
            riskDot.className = `risk-pulse ${score >= 70 ? 'risk-green' : score >= 40 ? 'risk-yellow' : 'risk-red'}`;
        }
        if (riskLabel) {
            riskLabel.textContent = score >= 70 ? 'مستقر' : score >= 40 ? 'حذر' : 'حرج';
            riskLabel.className = `text-sm ${score >= 70 ? 'text-emerald' : score >= 40 ? 'text-amber-400' : 'text-rose'}`;
        }

        const totalIncome = predictions.reduce((a, p) => a + p.income, 0);
        const totalExpense = predictions.reduce((a, p) => a + p.expense, 0);
        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val.toLocaleString(); };
        el('radar-income', totalIncome);
        el('radar-expenses', totalExpense);
        el('radar-surplus', totalIncome - totalExpense);

        renderPredictionChart(predictions);
        renderRadarAlerts(alerts);
        renderRadarActions(actions);
        renderRecurringAnalysis();
    } catch (e) { console.error('Cashflow Radar error:', e); }
};

window.renderPredictionChart = function renderPredictionChart(predictions) {
    const ctx = document.getElementById('radar-prediction-chart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts.radarPrediction) charts.radarPrediction.destroy();

    const sampled = predictions.filter((_, i) => i % 2 === 0 || i === predictions.length - 1);

    charts.radarPrediction = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sampled.map(p => p.shortLabel),
            datasets: [
                { label: 'الرصيد المتوقع', data: sampled.map(p => p.balance),
                  borderColor: '#a78bfa', backgroundColor: 'rgba(167, 139, 250, 0.1)',
                  fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3,
                  pointBackgroundColor: sampled.map(p => p.risk === 'high' ? '#ef4444' : p.risk === 'medium' ? '#f59e0b' : '#a78bfa'),
                  pointBorderColor: 'transparent', pointHoverRadius: 6 },
                { label: 'الدخل', data: sampled.map(p => p.income),
                  borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  fill: false, tension: 0.4, borderWidth: 1.5, borderDash: [5, 5],
                  // FIX: pointRadius as function uses ctx.parsed.y, not raw
                  pointRadius: (ctx) => (ctx.parsed && ctx.parsed.y > 0) ? 4 : 0,
                  pointBackgroundColor: '#10b981' },
                { label: 'المصاريف', data: sampled.map(p => p.expense),
                  borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.05)',
                  fill: false, tension: 0.4, borderWidth: 1.5, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(21, 18, 27, 0.95)',
                    titleFont: { family: 'Cairo' }, bodyFont: { family: 'Cairo' },
                    callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y.toLocaleString()} ر.س` }
                }
            },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.04)' },
                     ticks: { color: '#64748b', font: { family: 'Cairo', size: 10 }, callback: v => (v / 1000).toFixed(0) + 'k' } },
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Cairo', size: 9 }, maxRotation: 45 } }
            }
        }
    });
};

window.renderRadarAlerts = function renderRadarAlerts(alerts) {
    const container = document.getElementById('radar-alerts');
    if (!container) return;
    container.innerHTML = alerts.length ? alerts.map(a => `
        <div class="smart-alert ${a.type} animate-fade-in">
            <div class="w-8 h-8 rounded-lg bg-${a.color}/20 flex items-center justify-center flex-shrink-0">
                <i class="fas ${a.icon} text-${a.color} text-sm"></i>
            </div>
            <span class="flex-1">${escapeHtml(a.text)}</span>
            ${a.billId ? `<button class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold whitespace-nowrap" onclick="financeBill(${a.billId})"><i class="fas fa-hand-holding-usd ml-1"></i> تمويل الفاتورة</button>` : ''}
        </div>
    `).join('') : '<p class="text-center text-gray-500 text-sm py-4">لا توجد تنبيهات حالياً ✅</p>';
};

window.renderRadarActions = function renderRadarActions(actions) {
    const container = document.getElementById('radar-actions');
    if (!container) return;
    container.innerHTML = actions.map(a => `
        <div class="action-card ${a.type}" onclick="executeRadarAction('${escapeHtml(a.type)}', ${a.amount})">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-xl bg-${a.color}-500/20 flex items-center justify-center">
                    <i class="fas ${a.icon} text-${a.color}-400 text-xl"></i>
                </div>
                <h4 class="font-bold text-sm">${escapeHtml(a.title)}</h4>
            </div>
            <p class="text-xs text-gray-400 mb-4">${escapeHtml(a.description)}</p>
            <button class="w-full py-2.5 rounded-xl glass text-sm font-semibold hover:bg-white/10 transition">
                <i class="fas fa-arrow-left ml-1 text-xs"></i> ${escapeHtml(a.buttonText)}
            </button>
        </div>
    `).join('');
};

window.executeRadarAction = function executeRadarAction(type, amount) {
    if (type === 'zakat') {
        if (amount <= 0) return;
        showConfirm('إخراج الزكاة', `إخراج ${amount.toLocaleString()} ر.س كزكاة؟`, () => {
            if (amount > getAvailableBalance()) {
                showToast('رصيد غير كافٍ', 'الرصيد المتاح أقل من قيمة الزكاة', 'error');
                return;
            }
            addTransaction({
                title: 'زكاة المال', amount: -amount,
                type: 'expense', category: 'زكاة',
                icon: 'fa-mosque', color: 'emerald', notify: true
            });
            // Mark zakat as paid for this Hijri year
            const today = new Date();
            const currentHijriYear = Math.floor((today - new Date('1970-01-01')) / (1000 * 60 * 60 * 24 * 354)) + 1389;
            AppData.user.zakatLastPaidYear = currentHijriYear;
            AppData.user.zakatHawlStart = today.toISOString().split('T')[0];
            if (typeof markStateDirty === 'function') markStateDirty();

            showSuccess('بارك الله فيك 🙏', `تم إخراج ${amount.toLocaleString()} ر.س كزكاة`);
            updateBalance();
            try { initCashflowRadar(); } catch (e) {}
        });
    } else if (type === 'zakat-reminder') {
        showToast('تم التسجيل', 'سنذكرك عند اكتمال الحول الهجري', 'info');
    } else if (type === 'savings') {
        if (AppData.vaults.length > 0) {
            const vault = AppData.vaults[0];
            showConfirm('ادخار تلقائي', `إيداع ${amount.toLocaleString()} ر.س في "${vault.name}"؟`, () => {
                if (amount > getAvailableBalance()) { showToast('رصيد غير كافٍ', '', 'error'); return; }
                vault.currentAmount += amount;
                addTransaction({
                    title: `ادخار ذكي → ${vault.name}`,
                    amount: -amount, type: 'expense', category: 'ادخار',
                    icon: 'fa-piggy-bank', color: 'emerald', notify: true
                });
                showSuccess('تم الادخار', `تم إيداع ${amount.toLocaleString()} ر.س`);
                updateBalance();
            });
        } else {
            navigateTo('vault');
            showToast('نصيحة', 'أنشئ حصالة أولاً', 'info');
        }
    } else if (type === 'loan') {
        if (typeof showBridgeFinance === 'function') showBridgeFinance();
    } else if (type === 'invest') {
        navigateTo('education');
        showToast('فرصة', 'استكشف محاكي الاستثمار', 'info');
    }
};

window.renderRecurringAnalysis = function renderRecurringAnalysis() {
    const container = document.getElementById('radar-recurring');
    if (!container) return;
    const allRecurring = [
        ...AppData.subscriptions.map(s => ({
            name: s.name, amount: s.amount, lastUsed: s.lastUsed,
            isUnused: new Date(s.lastUsed) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        })),
        ...AppData.bills.filter(b => !b.paid).map(b => ({
            name: b.title, amount: b.amount, lastUsed: b.dueDate, isUnused: false
        }))
    ];

    container.innerHTML = allRecurring.map(r => {
        const daysSince = Math.floor((new Date() - new Date(r.lastUsed)) / (1000 * 60 * 60 * 24));
        return `
        <div class="recurring-item">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg ${r.isUnused ? 'bg-rose/20' : 'bg-purple-500/20'} flex items-center justify-center">
                    <i class="fas ${r.isUnused ? 'fa-exclamation' : 'fa-redo'} text-sm ${r.isUnused ? 'text-rose' : 'text-ethereal-violet'}"></i>
                </div>
                <div>
                    <p class="text-sm font-medium">${escapeHtml(r.name)}</p>
                    <p class="text-[10px] text-gray-500">${r.isUnused ? `لم يُستخدم منذ ${daysSince} يوماً` : `موعد الاستحقاق: ${escapeHtml(r.lastUsed)}`}</p>
                </div>
            </div>
            <div class="text-left">
                <p class="font-bold text-sm">${r.amount} ر.س</p>
                ${r.isUnused ? '<span class="text-[10px] text-rose">⚠️ غير مستخدم</span>' : '<span class="text-[10px] text-gray-500">شهرياً</span>'}
            </div>
        </div>`;
    }).join('');
};
