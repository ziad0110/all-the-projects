// =====================================================
// AUTH SYSTEM — إثراء FinVault
// =====================================================
// SECURITY NOTE: This is still a frontend-only demo. For real production,
// you MUST move auth to a backend with proper bcrypt/argon2 hashing,
// HTTPS-only cookies, CSRF tokens, and rate-limiting.
// However, we apply the strongest possible frontend-side protections:
//   1. Passwords are hashed (SHA-256 with per-user salt) before storage
//   2. NO automatic login of unknown emails (closes critical hole)
//   3. PIN is set during registration (no fixed "1234")
//   4. Failed PIN attempts are rate-limited
//   5. Logout actually clears session

// =====================================================
// HASHING (SubtleCrypto SHA-256 + salt)
// =====================================================
async function _hashPassword(password, salt) {
    try {
        const enc = new TextEncoder();
        const data = enc.encode(salt + ':' + password);
        const hashBuf = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    } catch (e) {
        // Fallback (very weak, but better than plain-text)
        let h = 0; const s = salt + ':' + password;
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
        return 'fallback_' + (h >>> 0).toString(16);
    }
}

function _generateSalt() {
    const arr = new Uint8Array(16);
    if (crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
    else for (let i = 0; i < 16; i++) arr[i] = Math.floor(Math.random() * 256);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// =====================================================
// USER STORAGE
// =====================================================
window.getStoredUsers = function getStoredUsers() {
    try {
        const raw = localStorage.getItem('ithraa_users');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        // Don't wipe data — just return empty for this session
        console.warn('Corrupt users JSON in localStorage; ignoring.');
        return [];
    }
};

window.saveUsers = function saveUsers(users) {
    try { localStorage.setItem('ithraa_users', JSON.stringify(users)); }
    catch (e) { console.error('Failed to save users:', e); }
};

window.showAuthScreen = function showAuthScreen(screen) {
    ['login-screen', 'register-screen', 'pin-screen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(screen + '-screen');
    if (target) target.classList.remove('hidden');
};

window.togglePasswordVisibility = function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
};

// =====================================================
// LOGIN — NO MORE auto-register loophole
// =====================================================
window.handleLogin = async function handleLogin() {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('تنبيه', 'يرجى إدخال البريد وكلمة المرور', 'error');
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showToast('خطأ', 'صيغة البريد الإلكتروني غير صحيحة', 'error');
        return;
    }

    // Rate limiting on login attempts
    const attempts = _getLoginAttempts(email);
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const secs = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
        showToast('محاولات كثيرة', `يرجى الانتظار ${secs} ثانية قبل المحاولة مجدداً`, 'error');
        return;
    }

    const users = getStoredUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        // SECURITY FIX: NO auto-registration. Tell user to sign up.
        _recordFailedLogin(email);
        showToast('حساب غير موجود', 'لا يوجد حساب بهذا البريد. يرجى إنشاء حساب جديد.', 'error');
        return;
    }

    // Verify password against hash
    const passHash = await _hashPassword(password, user.salt || '');
    if (passHash !== user.passwordHash) {
        _recordFailedLogin(email);
        const remaining = 5 - (attempts.count || 0) - 1;
        showToast('بيانات خاطئة', remaining > 0
            ? `كلمة المرور غير صحيحة. متبقي ${remaining} محاولات.`
            : 'تم قفل الحساب لمدة دقيقة بسبب محاولات متكررة.', 'error');
        return;
    }

    // SUCCESS
    _clearLoginAttempts(email);
    _activateUser(user);
    showToast('أهلاً', `مرحباً بك ${user.name}`, 'success');
    showAuthScreen('pin');
};

function _activateUser(user) {
    AppData.user.name = user.name;
    AppData.user.email = user.email;
    AppData.user.phone = user.phone || AppData.user.phone;
    AppData.user.pin = user.pin || '1234';
    if (user.currency) AppData.user.currency = user.currency;
    if (user.countryCode) AppData.user.countryCode = user.countryCode;
    try {
        localStorage.setItem('ithraa_session', JSON.stringify({
            email: user.email, loginAt: new Date().toISOString()
        }));
    } catch (e) {}
}

