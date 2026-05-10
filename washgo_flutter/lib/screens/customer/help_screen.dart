import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(L.help),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.phone, color: AppColors.primary),
              title: Text(L.t('اتصل بنا', 'Call Us')),
              subtitle: const Text(
                '777000111',
                textDirection: TextDirection.ltr,
              ),
              onTap: () {},
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.email, color: AppColors.primary),
              title: Text(L.t('البريد الإلكتروني', 'Email')),
              subtitle: const Text(
                'support@washgo.ye',
                textDirection: TextDirection.ltr,
              ),
              onTap: () {},
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.chat, color: AppColors.primary),
              title: Text(L.t('محادثة مباشرة', 'Live Chat')),
              subtitle:
                  Text(L.t('تحدث مع فريق الدعم', 'Talk to our support team')),
              onTap: () {},
            ),
          ),
          const SizedBox(height: 24),
          Text(L.t('الأسئلة الشائعة', 'FAQ'),
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ExpansionTile(
            title: Text(L.t('كيف يمكنني حجز غسلة؟', 'How can I book a wash?')),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(L.t(
                    'يمكنك حجز غسلة من خلال اختيار الباقة المناسبة لك من الشاشة الرئيسية واكمال عملية الحجز.',
                    'You can book a wash by selecting a package from the home screen and completing the booking process.')),
              )
            ],
          ),
          ExpansionTile(
            title: Text(L.t('ما هي طرق الدفع المتاحة؟',
                'What are the available payment methods?')),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(L.t('نقبل الدفع نقداً عند استلام الخدمة.',
                    'We accept cash payment upon service delivery.')),
              )
            ],
          ),
        ],
      ),
    );
  }
}
