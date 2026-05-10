// =====================================================
// EDUCATION PLATFORM — fixes setSimDuration event bug, opens articles
// =====================================================
const EducationData = {
    stories: [
        { category: 'ادخار', emoji: '💰', slides: [
            { emoji: '💡', title: 'قاعدة 50/30/20', content: 'قسّم دخلك: 50% للضروريات، 30% للرغبات، 20% للادخار والاستثمار' },
            { emoji: '🏦', title: 'صندوق الطوارئ', content: 'احتفظ بمبلغ يغطي 3-6 أشهر من نفقاتك في حساب سهل الوصول' },
            { emoji: '🎯', title: 'ادخر تلقائياً', content: 'اجعل الادخار تلقائياً بتحويل مبلغ ثابت أول كل شهر قبل أي مصروف' }
        ]},
        { category: 'استثمار', emoji: '📈', slides: [
            { emoji: '📊', title: 'قوة الفائدة المركبة', content: '1000 ريال شهرياً بعائد 8% = أكثر من 1.8 مليون ريال خلال 30 سنة!' },
            { emoji: '🔄', title: 'التنويع مهم', content: 'لا تضع كل بيضك في سلة واحدة. وزّع استثماراتك بين أسهم وصكوك وعقار' },
            { emoji: '⏰', title: 'الوقت أهم من التوقيت', content: 'البدء مبكراً أفضل من انتظار الوقت المثالي. ابدأ اليوم' }
        ]},
        { category: 'ميزانية', emoji: '📋', slides: [
            { emoji: '📝', title: 'تتبع مصاريفك', content: 'سجّل كل مصروف لمدة شهر. ستفاجأ بحجم المصاريف الصغيرة المتكررة!' },
            { emoji: '☕', title: 'أثر اللاتيه', content: 'قهوة يومية بـ 20 ريال = 7,300 ريال سنوياً!' },
            { emoji: '🏷️', title: 'فرّق بين الحاجة والرغبة', content: 'قبل أي شراء اسأل: هل أحتاجه فعلاً؟ انتظر 24 ساعة' }
        ]},
        { category: 'ديون', emoji: '🔓', slides: [
            { emoji: '❄️', title: 'طريقة كرة الثلج', content: 'سدد أصغر دين أولاً ثم انتقل للذي بعده. الإنجاز يحفزك' },
            { emoji: '🚫', title: 'تجنب الديون السيئة', content: 'الدين الاستهلاكي عدوك. لا تقترض لشراء شيء ينخفض قيمته' },
            { emoji: '📉', title: 'نسبة الدين الصحية', content: 'لا تتجاوز أقساطك 30% من دخلك الشهري' }
        ]},
        { category: 'تقاعد', emoji: '🏖️', slides: [
            { emoji: '🎂', title: 'ابدأ من العشرينات', content: 'من يبدأ بـ 500 ريال شهرياً في عمر 25 يجمع أكثر ممن يبدأ بـ 1000 في عمر 35' },
            { emoji: '📐', title: 'قاعدة 25x', content: 'للتقاعد المبكر: اجمع 25 ضعف مصروفك السنوي' },
            { emoji: '🔑', title: 'مصادر دخل متعددة', content: 'لا تعتمد على مصدر واحد. ابنِ 3 مصادر دخل على الأقل' }
        ]}
    ],
    courses: [
        { id: 1, title: 'أساسيات الاستثمار', icon: 'fa-chart-line', color: 'purple', chapters: 4, completed: 1, desc: 'تعلم مبادئ الاستثمار من الصفر', xp: 500 },
        { id: 2, title: 'إدارة الراتب بفاعلية', icon: 'fa-wallet', color: 'emerald', chapters: 3, completed: 0, desc: 'كيف تدير راتبك بذكاء', xp: 400 },
        { id: 3, title: 'العملات الرقمية', icon: 'fa-bitcoin', color: 'amber', chapters: 4, completed: 3, desc: 'فهم عالم الكريبتو', xp: 600 },
        { id: 4, title: 'التخطيط للتقاعد', icon: 'fa-umbrella-beach', color: 'cyan', chapters: 3, completed: 0, desc: 'خطط لمستقبلك المالي', xp: 450 }
    ],
    podcasts: [
        { id: 1, title: 'الحصيلة اليومية', desc: 'ملخص أخبار السوق اليوم', duration: '2:30', icon: 'fa-newspaper', color: 'pink' },
        { id: 2, title: 'أسرار الادخار الذكي', desc: 'مع خبير مالي', duration: '15:00', icon: 'fa-piggy-bank', color: 'emerald' },
        { id: 3, title: 'الاستثمار العقاري 101', desc: 'دليلك الشامل للعقار', duration: '22:00', icon: 'fa-building', color: 'amber' },
        { id: 4, title: 'مستقبل الفينتك', desc: 'كيف تغير التقنية عالم المال', duration: '18:00', icon: 'fa-rocket', color: 'purple' }
    ],
    currentStoryGroup: 0, currentSlide: 0, storyTimer: null,
    simDuration: 10, podcastPlaying: false, podcastInterval: null
};

