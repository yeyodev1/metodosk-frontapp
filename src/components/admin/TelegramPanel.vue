<script setup lang="ts">
/**
 * El aviso de "ya se abrió tu grupo de Telegram", desde el panel.
 *
 * Un solo botón, una sola vez: da la orden y sale la primera tanda ahí
 * mismo. El resto lo manda el cron cada hora, y a quien compre después
 * también le llega sin que nadie vuelva a apretar nada. Por eso, una vez
 * dada la orden, el botón desaparece y queda el estado.
 */
import { onMounted, ref } from 'vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import adminService, { type TelegramAvisoEstado } from '@/services/adminService'

const estado = ref<TelegramAvisoEstado | null>(null)
const confirmando = ref(false)
const enviando = ref(false)
const error = ref('')

async function cargar() {
  try {
    estado.value = await adminService.estadoTelegram()
  } catch {
    estado.value = null
  }
}

async function avisar() {
  enviando.value = true
  error.value = ''
  try {
    const r = await adminService.avisarTelegram()
    estado.value = r.estado
    confirmando.value = false
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'No se pudo enviar. Intenta de nuevo.'
  } finally {
    enviando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section v-if="estado" class="tg">
    <div class="tg__texto">
      <h2 class="tg__title">Aviso del grupo de Telegram</h2>
      <p class="tg__sub">
        <template v-if="!estado.activadoEn">
          Les toca a <strong>{{ estado.total }}</strong> alumnas. Al avisar, cada una recibe un
          correo con su botón "Ingresa por aquí" y el correo exacto que el bot le va a pedir.
          Sale poco a poco: las primeras 25 ahora, después 25 por hora y máximo 50 por día, para no quedarse sin cuota para los correos de compra.
          <template v-if="estado.sinGrupo">
            A {{ estado.sinGrupo }} no les toca y no se les escribe.
          </template>
        </template>
        <template v-else-if="estado.pendientes">
          Enviado a {{ estado.enviados }} de {{ estado.total }}. Faltan
          <strong>{{ estado.pendientes }}</strong>, y salen solas: 25 por hora, máximo 50 por día. No hay que
          hacer nada.
        </template>
        <template v-else>
          Enviado a las {{ estado.total }} alumnas que les toca. Quien compre de aquí en
          adelante lo recibe sola dentro de la hora.
        </template>
      </p>
      <p v-if="error" class="tg__error">{{ error }}</p>
    </div>

    <button
      v-if="!estado.activadoEn"
      type="button"
      class="tg__boton"
      :disabled="!estado.total"
      @click="confirmando = true"
    >
      <FaIcon :icon="['fab', 'telegram']" /> Avisar a todas por correo
    </button>
    <span v-else-if="estado.pendientes" class="tg__estado">En curso</span>
    <span v-else class="tg__estado tg__estado--ok">Listo</span>

    <ConfirmModal
      :open="confirmando"
      title="¿Avisar a todas por correo?"
      :message="`Se le manda a ${estado.total} alumnas el correo de que el grupo de Telegram ya está abierto, con su enlace personal. Se hace una sola vez y no se puede deshacer.`"
      confirm-label="Sí, avisar a todas"
      :loading="enviando"
      @confirm="avisar"
      @cancel="confirmando = false"
    />
  </section>
</template>

<style lang="scss" scoped>
.tg {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: $space-md;
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $ink;
  color: $cream;
}

.tg__texto {
  flex: 1 1 300px;
}

.tg__title {
  font-size: $text-sm;
  font-weight: 600;
}

.tg__sub {
  margin-top: 0.2rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: rgba($cream, 0.75);

  strong {
    color: $cream;
  }
}

.tg__error {
  margin-top: 0.4rem;
  font-size: $text-xs;
  color: $rose-soft;
}

.tg__boton {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $rose-deep;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $cream;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.26s $ease;

  &:hover:not(:disabled) {
    background-color: $wine;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @include focus-ring($rose-soft);
}

.tg__estado {
  padding: 0.35rem 0.85rem;
  border-radius: $radius-pill;
  background-color: rgba($cream, 0.14);
  font-size: $text-xs;
  white-space: nowrap;
}

.tg__estado--ok {
  background-color: $rose-soft;
  color: $ink;
}
</style>
