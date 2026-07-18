const db = require('../../models');
const { Op } = require('sequelize');

const { ChartOfAccount, Voucher, VoucherItem, VoucherType, FinancialYear } = db;

exports.profitLoss = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to dates are required' });
    const incomeAccounts = await ChartOfAccount.findAll({
      where: { account_type: 'Income', is_active: true, is_group: false },
      order: [['account_code', 'ASC']],
    });
    const expenseAccounts = await ChartOfAccount.findAll({
      where: { account_type: 'Expense', is_active: true, is_group: false },
      order: [['account_code', 'ASC']],
    });
    const calculateBalance = async (accounts) => {
      return Promise.all(accounts.map(async (acc) => {
        const items = await VoucherItem.findAll({
          where: { account_id: acc.id },
          include: [{ model: Voucher, as: 'voucher', attributes: ['date', 'status'], where: { status: 'Posted', date: { [Op.between]: [from, to] } } }],
        });
        let total = 0;
        items.forEach((item) => { total += parseFloat(item.credit || 0) - parseFloat(item.debit || 0); });
        return { id: acc.id, account_code: acc.account_code, account_name: acc.account_name, amount: Math.abs(total), type: total >= 0 ? 'Cr' : 'Dr' };
      }));
    };
    const income = await calculateBalance(incomeAccounts);
    const expenses = await calculateBalance(expenseAccounts);
    const totalIncome = income.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
    res.json({ from, to, income, expenses, total_income: totalIncome, total_expenses: totalExpenses, net_profit: totalIncome - totalExpenses });
  } catch (err) {
    console.error('pl', err);
    res.status(500).json({ error: 'Failed to generate P&L' });
  }
};

exports.balanceSheet = async (req, res) => {
  try {
    const { as_on } = req.query;
    const plFrom = req.query.pl_from;
    const plTo = req.query.pl_to;
    const dateFilter = as_on ? { [Op.lte]: as_on } : {};
    const assetAccounts = await ChartOfAccount.findAll({
      where: { account_type: 'Asset', is_active: true, is_group: false },
      order: [['account_code', 'ASC']],
    });
    const liabilityAccounts = await ChartOfAccount.findAll({
      where: { account_type: 'Liability', is_active: true, is_group: false },
      order: [['account_code', 'ASC']],
    });
    const equityAccounts = await ChartOfAccount.findAll({
      where: { account_type: 'Equity', is_active: true, is_group: false },
      order: [['account_code', 'ASC']],
    });
    const calculateBalance = async (accounts) => {
      return Promise.all(accounts.map(async (acc) => {
        const items = await VoucherItem.findAll({
          where: { account_id: acc.id },
          include: [{ model: Voucher, as: 'voucher', attributes: ['date', 'status'], where: { status: 'Posted', ...(as_on ? { date: dateFilter } : {}) } }],
        });
        let total = 0;
        items.forEach((item) => { total += parseFloat(item.debit || 0) - parseFloat(item.credit || 0); });
        const opening = parseFloat(acc.opening_balance || 0);
        const closing = opening + total;
        return { id: acc.id, account_code: acc.account_code, account_name: acc.account_name, balance: Math.abs(closing), type: closing >= 0 ? 'Dr' : 'Cr' };
      }));
    };
    const assets = await calculateBalance(assetAccounts);
    const liabilities = await calculateBalance(liabilityAccounts);
    const equity = await calculateBalance(equityAccounts);
    let netProfit = 0;
    if (plFrom && plTo) {
      try {
        const plRes = await exports.profitLoss({ query: { from: plFrom, to: plTo } }, { json: (d) => d });
        netProfit = plRes.net_profit || 0;
      } catch (e) {}
    }
    const totalAssets = assets.reduce((s, r) => s + r.balance, 0);
    const totalLiabilities = liabilities.reduce((s, r) => s + r.balance, 0);
    const totalEquity = equity.reduce((s, r) => s + r.balance, 0) + netProfit;
    res.json({
      as_on: as_on || new Date().toISOString().slice(0, 10),
      assets,
      liabilities,
      equity: [...equity, { account_name: 'Net Profit/Loss', balance: Math.abs(netProfit), type: netProfit >= 0 ? 'Cr' : 'Dr' }],
      total_assets: totalAssets,
      total_liabilities: totalLiabilities + (totalEquity > 0 ? totalEquity : 0),
      total_equity: totalEquity,
    });
  } catch (err) {
    console.error('balanceSheet', err);
    res.status(500).json({ error: 'Failed to generate balance sheet' });
  }
};

exports.agingReport = async (req, res) => {
  try {
    const { type } = req.query;
    const isPayable = type === 'payable';
    const contraType = isPayable ? 'Liability' : 'Asset';
    const accounts = await ChartOfAccount.findAll({
      where: { account_type: contraType, is_active: true, is_group: false },
      order: [['account_code', 'ASC']],
    });
    const result = await Promise.all(accounts.map(async (acc) => {
      const items = await VoucherItem.findAll({
        where: { account_id: acc.id },
        include: [{ model: Voucher, as: 'voucher', attributes: ['date', 'voucher_no', 'status'], where: { status: 'Posted' } }],
        order: [[{ model: Voucher, as: 'voucher' }, 'date', 'ASC']],
      });
      let balance = 0;
      const now = new Date();
      let aging = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
      items.forEach((item) => {
        balance += parseFloat(item.debit || 0) - parseFloat(item.credit || 0);
        const days = Math.floor((now - new Date(item.voucher.date)) / (1000 * 60 * 60 * 24));
        const amt = isPayable ? parseFloat(item.credit || 0) : parseFloat(item.debit || 0);
        if (days <= 30) aging['0-30'] += amt;
        else if (days <= 60) aging['31-60'] += amt;
        else if (days <= 90) aging['61-90'] += amt;
        else aging['90+'] += amt;
      });
      return { id: acc.id, account_code: acc.account_code, account_name: acc.account_name, balance: Math.abs(balance), aging };
    }));
    res.json(result);
  } catch (err) {
    console.error('aging', err);
    res.status(500).json({ error: 'Failed to generate aging report' });
  }
};
