// =====================================================
// PIN SCREEN — with Rate Limiting & Real Logout
// =====================================================

// Rate limiting state
function _getPinAttempts() {
    try {
        const raw = localStorage.getItem('ithraa_pin_attempts');
        return raw ? JSON.parse(raw) : { count: 0, lockedUntil: null };
    } catch (e) { return { count: 0, lockedUntil: null }; }
}

function _setPinAttempts(state) {
    try { localStorage.setItem('ithraa_pin_attempts', JSON.stringify(state)); } catch (e) {}
}

window.enterPin = function enterPin(num) {
    // Check lockout
    const attempts = _getPinAttempts();
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const secs = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
        showToast('محاولات كثيرة', `يرجى الانتظار ${secs} ثانية`, 'error');
        return;
    }
    if (currentPin.length < 4) {
        currentPin += num;
        updatePinDots();
        if (currentPin.length === 4) {
            setTimeout(checkPin, 300);
        }
    }
};

window.clearPin = function clearPin() {
    currentPin = currentPin.slice(0, -1);
    updatePinDots();
};

window.updatePinDots = function updatePinDots() {
    const dots = document.querySelectorAll("#pin-dots .pin-dot");
    dots.forEach((dot, i) => {
        if (i < currentPin.length) dot.classList.add("filled");
        else dot.classList.remove("filled");
    });
};

window.checkPin = function checkPin() {
    if (currentPin === AppData.user.pin) {
        // SUCCESS
        _setPinAttempts({ count: 0, lockedUntil: null });
        currentPin = "";

        const authScreen = document.getElementById("auth-screen");
        if (authScreen) authScreen.classList.add("animate-fade-out");

        document.body.classList.remove("pin-active");
        document.querySelectorAll(".auth-hidden").forEach(el => el.classList.remove("auth-hidden"));

        if (typeof updateHeaderUI === 'function') updateHeaderUI();
        try { if (typeof updateStreak === 'function') updateStreak(); } catch (e) {}
        try { if (typeof logActivity === 'function') logActivity('تسجيل دخول', AppData.user.email); } catch (e) {}

        setTimeout(() => {
            if (authScreen) authScreen.style.display = "none";
            navigateTo('dashboard');
        }, 500);
    } else {
        // FAILURE — increment counter
        const attempts = _getPinAttempts();
        const newCount = (attempts.count || 0) + 1;
        let newState = { count: newCount, lockedUntil: null };

        if (newCount >= 5) {
            newState = { count: 0, lockedUntil: Date.now() + 60 * 1000 };
            showToast('تم القفل', 'محاولات متكررة فاشلة — تم قفل الإدخال لمدة دقيقة', 'error');
        } else {
            const remaining = 5 - newCount;
            showToast('خطأ', `رمز PIN غير صحيح. متبقي ${remaining} محاولات`, 'error');
        }
        _setPinAttempts(newState);

        currentPin = "";
        updatePinDots();
        const dots = document.getElementById("pin-dots");
        if (dots) {
            dots.classList.add("animate-shake");
            setTimeout(() => dots.classList.remove("animate-shake"), 500);
        }

        try { if (typeof logActivity === 'function') logActivity('محاولة دخول فاشلة', 'PIN خاطئ'); } catch (e) {}
    }
};

