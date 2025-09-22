import React, { useState, useMemo } from 'react';
import { useOffers } from '../../shared/hooks/useOffers';
import { usePermissions } from '../../shared/hooks/usePermissions';
import OfferCard from './OfferCard';
import { Search, Filter, Plus, FileText } from 'lucide-react';
import './OffersList.css';

/**
 * OffersList - Domain component for displaying offer letters
 * Portal-agnostic component that adapts based on user permissions and context
 */
const OffersList = ({ 
  portalType, 
  accountId, 
  agencyId,
  studentId,
  onOfferSelect,
  onCreateOffer,
  showActions = true,
  compact = false,
  maxItems = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { canCreateOffers, canEditOffers, canDeleteOffers, canSendOffers } = usePermissions();
  
  // Local filter state (will be moved to useOfferFilters hook later)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    student: ''
  });
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({ search: '', status: '', type: '', student: '' });
  };
  
  const { 
    offers, 
    loading, 
    error,
    pagination,
    refetch 
  } = useOffers({ 
    accountId, 
    agencyId,
    studentId,
    portalType,
    filters: { ...filters, search: searchTerm }
  });

  const filteredOffers = useMemo(() => {
    if (!offers) return [];
    return offers.filter(offer => 
      offer.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.institution?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [offers, searchTerm]);

  if (loading) {
    return (
      <div className="offers-list-loading">
        <div className="loading-spinner" />
        <p>Loading offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="offers-list-error">
        <p>Error loading offers: {error.message}</p>
        <button onClick={refetch} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`offers-list ${compact ? 'compact' : ''}`}>
      <div className="offers-list-header">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search offers..."
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

        {showActions && canCreateOffers && (
          <button 
            onClick={onCreateOffer}
            className="create-offer-button"
          >
            <Plus size={20} />
            Create Offer
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Program Type:</label>
            <select 
              value={filters.programType || ''} 
              onChange={(e) => updateFilter('programType', e.target.value)}
            >
              <option value="">All Programs</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="diploma">Diploma</option>
              <option value="certificate">Certificate</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Institution:</label>
            <select 
              value={filters.institution || ''} 
              onChange={(e) => updateFilter('institution', e.target.value)}
            >
              <option value="">All Institutions</option>
              {/* Dynamic institution options would be loaded here */}
            </select>
          </div>

          <button onClick={clearFilters} className="reset-filters-button">
            Reset Filters
          </button>
        </div>
      )}

      <div className="offers-grid">
        {filteredOffers.length === 0 ? (
          <div className="no-offers">
            <FileText size={48} className="no-offers-icon" />
            <p>No offers found</p>
            {canCreateOffers && (
              <button onClick={onCreateOffer} className="create-first-offer">
                Create your first offer
              </button>
            )}
          </div>
        ) : (
          filteredOffers.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onClick={() => onOfferSelect?.(offer)}
              showActions={showActions && canEditOffers}
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

export default OffersList;