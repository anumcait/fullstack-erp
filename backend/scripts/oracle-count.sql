SELECT 'HR_EMP' AS src, COUNT(*) AS cnt FROM hr.legacy_hr_employees
UNION ALL
SELECT 'ERP_ITM', COUNT(*) FROM erp.legacy_erp_items;
EXIT;
