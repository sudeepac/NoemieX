import React from 'react';

/**
 * PaymentCard Component
 * Displays individual payment information in a card format
 */
const PaymentCard = ({ payment, onEdit, onDelete, compact = false }) => {
  if (!payment) {
    return (
      <div className="payment-card placeholder">
        <p>No payment data available</p>
      </div>
    );
  }

  return (
    <div className={`payment-card ${compact ? 'compact' : ''}`}>
      <div className="payment-header">
        <h3>{payment.description || 'Payment'}</h3>
        <span className={`status ${payment.status?.toLowerCase()}`}>
          {payment.status || 'Pending'}
        </span>
      </div>
      
      <div className="payment-details">
        <p><strong>Amount:</strong> ${payment.amount || '0.00'}</p>
        <p><strong>Due Date:</strong> {payment.dueDate || 'Not set'}</p>
        {payment.student && (
          <p><strong>Student:</strong> {payment.student.name}</p>
        )}
      </div>
      
      {!compact && (
        <div className="payment-actions">
          {onEdit && (
            <button onClick={() => onEdit(payment)} className="btn-secondary">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(payment)} className="btn-danger">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentCard;