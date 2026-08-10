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
import PricingSection from '@/components/home/PricingSection.vue'
import PromiseSection from '@/components/home/PromiseSection.vue'
import TimelineSection from '@/components/home/TimelineSection.vue'
</script>

<template>
  <AppHeader />

  <main>
    <HeroSection />
    <PromiseSection />
    <ChallengesSection />
    <IncludesSection />
    <TimelineSection />
    <ForWhoSection />
    <CommunitySection />
    <PricingSection />
    <FaqSection />
    <FinalCtaSection />
  </main>

  <AppFooter />
</template>
