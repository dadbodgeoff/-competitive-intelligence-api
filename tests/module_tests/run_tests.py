#!/usr/bin/env python3
"""
Simple test runner for module tests
Runs all module tests and shows summary
"""
import subprocess
import sys


def run_all_tests():
    """Run all module tests"""
    print("=" * 70)
    print("🧪 MODULE TEST SUITE")
    print("=" * 70)
    print()
    
    cmd = [
        "python", "-m", "pytest",
        "tests/module_tests/",
        "-v",
        "--tb=short",
        "-s"
    ]
    
    result = subprocess.run(cmd)
    return result.returncode


def run_module(module_name):
    """Run tests for specific module"""
    print(f"\n🧪 Testing {module_name} module...\n")
    
    cmd = [
        "python", "-m", "pytest",
        f"tests/module_tests/test_{module_name}.py",
        "-v",
        "--tb=short",
        "-s"
    ]
    
    result = subprocess.run(cmd)
    return result.returncode


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Run specific module
        module = sys.argv[1]
        exit_code = run_module(module)
    else:
        # Run all tests
        exit_code = run_all_tests()
    
    sys.exit(exit_code)