window.saveEducationData = function saveEducationData() {
    try {
        localStorage.setItem('ithraa_education', JSON.stringify({
            courseProgress: EducationData.courses.map(c => ({ id: c.id, completed: c.completed })),
            viewedStories: EducationData.stories.map((s, i) => s._viewed ? i : null).filter(i => i !== null)
        }));
    } catch (e) {}
};

window.loadEducationData = function loadEducationData() {
    try {
        const saved = JSON.parse(localStorage.getItem('ithraa_education') || '{}');
        if (saved.courseProgress) {
            saved.courseProgress.forEach(cp => {
                const course = EducationData.courses.find(c => c.id === cp.id);
                if (course) course.completed = cp.completed;
            });
        }
        if (saved.viewedStories) {
            saved.viewedStories.forEach(i => {
                if (EducationData.stories[i]) EducationData.stories[i]._viewed = true;
            });
        }
    } catch (e) {}
};
loadEducationData();

window.initEducation = function initEducation() {
    renderStories();
    renderCourses();
    renderPodcasts();
    renderArticles();
    updateSimulator();
    updateCurrentCourseWidget();
};

window.renderStories = function renderStories() {
    const container = document.getElementById('stories-strip');
    if (!container) return;
    container.innerHTML = EducationData.stories.map((s, i) => `
        <div class="story-bubble" onclick="openStoryViewer(${i})">
            <div class="story-ring ${s._viewed ? 'viewed' : ''}">
                <div class="story-ring-inner">${s.emoji}</div>
            </div>
            <span class="text-[10px]">${escapeHtml(s.category)}</span>
        </div>
    `).join('');
};

window.openStoryViewer = function openStoryViewer(groupIdx) {
    EducationData.currentStoryGroup = groupIdx;
    EducationData.currentSlide = 0;
    const viewer = document.getElementById('story-viewer');
    if (viewer) viewer.classList.remove('hidden');
    showStorySlide();
};

window.showStorySlide = function showStorySlide() {
    const group = EducationData.stories[EducationData.currentStoryGroup];
    const slide = group.slides[EducationData.currentSlide];
    const setIfExists = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    setIfExists('story-category-name', group.category);
    setIfExists('story-emoji', slide.emoji);
    setIfExists('story-title', slide.title);
    setIfExists('story-content', slide.content);

    const barsContainer = document.getElementById('story-progress-bars');
    if (barsContainer) {
        barsContainer.innerHTML = group.slides.map((_, i) => `
            <div class="flex-1 h-[3px] rounded-full overflow-hidden" style="background:rgba(255,255,255,0.2)">
                <div class="h-full rounded-full transition-all" style="width:${i < EducationData.currentSlide ? '100' : '0'}%;background:white"></div>
            </div>
        `).join('');
        clearTimeout(EducationData.storyTimer);
        setTimeout(() => {
            const bars = barsContainer.querySelectorAll('div > div');
            if (bars[EducationData.currentSlide]) bars[EducationData.currentSlide].style.width = '100%';
        }, 50);
    }
    EducationData.storyTimer = setTimeout(() => nextStorySlide(), 5000);
};

