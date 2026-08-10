<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import PhotoWall from '@/components/ui/PhotoWall.vue'
import { useCheckout } from '@/composables/useCheckout'
import { BRAND, PRICING } from '@/config/site'
import { formatUsd } from '@/config/payment'

const route = useRoute()
const router = useRouter()
const { open } = useCheckout()

const goHome = () => router.push({ name: 'Home' })
</script>

<template>
  <main class="notfound">
    <PhotoWall class="notfound__wall" />
    <div class="notfound__scrim" />

    <div class="notfound__content">
      <p class="notfound__eyebrow">Error 404 · {{ BRAND.name }}</p>

      <p class="notfound__number" aria-hidden="true">404</p>

      <h1 class="notfound__title">Esta página no existe.<br />El reto sí.</h1>

      <p class="notfound__lead">
        El enlace que abriste no lleva a ningún lado. Puede que lo hayamos movido
        o que la dirección esté mal escrita.
      </p>

      <p class="notfound__path">
        <span>Buscabas</span>
        <code>{{ route.fullPath }}</code>
      </p>

      <div class="notfound__actions">
        <BaseButton variant="light" size="lg" @click="goHome">Volver al inicio</BaseButton>
        <BaseButton variant="light" size="lg" @click="open()">
          {{ PRICING.cta }} · {{ formatUsd(PRICING.presale) }}
        </BaseButton>
      </div>

      <nav class="notfound__links" aria-label="Secciones del sitio">
        <RouterLink to="/#retos">Los retos</RouterLink>
        <RouterLink to="/#incluye">Qué incluye</RouterLink>
        <RouterLink to="/#precio">Precio</RouterLink>
        <RouterLink to="/#faq">Preguntas</RouterLink>
        <a :href="BRAND.whatsapp" target="_blank" rel="noopener">Escribirnos</a>
      </nav>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.notfound {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100svh;
  padding: clamp(3rem, 9vw, 6rem) 0;
  background-color: $ink;
  color: rgba($cream, 0.8);
  overflow: hidden;
  isolation: isolate;
}

.notfound__wall {
  z-index: 0;
}

.notfound__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(ellipse at 50% 50%, rgba(#100c0b, 0.94) 30%, rgba(#100c0b, 0.72) 70%),
    linear-gradient(to bottom, rgba(#100c0b, 0.85), rgba($wine, 0.35), rgba(#100c0b, 0.9));
  backdrop-filter: blur(2px);
}

.notfound__content {
  @include container(760px);
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-sm;
  text-align: center;
}

.notfound__eyebrow {
  @include eyebrow;
  color: $rose-soft;
  padding: 0.4rem 0.95rem;
  border: 1px solid rgba($cream, 0.28);
  border-radius: $radius-pill;
  backdrop-filter: blur(6px);
}

// El 404 grande es decorativo: se lee como textura, no como contenido.
.notfound__number {
  font-family: $font-display;
  font-size: clamp(7rem, 26vw, 17rem);
  font-weight: 300;
  line-height: 0.8;
  letter-spacing: -0.055em;
  color: transparent;
  background: linear-gradient(140deg, $cream 0%, $rose-soft 40%, $rose 70%, $wine 100%);
  background-clip: text;
  -webkit-background-clip: text;
  user-select: none;
  filter: drop-shadow(0 20px 50px rgba(#100c0b, 0.6));
}

.notfound__title {
  @include display($display-sm);
  color: $cream;
}

.notfound__lead {
  max-width: 44ch;
  font-size: $text-sm;
}

.notfound__path {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: $text-xs;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba($cream, 0.5);

  code {
    font-family: ui-monospace, 'SFMono-Regular', monospace;
    letter-spacing: 0;
    text-transform: none;
    padding: 0.3rem 0.65rem;
    border-radius: $radius-sm;
    background-color: rgba($cream, 0.1);
    color: $rose-soft;
    word-break: break-all;
  }
}

.notfound__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-sm;
  margin-top: $space-sm;
}

.notfound__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.2rem;
  width: 100%;
  margin-top: $space-md;
  padding-top: $space-md;
  border-top: 1px solid rgba($cream, 0.15);
  font-size: $text-sm;
  color: rgba($cream, 0.65);

  a {
    transition: color 0.3s $ease;

    &:hover {
      color: $rose;
    }
  }
}
</style>
