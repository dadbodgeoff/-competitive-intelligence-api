# Module-by-Module Test Suite

Simple, focused tests that verify each module's core features work end-to-end.

## Structure

```
tests/module_tests/
├── test_invoices.py       # Invoice module tests
├── test_menus.py          # Menu module tests  
├── test_menu_comparison.py # Menu comparison tests
├── test_price_analytics.py # Price analytics tests
├── test_review_analysis.py # Review analysis tests
└── conftest.py            # Shared fixtures
```

## What Each Test Does

1. **Backend API Tests** - Verify endpoints return 200 and correct data
2. **Frontend Route Tests** - Verify frontend pages load (return 200)
3. **Core Feature Tests** - Test the main workflow of each module

## Running Tests

```bash
# Run all module tests
python -m pytest tests/module_tests/ -v

# Run specific module
python -m pytest tests/module_tests/test_invoices.py -v

# Run with detailed output
python -m pytest tests/module_tests/ -v -s
```

## Test User

Tests use: `nrivikings8@gmail.com` / `testpass123`
