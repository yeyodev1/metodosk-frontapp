<script setup lang="ts">
/**
 * Lo que la alumna necesita comprar antes de empezar.
 *
 * Es la misma lista que le llegó por correo el día de la compra. Está acá
 * porque ese correo se pierde entre todo lo demás, y esto es justo lo que se
 * va a querer releer parada en la tienda — de ahí que cada implemento tenga
 * su foto: reconocerlo en un estante es más fácil que leer su descripción.
 *
 * Los dos casos —casa y gimnasio— se muestran juntos, sin preguntar cuál es:
 * son listas cortas y una sola aplica, así que elegir cuesta menos que
 * responder una pregunta.
 */
import { GRUPOS_RECURSOS } from '@/config/recursos'
</script>

<template>
  <main class="recursos">
    <header class="recursos__head">
      <p class="recursos__eyebrow">Recursos</p>
      <h1 class="recursos__title">Lo que vas a necesitar</h1>
      <p class="recursos__sub">
        Nada más que esto. El reto está armado para que funcione con lo mínimo, así que no te
        compres media tienda antes de empezar.
      </p>
    </header>

    <section v-for="grupo in GRUPOS_RECURSOS" :key="grupo.id" class="grupo">
      <div class="grupo__head">
        <span class="grupo__icono"><FaIcon :icon="grupo.icono" /></span>
        <div class="grupo__texto">
          <h2 class="grupo__title">{{ grupo.titulo }}</h2>
          <p class="grupo__intro">{{ grupo.intro }}</p>
        </div>
      </div>

      <ul class="items">
        <li v-for="r in grupo.recursos" :key="r.nombre" class="item">
          <img class="item__foto" :src="r.foto" :alt="r.nombre" loading="lazy" />
          <div class="item__texto">
            <h3 class="item__nombre">{{ r.nombre }}</h3>
            <p class="item__detalle">{{ r.detalle }}</p>
          </div>
        </li>
      </ul>
    </section>

    <p class="recursos__nota">
      ¿Dudas con alguna medida o no consigues algo? Escríbenos por WhatsApp y lo resolvemos: casi
      siempre hay una forma de empezar con lo que ya tienes en casa.
    </p>
  </main>
</template>

<style lang="scss" scoped>
/**
 * El ancho tope es lo que hace legible esta pantalla: sin él, en un monitor
 * grande cada descripción se estira de lado a lado y se vuelve una tira de
 * texto imposible de leer.
 */
.recursos {
  max-width: 62rem;
}

.recursos__head {
  margin-bottom: $space-md;
}

.recursos__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.recursos__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.recursos__sub {
  max-width: 46ch;
  margin-top: 0.5rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

/* ── Cada forma de entrenar ── */
.grupo {
  margin-bottom: $space-md;
  padding: 1.5rem;
  border-radius: $radius-lg;
  background-color: $cream;
}

.grupo__head {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid rgba($ink, 0.08);
}

.grupo__icono {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background-color: $sand;
  color: $ink;
  font-size: 0.95rem;
}

.grupo__texto {
  min-width: 0;
}

.grupo__title {
  font-family: $font-display;
  font-size: 1.35rem;
  line-height: 1.2;
  color: $ink;
}

.grupo__intro {
  margin-top: 0.15rem;
  font-size: $text-sm;
  color: $ink-soft;
}

/* ── Los implementos ── */
.items {
  @include flex-cards(240px, 1.2rem);
  margin-top: 1.3rem;
  list-style: none;
}

.item {
  display: flex;
  flex-direction: column;
}

/**
 * Las fotos vienen de una tienda y traen fondos claros distintos entre sí.
 * El fondo blanco y el `contain` las emparejan: se ven como un catálogo y no
 * como tres capturas pegadas.
 */
.item__foto {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  border-radius: $radius-md;
  background-color: #fff;
}

.item__texto {
  padding: 0.85rem 0.2rem 0;
}

.item__nombre {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.item__detalle {
  margin-top: 0.25rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.recursos__nota {
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $sand;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}
</style>
