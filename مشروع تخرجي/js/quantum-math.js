/**
 * Quantum Math Engine
 * Core mathematical utilities for quantum computing simulation
 * Supports complex numbers, matrix operations, quantum gates, and state vectors
 */

// ============================================================
// Complex Number Class
// ============================================================
class Complex {
    constructor(re = 0, im = 0) {
        this.re = re;
        this.im = im;
    }

    add(other) {
        return new Complex(this.re + other.re, this.im + other.im);
    }

    sub(other) {
        return new Complex(this.re - other.re, this.im - other.im);
    }

    mul(other) {
        return new Complex(
            this.re * other.re - this.im * other.im,
            this.re * other.im + this.im * other.re
        );
    }

    scale(s) {
        return new Complex(this.re * s, this.im * s);
    }

    conjugate() {
        return new Complex(this.re, -this.im);
    }

    magnitude() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    magnitudeSquared() {
        return this.re * this.re + this.im * this.im;
    }

    phase() {
        return Math.atan2(this.im, this.re);
    }

    toString() {
        if (Math.abs(this.im) < 1e-10) return this.re.toFixed(4);
        if (Math.abs(this.re) < 1e-10) return `${this.im.toFixed(4)}i`;
        const sign = this.im >= 0 ? '+' : '-';
        return `${this.re.toFixed(4)}${sign}${Math.abs(this.im).toFixed(4)}i`;
    }

    static zero() { return new Complex(0, 0); }
    static one() { return new Complex(1, 0); }
    static i() { return new Complex(0, 1); }
    static fromPolar(r, theta) {
        return new Complex(r * Math.cos(theta), r * Math.sin(theta));
    }
}

// ============================================================
// Matrix Operations
// ============================================================
class QMatrix {
    constructor(rows, cols, data = null) {
        this.rows = rows;
        this.cols = cols;
        this.data = data || Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => Complex.zero())
        );
    }

    get(r, c) { return this.data[r][c]; }
    set(r, c, val) { this.data[r][c] = val; }

    multiply(other) {
        if (this.cols !== other.rows) throw new Error('Matrix dimension mismatch');
        const result = new QMatrix(this.rows, other.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < other.cols; j++) {
                let sum = Complex.zero();
                for (let k = 0; k < this.cols; k++) {
                    sum = sum.add(this.data[i][k].mul(other.data[k][j]));
                }
                result.data[i][j] = sum;
            }
        }
        return result;
    }

    tensorProduct(other) {
        const rows = this.rows * other.rows;
        const cols = this.cols * other.cols;
        const result = new QMatrix(rows, cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                for (let k = 0; k < other.rows; k++) {
                    for (let l = 0; l < other.cols; l++) {
                        result.data[i * other.rows + k][j * other.cols + l] =
                            this.data[i][j].mul(other.data[k][l]);
                    }
                }
            }
        }
        return result;
    }

    conjugateTranspose() {
        const result = new QMatrix(this.cols, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                result.data[j][i] = this.data[i][j].conjugate();
            }
        }
        return result;
    }

    static identity(n) {
        const m = new QMatrix(n, n);
        for (let i = 0; i < n; i++) m.data[i][i] = Complex.one();
        return m;
    }
}

// ============================================================
// Quantum Gates
// ============================================================
const SQRT2_INV = 1 / Math.sqrt(2);

