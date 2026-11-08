<script setup lang="ts">
/**
 * Zona peligrosa: apagar la web.
 *
 * Con la web apagada, el home muestra "regresa pronto" en vez de la venta.
 * Nadie puede comprar, pero la app de las alumnas y el panel siguen vivos.
 * Se pregunta antes, en rojo: un clic acá deja la landing sin ventas.
 */
import { onMounted, ref } from 'vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import settingsService from '@/services/settingsService'

const apagada = ref<boolean | null>(null)
const confirmando = ref(false)
const cambiando = ref(false)
const error = ref('')

async function cargar() {
  try {
    apagada.value = await settingsService.webApagada()
  } catch {
    apagada.value = null
  }
}

async function cambiar() {
  cambiando.value = true
  error.value = ''
  try {
    apagada.value = await settingsService.cambiarWeb(!apagada.value)
    confirmando.value = false
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'No se pudo cambiar. Intenta de nuevo.'
  } finally {
    cambiando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section v-if="apagada !== null" class="peligro">
    <div class="peligro__texto">
      <p class="peligro__eyebrow"><FaIcon icon="triangle-exclamation" /> Zona peligrosa</p>
      <h2 class="peligro__title">{{ apagada ? 'La web está apagada' : 'Desactivar la web' }}</h2>
      <p class="peligro__sub">
        <template v-if="apagada">
          Quien entra a metodosk.ec ve un error 404 como si la web se hubiera caído, y nadie puede comprar. La app de las
          alumnas y este panel siguen funcionando.
        </template>
        <template v-else>
          El home deja de vender y muestra un error 404, como si la web ya no existiera. Las alumnas siguen
          entrando a su cuenta. Se puede volver a activar cuando quieras.
        </template>
      </p>
      <p v-if="error" class="peligro__error">{{ error }}</p>
    </div>

    <button type="button" class="peligro__boton" :class="{ 'peligro__boton--on': apagada }" @click="confirmando = true">
      <FaIcon :icon="apagada ? 'power-off' : 'ban'" />
      {{ apagada ? 'Reactivar la web' : 'Desactivar la web' }}
    </button>

    <ConfirmModal
      :open="confirmando"
      :title="apagada ? '¿Reactivar la web?' : '¿Desactivar la web?'"
      :message="
        apagada
          ? 'El home vuelve a mostrar la venta del reto y se puede comprar otra vez.'
          : 'Nadie va a poder comprar hasta que la reactives. El home mostrará un error 404, como si la web se hubiera caído.'
      "
      :confirm-label="apagada ? 'Sí, reactivar' : 'Sí, desactivar la web'"
      :danger="!apagada"
      :loading="cambiando"
      icono="triangle-exclamation"
      @confirm="cambiar"
      @cancel="confirmando = false"
    />
  </section>
</template>

<style lang="scss" scoped>
.peligro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: $space-lg;
  padding: 1.1rem 1.3rem;
  border: 1px solid rgba($alert-error, 0.45);
  border-radius: $radius-md;
  background-color: $alert-error-bg;
}

.peligro__texto {
  flex: 1 1 300px;
}

.peligro__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: $text-xs;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $alert-error;
}

.peligro__title {
  margin-top: 0.3rem;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.peligro__sub {
  margin-top: 0.2rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.peligro__error {
  margin-top: 0.4rem;
  font-size: $text-xs;
  color: $alert-error;
}

.peligro__boton {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border: 1px solid $alert-error;
  border-radius: $radius-pill;
  background-color: $alert-error;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $cream;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.26s, color 0.26s;

  &:hover {
    background-color: darken($alert-error, 10);
  }

  @include focus-ring($alert-error);
}

.peligro__boton--on {
  background-color: transparent;
  color: $alert-error;

  &:hover {
    background-color: $alert-error;
    color: $cream;
  }
}
</style>
