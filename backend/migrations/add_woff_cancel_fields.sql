-- Lets HR cancel an already-approved Woff Change so the granted weekly-off day
-- is not honoured in attendance. The day is then counted Absent even if punches,
-- leave or on-duty would otherwise have satisfied the rules.
-- Follows the cancellation convention already used by leave_approval and
-- shift_change: cancel_status = 'C' when cancelled, NULL otherwise.
ALTER TABLE woff_application
  ADD COLUMN IF NOT EXISTS cancel_status VARCHAR(1),
  ADD COLUMN IF NOT EXISTS cancel_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_remarks TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50);

-- Bulk Attendance Entry works on attendance rows, and every weekly-off day has
-- one (status/shift = 'W', woff_day = 1). Cancelling has to live here as well,
-- otherwise only days backed by a Woff *Change* could ever be cancelled.
ALTER TABLE emp_attendance
  ADD COLUMN IF NOT EXISTS cancel_status VARCHAR(1),
  ADD COLUMN IF NOT EXISTS cancel_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_remarks TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50);