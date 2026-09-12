<script setup lang="ts">
/**
 * Una página de la guía en imagen, con su espera a la vista.
 *
 * Estas imágenes se piden al tocar "Ver las marcas", así que no van perezosas:
 * se cargan de inmediato. Y mientras llegan se ve el hueco latiendo — sin eso
 * el botón parecía no hacer nada y se tocaba dos veces.
 */
import { ref } from 'vue'

defineProps<{ src: string; alt: string }>()

const cargada = ref(false)
const fallo = ref(false)
</script>

<template>
  <figure class="img" :class="{ 'img--lista': cargada }">
    <img
      :src="src"
      :alt="alt"
      loading="eager"
      decoding="async"
      @load="cargada = true"
      @error="fallo = true"
    />
    <figcaption v-if="!cargada && !fallo" class="img__espera">Cargando…</figcaption>
    <figcaption v-else-if="fallo" class="img__fallo">
      No se pudo cargar esta página. Revisa tu conexión y vuelve a abrirla.
    </figcaption>
  </figure>
</template>

<style lang="scss" scoped>
.img {
  position: relative;
  display: flex;
  flex: 1 1 260px;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  margin: 0;
  overflow: hidden;
  border-radius: $radius-sm;
  background-color: $bone;
}

/* El hueco late mientras llega; al cargar, la imagen manda el alto. */
.img:not(.img--lista) {
  animation: latir 1.4s ease-in-out infinite;
}

.img--lista {
  min-height: 0;
  animation: none;
  background-color: transparent;
}

img {
  width: 100%;
  max-width: 100%;
  opacity: 0;
  transition: opacity 0.3s $ease;
}

.img--lista img {
  opacity: 1;
}

.img__espera,
.img__fallo {
  position: absolute;
  padding: 0 1rem;
  font-size: $text-xs;
  color: $ink-muted;
  text-align: center;
}

.img__fallo {
  color: $wine;
}

@keyframes latir {
  0%,
  100% {
    background-color: $bone;
  }
  50% {
    background-color: $sand;
  }
}

@media (prefers-reduced-motion: reduce) {
  .img:not(.img--lista) {
    animation: none;
  }

  img {
    transition: none;
  }
}
</style>
