import React from 'react';
import styles from './DataTable.module.css';

/**
 * Reusable DataTable component for displaying tabular data with sorting, pagination, and actions
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Array of column definitions
 * @param {Object} props.pagination - Pagination configuration
 * @param {Function} props.onSort - Sort handler function
 * @param {Function} props.onPageChange - Page change handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.noDataMessage - Message to show when no data
 * @param {string} props.className - Additional CSS classes
 */
const DataTable = ({
  data = [],
  columns = [],
  pagination = null,
  onSort = null,
  onPageChange = null,
  loading = false,
  error = null,
  noDataMessage = 'No data available',
  className = ''
}) => {
  /**
   * Handle column header click for sorting
   * @param {string} columnKey - The key of the column to sort by
   */
  const handleSort = (columnKey) => {
    if (onSort && columns.find(col => col.key === columnKey)?.sortable) {
      onSort(columnKey);
    }
  };

  /**
   * Render table cell content based on column configuration
   * @param {Object} row - Data row object
   * @param {Object} column - Column configuration
   * @returns {JSX.Element} Rendered cell content
   */
  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key] || '-';
  };

  /**
   * Get sort indicator for column header
   * @param {Object} column - Column configuration
   * @returns {string} Sort indicator class
   */
  const getSortIndicator = (column) => {
    if (!column.sortable || !pagination?.sortBy) return '';
    if (pagination.sortBy === column.key) {
      return pagination.sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc;
    }
    return '';
  };

  // Show error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.dataTableContainer} ${className}`}>
      {/* Table Container - Desktop */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          {/* Table Header */}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    ${column.sortable ? styles.sortable : ''}
                    ${getSortIndicator(column)}
                    ${column.className || ''}
                  `}
                  onClick={() => handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  {column.title}
                  {column.sortable && (
                    <span className={styles.sortIcon}>
                      {getSortIndicator(column) || '↕'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles.loadingCell}>
                  <div className={styles.loadingSpinner}>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.noDataCell}>
                  {noDataMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index} className={styles.dataRow}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.cellClassName || ''}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* AI-NOTE: Mobile Card Layout for responsive design */}
      <div className={styles.mobileCardContainer}>
        {loading ? (
          <div className={styles.dataCard}>
            <div className={styles.loadingSpinner}>
              Loading...
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className={styles.dataCard}>
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
              {noDataMessage}
            </div>
          </div>
        ) : (
          data.map((row, index) => (
            <div key={row.id || index} className={styles.dataCard}>
              <div className={styles.cardHeader}>
                {/* Show first column as header */}
                {columns.length > 0 && (
                  <div className={styles.cardTitle}>
                    {renderCell(row, columns[0])}
                  </div>
                )}
              </div>
              
              <div className={styles.cardBody}>
                {/* Show remaining columns as fields */}
                {columns.slice(1).map((column) => (
                  <div key={column.key} className={styles.cardField}>
                    <div className={styles.cardFieldLabel}>{column.title}</div>
                    <div className={styles.cardFieldValue}>
                      {renderCell(row, column)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {pagination.from} to {pagination.to} of {pagination.total} entries
          </div>
          
          <div className={styles.paginationControls}>
            <button
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </button>
            
            <span className={styles.pageInfo}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

// AI-NOTE: Created reusable DataTable component with sorting, pagination, custom cell rendering, loading states, and error handling for use across different pages