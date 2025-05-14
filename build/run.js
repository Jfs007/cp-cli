const { spawn } = require("child_process");
const chokidar = require("chokidar");
const path = require("path");

const scriptsDir = path.resolve(__dirname, "src");

let webpackProcess = null;

function startWebpack() {
  if (webpackProcess) {
    webpackProcess.kill();
  }
  webpackProcess = spawn("npx", ["webpack", "--watch", "--config", "webpack.config.js"], {
    stdio: "inherit",
    shell: true
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
