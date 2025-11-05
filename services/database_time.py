"""
Database Time Service
Ensures all timestamps come from database, not application server
"""
from datetime import datetime
from supabase import Client


def get_database_time(supabase: Client) -> datetime:
    """
    Get current time from database (source of truth)
    
    Returns:
        datetime: Current database timestamp with timezone
    """
    result = supabase.rpc('get_system_time').execute()
    return datetime.fromisoformat(result.data)


def get_database_date(supabase: Client) -> str:
    """
    Get current date from database (source of truth)
    
    Returns:
        str: Current database date in YYYY-MM-DD format
    """
    result = supabase.rpc('get_system_time').execute()
    db_time = datetime.fromisoformat(result.data)
    return db_time.date().isoformat()


# Note: In most cases, you should let the database handle timestamps automatically
# via DEFAULT NOW() and triggers. Only use these functions when you need to:
# 1. Display current time to user before saving
# 2. Calculate time-based logic in Python
# 3. Ensure consistency across multiple operations

# BEST PRACTICE: Let database set timestamps
# ✅ Good: INSERT INTO table (data) VALUES ('value')  -- created_at set by DEFAULT NOW()
# ❌ Bad:  INSERT INTO table (data, created_at) VALUES ('value', datetime.now())  -- uses app time
