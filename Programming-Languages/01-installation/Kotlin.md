# Kotlin开发环境配置

## 1. JDK安装与Kotlin编译器配置
- 下载JDK：https://adoptium.net/
- 安装Kotlin编译器：使用SDKMAN! `sdk install kotlin`
- 验证安装：`kotlin -version`

## 2. VS Code扩展推荐
- Kotlin Language (fwcd.kotlin)
- Gradle for Java
- Code Runner
- Debugger for Java

## 3. 构建工具配置示例
### Gradle配置（build.gradle.kts）：
```kotlin
plugins {
    kotlin("jvm") version "1.9.0"
}

dependencies {
    implementation(kotlin("stdlib"))
}
```

### Maven配置（pom.xml）：
```xml
<dependency>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-stdlib</artifactId>
    <version>1.9.0</version>
</dependency>
```

## 4. 常见问题
Q: 找不到JVM路径
A: 1.检查JAVA_HOME环境变量 2.在VS Code设置中指定jdk.path

Q: 多版本管理
A: 使用SDKMAN!工具：
```
sdk install kotlin 1.8.22
sdk use kotlin 1.9.0
```