from flaskwebgui import FlaskUI
from app import app
import os
import sys

# Get the path to the executable or script
if getattr(sys, 'frozen', False):
    basedir = sys._MEIPASS
else:
    basedir = os.path.dirname(os.path.abspath(__file__))

if __name__ == "__main__":
    # FlaskUI handles the threading and window creation automatically
    # It will find Chrome or Edge and open it in --app mode
    ui = FlaskUI(
        app=app,
        server="flask",
        width=1280,
        height=800,
        port=5005
    )
    
    ui.run()
