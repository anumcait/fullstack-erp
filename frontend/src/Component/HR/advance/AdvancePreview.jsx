import React from "react";
import "./AdvancePreview.css"; // Dedicated styling sheet
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDate } from "../../../utils/dateUtils";
import PreviewFieldTableColgroup from "../common/PreviewFieldTableColgroup";

const AdvancePreview = ({ data = {}, onClose }) => {
  const {
    advance_id = "--",
    advance_date = "--",
    empid = "--",
    ename = "--",
    unit = "--",
    division = "--",
    designation = "--",
    advance_amount = "--",
    reason = "--",
    gross_salary = "--",
    no_of_installments = "--",
    doj = ""
  } = data;

  // Previous Advance Details (For Office Use)
  const prev_sanction_date = data.prev_sanction_date || data.prevSanctionDate || "";
  const prev_amount = data.prev_amount || data.prevAmount || "";
  const prev_balance = data.prev_balance || data.prevBalance || "";
  const prev_note = data.prev_note || data.prevNote || "";
  const prev_clear_date = data.prev_clear_date || data.prevClearDate || "";
  const prev_times_taken = data.prev_times_taken || data.prevTimesTaken || "";

  // Current Sanction Details (For Office Use)
  const sanction_amount = data.sanction_amount || data.sanctionAmount || "";
  const sanction_date = data.sanction_date || data.sanctionDate || "";

  return (
    <div className="adv-print-overlay">
      <div className="adv-print-container">
        {/* Header */}
        <div className="adv-print-header">
          <img src={logo} alt="Logo" className="adv-logo" />
          <div className="adv-company-title">
            AUCTOR HOME APPLIANCES LLP
            <br />
            <span className="adv-slip-title">SALARY ADVANCE REQUEST</span>
          </div>
          <div style={{ width: '80px' }}></div> {/* Spacer to perfectly center company title */}
        </div>

        {/* Details Table */}
        <table className="adv-field-table">
          <PreviewFieldTableColgroup />
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

              <td className="label">Date of Joining</td>
              <td className="colon">:</td>
              <td className="value">{doj ? formatDate(doj) : ""}</td>
            </tr>
            <tr>
              <td className="label">Present Salary</td>
              <td className="colon">:</td>
              <td className="value">{gross_salary ? parseFloat(gross_salary).toString() : "--"}</td>
              <td className="label"></td>
              <td className="colon"></td>
              <td className="value"></td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0 10px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#000' }}></div>
          <span style={{ padding: '0 10px', fontWeight: 'bold', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ADVANCE DETAILS
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#000' }}></div>
        </div>
        <table className="adv-field-table">
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">Advance Applied</td>
              <td className="colon">:</td>
              <td className="value">{advance_amount ? parseFloat(advance_amount).toString() : "--"}</td>

              <td className="label">Mode of Repayment</td>
              <td className="colon">:</td>
              <td className="value">{no_of_installments} Installments</td>
            </tr>
            <tr>
              <td className="label">Purpose of Advance</td>
              <td className="colon">:</td>
              <td colSpan={4} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px' }}>{reason}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '10px', marginBottom: '5px', fontSize: '9px', fontWeight: 'bold', fontStyle: 'italic', color: '#000', textAlign: 'left', lineHeight: '1.3' }}>
          * Note: Amount will be given after 2 working days from the date of submission to Accounts Dept.
        </div>

        {/* Employee Signature Block */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px', marginBottom: '2px', paddingRight: '15px' }}>
          <div style={{ fontSize: '9px', fontWeight: 'bold' }}>
            Employee Signature
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 15px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#000' }}></div>
          <span style={{ padding: '0 10px', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            FOR OFFICE USE
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#000' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'top' }}>
          {/* Column 1: Prev Details (Left) */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', textDecoration: 'underline', marginBottom: '5px' }}>
              Previous Advance Details
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <tbody>
                <tr>
                  <td className="label" style={{ width: '80px', padding: '4px 6px', fontSize: '12px', whiteSpace: 'nowrap', lineHeight: '1.2' }}>Sanction Date</td>
                  <td className="colon" style={{ padding: '4px 6px', fontSize: '12px' }}>:</td>
                  <td className="value" style={{ padding: '4px 6px', fontSize: '12px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{prev_sanction_date ? formatDate(prev_sanction_date) : ""}</td>
                </tr>
                <tr>
                  <td className="label" style={{ padding: '4px 6px', fontSize: '12px', whiteSpace: 'normal', lineHeight: '1.2' }}>Amount</td>
                  <td className="colon" style={{ padding: '4px 6px', fontSize: '12px' }}>:</td>
                  <td className="value" style={{ padding: '4px 6px', fontSize: '12px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{prev_amount ? parseFloat(prev_amount).toString() : ""}</td>
                </tr>
                <tr>
                  <td className="label" style={{ padding: '4px 6px', fontSize: '12px', whiteSpace: 'normal', lineHeight: '1.2' }}>Balance</td>
                  <td className="colon" style={{ padding: '4px 6px', fontSize: '12px' }}>:</td>
                  <td className="value" style={{ padding: '4px 6px', fontSize: '12px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{prev_balance ? parseFloat(prev_balance).toString() : ""}</td>
                </tr>
                <tr>
                  <td className="label" style={{ padding: '4px 6px', fontSize: '12px', whiteSpace: 'normal', lineHeight: '1.2' }}>Note</td>
                  <td className="colon" style={{ padding: '4px 6px', fontSize: '12px' }}>:</td>
                  <td className="value" style={{ padding: '4px 6px', fontSize: '12px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{prev_note}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Column 2: Prev Details (Middle) */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', visibility: 'hidden', marginBottom: '5px' }}>
              Spacer
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <tbody>
                <tr>
                  <td className="label" style={{ width: '75px', padding: '4px 6px', fontSize: '12px', whiteSpace: 'normal', lineHeight: '1.2' }}>Clear Date</td>
                  <td className="colon" style={{ padding: '4px 6px', fontSize: '12px' }}>:</td>
                  <td className="value" style={{ padding: '4px 6px', fontSize: '12px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{prev_clear_date ? formatDate(prev_clear_date) : ""}</td>
                </tr>
                <tr>
                  <td className="label" style={{ padding: '4px 6px', fontSize: '12px', whiteSpace: 'normal', lineHeight: '1.2' }}>
                    No of times<br />advance taken
                  </td>
                  <td className="colon" style={{ padding: '4px 6px', fontSize: '12px' }}>:</td>
                  <td className="value" style={{ padding: '4px 6px', fontSize: '12px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{prev_times_taken}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Column 3: Sanction Details (Right) */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', visibility: 'hidden', marginBottom: '5px' }}>
              Spacer
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <tbody>
                <tr>
                  <td className="label" style={{ width: '90px', padding: '4px 6px', fontSize: '12px', whiteSpace: 'nowrap', lineHeight: '1.2' }}>Sanction Amount</td>
                  <td className="colon" style={{ padding: '4px 6px', fontSize: '12px' }}>:</td>
                  <td className="value" style={{ padding: '4px 6px', fontSize: '12px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{sanction_amount ? parseFloat(sanction_amount).toString() : ""}</td>
                </tr>
                <tr>
                  <td className="label" style={{ padding: '4px 6px', fontSize: '12px', whiteSpace: 'nowrap', lineHeight: '1.2' }}>Sanction Date</td>
                  <td className="colon" style={{ padding: '4px 6px', fontSize: '12px' }}>:</td>
                  <td className="value" style={{ padding: '4px 6px', fontSize: '12px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{sanction_date ? formatDate(sanction_date) : ""}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr />

        {/* Signatures */}
        <table className="adv-signature-grid">
          <tbody>
            <tr>
              <td>
                <strong>Approved By</strong><br />
                Name:<br />
                E.I.D No.:<br /><br />
                Signature
              </td>
              <td>
                <strong>Authorised By</strong><br />
                Name:<br />
                E.I.D No.:<br /><br />
                Signature
              </td>
              <td>
                <br /><br /><br />
                <strong>Director</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Actions */}
        <div className="adv-actions no-print">
          <button onClick={() => window.print()}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AdvancePreview;
