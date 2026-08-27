<script setup lang="ts">
/**
 * Los primeros pasos, apenas compra.
 *
 * Dos pasos: confirmar que vio el video de bienvenida, y subir sus fotos de
 * partida. Lo del video lo marca ella, no el reproductor — un video puede
 * quedarse abierto solo; que ella diga que lo vio es lo único que significa
 * algo.
 *
 * Las fotos no se retienen a cambio de nada: ya pagó, el acceso está abierto y
 * "Completar luego" funciona de verdad. Un onboarding que secuestra el acceso
 * se convierte en un peaje, y quien lo cruza a la fuerza sube cualquier foto
 * con tal de pasar.
 */
import { computed, onMounted, ref } from 'vue'
import onboardingService, {
  ANGULOS_PEDIDOS,
  ETIQUETA_ANGULO,
  type Angulo,
  type EstadoOnboarding,
} from '@/services/onboardingService'
import '@/plugins/icons'

const emit = defineEmits<{ listo: [] }>()

const estado = ref<EstadoOnboarding | null>(null)
const paso = ref<1 | 2>(1)
const cargando = ref(true)
const error = ref('')
const subiendo = ref<Angulo | null>(null)
const guardando = ref(false)

const abierto = computed(() => Boolean(estado.value) && !estado.value!.done)

const progreso = computed(() => (paso.value === 1 ? 50 : 100))

/** Foto ya subida hoy, por ángulo. */
function fotoDe(angulo: Angulo) {
  const hoy = new Date().toDateString()
  return estado.value?.fotos.find(
    (f) => f.angulo === angulo && new Date(f.createdAt).toDateString() === hoy,
  )
}

const algunaFoto = computed(() => ANGULOS_PEDIDOS.some((a) => fotoDe(a)))

async function confirmarVideo() {
  guardando.value = true
  try {
    estado.value = await onboardingService.videoVisto()
    paso.value = 2
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos guardarlo'
  } finally {
    guardando.value = false
  }
}

async function elegirFoto(evento: Event, angulo: Angulo) {
  const input = evento.target as HTMLInputElement
  const archivo = input.files?.[0]
  if (!archivo) return

  subiendo.value = angulo
  error.value = ''
  try {
    const firma = await onboardingService.firmarFoto(angulo)
    const publicId = await onboardingService.subirACloudinary(firma, archivo)
    estado.value = await onboardingService.guardarFoto(angulo, publicId)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos subir la foto'
  } finally {
    subiendo.value = null
    input.value = ''
  }
}

async function quitar(angulo: Angulo) {
  try {
    estado.value = await onboardingService.quitarFoto(angulo)
  } catch {
    error.value = 'No pudimos quitarla'
  }
}

async function terminar() {
  guardando.value = true
  try {
    // Sin fotos se marca como pospuesto, no como hecho: la diferencia importa
    // para poder recordárselo después.
    estado.value = algunaFoto.value
      ? await onboardingService.estado()
      : await onboardingService.saltar()
    emit('listo')
  } finally {
    guardando.value = false
  }
}

