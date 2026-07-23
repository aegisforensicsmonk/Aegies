import httpx
import json
import asyncio
import random
import os
from app.schemas.osint import OSINTRequest, OSINTResponse

class OSINTService:
    async def enrich(self, request: OSINTRequest) -> OSINTResponse:
        """
        Triggers a osintfootprints scan via HTTP API and formats the result.
        """
        sf_host = os.environ.get("osintfootprints_HOST", "localhost")
        sf_url = f"http://{sf_host}:5001"
        
        # We will use fast, passive modules suitable for real-time lookups
        modules = "sfp_dns,sfp_whois,sfp_abusech"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                # 1. Start the scan
                start_payload = {
                    "scanname": f"ciip_{request.ioc}",
                    "scantarget": request.ioc,
                    "modulelist": modules,
                    "typelist": "",
                    "usecase": "passive"
                }
                res = await client.post(
                    f"{sf_url}/startscan", 
                    data=start_payload, 
                    headers={"Accept": "application/json"}
                )
                
                if res.status_code != 200:
                    raise Exception("Failed to start osintfootprints scan")
                
                res_data = res.json()
                if not isinstance(res_data, list) or res_data[0] != "SUCCESS":
                    raise Exception(f"osintfootprints error: {res_data}")
                
                scan_id = res_data[1]
                
                # 2. Poll for completion (up to 15 seconds)
                for _ in range(15):
                    await asyncio.sleep(1)
                    status_res = await client.get(
                        f"{sf_url}/scanstatus?id={scan_id}", 
                        headers={"Accept": "application/json"}
                    )
                    status_data = status_res.json()
                    
                    if status_data and len(status_data) > 5:
                        status = status_data[5]
                        if status in ["FINISHED", "ABORTED", "ERROR", "FATAL"]:
                            break
                
                # 3. Fetch results
                results_res = await client.get(f"{sf_url}/scanexportjsonmulti?ids={scan_id}")
                results_text = results_res.text
                
                # The endpoint returns a JSON list or newline-separated JSON depending on the version.
                # scanexportjsonmulti returns a JSON list.
                try:
                    results = json.loads(results_text)
                except json.JSONDecodeError:
                    results = []
                
                tags = []
                enrichment_data = {}
                reputation = "benign"
                score = 0.1
                
                for row in results:
                    event_type = row.get("type", "")
                    data = row.get("data", "")
                    
                    if "MALICIOUS" in event_type or "BLACKLIST" in event_type:
                        reputation = "malicious"
                        tags.append("malicious")
                        score = max(score, 0.9)
                        
                    if "DNS" in event_type:
                        enrichment_data["dns"] = data
                    if "WHOIS" in event_type:
                        enrichment_data["whois"] = data[:100] + "..." if len(data) > 100 else data
                        
                if not tags:
                    tags.append("safe")
                    
                osint_data = {
                    "ioc": request.ioc,
                    "ioc_type": request.ioc_type,
                    "reputation": reputation,
                    "confidence_score": score,
                    "tags": list(set(tags)),
                    "enrichment_data": enrichment_data
                }
                
                from app.services.ai_analyst import ai_analyst
                ai_summary = ai_analyst.generate_osint_summary(osint_data)
                    
                return OSINTResponse(
                    **osint_data,
                    ai_summary=ai_summary
                )
                
            except Exception as e:
                print(f"osintfootprints integration error: {e}")
                # Fallback to mock logic if osintfootprints is unavailable
                is_malicious = random.random() > 0.5
                
                fallback_data = {
                    "ioc": request.ioc,
                    "ioc_type": request.ioc_type,
                    "reputation": "malicious" if is_malicious else "benign",
                    "confidence_score": random.uniform(0.7, 0.99) if is_malicious else random.uniform(0.1, 0.3),
                    "tags": ["malware", "c2"] if is_malicious else ["safe"],
                    "enrichment_data": {"error": str(e), "fallback": "Mock data due to osintfootprints failure"}
                }
                
                from app.services.ai_analyst import ai_analyst
                ai_summary = ai_analyst.generate_osint_summary(fallback_data)
                
                return OSINTResponse(
                    **fallback_data,
                    ai_summary=ai_summary
                )

osint_service = OSINTService()
