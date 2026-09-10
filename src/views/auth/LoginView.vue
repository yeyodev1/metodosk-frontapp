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
/** Ver lo que se escribe: la mitad de los "no me deja entrar" son un dedo mal puesto. */
const verPassword = ref(false)

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
    lead="Con el correo que usaste al pagar."
    quote="Tu reto sigue donde lo dejaste."
    quote-foot="Entrenamiento y nutrición de 3 meses, por Scarlet Córdova y Karen López."
    photo="metodosk/sk-04"
  >
    <form class="form" novalidate @submit.prevent="onSubmit">
      <label class="field">
        <span>Correo</span>
        <input v-model="form.email" type="email" autocomplete="email" required />
      </label>

      <label class="field">
        <span>Contraseña</span>
        <div class="pass">
          <input
            v-model="form.password"
            :type="verPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="pass__ojo"
            :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="verPassword = !verPassword"
          >
            <FaIcon :icon="verPassword ? 'eye-slash' : 'eye'" />
          </button>
        </div>
      </label>

      <p class="olvide">
        <RouterLink to="/recuperar">¿Olvidaste tu contraseña?</RouterLink>
      </p>

      <Transition name="aviso">
        <p v-if="error" class="form__error">{{ error }}</p>
      </Transition>

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

<style lang="scss" scoped>
/* El ojo va dentro del campo, a la derecha, sin romper el ancho del input. */
.pass {
  position: relative;
  display: block;

  input {
    width: 100%;
    padding-right: 3rem;
  }
}

.pass__ojo {
  position: absolute;
  top: 50%;
  right: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border: none;
  border-radius: 50%;
  background: none;
  color: $ink-muted;
  cursor: pointer;
  transform: translateY(-50%);
  transition: color 0.2s $ease;

  &:hover {
    color: $ink;
  }

  @include focus-ring;
}

.olvide {
  margin-top: -0.4rem;
  text-align: right;
  font-size: $text-xs;

  a {
    color: $wine;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
}
</style>
