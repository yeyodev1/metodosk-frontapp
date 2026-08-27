<script setup lang="ts">
/**
 * Marco del panel de administración.
 *
 * Está separado del marco de la app de la alumna a propósito: son dos
 * productos distintos y mezclarlos en una sola barra lateral obligaba a leer
 * cada enlace para saber en cuál de los dos estabas. Acá se administra; para
 * ver lo que recibe la alumna se sale a la app, con el botón de la cabecera.
 */
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { BRAND } from '@/config/site'

const router = useRouter()
const session = useSessionStore()
const abierto = ref(false)

const ENLACES = [
  { to: '/admin', label: 'Compras', hint: 'Quién compró y cuánto' },
  { to: '/admin/cursos', label: 'Cursos', hint: 'La ruta del método y sus videos' },
]

function salir() {
  session.clear()
  router.replace('/login')
}
</script>

<template>
  <div class="admin" :class="{ 'admin--open': abierto }">
    <aside class="side">
      <RouterLink to="/" class="side__brand">
        <span class="side__mark">SK</span>
        <span>Método SK</span>
      </RouterLink>

      <nav class="side__nav">
        <RouterLink
          v-for="e in ENLACES"
          :key="e.to"
          :to="e.to"
          class="side__link"
          :class="{ 'side__link--active': $route.path === e.to }"
          @click="abierto = false"
        >
          <span class="side__link-label">{{ e.label }}</span>
          <span class="side__link-hint">{{ e.hint }}</span>
        </RouterLink>
      </nav>

      <div class="side__foot">
        <a class="side__wa" :href="BRAND.whatsapp" target="_blank" rel="noopener">WhatsApp</a>
        <p class="side__role">Panel de administración</p>
        <button type="button" class="side__exit" @click="salir">Cerrar sesión</button>
      </div>
    </aside>

    <div class="admin__main">
      <button
        class="burger"
        type="button"
        :aria-expanded="abierto"
        :aria-label="abierto ? 'Cerrar menú' : 'Abrir menú'"
        @click="abierto = !abierto"
      >
        <span /><span />
      </button>

      <header class="top">
        <h1 class="top__title">Panel de administración</h1>
        <!-- Salir a la app es una acción, no un destino más de la navegación -->
        <RouterLink to="/academia" class="top__app">
          Ver la app como alumna
          <span aria-hidden="true">→</span>
        </RouterLink>
      </header>

      <main class="admin__content">
        <RouterView />
      </main>
    </div>

    <Transition name="veil">
      <div v-if="abierto" class="scrim" @click="abierto = false" />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
$side-w: 260px;

.admin {
  display: flex;
  min-height: 100vh;
  background-color: $bone;
}

.admin__main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;

  @include from('lg') {
    margin-left: $side-w;
  }
}

/* La pantalla completa: el panel se lee mejor ancho que centrado */
.admin__content {
  flex: 1 1 auto;
  padding: clamp(1.2rem, 2.5vw, 2rem) clamp(1rem, 3vw, 2.5rem) 3rem;
}

/* ── Cabecera ── */
.top {
  position: sticky;
  top: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem clamp(1rem, 3vw, 2.5rem);
  border-bottom: 1px solid rgba($ink, 0.08);
  background-color: rgba($bone, 0.88);
  backdrop-filter: blur(12px);

  @include until('lg') {
    padding-left: 4.2rem;
  }
}

.top__title {
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $ink-muted;
}

.top__app {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem;
  border-radius: $radius-pill;
  background-color: $ink;
  color: $cream;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.05em;
  white-space: nowrap;
  transition: background-color 0.3s $ease, transform 0.3s $ease;

  span {
    transition: transform 0.3s $ease;
  }

  &:hover {
    background-color: $wine;

    span {
      transform: translateX(3px);
    }
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
  padding: 1.5rem 1.2rem;
  background-color: $ink;
  color: $cream;
  transform: translateX(-100%);
  transition: transform 0.42s $ease;

  @include from('lg') {
    transform: none;
  }
}

.admin--open .side {
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
  gap: 0.3rem;
  flex: 1 1 auto;
}

.side__link {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.8rem 0.9rem;
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
  gap: 0.7rem;
  padding-top: $space-sm;
  border-top: 1px solid rgba($cream, 0.12);
}

.side__wa {
  font-size: $text-xs;
  color: rgba($cream, 0.6);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.side__role {
  font-size: $text-xs;
  color: rgba($cream, 0.35);
}

.side__exit {
  padding: 0.6rem;
  border: 1px solid rgba($cream, 0.2);
  border-radius: $radius-pill;
  background: none;
  color: $cream;
  font-family: inherit;
  font-size: $text-xs;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background-color 0.28s $ease;

  &:hover {
    background-color: rgba($cream, 0.1);
  }
}

/* ── Móvil ── */
.burger {
  position: fixed;
  top: 0.85rem;
  left: 1rem;
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

.admin--open .burger span:first-child {
  transform: translateY(3.25px) rotate(45deg);
}

.admin--open .burger span:last-child {
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
</style>
