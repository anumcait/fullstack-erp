import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const fmt = (v, d = 2) =>
  v === "" || v === null || v === undefined
    ? "-"
    : Number(v).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

const clean = (v) => (v === "" || v === null || v === undefined ? "-" : String(v));
const fmtDateTime = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return clean(v);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

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
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = full;
  });
}

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

function currencyToWord(code) {
  switch ((code || "INR").toUpperCase()) {
    case "USD": return "US Dollars";
    case "EUR": return "Euros";
    case "GBP": return "Pounds";
    case "AED": return "Dirhams";
    default: return "Rupees";
  }
}

export async function downloadJoPdf(id) {
  const [joRes, compRes, unitRes] = await Promise.all([
    axios.get(`/api/erp/production/job-orders/${id}`),
    axios.get(`/api/settings/company`).catch(() => ({ data: {} })),
    axios.get(`/api/erp/stores/units`).catch(() => ({ data: [] })),
  ]);
  const jo = joRes.data || {};
  const cs = compRes.data || {};
  const unitMap = {};
  (unitRes.data || []).forEach((u) => { unitMap[u.id] = u.short_name || u.name || u.code || String(u.id); });
  const logo = await loadImage(cs.logo_url);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const borderMargin = 20;
  const contentW = pageW - borderMargin * 2;
  const companyName = cs.company_name || "EQIC DIES & MOULDS ENGINEERS PVT. LTD.";

  const drawPageDecorations = (data) => {
    const pageNo = data.pageNumber;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(borderMargin, borderMargin, pageW - borderMargin * 2, pageH - borderMargin * 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`Page ${pageNo}`, pageW / 2 - 15, pageH - 30);
    doc.text(`of ${doc.internal.getNumberOfPages() || 1}`, pageW / 2 + 15, pageH - 30);
    if (pageNo > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`JO Ref: ${clean(jo.order_no)}`, borderMargin + 10, borderMargin + 15);
      doc.text(`Date: ${fmtDateTime(jo.jo_date)}`, pageW - borderMargin - 100, borderMargin + 15);
      doc.line(borderMargin, borderMargin + 22, pageW - borderMargin, borderMargin + 22);
    }
  };

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("Prod./F02/Rev.00/Jul'26", pageW - borderMargin - 120, borderMargin + 15);

  let y = borderMargin + 25;
  let logoW = 0;
  if (logo) {
    const maxH = 40;
    const ratio = logo.w / logo.h;
    let w = maxH * ratio, h = maxH;
    if (w > 120) { w = 120; h = w / ratio; }
    logoW = w;
    doc.addImage(logo.dataUrl, "PNG", borderMargin + 10, y, w, h);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  const nameX = borderMargin + 10 + (logo ? logoW + 15 : 0);
  doc.text(companyName, nameX, y + 16);

  y += 45;
  doc.line(borderMargin, y - 5, pageW - borderMargin, y - 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Registered Office:", borderMargin + 10, y);
  doc.text("Billing Address :", borderMargin + 300, y);

  doc.setFont("helvetica", "normal");
  const regLines = cs.address ? cs.address.split("\n") : ["Plot No.9 & 10B, IV Phase Extn., IDA,", "Jeedimetla, Hyderabad,Telangana- 500055,India."];
  let ry = y + 10;
  regLines.forEach((l) => { doc.text(l, borderMargin + 10, ry); ry += 9; });
  if (cs.phone || cs.email) {
    doc.setFont("helvetica", "normal");
    doc.text(`Phone: ${cs.phone || "+91-40-44567999"}, Fax: 040-23098656.`, borderMargin + 10, ry); ry += 9;
  }
  doc.setFont("helvetica", "bold");
  doc.text(`Email: ${cs.email || "nitin@eqicindia.com, materials@eqicindia.com"}`, borderMargin + 10, ry); ry += 9;
  doc.text(`CIN : ${cs.cin || "U25209TG1988PTC008919"}`, borderMargin + 10, ry);

  let by = y + 10;
  doc.setFont("helvetica", "normal");
  const billingLines = ["Works:Plot No.9 & 10B,IV Phase Extn., IDA Jeedimetla,", "Hyderabad, Telangana-500 055."];
  billingLines.forEach((l) => { doc.text(l, borderMargin + 300, by); by += 9; });
  doc.setFont("helvetica", "bold");
  doc.text(`Ph.No.: ${cs.phone || "040-44567999"}`, borderMargin + 300, by); by += 9;
  doc.text(`Email : ${cs.email || "materials@eqicindia.com"}`, borderMargin + 300, by);

  y = Math.max(ry, by) + 12;
  doc.line(borderMargin, y, pageW - borderMargin, y);

  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("JOB ORDER", pageW / 2 - 45, y);

  y += 10;
  doc.line(borderMargin, y, pageW - borderMargin, y);

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Party", borderMargin + 10, y);

  y += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(clean(jo.party_name), borderMargin + 10, y);

  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  let my = y - 15;
  const metaFields = [
    ["JO NO / Dated", `${clean(jo.order_no)} / ${fmtDateTime(jo.jo_date)}`],
    ["Department", jo.department || "-"],
    ["Req Date", jo.req_date || "-"],
    ["Status", jo.status || "-"],
  ];
  metaFields.forEach(([lbl, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(lbl, borderMargin + 310, my);
    doc.text(":", borderMargin + 400, my);
    doc.setFont("helvetica", "normal");
    doc.text(clean(val), borderMargin + 412, my);
    my += 14;
  });

  y = Math.max(y + 30, my) + 10;
  doc.line(borderMargin, y, pageW - borderMargin, y);

  y += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Please find below the details of the Job Order placed for the following items:", borderMargin + 10, y);

  y += 15;

  const items = jo.items || [];
  const body = items.map((it, i) => {
    const qty = Number(it.required_quantity || it.quantity || 0);
    return [
      String(i + 1),
      clean(it.item_code),
      clean(it.item_name),
      clean(unitMap[it.unit_id] || it.uom || "NOS"),
      fmt(qty, 2),
      clean(it.remarks || "-"),
    ];
  });

  autoTable(doc, {
    head: [["Sl #", "Item Code", "Description", "UOM", "Qty", "Remarks"]],
    body,
    startY: y,
    margin: { left: borderMargin, right: borderMargin },
    styles: { fontSize: 7.5, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.5, textColor: [0, 0, 0] },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold", halign: "center", font: "helvetica" },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { halign: "center", cellWidth: 25 },
      1: { halign: "center", cellWidth: 80 },
      2: { halign: "left", cellWidth: 220 },
      3: { halign: "center", cellWidth: 40 },
      4: { halign: "right", cellWidth: 50 },
      5: { halign: "left", cellWidth: 120 },
    },
  });

  let ty = doc.lastAutoTable.finalY + 12;
  const bottomLimit = pageH - borderMargin - 10;
  const flowEstimate = 200;
  if (ty + flowEstimate > bottomLimit) {
    doc.addPage();
    ty = borderMargin + 30;
  }

  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);

  const totalQty = items.reduce((s, it) => s + (Number(it.required_quantity || it.quantity || 0)), 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Total Quantity :", borderMargin + 320, ty);
  doc.text(fmt(totalQty, 2), pageW - borderMargin - 15, ty, { align: "right" });
  ty += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Total Items : ${items.length}`, borderMargin + 10, ty);
  ty += 14;
  doc.line(borderMargin, ty, pageW - borderMargin, ty);

  ty += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Specifications / Notes", borderMargin + 10, ty);
  ty += 10;
  doc.setFont("helvetica", "normal");
  const notesText = clean(jo.notes || jo.remarks || "-");
  const notesSplit = doc.splitTextToSize(notesText, contentW - 20);
  doc.text(notesSplit, borderMargin + 10, ty);

  ty += Math.max(notesSplit.length * 10, 15);
  doc.line(borderMargin, ty, pageW - borderMargin, ty);

  ty += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Delivery Schedule", borderMargin + 10, ty);
  doc.text(":", borderMargin + 110, ty);
  doc.setFont("helvetica", "normal");
  doc.text(clean(jo.delivery_terms || "As Per Schedule"), borderMargin + 120, ty);

  ty += 14;
  doc.setFont("helvetica", "bold");
  doc.text("Payment Term", borderMargin + 10, ty);
  doc.text(":", borderMargin + 110, ty);
  doc.setFont("helvetica", "normal");
  doc.text(clean(jo.payment_terms || "As Agreed"), borderMargin + 120, ty);

  ty += 14;
  doc.line(borderMargin, ty, pageW - borderMargin, ty);

  ty += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Please quote our order No. on all Challans & Bills.", borderMargin + 10, ty);
  ty += 9;
  doc.text("Job Order acceptance to be sent by return mail.", borderMargin + 10, ty);

  ty += 14;
  doc.line(borderMargin, ty, pageW - borderMargin, ty);

  const signY = pageH - borderMargin - 50;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`for ${companyName}`, borderMargin + 300, signY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`GSTIN/PAN: ${cs.gstin || "36AAACE4477G1ZM"}`, borderMargin + 10, signY + 35);
  doc.text("Authorised Signatory", borderMargin + 300, signY + 35);

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageDecorations({ pageNumber: i });
  }

  return doc.output("bloburl");
}
