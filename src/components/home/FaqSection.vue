<script setup lang="ts">
import { ref } from 'vue'
import FaqItem from './FaqItem.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { FAQ } from '@/config/site'

const openIndex = ref<number | null>(0)

const toggle = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section id="faq" class="faq">
    <div class="faq__inner">
      <SectionHeading :eyebrow="FAQ.eyebrow" :title="FAQ.title" />

      <div class="faq__list">
        <FaqItem
          v-for="(item, index) in FAQ.items"
          :id="String(index)"
          :key="item.q"
          :question="item.q"
          :answer="item.a"
          :open="openIndex === index"
          @toggle="toggle(index)"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.faq {
  padding-block: $space-section;
}

.faq__inner {
  @include container(1000px);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: clamp(2rem, 5vw, 4rem);
}

.faq__list {
  flex: 1 1 420px;
  border-top: 1px solid rgba($ink, 0.12);
}
</style>
