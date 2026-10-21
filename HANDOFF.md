# PresuWhats — Handoff Log (for any AI to catch on)
Last updated: 2026-10-21 V1.1b DONE (fotos en PDF + firma cliente + paywall 49€, build+tests GREEN) | Project dir: c:\Users\trama\OneDrive\Git\ProjectSelection\presuwhats\ | Stack: Vite 8.3.4 + React 19.3.1 + TS 6 + Tailwind v4 + Router 7 + Zustand 5 + Zod 4 + jspdf 4 + PWA | Verify: npm run --prefix ./presuwhats test (9/9 PASS) + npm run --prefix ./presuwhats build (PASS, PWA 24 entries)

## DONE P1 this session (competitive polish)
1. Icons real: python PIL generated public/icon-192.png (1489B) + icon-512.png + apple-touch-icon.png + favicon-32.png (brand green rounded + white sheet + euro badge). public/favicon.svg rewritten 662B (was 9522B vite leftover). Deleted public/icons.svg + src/App.tsx/css + src/assets (dead).
2. index.html SEO Burgos: favicon-32 + apple-touch, keywords fontanero/electricista/pintor/reformas Burgos, OG es_ES, mobile-web-app-capable, title | Burgos.
3. vite.config manifest icons any+maskable + svg.
4. Perf: main.tsx lazy(Nuevo/Preview/Ajustes/Landing) + Suspense fallback; Preview PDF dynamic import lib/pdf (chunk pdf-432KB separate, main 362KB). Build chunks: index 362KB, html2canvas 199KB (TODO: remove dep unused?), purify 29KB, Nuevo 13KB, Preview 6.9KB, Landing 5.6KB, Ajustes 5.1KB.
5. Landing /promo DONE (Burgos dark hero + mock presupuesto 180,29 + 3 pasos + comparativa Antes/Con + precio 99 pago unico + WhatsApp demo link + RGPD footer).
6. Preview competitive: shareNative navigator.share + fallback copy, duplicate (new number nextQuoteNumber, status pendiente) + nav to copy, import nextQuoteNumber fixed TS2741.
7. Layout InstallBanner: useInstallPrompt beforeinstallprompt + iOS hint + dismiss; lib/install.ts created.
8. vercel.json SPA rewrites + security headers + icon cache; public/robots.txt.
9. Verified: tests 8/8 PASS, build PASS 23 precache 1210KB.

Closed P1 2026-10-20 night: sitemap.xml + copy fix albahil + Historial demo button (grifo 180,29) + JSON-LD SEO + DEPLOY.md runbook + build PASS. NEXT: deploy real (git+GitHub+Vercel+presuwhats.es) then P2 SELL phase (kit venta + ruta Burgos). Deps note: html2canvas+purify are transitive of jspdf4 — keep.

## DONE V1.1b (fotos en PDF + firma cliente + paywall 49€) — 2026-10-21

1. `src/lib/pdf.ts`: `generateQuotePDF` embebe hasta 3 fotos del trabajo (2 columnas) antes de la línea de firma; la línea de firma se desplaza dinámicamente para no salirse del A4.
2. `src/pages/Preview.tsx`: canvas de firma cliente (pointer events, guardar/limpiar), se persiste en `quote.signatureB64` vía `updateQuote` y se muestra en la hoja.
3. `src/store.ts`: añade `paid: boolean` + `markPaid(v)` (persist versión 2). Paywall: tras 3 presupuestos gratis, `Nuevo.tsx` bloquea `onCreate` y muestra tarjeta de pago único **49 €** (sin backend, honor system local-first).
4. `src/pages/Landing.tsx`: precio de lanzamiento **49 €** (era 99 €).
5. `src/pages/Nuevo.tsx`: chequeo `!paid && quotes.length >= 3` antes de crear; paywall inline con botón pagar.

Next: deploy real (git+GitHub+Vercel+presuwhats.es) then P2 SELL phase.

## DONE earlier (PHASE P0 start = First Section)

## DONE this session (PHASE P0 start = First Section)

### P0-01 Scaffold + stack [DONE]
Steps finished:
1. `npm create vite@latest presuwhats -- --template react-ts` (Vite 8.3.4, React 19.3.1, TS ~6.0.3). Note: create-vite 9.3.1 prompts for linter (picked ESLint) + install now (Yes). Non-interactive next time: use `echo y |` or `--no-interactive` if available.
2. Installed prod: tailwindcss@4 + @tailwindcss/vite, react-router-dom@7, zustand@5, zod@4, jspdf@4 + jspdf-autotable@5, vite-plugin-pwa@2.
3. Installed dev: vitest@5 + @vitest/coverage-v8, jsdom@29, @testing-library/react+jest-dom+user-event, prettier.
4. Configured `vite.config.ts`: uses `defineConfig` from `vitest/config` (not vite) to get `test` field typed; PWA manifest es-ES green #16a34a, icons /icon-192.png + /icon-512.png (TODO: generate real PNGs in P1-01, currently 404 but build passes), workbox precache js/css/html/png/svg.
5. Fixed TS strict issues: type-only imports for BusinessProfile/Quote (verbatimModuleSyntax), test-setup minimal (jest-dom types via vite, no side-effect import that breaks tsc).
6. Added `test` + `test:watch` scripts to package.json.
7. Verified: `npm run build` PASS (dist + sw.js + workbox generated), `npm run test` 8/8 PASS.

