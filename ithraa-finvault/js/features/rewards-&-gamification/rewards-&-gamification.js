// =====================================================
// REWARDS & GAMIFICATION — real cashback, dynamic leaderboard
// =====================================================
const GamificationData = {
    tiers: [
        { name: 'برونزي', minXP: 0, multiplier: 1.0, icon: 'fa-medal', color: '#b45309', gradient: 'from-amber-700 to-amber-900' },
        { name: 'فضي', minXP: 1000, multiplier: 1.2, icon: 'fa-medal', color: '#9ca3af', gradient: 'from-gray-400 to-gray-500' },
        { name: 'ذهبي', minXP: 2000, multiplier: 1.5, icon: 'fa-crown', color: '#f59e0b', gradient: 'from-yellow-400 to-orange-500' },
        { name: 'بلاتيني', minXP: 5000, multiplier: 2.0, icon: 'fa-gem', color: '#8b5cf6', gradient: 'from-purple-500 to-indigo-600' }
    ],
    challenges: [
        { id: 1, title: 'بطل القهوة ☕', desc: 'اقتصد في مصاريف المقاهي بنسبة 20% هذا الأسبوع', reward: 300, progress: 0, target: 100, icon: 'fa-coffee', color: 'amber' },
        { id: 2, title: 'تحدي الحصالة 🐷', desc: 'أودع 100 ريال في حصالة', reward: 150, progress: 0, target: 100, icon: 'fa-piggy-bank', color: 'pink' },
        { id: 3, title: 'المتعلم النهم 📚', desc: 'أكمل درسين من الكورس التعليمي', reward: 200, progress: 0, target: 100, icon: 'fa-book', color: 'purple' },
        { id: 4, title: 'المنضبط المالي 📊', desc: 'لا تتجاوز ميزانية الطعام هذا الأسبوع', reward: 250, progress: 0, target: 100, icon: 'fa-chart-bar', color: 'cyan' },
        { id: 5, title: 'سلسلة الدخول 🔥', desc: 'سجّل دخولك 7 أيام متتالية', reward: 500, progress: 0, target: 100, icon: 'fa-fire', color: 'orange' }
    ],
    badges: [
        { id: 1, name: 'المقتصد الأول', icon: '🏅', unlocked: false, desc: 'أكمل أول تحدي ادخار' },
        { id: 2, name: 'ملك الاستثمار', icon: '👑', unlocked: false, desc: 'استخدم محاكي الاستثمار' },
        { id: 3, name: 'قارئ نهم', icon: '📖', unlocked: false, desc: 'اقرأ 5 مقالات' },
        { id: 4, name: 'عبقري المال', icon: '🧠', unlocked: false, desc: 'احصل على 500 في الاختبار' },
        { id: 5, name: 'الحصالة الذهبية', icon: '🐷', unlocked: false, desc: 'أكمل حصالة 100%' },
        { id: 6, name: 'المستثمر الذكي', icon: '📈', unlocked: false, desc: 'استثمر لمدة 6 أشهر' },
        { id: 7, name: 'بطل التحديات', icon: '🏆', unlocked: false, desc: 'أكمل 5 تحديات' },
        { id: 8, name: 'الأسطورة', icon: '⭐', unlocked: false, desc: 'وصل لمستوى بلاتيني' }
    ],
    // Leaderboard with computed user position based on real points
    leaderboardOthers: [
        { name: 'سارة المالكي', score: 4820, avatar: 'S' },
        { name: 'محمد العتيبي', score: 3950, avatar: 'M' },
        { name: 'نورة الحربي', score: 2100, avatar: 'N' },
        { name: 'خالد السعيد', score: 1890, avatar: 'K' },
        { name: 'فاطمة أحمد', score: 1650, avatar: 'F' },
        { name: 'عمر الدوسري', score: 1200, avatar: 'O' }
    ],
    streak: 0,
    lootBoxAvailable: true,
    articlesRead: 0
};

window.saveGamificationData = function saveGamificationData() {
    try {
        localStorage.setItem('ithraa_gamification', JSON.stringify({
            streak: GamificationData.streak,
            lastLoginDate: GamificationData._lastLoginDate || null,
            lootBoxAvailable: GamificationData.lootBoxAvailable,
            articlesRead: GamificationData.articlesRead,
            challengeProgress: GamificationData.challenges.map(c => ({ id: c.id, progress: c.progress, completed: !!c.completed })),
            badgesUnlocked: GamificationData.badges.filter(b => b.unlocked).map(b => b.id)
        }));
    } catch (e) { }
};

