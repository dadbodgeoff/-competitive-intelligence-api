"""
Start Development Stack
Starts both backend and frontend servers for development
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def check_port(port):
    """Check if a port is already in use"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result == 0

def start_backend():
    """Start the FastAPI backend"""
    print_header("Starting Backend Server")
    
    if check_port(8000):
        print("⚠️  Port 8000 is already in use")
        print("   Backend may already be running")
        return None
    
    print("🚀 Starting FastAPI backend on http://localhost:8000")
    print("   Logs will appear below...")
    print("   Press Ctrl+C to stop\n")
    
    # Start backend in background
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "api.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Wait a bit for backend to start
    time.sleep(3)
    
    if backend_process.poll() is None:
        print("✅ Backend started successfully!")
        return backend_process
    else:
        print("❌ Backend failed to start")
        return None

def start_frontend():
    """Start the Vite frontend"""
    print_header("Starting Frontend Server")
    
    if check_port(5173):
        print("⚠️  Port 5173 is already in use")
        print("   Frontend may already be running")
        return None
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return None
    
    print("🚀 Starting Vite frontend on http://localhost:5173")
    print("   Logs will appear below...")
    print("   Press Ctrl+C to stop\n")
    
    # Start frontend in background
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=True
    )
    
    # Wait a bit for frontend to start
    time.sleep(5)
    
    if frontend_process.poll() is None:
        print("✅ Frontend started successfully!")
        return frontend_process
    else:
        print("❌ Frontend failed to start")
        return None

def main():
    """Main function to start the dev stack"""
    print_header("Development Stack Startup")
    print("Starting backend and frontend servers...")
    print("Press Ctrl+C to stop all servers\n")
    
    backend_process = None
    frontend_process = None
    
    try:
        # Start backend
        backend_process = start_backend()
        if not backend_process:
            print("\n⚠️  Backend not started. Continuing anyway...")
        
        # Start frontend
        frontend_process = start_frontend()
        if not frontend_process:
            print("\n⚠️  Frontend not started. Continuing anyway...")
        
        print_header("Development Stack Running")
        print("✅ Backend:  http://localhost:8000")
        print("✅ Frontend: http://localhost:5173")
        print("✅ API Docs: http://localhost:8000/api/docs")
        print("\n📝 To test auth:")
        print("   python test_httponly_cookies_auth_e2e.py")
        print("\n⏹️  Press Ctrl+C to stop all servers")
        
        # Keep script running
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if backend_process and backend_process.poll() is not None:
                print("\n⚠️  Backend process stopped")
                break
            if frontend_process and frontend_process.poll() is not None:
                print("\n⚠️  Frontend process stopped")
                break
    
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping servers...")
    
    finally:
        # Clean up processes
        if backend_process:
            print("   Stopping backend...")
            backend_process.terminate()
            backend_process.wait(timeout=5)
        
        if frontend_process:
            print("   Stopping frontend...")
            frontend_process.terminate()
            frontend_process.wait(timeout=5)
        
        print("\n✅ All servers stopped")

if __name__ == "__main__":
    main()
