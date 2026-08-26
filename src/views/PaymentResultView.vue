<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppFooter from '@/layout/AppFooter.vue'
import { PAYMENT_MODE } from '@/config/payment'
import paymentService from '@/services/paymentService'
import { forgetCheckout, recallCheckout } from '@/components/payment/pendingCheckout'

const route = useRoute()

const clientTransactionId = computed(() => String(route.query.clientTransactionId ?? ''))
const transactionId = computed(() => String(route.query.id ?? ''))
const plan = computed(() => String(route.query.plan ?? ''))

type State = 'simulated' | 'confirming' | 'approved' | 'rejected' | 'error' | 'unknown'

const confirmState = ref<State | null>(null)
const authorizationCode = ref('')
const errorMessage = ref('')

/** Datos del acceso que devuelve el backend al confirmar. */
const access = ref<{
  challenge: string | null
  accessMonths: number
  accessUntil: string | null
  amount: number
  email: string | null
} | null>(null)

// Reenvío del correo, opcionalmente a otra dirección.
const resendTo = ref('')
const resending = ref(false)
const resendOk = ref('')
const resendError = ref('')

const accessUntilLabel = computed(() => {
  const iso = access.value?.accessUntil
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const amountLabel = computed(() =>
  access.value ? `$${(access.value.amount / 100).toFixed(2)} USD` : '',
)

async function resendEmail() {
  const destino = resendTo.value.trim()
  resending.value = true
  resendOk.value = ''
  resendError.value = ''
  try {
    const r = await paymentService.resend(
      transactionId.value,
      clientTransactionId.value,
      destino || undefined,
    )
    resendOk.value = r.sent
      ? `Te lo enviamos a ${r.email}.`
      : 'No pudimos enviarlo. Intenta de nuevo en un momento.'
    if (r.sent) resendTo.value = ''
  } catch (error: unknown) {
    const e = error as { message?: string }
    resendError.value = e.message ?? 'No pudimos reenviarlo.'
  } finally {
    resending.value = false
  }
}

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
    const contacto = recallCheckout(clientTransactionId.value) ?? undefined
    const result = await paymentService.confirm(
      transactionId.value,
      clientTransactionId.value,
      contacto,
    )
    forgetCheckout()
    authorizationCode.value = result.authorizationCode ?? ''
    confirmState.value = result.transactionStatus === 'Approved' ? 'approved' : 'rejected'
    if (confirmState.value === 'approved') {
      access.value = {
        challenge: result.challenge ?? plan.value ?? null,
        accessMonths: result.accessMonths ?? 3,
        accessUntil: result.accessUntil ?? null,
        amount: result.amount,
        email: result.email ?? null,
      }
    }
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
  <div class="vista-resultado">
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

        <Transition name="aviso">
          <div v-if="access" class="access">
          <p class="access__title">Tu acceso</p>
          <dl class="access__rows">
            <div v-if="access.challenge">
              <dt>Reto</dt>
              <dd>{{ access.challenge }}</dd>
            </div>
            <div>
              <dt>Pago</dt>
              <dd>{{ amountLabel }}</dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>{{ access.accessMonths }} meses</dd>
            </div>
            <div v-if="accessUntilLabel">
              <dt>Acceso hasta</dt>
              <dd>{{ accessUntilLabel }}</dd>
            </div>
          </dl>

          <div class="access__mail">
            <p class="access__mail-text">
              <template v-if="access.email">
                Enviamos tus datos de acceso a <strong>{{ access.email }}</strong>.
              </template>
              <template v-else>
                Escribe tu correo para enviarte la confirmación.
              </template>
            </p>

            <form class="access__form" novalidate @submit.prevent="resendEmail">
              <label class="access__label" for="resend-email">
                ¿No te llegó, o lo quieres en otro correo?
              </label>
              <div class="access__row">
                <input
                  id="resend-email"
                  v-model="resendTo"
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  class="access__input"
                  :placeholder="access.email || 'tu@correo.com'"
                />
                <BaseButton type="submit" :disabled="resending">
                  {{ resending ? 'Enviando…' : 'Reenviar' }}
                </BaseButton>
              </div>
              <Transition name="aviso">
                <p v-if="resendOk" class="access__ok">{{ resendOk }}</p>
              </Transition>
              <Transition name="aviso">
                <p v-if="resendError" class="access__error">{{ resendError }}</p>
              </Transition>
              </form>
            </div>
          </div>
        </Transition>

        <p v-if="errorMessage" class="result__error">{{ errorMessage }}</p>

        <p v-if="PAYMENT_MODE === 'simulation'" class="result__demo">
          Modo demostración activo — cambia <code>VITE_PAYPHONE_MODE</code> a
          <code>live</code> cuando el backend confirme transacciones.
        </p>

        <div class="result__actions">
          <BaseButton v-if="access" href="/login" size="lg">Entrar a mi cuenta</BaseButton>
          <BaseButton :variant="access ? 'ghost' : 'primary'" href="/">Volver al inicio</BaseButton>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
.vista-resultado {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
}

.access {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  padding: clamp(1.1rem, 4vw, 1.5rem);
  border: 1px solid rgba($ink, 0.12);
  border-radius: $radius-md;
  background-color: $bone;
  text-align: left;
}

.access__title {
  @include eyebrow;
  color: $rose-deep;
}

.access__rows {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin: 0;

  > div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 0.55rem;
    border-bottom: 1px solid rgba($ink, 0.08);

    &:last-child {
      border-bottom: none;
    }
  }

  dt {
    font-size: $text-sm;
    color: $ink-soft;
  }

  dd {
    margin: 0;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;
    text-align: right;
  }
}

.access__mail {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding-top: $space-sm;
  border-top: 1px solid rgba($ink, 0.1);
}

.access__mail-text {
  font-size: $text-sm;
  color: $ink-soft;
  line-height: 1.5;
}

.access__form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.access__label {
  font-size: $text-xs;
  color: $ink-muted;
}

.access__row {
  display: flex;
  gap: 0.5rem;

  @include until('sm') {
    flex-direction: column;
  }
}

.access__input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.8rem 1rem;
  border: 1px solid rgba($ink, 0.16);
  border-radius: $radius-sm;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-base;
  color: $ink;

  &:focus {
    outline: none;
    border-color: $rose-deep;
  }
}

.access__ok {
  font-size: $text-sm;
  color: #1b7f4d;
}

.access__error {
  font-size: $text-sm;
  color: $alert-error;
}

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