window.nextStorySlide = function nextStorySlide() {
    const group = EducationData.stories[EducationData.currentStoryGroup];
    if (EducationData.currentSlide < group.slides.length - 1) {
        EducationData.currentSlide++;
        showStorySlide();
    } else {
        group._viewed = true;
        saveEducationData();
        closeStoryViewer();
        renderStories();
    }
};

window.prevStorySlide = function prevStorySlide() {
    if (EducationData.currentSlide > 0) {
        EducationData.currentSlide--;
        showStorySlide();
    }
};

window.closeStoryViewer = function closeStoryViewer() {
    clearTimeout(EducationData.storyTimer);
    const viewer = document.getElementById('story-viewer');
    if (viewer) viewer.classList.add('hidden');
};

window.renderCourses = function renderCourses() {
    const container = document.getElementById('courses-list');
    if (!container) return;
    container.innerHTML = EducationData.courses.map((c, i) => {
        const pct = Math.round((c.completed / c.chapters) * 100);
        return `
        <div class="course-card" onclick="openCourseDetail(${i})">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-xl bg-${c.color}-500/20 flex items-center justify-center">
                    <i class="fas ${c.icon} text-${c.color}-400 text-lg"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-sm">${escapeHtml(c.title)}</h4>
                    <p class="text-xs text-gray-400">${escapeHtml(c.desc)}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <div class="flex-1 progress-bar h-2 rounded-full">
                    <div class="h-full rounded-full" style="width:${pct}%;background:linear-gradient(90deg,#8b5cf6,#ec4899)"></div>
                </div>
                <span class="text-xs text-gray-400">${c.completed}/${c.chapters}</span>
                <span class="text-[10px] text-purple-400 font-bold">+${c.xp} XP</span>
            </div>
        </div>`;
    }).join('');
};

window.updateCurrentCourseWidget = function updateCurrentCourseWidget() {
    const c = EducationData.courses[0];
    if (!c) return;
    const pct = Math.round((c.completed / c.chapters) * 100);
    const titleEl = document.getElementById('current-course-title');
    const progressEl = document.getElementById('current-course-progress');
    const pctEl = document.getElementById('current-course-percent');
    if (titleEl) titleEl.textContent = c.title;
    if (progressEl) progressEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
};

window.openCourseDetail = function openCourseDetail(idx) {
    const c = EducationData.courses[idx];
    if (!c) return;
    const pct = Math.round((c.completed / c.chapters) * 100);
    let chaptersHtml = '';
    for (let i = 1; i <= c.chapters; i++) {
        const done = i <= c.completed;
        chaptersHtml += `<div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:${done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)'};border:1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'};margin-bottom:8px">
            <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'};color:${done ? '#10b981' : '#6b7280'};font-size:12px;font-weight:700">${done ? '<i class="fas fa-check"></i>' : i}</div>
            <span style="font-size:14px;${done ? 'text-decoration:line-through;opacity:0.6' : ''}">الفصل ${i}</span>
        </div>`;
    }
    document.getElementById('confirm-title').textContent = c.title;
    document.getElementById('confirm-message').innerHTML = `
        <div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;font-size:12px;color:#9ca3af;margin-bottom:6px"><span>${pct}% مكتمل</span><span>+${c.xp} XP</span></div>
        <div class="progress-bar" style="height:8px;border-radius:4px"><div style="width:${pct}%;height:100%;border-radius:4px;background:linear-gradient(90deg,#8b5cf6,#ec4899)"></div></div></div>
        ${chaptersHtml}
        <button onclick="completeNextChapter(${idx});closeModal('confirm-modal')" style="width:100%;padding:14px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:white;font-weight:700;border:none;cursor:pointer;margin-top:12px;font-size:15px">${pct >= 100 ? '✅ مكتمل' : '▶️ متابعة التعلم'}</button>`;
    document.getElementById('confirm-btn-wrap').style.display = 'none';
    showModal('confirm-modal');
};

