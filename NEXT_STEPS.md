# PresuWhats — Próximos pasos (guía para otra IA)

> **Última actualización:** 2026-10-21 · V1.2 desplegada y validada en producción
> **Repo:** `c:\Users\trama\OneDrive\Git\ProjectSelection\presuwhats`
> **Producción:** https://presuwhats.vercel.app (alias activo) · https://presuwhats.es (**aún NO resuelto**)
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

## 2. 🔴 TAREA PRINCIPAL: registrar y activar `presuwhats.es`

**Estado:** el dominio **NO está registrado**. Verificado:
```
Resolve-DnsName presuwhats.es -Type NS  -> sin NS
Resolve-DnsName presuwhats.es -Type A   -> sin A
Invoke-WebRequest https://presuwhats.es -> "Host desconocido"
```
Vercel muestra `verified=true` en su API, pero eso es **solo por ser propietario del alias** — `configVerifiedAt`, `nsVerifiedAt` y `verificationRecord` están vacíos. **No hay delegación DNS real.**

### 2.1 Nameservers a configurar (sacados de la API de Vercel)
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```
Query para volver a confirmarlos:
```powershell
$t = (Get-Content "C:\Users\trama\OneDrive\Git\gitHubToken\VercelToken.txt" -Raw).Trim()
$h = @{ Authorization = "Bearer $t" }
(Invoke-RestMethod -Uri "https://api.vercel.com/v6/domains/presuwhats.es" -Headers $h).domain.intendedNameservers
```

### 2.2 Pasos
1. **Comprar `presuwhats.es`** en un registrar. Opciones:
   - DonDominio (~12 €/año) — es el que sugiere `DEPLOY.md`.
   - Criteria / Namecheap / Cloudflare Registrar.
   - **Requisito `.es`:** período mínimo **1 año** y datos del titular (persona física o empresa con CIF). Sin esto Red.es rechaza la compra.
   - Alternativa de reserva si no está libre: `presupuestosburgos.es` (ya está en `DEPLOY.md`).
2. **Delegar DNS**: en el panel del registrar, cambiar los nameservers del dominio a los dos de Vercel (arriba). Esto **sustituye** los NS del registrar por los de Vercel.
   - Alternativa si el registrar no permite cambiar NS: mantener sus NS y crear los registros que indica Vercel (`A 76.76.21.21` + `CNAME cname.vercel-dns.com` para `www`). **Preferir la opción de NS**, es la que Vercel espera.
3. **Añadir el dominio en Vercel**: Project → Settings → Domains → añadir `presuwhats.es` y `www.presuwhats.es`. **Ya está añadido como alias** (aparece en la API de Vercel), así que probablemente solo falte la delegación DNS.
4. **Esperar la propagación**: 5–60 min. Vercel emite el **SSL automáticamente** (Let's Encrypt) cuando ve la delegación.
5. **Validar**:
```powershell
Resolve-DnsName presuwhats.es -Type NS
Invoke-WebRequest https://presuwhats.es -UseBasicParsing    # 200
Invoke-WebRequest https://www.presuwhats.es -UseBasicParsing
```
6. **Redirección `www` → apex** (o al revés): en Vercel → Project → Settings → Domains, marca uno como "Redirect to" el otro. Recomendado: `www.presuwhats.es` → `presuwhats.es`.
7. **Actualizar `public/robots.txt` y `public/sitemap.xml`**: ya apuntan a `https://presuwhats.es` ✅ (no requiere cambios, pero verifica que la URL canónica sea la definitiva).

### 2.3 Bloqueo que te vas a encontrar
> **No se puede completar el paso 1 automáticamente**: no hay cuenta en ningún registrar ni credenciales de pago. Alguien tiene que comprar el dominio. Es la única acción que bloquea el cierre del proyecto.

---



## 3. Tareas secundarias (opcionales, post-dominio)

1. **Rotar el token de GitHub.** El remoto Git tiene el token **en claro** en la URL:
   `https://JuanMarCua:ghp_...@github.com/JuanMarCua/presuwhats.git`
   → Revoca ese PAT en GitHub y cambia el remoto a una URL sin credenciales (usa `git credential manager` o SSH).
2. **Añadir `www.presuwhats.es` a Vercel** y configurar la redirección.
3. **Fase P3 (Venta)** — es lo siguiente en `README.md`: kit de venta, ruta de Burgos, y reemplazar el paywall "honor system" (3 presupuestos gratis → botón de pago de 49 €) por **Stripe real**. Hoy `markPaid()` solo escribe `paid: true` en localStorage: es trivial de saltarse, es una demo, no una protección real.
4. **Hacer el pago real del dominio** con pasarela segura (no poner datos de tarjeta en el repo ni en un `.md`).
5. **Revisar `HANDOFF.md`** — está desactualizado (dice "V1.1b DONE", "precio 99 €", "tests 8/8"). Actualizarlo a V1.2.
6. **`DEPLOY.md` §3** dice "copia los DNS (A 76.76.21.21 + CNAME...)" — está incompleto/obsoleto: lo correcto son los **nameservers**. Corregir.

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
- [ ] Token de GitHub rotado y remoto sin credenciales en claro
- [ ] **`presuwhats.es` registrado y delegado** (NS de Vercel) ← **PENDIENTE, requiere compra**
- [ ] SSL activo en `presuwhats.es` y redirección `www` → apex
- [ ] `HANDOFF.md` y `DEPLOY.md` actualizados a V1.2
- [ ] Fase P3: pasarela de pago real (Stripe) para el pack de 49 €
