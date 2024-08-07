import './assets/main.css'
import Toast  from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
  })

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.mount('#app');
