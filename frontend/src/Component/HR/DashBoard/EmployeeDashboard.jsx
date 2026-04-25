import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarCheck,
  FaWallet,
  FaFileInvoiceDollar,
  FaPlaneDeparture,
  FaDownload,
  FaUserClock,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";
import ChatBotIcon from "../../ChatBot/ChatBotIcon";
const API = import.meta.env.VITE_API_URL || "";

const EmployeeDashboard = () => {
  const [summary, setSummary] = useState({
    attendanceToday: "",
    pendingLeaves: 0,
    totalLeavesTaken: 0,
    leaveBalance: 0,
    upcomingHoliday: "",
    lastLogin: "",
    latestPayslip: "",
    notifications: 0,
  });

  const empName = localStorage.getItem("empName") || "Employee";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${API}/api/dashboard/employee-summary`, {
          withCredentials: true,
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <p className="text-gray-600 text-lg animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 transition-all duration-300">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, <span className="text-blue-600">{empName}</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here’s your personalized HR summary for today
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition">
            <FaPlaneDeparture /> Apply Leave
          </button>
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-md transition">
            <FaDownload /> Download Payslip
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
        {/* Attendance Today */}
        <SummaryCard
          title="Attendance Today"
          icon={<FaCalendarCheck className="text-green-500 text-2xl" />}
          value={summary.attendanceToday || "Absent"}
          color="text-green-600"
          subtitle="Status as of today's check-in"
        />

        {/* Pending Leaves */}
        <SummaryCard
          title="Pending Leaves"
          icon={<FaClipboardList className="text-yellow-500 text-2xl" />}
          value={summary.pendingLeaves}
          color="text-yellow-600"
          subtitle="Awaiting approval"
        />

        {/* Leave Balance */}
        <SummaryCard
          title="Leave Balance"
          icon={<FaWallet className="text-blue-500 text-2xl" />}
          value={`${summary.leaveBalance} Days`}
          color="text-blue-600"
          subtitle="Remaining annual leave"
        />

        {/* Total Leaves Taken */}
        <SummaryCard
          title="Total Leaves Taken"
          icon={<FaCheckCircle className="text-purple-500 text-2xl" />}
          value={summary.totalLeavesTaken}
          color="text-purple-600"
          subtitle="Approved leaves so far"
        />

        {/* Upcoming Holiday */}
        <SummaryCard
          title="Upcoming Holiday"
          icon={<FaUserClock className="text-pink-500 text-2xl" />}
          value={summary.upcomingHoliday || "None"}
          color="text-pink-600"
          subtitle="Next company holiday"
        />

        {/* Latest Payslip */}
        <SummaryCard
          title="Latest Payslip"
          icon={<FaFileInvoiceDollar className="text-orange-500 text-2xl" />}
          value={summary.latestPayslip || "No Record Found"}
          color="text-orange-600"
          subtitle="Last generated payslip"
        />

        {/* Late Coming */}
        <SummaryCard
          title="Late Coming"
          icon={<FaUserClock className="text-red-500 text-2xl" />}
          value={summary.attendanceStats?.lateComingCount || 0}
          color="text-red-600"
          subtitle="Last 30 days"
        />

        {/* Notifications */}
        <SummaryCard
          title="Unread Notifications"
          icon={<FaClipboardList className="text-red-500 text-2xl" />}
          value={summary.notifications || 0}
          color="text-red-600"
          subtitle="HR & Payroll updates"
        />

        {/* Last Login */}
        <SummaryCard
          title="Last Login"
          icon={<FaUserClock className="text-indigo-500 text-2xl" />}
          value={summary.lastLogin || "Today"}
          color="text-indigo-600"
          subtitle="Last login record"
        />
      </div>

      {/* Chatbot Icon */}
      <div className="fixed bottom-6 right-6">
        <ChatBotIcon />
      </div>
    </div>
  );
};

const SummaryCard = ({ title, icon, value, color, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 border border-gray-100 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      {icon}
    </div>
    <p className={`text-3xl font-semibold ${color}`}>{value}</p>
    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
  </div>
);

export default EmployeeDashboard;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import ChatBotIcon from "../../ChatBot/ChatBotIcon";

// const EmployeeDashboard = () => {
//   const [summary, setSummary] = useState({
//     attendanceToday: '',
//     leaveBalance: 0,
//     latestPayslip: ''
//   });

//   const empName = localStorage.getItem('empName') || 'Employee';

//   useEffect(() => {
//     axios.get('/api/dashboard/employee-summary', { withCredentials: true })
//       .then(res => setSummary(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Welcome, {empName}</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         <div className="bg-white shadow-md p-4 rounded-xl">
//           <h3 className="text-gray-600">Attendance Today</h3>
//           <p className="text-2xl font-semibold text-green-500">{summary.attendanceToday}</p>
//         </div>

//         <div className="bg-white shadow-md p-4 rounded-xl">
//           <h3 className="text-gray-600">Leave Balance</h3>
//           <p className="text-2xl font-semibold text-blue-500">{summary.leaveBalance}</p>
//         </div>

//         <div className="bg-white shadow-md p-4 rounded-xl">
//           <h3 className="text-gray-600">Latest Payslip</h3>
//           <p className="text-2xl font-semibold text-orange-500">{summary.latestPayslip}</p>
//         </div>
//       </div>

//       <div className="mt-8 flex gap-4">
//         <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md">Apply Leave</button>
//         <button className="bg-gray-200 px-4 py-2 rounded-lg shadow-md">Download Payslip</button>
//       </div>
//        <ChatBotIcon />
//     </div>
    
//   );
// };

// export default EmployeeDashboard;

// import React from "react";
// import { FaUser, FaCalendarAlt, FaPlaneDeparture, FaClipboardList } from "react-icons/fa";
// import "./Dashboard.css";

// const EmployeeDashboard = () => {
//   const empName = localStorage.getItem("empName");

//   return (
//     <div className="dashboard-container">
//       <h2 className="dashboard-title">Welcome, {empName}</h2>
//       <p className="dashboard-subtitle">Employee Self-Service Portal</p>

//       <div className="dashboard-grid">
//         <div className="dashboard-card">
//           <FaCalendarAlt className="dashboard-icon" />
//           <h4>Apply Leave</h4>
//           <p>Submit your leave applications.</p>
//         </div>

//         <div className="dashboard-card">
//           <FaPlaneDeparture className="dashboard-icon" />
//           <h4>Tour Application</h4>
//           <p>Apply for company tours or visits.</p>
//         </div>

//         <div className="dashboard-card">
//           <FaClipboardList className="dashboard-icon" />
//           <h4>On Duty</h4>
//           <p>Apply for official on-duty requests.</p>
//         </div>

//         <div className="dashboard-card">
//           <FaUser className="dashboard-icon" />
//           <h4>Profile</h4>
//           <p>View and update your employee profile.</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeDashboard;
