const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

class WebpackObfuscatorPlugin {
    constructor(options) {
        // this.options = options || {};
        this.excludeDirs = options.excludeDirs || [];
    }
    excludeDirs = []

    apply(compiler) {
        compiler.hooks.emit.tapAsync('WebpackObfuscatorPlugin', (compilation, callback) => {

            // 获取所有 JavaScript 文件
            Object.keys(compilation.assets).forEach((assetName) => {
                // 排除不需要混淆的文件
                if (this.shouldExclude(assetName)) {
                    return; // 如果文件被排除，则跳过混淆
                }

                if (assetName.endsWith('.js')) {
                    const asset = compilation.assets[assetName];

                    // 获取文件内容
                    let source = asset.source();

                    // 执行 JavaScript 混淆
                    const obfuscatedCode = JavaScriptObfuscator.obfuscate(source, {
                        compact: true, // 开启紧凑模式，减少代码体积
                        controlFlowFlattening: true, // 开启控制流扁平化，增加混淆程度
                        controlFlowFlatteningThreshold: 1, // 控制流扁平化的强度，范围从 0 到 1，1 表示强度最大
                        deadCodeInjection: true, // 插入无用代码，增加代码混淆的复杂性
                        debugProtection: true, // 启用调试保护，阻止在控制台打印调试信息
                        disableConsoleOutput: true, // 禁用 `console.log` 等调试输出
                        renameGlobals: false, // 禁止混淆全局变量
                        stringArray: true, // 启用字符串数组化，将字符串存储在数组中，增强混淆
                        stringArrayThreshold: 0.75, // 设定字符串数组化的阈值
                        transformObjectKeys: true, // 启用对象键名混淆
                        rotateStringArray: true,
                        // 你可以根据需要添加更多选项
                    }).getObfuscatedCode();

                    // 用混淆后的代码替换原始文件
                    compilation.assets[assetName] = {
                        source: () => obfuscatedCode,
                        size: () => obfuscatedCode.length
                    };
                }
            });

            // 完成混淆后，调用回调继续编译
            callback();
        });
    }
    shouldExclude(fileName) {
        // 判断文件是否在排除的目录中
        return this.excludeDirs.some((dir) => fileName.startsWith(dir));
    }
}

module.exports = WebpackObfuscatorPlugin;
