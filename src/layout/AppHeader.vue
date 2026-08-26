<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCheckout } from '@/composables/useCheckout'
import { BRAND, PRICING } from '@/config/site'

const { open } = useCheckout()
const scrolled = ref(false)
const menuOpen = ref(false)

const LINKS = [
  { href: '#retos', label: 'Los retos' },
  { href: '#incluye', label: 'Qué incluye' },
  { href: '#nutricion', label: 'Nutrición' },
  { href: '#precio', label: 'Precio' },
  { href: '#faq', label: 'Preguntas' },
] as const

function onScroll() {
  scrolled.value = window.scrollY > 80
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') menuOpen.value = false
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

/** Abre el checkout desde el menú, cerrándolo primero. */
function openCheckout() {
  menuOpen.value = false
  open()
}

// Con el menú abierto la página de atrás no debe moverse.
watch(menuOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="header" :class="{ 'is-scrolled': scrolled, 'is-open': menuOpen }">
    <div class="header__inner">
      <a class="header__brand" href="#top" @click="menuOpen = false">
        <span class="header__mark">SK</span>
        <span class="header__name">{{ BRAND.name }}</span>
      </a>

      <nav class="header__nav" aria-label="Secciones">
        <a v-for="link in LINKS" :key="link.href" :href="link.href">{{ link.label }}</a>
        <RouterLink to="/login" class="header__login">Entrar</RouterLink>
      </nav>

      <BaseButton class="header__cta" @click="open()">{{ PRICING.cta }}</BaseButton>

      <button
        class="burger"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="menu-movil"
        :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
        @click="toggleMenu"
      >
        <span class="burger__line" />
        <span class="burger__line" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="menu">
        <div v-if="menuOpen" id="menu-movil" class="menu" role="dialog" aria-modal="true">
          <nav class="menu__nav" aria-label="Secciones">
            <a
              v-for="(link, index) in LINKS"
              :key="link.href"
              class="menu__link"
              :href="link.href"
              :style="{ '--i': index }"
              @click="menuOpen = false"
            >
              <span class="menu__index">0{{ index + 1 }}</span>
              {{ link.label }}
            </a>
          </nav>

          <div class="menu__foot" :style="{ '--i': LINKS.length }">
            <BaseButton size="lg" block @click="openCheckout">{{ PRICING.cta }}</BaseButton>
            <RouterLink to="/mi-cuenta" class="menu__login" @click="menuOpen = false">
              Ya compré · Entrar a mi cuenta
            </RouterLink>
            <a class="menu__whatsapp" :href="BRAND.whatsapp" target="_blank" rel="noopener">
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  transition:
    background-color 0.4s $ease,
    box-shadow 0.4s $ease,
    border-color 0.4s $ease;
  border-bottom: 1px solid transparent;
}

.header.is-scrolled {
  background-color: rgba($bone, 0.88);
  backdrop-filter: blur(14px);
  border-bottom-color: rgba($ink, 0.08);
}

/* Con el menú abierto el header va encima del panel y sin fondo propio. */
.header.is-open {
  z-index: 120;
  background-color: transparent;
  backdrop-filter: none;
  border-bottom-color: transparent;
}

.header__inner {
  @include container(1240px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-md;
  height: 68px;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  position: relative;
  z-index: 1;
}

.header__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: $ink;
  color: $rose-soft;
  font-family: $font-display;
  font-size: 0.9rem;
  font-style: italic;
  transition: background-color 0.4s $ease, color 0.4s $ease;
}

.header__name {
  font-family: $font-display;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  transition: color 0.4s $ease;
}

/* Sobre el panel oscuro, la marca se invierte para seguir siendo legible. */
.header.is-open .header__mark {
  background-color: $rose-soft;
  color: $ink;
}

.header.is-open .header__name {
  color: $cream;
}

.header__nav {
  display: none;
  gap: 1.9rem;
  font-size: $text-sm;
  color: $ink-soft;

  @include from('lg') {
    display: flex;
  }

  a {
    position: relative;
    padding-block: 0.2rem;
    transition: color 0.3s $ease;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 0;
      height: 1px;
      background-color: $rose-deep;
      transition: width 0.35s $ease;
    }

    &:hover {
      color: $ink;

      &::after {
        width: 100%;
      }
    }
  }
}

