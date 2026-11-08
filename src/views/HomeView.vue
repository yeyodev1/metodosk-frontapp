<script setup lang="ts">
import AppFooter from '@/layout/AppFooter.vue'
import AppHeader from '@/layout/AppHeader.vue'
import ChallengesSection from '@/components/home/ChallengesSection.vue'
import FaqSection from '@/components/home/FaqSection.vue'
import FinalCtaSection from '@/components/home/FinalCtaSection.vue'
import ForWhoSection from '@/components/home/ForWhoSection.vue'
import CommunitySection from '@/components/home/CommunitySection.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import PreventaBar from '@/components/home/PreventaBar.vue'
import CuponBar from '@/components/home/CuponBar.vue'
import IncludesSection from '@/components/home/IncludesSection.vue'
import NutritionSection from '@/components/home/NutritionSection.vue'
import TiendaSection from '@/components/home/TiendaSection.vue'
import PricingSection from '@/components/home/PricingSection.vue'
import PromiseSection from '@/components/home/PromiseSection.vue'
import TimelineSection from '@/components/home/TimelineSection.vue'
import WebApagada from '@/components/home/WebApagada.vue'
import { onMounted, ref, watch } from 'vue'
import settingsService from '@/services/settingsService'
import { useCheckout } from '@/composables/useCheckout'
import { CHALLENGES } from '@/config/site'
import { PRICES } from '@/config/payment'
import { trackMeta } from '@/composables/useMetaPixel'
import { useCupon } from '@/composables/useCupon'

const { cupon, desdeLink } = useCupon()
const { open } = useCheckout()

/**
 * Apagada desde el panel: el home se ve como un 404 en vez de vender.
 *
 * Hasta que el API responda no se pinta nada: si la landing apareciera un
 * instante antes del 404, se notaría que la web sigue viva. El costo es que
 * la landing tarda lo que tarde el API en arrancar. Si el API falla, se
 * vende: una web caída por un error nuestro sería peor.
 */
const webApagada = ref<boolean | null>(null)

/**
 * Links viejos con cupón (`/?cupon=…`): quien los toca viene a comprar, así
 * que pasa directo a la página de compra con el descuento puesto.
 */
watch(
  desdeLink,
  (vino) => {
    if (!vino) return
    desdeLink.value = false
    open()
  },
  { immediate: true },
)

/**
 * ViewContent: la landing ES la página del producto.
 *
 * Va aparte del PageView del router porque es el evento con el que se
 * construyen los públicos de remarketing —"vio el reto y no compró"— y con el
 * que Meta optimiza el tramo alto del embudo. Un PageView de /login no sirve
 * para eso.
 */
onMounted(async () => {
  webApagada.value = await settingsService.webApagada().catch(() => false)
  // Con la web apagada no hay producto que ver: no ensuciar el remarketing.
  if (webApagada.value) return
  trackMeta('ViewContent', {
    value: PRICES.regular / 100,
    contentIds: CHALLENGES.map((challenge) => challenge.id),
    contentName: 'Reto Método SK — 3 meses',
  })
})
</script>

<template>
  <WebApagada v-if="webApagada" />

  <div v-else-if="webApagada === false" class="vista-home">
    <AppHeader />

    <main>
      <HeroSection />
      <PromiseSection />
      <ChallengesSection />
      <IncludesSection />
      <NutritionSection />
      <TiendaSection />
      <TimelineSection />
      <ForWhoSection />
      <CommunitySection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </main>

    <AppFooter />

    <!-- Mismo lugar, una sola barra: con cupón manda el cupón. -->
    <CuponBar />
    <PreventaBar v-if="!cupon" />
  </div>
</template>

<style lang="scss" scoped>
.vista-home {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  /**
   * Hueco para la barra de pre-venta, que va en `fixed` y no ocupa espacio.
   * Sin esto tapa el final del pie y la última línea queda inalcanzable.
   */
  padding-bottom: 4.5rem;
  padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px));

  @media (max-width: 767px) {
    padding-bottom: 6.5rem;
    padding-bottom: calc(6.5rem + env(safe-area-inset-bottom, 0px));
  }
}
</style>
