import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DeliveryChallanPreview.css";
import logo from "../../../../assets/images/EQIC_Image.jpg";
import { useCompany } from "../../../../context/CompanyContext";

const FORM_NO = "Str./F06/L/Rev.02/Dec'18";
const typeLabels = { L: "Replacement", R: "Repair", M: "Maintenance", J: "Jobwork", S: "Sale on Approval", N: "Non Returnable" };
const TYPE_PREFIX = { S: "SA", N: "" };

const pad = (n) => String(n).padStart(2, "0");
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const fmtNum = (v) => {
  const n = Number(v);
  if (isNaN(n)) return "0";
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
};

const formatDcDate = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  return `${pad(d.getDate())}-${MONTHS[d.getMonth()]}-${String(d.getFullYear()).slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return !isNaN(da) && !isNaN(db) && da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const buildAddress = (s) => {
  if (!s) return "";
  return [s.address_line1, s.address_line2, s.city, s.state, s.pincode].filter(Boolean).join(", ");
};

const DeliveryChallanPreview = ({ data = {}, onClose }) => {
  const { companyName, companySettings } = useCompany();
  const [storesSettings, setStoresSettings] = useState({ show_format_no: true, dc_format_no: FORM_NO });
  const [employees, setEmployees] = useState([]);
  const items = data.items || [];
  const supplier = data.supplier || {};
  const watermarkText = data.status === "Draft" ? "Draft" : data.status === "Cancelled" ? "Cancelled" : (!isSameDay(data.dc_date, new Date()) ? "View Only" : "");
  const totalQty = items.reduce((s, it) => s + (Number(it.quantity ?? it.qty) || 0), 0);
  const totalValue = items.reduce((s, it) => s + (Number(it.quantity ?? it.qty) || 0) * (Number(it.rate) || 0), 0);

  useEffect(() => {
    axios.get("/api/employees").then(({ data }) => setEmployees(Array.isArray(data) ? data : [])).catch(() => []);
    axios.get("/api/erp/stores/settings").then(({ data }) => setStoresSettings(data || {})).catch(() => {});
  }, []);

  const empName = (id) => {
    if (id === null || id === undefined || id === "") return "";
    const e = employees.find((x) => String(x.empid) === String(id));
    return e ? (e.ename || e.fname || "") : "";
  };

  const preparedName = empName(data.prepared_by);
  const approvedName = empName(data.approved_by);
  const logoUrl = companySettings.logo_url || logo;
  const typeLabel = typeLabels[data.dc_type] || data.dc_type || "";
  const deptTypeText = [data.department, typeLabel].filter(Boolean).join(" : ");
  // Drafts have no real number yet — print the derived draft reference (next real no + local HHMMSS of creation).
  const dcNumber = (() => {
    if (data.dc_no) return data.dc_no;
    if (data.draft_no) return data.draft_no;
    const raw = data.updated_at || data.dc_date;
    const d = raw ? new Date(raw) : null;
    if (data.last_number && d && !isNaN(d)) {
      return `${TYPE_PREFIX[data.dc_type] || ""}${Number(data.last_number) + 1}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }
    return "-";
  })();

  return (
    <div className="dc-overlay">
      <div className="dc-sheet">
        {watermarkText && <div className="dc-watermark">{watermarkText}</div>}
        <div className="dc-masthead">
          <div className="dc-masthead-row">
            <div className="dc-corner-left">
              <img src={logoUrl} alt="" className="dc-logo" />
            </div>
            <div className="dc-brand">
              <div className="dc-company">
                <div className="dc-company-name">{companyName}</div>
                <div className="dc-reg-line">
                  {companySettings.cin ? `CIN : ${companySettings.cin}` : ""}
                  {companySettings.cin && companySettings.gstin ? " | " : ""}
                  {companySettings.gstin ? `GSTIN : ${companySettings.gstin}` : ""}
                  {companySettings.pan ? ` | PAN : ${companySettings.pan}` : ""}
                </div>
                {companySettings.address ? <div className="dc-works">Works : {companySettings.address}</div> : null}
              </div>
            </div>
            <div className="dc-corner-right">
              {storesSettings && storesSettings.show_format_no !== false
                ? <div className="dc-format-no">{storesSettings.dc_format_no || FORM_NO}</div>
                : null}
            </div>
          </div>
          <div className="dc-title-strip">
            {data.dc_type === 'N' ? 'Non Returnable Gate Pass Cum Delivery Challan'
              : data.dc_type === 'S' ? 'Sale on Approval Gate Pass Cum Delivery Challan'
                : 'Returnable Gate Pass Cum Delivery Challan'}
          </div>
          {deptTypeText ? <div className="dc-dept-strip">{deptTypeText}</div> : null}
        </div>

        <div className="dc-details">
          <div className="dc-details-left">
            <div className="dc-details-title">Supplier Details</div>
            <div className="dc-supplier-name">M/s. {data.party_name || "-"}</div>
            {data.reference_no ? <div className="dc-ref">Ref : {data.reference_no}</div> : null}
            <div className="dc-supplier-address">{buildAddress(supplier) || "-"}</div>
            {supplier.gstin ? <div className="dc-gstin">GSTIN : {supplier.gstin}</div> : null}
            {supplier.state ? <div className="dc-pos">Place of Supply : {supplier.state}</div> : null}
          </div>
          <div className="dc-details-right">
            <div className="dc-details-title">DC Details</div>
            <div className="dc-detail-row">
              <span className="dc-detail-label">DC Number</span>
              <span className="dc-detail-value dc-no-value">{dcNumber}</span>
            </div>
            <div className="dc-detail-row">
              <span className="dc-detail-label">DC Date</span>
              <span className="dc-detail-value">{formatDcDate(data.dc_date) || "-"}</span>
            </div>
            {data.dc_type === 'N' && data.non_returnable_type ? (
              <div className="dc-detail-row">
                <span className="dc-detail-label">Purpose</span>
                <span className="dc-detail-value">{data.non_returnable_type}</span>
              </div>
            ) : null}
            {data.through ? (
              <div className="dc-detail-row">
                <span className="dc-detail-label">Through</span>
                <span className="dc-detail-value">{data.through}</span>
              </div>
            ) : null}
            {data.authorization_ref ? (
              <div className="dc-detail-row">
                <span className="dc-detail-label">Auth Ref</span>
                <span className="dc-detail-value">{data.authorization_ref}</span>
              </div>
            ) : null}
            {data.transfer_location ? (
              <div className="dc-detail-row">
                <span className="dc-detail-label">Transfer To</span>
                <span className="dc-detail-value">{data.transfer_location}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="dc-note">
          {data.dc_type === 'N'
            ? `The following goods are dispatched on a non-returnable basis${data.non_returnable_type ? ` for ${data.non_returnable_type} purpose` : ''} and are not required to be returned.`
            : 'The following goods are sent for jobwork purpose to do the operations mentioned against each item and return the same after completion of jobwork.'}
        </div>

        <table className="dc-items">
          <thead>
            <tr>
              <th style={{ width: "5%" }}>Sl#</th>
              <th style={{ width: "11%" }} className="center">Hs Code</th>
              <th style={{ width: "13%" }} className="center">Item code</th>
              <th style={{ width: "24%" }}>Description</th>
              <th style={{ width: "7%" }}>Uom</th>
              <th style={{ width: "8%" }}>Qty</th>
              <th style={{ width: "11%" }}>Amount</th>
              <th style={{ width: "21%" }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id || i}>
                <td className="center">{i + 1}</td>
                <td className="center">{it.hs_code || ""}</td>
                <td className="center">{it.item_code || ""}</td>
                <td>{it.item_name || ""}</td>
                <td className="center">{it.unit || it.uom || it.item?.unit?.short_name || ""}</td>
                <td className="center">{fmtNum(it.quantity ?? it.qty)}</td>
                <td className="center">{fmtNum((Number(it.quantity ?? it.qty) || 0) * (Number(it.rate) || 0))}</td>
                <td>{it.remarks || ""}</td>
              </tr>
            ))}
            <tr className="dc-total">
              <td colSpan={4}></td>
              <td>Total :-</td>
              <td className="center">{fmtNum(totalQty)}</td>
              <td className="center">{fmtNum(totalValue)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {data.status === "Cancelled" && data.cancel_remarks ? (
          <div className="dc-cancel-block">
            <span className="dc-cancel-label">Cancellation Remarks :</span> {data.cancel_remarks}
          </div>
        ) : null}

        <div className="dc-sig-footer">
          <div className="dc-sig-for">For {companyName}</div>
          <div className="dc-sig-received">Received the above goods in good condition.</div>
        </div>

        <div className="dc-sigs">
          <div className="dc-sig-col">
            <div className="dc-sig-name">{preparedName}</div>
            <div className="dc-sig-title">Prepared By</div>
            <div className="dc-sig-date">Date :</div>
          </div>
          <div className="dc-sig-col">
            <div className="dc-sig-name">{approvedName}</div>
            <div className="dc-sig-title">Approved By</div>
            <div className="dc-sig-date">Date :</div>
          </div>
          <div className="dc-sig-col">
            <div className="dc-sig-name">{data.status === "Cancelled" ? empName(data.cancel_by) : ""}</div>
            <div className="dc-sig-title">{data.status === "Cancelled" ? "Cancelled By" : "Received By"}</div>
            <div className="dc-sig-date">{data.status === "Cancelled" && data.cancel_date ? `Date : ${formatDcDate(data.cancel_date)}` : "Date :"}</div>
          </div>
        </div>

        {companySettings.address ? <div className="dc-regd">*Regd. Office: {companySettings.address}</div> : null}

        <div className="dc-actions no-print">
          <button onClick={() => window.print()}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallanPreview;
