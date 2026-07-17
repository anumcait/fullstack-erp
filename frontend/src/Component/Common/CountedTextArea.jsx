import React from "react";
import { TextField, Box } from "@mui/material";

// Drop-in replacement for MUI <TextField multiline> that shows a live
// character counter ("X letters remaining" when maxLength is set, otherwise
// "X letters"). Keeps the same API as TextField so existing props pass through.
export default function CountedTextArea({ maxLength, helperText, value = "", InputProps, ...props }) {
  const len = (value || "").length;
  const counter =
    maxLength != null
      ? `${Math.max(0, maxLength - len)} letters remaining`
      : `${len} letters`;

  return (
    <TextField
      multiline
      value={value}
      inputProps={maxLength != null ? { maxLength, ...(InputProps || {}) } : InputProps}
      helperText={
        <Box component="span" sx={{ display: "flex", justifyContent: "space-between", gap: 1, width: "100%" }}>
          <span>{helperText}</span>
          <span style={{ whiteSpace: "nowrap", opacity: 0.7 }}>{counter}</span>
        </Box>
      }
      {...props}
    />
  );
}
