-- Manual payroll corrections. One row per deduction line per employee per
-- month. The payroll run re-applies these after it computes its own figures,
-- so regenerating a payslip keeps the correction instead of reverting it.
--
-- C_MONTH / C_YEAR are quoted so they stay upper-case and match emp_payslip,
-- which the same module reads and writes.
CREATE TABLE IF NOT EXISTS m_payroll_adjustment (
  id               SERIAL PRIMARY KEY,
  empid            BIGINT NOT NULL,
  ename            VARCHAR(100),
  "C_MONTH"        VARCHAR(10),
  "C_YEAR"         INTEGER,
  component        VARCHAR(20) NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  previous_amount  NUMERIC(12,2),
  reason           TEXT NOT NULL,
  created_by       VARCHAR(50),
  created_date     DATE
);

-- Re-saving the same line updates it rather than stacking duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_adjustment_unique
  ON m_payroll_adjustment (empid, "C_YEAR", "C_MONTH", component);

CREATE INDEX IF NOT EXISTS idx_payroll_adjustment_period
  ON m_payroll_adjustment ("C_YEAR", "C_MONTH");