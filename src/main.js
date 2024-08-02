import {createAuth0} from "@auth0/auth0-vue";
import VueGoogleMaps from '@fawmi/vue-google-maps'
// import VueSession from "vue-session/index.esm";
import {createApp} from 'vue'
import App from '@/App.vue'
import router from '@/router'

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
            key: process.env.VUE_APP_MAPS_API
        }
        }

    )
    // .use(VueSession)
    .mount("#app")