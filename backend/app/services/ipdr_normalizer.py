import re
from datetime import datetime
from typing import Dict, Any, Optional
from app.schemas.ipdr import IPDRCreate

class IPDRNormalizer:
    """
    Normalizes diverse IPDR formats from different ISPs into the Canonical IPDR Model.
    """
    
    FIELD_MAPPINGS = {
        "source_identifier": ["src_ip", "source_ip", "source_address", "client_ip", "source ip", "source_number", "calling_party", "source"],
        "destination_identifier": ["dest_ip", "destination_ip", "destination_address", "server_ip", "destination ip", "destination_number", "called_party", "destination"],
        "timestamp": ["start_time", "session_start", "timestamp", "start time", "date_time", "datetime", "date"],
        "protocol_type": ["proto", "protocol", "call_type", "type"],
        "duration_seconds": ["duration", "duration_seconds", "secs", "length"],
        "cell_id": ["cell_id", "tower_id", "cgi", "cell", "location_id"],
        "location_lat": ["lat", "latitude"],
        "location_lon": ["lon", "lng", "longitude"],
        "bytes_up": ["bytes_up", "tx_bytes", "uploaded", "uplink_bytes"],
        "bytes_down": ["bytes_down", "rx_bytes", "downloaded", "downlink_bytes"],
        "imei": ["imei", "device_imei"],
        "imsi": ["imsi"]
    }

    @staticmethod
    def _find_field(row: Dict[str, Any], canonical_field: str) -> Any:
        possible_keys = IPDRNormalizer.FIELD_MAPPINGS.get(canonical_field, [])
        for k in row.keys():
            if k.lower().strip() in possible_keys:
                return row[k]
        return None

    @staticmethod
    def _parse_datetime(dt_str: Optional[str]) -> Optional[datetime]:
        if not dt_str:
            return None
        formats = [
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%d/%m/%Y %H:%M:%S",
            "%m/%d/%Y %H:%M:%S",
            "%d-%m-%Y %H:%M:%S",
            "%Y-%m-%dT%H:%M:%SZ",
        ]
        dt_str = dt_str.strip()
        for fmt in formats:
            try:
                return datetime.strptime(dt_str, fmt)
            except ValueError:
                continue
        try:
            return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        except ValueError:
            return None

    @classmethod
    def normalize_record(cls, raw_record: Dict[str, Any]) -> IPDRCreate:
        data = {}
        
        # Datetime is required
        timestamp_str = cls._find_field(raw_record, "timestamp")
        data["timestamp"] = cls._parse_datetime(timestamp_str) or datetime.utcnow()

        src = cls._find_field(raw_record, "source_identifier")
        data["source_identifier"] = str(src).strip() if src else "Unknown"
        
        dst = cls._find_field(raw_record, "destination_identifier")
        data["destination_identifier"] = str(dst).strip() if dst else None
        
        data["protocol_type"] = cls._find_field(raw_record, "protocol_type")
        
        dur = cls._find_field(raw_record, "duration_seconds")
        try:
            data["duration_seconds"] = int(float(dur)) if dur else 0
        except (ValueError, TypeError):
            data["duration_seconds"] = 0
            
        data["cell_id"] = cls._find_field(raw_record, "cell_id")
        
        lat = cls._find_field(raw_record, "location_lat")
        data["location_lat"] = float(lat) if lat else None
        
        lon = cls._find_field(raw_record, "location_lon")
        data["location_lon"] = float(lon) if lon else None

        b_up = cls._find_field(raw_record, "bytes_up")
        data["bytes_up"] = int(float(b_up)) if b_up else 0
        
        b_down = cls._find_field(raw_record, "bytes_down")
        data["bytes_down"] = int(float(b_down)) if b_down else 0
        
        data["imei"] = cls._find_field(raw_record, "imei")
        data["imsi"] = cls._find_field(raw_record, "imsi")

        return IPDRCreate(**data)
