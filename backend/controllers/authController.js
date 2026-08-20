const bcrypt = require('bcrypt');
const { User, EmployeeMaster } = require('../models');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const { Op } = require('sequelize');

    console.log(`[LoginDebug] Attempt for: ${username}`);
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { empid: isNaN(username) ? -1 : parseInt(username) }
        ],
        is_active: true
      },
      include: [{
        model: EmployeeMaster,
        as: 'employee',
        attributes: ['ename']
      }]
    });

    if (!user) {
      console.log(`[LoginDebug] User not found or inactive: ${username}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      const newAttempts = (user.failed_attempts || 0) + 1;
      await user.update({
        failed_attempts: newAttempts,
        // Optional: you could add a 'locked_until' column here for strict time-based blocking
      });

      console.log(`[LoginDebug] Password mismatch for: ${username}. Attempts: ${newAttempts}`);

      if (newAttempts >= 5) {
        return res.status(401).json({ message: 'Account locked due to too many failed attempts. Please contact HR or use Forgot Password.' });
      }
      return res.status(401).json({ message: 'The password you entered is incorrect.' });
    }

    // Success - Regenerate session to prevent session fixation
    const displayName = user.role === 'ADMIN'
      ? (user.username || user.ename || user.employee?.ename || 'Administrator')
      : (user.ename || user.employee?.ename || user.username || 'User');

    const mustChangePassword = !user.password_changed_at;

    const userData = {
      id: user.id,
      username: user.username,
      empid: user.empid,
      role: user.role,
      permissions: user.permissions || [],
      ename: displayName,
      mustChangePassword
    };

    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ message: 'Internal server error during login' });
      }

      req.session.user = userData;

      // Update login metadata
      const now = new Date();
      const localTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
      user.update({
        previous_login: user.last_login,
        last_login: localTime,
        login_count: user.login_count + 1,
        failed_attempts: 0 // Reset on successful login
      });

      res.json({ message: 'Login successful', user: userData, mustChangePassword });
    });
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

exports.forgotPassword = async (req, res) => {
  const { identifier } = req.body;
  console.log(`[AUTH] Forgot Password request received for identifier: "${identifier}"`);

  try {
    const { Op } = require('sequelize');

    // Find user by username, empid, or linked employee emails
    const user = await User.findOne({
      include: [{
        model: EmployeeMaster,
        as: 'employee',
        required: false
      }],
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: identifier } },
          { empid: isNaN(identifier) ? -1 : parseInt(identifier) },
          { '$employee.cadd_email$': { [Op.iLike]: identifier } },
          { '$employee.padd_email$': { [Op.iLike]: identifier } }
        ],
        is_active: true
      }
    });

    if (!user) {
      console.log(`[AUTH] Recovery failed: No active account found for identifier "${identifier}"`);
      return res.status(404).json({ message: 'No registered account found with that ID or Email.' });
    }

    // In a real app, generate OTP and send via Email/SMS
    const dummyOtp = "1234";
    console.log(`\n**************************************************`);
    console.log(`[PASSWORD RECOVERY SYSTEM]`);
    console.log(`User found: ${user.username} (Emp ID: ${user.empid})`);
    console.log(`Associated Email: ${user.employee?.cadd_email || 'N/A'}`);
    console.log(`Recovery Code: ${dummyOtp}`);
    console.log(`**************************************************\n`);

    res.json({
      message: `A recovery code has been sent to ${user.employee?.cadd_email || user.username || 'your registered contact'}.`
    });
  } catch (err) {
    console.error('[AUTH] Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process request due to a server error.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { identifier, newPassword } = req.body;
  try {
    const { Op } = require('sequelize');
    const user = await User.findOne({
      include: [{
        model: EmployeeMaster,
        as: 'employee',
        required: false
      }],
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: identifier } },
          { empid: isNaN(identifier) ? -1 : parseInt(identifier) },
          { '$employee.cadd_email$': { [Op.iLike]: identifier } },
          { '$employee.padd_email$': { [Op.iLike]: identifier } }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
      password_hash: hashedPassword,
      password_changed_at: new Date(),
      failed_attempts: 0
    });

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Login required to change password.' });
  }
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new password are required.' });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ message: 'New password must be at least 4 characters.' });
  }
  try {
    const user = await User.findByPk(req.session.user.id);
    if (!user || !user.is_active) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
      password_hash: hashedPassword,
      password_changed_at: new Date(),
      failed_attempts: 0
    });

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password.' });
  }
};

