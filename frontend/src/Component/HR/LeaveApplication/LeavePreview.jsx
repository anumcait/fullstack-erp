import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LeavePreview.css";
import "../onduty/OnDutyPreview.css"; // Reuse standardized styling
import logo from "../../../assets/images/EQIC_Image.jpg"; // replace with your logo path
import PreviewFieldTableColgroup from "../common/PreviewFieldTableColgroup";

const LeavePreview = ({ data, onClose }) => {
  const [leaveData, setLeaveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch full leave data based on lno
  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        if (!data?.lno) return;

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leave/${data.lno}`);
        setLeaveData(res.data);
      } catch (err) {
        console.error("Failed to fetch leave details:", err);
        setError("Failed to fetch leave details.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveDetails();
  }, [data]);

  if (loading) {
    return (
      <div className="leave-preview">
        <p>Loading leave details...</p>
      </div>
    );
  }

  if (error || !data || (!loading && !leaveData)) {
    return (
      <div className="leave-preview">
        <p>{error || "No leave data found."}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  const {
    leaveAppNo = "",
    leaveDate = "",
    leaveDateShort = "",
    empNo = "",
    empName = "",
    designation = "",
    department = "",
    section = "",
    purpose = "",
    addressReason = "",
    phoneNo = "",
    clsEligible = 0,
    clsUtilised = 0,
    clsBalance = 0,
    elsEligible = 0,
    elsUtilised = 0,
    elsBalance = 0,
    lopOthersPrev = 0,
    lopOthersPres = 0,
    lopOthersTotal = 0,
    lopEsi = 0,
    sanctionDays = "",
    reportingDutyOn = "",
    companyDays = "",
    presentDays = "",
    absentDays = "",
    reportDate = "",
    leaves = [],
    leavesApplied = ""
  } = leaveData || {};

  return (
    <div className="leave-print-overlay">
      <div className="leave-print-container">
        {/* Standardized Header */}
        <div className="onduty-print-header">
          <img src={logo} alt="Logo" className="onduty-logo" style={{ height: "30px" }} />
          <div className="onduty-company-title">
            AUCTOR HOME APPLIANCES LLP
            <br />
            <span className="onduty-slip-title">LEAVE APPLICATION SLIP</span>
          </div>
          <div className="onduty-before-box">AFTER SUBMISSION</div>
        </div>

        {/* Basic Info Table */}
        <table className="onduty-field-table" style={{ marginTop: "10px" }}>
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label">Leave app. No</td>
              <td className="colon">:</td>
              <td className="value">{leaveAppNo}</td>

              <td className="label">Date</td>
              <td className="colon">:</td>
              <td className="value">{leaveDate}</td>
            </tr>
            <tr>
              <td className="label">Emp Id</td>
              <td className="colon">:</td>
              <td className="value">{empNo}</td>

              <td className="label">Emp Name</td>
              <td className="colon">:</td>
              <td className="value">{empName}</td>
            </tr>
            <tr>
              <td className="label">Designation</td>
              <td className="colon">:</td>
              <td className="value">{designation}</td>

              <td className="label">Department</td>
              <td className="colon">:</td>
              <td className="value">{department}</td>
            </tr>
            <tr>
              <td className="label">Leaves Applied</td>
              <td className="colon">:</td>
              <td className="value">{leavesApplied ? parseFloat(leavesApplied).toString() : ""} (days)</td>

              <td className="label">Section</td>
              <td className="colon">:</td>
              <td className="value">{section}</td>
            </tr>
          </tbody>
        </table>

        {/* Leaves Dates Table */}
        <div style={{ marginTop: "10px" }}>
          <table className="onduty-field-table">
            <PreviewFieldTableColgroup />
            <tbody>
              <tr>
                <td className="label" style={{ verticalAlign: 'top' }}>Leaves date(s)</td>
                <td className="colon" style={{ verticalAlign: 'top' }}>:</td>
                <td colSpan={4}>
                  <table style={{ borderCollapse: "collapse", width: "300px", border: "1px solid #ccc" }}>
                    <thead>
                      <tr>
                        <th style={{ border: "1px solid #ccc", padding: "2px", fontSize: "12px", background: "#f5f5f5" }}>From</th>
                        <th style={{ border: "1px solid #ccc", padding: "2px", fontSize: "12px", background: "#f5f5f5" }}>To</th>
                        <th style={{ border: "1px solid #ccc", padding: "2px", fontSize: "12px", background: "#f5f5f5" }}>Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((leave, index) => (
                        <tr key={index}>
                          <td style={{ border: "1px solid #ccc", textAlign: "center", padding: "2px", fontSize: "12px" }}>{leave.leaveFrom}</td>
                          <td style={{ border: "1px solid #ccc", textAlign: "center", padding: "2px", fontSize: "12px" }}>{leave.leaveTo}</td>
                          <td style={{ border: "1px solid #ccc", textAlign: "center", padding: "2px", fontSize: "12px" }}>{leave.leaveDay ? parseFloat(leave.leaveDay).toString() : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Purpose, Address, Phone */}
        <table className="onduty-field-table" style={{ marginTop: "5px" }}>
          <PreviewFieldTableColgroup />
          <tbody>
            <tr>
              <td className="label" style={{ verticalAlign: 'top' }}>Purpose</td>
              <td className="colon" style={{ verticalAlign: 'top' }}>:</td>
              <td colSpan={4} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top' }}>{purpose}</td>
            </tr>
            <tr>
              <td className="label" style={{ verticalAlign: 'top' }}>Address</td>
              <td className="colon" style={{ verticalAlign: 'top' }}>:</td>
              <td colSpan={4} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top' }}>{addressReason}</td>
            </tr>
            <tr>
              <td className="label" style={{ verticalAlign: 'top' }}>Phone No</td>
              <td className="colon" style={{ verticalAlign: 'top' }}>:</td>
              <td colSpan={4} className="value" style={{ verticalAlign: 'top' }}>{phoneNo}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontWeight: 'bold', fontSize: '12px', padding: '10px 5px 0' }}>
          I agree that my increment may be postponed if not reporting back in time.
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "5px", fontSize: "12px" }}>
          <span>Date: {leaveDateShort}</span>
          <span>Employee Signature</span>
        </div>

        <hr style={{ margin: "10px 0" }} />

        <div style={{ fontSize: '13px', fontWeight: '800', textAlign: 'center', background: "#eee", padding: "2px" }}>
          For Office Use
        </div>

        <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
          <div>
            <table style={{ fontSize: '12px', borderCollapse: 'collapse', width: '260px' }}>
              <thead>
                <tr>
                  <th></th>
                  <th style={{ border: '1px solid #ccc', background: "#f9f9f9" }}>Eligible</th>
                  <th style={{ border: '1px solid #ccc', background: "#f9f9f9" }}>Utilised</th>
                  <th style={{ border: '1px solid #ccc', background: "#f9f9f9" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CLs</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{clsEligible ? parseFloat(clsEligible).toString() : ""}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{clsUtilised ? parseFloat(clsUtilised).toString() : ""}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{clsBalance ? parseFloat(clsBalance).toString() : ""}</td>
                </tr>
                <tr>
                  <td>ELs</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{elsEligible ? parseFloat(elsEligible).toString() : ""}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{elsUtilised ? parseFloat(elsUtilised).toString() : ""}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{elsBalance ? parseFloat(elsBalance).toString() : ""}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '10px', textAlign: "center" }}>LOP</div>
            <table style={{ fontSize: '12px', borderCollapse: 'collapse', width: '260px' }}>
              <thead>
                <tr>
                  <th></th>
                  <th style={{ border: '1px solid #ccc', background: "#f9f9f9" }}>Prev</th>
                  <th style={{ border: '1px solid #ccc', background: "#f9f9f9" }}>Pres</th>
                  <th style={{ border: '1px solid #ccc', background: "#f9f9f9" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Others</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{lopOthersPrev}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{lopOthersPres}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{lopOthersTotal}</td>
                </tr>
                <tr>
                  <td>ESI</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{lopEsi}</td>
                  <td style={{ border: '1px solid #ccc' }}></td>
                  <td style={{ border: '1px solid #ccc' }}></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ flex: 1 }}>
            <table style={{ fontSize: '12px', width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '140px' }}>Sanction day(s)</td><td>:</td>
                  <td>{sanctionDays}</td>
                </tr>
                <tr>
                  <td>Reporting to duty on</td><td>:</td>
                  <td>{reportingDutyOn}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ borderCollapse: 'collapse', fontSize: '11px', marginTop: '10px', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '2px', background: "#f9f9f9" }}>Company<br />Days</th>
                  <th style={{ border: '1px solid #ccc', padding: '2px', background: "#f9f9f9" }}>Employee<br />Present</th>
                  <th style={{ border: '1px solid #ccc', padding: '2px', background: "#f9f9f9" }}>Employee<br />Absent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{companyDays}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{presentDays}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{absentDays}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ fontSize: '9px', marginTop: '5px', color: '#666' }}>* Data up to one day before approval.</div>
          </div>
        </div>

        <hr style={{ margin: "15px 0" }} />

        {/* Standardized Signatures */}
        <table className="onduty-signature-grid">
          <tbody>
            <tr>
              <td>
                <br /><br />
                <strong>Recommended</strong><br />
                Signature
              </td>
              <td>
                <br /><br />
                <strong>Approved</strong><br />
                Signature
              </td>
              <td>
                <br /><br />
                <strong>Authorized</strong><br />
                Signature
              </td>
              <td>
                <br /><br />
                <strong>GM</strong><br />
                Signature
              </td>
              <td>
                <br /><br />
                <strong>DIRECTOR</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '10px', textAlign: 'right', marginTop: '10px' }} className="no-print">
          Report Dated: {reportDate}
        </div>

        {/* Standardized Actions */}
        <div className="onduty-actions no-print">
          <button onClick={() => window.print()}>Print</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default LeavePreview;