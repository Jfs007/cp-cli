!function () {

    const Action = {
        GET_COOKIE: {
            url: 'https://business.oceanengine.com',
            keys: ['sessionid', 'sessionid_ss', 'sid_ucp_sso_v1', 'ssid_ucp_sso_v1', 'uid_tt', 'sid_tt', 'trace_log_user_id']
        }
    }
    function getActionMessage(options = {}) {
        return new Promise(resolve => {
            chrome.runtime.sendMessage({
                action: options.action,
                data: options.data
            }, (value) => {
                resolve(value)
            });
        })

    }
    
    async function doAuth(params = {}) {
        const AppState = await chromeRedux.get('APP') || {};
        const res = await getActionMessage({
            action: 'GET_COOKIE',
            data: Action.GET_COOKIE
        });
        const cookie = res.data || {};
        // const { user_unique_id } = getUserInfo();
        if(params.host === 'business.oceanengine.com') {
            const { user_unique_id } = params.value;
            cookie.user_id = user_unique_id;
        }
        if(params.host === 'ad.itaored.com') {
            
            const { token } = params.value;
            AppState.itaored.token = token;
        }
       
    
        AppState.tiktok = cookie;
        chromeRedux.commit('APP/AUTH', AppState);
        /**
         *  1. 打开巨量点击授权，无itaored.token 跳转到 itaored 进行授权
         *  2. 每次进入页面进行授权，无itaored.token 不跳转 进入无itaored 进行授权
         * 
         * 
         * 
         * 
         */
    };
    exports.module.auth = {
        doAuth
    }

}()