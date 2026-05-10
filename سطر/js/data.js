/* ============================================
   سطر (Satr) - Data Layer
   Default data + localStorage CRUD
   ============================================ */

const DEFAULT_DATA = {
    portfolio: [
        {
            id: 'p1',
            title_ar: 'موقع شركة التقنية المتقدمة',
            title_en: 'Advanced Tech Company Website',
            description_ar: 'تصميم وتطوير موقع إلكتروني متكامل لشركة تقنية رائدة يتضمن نظام إدارة محتوى وواجهة مستخدم تفاعلية',
            description_en: 'Full website design and development for a leading tech company with CMS and interactive UI',
            category: 'web',
            image: '',
            link: '#',
            date: '2025-12-01',
            featured: true
        },
        {
            id: 'p2',
            title_ar: 'حملة تسويقية لمتجر إلكتروني',
            title_en: 'E-commerce Marketing Campaign',
            description_ar: 'حملة تسويق رقمي شاملة على منصات التواصل الاجتماعي حققت زيادة 200% في المبيعات',
            description_en: 'Comprehensive digital marketing campaign on social media that achieved 200% increase in sales',
            category: 'marketing',
            image: '',
            link: '#',
            date: '2025-11-15',
            featured: true
        },
        {
            id: 'p3',
            title_ar: 'إعلان فيديو لعلامة تجارية',
            title_en: 'Brand Video Advertisement',
            description_ar: 'إنتاج إعلان فيديو احترافي لعلامة تجارية مع تصوير وإخراج وتحرير كامل',
            description_en: 'Professional video ad production for a brand with full filming, directing, and editing',
            category: 'advertising',
            image: '',
            link: '#',
            date: '2025-10-20',
            featured: false
        },
        {
            id: 'p4',
            title_ar: 'منصة تعليمية إلكترونية',
            title_en: 'Online Learning Platform',
            description_ar: 'تطوير منصة تعليمية متكاملة مع نظام اشتراكات ودروس تفاعلية وشهادات',
            description_en: 'Development of an integrated learning platform with subscriptions, interactive lessons, and certificates',
            category: 'web',
            image: '',
            link: '#',
            date: '2025-09-10',
            featured: true
        },
        {
            id: 'p5',
            title_ar: 'هوية بصرية لمطعم',
            title_en: 'Restaurant Brand Identity',
            description_ar: 'تصميم هوية بصرية كاملة تشمل الشعار والألوان والخطوط وتصاميم السوشيال ميديا',
            description_en: 'Complete brand identity design including logo, colors, fonts, and social media designs',
            category: 'advertising',
            image: '',
            link: '#',
            date: '2025-08-05',
            featured: false
        },
        {
            id: 'p6',
            title_ar: 'إدارة حسابات التواصل الاجتماعي',
            title_en: 'Social Media Management',
            description_ar: 'إدارة شاملة لحسابات التواصل الاجتماعي مع إنشاء محتوى وجدولة منشورات',
            description_en: 'Comprehensive social media management with content creation and post scheduling',
            category: 'marketing',
            image: '',
            link: '#',
            date: '2025-07-18',
            featured: false
        }
    ],

    team: [
        {
            id: 't1',
            name_ar: 'أحمد المحمد',
            name_en: 'Ahmed Al-Mohammed',
            role_ar: 'المدير التنفيذي والمؤسس',
            role_en: 'CEO & Founder',
            bio_ar: 'خبرة أكثر من 10 سنوات في مجال التقنية والتسويق الرقمي',
            bio_en: 'Over 10 years of experience in technology and digital marketing',
            image: '',
            social: { twitter: '#', linkedin: '#', github: '#' }
        },
        {
            id: 't2',
            name_ar: 'سارة الأحمد',
            name_en: 'Sara Al-Ahmed',
            role_ar: 'مديرة التصميم',
            role_en: 'Design Director',
            bio_ar: 'مصممة إبداعية متخصصة في تجربة المستخدم وتصميم الواجهات',
            bio_en: 'Creative designer specializing in UX/UI design',
            image: '',
            social: { twitter: '#', linkedin: '#', dribbble: '#' }
        },
        {
            id: 't3',
            name_ar: 'خالد العمري',
            name_en: 'Khalid Al-Omari',
            role_ar: 'مطور ويب أول',
            role_en: 'Senior Web Developer',
            bio_ar: 'متخصص في تطوير تطبيقات الويب الحديثة والأنظمة المعقدة',
            bio_en: 'Specialized in modern web application development and complex systems',
            image: '',
            social: { twitter: '#', linkedin: '#', github: '#' }
        },
        {
            id: 't4',
            name_ar: 'نورة السالم',
            name_en: 'Noura Al-Salem',
            role_ar: 'مديرة التسويق',
            role_en: 'Marketing Manager',
            bio_ar: 'خبيرة في استراتيجيات التسويق الرقمي وإدارة الحملات الإعلانية',
            bio_en: 'Expert in digital marketing strategies and advertising campaign management',
            image: '',
            social: { twitter: '#', linkedin: '#', instagram: '#' }
        }
    ],

    testimonials: [
        {
            id: 'r1',
            name_ar: 'محمد العتيبي',
            name_en: 'Mohammed Al-Otaibi',
            company_ar: 'شركة الابتكار التقني',
            company_en: 'Tech Innovation Co.',
            text_ar: 'فريق سطر قدم لنا عملاً استثنائياً في تطوير موقعنا الإلكتروني. الاحترافية والإبداع في التصميم فاقا توقعاتنا بكثير.',
            text_en: 'Satr team delivered exceptional work on our website. The professionalism and creativity in design exceeded our expectations.',
            image: '',
            rating: 5
        },
        {
            id: 'r2',
            name_ar: 'فاطمة الشمري',
            name_en: 'Fatima Al-Shammari',
            company_ar: 'متجر الأناقة',
            company_en: 'Elegance Store',
            text_ar: 'حملة التسويق التي نفذها فريق سطر ساعدتنا في مضاعفة مبيعاتنا خلال 3 أشهر. نتائج مذهلة وتواصل ممتاز.',
            text_en: 'The marketing campaign by Satr team helped us double our sales in 3 months. Amazing results and excellent communication.',
            image: '',
            rating: 5
        },
        {
            id: 'r3',
            name_ar: 'عبدالله الحربي',
            name_en: 'Abdullah Al-Harbi',
            company_ar: 'مجموعة الحربي',
            company_en: 'Al-Harbi Group',
            text_ar: 'الهوية البصرية التي صممها فريق سطر أعطت شركتنا مظهراً احترافياً ومتميزاً. ننصح بهم بشدة.',
            text_en: 'The brand identity designed by Satr gave our company a professional and distinctive look. Highly recommended.',
            image: '',
            rating: 5
        }
    ],

    blog: [
        {
            id: 'b1',
            title_ar: 'أحدث اتجاهات تصميم المواقع في 2026',
            title_en: 'Latest Web Design Trends in 2026',
            excerpt_ar: 'استكشف أبرز اتجاهات تصميم المواقع الإلكترونية التي ستسيطر على عالم الويب في عام 2026',
            excerpt_en: 'Explore the top web design trends that will dominate the web world in 2026',
            content_ar: 'يشهد عالم تصميم المواقع تطوراً مستمراً مع ظهور تقنيات وأساليب جديدة. في هذا المقال نستعرض أبرز الاتجاهات التي يجب أن تكون على دراية بها.',
            content_en: 'The web design world is constantly evolving with new technologies and methods. In this article, we explore the key trends you should be aware of.',
            image: '',
            date: '2026-02-10',
            author_ar: 'أحمد المحمد',
            author_en: 'Ahmed Al-Mohammed',
            category: 'design'
        },
        {
            id: 'b2',
            title_ar: 'كيف تبني استراتيجية تسويق رقمي ناجحة',
            title_en: 'How to Build a Successful Digital Marketing Strategy',
            excerpt_ar: 'دليل شامل لبناء استراتيجية تسويق رقمي فعالة تحقق نتائج ملموسة لعملك',
            excerpt_en: 'A comprehensive guide to building an effective digital marketing strategy with tangible results',
            content_ar: 'التسويق الرقمي أصبح ضرورة لا غنى عنها لأي عمل تجاري. تعرف على الخطوات الأساسية لبناء استراتيجية ناجحة.',
            content_en: 'Digital marketing has become indispensable for any business. Learn the essential steps to build a successful strategy.',
            image: '',
            date: '2026-01-25',
            author_ar: 'نورة السالم',
            author_en: 'Noura Al-Salem',
            category: 'marketing'
        },
        {
            id: 'b3',
            title_ar: 'أهمية الهوية البصرية لنجاح علامتك التجارية',
            title_en: 'The Importance of Visual Identity for Your Brand Success',
            excerpt_ar: 'تعرف على دور الهوية البصرية في بناء علامة تجارية قوية ومتميزة في السوق',
            excerpt_en: 'Learn about the role of visual identity in building a strong and distinctive brand',
            content_ar: 'الهوية البصرية هي الانطباع الأول الذي يتلقاه العميل عن علامتك التجارية. اكتشف كيف تبني هوية بصرية مؤثرة.',
            content_en: 'Visual identity is the first impression a customer receives about your brand. Discover how to build an impactful visual identity.',
            image: '',
            date: '2026-01-15',
            author_ar: 'سارة الأحمد',
            author_en: 'Sara Al-Ahmed',
            category: 'branding'
        }
    ],

    services: [
        {
            id: 's1',
            title_ar: 'تصميم وتطوير المواقع',
            title_en: 'Web Design & Development',
            description_ar: 'نصمم ونطور مواقع إلكترونية احترافية ومتجاوبة تعكس هوية علامتك التجارية وتحقق أهدافك',
            description_en: 'We design and develop professional, responsive websites that reflect your brand identity and achieve your goals',
            icon: '🌐'
        },
        {
            id: 's2',
            title_ar: 'التسويق الرقمي',
            title_en: 'Digital Marketing',
            description_ar: 'نقدم حلول تسويقية رقمية متكاملة تشمل إدارة المحتوى والإعلانات وتحسين محركات البحث',
            description_en: 'We provide integrated digital marketing solutions including content management, advertising, and SEO',
            icon: '📈'
        },
        {
            id: 's3',
            title_ar: 'الإعلان والهوية البصرية',
            title_en: 'Advertising & Brand Identity',
            description_ar: 'نبتكر حملات إعلانية مؤثرة ونصمم هويات بصرية فريدة تميز علامتك التجارية',
            description_en: 'We create impactful advertising campaigns and design unique brand identities',
            icon: '🎨'
        }
    ],

    settings: {
        password_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // password
        site_visits: 0,
        admin_logged_in: false
    }
};

