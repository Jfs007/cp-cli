const { spawn } = require("child_process");
const chokidar = require("chokidar");
const path = require("path");
const { ensureChromeAndReload } = require('./reload-cp');

const scriptsDir = path.resolve(__dirname, "src");
const packageJson = require('../package.json');
let webpackProcess = null;

function startWebpack() {
  if (webpackProcess) {
    webpackProcess.kill();
  }
  webpackProcess = spawn("npx", ["webpack", "--watch", "--config", "webpack.config.js"], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true
  });

  // 监听 webpack 输出，判断是否编译完成
  webpackProcess.stdout?.on("data", async (data) => {
    
    const output = data.toString();

    if (output.includes("compiled successfully")) {
      // 你的插件本地目录
      await ensureChromeAndReload(packageJson.extensionId);
    }
  });
}

startWebpack();

const watcher = chokidar.watch(scriptsDir, {
  ignoreInitial: true,
});

watcher.on("add", (filePath) => {
  console.log(`📦 新增脚本文件: ${filePath}，重启 webpack...`);
  startWebpack();
});
