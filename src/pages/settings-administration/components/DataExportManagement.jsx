import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';
import { exportService } from '../../../services/exportService';
import { reportGenerator } from '../../../services/reportGenerator';
import ReportPreviewModal from './ReportPreviewModal';

const DataExportManagement = () => {
  const { supabase } = useSupabase();
  const [activeTab, setActiveTab] = useState('quick-export');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [exportProgress, setExportProgress] = useState(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [reportFilters, setReportFilters] = useState({});

  const tabs = [
    { id: 'quick-export', label: 'Quick Export', icon: 'Download' },
    { id: 'custom-reports', label: 'Custom Reports', icon: 'FileBarChart' },
    { id: 'scheduled-reports', label: 'Scheduled Reports', icon: 'Clock' },
    { id: 'export-history', label: 'Export History', icon: 'History' }
  ];

  const exportTypes = [
    {
      id: 'users',
      title: 'Users Data',
      description: 'Export all user profiles, roles, and contact information',
      icon: 'Users',
      color: 'bg-blue-500'
    },
    {
      id: 'goals',
      title: 'Goals Data',
      description: 'Export goals, progress, and assignments',
      icon: 'Target',
      color: 'bg-green-500'
    },
    {
      id: 'reviews',
      title: 'Performance Reviews',
      description: 'Export review data, ratings, and feedback',
      icon: 'FileText',
      color: 'bg-purple-500'
    },
    {
      id: 'feedback',
      title: 'Feedback Data',
      description: 'Export feedback and ratings data',
      icon: 'MessageSquare',
      color: 'bg-orange-500'
    },
    {
      id: 'analytics',
      title: 'Analytics Report',
      description: 'Export performance analytics and KPIs',
      icon: 'BarChart3',
      color: 'bg-red-500'
    },
    {
      id: 'professional-reports',
      title: 'Professional Reports',
      description: 'Generate comprehensive HTML reports with charts and analytics',
      icon: 'FileText',
      color: 'bg-indigo-500'
    }
  ];

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('department')
        .not('department', 'is', null);

      if (error) throw error;

      const uniqueDepartments = [...new Set(data.map(item => item.department))].filter(Boolean);
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleQuickExport = async (exportType, format = 'csv') => {
    setLoading(true);
    setExportProgress({ type: exportType, status: 'preparing' });

    try {
      let exportResult;
      
      switch (exportType) {
        case 'users':
          exportResult = await exportService.exportUsers(format);
          break;
        case 'goals':
          exportResult = await exportService.exportGoals(format);
          break;
        case 'reviews':
          exportResult = await exportService.exportPerformanceReviews(format);
          break;
        case 'feedback':
          exportResult = await exportService.exportFeedback(format);
          break;
        case 'analytics':
          exportResult = await exportService.exportAnalytics(format);
          break;
        default:
          throw new Error('Invalid export type');
      }

      setExportProgress({ type: exportType, status: 'downloading' });
      
      // Download the file
      exportService.downloadFile(exportResult);
      
      setExportProgress({ type: exportType, status: 'completed' });
      
      // Clear progress after 2 seconds
      setTimeout(() => setExportProgress(null), 2000);

    } catch (error) {
      console.error('Export error:', error);
      setExportProgress({ type: exportType, status: 'error', error: error.message });
      setTimeout(() => setExportProgress(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const renderQuickExportTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Quick Data Export</h3>
        <p className="text-sm text-text-secondary">
          Instantly export your data in various formats. Choose from the options below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportTypes.map((exportType) => (
          <div key={exportType.id} className="bg-background border border-border rounded-lg p-6 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-start space-x-4">
              <div className={`${exportType.color} p-3 rounded-lg`}>
                <Icon name={exportType.icon} size={24} className="text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary mb-2">{exportType.title}</h4>
                <p className="text-sm text-text-secondary mb-4">{exportType.description}</p>
                
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleQuickExport(exportType.id, 'csv')}
                      disabled={loading && exportProgress?.type === exportType.id}
                      className="btn-outline text-xs py-1 px-3 flex items-center space-x-1"
                    >
                      <Icon name="FileSpreadsheet" size={12} />
                      <span>CSV</span>
                    </button>
                    
                    <button
                      onClick={() => handleQuickExport(exportType.id, 'json')}
                      disabled={loading && exportProgress?.type === exportType.id}
                      className="btn-outline text-xs py-1 px-3 flex items-center space-x-1"
                    >
                      <Icon name="FileCode" size={12} />
                      <span>JSON</span>
                    </button>
                  </div>

                  {exportProgress?.type === exportType.id && (
                    <div className="flex items-center space-x-2 text-xs">
                      {exportProgress.status === 'preparing' && (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                          <span className="text-text-secondary">Preparing export...</span>
                        </>
                      )}
                      {exportProgress.status === 'downloading' && (
                        <>
                          <Icon name="Download" size={12} className="text-success" />
                          <span className="text-success">Downloading...</span>
                        </>
                      )}
                      {exportProgress.status === 'completed' && (
                        <>
                          <Icon name="CheckCircle" size={12} className="text-success" />
                          <span className="text-success">Export completed!</span>
                        </>
                      )}
                      {exportProgress.status === 'error' && (
                        <>
                          <Icon name="XCircle" size={12} className="text-error" />
                          <span className="text-error">Export failed</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Statistics */}
      <div className="bg-background border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Export Statistics</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">12</div>
            <div className="text-sm text-text-secondary">Total Exports Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">1.2MB</div>
            <div className="text-sm text-text-secondary">Data Exported</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">CSV</div>
            <div className="text-sm text-text-secondary">Most Popular Format</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">Users</div>
            <div className="text-sm text-text-secondary">Most Exported Data</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomReportsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Custom Report Builder</h3>
        <p className="text-sm text-text-secondary">
          Create custom reports with specific filters and data selections.
        </p>
      </div>

      <CustomReportBuilder departments={departments} onExport={handleQuickExport} />
    </div>
  );

  const renderScheduledReportsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Scheduled Reports</h3>
          <p className="text-sm text-text-secondary">
            Set up automated reports to be generated and emailed on a schedule.
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Icon name="Plus" size={16} />
          <span>New Schedule</span>
        </button>
      </div>

      <ScheduledReportsList />
    </div>
  );

  const renderExportHistoryTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Export History</h3>
        <p className="text-sm text-text-secondary">
          View and manage your previous data exports.
        </p>
      </div>

      <ExportHistoryList />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'quick-export':
        return renderQuickExportTab();
      case 'custom-reports':
        return renderCustomReportsTab();
      case 'scheduled-reports':
        return renderScheduledReportsTab();
      case 'export-history':
        return renderExportHistoryTab();
      default:
        return renderQuickExportTab();
    }
  };

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Report Preview Modal */}
      {showReportPreview && (
        <ReportPreviewModal
          isOpen={showReportPreview}
          onClose={() => {
            setShowReportPreview(false);
            setSelectedReportType(null);
            setReportFilters({});
          }}
          reportType={selectedReportType}
          filters={reportFilters}
        />
      )}
    </div>
  );
};

// Custom Report Builder Component
const CustomReportBuilder = ({ departments, onExport }) => {
  const [reportConfig, setReportConfig] = useState({
    dataType: 'users',
    format: 'csv',
    filters: {
      department: 'all',
      role: 'all',
      status: 'all',
      dateRange: {
        start: '',
        end: ''
      }
    },
    columns: []
  });

  const dataTypeOptions = [
    { value: 'users', label: 'Users' },
    { value: 'goals', label: 'Goals' },
    { value: 'reviews', label: 'Performance Reviews' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'analytics', label: 'Analytics' }
  ];

  const handleGenerateReport = () => {
    onExport(reportConfig.dataType, reportConfig.format);
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Data Type</label>
          <select
            value={reportConfig.dataType}
            onChange={(e) => setReportConfig(prev => ({ ...prev, dataType: e.target.value }))}
            className="form-input"
          >
            {dataTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Export Format</label>
          <select
            value={reportConfig.format}
            onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
            className="form-input"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Department Filter</label>
          <select
            value={reportConfig.filters.department}
            onChange={(e) => setReportConfig(prev => ({ 
              ...prev, 
              filters: { ...prev.filters, department: e.target.value }
            }))}
            className="form-input"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Status Filter</label>
          <select
            value={reportConfig.filters.status}
            onChange={(e) => setReportConfig(prev => ({ 
              ...prev, 
              filters: { ...prev.filters, status: e.target.value }
            }))}
            className="form-input"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGenerateReport}
          className="btn-primary flex items-center space-x-2"
        >
          <Icon name="Download" size={16} />
          <span>Generate Report</span>
        </button>
      </div>
    </div>
  );
};

// Scheduled Reports List Component
const ScheduledReportsList = () => {
  const scheduledReports = [
    {
      id: 1,
      name: 'Weekly User Report',
      type: 'users',
      schedule: 'Every Monday at 9:00 AM',
      format: 'CSV',
      lastRun: '2024-06-10',
      status: 'active'
    },
    {
      id: 2,
      name: 'Monthly Analytics',
      type: 'analytics',
      schedule: 'First day of month at 8:00 AM',
      format: 'JSON',
      lastRun: '2024-06-01',
      status: 'active'
    }
  ];

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Schedule</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Format</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Last Run</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduledReports.map(report => (
              <tr key={report.id} className="border-b border-border hover:bg-background/50">
                <td className="py-3 px-4 font-medium text-text-primary">{report.name}</td>
                <td className="py-3 px-4 text-sm text-text-primary capitalize">{report.type}</td>
                <td className="py-3 px-4 text-sm text-text-primary">{report.schedule}</td>
                <td className="py-3 px-4 text-sm text-text-primary">{report.format}</td>
                <td className="py-3 px-4 text-sm text-text-secondary">{new Date(report.lastRun).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-text-secondary hover:text-text-primary">
                      <Icon name="Edit" size={14} />
                    </button>
                    <button className="p-1 text-text-secondary hover:text-error">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Export History List Component
const ExportHistoryList = () => {
  const exportHistory = [
    {
      id: 1,
      type: 'users',
      format: 'CSV',
      recordCount: 156,
      size: '2.3 MB',
      exportedBy: 'John Doe',
      exportedAt: '2024-06-15 10:30:00',
      status: 'completed'
    },
    {
      id: 2,
      type: 'goals',
      format: 'JSON',
      recordCount: 89,
      size: '1.8 MB',
      exportedBy: 'Jane Smith',
      exportedAt: '2024-06-15 09:15:00',
      status: 'completed'
    }
  ];

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Format</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Records</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Size</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Exported By</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            {exportHistory.map(export_ => (
              <tr key={export_.id} className="border-b border-border hover:bg-background/50">
                <td className="py-3 px-4 text-sm text-text-primary capitalize">{export_.type}</td>
                <td className="py-3 px-4 text-sm text-text-primary">{export_.format}</td>
                <td className="py-3 px-4 text-sm text-text-primary">{export_.recordCount}</td>
                <td className="py-3 px-4 text-sm text-text-primary">{export_.size}</td>
                <td className="py-3 px-4 text-sm text-text-primary">{export_.exportedBy}</td>
                <td className="py-3 px-4 text-sm text-text-secondary">{new Date(export_.exportedAt).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                    {export_.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataExportManagement;
