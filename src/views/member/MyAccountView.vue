<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import authService from '@/services/authService'
import { useSessionStore } from '@/stores/session'
import { BRAND } from '@/config/site'

const session = useSessionStore()

const user = computed(() => session.user)
const cambiando = ref(false)
const passForm = reactive({ current: '', next: '', repeat: '' })
const passError = ref('')
const passOk = ref('')
const guardando = ref(false)

const accesoHasta = computed(() => {
  const iso = user.value?.accessUntil
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const diasRestantes = computed(() => {
  const iso = user.value?.accessUntil
  if (!iso) return null
  const dias = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
  return dias > 0 ? dias : 0
})

async function guardarPassword() {
  if (passForm.next !== passForm.repeat) {
    passError.value = 'Las contraseñas no coinciden'
    return
  }
  guardando.value = true
  passError.value = ''
  passOk.value = ''
  try {
    session.user = await authService.changePassword(passForm.current, passForm.next)
    passOk.value = 'Contraseña actualizada.'
    passForm.current = passForm.next = passForm.repeat = ''
    cambiando.value = false
  } catch (e: unknown) {
    passError.value = (e as { message?: string }).message ?? 'No pudimos cambiarla'
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  if (!session.user) await session.restore()
  // Si entró con la contraseña del correo, se le sugiere cambiarla.
  if (session.user?.mustChangePassword) cambiando.value = true
})
</script>

<template>
  <main class="cuenta">
    <header class="cuenta__head">
      <div>
        <p class="cuenta__eyebrow">Método SK</p>
        <h1 class="cuenta__title">Hola{{ user?.name ? `, ${user.name.split(' ')[0]}` : '' }}</h1>
      </div>
    </header>

    <section v-if="user?.accessActive" class="acceso">
      <p class="acceso__badge">Acceso activo</p>
      <h2 class="acceso__reto">{{ user.challenge || 'Tu reto' }}</h2>
      <p class="acceso__hasta">
        Hasta el <strong>{{ accesoHasta }}</strong>
        <span v-if="diasRestantes !== null"> · te quedan {{ diasRestantes }} días</span>
      </p>
    </section>

    <section v-else class="acceso acceso--off">
      <p class="acceso__badge acceso__badge--off">Sin acceso vigente</p>
      <p class="acceso__hasta">
        Tu acceso terminó<span v-if="accesoHasta"> el {{ accesoHasta }}</span>. Puedes volver a
        entrar comprando de nuevo.
      </p>
      <BaseButton href="/#precio">Ver el reto</BaseButton>
    </section>

    <section class="bloque">
      <h3 class="bloque__title">Tus datos</h3>
      <dl class="datos">
        <div><dt>Correo</dt><dd>{{ user?.email }}</dd></div>
        <div v-if="user?.name"><dt>Nombre</dt><dd>{{ user.name }}</dd></div>
      </dl>
    </section>

    <section class="bloque">
      <div class="bloque__row">
        <h3 class="bloque__title">Contraseña</h3>
        <button v-if="!cambiando" type="button" class="link" @click="cambiando = true">
          Cambiar
        </button>
      </div>

      <Transition name="aviso">
        <p v-if="user?.mustChangePassword" class="aviso-clave">
          Estás usando la contraseña que te enviamos por correo. Cámbiala por una tuya.
        </p>
      </Transition>
      <Transition name="aviso">
        <p v-if="passOk" class="ok">{{ passOk }}</p>
      </Transition>

      <Transition name="aviso">
        <form v-if="cambiando" class="form" novalidate @submit.prevent="guardarPassword">
        <label class="field">
          <span>Contraseña actual</span>
          <input v-model="passForm.current" type="password" autocomplete="current-password" required />
        </label>
        <label class="field">
          <span>Nueva contraseña</span>
          <input v-model="passForm.next" type="password" autocomplete="new-password" required />
          <span class="hint">Mínimo 8 caracteres.</span>
        </label>
        <label class="field">
          <span>Repite la nueva</span>
          <input v-model="passForm.repeat" type="password" autocomplete="new-password" required />
        </label>
          <p v-if="passError" class="error">{{ passError }}</p>
          <div class="acciones">
          <BaseButton type="submit" :disabled="guardando">
            {{ guardando ? 'Guardando…' : 'Guardar' }}
          </BaseButton>
            <button type="button" class="link" @click="cambiando = false">Cancelar</button>
          </div>
        </form>
      </Transition>
    </section>

    <section class="bloque">
      <h3 class="bloque__title">¿Necesitas algo?</h3>
      <p class="bloque__text">
        Escríbenos por WhatsApp y te ayudamos con tu plan de entrenamiento y nutrición.
      </p>
      <BaseButton variant="ghost" :href="BRAND.whatsapp">Escribir por WhatsApp</BaseButton>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.cuenta {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  max-width: 620px;
  margin-inline: auto;
  padding: clamp(1.5rem, 6vw, 3rem) 1.25rem;
  padding-top: clamp(4.2rem, 8vw, 3rem);
}

.cuenta__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cuenta__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.cuenta__title {
  font-family: $font-display;
  font-size: clamp(1.6rem, 6vw, 2.1rem);
  color: $ink;
}

.acceso {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: clamp(1.3rem, 5vw, 1.8rem);
  border-radius: $radius-lg;
  background-color: $ink;
  color: $cream;
}

.acceso--off {
  background-color: $cream;
  color: $ink;
}

.acceso__badge {
  padding: 0.25rem 0.7rem;
  border-radius: $radius-pill;
  background-color: rgba($rose-soft, 0.25);
  color: $rose-soft;
  font-size: $text-xs;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.acceso__badge--off {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}

.acceso__reto {
  font-family: $font-display;
  font-size: clamp(1.6rem, 6vw, 2rem);
}

.acceso__hasta {
  font-size: $text-sm;
  opacity: 0.85;
}

.bloque {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: clamp(1.2rem, 4vw, 1.6rem);
  border-radius: $radius-md;
  background-color: $cream;
}

.bloque__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.bloque__title {
  font-family: $font-display;
  font-size: 1.15rem;
  color: $ink;
}

.bloque__text {
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

.datos {
  display: flex;
  flex-direction: column;

  > div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 0.5rem;
    border-bottom: 1px solid rgba($ink, 0.07);

    &:last-child {
      border-bottom: none;
    }
  }

  dt {
    font-size: $text-sm;
    color: $ink-muted;
  }

  dd {
    margin: 0;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;
    text-align: right;
    word-break: break-all;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  span {
    font-size: $text-xs;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $ink-muted;
  }

  input {
    padding: 0.8rem 1rem;
    border: 1px solid rgba($ink, 0.16);
    border-radius: $radius-sm;
    background-color: $bone;
    font-family: inherit;
    font-size: $text-base;
    color: $ink;

    &:focus {
      outline: none;
      border-color: $rose-deep;
    }
  }
}

.hint {
  font-size: $text-xs;
  color: $ink-muted;
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: 400 !important;
}

.acciones {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.link {
  background: none;
  border: none;
  font-size: $text-sm;
  color: $rose-deep;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.aviso-clave {
  padding: 0.8rem 1rem;
  border-radius: $radius-sm;
  background-color: rgba($rose-soft, 0.35);
  font-size: $text-sm;
  color: $ink;
}

.ok {
  font-size: $text-sm;
  color: #1b7f4d;
}

.error {
  font-size: $text-sm;
  color: $alert-error;
}
</style>
