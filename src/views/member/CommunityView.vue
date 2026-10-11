<script setup lang="ts">
/**
 * La comunidad: el muro de logros y los puntos del reto.
 *
 * Existe para que se cuenten lo que van logrando y se animen entre ellas. Los
 * puntos son el empujón: cada clase terminada, cada foto de avance y cada
 * publicación suman, y se ven en el nivel junto al nombre, en las insignias y
 * en el ranking del mes.
 *
 * Los comentarios de cada clase siguen colgando de su video: una duda de la
 * sentadilla sirve ahí, no acá. Pero también suman puntos.
 */
import { onMounted, ref } from 'vue'
import communityService, {
  type MensajeComunidad,
  type MiPerfil,
  type MisPuntos,
} from '@/services/communityService'
import ComunidadCompositor from '@/components/community/ComunidadCompositor.vue'
import ComunidadMuro from '@/components/community/ComunidadMuro.vue'
import MisPuntosCard from '@/components/community/MisPuntosCard.vue'
import RankingCard from '@/components/community/RankingCard.vue'
import ComoSumarCard from '@/components/community/ComoSumarCard.vue'
import AvatarPicker from '@/components/community/AvatarPicker.vue'
import { COMUNIDAD } from '@/config/comunidad'
import { useSessionStore } from '@/stores/session'
import '@/plugins/icons'

const session = useSessionStore()
const perfil = ref<MiPerfil | null>(null)
const puntos = ref<MisPuntos | null>(null)
const muro = ref<InstanceType<typeof ComunidadMuro> | null>(null)
const aviso = ref('')
let avisoReloj: ReturnType<typeof setTimeout> | null = null

const puntosPorPublicar = () =>
  puntos.value?.reglas.find((r) => r.accion === 'publicacion')?.puntos ?? 0

async function cargarPuntos() {
  try {
    puntos.value = await communityService.puntos()
  } catch {
    // Sin puntos el muro funciona igual; las tarjetas simplemente no salen.
  }
}

/** Publicó: entra al muro arriba y se le dice cuánto sumó. */
async function publicado(post: MensajeComunidad) {
  muro.value?.agregar(post)
  const antes = puntos.value?.yo?.total ?? 0
  await cargarPuntos()
  const ganados = (puntos.value?.yo?.total ?? 0) - antes
  if (ganados > 0) mostrarAviso(`¡Publicado! Sumaste +${ganados} puntos 🎉`)
  else mostrarAviso('¡Publicado! 🎉')
}

function mostrarAviso(texto: string) {
  aviso.value = texto
  if (avisoReloj) clearTimeout(avisoReloj)
  avisoReloj = setTimeout(() => (aviso.value = ''), 4000)
}

onMounted(async () => {
  const [p] = await Promise.allSettled([communityService.miPerfil(), cargarPuntos()])
  if (p.status === 'fulfilled') perfil.value = p.value
})
</script>

<template>
  <div class="com">
    <header class="hero">
      <p class="hero__eyebrow"><FaIcon icon="comments" /> {{ COMUNIDAD.eyebrow }}</p>
      <h1 class="hero__title">{{ COMUNIDAD.titulo }}</h1>
      <p class="hero__sub">{{ COMUNIDAD.sub }}</p>

      <!-- En el teléfono las tarjetas quedan abajo: el resumen va arriba. -->
      <a v-if="puntos?.yo" href="#mis-puntos" class="resumen">
        <span class="resumen__nivel">{{ puntos.yo.nivel.nivel }}</span>
        <span>
          <strong>{{ puntos.yo.nivel.nombre }}</strong> · {{ puntos.yo.total }} pts
          <template v-if="puntos.yo.posicion"> · #{{ puntos.yo.posicion }} en {{ puntos.mes }}</template>
        </span>
        <FaIcon icon="arrow-right" />
      </a>
    </header>

    <div class="cuerpo">
      <div class="principal">
        <ComunidadCompositor
          :avatar-url="perfil?.avatarUrl"
          :inicial="perfil?.inicial"
          :puntos="session.isAdmin ? 0 : puntosPorPublicar()"
          @publicado="publicado"
        />
        <ComunidadMuro ref="muro" @cambio="cargarPuntos" />
      </div>

      <aside id="mis-puntos" class="lado">
        <MisPuntosCard v-if="puntos?.yo" :datos="puntos" />
        <p v-else-if="puntos && session.isAdmin" class="nota-admin">
          <FaIcon icon="eye" /> La administración no suma puntos: ve el ranking de las alumnas.
        </p>
        <RankingCard v-if="puntos" :datos="puntos" />
        <ComoSumarCard v-if="puntos" :datos="puntos" />
        <AvatarPicker v-if="perfil" :perfil="perfil" @actualizado="perfil = $event" />
      </aside>
    </div>

    <Transition name="aviso">
      <p v-if="aviso" class="aviso" role="status">{{ aviso }}</p>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.com {
  padding: 4.2rem clamp(1rem, 3vw, 2.5rem) 4rem;

  @include from('lg') {
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
  }
}

.hero {
  max-width: 72ch;
  margin-bottom: $space-md;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @include eyebrow;

  svg {
    font-size: 0.8em;
  }
}

.hero__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.hero__sub {
  margin-top: 0.5rem;
  font-size: $text-base;
  line-height: 1.6;
  color: $ink-soft;
}

.resumen {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.9rem;
  padding: 0.45rem 0.9rem 0.45rem 0.45rem;
  border-radius: $radius-pill;
  background-color: $ink;
  font-size: $text-xs;
  color: $cream;

  svg {
    color: $rose-soft;
  }

  @include from('xl') {
    display: none;
  }

  @include focus-ring;
}

.resumen__nivel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: $rose-soft;
  font-family: $font-display;
  color: $ink;
}

/* Dos columnas con flex-wrap: en este proyecto no se usa CSS Grid. */
.cuerpo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: $space-md;
}

.principal {
  display: flex;
  flex: 1 1 380px;
  flex-direction: column;
  gap: $space-sm;
  min-width: 0;
}

.lado {
  display: flex;
  flex: 1 1 300px;
  flex-direction: column;
  gap: $space-sm;
  min-width: 0;
  scroll-margin-top: 1rem;

  @include from('xl') {
    position: sticky;
    top: 1rem;
    max-width: 360px;
  }
}

.nota-admin {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-xs;
  color: $ink-soft;
}

.aviso {
  position: fixed;
  bottom: max(1.2rem, env(safe-area-inset-bottom));
  left: 50%;
  z-index: 250;
  padding: 0.75rem 1.2rem;
  border-radius: $radius-pill;
  background-color: $ink;
  box-shadow: $shadow-lg;
  font-size: $text-sm;
  font-weight: 600;
  color: $cream;
  white-space: nowrap;
  transform: translateX(-50%);
}

.aviso-enter-active,
.aviso-leave-active {
  transition: opacity 0.3s $ease, transform 0.3s $ease;
}

.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}

@include reduced-motion {
  .aviso-enter-active,
  .aviso-leave-active {
    transition: none;
  }
}
</style>
