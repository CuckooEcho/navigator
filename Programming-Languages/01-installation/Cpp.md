# C++开发环境配置

## 1. 运行环境安装
- Windows安装MSVC：通过Visual Studio安装"使用C++的桌面开发"工作负载
- 或安装MinGW-w64：https://www.mingw-w64.org/
- 验证安装：`g++ --version`

## 2. VS Code推荐扩展
- C/C++ (Microsoft)
- CMake Tools
- Code Runner

## 3. 基础配置示例
```json
{
  "C_Cpp.default.cppStandard": "c++17",
  "C_Cpp.default.compilerPath": "C:\\mingw64\\bin\\g++.exe",
  "code-runner.runInTerminal": true
}
```

## 4. 常见问题
Q: 头文件找不到
A: 1.检查includePath配置 2.安装对应SDK

Q: 链接错误
A: 1.确认库文件路径 2.检查编译参数