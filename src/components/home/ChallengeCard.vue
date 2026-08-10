<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import CldImage from '@/components/ui/CldImage.vue'
import { useCheckout } from '@/composables/useCheckout'
import type { Challenge } from '@/config/site'
import type { Photo } from '@/config/photos'

defineProps<{ challenge: Challenge; photo: Photo; index: number }>()

const { open } = useCheckout()
</script>

<template>
  <article class="challenge">
    <div class="challenge__media">
      <CldImage
        :public-id="photo.id"
        :alt="photo.alt"
        ratio="4:5"
        sizes="(min-width: 900px) 46vw, 100vw"
      />
      <span class="challenge__index">0{{ index + 1 }}</span>
    </div>

    <div class="challenge__body">
      <h3 class="challenge__name">{{ challenge.name }}</h3>
      <p class="challenge__claim">{{ challenge.claim }}</p>
      <p class="challenge__description">{{ challenge.description }}</p>

      <ul class="challenge__bullets">
        <li v-for="bullet in challenge.bullets" :key="bullet">{{ bullet }}</li>
      </ul>

      <p class="challenge__for">{{ challenge.forWho }}</p>

      <BaseButton variant="ghost" @click="open(challenge.id)">
        Elegir {{ challenge.name }}
      </BaseButton>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.challenge {
  display: flex;
  flex-direction: column;
  background-color: $cream;
  border: 1px solid rgba($ink, 0.07);
  border-radius: $radius-lg;
  overflow: hidden;
  transition:
    transform 0.5s $ease,
    box-shadow 0.5s $ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: $shadow-md;
  }
}

.challenge__media {
  position: relative;
}

.challenge__index {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.35rem 0.8rem;
  border-radius: $radius-pill;
  background-color: rgba($cream, 0.9);
  backdrop-filter: blur(6px);
  font-family: $font-display;
  font-size: $text-sm;
  color: $wine;
}

.challenge__body {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: clamp(1.5rem, 3vw, 2.2rem);
}

.challenge__name {
  font-size: $display-sm;
  letter-spacing: -0.015em;
}

.challenge__claim {
  @include eyebrow;
}

.challenge__description {
  color: $ink-soft;
}

.challenge__bullets {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  list-style: none;
  padding-top: $space-xs;
  font-size: $text-sm;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    color: $ink-soft;

    &::before {
      content: '—';
      color: $rose;
      flex: none;
    }
  }
}

.challenge__for {
  margin-top: auto;
  padding: 0.85rem 1.1rem;
  border-radius: $radius-sm;
  background-color: $rose-soft;
  color: $wine;
  font-size: $text-sm;
  font-weight: 500;
}
</style>