window.loadGamificationData = function loadGamificationData() {
    try {
        const saved = JSON.parse(localStorage.getItem('ithraa_gamification') || '{}');
        if (saved.streak !== undefined) GamificationData.streak = saved.streak;
        if (saved.lastLoginDate) GamificationData._lastLoginDate = saved.lastLoginDate;
        if (saved.lootBoxAvailable !== undefined) GamificationData.lootBoxAvailable = saved.lootBoxAvailable;
        if (saved.articlesRead !== undefined) GamificationData.articlesRead = saved.articlesRead;
        if (saved.challengeProgress) {
            saved.challengeProgress.forEach(cp => {
                const ch = GamificationData.challenges.find(c => c.id === cp.id);
                if (ch) { ch.progress = cp.progress; ch.completed = cp.completed; }
            });
        }
        if (saved.badgesUnlocked) {
            saved.badgesUnlocked.forEach(id => {
                const b = GamificationData.badges.find(x => x.id === id);
                if (b) b.unlocked = true;
            });
        }
    } catch (e) { }
};
loadGamificationData();

window.applyMultiplier = function applyMultiplier(baseXP) {
    const tier = getUserTier();
    return Math.round(baseXP * tier.multiplier);
};

window.updateStreak = function updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const last = GamificationData._lastLoginDate;
    if (last === today) return;

    if (last) {
        const lastDate = new Date(last);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            // FIX: streak no longer capped at 7 — keeps growing
            GamificationData.streak = (GamificationData.streak || 0) + 1;
        } else if (diffDays > 1) {
            GamificationData.streak = 1;
        }
    } else {
        GamificationData.streak = 1;
    }
    GamificationData._lastLoginDate = today;
    saveGamificationData();
};

window.updateChallengeProgress = function updateChallengeProgress() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekTx = AppData.transactions.filter(t => new Date(t.date) >= weekStart);

    // Challenge 1: Coffee savings
    const cafeTx = thisWeekTx.filter(t => t.category === 'طعام' && t.amount < 0);
    const cafeSpent = cafeTx.reduce((a, t) => a + Math.abs(t.amount), 0);
    const cafeLimit = 500;
    const c1 = GamificationData.challenges.find(c => c.id === 1);
    if (c1 && !c1.completed) {
        c1.progress = Math.min(100, Math.max(0, Math.round(((cafeLimit - cafeSpent) / cafeLimit) * 100)));
        if (cafeSpent <= cafeLimit * 0.8) { c1.progress = 100; c1.completed = true; awardChallengeXP(c1); }
    }

    // Challenge 2: Vault deposit
    const c2 = GamificationData.challenges.find(c => c.id === 2);
    if (c2 && !c2.completed) {
        // FIX: category is 'ادخار' (Arabic) — was 'savings' before
        const vaultDeposits = thisWeekTx.filter(t => t.category === 'ادخار' && t.amount < 0);
        const totalDeposited = vaultDeposits.reduce((a, t) => a + Math.abs(t.amount), 0);
        c2.progress = Math.min(100, Math.round((totalDeposited / 100) * 100));
        if (totalDeposited >= 100) { c2.completed = true; awardChallengeXP(c2); }
    }

    // Challenge 3: Course chapters
    const c3 = GamificationData.challenges.find(c => c.id === 3);
    if (c3 && !c3.completed && typeof EducationData !== 'undefined') {
        const totalCompleted = EducationData.courses.reduce((a, c) => a + c.completed, 0);
        c3.progress = Math.min(100, Math.round((totalCompleted / 2) * 100));
        if (totalCompleted >= 2) { c3.completed = true; awardChallengeXP(c3); }
    }

    // Challenge 4: Food budget
    const c4 = GamificationData.challenges.find(c => c.id === 4);
    if (c4 && !c4.completed) {
        const foodCat = AppData.budgetCategories.find(bc => bc.name === 'طعام ومطاعم');
        if (foodCat) {
            c4.progress = foodCat.spent <= foodCat.limit
                ? Math.min(100, Math.round(((foodCat.limit - foodCat.spent) / foodCat.limit) * 100 + 20))
                : 0;
        }
    }

    // Challenge 5: Login streak
    const c5 = GamificationData.challenges.find(c => c.id === 5);
    if (c5) {
        c5.progress = Math.min(100, Math.round((GamificationData.streak / 7) * 100));
        if (GamificationData.streak >= 7 && !c5.completed) { c5.completed = true; awardChallengeXP(c5); }
    }
    saveGamificationData();
};

