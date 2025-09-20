import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import type { DashboardStats, LiveData, SecurityAlert } from '../types';

const DashboardScreen = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsData, liveDataData, alertsData] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getLiveData(),
        ApiService.getSecurityAlerts(),
      ]);

      setStats(statsData);
      setLiveData(liveDataData);
      setRecentAlerts(alertsData.slice(0, 3)); // Show only recent 3 alerts
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchDashboardData();
      setIsLoading(false);
    };
    
    loadData();
    
    // Set up periodic updates for live data
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#ffffff" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const AlertCard = ({ alert }: { alert: SecurityAlert }) => (
    <View style={styles.alertCard}>
      <View style={[
        styles.alertSeverity,
        { backgroundColor: 
          alert.severity === 'critical' ? '#dc2626' :
          alert.severity === 'high' ? '#ea580c' :
          alert.severity === 'medium' ? '#d97706' : '#16a34a'
        }
      ]} />
      <View style={styles.alertContent}>
        <Text style={styles.alertType}>
          {alert.alert_type.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={styles.alertTime}>
          {new Date(alert.created_at).toLocaleTimeString()}
        </Text>
      </View>
      <Ionicons 
        name={alert.resolved ? "checkmark-circle" : "alert-circle"} 
        size={20} 
        color={alert.resolved ? "#16a34a" : "#dc2626"} 
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="bicycle" size={40} color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3b82f6"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning!</Text>
        <Text style={styles.subtitle}>Here's your bike security overview</Text>
      </View>

      {/* Live Status */}
      {liveData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Status</Text>
          <View style={styles.liveCard}>
            <View style={styles.liveHeader}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: liveData.device_status === 'online' ? '#16a34a' : '#dc2626' }
              ]} />
              <Text style={styles.deviceStatus}>
                Device {liveData.device_status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.liveStats}>
              <View style={styles.liveStat}>
                <Text style={styles.liveStatValue}>{liveData.speed} km/h</Text>
                <Text style={styles.liveStatLabel}>Current Speed</Text>
              </View>
              <View style={styles.liveStat}>
                <Text style={styles.liveStatValue}>
                  {liveData.gps_accuracy?.toFixed(1) || 'N/A'}m
                </Text>
                <Text style={styles.liveStatLabel}>GPS Accuracy</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Statistics */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Rides"
              value={stats.total_rides}
              icon="bicycle"
              color="#3b82f6"
            />
            <StatCard
              title="Distance"
              value={`${stats.total_distance.toFixed(1)} km`}
              icon="speedometer"
              color="#10b981"
            />
            <StatCard
              title="My Bikes"
              value={stats.bikes_count}
              icon="library"
              color="#8b5cf6"
            />
            <StatCard
              title="Active Alerts"
              value={stats.active_alerts}
              icon="alert-circle"
              color="#dc2626"
            />
          </View>
        </View>
      )}

      {/* Recent Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentAlerts.length > 0 ? (
          recentAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark" size={40} color="#10b981" />
            <Text style={styles.emptyStateText}>No recent alerts</Text>
            <Text style={styles.emptyStateSubtext}>Your bike is secure</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="add-circle" size={24} color="#3b82f6" />
            <Text style={styles.quickActionText}>Add Bike</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="warning" size={24} color="#dc2626" />
            <Text style={styles.quickActionText}>Report Theft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="people" size={24} color="#8b5cf6" />
            <Text style={styles.quickActionText}>Contacts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  liveCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  deviceStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  liveStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  liveStat: {
    alignItems: 'center',
  },
  liveStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  liveStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertSeverity: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  alertTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1e293b',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;