// =====================================================
// DASHBOARD — fixed transaction color fallback
// =====================================================
window.toggleCardsVisible = function toggleCardsVisible(cardId) {
    const card = AppData.cards.find(c => c.id == cardId);
    if (card) {
        card.isVisible = !card.isVisible;
        renderCards();
    }
};

window.renderCards = function renderCards() {
    const container = document.getElementById("cards-container");
    if (!container) return;
    const cur = getCurrency();
    container.innerHTML = AppData.cards.map(card => {
        const isVisible = card.isVisible === true;
        return `
        <div class="credit-card ${escapeHtml(card.color)} rounded-2xl p-5 min-w-[280px] h-[170px] relative flex flex-col justify-between text-white transition-all duration-300">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-xs opacity-70 mb-1">${escapeHtml(card.name)}</p>
                    <p class="font-mono text-lg tracking-wider">${isVisible ? escapeHtml(card.number) : '•••• •••• •••• ' + escapeHtml(card.number.slice(-4))}</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="toggleCardsVisible('${card.id}')" class="hover:text-amber-300 transition-colors z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <i class="fas ${isVisible ? 'fa-eye' : 'fa-eye-slash'} text-sm"></i>
                    </button>
                    <i class="fab fa-cc-${escapeHtml(card.type)} text-3xl opacity-80"></i>
                </div>
            </div>
            <div class="flex justify-between items-end">
                <div>
                    <p class="text-xs opacity-70">الرصيد</p>
                    <p class="font-bold text-xl">${isVisible ? card.balance.toLocaleString() + ' ' + escapeHtml(cur) : '••••••••'}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs opacity-70">صالحة حتى</p>
                    <p class="font-mono">${isVisible ? escapeHtml(card.expiry) : '••/••'}</p>
                </div>
            </div>
        </div>`;
    }).join("");
};

window.renderRecentTransactions = function renderRecentTransactions() {
    const container = document.getElementById("recent-transactions");
    if (!container) return;
    const cur = getCurrency();
    const recent = AppData.transactions.slice(0, 5);
    container.innerHTML = recent.map(t => {
        // FIX: fallback if color is missing
        const color = t.color || 'gray';
        return `
        <div class="transaction-item flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/5 transition" onclick="showTransactionDetails('${t.id}')">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center">
                    <i class="fas ${t.icon} text-${color}-400 text-sm"></i>
                </div>
                <div>
                    <p class="font-semibold text-sm">${escapeHtml(t.title)}</p>
                    <p class="text-xs text-gray-400">${escapeHtml(t.date)}</p>
                </div>
            </div>
            <span class="font-bold border px-2 py-1 rounded border-transparent ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}">
                ${t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString()} ${escapeHtml(cur)}
            </span>
        </div>`;
    }).join("");
};
