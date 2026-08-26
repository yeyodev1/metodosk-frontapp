<script setup lang="ts">
import PayphoneCheckout from '@/components/payment/PayphoneCheckout.vue'
</script>

<template>
  <div class="app-container">
    <!--
      Transición entre vistas. `mode="out-in"` evita que las dos pantallas se
      pisen: con layouts de alto completo, superponerlas se ve como un salto.
    -->
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>

    <PayphoneCheckout />
  </div>
</template>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* La entrante sube apenas; la saliente se va hacia arriba. Corta y sobria:
   una transición larga entre pantallas se siente lenta, no elegante. */
.page-enter-active {
  transition:
    opacity 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}

.page-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