window.completeNextChapter = function completeNextChapter(idx) {
    const c = EducationData.courses[idx];
    if (!c) return;
    if (c.completed < c.chapters) {
        c.completed++;
        const pct = Math.round((c.completed / c.chapters) * 100);
        if (pct >= 100) {
            const xp = applyMultiplier(c.xp);
            AppData.user.points += xp;
            AppData.pointsHistory.unshift({ title: `إتمام كورس: ${c.title}`, points: xp, date: new Date().toISOString().split('T')[0], type: 'bonus' });
            if (typeof markStateDirty === 'function') markStateDirty();
            showSuccess('🎓 مبروك!', `أكملت كورس "${c.title}" وحصلت على ${xp} XP!`);
            if (typeof checkBadgeUnlocks === 'function') checkBadgeUnlocks();
        } else {
            showToast('أحسنت!', `أكملت الفصل ${c.completed} من ${c.chapters}`, 'success');
        }
        if (typeof updateChallengeProgress === 'function') updateChallengeProgress();
        saveEducationData();
        renderCourses();
        updateCurrentCourseWidget();
    }
};

window.renderPodcasts = function renderPodcasts() {
    const container = document.getElementById('podcast-list');
    if (!container) return;
    container.innerHTML = EducationData.podcasts.map(p => `
        <div class="podcast-item" onclick="playPodcast(${p.id})">
            <div class="w-10 h-10 rounded-xl bg-${p.color}-500/20 flex items-center justify-center flex-shrink-0">
                <i class="fas ${p.icon} text-${p.color}-400"></i>
            </div>
            <div class="flex-1">
                <p class="font-semibold text-sm">${escapeHtml(p.title)}</p>
                <p class="text-xs text-gray-400">${escapeHtml(p.desc)}</p>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500">${escapeHtml(p.duration)}</span>
                <div class="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <i class="fas fa-play text-pink-400 text-[10px]"></i>
                </div>
            </div>
        </div>
    `).join('');
};

window.playPodcast = function playPodcast(id) {
    const p = EducationData.podcasts.find(x => x.id === id);
    if (!p) return;
    const player = document.getElementById('podcast-mini-player');
    if (player) player.classList.remove('hidden');
    const titleEl = document.getElementById('podcast-player-title');
    const progEl = document.getElementById('podcast-progress');
    const timeEl = document.getElementById('podcast-time');
    const iconEl = document.getElementById('podcast-play-icon');
    if (titleEl) titleEl.textContent = p.title;
    if (progEl) progEl.style.width = '0%';
    if (timeEl) timeEl.textContent = '0:00';
    EducationData.podcastPlaying = true;
    if (iconEl) iconEl.className = 'fas fa-pause text-pink-400 text-sm';

    // NOTE: This is a UI simulation. Real audio integration would need
    // actual MP3 URLs and HTMLAudioElement.
    showToast('عرض توضيحي', 'الصوت غير متاح في النسخة الحالية', 'info');

    clearInterval(EducationData.podcastInterval);
    let elapsed = 0;
    const totalSec = parseInt(p.duration) * 60 || 150;
    EducationData.podcastInterval = setInterval(() => {
        if (!EducationData.podcastPlaying) return;
        elapsed += 1;
        const pct = Math.min((elapsed / totalSec) * 100, 100);
        if (progEl) progEl.style.width = pct + '%';
        const m = Math.floor(elapsed / 60); const s = elapsed % 60;
        if (timeEl) timeEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;
        if (pct >= 100) { clearInterval(EducationData.podcastInterval); EducationData.podcastPlaying = false; }
    }, 1000);
};

window.togglePodcastPlay = function togglePodcastPlay() {
    EducationData.podcastPlaying = !EducationData.podcastPlaying;
    const iconEl = document.getElementById('podcast-play-icon');
    if (iconEl) iconEl.className = `fas fa-${EducationData.podcastPlaying ? 'pause' : 'play'} text-pink-400 text-sm`;
};

window.closePodcastPlayer = function closePodcastPlayer() {
    clearInterval(EducationData.podcastInterval);
    EducationData.podcastPlaying = false;
    const player = document.getElementById('podcast-mini-player');
    if (player) player.classList.add('hidden');
};

// =====================================================
// INVESTMENT SIMULATOR — fixed event reference + risk variants
// =====================================================
let simChart = null;

