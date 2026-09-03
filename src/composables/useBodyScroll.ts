import { onUnmounted, watch, type Ref } from 'vue'

/**
 * Congelar el scroll del fondo mientras hay algo encima.
 *
 * Existe por dos fallas que aparecieron escribiendo `document.body.style
 * .overflow` a mano en cada modal:
 *
 * 1. **El candado se quedaba puesto.** La academia bloqueaba el scroll al
 *    abrir un curso y solo lo soltaba en su función de cerrar. En escritorio
 *    la barra lateral está siempre visible, así que bastaba con irse a "Mis
 *    pagos" con el curso abierto: el componente se desmontaba sin pasar por
 *    cerrar, y la página entera se quedaba sin poder desplazarse hasta
 *    recargar.
 *
 * 2. **Dos candados se pisaban.** Con un modal abierto sobre otro, cerrar el
 *    de arriba escribía `overflow: ''` y devolvía el scroll al fondo aunque el
 *    de abajo siguiera abierto.
 *
 * Por eso se cuentan: el scroll vuelve cuando se suelta el último, y soltarlo
 * no depende de que nadie se acuerde de llamar a nada — el desmontaje lo hace.
 */

let candados = 0
/** Lo que tenía el body antes del primer candado, para devolverlo tal cual. */
let overflowPrevio = ''

function poner() {
  if (candados === 0) {
    overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  candados += 1
}

function soltar() {
  if (candados === 0) return
  candados -= 1
  if (candados === 0) document.body.style.overflow = overflowPrevio
}

/**
 * Sigue a `activo` y suelta siempre al desmontar.
 *
 * Devuelve `soltarTodo` para los casos en que el propio componente necesita
 * abrir y cerrar sin una ref — pero lo normal es no llamarlo.
 */
export function useBodyScrollLock(activo: Ref<boolean>) {
  let puesto = false

  function sincronizar(debeEstar: boolean) {
    if (debeEstar === puesto) return
    if (debeEstar) poner()
    else soltar()
    puesto = debeEstar
  }

  watch(activo, sincronizar, { immediate: true })

  // La red de seguridad: pase lo que pase, al desmontar se suelta.
  onUnmounted(() => sincronizar(false))

  return { soltarTodo: () => sincronizar(false) }
}
