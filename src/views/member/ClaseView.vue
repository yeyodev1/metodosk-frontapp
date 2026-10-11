<script setup lang="ts">
/**
 * Una clase, en su propia página: el video grande y la lista al lado.
 *
 * Antes cada curso se abría en una ventana encima de Mi reto: el video quedaba
 * chico, no había dónde comentar y el atrás del teléfono sacaba de la app en
 * vez de volver. Acá el video ocupa la pantalla, la lista del curso queda a la
 * mano como en YouTube y cada clase tiene su enlace.
 *
 * Sin clase en la URL se entra a la primera que le falta ver: es lo que busca
 * quien toca "Entrar al curso".
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import VideoPlayer from '@/components/ui/video/VideoPlayer.vue'
import CommentThread from '@/components/ui/CommentThread.vue'
import ClaseLista, { type ItemClase } from '@/components/member/ClaseLista.vue'
import ClaseInfo from '@/components/member/ClaseInfo.vue'
import progressService from '@/services/progressService'
import { useVideoProgress } from '@/composables/useVideoProgress'
import { useCursos, cuandoAbre } from '@/composables/useCursos'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const { visibles, cargando, error, asegurar, cargar, cargarAvance } = useCursos()
const { terminado, seguir, soltar, reportar, terminar, enlazar } = useVideoProgress()

const curso = computed(() => visibles.value.find((c) => c.slug === route.params.slug) ?? null)

/** La bienvenida del curso va primero, como una clase más. */
const items = computed<ItemClase[]>(() => {
  const c = curso.value
  if (!c) return []
  const lista: ItemClase[] = []
  if (c.welcomeVideo) {
    lista.push({
      id: 'welcome',
      ruta: 'bienvenida',
      title: 'Bienvenida',
      summary: c.summary || null,
      embedUrl: c.welcomeVideo.embedUrl,
      hlsUrl: c.welcomeVideo.hlsUrl ?? null,
      thumbnail: c.welcomeVideo.thumbnail,
      durationSeconds: null,
      seconds: c.welcomeVideo.seconds ?? 0,
      completed: c.welcomeVideo.completed,
    })
  }
  for (const l of c.lessons) {
    lista.push({
      id: l.id,
      ruta: l.id,
      title: l.title,
      summary: l.summary,
      embedUrl: l.embedUrl,
      hlsUrl: l.hlsUrl ?? null,
      thumbnail: l.thumbnail ?? null,
      durationSeconds: l.durationSeconds,
      seconds: l.seconds,
      completed: l.completed,
    })
  }
  return lista
})

const actual = computed(() => items.value.find((i) => i.ruta === route.params.clase) ?? null)
const posicion = computed(() => (actual.value ? items.value.indexOf(actual.value) + 1 : 0))
const siguiente = computed(() =>
  items.value.slice(posicion.value).find((i) => i.embedUrl) ?? null,
)
const vistas = computed(() => items.value.filter((i) => i.completed).length)

/** Sin clase en la URL: la primera que le falta, o la primera si ya vio todas. */
watch(
  [curso, () => route.params.clase],
  () => {
    if (!curso.value || curso.value.estado !== 'abierto') return
    if (route.params.clase && actual.value) return
    const destino =
      items.value.find((i) => i.embedUrl && !i.completed) ?? items.value.find((i) => i.embedUrl)
    if (destino) router.replace(`/academia/${curso.value.slug}/${destino.ruta}`)
  },
  { immediate: true },
)

/* ── Avance ── */
watch(
  actual,
  (it, antes) => {
    if (it?.id === antes?.id) return
    soltar()
    terminado.value = false
    if (it && curso.value) seguir(null, curso.value.id, it.id, it.seconds)
  },
  { immediate: true },
)

/** Marca vista la clase en la lista que comparten Mi reto y esta página. */
function anotarVista(id: string) {
  const c = curso.value
  if (!c) return
  if (id === 'welcome' && c.welcomeVideo) c.welcomeVideo.completed = true
  const l = c.lessons.find((x) => x.id === id)
  if (l) l.completed = true
}

watch(terminado, (fin) => {
  if (!fin || !actual.value) return
  anotarVista(actual.value.id)
  cargarAvance()
})

/**
 * Marcar a mano: hay navegadores que no dejan pasar los mensajes del
 * reproductor, y sin esto el avance quedaría congelado.
 */
const marcando = ref(false)
async function marcarVista() {
  if (!curso.value || !actual.value) return
  marcando.value = true
  try {
    await progressService.marcarVista(curso.value.id, actual.value.id)
    anotarVista(actual.value.id)
    cargarAvance()
  } catch {
    // Si falla, vale lo que diga el servidor la próxima vez.
  } finally {
    marcando.value = false
  }
}

