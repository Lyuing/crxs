# Chrome Extension Build Tool

这是一个用于构建Chrome扩展的工具，可以压缩和混淆插件资源。

## 功能

- 自动压缩CSS文件（除了已经以.min.css结尾的文件）
- 自动混淆JavaScript文件（除了已经以.min.js结尾的文件）
- 复制图片和其他静态资源
- 将所有处理后的文件输出到dist目录

## 使用方法

安装依赖：
```
npm install
```

执行构建：
```
npm run build
```

或者直接运行：
```
node build.js
```

构建后的文件将输出到 `dist` 目录中。