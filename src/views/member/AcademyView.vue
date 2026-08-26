<script setup lang="ts">
/**
 * La academia — lo que ve la alumna cuando entra.
 *
 * La administración ve exactamente esta misma pantalla, en modo vista previa:
 * si el panel mostrara una versión distinta, nadie se enteraría de que a la
 * alumna se le rompió algo. Por eso el único cambio es un aviso arriba y un
 * selector de reto, porque la cuenta de administración no compró ninguno.
 */
import { computed, ref, onMounted } from 'vue'
import CldImage from '@/components/ui/CldImage.vue'
import { useSessionStore } from '@/stores/session'
import { CHALLENGES } from '@/config/site'
import { MODULOS, MES_DE_ENTREGA, ETAPAS, SEMANAS, type Modulo } from '@/config/academy'

const session = useSessionStore()
const user = computed(() => session.user)
const esAdmin = computed(() => session.isAdmin)

/** La administración no compró reto: elige cuál quiere ver. */
const retoPreview = ref(CHALLENGES[0]!.name)

const reto = computed(() =>
  esAdmin.value ? retoPreview.value : user.value?.challenge || 'Tu reto',
)

const fin = computed(() => (user.value?.accessUntil ? new Date(user.value.accessUntil) : null))

/** El reto dura 3 meses: el inicio se deduce del final del acceso. */
const inicio = computed(() => {
  if (!fin.value) return null
  const d = new Date(fin.value)
  d.setMonth(d.getMonth() - 3)
  return d
})

/** Semana en curso, de 1 a 12. En vista previa se muestra la primera. */
const semana = computed(() => {
  if (esAdmin.value || !inicio.value) return 1
  const transcurridas = Math.floor((Date.now() - inicio.value.getTime()) / (7 * 86_400_000))
  return Math.min(Math.max(transcurridas + 1, 1), SEMANAS)
})

const mes = computed(() => Math.min(Math.ceil(semana.value / 4), 3))
const etapa = computed(() => ETAPAS.find((e) => e.mes === mes.value)!)
const avance = computed(() => Math.round((semana.value / SEMANAS) * 100))

const activo = computed(() => esAdmin.value || Boolean(user.value?.accessActive))

const fechaFin = computed(() =>
  fin.value
    ? fin.value.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
    : null,
)

const nombre = computed(() => user.value?.name?.split(' ')[0] || '')

/** Un recurso está abierto si ya llegó su mes y tiene enlace cargado. */
function disponible(entrega: keyof typeof MES_DE_ENTREGA, url: string | null) {
  return Boolean(url) && MES_DE_ENTREGA[entrega] <= mes.value
}

function estadoRecurso(entrega: keyof typeof MES_DE_ENTREGA, url: string | null) {
  if (MES_DE_ENTREGA[entrega] > mes.value) return `Se abre en el mes ${MES_DE_ENTREGA[entrega]}`
  return url ? 'Disponible' : 'Aún no cargado'
}

const abierto = ref<Modulo | null>(null)

function abrir(modulo: Modulo) {
  abierto.value = modulo
  document.body.style.overflow = 'hidden'
}

function cerrar() {
  abierto.value = null
  document.body.style.overflow = ''
}

onMounted(async () => {
  if (!session.user) await session.restore()
})
</script>

<template>
  <main class="academia">
    <!-- Vista previa: queda claro que no es la cuenta de una alumna -->
    <Transition name="aviso">
      <div v-if="esAdmin" class="preview">
        <div>
          <p class="preview__title">Estás viendo la academia como la ve una alumna</p>
          <p class="preview__text">
            Mismo contenido, mismo orden. Elige el reto para revisar cada versión.
          </p>
        </div>
        <label class="preview__pick">
          <span>Reto</span>
          <select v-model="retoPreview">
            <option v-for="c in CHALLENGES" :key="c.id" :value="c.name">{{ c.name }}</option>
          </select>
        </label>
      </div>
    </Transition>

    <header class="hola">
      <p class="hola__eyebrow">Método SK · Reto de 3 meses</p>
      <h1 class="hola__title">
        Hola<span v-if="nombre">, {{ nombre }}</span>
      </h1>
      <p class="hola__reto">{{ reto }}</p>
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
      <p class="rail__pct">{{ avance }}% del reto</p>
    </section>

    <section v-else class="cerrado">
      <p class="cerrado__badge">Sin acceso vigente</p>
      <p class="cerrado__text">
        Tu acceso terminó<span v-if="fechaFin"> el {{ fechaFin }}</span>. El material vuelve a
        abrirse cuando entres a un nuevo reto.
      </p>
      <a class="cerrado__cta" href="/#precio">Ver el reto</a>
    </section>

    <section class="modulos">
      <h2 class="modulos__title">Tu método, por dentro</h2>

      <article
        v-for="m in MODULOS"
        :key="m.id"
        class="modulo"
        :class="{ 'modulo--locked': !activo }"
      >
        <div class="modulo__foto">
          <CldImage
            :public-id="m.photo.id"
            :alt="m.photo.alt"
            ratio="4:3"
            sizes="(min-width: 900px) 300px, 100vw"
          />
        </div>

        <div class="modulo__body">
          <p class="modulo__eyebrow"><span class="modulo__num">{{ m.orden }}</span>{{ m.eyebrow }}</p>
          <h3 class="modulo__title">{{ m.title }}</h3>
          <p class="modulo__claim">{{ m.claim }}</p>
          <button type="button" class="modulo__cta" :disabled="!activo" @click="abrir(m)">
            Ver el módulo
          </button>
        </div>
      </article>
    </section>

    <!-- Detalle del módulo -->
    <Transition name="modal">
      <div v-if="abierto" class="modal" @click.self="cerrar">
        <div class="modal__card" role="dialog" aria-modal="true">
          <button type="button" class="modal__close" aria-label="Cerrar" @click="cerrar">×</button>

          <p class="modal__eyebrow">{{ abierto.orden }} · {{ abierto.eyebrow }}</p>
          <h3 class="modal__title">{{ abierto.title }}</h3>
          <p class="modal__text">{{ abierto.text }}</p>

          <ul class="modal__items">
            <li v-for="i in abierto.items" :key="i">{{ i }}</li>
          </ul>

          <h4 class="modal__sub">Material</h4>
          <ul class="recursos">
            <li v-for="r in abierto.recursos" :key="r.titulo" class="recurso">
              <span class="recurso__tipo">{{ r.tipo }}</span>
              <span class="recurso__titulo">{{ r.titulo }}</span>
              <a
                v-if="disponible(r.entrega, r.url)"
                class="recurso__link"
                :href="r.url!"
                target="_blank"
                rel="noopener"
              >Abrir</a>
              <span v-else class="recurso__estado">{{ estadoRecurso(r.entrega, r.url) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style lang="scss" scoped>
.academia {
  padding: clamp(1.5rem, 4vw, 3rem);
  padding-top: clamp(4.2rem, 8vw, 3rem);
  max-width: 1100px;
}

/* ── Vista previa de la administración ── */
.preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $space-sm;
  margin-bottom: $space-md;
  padding: 0.9rem 1.1rem;
  border: 1px dashed rgba($wine, 0.35);
  border-radius: $radius-md;
  background-color: rgba($rose-soft, 0.5);
}

.preview__title {
  font-size: $text-sm;
  font-weight: 600;
  color: $wine;
}

.preview__text {
  font-size: $text-xs;
  color: $ink-soft;
}

.preview__pick {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: $text-xs;
  color: $ink-muted;

  select {
    padding: 0.45rem 0.7rem;
    border: 1px solid rgba($ink, 0.18);
    border-radius: $radius-pill;
    background-color: $cream;
    font-family: inherit;
    font-size: $text-xs;
    color: $ink;
  }
}

/* ── Saludo ── */
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
  margin-top: 0.3rem;
  font-size: $text-base;
  color: $ink-soft;
}

/* ── Avance del reto ── */
.avance {
  padding: clamp(1.2rem, 3vw, 1.8rem);
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

.rail__pct {
  margin-top: 0.5rem;
  font-size: $text-xs;
  color: rgba($cream, 0.5);
}

/* ── Acceso terminado ── */
.cerrado {
  padding: clamp(1.2rem, 3vw, 1.8rem);
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

/* ── Módulos ── */
.modulos {
  margin-top: $space-lg;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.modulos__title {
  margin-bottom: 0.4rem;
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.modulo {
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;
  border-radius: $radius-lg;
  background-color: $cream;
  transition: transform 0.4s $ease, box-shadow 0.4s $ease;

  @include from('md') {
    grid-template-columns: 240px 1fr;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.modulo--locked {
  opacity: 0.55;

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
  gap: 0.35rem;
  padding: clamp(1.1rem, 3vw, 1.6rem);
}

.modulo__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  @include eyebrow;
  color: $ink-muted;
}

.modulo__num {
  font-family: $font-display;
  font-size: $text-base;
  font-style: italic;
  letter-spacing: 0;
  text-transform: none;
  color: $rose-deep;
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

.modulo__cta {
  margin-top: 0.5rem;
  padding: 0.55rem 1.1rem;
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
}

/* ── Detalle ── */
.modal {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba($ink, 0.55);
  backdrop-filter: blur(3px);
}

.modal__card {
  position: relative;
  width: min(560px, 100%);
  max-height: 86vh;
  overflow-y: auto;
  padding: clamp(1.4rem, 4vw, 2.2rem);
  border-radius: $radius-lg;
  background-color: $bone;
}

.modal__close {
  position: absolute;
  top: 0.8rem;
  right: 0.9rem;
  width: 32px;
  height: 32px;
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
  margin: 0.5rem 0 $space-sm;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

.modal__items {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: $space-md;
  list-style: none;

  li {
    position: relative;
    padding-left: 1.1rem;
    font-size: $text-sm;
    color: $ink;

    &::before {
      content: '';
      position: absolute;
      top: 0.55em;
      left: 0;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background-color: $rose;
    }
  }
}

.modal__sub {
  @include eyebrow;
  margin-bottom: 0.5rem;
  color: $ink-muted;
}

.recursos {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  list-style: none;
}

.recurso {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.8rem;
  border-radius: $radius-sm;
  background-color: $cream;
  font-size: $text-sm;
}

.recurso__tipo {
  flex: none;
  padding: 0.12rem 0.45rem;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.07);
  font-size: 0.66rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $ink-muted;
}

.recurso__titulo {
  flex: 1 1 auto;
  min-width: 0;
  color: $ink;
}

.recurso__estado {
  flex: none;
  font-size: $text-xs;
  color: $ink-muted;
}

.recurso__link {
  flex: none;
  font-size: $text-xs;
  color: $rose-deep;
  text-decoration: underline;
  text-underline-offset: 3px;
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
    transform: translateY(14px) scale(0.98);
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
