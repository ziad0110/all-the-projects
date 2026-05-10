/* ============================================
   سطر (Satr) - Blog Module
   ============================================ */

const Blog = {
    init() {
        DataStore.init();
        I18n.init();
        this.renderBlogList();

        // Check if we need to show a single post
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('id');
        if (postId) {
            this.showPost(postId);
        }

        window.addEventListener('langChanged', () => this.renderBlogList());
    },

    renderBlogList() {
        const container = document.getElementById('blogList');
        if (!container) return;

        const posts = DataStore.getData('blog');

        if (!posts.length) {
            container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="icon">📝</div>
          <p>${I18n.currentLang === 'ar' ? 'لا توجد مقالات بعد' : 'No articles yet'}</p>
        </div>
      `;
            return;
        }

        container.innerHTML = posts.map((post, i) => `
      <div class="blog-card reveal stagger-${(i % 3) + 1}">
        <div class="blog-card-image">
          ${post.image
                ? `<img src="${post.image}" alt="${I18n.getLocalized(post, 'title')}" loading="lazy">`
                : `<div style="width:100%;height:100%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.3">📝</div>`
            }
        </div>
        <div class="blog-card-content">
          <div class="blog-card-meta">
            <span>📅 ${new Date(post.date).toLocaleDateString(I18n.currentLang === 'ar' ? 'ar-SA' : 'en-US')}</span>
            <span>✍️ ${I18n.getLocalized(post, 'author')}</span>
          </div>
          <h3>${I18n.getLocalized(post, 'title')}</h3>
          <p>${I18n.getLocalized(post, 'excerpt')}</p>
          <a href="?id=${post.id}" class="blog-card-link" onclick="Blog.showPost('${post.id}'); return false;">${I18n.t('blog_read_more')} →</a>
        </div>
      </div>
    `).join('');

        Animations.initScrollReveal();
    },

    showPost(id) {
        const post = DataStore.getItem('blog', id);
        if (!post) return;

        const container = document.getElementById('blogContent');
        const listView = document.getElementById('blogListView');
        const postView = document.getElementById('blogPostView');

        if (listView) listView.style.display = 'none';
        if (postView) postView.style.display = 'block';

        if (container) {
            container.innerHTML = `
        <article style="max-width:800px;margin:0 auto;">
          <a href="blog.html" class="btn-ghost" onclick="Blog.backToList(); return false;" style="display:inline-flex;align-items:center;gap:0.5rem;margin-bottom:2rem;color:var(--color-blue);">
            ← ${I18n.currentLang === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </a>
          ${post.image ? `<img src="${post.image}" alt="${I18n.getLocalized(post, 'title')}" style="width:100%;border-radius:var(--radius-lg);margin-bottom:2rem;">` : ''}
          <div class="blog-card-meta" style="margin-bottom:1rem;">
            <span>📅 ${new Date(post.date).toLocaleDateString(I18n.currentLang === 'ar' ? 'ar-SA' : 'en-US')}</span>
            <span>✍️ ${I18n.getLocalized(post, 'author')}</span>
          </div>
          <h1 style="font-size:2rem;margin-bottom:1.5rem;">${I18n.getLocalized(post, 'title')}</h1>
          <div style="color:var(--text-secondary);line-height:2;font-size:1.05rem;">
            ${I18n.getLocalized(post, 'content')}
          </div>
        </article>
      `;
        }
    },

    backToList() {
        const listView = document.getElementById('blogListView');
        const postView = document.getElementById('blogPostView');
        if (listView) listView.style.display = 'block';
        if (postView) postView.style.display = 'none';
        window.history.pushState({}, '', 'blog.html');
    }
};
