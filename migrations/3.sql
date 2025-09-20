
-- Add sensor data columns to alerts table
ALTER TABLE alerts ADD COLUMN gyroscope_x REAL;
ALTER TABLE alerts ADD COLUMN gyroscope_y REAL;
ALTER TABLE alerts ADD COLUMN gyroscope_z REAL;
ALTER TABLE alerts ADD COLUMN accelerometer_x REAL;
ALTER TABLE alerts ADD COLUMN accelerometer_y REAL;
ALTER TABLE alerts ADD COLUMN accelerometer_z REAL;
ALTER TABLE alerts ADD COLUMN gps_accuracy REAL;

-- Add sensor data columns to security_alerts table
ALTER TABLE security_alerts ADD COLUMN gyroscope_x REAL;
ALTER TABLE security_alerts ADD COLUMN gyroscope_y REAL;
ALTER TABLE security_alerts ADD COLUMN gyroscope_z REAL;
ALTER TABLE security_alerts ADD COLUMN accelerometer_x REAL;
ALTER TABLE security_alerts ADD COLUMN accelerometer_y REAL;
ALTER TABLE security_alerts ADD COLUMN accelerometer_z REAL;
ALTER TABLE security_alerts ADD COLUMN gps_accuracy REAL;

-- Create sensor_readings table for continuous monitoring
CREATE TABLE sensor_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  bike_id INTEGER,
  speed REAL,
  latitude REAL,
  longitude REAL,
  gyroscope_x REAL,
  gyroscope_y REAL,
  gyroscope_z REAL,
  accelerometer_x REAL,
  accelerometer_y REAL,
  accelerometer_z REAL,
  gps_accuracy REAL,
  signal_strength INTEGER,
  battery_level REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create system_settings table for sensitivity and configuration
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  bike_id INTEGER,
  crash_detection_enabled BOOLEAN DEFAULT TRUE,
  crash_sensitivity INTEGER DEFAULT 50,
  blind_spot_enabled BOOLEAN DEFAULT TRUE,
  blind_spot_sensitivity INTEGER DEFAULT 50,
  theft_protection_enabled BOOLEAN DEFAULT TRUE,
  theft_sensitivity INTEGER DEFAULT 50,
  gyroscope_calibration_x REAL DEFAULT 0,
  gyroscope_calibration_y REAL DEFAULT 0,
  gyroscope_calibration_z REAL DEFAULT 0,
  auto_emergency_contacts BOOLEAN DEFAULT TRUE,
  emergency_response_delay INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX idx_sensor_readings_user_id ON sensor_readings(user_id);
CREATE INDEX idx_sensor_readings_created_at ON sensor_readings(created_at);
CREATE INDEX idx_system_settings_user_id ON system_settings(user_id);
