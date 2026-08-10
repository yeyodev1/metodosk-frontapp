<script setup lang="ts">
import { ref } from 'vue'
import CommunityBand from './CommunityBand.vue'
import CreatorCard from './CreatorCard.vue'
import { cldImage } from '@/composables/useCloudinary'
import { useParallax } from '@/composables/useParallax'
import { COMMUNITY, CREATORS } from '@/config/site'
import { GALLERY } from '@/config/photos'

const root = ref<HTMLElement | null>(null)
const { shift } = useParallax(root)

// Tres columnas que se mueven a distinta velocidad: eso es lo que crea la
// profundidad. Las de los extremos suben, la del centro baja.
const COLUMNS = [
  { speed: -120, photos: [0, 3, 6] },
  { speed: 90, photos: [1, 4, 7] },
  { speed: -170, photos: [2, 5, 8] },
]

const src = (index: number) =>
  cldImage(GALLERY[index % GALLERY.length]!.id, { width: 600, ratio: '3:4' })
</script>

<template>
  <section ref="root" class="community">
    <div class="community__stage" aria-hidden="true">
      <div
        v-for="(column, index) in COLUMNS"
        :key="index"
        class="column"
        :style="{ transform: shift(column.speed) }"
      >
        <img v-for="photo in column.photos" :key="photo" :src="src(photo)" alt="" />
      </div>
    </div>

    <div class="community__scrim" />

    <div class="community__content">
      <p class="community__eyebrow">{{ COMMUNITY.eyebrow }}</p>
      <h2 class="community__title">{{ COMMUNITY.title }}</h2>
      <p class="community__text">{{ COMMUNITY.text }}</p>

      <div class="community__creators">
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
  color: rgba($cream, 0.78);
  overflow: hidden;
  isolation: isolate;
}

.community__stage {
  position: absolute;
  inset: -18% 0;
  z-index: 0;
  display: flex;
  gap: 1rem;
  padding-inline: 1rem;
}

.column {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  will-change: transform;

  // La tercera columna solo aparece cuando hay ancho para que respire
  &:nth-child(3) {
    display: none;

    @include from('md') {
      display: flex;
    }
  }

  img {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: $radius-md;
  }
}

.community__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(
      to bottom,
      rgba(#100c0b, 0.95) 0%,
      rgba(#100c0b, 0.78) 35%,
      rgba(#100c0b, 0.88) 70%,
      rgba(#100c0b, 0.97) 100%
    ),
    radial-gradient(ellipse at 50% 40%, rgba($wine, 0.4), transparent 65%);
}

.community__content {
  @include container(900px);
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-md;
  padding-block: clamp(6rem, 16vw, 11rem);
  text-align: center;
}

.community__eyebrow {
  @include eyebrow;
  color: $rose;
}

.community__title {
  @include display($display-md);
  color: $cream;
  white-space: pre-line;
}

.community__text {
  max-width: 52ch;
}

.community__creators {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-md;
  width: 100%;
  margin-top: $space-md;
}

@include reduced-motion {
  .column {
    transform: none !important;
  }
}
</style>
