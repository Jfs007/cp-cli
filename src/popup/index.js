// 通用 fetchData 函数封装
async function fetchData(url, data = {}) {
    try {
        const response = await fetch(url, {
            method: "POST", // 固定为 POST 请求
            headers: {
                "Content-Type": "application/json", // 设置为 JSON 格式,
            },
            body: JSON.stringify(data), // 将数据序列化为 JSON
        });

        if (!response.ok) {
            throw new Error("请求失败，状态码: " + response.status);
        }

        return await response.json(); // 返回解析后的 JSON 数据
    } catch (error) {
        console.log("fetchData 请求出错: " + error.message);
        throw error; // 抛出错误以便外层捕获
    }
}



function copyText(value) {
    // 创建一个新的input元素
    var input = document.createElement("input");

    // 设置input的值
    input.value = value;
    // 将input元素添加到页面中
    document.body.appendChild(input);
    // 选中input中的文本
    input.select();
    input.setSelectionRange(0, 99999); // 对于手机设备
    // 执行复制操作
    document.execCommand("copy");
    // 移除input元素
    document.body.removeChild(input);
}


function authError(error) {
    document.getElementById("msg").style.display = "block";
    document.getElementById("msg").innerHTML = "授权失败";
    document
        .getElementById("msg")
        .setAttribute(
            "class", "msg red"
        );
}




function authSuccess(_cookie) {
    document.getElementById("msg").style.display = "block";
    document.getElementById("msg").innerHTML = "授权成功";
    // console.log(JSON.stringify(_cookie));
    copyText(JSON.stringify(_cookie));
    let successText = document.getElementById("msg");
    successText.setAttribute(
        "class", "msg green"
    )

}

async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

async function getLocalStorage(tab) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { type: 'LOCALSTORAGE:GET' }, (response) => {
            resolve(response);
        });
    })
}

async function getUserInfo(tab) {
    const storage = (await getLocalStorage(tab)) || {};
    const cache_tokens = storage['__Garfish__bp-web____tea_cache_tokens_1892'];
    let { user_unique_id } = JSON.parse(cache_tokens || "{}");
    return { user_unique_id };
}



// 根据域名类型处理逻辑
async function handleDomain(_cookie) {
    if (!_cookie.user_id) return authError({})

    try {




        // if (type === "niu") {
        //     data = await fetchData("https://niu.e.kuaishou.com/rest/esp/owner/info", {});
        //     console.log("niu 返回数据: " + JSON.stringify(data));
        //     params = {...params, type:1, agentId: data.data.specialUser.agentId, userId: data.data.user.userId};
        // } else if (type === "uc") {
        //     data = await fetchData("https://uc.e.kuaishou.com/rest/customer/common/ad-info", {
        //         queryCommonInfoTypeList: ["LOGIN_MODEL"]
        //     });
        //     console.log("uc 返回数据: " + JSON.stringify(data));
        //     params = {...params, type:2, agentId: data.data.loginModel.agentId, userId: data.data.loginModel.userId};
        // } else if (type === "ks") {
        //     data = await fetchData("https://agent.e.kuaishou.com/rest/dsp/agent/infov2", {});
        //     console.log("ks 返回数据: " + JSON.stringify(data));
        //     params = {...params, type:3,
        //         agentId: data.data.adDspAgent.agentId,
        //         agentName: data.data.adDspAgent.agentName,
        //         userId: data.data.adDspAgent.userId};
        // } else {
        //     console.log("未知类型: " + type);
        //     return;
        // }

        // 将最终参数上报到目标接口
        // const response = await fetchData("https://ad.itaored.com/api/iu/ks/saveCookie", params, "POST");
        // console.log("上报参数：" + JSON.stringify(params) + "，上报结果: " + JSON.stringify(response));
        authSuccess(_cookie)
    } catch (error) {
        authError(error)
        console.log("处理域名 " + type + " 时出错: " + error.message);
    }
}

// 获取 Cookie 的通用函数
async function getCookies(paramArr, host) {
    let expire = 10000000000000;
    const tab = await getCurrentTab();
    let { user_unique_id } = await getUserInfo(tab)
    const cookies = await Promise.all(paramArr.map(name => {
        return new Promise((resolve, reject) => {
            chrome.cookies.get({ url: host, name: name }, function (cookies) {
                if (cookies) {
                    if (name === 'trace_log_user_id') {
                        user_unique_id = cookies.value ? cookies.value : user_unique_id;
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
    return {
        value: cookies.filter(cookie => cookie).join("; "),
        expire,
        user_id: user_unique_id


    } // 返回过滤后的 cookies
}
// __Garfish__bp-web____tea_cache_tokens_1892
const _URL_ = 'https://business.oceanengine.com';
const paramArr = ['sessionid', 'sessionid_ss', 'sid_ucp_sso_v1', 'ssid_ucp_sso_v1', 'uid_tt', 'sid_tt', 'trace_log_user_id'];

const removeCookie = async (handle = () => { }) => {
    chrome.browsingData.removeCookies({
        origins: ["https://business.oceanengine.com", "https://oceanengine.com", "https://ad.oceanengine.com", "https://api.feelgood.cn"]
    }, function () {
        handle && handle();
        // chrome.tabs.reload(tab.id);
    });
};


async function changeAccount() {

    const tab = await getCurrentTab();
    removeCookie(() => {
        chrome.tabs.reload(tab.id);
    })



    // const cookieKeys = [
    //     "csrf_session_id",
    //     "csrftoken",
    //     "d_ticket",
    //     "fg_uid",
    //     "is_hit_partitioned_cookie_canary",
    //     "is_hit_partitioned_cookie_canary_ss",
    //     "is_staff_user",
    //     "n_mh",
    //     "odin_tt",
    //     "passport_csrf_token",
    //     "passport_csrf_token_default",
    //     "passport_mfa_token",
    //     "sessionid",
    //     "sessionid_ss",
    //     "sid_guard",
    //     "sid_tt",
    //     "sid_ucp_sso_v1",
    //     "sid_ucp_v1",
    //     "ssid_ucp_sso_v1",
    //     "ssid_ucp_v1",
    //     "sso_uid_tt",
    //     "sso_uid_tt_ss",
    //     "toutiao_sso_user",
    //     "toutiao_sso_user_ss",
    //     "ttwid",
    //     "uid_tt",
    //     "uid_tt_ss",
    //     "x-jupiter-uuid"
    // ];

    // cookieKeys.map(async name => await chrome.cookies.remove({
    //     url: _URL_,
    //     name: name
    // }));

}

function setCookies() {

}

// JS 监听逻辑
$(document).ready(function () {

    // 点击事件监听
    $("#getCookie").click(async function () {

        try {
            // 获取 Cookie 并拼接成字符串
            const _cookie = await getCookies(paramArr, _URL_);
            // 根据类型处理后续逻辑
            await handleDomain(_cookie);
        } catch (error) {
            console.log("获取 Cookie 或处理逻辑时出错: " + error.message);
        }
    });
    $("#changeAccount").click(async function () {
        changeAccount();
    })
});