window.setSimDuration = function setSimDuration(years, evt) {
    EducationData.simDuration = years;
    document.querySelectorAll('.sim-dur-btn').forEach(b => b.classList.remove('active'));
    // FIX: use passed event or fallback to window.event for older browsers
    const targetEvt = evt || window.event;
    if (targetEvt && targetEvt.currentTarget) {
        targetEvt.currentTarget.classList.add('active');
    } else if (targetEvt && targetEvt.target) {
        // event might be passed via inline onclick="setSimDuration(5, event)"
        const btn = targetEvt.target.closest('.sim-dur-btn');
        if (btn) btn.classList.add('active');
    } else {
        // fallback: find button matching value
        document.querySelectorAll('.sim-dur-btn').forEach(b => {
            if (b.dataset && parseInt(b.dataset.years) === years) b.classList.add('active');
        });
    }
    AppData._simulatorUsed = true;
    updateSimulator();
};

window.updateSimulator = function updateSimulator() {
    const monthly = parseInt(document.getElementById('sim-amount')?.value || 500);
    const years = EducationData.simDuration;
    // Allow user to choose risk level (default moderate 8%)
    const riskEl = document.getElementById('sim-risk-level');
    const riskMap = { conservative: 0.04, moderate: 0.08, aggressive: 0.12 };
    const rate = riskEl && riskMap[riskEl.value] ? riskMap[riskEl.value] : 0.08;
    const totalMonths = years * 12;
    const invested = monthly * totalMonths;

    const dispEl = document.getElementById('sim-amount-display');
    if (dispEl) dispEl.textContent = monthly.toLocaleString() + ' ر.س';

    let balance = 0;
    const labels = [], investedData = [], totalData = [];
    for (let y = 0; y <= years; y++) {
        labels.push(y === 0 ? 'الآن' : y + ' سنة');
        const m = y * 12;
        const inv = monthly * m;
        balance = monthly * ((Math.pow(1 + rate/12, m) - 1) / (rate/12)) || 0;
        investedData.push(inv);
        totalData.push(Math.round(balance));
    }
    const profit = Math.round(balance - invested);
    const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    setEl('sim-invested', invested.toLocaleString());
    setEl('sim-profit', profit.toLocaleString());
    setEl('sim-total', Math.round(balance).toLocaleString());

    const canvas = document.getElementById('simulator-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (simChart) simChart.destroy();
    simChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'المبلغ المستثمر', data: investedData, borderColor: '#6b7280', backgroundColor: 'rgba(107,114,128,0.1)', fill: true, tension: 0.3, pointRadius: 0 },
                { label: `القيمة (${(rate*100).toFixed(0)}% سنوياً)`, data: totalData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', fill: true, tension: 0.3, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'bottom', labels: { color: '#9ca3af', font: { size: 10, family: 'Cairo' }, padding: 12 } } },
            scales: {
                x: { ticks: { color: '#6b7280', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#6b7280', font: { size: 9 }, callback: v => (v/1000).toFixed(0) + 'K' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
};

// =====================================================
// ARTICLES — actually open content
// =====================================================
window.renderArticles = function renderArticles() {
    const container = document.getElementById("articles-list");
    if (!container) return;
    container.innerHTML = AppData.articles.map(a => `
        <div class="article-card glass-card rounded-2xl overflow-hidden cursor-pointer" onclick="openArticle(${a.id})">
            <div class="h-40 overflow-hidden">
                <img src="${escapeHtml(a.image)}" class="w-full h-full object-cover" alt="${escapeHtml(a.title)}" loading="lazy">
            </div>
            <div class="p-4">
                <span class="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs mb-2 inline-block">${escapeHtml(a.category)}</span>
                <h4 class="font-bold mb-2">${escapeHtml(a.title)}</h4>
                <p class="text-sm text-gray-400 mb-3">${escapeHtml(a.excerpt)}</p>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                    <i class="far fa-clock"></i>
                    <span>${escapeHtml(a.readTime)}</span>
                </div>
            </div>
        </div>
    `).join("");
};

window.openArticle = function openArticle(id) {
    const a = AppData.articles.find(x => x.id === id);
    if (!a) return;
    const html = `
        <div style="text-align:right;">
            <img src="${escapeHtml(a.image)}" style="width:100%;height:160px;object-fit:cover;border-radius:12px;margin-bottom:12px;">
            <span style="display:inline-block;padding:4px 10px;border-radius:8px;background:rgba(139,92,246,0.2);color:#a78bfa;font-size:0.7rem;margin-bottom:8px;">${escapeHtml(a.category)}</span>
            <h3 style="font-size:1.1rem;font-weight:bold;margin-bottom:10px;">${escapeHtml(a.title)}</h3>
            <p style="font-size:0.85rem;color:#d1d5db;line-height:1.8;">${escapeHtml(a.body || a.excerpt)}</p>
            <p style="font-size:0.7rem;color:#6b7280;margin-top:12px;"><i class="far fa-clock ml-1"></i>${escapeHtml(a.readTime)}</p>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'مقال تعليمي';
    document.getElementById('confirm-message').innerHTML = html;
    document.getElementById('confirm-btn-wrap').style.display = 'none';
    showModal('confirm-modal');

    // Track read for badge
    if (typeof GamificationData !== 'undefined') {
        GamificationData.articlesRead = (GamificationData.articlesRead || 0) + 1;
        if (typeof saveGamificationData === 'function') saveGamificationData();
        if (typeof checkBadgeUnlocks === 'function') checkBadgeUnlocks();
    }
};

// =====================================================
// QUIZ
// =====================================================
window.startQuiz = function startQuiz() {
    quizCurrent = 0; quizScore = 0;
    document.getElementById("quiz-start").classList.add("hidden");
    document.getElementById("quiz-result").classList.add("hidden");
    document.getElementById("quiz-question").classList.remove("hidden");
    showQuizQuestion();
};

window.showQuizQuestion = function showQuizQuestion() {
    const q = AppData.quizQuestions[quizCurrent];
    document.getElementById("quiz-progress").textContent = `سؤال ${quizCurrent + 1}/${AppData.quizQuestions.length}`;
    document.getElementById("quiz-score").textContent = `${quizScore} نقطة`;
    document.getElementById("quiz-q-text").textContent = q.question;

    const optionsContainer = document.getElementById("quiz-options");
    optionsContainer.innerHTML = q.options.map((opt, i) => `
        <button class="quiz-option w-full p-4 rounded-xl glass text-right text-sm" onclick="answerQuiz(${i})">
            ${escapeHtml(opt)}
        </button>
    `).join("");
};

window.answerQuiz = function answerQuiz(answer) {
    const q = AppData.quizQuestions[quizCurrent];
    const options = document.querySelectorAll(".quiz-option");
    options[answer].classList.add(answer === q.correct ? "correct" : "wrong");
    if (answer !== q.correct) options[q.correct].classList.add("correct");
    else quizScore += 100;
    setTimeout(() => {
        quizCurrent++;
        if (quizCurrent < AppData.quizQuestions.length) showQuizQuestion();
        else showQuizResult();
    }, 1500);
};

window.showQuizResult = function showQuizResult() {
    document.getElementById("quiz-question").classList.add("hidden");
    document.getElementById("quiz-result").classList.remove("hidden");
    document.getElementById("quiz-final-score").textContent = `${quizScore} نقطة`;
    const messages = {
        500: "ممتاز! أنت خبير مالي!", 400: "أداء رائع! معرفتك جيدة جداً",
        300: "جيد! يمكنك التحسن أكثر", 200: "حاول مرة أخرى لتتعلم أكثر",
        100: "استمر في التعلم!", 0: "لا بأس، حاول مرة أخرى!"
    };
    const msg = Object.keys(messages).reverse().find(k => quizScore >= parseInt(k));
    document.getElementById("quiz-message").textContent = messages[msg];

    if (quizScore > 0 && !AppData._quizCompletedToday) {
        AppData._quizCompletedToday = true;
        const xp = applyMultiplier(quizScore);
        AppData.user.points += xp;
        AppData.pointsHistory.unshift({
            title: "مكافأة اختبار المعرفة", points: xp,
            date: new Date().toISOString().split("T")[0], type: "bonus"
        });
        if (typeof markStateDirty === 'function') markStateDirty();
        if (typeof updateDashboardStats === 'function') updateDashboardStats();
        if (typeof checkBadgeUnlocks === 'function') checkBadgeUnlocks();
    } else if (AppData._quizCompletedToday) {
        showToast('تنبيه', 'لقد حصلت على مكافأة الاختبار اليوم بالفعل', 'info');
    }
};
