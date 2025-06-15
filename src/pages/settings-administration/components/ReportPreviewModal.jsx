import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { reportGenerator } from '../../../services/reportGenerator';

const ReportPreviewModal = ({ isOpen, onClose, reportType, filters }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && reportType) {
      generatePreview();
    }
  }, [isOpen, reportType, filters]);

  const generatePreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportGenerator.generateHTMLReport(reportType, filters);
      setReportData(result);
    } catch (err) {
      console.error('Error generating report preview:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (reportData) {
      reportGenerator.downloadHTMLReport(reportData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Report Preview</h3>
            <p className="text-sm text-text-secondary">
              {reportData?.title || 'Loading report...'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {reportData && (
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center space-x-2"
              >
                <Icon name="Download" size={16} />
                <span>Download HTML</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-text-secondary">Generating report preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
                <h4 className="text-lg font-medium text-text-primary mb-2">Error Generating Report</h4>
                <p className="text-text-secondary">{error}</p>
                <button
                  onClick={generatePreview}
                  className="btn-outline mt-4"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {reportData && !loading && !error && (
            <div className="h-full overflow-auto p-6">
              <div 
                className="bg-white rounded-lg shadow-sm border border-border"
                dangerouslySetInnerHTML={{ __html: reportData.html }}
                style={{
                  minHeight: '800px',
                  transform: 'scale(0.85)',
                  transformOrigin: 'top left',
                  width: '117.6%' // Compensate for the scale
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-background/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              {reportData && (
                <>
                  Report generated with {Object.keys(reportData.data).length} data sections
                </>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="btn-outline"
              >
                Close
              </button>
              {reportData && (
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Icon name="Download" size={16} />
                  <span>Download Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
