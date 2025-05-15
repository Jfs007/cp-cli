const path = require("path");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin");
const InjectManifestPlugin = require("./build/chrome");
const ObfuscatorPlugin = require("./build/obfuscated");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    // 判断当前环境是开发环境还是生产环境
    const isProduction = argv.mode === 'production';
    return {
        mode: "development",
        entry: {},
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname, "dist"),
            clean: true
        },
        // optimization: {
        //     minimize: false, // 不启用默认的 TerserPlugin 最小化
        // },
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
                manifestPath: "src/manifest.json",
                contentScripts: "src/content-scripts"
            }),
            isProduction ? new ObfuscatorPlugin({
                excludeDirs: ['assets/lib']

            }) : null,
        ].filter(_ => _),

       

        watch: true,

    }
};
