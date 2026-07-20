import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const fmt = (v, d = 2) =>
  v === "" || v === null || v === undefined
    ? "-"
    : Number(v).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

const clean = (v) => (v === "" || v === null || v === undefined ? "-" : String(v));

// Resolve a (possibly relative) logo URL to something jsPDF can embed.
function loadImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const full = url.startsWith("http") || url.startsWith("data:") ? url : window.location.origin + url;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL("image/png"), w: img.naturalWidth, h: img.naturalHeight });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = full;
  });
}

// Indian numbering → words (up to crores).
function numberToWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x) => (x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : ""));
  const three = (x) => {
    if (x === 0) return "";
    const h = Math.floor(x / 100);
    return (h ? ones[h] + " Hundred" : "") + (x % 100 ? (h ? " " : "") + two(x % 100) : "");
  };
  let str = "";
  const cr = Math.floor(n / 10000000);
  const l = n % 10000000;
  const lac = Math.floor(l / 100000);
  const th = Math.floor((l % 100000) / 1000);
  const rem = l % 1000;
  if (cr) str += three(cr) + " Crore ";
  if (lac) str += three(lac) + " Lakh ";
  if (th) str += three(th) + " Thousand ";
  if (rem) str += three(rem);
  return str.trim() + " Only";
}

