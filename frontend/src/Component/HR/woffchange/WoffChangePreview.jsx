import React from "react";
import "./WoffChangePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate, formatDateOnly } from "../../../utils/dateUtils";

const WoffChangePreview = ({ data = {}, onClose }) => {
  const {
    woff_id = "--",
    woff_date = "--",
    empid = "--",
    ename = "--",
    unit = "--",
    division = "--",
    designation = "--",
    department = "--",
    section = "--",
    current_woff_day = "--",
    requested_woff_day = "--",
    woff_from_date = "--",
    woff_to_date = "--",
    shift_cd = "--",
    reason = "--",
    remarks = "--"
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
            <span className="onduty-slip-title">WEEKLY OFF CHANGE APPLICATION</span>
          </div>
        </div>

        {/* Employee Details Table */}
        <table className="onduty-field-table">
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
        <table className="onduty-field-table">
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
              <td className="value" colSpan={4}>{reason}</td>
            </tr>
            <tr>
              <td className="label">Remarks</td>
              <td className="colon">:</td>
              <td className="value" colSpan={4}>{remarks}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Signature Grid */}
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
          * Employee must submit this form at least 24 hours in advance.<br />
          * Approval from Department Head and HR is mandatory for processing Weekly Off changes.
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

export default WoffChangePreview;
