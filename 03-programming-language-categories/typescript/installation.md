# TypeScript开发环境配置
## 1. 运行环境安装
- 安装Node.js：https://nodejs.org
- 安装TypeScript：`npm install -g typescript`
- 验证安装：`tsc --version`

## 2. VS Code推荐扩展
- TypeScript Hero (代码组织)
- ESLint (代码规范)
- Prettier (代码格式化)
- Debugger for Chrome (调试支持)

## 3. 基础配置示例
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  }
}
```

## 4. Vite专项配置
### 基础配置
```bash
# 创建Vite+TS项目
npm create vite@latest my-project -- --template react-ts
```

### 插件推荐
- `@vitejs/plugin-react` (React项目必备)
- `vite-plugin-checker` (类型检查)
- `vite-plugin-eslint` (ESLint集成)

### ESLint配置
```typescript
// vite.config.ts
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    eslint({
      fix: true,
      include: ['src/**/*.ts', 'src/**/*.tsx']
    })
  ]
})
```

## 5. 常见问题
### 类型声明缺失
```bash
npm install @types/<package-name>
```
### 调试配置
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "调试TS",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${file}"]
    }
  ]
}
```