<script setup lang="ts">
/**
 * El marco de cada sección de la guía.
 *
 * Todas se ven igual —título, una línea que explica, y el contenido— así que
 * el encabezado vive acá y no repetido en las ocho pantallas.
 */
defineProps<{ titulo: string; sub?: string | null }>()
</script>

<template>
  <section class="sec">
    <header class="sec__head">
      <h1 class="sec__title">{{ titulo }}</h1>
      <p v-if="sub" class="sec__sub">{{ sub }}</p>
    </header>
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.sec {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.sec__head {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sec__title {
  font-family: $font-display;
  font-size: $text-xl;
  line-height: 1.1;
  color: $ink;
}

.sec__sub {
  max-width: 62ch;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}
</style>
