import { useState, useEffect } from 'react';
import Sidebar from '@/react-app/components/Sidebar';
import Speedometer from '@/react-app/components/Speedometer';
import EnhancedStatusCard from '@/react-app/components/EnhancedStatusCard';
import GyroscopeVisualization from '@/react-app/components/GyroscopeVisualization';
import SensorDataDisplay from '@/react-app/components/SensorDataDisplay';
import Map from '@/react-app/components/Map';
import { Shield, Eye, Wifi, AlertTriangle, CheckCircle, Bike as BikeIcon } from 'lucide-react';
import { Alert, LiveData, DashboardStats, Bike } from '@/shared/types';
import axios from 'axios';

export default function Dashboard() {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState({
    crash_detection_enabled: true,
    crash_sensitivity: 50,
    blind_spot_enabled: true,
    blind_spot_sensitivity: 50,
    theft_protection_enabled: true,
    theft_sensitivity: 50,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [liveDataRes, alertsRes, statsRes, bikesRes] = await Promise.all([
          axios.get('/api/live-data'),
          axios.get('/api/alerts'),
          axios.get('/api/dashboard-stats'),
          axios.get('/api/bikes')
        ]);
        
        setLiveData(liveDataRes.data);
        setAlerts(alertsRes.data);
        setStats(statsRes.data);
        setBikes(bikesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for live data every 2 seconds for real-time updates
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const resolveAlert = async (alertId: number) => {
    try {
      await axios.put(`/api/alerts/${alertId}/resolve`);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const updateSystemSetting = async (setting: string, value: boolean | number) => {
    try {
      await axios.put('/api/system-settings', { [setting]: value });
      setSystemSettings(prev => ({ ...prev, [setting]: value }));
    } catch (error) {
      console.error('Error updating system setting:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'crash': return AlertTriangle;
      case 'blind_spot': return Eye;
      case 'manual_sos': return Shield;
      default: return AlertTriangle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'crash': return 'text-red-400 bg-red-500/20';
      case 'blind_spot': return 'text-yellow-400 bg-yellow-500/20';
      case 'manual_sos': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-red-400 bg-red-500/20';
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Safety Dashboard</h1>
          <p className="text-slate-400">Real-time monitoring and safety status</p>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BikeIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.bikes_count}</p>
                  <p className="text-sm text-slate-400">Registered Bikes</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total_rides}</p>
                  <p className="text-sm text-slate-400">Total Rides</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total_distance.toFixed(1)}</p>
                  <p className="text-sm text-slate-400">km Traveled</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active_alerts}</p>
                  <p className="text-sm text-slate-400">Active Alerts</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Data Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Speedometer */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Current Speed</h2>
              {liveData?.current_bike_id && (
                <div className="text-sm text-slate-400">
                  {bikes.find(b => b.id === liveData.current_bike_id)?.bike_name || 'Active Bike'}
                </div>
              )}
            </div>
            {liveData && <Speedometer speed={liveData.speed} />}
            
            {/* GPS Accuracy */}
            {liveData?.gps_accuracy && (
              <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">GPS Accuracy</span>
                  <span className="text-green-400 text-sm font-medium">±{liveData.gps_accuracy.toFixed(1)}m</span>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Location</h2>
            {liveData && (
              <Map 
                latitude={liveData.latitude} 
                longitude={liveData.longitude}
                className="h-64"
              />
            )}
            {liveData?.last_gps_update && (
              <div className="mt-3 text-xs text-slate-400">
                Last updated: {formatDate(liveData.last_gps_update)}
              </div>
            )}
          </div>

          {/* Sensor Data Display */}
          <div className="lg:col-span-1">
            {liveData && <SensorDataDisplay data={liveData} />}
          </div>
        </div>

        {/* Additional Sensor Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gyroscope Visualization */}
          <GyroscopeVisualization />
          
          {/* Real-time Theft Location Detection */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Theft Detection</h3>
                <p className="text-sm text-slate-400">GPS/GSM enhanced security</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300 text-sm">GPS Tracking</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Active</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300 text-sm">GSM Signal</span>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className="w-1 h-3 bg-green-400 rounded"
                      />
                    ))}
                  </div>
                  <span className="text-green-400 text-sm">Strong</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300 text-sm">Location Updates</span>
                <span className="text-blue-400 text-sm">Every 30s</span>
              </div>
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">Enhanced Protection</span>
                </div>
                <p className="text-slate-300 text-xs">
                  Real-time GPS coordinates are automatically captured and transmitted via GSM network when unauthorized movement is detected.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {liveData && (
            <>
              <EnhancedStatusCard
                title="Crash Detection"
                status={systemSettings.crash_detection_enabled ? 'Active' : 'Inactive'}
                active={systemSettings.crash_detection_enabled}
                icon={Shield}
                description="AI-powered impact detection"
                systemType="crash"
                onToggle={(enabled) => updateSystemSetting('crash_detection_enabled', enabled)}
                lastUpdate={new Date().toISOString()}
                sensitivity={systemSettings.crash_sensitivity}
                onSensitivityChange={(value) => updateSystemSetting('crash_sensitivity', value)}
              />
              <EnhancedStatusCard
                title="Blind-Spot Monitor"
                status={systemSettings.blind_spot_enabled ? 'Active' : 'Inactive'}
                active={systemSettings.blind_spot_enabled}
                icon={Eye}
                description="360° vehicle detection"
                systemType="blind_spot"
                onToggle={(enabled) => updateSystemSetting('blind_spot_enabled', enabled)}
                lastUpdate={new Date().toISOString()}
                sensitivity={systemSettings.blind_spot_sensitivity}
                onSensitivityChange={(value) => updateSystemSetting('blind_spot_sensitivity', value)}
              />
              <EnhancedStatusCard
                title="Theft Protection"
                status={systemSettings.theft_protection_enabled ? 'Active' : 'Inactive'}
                active={systemSettings.theft_protection_enabled}
                icon={Shield}
                description="GPS tracking & motion alerts"
                systemType="theft"
                onToggle={(enabled) => updateSystemSetting('theft_protection_enabled', enabled)}
                lastUpdate={new Date().toISOString()}
                sensitivity={systemSettings.theft_sensitivity}
                onSensitivityChange={(value) => updateSystemSetting('theft_sensitivity', value)}
              />
              <EnhancedStatusCard
                title="Device Connection"
                status={liveData.device_status === 'online' ? 'Online' : 'Offline'}
                active={liveData.device_status === 'online'}
                icon={Wifi}
                description="ESP32 real-time connectivity"
                systemType="device"
                lastUpdate={new Date().toISOString()}
              />
            </>
          )}
        </div>

        {/* Alert Log Panel */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Alerts</h2>
            <div className="text-sm text-slate-400">
              {alerts.length} total alerts
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Alerts</h3>
              <p className="text-slate-400">Your rides have been safe and incident-free!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Date & Time</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Location</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => {
                    const AlertIcon = getAlertIcon(alert.alert_type);
                    return (
                      <tr key={alert.id} className="border-b border-slate-700/50 hover:bg-slate-700/25">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getAlertColor(alert.alert_type)}`}>
                              <AlertIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-white font-medium capitalize">
                                {alert.alert_type.replace('_', ' ')}
                              </div>
                              <div className="text-slate-400 text-sm">
                                Device: {alert.device_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{formatDate(alert.created_at)}</div>
                        </td>
                        <td className="py-4 px-4">
                          {alert.latitude && alert.longitude ? (
                            <div className="text-slate-300">
                              {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                            </div>
                          ) : (
                            <div className="text-slate-500">Location unavailable</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            alert.resolved 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {alert.resolved ? 'Resolved' : 'Active'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {!alert.resolved && (
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
