// =====================================================
// FINVISION — rule-based banner with REAL data analysis
// (renamed from "AI" to "ذكاء قواعدي" to be honest)
// =====================================================
window.initFinVisionAI = function initFinVisionAI() {
    const bannerEl = document.getElementById("ai-banner-text");
    if (!bannerEl) return;
    const cur = getCurrency();

    try {
        const predictions = CashFlowEngine.predict30Days();
        const score = CashFlowEngine.calculateLiquidityScore(predictions);
        const unusedSubs = detectUnusedSubscriptions();
        const liquid = getAvailableBalance() + getLockedInVaults();
        const nisab = (window.ZAKAT_CONFIG && window.ZAKAT_CONFIG.nisabSAR) || 24000;

        if (score < 40) {
            bannerEl.textContent = `⚠️ تحذير: مؤشر السيولة ${score}/100. يمكنك طلب تمويل قصير الأجل من رادار التدفق.`;
        } else if (unusedSubs.length > 0) {
            const totalSave = unusedSubs.reduce((a, s) => a + s.amount, 0);
            bannerEl.textContent = `💡 يمكنك توفير ${totalSave} ${cur} شهرياً بإلغاء ${unusedSubs.length} اشتراكات غير مستخدمة. تفقّد الرادار للتفاصيل.`;
        } else if (liquid >= nisab) {
            const zakat = Math.round(liquid * 0.025);
            bannerEl.textContent = `🕌 ثروتك السائلة بلغت النصاب. الزكاة المتوقعة عند اكتمال الحول: ${zakat.toLocaleString()} ${cur}.`;
        } else if (score >= 70) {
            bannerEl.textContent = `✅ وضعك المالي مستقر (مؤشر السيولة: ${score}/100). استمر في الادخار 💪`;
        } else {
            bannerEl.textContent = `⚠️ مؤشر السيولة: ${score}/100 — انتبه للمصاريف القادمة.`;
        }
    } catch (e) {
        const unusedSubs = detectUnusedSubscriptions();
        if (unusedSubs.length > 0) {
            const sub = unusedSubs[0];
            const daysSince = Math.floor((new Date() - new Date(sub.lastUsed)) / (1000 * 60 * 60 * 24));
            bannerEl.textContent = `لديك اشتراك "${sub.name}" لم تستخدمه منذ ${daysSince} يوماً. وفّر ${sub.amount} ${cur} شهرياً بإلغائه.`;
        } else {
            bannerEl.textContent = "وضعك المالي مستقر. استمر في الادخار! 💪";
        }
    }
};

// =====================================================
// Detect unused subscriptions — based on REAL transaction data
// =====================================================
window.detectUnusedSubscriptions = function detectUnusedSubscriptions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return AppData.subscriptions.filter(s => {
        // Check transactions for actual usage (matching subscription name)
        const recentUsage = AppData.transactions.find(t =>
            (t.title || '').includes(s.name) &&
            new Date(t.date) >= thirtyDaysAgo
        );
        // If lastUsed is old AND no recent transaction matches, mark unused
        return new Date(s.lastUsed) < thirtyDaysAgo && !recentUsage && s.status === "active";
    });
};

window.dismissAiBanner = function dismissAiBanner() {
    const banner = document.querySelector(".ai-banner");
    if (banner) {
        banner.style.opacity = "0";
        banner.style.transform = "translateY(-20px)";
        setTimeout(() => banner.remove(), 300);
    }
};
