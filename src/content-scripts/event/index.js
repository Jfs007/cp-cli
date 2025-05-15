//[matches]["https://business.oceanengine.com/*"]
!function () {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

        if (msg.type === 'LOCALSTORAGE:GET') {
            
            window.addEventListener('message', function listener(event) {
                if (event.data.type === msg.type) {
                    sendResponse(event.data.value);
                    window.removeEventListener('message', listener);
                }
            }, { once: true });
            injectScript();
            return true; // ⚠️ 必须 return true 表示异步回调
        }
    });
    function injectScript() {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('assets/localstorage.js');
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    };

     
}()