<script setup lang="ts">
/**
 * La ficha de avance de una alumna: sus tomas, su antes y después, sus
 * medidas y la conversación con el equipo.
 *
 * Las fotos van a la izquierda y la conversación a la derecha, fija, para
 * poder escribir la recomendación mirando la foto a la vez, sin subir y bajar.
 *
 * Cada comentario sale firmado por Karen, Scarlett o el equipo: el panel se
 * usa desde una sola cuenta, y la firma no se puede deducir de quién inició
 * sesión. La última firma usada se recuerda en este navegador.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import avancesService, {
  FIRMAS,
  type FichaAlumna,
  type Firma,
  type Nota,
} from '@/services/avancesService'
import { CAMPOS_MEDIDA, ETIQUETA_ANGULO } from '@/services/onboardingService'
import BeforeAfter from '@/components/progress/BeforeAfter.vue'
import HiloNotas from '@/components/progress/HiloNotas.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { useBodyScrollLock } from '@/composables/useBodyScroll'
import '@/plugins/icons'

const route = useRoute()
const ficha = ref<FichaAlumna | null>(null)
const cargando = ref(true)
const error = ref('')

const pila = computed(() => ficha.value?.alumna.nombre.split(/\s+/)[0] ?? '')

/* ── Firma recordada ── */
const CLAVE_FIRMA = 'admin:avances:firma'
const firma = ref<Firma>(leerFirma())

function leerFirma(): Firma {
  try {
    const guardada = localStorage.getItem(CLAVE_FIRMA)
    if (guardada && guardada in FIRMAS) return guardada as Firma
  } catch {
    // Sin almacenamiento se empieza por Karen, que es quien más revisa.
  }
  return 'karen'
}

watch(firma, (v) => {
  try {
    localStorage.setItem(CLAVE_FIRMA, v)
  } catch {
    // No pasa nada: se vuelve a elegir la próxima vez.
  }
})

/* ── Redactar ── */
const texto = ref('')
const tomaDel = ref<string | null>(null)
const enviando = ref(false)
const confirmacion = ref('')
const errorEnvio = ref('')

async function enviar() {
  const f = ficha.value
  const body = texto.value.trim()
  if (!f || !body || enviando.value) return
  enviando.value = true
  errorEnvio.value = ''
  confirmacion.value = ''
  try {
    const data = await avancesService.comentar(f.alumna.id, { body, firma: firma.value, tomaDel: tomaDel.value })
    f.notas = data.notas
    texto.value = ''
    const ultima = data.notas[data.notas.length - 1]
    confirmacion.value = ultima?.avisoEnviadoEl
      ? `Listo. ${pila.value} ya tiene el aviso en su correo.`
      : 'Guardado. El correo no salió ahora; se reintenta solo en la próxima hora.'
  } catch (e: unknown) {
    errorEnvio.value = (e as { message?: string }).message ?? 'No pudimos enviarlo'
  } finally {
    enviando.value = false
  }
}

/* ── Quitar un comentario ── */
const porQuitar = ref<Nota | null>(null)
const quitando = ref(false)

async function quitar() {
  const n = porQuitar.value
  if (!n || !ficha.value) return
  quitando.value = true
  try {
    await avancesService.borrarNota(n.id)
    ficha.value.notas = ficha.value.notas.filter((x) => x.id !== n.id)
    porQuitar.value = null
  } catch {
    errorEnvio.value = 'No pudimos quitarlo'
  } finally {
    quitando.value = false
  }
}

/* ── Ver una foto en grande ── */
const ampliada = ref<{ url: string; titulo: string } | null>(null)
useBodyScrollLock(computed(() => Boolean(ampliada.value)))

function cerrarConEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') ampliada.value = null
}

/* ── Formatos ── */
function fechaLarga(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

/** "Día 15": cuántos días lleva desde su primera foto hasta esta toma. */
function diaDelReto(iso: string) {
  const tomas = ficha.value?.tomas ?? []
  const primera = tomas[tomas.length - 1]
  if (!primera) return 1
  return Math.round((new Date(iso).getTime() - new Date(primera.fecha).getTime()) / 86_400_000) + 1
}

function valor(n: number | null, unidad: string) {
  return n === null ? '—' : `${n} ${unidad}`
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    ficha.value = await avancesService.ficha(String(route.params.id))
    tomaDel.value = ficha.value.tomas[0]?.fecha ?? null
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar su avance'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargar()
  window.addEventListener('keydown', cerrarConEscape)
})
onBeforeUnmount(() => window.removeEventListener('keydown', cerrarConEscape))
</script>