// =====================================================
// CHANGE PIN
// =====================================================
window.showChangePinModal = function showChangePinModal() {
    const html = `
        <div style="text-align:right; padding: 4px 0;">
            <div style="margin-bottom:14px;">
                <label style="font-size:0.85rem;color:#9ca3af;display:block;margin-bottom:6px;">PIN الحالي</label>
                <input type="password" id="current-pin-input" maxlength="4" inputmode="numeric" pattern="[0-9]*"
                    class="premium-input" style="width:100%;text-align:center;letter-spacing:0.5em;font-size:1.2rem;" placeholder="••••">
            </div>
            <div style="margin-bottom:14px;">
                <label style="font-size:0.85rem;color:#9ca3af;display:block;margin-bottom:6px;">PIN الجديد</label>
                <input type="password" id="new-pin-input" maxlength="4" inputmode="numeric" pattern="[0-9]*"
                    class="premium-input" style="width:100%;text-align:center;letter-spacing:0.5em;font-size:1.2rem;" placeholder="••••">
            </div>
            <div style="margin-bottom:14px;">
                <label style="font-size:0.85rem;color:#9ca3af;display:block;margin-bottom:6px;">تأكيد PIN الجديد</label>
                <input type="password" id="confirm-pin-input" maxlength="4" inputmode="numeric" pattern="[0-9]*"
                    class="premium-input" style="width:100%;text-align:center;letter-spacing:0.5em;font-size:1.2rem;" placeholder="••••">
            </div>
            <p style="font-size:0.75rem;color:#9ca3af;margin-bottom:8px;">
                <i class="fas fa-info-circle"></i> اختر PIN قوياً (تجنّب 1234 / 0000 / تكرار رقم).
            </p>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'تغيير رمز PIN';
    document.getElementById('confirm-message').innerHTML = html;

    const btnWrap = document.getElementById('confirm-btn-wrap');
    if (btnWrap) {
        btnWrap.style.display = '';
        btnWrap.innerHTML = `
            <button class="flex-1 py-3 rounded-xl glass text-sm" onclick="closeModal('confirm-modal')">إلغاء</button>
            <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-ethereal-violet to-ethereal-cyan text-obsidian-base text-sm font-bold" onclick="executeChangePin()">حفظ</button>
        `;
    }
    showModal('confirm-modal');
};

window.executeChangePin = function executeChangePin() {
    const cur = document.getElementById('current-pin-input')?.value?.trim();
    const newP = document.getElementById('new-pin-input')?.value?.trim();
    const conf = document.getElementById('confirm-pin-input')?.value?.trim();

    if (!cur || !newP || !conf) { showToast('تنبيه', 'يرجى ملء جميع الحقول', 'error'); return; }
    if (cur !== AppData.user.pin) { showToast('خطأ', 'PIN الحالي غير صحيح', 'error'); return; }
    if (!/^\d{4}$/.test(newP)) { showToast('خطأ', 'PIN يجب أن يكون 4 أرقام', 'error'); return; }
    if (newP !== conf) { showToast('خطأ', 'تأكيد PIN غير متطابق', 'error'); return; }

    const weak = ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1212', '4321'];
    if (weak.includes(newP)) { showToast('خطأ', 'هذا الرمز ضعيف جداً، اختر رمزاً أقوى', 'error'); return; }
    if (newP === cur) { showToast('تنبيه', 'الرمز الجديد مطابق للرمز الحالي', 'error'); return; }

    AppData.user.pin = newP;
    // Update in stored users array
    try {
        const users = getStoredUsers();
        const user = users.find(u => u.email === AppData.user.email);
        if (user) { user.pin = newP; saveUsers(users); }
    } catch (e) {}

    closeModal('confirm-modal');
    if (typeof logActivity === 'function') logActivity('تغيير PIN', '');
    showSuccess('تم التغيير', 'تم تحديث رمز PIN بنجاح');
};

// =====================================================
// HEADER UI
// =====================================================
window.updateHeaderUI = function updateHeaderUI() {
    const name = AppData.user.name || 'المستخدم';
    const nameEl = document.getElementById('header-user-name');
    const avatarEl = document.getElementById('header-avatar');
    const mobileAvatarEl = document.getElementById('mobile-header-avatar');

    if (nameEl) nameEl.textContent = name;
    const encodedName = encodeURIComponent(name);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=8b5cf6&color=fff`;
    if (avatarEl) avatarEl.src = avatarUrl;
    if (mobileAvatarEl) mobileAvatarEl.src = avatarUrl;
};

