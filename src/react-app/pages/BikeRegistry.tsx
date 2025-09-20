import { useState, useEffect } from 'react';
import Sidebar from '@/react-app/components/Sidebar';
import { Plus, Edit2, Trash2, Camera, Shield } from 'lucide-react';
import { Bike, CreateBike } from '@/shared/types';
import axios from 'axios';

export default function BikeRegistry() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [formData, setFormData] = useState<CreateBike>({
    bike_name: '',
    model: '',
    brand: '',
    serial_number: '',
    license_plate: '',
    color: '',
    year: null,
    estimated_value: null,
    bike_photo_url: '',
    is_primary: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/bikes');
      setBikes(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.bike_name.trim()) {
      errors.bike_name = 'Bike name is required';
    }

    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    }

    if (formData.year && (formData.year < 1900 || formData.year > new Date().getFullYear() + 1)) {
      errors.year = 'Please enter a valid year';
    }

    if (formData.estimated_value && formData.estimated_value < 0) {
      errors.estimated_value = 'Value must be positive';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;

    setUploadingPhoto(true);
    try {
      // In a real app, you'd upload to a cloud storage service
      // For now, we'll create a mock URL
      const photoUrl = `https://images.unsplash.com/photo-1544191696-15693be7f75f?w=800&h=600&fit=crop`;
      setFormData(prev => ({ ...prev, bike_photo_url: photoUrl }));
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingBike) {
        const response = await axios.put(`/api/bikes/${editingBike.id}`, formData);
        setBikes(prev => prev.map(bike => 
          bike.id === editingBike.id ? response.data : bike
        ));
      } else {
        const response = await axios.post('/api/bikes', formData);
        setBikes(prev => [...prev, response.data]);
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving bike:', error);
    }
  };

  const handleDelete = async (bikeId: number) => {
    if (!confirm('Are you sure you want to delete this bike?')) return;

    try {
      await axios.delete(`/api/bikes/${bikeId}`);
      setBikes(prev => prev.filter(bike => bike.id !== bikeId));
    } catch (error) {
      console.error('Error deleting bike:', error);
    }
  };

  const handleEdit = (bike: Bike) => {
    setEditingBike(bike);
    setFormData({
      bike_name: bike.bike_name,
      model: bike.model,
      brand: bike.brand || '',
      serial_number: bike.serial_number || '',
      license_plate: bike.license_plate || '',
      color: bike.color || '',
      year: bike.year,
      estimated_value: bike.estimated_value,
      bike_photo_url: bike.bike_photo_url || '',
      is_primary: bike.is_primary,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const reportTheft = async () => {
    // Navigate to theft tracking page with bike selected
    window.location.href = '/theft-tracking';
  };

  const resetForm = () => {
    setFormData({
      bike_name: '',
      model: '',
      brand: '',
      serial_number: '',
      license_plate: '',
      color: '',
      year: null,
      estimated_value: null,
      bike_photo_url: '',
      is_primary: false,
    });
    setFormErrors({});
    setEditingBike(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const getBikeStatus = (bike: Bike) => {
    if (bike.is_stolen) {
      return { text: 'Stolen', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
    return { text: 'Secure', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
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
            <h1 className="text-3xl font-bold text-white mb-2">Bike Registry</h1>
            <p className="text-slate-400">Manage your bike collection and security</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Register New Bike</span>
          </button>
        </div>

        {/* Add/Edit Bike Form */}
        {showForm && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingBike ? 'Edit Bike' : 'Register New Bike'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {formData.bike_photo_url ? (
                    <img
                      src={formData.bike_photo_url}
                      alt="Bike"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-slate-600"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-slate-600">
                      <Camera className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                    />
                  </label>
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Bike Photo</h3>
                  <p className="text-sm text-slate-400 mb-4">Upload a clear photo of your bike for identification purposes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bike Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bike_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bike_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., My Mountain Bike"
                  />
                  {formErrors.bike_name && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.bike_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Trek Domane AL 2"
                  />
                  {formErrors.model && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.model}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Trek, Specialized, Giant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Found on bike frame"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    License Plate / ID
                  </label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_plate: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Registration ID if applicable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Red, Blue, Black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year?.toString() || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2023"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {formErrors.year && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.year}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Estimated Value ($)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_value?.toString() || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: e.target.value ? parseFloat(e.target.value) : null }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1500"
                    min="0"
                    step="0.01"
                  />
                  {formErrors.estimated_value && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.estimated_value}</p>
                  )}
                </div>
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
                  Set as primary bike
                </label>
                <Shield className="w-4 h-4 text-blue-400" />
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  {editingBike ? 'Update Bike' : 'Register Bike'}
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

        {/* Bikes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bikes.map((bike) => {
            const status = getBikeStatus(bike);
            return (
              <div
                key={bike.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300"
              >
                {/* Bike Photo */}
                <div className="relative mb-4">
                  {bike.bike_photo_url ? (
                    <img
                      src={bike.bike_photo_url}
                      alt={bike.bike_name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-slate-700 rounded-lg flex items-center justify-center">
                      <Camera className="w-12 h-12 text-slate-500" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                    {status.text}
                  </div>

                  {/* Primary Badge */}
                  {bike.is_primary && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
                      Primary
                    </div>
                  )}
                </div>

                {/* Bike Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{bike.bike_name}</h3>
                  <p className="text-slate-300 text-sm mb-1">{bike.brand} {bike.model}</p>
                  {bike.year && <p className="text-slate-400 text-sm">Year: {bike.year}</p>}
                  {bike.color && <p className="text-slate-400 text-sm">Color: {bike.color}</p>}
                  {bike.estimated_value && (
                    <p className="text-slate-400 text-sm">Value: ${bike.estimated_value.toLocaleString()}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(bike)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bike.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!bike.is_stolen && (
                    <button
                      onClick={() => reportTheft()}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                    >
                      Report Theft
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add New Bike Card */}
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-800/30 border border-slate-700/50 border-dashed rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300 flex flex-col items-center justify-center h-80"
          >
            <Plus className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-slate-400 font-medium">Register New Bike</h3>
            <p className="text-slate-500 text-sm text-center mt-2">
              Add your bike to the registry for enhanced security
            </p>
          </button>
        </div>

        {/* Empty State */}
        {bikes.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Bikes Registered</h3>
            <p className="text-slate-400 mb-6">Start building your bike registry for enhanced security and tracking</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Register Your First Bike
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