async function completarLuego() {
  guardando.value = true
  try {
    estado.value = await onboardingService.saltar()
    emit('listo')
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  try {
    estado.value = await onboardingService.estado()
    if (estado.value.videoSeen) paso.value = 2
  } catch {
    // Si no se puede leer el estado, no se le bloquea la academia.
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="paso">
      <div v-if="abierto && !cargando" class="onb">
        <div class="onb__caja">
          <!-- Barra de avance y salida -->
          <header class="onb__top">
            <button
              v-if="paso === 2 && !estado?.videoSeen"
              type="button"
              class="onb__atras"
              aria-label="Volver"
              @click="paso = 1"
            >
              <FaIcon icon="arrow-left" />
            </button>
            <span v-else class="onb__hueco" />

            <div class="barra" :aria-label="`Paso ${paso} de 2`">
              <span class="barra__relleno" :style="{ width: `${progreso}%` }" />
            </div>

            <button type="button" class="onb__saltar" @click="completarLuego">Saltar</button>
          </header>

          <!-- Paso 1: el video -->
          <div v-if="paso === 1" class="onb__cuerpo">
            <span class="onb__icono"><FaIcon icon="circle-play" /></span>
            <h2 class="onb__title">¿Ya viste el video de bienvenida?</h2>
            <p class="onb__texto">
              Es el que explica cómo está armado el reto y por dónde se empieza. Si aún no lo has
              visto, está en <strong>Empieza aquí</strong> y te esperamos.
            </p>

            <div class="onb__acciones">
              <button type="button" class="btn btn--solid" :disabled="guardando" @click="confirmarVideo">
                <FaIcon icon="check" /> Sí, ya lo vi
              </button>
              <button type="button" class="btn" @click="completarLuego">Todavía no</button>
            </div>
          </div>

          <!-- Paso 2: las fotos -->
          <div v-else class="onb__cuerpo">
            <span class="onb__icono"><FaIcon icon="camera" /></span>
            <h2 class="onb__title">Sube tus fotos de hoy</h2>
            <p class="onb__texto">
              Son tu punto de partida. En 3 meses van a ser la prueba de lo que cambió, mucho más
              que la balanza.
            </p>

            <!-- La instrucción de Karen, donde se necesita: antes de la foto -->
            <div class="reglas">
              <p class="reglas__title"><FaIcon icon="circle-question" /> Cómo tomarlas</p>
              <ul>
                <li><FaIcon icon="check" /> Una de <strong>frente</strong> y una de <strong>espalda</strong></li>
                <li><FaIcon icon="check" /> Con <strong>traje de baño</strong>, o short y top</li>
                <li>
                  <FaIcon icon="check" />
                  Se repiten <strong>cada dos semanas</strong>, con la misma ropa y en el mismo
                  lugar
                </li>
              </ul>
            </div>

            <div class="fotos">
              <div v-for="a in ANGULOS_PEDIDOS" :key="a" class="foto">
                <div v-if="fotoDe(a)" class="foto__vista">
                  <img :src="fotoDe(a)!.url" :alt="ETIQUETA_ANGULO[a]" />
                  <button type="button" class="foto__quitar" aria-label="Quitar" @click="quitar(a)">
                    <FaIcon icon="xmark" />
                  </button>
                  <span class="foto__ok"><FaIcon icon="check" /> {{ ETIQUETA_ANGULO[a] }}</span>
                </div>

                <label v-else class="foto__vacia" :class="{ 'foto__vacia--carga': subiendo === a }">
                  <FaIcon :icon="subiendo === a ? 'spinner' : 'camera'" :spin="subiendo === a" />
                  <span>{{ subiendo === a ? 'Subiendo…' : ETIQUETA_ANGULO[a] }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    :disabled="Boolean(subiendo) || !estado?.fotosDisponibles"
                    @change="elegirFoto($event, a)"
                  />
                </label>
              </div>
            </div>

            <p class="privacidad">
              <FaIcon icon="lock" />
              Solo las ven Scarlet y Karen. Se guardan privadas — ni siquiera con el enlace se
              abren desde fuera.
            </p>

            <p v-if="error" class="onb__error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>

            <div class="onb__acciones">
              <button type="button" class="btn btn--solid" :disabled="guardando" @click="terminar">
                {{ algunaFoto ? 'Listo, entrar al reto' : 'Entrar al reto' }}
                <FaIcon icon="arrow-right" />
              </button>
              <button type="button" class="btn" @click="completarLuego">Completar luego</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.onb {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: rgba($ink, 0.6);
  backdrop-filter: blur(4px);

  @include from('md') {
    align-items: center;
    padding: 1.5rem;
  }
}

.onb__caja {
  width: min(560px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: $radius-lg $radius-lg 0 0;
  background-color: $bone;

  @include from('md') {
    border-radius: $radius-lg;
  }
}

/* ── Barra superior ── */
.onb__top {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem clamp(1.1rem, 4vw, 1.6rem);
  background-color: $bone;
}

.onb__atras,
.onb__hueco {
  flex: none;
  width: 36px;
  height: 36px;
}

.onb__atras {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background-color: $cream;
  font-size: 0.85rem;
  color: $rose-deep;
  cursor: pointer;
}

.barra {
  flex: 1 1 auto;
  height: 5px;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.1);
  overflow: hidden;
}

.barra__relleno {
  display: block;
  height: 100%;
  border-radius: $radius-pill;
  background-color: $wine;
  transition: width 0.45s $ease;
}

.onb__saltar {
  flex: none;
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-sm;
  color: $rose-deep;
  cursor: pointer;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: $rose-soft;
  }
}

/* ── Cuerpo ── */
.onb__cuerpo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 clamp(1.1rem, 4vw, 1.8rem) clamp(1.4rem, 5vw, 2rem);
  padding-bottom: max(clamp(1.4rem, 5vw, 2rem), env(safe-area-inset-bottom));
  text-align: center;
}

.onb__icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 0.9rem;
  border-radius: 50%;
  background-color: $rose-soft;
  font-size: 1.2rem;
  color: $wine;
}

.onb__title {
  font-family: $font-display;
  font-size: $text-xl;
  line-height: 1.2;
  color: $ink;
}

.onb__texto {
  max-width: 44ch;
  margin-top: 0.5rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

/* ── Las instrucciones ── */
.reglas {
  width: 100%;
  margin-top: $space-md;
  padding: 0.9rem 1.1rem;
  border-radius: $radius-md;
  background-color: $cream;
  text-align: left;

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-top: 0.5rem;
    list-style: none;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: $text-sm;
    line-height: 1.45;
    color: $ink-soft;
  }

  li svg {
    flex: none;
    margin-top: 0.3em;
    font-size: 0.65em;
    color: $sage;
  }
}

.reglas__title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $ink-muted;

  svg {
    color: $rose-deep;
  }
}

