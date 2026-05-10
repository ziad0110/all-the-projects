// =====================================================
// BUDGET — comprehensive features (charts, goals, insights)
// =====================================================
window.budgetDate = new Date();
window.budgetChartInstance = null;

window.initBudget = function initBudget() {
    updateBudgetMonthDisplay();
    renderBudgetCategories();
    renderGoals();
};

window.changeBudgetMonth = function changeBudgetMonth(delta) {
    window.budgetDate.setMonth(window.budgetDate.getMonth() + delta);
    initBudget();
};

window.updateBudgetMonthDisplay = function updateBudgetMonthDisplay() {
    const el = document.getElementById("budget-month-display");
    if (!el) return;
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    el.textContent = `${months[window.budgetDate.getMonth()]} ${window.budgetDate.getFullYear()}`;
};

window.renderGoals = function renderGoals() {
    const container = document.getElementById("goals-list");
    if (!container) return;
    const cur = getCurrency();
    container.innerHTML = AppData.goals.map(g => {
        const percent = Math.min(100, Math.round((g.current / g.target) * 100));
        return `
            <div class="glass-card rounded-2xl p-5 border border-white/5 relative group">
                <!-- Goal Actions -->
                <div class="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs" onclick="editGoalPrompt(${g.id})" title="تعديل">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="w-8 h-8 rounded-lg bg-rose/10 hover:bg-rose/20 text-rose flex items-center justify-center text-xs" onclick="deleteGoalPrompt(${g.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-xl bg-${g.color}/20 flex items-center justify-center shrink-0">
                        <i class="fas ${g.icon} text-${g.color} text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-base mb-1">${escapeHtml(g.title)}</p>
                        <p class="text-xs text-gray-400">الهدف: ${g.target.toLocaleString()} ${escapeHtml(cur)}</p>
                    </div>
                    <span class="text-lg font-bold text-${g.color}">${percent}%</span>
                </div>
                
                <div class="progress-bar mb-3 h-2">
                    <div class="progress-fill bg-${g.color}" style="width: ${percent}%; background-image: none; transition: width 1s ease-in-out;"></div>
                </div>
                
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div>
                        <p class="text-[10px] text-gray-500 mb-1">المحفوظ حالياً</p>
                        <p class="text-sm font-bold">${g.current.toLocaleString()} <span class="text-xs font-normal text-gray-400">${escapeHtml(cur)}</span></p>
                    </div>
                    <button class="px-4 py-2 rounded-xl bg-gradient-to-r from-ethereal-violet to-ethereal-cyan text-obsidian-base text-xs font-bold hover:scale-105 transition" onclick="depositToGoalPrompt(${g.id})">
                        <i class="fas fa-plus ml-1"></i> إيداع
                    </button>
                </div>
            </div>
        `;
    }).join("");
};