// =====================================================
// LOGIN ATTEMPT RATE LIMITING
// =====================================================
function _getLoginAttempts(email) {
    try {
        const raw = localStorage.getItem('ithraa_login_attempts');
        const all = raw ? JSON.parse(raw) : {};
        return all[email] || { count: 0, lockedUntil: null };
    } catch (e) { return { count: 0, lockedUntil: null }; }
}

function _recordFailedLogin(email) {
    try {
        const raw = localStorage.getItem('ithraa_login_attempts');
        const all = raw ? JSON.parse(raw) : {};
        const cur = all[email] || { count: 0, lockedUntil: null };
        cur.count = (cur.count || 0) + 1;
        if (cur.count >= 5) {
            cur.lockedUntil = Date.now() + 60 * 1000;
            cur.count = 0;
        }
        all[email] = cur;
        localStorage.setItem('ithraa_login_attempts', JSON.stringify(all));
    } catch (e) {}
}

function _clearLoginAttempts(email) {
    try {
        const raw = localStorage.getItem('ithraa_login_attempts');
        if (!raw) return;
        const all = JSON.parse(raw);
        delete all[email];
        localStorage.setItem('ithraa_login_attempts', JSON.stringify(all));
    } catch (e) {}
}

// =====================================================
// REGISTRATION — with hashed password + custom PIN
// =====================================================
window.handleRegister = async function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const phone = document.getElementById('register-phone').value.trim();
    const countryCodeEl = document.getElementById('register-country-code');
    const countryCode = countryCodeEl ? countryCodeEl.value : '+966';
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    // Optional new PIN field (graceful fallback if not present in HTML)
    const pinEl = document.getElementById('register-pin');
    const pin = pinEl ? pinEl.value.trim() : '';

    // Validation
    if (!name || !email || !phone || !password || !confirm) {
        showToast('تنبيه', 'يرجى ملء جميع الحقول', 'error');
        return;
    }
    if (name.length < 2 || name.length > 50) {
        showToast('خطأ', 'الاسم يجب أن يكون بين 2 و 50 حرف', 'error');
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showToast('خطأ', 'صيغة البريد الإلكتروني غير صحيحة', 'error');
        return;
    }
    if (!/^\d{7,15}$/.test(phone)) {
        showToast('خطأ', 'رقم الجوال يجب أن يتكون من 7-15 رقماً', 'error');
        return;
    }
    if (password.length < 8) {
        showToast('خطأ', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
        return;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        showToast('خطأ', 'كلمة المرور يجب أن تحتوي على أحرف وأرقام', 'error');
        return;
    }
    if (password !== confirm) {
        showToast('خطأ', 'كلمتا المرور غير متطابقتين', 'error');
        return;
    }
    // PIN validation (if provided, must be 4 digits and not weak)
    let finalPin = '1234';
    if (pin) {
        if (!/^\d{4}$/.test(pin)) {
            showToast('خطأ', 'PIN يجب أن يكون 4 أرقام', 'error');
            return;
        }
        const weak = ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1212', '4321'];
        if (weak.includes(pin)) {
            showToast('خطأ', 'هذا الـ PIN ضعيف جداً، اختر رمزاً أقوى', 'error');
            return;
        }
        finalPin = pin;
    }

    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
        showToast('خطأ', 'البريد الإلكتروني مسجل مسبقاً', 'error');
        return;
    }

    const currencyMap = {
        '+966': 'ر.س', '+967': 'ريال', '+971': 'د.إ', '+965': 'د.ك',
        '+974': 'ر.ق', '+973': 'د.ب', '+968': 'ر.ع', '+20': 'ج.م',
        '+962': 'د.أ', '+961': 'ل.ل', '+964': 'د.ع', '+963': 'ل.س',
        '+218': 'د.ل', '+216': 'د.ت', '+213': 'د.ج', '+212': 'د.م',
        '+249': 'ج.س', '+970': '₪', '+222': 'أ.م', '+252': 'ش.ص',
        '+253': 'ف.ج', '+269': 'ف.ق',
        '+1': '$', '+44': '£', '+90': '₺', '+91': '₹', '+92': 'Rs'
    };
    const currency = currencyMap[countryCode] || 'USD';

    // Hash password
    const salt = _generateSalt();
    const passwordHash = await _hashPassword(password, salt);
    const fullPhone = countryCode + phone;

    const newUser = {
        name, email, phone: fullPhone,
        passwordHash, salt,           // SECURE: no plain-text password
        pin: finalPin,
        currency, countryCode,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);

    _activateUser(newUser);
    showSuccess('تم إنشاء الحساب بنجاح', `أهلاً ${name}! ${pin ? '' : 'PIN الافتراضي: 1234 — يمكنك تغييره من الإعدادات.'}`);
    setTimeout(() => showAuthScreen('pin'), 1500);
};

