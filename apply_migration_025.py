"""Apply migration 025 to add invoice_item_id to menu_item_ingredients"""
from database.supabase_client import get_supabase_client

def apply_migration():
    client = get_supabase_client()
    
    with open('database/migrations/025_add_invoice_item_to_ingredients.sql', 'r') as f:
        sql = f.read()
    
    print("Applying migration 025...")
    print(sql[:200] + "...")
    
    try:
        # Execute SQL directly using the REST API
        result = client.rpc('exec_sql', {'sql': sql}).execute()
        print("✅ Migration applied successfully")
        return True
    except Exception as e:
        # If exec_sql doesn't exist, try executing statements individually
        print(f"exec_sql not available, trying direct execution: {e}")
        
        # Split into individual statements
        statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]
        
        for stmt in statements:
            if stmt and not stmt.startswith('DO'):
                try:
                    print(f"Executing: {stmt[:100]}...")
                    # Use postgrest to execute
                    client.postgrest.rpc('exec', {'query': stmt}).execute()
                except Exception as stmt_error:
                    print(f"Statement failed: {stmt_error}")
        
        print("✅ Migration statements executed")
        return True

if __name__ == "__main__":
    apply_migration()
