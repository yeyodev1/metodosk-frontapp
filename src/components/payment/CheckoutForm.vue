<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { validateContact, type CheckoutContact, type CheckoutErrors } from './checkout'
import PhoneInput from './PhoneInput.vue'
import { PAYMENT_MODE } from '@/config/payment'

const emit = defineEmits<{ submit: [contact: CheckoutContact] }>()

const form = reactive<CheckoutContact>({ name: '', email: '', phone: '' })
const errors = ref<CheckoutErrors>({})

/** El teléfono tiene su propio campo con selector de país. */
const FIELDS = [
  { key: 'name', label: 'Nombre completo', type: 'text', autocomplete: 'name' },
  { key: 'email', label: 'Correo electrónico', type: 'email', autocomplete: 'email' },
] as const

const submitted = ref(false)

/**
 * Antes del primer intento no se marca nada; después, los errores se van
 * limpiando a medida que la usuaria corrige, en vez de quedarse en rojo.
 */
watch(form, () => {
  if (submitted.value) errors.value = validateContact(form)
})

function onSubmit() {
  submitted.value = true
  errors.value = validateContact(form)
  if (Object.keys(errors.value).length === 0) emit('submit', { ...form })
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <p class="form__intro">Ahí te enviamos el acceso al reto apenas se confirme el pago.</p>

    <div v-for="field in FIELDS" :key="field.key" class="field">
      <label :for="`checkout-${field.key}`">{{ field.label }}</label>
      <input
        :id="`checkout-${field.key}`"
        v-model="form[field.key]"
        :type="field.type"
        :autocomplete="field.autocomplete"
        :aria-invalid="Boolean(errors[field.key])"
        :aria-describedby="errors[field.key] ? `error-${field.key}` : undefined"
      />
      <p v-if="errors[field.key]" :id="`error-${field.key}`" class="field__error">
        {{ errors[field.key] }}
      </p>
    </div>

    <div class="field">
      <label for="checkout-phone">WhatsApp</label>
      <PhoneInput
        id="checkout-phone"
        v-model="form.phone"
        :invalid="Boolean(errors.phone)"
        :described-by="errors.phone ? 'error-phone' : undefined"
      />
      <p v-if="errors.phone" id="error-phone" class="field__error">{{ errors.phone }}</p>
    </div>

    <BaseButton type="submit" size="lg" block>
      {{ PAYMENT_MODE === 'simulation' ? 'Simular pago' : 'Ir a pagar' }}
    </BaseButton>

    <p class="form__legal">
      Al continuar aceptas recibir el acceso y las novedades del reto en tu correo.
    </p>
  </form>
</template>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.form__intro {
  font-size: $text-sm;
  color: $ink-soft;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: $text-xs;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $ink-muted;
  }

  input {
    padding: 0.85rem 1rem;
    border: 1px solid rgba($ink, 0.16);
    border-radius: $radius-sm;
    background-color: $bone;
    font-size: $text-base;
    transition:
      border-color 0.3s $ease,
      background-color 0.3s $ease;

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

.field__error {
  font-size: $text-xs;
  color: $alert-error;
}

.form__legal {
  font-size: $text-xs;
  color: $ink-muted;
}
</style>
