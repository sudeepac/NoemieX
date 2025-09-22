import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { formatDate } from '../../shared/utils';
import './StudentCard.css';

/**
 * StudentCard - Individual student display component
 * Responsive card that adapts to different portal contexts
 */
const StudentCard = ({ 
  student, 
  onClick, 
  showActions = true, 
  compact = false,
  portalType 
}) => {
  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      pending: '#f59e0b',
      completed: '#3b82f6',
      withdrawn: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStageDisplay = (stage) => {
    const stages = {
      inquiry: 'Initial Inquiry',
      application: 'Application Submitted',
      offer: 'Offer Received',
      enrolled: 'Enrolled'
    };
    return stages[stage] || stage;
  };

  return (
    <div 
      className={`student-card ${compact ? 'compact' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="student-card-header">
        <div className="student-avatar">
          {student.profileImage ? (
            <img src={student.profileImage} alt={student.name} />
          ) : (
            <User size={compact ? 24 : 32} />
          )}
        </div>
        
        <div className="student-info">
          <h3 className="student-name">{student.name}</h3>
          <div className="student-meta">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(student.status) }}
            >
              {student.status}
            </span>
            {student.stage && (
              <span className="stage-badge">
                {getStageDisplay(student.stage)}
              </span>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="student-card-body">
          <div className="contact-info">
            <div className="contact-item">
              <Mail size={16} />
              <span>{student.email}</span>
            </div>
            
            {student.phone && (
              <div className="contact-item">
                <Phone size={16} />
                <span>{student.phone}</span>
              </div>
            )}
            
            {student.location && (
              <div className="contact-item">
                <MapPin size={16} />
                <span>{student.location}</span>
              </div>
            )}
          </div>

          {student.program && (
            <div className="program-info">
              <GraduationCap size={16} />
              <span>{student.program}</span>
            </div>
          )}

          <div className="dates-info">
            <div className="date-item">
              <Calendar size={16} />
              <span>Created: {formatDate(student.createdAt)}</span>
            </div>
            
            {student.lastActivity && (
              <div className="date-item">
                <span>Last Activity: {formatDate(student.lastActivity)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {showActions && (
        <div className="student-card-actions">
          <button className="action-button primary">
            View Details
          </button>
          
          {portalType !== 'agency' && (
            <button className="action-button secondary">
              Edit
            </button>
          )}
        </div>
      )}

      {/* Portal-specific indicators */}
      {portalType === 'superadmin' && student.accountName && (
        <div className="portal-indicator">
          <span className="account-badge">
            {student.accountName}
          </span>
          {student.agencyName && (
            <span className="agency-badge">
              {student.agencyName}
            </span>
          )}
        </div>
      )}

      {portalType === 'account' && student.agencyName && (
        <div className="portal-indicator">
          <span className="agency-badge">
            {student.agencyName}
          </span>
        </div>
      )}
    </div>
  );
};

export default StudentCard;