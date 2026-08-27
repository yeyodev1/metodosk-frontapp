<script setup lang="ts">
/**
 * El reto de la alumna: en qué semana va y qué le toca.
 *
 * Los cursos llegan del backend ya filtrados por su reto y por el mes en que
 * está. Lo que todavía no se sube se muestra igual, marcado como próximamente:
 * la estructura ya se vendió, así que ocultarla la dejaría creyendo que compró
 * menos de lo que compró.
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import CldImage from '@/components/ui/CldImage.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import MisRetos from '@/components/member/MisRetos.vue'
import courseService, { type CursoAlumna } from '@/services/courseService'
import progressService, { type MiAvance } from '@/services/progressService'
import { useVideoProgress } from '@/composables/useVideoProgress'
import { useSessionStore } from '@/stores/session'
import { CHALLENGES } from '@/config/site'
import { ETAPAS, SEMANAS } from '@/config/academy'

const session = useSessionStore()
const user = computed(() => session.user)
const esAdmin = computed(() => session.isAdmin)

const cursos = ref<CursoAlumna[]>([])
const cargando = ref(true)
const error = ref('')
const abierto = ref<CursoAlumna | null>(null)

/* ── Avance ─────────────────────────────────────────────────────────────────
   Lo calcula el backend y no cada pantalla: si la barra del curso y la del
   método se computaran por separado, acabarían diciendo cosas distintas. */
const avance = ref<MiAvance | null>(null)

const porcentajeMetodo = computed(() => avance.value?.porcentajeTotal ?? 0)

function avanceDe(courseId: string) {
  return avance.value?.cursos.find((c) => c.courseId === courseId) ?? null
}

/* ── El video que se está viendo ────────────────────────────────────────── */
type Reproduciendo = { lessonId: string; title: string; embedUrl: string }

const viendo = ref<Reproduciendo | null>(null)
const marco = ref<HTMLIFrameElement | null>(null)
const marcando = ref(false)
const { terminado, seguir, soltar } = useVideoProgress()

async function ver(curso: CursoAlumna, leccion: { id: string; title: string; embedUrl: string | null; seconds: number }) {
  if (!leccion.embedUrl) return
  soltar()
  viendo.value = { lessonId: leccion.id, title: leccion.title, embedUrl: leccion.embedUrl }
  await nextTick()
  seguir(marco.value, curso.id, leccion.id, leccion.seconds)
}

/**
 * Marcar a mano.
 *
 * El reproductor va en otro marco, y hay navegadores y extensiones que no
 * dejan pasar sus mensajes. Sin este botón, una alumna en ese caso vería su
 * avance congelado sin poder hacer nada.
 */
async function marcarVista(curso: CursoAlumna, lessonId: string) {
  marcando.value = true
  try {
    await progressService.marcarVista(curso.id, lessonId)
    await cargarAvance()
    const l = curso.lessons.find((x) => x.id === lessonId)
    if (l) l.completed = true
    if (lessonId === 'welcome' && curso.welcomeVideo) curso.welcomeVideo.completed = true
  } catch {
    // Si falla, el estado real sigue siendo el del servidor: no se miente acá.
  } finally {
    marcando.value = false
  }
}

async function cargarAvance() {
  try {
    avance.value = await progressService.mio()
  } catch {
    // Sin avance la academia se ve igual, solo sin barras.
  }
}

/** La cuenta de administración no compró reto: elige cuál revisar. */
const retoPreview = ref(CHALLENGES[0]!.name)

const OPCIONES_RETO = CHALLENGES.map((c) => ({
  value: c.name,
  label: c.name,
  hint: c.claim,
}))

const fin = computed(() => (user.value?.accessUntil ? new Date(user.value.accessUntil) : null))

/** El reto dura 3 meses: el inicio se deduce del final del acceso. */
const inicio = computed(() => {
  if (!fin.value) return null
  const d = new Date(fin.value)
  d.setMonth(d.getMonth() - 3)
  return d
})

const semana = computed(() => {
  if (esAdmin.value || !inicio.value) return 1
  const transcurridas = Math.floor((Date.now() - inicio.value.getTime()) / (7 * 86_400_000))
  return Math.min(Math.max(transcurridas + 1, 1), SEMANAS)
})

