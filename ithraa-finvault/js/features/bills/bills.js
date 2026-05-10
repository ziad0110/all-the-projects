// =====================================================
// BILLS — fixed mojibake, balance via addTransaction, real PDF generation
// =====================================================
window.initBills = function initBills() {
    renderBills();
};

window.renderBills = function renderBills() {
    const container = document.getElementById("bills-list");
    if (!container) return;
    const cur = getCurrency();
    const unpaid = AppData.bills.filter(b => !b.paid);
    const paid = AppData.bills.filter(b => b.paid);

    let html = '';

    if (unpaid.length === 0) {
        html += `
            <div class="glass-card rounded-3xl p-10 flex flex-col items-center justify-center text-center opacity-90 mb-6 animate-fade-in border-t-4 border-emerald-400">
                <div class="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <i class="fas fa-check-circle text-4xl text-emerald-400"></i>
                </div>
                <h3 class="font-bold text-lg mb-2 text-white">لا توجد فواتير مستحقة!</h3>
                <p class="text-sm text-gray-400 max-w-[250px] mx-auto">عمل رائع! لقد قمت بتسديد جميع فواتيرك. أنت تدير أموالك ببراعة 🌟</p>
            </div>`;
    } else {
        html += unpaid.map(b => `
            <div class="glass-card rounded-2xl p-4 sm:p-5 border-r-4 border-rose hover:bg-white/[0.03] transition-all mb-4 cursor-pointer" onclick="showBillDetailsModal(${b.id})">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-${b.color}/20 flex items-center justify-center shrink-0">
                            <i class="fas ${b.icon} text-${b.color} text-xl sm:text-2xl"></i>
                        </div>
                        <div class="min-w-0">
                            <p class="font-bold text-base mb-1 truncate">${escapeHtml(b.title)}</p>
                            <p class="text-xs text-gray-400"><i class="fas fa-calendar-alt ml-1"></i>تاريخ الاستحقاق: ${escapeHtml(b.dueDate)}</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:items-end gap-3">
                        <div class="flex justify-between sm:justify-end items-center gap-4">
                            <p class="text-xs text-gray-400 sm:hidden">المبلغ المطلوب</p>
                            <p class="font-bold text-xl text-rose">${b.amount.toLocaleString()} <span class="text-sm">${escapeHtml(cur)}</span></p>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <button onclick="event.stopPropagation(); printBill(${b.id})" class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/5 transition flex justify-center items-center shrink-0" title="طباعة الإيصال">
                                <i class="fas fa-print"></i>
                            </button>
                            <button onclick="event.stopPropagation(); shareBill(${b.id})" class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/5 transition flex justify-center items-center shrink-0" title="مشاركة الفاتورة">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <button onclick="event.stopPropagation(); payBill(${b.id})" class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose to-[#ff758c] text-white font-bold text-sm hover:shadow-lg hover:shadow-rose/30 transition-all duration-300 active:scale-95 whitespace-nowrap shadow-lg shadow-rose/20">
                                <i class="fas fa-credit-card ml-2"></i>
                                ادفع الآن
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");
    }

    if (paid.length > 0) {
        html += `<h3 class="font-bold text-gray-400 mb-4 mt-8">الفواتير المدفوعة مسبقاً</h3>`;
        html += paid.map(b => `
            <div class="glass-card rounded-2xl p-5 border-r-4 border-emerald mb-4 opacity-75 cursor-pointer hover:bg-white/[0.03]" onclick="showBillDetailsModal(${b.id})">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4 flex-1">
                        <div class="w-14 h-14 rounded-2xl bg-${b.color}/20 flex items-center justify-center shrink-0 relative">
                            <i class="fas ${b.icon} text-${b.color} text-2xl"></i>
                            <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald flex items-center justify-center">
                                <i class="fas fa-check text-white text-[10px]"></i>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-bold text-base mb-1 text-gray-300 line-through">${escapeHtml(b.title)}</p>
                            <p class="text-xs text-gray-500">تم الدفع في ${escapeHtml(b.paidDate || new Date().toISOString().split('T')[0])}</p>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-2 text-left">
                        <p class="font-bold text-xl text-emerald">${b.amount.toLocaleString()} <span class="text-sm">${escapeHtml(cur)}</span></p>
                        <div class="flex items-center gap-1.5 mt-1">
                           <button onclick="event.stopPropagation(); printBill(${b.id})" class="w-8 h-8 flex items-center justify-center rounded-lg glass text-gray-400 hover:text-white hover:bg-white/5 transition" title="طباعة الإيصال">
                               <i class="fas fa-print text-xs"></i>
                           </button>
                           <button onclick="event.stopPropagation(); shareBill(${b.id})" class="w-8 h-8 flex items-center justify-center rounded-lg glass text-gray-400 hover:text-white hover:bg-white/5 transition" title="مشاركة">
                               <i class="fas fa-share-alt text-xs"></i>
                           </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");
    }

    container.innerHTML = html;
};

window.showBillDetailsModal = function showBillDetailsModal(id) {
    const bill = AppData.bills.find(b => b.id === id);
    if (!bill) return;
    const cur = getCurrency();

    document.getElementById("bill-modal-icon").className = "fas " + bill.icon + " text-" + bill.color + "-400 text-3xl";
    document.getElementById("bill-modal-bg").className = "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-" + bill.color + "-500/20";
    document.getElementById("bill-modal-title").textContent = bill.title;
    document.getElementById("bill-modal-amount").textContent = bill.amount.toLocaleString() + ' ' + cur;
    document.getElementById("bill-modal-date").textContent = bill.dueDate;
    document.getElementById("bill-modal-status").textContent = bill.paid ? 'مدفوعة' : 'غير مدفوعة';
    document.getElementById("bill-modal-status").className = "text-sm font-bold " + (bill.paid ? "text-emerald-400" : "text-rose-400");

    showModal("bill-details-modal");
};

window.payBill = function payBill(id) {
    const bill = AppData.bills.find(b => b.id === id);
    if (!bill) return;
    const cur = getCurrency();

    if (bill.amount > getAvailableBalance()) {
        showToast('رصيد غير كافٍ', 'الرصيد المتاح أقل من قيمة الفاتورة', 'error');
        return;
    }

    showConfirm("دفع الفاتورة", `هل تريد دفع ${bill.title} بقيمة ${bill.amount} ${cur}؟`, () => {
        bill.paid = true;
        bill.paidDate = new Date().toISOString().split('T')[0];
        addTransaction({
            title: bill.title,
            amount: -bill.amount,
            type: "expense",
            category: "فواتير",
            icon: "fa-file-invoice",
            color: "amber",
            notify: true
        });
        showSuccess("تم الدفع", `تم دفع ${bill.title} بنجاح`);
        renderBills();
        updateBalance();
        if (typeof updateDashboardStats === 'function') updateDashboardStats();
    });
};

// =====================================================
// PRINT BILL — opens browser print dialog
// User can choose "Save as PDF" from the dialog
// =====================================================
window.printBill = function printBill(id) {
    const bill = AppData.bills.find(b => b.id === id);
    if (!bill) return;
    const cur = getCurrency();

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const statusText = bill.paid ? 'مدفوعة' : 'غير مدفوعة';
    const statusColor = bill.paid ? '#10b981' : '#f43f5e';

    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="utf-8">
        <title>إيصال فاتورة - ${escapeHtml(bill.title)}</title>
        <style>
            @page { size: A4; margin: 1.5cm; }
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; color: #333; }
            .invoice-box { max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.15); border-radius: 8px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #8b5cf6; }
            .title { font-size: 20px; color: #555; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 5px; }
            .label { font-weight: bold; color: #666; }
            .value { color: #000; }
            .amount { font-size: 24px; font-weight: bold; color: ${statusColor}; text-align: left; direction: ltr; margin-top: 10px; }
            .status { font-weight: bold; padding: 4px 10px; border-radius: 4px; background: ${statusColor}20; color: ${statusColor}; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="header">
                <div class="logo">إثراء (FinVault)</div>
                <div class="title">إيصال فاتورة</div>
            </div>
            <div class="row"><span class="label">رقم المرجع:</span><span class="value">INV-${10000 + bill.id}</span></div>
            <div class="row"><span class="label">تاريخ الإصدار:</span><span class="value">${new Date().toLocaleDateString('ar-EG')}</span></div>
            <div class="row"><span class="label">وصف الفاتورة:</span><span class="value">${escapeHtml(bill.title)}</span></div>
            <div class="row"><span class="label">تاريخ الاستحقاق:</span><span class="value">${escapeHtml(bill.dueDate)}</span></div>
            <div class="row"><span class="label">حالة الفاتورة:</span><span class="status">${statusText}</span></div>
            <div style="margin-top: 30px; text-align: left;">
                <span class="label">الإجمالي المفوتر</span>
                <div class="amount">${bill.amount.toLocaleString()} ${escapeHtml(cur)}</div>
            </div>
            <div class="footer">
                💡 ملاحظة: لحفظ كملف PDF، اختر "حفظ كـ PDF" من نافذة الطباعة.<br>
                تم إنشاء هذه الفاتورة إلكترونياً ولا تتطلب توقيعاً.<br>
                شكراً لاستخدامك تطبيق إثراء المالي.
            </div>
        </div>
    </body>
    </html>`;

    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();

    setTimeout(() => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) { console.error(e); }
        setTimeout(() => { try { document.body.removeChild(iframe); } catch (e) {} }, 1000);
    }, 500);
};

window.printAllBills = function printAllBills() {
    const bills = AppData.bills;
    if (bills.length === 0) {
        showToast('تنبيه', 'لا توجد فواتير لطباعتها', 'warning');
        return;
    }
    const cur = getCurrency();

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const rows = bills.map(b => `
        <tr>
            <td>${escapeHtml(b.title)}</td>
            <td style="direction: ltr; text-align: left;">${b.amount.toLocaleString()} ${escapeHtml(cur)}</td>
            <td>${escapeHtml(b.dueDate)}</td>
            <td style="color: ${b.paid ? '#10b981' : '#f43f5e'}; font-weight: bold;">
                ${b.paid ? 'مدفوعة' : 'غير مدفوعة'}
            </td>
            <td>${b.paidDate ? escapeHtml(b.paidDate) : '-'}</td>
        </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="utf-8">
        <title>تقرير الفواتير الشامل - إثراء</title>
        <style>
            @page { size: A4; margin: 1cm; }
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #8b5cf6; margin-bottom: 5px; }
            .report-title { font-size: 20px; color: #666; font-weight: normal; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; color: #475569; font-weight: bold; text-align: right; padding: 12px; border: 1px solid #e2e8f0; }
            td { padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-size: 14px; }
            tr:nth-child(even) { background-color: #fdfdfd; }
            .summary { margin-top: 30px; display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
            .summary-item { font-size: 16px; }
            .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">إثراء (FinVault)</div>
            <div class="report-title">تقرير الفواتير الشامل</div>
            <p style="color: #888;">تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')} | ${new Date().toLocaleTimeString('ar-EG')}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>وصف الفاتورة</th>
                    <th>المبلغ</th>
                    <th>تاريخ الاستحقاق</th>
                    <th>الحالة</th>
                    <th>تاريخ الدفع</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
        <div class="summary">
            <div class="summary-item">
                <strong>عدد الفواتير الكلي:</strong> ${bills.length}
            </div>
            <div class="summary-item">
                <strong>إجمالي المبالغ:</strong> <span style="font-size: 20px; font-weight: bold; color: #8b5cf6;">${bills.reduce((a, b) => a + b.amount, 0).toLocaleString()} ${cur}</span>
            </div>
        </div>
        <div class="footer">
            تم إنشاء هذا التقرير آلياً بواسطة تطبيق إثراء المالي. جميع الحقوق محفوظة © ${new Date().getFullYear()}
        </div>
    </body>
    </html>`;

    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();

    setTimeout(() => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) { console.error(e); }
        setTimeout(() => { try { document.body.removeChild(iframe); } catch (e) {} }, 1000);
    }, 500);
};

window.shareBill = function shareBill(id) {
    const bill = AppData.bills.find(b => b.id === id);
    if (!bill) return;
    const cur = getCurrency();
    const statusText = bill.paid ? 'مدفوعة ✅' : 'غير مدفوعة ❌';
    const textToShare = `فاتورة من إثراء\nالوصف: ${bill.title}\nالمبلغ: ${bill.amount.toLocaleString()} ${cur}\nتاريخ الاستحقاق: ${bill.dueDate}\nالحالة: ${statusText}`;

    if (navigator.share) {
        navigator.share({ title: 'مشاركة فاتورة', text: textToShare }).catch(() => {
            copyToClipboard(textToShare);
            showToast('تم النسخ', 'تم نسخ تفاصيل الفاتورة', 'success');
        });
    } else {
        copyToClipboard(textToShare);
        showToast('تم النسخ', 'تم نسخ تفاصيل الفاتورة', 'success');
    }
};
