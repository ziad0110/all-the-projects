// =====================================================
// DASHBOARD WIDGETS — XSS-safe rendering
// =====================================================

window.renderDashRadarWidget = function renderDashRadarWidget() {
    if (typeof CashFlowEngine === 'undefined') return;
    const predictions = CashFlowEngine.predict30Days();
    const score = CashFlowEngine.calculateLiquidityScore(predictions);
    const cur = (typeof getCurrency === 'function') ? getCurrency() : 'ر.س';

    const ringEl = document.getElementById('dash-radar-ring');
    const scoreEl = document.getElementById('dash-radar-score');
    if (ringEl && scoreEl) {
        const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
        ringEl.style.setProperty('--radar-color', color);
        ringEl.style.setProperty('--radar-percent', score);
        scoreEl.textContent = score;
        scoreEl.style.color = color;
    }

    const eventsEl = document.getElementById('dash-radar-events');
    if (!eventsEl) return;

    const events = [];

    AppData.bills.filter(b => !b.paid).forEach(b => {
        const daysUntil = Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 7) {
            events.push({
                icon: 'fa-file-invoice',
                color: daysUntil <= 2 ? 'rose' : 'amber',
                text: `${b.title} خلال ${daysUntil} أيام`,
                sub: `${b.amount} ${cur}`
            });
        }
    });

    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const daysToSalary = Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24));
    if (daysToSalary <= 10) {
        events.push({
            icon: 'fa-money-bill-wave', color: 'emerald',
            text: `الراتب خلال ${daysToSalary} أيام`,
            sub: `15,000 ${cur}`
        });
    }

    const reviewCount = AppData.escrowContracts.flatMap(c => c.milestones.filter(m => m.status === 'review')).length;
    if (reviewCount > 0) {
        events.push({ icon: 'fa-handshake', color: 'cyan', text: `${reviewCount} مراحل بانتظار المراجعة`, sub: 'الضمان الذكي' });
    }

    const riskDays = predictions.filter(p => p.risk === 'high').length;
    if (riskDays > 0) {
        events.push({ icon: 'fa-exclamation-triangle', color: 'rose', text: `${riskDays} أيام بسيولة منخفضة`, sub: 'خلال 30 يوم' });
    }

    eventsEl.innerHTML = events.slice(0, 3).map(e => `
        <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-${e.color}/20 flex items-center justify-center flex-shrink-0">
                <i class="fas ${e.icon} text-${e.color} text-[10px]"></i>
            </div>
            <span class="text-xs flex-1">${escapeHtml(e.text)}</span>
            <span class="text-[10px] text-gray-400">${escapeHtml(e.sub)}</span>
        </div>
    `).join('');
};

window.renderDashEscrowWidget = function renderDashEscrowWidget() {
    const container = document.getElementById('dash-escrow-summary');
    if (!container) return;
    const cur = (typeof getCurrency === 'function') ? getCurrency() : 'ر.س';

    const active = AppData.escrowContracts.filter(c => c.status !== 'completed');
    const completed = AppData.escrowContracts.filter(c => c.status === 'completed');
    const lockedAmount = active.reduce((a, c) => a + (c.totalAmount - c.milestones.filter(m => m.status === 'approved').reduce((s, m) => s + m.amount, 0)), 0);

    if (AppData.escrowContracts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <p class="text-gray-400 text-sm">لا توجد عقود ضمان حالياً</p>
                <button class="mt-2 text-sm text-ethereal-cyan" onclick="navigateTo('escrow')">إنشاء عقد جديد ←</button>
            </div>`;
        return;
    }

    let html = `
        <div class="grid grid-cols-3 gap-3 mb-3">
            <div class="text-center p-2 rounded-lg glass">
                <p class="text-lg font-bold text-cyan-400">${active.length}</p>
                <p class="text-[9px] text-gray-400">نشطة</p>
            </div>
            <div class="text-center p-2 rounded-lg glass">
                <p class="text-lg font-bold text-gold">${lockedAmount.toLocaleString()}</p>
                <p class="text-[9px] text-gray-400">محجوز (${escapeHtml(cur)})</p>
            </div>
            <div class="text-center p-2 rounded-lg glass">
                <p class="text-lg font-bold text-emerald">${completed.length}</p>
                <p class="text-[9px] text-gray-400">مكتملة</p>
            </div>
        </div>`;

    if (active.length > 0) {
        const latest = active[0];
        const progress = Math.round((latest.milestones.filter(m => m.status === 'approved').length / latest.milestones.length) * 100);
        const statusLabel = (typeof EscrowEngine !== 'undefined') ? EscrowEngine.getStatusLabel(latest.status) : latest.status;
        const statusIcon = (typeof EscrowEngine !== 'undefined') ? EscrowEngine.getStatusIcon(latest.status) : 'fa-circle';

        html += `
        <div class="p-3 rounded-xl glass flex items-center gap-3">
            <div class="party-avatars">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(latest.freelancerName)}&background=06b6d4&color=fff&size=28" alt="" style="width:28px;height:28px">
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold truncate">${escapeHtml(latest.title)}</p>
                <div class="flex items-center gap-2 mt-1">
                    <div class="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-emerald to-cyan-400" style="width: ${progress}%"></div>
                    </div>
                    <span class="text-[10px] text-gray-400">${progress}%</span>
                </div>
            </div>
            <span class="escrow-badge ${latest.status}">
                <i class="fas ${statusIcon} text-[8px]"></i>
                ${escapeHtml(statusLabel)}
            </span>
        </div>`;
    }

    container.innerHTML = html;
};