/* ── Fotos ── */
.fotos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  width: 100%;
  margin-top: $space-sm;
}

.foto {
  aspect-ratio: 3 / 4;
}

.foto__vacia {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  height: 100%;
  border: 1.5px dashed rgba($rose-deep, 0.45);
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $rose-deep;
  cursor: pointer;
  transition: border-color 0.26s $ease, background-color 0.26s $ease;

  svg {
    font-size: 1.4rem;
  }

  &:hover {
    border-color: $rose-deep;
    background-color: $rose-soft;
  }

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
}

.foto__vacia--carga {
  cursor: wait;
}

.foto__vista {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: $radius-md;
  background-color: $sand;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.foto__quitar {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background-color: rgba($ink, 0.6);
  font-size: 0.75rem;
  color: $cream;
  cursor: pointer;

  &:hover {
    background-color: $ink;
  }
}

.foto__ok {
  position: absolute;
  left: 0.4rem;
  bottom: 0.4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: $radius-pill;
  background-color: rgba($cream, 0.92);
  font-size: 0.66rem;
  font-weight: 600;
  color: $ink;
}

.privacidad {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 46ch;
  margin-top: 0.9rem;
  font-size: $text-xs;
  line-height: 1.45;
  color: $ink-muted;
  text-align: left;

  svg {
    flex: none;
    color: $sage;
  }
}

.onb__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.8rem;
  padding: 0.6rem 0.9rem;
  border-radius: $radius-sm;
  background-color: $alert-error-bg;
  font-size: $text-sm;
  color: $alert-error;
}

/* ── Acciones ── */
.onb__acciones {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
  margin-top: $space-md;

  @include from('md') {
    flex-direction: row-reverse;
    justify-content: center;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.6rem;
  border: 1px solid rgba($ink, 0.2);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-sm;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.28s $ease, border-color 0.28s $ease, color 0.28s $ease;

  &:hover:not(:disabled) {
    border-color: $ink;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @include focus-ring;
}

.btn--solid {
  border-color: $ink;
  background-color: $ink;
  color: $cream;

  &:hover:not(:disabled) {
    background-color: $wine;
    border-color: $wine;
  }
}

/* ── Transición ── */
.paso-enter-active,
.paso-leave-active {
  animation: velo 0.3s ease-out;
}

.paso-leave-active {
  animation-direction: reverse;
}

.paso-enter-active .onb__caja {
  animation: entrar 0.4s $ease;
}

.paso-leave-active .onb__caja {
  animation: entrar 0.22s $ease reverse;
}

@keyframes velo {
  from {
    opacity: 0;
  }
}

@keyframes entrar {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
}

@include reduced-motion {
  .paso-enter-active,
  .paso-leave-active,
  .paso-enter-active .onb__caja,
  .paso-leave-active .onb__caja {
    animation: none;
  }
}
</style>
