import React from "react";
import "./EmployeePreview.css";

const EmployeePreview = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Employee Details</h3>
        <table>
          <tbody>
            <tr><td>Emp ID:</td><td>{data.empid}</td></tr>
            <tr><td>Name:</td><td>{data.ename}</td></tr>
            <tr><td>Gender:</td><td>{data.sex}</td></tr>
            <tr><td>DOB:</td><td>{data.dob}</td></tr>
            <tr><td>Division:</td><td>{data.divname}</td></tr>
            <tr><td>Department:</td><td>{data.deptname}</td></tr>
            <tr><td>Section:</td><td>{data.secname}</td></tr>
            <tr><td>Marital Status:</td><td>{data.marital_status}</td></tr>
            <tr><td>Mobile:</td><td>{data.mobile}</td></tr>
            <tr><td>Email:</td><td>{data.email}</td></tr>
            <tr><td>Address:</td><td>{data.address}</td></tr>
          </tbody>
        </table>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default EmployeePreview;
