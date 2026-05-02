const { LeaveApplication, LeaveDetails, LeaveMaster } = require('./backend/models');

async function test() {
  try {
    console.log('Testing LeaveApplication findAll with includes...');
    const apps = await LeaveApplication.findAll({
      limit: 1,
      include: [
        { model: LeaveDetails, as: 'leaveDetails' },
        { model: LeaveMaster, as: 'leaveMaster' }
      ]
    });
    console.log('Found:', apps.length);
    if (apps.length > 0) {
       console.log('Sample LNo:', apps[0].lno);
       console.log('Details count:', apps[0].leaveDetails?.length || 0);
       console.log('Master found:', !!apps[0].leaveMaster);
    }
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
