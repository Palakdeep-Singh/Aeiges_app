import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ApiService } from '../services/api';
import type { Bike, CreateTheftReport } from '../types';

const TheftReportScreen = () => {
  const navigation = useNavigation();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [form, setForm] = useState<CreateTheftReport>({
    bike_id: 0,
    theft_date: new Date().toISOString().split('T')[0],
    theft_location: '',
    theft_latitude: undefined,
    theft_longitude: undefined,
    description: '',
    police_report_number: '',
  });

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const bikesData = await ApiService.getBikes();
      setBikes(bikesData.filter(bike => !bike.is_stolen));
      
      if (bikesData.length > 0) {
        setForm(prev => ({ ...prev, bike_id: bikesData[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch bikes:', error);
      Alert.alert('Error', 'Failed to load bikes');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to get current location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationString = `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
        
        setForm(prev => ({
          ...prev,
          theft_location: locationString,
          theft_latitude: latitude,
          theft_longitude: longitude,
        }));
      } else {
        setForm(prev => ({
          ...prev,
          theft_location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          theft_latitude: latitude,
          theft_longitude: longitude,
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleInputChange = (field: keyof CreateTheftReport, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (form.bike_id === 0) {
      Alert.alert('Validation Error', 'Please select a bike');
      return false;
    }
    if (!form.theft_location.trim()) {
      Alert.alert('Validation Error', 'Theft location is required');
      return false;
    }
    if (!form.theft_date) {
      Alert.alert('Validation Error', 'Theft date is required');
      return false;
    }
    return true;
  };

  const handleSubmitReport = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      await ApiService.createTheftReport(form);
      
      Alert.alert(
        'Report Submitted',
        'Your theft report has been submitted successfully. We recommend contacting local authorities as well.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to submit theft report:', error);
      Alert.alert('Error', 'Failed to submit theft report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    required = false,
    rightIcon,
    onRightIconPress,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    required?: boolean;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, multiline && styles.textArea, rightIcon && styles.inputWithIcon]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={onRightIconPress}
            disabled={loadingLocation}
          >
            <Ionicons 
              name={loadingLocation ? "reload" : rightIcon} 
              size={20} 
              color="#3b82f6" 
              style={loadingLocation ? { transform: [{ rotate: '45deg' }] } : undefined}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const selectedBike = bikes.find(bike => bike.id === form.bike_id);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Report Theft</Text>
            <Text style={styles.subtitle}>
              Report your stolen bike to help with recovery efforts
            </Text>
          </View>

          {bikes.length === 0 ? (
            <View style={styles.noBikes}>
              <Ionicons name="bicycle-outline" size={60} color="#94a3b8" />
              <Text style={styles.noBikesTitle}>No bikes available</Text>
              <Text style={styles.noBikesText}>
                You need to register a bike before reporting it stolen
              </Text>
              <TouchableOpacity
                style={styles.addBikeButton}
                onPress={() => navigation.navigate('AddBike' as never)}
              >
                <Text style={styles.addBikeButtonText}>Add Bike</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              {/* Bike Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Select Bike <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.bikeSelector}>
                  {bikes.map((bike) => (
                    <TouchableOpacity
                      key={bike.id}
                      style={[
                        styles.bikeOption,
                        form.bike_id === bike.id && styles.bikeOptionSelected
                      ]}
                      onPress={() => handleInputChange('bike_id', bike.id)}
                    >
                      <View style={styles.bikeOptionContent}>
                        <Text style={[
                          styles.bikeOptionName,
                          form.bike_id === bike.id && styles.bikeOptionTextSelected
                        ]}>
                          {bike.bike_name}
                        </Text>
                        <Text style={[
                          styles.bikeOptionModel,
                          form.bike_id === bike.id && styles.bikeOptionTextSelected
                        ]}>
                          {bike.brand} {bike.model}
                        </Text>
                      </View>
                      {form.bike_id === bike.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <InputField
                label="Theft Date"
                value={form.theft_date}
                onChangeText={(text) => handleInputChange('theft_date', text)}
                placeholder="YYYY-MM-DD"
                required
              />

              <InputField
                label="Theft Location"
                value={form.theft_location}
                onChangeText={(text) => handleInputChange('theft_location', text)}
                placeholder="Enter the location where bike was stolen"
                required
                rightIcon="location"
                onRightIconPress={getCurrentLocation}
              />

              <InputField
                label="Description"
                value={form.description || ''}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholder="Describe the circumstances of the theft..."
                multiline
              />

              <InputField
                label="Police Report Number"
                value={form.police_report_number || ''}
                onChangeText={(text) => handleInputChange('police_report_number', text)}
                placeholder="Enter police report number if available"
              />

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text style={styles.infoText}>
                  After submitting this report, we recommend contacting local police 
                  and providing them with this information.
                </Text>
              </View>
            </View>
          )}

          {bikes.length > 0 && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmitReport}
                disabled={isLoading}
              >
                <Ionicons 
                  name="warning" 
                  size={16} 
                  color="#ffffff" 
                  style={styles.submitIcon} 
                />
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  noBikes: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noBikesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  noBikesText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  addBikeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addBikeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  bikeSelector: {
    gap: 8,
  },
  bikeOption: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bikeOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  bikeOptionContent: {
    flex: 1,
  },
  bikeOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  bikeOptionModel: {
    fontSize: 14,
    color: '#64748b',
  },
  bikeOptionTextSelected: {
    color: '#3b82f6',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitIcon: {
    marginRight: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default TheftReportScreen;