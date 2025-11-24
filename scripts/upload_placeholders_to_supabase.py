"""
Upload placeholder images to Supabase Storage.
"""
import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.production')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment")
    exit(1)

print(f"🔗 Connecting to Supabase: {SUPABASE_URL}")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

placeholder_dir = "frontend/public/placeholders"
uploaded_count = 0
failed_count = 0

if not os.path.exists(placeholder_dir):
    print(f"❌ Error: Directory not found: {placeholder_dir}")
    print("Run 'python scripts/generate_template_placeholders.py' first")
    exit(1)

print(f"📁 Scanning directory: {placeholder_dir}")

for root, dirs, files in os.walk(placeholder_dir):
    for file in files:
        if file.endswith('.png'):
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, placeholder_dir)
            storage_path = f"placeholders/{relative_path}".replace('\\', '/')
            
            try:
                with open(file_path, 'rb') as f:
                    file_content = f.read()
                    
                # Try to upload
                result = supabase.storage.from_('creative-assets').upload(
                    storage_path,
                    file_content,
                    {"content-type": "image/png", "upsert": "true"}
                )
                
                print(f"✅ Uploaded: {storage_path}")
                uploaded_count += 1
                
            except Exception as e:
                error_msg = str(e)
                # If file already exists, try to update it
                if 'already exists' in error_msg.lower() or 'duplicate' in error_msg.lower():
                    try:
                        # Remove and re-upload
                        supabase.storage.from_('creative-assets').remove([storage_path])
                        result = supabase.storage.from_('creative-assets').upload(
                            storage_path,
                            file_content,
                            {"content-type": "image/png"}
                        )
                        print(f"✅ Updated: {storage_path}")
                        uploaded_count += 1
                    except Exception as e2:
                        print(f"❌ Failed to update {storage_path}: {e2}")
                        failed_count += 1
                else:
                    print(f"❌ Failed to upload {storage_path}: {e}")
                    failed_count += 1

print(f"\n{'='*60}")
print(f"✅ Successfully uploaded: {uploaded_count} files")
if failed_count > 0:
    print(f"❌ Failed: {failed_count} files")
print(f"{'='*60}")

# Print example URLs
if uploaded_count > 0:
    print(f"\n📸 Example thumbnail URL:")
    print(f"{SUPABASE_URL}/storage/v1/object/public/creative-assets/placeholders/thumbnails/seasonal-menu.png")
    print(f"\n💡 Use this base URL in your SQL updates:")
    print(f"{SUPABASE_URL}/storage/v1/object/public/creative-assets/")
