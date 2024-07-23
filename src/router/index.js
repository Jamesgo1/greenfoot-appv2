import {createRouter, createWebHistory} from 'vue-router'
import HomePage from "@/views/HomePage";

const routes = [
    {
        path: "/", name:
            "Home",
        component: HomePage
    },
    {
        path: "/explore",
        name: "Explore",
        component: () => import(/*webpackChunkName: "DataTableExplore" */"@/views/DataTable.vue")
    },
    {
        path: "/about", name:
            "About",
        component: () => import("@/views/About.vue")
    },
    {
        path: "/callback",
        name: "Callback",
        component: () => import("@/views/CallbackPage.vue")
    },
    {
        path: "/tree/:id",
        component: () => import("@/views/TreeShow.vue")
    },
    {
        path: "/:catchAll(.*)",
        name: "Not Found",
        component: () => import("@/views/NotFound.vue"),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
    linkActiveClass: "currentNavPage"
})

export default router;