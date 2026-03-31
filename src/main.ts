import { createApp, h } from 'vue';
import 'virtual:svg-icons-register';
import 'element-plus/theme-chalk/dark/css-vars.css';

import App from './App.vue';
import router from './router';
import store from './store';
import i18n, { setI18nLanguage } from './i18n';
import pop from './plugins/pop';
import chain, { chainNetPing, initChainApi } from './plugins/chain';
import './assets/styles/common/reset.scss';
import './assets/styles/common/global.scss';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const m = () => {
  setI18nLanguage(store.state.locale);
  const app = createApp({
    setup() {

    },
    render: () => h(App)
  });

  app.use(pop)
    .use(chain)
    .use(store)
    .use(i18n)
    .use(router)
    .mount('#mainApp');
}

if (store.state.chainId) {
  initChainApi(store.state.chainId)
  m()

  chainNetPing()
} else {
  chainNetPing().then((id) => {
    store.dispatch("setChainId", id)
    initChainApi(id)
    m()
  })
}