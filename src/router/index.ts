import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import store from '../store/index'
import _ from 'lodash';

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/project' },
    {
        path: '/project',
        name: 'project',
        meta: { needLogin: true },
        component: () => import('../pages/cloud/list.vue')
    },
    {
        path: '/project/:id',
        name: 'Project',
        meta: { needLogin: true },
        component: () => import('../pages/cloud/project.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../pages/login.vue')
    },
    {
        path: '/not404',
        name: 'Not404',
        component: () => import('../pages/cloud/not404.vue')
    },
    {
        path: '/imgMask',
        name: 'Not404',
        component: () => import('../pages/cloud/imgMask.vue')
    },
    {
        path: '/miner',
        name: 'Not404',
        component: () => import('../pages/miner/cluster.vue')
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})


router.beforeEach((to, from, next) => {
    if (to.path == "/login") {
        store.dispatch("setLoginShow", true);
    } else {
        store.dispatch("setLoginShow", false);
    }
    // 低版本 vue-router 破坏了路由bug修复
    if (_.isEmpty(history.state.current)) {
        _.assign(history.state, { current: from.fullPath });
    }
    console.log("to:", to.path)
    store.dispatch("setPath", to.path);
    //页面是否需要登录
    if (to.meta.needLogin) {
        //页面是否登录
        if (localStorage.getItem("token")) {
            //本地存储中是否有token(uid)数据
            next();
        } else {
            next({ name: "Login" });
        }
        return
    }
    next()
})

export default router
