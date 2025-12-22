const { contextBridge, ipcRenderer } = require('electron');

// 暴露API到渲染器进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送消息到主进程
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  
  // 从主进程接收消息
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  
  // 移除监听器
  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  },
  
  // 发送同步消息到主进程
  sendSync: (channel, data) => {
    return ipcRenderer.sendSync(channel, data);
  }
});

// 暴露文件操作API
contextBridge.exposeInMainWorld('fileSystem', {
  // 读取文件
  readFile: (filePath) => {
    return ipcRenderer.invoke('read-file', filePath);
  },
  
  // 写入文件
  writeFile: (filePath, content) => {
    return ipcRenderer.invoke('write-file', filePath, content);
  },
  
  // 打开文件选择对话框
  openFileDialog: (options) => {
    return ipcRenderer.invoke('open-file-dialog', options);
  }
});

// 安全的日志记录
contextBridge.exposeInMainWorld('logger', {
  log: (message) => {
    ipcRenderer.send('log-message', message);
  },
  error: (message) => {
    ipcRenderer.send('error-message', message);
  }
});  