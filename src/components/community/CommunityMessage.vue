<script setup lang="ts">
/**
 * Un mensaje del muro.
 *
 * Sale del chat para no pasar de las 400 líneas por archivo, y de paso queda
 * donde corresponde: la burbuja tiene sus propios estados —mío, del equipo, con
 * foto o con inicial— y ninguno le importa a la lista que la contiene.
 */
import type { MensajeComunidad } from '@/services/communityService'

defineProps<{ mensaje: MensajeComunidad }>()
defineEmits<{ borrar: [string] }>()

/** La hora, que es lo que se mira en un chat. De otro día, también la fecha. */
function hora(iso: string) {
  const fecha = new Date(iso)
  const hoy = new Date().toDateString() === fecha.toDateString()
  return hoy
    ? fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    : fecha.toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
}
</script>

<template>
  <article
    class="msg"
    :class="{ 'msg--mio': mensaje.mine, 'msg--staff': mensaje.fromStaff }"
  >
    <span class="msg__avatar">
      <img
        v-if="mensaje.avatarUrl"
        :src="mensaje.avatarUrl"
        :alt="`Foto de ${mensaje.authorName}`"
      />
      <span v-else class="msg__inicial">{{ mensaje.inicial }}</span>
    </span>

    <div class="msg__burbuja">
      <p class="msg__meta">
        <span class="msg__autor">{{ mensaje.authorName }}</span>
        <span v-if="mensaje.fromStaff" class="msg__badge">Método SK</span>
        <span class="msg__hora">{{ hora(mensaje.createdAt) }}</span>
      </p>
      <p class="msg__texto">{{ mensaje.body }}</p>

      <button
        v-if="mensaje.mine"
        type="button"
        class="msg__borrar"
        aria-label="Borrar mi mensaje"
        @click="$emit('borrar', mensaje.id)"
      >
        <FaIcon icon="trash" />
      </button>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.msg {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

/* Los míos van al otro lado: es lo que hace que un chat se lea de un vistazo. */
.msg--mio {
  flex-direction: row-reverse;
}

.msg__avatar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background-color: $sand;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.msg__inicial {
  font-family: $font-display;
  font-size: 0.9rem;
  color: $wine;
}

.msg__burbuja {
  position: relative;
  max-width: min(80%, 60ch);
  padding: 0.6rem 0.85rem;
  border-radius: $radius-md;
  background-color: $bone;
}

.msg--mio .msg__burbuja {
  background-color: $rose-soft;
}

.msg--staff .msg__burbuja {
  background-color: $ink;

  .msg__autor,
  .msg__texto {
    color: $cream;
  }

  .msg__hora {
    color: rgba($cream, 0.5);
  }

  .msg__borrar {
    color: rgba($cream, 0.55);
  }
}

.msg__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem;
  margin-bottom: 0.15rem;
}

.msg__autor {
  font-size: $text-xs;
  font-weight: 600;
  color: $ink;
}

.msg__badge {
  padding: 0.05rem 0.45rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-size: 0.6rem;
  font-weight: 600;
  color: $wine;
}

.msg__hora {
  font-size: 0.64rem;
  color: $ink-muted;
}

.msg__texto {
  font-size: $text-sm;
  line-height: 1.5;
  color: $ink;
  /* Se respetan los saltos de línea que escribió, y una palabra kilométrica
     no estira la burbuja fuera de la pantalla. */
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.msg__borrar {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: none;
  font-size: 0.6rem;
  color: $ink-muted;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.24s $ease;
}

/* En táctil no hay hover: ahí se muestra siempre. */
.msg:hover .msg__borrar,
.msg__borrar:focus-visible {
  opacity: 1;
}

@media (hover: none) {
  .msg__borrar {
    opacity: 0.6;
  }
}
</style>
