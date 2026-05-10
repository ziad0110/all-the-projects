const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Smart Accounting Suite - SAS",
    icon: path.join(__dirname, 'static/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenuBarVisibility(false);

  // Function to load URL with retry logic
  const loadURL = () => {
    mainWindow.loadURL('http://127.0.0.1:5000').catch(() => {
      console.log("Server not ready, retrying in 1s...");
      setTimeout(loadURL, 1000);
    });
  };

  // Initial load after a short delay
  setTimeout(loadURL, 2000);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startPython() {
  let pythonExecutable;
  let args;

  // Check if we are in production (packaged) or development
  const isPackaged = app.isPackaged;

  if (isPackaged) {
    // In production, the EXE will be in the resources folder
    // We point to the SmartAccountingSuite.exe we built earlier
    pythonExecutable = path.join(process.resourcesPath, 'SmartAccountingSuite.exe');
    args = [];
  } else {
    // In development, use python script
    pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
    args = ['app.py'];
  }

  pythonProcess = spawn(pythonExecutable, args, {
    cwd: isPackaged ? process.resourcesPath : __dirname,
    env: process.env
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });
}

app.on('ready', () => {
  startPython();
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (pythonProcess) pythonProcess.kill();
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
