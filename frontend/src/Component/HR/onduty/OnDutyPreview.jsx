import React from "react";
import "./OnDutyPreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";
import PreviewFieldTableColgroup from "../common/PreviewFieldTableColgroup";
import { useCompany } from "../../../context/CompanyContext";

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
      <div className="onduty-print-container">
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
          <button onClick={() => window.print()}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default OnDutyPreview; 
