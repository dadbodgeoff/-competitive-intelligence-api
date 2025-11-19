#!/usr/bin/env python3
"""Script to remove additional unused files identified in cleanup report"""
import os
import shutil
import glob
from pathlib import Path

# Files/directories to KEEP
KEEP_FILES = {
    'nginx.conf',
    'deploy-to-digital-ocean.sh',
    'docker-deploy.sh',  # Keep in case it's used
    'confirmation_page.html',
    'README.md',
    'requirements.txt',
    'package.json',
    'package-lock.json',
    'Dockerfile',
    'Dockerfile.dev',
    'docker-compose.yml',
    'docker-compose.dev.yml',
    '.dockerignore',
    '.gitignore',
}

KEEP_DIRS = {
    'api',
    'services',
    'config',
    'prompts',
    'database/migrations',  # Keep migrations directory
    'frontend',
    'models',
}

def remove_python_scripts():
    """Remove Python utility scripts"""
    patterns = [
        'verify_*.py',
        'check_*.py',
        'audit_*.py',
        'export_*.py',
        'seed_*.py',
        'get_*.py',
        'fix_*.py',
        'cleanup_*.py',
        'generate_*.py',
        'list_*.py',
        'query_*.py',
        'reset_*.py',
        'run_*.py',
        'start_*.py',
        'trace_*.py',
        'visualize_*.py',
        'wipe_*.py',
        'compare_*.py',
        'find_*.py',
        'production_menu_extractor.py',
        'decompile_pyc.py',
        'setup_database.py',
        'restart_servers.py',
        'quick_verify_*.py',
        'kiro_filewatcher.py',
        'simple_filewatcher.py',
    ]
    
    deleted = 0
    for pattern in patterns:
        for file in glob.glob(pattern):
            if os.path.basename(file) not in KEEP_FILES:
                try:
                    os.remove(file)
                    deleted += 1
                except Exception as e:
                    print(f"Error deleting {file}: {e}")
    
    print(f"[OK] Deleted {deleted} Python utility scripts")

def remove_sql_files():
    """Remove SQL files except migrations"""
    # Get list of migration files to keep
    migration_files = set()
    for mig_file in glob.glob('database/migrations/*.sql'):
        migration_files.add(os.path.basename(mig_file))
    
    patterns = [
        'verify_*.sql',
        'check_*.sql',
        'fix_*.sql',
        'diagnose_*.sql',
        'debug_*.sql',
        'AUDIT_*.sql',
        'apply_*.sql',
        'complete_*.sql',
        'create_*.sql',
        'disable_*.sql',
        'force_*.sql',
        'get_*.sql',
        'just_*.sql',
        'menu_*.sql',
        'quick_*.sql',
        'reset_*.sql',
        'setup_*.sql',
        'sync_*.sql',
        'test_*.sql',
        'upgrade_*.sql',
        'database_schema_*.sql',
        'database_tier_*.sql',
        'generate_*.sql',
        'supabase_*.sql',
    ]
    
    deleted = 0
    for pattern in patterns:
        for sql_file in glob.glob(pattern):
            if os.path.basename(sql_file) not in migration_files:
                try:
                    os.remove(sql_file)
                    deleted += 1
                except Exception as e:
                    print(f"Error deleting {sql_file}: {e}")
    
    # Remove SQL files from database/ directory (except migrations)
    for sql_file in glob.glob('database/*.sql'):
        if 'migrations' not in sql_file:
            try:
                os.remove(sql_file)
                deleted += 1
            except Exception as e:
                print(f"Error deleting {sql_file}: {e}")
    
    print(f"[OK] Deleted {deleted} SQL files (kept migrations)")

