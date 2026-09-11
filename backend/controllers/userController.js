const { User, EmployeeMaster } = require('../models');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: EmployeeMaster,
        as: 'employee',
        attributes: ['ename']
      }],
      attributes: ['id', 'username', 'role', 'permissions', 'empid', 'ename', 'last_login', 'previous_login', 'login_count', 'is_active', 'created_at'],
      order: [['id', 'ASC']]
    });
    const formattedUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      permissions: u.permissions || [],
      empid: u.empid,
      ename: u.employee?.ename || u.ename || u.username,
      last_login: u.last_login,
      previous_login: u.previous_login,
      login_count: u.login_count,
      is_active: u.is_active,
      created_at: u.created_at
    }));
    res.json(formattedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, role, empid, isSystemUser, permissions, ename } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const existing = await User.findOne({
      where: { [require('sequelize').Op.or]: [{ username }, ...(empid ? [{ empid }] : [])] }
    });
    if (existing) {
      return res.status(409).json({ message: `User with username "${username}"${empid ? ' or employee ID already' : ''} exists` });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const displayName = (ename && String(ename).trim()) || username;
    const userData = {
      username: username.trim(),
      password_hash,
      role: role || 'USER',
      permissions: permissions || [],
      is_active: true,
      ename: displayName,
      created_by: req.session?.user?.id || null
    };

    if (isSystemUser || !empid) {
      userData.empid = null;
    } else {
      userData.empid = parseInt(empid);
    }

    const user = await User.create(userData);
    res.status(201).json({
      id: user.id,
      username: user.username,
      ename: user.ename,
      role: user.role,
      permissions: user.permissions || [],
      empid: user.empid,
      last_login: user.last_login,
      login_count: user.login_count,
      message: 'User created successfully'
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};

exports.updatePermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions, role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ 
      permissions: permissions || user.permissions, 
      role: role || user.role 
    });
    res.json({ 
      message: 'User access updated successfully', 
      permissions: user.permissions,
      role: user.role
    });
  } catch (err) {
    console.error('Error updating permissions:', err);
    res.status(500).json({ message: 'Error updating permissions' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, ename, role } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (username && username.trim() !== user.username) {
      const exists = await User.findOne({ where: { username: username.trim() } });
      if (exists) return res.status(409).json({ message: `Username "${username.trim()}" already exists` });
    }
    const updates = {};
    if (username && username.trim()) updates.username = username.trim();
    if (ename !== undefined) updates.ename = String(ename).trim() || updates.username || user.username;
    if (role) updates.role = role;
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No fields to update' });
    await user.update(updates);
    res.json({ message: 'User updated successfully', id: user.id, username: user.username, ename: user.ename, role: user.role, empid: user.empid });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};
