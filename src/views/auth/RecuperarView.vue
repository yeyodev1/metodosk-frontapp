<script setup lang="ts">
/**
 * "Olvidé mi contraseña": pide el correo y manda el enlace.
 *
 * La respuesta es la misma exista o no la cuenta. Esta pantalla no puede
 * servir para averiguar quién compró, así que no confirma ni niega nada:
 * "si ese correo tiene cuenta, te mandamos un enlace".
 */
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AuthShell from './AuthShell.vue'
import authService from '@/services/authService'

const form = reactive({ email: '' })
const loading = ref(false)
const error = ref('')
const enviado = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    enviado.value = await authService.recuperar(form.email.trim())
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos enviarlo'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell
    eyebrow="Tu cuenta"
    title="Recupera tu contraseña"
    lead="Escribe el correo con el que compraste y te mandamos un enlace para crear una nueva."
    quote="Un correo y estás de vuelta."
    quote-foot="El enlace sirve durante una hora. Revisa también la carpeta de spam."
    photo="metodosk/sk-04"
  >
    <Transition name="aviso" mode="out-in">
      <div v-if="enviado" key="listo" class="listo">
        <span class="listo__icono"><FaIcon icon="paper-plane" /></span>
        <p class="listo__title">Revisa tu correo</p>
        <p class="listo__texto">{{ enviado }}</p>
        <p class="alt">
          ¿No te llegó en unos minutos? Revisa spam o
          <button type="button" class="link" @click="enviado = ''">vuelve a pedirlo</button>.
        </p>
      </div>

      <form v-else key="form" class="form" novalidate @submit.prevent="onSubmit">
        <label class="field">
          <span>Correo</span>
          <input v-model="form.email" type="email" autocomplete="email" required autofocus />
        </label>

        <Transition name="aviso">
          <p v-if="error" class="form__error">{{ error }}</p>
        </Transition>

        <BaseButton type="submit" size="lg" block :disabled="loading">
          {{ loading ? 'Enviando…' : 'Enviarme el enlace' }}
        </BaseButton>
      </form>
    </Transition>

    <p class="alt">
      ¿La recordaste?
      <RouterLink to="/login">Volver a entrar</RouterLink>
    </p>
  </AuthShell>
</template>

<style lang="scss" scoped>
.listo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.4rem;
  border-radius: $radius-lg;
  background-color: $cream;
}

.listo__icono {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
}

.listo__title {
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.listo__texto {
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

.link {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: $wine;
  text-decoration: underline;
  cursor: pointer;
}

.aviso-enter-active,
.aviso-leave-active {
  transition:
    opacity 0.25s $ease,
    transform 0.25s $ease;
}

.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
