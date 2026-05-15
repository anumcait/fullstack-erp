const bcrypt = require('bcrypt');
const { User, EmployeeMaster } = require('../models');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const { Op } = require('sequelize');
    console.log('Login attempt for ID:', username);
    const users = await User.findAll({ attributes: ['username', 'empid'] });
    console.log('Users found in DB:', users.map(u => `ID: ${u.empid} / User: ${u.username}`).join(', '));
    
    const empCount = await EmployeeMaster.count();
    console.log('Total Employees in DB:', empCount);

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { empid: isNaN(username) ? -1 : parseInt(username) }
        ]
      },
      include: [{
        model: EmployeeMaster,
        as: 'employee',
        attributes: ['ename']
      }]
    });

    if (!user) {
      console.log('User NOT found for ID:', username);
      return res.status(401).json({ message: 'Employee not found' });
    }

    console.log('User found:', user.username || user.empid, '| Hash in DB:', user.password_hash ? 'Present' : 'MISSING');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      console.log('Password mismatch for user:', user.username || user.empid);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Save session info
    req.session.user = {
      id: user.id,
      username: user.username,
      empid: user.empid,
      role: user.role,
      permissions: user.permissions || [],
      ename: user.employee?.ename || 'Guest'
    };

    // Update login metadata - save local time instead of UTC
    const now = new Date();
    const localTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    await user.update({
      previous_login: user.last_login,
      last_login: localTime,
      login_count: user.login_count + 1
    });

    res.json({ message: 'Login successful', user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

