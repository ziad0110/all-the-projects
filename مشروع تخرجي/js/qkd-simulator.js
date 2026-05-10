/**
 * QKD BB84 Protocol Visualizer
 * Interactive visualization of quantum key distribution protocol
 */

class QKDVisualizer {
    constructor() {
        this.protocol = null;
        this.numBits = 16;
        this.eveActive = false;
        this.currentStep = 0;
        this.isRunning = false;
        this.photonElements = [];
        this.animationSpeed = 300;

        this.init();
    }

    init() {
        this.setupControls();
    }

    setupControls() {
        document.getElementById('btn-start-qkd').addEventListener('click', () => this.startProtocol());
        document.getElementById('btn-qkd-auto').addEventListener('click', () => this.runAutomatic());
        document.getElementById('btn-reset-qkd').addEventListener('click', () => this.reset());
        document.getElementById('eve-toggle').addEventListener('change', (e) => {
            this.eveActive = e.target.checked;
            const eve = document.getElementById('eve-actor');
            eve.style.opacity = this.eveActive ? '1' : '0.3';
            eve.style.transition = 'opacity 0.5s ease';
        });

        document.getElementById('btn-encrypt').addEventListener('click', () => this.doEncrypt());
        document.getElementById('btn-decrypt').addEventListener('click', () => this.doDecrypt());
        document.getElementById('btn-copy-cipher')?.addEventListener('click', () => this.copyCipher());

        document.getElementById('qkd-num-bits').addEventListener('change', (e) => {
            this.numBits = parseInt(e.target.value);
        });
    }

    // ---- Encrypt panel ----
    doEncrypt() {
        if (!this.protocol || !this.protocol.sharedKey.length) return;

        const input = document.getElementById('encrypt-input').value;
        if (!input.trim()) { alert('اكتب نصاً أولاً!'); return; }

        const key = this.protocol.sharedKey;

        // ① Original text
        document.getElementById('enc-original').textContent = input;

        // ② Binary
        let binaryStr = '';
        for (let i = 0; i < input.length; i++) {
            binaryStr += input.charCodeAt(i).toString(2).padStart(16, '0') + ' ';
        }
        document.getElementById('enc-binary').textContent = binaryStr.trim();

        // ③ Key used
        const totalBits = input.length * 16;
        let keyStr = '';
        for (let i = 0; i < totalBits; i++) {
            keyStr += key[i % key.length];
            if ((i + 1) % 16 === 0) keyStr += ' ';
        }
        document.getElementById('enc-key').textContent = keyStr.trim();

        // ④ Encrypt (XOR)
        const encrypted = this.protocol.encryptMessage(input, key);
        this._lastCipher = encrypted.join('');
        document.getElementById('enc-cipher').textContent = this._lastCipher;

        document.getElementById('encrypt-output').style.display = 'block';
        AnimUtils.fadeIn(document.getElementById('encrypt-output'));
    }

    // ---- Copy cipher text ----
    copyCipher() {
        if (!this._lastCipher) return;
        navigator.clipboard.writeText(this._lastCipher).then(() => {
            const btn = document.getElementById('btn-copy-cipher');
            btn.textContent = '✅ تم النسخ!';
            setTimeout(() => { btn.textContent = '📋 نسخ النص المشفّر'; }, 1500);
        }).catch(() => {
            // Fallback: put it in the decrypt textarea
            document.getElementById('decrypt-input').value = this._lastCipher;
        });
    }

