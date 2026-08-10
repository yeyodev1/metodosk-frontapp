<script setup lang="ts">
import { computed, ref } from 'vue'
import { cldBlur, cldImage, cldSrcset } from '@/composables/useCloudinary'

const props = withDefaults(
  defineProps<{
    /** public_id de Cloudinary, ej. 'metodosk/sk-07'. */
    publicId: string
    alt: string
    /** Relación de aspecto del recorte, ej. '3:4'. */
    ratio?: string
    /** Atributo sizes para elegir la variante correcta del srcset. */
    sizes?: string
    /** El hero no debe cargar en lazy. */
    priority?: boolean
    /** 'face' para recortes redondos donde la cara manda. */
    gravity?: 'auto' | 'face' | 'center'
  }>(),
  { ratio: '3:4', sizes: '(min-width: 768px) 50vw, 100vw', priority: false, gravity: 'auto' },
)

const loaded = ref(false)

const src = computed(() =>
  cldImage(props.publicId, { width: 1080, ratio: props.ratio, gravity: props.gravity }),
)
const srcset = computed(() =>
  cldSrcset(props.publicId, { ratio: props.ratio, gravity: props.gravity }),
)
const placeholder = computed(() => cldBlur(props.publicId))

const aspect = computed(() => props.ratio.replace(':', ' / '))
</script>

<template>
  <figure
    class="cld-image"
    :style="{ aspectRatio: aspect, backgroundImage: `url(${placeholder})` }"
  >
    <img
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="alt"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      decoding="async"
      :class="{ 'is-loaded': loaded }"
      @load="loaded = true"
    />
  </figure>
</template>

<style lang="scss" scoped>
.cld-image {
  position: relative;
  overflow: hidden;
  margin: 0;
  background-color: $sand;
  background-size: cover;
  background-position: center;
  border-radius: $radius-md;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.03);
    transition:
      opacity 0.7s $ease,
      transform 1.2s $ease;
  }

  img.is-loaded {
    opacity: 1;
    transform: none;
  }
}
</style>