const mes = computed(() => Math.min(Math.ceil(semana.value / 4), 3))
const etapa = computed(() => ETAPAS.find((e) => e.mes === mes.value)!)
const avanceSemanas = computed(() => Math.round((semana.value / SEMANAS) * 100))
const activo = computed(() => esAdmin.value || Boolean(user.value?.accessActive))

const fechaFin = computed(() =>
  fin.value
    ? fin.value.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
    : null,
)

const nombre = computed(() => user.value?.name?.split(' ')[0] || '')

/** Con los dos retos comprados, cada curso tiene que decir a cuál pertenece. */
const variosRetos = computed(() => {
  if (esAdmin.value) return false
  return (user.value?.challenges?.length ?? 0) > 1
})

const NOMBRE_RETO: Record<string, string> = {
  recomposicion: 'SK Recomposición',
  volumen: 'SK Volumen',
  ambas: 'Los dos retos',
}

const ETIQUETA: Record<CursoAlumna['estado'], string> = {
  abierto: 'Disponible',
  proximamente: 'Próximamente',
  cerrado: 'Se abre más adelante',
}

function etiqueta(curso: CursoAlumna) {
  if (curso.estado === 'cerrado') return `Se abre en el mes ${curso.unlockMonth}`
  return ETIQUETA[curso.estado]
}

function duracion(segundos: number | null) {
  if (!segundos) return null
  const min = Math.round(segundos / 60)
  return `${min} min`
}

function abrir(curso: CursoAlumna) {
  if (curso.estado !== 'abierto') return
  abierto.value = curso
  viendo.value = null
  document.body.style.overflow = 'hidden'
}

function cerrar() {
  // Guardar antes de desmontar: cerrar es cuando más avance se pierde.
  soltar()
  viendo.value = null
  abierto.value = null
  document.body.style.overflow = ''
  cargarAvance()
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    cursos.value = await courseService.mios(mes.value)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar tu reto'
  } finally {
    cargando.value = false
  }
}

watch(mes, cargar)

// El video terminó: el avance ya se guardó, falta reflejarlo en las barras.
watch(terminado, (fin) => {
  if (fin) cargarAvance()
})

onMounted(async () => {
  if (!session.user) await session.restore()
  await Promise.all([cargar(), cargarAvance()])
})
</script>

