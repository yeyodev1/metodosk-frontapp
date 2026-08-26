<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppFooter from '@/layout/AppFooter.vue'
import { BRAND } from '@/config/site'
import { PAYMENT_MODE } from '@/config/payment'
import paymentService from '@/services/paymentService'

const route = useRoute()

const clientTransactionId = computed(() => String(route.query.clientTransactionId ?? ''))
const transactionId = computed(() => String(route.query.id ?? ''))
const plan = computed(() => String(route.query.plan ?? ''))

type State = 'simulated' | 'confirming' | 'approved' | 'rejected' | 'error' | 'unknown'

const confirmState = ref<State | null>(null)
const authorizationCode = ref('')
const errorMessage = ref('')

/**
 * PayPhone redirige acá con `id` y `clientTransactionId`, y reversa el cobro si
 * nadie lo confirma en 5 minutos. La confirmación necesita el token secreto,
 * así que la hace el backend: acá solo la disparamos y mostramos el resultado.
 */
onMounted(async () => {
  if (route.query.status === 'simulated') {
    confirmState.value = 'simulated'
    return
  }
  if (!transactionId.value || !clientTransactionId.value) {
    confirmState.value = 'unknown'
    return
  }

  confirmState.value = 'confirming'
  try {
    const result = await paymentService.confirm(transactionId.value, clientTransactionId.value)
    authorizationCode.value = result.authorizationCode ?? ''
    confirmState.value = result.transactionStatus === 'Approved' ? 'approved' : 'rejected'
    if (confirmState.value === 'rejected') {
      errorMessage.value = result.message ?? ''
    }
  } catch (error: unknown) {
    const e = error as { message?: string }
    errorMessage.value = e.message ?? ''
    confirmState.value = 'error'
  }
})

const state = computed<State>(() => confirmState.value ?? 'confirming')

const COPY: Record<State, { title: string; text: string }> = {
  simulated: {
    title: '¡Listo! (simulación)',
    text: 'Este es el recorrido completo del checkout en modo demostración. No se realizó ningún cobro real.',
  },
  confirming: {
    title: 'Confirmando tu pago',
    text: 'Estamos verificando la transacción con PayPhone. Esto toma unos segundos, no cierres esta página.',
  },
  approved: {
    title: '¡Bienvenida al reto!',
    text: 'Tu pago quedó confirmado. En breve te llega al correo el acceso al reto de 3 meses.',
  },
  rejected: {
    title: 'El pago no se completó',
    text: 'PayPhone no aprobó la transacción, así que no se te cobró nada. Puedes intentarlo de nuevo o escribirnos.',
  },
  error: {
    title: 'No pudimos confirmar el pago',
    text: 'Tuvimos un problema al verificar la transacción. Escríbenos con tu referencia y lo resolvemos enseguida.',
  },
  unknown: {
    title: 'No encontramos la transacción',
    text: 'Si ya hiciste el pago escríbenos y lo revisamos contigo enseguida.',
  },
}
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
        <div v-if="authorizationCode">
          <dt>Autorización</dt>
          <dd>{{ authorizationCode }}</dd>
        </div>
      </dl>

      <p v-if="errorMessage" class="result__error">{{ errorMessage }}</p>

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

.result__error {
  margin: 0;
  font-size: 0.9rem;
  color: #b3261e;
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