    // ---- Decrypt panel ----
    doDecrypt() {
        if (!this.protocol || !this.protocol.sharedKey.length) return;

        const cipherStr = document.getElementById('decrypt-input').value.replace(/[^01]/g, '');
        if (!cipherStr.length) { alert('الصق النص المشفّر (بتات 0 و 1) أولاً!'); return; }

        const key = this.protocol.sharedKey;

        // ① Show received cipher
        document.getElementById('dec-cipher').textContent = cipherStr;
        document.getElementById('dec-bits-count').textContent =
            `عدد البتات: ${cipherStr.length} → عدد الأحرف: ${Math.floor(cipherStr.length / 16)}`;

        // ② Key used
        let keyStr = '';
        for (let i = 0; i < cipherStr.length; i++) {
            keyStr += key[i % key.length];
            if ((i + 1) % 16 === 0) keyStr += ' ';
        }
        document.getElementById('dec-key').textContent = keyStr.trim();

        // ③ Decrypt (XOR)
        const encBits = cipherStr.split('').map(Number);
        const decrypted = this.protocol.decryptMessage(encBits, key);
        document.getElementById('dec-result').textContent = decrypted;

        document.getElementById('decrypt-output').style.display = 'block';
        AnimUtils.fadeIn(document.getElementById('decrypt-output'));
    }

    reset() {
        this.protocol = null;
        this.currentStep = 0;
        this.isRunning = false;

        // Clear photons
        const container = document.getElementById('photon-container');
        container.innerHTML = '';
        this.photonElements = [];

        // Reset tables
        document.getElementById('alice-table-body').innerHTML =
            '<tr><td colspan="4" style="color: var(--text-dim);">ابدأ البروتوكول لعرض البيانات</td></tr>';
        document.getElementById('bob-table-body').innerHTML =
            '<tr><td colspan="4" style="color: var(--text-dim);">في انتظار القياس</td></tr>';

        // Reset key display
        document.getElementById('shared-key-display').textContent = 'في انتظار استخلاص المفتاح...';
        document.getElementById('shared-key-display').style.color = 'var(--text-dim)';
        document.getElementById('key-stats').style.display = 'none';

        // Reset QBER
        this.updateQBER(0);

        // Reset steps
        document.querySelectorAll('#qkd-steps .step').forEach((s, i) => {
            s.classList.toggle('active', i === 0);
            s.classList.remove('completed');
        });

        // Hide encrypt demo
        document.getElementById('encrypt-demo').hidden = true;
        const encOut = document.getElementById('encrypt-output');
        const decOut = document.getElementById('decrypt-output');
        if (encOut) encOut.style.display = 'none';
        if (decOut) decOut.style.display = 'none';

        document.getElementById('status-display').textContent = '⚡ جاهز';
    }

    async startProtocol() {
        if (this.isRunning) return;

        this.reset();
        this.isRunning = true;
        this.protocol = new BB84Protocol(this.numBits);

        document.getElementById('status-display').textContent = '🔄 البروتوكول قيد التنفيذ...';

        // Step 1: Alice prepares
        this.setStep(1);
        const aliceData = this.protocol.alicePrepare();
        this.updateAliceTable(aliceData);
        await AnimUtils.delay(500);

        // Step 2: Send photons with animation
        this.setStep(2);
        await this.animatePhotonTransmission();

        // Step 3: Bob measures
        this.setStep(3);
        for (let i = 0; i < this.numBits; i++) {
            this.protocol.eveIntercept(i, this.eveActive);
            this.protocol.bobMeasure(i, this.eveActive);
        }
        this.updateBobTable();
        await AnimUtils.delay(500);

        // Step 4: Basis reconciliation
        this.setStep(4);
        const result = this.protocol.reconcile();
        this.highlightMatchingBases(result.matchingIndices);
        await AnimUtils.delay(500);

        // Step 5: Error detection
        this.setStep(5);
        this.updateQBER(result.qber);
        await AnimUtils.delay(500);

        // Step 6: Final key
        this.setStep(6);
        this.displaySharedKey(result);

        this.isRunning = false;
        document.getElementById('status-display').textContent = '✅ اكتمل البروتوكول';
    }

    async runAutomatic() {
        await this.startProtocol();
    }

    setStep(step) {
        document.querySelectorAll('#qkd-steps .step').forEach((s, i) => {
            const stepNum = i + 1;
            s.classList.remove('active');
            if (stepNum < step) s.classList.add('completed');
            if (stepNum === step) s.classList.add('active');
        });
        this.currentStep = step;
    }

