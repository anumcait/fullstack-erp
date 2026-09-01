SET SERVEROUTPUT ON
SPOOL /opt/oracle/rowcounts.txt
DECLARE
  n NUMBER;
BEGIN
  FOR r IN (SELECT table_name FROM all_tables WHERE owner='AUCTOR' ORDER BY table_name) LOOP
    EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM AUCTOR."'||r.table_name||'"' INTO n;
    DBMS_OUTPUT.PUT_LINE(r.table_name||'='||n);
  END LOOP;
END;
/
SPOOL OFF
EXIT
