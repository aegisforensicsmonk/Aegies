import csv, re

with open('test_100_ipdr.csv', 'r') as f:
    records = list(csv.DictReader(f))

ts_records = []
for i, r in enumerate(records):
    ts_obj = f"  {{ id: 'ipdr-{i:03d}', case_id: 'case-001', source_number: '{r['source_number']}', destination_number: '{r['destination_number']}', call_type: '{r['call_type']}', start_time: '{r['start_time']}', end_time: '{r['start_time']}', duration_seconds: {r['duration_seconds']}, cell_id: '{r['cell_id']}', cell_location: 'Unknown', imei: '{r['imei']}', imsi: '{r['imsi']}', latitude: {r['lat']}, longitude: {r['lon']} }}"
    ts_records.append(ts_obj)

new_array_content = 'export const mockIPDR: IPDRRecord[] = [\n' + ',\n'.join(ts_records) + ',\n];'

with open('frontend/src/data/mock-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = re.sub(r'export const mockIPDR: IPDRRecord\[\] = \[.*?\];', new_array_content, content, flags=re.DOTALL)

with open('frontend/src/data/mock-data.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Updated mock-data.ts successfully!')
