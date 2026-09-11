import React, { useState, useEffect } from "react";
import "./ESILeavePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";
import PreviewFieldTableColgroup from "../common/PreviewFieldTableColgroup";
import { useCompany } from "../../../context/CompanyContext";
import axios from "axios";

const ESILeavePreview = ({ data = {}, onClose }) => {
  const { companyName } = useCompany();
  const [isPayslipGenerated, setIsPayslipGenerated] = useState(false);
  useEffect(() => {
    const d = data?.leave_from_date || data?.esi_leave_date;
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
    esi_leave_id = "--",
    esi_leave_date = "--",
    empid = "--",
    ename = "--",
    unit = "--",
    division = "--",
    designation = "--",
    esi_no = "--",
    esi_dispencery = "--",
    hospital_name = "--",
    leave_from_date = "--",
    leave_to_date = "--",
    no_of_days = "--",
    reason = "--"
  } = data;

  return (
    <div className="esi-print-overlay">
      <div className="esi-print-container" style={{ position:'relative', overflow:'hidden' }}>
        {isPayslipGenerated && (<div style={{ position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%) rotate(-32deg)', fontSize:'36px', fontWeight:800, letterSpacing:'3px', color:'rgba(198,40,40,0.09)', border:'3px solid rgba(198,40,40,0.09)', padding:'8px 18px', whiteSpace:'nowrap', pointerEvents:'none', zIndex:2 }}>Payslip Generated — View Only</div>)}
        {/* Header */}
        <div className="esi-print-header">
          <img src={logo} alt="Logo" className="esi-logo" />
          <div className="esi-company-title">
            {companyName}
            <br />
            <span className="esi-slip-title">ESI LEAVE REQUEST</span>
          </div>
          <div style={{ width: '80px' }}></div> {/* Spacer to perfectly center company title */}
        </div>

        {/* Details Table */}
        <table className="esi-field-table">
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">ESI Leave No</td>
              <td className="colon">:</td>
              <td className="value">{esi_leave_id}</td>

              <td className="label">Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(esi_leave_date)}</td>
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

              <td className="label">ESI No</td>
              <td className="colon">:</td>
              <td className="value">{esi_no}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ESI Details Table */}
        <table className="esi-field-table">
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">ESI Dispencery</td>
              <td className="colon">:</td>
              <td className="value">{esi_dispencery}</td>

              <td className="label">Hospital</td>
              <td className="colon">:</td>
              <td className="value">{hospital_name}</td>
            </tr>
            <tr>
              <td className="label">From Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(leave_from_date)}</td>

              <td className="label">To Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(leave_to_date)}</td>
            </tr>
            <tr>
              <td className="label">No of Days</td>
              <td className="colon">:</td>
              <td className="value">{no_of_days ? parseFloat(no_of_days).toString() : "--"}</td>
              <td className="label"></td>
              <td className="colon"></td>
              <td className="value"></td>
            </tr>
            <tr>
              <td className="label">Reason</td>
              <td className="colon">:</td>
              <td colSpan={4} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px' }}>{reason}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Signatures */}
        <table className="esi-signature-grid">
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

        {/* Actions */}
        <div className="esi-actions no-print">
          <button onClick={() => window.print()} disabled={isPayslipGenerated} title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"} style={isPayslipGenerated ? {opacity:0.5,cursor:'not-allowed'}:{}}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
        {isPayslipGenerated && <div style={{ fontSize:11, color:'#c62828', textAlign:'center', marginTop:6 }}>Payslip generated for this month — print disabled</div>}
      </div>
    </div>
  );
};

export default ESILeavePreview;
