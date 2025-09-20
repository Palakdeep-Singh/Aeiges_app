// API configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5177' 
  : 'https://01995e0f-5717-75d4-a678-d9763bfe9c94.mocha-app.workers.dev';

export const API_ENDPOINTS = {
  // Auth
  GOOGLE_REDIRECT: '/api/oauth/google/redirect_url',
  SESSIONS: '/api/sessions',
  USER_ME: '/api/users/me',
  LOGOUT: '/api/logout',
  
  // Profile
  PROFILE: '/api/profile',
  
  // Bikes
  BIKES: '/api/bikes',
  BIKE_STOLEN: (id: number) => `/api/bikes/${id}/stolen`,
  
  // Emergency Contacts
  EMERGENCY_CONTACTS: '/api/emergency-contacts',
  EMERGENCY_CONTACT: (id: number) => `/api/emergency-contacts/${id}`,
  
  // Alerts
  ALERTS: '/api/alerts',
  SECURITY_ALERTS: '/api/security-alerts',
  RESOLVE_ALERT: (id: number) => `/api/alerts/${id}/resolve`,
  RESOLVE_SECURITY_ALERT: (id: number) => `/api/security-alerts/${id}/resolve`,
  
  // Theft Reports
  THEFT_REPORTS: '/api/theft-reports',
  THEFT_REPORT: (id: number) => `/api/theft-reports/${id}`,
  
  // Dashboard
  DASHBOARD_STATS: '/api/dashboard-stats',
  LIVE_DATA: '/api/live-data',
  
  // System Settings
  SYSTEM_SETTINGS: '/api/system-settings',
};