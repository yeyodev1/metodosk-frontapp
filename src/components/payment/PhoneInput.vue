<script setup lang="ts">
/**
 * Campo de teléfono con selector de país. Por defecto Ecuador.
 * Emite siempre el número en formato internacional (+593995254965).
 */
import { computed, ref, watch } from 'vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  detectCountry,
  findCountry,
  formatNational,
  toE164,
  type Country,
} from './phone'

const props = defineProps<{
  id: string
  invalid?: boolean
  describedBy?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const country = ref<Country>(DEFAULT_COUNTRY)
const raw = ref('')

const placeholder = computed(() =>
  country.value.code === 'EC' ? '99 525 4965' : 'Tu número',
)

/**
 * Se reformatea a medida que escribe y, si pega un número con otro código de
 * país, el selector se cambia solo en vez de marcarlo como inválido.
 */
watch(raw, (value) => {
  const detected = detectCountry(value, country.value)
  if (detected) country.value = detected
  const formatted = formatNational(value, country.value)
  if (formatted !== value) raw.value = formatted
  emit('update:modelValue', toE164(raw.value, country.value))
})

watch(country, () => {
  emit('update:modelValue', toE164(raw.value, country.value))
})

/**
 * Los países como opciones del selector propio.
 *
 * En el botón solo caben bandera y prefijo; el nombre completo va en la lista,
 * que es donde de verdad se elige.
 */
const OPCIONES = COUNTRIES.map((c) => ({
  value: c.code,
  label: `${c.flag} ${c.name}`,
  hint: `+${c.dial}`,
  short: `${c.flag} +${c.dial}`,
}))

const codigo = computed({
  get: () => country.value.code,
  set: (code: string) => {
    country.value = findCountry(code)
  },
})
</script>

<template>
  <div class="phone" :class="{ 'phone--invalid': invalid }">
    <BaseSelect v-model="codigo" :options="OPCIONES" class="phone__country" />

    <input
      :id="props.id"
      v-model="raw"
      class="phone__number"
      type="tel"
      inputmode="tel"
      autocomplete="tel-national"
      :placeholder="placeholder"
      :aria-invalid="invalid"
      :aria-describedby="describedBy"
    />
  </div>
</template>

<style lang="scss" scoped>
/* Los estilos de .field input viven scoped en CheckoutForm, así que no llegan
   hasta acá: se replican para que el campo se vea igual que los demás. */
$field-border: 1px solid rgba($ink, 0.16);

.phone {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

/* El botón del selector se iguala al campo de al lado: son un solo control
   partido en dos, y si no comparten alto y borde se nota. */
.phone__country {
  flex: 0 0 auto;

  :deep(.sel__trigger) {
    padding: 0.85rem 0.9rem;
    border: $field-border;
    border-radius: $radius-sm;
    background-color: $bone;
    font-size: $text-base;

    &:hover {
      background-color: $cream;
    }
  }

  :deep(.sel__trigger:focus-visible) {
    border-color: $rose-deep;
    background-color: $cream;
  }
}

.phone__number {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.85rem 1rem;
  border: $field-border;
  border-radius: $radius-sm;
  background-color: $bone;
  font-size: $text-base;
  font-family: inherit;
  color: $ink;
  transition:
    border-color 0.3s $ease,
    background-color 0.3s $ease;

  &::placeholder {
    color: rgba($ink, 0.35);
  }

  &:focus {
    outline: none;
    border-color: $rose-deep;
    background-color: $cream;
  }
}

.phone--invalid {
  .phone__number {
    border-color: $alert-error;
  }

  .phone__country :deep(.sel__trigger) {
    border-color: $alert-error;
  }
}
</style>
