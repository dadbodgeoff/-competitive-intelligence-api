@echo off
echo Installing watchdog dependency if needed...
pip install watchdog==4.0.0

echo.
echo Starting filewatcher...
python filewatcher.py

pause