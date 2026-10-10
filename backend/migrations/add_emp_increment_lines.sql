-- Increment entries now cover several salary components for one employee,
-- and several employees can be raised in one go. The per-component figures
-- move out of the header into a lines table; the header keeps the employee,
-- effective period, arrears, reason and approval state.
--
-- m_emp_increment is empty in this environment, so the restructure is a
-- clean cut rather than a backfill. Guarded for re-runs.
ALTER TABLE m_emp_increment
  DROP COLUMN IF EXISTS component,
  DROP COLUMN IF EXISTS inc_type,
  DROP COLUMN IF EXISTS inc_value,
  DROP COLUMN IF EXISTS old_value,
  DROP COLUMN IF EXISTS new_value;

CREATE TABLE IF NOT EXISTS m_emp_increment_lines (
  id           SERIAL PRIMARY KEY,
  increment_id BIGINT NOT NULL,
  component    VARCHAR(30) NOT NULL,
  inc_type     VARCHAR(10),
  inc_value    NUMERIC(12,2),
  old_value    NUMERIC(12,2),
  new_value    NUMERIC(12,2)
);

CREATE INDEX IF NOT EXISTS idx_emp_increment_lines_inc ON m_emp_increment_lines (increment_id);
CREATE INDEX IF NOT EXISTS idx_emp_increment_lines_comp ON m_emp_increment_lines (increment_id, component);