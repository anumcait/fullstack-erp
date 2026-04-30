import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LeavePreview.css";
import logo from "../../../assets/images/EQIC_Image.jpg"; // replace with your logo path

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
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveDetails();
  }, [data]);
 useEffect(() => {
    console.log("Full leaveData object:", leaveData);
  }, [leaveData]);

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
    leavesApplied ="",
  }  = leaveData || {};


  return (
    <div className="leave-print-overlay">
      <div className="leave-print-container">
        {/* Header Table */}
        <table style={{ width: "100%" }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: 56, textAlign: "center", verticalAlign: "top" }}>
                <img src={logo} alt="Logo" style={{ width: "46px" }} />
              </td>
              <td colSpan={5} style={{ fontWeight: "bold", fontSize: "17px", textAlign: "center" }}>
                EQIC DIES & MOULDS ENGINEERS PVT. LTD
              </td>
              <td style={{ width: 135, textAlign: "center", verticalAlign: "top" }}>
                <div style={{
                  border: "1px solid #000",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "3px 10px",
                  display: "inline-block",
                }}>AFTER SUBMISSION</div>
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={{
                fontWeight: "bold",
                fontSize: "16px",
                textAlign: "center",
                paddingBottom: "6px",
              }}>
                LEAVE APPLICATION
              </td>
            </tr>
          </tbody>
        </table>

        {/* Basic Info Table */}
        <table style={{ width: "100%", fontSize: "14px", marginBottom: "7px", marginTop: "5px" }}>
          <tbody>
            <tr>
              <td style={{ width: 116 }}>Leave app. No</td><td>:</td>
              <td className="left-align">{leaveAppNo}</td>
              <td style={{ width: 40 }}>Date</td><td>:</td>
              <td>{leaveDate}</td>
            </tr>
            <tr>
              <td>Emp No</td><td>:</td>
              <td style={{ fontWeight: "bold", color: "#2b2b2b" }}>{empNo}</td>
              <td>Emp name</td><td>:</td>
              <td style={{ width: "165px", verticalAlign: "top" }}>{empName}</td>
            </tr>
            <tr>
              <td>Designation</td><td>:</td>
              <td>{designation}</td>
              <td>Department</td><td>:</td>
              <td>{department}</td>
            </tr>
            <tr>
              <td style={{ width: "200px" }}>Leaves Applied (days)</td><td>:</td>
              <td>{leavesApplied}</td>
              <td>Section</td><td>:</td>
              <td>{section}</td>
            </tr>
          </tbody>
        </table>

        {/* Leaves Dates Table */}
        <table style={{ width: "100%", fontSize: "14px", marginBottom: "3px"  }}>
          <tbody>
            <tr>
              <td style={{ width: 116 , height: "135px" }}>Leaves date(s)</td><td>:</td>
              <td>
                <table style={{ borderCollapse: "collapse", width: "300px" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #aaa", textAlign: "center", padding: "1px 6px", fontSize: "13px" }}>From</td>
                      <td style={{ border: "1px solid #aaa", textAlign: "center", padding: "1px 6px", fontSize: "13px" }}>To</td>
                      <td style={{ border: "1px solid #aaa", textAlign: "center", padding: "1px 6px", fontSize: "13px" }}>Day</td>
                    </tr>
                    {leaves.length > 0 ? (
                      leaves.map((leave, index) => (
                        <tr key={index}>
                          <td style={{ border: "1px solid #aaa", textAlign: "center", padding: "1px 6px", fontSize: "13px" }}>{leave.leaveFrom}</td>
                          <td style={{ border: "1px solid #aaa", textAlign: "center", padding: "1px 6px", fontSize: "13px" }}>{leave.leaveTo}</td>
                          <td style={{ border: "1px solid #aaa", textAlign: "center", padding: "1px 6px", fontSize: "13px" }}>{leave.leaveDay}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center" }}>No leaves found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
              <td colSpan={3}></td>
            </tr>
            <tr>
              <td>Purpose</td><td>:</td>
              <td>{purpose}</td>
              <td colSpan={3}></td>
            </tr>
            <tr>
              <td>Address/Reason</td><td>:</td>
              <td>{addressReason}</td>
              <td colSpan={3}></td>
            </tr>
            <tr>
              <td>Phone No</td><td>:</td>
              <td>{phoneNo}</td>
              <td colSpan={3}></td>
            </tr>
          </tbody>
        </table>
{/* Additional Info and Footers */}
        <div style={{ fontWeight: 'bold', fontSize: '13px', padding: '3px' }}>
          I agree that my increment may be postponed if not reporting back in time.
        </div>

        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ width: '245px', fontSize: '13px' }}>Date<span style={{ marginLeft: '10px' }}>:&nbsp;{leaveDateShort}</span>
              </td>
              <td style={{ textAlign: 'right', fontSize: '13px' }}>
                Signature
              </td>
            </tr>
          </tbody>
        </table>

        {/* Office Use and Leave Balances Table */}
        <table style={{ width: '100%', marginTop: '7px' }}>
          <tbody>
            <tr>
              <td colSpan={6} style={{ fontSize: '13px', fontWeight:'800', borderBottom: '1px solid #333', paddingTop: '4px', paddingBottom: '4px',textAlign:'center' }}>
                For Office Use
              
              </td>

            </tr>
                  <tr>
              <td style={{ verticalAlign: 'top', width: '300px', marginTop: '10px', paddingTop: '10px', paddingBottom: '6px' }}>
                <table style={{ fontSize: '13px', borderCollapse: 'collapse', width: '260px', marginBottom: '7px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: 56 }}></td>
                      <td style={{ border: '1px solid #777', textAlign: 'center', width: 54 }}>Eligible</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center', width: 54 }}>Utilised</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center', width: 54 }}>Balance</td>
                    </tr>
                    <tr>
                      <td>CLs</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{clsEligible}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{clsUtilised}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{clsBalance}</td>
                    </tr>
                    <tr>
                      <td>ELs</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{elsEligible}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{elsUtilised}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{elsBalance}</td>
                    </tr>
                  </tbody>
                </table>

                <span style={{ fontWeight: 'bold', fontSize: '13px',paddingLeft:'150px'}}>LOP</span>
                <table style={{ fontSize: '13px', borderCollapse: 'collapse', width: '260px', marginTop: '2px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: 50 }}></td>
                      <td style={{ border: '1px solid #777', textAlign: 'center', width: 60 }}>Previous</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center', width: 60 }}>Present</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center', width: 60 }}>Total</td>
                    </tr>
                    <tr>
                      <td>Others</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{lopOthersPrev}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{lopOthersPres}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{lopOthersTotal}</td>
                    </tr>
                    <tr>
                      <td>ESI</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{lopEsi}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}></td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}></td>
                    </tr>
                    <tr>
                      <td>Total</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{lopOthersPrev}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{lopOthersPres}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center' }}>{lopOthersTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{ verticalAlign: 'top', paddingLeft: '12px' }}>
                <table style={{ fontSize: '8px', borderCollapse: 'collapse', width: '280px', marginBottom: '7px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '120px' }}>Sanction day(s)</td><td>:</td>
                      <td style={{ width: '120px' }}>{sanctionDays}</td>
                    </tr>
                    <tr>
                      <td style={{ width: '200px' }}>Reporting to duty on</td><td>:</td>
                      <td>{reportingDutyOn}</td>
                    </tr>
                  </tbody>
                </table>
                <table style={{ borderCollapse: 'collapse', fontSize: '12px', marginTop: '6px', width: '100%', marginBottom: '4px' }}>
                  <tbody>
                    <tr>
                      <td style={{
                        border: '1px solid #777',
                        padding: '2px 5px', textAlign: 'center', fontSize: '12px', width: '85px'
                      }}>Company<br />Working Days</td>
                      <td style={{
                        border: '1px solid #777',
                        padding: '2px 5px', textAlign: 'center', fontSize: '12px', width: '85px'
                      }}>Employee<br />Present Days</td>
                      <td style={{
                        border: '1px solid #777',
                        padding: '2px 5px', textAlign: 'center', fontSize: '12px', width: '85px'
                      }}>Employee<br />Absent Days</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #777', textAlign: 'center', fontSize: '13px' }}>{companyDays}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center', fontSize: '13px' }}>{presentDays}</td>
                      <td style={{ border: '1px solid #777', textAlign: 'center', fontSize: '13px' }}>{absentDays}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ fontSize: '10px', paddingLeft: '2px', color: '#444' }}>* Information upto one day before and attendance respective to HR approval</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signature Table */}
        <table style={{ width: '100%', marginBottom: '16px', marginTop: '40px',fontSize: '13px' }}>
          <tbody>
            <tr>
              <td style={{ width: '25%', textAlign: 'center' }}>Recommended By</td>
              <td style={{ width: '25%', textAlign: 'center' }}>Approved By</td>
              <td style={{ width: '25%', textAlign: 'center' }}>GM</td>
              <td style={{ width: '25%', textAlign: 'center' }}>DIRECTOR</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '11px', textAlign: 'right', marginTop: '10px', marginBottom: '2px' }}>
          Report Dated : {reportDate}
        </div>
        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px" }} className="no-print">
          <button onClick={() => window.print()} style={{
            background: '#007bff', color: '#fff', border: 'none', padding: '6px 12px',
            borderRadius: '4px', fontSize: '12px', cursor: 'pointer'
          }}>Print</button>
          <button onClick={onClose} style={{
            background: '#007bff', color: '#fff', border: 'none', padding: '6px 12px',
            borderRadius: '4px', fontSize: '12px', cursor: 'pointer'
          }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default LeavePreview;

