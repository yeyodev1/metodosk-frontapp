<script setup lang="ts">
import CldImage from '@/components/ui/CldImage.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { PROMISE } from '@/config/site'
import { PHOTO } from '@/config/photos'
</script>

<template>
  <section id="metodo" class="promise">
    <div class="promise__inner">
      <div class="promise__media" v-reveal>
        <CldImage
          :public-id="PHOTO.promise.id"
          :alt="PHOTO.promise.alt"
          ratio="4:5"
          sizes="(min-width: 900px) 44vw, 100vw"
        />
        <p class="promise__caption">Scarlet Córdova · entrenamiento del Método SK</p>
      </div>

      <div class="promise__text" v-reveal="120">
        <SectionHeading :eyebrow="PROMISE.eyebrow" :title="PROMISE.title" />

        <p v-for="paragraph in PROMISE.paragraphs" :key="paragraph" class="promise__paragraph">
          {{ paragraph }}
        </p>

        <ul class="promise__list">
          <li v-for="item in PROMISE.highlights" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.promise {
  padding-block: $space-section;
}

.promise__inner {
  @include container;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(2rem, 5vw, 4.5rem);
}

.promise__media {
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  max-width: 520px;
}

.promise__caption {
  font-size: $text-xs;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: $ink-muted;
}

.promise__text {
  flex: 1 1 380px;
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.promise__paragraph {
  max-width: 52ch;
  color: $ink-soft;
}

.promise__list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  list-style: none;
  margin-top: $space-xs;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    font-size: $text-sm;
    font-weight: 500;

    &::before {
      content: '';
      flex: none;
      width: 7px;
      height: 7px;
      margin-top: 0.55em;
      border-radius: 50%;
      background-color: $rose;
    }
  }
}
</style>
