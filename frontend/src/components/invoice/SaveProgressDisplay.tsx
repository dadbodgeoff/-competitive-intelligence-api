/**
 * Displays real-time progress during invoice save and processing
 */
import React from 'react';
import { SaveProgress } from '../../hooks/useSaveStream';

interface Props {
  progress: SaveProgress;
}

export const SaveProgressDisplay: React.FC<Props> = ({ progress }) => {
  const getPhaseIcon = () => {
    switch (progress.phase) {
      case 'saving':
        return '💾';
      case 'inventory':
        return '📦';
      case 'verification':
        return '✓';
      case 'complete':
        return '🎉';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    if (progress.itemStatus === 'success') return 'text-green-600';
    if (progress.itemStatus === 'failed') return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">
            {getPhaseIcon()}
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 ${getStatusColor()}`}>
            {progress.message}
          </h3>

          {progress.currentItem && progress.totalItems && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{progress.currentItem} / {progress.totalItems}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.currentItem / progress.totalItems) * 100}%`,
                  }}
                />
              </div>
              {progress.itemDescription && (
                <p className="text-xs text-gray-500 mt-2 truncate">
                  {progress.itemDescription}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">
            Please wait while we process your invoice...
          </p>
        </div>
      </div>
    </div>
  );
};
