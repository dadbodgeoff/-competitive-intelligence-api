# Sample Test Files

This directory contains sample files used for E2E testing.

## Required Files

### Invoice Files
- `sample_invoice_5_items.pdf` - Small invoice with 5 line items (TODO: Add actual PDF)
- `sample_invoice_20_items.pdf` - Medium invoice with 20 line items (TODO: Add actual PDF)
- `sample_invoice_50_items.pdf` - Large invoice with 50 line items (TODO: Add actual PDF)

### Menu Files
- `sample_menu_10_items.pdf` - Small menu with 10 items (TODO: Add actual PDF)
- `sample_menu_30_items.pdf` - Medium menu with 30 items (TODO: Add actual PDF)

### Invalid Files
- ✅ `invalid_file.txt` - Text file for testing error handling

## Creating Sample Files

### Option 1: Use Existing PDFs
Copy actual invoice/menu PDFs from your project:
```bash
cp path/to/real/invoice.pdf sample_invoice_5_items.pdf
cp path/to/real/menu.pdf sample_menu_10_items.pdf
```

### Option 2: Use PDFs from Project Root
If you have sample PDFs in the project root:
```bash
# From this directory
cp ../../../../../../park-avenue-menu-web-2-1.pdf sample_menu_10_items.pdf
```

### Option 3: Create Placeholder PDFs
For now, you can use any PDF file as a placeholder:
```bash
# Any PDF will work for basic upload testing
cp any_document.pdf sample_invoice_5_items.pdf
```

## File Requirements

### Invoice PDFs
- Should contain line items with:
  - Item descriptions
  - Quantities
  - Unit prices
  - Extended prices
- Vendor information (optional)
- Invoice number and date (optional)

### Menu PDFs
- Should contain menu items with:
  - Item names
  - Prices
  - Categories (Pizzas, Appetizers, etc.)
  - Descriptions (optional)

## Notes

- Files should be under 10MB (upload limit)
- PDF format only (for valid uploads)
- Tests will use these files for upload and parsing workflows
- Invalid file (txt) is used to test error handling

## Status

- ✅ Invalid file created
- 🚧 Invoice PDFs needed
- 🚧 Menu PDFs needed

**Action Required:** Add actual PDF files before running Journey 2 and 3 tests.
