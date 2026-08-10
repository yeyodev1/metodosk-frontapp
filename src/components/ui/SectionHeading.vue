<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    align?: 'left' | 'center'
    tone?: 'dark' | 'light'
  }>(),
  { align: 'left', tone: 'dark' },
)
</script>

<template>
  <header class="heading" :class="[`heading--${align}`, `heading--${tone}`]">
    <p v-if="eyebrow" class="heading__eyebrow">{{ eyebrow }}</p>
    <h2 class="heading__title">{{ title }}</h2>
    <p v-if="$slots.default" class="heading__text"><slot /></p>
  </header>
</template>

<style lang="scss" scoped>
.heading {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  max-width: 40ch;
}

.heading__eyebrow {
  @include eyebrow;
}

.heading__title {
  @include display;
}

.heading__text {
  font-size: $text-lg;
  color: $ink-soft;
  max-width: 46ch;
}

.heading--center {
  align-items: center;
  text-align: center;
  margin-inline: auto;

  .heading__text {
    margin-inline: auto;
  }
}

.heading--light {
  .heading__eyebrow {
    color: $rose-soft;
  }

  .heading__title {
    color: $cream;
  }

  .heading__text {
    color: rgba($cream, 0.78);
  }
}
</style>
