import './styles/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { createPinia } from 'pinia'
import 'remixicon/fonts/remixicon.css'
import 'element-plus/dist/index.css'
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
