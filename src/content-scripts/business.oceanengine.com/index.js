// [matches]["https://business.oceanengine.com/*"]
!function () {

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

}()