/**
 * Circuit Simulator UI
 * Drag-and-drop quantum circuit builder with Canvas rendering
 */

class CircuitSimulator {
    constructor() {
        this.canvas = document.getElementById('circuit-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.numQubits = 2;
        this.maxSteps = 12;
        this.gates = []; // { type, qubit, step, target? (for 2-qubit gates) }
        this.state = new QuantumState(this.numQubits);
        this.currentStepIndex = -1;
        this.blochSphere = null;
        this.measurements = {};
        this.highlightedStep = -1; // For visual highlighting during step-through
        this.isAnimating = false;

        // Grid sizing
        this.cellWidth = 60;
        this.cellHeight = 60;
        this.wireStartX = 80;
        this.wireStartY = 50;

        // Drag state
        this.dragging = null;
        this.dragPos = { x: 0, y: 0 };
        this.hoveredCell = null;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.populateGatePalette();
        this.setupDragAndDrop();
        this.setupControls();
        this.render();

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const wrapper = this.canvas.parentElement;
        this.canvas.width = wrapper.clientWidth;
        this.canvas.height = wrapper.clientHeight;
        this.render();
    }

    populateGatePalette() {
        const grid = document.getElementById('gates-grid');
        grid.innerHTML = '';

        const gates = ['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT', 'M'];
        gates.forEach(gateType => {
            const info = GateInfo[gateType];
            const item = document.createElement('div');
            item.className = 'gate-item';
            item.setAttribute('draggable', 'true');
            item.dataset.gate = gateType;
            item.innerHTML = `
                <div class="gate-symbol" style="color: ${info.color}; border-color: ${info.color};">${info.symbol}</div>
                <div class="gate-name">${info.name}</div>
            `;

            // Drag events
            item.addEventListener('dragstart', (e) => {
                this.dragging = { type: gateType, fromPalette: true };
                e.dataTransfer.setData('text/plain', gateType);
                e.dataTransfer.effectAllowed = 'copy';
            });

            // Tooltip on hover
            item.title = info.description;

            grid.appendChild(item);
        });
    }

    setupDragAndDrop() {
        // Canvas drop zone
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            const pos = this.getCanvasPos(e);
            this.hoveredCell = this.getCellFromPos(pos.x, pos.y);
            this.render();
        });

        this.canvas.addEventListener('dragleave', () => {
            this.hoveredCell = null;
            this.render();
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const gateType = e.dataTransfer.getData('text/plain');
            if (!gateType) return;

            const pos = this.getCanvasPos(e);
            const cell = this.getCellFromPos(pos.x, pos.y);

            if (cell && cell.qubit >= 0 && cell.qubit < this.numQubits && cell.step >= 0 && cell.step < this.maxSteps) {
                if (gateType === 'CNOT' || gateType === 'SWAP') {
                    // Two-qubit gate: control on this qubit, target on next
                    const target = (cell.qubit + 1) % this.numQubits;
                    this.gates.push({ type: gateType, qubit: cell.qubit, step: cell.step, target });
                } else {
                    this.gates.push({ type: gateType, qubit: cell.qubit, step: cell.step });
                }

                // Show feedback
                this.showStatus(`✅ تم إضافة بوابة ${GateInfo[gateType].name} على q${cell.qubit} في الخطوة t${cell.step}`);
                this.executeCircuit();
            }

            this.hoveredCell = null;
            this.dragging = null;
            this.render();
        });

