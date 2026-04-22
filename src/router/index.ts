import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import store from '../store/index'
import _ from 'lodash';

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/cloud' },
    {
        path: '/cloud',
        name: 'Cloud Container',
        meta: { needLogin: true },
        component: () => import('../pages/cloud/pods.vue')
    },
    {
        path: '/secret',
        name: 'Secret Data',
        meta: { needLogin: true },
        component: () => import('../pages/cloud/secrets.vue')
    },
    {
        path: '/disk',
        name: 'Disk Data',
        meta: { needLogin: true },
        component: () => import('../pages/cloud/disks.vue')
    },
    {
        path: '/claw',
        name: 'TEE Claw',
        meta: { needLogin: true },
        component: () => import('../pages/claw/index.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../pages/login.vue')
    },
    {
        path: '/not404',
        name: 'Not404',
        component: () => import('../pages/not404.vue')
    },
    {
        path: '/miner',
        name: 'Miner',
        component: () => import('../pages/miner/cluster.vue')
    },
    {
        path: '/builder',
        name: 'Builder',
        component: () => import('../pages/builder/list.vue')
    },
    {
        path: '/builder/:id',
        name: 'Builder app',
        component: () => import('../pages/builder/app.vue')
    },
    {
        path: '/dao',
        name: 'DAO',
        meta: { needLogin: true },
        redirect: '/dao/proposals'
    },
    {
        path: '/dao/proposals',
        name: 'DAO Proposals',
        meta: { needLogin: true },
        component: () => import('../pages/DAO/proposals.vue')
    },
    {
        path: '/dao/create',
        name: 'Create Proposal',
        meta: { needLogin: true },
        component: () => import('../pages/DAO/createProposal.vue')
    },
    {
        path: '/dao/vote/:id',
        name: 'Vote Proposal',
        meta: { needLogin: true },
        component: () => import('../pages/DAO/voteProposal.vue')
    },
    {
        path: '/dao/members',
        name: 'DAO Members',
        meta: { needLogin: true },
        component: () => import('../pages/DAO/members.vue')
    },
]

const router = createRouter({
    history: createWebHashHistory(),
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
        if (localStorage.getItem("userInfo")) {
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
