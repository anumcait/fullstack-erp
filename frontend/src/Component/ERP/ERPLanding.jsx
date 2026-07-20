import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  Box, Card, CardContent, Typography, Grid, Stack, Chip,
  IconButton, Tooltip, Avatar, useMediaQuery,
} from "@mui/material";
import {
  FiUsers, FiDollarSign, FiShoppingCart, FiBox, FiCpu, FiCalendar,
  FiLayers, FiShield, FiBriefcase, FiTool, FiTrendingUp, FiGrid, FiLogOut,
} from "react-icons/fi";
import { useCompany } from "../../context/CompanyContext";

// Each module tile is gated by its MOD_* access permission.
const MODULES = [
  { key: "MOD_HR", label: "HR & Payroll", desc: "People, attendance & salary", to: "/hr", icon: FiUsers, color: "#6366f1" },
  { key: "MOD_ACCOUNTS", label: "Accounts", desc: "Ledger, vouchers & GST", to: "/accounts", icon: FiDollarSign, color: "#0ea5e9" },
  { key: "MOD_PURCHASE", label: "Purchase", desc: "RFQ, orders & vendors", to: "/purchase", icon: FiShoppingCart, color: "#f59e0b" },
  { key: "MOD_STORES", label: "Stores & Inventory", desc: "Stock, issues & GRN", to: "/stores", icon: FiBox, color: "#10b981" },
  { key: "MOD_PRODUCTION", label: "Production", desc: "Orders & shop floor", to: "/production", icon: FiCpu, color: "#ef4444" },
  { key: "MOD_PLANNING", label: "Planning", desc: "Schedule, MRP & capacity", to: "/planning", icon: FiCalendar, color: "#8b5cf6" },
  { key: "MOD_ENGINEERING", label: "Engineering", desc: "BOM, products & routing", to: "/engineering", icon: FiLayers, color: "#14b8a6" },
  { key: "MOD_QUALITY", label: "Quality", desc: "Incoming & final QC", to: "/quality", icon: FiShield, color: "#ec4899" },
  { key: "MOD_SUBCONTRACT", label: "Subcontract", desc: "Jobwork & receipts", to: "/subcontract", icon: FiBriefcase, color: "#ed6c02" },
  { key: "MOD_MAINTENANCE", label: "Maintenance", desc: "Assets & PM schedule", to: "/maintenance", icon: FiTool, color: "#64748b" },
  { key: "MOD_MARKETING", label: "Marketing", desc: "Leads, quotes & CRM", to: "/marketing", icon: FiTrendingUp, color: "#0284c7" },
];

const dateStr = (d) => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeStr = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const greeting = (d) => {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function ERPLanding() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { companyName, companySettings } = useCompany();
  const [now, setNow] = useState(new Date());
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const userRole = (localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || "EMPLOYEE").trim().toUpperCase();
  const userPerms = JSON.parse(localStorage.getItem("userPermissions") || sessionStorage.getItem("userPermissions") || "[]");
  const empName = localStorage.getItem("empName") || sessionStorage.getItem("empName") || "User";
  const hasPermission = (p) => userRole === "ADMIN" || userPerms.includes(p);

  const visibleModules = MODULES.filter((m) => hasPermission(m.key));

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (e) {
      console.error("Logout error", e);
    }
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("empName");
    localStorage.removeItem("userPermissions");
    sessionStorage.clear();
    navigate("/");
  };

  const grad = `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary?.main || theme.palette.primary.light} 120%)`;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      {/* Standalone portal top bar — no app sidebar/header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 4 },
          py: 1.25,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {companySettings?.logo_url ? (
            <Box
              component="img"
              src={companySettings.logo_url}
              alt="Company Logo"
              onError={(e) => { e.target.style.display = "none"; }}
              sx={{ height: 40, width: "auto", maxWidth: 200, objectFit: "contain", borderRadius: 1 }}
            />
          ) : (
            <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: "primary.main", fontWeight: 800 }}>
              {(companyName || "E").charAt(0)}
            </Avatar>
          )}
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 20, md: 26 },
                lineHeight: 1.1,
                color: "primary.main",
                fontFamily: "'Arial Rounded MT Bold', 'Baloo 2', 'Varela Round', 'Segoe UI', sans-serif",
                letterSpacing: 0.5,
              }}
            >
              {companyName || "Enterprise ERP"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Integrated Business Platform
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <FiLogOut size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Hero banner */}
      <Box
        sx={{
          background: grad,
          color: "#fff",
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 4.5 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            right: 120,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "rgba(255,255,255,0.85)", mb: 0.5 }}>
              <FiCalendar size={16} />
              <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                {dateStr(now)}
              </Typography>
              <Box
                component="span"
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 5,
                  bgcolor: "rgba(0,0,0,0.22)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {timeStr(now)}
              </Box>
            </Stack>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              {greeting(now)}, {empName}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", mt: 0.5 }}>
              Your centralized command center — access every business module from one place and stay on top of operations.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<FiGrid size={14} />}
              label={`${visibleModules.length} module${visibleModules.length === 1 ? "" : "s"}`}
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }}
            />
            <Chip
              label={userRole}
              sx={{ bgcolor: "rgba(0,0,0,0.18)", color: "#fff", fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, flex: 1, maxWidth: 1400, width: "100%", mx: "auto" }}>
        {/* Module launchpad */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <FiGrid size={18} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
            Modules
          </Typography>
        </Stack>

        {visibleModules.length === 0 ? (
          <Card sx={{ borderRadius: 3, border: "1px dashed", borderColor: "divider" }}>
            <CardContent>
              <Typography color="text.secondary">
                You do not have access to any ERP module yet. Please contact your administrator to assign module permissions.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {visibleModules.map((m) => {
              const Icon = m.icon;
              return (
                <Grid item xs={6} sm={4} md={3} lg={2} key={m.key}>
                  <Card
                    onClick={() => navigate(m.to)}
                    sx={{
                      cursor: "pointer",
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 10px 24px ${m.color}33`,
                        borderColor: m.color,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Avatar
                        variant="rounded"
                        sx={{ bgcolor: `${m.color}1a`, color: m.color, width: 46, height: 46, mb: 1.25 }}
                      >
                        <Icon size={22} />
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {m.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        <Typography variant="caption">
          {companyName || "Enterprise ERP"} · {dateStr(now)} · All rights reserved
        </Typography>
      </Box>
    </Box>
  );
}
