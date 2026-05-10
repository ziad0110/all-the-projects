/**
 * Quiz Module — 12 questions covering all quantum topics
 */
class QuantumQuiz {
    constructor() {
        this.questions = [
            {
                category: 'محاكي الدوائر',
                question: 'ماذا تفعل بوابة Hadamard (H) عند تطبيقها على كيوبت في الحالة |0⟩؟',
                options: [
                    'تقلبه إلى |1⟩',
                    'تضعه في تراكب متساوٍ بين |0⟩ و |1⟩',
                    'لا تفعل شيئاً',
                    'تقيسه مباشرة'
                ],
                correct: 1,
                explanation: 'بوابة Hadamard تحوّل |0⟩ إلى (|0⟩ + |1⟩)/√2، أي تراكب متساوٍ باحتمال 50% لكل حالة. هذا هو أساس الحوسبة الكمومية.'
            },
            {
                category: 'محاكي الدوائر',
                question: 'كم حالة ممكنة يمكن أن يمثلها نظام من 3 كيوبتات في نفس الوقت؟',
                options: ['3 حالات', '6 حالات', '8 حالات', '16 حالة'],
                correct: 2,
                explanation: 'عدد الحالات = 2ⁿ حيث n عدد الكيوبتات. لذا 2³ = 8 حالات (|000⟩ إلى |111⟩). هذا هو التسريع الأسي للحوسبة الكمومية!'
            },
            {
                category: 'محاكي الدوائر',
                question: 'ما هي بوابة CNOT؟',
                options: [
                    'بوابة تقيس كيوبت واحد',
                    'بوابة تربط كيوبتين — تقلب الهدف إذا كان التحكم |1⟩',
                    'بوابة تدمر التراكب',
                    'بوابة تضيف كيوبت جديد'
                ],
                correct: 1,
                explanation: 'CNOT (Controlled-NOT) هي بوابة ثنائية الكيوبت: تقلب الكيوبت الهدف فقط عندما يكون كيوبت التحكم في الحالة |1⟩. وهي أساسية لإنشاء التشابك الكمومي.'
            },
            {
                category: 'التشفير الكمومي',
                question: 'في بروتوكول BB84، ماذا يحدث عندما يستخدم أليس وبوب أسساً مختلفة لنفس الفوتون؟',
                options: [
                    'يحصلان على نفس البت دائماً',
                    'يُهمل هذا الفوتون ولا يُستخدم في المفتاح',
                    'يتم إعادة إرساله',
                    'يعرفان أن هناك تنصت'
                ],
                correct: 1,
                explanation: 'عندما تختلف الأسس (Alice: + مستقيم، Bob: × قطري مثلاً)، يكون قياس بوب عشوائياً تماماً. لذلك يُهمل هذا البت ويُحتفظ فقط بالبتات ذات الأسس المتطابقة.'
            },
            {
                category: 'التشفير الكمومي',
                question: 'كيف يتم كشف المتنصت (Eve) في بروتوكول BB84؟',
                options: [
                    'بتتبع عنوان IP الخاص بها',
                    'مقارنة عينة من المفتاح — أي تنصت يسبب أخطاء بنسبة ~25%',
                    'بإرسال رسالة تأكيد',
                    'لا يمكن كشف التنصت في BB84'
                ],
                correct: 1,
                explanation: 'أي محاولة تنصت تزعج الحالة الكمومية (نظرية عدم الاستنساخ). يقارن أليس وبوب عينة عشوائية من مفتاحهم — إذا تجاوزت الأخطاء ~11%، فهناك تنصت!'
            },
            {
                category: 'خوارزمية Grover',
                question: 'ما هو التسريع الذي تحققه خوارزمية Grover مقارنة بالبحث الكلاسيكي؟',
                options: [
                    'أسي: O(log N) بدلاً من O(N)',
                    'تربيعي: O(√N) بدلاً من O(N)',
                    'خطي: O(N/2) بدلاً من O(N)',
                    'لا يوجد تسريع'
                ],
                correct: 1,
                explanation: 'Grover تحقق تسريعاً تربيعياً: للبحث في قاعدة بيانات من مليون عنصر، تحتاج ~1000 خطوة بدلاً من 1,000,000! لكنه ليس أسياً مثل Shor.'
            },
            {
                category: 'عالم الكم',
                question: 'ما هو التراكب الكمومي (Superposition)؟',
                options: [
                    'الجسيم يتحرك بسرعة كبيرة',
                    'الجسيم يوجد في حالتين أو أكثر في نفس الوقت حتى يُقاس',
                    'الجسيم ينقسم إلى جسيمين',
                    'الجسيم يختفي ثم يظهر'
                ],
                correct: 1,
                explanation: 'التراكب يعني أن الجسيم الكمومي ليس في حالة محددة — إنه في "مزيج" من كل الحالات الممكنة، ولا "يقرر" إلا عندما نقيسه. مثل عملة تدور في الهواء!'
            },
            {
                category: 'عالم الكم',
                question: 'في تجربة قطة شرودنغر، متى تنتهي حالة التراكب؟',
                options: [
                    'بعد ساعة واحدة',
                    'عندما تموت الذرة المشعة',
                    'عندما نفتح الصندوق ونلاحظ (نقيس)',
                    'لا تنتهي أبداً'
                ],
                correct: 2,
                explanation: 'القياس/الملاحظة هو ما يسبب "انهيار الدالة الموجية". قبل الفتح، القطة في تراكب |حية⟩ + |ميتة⟩. فتح الصندوق = قياس → انهيار لحالة واحدة.'
            },
            {
                category: 'عالم الكم',
                question: 'ما هو النفق الكمومي (Quantum Tunneling)؟',
                options: [
                    'حفر نفق تحت الأرض بالليزر',
                    'جسيم يعبر حاجز طاقة يستحيل تجاوزه كلاسيكياً — باحتمال غير صفري',
                    'سفر أسرع من الضوء',
                    'اختراق جدار حماية الكمبيوتر'
                ],
                correct: 1,
                explanation: 'الدالة الموجية للجسيم لا تنعدم فجأة عند الحاجز — بل تتناقص أسياً. إذا كان الحاجز رقيقاً كفاية، يوجد احتمال أن الجسيم يظهر على الجانب الآخر! هذا يحدث في الترانزستورات!'
            },
            {
                category: 'عالم الكم',
                question: 'في التشابك الكمومي، ماذا يحدث عند قياس أحد الجسيمين المتشابكين؟',
                options: [
                    'لا يتأثر الجسيم الآخر',
                    'ينهار الآخر فوراً لحالة مرتبطة — بغض النظر عن المسافة',
                    'ينفجر الجسيم الآخر',
                    'يجب الانتظار لوصول المعلومة'
                ],
                correct: 1,
                explanation: 'التشابك الكمومي يعني ارتباط لحظي — أينشتاين سمّاه "التأثير الشبحي عن بعد". لكنه لا ينقل معلومات أسرع من الضوء لأن النتائج عشوائية.'
            },
            {
                category: 'تجربة الشقين',
                question: 'في تجربة الشقين، ماذا يحدث عندما نراقب أي شق يمر منه الإلكترون؟',
                options: [
                    'يظهر نمط تداخلي أوضح',
                    'يختفي النمط التداخلي ويتصرف الإلكترون كجسيم',
                    'يمر الإلكترون من الشقين معاً',
                    'لا تتغير النتيجة'
                ],
                correct: 1,
                explanation: 'هذا هو لغز ميكانيكا الكم! المراقبة تغيّر السلوك: بدون مراقبة → نمط تداخلي (موجة). مع مراقبة → نمط جسيمي (نقطتين فقط). هذا يُسمى "مشكلة القياس".'
            },
            {
                category: 'مفاهيم عامة',
                question: 'لماذا لا يمكن نسخ حالة كمومية مجهولة؟',
                options: [
                    'لأن التقنية لم تتطور بعد',
                    'بسبب نظرية عدم الاستنساخ الكمومي (No-Cloning Theorem) — فيزيائياً مستحيل',
                    'لأن النسخ يستهلك طاقة كبيرة',
                    'يمكن نسخها بسهولة'
                ],
                correct: 1,
                explanation: 'نظرية عدم الاستنساخ (1982) تثبت أنه مستحيل فيزيائياً إنشاء نسخة مطابقة لحالة كمومية مجهولة. هذا هو الأساس الذي يجعل التشفير الكمومي آمناً!'
            }
        ];
        this.currentIndex = 0;
        this.score = 0;
        this.answered = [];
        this.init();
    }

