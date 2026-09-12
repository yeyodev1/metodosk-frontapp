<script setup lang="ts">
/**
 * La guía del reto, para leer en pantalla.
 *
 * Llega como imágenes, una por página, con su correo marcado encima. No hay
 * descarga ni link al PDF: el archivo entero nunca sale del servidor. Eso no
 * impide una captura —nada lo impide— pero lo que se reparta lleva el nombre
 * de quien lo repartió, y eso es lo que hace pensar dos veces.
 *
 * Las páginas se cargan perezosas: son setenta y una, y pedirlas todas de
 * golpe dejaría la pantalla en blanco medio minuto en un teléfono.
 */
import { ref, watch } from 'vue'
import courseService, { type Audiencia, type GuiaAbierta } from '@/services/courseService'

const props = defineProps<{
  courseId: string
  audiencia: Audiencia
  titulo: string
  paginas: number
  mes: number
}>()

const abierta = ref(false)
const guia = ref<GuiaAbierta | null>(null)
const cargando = ref(false)
const error = ref('')

async function abrir() {
  abierta.value = true
  if (guia.value || cargando.value) return
  cargando.value = true
  error.value = ''
  try {
    guia.value = await courseService.guia(props.courseId, props.audiencia, props.mes)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'No pudimos abrir tu guía.'
  } finally {
    cargando.value = false
  }
}

// Con el visor abierto, la página de atrás no debe seguir haciendo scroll.
watch(abierta, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <div class="guia">
    <button type="button" class="guia__abrir" @click="abrir">
      <FaIcon icon="book-open" />
      <span>
        {{ titulo }}
        <small>{{ paginas }} páginas · se lee aquí</small>
      </span>
      <FaIcon icon="arrow-right" />
    </button>

    <Teleport to="body">
      <div v-if="abierta" class="visor" role="dialog" aria-modal="true">
        <header class="visor__barra">
          <p class="visor__title">{{ titulo }}</p>
          <button type="button" class="visor__cerrar" aria-label="Cerrar" @click="abierta = false">
            <FaIcon icon="xmark" />
          </button>
        </header>

        <div class="visor__hojas">
          <p v-if="cargando" class="visor__aviso">Abriendo tu guía…</p>
          <p v-else-if="error" class="visor__aviso">{{ error }}</p>

          <img
            v-for="(url, i) in guia?.urls ?? []"
            :key="url"
            :src="url"
            :alt="`Página ${i + 1} de ${titulo}`"
            class="visor__hoja"
            loading="lazy"
            draggable="false"
            @contextmenu.prevent
          />

          <p v-if="guia" class="visor__pie">
            Esta copia es tuya y lleva tu correo. No la compartas.
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.guia__abrir {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.9rem 1.1rem;
  border: 1px solid $sand;
  border-radius: $radius-md;
  background-color: $bone;
  font-family: inherit;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: $sand;
  }

  span {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  small {
    font-size: $text-xs;
    font-weight: 400;
    color: $ink-muted;
  }

  @include focus-ring;
}

.visor {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  background-color: $ink;
}

.visor__barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.9rem 1.1rem;
  background-color: $ink;
  color: $cream;
}

.visor__title {
  font-family: $font-display;
  font-size: $text-base;
}

.visor__cerrar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background-color: rgba($cream, 0.12);
  color: $cream;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: rgba($cream, 0.22);
  }
}

.visor__hojas {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 0.8rem 3rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.visor__hoja {
  width: 100%;
  max-width: 860px;
  border-radius: 6px;
  background-color: $cream;
  /* Sin arrastrar a otra pestaña ni guardar con un gesto. */
  user-select: none;
  -webkit-user-drag: none;
}

.visor__aviso,
.visor__pie {
  padding: 2rem 1rem;
  font-size: $text-xs;
  color: rgba($cream, 0.7);
  text-align: center;
}
</style>
