import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Método SK — Reto de 3 meses' },
  },
  {
    // URL de respuesta de PayPhone: llega con ?id= y ?clientTransactionId=
    //
    // La Cajita ignora el responseUrl que le enviamos y usa el que esté
    // configurado en el panel de PayPhone, que hoy apunta a /pay-response.
    // Se aceptan ambas rutas para no depender de esa configuración: si no
    // resuelve, la confirmación nunca corre y PayPhone reversa el cobro.
    path: '/pago/resultado',
    alias: ['/pay-response'],
    name: 'PaymentResult',
    component: () => import('../views/PaymentResultView.vue'),
    meta: { title: 'Resultado del pago — Método SK' },
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLoginView.vue'),
    meta: { title: 'Entrar — Método SK' },
  },
  {
    path: '/admin',
    name: 'AdminOrders',
    component: () => import('../views/admin/AdminOrdersView.vue'),
    meta: { title: 'Compras — Método SK', requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada — Método SK' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return savedPosition ?? { left: 0, top: 0 }
  },
})

/**
 * Puerta del panel. Solo mira si hay token: la validez la decide el backend,
 * que responde 401 y ahí se cierra la sesión.
 */
router.beforeEach((to) => {
  if (!to.meta?.requiresAuth) return true
  const token = localStorage.getItem('access_token')
  if (token) return true
  return { name: 'AdminLogin', query: { redirect: to.fullPath } }
})

router.afterEach((to) => {
  const title = to.meta?.title
  if (typeof title === 'string') document.title = title
})

export default router
