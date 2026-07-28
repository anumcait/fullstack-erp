const db = require('../../models/Accounts');
const { Op } = require('sequelize');

const { ChartOfAccount, Voucher, VoucherItem, VoucherType, FinancialYear } = db;

exports.ledger = async (req, res) => {
  try {
    const { account_id, from, to } = req.query;
    if (!account_id) return res.status(400).json({ error: 'account_id is required' });
    const account = await ChartOfAccount.findByPk(account_id);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    const dateFilter = {};
    if (from) dateFilter[Op.gte] = from;
    if (to) dateFilter[Op.lte] = to;
    const where = { account_id };
    if (from || to) where['$voucher.date$'] = dateFilter;
    const items = await VoucherItem.findAll({
      where,
      include: [
        { model: Voucher, as: 'voucher', attributes: ['voucher_no', 'date', 'narration'], include: [
          { model: VoucherType, as: 'voucherType', attributes: ['code', 'name'] },
        ]},
        { model: ChartOfAccount, as: 'againstAccount', attributes: ['id', 'account_code', 'account_name'] },
      ],
      order: [[{ model: Voucher, as: 'voucher' }, 'date', 'ASC']],
    });
    let balance = parseFloat(account.opening_balance || 0);
    const balanceType = account.opening_balance_type || 'Dr';
    const entry = (type, amt) => type === 'Dr' ? amt : -amt;
    const rows = items.map((item) => {
      const dr = parseFloat(item.debit || 0);
      const cr = parseFloat(item.credit || 0);
      balance += dr - cr;
      return {
        date: item.voucher?.date,
        voucher_no: item.voucher?.voucher_no,
        voucher_type: item.voucher?.voucherType?.code,
        narration: item.narration || item.voucher?.narration,
        against: item.againstAccount?.account_name,
        debit: dr,
        credit: cr,
        balance,
        balance_type: balance >= 0 ? 'Dr' : 'Cr',
      };
    });
    res.json({
      account: { id: account.id, account_code: account.account_code, account_name: account.account_name },
      opening_balance: parseFloat(account.opening_balance || 0),
      opening_balance_type: balanceType,
      entries: rows,
    });
  } catch (err) {
    console.error('ledger.ledger', err);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
};

exports.daybook = async (req, res) => {
  try {
    const { date, from, to } = req.query;
    let dateFilter = {};
    if (date) {
      dateFilter = date;
    } else if (from || to) {
      if (from) dateFilter[Op.gte] = from;
      if (to) dateFilter[Op.lte] = to;
    } else {
      dateFilter = new Date().toISOString().slice(0, 10);
    }
    const vouchers = await Voucher.findAll({
      where: { date: dateFilter, status: 'Posted' },
      include: [
        { model: VoucherType, as: 'voucherType', attributes: ['code', 'name'] },
        { model: VoucherItem, as: 'items', include: [
          { model: ChartOfAccount, as: 'account', attributes: ['id', 'account_code', 'account_name'] },
        ]},
      ],
      order: [['voucher_no', 'ASC']],
    });
    res.json(vouchers);
  } catch (err) {
    console.error('ledger.daybook', err);
    res.status(500).json({ error: 'Failed to fetch daybook' });
  }
};

exports.trialBalance = async (req, res) => {
  try {
    const { as_on } = req.query;
    const dateFilter = {};
    if (as_on) dateFilter[Op.lte] = as_on;
    const accounts = await ChartOfAccount.findAll({
      where: { is_active: true, is_group: false },
      order: [['account_code', 'ASC']],
    });
    const result = await Promise.all(accounts.map(async (acc) => {
      const items = await VoucherItem.findAll({
        where: { account_id: acc.id },
        include: [{ model: Voucher, as: 'voucher', attributes: ['date', 'status'], where: { status: 'Posted', ...(as_on ? { date: { [Op.lte]: as_on } } : {}) } }],
      });
      let total_dr = 0, total_cr = 0;
      items.forEach((item) => {
        total_dr += parseFloat(item.debit || 0);
        total_cr += parseFloat(item.credit || 0);
      });
      const opening = parseFloat(acc.opening_balance || 0);
      return {
        id: acc.id,
        account_code: acc.account_code,
        account_name: acc.account_name,
        account_type: acc.account_type,
        opening,
        opening_type: acc.opening_balance_type || 'Dr',
        debit: total_dr,
        credit: total_cr,
        closing: opening + total_dr - total_cr,
      };
    }));
    res.json(result);
  } catch (err) {
    console.error('ledger.trialBalance', err);
    res.status(500).json({ error: 'Failed to fetch trial balance' });
  }
};
