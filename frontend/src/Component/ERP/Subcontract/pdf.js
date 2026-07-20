import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY = "AUTOMOTIVE COMPONENTS LIMITED";
const ADDRESS = "Plot No. 12, Industrial Area, Pune - 411001 | GST: 27AAAAA0000A1Z5";

const DOCTYPES = {
  order: { title: "Job Work Order", noLabel: "Order No", dateLabel: "Order Date", extraLabel: "Expected Date", columns: ["Code", "Item", "Qty", "UOM", "Rate", "Amount"] },
  issue: { title: "Material Issue Slip", noLabel: "Issue No", dateLabel: "Issue Date", extraLabel: "Job Work Order", columns: ["Code", "Item", "Qty", "UOM", "Notes"] },
  receipt: { title: "Material Receipt Note", noLabel: "Receipt No", dateLabel: "Receipt Date", extraLabel: "Job Work Order", columns: ["Code", "Item", "Qty", "Accepted", "UOM", "Notes"] },
};

const fmt = (v, d = 2) => (v === "" || v === null || v === undefined ? "-" : Number(v).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }));
const clean = (v) => (v === "" || v === null || v === undefined ? "-" : String(v));

export function downloadSubcontractPdf({ type, form = {}, items = [], orderNo = "" }) {
  const meta = DOCTYPES[type] || DOCTYPES.order;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 0;

  // ── Header band ──
  doc.setFillColor(21, 61, 110);
  doc.rect(0, 0, pageW, 86, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(COMPANY, margin, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(ADDRESS, margin, 56);
  doc.setFontSize(13);
  doc.text(meta.title.toUpperCase(), pageW - margin, 40, { align: "right" });
  doc.setFontSize(9);
  doc.text(`Status: ${clean(form.status)}`, pageW - margin, 58, { align: "right" });
  doc.setTextColor(20, 20, 20);

  // ── Meta info ──
  y = 110;
  const metaLine = (label, value, x) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);
    doc.text(clean(value), x, y + 16);
  };
  metaLine(meta.noLabel, form.order_no || form.issue_no || form.receipt_no || "", margin);
  metaLine(meta.dateLabel, form.order_date || form.issue_date || form.receipt_date || "", margin + 200);
  const extraVal = meta.extraLabel === "Job Work Order" ? (orderNo || form.order_id || "") : (form.expected_date || "");
  metaLine(meta.extraLabel, extraVal, margin + 400);
  metaLine("Sub-Contractor", form.vendor_name || "", margin);
  y += 52;

  // ── Items table ──
  const head = [meta.columns];
  let body;
  if (type === "order") {
    body = items.map((it) => [clean(it.item_code), clean(it.item_name), fmt(it.quantity, 2), clean(it.uom), fmt(it.rate), fmt(it.amount)]);
  } else if (type === "issue") {
    body = items.map((it) => [clean(it.item_code), clean(it.item_name), fmt(it.quantity, 2), clean(it.uom), clean(it.notes)]);
  } else {
    body = items.map((it) => [clean(it.item_code), clean(it.item_name), fmt(it.quantity, 2), fmt(it.accepted_qty, 2), clean(it.uom), clean(it.notes)]);
  }

  autoTable(doc, {
    head,
    body,
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 6, lineColor: [220, 220, 220], lineWidth: 0.5 },
    headStyles: { fillColor: [21, 61, 110], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
  });

  // ── Totals ──
  let after = doc.lastAutoTable.finalY + 16;
  if (type === "order") {
    const totalQty = items.reduce((s, it) => s + (parseFloat(it.quantity) || 0), 0);
    const totalAmt = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Total Qty: ${fmt(totalQty)}`, pageW - margin - 280, after);
    doc.text(`Total Amount: Rs. ${fmt(totalAmt)}`, pageW - margin, after, { align: "right" });
    doc.setFont("helvetica", "normal");
    after += 18;
  }

  // ── Notes ──
  if (form.notes) {
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text("Remarks:", margin, after + 6);
    doc.setTextColor(20, 20, 20);
    const split = doc.splitTextToSize(form.notes, pageW - margin * 2);
    doc.text(split, margin, after + 20);
    after += 20 + split.length * 12;
  }

  // ── Signatures ──
  after = Math.max(after, doc.internal.pageSize.getHeight() - 110);
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, after, margin + 180, after);
  doc.line(margin + 220, after, margin + 400, after);
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text("Sub-Contractor Signature", margin + 90, after + 14, { align: "center" });
  doc.text("Authorized Signatory", margin + 310, after + 14, { align: "center" });

  // ── Footer ──
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleString("en-IN")} · This is a system-generated document.`, pageW / 2, h - 20, { align: "center" });

  const fileName = `${(form.order_no || form.issue_no || form.receipt_no || "document")}.pdf`;
  doc.save(fileName);
}
