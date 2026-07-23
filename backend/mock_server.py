from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/ipdr/ingest/csv")
async def ingest_ipdr_csv(file: UploadFile = File(...)):
    import csv
    import io
    import uuid
    content = await file.read()
    try:
        decoded_content = content.decode('utf-8-sig')
    except UnicodeDecodeError:
        try:
            decoded_content = content.decode('latin-1')
        except UnicodeDecodeError:
            decoded_content = content.decode('utf-8', errors='replace')
            
    csv_reader = csv.DictReader(io.StringIO(decoded_content, newline=''))
    
    records = []
    
    # Strip BOM and normalize headers in case the user has real data
    def normalize_key(k):
        return k.strip().lower() if k else ''
        
    for row in csv_reader:
        row_norm = {normalize_key(k): v.strip() if isinstance(v, str) else v for k, v in row.items()}
        
        def get_val(*keys, default=None):
            for k in keys:
                for row_key in row_norm.keys():
                    if k in row_key:
                        return row_norm[row_key]
            return default
            
        record = {
            "id": f"ipdr-{uuid.uuid4().hex[:8]}",
            "case_id": "case-001",
            "source_number": get_val("source", "calling", "from", "caller", default="+1-000-000"),
            "destination_number": get_val("dest", "called", "to", "receiver", default="+1-000-000"),
            "call_type": get_val("type", "call_type", default="voice").lower(),
            "start_time": get_val("start", "time", "date", "timestamp", default="2026-07-19T10:00:00Z"),
            "end_time": get_val("end", default="2026-07-19T10:05:00Z"),
            "cell_id": get_val("cell", "tower", "location_id", default="CELL-MOCK-001"),
            "cell_location": get_val("location", "address", default="Unknown"),
            "imei": get_val("imei", default="123456789012345"),
            "imsi": get_val("imsi", default="123456789012345"),
            "latitude": float(get_val("lat", default=0.0)),
            "longitude": float(get_val("lon", "lng", default=0.0))
        }
        
        # Ensure start_time is iso format for frontend date parsing
        if " " in record["start_time"] and "T" not in record["start_time"]:
            record["start_time"] = record["start_time"].replace(" ", "T")
        if not record["start_time"].endswith("Z"):
            record["start_time"] += "Z"
            
        try:
            record["duration_seconds"] = int(float(get_val("duration", "secs", "length", default=300)))
        except (ValueError, TypeError):
            record["duration_seconds"] = 300
            
        records.append(record)
        
    return {"status": "success", "message": f"Ingested {len(records)} records from CSV", "records": records}

@app.post("/api/reports/generate")
async def generate_report(request: dict):
    import uuid
    import datetime
    
    report_type = request.get("report_type", "investigation")
    case_id = request.get("case_id", "unknown")
    
    return {
        "id": f"report-{uuid.uuid4().hex[:8]}",
        "case_id": case_id,
        "report_type": report_type,
        "generated_by": "system",
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "status": "READY",
        "content": f"AI-generated mock report content for case {case_id}. Type: {report_type}."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