const QuantumGates = {
    // Pauli Gates
    I: () => {
        const m = new QMatrix(2, 2);
        m.data = [
            [Complex.one(), Complex.zero()],
            [Complex.zero(), Complex.one()]
        ];
        return m;
    },

    X: () => {
        const m = new QMatrix(2, 2);
        m.data = [
            [Complex.zero(), Complex.one()],
            [Complex.one(), Complex.zero()]
        ];
        return m;
    },

    Y: () => {
        const m = new QMatrix(2, 2);
        m.data = [
            [Complex.zero(), new Complex(0, -1)],
            [new Complex(0, 1), Complex.zero()]
        ];
        return m;
    },

    Z: () => {
        const m = new QMatrix(2, 2);
        m.data = [
            [Complex.one(), Complex.zero()],
            [Complex.zero(), new Complex(-1, 0)]
        ];
        return m;
    },

    // Hadamard Gate
    H: () => {
        const m = new QMatrix(2, 2);
        const v = new Complex(SQRT2_INV, 0);
        m.data = [
            [v, v],
            [v, v.scale(-1)]
        ];
        return m;
    },

    // Phase Gates
    S: () => {
        const m = new QMatrix(2, 2);
        m.data = [
            [Complex.one(), Complex.zero()],
            [Complex.zero(), Complex.i()]
        ];
        return m;
    },

    T: () => {
        const m = new QMatrix(2, 2);
        m.data = [
            [Complex.one(), Complex.zero()],
            [Complex.zero(), Complex.fromPolar(1, Math.PI / 4)]
        ];
        return m;
    },

    // Rotation gates
    Rx: (theta) => {
        const m = new QMatrix(2, 2);
        const c = new Complex(Math.cos(theta / 2), 0);
        const s = new Complex(0, -Math.sin(theta / 2));
        m.data = [[c, s], [s, c]];
        return m;
    },

    Ry: (theta) => {
        const m = new QMatrix(2, 2);
        const c = new Complex(Math.cos(theta / 2), 0);
        const s = new Complex(Math.sin(theta / 2), 0);
        m.data = [[c, s.scale(-1)], [s, c]];
        return m;
    },

    Rz: (theta) => {
        const m = new QMatrix(2, 2);
        m.data = [
            [Complex.fromPolar(1, -theta / 2), Complex.zero()],
            [Complex.zero(), Complex.fromPolar(1, theta / 2)]
        ];
        return m;
    },

    // CNOT Gate (4x4)
    CNOT: () => {
        const m = new QMatrix(4, 4);
        m.data[0][0] = Complex.one();
        m.data[1][1] = Complex.one();
        m.data[2][3] = Complex.one();
        m.data[3][2] = Complex.one();
        return m;
    },

    // SWAP Gate (4x4)
    SWAP: () => {
        const m = new QMatrix(4, 4);
        m.data[0][0] = Complex.one();
        m.data[1][2] = Complex.one();
        m.data[2][1] = Complex.one();
        m.data[3][3] = Complex.one();
        return m;
    },

    // Toffoli Gate (8x8) - CCNOT
    TOFFOLI: () => {
        const m = QMatrix.identity(8);
        m.data[6][6] = Complex.zero();
        m.data[6][7] = Complex.one();
        m.data[7][7] = Complex.zero();
        m.data[7][6] = Complex.one();
        return m;
    }
};

// Gate metadata for UI
const GateInfo = {
    'H': { name: 'Hadamard', symbol: 'H', color: '#00d4ff', description: 'يضع الكيوبت في حالة تراكب — Creates superposition', qubits: 1 },
    'X': { name: 'Pauli-X (NOT)', symbol: 'X', color: '#ff4757', description: 'ينقلب |0⟩↔|1⟩ — Quantum NOT gate', qubits: 1 },
    'Y': { name: 'Pauli-Y', symbol: 'Y', color: '#ffa502', description: 'دوران حول محور Y — Y-axis rotation', qubits: 1 },
    'Z': { name: 'Pauli-Z', symbol: 'Z', color: '#2ed573', description: 'انقلاب الطور — Phase flip', qubits: 1 },
    'S': { name: 'Phase-S', symbol: 'S', color: '#a855f7', description: 'بوابة الطور π/2 — Phase gate', qubits: 1 },
    'T': { name: 'Phase-T', symbol: 'T', color: '#f472b6', description: 'بوابة الطور π/4 — T gate', qubits: 1 },
    'CNOT': { name: 'CNOT', symbol: '⊕', color: '#06d6a0', description: 'تشابك كيوبتين — Entangles two qubits', qubits: 2 },
    'SWAP': { name: 'SWAP', symbol: '×', color: '#e9c46a', description: 'تبديل كيوبتين — Swap two qubits', qubits: 2 },
    'M': { name: 'Measure', symbol: 'M', color: '#ef476f', description: 'قياس الكيوبت — Collapses superposition', qubits: 1 }
};

// ============================================================
// Quantum State Vector
// ============================================================
class QuantumState {
    constructor(numQubits) {
        this.numQubits = numQubits;
        this.size = Math.pow(2, numQubits);
        this.amplitudes = new Array(this.size).fill(null).map(() => Complex.zero());
        this.amplitudes[0] = Complex.one(); // |00...0⟩
    }

    clone() {
        const s = new QuantumState(this.numQubits);
        s.amplitudes = this.amplitudes.map(a => new Complex(a.re, a.im));
        return s;
    }

    reset() {
        this.amplitudes.fill(Complex.zero());
        this.amplitudes[0] = Complex.one();
    }

