import { createApp, h } from 'vue';

import App from './App.vue';
import router from './router';
import store from './store';
import pop from './plugins/pop';
import chain from './plugins/chain';
import './assets/styles/common/reset.scss';
import './assets/styles/common/global.scss';
import 'element-plus/theme-chalk/dark/css-vars.css'

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

const app = createApp({
  setup() {
    // provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App)
});

app.use(pop)
  .use(chain)
  .use(store)
  .use(router)
  .mount('#mainApp');
