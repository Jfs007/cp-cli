const CDP = require("chrome-remote-interface");
const path = require("path");
const net = require("net");
const { exec } = require("child_process");
const DEBUG_PORT = 9222;
const CHECK_TIMEOUT = 10000; // 10秒超时检测
function startChrome() {
    return new Promise((resolve, reject) => {
        exec(`open -na "Google Chrome" --args --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir=/tmp/chrome-debug-user-data`, (err) => {
            if (err) return reject(err);
            setTimeout(resolve, 3000); // 给3秒钟启动时间
        });
    });
}

async function reloadExtensionById(extensionId) {
    const targets = await CDP.List();
    for (const target of targets) {
      if (
        (target.type === 'background_page' || target.type === 'service_worker') &&
        target.url.startsWith(`chrome-extension://${extensionId}/`)
      ) {
        const client = await CDP({ target });
        const { Runtime } = client;
        try {
          await Runtime.evaluate({ expression: 'chrome.runtime.reload()' });
          console.log(`✅ 插件 ${extensionId} 刷新成功`);
        } catch (err) {
          console.error(`刷新失败: ${err.message}`);
        }
        await client.close();
        return;
      }
    }
    console.error(`❌ 未找到插件 ${extensionId}`);
  }
// 1. 检测远程调试端口是否活跃
function waitForPort(port, timeout) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        function check() {
            const socket = net.createConnection(port, "127.0.0.1");
            socket.on("connect", () => {
                socket.destroy();
                resolve(true);
            });
            socket.on("error", () => {
                socket.destroy();
                if (Date.now() - start > timeout) {
                    reject(new Error(`Timeout: 端口 ${port} 未能启动`));
                } else {
                    setTimeout(check, 300);
                }
            });
        }

        check();
    });
}

// 4. 一体化执行函数
async function ensureChromeAndReload(extensionId) {
    try {
        // 先检测端口
        await waitForPort(DEBUG_PORT, 3000);
        console.log(`远程调试端口 ${DEBUG_PORT} 已在线`);
    } catch {
        console.log("远程调试端口未在线，准备启动 Chrome...");
        await startChrome();
        // 启动后再次确认端口
        await waitForPort(DEBUG_PORT, CHECK_TIMEOUT);
        console.log(`远程调试端口 ${DEBUG_PORT} 已启动`);
    }

    // 进行插件刷新
    const success = await reloadExtensionById(extensionId);
    // if (!success) process.exit(1);
}



module.exports = { ensureChromeAndReload };
