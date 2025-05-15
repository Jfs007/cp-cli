


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

    const ACTION = {
        CHANGE_ACCOUNT: changeAccount,
        OPEN_POPUP() {
            chrome.action.openPopup();
        }
    }

    // background.js
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        const handle = ACTION[request.action];
        handle && handle()
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.active) {
            // 如果标签页在加载状态，并且是当前活动的标签页，触发事件
            chrome.runtime.sendMessage({ type: 'PAGE_LOADED', tabId: tabId });
        }
    });





}()