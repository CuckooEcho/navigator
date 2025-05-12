# Python开发环境配置

## 1. 运行环境安装
- 官网下载安装包：https://www.python.org/downloads/
- Windows推荐使用安装向导勾选"Add Python to PATH"
- 验证安装：`python --version`

## 2. VS Code推荐扩展
- Python (Microsoft)
- Pylance (类型检查)
- Jupyter (笔记本支持)
- Python Indent (智能缩进)

## 3. 基础配置示例
```json
{
  "python.defaultInterpreterPath": "C:\\Python311\\python.exe",
  "python.linting.enabled": true,
  "python.formatting.provider": "black"
}
```

## 4. 常见问题
Q: 找不到Python解释器
A: 1.检查PATH环境变量 2.在VS Code中按Ctrl+Shift+P选择解释器

Q: 模块导入错误
A: 1.确认虚拟环境激活 2.使用`pip install`安装缺失包