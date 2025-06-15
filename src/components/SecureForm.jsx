import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import { securityService } from '../services/securityService';

const SecureForm = ({ 
  children, 
  onSubmit, 
  validationRules = {}, 
  rateLimitKey = 'form_submit',
  maxAttempts = 5,
  className = '' 
}) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    setIsSubmitting(true);

    try {
      // Rate limiting check
      const rateLimitResult = securityService.checkRateLimit(
        `${rateLimitKey}_${Date.now()}`, 
        'submit', 
        maxAttempts, 
        60000
      );

      if (!rateLimitResult.allowed) {
        setRateLimitExceeded(true);
        setErrors({ general: 'Too many attempts. Please try again later.' });
        return;
      }

      // Get form data
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      // Validate form data
      if (Object.keys(validationRules).length > 0) {
        const validation = securityService.validateForm(data, validationRules);
        
        if (!validation.isValid) {
          setErrors(validation.errors);
          await securityService.logSecurityEvent('form_validation_failed', {
            form: rateLimitKey,
            errors: validation.errors
          });
          return;
        }

        // Use sanitized data
        await onSubmit(validation.sanitizedData, e);
      } else {
        await onSubmit(data, e);
      }

      // Log successful submission
      await securityService.logSecurityEvent('form_submitted', {
        form: rateLimitKey
      });

    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
      
      await securityService.logSecurityEvent('form_submission_error', {
        form: rateLimitKey,
        error: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {/* Rate limit warning */}
      {rateLimitExceeded && (
        <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-error" />
            <p className="text-sm text-error">Too many attempts. Please wait before trying again.</p>
          </div>
        </div>
      )}

      {/* General error */}
      {errors.general && (
        <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error" />
            <p className="text-sm text-error">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Enhanced children with error support */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.props.name) {
          const fieldError = errors[child.props.name];
          
          return (
            <div className="mb-4">
              {React.cloneElement(child, {
                className: `${child.props.className || ''} ${fieldError ? 'border-error' : ''}`,
                'aria-invalid': !!fieldError,
                'aria-describedby': fieldError ? `${child.props.name}-error` : undefined
              })}
              {fieldError && (
                <p id={`${child.props.name}-error`} className="mt-1 text-sm text-error">
                  {fieldError}
                </p>
              )}
            </div>
          );
        }
        return child;
      })}

      {/* Submit button with loading state */}
      <button
        type="submit"
        disabled={isSubmitting || rateLimitExceeded}
        className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processing...</span>
          </>
        ) : (
          <span>Submit</span>
        )}
      </button>
    </form>
  );
};

// Secure Input Component with validation
const SecureInput = ({ 
  type = 'text', 
  validationType = 'text',
  showPasswordStrength = false,
  onValidationChange,
  ...props 
}) => {
  const [value, setValue] = useState(props.value || '');
  const [validation, setValidation] = useState({ isValid: true, error: null });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (value && validationType) {
      const result = securityService.validateAndSanitizeInput(value, validationType, props.validationOptions);
      setValidation(result);
      
      if (onValidationChange) {
        onValidationChange(result);
      }
    }
  }, [value, validationType]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const getInputType = () => {
    if (type === 'password' && showPassword) return 'text';
    return type;
  };

  return (
    <div className="relative">
      <input
        {...props}
        type={getInputType()}
        value={value}
        onChange={handleChange}
        className={`form-input ${!validation.isValid ? 'border-error' : ''} ${
          type === 'password' ? 'pr-10' : ''
        }`}
      />
      
      {/* Password toggle */}
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} className="text-text-secondary" />
        </button>
      )}
      
      {/* Password strength indicator */}
      {showPasswordStrength && type === 'password' && value && (
        <PasswordStrengthIndicator password={value} />
      )}
      
      {/* Validation error */}
      {!validation.isValid && validation.error && (
        <p className="mt-1 text-sm text-error">{validation.error}</p>
      )}
    </div>
  );
};

// Password Strength Indicator
const PasswordStrengthIndicator = ({ password }) => {
  const strength = securityService.calculatePasswordStrength(password);
  
  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'bg-error';
      case 'medium': return 'bg-warning';
      case 'strong': return 'bg-success';
      default: return 'bg-border';
    }
  };

  const getStrengthWidth = () => {
    switch (strength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary">Password Strength</span>
        <span className={`text-xs font-medium ${
          strength === 'weak' ? 'text-error' :
          strength === 'medium' ? 'text-warning' :
          'text-success'
        }`}>
          {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </span>
      </div>
      <div className="w-full bg-border rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}></div>
      </div>
    </div>
  );
};

// Secure TextArea Component
const SecureTextArea = ({ validationType = 'text', onValidationChange, ...props }) => {
  const [value, setValue] = useState(props.value || '');
  const [validation, setValidation] = useState({ isValid: true, error: null });

  useEffect(() => {
    if (value && validationType) {
      const result = securityService.validateAndSanitizeInput(value, validationType, props.validationOptions);
      setValidation(result);
      
      if (onValidationChange) {
        onValidationChange(result);
      }
    }
  }, [value, validationType]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div>
      <textarea
        {...props}
        value={value}
        onChange={handleChange}
        className={`form-input ${!validation.isValid ? 'border-error' : ''}`}
      />
      
      {/* Character count */}
      {props.maxLength && (
        <div className="mt-1 text-xs text-text-secondary text-right">
          {value.length}/{props.maxLength}
        </div>
      )}
      
      {/* Validation error */}
      {!validation.isValid && validation.error && (
        <p className="mt-1 text-sm text-error">{validation.error}</p>
      )}
    </div>
  );
};

export { SecureForm, SecureInput, SecureTextArea, PasswordStrengthIndicator };
export default SecureForm;
