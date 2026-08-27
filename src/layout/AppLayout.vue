<script setup lang="ts">
/**
 * Marco de la app de la alumna.
 *
 * Barra lateral con sus destinos: el reto, sus pagos y su cuenta. En móvil se
 * guarda tras el botón de menú y entra deslizando; el contenido nunca se parte
 * en dos columnas antes de que haya ancho de sobra para las dos.
 *
 * La administración entra a esta misma app —no a una copia— con una franja
 * arriba que deja claro que está mirando, no cursando. Si el panel tuviera su
 * propia versión de esta pantalla, nadie se enteraría cuando la de verdad se
 * rompa.
 */
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import '@/plugins/icons'
import { BRAND } from '@/config/site'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const abierto = ref(false)

const ENLACES = [
  { to: '/academia', label: 'Mi reto', hint: 'Tus cursos y tu avance', icono: 'dumbbell' },
  { to: '/bienvenida', label: 'Empieza aquí', hint: 'El video de bienvenida', icono: 'circle-play' },
  { to: '/mis-pagos', label: 'Mis pagos', hint: 'Lo que pagaste y tu acceso', icono: 'credit-card' },
  { to: '/mi-cuenta', label: 'Mi cuenta', hint: 'Tus datos y tu contraseña', icono: 'user' },
]

const inicial = computed(() =>
  (session.user?.name || session.user?.email || '?')[0]?.toUpperCase(),
)

const nombre = computed(() => session.user?.name?.split(' ')[0] || 'Mi cuenta')

// Navegar en móvil cierra el menú: dejarlo abierto tapa lo que se acaba de abrir.
watch(() => route.fullPath, () => (abierto.value = false))

function salir() {
  session.clear()
  router.replace('/login')
}
</script>

<template>
  <div class="app" :class="{ 'app--open': abierto }">
    <aside class="side">
      <RouterLink to="/academia" class="side__brand">
        <span class="side__mark">SK</span>
        <span>Método SK</span>
      </RouterLink>

      <nav class="side__nav">
        <RouterLink
          v-for="e in ENLACES"
          :key="e.to"
          :to="e.to"
          class="side__link"
          active-class="side__link--active"
        >
          <span class="side__link-icono"><FaIcon :icon="e.icono" /></span>
          <span class="side__link-texto">
            <span class="side__link-label">{{ e.label }}</span>
            <span class="side__link-hint">{{ e.hint }}</span>
          </span>
        </RouterLink>
      </nav>

      <div class="side__foot">
        <a class="side__wa" :href="BRAND.whatsapp" target="_blank" rel="noopener">
          <FaIcon :icon="['fab', 'whatsapp']" /> Escríbenos por WhatsApp
        </a>

        <div class="side__user">
          <span class="side__avatar">{{ inicial }}</span>
          <span class="side__user-info">
            <span class="side__user-name">{{ nombre }}</span>
            <span class="side__user-role">
              {{ session.isAdmin ? 'Administración' : 'Alumna' }}
            </span>
          </span>
        </div>

        <button type="button" class="side__exit" @click="salir">
          <FaIcon icon="right-from-bracket" /> Cerrar sesión
        </button>
      </div>
    </aside>

    <div class="app__main">
      <!-- Vista previa: la administración sabe dónde está y cómo volver -->
      <Transition name="franja">
        <div v-if="session.isAdmin" class="franja">
          <span class="franja__dot" aria-hidden="true" />
          <p class="franja__text">
            Estás viendo la app <strong>como la ve una alumna</strong>
          </p>
          <RouterLink to="/admin" class="franja__back">
            <span aria-hidden="true">←</span>
            Volver al panel
          </RouterLink>
        </div>
      </Transition>

      <button
        class="burger"
        type="button"
        :aria-expanded="abierto"
        :aria-label="abierto ? 'Cerrar menú' : 'Abrir menú'"
        @click="abierto = !abierto"
      >
        <span /><span />
      </button>

      <main class="app__content">
        <RouterView />
      </main>
    </div>

    <Transition name="veil">
      <div v-if="abierto" class="scrim" @click="abierto = false" />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
$side-w: 250px;

.app {
  display: flex;
  min-height: 100vh;
  background-color: $bone;
}

.app__main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @include from('lg') {
    margin-left: $side-w;
  }
}

.app__content {
  flex: 1 1 auto;
  width: 100%;
}

/* ── Franja de vista previa ── */
.franja {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem 0.55rem 4rem;
  background-color: $wine;
  color: $cream;
  font-size: $text-xs;

  @include from('lg') {
    padding: 0.55rem clamp(1rem, 3vw, 2.5rem);
  }
}

