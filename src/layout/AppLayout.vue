<script setup lang="ts">
/**
 * Marco de la app de la alumna.
 *
 * Barra arriba y no lateral: la alumna solo tiene dos destinos, y una columna
 * fija de 260px para dos enlaces le roba a lo único que importa acá, que es el
 * contenido del reto.
 *
 * La administración entra a esta misma app —no a una copia— con una franja
 * arriba que deja claro que está mirando, no cursando. Si el panel tuviera su
 * propia versión de esta pantalla, nadie se enteraría cuando la de verdad se
 * rompa.
 */
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()

const TABS = [
  { to: '/academia', label: 'La academia' },
  { to: '/mi-cuenta', label: 'Mi cuenta' },
]

const inicial = computed(() =>
  (session.user?.name || session.user?.email || '?')[0]?.toUpperCase(),
)

const nombre = computed(() => session.user?.name?.split(' ')[0] || 'Mi cuenta')

function salir() {
  session.clear()
  router.replace('/login')
}
</script>

<template>
  <div class="app">
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

    <header class="top">
      <RouterLink to="/academia" class="top__brand">
        <span class="top__mark">SK</span>
        <span class="top__name">Método SK</span>
      </RouterLink>

      <nav class="top__tabs">
        <RouterLink
          v-for="t in TABS"
          :key="t.to"
          :to="t.to"
          class="tab"
          active-class="tab--active"
        >
          {{ t.label }}
        </RouterLink>
      </nav>

      <div class="top__user">
        <span class="top__avatar">{{ inicial }}</span>
        <span class="top__hola">{{ nombre }}</span>
        <button type="button" class="top__exit" @click="salir">Salir</button>
      </div>
    </header>

    <main class="app__content">
      <RouterView />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bone;
}

/* Ancho completo: es una app, no una página centrada */
.app__content {
  flex: 1 1 auto;
  width: 100%;
}

/* ── Franja de vista previa ── */
.franja {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem clamp(1rem, 3vw, 2.5rem);
  background-color: $wine;
  color: $cream;
  font-size: $text-xs;
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
  padding: 0.3rem 0.85rem;
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

/* ── Barra superior ── */
.top {
  position: sticky;
  top: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: clamp(1rem, 4vw, 2.5rem);
  padding: 0.9rem clamp(1rem, 3vw, 2.5rem);
  border-bottom: 1px solid rgba($ink, 0.08);
  background-color: rgba($bone, 0.9);
  backdrop-filter: blur(12px);
}

.top__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: $font-display;
  font-size: 1rem;
  color: $ink;
}

.top__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: $ink;
  color: $cream;
  font-size: 0.78rem;
  font-style: italic;
}

.top__name {
  @include until('md') {
    display: none;
  }
}

.top__tabs {
  display: flex;
  gap: 0.25rem;
  flex: 1 1 auto;
}

.tab {
  position: relative;
  padding: 0.5rem 0.9rem;
  border-radius: $radius-pill;
  font-size: $text-sm;
  color: $ink-muted;
  white-space: nowrap;
  transition: color 0.28s $ease, background-color 0.28s $ease;

  &:hover {
    color: $ink;
    background-color: rgba($ink, 0.05);
  }
}

.tab--active {
  background-color: $ink;
  color: $cream;

  &:hover {
    background-color: $ink;
    color: $cream;
  }
}

.top__user {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.top__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: $rose-soft;
  font-family: $font-display;
  font-size: 0.9rem;
  color: $ink;
}

.top__hola {
  font-size: $text-sm;
  color: $ink-soft;

  @include until('md') {
    display: none;
  }
}

.top__exit {
  padding: 0.4rem 0.9rem;
  border: 1px solid rgba($ink, 0.18);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-soft;
  cursor: pointer;
  transition: border-color 0.28s $ease, color 0.28s $ease;

  &:hover {
    border-color: $ink;
    color: $ink;
  }
}

/* ── Transición de la franja ── */
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
  .franja-leave-active {
    animation: none;
  }
}
</style>
