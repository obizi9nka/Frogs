import MainNet from "@/pages/MainNet";
import PanCake from "@/pages/PanCake";
import Lottery from "@/pages/Lottery";
import Admin from "@/pages/Admin";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: 'main-net',
        path: '/',
        component: MainNet
    },
    {
        name: 'lottery',
        path: '/lottery',
        component: Lottery
    },
    {
        name: 'pancake',
        path: '/cake/',
        component: PanCake
    },
    // {
    //     name: 'admin',
    //     path : '/admin/',
    //     component: Admin
    // }
]

const router = createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
})

export default router;