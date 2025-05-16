// [matches]["https://business.oceanengine.com/*"]
!function () {
    const { auth } = exports.module;
    function changeAccount(e) {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
        chrome.runtime.sendMessage(
            { action: 'CHANGE_ACCOUNT' },
            function (response) {
                console.log('Cookie removal response:', response);
            }
        );
    }
    function isHeaderUserCardItem(target) {
        return target.className.indexOf('index_header-user-card-layout-item') > -1;
    }

    function getHeaderUserCardItem(target) {
        if (isHeaderUserCardItem(target)) return target;
        if (isHeaderUserCardItem(target.parentNode)) return target.parentNode;
        return null;
    }
    let headerCardUser = null;
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (!headerCardUser) {
            headerCardUser = document.querySelector('#bp-header-user-card');
        }
        if (headerCardUser.contains(target)) {
            const itemEle = getHeaderUserCardItem(target);
            if (itemEle) {
                const text = itemEle.innerText;
                if (text.indexOf('退出账号') > -1) {
                    changeAccount(e);
                }
            }
        }


    }, true);

    function getUserInfo() {
        const storage = localStorage.getItem('__Garfish__bp-web____tea_cache_tokens_1892');
        const { user_unique_id } = JSON.parse(storage || "{}");
        return { user_unique_id };
    }
    
    auth.doAuth({ host: 'business.oceanengine.com', value: getUserInfo() });




    // onMessage
    const onMessage = {
        ROUTE_WATCH: (a, b) => {

        }
    }
    window.addEventListener('message', (event) => {
        const { type, data } = event.data;
        onMessage[type] && onMessage[type](data);
    });


}()