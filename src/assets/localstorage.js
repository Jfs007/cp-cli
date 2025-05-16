// [matches]["https://business.oceanengine.com/*"]
(function () {
    const storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      storage[key] = localStorage.getItem(key);
    }
    window.postMessage({
      type: 'LOCALSTORAGE:GET',
      value: storage
    }, '*');
  })();
  