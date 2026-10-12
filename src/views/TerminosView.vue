<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BRAND } from '@/config/site'
import { TERMS } from '@/config/legal'
</script>

<template>
  <main class="terms">
    <div class="terms__inner">
      <RouterLink to="/" class="terms__back">← {{ BRAND.name }}</RouterLink>

      <h1 class="terms__title">{{ TERMS.title }}</h1>
      <p class="terms__updated">Última actualización: {{ TERMS.updatedAt }}</p>
      <p class="terms__intro">{{ TERMS.intro }}</p>

      <section v-for="section in TERMS.sections" :key="section.title" class="terms__section">
        <h2>{{ section.title }}</h2>
        <p v-for="(paragraph, i) in section.paragraphs" :key="i">{{ paragraph }}</p>
      </section>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.terms {
  min-height: 100svh;
  padding-block: clamp(2.5rem, 7vw, 5rem);
  background-color: $cream;
  color: $ink-soft;
}

.terms__inner {
  @include container(760px);
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.terms__back {
  font-size: $text-sm;
  color: $rose-deep;
}

.terms__title {
  @include display($display-sm);
  color: $ink;
}

.terms__updated {
  font-size: $text-xs;
  color: $ink-muted;
}

.terms__intro {
  font-size: $text-base;
}

.terms__section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: $space-md;

  h2 {
    font-family: $font-display;
    font-size: $text-xl;
    color: $ink;
  }

  p {
    font-size: $text-sm;
    line-height: 1.7;
  }
}
</style>
