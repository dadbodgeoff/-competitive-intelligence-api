"""
Invoice Monitoring Service
Tracks performance metrics and logs for invoice processing
Works for both frontend uploads and test scripts
"""
import os
import json
import time
from datetime import datetime
from typing import Dict, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class InvoiceMonitoringService:
    """
    Centralized monitoring for invoice processing
    Tracks metrics at every phase for performance analysis
    """
    
    def __init__(self):
        self.monitoring_dir = Path("monitoring_logs/invoices")
        self.monitoring_dir.mkdir(parents=True, exist_ok=True)
        
        # Active sessions (in-memory tracking)
        self.sessions = {}
    
    def start_session(self, user_id: str, filename: str) -> str:
        """
        Start a new monitoring session
        
        Returns:
            session_id: Unique identifier for this upload
        """
        session_id = f"{user_id}_{int(time.time() * 1000)}"
        
        self.sessions[session_id] = {
            "session_id": session_id,
            "user_id": user_id,
            "filename": filename,
            "started_at": datetime.now().isoformat(),
            "phase_1_upload_parse": {},
            "phase_2_save": {},
            "phase_3_inventory": {},
            "errors": [],
            "warnings": []
        }
        
        logger.info(f"📊 Monitoring session started: {session_id}")
        return session_id
    
    def log_phase(
        self,
        session_id: str,
        phase: str,
        event: str,
        data: Dict = None,
        level: str = "info"
    ):
        """Log a phase event with timestamp"""
        if session_id not in self.sessions:
            logger.warning(f"Session not found")
            return
        
        session = self.sessions[session_id]
        timestamp = datetime.now().isoformat()
        
        log_entry = {
            "timestamp": timestamp,
            "event": event,
            "data": data or {}
        }
        
        # Add to appropriate phase
        if phase not in session:
            session[phase] = {}
        
        if "events" not in session[phase]:
            session[phase]["events"] = []
        
        session[phase]["events"].append(log_entry)
        
        # Log to console (sanitize data)
        safe_data = {k: v for k, v in (data or {}).items() if k not in ['user_id', 'file_url', 'vendor_name']}
        if level == "error":
            logger.error(f"{phase} - {event}: {safe_data}")
        elif level == "warning":
            logger.warning(f"{phase} - {event}: {safe_data}")
        else:
            logger.info(f"{phase} - {event}: {safe_data}")
    
    def log_upload(self, session_id: str, file_url: str, upload_time: float):
        """Log upload completion"""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["phase_1_upload_parse"]["upload"] = {
            "file_url": file_url,
            "upload_time": upload_time,
            "completed_at": datetime.now().isoformat()
        }
        
        logger.info(f"📤 [{session_id}] Upload complete: {upload_time:.2f}s")
    
    def log_parse_start(self, session_id: str, model: str):
        """Log parse start"""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["phase_1_upload_parse"]["parse"] = {
            "model": model,
            "started_at": datetime.now().isoformat()
        }
        
        logger.info(f"🤖 [{session_id}] Parse started with {model}")
    
    def log_parse_complete(
        self,
        session_id: str,
        parse_time: float,
        tokens: int,
        cost: float,
        vendor: str,
        invoice_number: str,
        total: float,
        line_items_count: int
    ):
        """Log parse completion"""
        if session_id not in self.sessions:
            return
        
        parse_data = self.sessions[session_id]["phase_1_upload_parse"].get("parse", {})
        parse_data.update({
            "parse_time": parse_time,
            "tokens_used": tokens,
            "cost": cost,
            "vendor": vendor,
            "invoice_number": invoice_number,
            "total": total,
            "line_items_count": line_items_count,
            "completed_at": datetime.now().isoformat()
        })
        
        self.sessions[session_id]["phase_1_upload_parse"]["parse"] = parse_data
        
        logger.info(f"✅ [{session_id}] Parse complete: {parse_time:.2f}s, "
                   f"{line_items_count} items, ${cost:.6f}")
    
    def log_validation(self, session_id: str, valid: bool, errors: list, warnings: list):
        """Log validation results"""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["phase_1_upload_parse"]["validation"] = {
            "valid": valid,
            "errors": errors,
            "warnings": warnings,
            "completed_at": datetime.now().isoformat()
        }
        
        if not valid:
            logger.warning(f"⚠️  [{session_id}] Validation failed: {len(errors)} errors")
        else:
            logger.info(f"✅ [{session_id}] Validation passed")
    
    def log_save_start(self, session_id: str):
        """Log save start"""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["phase_2_save"]["started_at"] = datetime.now().isoformat()
        logger.info(f"💾 [{session_id}] Save started")
    
    def log_save_complete(
        self,
        session_id: str,
        invoice_id: str,
        save_time: float,
        items_saved: int
    ):
        """Log save completion"""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["phase_2_save"].update({
            "invoice_id": invoice_id,
            "save_time": save_time,
            "items_saved": items_saved,
            "completed_at": datetime.now().isoformat()
        })
        
        logger.info(f"✅ [{session_id}] Save complete: {save_time:.2f}s, "
                   f"{items_saved} items, invoice_id={invoice_id}")
    
    def log_inventory_start(self, session_id: str, invoice_id: str):
        """Log inventory processing start"""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["phase_3_inventory"] = {
            "invoice_id": invoice_id,
            "started_at": datetime.now().isoformat()
        }
        
        logger.info(f"🏗️  [{session_id}] Inventory processing started")
    
    def log_inventory_complete(
        self,
        session_id: str,
        processing_time: float,
        items_processed: int,
        items_created: int,
        items_updated: int,
        fuzzy_matches: int,
        exact_matches: int
    ):
        """Log inventory processing completion"""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["phase_3_inventory"].update({
            "processing_time": processing_time,
            "items_processed": items_processed,
            "items_created": items_created,
            "items_updated": items_updated,
            "fuzzy_matches": fuzzy_matches,
            "exact_matches": exact_matches,
            "completed_at": datetime.now().isoformat()
        })
        
        logger.info(f"✅ [{session_id}] Inventory complete: {processing_time:.2f}s, "
                   f"{items_created} created, {items_updated} updated")
    
    def log_error(self, session_id: str, phase: str, error: str):
        """Log an error"""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["errors"].append({
            "phase": phase,
            "error": error,
            "timestamp": datetime.now().isoformat()
        })
        
        logger.error(f"❌ [{session_id}] {phase} error: {error}")
    
    def log_warning(self, session_id: str, phase: str, warning: str):
        """Log a warning"""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["warnings"].append({
            "phase": phase,
            "warning": warning,
            "timestamp": datetime.now().isoformat()
        })
        
        logger.warning(f"⚠️  [{session_id}] {phase} warning: {warning}")
    
    def end_session(self, session_id: str) -> Dict:
        """
        End monitoring session and save to file
        
        Returns:
            Complete session metrics
        """
        if session_id not in self.sessions:
            logger.warning(f"Session {session_id} not found")
            return {}
        
        session = self.sessions[session_id]
        session["ended_at"] = datetime.now().isoformat()
        
        # Calculate total time
        start_time = datetime.fromisoformat(session["started_at"])
        end_time = datetime.fromisoformat(session["ended_at"])
        session["total_time"] = (end_time - start_time).total_seconds()
        
        # Save to file
        filename = f"invoice_session_{session_id}.json"
        filepath = self.monitoring_dir / filename
        
        with open(filepath, 'w') as f:
            json.dump(session, f, indent=2, default=str)
        
        logger.info(f"📊 Session ended: {session_id}, total time: {session['total_time']:.2f}s")
        logger.info(f"📄 Metrics saved to: {filepath}")
        
        # Remove from active sessions
        metrics = self.sessions.pop(session_id)
        
        return metrics
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get current session data"""
        return self.sessions.get(session_id)
    
    def get_summary(self, session_id: str) -> Dict:
        """Get session summary for display"""
        if session_id not in self.sessions:
            return {}
        
        session = self.sessions[session_id]
        
        # Calculate phase times
        phase1 = session.get("phase_1_upload_parse", {})
        phase2 = session.get("phase_2_save", {})
        phase3 = session.get("phase_3_inventory", {})
        
        upload_time = phase1.get("upload", {}).get("upload_time", 0)
        parse_time = phase1.get("parse", {}).get("parse_time", 0)
        save_time = phase2.get("save_time", 0)
        inventory_time = phase3.get("processing_time", 0)
        
        return {
            "session_id": session_id,
            "filename": session.get("filename"),
            "performance": {
                "upload_time": upload_time,
                "parse_time": parse_time,
                "save_time": save_time,
                "inventory_time": inventory_time,
                "total_time": upload_time + parse_time + save_time + inventory_time
            },
            "data": {
                "vendor": phase1.get("parse", {}).get("vendor"),
                "invoice_number": phase1.get("parse", {}).get("invoice_number"),
                "total": phase1.get("parse", {}).get("total"),
                "line_items": phase1.get("parse", {}).get("line_items_count"),
                "invoice_id": phase2.get("invoice_id")
            },
            "inventory": {
                "items_created": phase3.get("items_created", 0),
                "items_updated": phase3.get("items_updated", 0),
                "fuzzy_matches": phase3.get("fuzzy_matches", 0),
                "exact_matches": phase3.get("exact_matches", 0)
            },
            "cost": {
                "gemini_api": phase1.get("parse", {}).get("cost", 0),
                "tokens": phase1.get("parse", {}).get("tokens_used", 0)
            },
            "errors": session.get("errors", []),
            "warnings": session.get("warnings", [])
        }


# Global instance
monitoring_service = InvoiceMonitoringService()
