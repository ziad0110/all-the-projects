/**
 * Grover's Algorithm Race
 * Visual side-by-side comparison of classical search vs quantum Grover's algorithm
 * Classical ALWAYS checks all N items (worst case O(N))
 * Grover finishes in ~√N iterations — the visual difference is dramatic
 */

class GroverRace {
    constructor() {
        this.numQubits = 3;
        this.N = 8;
        this.targetIndex = -1;
        this.speed = 200;
        this.isRunning = false;
        this.classicalSteps = 0;
        this.groverIterations = 0;
        this.classicalFinished = false;
        this.groverFinished = false;
        this.groverFinishTime = 0;
        this.classicalFinishTime = 0;
        this.raceStartTime = 0;

        this.init();
    }

    init() {
        this.setupControls();
        this.updateDisplayValues();
        this.buildGrids();
    }

    setupControls() {
        document.getElementById('grover-db-size').addEventListener('change', (e) => {
            this.numQubits = parseInt(e.target.value);
            this.N = Math.pow(2, this.numQubits);
            this.updateDisplayValues();
            this.buildGrids();
        });

        document.getElementById('grover-speed').addEventListener('change', (e) => {
            this.speed = parseInt(e.target.value);
        });

        document.getElementById('btn-start-race').addEventListener('click', () => this.startRace());
        document.getElementById('btn-reset-race').addEventListener('click', () => this.reset());
    }

    updateDisplayValues() {
        const groverSteps = Math.max(1, Math.floor(Math.PI / 4 * Math.sqrt(this.N)));
        document.getElementById('display-N').textContent = this.N;
        document.getElementById('display-classical-steps').textContent = this.N;
        document.getElementById('display-grover-steps').textContent = groverSteps;
        document.getElementById('display-speedup').textContent =
            (this.N / groverSteps).toFixed(1) + 'x';
    }

    buildGrids() {
        // Classical search grid
        const classicalGrid = document.getElementById('classical-grid');
        classicalGrid.innerHTML = '';
        const cols = Math.ceil(Math.sqrt(this.N));
        classicalGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        for (let i = 0; i < this.N; i++) {
            const item = document.createElement('div');
            item.className = 'search-item';
            item.id = `classical-item-${i}`;
            item.textContent = i;
            classicalGrid.appendChild(item);
        }

        // Grover amplitude bars
        const ampBars = document.getElementById('grover-amplitude-bars');
        ampBars.innerHTML = '';

        for (let i = 0; i < this.N; i++) {
            const bar = document.createElement('div');
            bar.className = 'amp-bar';
            bar.id = `amp-bar-${i}`;
            bar.style.height = '2px';
            bar.title = `عنصر ${i}`;
            ampBars.appendChild(bar);
        }

        // Reset progress
        this.resetProgress();
    }

    resetProgress() {
        document.getElementById('classical-progress').style.width = '0%';
        document.getElementById('grover-progress').style.width = '0%';
        document.getElementById('classical-step-count').textContent = '0';
        document.getElementById('grover-iteration-count').textContent = '0';
        document.getElementById('classical-status').textContent = 'في الانتظار';
        document.getElementById('grover-status').textContent = 'في الانتظار';
        document.getElementById('race-result').classList.remove('show');
    }

    reset() {
        this.isRunning = false;
        this.classicalSteps = 0;
        this.groverIterations = 0;
        this.classicalFinished = false;
        this.groverFinished = false;

        // Reset grid items
        for (let i = 0; i < this.N; i++) {
            const item = document.getElementById(`classical-item-${i}`);
            if (item) {
                item.className = 'search-item';
            }
        }

        this.buildGrids();
        document.getElementById('status-display').textContent = '⚡ جاهز';
    }

    async startRace() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.reset();
        this.isRunning = true;
        this.classicalFinished = false;
        this.groverFinished = false;

        // Pick random target — put it in the SECOND HALF so classical clearly takes longer
        this.targetIndex = Math.floor(this.N / 2) + Math.floor(Math.random() * (this.N / 2));

        this.raceStartTime = performance.now();

