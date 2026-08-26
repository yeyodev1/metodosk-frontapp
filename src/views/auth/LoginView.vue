<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AuthShell from './AuthShell.vue'
import authService from '@/services/authService'
import { homeForRole, useSessionStore } from '@/stores/session'

const router = useRouter()
const route = useRoute()
const session = useSessionStore()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    const { token, user } = await authService.login(form.email.trim(), form.password)
    session.setSession(token, user)

    // Cada rol a su sitio; si venía de una página protegida, vuelve ahí.
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    router.replace(redirect || homeForRole(user.role))
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos entrar'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell
    eyebrow="Tu cuenta"
    title="Entra a tu reto"
    lead="Usa el correo con el que compraste."
  >
    <form class="form" novalidate @submit.prevent="onSubmit">
      <label class="field">
        <span>Correo</span>
        <input v-model="form.email" type="email" autocomplete="email" required />
      </label>

      <label class="field">
        <span>Contraseña</span>
        <input v-model="form.password" type="password" autocomplete="current-password" required />
      </label>

      <p v-if="error" class="form__error">{{ error }}</p>

      <BaseButton type="submit" size="lg" block :disabled="loading">
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </BaseButton>
    </form>

    <p class="alt">
      ¿Ya compraste y aún no creas tu contraseña?
      <RouterLink to="/registro">Créala aquí</RouterLink>
    </p>
  </AuthShell>
</template>
