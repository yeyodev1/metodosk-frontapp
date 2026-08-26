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
.phone {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.phone__country {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.7rem;
  border-radius: $radius-sm;
  background-color: rgba($ink, 0.05);
  border: 1px solid transparent;
  transition: border-color 0.25s $ease, background-color 0.25s $ease;

  &:focus-within {
    border-color: $ink;
    background-color: rgba($ink, 0.07);
  }
}

.phone__flag {
  font-size: 1.15rem;
  line-height: 1;
}

.phone__dial {
  font-size: $text-sm;
  color: $ink;
  white-space: nowrap;
}

.phone__caret {
  font-size: 0.7rem;
  color: rgba($ink, 0.5);
}

/* El select real va encima, invisible: así el desplegable es el nativo
   del sistema y funciona bien en móvil. */
.phone__select {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  appearance: none;
}

.phone__number {
  flex: 1 1 auto;
  min-width: 0;
}

.phone--invalid .phone__country {
  border-color: $alert-error;
}
</style>
