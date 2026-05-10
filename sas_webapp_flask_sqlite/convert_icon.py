from PIL import Image
import os

img = Image.open('static/app_icon.png')
# Resize and save as ICO
img.save('static/favicon.ico', format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
print("Successfully created static/favicon.ico")