    // Apply a single-qubit gate to target qubit
    applySingleGate(gate, targetQubit) {
        const n = this.numQubits;
        // Build full operator using tensor products
        let fullGate = (targetQubit === 0) ? gate : QuantumGates.I();
        for (let i = 1; i < n; i++) {
            const g = (i === targetQubit) ? gate : QuantumGates.I();
            fullGate = fullGate.tensorProduct(g);
        }
        this._applyMatrix(fullGate);
    }

    // Apply a two-qubit gate (control, target)
    applyTwoQubitGate(gate, qubit1, qubit2) {
        const n = this.numQubits;
        const dim = this.size;
        const newAmplitudes = new Array(dim).fill(null).map(() => Complex.zero());

        if (gate === 'CNOT') {
            for (let i = 0; i < dim; i++) {
                const bits = this._toBits(i, n);
                if (bits[qubit1] === 1) {
                    bits[qubit2] ^= 1;
                }
                const j = this._fromBits(bits, n);
                newAmplitudes[j] = newAmplitudes[j].add(this.amplitudes[i]);
            }
        } else if (gate === 'SWAP') {
            for (let i = 0; i < dim; i++) {
                const bits = this._toBits(i, n);
                const tmp = bits[qubit1];
                bits[qubit1] = bits[qubit2];
                bits[qubit2] = tmp;
                const j = this._fromBits(bits, n);
                newAmplitudes[j] = newAmplitudes[j].add(this.amplitudes[i]);
            }
        }

        this.amplitudes = newAmplitudes;
    }

    _applyMatrix(matrix) {
        const newAmplitudes = new Array(this.size).fill(null).map(() => Complex.zero());
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                newAmplitudes[i] = newAmplitudes[i].add(
                    matrix.get(i, j).mul(this.amplitudes[j])
                );
            }
        }
        this.amplitudes = newAmplitudes;
    }

    _toBits(num, n) {
        const bits = [];
        for (let i = 0; i < n; i++) {
            bits.push((num >> (n - 1 - i)) & 1);
        }
        return bits;
    }

    _fromBits(bits, n) {
        let num = 0;
        for (let i = 0; i < n; i++) {
            num = (num << 1) | bits[i];
        }
        return num;
    }

    // Get measurement probabilities
    getProbabilities() {
        return this.amplitudes.map(a => a.magnitudeSquared());
    }

    // Measure all qubits (collapses state)
    measure() {
        const probs = this.getProbabilities();
        let r = Math.random();
        let result = 0;
        for (let i = 0; i < this.size; i++) {
            r -= probs[i];
            if (r <= 0) { result = i; break; }
        }
        // Collapse
        this.amplitudes = this.amplitudes.map(() => Complex.zero());
        this.amplitudes[result] = Complex.one();
        return result;
    }

    // Measure single qubit
    measureQubit(qubit) {
        const n = this.numQubits;
        let prob0 = 0;
        for (let i = 0; i < this.size; i++) {
            const bits = this._toBits(i, n);
            if (bits[qubit] === 0) {
                prob0 += this.amplitudes[i].magnitudeSquared();
            }
        }
        const outcome = Math.random() < prob0 ? 0 : 1;

        // Collapse and renormalize
        let norm = 0;
        for (let i = 0; i < this.size; i++) {
            const bits = this._toBits(i, n);
            if (bits[qubit] !== outcome) {
                this.amplitudes[i] = Complex.zero();
            } else {
                norm += this.amplitudes[i].magnitudeSquared();
            }
        }
        const factor = 1 / Math.sqrt(norm);
        for (let i = 0; i < this.size; i++) {
            this.amplitudes[i] = this.amplitudes[i].scale(factor);
        }

        return outcome;
    }

    // Get Bloch sphere coordinates for a single qubit (partial trace)
    getBlochCoordinates(qubit = 0) {
        if (this.numQubits === 1) {
            const alpha = this.amplitudes[0];
            const beta = this.amplitudes[1];
            const theta = 2 * Math.acos(Math.min(1, alpha.magnitude()));
            const phi = beta.phase() - alpha.phase();

            return {
                x: Math.sin(theta) * Math.cos(phi),
                y: Math.sin(theta) * Math.sin(phi),
                z: Math.cos(theta),
                theta, phi
            };
        }

        // For multi-qubit, compute reduced density matrix
        const n = this.numQubits;
        let rho00 = Complex.zero(), rho01 = Complex.zero();
        let rho10 = Complex.zero(), rho11 = Complex.zero();

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const bitsI = this._toBits(i, n);
                const bitsJ = this._toBits(j, n);
                // Check if all other qubits match
                let match = true;
                for (let k = 0; k < n; k++) {
                    if (k !== qubit && bitsI[k] !== bitsJ[k]) { match = false; break; }
                }
                if (match) {
                    const qi = bitsI[qubit];
                    const qj = bitsJ[qubit];
                    const val = this.amplitudes[i].mul(this.amplitudes[j].conjugate());
                    if (qi === 0 && qj === 0) rho00 = rho00.add(val);
                    if (qi === 0 && qj === 1) rho01 = rho01.add(val);
                    if (qi === 1 && qj === 0) rho10 = rho10.add(val);
                    if (qi === 1 && qj === 1) rho11 = rho11.add(val);
                }
            }
        }

        // Bloch vector from density matrix: r = (Tr(ρσx), Tr(ρσy), Tr(ρσz))
        const x = rho01.re + rho10.re;
        const y = rho01.im - rho10.im;
        const z = rho00.re - rho11.re;

        return { x, y, z, theta: Math.acos(Math.max(-1, Math.min(1, z))), phi: Math.atan2(y, x) };
    }

    // Get state label string |00⟩, |01⟩, etc.
    getStateLabel(index) {
        const bits = this._toBits(index, this.numQubits);
        return `|${bits.join('')}⟩`;
    }
}

