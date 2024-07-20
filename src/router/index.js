import {createRouter, createWebHistory} from 'vue-router'
import HomePage from "@/views/HomePage";
import DataTable from "@/views/DataTable";
import About from "@/views/About";
import CallbackPage from "@/views/CallbackPage"

const routes = [
    {path: "/", name: "Home", component: HomePage},
    {path: "/explore", name: "Explore", component: DataTable},
    {path: "/about", name: "About", component: About},
    {path: "/callback", name: "Callback", component: CallbackPage}
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export default router;