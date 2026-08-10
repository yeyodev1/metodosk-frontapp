<script setup lang="ts">
import { computed, ref } from 'vue'
import { cldImage, cldSrcset } from '@/composables/useCloudinary'
import { useParallax } from '@/composables/useParallax'
import { COMMUNITY } from '@/config/site'
import { GALLERY } from '@/config/photos'

// La única foto horizontal del shoot: funciona como cierre a todo lo ancho.
const wide = GALLERY[0]!

const root = ref<HTMLElement | null>(null)
const { progress } = useParallax(root)

const src = cldImage(wide.id, { width: 1600, ratio: '16:9' })
const srcset = cldSrcset(wide.id, { ratio: '16:9' }, [768, 1200, 1600, 2000])

// La imagen es más alta que su marco y se desplaza dentro de él: el recorte
// cambia con el scroll y por eso se percibe profundidad.
const imageStyle = computed(() => ({
  transform: `translate3d(0, ${(progress.value * 8).toFixed(2)}%, 0) scale(1.18)`,
}))
</script>

<template>
  <div ref="root" class="band">
    <div class="band__frame">
      <img
        :src="src"
        :srcset="srcset"
        sizes="100vw"
        :alt="wide.alt"
        loading="lazy"
        decoding="async"
        :style="imageStyle"
      />
      <div class="band__scrim" />

      <div class="band__copy">
        <h3 class="band__title">{{ COMMUNITY.closing.title }}</h3>
        <p class="band__text">{{ COMMUNITY.closing.text }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.band {
  position: relative;
  z-index: 2;
}

.band__frame {
  position: relative;
  height: clamp(300px, 56vh, 560px);
  overflow: hidden;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 42%;
    will-change: transform;
  }
}

.band__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(#100c0b, 0.92) 0%,
    rgba(#100c0b, 0.35) 55%,
    rgba(#100c0b, 0.55) 100%
  );
}

.band__copy {
  position: absolute;
  inset: auto 0 0;
  @include container(1000px);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-bottom: clamp(2rem, 5vw, 3.5rem);
  color: rgba($cream, 0.8);
}

.band__title {
  @include display($display-sm);
  color: $cream;
}

.band__text {
  max-width: 46ch;
  font-size: $text-sm;
}

@include reduced-motion {
  .band__frame img {
    transform: none !important;
  }
}
</style>
