<script setup lang="ts">
/**
 * Qué reto compró — y cómo sumar el otro.
 *
 * Los dos son planes distintos, no niveles de uno solo: el suyo no se cambia,
 * porque el material está armado alrededor de un objetivo y cambiarlo a mitad
 * sería tirar el mes que lleva. Lo que sí se puede es tener los dos.
 *
 * Por eso se muestran los dos siempre, con el suyo marcado y el otro con su
 * precio: esconder el que no compró la deja sin saber que existe la opción, y
 * mostrarlo igual que el suyo la deja sin saber cuál tiene.
 */
import { computed } from 'vue'
import CldImage from '@/components/ui/CldImage.vue'
import { useCheckout } from '@/composables/useCheckout'
import { CHALLENGES, type Challenge } from '@/config/site'
import { PHOTO } from '@/config/photos'
import { PRICES } from '@/config/payment'
import { useSessionStore } from '@/stores/session'

const props = withDefaults(defineProps<{ preview?: string | null }>(), { preview: null })

const session = useSessionStore()
const { open } = useCheckout()

/** En vista previa manda el reto que eligió la administración. */
const misRetos = computed<string[]>(() => {
  if (props.preview) return [props.preview]
  const user = session.user
  if (!user) return []
  return user.challenges?.length ? user.challenges : user.challenge ? [user.challenge] : []
})

const tengo = (c: Challenge) => misRetos.value.includes(c.name)

const tengoLosDos = computed(() => CHALLENGES.every(tengo))

const precio = computed(() => `$${(PRICES.presale / 100).toFixed(0)}`)

const fotoDe = (c: Challenge) => (c.id === 'volumen' ? PHOTO.volumen : PHOTO.recomposicion)

function comprar(c: Challenge) {
  // Se abre con sus datos puestos: es su segunda compra, ya la conocemos.
  open(c.id, { name: session.user?.name || '', email: session.user?.email || '' })
}
</script>

<template>
  <section class="retos">
    <header class="retos__head">
      <div>
        <h2 class="retos__title"><FaIcon icon="dumbbell" /> Tu reto</h2>
        <p class="retos__sub">
          <template v-if="tengoLosDos">
            Tienes los dos retos. Abajo está el material de ambos, marcado por reto.
          </template>
          <template v-else>
            Este es el plan que compraste y no se cambia — está armado alrededor de tu objetivo.
            Si quieres el otro, se suma al que ya tienes.
          </template>
        </p>
      </div>
    </header>

    <div class="rejilla">
      <article
        v-for="c in CHALLENGES"
        :key="c.id"
        class="reto"
        :class="{ 'reto--mio': tengo(c), 'reto--otro': !tengo(c) }"
      >
        <div class="reto__foto">
          <CldImage
            :public-id="fotoDe(c).id"
            :alt="fotoDe(c).alt"
            ratio="4:3"
            sizes="(min-width: 900px) 320px, 100vw"
          />
          <span class="reto__sello">
            <template v-if="tengo(c)"><FaIcon icon="check" /> El tuyo</template>
            <template v-else><FaIcon icon="lock" /> No lo tienes</template>
          </span>
        </div>

        <div class="reto__cuerpo">
          <h3 class="reto__nombre">{{ c.name }}</h3>
          <p class="reto__claim">{{ c.claim }}</p>
          <p class="reto__para">{{ c.forWho }}</p>

          <ul class="reto__lista">
            <li v-for="b in c.bullets.slice(0, 3)" :key="b">
              <FaIcon icon="check" /> {{ b }}
            </li>
          </ul>

          <p v-if="tengo(c)" class="reto__estado">
            <FaIcon icon="circle-play" /> Su material está abierto más abajo
          </p>

          <button v-else type="button" class="reto__cta" @click="comprar(c)">
            Sumar {{ c.name }} · {{ precio }}
            <FaIcon icon="arrow-right" />
          </button>
        </div>
      </article>
    </div>

    <p v-if="!tengoLosDos" class="retos__pie">
      <FaIcon icon="circle-question" />
      Sumar el segundo reto no reemplaza el primero: quedan los dos en tu cuenta, cada uno con sus
      3 meses.
    </p>
  </section>
</template>

<style lang="scss" scoped>
.retos {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.retos__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.6rem;
}

.retos__title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;

  svg {
    font-size: 0.75em;
    color: $rose-deep;
  }
}

.retos__sub {
  max-width: 68ch;
  margin-top: 0.25rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.rejilla {
  display: grid;
  grid-template-columns: 1fr;
  gap: $space-sm;

  @include from('md') {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ── Tarjeta de reto ── */
.reto {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: $radius-lg;
  background-color: $cream;
  transition: transform 0.4s $ease, box-shadow 0.4s $ease;
}

/* El suyo lleva marco: se distingue sin leer una palabra */
.reto--mio {
  outline: 2px solid $ink;
  outline-offset: -2px;
}

.reto--otro {
  background-color: rgba($cream, 0.6);

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.reto__foto {
  position: relative;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.reto--otro .reto__foto :deep(img) {
  filter: grayscale(0.7);
  opacity: 0.85;
}

.reto__sello {
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.8rem;
  border-radius: $radius-pill;
  background-color: rgba($cream, 0.92);
  backdrop-filter: blur(6px);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $ink-muted;
}

.reto--mio .reto__sello {
  background-color: $ink;
  color: $cream;
}

.reto__cuerpo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  padding: clamp(1.1rem, 3vw, 1.5rem);
}

.reto__nombre {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.reto__claim {
  font-size: $text-sm;
  color: $ink-soft;
}

.reto__para {
  font-size: $text-xs;
  font-style: italic;
  color: $rose-deep;
}

.reto__lista {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.6rem;
  list-style: none;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: $text-xs;
    line-height: 1.45;
    color: $ink-soft;
  }

  svg {
    flex: none;
    margin-top: 0.25em;
    font-size: 0.7em;
    color: $sage;
  }
}

.reto__estado {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.8rem;
  font-size: $text-xs;
  color: $ink-muted;
}

.reto__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.9rem;
  padding: 0.7rem 1.3rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: $cream;
  cursor: pointer;
  transition: background-color 0.3s $ease;

  svg {
    transition: transform 0.3s $ease;
  }

  &:hover {
    background-color: $wine;

    svg {
      transform: translateX(3px);
    }
  }

  @include focus-ring;
}

.retos__pie {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: $radius-md;
  background-color: rgba($sand, 0.7);
  font-size: $text-xs;
  color: $ink-soft;

  svg {
    flex: none;
    color: $rose-deep;
  }
}
</style>
