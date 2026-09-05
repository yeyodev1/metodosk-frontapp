<script setup lang="ts">
/**
 * El envío de la lista de implementos a quienes compraron antes de que el
 * correo de acceso la incluyera.
 *
 * Sale por tandas: el plan gratuito de Resend tiene tope diario, y quemarlo
 * dejaría sin enviar el correo de una compra nueva, que lleva la contraseña.
 * Un cron manda una tanda cada día; este botón es para arrancar sin esperar
 * y para reintentar lo que falló.
 */
import { onMounted, ref } from 'vue'
import adminService, { type RecursosEnvio, type RecursosEstado } from '@/services/adminService'

const estado = ref<RecursosEstado | null>(null)
const enviando = ref(false)
const ultimo = ref<RecursosEnvio | null>(null)
const fallo = ref('')

async function cargar() {
  try {
    estado.value = await adminService.estadoRecursos()
  } catch {
    // Un panel secundario no debe romper la pantalla de compras.
    estado.value = null
  }
}

async function enviar() {
  enviando.value = true
  fallo.value = ''
  try {
    ultimo.value = await adminService.enviarRecursos()
    await cargar()
  } catch (e: unknown) {
    fallo.value = (e as { message?: string }).message ?? 'No pudimos enviar la tanda'
  } finally {
    enviando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section v-if="estado" class="recursos">
    <div class="recursos__texto">
      <h2 class="recursos__title">Lista de implementos</h2>
      <p class="recursos__sub">
        <template v-if="estado.pendientes">
          Enviada a {{ estado.enviados }} de {{ estado.total }}. Faltan
          <strong>{{ estado.pendientes }}</strong
          >: sale una tanda automática cada día a las 9:00.
        </template>
        <template v-else>
          Enviada a las {{ estado.total }} alumnas. Las nuevas la reciben en el correo de
          compra.
        </template>
      </p>
    </div>

    <button
      v-if="estado.pendientes"
      type="button"
      class="recursos__boton"
      :disabled="enviando"
      @click="enviar"
    >
      {{ enviando ? 'Enviando…' : 'Enviar la siguiente tanda' }}
    </button>
  </section>

  <p v-if="fallo" class="aviso aviso--error">{{ fallo }}</p>
  <p v-else-if="ultimo" class="aviso">
    {{ ultimo.mensaje }}
    <template v-if="ultimo.fallidos">
      {{ ultimo.fallidos }} no salieron y entran en la próxima tanda.
    </template>
  </p>
</template>

<style lang="scss" scoped>
.recursos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: $space-md;
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $sand;
}

.recursos__texto {
  flex: 1 1 300px;
}

.recursos__title {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.recursos__sub {
  margin-top: 0.2rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.recursos__boton {
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: inherit;
  font-size: $text-xs;
  color: $cream;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.25s $ease;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.55;
    cursor: progress;
  }
}

.aviso {
  margin-bottom: $space-md;
  padding: 0.9rem 1.1rem;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-xs;
  color: $ink-soft;
}

.aviso--error {
  background-color: $alert-error-bg;
  color: $alert-error;
}
</style>
