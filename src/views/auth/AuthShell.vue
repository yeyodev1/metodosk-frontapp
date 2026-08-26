<script setup lang="ts">
/**
 * Marco de las pantallas de acceso.
 *
 * La fotografía no decora: lleva la frase que define la pantalla. En el
 * registro es donde se dice, sin que se pueda pasar por alto, que el acceso
 * se compra. Por eso el texto entra por props y no está fijo acá.
 */
import { onMounted, ref } from 'vue'
import CldImage from '@/components/ui/CldImage.vue'

withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    /** Frase sobre la foto. Es el mensaje central de la pantalla. */
    quote: string
    /** Línea de apoyo bajo la frase. */
    quoteFoot?: string
    /** public_id de Cloudinary. */
    photo?: string
  }>(),
  { photo: 'metodosk/sk-07' },
)

// Un frame antes de animar: si no, la entrada se pierde con el montaje.
const listo = ref(false)
onMounted(() => requestAnimationFrame(() => (listo.value = true)))
</script>

<template>
  <div class="acceso" :class="{ 'is-listo': listo }">
    <!-- Columna de imagen -->
    <aside class="foto">
      <CldImage
        class="foto__img"
        :public-id="photo"
        alt=""
        ratio="4:5"
        sizes="(min-width: 900px) 50vw, 100vw"
        priority
      />
      <div class="foto__velo" />

      <div class="foto__texto">
        <a class="marca" href="/">
          <span class="marca__sello">SK</span>
          <span class="marca__nombre">Método SK</span>
        </a>

        <blockquote class="frase">{{ quote }}</blockquote>
        <p v-if="quoteFoot" class="frase__pie">{{ quoteFoot }}</p>
      </div>
    </aside>

    <!-- Columna de formulario -->
    <main class="panel">
      <div class="panel__inner">
        <header class="panel__head">
          <p v-if="eyebrow" class="panel__eyebrow">{{ eyebrow }}</p>
          <h1 class="panel__title">{{ title }}</h1>
          <p v-if="lead" class="panel__lead">{{ lead }}</p>
        </header>

        <slot />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.acceso {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  background-color: $bone;

  @include from('md') {
    grid-template-columns: 1.05fr 1fr;
  }
}

/* ─────────────── Columna de imagen ─────────────── */
.foto {
  position: relative;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  min-height: 210px;
  background-color: $ink;

  @include from('md') {
    min-height: 100vh;
  }
}

.foto__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  aspect-ratio: auto !important;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Deriva lentísima: da vida sin llamar la atención. */
    animation: deriva 26s ease-in-out infinite alternate;
  }
}

@keyframes deriva {
  from {
    transform: scale(1.04) translate3d(0, 0, 0);
  }
  to {
    transform: scale(1.12) translate3d(-1.5%, -1.5%, 0);
  }
}

/* El degradado nace abajo para que el texto se lea siempre. */
.foto__velo {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba($ink, 0.92) 0%,
    rgba($ink, 0.55) 42%,
    rgba($ink, 0.2) 100%
  );
}

.foto__texto {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  width: 100%;
  padding: clamp(1.4rem, 4vw, 3rem);
}

.marca {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: auto;
  font-family: $font-display;
  font-size: 1rem;
  color: $cream;
}

.marca__sello {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $ink;
  font-size: 0.8rem;
  font-style: italic;
}

.frase {
  max-width: 15ch;
  margin: 0;
  font-family: $font-display;
  font-size: clamp(1.5rem, 5.2vw, 2.9rem);
  font-weight: 300;
  line-height: 1.08;
  letter-spacing: -0.015em;
  color: $cream;

  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s,
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
}

.frase__pie {
  max-width: 30ch;
  font-size: $text-sm;
  line-height: 1.55;
  color: rgba($cream, 0.72);

  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.24s,
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.24s;
}

.is-listo .frase,
.is-listo .frase__pie {
  opacity: 1;
  transform: none;
}

/* ─────────────── Columna de formulario ─────────────── */
.panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 7vw, 4rem) clamp(1.25rem, 5vw, 3.5rem);
}

.panel__inner {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  width: min(390px, 100%);

  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.18s,
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.18s;
}

.is-listo .panel__inner {
  opacity: 1;
  transform: none;
}

.panel__head {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.panel__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.panel__title {
  font-family: $font-display;
  font-size: clamp(1.6rem, 4.5vw, 2.1rem);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.015em;
  color: $ink;
}

.panel__lead {
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

/* ─── Formulario: definido acá para que lo hereden las pantallas del slot ─── */
.panel__inner :deep(.form) {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.panel__inner :deep(.field) {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.panel__inner :deep(.field > span:not(.field__hint)) {
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $ink-muted;
}

.panel__inner :deep(.field input) {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid rgba($ink, 0.14);
  border-radius: $radius-sm;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-base;
  color: $ink;
  transition:
    border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.panel__inner :deep(.field input:focus) {
  outline: none;
  border-color: $rose-deep;
  box-shadow: 0 0 0 3px rgba($rose, 0.18);
}

.panel__inner :deep(.field input:disabled) {
  background-color: $sand;
  color: $ink-muted;
}

.panel__inner :deep(.field > .field__hint) {
  font-size: $text-xs;
  color: $ink-muted;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 400;
}

.panel__inner :deep(.form__error) {
  padding: 0.7rem 0.9rem;
  border-radius: $radius-sm;
  border-left: 2px solid $alert-error;
  background-color: rgba($alert-error, 0.07);
  font-size: $text-sm;
  color: $alert-error;
}

.panel__inner :deep(.alt) {
  font-size: $text-sm;
  color: $ink-soft;
  text-align: center;
}

.panel__inner :deep(.alt a) {
  color: $rose-deep;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Bloques de aviso (sin compra, ya tiene cuenta, compra encontrada). */
.panel__inner :deep(.aviso) {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: 1.1rem 1.2rem;
  border-radius: $radius-md;
  border: 1px solid rgba($rose-deep, 0.22);
  background-color: rgba($rose-soft, 0.4);
}

.panel__inner :deep(.aviso__title) {
  font-family: $font-display;
  font-size: 1.15rem;
  font-weight: 400;
  color: $ink;
}

.panel__inner :deep(.aviso__text) {
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

@media (prefers-reduced-motion: reduce) {
  .foto__img :deep(img) {
    animation: none;
  }

  .frase,
  .frase__pie,
  .panel__inner {
    transition-duration: 0.01ms;
  }
}
</style>
