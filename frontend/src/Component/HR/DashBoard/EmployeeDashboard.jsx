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

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

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
  const empId = localStorage.getItem("empId") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        console.log("Fetching dashboard summary for empId:", empId);
        const res = await axios.get(`${API}/api/dashboard/employee-summary`, {
          withCredentials: true,
          params: empId ? { empid: empId } : {},
        });
        console.log("Dashboard summary response:", res.data);
        if (res.data) {
          setSummary(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Error fetching summary:", err);
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-600 text-lg mb-2">Error loading dashboard</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
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
          value={summary.upcomingHoliday?.includes('(') ? summary.upcomingHoliday.split('(')[0].trim() : (summary.upcomingHoliday || "None")}
          color="text-pink-600"
          subtitle={summary.upcomingHoliday?.includes('(') ? summary.upcomingHoliday.match(/\((.*)\)/)?.[1] : "Next company holiday"}
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

