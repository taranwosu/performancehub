import { exportService } from './exportService';

class ReportGenerator {
  constructor() {
    this.reportTypes = {
      'user-summary': {
        title: 'User Summary Report',
        description: 'Overview of all users, departments, and roles',
        sections: ['overview', 'users', 'departments']
      },
      'performance-overview': {
        title: 'Performance Overview Report',
        description: 'Goals and reviews performance analysis',
        sections: ['goals', 'reviews', 'analytics']
      },
      'quarterly-review': {
        title: 'Quarterly Performance Review',
        description: 'Comprehensive quarterly performance report',
        sections: ['overview', 'goals', 'reviews', 'feedback', 'analytics']
      },
      'department-report': {
        title: 'Department Performance Report',
        description: 'Department-specific performance analysis',
        sections: ['department-overview', 'goals', 'reviews']
      }
    };
  }

  // Generate a comprehensive HTML report
  async generateHTMLReport(reportType, filters = {}) {
    try {
      const reportConfig = this.reportTypes[reportType];
      if (!reportConfig) {
        throw new Error(`Invalid report type: ${reportType}`);
      }

      const reportData = await this.collectReportData(reportType, filters);
      const htmlContent = this.generateHTMLContent(reportConfig, reportData, filters);

      return {
        title: reportConfig.title,
        html: htmlContent,
        data: reportData
      };
    } catch (error) {
      console.error('Error generating HTML report:', error);
      throw error;
    }
  }

  // Collect all necessary data for the report
  async collectReportData(reportType, filters = {}) {
    const data = {};

    try {
      // Get overview data
      data.overview = await this.getOverviewData(filters);

      // Get users data if needed
      if (this.reportTypes[reportType].sections.includes('users')) {
        data.users = await exportService.exportUsers('json', filters);
        data.usersData = JSON.parse(data.users.data);
      }

      // Get goals data if needed
      if (this.reportTypes[reportType].sections.includes('goals')) {
        data.goals = await exportService.exportGoals('json', filters);
        data.goalsData = JSON.parse(data.goals.data);
      }

      // Get reviews data if needed
      if (this.reportTypes[reportType].sections.includes('reviews')) {
        data.reviews = await exportService.exportPerformanceReviews('json', filters);
        data.reviewsData = JSON.parse(data.reviews.data);
      }

      // Get analytics data if needed
      if (this.reportTypes[reportType].sections.includes('analytics')) {
        data.analytics = await exportService.exportAnalytics('json', filters);
        data.analyticsData = JSON.parse(data.analytics.data);
      }

      return data;
    } catch (error) {
      console.error('Error collecting report data:', error);
      throw error;
    }
  }

  // Get overview/summary data
  async getOverviewData(filters = {}) {
    const dateRange = filters.dateRange || {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    };

    return {
      reportGenerated: new Date().toLocaleString(),
      reportPeriod: {
        start: new Date(dateRange.start).toLocaleDateString(),
        end: new Date(dateRange.end).toLocaleDateString()
      },
      filters: filters
    };
  }

