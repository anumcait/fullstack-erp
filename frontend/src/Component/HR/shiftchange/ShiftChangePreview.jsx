import React from "react";
import "./ShiftChangePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";

const ShiftChangePreview = ({ data = {}, onClose }) => {
  const {
    schange_no = "--",
    schange_date = "--",
    empid = "--",
    empname = "--",
    unit = "--",
    division = "--",
    designation = "--",
    department = "--",
    section = "--",
    actual_shift = "--",
    act_start_time = "--",
    act_end_time = "--",
    change_shift = "--",
    cha_start_time = "--",
    cha_end_time = "--",
    schange_from = "--",
    schange_to = "--",
    no_of_hrs = "--",
    remarks = "--",
    purpose = "--"
  } = data;

  return (
    <div className="onduty-print-overlay" onClick={onClose}>
      <div className="onduty-print-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" />
          <div className="onduty-company-title">
            AUCTOR HOME APPLIANCES LLP
            <br />
            <span className="onduty-slip-title">SHIFT CHANGE APPLICATION</span>
          </div>
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
              <td className="value">{formatDate(schange_date)}</td>
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
              <td className="value">{actual_shift} ({act_start_time}-{act_end_time})</td>

              <td className="label">Change Shift</td>
              <td className="colon">:</td>
              <td className="value">{change_shift} ({cha_start_time}-{cha_end_time})</td>
            </tr>
            <tr>
              <td className="label">From Date</td>
              <td className="colon">:</td>
              <td className="value">{schange_from ? schange_from.slice(0, 10).split('-').reverse().join('-') : "--"}</td>

              <td className="label">To Date</td>
              <td className="colon">:</td>
              <td className="value">{schange_to ? schange_to.slice(0, 10).split('-').reverse().join('-') : "--"}</td>

              <td className="label">Days</td>
              <td className="colon">:</td>
              <td className="value">{no_of_hrs}</td>
            </tr>
            <tr>
              <td className="label">Purpose</td>
              <td className="colon">:</td>
              <td className="value" colSpan={9}>{purpose}</td>
            </tr>
            <tr>
              <td className="label">Remarks</td>
              <td className="colon">:</td>
              <td className="value" colSpan={9}>{remarks}</td>
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
