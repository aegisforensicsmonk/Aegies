import json
from app.services.ipdr_normalizer import IPDRNormalizer

# Simulating a messy row from a generic ISP CSV export
messy_isp_data = {
    "provider": "JioNet",
    "client_ip": "192.168.1.105",
    "sport": "45211",
    "server_ip": "8.8.8.8",
    "dport": "53",
    "date_time": "2026-07-19T14:30:00",
    "proto": "UDP",
    "msisdn": "+91-9876543210",
    "tx_bytes": "1048",
    "rx_bytes": "2048",
    "cell": "CELL-MUM-4521"
}

print("--- RAW MESSY ISP DATA ---")
print(json.dumps(messy_isp_data, indent=2))
print("\n")

# Pass it through the Normalizer we just built
normalized_record = IPDRNormalizer.normalize_record(messy_isp_data)

print("--- NORMALIZED CANONICAL IPDR RECORD ---")
# The normalized record is a Pydantic model (IPDRCreate), we can dump it to JSON
print(normalized_record.model_dump_json(indent=2))
