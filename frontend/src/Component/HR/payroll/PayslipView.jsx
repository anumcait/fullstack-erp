import React from "react";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { useCompany } from "../../../context/CompanyContext";
import "./PayslipPreview.css";
export default function PayslipView({ data, onClose }) {
  const { companyName } = useCompany();
  if (!data) return null;
  const p = data;
  const emp = p.employee || {};
  const off = emp.official || {};
  const formatCurrency = (v) => {
    const n = Number(v);
    return isNaN(n) ? "0" : n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };
  const MONTHS3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const formatDOJ = (d) => {
    if (!d) return "";
    try {
      let s = d instanceof Date ? d.toISOString().split("T")[0] : String(d).split("T")[0];
      const pa = s.split("-");
      if (pa.length === 3 && parseInt(pa[0],10) >= 2000) {
        const mi = parseInt(pa[1],10) - 1;
        if (mi >= 0 && mi < 12) return parseInt(pa[2],10) + "-" + MONTHS3[mi] + "-" + pa[0].slice(2);
      }
    } catch(e) {}
    const dt = new Date(d);
    if (isNaN(dt) || dt.getFullYear() < 2000) return "";
    return dt.getDate() + "-" + MONTHS3[dt.getMonth()] + "-" + String(dt.getFullYear()).slice(2);
  };
  const otherDed = Math.ceil(Number(p.C_DED_OTH) || 0);
  const handlePrint = () => {
    window.print();
  };
  return (
    <div className="payslip-print-container" id="payslip-modal-content">
      <table className="payslip-table payslip-outer-border">
        <colgroup>
          <col style={{ width: '14%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '10%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={10} style={{ position: 'relative', textAlign: 'center', padding: '5px', border: '1px solid #000', height: '52px' }}>
              <img src={logo} alt="Logo" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '90px', height: '18px', objectFit: 'contain' }} />
              <h2 className="payslip-company-title" style={{ margin: 0, textAlign: 'center' }}>{companyName || "AUCTOR HOME APPLIANCES LLP"}</h2>
            </td>
          </tr>
          <tr className="payslip-bg-grey payslip-text-center payslip-address-row">
            <td colSpan={10}>
              Plot No 21 & 22, Phase IV, IDA, Jeedimetla, Hyderabad
            </td>
          </tr>
          <tr className="payslip-text-center payslip-title-row">
            <td colSpan={10}>
              Salary Slip For The Month of : {(p.C_MONTH || "").toUpperCase()} - {p.C_YEAR}
            </td>
          </tr>
          <tr>
            <td className="payslip-bold" colSpan={1}>Employee ID</td>
            <td className="payslip-bold" colSpan={2}>{p.C_EMPID}</td>
            <td colSpan={2}>D O J :</td>
            <td colSpan={2}>Designation:</td>
            <td colSpan={3}>{p.C_DESIG}</td>
          </tr>
          <tr>
            <td colSpan={1}>Employee Name</td>
            <td className="payslip-bold" colSpan={2}>{p.C_ENAME}</td>
            <td colSpan={2}>{formatDOJ(off.doj)}</td>
            <td colSpan={2}>Department:</td>
            <td colSpan={3}>{p.C_DEPT}</td>
          </tr>
          <tr>
            <td colSpan={1}>Total Days</td>
            <td className="payslip-text-center" colSpan={1}>{Math.round(p.C_TOT_DAYS)}</td>
            <td colSpan={1}>Days Present:</td>
            <td className="payslip-text-center" colSpan={1}>{Math.round(p.C_DAYS_PRESENT)}</td>
            <td colSpan={1}>Leaves Allowed:</td>
            <td className="payslip-text-center" colSpan={1}>{Math.round(p.C_LEAVES_ALLOWED || 0)}</td>
            <td colSpan={2}>UAN Number</td>
            <td className="payslip-bold payslip-text-center" colSpan={2}>{off.c_uan_no || "N/A"}</td>
          </tr>
          <tr>
            <td colSpan={1}>Absent Days</td>
            <td className="payslip-text-center" colSpan={1}>{Number(p.C_ABSENT_DAYS).toFixed(1)}</td>
            <td colSpan={1}>Late Hrs</td>
            <td className="payslip-text-center" colSpan={1}>{p.C_LATE_HOURS || p.C_LATE_HALF_HOURS || 0}</td>
            <td colSpan={1}>Late: D:</td>
            <td className="payslip-text-center" colSpan={1}>{p.C_LATE_HALF_DAYS || 0}</td>
            <td colSpan={2}>ESI Number</td>
            <td className="payslip-text-center" colSpan={2}>{p.C_ESI_NUM || off.esiacno || "N/A"}</td>
          </tr>
          <tr className="payslip-bg-grey payslip-bold payslip-text-center">
            <td colSpan={2}>Fixed Salary</td>
            <td colSpan={4}>Earnings Salary</td>
            <td colSpan={4}>Deductions</td>
          </tr>
          <tr>
            <td>Basic</td>
            <td className="payslip-text-right">{formatCurrency(p.C_BASIC)}</td>
            <td>Basic</td>
            <td className="payslip-text-right">{formatCurrency(p.C_EARNED_BASIC)}</td>
            <td>Attendance Bonus</td>
            <td className="payslip-text-right">{formatCurrency(p.C_EARNED_BONUS)}</td>
            <td>P.F</td>
            <td className="payslip-text-right">{formatCurrency(p.C_DED_PF)}</td>
            <td>Income tax</td>
            <td className="payslip-text-right">{formatCurrency(p.C_DED_TAX)}</td>
          </tr>
          <tr>
            <td>HRA</td>
            <td className="payslip-text-right">{formatCurrency(p.C_HRA)}</td>
            <td>HRA</td>
            <td className="payslip-text-right">{formatCurrency(p.C_EARNED_HRA)}</td>
            <td>Extra Wage</td>
            <td className="payslip-text-right">{formatCurrency(p.C_EARNED_OT)}</td>
            <td>E.S.I</td>
            <td className="payslip-text-right">{formatCurrency(p.C_DED_ESI)}</td>
            <td>Advance</td>
            <td className="payslip-text-right">{formatCurrency(p.C_DED_ADV)}</td>
          </tr>
          <tr>
            <td>Conveyance</td>
            <td className="payslip-text-right">{formatCurrency(p.C_CONV)}</td>
            <td>Conveyance</td>
            <td className="payslip-text-right">{formatCurrency(p.C_EARNED_CONV)}</td>
            <td>Lunch Allowance</td>
            <td className="payslip-text-right">{formatCurrency(p.C_EARNED_LUNCH || 0)}</td>
            <td>P.T</td>
            <td className="payslip-text-right">{formatCurrency(p.C_DED_PT)}</td>
            <td>Canteen</td>
            <td className="payslip-text-right">{formatCurrency(p.C_DED_MEALS || 0)}</td>
          </tr>
          <tr>
            <td>Washing Allowance</td>
            <td className="payslip-text-right">{formatCurrency(p.C_OTHERS)}</td>
            <td>Washing Allowance</td>
            <td className="payslip-text-right">{formatCurrency(p.C_EARNED_OTHERS)}</td>
            <td></td>
            <td></td>
            <td>L.I.C</td>
            <td className="payslip-text-right">{formatCurrency(p.C_DED_LIC)}</td>
            <td>Other Deduction</td>
            <td className="payslip-text-right">{formatCurrency(otherDed)}</td>
          </tr>
          <tr className="payslip-bold">
            <td>Total Fixed Salary</td>
            <td className="payslip-text-right">{formatCurrency(p.C_TOT_SAL)}</td>
            <td colSpan={2}>Total Earnings Salary :</td>
            <td className="payslip-text-right" colSpan={2}>{formatCurrency(p.C_EARNED_GROSS)}</td>
            <td colSpan={2}>Total Deduction:</td>
            <td className="payslip-text-right" colSpan={2}>{formatCurrency(p.C_TOT_DED)}</td>
          </tr>
          <tr className="payslip-bold">
            <td>NET Salary :</td>
            <td className="payslip-text-right">{formatCurrency(p.C_NET_AMT)}</td>
            <td colSpan={2} className="payslip-bold" style={{ fontWeight: 'normal' }}>Payment Mode :</td>
            <td colSpan={2}>{p.C_PAY_TYPE || 'Bank'}</td>
            <td colSpan={2} className="payslip-bold" style={{ fontWeight: 'normal' }}>Bank A/c No :</td>
            <td colSpan={2}>{p.C_BANK_ACNO || '-'}</td>
          </tr>
        </tbody>
      </table>
      <div className="payslip-actions-bar">
        <button variant="contained" onClick={handlePrint} style={{ padding: "8px 20px", background: "#1976d2", color: "#fff", border: 0, borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>Print Payslip</button>
      </div>
    </div>
  );
}