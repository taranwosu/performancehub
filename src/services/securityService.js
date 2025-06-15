import { supabase } from '../lib/supabaseClient';

class SecurityService {
  constructor() {
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    this.passwordMinLength = 8;
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.rateLimits = new Map();
  }

  // Input validation and sanitization
  validateAndSanitizeInput(input, type = 'text', options = {}) {
    if (typeof input !== 'string') {
      return { isValid: false, error: 'Input must be a string', sanitized: '' };
    }

    let sanitized = input.trim();
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    switch (type) {
      case 'email':
        return this.validateEmail(sanitized);
      case 'password':
        return this.validatePassword(sanitized, options);
      case 'name':
        return this.validateName(sanitized);
      case 'phone':
        return this.validatePhone(sanitized);
      case 'text':
        return this.validateText(sanitized, options);
      case 'html':
        return this.validateHTML(sanitized);
      default:
        return this.validateText(sanitized, options);
    }
  }

  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email) && email.length <= 254;
    
    return {
      isValid,
      error: isValid ? null : 'Invalid email format',
      sanitized: email.toLowerCase()
    };
  }

  validatePassword(password, options = {}) {
    const minLength = options.minLength || this.passwordMinLength;
    const requireNumbers = options.requireNumbers !== false;
    const requireSymbols = options.requireSymbols !== false;
    const requireMixedCase = options.requireMixedCase !== false;

    const errors = [];

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (requireMixedCase && (!/[a-z]/.test(password) || !/[A-Z]/.test(password))) {
      errors.push('Password must contain both uppercase and lowercase letters');
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join(', ') : null,
      sanitized: password,
      strength: this.calculatePasswordStrength(password)
    };
  }

  validateName(name) {
    const nameRegex = /^[a-zA-Z\s'-]{1,50}$/;
    const isValid = nameRegex.test(name) && name.length >= 1;
    
    return {
      isValid,
      error: isValid ? null : 'Name can only contain letters, spaces, hyphens, and apostrophes (max 50 characters)',
      sanitized: name
    };
  }

  validatePhone(phone) {
    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, '');
    const phoneRegex = /^\d{10,15}$/;
    const isValid = phoneRegex.test(digitsOnly);
    
    return {
      isValid,
      error: isValid ? null : 'Phone number must contain 10-15 digits',
      sanitized: digitsOnly
    };
  }

  validateText(text, options = {}) {
    const maxLength = options.maxLength || 1000;
    const minLength = options.minLength || 0;
    
    const isValid = text.length >= minLength && text.length <= maxLength;
    
    return {
      isValid,
      error: isValid ? null : `Text must be between ${minLength} and ${maxLength} characters`,
      sanitized: text
    };
  }

  validateHTML(html) {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    const allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const sanitized = this.sanitizeHTML(html, allowedTags);
    
    return {
      isValid: true,
      error: null,
      sanitized
    };
  }

  sanitizeHTML(html, allowedTags = []) {
    // Basic HTML sanitization - remove scripts and dangerous tags
    let sanitized = html;
    
    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["\'][^"\']*["\']/gi, '');
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // If allowedTags is provided, remove all other tags
    if (allowedTags.length > 0) {
      const allowedPattern = allowedTags.join('|');
      const tagRegex = new RegExp(`<(?!\/?(?:${allowedPattern})(?:\s|>))[^>]*>`, 'gi');
      sanitized = sanitized.replace(tagRegex, '');
    }
    
    return sanitized;
  }

  calculatePasswordStrength(password) {
    let score = 0;
    
    // Length bonus
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    
    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 1; // Sequential patterns
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  // Rate limiting
  checkRateLimit(identifier, action, maxAttempts = 10, windowMs = 60000) {
    const key = `${identifier}:${action}`;
    const now = Date.now();
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, { attempts: 1, firstAttempt: now });
      return { allowed: true, remaining: maxAttempts - 1 };
    }
    
    const record = this.rateLimits.get(key);
    
    // Reset if window expired
    if (now - record.firstAttempt > windowMs) {
      this.rateLimits.set(key, { attempts: 1, firstAttempt: now });
      return { allowed: true, remaining: maxAttempts - 1 };
    }
    
    // Check if limit exceeded
    if (record.attempts >= maxAttempts) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: record.firstAttempt + windowMs 
      };
    }
    
    // Increment attempts
    record.attempts += 1;
    this.rateLimits.set(key, record);
    
    return { allowed: true, remaining: maxAttempts - record.attempts };
  }

  // Security logging
  async logSecurityEvent(eventType, details = {}) {
    try {
      const user = await supabase.auth.getUser();
      
      await supabase.from('security_logs').insert({
        event_type: eventType,
        user_id: user.data.user?.id,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        details: details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  async getClientIP() {
    try {
      // In production, you'd get this from headers or a service
      return '127.0.0.1';
    } catch (error) {
      return 'unknown';
    }
  }

  // Session management
  initializeSessionTimeout() {
    let timeoutId;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.handleSessionTimeout();
      }, this.sessionTimeout);
    };
    
    // Reset timeout on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });
    
    // Initial timeout
    resetTimeout();
    
    return () => {
      clearTimeout(timeoutId);
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }

  async handleSessionTimeout() {
    await this.logSecurityEvent('session_timeout');
    
    // Show warning modal
    const shouldExtend = confirm('Your session is about to expire. Would you like to extend it?');
    
    if (shouldExtend) {
      // Refresh session
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
        this.initializeSessionTimeout();
        return;
      }
    }
    
    // Sign out user
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  // Content Security Policy headers
  getSecurityHeaders() {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }

  // Validate form data
  validateForm(formData, validationRules) {
    const errors = {};
    const sanitizedData = {};
    
    for (const [field, rules] of Object.entries(validationRules)) {
      const value = formData[field];
      
      if (rules.required && (!value || value.trim() === '')) {
        errors[field] = `${field} is required`;
        continue;
      }
      
      if (value) {
        const validation = this.validateAndSanitizeInput(value, rules.type, rules.options);
        
        if (!validation.isValid) {
          errors[field] = validation.error;
        } else {
          sanitizedData[field] = validation.sanitized;
        }
      } else {
        sanitizedData[field] = value;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }

  // Check for suspicious activity
  detectSuspiciousActivity(activityData) {
    const suspicious = [];
    
    // Multiple rapid login attempts
    if (activityData.loginAttempts > 3 && activityData.timespan < 60000) {
      suspicious.push('Rapid login attempts detected');
    }
    
    // Unusual access patterns
    if (activityData.accessedResources?.length > 50 && activityData.timespan < 300000) {
      suspicious.push('Unusual resource access pattern');
    }
    
    // Suspicious user agent
    if (activityData.userAgent && /bot|crawler|spider/i.test(activityData.userAgent)) {
      suspicious.push('Bot-like user agent detected');
    }
    
    return suspicious;
  }

  // Generate secure random tokens
  generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Password policy enforcement
  enforcePasswordPolicy(password) {
    const policy = {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireMixedCase: true,
      maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
    };
    
    return this.validatePassword(password, policy);
  }

  // Secure data transmission
  encryptSensitiveData(data, key) {
    // In production, use proper encryption library
    try {
      return btoa(JSON.stringify(data));
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  decryptSensitiveData(encryptedData, key) {
    // In production, use proper decryption library
    try {
      return JSON.parse(atob(encryptedData));
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // Clean up resources
  cleanup() {
    this.rateLimits.clear();
  }
}

export const securityService = new SecurityService();
export default securityService;
