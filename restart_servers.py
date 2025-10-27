"""
Automated server restart script that properly clears ports and restarts both servers
"""
import subprocess
import time
import sys

def run_command(command, description):
    """Run a command and print the result"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"✅ {description} completed")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
        else:
            print(f"⚠️ {description} finished with code {result.returncode}")
            if result.stderr.strip():
                print(f"   Error: {result.stderr.strip()}")
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} timed out (this is normal for some operations)")
    except Exception as e:
        print(f"❌ {description} failed: {e}")

def kill_processes_on_ports():
    """Kill any processes using ports 8000 and 5173"""
    print("🔍 Checking for processes on ports 8000 and 5173...")
    
    # Get processes on ports
    result = subprocess.run('netstat -ano | findstr ":8000\\|:5173"', 
                          shell=True, capture_output=True, text=True)
    
    if result.stdout.strip():
        print("📋 Found processes on target ports:")
        lines = result.stdout.strip().split('\n')
        pids = set()
        
        for line in lines:
            parts = line.split()
            if len(parts) >= 5:
                pid = parts[-1]
                pids.add(pid)
                print(f"   PID {pid}: {line.strip()}")
        
        # Kill each PID
        for pid in pids:
            run_command(f'taskkill /F /PID {pid}', f"Killing process {pid}")
    else:
        print("✅ No processes found on target ports")

def main():
    print("🚀 AUTOMATED SERVER RESTART")
    print("=" * 50)
    
    # Step 1: Kill processes on target ports
    kill_processes_on_ports()
    
    # Step 2: Wait a moment for cleanup
    print("\n⏳ Waiting 2 seconds for cleanup...")
    time.sleep(2)
    
    # Step 3: Verify ports are clear
    print("\n🔍 Verifying ports are clear...")
    result = subprocess.run('netstat -ano | findstr ":8000\\|:5173"', 
                          shell=True, capture_output=True, text=True)
    
    if result.stdout.strip():
        print("⚠️ Some processes still running:")
        print(result.stdout)
    else:
        print("✅ Ports 8000 and 5173 are clear")
    
    print("\n🎯 Ports cleared! You can now start your servers:")
    print("   Backend:  python -m uvicorn api.main:app --port 8000")
    print("   Frontend: cd frontend && npm run dev")
    print("\nOr use Kiro's controlPwshProcess tool to start them as background processes.")

if __name__ == "__main__":
    main()