    updateAliceTable(data) {
        const tbody = document.getElementById('alice-table-body');
        tbody.innerHTML = '';

        for (let i = 0; i < data.bits.length; i++) {
            const tr = document.createElement('tr');
            const basisSymbol = data.bases[i] === 0 ? '✚' : '✕';
            const basisName = data.bases[i] === 0 ? 'مستقيم' : 'قطري';
            const polar = this.protocol.getPolarizationSymbol(data.bits[i], data.bases[i]);

            tr.innerHTML = `
                <td>${i + 1}</td>
                <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">${data.bits[i]}</td>
                <td><span title="${basisName}" style="font-size: 1.2rem;">${basisSymbol}</span></td>
                <td style="font-size: 1.3rem;">${polar}</td>
            `;
            tbody.appendChild(tr);

            // Stagger animation
            tr.style.opacity = '0';
            tr.style.transform = 'translateX(20px)';
            tr.style.transition = `opacity 0.3s ease ${i * 30}ms, transform 0.3s ease ${i * 30}ms`;
            requestAnimationFrame(() => {
                tr.style.opacity = '1';
                tr.style.transform = 'translateX(0)';
            });
        }
    }

    updateBobTable() {
        const tbody = document.getElementById('bob-table-body');
        tbody.innerHTML = '';

        for (let i = 0; i < this.numBits; i++) {
            const tr = document.createElement('tr');
            const basisSymbol = this.protocol.bobBases[i] === 0 ? '✚' : '✕';
            const match = this.protocol.aliceBases[i] === this.protocol.bobBases[i];
            tr.className = match ? 'match' : 'mismatch';

            tr.innerHTML = `
                <td>${i + 1}</td>
                <td style="font-size: 1.2rem;">${basisSymbol}</td>
                <td style="font-family: var(--font-mono); font-weight: 700;">${this.protocol.bobResults[i]}</td>
                <td>${match ? '<span style="color: var(--accent-green);">✓</span>' : '<span style="color: var(--accent-red);">✗</span>'}</td>
            `;
            tbody.appendChild(tr);

            // Stagger animation
            tr.style.opacity = '0';
            tr.style.transform = 'translateX(-20px)';
            tr.style.transition = `opacity 0.3s ease ${i * 30}ms, transform 0.3s ease ${i * 30}ms`;
            requestAnimationFrame(() => {
                tr.style.opacity = '1';
                tr.style.transform = 'translateX(0)';
            });
        }
    }

    highlightMatchingBases(indices) {
        const aliceRows = document.querySelectorAll('#alice-table-body tr');
        const bobRows = document.querySelectorAll('#bob-table-body tr');

        indices.forEach(idx => {
            if (aliceRows[idx]) {
                aliceRows[idx].style.background = 'rgba(6, 214, 160, 0.1)';
                aliceRows[idx].style.borderRight = '3px solid var(--accent-green)';
            }
            if (bobRows[idx]) {
                bobRows[idx].style.background = 'rgba(6, 214, 160, 0.1)';
                bobRows[idx].style.borderRight = '3px solid var(--accent-green)';
            }
        });
    }

