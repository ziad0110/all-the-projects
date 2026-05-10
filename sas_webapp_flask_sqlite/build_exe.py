import PyInstaller.__main__
import os
import shutil

# Remove old builds
if os.path.exists('backend_dist'): shutil.rmtree('backend_dist')
if os.path.exists('build'): shutil.rmtree('build')

args = [
    'app.py',
    '--name=SmartAccountingSuite',
    '--onefile',
    '--windowed',
    '--distpath=backend_dist',
    '--add-data=templates;templates',
    '--add-data=static;static',
    '--add-data=schema.sql;.',
    '--add-data=pyarmor_runtime_000000;pyarmor_runtime_000000',
    '--clean',
    '--noconfirm'
]

if os.path.exists('static/favicon.ico'):
    args.append('--icon=static/favicon.ico')

PyInstaller.__main__.run(args)

print("\n" + "="*50)
print("✅ Done! Your Backend App is in the 'backend_dist' folder.")
print("="*50)

