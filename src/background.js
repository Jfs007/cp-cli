


!function () {



    // chrome.runtime.onInstalled.addListener(function () {
    //     /*监听页面切换*/
    //     chrome.declarativeContent.onPageChanged.removeRules(undefined,function () {
    //         console.log('removeRUles');
    //         chrome.declarativeContent.onPageChanged.addRules([{
    //             conditions:[new chrome.declarativeContent.PageStateMatcher({
    //                 pageUrl:{hostEquals:'oceanengine.com'}  
    //             })],
    //             /*显示popup.html页面*/
    //             actions:[new chrome.declarativeContent.ShowPageAction()]
    //         }])
    //     })
    // })




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
        CHANGE_ACCOUNT: changeAccount
    }

    // background.js
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        const handle = ACTION[request.action];
        handle && handle()

    });

}()