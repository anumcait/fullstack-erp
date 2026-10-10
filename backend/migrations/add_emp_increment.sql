-- Increment applications. On approval the computed value is written to
-- m_emp_salary and a version is appended to m_emp_salary_history.
CREATE TABLE IF NOT EXISTS m_emp_increment (
  increment_id         BIGINT PRIMARY KEY,
  empid                BIGINT NOT NULL,
  ename                VARCHAR(100),
  department           VARCHAR(100),
  designation          VARCHAR(50),
  applied_date         DATE,
  effective_month      INTEGER,
  effective_year       INTEGER,
  component            VARCHAR(30),
  inc_type             VARCHAR(10),
  inc_value            NUMERIC(12,2),
  old_value            NUMERIC(12,2),
  new_value            NUMERIC(12,2),
  has_arrears          BOOLEAN DEFAULT FALSE,
  arrears_from_month   INTEGER,
  arrears_from_year    INTEGER,
  arrears_to_month     INTEGER,
  arrears_to_year      INTEGER,
  arrears_months       INTEGER,
  arrears_amount       NUMERIC(12,2),
  reason               TEXT,
  status               VARCHAR(20) DEFAULT 'Pending',
  approval_remark      VARCHAR(200),
  approved_by          VARCHAR(50),
  approved_date        DATE,
  created_by           VARCHAR(50),
  applied_to_salary    BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_emp_increment_empid ON m_emp_increment (empid);
CREATE INDEX IF NOT EXISTS idx_emp_increment_status ON m_emp_increment (status);

-- Versioned salary snapshots so payroll can resolve the salary in force for
-- any month. Column names mirror m_emp_salary (which uses underscored names,
-- so IS_esi lives as i_s_esi) to keep the copy-on-approve step trivial.
CREATE TABLE IF NOT EXISTS m_emp_salary_history (
  id                   SERIAL PRIMARY KEY,
  empid                INTEGER NOT NULL,
  effective_month      INTEGER,
  effective_year       INTEGER,
  basic                INTEGER,
  hra                  INTEGER,
  conveyance           INTEGER,
  washing_allowance    INTEGER,
  others1              INTEGER,
  others2              INTEGER,
  others3              INTEGER,
  others4              INTEGER,
  others5              INTEGER,
  others6              INTEGER,
  others7              INTEGER,
  others8              INTEGER,
  others9              INTEGER,
  deduct_others1       INTEGER,
  deduct_others2       INTEGER,
  deduct_others3       INTEGER,
  deduct_others4       INTEGER,
  i_s_esi              CHAR(1),
  i_s_pf               CHAR(1),
  i_s_lic              CHAR(1),
  i_s_ot               CHAR(1),
  tds_amount           INTEGER,
  lic_amount           INTEGER,
  pay_mode             VARCHAR(10),
  increment_id         BIGINT,
  created_by           VARCHAR(50),
  created_date         DATE
);

CREATE INDEX IF NOT EXISTS idx_emp_salary_history ON m_emp_salary_history (empid, effective_year, effective_month);

-- Baseline: treat the current salary master as effective from Jan of this year
-- so any historical payroll run still resolves to today's values.
INSERT INTO m_emp_salary_history (
  empid, effective_month, effective_year, basic, hra, conveyance, washing_allowance,
  others1, others2, others3, others4, others5, others6, others7, others8, others9,
  deduct_others1, deduct_others2, deduct_others3, deduct_others4,
  i_s_esi, i_s_pf, i_s_lic, i_s_ot, tds_amount, lic_amount, pay_mode,
  increment_id, created_by, created_date
)
SELECT
  s.empid, 1, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  s.basic, s.hra, s.conveyance, s.washing_allowance,
  s.others1, s.others2, s.others3, s.others4, s.others5, s.others6, s.others7, s.others8, s.others9,
  s.deduct_others1, s.deduct_others2, s.deduct_others3, s.deduct_others4,
  s.i_s_esi, s.i_s_pf, s.i_s_lic, s.i_s_ot, s.tds_amount, s.lic_amount, s.pay_mode,
  NULL, 'migration', CURRENT_DATE
FROM m_emp_salary s
WHERE NOT EXISTS (
  SELECT 1 FROM m_emp_salary_history h WHERE h.empid = s.empid
);