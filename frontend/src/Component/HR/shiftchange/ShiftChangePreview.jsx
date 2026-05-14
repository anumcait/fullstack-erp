import React from "react";
import "../onduty/OnDutyPreview.css"; // Reuse standardized styling
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDateTimeAMPM } from "../../../utils/dateUtils";

const ShiftChangePreview = ({ data = {}, onClose }) => {
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

  const displayDays = (no_of_hrs && no_of_hrs !== "") ? no_of_hrs : calculateDays(schange_from, schange_to);

  return (
    <div className="onduty-print-overlay">
      <div className="onduty-print-container">
        {/* Header */}
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" />
          <div className="onduty-company-title">
            AUCTOR HOME APPLIANCES LLP
            <br />
            <span className="onduty-slip-title">SHIFT CHANGE SLIP</span>
          </div>
          <div className={`onduty-before-box status-${app_status.toLowerCase()}`}>{app_status}</div>
        </div>

        {/* Details Table */}
        <table className="onduty-field-table">
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
        <table className="onduty-field-table">
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
          </tbody>
        </table>

        {/* Purpose & Remarks (separate tables for full-width wrapping) */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td className="label" style={{ width: '80px', fontWeight: 'bold', whiteSpace: 'nowrap', verticalAlign: 'top', padding: '4px 6px' }}>Purpose</td>
              <td className="colon" style={{ width: '10px', textAlign: 'center', verticalAlign: 'top', padding: '4px 6px' }}>:</td>
              <td style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px' }}>{purpose}</td>
            </tr>
            <tr>
              <td className="label" style={{ width: '80px', fontWeight: 'bold', whiteSpace: 'nowrap', verticalAlign: 'top', padding: '4px 6px' }}>Remarks</td>
              <td className="colon" style={{ width: '10px', textAlign: 'center', verticalAlign: 'top', padding: '4px 6px' }}>:</td>
              <td style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px' }}>{remarks}</td>
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
          * Application should be submitted at least 24 hours prior to the shift change.<br />
          * Subject to departmental exigencies and final approval by HR.
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

export default ShiftChangePreview;
