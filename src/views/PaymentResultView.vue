<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppFooter from '@/layout/AppFooter.vue'
import { BRAND } from '@/config/site'
import { PAYMENT_MODE } from '@/config/payment'

const route = useRoute()

const clientTransactionId = computed(() => String(route.query.clientTransactionId ?? ''))
const transactionId = computed(() => String(route.query.id ?? ''))
const plan = computed(() => String(route.query.plan ?? ''))

/**
 * PayPhone redirige acá con `id` y `clientTransactionId`. La confirmación real
 * (POST /api/confirm) requiere el token secreto, así que la hará el backend
 * cuando exista — ver src/services/paymentService.ts. Por ahora esta vista solo
 * muestra el resultado.
 */
const state = computed(() => {
  if (route.query.status === 'simulated') return 'simulated'
  return transactionId.value ? 'pending' : 'unknown'
})

const COPY = {
  simulated: {
    title: '¡Listo! (simulación)',
    text: 'Este es el recorrido completo del checkout en modo demostración. No se realizó ningún cobro real.',
  },
  pending: {
    title: 'Recibimos tu pago',
    text: 'Estamos confirmando la transacción con PayPhone. En cuanto quede confirmada te llega el acceso al reto por correo.',
  },
  unknown: {
    title: 'No encontramos la transacción',
    text: 'Si ya hiciste el pago escríbenos y lo revisamos contigo enseguida.',
  },
} as const
</script>

<template>
  <main class="result">
    <section class="result__card">
      <p class="result__eyebrow">Método SK · Reto de 3 meses</p>
      <h1 class="result__title">{{ COPY[state].title }}</h1>
      <p class="result__text">{{ COPY[state].text }}</p>

      <dl v-if="clientTransactionId || transactionId" class="result__meta">
        <div v-if="plan">
          <dt>Reto</dt>
          <dd>{{ plan }}</dd>
        </div>
        <div v-if="clientTransactionId">
          <dt>Referencia</dt>
          <dd>{{ clientTransactionId }}</dd>
        </div>
        <div v-if="transactionId">
          <dt>ID PayPhone</dt>
          <dd>{{ transactionId }}</dd>
        </div>
      </dl>

      <p v-if="PAYMENT_MODE === 'simulation'" class="result__demo">
        Modo demostración activo — cambia <code>VITE_PAYPHONE_MODE</code> a
        <code>live</code> cuando el backend confirme transacciones.
      </p>

      <div class="result__actions">
        <BaseButton href="/">Volver al inicio</BaseButton>
        <BaseButton variant="ghost" :href="BRAND.whatsapp">Escribirnos</BaseButton>
      </div>
    </section>
  </main>

  <AppFooter />
</template>

<style lang="scss" scoped>
.result {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 82vh;
  padding: $space-xl 1.25rem;
  background-color: $sand;
}

.result__card {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  width: min(620px, 100%);
  padding: clamp(1.8rem, 5vw, 3rem);
  background-color: $cream;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
}

.result__eyebrow {
  @include eyebrow;
}

.result__title {
  @include display($display-sm);
}

.result__text {
  color: $ink-soft;
}

.result__meta {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: $space-md;
  background-color: $bone;
  border-radius: $radius-md;
  font-size: $text-sm;

  > div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  dt {
    min-width: 110px;
    color: $ink-muted;
  }

  dd {
    font-family: ui-monospace, 'SFMono-Regular', monospace;
    font-size: $text-xs;
    word-break: break-all;
  }
}

.result__demo {
  padding: 0.8rem 1rem;
  border: 1px dashed rgba($rose-deep, 0.5);
  border-radius: $radius-sm;
  font-size: $text-xs;
  color: $wine;

  code {
    font-family: ui-monospace, 'SFMono-Regular', monospace;
  }
}

.result__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-sm;
}
</style>
