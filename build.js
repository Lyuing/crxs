const fs = require('fs');
const path = require('path');
const { minify } = require('uglify-js');
const CleanCSS = require('clean-css');
const htmlMinifier = require('html-minifier');

/**
 * Chrome Extension Builder Class
 * 用于构建和压缩浏览器扩展资源
 */
class ExtensionBuilder {
    /**
     * 构造函数
     * @param {Object} config - 配置对象
     * @param {string} config.srcDir - 源目录路径
     * @param {string} config.distDir - 输出目录路径
     */
    constructor(config) {
        this.config = config;
        this.srcDir = path.join(__dirname, config.srcDir);
        this.distDir = path.join(__dirname, config.distDir);
    }

    /**
     * 递归删除目录
     * @param {string} dirPath - 要删除的目录路径
     */
    removeDir(dirPath) {
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    this.removeDir(filePath);
                } else {
                    fs.unlinkSync(filePath);
                }
            });
            fs.rmdirSync(dirPath);
        }
    }

    /**
     * 处理HTML文件
     * @param {string} srcPath - 源文件路径
     * @param {string} destPath - 目标文件路径
     */
    processHtmlFile(srcPath, destPath) {
        const source = fs.readFileSync(srcPath, 'utf8');
        const minified = htmlMinifier.minify(source, {
            removeComments: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        });
        fs.writeFileSync(destPath, minified);
        console.log(`压缩 ${path.relative(this.srcDir, srcPath)}`);
    }

    /**
     * 处理CSS文件
     * @param {string} srcPath - 源文件路径
     * @param {string} destPath - 目标文件路径
     */
    processCssFile(srcPath, destPath) {
        // 检查是否已经是压缩文件
        if (srcPath.endsWith('.min.css')) {
            // 直接复制已压缩的CSS文件
            fs.copyFileSync(srcPath, destPath);
            console.log(`复制 ${path.relative(this.srcDir, srcPath)}`);
        } else {
            // 压缩未压缩的CSS文件
            const source = fs.readFileSync(srcPath, 'utf8');
            const minified = new CleanCSS({}).minify(source);
            fs.writeFileSync(destPath, minified.styles);
            console.log(`压缩 ${path.relative(this.srcDir, srcPath)}`);
        }
    }

    /**
     * 处理JS文件
     * @param {string} srcPath - 源文件路径
     * @param {string} destPath - 目标文件路径
     */
    processJsFile(srcPath, destPath) {
        // 检查是否已经是压缩文件
        if (srcPath.endsWith('.min.js')) {
            // 直接复制已压缩的JS文件
            fs.copyFileSync(srcPath, destPath);
            console.log(`复制 ${path.relative(this.srcDir, srcPath)}`);
        } else {
            // 压缩未压缩的JS文件
            const source = fs.readFileSync(srcPath, 'utf8');
            const minified = minify(source, {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            });

            if (minified.error) {
                console.error(`压缩 ${path.relative(this.srcDir, srcPath)} 时出错:`, minified.error);
                return;
            }

            fs.writeFileSync(destPath, minified.code);
            console.log(`压缩 ${path.relative(this.srcDir, srcPath)}`);
        }
    }

    /**
     * 处理文件的通用函数
     * @param {string} srcPath - 源文件路径
     * @param {string} destPath - 目标文件路径
     */
    processFile(srcPath, destPath) {
        const ext = path.extname(srcPath);

        switch (ext) {
            case '.html':
                this.processHtmlFile(srcPath, destPath);
                break;
            case '.css':
                this.processCssFile(srcPath, destPath);
                break;
            case '.js':
                this.processJsFile(srcPath, destPath);
                break;
            default:
                // 直接复制其他类型文件
                fs.copyFileSync(srcPath, destPath);
                console.log(`复制 ${path.relative(this.srcDir, srcPath)}`);
        }
    }

    /**
     * 递归处理目录
     * @param {string} srcDir - 源目录路径
     * @param {string} destDir - 目标目录路径
     */
    processDir(srcDir, destDir) {
        // 确保目标目录存在
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        const files = fs.readdirSync(srcDir);

        files.forEach(file => {
            const srcPath = path.join(srcDir, file);
            const destPath = path.join(destDir, file);

            const stats = fs.statSync(srcPath);
            if (stats.isDirectory()) {
                // 递归处理子目录
                this.processDir(srcPath, destPath);
            } else {
                // 处理文件
                this.processFile(srcPath, destPath);
            }
        });
    }

    /**
     * 执行构建过程
     */
    build() {
        console.log('正在清理 dist 目录...');
        this.removeDir(this.distDir);

        console.log('开始构建过程...');
        this.processDir(this.srcDir, this.distDir);

        console.log('构建完成！文件已输出到 dist 目录。');
    }
}

// 实例化并执行构建
const builder = new ExtensionBuilder({
    srcDir: 'crxForCSDN',
    distDir: 'dist'
});
builder.build();