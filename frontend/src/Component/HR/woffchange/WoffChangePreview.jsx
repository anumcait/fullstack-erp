import React from "react";
import "./WoffChangePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";

const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const WoffChangePreview = ({ data = {}, onClose }) => {
  const {
    woff_id = "--",
    woff_date = "--",
    empid = "--",
    ename = "--",
    unit = "--",
    division = "--",
    designation = "--",
    current_woff_day = "--",
    requested_woff_day = "--",
    woff_from_date = "--",
    woff_to_date = "--",
    reason = "--",
    status = "--"
  } = data;

  return (
    <div className="onduty-print-overlay" onClick={onClose}>
      <div className="onduty-print-container" onClick={(e) => e.stopPropagation()}>
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" />
          <div className="onduty-company-title">
            AUCTOR HOME APPLIANCES LLP
            <br />
            <span className="onduty-slip-title">WOFF CHANGE APPLICATION</span>
          </div>
          <div className={`onduty-status-badge status-${status.toLowerCase()}`}>
            {status}
          </div>
        </div>

        <table className="onduty-details-table">
          <tbody>
            <tr>
              <td className="label-cell">Woff ID</td>
              <td className="value-cell">{woff_id}</td>
              <td className="label-cell">Woff Date</td>
              <td className="value-cell">{formatDate(woff_date)}</td>
            </tr>
            <tr>
              <td className="label-cell">Employee ID</td>
              <td className="value-cell">{empid}</td>
              <td className="label-cell">Name</td>
              <td className="value-cell">{ename}</td>
            </tr>
            <tr>
              <td className="label-cell">Unit</td>
              <td className="value-cell">{unit}</td>
              <td className="label-cell">Division</td>
              <td className="value-cell">{division}</td>
            </tr>
            <tr>
              <td className="label-cell">Designation</td>
              <td className="value-cell" colSpan={3}>{designation}</td>
            </tr>
            <tr>
              <td className="label-cell">Current Woff Day</td>
              <td className="value-cell">{current_woff_day}</td>
              <td className="label-cell">Requested Woff Day</td>
              <td className="value-cell">{requested_woff_day}</td>
            </tr>
            <tr>
              <td className="label-cell">From Date</td>
              <td className="value-cell">{formatDate(woff_from_date)}</td>
              <td className="label-cell">To Date</td>
              <td className="value-cell">{formatDate(woff_to_date)}</td>
            </tr>
            <tr>
              <td className="label-cell">Reason</td>
              <td className="value-cell" colSpan={3}>{reason}</td>
            </tr>
          </tbody>
        </table>

        <div className="onduty-signature-section">
          <div className="signature-box">
            <p>Employee Signature</p>
            <div className="signature-line"></div>
          </div>
          <div className="signature-box">
            <p>Reporting Manager</p>
            <div className="signature-line"></div>
          </div>
          <div className="signature-box">
            <p>HR Approval</p>
            <div className="signature-line"></div>
          </div>
        </div>

        <div className="onduty-print-actions">
          <button className="print-btn" onClick={() => window.print()}>Print</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default WoffChangePreview;
