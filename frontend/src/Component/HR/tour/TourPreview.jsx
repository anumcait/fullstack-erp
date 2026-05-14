import React from "react";
import "../onduty/OnDutyPreview.css"; // Reuse standardized styling
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";

const TourPreview = ({ data = {}, onClose }) => {
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

  return (
    <div className="onduty-print-overlay">
      <div className="onduty-print-container">
        {/* Header */}
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" />
          <div className="onduty-company-title">
            AUCTOR HOME APPLIANCES LLP
            <br />
            <span className="onduty-slip-title">TOUR APPLICATION SLIP</span>
          </div>
          <div className={`onduty-before-box status-${status.toLowerCase()}`}>{status}</div>
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
              <td className="value" style={{ paddingLeft: '10px' }}>{formatDate(tour_from_date)}</td>

              <td className="label">To Date</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }}>{formatDate(tour_to_date)}</td>

              <td className="label">Days</td>
              <td className="colon">:</td>
              <td className="value" style={{ paddingLeft: '10px' }}>{
                tour_from_date && tour_to_date ?
                  Math.ceil((new Date(tour_to_date) - new Date(tour_from_date)) / (1000 * 60 * 60 * 24)) + 1
                  : ""
              }</td>
            </tr>
          </tbody>
        </table>

        {/* Destination & Purpose (separate tables for full-width wrapping) */}
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '110px' }} />
            <col style={{ width: '20px' }} />
            <col style={{ width: '620px' }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="label" style={{ fontWeight: 'bold', whiteSpace: 'nowrap', verticalAlign: 'top', padding: '4px 6px' }}>Destination</td>
              <td className="colon" style={{ textAlign: 'center', verticalAlign: 'top', padding: '4px 6px' }}>:</td>
              <td style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px 4px 10px' }}>{destination}</td>
            </tr>
            <tr>
              <td className="label" style={{ fontWeight: 'bold', whiteSpace: 'nowrap', verticalAlign: 'top', padding: '4px 6px' }}>Purpose</td>
              <td className="colon" style={{ textAlign: 'center', verticalAlign: 'top', padding: '4px 6px' }}>:</td>
              <td style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px 4px 10px' }}>{purpose}</td>
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
          <button onClick={() => window.print()}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TourPreview;
