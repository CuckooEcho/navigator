# Go开发环境配置

## 1. 运行环境安装
- 官网下载安装包：https://go.dev/dl/
- 设置GOPATH环境变量（默认~/go）
- 验证安装：`go version`

## 2. VS Code推荐扩展
- Go (Google)
- Go Test Explorer
- Go Struct Helper

## 3. 基础配置示例
```json
{
  "go.goroot": "C:\\Go",
  "go.gopath": "%USERPROFILE%\\go",
  "go.toolsManagement.checkForUpdates": "local"
}
```

## 4. 常见问题
Q: 模块下载超时
A: 1.设置GOPROXY=https://goproxy.cn 2.检查网络连接

Q: 代码跳转失效
A: 1.运行`go install github.com/go-delve/delve/cmd/dlv@latest` 2.重新加载窗口