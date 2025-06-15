import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';
import performanceMonitor from '../../../services/performanceMonitor';

const PerformanceAnalytics = () => {
  const { supabase } = useSupabase();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [performanceData, setPerformanceData] = useState({
    overview: {},
    pagePerformance: [],
    apiPerformance: [],
    errors: [],
    userSessions: []
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'pages', label: 'Page Performance', icon: 'Monitor' },
    { id: 'api', label: 'API Performance', icon: 'Zap' },
    { id: 'errors', label: 'Error Tracking', icon: 'AlertTriangle' },
    { id: 'users', label: 'User Analytics', icon: 'Users' },
    { id: 'real-time', label: 'Real-time', icon: 'Activity' }
  ];

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  useEffect(() => {
    loadPerformanceData();
  }, [activeTab, timeRange]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const endTime = new Date();
      const startTime = new Date();
      
      // Calculate start time based on selected range
      switch (timeRange) {
        case '1h':
          startTime.setHours(startTime.getHours() - 1);
          break;
        case '24h':
          startTime.setDate(startTime.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(startTime.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(startTime.getDate() - 30);
          break;
      }

      if (activeTab === 'overview' || activeTab === 'pages') {
        await loadPagePerformanceData(startTime, endTime);
      }
      if (activeTab === 'overview' || activeTab === 'api') {
        await loadApiPerformanceData(startTime, endTime);
      }
      if (activeTab === 'overview' || activeTab === 'errors') {
        await loadErrorData(startTime, endTime);
      }
      if (activeTab === 'users') {
        await loadUserAnalytics(startTime, endTime);
      }
      
      await loadOverviewData(startTime, endTime);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPagePerformanceData = async (startTime, endTime) => {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('metric_type', 'page_load')
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      setPerformanceData(prev => ({ ...prev, pagePerformance: data || [] }));
    } catch (error) {
      console.error('Error loading page performance data:', error);
    }
  };

  const loadApiPerformanceData = async (startTime, endTime) => {
    try {
      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('metrics')
        .gte('updated_at', startTime.toISOString())
        .lte('updated_at', endTime.toISOString());

      if (error) throw error;

      // Process API performance data from sessions
      const apiData = [];
      data?.forEach(session => {
        const apiCalls = session.metrics?.api_calls || {};
        Object.entries(apiCalls).forEach(([endpoint, metrics]) => {
          apiData.push({
            endpoint,
            ...metrics,
            timestamp: session.updated_at
          });
        });
      });

      setPerformanceData(prev => ({ ...prev, apiPerformance: apiData }));
    } catch (error) {
      console.error('Error loading API performance data:', error);
    }
  };

  const loadErrorData = async (startTime, endTime) => {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      setPerformanceData(prev => ({ ...prev, errors: data || [] }));
    } catch (error) {
      console.error('Error loading error data:', error);
    }
  };

  const loadUserAnalytics = async (startTime, endTime) => {
    try {
      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('updated_at', startTime.toISOString())
        .lte('updated_at', endTime.toISOString())
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setPerformanceData(prev => ({ ...prev, userSessions: data || [] }));
    } catch (error) {
      console.error('Error loading user analytics:', error);
    }
  };

  const loadOverviewData = async (startTime, endTime) => {
    try {
      // Calculate overview metrics from loaded data
      const overview = {
        totalPageViews: performanceData.pagePerformance.length,
        averageLoadTime: calculateAverageLoadTime(),
        totalErrors: performanceData.errors.length,
        uniqueUsers: new Set(performanceData.userSessions.map(s => s.user_id)).size,
        apiCallsTotal: performanceData.apiPerformance.reduce((sum, api) => sum + (api.total_calls || 0), 0),
        averageApiResponseTime: calculateAverageApiTime()
      };

      setPerformanceData(prev => ({ ...prev, overview }));
    } catch (error) {
      console.error('Error calculating overview data:', error);
    }
  };

  const calculateAverageLoadTime = () => {
    if (performanceData.pagePerformance.length === 0) return 0;
    const total = performanceData.pagePerformance.reduce((sum, page) => {
      return sum + (page.data?.load_time || 0);
    }, 0);
    return Math.round(total / performanceData.pagePerformance.length);
  };

  const calculateAverageApiTime = () => {
    if (performanceData.apiPerformance.length === 0) return 0;
    const total = performanceData.apiPerformance.reduce((sum, api) => {
      return sum + (api.avg_duration || 0);
    }, 0);
    return Math.round(total / performanceData.apiPerformance.length);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Page Views"
          value={performanceData.overview.totalPageViews || 0}
          icon="Monitor"
          color="text-blue-500"
        />
        <MetricCard
          title="Avg Load Time"
          value={`${performanceData.overview.averageLoadTime || 0}ms`}
          icon="Clock"
          color="text-green-500"
        />
        <MetricCard
          title="API Calls"
          value={performanceData.overview.apiCallsTotal || 0}
          icon="Zap"
          color="text-purple-500"
        />
        <MetricCard
          title="Avg API Time"
          value={`${performanceData.overview.averageApiResponseTime || 0}ms`}
          icon="Timer"
          color="text-orange-500"
        />
        <MetricCard
          title="Errors"
          value={performanceData.overview.totalErrors || 0}
          icon="AlertTriangle"
          color="text-red-500"
        />
        <MetricCard
          title="Active Users"
          value={performanceData.overview.uniqueUsers || 0}
          icon="Users"
          color="text-indigo-500"
        />
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart
          title="Page Load Times"
          data={performanceData.pagePerformance}
          metric="load_time"
        />
        <ErrorChart
          title="Error Rate"
          data={performanceData.errors}
        />
      </div>

      {/* Current Session Info */}
      <CurrentSessionCard />
    </div>
  );

  const renderPagesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Page Performance</h3>
        <button className="btn-outline flex items-center space-x-2">
          <Icon name="RefreshCw" size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <PagePerformanceTable data={performanceData.pagePerformance} />
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">API Performance</h3>
        <button className="btn-outline flex items-center space-x-2">
          <Icon name="RefreshCw" size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <ApiPerformanceTable data={performanceData.apiPerformance} />
    </div>
  );

  const renderErrorsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Error Tracking</h3>
        <button className="btn-outline flex items-center space-x-2">
          <Icon name="Download" size={16} />
          <span>Export Errors</span>
        </button>
      </div>

      <ErrorTrackingTable data={performanceData.errors} />
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">User Analytics</h3>
      <UserAnalyticsTable data={performanceData.userSessions} />
    </div>
  );

  const renderRealTimeTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Real-time Monitoring</h3>
      <RealTimeMonitor />
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'pages':
        return renderPagesTab();
      case 'api':
        return renderApiTab();
      case 'errors':
        return renderErrorsTab();
      case 'users':
        return renderUsersTab();
      case 'real-time':
        return renderRealTimeTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Performance Analytics</h2>
          <p className="text-text-secondary">Monitor application performance and user experience</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-input"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={loadPerformanceData}
            className="btn-primary flex items-center space-x-2"
          >
            <Icon name="RefreshCw" size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

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
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon, color }) => (
  <div className="bg-background border border-border rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
      <Icon name={icon} size={24} className={color} />
    </div>
  </div>
);