// Data access functions
const DataStore = {
    _getStore() {
        try {
            const stored = localStorage.getItem('satr_data');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    },

    _saveStore(data) {
        try {
            localStorage.setItem('satr_data', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save data:', e);
        }
    },

    init() {
        if (!this._getStore()) {
            this._saveStore(DEFAULT_DATA);
        }
        // Increment visits
        this.incrementVisits();
    },

    getData(key) {
        const store = this._getStore() || DEFAULT_DATA;
        return store[key] || DEFAULT_DATA[key] || [];
    },

    setData(key, value) {
        const store = this._getStore() || { ...DEFAULT_DATA };
        store[key] = value;
        this._saveStore(store);
    },

    // CRUD Operations
    addItem(collection, item) {
        const data = this.getData(collection);
        item.id = item.id || this._generateId(collection);
        data.push(item);
        this.setData(collection, data);
        return item;
    },

    updateItem(collection, id, updates) {
        const data = this.getData(collection);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.setData(collection, data);
            return data[index];
        }
        return null;
    },

    deleteItem(collection, id) {
        const data = this.getData(collection);
        const filtered = data.filter(item => item.id !== id);
        this.setData(collection, filtered);
        return filtered;
    },

    getItem(collection, id) {
        const data = this.getData(collection);
        return data.find(item => item.id === id) || null;
    },

    incrementVisits() {
        const settings = this.getData('settings');
        settings.site_visits = (settings.site_visits || 0) + 1;
        this.setData('settings', settings);
    },

    getStats() {
        return {
            portfolio: this.getData('portfolio').length,
            team: this.getData('team').length,
            testimonials: this.getData('testimonials').length,
            blog: this.getData('blog').length,
            visits: this.getData('settings').site_visits || 0
        };
    },

    exportData() {
        const store = this._getStore() || DEFAULT_DATA;
        return JSON.stringify(store, null, 2);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this._saveStore(data);
            return true;
        } catch {
            return false;
        }
    },

    resetData() {
        this._saveStore(DEFAULT_DATA);
    },

    _generateId(prefix) {
        return prefix.charAt(0) + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    }
};
