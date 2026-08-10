<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import { cldImage } from '@/composables/useCloudinary'
import { useCheckout } from '@/composables/useCheckout'
import { FINAL_CTA } from '@/config/site'
import { PHOTO } from '@/config/photos'
import { PRICES, formatUsd } from '@/config/payment'

const { open } = useCheckout()
const background = cldImage(PHOTO.finalCta.id, { width: 1600, ratio: '16:9' })
</script>

<template>
  <section class="final" :style="{ backgroundImage: `url(${background})` }">
    <div class="final__scrim" />

    <div class="final__inner" v-reveal>
      <p class="final__eyebrow">{{ FINAL_CTA.eyebrow }}</p>
      <h2 class="final__title">{{ FINAL_CTA.title }}</h2>
      <p class="final__text">{{ FINAL_CTA.text }}</p>

      <BaseButton variant="light" size="lg" @click="open()">{{ FINAL_CTA.cta }}</BaseButton>

      <p class="final__price">
        Pre-venta {{ formatUsd(PRICES.presale) }} · precio real
        {{ formatUsd(PRICES.regular) }}
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.final {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 78vh;
  padding-block: $space-section;
  background-size: cover;
  background-position: center 30%;
  color: $cream;
  isolation: isolate;
}

.final__scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    to right,
    rgba(#100c0b, 0.9) 0%,
    rgba(#100c0b, 0.72) 55%,
    rgba(#100c0b, 0.4) 100%
  );
}

.final__inner {
  @include container(900px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-md;
  text-align: center;
}

.final__eyebrow {
  @include eyebrow;
  color: $rose-soft;
}

.final__title {
  @include display($display-md);
  color: $cream;
  white-space: pre-line;
}

.final__text {
  max-width: 44ch;
  color: rgba($cream, 0.8);
}

.final__price {
  font-size: $text-xs;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba($cream, 0.55);
}
</style>