        document.getElementById('status-display').textContent = `🏁 السباق بدأ! البحث عن العنصر: ${this.targetIndex}`;

        // Run both searches concurrently — they are FULLY INDEPENDENT
        const classicalPromise = this.runClassicalSearch();
        const groverPromise = this.runGroverSearch();

        await Promise.all([classicalPromise, groverPromise]);

        // Both finished — show final result
        this.showResult();
        this.isRunning = false;
    }

    onRacerFinished(who) {
        if (who === 'grover' && !this.classicalFinished) {
            // Grover finished first — flash the quantum panel
            document.getElementById('status-display').textContent =
                `⚛️ الكمومي انتهى! التقليدي لا يزال يبحث...`;
        }
    }

    async runClassicalSearch() {
        document.getElementById('classical-status').textContent = 'جاري البحث...';
        this.classicalSteps = 0;

        // Classical ALWAYS searches every item (worst-case behavior O(N)) 
        // It doesn't know WHERE the target is, so it checks one by one
        let foundAtStep = -1;

        for (let i = 0; i < this.N; i++) {
            if (!this.isRunning) return;

            this.classicalSteps = i + 1;

            // Clear previous 'checking' highlight
            const prev = document.querySelector('.search-item.checking');
            if (prev) prev.classList.remove('checking');

            // Highlight current item being checked
            const item = document.getElementById(`classical-item-${i}`);
            if (item) {
                item.classList.add('checking');
            }

            // Update progress
            document.getElementById('classical-step-count').textContent = this.classicalSteps;
            document.getElementById('classical-progress').style.width =
                ((this.classicalSteps / this.N) * 100) + '%';

            // Check if this is the target
            if (i === this.targetIndex) {
                foundAtStep = this.classicalSteps;
                // Mark as found but KEEP GOING to show worst-case
                item.classList.remove('checking');
                item.classList.add('found');
            }

            // Classical delay — each step takes the same time
            await AnimUtils.delay(this.speed);
        }

        // Clear any remaining 'checking' state
        const lastChecking = document.querySelector('.search-item.checking');
        if (lastChecking) lastChecking.classList.remove('checking');

        this.classicalFinished = true;
        this.classicalFinishTime = performance.now();
        document.getElementById('classical-status').textContent =
            `✅ فحص ${this.N} عنصر — وجد الهدف في الخطوة ${foundAtStep}`;

        this.onRacerFinished('classical');
    }

    async runGroverSearch() {
        document.getElementById('grover-status').textContent = 'تراكب أولي...';

        const grover = new GroverSimulator(this.numQubits, this.targetIndex);
        let probs = grover.initialize();
        this.updateAmplitudeBars(probs);

        // Mark target bar
        const targetBar = document.getElementById(`amp-bar-${this.targetIndex}`);
        if (targetBar) targetBar.classList.add('target');

        // Initial superposition pause
        await AnimUtils.delay(this.speed * 1.5);

        const optimalIterations = Math.max(1, Math.floor(Math.PI / 4 * Math.sqrt(this.N)));
        this.groverIterations = 0;

        for (let iter = 0; iter < optimalIterations; iter++) {
            if (!this.isRunning) return;

            this.groverIterations = iter + 1;

            // Oracle step — mark the target
            document.getElementById('grover-status').textContent =
                `🔮 أوراكل — عكس طور الهدف (تكرار ${this.groverIterations}/${optimalIterations})`;
            await AnimUtils.delay(this.speed * 0.8);

            // Diffusion step — amplify target amplitude
            document.getElementById('grover-status').textContent =
                `🌊 تكبير الاتساع (تكرار ${this.groverIterations}/${optimalIterations})`;

            probs = grover.iterate();
            this.updateAmplitudeBars(probs);

            // Update progress
            document.getElementById('grover-iteration-count').textContent = this.groverIterations;
            document.getElementById('grover-progress').style.width =
                ((this.groverIterations / optimalIterations) * 100) + '%';

            await AnimUtils.delay(this.speed * 0.8);
        }

        // Measurement
        document.getElementById('grover-status').textContent = '📏 قياس الحالة الكمومية...';
        await AnimUtils.delay(this.speed * 0.5);

        const targetProb = grover.getTargetProbability();

        // Grover is DONE
        this.groverFinished = true;
        this.groverFinishTime = performance.now();

        if (targetProb > 0.5) {
            document.getElementById('grover-status').textContent =
                `🏆 وجد في ${this.groverIterations} تكرار فقط! (${(targetProb * 100).toFixed(1)}%)`;

            // Victory highlight on target bar
            if (targetBar) {
                targetBar.style.background = 'var(--accent-green)';
                targetBar.style.boxShadow = '0 0 20px rgba(6, 214, 160, 0.6)';
                targetBar.style.transition = 'all 0.4s ease';
            }

            // Flash the quantum racer card
            const quantumCard = document.querySelector('.racer-card.quantum');
            if (quantumCard) {
                AnimUtils.flash(quantumCard, 'rgba(0, 212, 255, 0.4)', 600);
            }
        } else {
            document.getElementById('grover-status').textContent =
                `⚠️ القياس لم يكن دقيقاً (${(targetProb * 100).toFixed(1)}%) — أعد المحاولة`;
        }

        this.onRacerFinished('grover');
    }

    updateAmplitudeBars(probs) {
        const maxProb = Math.max(...probs, 0.01);

        for (let i = 0; i < this.N; i++) {
            const bar = document.getElementById(`amp-bar-${i}`);
            if (!bar) continue;

            const height = Math.max(2, (probs[i] / maxProb) * 100);
            bar.style.height = height + '%';

            // Color intensity
            if (i === this.targetIndex) {
                const intensity = Math.min(1, probs[i] * this.N);
                bar.style.background = `hsl(${170 + (1 - intensity) * 50}, 80%, ${40 + intensity * 20}%)`;
                bar.style.opacity = 0.5 + intensity * 0.5;
            } else {
                bar.classList.add('amplified');
                bar.style.opacity = Math.max(0.2, probs[i] * this.N * 0.5);
            }
        }
    }

    showResult() {
        const result = document.getElementById('race-result');
        const winnerText = document.getElementById('winner-text');
        const detail = document.getElementById('winner-detail');

        result.classList.add('show');
        AnimUtils.fadeIn(result);

        const groverSteps = Math.max(1, Math.floor(Math.PI / 4 * Math.sqrt(this.N)));

        // Time-based result
        const groverTime = ((this.groverFinishTime - this.raceStartTime) / 1000).toFixed(2);
        const classicalTime = ((this.classicalFinishTime - this.raceStartTime) / 1000).toFixed(2);

        winnerText.textContent = '⚛️ الحاسوب الكمومي يفوز!';
        winnerText.className = 'winner-text quantum-win';

        const speedup = (this.N / groverSteps).toFixed(1);
        detail.innerHTML = `
            <div style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; margin-bottom: 16px;">
                <div style="text-align: center;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">🖥️ التقليدي</div>
                    <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--accent-orange);">${this.N} خطوة</div>
                    <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-dim);">${classicalTime}s</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">⚛️ الكمومي</div>
                    <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--accent-cyan);">${groverSteps} تكرار</div>
                    <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-dim);">${groverTime}s</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">🚀 التسريع</div>
                    <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--accent-green);">${speedup}x</div>
                    <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-dim);">أسرع</div>
                </div>
            </div>
            <span style="color: var(--text-dim); font-size: 0.85rem;">
                مع ${this.N} عنصر: البحث التقليدي يفحص كل العناصر O(${this.N})، 
                بينما Grover يحتاج فقط O(√${this.N}) ≈ ${groverSteps} تكرار!
            </span>
        `;

        // Confetti celebration
        const rect = result.getBoundingClientRect();
        AnimUtils.createConfetti(document.body, rect.left + rect.width / 2, rect.top, 40);

        document.getElementById('status-display').textContent = `🏆 الكمومي فاز بتسريع ${speedup}x!`;
    }
}

window.GroverRace = GroverRace;
