import React, { useState, useEffect } from "react";
import "./OnDutyPreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";
import PreviewFieldTableColgroup from "../common/PreviewFieldTableColgroup";
import { useCompany } from "../../../context/CompanyContext";
import axios from "axios";

const formatMovDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(`1970-01-01T${timeStr}`);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const OnDutyPreview = ({ data = {}, onClose }) => {
  const { companyName } = useCompany();
  const [isPayslipGenerated, setIsPayslipGenerated] = useState(false);
  useEffect(() => {
    if (!data?.empid || !data?.act_date) return;
    const d = new Date(data.act_date);
    if (isNaN(d)) return;
    const month = d.getMonth() + 1, year = d.getFullYear();
    axios.get(`${import.meta.env.VITE_API_URL}/api/payslip`, { params: { empid: data.empid, month, year }, withCredentials: true }).then(r => {
      const arr = Array.isArray(r.data) ? r.data : r.data?.records || [];
      if (arr.length > 0) setIsPayslipGenerated(true);
    }).catch(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/latest-processed`, { withCredentials: true }).then(r => {
        if (r.data?.year && r.data?.month) {
          const ly = r.data.year, lm = r.data.month;
          if (year < ly || (year === ly && month <= lm)) setIsPayslipGenerated(true);
        }
      }).catch(()=>{});
    });
  }, [data]);
  const {
    movement_id = "",
    movement_date = "",
    empid = "",
    ename = "",
    unit = "",
    division = "",
    designation = "",
    section = "",
    shift = "",
    act_date = "",
    perm_ftime = "",
    perm_ttime = "",
    no_of_hrs = "",
    reason_perm = ""
  } = data;
  let submissionStatus = "";
  if (act_date && movement_date) {
    const movement = new Date(movement_date);
    const actual = new Date(act_date);
    if (actual > movement) {
      submissionStatus = "BEFORE SUBMISSION";
    } else {
      submissionStatus = "AFTER SUBMISSION";
    }
  }
  return (
    <div className="onduty-print-overlay">
      <div className="onduty-print-container" style={{ position:'relative', overflow:'hidden' }}>
        {isPayslipGenerated && (
          <div style={{ position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%) rotate(-32deg)', fontSize:'36px', fontWeight:800, letterSpacing:'3px', color:'rgba(198,40,40,0.09)', border:'3px solid rgba(198,40,40,0.09)', padding:'8px 18px', whiteSpace:'nowrap', pointerEvents:'none', zIndex:2, textAlign:'center' }}>Payslip Generated — View Only</div>
        )}
        {/* Header */}
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" />
          <div className="onduty-company-title">
            {companyName}
            <br />
            <span className="onduty-slip-title">ON DUTY PERMISSION SLIP</span>
          </div>
          {submissionStatus && (
            <div className="onduty-before-box">{submissionStatus}</div>
          )}
        </div>

        {/* Details Table */}
        <table className="onduty-field-table">
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">S.No</td>
              <td className="colon">:</td>
              <td className="value">{movement_id}</td>

              <td className="label">Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(movement_date)}</td>
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
              <td className="label">Designation</td>
              <td className="colon">:</td>
              <td className="value">{designation}</td>

              <td className="label">Section</td>
              <td className="colon">:</td>
              <td className="value">{section}</td>
            </tr>
            <tr>
              <td className="label">Shift</td>
              <td className="colon">:</td>
              <td className="value">{shift}</td>
              <td></td>
              <td className="colon"></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Movement Details — same label : value layout as above (not one inline line) */}
        <table className="onduty-field-table onduty-movement-table">
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">Movement Date</td>
              <td className="colon">:</td>
              <td className="value">{formatMovDate(act_date)}</td>

              <td className="label">From</td>
              <td className="colon">:</td>
              <td className="value">{formatTime(perm_ftime)}</td>
            </tr>
            <tr>
              <td className="label">To</td>
              <td className="colon">:</td>
              <td className="value">{formatTime(perm_ttime)}</td>

              <td className="label">Hours</td>
              <td className="colon">:</td>
              <td className="value">{no_of_hrs ? parseFloat(no_of_hrs).toString() : ""}</td>
            </tr>
            <tr>
              <td className="label">Onduty Reason</td>
              <td className="colon">:</td>
              <td colSpan={4} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px' }}>{reason_perm}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Signatures */}
        <table className="onduty-signature-grid">
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
        <div className="onduty-note">
          * Up to Operators level approved signature is sufficient<br />
          * Above Operators level Authorized signature is also must
        </div>

        {/* Actions */}
        <div className="onduty-actions no-print">
          <button onClick={() => window.print()} disabled={isPayslipGenerated} title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"} style={isPayslipGenerated ? { opacity:0.5, cursor:'not-allowed' } : {}}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
        {isPayslipGenerated && <div style={{ fontSize:11, color:'#c62828', textAlign:'center', marginTop:6 }}>Payslip generated for this month — print disabled</div>}
      </div>
    </div>
  );
};

export default OnDutyPreview; 
