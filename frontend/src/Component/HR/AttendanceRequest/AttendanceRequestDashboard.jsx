import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AttendanceRequestForm from "./AttendanceRequestForm";
import AttendanceRequestTable from "./AttendanceRequestTable";
import AttendanceRequestApproval from "./AttendanceRequestApproval";
import ModuleTabBar from "../common/ModuleTabBar";
import { FaPlus, FaListAlt, FaCheckDouble } from "react-icons/fa";
const AttendanceRequestDashboard = () => {
  const userRole = localStorage.getItem("userRole");
  const userPermissions = JSON.parse(localStorage.getItem("userPermissions")||"[]");
  const hasPermission = (perm) => userRole==="ADMIN" || userPermissions.includes(perm);
  const allTabs=[
    {label:"My Requests",value:"table",icon:<FaListAlt/>,permission:"HR_ATTENDANCE_REQUEST"},
    {label:"New Request",value:"new",icon:<FaPlus/>,permission:"HR_ATTENDANCE_REQUEST"},
    {label:"Approval",value:"approval",icon:<FaCheckDouble/>,permission:"HR_ATTENDANCE_APPROVE"},
  ];
  const location=useLocation();
  const isMyAttendance = location.pathname === "/my-attendance";
  const isHrApproval = location.pathname === "/attendance-requests";
  const tabs=isHrApproval ? allTabs.filter(t=>t.value==="approval" && hasPermission(t.permission)) : allTabs.filter(t=>{ if(isMyAttendance && t.value==="approval") return false; return hasPermission(t.permission); });
  const finalTabs=tabs.length?tabs:(isHrApproval? [{label:"Approval",value:"approval",icon:<FaCheckDouble/>}] : [{label:"My Requests",value:"table",icon:<FaListAlt/>},{label:"New Request",value:"new",icon:<FaPlus/>}]);
  const [selected,setSelected]=useState(isHrApproval? "approval":"table");
  useEffect(()=>{ const p=new URLSearchParams(location.search).get("action"); if(p && ["new","table","approval"].includes(p)) { if(isMyAttendance && p==="approval") setSelected("table"); else if(isHrApproval && p!=="approval") setSelected("approval"); else setSelected(p); } else if(isHrApproval) setSelected("approval"); else if(isMyAttendance && selected==="approval") setSelected("table"); },[location.search, isMyAttendance, isHrApproval]);
  const title=isHrApproval ? "HR Attendance Approval" : "My Attendance";
  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleTabBar title={title} tabs={finalTabs} active={selected} onChange={setSelected}/>
      <div className="p-6">
        {selected==="table" && <AttendanceRequestTable/>}
        {selected==="new" && <AttendanceRequestForm onSuccess={()=>setSelected("table")}/>}
        {selected==="approval" && <AttendanceRequestApproval/>}
      </div>
    </div>
  );
};
export default AttendanceRequestDashboard;
