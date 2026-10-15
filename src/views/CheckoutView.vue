<script setup lang="ts">
/**
 * La página de compra (`/comprar`).
 *
 * Dos pasos a la vista al mismo tiempo —elegir el reto y dejar los datos— y
 * al lado el resumen con el precio, que no se va de la pantalla. Tiene URL
 * propia: el link de un cupón (`/comprar?cupon=…`) cae directo acá, con el
 * descuento puesto, y el "atrás" del teléfono vuelve a la landing en vez de
 * cerrar un modal que nadie sabía cerrar.
 */
import { computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import CheckoutForm from '@/components/payment/CheckoutForm.vue'
import CheckoutResumen from '@/components/payment/CheckoutResumen.vue'
import RetoOpciones from '@/components/payment/RetoOpciones.vue'
import { useCheckout } from '@/composables/useCheckout'
import { CAJITA_ID, usePagar } from '@/composables/usePagar'
import { useCupon } from '@/composables/useCupon'
import { trackMeta } from '@/composables/useMetaPixel'
import { CHALLENGES, type Challenge } from '@/config/site'

const route = useRoute()
const router = useRouter()
const { selectedId, selected, select } = useCheckout()
const { precio, errorLink } = useCupon()
const { status, errorMessage, enviando, pagar, volverAlFormulario } = usePagar(selected)

const eleccion = computed({
  get: () => selectedId.value,
  set: (id: Challenge['id'] | null) => select(id),
})

// Entrar directo con ?reto= (un link a un reto en particular) lo deja elegido.
const desdeUrl = CHALLENGES.find((c) => c.id === route.query.reto)
if (desdeUrl) select(desdeUrl.id)
else if (CHALLENGES.length === 1) select(CHALLENGES[0]!.id)

// La URL acompaña la elección, sin sumar entradas al historial.
watch(selectedId, (id) => {
  if (id && route.query.reto !== id) router.replace({ query: { ...route.query, reto: id } })
})

/**
 * InitiateCheckout al llegar a esta página. Antes se disparaba al abrir el
 * modal; ahora acá llegan todos: los botones de la landing y los links con
 * cupón que caen directo, que antes no se medían.
 */
onMounted(() => {
  trackMeta('InitiateCheckout', {
    value: precio.value / 100,
    contentIds: selected.value ? [selected.value.id] : CHALLENGES.map((c) => c.id),
    contentName: selected.value?.name ?? 'Reto Método SK',
  })
})
</script>

<template>
  <div class="compra">
    <header class="compra__top">
      <RouterLink to="/" class="compra__marca">
        <span class="compra__mark">SK</span>
        <span>Método SK</span>
      </RouterLink>
      <RouterLink to="/" class="compra__volver">← Volver al reto</RouterLink>
    </header>

    <main class="compra__main">
      <div class="compra__pasos">
        <div class="compra__intro">
          <p class="compra__eyebrow">Inscripción</p>
          <h1 class="compra__titulo">Asegura tu lugar en el reto</h1>
        </div>

        <p v-if="errorLink" class="compra__aviso" role="alert">
          {{ errorLink }} El precio que ves es el normal.
        </p>

        <section class="paso" aria-labelledby="paso-reto">
          <h2 id="paso-reto" class="paso__titulo"><span class="paso__num">1</span> Elige tu reto</h2>
          <RetoOpciones v-model="eleccion" :disabled="status === 'paying'" />
        </section>

        <section class="paso" :class="{ 'paso--bloqueado': !selected }" aria-labelledby="paso-datos">
          <h2 id="paso-datos" class="paso__titulo"><span class="paso__num">2</span> Tus datos y pago</h2>

          <p v-if="!selected" class="paso__pista">Primero elige cuál de los dos retos quieres hacer.</p>

          <template v-else>
            <div v-if="status === 'paying'" class="paso__cajita">
              <p class="paso__pista">Abriendo la pasarela segura de PayPhone…</p>
              <div :id="CAJITA_ID" />
              <button type="button" class="paso__link" @click="volverAlFormulario">
                ← Corregir mis datos
              </button>
            </div>

            <div v-else-if="status === 'error'" class="paso__error">
              <p>{{ errorMessage }}</p>
              <BaseButton variant="ghost" @click="volverAlFormulario">Intentar de nuevo</BaseButton>
            </div>

            <CheckoutForm v-else :enviando="enviando" @submit="pagar" />
          </template>
        </section>
      </div>

      <CheckoutResumen class="compra__resumen" :reto="selected" />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.compra {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bone;
}

.compra__top {
  @include container;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-sm;
  padding-block: 1.1rem;
}

.compra__marca {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.compra__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: $ink;
  font-family: $font-principal;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: $cream;
}

.compra__volver {
  font-size: $text-sm;
  color: $ink-soft;

  &:hover {
    color: $ink;
  }
}

.compra__main {
  @include container;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding-bottom: $space-xl;
}

.compra__pasos {
  flex: 1 1 480px;
  display: flex;
  flex-direction: column;
  gap: $space-md;
  min-width: 0;
}

/* En escritorio el resumen queda fijo mientras se baja por el formulario. */
.compra__resumen {
  flex: 1 1 320px;
  max-width: 420px;

  @media (min-width: 900px) {
    position: sticky;
    top: 1.5rem;
  }

  // En el celular va antes de los pasos: el precio es lo primero que se busca.
  @media (max-width: 899px) {
    order: -1;
    max-width: none;
  }
}

.compra__eyebrow {
  @include eyebrow;
}

.compra__titulo {
  margin-top: 0.3rem;
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.compra__aviso {
  padding: 0.9rem 1.1rem;
  border-radius: $radius-md;
  background-color: $alert-warning-bg;
  font-size: $text-sm;
  color: #8a6410;
}

.paso {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: clamp(1.2rem, 3.5vw, 1.8rem);
  border-radius: $radius-lg;
  background-color: $cream;
  transition: opacity 0.3s $ease;
}

.paso--bloqueado {
  opacity: 0.6;
}

.paso__titulo {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.paso__num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: $ink;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 700;
  color: $cream;
}

.paso__pista {
  font-size: $text-sm;
  color: $ink-soft;
}

.paso__cajita,
.paso__error {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.paso__error p {
  font-size: $text-sm;
  color: $alert-error;
}

.paso__link {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: $text-sm;
  color: $ink-muted;
  text-decoration: underline;
  cursor: pointer;
}
</style>
