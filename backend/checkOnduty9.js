const { OnDutyApplication } = require('./models');
(async()=>{
  const r=await OnDutyApplication.findOne({where:{movement_id:9}});
  console.log(r?r.toJSON():null);
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});