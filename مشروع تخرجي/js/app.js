/**
 * Quantum Lab - Main Application Controller
 * Handles navigation, initialization, loading screen, and global state
 */

class QuantumLabApp {
    constructor() {
        this.currentSection = 'landing';
        this.particles = null;
        this.blochSphere = null;
        this.circuitSim = null;
        this.qkdViz = null;
        this.groverRace = null;
        this.quantumWorld = null;
        this.quiz = null;

        this.init();
    }

    init() {
        // Loading screen
        this.showLoadingScreen();

        // Start particle background
        this.particles = new ParticleBackground('particles-canvas');

        // Navigation
        this.setupNavigation();

        // Initialize modules lazily
        this.modulesInitialized = {
            circuit: false,
            qkd: false,
            grover: false,
            'quantum-world': false,
            quiz: false,
            about: false
        };

        console.log('⚛️ Quantum Lab initialized');
    }

    showLoadingScreen() {
        const loader = document.getElementById('loading-screen');
        const facts = [
            'الكيوبت يمكنه أن يكون 0 و 1 في نفس الوقت!',
            'التشابك الكمومي أسرع من الضوء — لكنه لا ينقل معلومات!',
            'خوارزمية Grover تبحث في مليون عنصر بـ 1000 خطوة فقط!',
            'بروتوكول BB84 يكشف أي محاولة تنصت تلقائياً',
            'الحاسوب الكمومي يستخدم 300 كيوبت لتمثيل أكثر من ذرات الكون!',
            'النفق الكمومي يجعل الإلكترون يعبر جداراً مستحيلاً!',
            'قطة شرودنغر حية وميتة... حتى تنظر إليها!',
        ];
        let factIdx = 0;
        const factsEl = document.getElementById('loader-facts');

        const factInterval = setInterval(() => {
            factIdx = (factIdx + 1) % facts.length;
            if (factsEl) {
                factsEl.style.opacity = '0';
                setTimeout(() => {
                    factsEl.textContent = facts[factIdx];
                    factsEl.style.opacity = '1';
                }, 300);
            }
        }, 2500);

        // Hide after 3 seconds
        setTimeout(() => {
            clearInterval(factInterval);
            if (loader) loader.classList.add('hidden');
            setTimeout(() => { if (loader) loader.style.display = 'none'; }, 800);
        }, 3000);
    }

