<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import VslPlayer from '@/components/ui/VslPlayer.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import settingsService, { type Vsl } from '@/services/settingsService'
import AppFooter from '@/layout/AppFooter.vue'
import { PAYMENT_MODE } from '@/config/payment'
import paymentService from '@/services/paymentService'
import { forgetCheckout, recallCheckout } from '@/components/payment/pendingCheckout'
import { purchaseEventId } from '@/config/meta'
import { metaFbc, metaFbp, trackMeta } from '@/composables/useMetaPixel'

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

/**
 * Mandar el acceso a otro correo se pregunta antes.
 *
 * Ese correo lleva la contraseña de la cuenta. Un dedo torpe en un correo mal
 * escrito manda las credenciales de la compradora a un desconocido, y eso no
 * se deshace. Al correo de la compra se reenvía sin preguntar: ahí ya estaba.
 */
const confirmandoEnvio = ref(false)

const otroCorreo = computed(() => {
  const destino = resendTo.value.trim().toLowerCase()
  return Boolean(destino) && destino !== (access.value?.email || '').toLowerCase()
})

function pedirReenvio() {
  if (otroCorreo.value) {
    confirmandoEnvio.value = true
    return
  }
  resendEmail()
}

async function resendEmail() {
  confirmandoEnvio.value = false
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
      // Las cookies del pixel viven en este dominio: el backend no puede
      // leerlas, así que se las pasamos para que la compra se atribuya al
      // anuncio que la originó.
      { fbp: metaFbp(), fbc: metaFbc(), eventSourceUrl: window.location.href },
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

    /**
     * Purchase del navegador. El servidor ya mandó el suyo al confirmar con
     * PayPhone; los dos llevan el mismo id derivado de la transacción, así
     * que Meta se queda con una sola compra. Sin esa deduplicación cada venta
     * se contaría dos veces y el ROAS de la campaña saldría a la mitad.
     *
     * `mirror: false` a propósito: el importe de esta conversión lo pone el
     * servidor con el monto que PayPhone confirmó, no el navegador.
     */
    if (confirmState.value === 'approved') {
      trackMeta('Purchase', {
        eventId: purchaseEventId(clientTransactionId.value),
        mirror: false,
        value: result.amount / 100,
        contentIds: result.challenge ? [result.challenge] : undefined,
        contentName: result.challenge ?? plan.value ?? null,
        contact: {
          email: result.email ?? contacto?.email ?? null,
          phone: contacto?.phone ?? null,
          name: contacto?.name ?? null,
        },
      })
    }
  } catch (error: unknown) {
    const e = error as { message?: string }
    errorMessage.value = e.message ?? ''
    confirmState.value = 'error'
  }
})

const state = computed<State>(() => confirmState.value ?? 'confirming')

/**
 * El video de bienvenida.
 *
 * Se pide solo cuando el pago se aprobó: en una pantalla de pago rechazado no
 * pinta nada, y pedirlo igual sería gastar la conexión de alguien que ya se
 * está yendo.
 *
 * Si no hay video cargado, `vsl` queda en null y la pantalla funciona como
 * antes. Un VSL sin subir no puede frenar una compra.
 */
const vsl = ref<Vsl | null>(null)
const vslVisto = ref(false)

const esperandoVideo = computed(() => Boolean(vsl.value) && !vslVisto.value)

watch(
  () => confirmState.value,
  async (estado) => {
    if (estado !== 'approved' && estado !== 'simulated') return
    try {
      vsl.value = await settingsService.vsl()
    } catch {
      // Sin video se sigue igual: el acceso ya está confirmado.
    }
  },
  { immediate: true },
)

function terminoElVideo() {
  vslVisto.value = true
  // Ya lo vio: en la academia le aparece como opcional, no vuelve a bloquear.
  try {
    localStorage.setItem('sk_vsl_visto', '1')
  } catch {
    // Sin almacenamiento no pasa nada: solo lo verá de nuevo si vuelve acá.
  }
}

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

        <Transition name="aviso">
          <div v-if="vsl" class="bienvenida">
            <p class="bienvenida__label">Empieza por aquí</p>
            <VslPlayer
              :embed-url="vsl.embedUrl"
              :duration-seconds="vsl.durationSeconds"
              obligatorio
              @terminado="terminoElVideo"
            />
          </div>
        </Transition>

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

            <form class="access__form" novalidate @submit.prevent="pedirReenvio">
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
          <template v-if="access">
            <BaseButton v-if="!esperandoVideo" href="/login" size="lg">
              Entrar a mi cuenta
            </BaseButton>
            <p v-else class="result__espera">
              El acceso ya está en tu correo. Termina el video y entras.
            </p>
          </template>
          <BaseButton :variant="access ? 'ghost' : 'primary'" href="/">Volver al inicio</BaseButton>
        </div>
      </section>

      <ConfirmModal
        :open="confirmandoEnvio"
        title="¿Enviarlo a otro correo?"
        :message="`Vamos a mandar tus datos de acceso, con tu contraseña, a ${resendTo.trim()}. Revisa que esté bien escrito antes de seguir.`"
        confirm-label="Enviar ahí"
        cancel-label="Revisar el correo"
        icono="paper-plane"
        :loading="resending"
        @confirm="resendEmail"
        @cancel="confirmandoEnvio = false"
      />
    </main>

    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
.bienvenida {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: $space-md 0;
}

.bienvenida__label {
  @include eyebrow;
  color: $rose-deep;
}

.result__espera {
  font-size: $text-sm;
  color: $ink-soft;
}

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
