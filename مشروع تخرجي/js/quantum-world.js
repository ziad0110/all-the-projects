/**
 * Quantum World Explorer - Enhanced
 * Interactive 3D visualizations of quantum phenomena
 */

class QuantumWorld {
    constructor() {
        this.experiments = {};
        this.activeExperiment = null;
        this.animationFrames = {};
        this.stats = { tunnelSuccess: 0, tunnelFail: 0, measurements: 0 };
        this.init();
    }

    init() { this.setupExperimentCards(); }

    setupExperimentCards() {
        document.querySelectorAll('.experiment-card').forEach(card => {
            card.addEventListener('click', () => this.openExperiment(card.dataset.experiment));
        });
        document.getElementById('btn-close-experiment')?.addEventListener('click', () => this.closeExperiment());
    }

    openExperiment(id) {
        document.getElementById('experiments-grid').style.display = 'none';
        const viewer = document.getElementById('experiment-viewer');
        viewer.style.display = 'block';
        viewer.className = 'experiment-viewer animate-fade-in';
        const info = this.getExperimentInfo(id);
        document.getElementById('experiment-title').textContent = info.title;
        document.getElementById('experiment-description').textContent = info.description;
        document.getElementById('experiment-theory').innerHTML = info.theory;
        this.closeActiveExperiment();
        this.activeExperiment = id;
        const canvas = document.getElementById('experiment-canvas');
        const controls = document.getElementById('experiment-controls');
        controls.innerHTML = '';
        switch (id) {
            case 'superposition': this.initSuperposition(canvas, controls); break;
            case 'entanglement': this.initEntanglement(canvas, controls); break;
            case 'tunneling': this.initTunneling(canvas, controls); break;
            case 'schrodinger': this.initSchrodinger(canvas, controls); break;
            case 'wave-collapse': this.initWaveCollapse(canvas, controls); break;
        }
    }

    closeExperiment() {
        this.closeActiveExperiment();
        document.getElementById('experiments-grid').style.display = 'grid';
        document.getElementById('experiment-viewer').style.display = 'none';
        this.activeExperiment = null;
    }

    closeActiveExperiment() {
        if (this.animationFrames.current) cancelAnimationFrame(this.animationFrames.current);
        document.getElementById('experiment-canvas').innerHTML = '';
    }

    getExperimentInfo(id) {
        const info = {
            'superposition': {
                title: '🔮 التراكب الكمومي — Superposition',
                description: 'الجسيم الكمومي يوجد في حالتين أو أكثر في نفس الوقت حتى يُقاس',
                theory: `<strong>المعادلة:</strong> <code>|ψ⟩ = α|0⟩ + β|1⟩</code><br>
                    الجسيم ليس في مكان واحد — إنه في <em>جميع الأماكن الممكنة</em> بنسب مختلفة.
                    عند القياس فقط، "يقرر" الجسيم أين يكون!<br><br>
                    <strong>🎮 جرّب:</strong> غيّر نسبة α/β بالمنزلق ثم اضغط "قياس" لانهيار الحالة.`
            },
            'entanglement': {
                title: '🔗 التشابك الكمومي — Entanglement',
                description: 'جسيمان مرتبطان لحظياً بغض النظر عن المسافة بينهما',
                theory: `<strong>حالة بيل:</strong> <code>|Φ+⟩ = (|00⟩ + |11⟩) / √2</code><br>
                    عند قياس أحد الجسيمين، ينهار الآخر <em>فوراً</em> — حتى لو كان على الجانب الآخر من الكون!<br><br>
                    <strong>🎮 جرّب:</strong> اضغط "قياس" وشاهد B ينهار فوراً. غيّر المسافة بالمنزلق.`
            },
            'tunneling': {
                title: '🚪 النفق الكمومي — Quantum Tunneling',
                description: 'الجسيم يعبر حاجزاً يستحيل تجاوزه كلاسيكياً',
                theory: `في الفيزياء الكلاسيكية: كرة لا تملك طاقة كافية لن تتجاوز الجدار أبداً.<br>
                    في الكمومية: هناك <em>احتمال غير صفري</em> أن الجسيم يظهر على الجانب الآخر!<br><br>
                    <strong>🎮 جرّب:</strong> غيّر عرض الحاجز وأطلق الجسيم عدة مرات لترى الإحصائيات.`
            },
            'schrodinger': {
                title: '🐱 قطة شرودنغر — Schrödinger\'s Cat',
                description: 'القطة حية وميتة في نفس الوقت حتى نفتح الصندوق!',
                theory: `تجربة فكرية وضعها <strong>إروين شرودنغر</strong> عام 1935:<br>
                    قطة في صندوق مغلق مع ذرة مشعة. إذا تحللت → سم يُطلق → القطة تموت.
                    لكن الذرة في <em>تراكب</em>، إذن القطة أيضاً في تراكب!<br><br>
                    <strong>🎮 جرّب:</strong> اضغط "افتح الصندوق" عدة مرات وشاهد الإحصائيات.`
            },
            'wave-collapse': {
                title: '📏 انهيار الدالة الموجية — Double-Slit',
                description: 'التجربة ذات الشقين: الجسيم يتصرف كموجة حتى نراقبه',
                theory: `أرسل إلكتروناً نحو حاجز به شقّين:<br>
                    • <strong>بدون مراقبة:</strong> نمط تداخلي 🌊<br>
                    • <strong>مع مراقبة:</strong> نمط جسيمي ●●<br>
                    مجرد <em>المراقبة</em> تغيّر سلوك الجسيم!<br><br>
                    <strong>🎮 جرّب:</strong> فعّل/أوقف المراقب وشاهد النمط يتغير. أطلق دفعات متعددة!`
            }
        };
        return info[id];
    }