def remove_batch_shell_scripts():
    """Remove batch/shell scripts except deployment scripts"""
    keep_scripts = {
        'deploy-to-digital-ocean.sh',
        'docker-deploy.sh',
    }
    
    # Remove .bat files
    deleted = 0
    for bat_file in glob.glob('*.bat'):
        if os.path.basename(bat_file) not in KEEP_FILES:
            try:
                os.remove(bat_file)
                deleted += 1
            except Exception as e:
                print(f"Error deleting {bat_file}: {e}")
    
    # Remove .sh files except deployment scripts
    for sh_file in glob.glob('*.sh'):
        if os.path.basename(sh_file) not in keep_scripts and os.path.basename(sh_file) not in KEEP_FILES:
            try:
                os.remove(sh_file)
                deleted += 1
            except Exception as e:
                print(f"Error deleting {sh_file}: {e}")
    
    # Remove .ps1 files
    for ps1_file in glob.glob('*.ps1'):
        try:
            os.remove(ps1_file)
            deleted += 1
        except Exception as e:
            print(f"Error deleting {ps1_file}: {e}")
    
    print(f"[OK] Deleted {deleted} batch/shell scripts (kept deployment scripts)")

def remove_directories():
    """Remove entire directories"""
    dirs_to_remove = [
        '_archive',
        'test-invoice-parser',
        'tests',
        'real_review_results',
        'debug_logs',
        'monitoring_logs',
        'performance_logs',
        'poc_results',
        'diagrams',
        'fixes',
        'utils',
        'workers',
    ]
    
    deleted = 0
    for dir_name in dirs_to_remove:
        if os.path.exists(dir_name):
            try:
                shutil.rmtree(dir_name)
                deleted += 1
                print(f"[OK] Deleted directory: {dir_name}")
            except Exception as e:
                print(f"Error deleting {dir_name}: {e}")
    
    print(f"[OK] Deleted {deleted} directories")

def remove_sample_files():
    """Remove sample/test PDF files"""
    pdf_files = glob.glob('*.pdf') + glob.glob('*.PDF')
    deleted = 0
    for pdf_file in pdf_files:
        try:
            os.remove(pdf_file)
            deleted += 1
        except Exception as e:
            print(f"Error deleting {pdf_file}: {e}")
    
    print(f"[OK] Deleted {deleted} sample PDF files")

def remove_cleanup_files():
    """Remove cleanup/report files (optional - can keep for reference)"""
    cleanup_files = [
        'PRODUCTION_CLEANUP_REPORT.md',
        'CLEANUP_SUMMARY.md',
        'VERIFICATION_REPORT.md',
        'ADDITIONAL_CLEANUP_REPORT.md',
        'ADDITIONAL_CLEANUP_SUMMARY.md',
        'verify_cleanup.py',
        'remove_unused_files.bat',
        'remove_unused_files.sh',
        'remove_additional_files.py',  # This script itself
    ]
    
    deleted = 0
    for file in cleanup_files:
        if os.path.exists(file):
            try:
                os.remove(file)
                deleted += 1
            except Exception as e:
                print(f"Error deleting {file}: {e}")
    
    print(f"[OK] Deleted {deleted} cleanup/report files")

if __name__ == '__main__':
    print("=" * 60)
    print("ADDITIONAL CLEANUP - Removing Unused Files")
    print("=" * 60)
    print()
    
    remove_python_scripts()
    remove_sql_files()
    remove_batch_shell_scripts()
    remove_directories()
    remove_sample_files()
    remove_cleanup_files()
    
    print()
    print("=" * 60)
    print("CLEANUP COMPLETE!")
    print("=" * 60)
    print()
    print("Files kept:")
    print("  - nginx.conf (used by deployment)")
    print("  - deploy-to-digital-ocean.sh (deployment script)")
    print("  - docker-deploy.sh (deployment script)")
    print("  - confirmation_page.html (used by api/main.py)")
    print("  - database/migrations/*.sql (official migrations)")
    print()
    print("Next steps:")
    print("  1. Verify Docker build: docker-compose build")
    print("  2. Test application: docker-compose up")
    print("  3. Commit changes: git add -A && git commit -m 'Cleanup: Remove additional unused files'")
    print()