<template>
  <div class="academia">
    <header class="hola">
      <p class="hola__eyebrow">Método SK · Reto de 3 meses</p>
      <h1 class="hola__title">
        Hola<span v-if="nombre">, {{ nombre }}</span>
      </h1>
      <div v-if="esAdmin" class="hola__reto">
        <BaseSelect
          v-model="retoPreview"
          :options="OPCIONES_RETO"
          label="Ver como quien compró"
        />
      </div>
    </header>

    <!-- El avance del reto, no un contador de días sueltos -->
    <section v-if="activo" class="avance">
      <div class="avance__head">
        <div>
          <p class="avance__semana">Semana {{ semana }} de {{ SEMANAS }}</p>
          <h2 class="avance__etapa">Mes {{ mes }} · {{ etapa.title }}</h2>
          <p class="avance__text">{{ etapa.text }}</p>
        </div>
        <p v-if="fechaFin && !esAdmin" class="avance__hasta">
          Tu acceso va hasta el <strong>{{ fechaFin }}</strong>
        </p>
      </div>

      <div class="rail" :aria-label="`Semana ${semana} de ${SEMANAS}`">
        <span
          v-for="n in SEMANAS"
          :key="n"
          class="rail__week"
          :class="{ 'rail__week--done': n <= semana }"
        />
      </div>
      <div class="rail__pies">
        <p class="rail__pct">{{ avanceSemanas }}% del tiempo</p>
        <p class="rail__pct rail__pct--metodo">{{ porcentajeMetodo }}% del método visto</p>
      </div>
    </section>

    <section v-else class="cerrado">
      <p class="cerrado__badge">Sin acceso vigente</p>
      <p class="cerrado__text">
        Tu acceso terminó<span v-if="fechaFin"> el {{ fechaFin }}</span>. El material vuelve a
        abrirse cuando entres a un nuevo reto.
      </p>
      <a class="cerrado__cta" href="/#precio">Ver el reto</a>
    </section>

    <MisRetos :preview="esAdmin ? retoPreview : null" class="bloque-retos" />

    <section class="modulos">
      <h2 class="modulos__title">
        {{ variosRetos ? 'El material de tus retos' : 'Tu método, por dentro' }}
      </h2>

      <p v-if="error" class="aviso aviso--error">{{ error }}</p>
      <p v-else-if="cargando" class="aviso">Cargando tu reto…</p>
      <p v-else-if="!cursos.length" class="aviso">
        Todavía no hay cursos publicados. Te avisamos por correo apenas se abra el primero.
      </p>

      <article
        v-for="c in cursos"
        :key="c.id"
        class="modulo"
        :class="{ 'modulo--locked': c.estado !== 'abierto' }"
      >
        <div v-if="c.coverPhoto" class="modulo__foto">
          <CldImage
            :public-id="c.coverPhoto"
            :alt="c.title"
            ratio="4:3"
            sizes="(min-width: 900px) 260px, 100vw"
          />
        </div>

        <div class="modulo__body">
          <p class="modulo__eyebrow">
            <span class="modulo__num">{{ String(c.order).padStart(2, '0') }}</span>
            <span
              class="modulo__estado"
              :class="{ 'modulo__estado--pronto': c.estado !== 'abierto' }"
            >{{ etiqueta(c) }}</span>
            <span v-if="variosRetos" class="modulo__reto">{{ NOMBRE_RETO[c.challenge] }}</span>
          </p>
          <h3 class="modulo__title">{{ c.title }}</h3>
          <p class="modulo__claim">{{ c.summary }}</p>
          <p v-if="c.lessons.length" class="modulo__clases">
            {{ c.lessons.length }} {{ c.lessons.length === 1 ? 'clase' : 'clases' }}
          </p>

          <!-- El avance de este curso, solo cuando ya empezó -->
          <div v-if="avanceDe(c.id)?.vistos" class="mini">
            <span class="mini__riel">
              <span class="mini__relleno" :style="{ width: `${avanceDe(c.id)!.porcentaje}%` }" />
            </span>
            <span class="mini__texto">
              {{ avanceDe(c.id)!.vistos }} de {{ avanceDe(c.id)!.total }}
            </span>
          </div>
          <button
            type="button"
            class="modulo__cta"
            :disabled="c.estado !== 'abierto'"
            @click="abrir(c)"
          >
            {{ c.estado === 'abierto' ? 'Entrar al curso' : 'Aún no disponible' }}
          </button>
        </div>
      </article>
    </section>

    <!-- Detalle del curso -->
    <Transition name="modal">
      <div v-if="abierto" class="modal" @click.self="cerrar">
        <div class="modal__card" role="dialog" aria-modal="true">
          <button type="button" class="modal__close" aria-label="Cerrar" @click="cerrar">×</button>

          <p class="modal__eyebrow">Curso {{ String(abierto.order).padStart(2, '0') }}</p>
          <h3 class="modal__title">{{ abierto.title }}</h3>
          <p class="modal__text">{{ abierto.summary }}</p>

          <!-- El reproductor: la clase elegida, o la bienvenida por defecto -->
          <div v-if="viendo || abierto.welcomeVideo" class="video">
            <iframe
              ref="marco"
              :key="viendo?.lessonId || 'welcome'"
              :src="viendo?.embedUrl || abierto.welcomeVideo!.embedUrl"
              loading="lazy"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen
              :title="viendo?.title || 'Video de bienvenida'"
            />
          </div>

          <div v-if="viendo || abierto.welcomeVideo" class="viendo">
            <p class="viendo__title">{{ viendo?.title || 'Video de bienvenida' }}</p>
            <button
              type="button"
              class="viendo__marcar"
              :disabled="marcando"
              @click="marcarVista(abierto, viendo?.lessonId || 'welcome')"
            >
              Marcar como vista
            </button>
          </div>

          <h4 class="modal__sub">Clases</h4>
          <ul v-if="abierto.lessons.length" class="clases">
            <li v-for="l in abierto.lessons" :key="l.id">
              <button
                type="button"
                class="clase"
                :class="{
                  'clase--activa': viendo?.lessonId === l.id,
                  'clase--vista': l.completed,
                }"
                :disabled="!l.embedUrl"
                @click="ver(abierto, l)"
              >
                <span class="clase__tick" aria-hidden="true">
                  <svg v-if="l.completed" viewBox="0 0 12 12" width="11" height="11">
                    <path
                      d="M1.5 6.2 4.4 9l6-6.4"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span v-else class="clase__num">{{ String(l.order).padStart(2, '0') }}</span>
                </span>
                <span class="clase__texto">
                  <span class="clase__title">{{ l.title }}</span>
                  <span v-if="l.summary" class="clase__sum">{{ l.summary }}</span>
                </span>
                <span v-if="l.completed" class="clase__dur">Vista</span>
                <span v-else-if="l.seconds > 10" class="clase__dur">A medias</span>
                <span v-else-if="duracion(l.durationSeconds)" class="clase__dur">
                  {{ duracion(l.durationSeconds) }}
                </span>
                <span v-else-if="!l.embedUrl" class="clase__dur">Próximamente</span>
              </button>
            </li>
          </ul>
          <p v-else class="aviso">Las clases de este curso se publican pronto.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
