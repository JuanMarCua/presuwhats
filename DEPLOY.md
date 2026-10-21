# Deploy PresuWhats → Vercel + presuwhats.es (15 min, coste ~12 €/año dominio)

> Estado: app lista. `npm run test` 8/8 PASS. `npm run build` PASS (dist + sw.js, 23 precache). Solo falta publicar.

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

## 3. Dominio presuwhats.es en DonDominio (~12 €/año)
1. Compra `presuwhats.es` (fallback: `presupuestosburgos.es`).
2. Vercel → Project → Settings → Domains → Add `presuwhats.es` + `www.presuwhats.es` → copia los DNS (A 76.76.21.21 + CNAME cname.vercel-dns.com).
3. DonDominio → DNS → pega esos registros. Espera 5-60 min. Vercel emite SSL solo.
4. Comprueba `https://presuwhats.es/promo` en 4G + instala la PWA en un Xiaomi real.

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
Dominio ~12 €/año. Vercel Hobby 0 €. Supabase/Stripe 0 € (fase P3, solo si ≥3 pagan).
