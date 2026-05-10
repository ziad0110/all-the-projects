// =====================================================
// SUBSCRIPTIONS — uses unified addTransaction for plan upgrades
// =====================================================

window.initSubscriptions = function initSubscriptions() {
    updatePlanUI(AppData.user.plan || 'free');
};

window.updatePlanUI = function updatePlanUI(plan) {
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('plan-active'));

    const planMap = { 'free': '.plan-free', 'pro': '.plan-pro', 'business': '.plan-business' };
    const activeCard = document.querySelector(planMap[plan]);
    if (activeCard) activeCard.classList.add('plan-active');

    const btnFree = document.getElementById('btn-plan-free');
    const btnPro = document.getElementById('btn-plan-pro');
    const btnBusiness = document.getElementById('btn-plan-business');

    if (btnFree) btnFree.textContent = plan === 'free' ? '✓ باقتك الحالية' : 'اختيار';
    if (btnPro) btnPro.textContent = plan === 'pro' ? '✓ باقتك الحالية' : 'ترقية الآن';
    if (btnBusiness) btnBusiness.textContent = plan === 'business' ? '✓ باقتك الحالية' : 'ترقية الآن';
};

window.selectPlan = function selectPlan(plan) {
    if (plan === AppData.user.plan) {
        showToast('تنبيه', 'أنت مشترك بالفعل في هذه الباقة', 'info');
        return;
    }

    const planNames = { 'free': 'الأساسية (المجانية)', 'pro': 'PRO الاحترافية', 'business': 'Business الأعمال' };
    const planPrices = { 'free': 0, 'pro': 29, 'business': 99 };

    const oldPlan = AppData.user.plan;
    const order = ['free', 'pro', 'business'];
    const isUpgrade = order.indexOf(plan) > order.indexOf(oldPlan);

    const action = isUpgrade ? 'ترقية' : 'تغيير';
    const cur = getCurrency();
    const priceText = planPrices[plan] > 0 ? `(${planPrices[plan]} ${cur}/شهرياً)` : '(مجاناً)';

    showConfirm(
        `${action} إلى ${planNames[plan]}`,
        `هل تريد ${action} اشتراكك إلى باقة ${planNames[plan]} ${priceText}؟`,
        () => {
            // For paid upgrades, charge the user via unified balance helper
            if (planPrices[plan] > 0 && isUpgrade) {
                if (planPrices[plan] > getAvailableBalance()) {
                    showToast('رصيد غير كافٍ', `الباقة تحتاج ${planPrices[plan]} ${cur} للاشتراك`, 'error');
                    return;
                }
                // FIX: use addTransaction (was: undefined `debitBalance`)
                addTransaction({
                    title: `اشتراك ${planNames[plan]}`,
                    amount: -planPrices[plan], type: 'expense', category: 'ترفيه',
                    icon: 'fa-crown', color: 'amber', notify: true
                });
                updateBalance();
            }

            AppData.user.plan = plan;
            updatePlanUI(plan);
            if (typeof markStateDirty === 'function') markStateDirty();

            if (isUpgrade) {
                showSuccess('🎉 تم الترقية بنجاح!', `أنت الآن مشترك في باقة ${planNames[plan]}.`);
            } else {
                showSuccess('تم التغيير', `تم تغيير اشتراكك إلى باقة ${planNames[plan]}.`);
            }
        }
    );
};