export async function downloadPoPdf(id) {
  const [poRes, compRes] = await Promise.all([
    axios.get(`/api/erp/purchase/orders/${id}`),
    axios.get(`/api/settings/company`).catch(() => ({ data: {} })),
  ]);
  const po = poRes.data || {};
  const cs = compRes.data || {};

  const logo = await loadImage(cs.logo_url);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;

  const companyName = cs.company_name || "Your Company";
  const addressLines = [cs.address, [cs.phone && `Ph: ${cs.phone}`, cs.email && `Email: ${cs.email}`, cs.website && `Web: ${cs.website}`].filter(Boolean).join("  |  "), cs.gstin && `GSTIN: ${cs.gstin}`].filter(Boolean);

  // ── Header ──
  if (logo) {
    const maxH = 46;
    const ratio = logo.w / logo.h;
    let w = maxH * ratio;
    let h = maxH;
    if (w > 160) { w = 160; h = w / ratio; }
    doc.addImage(logo.dataUrl, "PNG", margin, margin, w, h);
  }
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(companyName, logo ? margin + 130 : margin, margin + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  let ay = margin + 28;
  addressLines.forEach((line) => {
    doc.text(line, logo ? margin + 130 : margin, ay);
    ay += 12;
  });

  // Title (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(21, 61, 110);
  doc.text("PURCHASE ORDER", pageW - margin, margin + 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`PO No: ${clean(po.po_no)}`, pageW - margin, margin + 30, { align: "right" });
  doc.text(`Date: ${clean(po.po_date)}`, pageW - margin, margin + 44, { align: "right" });
  doc.text(`Status: ${clean(po.status)}`, pageW - margin, margin + 58, { align: "right" });

  // Divider
  let y = Math.max(ay, margin + 70) + 6;
  doc.setDrawColor(21, 61, 110);
  doc.setLineWidth(1);
  doc.line(margin, y, pageW - margin, y);
  y += 16;

  // ── To (Vendor) ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(21, 61, 110);
  doc.text("TO:", margin, y);
  const s = po.supplier || {};
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  let ty = y + 14;
  doc.text(clean(s.supplier_name), margin, ty);
  ty += 13;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  const vendorAddr = [s.address_line1, s.address_line2, [s.city, s.state, s.pincode].filter(Boolean).join(" - ")].filter(Boolean);
  vendorAddr.forEach((line) => { doc.text(clean(line), margin, ty); ty += 12; });
  if (s.supplier_code) { doc.text(`Code: ${clean(s.supplier_code)}`, margin, ty); ty += 12; }
  if (s.gstin) { doc.text(`GSTIN: ${clean(s.gstin)}`, margin, ty); ty += 12; }
  if (s.contact_person) { doc.text(`Contact: ${clean(s.contact_person)}`, margin, ty); ty += 12; }

  // PO meta (right of To)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  let my = y + 14;
  const rightX = pageW - margin;
  doc.text(`Currency: ${clean(po.currency)}`, rightX, my, { align: "right" });
  my += 12;
  if (po.payment_terms) { doc.text(`Payment: ${clean(po.payment_terms)}`, rightX, my, { align: "right" }); my += 12; }
  if (po.delivery_terms) { doc.text(`Delivery: ${clean(po.delivery_terms)}`, rightX, my, { align: "right" }); my += 12; }

  y = Math.max(ty, my) + 14;

  // ── Items table ──
  const items = po.items || [];
  const body = items.map((it, i) => [
    String(i + 1),
    clean(it.item_code),
    clean(it.item_name),
    clean(it.uom || it.unit_id),
    fmt(it.quantity, 2),
    fmt(it.rate, 2),
    fmt(it.gst_rate, 1),
    fmt(it.amount, 2),
  ]);

  autoTable(doc, {
    head: [["Sl#", "Item Code", "Description", "UOM", "Qty", "Rate", "GST%", "Amount"]],
    body,
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 5, lineColor: [210, 210, 210], lineWidth: 0.5 },
    headStyles: { fillColor: [21, 61, 110], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { halign: "center", cellWidth: 32 },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right" },
    },
  });

  let after = doc.lastAutoTable.finalY + 16;

  // ── Totals ──
  const totals = [
    ["Subtotal", fmt(po.subtotal, 2)],
    [`Discount (${fmt(po.discount_percent, 1)}%)`, fmt(po.discount_amount, 2)],
    ["Tax (GST)", fmt(po.tax_amount, 2)],
  ];
  const tW = 220;
  const tX = pageW - margin - tW;
  doc.setFontSize(9.5);
  totals.forEach(([label, val], i) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    doc.text(label, tX, after + i * 16);
    doc.text(val, pageW - margin, after + i * 16, { align: "right" });
  });
  const gY = after + totals.length * 16 + 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(tX, gY - 6, pageW - margin, gY - 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text("Grand Total", tX, gY + 8);
  doc.text(fmt(po.grand_total, 2), pageW - margin, gY + 8, { align: "right" });

  // Amount in words
  let wy = gY + 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(21, 61, 110);
  doc.text("Amount in words:", margin, wy);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  const words = numberToWords(po.grand_total);
  const split = doc.splitTextToSize(`INR ${words}`, pageW - margin * 2 - 120);
  doc.text(split, margin + 90, wy);
  wy += split.length * 12 + 10;

  // ── Terms ──
  const terms = [];
  if (po.payment_terms) terms.push(`Payment Terms: ${po.payment_terms}`);
  if (po.delivery_terms) terms.push(`Delivery Terms: ${po.delivery_terms}`);
  if (po.notes) terms.push(`Notes: ${po.notes}`);
  if (terms.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(21, 61, 110);
    doc.text("Terms & Conditions", margin, wy);
    wy += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    terms.forEach((t) => {
      const sp = doc.splitTextToSize(t, pageW - margin * 2);
      doc.text(sp, margin, wy);
      wy += sp.length * 11;
    });
  }

  // ── Signature ──
  const sigY = Math.max(wy + 20, pageH - 110);
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, sigY, margin + 200, sigY);
  doc.line(pageW - margin - 200, sigY, pageW - margin, sigY);
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`For ${companyName}`, pageW - margin - 100, sigY - 6, { align: "center" });
  doc.text("Vendor Signature", margin + 100, sigY + 14, { align: "center" });
  doc.text("Authorized Signatory", pageW - margin - 100, sigY + 14, { align: "center" });

  // ── Footer ──
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleString("en-IN")} · This is a system-generated document.`, pageW / 2, pageH - 20, { align: "center" });

  const fileName = `${po.po_no || "PO"}.pdf`;
  doc.save(fileName);
}
