<script setup lang="ts">
import PayphoneCheckout from '@/components/payment/PayphoneCheckout.vue'
</script>

<template>
  <div class="app-container">
    <RouterView />
    <PayphoneCheckout />
  </div>
</template>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
