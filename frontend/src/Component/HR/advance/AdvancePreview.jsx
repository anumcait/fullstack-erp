import React from "react";
import "./AdvancePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";

const AdvancePreview = ({ data = {}, onClose }) => {
  const {
    advance_id = "--",
    advance_date = "--",
    empid = "--",
    ename = "--",
    unit = "--",
    division = "--",
    designation = "--",
    advance_type = "--",
    advance_amount = "--",
    reason = "--",
    advance_from_date = "--",
    advance_to_date = "--",
    no_of_installments = "--",
    monthly_installment = "--"
  } = data;

  return (
    <div className="onduty-print-overlay">
      <div className="onduty-print-container">
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" />
          <div className="onduty-company-title">
            AUCTOR HOME APPLIANCES LLP
            <br />
            <span className="onduty-slip-title">SALARY ADVANCE REQUEST</span>
          </div>
        </div>

        <table className="onduty-field-table">
          <tbody>
            <tr>
              <td className="label">Advance No</td>
              <td className="colon">:</td>
              <td className="value">{advance_id}</td>

              <td className="label">Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(advance_date)}</td>
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
              <td></td>
              <td className="colon"></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <hr />

        <table className="onduty-field-table">
          <tbody>
            <tr>
              <td className="label">Advance Type</td>
              <td className="colon">:</td>
              <td className="value">{advance_type}</td>

              <td className="label">Amount</td>
              <td className="colon">:</td>
              <td className="value">{advance_amount}</td>
            </tr>
            <tr>
              <td className="label">From Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(advance_from_date)}</td>

              <td className="label">To Date</td>
              <td className="colon">:</td>
              <td className="value">{formatDate(advance_to_date)}</td>
            </tr>
            <tr>
              <td className="label">No of Installments</td>
              <td className="colon">:</td>
              <td className="value">{no_of_installments}</td>

              <td className="label">Monthly Installment</td>
              <td className="colon">:</td>
              <td className="value">{monthly_installment}</td>
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

export default AdvancePreview;