// ============================================================
// Grover's Algorithm Simulation
// ============================================================
class GroverSimulator {
    constructor(numQubits, targetState) {
        this.numQubits = numQubits;
        this.N = Math.pow(2, numQubits);
        this.targetState = targetState;
        this.optimalIterations = Math.floor(Math.PI / 4 * Math.sqrt(this.N));
        this.state = new QuantumState(numQubits);
        this.currentIteration = 0;
    }

    // Initialize: apply H to all qubits → uniform superposition
    initialize() {
        this.state.reset();
        const H = QuantumGates.H();
        for (let i = 0; i < this.numQubits; i++) {
            this.state.applySingleGate(H, i);
        }
        this.currentIteration = 0;
        return this.state.getProbabilities();
    }

    // One Grover iteration: Oracle + Diffusion
    iterate() {
        // Oracle: flip phase of target state
        this.state.amplitudes[this.targetState] =
            this.state.amplitudes[this.targetState].scale(-1);

        // Diffusion operator: 2|ψ⟩⟨ψ| - I
        const probs = this.state.amplitudes;
        const N = this.N;
        let mean = Complex.zero();
        for (let i = 0; i < N; i++) {
            mean = mean.add(probs[i]);
        }
        mean = mean.scale(2 / N);

        for (let i = 0; i < N; i++) {
            this.state.amplitudes[i] = mean.sub(this.state.amplitudes[i]);
        }

        this.currentIteration++;
        return this.state.getProbabilities();
    }

    getTargetProbability() {
        return this.state.amplitudes[this.targetState].magnitudeSquared();
    }
}

// ============================================================
// BB84 QKD Protocol
// ============================================================
class BB84Protocol {
    constructor(numBits = 20) {
        this.numBits = numBits;
        this.aliceBits = [];
        this.aliceBases = [];        // 0 = rectilinear (+), 1 = diagonal (×)
        this.bobBases = [];
        this.bobResults = [];
        this.evePresent = false;
        this.eveIntercepted = [];
        this.eveBases = [];
        this.eveResults = [];
        this.matchingIndices = [];
        this.sharedKey = [];
        this.qber = 0;
    }

    // Step 1: Alice generates random bits and bases
    alicePrepare() {
        this.aliceBits = [];
        this.aliceBases = [];
        for (let i = 0; i < this.numBits; i++) {
            this.aliceBits.push(Math.random() < 0.5 ? 0 : 1);
            this.aliceBases.push(Math.random() < 0.5 ? 0 : 1);
        }
        return { bits: [...this.aliceBits], bases: [...this.aliceBases] };
    }

    // Get photon polarization angle
    getPolarization(bit, basis) {
        // Rectilinear (+): 0→0° (→), 1→90° (↑)
        // Diagonal (×): 0→45° (↗), 1→135° (↖)
        if (basis === 0) return bit === 0 ? 0 : 90;
        return bit === 0 ? 45 : 135;
    }

