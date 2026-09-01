SELECT owner, COUNT(*) AS cnt FROM all_tables GROUP BY owner ORDER BY owner;
EXIT;
