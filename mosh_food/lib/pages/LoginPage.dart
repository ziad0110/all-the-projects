import 'package:flutter/material.dart';
import 'package:mosh_food/components/my_button.dart';
import 'package:mosh_food/components/my_textField.dart';
import 'package:mosh_food/pages/home_page.dart';

class LoginPage extends StatefulWidget {
  final void Function()? onTap;
  const LoginPage({super.key,required this.onTap});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController emialController=TextEditingController();
  final TextEditingController passwordController=TextEditingController();
//method login
  void login(){
    Navigator.push(context, MaterialPageRoute(builder: (context)=> const HomePage(),));
  }

  @override
  Widget build(BuildContext context) {
    return  Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body:  Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          //loge
          Icon(
            Icons.lock_open_rounded,
            size: 72,
            color: Theme.of(context).colorScheme.inversePrimary,
          ),
          const SizedBox(height: 25,),
          //message,app slogan
          Text(
            "Food Delivery App",
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).colorScheme.inversePrimary,
            ),
          ),
          const SizedBox(height: 15,),
          //email Textfield
          MyTextField(
            controller: emialController,
            hintText: "Emial",
            obscureText: false,
          ),
          const SizedBox(height: 10),
          //Password Textfield
          MyTextField(
            controller: passwordController,
            hintText: "Password",
            obscureText: true,
          ),
          const SizedBox(height: 10),
          ///sign button

          MyButton(
            text: "Sign In",
            onTap: (){
              if(passwordController.text.isNotEmpty && emialController.text.isNotEmpty){
                login();
              }else{
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content:Text( "Enter password"))

                );
              }


              },
          ),
          const SizedBox(height: 25),

          //not a number? register now
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("Not a Number? ",style: TextStyle(color: Theme.of(context).colorScheme.inversePrimary),),
              SizedBox(width: 4),

              GestureDetector(
                onTap:widget.onTap ,
                child: Text("Register now",style: TextStyle(color: Theme.of(context).colorScheme.inversePrimary,
                    fontWeight: FontWeight.bold),

                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
