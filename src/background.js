


!function () {

    const removeCookie = async (handle = () => { }) => {
        chrome.browsingData.removeCookies({
            origins: [""]
        }, function () {
            handle && handle();
            // chrome.tabs.reload(tab.id);
        });
    };
    async function getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }



    const ACTION = {
       
    }

    // background.js
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        const handle = ACTION[request.action];
        handle && handle(request.data, sendResponse);
        return true;
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.active) {
           
        }
    });





}()