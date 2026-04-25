const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Employee = sequelize.define(
    'EmployeeMaster',
    {
      // 🔹 Primary Identifiers
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      empid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },

      // 🔹 Employment Details
      company_id: { type: DataTypes.INTEGER, allowNull: false },
      unit_id: { type: DataTypes.INTEGER, allowNull: false }, //Unit ID
      div_id: { type: DataTypes.INTEGER }, // Division ID
      dept_id: { type: DataTypes.INTEGER }, // Department ID
      sec_id: { type: DataTypes.INTEGER }, // Section ID
      designation_id: { type: DataTypes.INTEGER },
      reporting_manager_id: { type: DataTypes.INTEGER },

      // 🔹 Cached Names (Optional for reporting/display)
      uname: { type: DataTypes.STRING(100) },
      divname: { type: DataTypes.STRING(100) },
      deptname: { type: DataTypes.STRING(100) },
      secname: { type: DataTypes.STRING(100) },

      // 🔹 Personal Details
      gender: { type: DataTypes.ENUM('M', 'F', 'O') },
      marital_status: { type: DataTypes.ENUM('Single', 'Married', 'Divorced', 'Widowed') },
      ename: { type: DataTypes.STRING(100), allowNull: false },
      fname: { type: DataTypes.STRING(100) },
      dob: { type: DataTypes.DATE, allowNull: false },
      pob: { type: DataTypes.STRING(50) },
      bgroup: { type: DataTypes.STRING(10) },
      mother_tongue: { type: DataTypes.STRING(50) },
      idfm1: { type: DataTypes.STRING(100) },
      idfm2: { type: DataTypes.STRING(100) },
      lang_known: { type: DataTypes.STRING(100) },

      // 🔹 Communication Address
      cadd_sa: { type: DataTypes.STRING(150) },
      cadd_city: { type: DataTypes.STRING(50) },
      cadd_state: { type: DataTypes.STRING(50) },
      cadd_phone: { type: DataTypes.STRING(50) },
      cadd_mobile: { type: DataTypes.STRING(50) },
      cadd_pin: { type: DataTypes.STRING(50) },
      cadd_email: { type: DataTypes.STRING(100) },

      // 🔹 Permanent Address
      padd_sa: { type: DataTypes.STRING(150) },
      padd_city: { type: DataTypes.STRING(50) },
      padd_state: { type: DataTypes.STRING(50) },
      padd_phone: { type: DataTypes.STRING(50) },
      padd_mobile: { type: DataTypes.STRING(50) },
      padd_pin: { type: DataTypes.STRING(50) },
      padd_email: { type: DataTypes.STRING(100) },

      // 🔹 Employment Status
      employment_status: {
        type: DataTypes.ENUM(
          'Active', 'Resigned', 'Terminated', 'On Leave',
          'Permanent', 'Contract', 'Intern'   // frontend empType values
        ),
        defaultValue: 'Active'
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Active'
      },
      resignation_date: { type: DataTypes.DATE },
      termination_date: { type: DataTypes.DATE },
      left_date: { type: DataTypes.DATE },
      left_reason: { type: DataTypes.STRING(255) },

      // 🔹 Profile & Photo
      employee_profile: { type: DataTypes.TEXT },
      applications: { type: DataTypes.TEXT },
      summary: { type: DataTypes.STRING(4000) },
      photo_blob: { type: DataTypes.BLOB('long') },
      img_name: { type: DataTypes.STRING(512) },
      img_mimetype: { type: DataTypes.STRING(50) },
      img_charset: { type: DataTypes.STRING(50) },
      img_lastupd: { type: DataTypes.DATE },

      // 🔹 System & Audit
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      is_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_by: { type: DataTypes.STRING(50) },
      updated_by: { type: DataTypes.STRING(50) },
    },
    {
      tableName: 'employee_master',
      underscored: true,
      timestamps: true,
      createdAt: 'created',
      updatedAt: 'updated',
      paranoid: true, // soft delete using deleted_at
    }
  );

  // 🔹 Associations
  Employee.associate = (models) => {
    Employee.hasOne(models.User, { foreignKey: 'empid', as: 'user' });
    Employee.hasOne(models.EmpOfficial, { foreignKey: 'empid', as: 'official' });
    Employee.hasOne(models.EmpSalary, { foreignKey: 'empid', as: 'salary' });
    Employee.hasMany(models.EmpFamily, { foreignKey: 'empid', as: 'family' });
    Employee.hasMany(models.EmpQualification, { foreignKey: 'empid', as: 'qualification' });
    Employee.hasMany(models.EmpExperience, { foreignKey: 'empid', as: 'experience' });
    Employee.hasOne(models.LeaveMaster, { foreignKey: 'empid', sourceKey: 'empid' });
    Employee.hasMany(models.Payslip, { foreignKey: 'C_EMPID', sourceKey: 'empid', as: 'payslips' });
  };

  return Employee;
};

// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const Employee = sequelize.define(
//     'EmployeeMaster',
//     {
//       // 🔹 Primary Identifiers
//       id: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         primaryKey: true
//       },
//       empid: {
//         type: DataTypes.INTEGER,
//         // primaryKey: true,
//         allowNull: false,
//         unique: true, //Business ID
//         // autoIncrement: true, // Uncomment if you want auto-increment
//       },
//       // 🔹 Employment Details
//       company_id: { type: DataTypes.INTEGER, allowNull: false },
//       unit_id: { type: DataTypes.INTEGER, allowNull: false },
//       div_id: { type: DataTypes.INTEGER }, // Division
//       dept_id: { type: DataTypes.INTEGER }, // Department
//       sec_id: { type: DataTypes.INTEGER }, // Section
//       designation_id: { type: DataTypes.INTEGER },

//       gender: DataTypes.CHAR(1),
//       marital_status: DataTypes.STRING(10),
//       ename: DataTypes.STRING(100),
//       fname: DataTypes.STRING(100),
//       dob: DataTypes.DATE,
//       pob: DataTypes.STRING(50),
//       bgroup: DataTypes.STRING(10),
//       mother_tongue: DataTypes.STRING(20), // Fixed typo
//       idfm1: DataTypes.STRING(100),
//       idfm2: DataTypes.STRING(100),
//       lang_known: DataTypes.STRING(100),

//       // Communication Address
//       cadd_sa: DataTypes.STRING(150),
//       cadd_city: DataTypes.STRING(50),
//       cadd_state: DataTypes.STRING(50),
//       cadd_phone: DataTypes.STRING(50),
//       cadd_mobile: DataTypes.STRING(50),
//       cadd_pin: DataTypes.STRING(50),
//       cadd_email: DataTypes.STRING(100), // Increased length for email

//       // Permanent Address
//       padd_sa: DataTypes.STRING(150),
//       padd_city: DataTypes.STRING(50),
//       padd_state: DataTypes.STRING(50),
//       padd_phone: DataTypes.STRING(50),
//       padd_mobile: DataTypes.STRING(50),
//       padd_pin: DataTypes.STRING(50),
//       padd_email: DataTypes.STRING(100),

//       photo: DataTypes.BLOB('long'),
//       uname: DataTypes.STRING(40),
//       divname: DataTypes.STRING(40),
//       deptname: DataTypes.STRING(40),
//       secname: DataTypes.STRING(40),
//       employment_status: { type: DataTypes.ENUM('Active', 'Resigned', 'Terminated', 'On Leave'), defaultValue: 'Active' },
//       c_emp_left_status: DataTypes.CHAR(1),
//       c_emp_left_date: DataTypes.DATE,
//       c_last_update: DataTypes.DATE,
//       c_upd_userid: DataTypes.INTEGER,
//       c_gempid: DataTypes.STRING(40),
//       employee_profile: DataTypes.TEXT,
//       applications: DataTypes.TEXT,
//       summary: DataTypes.STRING(4000),
//       category_id: DataTypes.INTEGER,
//       img_blob: DataTypes.BLOB('long'),
//       img_name: DataTypes.STRING(512),
//       img_mimetype: DataTypes.STRING(512),
//       img_charset: DataTypes.STRING(512),
//       img_lastupd: DataTypes.DATE,
//       created: DataTypes.DATE,
//       created_by: DataTypes.STRING(255),
//       updated: DataTypes.DATE,
//       updated_by: DataTypes.STRING(255),
//       is_active: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: true
//       },
//       deleted_at: { type: DataTypes.DATE },
//     },
//     {
//       tableName: 'employee_master',
//       timestamps: false,
//       underscored: true, // Ensures snake_case column mapping
//     }
//   );

//   Employee.associate = (models) => {
//     Employee.hasOne(models.User, { foreignKey: 'empid', as: 'user' });
//     Employee.hasMany(models.EmpFamily, { foreignKey: 'empid', as: 'family' });
//     Employee.hasMany(models.EmpQualification, { foreignKey: 'empid', as: 'qualification' });
//     Employee.hasMany(models.EmpExperience, { foreignKey: 'empid', as: 'experience' });
//     Employee.hasOne(models.EmpOfficial, { foreignKey: 'empid', as: 'official' });
//     Employee.hasOne(models.EmpSalary, { foreignKey: 'empid', as: 'salary' });
//     Employee.hasOne(models.LeaveMaster, { foreignKey: 'empid', sourceKey: 'empid' });
//   };



//   return Employee;
// };