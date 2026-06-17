-- Fix: Restore company name in m_company_settings after database backup/restore
-- Run this in psql or pgAdmin if the company name is blank in all reports

-- Check current state
SELECT id, company_name, address, phone, gstin FROM m_company_settings;

-- If row exists but company_name is empty, update it:
UPDATE m_company_settings
SET company_name = 'AUCTOR HOME APPLIANCES LLP'
WHERE company_name IS NULL OR company_name = '';

-- If NO row exists at all, insert one:
INSERT INTO m_company_settings (company_name, c_last_update)
SELECT 'AUCTOR HOME APPLIANCES LLP', NOW()
WHERE NOT EXISTS (SELECT 1 FROM m_company_settings);

-- Verify the fix
SELECT id, company_name, address, phone, gstin FROM m_company_settings;