function alVolver() {
  if (document.visibilityState === 'visible') cargar(true)
}

onMounted(async () => {
  if (!session.user) await session.restore()
  await asegurar()
  document.addEventListener('visibilitychange', alVolver)
})

onBeforeUnmount(() => {
  soltar()
  document.removeEventListener('visibilitychange', alVolver)
})
</script>

<template>
  <div class="clase">
    <RouterLink to="/academia" class="volver"><FaIcon icon="arrow-left" /> Mi reto</RouterLink>

    <p v-if="error" class="aviso">{{ error }}</p>
    <p v-else-if="cargando && !curso" class="aviso">Cargando la clase…</p>
    <p v-else-if="!curso" class="aviso">
      No encontramos este curso. <RouterLink to="/academia">Volver a Mi reto</RouterLink>
    </p>

    <!-- Entró por enlace a algo que todavía no tiene: se le dice cuándo. -->
    <section v-else-if="curso.estado !== 'abierto'" class="cerrado">
      <FaIcon icon="lock" class="cerrado__icono" />
      <h1 class="cerrado__title">{{ curso.title }}</h1>
      <p class="cerrado__text">{{ cuandoAbre(curso) }}</p>
      <RouterLink to="/academia" class="cerrado__cta">Volver a Mi reto</RouterLink>
    </section>

    <div v-else-if="actual" class="layout">
      <div class="principal">
        <div class="video">
          <VideoPlayer
            :key="actual.id"
            :src="actual.hlsUrl"
            :embed-url="actual.embedUrl!"
            :poster="actual.thumbnail"
            :desde="actual.seconds"
            :titulo="actual.title"
            @progreso="reportar"
            @terminado="terminar"
            @marco="enlazar"
          />
        </div>

        <ClaseInfo
          :curso="curso"
          :actual="actual"
          :posicion="posicion"
          :total="items.length"
          :siguiente="siguiente"
          :terminado="terminado"
          :marcando="marcando"
          @marcar="marcarVista"
        />

        <!-- La lista va acá en el teléfono: debajo del video, antes de los comentarios. -->
        <ClaseLista
          class="lista-movil"
          :slug="curso.slug"
          :titulo="curso.title"
          :items="items"
          :actual-id="actual.id"
          :vistas="vistas"
        />

        <CommentThread
          :key="`c-${actual.id}`"
          :course-id="curso.id"
          :lesson-id="actual.id"
          titulo="Preguntas de esta clase"
        />
      </div>

      <aside class="lado">
        <ClaseLista
          :slug="curso.slug"
          :titulo="curso.title"
          :items="items"
          :actual-id="actual.id"
          :vistas="vistas"
        />
      </aside>
    </div>

    <p v-else class="aviso">Las clases de este curso se publican pronto.</p>
  </div>
</template>

<style lang="scss" scoped>
.clase {
  padding: 4.2rem clamp(1rem, 3vw, 2.5rem) 4rem;

  @include from('lg') {
    padding-top: clamp(1.2rem, 2.5vw, 2rem);
  }
}

.volver {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink-soft;

  &:hover {
    color: $wine;
  }

  @include focus-ring;
}

.aviso {
  padding: 2rem 0;
  font-size: $text-sm;
  color: $ink-muted;
}

.layout {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: $space-md;
}

.principal {
  display: flex;
  flex: 1 1 36rem;
  flex-direction: column;
  gap: 0.9rem;
  min-width: 0;
}

.lado {
  display: none;
  flex: 0 1 24rem;
  min-width: 18rem;

  @include from('xl') {
    position: sticky;
    top: 1.2rem;
    display: block;
  }
}

.lista-movil {
  @include from('xl') {
    display: none;
  }
}

.video {
  overflow: hidden;
  border-radius: $radius-lg;
  background-color: $ink;
}

.cerrado {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  max-width: 34rem;
  padding: $space-md;
  border-radius: $radius-lg;
  background-color: $cream;
}

.cerrado__icono {
  font-size: 1.4rem;
  color: $wine;
}

.cerrado__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.cerrado__text {
  font-size: $text-sm;
  color: $ink-soft;
}

.cerrado__cta {
  margin-top: 0.4rem;
  padding: 0.6rem 1.1rem;
  border-radius: $radius-pill;
  background-color: $ink;
  font-size: $text-sm;
  font-weight: 600;
  color: $cream;
}
</style>
