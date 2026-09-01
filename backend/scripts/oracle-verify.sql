SELECT 'HR' AS schema_name, table_name FROM all_tables WHERE owner = 'HR'
UNION ALL
SELECT 'ERP' AS schema_name, table_name FROM all_tables WHERE owner = 'ERP';
EXIT;
