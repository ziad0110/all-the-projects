import pandas as pd
import random

# List of common retail categories and items for realistic dummy data
categories = ["مواد غذائية", "منظفات", "مشروبات", "إلكترونيات", "أدوات منزلية"]
items_base = ["أرز", "سكر", "زيت", "صابون", "عصير", "شاي", "قهوة", "مياه معدنية", "مكرونة", "دقيق"]

data = []
for i in range(1, 101):
    cat = random.choice(categories)
    base_name = random.choice(items_base)
    item_code = f"ITEM-{1000 + i}"
    name_ar = f"{base_name} نوع {i}"
    cost = random.randint(10, 500)
    # Sale price usually higher than cost
    sale = int(cost * 1.2) + random.randint(5, 20)
    
    data.append({
        "item_code": item_code,
        "name_ar": name_ar,
        "cost_price": cost,
        "sale_price": sale,
        "category": cat,
        "min_stock": 5,
        "initial_stock": random.randint(10, 100)
    })

df = pd.DataFrame(data)

# Save to Excel
output_file = "c:/Users/ziad/Desktop/sas_webapp_flask_sqlite/test_products_100.xlsx"
df.to_excel(output_file, index=False, engine='openpyxl')

print(f"Excel file created successfully at: {output_file}")