window.renderBudgetCategories = function renderBudgetCategories() {
    const container = document.getElementById("budget-categories");
    if (!container) return;
    const cur = getCurrency();
    
    const targetMonth = window.budgetDate.getMonth();
    const targetYear = window.budgetDate.getFullYear();
    const monthTx = AppData.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear && t.amount < 0;
    });

    const categoryMapping = window._budgetCategoryMap || {};
    let totalLimit = 0;
    let totalSpent = 0;

    AppData.budgetCategories.forEach(c => {
        c.spent = 0;
        totalLimit += c.limit;
    });

    monthTx.forEach(tx => {
        const mappedCategory = categoryMapping[tx.category] || 'أخرى';
        const budgetCat = AppData.budgetCategories.find(c => c.name === mappedCategory);
        if (budgetCat) {
            budgetCat.spent += Math.abs(tx.amount);
            totalSpent += Math.abs(tx.amount);
        } else {
            const otherCat = AppData.budgetCategories.find(c => c.name === 'أخرى');
            if (otherCat) {
                otherCat.spent += Math.abs(tx.amount);
                totalSpent += Math.abs(tx.amount);
            }
        }
    });

    // Update Summary Cards
    const elLimit = document.getElementById("budget-total-limit");
    const elSpent = document.getElementById("budget-total-spent");
    const elRemaining = document.getElementById("budget-total-remaining");
    
    if (elLimit) elLimit.textContent = `${totalLimit.toLocaleString()} ${cur}`;
    if (elSpent) elSpent.textContent = `${totalSpent.toLocaleString()} ${cur}`;
    if (elRemaining) {
        const rem = totalLimit - totalSpent;
        elRemaining.textContent = `${rem.toLocaleString()} ${cur}`;
        elRemaining.className = `font-bold text-lg ${rem >= 0 ? 'text-emerald' : 'text-rose'}`;
    }

    // Render Categories
    let hasWarning = false;
    let warningHtml = "";

    const html = AppData.budgetCategories.map(c => {
        if (c.limit === 0 && c.spent === 0) return ""; // Hide unused zero-limit categories
        const percent = c.limit > 0 ? Math.round((c.spent / c.limit) * 100) : (c.spent > 0 ? 100 : 0);
        const remaining = Math.max(0, c.limit - c.spent);
        const isOver = percent > 90;
        const isExceeded = percent > 100;

        if (isExceeded) {
            hasWarning = true;
            warningHtml += `<li>تجاوزت ميزانية <strong>${c.name}</strong> بـ ${(c.spent - c.limit).toLocaleString()} ${cur}</li>`;
        }

        return `
            <div class="group cursor-pointer bg-white/5 hover:bg-white/10 p-3 rounded-xl transition" onclick="editBudgetCategory('${escapeHtml(c.name)}')">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-${c.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <i class="fas ${c.icon} text-${c.color}"></i>
                        </div>
                        <div>
                            <span class="text-sm font-bold block mb-1">${escapeHtml(c.name)}</span>
                            <span class="text-[10px] text-gray-400 block">${c.limit > 0 ? `الحد: ${c.limit.toLocaleString()} ${cur}` : 'لا يوجد حد'}</span>
                        </div>
                    </div>
                    <div class="text-left flex flex-col items-end">
                        <span class="text-sm font-bold ${isOver ? 'text-rose' : 'text-white'}">${c.spent.toLocaleString()} <span class="text-xs font-normal text-gray-500">${cur}</span></span>
                        <span class="text-[10px] ${isExceeded ? 'text-rose' : 'text-emerald'} font-medium mt-1">
                            ${isExceeded ? '⚠️ متجاوز' : `متبقي ${remaining.toLocaleString()}`}
                        </span>
                    </div>
                </div>
                <div class="progress-bar" style="height: 6px; border-radius: 3px; overflow: hidden; background: rgba(255,255,255,0.05);">
                    <div class="progress-fill ${isOver ? 'bg-rose' : `bg-${c.color}`}" style="width: ${Math.min(percent, 100)}%; background-image: none; transition: width 0.8s ease;"></div>
                </div>
            </div>
        `;
    }).join("");

    // Actionable Insights
    let alertHtml = "";
    if (hasWarning) {
        alertHtml = `
            <div class="mt-6 p-4 rounded-xl bg-rose/10 border border-rose/20 flex items-start gap-3">
                <i class="fas fa-exclamation-circle text-rose mt-1 shrink-0"></i>
                <div>
                    <p class="text-sm font-bold text-rose mb-1">رؤى وتنبيهات الميزانية</p>
                    <ul class="text-xs text-gray-300 space-y-1 list-disc list-inside">
                        ${warningHtml}
                    </ul>
                    <p class="text-[10px] text-rose/70 mt-2">نصيحة: قلل إنفاقك في هذه الأقسام للوصول لأهداف توفيرك بشكل أسرع.</p>
                </div>
            </div>`;
    } else if (totalSpent > 0 && totalSpent <= totalLimit) {
        alertHtml = `
            <div class="mt-6 p-4 rounded-xl bg-emerald/10 border border-emerald/20 flex items-start gap-3">
                <i class="fas fa-lightbulb text-emerald mt-1 shrink-0 animate-pulse-slow"></i>
                <div>
                    <p class="text-sm font-bold text-emerald mb-1">أداء ممتاز هذا الشهر!</p>
                    <p class="text-xs text-gray-300">أنت تسير حسب الخطة. يمكنك تحويل الفائض (${(totalLimit - totalSpent).toLocaleString()} ${cur}) إلى أهداف التوفير الخاصة بك لتسريع تحقيقها.</p>
                </div>
            </div>`;
    }

    container.innerHTML = (html || '<p class="text-center text-sm text-gray-500 py-4">لا توجد فئات محددة.</p>') + alertHtml;
    
    renderBudgetChart();
};

