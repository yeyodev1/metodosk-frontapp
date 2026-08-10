<script setup lang="ts">
import { computed } from 'vue'
import { cldImage } from '@/composables/useCloudinary'
import { PHOTOS } from '@/config/media'

const props = withDefaults(defineProps<{ columns?: number }>(), { columns: 5 })

/**
 * Reparte todas las fotos del shoot en columnas y duplica cada una para que
 * la animación cierre el ciclo sin salto visible.
 */
const wall = computed(() =>
  Array.from({ length: props.columns }, (_, column) => {
    const photos = PHOTOS.filter((_, index) => index % props.columns === column)
    return {
      // Columnas pares suben, impares bajan; duraciones distintas para que
      // nunca se sincronicen entre sí.
      direction: column % 2 === 0 ? 'up' : 'down',
      duration: `${46 + column * 9}s`,
      items: [...photos, ...photos],
    }
  }),
)

const src = (id: string) => cldImage(id, { width: 500, ratio: '3:4' })
</script>

<template>
  <div class="wall" aria-hidden="true">
    <div
      v-for="(column, index) in wall"
      :key="index"
      class="wall__column"
      :class="`wall__column--${column.direction}`"
      :style="{ animationDuration: column.duration }"
    >
      <img
        v-for="(item, position) in column.items"
        :key="`${item.id}-${position}`"
        :src="src(item.id)"
        alt=""
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wall {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  overflow: hidden;
}

.wall__column {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: max-content;
  will-change: transform;
  animation-name: drift-up;
  animation-timing-function: linear;
  animation-iteration-count: infinite;

  // En pantallas chicas solo caben dos columnas sin que las fotos se
  // conviertan en tiras ilegibles.
  &:nth-child(n + 3) {
    display: none;
  }

  @include from('sm') {
    &:nth-child(3) {
      display: flex;
    }
  }

  @include from('md') {
    &:nth-child(4) {
      display: flex;
    }
  }

  @include from('lg') {
    &:nth-child(5) {
      display: flex;
    }
  }

  img {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: $radius-sm;
  }
}

.wall__column--down {
  animation-name: drift-down;
}

@keyframes drift-up {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, -50%, 0);
  }
}

@keyframes drift-down {
  from {
    transform: translate3d(0, -50%, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@include reduced-motion {
  .wall__column {
    animation: none;
    transform: translate3d(0, -25%, 0);
  }
}
</style>
