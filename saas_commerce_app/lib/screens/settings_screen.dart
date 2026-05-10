/// شاشة الإعدادات (Settings Screen)
/// لوحة تحكم لتخصيص التطبيق

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:saas_commerce_app/theme/app_theme.dart';
import 'package:saas_commerce_app/services/tenant_config_service.dart';
import 'package:saas_commerce_app/services/product_service.dart';
import 'package:saas_commerce_app/models/tenant_config.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _companyNameController;
  late TextEditingController _sloganController;
  late TextEditingController _copyrightController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late TextEditingController _addressController;
  late TextEditingController _whatsappController;
  late TextEditingController _currencySymbolController;

  @override
  void initState() {
    super.initState();
    final config = context.read<TenantConfigService>().config;
    _companyNameController = TextEditingController(text: config.companyName);
    _sloganController = TextEditingController(text: config.slogan);
    _copyrightController = TextEditingController(text: config.copyrightText);
    _phoneController = TextEditingController(text: config.contact.phone);
    _emailController = TextEditingController(text: config.contact.email);
    _addressController = TextEditingController(text: config.contact.address);
    _whatsappController = TextEditingController(text: config.contact.whatsapp);
    _currencySymbolController = TextEditingController(
      text: config.currencySymbol,
    );
  }

  @override
  void dispose() {
    _companyNameController.dispose();
    _sloganController.dispose();
    _copyrightController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _whatsappController.dispose();
    _currencySymbolController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final configService = context.watch<TenantConfigService>();
    final config = configService.config;
    final theme = AppTheme(config);

    return Scaffold(
      appBar: AppBar(
        title: const Text('إعدادات التطبيق'),
        actions: [
          IconButton(
            icon: const Icon(Icons.restore),
            tooltip: 'إعادة التعيين',
            onPressed: () => _showResetConfirmation(context, configService),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('معلومات الشركة', Icons.business, theme),
          _buildSettingCard([
            _buildTextField(
              'اسم الشركة',
              _companyNameController,
              Icons.store,
              () =>
                  configService.updateCompanyName(_companyNameController.text),
            ),
            const Divider(),
            _buildTextField(
              'الشعار النصي',
              _sloganController,
              Icons.format_quote,
              () => configService.updateSlogan(_sloganController.text),
            ),
            const Divider(),
            _buildTextField(
              'نص حقوق النشر',
              _copyrightController,
              Icons.copyright,
              () =>
                  configService.updateCopyrightText(_copyrightController.text),
            ),
          ], theme),

          const SizedBox(height: 24),
          _buildSectionHeader('الألوان والمظهر', Icons.palette, theme),
          _buildSettingCard([
            _buildColorPicker(
              'اللون الأساسي',
              config.theme.primaryColor,
              (color) => configService.updatePrimaryColor(color),
              theme,
            ),
            const Divider(),
            _buildColorPicker(
              'لون الخلفية',
              config.theme.backgroundColor,
              (color) => configService.updateBackgroundColor(color),
              theme,
            ),
          ], theme),

          const SizedBox(height: 24),
          _buildSectionHeader('العملة', Icons.attach_money, theme),
          _buildSettingCard([
            _buildTextField(
              'رمز العملة',
              _currencySymbolController,
              Icons.monetization_on,
              () => configService.updateCurrency(
                config.currency,
                _currencySymbolController.text,
              ),
            ),
          ], theme),

          const SizedBox(height: 24),
          _buildSectionHeader('معلومات التواصل', Icons.contact_phone, theme),
          _buildSettingCard([
            _buildTextField(
              'رقم الهاتف',
              _phoneController,
              Icons.phone,
              () => _updateContactInfo(configService),
            ),
            const Divider(),
            _buildTextField(
              'البريد الإلكتروني',
              _emailController,
              Icons.email,
              () => _updateContactInfo(configService),
            ),
            const Divider(),
            _buildTextField(
              'العنوان',
              _addressController,
              Icons.location_on,
              () => _updateContactInfo(configService),
            ),
            const Divider(),
            _buildTextField(
              'واتساب',
              _whatsappController,
              Icons.chat,
              () => _updateContactInfo(configService),
            ),
          ], theme),

          const SizedBox(height: 24),
          _buildSectionHeader('إدارة البيانات', Icons.storage, theme),
          _buildSettingCard([
            ListTile(
              leading: Icon(Icons.inventory, color: theme.primaryColor),
              title: const Text('إعادة تعيين المنتجات'),
              subtitle: const Text('استعادة المنتجات الافتراضية'),
              trailing: const Icon(Icons.chevron_left),
              onTap: () => _showResetProductsConfirmation(context),
            ),
            const Divider(),
            ListTile(
              leading: Icon(Icons.refresh, color: theme.primaryColor),
              title: const Text('إعادة تعيين الإعدادات'),
              subtitle: const Text('استعادة الإعدادات الافتراضية'),
              trailing: const Icon(Icons.chevron_left),
              onTap: () => _showResetConfirmation(context, configService),
            ),
          ], theme),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon, AppTheme theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: theme.primaryColor, size: 20),
          const SizedBox(width: 8),
          Text(
            title,
            style: GoogleFonts.almarai(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: theme.primaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingCard(List<Widget> children, AppTheme theme) {
    return Container(
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildTextField(
    String label,
    TextEditingController controller,
    IconData icon,
    VoidCallback onSave,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
                const SizedBox(height: 4),
                TextField(
                  controller: controller,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                  onSubmitted: (_) => onSave(),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.save, size: 20),
            color: Colors.green,
            onPressed: onSave,
          ),
        ],
      ),
    );
  }

  Widget _buildColorPicker(
    String label,
    Color currentColor,
    Function(Color) onColorChanged,
    AppTheme theme,
  ) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: currentColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white24),
        ),
      ),
      title: Text(label),
      trailing: const Icon(Icons.edit, size: 20),
      onTap: () {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(label),
            backgroundColor: theme.cardColor,
            content: SingleChildScrollView(
              child: ColorPicker(
                pickerColor: currentColor,
                onColorChanged: onColorChanged,
                enableAlpha: false,
                displayThumbColor: true,
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('تم', style: TextStyle(color: theme.primaryColor)),
              ),
            ],
          ),
        );
      },
    );
  }

  void _updateContactInfo(TenantConfigService configService) {
    configService.updateContactInfo(
      ContactInfo(
        phone: _phoneController.text,
        email: _emailController.text,
        address: _addressController.text,
        whatsapp: _whatsappController.text,
      ),
    );
  }

  void _showResetConfirmation(
    BuildContext context,
    TenantConfigService configService,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: configService.config.theme.cardColor.value != 0
            ? Color(configService.config.theme.cardColor.value)
            : const Color(0xFF162033),
        title: const Text('إعادة التعيين'),
        content: const Text('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () {
              configService.resetToDefault();
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم إعادة تعيين الإعدادات')),
              );
            },
            child: const Text('تأكيد', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showResetProductsConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إعادة تعيين المنتجات'),
        content: const Text(
          'هل أنت متأكد من إعادة تعيين جميع المنتجات للافتراضية؟',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () {
              context.read<ProductService>().resetToDefault();
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم إعادة تعيين المنتجات')),
              );
            },
            child: const Text('تأكيد', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
