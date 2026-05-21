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
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-transform transform hover:-translate-y-1 hover:scale-[1.02] animate-fadeIn">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      {icon}
    </div>
    <p className={`text-3xl font-semibold ${color}`}>{value}</p>
    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 transition-all duration-300 animate-fadeIn">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            HR Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Overview of workforce, attendance, and HR metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-white rounded-xl shadow hover:shadow-md flex items-center gap-2 text-slate-700 hover:text-blue-600 transition"
          >
            <FaChartLine /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 flex items-center gap-2"
          >
            <FaFileExport /> Export
          </button>
          <div className="relative">
            <button className="px-3 py-2 bg-white rounded-xl shadow flex items-center gap-2">
              <FaBell />
              <span className="text-sm text-slate-600">Alerts</span>
            </button>
            {alerts?.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2">
                {alerts.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fadeIn">
        <KpiCard
          title="Total Employees"
          icon={<FaUsers className="text-blue-500 text-2xl" />}
          value={summary.totalEmployees}
          color="text-blue-600"
          subtitle="All active employees"
        />
        <KpiCard
          title="Active Today"
          icon={<FaUserCheck className="text-green-500 text-2xl" />}
          value={summary.activeToday}
          color="text-green-600"
          subtitle="Checked-in today"
        />
        <KpiCard
          title="Pending Leaves"
          icon={<FaClipboardList className="text-orange-500 text-2xl" />}
          value={summary.pendingLeaves}
          color="text-orange-600"
          subtitle="Awaiting approval"
        />
        <KpiCard
          title="Late Coming"
          icon={<FaUserClock className="text-red-500 text-2xl" />}
          value={summary.lateComingCount}
          color="text-red-600"
          subtitle="Last 30 days"
        />
        <KpiCard
          title="Avg Leave / Attrition"
          icon={<FaUserClock className="text-indigo-500 text-2xl" />}
          value={`${summary.avgLeaveDuration}d / ${summary.attritionRate}%`}
          color="text-indigo-600"
          subtitle="Last 30 days"
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





// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   FaUsers,
//   FaClipboardList,
//   FaUserCheck,
//   FaChartBar,
//   FaCheckCircle,
//   FaCogs,
//   FaFileAlt
// } from "react-icons/fa";
// import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
// import ChatBotIcon from "../../ChatBot/ChatBotIcon";

// const HrDashboard = () => {
//   const [summary, setSummary] = useState({
//     totalEmployees: 0,
//     pendingLeaves: 0,
//     activeToday: 0,
//   });

//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_API_URL}/dashboard/hr-summary`, {
//         withCredentials: true,
//       })
//       .then((res) => {
//         setSummary(res.data);
//         setChartData([
//           { name: "Jan", leaves: 5 },
//           { name: "Feb", leaves: 9 },
//           { name: "Mar", leaves: 7 },
//           { name: "Apr", leaves: 4 },
//           { name: "May", leaves: 10 },
//           { name: "Jun", leaves: 6 },
//         ]);
//       })
//       .catch((err) => console.error(err));
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8 font-sans">
//       {/* HEADER */}
//       <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">HR Dashboard</h1>
//           <p className="text-gray-500 mt-1 text-sm">
//             Real-time insights and workforce overview
//           </p>
//         </div>
//         <div className="flex flex-wrap gap-3">
//           <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition">
//             <FaCheckCircle /> Approve Leaves
//           </button>
//           <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow transition">
//             <FaCogs /> Manage Employees
//           </button>
//           <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow transition">
//             <FaFileAlt /> Reports
//           </button>
//         </div>
//       </div>

//       {/* SUMMARY CARDS */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
//         <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
//           <div className="flex justify-between items-center">
//             <h3 className="text-gray-600 font-medium">Total Employees</h3>
//             <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
//               <FaUsers size={20} />
//             </div>
//           </div>
//           <p className="text-4xl font-bold mt-3 text-blue-600">
//             {summary.totalEmployees}
//           </p>
//           <p className="text-xs text-gray-400 mt-1">Active in system</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
//           <div className="flex justify-between items-center">
//             <h3 className="text-gray-600 font-medium">Pending Leave Requests</h3>
//             <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
//               <FaClipboardList size={20} />
//             </div>
//           </div>
//           <p className="text-4xl font-bold mt-3 text-orange-500">
//             {summary.pendingLeaves}
//           </p>
//           <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
//           <div className="flex justify-between items-center">
//             <h3 className="text-gray-600 font-medium">Active Employees Today</h3>
//             <div className="bg-green-100 text-green-600 p-3 rounded-full">
//               <FaUserCheck size={20} />
//             </div>
//           </div>
//           <p className="text-4xl font-bold mt-3 text-green-600">
//             {summary.activeToday}
//           </p>
//           <p className="text-xs text-gray-400 mt-1">Marked attendance</p>
//         </div>
//       </div>

//       {/* ANALYTICS SECTION */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Bar Chart */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
//               <FaChartBar className="text-blue-500" /> Monthly Leave Overview
//             </h2>
//           </div>
//           <ResponsiveContainer width="100%" height={240}>
//             <BarChart data={chartData}>
//               <XAxis dataKey="name" stroke="#6B7280" />
//               <Tooltip />
//               <Bar dataKey="leaves" fill="#3B82F6" radius={[6, 6, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Quick Insights */}
//         <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-2xl p-6 shadow-lg">
//           <h2 className="text-xl font-semibold mb-2">💡 Quick Insights</h2>
//           <ul className="space-y-3 text-sm">
//             <li>
//               • Leave approvals increased by{" "}
//               <span className="font-bold">12%</span> this quarter
//             </li>
//             <li>
//               • Employee attendance improved by{" "}
//               <span className="font-bold">8%</span> month-on-month
//             </li>
//             <li>
//               • Average leave duration down to{" "}
//               <span className="font-bold">2.1 days</span>
//             </li>
//           </ul>
//           <button className="bg-white text-blue-700 mt-6 px-4 py-2 rounded-lg shadow font-medium hover:bg-gray-100 transition">
//             View Full Analytics
//           </button>
//         </div>
//       </div>

//       {/* CHATBOT ICON */}
//       <div className="fixed bottom-6 right-6">
//         <ChatBotIcon />
//       </div>
//     </div>
//   );
// };

// export default HrDashboard;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   FaUsers,
//   FaClipboardList,
//   FaUserCheck,
//   FaCheckCircle,
//   FaCogs,
// } from "react-icons/fa";
// import ChatBotIcon from "../../ChatBot/ChatBotIcon";

// const HrDashboard = () => {
//   const [summary, setSummary] = useState({
//     totalEmployees: 0,
//     pendingLeaves: 0,
//     activeToday: 0,
//   });

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_API_URL}/dashboard/hr-summary`, {
//         withCredentials: true,
//       })
//       .then((res) => setSummary(res.data))
//       .catch((err) => console.error(err));
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-8 transition-all duration-300">
//       {/* Header Section */}
//       <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">
//             HR Dashboard
//           </h1>
//           <p className="text-gray-500 mt-1 text-sm">
//             Central hub for employee and leave insights
//           </p>
//         </div>
//         <div className="flex gap-3">
//           <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition">
//             <FaCheckCircle /> Approve Leaves
//           </button>
//           <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-md transition">
//             <FaCogs /> Manage Employees
//           </button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
//         {/* Total Employees */}
//         <div className="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 transition-transform transform hover:-translate-y-1">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-gray-600 text-sm font-medium">
//               Total Employees
//             </h3>
//             <FaUsers className="text-blue-500 text-2xl" />
//           </div>
//           <p className="text-4xl font-bold text-blue-600">
//             {summary.totalEmployees}
//           </p>
//           <p className="text-xs text-gray-400 mt-1">
//             Currently active in the system
//           </p>
//         </div>

//         {/* Pending Leaves */}
//         <div className="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 transition-transform transform hover:-translate-y-1">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-gray-600 text-sm font-medium">
//               Pending Leave Requests
//             </h3>
//             <FaClipboardList className="text-orange-500 text-2xl" />
//           </div>
//           <p className="text-4xl font-bold text-orange-500">
//             {summary.pendingLeaves}
//           </p>
//           <p className="text-xs text-gray-400 mt-1">
//             Awaiting HR or manager approval
//           </p>
//         </div>

//         {/* Active Employees */}
//         <div className="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 transition-transform transform hover:-translate-y-1">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-gray-600 text-sm font-medium">
//               Active Employees Today
//             </h3>
//             <FaUserCheck className="text-green-500 text-2xl" />
//           </div>
//           <p className="text-4xl font-bold text-green-600">
//             {summary.activeToday}
//           </p>
//           <p className="text-xs text-gray-400 mt-1">
//             Logged attendance today
//           </p>
//         </div>
//       </div>

//       {/* Action Panel */}
//       <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
//           <h2 className="text-xl font-semibold mb-2">
//             💡 Quick Insights
//           </h2>
//           <p className="text-sm opacity-90 mb-4">
//             Track pending approvals, attendance trends, and manage daily HR tasks all in one place.
//           </p>
//           <button className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-100 transition">
//             View Analytics
//           </button>
//         </div>

//         <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
//           <h2 className="text-xl font-semibold mb-3 text-gray-800">
//             📊 Key Metrics Overview
//           </h2>
//           <ul className="text-gray-600 space-y-2 text-sm">
//             <li>• Leave approvals are up by <span className="font-semibold text-green-600">12%</span> this month</li>
//             <li>• Attendance consistency improved by <span className="font-semibold text-blue-600">8%</span></li>
//             <li>• Average leave duration reduced to <span className="font-semibold text-orange-500">2.1 days</span></li>
//           </ul>
//         </div>
//       </div>

//       {/* Chatbot Icon */}
//       <div className="fixed bottom-6 right-6">
//         <ChatBotIcon />
//       </div>
//     </div>
//   );
// };

// export default HrDashboard;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import ChatBotIcon from "../../ChatBot/ChatBotIcon";
// const HrDashboard = () => {
//   const [summary, setSummary] = useState({
//     totalEmployees: 0,
//     pendingLeaves: 0,
//     activeToday: 0
//   });

//   useEffect(() => {
//     //axios.get('/dashboard/hr-summary', { withCredentials: true })
//     axios.get(`${import.meta.env.VITE_API_URL}/dashboard/hr-summary`, { withCredentials: true })
//       .then(res => setSummary(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">HR Dashboard</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         <div className="bg-white shadow-md p-4 rounded-xl">
//           <h3 className="text-gray-600">Total Employees</h3>
//           <p className="text-2xl font-semibold text-blue-500">{summary.totalEmployees}</p>
//         </div>

//         <div className="bg-white shadow-md p-4 rounded-xl">
//           <h3 className="text-gray-600">Pending Leave Requests</h3>
//           <p className="text-2xl font-semibold text-orange-500">{summary.pendingLeaves}</p>
//         </div>

//         <div className="bg-white shadow-md p-4 rounded-xl">
//           <h3 className="text-gray-600">Active Employees Today</h3>
//           <p className="text-2xl font-semibold text-green-500">{summary.activeToday}</p>
//         </div>
//       </div>

//       <div className="mt-8 flex gap-4">
//         <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md">Approve Leaves</button>
//         <button className="bg-gray-200 px-4 py-2 rounded-lg shadow-md">Manage Employees</button>
//       </div>
        
//         <ChatBotIcon />

//     </div>
//   );
// };

// export default HrDashboard;
