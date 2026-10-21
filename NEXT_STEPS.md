# PresuWhats — Próximos pasos (guía para otra IA)

> **Última actualización:** 2026-10-21 · V1.2 desplegada y validada en producción
> **Repo:** `c:\Users\trama\OneDrive\Git\ProjectSelection\presuwhats`
> **Producción:** https://presuwhats.vercel.app ← **URL DEFINITIVA Y ÚNICA**
> **Dominio `presuwhats.es`: DESCARTADO.** No está registrado y no se va a comprar. Todo el SEO, canonical y docs apuntan a `.vercel.app`.
> **Stack:** Vite 8.3.4 + React 19.3.1 + TS 6 + Tailwind v4 + React Router 7 + Zustand 5 + Zod 4 + jspdf 4 + vite-plugin-pwa 2
> **Remoto Git:** `https://github.com/JuanMarCua/presuwhats.git` (rama `main`)

---

## 1. Estado actual: qué está HECHO y verificado

- ✅ **V1.2 desplegada** en producción. Último commit `41ff695` → deployment Vercel `dpl_2yES47eRqJRhhR9M8sjT64iN1eDA` en estado `READY`, SHA coincidente con `main`.
- ✅ **E2E contra producción: 47/47 PASS** (`python e2e_prod_check.py`).
- ✅ **Tests unitarios: 35/35 PASS** (`npm test`).
- ✅ **Build: OK** (`npm run build` → TS + Vite + PWA con 24 entradas precache).
- ✅ **Footer de versión correcto**: muestra `PresuWhats V1.2 · Burgos, España` (ya no `V1.1b`).
- ✅ **Sin "0" fantasma** en el Preview.
- ✅ **Precio de línea visible en móvil** (390 px).
- ✅ Scripts temporales eliminados (`_run.py`, `_dbg.py`, `_patch.py`). Solo queda `e2e_prod_check.py` versionado.

### Bugs ya corregidos — NO reintroducirlos
| Bug | Qué pasó | Fix aplicado |
|---|---|---|
| Footer decía `V1.1b` | texto desactualizado | `Landing.tsx` → `V1.2` |
| **"0" suelto bajo el Total** | `q.photosB64?.length && (...)` renderizaba el literal `0` cuando `length === 0` | `Preview.tsx` → `q.photosB64 && q.photosB64.length > 0 && (...)` |
| **Precio de línea invisible en móvil** | clase `hidden sm:block` en `LineItem` | `src/components/ui.tsx` → `shrink-0` + `whitespace-nowrap` |
| E2E petaba con `UnicodeEncodeError` | consola Windows usa cp1252 y no puede imprimir emojis | `e2e_prod_check.py` → `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` |

> ⚠️ **Lección importante:** los 3 primeros bugs eran de **producto**, no del test, y se detectaron revisando las **capturas de pantalla** (`e2e_*.png`), no por los asserts. Revisa siempre las capturas, no solo el PASS/FAIL.

---

## 2. ✅ Dominio: RESUELTO con `presuwhats.vercel.app`

**Decisión tomada:** la URL pública y definitiva de PresuWhats es **`https://presuwhats.vercel.app`**. El dominio `presuwhats.es` queda **descartado**: no está registrado, no se compra y no se delega DNS.

**Ya aplicado en el repo:**
- `public/sitemap.xml` → las 3 URLs apuntan a `https://presuwhats.vercel.app`
- `public/robots.txt` → `Sitemap: https://presuwhats.vercel.app/sitemap.xml`
- `index.html` → `<link rel="canonical" href="https://presuwhats.vercel.app/" />` añadido
- `NEXT_STEPS.md`, `DEPLOY.md`, `README.md`, `HANDOFF.md` → referencias actualizadas

**Lo que NO hay que hacer:** no comprar el dominio, no tocar nameservers, no esperar propagación DNS, no configurar redirecciones `www`.

