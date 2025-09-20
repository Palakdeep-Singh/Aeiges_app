import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import type { Bike } from '../types';

const BikesScreen = () => {
  const navigation = useNavigation();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBikes = async () => {
    try {
      const bikesData = await ApiService.getBikes();
      setBikes(bikesData);
    } catch (error) {
      console.error('Failed to fetch bikes:', error);
      Alert.alert('Error', 'Failed to load bikes');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBikes();
    setRefreshing(false);
  };

  const handleMarkStolen = async (bike: Bike) => {
    Alert.alert(
      'Mark as Stolen',
      `Are you sure you want to mark "${bike.bike_name}" as stolen?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Stolen',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.markBikeStolen(bike.id, true);
              fetchBikes();
              Alert.alert('Success', 'Bike marked as stolen');
            } catch (error) {
              Alert.alert('Error', 'Failed to mark bike as stolen');
            }
          },
        },
      ]
    );
  };

  const handleMarkRecovered = async (bike: Bike) => {
    try {
      await ApiService.markBikeStolen(bike.id, false);
      fetchBikes();
      Alert.alert('Success', 'Bike marked as recovered');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark bike as recovered');
    }
  };

  const handleDeleteBike = async (bike: Bike) => {
    Alert.alert(
      'Delete Bike',
      `Are you sure you want to delete "${bike.bike_name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteBike(bike.id);
              fetchBikes();
              Alert.alert('Success', 'Bike deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete bike');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const loadBikes = async () => {
      setIsLoading(true);
      await fetchBikes();
      setIsLoading(false);
    };
    
    loadBikes();
  }, []);

  const BikeCard = ({ bike }: { bike: Bike }) => (
    <View style={styles.bikeCard}>
      <View style={styles.bikeHeader}>
        <View style={styles.bikeInfo}>
          <Text style={styles.bikeName}>{bike.bike_name}</Text>
          <Text style={styles.bikeModel}>{bike.brand} {bike.model}</Text>
          {bike.is_primary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>PRIMARY</Text>
            </View>
          )}
        </View>
        <View style={styles.bikeActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteBike(bike)}
          >
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bikeDetails}>
        {bike.color && (
          <View style={styles.detailRow}>
            <Ionicons name="color-palette-outline" size={16} color="#64748b" />
            <Text style={styles.detailText}>{bike.color}</Text>
          </View>
        )}
        {bike.year && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.detailText}>{bike.year}</Text>
          </View>
        )}
        {bike.serial_number && (
          <View style={styles.detailRow}>
            <Ionicons name="barcode-outline" size={16} color="#64748b" />
            <Text style={styles.detailText}>{bike.serial_number}</Text>
          </View>
        )}
        {bike.estimated_value && (
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color="#64748b" />
            <Text style={styles.detailText}>${bike.estimated_value}</Text>
          </View>
        )}
      </View>

      <View style={styles.bikeFooter}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: bike.is_stolen ? '#dc2626' : '#16a34a' }
        ]}>
          <Text style={styles.statusText}>
            {bike.is_stolen ? 'STOLEN' : 'SAFE'}
          </Text>
        </View>
        
        {bike.is_stolen ? (
          <TouchableOpacity
            style={[styles.statusButton, styles.recoveredButton]}
            onPress={() => handleMarkRecovered(bike)}
          >
            <Text style={styles.recoveredButtonText}>Mark Recovered</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.statusButton, styles.stolenButton]}
            onPress={() => handleMarkStolen(bike)}
          >
            <Text style={styles.stolenButtonText}>Report Stolen</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="bicycle" size={40} color="#3b82f6" />
        <Text style={styles.loadingText}>Loading your bikes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={bikes.length === 0 ? styles.emptyContainer : undefined}
      >
        {bikes.length > 0 ? (
          <View style={styles.bikesContainer}>
            {bikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={80} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No bikes registered</Text>
            <Text style={styles.emptySubtitle}>
              Add your first bike to start protecting it with CycleGuard Pro
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddBike' as never)}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
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
  bikesContainer: {
    padding: 16,
  },
  bikeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bikeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bikeInfo: {
    flex: 1,
  },
  bikeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  bikeModel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  primaryBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  primaryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bikeActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  bikeDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  bikeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  stolenButton: {
    backgroundColor: '#dc2626',
  },
  stolenButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  recoveredButton: {
    backgroundColor: '#16a34a',
  },
  recoveredButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3b82f6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default BikesScreen;