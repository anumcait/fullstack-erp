const { TaxRegime, TaxInvestment, TaxComputation, EmpOfficial, EmpSalary } = require('../../models');
const { Op, fn, col } = require('sequelize');

const SECTIONS_OLD = [
  { section: '80C', label: '80C (PPF, ELSS, LIC, etc.)', max: 150000 },
  { section: '80CCC', label: '80CCC Pension Funds', max: 50000 },
  { section: '80CCD(1)', label: '80CCD(1) NPS Employee', max: 50000 },
  { section: '80CCD(1B)', label: '80CCD(1B) NPS Additional', max: 50000 },
  { section: '80D', label: '80D Medical Insurance', max: 25000 },
  { section: '80DD', label: '80DD Disabled Dependent', max: 75000 },
  { section: '80E', label: '80E Education Loan Interest', max: 0 },
  { section: '80G', label: '80G Donations', max: 0 },
  { section: '80TTA', label: '80TTA Savings Interest', max: 10000 },
  { section: '80TTB', label: '80TTB Senior Citizens Interest', max: 50000 },
  { section: '24B', label: 'Sec 24(b) Home Loan Interest', max: 200000 },
  { section: 'HRA', label: 'HRA Exemption', max: 0 },
];

const TAX_SLABS_OLD = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250001, max: 500000, rate: 5 },
  { min: 500001, max: 1000000, rate: 20 },
  { min: 1000001, max: Infinity, rate: 30 },
];

const TAX_SLABS_NEW = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300001, max: 600000, rate: 5 },
  { min: 600001, max: 900000, rate: 10 },
  { min: 900001, max: 1200000, rate: 15 },
  { min: 1200001, max: 1500000, rate: 20 },
  { min: 1500001, max: Infinity, rate: 30 },
];

function computeTax(taxableIncome, regime) {
  const slabs = regime === 'old' ? TAX_SLABS_OLD : TAX_SLABS_NEW;
  let tax = 0;
  for (const slab of slabs) {
    if (taxableIncome > slab.min) {
      const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
      tax += (taxableInSlab * slab.rate) / 100;
    }
  }
  let rebate = 0;
  if (regime === 'old' && taxableIncome <= 500000) rebate = Math.min(tax, 12500);
  if (regime === 'new' && taxableIncome <= 700000) rebate = Math.min(tax, 25000);
  const afterRebate = Math.max(0, tax - rebate);
  const cess = afterRebate * 0.04;
  return { tax_before_cess: tax, rebate_87a: rebate, education_cess: cess, total_tax: afterRebate + cess };
}

exports.getRegime = async (req, res) => {
  try {
    const { empid, fy } = req.query;
    if (!empid || !fy) return res.status(400).json({ error: 'empid and fy required' });
    let regime = await TaxRegime.findOne({ where: { empid, financial_year: fy } });
    if (!regime) regime = await TaxRegime.create({ empid, financial_year: fy, regime: 'new' });
    res.json(regime);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.setRegime = async (req, res) => {
  try {
    const { empid, financial_year, regime } = req.body;
    const [record] = await TaxRegime.upsert({ empid, financial_year, regime });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getInvestments = async (req, res) => {
  try {
    const { empid, fy } = req.query;
    const data = await TaxInvestment.findAll({ where: { empid, financial_year: fy }, order: [['section', 'ASC']] });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.saveInvestments = async (req, res) => {
  try {
    const { empid, financial_year, items } = req.body;
    await TaxInvestment.destroy({ where: { empid, financial_year } });
    const rows = items.map((it) => ({ empid, financial_year, ...it }));
    const created = await TaxInvestment.bulkCreate(rows);
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.computeTax = async (req, res) => {
  try {
    const { empid, financial_year } = req.body;
    if (!empid || !financial_year) return res.status(400).json({ error: 'empid and financial_year required' });

    const regimeRec = await TaxRegime.findOne({ where: { empid, financial_year } });
    const regime = regimeRec?.regime || 'new';
    const investments = await TaxInvestment.findAll({ where: { empid, financial_year } });

    const official = await EmpOfficial.findOne({ where: { empid } });
    const salary = await EmpSalary.findOne({ where: { empid } });

    // Compute gross income from payslips for the financial year
    const fyParts = financial_year.split('-');
    const fyStart = parseInt(fyParts[0]);
    const fyEnd = fyParts.length > 1 ? 2000 + parseInt(fyParts[1]) : fyStart + 1;
    const { Payslip } = require('../../models');
    const payslips = await Payslip.findAll({
      where: {
        empid,
        C_YEAR: { [Op.between]: [fyStart, fyEnd] },
        C_FINAL_STATUS: 'Final',
      },
    });

    const grossIncome = payslips.reduce((sum, p) => sum + parseFloat(p.C_GROSS || 0), 0);
    const tdsDeducted = payslips.reduce((sum, p) => sum + parseFloat(p.C_TDS || 0), 0);

    let totalDeductions = 0;
    if (regime === 'old') {
      const stdDeduction = Math.min(50000, grossIncome);
      totalDeductions += stdDeduction;

      // Sum up investment sections
      for (const inv of investments) {
        if (['80C', '80CCC', '80CCD(1)'].includes(inv.section)) {
          const combined = investments
            .filter((i) => ['80C', '80CCC', '80CCD(1)'].includes(i.section))
            .reduce((s, i) => s + parseFloat(i.amount || 0), 0);
          totalDeductions += Math.min(combined, 150000);
        } else if (inv.section === '80CCD(1B)') {
          totalDeductions += Math.min(parseFloat(inv.amount || 0), 50000);
        } else if (inv.section === '80D') {
          totalDeductions += Math.min(parseFloat(inv.amount || 0), 25000);
        } else if (inv.section === '24B') {
          totalDeductions += Math.min(parseFloat(inv.amount || 0), 200000);
        } else {
          totalDeductions += parseFloat(inv.amount || 0);
        }
      }
    }

    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    const taxResult = computeTax(taxableIncome, regime);
    const taxDue = Math.max(0, taxResult.total_tax - tdsDeducted);

    const [computation] = await TaxComputation.upsert({
      empid, financial_year,
      gross_income: grossIncome, standard_deduction: Math.min(50000, grossIncome),
      total_deductions: totalDeductions, taxable_income: taxableIncome,
      tax_before_cess: taxResult.tax_before_cess, rebate_87a: taxResult.rebate_87a,
      education_cess: taxResult.education_cess, total_tax: taxResult.total_tax,
      tds_deducted: tdsDeducted, tax_due: taxDue,
      status: 'Computed', computed_at: new Date(),
    });

    res.json(computation);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getComputation = async (req, res) => {
  try {
    const { empid, fy } = req.query;
    const data = await TaxComputation.findOne({ where: { empid, financial_year: fy } });
    res.json(data || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getSections = (req, res) => {
  res.json(SECTIONS_OLD);
};
