import React from "react";
import "./ESILeavePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";

const ESILeavePreview = ({ data = {}, onClose }) => {
  const {
    esi_leave_id = "--",
    esi_leave_date = "--",
    empid = "--",
    ename = "--",
    unit = "--",
    division = "--",
    designation = "--",
    esi_no = "--",
    esi_dispencery = "--",
    hospital_name = "--",
    leave_from_date = "--",
    leave_to_date = "--",
    no_of_days = "--",
    reason = "--"
  } = data;

  return (
    <div className="onduty-print-overlay">
      <div className="onduty-print-container">
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" />
          <div className="onduty-company-title">
            AUCTOR HOME APPLIANCES LLP
            <br />
            <span className="onduty-slip-title">ESI LEAVE REQUEST</span>
          </div>
        </div>

        <table className="onduty-field-table">
          <tbody>
            <tr>
              <td className="label">ESI Leave No</td>
              <td className="colon">:</td>
              <td className="value">{esi_leave_id}</td>

              <td className="label">Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(esi_leave_date)}</td>
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

              <td className="label">ESI No</td>
              <td className="colon">:</td>
              <td className="value">{esi_no}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <table className="onduty-field-table">
          <tbody>
            <tr>
              <td className="label">ESI Dispencery</td>
              <td className="colon">:</td>
              <td className="value">{esi_dispencery}</td>

              <td className="label">Hospital</td>
              <td className="colon">:</td>
              <td className="value">{hospital_name}</td>
            </tr>
            <tr>
              <td className="label">From Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(leave_from_date)}</td>

              <td className="label">To Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(leave_to_date)}</td>
            </tr>
            <tr>
              <td className="label">No of Days</td>
              <td className="colon">:</td>
              <td className="value">{no_of_days}</td>
              <td></td>
              <td className="colon"></td>
              <td></td>
            </tr>
            <tr>
              <td className="label">Reason</td>
              <td className="colon">:</td>
              <td className="value" colSpan={5}>{reason}</td>
            </tr>
          </tbody>
        </table>

        <hr />

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

        <div className="onduty-actions no-print">
          <button onClick={() => window.print()}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ESILeavePreview;
