<script setup lang="ts">
/**
 * El reto de la alumna: en qué semana va y qué le toca.
 *
 * Los cursos llegan del backend ya filtrados por su reto y por el bloque en
 * que está. Lo que todavía no se sube se muestra igual, marcado como
 * próximamente: la estructura ya se vendió, así que ocultarla la dejaría
 * creyendo que compró menos de lo que compró.
 *
 * Cada curso abre su propia página (ClaseView), no una ventana encima de esta.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import CldImage from '@/components/ui/CldImage.vue'
import MisRetos from '@/components/member/MisRetos.vue'
import CountdownCard from '@/components/member/CountdownCard.vue'
import type { CursoAlumna } from '@/services/courseService'
import perksService from '@/services/perksService'
import { useCursos, cuandoAbre } from '@/composables/useCursos'
import { useSessionStore } from '@/stores/session'
import { useVistaPrevia } from '@/composables/useVistaPrevia'
import { ETAPAS, SEMANAS } from '@/config/academy'

const session = useSessionStore()
const user = computed(() => session.user)
const esAdmin = computed(() => session.isAdmin)

const {
  visibles: cursosVisibles,
  avance,
  cargando,
  error,
  cargar,
  cargarAvance,
  avanceDe,
} = useCursos()

/**
 * Cuándo abre, del servidor. Acá se ven los cursos con candado, así que la
 * fecha tiene que estar en la misma pantalla. Si la llamada falla, el
 * contador usa la de configuración; por eso el error se traga.
 */
const apertura = ref<string | null>(null)
perksService
  .beneficios()
  .then((b) => (apertura.value = b.apertura))
  .catch(() => {})

/* Lo calcula el backend y no cada pantalla: si la barra del curso y la del
   método se computaran por separado, acabarían diciendo cosas distintas. */
const porcentajeMetodo = computed(() => avance.value?.porcentajeTotal ?? 0)

/** La cuenta de administración no compró reto: el reto y la semana los elige en la franja. */
const vista = useVistaPrevia()

const fin = computed(() => (user.value?.accessUntil ? new Date(user.value.accessUntil) : null))

/** El reto dura 3 meses: el inicio se deduce del final del acceso. */
const inicio = computed(() => {
  if (!fin.value) return null
  const d = new Date(fin.value)
  d.setMonth(d.getMonth() - 3)
  return d
})

