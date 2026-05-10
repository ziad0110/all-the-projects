import 'package:flutter/material.dart';

import 'package:mosh_food/pages/LoginPage.dart';
import 'package:mosh_food/pages/register_page.dart';

class LoginOrRister extends StatefulWidget {
  const LoginOrRister({super.key});

  @override
  State<LoginOrRister> createState() => _LoginOrRisterState();

}

class _LoginOrRisterState extends State<LoginOrRister> {
  //initially,show login page
  bool showLoginPage=true;

//toggle between login and register page
  void togglePages()
  {
    setState(() {
      showLoginPage= !showLoginPage;
    });
  }
  @override
  Widget build(BuildContext context) {
   if (showLoginPage)
     {
       return LoginPage(onTap: togglePages,);
     }else
       {
         return RegisterPage(onTap: togglePages);
       }
  }
}

