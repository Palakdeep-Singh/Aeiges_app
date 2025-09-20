import z from "zod";

// Profile Schema
export const ProfileSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  bike_model: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// Bike Schema
export const BikeSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  bike_name: z.string(),
  model: z.string(),
  brand: z.string().nullable(),
  serial_number: z.string().nullable(),
  license_plate: z.string().nullable(),
  color: z.string().nullable(),
  year: z.number().nullable(),
  estimated_value: z.number().nullable(),
  bike_photo_url: z.string().nullable(),
  is_primary: z.boolean(),
  is_stolen: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Bike = z.infer<typeof BikeSchema>;

// Create Bike Schema
export const CreateBikeSchema = z.object({
  bike_name: z.string().min(1, "Bike name is required"),
  model: z.string().min(1, "Model is required"),
  brand: z.string().optional(),
  serial_number: z.string().optional(),
  license_plate: z.string().optional(),
  color: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  estimated_value: z.number().min(0).optional().nullable(),
  bike_photo_url: z.string().optional(),
  is_primary: z.boolean().default(false),
});

export type CreateBike = z.infer<typeof CreateBikeSchema>;

// Update Bike Schema
export const UpdateBikeSchema = CreateBikeSchema.partial();
export type UpdateBike = z.infer<typeof UpdateBikeSchema>;