// Performance Chart Component
const PerformanceChart = ({ title, data, metric }) => (
  <div className="bg-background border border-border rounded-lg p-6">
    <h4 className="text-lg font-semibold text-text-primary mb-4">{title}</h4>
    <div className="h-64 flex items-center justify-center text-text-secondary">
      <div className="text-center">
        <Icon name="BarChart3" size={48} className="mx-auto mb-2" />
        <p>Chart visualization would appear here</p>
        <p className="text-sm">({data.length} data points)</p>
      </div>
    </div>
  </div>
);

// Error Chart Component
const ErrorChart = ({ title, data }) => (
  <div className="bg-background border border-border rounded-lg p-6">
    <h4 className="text-lg font-semibold text-text-primary mb-4">{title}</h4>
    <div className="h-64 flex items-center justify-center text-text-secondary">
      <div className="text-center">
        <Icon name="AlertTriangle" size={48} className="mx-auto mb-2" />
        <p>Error trend chart would appear here</p>
        <p className="text-sm">({data.length} errors tracked)</p>
      </div>
    </div>
  </div>
);

// Page Performance Table
const PagePerformanceTable = ({ data }) => (
  <div className="bg-background border border-border rounded-lg p-6">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Page</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Load Time</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">First Paint</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">DOM Ready</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((page, index) => (
            <tr key={index} className="border-b border-border hover:bg-background/50">
              <td className="py-3 px-4 text-sm text-text-primary">{page.data?.page_url || 'Unknown'}</td>
              <td className="py-3 px-4 text-sm text-text-primary">{Math.round(page.data?.load_time || 0)}ms</td>
              <td className="py-3 px-4 text-sm text-text-primary">{Math.round(page.data?.first_paint || 0)}ms</td>
              <td className="py-3 px-4 text-sm text-text-primary">{Math.round(page.data?.dom_content_loaded || 0)}ms</td>
              <td className="py-3 px-4 text-sm text-text-secondary">{new Date(page.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// API Performance Table
const ApiPerformanceTable = ({ data }) => (
  <div className="bg-background border border-border rounded-lg p-6">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Endpoint</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Calls</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Avg Duration</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Success Rate</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Error Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((api, index) => (
            <tr key={index} className="border-b border-border hover:bg-background/50">
              <td className="py-3 px-4 text-sm text-text-primary">{api.endpoint}</td>
              <td className="py-3 px-4 text-sm text-text-primary">{api.total_calls || 0}</td>
              <td className="py-3 px-4 text-sm text-text-primary">{Math.round(api.avg_duration || 0)}ms</td>
              <td className="py-3 px-4 text-sm text-success">{((api.success_rate || 0) * 100).toFixed(1)}%</td>
              <td className="py-3 px-4 text-sm text-error">{((api.error_rate || 0) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Error Tracking Table
const ErrorTrackingTable = ({ data }) => (
  <div className="bg-background border border-border rounded-lg p-6">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Error Type</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Message</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Page</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">User</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((error, index) => (
            <tr key={index} className="border-b border-border hover:bg-background/50">
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-error/10 text-error rounded-full text-xs font-medium">
                  {error.error_type}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-text-primary max-w-xs truncate">
                {error.error_data?.message || 'No message'}
              </td>
              <td className="py-3 px-4 text-sm text-text-primary">
                {error.error_data?.page_url || 'Unknown'}
              </td>
              <td className="py-3 px-4 text-sm text-text-primary">
                {error.user_id ? 'User' : 'Anonymous'}
              </td>
              <td className="py-3 px-4 text-sm text-text-secondary">
                {new Date(error.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// User Analytics Table
const UserAnalyticsTable = ({ data }) => (
  <div className="bg-background border border-border rounded-lg p-6">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Session</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">User</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Duration</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Page Views</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">API Calls</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((session, index) => (
            <tr key={index} className="border-b border-border hover:bg-background/50">
              <td className="py-3 px-4 text-sm text-text-primary font-mono">
                {session.session_id?.substr(0, 8)}...
              </td>
              <td className="py-3 px-4 text-sm text-text-primary">
                {session.user_id ? 'User' : 'Anonymous'}
              </td>
              <td className="py-3 px-4 text-sm text-text-primary">
                {Math.round((session.metrics?.session_duration || 0) / 1000)}s
              </td>
              <td className="py-3 px-4 text-sm text-text-primary">
                {Object.keys(session.metrics?.page_views || {}).length}
              </td>
              <td className="py-3 px-4 text-sm text-text-primary">
                {Object.values(session.metrics?.api_calls || {}).reduce((sum, api) => sum + (api.total_calls || 0), 0)}
              </td>
              <td className="py-3 px-4 text-sm text-text-secondary">
                {new Date(session.updated_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Current Session Card
const CurrentSessionCard = () => {
  const [currentMetrics, setCurrentMetrics] = useState({});

  useEffect(() => {
    const updateMetrics = () => {
      setCurrentMetrics(performanceMonitor.getCurrentMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h4 className="text-lg font-semibold text-text-primary mb-4">Current Session</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <p className="text-sm text-text-secondary">Session Duration</p>
          <p className="text-lg font-semibold text-text-primary">
            {Math.round((currentMetrics.sessionDuration || 0) / 1000)}s
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">Page Views</p>
          <p className="text-lg font-semibold text-text-primary">{currentMetrics.pageViews || 0}</p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">User Actions</p>
          <p className="text-lg font-semibold text-text-primary">{currentMetrics.userActions || 0}</p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">API Calls</p>
          <p className="text-lg font-semibold text-text-primary">{currentMetrics.apiCalls || 0}</p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">Errors</p>
          <p className="text-lg font-semibold text-error">{currentMetrics.errors || 0}</p>
        </div>
      </div>
    </div>
  );
};

// Real-time Monitor
const RealTimeMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState({
    activeUsers: 0,
    requestsPerMinute: 0,
    errorRate: 0,
    averageResponseTime: 0
  });

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate real-time metrics
      setLiveMetrics({
        activeUsers: Math.floor(Math.random() * 50) + 100,
        requestsPerMinute: Math.floor(Math.random() * 200) + 300,
        errorRate: Math.random() * 2,
        averageResponseTime: Math.floor(Math.random() * 100) + 150
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-success animate-pulse' : 'bg-error'}`}></div>
          <span className="font-medium text-text-primary">
            {isMonitoring ? 'Live Monitoring Active' : 'Monitoring Paused'}
          </span>
        </div>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`btn-outline ${isMonitoring ? 'text-error' : 'text-success'}`}
        >
          {isMonitoring ? 'Pause' : 'Resume'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">{liveMetrics.activeUsers}</div>
          <div className="text-sm text-text-secondary">Active Users</div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success">{liveMetrics.requestsPerMinute}</div>
          <div className="text-sm text-text-secondary">Requests/min</div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-error">{liveMetrics.errorRate.toFixed(2)}%</div>
          <div className="text-sm text-text-secondary">Error Rate</div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-warning">{liveMetrics.averageResponseTime}ms</div>
          <div className="text-sm text-text-secondary">Avg Response</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
