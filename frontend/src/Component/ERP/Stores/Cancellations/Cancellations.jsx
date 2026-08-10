import React from "react";
import { Box, Typography } from "@mui/material";

export default function Cancellations() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)", mb: 2 }}>
        Cancellations
      </Typography>
      <Typography sx={{ color: "#94a3b8", fontStyle: "italic" }}>
        This screen is under construction.
      </Typography>
    </Box>
  );
}
