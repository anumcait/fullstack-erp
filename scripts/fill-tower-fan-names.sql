-- Fill Tower Fan item names before FREEZE — run after filling docs/tower-fan-mapping.csv
-- This script updates the 38 distinct components from docs/test.md
-- It is idempotent and keeps item_code immutable.

BEGIN;

-- Example: update blank TFAN/ELEC/PACK codes to descriptive names.
-- Replace TFAN0001 etc with your chosen blank codes from mapping.

UPDATE m_item_master SET item_name='Normal TOP (FRONT) White', item_description='Tower Fan Normal Model - Front Top White', make_buy='Make', unit_id=1, hsn_code='8414', gst_rate=18 WHERE item_code='TFAN0001' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='Doom TOP (FRONT) White', item_description='Tower Fan Doom Model - Front Top White', make_buy='Make', unit_id=1, hsn_code='8414', gst_rate=18 WHERE item_code='TFAN0002' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='High Breeze TOP (FRONT) White', item_description='High Breeze Model - Front Top White', make_buy='Make', unit_id=1 WHERE item_code='TFAN0003' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='Perfume TOP (FRONT) White', item_description='Perfume Model - Front Top White', make_buy='Make', unit_id=1 WHERE item_code='TFAN0004' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='Colored front Panel', item_description='Perfume model colored panel', make_buy='Buy', unit_id=1 WHERE item_code='TFAN0005' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='BOTTOM (BACK) White', item_description='Common Bottom Back White', make_buy='Make', unit_id=1 WHERE item_code='TFAN0006' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='SWING PLATE (Slider)', make_buy='Buy', unit_id=1 WHERE item_code='TFAN0007' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='STOPPER PLATE', make_buy='Buy', unit_id=1 WHERE item_code='TFAN0011' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='LOWERS', make_buy='Buy', unit_id=1 WHERE item_code='TFAN0012' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='D PLATE with CAP SET Assembly', item_description='Sub-assembly Black - D Plate + Cap Set', make_buy='Phantom', is_stock_item=false, is_purchase_item=false, unit_id=1 WHERE item_code='COMP0001' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='MOTOR BASE Black', make_buy='Make', unit_id=1 WHERE item_code='TFAN0017' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='BLOWER Assembly', item_description='Blower Assembly Black', make_buy='Phantom', is_stock_item=false, unit_id=1 WHERE item_code='TFAN0018' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='Normal KNOBS White', make_buy='Buy', unit_id=1 WHERE item_code='TFAN0021' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='MOTOR WITH 4MFD CAPACITOR', item_description='Motor Nirosha/Olympus/China + Tibcon Capacitor', make_buy='Buy', unit_id=1, hsn_code='8501' WHERE item_code='ELEC0001' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='SWING MOTOR WITH BUSH', item_description='Sara Oscillation Motor', make_buy='Buy', unit_id=1 WHERE item_code='ELEC0002' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='ON/OFF SWITCH ELCOM', make_buy='Buy', unit_id=1 WHERE item_code='ELEC0003' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='3 SPEED SWITCH ELCOM', make_buy='Buy', unit_id=1 WHERE item_code='ELEC0004' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='POWER CORD 2.5m 2core', make_buy='Buy', unit_id=1 WHERE item_code='ELEC0005' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='INNER CARTON', make_buy='Buy', unit_id=1 WHERE item_code='PACK0010' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='Outer Carton', make_buy='Buy', unit_id=1 WHERE item_code='PACK0011' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='MANUAL & WARRANTY CARD', make_buy='Buy', unit_id=1 WHERE item_code='PACK0012' AND item_name IN ('-','.') ;
UPDATE m_item_master SET item_name='MRP AND OTHER LABELS', make_buy='Buy', unit_id=1 WHERE item_code='PACK0013' AND item_name IN ('-','.') ;

-- Verify no blanks remain in TFAN range
-- SELECT item_code, item_name FROM m_item_master WHERE item_code LIKE 'TFAN%' AND item_name IN ('-','.') ORDER BY item_code;

COMMIT;

-- After this, FREEZE: 
-- ALTER TABLE m_item_master ADD CONSTRAINT chk_freeze CHECK (true); -- app-level hook will enforce
