const path = require("path");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin");
const InjectManifestPlugin = require("./build/chrome");
const WebpackObfuscator = require("webpack-obfuscator");
module.exports = {
    mode: "development",
    entry: {},
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        clean: true
    },
    optimization: {
        minimize: false, // 不启用默认的 TerserPlugin 最小化
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "src",
                    to: ".",
                    globOptions: {
                        ignore: ["**/manifest.json"] // ✅ 不忽略 scripts
                    }
                }
            ]
        }),
        new InjectManifestPlugin({
            srcScripts: "src/assets/scripts",
            manifestPath: "src/manifest.json"
        }),
        // 配置 webpack-obfuscator 插件
        new WebpackObfuscator({
            exclude: /src\/assets\/lib\/.*/,
            rotateStringArray: true,
            selfDefending: true,  // 自我防护，避免代码被解读
            debugProtection: true,  // 禁止调试
            compact: true,  // 压缩代码
        }, ['bundledMinify']),
        function () {
            this.hooks.done.tap('DonePlugin', (stats) => {
                // 插件完成后，检查 Webpack 的构建信息
                console.log('Webpack build done!');
                console.log('Webpack stats:', stats.toJson());
            });
        },
    ],


    watch: true,

};
