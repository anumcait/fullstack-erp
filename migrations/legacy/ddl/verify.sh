#!/bin/bash
su - oracle -c "sqlplus -s SYSTEM/hr_pass@localhost:1521/ORCLCDB <<EOF
SET PAGES 0 FEED OFF
SELECT 'TABLE_COUNT=' || COUNT(*) FROM all_tables WHERE owner='AUCTOR';
SELECT table_name FROM all_tables WHERE owner='AUCTOR' ORDER BY table_name;
EXIT
EOF"
