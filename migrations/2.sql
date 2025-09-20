
-- Enhanced bike registration table
CREATE TABLE bikes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  bike_name TEXT NOT NULL,
  model TEXT NOT NULL,
  brand TEXT,
  serial_number TEXT,
  license_plate TEXT,
  color TEXT,
  year INTEGER,
  estimated_value REAL,
  bike_photo_url TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  is_stolen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bike theft reports table
CREATE TABLE theft_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bike_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  theft_date DATETIME NOT NULL,
  theft_location TEXT NOT NULL,
  theft_latitude REAL,
  theft_longitude REAL,
  description TEXT,
  police_report_number TEXT,
  status TEXT DEFAULT 'reported', -- 'reported', 'investigating', 'recovered', 'closed'
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recovered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bike tracking/monitoring sessions
CREATE TABLE tracking_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bike_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_end TIMESTAMP,
  start_latitude REAL,
  start_longitude REAL,
  end_latitude REAL,
  end_longitude REAL,
  max_speed REAL,
  distance_km REAL,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced alert types for theft protection
CREATE TABLE security_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bike_id INTEGER,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'unauthorized_movement', 'tampering', 'low_battery', 'geofence_breach'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  latitude REAL,
  longitude REAL,
  sensor_data TEXT, -- JSON data from sensors
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Geofencing for bike security
CREATE TABLE geofences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bike_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  fence_name TEXT NOT NULL,
  center_latitude REAL NOT NULL,
  center_longitude REAL NOT NULL,
  radius_meters INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  breach_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bikes_user_id ON bikes(user_id);
CREATE INDEX idx_theft_reports_bike_id ON theft_reports(bike_id);
CREATE INDEX idx_tracking_sessions_bike_id ON tracking_sessions(bike_id);
CREATE INDEX idx_security_alerts_bike_id ON security_alerts(bike_id);
CREATE INDEX idx_geofences_bike_id ON geofences(bike_id);
