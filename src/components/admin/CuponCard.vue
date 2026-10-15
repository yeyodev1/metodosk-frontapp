<script setup lang="ts">
/**
 * Un cupón en la lista: cuánto descuenta, hasta cuándo, cuánto vendió y el
 * link listo para pegar en una historia o un mensaje. Copiar el link es la
 * acción principal: para eso se crea un cupón.
 */
import { computed, ref } from 'vue'
import { formatUsd } from '@/config/payment'
import { linkConCupon } from '@/composables/useCupon'
import type { CuponAdmin } from '@/services/cuponService'
import { ESTADOS, copiar, fechaLarga, relativo } from './cupones'

const props = defineProps<{ cupon: CuponAdmin }>()
const emit = defineEmits<{ editar: []; alternar: []; eliminar: [] }>()

const link = computed(() => linkConCupon(props.cupon.code))
const estado = computed(() => ESTADOS[props.cupon.estado])

const vigencia = computed(() => {
  const c = props.cupon
  if (c.estado === 'programado') return `Empieza ${relativo(c.startsAt)} · ${fechaLarga(c.startsAt)}`
  if (!c.endsAt) return 'Sin vencimiento'
  const cuando = relativo(c.endsAt)
  return c.estado === 'vencido' ? `Venció ${cuando} · ${fechaLarga(c.endsAt)}` : `Vence ${cuando} · ${fechaLarga(c.endsAt)}`
})

const copiado = ref<'' | 'link' | 'code'>('')
let reloj: ReturnType<typeof setTimeout> | undefined

async function copiarAlgo(que: 'link' | 'code') {
  if (await copiar(que === 'link' ? link.value : props.cupon.code)) {
    copiado.value = que
    clearTimeout(reloj)
    reloj = setTimeout(() => (copiado.value = ''), 1800)
  }
}
</script>

<template>
  <article class="cc" :class="`cc--${estado.tono}`">
    <header class="cc__head">
      <div class="cc__titulo">
        <span class="cc__pct">−{{ cupon.percent }}%</span>
        <h3 class="cc__code">{{ cupon.code }}</h3>
        <span class="estado" :class="`estado--${estado.tono}`">{{ estado.label }}</span>
      </div>
      <p class="cc__precio">
        {{ formatUsd(cupon.finalCents) }} <s>{{ formatUsd(cupon.baseCents) }}</s>
      </p>
    </header>

    <p class="cc__vigencia"><FaIcon icon="clock" /> {{ vigencia }}</p>
    <p v-if="cupon.note" class="cc__nota">{{ cupon.note }}</p>

    <ul class="cc__datos">
      <li>
        <strong>{{ cupon.ventas }}</strong>
        {{ cupon.ventas === 1 ? 'venta' : 'ventas' }}{{ cupon.maxUses ? ` de ${cupon.maxUses}` : '' }}
      </li>
      <li><strong>{{ formatUsd(cupon.recaudadoCents) }}</strong> recaudado</li>
    </ul>

    <div class="cc__link">
      <code class="cc__url">{{ link }}</code>
      <button type="button" class="cc__copiar" @click="copiarAlgo('link')">
        <FaIcon :icon="copiado === 'link' ? 'check' : 'link'" />
        {{ copiado === 'link' ? 'Link copiado' : 'Copiar link' }}
      </button>
    </div>

    <footer class="cc__acciones">
      <button type="button" class="mini" @click="copiarAlgo('code')">
        <FaIcon :icon="copiado === 'code' ? 'check' : 'copy'" />
        {{ copiado === 'code' ? 'Copiado' : 'Copiar código' }}
      </button>
      <button type="button" class="mini" @click="emit('editar')"><FaIcon icon="pen" /> Editar</button>
      <button type="button" class="mini" @click="emit('alternar')">
        <FaIcon :icon="cupon.active ? 'pause' : 'play'" /> {{ cupon.active ? 'Pausar' : 'Reactivar' }}
      </button>
      <button type="button" class="mini mini--danger" @click="emit('eliminar')">
        <FaIcon icon="trash" /> Eliminar
      </button>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.cc {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: clamp(1rem, 3vw, 1.4rem);
  border-radius: $radius-lg;
  background-color: $cream;
  border-left: 4px solid transparent;
}

.cc--ok {
  border-left-color: #4a7a45;
}

.cc--info {
  border-left-color: $alert-info;
}

.cc--warn {
  border-left-color: #c9962a;
}

.cc--off {
  opacity: 0.72;
}

.cc__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.cc__titulo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.cc__pct {
  padding: 0.3rem 0.55rem;
  border-radius: $radius-sm;
  background-color: $ink;
  font-size: $text-sm;
  font-weight: 700;
  color: $cream;
}

.cc__code {
  font-family: $font-display;
  font-size: $text-xl;
  line-height: 1.1;
  color: $ink;
  overflow-wrap: anywhere;
}

.estado {
  padding: 0.12rem 0.6rem;
  border-radius: $radius-pill;
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.estado--ok {
  background-color: $alert-success-bg;
  color: #4a7a45;
}

.estado--info {
  background-color: $alert-info-bg;
  color: $alert-info;
}

.estado--warn {
  background-color: $alert-warning-bg;
  color: #8a6410;
}

.estado--off {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}

.cc__precio {
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;

  s {
    font-family: $font-principal;
    font-size: $text-sm;
    color: $ink-muted;
  }
}

.cc__vigencia {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: $text-sm;
  color: $ink-soft;
}

.cc__nota {
  font-size: $text-xs;
  color: $ink-muted;
  font-style: italic;
}

.cc__datos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.2rem;
  list-style: none;
  font-size: $text-sm;
  color: $ink-soft;

  strong {
    color: $ink;
  }
}

.cc__link {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.9rem;
  border: 1px dashed rgba($ink, 0.2);
  border-radius: $radius-md;
  background-color: $bone;
}

.cc__url {
  flex: 1 1 200px;
  min-width: 0;
  font-size: $text-xs;
  color: $ink-soft;
  overflow-wrap: anywhere;
}

.cc__copiar {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: $cream;
  cursor: pointer;

  @include focus-ring;
}

.cc__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.1rem;
}

.mini {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-muted;
  cursor: pointer;
  transition: color 0.24s $ease;

  &:hover {
    color: $ink;
  }

  @include focus-ring;
}

.mini--danger:hover {
  color: $alert-error;
}
</style>
