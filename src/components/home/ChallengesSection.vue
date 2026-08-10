<script setup lang="ts">
import ChallengeCard from './ChallengeCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { CHALLENGES } from '@/config/site'
import { PHOTO } from '@/config/photos'

const photoFor = (id: string) => (id === 'volumen' ? PHOTO.volumen : PHOTO.recomposicion)
</script>

<template>
  <section id="retos" class="challenges">
    <div class="challenges__inner">
      <SectionHeading
        eyebrow="Elige tu reto"
        title="Dos caminos. El mismo método."
        align="center"
      >
        Ambos duran 3 meses y traen entrenamiento y nutrición. Cambia el objetivo,
        y con él la estrategia.
      </SectionHeading>

      <div class="challenges__list">
        <ChallengeCard
          v-for="(challenge, index) in CHALLENGES"
          :key="challenge.id"
          v-reveal="index * 120"
          :challenge="challenge"
          :photo="photoFor(challenge.id)"
          :index="index"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.challenges {
  padding-block: $space-section;
  background-color: $sand;
}

.challenges__inner {
  @include container;
  display: flex;
  flex-direction: column;
  gap: $space-xl;
}

.challenges__list {
  @include flex-cards(340px, clamp(1.5rem, 3vw, 2.5rem));
  align-items: stretch;
}
</style>
