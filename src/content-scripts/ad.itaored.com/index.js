!function () {


    async function setUserInfo() {
        const valueString = localStorage.getItem('TOKEN');
        const value = JSON.parse(valueString || "{}");
        chromeRedux.commit('APP/SET_ADITAOREAD_USERINFO', {
            token: value.value
        });
    }

    async function setup() {
        try {

            await setUserInfo();
            // const AppState = await chromeRedux.get('APP') || {};
            
            // const res = await fetch(`${window.origin}/api/media-account/list?accountType=2&channel=4&pageNum=1&pageSize=10000`, {
            //     method: 'GET',
            //     headers: {
            //         "Content-Type": "application/json", // 设置为 JSON 格式,
            //         "accesstoken": AppState.adItaored.token
            //     },
            // });
            // const { data } = await res.json() || {};
            // const hasMatch = (data || []).find(({ accountUin }) => {
            //     return AppState.tiktok.user_id === accountUin;
            // });
           
            // if (!hasMatch) {

            // } else {
            //     // 发送
            // }
        } catch (error) {
            console.log(error, 'error');
           
        }

    }

    setup();




    const onMessage = {
        ROUTE_WATCH: () => {
            setUserInfo();
        }
    }
    window.addEventListener('message', (event) => {
        const { type, data } = event.data;
        onMessage[type] && onMessage[type](data);
    });

    window.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面变为不可见时执行的代码
        } else {
            setUserInfo();
            // 页面变为可见时执行的代码
        }
        // 在这里执行你的代码
    });


    // 设置 localStorage 中的值
    // localStorage.setItem('yourKey', 'newValue');
}()