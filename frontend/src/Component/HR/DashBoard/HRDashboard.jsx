import React, { useEffect, useState, useCallback } from "react";
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
const COLORS = ["#3B82F6", "#F97316", "#10B981", "#F43F5E", "#8B5CF6"];

// KPI Card component
const KpiCard = ({ title, icon, value, color, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 flex flex-col group animate-fadeIn transition-all hover:shadow-lg">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-black text-base font-black uppercase tracking-widest">{title}</h3>
      <span className="scale-125 opacity-100 group-hover:scale-150 transition-transform">{icon}</span>
    </div>
    <p className={`text-5xl font-black tracking-tighter ${color}`}>{value}</p>
    <p className="text-sm text-black font-black mt-1.5">{subtitle}</p>
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
        totalEmployees: emp.totalEmployees || 0,
        activeToday: att.presentToday || 0,
        pendingLeaves: leave.pendingLeaves || 0,
        avgLeaveDuration: leave.avgLeaveDuration || 0,
        attritionRate: attrition.attritionRate || 0,
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-all duration-300 animate-fadeIn">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-xl p-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-200">
        <div>
          <h1 className="text-5xl font-black text-black tracking-tighter">
            HR Dashboard Summary
          </h1>
          <p className="text-black text-base font-black uppercase tracking-widest mt-2 bg-blue-50/50 inline-block px-3 py-1 rounded">
            Strategic Workforce Management Hub
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
          >
            <FaChartLine /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 flex items-center gap-2 text-xs font-bold"
          >
            <FaFileExport /> Export
          </button>
          <div className="relative">
            <button className="px-2 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600">
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

      {/* KPI Cards - Balanced Density */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8 animate-fadeIn">
        <KpiCard
          title="Headcount"
          icon={<FaUsers size={24} className="text-blue-500" />}
          value={summary.totalEmployees}
          color="text-blue-600"
          subtitle="All Active Employees"
        />
        <KpiCard
          title="Present Today"
          icon={<FaUserCheck size={24} className="text-emerald-500" />}
          value={summary.activeToday}
          color="text-green-600"
          subtitle="Current Attendance"
        />
        <KpiCard
          title="Leaves"
          icon={<FaClipboardList size={24} className="text-amber-500" />}
          value={summary.pendingLeaves}
          color="text-orange-600"
          subtitle="Pending Approvals"
        />
        <KpiCard
          title="Late"
          icon={<FaUserClock size={24} className="text-rose-500" />}
          value={summary.lateComingCount}
          color="text-red-600"
          subtitle="Last 30 Days"
        />
        <KpiCard
          title="Requests"
          icon={<FaClipboardList size={24} className="text-purple-500" />}
          value={summary.pendingProfileRequests}
          color="text-purple-600"
          subtitle="Profile Approvals"
        />
        <KpiCard
          title="Attrition"
          icon={<FaChartLine size={24} className="text-slate-500" />}
          value={`${summary.attritionRate}%`}
          color="text-indigo-600"
          subtitle="Monthly Turnover"
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
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="present"
                stroke="#3B82F6"
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
          data={(insights.upcomingHolidays || []).map((h) => ({
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
