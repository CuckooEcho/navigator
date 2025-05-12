# Rust开发环境配置
## 1. 运行环境安装
- 安装rustup：https://www.rust-lang.org/tools/install
- 验证安装：`rustc --version`
## 2. VS Code推荐扩展
- rust-analyzer (官方语言服务)
- Better TOML (配置文件支持)
- Crates (依赖管理)
## 3. 基础配置示例
```json
{
  "rust-analyzer.check.command": "clippy",
  "rustfmt.overrideCommand": ["rustfmt", "--edition", "2021"]
}