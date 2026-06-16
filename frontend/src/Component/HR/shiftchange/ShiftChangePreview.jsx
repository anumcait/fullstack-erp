import React from "react";
import "./ShiftChangePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDateTimeAMPM } from "../../../utils/dateUtils";
import PreviewFieldTableColgroup from "../common/PreviewFieldTableColgroup";
import { useCompany } from "../../../context/CompanyContext";

const ShiftChangePreview = ({ data = {}, onClose }) => {
  const { companyName } = useCompany();
  const calculateDays = (from, to) => {
    if (!from || !to || from === "" || to === "") return "";
    const d1 = new Date(from);
    const d2 = new Date(to);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return "";
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : "";
  };

  const {
    schange_no = "",
    schange_date = "",
    empid = "",
    empname = "",
    unit = "",
    division = "",
    designation = "",
    department = "",
    section = "",
    act_shift = "",
    act_sstart_time = "",
    act_send_time = "",
    change_shift = "",
    cha_sstart_time = "",
    cha_send_time = "",
    schange_from = "",
    schange_to = "",
    no_of_hrs = "",
    remarks = "",
    purpose = "",
    app_status = "Pending"
  } = data;

  let submissionStatus = "";
  if (schange_from && schange_date) {
    const entryDate = new Date(schange_date);
    const fromDate = new Date(schange_from);
    if (fromDate > entryDate) {
      submissionStatus = "BEFORE SUBMISSION";
    } else {
      submissionStatus = "AFTER SUBMISSION";
    }
  }

  const displayDays = (no_of_hrs && no_of_hrs !== "") ? no_of_hrs : calculateDays(schange_from, schange_to);

  return (
    <div className="schange-print-overlay">
      <div className="schange-print-container">
        {/* Header */}
        <div className="schange-print-header">
          <img src={logo} alt="Logo" className="schange-logo" />
          <div className="schange-company-title">
            {companyName}
            <br />
            <span className="schange-slip-title">SHIFT CHANGE SLIP</span>
          </div>
          {submissionStatus && (
            <div className="schange-before-box">{submissionStatus}</div>
          )}
        </div>

        {/* Details Table */}
        <table className="schange-field-table">
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">Schange No</td>
              <td className="colon">:</td>
              <td className="value">{schange_no}</td>

              <td className="label">Entry Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDateTimeAMPM(schange_date)}</td>
            </tr>
            <tr>
              <td className="label">Emp Id</td>
              <td className="colon">:</td>
              <td className="value">{empid}</td>

              <td className="label">Emp Name</td>
              <td className="colon">:</td>
              <td className="value">{empname}</td>
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

              <td className="label">Designation</td>
              <td className="colon">:</td>
              <td className="value">{designation}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Shift Details */}
        <table className="schange-field-table">
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">Actual Shift</td>
              <td className="colon">:</td>
              <td className="value">{act_shift} {act_sstart_time && act_send_time && `(${act_sstart_time} - ${act_send_time})`}</td>

              <td className="label">Change Shift</td>
              <td className="colon">:</td>
              <td className="value">{change_shift} {cha_sstart_time && cha_send_time && `(${cha_sstart_time} - ${cha_send_time})`}</td>
            </tr>
            <tr>
              <td className="label">From Date</td>
              <td className="colon">:</td>
              <td className="value">{schange_from ? schange_from.slice(0, 10).split('-').reverse().join('-') : ""}</td>

              <td className="label">To Date</td>
              <td className="colon">:</td>
              <td className="value">{schange_to ? schange_to.slice(0, 10).split('-').reverse().join('-') : ""}</td>
            </tr>
            <tr>
              <td className="label">Days</td>
              <td className="colon">:</td>
              <td className="value">{displayDays}</td>
              <td className="label"></td>
              <td className="colon"></td>
              <td className="value"></td>
            </tr>
            <tr>
              <td className="label">Purpose</td>
              <td className="colon">:</td>
              <td colSpan={4} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top' }}>{purpose}</td>
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
        <table className="schange-signature-grid">
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
        <div className="schange-note">
          * Application should be submitted at least 24 hours prior to the shift change.<br />
          * Subject to departmental exigencies and final approval by HR.
        </div>

        {/* Actions */}
        <div className="schange-actions no-print">
          <button onClick={() => window.print()}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShiftChangePreview;
