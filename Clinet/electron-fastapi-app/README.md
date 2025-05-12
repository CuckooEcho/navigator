# FastAPI与Electron集成桌面应用开发指南

## 一、项目概述
本项目将Python的FastAPI框架与Electron结合，创建一个功能完整的桌面应用程序。通过这种组合，我们既能利用FastAPI强大的后端处理能力，又能借助Electron构建跨平台的现代UI界面。

### 项目结构
```
electron-fastapi-app/
├── backend/
│   └── main.py               # FastAPI后端服务
├── electron/
│   ├── main.js               # Electron主进程
│   ├── renderer.js           # Electron渲染进程
│   └── preload.js            # 预加载脚本
├── index.html                # 应用主页面
└── package.json              # 项目配置
```


## 二、FastAPI后端实现

### 1. 核心依赖
- **FastAPI**：高性能Web框架，用于构建API
- **Uvicorn**：ASGI服务器，运行FastAPI应用
- **Pydantic**：数据验证和序列化库

### 2. 数据模型
```python
class Item(BaseModel):
    name: str
    description: str | None = None
```
- 使用Pydantic模型定义数据结构
- 支持类型校验和数据验证

### 3. API接口
```python
@app.get("/items/{item_id}")
async def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return items[item_id]

@app.post("/items/")
async def create_item(item: Item):
    item_id = str(len(items) + 1)
    items[item_id] = item
    return {"item_id": item_id, **item.dict()}
```
- **GET /items/{item_id}**：获取单个项目
- **POST /items/**：创建新项目
- 使用内存字典`items`模拟数据存储

### 4. 服务器启动
```python
def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8000)

def start_server_thread():
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    return server_thread
```
- 使用线程在后台运行FastAPI服务器
- 守护线程确保应用退出时自动终止


## 三、Electron前端实现

### 1. 主进程 (main.js)
```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const { start_server_thread } = require('../backend/main');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  serverThread = start_server_thread();
  createWindow();
});
```
- 负责应用生命周期管理
- 启动FastAPI服务器线程
- 创建并管理应用窗口

### 2. 渲染进程 (renderer.js)
```javascript
async function fetchItems() {
  const response = await fetch('http://localhost:8000/items/1');
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

async function createItem(itemData) {
  const response = await fetch('http://localhost:8000/items/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  return await response.json();
}
```
- 使用Fetch API与FastAPI后端通信
- 提供数据获取和操作的接口
- 处理HTTP响应和错误

### 3. 预加载脚本 (preload.js)
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});
```
- 安全地暴露Electron API给渲染进程
- 实现主进程与渲染进程间的通信


## 四、应用集成与通信

### 1. 启动流程
1. Electron主进程启动
2. 启动FastAPI服务器线程
3. 创建Electron窗口
4. 窗口加载HTML页面
5. 渲染进程通过HTTP与FastAPI通信

### 2. 进程间通信
- **Electron内部**：使用IPC机制（ipcMain/ipcRenderer）
- **与FastAPI通信**：使用标准HTTP请求
  - 优点：解耦前后端，便于测试和维护
  - 缺点：需要处理网络请求延迟


## 五、开发与部署

### 1. 开发环境搭建
```bash
# 安装Python依赖
pip install fastapi uvicorn pydantic

# 初始化Node.js项目
npm init -y

# 安装Electron
npm install electron electron-builder --save-dev
```

### 2. 运行应用
```bash
# 启动开发环境
npm start
```

### 3. 打包应用
```bash
# 打包为Windows应用
npm run dist:win

# 打包为macOS应用
npm run dist:mac

# 打包为Linux应用
npm run dist:linux
```


## 六、扩展与优化

### 1. 功能扩展建议
- 添加数据库支持（SQLite/PostgreSQL）
- 实现用户认证和权限管理
- 添加数据可视化图表
- 实现文件导入/导出功能

### 2. 性能优化
- 使用异步I/O处理高并发请求
- 添加缓存机制减少重复计算
- 优化Electron窗口渲染性能

### 3. 安全加固
- 实现CORS策略限制跨域访问
- 对敏感数据进行加密处理
- 添加输入验证防止SQL注入
- 定期更新依赖库修复安全漏洞


## 七、常见问题与解决方案

### 1. FastAPI服务器启动失败
- **检查端口占用**：确保8000端口未被其他应用使用
- **查看日志**：在控制台查看详细错误信息
- **手动启动测试**：尝试单独运行main.py测试FastAPI服务

### 2. Electron无法连接到后端
- 确认FastAPI服务器已成功启动
- 检查网络请求URL是否正确（localhost:8000）
- 确保防火墙未阻止本地连接

### 3. 打包后应用无法运行
- 检查打包配置文件（package.json）
- 确保所有依赖已正确包含
- 使用调试模式运行打包后的应用查看错误信息


## 八、参考资源
- [FastAPI官方文档](https://fastapi.tiangolo.com/)
- [Electron官方文档](https://www.electronjs.org/docs)
- [Python与Electron集成教程](https://www.christianengvall.se/electron-python/)
- [异步编程指南](https://realpython.com/async-io-python/)