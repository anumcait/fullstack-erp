import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

const MusterRoll = () => {
  const { showToast } = useToast();
  const [musterData, setMusterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    empid: "",
  });

  const topScrollRef = React.useRef(null);
  const tableContainerRef = React.useRef(null);
  const [contentWidth, setContentWidth] = useState(0);
  const isScrollingRef = React.useRef(false);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const daysInMonth = new Date(filters.year, filters.month, 0).getDate();

  const stickyWidths = [40, 60, 160, 120, 45];
  const stickyLeft = stickyWidths.reduce((acc, w, i) => {
    acc.push((acc[i - 1] || 0) + (i > 0 ? stickyWidths[i - 1] : 0));
    return acc;
  }, []);

  const stickyCellSx = (index, extra = {}) => {
    const isLast = index === 4;
    return {
      position: "sticky",
      left: stickyLeft[index],
      width: stickyWidths[index],
      minWidth: stickyWidths[index],
      zIndex: 5,
      bgcolor: "#fafafa",
      borderRight: isLast ? "2px solid #aaa" : "none",
      borderBottom: "none",
      ...(index >= 2 && index <= 3 ? { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" } : {}),
      ...extra,
    };
  };

  const handleScroll = (source, target) => {
    if (isScrollingRef.current) {
      isScrollingRef.current = false;
      return;
    }
    if (source.current && target.current) {
      isScrollingRef.current = true;
      target.current.scrollLeft = source.current.scrollLeft;
    }
  };

  const handleTopScroll = () => handleScroll(topScrollRef, tableContainerRef);
  const handleTableScroll = () => handleScroll(tableContainerRef, topScrollRef);

  useEffect(() => {
    if (tableContainerRef.current) {
      setTimeout(() => {
        if (tableContainerRef.current) {
          setContentWidth(tableContainerRef.current.scrollWidth);
        }
      }, 100);
    }
  }, [musterData, loading, filters.month, filters.year]);

  useEffect(() => {
    fetchMusterData();
  }, [filters.month, filters.year, filters.empid]);

  const fetchMusterData = async () => {
    setLoading(true);
    try {
      const params = {
        month: filters.month,
        year: filters.year,
        ...(filters.empid && { empid: filters.empid }),
      };
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/muster-roll`,
        { params }
      );
      const data = res.data;
      setMusterData(data.employees || data || []);
    } catch (err) {
      console.error("Error fetching muster data:", err);
      showToast?.("Error fetching muster data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      empid: "",
    });
  };

  const getShortStatus = (status) => {
    if (!status) return "";
    if (status === "Present") return "P";
    if (status === "Half Day") return "F";
    if (status === "Absent") return "A";
    if (status === "LOP") return "L";
    if (status.startsWith("W-Off")) return "W";
    if (status.startsWith("Holiday")) return "H";
    return status;
  };

  const getStatusColor = (status) => {
    const colors = {
      P: { bg: "#e8f5e9", text: "#2e7d32" },
      F: { bg: "#fff3e0", text: "#e65100" },
      FC: { bg: "#e8f5e9", text: "#e65100" },
      FE: { bg: "#e0f2f1", text: "#e65100" },
      FL: { bg: "#ffebee", text: "#e65100" },
      A: { bg: "#ffebee", text: "#c62828" },
      H: { bg: "#e3f2fd", text: "#1565c0" },
      W: { bg: "#f3e5f5", text: "#7b1fa2" },
      CL: { bg: "#fff8e1", text: "#f57f17" },
      EL: { bg: "#e0f2f1", text: "#00695c" },
      SL: { bg: "#fbe9e7", text: "#d84315" },
      Leave: { bg: "#fffde7", text: "#f57f17" },
      L: { bg: "#fffde7", text: "#f57f17" },
    };
    const short = getShortStatus(status);
    return colors[short] || { bg: "#ffffff", text: "#333" };
  };

  const filteredData = musterData;

  return (
    <Card sx={{ m: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e0e0e0",
          bgcolor: "#f8f9fa",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
            Muster Roll
          </Typography>
          {filteredData.length > 0 && (
            <Chip
              label={`${filteredData.length} Employees`}
              size="small"
              color="primary"
              sx={{ fontWeight: "bold" }}
            />
          )}
        </Box>
        <Box>
          <Button variant="outlined" startIcon={<DownloadIcon />} size="small" sx={{ mr: 1 }}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} size="small">
            Print
          </Button>
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select name="month" value={filters.month} onChange={handleFilterChange} label="Month">
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2} md={1.5}>
            <TextField
              fullWidth
              size="small"
              label="Year"
              name="year"
              type="number"
              value={filters.year}
              onChange={handleFilterChange}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Employee</InputLabel>
              <Select
                name="empid"
                value={filters.empid}
                onChange={handleFilterChange}
                label="Employee"
                displayEmpty
              >
                <MenuItem value="">All Employees</MenuItem>
                {musterData.map((emp) => (
                  <MenuItem key={emp.empid} value={emp.empid}>
                    {emp.empid} - {emp.ename}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            md={5.5}
            sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}
          >
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchMusterData}>
              Refresh
            </Button>
            <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
              Clear
            </Button>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {filteredData.length === 0 ? (
          <Typography
            align="center"
            color="textSecondary"
            sx={{ py: 6, border: "1px dashed #ccc", borderRadius: 1 }}
          >
            No muster data found. Try selecting June (Jun) to view bulk entries.
          </Typography>
        ) : (
          <>
            <Box
              ref={topScrollRef}
              onScroll={handleTopScroll}
              sx={{
                overflowX: "auto",
                overflowY: "hidden",
                width: "100%",
                height: "14px",
                mb: 1,
                bgcolor: "#f5f5f5",
                borderRadius: "4px",
                border: "1px solid #ccc",
                "&::-webkit-scrollbar": { height: "8px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "4px",
                },
              }}
            >
              <Box sx={{ width: `${contentWidth}px`, height: "1px" }} />
            </Box>

            <Box
              ref={tableContainerRef}
              onScroll={handleTableScroll}
              sx={{
                overflowX: "auto",
                overflowY: "auto",
                maxHeight: "75vh",
                width: "100%",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <Table
                size="small"
                sx={{
                  minWidth: 1200,
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  "& th, & td": {
                    borderRight: "1px solid #ccc",
                    borderBottom: "1px solid #ccc",
                    padding: "4px 6px",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableHead sx={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={stickyCellSx(0, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                    >
                      S.No
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={stickyCellSx(1, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                    >
                      ID No
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={stickyCellSx(2, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={stickyCellSx(3, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                    >
                      Dept
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={stickyCellSx(4, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                    ></TableCell>

                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                      <TableCell
                        key={d}
                        align="center"
                        sx={{ fontWeight: "bold", minWidth: 40, bgcolor: "#f5f5f5" }}
                      >
                        {String(d).padStart(2, "0")}-{months.find((m) => m.value === filters.month)?.label.substring(0, 3)}
                      </TableCell>
                    ))}

                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#e8f5e9", minWidth: 50 }}>
                      PRESENT
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#e3f2fd", minWidth: 40 }}>
                      H/W
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#fff8e1", minWidth: 40 }}>
                      CL
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#e0f2f1", minWidth: 40 }}>
                      EL
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#ffcdd2", minWidth: 45 }}>
                      LOP
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#eceff1", minWidth: 50 }}>
                      TOTAL
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#fff9c4", minWidth: 45 }}>
                      OT
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", minWidth: 80, whiteSpace: "pre-line" }}>
                      Attendance{"\n"}<span style={{fontSize:'10px'}}>Bonus</span>
                    </TableCell>
                  </TableRow>

                  <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek];
                      const isSunday = dayOfWeek === 0;

                      return (
                        <TableCell
                          key={d}
                          align="center"
                          sx={{
                            color: isSunday ? "#d32f2f" : "inherit",
                            fontWeight: "bold",
                            fontSize: "9px",
                            bgcolor: isSunday ? "#ffebee" : "#f5f5f5",
                          }}
                        >
                          {dayName}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(() => {
                    const categories = [
                      { label: "Staff", prefix: "1" },
                      { label: "Trainee", prefix: "9" },
                    ];

                    let globalIdx = 0;
                    let grandTotalDays = 0;
                    let grandTotalOT = 0;
                    let grandTotalBonus = 0;
                    const rows = [];

                    for (const cat of categories) {
                      const catEmployees = filteredData.filter((e) => String(e.empid).startsWith(cat.prefix));
                      if (catEmployees.length === 0) continue;

                      let catTotalDays = 0;
                      let catTotalOT = 0;
                      let catBonusCount = 0;

                      rows.push(
                        <TableRow key={`cat-heading-${cat.label}`} sx={{ bgcolor: "#e8eaf6" }}>
                          <TableCell colSpan={5 + daysInMonth} sx={{ fontWeight: "bold", fontSize: "13px", py: "6px", color: "#283593" }}>
                            {cat.label}
                          </TableCell>
                        </TableRow>
                      );

                      for (const emp of catEmployees) {
                        globalIdx++;
                        const days = emp.days || [];
                        let presentDays = 0;
                        let holidays = 0;
                        let cl = 0;
                        let el = 0;
                        let leave = 0;
                        let woffCount = 0;
                        let totalOT = 0;
                        let lopCount = 0;

                        const dayStatuses = days.map(d => getShortStatus(d.status));
                        // W displays as "A" when not adjacent to Present day
                        const dayDisplay = dayStatuses.map((s, i) => {
                          if (s !== "W") return s;
                          const prevP = i > 0 && ["P","F","FC","FE","FL"].includes(dayStatuses[i - 1]);
                          const nextP = i < dayStatuses.length - 1 && ["P","F","FC","FE","FL"].includes(dayStatuses[i + 1]);
                          return (prevP || nextP) ? "W" : "A";
                        });

                        days.forEach((day, dayIdx) => {
                          const status = day.status;
                          const short = dayStatuses[dayIdx];
                          const display = dayDisplay[dayIdx];

                          if (short === "P") presentDays++;
                          else if (short === "F") presentDays += 0.5;
                          else if (short === "FC" || short === "FE" || short === "FL") presentDays += 0.5;
                          else if (status === "Holiday+OT" || status === "W-Off+OT") presentDays++;

                          if (short === "H") holidays++;
                          else if (status === "Holiday+OT") holidays++;

                          if (short === "CL") cl++;
                          else if (short === "FC") cl += 0.5;

                          if (short === "EL") el++;
                          else if (short === "FE") el += 0.5;

                          if (short === "L") {
                            lopCount++;
                          } else if (short === "FL") {
                            presentDays += 0.5;
                            lopCount += 0.5;
                          } else if (day.lop) {
                            lopCount += Number(day.lop);
                          } else if (!["P","F","H","A","W","CL","EL","L","FC","FE","FL"].includes(short)) {
                            leave++;
                          }

                          if (short === "W") woffCount++;

                          if (day.ot_hrs) totalOT += Number(day.ot_hrs);
                        });

                        const totalPaidDays = presentDays + holidays + woffCount + cl + el + leave;
                        const hasBonus = lopCount === 0 && !days.some((d) => d.status === "Absent");

                        catTotalDays += totalPaidDays;
                        catTotalOT += totalOT;
                        if (hasBonus) catBonusCount++;

                        rows.push(
                          <React.Fragment key={emp.empid}>
                            <TableRow hover>
                              <TableCell rowSpan={2} align="center" sx={stickyCellSx(0, { fontWeight: "bold", bgcolor: "#fafafa", zIndex: 6 })}>
                                {globalIdx}
                              </TableCell>
                              <TableCell rowSpan={2} align="center" sx={stickyCellSx(1, { fontWeight: "bold", bgcolor: "#fafafa", zIndex: 6 })}>
                                {emp.empid}
                              </TableCell>
                              <TableCell rowSpan={2} sx={stickyCellSx(2, { fontWeight: "500", color: "#333", bgcolor: "#fafafa", zIndex: 6 })}>
                                {emp.ename}
                              </TableCell>
                              <TableCell rowSpan={2} sx={stickyCellSx(3, { color: "text.secondary", bgcolor: "#fafafa", zIndex: 6 })}>
                                {emp.department || "-"}
                              </TableCell>
                              <TableCell align="center" sx={stickyCellSx(4, { fontWeight: "bold", color: "#1565c0", bgcolor: "#e3f2fd", verticalAlign: "middle", zIndex: 6 })}>
                                Attn
                              </TableCell>

                              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                                const dayData = days[d - 1];
                                const status = dayData ? dayData.status : "";
                                const short = dayDisplay[d - 1] || getShortStatus(status);
                                const color = getStatusColor(status);
                                const displayColor = short !== getShortStatus(status) ? getStatusColor(short) : color;
                                const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                                const isSunday = dayOfWeek === 0;

                                return (
                                  <TableCell
                                    key={d}
                                    align="center"
                                    sx={{
                                      bgcolor: displayColor.bg || (isSunday ? "#fff8e1" : "#ffffff"),
                                      color: displayColor.text,
                                      fontWeight: short ? "bold" : "normal",
                                      cursor: "default",
                                    }}
                                  >
                                    <Tooltip title={dayData && status ? `${status} | In: ${dayData.in_time || "-"} | Out: ${dayData.out_time || "-"}` : ""} arrow>
                                      <span>{short || "-"}</span>
                                    </Tooltip>
                                  </TableCell>
                                );
                              })}

                              <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "bold", fontSize: "12px" }}>
                                {presentDays}
                              </TableCell>
                              <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: "bold", fontSize: "12px" }}>
                                {holidays + woffCount}
                              </TableCell>
                              <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: "bold", fontSize: "12px" }}>
                                {cl}
                              </TableCell>
                              <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#e0f2f1", color: "#00695c", fontWeight: "bold", fontSize: "12px" }}>
                                {el}
                              </TableCell>
                              <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#ffcdd2", color: "#c62828", fontWeight: "bold", fontSize: "12px" }}>
                                {lopCount}
                              </TableCell>
                              <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#eceff1", color: "#37474f", fontWeight: "bold", fontSize: "12px" }}>
                                {totalPaidDays}
                              </TableCell>
                              <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#fff9c4", color: "#f57f17", fontWeight: "bold", fontSize: "12px" }}>
                                {totalOT > 0 ? totalOT.toFixed(1) : "0.0"}
                              </TableCell>
                              <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", fontSize: "12px", bgcolor: hasBonus ? "#e8f5e9" : "inherit", color: hasBonus ? "#2e7d32" : "inherit" }}>
                                {hasBonus ? "500" : ""}
                              </TableCell>
                            </TableRow>

                            <TableRow hover>
                              <TableCell align="center" sx={stickyCellSx(4, { fontWeight: "bold", color: "#e65100", bgcolor: "#fff3e0", zIndex: 6 })}>
                                OT
                              </TableCell>

                              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                                const dayData = days[d - 1];
                                const ot = dayData && dayData.ot_hrs ? Number(dayData.ot_hrs) : 0;
                                const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                                const isSunday = dayOfWeek === 0;

                                return (
                                  <TableCell
                                    key={d}
                                    align="center"
                                    sx={{
                                      color: "#e65100",
                                      bgcolor: ot > 0 ? "#ffe0b2" : isSunday ? "#fffde7" : "inherit",
                                      fontSize: "10px",
                                    }}
                                  >
                                    {ot > 0 ? ot.toFixed(1) : ""}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          </React.Fragment>
                        );
                      }

                      rows.push(
                        <TableRow key={`subtotal-${cat.label}`} sx={{ bgcolor: "#e3f2fd" }}>
                          <TableCell colSpan={5 + daysInMonth} sx={{ fontWeight: "bold", fontSize: "12px", py: "6px" }}>
                            {cat.label} Subtotal
                          </TableCell>
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "12px", color: "#1565c0", py: "6px" }}>
                            {Math.round(catTotalDays * 100) / 100}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "12px", color: "#e65100", py: "6px" }}>
                            {Math.round(catTotalOT * 100) / 100}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "12px", color: "#2e7d32", py: "6px" }}>
                            {catBonusCount * 500}
                          </TableCell>
                        </TableRow>
                      );

                      grandTotalDays += catTotalDays;
                      grandTotalOT += catTotalOT;
                      grandTotalBonus += catBonusCount * 500;
                    }

                    rows.push(
                      <TableRow key="grand-total" sx={{ bgcolor: "#bbdefb" }}>
                        <TableCell colSpan={5 + daysInMonth} sx={{ fontWeight: "bold", fontSize: "13px", py: "8px" }}>
                          Grand Total
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#0d47a1", py: "8px" }}>
                          {Math.round(grandTotalDays * 100) / 100}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#bf360c", py: "8px" }}>
                          {Math.round(grandTotalOT * 100) / 100}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#1b5e20", py: "8px" }}>
                          {grandTotalBonus.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );

                    return rows;
                  })()}
                </TableBody>
              </Table>
            </Box>
          </>
        )}

        <Box
          sx={{
            mt: 3,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            p: 1.5,
            bgcolor: "#f8f9fa",
            borderRadius: 1,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="body2" sx={{ mr: 1, fontWeight: "bold", display: "flex", alignItems: "center" }}>
            Legend:
          </Typography>
          <Chip label="P: Present" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "500" }} />
          <Chip label="F: Half Day" size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: "500" }} />
          <Chip label="A: Absent" size="small" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: "500" }} />
          <Chip label="H: Holiday" size="small" sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: "500" }} />
          <Chip label="W: Weekly Off" size="small" sx={{ bgcolor: "#f3e5f5", color: "#7b1fa2", fontWeight: "500" }} />
          <Chip label="CL: Casual Leave" size="small" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: "500" }} />
          <Chip label="EL: Earned Leave" size="small" sx={{ bgcolor: "#e0f2f1", color: "#00695c", fontWeight: "500" }} />
          <Chip label="SL/ML: Medical/Special Leave" size="small" sx={{ bgcolor: "#fbe9e7", color: "#d84315", fontWeight: "500" }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default MusterRoll;