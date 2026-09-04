const { ProfileUpdateRequest, EmployeeMaster } = require('../../models');
const { Op } = require('sequelize');

exports.submitRequest = async (req, res) => {
  const empId = req.session?.user?.empid;
  if (!empId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const employee = await EmployeeMaster.findOne({ where: { empid: empId }, raw: true });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { request_type, commAddress, permAddress } = req.body;

    const requestData = {
      empid: empId,
      request_type: request_type || 'both',
      status: 'Pending',
    };

    if (commAddress) {
      requestData.new_comm_address = `${commAddress.street || ''}, ${commAddress.city || ''}, ${commAddress.state || ''}`.trim();
      requestData.new_comm_phone = commAddress.phone || '';
      requestData.new_comm_mobile = commAddress.mobile || '';
      requestData.old_comm_address = `${employee.cadd_sa || ''}, ${employee.cadd_city || ''}, ${employee.cadd_state || ''}`.trim();
      requestData.old_comm_phone = employee.cadd_phone || '';
      requestData.old_comm_mobile = employee.cadd_mobile || '';
    }

    if (permAddress) {
      requestData.new_perm_address = `${permAddress.street || ''}, ${permAddress.city || ''}, ${permAddress.state || ''}`.trim();
      requestData.new_perm_phone = permAddress.phone || '';
      requestData.new_perm_mobile = permAddress.mobile || '';
      requestData.old_perm_address = `${employee.padd_sa || ''}, ${employee.padd_city || ''}, ${employee.padd_state || ''}`.trim();
      requestData.old_perm_phone = employee.padd_phone || '';
      requestData.old_perm_mobile = employee.padd_mobile || '';
    }

    const request = await ProfileUpdateRequest.create(requestData);

    res.status(201).json({ message: 'Profile update request submitted successfully', request });
  } catch (error) {
    console.error('Error submitting profile request:', error);
    res.status(500).json({ error: 'Failed to submit profile update request' });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    await ProfileUpdateRequest.update(
      { status: 'Pending' },
      { where: { status: { [Op.is]: null } } }
    );
    const { status } = req.query;
    let where = {};
    if (!status || status === 'Pending') where.status = 'Pending';
    else if (status !== 'All') where.status = status;
    const allRequests = await ProfileUpdateRequest.findAll({
      where: Object.keys(where).length ? where : undefined,
      order: [['created', 'DESC']],
      raw: true,
    });
    const requests = allRequests;

    const empIds = [...new Set(requests.map(r => r.empid))];
    const employees = await EmployeeMaster.findAll({
      where: { empid: { [Op.in]: empIds } },
      attributes: ['empid', 'ename', 'deptname'],
      raw: true,
    });

    const empMap = {};
    employees.forEach(e => { empMap[e.empid] = e; });

    const enrichedRequests = requests.map(r => ({
      ...r,
      employeeName: empMap[r.empid]?.ename || 'Unknown',
      department: empMap[r.empid]?.deptname || 'N/A',
    }));

    res.json(enrichedRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
};

exports.getMyRequests = async (req, res) => {
  const empId = req.session?.user?.empid;
  if (!empId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const requests = await ProfileUpdateRequest.findAll({
      where: { empid: empId },
      order: [['created', 'DESC']],
      raw: false,
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching my requests:', error);
    res.status(500).json({ error: 'Failed to fetch your requests' });
  }
};

exports.approveRequest = async (req, res) => {
  const hrId = req.session?.user?.empid;
  if (!hrId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { id } = req.params;
    const request = await ProfileUpdateRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    const empId = request.empid;
    const updateData = {};

    if (request.request_type === 'address' || request.request_type === 'both') {
      if (request.new_comm_address) {
        const newComm = request.new_comm_address.split(', ');
        updateData.cadd_sa = newComm[0] || '';
        updateData.cadd_city = newComm[1] || '';
        updateData.cadd_state = newComm[2] || '';
      }
      if (request.new_perm_address) {
        const newPerm = request.new_perm_address.split(', ');
        updateData.padd_sa = newPerm[0] || '';
        updateData.padd_city = newPerm[1] || '';
        updateData.padd_state = newPerm[2] || '';
      }
    }

    if (request.request_type === 'phone' || request.request_type === 'both') {
      if (request.new_comm_phone) updateData.cadd_phone = request.new_comm_phone;
      if (request.new_comm_mobile) updateData.cadd_mobile = request.new_comm_mobile;
      if (request.new_perm_phone) updateData.padd_phone = request.new_perm_phone;
      if (request.new_perm_mobile) updateData.padd_mobile = request.new_perm_mobile;
    }

    await EmployeeMaster.update(updateData, { where: { empid: empId } });

    await request.update({
      status: 'Approved',
      reviewed_by: hrId,
      reviewed_at: new Date(),
    });

    res.json({ message: 'Profile update request approved', request });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
};

exports.rejectRequest = async (req, res) => {
  const hrId = req.session?.user?.empid;
  if (!hrId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { id } = req.params;
    const { hr_remarks } = req.body;

    const request = await ProfileUpdateRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    await request.update({
      status: 'Rejected',
      hr_remarks: hr_remarks || 'Request rejected by HR',
      reviewed_by: hrId,
      reviewed_at: new Date(),
    });

    res.json({ message: 'Profile update request rejected', request });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
};