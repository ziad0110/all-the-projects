import 'package:flutter/material.dart';
import 'package:mosh_food/auth/Login_or_redister.dart';
import 'package:mosh_food/models/restaurant.dart';
import 'package:mosh_food/thmes/thme_provider.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(
      MultiProvider(providers: [
        ChangeNotifierProvider(create: (context) => ThemeProvider(),),

        ChangeNotifierProvider(create: (context) => Restaurant(),),
       ],
        child: const MyApp(),
      ),
  );
}
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return  MaterialApp(
      debugShowCheckedModeBanner: false,
      home:  const LoginOrRister(),
      theme: Provider.of <ThemeProvider>(context).themeData,
    );
  }
}
