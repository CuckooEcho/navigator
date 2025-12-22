## 02-hello-world-vite：React + TypeScript 入门示例

> 本文说明如何在 `06-frontend-frameworks/react/02-hello-world-vite` 目录下，使用 **Vite** 创建一个 **React + TypeScript** 的 Hello World 项目，并基于生成的目录结构解释各个核心文件的作用。

---

## 1. 环境准备

- **操作系统**：Windows / macOS / Linux 均可。
- **必备软件**：
  - Node.js（建议 LTS 版本，例如 18+）
  - npm（随 Node.js 一起安装）

在终端中确认版本：

```bash
node -v
npm -v
```

若能看到版本号，则说明环境安装成功。

---

## 2. 在 react 目录下使用 Vite 创建项目

以下步骤假设你在仓库根目录：`navigator-1/`。

### 2.1 进入 React 示例根目录

```bash
cd 06-frontend-frameworks/react
```

### 2.2 使用 Vite 创建 React + TS 项目

在 `react` 目录下执行：

```bash
npm create vite@latest 02-hello-world-vite -- --template react-ts
```

说明：

- `02-hello-world-vite`：项目目录名，与当前目录结构保持一致（数字前缀 + 描述）。
- `--template react-ts`：使用 **React + TypeScript** 模板。

按提示确认后，会在当前目录生成 `02-hello-world-vite/` 项目目录。

---

## 3. 安装依赖并运行项目

### 3.1 安装依赖

进入项目目录：

```bash
cd 02-hello-world-vite
npm install
```

这一步会根据 `package.json` 中的 `dependencies` / `devDependencies` 自动安装 React、Vite、TypeScript 等依赖。

### 3.2 启动开发服务器

安装完成后执行：

```bash
npm run dev
```

终端会输出类似：

```text
Local:   http://localhost:5173/
```

在浏览器中打开该地址，即可看到 React Hello World 页面。

---

## 4. 生成后的目录结构概览

项目创建成功后，`02-hello-world-vite` 目录大致结构如下（基于 Vite 标准模板）：

```text
02-hello-world-vite/
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

> 说明：具体文件可能随 Vite / 模板版本略有差异，但整体结构和职责类似。

---

## 5. 核心文件说明

### 5.1 `index.html`

- 项目的 HTML 入口文件。
- 一般只包含一个根节点容器，例如：

```html
<div id="root"></div>
```

React 会通过 `main.tsx` 将应用挂载到这个节点上。

### 5.2 `package.json`

- 描述项目的 **依赖、脚本命令和基础信息**。
- 关键字段：
  - `scripts`：常用命令，例如
    - `dev`：`vite`（开发服务器）
    - `build`：`vite build`（生产环境打包）
    - `preview`：`vite preview`（本地预览打包结果）
  - `dependencies`：运行时依赖（如 `react`、`react-dom`）。
  - `devDependencies`：开发时依赖（如 `vite`、`typescript`、类型声明等）。

### 5.3 `vite.config.ts`

- Vite 的配置文件（TypeScript），通常类似：

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- 入门阶段保持默认即可，当需要路径别名、代理或环境变量时再调整。

### 5.4 TypeScript 配置：`tsconfig*.json`

- `tsconfig.json`：TypeScript 主配置文件，定义编译目标、模块系统、路径别名等。
- `tsconfig.app.json` / `tsconfig.node.json`（如果存在）：
  - 通常分别针对浏览器端代码和 Node 端脚本（如 Vite 配置）进行细分配置。

在初期可以只大致了解，有需要时再深入查看具体字段含义。

### 5.5 `src/main.tsx`

- React 应用的入口文件，负责把根组件渲染到 `index.html` 的 `#root` 上。
- 典型结构：

```ts
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 5.6 `src/App.tsx`

- 定义应用的根组件。
- Hello World 阶段一般非常简单，例如：

```tsx
function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}

export default App;
```

你可以从这里开始拆分子组件、引入路由、加入状态管理等。

### 5.7 样式文件：`src/App.css` 与 `src/index.css`

- `App.css`：根组件 `App` 的样式文件，你可以在这里为页面中的元素添加样式。
- `index.css`：全局样式入口文件，通常在 `main.tsx` 中被引入，用于设置全局样式（如 `body` 的 margin、字体等）。

---

## 6. 建议的学习步骤

1. **先完成一次从 0 到 1 的创建和运行流程**：
   - 在 `react` 目录下用 Vite 创建 `02-hello-world-vite` 项目，安装依赖并跑通 `npm run dev`。
2. **打开 `src/App.tsx` 做小修改**：
   - 把页面文案改成你自己的内容，确认热更新生效。
3. **尝试增加一个简单的组件**：
   - 例如新建 `src/components/Hello.tsx`，在 `App.tsx` 中引用，从而熟悉组件拆分与导入逻辑。

完成这些之后，你就有了一个干净的 React + TypeScript + Vite Hello World 项目，可以作为后续所有前端实验的起点。
