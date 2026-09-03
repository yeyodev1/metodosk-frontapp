<script setup lang="ts">
/**
 * Su foto de perfil para la comunidad — opcional siempre.
 *
 * Sin foto se pinta su inicial, y eso no es un estado degradado: hay quien no
 * quiere poner su cara en un muro que ven doscientas personas, y forzarlo es
 * la forma más rápida de que no escriba nunca.
 *
 * A diferencia de las de avance, esta se sube pública: la ve el resto en cada
 * mensaje. Se dice acá, no en una política que nadie abre.
 */
import { ref } from 'vue'
import communityService, { type MiPerfil } from '@/services/communityService'

const props = defineProps<{ perfil: MiPerfil }>()
const emit = defineEmits<{ actualizado: [MiPerfil] }>()

const subiendo = ref(false)
const error = ref('')

async function elegir(evento: Event) {
  const input = evento.target as HTMLInputElement
  const archivo = input.files?.[0]
  if (!archivo) return

  subiendo.value = true
  error.value = ''
  try {
    const firma = await communityService.firmarAvatar()
    const publicId = await communityService.subirAvatar(firma, archivo)
    const { avatarUrl } = await communityService.guardarAvatar(publicId)
    emit('actualizado', { ...props.perfil, avatarUrl, publicId })
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos subir la foto'
  } finally {
    subiendo.value = false
    input.value = ''
  }
}

async function quitar() {
  error.value = ''
  try {
    await communityService.quitarAvatar()
    emit('actualizado', { ...props.perfil, avatarUrl: null, publicId: null })
  } catch {
    error.value = 'No pudimos quitarla'
  }
}
</script>

<template>
  <div class="perfil">
    <span class="perfil__avatar">
      <img v-if="perfil.avatarUrl" :src="perfil.avatarUrl" :alt="`Foto de ${perfil.nombre}`" />
      <span v-else class="perfil__inicial">{{ perfil.inicial }}</span>
    </span>

    <div class="perfil__texto">
      <p class="perfil__nombre">{{ perfil.nombre }}</p>
      <p class="perfil__hint">
        {{ perfil.avatarUrl ? 'Así te ve la comunidad' : 'Puedes poner una foto, si quieres' }}
      </p>

      <div class="perfil__acciones">
        <label class="perfil__btn" :class="{ 'perfil__btn--carga': subiendo }">
          <FaIcon :icon="subiendo ? 'spinner' : 'camera'" :spin="subiendo" />
          {{ subiendo ? 'Subiendo…' : perfil.avatarUrl ? 'Cambiar' : 'Poner foto' }}
          <input type="file" accept="image/*" :disabled="subiendo" @change="elegir" />
        </label>

        <button v-if="perfil.avatarUrl" type="button" class="perfil__btn" @click="quitar">
          <FaIcon icon="trash" /> Quitar
        </button>
      </div>

      <p v-if="error" class="perfil__error">
        <FaIcon icon="triangle-exclamation" /> {{ error }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.perfil {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: clamp(1rem, 3vw, 1.3rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.perfil__avatar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background-color: $rose-soft;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.perfil__inicial {
  font-family: $font-display;
  font-size: 1.3rem;
  color: $wine;
}

.perfil__texto {
  min-width: 0;
}

.perfil__nombre {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.perfil__hint {
  font-size: $text-xs;
  color: $ink-muted;
}

.perfil__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.55rem;
}

.perfil__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.85rem;
  border: 1px solid rgba($ink, 0.14);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: $rose-soft;
  }

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  @include focus-ring;
}

.perfil__btn--carga {
  opacity: 0.7;
  pointer-events: none;
}

.perfil__error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  font-size: $text-xs;
  color: $alert-error;
}
</style>
