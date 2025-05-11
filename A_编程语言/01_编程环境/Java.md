# Java开发环境配置

## 1. 运行环境安装
- 下载JDK：https://adoptium.net/
- 配置环境变量：JAVA_HOME指向JDK安装路径
- 验证安装：`java -version`

## 2. VS Code推荐扩展
- Extension Pack for Java (Microsoft)
- CheckStyle for Java
- Spring Boot Extension Pack

## 3. 基础配置示例
```json
{
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-17",
      "path": "C:\\Program Files\\Java\\jdk-17"
    }
  ],
  "java.format.settings.url": "https://raw.githubusercontent.com/google/styleguide/gh-pages/eclipse-java-google-style.xml"
}
```

## 4. 常见问题
Q: 找不到主类
A: 1.检查package声明 2.清理编译缓存

Q: 依赖下载失败
A: 1.配置Maven镜像源 2.检查网络代理设置