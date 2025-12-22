# Navigator Learning Hub

一个个人技术学习与实践的知识库，按模块化、可扩展的方式整理各类技术笔记与示例代码。

> 本仓库目前主要覆盖：编程语言基础、JavaScript 异步、React、Electron 客户端以及 LangGraph AI 示例，其他目录将逐步完善。

---

## 🌱 Getting Started

- **克隆本仓库**：
  - 本地使用任意 Git 客户端或命令行克隆到本机。
- **建议阅读顺序（从基础到进阶）**：
  1. `03-programming-language-categories`：各语言安装、程序结构、JS 模块与异步等基础。
  2. `06-frontend-frameworks`：React 项目结构与 Redux Toolkit 状态管理。
  3. `07-desktop-clients`：Electron 客户端与 FastAPI 后端示例。
  4. `10-ai`：LangGraph 等 AI/Agent 实验。
- **如何使用**：
  - 把每个子目录当作一个“小课程（lesson）”：先阅读 README/注释，再运行示例代码，最后尝试自己改造或扩展。

---

## 🗂 Repository Structure（仓库结构）

> 顶层目录统一采用「数字前缀 + 全小写 + `-` 分隔」命名，便于在 GitHub 上按顺序浏览。

| Folder | 说明 |
| ----- | ---- |
| `01-software-and-environment` | 软件与开发环境配置（预留，用于记录操作系统、终端、编辑器、调试工具等环境相关内容）。 |
| `02-databases` | 数据库相关内容（预留，可用于整理 MySQL、PostgreSQL、MongoDB、Redis 等示例与笔记）。 |
| `03-programming-language-categories` | 编程语言分类笔记：安装、程序结构、模块/包、JS 异步等按主题归类的内容。 |
| `04-programming-language-summaries` | 编程语言总结与对比（预留，用于写跨语言对比、选型经验等总结类文档）。 |
| `05-backend-frameworks` | 后端框架（预留，可用于存放 FastAPI、Django、Flask、Spring Boot 等框架的示例和笔记）。 |
| `06-frontend-frameworks` | 前端框架，目前包含 React 相关示例：项目结构与 Redux Toolkit。 |
| `07-desktop-clients` | 桌面客户端，目前包含 Electron 与 Electron + FastAPI 的示例项目。 |
| `08-mobile-apps` | 移动端开发（预留，可用于整理 Android、iOS、Flutter、React Native 等）。 |
| `09-project-guidelines` | 项目规范（预留，用于记录代码风格、Git 分支命名、Commit 规范、Issue 模板等）。 |
| `10-ai` | AI / Agent 实验，目前包含基于 LangGraph 的聊天与 Demo 示例。 |

---

## 📚 Modules & Examples（模块与示例）

仿照 `ai-agents-for-beginners` 的「Lessons」风格，这里把当前已有内容按模块简单列出，后续可继续扩展。

| Module | Folder | 内容简介 |
| ------ | ------ | -------- |
| Language Installation | `03-programming-language-categories/01-installation` | 各主流语言（C++, Go, Java, JavaScript, Kotlin, Python, Rust, TypeScript）的安装与环境配置笔记。 |
| Program Structure | `03-programming-language-categories/02-program-structure` | 不同语言的 Hello World 与基础程序结构示例，便于横向对比各语言的入口与编译/运行方式。 |
| JS Modules | `03-programming-language-categories/modules-and-packages/js-modules-import-export.md` | 介绍 JavaScript 模块系统以及 `import` / `export` 的使用方式。 |
| JS Async & Promises | `03-programming-language-categories/async-operations/js` | 多个 JS 异步与 Promise 示例，包括文件 IO、HTTP 请求与并发/顺序执行等。 |
| React Project Structure | `06-frontend-frameworks/react/project-structure` | 使用 Vite + React + TypeScript 搭建的前端项目结构示例，适合作为新项目脚手架参考。 |
| React + Redux Toolkit | `06-frontend-frameworks/react/redux-toolkit` | 展示如何在 React 中使用 Redux Toolkit 进行状态管理的示例项目。 |
| Electron + FastAPI App | `07-desktop-clients/electron/electron-fastapi-app` | 结合 Electron 前端与 FastAPI 后端的桌面应用示例，展示前后端协作与桌面打包思路。 |
| Electron Desktop App | `07-desktop-clients/electron/my-electron-app` | 纯 Electron 应用的示例，用于练习桌面客户端开发与窗口管理。 |
| LangGraph Demos | `10-ai/langgraph` | 使用 LangGraph 的简单聊天和 Demo 脚本，适合入门 Agent 式工作流的搭建。 |

> 未来可以继续为每个模块补充：更详细的 README、运行指南、以及配套的学习任务清单。

---

## 🧭 How to Study with This Repo（如何使用本仓库学习）

- **以目录为单位学习**：每个子目录可以视为一个独立主题，先阅读代码与注释，再尝试修改或新增功能。
- **多语言对比**：在 `03-programming-language-categories` 中，可以对比不同语言的 Hello World、程序结构和异步模型，加深对语言设计差异的理解。
- **从基础到项目**：
  - 先掌握语言与异步基础（JS 异步、模块）；
  - 再学习 React / Redux Toolkit 等前端框架；
  - 然后尝试 Electron + FastAPI 等实战项目；
  - 最后探索 `10-ai` 中的 LangGraph 等 AI 相关内容。

---

## 🤝 Contributing & Maintenance（维护方式）

目前这是一个个人学习仓库：

- **新增内容时**：
  - 按照「数字前缀 + 全小写 + `-` 分隔」的命名规范创建新目录；
  - 优先把新内容归类到已有的 10 个顶层目录之一，避免再增加同级目录。
- **如果未来开放给他人协作**：
  - 可以在 `09-project-guidelines` 中添加代码风格指南、Commit 规范、Issue/PR 模板等。

---

## 📌 Planned Improvements（后续计划）

- 为每个主要目录补充独立的 `README.md`，详细说明该模块的学习目标与使用方法。
- 在 `04-programming-language-summaries` 中撰写各语言对比与选型建议。
- 在 `05-backend-frameworks`、`08-mobile-apps` 中逐步添加后端与移动端相关示例项目。
- 为 `10-ai` 增加更多 Agent / RAG / 工具调用相关的实践示例。
