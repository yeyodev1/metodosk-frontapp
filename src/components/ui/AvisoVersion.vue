<script setup lang="ts">
/**
 * "Hay una versión nueva".
 *
 * Aparece abajo y no tapa nada: la alumna puede seguir en lo suyo y actualizar
 * cuando quiera. No se recarga sola a propósito — podría estar a medio video o
 * escribiendo en el muro, y perder eso por una mejora nuestra sería peor que
 * la mejora.
 */
import { useNuevaVersion } from '@/composables/useNuevaVersion'

const { hayNueva, actualizar } = useNuevaVersion()
</script>

<template>
  <Transition name="aviso">
    <div v-if="hayNueva" class="aviso" role="status">
      <span class="aviso__texto">
        <FaIcon icon="circle-play" />
        Hay una versión nueva de la app
      </span>
      <button type="button" class="aviso__boton" @click="actualizar">Actualizar</button>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.aviso {
  position: fixed;
  right: clamp(0.8rem, 3vw, 1.5rem);
  bottom: clamp(0.8rem, 3vw, 1.5rem);
  z-index: 80;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.9rem;
  max-width: calc(100vw - 1.6rem);
  padding: 0.8rem 0.9rem 0.8rem 1.1rem;
  border-radius: $radius-pill;
  background-color: $ink;
  box-shadow: $shadow-md;
}

.aviso__texto {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: $text-xs;
  font-weight: 500;
  color: $cream;

  svg {
    color: $rose-soft;
  }
}

.aviso__boton {
  padding: 0.45rem 1rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink;
  cursor: pointer;

  &:hover {
    background-color: $rose-soft;
  }

  @include focus-ring;
}

.aviso-enter-active,
.aviso-leave-active {
  transition: opacity 0.3s $ease, transform 0.3s $ease;
}

.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
  transform: translateY(0.6rem);
}

@include reduced-motion {
  .aviso-enter-active,
  .aviso-leave-active {
    transition: none;
  }
}
</style>
