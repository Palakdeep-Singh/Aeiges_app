import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import type { Profile } from '../types';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    bike_model: '',
  });

  const fetchProfile = async () => {
    try {
      const profileData = await ApiService.getProfile();
      setProfile(profileData);
      setEditForm({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        bike_model: profileData.bike_model || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = await ApiService.updateProfile(editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      await fetchProfile();
      setIsLoading(false);
    };
    
    loadProfile();
  }, []);

  const ProfileItem = ({ 
    icon, 
    label, 
    value, 
    editable = false,
    onChangeText,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    editable?: boolean;
    onChangeText?: (text: string) => void;
  }) => (
    <View style={styles.profileItem}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon} size={20} color="#64748b" />
        <Text style={styles.profileLabel}>{label}</Text>
      </View>
      {isEditing && editable ? (
        <TextInput
          style={styles.profileInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <Text style={styles.profileValue}>{value || 'Not set'}</Text>
      )}
    </View>
  );

  const MenuButton = ({ 
    icon, 
    title, 
    onPress, 
    color = '#1e293b',
    showChevron = true 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    color?: string;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuButtonLeft}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[styles.menuButtonText, { color }]}>{title}</Text>
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person" size={40} color="#3b82f6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user?.picture ? (
            <Image source={{ uri: user.picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleSaveProfile();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Ionicons 
            name={isEditing ? "checkmark" : "create"} 
            size={16} 
            color="#ffffff" 
          />
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsEditing(false);
              setEditForm({
                first_name: profile?.first_name || '',
                last_name: profile?.last_name || '',
                bike_model: profile?.bike_model || '',
              });
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.profileCard}>
          <ProfileItem
            icon="person-outline"
            label="First Name"
            value={editForm.first_name}
            editable
            onChangeText={(text) => setEditForm({ ...editForm, first_name: text })}
          />
          <ProfileItem
            icon="person-outline"
            label="Last Name"
            value={editForm.last_name}
            editable
            onChangeText={(text) => setEditForm({ ...editForm, last_name: text })}
          />
          <ProfileItem
            icon="bicycle-outline"
            label="Primary Bike"
            value={editForm.bike_model}
            editable
            onChangeText={(text) => setEditForm({ ...editForm, bike_model: text })}
          />
          <ProfileItem
            icon="mail-outline"
            label="Email"
            value={user?.email || ''}
          />
          <ProfileItem
            icon="calendar-outline"
            label="Member Since"
            value={profile ? new Date(profile.created_at).toLocaleDateString() : ''}
          />
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuCard}>
          <MenuButton
            icon="people-outline"
            title="Emergency Contacts"
            onPress={() => navigation.navigate('EmergencyContacts' as never)}
          />
          <MenuButton
            icon="notifications-outline"
            title="Notification Settings"
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available in a future update')}
          />
          <MenuButton
            icon="shield-outline"
            title="Security Settings"
            onPress={() => Alert.alert('Coming Soon', 'Security settings will be available in a future update')}
          />
          <MenuButton
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => Alert.alert('Help', 'For support, please contact: support@cycleguard.pro')}
          />
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuButton
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            color="#dc2626"
            showChevron={false}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CycleGuard Pro v1.0.0</Text>
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
  profileHeader: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  profileValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  profileInput: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 120,
    textAlign: 'right',
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default ProfileScreen;