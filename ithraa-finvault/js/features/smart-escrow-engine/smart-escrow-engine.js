// =====================================================
// SMART ESCROW ENGINE — proper trust score, in-progress fix, ratings
// =====================================================
window.EscrowEngine = {
    getStatusLabel(status) {
        const labels = {
            'draft': 'مسودة', 'locked': 'محجوز', 'in-progress': 'قيد التنفيذ',
            'review': 'بانتظار المراجعة', 'approved': 'معتمد', 'disputed': 'متنازع عليه',
            'completed': 'مكتمل', 'pending': 'في الانتظار'
        };
        return labels[status] || status;
    },

    getStatusIcon(status) {
        const icons = {
            'approved': 'fa-check-circle',
            'in-progress': 'fa-spinner fa-spin', // FIX: add fa-spin so it actually animates
            'review': 'fa-eye',
            'pending': 'fa-clock',
            'disputed': 'fa-exclamation-circle',
            'completed': 'fa-check-double'
        };
        return icons[status] || 'fa-circle';
    },

    getMilestoneDotClass(status) {
        const classes = {
            'approved': 'completed', 'in-progress': 'current', 'review': 'review-dot',
            'pending': 'pending-dot', 'disputed': 'disputed-dot'
        };
        return classes[status] || '';
    },

    calculateProgress(contract) {
        const approved = contract.milestones.filter(m => m.status === 'approved').length;
        return Math.round((approved / contract.milestones.length) * 100);
    },

    getReleasedAmount(contract) {
        return contract.milestones.filter(m => m.status === 'approved').reduce((a, m) => a + m.amount, 0);
    },

    getLockedAmount(contract) {
        return contract.totalAmount - this.getReleasedAmount(contract);
    },

    // =====================================================
    // TRUST SCORE — uses ratings, completion %, on-time
    // =====================================================
    calculateTrustScore() {
        const contracts = AppData.escrowContracts;
        if (contracts.length === 0) return 95; // default for new users

        const completed = contracts.filter(c => c.status === 'completed');
        const disputed = contracts.filter(c => c.status === 'disputed');

        // Component 1: completion rate (50%)
        const completionRate = (completed.length / contracts.length) * 100;

        // Component 2: ratings average (30%)
        let avgRating = 5;
        const allRatings = contracts.flatMap(c => c.ratings || []);
        if (allRatings.length > 0) {
            avgRating = allRatings.reduce((a, r) => a + r.rating, 0) / allRatings.length;
        }
        const ratingScore = (avgRating / 5) * 100;

        // Component 3: dispute penalty (20%)
        const disputePenalty = (disputed.length / contracts.length) * 100;

        const score = Math.round(0.5 * completionRate + 0.3 * ratingScore + 0.2 * (100 - disputePenalty));
        return Math.max(0, Math.min(100, score));
    }
};

window.initEscrow = function initEscrow() {
    renderEscrowContracts();
    updateEscrowStats();
};

window.updateEscrowStats = function updateEscrowStats() {
    const cur = getCurrency();
    const active = AppData.escrowContracts.filter(c => c.status !== 'completed');
    const completed = AppData.escrowContracts.filter(c => c.status === 'completed');
    const lockedAmount = active.reduce((a, c) => a + EscrowEngine.getLockedAmount(c), 0);

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('escrow-active-count', active.length);
    el('escrow-locked-amount', lockedAmount.toLocaleString() + ' ' + cur);
    el('escrow-completed-count', completed.length);

    const trustScore = EscrowEngine.calculateTrustScore();
    const trustValueEl = document.getElementById('trust-score-value');
    const trustBarEl = document.getElementById('trust-meter-bar');
    if (trustValueEl) trustValueEl.textContent = trustScore + '%';
    if (trustBarEl) trustBarEl.style.width = trustScore + '%';
};

