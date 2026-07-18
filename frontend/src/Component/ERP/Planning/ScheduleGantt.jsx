import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Box, Typography, LinearProgress, Chip, Tooltip, TextField, Button, Alert } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDate } from "../../../utils/format";

const API = "/api/erp/planning/schedules";
const HOUR_HEIGHT = 48;
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const COLORS = { Planned: "#1976d2", InProgress: "#f57c00", Completed: "#2e7d32", Cancelled: "#9e9e9e" };
const STATUSES = ["Planned", "InProgress", "Completed", "Cancelled"];

export default function ScheduleGantt({ dateFilter, machineFilter }) {
  const { showToast } = useToast();
  const [ganttData, setGanttData] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 6);
    return d.toISOString().split("T")[0];
  });
  const [dragTarget, setDragTarget] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const ganttRef = useRef(null);

  const fetchGantt = useCallback(async () => {
    setLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (machineFilter) params.machine_id = machineFilter;
      const { data } = await axios.get(`${API}/gantt`, { params });
      setGanttData(data.ganttData || []);
      setSchedules(data.schedules || []);
      setConflicts([]);
    } catch { showToast("Failed to load Gantt data", "error"); }
    finally { setLoading(false); }
  }, [startDate, endDate, machineFilter]);

  useEffect(() => { fetchGantt(); }, [fetchGantt]);

  const dates = useMemo(() => {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [startDate, endDate]);

  const getScheduleStyle = (sched) => {
    if (!sched.start_time || !sched.end_time) return null;
    const st = sched.start_time.split(":").map(Number);
    const et = sched.end_time.split(":").map(Number);
    const top = (st[0] + st[1] / 60) * HOUR_HEIGHT;
    const height = Math.max(((et[0] + et[1] / 60) - (st[0] + st[1] / 60)) * HOUR_HEIGHT, 20);
    return { top: `${top}px`, height: `${height}px` };
  };

  const getDayIndex = (dateStr) => {
    return dates.findIndex((d) => d.toISOString().split("T")[0] === dateStr);
  };

  const handleDrop = async (scheduleId, newMachineId, newDate) => {
    try {
      const { data } = await axios.put(`${API}/${scheduleId}/reschedule`, {
        machine_id: newMachineId,
        scheduled_date: newDate,
      });
      if (data.conflicts?.length > 0) {
        setConflicts(data.conflicts);
        showToast(`${data.conflicts.length} scheduling conflict(s) detected`, "warning");
      } else {
        setConflicts([]);
        showToast("Schedule updated", "success");
      }
      fetchGantt();
    } catch { showToast("Failed to reschedule", "error"); }
  };

  const handleDragStart = (e, sched) => {
    setDragTarget(sched.id);
    e.dataTransfer.setData("text/plain", JSON.stringify({ id: sched.id, machine_id: sched.machine_id, scheduled_date: sched.scheduled_date }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnMachine = (e, machineId, dateStr) => {
    e.preventDefault();
    setDragTarget(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.machine_id !== machineId || data.scheduled_date !== dateStr) {
        handleDrop(data.id, machineId, dateStr);
      }
    } catch { /* ignore */ }
  };

  const handleDragEnd = () => setDragTarget(null);

  const getConflictsForSchedule = (schedId) => conflicts.filter((c) => c.id !== schedId);

  if (loading) return <LinearProgress sx={{ mb: 2 }} />;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField label="Start Date" type="date" size="small" value={startDate}
          onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="End Date" type="date" size="small" value={endDate}
          onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchGantt}>Load</Button>
      </Box>

      {conflicts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setConflicts([])}>
          {conflicts.length} schedule conflict(s) detected. Overlapping schedules exist on the same machine/date.
        </Alert>
      )}

      {ganttData.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>No schedules found for the selected date range.</Typography>
      ) : (
        <Box sx={{ overflowX: "auto", border: "1px solid #e0e0e0", borderRadius: 2 }}>
          <Box sx={{ display: "flex", minWidth: dates.length * 200 + 220 }}>
            <Box sx={{ width: 220, flexShrink: 0, borderRight: "2px solid #e0e0e0" }}>
              <Box sx={{ height: 60, display: "flex", alignItems: "flex-end", p: 1, bgcolor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Machine / Time</Typography>
              </Box>
              <Box sx={{ height: HOUR_HEIGHT * 24, borderBottom: "1px solid #e0e0e0", bgcolor: "#fafafa", display: "flex", flexDirection: "column" }}>
                {HOURS.map((h) => (
                  <Box key={h} sx={{ height: HOUR_HEIGHT, borderBottom: "1px solid #f0f0f0", px: 1, display: "flex", alignItems: "flex-start", pt: -1 }}>
                    <Typography variant="caption" color="text.secondary">{h}</Typography>
                  </Box>
                ))}
              </Box>
              {ganttData.map((gd) => (
                <Box key={gd.machine.id} sx={{ height: HOUR_HEIGHT * 24, borderBottom: "1px solid #e0e0e0", px: 1, display: "flex", alignItems: "center", bgcolor: "#f5f5f5" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: ".82rem" }}>{gd.machine.machine_code} - {gd.machine.machine_name}</Typography>
                </Box>
              ))}
            </Box>

            {dates.map((date) => {
              const dateStr = date.toISOString().split("T")[0];
              const dayLabel = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
              return (
                <Box key={dateStr} sx={{ width: 200, flexShrink: 0, borderRight: "1px solid #e0e0e0" }}>
                  <Box sx={{ height: 60, p: 1, textAlign: "center", bgcolor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: ".82rem" }}>{dayLabel}</Typography>
                  </Box>

                  <Box sx={{ height: HOUR_HEIGHT * 24, position: "relative", borderBottom: "1px solid #e0e0e0" }}>
                    {HOURS.map((h) => (
                      <Box key={h} sx={{ height: HOUR_HEIGHT, borderBottom: "1px solid #f0f0f0" }} />
                    ))}
                    {[6, 7, 8, 9, 10, 11, 12, 13].map((h) => (
                      <Box key={`day-${h}`} sx={{ position: "absolute", top: `${h * HOUR_HEIGHT}px`, left: 0, right: 0, height: HOUR_HEIGHT, bgcolor: "rgba(255, 243, 205, 0.3)", pointerEvents: "none" }} />
                    ))}
                    {[14, 15, 16, 17, 18, 19, 20, 21].map((h) => (
                      <Box key={`eve-${h}`} sx={{ position: "absolute", top: `${h * HOUR_HEIGHT}px`, left: 0, right: 0, height: HOUR_HEIGHT, bgcolor: "rgba(187, 222, 251, 0.2)", pointerEvents: "none" }} />
                    ))}
                    {[22, 23, 0, 1, 2, 3, 4, 5].map((h) => (
                      <Box key={`ngt-${h}`} sx={{ position: "absolute", top: `${(h < 6 ? h + 24 : h) * HOUR_HEIGHT}px`, left: 0, right: 0, height: HOUR_HEIGHT, bgcolor: "rgba(200, 200, 200, 0.15)", pointerEvents: "none" }} />
                    ))}
                  </Box>

                  {ganttData.map((gd) => {
                    const dayScheds = gd.schedules.filter((s) => s.scheduled_date === dateStr);
                    return (
                      <Box
                        key={`drop-${gd.machine.id}-${dateStr}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnMachine(e, gd.machine.id, dateStr)}
                        sx={{
                          height: HOUR_HEIGHT * 24, position: "relative", borderBottom: "1px solid #e0e0e0",
                          bgcolor: dragTarget ? "rgba(25, 118, 210, 0.03)" : "transparent",
                          transition: "background 0.2s", "&:hover": { bgcolor: "rgba(25, 118, 210, 0.05)" },
                        }}
                      >
                        {dayScheds.map((sched) => {
                          const style = getScheduleStyle(sched);
                          if (!style) return null;
                          const schedConflicts = getConflictsForSchedule(sched.id);
                          return (
                            <Tooltip
                              key={sched.id}
                              title={
                                <Box>
                                  <Typography variant="body2" fontWeight={700}>{sched.schedule_no}</Typography>
                                  <Typography variant="caption">Order: {sched.order?.order_no || sched.order_id}</Typography>
                                  <br />
                                  <Typography variant="caption">Product: {sched.order?.product_name || "-"}</Typography>
                                  <br />
                                  <Typography variant="caption">Time: {sched.start_time?.slice(0, 5)} - {sched.end_time?.slice(0, 5)}</Typography>
                                  <br />
                                  <Typography variant="caption">Shift: {sched.shift} | Qty: {sched.planned_qty}</Typography>
                                  {schedConflicts.length > 0 && (
                                    <>
                                      <br />
                                      <Typography variant="caption" color="error">⚠ {schedConflicts.length} conflict(s)</Typography>
                                    </>
                                  )}
                                </Box>
                              }
                              arrow
                            >
                              <Box
                                draggable
                                onDragStart={(e) => handleDragStart(e, sched)}
                                onDragEnd={handleDragEnd}
                                sx={{
                                  position: "absolute", left: 4, right: 4, borderRadius: 1, cursor: "grab",
                                  zIndex: schedConflicts.length > 0 ? 3 : 1,
                                  bgcolor: schedConflicts.length > 0 ? "#d32f2f" : (COLORS[sched.status] || "#1976d2"),
                                  opacity: dragTarget === sched.id ? 0.5 : 0.9,
                                  ...style,
                                  display: "flex", alignItems: "center", px: 1, gap: 0.5,
                                  overflow: "hidden", "&:hover": { opacity: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" },
                                  "&:active": { cursor: "grabbing" },
                                  border: schedConflicts.length > 0 ? "2px solid #b71c1c" : "none",
                                }}
                              >
                                <Typography variant="caption" sx={{ color: "#fff", fontSize: ".7rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {sched.schedule_no}
                                </Typography>
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
