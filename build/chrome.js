const fs = require("fs");
const path = require("path");
function deepMerge(target, source) {
    for (const key in source) {
        if (Array.isArray(source[key])) {
            if (!target[key]) {
                target[key] = [];
            }
            // 合并数组，并去重
            target[key] = Array.from(new Set([...target[key], ...source[key]]));
        } else if (typeof source[key] === 'object' && source[key] !== null) {
            if (!target[key]) {
                target[key] = {};
            }
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

// 去重函数，基于 matches 字段去重
function uniqueByMatches(contentScripts) {
    const seen = new Set();
    return contentScripts.filter(item => {
        if (seen.has(item.matches)) {
            return false;
        }
        seen.add(item.matches);
        return true;
    });
}

function extractMatchesFromScript(scriptPath) {
    const content = fs.readFileSync(scriptPath, "utf-8");
    const matchRegex = /\/\/\s*\[matches\]\s*(\[.*?\])/;
    const match = content.match(matchRegex);
    if (match) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.error(`Failed to parse matches from ${scriptPath}`);
        }
    }
    return [];
}


// 获取目录下所有的子目录名
function getContentScriptsPath(dirPath, dirname) {
    const subDirs = [];

    // 读取目录下的所有文件和子目录
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);
        // 判断是否是目录
        if (stats.isDirectory()) {
            subDirs.push(dirname + '/' + file + '/index.js');  // 如果是目录，则添加到结果数组中
        }
    });

    return subDirs;
}

class ChromePlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync("ChromePlugin", (compilation, callback) => {
            const scriptsDir = path.resolve(this.options.srcScripts);
            const scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith(".js"));


            const contentScriptsConfig = this.generateContentScriptsConfig();

            // 生成 load-script.js 内容
            const scriptPaths = scriptFiles.map(f => `assets/scripts/${f}`);
            const loadScriptContent = `(function(){
    const scripts = ${JSON.stringify(scriptPaths)};
    function injectScript(scriptPath){
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL(scriptPath);
        script.onload = function(){ this.remove(); };
        script.onerror = function(e){ console.error("❌ 插入失败", e); };
        document.documentElement.appendChild(script);
    }
    scripts.map(injectScript);
})();`;

            // 添加到构建产物
            compilation.assets["assets/load-script.js"] = {
                source: () => loadScriptContent,
                size: () => loadScriptContent.length
            };

            // 更新 manifest.json
            const manifestPath = path.resolve(this.options.manifestPath);
            const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

            // 合并所有 matches
            const allMatches = new Set();
            scriptFiles.forEach(f => {
                const matches = extractMatchesFromScript(path.join(scriptsDir, f));
                matches.forEach(m => allMatches.add(m));
            });



            manifest["web_accessible_resources"] = [].concat(manifest.web_accessible_resources || [], [{
                resources: scriptPaths,
                matches: Array.from(allMatches)
            }]);
            const scripts = [].concat(...manifest.content_scripts || [], ...contentScriptsConfig || [],);

            if (Array.from(allMatches).length) {
                scripts.push({
                    matches: Array.from(allMatches),
                    js: ["assets/load-script.js"],
                    run_at: "document_start"
                })
            }




            manifest["content_scripts"] = uniqueByMatches(scripts);
            manifest["content_scripts"].map(scripts => {
                (scripts.matches || []).forEach(match => allMatches.add(match));
            });
            const mouduleCode = `window.exports = window.exports || {};
window.exports.module = Object.assign({}, window.exports.module || {});
window._require = window._require || ((moduleName) => { return window.exports.module[moduleName]; })
`

            // 添加到构建产物
            compilation.assets["content-scripts/@module/index.js"] = {
                source: () => mouduleCode,
                size: () => mouduleCode.length
            };
            // cp_modules;
            const cpModulesConfig = this.generateCpModulesConfig(Array.from(allMatches));
            cpModulesConfig.map(config => {
                manifest["content_scripts"].unshift(config);
            })

            manifest["content_scripts"].unshift({
                matches: Array.from(allMatches),
                js: ["content-scripts/@module/index.js"],
                run_at: "document_start"
            });


            // 添加更新后的 manifest 到输出
            const manifestContent = JSON.stringify(manifest, null, 2);
            compilation.assets["manifest.json"] = {
                source: () => manifestContent,
                size: () => manifestContent.length
            };

            callback();
        });
    }
    generateCpModulesConfig(matches = []) {
        const cpConfigs = [];
        const cpPath = 'src/cp_modules';
        const cpModulesDir = path.resolve(process.cwd(), cpPath);
        // 读取 content-scripts 目录下的子目录
        const directories = fs.readdirSync(cpModulesDir).filter(file => {
            return fs.statSync(path.join(cpModulesDir, file)).isDirectory();
        });
        directories.forEach(directory => {
            const indexFile = path.join(cpPath, directory, 'index.js');
            const indexJsonFile = path.join(cpModulesDir, directory, 'index.json');
            // 确保 index.js 存在
            if (fs.existsSync(indexFile)) {
                let contentScript = {
                    matches: matches,  // 假设按照目录名生成匹配规则
                    js: [indexFile.replace('src/', '')],
                };
                // 合并 index.json 配置
                if (fs.existsSync(indexJsonFile)) {
                    const indexJsonConfig = JSON.parse(fs.readFileSync(indexJsonFile, 'utf-8'));
                    contentScript = deepMerge(indexJsonConfig, contentScript);
                }
                cpConfigs.push(contentScript);
            }
        });
        return cpConfigs;
    }


    generateContentScriptsConfig() {
        const contentScriptsConfig = [];
        let { contentScripts } = this.options;
        const contentScriptsDir = path.resolve(process.cwd(), contentScripts);
        // 读取 content-scripts 目录下的子目录
        const directories = fs.readdirSync(contentScriptsDir).filter(file => {
            return fs.statSync(path.join(contentScriptsDir, file)).isDirectory();
        });
        // 遍历每个子目录
        directories.forEach(directory => {
            const indexFile = path.join(contentScripts, directory, 'index.js');
            const indexJsonFile = path.join(contentScriptsDir, directory, 'index.json');
            // 确保 index.js 存在
            if (fs.existsSync(indexFile)) {
                let contentScript = {
                    matches: [`https://${directory}/*`],  // 假设按照目录名生成匹配规则
                    js: [indexFile.replace('src/', '')],
                };
                // 合并 index.json 配置
                if (fs.existsSync(indexJsonFile)) {
                    const indexJsonConfig = JSON.parse(fs.readFileSync(indexJsonFile, 'utf-8'));
                    contentScript = deepMerge(indexJsonConfig, contentScript);
                }
                contentScriptsConfig.push(contentScript);
            }
        });

        return contentScriptsConfig;
    }
}

module.exports = ChromePlugin;
