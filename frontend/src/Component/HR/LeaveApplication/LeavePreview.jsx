import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LeavePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { formatDateTimeAMPM, formatReportDate } from "../../../utils/dateUtils";
import { useCompany } from "../../../context/CompanyContext";

// Format numeric value: show 0 for empty/null, clamp negatives to 0
const fmtNum = (val) => {
  const num = parseFloat(val);
  if (isNaN(num) || num < 0) return "0";
  return num.toString();
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strTime = String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;

  return `${dd}-${mm}-${yy} ${strTime}`;
};

const LeavePreview = ({ data, onClose }) => {
  const { companyName } = useCompany();
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
    leavesApplied = "",
    ldateRaw,
    firstFromDate,
    beforeSubmission = 0,
    afterSubmission = 0
  } = leaveData || {};

  let submissionStatus = "";
  if (ldateRaw && firstFromDate) {
    const ldate = new Date(ldateRaw);
    const fdate = new Date(firstFromDate);
    ldate.setHours(0, 0, 0, 0);
    fdate.setHours(0, 0, 0, 0);
    if (ldate < fdate) {
      submissionStatus = "BEFORE SUBMISSION";
    } else {
      submissionStatus = "AFTER SUBMISSION";
    }
  }

  return (
    <div className="leave-print-overlay">
      <div className="leave-print-container" style={{ paddingBottom: '30px' }}>
        {/* Standardized Header */}
        <div className="leave-report-header-container">
          <div className="leave-report-header-top" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={logo} alt="Logo" className="leave-logo-img-small" style={{ position: 'absolute', left: 0 }} />
            <div className="header-company-name-small" style={{ textAlign: 'center' }}>{companyName}</div>
          </div>
          <div className="leave-report-header-bottom">
            <div className="header-spacer"></div>
            <div className="header-center-title" style={{ flex: '0 1 auto', margin: '15px auto' }}>LEAVE APPLICATION</div>
            <div className="header-right-status">
              {submissionStatus && (
                <div className="header-status-box-small">
                  {submissionStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info Table */}
        <table className="leave-field-table" style={{ marginTop: "10px" }}>
          <colgroup>
            <col className="preview-col-label" />
            <col className="preview-col-colon" />
            <col className="preview-col-value" />
            <col className="preview-col-label" />
            <col className="preview-col-colon" />
            <col className="preview-col-value" />
          </colgroup>
          <tbody>
            <tr>
              <td className="label">Leave app. No</td>
              <td className="colon">:</td>
              <td className="value">{leaveAppNo}</td>

              <td className="label">Date</td>
              <td className="colon">:</td>
              <td className="value" style={{ whiteSpace: 'nowrap' }}>{formatDateTimeAMPM(ldateRaw || leaveDate)}</td>
            </tr>
            <tr>
              <td className="label">Emp No</td>
              <td className="colon">:</td>
              <td className="value">{empNo}</td>

              <td className="label">Emp name</td>
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
              <td className="label">Leaves Applied day(s)</td>
              <td className="colon">:</td>
              <td className="value">{leavesApplied ? parseFloat(leavesApplied).toString() : ""}</td>

              <td className="label">Section</td>
              <td className="colon">:</td>
              <td className="value">{section}</td>
            </tr>
          </tbody>
        </table>

        {/* Leaves Dates Table */}
        <div style={{ marginTop: "10px" }}>
          <table className="leave-movement-table">
            <colgroup>
              <col className="preview-col-label" />
              <col className="preview-col-colon" />
              <col className="preview-col-value" />
              <col className="preview-col-label" />
              <col className="preview-col-colon" />
              <col className="preview-col-value" />
            </colgroup>
            <tbody>
              <tr>
                <td className="label" style={{ verticalAlign: 'top' }}>Leaves date(s)</td>
                <td className="colon" style={{ verticalAlign: 'top' }}>:</td>
                <td colSpan={4}>
                  <table className="leave-dates-table" style={{ borderCollapse: "collapse", width: "240px" }}>
                    <thead>
                      <tr>
                        <th style={{ border: "1px solid #000", padding: "2px", fontSize: "12px", background: "#f5f5f5" }}>From</th>
                        <th style={{ border: "1px solid #000", padding: "2px", fontSize: "12px", background: "#f5f5f5" }}>To</th>
                        <th style={{ border: "1px solid #000", padding: "2px", fontSize: "12px", background: "#f5f5f5" }}>Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const displayLeaves = [...leaves];
                        while (displayLeaves.length < 5) {
                          displayLeaves.push({ leaveFrom: "", leaveTo: "", leaveDay: "" });
                        }
                        return displayLeaves.map((leave, index) => {
                          const isEmpty = !leave.leaveFrom && !leave.leaveTo && !leave.leaveDay;

                          return (
                            <tr key={index} style={{ height: "18px" }}>
                              <td style={{ border: isEmpty ? "none" : "1px solid #000", textAlign: "center", padding: "2px", fontSize: "12px" }}>
                                {leave.leaveFrom || "\u00A0"}
                              </td>
                              <td style={{ border: isEmpty ? "none" : "1px solid #000", textAlign: "center", padding: "2px", fontSize: "12px" }}>
                                {leave.leaveTo || "\u00A0"}
                              </td>
                              <td style={{ border: isEmpty ? "none" : "1px solid #000", textAlign: "center", padding: "2px", fontSize: "12px" }}>
                                {leave.leaveDay || "\u00A0"}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Purpose, Address, Phone */}
        <table className="leave-field-table leave-movement-table" style={{ marginTop: "5px" }}>
          <colgroup>
            <col className="preview-col-label" />
            <col className="preview-col-colon" />
            <col colSpan={4} />
          </colgroup>
          <tbody>
            <tr>
              <td className="label">Purpose</td>
              <td className="colon">:</td>
              <td colSpan={4} className="preview-field-data" style={{ fontWeight: 600, wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px' }}>{purpose}</td>
            </tr>

            <tr>
              <td className="label">Address/Reason</td>
              <td className="colon">:</td>
              <td colSpan={4} className="preview-field-data" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', verticalAlign: 'top', padding: '4px 6px' }}>{addressReason}</td>
            </tr>
            <tr>
              <td className="label">Phone No</td>
              <td className="colon">:</td>
              <td colSpan={4} className="value" style={{ verticalAlign: 'top', padding: '4px 6px' }}>{phoneNo}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontWeight: 'bold', fontSize: '10px', padding: '2px 5px 0', marginTop: '10px' }}>
          I agree that my increment may be postponed if not reporting back in time.
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 5px", fontSize: "12px", marginTop: "15px" }}>
          <span>Date : {leaveDateShort}</span>
          <span style={{ fontWeight: 'bold', marginRight: '50px' }}>Signature</span>
        </div>

        <div style={{ position: 'relative', textAlign: 'center', margin: '0' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 50, borderBottom: '1.5px solid #000', zIndex: 1 }}></div>
          <span style={{ position: 'relative', background: '#fff', padding: '0 10px', fontWeight: '800', fontSize: '13px', zIndex: 2 }}>For Office Use</span>
        </div>

        <div className="office-section-flex" style={{ display: "flex", gap: "20px", marginTop: "5px" }}>
          <div style={{ width: '210px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>Leave Position</div>
            <table style={{ fontSize: '11px', borderCollapse: 'collapse', width: '210px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '2px' }}></th>
                  <th style={{ border: '1px solid #ccc', padding: '2px', background: "#f9f9f9" }}>Eligible</th>
                  <th style={{ border: '1px solid #ccc', padding: '2px', background: "#f9f9f9" }}>Utilised</th>
                  <th style={{ border: '1px solid #ccc', padding: '2px', background: "#f9f9f9" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ccc', padding: '2px', fontWeight: 'bold' }}>CLs</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(clsEligible)}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(clsUtilised)}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(clsBalance)}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ccc', padding: '2px', fontWeight: 'bold' }}>ELs</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(elsEligible)}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(elsUtilised)}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(elsBalance)}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ fontSize: '11px', borderCollapse: 'collapse', width: '210px', marginTop: '0px' }}>
              <thead>
                <tr>
                  <th colSpan="4" style={{ textAlign: 'center', fontWeight: 'bold', border: '1px solid #ccc', borderBottom: 'none' }}>LOP</th>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #ccc', width: '25%' }}></th>
                  <th style={{ border: '1px solid #ccc', background: "#f9f9f9" }}>Previous</th>
                  <th style={{ border: '1px solid #ccc', background: "#f9f9f9" }}>Present</th>
                  <th style={{ border: '1px solid #ccc', background: "#f9f9f9" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ccc', padding: '2px', fontWeight: 'bold' }}>Others</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(lopOthersPrev)}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(lopOthersPres)}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(lopOthersTotal)}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ccc', padding: '2px', fontWeight: 'bold' }}>ESI</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(lopEsi)}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>0</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>0</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ccc', padding: '2px', fontWeight: 'bold' }}>Total</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(lopOthersPrev)}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(lopOthersPres)}</td>
                  <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{fmtNum(lopOthersTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ flex: 1 }}>
            <table style={{ fontSize: '13px', width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="office-label" style={{ width: '180px', padding: '4px 0', fontWeight: 'bold' }}>Sanction day(s)</td>
                  <td className="office-colon" style={{ width: '20px' }}>:</td>
                  <td className="office-value" style={{ borderBottom: '1.5px solid #000', padding: '4px 0', width: '120px' }}>{sanctionDays}</td>
                  <td></td>
                </tr>
                <tr style={{ height: '6px' }}></tr>
                <tr>
                  <td className="office-label" style={{ width: '180px', padding: '4px 0', fontWeight: 'bold' }}>Reporting to duty on</td>
                  <td className="office-colon" style={{ width: '20px' }}>:</td>
                  <td className="office-value" style={{ borderBottom: '1.5px solid #000', padding: '4px 0', width: '120px' }}>{reportingDutyOn}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <table className="attendance-summary-table" style={{ borderCollapse: 'collapse', fontSize: '9px', marginTop: '10px', width: 'auto' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '2px', background: "#f9f9f9" }}>Company<br />Working<br />Days</th>
                  <th style={{ border: '1px solid #000', padding: '2px', background: "#f9f9f9" }}>Employee<br />Present<br />Days</th>
                  <th style={{ border: '1px solid #000', padding: '2px', background: "#f9f9f9" }}>Employee<br />Absent<br />Days</th>
                  <th style={{ border: '1px solid #000', padding: '2px', background: "#f9f9f9" }}>Before<br />Submission</th>
                  <th style={{ border: '1px solid #000', padding: '2px', background: "#f9f9f9" }}>After<br />Submission</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', textAlign: 'center', padding: '2px' }}>{companyDays}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', padding: '2px' }}>{presentDays}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', padding: '2px' }}>{absentDays}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', padding: '4px' }}>{beforeSubmission ?? 0}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', padding: '4px' }}>{afterSubmission ?? 0}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ fontSize: '8px', margin: '5px 5px', color: '#666' }}>* Information upto one day before and attendance respective to HR approval</div>
          </div>
        </div>

        {/* <hr style={{ margin: "15px 0" }} /> */}

        {/* Spacer to push footer to the bottom */}
        {/* <div style={{ minHeight: '25px' }}></div> */}

        {/* Standardized Signatures */}
        <div className="leave-print-footer">
          <table className="leave-signature-grid">
            <tbody>
              <tr>
                <td style={{ width: '25%', textAlign: 'left' }}>
                  <br /><br />
                  <strong>Recomended By</strong>
                </td>
                <td style={{ width: '25%', textAlign: 'center' }}>
                  <br /><br />
                  <strong>Approved By</strong>
                </td>
                <td style={{ width: '25%', textAlign: 'center' }}>
                  <br /><br />
                  <strong>G M</strong>
                </td>
                <td style={{ width: '25%', textAlign: 'right' }}>
                  <br /><br />
                  <strong>Director</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ borderTop: '1.5px solid #000', marginTop: '5px', paddingTop: '2px', marginRight: '40px' }}>
            <div className="report-dated-text" style={{ fontSize: '10px', textAlign: 'right', marginRight: '10px' }}>
              Report Dated : {formatReportDate(reportDate)}
            </div>
          </div>

          {/* Standardized Actions */}
          <div className="leave-actions no-print">
            <button onClick={() => window.print()}>Print</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavePreview;
