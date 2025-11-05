"""
Filewatcher designed to work with Kiro's controlPwshProcess
Monitors files and provides restart commands for Kiro
"""
import time
import json
import threading
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

def load_config():
    try:
        with open('filewatcher_config.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "debounce_seconds": 2,
            "watch_extensions": [".py", ".js", ".ts", ".tsx", ".json", ".sql", ".md"],
            "ignore_patterns": ["__pycache__", ".git", "node_modules", ".vscode", "dist", "build"]
        }

class KiroRestartHandler(FileSystemEventHandler):
    def __init__(self, config):
        self.config = config
        self.debounce_seconds = config['debounce_seconds']
        self.restart_timer = None
        
    def on_modified(self, event):
        if event.is_directory:
            return
            
        file_path = Path(event.src_path)
        relevant_extensions = set(self.config['watch_extensions'])
        
        if file_path.suffix not in relevant_extensions:
            return
            
        skip_patterns = set(self.config['ignore_patterns'])
        if any(pattern in str(file_path) for pattern in skip_patterns):
            return
            
        print(f"📝 File changed: {file_path}")
        self.schedule_restart()
    
    def schedule_restart(self):
        if self.restart_timer:
            self.restart_timer.cancel()
            
        self.restart_timer = threading.Timer(self.debounce_seconds, self.show_restart_info)
        self.restart_timer.start()
        
    def show_restart_info(self):
        print("\n" + "🔄 " + "="*58)
        print("FILE CHANGE DETECTED - RESTART NEEDED")
        print("="*60)
        print("🎯 Run this in Kiro to restart servers with port cleanup:")
        print()
        print("   python restart_servers.py")
        print()
        print("🚀 Then start servers again:")
        print("   Backend:  controlPwshProcess -> start -> python -m uvicorn api.main:app --port 8000")
        print("   Frontend: controlPwshProcess -> start -> npm run dev (in frontend folder)")
        print("="*60 + "\n")

def main():
    print("👀 KIRO FILEWATCHER")
    print("="*50)
    
    config = load_config()
    print(f"📋 Watching: {', '.join(config['watch_extensions'])}")
    print(f"⏱️  Debounce: {config['debounce_seconds']}s")
    print("\nMonitoring for changes... Press Ctrl+C to stop")
    print("="*50)
    
    event_handler = KiroRestartHandler(config)
    observer = Observer()
    observer.schedule(event_handler, ".", recursive=True)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping filewatcher...")
        observer.stop()
        
    observer.join()
    print("👋 Filewatcher stopped")

if __name__ == "__main__":
    main()