window.renderBudgetChart = function renderBudgetChart() {
    const canvas = document.getElementById('budget-chart');
    const emptyMsg = document.getElementById('budget-chart-empty');
    if (!canvas) return;

    // Filter categories that have spending
    const spentCategories = AppData.budgetCategories.filter(c => c.spent > 0);
    
    if (spentCategories.length === 0) {
        canvas.style.display = 'none';
        if (emptyMsg) {
            emptyMsg.classList.remove('hidden');
            emptyMsg.classList.add('flex');
        }
        if (window.budgetChartInstance) {
            window.budgetChartInstance.destroy();
            window.budgetChartInstance = null;
        }
        return;
    }

    canvas.style.display = 'block';
    if (emptyMsg) {
        emptyMsg.classList.add('hidden');
        emptyMsg.classList.remove('flex');
    }

    const labels = spentCategories.map(c => c.name);
    const data = spentCategories.map(c => c.spent);
    
    // Convert tailwind color names to hex codes for Chart.js
    const colorMap = {
        'rose': '#f43f5e',
        'emerald': '#10b981',
        'cyan': '#22d3ee',
        'amber': '#fbbf24',
        'purple': '#a855f7',
        'blue': '#3b82f6',
        'indigo': '#6366f1',
        'pink': '#ec4899',
        'orange': '#f97316',
        'red': '#ef4444',
        'gray': '#6b7280'
    };
    
    const backgroundColors = spentCategories.map(c => colorMap[c.color] || '#8b5cf6');

    if (window.budgetChartInstance) {
        window.budgetChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // Add custom text to the center of the doughnut chart
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: function(chart) {
            if (chart.config.type !== 'doughnut') return;
            var ctx = chart.ctx;
            ctx.restore();
            
            var chartArea = chart.chartArea;
            if (!chartArea) return;
            
            var centerX = (chartArea.left + chartArea.right) / 2;
            var centerY = (chartArea.top + chartArea.bottom) / 2;
            
            var areaWidth = chartArea.right - chartArea.left;
            var areaHeight = chartArea.bottom - chartArea.top;
            var minDim = Math.min(areaWidth, areaHeight);
            
            // Use px instead of em, scaled by minimum dimension to be safe on mobile
            var titleFontSize = Math.max(10, Math.round(minDim / 14));
            var valFontSize = Math.max(12, Math.round(minDim / 10));
            var lineGap = Math.max(4, Math.round(minDim / 40));
            
            ctx.textBaseline = "middle";
            
            // Calculate starting Y to keep the block vertically centered around centerY
            var totalHeight = titleFontSize + lineGap + valFontSize;
            var startY = centerY - (totalHeight / 2) + (titleFontSize / 2);
            
            // Draw Title
            const isLight = document.body.classList.contains('light-mode');
            ctx.font = "bold " + titleFontSize + "px Cairo";
            ctx.fillStyle = isLight ? "#000000" : "#ffffff";
            var text = "إجمالي الإنفاق";
            var textX = centerX - Math.round(ctx.measureText(text).width / 2);
            ctx.fillText(text, textX, startY);

            // Draw Value
            var total = chart.config.data.datasets[0].data.reduce((a, b) => a + b, 0);
            var valText = total.toLocaleString() + " " + getCurrency();
            ctx.font = "bold " + valFontSize + "px Cairo";
            ctx.fillStyle = isLight ? "#334155" : "#9ca3af";
            var valX = centerX - Math.round(ctx.measureText(valText).width / 2);
            ctx.fillText(valText, valX, startY + (titleFontSize / 2) + lineGap + (valFontSize / 2));
            ctx.save();
        }
    };

    window.budgetChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#9ca3af',
                        font: { family: 'Cairo', size: 12 },
                        padding: 15,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    backgroundColor: '#1e1e2d',
                    titleFont: { family: 'Cairo' },
                    bodyFont: { family: 'Cairo' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw.toLocaleString()} ${getCurrency()}`;
                        }
                    }
                }
            }
        },
        plugins: [centerTextPlugin]
    });
};

// Edit limit for a budget category
window.editBudgetCategory = function editBudgetCategory(name) {
    const cat = AppData.budgetCategories.find(c => c.name === name);
    if (!cat) return;
    const html = `
        <div style="text-align:right;">
            <p style="font-size:0.85rem;color:#9ca3af;margin-bottom:8px;">تعديل حد <strong>${escapeHtml(name)}</strong></p>
            <input type="number" id="budget-limit-input" class="premium-input" style="width:100%;text-align:center;font-size:1.1rem;" placeholder="حد جديد (${getCurrency()})" min="0" step="50" value="${cat.limit}">
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'تعديل الميزانية';
    document.getElementById('confirm-message').innerHTML = html;
    const btnWrap = document.getElementById('confirm-btn-wrap');
    if (btnWrap) {
        btnWrap.style.display = '';
        btnWrap.innerHTML = `
            <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">إلغاء</button>
            <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-ethereal-violet to-ethereal-cyan text-obsidian-base text-sm font-bold" onclick="saveBudgetLimit('${escapeHtml(name)}')">حفظ</button>
        `;
    }
    showModal('confirm-modal');
};

