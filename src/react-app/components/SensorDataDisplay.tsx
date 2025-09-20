import { useState, useEffect } from 'react';
import { Activity, Zap, MapPin, Signal } from 'lucide-react';

interface SensorData {
  speed: number;
  latitude: number;
  longitude: number;
  gyroscope_x?: number;
  gyroscope_y?: number;
  gyroscope_z?: number;
  accelerometer_x?: number;
  accelerometer_y?: number;
  accelerometer_z?: number;
  gps_accuracy?: number;
  last_gps_update?: string;
}

interface SensorDataDisplayProps {
  data: SensorData;
  className?: string;
}

export default function SensorDataDisplay({ data, className = '' }: SensorDataDisplayProps) {
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  useEffect(() => {
    if (data.last_gps_update) {
      const updateTime = new Date(data.last_gps_update);
      const now = new Date();
      const diffMs = now.getTime() - updateTime.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      
      if (diffSeconds < 60) {
        setLastUpdateTime(`${diffSeconds}s ago`);
      } else if (diffSeconds < 3600) {
        setLastUpdateTime(`${Math.floor(diffSeconds / 60)}m ago`);
      } else {
        setLastUpdateTime(`${Math.floor(diffSeconds / 3600)}h ago`);
      }
    }
  }, [data.last_gps_update]);

  const getGpsQuality = (accuracy?: number) => {
    if (!accuracy) return { label: 'Unknown', color: 'text-slate-400', bars: 0 };
    if (accuracy <= 3) return { label: 'Excellent', color: 'text-green-400', bars: 4 };
    if (accuracy <= 5) return { label: 'Good', color: 'text-blue-400', bars: 3 };
    if (accuracy <= 10) return { label: 'Fair', color: 'text-yellow-400', bars: 2 };
    return { label: 'Poor', color: 'text-red-400', bars: 1 };
  };

  const gpsQuality = getGpsQuality(data.gps_accuracy);

  const getAccelerationMagnitude = () => {
    if (!data.accelerometer_x || !data.accelerometer_y || !data.accelerometer_z) return 0;
    return Math.sqrt(
      Math.pow(data.accelerometer_x, 2) + 
      Math.pow(data.accelerometer_y, 2) + 
      Math.pow(data.accelerometer_z, 2)
    );
  };

  const getMotionIntensity = () => {
    const magnitude = getAccelerationMagnitude();
    if (magnitude < 8) return { label: 'Stationary', color: 'text-slate-400' };
    if (magnitude < 12) return { label: 'Light Motion', color: 'text-green-400' };
    if (magnitude < 16) return { label: 'Active Motion', color: 'text-blue-400' };
    if (magnitude < 20) return { label: 'High Activity', color: 'text-yellow-400' };
    return { label: 'Extreme Motion', color: 'text-red-400' };
  };

  const motionIntensity = getMotionIntensity();

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Sensor Data</h3>
            <p className="text-sm text-slate-400">Real-time device readings</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GPS & Location */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h4 className="text-white font-medium">GPS & Location</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Coordinates</span>
              <span className="text-sm font-mono text-white">
                {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Accuracy</span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${gpsQuality.color}`}>
                  ±{data.gps_accuracy?.toFixed(1) || 'N/A'}m
                </span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 h-3 rounded ${
                        bar <= gpsQuality.bars ? 'bg-green-400' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Last Update</span>
              <span className="text-sm text-slate-400">{lastUpdateTime || 'Just now'}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Speed</span>
              <span className="text-sm font-medium text-blue-400">{data.speed.toFixed(1)} km/h</span>
            </div>
          </div>
        </div>

        {/* Motion & Sensors */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h4 className="text-white font-medium">Motion Sensors</h4>
          </div>

          <div className="space-y-3">
            {/* Motion Intensity */}
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Motion Intensity</span>
              <span className={`text-sm font-medium ${motionIntensity.color}`}>
                {motionIntensity.label}
              </span>
            </div>

            {/* Accelerometer */}
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Accelerometer (m/s²)</span>
                <span className="text-xs text-slate-500">XYZ</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-slate-400">X</div>
                  <div className="text-white font-mono">{data.accelerometer_x?.toFixed(2) || 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">Y</div>
                  <div className="text-white font-mono">{data.accelerometer_y?.toFixed(2) || 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">Z</div>
                  <div className="text-white font-mono">{data.accelerometer_z?.toFixed(2) || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Gyroscope */}
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Gyroscope (°/s)</span>
                <span className="text-xs text-slate-500">Pitch/Roll/Yaw</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-slate-400">P</div>
                  <div className="text-white font-mono">{data.gyroscope_x?.toFixed(1) || 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">R</div>
                  <div className="text-white font-mono">{data.gyroscope_y?.toFixed(1) || 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">Y</div>
                  <div className="text-white font-mono">{data.gyroscope_z?.toFixed(1) || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Total Acceleration */}
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Total Acceleration</span>
              <span className="text-sm font-mono text-purple-400">
                {getAccelerationMagnitude().toFixed(2)} m/s²
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Quality Indicator */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Signal className="w-4 h-4 text-green-400" />
            <span className="text-sm text-slate-300">Signal Quality</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${gpsQuality.color}`}>{gpsQuality.label}</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
