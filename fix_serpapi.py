#!/usr/bin/env python3
"""Fix the serpapi_review_service.py file"""

with open('services/serpapi_review_service.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep only lines up to line 984 (before the bad code)
fixed_lines = lines[:984]

with open('services/serpapi_review_service.py', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print(f"Fixed! Kept {len(fixed_lines)} lines, removed {len(lines) - len(fixed_lines)} bad lines")
