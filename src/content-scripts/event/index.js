//"matches"["https://business.oceanengine.com/*"]
!function () {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        console.log(msg.type, 'msg.type');
        if (msg.type === 'LOCALSTORAGE:GET') {
            injectScript();
            window.addEventListener('message', function listener(event) {
                if (event.data.type === msg.type) {
                    sendResponse(event.data.value);
                    window.removeEventListener('message', listener);
                }
            }, { once: true });
            return true; // ⚠️ 必须 return true 表示异步回调
        }
    });
    function injectScript() {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('assets/localstorage.js');
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }
}()