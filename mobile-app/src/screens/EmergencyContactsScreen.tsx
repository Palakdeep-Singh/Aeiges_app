import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import type { EmergencyContact } from '../types';

const EmergencyContactsScreen = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [form, setForm] = useState({
    contact_name: '',
    phone_number: '',
    email: '',
    is_primary: false,
  });

  const fetchContacts = async () => {
    try {
      const contactsData = await ApiService.getEmergencyContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      Alert.alert('Error', 'Failed to load emergency contacts');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  };

  const resetForm = () => {
    setForm({
      contact_name: '',
      phone_number: '',
      email: '',
      is_primary: false,
    });
    setEditingContact(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setForm({
      contact_name: contact.contact_name,
      phone_number: contact.phone_number,
      email: contact.email,
      is_primary: contact.is_primary,
    });
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const validateForm = () => {
    if (!form.contact_name.trim()) {
      Alert.alert('Validation Error', 'Contact name is required');
      return false;
    }
    if (!form.phone_number.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSaveContact = async () => {
    if (!validateForm()) return;

    try {
      if (editingContact) {
        await ApiService.updateEmergencyContact(editingContact.id, form);
        Alert.alert('Success', 'Contact updated successfully');
      } else {
        await ApiService.createEmergencyContact(form);
        Alert.alert('Success', 'Contact added successfully');
      }
      closeModal();
      fetchContacts();
    } catch (error) {
      console.error('Failed to save contact:', error);
      Alert.alert('Error', 'Failed to save contact');
    }
  };

  const handleDeleteContact = async (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete "${contact.contact_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteEmergencyContact(contact.id);
              fetchContacts();
              Alert.alert('Success', 'Contact deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);
      await fetchContacts();
      setIsLoading(false);
    };
    
    loadContacts();
  }, []);

  const ContactCard = ({ contact }: { contact: EmergencyContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.contact_name}</Text>
          {contact.is_primary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>PRIMARY</Text>
            </View>
          )}
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(contact)}
          >
            <Ionicons name="create-outline" size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteContact(contact)}
          >
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contactDetails}>
        <View style={styles.contactDetail}>
          <Ionicons name="call-outline" size={16} color="#64748b" />
          <Text style={styles.contactDetailText}>{contact.phone_number}</Text>
        </View>
        <View style={styles.contactDetail}>
          <Ionicons name="mail-outline" size={16} color="#64748b" />
          <Text style={styles.contactDetailText}>{contact.email}</Text>
        </View>
      </View>
    </View>
  );

  const ContactModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeModal}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingContact ? 'Edit Contact' : 'Add Contact'}
          </Text>
          <TouchableOpacity onPress={handleSaveContact}>
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={form.contact_name}
                onChangeText={(text) => setForm({ ...form, contact_name: text })}
                placeholder="Enter contact name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={form.phone_number}
                onChangeText={(text) => setForm({ ...form, phone_number: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Primary Contact</Text>
                <Text style={styles.switchDescription}>
                  This contact will be notified first in emergencies
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switch,
                  form.is_primary && styles.switchActive
                ]}
                onPress={() => setForm({ ...form, is_primary: !form.is_primary })}
              >
                <View style={[
                  styles.switchThumb,
                  form.is_primary && styles.switchThumbActive
                ]} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="people" size={40} color="#3b82f6" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
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
        contentContainerStyle={contacts.length === 0 ? styles.emptyContainer : undefined}
      >
        {contacts.length > 0 ? (
          <View style={styles.contactsContainer}>
            <Text style={styles.sectionTitle}>
              Emergency Contacts ({contacts.length})
            </Text>
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No emergency contacts</Text>
            <Text style={styles.emptySubtitle}>
              Add emergency contacts to be notified in case of alerts or theft
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      <ContactModal />
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
  contactsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  contactCard: {
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
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
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
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  contactDetails: {
    gap: 8,
  },
  contactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactDetailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalForm: {
    padding: 20,
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
});

export default EmergencyContactsScreen;