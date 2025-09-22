import React from 'react';

/**
 * OfferCard Component
 * Displays individual offer information in a card format
 */
const OfferCard = ({ offer, onEdit, onDelete, onSend, compact = false }) => {
  if (!offer) {
    return (
      <div className="offer-card placeholder">
        <p>No offer data available</p>
      </div>
    );
  }

  return (
    <div className={`offer-card ${compact ? 'compact' : ''}`}>
      <div className="offer-header">
        <h3>{offer.title || 'Offer Letter'}</h3>
        <span className={`status ${offer.status?.toLowerCase()}`}>
          {offer.status || 'Draft'}
        </span>
      </div>
      
      <div className="offer-details">
        <p><strong>Program:</strong> {offer.program || 'Not specified'}</p>
        <p><strong>Start Date:</strong> {offer.startDate || 'Not set'}</p>
        {offer.student && (
          <p><strong>Student:</strong> {offer.student.name}</p>
        )}
        {offer.agency && (
          <p><strong>Agency:</strong> {offer.agency.name}</p>
        )}
      </div>
      
      {!compact && (
        <div className="offer-actions">
          {onEdit && (
            <button onClick={() => onEdit(offer)} className="btn-secondary">
              Edit
            </button>
          )}
          {onSend && offer.status === 'draft' && (
            <button onClick={() => onSend(offer)} className="btn-primary">
              Send
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(offer)} className="btn-danger">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OfferCard;