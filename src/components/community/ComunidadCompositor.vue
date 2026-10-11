<script setup lang="ts">
/**
 * Dónde se escribe: primero qué compartes, después el texto y, si quieres, una
 * foto.
 *
 * Elegir el tipo antes de escribir no es burocracia: cambia la pregunta que se
 * le hace ("¿qué lograste?" en vez de "escribe algo") y una pregunta concreta
 * es la que destraba a quien no sabe qué publicar.
 *
 * La foto sube directo a Cloudinary con la firma del servidor, sin pasar por
 * nuestro API. Se sube al publicar, no al elegirla: así no queda una foto
 * huérfana cada vez que alguien se arrepiente.
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import communityService, {
  MAX_LARGO_MENSAJE,
  type MensajeComunidad,
  type TipoPost,
} from '@/services/communityService'
import { TIPOS, tipoDe } from '@/config/comunidad'

const props = defineProps<{ avatarUrl?: string | null; inicial?: string; puntos?: number }>()
const emit = defineEmits<{ publicado: [MensajeComunidad] }>()

const tipo = ref<TipoPost>('logro')
const texto = ref('')
const archivo = ref<File | null>(null)
const vistaPrevia = ref<string | null>(null)
const enviando = ref(false)
const error = ref('')
const input = ref<HTMLInputElement | null>(null)

const restantes = computed(() => MAX_LARGO_MENSAJE - texto.value.length)
const listo = computed(() => texto.value.trim().length > 0 && !enviando.value)

const MAX_MB = 12

function elegirFoto(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!f.type.startsWith('image/')) {
    error.value = 'Elige una foto (JPG, PNG o HEIC).'
    return
  }
  if (f.size > MAX_MB * 1024 * 1024) {
    error.value = `La foto pesa más de ${MAX_MB} MB. Prueba con otra.`
    return
  }
  error.value = ''
  quitarFoto()
  archivo.value = f
  vistaPrevia.value = URL.createObjectURL(f)
}

function quitarFoto() {
  if (vistaPrevia.value) URL.revokeObjectURL(vistaPrevia.value)
  vistaPrevia.value = null
  archivo.value = null
  if (input.value) input.value.value = ''
}

async function publicar() {
  if (!listo.value) return
  enviando.value = true
  error.value = ''
  try {
    let imagen: string | null = null
    if (archivo.value) {
      const firma = await communityService.firmarImagen()
      imagen = await communityService.subirImagen(firma, archivo.value)
    }
    const post = await communityService.publicar({ body: texto.value.trim(), tipo: tipo.value, imagen })
    emit('publicado', post)
    texto.value = ''
    quitarFoto()
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos publicarlo. Intenta de nuevo.'
  } finally {
    enviando.value = false
  }
}

/** Cmd/Ctrl + Enter publica, como en cualquier red. */
function teclas(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    publicar()
  }
}

onBeforeUnmount(quitarFoto)
</script>

