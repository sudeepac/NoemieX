import React from 'react';
import ErrorMessage from '../ErrorMessage';
import './FormField.css';

// AI-NOTE: Reusable FormCheckbox component for checkbox inputs with consistent styling and error handling

/**
 * FormCheckbox - Reusable checkbox component
 * @param {Object} props
 * @param {string} props.label - Checkbox label
 * @param {string} props.id - Field ID
 * @param {Object} props.register - React Hook Form register function
 * @param {Object} props.validation - Validation rules
 * @param {Object} props.error - Error object from React Hook Form
 * @param {boolean} props.disabled - Whether field is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.helpText - Help text to display below field
 * @param {Object} props.inputProps - Additional props to pass to input element
 * @param {boolean} props.inline - Whether to display inline (label and checkbox on same line)
 */
const FormCheckbox = ({
  label,
  id,
  register,
  validation = {},
  error,
  disabled = false,
  className = '',
  helpText,
  inputProps = {},
  inline = true,
  ...rest
}) => {
  const containerClasses = `form-group form-checkbox-group ${inline ? 'inline' : 'stacked'} ${className}`.trim();
  const checkboxClasses = `form-checkbox ${error ? 'error' : ''}`.trim();

  return (
    <div className={containerClasses}>
      <label className="checkbox-label" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          {...register(id, validation)}
          className={checkboxClasses}
          disabled={disabled}
          {...inputProps}
          {...rest}
        />
        <span className="checkbox-text">{label}</span>
      </label>
      
      {helpText && <div className="form-help-text">{helpText}</div>}
      <ErrorMessage error={error} variant="inline" type="validation" />
    </div>
  );
};

export default FormCheckbox;