// Theft Report Schema
export const TheftReportSchema = z.object({
  id: z.number(),
  bike_id: z.number(),
  user_id: z.string(),
  theft_date: z.string(),
  theft_location: z.string(),
  theft_latitude: z.number().nullable(),
  theft_longitude: z.number().nullable(),
  description: z.string().nullable(),
  police_report_number: z.string().nullable(),
  status: z.enum(['reported', 'investigating', 'recovered', 'closed']),
  reported_at: z.string(),
  recovered_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TheftReport = z.infer<typeof TheftReportSchema>;

// Create Theft Report Schema
export const CreateTheftReportSchema = z.object({
  bike_id: z.number(),
  theft_date: z.string(),
  theft_location: z.string().min(1, "Theft location is required"),
  theft_latitude: z.number().optional(),
  theft_longitude: z.number().optional(),
  description: z.string().optional(),
  police_report_number: z.string().optional(),
});

export type CreateTheftReport = z.infer<typeof CreateTheftReportSchema>;

// Tracking Session Schema
export const TrackingSessionSchema = z.object({
  id: z.number(),
  bike_id: z.number(),
  user_id: z.string(),
  device_id: z.string(),
  session_start: z.string(),
  session_end: z.string().nullable(),
  start_latitude: z.number().nullable(),
  start_longitude: z.number().nullable(),
  end_latitude: z.number().nullable(),
  end_longitude: z.number().nullable(),
  max_speed: z.number().nullable(),
  distance_km: z.number().nullable(),
  duration_minutes: z.number().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TrackingSession = z.infer<typeof TrackingSessionSchema>;

// Security Alert Schema
export const SecurityAlertSchema = z.object({
  id: z.number(),
  bike_id: z.number().nullable(),
  user_id: z.string(),
  device_id: z.string(),
  alert_type: z.enum(['unauthorized_movement', 'tampering', 'low_battery', 'geofence_breach']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  sensor_data: z.string().nullable(),
  resolved: z.boolean(),
  resolved_by: z.string().nullable(),
  resolved_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SecurityAlert = z.infer<typeof SecurityAlertSchema>;

// Geofence Schema
export const GeofenceSchema = z.object({
  id: z.number(),
  bike_id: z.number(),
  user_id: z.string(),
  fence_name: z.string(),
  center_latitude: z.number(),
  center_longitude: z.number(),
  radius_meters: z.number(),
  is_active: z.boolean(),
  breach_notifications: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Geofence = z.infer<typeof GeofenceSchema>;

// Create Geofence Schema
export const CreateGeofenceSchema = z.object({
  bike_id: z.number(),
  fence_name: z.string().min(1, "Fence name is required"),
  center_latitude: z.number(),
  center_longitude: z.number(),
  radius_meters: z.number().min(10).max(10000),
  breach_notifications: z.boolean().default(true),
});

export type CreateGeofence = z.infer<typeof CreateGeofenceSchema>;

// Emergency Contact Schema
export const EmergencyContactSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  contact_name: z.string(),
  phone_number: z.string(),
  email: z.string().email(),
  is_primary: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

// Create Emergency Contact Schema (for API input)
export const CreateEmergencyContactSchema = z.object({
  contact_name: z.string().min(1, "Name is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  is_primary: z.boolean().default(false),
});

export type CreateEmergencyContact = z.infer<typeof CreateEmergencyContactSchema>;

// Update Emergency Contact Schema
export const UpdateEmergencyContactSchema = CreateEmergencyContactSchema.partial();
export type UpdateEmergencyContact = z.infer<typeof UpdateEmergencyContactSchema>;

// Alert Schema (legacy alerts)
export const AlertSchema = z.object({
  id: z.number(),
  device_id: z.string(),
  user_id: z.string(),
  alert_type: z.enum(['crash', 'blind_spot', 'manual_sos']),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  resolved: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Alert = z.infer<typeof AlertSchema>;

// Create Alert Schema (for ESP32 device)
export const CreateAlertSchema = z.object({
  device_id: z.string().min(1, "Device ID is required"),
  jwt: z.string().min(1, "JWT token is required"),
  alert_type: z.enum(['crash', 'blind_spot', 'manual_sos']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  gyroscope_x: z.number().optional(),
  gyroscope_y: z.number().optional(),
  gyroscope_z: z.number().optional(),
  accelerometer_x: z.number().optional(),
  accelerometer_y: z.number().optional(),
  accelerometer_z: z.number().optional(),
  gps_accuracy: z.number().optional(),
});

export type CreateAlert = z.infer<typeof CreateAlertSchema>;

// Create Security Alert Schema (for ESP32 device)
export const CreateSecurityAlertSchema = z.object({
  device_id: z.string().min(1, "Device ID is required"),
  jwt: z.string().min(1, "JWT token is required"),
  bike_id: z.number().optional(),
  alert_type: z.enum(['unauthorized_movement', 'tampering', 'low_battery', 'geofence_breach']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  sensor_data: z.string().optional(),
  gyroscope_x: z.number().optional(),
  gyroscope_y: z.number().optional(),
  gyroscope_z: z.number().optional(),
  accelerometer_x: z.number().optional(),
  accelerometer_y: z.number().optional(),
  accelerometer_z: z.number().optional(),
  gps_accuracy: z.number().optional(),
});

export type CreateSecurityAlert = z.infer<typeof CreateSecurityAlertSchema>;

// Update Profile Schema
export const UpdateProfileSchema = z.object({
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  bike_model: z.string().optional(),
  avatar_url: z.string().optional(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

// Live Data Schema (for dashboard)
export const LiveDataSchema = z.object({
  speed: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  device_status: z.enum(['online', 'offline']),
  crash_detection_active: z.boolean(),
  blind_spot_active: z.boolean(),
  theft_protection_active: z.boolean(),
  current_bike_id: z.number().nullable(),
  gyroscope_x: z.number().optional(),
  gyroscope_y: z.number().optional(),
  gyroscope_z: z.number().optional(),
  accelerometer_x: z.number().optional(),
  accelerometer_y: z.number().optional(),
  accelerometer_z: z.number().optional(),
  crash_sensitivity: z.number().default(50),
  blind_spot_sensitivity: z.number().default(50),
  theft_sensitivity: z.number().default(50),
  gps_accuracy: z.number().optional(),
  last_gps_update: z.string().optional(),
});

export type LiveData = z.infer<typeof LiveDataSchema>;

// Dashboard Stats Schema
export const DashboardStatsSchema = z.object({
  total_rides: z.number(),
  total_distance: z.number(),
  total_time: z.number(),
  avg_speed: z.number(),
  bikes_count: z.number(),
  active_alerts: z.number(),
  theft_reports: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
