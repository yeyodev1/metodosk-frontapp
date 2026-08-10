<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCheckout } from '@/composables/useCheckout'
import { BRAND, PRICING } from '@/config/site'

const { open } = useCheckout()
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 80
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="header" :class="{ 'is-scrolled': scrolled }">
    <div class="header__inner">
      <a class="header__brand" href="#top">
        <span class="header__mark">SK</span>
        <span class="header__name">{{ BRAND.name }}</span>
      </a>

      <nav class="header__nav" aria-label="Secciones">
        <a href="#retos">Los retos</a>
        <a href="#incluye">Qué incluye</a>
        <a href="#precio">Precio</a>
        <a href="#faq">Preguntas</a>
      </nav>

      <BaseButton class="header__cta" @click="open()">{{ PRICING.cta }}</BaseButton>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  transition:
    background-color 0.4s $ease,
    box-shadow 0.4s $ease,
    border-color 0.4s $ease;
  border-bottom: 1px solid transparent;
}

.header.is-scrolled {
  background-color: rgba($bone, 0.88);
  backdrop-filter: blur(14px);
  border-bottom-color: rgba($ink, 0.08);
}

.header__inner {
  @include container(1240px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-md;
  height: 68px;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.header__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: $ink;
  color: $rose-soft;
  font-family: $font-display;
  font-size: 0.9rem;
  font-style: italic;
}

.header__name {
  font-family: $font-display;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.header__nav {
  display: none;
  gap: 1.9rem;
  font-size: $text-sm;
  color: $ink-soft;

  @include from('lg') {
    display: flex;
  }

  a {
    position: relative;
    padding-block: 0.2rem;
    transition: color 0.3s $ease;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 0;
      height: 1px;
      background-color: $rose-deep;
      transition: width 0.35s $ease;
    }

    &:hover {
      color: $ink;

      &::after {
        width: 100%;
      }
    }
  }
}

.header__cta {
  font-size: $text-xs;
  padding: 0.7rem 1.3rem;

  @include until('sm') {
    display: none;
  }
}
</style>
