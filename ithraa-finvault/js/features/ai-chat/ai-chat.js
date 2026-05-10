// =====================================================
// AI CHAT — rule-based assistant with REAL data analysis
// =====================================================
// NOTE: This is a rule-based assistant with personalized analysis based on
// the user's REAL transactions/budgets/balance. It is transparently labeled
// as "مستشار قواعدي" (rule-based) — NOT a black-box "AI" claim.

window.sendMessage = function sendMessage() {
    const input = document.getElementById("chat-input");
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;

    addChatMessage(message, "user");
    input.value = "";

    // Show typing indicator
    const container = document.getElementById("chat-messages");
    if (container) {
        const typing = document.createElement('div');
        typing.id = 'typing-indicator';
        typing.className = 'flex gap-3';
        typing.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-white text-xs"></i>
            </div>
            <div class="chat-bubble-ai p-3 max-w-[60%]"><span class="typing-dots">●●●</span></div>`;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }

    setTimeout(() => {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
        const response = generateAIResponse(message);
        addChatMessage(response, "ai");
    }, 600 + Math.random() * 600);
};

window.quickAsk = function quickAsk(question) {
    const el = document.getElementById("chat-input");
    if (el) el.value = question;
    sendMessage();
};

window.addChatMessage = function addChatMessage(text, sender) {
    const container = document.getElementById("chat-messages");
    if (!container) return;
    const div = document.createElement("div");
    div.className = "flex gap-3 animate-fade-in";

    // SECURITY: escape user input before insertion
    const safeText = escapeHtml(text);

    if (sender === "user") {
        const userName = encodeURIComponent(AppData.user.name || 'User');
        div.innerHTML = `
            <div class="chat-bubble-user p-4 max-w-[80%] mr-auto">
                <p class="text-sm">${safeText}</p>
            </div>
            <img src="https://ui-avatars.com/api/?name=${userName}&background=8b5cf6&color=fff" class="w-8 h-8 rounded-full flex-shrink-0">
        `;
    } else {
        // AI response — keep newlines
        const formatted = safeText.replace(/\n/g, '<br>');
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-white text-xs"></i>
            </div>
            <div class="chat-bubble-ai p-4 max-w-[80%]">
                <p class="text-sm">${formatted}</p>
            </div>
        `;
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
};

// =====================================================
// REAL data-driven response generator
// =====================================================
window.generateAIResponse = function generateAIResponse(message) {
    const msg = message.toLowerCase();
    const cur = getCurrency();

    // Calculate REAL stats from user's data
    const balance = getAvailableBalance();
    const totalWealth = getTotalBalance();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTx = AppData.transactions.filter(t => new Date(t.date) >= monthStart);
    const monthIncome = monthTx.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    const monthExpense = monthTx.filter(t => t.amount < 0 && t.type === 'expense').reduce((a, t) => a + Math.abs(t.amount), 0);

    // Top spending category this month
    const expenseByCategory = {};
    monthTx.filter(t => t.amount < 0 && t.type === 'expense').forEach(t => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + Math.abs(t.amount);
    });
    const sortedCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0];

    // Saving rate
    const savingRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;

    // SAVING-related queries
    if (/توفير|وفر|ادخار|أدخر|توف/.test(msg)) {
        if (savingRate < 20) {
            return `معدل ادخارك الشهري حالياً ${savingRate}% فقط. القاعدة الذهبية هي 50/30/20: 50% للضروريات، 30% للرغبات، 20% للادخار. أكبر فئة إنفاق لديك: ${topCategory ? topCategory[0] + ' (' + topCategory[1].toLocaleString() + ' ' + cur + ')' : 'لا توجد بيانات كافية'}. حاول تقليل ${topCategory ? topCategory[0] : 'المصاريف غير الضرورية'} بنسبة 15-20%.`;
        }
        return `أداء ممتاز! معدل ادخارك ${savingRate}% — أعلى من المتوسط الموصى به. استمر، وفكّر في تنمية المدخرات بصناديق متوافقة مع الشريعة بدلاً من تركها بدون عوائد.`;
    }

    // INVESTMENT queries
    if (/استثمار|اسهم|أسهم|تداول|صناديق|عقار/.test(msg)) {
        return `بناءً على رصيدك الإجمالي (${totalWealth.toLocaleString()} ${cur})، توزيع مقترح متحفظ:\n• 40% صناديق متنوعة\n• 30% صكوك\n• 20% أسهم متوافقة\n• 10% احتياطي سيولة\n\nالقاعدة: لا تستثمر إلا ما يمكنك الاستغناء عنه لمدة 3+ سنوات. ابدأ بمحاكي الاستثمار في قسم التعليم لتجربة السيناريوهات.`;
    }

    // SPENDING queries
    if (/إنفاق|انفاق|مصاريف|حلل|صرف|مصروف/.test(msg)) {
        if (monthExpense === 0) return 'لم تسجّل أي مصاريف هذا الشهر بعد.';
        const top3 = sortedCategories.slice(0, 3).map(([c, a]) => `• ${c}: ${a.toLocaleString()} ${cur}`).join('\n');
        return `إنفاقك هذا الشهر: ${monthExpense.toLocaleString()} ${cur}\nأعلى الفئات:\n${top3}\n\nإيرادك: ${monthIncome.toLocaleString()} ${cur} | نسبة الادخار: ${savingRate}%.`;
    }

    // BALANCE queries
    if (/رصيد|كم.*معي|كم.*لي|كم.*عندي/.test(msg)) {
        const cur2 = cur;
        return `رصيدك المتاح: ${balance.toLocaleString()} ${cur2}\nإجمالي ثروتك (مع الحصالات): ${totalWealth.toLocaleString()} ${cur2}\nمحجوز في عقود الضمان: ${getLockedInEscrow().toLocaleString()} ${cur2}`;
    }

    // BILLS queries
    if (/فاتورة|فواتير|ديون|مستحق/.test(msg)) {
        const unpaid = AppData.bills.filter(b => !b.paid);
        if (unpaid.length === 0) return 'كل فواتيرك مدفوعة 🎉. أحسنت!';
        const total = unpaid.reduce((a, b) => a + b.amount, 0);
        return `لديك ${unpaid.length} فواتير غير مدفوعة بإجمالي ${total.toLocaleString()} ${cur}. أقربها استحقاقاً: ${unpaid[0].title} (${unpaid[0].dueDate}).`;
    }

    // ZAKAT
    if (/زكاة/.test(msg)) {
        const liquid = balance + getLockedInVaults();
        const nisab = window.ZAKAT_CONFIG ? window.ZAKAT_CONFIG.nisabSAR : 24000;
        if (liquid < nisab) {
            return `ثروتك السائلة (${liquid.toLocaleString()} ${cur}) أقل من النصاب (${nisab.toLocaleString()} ${cur}) — لا تجب الزكاة حالياً.`;
        }
        const zakat = Math.round(liquid * 0.025);
        return `ثروتك السائلة بلغت النصاب. الزكاة المتوقعة: ${zakat.toLocaleString()} ${cur} (2.5% من ${liquid.toLocaleString()}).\n📌 ملاحظة شرعية: الزكاة تجب فقط عند مرور الحول الهجري — راجع رادار التدفق لتفاصيل الحساب.`;
    }

    // GREETING
    if (/^(مرحبا|اهلا|أهلا|السلام|سلام|hi|hello)/.test(msg)) {
        return `أهلاً بك ${AppData.user.name || ''}! 👋\nأنا مستشار إثراء (نظام قواعدي يحلل بياناتك المالية الفعلية). جرّب أن تسألني:\n• كيف هو إنفاقي؟\n• ما رصيدي؟\n• ما نصيحتك للادخار؟\n• كم زكاتي؟`;
    }

    // DEFAULT
    return `بناءً على بياناتك المالية:\n• الرصيد: ${balance.toLocaleString()} ${cur}\n• معدل الادخار: ${savingRate}%\n• أكبر فئة مصاريف: ${topCategory ? topCategory[0] : 'لا يوجد'}\n\n💡 اسألني عن: التوفير، الاستثمار، الزكاة، الفواتير، أو تحليل الإنفاق.`;
};
