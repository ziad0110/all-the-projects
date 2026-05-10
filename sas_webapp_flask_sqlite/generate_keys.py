"""
SAS Developer Tool - مفتاح ترخيص جديد
"""
import sys
import os

# Add root to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from license_manager import generate_license_key, get_machine_id

def main():
    print("="*50)
    print("   SAS - Smart Accounting Suite (Key Generator)")
    print("="*50)
    
    mid = input("أدخل معرّف الجهاز (Machine ID): ").strip().upper()
    if not mid:
        print("خطأ: يجب إدخال معرّف الجهاز")
        return
        
    try:
        days = input("أدخل المدة بالأيام (0 لمدى الحياة): ").strip()
        days = int(days) if days else 0
    except:
        print("خطأ: المدة يجب أن تكون رقماً")
        return
        
    key = generate_license_key(mid, days)
    
    print("\n" + "*"*40)
    print(f"  معرف الجهاز: {mid}")
    print(f"  المدة      : {days if days > 0 else 'مدى الحياة'} يوم")
    print(f"  المفتاح    : {key}")
    print("*"*40)
    print("\nيرجى إرسال الاسم والمفتاح للعميل لتفعيل النسخة.")
    input("\nاضغط Enter للخروج...")

if __name__ == "__main__":
    main()
