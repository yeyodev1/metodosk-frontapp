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
    path: '/recuperar',
    name: 'Recuperar',
    component: () => import('../views/auth/RecuperarView.vue'),
    meta: { title: 'Recuperar contraseña — Método SK', guestOnly: true },
  },
  {
    path: '/restablecer',
    name: 'Restablecer',
    component: () => import('../views/auth/RestablecerView.vue'),
    meta: { title: 'Nueva contraseña — Método SK', guestOnly: true },
  },
  {
    path: '/registro',
    name: 'Register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { title: 'Crear contraseña — Método SK', guestOnly: true },
  },
  {
    // La app de la alumna: barra arriba y contenido a pantalla completa.
    path: '/',
    component: () => import('../layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        // Lo que recibe la alumna. La administración entra a esta misma
        // pantalla en vista previa, no a una versión aparte.
        path: 'academia',
        name: 'Academy',
        component: () => import('../views/member/AcademyView.vue'),
        meta: { title: 'La academia — Método SK', requiresAuth: true },
      },
      {
        /*
         * La guía de nutrición, por secciones.
         *
         * Cada una es su propia ruta y no un ancla dentro de una página larga:
         * se entra a buscar la tabla de carbohidratos o el menú del jueves, no
         * a leerla de corrido, y así el enlace se puede compartir y el atrás
         * del teléfono devuelve a donde estaba.
         */
        path: 'guia',
        component: () => import('../views/member/GuiaLayout.vue'),
        meta: { title: 'Tu guía — Método SK', requiresAuth: true },
        children: [
          { path: '', redirect: '/guia/menu' },
          {
            path: 'menu',
            name: 'GuiaMenu',
            component: () => import('../views/member/guia/MenuGuiaView.vue'),
            meta: { title: 'Tu menú — Método SK', requiresAuth: true },
          },
          {
            path: 'snacks',
            name: 'GuiaSnacks',
            component: () => import('../views/member/guia/SnacksGuiaView.vue'),
            meta: { title: 'Snacks — Método SK', requiresAuth: true },
          },
          {
            path: 'arma-tu-plato',
            name: 'GuiaPlato',
            component: () => import('../views/member/guia/PlatoGuiaView.vue'),
            meta: { title: 'Arma tu plato — Método SK', requiresAuth: true },
          },
          {
            path: 'intercambios',
            name: 'GuiaIntercambios',
            component: () => import('../views/member/guia/IntercambiosGuiaView.vue'),
            meta: { title: 'Intercambios — Método SK', requiresAuth: true },
          },
          {
            path: 'condimentos',
            name: 'GuiaCondimentos',
            component: () => import('../views/member/guia/CondimentosGuiaView.vue'),
            meta: { title: 'Condimentos — Método SK', requiresAuth: true },
          },
          {
            path: 'compras',
            name: 'GuiaCompras',
            component: () => import('../views/member/guia/ComprasGuiaView.vue'),
            meta: { title: 'Lista de compras — Método SK', requiresAuth: true },
          },
          {
            path: 'meal-prep',
            name: 'GuiaMealPrep',
            component: () => import('../views/member/guia/MealPrepGuiaView.vue'),
            meta: { title: 'Meal prep — Método SK', requiresAuth: true },
          },
          {
            path: 'suplementos',
            name: 'GuiaSuplementos',
            component: () => import('../views/member/guia/SuplementosGuiaView.vue'),
            meta: { title: 'Suplementación — Método SK', requiresAuth: true },
          },
        ],
      },
      {
        path: 'bienvenida',
        name: 'Welcome',
        component: () => import('../views/member/WelcomeView.vue'),
        meta: { title: 'Empieza aquí — Método SK', requiresAuth: true },
      },
      {
        // La lista de implementos. También llega por correo al comprar, pero
        // ese correo se pierde y esto se relee parada en la tienda.
        path: 'recursos',
        name: 'Recursos',
        component: () => import('../views/member/RecursosView.vue'),
        meta: { title: 'Recursos — Método SK', requiresAuth: true },
      },
      {
        path: 'mi-progreso',
        name: 'MyProgress',
        component: () => import('../views/member/MyProgressView.vue'),
        meta: { title: 'Mi progreso — Método SK', requiresAuth: true },
      },
      {
        path: 'comunidad',
        name: 'Community',
        component: () => import('../views/member/CommunityView.vue'),
        meta: { title: 'La comunidad — Método SK', requiresAuth: true },
      },
      {
        path: 'mis-pagos',
        name: 'MyPayments',
        component: () => import('../views/member/MyPaymentsView.vue'),
        meta: { title: 'Mis pagos — Método SK', requiresAuth: true },
      },
      {
        path: 'mi-cuenta',
        name: 'MyAccount',
        component: () => import('../views/member/MyAccountView.vue'),
        meta: { title: 'Mi cuenta — Método SK', requiresAuth: true },
      },
    ],
  },
  {
    // El panel es su propio producto, con su propio marco.
    path: '/',
    component: () => import('../layout/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'admin',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrdersView.vue'),
        meta: { title: 'Compras — Método SK', requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'admin/comentarios',
        name: 'AdminComments',
        component: () => import('../views/admin/AdminCommentsView.vue'),
        meta: { title: 'Comentarios — Método SK', requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'admin/cursos',
        name: 'AdminCourses',
        component: () => import('../views/admin/AdminCoursesView.vue'),
        meta: { title: 'Cursos — Método SK', requiresAuth: true, requiresAdmin: true },
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

router.afterEach(async (to) => {
  const title = to.meta?.title
  if (typeof title === 'string') document.title = title

  /**
   * PageView en cada navegación, incluida la primera.
   *
   * En una SPA el pixel solo vería la carga inicial: sin esto, alguien que
   * entra a la landing y pasa a /registro cuenta como una sola visita, y las
   * rutas internas no existirían para Meta.
   */
  const { trackMeta } = await import('@/composables/useMetaPixel')
  trackMeta('PageView')
})

export default router