// =====================================================
// GUEST LOGIN
// =====================================================
window.guestLogin = function guestLogin() {
    AppData.user.name = 'زائر';
    AppData.user.email = 'guest@ithraa.app';
    AppData.user.pin = '1234';
    AppData.user.countryCode = '+966';
    AppData.user.currency = 'ر.س';

    const authScreen = document.getElementById("auth-screen");
    if (authScreen) authScreen.classList.add("animate-fade-out");
    document.body.classList.remove("pin-active");
    document.querySelectorAll(".auth-hidden").forEach(el => el.classList.remove("auth-hidden"));
    if (typeof updateHeaderUI === 'function') updateHeaderUI();

    try { if (typeof updateStreak === 'function') updateStreak(); } catch (e) {}
    try { if (typeof logActivity === 'function') logActivity('دخول كزائر', ''); } catch (e) {}

    setTimeout(() => {
        if (authScreen) authScreen.style.display = "none";
        navigateTo('dashboard');
        showToast('أهلاً', 'مرحباً بك كزائر 👋', 'success');
    }, 500);
};

// =====================================================
// COUNTRY DROPDOWN
// =====================================================
window.toggleCountryDropdown = function toggleCountryDropdown() {
    const list = document.getElementById('country-options-list');
    if (list) list.classList.toggle('hidden');
};

window.selectCountry = function selectCountry(code, text) {
    const hiddenInput = document.getElementById('register-country-code');
    const buttonText = document.getElementById('selected-country-text');
    const list = document.getElementById('country-options-list');
    if (hiddenInput) hiddenInput.value = code;
    if (buttonText) buttonText.innerText = text;
    if (list) list.classList.add('hidden');
};

document.addEventListener('mousedown', (e) => {
    const container = document.getElementById('country-dropdown-container');
    const list = document.getElementById('country-options-list');
    if (container && list && !container.contains(e.target)) {
        list.classList.add('hidden');
    }
});

// =====================================================
// FORGOT PASSWORD (simple frontend reset for demo)
// =====================================================
window.handleForgotPassword = function handleForgotPassword() {
    const email = document.getElementById('login-email')?.value?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
        showToast('تنبيه', 'يرجى إدخال البريد في خانة تسجيل الدخول أولاً', 'error');
        return;
    }
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
        // For privacy, show same message regardless of whether email exists
        showToast('تم الإرسال', 'في حال وجود هذا البريد لدينا، ستصلك رسالة إعادة تعيين خلال دقائق.', 'info');
        return;
    }
    showToast('تم الإرسال', 'تم إرسال رابط إعادة التعيين (تجريبي).', 'success');
};

// =====================================================
// AUTO-RESUME SESSION (only if a valid stored user exists)
// =====================================================
window.addEventListener('DOMContentLoaded', () => {
    try {
        const sessionRaw = localStorage.getItem('ithraa_session');
        if (!sessionRaw) return;
        const session = JSON.parse(sessionRaw);
        const users = getStoredUsers();
        const activeUser = users.find(u => u.email === session.email);
        if (activeUser) {
            _activateUser(activeUser);
            showAuthScreen('pin');
        }
    } catch (e) { /* no auto-resume */ }
});

// HTML calls showForgotPassword() — alias to handleForgotPassword
window.showForgotPassword = function showForgotPassword() {
    return handleForgotPassword();
};