    init() {
        document.getElementById('quiz-total').textContent = this.questions.length;
        document.getElementById('btn-quiz-restart')?.addEventListener('click', () => this.restart());
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.showResult();
            return;
        }

        const q = this.questions[this.currentIndex];
        const container = document.getElementById('quiz-container');

        container.innerHTML = `
            <div class="glass-card quiz-card animate-fade-in">
                <div class="quiz-category">${q.category}</div>
                <h3 class="quiz-question">${q.question}</h3>
                <div class="quiz-options" id="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option" data-index="${i}">
                            <span class="option-letter">${['أ', 'ب', 'ج', 'د'][i]}</span>
                            <span class="option-text">${opt}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="quiz-explanation" id="quiz-explanation" style="display:none;"></div>
                <div class="quiz-nav" id="quiz-nav" style="display:none;">
                    <button class="btn btn-primary" id="btn-quiz-next">
                        ${this.currentIndex < this.questions.length - 1 ? 'السؤال التالي ←' : 'عرض النتيجة 🏆'}
                    </button>
                </div>
            </div>
        `;

        // Attach option click handlers
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => this.handleAnswer(parseInt(btn.dataset.index)));
        });

        // Update progress
        document.getElementById('quiz-current').textContent = this.currentIndex + 1;
        document.getElementById('quiz-bar').style.width = ((this.currentIndex / this.questions.length) * 100) + '%';
    }

    handleAnswer(selectedIndex) {
        if (this.answered.includes(this.currentIndex)) return;
        this.answered.push(this.currentIndex);

        const q = this.questions[this.currentIndex];
        const isCorrect = selectedIndex === q.correct;

        if (isCorrect) {
            this.score++;
            document.getElementById('quiz-score').textContent = this.score;
        }

        // Highlight answers
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((opt, i) => {
            opt.style.pointerEvents = 'none';
            if (i === q.correct) {
                opt.classList.add('correct');
            } else if (i === selectedIndex && !isCorrect) {
                opt.classList.add('wrong');
            } else {
                opt.style.opacity = '0.4';
            }
        });

        // Show explanation
        const expEl = document.getElementById('quiz-explanation');
        expEl.style.display = 'block';
        expEl.innerHTML = `
            <div class="explanation-header ${isCorrect ? 'correct' : 'wrong'}">
                ${isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة'}
            </div>
            <p>${q.explanation}</p>
        `;

        // Show next button
        document.getElementById('quiz-nav').style.display = 'flex';
        document.getElementById('btn-quiz-next').addEventListener('click', () => {
            this.currentIndex++;
            this.showQuestion();
        });
    }

    showResult() {
        document.getElementById('quiz-container').innerHTML = '';
        document.getElementById('quiz-progress').style.display = 'none';

        const pct = Math.round((this.score / this.questions.length) * 100);
        let emoji, title, desc;

        if (pct >= 90) { emoji = '🏆'; title = 'عبقري كمومي!'; desc = 'أداء مذهل — أنت تفهم الحوسبة الكمومية بعمق!'; }
        else if (pct >= 70) { emoji = '🌟'; title = 'ممتاز!'; desc = 'فهم قوي للمفاهيم الأساسية مع بعض النقاط للمراجعة.'; }
        else if (pct >= 50) { emoji = '📚'; title = 'جيد — تحتاج مراجعة'; desc = 'أساس جيد لكن راجع التجارب التفاعلية لتحسين فهمك.'; }
        else { emoji = '🔄'; title = 'حاول مرة أخرى'; desc = 'جرّب التجارب التفاعلية في كل قسم ثم أعد الاختبار!'; }

        document.getElementById('quiz-emoji').textContent = emoji;
        document.getElementById('quiz-result-title').textContent = title;
        document.getElementById('quiz-result-desc').textContent = desc;
        document.getElementById('quiz-final-score').textContent = `${this.score} / ${this.questions.length} (${pct}%)`;
        document.getElementById('quiz-result').style.display = 'block';
    }

    restart() {
        this.currentIndex = 0;
        this.score = 0;
        this.answered = [];
        document.getElementById('quiz-score').textContent = '0';
        document.getElementById('quiz-progress').style.display = 'block';
        document.getElementById('quiz-result').style.display = 'none';
        document.getElementById('quiz-bar').style.width = '0%';
        this.showQuestion();
    }
}

window.QuantumQuiz = QuantumQuiz;
