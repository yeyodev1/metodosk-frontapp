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
    // Login único: el rol decide a dónde va después de entrar.
    path: '/login',
    alias: ['/admin/login'],
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { title: 'Entrar — Método SK', guestOnly: true },
  },
  {
    path: '/registro',
    name: 'Register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { title: 'Crear contraseña — Método SK', guestOnly: true },
  },
  {
    // Todo lo privado comparte el marco con barra lateral.
    path: '/',
    component: () => import('../layout/PanelLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'mi-cuenta',
        name: 'MyAccount',
        component: () => import('../views/member/MyAccountView.vue'),
        meta: { title: 'La academia — Método SK', requiresAuth: true },
      },
      {
        path: 'admin',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrdersView.vue'),
        meta: { title: 'Compras — Método SK', requiresAuth: true, requiresAdmin: true },
      },
    ],
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
 * Puerta de las rutas privadas.
 *
 * La sesión se recupera del backend porque el rol no se puede confiar al
 * navegador: quien edite el localStorage no debe entrar al panel.
 */
router.beforeEach(async (to) => {
  const { useSessionStore, homeForRole } = await import('../stores/session')
  const session = useSessionStore()

  if (to.meta?.requiresAuth || to.meta?.guestOnly) {
    await session.restore()
  }

  if (to.meta?.guestOnly && session.user) {
    return homeForRole(session.user.role)
  }

  if (!to.meta?.requiresAuth) return true

  if (!session.user) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // Una compradora que apunte a /admin va a su propia área, no a un 403.
  if (to.meta?.requiresAdmin && session.user.role !== 'admin') {
    return homeForRole(session.user.role)
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta?.title
  if (typeof title === 'string') document.title = title
})

export default router