        // Click to remove gate
        this.canvas.addEventListener('dblclick', (e) => {
            const pos = this.getCanvasPos(e);
            const cell = this.getCellFromPos(pos.x, pos.y);
            if (cell) {
                const idx = this.gates.findIndex(g => g.qubit === cell.qubit && g.step === cell.step);
                if (idx !== -1) {
                    const removed = this.gates[idx];
                    this.gates.splice(idx, 1);
                    this.showStatus(`🗑 تم حذف بوابة ${GateInfo[removed.type].name}`);
                    this.executeCircuit();
                    this.render();
                }
            }
        });
    }

    setupControls() {
        // Qubit count
        document.getElementById('qubit-count').addEventListener('change', (e) => {
            this.numQubits = parseInt(e.target.value);
            this.gates = [];
            this.state = new QuantumState(this.numQubits);
            this.currentStepIndex = -1;
            this.measurements = {};
            this.updateBlochQubitSelect();
            this.updateProbabilityBars();
            this.updateBlochSphere();
            this.resizeCanvas();
            this.showStatus(`🔧 تم تغيير عدد الكيوبتات إلى ${this.numQubits}`);
        });

        // Run circuit — with animated step-through
        document.getElementById('btn-run-circuit').addEventListener('click', () => {
            if (this.gates.length === 0) {
                this.showStatus('⚠️ لا توجد بوابات! اسحب بوابة من اللوحة اليمنى وأفلتها على السلك');
                return;
            }
            this.runCircuitAnimated();
        });

        // Step through — one gate at a time
        document.getElementById('btn-step-circuit').addEventListener('click', () => {
            if (this.gates.length === 0) {
                this.showStatus('⚠️ لا توجد بوابات! اسحب بوابة من اللوحة اليمنى وأفلتها على السلك');
                return;
            }
            this.stepThrough();
        });

        // Clear
        document.getElementById('btn-clear-circuit').addEventListener('click', () => {
            this.gates = [];
            this.state = new QuantumState(this.numQubits);
            this.currentStepIndex = -1;
            this.highlightedStep = -1;
            this.measurements = {};
            if (this.blochSphere) this.blochSphere.clearTrail();
            this.updateProbabilityBars();
            this.updateBlochSphere();
            this.render();
            this.showStatus('🗑 تم مسح الدائرة بالكامل');
        });

        // Measure all
        document.getElementById('btn-measure-all').addEventListener('click', () => {
            if (this.gates.length === 0) {
                this.showStatus('⚠️ لا توجد بوابات! اسحب بوابات أولاً ثم قِس');
                return;
            }
            // Re-execute to get fresh state before measuring
            this.executeCircuit();
            const result = this.state.measure();
            const bits = [];
            for (let i = 0; i < this.numQubits; i++) {
                bits.push((result >> (this.numQubits - 1 - i)) & 1);
            }

            // Flash the result
            const resultStr = bits.join('');
            this.showStatus(`📏 نتيجة القياس: |${resultStr}⟩  ←  قيمة كل كيوبت: ${bits.map((b, i) => `q${i}=${b}`).join('، ')}`);

            this.updateProbabilityBars();
            this.updateBlochSphere();

            // Highlight the collapsed state in probability bars
            this.flashProbabilityResult(result);
        });

        // Bloch qubit select
        document.getElementById('bloch-qubit-select').addEventListener('change', () => {
            this.updateBlochSphere();
        });

        this.updateBlochQubitSelect();
    }

    // ============================================================
    // ANIMATED CIRCUIT EXECUTION
    // ============================================================
    async runCircuitAnimated() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.state = new QuantumState(this.numQubits);
        this.measurements = {};
        this.currentStepIndex = -1;
        if (this.blochSphere) this.blochSphere.clearTrail();

        const sorted = [...this.gates].sort((a, b) => a.step - b.step);

        this.showStatus(`🏃 تشغيل الدائرة... (${sorted.length} بوابات)`);

        for (let idx = 0; idx < sorted.length; idx++) {
            const gate = sorted[idx];
            this.currentStepIndex = idx;
            this.highlightedStep = idx;

            // Apply gate
            if (gate.type === 'M') {
                this.measurements[gate.qubit] = this.state.measureQubit(gate.qubit);
            } else if (gate.type === 'CNOT' || gate.type === 'SWAP') {
                this.state.applyTwoQubitGate(gate.type, gate.qubit, gate.target);
            } else {
                const gateMatrix = QuantumGates[gate.type]();
                this.state.applySingleGate(gateMatrix, gate.qubit);
            }

            // Visual update
            this.updateProbabilityBars();
            this.updateBlochSphere();
            this.render();
            this.showStatus(`⚡ تنفيذ: ${GateInfo[gate.type].name} على q${gate.qubit} (${idx + 1}/${sorted.length})`);

            // Small delay for visual effect
            await new Promise(r => setTimeout(r, 300));
        }

        this.highlightedStep = -1;
        this.render();

        // Summary
        const probs = this.state.getProbabilities();
        const maxIdx = probs.indexOf(Math.max(...probs));
        const maxProb = (probs[maxIdx] * 100).toFixed(1);
        this.showStatus(`✅ اكتمل التنفيذ! الحالة الأكثر احتمالاً: ${this.state.getStateLabel(maxIdx)} (${maxProb}%) — اضغط "قياس الكل" لانهيار الحالة`);

        this.isAnimating = false;
    }

    stepThrough() {
        const sorted = [...this.gates].sort((a, b) => a.step - b.step);

        // First click: reset
        if (this.currentStepIndex < 0 || this.currentStepIndex >= sorted.length - 1) {
            if (this.currentStepIndex >= sorted.length - 1) {
                // Already at end — restart
                this.showStatus('🔄 إعادة تشغيل خطوة بخطوة...');
            }
            this.state = new QuantumState(this.numQubits);
            this.measurements = {};
            this.currentStepIndex = -1;
            if (this.blochSphere) this.blochSphere.clearTrail();
        }

        this.currentStepIndex++;

        if (this.currentStepIndex < sorted.length) {
            const gate = sorted[this.currentStepIndex];
            this.highlightedStep = this.currentStepIndex;

            if (gate.type === 'M') {
                this.measurements[gate.qubit] = this.state.measureQubit(gate.qubit);
                this.showStatus(`📏 الخطوة ${this.currentStepIndex + 1}/${sorted.length}: قياس q${gate.qubit} → النتيجة: ${this.measurements[gate.qubit]}`);
            } else if (gate.type === 'CNOT' || gate.type === 'SWAP') {
                this.state.applyTwoQubitGate(gate.type, gate.qubit, gate.target);
                this.showStatus(`⚡ الخطوة ${this.currentStepIndex + 1}/${sorted.length}: ${GateInfo[gate.type].name} (q${gate.qubit} → q${gate.target})`);
            } else {
                const gateMatrix = QuantumGates[gate.type]();
                this.state.applySingleGate(gateMatrix, gate.qubit);
                this.showStatus(`⚡ الخطوة ${this.currentStepIndex + 1}/${sorted.length}: ${GateInfo[gate.type].name} على q${gate.qubit} — ${GateInfo[gate.type].description}`);
            }

            this.updateProbabilityBars();
            this.updateBlochSphere();
            this.render();

            if (this.currentStepIndex >= sorted.length - 1) {
                const probs = this.state.getProbabilities();
                const maxIdx = probs.indexOf(Math.max(...probs));
                const maxProb = (probs[maxIdx] * 100).toFixed(1);
                setTimeout(() => {
                    this.showStatus(`✅ آخر خطوة! الحالة الأكثر احتمالاً: ${this.state.getStateLabel(maxIdx)} (${maxProb}%) — اضغط "قياس الكل" أو "خطوة بخطوة" للبدء من جديد`);
                }, 1000);
            }
        }
    }

    // ============================================================
    // EXECUTE (silent, used when adding gates)
    // ============================================================
    executeCircuit() {
        this.state = new QuantumState(this.numQubits);
        this.measurements = {};

        // Sort gates by step
        const sorted = [...this.gates].sort((a, b) => a.step - b.step);

        for (const gate of sorted) {
            if (gate.type === 'M') {
                this.measurements[gate.qubit] = this.state.measureQubit(gate.qubit);
            } else if (gate.type === 'CNOT' || gate.type === 'SWAP') {
                this.state.applyTwoQubitGate(gate.type, gate.qubit, gate.target);
            } else {
                const gateMatrix = QuantumGates[gate.type]();
                this.state.applySingleGate(gateMatrix, gate.qubit);
            }
        }

        this.currentStepIndex = sorted.length - 1;
        this.updateProbabilityBars();
        this.updateBlochSphere();
        this.render();
    }

    // ============================================================
    // STATUS & VISUAL FEEDBACK
    // ============================================================
    showStatus(message) {
        const el = document.getElementById('status-display');
        if (el) {
            el.textContent = message;
            el.style.transition = 'none';
            el.style.background = 'rgba(0, 212, 255, 0.15)';
            setTimeout(() => {
                el.style.transition = 'background 1s ease';
                el.style.background = '';
            }, 100);
        }
    }

    flashProbabilityResult(resultIndex) {
        const bars = document.querySelectorAll('#prob-bars .prob-bar-wrapper');
        bars.forEach((bar, i) => {
            if (i === resultIndex) {
                bar.style.transition = 'none';
                bar.style.background = 'rgba(6, 214, 160, 0.2)';
                bar.style.borderRadius = '4px';
                setTimeout(() => {
                    bar.style.transition = 'background 2s ease';
                    bar.style.background = '';
                }, 100);
            }
        });
    }

    // ============================================================
    // BLOCH & PROBABILITY
    // ============================================================
    updateBlochQubitSelect() {
        const select = document.getElementById('bloch-qubit-select');
        select.innerHTML = '';
        for (let i = 0; i < this.numQubits; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `q${String.fromCharCode(8320 + i)}`;
            select.appendChild(opt);
        }
    }

    getCanvasPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    getCellFromPos(x, y) {
        const step = Math.floor((x - this.wireStartX) / this.cellWidth);
        const qubit = Math.floor((y - this.wireStartY + this.cellHeight / 2) / this.cellHeight);
        if (step >= 0 && step < this.maxSteps && qubit >= 0 && qubit < this.numQubits) {
            return { step, qubit };
        }
        return null;
    }

    updateProbabilityBars() {
        const probs = this.state.getProbabilities();
        const container = document.getElementById('prob-bars');
        container.innerHTML = '';

        for (let i = 0; i < probs.length; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'prob-bar-wrapper';

            const bar = document.createElement('div');
            bar.className = 'prob-bar';
            const height = Math.max(2, probs[i] * 100);
            bar.style.height = height + '%';

            // Color intensity based on probability
            const hue = 190 + probs[i] * 80;
            bar.style.background = `linear-gradient(to top, hsl(${hue}, 80%, 50%), hsl(${hue + 30}, 80%, 60%))`;

            const value = document.createElement('div');
            value.className = 'prob-value';
            value.textContent = (probs[i] * 100).toFixed(1) + '%';
            bar.appendChild(value);

            const label = document.createElement('div');
            label.className = 'prob-label';
            label.textContent = this.state.getStateLabel(i);

            wrapper.appendChild(bar);
            wrapper.appendChild(label);
            container.appendChild(wrapper);
        }
    }

    updateBlochSphere() {
        if (!this.blochSphere) return;

        const qubitIdx = parseInt(document.getElementById('bloch-qubit-select').value) || 0;
        const coords = this.state.getBlochCoordinates(qubitIdx);
        this.blochSphere.updateState(coords);

        // Update info display
        const info = document.getElementById('bloch-info');
        if (info) {
            const probs = this.state.getProbabilities();
            let p0 = 0, p1 = 0;
            for (let i = 0; i < this.state.size; i++) {
                const bits = [];
                for (let b = 0; b < this.numQubits; b++) {
                    bits.push((i >> (this.numQubits - 1 - b)) & 1);
                }
                if (bits[qubitIdx] === 0) p0 += probs[i];
                else p1 += probs[i];
            }

            info.innerHTML = `
                <span>θ = ${coords.theta.toFixed(3)}</span>
                <span>φ = ${coords.phi.toFixed(3)}</span>
                <span>|0⟩: ${(p0 * 100).toFixed(1)}%</span>
                <span>|1⟩: ${(p1 * 100).toFixed(1)}%</span>
            `;
        }
    }

    // ============================================================
    // Canvas Rendering
    // ============================================================
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw qubit labels
        ctx.font = '14px JetBrains Mono';
        ctx.fillStyle = '#8888aa';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < this.numQubits; i++) {
            const y = this.wireStartY + i * this.cellHeight;
            ctx.fillStyle = '#00d4ff';
            ctx.fillText(`|0⟩ q${String.fromCharCode(8320 + i)}`, this.wireStartX - 12, y);
        }

        // Draw wires
        for (let i = 0; i < this.numQubits; i++) {
            const y = this.wireStartY + i * this.cellHeight;
            ctx.beginPath();
            ctx.moveTo(this.wireStartX, y);
            ctx.lineTo(this.wireStartX + this.maxSteps * this.cellWidth, y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw step markers
        ctx.font = '10px JetBrains Mono';
        ctx.fillStyle = '#555577';
        ctx.textAlign = 'center';
        for (let s = 0; s < this.maxSteps; s++) {
            const x = this.wireStartX + s * this.cellWidth + this.cellWidth / 2;
            ctx.fillText(`t${s}`, x, this.wireStartY - 20);
        }

        // Draw hovered cell highlight
        if (this.hoveredCell) {
            const x = this.wireStartX + this.hoveredCell.step * this.cellWidth;
            const y = this.wireStartY + this.hoveredCell.qubit * this.cellHeight - this.cellHeight / 2;
            ctx.fillStyle = 'rgba(0, 212, 255, 0.08)';
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x + 4, y + 4, this.cellWidth - 8, this.cellHeight - 8, 6);
            ctx.fill();
            ctx.stroke();
        }

        // Draw gates
        const sorted = [...this.gates].sort((a, b) => a.step - b.step);
        for (let idx = 0; idx < sorted.length; idx++) {
            const gate = sorted[idx];
            const info = GateInfo[gate.type];
            const x = this.wireStartX + gate.step * this.cellWidth + this.cellWidth / 2;
            const y = this.wireStartY + gate.qubit * this.cellHeight;

            const isActive = idx <= this.currentStepIndex;
            const isHighlighted = idx === this.highlightedStep;
            const alpha = isActive ? 1 : 0.7;

            // Highlight glow during step-through
            if (isHighlighted) {
                ctx.save();
                ctx.shadowColor = '#00ff88';
                ctx.shadowBlur = 20;
                ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
                ctx.beginPath();
                ctx.roundRect(
                    this.wireStartX + gate.step * this.cellWidth + 2,
                    this.wireStartY + gate.qubit * this.cellHeight - this.cellHeight / 2 + 2,
                    this.cellWidth - 4,
                    this.cellHeight - 4,
                    6
                );
                ctx.fill();
                ctx.restore();
            }

            if (gate.type === 'CNOT' && gate.target !== undefined) {
                this.drawCNOT(ctx, x, y, gate.qubit, gate.target, info.color, alpha);
            } else if (gate.type === 'M') {
                this.drawMeasurement(ctx, x, y, info.color, alpha);
            } else {
                this.drawGateBox(ctx, x, y, info.symbol, info.color, alpha);
            }
        }

        // Draw measurement results
        for (const [qubit, value] of Object.entries(this.measurements)) {
            const y = this.wireStartY + parseInt(qubit) * this.cellHeight;
            const x = this.wireStartX + this.maxSteps * this.cellWidth + 20;
            ctx.font = '14px JetBrains Mono';
            ctx.fillStyle = '#06d6a0';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`= ${value}`, x, y);
        }

        // If no gates, show helper text
        if (this.gates.length === 0) {
            ctx.font = '16px Tajawal';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('اسحب البوابات من اللوحة وأفلتها هنا على الأسلاك ←', w / 2, h / 2);
        }
    }

    drawGateBox(ctx, x, y, symbol, color, alpha = 1) {
        const size = 36;
        ctx.globalAlpha = alpha;

        // Background
        ctx.fillStyle = 'rgba(10, 10, 30, 0.9)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - size / 2, y - size / 2, size, size, 6);
        ctx.fill();
        ctx.stroke();

        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(x - size / 2, y - size / 2, size, size, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Symbol
        ctx.font = 'bold 16px JetBrains Mono';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, x, y);

        ctx.globalAlpha = 1;
    }

    drawCNOT(ctx, x, y, control, target, color, alpha = 1) {
        const targetY = this.wireStartY + target * this.cellHeight;
        ctx.globalAlpha = alpha;

        // Connection line
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, targetY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Control dot
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Target (⊕)
        ctx.beginPath();
        ctx.arc(x, targetY, 14, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - 10, targetY);
        ctx.lineTo(x + 10, targetY);
        ctx.moveTo(x, targetY - 10);
        ctx.lineTo(x, targetY + 10);
        ctx.stroke();

        ctx.globalAlpha = 1;
    }

    drawMeasurement(ctx, x, y, color, alpha = 1) {
        const size = 36;
        ctx.globalAlpha = alpha;

        // Box
        ctx.fillStyle = 'rgba(10, 10, 30, 0.9)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - size / 2, y - size / 2, size, size, 6);
        ctx.fill();
        ctx.stroke();

        // Meter arc
        ctx.beginPath();
        ctx.arc(x, y + 4, 10, Math.PI, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Needle
        ctx.beginPath();
        ctx.moveTo(x, y + 4);
        ctx.lineTo(x + 6, y - 8);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.globalAlpha = 1;
    }

    setBlochSphere(bs) {
        this.blochSphere = bs;
        this.updateBlochSphere();
    }
}

window.CircuitSimulator = CircuitSimulator;