.franja__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: $rose-soft;
  animation: latir 2.4s infinite;
}

.franja__text {
  flex: 1 1 auto;
  min-width: 0;

  strong {
    font-weight: 600;
  }
}

.franja__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.8rem;
  border: 1px solid rgba($cream, 0.35);
  border-radius: $radius-pill;
  color: $cream;
  white-space: nowrap;
  transition: background-color 0.28s $ease;

  &:hover {
    background-color: rgba($cream, 0.14);
  }
}

@keyframes latir {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

/* ── Barra lateral ── */
.side {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 70;
  display: flex;
  flex-direction: column;
  gap: $space-md;
  width: $side-w;
  padding: 1.4rem 1.1rem;
  padding-bottom: max(1.4rem, env(safe-area-inset-bottom));
  background-color: $ink;
  color: $cream;
  transform: translateX(-100%);
  transition: transform 0.42s $ease;

  @include from('lg') {
    transform: none;
  }
}

.app--open .side {
  transform: none;
}

.side__brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: $font-display;
  font-size: 1.05rem;
  color: $cream;
}

.side__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $ink;
  font-size: 0.85rem;
  font-style: italic;
}

.side__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1 1 auto;
}

.side__link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem 0.85rem;
  border-radius: $radius-sm;
  color: rgba($cream, 0.7);
  transition: background-color 0.28s $ease, color 0.28s $ease;

  &:hover {
    background-color: rgba($cream, 0.07);
    color: $cream;
  }
}

.side__link--active {
  background-color: rgba($rose-soft, 0.16);
  color: $cream;
}

/* El icono en su propia caja: los enlaces se alinean por el texto aunque los
   glifos midan distinto. */
.side__link-icono {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: $radius-sm;
  background-color: rgba($cream, 0.07);
  font-size: 0.78rem;
  transition: background-color 0.28s $ease, color 0.28s $ease;
}

.side__link--active .side__link-icono {
  background-color: $rose-soft;
  color: $ink;
}

.side__link-texto {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.side__link-label {
  font-size: $text-base;
  font-weight: 600;
}

.side__link-hint {
  font-size: $text-xs;
  opacity: 0.6;
}

.side__foot {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-top: $space-sm;
  border-top: 1px solid rgba($cream, 0.12);
}

.side__wa {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: $text-xs;
  color: rgba($cream, 0.6);
  transition: color 0.24s $ease;

  &:hover {
    color: $cream;
  }
}

.side__user {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.side__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: rgba($cream, 0.12);
  font-family: $font-display;
  font-size: 0.95rem;
}

.side__user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.side__user-name {
  font-size: $text-sm;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.side__user-role {
  font-size: $text-xs;
  opacity: 0.55;
}

.side__exit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.6rem;
  border: 1px solid rgba($cream, 0.2);
  border-radius: $radius-pill;
  background: none;
  color: $cream;
  font-family: inherit;
  font-size: $text-xs;
  cursor: pointer;
  transition: background-color 0.28s $ease;

  &:hover {
    background-color: rgba($cream, 0.1);
  }
}

/* ── Móvil ── */
.burger {
  position: fixed;
  top: 0.7rem;
  left: 0.9rem;
  z-index: 90;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 0 10px;
  border: none;
  border-radius: 50%;
  background-color: $ink;
  cursor: pointer;

  @include from('lg') {
    display: none;
  }

  span {
    display: block;
    width: 100%;
    height: 1.5px;
    border-radius: 2px;
    background-color: $cream;
    transition: transform 0.36s $ease;
  }
}

.app--open .burger span:first-child {
  transform: translateY(3.25px) rotate(45deg);
}

.app--open .burger span:last-child {
  transform: translateY(-3.25px) rotate(-45deg);
}

.scrim {
  position: fixed;
  inset: 0;
  z-index: 65;
  background-color: rgba($ink, 0.5);
  backdrop-filter: blur(2px);

  @include from('lg') {
    display: none;
  }
}

.veil-enter-active,
.veil-leave-active {
  animation: veil 0.3s ease-out;
}

.veil-leave-active {
  animation-direction: reverse;
}

@keyframes veil {
  from {
    opacity: 0;
  }
}

.franja-enter-active,
.franja-leave-active {
  animation: bajar 0.4s $ease;
}

.franja-leave-active {
  animation-direction: reverse;
}

@keyframes bajar {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
}

@include reduced-motion {
  .franja__dot,
  .franja-enter-active,
  .franja-leave-active,
  .veil-enter-active,
  .veil-leave-active {
    animation: none;
  }
}
</style>
