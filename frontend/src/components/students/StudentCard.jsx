import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import styles from './StudentCard.module.css';

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
      className={`${styles.studentCard} ${compact ? styles.compact : ''} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      <div className={styles.studentCardHeader}>
        <div className={styles.studentAvatar}>
          {student.profileImage ? (
            <img src={student.profileImage} alt={student.name} />
          ) : (
            <User size={compact ? 24 : 32} />
          )}
        </div>
        
        <div className={styles.studentInfo}>
          <h3 className={styles.studentName}>{student.name}</h3>
          <div className={styles.studentMeta}>
            <span 
              className={styles.statusBadge}
              style={{ backgroundColor: getStatusColor(student.status) }}
            >
              {student.status}
            </span>
            {student.stage && (
              <span className={styles.stageBadge}>
                {getStageDisplay(student.stage)}
              </span>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className={styles.studentCardBody}>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <Mail size={16} />
              <span>{student.email}</span>
            </div>
            
            {student.phone && (
              <div className={styles.contactItem}>
                <Phone size={16} />
                <span>{student.phone}</span>
              </div>
            )}
            
            {student.location && (
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>{student.location}</span>
              </div>
            )}
          </div>

          {student.program && (
            <div className={styles.programInfo}>
              <GraduationCap size={16} />
              <span>{student.program}</span>
            </div>
          )}

          <div className={styles.datesInfo}>
            <div className={styles.dateItem}>
              <Calendar size={16} />
              <span>Created: {formatDate(student.createdAt)}</span>
            </div>
            
            {student.lastActivity && (
              <div className={styles.dateItem}>
                <span>Last Activity: {formatDate(student.lastActivity)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {showActions && (
        <div className={styles.studentCardActions}>
          <button className={`${styles.actionButton} ${styles.primary}`}>
            View Details
          </button>
          
          {portalType !== 'agency' && (
            <button className={`${styles.actionButton} ${styles.secondary}`}>
              Edit
            </button>
          )}
        </div>
      )}

      {/* Portal-specific indicators */}
      {portalType === 'superadmin' && student.accountName && (
        <div className={styles.portalIndicator}>
          <span className={styles.accountBadge}>
            {student.accountName}
          </span>
          {student.agencyName && (
            <span className={styles.agencyBadge}>
              {student.agencyName}
            </span>
          )}
        </div>
      )}

      {portalType === 'account' && student.agencyName && (
        <div className={styles.portalIndicator}>
          <span className={styles.agencyBadge}>
            {student.agencyName}
          </span>
        </div>
      )}
    </div>
  );
};

export default StudentCard;