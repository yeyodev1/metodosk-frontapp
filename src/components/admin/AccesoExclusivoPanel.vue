<script setup lang="ts">
/**
 * Dar acceso exclusivo VIP sin que haya compra.
 *
 * Quedan como quien pagó en pre-venta —los dos retos y el grupo VIP— y les
 * llega el correo con su usuario y contraseña. Lo corre el servidor porque la
 * llave de Resend solo vive ahí.
 *
 * Se muestra la contraseña de cada una por si el correo no llega y hay que
 * pasársela por WhatsApp.
 */
import { computed, ref } from 'vue'
import adminService, { type ResultadoAcceso } from '@/services/adminService'

const texto = ref('')
const enviando = ref(false)
const error = ref('')
const resultados = ref<ResultadoAcceso[]>([])

const correos = computed(() =>
  texto.value
    .split(/[\s,;]+/)
    .map((c) => c.trim())
    .filter(Boolean),
)

async function dar() {
  if (!correos.value.length) return
  enviando.value = true
  error.value = ''
  try {
    resultados.value = await adminService.accesoExclusivo(correos.value)
    if (resultados.value.every((r) => r.ok && r.correoEnviado)) texto.value = ''
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'No se pudo. Intenta de nuevo.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <section class="vip">
    <div class="vip__texto">
      <h2 class="vip__title">Acceso exclusivo VIP</h2>
      <p class="vip__sub">
        Los dos retos y el grupo VIP, como si hubiera pagado en pre-venta. Le llega un correo de
        acceso exclusivo con su usuario y contraseña.
      </p>
    </div>

    <form class="vip__form" @submit.prevent="dar">
      <textarea
        v-model="texto"
        class="vip__input"
        rows="2"
        placeholder="correo1@gmail.com, correo2@hotmail.com"
        aria-label="Correos, separados por coma o espacio"
      />
      <button type="submit" class="vip__boton" :disabled="enviando || !correos.length">
        <FaIcon icon="star" />
        {{ enviando ? 'Dando acceso…' : `Dar acceso (${correos.length})` }}
      </button>
    </form>

    <p v-if="error" class="vip__error">{{ error }}</p>

    <ul v-if="resultados.length" class="vip__lista">
      <li v-for="r in resultados" :key="r.email" :class="{ 'vip__fila--mal': !r.ok || !r.correoEnviado }">
        <strong>{{ r.email }}</strong>
        <template v-if="r.ok">
          · contraseña <code>{{ r.password ?? 'la que ella ya creó' }}</code>
          · {{ r.correoEnviado ? 'correo enviado' : 'el correo NO salió' }}
        </template>
        <template v-else> · {{ r.error }}</template>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.vip {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: $space-md;
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.vip__title {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.vip__sub {
  margin-top: 0.2rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.vip__form {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0.6rem;
}

.vip__input {
  flex: 1 1 260px;
  padding: 0.6rem 0.8rem;
  border: 1px solid $sand;
  border-radius: $radius-md;
  background-color: $bone;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink;
  resize: vertical;
}

.vip__boton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $cream;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.vip__error {
  font-size: $text-xs;
  color: $wine;
}

.vip__lista {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  list-style: none;
  font-size: $text-xs;
  color: $ink-soft;

  code {
    padding: 0.05rem 0.35rem;
    border-radius: 4px;
    background-color: $bone;
    font-family: ui-monospace, Menlo, monospace;
    color: $ink;
  }
}

.vip__fila--mal {
  color: $wine;
}
</style>
