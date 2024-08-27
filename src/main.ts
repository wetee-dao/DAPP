import './public-path';
import { createApp, h, toRaw } from 'vue';
import { registerMicroApps, start, initGlobalState, MicroAppStateActions } from 'qiankun';

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

// 定义全局下发的数据
const initialState = {
  // 当前登录用户
  userInfo: toRaw(store.state.userInfo),
  // 全局配置
  globalConfig: '全局配置',
  // 路由数据
  routers: toRaw(router)
};

// 初始化全局下发的数据
export const qiankunActions: MicroAppStateActions = initGlobalState(initialState);

// 检测全局下发数据的改变
qiankunActions.onGlobalStateChange((state: Record<string, any>, prev: Record<string, any>) => {
  // state: 变更后的状态; prev 变更前的状态
  console.log('主应用', state, prev);
  // 修改全局下发的数据
  for (const key in state) {
    if (Object.prototype.hasOwnProperty.call(state, key)) {
      const element = state[key];
      initialState[key as keyof typeof initialState] = element;
    }
  }
});

const apps = (window as any).apps.map((v: any) => {
  v.props.globalState = initialState;
  return v;
});

const config: any = {
  beforeLoad: [
    (app: any) => {
      console.log('%c子项目挂载前', 'background:#0f0 ; padding: 1px; border-radius: 3px;  color: #fff', app);
    }
  ], // 挂载前回调
  beforeMount: [
    (app: any) => {
      console.log('%c子项目挂载后', 'background:#f1f ; padding: 1px; border-radius: 3px;  color: #fff', app);
    }
  ], // 挂载后回调
  afterUnmount: [
    (app: any) => {
      if (app.name == "app_contract") {
        window.location.reload()
        document.documentElement.style.fontSize = ""
      }
      console.log('%c子项目卸载后', 'background:#a7a ; padding: 1px; border-radius: 3px;  color: #fff', app);
    }
  ] // 卸载后回调
};

registerMicroApps(apps, config);

start({
  sandbox: { strictStyleIsolation: true }, // 可选，是否开启沙箱，默认为 true。
  singular: true // 可选，是否为单实例场景，单实例指的是同一时间只会渲染一个微应用。默认为 true。
});

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