    async animatePhotonTransmission() {
        const visual = document.getElementById('qkd-visual');
        const container = document.getElementById('photon-container');
        const rect = visual.getBoundingClientRect();

        // Calculate positions
        const aliceX = 100;
        const bobX = rect.width - 100;
        const eveX = rect.width / 2;
        const channelY = rect.height / 2;

        for (let i = 0; i < this.numBits; i++) {
            const polarAngle = this.protocol.getPolarization(
                this.protocol.aliceBits[i],
                this.protocol.aliceBases[i]
            );

            // Create photon element
            const photon = document.createElement('div');
            photon.className = 'photon';
            photon.style.top = (channelY - 10) + 'px';
            photon.style.left = aliceX + 'px';
            photon.innerHTML = `
                <div class="photon-core"></div>
                <div class="photon-polarization" style="transform: translate(-50%, -50%) rotate(${polarAngle}deg);"></div>
            `;
            container.appendChild(photon);

            // Animate to Eve (if active) or directly to Bob
            if (this.eveActive) {
                // Animate to Eve
                await this.animateElement(photon, aliceX, eveX, 150);

                // Eve intercepts - change photon color
                photon.classList.add('intercepted');
                const eveBasis = this.protocol.eveBases[i];
                const eveResult = this.protocol.eveResults[i];
                const newAngle = this.protocol.getPolarization(eveResult, eveBasis);

                // Re-polarize based on Eve's measurement
                const polEl = photon.querySelector('.photon-polarization');
                polEl.style.transform = `translate(-50%, -50%) rotate(${newAngle}deg)`;
                polEl.style.background = '#ef476f';

                await AnimUtils.delay(80);

                // Animate to Bob
                photon.classList.remove('intercepted');
                await this.animateElement(photon, eveX, bobX, 150);
            } else {
                await this.animateElement(photon, aliceX, bobX, 200);
            }

            // Remove photon
            photon.style.opacity = '0';
            photon.style.transition = 'opacity 0.2s ease';
            setTimeout(() => photon.remove(), 200);
        }
    }

    animateElement(element, fromX, toX, duration) {
        return new Promise(resolve => {
            element.style.transition = `left ${duration}ms linear`;
            element.style.left = fromX + 'px';
            requestAnimationFrame(() => {
                element.style.left = toX + 'px';
            });
            setTimeout(resolve, duration);
        });
    }

    updateQBER(qber) {
        const percentage = (qber * 100);
        const bar = document.getElementById('qber-bar');
        const value = document.getElementById('qber-value');
        const status = document.getElementById('qber-status');

        value.textContent = percentage.toFixed(2) + '%';
        bar.style.width = Math.min(percentage * 3, 100) + '%'; // Scale for visibility

        bar.classList.remove('warning', 'danger');
        if (qber > 0.11) {
            bar.classList.add('danger');
            value.style.color = 'var(--accent-red)';
            status.className = 'status-badge insecure';
            status.textContent = '🔓 تنصت مكتشف!';
        } else if (qber > 0.05) {
            bar.classList.add('warning');
            value.style.color = 'var(--accent-orange)';
            status.className = 'status-badge insecure';
            status.textContent = '⚠️ مشبوه';
        } else {
            value.style.color = 'var(--accent-green)';
            status.className = 'status-badge secure';
            status.textContent = '🔒 آمن';
        }
    }

    displaySharedKey(result) {
        const display = document.getElementById('shared-key-display');
        const stats = document.getElementById('key-stats');

        if (result.keyLength === 0) {
            display.textContent = '⚠️ لم يتم توليد مفتاح';
            display.style.color = 'var(--accent-red)';
            return;
        }

        // Color-code the key bits
        let keyHtml = '';
        result.aliceKey.forEach((bit, i) => {
            const match = result.aliceKey[i] === result.bobKey[i];
            const color = match ? 'var(--accent-green)' : 'var(--accent-red)';
            keyHtml += `<span style="color: ${color}; font-weight: 700;">${bit}</span>`;
        });
        display.innerHTML = keyHtml;

        // Stats
        stats.style.display = 'block';
        document.getElementById('key-length').textContent = result.keyLength + ' بت';
        document.getElementById('key-efficiency').textContent =
            ((result.keyLength / this.numBits) * 100).toFixed(0) + '%';

        // Show encrypt demo if key is valid
        if (result.secure && result.keyLength > 0) {
            document.getElementById('encrypt-demo').hidden = false;
            AnimUtils.fadeIn(document.getElementById('encrypt-demo'));
        }
    }
}

window.QKDVisualizer = QKDVisualizer;
