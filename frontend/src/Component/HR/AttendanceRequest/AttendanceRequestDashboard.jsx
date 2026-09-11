import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AttendanceRequestForm from "./AttendanceRequestForm";
import AttendanceRequestTable from "./AttendanceRequestTable";
import AttendanceRequestApproval from "./AttendanceRequestApproval";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";

const TABS = [
  { label: "My Requests", value: "table", icon: <FaListAlt />, permission: "HR_ATTENDANCE_REQUEST" },
  { label: "New Request", value: "new", icon: <FaPlus />, permission: "HR_ATTENDANCE_REQUEST" },
  { label: "Approvals", value: "approval", icon: <FaCheckDouble />, permission: "HR_ATTENDANCE_APPROVE" },
];

const AttendanceRequestDashboard = () => {
  const location = useLocation();
  const isMyAttendance = location.pathname === "/my-attendance";
  const isHrApproval = location.pathname === "/attendance-requests";
  const getVisibleTabs = () => {
    const role = (localStorage.getItem("userRole") || "").toLowerCase();
    const isAdmin = role === "admin";
    if (isAdmin) return TABS;
    try {
      const perms = JSON.parse(localStorage.getItem("permissions") || localStorage.getItem("userPermissions") || "[]");
      const permSet = new Set(Array.isArray(perms) ? perms : []);
      return TABS.filter(t => !t.permission || permSet.has(t.permission));
    } catch { return TABS.filter(t => !t.permission || t.permission.includes("_APP") || t.label==="My Requests" || t.label==="New Request"); }
  };
  const baseVisible = getVisibleTabs();
  const visibleTabs = isHrApproval ? baseVisible.filter(t => t.value === "approval") : baseVisible.filter(t => !(isMyAttendance && t.value === "approval"));
  const finalTabs = visibleTabs.length ? visibleTabs : (isHrApproval ? [{ label: "Approvals", value: "approval", icon: <FaCheckDouble /> }] : [{ label: "My Requests", value: "table", icon: <FaListAlt /> }, { label: "New Request", value: "new", icon: <FaPlus /> }]);
  const [selected, setSelected] = useState(isHrApproval ? "approval" : "table");
  useEffect(() => {
    const p = new URLSearchParams(location.search).get("action");
    if (p && finalTabs.some(t => t.value === p)) {
      if (isMyAttendance && p === "approval") setSelected("table");
      else if (isHrApproval && p !== "approval") setSelected("approval");
      else setSelected(p);
    } else if (p && !finalTabs.some(t => t.value === p)) {
      setSelected(isHrApproval ? "approval" : "table");
    } else if (isHrApproval) setSelected("approval");
    else if (isMyAttendance && selected === "approval") setSelected("table");
  }, [location.search, isMyAttendance, isHrApproval]);
  const title = isHrApproval ? "HR Attendance Approval" : "My Attendance";
  return (
    <div className="bg-transparent" style={{ minHeight: "auto", overflow: "visible" }}>
      <ModuleTabBar title={title} tabs={finalTabs} active={selected} onChange={setSelected} />
      <div className="p-6">
        {selected === "table" && <AttendanceRequestTable />}
        {selected === "new" && <AttendanceRequestForm onSuccess={() => setSelected("table")} />}
        {selected === "approval" && <AttendanceRequestApproval />}
      </div>
    </div>
  );
};
export default AttendanceRequestDashboard;
