let AppState = {
    itaored: {

    },
    tiktok: {

    }

}

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
        authSuccess(_cookie);
        const { site, token } = AppState.itaored;
        setTimeout(() => {
            if (!token) {
                window.open(site + 'account/douyin');
            } else {
                window.open(site + 'automate/create')
            }
        }, 230)

    } catch (error) {
        authError(error)
        console.log("处理域名 " + type + " 时出错: " + error.message);
    }
}

// 获取 Cookie 的通用函数
async function getCookies(paramArr, host) {
    let expire = 10000000000000;
    const { user_id } = AppState.tiktok;
    if (!user_id) {
        const tab = await getCurrentTab();
        let { user_unique_id } = await getUserInfo(tab);
        AppState.tiktok.user_id = user_unique_id;
    }

    const cookies = await Promise.all(paramArr.map(name => {
        return new Promise((resolve, reject) => {
            chrome.cookies.get({ url: host, name: name }, function (cookies) {
                if (cookies) {
                    if (name === 'trace_log_user_id') {
                        AppState.tiktok.user_id = cookies.value ? cookies.value : AppState.tiktok.user_id;
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
        user_id: AppState.tiktok.user_id


    } // 返回过滤后的 cookies
}
const _URL_ = 'https://business.oceanengine.com';
const paramArr = ['sessionid', 'sessionid_ss', 'sid_ucp_sso_v1', 'ssid_ucp_sso_v1', 'uid_tt', 'sid_tt', 'trace_log_user_id'];

// const removeCookie = async (handle = () => { }) => {
//     chrome.browsingData.removeCookies({
//         origins: ["https://business.oceanengine.com", "https://oceanengine.com", "https://ad.oceanengine.com", "https://api.feelgood.cn"]
//     }, function () {
//         handle && handle();
//         // chrome.tabs.reload(tab.id);
//     });
// };
// async function changeAccount() {
//     const tab = await getCurrentTab();
//     removeCookie(() => {
//         chrome.tabs.reload(tab.id);
//     })
// }
// JS 监听逻辑
$(document).ready(function () {
    // 点击事件监听
    $("#getCookie").click(async function () {
        const _this = $(this);
        const text = _this.text();

        try {
            _this.text('授权中...');
            // 获取 Cookie 并拼接成字符串
            const _cookie = await getCookies(paramArr, _URL_);
            await chromeRedux.commit('APP/SET_TIKTOK_USERINFO', _cookie);
            // 根据类型处理后续逻辑
            await handleDomain(_cookie);
            _this.text(text);

        } catch (error) {
            _this.text(text);
            console.log("获取 Cookie 或处理逻辑时出错: " + error.message);
        }
    });
    // $("#changeAccount").click(async function () {
    //     changeAccount();
    // });
    $('#plugin-options').click(() => {
        const url = chrome.runtime.getURL('options/index.html');
        window.open(url, 'options');
    });
    async function setup() {
        const tab = await getCurrentTab();
        $("#getCookie").hide();
        $("#changeAccount").hide();
        if (tab.url.indexOf('business.oceanengine.com') < 0) return;
        try {
            AppState = await chromeRedux.get('APP') || {};
            let { user_unique_id } = await getUserInfo(tab);
            AppState.tiktok.user_id = user_unique_id;
            if (!user_unique_id) {
                return chrome.tabs.reload(tab.id);
            }
            chromeRedux.commit('APP/SET_TIKTOK_USERINFO', AppState.tiktok);
            // 无论是否捞到小助手的token都展示授权按钮
            $("#getCookie").show();
        } catch (error) {
            console.log(error, 'errro');
        }
    }
    setup();


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'PAGE_LOADED') {
            // 处理 Tab 加载完成的事件
            setup();
        }
    });









});
