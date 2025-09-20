import React, { useState } from 'react';
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
import { ApiService } from '../services/api';
import type { CreateBike } from '../types';

const AddBikeScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CreateBike>({
    bike_name: '',
    model: '',
    brand: '',
    serial_number: '',
    license_plate: '',
    color: '',
    year: undefined,
    estimated_value: undefined,
    bike_photo_url: '',
    is_primary: false,
  });

  const handleInputChange = (field: keyof CreateBike, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.bike_name.trim()) {
      Alert.alert('Validation Error', 'Bike name is required');
      return false;
    }
    if (!form.model.trim()) {
      Alert.alert('Validation Error', 'Model is required');
      return false;
    }
    return true;
  };

  const handleSaveBike = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // Clean up form data
      const bikeData: CreateBike = {
        ...form,
        year: form.year && form.year > 0 ? form.year : undefined,
        estimated_value: form.estimated_value && form.estimated_value > 0 ? form.estimated_value : undefined,
      };

      await ApiService.createBike(bikeData);
      Alert.alert('Success', 'Bike added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to create bike:', error);
      Alert.alert('Error', 'Failed to add bike. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    required = false,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    multiline?: boolean;
    required?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Add New Bike</Text>
          <Text style={styles.subtitle}>
            Register your bike to start protecting it with CycleGuard Pro
          </Text>

          <View style={styles.form}>
            <InputField
              label="Bike Name"
              value={form.bike_name}
              onChangeText={(text) => handleInputChange('bike_name', text)}
              placeholder="e.g., My Mountain Bike"
              required
            />

            <InputField
              label="Model"
              value={form.model}
              onChangeText={(text) => handleInputChange('model', text)}
              placeholder="e.g., Trek 3500"
              required
            />

            <InputField
              label="Brand"
              value={form.brand || ''}
              onChangeText={(text) => handleInputChange('brand', text)}
              placeholder="e.g., Trek, Giant, Specialized"
            />

            <InputField
              label="Color"
              value={form.color || ''}
              onChangeText={(text) => handleInputChange('color', text)}
              placeholder="e.g., Red, Blue, Black"
            />

            <InputField
              label="Year"
              value={form.year ? form.year.toString() : ''}
              onChangeText={(text) => {
                const year = parseInt(text);
                handleInputChange('year', isNaN(year) ? undefined : year);
              }}
              placeholder="e.g., 2023"
              keyboardType="numeric"
            />

            <InputField
              label="Serial Number"
              value={form.serial_number || ''}
              onChangeText={(text) => handleInputChange('serial_number', text)}
              placeholder="e.g., WTU123456789"
            />

            <InputField
              label="License Plate"
              value={form.license_plate || ''}
              onChangeText={(text) => handleInputChange('license_plate', text)}
              placeholder="e.g., ABC123"
            />

            <InputField
              label="Estimated Value"
              value={form.estimated_value ? form.estimated_value.toString() : ''}
              onChangeText={(text) => {
                const value = parseFloat(text);
                handleInputChange('estimated_value', isNaN(value) ? undefined : value);
              }}
              placeholder="e.g., 1500"
              keyboardType="numeric"
            />

            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Primary Bike</Text>
                <Text style={styles.switchDescription}>
                  Set as your main bike for tracking
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switch,
                  form.is_primary && styles.switchActive
                ]}
                onPress={() => handleInputChange('is_primary', !form.is_primary)}
              >
                <View style={[
                  styles.switchThumb,
                  form.is_primary && styles.switchThumbActive
                ]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSaveBike}
              disabled={isLoading}
            >
              <Ionicons 
                name="checkmark" 
                size={16} 
                color="#ffffff" 
                style={styles.saveIcon} 
              />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Bike'}
              </Text>
            </TouchableOpacity>
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    lineHeight: 24,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  switch: {
    width: 50,
    height: 30,
    backgroundColor: '#e5e7eb',
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#3b82f6',
  },
  switchThumb: {
    width: 26,
    height: 26,
    backgroundColor: '#ffffff',
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  switchThumbActive: {
    marginLeft: 20,
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
  saveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveIcon: {
    marginRight: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default AddBikeScreen;