import React, { useMemo, useState } from "react";
import {
  Box, TextField, Typography, Stack, IconButton, Tooltip, Chip, alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";

// Generic two-panel transfer list (shuttle) like the GRR module.
// - items:   [{ key, ...any }]
// - rightKeys: keys currently on the right (selected)
// - fixedKeys: keys on the right that cannot move back (already loaded)
// - onToggle(key): move an item to the opposite side
export default function InwardShuttle({
  items = [],
  rightKeys = [],
  fixedKeys = [],
  onToggle,
  renderRow,
  getSearchText,
  accent = "#0f766e",
  leftTitle = "Available",
  rightTitle = "Selected",
  emptyLeft = "Nothing available",
  emptyRight = "Nothing selected",
  disabled = false,
}) {
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const rightSet = useMemo(() => new Set(rightKeys), [rightKeys]);
  const fixedSet = useMemo(() => new Set(fixedKeys), [fixedKeys]);

  const leftItems = useMemo(() => {
    const s = leftSearch.trim().toLowerCase();
    return items.filter((it) => !rightSet.has(it.key) && (!s || (getSearchText(it) || "").toLowerCase().includes(s)));
  }, [items, rightSet, leftSearch, getSearchText]);
  const rightItems = useMemo(() => {
    const s = rightSearch.trim().toLowerCase();
    return items.filter((it) => rightSet.has(it.key) && (!s || (getSearchText(it) || "").toLowerCase().includes(s)));
  }, [items, rightSet, rightSearch, getSearchText]);

  const leftKeySet = useMemo(() => new Set(leftItems.map((x) => x.key)), [leftItems]);
  const rightMoveSet = useMemo(() => new Set(rightItems.filter((x) => !fixedSet.has(x.key)).map((x) => x.key)), [rightItems, fixedSet]);

  const toggleSelect = (key) => setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const moveSelectedRight = () => {
    if (disabled) return;
    const keys = selected.filter((k) => leftKeySet.has(k));
    keys.forEach(onToggle);
    setSelected((prev) => prev.filter((k) => !keys.includes(k)));
  };
  const moveSelectedLeft = () => {
    if (disabled) return;
    const keys = selected.filter((k) => rightMoveSet.has(k));
    keys.forEach(onToggle);
    setSelected((prev) => prev.filter((k) => !keys.includes(k)));
  };
  const moveAllRight = () => {
    if (disabled) return;
    leftItems.forEach((it) => onToggle(it.key));
    setSelected([]);
  };
  const moveAllLeft = () => {
    if (disabled) return;
    rightItems.forEach((it) => { if (!fixedSet.has(it.key)) onToggle(it.key); });
    setSelected([]);
  };

  const searchSx = {
    "& .MuiOutlinedInput-root": { fontSize: "0.8rem", borderRadius: 1.5 },
    "& .MuiOutlinedInput-input": { py: 0.75 },
    mb: 0.75,
  };

  const panelSx = {
    border: "1px solid #e8edf4", borderRadius: 1.5, minHeight: 240, maxHeight: 380, overflow: "auto", bgcolor: "#fff",
    "&::-webkit-scrollbar": { width: 5, height: 5 },
    "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 8 },
    "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
  };

  const rowSx = (isSel, isFixed) => ({
    display: "flex", alignItems: "center", gap: 1, px: 1.25, py: 0.6, cursor: isFixed ? "not-allowed" : "pointer", userSelect: "none",
    borderBottom: "1px solid #f1f5f9", bgcolor: isSel ? alpha(accent, 0.08) : "transparent",
    opacity: isFixed ? 0.6 : 1, transition: "all 0.15s",
    "&:hover": { bgcolor: isSel ? alpha(accent, 0.14) : "#f8fafc", transform: "translateX(2px)" },
  });

  const renderPanel = (list, isRight) => (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5, display: "block", fontSize: "0.68rem" }}>
        {isRight ? rightTitle : leftTitle} ({list.length})
      </Typography>
      <TextField size="small" placeholder="Search..." variant="outlined" fullWidth disabled={disabled}
        value={isRight ? rightSearch : leftSearch}
        onChange={(e) => (isRight ? setRightSearch : setLeftSearch)(e.target.value)}
        sx={searchSx}
        InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 16, mr: 0.5, color: "#94a3b8" }} /> }} />
      <Box sx={panelSx}>
        {list.length === 0 && (
          <Typography variant="body2" sx={{ p: 2, color: "text.secondary", textAlign: "center", fontStyle: "italic" }}>
            {isRight ? emptyRight : emptyLeft}
          </Typography>
        )}
        {list.map((it) => {
          const isFixed = isRight && fixedSet.has(it.key);
          const isSel = selected.includes(it.key);
          return (
            <Box key={it.key} sx={rowSx(isSel, isFixed)}
              onClick={() => { if (disabled || isFixed) return; toggleSelect(it.key); }}
              onDoubleClick={() => { if (disabled || isFixed) return; onToggle(it.key); setSelected((p) => p.filter((k) => k !== it.key)); }}>
              {renderRow(it, { selected: isSel, onRight: isRight, fixed: isFixed })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  const btnSx = {
    border: "1px solid #e2e8f0", borderRadius: 1.5, transition: "all 0.2s",
  };

  return (
    <Stack direction="row" spacing={1} alignItems="stretch">
      {renderPanel(leftItems, false)}
      <Stack spacing={0.5} justifyContent="center" alignItems="center" sx={{ px: 0.5 }}>
        <Tooltip title="Move selected to right"><span><IconButton size="small" onClick={moveSelectedRight} disabled={disabled || selected.filter((k) => leftKeySet.has(k)).length === 0} sx={{ ...btnSx, "&:hover": { bgcolor: alpha(accent, 0.1), borderColor: accent } }}><ChevronRightIcon sx={{ fontSize: 18 }} /></IconButton></span></Tooltip>
        <Tooltip title="Move all to right"><span><IconButton size="small" onClick={moveAllRight} disabled={disabled || leftItems.length === 0} sx={{ ...btnSx, "&:hover": { bgcolor: alpha(accent, 0.1), borderColor: accent } }}><DoubleArrowIcon sx={{ fontSize: 18 }} /></IconButton></span></Tooltip>
        <Tooltip title="Move all to left"><span><IconButton size="small" onClick={moveAllLeft} disabled={disabled || rightItems.every((x) => fixedSet.has(x.key))} sx={{ ...btnSx, "&:hover": { bgcolor: "#fef2f2", borderColor: "#fca5a5" } }}><DoubleArrowIcon sx={{ fontSize: 18, transform: "scaleX(-1)" }} /></IconButton></span></Tooltip>
        <Tooltip title="Move selected to left"><span><IconButton size="small" onClick={moveSelectedLeft} disabled={disabled || selected.filter((k) => rightMoveSet.has(k)).length === 0} sx={{ ...btnSx, "&:hover": { bgcolor: "#fef2f2", borderColor: "#fca5a5" } }}><ChevronLeftIcon sx={{ fontSize: 18 }} /></IconButton></span></Tooltip>
      </Stack>
      {renderPanel(rightItems, true)}
    </Stack>
  );
}
