# Invoice Parser Test Harness

Standalone tool to validate Gemini 1.5 Pro Vision's ability to parse food service invoices.

## Setup

### Backend Integration

Add to your main FastAPI app (e.g., `main.py`):

```python
from test-invoice-parser.backend.invoice_parser_test import router as invoice_test_router

app.include_router(invoice_test_router)
```

### Frontend Integration

Add route to your React app:

```tsx
import InvoiceParserTest from './test-invoice-parser/frontend/InvoiceParserTest';

// In your router:
<Route path="/test/invoice-parser" element={<InvoiceParserTest />} />
```

### Dependencies

Backend (add to requirements.txt if not present):
```
google-generativeai>=0.3.0
```

Install:
```bash
pip install google-generativeai
```

## Usage

1. Navigate to `/test/invoice-parser` in your app
2. Upload a PDF or image of a food service invoice
3. Click "Parse Invoice"
4. Review results:
   - Invoice metadata (number, date, vendor, totals)
   - Line items table with all products
   - Performance metrics (time, tokens, cost)
   - Raw JSON response for debugging

## What It Tests

- Multi-page invoice handling
- Section parsing (DRY, REFRIGERATED, FROZEN)
- Complex pack size formats
- Multi-line descriptions
- Tax calculations
- Edge cases (special notes, headers, etc.)

## Expected Performance

- Parse time: 3-8 seconds (depending on invoice complexity)
- Tokens: 5,000-15,000 (varies by page count and content)
- Cost: $0.01-$0.05 per invoice

## Files

```
test-invoice-parser/
├── backend/
│   └── invoice_parser_test.py    # FastAPI endpoint
├── frontend/
│   └── InvoiceParserTest.tsx     # React component
└── README.md                      # This file
```

## Notes

- Completely separate from main app
- No database storage
- Uses existing GOOGLE_GEMINI_API_KEY from .env
- Easy to iterate and test multiple invoices
