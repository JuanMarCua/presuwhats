# Deploy PresuWhats → Vercel (presuwhats.vercel.app)

> Estado: **DESPLEGADO en produccion** en https://presuwhats.vercel.app. `npm test` 35/35 PASS, `npm run build` PASS (PWA 24 precache), E2E 47/47 PASS. Este runbook queda como referencia para redeploys y para el dia que se quiera anadir dominio propio.

## 1. Subir a GitHub (2 min, en tu PC)
```powershell
cd "c:\Users\trama\OneDrive\Git\ProjectSelection\presuwhats"
git init; git add -A; git commit -m "PresuWhats P1 ready"
gh repo create presuwhats --public --source=. --push
# sin gh: crea repo en github.com/new y:
# git remote add origin https://github.com/TUUSER/presuwhats.git; git branch -M main; git push -u origin main
```

## 2. Vercel (3 min, gratis)
1. vercel.com → Add New Project → Import `presuwhats`.
2. Framework: Vite. Build: `npm run build`. Output: `dist`. (vercel.json ya trae rewrites SPA + headers).
3. Deploy → te da `https://presuwhats.vercel.app`. Comprueba en el móvil:
   - `/` → botón "Ver ejemplo" abre preview 180,29 €.
   - `/nuevo` wizard 3 pasos <60s.
   - `/p/xxx` → WhatsApp + PDF + Compartir + Duplicar.
   - `/promo` landing para el QR del flyer.
   - Banner "Instalar" (Android) / hint iPhone.

## 3. Dominio (OPCIONAL — no bloquea nada)
La app vive y se vende en **https://presuwhats.vercel.app**. No hace falta dominio propio.

Si en el futuro se quiere uno:
1. Compra el dominio en un registrar (DonDominio ~12 €/año; `.es` exige 1 año mínimo + datos del titular).
2. Vercel → Project → Settings → Domains → Add `<tu-dominio>` + `www`.
3. En el registrar, cambia los **nameservers** a los de Vercel (no A/CNAME sueltos):
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. Espera 5-60 min. Vercel emite el SSL solo.
5. **Actualiza a la vez** `public/sitemap.xml`, `public/robots.txt` y el `<link rel="canonical">` de `index.html`.
6. Comprueba `https://<tu-dominio>/promo` en 4G + instala la PWA en un Xiaomi real.

## 4. Checklist QA Burgos (5 min, antes del primer bar)
- [ ] Mis datos: nombre + teléfono 9 dígitos + logo JPG <280KB → Guardado.
- [ ] Nuevo: plantilla fontanero + 2 líneas + IVA 21% → total correcto (85+64=149 base, IVA 31,29, total 180,29).
- [ ] Preview: wa.me abre con `34` + texto, PDF se llama `Presupuesto-2026-XXX-MARIA.pdf` y trae logo + "no es factura".
- [ ] Historial: buscador, filtros, recordatorio ámbar ≥2d, CSV abre en Excel con `;`.
- [ ] Offline: modo avión → recarga → la app abre (SW precache 23 ficheros).
- [ ] iPhone + Android: banner instalar, safe-area abajo no tapa botones.

## 5. Si algo falla
| Síntoma | Fix |
|---|---|
| 404 en /promo al recargar | vercel.json rewrites → redeploy |
| Icono no instala | icon-192/512 servidos + manifest (ya OK), probar en Chrome Android → ⋮ → Instalar |
| PDF en blanco | jspdf chunk lazy: espera "Generando..." 1-2s en 4G |
| wa.me sin 34 | normalizePhoneES: mete 9 dígitos, no +34 |
| OneDrive bloquea git | `git config core.fscache false`, cierra VS Code duplicado |

## 6. Coste
Vercel Hobby 0 € (URL actual). Dominio opcional ~12 €/año. Stripe solo si ≥3 pagando (fase P3).
