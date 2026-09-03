<script setup lang="ts">
/**
 * Subir la foto del mes — siempre a la vista, no solo al comprar.
 *
 * Antes esto solo existía dentro del recorrido de bienvenida: se le pedían las
 * fotos una vez y después no había dónde volver a subirlas. Un seguimiento que
 * solo acepta la primera toma no es un seguimiento.
 *
 * Junto a cada hueco va la última foto de ese mismo ángulo: repetir la pose es
 * lo que hace comparables dos fotos, y para repetirla hay que verla.
 */
import { ref } from 'vue'
import onboardingService, {
  ANGULOS_PEDIDOS,
  ETIQUETA_ANGULO,
  type Angulo,
  type EstadoOnboarding,
} from '@/services/onboardingService'

const props = defineProps<{ estado: EstadoOnboarding }>()
const emit = defineEmits<{ actualizado: [EstadoOnboarding] }>()

const subiendo = ref<Angulo | null>(null)
const error = ref('')

/** La foto de ese ángulo subida hoy — la que todavía se puede rehacer. */
function deHoy(angulo: Angulo) {
  const hoy = new Date().toDateString()
  return props.estado.fotos.find(
    (f) => f.angulo === angulo && new Date(f.createdAt).toDateString() === hoy,
  )
}

function referencia(angulo: Angulo) {
  const ultima = props.estado.ultimas[angulo]
  if (!ultima) return null
  // La de hoy no sirve de referencia de sí misma.
  if (new Date(ultima.createdAt).toDateString() === new Date().toDateString()) return null
  return ultima
}

function cuando(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

async function elegir(evento: Event, angulo: Angulo) {
  const input = evento.target as HTMLInputElement
  const archivo = input.files?.[0]
  if (!archivo) return

  subiendo.value = angulo
  error.value = ''
  try {
    const firma = await onboardingService.firmarFoto(angulo)
    const publicId = await onboardingService.subirACloudinary(firma, archivo)
    emit('actualizado', await onboardingService.guardarFoto(angulo, publicId))
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos subir la foto'
  } finally {
    subiendo.value = null
    input.value = ''
  }
}

async function quitar(angulo: Angulo) {
  error.value = ''
  try {
    emit('actualizado', await onboardingService.quitarFoto(angulo))
  } catch {
    error.value = 'No pudimos quitarla'
  }
}
</script>

<template>
  <section class="subir">
    <header class="subir__head">
      <h2 class="subir__title"><FaIcon icon="camera" /> Tu foto del mes</h2>
      <p class="subir__sub">
        Una de frente y una de espalda, con traje de baño o short y top. Solo las ven Scarlet y
        Karen.
      </p>
    </header>

    <p v-if="!estado.fotosDisponibles" class="subir__aviso">
      <FaIcon icon="triangle-exclamation" /> La subida de fotos no está disponible ahora mismo.
      Escríbenos y lo revisamos.
    </p>

    <div v-else class="huecos">
      <div v-for="a in ANGULOS_PEDIDOS" :key="a" class="hueco">
        <p class="hueco__label">{{ ETIQUETA_ANGULO[a] }}</p>

        <!-- Ya subió esta toma: se ve, y se puede rehacer -->
        <div v-if="deHoy(a)" class="hueco__caja hueco__caja--lista">
          <img :src="deHoy(a)!.url" :alt="`Tu foto ${ETIQUETA_ANGULO[a].toLowerCase()} de hoy`" />
          <button type="button" class="hueco__quitar" aria-label="Quitar" @click="quitar(a)">
            <FaIcon icon="xmark" />
          </button>
          <span class="hueco__ok"><FaIcon icon="check" /> Subida hoy</span>
        </div>

        <label v-else class="hueco__caja hueco__caja--vacia">
          <FaIcon :icon="subiendo === a ? 'spinner' : 'camera'" :spin="subiendo === a" />
          <span>{{ subiendo === a ? 'Subiendo…' : 'Subir foto' }}</span>
          <input
            type="file"
            accept="image/*"
            :disabled="Boolean(subiendo)"
            @change="elegir($event, a)"
          />
        </label>

        <!-- La referencia: para repetir la pose hay que poder verla -->
        <div v-if="referencia(a)" class="hueco__ref">
          <img :src="referencia(a)!.url" alt="" />
          <span>Tu última, del {{ cuando(referencia(a)!.createdAt) }}</span>
        </div>
      </div>
    </div>

    <p v-if="error" class="subir__error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>

    <p class="subir__privacidad">
      <FaIcon icon="lock" /> Se guardan privadas — ni con el enlace se abren desde fuera.
    </p>
  </section>
</template>

<style lang="scss" scoped>
.subir {
  padding: clamp(1.1rem, 3vw, 1.6rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.subir__head {
  margin-bottom: 1rem;
}

.subir__title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;

  svg {
    font-size: 0.8em;
    color: $rose-deep;
  }
}

.subir__sub {
  margin-top: 0.3rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

/* Grilla con flex-wrap: en este proyecto no se usa CSS Grid. */
.huecos {
  @include flex-cards(150px, 0.9rem);
}

.hueco {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.hueco__label {
  @include eyebrow;
  font-size: 0.66rem;
}

.hueco__caja {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  aspect-ratio: 3 / 4;
  border-radius: $radius-md;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.hueco__caja--vacia {
  border: 1.5px dashed rgba($ink, 0.22);
  background-color: $bone;
  font-size: $text-xs;
  color: $ink-soft;
  cursor: pointer;
  transition: border-color 0.28s $ease, background-color 0.28s $ease;

  svg {
    font-size: 1.1rem;
    color: $rose-deep;
  }

  &:hover {
    border-color: $rose;
    background-color: $rose-soft;
  }

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
}

.hueco__quitar {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background-color: rgba($ink, 0.65);
  color: $cream;
  font-size: 0.7rem;
  cursor: pointer;
}

.hueco__ok {
  position: absolute;
  left: 0.5rem;
  bottom: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.22rem 0.6rem;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.7);
  font-size: 0.66rem;
  color: $cream;
}

.hueco__ref {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.66rem;
  line-height: 1.35;
  color: $ink-muted;

  img {
    flex: none;
    width: 32px;
    height: 42px;
    object-fit: cover;
    border-radius: $radius-sm;
  }
}

.subir__error {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.8rem;
  font-size: $text-sm;
  color: $alert-error;
}

.subir__privacidad {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.9rem;
  font-size: $text-xs;
  color: $ink-muted;
}
</style>
