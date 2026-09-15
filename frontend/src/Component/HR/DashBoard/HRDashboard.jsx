import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaClipboardList,
  FaUserCheck,
  FaSortAmountDownAlt,
  FaChartLine,
  FaFileExport,
  FaBell,
  FaBirthdayCake,
  FaPlaneDeparture,
  FaUserPlus,
  FaRegCalendarCheck,
  FaUserClock,

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

const KpiCard = ({ title, icon, value, color, subtitle, onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm hover:shadow-md p-4 border border-slate-200 transition-all group ${onClick ? 'cursor-pointer hover:border-[var(--primary-main)] hover:scale-[1.02] active:scale-[0.98]' : ''}`}>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</h3>
      <span className="opacity-70 group-hover:scale-110 transition-transform">{icon}</span>
    </div>
    <p className={`text-xl font-black tracking-tight ${color}`}>{value}</p>
    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{subtitle}</p>
    {onClick && <p className="text-[9px] text-[var(--primary-main)] font-black mt-1 opacity-0 group-hover:opacity-100 transition">View details →</p>}
  </div>
);

const InfoList = ({ title, data, icon }) => (
  <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-all p-5 flex-1 min-w-[280px] animate-fadeIn">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    </div>
    {Array.isArray(data) && data.length > 0 ? (
      <ul className="space-y-2 text-sm text-slate-600 max-h-48 overflow-y-auto">
        {data.map((item, idx) => (
          <li
            key={idx}
            className="flex justify-between border-b border-gray-100 pb-1"
          >
            <span>{item.label}</span>
            <span className="text-gray-500 text-xs">{item.value}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-400 italic">No data</p>
    )}
  </div>
);

const HRDashboard = () => {
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    activeToday: 0,
    pendingLeaves: 0,
    avgLeaveDuration: 0,
    attritionRate: 0,
    lateComingCount: 0,
    pendingProfileRequests: 0,
  });
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveByType, setLeaveByType] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [topAbsentees, setTopAbsentees] = useState([]);
  const [insights, setInsights] = useState({
    upcomingHolidays: [],
    upcomingBirthdays: [],
    recentHires: [],
    topAbsentees: [],
    recentProfileApprovals: [],
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/dashboard/hr-summary`, {
        withCredentials: true,
      });

      const emp = res.data.employeeStats || {};
      const att = res.data.attendanceStats || {};
      const leave = res.data.leaveStats || {};
      const attrition = res.data.attritionStats || {};
      const insights = res.data.insights || {};

      setSummary({
        totalEmployees: emp.activeEmployees ?? emp.totalEmployees ?? 0,
        totalOnRolls: emp.totalEmployees || 0,
        activeEmployees: emp.activeEmployees || 0,
        inactiveEmployees: emp.inactiveEmployees || 0,
        activeToday: att.presentToday || 0,
        presentPct: att.presentPct || 0,
        absentToday: att.absentToday || 0,
        effectiveDate: att.effectiveDate || null,
        pendingLeaves: leave.pendingLeaves || 0,
        avgLeaveDuration: leave.avgLeaveDuration || 0,
        attritionRate: attrition.attritionRate || 0,
        leftLast30Days: attrition.leftLast30Days || 0,
        lateComingCount: att.lateComingCount || 0,
        pendingProfileRequests: res.data.pendingProfileRequests || 0,
      });

      setAttendanceTrend(res.data.attendanceTrend || []);
      setLeaveByType(res.data.leaveByType || []);
      setUpcomingHolidays(insights.upcomingHolidays || []);
      setUpcomingBirthdays(insights.upcomingBirthdays || []);
      setTopAbsentees(insights.topAbsentees || []);
      setInsights(insights);
    } catch (err) {
      console.error("Error fetching HR dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const exportCSV = () => {
    const data = insights.topAbsentees;
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((r) => headers.map((h) => r[h]).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `hr_dashboard_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportTopAbsentees = () => {
    if (!topAbsentees.length) return;
    const headers = Object.keys(topAbsentees[0]);
    const csv = [
      headers.join(","),
      ...topAbsentees.map((r) => headers.map((h) => r[h]).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `hr_top_absentees_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-600 text-lg animate-pulse">
          Loading HR Dashboard...
        </p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const coverageDate = summary.effectiveDate || null;
  const isStale = coverageDate && coverageDate !== todayStr;

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-all duration-300 animate-fadeIn">
      {isStale && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-sm font-bold text-amber-800">⚠️ Attendance data up to <span className="underline">{coverageDate}</span> only (today {todayStr}). Generate Shift Schedule / HR Attendance for {coverageDate} → {todayStr} via perfect flow.</p>
          <button onClick={() => navigate('/shiftschedule')} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black">Go to Shift Schedule</button>
        </div>
      )}
      {/* Header */}
      <div className="bg-white shadow-sm rounded-xl p-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            HR Dashboard Summary
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
            Strategic Workforce Management Hub
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[var(--primary-main)] transition"
          >
            <FaChartLine /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-[var(--primary-main)] hover:opacity-90 text-white rounded-lg shadow-sm flex items-center gap-2 text-xs font-bold"
          >
            <FaFileExport /> Export
          </button>
          <div className="relative">
            <button
              onClick={() => navigate('/leave?action=approval')}
              className="px-2 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[var(--primary-main)] transition"
            >
              <FaBell />
              <span>Alerts</span>
            </button>
            {alerts?.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">
                {alerts.length}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8 animate-fadeIn">
        <KpiCard
          title="Headcount"
          icon={<FaUsers size={24} className="text-blue-500" />}
          value={summary.activeEmployees ?? summary.totalEmployees}
          color="text-blue-600"
          subtitle={`Active • Total ${summary.totalOnRolls ?? summary.totalEmployees} (Left ${summary.inactiveEmployees ?? 0})`}
          onClick={() => navigate('/employees')}
        />
        <KpiCard
          title="Present"
          icon={<FaUserCheck size={24} className="text-emerald-500" />}
          value={summary.activeToday}
          color="text-green-600"
          subtitle={summary.effectiveDate ? `${summary.presentPct}% on ${summary.effectiveDate} • ${summary.activeEmployees} active` : summary.activeEmployees ? `${summary.presentPct}% of ${summary.activeEmployees} active` : "No attendance yet"}
          onClick={() => navigate('/hr-attendance')}
        />
        <KpiCard
          title="Leaves"
          icon={<FaClipboardList size={24} className="text-amber-500" />}
          value={summary.pendingLeaves}
          color="text-orange-600"
          subtitle="Pending approvals"
          onClick={() => navigate('/leave?action=approval')}
        />
        <KpiCard
          title="Late (30d)"
          icon={<FaUserClock size={24} className="text-rose-500" />}
          value={summary.lateComingCount}
          color="text-red-600"
          subtitle="Late arrivals"
          onClick={() => navigate('/hr-attendance?tab=late')}
        />
        <KpiCard
          title="Requests"
          icon={<FaClipboardList size={24} className="text-purple-500" />}
          value={summary.pendingProfileRequests}
          color="text-purple-600"
          subtitle="Profile approvals"
          onClick={() => navigate('/employees?tab=requests')}
        />
        <KpiCard
          title="Attrition"
          icon={<FaChartLine size={24} className="text-slate-500" />}
          value={`${summary.attritionRate}%`}
          color="text-indigo-600"
          subtitle={`${summary.leftLast30Days ?? 0} left in 30d`}
          onClick={() => navigate('/reports?type=attrition')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fadeIn">
        {/* Attendance Trend */}
        <div className="col-span-2 bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Attendance Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-main)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--primary-main)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="present"
                stroke="var(--primary-main)"
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
                outerRadius={80}
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

        {/* Department Breakdown */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Department Headcount
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={insights.deptStats || []}
                dataKey="count"
                nameKey="type"
                outerRadius={80}
                label
              >
                {(insights.deptStats || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Holidays, Birthdays, Top Absentees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

        <InfoList
          title="Upcoming Holidays"
          data={(insights.upcomingHolidays || []).slice(0, 5).map((h) => ({
            label: h.hdesc || h.hname || 'Holiday',
            value: h.hdate ? new Date(h.hdate).toLocaleDateString() : '',
          }))}
          icon={<FaRegCalendarCheck className="text-blue-500" />}
        />
        <InfoList
          title="Upcoming Birthdays"
          data={(insights.upcomingBirthdays || []).map((b) => ({
            label: b.ename || b.emp_name || b.empid,
            value: b.dob ? new Date(b.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
          }))}
          icon={<FaBirthdayCake className="text-pink-500" />}
        />
        <InfoList
          title="Recent Hires"
          data={(insights.recentHires || []).map((r) => ({
            label: r.ename || r.emp_name || r.empid,
            value: r.doj ? new Date(r.doj).toLocaleDateString() : '',
          }))}
          icon={<FaUserPlus className="text-green-500" />}
        />
        <InfoList
          title="Top Absentees (30 Days)"
          data={(insights.topAbsentees || []).map((a) => ({
            label: a.empid,
            value: `${a.absentCount} days`,
          }))}
          icon={<FaPlaneDeparture className="text-orange-500" />}
        />
        <InfoList
          title="Recent Profile Updates"
          data={insights.recentProfileApprovals || []}
          icon={<FaUserCheck className="text-purple-500" />}
        />
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Upcoming Holidays
          </h3>
          {upcomingHolidays.length ? (
            <ul className="divide-y divide-gray-100 text-sm text-gray-600">
              {upcomingHolidays.map((item, idx) => (
                <li key={idx} className="py-2">
                  <FaRegCalendarCheck className="inline mr-2 text-blue-500" />
                  {item.holidayName} — {item.date}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No upcoming holidays</p>
          )}
        </div>

      

        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Upcoming Birthdays
          </h3>
          {upcomingBirthdays.length ? (
            <ul className="divide-y divide-gray-100 text-sm text-gray-600">
              {upcomingBirthdays.map((item, idx) => (
                <li key={idx} className="py-2">
                  <FaBirthdayCake className="inline mr-2 text-pink-500" />
                  {item.empName} — {item.date}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No upcoming birthdays</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Top Absentees
          </h3>
          {topAbsentees.length ? (
            <ul className="divide-y divide-gray-100 text-sm text-gray-600">
              {topAbsentees.map((item, idx) => (
                <li key={idx} className="py-2">
                  <FaPlaneDeparture className="inline mr-2 text-orange-500" />
                  {item.empName} — {item.absentCount} days
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No absentees</p>
          )}
        </div>
      </div> */}

    </div>
  );
};

export default HRDashboard;
