const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const { fork } = require("child_process");
const http = require("http");
const fs = require('fs');
const os = require('os');

let mainWindow;
let backendProcess;
const BACKEND_PORT = 5000;
const FRONTEND_PORT = 3000;
const CHECK_URL = `http://localhost:${BACKEND_PORT}/health`;
const LOG_FILE = path.join(app.getPath('userData'), 'main.log');

// Simple file logger
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (e) {
    console.error("Failed to write log:", e);
  }
}

// Clear log on start
try { fs.writeFileSync(LOG_FILE, "--- App Session Start ---\n"); } catch (e) { }

const getBackendPath = () => {
  const p = app.isPackaged
    ? path.join(process.resourcesPath, "backend", "server.js")
    : path.join(__dirname, "../backend/server.js");
  log(`Backend Path Resolved: ${p}`);
  return p;
};

const getFrontendTarget = () => {
  const p = app.isPackaged
    ? path.join(__dirname, "../frontend/dist/index.html")
    : `http://localhost:${FRONTEND_PORT}`;
  log(`Frontend Target Resolved: ${p}`);
  return p;
};

function startBackend() {
  const scriptPath = getBackendPath();
  log(`Starting backend from: ${scriptPath}`);

  // Use fork to use Electron's internal Node.js runtime
  // This avoids needing a global 'node' installation
  try {
    backendProcess = fork(scriptPath, [], {
      cwd: path.dirname(scriptPath),
      env: { ...process.env, PORT: BACKEND_PORT },
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });

    log(`Backend PID: ${backendProcess.pid}`);

    backendProcess.stdout.on('data', (data) => log(`Backend: ${data}`));
    backendProcess.stderr.on('data', (data) => log(`Backend Error: ${data}`));
    backendProcess.on('error', (err) => log(`Backend Process Error: ${err}`));
    backendProcess.on('exit', (code) => log(`Backend Exited with code: ${code}`));
  } catch (err) {
    log(`Failed to spawn backend: ${err.message}`);
  }
}

function waitForBackend(callback) {
  log("Waiting for backend health check...");
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    http.get(CHECK_URL, (res) => {
      if (res.statusCode === 200) {
        clearInterval(timer);
        log("Backend online!");
        callback();
      }
    }).on("error", (err) => {
      if (attempts % 5 === 0) log(`Backend check failed (${attempts}): ${err.message}`);
    });
  }, 1000);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  const target = getFrontendTarget();
  log(`Loading URL: ${target}`);

  if (target.startsWith("http")) {
    mainWindow.loadURL(target);
  } else {
    mainWindow.loadFile(target);
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  if (process.env.SKIP_BACKEND && !app.isPackaged) {
    log("Skipping internal backend startup (Development mode + SKIP_BACKEND set)");
    waitForBackend(createWindow);
  } else {
    startBackend();
    waitForBackend(createWindow);
  }

  globalShortcut.register("CommandOrControl+Shift+I", () => {
    mainWindow.webContents.toggleDevTools();
  });
});

app.on("window-all-closed", () => {
  log("App closing...");
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
