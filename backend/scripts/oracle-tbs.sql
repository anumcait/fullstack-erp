SELECT tablespace_name, ROUND(SUM(bytes)/1024/1024) AS mb FROM dba_data_files GROUP BY tablespace_name;
EXIT;