    // ========== SUPERPOSITION ==========
    initSuperposition(container, controls) {
        const { scene, camera, renderer } = this.createScene(container);
        let alpha = 0.7, collapsed = false, collapseTarget = 0, t = 0, measureCount = 0, results = [0, 0];

        const particleGroup = new THREE.Group();
        const p1 = this.createGlowSphere(0.3, 0x00d4ff, 0.5); p1.position.set(-1.2, 0, 0);
        const p2 = this.createGlowSphere(0.3, 0x00d4ff, 0.5); p2.position.set(1.2, 0, 0);
        particleGroup.add(p1, p2);

        // Wave connection
        const wavePts = [];
        for (let i = 0; i <= 30; i++) {
            const tx = -1.2 + (2.4 * i / 30);
            wavePts.push(new THREE.Vector3(tx, Math.sin(i / 30 * Math.PI) * 0.6, 0));
        }
        const waveCurve = new THREE.CatmullRomCurve3(wavePts);
        const waveGeom = new THREE.TubeGeometry(waveCurve, 40, 0.015, 8, false);
        const waveMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3 });
        const waveMesh = new THREE.Mesh(waveGeom, waveMat);
        particleGroup.add(waveMesh);

        // Probability rings
        const ring1 = this.createRing(0.45, 0x00d4ff); ring1.position.set(-1.2, 0, 0); particleGroup.add(ring1);
        const ring2 = this.createRing(0.45, 0x00d4ff); ring2.position.set(1.2, 0, 0); particleGroup.add(ring2);

        this.addTextSprite('|0⟩', new THREE.Vector3(-1.2, -0.8, 0), 0x00d4ff, scene);
        this.addTextSprite('|1⟩', new THREE.Vector3(1.2, -0.8, 0), 0x00d4ff, scene);
        const eqLabel = this.addTextSprite('|ψ⟩ = α|0⟩ + β|1⟩', new THREE.Vector3(0, 1.6, 0), 0xffffff, scene);
        scene.add(particleGroup);

        controls.innerHTML = `
            <div class="form-group" style="margin-bottom:12px;">
                <label>نسبة α (احتمال |0⟩): <strong id="sp-alpha-val">70%</strong></label>
                <input type="range" class="range-slider" id="sp-alpha" min="0" max="100" value="70">
            </div>
            <button class="btn btn-primary" id="btn-sp-measure">📏 قياس</button>
            <button class="btn btn-secondary" id="btn-sp-reset">🔄 إعادة التراكب</button>
            <div class="info-box" style="margin-top:12px;font-size:0.8rem;" id="sp-state">
                الحالة: <strong style="color:var(--accent-cyan);">تراكب</strong> — α²=${(alpha**2*100).toFixed(0)}% | β²=${((1-alpha**2)*100).toFixed(0)}%
            </div>
            <div style="margin-top:8px;font-size:0.75rem;color:var(--text-dim);" id="sp-stats">
                إحصائيات القياس: |0⟩ = 0 مرات | |1⟩ = 0 مرات
            </div>`;

        document.getElementById('sp-alpha').addEventListener('input', (e) => {
            alpha = e.target.value / 100;
            document.getElementById('sp-alpha-val').textContent = e.target.value + '%';
            if (!collapsed) {
                document.getElementById('sp-state').innerHTML =
                    `الحالة: <strong style="color:var(--accent-cyan);">تراكب</strong> — α²=${(alpha**2*100).toFixed(0)}% | β²=${((1-alpha**2)*100).toFixed(0)}%`;
            }
        });

        document.getElementById('btn-sp-measure').addEventListener('click', () => {
            collapsed = true;
            collapseTarget = Math.random() < alpha ? 0 : 1;
            results[collapseTarget]++;
            measureCount++;
            document.getElementById('sp-state').innerHTML =
                `الحالة: <strong style="color:var(--accent-green);">منهارة!</strong> — الجسيم في ${collapseTarget === 0 ? '|0⟩' : '|1⟩'}`;
            document.getElementById('sp-stats').textContent =
                `إحصائيات القياس (${measureCount}): |0⟩ = ${results[0]} مرات (${(results[0]/measureCount*100).toFixed(0)}%) | |1⟩ = ${results[1]} مرات (${(results[1]/measureCount*100).toFixed(0)}%)`;
        });

        document.getElementById('btn-sp-reset').addEventListener('click', () => {
            collapsed = false;
            p1.material.opacity = 0.5; p2.material.opacity = 0.5; waveMat.opacity = 0.3;
            document.getElementById('sp-state').innerHTML =
                `الحالة: <strong style="color:var(--accent-cyan);">تراكب</strong> — α²=${(alpha**2*100).toFixed(0)}% | β²=${((1-alpha**2)*100).toFixed(0)}%`;
        });

        const animate = () => {
            this.animationFrames.current = requestAnimationFrame(animate);
            t += 0.02;
            if (!collapsed) {
                p1.material.opacity = 0.3 + alpha * 0.5 + Math.sin(t * 2) * 0.1;
                p2.material.opacity = 0.3 + (1 - alpha) * 0.5 + Math.cos(t * 2) * 0.1;
                p1.scale.setScalar(0.7 + alpha * 0.5 + Math.sin(t * 3) * 0.08);
                p2.scale.setScalar(0.7 + (1 - alpha) * 0.5 + Math.cos(t * 3) * 0.08);
                ring1.scale.setScalar(0.8 + Math.sin(t * 2) * 0.15);
                ring2.scale.setScalar(0.8 + Math.cos(t * 2) * 0.15);
                ring1.material.opacity = 0.2 + alpha * 0.3;
                ring2.material.opacity = 0.2 + (1 - alpha) * 0.3;
                waveMat.opacity = 0.15 + Math.sin(t * 4) * 0.1;
                p1.position.y = Math.sin(t) * 0.12;
                p2.position.y = Math.cos(t) * 0.12;
            } else {
                const winner = collapseTarget === 0 ? p1 : p2;
                const loser = collapseTarget === 0 ? p2 : p1;
                winner.material.opacity = Math.min(1, winner.material.opacity + 0.05);
                loser.material.opacity = Math.max(0, loser.material.opacity - 0.05);
                winner.scale.setScalar(Math.min(1.3, winner.scale.x + 0.01));
                loser.scale.setScalar(Math.max(0.1, loser.scale.x - 0.02));
                waveMat.opacity = Math.max(0, waveMat.opacity - 0.03);
                ring1.material.opacity = Math.max(0, ring1.material.opacity - 0.02);
                ring2.material.opacity = Math.max(0, ring2.material.opacity - 0.02);
            }
            particleGroup.rotation.y += 0.003;
            renderer.render(scene, camera);
        };
        animate();
    }

    // ========== ENTANGLEMENT ==========
    initEntanglement(container, controls) {
        const { scene, camera, renderer } = this.createScene(container);
        camera.position.z = 5;
        let measured = false, spinA = 0, t = 0, distance = 2, measureCount = 0, sameCount = 0;

        const p1 = this.createGlowSphere(0.25, 0xff6b9d, 0.8); p1.position.set(-distance, 0, 0);
        const p2 = this.createGlowSphere(0.25, 0x06d6a0, 0.8); p2.position.set(distance, 0, 0);
        scene.add(p1, p2);

        // Entanglement beam particles
        const beamParticles = [];
        for (let i = 0; i < 20; i++) {
            const bp = this.createGlowSphere(0.03, 0xa855f7, 0.4);
            bp.userData.offset = i / 20;
            scene.add(bp);
            beamParticles.push(bp);
        }

        const arrowA = this.createArrow(0xff6b9d, p1.position);
        const arrowB = this.createArrow(0x06d6a0, p2.position);
        scene.add(arrowA, arrowB);

        this.addTextSprite('جسيم A', new THREE.Vector3(-distance, -0.7, 0), 0xff6b9d, scene);
        this.addTextSprite('جسيم B', new THREE.Vector3(distance, -0.7, 0), 0x06d6a0, scene);
        const distLabel = this.addTextSprite('المسافة لا تهم!', new THREE.Vector3(0, 1.0, 0), 0xa855f7, scene);

        controls.innerHTML = `
            <div class="form-group" style="margin-bottom:12px;">
                <label>المسافة بين الجسيمين: <strong id="ent-dist-val">قريب</strong></label>
                <input type="range" class="range-slider" id="ent-dist" min="1" max="5" value="2" step="0.5">
            </div>
            <button class="btn btn-primary" id="btn-ent-measure">📏 قياس جسيم A</button>
            <button class="btn btn-secondary" id="btn-ent-reset">🔄 إعادة التشابك</button>
            <div class="info-box" style="margin-top:12px;font-size:0.8rem;" id="ent-state">
                الحالة: <strong style="color:var(--accent-purple);">متشابكان</strong> — اللف المغزلي غير محدد
            </div>
            <div style="margin-top:8px;font-size:0.75rem;color:var(--text-dim);" id="ent-stats">
                عدد القياسات: 0 | دائماً متعاكسان: 100%
            </div>`;

        const distLabels = { 1: 'قريب جداً', 1.5: 'قريب', 2: 'متوسط', 2.5: 'بعيد', 3: 'بعيد جداً', 3.5: 'كيلومترات!', 4: 'بين كواكب!', 4.5: 'بين مجرات!', 5: 'أقصى الكون!' };
        document.getElementById('ent-dist').addEventListener('input', (e) => {
            distance = parseFloat(e.target.value);
            p1.position.x = -distance; p2.position.x = distance;
            document.getElementById('ent-dist-val').textContent = distLabels[distance] || 'بعيد';
        });

        document.getElementById('btn-ent-measure').addEventListener('click', () => {
            if (!measured) {
                measured = true; spinA = Math.random() < 0.5 ? 0 : 1;
                measureCount++; sameCount++;
                const spinB = 1 - spinA;
                document.getElementById('ent-state').innerHTML =
                    `الحالة: <strong style="color:var(--accent-green);">مُقاس!</strong> — ` +
                    `A = <span style="color:#ff6b9d">${spinA === 0 ? '↑ Up' : '↓ Down'}</span>, ` +
                    `B = <span style="color:#06d6a0">${spinB === 0 ? '↑ Up' : '↓ Down'}</span> (عكسي فوراً!)`;
                document.getElementById('ent-stats').textContent =
                    `عدد القياسات: ${measureCount} | دائماً متعاكسان: ${(sameCount/measureCount*100).toFixed(0)}% ✓`;
            }
        });

        document.getElementById('btn-ent-reset').addEventListener('click', () => {
            measured = false;
            document.getElementById('ent-state').innerHTML =
                `الحالة: <strong style="color:var(--accent-purple);">متشابكان</strong> — اللف المغزلي غير محدد`;
        });

        const animate = () => {
            this.animationFrames.current = requestAnimationFrame(animate);
            t += 0.02;
            // Beam particles travel between the two
            beamParticles.forEach((bp, i) => {
                const prog = ((bp.userData.offset + t * 0.3) % 1);
                bp.position.x = -distance + prog * distance * 2;
                bp.position.y = Math.sin(prog * Math.PI * 3 + t) * 0.2;
                bp.material.opacity = measured ? Math.max(0, bp.material.opacity - 0.02) : 0.3 + Math.sin(t + i) * 0.15;
            });
            if (!measured) {
                const y1 = Math.sin(t * 2) * 0.4;
                p1.position.y = y1; p2.position.y = -y1;
                arrowA.rotation.z = t * 5;
                arrowB.rotation.z = -t * 5;
            } else {
                arrowA.rotation.z += (spinA === 0 ? 0 : Math.PI) - arrowA.rotation.z > 0.01 ? 0.1 : 0;
                arrowB.rotation.z += (spinA === 0 ? Math.PI : 0) - arrowB.rotation.z > 0.01 ? 0.1 : 0;
                p1.position.y *= 0.95; p2.position.y *= 0.95;
            }
            arrowA.position.set(p1.position.x, p1.position.y + 0.5, 0);
            arrowB.position.set(p2.position.x, p2.position.y + 0.5, 0);
            renderer.render(scene, camera);
        };
        animate();
    }

    // ========== TUNNELING ==========
    initTunneling(container, controls) {
        const { scene, camera, renderer } = this.createScene(container);
        camera.position.set(0, 0, 6);
        let animating = false, particleX = -3, tunneled = false, barrierWidth = 2, tunnelProb = 0.3, t = 0;

        const barrierGeom = new THREE.BoxGeometry(0.4, 2.5, 1);
        const barrierMat = new THREE.MeshBasicMaterial({ color: 0xff4757, transparent: true, opacity: 0.4 });
        const barrier = new THREE.Mesh(barrierGeom, barrierMat);
        scene.add(barrier);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(barrierGeom), new THREE.LineBasicMaterial({ color: 0xff4757, transparent: true, opacity: 0.6 }));
        barrier.add(edges);

        const particle = this.createGlowSphere(0.2, 0x00d4ff, 0.9); particle.position.set(-3, 0, 0);
        const ghost = this.createGlowSphere(0.2, 0x00d4ff, 0.2); ghost.visible = false;
        scene.add(particle, ghost);

        // Trail management — use a group so we can easily clear
        let trailLine = null;
        let trailPoints = [];

        const clearTrail = () => {
            if (trailLine) { scene.remove(trailLine); trailLine.geometry.dispose(); trailLine = null; }
            trailPoints = [];
        };

        this.addTextSprite('حاجز الطاقة', new THREE.Vector3(0, 1.8, 0), 0xff4757, scene);

        controls.innerHTML = `
            <div class="form-group" style="margin-bottom:10px;">
                <label>عرض الحاجز: <span id="tn-width-val">رفيع</span></label>
                <input type="range" class="range-slider" id="tn-width" min="1" max="5" value="2" step="1">
            </div>
            <button class="btn btn-primary" id="btn-tn-fire">🚀 أطلق الجسيم</button>
            <button class="btn btn-secondary" id="btn-tn-reset">🔄 إعادة</button>
            <button class="btn btn-secondary" id="btn-tn-auto">⚡ إطلاق تلقائي (×10)</button>
            <div class="info-box" style="margin-top:10px;font-size:0.8rem;" id="tn-state">
                احتمال العبور: <strong style="color:var(--accent-cyan);">30%</strong>
            </div>
            <div style="margin-top:8px;display:flex;gap:12px;font-size:0.8rem;" id="tn-stats">
                <span style="color:var(--accent-green);">✅ عبر: ${this.stats.tunnelSuccess}</span>
                <span style="color:var(--accent-red);">❌ ارتد: ${this.stats.tunnelFail}</span>
            </div>`;

        const widthLabels = ['', 'رفيع جداً', 'رفيع', 'متوسط', 'سميك', 'سميك جداً'];
        const probabilities = [0, 0.5, 0.3, 0.15, 0.05, 0.01];

        document.getElementById('tn-width').addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            barrierWidth = val; tunnelProb = probabilities[val];
            barrier.scale.x = val * 0.7;
            document.getElementById('tn-width-val').textContent = widthLabels[val];
            document.getElementById('tn-state').innerHTML =
                `احتمال العبور: <strong style="color:var(--accent-cyan);">${(tunnelProb * 100).toFixed(0)}%</strong>`;
        });

        const fireParticle = () => {
            if (animating) return;
            clearTrail();
            animating = true; particleX = -3; tunneled = Math.random() < tunnelProb;
            particle.position.set(-3, 0, 0);
            ghost.visible = false; particle.material.opacity = 0.9;
        };

        document.getElementById('btn-tn-fire').addEventListener('click', fireParticle);
        document.getElementById('btn-tn-reset').addEventListener('click', () => {
            animating = false; particleX = -3;
            particle.position.set(-3, 0, 0); particle.material.opacity = 0.9;
            ghost.visible = false;
            clearTrail();
            this.stats.tunnelSuccess = 0; this.stats.tunnelFail = 0;
            this.updateTunnelStats();
            document.getElementById('tn-state').innerHTML =
                `احتمال العبور: <strong style="color:var(--accent-cyan);">${(tunnelProb * 100).toFixed(0)}%</strong>`;
        });
        document.getElementById('btn-tn-auto').addEventListener('click', async () => {
            for (let i = 0; i < 10; i++) {
                const success = Math.random() < tunnelProb;
                if (success) this.stats.tunnelSuccess++; else this.stats.tunnelFail++;
            }
            this.updateTunnelStats();
        });

        const animate = () => {
            this.animationFrames.current = requestAnimationFrame(animate);
            t += 0.02;
            barrierMat.opacity = 0.3 + Math.sin(t * 2) * 0.1;
            if (animating) {
                particleX += 0.04; particle.position.x = particleX;
                // Build trail
                trailPoints.push(new THREE.Vector3(particleX, particle.position.y, 0));
                if (trailPoints.length > 60) trailPoints.shift();
                if (trailLine) { scene.remove(trailLine); trailLine.geometry.dispose(); }
                const tGeom = new THREE.BufferGeometry().setFromPoints(trailPoints);
                trailLine = new THREE.Line(tGeom, new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.25 }));
                scene.add(trailLine);

                if (particleX > -0.5 && particleX < 0.5) {
                    if (tunneled) {
                        ghost.visible = true; ghost.position.x = particleX + 1;
                        ghost.material.opacity = 0.3 + Math.sin(t * 10) * 0.1;
                        particle.material.opacity = Math.max(0.1, particle.material.opacity - 0.02);
                    } else {
                        particle.position.y = Math.sin(t * 20) * 0.05;
                    }
                }
                if (particleX > 0.5) {
                    if (tunneled) {
                        ghost.visible = false;
                        particle.material.opacity = Math.min(0.9, particle.material.opacity + 0.03);
                        if (particleX > 3.5) {
                            animating = false; this.stats.tunnelSuccess++;
                            this.updateTunnelStats();
                            document.getElementById('tn-state').innerHTML = `<strong style="color:var(--accent-green);">✅ عبر الحاجز!</strong>`;
                        }
                    } else {
                        particleX = -3; particle.position.set(-3, 0, 0); animating = false;
                        clearTrail();
                        this.stats.tunnelFail++; this.updateTunnelStats();
                        document.getElementById('tn-state').innerHTML = `<strong style="color:var(--accent-red);">❌ ارتد! جرّب مرة أخرى</strong>`;
                    }
                }
            } else { particle.position.y = Math.sin(t) * 0.1; }
            renderer.render(scene, camera);
        };
        animate();
    }

    updateTunnelStats() {
        const s = this.stats, total = s.tunnelSuccess + s.tunnelFail;
        const el = document.getElementById('tn-stats');
        if (el) el.innerHTML = `<span style="color:var(--accent-green);">✅ عبر: ${s.tunnelSuccess}${total ? ` (${(s.tunnelSuccess/total*100).toFixed(0)}%)` : ''}</span>` +
            `<span style="color:var(--accent-red);">❌ ارتد: ${s.tunnelFail}${total ? ` (${(s.tunnelFail/total*100).toFixed(0)}%)` : ''}</span>`;
    }

    // ========== SCHRÖDINGER ==========
    initSchrodinger(container, controls) {
        const { scene, camera, renderer } = this.createScene(container);
        camera.position.set(0, 1, 5);
        let opened = false, isAlive = true, t = 0, aliveCount = 0, deadCount = 0;

        // --- BOX ---
        const boxMat = new THREE.MeshBasicMaterial({ color: 0x4a4a6a, transparent: true, opacity: 0.5, side: THREE.BackSide });
        const box = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 1.8), boxMat);
        box.position.y = 0.1;
        scene.add(box);
        scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.4, 1.6, 1.8)), new THREE.LineBasicMaterial({ color: 0x7777aa })));

        const lidMat = new THREE.MeshBasicMaterial({ color: 0x6a6a8a, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const lid = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), lidMat);
        lid.position.set(0, 0.9, 0); lid.rotation.x = -Math.PI / 2;
        scene.add(lid);

        // --- 3D CAT MODEL ---
        const buildCat = (color) => {
            const cat = new THREE.Group();
            const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
            const matDark = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.6), transparent: true, opacity: 0.9 });

            // Body (elongated sphere)
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), mat);
            body.scale.set(1.4, 0.9, 0.9);
            cat.add(body);

            // Head
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), mat);
            head.position.set(0.45, 0.2, 0);
            cat.add(head);

            // Ears (cones)
            const earL = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.15, 4), mat);
            earL.position.set(0.42, 0.45, -0.1); earL.rotation.z = -0.2;
            cat.add(earL);
            const earR = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.15, 4), mat);
            earR.position.set(0.42, 0.45, 0.1); earR.rotation.z = -0.2;
            cat.add(earR);

            // Inner ears (pink)
            const innerEarMat = new THREE.MeshBasicMaterial({ color: 0xff8fab, transparent: true, opacity: 0.8 });
            const innerL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), innerEarMat);
            innerL.position.set(0.43, 0.44, -0.1); innerL.rotation.z = -0.2;
            cat.add(innerL);
            const innerR = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), innerEarMat);
            innerR.position.set(0.43, 0.44, 0.1); innerR.rotation.z = -0.2;
            cat.add(innerR);

            // Eyes
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
            eyeL.position.set(0.62, 0.26, -0.08);
            cat.add(eyeL);
            const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
            eyeR.position.set(0.62, 0.26, 0.08);
            cat.add(eyeR);

            // Pupils
            const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
            const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), pupilMat);
            pupilL.position.set(0.65, 0.26, -0.08);
            cat.add(pupilL);
            const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), pupilMat);
            pupilR.position.set(0.65, 0.26, 0.08);
            cat.add(pupilR);

            // Nose
            const noseMat = new THREE.MeshBasicMaterial({ color: 0xff6b9d });
            const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), noseMat);
            nose.position.set(0.67, 0.18, 0);
            cat.add(nose);

            // Whiskers (thin lines)
            const wMat = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6 });
            [[-0.06, 0.02], [0, 0.03], [0.06, 0.02]].forEach(([dz, dy]) => {
                const pts = [new THREE.Vector3(0.65, 0.17 + dy, dz), new THREE.Vector3(0.9, 0.15 + dy, dz * 3)];
                cat.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wMat));
            });

            // Tail (curve)
            const tailPts = [
                new THREE.Vector3(-0.5, 0, 0),
                new THREE.Vector3(-0.7, 0.15, 0.1),
                new THREE.Vector3(-0.8, 0.4, 0.05),
                new THREE.Vector3(-0.65, 0.55, -0.05)
            ];
            const tailCurve = new THREE.CatmullRomCurve3(tailPts);
            const tailGeom = new THREE.TubeGeometry(tailCurve, 12, 0.03, 6, false);
            cat.add(new THREE.Mesh(tailGeom, mat));

            // Legs (4 cylinders)
            [[-0.25, -0.12], [-0.25, 0.12], [0.2, -0.1], [0.2, 0.1]].forEach(([x, z]) => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8), matDark);
                leg.position.set(x, -0.4, z);
                cat.add(leg);
                // Paw
                const paw = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), matDark);
                paw.position.set(x, -0.55, z); paw.scale.y = 0.5;
                cat.add(paw);
            });

            cat.userData = { eyeL, eyeR, pupilL, pupilR, body, head, mat, eyeMat };
            return cat;
        };

        // Ghost cats (superposition)
        const ghostCat1 = buildCat(0x06d6a0);
        ghostCat1.position.set(-0.4, -0.3, 0);
        ghostCat1.scale.setScalar(0.7);
        ghostCat1.traverse(c => { if (c.material) c.material.opacity = 0.35; });
        scene.add(ghostCat1);

        const ghostCat2 = buildCat(0xef476f);
        ghostCat2.position.set(0.4, -0.3, 0);
        ghostCat2.scale.setScalar(0.7);
        ghostCat2.rotation.y = Math.PI * 0.8;
        ghostCat2.traverse(c => { if (c.material) c.material.opacity = 0.35; });
        // X eyes for dead ghost
        ghostCat2.userData.eyeMat.color.set(0xff0000);
        scene.add(ghostCat2);

        // Result cat (shown when box opens)
        const resultCat = buildCat(0x06d6a0);
        resultCat.position.set(0, -0.2, 0.2);
        resultCat.scale.setScalar(0.85);
        resultCat.visible = false;
        scene.add(resultCat);

        // Atom
        const atom = this.createGlowSphere(0.08, 0xa855f7, 0.7);
        atom.position.set(-0.8, -0.3, 0.6); scene.add(atom);
        // Poison vial
        const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }));
        vial.position.set(0.8, -0.45, 0.6); scene.add(vial);

        // Question mark
        const qMark = this.addTextSprite('?', new THREE.Vector3(0, 1.1, 0), 0xffa502, scene, 1.2);

        controls.innerHTML = `
            <button class="btn btn-primary" id="btn-cat-open" style="font-size:1.1rem;">📦 افتح الصندوق!</button>
            <button class="btn btn-secondary" id="btn-cat-reset">🔄 أغلق الصندوق</button>
            <div class="info-box" style="margin-top:12px;font-size:0.8rem;" id="cat-state">
                <strong style="color:var(--accent-purple);">|ψ⟩ = |حية⟩ + |ميتة⟩</strong> — القطة في تراكب!
            </div>
            <div style="margin-top:8px;font-size:0.75rem;color:var(--text-dim);" id="cat-stats">
                فتحات الصندوق: 0 | 😺 حية: 0 | 😿 ميتة: 0
            </div>`;

        document.getElementById('btn-cat-open').addEventListener('click', () => {
            if (!opened) {
                opened = true; isAlive = Math.random() < 0.5;
                ghostCat1.visible = false; ghostCat2.visible = false; qMark.visible = false;
                resultCat.visible = true;

                if (isAlive) {
                    // Alive: green cat, happy eyes
                    resultCat.traverse(c => { if (c.material && c.material !== resultCat.userData.eyeMat) c.material.color.set(0x06d6a0); });
                    resultCat.userData.eyeMat.color.set(0x00ff88);
                    resultCat.userData.mat.color.set(0x06d6a0);
                    aliveCount++;
                } else {
                    // Dead: red/gray cat, X eyes
                    resultCat.traverse(c => { if (c.material && c.material !== resultCat.userData.eyeMat) c.material.color.set(0x666677); });
                    resultCat.userData.eyeMat.color.set(0xff0000);
                    resultCat.userData.mat.color.set(0x555566);
                    resultCat.rotation.z = 0.3; // tilted
                    deadCount++;
                }
                const total = aliveCount + deadCount;
                document.getElementById('cat-state').innerHTML = isAlive
                    ? `<strong style="color:var(--accent-green);">😺 القطة حية!</strong> — الذرة لم تتحلل`
                    : `<strong style="color:var(--accent-red);">😿 القطة ميتة!</strong> — الذرة تحللت والسم انتشر`;
                document.getElementById('cat-stats').textContent =
                    `فتحات الصندوق: ${total} | 😺 حية: ${aliveCount} (${(aliveCount/total*100).toFixed(0)}%) | 😿 ميتة: ${deadCount} (${(deadCount/total*100).toFixed(0)}%)`;
            }
        });

        document.getElementById('btn-cat-reset').addEventListener('click', () => {
            opened = false;
            resultCat.visible = false; resultCat.rotation.z = 0;
            ghostCat1.visible = true; ghostCat2.visible = true; qMark.visible = true;
            lid.rotation.x = -Math.PI / 2; lid.position.y = 0.9; lidMat.opacity = 0.85;
            document.getElementById('cat-state').innerHTML =
                `<strong style="color:var(--accent-purple);">|ψ⟩ = |حية⟩ + |ميتة⟩</strong> — القطة في تراكب!`;
        });

        const animate = () => {
            this.animationFrames.current = requestAnimationFrame(animate);
            t += 0.02;
            if (!opened) {
                // Ghost cats pulsing
                ghostCat1.traverse(c => { if (c.material) c.material.opacity = 0.2 + Math.sin(t * 2) * 0.15; });
                ghostCat2.traverse(c => { if (c.material) c.material.opacity = 0.2 + Math.cos(t * 2) * 0.15; });
                atom.material.opacity = 0.5 + Math.sin(t * 4) * 0.3;
                box.rotation.y = Math.sin(t * 0.5) * 0.03;
                qMark.material.opacity = 0.5 + Math.sin(t * 3) * 0.4;
                qMark.position.y = 1.1 + Math.sin(t * 2) * 0.1;
            } else {
                // Open lid
                if (lid.position.y < 2.5) {
                    lid.position.y += 0.025;
                    lid.rotation.x += 0.015;
                    lidMat.opacity = Math.max(0.15, lidMat.opacity - 0.008);
                }
                // Cat breathing if alive
                if (isAlive && resultCat.userData.body) {
                    resultCat.userData.body.scale.y = 0.9 + Math.sin(t * 3) * 0.05;
                }
            }
            renderer.render(scene, camera);
        };
        animate();
    }

    // ========== WAVE COLLAPSE (Double-Slit) ==========
    initWaveCollapse(container, controls) {
        const { scene, camera, renderer } = this.createScene(container);
        camera.position.set(0, 0, 5);
        let observing = false, particles = [], t = 0, screenDots = [], totalFired = 0;

        // Barrier with slits
        [0.8, -0.8, 0].forEach(y => {
            const h = y === 0 ? 0.2 : 0.6;
            const wall = this.createBox(0.1, h, 0.5, 0x888888);
            wall.position.set(0, y, 0); scene.add(wall);
        });

        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 3), new THREE.MeshBasicMaterial({ color: 0x1a1a3a, side: THREE.DoubleSide, transparent: true, opacity: 0.5 }));
        screen.position.set(2.5, 0, 0); scene.add(screen);
        this.addTextSprite('شاشة الكشف', new THREE.Vector3(2.5, 1.8, 0), 0x888888, scene);
        this.addTextSprite('شق 1', new THREE.Vector3(-0.6, 0.35, 0), 0x888888, scene);
        this.addTextSprite('شق 2', new THREE.Vector3(-0.6, -0.35, 0), 0x888888, scene);
        const observer = this.addTextSprite('👁️', new THREE.Vector3(0, 1.5, 0), 0xffa502, scene, 0.8);
        observer.visible = false;

        controls.innerHTML = `
            <button class="btn btn-primary" id="btn-wc-fire">🔦 أطلق إلكترونات</button>
            <button class="btn btn-secondary" id="btn-wc-clear">🔄 مسح الشاشة</button>
            <div class="eve-toggle" style="margin-top:12px;border-color:rgba(0,212,255,0.2);background:rgba(0,212,255,0.05);">
                <input type="checkbox" class="toggle-switch" id="wc-observe">
                <div>
                    <div style="font-weight:600;font-size:0.9rem;">👁️ تفعيل المراقب</div>
                    <div style="font-size:0.75rem;color:var(--text-secondary);">مراقبة أي شق يمر منه الإلكترون</div>
                </div>
            </div>
            <div class="info-box" style="margin-top:8px;font-size:0.8rem;" id="wc-state">
                النمط: <strong style="color:var(--accent-cyan);">تداخلي 🌊</strong> — الإلكترون يمر من الشقين معاً
            </div>
            <div style="margin-top:6px;font-size:0.75rem;color:var(--text-dim);" id="wc-stats">إلكترونات مُطلقة: 0</div>`;

        document.getElementById('wc-observe').addEventListener('change', (e) => {
            observing = e.target.checked;
            // Clear screen when switching modes
            screenDots.forEach(d => scene.remove(d)); screenDots = []; totalFired = 0;
            document.getElementById('wc-state').innerHTML = observing
                ? `النمط: <strong style="color:var(--accent-orange);">جسيمي ●●</strong> — نعرف أي شق — لا تداخل!`
                : `النمط: <strong style="color:var(--accent-cyan);">تداخلي 🌊</strong> — الإلكترون يمر من الشقين معاً`;
            document.getElementById('wc-stats').textContent = 'إلكترونات مُطلقة: 0 (تم مسح الشاشة)';
        });

        document.getElementById('btn-wc-fire').addEventListener('click', () => {
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const p = this.createGlowSphere(0.04, observing ? 0xffa502 : 0x00d4ff, 0.8);
                    p.position.set(-2.5, (Math.random() - 0.5) * 0.3, 0);
                    const slit = Math.random() < 0.5 ? 1 : -1;
                    let finalY;
                    if (observing) {
                        finalY = slit * (0.3 + Math.random() * 0.3);
                    } else {
                        finalY = Math.sin(Math.random() * 8) * 0.6 + (Math.random() - 0.5) * 0.15;
                    }
                    p.userData = { vx: 0.04 + Math.random() * 0.01, slit, passedBarrier: false, landed: false, finalY };
                    scene.add(p); particles.push(p); totalFired++;
                }, i * 60);
            }
            document.getElementById('wc-stats').textContent = `إلكترونات مُطلقة: ${totalFired + 30}`;
        });

        document.getElementById('btn-wc-clear').addEventListener('click', () => {
            particles.forEach(p => scene.remove(p)); particles = [];
            screenDots.forEach(d => scene.remove(d)); screenDots = [];
            totalFired = 0;
            document.getElementById('wc-stats').textContent = 'إلكترونات مُطلقة: 0';
        });

        const animate = () => {
            this.animationFrames.current = requestAnimationFrame(animate);
            t += 0.02;
            observer.visible = observing;
            if (observing) observer.material.opacity = 0.5 + Math.sin(t * 3) * 0.3;

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                if (p.userData.landed) continue;
                p.position.x += p.userData.vx;
                if (p.position.x > -0.1 && !p.userData.passedBarrier) {
                    p.userData.passedBarrier = true;
                    p.position.y = p.userData.slit * 0.35;
                }
                if (p.userData.passedBarrier) {
                    p.position.y += (p.userData.finalY - p.position.y) * 0.05;
                }
                if (p.position.x > 2.4) {
                    p.userData.landed = true;
                    const dot = this.createGlowSphere(0.025, observing ? 0xffa502 : 0x00d4ff, 0.9);
                    dot.position.set(2.45, p.position.y, 0);
                    scene.add(dot); screenDots.push(dot);
                    scene.remove(p); particles.splice(i, 1);
                }
            }
            renderer.render(scene, camera);
        };
        animate();
    }

    // ========== HELPERS ==========
    createScene(container) {
        const width = container.clientWidth || 600, height = 350;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 0, 4);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x050510, 1);
        container.appendChild(renderer.domElement);
        const grid = new THREE.GridHelper(6, 12, 0x1a1a3a, 0x1a1a3a);
        grid.position.y = -1.5; scene.add(grid);
        // Ambient particles
        for (let i = 0; i < 30; i++) {
            const sp = this.createGlowSphere(0.01, 0x333366, 0.3);
            sp.position.set((Math.random()-0.5)*8, (Math.random()-0.5)*4, (Math.random()-0.5)*4);
            scene.add(sp);
        }
        return { scene, camera, renderer };
    }

    createGlowSphere(radius, color, opacity) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity }));
        mesh.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 2, 12, 12), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opacity * 0.2 })));
        return mesh;
    }

    createRing(radius, color) {
        const geom = new THREE.RingGeometry(radius - 0.02, radius, 32);
        return new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
    }

    createArrow(color, basePos) {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), new THREE.MeshBasicMaterial({ color })));
        const head = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 8), new THREE.MeshBasicMaterial({ color }));
        head.position.y = 0.25; g.add(head);
        g.position.copy(basePos).add(new THREE.Vector3(0, 0.5, 0));
        return g;
    }

    createBox(w, h, d, color) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.3 })));
        return mesh;
    }

    addTextSprite(text, position, color, scene, scale = 0.6) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256; canvas.height = 64;
        ctx.font = '28px Tajawal, Arial, sans-serif';
        ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 32);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
        sprite.position.copy(position);
        sprite.scale.set(scale * 2, scale * 0.5, 1);
        scene.add(sprite);
        return sprite;
    }
}

window.QuantumWorld = QuantumWorld;
