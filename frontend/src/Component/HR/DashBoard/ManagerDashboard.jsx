import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaUsers,
  FaUserCheck,
  FaClipboardList,
  FaUserClock,
  FaChartLine,
  FaFileExport,
  FaBirthdayCake,
  FaCheck,
  FaTimes,
  FaRegClock,
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

const API = import.meta.env.VITE_API_URL || "";
const COLORS = ["var(--primary-main)", "#F97316", "#10B981", "#F43F5E", "#8B5CF6"];

const KpiCard = ({ title, icon, value, color, subtitle, badge }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-4 border border-slate-200 transition-all group relative overflow-hidden">
    {badge > 0 && (
      <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
        {badge}
      </span>
    )}
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</h3>
      <span className="opacity-70 group-hover:scale-110 transition-transform">{icon}</span>
    </div>
    <p className={`text-xl font-black tracking-tight ${color}`}>{value}</p>
    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{subtitle}</p>
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
  const managerName = localStorage.getItem("empName") || "Manager";

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

  const handleApprove = async (item) => {
    try {
      await axios.post(`${API}/api/leave/approve`, {
        lno: item.lno,
        days: [{ date: item.from, type: item.type, dayType: 'FULL DAY' }]
      }, { withCredentials: true });
      fetchAll();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (item) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await axios.post(`${API}/api/leave/reject`, {
        lno: item.lno,
        app_remarks: reason
      }, { withCredentials: true });
      fetchAll();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  // Attendance rate calculation
  const attendanceRate = summary.totalTeam > 0
    ? Math.round((summary.presentToday / summary.totalTeam) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-100 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium animate-pulse">Loading your team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-all duration-300 animate-fadeIn">

      {/* Header */}
      <div className="bg-white shadow-sm rounded-xl p-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Manager Dashboard</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
            Welcome back, <span className="text-[var(--primary-main)]">{managerName}</span> — team overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live attendance rate badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-xs font-bold text-green-700">{attendanceRate}% Present</span>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-bold transition"
          >
            <FaChartLine /> Refresh
          </button>
          <button
            onClick={exportPending}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold transition"
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
          subtitle="Members under you"
        />
        <KpiCard
          title="Present Today"
          icon={<FaUserCheck className="text-[var(--primary-main)] text-2xl" />}
          value={summary.presentToday}
          color="text-[var(--primary-main)]"
          subtitle={`${attendanceRate}% team attendance`}
        />
        <KpiCard
          title="Pending Leaves"
          icon={<FaClipboardList className="text-orange-500 text-2xl" />}
          value={summary.pendingLeaves}
          color="text-orange-600"
          subtitle="Awaiting your approval"
          badge={summary.pendingLeaves}
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
        <div className="col-span-2 bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Team Attendance Trend (Last 30 Days)</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Daily</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
              <Area type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} fill="url(#colorPresent)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Leave Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={leaveByType} dataKey="count" nameKey="type" outerRadius={90} label>
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

        {/* Pending Approvals — enhanced */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-800">Pending Approvals</h3>
            {pendingApprovals.length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                {pendingApprovals.length} Action{pendingApprovals.length > 1 ? 's' : ''} Required
              </span>
            )}
          </div>
          {pendingApprovals.length ? (
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {pendingApprovals.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                      {(item.empName || 'E').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{item.empName}</p>
                      <p className="text-xs text-gray-400">
                        <span className="text-orange-500 font-medium">{item.type}</span> · {item.days} days
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleApprove(item)}
                      className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition"
                      title="Approve"
                    >
                      <FaCheck size={12} />
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition"
                      title="Reject"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 flex flex-col items-center text-center gap-2">
              <FaCheck className="text-green-400 text-3xl" />
              <p className="text-gray-400 text-sm font-medium">All caught up! No pending approvals.</p>
            </div>
          )}
        </div>

        {/* Upcoming Birthdays — enhanced */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Birthdays</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Next 30 Days</span>
          </div>
          {upcomingBirthdays.length ? (
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {upcomingBirthdays.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-lg">
                    🎂
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">{item.empName}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                  <span className="text-[10px] bg-pink-100 text-pink-500 font-bold px-2 py-0.5 rounded-full">SOON</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 flex flex-col items-center text-center gap-2">
              <FaBirthdayCake className="text-pink-300 text-3xl" />
              <p className="text-gray-400 text-sm font-medium">No upcoming birthdays in the next 30 days.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ManagerDashboard;
