<script setup lang="ts">
import CldImage from '@/components/ui/CldImage.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { INCLUDES } from '@/config/site'
import { PHOTO } from '@/config/photos'
</script>

<template>
  <section id="incluye" class="includes">
    <div class="includes__inner">
      <SectionHeading :eyebrow="INCLUDES.eyebrow" :title="INCLUDES.title" align="center" />

      <div class="includes__list">
        <article
          v-for="(item, index) in INCLUDES.items"
          :key="item.title"
          v-reveal="index * 80"
          class="feature"
        >
          <span class="feature__icon" aria-hidden="true">{{ item.icon }}</span>
          <h3 class="feature__title">{{ item.title }}</h3>
          <p class="feature__text">{{ item.text }}</p>
        </article>
      </div>

      <div class="includes__strip">
        <figure class="includes__shot" v-reveal>
          <CldImage
            :public-id="PHOTO.training.id"
            :alt="PHOTO.training.alt"
            ratio="4:5"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <figcaption>Entrenamiento</figcaption>
        </figure>
        <figure class="includes__shot" v-reveal="100">
          <CldImage
            :public-id="PHOTO.nutrition.id"
            :alt="PHOTO.nutrition.alt"
            ratio="4:5"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <figcaption>Nutrición</figcaption>
        </figure>
        <figure class="includes__shot" v-reveal="200">
          <CldImage
            :public-id="PHOTO.guide.id"
            :alt="PHOTO.guide.alt"
            ratio="4:5"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <figcaption>La guía</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.includes {
  padding-block: $space-section;
}

.includes__inner {
  @include container;
  display: flex;
  flex-direction: column;
  gap: $space-xl;
}

.includes__list {
  @include flex-cards(260px, clamp(1rem, 2.5vw, 2rem));
}

.feature {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: clamp(1.4rem, 3vw, 1.9rem);
  background-color: $cream;
  border: 1px solid rgba($ink, 0.06);
  border-radius: $radius-md;
  transition:
    border-color 0.4s $ease,
    transform 0.4s $ease;

  &:hover {
    border-color: rgba($rose, 0.5);
    transform: translateY(-4px);
  }
}

.feature__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
  font-size: 1.1rem;
}

.feature__title {
  font-family: $font-principal;
  font-size: $text-base;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.feature__text {
  font-size: $text-sm;
  color: $ink-soft;
}

.includes__strip {
  @include flex-cards(220px, 1rem);
}

.includes__shot {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;

  figcaption {
    @include eyebrow;
    color: $ink-muted;
  }
}
</style>
