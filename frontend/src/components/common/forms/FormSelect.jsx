import React from 'react';
import ErrorMessage from '../ErrorMessage';
import './FormField.css';

// AI-NOTE: Reusable FormSelect component for dropdown selections with consistent styling and error handling

/**
 * FormSelect - Reusable select dropdown component
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.id - Field ID
 * @param {Object} props.register - React Hook Form register function
 * @param {Object} props.validation - Validation rules
 * @param {Object} props.error - Error object from React Hook Form
 * @param {boolean} props.disabled - Whether field is disabled
 * @param {boolean} props.required - Whether field is required (adds asterisk)
 * @param {string} props.className - Additional CSS classes
 * @param {Array} props.options - Array of option objects {value, label} or strings
 * @param {string} props.placeholder - Placeholder option text
 * @param {string} props.helpText - Help text to display below field
 * @param {Object} props.selectProps - Additional props to pass to select element
 */
const FormSelect = ({
  label,
  id,
  register,
  validation = {},
  error,
  disabled = false,
  required = false,
  className = '',
  options = [],
  placeholder = 'Select an option',
  helpText,
  selectProps = {},
  ...rest
}) => {
  const selectClasses = `form-input form-select ${error ? 'error' : ''} ${className}`.trim();

  // Normalize options to {value, label} format
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
      )}
      
      <select
        id={id}
        {...register(id, validation)}
        className={selectClasses}
        disabled={disabled}
        {...selectProps}
        {...rest}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {normalizedOptions.map((option, index) => (
          <option key={option.value || index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helpText && <div className="form-help-text">{helpText}</div>}
      <ErrorMessage error={error} variant="inline" type="validation" />
    </div>
  );
};

export default FormSelect;