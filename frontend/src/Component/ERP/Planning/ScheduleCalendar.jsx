import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, LinearProgress, Chip, IconButton, Button, TextField, Grid, Card, CardContent } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API = "/api/erp/planning/schedules";
const STATUS_COLORS = { Planned: "info", InProgress: "warning", Completed: "success", Cancelled: "error" };

export default function ScheduleCalendar() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/calendar`, { params: { year, month } });
      setSchedules(data.schedules || []);
      setGrouped(data.grouped || {});
    } catch { showToast("Failed to load calendar", "error"); }
    finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const monthName = currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));
  const goToday = () => setCurrentDate(new Date());

  const getDaySchedules = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return grouped[dateStr] || [];
  };

  if (loading) return <LinearProgress sx={{ mb: 2 }} />;

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <IconButton onClick={prevMonth}><ChevronLeftIcon /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 220, textAlign: "center" }}>{monthName}</Typography>
        <IconButton onClick={nextMonth}><ChevronRightIcon /></IconButton>
        <Button size="small" variant="outlined" startIcon={<TodayIcon />} onClick={goToday}>Today</Button>
        <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={fetchCalendar}>Refresh</Button>
      </Box>

      <Grid container spacing={0.5}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <Grid item xs={12 / 7} key={d}>
            <Box sx={{ textAlign: "center", py: 1, bgcolor: "#f5f5f5", fontWeight: 700, fontSize: ".82rem" }}>
              {d}
            </Box>
          </Grid>
        ))}
        {calendarDays.map((day, idx) => {
          const isToday = day && new Date().toDateString() === new Date(year, month - 1, day).toDateString();
          const dayScheds = day ? getDaySchedules(day) : [];
          const countByStatus = {};
          dayScheds.forEach((s) => { countByStatus[s.status] = (countByStatus[s.status] || 0) + 1; });

          const machineNames = [...new Set(dayScheds.map((s) => s.machine?.machine_code).filter(Boolean))];

          return (
            <Grid item xs={12 / 7} key={idx}>
              <Box
                sx={{
                  minHeight: 100, p: 0.5, border: "1px solid #e0e0e0", borderRadius: 1,
                  bgcolor: isToday ? "rgba(25, 118, 210, 0.08)" : "transparent",
                  "&:hover": { bgcolor: "rgba(25, 118, 210, 0.04)", cursor: "pointer" },
                  transition: "background 0.2s",
                  ...(day ? {} : { bgcolor: "#fafafa" }),
                }}
                onClick={() => {
                  if (day) {
                    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    navigate(`/planning/schedule?date=${dateStr}`);
                  }
                }}
              >
                {day && (
                  <>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isToday ? 800 : 500, fontSize: ".75rem",
                        color: isToday ? "primary.main" : "text.primary",
                        display: "block", mb: 0.5,
                      }}
                    >
                      {day}
                    </Typography>
                    {dayScheds.length > 0 && (
                      <Box>
                        <Box sx={{ display: "flex", gap: 0.3, flexWrap: "wrap", mb: 0.3 }}>
                          {Object.entries(countByStatus).map(([status, count]) => (
                            <Chip key={status} label={`${status}: ${count}`} size="small"
                              color={STATUS_COLORS[status] || "default"}
                              sx={{ height: 18, fontSize: ".6rem", "& .MuiChip-label": { px: 0.5 } }} />
                          ))}
                        </Box>
                        {machineNames.length > 0 && (
                          <Typography variant="caption" sx={{ fontSize: ".6rem", color: "text.secondary", display: "block" }}>
                            {machineNames.slice(0, 3).join(", ")}{machineNames.length > 3 ? "..." : ""}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {schedules.length > 0 && (
        <Card sx={{ mt: 3, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Schedule Summary - {monthName}</Typography>
            <Grid container spacing={2}>
              {["Planned", "InProgress", "Completed", "Cancelled"].map((status) => {
                const count = schedules.filter((s) => s.status === status).length;
                const totalHours = schedules.filter((s) => s.status === status)
                  .reduce((acc, s) => acc + parseFloat(s.duration_hours || 0), 0);
                return (
                  <Grid item xs={6} sm={3} key={status}>
                    <Box sx={{ textAlign: "center", p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                      <Chip label={status} color={STATUS_COLORS[status] || "default"} size="small" sx={{ mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{count}</Typography>
                      <Typography variant="caption" color="text.secondary">{totalHours.toFixed(1)} hrs</Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
