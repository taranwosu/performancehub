import { supabase } from '../lib/supabaseClient';

class PerformanceMonitor {
  constructor() {
    this.isEnabled = true;
    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    this.metrics = {
      pageViews: new Map(),
      apiCalls: new Map(),
      userActions: new Map(),
      errors: []
    };
    
    this.initializeMonitoring();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeMonitoring() {
    if (!this.isEnabled) return;

    // Monitor page performance
    this.trackPagePerformance();
    
    // Monitor user interactions
    this.trackUserInteractions();
    
    // Monitor errors
    this.trackErrors();
    
    // Monitor network requests
    this.trackNetworkRequests();
    
    // Send metrics periodically
    setInterval(() => this.sendMetrics(), 30000); // Every 30 seconds
    
    // Send metrics before page unload
    window.addEventListener('beforeunload', () => this.sendMetrics());
  }

  // Track page load performance
  trackPagePerformance() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
          page_url: window.location.pathname,
          load_time: navigation.loadEventEnd - navigation.loadEventStart,
          dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp_connection: navigation.connectEnd - navigation.connectStart,
          request_response: navigation.responseEnd - navigation.requestStart,
          session_id: this.sessionId,
          timestamp: new Date().toISOString()
        };

        this.logPerformanceMetric('page_load', metrics);
      }, 100);
    });
  }

  // Track user interactions
  trackUserInteractions() {
    const events = ['click', 'scroll', 'keydown', 'resize'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.trackUserAction(eventType, {
          target: event.target.tagName,
          timestamp: Date.now(),
          page: window.location.pathname
        });
      }, { passive: true });
    });
  }

  // Track JavaScript errors
  trackErrors() {
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        line_number: event.lineno,
        column_number: event.colno,
        stack: event.error?.stack,
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise_rejection', {
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        page_url: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Monitor network requests
  trackNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.trackApiCall(url, {
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          success: response.ok,
          timestamp: new Date().toISOString()
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.trackApiCall(url, {
          method: args[1]?.method || 'GET',
          status: 0,
          duration: endTime - startTime,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      }
    };
  }

  // Track custom business events
  trackBusinessEvent(eventName, properties = {}) {
    this.logPerformanceMetric('business_event', {
      event_name: eventName,
      properties: properties,
      page_url: window.location.pathname,
      session_id: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  // Track user actions
  trackUserAction(action, properties = {}) {
    const key = `${action}_${properties.page}`;
    const current = this.metrics.userActions.get(key) || 0;
    this.metrics.userActions.set(key, current + 1);
  }

  // Track API calls
  trackApiCall(url, metrics) {
    if (url.includes('/rest/v1/') || url.includes('supabase')) {
      const key = this.extractApiEndpoint(url);
      const calls = this.metrics.apiCalls.get(key) || [];
      calls.push(metrics);
      this.metrics.apiCalls.set(key, calls);
    }
  }

  extractApiEndpoint(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').slice(0, 3).join('/');
    } catch {
      return url;
    }
  }

  // Track errors
  trackError(errorType, errorData) {
    this.metrics.errors.push({
      type: errorType,
      ...errorData,
      session_id: this.sessionId
    });

    // Send critical errors immediately
    if (errorType === 'javascript_error') {
      this.sendErrorImmediately(errorData);
    }
  }

  // Log performance metrics
  async logPerformanceMetric(metricType, data) {
    try {
      await supabase.from('performance_metrics').insert({
        metric_type: metricType,
        data: data,
        session_id: this.sessionId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to log performance metric:', error);
    }
  }

  // Send accumulated metrics
  async sendMetrics() {
    if (!this.isEnabled) return;

    try {
      const user = await supabase.auth.getUser();
      
      // Prepare metrics payload
      const metricsPayload = {
        session_id: this.sessionId,
        user_id: user.data.user?.id,
        page_views: Object.fromEntries(this.metrics.pageViews),
        user_actions: Object.fromEntries(this.metrics.userActions),
        api_calls: this.processApiCallMetrics(),
        errors: this.metrics.errors,
        session_duration: performance.now() - this.startTime,
        timestamp: new Date().toISOString()
      };

      // Send to database
      await supabase.from('analytics_sessions').upsert({
        session_id: this.sessionId,
        metrics: metricsPayload,
        updated_at: new Date().toISOString()
      });

      // Clear sent metrics
      this.clearMetrics();

    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }

  processApiCallMetrics() {
    const processed = {};
    
    for (const [endpoint, calls] of this.metrics.apiCalls.entries()) {
      processed[endpoint] = {
        total_calls: calls.length,
        avg_duration: calls.reduce((sum, call) => sum + call.duration, 0) / calls.length,
        success_rate: calls.filter(call => call.success).length / calls.length,
        error_rate: calls.filter(call => !call.success).length / calls.length,
        status_codes: calls.reduce((acc, call) => {
          acc[call.status] = (acc[call.status] || 0) + 1;
          return acc;
        }, {})
      };
    }
    
    return processed;
  }

  clearMetrics() {
    this.metrics.userActions.clear();
    this.metrics.apiCalls.clear();
    this.metrics.errors = [];
  }

  // Send critical errors immediately
  async sendErrorImmediately(errorData) {
    try {
      await supabase.from('error_logs').insert({
        error_type: 'javascript_error',
        error_data: errorData,
        session_id: this.sessionId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to send error immediately:', error);
    }
  }

  // Get current session metrics
  getCurrentMetrics() {
    return {
      sessionId: this.sessionId,
      sessionDuration: performance.now() - this.startTime,
      pageViews: this.metrics.pageViews.size,
      userActions: Array.from(this.metrics.userActions.values()).reduce((a, b) => a + b, 0),
      apiCalls: Array.from(this.metrics.apiCalls.values()).flat().length,
      errors: this.metrics.errors.length
    };
  }

  // Performance timing helpers
  markStart(name) {
    performance.mark(`${name}-start`);
  }

  markEnd(name) {
    performance.mark(`${name}-end`);
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name)[0];
      
      this.logPerformanceMetric('custom_timing', {
        name: name,
        duration: measure.duration,
        timestamp: new Date().toISOString()
      });
      
      // Clean up marks
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    } catch (error) {
      console.warn('Failed to measure performance:', error);
    }
  }

  // Resource monitoring
  getResourceMetrics() {
    const resources = performance.getEntriesByType('resource');
    const scripts = resources.filter(r => r.initiatorType === 'script');
    const stylesheets = resources.filter(r => r.initiatorType === 'css');
    const images = resources.filter(r => r.initiatorType === 'img');
    
    return {
      total_resources: resources.length,
      scripts: {
        count: scripts.length,
        total_size: scripts.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        avg_duration: scripts.reduce((sum, r) => sum + r.duration, 0) / scripts.length
      },
      stylesheets: {
        count: stylesheets.length,
        total_size: stylesheets.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        avg_duration: stylesheets.reduce((sum, r) => sum + r.duration, 0) / stylesheets.length
      },
      images: {
        count: images.length,
        total_size: images.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        avg_duration: images.reduce((sum, r) => sum + r.duration, 0) / images.length
      }
    };
  }

  // Memory usage monitoring
  getMemoryMetrics() {
    if (performance.memory) {
      return {
        used_js_heap_size: performance.memory.usedJSHeapSize,
        total_js_heap_size: performance.memory.totalJSHeapSize,
        js_heap_size_limit: performance.memory.jsHeapSizeLimit,
        memory_usage_percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  // Enable/disable monitoring
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Get web vitals
  getWebVitals() {
    return new Promise((resolve) => {
      const vitals = {};
      
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.lcp = entries[entries.length - 1].startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.fid = entries[0].processingStart - entries[0].startTime;
      }).observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        vitals.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
      
      setTimeout(() => resolve(vitals), 1000);
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
