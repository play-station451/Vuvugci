const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const ALLOWED_HOST = 'chat.r3tard.dev';

function isAllowedHost(urlString) {
  try {
    return new URL(urlString).hostname === ALLOWED_HOST;
  } catch {
    return false;
  }
}

function attachExternalLinkHandling(win) {
  const { webContents } = win;
  webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedHost(url)) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  webContents.on('will-navigate', (event, url) => {
    if (!isAllowedHost(url) && url !== webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  webContents.on('did-attach-webview', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (isAllowedHost(url)) return { action: 'allow' };
      shell.openExternal(url);
      return { action: 'deny' };
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  attachExternalLinkHandling(win);

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
