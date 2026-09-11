import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, LinearProgress } from "@mui/material";
import axios from "axios";

const DEFAULT_IDLE_MS = 60 * 60 * 1000; // 1 hour idle before warning
const DEFAULT_COUNTDOWN_MS = 5 * 60 * 1000; // 5 minutes to respond

const AUTH_KEYS = ["userName", "userRole", "empName", "empId", "userPermissions"];

export default function IdleTimeout({ idleMs = DEFAULT_IDLE_MS, countdownMs = DEFAULT_COUNTDOWN_MS }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAtLoginPath = location.pathname === '/' || location.pathname === '/login';
  const [warn, setWarn] = useState(false);
  const [remaining, setRemaining] = useState(countdownMs);
  const lastActivity = useRef(Date.now());
  const countdownRef = useRef(null);

  const logout = useCallback(async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (_) {
      /* best effort; clear client session regardless */
    }
    AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
    navigate("/");
  }, [navigate]);

  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const startCountdown = () => {
    setRemaining(countdownMs);
    stopCountdown();
    countdownRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1000) {
          stopCountdown();
          setWarn(false);
          logout();
          return 0;
        }
        return r - 1000;
      });
    }, 1000);
  };

  const reset = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  // Idle checker
  useEffect(() => {
    if (!localStorage.getItem("userName") || isAtLoginPath) return undefined;
    const check = setInterval(() => {
      if (warn) return;
      if (Date.now() - lastActivity.current >= idleMs) {
        setWarn(true);
        startCountdown();
      }
    }, 1000);
    return () => clearInterval(check);
  }, [idleMs, warn, logout, isAtLoginPath]);

  // Activity listeners (only reset while not already warned)
  useEffect(() => {
    if (!localStorage.getItem("userName") || isAtLoginPath) return undefined;
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    const onActivity = () => {
      if (!warn) reset();
    };
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onActivity));
  }, [warn, reset]);

  const handleContinue = () => {
    stopCountdown();
    setWarn(false);
    reset();
  };

  const seconds = Math.ceil(remaining / 1000);

  return (
    <Dialog open={warn} onClose={() => {}} disableEscapeKeyDown maxWidth="xs" fullWidth>
      <DialogTitle>Session Timeout</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          You have been inactive. For your security, you will be logged out automatically.
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Logging out in <strong>{seconds}</strong> second{seconds === 1 ? "" : "s"}.
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(remaining / countdownMs) * 100}
          sx={{ mt: 1, mb: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={logout}>
          Logout Now
        </Button>
        <Button variant="contained" onClick={handleContinue}>
          Continue Session
        </Button>
      </DialogActions>
    </Dialog>
  );
}
