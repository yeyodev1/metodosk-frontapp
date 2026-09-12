<script setup lang="ts">
/**
 * El aviso de "hay algo nuevo en tu reto", por correo a todas.
 *
 * Escribir y mandar son dos pasos a propósito: el texto se guarda, se lee con
 * calma —y lo revisa Karen— y recién después se da la orden. Un correo a
 * noventa personas no se puede recoger.
 *
 * Sale escalonado, 25 por hora: el plan de Resend tiene tope diario y el
 * correo de una compra nueva, que lleva la contraseña, no puede quedarse sin
 * cuota por un aviso.
 */
import { computed, onMounted, ref } from 'vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import adminService, { type EstadoNovedad } from '@/services/adminService'

const estado = ref<EstadoNovedad | null>(null)
const titulo = ref('')
const texto = ref('')
const ctaTexto = ref('')
const ctaUrl = ref('')
const guardando = ref(false)
const enviando = ref(false)
const confirmando = ref(false)
const error = ref('')
const guardado = ref(false)

const novedad = computed(() => estado.value?.novedad ?? null)
const yaSalio = computed(() => Boolean(novedad.value?.activadaEn))
const puedeGuardar = computed(() => titulo.value.trim() && texto.value.trim())

async function cargar() {
  try {
    estado.value = await adminService.novedad()
    const n = estado.value.novedad
    if (n) {
      titulo.value = n.titulo
      texto.value = n.texto
      ctaTexto.value = n.ctaTexto ?? ''
      ctaUrl.value = n.ctaUrl ?? ''
    }
  } catch {
    estado.value = null
  }
}

async function guardar() {
  if (!puedeGuardar.value) return
  guardando.value = true
  error.value = ''
  guardado.value = false
  try {
    estado.value = await adminService.escribirNovedad({
      titulo: titulo.value,
      texto: texto.value,
      ctaTexto: ctaTexto.value || null,
      ctaUrl: ctaUrl.value || null,
    })
    guardado.value = true
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'No se pudo guardar.'
  } finally {
    guardando.value = false
  }
}

async function avisar() {
  enviando.value = true
  error.value = ''
  try {
    const r = await adminService.avisarNovedad()
    estado.value = r.estado
    confirmando.value = false
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'No se pudo enviar.'
  } finally {
    enviando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section class="nov">
    <header class="nov__head">
      <h2 class="nov__title">Avisar de una novedad</h2>
      <p class="nov__sub">
        Un correo a las <strong>{{ estado?.total ?? '—' }}</strong> alumnas. Se guarda primero y se
        manda cuando ustedes le den. Sale de a 25 por hora, con tope de
        {{ estado?.topeDiario ?? 50 }} al día, para no dejar sin cuota al correo de las compras.
      </p>
    </header>

    <div class="nov__form">
      <label class="nov__campo">
        <span>Asunto</span>
        <input v-model="titulo" type="text" placeholder="Ya está tu video de nutrición" />
      </label>

      <label class="nov__campo">
        <span>Texto</span>
        <textarea
          v-model="texto"
          rows="5"
          placeholder="Escribe aquí. Cada línea en blanco separa un párrafo."
        />
      </label>

      <div class="nov__fila">
        <label class="nov__campo">
          <span>Texto del botón</span>
          <input v-model="ctaTexto" type="text" placeholder="Ver el video" />
        </label>
        <label class="nov__campo">
          <span>Link del botón</span>
          <input v-model="ctaUrl" type="url" placeholder="https://metodosk.ec/academia" />
        </label>
      </div>

      <div class="nov__acciones">
        <button type="button" class="nov__guardar" :disabled="!puedeGuardar || guardando" @click="guardar">
          {{ guardando ? 'Guardando…' : 'Guardar' }}
        </button>
        <button
          type="button"
          class="nov__enviar"
          :disabled="!novedad || guardando"
          @click="confirmando = true"
        >
          <FaIcon icon="paper-plane" />
          {{ yaSalio ? 'Seguir enviando' : 'Avisar a todas' }}
        </button>
      </div>

      <p v-if="guardado" class="nov__ok">Guardado. Todavía no salió ningún correo.</p>
      <p v-if="error" class="nov__error">{{ error }}</p>

      <p v-if="yaSalio && estado" class="nov__estado">
        Enviado a {{ estado.enviados }} de {{ estado.total }}.
        <template v-if="estado.pendientes">
          Faltan <strong>{{ estado.pendientes }}</strong> y salen solas, 25 por hora.
        </template>
        <template v-else>Ya les llegó a todas.</template>
        Hoy salieron {{ estado.hoy }} de {{ estado.topeDiario }}.
      </p>
    </div>

    <ConfirmModal
      :open="confirmando"
      title="¿Mandar este correo a todas?"
      :message="`Le va a llegar a ${estado?.total ?? 0} alumnas con el asunto “${titulo}”. Salen 25 ahora y el resto por hora. No se puede recoger.`"
      confirm-label="Sí, mandarlo"
      :loading="enviando"
      @confirm="avisar"
      @cancel="confirmando = false"
    />
  </section>
</template>

<style lang="scss" scoped>
.nov {
  margin-bottom: $space-md;
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.nov__title {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.nov__sub {
  margin-top: 0.2rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;

  strong {
    color: $ink;
  }
}

.nov__form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.9rem;
}

.nov__fila {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;

  .nov__campo {
    flex: 1 1 200px;
  }
}

.nov__campo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  span {
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-soft;
  }

  input,
  textarea {
    padding: 0.6rem 0.8rem;
    border: 1px solid $sand;
    border-radius: $radius-md;
    background-color: $bone;
    font-family: inherit;
    font-size: $text-xs;
    color: $ink;
    resize: vertical;
  }
}

.nov__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.2rem;
}

.nov__guardar,
.nov__enviar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: $radius-pill;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.nov__guardar {
  background-color: $bone;
  color: $ink;
}

.nov__enviar {
  background-color: $ink;
  color: $cream;
}

.nov__ok,
.nov__estado {
  font-size: $text-xs;
  color: $ink-soft;

  strong {
    color: $ink;
  }
}

.nov__error {
  font-size: $text-xs;
  color: $wine;
}
</style>