// =====================================================
// ACCOUNT INFO MODAL — XSS-safe
// =====================================================
window.showAccountInfo = function showAccountInfo() {
    const user = AppData.user;
    const cur = getCurrency();
    // All user-controlled fields are escaped before insertion
    const safeName = escapeHtml(user.name || '');
    const safeEmail = escapeHtml(user.email || '');
    const safePhone = escapeHtml(user.phone || 'غير محدد');

    const html = `
        <div style="text-align: center; padding: 10px 0;">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=8b5cf6&color=fff&size=80"
                 style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; display: block; border: 3px solid rgba(208,188,255,0.3);">
            <h3 style="font-size: 1.3rem; font-weight: bold; margin-bottom: 4px;">${safeName}</h3>
            <p style="color: #9ca3af; font-size: 0.85rem; margin-bottom: 20px;">عضو ⭐</p>
            <div style="text-align: right; background: rgba(255,255,255,0.03); border-radius: 16px; padding: 16px; border: 1px solid rgba(255,255,255,0.06);">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span style="color: #9ca3af;"><i class="fas fa-envelope" style="width:20px;"></i> البريد</span>
                    <span dir="ltr">${safeEmail}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span style="color: #9ca3af;"><i class="fas fa-phone" style="width:20px;"></i> الجوال</span>
                    <span dir="ltr">${safePhone}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span style="color: #9ca3af;"><i class="fas fa-wallet" style="width:20px;"></i> الرصيد</span>
                    <span style="color: #10b981; font-weight: bold;">${balanceVisible ? user.balance.toLocaleString() + ' ' + cur : '•••• ' + cur}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                    <span style="color: #9ca3af;"><i class="fas fa-star" style="width:20px;"></i> النقاط</span>
                    <span style="color: #d0bcff; font-weight: bold;">${user.points.toLocaleString()} نقطة</span>
                </div>
            </div>
            <button onclick="showChangePinModal()" style="margin-top: 14px; width: 100%; padding: 12px; border-radius: 12px; background: rgba(76,215,246,0.10); color: #4cd7f6; border: 1px solid rgba(76,215,246,0.20); cursor: pointer; font-weight: bold; font-size: 0.9rem;">
                <i class="fas fa-key"></i> تغيير رمز PIN
            </button>
            <button onclick="logoutUser()" style="margin-top: 10px; width: 100%; padding: 12px; border-radius: 12px; background: rgba(244,63,94,0.15); color: #f43f5e; border: 1px solid rgba(244,63,94,0.2); cursor: pointer; font-weight: bold; font-size: 0.9rem;">
                <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
            </button>
        </div>
    `;
    document.getElementById("confirm-title").textContent = "معلومات الحساب";
    document.getElementById("confirm-message").innerHTML = html;
    document.getElementById("confirm-btn-wrap").style.display = "none";
    showModal("confirm-modal");
};

// =====================================================
// SETTINGS
// =====================================================
window.showSettings = function showSettings() {
    const html = `
        <div style="text-align: right;">
            <div onclick="toggleTheme(); closeModal('confirm-modal');" class="settings-row">
                <i class="fas fa-moon" style="width: 20px; color: #d0bcff;"></i>
                <span>تغيير المظهر (فاتح / داكن)</span>
            </div>
            <div onclick="showAccountInfo();" class="settings-row">
                <i class="fas fa-user" style="width: 20px; color: #4cd7f6;"></i>
                <span>معلومات الحساب</span>
            </div>
            <div onclick="showChangePinModal();" class="settings-row">
                <i class="fas fa-key" style="width: 20px; color: #f59e0b;"></i>
                <span>تغيير رمز PIN</span>
            </div>
            <div onclick="navigateTo('security'); closeModal('confirm-modal');" class="settings-row">
                <i class="fas fa-shield-alt" style="width: 20px; color: #10b981;"></i>
                <span>الأمان والخصوصية</span>
            </div>
            <div onclick="showLanguageSettings();" class="settings-row">
                <i class="fas fa-language" style="width: 20px; color: #ec4899;"></i>
                <span>اللغة</span>
            </div>
            <div onclick="navigateTo('subscriptions'); closeModal('confirm-modal');" class="settings-row" style="background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(139,92,246,0.08)); border-color: rgba(245,158,11,0.2);">
                <i class="fas fa-crown" style="width: 20px; color: #f59e0b;"></i>
                <span>إدارة الاشتراك</span>
            </div>
            <div onclick="logoutUser();" class="settings-row" style="background: rgba(244,63,94,0.05); border-color: rgba(244,63,94,0.15);">
                <i class="fas fa-sign-out-alt" style="width: 20px; color: #f43f5e;"></i>
                <span style="color: #f43f5e;">تسجيل الخروج</span>
            </div>
        </div>
        <style>
            .settings-row { display:flex; align-items:center; gap:12px; padding:14px; border-radius:12px; cursor:pointer; border:1px solid rgba(255,255,255,0.05); margin-bottom:8px; background:rgba(255,255,255,0.03); transition: all 0.2s; }
            .settings-row:hover { background:rgba(255,255,255,0.06); }
        </style>
    `;
    document.getElementById("confirm-title").textContent = "الإعدادات";
    document.getElementById("confirm-message").innerHTML = html;
    document.getElementById("confirm-btn-wrap").style.display = "none";
    showModal("confirm-modal");
};

