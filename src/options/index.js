const { defineComponent, createApp, h, reactive, ref } = Vue;

window.addEventListener('load', () => {

    const app = createApp(defineComponent({
        setup() {

            const state = reactive({
                
            });
            async function set() {
                
            };
            set();

            return () => h('div', {
               
            }, '')
        }
    }));

    app.use(naive);
    const el = document.getElementById('app');
    el.style = 'padding: 30px 12px;width: 1140px;margin: 0 auto'
    app.mount(el);

})







