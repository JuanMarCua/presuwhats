"""Validacion E2E de PresuWhats V1.2 contra produccion (https://presuwhats.vercel.app).

Flujos: /promo (landing) -> /nuevo (wizard 3 pasos: cliente, lineas+IVA+fotos+notas,
preview+crear) -> /p/:id (firma, PDF, WhatsApp, recordatorio, duplicar) ->
/historial (filtros, CSV, estadisticas) -> /ajustes (perfil, IVA, backup).
"""
import json
import re
import sys

# La consola de Windows usa cp1252 y no puede imprimir emojis: forzamos UTF-8.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

from playwright.sync_api import sync_playwright

BASE = "https://presuwhats.vercel.app"
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (" | " + str(detail) if detail else ""))
    return ok


def fill_first(page, selectors, value):
    for sel in selectors:
        loc = page.locator(sel)
        n = loc.count()
        for i in range(n):
            try:
                loc.nth(i).fill(value)
                return True
            except Exception:
                continue
    return False


def part_landing(page):
    page.goto(BASE + "/promo", wait_until="networkidle")
    page.wait_for_timeout(800)
    check("landing /promo carga", "PresuWhats" in page.title(), page.title())
    body = page.inner_text("body")
    check("landing precio 49 EUR", "49" in body and ("EUR" in body or "\u20ac" in body))
    check("landing pago unico sin '/mes'",
          not re.search(r"\d+\s*(EUR|\u20ac)?\s*/\s*mes", body, re.I))
    check("landing CTA crear", body.count("presupuesto") >= 3)
    check("landing oficios Burgos",
          all(k in body for k in ["Fontanero", "Electricista", "Pintor"]))
    check("landing CTA WhatsApp", page.locator('a[href*="wa.me"]').count() > 0)
    check("landing disclaimer no facturas", "no facturas" in body.lower())
    emerald = page.evaluate("""() => {
        const els = Array.from(document.querySelectorAll('*'));
        let n = 0;
        els.forEach(e => { const c = getComputedStyle(e).color + '|' +
            getComputedStyle(e).backgroundColor; if (c.includes('16, 185, 129') ||
            c.includes('5, 150, 105') || c.includes('4, 120, 87') ||
            c.includes('oklch(0.596 0.145 163.225)') ||
            c.includes('oklch(0.7 0.17 162') || c.includes('oklch(0.6 0.13 163')) n++; });
        return n; }""")
    check("landing aplica paleta emerald", emerald > 5, "elementos=" + str(emerald))
    ow = page.evaluate("() => document.documentElement.scrollWidth - "
                       "document.documentElement.clientWidth")
    check("landing sin overflow (390px)", ow <= 1, "overflow=" + str(ow))
    page.screenshot(path="e2e_landing.png", full_page=True)