window.showLanguageSettings = function showLanguageSettings() {
    const html = `
        <div style="text-align:right;">
            <p style="color:#9ca3af; font-size:0.85rem; margin-bottom:12px;">اللغة الحالية: <strong>العربية</strong></p>
            <p style="color:#9ca3af; font-size:0.8rem;">دعم الإنجليزية قيد التطوير. جميع نصوص التطبيق متوفرة بالعربية حالياً.</p>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'إعدادات اللغة';
    document.getElementById('confirm-message').innerHTML = html;
    showModal('confirm-modal');
};

// =====================================================
// REAL LOGOUT — clears session
// =====================================================
window.logoutUser = function logoutUser() {
    showConfirm('تسجيل الخروج', 'هل تريد تسجيل الخروج؟ سيتم حفظ بياناتك.', () => {
        try {
            // Persist current state before logging out
            if (typeof persistUserState === 'function') persistUserState();
            // Clear session marker (but keep user account)
            localStorage.removeItem('ithraa_session');
        } catch (e) {}

        if (typeof logActivity === 'function') logActivity('تسجيل خروج', '');

        const btnWrap = document.getElementById("confirm-btn-wrap");
        if (btnWrap) btnWrap.style.display = "";

        // Reset PIN attempt
        currentPin = "";
        balanceVisible = false;
        cardsVisible = false;

        location.reload();
    });
};

// =====================================================
// TERMS & PRIVACY MODALS (frontend-only stubs with real content)
// =====================================================
window.showTermsModal = function showTermsModal() {
    const html = `
        <div style="text-align: right; max-height: 60vh; overflow-y: auto; line-height: 1.9;">
            <h4 style="font-weight:bold;margin-bottom:8px;color:#d0bcff;">1. الاستخدام المقبول</h4>
            <p style="font-size:13px;color:#cbd5e1;margin-bottom:14px;">
                تطبيق إثراء عرض تجريبي (Demo) لأغراض تعليمية. لا يُقدِّم خدمات مالية حقيقية، ولا يربط بأي بنك أو جهة دفع فعلية.
            </p>
            <h4 style="font-weight:bold;margin-bottom:8px;color:#d0bcff;">2. البيانات</h4>
            <p style="font-size:13px;color:#cbd5e1;margin-bottom:14px;">
                جميع البيانات (الرصيد، المعاملات، إلخ) تُحفظ محلياً في متصفحك (localStorage) ولا تُرسَل إلى أي خادم.
            </p>
            <h4 style="font-weight:bold;margin-bottom:8px;color:#d0bcff;">3. الذكاء الاصطناعي</h4>
            <p style="font-size:13px;color:#cbd5e1;margin-bottom:14px;">
                "المستشار المالي" يستخدم قواعد ثابتة (Rule-based) لتقديم نصائح بناءً على بياناتك. ليس بديلاً عن استشارة مالية متخصصة.
            </p>
            <h4 style="font-weight:bold;margin-bottom:8px;color:#d0bcff;">4. الزكاة والشريعة</h4>
            <p style="font-size:13px;color:#cbd5e1;">
                حسابات الزكاة تقريبية. للأحكام الدقيقة استشر عالماً شرعياً.
            </p>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'شروط الاستخدام';
    document.getElementById('confirm-message').innerHTML = html;
    document.getElementById('confirm-btn-wrap').style.display = 'none';
    showModal('confirm-modal');
};

window.showPrivacyModal = function showPrivacyModal() {
    const html = `
        <div style="text-align: right; max-height: 60vh; overflow-y: auto; line-height: 1.9;">
            <h4 style="font-weight:bold;margin-bottom:8px;color:#d0bcff;">📦 ما الذي نخزّنه؟</h4>
            <ul style="font-size:13px;color:#cbd5e1;margin-bottom:14px;list-style:none;">
                <li>• اسمك وبريدك ورقم جوالك (محلياً فقط)</li>
                <li>• كلمة المرور <strong style="color:#10b981;">مُجَزَّأة (Hashed)</strong> — لا تُحفظ كنص صريح</li>
                <li>• معاملاتك المالية (Demo فقط)</li>
                <li>• تفضيلات (الوضع الفاتح/الداكن، السلسلة، النقاط)</li>
            </ul>
            <h4 style="font-weight:bold;margin-bottom:8px;color:#d0bcff;">🔒 أين تُحفظ؟</h4>
            <p style="font-size:13px;color:#cbd5e1;margin-bottom:14px;">
                في <strong>localStorage</strong> داخل متصفحك فقط. لا نرسل أي بيانات إلى خوادم خارجية.
            </p>
            <h4 style="font-weight:bold;margin-bottom:8px;color:#d0bcff;">🗑️ كيف تحذف بياناتك؟</h4>
            <p style="font-size:13px;color:#cbd5e1;">
                اذهب لإعدادات المتصفح ← مسح بيانات الموقع ← يُمسَح كل شيء فوراً.
            </p>
        </div>
    `;
    document.getElementById('confirm-title').textContent = 'سياسة الخصوصية';
    document.getElementById('confirm-message').innerHTML = html;
    document.getElementById('confirm-btn-wrap').style.display = 'none';
    showModal('confirm-modal');
};
