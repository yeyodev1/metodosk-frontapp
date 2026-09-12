<script setup lang="ts">
/**
 * Tu guía de nutrición.
 *
 * Es el PDF de Karen convertido en pantalla: se lee en el teléfono, se busca
 * por secciones y no hay archivo que reenviar. Lo que se muestra depende del
 * reto —déficit para recomposición, superávit para volumen— y eso lo decide el
 * servidor, no esta vista.
 */
import { computed, onMounted, ref } from 'vue'
import GuiaMenu from '@/components/member/GuiaMenu.vue'
import GuiaTabla from '@/components/member/GuiaTabla.vue'
import GuiaFichas from '@/components/member/GuiaFichas.vue'
import guiaService, { type Guia } from '@/services/guiaService'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const guias = ref<Guia[]>([])
const cargando = ref(true)
const error = ref('')
const elegida = ref(0)

const guia = computed<Guia | null>(() => guias.value[elegida.value] ?? null)

const SECCIONES = [
  { id: 'menu', nombre: 'Menú' },
  { id: 'snacks', nombre: 'Snacks' },
  { id: 'plato', nombre: 'Arma tu plato' },
  { id: 'intercambios', nombre: 'Intercambios' },
  { id: 'condimentos', nombre: 'Condimentos' },
  { id: 'compras', nombre: 'Compras' },
  { id: 'mealprep', nombre: 'Meal prep' },
  { id: 'suplementos', nombre: 'Suplementos' },
]

const snacksComoFichas = computed(() =>
  (guia.value?.snacks ?? []).map((s) => ({
    titulo: s.titulo || `Opción ${s.numero}`,
    items: s.items,
  })),
)

const condimentosComoFichas = computed(() =>
  (guia.value?.condimentos ?? []).map((c) => ({
    titulo: c.proteina,
    items: c.items,
    pie: c.tip,
  })),
)