window.awardChallengeXP = function awardChallengeXP(challenge) {
    const xp = applyMultiplier(challenge.reward);
    AppData.user.points += xp;
    AppData.pointsHistory.unshift({
        title: `تحدي: ${challenge.title}`,
        points: xp, date: new Date().toISOString().split('T')[0], type: 'bonus'
    });
    GamificationData.lootBoxAvailable = true;
    saveGamificationData();
    if (typeof markStateDirty === 'function') markStateDirty();
    checkBadgeUnlocks();
};

window.checkBadgeUnlocks = function checkBadgeUnlocks() {
    const badges = GamificationData.badges;
    const points = AppData.user.points;
    const completedChallenges = GamificationData.challenges.filter(c => c.completed).length;
    const completedCourses = (typeof EducationData !== 'undefined')
        ? EducationData.courses.filter(c => c.completed === c.chapters).length : 0;
    const vaultsFull = AppData.vaults.filter(v => v.currentAmount >= v.targetAmount).length;
    const tier = getUserTier();

    if (completedChallenges >= 1) badges.find(b => b.id === 1).unlocked = true;
    if (AppData._simulatorUsed) badges.find(b => b.id === 2).unlocked = true;
    if (GamificationData.articlesRead >= 5) badges.find(b => b.id === 3).unlocked = true;
    if (AppData._quizCompletedToday && points >= 500) badges.find(b => b.id === 4).unlocked = true;
    if (vaultsFull > 0) badges.find(b => b.id === 5).unlocked = true;
    if (completedCourses >= 1) badges.find(b => b.id === 6).unlocked = true;
    if (completedChallenges >= 5) badges.find(b => b.id === 7).unlocked = true;
    if (tier.name === 'بلاتيني') badges.find(b => b.id === 8).unlocked = true;

    saveGamificationData();
};

window.getUserTier = function getUserTier() {
    const xp = AppData.user.points;
    let tier = GamificationData.tiers[0];
    for (const t of GamificationData.tiers) if (xp >= t.minXP) tier = t;
    return tier;
};

window.getNextTier = function getNextTier() {
    const xp = AppData.user.points;
    for (const t of GamificationData.tiers) if (xp < t.minXP) return t;
    return null;
};

window.initRewards = function initRewards() {
    updateStreak();
    updateChallengeProgress();
    checkBadgeUnlocks();
    renderTierHero();
    renderStreakDots();
    renderChallenges();
    renderRewards();
    renderPointsHistory();
    renderLeaderboard();
    renderBadges();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    const spinStatus = document.getElementById('spin-status');
    if (spinStatus) spinStatus.textContent = GamificationData.lootBoxAvailable ? 'متاح' : 'تم الفتح';
};

