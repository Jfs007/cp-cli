const JavaScriptObfuscator = require('javascript-obfuscator');
const { RawSource } = require('webpack-sources');
const fs = require('fs');

const path = require('path');

class WebpackObfuscatorPlugin {
    constructor(options) {
        // this.options = options || {};
        this.excludeDirs = options.excludeDirs || [];
    }
    excludeDirs = []
    apply(compiler) {
        compiler.hooks.compilation.tap('WebpackObfuscatorPlugin', (compilation) => {
            // 确保我们在合适的阶段访问 assets
            compilation.hooks.processAssets.tap(
                {
                    name: 'WebpackObfuscatorPlugin',
                    stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE, // 选择合适的阶段
                },
                (assets) => {
                    // 获取所有 JavaScript 文件
                    Object.keys(assets).forEach((assetName) => {
                        // 排除不需要混淆的文件
                        if (this.shouldExclude(assetName)) {
                            return; // 如果文件被排除，则跳过混淆
                        }

                        if (assetName.endsWith('.js')) {
                            const asset = assets[assetName];
                            // 获取文件内容
                            let source = asset.source();
                           
                            source = Buffer.isBuffer(source) ? source.toString() : source;
                        
                            // 执行 JavaScript 混淆
                            const obfuscatedCode = JavaScriptObfuscator.obfuscate(source, {
                                compact: true,
                                controlFlowFlattening: true,
                                // 你可以根据需要添加更多选项
                            }).getObfuscatedCode();
                          
                            assets[assetName] = new RawSource(obfuscatedCode);
                           
                        }
                    });

                })
        })
    }

    shouldExclude(fileName) {
        // 判断文件是否在排除的目录中
        return this.excludeDirs.some((dir) => fileName.startsWith(dir));
    }
}

module.exports = WebpackObfuscatorPlugin;