### 2.1 Si algún día se quiere un dominio propio (opcional, futuro)
Vercel ya tiene `presuwhats.es` como alias. Si en el futuro se compra, estos son los nameservers de Vercel:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```
```powershell
$t = (Get-Content "C:\Users\trama\OneDrive\Git\gitHubToken\VercelToken.txt" -Raw).Trim()
$h = @{ Authorization = "Bearer $t" }
(Invoke-RestMethod -Uri "https://api.vercel.com/v6/domains/presuwhats.es" -Headers $h).domain.intendedNameservers
```
⚠️ Si algún día se hace, hay que actualizar **sitemap.xml, robots.txt y el canonical** de nuevo al dominio nuevo. Y ten en cuenta: `.es` exige período mínimo de 1 año + datos del titular.

### 2.2 Nota sobre el alias de Vercel
`https://presuwhats.es` sigue apareciendo como alias en la API de Vercel con `verified=true`, pero **no resuelve** (sin NS, sin A → "Host desconocido"). Es inocuo: no está enlazado desde ningún sitio del repo. Si molesta, se puede eliminar el alias en Vercel → Project → Settings → Domains → *Remove*.

---



## 3. Tareas secundarias (pendientes)

1. **Rotar el token de GitHub.** El remoto Git tiene el token **en claro** en la URL:
   `https://JuanMarCua:ghp_...@github.com/JuanMarCua/presuwhats.git`
   → Revoca ese PAT en GitHub y cambia el remoto a una URL sin credenciales (usa `git credential manager` o SSH).
2. **Fase P3 (Venta)** — es lo siguiente en `README.md`: kit de venta, ruta de Burgos, y reemplazar el paywall "honor system" (3 presupuestos gratis → botón de pago de 49 €) por **Stripe real**. Hoy `markPaid()` solo escribe `paid: true` en localStorage: es trivial de saltarse, es una demo, no una protección real.
3. **Revisar `HANDOFF.md`** — está desactualizado (dice "V1.1b DONE", "precio 99 €", "tests 8/8"). Actualizarlo a V1.2.
4. **Quitar el alias `presuwhats.es` de Vercel** (opcional): es inocuo, pero queda como alias muerto en el panel.
5. **Revisar el copy de venta**: en `Landing.tsx` hay comparativas tipo "3 días" / "45 min"; verificar que siguen siendo ciertas para el pitch.

### 3.1 Opcional: dominio propio en el futuro
Si en algún momento se quiere un `.es` o `.com` propio, ver §2.1. **No es bloqueante para nada**: la app funciona y se vende igual en `presuwhats.vercel.app`.

---

## 4. Mapa de la app (para no perderse)

### Rutas (`src/main.tsx`)
| Ruta | Componente | Notas |
|---|---|---|
| `/promo` | `Landing.tsx` (lazy) | Landing de venta, **fuera** del shell de la app |
| `/` | `Historial.tsx` | Raíz = historial (**app-first**, no landing) |
| `/nuevo` | `Nuevo.tsx` (lazy) | Wizard de **3 pasos** |
| `/p/:id` | `Preview.tsx` (lazy) | Detalle + firma + PDF + WhatsApp |
| `/ajustes` | `Ajustes.tsx` (lazy) | Perfil / IVA / backup JSON |
| `*` | `Historial.tsx` | Fallback |

> ⚠️ La landing **NO** está en `/`. Si añades rutas, no rompas este reparto: la raíz es el historial.

### Wizard `/nuevo` — 3 pasos
1. **Cliente**: nombre + teléfono (ambos **obligatorios**, validado con Zod; el teléfono necesita **≥ 9 dígitos** — si no, el guardado de Ajustes falla en silencio).
2. **Líneas**: descripciones + cantidades + precios + IVA (21 % / 10 %) + notas + fotos + plantillas + botón de voz.
3. **Vista previa** → "Crear presupuesto" → navega a `/p/:id`.

### Persistencia
- Clave de localStorage: **`presuwhats_v1`** (`STORAGE_KEY` en `src/lib/quotes.ts`).
- Zustand `persist` versión **2**, y guarda el contenido bajo la clave **`state`** dentro del JSON.
  → Ejemplo: `JSON.parse(localStorage['presuwhats_v1']).state.quotes`.
- Estado: `profile`, `quotes[]`, `paid`.
- **Todo es local-first, sin nube.** Los presupuestos viven solo en el móvil del usuario.

### Paywall
`Nuevo.tsx` bloquea la creación si `!paid && quotes.length >= 3` → tarjeta de pago único de **49 €** (honor system, sin backend).

