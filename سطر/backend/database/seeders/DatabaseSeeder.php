<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use App\Models\Team;
use App\Models\Testimonial;
use App\Models\Blog;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Portfolio::insert([
            [
                'title_ar' => 'موقع شركة التقنية المتقدمة',
                'title_en' => 'Advanced Tech Company Website',
                'description_ar' => 'تصميم وتطوير موقع إلكتروني متكامل لشركة تقنية رائدة يتضمن نظام إدارة محتوى وواجهة مستخدم تفاعلية',
                'description_en' => 'Full website design and development for a leading tech company with CMS and interactive UI',
                'category' => 'web',
                'image' => '',
                'link' => '#',
                'date' => '2025-12-01',
                'featured' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title_ar' => 'حملة تسويقية لمتجر إلكتروني',
                'title_en' => 'E-commerce Marketing Campaign',
                'description_ar' => 'حملة تسويق رقمي شاملة على منصات التواصل الاجتماعي حققت زيادة 200% في المبيعات',
                'description_en' => 'Comprehensive digital marketing campaign on social media that achieved 200% increase in sales',
                'category' => 'marketing',
                'image' => '',
                'link' => '#',
                'date' => '2025-11-15',
                'featured' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title_ar' => 'إعلان فيديو لعلامة تجارية',
                'title_en' => 'Brand Video Advertisement',
                'description_ar' => 'إنتاج إعلان فيديو احترافي لعلامة تجارية مع تصوير وإخراج وتحرير كامل',
                'description_en' => 'Professional video ad production for a brand with full filming, directing, and editing',
                'category' => 'advertising',
                'image' => '',
                'link' => '#',
                'date' => '2025-10-20',
                'featured' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title_ar' => 'منصة تعليمية إلكترونية',
                'title_en' => 'Online Learning Platform',
                'description_ar' => 'تطوير منصة تعليمية متكاملة مع نظام اشتراكات ودروس تفاعلية وشهادات',
                'description_en' => 'Development of an integrated learning platform with subscriptions, interactive lessons, and certificates',
                'category' => 'web',
                'image' => '',
                'link' => '#',
                'date' => '2025-09-10',
                'featured' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title_ar' => 'هوية بصرية لمطعم',
                'title_en' => 'Restaurant Brand Identity',
                'description_ar' => 'تصميم هوية بصرية كاملة تشمل الشعار والألوان والخطوط وتصاميم السوشيال ميديا',
                'description_en' => 'Complete brand identity design including logo, colors, fonts, and social media designs',
                'category' => 'advertising',
                'image' => '',
                'link' => '#',
                'date' => '2025-08-05',
                'featured' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title_ar' => 'إدارة حسابات التواصل الاجتماعي',
                'title_en' => 'Social Media Management',
                'description_ar' => 'إدارة شاملة لحسابات التواصل الاجتماعي مع إنشاء محتوى وجدولة منشورات',
                'description_en' => 'Comprehensive social media management with content creation and post scheduling',
                'category' => 'marketing',
                'image' => '',
                'link' => '#',
                'date' => '2025-07-18',
                'featured' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        Team::insert([
            [
                'name_ar' => 'أحمد المحمد',
                'name_en' => 'Ahmed Al-Mohammed',
                'role_ar' => 'المدير التنفيذي والمؤسس',
                'role_en' => 'CEO & Founder',
                'bio_ar' => 'خبرة أكثر من 10 سنوات في مجال التقنية والتسويق الرقمي',
                'bio_en' => 'Over 10 years of experience in technology and digital marketing',
                'image' => '',
                'twitter' => '#',
                'linkedin' => '#',
                'github' => '#',
                'dribbble' => null,
                'instagram' => null,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name_ar' => 'سارة الأحمد',
                'name_en' => 'Sara Al-Ahmed',
                'role_ar' => 'مديرة التصميم',
                'role_en' => 'Design Director',
                'bio_ar' => 'مصممة إبداعية متخصصة في تجربة المستخدم وتصميم الواجهات',
                'bio_en' => 'Creative designer specializing in UX/UI design',
                'image' => '',
                'twitter' => '#',
                'linkedin' => '#',
                'github' => null,
                'dribbble' => '#',
                'instagram' => null,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name_ar' => 'خالد العمري',
                'name_en' => 'Khalid Al-Omari',
                'role_ar' => 'مطور ويب أول',
                'role_en' => 'Senior Web Developer',
                'bio_ar' => 'متخصص في تطوير تطبيقات الويب الحديثة والأنظمة المعقدة',
                'bio_en' => 'Specialized in modern web application development and complex systems',
                'image' => '',
                'twitter' => '#',
                'linkedin' => '#',
                'github' => '#',
                'dribbble' => null,
                'instagram' => null,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name_ar' => 'نورة السالم',
                'name_en' => 'Noura Al-Salem',
                'role_ar' => 'مديرة التسويق',
                'role_en' => 'Marketing Manager',
                'bio_ar' => 'خبيرة في استراتيجيات التسويق الرقمي وإدارة الحملات الإعلانية',
                'bio_en' => 'Expert in digital marketing strategies and advertising campaign management',
                'image' => '',
                'twitter' => '#',
                'linkedin' => '#',
                'github' => null,
                'dribbble' => null,
                'instagram' => '#',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        Testimonial::insert([
            [
                'name_ar' => 'محمد العتيبي',
                'name_en' => 'Mohammed Al-Otaibi',
                'company_ar' => 'شركة الابتكار التقني',
                'company_en' => 'Tech Innovation Co.',
                'text_ar' => 'فريق سطر قدم لنا عملاً استثنائياً في تطوير موقعنا الإلكتروني. الاحترافية والإبداع في التصميم فاقا توقعاتنا بكثير.',
                'text_en' => 'Satr team delivered exceptional work on our website. The professionalism and creativity in design exceeded our expectations.',
                'image' => '',
                'rating' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name_ar' => 'فاطمة الشمري',
                'name_en' => 'Fatima Al-Shammari',
                'company_ar' => 'متجر الأناقة',
                'company_en' => 'Elegance Store',
                'text_ar' => 'حملة التسويق التي نفذها فريق سطر ساعدتنا في مضاعفة مبيعاتنا خلال 3 أشهر. نتائج مذهلة وتواصل ممتاز.',
                'text_en' => 'The marketing campaign by Satr team helped us double our sales in 3 months. Amazing results and excellent communication.',
                'image' => '',
                'rating' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name_ar' => 'عبدالله الحربي',
                'name_en' => 'Abdullah Al-Harbi',
                'company_ar' => 'مجموعة الحربي',
                'company_en' => 'Al-Harbi Group',
                'text_ar' => 'الهوية البصرية التي صممها فريق سطر أعطت شركتنا مظهراً احترافياً ومتميزاً. ننصح بهم بشدة.',
                'text_en' => 'The brand identity designed by Satr gave our company a professional and distinctive look. Highly recommended.',
                'image' => '',
                'rating' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        Blog::insert([
            [
                'title_ar' => 'أحدث اتجاهات تصميم المواقع في 2026',
                'title_en' => 'Latest Web Design Trends in 2026',
                'excerpt_ar' => 'استكشف أبرز اتجاهات تصميم المواقع الإلكترونية التي ستسيطر على عالم الويب في عام 2026',
                'excerpt_en' => 'Explore the top web design trends that will dominate the web world in 2026',
                'content_ar' => 'يشهد عالم تصميم المواقع تطوراً مستمراً مع ظهور تقنيات وأساليب جديدة. في هذا المقال نستعرض أبرز الاتجاهات التي يجب أن تكون على دراية بها.',
                'content_en' => 'The web design world is constantly evolving with new technologies and methods. In this article, we explore the key trends you should be aware of.',
                'image' => '',
                'date' => '2026-02-10',
                'author_ar' => 'أحمد المحمد',
                'author_en' => 'Ahmed Al-Mohammed',
                'category' => 'design',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title_ar' => 'كيف تبني استراتيجية تسويق رقمي ناجحة',
                'title_en' => 'How to Build a Successful Digital Marketing Strategy',
                'excerpt_ar' => 'دليل شامل لبناء استراتيجية تسويق رقمي فعالة تحقق نتائج ملموسة لعملك',
                'excerpt_en' => 'A comprehensive guide to building an effective digital marketing strategy with tangible results',
                'content_ar' => 'التسويق الرقمي أصبح ضرورة لا غنى عنها لأي عمل تجاري. تعرف على الخطوات الأساسية لبناء استراتيجية ناجحة.',
                'content_en' => 'Digital marketing has become indispensable for any business. Learn the essential steps to build a successful strategy.',
                'image' => '',
                'date' => '2026-01-25',
                'author_ar' => 'نورة السالم',
                'author_en' => 'Noura Al-Salem',
                'category' => 'marketing',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title_ar' => 'أهمية الهوية البصرية لنجاح علامتك التجارية',
                'title_en' => 'The Importance of Visual Identity for Your Brand Success',
                'excerpt_ar' => 'تعرف على دور الهوية البصرية في بناء علامة تجارية قوية ومتميزة في السوق',
                'excerpt_en' => 'Learn about the role of visual identity in building a strong and distinctive brand',
                'content_ar' => 'الهوية البصرية هي الانطباع الأول الذي يتلقاه العميل عن علامتك التجارية. اكتشف كيف تبني هوية بصرية مؤثرة.',
                'content_en' => 'Visual identity is the first impression a customer receives about your brand. Discover how to build an impactful visual identity.',
                'image' => '',
                'date' => '2026-01-15',
                'author_ar' => 'سارة الأحمد',
                'author_en' => 'Sara Al-Ahmed',
                'category' => 'branding',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
