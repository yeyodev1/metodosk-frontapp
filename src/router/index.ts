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
    path: '/pago/resultado',
    name: 'PaymentResult',
    component: () => import('../views/PaymentResultView.vue'),
    meta: { title: 'Resultado del pago — Método SK' },
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

router.afterEach((to) => {
  const title = to.meta?.title
  if (typeof title === 'string') document.title = title
})

export default router
