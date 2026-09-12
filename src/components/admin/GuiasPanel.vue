<script setup lang="ts">
/**
 * Las guías en PDF, subidas desde el panel.
 *
 * El archivo va directo del navegador a Cloudinary —son 50 MB y no caben en
 * una función— y queda privado: la alumna no recibe el PDF sino sus páginas
 * en imagen, con su correo marcado encima. Así un reenvío se puede rastrear.
 *
 * Hay una guía por reto porque el material no es el mismo: déficit para
 * recomposición, superávit para volumen.
 */
import { computed, onMounted, ref } from 'vue'
import courseService, { type Audiencia, type CursoAdmin } from '@/services/courseService'

const RETOS: Array<{ id: Audiencia; nombre: string }> = [
  { id: 'recomposicion', nombre: 'Recomposición (déficit)' },
  { id: 'volumen', nombre: 'Volumen (superávit)' },
  { id: 'ambas', nombre: 'Las dos' },
]

const cursos = ref<CursoAdmin[]>([])
const cursoId = ref('')
const audiencia = ref<Audiencia>('recomposicion')
const titulo = ref('')
const archivo = ref<File | null>(null)
const subiendo = ref(false)
const error = ref('')
const listo = ref('')

const curso = computed(() => cursos.value.find((c) => c.id === cursoId.value) ?? null)
const guias = computed(() => curso.value?.guias ?? [])

async function cargar() {
  try {
    const r = await courseService.listar()
    cursos.value = r.cursos
    if (!cursoId.value) {
      cursoId.value = r.cursos.find((c) => c.slug === 'nutricion')?.id || r.cursos[0]?.id || ''
    }
  } catch {
    cursos.value = []
  }
}

function elegir(e: Event) {
  const input = e.target as HTMLInputElement
  archivo.value = input.files?.[0] ?? null
}

async function subir() {
  if (!archivo.value || !cursoId.value) return
  subiendo.value = true
  error.value = ''
  listo.value = ''
  try {
    const firma = await courseService.prepararGuia(cursoId.value, audiencia.value)
    const { publicId, paginas } = await courseService.subirGuiaACloudinary(firma, archivo.value)
    cursos.value = await courseService.guardarGuia(cursoId.value, {
      audiencia: audiencia.value,
      titulo: titulo.value.trim() || archivo.value.name.replace(/\.pdf$/i, ''),
      publicId,
      paginas,
    })
    listo.value = `Subida: ${paginas} páginas.`
    archivo.value = null
    titulo.value = ''
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'No se pudo subir.'
  } finally {
    subiendo.value = false
  }
}

async function quitar(a: Audiencia) {
  try {
    cursos.value = await courseService.eliminarGuia(cursoId.value, a)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'No se pudo quitar.'
  }
}

onMounted(cargar)
</script>

<template>
  <section class="gui">
    <header>
      <h2 class="gui__title">Guías en PDF</h2>
      <p class="gui__sub">
        Se suben privadas. La alumna las lee en pantalla, página por página y con su correo
        marcado encima; no hay botón de descarga ni link al archivo.
      </p>
    </header>

    <div class="gui__form">
      <label class="gui__campo">
        <span>Curso</span>
        <select v-model="cursoId">
          <option v-for="c in cursos" :key="c.id" :value="c.id">{{ c.title }}</option>
        </select>
      </label>

      <label class="gui__campo">
        <span>Para qué reto</span>
        <select v-model="audiencia">
          <option v-for="r in RETOS" :key="r.id" :value="r.id">{{ r.nombre }}</option>
        </select>
      </label>

      <label class="gui__campo">
        <span>Título</span>
        <input v-model="titulo" type="text" placeholder="Guía de déficit calórico" />
      </label>

      <label class="gui__campo">
        <span>Archivo PDF</span>
        <input type="file" accept="application/pdf" @change="elegir" />
      </label>

      <button type="button" class="gui__boton" :disabled="!archivo || subiendo" @click="subir">
        {{ subiendo ? 'Subiendo…' : 'Subir guía' }}
      </button>
    </div>

    <p v-if="listo" class="gui__ok">{{ listo }}</p>
    <p v-if="error" class="gui__error">{{ error }}</p>

    <ul v-if="guias.length" class="gui__lista">
      <li v-for="g in guias" :key="g.audiencia">
        <strong>{{ g.titulo }}</strong> · {{ g.audiencia }} · {{ g.paginas }} páginas
        <button type="button" @click="quitar(g.audiencia)">Quitar</button>
      </li>
    </ul>
    <p v-else class="gui__vacio">Este curso todavía no tiene guías.</p>
  </section>
</template>

<style lang="scss" scoped>
.gui {
  margin-bottom: $space-md;
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.gui__title {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.gui__sub {
  margin-top: 0.2rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.gui__form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.6rem;
  margin-top: 0.9rem;
}

.gui__campo {
  display: flex;
  flex: 1 1 180px;
  flex-direction: column;
  gap: 0.25rem;

  span {
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-soft;
  }

  input,
  select {
    padding: 0.55rem 0.7rem;
    border: 1px solid $sand;
    border-radius: $radius-md;
    background-color: $bone;
    font-family: inherit;
    font-size: $text-xs;
    color: $ink;
  }
}

.gui__boton {
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $cream;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.gui__ok,
.gui__vacio {
  margin-top: 0.6rem;
  font-size: $text-xs;
  color: $ink-soft;
}

.gui__error {
  margin-top: 0.6rem;
  font-size: $text-xs;
  color: $wine;
}

.gui__lista {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.7rem;
  list-style: none;
  font-size: $text-xs;
  color: $ink-soft;

  button {
    margin-left: 0.5rem;
    border: none;
    background: none;
    font-family: inherit;
    font-size: $text-xs;
    color: $wine;
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
