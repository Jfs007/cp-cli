
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
!function () {
    const sayHello = () => {
        return console.log('hello world');
    }
    exports.module.sayHello = sayHello;
}()