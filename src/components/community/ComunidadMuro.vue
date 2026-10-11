<script setup lang="ts">
/**
 * El muro: lo más nuevo arriba, con filtros por tipo.
 *
 * Antes era un chat —lo nuevo abajo, en una caja con scroll propio—, que sirve
 * para conversar pero esconde un logro con foto entre mensajes sueltos. Como
 * muro, cada publicación tiene su espacio y sus reacciones.
 *
 * Se refresca solo cada veinte segundos (la primera página entera, para que
 * también se muevan las reacciones), y "Ver anteriores" trae la página previa.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import communityService, {
  type MensajeComunidad,
  type TipoPost,
} from '@/services/communityService'
import { COMUNIDAD, TIPOS } from '@/config/comunidad'
import ComunidadPost from './ComunidadPost.vue'

const emit = defineEmits<{ cambio: [] }>()

const posts = ref<MensajeComunidad[]>([])
const filtro = ref<TipoPost | null>(null)
const cargando = ref(true)
const cargandoMas = ref(false)
const hayMas = ref(false)
const error = ref('')

const REFRESCO_MS = 20_000
let reloj: ReturnType<typeof setInterval> | null = null

const FILTROS = computed(() => [
  { id: null, nombre: 'Todo', emoji: '✨' },
  ...TIPOS.map((t) => ({ id: t.id, nombre: t.nombre, emoji: t.emoji })),
])

/** El API entrega del más viejo al más nuevo; el muro va al revés. */
const nuevosPrimero = (lista: MensajeComunidad[]) => [...lista].reverse()

async function cargar() {
  error.value = ''
  try {
    const r = await communityService.listar({ tipo: filtro.value })
    posts.value = nuevosPrimero(r.mensajes)
    hayMas.value = r.hayMas
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar la comunidad'
  } finally {
    cargando.value = false
  }
}

/** Refresca la primera página sin perder las anteriores que ya abrió. */
async function refrescar() {
  if (document.visibilityState !== 'visible') return
  try {
    const r = await communityService.listar({ tipo: filtro.value })
    const frescos = nuevosPrimero(r.mensajes)
    const ids = new Set(frescos.map((p) => p.id))
    const masViejo = frescos[frescos.length - 1]?.createdAt ?? ''
    posts.value = [...frescos, ...posts.value.filter((p) => !ids.has(p.id) && p.createdAt < masViejo)]
  } catch {
    // Un refresco que falla no dice nada: el siguiente lo intenta otra vez.
  }
}

async function verAnteriores() {
  const ultimo = posts.value[posts.value.length - 1]
  if (!ultimo || cargandoMas.value) return
  cargandoMas.value = true
  try {
    const r = await communityService.listar({ tipo: filtro.value, antes: ultimo.createdAt })
    posts.value.push(...nuevosPrimero(r.mensajes))
    hayMas.value = r.hayMas
  } catch {
    error.value = 'No pudimos traer las anteriores'
  } finally {
    cargandoMas.value = false
  }
}

function actualizar(post: MensajeComunidad) {
  const i = posts.value.findIndex((p) => p.id === post.id)
  if (i >= 0) posts.value[i] = post
  emit('cambio')
}

async function borrar(id: string) {
  try {
    await communityService.borrar(id)
    posts.value = posts.value.filter((p) => p.id !== id)
    emit('cambio')
  } catch {
    error.value = 'No pudimos borrarlo'
  }
}

/** Lo publica la vista, desde el compositor: entra arriba sin esperar el refresco. */
function agregar(post: MensajeComunidad) {
  if (!filtro.value || filtro.value === post.tipo) posts.value.unshift(post)
}

defineExpose({ agregar })

watch(filtro, () => {
  cargando.value = true
  cargar()
})

onMounted(async () => {
  await cargar()
  reloj = setInterval(refrescar, REFRESCO_MS)
})

onUnmounted(() => {
  if (reloj) clearInterval(reloj)
})
</script>

<template>
  <section class="muro">
    <div class="filtros" role="tablist" aria-label="Filtrar publicaciones">
      <button
        v-for="f in FILTROS"
        :key="f.nombre"
        type="button"
        role="tab"
        class="filtro"
        :class="{ 'filtro--activo': filtro === f.id }"
        :aria-selected="filtro === f.id"
        @click="filtro = f.id"
      >
        <span aria-hidden="true">{{ f.emoji }}</span> {{ f.nombre }}
      </button>
    </div>

    <p v-if="cargando" class="estado"><FaIcon icon="spinner" spin /> Cargando la comunidad…</p>
    <p v-else-if="error && !posts.length" class="estado estado--mal">{{ error }}</p>

    <div v-else-if="!posts.length" class="vacio">
      <span class="vacio__icono">🏆</span>
      <p class="vacio__title">{{ filtro ? 'Todavía no hay publicaciones de este tipo' : COMUNIDAD.vacio.titulo }}</p>
      <p class="vacio__texto">{{ COMUNIDAD.vacio.texto }}</p>
    </div>

    <TransitionGroup v-else name="entra" tag="div" class="lista">
      <ComunidadPost
        v-for="p in posts"
        :key="p.id"
        :post="p"
        @actualizado="actualizar"
        @borrar="borrar"
      />
    </TransitionGroup>

    <button v-if="hayMas && posts.length" type="button" class="mas" :disabled="cargandoMas" @click="verAnteriores">
      <FaIcon v-if="cargandoMas" icon="spinner" spin />
      <template v-else>Ver publicaciones anteriores</template>
    </button>
  </section>
</template>

<style lang="scss" scoped>
.muro {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.filtros {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filtro {
  flex: none;
  padding: 0.45rem 0.9rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-soft;
  cursor: pointer;
  transition: background-color 0.2s $ease, color 0.2s $ease;

  &:hover {
    background-color: $sand;
  }

  @include focus-ring;
}

.filtro--activo {
  background-color: $wine;
  color: $cream;

  &:hover {
    background-color: $wine;
  }
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.estado {
  padding: 1.5rem 0;
  font-size: $text-sm;
  text-align: center;
  color: $ink-muted;
}

.estado--mal {
  color: $wine;
}

.vacio {
  padding: 2rem 1.2rem;
  border: 1.5px dashed $sand;
  border-radius: $radius-lg;
  text-align: center;
}

.vacio__icono {
  font-size: 2rem;
}

.vacio__title {
  margin-top: 0.4rem;
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.vacio__texto {
  max-width: 40ch;
  margin: 0.3rem auto 0;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.mas {
  align-self: center;
  padding: 0.6rem 1.2rem;
  border: 1px solid $sand;
  border-radius: $radius-pill;
  background-color: $white;
  font-family: inherit;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: $cream;
  }

  @include focus-ring;
}

.entra-enter-active {
  transition: opacity 0.35s $ease, transform 0.35s $ease;
}

.entra-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

@include reduced-motion {
  .entra-enter-active {
    transition: none;
  }
}
</style>
