import React from "react";
import {
  Box,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const AttendanceModificationEntry = () => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        border: "1px solid #dcdcdc",
        borderRadius: "10px",
        backgroundColor: "#fafafa",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#0b3c91",
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "2px",
        }}
      >
        <Typography fontWeight="600" fontSize="15px" color="white">
          Attendance Modification Entry
        </Typography>
        <Button
          variant="text"
          sx={{ minWidth: "30px", color: "#333", fontWeight: 600 }}
        >
          ✖
        </Button>
      </Box>

      {/* Radio Buttons */}
      <RadioGroup row sx={{ mt: 1, mb: 2 }}>
        {[
          "Manual Attendance",
          "Late Coming",
          "Onduty",
          "Early In Late Out",
          "Weekly off Change",
          "Shift Change",
          "No Attendance",
        ].map((label) => (
          <FormControlLabel
            key={label}
            value={label}
            control={<Radio size="small" />}
            label={label}
            sx={{ mr: 2 }}
          />
        ))}
      </RadioGroup>

      {/* Filters Section */}
      <Grid container spacing={2}>
        {/* Left Filters */}
        <Grid item xs={12} sm={6}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date (DD-MON-RR)"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Shift"
                fullWidth
                size="small"
              >
                <MenuItem value="">-Select-</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Night">Night</MenuItem>
              </TextField>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Unit"
                fullWidth
                size="small"
              >
                <MenuItem value="">-Select-</MenuItem>
                <MenuItem value="Unit A">Unit A</MenuItem>
                <MenuItem value="Unit B">Unit B</MenuItem>
              </TextField>
            </Grid> */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Month"
                defaultValue="SEP"
                fullWidth
                size="small"
              >
                <MenuItem value="SEP">SEP</MenuItem>
                <MenuItem value="OCT">OCT</MenuItem>
                <MenuItem value="NOV">NOV</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Month"
                defaultValue="SEP"
                fullWidth
                size="small"
              >
                <MenuItem value="SEP">SEP</MenuItem>
                <MenuItem value="OCT">OCT</MenuItem>
                <MenuItem value="NOV">NOV</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Year"
                value="2025"
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#24496f",
                  color: "#fff",
                  textTransform: "none",
                  mt: 1,
                  px: 4,
                }}
              >
                Show
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Filters (Entry Id + Entry Date) */}
        <Grid item xs={12} sm={6}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Entry Id"
                value="11995"
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* <Button size="small" variant="contained" sx={{ minWidth: "30px" }}>
                        ...
                      </Button> */}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Entry Date"
                type="date"
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* <Button size="small" variant="contained" sx={{ minWidth: "30px" }}>
                        ...
                      </Button> */}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Table Section */}
      <Box sx={{ mt: 2, border: "1px solid #ccc", borderRadius: "3px", overflowX: "auto" }}>
        {/* Table Controls */}
        <Box
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search: All Text Columns"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" size="small">
              Go
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" size="small">Actions</Button>
            <Button variant="outlined" size="small">Edit</Button>
            <Button variant="outlined" size="small">Add Row</Button>
          </Box>
        </Box>

        {/* Scrollable Table */}
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#0b3c91" }}>
            <TableRow>
              {[
                "Sno",
                "Att Mod Type",
                "Att Date",
                "EmpId",
                "Employee Name",
                "Shift",
                "Shift Start Time",
                "Shift End Time",
                "Modify InTime",
                "Modify Out Time",
                "Actual In Time",
                "Actual out time",
                "Remarks"
              ].map((head) => (
                <TableCell key={head} sx={{ fontWeight: 600, textAlign: "center",color:"white" }}>
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>
                <TextField
                  select
                  size="small"
                  fullWidth
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem>-Select-</MenuItem>
                  <MenuItem>Manual</MenuItem>
                  <MenuItem>Onduty</MenuItem>
                </TextField>
              </TableCell>
              <TableCell>
                <TextField type="date" size="small" fullWidth sx={{ minWidth: 120 }} />
              </TableCell>
              <TableCell>
                <TextField placeholder="Emp ID" size="small" fullWidth />
              </TableCell>
              <TableCell>
                <TextField placeholder="Name" size="small" fullWidth />
              </TableCell>
              <TableCell>
                <TextField placeholder="Shift" size="small" fullWidth />
              </TableCell>
              <TableCell>
                <TextField type="time" size="small" fullWidth />
              </TableCell>
              <TableCell>
                <TextField type="time" size="small" fullWidth />
              </TableCell>
              <TableCell>
                <TextField type="time" size="small" fullWidth />
              </TableCell>
              <TableCell>
                <TextField type="time" size="small" fullWidth />
              </TableCell>
              <TableCell>
                <TextField type="time" size="small" fullWidth />
              </TableCell>
              <TableCell>
                <TextField type="time" size="small" fullWidth />
              </TableCell>
              <TableCell>
                <TextField type="time" size="small" fullWidth />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Footer Save Button */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#24496f", textTransform: "none", px: 4 }}
        >
          Save
        </Button>
      </Box>
    </Paper>
  );
};

export default AttendanceModificationEntry;