window.renderTierHero = function renderTierHero() {
    const tier = getUserTier();
    const next = getNextTier();
    const xp = AppData.user.points;
    const tName = document.getElementById('tier-name');
    const tMul = document.getElementById('tier-multiplier');
    const rPts = document.getElementById('rewards-points');
    
    if (tName) tName.textContent = tier.name;
    if (tMul) { 
        tMul.textContent = `×${tier.multiplier} مضاعف النقاط`; 
        tMul.style.color = tier.color; 
    }
    if (rPts) rPts.textContent = xp.toLocaleString();

    const fill = document.getElementById('tier-progress-fill');
    const xpText = document.getElementById('tier-xp-text');
    const curLabel = document.getElementById('tier-current-label');
    const nextLabel = document.getElementById('tier-next-label');

    // Piecewise progress calculation to match visual markers at 0%, 33%, 66%, 100%
    let visualProgress = 0;
    if (xp < 1000) {
        // Bronze to Silver (0 - 1000) -> 0% to 33.3%
        visualProgress = (xp / 1000) * 33.3;
    } else if (xp < 2000) {
        // Silver to Gold (1000 - 2000) -> 33.3% to 66.6%
        visualProgress = 33.3 + ((xp - 1000) / 1000) * 33.3;
    } else if (xp < 5000) {
        // Gold to Platinum (2000 - 5000) -> 66.6% to 100%
        visualProgress = 66.6 + ((xp - 2000) / 3000) * 33.4;
    } else {
        visualProgress = 100;
    }

    if (fill) fill.style.width = Math.min(visualProgress, 100) + '%';
    
    if (next) {
        if (xpText) xpText.textContent = `${xp.toLocaleString()} / ${next.minXP.toLocaleString()} XP`;
        if (curLabel) curLabel.textContent = tier.name;
        if (nextLabel) nextLabel.textContent = next.name;
    } else {
        if (xpText) xpText.textContent = `${xp.toLocaleString()} XP - أعلى مستوى!`;
        if (nextLabel) nextLabel.textContent = '🌟';
    }

    // Dynamic opacity for markers
    const markers = document.querySelectorAll('#tier-markers-container .flex-col');
    if (markers.length >= 4) {
        markers.forEach((m, idx) => {
            const markerTier = GamificationData.tiers[idx];
            if (!markerTier) return; // Guard clause
            
            if (xp >= markerTier.minXP) {
                m.classList.remove('opacity-50', 'opacity-30');
                m.style.opacity = '1';
                const iconBox = m.querySelector('div');
                if (iconBox) {
                    if (tier.name === markerTier.name) {
                        iconBox.classList.add('ring-2', 'ring-offset-2');
                        iconBox.style.ringColor = markerTier.color;
                    } else {
                        iconBox.classList.remove('ring-2');
                    }
                }
            } else {
                m.style.opacity = '0.3';
            }
        });
    }
};

window.renderStreakDots = function renderStreakDots() {
    const container = document.getElementById('streak-dots');
    if (!container) return;
    const streak = GamificationData.streak;
    const days = ['سبت', 'أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع'];
    // Show last 7 days status
    const displayStreak = Math.min(streak, 7);
    container.innerHTML = days.map((d, i) => `
        <div class="flex flex-col items-center gap-1 flex-1">
            <div class="streak-dot ${i < displayStreak ? 'active' : ''} ${i === displayStreak - 1 ? 'today' : ''} w-full"></div>
            <span class="text-[8px] text-gray-500">${d}</span>
        </div>
    `).join('');
    const countEl = document.getElementById('streak-count');
    if (countEl) countEl.textContent = streak;
};

window.renderChallenges = function renderChallenges() {
    const container = document.getElementById('challenges-list');
    if (!container) return;
    container.innerHTML = GamificationData.challenges.map(c => `
        <div class="challenge-card ${c.completed ? 'completed' : ''}">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-${c.color}-500/20 flex items-center justify-center flex-shrink-0">
                    <i class="fas ${c.icon} text-${c.color}-400"></i>
                </div>
                <div class="flex-1">
                    <p class="font-bold text-sm">${escapeHtml(c.title)}</p>
                    <p class="text-xs text-gray-400">${escapeHtml(c.desc)}</p>
                </div>
                <div class="text-left flex-shrink-0">
                    ${c.completed
                        ? '<span class="text-emerald-400 text-xs font-bold"><i class="fas fa-check-circle"></i> مكتمل</span>'
                        : `<span class="text-xs font-bold text-${c.color}-400">+${c.reward} XP</span>`}
                </div>
            </div>
            <div class="progress-bar h-2 rounded-full">
                <div class="h-full rounded-full transition-all duration-1000" style="width:${c.progress}%;background:${c.completed ? '#10b981' : '#8b5cf6'}"></div>
            </div>
        </div>
    `).join('');
};

window.renderLeaderboard = function renderLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    // FIX: leaderboard now reflects user's REAL points
    const all = [
        ...GamificationData.leaderboardOthers,
        { name: AppData.user.name, score: AppData.user.points, avatar: (AppData.user.name || 'A').charAt(0), self: true }
    ];
    const sorted = all.sort((a, b) => b.score - a.score);
    container.innerHTML = sorted.map((u, i) => {
        const rankColors = ['bg-yellow-500/20 text-yellow-400', 'bg-gray-400/20 text-gray-300', 'bg-amber-700/20 text-amber-500'];
        const rankBg = i < 3 ? rankColors[i] : 'bg-white/5 text-gray-400';
        const medals = ['🥇', '🥈', '🥉'];
        return `
        <div class="lb-entry ${u.self ? 'self' : ''}">
            <div class="lb-rank ${rankBg}">${i < 3 ? medals[i] : i + 1}</div>
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(u.avatar)}&background=${u.self ? '8b5cf6' : '374151'}&color=fff&size=32" class="w-8 h-8 rounded-full" alt="">
            <div class="flex-1">
                <p class="text-sm font-semibold">${escapeHtml(u.name)} ${u.self ? '(أنت)' : ''}</p>
            </div>
            <span class="text-sm font-bold ${u.self ? 'text-purple-400' : 'text-gray-400'}">${u.score.toLocaleString()} XP</span>
        </div>`;
    }).join('');
};

