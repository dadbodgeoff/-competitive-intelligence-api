"""
Performance Tracking Middleware
Automatically tracks all invoice-related API calls with timing
"""
import time
import json
from datetime import datetime
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path
import threading

class PerformanceTrackingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, enabled: bool = True):
        super().__init__(app)
        self.enabled = enabled
        self.current_session = None
        self.session_lock = threading.Lock()
        self.output_file = "invoice_upload_performance_report.json"
        
    async def dispatch(self, request: Request, call_next):
        # Only track if enabled and it's an invoice-related endpoint
        if not self.enabled or not self._should_track(request):
            return await call_next(request)
        
        # Track the request
        start_time = time.time()
        endpoint = f"{request.method} {request.url.path}"
        
        # Determine phase
        phase = self._determine_phase(request.url.path, request.method)
        
        # Record start
        self._record_event({
            "phase": phase,
            "endpoint": endpoint,
            "method": request.method,
            "path": request.url.path,
            "start_time": datetime.now().isoformat(),
            "timestamp": start_time
        })
        
        # Execute request
        response = await call_next(request)
        
        # Record end
        duration = time.time() - start_time
        self._record_event({
            "phase": phase,
            "endpoint": endpoint,
            "duration_seconds": round(duration, 3),
            "status_code": response.status_code,
            "end_time": datetime.now().isoformat()
        })
        
        return response
    
    def _should_track(self, request: Request) -> bool:
        """Check if this endpoint should be tracked"""
        path = request.url.path
        tracked_paths = [
            "/api/invoices/upload",
            "/api/invoices/parse-stream",
            "/api/invoices/save",
            "/api/invoices/",
        ]
        return any(path.startswith(p) for p in tracked_paths)
    
    def _determine_phase(self, path: str, method: str) -> str:
        """Determine which phase this endpoint belongs to"""
        if "upload" in path:
            return "1_FILE_UPLOAD"
        elif "parse-stream" in path or "parse" in path:
            return "2_PARSING"
        elif "save" in path and method == "POST":
            return "4_DATABASE_SAVE"
        elif method == "GET" and path.endswith("/"):
            return "5_VERIFICATION"
        else:
            return "3_POST_PROCESSING"
    
    def _record_event(self, event: dict):
        """Record event to file"""
        with self.session_lock:
            try:
                # Read existing data
                if Path(self.output_file).exists():
                    with open(self.output_file, 'r') as f:
                        data = json.load(f)
                else:
                    data = {
                        "test_start": datetime.now().isoformat(),
                        "events": []
                    }
                
                # Add new event
                data["events"].append(event)
                
                # Write back
                with open(self.output_file, 'w') as f:
                    json.dump(data, f, indent=2)
                    
            except Exception as e:
                print(f"Error recording performance event: {e}")
