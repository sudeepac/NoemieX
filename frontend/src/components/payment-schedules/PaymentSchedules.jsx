// AI-NOTE: Main payment schedules component that orchestrates list, form, and detail views
import React from 'react';
import { useSelector } from 'react-redux';
import { selectFormOpen, selectDetailOpen } from '../../store/slices/paymentSchedulesUi.slice';
import PaymentSchedulesList from './PaymentSchedulesList';
import PaymentScheduleForm from './PaymentScheduleForm';
import PaymentScheduleDetail from './PaymentScheduleDetail';
import styles from './PaymentSchedules.module.css';

const PaymentSchedules = () => {
  const activeView = useSelector(selectActiveView);
  const isFormOpen = useSelector(selectIsFormOpen);

  return (
    <div className={styles.paymentSchedules}>
      {/* Main Content */}
      <div className={styles.paymentSchedulesContent}>
        {activeView === 'list' && <PaymentSchedulesList />}
        {activeView === 'detail' && <PaymentScheduleDetail />}
      </div>

      {/* Form Modal/Sidebar */}
      {isFormOpen && (
        <div className={styles.paymentScheduleFormOverlay}>
          <div className={styles.paymentScheduleFormContainer}>
            <PaymentScheduleForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSchedules;