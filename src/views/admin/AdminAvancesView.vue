<script setup lang="ts">
/**
 * Avances — las fotos que suben las alumnas, por alumna.
 *
 * Hasta ahora las fotos se guardaban y el equipo no tenía dónde verlas. Arriba
 * va lo que espera una respuesta: alumnas que contestaron, y después las que
 * subieron fotos nuevas que nadie ha comentado.
 *
 * El modo discreto difumina las miniaturas: el panel se abre en un café o
 * compartiendo pantalla, y son fotos del cuerpo de otras personas.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import avancesService, { type ResumenAlumna } from '@/services/avancesService'
import '@/plugins/icons'

const alumnas = ref<ResumenAlumna[]>([])
const sinFotos = ref(0)
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')
const filtro = ref<'todas' | 'porComentar' | 'respuestas'>('todas')

const CLAVE_DISCRETO = 'admin:avances:discreto'
const discreto = ref(leerDiscreto())

function leerDiscreto() {
  try {
    return localStorage.getItem(CLAVE_DISCRETO) === '1'
  } catch {
    return false
  }
}

watch(discreto, (v) => {
  try {
    localStorage.setItem(CLAVE_DISCRETO, v ? '1' : '0')
  } catch {
    // Sin almacenamiento, el modo dura lo que dure la pestaña.
  }
})

const porComentar = computed(() => alumnas.value.filter((a) => a.porComentar).length)
const conRespuestas = computed(() => alumnas.value.filter((a) => a.respuestasNuevas).length)

const visibles = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  return alumnas.value.filter((a) => {
    if (filtro.value === 'porComentar' && !a.porComentar) return false
    if (filtro.value === 'respuestas' && !a.respuestasNuevas) return false
    if (!q) return true
    return a.nombre.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
  })
})

function cuando(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

function inicial(nombre: string) {
  return (nombre || '?')[0]!.toUpperCase()
}

onMounted(async () => {
  try {
    const data = await avancesService.alumnas()
    alumnas.value = data.alumnas
    sinFotos.value = data.sinFotos
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar los avances'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="avances">
    <header class="avances__head">
      <div>
        <p class="avances__eyebrow">Administración</p>
        <h1 class="avances__title">Avances</h1>
        <p class="avances__sub">
          Las fotos que suben tus alumnas. Entra a cada una para ver sus tomas y dejarle tu
          recomendación: le llega un aviso por correo.
        </p>
      </div>

      <button
        type="button"
        class="discreto"
        :class="{ 'discreto--on': discreto }"
        :aria-pressed="discreto"
        @click="discreto = !discreto"
      >
        <FaIcon :icon="discreto ? 'eye-slash' : 'eye'" />
        {{ discreto ? 'Modo discreto' : 'Fotos visibles' }}
      </button>
    </header>

    <div v-if="!cargando && !error" class="cifras">
      <button
        type="button"
        class="cifra"
        :class="{ 'cifra--on': filtro === 'todas' }"
        @click="filtro = 'todas'"
      >
        <strong>{{ alumnas.length }}</strong>
        <span>con fotos</span>
      </button>
      <button
        type="button"
        class="cifra cifra--acento"
        :class="{ 'cifra--on': filtro === 'porComentar' }"
        @click="filtro = filtro === 'porComentar' ? 'todas' : 'porComentar'"
      >
        <strong>{{ porComentar }}</strong>
        <span>por comentar</span>
      </button>
      <button
        type="button"
        class="cifra cifra--vino"
        :class="{ 'cifra--on': filtro === 'respuestas' }"
        @click="filtro = filtro === 'respuestas' ? 'todas' : 'respuestas'"
      >
        <strong>{{ conRespuestas }}</strong>
        <span>te respondieron</span>
      </button>
      <div class="cifra cifra--quieta">
        <strong>{{ sinFotos }}</strong>
        <span>con acceso y sin fotos todavía</span>
      </div>
    </div>

    <label v-if="alumnas.length" class="buscar">
      <FaIcon icon="magnifying-glass" />
      <input v-model="busqueda" type="search" placeholder="Buscar por nombre o correo" />
    </label>

    <p v-if="error" class="aviso aviso--error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>
    <p v-else-if="cargando" class="aviso"><FaIcon icon="spinner" spin /> Cargando…</p>
    <p v-else-if="!alumnas.length" class="aviso">
      <FaIcon icon="camera" /> Todavía ninguna alumna subió fotos.
    </p>
    <p v-else-if="!visibles.length" class="aviso">
      <FaIcon icon="check" /> Nada por acá. Al día.
    </p>

    <ul v-else class="rejilla" :class="{ 'rejilla--discreta': discreto }">
      <li v-for="(a, i) in visibles" :key="a.id" class="tarjeta" :style="{ '--i': Math.min(i, 12) }">
        <RouterLink :to="`/admin/avances/${a.id}`" class="tarjeta__link">
          <div class="tarjeta__foto">
            <img v-if="a.miniatura" :src="a.miniatura" :alt="`Foto de avance de ${a.nombre}`" loading="lazy" />
            <span v-else class="tarjeta__inicial">{{ inicial(a.nombre) }}</span>

            <span v-if="a.respuestasNuevas" class="sello sello--vino">
              <FaIcon icon="reply" /> {{ a.respuestasNuevas }}
              {{ a.respuestasNuevas === 1 ? 'respuesta' : 'respuestas' }}
            </span>
            <span v-else-if="a.porComentar" class="sello">
              <FaIcon icon="camera" /> Fotos nuevas
            </span>
            <span v-else class="sello sello--ok"><FaIcon icon="check" /> Comentada</span>
          </div>

          <div class="tarjeta__info">
            <p class="tarjeta__nombre">{{ a.nombre }}</p>
            <p class="tarjeta__meta">
              <span v-if="a.reto">{{ a.reto }}</span>
              <span>Día {{ a.diasDesdeInicio + 1 }}</span>
            </p>
            <p class="tarjeta__meta">
              <span><FaIcon icon="images" /> {{ a.tomas }} {{ a.tomas === 1 ? 'toma' : 'tomas' }}</span>
              <span>Última: {{ cuando(a.ultimaToma) }}</span>
            </p>
          </div>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.avances {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.avances__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-sm;
}

.avances__eyebrow {
  @include eyebrow;
}

.avances__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.avances__sub {
  max-width: 62ch;
  margin-top: 0.25rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.discreto {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba($ink, 0.2);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.28s $ease, color 0.28s $ease, border-color 0.28s $ease;

  &:hover {
    border-color: $ink;
  }

  @include focus-ring;
}

.discreto--on {
  border-color: $ink;
  background-color: $ink;
  color: $cream;
}

/* ── Cifras, que además filtran ── */
.cifras {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.6rem;
}

.cifra {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.95rem 1.1rem;
  border: 1px solid transparent;
  border-radius: $radius-md;
  background-color: $cream;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.28s $ease, transform 0.28s $ease;

  strong {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 400;
    color: $ink;
  }

  span {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &:hover {
    transform: translateY(-1px);
  }

  @include focus-ring;
}

.cifra--acento strong {
  color: $rose-deep;
}

.cifra--vino strong {
  color: $wine;
}

.cifra--on {
  border-color: $ink;
}

.cifra--quieta {
  cursor: default;
  background-color: transparent;
  border: 1px dashed rgba($ink, 0.15);

  &:hover {
    transform: none;
  }
}

.buscar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  max-width: 420px;
  padding: 0.65rem 1rem;
  border: 1px solid rgba($ink, 0.12);
  border-radius: $radius-pill;
  background-color: $cream;
  color: $ink-muted;
  transition: border-color 0.24s $ease;

  &:focus-within {
    border-color: $rose-deep;
  }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: $text-sm;
    color: $ink;

    &:focus {
      outline: none;
    }
  }
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

/* ── Rejilla de alumnas ── */
.rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.9rem;
  list-style: none;
}

.tarjeta {
  animation: entrar 0.45s $ease both;
  animation-delay: calc(var(--i, 0) * 40ms);
}

@keyframes entrar {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

@include reduced-motion {
  .tarjeta {
    animation: none;
  }
}

.tarjeta__link {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: $radius-md;
  background-color: $cream;
  color: inherit;
  box-shadow: $shadow-sm;
  transition: box-shadow 0.35s $ease, transform 0.35s $ease;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }

  &:hover img {
    transform: scale(1.03);
  }

  @include focus-ring;
}

.tarjeta__foto {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background-color: $sand;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s $ease, filter 0.35s $ease;
  }
}

.rejilla--discreta .tarjeta__foto img {
  filter: blur(18px) saturate(0.8);
}

.rejilla--discreta .tarjeta__link:hover img {
  filter: blur(18px) saturate(0.8);
  transform: scale(1.1);
}

.tarjeta__inicial {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: $font-display;
  font-size: 2.4rem;
  color: $ink-muted;
}

.sello {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  color: $rose-deep;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  box-shadow: $shadow-sm;
}

.sello--vino {
  background-color: $wine;
  color: $cream;
}

.sello--ok {
  background-color: rgba($cream, 0.9);
  color: #4a7a45;
}

.tarjeta__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.85rem 1rem 1rem;
}

.tarjeta__nombre {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tarjeta__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.7rem;
  font-size: $text-xs;
  color: $ink-muted;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
}
</style>