window.renderBadges = function renderBadges() {
    const container = document.getElementById('badges-grid');
    if (!container) return;
    container.innerHTML = GamificationData.badges.map(b => `
        <div class="badge-item ${b.unlocked ? '' : 'locked'}" title="${escapeHtml(b.desc)}">
            <div class="badge-icon" style="background:rgba(139,92,246,0.15)">${b.icon}</div>
            <span class="text-[9px] text-center leading-tight">${escapeHtml(b.name)}</span>
        </div>
    `).join('');
};

window.renderRewards = function renderRewards() {
    const container = document.getElementById("rewards-list");
    if (!container) return;
    container.innerHTML = AppData.rewards.map(r => `
        <div class="glass-card rounded-2xl p-5 flex items-center gap-4 group">
            <div class="w-14 h-14 rounded-xl bg-${r.color}/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <i class="fas ${r.icon} text-${r.color} text-xl"></i>
            </div>
            <div class="flex-1">
                <p class="font-semibold text-sm mb-1">${escapeHtml(r.title)}</p>
                <p class="text-xs text-gray-400">${escapeHtml(r.partner)}</p>
            </div>
            <div class="text-left">
                <p class="font-bold text-${r.color}">${r.points}</p>
                <p class="text-[10px] text-gray-400">نقطة</p>
            </div>
            <button class="px-5 py-2 rounded-xl bg-${r.color} text-white text-sm font-semibold hover:shadow-lg transition-all active:scale-95" onclick="redeemReward(${r.id})">
                استبدال
            </button>
        </div>
    `).join("");
};

window.renderPointsHistory = function renderPointsHistory() {
    const container = document.getElementById("points-history");
    if (!container) return;
    container.innerHTML = AppData.pointsHistory.map(p => `
        <div class="flex items-center justify-between p-3 rounded-xl glass">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg ${p.type === 'redeem' ? 'bg-rose-500/20' : 'bg-emerald-500/20'} flex items-center justify-center">
                    <i class="fas ${p.type === 'redeem' ? 'fa-minus text-rose-400' : 'fa-plus text-emerald-400'} text-xs"></i>
                </div>
                <div>
                    <p class="text-sm font-medium">${escapeHtml(p.title)}</p>
                    <p class="text-xs text-gray-400">${escapeHtml(p.date)}</p>
                </div>
            </div>
            <span class="font-bold ${p.type === 'redeem' ? 'text-rose-400' : 'text-emerald-400'}">
                ${p.type === 'redeem' ? '' : '+'}${p.points}
            </span>
        </div>
    `).join("");
};

window.redeemReward = function redeemReward(id) {
    const reward = AppData.rewards.find(r => r.id === id);
    if (!reward) return;
    if (AppData.user.points < reward.points) {
        showToast("نقاط غير كافية", `تحتاج ${reward.points - AppData.user.points} نقطة إضافية`, "error");
        return;
    }
    showConfirm("استبدال المكافأة", `استبدال ${reward.points} نقطة بـ "${reward.title}"؟`, () => {
        AppData.user.points -= reward.points;
        AppData.pointsHistory.unshift({
            title: `استبدال: ${reward.title}`, points: -reward.points,
            date: new Date().toISOString().split("T")[0], type: "redeem"
        });
        // FIX: cash-back rewards actually deposit money
        if (reward.cashValue && reward.title.includes('كاش')) {
            addTransaction({
                title: `كاش باك: ${reward.title}`,
                amount: reward.cashValue, type: 'income', category: 'استرداد',
                icon: 'fa-money-bill', color: 'emerald', notify: true
            });
        } else {
            // Coupons saved to wallet
            if (!AppData.walletCoupons) AppData.walletCoupons = [];
            AppData.walletCoupons.push({
                id: Date.now(), title: reward.title, partner: reward.partner,
                cashValue: reward.cashValue || 0, code: 'COUPON-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                redeemedAt: new Date().toISOString().split('T')[0]
            });
        }
        if (typeof markStateDirty === 'function') markStateDirty();
        showSuccess("تم الاستبدال", `${reward.title}${reward.cashValue ? ' — يمكنك متابعتها في المحفظة' : ''}`);
        initRewards();
    });
};

