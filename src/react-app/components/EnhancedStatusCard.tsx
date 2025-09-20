import { useState, useEffect } from 'react';
import { LucideIcon, Settings, WifiOff } from 'lucide-react';

interface EnhancedStatusCardProps {
  title: string;
  status: string;
  active: boolean;
  icon: LucideIcon;
  description?: string;
  systemType: 'crash' | 'blind_spot' | 'theft' | 'device';
  onToggle?: (enabled: boolean) => void;
  lastUpdate?: string;
  sensitivity?: number;
  onSensitivityChange?: (value: number) => void;
}

export default function EnhancedStatusCard({ 
  title, 
  status, 
  active, 
  icon: Icon, 
  description,
  systemType,
  onToggle,
  lastUpdate,
  sensitivity = 50,
  onSensitivityChange
}: EnhancedStatusCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [signalStrength, setSignalStrength] = useState(0);
  const [isConnected, setIsConnected] = useState(active);

  // Simulate signal strength for device connection
  useEffect(() => {
    if (systemType === 'device') {
      const interval = setInterval(() => {
        setSignalStrength(Math.floor(Math.random() * 5) + 1);
        setIsConnected(Math.random() > 0.1); // 90% uptime simulation
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [systemType]);

  const getSystemDetails = () => {
    switch (systemType) {
      case 'crash':
        return {
          metrics: [
            { label: 'Impact Threshold', value: `${sensitivity}G`, unit: 'force' },
            { label: 'Response Time', value: '0.2s', unit: 'time' },
            { label: 'False Positives', value: '0.1%', unit: 'rate' }
          ],
          alertLevel: sensitivity > 70 ? 'high' : sensitivity > 30 ? 'medium' : 'low'
        };
      case 'blind_spot':
        return {
          metrics: [
            { label: 'Detection Range', value: `${Math.round(sensitivity * 0.3)}m`, unit: 'distance' },
            { label: 'Scan Rate', value: '10Hz', unit: 'frequency' },
            { label: 'Accuracy', value: '98.5%', unit: 'rate' }
          ],
          alertLevel: 'medium'
        };
      case 'theft':
        return {
          metrics: [
            { label: 'Motion Sensitivity', value: `${sensitivity}%`, unit: 'percentage' },
            { label: 'GPS Accuracy', value: '3m', unit: 'distance' },
            { label: 'Battery Life', value: '72h', unit: 'time' }
          ],
          alertLevel: active ? 'high' : 'low'
        };
      case 'device':
        return {
          metrics: [
            { label: 'Signal Strength', value: `${signalStrength}/5`, unit: 'bars' },
            { label: 'Uptime', value: '99.1%', unit: 'rate' },
            { label: 'Last Ping', value: '2s ago', unit: 'time' }
          ],
          alertLevel: isConnected ? 'high' : 'critical'
        };
      default:
        return { metrics: [], alertLevel: 'medium' as const };
    }
  };

  const details = getSystemDetails();

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {systemType === 'device' && !isConnected ? <WifiOff className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{title}</h3>
            {description && <p className="text-slate-400 text-xs">{description}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
            active 
              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            {systemType === 'device' ? (isConnected ? 'Online' : 'Offline') : status}
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-slate-400 hover:text-slate-300 rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400' : 'bg-red-400'} ${active ? 'animate-pulse' : ''}`} />
        <span className="text-slate-300 text-sm">
          {systemType === 'device' 
            ? (isConnected ? 'Device Connected' : 'Connection Lost') 
            : (active ? 'System Active' : 'System Inactive')
          }
        </span>
        {lastUpdate && (
          <span className="text-slate-500 text-xs">• Updated {formatLastUpdate(lastUpdate)}</span>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {details.metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className="text-white font-semibold text-sm">{metric.value}</div>
            <div className="text-slate-400 text-xs">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* System Level Indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm">System Level</span>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertLevelColor(details.alertLevel)}`}>
          {details.alertLevel.charAt(0).toUpperCase() + details.alertLevel.slice(1)}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-slate-700/50 pt-4 mt-4 space-y-4">
          {/* Toggle Control */}
          {onToggle && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Enable System</span>
              <button
                onClick={() => onToggle(!active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  active ? 'bg-green-600' : 'bg-slate-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  active ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          )}

          {/* Sensitivity Control */}
          {onSensitivityChange && systemType !== 'device' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Sensitivity</span>
                <span className="text-slate-400 text-sm">{sensitivity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sensitivity}
                onChange={(e) => onSensitivityChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          )}

          {/* Signal Strength for Device */}
          {systemType === 'device' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Signal Strength</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 h-3 rounded ${
                        bar <= signalStrength ? 'bg-green-400' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
              Test System
            </button>
            <button className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors">
              Calibrate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
