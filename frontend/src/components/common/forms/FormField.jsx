import React from 'react';
import ErrorMessage from '../ErrorMessage';
import './FormField.css';

// AI-NOTE: Reusable FormField component for text inputs, textareas, and other input types with consistent styling and error handling

/**
 * FormField - Reusable form field component
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.id - Field ID
 * @param {string} props.type - Input type (text, email, password, number, date, etc.)
 * @param {Object} props.register - React Hook Form register function
 * @param {Object} props.validation - Validation rules
 * @param {Object} props.error - Error object from React Hook Form
 * @param {boolean} props.disabled - Whether field is disabled
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether field is required (adds asterisk)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.isTextarea - Whether to render as textarea
 * @param {number} props.rows - Number of rows for textarea
 * @param {string} props.helpText - Help text to display below field
 * @param {Object} props.inputProps - Additional props to pass to input element
 */
const FormField = ({
  label,
  id,
  type = 'text',
  register,
  validation = {},
  error,
  disabled = false,
  placeholder,
  required = false,
  className = '',
  isTextarea = false,
  rows = 3,
  helpText,
  inputProps = {},
  ...rest
}) => {
  const fieldClasses = `form-field ${error ? 'error' : ''} ${className}`.trim();
  const inputClasses = `form-input ${error ? 'error' : ''}`.trim();

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
      )}
      
      {isTextarea ? (
        <textarea
          id={id}
          {...register(id, validation)}
          className={inputClasses}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          {...inputProps}
          {...rest}
        />
      ) : (
        <input
          id={id}
          type={type}
          {...register(id, validation)}
          className={inputClasses}
          disabled={disabled}
          placeholder={placeholder}
          {...inputProps}
          {...rest}
        />
      )}
      
      {helpText && <div className="form-help-text">{helpText}</div>}
      <ErrorMessage error={error} variant="inline" type="validation" />
    </div>
  );
};

export default FormField;