.header__cta {
  font-size: $text-xs;
  padding: 0.7rem 1.3rem;

  @include until('lg') {
    display: none;
  }
}

/* ─────────────── Botón hamburguesa ─────────────── */
.burger {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  width: 44px;
  height: 44px;
  padding: 0 10px;
  background: none;
  border: none;
  cursor: pointer;

  @include focus-ring($rose-deep);

  @include from('lg') {
    display: none;
  }
}

.burger__line {
  display: block;
  width: 100%;
  height: 1.5px;
  background-color: $ink;
  border-radius: 2px;
  transition:
    transform 0.4s $ease,
    background-color 0.4s $ease;
}

/* Las dos líneas se cruzan en una X. */
.header.is-open .burger__line {
  background-color: $cream;

  &:first-child {
    transform: translateY(3.75px) rotate(45deg);
  }

  &:last-child {
    transform: translateY(-3.75px) rotate(-45deg);
  }
}

/* ─────────────── Panel a pantalla completa ─────────────── */
.menu {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: $space-lg;
  padding: calc(68px + #{$space-lg}) clamp(1.5rem, 7vw, 3rem) clamp(2rem, 8vh, 4rem);
  background-color: $ink;
  overflow-y: auto;

  @include from('lg') {
    display: none;
  }
}

.menu__nav {
  display: flex;
  flex-direction: column;
}

.menu__link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding-block: clamp(0.7rem, 2.2vh, 1.1rem);
  border-bottom: 1px solid rgba($cream, 0.1);
  font-family: $font-display;
  font-size: clamp(1.9rem, 8vw, 2.8rem);
  line-height: 1.1;
  color: $cream;
  transition: color 0.3s $ease, padding-left 0.4s $ease;

  &:active {
    color: $rose-soft;
  }

  @media (hover: hover) {
    &:hover {
      color: $rose-soft;
      padding-left: 0.5rem;
    }
  }
}

.menu__index {
  font-family: $font-principal;
  font-size: $text-xs;
  letter-spacing: 0.1em;
  color: rgba($cream, 0.4);
}

.menu__foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-sm;
}

.header__login {
  font-weight: 600;
  color: $ink;
}

.menu__login {
  font-size: $text-sm;
  color: $cream;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.menu__whatsapp {
  font-size: $text-sm;
  color: rgba($cream, 0.65);
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color 0.3s $ease;

  &:hover {
    color: $cream;
  }
}

/* ─────────────── Animación de apertura ─────────────── */
/* El panel se despliega desde arriba; los enlaces entran escalonados detrás. */
.menu-enter-active {
  transition: clip-path 0.55s $ease, opacity 0.2s ease;
}

.menu-leave-active {
  transition: clip-path 0.45s $ease, opacity 0.25s ease 0.2s;
}

.menu-enter-from,
.menu-leave-to {
  clip-path: inset(0 0 100% 0);
  opacity: 0;
}

.menu-enter-to,
.menu-leave-from {
  clip-path: inset(0 0 0 0);
  opacity: 1;
}

.menu-enter-active .menu__link,
.menu-enter-active .menu__foot {
  animation: menu-in 0.5s $ease both;
  /* Cada elemento entra un poco después del anterior. */
  animation-delay: calc(0.16s + var(--i) * 0.06s);
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-enter-active,
  .menu-leave-active,
  .burger__line,
  .menu__link {
    transition-duration: 0.01ms;
  }

  .menu-enter-active .menu__link,
  .menu-enter-active .menu__foot {
    animation: none;
  }
}
</style>
