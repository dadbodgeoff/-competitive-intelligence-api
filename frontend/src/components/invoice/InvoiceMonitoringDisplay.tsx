/**
 * Invoice Monitoring Display
 * Shows real-time performance metrics during invoice processing
 */
import React from 'react';

interface MonitoringMetrics {
  session_id: string;
  filename: string;
  performance: {
    upload_time: number;
    parse_time: number;
    save_time: number;
    inventory_time: number;
    total_time: number;
  };
  data: {
    vendor: string;
    invoice_number: string;
    total: number;
    line_items: number;
    invoice_id: string;
  };
  inventory: {
    items_created: number;
    items_updated: number;
    fuzzy_matches: number;
    exact_matches: number;
  };
  cost: {
    gemini_api: number;
    tokens: number;
  };
  errors: Array<{ phase: string; error: string; timestamp: string }>;
  warnings: Array<{ phase: string; warning: string; timestamp: string }>;
}

interface Props {
  metrics: MonitoringMetrics | null;
  show: boolean;
}

export const InvoiceMonitoringDisplay: React.FC<Props> = ({ metrics, show }) => {
  if (!show || !metrics) return null;

  const { performance, data, inventory, errors, warnings } = metrics;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          📊 Processing Metrics
        </h3>
        <span className="text-xs text-gray-500">
          {performance.total_time.toFixed(1)}s total
        </span>
      </div>

      {/* Performance Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="text-xs">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Upload</span>
            <span className="font-mono text-gray-900">
              {performance.upload_time.toFixed(2)}s
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{
                width: `${(performance.upload_time / performance.total_time) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="text-xs">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Processing</span>
            <span className="font-mono text-gray-900">
              {performance.parse_time.toFixed(2)}s
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-purple-500 h-1.5 rounded-full"
              style={{
                width: `${(performance.parse_time / performance.total_time) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="text-xs">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Save</span>
            <span className="font-mono text-gray-900">
              {performance.save_time.toFixed(2)}s
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{
                width: `${(performance.save_time / performance.total_time) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="text-xs">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Inventory</span>
            <span className="font-mono text-gray-900">
              {performance.inventory_time.toFixed(2)}s
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{
                width: `${(performance.inventory_time / performance.total_time) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Invoice Data */}
      <div className="border-t border-gray-200 pt-3 mb-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Invoice Data</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Vendor:</span>
            <span className="font-medium text-gray-900">{data.vendor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Invoice #:</span>
            <span className="font-medium text-gray-900">{data.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium text-gray-900">
              ${data.total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Line Items:</span>
            <span className="font-medium text-gray-900">{data.line_items}</span>
          </div>
        </div>
      </div>

      {/* Inventory Impact */}
      <div className="border-t border-gray-200 pt-3 mb-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">
          Inventory Impact
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-green-50 rounded p-2">
            <div className="text-green-600 font-medium">
              {inventory.items_created}
            </div>
            <div className="text-gray-600">New Items</div>
          </div>
          <div className="bg-blue-50 rounded p-2">
            <div className="text-blue-600 font-medium">
              {inventory.items_updated}
            </div>
            <div className="text-gray-600">Updated</div>
          </div>
          <div className="bg-purple-50 rounded p-2">
            <div className="text-purple-600 font-medium">
              {inventory.fuzzy_matches}
            </div>
            <div className="text-gray-600">Fuzzy Matched</div>
          </div>
          <div className="bg-indigo-50 rounded p-2">
            <div className="text-indigo-600 font-medium">
              {inventory.exact_matches}
            </div>
            <div className="text-gray-600">Exact Matched</div>
          </div>
        </div>
      </div>



      {/* Errors & Warnings */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="border-t border-gray-200 pt-3">
          {errors.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs font-semibold text-red-700 mb-1">
                ❌ Errors ({errors.length})
              </h4>
              <div className="space-y-1">
                {errors.map((error, idx) => (
                  <div key={idx} className="text-xs text-red-600 bg-red-50 rounded p-2">
                    <div className="font-medium">{error.phase}</div>
                    <div>{error.error}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {warnings.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-yellow-700 mb-1">
                ⚠️ Warnings ({warnings.length})
              </h4>
              <div className="space-y-1">
                {warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-yellow-600 bg-yellow-50 rounded p-2"
                  >
                    <div className="font-medium">{warning.phase}</div>
                    <div>{warning.warning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session ID */}
      <div className="border-t border-gray-200 pt-2 mt-3">
        <div className="text-xs text-gray-500">
          Session: {metrics.session_id}
        </div>
      </div>
    </div>
  );
};
