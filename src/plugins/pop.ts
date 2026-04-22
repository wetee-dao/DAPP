import { createApp, defineAsyncComponent } from "vue"
import AddPop from '../pages/pop/addPop.vue'
import LoadingBox from '../components/loading.vue'
import ProjectMenu from '../pages/pop/projectMenu.vue'
import i18n from '../i18n'

export default {
  install: function (app: any) {
    app.config.globalProperties.$AddPop = (router: Object, store: Object, close: Function) => {
      return openPop(app, router, store, AddPop, "addPop", {}, close)
    };

    app.config.globalProperties.$AddService = (router: Object, store: Object, createType: String, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/substrate/addService.vue'));
      return openPop(app, router, store, c, "addService", { createType: createType }, close)
    };

    app.config.globalProperties.$DeployClawAgent = (router: Object, store: Object, ps: any, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/claw/deployAgent.vue'));
      return openPop(app, router, store, c, "deployClawAgent", ps || {}, close)
    };

    app.config.globalProperties.$EditContainer = (router: Object, store: Object,ps: any, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/substrate/editContainer.vue'));
      return openPop(app, router, store, c, "editContainer", ps, close)
    };

    // app.config.globalProperties.$AddTask = (router: Object, store: Object, close: Function) => {
    //   const c = defineAsyncComponent(() => import('../pages/pop/addTask.vue'));
    //   return openPop(app, router, store, c, "addTask", {}, close)
    // };

    // app.config.globalProperties.$AddGpuService = (router: Object, store: Object, close: Function) => {
    //   const c = defineAsyncComponent(() => import('../pages/pop/addGpuService.vue'));
    //   return openPop(app, router, store, c, "addGpuService", {}, close)
    // };

    app.config.globalProperties.$Addink = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/substrate/addInk.vue'));
      return openPop(app, router, store, c, "addInk", {}, close)
    };

    app.config.globalProperties.$AddSecret = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/substrate/addSecret.vue'));
      return openPop(app, router, store, c, "addSecret", {}, close)
    };

    app.config.globalProperties.$AddDisk = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/substrate/addDisk.vue'));
      return openPop(app, router, store, c, "addDisk", {}, close)
    };

    app.config.globalProperties.$AddProject = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/addProject.vue'));
      return openPop(app, router, store, c, "addProject", {}, close)
    };


    app.config.globalProperties.$ProjectSetting = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/projectSetting.vue'));
      return openPop(app, router, store, c, "projectSetting", {}, close)
    };

    app.config.globalProperties.$Build = (router: Object, store: Object, ps: any, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/build.vue'));
      return openPop(app, router, store, c, "Build", ps, close)
    };

    app.config.globalProperties.$OpenProjectMenu = (router: Object, store: Object, event: MouseEvent, item: any, close: Function) => {
      return openPop(app, router, store, ProjectMenu, "projectSetting", { "event": event, "item": item }, close)
    };

    app.config.globalProperties.$Loading = (router: Object, store: Object, ps: any, close: Function) => {
      return openPop(app, router, store, LoadingBox, "Loading", ps, close)
    };
  }
}

export const Loading = (title: string | null): any => {
  return openPop(null, {}, {}, LoadingBox, "xLoading", { title: title }, () => {

  })
};

let pops: any = {};
window.addEventListener('popstate', function (event) {
  for (let i in pops) {
    pops[i]?.close()
  }
  pops = {};
});

function openPop(app: any, router: Object, store: Object, pop: any, popid: string, params: any, close: Function) {
  if (pops[popid]) {
    return
  }
  let messageInstance: any = null;
  let div = document.createElement("div")
  const closeFn = (ps: any) => {
    if (close) {
      try {
        close(ps)
      } catch (e) { }
    }

    if (!pops[popid]) {
      return
    }
    message.unmount()
    document.body.removeChild(div)
    delete pops[popid]
  };

  let message = createApp(pop, {
    close: closeFn,
    router,
    store,
    app,
    ps: params
  })

  // Popup components are mounted as standalone apps, so install the
  // shared i18n instance explicitly for useI18n().
  message.use(i18n)

  if (app?._context) {
    Object.assign(message._context.components, app._context.components)
    Object.assign(message._context.directives, app._context.directives)
    Object.assign(message.config.globalProperties, app.config.globalProperties)
    Object.assign(message._context.provides, app._context.provides)
  }

  div.id = popid
  document.body.appendChild(div)
  messageInstance = message.mount("#" + popid)
  pops[popid] = {
    close: closeFn,
    ins: messageInstance
  };

  return {
    ins: message,
    id: popid,
    close: closeFn
  }
}