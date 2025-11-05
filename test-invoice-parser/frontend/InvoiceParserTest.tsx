import React, { useState } from 'react';

interface LineItem {
  item_number: string;
  description: string;
  quantity: number;
  pack_size: string;
  unit_price: number;
  extended_price: number;
  category?: string;
}

interface ParsedData {
  invoice_number: string;
  invoice_date: string;
  vendor_name: string;
  line_items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

interface Metrics {
  parse_time_seconds: number;
  tokens_used: number | null;
  estimated_cost: number | null;
}

interface ParseResponse {
  success: boolean;
  parsed_data?: ParsedData;
  raw_response?: string;
  metrics: Metrics;
  error?: string;
}

export default function InvoiceParserTest() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/test/parse-invoice', {
        method: 'POST',
        body: formData,
      });

      const data: ParseResponse = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          parse_time_seconds: 0,
          tokens_used: null,
          estimated_cost: null,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Invoice Parser Test Harness</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Test Gemini 1.5 Pro Vision's ability to parse food service invoices
      </p>

      {/* Upload Section */}
      <div style={{ 
        border: '2px dashed #ccc', 
        borderRadius: '8px', 
        padding: '30px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          style={{ marginBottom: '15px' }}
        />
        {file && (
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
        <button
          onClick={handleParse}
          disabled={!file || loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: file && !loading ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: file && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Parsing...' : 'Parse Invoice'}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div>
          {/* Metrics */}
          <div style={{ 
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0 }}>Performance Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div>
                <strong>Parse Time:</strong> {result.metrics.parse_time_seconds}s
              </div>
              <div>
                <strong>Tokens Used:</strong> {result.metrics.tokens_used || 'N/A'}
              </div>
              <div>
                <strong>Est. Cost:</strong> ${result.metrics.estimated_cost?.toFixed(6) || 'N/A'}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {!result.success && (
            <div style={{ 
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '6px',
              padding: '15px',
              marginBottom: '20px',
              color: '#721c24'
            }}>
              <h3 style={{ marginTop: 0 }}>Error</h3>
              <p>{result.error}</p>
            </div>
          )}

          {/* Parsed Data Display */}
          {result.success && result.parsed_data && (
            <div>
              {/* Invoice Metadata */}
              <div style={{ 
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginTop: 0 }}>Invoice Metadata</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div><strong>Invoice #:</strong> {result.parsed_data.invoice_number}</div>
                  <div><strong>Date:</strong> {result.parsed_data.invoice_date}</div>
                  <div><strong>Vendor:</strong> {result.parsed_data.vendor_name}</div>
                  <div><strong>Total:</strong> ${result.parsed_data.total.toFixed(2)}</div>
                  <div><strong>Subtotal:</strong> ${result.parsed_data.subtotal.toFixed(2)}</div>
                  <div><strong>Tax:</strong> ${result.parsed_data.tax.toFixed(2)}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{ marginBottom: '20px' }}>
                <h3>Line Items ({result.parsed_data.line_items.length} items)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={tableHeaderStyle}>Item #</th>
                        <th style={tableHeaderStyle}>Description</th>
                        <th style={tableHeaderStyle}>Qty</th>
                        <th style={tableHeaderStyle}>Pack Size</th>
                        <th style={tableHeaderStyle}>Unit Price</th>
                        <th style={tableHeaderStyle}>Extended</th>
                        <th style={tableHeaderStyle}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.parsed_data.line_items.map((item, idx) => (
                        <tr key={idx} style={{ 
                          borderBottom: '1px solid #dee2e6',
                          backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa'
                        }}>
                          <td style={tableCellStyle}>{item.item_number}</td>
                          <td style={tableCellStyle}>{item.description}</td>
                          <td style={tableCellStyle}>{item.quantity}</td>
                          <td style={tableCellStyle}>{item.pack_size}</td>
                          <td style={tableCellStyle}>${item.unit_price.toFixed(2)}</td>
                          <td style={tableCellStyle}>${item.extended_price.toFixed(2)}</td>
                          <td style={tableCellStyle}>{item.category || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Raw JSON Response */}
          {result.raw_response && (
            <div>
              <h3>Raw JSON Response</h3>
              <pre style={{ 
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '15px',
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '12px'
              }}>
                {result.raw_response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #dee2e6',
  fontWeight: 'bold'
};

const tableCellStyle: React.CSSProperties = {
  padding: '10px 12px'
};