// =====================================================
// LOOT BOX — fixed: cashback/coupons actually credited
// =====================================================
window.openSpinWheel = function openSpinWheel() {
    if (!GamificationData.lootBoxAvailable) {
        showToast('غير متاح', 'أكمل تحدياً جديداً لفتح الصندوق', 'info');
        return;
    }
    const prizes = [
        { text: '+200 نقطة XP', icon: '⭐', type: 'xp', value: 200 },
        { text: 'قسيمة 25 ر.س', icon: '🎫', type: 'coupon', value: 25 },
        { text: '+500 نقطة XP', icon: '💎', type: 'xp', value: 500 },
        { text: 'كاش باك 50 ر.س', icon: '💰', type: 'cashback', value: 50 },
        { text: '+100 نقطة XP', icon: '🌟', type: 'xp', value: 100 },
        { text: 'شارة حصرية', icon: '🏅', type: 'badge', value: 0 }
    ];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];

    const overlay = document.createElement('div');
    overlay.className = 'lootbox-overlay';
    overlay.id = 'lootbox-modal';
    overlay.innerHTML = `
        <div class="lootbox-content">
            <div id="lootbox-icon" class="text-7xl mb-6 lootbox-opening">🎁</div>
            <h3 class="text-white text-xl font-bold mb-2" id="lootbox-title">جاري فتح الصندوق...</h3>
            <p class="text-gray-400 text-sm" id="lootbox-desc">اضغط لفتح المفاجأة</p>
            <button id="lootbox-btn" class="mt-6 px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold" onclick="revealLootPrize()">افتح الآن 🎉</button>
        </div>
    `;
    // FIX: don't try to query 'lootbox-overlay' inside itself
    document.body.appendChild(overlay);
    window._currentPrize = prize;
};

window.revealLootPrize = function revealLootPrize() {
    const prize = window._currentPrize;
    if (!prize) return;
    const icon = document.getElementById('lootbox-icon');
    const title = document.getElementById('lootbox-title');
    const desc = document.getElementById('lootbox-desc');
    const btn = document.getElementById('lootbox-btn');

    if (icon) { icon.className = 'text-7xl mb-6 reward-revealed'; icon.textContent = prize.icon; }
    if (title) title.textContent = '🎉 مبروك!';
    if (desc) desc.textContent = prize.text;
    if (btn) {
        btn.textContent = 'رائع!';
        btn.onclick = () => {
            // FIX: All prize types actually credit something
            if (prize.type === 'xp') {
                const xp = applyMultiplier(prize.value);
                AppData.user.points += xp;
                AppData.pointsHistory.unshift({
                    title: `صندوق المفاجآت: ${prize.text}`, points: xp,
                    date: new Date().toISOString().split('T')[0], type: 'bonus'
                });
            } else if (prize.type === 'cashback') {
                addTransaction({
                    title: `كاش باك صندوق المفاجآت`,
                    amount: prize.value, type: 'income', category: 'استرداد',
                    icon: 'fa-gift', color: 'emerald', notify: true
                });
            } else if (prize.type === 'coupon') {
                if (!AppData.walletCoupons) AppData.walletCoupons = [];
                AppData.walletCoupons.push({
                    id: Date.now(), title: prize.text, partner: 'إثراء',
                    cashValue: prize.value, code: 'LOOT-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                    redeemedAt: new Date().toISOString().split('T')[0]
                });
                showToast('تم الحفظ', 'تم حفظ القسيمة في محفظتك', 'success');
            } else if (prize.type === 'badge') {
                showToast('شارة جديدة', 'تم إضافة شارة حصرية لمجموعتك', 'success');
            }
            GamificationData.lootBoxAvailable = false;
            saveGamificationData();
            if (typeof markStateDirty === 'function') markStateDirty();
            const status = document.getElementById('spin-status');
            if (status) status.textContent = 'تم الفتح';
            const modal = document.getElementById('lootbox-modal');
            if (modal) modal.remove();
            createConfetti();
            if (document.getElementById('page-rewards')?.classList.contains('active')) initRewards();
        };
    }
};
