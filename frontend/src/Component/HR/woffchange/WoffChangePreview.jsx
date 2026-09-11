import React, { useState, useEffect } from "react";
import "./WoffChangePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate, formatDateOnly } from "../../../utils/dateUtils";
import PreviewFieldTableColgroup from "../common/PreviewFieldTableColgroup";
import { useCompany } from "../../../context/CompanyContext";
import axios from "axios";

const WoffChangePreview = ({ data = {}, onClose }) => {
  const { companyName } = useCompany();
  const [isPayslipGenerated, setIsPayslipGenerated] = useState(false);
  useEffect(() => {
    const d = data?.woff_from_date || data?.woff_date;
    if (!data?.empid || !d) return;
    const dt = new Date(d);
    if (isNaN(dt)) return;
    const month = dt.getMonth()+1, year=dt.getFullYear();
    axios.get(`${import.meta.env.VITE_API_URL}/api/payslip`, { params:{empid:data.empid, month, year}, withCredentials:true }).then(r=>{
      const arr=Array.isArray(r.data)?r.data:r.data?.records||[];
      if(arr.length>0) setIsPayslipGenerated(true);
    }).catch(()=>{ axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/latest-processed`,{withCredentials:true}).then(r=>{ if(r.data?.year&&r.data?.month){ const ly=r.data.year, lm=r.data.month; if(year<ly||(year===ly&&month<=lm)) setIsPayslipGenerated(true);} }).catch(()=>{}); });
  }, [data]);
  const {
    woff_id = "",
    woff_date = "",
    empid = "",
    ename = "",
    unit = "",
    division = "",
    designation = "",
    department = "",
    section = "",
    current_woff_day = "",
    requested_woff_day = "",
    woff_from_date = "",
    woff_to_date = "",
    shift_cd = "",
    reason = "",
    remarks = "",
    status = "Pending"
  } = data;

  let submissionStatus = "";
  if (woff_to_date && woff_date) {
    const entryDate = new Date(woff_date);
    const requestedDate = new Date(woff_to_date);
    if (requestedDate > entryDate) {
      submissionStatus = "BEFORE SUBMISSION";
    } else {
      submissionStatus = "AFTER SUBMISSION";
    }
  }

  return (
    <div className="woff-print-overlay">
      <div className="woff-print-container" style={{ position:'relative', overflow:'hidden' }}>
        {isPayslipGenerated && (<div style={{ position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%) rotate(-32deg)', fontSize:'36px', fontWeight:800, letterSpacing:'3px', color:'rgba(198,40,40,0.09)', border:'3px solid rgba(198,40,40,0.09)', padding:'8px 18px', whiteSpace:'nowrap', pointerEvents:'none', zIndex:2 }}>Payslip Generated — View Only</div>)}
        {/* Header */}
        <div className="woff-print-header">
          <img src={logo} alt="Logo" className="woff-logo" />
          <div className="woff-company-title">
            {companyName}
            <br />
            <span className="woff-slip-title">WEEKLY OFF CHANGE SLIP</span>
          </div>
          {submissionStatus && (
            <div className="woff-before-box">{submissionStatus}</div>
          )}
        </div>

        {/* Details Table */}
        <table className="woff-field-table">
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">Woff ID</td>
              <td className="colon">:</td>
              <td className="value">{woff_id}</td>

              <td className="label">Entry Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(woff_date)}</td>
            </tr>
            <tr>
              <td className="label">Emp Id</td>
              <td className="colon">:</td>
              <td className="value">{empid}</td>

              <td className="label">Emp Name</td>
              <td className="colon">:</td>
              <td className="value">{ename}</td>
            </tr>
            <tr>
              <td className="label">Unit</td>
              <td className="colon">:</td>
              <td className="value">{unit}</td>

              <td className="label">Division</td>
              <td className="colon">:</td>
              <td className="value">{division}</td>
            </tr>
            <tr>
              <td className="label">Department</td>
              <td className="colon">:</td>
              <td className="value">{department}</td>

              <td className="label">Section</td>
              <td className="colon">:</td>
              <td className="value">{section}</td>
            </tr>
            <tr>
              <td className="label">Designation</td>
              <td className="colon">:</td>
              <td className="value">{designation}</td>
              <td className="label"></td>
              <td className="colon"></td>
              <td className="value"></td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Change Details */}
        <table className="woff-field-table">
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">Existing Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDateOnly(woff_from_date)} ({current_woff_day})</td>

              <td className="label">Changed Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDateOnly(woff_to_date)} ({requested_woff_day})</td>
            </tr>
            <tr>
              <td className="label">Shift</td>
              <td className="colon">:</td>
              <td className="value">{shift_cd}</td>
              <td className="label"></td>
              <td className="colon"></td>
              <td className="value"></td>
            </tr>
            <tr>
              <td className="label">Reason</td>
              <td className="colon">:</td>
              <td colSpan={4} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top' }}>{reason}</td>
            </tr>
            <tr>
              <td className="label">Remarks</td>
              <td className="colon">:</td>
              <td colSpan={4} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top' }}>{remarks}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Signatures */}
        <table className="woff-signature-grid">
          <tbody>
            <tr>
              <td>
                <br /><br /><br />
                <strong>Employee</strong><br />
                Signature
              </td>
              <td>
                <strong>Recommended</strong><br />
                Name: <br />
                E.I.D No.: <br /><br />
                Signature
              </td>
              <td>
                <strong>Approved</strong><br />
                Name:<br />
                E.I.D No.:<br /><br />
                Signature
              </td>
              <td>
                <br /><br /><br />
                <strong>Authorized</strong><br />
                Signature
              </td>
              <td>
                <br /><br /><br />
                <strong>HRM</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Notes */}
        <div className="woff-note">
          * Employee must submit this form at least 24 hours in advance.<br />
          * Approval from Department Head and HR is mandatory for processing Weekly Off changes.
        </div>

        {/* Actions */}
        <div className="woff-actions no-print">
          <button onClick={() => window.print()} disabled={isPayslipGenerated} title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"} style={isPayslipGenerated ? {opacity:0.5,cursor:'not-allowed'}:{}}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
        {isPayslipGenerated && <div style={{ fontSize:11, color:'#c62828', textAlign:'center', marginTop:6 }}>Payslip generated for this month — print disabled</div>}
      </div>
    </div>
  );
};

export default WoffChangePreview;
