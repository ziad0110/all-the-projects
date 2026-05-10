from license_manager import generate_license_key
mid = "64B1D60E3EA0E380"
name = "زياد"
days = 0
key = generate_license_key(mid, name, days)
print(f"Key for {name}: {key}")