  // Generate HTML content for the report
  generateHTMLContent(reportConfig, reportData, filters) {
    const { title, sections } = reportConfig;
    const { overview } = reportData;

    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8f9fa;
            }
            .report-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 30px;
            }
            .report-title {
                font-size: 2.5em;
                margin: 0 0 10px 0;
                font-weight: 300;
            }
            .report-subtitle {
                font-size: 1.1em;
                opacity: 0.9;
                margin: 0;
            }
            .report-meta {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .section {
                background: white;
                padding: 25px;
                margin-bottom: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .section-title {
                font-size: 1.8em;
                color: #4a5568;
                margin: 0 0 20px 0;
                border-bottom: 3px solid #667eea;
                padding-bottom: 10px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .stat-card {
                text-align: center;
                padding: 20px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                border-radius: 8px;
            }
            .stat-number {
                font-size: 2.5em;
                font-weight: bold;
                margin: 0;
            }
            .stat-label {
                font-size: 0.9em;
                margin: 5px 0 0 0;
                opacity: 0.9;
            }
            .table-container {
                overflow-x: auto;
                margin: 20px 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                background: white;
            }
            th {
                background: #4a5568;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: 600;
            }
            td {
                padding: 12px;
                border-bottom: 1px solid #e2e8f0;
            }
            tr:nth-child(even) {
                background: #f8f9fa;
            }
            .chart-placeholder {
                background: #e2e8f0;
                height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #718096;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                padding: 20px;
                color: #718096;
                border-top: 1px solid #e2e8f0;
                margin-top: 40px;
            }
            @media print {
                body { background: white; }
                .section { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="report-header">
            <h1 class="report-title">${title}</h1>
            <p class="report-subtitle">Generated on ${overview.reportGenerated}</p>
        </div>

        <div class="report-meta">
            <h3>Report Information</h3>
            <p><strong>Report Period:</strong> ${overview.reportPeriod.start} to ${overview.reportPeriod.end}</p>
            <p><strong>Generated By:</strong> PerformanceHub Admin</p>
            ${filters.department && filters.department !== 'all' ? `<p><strong>Department Filter:</strong> ${filters.department}</p>` : ''}
        </div>
    `;

    // Add sections based on report type
    sections.forEach(section => {
      switch (section) {
        case 'overview':
          html += this.generateOverviewSection(reportData);
          break;
        case 'users':
          html += this.generateUsersSection(reportData);
          break;
        case 'goals':
          html += this.generateGoalsSection(reportData);
          break;
        case 'reviews':
          html += this.generateReviewsSection(reportData);
          break;
        case 'analytics':
          html += this.generateAnalyticsSection(reportData);
          break;
        case 'departments':
          html += this.generateDepartmentsSection(reportData);
          break;
      }
    });

    html += `
        <div class="footer">
            <p>This report was generated by PerformanceHub on ${overview.reportGenerated}</p>
            <p>© 2024 PerformanceHub. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;

    return html;
  }

  generateOverviewSection(reportData) {
    const { analyticsData } = reportData;
    
    if (!analyticsData) return '';

    const metrics = analyticsData.reduce((acc, item) => {
      acc[item.Metric] = item.Value;
      return acc;
    }, {});

    return `
    <div class="section">
        <h2 class="section-title">📊 Performance Overview</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${metrics['Total Active Users'] || 0}</div>
                <div class="stat-label">Active Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${metrics['Goals Completion Rate (%)'] || 0}%</div>
                <div class="stat-label">Goal Completion Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${metrics['Total Reviews'] || 0}</div>
                <div class="stat-label">Performance Reviews</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${metrics['Average Review Rating'] || 0}</div>
                <div class="stat-label">Average Review Rating</div>
            </div>
        </div>
    </div>
    `;
  }

  generateUsersSection(reportData) {
    const { usersData } = reportData;
    
    if (!usersData || usersData.length === 0) return '';

    const activeUsers = usersData.filter(user => user.Status === 'Active').length;
    const departmentCounts = usersData.reduce((acc, user) => {
      const dept = user.Department;
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const topDepartments = Object.entries(departmentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return `
    <div class="section">
        <h2 class="section-title">👥 Users Summary</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${usersData.length}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${activeUsers}</div>
                <div class="stat-label">Active Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(departmentCounts).length}</div>
                <div class="stat-label">Departments</div>
            </div>
        </div>
        
        <h3>Top Departments by User Count</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>User Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${topDepartments.map(([dept, count]) => `
                        <tr>
                            <td>${dept}</td>
                            <td>${count}</td>
                            <td>${((count / usersData.length) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;
  }

  generateGoalsSection(reportData) {
    const { goalsData } = reportData;
    
    if (!goalsData || goalsData.length === 0) return '';

    const statusCounts = goalsData.reduce((acc, goal) => {
      acc[goal.Status] = (acc[goal.Status] || 0) + 1;
      return acc;
    }, {});

    const avgProgress = goalsData.reduce((sum, goal) => sum + (parseFloat(goal['Progress (%)']) || 0), 0) / goalsData.length;

    return `
    <div class="section">
        <h2 class="section-title">🎯 Goals Performance</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${goalsData.length}</div>
                <div class="stat-label">Total Goals</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${statusCounts.completed || 0}</div>
                <div class="stat-label">Completed Goals</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${avgProgress.toFixed(1)}%</div>
                <div class="stat-label">Average Progress</div>
            </div>
        </div>
        
        <h3>Goals by Status</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(statusCounts).map(([status, count]) => `
                        <tr>
                            <td style="text-transform: capitalize;">${status}</td>
                            <td>${count}</td>
                            <td>${((count / goalsData.length) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;
  }

  generateReviewsSection(reportData) {
    const { reviewsData } = reportData;
    
    if (!reviewsData || reviewsData.length === 0) return '';

    const statusCounts = reviewsData.reduce((acc, review) => {
      acc[review.Status] = (acc[review.Status] || 0) + 1;
      return acc;
    }, {});

    const ratedReviews = reviewsData.filter(review => review['Overall Rating'] !== 'Not rated');
    const avgRating = ratedReviews.length > 0 
      ? ratedReviews.reduce((sum, review) => sum + parseFloat(review['Overall Rating']), 0) / ratedReviews.length
      : 0;

    return `
    <div class="section">
        <h2 class="section-title">📋 Performance Reviews</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${reviewsData.length}</div>
                <div class="stat-label">Total Reviews</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${statusCounts.completed || 0}</div>
                <div class="stat-label">Completed Reviews</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${avgRating.toFixed(1)}</div>
                <div class="stat-label">Average Rating</div>
            </div>
        </div>
        
        <h3>Reviews by Status</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(statusCounts).map(([status, count]) => `
                        <tr>
                            <td style="text-transform: capitalize;">${status}</td>
                            <td>${count}</td>
                            <td>${((count / reviewsData.length) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;
  }

  generateAnalyticsSection(reportData) {
    const { analyticsData } = reportData;
    
    if (!analyticsData) return '';

    return `
    <div class="section">
        <h2 class="section-title">📈 Key Performance Indicators</h2>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    ${analyticsData.map(item => `
                        <tr>
                            <td>${item.Metric}</td>
                            <td><strong>${item.Value}</strong></td>
                            <td>${item.Category}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;
  }

  generateDepartmentsSection(reportData) {
    const { usersData } = reportData;
    
    if (!usersData) return '';

    const departmentData = usersData.reduce((acc, user) => {
      const dept = user.Department;
      if (!acc[dept]) {
        acc[dept] = {
          total: 0,
          active: 0,
          roles: {}
        };
      }
      acc[dept].total++;
      if (user.Status === 'Active') acc[dept].active++;
      acc[dept].roles[user.Role] = (acc[dept].roles[user.Role] || 0) + 1;
      return acc;
    }, {});

    return `
    <div class="section">
        <h2 class="section-title">🏢 Department Analysis</h2>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>Total Users</th>
                        <th>Active Users</th>
                        <th>Activity Rate</th>
                        <th>Top Role</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(departmentData).map(([dept, data]) => {
                      const activityRate = ((data.active / data.total) * 100).toFixed(1);
                      const topRole = Object.entries(data.roles).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
                      return `
                        <tr>
                            <td>${dept}</td>
                            <td>${data.total}</td>
                            <td>${data.active}</td>
                            <td>${activityRate}%</td>
                            <td style="text-transform: capitalize;">${topRole}</td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;
  }

  // Convert HTML to downloadable PDF-like format
  generatePrintableReport(htmlContent, title) {
    return {
      data: htmlContent,
      filename: `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`,
      mimeType: 'text/html'
    };
  }

  // Get available report types
  getAvailableReportTypes() {
    return Object.entries(this.reportTypes).map(([key, config]) => ({
      id: key,
      title: config.title,
      description: config.description
    }));
  }

  // Download HTML report
  downloadHTMLReport(reportResult) {
    const printableReport = this.generatePrintableReport(reportResult.html, reportResult.title);
    const blob = new Blob([printableReport.data], { type: printableReport.mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = printableReport.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const reportGenerator = new ReportGenerator();
export default reportGenerator;
