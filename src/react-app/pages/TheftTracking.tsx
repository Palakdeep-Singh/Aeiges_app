import { useState, useEffect } from 'react';
import Sidebar from '@/react-app/components/Sidebar';
import { AlertTriangle, MapPin, Shield, CheckCircle, Eye } from 'lucide-react';
import { TheftReport, Bike, SecurityAlert } from '@/shared/types';
import axios from 'axios';

export default function TheftTracking() {
  const [theftReports, setTheftReports] = useState<TheftReport[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedBike, setSelectedBike] = useState<number | null>(null);
  const [reportForm, setReportForm] = useState({
    theft_date: '',
    theft_location: '',
    description: '',
    police_report_number: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [theftRes, alertsRes, bikesRes] = await Promise.all([
        axios.get('/api/theft-reports'),
        axios.get('/api/security-alerts'),
        axios.get('/api/bikes')
      ]);
      setTheftReports(theftRes.data);
      setSecurityAlerts(alertsRes.data);
      setBikes(bikesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportTheft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBike) return;

    try {
      const response = await axios.post('/api/theft-reports', {
        bike_id: selectedBike,
        ...reportForm,
      });

      setTheftReports(prev => [response.data, ...prev]);
      
      // Mark bike as stolen
      await axios.put(`/api/bikes/${selectedBike}/stolen`, { is_stolen: true });
      setBikes(prev => prev.map(bike => 
        bike.id === selectedBike ? { ...bike, is_stolen: true } : bike
      ));

      setShowReportForm(false);
      setReportForm({
        theft_date: '',
        theft_location: '',
        description: '',
        police_report_number: '',
      });
      setSelectedBike(null);
    } catch (error) {
      console.error('Error reporting theft:', error);
    }
  };

  const updateTheftStatus = async (reportId: number, status: string) => {
    try {
      const response = await axios.put(`/api/theft-reports/${reportId}`, { status });
      setTheftReports(prev => prev.map(report => 
        report.id === reportId ? response.data : report
      ));

      // If recovered, mark bike as not stolen
      if (status === 'recovered') {
        const report = theftReports.find(r => r.id === reportId);
        if (report) {
          await axios.put(`/api/bikes/${report.bike_id}/stolen`, { is_stolen: false });
          setBikes(prev => prev.map(bike => 
            bike.id === report.bike_id ? { ...bike, is_stolen: false } : bike
          ));
        }
      }
    } catch (error) {
      console.error('Error updating theft status:', error);
    }
  };

  const resolveSecurityAlert = async (alertId: number) => {
    try {
      await axios.put(`/api/security-alerts/${alertId}/resolve`);
      setSecurityAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'investigating': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'recovered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500/20 text-blue-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const getBikeName = (bikeId: number) => {
    const bike = bikes.find(b => b.id === bikeId);
    return bike ? `${bike.bike_name} (${bike.model})` : 'Unknown Bike';
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
            <h1 className="text-3xl font-bold text-white mb-2">Theft Tracking & Security</h1>
            <p className="text-slate-400">Monitor bike security and manage theft reports</p>
          </div>
          
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Report Theft</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{bikes.filter(b => !b.is_stolen).length}</p>
                <p className="text-sm text-slate-400">Secure Bikes</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{bikes.filter(b => b.is_stolen).length}</p>
                <p className="text-sm text-slate-400">Stolen Bikes</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Eye className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{securityAlerts.filter(a => !a.resolved).length}</p>
                <p className="text-sm text-slate-400">Active Alerts</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{theftReports.filter(r => r.status === 'recovered').length}</p>
                <p className="text-sm text-slate-400">Recovered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Theft Form */}
        {showReportForm && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Report Bike Theft</h2>
            
            <form onSubmit={handleReportTheft} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Bike *
                </label>
                <select
                  value={selectedBike || ''}
                  onChange={(e) => setSelectedBike(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a bike...</option>
                  {bikes.filter(bike => !bike.is_stolen).map(bike => (
                    <option key={bike.id} value={bike.id}>
                      {bike.bike_name} - {bike.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date & Time of Theft *
                  </label>
                  <input
                    type="datetime-local"
                    value={reportForm.theft_date}
                    onChange={(e) => setReportForm(prev => ({ ...prev, theft_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={reportForm.theft_location}
                    onChange={(e) => setReportForm(prev => ({ ...prev, theft_location: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Street address or area"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Any additional details about the theft..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Police Report Number
                </label>
                <input
                  type="text"
                  value={reportForm.police_report_number}
                  onChange={(e) => setReportForm(prev => ({ ...prev, police_report_number: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="If you've filed a police report"
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Theft Reports */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Theft Reports</h2>
            
            {theftReports.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Theft Reports</h3>
                <p className="text-slate-400">All your bikes are secure!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {theftReports.map((report) => (
                  <div key={report.id} className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{getBikeName(report.bike_id)}</h4>
                        <p className="text-slate-400 text-sm">{formatDate(report.theft_date)}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-slate-300 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{report.theft_location}</span>
                    </div>
                    
                    {report.description && (
                      <p className="text-slate-400 text-sm mb-3">{report.description}</p>
                    )}

                    {report.status !== 'recovered' && report.status !== 'closed' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateTheftStatus(report.id, 'investigating')}
                          className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                          disabled={report.status === 'investigating'}
                        >
                          Mark Investigating
                        </button>
                        <button
                          onClick={() => updateTheftStatus(report.id, 'recovered')}
                          className="text-green-400 hover:text-green-300 text-sm transition-colors"
                        >
                          Mark Recovered
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security Alerts */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Security Alerts</h2>
            
            {securityAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Security Alerts</h3>
                <p className="text-slate-400">Your bikes are secure!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {securityAlerts.slice(0, 10).map((alert) => (
                  <div key={alert.id} className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-white font-medium capitalize">
                            {alert.alert_type.replace('_', ' ')}
                          </h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm">{formatDate(alert.created_at)}</p>
                      </div>
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveSecurityAlert(alert.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                    
                    {alert.bike_id && (
                      <p className="text-slate-300 text-sm mb-2">{getBikeName(alert.bike_id)}</p>
                    )}
                    
                    {alert.latitude && alert.longitude && (
                      <div className="flex items-center space-x-2 text-slate-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