/* Móvil primero: el botón de menú flota arriba a la izquierda */
.academia {
  padding: 4.2rem clamp(1rem, 3vw, 2.5rem) 4rem;

  @include from('lg') {
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
  }
}

.hola {
  margin-bottom: $space-md;
}

.hola__eyebrow {
  @include eyebrow;
}

.hola__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.hola__reto {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem;
  margin-top: 0.55rem;
}

/* ── Avance del reto ── */
.avance {
  padding: clamp(1.1rem, 3vw, 1.8rem);
  border-radius: $radius-lg;
  background-color: $ink;
  color: $cream;
}

.avance__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: $space-sm;
}

.avance__semana {
  @include eyebrow;
  color: $rose-soft;
}

.avance__etapa {
  font-family: $font-display;
  font-size: $text-xl;
  color: $cream;
}

.avance__text {
  max-width: 46ch;
  margin-top: 0.25rem;
  font-size: $text-sm;
  color: rgba($cream, 0.68);
}

.avance__hasta {
  font-size: $text-xs;
  color: rgba($cream, 0.6);

  strong {
    color: $cream;
  }
}

.rail {
  display: flex;
  gap: 4px;
  margin-top: $space-md;
}

.rail__week {
  flex: 1 1 0;
  height: 5px;
  border-radius: $radius-pill;
  background-color: rgba($cream, 0.14);
  transition: background-color 0.5s $ease;
}

.rail__week--done {
  background-color: $rose;
}

.rail__pies {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.rail__pct {
  font-size: $text-xs;
  color: rgba($cream, 0.5);
}

.rail__pct--metodo {
  color: $rose-soft;
}

/* Avance del curso en su tarjeta */
.mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 260px;
  margin-top: 0.2rem;
}

.mini__riel {
  flex: 1 1 auto;
  height: 4px;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.1);
  overflow: hidden;
}

.mini__relleno {
  display: block;
  height: 100%;
  border-radius: $radius-pill;
  background-color: $rose;
  transition: width 0.5s $ease;
}

.mini__texto {
  flex: none;
  font-size: $text-xs;
  color: $ink-muted;
}

