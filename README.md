# PresuWhats

Presupuestos para oficios en el móvil, en 60 segundos. Sin registro, sin nube, sin mensualidad.

## ¿Qué es?

PresuWhats es una **PWA local-first** para autónomos y pequeños oficios (fontaneros, electricistas, pintores, reformistas…) de Burgos y alrededores. Generas presupuestos profesionales desde el móvil, incluso en la obra sin cobertura, y los envías por WhatsApp al instante.

Todo queda en tu dispositivo: clientes, trabajos, fotos y firmas se guardan en el navegador (localStorage). No hay servidor ni cuenta que crear.

## Características (V1.1)

- **Dictado por voz** (es-ES): describe cada línea de trabajo y las notas hablando, ideal con guantes en la obra.
- **Fotos adjuntas** (máx. 3 por presupuesto): captura con la cámara, compresión automática <300 KB, previsualización.
- **Firma del cliente**: firma en pantalla sobre el presupuesto; se guarda con el documento.
- **PDF profesional**: hoja A4 con tu logo, líneas, totales, IVA 10/21%, fotos embebidas y línea de firma.
- **WhatsApp**: envío directo con texto pre-redactado y recordatorio automático a los 2 días.
- **Historial**: buscador, filtros por estado (pendiente/aceptado/rechazado), exportación CSV para tu gestoría.
- **Local-first**: badge 🔒 en la app. Tus datos no salen del móvil.

## Precio

**Pago único de 49 €** (lanzamiento Burgos). Los primeros 3 presupuestos son gratis. Sin mensualidad, sin letras pequeñas.

## Tecnología

Vite 8 + React 19 + TypeScript + Tailwind v4 + Zustand (persist) + jspdf + PWA (Workbox). Despliegue en Vercel.

## Cómo ejecutar localmente

```bash
cd presuwhats
npm install
npm run dev
```

Luego abre http://localhost:5173

Para build de producción:

```bash
npm run build      # tsc + vite + PWA service worker
npm run test       # vitest (9/9)
```

## Estructura del proyecto

```
presuwhats/
├── src/
│   ├── lib/
│   │   ├── quotes.ts       # Zod schemas, cálculo totales, enlaces WhatsApp
│   │   ├── pdf.ts          # Generación PDF A4 con fotos y firma
│   │   ├── image.ts        # Compresión JPEG canvas (máx 1200 px, q 0.75)
│   │   ├── voice.ts        # Web Speech API es-ES + MicButton
│   │   └── templates.ts    # Plantillas por oficio
│   ├── pages/
│   │   ├── Nuevo.tsx       # Wizard 3 pasos: cliente, trabajo, revisar
│   │   ├── Preview.tsx     # Hoja de presupuesto, WhatsApp, PDF, firma
│   │   ├── Historial.tsx   # Listado, filtros, export CSV
│   │   ├── Ajustes.tsx     # Mis datos del negocio, logo, backup JSON
│   │   └── Landing.tsx     # Página de presentación y precio
│   ├── components/ui.tsx   # Card, Btn, Field, Input, Textarea, Segmented, Toast
│   ├── store.ts            # Zustand persist (profile, quotes, paid)
│   └── main.tsx            # Router + lazy loading
├── public/                 # Iconos PWA, favicon
├── vercel.json             # SPA rewrites + headers
├── vite.config.ts          # PWA + vitest jsdom
└── package.json
```

## Roadmap

- ✅ V1.1a: voz + fotos + badge local-first
- ✅ V1.1b: fotos en PDF + firma cliente + paywall 49 €
- ✅ V1.2: rediseño emerald orientado a conversión + landing `/promo`
- ✅ Deploy a producción: **https://presuwhats.vercel.app**
- 🔲 Venta: 20 demos, gate ≥3 pagadores → pasarela Stripe real
- 🔲 Opcional: dominio propio `.es`/`.com` (ver `NEXT_STEPS.md` §2.1)

## Licencia

Uso interno / lanzamiento Burgos. Contacto: WhatsApp demo desde la landing.

---

*Desarrollado con asistencia de IA, 2 horas/día, sin backend hasta validar ventas.*
