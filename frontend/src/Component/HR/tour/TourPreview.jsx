import React, { useState, useEffect } from "react";
import "../onduty/OnDutyPreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";
import { useCompany } from "../../../context/CompanyContext";
import axios from "axios";

const TourPreview = ({ data = {}, onClose }) => {
  const { companyName } = useCompany();
  const [isPayslipGenerated, setIsPayslipGenerated] = useState(false);
  useEffect(() => {
    const d = data?.tour_from_date || data?.tour_date;
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
    tour_id = "",
    tour_date = "",
    empid = "",
    ename = "",
    unit = "",
    division = "",
    designation = "",
    department = "",
    tour_from_date = "",
    tour_to_date = "",
    destination = "",
    purpose = "",
    estimated_amount = "",
    status = ""
  } = data;

  let submissionStatus = "";
  if (tour_from_date && tour_date) {
    const entryDate = new Date(tour_date);
    const fromDate = new Date(tour_from_date);
    if (fromDate > entryDate) {
      submissionStatus = "BEFORE SUBMISSION";
    } else {
      submissionStatus = "AFTER SUBMISSION";
    }
  }

  return (
    <div className="onduty-print-overlay">
      <div className="onduty-print-container" style={{ position:'relative', overflow:'hidden' }}>
        {isPayslipGenerated && (<div style={{ position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%) rotate(-32deg)', fontSize:'36px', fontWeight:800, letterSpacing:'3px', color:'rgba(198,40,40,0.09)', border:'3px solid rgba(198,40,40,0.09)', padding:'8px 18px', whiteSpace:'nowrap', pointerEvents:'none', zIndex:2 }}>Payslip Generated — View Only</div>)}
        {/* Header */}
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" />
          <div className="onduty-company-title">
            {companyName}
            <br />
            <span className="onduty-slip-title">TOUR APPLICATION SLIP</span>
          </div>
          {submissionStatus && (
            <div className="onduty-before-box">{submissionStatus}</div>
          )}
        </div>

        {/* Details Table */}
        <table className="onduty-field-table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '110px' }} />
            <col style={{ width: '20px' }} />
            <col style={{ width: '170px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '20px' }} />
            <col style={{ width: '170px' }} />
            <col style={{ width: '40px' }} />
            <col style={{ width: '5px' }} />
            <col style={{ width: '70px' }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="label">Tour ID</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }}>{tour_id}</td>

              <td className="label">Entry Date</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }} colSpan={4}>{formatDate(tour_date)}</td>
            </tr>
            <tr>
              <td className="label">Emp Id</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }}>{empid}</td>

              <td className="label">Emp Name</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }} colSpan={4}>{ename}</td>
            </tr>
            <tr>
              <td className="label">Unit</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }}>{unit}</td>

              <td className="label">Division</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }} colSpan={4}>{division}</td>
            </tr>
            <tr>
              <td className="label">Department</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }}>{department}</td>

              <td className="label">Designation</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }} colSpan={4}>{designation}</td>
            </tr>
            <tr>
              <td colSpan={9}><hr /></td>
            </tr>
            <tr>
              <td className="label">From Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(tour_from_date)}</td>

              <td className="label">To Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(tour_to_date)}</td>

              <td className="label">Days</td>
              <td className="colon">:</td>
              <td className="value">{
                tour_from_date && tour_to_date ?
                  Math.ceil((new Date(tour_to_date) - new Date(tour_from_date)) / (1000 * 60 * 60 * 24)) + 1
                  : ""
              }</td>
            </tr>
            <tr>
              <td className="label">Destination</td>
              <td className="colon">:</td>
              <td colSpan={7} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px 4px 10px' }}>{destination}</td>
            </tr>
            <tr>
              <td className="label">Purpose</td>
              <td className="colon">:</td>
              <td colSpan={7} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px 4px 10px' }}>{purpose}</td>
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

        {/* Notes (Optional - same as onduty) */}
        <div className="onduty-note">
          * Up to Operators level approved signature is sufficient<br />
          * Above Operators level Authorized signature is also must
        </div>

        {/* Actions */}
        <div className="onduty-actions no-print">
          <button onClick={() => window.print()} disabled={isPayslipGenerated} title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"} style={isPayslipGenerated ? {opacity:0.5,cursor:'not-allowed'}:{}}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
        {isPayslipGenerated && <div style={{ fontSize:11, color:'#c62828', textAlign:'center', marginTop:6 }}>Payslip generated for this month — print disabled</div>}
      </div>
    </div>
  );
};

export default TourPreview;
