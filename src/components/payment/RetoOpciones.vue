<script setup lang="ts">
/**
 * Elegir el reto, como un grupo de radio con tarjetas.
 *
 * Se puede cambiar en cualquier momento mientras se llena el formulario: en
 * el modal elegir era un paso que desaparecía, y quien dudaba tenía que
 * cerrar todo y empezar de nuevo.
 */
import { CHALLENGES, type Challenge } from '@/config/site'

defineProps<{ modelValue: Challenge['id'] | null; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [Challenge['id']] }>()
</script>

<template>
  <div class="opciones" role="radiogroup" aria-label="Elige tu reto">
    <button
      v-for="reto in CHALLENGES"
      :key="reto.id"
      type="button"
      role="radio"
      class="opcion"
      :class="{ 'opcion--on': modelValue === reto.id }"
      :aria-checked="modelValue === reto.id"
      :disabled="disabled"
      @click="emit('update:modelValue', reto.id)"
    >
      <span class="opcion__radio" aria-hidden="true" />
      <span class="opcion__texto">
        <span class="opcion__nombre">{{ reto.name }}</span>
        <span class="opcion__claim">{{ reto.claim }}</span>
        <span class="opcion__para">{{ reto.forWho }}</span>
      </span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.opciones {
  @include flex-cards(240px, 0.75rem);
}

.opcion {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.05rem 1.1rem;
  border: 1px solid rgba($ink, 0.14);
  border-radius: $radius-md;
  background-color: $cream;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color 0.25s $ease,
    box-shadow 0.25s $ease,
    background-color 0.25s $ease;

  &:hover:not(:disabled) {
    border-color: rgba($ink, 0.45);
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  @include focus-ring($rose-deep);
}

.opcion--on {
  border-color: $ink;
  background-color: $white;
  box-shadow: 0 0 0 1px $ink, $shadow-sm;
}

.opcion__radio {
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 0.2rem;
  border: 1.5px solid rgba($ink, 0.4);
  border-radius: 50%;
  transition: border-color 0.2s $ease, box-shadow 0.2s $ease;

  .opcion--on & {
    border-color: $ink;
    box-shadow: inset 0 0 0 4px $white, inset 0 0 0 10px $ink;
  }
}

.opcion__texto {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.opcion__nombre {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.opcion__claim {
  font-size: $text-sm;
  color: $ink-soft;
}

.opcion__para {
  font-size: $text-xs;
  color: $ink-muted;
}
</style>
