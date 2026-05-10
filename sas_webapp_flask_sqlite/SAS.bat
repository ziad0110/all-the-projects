@echo off
title SAS - النظام المحاسبي الذكي
echo.
echo  ==========================================
echo    SAS - النظام المحاسبي الذكي
echo    Smart Accounting Suite v1.0
echo  ==========================================
echo.
echo  جاري التشغيل...
echo.
python desktop.py
if %errorlevel% neq 0 (
    echo.
    echo  حدث خطأ في التشغيل!
    echo  تأكد من تثبيت Python والمكتبات المطلوبة
    echo  شغّل: pip install -r requirements.txt
    echo.
    pause
)
