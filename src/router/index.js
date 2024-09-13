import {createRouter, createWebHistory} from 'vue-router'
import HomePage from "@/views/HomePage";
import {authGuard} from "@auth0/auth0-vue";
import store from "@/store";
import axios from "axios";

const routes = [
    {
        path: "/", name:
            "Home",
        component: HomePage
    },
    {
        path: "/explore",
        name: "Explore",
        component: () => import(/*webpackChunkName: "DataTableExplore" */"@/views/DataTable.vue"),
    },
    {
        path: "/details",
        name: "UserDetails",
        component: () => import(/*webpackChunkName: "DataTableExplore" */"@/views/UserDetails.vue"),
        beforeEnter: authGuard,
        meta: {}
    },
    {
        path: "/profile/:id",
        name: "ProfileDetails",
        component: () => import(/*webpackChunkName: "DataTableExplore" */"@/views/ProfileDetails.vue"),
        beforeEnter: async (to, from, next) => {
            try {
                console.log("Here is the user id:")
                console.log(to.params.id)
                const response = await axios.post(`${process.env.VUE_APP_API_SERVER_URL}/user/user-details-alt/`, {"user_id": to.params.id})
                console.log("Here is the alt api call response:")
                console.log(response.data)
                if (response.data.length < 1) {
                    next({path: '/:catchAll(.*)*'});
                } else {
                    to.params.userData = response.data[0];
                    next();
                }
            } catch (error) {
                console.error(error);
                next({path: '/:catchAll(.*)*'});
            }
        },
        meta: {}
    },
    {
        path: "/about", name:
            "About",
        component: () => import("@/views/About.vue")
    },
    {
        path: "/new-tree", name:
            "NewTree",
        component: () => import("@/views/AddNewTree.vue"),
        beforeEnter: authGuard
    },
    {
        path: "/analytics", name:
            "Analytics",
        component: () => import("@/views/AnalyticsPage.vue"),
    },

    {
        path: "/callback",
        name: "Callback",
        component: () => import("@/views/CallbackPage.vue")
    },
    {
        path: "/submissions",
        name: "TreeDetailsSubmissions",
        component: () => import("@/views/TreeDetailsSubmissions.vue"),
        beforeEnter: authGuard
    },
    {
        path: "/treedetails/:id",
        name: "TreeDetails",
        component: () => import("@/views/TreeShow.vue"),
    },
    {
        path: "/:catchAll(.*)*",
        name: "Not Found",
        component: () => import("@/views/NotFound.vue"),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
    linkActiveClass: "currentNavPage"
})

router.beforeEach(async (to, from, next) => {
    const publicPages = ["/", "/about", "/details", "/analytics", "/explore", "/treedetails"]
    const adminPage = ["/submissions"]
    const publicPagePatterns = [/^\/treedetails\/\d+$/]
    const isPublicPage = publicPages.includes(to.path) || publicPagePatterns.some(pattern => pattern.test(to.path));
    const authRequired = !isPublicPage
    console.log("authRequired is:" + authRequired)
    let auth = 0;
    if (store.getters.getSession) {
        auth = store.getters.getSession.user_type_id;
        console.log("Current auth is: " + auth)
    }

    if (to.name === "ProfileDetails") {
        return next();
    }

    if (authRequired && !auth) {
        return next("/details");
    } else if (adminPage.includes(to.path) && auth < 2) {
        return next("/")
    }
    next();
})

export default router;