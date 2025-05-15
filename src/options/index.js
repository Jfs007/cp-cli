const { defineComponent, createApp, h, reactive, ref } = Vue;

window.addEventListener('load', () => {

    const app = createApp(defineComponent({
        setup() {

            const state = reactive({
                itaoreadUrl: '',
                app: {
                    
                
                }
            });
            async function set() {
                const appInfo = await chromeRedux.get('APP') || {};
                state.app = appInfo;
                state.itaoreadUrl = appInfo.adItaored.site;
                console.log(appInfo, 'appInfo');
            };
            set();

            return () => h(naive.NForm, {
                labelPlacement: "left",
                labelWidth: 110,
                style: {
                    width: '400px',
                }
            }, {
                default: () => [
                    h(naive.NFormItem, {
                        label: '桃红站点',
                    }, {
                        default: () => h(naive.NSelect, {
                            options: [{ label: "https://ad.itaored.com/", value: 'https://ad.itaored.com/' },
                            { label: "https://testad.itaored.com/", value: "https://testad.itaored.com/" },
                            { label: "http://localhost:9002/", value: "http://localhost:9002/", }],
                            value: state.itaoreadUrl,
                            onUpdateValue(value) {
                                state.itaoreadUrl = value;
                                chromeRedux.commit('APP/SET_ADITAOREAD_USERINFO', { site: value });
                            }
                        })
                    }),
                ]
            })
        }
    }));

    app.use(naive);
    const el = document.getElementById('app');
    el.style = 'padding: 30px 12px;width: 1140px;margin: 0 auto'
    app.mount(el);

})







