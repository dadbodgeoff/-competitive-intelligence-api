"""
Simple filewatcher that clears ports and notifies you to restart servers
Works with Kiro's controlPwshProcess for better server management
"""
import time
import json
import importlib.util
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Import the restart functionality from existing script
spec = importlib.util.spec_from_file_location("restart_servers", "restart_servers.py")
restart_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(restart_module)

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

class SimpleRestartHandler(FileSystemEventHandler):
    def __init__(self, config):
        self.config = config
        self.debounce_seconds = config['debounce_seconds']
        self.last_restart = 0
        self.restart_timer = None
        
    def on_modified(self, event):
        if event.is_directory:
            return
            
        # Only restart for relevant file changes
        file_path = Path(event.src_path)
        relevant_extensions = set(self.config['watch_extensions'])
        
        if file_path.suffix not in relevant_extensions:
            return
            
        # Skip certain files/directories
        skip_patterns = set(self.config['ignore_patterns'])
        
        if any(pattern in str(file_path) for pattern in skip_patterns):
            return
            
        print(f"📝 File changed: {file_path}")
        self.schedule_restart()
    
    def schedule_restart(self):
        """Schedule a restart with debouncing"""
        if self.restart_timer:
            self.restart_timer.cancel()
            
        self.restart_timer = threading.Timer(self.debounce_seconds, self.handle_restart)
        self.restart_timer.start()
        
    def handle_restart(self):
        """Handle the restart process"""
        print("\n" + "="*60)
        print("🔄 FILE CHANGE DETECTED - CLEARING PORTS")
        print("="*60)
        
        # Clear ports using existing logic
        restart_module.kill_processes_on_ports()
        
        print("\n🎯 Ports cleared! Your servers have been stopped.")
        print("📋 To restart your servers, use Kiro's controlPwshProcess:")
        print("   Backend:  python -m uvicorn api.main:app --port 8000")
        print("   Frontend: cd frontend && npm run dev")
        print("="*60 + "\n")
        
        self.last_restart = time.time()

def main():
    print("👀 SIMPLE FILEWATCHER STARTING")
    print("="*50)
    
    config = load_config()
    print(f"📋 Watching extensions: {', '.join(config['watch_extensions'])}")
    print(f"⏱️  Debounce: {config['debounce_seconds']}s")
    
    print("\n🎯 This filewatcher will:")
    print("   1. Monitor file changes")
    print("   2. Clear ports when changes detected")
    print("   3. Notify you to restart servers")
    print("\nPress Ctrl+C to stop")
    print("="*50)
    
    event_handler = SimpleRestartHandler(config)
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
    import threading
    main()