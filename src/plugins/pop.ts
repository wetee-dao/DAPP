import { createApp, defineAsyncComponent } from "vue"
import AddPop from '../pages/pop/addPop.vue'
import LoadingBox from '../components/loading.vue'
import ProjectMenu from '../pages/pop/projectMenu.vue'

export default {
  install: function (app: any) {
    app.config.globalProperties.$AddPop = (router: Object, store: Object, close: Function) => {
      return openPop(app, router, store, AddPop, "addPop", {}, close)
    };

    app.config.globalProperties.$AddService = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/addService.vue'));
      return openPop(app, router, store, c, "addService", {}, close)
    };

    app.config.globalProperties.$AddTask = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/addTask.vue'));
      return openPop(app, router, store, c, "addTask", {}, close)
    };

    app.config.globalProperties.$AddGpuService = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/addGpuService.vue'));
      return openPop(app, router, store, c, "addGpuService", {}, close)
    };

    app.config.globalProperties.$Addink = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/addInk.vue'));
      return openPop(app, router, store, c, "addInk", {}, close)
    };

    app.config.globalProperties.$AddProject = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/addProject.vue'));
      return openPop(app, router, store, c, "addProject", {}, close)
    };

    app.config.globalProperties.$ProjectSetting = (router: Object, store: Object, close: Function) => {
      const c = defineAsyncComponent(() => import('../pages/pop/projectSetting.vue'));
      return openPop(app, router, store, c, "projectSetting", {}, close)
    };

    app.config.globalProperties.$OpenProjectMenu = (router: Object, store: Object, event: MouseEvent, item: any, close: Function) => {
      return openPop(app, router, store, ProjectMenu, "projectSetting", { "event": event, "item": item }, close)
    };

    app.config.globalProperties.$Loading = (router: Object, store: Object, ps:any, close: Function) => {
      return openPop(app, router, store, LoadingBox, "Loading", ps, close)
    };
  }
}

export const Loading = (title:string|null): any => {
  return openPop(null, {}, {}, LoadingBox, "xLoading", {title:title}, () => {

  })
};

let pops: any = {};
window.addEventListener('popstate', function(event) {
  for(let i in pops){
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
    params
  })
  
  div.id = popid
  document.body.appendChild(div)
  messageInstance = message.mount("#" + popid)
  pops[popid] ={
    close: closeFn,
    ins: messageInstance
  };

  return {
    ins: message,
    id: popid,
    close: closeFn
  }
}