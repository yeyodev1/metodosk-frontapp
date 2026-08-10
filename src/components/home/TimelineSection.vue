<script setup lang="ts">
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { TIMELINE } from '@/config/site'
</script>

<template>
  <section class="timeline">
    <div class="timeline__inner">
      <SectionHeading
        :eyebrow="TIMELINE.eyebrow"
        :title="TIMELINE.title"
        align="center"
        tone="light"
      />

      <ol class="timeline__steps">
        <li
          v-for="(step, index) in TIMELINE.steps"
          :key="step.month"
          v-reveal="index * 140"
          class="step"
        >
          <span class="step__month">{{ step.month }}</span>
          <span class="step__dot" aria-hidden="true" />
          <h3 class="step__title">{{ step.title }}</h3>
          <p class="step__text">{{ step.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.timeline {
  padding-block: $space-section;
  background-color: $ink;
  color: rgba($cream, 0.78);
}

.timeline__inner {
  @include container;
  display: flex;
  flex-direction: column;
  gap: $space-xl;
}

.timeline__steps {
  @include flex-cards(260px, clamp(1.5rem, 4vw, 3rem));
  list-style: none;
  counter-reset: step;
}

.step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding-top: $space-md;

  // Línea que conecta las etapas, dibujada sobre el borde superior
  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    background-color: rgba($cream, 0.18);
  }
}

.step__month {
  @include eyebrow;
  color: $rose;
}

.step__dot {
  position: absolute;
  top: -4px;
  left: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: $rose;
}

.step__title {
  font-size: $text-xl;
  color: $cream;
}

.step__text {
  font-size: $text-sm;
  max-width: 34ch;
}
</style>
