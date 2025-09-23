// AI-NOTE: Main billing event histories component that orchestrates list and detail views
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentView } from '../../store/slices/billingEventHistoriesUi.slice';
import {
  useListBillingEventHistoriesQuery,
  useGetBillingEventHistoryByIdQuery,
} from '../../store/api/api';
import BillingEventHistoriesList from './BillingEventHistoriesList';
import BillingEventHistoryDetail from './BillingEventHistoryDetail';
import styles from './BillingEventHistories.module.css';

const BillingEventHistories = ({ 
  portal = 'superadmin', 
  view = 'list', 
  selectedId = null,
  onViewBillingEventHistory,
  onBack 
}) => {
  // Use portal view state if provided, otherwise fall back to Redux state
  const reduxView = useSelector(selectCurrentView);
  const currentView = view || reduxView;

  const renderContent = () => {
    switch (currentView) {
      case 'detail':
        return (
          <BillingEventHistoryDetail 
            billingEventHistoryId={selectedId}
            portal={portal}
            onBack={onBack}
          />
        );
      case 'list':
      default:
        return (
          <BillingEventHistoriesList 
            portal={portal}
            onViewBillingEventHistory={onViewBillingEventHistory}
          />
        );
    }
  };

  return (
    <div className={styles.billingEventHistories}>
      {renderContent()}
    </div>
  );
};

export default BillingEventHistories;