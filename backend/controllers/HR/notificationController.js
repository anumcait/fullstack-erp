const { Notification, LeaveDetails, ProfileUpdateRequest } = require('../../models');
const { Op } = require('sequelize');

exports.getNotifications = async (req, res) => {
    try {
        const empid = parseInt(req.headers['empid'] || req.query.empid || req.session?.user?.empid);
        if (!empid || isNaN(empid)) return res.status(400).json({ message: 'Employee ID required' });

        // Fetch real DB notifications
        let dbNotifs = [];
        try {
            dbNotifs = await Notification.findAll({
                where: { empid },
                order: [['createdAt', 'DESC']],
                limit: 20,
                raw: true
            });
        } catch (e) {
            // Table may not exist yet; gracefully ignore
            console.warn('Notification table not ready:', e.message);
        }

        // Build virtual notifications from pending leaves
        const virtualNotifs = [];
        try {
            const pendingLeaves = await LeaveDetails.count({ where: { empno: empid, c_hr_app_status: 'Pending' } });
            if (pendingLeaves > 0) {
                virtualNotifs.push({
                    id: 'virt-leave',
                    empid,
                    title: 'Pending Leave Request',
                    message: `You have ${pendingLeaves} leave application(s) awaiting HR approval.`,
                    type: 'Leave',
                    isRead: false,
                    link: '/leave',
                    createdAt: new Date().toISOString(),
                    virtual: true,
                });
            }
        } catch (e) { /* ignore */ }

        try {
            const pendingProfile = await ProfileUpdateRequest.count({ where: { empid, status: 'Pending' } });
            if (pendingProfile > 0) {
                virtualNotifs.push({
                    id: 'virt-profile',
                    empid,
                    title: 'Profile Update Pending',
                    message: `You have ${pendingProfile} profile update request(s) pending HR review.`,
                    type: 'Profile',
                    isRead: false,
                    link: '/profile',
                    createdAt: new Date().toISOString(),
                    virtual: true,
                });
            }
        } catch (e) { /* ignore */ }

        // Merge: virtual notifications first, then real DB notifications
        const allNotifs = [...virtualNotifs, ...dbNotifs];

        res.json(allNotifs);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        // Skip virtual notification IDs
        if (String(id).startsWith('virt-')) {
            return res.json({ message: 'Virtual notification acknowledged' });
        }
        await Notification.update({ isRead: true }, { where: { id } });
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const { empid } = req.body;
        if (!empid) return res.status(400).json({ message: 'Employee ID required' });
        try {
            await Notification.update({ isRead: true }, { where: { empid, isRead: false } });
        } catch (e) {
            console.warn('Notification table not ready:', e.message);
        }
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
