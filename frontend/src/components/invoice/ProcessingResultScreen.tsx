/**
 * Final status screen after invoice processing
 * Shows success or partial success with failed items
 */
import React from 'react';
import { SaveResult } from '../../hooks/useSaveStream';
import { useNavigate } from 'react-router-dom';

interface Props {
  result: SaveResult;
  onClose: () => void;
  onRetryFailed?: () => void;
}

export const ProcessingResultScreen: React.FC<Props> = ({
  result,
  onClose,
}) => {
  const navigate = useNavigate();

  const isSuccess = result.status === 'success';
  const hasFailures = result.failed_items && result.failed_items.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className={`p-6 ${isSuccess ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">
                {isSuccess ? '✅' : '⚠️'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isSuccess
                    ? 'Invoice Processed Successfully!'
                    : 'Invoice Saved - Action Required'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isSuccess
                    ? `All ${result.items_processed} items added to inventory`
                    : `${result.items_processed} of ${result.items_processed + result.items_failed} items processed`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Summary */}
          {isSuccess && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Items Processed</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.items_processed}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Invoice ID</div>
                  <div className="text-sm font-mono text-gray-900 truncate">
                    {result.invoice_id.slice(0, 8)}...
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => navigate(`/invoices/${result.invoice_id}`)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Invoice
                </button>
                <button
                  onClick={() => navigate('/inventory')}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  View Inventory
                </button>
              </div>
            </div>
          )}

          {/* Partial Success with Failed Items */}
          {hasFailures && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  {result.items_failed} {result.items_failed === 1 ? 'item needs' : 'items need'} your attention
                </h3>
                <p className="text-sm text-yellow-800">
                  These items couldn't be processed automatically. Please review and fix the issues below.
                </p>
              </div>

              {/* Failed Items List */}
              <div className="space-y-3">
                {result.failed_items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          Line {item.line}: {item.description}
                        </div>
                        {item.pack_size && (
                          <div className="text-sm text-gray-600">
                            Pack Size: <span className="font-mono">{item.pack_size}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {item.error_type}
                      </span>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-2">
                      <p className="text-sm text-red-800">
                        <strong>Issue:</strong> {item.error}
                      </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                      <p className="text-sm text-blue-800">
                        <strong>How to fix:</strong> {item.action_required}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => navigate(`/invoices/${result.invoice_id}`)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Fix Items in Invoice
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with metrics */}
        {result.metrics && (
          <div className="bg-gray-50 px-6 py-4 border-t text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Processing time: {result.metrics.performance?.total_time?.toFixed(1)}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
