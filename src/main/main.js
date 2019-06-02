const { app, BrowserWindow, ipcMain, Menu } = require('electron');
// require('fix-path')();

const menuTemplate = require('./menu/template');
// const command = require('commander');
const command = require('electron-commander');
// const command = require('./external/commander');
const execute = require('./external/executer');

let win;
module.exports = function (rootPath) {
  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    ipcMain.removeAllListeners('cmd:ffmpeg-crop-gif');
    ipcMain.removeAllListeners('cmd:ffmpeg-convert-gif');
    ipcMain.removeAllListeners('cmd:ffmpeg-slice');
    ipcMain.removeAllListeners('cmd:ffmpeg-snap');
    ipcMain.removeAllListeners('cmd:ffprobe');
    app.quit();
  });

  ipcMain.on('cmd:ffmpeg-toTwitter-gif', ({ sender }, arg) => {
    const cmd = command.ffmpegToTitterGif(arg);
    console.log(cmd);
    execute('cmd:ffmpeg-toTwitter-gif', cmd, sender);
  });
  ipcMain.on('cmd:ffmpeg-crop-gif', ({ sender }, arg) => {
    const cmd = command.ffmpegCropGif(arg);
    console.log(cmd);
    execute('cmd:ffmpeg-crop-gif', cmd, sender);
  });
  ipcMain.on('cmd:ffmpeg-convert-gif', ({ sender }, arg) => {
    const cmd = command.ffmpegConvertGif(arg);
    console.log(cmd);
    execute('cmd:ffmpeg-convert-gif', cmd, sender);
  });
  ipcMain.on('cmd:ffmpeg-slice', ({ sender }, arg) => {
    const cmd = command.ffmpegSlice(arg);
    console.log(cmd);
    execute('cmd:ffmpeg-slice', cmd, sender);
  });
  ipcMain.on('cmd:ffmpeg-snap', ({ sender }, arg) => {
    const cmd = command.ffmpegSnap(arg);
    console.log(cmd);
    execute('cmd:ffmpeg-snap', cmd, sender);
  });
  ipcMain.on('cmd:ffprobe', ({ sender }, arg) => {
    const cmd = command.ffprobe(arg);
    console.log(cmd);
    execute('cmd:ffprobe', cmd, sender);
  });

  function createWindow() {
    win = new BrowserWindow();
    win.loadURL(`file://${rootPath}/static/index.html`);
    win.maximize();

    if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools();
    }

    const menu = Menu.buildFromTemplate(menuTemplate(win.webContents));
    Menu.setApplicationMenu(menu);

    win.on('closed', () => {
      win = null;
    });
  }
};
