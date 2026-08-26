<script setup lang="ts">
/**
 * Marco de las pantallas privadas, con barra lateral.
 *
 * La clase raíz se llama `shell` a propósito: los estilos con scope del padre
 * también se aplican a la raíz del componente hijo, y cuando esto se llamaba
 * `.panel` le imponía `display: flex` a la vista de compras, que usaba el mismo
 * nombre. La pantalla salía en columnas descuadradas.
 *
 * Los enlaces se arman según el rol: la administración ve todo, incluida el
 * área de la academia, y la compradora solo lo suyo.
 */
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { BRAND } from '@/config/site'

const router = useRouter()
const session = useSessionStore()
const abierto = ref(false)

interface Enlace {
  to: string
  label: string
  hint: string
  soloAdmin?: boolean
}

const ENLACES: Enlace[] = [
  { to: '/admin', label: 'Compras', hint: 'Quién compró y cuánto', soloAdmin: true },
  { to: '/academia', label: 'La academia', hint: 'El método por dentro' },
  { to: '/mi-cuenta', label: 'Mi cuenta', hint: 'Tus datos y tu contraseña' },
]

const enlaces = computed(() =>
  ENLACES.filter((e) => !e.soloAdmin || session.isAdmin).map((e) =>
    e.to === '/academia' && session.isAdmin
      ? { ...e, hint: 'Vista previa de la alumna' }
      : e,
  ),
)

const inicial = computed(() => (session.user?.name || session.user?.email || '?')[0]?.toUpperCase())

function salir() {
  session.clear()
  router.replace('/login')
}
</script>

<template>
  <div class="shell" :class="{ 'shell--open': abierto }">
    <button
      class="shell__burger"
      type="button"
      :aria-expanded="abierto"
      :aria-label="abierto ? 'Cerrar menú' : 'Abrir menú'"
      @click="abierto = !abierto"
    >
      <span /><span />
    </button>

    <!-- Tapa el contenido en móvil cuando la barra está abierta -->
    <div v-if="abierto" class="shell__scrim" @click="abierto = false" />

    <aside class="side">
      <RouterLink to="/" class="side__brand">
        <span class="side__mark">SK</span>
        <span>Método SK</span>
      </RouterLink>

      <nav class="side__nav">
        <RouterLink
          v-for="e in enlaces"
          :key="e.to"
          :to="e.to"
          class="side__link"
          active-class="side__link--active"
          @click="abierto = false"
        >
          <span class="side__link-label">{{ e.label }}</span>
          <span class="side__link-hint">{{ e.hint }}</span>
        </RouterLink>
      </nav>

      <div class="side__foot">
        <a class="side__wa" :href="BRAND.whatsapp" target="_blank" rel="noopener">WhatsApp</a>

        <div class="side__user">
          <span class="side__avatar">{{ inicial }}</span>
          <span class="side__user-info">
            <span class="side__user-name">{{ session.user?.name || 'Mi cuenta' }}</span>
            <span class="side__user-role">
              {{ session.isAdmin ? 'Administración' : 'Compradora' }}
            </span>
          </span>
        </div>

        <button type="button" class="side__exit" @click="salir">Salir</button>
      </div>
    </aside>

    <div class="shell__body">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$side-w: 268px;

.shell {
  display: flex;
  min-height: 100vh;
  background-color: $sand;
}

.shell__body {
  flex: 1 1 auto;
  min-width: 0;

  @include from('lg') {
    margin-left: $side-w;
  }
}

/* ─────────── Barra lateral ─────────── */
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

.shell--open .side {
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
  gap: 0.9rem;
  padding-top: $space-sm;
  border-top: 1px solid rgba($cream, 0.12);
}

.side__wa {
  font-size: $text-xs;
  color: rgba($cream, 0.6);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.side__user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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
  padding: 0.6rem;
  border: 1px solid rgba($cream, 0.2);
  border-radius: $radius-pill;
  background: none;
  color: $cream;
  font-family: inherit;
  font-size: $text-xs;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.28s $ease;

  &:hover {
    background-color: rgba($cream, 0.1);
  }
}

/* ─────────── Abrir en móvil ─────────── */
.shell__burger {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 90;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 42px;
  height: 42px;
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

.shell--open .shell__burger span:first-child {
  transform: translateY(3.25px) rotate(45deg);
}

.shell--open .shell__burger span:last-child {
  transform: translateY(-3.25px) rotate(-45deg);
}

.shell__scrim {
  position: fixed;
  inset: 0;
  z-index: 65;
  background-color: rgba($ink, 0.5);
  backdrop-filter: blur(2px);

  @include from('lg') {
    display: none;
  }
}
</style>
