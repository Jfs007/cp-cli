// [matches]["https://yourorigin.com/*"]
!function () {
    let lastUrl = location.href;
    // 路由变化监听器
    function watchRoute(callback) {
        const check = () => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                const fromUrl = lastUrl;
                lastUrl = currentUrl;
                callback({ to: currentUrl, from: fromUrl });
            }
        };

        const rawPushState = history.pushState;
        const rawReplaceState = history.replaceState;

        history.pushState = function (...args) {
            rawPushState.apply(this, args);
            check();
        };

        history.replaceState = function (...args) {
            rawReplaceState.apply(this, args);
            check();
        };

        window.addEventListener('popstate', check);
    };
    // watchRoute
    watchRoute((data) => {
        window.postMessage({ type: 'ROUTE_WATCH', data: data }, "*");
    })

}()