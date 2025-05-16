


!function () {

    const removeCookie = async (handle = () => { }) => {
        chrome.browsingData.removeCookies({
            origins: ["https://business.oceanengine.com", "https://oceanengine.com", "https://ad.oceanengine.com", "https://api.feelgood.cn"]
        }, function () {
            handle && handle();
            // chrome.tabs.reload(tab.id);
        });
    };
    async function getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }

    async function changeAccount() {

        const tab = await getCurrentTab();
        removeCookie(() => {
            chrome.tabs.reload(tab.id);
        })
    };

    async function getCookies(options, sendResponse) {
        let expire = 10000000000000;
        const cookies = await Promise.all(options.keys.map(name => {
            return new Promise((resolve, reject) => {
                chrome.cookies.get({ url: options.url, name: name }, function (cookies) {
                    if (cookies) {
                        if (name === 'trace_log_user_id') {
                            resolve(null);
                        } else {
                            expire = Math.min(expire, Math.floor(cookies.expirationDate * 1000))
                            resolve(name + "=" + cookies.value);
                        }
                    } else {
                        resolve(null); // 如果没有找到cookie，则返回null
                    }
                });
            });
        }));
        const cookie = {
            value: cookies.filter(cookie => cookie).join("; "),
            expire
        } // 返回过滤后的 cookies
        sendResponse({
            data: cookie
        });
        return cookie;
    }

    const ACTION = {
        CHANGE_ACCOUNT: changeAccount,
        OPEN_POPUP() {
            chrome.action.openPopup();
        },
        GET_COOKIE: getCookies
    }

    // background.js
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        const handle = ACTION[request.action];
        handle && handle(request.data, sendResponse);
        return true;
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.active) {
            // 如果标签页在加载状态，并且是当前活动的标签页，触发事件
            chrome.runtime.sendMessage({ type: 'PAGE_LOADED', tabId: tabId });
        }
    });





}()