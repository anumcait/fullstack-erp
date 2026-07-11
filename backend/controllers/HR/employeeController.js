const { EmployeeMaster,
  User,
  EmpFamily,
  EmpQualification,
  EmpExperience,
  EmpOfficial,
  EmpSalary,
  LeaveMaster,
  Sequelize
} = require('../../models');
const bcrypt = require('bcrypt');

// Valid PostgreSQL enum values for employment_status (must match employee-master.js model)
const VALID_EMP_STATUSES = ['Active', 'Resigned', 'Terminated', 'On Leave', 'Permanent', 'Trainee', 'Intern', 'Left', 'Probation', 'Industrial Trainee'];

const safeDate = (dateString) => {
  if (!dateString || String(dateString).trim() === "") return null;
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? null : d;
};

const safeInt = (val) => {
  if (val === undefined || val === null || String(val).trim() === "") return null;
  const res = parseInt(val, 10);
  return isNaN(res) ? null : res;
};

const safeBigInt = (val) => {
  if (val === undefined || val === null || String(val).trim() === "") return null;
  return val; // Sequelize handles BigInt strings, but we ensure it's not empty
};

/**
 * Safely map emptype (frontend) to employment_status (DB enum).
 * Returns the value if valid, defaults to 'Active' otherwise.
 */
const toEmploymentStatus = (emptype) => {
  if (!emptype) return undefined;
  if (VALID_EMP_STATUSES.includes(emptype)) return emptype;
  return 'Active'; // fallback for any unexpected value
};

// ===================== Get all =====================
// exports.getAllEmployees = async (req, res) => {
//   try {
//     const employees = await EmployeeMaster.findAll();
//     res.json(employees);
//   } catch (error) {
//     console.error('Error fetching employees:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }


