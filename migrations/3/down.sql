
-- Drop indexes
DROP INDEX idx_system_settings_user_id;
DROP INDEX idx_sensor_readings_created_at;
DROP INDEX idx_sensor_readings_user_id;
DROP INDEX idx_sensor_readings_device_id;

-- Drop new tables
DROP TABLE system_settings;
DROP TABLE sensor_readings;

-- Remove sensor data columns from security_alerts
ALTER TABLE security_alerts DROP COLUMN gps_accuracy;
ALTER TABLE security_alerts DROP COLUMN accelerometer_z;
ALTER TABLE security_alerts DROP COLUMN accelerometer_y;
ALTER TABLE security_alerts DROP COLUMN accelerometer_x;
ALTER TABLE security_alerts DROP COLUMN gyroscope_z;
ALTER TABLE security_alerts DROP COLUMN gyroscope_y;
ALTER TABLE security_alerts DROP COLUMN gyroscope_x;

-- Remove sensor data columns from alerts
ALTER TABLE alerts DROP COLUMN gps_accuracy;
ALTER TABLE alerts DROP COLUMN accelerometer_z;
ALTER TABLE alerts DROP COLUMN accelerometer_y;
ALTER TABLE alerts DROP COLUMN accelerometer_x;
ALTER TABLE alerts DROP COLUMN gyroscope_z;
ALTER TABLE alerts DROP COLUMN gyroscope_y;
ALTER TABLE alerts DROP COLUMN gyroscope_x;
