import 'package:flutter/material.dart';
import 'package:mosh_food/thmes/dark_mode.dart';
import 'package:mosh_food/thmes/light_mode.dart';

class ThemeProvider with ChangeNotifier{
  ThemeData _themeData= lightMode;

  ThemeData get themeData => _themeData;

  bool get isDarkMode => _themeData == darkMode;
 set themeDate(ThemeData themeData){
   _themeData =themeData;
   notifyListeners();
 }
 void toggleTheme(){
   if(_themeData == lightMode)
   {
     themeDate = darkMode;
   }else{
     themeDate =lightMode;
   }
 }
}