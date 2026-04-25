import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaUsers,
  FaUserCheck,
  FaClipboardList,
  FaUserClock,
  FaChartLine,
  FaFileExport,
  FaChartPie,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { saveAs } from "file-saver";
import ChatBotIcon from "../../ChatBot/ChatBotIcon";

const API = import.meta.env.VITE_API_URL || "";
const COLORS = ["#3B82F6", "#F97316", "#10B981", "#F43F5E", "#8B5CF6"];

// KPI Card component (matching EmployeeDashboard style)
const KpiCard = ({ title, icon, value, color, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      {icon}
    </div>
    <p className={`text-3xl font-semibold ${color}`}>{value}</p>
    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
  </div>
);

const ManagerDashboard = () => {
  const [summary, setSummary] = useState({
    totalTeam: 0,
    presentToday: 0,
    pendingLeaves: 0,
    avgTeamLeave: 0,
  });
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveByType, setLeaveByType] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/dashboard/manager-summary`, {
        withCredentials: true,
      });

      const team = res.data.teamStats || {};
      const leave = res.data.leaveStats || {};
      const trend = res.data.attendanceTrend || [];
      const birthdays = res.data.upcomingBirthdays || [];
      const approvals = res.data.pendingApprovals || [];

      setSummary({
        totalTeam: team.totalTeam || 0,
        presentToday: team.presentToday || 0,
        pendingLeaves: leave.pendingLeaves || 0,
        avgTeamLeave: leave.avgLeaveDuration || 0,
      });

      setAttendanceTrend(trend);
      setLeaveByType(leave.leaveByType || []);
      setUpcomingBirthdays(birthdays);
      setPendingApprovals(approvals);
    } catch (err) {
      console.error("Error fetching manager dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const exportPending = () => {
    if (!pendingApprovals.length) return;
    const headers = Object.keys(pendingApprovals[0]);
    const csv = [
      headers.join(","),
      ...pendingApprovals.map((r) => headers.map((h) => r[h]).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `pending_approvals_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <p className="text-gray-600 text-lg animate-pulse">
          Loading Manager Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8 transition-all duration-300 animate-fadeIn">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Manager Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Overview of your team’s performance and attendance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-md transition border border-gray-200"
          >
            <FaChartLine /> Refresh
          </button>
          <button
            onClick={exportPending}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaFileExport /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
        <KpiCard
          title="Total Team"
          icon={<FaUsers className="text-green-500 text-2xl" />}
          value={summary.totalTeam}
          color="text-green-600"
          subtitle="Team members under you"
        />
        <KpiCard
          title="Present Today"
          icon={<FaUserCheck className="text-blue-500 text-2xl" />}
          value={summary.presentToday}
          color="text-blue-600"
          subtitle="Checked in today"
        />
        <KpiCard
          title="Pending Leaves"
          icon={<FaClipboardList className="text-orange-500 text-2xl" />}
          value={summary.pendingLeaves}
          color="text-orange-600"
          subtitle="Awaiting your approval"
        />
        <KpiCard
          title="Avg Leave Duration"
          icon={<FaUserClock className="text-indigo-500 text-2xl" />}
          value={`${summary.avgTeamLeave} days`}
          color="text-indigo-600"
          subtitle="Based on last 30 days"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fadeIn">
        {/* Attendance Trend */}
        <div className="col-span-2 bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Team Attendance Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="present"
                stroke="#10B981"
                fill="url(#colorPresent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Distribution */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Leave Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={leaveByType}
                dataKey="count"
                nameKey="type"
                outerRadius={90}
                label
              >
                {leaveByType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Approvals & Birthdays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Pending Approvals
          </h3>
          {pendingApprovals.length ? (
            <ul className="divide-y divide-gray-100">
              {pendingApprovals.map((item, idx) => (
                <li key={idx} className="py-2 text-sm text-gray-600">
                  {item.empName} —{" "}
                  <span className="text-orange-600">{item.type}</span> (
                  {item.days} days)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No pending approvals</p>
          )}
        </div>

        {/* Upcoming Birthdays */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Upcoming Birthdays (30 Days)
          </h3>
          {upcomingBirthdays.length ? (
            <ul className="divide-y divide-gray-100">
              {upcomingBirthdays.map((item, idx) => (
                <li key={idx} className="py-2 text-sm text-gray-600">
                  🎂 {item.empName} — {item.date}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No upcoming birthdays</p>
          )}
        </div>
      </div>

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6">
        <ChatBotIcon />
      </div>
    </div>
  );
};

export default ManagerDashboard;
