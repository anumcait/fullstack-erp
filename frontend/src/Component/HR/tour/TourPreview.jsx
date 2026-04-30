import React from "react";
import "./TourPreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";

const TourPreview = ({ data = {}, onClose }) => {
  const {
    tour_id = "--",
    tour_date = "--",
    empid = "--",
    ename = "--",
    unit = "--",
    division = "--",
    designation = "--",
    tour_from_date = "--",
    tour_to_date = "--",
    destination = "--",
    purpose = "--",
    estimated_amount = "--",
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
            <span className="onduty-slip-title">TOUR APPLICATION</span>
          </div>
          <div className={`onduty-status-badge status-${status.toLowerCase()}`}>
            {status}
          </div>
        </div>

        <table className="onduty-details-table">
          <tbody>
            <tr>
              <td className="label-cell">Tour ID</td>
              <td className="value-cell">{tour_id}</td>
              <td className="label-cell">Tour Date</td>
              <td className="value-cell">{formatDate(tour_date)}</td>
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
              <td className="label-cell">From Date</td>
              <td className="value-cell">{formatDate(tour_from_date)}</td>
              <td className="label-cell">To Date</td>
              <td className="value-cell">{formatDate(tour_to_date)}</td>
            </tr>
            <tr>
              <td className="label-cell">Destination</td>
              <td className="value-cell" colSpan={3}>{destination}</td>
            </tr>
            <tr>
              <td className="label-cell">Purpose</td>
              <td className="value-cell" colSpan={3}>{purpose}</td>
            </tr>
            <tr>
              <td className="label-cell">Estimated Amount</td>
              <td className="value-cell" colSpan={3}>₹ {estimated_amount || "0.00"}</td>
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

export default TourPreview;
