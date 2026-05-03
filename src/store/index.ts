import { createStore } from 'vuex'
let userInfo = {}
let keypair: any = {}
let theme: string = "";
let chainId: any = null;
let networkRpcEpoch = 0;
let locale: string = 'en-US';
if (window.localStorage.getItem("userInfo")) {
  userInfo = JSON.parse(window.localStorage.getItem("userInfo") || "{}")
}
if (window.localStorage.getItem("keypair")) {
  keypair = JSON.parse(window.localStorage.getItem("keypair") || "{}")
}
if (window.localStorage.getItem("theme")) {
  theme = window.localStorage.getItem("theme") || "";
}
if (window.localStorage.getItem("chainId")) {
  chainId = window.localStorage.getItem("chainId") ? JSON.parse(window.localStorage.getItem("chainId")||"{}"): null;
}
if (window.localStorage.getItem("locale")) {
  locale = window.localStorage.getItem("locale") || "en-US";
}

const store = createStore({
  state: {
    currentPath: '',
    userInfo: userInfo,
    theme: theme,
    account: [],
    isLoginShow: false,
    keypair: keypair,
    scale: 1,
    chainId: chainId,
    /** 仅切换 RPC（chainId 不变）时递增，供 header 等刷新余额 */
    networkRpcEpoch: networkRpcEpoch,
    setPins: {},
    locale: locale,
  },
  mutations: {
    // 第一个参数：默认传入store对象的state
    // 第二个参数：组件中commit传入的第二个参数
    setPath(state: any, payload: any) {
      state.currentPath = payload
    },
    setTheme(state: any, payload: any) {
      state.theme = payload
    },
    setLoginShow(state: any, payload: any) {
      state.isLoginShow = payload
    },
    setUserInfo(state: any, payload: any) {
      state.userInfo = payload
    },
    setAccounts(state: any, payload: any) {
      state.account = payload
    },
    setScale(state: any, payload: any) {
      state.scale = payload
    },
    setKeypair(state: any, payload: any) {
      state.keypair = payload
    },
    setChainId(state: any, payload: any) {
      state.chainId = payload
    },
    setPins(state: any, payload: any) {
      state.setPins = payload
    },
    setLocale(state: any, payload: any) {
      state.locale = payload
    },
    bumpNetworkRpcEpoch(state: any) {
      state.networkRpcEpoch = (state.networkRpcEpoch || 0) + 1
    }
  },
  actions: {
    // 提供了修改state的方法
    // 调用mutations中的方法来修改state(间接修改)
    // 在组件中使用this.$store.dispatch(actions中的方法，数据)
    // actions中的方法再调用store.commit(mutations中的方法，数据)修改state
    setPath(context: any, param: any) {
      context.commit('setPath', param)
    },
    setLoginShow(context: any, param: any) {
      context.commit('setLoginShow', param)
    },
    setUserInfo(context: any, param: any) {
      window.localStorage.setItem("userInfo", JSON.stringify(param));
      context.commit('setUserInfo', param)
    },
    setAccounts(context: any, param: any) {
      context.commit('setAccounts', param)
    },
    setScale(context: any, param: any) {
      context.commit('setScale', param)
    },
    setKeypair(context: any, param: any) {
      let keypair = context.state.keypair;
      keypair[param.address] = param.mnemonic;
      window.localStorage.setItem("keypair", JSON.stringify(keypair));
      context.commit('setKeypair', keypair)
    },
    setTheme(context: any, param: any) {
      window.localStorage.setItem("theme", param);
      context.commit('setTheme', param)
    },
    setChainId(context: any, param: any) {
      if (!param) {
        window.localStorage.removeItem("chainId");
      }else{
        window.localStorage.setItem("chainId", JSON.stringify(param));
      }
      context.commit('setChainId', param)
    },
    setPins(context: any, param: any) {
      context.commit('setPins', param)
    },
    setLocale(context: any, param: any) {
      window.localStorage.setItem("locale", param);
      context.commit('setLocale', param)
    }
  },
  modules: {
  }
})

export default store;