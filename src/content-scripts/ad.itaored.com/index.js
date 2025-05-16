!function () {
    const { auth } = exports.module;
    function getUserInfo() {
        const valueString = localStorage.getItem('TOKEN');
        const value = JSON.parse(valueString || "{}");
        return {
            token: value.value
        }
    }
    async function setUserInfo() {
        const valueString = localStorage.getItem('TOKEN');
        const value = JSON.parse(valueString || "{}");
        chromeRedux.commit('APP/SET_ADITAOREAD_USERINFO', {
            token: value.value
        });
    }
    async function setup() {
        try {
        } catch (error) {
            console.log(error, 'error');
           
        }

    }

    setup();




    const onMessage = {
        ROUTE_WATCH: () => {
            auth.doAuth({ host: 'ad.itaored.com', value: getUserInfo() });
        }
    }
    window.addEventListener('message', (event) => {
        const { type, data } = event.data;
        onMessage[type] && onMessage[type](data);
    });

    window.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setUserInfo();  
        } 
    });


    // 设置 localStorage 中的值
    // localStorage.setItem('yourKey', 'newValue');
}()