import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import type { 
  Profile, 
  Bike, 
  CreateBike, 
  SecurityAlert, 
  TheftReport, 
  CreateTheftReport, 
  EmergencyContact,
  LiveData,
  DashboardStats
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add session token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('sessionToken');
  if (token) {
    config.headers.Cookie = `mocha-session-token=${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session token on unauthorized
      AsyncStorage.removeItem('sessionToken');
    }
    return Promise.reject(error);
  }
);

export class ApiService {
  // Auth
  static async getGoogleRedirectUrl(): Promise<{ redirectUrl: string }> {
    const response = await api.get(API_ENDPOINTS.GOOGLE_REDIRECT);
    return response.data;
  }

  static async createSession(code: string): Promise<{ success: boolean }> {
    const response = await api.post(API_ENDPOINTS.SESSIONS, { code });
    return response.data;
  }

  static async getCurrentUser(): Promise<any> {
    const response = await api.get(API_ENDPOINTS.USER_ME);
    return response.data;
  }

  static async logout(): Promise<{ success: boolean }> {
    const response = await api.get(API_ENDPOINTS.LOGOUT);
    await AsyncStorage.removeItem('sessionToken');
    return response.data;
  }

  // Profile
  static async getProfile(): Promise<Profile> {
    const response = await api.get(API_ENDPOINTS.PROFILE);
    return response.data;
  }

  static async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const response = await api.put(API_ENDPOINTS.PROFILE, data);
    return response.data;
  }

  // Bikes
  static async getBikes(): Promise<Bike[]> {
    const response = await api.get(API_ENDPOINTS.BIKES);
    return response.data;
  }

  static async createBike(data: CreateBike): Promise<Bike> {
    const response = await api.post(API_ENDPOINTS.BIKES, data);
    return response.data;
  }

  static async updateBike(id: number, data: Partial<CreateBike>): Promise<Bike> {
    const response = await api.put(`${API_ENDPOINTS.BIKES}/${id}`, data);
    return response.data;
  }

  static async deleteBike(id: number): Promise<{ success: boolean }> {
    const response = await api.delete(`${API_ENDPOINTS.BIKES}/${id}`);
    return response.data;
  }

  static async markBikeStolen(id: number, isStolen: boolean): Promise<Bike> {
    const response = await api.put(API_ENDPOINTS.BIKE_STOLEN(id), { is_stolen: isStolen });
    return response.data;
  }

  // Emergency Contacts
  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const response = await api.get(API_ENDPOINTS.EMERGENCY_CONTACTS);
    return response.data;
  }

  static async createEmergencyContact(data: Omit<EmergencyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<EmergencyContact> {
    const response = await api.post(API_ENDPOINTS.EMERGENCY_CONTACTS, data);
    return response.data;
  }

  static async updateEmergencyContact(id: number, data: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const response = await api.put(API_ENDPOINTS.EMERGENCY_CONTACT(id), data);
    return response.data;
  }

  static async deleteEmergencyContact(id: number): Promise<{ success: boolean }> {
    const response = await api.delete(API_ENDPOINTS.EMERGENCY_CONTACT(id));
    return response.data;
  }

  // Security Alerts
  static async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const response = await api.get(API_ENDPOINTS.SECURITY_ALERTS);
    return response.data;
  }

  static async resolveSecurityAlert(id: number): Promise<SecurityAlert> {
    const response = await api.put(API_ENDPOINTS.RESOLVE_SECURITY_ALERT(id));
    return response.data;
  }

  // Theft Reports
  static async getTheftReports(): Promise<TheftReport[]> {
    const response = await api.get(API_ENDPOINTS.THEFT_REPORTS);
    return response.data;
  }

  static async createTheftReport(data: CreateTheftReport): Promise<TheftReport> {
    const response = await api.post(API_ENDPOINTS.THEFT_REPORTS, data);
    return response.data;
  }

  static async updateTheftReport(id: number, status: string): Promise<TheftReport> {
    const response = await api.put(API_ENDPOINTS.THEFT_REPORT(id), { status });
    return response.data;
  }

  // Dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get(API_ENDPOINTS.DASHBOARD_STATS);
    return response.data;
  }

  static async getLiveData(): Promise<LiveData> {
    const response = await api.get(API_ENDPOINTS.LIVE_DATA);
    return response.data;
  }
}