def part_nuevo(page):
    page.goto(BASE + "/nuevo", wait_until="networkidle")
    page.wait_for_timeout(800)
    nb = page.inner_text("body")
    check("nuevo renderiza paso 1", "Cliente" in nb or "Presupuesto" in nb,
          nb[:80].replace("\n", " "))
    ok_name = fill_first(page, ['input[placeholder*="Ej: J" i]', 'input[placeholder*="nombre" i]',
                                'input[name="clientName"]'], "Cliente E2E")
    ok_tel = fill_first(page, ['input[placeholder*="647" i]', 'input[type="tel"]',
                               'input[name="clientPhone"]'], "600123456")
    check("nuevo acepta nombre y telefono", ok_name and ok_tel,
          "nombre=%s tel=%s" % (ok_name, ok_tel))
    cont = page.locator('button:has-text("Continuar")')
    if cont.count() == 0:
        cont = page.locator('button[type="submit"]')
    if cont.count() > 0:
        cont.first.click()
        page.wait_for_timeout(600)
    check("nuevo avanza a paso 2 (lineas)", "IVA" in page.inner_text("body"),
          page.inner_text("body")[:70].replace("\n", " "))
    # --- IVA 10/21 ---
    body2 = page.inner_text("body")
    has_iva = "IVA" in body2
    seg21 = page.locator('button:has-text("21"), [role="radio"]:has-text("21")')
    seg10 = page.locator('button:has-text("10"), [role="radio"]:has-text("10")')
    check("paso 2 ofrece IVA 10 y 21", has_iva and seg21.count() > 0 and seg10.count() > 0,
          "21=%d 10=%d" % (seg21.count(), seg10.count()))
    if seg21.count() > 0:
        seg21.first.click()
        page.wait_for_timeout(300)

    # --- lineas: descripcion (textarea) y precio (2do input numerico) ---
    ta = page.locator("textarea[data-line-key]")
    desc = False
    if ta.count() > 0:
        ta.first.fill("Cambiar grifo cocina")
        desc = True
    price = False
    nums = page.locator('input[inputmode="decimal"]')
    if nums.count() >= 2:
        nums.nth(1).fill("85")
        nums.nth(1).dispatch_event("input")
        price = True
    page.wait_for_timeout(400)
    check("paso 2 acepta linea (desc + precio)", desc and price,
          "desc=%s price=%s (inputs num=%d)" % (desc, price, nums.count()))

    # --- extras / notas / fotos ---
    b2 = page.inner_text("body")
    check("paso 2 tiene notas", "nota" in b2.lower())
    check("paso 2 tiene fotos", page.locator('input[type="file"]').count() > 0)
    check("paso 2 tiene extras/plantillas", "extra" in b2.lower() or "plantilla" in b2.lower())

    # microraton de voz (Web Speech)
    check("paso 2 tiene boton de voz",
          page.locator('button:has-text("🎙")').count() > 0)

    cont2 = page.locator('button:has-text("Continuar"), '
                         'button:has-text("Vista previa"), '
                         'button:has-text("Siguiente"), '
                         'button:has-text("Revisar")')
    if cont2.count() > 0:
        cont2.first.click()
        page.wait_for_timeout(600)
    b3 = page.inner_text("body")
    check("nuevo llega a paso 3 (vista previa)", "Total" in b3 or "Vista previa" in b3,
          b3[:70].replace("\n", " "))

    # --- crear ---
    created = False
    for sel in ['button:has-text("Crear presupuesto")', 'button:has-text("Crear")',
                'button[type="submit"]']:
        b = page.locator(sel)
        if b.count() == 0:
            continue
        try:
            b.first.click()
            page.wait_for_timeout(1500)
            if "/p/" in page.url:
                created = True
                break
        except Exception:
            pass
    check("crea presupuesto y navega a /p/:id", created, page.url)
    page.screenshot(path="e2e_nuevo.png", full_page=True)
    return created


def part_preview(page):
    pb = page.inner_text("body")
    check("preview muestra cliente", "Cliente E2E" in pb)
    check("preview muestra IVA 21", "21" in pb)
    check("preview muestra total EUR", "\u20ac" in pb or "EUR" in pb)
    wa = page.locator('a[href*="wa.me"]')
    check("preview link WhatsApp wa.me", wa.count() > 0)
    if wa.count() > 0:
        href = wa.first.get_attribute("href") or ""
        check("wa.me con prefijo 34", "wa.me/34" in href, href[:60])
        check("wa.me con texto prellenado", "text=" in href)
    check("preview canvas de firma", page.locator("canvas").count() > 0)
    check("preview boton PDF",
          page.locator('button:has-text("PDF"), a:has-text("PDF")').count() > 0)
    check("preview boton recordatorio",
          page.locator('button:has-text("Recordar"), '
                       'button:has-text("Recordatorio"), '
                       'a:has-text("Recordatorio")').count() > 0)
    check("preview boton duplicar",
          page.locator('button:has-text("Duplicar")').count() > 0)
    ls = page.evaluate("() => localStorage.getItem('presuwhats_v1')")
    check("persistencia localStorage", ls is not None and len(ls) > 10,
          len(ls) if ls else 0)
    if ls:
        data = json.loads(ls)
        dump = json.dumps(data)
        st = data.get("state", data)
        qs = st.get("quotes", [])
        check("quote persistido con IVA 21",
              any(q.get("ivaRate") == 0.21 for q in qs),
              str(len(qs)) + " quotes, claves=" + str(list(st.keys())))
        check("modelo con firma/fotos", "signatureB64" in dump or "photosB64" in dump)
    page.screenshot(path="e2e_preview.png", full_page=True)


