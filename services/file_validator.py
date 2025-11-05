"""
File Validator Service
Validates uploaded files before parsing
Prevents wasted API costs on invalid files
"""
from typing import Dict
from fastapi import UploadFile
from services.malware_scanner import MalwareScannerService
import logging

logger = logging.getLogger(__name__)


class FileValidator:
    def __init__(self):
        self.max_size = 10 * 1024 * 1024  # 10MB
        self.allowed_types = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ]
        self.malware_scanner = MalwareScannerService()
    
    async def validate_file(self, file: UploadFile) -> Dict:
        """
        Validate uploaded file
        
        Returns:
            {
                "valid": bool, 
                "error": str or None,
                "validation_details": dict
            }
        """
        logger.info(f"📋 Validating file: {file.filename}")
        validation_details = {
            "filename": file.filename,
            "content_type": file.content_type,
            "checks_passed": []
        }
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to start
        
        validation_details["file_size_bytes"] = file_size
        validation_details["file_size_mb"] = round(file_size / 1024 / 1024, 2)
        
        logger.debug(f"   Size: {validation_details['file_size_mb']} MB")
        
        if file_size > self.max_size:
            logger.warning(f"❌ File too large: {validation_details['file_size_mb']} MB")
            return {
                "valid": False,
                "error": f"File too large ({file_size / 1024 / 1024:.1f}MB). Maximum size is 10MB.",
                "validation_details": validation_details
            }
        
        if file_size == 0:
            logger.warning(f"❌ File is empty")
            return {
                "valid": False,
                "error": "File is empty. Please upload a valid invoice.",
                "validation_details": validation_details
            }
        
        validation_details["checks_passed"].append("size_check")
        logger.debug(f"   ✓ Size check passed")
        
        # Check file type
        if file.content_type not in self.allowed_types:
            logger.warning(f"❌ Invalid file type: {file.content_type}")
            return {
                "valid": False,
                "error": f"Invalid file type ({file.content_type}). Please upload PDF, JPG, or PNG only.",
                "validation_details": validation_details
            }
        
        validation_details["checks_passed"].append("type_check")
        logger.debug(f"   ✓ Type check passed")
        
        # Basic content validation for PDFs
        if file.content_type == 'application/pdf':
            # Read first few bytes to check PDF signature
            header = await file.read(4)
            file.file.seek(0)  # Reset
            
            if header != b'%PDF':
                logger.warning(f"❌ PDF signature invalid: {header}")
                return {
                    "valid": False,
                    "error": "File appears corrupted. Please re-scan and try again.",
                    "validation_details": validation_details
                }
            
            validation_details["checks_passed"].append("pdf_signature_check")
            logger.debug(f"   ✓ PDF signature check passed")
        
        # Malware scan
        logger.debug(f"   Starting malware scan...")
        scan_result = await self.malware_scanner.scan_file(file)
        validation_details["malware_scan"] = scan_result
        
        if not scan_result['safe']:
            threat = scan_result.get('threat_found', 'Unknown threat')
            logger.error(f"❌ Malware detected: {threat}")
            return {
                "valid": False,
                "error": f"Security threat detected: {threat}. File rejected.",
                "validation_details": validation_details
            }
        
        validation_details["checks_passed"].append("malware_scan")
        logger.info(f"✅ File validation passed: {file.filename}")
        logger.debug(f"   All checks: {', '.join(validation_details['checks_passed'])}")
        
        return {
            "valid": True, 
            "error": None,
            "validation_details": validation_details
        }
