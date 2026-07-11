import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "../../../context/CompanyContext";
import "./EmployeePreview.css";

const API = import.meta.env.VITE_API_URL || "";

const fmtDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return v;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const escapeHtml = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const Field = ({ label, value }) => (
  <div className="ep-field">
    <span className="ep-field-label">{label}</span>
    <span className="ep-field-value">{value || "—"}</span>
  </div>
);

const SubHead = ({ title }) => <h3 className="ep-subhead">{title}</h3>;

const EmployeePreview = ({ data, onClose }) => {
  const { companySettings } = useCompany();
  const [full, setFull] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const TOTAL_PAGES = 3;

  useEffect(() => {
    if (!data || !data.empid) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const [res, photoRes] = await Promise.all([
          axios.get(`${API}/api/employees/${data.empid}/full`, { withCredentials: true }),
          axios.get(`${API}/api/employees/${data.empid}/photo`, { withCredentials: true }).catch(() => null),
        ]);
        if (cancelled) return;
        setFull(res.data);
        if (photoRes && photoRes.data && photoRes.data.photo) {
          setPhoto(`data:${photoRes.data.mimeType || "image/jpeg"};base64,${photoRes.data.photo}`);
        }
      } catch (err) {
        console.error("Failed to load employee preview:", err);
        if (!cancelled) setFull(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [data]);

  const go = (dir) => setPage((p) => Math.min(TOTAL_PAGES - 1, Math.max(0, p + dir)));

  const handlePrint = () => {
    const emp = full || data || {};
    const official = emp.official || {};
    const salary = emp.salary || {};
    const family = emp.family || [];
    const qualification = emp.qualification || [];
    const experience = emp.experience || [];
    const cs = companySettings || {};

    const field = (label, value) =>
      `<div style="display:flex;flex-direction:column;padding:3px 0;border-bottom:1px dotted #cbd5e1;">
        <span style="font-size:10px;color:#64748b;text-transform:uppercase;">${escapeHtml(label)}</span>
        <span style="font-size:13px;font-weight:600;">${escapeHtml(value || "—")}</span>
      </div>`;

    const subhead = (t) =>
      `<h3 style="font-size:13px;font-weight:700;color:#1e3a8a;background:#eef2ff;border-left:4px solid #1e3a8a;padding:6px 10px;margin:18px 0 8px;letter-spacing:.4px;">${escapeHtml(t)}</h3>`;

    const grid = (html) =>
      `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px 18px;break-inside:avoid;">${html}</div>`;

    const section = (t, content) =>
      `<div style="break-inside:avoid;page-break-inside:avoid;margin-top:6px;padding-top:6px;">${subhead(t)}${content}</div>`;

    const table = (heads, rows) =>
      `<table style="width:100%;border-collapse:collapse;font-size:12px;break-inside:avoid;">
        <thead><tr>${heads.map((h) => `<th style="border:1px solid #94a3b8;padding:5px 8px;background:#e2e8f0;text-align:left;">${escapeHtml(h)}</th>`).join("")}</tr></thead>
        <tbody>${rows.length ? rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #94a3b8;padding:5px 8px;">${escapeHtml(c)}</td>`).join("")}</tr>`).join("") : `<tr><td style="border:1px solid #94a3b8;padding:5px 8px;font-style:italic;color:#94a3b8;" colspan="${heads.length}">No records found.</td></tr>`}</tbody>
      </table>`;

    const photoHtml = photo
      ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div style="font-size:40px;font-weight:700;color:#94a3b8;display:flex;align-items:center;justify-content:center;height:100%;">${escapeHtml(String(emp.ename || "?").charAt(0))}</div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Employee Master - ${escapeHtml(emp.ename || "")}</title>
      <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }
        body { font-family: "Segoe UI", Roboto, Arial, sans-serif; color:#1e293b; font-size:12px; line-height:1.4; margin:0; padding:14mm 12mm 12mm; }
        .letterhead { border:2px solid #1e3a8a;border-radius:6px;padding:10px 14px;margin-bottom:6px;background:linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%); }
        .cname { font-size:21px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#1e3a8a; }
        .doc { text-align:center;font-size:15px;font-weight:700;letter-spacing:3px;margin:12px 0 14px;color:#0f172a; }
        .docrule { width:60%;height:2px;background:#1e3a8a;margin:6px auto 0;border-radius:2px; }
        .idbox { display:flex;gap:20px;align-items:center;margin-bottom:6px;padding:10px;border:1px solid #cbd5e1;border-radius:6px;background:#fbfdff; }
        .photo { width:96px;height:118px;flex-shrink:0;border:2px solid #1e3a8a;border-radius:4px;overflow:hidden;background:#f1f5f9;box-shadow:0 1px 3px rgba(15,23,42,.15); }
        .name { font-size:21px;font-weight:800;text-transform:uppercase;margin-bottom:6px;color:#0f172a; }
        .idrow { display:flex;flex-wrap:wrap;gap:4px 24px;font-size:13px;color:#334155; }
        .acols { display:grid;grid-template-columns:1fr 1fr;gap:18px;break-inside:avoid; }
        .acol { border:1px solid #cbd5e1;border-radius:4px;padding:8px 10px; }
        .atitle { font-size:12px;font-weight:700;color:#1e3a8a;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px; }
        .sign { display:flex;justify-content:space-between;margin-top:26px;padding-top:10px;border-top:1px solid #cbd5e1;font-size:12px;color:#334155; }
        .sign div { text-align:center;min-width:160px; }
        .sline { border-top:1px solid #334155;margin-top:28px;padding-top:3px;font-size:11px;color:#475569; }
      </style></head>
      <body>
        <div class="letterhead">
          <div style="text-align:center;">
            <div class="cname">${escapeHtml(cs.company_name || "Company Name")}</div>
            ${cs.address ? `<div style="font-size:12px;color:#475569;margin-top:2px;">${escapeHtml(cs.address)}</div>` : ""}
            <div style="display:flex;justify-content:center;gap:18px;font-size:11px;color:#64748b;margin-top:3px;">
              ${cs.phone ? `<span>Ph: ${escapeHtml(cs.phone)}</span>` : ""}
              ${cs.email ? `<span>Email: ${escapeHtml(cs.email)}</span>` : ""}
            </div>
          </div>
        </div>
        <div class="doc">EMPLOYEE MASTER RECORD<div class="docrule"></div></div>

        <div class="idbox">
          <div class="photo">${photoHtml}</div>
          <div style="flex:1;">
            <div class="name">${escapeHtml(emp.ename || "—")}</div>
            <div class="idrow">
              <span><strong>Emp ID:</strong> ${escapeHtml(emp.empid)}</span>
              <span><strong>Department:</strong> ${escapeHtml(emp.deptname || "—")}</span>
              <span><strong>Division:</strong> ${escapeHtml(emp.divname || "—")}</span>
              <span><strong>Status:</strong> ${escapeHtml(emp.status || "Active")}</span>
            </div>
          </div>
        </div>

        ${section("1. Personal Information", grid(
          field("Name", emp.ename) + field("Father / Husband Name", emp.fname) + field("Gender", emp.sex) +
          field("Date of Birth", fmtDate(emp.dob)) + field("Marital Status", emp.marital_status) + field("Blood Group", emp.bgroup) +
          field("Employee Type", emp.employment_status || emp.emptype) + field("Mother Tongue", emp.mother_tongue || emp.mother_tounge) + field("Languages Known", emp.lang_known)
        ))}

        ${section("2. Address Details", `<div class="acols">
          <div class="acol"><div class="atitle">Communication Address</div>${grid(
            field("Street", emp.cadd_sa) + field("City", emp.cadd_city) + field("State", emp.cadd_state) +
            field("PIN", emp.cadd_pin) + field("Mobile", emp.cadd_mobile) + field("Email", emp.cadd_email)
          )}</div>
          <div class="acol"><div class="atitle">Permanent Address</div>${grid(
            field("Street", emp.padd_sa) + field("City", emp.padd_city) + field("State", emp.padd_state) +
            field("PIN", emp.padd_pin) + field("Mobile", emp.padd_mobile) + field("Email", emp.padd_email)
          )}</div>
        </div>`)}

        ${section("3. Official Details", grid(
          field("Date of Joining", fmtDate(official.doj)) + field("Date of Interview", fmtDate(official.doi)) + field("Joined As", official.jas) +
          field("Designation", official.designation) + field("Qualification", official.c_high_qual) + field("Probation Period", official.pp) +
          field("Training Period", official.tp) + field("Reporting To", official.rto) + field("Reporting To Dept", official.rto_dept) +
          field("PF A/C No", official.pfacno) + field("ESI No", official.esiacno) + field("UAN No", official.c_uan_no) +
          field("PAN No", official.panno) + field("Aadhar No", official.c_aadhar_no) + field("Bank A/C No", official.bankacno) +
          field("Bank Name", official.bankname) + field("Branch", official.branchname) + field("IFSC", official.ifsccode) +
          field("Passport No", official.passport_no) + field("Weekly Off", official.c_weekly_off) + field("Shift", official.c_default_shift)
        ))}

        ${section("4. Salary Details", grid(
          field("Basic", salary.basic) + field("HRA", salary.hra) + field("Conveyance", salary.conveyance) +
          field("Washing Allowance", salary.washing_allowance) + field("Total", salaryTotal(salary)) + field("Other Deductions", salary.deduct_others1) +
          field("ESI", salary.IS_esi === "Y" ? "Yes" : "No") + field("PF", salary.IS_pf === "Y" ? "Yes" : "No") +
          field("OT", salary.IS_ot === "Y" ? "Yes" : "No") + field("LIC", salary.IS_lic === "Y" ? "Yes" : "No") +
          field("LIC Amount", salary.lic_amount) + field("TDS Amount", salary.tds_amount) + field("Payment Mode", salary.pay_mode)
        ))}

        ${section("5. Family Details", table(["S.No", "Name", "Relation", "Age", "Occupation"], family.map((f) => [f.c_sno, f.fname, f.frel, f.fage, f.foccp])))}

        ${section("6. Qualification Details", table(["S.No", "Degree", "Discipline", "Year", "Institution"], qualification.map((q) => [q.c_sno, q.course, q.discipline, q.year, q.noi])))}

        ${section("7. Experience Details", table(["S.No", "Organization", "From", "To", "Designation", "Remarks"], experience.map((e) => [e.c_sno, e.name, fmtDate(e.ffrom), fmtDate(e.tto), e.designation, e.remarks])))}

        <div class="sign">
          <div><div class="sline">Employee Signature</div></div>
          <div><div class="sline">HR Manager</div></div>
          <div><div class="sline">Authorized Signatory</div></div>
        </div>
      </body></html>`;

    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups to print the employee record.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    const trigger = () => { win.focus(); win.print(); };
    if (win.document.readyState === "complete") setTimeout(trigger, 300);
    else win.onload = () => setTimeout(trigger, 300);
  };

  const salaryTotal = (s) => {
    if (!s) return "—";
    const t = Number(s.basic || 0) + Number(s.hra || 0) + Number(s.conveyance || 0) + Number(s.washing_allowance || 0) + Number(s.others1 || 0);
    return t || "—";
  };

  if (!data) return null;

  const emp = full || data || {};
  const official = emp.official || {};
  const salary = emp.salary || {};
  const family = emp.family || [];
  const qualification = emp.qualification || [];
  const experience = emp.experience || [];

  return (
    <div className="ep-overlay">
      <div className="ep-toolbar no-print">
        <button className="ep-btn ep-btn-print" onClick={handlePrint}>Print / Save PDF</button>
        <button className="ep-btn" onClick={() => go(-1)} disabled={page === 0}>‹ Prev</button>
        <span className="ep-page-ind">Page {page + 1} / {TOTAL_PAGES}</span>
        <button className="ep-btn" onClick={() => go(1)} disabled={page === TOTAL_PAGES - 1}>Next ›</button>
        <button className="ep-btn ep-btn-close" onClick={onClose}>Close</button>
      </div>

      <div className="ep-sheet">
        {loading ? (
          <div className="ep-loading">Loading employee details…</div>
        ) : (
          <>
            <div className={`ep-page ${page === 0 ? "active" : ""}`} data-page="0">
              <div className="ep-company">
                <div className="ep-company-name">{companySettings.company_name || "Company Name"}</div>
                {companySettings.address && <div className="ep-company-addr">{companySettings.address}</div>}
                <div className="ep-company-contact">
                  {companySettings.phone && <span>Ph: {companySettings.phone}</span>}
                  {companySettings.email && <span>Email: {companySettings.email}</span>}
                </div>
              </div>
              <div className="ep-doc-title">EMPLOYEE MASTER RECORD</div>

              <div className="ep-identity">
                <div className="ep-photo">
                  {photo ? <img src={photo} alt={emp.ename} /> : <div className="ep-photo-fallback">{String(emp.ename || "?").charAt(0)}</div>}
                </div>
                <div className="ep-identity-info">
                  <div className="ep-name">{emp.ename || "—"}</div>
                  <div className="ep-id-row">
                    <span><strong>Emp ID:</strong> {emp.empid}</span>
                    <span><strong>Department:</strong> {emp.deptname || "—"}</span>
                    <span><strong>Division:</strong> {emp.divname || "—"}</span>
                    <span><strong>Status:</strong> {emp.status || "Active"}</span>
                  </div>
                </div>
              </div>

              <SubHead title="1. Personal Information" />
              <div className="ep-grid">
                <Field label="Name" value={emp.ename} />
                <Field label="Father / Husband Name" value={emp.fname} />
                <Field label="Gender" value={emp.sex} />
                <Field label="Date of Birth" value={fmtDate(emp.dob)} />
                <Field label="Marital Status" value={emp.marital_status} />
                <Field label="Blood Group" value={emp.bgroup} />
                <Field label="Employee Type" value={emp.employment_status || emp.emptype} />
                <Field label="Mother Tongue" value={emp.mother_tongue || emp.mother_tounge} />
                <Field label="Languages Known" value={emp.lang_known} />
              </div>

              <SubHead title="2. Address Details" />
              <div className="ep-address-cols">
                <div className="ep-addr-col">
                  <div className="ep-addr-title">Communication Address</div>
                  <div className="ep-grid">
                    <Field label="Street" value={emp.cadd_sa} />
                    <Field label="City" value={emp.cadd_city} />
                    <Field label="State" value={emp.cadd_state} />
                    <Field label="PIN" value={emp.cadd_pin} />
                    <Field label="Mobile" value={emp.cadd_mobile} />
                    <Field label="Email" value={emp.cadd_email} />
                  </div>
                </div>
                <div className="ep-addr-col">
                  <div className="ep-addr-title">Permanent Address</div>
                  <div className="ep-grid">
                    <Field label="Street" value={emp.padd_sa} />
                    <Field label="City" value={emp.padd_city} />
                    <Field label="State" value={emp.padd_state} />
                    <Field label="PIN" value={emp.padd_pin} />
                    <Field label="Mobile" value={emp.padd_mobile} />
                    <Field label="Email" value={emp.padd_email} />
                  </div>
                </div>
              </div>
            </div>

            <div className={`ep-page ${page === 1 ? "active" : ""}`} data-page="1">
              <SubHead title="3. Official Details" />
              <div className="ep-grid">
                <Field label="Date of Joining" value={fmtDate(official.doj)} />
                <Field label="Date of Interview" value={fmtDate(official.doi)} />
                <Field label="Joined As" value={official.jas} />
                <Field label="Designation" value={official.designation} />
                <Field label="Qualification" value={official.c_high_qual} />
                <Field label="Probation Period" value={official.pp} />
                <Field label="Training Period" value={official.tp} />
                <Field label="Reporting To" value={official.rto} />
                <Field label="Reporting To Dept" value={official.rto_dept} />
                <Field label="PF A/C No" value={official.pfacno} />
                <Field label="ESI No" value={official.esiacno} />
                <Field label="UAN No" value={official.c_uan_no} />
                <Field label="PAN No" value={official.panno} />
                <Field label="Aadhar No" value={official.c_aadhar_no} />
                <Field label="Bank A/C No" value={official.bankacno} />
                <Field label="Bank Name" value={official.bankname} />
                <Field label="Branch" value={official.branchname} />
                <Field label="IFSC" value={official.ifsccode} />
                <Field label="Passport No" value={official.passport_no} />
                <Field label="Weekly Off" value={official.c_weekly_off} />
                <Field label="Shift" value={official.c_default_shift} />
              </div>

              <SubHead title="4. Salary Details" />
              <div className="ep-grid">
                <Field label="Basic" value={salary.basic} />
                <Field label="HRA" value={salary.hra} />
                <Field label="Conveyance" value={salary.conveyance} />
                <Field label="Washing Allowance" value={salary.washing_allowance} />
                <Field label="Total" value={salaryTotal(salary)} />
                <Field label="Other Deductions" value={salary.deduct_others1} />
                <Field label="ESI" value={salary.IS_esi === "Y" ? "Yes" : "No"} />
                <Field label="PF" value={salary.IS_pf === "Y" ? "Yes" : "No"} />
                <Field label="OT" value={salary.IS_ot === "Y" ? "Yes" : "No"} />
                <Field label="LIC" value={salary.IS_lic === "Y" ? "Yes" : "No"} />
                <Field label="LIC Amount" value={salary.lic_amount} />
                <Field label="TDS Amount" value={salary.tds_amount} />
                <Field label="Payment Mode" value={salary.pay_mode} />
              </div>
            </div>

            <div className={`ep-page ${page === 2 ? "active" : ""}`} data-page="2">
              <SubHead title="5. Family Details" />
              {family.length > 0 ? (
                <table className="ep-table">
                  <thead><tr><th>S.No</th><th>Name</th><th>Relation</th><th>Age</th><th>Occupation</th></tr></thead>
                  <tbody>{family.map((f) => <tr key={f.c_sno}><td>{f.c_sno}</td><td>{f.fname}</td><td>{f.frel}</td><td>{f.fage}</td><td>{f.foccp}</td></tr>)}</tbody>
                </table>
              ) : <div className="ep-empty">No family records found.</div>}

              <SubHead title="6. Qualification Details" />
              {qualification.length > 0 ? (
                <table className="ep-table">
                  <thead><tr><th>S.No</th><th>Degree</th><th>Discipline</th><th>Year</th><th>Institution</th></tr></thead>
                  <tbody>{qualification.map((q) => <tr key={q.c_sno}><td>{q.c_sno}</td><td>{q.course}</td><td>{q.discipline}</td><td>{q.year}</td><td>{q.noi}</td></tr>)}</tbody>
                </table>
              ) : <div className="ep-empty">No qualification records found.</div>}

              <SubHead title="7. Experience Details" />
              {experience.length > 0 ? (
                <table className="ep-table">
                  <thead><tr><th>S.No</th><th>Organization</th><th>From</th><th>To</th><th>Designation</th><th>Remarks</th></tr></thead>
                  <tbody>{experience.map((e) => <tr key={e.c_sno}><td>{e.c_sno}</td><td>{e.name}</td><td>{fmtDate(e.ffrom)}</td><td>{fmtDate(e.tto)}</td><td>{e.designation}</td><td>{e.remarks}</td></tr>)}</tbody>
                </table>
              ) : <div className="ep-empty">No experience records found.</div>}

              <div className="ep-sign">
                <div><div className="ep-sign-line">Employee Signature</div></div>
                <div><div className="ep-sign-line">HR Manager</div></div>
                <div><div className="ep-sign-line">Authorized Signatory</div></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeePreview;
