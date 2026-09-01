SELECT file_name, tablespace_name, autoextensible, ROUND(bytes/1024/1024) AS mb, ROUND(maxbytes/1024/1024) AS max_mb
FROM dba_data_files ORDER BY tablespace_name;
EXIT;
