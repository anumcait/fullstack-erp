const db = require('../../models');
const { Op } = require('sequelize');
const { Voucher, VoucherItem, ChartOfAccount, VoucherType, FinancialYear } = db;

exports.stats = async (req, res) => {
  try {
    const fy = await FinancialYear.findOne({ where: { is_active: true } });
    const dateFilter = fy ? { [Op.between]: [fy.start_date, fy.end_date] } : {};
    const [totalVouchers, postedVouchers, draftVouchers] = await Promise.all([
      Voucher.count(),
      Voucher.count({ where: { status: 'Posted', ...(fy ? { date: dateFilter } : {}) } }),
      Voucher.count({ where: { status: 'Draft' } }),
    ]);
    const accountCounts = await Promise.all(
      ['Asset', 'Liability', 'Equity', 'Income', 'Expense'].map((type) =>
        ChartOfAccount.count({ where: { account_type: type, is_active: true } })
      )
    );
    const ledgers = await ChartOfAccount.findAll({
      where: { is_group: false, is_active: true },
      attributes: ['id', 'account_code', 'account_name', 'account_type', 'opening_balance'],
    });
    let totalAssets = 0, totalLiabilities = 0, totalIncome = 0, totalExpenses = 0;
    const items = await VoucherItem.findAll({
      include: [{ model: Voucher, as: 'voucher', where: { status: 'Posted' } }],
    });
    const accountMap = {};
    ledgers.forEach((l) => { accountMap[l.id] = l; });
    items.forEach((item) => {
      const acc = accountMap[item.account_id];
      if (!acc) return;
      const amt = parseFloat(item.debit || 0) - parseFloat(item.credit || 0);
      if (acc.account_type === 'Asset') totalAssets += amt;
      else if (acc.account_type === 'Liability') totalLiabilities += amt;
      else if (acc.account_type === 'Income') totalIncome += parseFloat(item.credit || 0);
      else if (acc.account_type === 'Expense') totalExpenses += parseFloat(item.debit || 0);
    });
    res.json({
      total_vouchers: totalVouchers,
      posted_vouchers: postedVouchers,
      draft_vouchers: draftVouchers,
      total_accounts: ledgers.length,
      total_assets: Math.abs(totalAssets),
      total_liabilities: Math.abs(totalLiabilities),
      total_income: totalIncome,
      total_expenses: totalExpenses,
      account_breakdown: {
        assets: accountCounts[0], liabilities: accountCounts[1],
        equity: accountCounts[2], income: accountCounts[3], expenses: accountCounts[4],
      },
      active_fy: fy?.name || null,
    });
  } catch (err) {
    console.error('dashboard.stats', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
