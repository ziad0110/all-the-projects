// =====================================================
// SMART VAULT — fixed iconColor→color, partial withdraw, accurate dates
// =====================================================
window.initVault = function initVault() {
    renderVaults();
    updateVaultStats();
};

window.renderVaults = function renderVaults() {
    const container = document.getElementById("vaults-list");
    if (!container) return;
    container.innerHTML = AppData.vaults.map(v => {
        const percent = Math.round((v.currentAmount / v.targetAmount) * 100);
        const unlockDate = new Date(v.createdAt);
        unlockDate.setMonth(unlockDate.getMonth() + v.durationMonths);
        const now = new Date();
        const isUnlocked = now >= unlockDate || v.currentAmount >= v.targetAmount;
        const diff = unlockDate - now;
        const daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

        // FIX: accurate month/day calculation using actual calendar months
        let monthsLeft = 0;
        let remainDays = daysLeft;
        if (daysLeft > 0) {
            const tmp = new Date(now);
            while (true) {
                const next = new Date(tmp);
                next.setMonth(next.getMonth() + 1);
                if (next > unlockDate) break;
                tmp.setMonth(tmp.getMonth() + 1);
                monthsLeft++;
            }
            remainDays = Math.max(0, Math.ceil((unlockDate - tmp) / (1000 * 60 * 60 * 24)));
        }

        return `
            <div class="vault-card ${isUnlocked ? 'vault-unlocked' : 'vault-locked'}">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-bold">${escapeHtml(v.name)}</h4>
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold ${isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">
                        ${isUnlocked ? 'مفتوحة ✅' : 'مقفلة 🔒'}
                    </span>
                </div>
                ${!isUnlocked ? `
                <div class="vault-countdown mb-4">
                    <div class="vault-countdown-unit">
                        <div class="number">${monthsLeft}</div>
                        <div class="label">شهر</div>
                    </div>
                    <div class="vault-countdown-unit">
                        <div class="number">${remainDays}</div>
                        <div class="label">يوم</div>
                    </div>
                </div>` : ''}
                <div class="vault-progress mb-2">
                    <div class="vault-progress-fill" style="width: ${Math.min(percent, 100)}%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-400 mb-4">
                    <span>${v.currentAmount.toLocaleString()} ر.س</span>
                    <span>الهدف: ${v.targetAmount.toLocaleString()} ر.س (${percent}%)</span>
                </div>
                <div class="flex gap-2">
                    <button class="vault-add-btn flex-1" onclick="addToVault(${v.id})">
                        <i class="fas fa-plus ml-1"></i> إيداع
                    </button>
                    ${isUnlocked && v.currentAmount > 0 ? `<button class="vault-add-btn flex-1" style="color: #10b981;" onclick="withdrawVault(${v.id})">
                        <i class="fas fa-unlock ml-1"></i> سحب
                    </button>` : ''}
                </div>
            </div>
        `;
    }).join("");
};

window.renderDashboardVaults = function renderDashboardVaults() {
    const container = document.getElementById("dashboard-vaults");
    if (!container) return;
    const top2 = AppData.vaults.slice(0, 2);
    container.innerHTML = top2.map(v => {
        const percent = Math.round((v.currentAmount / v.targetAmount) * 100);
        return `
            <div class="flex items-center justify-between p-3 rounded-xl glass">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <i class="fas fa-lock text-amber-400 text-sm"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-sm">${escapeHtml(v.name)}</p>
                        <p class="text-xs text-gray-400">${v.currentAmount.toLocaleString()} / ${v.targetAmount.toLocaleString()} ر.س</p>
                    </div>
                </div>
                <span class="font-bold text-sm text-purple-400">${percent}%</span>
            </div>
        `;
    }).join("");
};

window.updateVaultStats = function updateVaultStats() {
    const totalSaved = AppData.vaults.reduce((a, v) => a + v.currentAmount, 0);
    const lockedCount = AppData.vaults.filter(v => {
        const unlockDate = new Date(v.createdAt);
        unlockDate.setMonth(unlockDate.getMonth() + v.durationMonths);
        return new Date() < unlockDate && v.currentAmount < v.targetAmount;
    }).length;
    const totalEl = document.getElementById("vault-total-saved");
    const lockedEl = document.getElementById("vault-locked-count");
    if (totalEl) totalEl.textContent = totalSaved.toLocaleString() + " ر.س";
    if (lockedEl) lockedEl.textContent = lockedCount;
};

window.createVault = function createVault() {
    const name = document.getElementById("vault-name").value?.trim();
    const target = parseFloat(document.getElementById("vault-target").value);
    const duration = parseInt(document.getElementById("vault-duration").value);
    if (!name) { showToast("تنبيه", "يرجى إدخال اسم الحصالة", "error"); return; }
    if (!target || isNaN(target) || target <= 0) {
        showToast("تنبيه", "يرجى إدخال مبلغ مستهدف صحيح أكبر من صفر", "error"); return;
    }
    if (!duration || duration < 1) {
        showToast("تنبيه", "يرجى اختيار مدة قفل صحيحة", "error"); return;
    }
    AppData.vaults.push({
        id: Date.now(), name, targetAmount: target, currentAmount: 0,
        durationMonths: duration, createdAt: new Date().toISOString().split("T")[0], isLocked: true
    });
    document.getElementById("vault-name").value = "";
    document.getElementById("vault-target").value = "";
    if (typeof markStateDirty === 'function') markStateDirty();
    showSuccess("تم الإنشاء", `تم إنشاء حصالة "${name}" وقفلها لمدة ${duration} شهر`);
    initVault();
};

