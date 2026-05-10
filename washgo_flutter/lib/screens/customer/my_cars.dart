import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../core/localization.dart';

class MyCarsScreen extends StatefulWidget {
  const MyCarsScreen({super.key});

  @override
  State<MyCarsScreen> createState() => _MyCarsScreenState();
}

class _MyCarsScreenState extends State<MyCarsScreen> {
  final List<Map<String, String>> _cars = [
    {'type': 'Sedan', 'color': 'Silver', 'plate': '1234 ABC'},
    {'type': 'SUV', 'color': 'Black', 'plate': '9876 XYZ'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(L.t('سياراتي', 'My Cars')),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _cars.length,
        itemBuilder: (context, index) {
          final car = _cars[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.directions_car, color: AppColors.primary),
              ),
              title: Text('${car['color']} ${car['type']}'),
              subtitle: Text(car['plate']!),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline, color: AppColors.danger),
                onPressed: () {
                  setState(() {
                    _cars.removeAt(index);
                  });
                },
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Placeholder for add car functionality
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              title: Text(L.t('إضافة سيارة', 'Add Car')),
              content: Text(L.t('سيتم إضافة هذه الميزة قريباً',
                  'This feature will be added soon')),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: Text(L.t('حسناً', 'OK')),
                ),
              ],
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
