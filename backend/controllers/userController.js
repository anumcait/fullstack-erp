const { User, EmployeeMaster } = require('../models');

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
