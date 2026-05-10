/* ============================================
   سطر (Satr) - Admin Panel Logic
   Authentication, CRUD, Data Management
   ============================================ */

const Admin = {
    currentSection: 'dashboard',
    editingItem: null,
    editingCollection: null,

    init() {
        DataStore.init();
        I18n.init();
        this.checkAuth();
    },

    // ============ Authentication ============
    checkAuth() {
        const isLoggedIn = sessionStorage.getItem('satr_admin_auth');
        if (isLoggedIn) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    },

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    },

    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        this.navigateTo('dashboard');
    },

    async login() {
        const passwordInput = document.getElementById('adminPassword');
        const errorEl = document.getElementById('loginError');
        const password = passwordInput.value;

        if (!password) return;

        const hash = await this.hashPassword(password);
        const settings = DataStore.getData('settings');

        if (hash === settings.password_hash) {
            sessionStorage.setItem('satr_admin_auth', 'true');
            errorEl.classList.remove('show');
            this.showDashboard();
        } else {
            errorEl.classList.add('show');
            passwordInput.value = '';
            passwordInput.focus();
        }
    },

    logout() {
        sessionStorage.removeItem('satr_admin_auth');
        this.showLogin();
    },

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // ============ Navigation ============
    navigateTo(section) {
        this.currentSection = section;

        // Update sidebar
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === section);
        });

        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');

        // Show current section
        const currentEl = document.getElementById(`section-${section}`);
        if (currentEl) currentEl.style.display = 'block';

        // Render section content
        switch (section) {
            case 'dashboard': this.renderDashboard(); break;
            case 'portfolio': this.renderTable('portfolio'); break;
            case 'team': this.renderTable('team'); break;
            case 'testimonials': this.renderTable('testimonials'); break;
            case 'blog': this.renderTable('blog'); break;
            case 'settings': this.renderSettings(); break;
        }
    },

    // ============ Dashboard ============
    renderDashboard() {
        const stats = DataStore.getStats();
        const container = document.getElementById('dashboardStats');
        if (!container) return;

        container.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon blue">📁</div>
        <div class="stat-info">
          <h3>${stats.portfolio}</h3>
          <p>${I18n.t('admin_portfolio')}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">👥</div>
        <div class="stat-info">
          <h3>${stats.team}</h3>
          <p>${I18n.t('admin_team')}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">💬</div>
        <div class="stat-info">
          <h3>${stats.testimonials}</h3>
          <p>${I18n.t('admin_testimonials')}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">📝</div>
        <div class="stat-info">
          <h3>${stats.blog}</h3>
          <p>${I18n.t('admin_blog')}</p>
        </div>
      </div>
    `;
    },

    // ============ Generic Table Renderer ============
    renderTable(collection) {
        const container = document.getElementById(`${collection}Table`);
        if (!container) return;

        const data = DataStore.getData(collection);
        const lang = I18n.currentLang;

        if (!data.length) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📭</div>
          <p>${lang === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet'}</p>
          <button class="btn btn-primary" onclick="Admin.openAddModal('${collection}')">
            ${I18n.t('admin_add')}
          </button>
        </div>
      `;
            return;
        }

        const columns = this.getColumns(collection);

        container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
            <th>${lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              ${columns.map(col => `
                <td>
                  ${col.type === 'image'
                ? (item[col.key] ? `<img src="${item[col.key]}" class="table-image" alt="">` : `<div class="table-image" style="background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;">${(item[`name_${lang}`] || item[`title_${lang}`] || '?').charAt(0)}</div>`)
                : col.key.includes('_')
                    ? (item[`${col.key}_${lang}`] || item[col.key] || '')
                    : (item[col.key] || '')
            }
                </td>
              `).join('')}
              <td>
                <div class="table-actions">
                  <button class="action-edit" onclick="Admin.openEditModal('${collection}', '${item.id}')" title="${I18n.t('admin_edit')}">✏️</button>
                  <button class="action-delete" onclick="Admin.deleteItem('${collection}', '${item.id}')" title="${I18n.t('admin_delete')}">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    },

    getColumns(collection) {
        const lang = I18n.currentLang;
        const configs = {
            portfolio: [
                { key: 'image', label: lang === 'ar' ? 'الصورة' : 'Image', type: 'image' },
                { key: 'title', label: lang === 'ar' ? 'العنوان' : 'Title' },
                { key: 'category', label: lang === 'ar' ? 'التصنيف' : 'Category' },
                { key: 'date', label: lang === 'ar' ? 'التاريخ' : 'Date' }
            ],
            team: [
                { key: 'image', label: lang === 'ar' ? 'الصورة' : 'Image', type: 'image' },
                { key: 'name', label: lang === 'ar' ? 'الاسم' : 'Name' },
                { key: 'role', label: lang === 'ar' ? 'المنصب' : 'Role' }
            ],
            testimonials: [
                { key: 'name', label: lang === 'ar' ? 'الاسم' : 'Name' },
                { key: 'company', label: lang === 'ar' ? 'الشركة' : 'Company' },
                { key: 'rating', label: lang === 'ar' ? 'التقييم' : 'Rating' }
            ],
            blog: [
                { key: 'title', label: lang === 'ar' ? 'العنوان' : 'Title' },
                { key: 'author', label: lang === 'ar' ? 'الكاتب' : 'Author' },
                { key: 'date', label: lang === 'ar' ? 'التاريخ' : 'Date' }
            ]
        };

        return configs[collection] || [];
    },

    // ============ Modal Forms ============
    getFormFields(collection) {
        const lang = I18n.currentLang;
        const configs = {
            portfolio: [
                { key: 'title_ar', label: 'العنوان (عربي)', type: 'text', required: true },
                { key: 'title_en', label: 'Title (English)', type: 'text', required: true },
                { key: 'description_ar', label: 'الوصف (عربي)', type: 'textarea' },
                { key: 'description_en', label: 'Description (English)', type: 'textarea' },
                {
                    key: 'category', label: lang === 'ar' ? 'التصنيف' : 'Category', type: 'select', options: [
                        { value: 'web', label: lang === 'ar' ? 'مواقع' : 'Websites' },
                        { value: 'marketing', label: lang === 'ar' ? 'تسويق' : 'Marketing' },
                        { value: 'advertising', label: lang === 'ar' ? 'إعلان' : 'Advertising' }
                    ]
                },
                { key: 'link', label: lang === 'ar' ? 'الرابط' : 'Link', type: 'text' },
                { key: 'date', label: lang === 'ar' ? 'التاريخ' : 'Date', type: 'date' },
                { key: 'image', label: lang === 'ar' ? 'الصورة' : 'Image', type: 'file' }
            ],
            team: [
                { key: 'name_ar', label: 'الاسم (عربي)', type: 'text', required: true },
                { key: 'name_en', label: 'Name (English)', type: 'text', required: true },
                { key: 'role_ar', label: 'المنصب (عربي)', type: 'text' },
                { key: 'role_en', label: 'Role (English)', type: 'text' },
                { key: 'bio_ar', label: 'النبذة (عربي)', type: 'textarea' },
                { key: 'bio_en', label: 'Bio (English)', type: 'textarea' },
                { key: 'image', label: lang === 'ar' ? 'الصورة' : 'Image', type: 'file' }
            ],
            testimonials: [
                { key: 'name_ar', label: 'الاسم (عربي)', type: 'text', required: true },
                { key: 'name_en', label: 'Name (English)', type: 'text', required: true },
                { key: 'company_ar', label: 'الشركة (عربي)', type: 'text' },
                { key: 'company_en', label: 'Company (English)', type: 'text' },
                { key: 'text_ar', label: 'الرأي (عربي)', type: 'textarea', required: true },
                { key: 'text_en', label: 'Testimonial (English)', type: 'textarea', required: true },
                {
                    key: 'rating', label: lang === 'ar' ? 'التقييم' : 'Rating', type: 'select', options: [
                        { value: '5', label: '★★★★★' },
                        { value: '4', label: '★★★★☆' },
                        { value: '3', label: '★★★☆☆' },
                        { value: '2', label: '★★☆☆☆' },
                        { value: '1', label: '★☆☆☆☆' }
                    ]
                },
                { key: 'image', label: lang === 'ar' ? 'الصورة' : 'Image', type: 'file' }
            ],
            blog: [
                { key: 'title_ar', label: 'العنوان (عربي)', type: 'text', required: true },
                { key: 'title_en', label: 'Title (English)', type: 'text', required: true },
                { key: 'excerpt_ar', label: 'المقتطف (عربي)', type: 'textarea' },
                { key: 'excerpt_en', label: 'Excerpt (English)', type: 'textarea' },
                { key: 'content_ar', label: 'المحتوى (عربي)', type: 'textarea' },
                { key: 'content_en', label: 'Content (English)', type: 'textarea' },
                { key: 'author_ar', label: 'الكاتب (عربي)', type: 'text' },
                { key: 'author_en', label: 'Author (English)', type: 'text' },
                { key: 'date', label: lang === 'ar' ? 'التاريخ' : 'Date', type: 'date' },
                { key: 'image', label: lang === 'ar' ? 'الصورة' : 'Image', type: 'file' }
            ]
        };

        return configs[collection] || [];
    },

    openAddModal(collection) {
        this.editingItem = null;
        this.editingCollection = collection;
        this.renderModal(collection, null);
    },

    openEditModal(collection, id) {
        const item = DataStore.getItem(collection, id);
        if (!item) return;
        this.editingItem = item;
        this.editingCollection = collection;
        this.renderModal(collection, item);
    },

    renderModal(collection, item) {
        const overlay = document.getElementById('adminModal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');
        const lang = I18n.currentLang;

        title.textContent = item
            ? (lang === 'ar' ? 'تعديل' : 'Edit')
            : (lang === 'ar' ? 'إضافة جديد' : 'Add New');

        const fields = this.getFormFields(collection);

        body.innerHTML = `
      <form id="adminItemForm" onsubmit="Admin.saveItem(event)">
        ${fields.map(field => {
            const value = item ? (item[field.key] || '') : '';
            if (field.type === 'textarea') {
                return `
              <div class="form-group">
                <label>${field.label}</label>
                <textarea name="${field.key}" ${field.required ? 'required' : ''} rows="3"
                  style="width:100%;padding:0.85rem 1rem;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary);font-size:0.95rem;resize:vertical;font-family:inherit;">${value}</textarea>
              </div>
            `;
            } else if (field.type === 'select') {
                return `
              <div class="form-group">
                <label>${field.label}</label>
                <select name="${field.key}"
                  style="width:100%;padding:0.85rem 1rem;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary);font-size:0.95rem;">
                  ${field.options.map(opt => `<option value="${opt.value}" ${value == opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                </select>
              </div>
            `;
            } else if (field.type === 'file') {
                return `
              <div class="form-group">
                <label>${field.label}</label>
                <div class="image-upload-area" onclick="this.querySelector('input').click()">
                  <input type="file" accept="image/*" name="${field.key}" onchange="Admin.handleImageUpload(this)">
                  ${value ? `<img src="${value}" class="preview-image" alt="preview">` : `<div class="upload-icon">📷</div><p>${lang === 'ar' ? 'اضغط لرفع صورة' : 'Click to upload image'}</p>`}
                </div>
              </div>
            `;
            } else {
                return `
              <div class="form-group">
                <label>${field.label}</label>
                <input type="${field.type}" name="${field.key}" value="${value}" ${field.required ? 'required' : ''}
                  style="width:100%;padding:0.85rem 1rem;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary);font-size:0.95rem;">
              </div>
            `;
            }
        }).join('')}
      </form>
    `;

        overlay.classList.add('active');
    },

    handleImageUpload(input) {
        const file = input.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert(I18n.currentLang === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 2MB' : 'Image size must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const area = input.closest('.image-upload-area');
            area.innerHTML = `
        <input type="file" accept="image/*" name="${input.name}" onchange="Admin.handleImageUpload(this)">
        <img src="${e.target.result}" class="preview-image" alt="preview">
      `;
            area.dataset.imageData = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    saveItem(e) {
        e.preventDefault();
        const form = document.getElementById('adminItemForm');
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (key !== 'image' || typeof value === 'string') {
                data[key] = value;
            }
        }

        // Handle image
        const imageArea = form.querySelector('.image-upload-area');
        if (imageArea?.dataset.imageData) {
            data.image = imageArea.dataset.imageData;
        } else if (this.editingItem?.image) {
            data.image = this.editingItem.image;
        }

        // Convert rating to number
        if (data.rating) data.rating = parseInt(data.rating);

        if (this.editingItem) {
            DataStore.updateItem(this.editingCollection, this.editingItem.id, data);
        } else {
            DataStore.addItem(this.editingCollection, data);
        }

        this.closeModal();
        this.renderTable(this.editingCollection);
        this.showNotification(I18n.currentLang === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully');
    },

    deleteItem(collection, id) {
        if (!confirm(I18n.t('admin_confirm_delete'))) return;

        DataStore.deleteItem(collection, id);
        this.renderTable(collection);
        this.showNotification(I18n.currentLang === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
    },

    closeModal() {
        const overlay = document.getElementById('adminModal');
        if (overlay) overlay.classList.remove('active');
        this.editingItem = null;
        this.editingCollection = null;
    },

    // ============ Settings ============
    renderSettings() {
        // Settings are rendered from HTML, just update data if needed
    },

    exportData() {
        const data = DataStore.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `satr_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification(I18n.currentLang === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                if (DataStore.importData(ev.target.result)) {
                    this.showNotification(I18n.currentLang === 'ar' ? 'تم استيراد البيانات بنجاح' : 'Data imported successfully');
                    this.navigateTo(this.currentSection);
                } else {
                    this.showNotification(I18n.currentLang === 'ar' ? 'خطأ في ملف البيانات' : 'Invalid data file', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    resetData() {
        if (!confirm(I18n.currentLang === 'ar' ? 'سيتم حذف جميع البيانات وإعادتها للافتراضية. هل أنت متأكد؟' : 'All data will be reset to defaults. Are you sure?')) return;
        DataStore.resetData();
        this.navigateTo('dashboard');
        this.showNotification(I18n.currentLang === 'ar' ? 'تم إعادة تعيين البيانات' : 'Data has been reset');
    },

    changePassword() {
        const newPass = prompt(I18n.currentLang === 'ar' ? 'أدخل كلمة المرور الجديدة:' : 'Enter new password:');
        if (!newPass || newPass.length < 4) {
            this.showNotification(I18n.currentLang === 'ar' ? 'كلمة المرور قصيرة جداً' : 'Password too short', 'error');
            return;
        }

        this.hashPassword(newPass).then(hash => {
            const settings = DataStore.getData('settings');
            settings.password_hash = hash;
            DataStore.setData('settings', settings);
            this.showNotification(I18n.currentLang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
        });
    },

    // ============ Notification ============
    showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = 'position:fixed;top:1.5rem;left:50%;transform:translateX(-50%);z-index:10000;';
        toast.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span><span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ============ Sidebar Toggle (Mobile) ============
    toggleSidebar() {
        document.querySelector('.admin-sidebar')?.classList.toggle('open');
    }
};

// Handle login on Enter key
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();

    const passInput = document.getElementById('adminPassword');
    if (passInput) {
        passInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') Admin.login();
        });
    }
});
