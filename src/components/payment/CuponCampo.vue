<script setup lang="ts">
/**
 * El cupón dentro del formulario de pago.
 *
 * Cerrado por defecto: un campo de cupón abierto le dice a quien no tiene uno
 * que está pagando de más, y sale a buscarlo. Quien llega por el link ya lo
 * trae aplicado y solo ve la confirmación con la opción de quitarlo.
 */
import { nextTick, ref } from 'vue'
import { useCupon } from '@/composables/useCupon'

const { cupon, cargando, error, errorLink, aplicar, quitar } = useCupon()

const abierto = ref(false)
const codigo = ref('')
const campo = ref<HTMLInputElement | null>(null)

async function abrir() {
  abierto.value = true
  await nextTick()
  campo.value?.focus()
}

async function enviar() {
  if (await aplicar(codigo.value)) {
    codigo.value = ''
    abierto.value = false
  }
}
</script>

<template>
  <div class="cupon">
    <div v-if="cupon" class="cupon__aplicado" role="status">
      <span class="cupon__check" aria-hidden="true">✓</span>
      <span class="cupon__texto">
        <strong>{{ cupon.code }}</strong> aplicado · {{ cupon.percent }}% de descuento
      </span>
      <button type="button" class="cupon__quitar" @click="quitar">Quitar</button>
    </div>

    <button v-else-if="!abierto" type="button" class="cupon__abrir" @click="abrir">
      ¿Tienes un cupón de descuento?
    </button>

    <!-- Es un div y no un form: vive dentro del formulario de pago y los
         formularios no se anidan. Enter se atrapa a mano. -->
    <div v-else class="cupon__fila">
      <label class="sr-only" for="checkout-cupon">Cupón de descuento</label>
      <input
        id="checkout-cupon"
        ref="campo"
        v-model="codigo"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="Escribe tu cupón"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? 'error-cupon' : undefined"
        @keydown.enter.prevent="enviar"
      />
      <button type="button" class="cupon__aplicar" :disabled="cargando" @click="enviar">
        {{ cargando ? 'Validando…' : 'Aplicar' }}
      </button>
    </div>

    <!-- Si el cupón vino del link y falló, el aviso ya está arriba en la página. -->
    <p v-if="error && !cupon && !errorLink" id="error-cupon" class="cupon__error">{{ error }}</p>
  </div>
</template>

<style lang="scss" scoped>
.cupon {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.cupon__abrir {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: $text-sm;
  color: $rose-deep;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  @include focus-ring;
}

.cupon__aplicado {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 0.9rem;
  border: 1px dashed rgba(#4a7a45, 0.5);
  border-radius: $radius-sm;
  background-color: $alert-success-bg;
  font-size: $text-sm;
  color: #3f6a3b;
}

.cupon__check {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #4a7a45;
  color: $cream;
  font-size: 0.75rem;
}

.cupon__texto {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
}

.cupon__quitar {
  flex: none;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-muted;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: $ink;
  }

  @include focus-ring;
}

.cupon__fila {
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 0.8rem 1rem;
    border: 1px solid rgba($ink, 0.16);
    border-radius: $radius-sm;
    background-color: $bone;
    font-size: $text-base;
    transition: border-color 0.3s $ease, background-color 0.3s $ease;

    &:focus {
      outline: none;
      border-color: $rose-deep;
      background-color: $cream;
    }

    &[aria-invalid='true'] {
      border-color: $alert-error;
    }
  }
}

.cupon__aplicar {
  flex: none;
  padding: 0 1.1rem;
  border: 1px solid $ink;
  border-radius: $radius-sm;
  background-color: $ink;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $cream;
  cursor: pointer;
  transition: opacity 0.2s $ease;

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  @include focus-ring;
}

.cupon__error {
  font-size: $text-xs;
  color: $alert-error;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
