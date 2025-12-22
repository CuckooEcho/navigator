## 02-hello-world-vite：Vue + TypeScript 入门示例

> 本文说明如何在 `06-frontend-frameworks/vue/02-hello-world-vite` 目录下，使用 **Vite** 创建一个 **Vue + TypeScript** 的 Hello World 项目，并基于 Vite 默认模板解释各个核心文件的作用。待实际项目生成后，你可以按实际结构微调本说明。

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

## 2. 在 vue 目录下使用 Vite 创建项目

以下步骤假设你在仓库根目录：`navigator-1/`。

### 2.1 进入 Vue 示例根目录

```bash
cd 06-frontend-frameworks/vue/02-hello-world-vite
```

> 注意：这里我们直接在 `02-hello-world-vite` 目录中初始化项目。

### 2.2 使用 Vite 创建 Vue + TS 项目

在该目录下执行：

```bash
npm create vite@latest . -- --template vue-ts
```

说明：

- `.` 表示在当前目录生成项目文件。
- `--template vue-ts`：使用 **Vue + TypeScript** 模板。

按提示确认后，当前目录会被填充为一个标准的 Vite + Vue + TS 项目结构。

---

## 3. 安装依赖并运行项目

### 3.1 安装依赖

仍然在 `02-hello-world-vite` 目录中：

```bash
npm install
```

这一步会根据 `package.json` 中的 `dependencies` / `devDependencies` 自动安装 Vue、Vite、TypeScript 等依赖。

### 3.2 启动开发服务器

安装完成后执行：

```bash
npm run dev
```

终端会输出类似：

```text
Local:   http://localhost:5173/
```

在浏览器中打开该地址，即可看到 Vue Hello World 页面。

---

## 4. 生成后的目录结构概览（基于 Vite 默认模板）

项目创建成功后，`02-hello-world-vite` 目录大致结构如下（实际可能随 Vite 版本有轻微差异）：

```text
02-hello-world-vite/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json        # 视模板版本而定
├── tsconfig.node.json       # 视模板版本而定
├── vite.config.ts
├── .gitignore
├── README.md
├── package-lock.json
└── src/
    ├── main.ts
    ├── App.vue
    ├── components/
    │   └── HelloWorld.vue   # 默认示例组件
    └── style.css            # 全局样式
```

> 说明：如果模板中还包含 `src/assets/` 等资源目录，可以把它们视为静态资源（图片、图标等）的存放位置。

---

## 5. 核心文件说明

### 5.1 `index.html`

- 项目的 HTML 入口文件。
- 一般只包含一个根节点容器，例如：

```html
<div id="app"></div>
```

Vue 应用会通过 `main.ts` 挂载到这个节点上。

### 5.2 `package.json`

- 描述项目的 **依赖、脚本命令和基础信息**。
- 关键字段：
  - `scripts`：常用命令，例如
    - `dev`：`vite`（开发服务器）
    - `build`：`vite build`（生产环境打包）
    - `preview`：`vite preview`（本地预览打包结果）
  - `dependencies`：运行时依赖（如 `vue`）。
  - `devDependencies`：开发时依赖（如 `vite`、`typescript`、`@vitejs/plugin-vue` 等）。

### 5.3 `vite.config.ts`

- Vite 的配置文件（TypeScript），通常类似：

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

- 入门阶段保持默认即可，当需要路径别名、代理或环境变量时再调整。

### 5.4 TypeScript 配置：`tsconfig*.json`

- `tsconfig.json`：TypeScript 主配置文件，定义编译目标、模块系统、路径别名等。
- `tsconfig.app.json` / `tsconfig.node.json`（如果存在）：
  - 通常分别针对浏览器端代码和 Node 端脚本（如 Vite 配置）进行细分配置。

### 5.5 `src/main.ts`

- Vue 应用的入口文件，负责把根组件挂载到 `index.html` 的 `#app` 上。
- 典型结构（基于 Vue 3 + `<script setup>` 风格）：

```ts
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');
```

### 5.6 `src/App.vue`

- 定义应用的根组件。
- Hello World 阶段一般非常简单，例如：

```vue
<template>
  <div>
    <h1>Hello Vue + Vite</h1>
  </div>
</template>

<script setup lang="ts">
// 这里暂时不需要逻辑，后续可以逐步加入响应式状态等
</script>

<style scoped>
/* 局部样式，可以在这里定义当前组件的样式 */
</style>
```

### 5.7 `src/components/HelloWorld.vue`

- 这是模板内附带的示例组件，用来展示 Vue 组件的基本写法和 props 使用方式。
- 你可以：
  - 阅读其中的模板、脚本和样式，理解基本语法；
  - 或者删掉它，换成你自己的组件。

### 5.8 `src/style.css`

- 全局样式文件，在 `main.ts` 中被引入。
- 用于设置全局的页面样式，如字体、背景色、布局等。

---

## 6. 建议的学习步骤

1. **完成一次从 0 到 1 的创建和运行流程**：
   - 在 `vue/02-hello-world-vite` 目录中完成 Vite 初始化、依赖安装和 `npm run dev`。
2. **打开 `src/App.vue` 做小修改**：
   - 把文案改成你自己的内容，确认热更新生效。
3. **研究 `src/components/HelloWorld.vue`**：
   - 理解 Vue 组件、props、模板语法的基础用法。
4. **尝试新增一个组件并在 `App.vue` 中使用**：
   - 例如新增 `src/components/MyCounter.vue`，在其中使用 `ref` 实现计数器，然后在 `App.vue` 引用。

完成这些之后，你就有了一个干净的 Vue + TypeScript + Vite Hello World 项目，可以作为后续所有前端（Vue）实验的起点。
