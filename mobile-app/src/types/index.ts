// Re-export shared types from the web app
export interface Profile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bike_model: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bike {
  id: number;
  user_id: string;
  bike_name: string;
  model: string;
  brand: string | null;
  serial_number: string | null;
  license_plate: string | null;
  color: string | null;
  year: number | null;
  estimated_value: number | null;
  bike_photo_url: string | null;
  is_primary: boolean;
  is_stolen: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBike {
  bike_name: string;
  model: string;
  brand?: string;
  serial_number?: string;
  license_plate?: string;
  color?: string;
  year?: number;
  estimated_value?: number;
  bike_photo_url?: string;
  is_primary?: boolean;
}

export interface SecurityAlert {
  id: number;
  bike_id: number | null;
  user_id: string;
  device_id: string;
  alert_type: 'unauthorized_movement' | 'tampering' | 'low_battery' | 'geofence_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number | null;
  longitude: number | null;
  sensor_data: string | null;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TheftReport {
  id: number;
  bike_id: number;
  user_id: string;
  theft_date: string;
  theft_location: string;
  theft_latitude: number | null;
  theft_longitude: number | null;
  description: string | null;
  police_report_number: string | null;
  status: 'reported' | 'investigating' | 'recovered' | 'closed';
  reported_at: string;
  recovered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTheftReport {
  bike_id: number;
  theft_date: string;
  theft_location: string;
  theft_latitude?: number;
  theft_longitude?: number;
  description?: string;
  police_report_number?: string;
}

export interface EmergencyContact {
  id: number;
  user_id: string;
  contact_name: string;
  phone_number: string;
  email: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface LiveData {
  speed: number;
  latitude: number;
  longitude: number;
  device_status: 'online' | 'offline';
  crash_detection_active: boolean;
  blind_spot_active: boolean;
  theft_protection_active: boolean;
  current_bike_id: number | null;
  gps_accuracy?: number;
  last_gps_update?: string;
}

export interface DashboardStats {
  total_rides: number;
  total_distance: number;
  total_time: number;
  avg_speed: number;
  bikes_count: number;
  active_alerts: number;
  theft_reports: number;
}