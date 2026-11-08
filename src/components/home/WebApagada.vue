<script setup lang="ts">
/**
 * El home con la web apagada desde el panel.
 *
 * Reemplaza a la landing entera: nada de precios ni botones de compra. Las
 * alumnas siguen entrando por su cuenta, por eso el único botón lleva al login.
 */
import CldImage from '@/components/ui/CldImage.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { CREATORS, WEB_APAGADA } from '@/config/site'
import { photo } from '@/config/media'
import '@/plugins/icons'
</script>

<template>
  <section class="cerrada">
    <div class="cerrada__fotos" aria-hidden="true">
      <div v-for="(c, i) in CREATORS" :key="c.handle" class="cerrada__foto" :class="`cerrada__foto--${i}`">
        <CldImage :public-id="photo(c.photo).id" :alt="c.name" ratio="3:4" gravity="face" sizes="40vw" priority />
      </div>
    </div>

    <div class="cerrada__texto">
      <p class="cerrada__eyebrow">{{ WEB_APAGADA.eyebrow }}</p>
      <h1 class="cerrada__title">{{ WEB_APAGADA.title }}</h1>
      <p class="cerrada__text">{{ WEB_APAGADA.text }}</p>

      <p class="cerrada__nota">{{ WEB_APAGADA.nota }}</p>
      <BaseButton variant="light" size="lg" href="/login">{{ WEB_APAGADA.cta }}</BaseButton>

      <p class="cerrada__sigue">{{ WEB_APAGADA.sigue }}</p>
      <ul class="cerrada__redes">
        <li v-for="c in CREATORS" :key="c.handle">
          <a :href="c.instagram" target="_blank" rel="noopener">
            <FaIcon :icon="['fab', 'instagram']" />
            <span>{{ c.handle }}</span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.cerrada {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(2rem, 6vw, 5rem) clamp(1rem, 5vw, 4rem);
  background:
    radial-gradient(60% 50% at 80% 10%, rgba($rose, 0.28), transparent 70%),
    radial-gradient(50% 40% at 10% 90%, rgba($wine, 0.45), transparent 70%),
    $ink;
  color: $cream;

  @include from('md') {
    flex-direction: row-reverse;
    align-items: center;
    gap: clamp(2rem, 6vw, 6rem);
  }
}

.cerrada__fotos {
  position: relative;
  display: flex;
  justify-content: center;
  flex: 1 1 45%;
  min-height: 300px;
  margin-bottom: $space-lg;

  @include from('md') {
    margin-bottom: 0;
    min-height: 520px;
  }
}

.cerrada__foto {
  position: absolute;
  width: min(44%, 260px);
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-lg;
  outline: 1px solid rgba($cream, 0.12);
  animation: flotar 7s ease-in-out infinite;

  @include reduced-motion {
    animation: none;
  }
}

.cerrada__foto--0 {
  top: 0;
  left: 8%;
  transform: rotate(-5deg);
}

.cerrada__foto--1 {
  bottom: 0;
  right: 8%;
  transform: rotate(5deg);
  animation-delay: -3.5s;
}

@keyframes flotar {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -12px;
  }
}

.cerrada__texto {
  flex: 1 1 55%;
  max-width: 560px;
}

.cerrada__eyebrow {
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: $rose-soft;
}

.cerrada__title {
  margin-top: $space-sm;
  font-family: $font-display;
  font-weight: 300;
  font-size: clamp(2.4rem, 6vw, 4.4rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
  white-space: pre-line;
  color: $cream;
}

.cerrada__text {
  margin-top: $space-md;
  max-width: 44ch;
  font-size: $text-lg;
  line-height: 1.55;
  color: rgba($cream, 0.78);
}

.cerrada__nota {
  margin-top: $space-lg;
  font-size: $text-sm;
  color: rgba($cream, 0.6);
}

.cerrada__nota + * {
  margin-top: $space-xs;
}

.cerrada__sigue {
  margin-top: $space-lg;
  font-size: $text-xs;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba($cream, 0.5);
}

.cerrada__redes {
  display: flex;
  flex-wrap: wrap;
  gap: $space-sm;
  margin-top: $space-xs;
  list-style: none;
  padding: 0;

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    border: 1px solid rgba($cream, 0.18);
    border-radius: $radius-pill;
    font-size: $text-sm;
    color: $cream;
    transition: border-color 0.26s, background-color 0.26s;

    &:hover {
      border-color: $rose-soft;
      background-color: rgba($rose-soft, 0.12);
    }

    @include focus-ring($rose-soft);
  }
}
</style>
