// =====================================================
// CONTRACT TEMPLATES — XSS-safe
// =====================================================

const contractTemplates = [
    {
        name: 'تصميم شعار', icon: 'fa-paint-brush', color: 'purple',
        milestones: [
            { title: 'تقديم 3 مقترحات أولية', pct: 30 },
            { title: 'تعديلات وتنقيح التصميم النهائي', pct: 40 },
            { title: 'تسليم ملفات المصدر (AI, PSD, PNG)', pct: 30 }
        ]
    },
    {
        name: 'تطوير موقع', icon: 'fa-code', color: 'cyan',
        milestones: [
            { title: 'تصميم واجهات UI/UX', pct: 20 },
            { title: 'برمجة الواجهة الأمامية', pct: 30 },
            { title: 'برمجة الخلفية وربط الـ API', pct: 30 },
            { title: 'الاختبار والنشر', pct: 20 }
        ]
    },
    {
        name: 'كتابة محتوى', icon: 'fa-pen-fancy', color: 'amber',
        milestones: [
            { title: 'البحث والمخطط الأولي', pct: 30 },
            { title: 'كتابة المحتوى النهائي', pct: 70 }
        ]
    },
    {
        name: 'تطوير تطبيق جوال', icon: 'fa-mobile-alt', color: 'emerald',
        milestones: [
            { title: 'تصميم الشاشات', pct: 15 },
            { title: 'برمجة الواجهات', pct: 25 },
            { title: 'ربط API والخدمات', pct: 30 },
            { title: 'الاختبار وإصلاح الأخطاء', pct: 15 },
            { title: 'النشر على المتاجر', pct: 15 }
        ]
    }
];

window.contractTemplates = contractTemplates;

window.applyTemplate = function applyTemplate(index) {
    const tmpl = contractTemplates[index];
    if (!tmpl) return;

    const amount = parseFloat(document.getElementById('escrow-amount')?.value) || 0;
    const container = document.getElementById('escrow-milestones-inputs');
    if (!container) return;

    container.innerHTML = tmpl.milestones.map((m, i) => {
        const mAmount = amount > 0 ? Math.round(amount * m.pct / 100) : '';
        return `
        <div class="milestone-input-row">
            <input type="text" class="premium-input" value="${escapeHtml(m.title)}" placeholder="وصف المرحلة ${i + 1}">
            <input type="number" class="premium-input" style="max-width:120px" value="${mAmount}" placeholder="المبلغ">
            ${i > 0 ? '<button class="remove-milestone-btn" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>' : ''}
        </div>`;
    }).join('');

    const titleInput = document.getElementById('escrow-title');
    if (titleInput && !titleInput.value) titleInput.value = tmpl.name;

    showToast('قالب جاهز', `تم تطبيق قالب "${tmpl.name}" — عدّل المبالغ حسب الحاجة`, 'info');
};