window.renderEscrowContracts = function renderEscrowContracts() {
    const container = document.getElementById('escrow-contracts-list');
    if (!container) return;
    const cur = getCurrency();

    container.innerHTML = AppData.escrowContracts.map(contract => {
        const progress = EscrowEngine.calculateProgress(contract);
        const released = EscrowEngine.getReleasedAmount(contract);
        const locked = EscrowEngine.getLockedAmount(contract);

        return `
        <div class="escrow-contract animate-fade-in">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h4 class="font-bold">${escapeHtml(contract.title)}</h4>
                    <p class="text-xs text-gray-400">أنشئ في ${escapeHtml(contract.createdAt)}</p>
                </div>
                <span class="escrow-badge ${contract.status}">
                    <i class="fas ${EscrowEngine.getStatusIcon(contract.status)} text-[8px]"></i>
                    ${EscrowEngine.getStatusLabel(contract.status)}
                </span>
            </div>

            <div class="flex items-center gap-3 mb-4 p-3 rounded-xl glass">
                <div class="party-avatars">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(contract.clientName)}&background=8b5cf6&color=fff" alt="">
                    <div class="party-connector"></div>
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(contract.freelancerName)}&background=06b6d4&color=fff" alt="">
                </div>
                <div class="flex-1">
                    <p class="text-xs text-gray-400">${escapeHtml(contract.clientName)} ← ${escapeHtml(contract.freelancerName)}</p>
                </div>
            </div>

            <div class="escrow-amount-locked mb-4">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-[10px] text-gray-400">محجوز</p>
                        <p class="font-bold text-gold">${locked.toLocaleString()} ${escapeHtml(cur)}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-[10px] text-gray-400">الإجمالي</p>
                        <p class="font-bold">${contract.totalAmount.toLocaleString()} ${escapeHtml(cur)}</p>
                    </div>
                    <div class="text-left">
                        <p class="text-[10px] text-gray-400">تم تحريره</p>
                        <p class="font-bold text-emerald">${released.toLocaleString()} ${escapeHtml(cur)}</p>
                    </div>
                </div>
                <div class="progress-bar mt-3">
                    <div class="progress-fill" style="width: ${progress}%; background: linear-gradient(90deg, #10b981, #4cd7f6);"></div>
                </div>
                <p class="text-[10px] text-gray-400 mt-1 text-center">${progress}% مكتمل</p>
            </div>

            <h5 class="text-sm font-bold mb-3">المراحل</h5>
            <div class="milestone-timeline">
                ${contract.milestones.map(m => `
                    <div class="milestone-item">
                        <div class="milestone-dot ${EscrowEngine.getMilestoneDotClass(m.status)}"></div>
                        <div class="milestone-content">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-semibold">${escapeHtml(m.title)}</span>
                                <span class="escrow-badge ${m.status}">
                                    ${EscrowEngine.getStatusLabel(m.status)}
                                </span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-gray-400">${m.amount.toLocaleString()} ${escapeHtml(cur)}</span>
                                <div class="flex gap-1">
                                    ${m.status === 'in-progress' ? `<button class="escrow-action-btn submit" onclick="submitMilestone(${contract.id}, ${m.id})"><i class="fas fa-upload"></i> تسليم</button>` : ''}
                                    ${m.status === 'review' ? `<button class="escrow-action-btn approve" onclick="approveMilestone(${contract.id}, ${m.id})"><i class="fas fa-check"></i> قبول</button>
                                        <button class="escrow-action-btn dispute" onclick="disputeMilestone(${contract.id}, ${m.id})"><i class="fas fa-times"></i> اعتراض</button>` : ''}
                                </div>
                            </div>
                            ${m.approvedAt ? `<p class="text-[10px] text-emerald mt-1"><i class="fas fa-check-circle ml-1"></i>تم القبول: ${escapeHtml(m.approvedAt)}</p>` : ''}
                            ${m.submittedAt && m.status === 'review' ? `<p class="text-[10px] text-purple-400 mt-1"><i class="fas fa-clock ml-1"></i>تم التسليم: ${escapeHtml(m.submittedAt)}</p>` : ''}
                            ${m.status === 'disputed' ? `<button class="escrow-action-btn approve mt-2" onclick="resolveDispute(${contract.id}, ${m.id})"><i class="fas fa-gavel"></i> حل النزاع</button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            ${contract.status === 'completed' && (!contract.ratings || contract.ratings.length === 0) ? `
            <button class="mt-4 w-full py-2 rounded-xl glass text-sm" onclick="rateContract(${contract.id})">
                <i class="fas fa-star ml-1 text-amber-400"></i> قيّم الخدمة
            </button>` : ''}
        </div>`;
    }).join('');
};

window.addMilestoneInput = function addMilestoneInput() {
    const container = document.getElementById('escrow-milestones-inputs');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'milestone-input-row';
    const count = container.children.length + 1;
    row.innerHTML = `
        <input type="text" class="premium-input" placeholder="وصف المرحلة ${count}">
        <input type="number" class="premium-input" style="max-width:120px" placeholder="المبلغ" min="0" step="50">
        <button class="remove-milestone-btn" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(row);
};

window.createEscrowContract = function createEscrowContract() {
    const title = document.getElementById('escrow-title')?.value?.trim();
    const party = document.getElementById('escrow-party')?.value?.trim();
    const amount = parseFloat(document.getElementById('escrow-amount')?.value);

    if (!title) { showToast('تنبيه', 'يرجى إدخال عنوان المشروع', 'error'); return; }
    if (!party) { showToast('تنبيه', 'يرجى إدخال اسم الطرف الآخر', 'error'); return; }
    if (!amount || isNaN(amount) || amount <= 0) {
        showToast('تنبيه', 'يرجى إدخال مبلغ صحيح', 'error'); return;
    }
    if (amount > getAvailableBalance()) {
        showToast('رصيد غير كافٍ', 'المبلغ المطلوب أكبر من رصيدك', 'error'); return;
    }

    const rows = document.querySelectorAll('#escrow-milestones-inputs .milestone-input-row');
    const milestones = [];
    rows.forEach((row, i) => {
        const inputs = row.querySelectorAll('input');
        const mTitle = inputs[0]?.value?.trim();
        const mAmount = parseFloat(inputs[1]?.value);
        if (mTitle && mAmount > 0) {
            milestones.push({
                id: i + 1, title: mTitle, amount: mAmount,
                status: i === 0 ? 'in-progress' : 'pending',
                submittedAt: null, approvedAt: null
            });
        }
    });

    if (milestones.length === 0) { showToast('تنبيه', 'يرجى إضافة مرحلة واحدة على الأقل', 'error'); return; }

    const milestoneTotal = milestones.reduce((a, m) => a + m.amount, 0);
    if (Math.abs(milestoneTotal - amount) > 0.01) {
        showToast('خطأ', `مجموع المراحل (${milestoneTotal}) لا يطابق الإجمالي (${amount})`, 'error'); return;
    }

    showConfirm('تأكيد حجز المبلغ', `سيتم حجز ${amount.toLocaleString()} ر.س لعقد "${title}"`, () => {
        // FIX: Use addTransaction so balance updates properly
        addTransaction({
            title: `حجز ضمان: ${title}`,
            amount: -amount, type: 'transfer', category: 'تحويل',
            icon: 'fa-handshake', color: 'cyan', notify: true
        });
        AppData.escrowContracts.unshift({
            id: Date.now(), title, clientName: AppData.user.name, freelancerName: party,
            totalAmount: amount, status: 'in-progress', createdAt: new Date().toISOString().split('T')[0],
            milestones, ratings: []
        });

        document.getElementById('escrow-title').value = '';
        document.getElementById('escrow-party').value = '';
        document.getElementById('escrow-amount').value = '';
        document.getElementById('escrow-milestones-inputs').innerHTML = `
            <div class="milestone-input-row">
                <input type="text" class="premium-input" placeholder="وصف المرحلة الأولى">
                <input type="number" class="premium-input" style="max-width:120px" placeholder="المبلغ">
            </div>`;

        showSuccess('تم إنشاء العقد', `تم حجز ${amount.toLocaleString()} ر.س بنجاح`);
        updateBalance();
        initEscrow();
    });
};

window.submitMilestone = function submitMilestone(contractId, milestoneId) {
    const contract = AppData.escrowContracts.find(c => c.id === contractId);
    const milestone = contract?.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    showConfirm('تأكيد التسليم', `تسليم مرحلة "${milestone.title}"؟`, () => {
        milestone.status = 'review';
        milestone.submittedAt = new Date().toISOString().split('T')[0];
        if (typeof markStateDirty === 'function') markStateDirty();
        showSuccess('تم التسليم', 'المرحلة بانتظار مراجعة العميل');
        renderEscrowContracts();
    });
};

window.approveMilestone = function approveMilestone(contractId, milestoneId) {
    const contract = AppData.escrowContracts.find(c => c.id === contractId);
    const milestone = contract?.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    showConfirm('قبول المرحلة', `قبول "${milestone.title}" وتحرير ${milestone.amount.toLocaleString()} ر.س؟`, () => {
        milestone.status = 'approved';
        milestone.approvedAt = new Date().toISOString().split('T')[0];

        const nextPending = contract.milestones.find(m => m.status === 'pending');
        if (nextPending) nextPending.status = 'in-progress';

        const allApproved = contract.milestones.every(m => m.status === 'approved');
        if (allApproved) {
            contract.status = 'completed';
            // Auto-prompt for rating
            showSuccess('تم اكتمال العقد', 'يمكنك تقييم الخدمة الآن');
        } else {
            showSuccess('تم القبول', `تم تحرير ${milestone.amount.toLocaleString()} ر.س`);
        }
        if (typeof markStateDirty === 'function') markStateDirty();

        renderEscrowContracts();
        updateEscrowStats();
        updateBalance();
    });
};

window.disputeMilestone = function disputeMilestone(contractId, milestoneId) {
    const contract = AppData.escrowContracts.find(c => c.id === contractId);
    const milestone = contract?.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const disputeHtml = `
        <div style="text-align: right; direction: rtl;">
            <div style="background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.2); border-radius: 16px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(244,63,94,0.2); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-gavel" style="color: #f43f5e;"></i>
                    </div>
                    <div>
                        <p style="font-weight: bold;">آلية حل النزاعات</p>
                        <p style="color: #9ca3af; font-size: 0.75rem;">مرحلة: ${escapeHtml(milestone.title)}</p>
                    </div>
                </div>
                <div style="font-size: 0.8rem; color: #d1d5db; line-height: 1.8;">
                    <p>• المبلغ (${milestone.amount.toLocaleString()} ر.س) يبقى مجمّداً حتى حل النزاع</p>
                    <p>• يمكن للأطراف التفاوض مباشرة وحل النزاع طوعياً</p>
                    <p>• في حال عدم الاتفاق، يُرفع للجهة المختصة (ليس مسؤولية المنصة الفعلية)</p>
                </div>
            </div>
            <div style="margin-bottom: 12px;">
                <label style="font-size: 0.85rem; color: #9ca3af; display: block; margin-bottom: 8px;">سبب الاعتراض</label>
                <textarea id="dispute-reason" class="premium-input" style="width: 100%; min-height: 80px;" placeholder="اشرح سبب اعتراضك بالتفصيل..."></textarea>
            </div>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'فتح نزاع';
    document.getElementById('confirm-message').innerHTML = disputeHtml;
    const btnWrap = document.getElementById('confirm-btn-wrap');
    if (btnWrap) {
        btnWrap.style.display = '';
        btnWrap.innerHTML = `
            <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">إلغاء</button>
            <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose to-pink-500 text-white text-sm font-bold" onclick="executeDispute(${contractId}, ${milestoneId})">
                <i class="fas fa-gavel ml-1"></i> فتح النزاع
            </button>
        `;
    }
    showModal('confirm-modal');
};

window.executeDispute = function executeDispute(contractId, milestoneId) {
    const contract = AppData.escrowContracts.find(c => c.id === contractId);
    const milestone = contract?.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const reason = document.getElementById('dispute-reason')?.value?.trim() || '';
    milestone.status = 'disputed';
    milestone.disputeReason = reason;
    milestone.disputedAt = new Date().toISOString().split('T')[0];
    contract.status = 'disputed';
    if (typeof markStateDirty === 'function') markStateDirty();

    closeModal('confirm-modal');
    document.getElementById('confirm-btn-wrap').innerHTML = `
        <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">إلغاء</button>
        <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-ethereal-violet to-ethereal-cyan text-obsidian-base text-sm font-bold" onclick="executeConfirmed()">تأكيد</button>
    `;

    showSuccess('تم فتح النزاع', `المبلغ (${milestone.amount.toLocaleString()} ر.س) مجمّد. يمكن حل النزاع مع الطرف الآخر.`);
    renderEscrowContracts();
    updateEscrowStats();
};

// =====================================================
// RESOLVE DISPUTE (mutual agreement)
// =====================================================
window.resolveDispute = function resolveDispute(contractId, milestoneId) {
    const contract = AppData.escrowContracts.find(c => c.id === contractId);
    const milestone = contract?.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const html = `
        <div style="text-align:right;">
            <p style="font-size:0.85rem;color:#9ca3af;margin-bottom:12px;">حل نزاع مرحلة "${escapeHtml(milestone.title)}":</p>
            <button onclick="finalizeDispute(${contractId}, ${milestoneId}, 'release')" style="width:100%;padding:12px;border-radius:10px;background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.2);margin-bottom:8px;cursor:pointer;">
                ✅ تحرير المبلغ للمستلم
            </button>
            <button onclick="finalizeDispute(${contractId}, ${milestoneId}, 'refund')" style="width:100%;padding:12px;border-radius:10px;background:rgba(244,63,94,0.1);color:#f43f5e;border:1px solid rgba(244,63,94,0.2);margin-bottom:8px;cursor:pointer;">
                ↩️ استرداد المبلغ للعميل
            </button>
            <button onclick="finalizeDispute(${contractId}, ${milestoneId}, 'cancel')" style="width:100%;padding:12px;border-radius:10px;background:rgba(255,255,255,0.04);color:#9ca3af;border:1px solid rgba(255,255,255,0.06);cursor:pointer;">
                إلغاء (إعادة فتح المرحلة)
            </button>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'حل النزاع';
    document.getElementById('confirm-message').innerHTML = html;
    document.getElementById('confirm-btn-wrap').style.display = 'none';
    showModal('confirm-modal');
};

window.finalizeDispute = function finalizeDispute(contractId, milestoneId, action) {
    const contract = AppData.escrowContracts.find(c => c.id === contractId);
    const milestone = contract?.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    if (action === 'release') {
        milestone.status = 'approved';
        milestone.approvedAt = new Date().toISOString().split('T')[0];
        showSuccess('تم التحرير', `تم تحرير ${milestone.amount.toLocaleString()} ر.س`);
    } else if (action === 'refund') {
        addTransaction({
            title: `استرداد ضمان: ${contract.title}`,
            amount: milestone.amount, type: 'income', category: 'استرداد',
            icon: 'fa-undo', color: 'emerald', notify: true
        });
        milestone.status = 'pending';
        milestone.submittedAt = null;
        milestone.approvedAt = null;
        contract.totalAmount -= milestone.amount;
        showSuccess('تم الاسترداد', `تم استرداد ${milestone.amount.toLocaleString()} ر.س لرصيدك`);
    } else if (action === 'cancel') {
        milestone.status = 'in-progress';
        showToast('تمت الإعادة', 'المرحلة قيد التنفيذ مجدداً', 'info');
    }
    contract.status = contract.milestones.every(m => m.status === 'approved') ? 'completed' : 'in-progress';
    if (typeof markStateDirty === 'function') markStateDirty();
    closeModal('confirm-modal');
    renderEscrowContracts();
    updateEscrowStats();
    updateBalance();
};

// =====================================================
// RATE CONTRACT
// =====================================================
window.rateContract = function rateContract(contractId) {
    const contract = AppData.escrowContracts.find(c => c.id === contractId);
    if (!contract) return;
    const html = `
        <div style="text-align:center;">
            <p style="font-size:0.85rem;color:#9ca3af;margin-bottom:12px;">قيّم خدمة "${escapeHtml(contract.title)}"</p>
            <div id="rating-stars" style="display:flex;justify-content:center;gap:8px;margin-bottom:14px;font-size:2rem;cursor:pointer;">
                ${[1,2,3,4,5].map(i => `<span data-rating="${i}" onclick="setRating(${i})" style="color:#4b5563;transition:all 0.2s;">★</span>`).join('')}
            </div>
            <textarea id="rating-comment" class="premium-input" style="width:100%;min-height:60px;" placeholder="تعليقك (اختياري)..."></textarea>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'تقييم العقد';
    document.getElementById('confirm-message').innerHTML = html;
    const btnWrap = document.getElementById('confirm-btn-wrap');
    if (btnWrap) {
        btnWrap.style.display = '';
        btnWrap.innerHTML = `
            <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">لاحقاً</button>
            <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold" onclick="submitRating(${contractId})">إرسال</button>
        `;
    }
    window._currentRating = 5;
    showModal('confirm-modal');
};

window.setRating = function setRating(n) {
    window._currentRating = n;
    document.querySelectorAll('#rating-stars span').forEach((s, i) => {
        s.style.color = (i < n) ? '#f59e0b' : '#4b5563';
    });
};

window.submitRating = function submitRating(contractId) {
    const contract = AppData.escrowContracts.find(c => c.id === contractId);
    if (!contract) return;
    const rating = window._currentRating || 5;
    const comment = document.getElementById('rating-comment')?.value?.trim() || '';
    if (!contract.ratings) contract.ratings = [];
    contract.ratings.push({
        rating, comment, date: new Date().toISOString().split('T')[0]
    });
    if (typeof markStateDirty === 'function') markStateDirty();
    closeModal('confirm-modal');
    showSuccess('شكراً لتقييمك', 'تم تسجيل تقييمك بنجاح');
    renderEscrowContracts();
    updateEscrowStats();
};
