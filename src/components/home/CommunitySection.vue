<script setup lang="ts">
import { computed, ref } from 'vue'
import CommunityBand from './CommunityBand.vue'
import CreatorCard from './CreatorCard.vue'
import { cldImage } from '@/composables/useCloudinary'
import { useParallax } from '@/composables/useParallax'
import { COMMUNITY, CREATORS } from '@/config/site'
import { GALLERY } from '@/config/photos'

const root = ref<HTMLElement | null>(null)
const { shift } = useParallax(root)

// Cuatro columnas a distinta velocidad: eso es lo que crea la profundidad.
// `depth` (0 = al frente, 1 = al fondo) controla escala, brillo y desenfoque:
// lo que está lejos se mueve poco, se ve más apagado y más borroso.
const COLUMNS = [
  { speed: -300, depth: 0.1, photos: [0, 3, 6, 9] },
  { speed: 190, depth: 0.65, photos: [1, 4, 7, 0] },
  { speed: -370, depth: 0, photos: [2, 5, 8, 1] },
  { speed: 230, depth: 0.8, photos: [4, 9, 3, 7] },
]

// El desenfoque lo hace Cloudinary, no CSS: `filter: blur()` sobre una capa que
// se mueve en cada frame mata el scroll en móvil.
const src = (index: number, depth: number) =>
  cldImage(GALLERY[index % GALLERY.length]!.id, {
    width: depth > 0.5 ? 420 : 600,
    ratio: '3:4',
    blur: depth > 0.5 ? 180 : 0,
  })

// Solo transform y opacity: las dos propiedades que el compositor anima gratis.
const columnStyle = (column: (typeof COLUMNS)[number]) => ({
  transform: shift(column.speed),
  opacity: (1 - column.depth * 0.42).toFixed(2),
})

// El copy y las tarjetas viajan en sentido contrario al fondo. Esa diferencia
// es lo que hace que el parallax se lea, no la velocidad de las fotos.
const copyStyle = computed(() => ({ transform: shift(70) }))
const creatorsStyle = computed(() => ({ transform: shift(-55) }))
const glowStyle = computed(() => ({ transform: shift(120) }))
</script>

<template>
  <section ref="root" id="creadoras" class="community">
    <div class="community__stage" aria-hidden="true">
      <div
        v-for="(column, index) in COLUMNS"
        :key="index"
        class="column"
        :class="`column--${index + 1}`"
        :style="columnStyle(column)"
      >
        <img
          v-for="photo in column.photos"
          :key="photo"
          :src="src(photo, column.depth)"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>

    <div class="community__scrim" aria-hidden="true" />
    <div class="community__glow" aria-hidden="true" :style="glowStyle" />

    <div class="community__content">
      <div class="community__copy" :style="copyStyle">
        <p class="community__eyebrow">{{ COMMUNITY.eyebrow }}</p>
        <h2 class="community__title">{{ COMMUNITY.title }}</h2>
        <p class="community__text">{{ COMMUNITY.text }}</p>
      </div>

      <div class="community__creators" :style="creatorsStyle">
        <CreatorCard v-for="creator in CREATORS" :key="creator.name" :creator="creator" />
      </div>
    </div>

    <CommunityBand />
  </section>
</template>

<style lang="scss" scoped>
.community {
  position: relative;
  background-color: $ink;
  color: rgba($cream, 0.82);
  overflow: hidden;
  isolation: isolate;
}

// El escenario sobresale por arriba y por abajo: ese sobrante es el recorrido
// que tienen las columnas para moverse sin dejar huecos.
.community__stage {
  position: absolute;
  inset: -45% 0;
  z-index: 0;
  display: flex;
  gap: clamp(0.6rem, 1.4vw, 1.1rem);
  padding-inline: clamp(0.6rem, 1.4vw, 1.1rem);
}

.column {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1.4vw, 1.1rem);
  will-change: transform;

  // Columnas 3 y 4 solo cuando hay ancho para que respiren.
  &--3 {
    display: none;

    @include from('md') {
      display: flex;
    }
  }

  &--4 {
    display: none;

    @include from('lg') {
      display: flex;
    }
  }

  // Las fotos se reparten el alto del escenario: así la columna siempre lo
  // llena y nunca aparece un hueco al desplazarse.
  img {
    flex: 1 1 0;
    width: 100%;
    min-height: 0;
    object-fit: cover;
    border-radius: $radius-md;
  }
}

.community__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  // Más claro en el centro que antes: si el fondo no se ve, el parallax no existe.
  background:
    radial-gradient(ellipse 80% 60% at 50% 45%, rgba(#100c0b, 0.86), transparent 78%),
    linear-gradient(
      to bottom,
      rgba(#100c0b, 0.94) 0%,
      rgba(#100c0b, 0.42) 30%,
      rgba(#100c0b, 0.4) 62%,
      rgba(#100c0b, 0.95) 100%
    );
}

// Halo de color que se mueve por su cuenta: da una capa más de profundidad.
.community__glow {
  position: absolute;
  inset: -20% 0;
  z-index: 1;
  will-change: transform;
  background: radial-gradient(ellipse 55% 45% at 50% 50%, rgba($wine, 0.55), transparent 70%);
  mix-blend-mode: screen;
  pointer-events: none;
}

.community__content {
  @include container(980px);
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-lg;
  padding-block: clamp(7rem, 20vw, 14rem);
  text-align: center;
}

.community__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-sm;
  will-change: transform;
  // Sombra ancha detrás del texto para que se lea sobre las fotos.
  text-shadow: 0 2px 24px rgba(#100c0b, 0.9);
}

.community__eyebrow {
  @include eyebrow;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: $rose;

  &::before,
  &::after {
    content: '';
    width: clamp(24px, 6vw, 54px);
    height: 1px;
    background-color: rgba($rose, 0.5);
  }
}

.community__title {
  @include display($display-lg);
  color: $cream;
  white-space: pre-line;
}

.community__text {
  max-width: 54ch;
  font-size: $text-lg;
}

.community__creators {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(1rem, 2.5vw, 1.75rem);
  width: 100%;
  will-change: transform;
}

@include reduced-motion {
  .column,
  .community__copy,
  .community__creators,
  .community__glow {
    transform: none !important;
  }
}
</style>
