<script setup lang="ts">
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { FOR_WHO } from '@/config/site'
</script>

<template>
  <section class="forwho">
    <div class="forwho__inner">
      <SectionHeading :eyebrow="FOR_WHO.eyebrow" :title="FOR_WHO.title" align="center" />

      <div class="forwho__columns">
        <article class="panel panel--yes" v-reveal>
          <h3 class="panel__title">{{ FOR_WHO.yes.title }}</h3>
          <ul class="panel__list">
            <li v-for="item in FOR_WHO.yes.items" :key="item">{{ item }}</li>
          </ul>
        </article>

        <article class="panel panel--no" v-reveal="120">
          <h3 class="panel__title">{{ FOR_WHO.no.title }}</h3>
          <ul class="panel__list">
            <li v-for="item in FOR_WHO.no.items" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.forwho {
  padding-block: $space-section;
  background-color: $sand;
}

.forwho__inner {
  @include container(1020px);
  display: flex;
  flex-direction: column;
  gap: $space-xl;
}

.forwho__columns {
  @include flex-cards(300px, clamp(1.2rem, 3vw, 2rem));
  align-items: flex-start;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: clamp(1.6rem, 3.5vw, 2.4rem);
  border-radius: $radius-lg;
}

.panel--yes {
  background-color: $cream;
  border: 1px solid rgba($rose, 0.35);
}

.panel--no {
  background-color: transparent;
  border: 1px dashed rgba($ink, 0.22);
}

.panel__title {
  font-size: $text-xl;
}

.panel__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  font-size: $text-sm;
  color: $ink-soft;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
  }
}

.panel--yes .panel__list li::before {
  content: '✓';
  color: $rose-deep;
  font-weight: 700;
  flex: none;
}

.panel--no .panel__list li::before {
  content: '×';
  color: $ink-muted;
  font-weight: 700;
  flex: none;
}
</style>
