import {createAuth0} from "@auth0/auth0-vue";
import {createApp} from 'vue'
import App from '@/App.vue'
import router from '@/router'

const app = createApp(App)
app.use(router)
    .use(
        createAuth0({
            domain: 'dev-z4b0p8g541oba5c1.us.auth0.com',
            clientId: 'YBtZgqQnRYP5d37rHGs5MQHfAvJP9K3d',
            authorizationParams: {
                redirect_uri: 'http://localhost:8080/callback',
            },
        })
    )
    .mount("#app")