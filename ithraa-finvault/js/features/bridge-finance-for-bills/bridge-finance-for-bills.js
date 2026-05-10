// =====================================================
// BRIDGE FINANCE FOR BILLS
// =====================================================
window.financeBill = function financeBill(billId) {
    const bill = AppData.bills.find(b => b.id === billId);
    if (!bill) return;

    const bridgeAmountInput = document.getElementById('bridge-amount');
    if (bridgeAmountInput) {
        bridgeAmountInput.value = Math.min(bill.amount, 5000);
    }

    if (typeof showBridgeFinance === 'function') showBridgeFinance();
    if (typeof updateBridgeCalculation === 'function') updateBridgeCalculation();
    showToast('تمويل فاتورة', `تمويل "${bill.title}" بقيمة ${bill.amount.toLocaleString()} ر.س`, 'info');
};
