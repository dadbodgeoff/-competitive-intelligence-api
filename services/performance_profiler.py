#!/usr/bin/env python3
"""
Performance Profiler - Track and log timing for analysis runs
"""
import time
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class PerformanceProfiler:
    """Track timing for each step of the analysis process"""
    
    def __init__(self, analysis_id: str):
        self.analysis_id = analysis_id
        self.start_time = time.time()
        self.steps: List[Dict] = []
        self.current_step: Optional[Dict] = None
        
    def start_step(self, step_name: str, details: Optional[Dict] = None):
        """Start timing a step"""
        if self.current_step:
            # Auto-end previous step if not ended
            self.end_step()
        
        self.current_step = {
            'name': step_name,
            'start_time': time.time(),
            'details': details or {}
        }
        logger.info(f"⏱️  START: {step_name}")
        
    def end_step(self, additional_details: Optional[Dict] = None):
        """End timing the current step"""
        if not self.current_step:
            return
        
        end_time = time.time()
        duration = end_time - self.current_step['start_time']
        
        step_data = {
            'name': self.current_step['name'],
            'duration_seconds': round(duration, 3),
            'start_time': datetime.fromtimestamp(self.current_step['start_time']).isoformat(),
            'end_time': datetime.fromtimestamp(end_time).isoformat(),
            'details': {**self.current_step['details'], **(additional_details or {})}
        }
        
        self.steps.append(step_data)
        logger.info(f"⏱️  END: {self.current_step['name']} - {duration:.3f}s")
        
        self.current_step = None
        
    def add_metric(self, metric_name: str, value: any):
        """Add a metric to the current step"""
        if self.current_step:
            self.current_step['details'][metric_name] = value
    
    def get_summary(self) -> Dict:
        """Get performance summary"""
        total_time = time.time() - self.start_time
        
        return {
            'analysis_id': self.analysis_id,
            'total_duration_seconds': round(total_time, 3),
            'start_time': datetime.fromtimestamp(self.start_time).isoformat(),
            'end_time': datetime.now().isoformat(),
            'steps': self.steps,
            'step_count': len(self.steps),
            'breakdown': self._get_breakdown()
        }
    
    def _get_breakdown(self) -> Dict:
        """Get time breakdown by category"""
        breakdown = {}
        for step in self.steps:
            category = step['name'].split(':')[0] if ':' in step['name'] else step['name']
            if category not in breakdown:
                breakdown[category] = {
                    'total_seconds': 0,
                    'count': 0,
                    'steps': []
                }
            breakdown[category]['total_seconds'] += step['duration_seconds']
            breakdown[category]['count'] += 1
            breakdown[category]['steps'].append({
                'name': step['name'],
                'duration': step['duration_seconds']
            })
        
        # Round totals
        for category in breakdown:
            breakdown[category]['total_seconds'] = round(breakdown[category]['total_seconds'], 3)
        
        return breakdown
    
    def save_report(self, output_dir: str = "performance_logs"):
        """Save performance report to file"""
        try:
            # Create output directory
            Path(output_dir).mkdir(exist_ok=True)
            
            # Generate filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{output_dir}/analysis_{self.analysis_id}_{timestamp}.json"
            
            # Get summary
            summary = self.get_summary()
            
            # Save to file
            with open(filename, 'w') as f:
                json.dump(summary, f, indent=2)
            
            logger.info(f"📊 Performance report saved: {filename}")
            
            # Also create a human-readable version
            self._save_readable_report(filename.replace('.json', '.txt'), summary)
            
            return filename
            
        except Exception as e:
            logger.error(f"Failed to save performance report: {e}")
            return None
    
    def _save_readable_report(self, filename: str, summary: Dict):
        """Save human-readable performance report"""
        try:
            with open(filename, 'w') as f:
                f.write("=" * 80 + "\n")
                f.write(f"PERFORMANCE REPORT - Analysis {self.analysis_id}\n")
                f.write("=" * 80 + "\n\n")
                
                f.write(f"Total Duration: {summary['total_duration_seconds']:.3f}s\n")
                f.write(f"Start Time: {summary['start_time']}\n")
                f.write(f"End Time: {summary['end_time']}\n")
                f.write(f"Total Steps: {summary['step_count']}\n\n")
                
                f.write("=" * 80 + "\n")
                f.write("BREAKDOWN BY CATEGORY\n")
                f.write("=" * 80 + "\n\n")
                
                for category, data in sorted(summary['breakdown'].items(), 
                                            key=lambda x: x[1]['total_seconds'], 
                                            reverse=True):
                    f.write(f"{category}:\n")
                    f.write(f"  Total: {data['total_seconds']:.3f}s\n")
                    f.write(f"  Count: {data['count']}\n")
                    f.write(f"  Average: {data['total_seconds']/data['count']:.3f}s\n\n")
                
                f.write("=" * 80 + "\n")
                f.write("DETAILED STEPS\n")
                f.write("=" * 80 + "\n\n")
                
                for i, step in enumerate(summary['steps'], 1):
                    f.write(f"{i}. {step['name']}\n")
                    f.write(f"   Duration: {step['duration_seconds']:.3f}s\n")
                    f.write(f"   Start: {step['start_time']}\n")
                    if step['details']:
                        f.write(f"   Details: {json.dumps(step['details'], indent=6)}\n")
                    f.write("\n")
                
                f.write("=" * 80 + "\n")
                
            logger.info(f"📄 Readable report saved: {filename}")
            
        except Exception as e:
            logger.error(f"Failed to save readable report: {e}")
