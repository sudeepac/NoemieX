import React, { useState, useMemo } from 'react';
import { usePermissions } from '../../shared/hooks/usePermissions';
import PaymentCard from './PaymentCard';
import { Search, Filter, Plus, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import styles from './PaymentsList.module.css';

/**
 * PaymentsList - Domain component for displaying payments and billing
 * Portal-agnostic component that adapts based on user permissions and context
 */
const PaymentsList = ({ 
  compact = false, 
  maxItems = null, 
  showSummary = true,
  showActions = true,
  onCreatePayment,
  onPaymentSelect,
  portalType = 'student'
}) => {
  const { canCreatePayments, canEditPayments, canDeletePayments, canProcessPayments } = usePermissions();
  
  // Temporary mock data (will be replaced with usePayments hook)
  const [payments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const loading = false;
  const error = null;
  const refetch = () => {};
  
  // Local filter state (will be moved to usePaymentFilters hook later)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    dateRange: ''
  });
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({ search: '', status: '', type: '', dateRange: '' });
  };
  
  // TODO: Replace with actual usePayments hook when implemented
  const summary = {};
  const pagination = {};

  const filteredPayments = useMemo(() => {
    const paymentSchedules = [];
    const billingTransactions = [];
    const allItems = [...(payments || []), ...paymentSchedules, ...billingTransactions];
    
    if (!searchTerm) return allItems;
    
    return allItems.filter(item => 
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payments, searchTerm]);

  if (loading) {
    return (
      <div className={styles.paymentsListLoading}>
        <div className={styles.loadingSpinner} />
        <p>Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.paymentsListError}>
        <p>Error loading payments: {error.message}</p>
        <button onClick={refetch} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.paymentsList} ${compact ? styles.compact : ''}`}>
      {showSummary && summary && (
        <div className={styles.paymentsSummary}>
          <div className={styles.summaryCard}>
            <h3>Total Outstanding</h3>
            <div className={`${styles.summaryValue} ${styles.outstanding}`}>
              {formatCurrency(summary.totalOutstanding)}
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <h3>Total Paid</h3>
            <div className={`${styles.summaryValue} ${styles.paid}`}>
              {formatCurrency(summary.totalPaid)}
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <h3>Pending Claims</h3>
            <div className={`${styles.summaryValue} ${styles.pending}`}>
              {formatCurrency(summary.totalPending)}
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <h3>Disputed</h3>
            <div className={`${styles.summaryValue} ${styles.disputed}`}>
              {formatCurrency(summary.totalDisputed)}
            </div>
          </div>
        </div>
      )}

      <div className={styles.paymentsListHeader}>
        <div className={styles.viewTypeSelector}>
          <button 
            className={viewType === 'all' ? styles.active : ''}
            onClick={() => setViewType('all')}
          >
            All
          </button>
          <button 
            className={viewType === 'schedules' ? styles.active : ''}
            onClick={() => setViewType('schedules')}
          >
            Schedules
          </button>
          <button 
            className={viewType === 'transactions' ? styles.active : ''}
            onClick={() => setViewType('transactions')}
          >
            Transactions
          </button>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {showActions && canCreatePayments && (
          <button 
            onClick={onCreatePayment}
            className={styles.createPaymentButton}
          >
            <Plus size={20} />
            Add Payment
          </button>
        )}
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Status:</label>
            <select>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="claimed">Claimed</option>
              <option value="paid">Paid</option>
              <option value="disputed">Disputed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Amount Range:</label>
            <div className={styles.amountRange}>
              <input type="number" placeholder="Min" />
              <span>to</span>
              <input type="number" placeholder="Max" />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Date Range:</label>
            <div className={styles.dateRange}>
              <input type="date" />
              <span>to</span>
              <input type="date" />
            </div>
          </div>

          <button className={styles.resetFiltersButton}>
            Reset Filters
          </button>
        </div>
      )}

      <div className={styles.paymentsGrid}>
        {filteredPayments.length === 0 ? (
          <div className={styles.noPayments}>
            <DollarSign size={48} className={styles.noPaymentsIcon} />
            <p>No payments found</p>
            {canCreatePayments && (
              <button onClick={onCreatePayment} className={styles.createFirstPayment}>
                Create your first payment
              </button>
            )}
          </div>
        ) : (
          filteredPayments.map(payment => (
            <PaymentCard
              key={`${payment.type}-${payment.id}`}
              payment={payment}
              onClick={() => onPaymentSelect?.(payment)}
              showActions={showActions && canEditPayments}
              compact={compact}
              portalType={portalType}
            />
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            disabled={pagination.currentPage === 1}
          >
            Previous
          </button>
          
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;