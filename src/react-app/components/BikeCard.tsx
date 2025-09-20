import { useState } from 'react';
import { Bike } from '@/shared/types';
import { Camera, Shield, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';

interface BikeCardProps {
  bike: Bike;
  onEdit: (bike: Bike) => void;
  onDelete: (bikeId: number) => void;
  onReportTheft: (bike: Bike) => void;
}

export default function BikeCard({ bike, onEdit, onDelete, onReportTheft }: BikeCardProps) {
  const [imageError, setImageError] = useState(false);

  const getBikeStatus = () => {
    if (bike.is_stolen) {
      return { text: 'Stolen', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
    return { text: 'Secure', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  const status = getBikeStatus();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800/70 transition-all duration-300 group">
      {/* Bike Photo */}
      <div className="relative aspect-video">
        {bike.bike_photo_url && !imageError ? (
          <img
            src={bike.bike_photo_url}
            alt={bike.bike_name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            <Camera className="w-12 h-12 text-slate-500" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${status.color}`}>
          {status.text}
        </div>

        {/* Primary Badge */}
        {bike.is_primary && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium backdrop-blur-sm">
            Primary
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <button
            onClick={() => onEdit(bike)}
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(bike.id)}
            className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bike Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">{bike.bike_name}</h3>
          <p className="text-slate-300 font-medium">{bike.brand} {bike.model}</p>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 mb-4">
          {bike.year && (
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Year: {bike.year}</span>
            </div>
          )}
          
          {bike.color && (
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: bike.color.toLowerCase() }} />
              <span>Color: {bike.color}</span>
            </div>
          )}
          
          {bike.estimated_value && (
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <DollarSign className="w-4 h-4" />
              <span>Value: ${bike.estimated_value.toLocaleString()}</span>
            </div>
          )}

          {bike.serial_number && (
            <div className="text-slate-400 text-sm">
              <span className="font-medium">Serial:</span> {bike.serial_number}
            </div>
          )}

          {bike.license_plate && (
            <div className="text-slate-400 text-sm">
              <span className="font-medium">License:</span> {bike.license_plate}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-400">Protected</span>
          </div>

          {!bike.is_stolen && (
            <button
              onClick={() => onReportTheft(bike)}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            >
              Report Theft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
