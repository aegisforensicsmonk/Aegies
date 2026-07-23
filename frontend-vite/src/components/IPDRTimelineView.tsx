import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MapPin, Navigation } from 'lucide-react';

interface Anomaly {
  entity: string;
  type: string;
  speed_kmh: number;
  distance_km: number;
  time_diff_hours: number;
  record_1_time: string;
  record_2_time: string;
}

export function IPDRTimelineView() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/ipdr/analytics/anomalies');
        if (!res.ok) throw new Error('Failed to fetch anomalies');
        const json = await res.json();
        setAnomalies(json.anomalies || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnomalies();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Timeline & Anomalies</h2>
        <p className="text-muted-foreground mt-1">Automated detection of irregular behavioral patterns from IPDR records.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Summary Card */}
        <div className="border rounded-xl p-6 bg-card shadow-sm col-span-full md:col-span-1">
          <h3 className="font-semibold mb-4 text-lg">Alert Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg border border-red-500/20">
              <span className="font-medium flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Impossible Travel
              </span>
              <span className="text-lg font-bold">{anomalies.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg border border-orange-500/20 opacity-50">
              <span className="font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> SIM Swaps (Soon)
              </span>
              <span className="text-lg font-bold">0</span>
            </div>
          </div>
        </div>

        {/* Anomalies List */}
        <div className="border rounded-xl bg-card shadow-sm col-span-full md:col-span-2 overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Detected Impossible Travel
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && <p className="text-center text-muted-foreground py-10">Running detection algorithms...</p>}
            {error && <p className="text-center text-destructive py-10">{error}</p>}
            
            {!loading && anomalies.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 opacity-60">
                <MapPin className="w-12 h-12" />
                <p>No geographic anomalies detected in current dataset.</p>
              </div>
            )}

            {anomalies.map((anomaly, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-accent/50 hover:bg-accent transition-colors relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-sm font-semibold bg-background px-2 py-1 rounded shadow-sm border">
                    Entity: {anomaly.entity}
                  </div>
                  <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
                    High Confidence
                  </span>
                </div>
                
                <p className="text-sm text-foreground/80 mt-3">
                  This entity traveled <span className="font-bold text-foreground">{anomaly.distance_km} km</span> in just{' '}
                  <span className="font-bold text-foreground">{anomaly.time_diff_hours} hours</span>, requiring an average speed of{' '}
                  <span className="font-bold text-red-500">{anomaly.speed_kmh} km/h</span>.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Record 1: {new Date(anomaly.record_1_time).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Record 2: {new Date(anomaly.record_2_time).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
