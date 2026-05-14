import React from "react";
import "../onduty/OnDutyPreview.css"; // Reuse standardized styling
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";

const HRAttendancePreview = ({ data = {}, onClose }) => {
  const {
    att_date = "",
    empid = "",
    ename = "",
    unit = "",
    division = "",
    designation = "",
    department = "",
    shift = "",
    status = "",
    in_time = "",
    out_time = "",
    late_hrs = 0,
    ot_hrs = 0,
    remarks = ""
  } = data;

  return (
    <div className="onduty-print-overlay">
      <div className="onduty-print-container">
        {/* Header */}
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" />
          <div className="onduty-company-title">
            AUCTOR HOME APPLIANCES LLP
            <br />
            <span className="onduty-slip-title">ATTENDANCE RECORD SLIP</span>
          </div>
          <div className={`onduty-before-box status-${status.toLowerCase()}`}>{status}</div>
        </div>

        {/* Details Table */}
        <table className="onduty-field-table">
          <tbody>
            <tr>
              <td className="label">Date</td>
              <td className="colon">:</td>
              <td className="value">{att_date ? formatDate(att_date) : ""}</td>

              <td className="label">Emp Id</td>
              <td className="colon">:</td>
              <td className="value">{empid}</td>
            </tr>
            <tr>
              <td className="label">Emp Name</td>
              <td className="colon">:</td>
              <td className="value">{ename || data.employee?.ename || ""}</td>

              <td className="label">Unit</td>
              <td className="colon">:</td>
              <td className="value">{unit}</td>
            </tr>
            <tr>
              <td className="label">Division</td>
              <td className="colon">:</td>
              <td className="value">{division}</td>

              <td className="label">Department</td>
              <td className="colon">:</td>
              <td className="value">{department}</td>
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

        {/* Attendance Details */}
        <table className="onduty-field-table">
          <tbody>
            <tr>
              <td className="label">Shift</td>
              <td className="colon">:</td>
              <td className="value">{shift}</td>

              <td className="label">Status</td>
              <td className="colon">:</td>
              <td className="value">{status}</td>
            </tr>
            <tr>
              <td className="label">In Time</td>
              <td className="colon">:</td>
              <td className="value">{in_time || "--:--"}</td>

              <td className="label">Out Time</td>
              <td className="colon">:</td>
              <td className="value">{out_time || "--:--"}</td>
            </tr>
            <tr>
              <td className="label">Late Hrs</td>
              <td className="colon">:</td>
              <td className="value">{late_hrs}</td>

              <td className="label">OT Hrs</td>
              <td className="colon">:</td>
              <td className="value">{ot_hrs}</td>
            </tr>
          </tbody>
        </table>

        {/* Remarks (separate table for full-width wrapping) */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
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
                <strong>Verified</strong><br />
                Name: <br />
                E.I.D No.: <br /><br />
                Signature
              </td>
              <td>
                <strong>H.O.D</strong><br />
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
        <div className="onduty-actions no-print">
          <button onClick={() => window.print()}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default HRAttendancePreview;
