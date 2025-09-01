const { mysqlPool, pgPool } = require("../db-config");

const addEmployee = async (req, res) => {
  // Flatten personal object if exists
  const emp = req.body.personal ? { ...req.body.personal } : req.body;

  console.log("RAW BODY:", req.body);
  console.log("EMP SENT TO DB:", emp);

  // Validate empid before running query
  if (!emp.empid) {
    return res.status(400).json({ error: "empid is required" });
  }

  const insertQuery = `
    INSERT INTO employee_master (
      empid, emptype, uno, divno, deptno, secno, sex, marital_status,
      ename, fname, dob, pob, bgroup, mother_tongue, idfm1, idfm2,
      lang_known, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    1030, emp.emptype, emp.uno, emp.divno, emp.deptno, emp.secno,
    emp.sex, emp.marital_status, emp.ename, emp.fname, emp.dob, emp.pob,
    emp.bgroup, emp.mother_tongue, emp.idfm1, emp.idfm2, emp.lang_known,
    emp.created_by
  ];

  try {
    // MySQL
    const mysqlConn = await mysqlPool.getConnection();
    await mysqlConn.execute(insertQuery, values);
    mysqlConn.release();

    // PostgreSQL (convert ? to $1, $2, etc.)
    const pgQuery = insertQuery.replace(/\?/g, (_, i) => `$${i + 1}`);
    await pgPool.query(pgQuery, values);

    res.status(201).json({ message: "Employee inserted into both databases." });
  } catch (error) {
    console.error("Insert Error:", error);
    res.status(500).json({ error: "Failed to insert employee." });
  }
};

module.exports = { addEmployee };
