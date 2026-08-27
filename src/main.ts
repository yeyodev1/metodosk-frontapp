import { createApp, defineAsyncComponent } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vReveal } from '@/composables/useScrollReveal'
import '@/styles/global.scss'

const app = createApp(App)

/**
 * El icono se registra global porque casi toda pantalla privada lo usa, pero
 * en diferido: el núcleo de Font Awesome pesa más que media landing, y la
 * landing no pinta un solo icono. Así lo descarga quien entra a la app.
 */
app.component(
  'FaIcon',
  defineAsyncComponent(() =>
    import('@fortawesome/vue-fontawesome').then((m) => m.FontAwesomeIcon),
  ),
)

app.use(createPinia())
app.use(router)
app.directive('reveal', vReveal)

app.mount('#app')