window.saveBudgetLimit = function saveBudgetLimit(name) {
    const v = parseFloat(document.getElementById('budget-limit-input')?.value);
    if (isNaN(v) || v < 0) { showToast('تنبيه', 'يرجى إدخال قيمة صحيحة', 'error'); return; }
    const cat = AppData.budgetCategories.find(c => c.name === name);
    if (cat) cat.limit = v;
    closeModal('confirm-modal');
    if (typeof markStateDirty === 'function') markStateDirty();
    renderBudgetCategories();
    showToast('تم الحفظ', 'تم تحديث الحد', 'success');
};

// ==========================================
// GOAL MANAGEMENT
// ==========================================

window.showAddGoalModal = function showAddGoalModal() {
    const modal = document.getElementById('add-goal-modal');
    if (modal) modal.classList.remove('hidden');
};

window.addNewGoal = function addNewGoal() {
    const title = document.getElementById('goal-title').value.trim();
    const target = parseFloat(document.getElementById('goal-target').value);
    const icon = document.getElementById('goal-icon').value;
    const color = document.getElementById('goal-color').value;
    const deadline = document.getElementById('goal-deadline').value;

    if (!title || !target || !deadline) { showToast("تنبيه", "يرجى ملء جميع الحقول", "error"); return; }
    if (target <= 0) { showToast("تنبيه", "المبلغ المستهدف يجب أن يكون موجباً", "error"); return; }

    AppData.goals.push({ id: Date.now(), title, target, current: 0, icon, color, deadline });
    closeModal('add-goal-modal');
    renderGoals();
    if (typeof markStateDirty === 'function') markStateDirty();
    showSuccess("تم الإنشاء", "تم إضافة هدف التوفير الجديد بنجاح");

    document.getElementById('goal-title').value = '';
    document.getElementById('goal-target').value = '';
    document.getElementById('goal-deadline').value = '';
};

window.depositToGoalPrompt = function depositToGoalPrompt(id) {
    const goal = AppData.goals.find(g => g.id === id);
    if (!goal) return;
    
    const remaining = goal.target - goal.current;
    
    const html = `
        <div style="text-align:right;">
            <p style="font-size:0.85rem;color:#9ca3af;margin-bottom:8px;">إيداع مبلغ في <strong>${escapeHtml(goal.title)}</strong></p>
            <p style="font-size:0.75rem;color:#10b981;margin-bottom:12px;">المبلغ المتبقي للهدف: ${remaining.toLocaleString()} ${getCurrency()}</p>
            <input type="number" id="goal-deposit-input" class="premium-input" style="width:100%;text-align:center;font-size:1.1rem;" placeholder="أدخل المبلغ (${getCurrency()})" min="1" max="${remaining}">
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'إيداع للتوفير';
    document.getElementById('confirm-message').innerHTML = html;
    const btnWrap = document.getElementById('confirm-btn-wrap');
    if (btnWrap) {
        btnWrap.style.display = '';
        btnWrap.innerHTML = `
            <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">إلغاء</button>
            <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald to-cyan-500 text-white text-sm font-bold" onclick="processGoalDeposit(${id})">إيداع</button>
        `;
    }
    showModal('confirm-modal');
};

window.processGoalDeposit = function processGoalDeposit(id) {
    const v = parseFloat(document.getElementById('goal-deposit-input')?.value);
    if (isNaN(v) || v <= 0) { showToast('تنبيه', 'يرجى إدخال مبلغ صحيح', 'error'); return; }
    
    const goal = AppData.goals.find(g => g.id === id);
    if (!goal) return;
    
    if (AppData.user.balance < v) {
        showToast('خطأ', 'الرصيد في المحفظة غير كافٍ', 'error');
        return;
    }
    
    AppData.user.balance -= v;
    
    const tx = {
        id: Date.now(),
        title: `إيداع لهدف التوفير: ${goal.title}`,
        amount: -v,
        type: 'expense',
        category: 'ادخار',
        date: new Date().toISOString().split('T')[0],
        icon: 'fa-piggy-bank',
        color: 'emerald'
    };
    
    AppData.transactions.unshift(tx);
    
    goal.current += v;
    if (goal.current > goal.target) goal.current = goal.target;
    
    closeModal('confirm-modal');
    if (typeof markStateDirty === 'function') markStateDirty();
    renderGoals();
    showSuccess('عملية ناجحة', `تم إيداع ${v} ${getCurrency()} في ${goal.title}`);
    
    if (goal.current >= goal.target) {
        setTimeout(() => showSuccess('مبروك! 🎉', `لقد حققت هدف "${goal.title}" بالكامل!`), 1000);
    }
    
    // Update dashboard header balance if it exists
    const balanceEl = document.getElementById('header-balance');
    if (balanceEl) balanceEl.textContent = AppData.user.balance.toLocaleString();
};

window.editGoalPrompt = function editGoalPrompt(id) {
    const goal = AppData.goals.find(g => g.id === id);
    if (!goal) return;
    
    const html = `
        <div style="text-align:right; space-y-3;">
            <div style="margin-bottom: 10px;">
                <label style="font-size:0.75rem;color:#9ca3af;display:block;margin-bottom:4px;">اسم الهدف</label>
                <input type="text" id="edit-goal-title" class="premium-input" style="width:100%;" value="${escapeHtml(goal.title)}">
            </div>
            <div style="margin-bottom: 10px;">
                <label style="font-size:0.75rem;color:#9ca3af;display:block;margin-bottom:4px;">المبلغ المستهدف</label>
                <input type="number" id="edit-goal-target" class="premium-input" style="width:100%;" value="${goal.target}" min="1">
            </div>
            <div>
                <label style="font-size:0.75rem;color:#9ca3af;display:block;margin-bottom:4px;">تاريخ الانتهاء</label>
                <input type="date" id="edit-goal-deadline" class="premium-input" style="width:100%;" value="${goal.deadline}">
            </div>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'تعديل الهدف';
    document.getElementById('confirm-message').innerHTML = html;
    const btnWrap = document.getElementById('confirm-btn-wrap');
    if (btnWrap) {
        btnWrap.style.display = '';
        btnWrap.innerHTML = `
            <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">إلغاء</button>
            <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-ethereal-violet to-ethereal-cyan text-obsidian-base text-sm font-bold" onclick="saveGoalEdit(${id})">حفظ</button>
        `;
    }
    showModal('confirm-modal');
};

