// ===== Yemen Safe - Auth Logic =====

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');

    // Password visibility toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function () {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            // Validate inputs
            if (!username || !password) {
                showLoginError('يرجى إدخال اسم المستخدم وكلمة المرور');
                return;
            }

            // Find user - role is auto-detected from credentials
            const user = MockData.users.find(u => u.username === username && u.password === password);

            if (!user) {
                showLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
                return;
            }

            // Get role info for welcome message
            const roleInfo = MockData.roles[user.role];
            const roleLabel = roleInfo ? roleInfo.label : user.role;

            // Success - store user and redirect
            setCurrentUser(user);

            // Add success animation
            const loginCard = document.querySelector('.login-card');
            loginCard.style.transform = 'scale(0.95)';
            loginCard.style.opacity = '0.8';

            // Show brief success message
            showLoginSuccess(`مرحباً ${user.name.split(' ')[0]}! جاري التحويل... (${roleLabel})`);

            setTimeout(() => {
                // Redirect to the first page the user's role can access
                window.location.href = getRedirectPage(user);
            }, 800);
        });
    }

    function showLoginError(message) {
        if (loginError) {
            loginError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            loginError.classList.add('show');
            loginError.style.background = 'var(--danger-100)';
            loginError.style.color = 'var(--danger-600)';

            setTimeout(() => {
                loginError.classList.remove('show');
            }, 5000);
        }
    }

    function showLoginSuccess(message) {
        if (loginError) {
            loginError.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            loginError.style.background = 'var(--success-100)';
            loginError.style.color = 'var(--success-600)';
            loginError.classList.add('show');
        }
    }

    // Check if already logged in
    const currentUser = getCurrentUser();
    if (currentUser && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '')) {
        window.location.href = getRedirectPage(currentUser);
    }
});