Files created:
- presuwhats/vite.config.ts (PWA + vitest jsdom)
- presuwhats/src/test-setup.ts
- presuwhats/src/lib/quotes.ts (Zod schemas BusinessProfile/QuoteLine, IVA 0.1/0.21, calcTotals round2, eur es-ES, normalizePhoneES 34 prefix, waLink/waNewQuoteText/waReminderText, STORAGE_KEY presuwhats_v1)
- presuwhats/src/lib/quotes.test.ts (8 tests: totals, IVA10, rounding, empty, eur, phone 34, wa.me)
- presuwhats/src/store.ts (zustand persist BusinessProfile+Quote[], defaultProfile, nextQuoteNumber 2026-001)

### P0-02 Design system + layout + Mis datos [DONE 2026-10-20]
Steps finished:
1. Replaced src/index.css with Tailwind v4 `@import "tailwindcss"` + @theme brand green + btn-big/input-big 48px + print CSS.
2. index.html es-ES, title PresuWhats, meta description Burgos, theme-color, viewport-fit cover.
3. src/components/Layout.tsx: max-w-md mobile shell, green header, sticky bottom nav Historial/Nuevo/Mis datos with NavLink active.
4. src/lib/image.ts resizeImageToDataURL canvas max 512px jpeg 0.8, fallback 256px if >280KB.
5. src/pages/Ajustes.tsx full Mis datos form: name/cif/phone/email/logo/IVA toggle/conditions, Zod safeParse errors ES, persist zustand, saved toast, RGPD footer.
6. Placeholders Historial.tsx + Nuevo.tsx (real build in P0-03..P0-05).
7. src/main.tsx BrowserRouter + Routes / /nuevo /ajustes. Deleted App.tsx usage (App.tsx + App.css still on disk unused — delete in P1 cleanup).
8. Verified: test 8/8 PASS, build PASS (CSS 22KB, JS 354KB, PWA 7 entries).

### Still TODO in First Section (P0-03..P0-05) — next AI start here
DONE 2026-10-20 EVENING (this continue, detailed rebuild):
- P0-03 DONE: pages/Nuevo.tsx full 3-step wizard (1 Cliente con validacion + repetir cliente, 2 Trabajo con plantillas TRADE_TEMPLATES 6 oficios + COMMON_EXTRAS + stepper qty/price + IVA Segmented + notas + sticky totals bar, 3 Revisar con resumen + crear). lib/templates.ts created. store.addQuote now auto-increments profile.nextNumber. Build PASS.
- P0-04 DONE: pages/Preview.tsx route /p/:id (sheet pro con logo+cliente+lineas+totales oscuros+condiciones, acciones WhatsApp wa.me 34 + PDF + imprimir + copiar + recordatorio 48h, mark sentAt/remindedAt, estado pendiente/aceptado/rechazado). lib/pdf.ts generateQuotePDF A4 verde/negro, tabla autotable, totales, firma, nombre archivo Presupuesto-NUM-CLIENTE.pdf. main.tsx route p/:id added. Layout hideNav on /p/. Build PASS.
- P0-05 DONE: pages/Historial.tsx full (hero onboarding 60s + 3 bullets si 0 quotes, stats este mes/aceptados, buscador, filtros todos/pend/acep/rech, cards con total+estado+dias, acciones recordatorio/marcar/borrar confirm 2-tap, export CSV ; Excel-ES, + Nuevo). pages/Ajustes.tsx polished (logo upload card + quitar, ui.tsx Field/Input/Segmented, backup JSON download, RGPD local-only). Tests 8/8 PASS, build PASS 10 precache entries (~1.2MB por jspdf, code-split TODO P1).
- Files now: components/ui.tsx (Card/Btn/Field/Input/Textarea/Segmented/Empty/Toast), components/Layout.tsx premium (sticky header + Nuevo pill + fixed bottom nav + safe-area), index.css (rise anim + totals-bar + print-sheet), lib/pdf.ts, lib/templates.ts, store.ts (nextNumber auto), main.tsx (+Preview route).
- Next AI: start PHASE P1 (P1-01 icons+polish+Lighthouse, P1-02 landing, P1-03 Vercel+domain, P1-04 QA). P1 icons: generate public/icon-192.png + icon-512.png + favicon.svg wrench green.

## How to continue (commands)
- `npm run --prefix ./presuwhats test` (expect 8 pass)
- `npm run --prefix ./presuwhats build` (expect dist + PWA)
- `npm run --prefix ./presuwhats dev` then open http://localhost:5173
- Masterplan CURRENT is DOING P0-01 -> next update to DONE P0-01, DOING P0-02 on next continue.

## Decisions / gotchas
- D05: vite.config uses vitest/config import to satisfy tsc strict. Don't revert to vite import.
- D06: Tailwind v4 (via @tailwindcss/vite) not v3 — use `@import "tailwindcss"` in index.css, no tailwind.config.js needed.
- D07: React 19 + react-router 7 — use createBrowserRouter or BrowserRouter, test with StrictMode.
- D08: jspdf 4.x API ESM — import { jsPDF } from 'jspdf'; import autoTable from 'jspdf-autotable' (function form, not prototype).
- Env: Win10 + Node 24.14.1 + npm 11.12.1, OneDrive path with spaces — always quote paths, use --prefix ./presuwhats.
