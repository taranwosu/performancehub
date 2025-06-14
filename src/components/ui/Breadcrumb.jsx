import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();
  
  // Route mapping for breadcrumb labels
  const routeLabels = {
    '/dashboard': 'Dashboard',
    '/goals-management': 'Goals Management',
    '/performance-reviews': 'Performance Reviews',
    '/team-analytics': 'Team Analytics',
    '/employee-profile': 'Employee Profile',
    '/settings-administration': 'Settings & Administration',
    '/notifications': 'Notifications'
  };

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    if (customItems) {
      return customItems;
    }

    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [{ label: 'Dashboard', path: '/dashboard' }];

    if (location.pathname !== '/dashboard') {
      let currentPath = '';
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const label = routeLabels[currentPath] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        breadcrumbs.push({
          label,
          path: currentPath,
          isLast: index === pathSegments.length - 1
        });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard or login
  if (location.pathname === '/dashboard' || location.pathname === '/login' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={14} 
                className="text-text-secondary mx-2" 
              />
            )}
            {item.isLast ? (
              <span className="text-text-primary font-medium">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;