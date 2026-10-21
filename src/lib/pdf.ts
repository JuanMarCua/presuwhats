import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calcTotals, eur, type BusinessProfile, type Quote } from './quotes'

// Professional A4 PDF — Helvetica (supports ñ, accents, €)
export function generateQuotePDF(profile: BusinessProfile, quote: Quote) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const green: [number, number, number] = [22, 163, 74]
  const dark: [number, number, number] = [15, 23, 42]
  const grey: [number, number, number] = [100, 116, 139]

  // Header band
  doc.setFillColor(...green)
  doc.rect(0, 0, W, 34, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  const name = (profile.name || 'Mi negocio').slice(0, 38)
  doc.text(name, 14, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const contact = [profile.phone, profile.email, profile.cif ? `NIF ${profile.cif}` : '']
    .filter(Boolean)
    .join('  ·  ')
  doc.text(contact.slice(0, 90), 14, 20)
  doc.text('Presupuesto — no es factura. Validez 15 dias.', 14, 26)

  // Logo top-right if present
  if (profile.logoB64) {
    try {
      doc.addImage(profile.logoB64, 'JPEG', W - 44, 5, 26, 24, undefined, 'FAST')
    } catch {
      /* ignore bad logo */
    }
  }

  // Meta row
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`Presupuesto ${quote.number}`, 14, 44)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...grey)
  const fecha = new Date(quote.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(`Fecha: ${fecha}`, 14, 50)

  // Client box
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(14, 54, W - 28, 20, 2, 2, 'F')
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Cliente', 18, 61)
  doc.setFont('helvetica', 'normal')
  doc.text(`${quote.clientName}  ·  ${quote.clientPhone}`, 18, 67)

  // Lines table
  const body = quote.lines.map((l, i) => [
    String(i + 1),
    l.desc,
    String(l.qty).replace('.', ','),
    eur(l.price),
    eur(Math.round(l.qty * l.price * 100) / 100),
  ])

  autoTable(doc, {
    startY: 78,
    head: [['#', 'Descripcion del trabajo', 'Cant.', 'Precio', 'Importe']],
    body,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9, textColor: dark, cellPadding: 2.5 },
    headStyles: { fillColor: green, textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'right', cellWidth: 28 },
    },
  })

  const totals = calcTotals(quote.lines, quote.ivaRate)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? 120

  // Totals box right
  const boxX = W - 14 - 70
  doc.setFillColor(15, 23, 42)
  doc.roundedRect(boxX, finalY + 6, 70, 32, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Base imponible:`, boxX + 5, finalY + 14)
  doc.text(`IVA ${quote.ivaRate === 0.21 ? '21%' : '10%'}:`, boxX + 5, finalY + 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`TOTAL: ${eur(totals.total)}`, boxX + 5, finalY + 29)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  // right-aligned amounts
  doc.text(eur(totals.subtotal), boxX + 65, finalY + 14, { align: 'right' })
  doc.text(eur(totals.iva), boxX + 65, finalY + 20, { align: 'right' })

  // Notes + conditions
  let y = finalY + 46
  if (quote.notes) {
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Notas', 14, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const split = doc.splitTextToSize(quote.notes.slice(0, 400), W - 28)
    doc.text(split, 14, y + 5)
    y += 5 + split.length * 4 + 4
  }
  doc.setTextColor(...grey)
  doc.setFontSize(8)
  const cond = (profile.conditions || 'Presupuesto valido 15 dias. No incluye trabajos no descritos.').slice(0, 400)
  doc.text(doc.splitTextToSize(`Condiciones: ${cond}`, W - 28), 14, y)
  y += 14

  let signatureY = 282
  if (quote.photosB64?.length) {
    signatureY = y + 8
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Fotos del trabajo', 14, signatureY)
    const n = Math.min(quote.photosB64.length, 3)
    const colW = (W - 28) / 2
    const imgH = colW * 0.7
    let cx = 14
    let cy = signatureY + 6
    quote.photosB64.slice(0, 3).forEach((p, i) => {
      try {
        doc.addImage(p, 'JPEG', cx, cy, colW - 4, imgH, undefined, 'FAST')
      } catch { /* ignore bad photo */ }
      cx += colW
      if ((i + 1) % 2 === 0) { cx = 14; cy += imgH + 5 }
    })
    signatureY = cy + (n % 2 === 1 ? imgH + 8 : 6)
    if (signatureY > 272) signatureY = 272
  }

  // Signature line
  doc.setDrawColor(180)
  doc.line(14, signatureY, 90, signatureY)
  doc.line(W - 90, signatureY, W - 14, signatureY)
  doc.setFontSize(8)
  doc.text('Firma cliente / Aceptado por WhatsApp vale como confirmacion', 14, signatureY + 4)
  doc.text(profile.phone || '', W - 14, signatureY + 4, { align: 'right' })

  doc.save(`Presupuesto-${quote.number}-${quote.clientName.replace(/\s+/g, '_').slice(0, 20)}.pdf`)
}
