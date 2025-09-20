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
import type { SecurityAlert } from '../types';

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      const alertsData = await ApiService.getSecurityAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      Alert.alert('Error', 'Failed to load security alerts');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await ApiService.resolveSecurityAlert(alertId);
      fetchAlerts();
      Alert.alert('Success', 'Alert marked as resolved');
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve alert');
    }
  };

  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true);
      await fetchAlerts();
      setIsLoading(false);
    };
    
    loadAlerts();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'unauthorized_movement':
        return 'car-outline';
      case 'tampering':
        return 'hand-left-outline';
      case 'low_battery':
        return 'battery-dead-outline';
      case 'geofence_breach':
        return 'location-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#16a34a';
      default:
        return '#64748b';
    }
  };

  const formatAlertType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const AlertCard = ({ alert }: { alert: SecurityAlert }) => (
    <View style={[
      styles.alertCard,
      alert.resolved && styles.resolvedAlert
    ]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <Ionicons
            name={getAlertIcon(alert.alert_type)}
            size={24}
            color={getSeverityColor(alert.severity)}
          />
        </View>
        <View style={styles.alertInfo}>
          <Text style={[
            styles.alertType,
            alert.resolved && styles.resolvedText
          ]}>
            {formatAlertType(alert.alert_type)}
          </Text>
          <Text style={styles.alertTime}>
            {formatDate(alert.created_at)}
          </Text>
        </View>
        <View style={[
          styles.severityBadge,
          { backgroundColor: getSeverityColor(alert.severity) }
        ]}>
          <Text style={styles.severityText}>
            {alert.severity.toUpperCase()}
          </Text>
        </View>
      </View>

      {alert.latitude && alert.longitude && (
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text style={styles.locationText}>
            {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {alert.sensor_data && (
        <View style={styles.sensorInfo}>
          <Text style={styles.sensorLabel}>Sensor Data:</Text>
          <Text style={styles.sensorData}>{alert.sensor_data}</Text>
        </View>
      )}

      <View style={styles.alertFooter}>
        <View style={styles.statusContainer}>
          <Ionicons
            name={alert.resolved ? "checkmark-circle" : "alert-circle"}
            size={16}
            color={alert.resolved ? "#16a34a" : "#dc2626"}
          />
          <Text style={[
            styles.statusText,
            { color: alert.resolved ? "#16a34a" : "#dc2626" }
          ]}>
            {alert.resolved ? 'Resolved' : 'Active'}
          </Text>
        </View>

        {!alert.resolved && (
          <TouchableOpacity
            style={styles.resolveButton}
            onPress={() => handleResolveAlert(alert.id)}
          >
            <Text style={styles.resolveButtonText}>Resolve</Text>
          </TouchableOpacity>
        )}
      </View>

      {alert.resolved && alert.resolved_at && (
        <Text style={styles.resolvedTime}>
          Resolved {formatDate(alert.resolved_at)}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="shield-checkmark" size={40} color="#3b82f6" />
        <Text style={styles.loadingText}>Loading security alerts...</Text>
      </View>
    );
  }

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

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
      contentContainerStyle={alerts.length === 0 ? styles.emptyContainer : undefined}
    >
      {alerts.length > 0 ? (
        <View style={styles.alertsContainer}>
          {activeAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Active Alerts ({activeAlerts.length})
              </Text>
              {activeAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </View>
          )}

          {resolvedAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Resolved Alerts ({resolvedAlerts.length})
              </Text>
              {resolvedAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="shield-checkmark-outline" size={80} color="#10b981" />
          <Text style={styles.emptyTitle}>All Clear!</Text>
          <Text style={styles.emptySubtitle}>
            No security alerts detected. Your bikes are safe and secure.
          </Text>
        </View>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  alertsContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resolvedAlert: {
    backgroundColor: '#f8fafc',
    opacity: 0.8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  resolvedText: {
    color: '#64748b',
  },
  alertTime: {
    fontSize: 12,
    color: '#64748b',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  sensorInfo: {
    marginBottom: 12,
  },
  sensorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  sensorData: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  resolveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resolveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  resolvedTime: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AlertsScreen;