    getPolarizationSymbol(bit, basis) {
        if (basis === 0) return bit === 0 ? '→' : '↑';
        return bit === 0 ? '↗' : '↖';
    }

    // Step 2: Eve intercepts (if present)
    eveIntercept(photonIndex, eveActive = false) {
        if (!eveActive) {
            this.eveIntercepted[photonIndex] = false;
            return null;
        }
        this.eveIntercepted[photonIndex] = true;
        const eveBasis = Math.random() < 0.5 ? 0 : 1;
        this.eveBases[photonIndex] = eveBasis;

        // Eve measures
        if (eveBasis === this.aliceBases[photonIndex]) {
            // Correct basis → gets correct bit
            this.eveResults[photonIndex] = this.aliceBits[photonIndex];
        } else {
            // Wrong basis → random result
            this.eveResults[photonIndex] = Math.random() < 0.5 ? 0 : 1;
        }

        return {
            basis: eveBasis,
            result: this.eveResults[photonIndex],
            correctBasis: eveBasis === this.aliceBases[photonIndex]
        };
    }

    // Step 3: Bob measures
    bobMeasure(photonIndex, eveActive = false) {
        const bobBasis = Math.random() < 0.5 ? 0 : 1;
        this.bobBases[photonIndex] = bobBasis;

        let actualBit, actualBasis;
        if (eveActive && this.eveIntercepted[photonIndex]) {
            // Bob receives Eve's re-sent photon
            actualBit = this.eveResults[photonIndex];
            actualBasis = this.eveBases[photonIndex];
        } else {
            actualBit = this.aliceBits[photonIndex];
            actualBasis = this.aliceBases[photonIndex];
        }

        if (bobBasis === actualBasis) {
            this.bobResults[photonIndex] = actualBit;
        } else {
            this.bobResults[photonIndex] = Math.random() < 0.5 ? 0 : 1;
        }

        return {
            basis: bobBasis,
            result: this.bobResults[photonIndex],
            correctBasis: bobBasis === this.aliceBases[photonIndex]
        };
    }

    // Step 4: Basis reconciliation
    reconcile() {
        this.matchingIndices = [];
        for (let i = 0; i < this.numBits; i++) {
            if (this.aliceBases[i] === this.bobBases[i]) {
                this.matchingIndices.push(i);
            }
        }

        // Extract shared key from matching bases
        const aliceKey = this.matchingIndices.map(i => this.aliceBits[i]);
        const bobKey = this.matchingIndices.map(i => this.bobResults[i]);

        // Calculate QBER
        let errors = 0;
        for (let i = 0; i < aliceKey.length; i++) {
            if (aliceKey[i] !== bobKey[i]) errors++;
        }
        this.qber = aliceKey.length > 0 ? errors / aliceKey.length : 0;

        this.sharedKey = aliceKey; // Alice's key (should match Bob's if no eavesdropper)

        return {
            matchingIndices: [...this.matchingIndices],
            aliceKey: [...aliceKey],
            bobKey: [...bobKey],
            qber: this.qber,
            keyLength: aliceKey.length,
            secure: this.qber < 0.11 // Below 11% threshold
        };
    }

    // Encrypt message with XOR (16-bit Unicode support)
    encryptMessage(message, key) {
        const bits = [];
        for (let i = 0; i < message.length; i++) {
            const charCode = message.charCodeAt(i);
            // Use 16 bits to support Unicode (Arabic, etc.)
            for (let b = 15; b >= 0; b--) {
                bits.push((charCode >> b) & 1);
            }
        }
        // XOR with key (repeating if needed)
        const encrypted = bits.map((b, i) => b ^ key[i % key.length]);
        return encrypted;
    }

    decryptMessage(encryptedBits, key) {
        const decrypted = encryptedBits.map((b, i) => b ^ key[i % key.length]);
        let message = '';
        for (let i = 0; i < decrypted.length; i += 16) {
            let charCode = 0;
            for (let b = 0; b < 16 && i + b < decrypted.length; b++) {
                charCode = (charCode << 1) | decrypted[i + b];
            }
            if (charCode > 0) message += String.fromCharCode(charCode);
        }
        return message;
    }
}

// Export for use
window.Complex = Complex;
window.QMatrix = QMatrix;
window.QuantumGates = QuantumGates;
window.GateInfo = GateInfo;
window.QuantumState = QuantumState;
window.GroverSimulator = GroverSimulator;
window.BB84Protocol = BB84Protocol;
