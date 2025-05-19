!function() {
    const chromeRedux = _require('chromeRedux');
    const sayHello = _require('sayHello');
    async function main() {
        const AppState = await chromeRedux.get('APP') || {};
        sayHello();
        console.log(AppState.title, '修改前AppState.title');
        await chromeRedux.commit('APP/SET_TITLE', {
            title: '你好 插件' + Date.now()
        });
        const AppState1 = await chromeRedux.get('APP') || {};
        console.log(AppState1.title, '修改后的AppState.title');
    }
    main()
}()