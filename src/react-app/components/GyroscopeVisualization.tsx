import { useState, useEffect } from 'react';
import { RotateCcw, Gauge } from 'lucide-react';

interface GyroscopeData {
  pitch: number;  // Forward/backward tilt
  roll: number;   // Left/right tilt
  yaw: number;    // Rotation around vertical axis
}

interface GyroscopeVisualizationProps {
  className?: string;
}

export default function GyroscopeVisualization({ className = '' }: GyroscopeVisualizationProps) {
  const [gyroData, setGyroData] = useState<GyroscopeData>({
    pitch: 0,
    roll: 0,
    yaw: 0
  });
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Simulate real-time gyroscope data - in production this would come from ESP32
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate natural bike movement with some randomness
      setGyroData(prev => ({
        pitch: Math.max(-45, Math.min(45, prev.pitch + (Math.random() - 0.5) * 8)),
        roll: Math.max(-45, Math.min(45, prev.roll + (Math.random() - 0.5) * 6)),
        yaw: (prev.yaw + (Math.random() - 0.5) * 10) % 360
      }));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const calibrateGyroscope = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setGyroData({ pitch: 0, roll: 0, yaw: 0 });
      setIsCalibrating(false);
    }, 2000);
  };

  const getStabilityStatus = () => {
    const totalTilt = Math.abs(gyroData.pitch) + Math.abs(gyroData.roll);
    if (totalTilt < 5) return { status: 'Stable', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (totalTilt < 15) return { status: 'Moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (totalTilt < 30) return { status: 'Unstable', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { status: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const stability = getStabilityStatus();

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <RotateCcw className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Gyroscope Monitor</h3>
            <p className="text-sm text-slate-400">Real-time orientation tracking</p>
          </div>
        </div>
        
        <button
          onClick={calibrateGyroscope}
          disabled={isCalibrating}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors text-sm"
        >
          <Gauge className="w-4 h-4" />
          <span>{isCalibrating ? 'Calibrating...' : 'Calibrate'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Visualization */}
        <div className="relative">
          <div className="relative w-full h-48 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Horizon Line */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-slate-800/50 to-green-900/30 transition-transform duration-200"
              style={{
                transform: `rotateZ(${gyroData.roll}deg) translateY(${gyroData.pitch * 2}px)`
              }}
            />
            
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-8 h-0.5 bg-white shadow-lg"></div>
                <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>

            {/* Pitch indicators */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 space-y-4">
              {[-20, -10, 0, 10, 20].map(angle => (
                <div key={angle} className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-white/50"></div>
                  <span className="text-xs text-white/70">{angle}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compass */}
          <div className="mt-4 relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-2 border-slate-600 rounded-full bg-slate-800/50">
              <div 
                className="absolute top-1 left-1/2 w-0.5 h-6 bg-red-500 origin-bottom transform -translate-x-1/2 transition-transform duration-200"
                style={{ transform: `translateX(-50%) rotate(${gyroData.yaw}deg)` }}
              />
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold">N</div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-slate-400">S</div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">W</div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">E</div>
            </div>
          </div>
        </div>

        {/* Data Display */}
        <div className="space-y-4">
          {/* Stability Status */}
          <div className={`p-4 rounded-lg border ${stability.bgColor} border-current/30`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Stability</span>
              <span className={`text-sm font-bold ${stability.color}`}>{stability.status}</span>
            </div>
          </div>

          {/* Gyroscope Values */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Pitch (Forward/Back)</span>
              <span className="text-sm font-mono text-white">{gyroData.pitch.toFixed(1)}°</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Roll (Left/Right)</span>
              <span className="text-sm font-mono text-white">{gyroData.roll.toFixed(1)}°</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Yaw (Rotation)</span>
              <span className="text-sm font-mono text-white">{gyroData.yaw.toFixed(1)}°</span>
            </div>
          </div>

          {/* Visual Bars */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Pitch</span>
                <span>{gyroData.pitch.toFixed(1)}°</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(100, (Math.abs(gyroData.pitch) / 45) * 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Roll</span>
                <span>{gyroData.roll.toFixed(1)}°</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="h-2 bg-green-500 rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(100, (Math.abs(gyroData.roll) / 45) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {Math.abs(gyroData.pitch) > 35 || Math.abs(gyroData.roll) > 35 ? (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-sm font-medium">Extreme tilt detected - Check bike stability</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
