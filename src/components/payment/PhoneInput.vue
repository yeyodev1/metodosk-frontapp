<script setup lang="ts">
/**
 * Campo de teléfono con selector de país. Por defecto Ecuador.
 * Emite siempre el número en formato internacional (+593995254965).
 */
import { computed, ref, watch } from 'vue'
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

function onCountryChange(event: Event) {
  country.value = findCountry((event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="phone" :class="{ 'phone--invalid': invalid }">
    <div class="phone__country">
      <span class="phone__flag" aria-hidden="true">{{ country.flag }}</span>
      <span class="phone__dial">+{{ country.dial }}</span>
      <select
        class="phone__select"
        :value="country.code"
        aria-label="País"
        @change="onCountryChange"
      >
        <option v-for="option in COUNTRIES" :key="option.code" :value="option.code">
          {{ option.flag }} {{ option.name }} (+{{ option.dial }})
        </option>
      </select>
      <span class="phone__caret" aria-hidden="true">▾</span>
    </div>

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

.phone__country {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 0 0 auto;
  padding: 0.85rem 0.85rem;
  border: $field-border;
  border-radius: $radius-sm;
  background-color: $bone;
  cursor: pointer;
  transition:
    border-color 0.3s $ease,
    background-color 0.3s $ease;

  &:hover {
    background-color: $cream;
  }

  &:focus-within {
    border-color: $rose-deep;
    background-color: $cream;
  }
}

.phone__flag {
  font-size: 1.1rem;
  line-height: 1;
}

.phone__dial {
  font-size: $text-base;
  color: $ink;
  white-space: nowrap;
  line-height: 1;
}

.phone__caret {
  font-size: 0.65rem;
  line-height: 1;
  color: rgba($ink, 0.45);
}

/* El select real va encima, invisible: así el desplegable es el nativo del
   sistema, que en móvil se comporta mucho mejor que uno hecho a mano. */
.phone__select {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  appearance: none;
  border: none;
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
  .phone__country,
  .phone__number {
    border-color: $alert-error;
  }
}
</style>
