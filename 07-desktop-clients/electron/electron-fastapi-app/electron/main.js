const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;
let pythonProcess;

// 确定Python命令
function getPythonCommand() {
  // 可根据平台或配置选择Python命令
  // 例如: process.platform === 'win32' ? 'python' : 'python3'
  return 'python';
}

// 启动Python服务器
function startPythonServer() {
  const pythonCmd = getPythonCommand();
  const serverPath = path.join(__dirname, '../backend/main.py');
  
  console.log(`Starting Python server with: ${pythonCmd} ${serverPath}`);
  
  pythonProcess = exec(`${pythonCmd} ${serverPath}`, 
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to start Python server: ${error.message}`);
        return;
      }
      console.log(`Python server output: ${stdout}`);
    }
  );
  
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });
  
  return pythonProcess;
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // 在开发环境中允许跨域请求
    }
  });

  mainWindow.loadFile('index.html');
  
  // 开发环境打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  // 窗口关闭时
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// 应用就绪时
app.whenReady().then(() => {
  // 启动Python服务器
  pythonProcess = startPythonServer();
  console.log('Python server started');
  
  // 延迟创建窗口，给服务器启动时间
  setTimeout(createWindow, 1000);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 所有窗口关闭时
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    // 关闭Python进程
    if (pythonProcess) {
      pythonProcess.kill();
      console.log('Python server stopped');
    }
    app.quit();
  }
});

// 应用退出时
app.on('quit', () => {
  // 确保Python进程被终止
  if (pythonProcess) {
    pythonProcess.kill();
    console.log('Python server stopped');
  }
});

// IPC通信示例(如果需要)
ipcMain.on('message-from-renderer', (event, arg) => {
  console.log('Message from renderer:', arg);
  event.reply('message-from-main', 'Message received');
});  