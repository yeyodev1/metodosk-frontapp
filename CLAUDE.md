# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Método SK — landing de venta

Landing de una sola página para vender el **Reto Método SK** (3 meses de entrenamiento + nutrición) de Scarlet Córdova. Vue 3 + Vite + TypeScript + Pinia + vue-router, SCSS puro. Sin backend todavía: el checkout corre en modo simulación.

## Comandos

```bash
pnpm dev              # servidor de desarrollo
pnpm build            # vue-tsc -b && vite build (el type-check corre acá, no hay lint aparte)
pnpm preview          # sirve dist/
pnpm media:prepare    # baja las fotos originales de ~/Downloads a .media-build (sips, 2400px q80)
pnpm media:upload     # sube .media-build a Cloudinary y REGENERA src/config/media.ts
```

No hay suite de tests. La verificación es `pnpm build` + revisión en navegador.

## Reglas duras de este proyecto

- **Ningún archivo `.vue` pasa de 400 líneas.** Si una sección crece, se parte en subcomponente (`ChallengeCard` fuera de `ChallengesSection`, `FaqItem` fuera de `FaqSection`).
- **Prohibido CSS Grid.** Todo el layout es flexbox. Para "grillas" usar el mixin `flex-cards($basis, $gap)` de `src/styles/_mixins.scss`.
- **Nada de librerías UI ni Tailwind.** SCSS propio con los tokens de `src/styles/`.
- Las imágenes siempre pasan por `components/ui/CldImage.vue` — nunca un `<img>` con URL de Cloudinary escrita a mano.
- El copy vive en `src/config/site.ts`, no dentro de los componentes.

## Arquitectura

**El copy es configuración.** `src/config/site.ts` concentra todos los textos (hero, retos, FAQ, precios). `src/config/photos.ts` asigna cada foto del shoot a su rol en la página con su `alt` real. Los componentes solo consumen y pintan.

**Media.** `src/config/media.ts` lo **genera** `scripts/upload-cloudinary.mjs` — no editar a mano (se sobrescribe). `photos.ts` sí es manual y se apoya en el helper `photo('sk-13')`. Las URLs se arman en `src/composables/useCloudinary.ts` (`cldImage`, `cldSrcset`, `cldBlur`, `cldVideo`, `cldPoster`), siempre con `f_auto,q_auto,dpr_auto`.

**SCSS.** `vite.config.ts` inyecta `@use "@/styles/index.scss" as *` al inicio de **cada** bloque `<style lang="scss">`. Por eso `index.scss` solo puede exponer variables, funciones y mixins: cualquier CSS que emita se duplicaría en todos los componentes. El reset, las custom properties y `.reveal` viven en `global.scss`, importado una vez desde `main.ts`. Las fuentes se cargan con `<link>` en `index.html`.

**Animación de entrada.** Directiva global `v-reveal` (registrada en `main.ts`, definida en `composables/useScrollReveal.ts`): un solo `IntersectionObserver` compartido, con `v-reveal="150"` para retrasar. Respeta `prefers-reduced-motion`.

**Checkout.** Estado compartido en `composables/useCheckout.ts` (estado de módulo, no Pinia): cualquier sección llama `open(retoId)` y abre el mismo modal `components/payment/PayphoneCheckout.vue`, que se monta una sola vez en `App.vue`.

## PayPhone — Cajita de Pagos

Doc: https://docs.payphone.app/cajita-de-pagos

- `VITE_PAYPHONE_MODE` controla todo. **`simulation` (default) no contacta a PayPhone ni descarga su SDK**: el checkout hace el recorrido y redirige a `/pago/resultado?status=simulated`. `live` renderiza la cajita real.
- **Todos los montos van en centavos y como enteros**, y debe cumplirse `amount = amountWithoutTax + amountWithTax + tax + service + tip`. Acá el precio es final sin IVA desglosado, así que todo va en `amountWithoutTax` (ver `composables/usePayphone.ts`).
- Precios en `src/config/payment.ts`: pre-venta 6700, regular 8700.
- PayPhone redirige a `/pago/resultado` con `id` y `clientTransactionId`. **Si no se confirma vía `POST /api/confirm` en 5 minutos, PayPhone reversa la transacción.** Esa confirmación necesita el token secreto → tiene que vivir en el backend. `src/services/paymentService.ts` ya tiene la firma apuntando a nuestro API; el frontend nunca debe llamar a PayPhone directamente para confirmar.

## Variables de entorno

Las `CLOUDINARY_*` (sin prefijo `VITE_`) solo las leen los scripts de Node y nunca entran al bundle. Las `VITE_*` sí quedan expuestas en el navegador — el token de PayPhone lo está por diseño de la Cajita, el `api_secret` de Cloudinary jamás debe llevar prefijo `VITE_`.

## Meta — Pixel + Conversions API

Dataset (pixel) `838529302614239`. La medición sale por **dos caminos a la vez**: `fbq` en el navegador y la Conversions API desde el backend, siempre con el **mismo `event_id`**. Meta deduplica y se queda con uno solo — sin eso cada venta se contaría dos veces.

- `src/config/meta.ts` — id del pixel (público) y `purchaseEventId()`. El **token de la CAPI no va acá ni con prefijo `VITE_`**: vive solo en `metodosk-backapp` (`META_CAPI_TOKEN`), porque con él se pueden inyectar conversiones falsas en la cuenta publicitaria.
- `src/composables/useMetaPixel.ts` — carga el snippet y `trackMeta(nombre, opciones)`. Cada llamada dispara `fbq` y copia el evento a `POST /api/meta/event`, que lo reenvía firmado. `keepalive: true`, no `sendBeacon`: la petición es cross-origin con `Content-Type: application/json` y exige preflight, que `sendBeacon` no sabe hacer.
- `src/services/apiUrl.ts` — `resolveApiBaseUrl()` salió de `httpBase.ts` para que la landing resuelva la URL del API sin arrastrar axios al bundle.

Dónde se dispara cada evento:

| Evento | Dónde | Cuándo |
|---|---|---|
| `PageView` | `router.afterEach` | cada navegación (en una SPA el pixel solo vería la primera) |
| `ViewContent` | `HomeView.vue` | al montar la landing — es la página del producto |
| `InitiateCheckout` | `useCheckout.open()` | ahí pasan **todos** los CTA de compra |
| `Lead` | `PayphoneCheckout.submit()` | único punto con nombre, correo y WhatsApp reales |
| `AddPaymentInfo` | `PayphoneCheckout.submit()` | justo antes de abrir la Cajita |
| `Purchase` | `PaymentResultView` + `payphone.service.ts` | id derivado de `clientTransactionId` en los dos lados |
| `CompleteRegistration` | `RegisterView.vue` | la compradora activó su acceso |

**Purchase es la excepción:** lo manda el servidor desde `confirmTransaction`, con el monto que PayPhone confirmó. El navegador lo reporta con `mirror: false` para no duplicar el espejo. `POST /api/meta/event` **rechaza `Purchase`** a propósito — si lo aceptara, cualquiera podría inyectar compras falsas de $10.000 y desviar la optimización de la campaña.

**Nada entra al dataset desde previews ni túneles.** El front se apaga con `VITE_META_PIXEL_ENABLED=false` y el backend descarta todo lo que no venga de un origen de producción (`resolveEnvironment`). Un embudo de pruebas desviaría una campaña real, y eso no se deshace.

---

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
