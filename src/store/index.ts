import { createStore } from 'vuex'
let userInfo = {}
let keypair: any = {}
let token: string = "";
let theme: string = "";
if (window.localStorage.getItem("userInfo")) {
  userInfo = JSON.parse(window.localStorage.getItem("userInfo") || "{}")
}
if (window.localStorage.getItem("keypair")) {
  keypair = JSON.parse(window.localStorage.getItem("keypair") || "{}")
}
if (window.localStorage.getItem("theme")) {
  theme = window.localStorage.getItem("theme") || "";
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
  },
  mutations: {
    // 第一个参数：默认传入store对象的state
    // 第二个参数：组件中commit传入的第二个参数
    setPath(state, payload) {
      state.currentPath = payload
    },
    setTheme(state, payload) {
      state.theme = payload
    },
    setLoginShow(state, payload) {
      state.isLoginShow = payload
    },
    setUserInfo(state, payload) {
      state.userInfo = payload
    },
    setAccounts(state, payload) {
      state.account = payload
    },
    setScale(state, payload) {
      state.scale = payload
    },
    setKeypair(state, payload) {
      state.keypair = payload
    },
  },
  actions: {
    // 提供了修改state的方法
    // 调用mutations中的方法来修改state(间接修改)
    // 在组件中使用this.$store.dispatch(actions中的方法，数据)
    // actions中的方法再调用store.commit(mutations中的方法，数据)修改state
    setPath(context, param) {
      context.commit('setPath', param)
    },
    setLoginShow(context, param) {
      context.commit('setLoginShow', param)
    },
    setUserInfo(context, param) {
      window.localStorage.setItem("userInfo", JSON.stringify(param));
      context.commit('setUserInfo', param)
    },
    setAccounts(context, param) {
      context.commit('setAccounts', param)
    },
    setScale(context, param) {
      context.commit('setScale', param)
    },
    setKeypair(context, param) {
      let keypair = context.state.keypair;
      keypair[param.address] = param.mnemonic;
      console.log(keypair)
      window.localStorage.setItem("keypair", JSON.stringify(keypair));
      context.commit('setKeypair', keypair)
    },
    setTheme(context, param) {
      window.localStorage.setItem("theme", param);
      context.commit('setTheme', param)
    }
  },
  modules: {
  }
})

export default store;