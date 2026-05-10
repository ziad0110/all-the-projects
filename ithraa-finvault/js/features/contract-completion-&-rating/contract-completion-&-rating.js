// =====================================================
// CONTRACT COMPLETION & RATING
// FIX: Stores ratings in contract.ratings[] (factor in trust score), XSS-safe
// =====================================================

window.showContractCompletionModal = function showContractCompletionModal(contract) {
    const released = contract.totalAmount;
    const cur = (typeof getCurrency === 'function') ? getCurrency() : 'ر.س';
    const safeTitle = escapeHtml(contract.title);
    const safeFreelancer = escapeHtml(contract.freelancerName);

    const html = `
        <div class="text-center mb-6">
            <div class="w-20 h-20 rounded-full bg-emerald/20 flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check-double text-emerald text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">عقد مكتمل! 🎉</h3>
            <p class="text-gray-400 text-sm">تم إكمال جميع مراحل "${safeTitle}" بنجاح</p>
            <p class="text-emerald font-bold text-lg mt-2">${released.toLocaleString()} ${cur} تم تحريرها</p>
        </div>
        <div class="mb-6">
            <p class="text-sm text-gray-400 text-center mb-3">كيف تقيّم تجربتك مع ${safeFreelancer}؟</p>
            <div class="flex justify-center gap-2" id="rating-stars">
                ${[1, 2, 3, 4, 5].map(s => `
                    <button class="w-12 h-12 rounded-xl glass flex items-center justify-center text-xl transition hover:scale-110 rating-star" onclick="setContractRating(${contract.id}, ${s})" data-star="${s}">
                        <i class="far fa-star text-amber-400"></i>
                    </button>
                `).join('')}
            </div>
            <p class="text-center text-sm text-amber-400 mt-2" id="rating-text">اضغط لتقييم</p>
            <textarea id="rating-comment" placeholder="تعليق اختياري..." style="width:100%;margin-top:12px;padding:10px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:white;min-height:60px;resize:vertical;"></textarea>
        </div>
        <button class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald to-cyan-400 text-white font-bold" onclick="closeModal('completion-modal')">
            تم
        </button>
    `;

    let modal = document.getElementById('completion-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'completion-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    modal.innerHTML = `
        <div class="modal-overlay absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeModal('completion-modal')"></div>
        <div class="relative glass-strong rounded-3xl p-6 w-full max-w-md animate-fade-in-up">
            ${html}
        </div>
    `;
    createConfetti();
};

window.setContractRating = function setContractRating(contractId, stars) {
    const contract = AppData.escrowContracts.find(c => c.id === contractId);
    if (!contract) return;

    if (!Array.isArray(contract.ratings)) contract.ratings = [];
    const comment = document.getElementById('rating-comment')?.value?.trim() || '';

    // Replace any existing rating from this session
    const existing = contract.ratings.findIndex(r => r._session === true);
    const newRating = {
        rating: stars,
        comment,
        date: new Date().toISOString().split('T')[0],
        _session: true
    };
    if (existing >= 0) contract.ratings[existing] = newRating;
    else contract.ratings.push(newRating);

    document.querySelectorAll('#rating-stars .rating-star').forEach(btn => {
        const s = parseInt(btn.dataset.star, 10);
        const icon = btn.querySelector('i');
        if (s <= stars) {
            icon.className = 'fas fa-star text-amber-400';
            btn.classList.add('bg-amber-500/20');
        } else {
            icon.className = 'far fa-star text-amber-400';
            btn.classList.remove('bg-amber-500/20');
        }
    });

    const labels = ['', 'سيء 😞', 'مقبول 😐', 'جيد 🙂', 'ممتاز 😊', 'رائع 🌟'];
    const textEl = document.getElementById('rating-text');
    if (textEl) textEl.textContent = labels[stars];

    if (typeof updateEscrowStats === 'function') updateEscrowStats();
    if (typeof markStateDirty === 'function') markStateDirty();

    showToast('شكراً لتقييمك', `تم تقييم ${contract.freelancerName} بـ ${stars} نجوم`, 'info');
};
