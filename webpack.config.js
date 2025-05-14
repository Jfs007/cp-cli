const path = require("path");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin");
const InjectManifestPlugin = require("./build/chrome");
const ObfuscatorPlugin = require("./build/obfuscated"); 
const TerserPlugin = require('terser-webpack-plugin');
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
        new ObfuscatorPlugin({
            excludeDirs: ['assets/lib']
           
          }),
        
        
    ],

    optimization: {
        minimizer: [
            // 使用 TerserPlugin 对代码进行混淆压缩
            new TerserPlugin({
                terserOptions: {
                    mangle: true, // 启用混淆
                    compress: {
                        drop_console: true, // 移除 console
                    },
                    output: {
                        comments: false, // 去除注释
                    },
                },
            }),
        ],
    },


    watch: true,

};