window.saveGoalEdit = function saveGoalEdit(id) {
    const title = document.getElementById('edit-goal-title').value.trim();
    const target = parseFloat(document.getElementById('edit-goal-target').value);
    const deadline = document.getElementById('edit-goal-deadline').value;

    if (!title || !target || !deadline) { showToast("تنبيه", "يرجى ملء جميع الحقول", "error"); return; }
    
    const goal = AppData.goals.find(g => g.id === id);
    if (!goal) return;
    
    goal.title = title;
    goal.target = target;
    goal.deadline = deadline;
    
    closeModal('confirm-modal');
    if (typeof markStateDirty === 'function') markStateDirty();
    renderGoals();
    showToast('تم الحفظ', 'تم تحديث بيانات الهدف', 'success');
};

window.deleteGoalPrompt = function deleteGoalPrompt(id) {
    const goal = AppData.goals.find(g => g.id === id);
    if (!goal) return;
    
    const html = `
        <div style="text-align:right;">
            <p style="font-size:0.9rem;margin-bottom:8px;">هل أنت متأكد من رغبتك في حذف هدف <strong>${escapeHtml(goal.title)}</strong>؟</p>
            <p style="font-size:0.75rem;color:#f43f5e;">لا يمكن التراجع عن هذا الإجراء وسيتم إلغاء تقدمك.</p>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'حذف الهدف';
    document.getElementById('confirm-message').innerHTML = html;
    const btnWrap = document.getElementById('confirm-btn-wrap');
    if (btnWrap) {
        btnWrap.style.display = '';
        btnWrap.innerHTML = `
            <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">إلغاء</button>
            <button class="flex-1 py-3 rounded-xl bg-rose/20 text-rose text-sm font-bold border border-rose/50 hover:bg-rose hover:text-white transition" onclick="executeDeleteGoal(${id})">حذف</button>
        `;
    }
    showModal('confirm-modal');
};

window.executeDeleteGoal = function executeDeleteGoal(id) {
    AppData.goals = AppData.goals.filter(g => g.id !== id);
    closeModal('confirm-modal');
    if (typeof markStateDirty === 'function') markStateDirty();
    renderGoals();
    showToast('تم الحذف', 'تم حذف الهدف بنجاح', 'success');
};

