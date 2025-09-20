import { useState, useEffect } from 'react';
import Sidebar from '@/react-app/components/Sidebar';
import { Plus, Edit2, Trash2, Phone, Mail, Star, Users } from 'lucide-react';
import { EmergencyContact, CreateEmergencyContact } from '@/shared/types';
import axios from 'axios';

export default function Contacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState<CreateEmergencyContact>({
    contact_name: '',
    phone_number: '',
    email: '',
    is_primary: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateEmergencyContact>>({});

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/emergency-contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreateEmergencyContact> = {};

    if (!formData.contact_name.trim()) {
      errors.contact_name = 'Name is required';
    }

    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingContact) {
        const response = await axios.put(`/api/emergency-contacts/${editingContact.id}`, formData);
        setContacts(prev => prev.map(contact => 
          contact.id === editingContact.id ? response.data : contact
        ));
      } else {
        const response = await axios.post('/api/emergency-contacts', formData);
        setContacts(prev => [...prev, response.data]);
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDelete = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await axios.delete(`/api/emergency-contacts/${contactId}`);
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      contact_name: contact.contact_name,
      phone_number: contact.phone_number,
      email: contact.email,
      is_primary: contact.is_primary,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      contact_name: '',
      phone_number: '',
      email: '',
      is_primary: false,
    });
    setFormErrors({});
    setEditingContact(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Emergency Contacts</h1>
            <p className="text-slate-400">Manage your emergency contact information</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Add/Edit Contact Form */}
        {showForm && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                  {formErrors.contact_name && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.contact_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone_number && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.phone_number}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_primary" className="text-slate-300 font-medium">
                  Set as primary contact
                </label>
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contacts List */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Emergency Contacts</h3>
              <p className="text-slate-400 mb-6">Add your first emergency contact to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Add Your First Contact
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-6">
                Your Emergency Contacts ({contacts.length})
              </h2>
              
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6 hover:bg-slate-700/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {contact.contact_name[0].toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-white">
                            {contact.contact_name}
                          </h3>
                          {contact.is_primary && (
                            <div className="flex items-center text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-6 mt-2">
                          <div className="flex items-center space-x-2 text-slate-300">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone_number}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-300">
                            <Mail className="w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                        </div>
                        
                        {contact.is_primary && (
                          <div className="mt-2">
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                              Primary Contact
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
