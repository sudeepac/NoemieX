import React, { useState, useMemo } from 'react';
import { useStudents } from '../../shared/hooks/useStudents';
import { usePermissions } from '../../shared/hooks/usePermissions';
import StudentCard from './StudentCard';
import { Search, Filter, Plus } from 'lucide-react';
import './StudentsList.css';

/**
 * StudentsList - Domain component for displaying students
 * Portal-agnostic component that adapts based on user permissions and context
 */
const StudentsList = ({ 
  portalType, 
  accountId, 
  agencyId, 
  onStudentSelect,
  onCreateStudent,
  showActions = true,
  compact = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { canCreateStudents, canEditStudents } = usePermissions();
  
  // Local filter state (will be moved to useStudentFilters hook later)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    stage: '',
    agency: ''
  });
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', status: '', stage: '', agency: '' });
  };
  
  const { 
    students, 
    loading, 
    error,
    pagination,
    refetch 
  } = useStudents({ 
    accountId, 
    agencyId,
    portalType,
    filters: { ...filters, search: searchTerm }
  });

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  if (loading) {
    return (
      <div className="students-list-loading">
        <div className="loading-spinner" />
        <p>Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="students-list-error">
        <p>Error loading students: {error.message}</p>
        <button onClick={refetch} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`students-list ${compact ? 'compact' : ''}`}>
      <div className="students-list-header">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-button ${showFilters ? 'active' : ''}`}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {showActions && canCreateStudents && (
          <button 
            onClick={onCreateStudent}
            className="create-student-button"
          >
            <Plus size={20} />
            Add Student
          </button>
        )}
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status || ''} 
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Application Stage:</label>
            <select 
              value={filters.stage || ''} 
              onChange={(e) => updateFilter('stage', e.target.value)}
            >
              <option value="">All Stages</option>
              <option value="inquiry">Inquiry</option>
              <option value="application">Application</option>
              <option value="offer">Offer Received</option>
              <option value="enrolled">Enrolled</option>
            </select>
          </div>

          <button onClick={resetFilters} className="reset-filters-button">
            Reset Filters
          </button>
        </div>
      )}

      <div className="students-grid">
        {filteredStudents.length === 0 ? (
          <div className="no-students">
            <p>No students found</p>
            {canCreateStudents && (
              <button onClick={onCreateStudent} className="create-first-student">
                Create your first student
              </button>
            )}
          </div>
        ) : (
          filteredStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onClick={() => onStudentSelect?.(student)}
              showActions={showActions && canEditStudents}
              compact={compact}
              portalType={portalType}
            />
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => updateFilter('page', pagination.currentPage - 1)}
          >
            Previous
          </button>
          
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => updateFilter('page', pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentsList;