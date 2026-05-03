import { createApp, h } from 'vue';
import 'virtual:svg-icons-register';
import 'element-plus/theme-chalk/dark/css-vars.css';

import App from './App.vue';
import router from './router';
import store from './store';
import i18n, { setI18nLanguage } from './i18n';
import pop from './plugins/pop';
import chain, { initChainApi, ChainNode, chainNodes } from './plugins/chain';
import { Ink } from '@/providers/chainapi/ink';
import {
  bootstrapApplyMainChainContractsFromSlice,
  fetchChainInfoRows,
  normalizeSecretGqlUrl,
  syncInkMainChainContracts,
  type ChainInfoRow,
} from '@/apis/chain-info';
import { resolveRpcUrlForNode } from '@/utils/chain_rpc';
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

function showBootstrapFatal(message: string, err: unknown) {
  console.error('[chain_info]', err)
  const text = document.querySelector('#loader .loading-text')
  if (text) {
    text.textContent = message
    text.classList.add('loading-text--error')
  }
}

function applyChainNodesFromRows(rows: ChainInfoRow[], gqlBase: string) {
  const secretUrl = normalizeSecretGqlUrl(gqlBase)
  const icon = '/dapp/imgs/wetee.svg'
  const built = rows.map((r, i) => {
    const chainId = rows.length > 1 ? `${r.chain_type}-${i}` : r.chain_type
    const urls = Array.isArray(r.urls) ? [...r.urls] : []
    const n = new ChainNode(
      r.network_label || r.chain_type,
      icon,
      'substrate',
      chainId,
      resolveRpcUrlForNode(chainId, urls),
      secretUrl,
      async (addr: string) => {
        // 仅用链 RPC，勿用 $getQueryApi（未连接钱包时 header 等仍会拉余额）
        const native = await Ink.nativeBalance(addr)
        return [native]
      },
    )
    n.subnetContract = (r.subnet_contract ?? '').trim()
    n.cloudContract = (r.cloud_contract ?? '').trim()
    n.rpcUrls = urls
    return n
  })
  chainNodes.length = 0
  chainNodes.push(...built)
}

const bootstrap = async () => {
  try {
    const rawGql = import.meta.env.VITE_SECRET_GQL_URL?.trim()
    if (!rawGql) {
      throw new Error('缺少环境变量 VITE_SECRET_GQL_URL（tee-dsecret GraphQL 基址，如 https://host:30115）')
    }
    const rows = await fetchChainInfoRows(rawGql)
    if (!rows.length) {
      throw new Error('chain_info: 返回列表为空')
    }
    applyChainNodesFromRows(rows, rawGql)
    const saved = store.state.chainId
    const validSaved = typeof saved === 'string' && chainNodes.some((n) => n.chainId === saved)
    if (!validSaved) {
      const firstId = rows.length > 1 ? `${rows[0].chain_type}-0` : rows[0].chain_type
      await store.dispatch('setChainId', firstId)
    }
    await bootstrapApplyMainChainContractsFromSlice(rows)
  } catch (e) {
    showBootstrapFatal('链配置获取失败（chain_info / VITE_SECRET_GQL_URL），应用无法启动。请检查机密服务 GraphQL 与网络。', e)
    return
  }
  syncInkMainChainContracts()

  const id = store.state.chainId as string | null
  if (id && chainNodes.length) {
    initChainApi(id)
    m()
  }
}

bootstrap()