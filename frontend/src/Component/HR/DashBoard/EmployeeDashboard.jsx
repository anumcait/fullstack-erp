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
  FaEye,
} from "react-icons/fa";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider } from "@mui/material";
import { MdClose } from "react-icons/md";
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
    pendingProfileRequests: 0,
    recentProfileRequests: [],
  });

  const empName = localStorage.getItem("empName") || "Employee";
  const empId = localStorage.getItem("empId") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
          title="Profile Request"
          icon={<FaClipboardList className={`text-2xl ${summary.pendingProfileRequests > 0 ? 'text-red-500' : 'text-gray-400'}`} />}
          value={summary.pendingProfileRequests > 0 ? "Pending" : "None"}
          color={summary.pendingProfileRequests > 0 ? "text-red-600" : "text-gray-500"}
          subtitle={summary.pendingProfileRequests > 0 ? "Awaiting HR check" : "No pending changes"}
        />
      </div>

      <RequestDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        request={selectedRequest}
      />

      {/* Recent Profile Requests Table */}
      <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fadeIn">
        <div className="flex items-center gap-2 mb-6">
          <FaClipboardList className="text-blue-600 text-xl" />
          <h2 className="text-xl font-bold text-gray-800">My Recent Profile Requests</h2>
        </div>

        {summary.recentProfileRequests && summary.recentProfileRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-50">
                  <th className="pb-3 font-medium">Request Date</th>
                  <th className="pb-3 font-medium">Request Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {summary.recentProfileRequests.map((req, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-4 font-medium">{formatDate(req.created)}</td>
                    <td className="py-4 capitalize">{req.request_type || 'Update'}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => { setSelectedRequest(req); setDetailsOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FaEye /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 italic text-center py-4">No recent profile update requests found.</p>
        )}
      </div>
    </div>
  );
};

const RequestDetailsDialog = ({ open, onClose, request }) => {
  if (!request) return null;

  const compareFields = [
    { label: 'Comm. Address', old: request.old_comm_address, new: request.new_comm_address },
    { label: 'Comm. Phone', old: request.old_comm_phone, new: request.new_comm_phone },
    { label: 'Comm. Mobile', old: request.old_comm_mobile, new: request.new_comm_mobile },
    { label: 'Perm. Address', old: request.old_perm_address, new: request.new_perm_address },
    { label: 'Perm. Phone', old: request.old_perm_phone, new: request.new_perm_phone },
    { label: 'Perm. Mobile', old: request.old_perm_mobile, new: request.new_perm_mobile },
  ].filter(f => f.old !== f.new);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Profile Request Details
        <IconButton onClick={onClose} size="small"><MdClose /></IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-gray-500">Status</p>
              <p className={`font-bold ${request.status === 'Approved' ? 'text-green-600' : request.status === 'Rejected' ? 'text-red-600' : 'text-orange-600'}`}>
                {request.status}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Submitted On</p>
              <p className="font-bold">{new Date(request.created).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-3">Field Changes</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Field</th>
                    <th className="p-3 text-left">Old Value</th>
                    <th className="p-3 text-left">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {compareFields.map((field, i) => (
                    <tr key={i}>
                      <td className="p-3 font-medium text-gray-700">{field.label}</td>
                      <td className="p-3 text-red-600 italic line-through decoration-red-300">{field.old || '(Empty)'}</td>
                      <td className="p-3 text-green-600 font-medium">{field.new || '(Empty)'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {request.hr_remarks && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 text-sm mb-1">HR Remarks</h4>
              <p className="text-blue-900 text-sm">{request.hr_remarks}</p>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition">
          Close
        </button>
      </DialogActions>
    </Dialog>
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

