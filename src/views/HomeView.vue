<script setup lang="ts">
import AppFooter from '@/layout/AppFooter.vue'
import AppHeader from '@/layout/AppHeader.vue'
import ChallengesSection from '@/components/home/ChallengesSection.vue'
import FaqSection from '@/components/home/FaqSection.vue'
import FinalCtaSection from '@/components/home/FinalCtaSection.vue'
import ForWhoSection from '@/components/home/ForWhoSection.vue'
import CommunitySection from '@/components/home/CommunitySection.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import IncludesSection from '@/components/home/IncludesSection.vue'
import NutritionSection from '@/components/home/NutritionSection.vue'
import PricingSection from '@/components/home/PricingSection.vue'
import PromiseSection from '@/components/home/PromiseSection.vue'
import TimelineSection from '@/components/home/TimelineSection.vue'
import { onMounted } from 'vue'
import { CHALLENGES } from '@/config/site'
import { PRICES } from '@/config/payment'
import { trackMeta } from '@/composables/useMetaPixel'

/**
 * ViewContent: la landing ES la página del producto.
 *
 * Va aparte del PageView del router porque es el evento con el que se
 * construyen los públicos de remarketing —"vio el reto y no compró"— y con el
 * que Meta optimiza el tramo alto del embudo. Un PageView de /login no sirve
 * para eso.
 */
onMounted(() => {
  trackMeta('ViewContent', {
    value: PRICES.presale / 100,
    contentIds: CHALLENGES.map((challenge) => challenge.id),
    contentName: 'Reto Método SK — 3 meses',
  })
})
</script>

<template>
  <div class="vista-home">
    <AppHeader />

    <main>
      <HeroSection />
      <PromiseSection />
      <ChallengesSection />
      <IncludesSection />
      <NutritionSection />
      <TimelineSection />
      <ForWhoSection />
      <CommunitySection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </main>

    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
.vista-home {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
}
</style>