function irA(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(async () => {
  try {
    guias.value = await guiaService.mias()
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'No pudimos abrir tu guía.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="guia">
    <p v-if="cargando" class="aviso">Abriendo tu guía…</p>
    <p v-else-if="error" class="aviso">{{ error }}</p>
    <p v-else-if="!guia" class="aviso">Todavía no hay una guía para tu reto.</p>

    <template v-else>
      <header class="cab">
        <p class="cab__eyebrow">{{ guia.reto }}</p>
        <h1 class="cab__title">{{ guia.titulo }}</h1>
        <p v-for="p in guia.intro" :key="p" class="cab__texto">{{ p }}</p>

        <div v-if="guias.length > 1" class="cab__cambio">
          <button
            v-for="(g, i) in guias"
            :key="g.audiencia"
            type="button"
            class="cab__reto"
            :class="{ 'cab__reto--activo': i === elegida }"
            @click="elegida = i"
          >
            {{ g.reto }}
          </button>
        </div>
      </header>

      <nav class="nav" aria-label="Secciones de la guía">
        <button v-for="s in SECCIONES" :key="s.id" type="button" @click="irA(s.id)">
          {{ s.nombre }}
        </button>
      </nav>

      <section class="bloque">
        <h2 class="bloque__title">Cómo usar tu menú</h2>
        <ul class="reglas">
          <li v-for="r in guia.comoUsar" :key="r">{{ r }}</li>
        </ul>
      </section>

      <section id="menu" class="bloque">
        <h2 class="bloque__title">Tu menú de la semana</h2>
        <GuiaMenu :dias="guia.dias" :dias-de-pierna="guia.diasDePierna" />
      </section>

      <section id="snacks" class="bloque">
        <h2 class="bloque__title">Ideas de snacks</h2>
        <p class="bloque__sub">Son opcionales. Inclúyelos según tu día.</p>
        <GuiaFichas :fichas="snacksComoFichas" numeradas />
      </section>

      <section id="plato" class="bloque">
        <h2 class="bloque__title">Arma tu plato</h2>
        <p class="bloque__sub">{{ guia.armaTuPlato.intro }}</p>
        <ol class="pasos">
          <li v-for="(p, i) in guia.armaTuPlato.pasos" :key="p.titulo">
            <span class="pasos__num">{{ i + 1 }}</span>
            <span class="pasos__cuerpo">
              <strong>{{ p.titulo }}</strong>
              <span class="pasos__texto">{{ p.texto }}</span>
              <span class="pasos__porcion">{{ p.porcion }}</span>
            </span>
          </li>
        </ol>
        <div class="ejemplo">
          <p class="ejemplo__title">Un ejemplo</p>
          <p v-for="e in guia.armaTuPlato.ejemplo" :key="e">{{ e }}</p>
        </div>
      </section>

      <section id="intercambios" class="bloque">
        <h2 class="bloque__title">Equivalencias y sustituciones</h2>
        <p class="bloque__sub">
          Para variar sin salirte de tu objetivo: cambia dentro del mismo grupo y respeta la porción.
        </p>
        <div class="tablas">
          <GuiaTabla v-for="t in guia.tablas" :key="t.id" :tabla="t" />
        </div>
      </section>

      <section id="condimentos" class="bloque">
        <h2 class="bloque__title">Condimentos por proteína</h2>
        <ul class="reglas">
          <li v-for="t in guia.tipsCondimentos" :key="t">{{ t }}</li>
        </ul>
        <GuiaFichas :fichas="condimentosComoFichas" />
      </section>

      <section id="compras" class="bloque">
        <h2 class="bloque__title">Lista de compras</h2>
        <p class="bloque__sub">{{ guia.listaCompras.nota }}</p>
        <ul class="chips">
          <li v-for="c in guia.listaCompras.categorias" :key="c">{{ c }}</li>
        </ul>
        <p class="ayuda">{{ guia.listaCompras.ayuda }}</p>
      </section>

      <section id="mealprep" class="bloque">
        <h2 class="bloque__title">Meal prep</h2>
        <GuiaFichas :fichas="guia.mealPrep" />
      </section>

      <section id="suplementos" class="bloque">
        <h2 class="bloque__title">Suplementación</h2>
        <p class="bloque__sub">
          Debe individualizarse según tu alimentación, tus antecedentes y, cuando corresponda,
          exámenes y valoración profesional.
        </p>
        <article v-for="s in guia.suplementos" :key="s.nombre" class="supl">
          <h3 class="supl__nombre">{{ s.nombre }}</h3>
          <p class="supl__label">¿Para quién puede ser útil?</p>
          <ul class="supl__lista">
            <li v-for="q in s.paraQuien" :key="q">{{ q }}</li>
          </ul>
          <p class="supl__label">¿Cuándo tomarlo?</p>
          <p class="supl__texto">{{ s.cuando }}</p>
          <p class="supl__precaucion"><FaIcon icon="circle-exclamation" /> {{ s.precaucion }}</p>
        </article>
      </section>

      <p class="firma">
        Tu copia de la guía · {{ session.user?.email }} — es tuya, no la compartas.
      </p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.guia {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  padding-bottom: $space-lg;
}

.aviso {
  padding: 2rem 0;
  font-size: $text-sm;
  color: $ink-muted;
}

.cab__eyebrow {
  @include eyebrow;
}

.cab__title {
  margin-top: 0.35rem;
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.cab__texto {
  max-width: 62ch;
  margin-top: 0.6rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

.cab__cambio {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.9rem;
}

.cab__reto {
  padding: 0.45rem 1rem;
  border: 1px solid $sand;
  border-radius: $radius-pill;
  background-color: transparent;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-soft;
  cursor: pointer;
}

.cab__reto--activo {
  border-color: $ink;
  background-color: $ink;
  color: $cream;
}

.nav {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  gap: 0.4rem;
  margin: 0 -1rem;
  padding: 0.6rem 1rem;
  overflow-x: auto;
  background-color: rgba($bone, 0.92);
  backdrop-filter: blur(8px);

  button {
    flex: none;
    padding: 0.4rem 0.9rem;
    border: none;
    border-radius: $radius-pill;
    background-color: $cream;
    font-family: inherit;
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-soft;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
      background-color: $sand;
    }
  }
}

.bloque {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  scroll-margin-top: 4rem;
}

.bloque__title {
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.bloque__sub {
  max-width: 62ch;
  margin-top: -0.3rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.reglas {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  list-style: none;

  li {
    padding-left: 0.9rem;
    border-left: 2px solid $clay;
    font-size: $text-xs;
    line-height: 1.55;
    color: $ink-soft;
  }
}

.tablas {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.pasos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;

  li {
    display: flex;
    gap: 0.8rem;
    padding: 0.9rem 1.1rem;
    border-radius: $radius-md;
    background-color: $cream;
  }
}

.pasos__num {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: $ink;
  font-size: 0.72rem;
  font-weight: 600;
  color: $cream;
}

.pasos__cuerpo {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  strong {
    font-size: $text-sm;
    color: $ink;
  }
}

.pasos__texto {
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.pasos__porcion {
  margin-top: 0.2rem;
  font-size: $text-xs;
  font-weight: 600;
  color: $rose-deep;
}

.ejemplo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
  border-radius: $radius-md;
  background-color: $sand;

  p {
    font-size: $text-xs;
    line-height: 1.55;
    color: $ink-soft;
  }
}

.ejemplo__title {
  font-family: $font-display;
  font-size: $text-sm;
  color: $ink !important;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;

  li {
    padding: 0.4rem 0.85rem;
    border-radius: $radius-pill;
    background-color: $cream;
    font-size: $text-xs;
    color: $ink;
  }
}

.ayuda {
  padding-left: 0.9rem;
  border-left: 2px solid $rose;
  font-size: $text-xs;
  line-height: 1.55;
  color: $ink-muted;
}

.supl {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem 1.1rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.supl__nombre {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.supl__label {
  margin-top: 0.4rem;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $ink-muted;
}

.supl__lista {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  list-style: none;

  li {
    font-size: $text-xs;
    line-height: 1.5;
    color: $ink-soft;
  }
}

.supl__texto {
  font-size: $text-xs;
  line-height: 1.55;
  color: $ink-soft;
}

.supl__precaucion {
  display: flex;
  gap: 0.45rem;
  margin-top: 0.5rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $wine;

  svg {
    flex: none;
    margin-top: 0.2em;
  }
}

.firma {
  padding-top: 1rem;
  border-top: 1px solid $sand;
  font-size: $text-xs;
  color: $ink-muted;
}
</style>
