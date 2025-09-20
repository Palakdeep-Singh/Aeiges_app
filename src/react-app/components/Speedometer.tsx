interface SpeedometerProps {
  speed: number;
  maxSpeed?: number;
}

export default function Speedometer({ speed, maxSpeed = 60 }: SpeedometerProps) {
  const percentage = Math.min((speed / maxSpeed) * 100, 100);
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Speedometer background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl border-4 border-slate-700">
        {/* Speed marks */}
        {Array.from({ length: 7 }, (_, i) => {
          const angle = (i * 30) - 90;
          return (
            <div
              key={i}
              className="absolute w-1 h-6 bg-slate-400 origin-bottom"
              style={{
                left: '50%',
                bottom: '50%',
                transform: `translateX(-50%) rotate(${angle}deg)`,
                transformOrigin: '50% 100%',
              }}
            />
          );
        })}
        
        {/* Speed numbers */}
        {Array.from({ length: 7 }, (_, i) => {
          const angle = (i * 30) - 90;
          const speedValue = Math.round((i * maxSpeed) / 6);
          const radian = (angle * Math.PI) / 180;
          const x = 50 + 35 * Math.cos(radian);
          const y = 50 + 35 * Math.sin(radian);
          
          return (
            <div
              key={i}
              className="absolute text-xs text-slate-300 font-semibold transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
            >
              {speedValue}
            </div>
          );
        })}

        {/* Needle */}
        <div
          className="absolute w-1 h-20 bg-gradient-to-t from-red-500 to-red-400 rounded-full origin-bottom shadow-lg"
          style={{
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: '50% 100%',
          }}
        />

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-slate-700 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-slate-600" />
      </div>

      {/* Speed display */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-3xl font-bold text-white">{speed}</div>
        <div className="text-sm text-slate-400">km/h</div>
      </div>

      {/* Speedometer label */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-sm text-slate-400 font-medium">
        SPEED
      </div>
    </div>
  );
}
