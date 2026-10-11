<script setup lang="ts">
/**
 * Una publicación del muro: quién, su nivel, qué compartió y las reacciones.
 *
 * El nivel va junto al nombre a propósito: es la recompensa que se ve en
 * público, y lo que hace que una alumna nueva entienda de un vistazo que acá
 * subir de nivel es cosa de constancia.
 */
import { ref } from 'vue'
import type { MensajeComunidad, TipoReaccion } from '@/services/communityService'
import communityService from '@/services/communityService'
import { REACCIONES, tipoDe } from '@/config/comunidad'

const props = defineProps<{ post: MensajeComunidad }>()
const emit = defineEmits<{ borrar: [string]; actualizado: [MensajeComunidad] }>()

const reaccionando = ref(false)
const fotoGrande = ref(false)

function cuando(iso: string) {
  const fecha = new Date(iso)
  const min = Math.round((Date.now() - fecha.getTime()) / 60_000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const horas = Math.round(min / 60)
  if (horas < 24) return `hace ${horas} h`
  return fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

/** La reacción se pinta al instante; si el servidor falla, se deshace. */
async function reaccionar(tipo: TipoReaccion) {
  if (reaccionando.value) return
  reaccionando.value = true
  const antes = { ...props.post, reacciones: { ...props.post.reacciones }, misReacciones: [...props.post.misReacciones] }
  const puesta = props.post.misReacciones.includes(tipo)
  emit('actualizado', {
    ...antes,
    reacciones: { ...antes.reacciones, [tipo]: antes.reacciones[tipo] + (puesta ? -1 : 1) },
    misReacciones: puesta ? antes.misReacciones.filter((r) => r !== tipo) : [...antes.misReacciones, tipo],
  })
  try {
    emit('actualizado', await communityService.reaccionar(props.post.id, tipo))
  } catch {
    emit('actualizado', antes)
  } finally {
    reaccionando.value = false
  }
}
</script>

<template>
  <article class="post" :class="[`post--${post.tipo}`, { 'post--staff': post.fromStaff }]">
    <header class="post__cab">
      <span class="post__avatar">
        <img v-if="post.avatarUrl" :src="post.avatarUrl" :alt="`Foto de ${post.authorName}`" />
        <span v-else>{{ post.inicial }}</span>
      </span>

      <div class="post__quien">
        <p class="post__nombre">
          {{ post.authorName }}
          <span v-if="post.fromStaff" class="sello sello--staff">Método SK</span>
          <span v-else-if="post.nivel" class="sello">
            Nivel {{ post.nivel.nivel }} · {{ post.nivel.nombre }}
          </span>
        </p>
        <p class="post__meta">
          <span class="post__tipo">{{ tipoDe(post.tipo).emoji }} {{ tipoDe(post.tipo).nombre }}</span>
          · {{ cuando(post.createdAt) }}
        </p>
      </div>

      <button
        v-if="post.mine"
        type="button"
        class="post__borrar"
        aria-label="Borrar mi publicación"
        @click="emit('borrar', post.id)"
      >
        <FaIcon icon="trash" />
      </button>
    </header>

    <p class="post__texto">{{ post.body }}</p>

    <button
      v-if="post.imagenUrl"
      type="button"
      class="post__foto"
      :aria-label="`Ver la foto de ${post.authorName} en grande`"
      @click="fotoGrande = true"
    >
      <img :src="post.imagenUrl" :alt="`Foto compartida por ${post.authorName}`" loading="lazy" />
    </button>

    <footer class="post__reacciones">
      <button
        v-for="r in REACCIONES"
        :key="r.id"
        type="button"
        class="reaccion"
        :class="{ 'reaccion--mia': post.misReacciones.includes(r.id) }"
        :aria-pressed="post.misReacciones.includes(r.id)"
        :aria-label="`${r.nombre}: ${post.reacciones[r.id]}`"
        @click="reaccionar(r.id)"
      >
        <span class="reaccion__emoji">{{ r.emoji }}</span>
        <span v-if="post.reacciones[r.id]" class="reaccion__n">{{ post.reacciones[r.id] }}</span>
      </button>
    </footer>

    <Teleport to="body">
      <div v-if="fotoGrande" class="visor" role="dialog" aria-modal="true" @click="fotoGrande = false">
        <button type="button" class="visor__cerrar" aria-label="Cerrar"><FaIcon icon="xmark" /></button>
        <img :src="post.imagenUrl!" :alt="`Foto compartida por ${post.authorName}`" />
      </div>
    </Teleport>
  </article>
</template>

<style lang="scss" scoped>
.post {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.05rem 1.15rem;
  border: 1px solid $sand;
  border-radius: $radius-lg;
  background-color: $white;
}

/* Un logro se distingue de lejos: es lo que queremos que se publique. */
.post--logro {
  border-color: rgba($wine, 0.35);
  background: linear-gradient(180deg, rgba($rose-soft, 0.35), $white 55%);
}

.post--staff {
  border-color: rgba($wine, 0.5);
  background-color: $cream;
}

.post__cab {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.post__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
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

.post__quien {
  flex: 1 1 auto;
  min-width: 0;
}

.post__nombre {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.sello {
  padding: 0.1rem 0.5rem;
  border-radius: $radius-pill;
  background-color: $cream;
  font-size: 0.68rem;
  font-weight: 600;
  color: $wine;
}

.sello--staff {
  background-color: $ink;
  color: $cream;
}

.post__meta {
  margin-top: 0.1rem;
  font-size: $text-xs;
  color: $ink-muted;
}

.post__tipo {
  font-weight: 600;
  color: $ink-soft;
}

.post__borrar {
  flex: none;
  padding: 0.4rem;
  border: none;
  background: none;
  color: $ink-muted;
  cursor: pointer;

  &:hover {
    color: $wine;
  }

  @include focus-ring;
}

.post__texto {
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.post__foto {
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: $radius-md;
  background-color: $cream;
  cursor: zoom-in;

  img {
    display: block;
    width: 100%;
    max-height: 460px;
    object-fit: cover;
  }

  @include focus-ring;
}

.post__reacciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.reaccion {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 34px;
  padding: 0.25rem 0.75rem;
  border: 1px solid $sand;
  border-radius: $radius-pill;
  background-color: $white;
  font-family: inherit;
  font-size: $text-sm;
  cursor: pointer;
  transition: transform 0.18s $ease, background-color 0.2s $ease, border-color 0.2s $ease;

  &:hover {
    background-color: $cream;
  }

  &:active {
    transform: scale(0.94);
  }

  @include focus-ring;
}

.reaccion--mia {
  border-color: $wine;
  background-color: rgba($rose-soft, 0.6);
}

.reaccion__n {
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-soft;
}

.visor {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.6rem 0.8rem 1rem;
  background-color: rgba($ink, 0.94);

  img {
    max-width: 100%;
    max-height: calc(100dvh - 4.6rem);
    border-radius: $radius-sm;
    object-fit: contain;
  }
}

.visor__cerrar {
  position: fixed;
  top: 0.9rem;
  right: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background-color: rgba($cream, 0.16);
  color: $cream;
  cursor: pointer;
}

@include reduced-motion {
  .reaccion {
    transition: none;
  }
}
</style>