def part_historial(page):
    page.goto(BASE + "/historial", wait_until="networkidle")
    page.wait_for_timeout(800)
    hb = page.inner_text("body")
    check("historial lista presupuesto", "Cliente E2E" in hb)
    check("historial buscador", page.locator(
        'input[type="search"], input[placeholder*="uscar" i]').count() > 0)
    check("historial exporta CSV",
          page.locator('button:has-text("CSV"), a:has-text("CSV"), '
                       '[role="button"]:has-text("CSV")').count() > 0)
    check("historial estadisticas",
          "\u20ac" in hb or "Total" in hb or "Aceptados" in hb)
    check("historial badge local-first", "Local-first" in hb or "m\u00f3vil" in hb)
    page.screenshot(path="e2e_historial.png", full_page=True)


def part_ajustes(page):
    page.goto(BASE + "/ajustes", wait_until="networkidle")
    page.wait_for_timeout(800)
    ab = page.inner_text("body")
    check("ajustes renderiza", "Datos" in ab or "Perfil" in ab or "Empresa" in ab,
          ab[:70].replace("\n", " "))
    check("ajustes IVA por defecto", "IVA" in ab)
    check("ajustes backup/export", "Copia" in ab or "Export" in ab or "Backup" in ab)
    check("ajustes logo", "logo" in ab.lower() or "Logo" in ab)
    page.screenshot(path="e2e_ajustes.png", full_page=True)
    ok = fill_first(page, ['#name', 'input[id="name"]',
                           'input[placeholder*="Fontaner" i]'], "Taller E2E")
    ok_tel = fill_first(page, ['#phone', 'input[id="phone"]',
                               'input[placeholder*="647" i]'], "600123456")
    save = page.locator('button:has-text("Guardar")')
    if save.count() > 0:
        save.first.click()
        page.wait_for_timeout(700)
    ls2 = page.evaluate("() => localStorage.getItem('presuwhats_v1')")
    check("ajustes persiste en localStorage",
          ls2 is not None and "Taller E2E" in ls2,
          "nombre=%s tel=%s" % (ok, ok_tel))
    check("ajustes muestra badge Guardado",
          page.locator('text=Guardado').count() > 0)


def part_desktop(page):
    page.set_viewport_size({"width": 1280, "height": 900})
    for path, name in [("/promo", "promo"), ("/", "historial")]:
        page.goto(BASE + path, wait_until="networkidle")
        page.wait_for_timeout(600)
        ow = page.evaluate("() => document.documentElement.scrollWidth - "
                           "document.documentElement.clientWidth")
        check("sin overflow 1280px en " + name, ow <= 1, "overflow=" + str(ow))
    page.screenshot(path="e2e_desktop.png", full_page=True)


def main():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 390, "height": 844},
                                  device_scale_factor=2, locale="es-ES")
        page = ctx.new_page()
        page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        page.on("console", lambda m: errors.append("console.error: " + m.text)
                if m.type == "error" else None)
        part_landing(page)
        if part_nuevo(page):
            part_preview(page)
            part_historial(page)
            part_ajustes(page)
        part_desktop(page)
        browser.close()
    real = [e for e in errors if "favicon" not in e.lower()]
    check("sin errores JS en consola", len(real) == 0, "; ".join(real[:4]))
    passed = sum(1 for _, ok, _ in results if ok)
    print("\n=== RESUMEN: {}/{} PASS ===".format(passed, len(results)))
    for nme, ok, det in results:
        if not ok:
            print("  FALLO: " + nme + " | " + str(det))
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
