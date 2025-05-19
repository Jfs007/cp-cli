### content-scripts（脚本目录）

    ##### 目录结构如下

    ---- x.script

    ------- index.js(脚本)

    ------- index.json(json会合并manifest.json下的当前content-script)

    ##### 按照文件名索引序列来自动构建manifest.json 如a.script/index.js 会比 b.script/index.js先加载，如需调整顺序需要修改文件名

    ##### 模块导入/导出(注入加载顺序，导入的模块需要在导出模块后加载，如a.script比b.script先加载，那b.script可以导入a.script导出的模块)
    exports.module.xxx;  导出模块
    const xxx = _require('xxx'); 导入模块


### assets/lib (第三方库目录)
    ##### 该目录文件打包后不会被混淆，只会以原始文件打包

### assets/scripts (注入到原始网页的动态scripts目录)

    ##### 文件结构如下
    ``` 
        //[matches]["https://www.youorigin.com/*"] 首行注释用来填写应用网页的网址
        // 自动化函数
        !function() {}()
    ```
### 内置方法
    ##### chromeRedux
    ```
        <!-- 注册store -->
        !function () {
    // 初始化
    const chromeRedux = _require('chromeRedux');
    const App = {
        state: {
            title: '你好 插件'
            
        },
        mutations: {
            SET_TITLE(state, payload = {}) {
                state['title'] = payload.title;
            }
        }
    }
    chromeRedux.registerModule('APP', App);
    chromeRedux.init();
}();
        const chromeRedux = _require('chromeRedux');
        <!-- 获取app store -->
        const AppState = await chromeRedux.get('APP') || {};
        <!-- 修改app store -->
        await chromeRedux.commit('APP/SET_TITLE', {
            title: '你好 插件' + Date.now()
        });
    ```
    
