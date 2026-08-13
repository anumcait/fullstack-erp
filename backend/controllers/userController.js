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
      attributes: ['id', 'username', 'role', 'permissions', 'empid']
    });
    
    // Format response to include ename at top level for easier UI handling
    const formattedUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      permissions: u.permissions || [],
      empid: u.empid,
      ename: u.employee?.ename || 'No Name'
    }));
    
    res.json(formattedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, role, empid, isSystemUser, permissions } = req.body;

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

    const userData = {
      username,
      password_hash,
      role: role || 'USER',
      permissions: permissions || [],
      is_active: true
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
      role: user.role,
      permissions: user.permissions || [],
      empid: user.empid,
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
