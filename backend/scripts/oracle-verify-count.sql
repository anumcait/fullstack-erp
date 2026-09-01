SELECT owner, COUNT(*) AS tables FROM all_tables WHERE owner IN ('HR','ERP') GROUP BY owner;
SELECT 'HR rows:' AS info, SUM(num_rows) FROM dba_tables WHERE owner='HR';
SELECT 'ERP rows:' AS info, SUM(num_rows) FROM dba_tables WHERE owner='ERP';
EXIT;