<template>
  <div class="ficha">
    <RouterLink to="/admin/avances" class="volver"><FaIcon icon="arrow-left" /> Avances</RouterLink>

    <p v-if="error" class="aviso aviso--error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>
    <p v-else-if="cargando" class="aviso"><FaIcon icon="spinner" spin /> Cargando…</p>

    <template v-else-if="ficha">
      <header class="ficha__head">
        <p class="ficha__eyebrow"><FaIcon icon="lock" /> Privado · solo el equipo</p>
        <h1 class="ficha__title">{{ ficha.alumna.nombre }}</h1>
        <p class="ficha__meta">
          <span>{{ ficha.alumna.email }}</span>
          <span v-if="ficha.alumna.reto">{{ ficha.alumna.reto }}</span>
          <span v-if="ficha.alumna.accessUntil">Acceso hasta el {{ fechaLarga(ficha.alumna.accessUntil) }}</span>
        </p>
      </header>

      <div class="columnas">
        <!-- ── Sus fotos ── -->
        <div class="columna">
          <section class="panel">
            <h2 class="panel__title"><FaIcon icon="camera" /> Sus tomas</h2>
            <p v-if="!ficha.fotosDisponibles" class="aviso">
              Falta configurar Cloudinary: las fotos no se pueden mostrar.
            </p>

            <ol class="tomas">
              <li v-for="(t, i) in ficha.tomas" :key="t.dia" class="toma">
                <header class="toma__head">
                  <span class="toma__dia">Día {{ diaDelReto(t.fecha) }}</span>
                  <span class="toma__fecha">{{ fechaLarga(t.fecha) }}</span>
                  <span v-if="i === 0" class="toma__chip">La más reciente</span>
                  <span v-if="i === ficha.tomas.length - 1 && ficha.tomas.length > 1" class="toma__chip toma__chip--suave">
                    Primera
                  </span>
                </header>
                <div class="toma__fotos">
                  <button
                    v-for="f in t.fotos"
                    :key="f.createdAt"
                    type="button"
                    class="foto"
                    @click="ampliada = { url: f.grande, titulo: `${ETIQUETA_ANGULO[f.angulo]} · ${fechaLarga(f.createdAt)}` }"
                  >
                    <img :src="f.url" :alt="`${ETIQUETA_ANGULO[f.angulo]}, ${fechaLarga(f.createdAt)}`" loading="lazy" />
                    <span class="foto__angulo">{{ ETIQUETA_ANGULO[f.angulo] }}</span>
                    <span class="foto__ampliar" aria-hidden="true"><FaIcon icon="expand" /></span>
                  </button>
                </div>
              </li>
            </ol>
          </section>

          <BeforeAfter :comparativa="ficha.comparativa" de-admin />

          <section v-if="ficha.medidas.length" class="panel">
            <h2 class="panel__title"><FaIcon icon="ruler-combined" /> Sus medidas</h2>
            <div class="tabla-marco">
              <table class="tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th v-for="c in CAMPOS_MEDIDA" :key="c.clave">{{ c.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in ficha.medidas" :key="m.createdAt">
                    <td>{{ fechaCorta(m.createdAt) }}</td>
                    <td v-for="c in CAMPOS_MEDIDA" :key="c.clave">{{ valor(m[c.clave], c.unidad) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul class="notas-medidas">
              <li v-for="m in ficha.medidas.filter((x) => x.nota)" :key="m.createdAt">
                <strong>{{ fechaCorta(m.createdAt) }}:</strong> {{ m.nota }}
              </li>
            </ul>
          </section>
        </div>

        <!-- ── La conversación ── -->
        <aside class="columna columna--hilo">
          <section class="panel panel--hilo">
            <h2 class="panel__title"><FaIcon icon="comments" /> Conversación con {{ pila }}</h2>

            <HiloNotas v-if="ficha.notas.length" :notas="ficha.notas" lado="equipo" @borrar="porQuitar = $event" />
            <p v-else class="vacio">
              Todavía nadie le escribió. Tu primer comentario le llega con un aviso por correo que la
              trae directo a leerlo.
            </p>

            <form class="redactar" @submit.prevent="enviar">
              <fieldset class="firmas">
                <legend>Firma</legend>
                <label
                  v-for="(f, clave) in FIRMAS"
                  :key="clave"
                  class="firma-op"
                  :class="{ 'firma-op--on': firma === clave }"
                >
                  <input v-model="firma" type="radio" name="firma" :value="clave" />
                  <span class="firma-op__inicial" :class="{ 'firma-op__inicial--larga': f.inicial.length > 1 }">
                    {{ f.inicial }}
                  </span>
                  <span class="firma-op__texto">
                    <strong>{{ clave === 'equipo' ? 'Equipo SK' : f.nombre.split(' ')[0] }}</strong>
                    <span>{{ f.rol }}</span>
                  </span>
                </label>
              </fieldset>

              <label v-if="ficha.tomas.length" class="campo">
                <span>Sobre la toma</span>
                <select v-model="tomaDel">
                  <option v-for="t in ficha.tomas" :key="t.dia" :value="t.fecha">
                    Día {{ diaDelReto(t.fecha) }} · {{ fechaLarga(t.fecha) }}
                  </option>
                  <option :value="null">General, sin una toma en particular</option>
                </select>
              </label>

              <label class="campo">
                <span class="sr-only">Tu recomendación</span>
                <textarea
                  v-model="texto"
                  rows="5"
                  maxlength="3000"
                  :placeholder="`Escribe tu recomendación para ${pila}…`"
                  @keydown.meta.enter="enviar"
                  @keydown.ctrl.enter="enviar"
                />
              </label>

              <button type="submit" class="enviar" :disabled="!texto.trim() || enviando">
                <FaIcon :icon="enviando ? 'spinner' : 'paper-plane'" :spin="enviando" />
                Enviar y avisarle por correo
              </button>
              <p class="redactar__nota">
                <FaIcon icon="lock" /> El correo solo le avisa: el mensaje y sus fotos se leen
                dentro de su cuenta.
              </p>

              <p v-if="confirmacion" class="ok"><FaIcon icon="check" /> {{ confirmacion }}</p>
              <p v-if="errorEnvio" class="mal"><FaIcon icon="triangle-exclamation" /> {{ errorEnvio }}</p>
            </form>
          </section>
        </aside>
      </div>
    </template>

    <ConfirmModal
      :open="Boolean(porQuitar)"
      title="¿Quitar este comentario?"
      message="Deja de verse en su cuenta. Si ya le llegó el correo, el aviso no se puede recoger: al entrar, simplemente no lo va a encontrar."
      confirm-label="Quitar el comentario"
      cancel-label="Dejarlo"
      danger
      :loading="quitando"
      @confirm="quitar"
      @cancel="porQuitar = null"
    />

    <Transition name="lupa">
      <div v-if="ampliada" class="lupa" role="dialog" aria-modal="true" :aria-label="ampliada.titulo" @click="ampliada = null">
        <img :src="ampliada.url" :alt="ampliada.titulo" @click.stop />
        <p class="lupa__titulo">{{ ampliada.titulo }}</p>
        <button type="button" class="lupa__cerrar" aria-label="Cerrar" @click="ampliada = null">
          <FaIcon icon="xmark" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.ficha {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.volver {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  align-self: flex-start;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: $ink-muted;
  transition: color 0.24s $ease;

  &:hover {
    color: $ink;
  }
}

.ficha__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  @include eyebrow;
}

.ficha__title {
  margin-top: 0.2rem;
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.ficha__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1.1rem;
  margin-top: 0.4rem;
  font-size: $text-xs;
  color: $ink-muted;
}

.aviso {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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

/* ── Dos columnas: fotos y conversación ── */
.columnas {
  display: grid;
  gap: $space-sm;
  align-items: start;

  @include from('lg') {
    grid-template-columns: minmax(0, 1.35fr) minmax(340px, 1fr);
  }
}

.columna {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  min-width: 0;
}

.columna--hilo {
  @include from('lg') {
    position: sticky;
    top: 5rem;
    max-height: calc(100vh - 6rem);
    overflow-y: auto;
    border-radius: $radius-lg;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: clamp(1.1rem, 3vw, 1.6rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.panel__title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: $font-display;
  font-size: $text-lg;
  font-weight: 400;
  color: $ink;

  svg {
    font-size: 0.8em;
    color: $rose-deep;
  }
}

/* ── Tomas ── */
.tomas {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  list-style: none;
}

.toma__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem 0.8rem;
  margin-bottom: 0.6rem;
}

.toma__dia {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.toma__fecha {
  font-size: $text-xs;
  color: $ink-muted;
}

.toma__chip {
  padding: 0.12rem 0.6rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  color: $rose-deep;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.toma__chip--suave {
  background-color: $sand;
  color: $ink-muted;
}

.toma__fotos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.6rem;
}

.foto {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  padding: 0;
  border: none;
  border-radius: $radius-md;
  background-color: $sand;
  cursor: zoom-in;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s $ease;
  }

  &:hover img {
    transform: scale(1.04);
  }

  &:hover .foto__ampliar {
    opacity: 1;
  }

  @include focus-ring;
}

.foto__angulo {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  padding: 0.18rem 0.6rem;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.65);
  backdrop-filter: blur(6px);
  color: $cream;
  font-size: 0.68rem;
  font-weight: 600;
}

.foto__ampliar {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba($cream, 0.9);
  color: $ink;
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity 0.28s $ease;
}

/* ── Medidas ── */
.tabla-marco {
  overflow-x: auto;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: $text-xs;
  white-space: nowrap;

  th {
    padding: 0.5rem 0.7rem;
    border-bottom: 1px solid rgba($ink, 0.1);
    color: $ink-muted;
    font-weight: 600;
    text-align: left;
  }

  td {
    padding: 0.55rem 0.7rem;
    border-bottom: 1px solid rgba($ink, 0.05);
    color: $ink-soft;
    font-variant-numeric: tabular-nums;
  }

  td:first-child {
    color: $ink;
    font-weight: 600;
  }
}

.notas-medidas {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  list-style: none;
  font-size: $text-xs;
  color: $ink-soft;
}

/* ── Conversación ── */
.vacio {
  padding: 1rem 1.1rem;
  border: 1px dashed rgba($ink, 0.15);
  border-radius: $radius-md;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-muted;
}

.redactar {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-top: $space-sm;
  border-top: 1px solid rgba($ink, 0.08);
}

.firmas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.45rem;
  border: none;

  legend {
    margin-bottom: 0.45rem;
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-muted;
  }
}

.firma-op {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.6rem;
  border: 1px solid rgba($ink, 0.12);
  border-radius: $radius-sm;
  cursor: pointer;
  transition: border-color 0.24s $ease, background-color 0.24s $ease;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &:hover {
    border-color: rgba($ink, 0.35);
  }

  &:has(input:focus-visible) {
    outline: 2px solid $rose-deep;
    outline-offset: 2px;
  }
}

.firma-op--on {
  border-color: $ink;
  background-color: rgba($rose-soft, 0.5);
}

.firma-op__inicial {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: $sand;
  color: $ink;
  font-family: $font-display;
  font-size: 0.85rem;
  font-style: italic;
  transition: background-color 0.24s $ease, color 0.24s $ease;
}

.firma-op__inicial--larga {
  font-size: 0.62rem;
}

.firma-op--on .firma-op__inicial {
  background-color: $ink;
  color: $rose-soft;
}

.firma-op__texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: $text-xs;
  line-height: 1.25;

  strong {
    color: $ink;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: $ink-muted;
    font-size: 0.66rem;
  }
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-muted;

  select,
  textarea {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 1px solid rgba($ink, 0.15);
    border-radius: $radius-sm;
    background-color: $bone;
    font-family: inherit;
    font-size: $text-sm;
    font-weight: 400;
    color: $ink;
    transition: border-color 0.24s $ease;

    &:focus {
      outline: none;
      border-color: $rose-deep;
    }
  }

  textarea {
    line-height: 1.55;
    resize: vertical;
  }
}

.enviar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.9rem 1.3rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  color: $cream;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background-color 0.28s $ease, opacity 0.28s $ease;

  &:hover:not(:disabled) {
    background-color: $wine;
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }

  @include focus-ring;
}

.redactar__nota {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-muted;

  svg {
    margin-top: 0.2em;
  }
}

.ok,
.mal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  border-radius: $radius-sm;
  font-size: $text-sm;
}

.ok {
  background-color: $alert-success-bg;
  color: #4a7a45;
}

.mal {
  background-color: $alert-error-bg;
  color: $alert-error;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ── Foto en grande ── */
.lupa {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1.5rem;
  background-color: rgba($ink, 0.88);
  backdrop-filter: blur(6px);
  cursor: zoom-out;

  img {
    max-width: 100%;
    max-height: calc(100vh - 6rem);
    border-radius: $radius-md;
    object-fit: contain;
    cursor: default;
  }
}

.lupa__titulo {
  font-size: $text-sm;
  color: rgba($cream, 0.8);
}

.lupa__cerrar {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background-color: rgba($cream, 0.12);
  color: $cream;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: rgba($cream, 0.22);
  }

  @include focus-ring($cream);
}

.lupa-enter-active,
.lupa-leave-active {
  transition: opacity 0.3s $ease;
}

.lupa-enter-from,
.lupa-leave-to {
  opacity: 0;
}
</style>