const semana = computed(() => {
  if (esAdmin.value) return vista.semana.value
  if (!inicio.value) return 1
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

/**
 * Cuándo hay que decir a qué reto pertenece cada curso.
 *
 * Solo cuando de verdad se ve material de los dos. En administración ya no
 * pasa: la lista queda filtrada por el reto de la vista previa.
 */
const variosRetos = computed(() => {
  if (esAdmin.value) return false
  return (user.value?.challenges?.length ?? 0) > 1
})

const ETIQUETA: Record<CursoAlumna['estado'], string> = {
  abierto: 'Disponible',
  proximamente: 'Próximamente',
  cerrado: 'Se abre más adelante',
}

/**
 * El bloque N se abre en la semana (N - 1) * 4 + 1, contada desde su compra:
 * el bloque 2 en la semana 5. Se dice en semanas y no en meses porque es como
 * ella cuenta su reto (la barra de arriba va por semanas).
 */
function semanaDeApertura(curso: CursoAlumna) {
  return (curso.unlockMonth - 1) * 4 + 1
}

function etiqueta(curso: CursoAlumna) {
  if (curso.estado === 'cerrado') return `Se abre en tu semana ${semanaDeApertura(curso)}`
  return ETIQUETA[curso.estado]
}

/**
 * Al volver a la pestaña, se vuelven a pedir los cursos.
 *
 * Quien dejaba la app abierta seguía viendo el material viejo cuando
 * publicábamos algo: pasó el día que subimos los entrenamientos y en el grupo
 * decían que no les aparecía.
 */
function alVolver() {
  if (document.visibilityState === 'visible') {
    cargar(true)
    cargarAvance()
  }
}

onMounted(async () => {
  if (!session.user) await session.restore()
  // Siempre se piden al entrar: puede venir de una clase donde marcó avance.
  await Promise.all([cargar(cursosVisibles.value.length > 0), cargarAvance()])
  document.addEventListener('visibilitychange', alVolver)
})

onBeforeUnmount(() => document.removeEventListener('visibilitychange', alVolver))
</script>

<template>
  <div class="academia">
    <header class="hola">
      <template v-if="esAdmin">
        <p class="hola__eyebrow">Vista previa · {{ vista.reto.value }}</p>
        <h1 class="hola__title">Así ve su reto una alumna</h1>
        <p class="hola__nota">
          Es su semana {{ vista.semana.value }}. Cambia el reto o la semana en la franja de arriba.
        </p>
      </template>
      <template v-else>
        <p class="hola__eyebrow">Método SK · Reto de 3 meses</p>
        <h1 class="hola__title">
          Hola<span v-if="nombre">, {{ nombre }}</span>
        </h1>
      </template>
    </header>

    <!-- Cuándo abre, junto a los candados que lo hacen preguntar -->
    <CountdownCard :apertura="apertura" compacto class="bloque-cuenta" />

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
        <!-- El avance es de la cuenta que mira: en administración no dice nada. -->
        <p v-if="!esAdmin" class="rail__pct rail__pct--metodo">
          {{ porcentajeMetodo }}% del método visto
        </p>
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

    <MisRetos :preview="esAdmin ? vista.reto.value : null" class="bloque-retos" />

    <section class="modulos">
      <h2 class="modulos__title">
        {{ variosRetos ? 'El material de tus retos' : 'Tu método, por dentro' }}
      </h2>

      <p v-if="error" class="aviso aviso--error">{{ error }}</p>
      <p v-else-if="cargando" class="aviso">Cargando tu reto…</p>
      <p v-else-if="!cursosVisibles.length" class="aviso">
        Todavía no hay cursos publicados. Te avisamos por correo apenas se abra el primero.
      </p>

      <article
        v-for="(c, i) in cursosVisibles"
        :key="c.id"
        class="modulo"
        :class="{ 'modulo--locked': c.estado !== 'abierto' }"
      >
        <div v-if="c.coverPhoto" class="modulo__foto">
          <!--
            Hay dos cuentas de Cloudinary: la del shoot, que resuelve CldImage
            por id, y la de las alumnas, de donde salen las fotos subidas
            después. Por eso una portada puede venir como URL completa.
          -->
          <img
            v-if="c.coverPhoto.startsWith('http')"
            :src="c.coverPhoto"
            :alt="c.title"
            loading="lazy"
          />
          <CldImage
            v-else
            :public-id="c.coverPhoto"
            :alt="c.title"
            ratio="4:3"
            sizes="(min-width: 900px) 260px, 100vw"
          />
        </div>

        <div class="modulo__body">
          <!--
            El número sale de la posición en la lista, no del orden guardado:
            así siempre va 01, 02, 03 seguidos. Con el orden guardado salían
            dos "01" —uno por reto— y saltos donde faltaba un curso.
          -->
          <p class="modulo__eyebrow">
            <span class="modulo__num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span v-if="c.estado !== 'abierto'" class="modulo__estado">{{ etiqueta(c) }}</span>
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
          <!-- Una puerta lleva a su pantalla; no abre una ventana con video. -->
          <RouterLink v-if="c.enlace" :to="c.enlace" class="modulo__cta">
            Ir a la comunidad
          </RouterLink>

          <RouterLink
            v-else-if="c.estado === 'abierto'"
            :to="`/academia/${c.slug}`"
            class="modulo__cta"
          >
            Entrar al curso
          </RouterLink>

          <!--
            Un botón muerto que dice "Aún no disponible" no responde lo único
            que ella quiere saber: cuándo. Con fecha se lo decimos; sin fecha,
            al menos no simulamos un botón.
          -->
          <p v-else-if="!c.enlace" class="modulo__espera">
            <FaIcon icon="lock" />
            {{ cuandoAbre(c) }}
          </p>
        </div>
      </article>
    </section>

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

.hola__nota {
  margin-top: 0.45rem;
  font-size: $text-sm;
  color: $ink-muted;
}

.bloque-cuenta {
  margin-bottom: $space-sm;
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

.modulo__espera {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.9rem;
  font-size: $text-xs;
  color: $ink-muted;

  svg {
    font-size: 0.85em;
  }
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
</style>