    setupNavigation() {
        // Nav tab clicks
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.navigateTo(tab.dataset.section);
            });
        });

        // Landing card clicks
        document.querySelectorAll('.landing-card').forEach(card => {
            card.addEventListener('click', () => {
                this.navigateTo(card.dataset.navigate);
            });
        });
    }

    navigateTo(section) {
        if (section === this.currentSection) return;

        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === section);
        });

        // Hide all sections, show target
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });

        const targetSection = document.getElementById(`section-${section}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        this.currentSection = section;
        this.initModule(section);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    initModule(section) {
        switch (section) {
            case 'circuit':
                if (!this.modulesInitialized.circuit) {
                    this.circuitSim = new CircuitSimulator();
                    setTimeout(() => {
                        this.blochSphere = new BlochSphere('bloch-canvas');
                        this.circuitSim.setBlochSphere(this.blochSphere);
                        this.circuitSim.updateProbabilityBars();
                    }, 100);
                    this.setupCircuitPresets();
                    this.setupCircuitExport();
                    this.modulesInitialized.circuit = true;
                } else {
                    if (this.circuitSim) this.circuitSim.resizeCanvas();
                }
                break;

            case 'qkd':
                if (!this.modulesInitialized.qkd) {
                    this.qkdViz = new QKDVisualizer();
                    this.modulesInitialized.qkd = true;
                }
                break;

            case 'grover':
                if (!this.modulesInitialized.grover) {
                    this.groverRace = new GroverRace();
                    this.modulesInitialized.grover = true;
                }
                break;

            case 'quantum-world':
                if (!this.modulesInitialized['quantum-world']) {
                    this.quantumWorld = new QuantumWorld();
                    this.modulesInitialized['quantum-world'] = true;
                }
                break;

            case 'quiz':
                if (!this.modulesInitialized.quiz) {
                    this.quiz = new QuantumQuiz();
                    this.modulesInitialized.quiz = true;
                }
                break;

            case 'about':
                this.modulesInitialized.about = true;
                break;
        }
    }

    // ============================================================
    // CIRCUIT PRESETS
    // ============================================================
    setupCircuitPresets() {
        const select = document.getElementById('circuit-presets');
        if (!select) return;

        select.addEventListener('change', (e) => {
            const preset = e.target.value;
            if (!preset || !this.circuitSim) return;

            // Clear current circuit
            this.circuitSim.gates = [];
            this.circuitSim.measurements = {};
            this.circuitSim.currentStepIndex = -1;

            const presets = {
                bell: {
                    qubits: 2,
                    gates: [
                        { type: 'H', qubit: 0, step: 0 },
                        { type: 'CNOT', qubit: 0, step: 1, target: 1 }
                    ],
                    desc: 'حالة بيل: تراكب + تشابك → |Φ+⟩ = (|00⟩ + |11⟩)/√2'
                },
                ghz: {
                    qubits: 3,
                    gates: [
                        { type: 'H', qubit: 0, step: 0 },
                        { type: 'CNOT', qubit: 0, step: 1, target: 1 },
                        { type: 'CNOT', qubit: 1, step: 2, target: 2 }
                    ],
                    desc: 'حالة GHZ: تشابك ثلاثي → (|000⟩ + |111⟩)/√2'
                },
                teleport: {
                    qubits: 3,
                    gates: [
                        { type: 'X', qubit: 0, step: 0 },
                        { type: 'H', qubit: 1, step: 1 },
                        { type: 'CNOT', qubit: 1, step: 2, target: 2 },
                        { type: 'CNOT', qubit: 0, step: 3, target: 1 },
                        { type: 'H', qubit: 0, step: 4 },
                        { type: 'M', qubit: 0, step: 5 },
                        { type: 'M', qubit: 1, step: 6 }
                    ],
                    desc: 'نقل آني كمومي: نقل حالة q₀ إلى q₂ عبر التشابك'
                },
                superpos: {
                    qubits: 3,
                    gates: [
                        { type: 'H', qubit: 0, step: 0 },
                        { type: 'H', qubit: 1, step: 0 },
                        { type: 'H', qubit: 2, step: 0 }
                    ],
                    desc: 'تراكب كامل: كل كيوبت في تراكب → 8 حالات متساوية'
                },
                deutsch: {
                    qubits: 2,
                    gates: [
                        { type: 'X', qubit: 1, step: 0 },
                        { type: 'H', qubit: 0, step: 1 },
                        { type: 'H', qubit: 1, step: 1 },
                        { type: 'CNOT', qubit: 0, step: 2, target: 1 },
                        { type: 'H', qubit: 0, step: 3 },
                        { type: 'M', qubit: 0, step: 4 }
                    ],
                    desc: 'خوارزمية Deutsch: تحدد نوع الدالة بقياس واحد فقط!'
                }
            };

            const p = presets[preset];
            if (!p) return;

            // Set qubit count
            document.getElementById('qubit-count').value = p.qubits;
            this.circuitSim.numQubits = p.qubits;
            this.circuitSim.state = new QuantumState(p.qubits);
            this.circuitSim.updateBlochQubitSelect();

            // Load gates
            this.circuitSim.gates = p.gates.map(g => ({ ...g }));
            this.circuitSim.executeCircuit();
            this.circuitSim.resizeCanvas();
            this.circuitSim.showStatus('📋 ' + p.desc);

            // Reset dropdown
            select.value = '';
        });
    }

    // ============================================================
    // CIRCUIT EXPORT
    // ============================================================
    setupCircuitExport() {
        const btn = document.getElementById('btn-export-circuit');
        if (!btn) return;

        btn.addEventListener('click', () => {
            if (!this.circuitSim) return;
            const canvas = this.circuitSim.canvas;
            const link = document.createElement('a');
            link.download = 'quantum-circuit.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.circuitSim.showStatus('📥 تم تصدير الدائرة كصورة PNG');
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QuantumLabApp();
});
