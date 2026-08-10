<script setup lang="ts">
import CldImage from '@/components/ui/CldImage.vue'
import { photo } from '@/config/media'
import type { Creator } from '@/config/site'

const props = defineProps<{ creator: Creator }>()

const image = photo(props.creator.photo)
</script>

<template>
  <article class="creator">
    <CldImage
      class="creator__photo"
      :public-id="image.id"
      :alt="`${creator.name}, ${creator.role.toLowerCase()} del Método SK`"
      ratio="1:1"
      gravity="face"
      sizes="(min-width: 768px) 20vw, 40vw"
    />

    <div class="creator__body">
      <p class="creator__role">{{ creator.role }}</p>
      <h3 class="creator__name">{{ creator.name }}</h3>
      <p class="creator__text">{{ creator.text }}</p>

      <a class="creator__ig" :href="creator.instagram" target="_blank" rel="noopener">
        {{ creator.handle }}
      </a>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.creator {
  flex: 1 1 260px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: clamp(1.8rem, 3vw, 2.4rem) 1.6rem;
  text-align: center;
  border: 1px solid rgba($cream, 0.16);
  border-radius: $radius-lg;
  // Vidrio sobre las fotos del parallax: deja ver el fondo sin perder lectura.
  background: linear-gradient(rgba($cream, 0.11), rgba($cream, 0.04));
  backdrop-filter: blur(16px) saturate(1.1);
  box-shadow: $shadow-lg;
  transition:
    border-color 0.4s $ease,
    box-shadow 0.4s $ease,
    transform 0.4s $ease;

  &:hover {
    border-color: rgba($rose, 0.65);
    box-shadow:
      $shadow-lg,
      0 0 0 1px rgba($rose, 0.25);
    transform: translateY(-6px);
  }
}

.creator__photo {
  width: clamp(120px, 16vw, 148px);
  border-radius: 50%;
  margin-bottom: 0.8rem;
  border: 2px solid rgba($rose, 0.55);
  box-shadow: 0 12px 34px rgba(#100c0b, 0.55);
}

.creator__body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.creator__role {
  @include eyebrow;
  align-self: center;
  padding: 0.28rem 0.7rem;
  border-radius: $radius-pill;
  background-color: rgba($rose, 0.18);
  color: $rose-soft;
}

.creator__name {
  @include display($text-xl);
  color: $cream;
}

.creator__text {
  font-size: $text-sm;
  color: rgba($cream, 0.75);
}

.creator__ig {
  margin-top: 0.4rem;
  font-size: $text-xs;
  letter-spacing: 0.04em;
  color: $rose;
  transition: color 0.3s $ease;

  @include focus-ring($rose);

  &:hover {
    color: $rose-soft;
    text-decoration: underline;
  }
}
</style>
