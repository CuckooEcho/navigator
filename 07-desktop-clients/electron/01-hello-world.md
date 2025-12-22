# Electron Hello World

一个基于 Electron 的最小示例项目，展示如何启动桌面应用窗口。

---

## 环境准备

- **操作系统**：Windows 10/11（其他系统也可以，但命令可能略有不同）。
- **必备软件**：
  - [Node.js](https://nodejs.org/)（建议安装当前 LTS 版本，安装时勾选附带 npm）。
  - 推荐安装一个代码编辑器（如 VS Code），便于查看和修改项目代码。

安装完 Node.js 后，在终端（PowerShell 或 cmd）中执行：

```bash
node -v
npm -v
```

若能看到版本号，则说明环境安装成功。

---

## 安装依赖

1. 打开终端（建议 PowerShell）。
2. 切换到本项目目录：

```bash
cd path\to\navigator-1\07-desktop-clients\electron\hello-world
```

> 将 `path\to\navigator-1` 替换为你本地仓库的实际路径。

3. 安装项目依赖（主要是 Electron）：

```bash
npm install
```

这一步会根据 `package.json` 中的 `devDependencies` 自动安装 Electron。

---

## 启动 Electron 应用

在依赖安装完成后，仍然在 `hello-world` 目录下执行：

```bash
npm start
```

或等价的：

```bash
npx electron .
```

默认会执行 `package.json` 中配置的脚本：

```json
"scripts": {
  "start": "electron ."
}
```

Electron 会根据 `main.js` 启动主进程，创建一个窗口并加载 `index.html`，即看到一个简单的桌面应用界面。

---

## 常见问题

- **`electron` 命令不存在 / 报错**：
  - 确认已经在项目目录下执行过 `npm install`。
  - 确认是在项目目录中执行 `npm start`，而不是在其他目录。
- **窗口没有出现或闪退很快**：
  - 可以在终端中查看错误输出，通常是 `main.js` 中有语法错误或路径错误。

后续你可以在这个项目基础上继续：

- 修改 `index.html` 和 `styles.css` 自定义界面。
- 在 `preload.js` 中暴露更多 API 给渲染进程。
- 结合 `electron-fastapi-app` 项目实践前后端联动。 
