import {createAuth0} from "@auth0/auth0-vue";
import VueGoogleMaps from '@fawmi/vue-google-maps'
import {createApp} from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from "@/store";



const app = createApp(App)
app.use(router)
    .use(
        createAuth0({
            domain: process.env.VUE_APP_AUTH0_DOMAIN,
            clientId: process.env.VUE_APP_AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: process.env.VUE_APP_AUTH0_CALLBACK_URL,
            },
        })
    )
    .use(VueGoogleMaps, {
        load: {
            key: process.env.VUE_APP_MAPS_API,
            libraries: "visualization"
        }
        }

    )
    .use(store)
    .mount("#app")