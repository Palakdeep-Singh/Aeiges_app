import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  status: string;
  active: boolean;
  icon: LucideIcon;
  description?: string;
}

export default function StatusCard({ title, status, active, icon: Icon, description }: StatusCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{title}</h3>
            {description && <p className="text-slate-400 text-xs">{description}</p>}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          active 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {status}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-slate-300 text-sm">
          {active ? 'System Active' : 'System Inactive'}
        </span>
      </div>
    </div>
  );
}