### Landing `/promo` — asserts del E2E que dependen de copy
Si editas el texto, revisa `e2e_prod_check.py` porque hace match de strings exactos:
- precio **49 €** (y **no** debe aparecer `/mes`)
- CTA de crear / CTA de WhatsApp
- oficios de Burgos (Fontanero, Electricista, Pintor, Clima, Albañil, Cerrajero)
- disclaimer de "no es factura"
- paleta **emerald** aplicada
- footer con `PresuWhats V1.2 · Burgos, España`

---

## 5. Comandos de verificación (copiar y pegar)

```powershell
cd "c:\Users\trama\OneDrive\Git\ProjectSelection\presuwhats"

# Tests unitarios (debe dar 35/35 PASS)
npm test

# Build (debe terminar con "built in" + PWA "precache 24 entries")
npm run build

# Lint
npm run lint

# E2E contra PRODUCCIÓN (debe dar 47/47 PASS)
python e2e_prod_check.py
```

### Comprobar el estado del deployment en Vercel
```powershell
$t = (Get-Content "C:\Users\trama\OneDrive\Git\gitHubToken\VercelToken.txt" -Raw).Trim()
$h = @{ Authorization = "Bearer $t" }
(Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=presuwhats&limit=5" -Headers $h).deployments |
  Select-Object uid, state, target, @{n='sha';e={$_.meta.githubCommitSha}}
```
Espera ~60 s tras el push a que Vercel termine de construir antes de correr el E2E.

---

## 6. Credenciales y rutas útiles

| Qué | Dónde |
|---|---|
| Token de Vercel | `C:\Users\trama\OneDrive\Git\gitHubToken\VercelToken.txt` |
| Repo local | `c:\Users\trama\OneDrive\Git\ProjectSelection\presuwhats` |
| Script E2E | `e2e_prod_check.py` (en la raíz del repo) |
| Capturas E2E | `e2e_*.png` — **ignoradas por git** |
| Runbook de deploy | `DEPLOY.md` (parcialmente obsoleto, ver §3) |
| Log de handoff previo | `HANDOFF.md` (desactualizado, ver §3) |

> 🔐 **No subas nunca tokens, claves de API ni datos de pago al repo.** `.gitignore` ya excluye `.vercel`, `node_modules`, `dist` y `e2e_*.png`.

---

## 7. Gotchas (trampas conocidas)

1. **Windows / cp1252**: cualquier script Python que imprima emojis revienta con `UnicodeEncodeError`. Solución ya aplicada en `e2e_prod_check.py`: `sys.stdout.reconfigure(encoding="utf-8", errors="replace")`.
2. **`.length && ...` renderiza un "0"** en React cuando el array está vacío. Patrón seguro: `arr && arr.length > 0 && (...)`. **Aplícalo en cualquier sitio nuevo.**
3. **Los asserts E2E no detectan bugs visuales.** Mira siempre los PNG que genera el script.
4. **Tailwind v4**: los colores se definen con `oklch` en `src/index.css`; la paleta de marca es *emerald*.
5. **OneDrive + git**: si da problemas, `git config core.fscache false` y cierra el VS Code duplicado.
6. **Paywall sin backend**: `paid` es una flag en localStorage → se puede saltar desde la consola del navegador. No lo vendas como protección real hasta integrar Stripe.
7. **Sin cloud**: si el usuario pierde el móvil, pierde los presupuestos. El backup JSON (`/ajustes` → "Descargar copia JSON") es la única red de seguridad — menciónalo en el material de venta.

---

## 8. Definition of Done del proyecto

- [x] App V1.2 desplegada y estable en `presuwhats.vercel.app`
- [x] 47/47 checks E2E en producción
- [x] 35/35 tests unitarios + build verde
- [x] Bugs de versión / "0" fantasma / precio móvil corregidos
- [x] **URL pública definitiva: `presuwhats.vercel.app`** (SEO: sitemap, robots, canonical)
- [x] `DEPLOY.md` y `README.md` alineados con la URL final
- [ ] Token de GitHub rotado y remoto sin credenciales en claro
- [ ] `HANDOFF.md` actualizado a V1.2
- [ ] Fase P3: pasarela de pago real (Stripe) para el pack de 49 €

> 🎉 **No queda ningún bloqueo técnico.** El producto está vivo, validado y vendible en `https://presuwhats.vercel.app`.