/* ── Acceso terminado ── */
.cerrado {
  padding: clamp(1.1rem, 3vw, 1.8rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.cerrado__badge {
  @include eyebrow;
  color: $ink-muted;
}

.cerrado__text {
  max-width: 52ch;
  margin: 0.4rem 0 $space-sm;
  font-size: $text-sm;
  color: $ink-soft;
}

.cerrado__cta {
  display: inline-block;
  padding: 0.7rem 1.4rem;
  border-radius: $radius-pill;
  background-color: $ink;
  color: $cream;
  font-size: $text-xs;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── Cursos ── */
.bloque-retos {
  margin-top: $space-lg;
}

.modulos {
  margin-top: $space-lg;
  display: grid;
  grid-template-columns: 1fr;
  gap: $space-sm;

  @include from('lg') {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.modulos__title,
.aviso {
  @include from('lg') {
    grid-column: 1 / -1;
  }
}

.modulos__title {
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.aviso {
  padding: $space-md;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;
}

.aviso--error {
  background-color: $alert-error-bg;
  color: $alert-error;
}

.modulo {
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;
  border-radius: $radius-lg;
  background-color: $cream;
  transition: transform 0.4s $ease, box-shadow 0.4s $ease;

  @include from('md') {
    grid-template-columns: 190px 1fr;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.modulo--locked {
  opacity: 0.62;

  &:hover {
    transform: none;
    box-shadow: none;
  }
}

.modulo__foto {
  overflow: hidden;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.modulo__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  padding: clamp(1.1rem, 3vw, 1.5rem);
}

.modulo__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.modulo__num {
  font-family: $font-display;
  font-size: $text-base;
  font-style: italic;
  color: $rose-deep;
}

.modulo__estado {
  padding: 0.14rem 0.6rem;
  border-radius: $radius-pill;
  background-color: $alert-success-bg;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #4a7a45;
}

.modulo__reto {
  padding: 0.14rem 0.6rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  color: $wine;
}

.modulo__estado--pronto {
  background-color: rgba($ink, 0.07);
  color: $ink-muted;
}

.modulo__title {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.modulo__claim {
  max-width: 54ch;
  font-size: $text-sm;
  color: $ink-soft;
}

.modulo__clases {
  font-size: $text-xs;
  color: $ink-muted;
}

.modulo__cta {
  margin-top: 0.6rem;
  padding: 0.6rem 1.1rem;
  border: 1px solid rgba($ink, 0.2);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.3s $ease, color 0.3s $ease, border-color 0.3s $ease;

  &:hover:not(:disabled) {
    border-color: $ink;
    background-color: $ink;
    color: $cream;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  @include focus-ring;
}

/* ── Detalle ── */
.modal {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: rgba($ink, 0.55);
  backdrop-filter: blur(3px);

  @include from('md') {
    align-items: center;
    padding: 1rem;
  }
}

.modal__card {
  position: relative;
  width: min(620px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: clamp(1.3rem, 4vw, 2.2rem);
  padding-bottom: max(1.3rem, env(safe-area-inset-bottom));
  border-radius: $radius-lg $radius-lg 0 0;
  background-color: $bone;

  @include from('md') {
    max-height: 86vh;
    border-radius: $radius-lg;
  }
}

.modal__close {
  position: absolute;
  top: 0.8rem;
  right: 0.9rem;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background-color: rgba($ink, 0.06);
  font-size: 1.2rem;
  line-height: 1;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.3s $ease;

  &:hover {
    background-color: rgba($ink, 0.12);
  }
}

.modal__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.modal__title {
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.modal__text {
  margin: 0.4rem 0 $space-sm;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

.video {
  position: relative;
  margin-bottom: $space-md;
  padding-top: 56.25%;
  overflow: hidden;
  border-radius: $radius-md;
  background-color: $ink;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
}

.modal__sub {
  @include eyebrow;
  margin-bottom: 0.5rem;
  color: $ink-muted;
}

.clases {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  list-style: none;
}

/* El video que se está viendo */
.viendo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin: -0.8rem 0 $space-md;
}

.viendo__title {
  font-size: $text-sm;
  color: $ink;
}

.viendo__marcar {
  padding: 0.35rem 0.85rem;
  border: 1px solid rgba($ink, 0.2);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-soft;
  cursor: pointer;
  transition: border-color 0.28s $ease, color 0.28s $ease;

  &:hover:not(:disabled) {
    border-color: $ink;
    color: $ink;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @include focus-ring;
}

.clase {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: none;
  border-radius: $radius-sm;
  background-color: $cream;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.26s $ease;

  &:hover:not(:disabled) {
    background-color: $sand;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @include focus-ring;
}

.clase--activa {
  background-color: $rose-soft;
}

.clase__tick {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba($ink, 0.06);
  color: $ink-muted;
}

.clase--vista .clase__tick {
  background-color: $alert-success-bg;
  color: #4a7a45;
}

.clase__num {
  font-family: $font-display;
  font-size: 0.72rem;
  font-style: italic;
  color: $rose-deep;
}

.clase__texto {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.clase__title {
  font-size: $text-sm;
  color: $ink;
}

.clase__sum {
  font-size: $text-xs;
  color: $ink-muted;
}

.clase__dur {
  flex: none;
  font-size: $text-xs;
  color: $ink-muted;
}

/* ── Transiciones ── */
.modal-enter-active .modal__card {
  animation: card-in 0.34s $ease;
}

.modal-leave-active .modal__card {
  animation: card-in 0.2s $ease reverse;
}

.modal-enter-active,
.modal-leave-active {
  animation: veil 0.28s ease-out;
}

.modal-leave-active {
  animation-direction: reverse;
}

@keyframes veil {
  from {
    opacity: 0;
  }
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

@include reduced-motion {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal__card,
  .modal-leave-active .modal__card {
    animation: none;
  }
}
</style>
