# BACKEND TEST PLAN - PRODUCTION TEST SUITE

**Generated:** November 3, 2025  
**Purpose:** Complete test plan for backend critical flows  
**Based On:** Comprehensive backend audit of all 5 modules

---

## TEST SUITE STRUCTURE

```
tests/
├── unit/                          # Unit tests (isolated)
│   ├── test_auth_service.py
│   ├── test_invoice_parser.py
│   ├── test_fuzzy_matching.py
│   ├── test_unit_converter.py
│   └── test_error_sanitizer.py
├── integration/                   # Integration tests (multiple services)
│   ├── test_invoice_workflow.py
│   ├── test_menu_workflow.py
│   ├── test_analysis_workflow.py
│   └── test_menu_comparison_workflow.py
├── e2e/                          # End-to-end tests (full user journeys)
│   ├── test_invoice_e2e.py
│   ├── test_menu_e2e.py
│   ├── test_analysis_e2e.py
│   └── test_menu_comparison_e2e.py
├── security/                     # Security-focused tests
│   ├── test_rls_policies.py
│   ├── test_auth_security.py
│   ├── test_idor_prevention.py
│   └── test_error_sanitization.py
└── performance/                  # Performance benchmarks
    ├── test_rate_limiting.py
    ├── test_concurrent_operations.py
    └── test_streaming_performance.py
```

---

## MODULE 1: AUTHENTICATION & AUTHORIZATION

### Critical Test Cases (Priority: HIGH)

#### Registration Flow
- **TC-AUTH-001**: Valid registration creates user + profile
  - Input: Valid email, password, name
  - Expected: User in auth.users, profile in public.users, JWT token, cookies set
  - Assertions: User ID matches, subscription_tier='free', cookies httpOnly

- **TC-AUTH-002**: Duplicate email rejected
  - Input: Email already registered
  - Expected: 400 Bad Request
  - Assertions: Error message sanitized, no user created

- **TC-AUTH-003**: Invalid email format rejected
  - Input: Malformed email
  - Expected: 422 Validation Error
  - Assertions: Pydantic validation error