exports.getAllEmployees = async (req, res) => {
  try {
    const { filterType } = req.query;
    const where = {};

    // Explicitly check for 'left' status
    if (filterType === 'left') {
      where[Sequelize.Op.or] = [
        { is_active: false },
        { status: { [Sequelize.Op.in]: ['Left', 'Inactive', 'Resigned', 'Terminated'] } },
        { employment_status: { [Sequelize.Op.in]: ['Resigned', 'Terminated', 'Left'] } }
      ];
    } else if (filterType === 'all') {
      // Show everyone
    } else {
      // Default to 'active' view
      where[Sequelize.Op.and] = [
        { is_active: true },
        { status: { [Sequelize.Op.notIn]: ['Left', 'Inactive', 'Resigned', 'Terminated'] } },
        {
          employment_status: {
            [Sequelize.Op.or]: [
              { [Sequelize.Op.notIn]: ['Resigned', 'Terminated', 'Left'] },
              { [Sequelize.Op.is]: null }
            ]
          }
        }
      ];
    }
    // If filterType === 'all', 'where' remains empty (except for soft-delete)

    const employees = await EmployeeMaster.findAll({
      where,
      include: [
        {
          model: LeaveMaster,
          attributes: ['cls_utilised', 'els_utilised', 'cls_balance', 'els_balance', 'final_status'],
          required: false
        },
        {
          model: EmpSalary,
          as: 'salary',
          required: false
        }
      ],
      order: [['empid', 'ASC']]
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// ===================== Get by ID =====================
exports.getEmployeeById = async (req, res) => {
  const { empid } = req.params;
  try {
    const employee = await EmployeeMaster.findOne({ where: { empid } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getEmployeeFullDetails = async (req, res) => {
  const { empid } = req.params;
  try {
    const employee = await EmployeeMaster.findOne({
      where: { empid },
      include: [
        { model: EmpOfficial, as: 'official' },
        { model: EmpSalary, as: 'salary' },
        { model: EmpFamily, as: 'family' },
        { model: EmpQualification, as: 'qualification' },
        { model: EmpExperience, as: 'experience' },
        { model: LeaveMaster }
      ]
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching full employee details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ===================== Create =====================

exports.createEmployee = async (req, res) => {
  console.log(req.body);

  const {
    empid, ename, fname, dob, sex, marital_status, emptype, uname,
    divname, deptname, secname, pob, bgroup, mother_tounge,
    idfm1, idfm2, lang_known, commAddress = {}, permAddress = {}, sameAsComm = false,
    familyDetails = [],  // Assume family details sent here as array of objects
    qualDetails = [],
    expDetails = [],
    officialDetails = {},
    salaryDetails = {},
    status, left_date, left_reason
  } = req.body;

  if (!empid) {
    return res.status(400).json({ error: 'Employee ID is required.' });
  }

  // Pre-emptive Duplicate Check
  const existingEmp = await EmployeeMaster.findOne({ where: { empid } });
  if (existingEmp) {
    return res.status(400).json({ error: `Employee ID ${empid} already exists in the system!` });
  }

  const t = await EmployeeMaster.sequelize.transaction();

  const empData = {
    empid: parseInt(empid, 10),
    ename,
    fname,
    dob: safeDate(dob),
    gender: sex,
    marital_status,
    employment_status: toEmploymentStatus(emptype),
    uname,
    divname,
    deptname,
    secname,
    pob,
    bgroup,
    mother_tongue: mother_tounge,
    idfm1,
    idfm2,
    lang_known,
    cadd_sa: commAddress.street || null,
    cadd_city: commAddress.city || null,
    cadd_state: commAddress.state || null,
    cadd_phone: commAddress.phone || null,
    cadd_mobile: commAddress.mobile || null,
    cadd_email: commAddress.email || null,
    padd_sa: sameAsComm ? (commAddress.street || null) : (permAddress.street || null),
    padd_city: sameAsComm ? (commAddress.city || null) : (permAddress.city || null),
    padd_state: sameAsComm ? (commAddress.state || null) : (permAddress.state || null),
    padd_phone: sameAsComm ? (commAddress.phone || null) : (permAddress.phone || null),
    padd_mobile: sameAsComm ? (commAddress.mobile || null) : (permAddress.mobile || null),
    padd_pin: sameAsComm ? (commAddress.pin || null) : (permAddress.pin || null),
    padd_email: sameAsComm ? (commAddress.email || null) : (permAddress.email || null),
    status: status || 'Active',
    left_date: left_date || null,
    left_reason: left_reason || null,
    is_active: status === 'Left' ? false : true
  };

  try {
    // 1. Create employee
    const newEmployee = await EmployeeMaster.create(empData, { transaction: t });

    // 2. Create user with default password
    const defaultPassword = 'AUCTOR';
    const password_hash = await bcrypt.hash(defaultPassword, 10);
    const username = newEmployee.uname || newEmployee.empid.toString();
    const role = 'user';
    const created_by = req.session?.userId || null;

    await User.create({
      username, password_hash, empid: newEmployee.empid, role,
      created_by, is_active: true, login_count: 0
    }, { transaction: t });



    await LeaveMaster.create({
      empid: newEmployee.empid,
      empname: empData.ename || '',      // or newEmployee.ename
      unit: empData.divname || '',
      division: empData.divname || '',
      department: empData.deptname || '',
      section: empData.secname || '',
      cls_utilised: 0.0,
      cls_balance: 0.0,
      els_utilised: 0.0,
      els_balance: 0.0,
      remarks: '',
      yr: new Date(),                     // or pass current year if needed
      cls_jan_status: 0,
      cls_feb_status: 0,
      cls_mar_status: 0,
      cls_apr_status: 0,
      cls_may_status: 0,
      cls_jun_status: 0,
      cls_jul_status: 0,
      cls_aug_status: 0,
      cls_sep_status: 0,
      cls_oct_status: 0,
      cls_nov_status: 0,
      cls_dec_status: 0,
      cls_last_update: new Date(),
      final_status: 0,
      gempid: newEmployee.empid.toString()
    }, { transaction: t });

    // 3. Save family details linked to new employee
    if (familyDetails.length > 0) {
      for (const member of familyDetails) {
        if (member.name.trim() === "") continue; // Skip if name is empty
        await EmpFamily.create({
          empid: newEmployee.empid,
          fname: member.name,
          frel: member.relation,
          fage: member.age,
          foccp: member.occupation,
          c_sno: member.sno,
          c_last_update: new Date(),
          c_upd_userid: '1020',
          c_gempid: newEmployee.empid,
          // add other fields if needed
        }, { transaction: t });
      }
    }

    // 4. Save Qualification details linked to new employee
    if (qualDetails.length > 0) {
      for (const qual of qualDetails) {
        if (qual.degree.trim() === "") continue; // Skip if degree is empty
        await EmpQualification.create({
          empid: newEmployee.empid,
          course: qual.degree,
          noi: qual.institution,
          per: '80',
          year: qual.year,
          c_sno: qual.sno,
          c_last_update: new Date(),
          c_upd_userid: '1020',
          c_gempid: newEmployee.empid,
          // add other fields if needed
        }, { transaction: t });
      }
    }

    //5. Save Experience details linked to new employee

    if (expDetails.length > 0) {
      for (const exp of expDetails) {

        const fromDate = exp.from && exp.from.trim() !== "" ? new Date(exp.from) : null;
        const toDate = exp.to && exp.to.trim() !== "" ? new Date(exp.to) : null;
        if (exp.org.trim() === "") continue; // Skip if organization name is empty
        await EmpExperience.create({
          empid: newEmployee.empid,
          name: exp.org,
          address: exp.address,
          ffrom: fromDate,
          tto: toDate,
          duration: exp.duration,
          onj: exp.onj,
          onl: exp.onl,
          salary: exp.salary,
          nod: exp.nod,
          c_sno: exp.sno,
          c_last_update: new Date(),
          c_upd_userid: '1020',
          c_gempid: newEmployee.empid,
          // add other fields if needed
        }, { transaction: t });
      }
    }

    //6. Save Official details linked to new employee
    if (officialDetails.dateOfJoining) {

      await EmpOfficial.create({
        empid: newEmployee.empid,
        doi: officialDetails.dateOfInterview || null,
        doj: officialDetails.dateOfJoining || null,
        jas: officialDetails.joinedAs || null,
        pp: officialDetails.probationPeriod || null,
        tp: officialDetails.trainingPeriod || null,
        rto: officialDetails.reportingTo || null,
        rto_dept: officialDetails.reportingToDept || null,
        designation: officialDetails.designation || null,

        emp_status: officialDetails.empStatus || null,
        pfacno: officialDetails.pfAccountNo || null,
        esiacno: officialDetails.esiNo || null,
        bankname: officialDetails.bankName || null,
        passport_no: officialDetails.passportNo || null,
        oc: officialDetails.originalCertificates || null,
        bond_frmdt: officialDetails.bondFromDate || null,
        c_weekly_off: officialDetails.weeklyOff || null,
        c_default_shift: officialDetails.shift || null,
        inc_note: officialDetails.incNote || null,
        special_note: officialDetails.specialNote || null,


        branchname: officialDetails.branchName || null,
        validity: officialDetails.validity || null,
        bond_exec: officialDetails.bondExecuted || null,
        bond_todt: officialDetails.bondToDate || null,
        c_high_qual: officialDetails.qualification || null,



        bankacno: officialDetails.bankAccountNo || null,
        ifsccode: officialDetails.ifscCode || null,
        panno: officialDetails.panNo || null,
        bond_yrs: officialDetails.bondYrs || null,
        doinc: officialDetails.regularIncDate || null,
        c_doj_inc_date: officialDetails.dojIncDate || null,
        c_aadhar_no: officialDetails.aadharNo || null,
        c_uan_no: officialDetails.uanNo || null,
        c_shift_disable: officialDetails.shiftDisable ? 1 : 0,
        c_last_update: new Date(),
        c_upd_userid: req.session?.userId || null,
      }, { transaction: t });
    }
    // console.log(salaryDetails);

    //6. Save Salary details linked to new employee
    if (salaryDetails.basic) {


      await EmpSalary.create({
        empid: newEmployee.empid,
        basic: salaryDetails.basic,
        hra: salaryDetails.hra,
        conveyance: salaryDetails.conveyance,
        others1: salaryDetails.others1,
        others2: salaryDetails.others2,

        deduct_others1: salaryDetails.deduct_others1,
        IS_esi: salaryDetails.esi === 'Yes' ? 'Y' : 'N',
        IS_pf: salaryDetails.pf === 'Yes' ? 'Y' : 'N',
        IS_lic: salaryDetails.lic === 'Yes' ? 'Y' : 'N',
        IS_ot: salaryDetails.ot === 'Yes' ? 'Y' : 'N',
        lic_amount: parseInt(salaryDetails.licAmount) || 0,
        tds_amount: parseInt(salaryDetails.tdsAmount) || 0,
        pay_mode: salaryDetails.paymentMode,
        washing_allowance: salaryDetails.washingAllowance || 0,
        c_last_update: new Date(),
        c_upd_userid: req.session?.userId || null
      }, { transaction: t });
    }
    await t.commit();

    res.status(201).json({
      message: 'Employee details created successfully',
      employee: newEmployee
    });

  } catch (error) {
    await t.rollback();
    console.error('Error creating employee and related data:', error);
    res.status(400).json({ error: error.message });
  }
};


// ===================== Update =====================
exports.updateEmployee = async (req, res) => {
  const { empid } = req.params;
  const {
    ename, fname, dob, sex, marital_status, emptype, uname, divname, deptname, secname,
    pob, bgroup, mother_tounge, idfm1, idfm2, lang_known,
    commAddress = {}, permAddress = {}, sameAsComm = false,
    familyDetails = [],
    qualDetails = [],
    expDetails = [],
    officialDetails = {},
    salaryDetails = {},
    status, left_date, left_reason
  } = req.body;

  const t = await EmployeeMaster.sequelize.transaction();

  try {
    const employee = await EmployeeMaster.findOne({ where: { empid }, transaction: t });
    if (!employee) {
      await t.rollback();
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log(`[UpdateEmployee] Targeting empid: ${employee.empid} (from params: ${empid})`);

    // 1. Update main employee master (only if personal fields are provided)
    if (ename !== undefined || fname !== undefined || dob !== undefined || sex !== undefined ||
      marital_status !== undefined || emptype !== undefined || uname !== undefined ||
      divname !== undefined || deptname !== undefined || secname !== undefined ||
      pob !== undefined || bgroup !== undefined || mother_tounge !== undefined ||
      idfm1 !== undefined || idfm2 !== undefined || lang_known !== undefined ||
      status !== undefined || left_date !== undefined || left_reason !== undefined ||
      (commAddress && Object.keys(commAddress).length > 0) ||
      (permAddress && Object.keys(permAddress).length > 0)) {
      const updatedEmpData = {};
      if (ename !== undefined) updatedEmpData.ename = ename;
      if (fname !== undefined) updatedEmpData.fname = fname;
      if (dob !== undefined) updatedEmpData.dob = dob;
      if (sex !== undefined) updatedEmpData.gender = sex;
      if (marital_status !== undefined) updatedEmpData.marital_status = marital_status;
      if (emptype !== undefined) updatedEmpData.employment_status = toEmploymentStatus(emptype);
      if (uname !== undefined) updatedEmpData.uname = uname;
      if (divname !== undefined) updatedEmpData.divname = divname;
      if (deptname !== undefined) updatedEmpData.deptname = deptname;
      if (secname !== undefined) updatedEmpData.secname = secname;
      if (pob !== undefined) updatedEmpData.pob = pob;
      if (bgroup !== undefined) updatedEmpData.bgroup = bgroup;
      if (mother_tounge !== undefined) updatedEmpData.mother_tongue = mother_tounge;
      if (idfm1 !== undefined) updatedEmpData.idfm1 = idfm1;
      if (idfm2 !== undefined) updatedEmpData.idfm2 = idfm2;
      if (lang_known !== undefined) updatedEmpData.lang_known = lang_known;

      if (commAddress && Object.keys(commAddress).length > 0) {
        updatedEmpData.cadd_sa = commAddress.street || null;
        updatedEmpData.cadd_city = commAddress.city || null;
        updatedEmpData.cadd_state = commAddress.state || null;
        updatedEmpData.cadd_phone = commAddress.phone || null;
        updatedEmpData.cadd_mobile = commAddress.mobile || null;
        updatedEmpData.cadd_email = commAddress.email || null;
      }

      if (sameAsComm !== undefined || (permAddress && Object.keys(permAddress).length > 0)) {
        updatedEmpData.padd_sa = sameAsComm ? (commAddress.street || null) : (permAddress.street || null);
        updatedEmpData.padd_city = sameAsComm ? (commAddress.city || null) : (permAddress.city || null);
        updatedEmpData.padd_state = sameAsComm ? (commAddress.state || null) : (permAddress.state || null);
        updatedEmpData.padd_phone = sameAsComm ? (commAddress.phone || null) : (permAddress.phone || null);
        updatedEmpData.padd_mobile = sameAsComm ? (commAddress.mobile || null) : (permAddress.mobile || null);
        updatedEmpData.padd_pin = sameAsComm ? (commAddress.pin || null) : (permAddress.pin || null);
        updatedEmpData.padd_email = sameAsComm ? (commAddress.email || null) : (permAddress.email || null);
      }

      if (status !== undefined) {
        updatedEmpData.status = status;
        updatedEmpData.is_active = (status === 'Left' || status === 'Inactive' || status === 'Resigned' || status === 'Terminated') ? false : true;
      }
      if (left_date !== undefined) {
        const parsedDate = left_date ? new Date(left_date) : null;
        if (parsedDate && parsedDate > new Date()) {
          throw new Error('Left date cannot be in the future');
        }
        updatedEmpData.left_date = parsedDate;
      }
      if (left_reason !== undefined) updatedEmpData.left_reason = left_reason || null;

      // No longer explicitly syncing is_active here to avoid resetting it on partial updates
      // The logic inside if (status !== undefined) handles it.

      // Extra safety: if status is Left, ensure left_date is present
      if (status === 'Left' && !updatedEmpData.left_date) {
        updatedEmpData.left_date = new Date();
      }

      await employee.update(updatedEmpData, { transaction: t });
    }

    // 2. Update Official Details
    if (officialDetails && Object.keys(officialDetails).length > 0) {
      console.log(`[UpdateEmployee] Updating Official Details for empid: ${employee.empid}`);
      await EmpOfficial.upsert({
        empid: employee.empid,
        doi: safeDate(officialDetails.dateOfInterview),
        doj: safeDate(officialDetails.dateOfJoining),
        jas: officialDetails.joinedAs || null,
        pp: officialDetails.probationPeriod || null,
        tp: officialDetails.trainingPeriod || null,
        rto: officialDetails.reportingTo || null,
        rto_dept: officialDetails.reportingToDept || null,
        designation: officialDetails.designation || null,
        emp_status: officialDetails.empStatus ? officialDetails.empStatus.charAt(0) : null,
        pfacno: officialDetails.pfAccountNo || null,
        esiacno: officialDetails.esiNo || null,
        bankname: officialDetails.bankName || null,
        passport_no: officialDetails.passportNo || null,
        oc: officialDetails.originalCertificates ? officialDetails.originalCertificates.charAt(0) : null,
        bond_frmdt: safeDate(officialDetails.bondFromDate),
        c_weekly_off: officialDetails.weeklyOff || null,
        c_default_shift: officialDetails.shift || null,
        inc_note: officialDetails.incNote || null,
        special_note: officialDetails.specialNote || null,
        branchname: officialDetails.branchName || null,
        validity: safeInt(officialDetails.validity),
        bond_exec: officialDetails.bondExecuted ? officialDetails.bondExecuted.charAt(0) : null,
        bond_todt: safeDate(officialDetails.bondToDate),
        c_high_qual: officialDetails.qualification || null,
        bankacno: officialDetails.bankAccountNo || null,
        ifsccode: officialDetails.ifscCode || null,
        panno: officialDetails.panNo || null,
        bond_yrs: safeInt(officialDetails.bondYears),
        doinc: safeDate(officialDetails.regularIncDate),
        c_doj_inc_date: safeDate(officialDetails.dojIncDate),
        c_aadhar_no: safeBigInt(officialDetails.aadharNo),
        c_uan_no: safeBigInt(officialDetails.uanNo),
        c_shift_disable: officialDetails.shiftDisable ? 1 : 0,
        c_last_update: new Date(),
      }, { transaction: t });
    }

    // 3. Update Salary Details
    if (salaryDetails && Object.keys(salaryDetails).length > 0) {
      console.log(`[UpdateEmployee] Updating Salary Details for empid: ${employee.empid}`);
      await EmpSalary.upsert({
        empid: employee.empid,
        basic: safeInt(salaryDetails.basic),
        hra: safeInt(salaryDetails.hra),
        conveyance: safeInt(salaryDetails.conveyance),
        washing_allowance: safeInt(salaryDetails.washingAllowance),
        others1: salaryDetails.others1,
        others2: salaryDetails.others2,
        deduct_others1: salaryDetails.otherDeductions || null,
        IS_esi: salaryDetails.esi === 'Yes' ? 'Y' : 'N',
        IS_pf: salaryDetails.pf === 'Yes' ? 'Y' : 'N',
        IS_lic: salaryDetails.lic === 'Yes' ? 'Y' : 'N',
        IS_ot: salaryDetails.ot === 'Yes' ? 'Y' : 'N',
        lic_amount: safeInt(salaryDetails.licAmount),
        tds_amount: safeInt(salaryDetails.tdsAmount),
        pay_mode: (salaryDetails.paymentMode ? salaryDetails.paymentMode.substring(0, 10) : null),
        c_last_update: new Date(),
      }, { transaction: t });
    }

    // 4. Update Sub-tables (Only if provided in payload)
    if (req.body.hasOwnProperty('familyDetails')) {
      await EmpFamily.destroy({ where: { empid: employee.empid }, transaction: t });
      for (const member of familyDetails) {
        if (member.name?.trim()) {
          await EmpFamily.create({
            empid: employee.empid,
            fname: member.name,
            frel: member.relation,
            fage: member.age,
            foccp: member.occupation,
            c_sno: member.sno,
            c_last_update: new Date(),
          }, { transaction: t });
        }
      }
    }

    if (req.body.hasOwnProperty('qualDetails')) {
      await EmpQualification.destroy({ where: { empid: employee.empid }, transaction: t });
      for (const qual of qualDetails) {
        if (qual.degree?.trim()) {
          await EmpQualification.create({
            empid: employee.empid,
            course: qual.degree,
            noi: qual.institution,
            per: qual.percentage || '0',
            year: qual.year,
            c_sno: qual.sno,
            c_last_update: new Date(),
          }, { transaction: t });
        }
      }
    }

    if (req.body.hasOwnProperty('expDetails')) {
      await EmpExperience.destroy({ where: { empid: employee.empid }, transaction: t });
      for (const exp of expDetails) {
        if (exp.org?.trim()) {
          await EmpExperience.create({
            empid: employee.empid,
            name: exp.org,
            address: exp.address,
            ffrom: exp.from ? new Date(exp.from) : null,
            tto: exp.to ? new Date(exp.to) : null,
            duration: exp.duration,
            onj: exp.onj,
            onl: exp.onl,
            salary: exp.salary,
            nod: exp.nod,
            c_sno: exp.sno,
            c_last_update: new Date(),
          }, { transaction: t });
        }
      }
    }

    await t.commit();
    res.json({ message: 'Employee updated successfully', empid: employee.empid });
  } catch (error) {
    await t.rollback();
    console.error('--- EMPLOYEE UPDATE ERROR ---');
    console.error('EmpID:', empid);
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error(`Field: ${err.path}, Value: ${err.value}, Reason: ${err.message}`));
    }
    console.error('-----------------------------');
    res.status(400).json({ error: error.message, details: error.errors });
  }
};

// ===================== Delete =====================
exports.deleteEmployee = async (req, res) => {
  const { empid } = req.params;
  try {
    const employee = await EmployeeMaster.findOne({ where: { empid } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await employee.destroy();
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.bulkUpdateSalaries = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const fs = require('fs');
  const csv = require('csv-parser');
  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const updateResults = [];
        for (const s of results) {
          // Map user's specific CSV headers to database fields
          const empid = s['Emp ID'] || s.empid || s.EmpID || s.EMPID;
          const basic = parseFloat(s.Basic || s.basic || s.BASIC || 0);
          const hra = parseFloat(s.HRA || s.hra || 0);
          const conveyance = parseFloat(s.Conveyance || s.conveyance || 0);
          const washing_allowance = parseFloat(s['W.A'] || s.washing_allowance || 0);

          // Optional: handle PF, ESI, OT flags if present in CSV (Yes/No or Y/N)
          const pfFlag = s.PF || s.pf;
          const esiFlag = s.ESI || s.esi;
          const otFlag = s.OT || s.ot;

          const toYN = (val) => {
            if (!val) return null;
            const normalized = val.toString().trim().toUpperCase();
            return (normalized === 'YES' || normalized === 'Y') ? 'Y' : 'N';
          };

          if (!empid) {
            errors.push({ row: s, error: 'Missing Emp ID column' });
            continue;
          }

          const [emp, created] = await EmpSalary.upsert({
            empid: parseInt(empid),
            basic,
            hra,
            conveyance,
            washing_allowance,
            others1: 0,
            others2: 0,
            others3: 0,
            IS_esi: toYN(esiFlag) || (basic < 21000 ? 'Y' : 'N'),
            IS_pf: toYN(pfFlag) || (parseInt(empid) >= 1000 ? 'Y' : 'N'),
            IS_ot: toYN(otFlag) || 'Y',
            c_last_update: new Date(),
            c_upd_userid: req.session?.userId || 1020
          });
          updateResults.push({ empid, status: created ? 'created' : 'updated' });
        }

        // Delete the temporary file
        fs.unlinkSync(req.file.path);

        res.json({
          message: 'Salaries updated successfully',
          processed: updateResults.length,
          errors: errors.length > 0 ? errors : undefined
        });
      } catch (error) {
        console.error('Error processing CSV data:', error);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Error processing database update: ' + error.message });
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Error reading CSV file' });
    });
};

// ===================== Photo Upload =====================
exports.uploadPhoto = async (req, res) => {
  const { empid } = req.params;
  const { photo, fileName, mimeType } = req.body;

  if (!photo) {
    return res.status(400).json({ error: 'Photo data is required' });
  }

  try {
    const employee = await EmployeeMaster.findOne({ where: { empid } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const photoBuffer = Buffer.from(photo, 'base64');

    await employee.update({
      photo_blob: photoBuffer,
      img_name: fileName || 'photo.jpg',
      img_mimetype: mimeType || 'image/jpeg',
      img_lastupd: new Date(),
    });

    res.json({ message: 'Photo uploaded successfully' });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

// ===================== Get Photo =====================
exports.getPhoto = async (req, res) => {
  const { empid } = req.params;
  try {
    const employee = await EmployeeMaster.findOne({
      where: { empid },
      attributes: ['photo_blob', 'img_name', 'img_mimetype'],
    });

    if (!employee || !employee.photo_blob) {
      return res.json({ photo: null });
    }

    const base64Photo = employee.photo_blob.toString('base64');
    res.json({
      photo: base64Photo,
      fileName: employee.img_name,
      mimeType: employee.img_mimetype || 'image/jpeg',
    });
  } catch (error) {
    console.error('Error getting photo:', error);
    res.status(500).json({ error: 'Failed to get photo' });
  }
};

// ===================== Get All Photos (bulk) =====================
exports.getPhotos = async (req, res) => {
  try {
    const employees = await EmployeeMaster.findAll({
      attributes: ['empid', 'photo_blob', 'img_name', 'img_mimetype'],
    });

    const photos = employees.map((emp) => ({
      empid: emp.empid,
      photo: emp.photo_blob ? emp.photo_blob.toString('base64') : null,
      fileName: emp.img_name,
      mimeType: emp.img_mimetype || 'image/jpeg',
    }));

    res.json(photos);
  } catch (error) {
    console.error('Error getting photos:', error);
    res.status(500).json({ error: 'Failed to get photos' });
  }
};

// ===================== Delete Photo =====================
exports.deletePhoto = async (req, res) => {
  const { empid } = req.params;
  try {
    const employee = await EmployeeMaster.findOne({ where: { empid } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await employee.update({
      photo_blob: null,
      img_name: null,
      img_mimetype: null,
      img_lastupd: null,
    });

    res.json({ message: 'Photo removed successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};

// ===================== Update Profile (Address & Phone) =====================
exports.updateProfile = async (req, res) => {
  const empId = req.session?.user?.empid;
  if (!empId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { commAddress, permAddress, sameAsComm } = req.body;

  try {
    const employee = await EmployeeMaster.findOne({ where: { empid: empId } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updateData = {};

    if (commAddress) {
      if (commAddress.street !== undefined) updateData.cadd_sa = commAddress.street;
      if (commAddress.city !== undefined) updateData.cadd_city = commAddress.city;
      if (commAddress.state !== undefined) updateData.cadd_state = commAddress.state;
      if (commAddress.phone !== undefined) updateData.cadd_phone = commAddress.phone;
      if (commAddress.mobile !== undefined) updateData.cadd_mobile = commAddress.mobile;
      if (commAddress.pin !== undefined) updateData.cadd_pin = commAddress.pin;
      if (commAddress.email !== undefined) updateData.cadd_email = commAddress.email;
    }

    if (sameAsComm && commAddress) {
      updateData.padd_sa = commAddress.street || null;
      updateData.padd_city = commAddress.city || null;
      updateData.padd_state = commAddress.state || null;
      updateData.padd_phone = commAddress.phone || null;
      updateData.padd_mobile = commAddress.mobile || null;
      updateData.padd_pin = commAddress.pin || null;
      updateData.padd_email = commAddress.email || null;
    } else if (permAddress) {
      if (permAddress.street !== undefined) updateData.padd_sa = permAddress.street;
      if (permAddress.city !== undefined) updateData.padd_city = permAddress.city;
      if (permAddress.state !== undefined) updateData.padd_state = permAddress.state;
      if (permAddress.phone !== undefined) updateData.padd_phone = permAddress.phone;
      if (permAddress.mobile !== undefined) updateData.padd_mobile = permAddress.mobile;
      if (permAddress.pin !== undefined) updateData.padd_pin = permAddress.pin;
      if (permAddress.email !== undefined) updateData.padd_email = permAddress.email;
    }

    await employee.update(updateData);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ===================== Get Profile =====================
exports.getProfile = async (req, res) => {
  const empId = req.session?.user?.empid;
  if (!empId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const employee = await EmployeeMaster.findOne({
      where: { empid: empId },
      attributes: [
        'empid', 'ename', 'fname', 'dob', 'gender', 'deptname', 'secname', 'divname',
        'cadd_sa', 'cadd_city', 'cadd_state', 'cadd_phone', 'cadd_mobile', 'cadd_pin', 'cadd_email',
        'padd_sa', 'padd_city', 'padd_state', 'padd_phone', 'padd_mobile', 'padd_pin', 'padd_email',
      ],
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};
