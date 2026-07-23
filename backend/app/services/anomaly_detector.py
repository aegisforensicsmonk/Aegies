import math
from datetime import datetime
from typing import List, Dict, Any

class AnomalyDetector:
    @staticmethod
    def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate the great circle distance in kilometers between two points on the earth."""
        R = 6371.0 # Earth radius in km
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    @staticmethod
    def detect_impossible_travel(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect if an entity (IMSI/IMEI) traveled faster than 800 km/h between two records.
        Assumes records are sorted by timestamp for a given entity, or will sort them.
        """
        anomalies = []
        # Group by IMSI or IMEI
        grouped = {}
        for r in records:
            key = r.get('imsi') or r.get('imei') or r.get('source_identifier')
            if not key or r.get('location_lat') is None or r.get('location_lon') is None:
                continue
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(r)
            
        for key, entity_records in grouped.items():
            # Sort by timestamp
            entity_records.sort(key=lambda x: x['timestamp'])
            for i in range(1, len(entity_records)):
                prev = entity_records[i-1]
                curr = entity_records[i]
                
                time_diff_hours = (curr['timestamp'] - prev['timestamp']).total_seconds() / 3600.0
                if time_diff_hours <= 0:
                    continue
                    
                distance_km = AnomalyDetector.haversine(
                    prev['location_lat'], prev['location_lon'],
                    curr['location_lat'], curr['location_lon']
                )
                
                speed_kmh = distance_km / time_diff_hours
                if speed_kmh > 800: # Threshold for impossible travel (commercial flight speed)
                    anomalies.append({
                        "entity": key,
                        "type": "IMPOSSIBLE_TRAVEL",
                        "speed_kmh": round(speed_kmh, 2),
                        "distance_km": round(distance_km, 2),
                        "time_diff_hours": round(time_diff_hours, 2),
                        "record_1_time": prev['timestamp'],
                        "record_2_time": curr['timestamp']
                    })
        return anomalies