// =====================================================
// ADD TO VAULT — uses unified addTransaction()
// =====================================================
window.addToVault = function addToVault(id) {
    const vault = AppData.vaults.find(v => v.id === id);
    if (!vault) return;

    const nameEl = document.getElementById("deposit-vault-name");
    const inputEl = document.getElementById("deposit-amount-input");
    if (nameEl) nameEl.textContent = vault.name;
    if (inputEl) inputEl.value = "";
    showModal("deposit-modal");

    const btn = document.getElementById("confirm-deposit-btn");
    if (!btn) return;
    btn.onclick = () => {
        const amount = parseFloat(document.getElementById("deposit-amount-input").value);
        if (isNaN(amount) || amount <= 0) {
            showToast("خطأ", "يرجى إدخال مبلغ صحيح", "error"); return;
        }
        if (amount > getAvailableBalance()) {
            showToast("رصيد غير كافٍ", "المبلغ المطلوب أكبر من رصيدك الحالي", "error"); return;
        }

        vault.currentAmount += amount;
        // FIX: Use addTransaction (handles balance), and use 'color' (not iconColor)
        // FIX: Use Arabic 'ادخار' category to match challenge mapping
        addTransaction({
            title: `إيداع في حصالة: ${vault.name}`,
            amount: -amount, type: 'expense', category: 'ادخار',
            icon: "fa-lock", color: "amber", notify: true
        });

        closeModal("deposit-modal");
        showSuccess("تم الإيداع", `تم إيداع ${amount.toLocaleString()} ر.س في ${vault.name}`);
        updateBalance();
        if (typeof renderTransactions === 'function') renderTransactions();
        initVault();
    };
};

// =====================================================
// WITHDRAW FROM VAULT — partial withdrawal supported
// =====================================================
window.withdrawVault = function withdrawVault(id) {
    const vault = AppData.vaults.find(v => v.id === id);
    if (!vault) return;
    if (vault.currentAmount <= 0) {
        showToast('تنبيه', 'الحصالة فارغة', 'error');
        return;
    }
    // Show modal allowing partial withdraw
    const html = `
        <div style="text-align:right;">
            <p style="font-size:0.85rem;color:#9ca3af;margin-bottom:8px;">المتاح في "${escapeHtml(vault.name)}": <strong style="color:#10b981">${vault.currentAmount.toLocaleString()} ر.س</strong></p>
            <input type="number" id="vault-withdraw-amount" class="premium-input" style="width:100%;text-align:center;font-size:1.1rem;" placeholder="المبلغ المطلوب سحبه" min="1" max="${vault.currentAmount}">
            <div style="display:flex;gap:8px;margin-top:10px;">
                <button class="flex-1 py-2 rounded-lg glass text-xs" onclick="document.getElementById('vault-withdraw-amount').value='${Math.round(vault.currentAmount/4)}'">25%</button>
                <button class="flex-1 py-2 rounded-lg glass text-xs" onclick="document.getElementById('vault-withdraw-amount').value='${Math.round(vault.currentAmount/2)}'">50%</button>
                <button class="flex-1 py-2 rounded-lg glass text-xs" onclick="document.getElementById('vault-withdraw-amount').value='${vault.currentAmount}'">الكل</button>
            </div>
        </div>
    `;
    document.getElementById('confirm-title').textContent = `سحب من "${vault.name}"`;
    document.getElementById('confirm-message').innerHTML = html;
    const btnWrap = document.getElementById('confirm-btn-wrap');
    if (btnWrap) {
        btnWrap.style.display = '';
        btnWrap.innerHTML = `
            <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">إلغاء</button>
            <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald to-cyan-400 text-white text-sm font-bold" onclick="executeVaultWithdraw(${vault.id})">سحب</button>
        `;
    }
    showModal('confirm-modal');
};

window.executeVaultWithdraw = function executeVaultWithdraw(id) {
    const vault = AppData.vaults.find(v => v.id === id);
    if (!vault) return;
    const amount = parseFloat(document.getElementById('vault-withdraw-amount')?.value);
    if (!amount || amount <= 0) { showToast('تنبيه', 'يرجى إدخال مبلغ صحيح', 'error'); return; }
    if (amount > vault.currentAmount) { showToast('خطأ', 'المبلغ المطلوب أكبر من رصيد الحصالة', 'error'); return; }

    vault.currentAmount -= amount;
    addTransaction({
        title: `سحب من حصالة: ${vault.name}`,
        amount: amount, type: 'income', category: 'استرداد',
        icon: "fa-unlock", color: "emerald", notify: true
    });

    closeModal('confirm-modal');
    showSuccess("تم السحب", `تم إضافة ${amount.toLocaleString()} ر.س إلى رصيدك`);
    updateBalance();
    if (typeof renderTransactions === 'function') renderTransactions();
    initVault();
};

// =====================================================
// ROUND-UP TOGGLE
// =====================================================
window.toggleRoundup = function toggleRoundup(el) {
    roundupEnabled = !roundupEnabled;
    if (el) el.classList.toggle("active");
    try { localStorage.setItem('ithraa_roundup', String(roundupEnabled)); } catch (e) {}
    showToast(roundupEnabled ? "تم التفعيل" : "تم الإيقاف",
        roundupEnabled ? "تقريب الفكة مفعّل — سيُحوَّل الفرق للحصالة الأولى" : "تقريب الفكة معطّل");
};

try { roundupEnabled = localStorage.getItem('ithraa_roundup') === 'true'; } catch (e) {}
