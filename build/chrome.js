const fs = require("fs");
const path = require("path");

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

class ChromePlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync("ChromePlugin", (compilation, callback) => {
            const scriptsDir = path.resolve(this.options.srcScripts);
            const scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith(".js"));

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

            manifest["content_scripts"] = [].concat(manifest.content_scripts || [], [{
                matches: Array.from(allMatches),
                js: ["assets/load-script.js"],
                run_at: "document_start"
            }]);

            // 添加更新后的 manifest 到输出
            const manifestContent = JSON.stringify(manifest, null, 2);
            compilation.assets["manifest.json"] = {
                source: () => manifestContent,
                size: () => manifestContent.length
            };

            callback();
        });
    }
}

module.exports = ChromePlugin;
