import {createRouter, createWebHistory} from 'vue-router'
import HomePage from "@/views/HomePage";
// import {authGuard} from "@auth0/auth0-vue";

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
        path: "/profile",
        name: "Profile",
        component: () => import(/*webpackChunkName: "DataTableExplore" */"@/views/ProfilePage.vue")
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
        path: "/treedetails/:id",
        name: "TreeDetails",
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