<template>
  <form class="comp" @submit.prevent="publicar">
    <div class="comp__tipos" role="radiogroup" aria-label="¿Qué compartes?">
      <button
        v-for="t in TIPOS"
        :key="t.id"
        type="button"
        role="radio"
        class="chip"
        :class="{ 'chip--activo': tipo === t.id }"
        :aria-checked="tipo === t.id"
        @click="tipo = t.id"
      >
        <span aria-hidden="true">{{ t.emoji }}</span> {{ t.nombre }}
      </button>
    </div>

    <div class="comp__fila">
      <span class="comp__avatar" aria-hidden="true">
        <img v-if="props.avatarUrl" :src="props.avatarUrl" alt="" />
        <span v-else>{{ props.inicial || '·' }}</span>
      </span>
      <textarea
        v-model="texto"
        class="comp__campo"
        rows="3"
        :maxlength="MAX_LARGO_MENSAJE"
        :placeholder="tipoDe(tipo).placeholder"
        aria-label="Tu publicación"
        @keydown="teclas"
      />
    </div>

    <div v-if="vistaPrevia" class="comp__previa">
      <img :src="vistaPrevia" alt="La foto que vas a compartir" />
      <button type="button" class="comp__quitar" aria-label="Quitar la foto" @click="quitarFoto">
        <FaIcon icon="xmark" />
      </button>
    </div>

    <div class="comp__pie">
      <button type="button" class="comp__foto" @click="input?.click()">
        <FaIcon icon="camera" /> {{ vistaPrevia ? 'Cambiar foto' : 'Agregar foto' }}
      </button>
      <input
        ref="input"
        type="file"
        accept="image/*"
        class="comp__archivo"
        tabindex="-1"
        aria-hidden="true"
        @change="elegirFoto"
      />

      <span v-if="restantes < 150" class="comp__cuenta">{{ restantes }}</span>

      <button type="submit" class="comp__publicar" :disabled="!listo">
        <FaIcon v-if="enviando" icon="spinner" spin />
        <template v-else>
          Publicar
          <span v-if="props.puntos" class="comp__pts">+{{ props.puntos }} pts</span>
        </template>
      </button>
    </div>

    <p v-if="error" class="comp__error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>
  </form>
</template>

<style lang="scss" scoped>
.comp {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.1rem;
  border: 1px solid $sand;
  border-radius: $radius-lg;
  background-color: $white;
  box-shadow: $shadow-sm;
}

.comp__tipos {
  display: flex;
  gap: 0.4rem;
  margin: 0 -1.1rem;
  padding: 0 1.1rem 0.1rem;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.chip {
  flex: none;
  padding: 0.42rem 0.85rem;
  border: 1px solid $sand;
  border-radius: $radius-pill;
  background-color: $white;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-soft;
  cursor: pointer;
  transition: background-color 0.2s $ease, color 0.2s $ease, border-color 0.2s $ease;

  &:hover {
    background-color: $cream;
  }

  @include focus-ring;
}

.chip--activo {
  border-color: $ink;
  background-color: $ink;
  color: $cream;

  &:hover {
    background-color: $ink;
  }
}

.comp__fila {
  display: flex;
  gap: 0.7rem;
}

.comp__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
  background-color: $rose-soft;
  font-family: $font-display;
  color: $wine;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.comp__campo {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 4.6rem;
  max-height: 14rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid transparent;
  border-radius: $radius-md;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink;
  resize: none;
  transition: border-color 0.2s $ease;

  &::placeholder {
    color: $ink-muted;
  }

  &:focus {
    border-color: $rose;
    outline: none;
  }
}

.comp__previa {
  position: relative;
  align-self: flex-start;
  margin-left: calc(40px + 0.7rem);

  img {
    display: block;
    max-width: 100%;
    max-height: 240px;
    border-radius: $radius-md;
    object-fit: cover;
  }
}

.comp__quitar {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background-color: rgba($ink, 0.78);
  color: $cream;
  cursor: pointer;

  @include focus-ring;
}

.comp__pie {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.comp__foto {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-soft;
  cursor: pointer;

  &:hover {
    background-color: $sand;
  }

  @include focus-ring;
}

.comp__archivo {
  display: none;
}

.comp__cuenta {
  font-size: $text-xs;
  color: $ink-muted;
}

.comp__publicar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: inherit;
  font-size: $text-sm;
  font-weight: 600;
  color: $cream;
  cursor: pointer;
  transition: background-color 0.2s $ease, opacity 0.2s $ease;

  &:hover:not(:disabled) {
    background-color: $wine;
  }

  &:disabled {
    cursor: default;
    opacity: 0.45;
  }

  @include focus-ring;
}

.comp__pts {
  padding: 0.05rem 0.45rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-size: 0.68rem;
  color: $ink;
}

.comp__error {
  font-size: $text-xs;
  color: $wine;
}
</style>
