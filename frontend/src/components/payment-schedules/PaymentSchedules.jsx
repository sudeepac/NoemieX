// AI-NOTE: Main payment schedules component that orchestrates list, form, and detail views
import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveView, selectIsFormOpen } from '../../store/payment-schedules/payment-schedules.slice';
import PaymentSchedulesList from './PaymentSchedulesList';
import PaymentScheduleForm from './PaymentScheduleForm';
import PaymentScheduleDetail from './PaymentScheduleDetail';
import './PaymentSchedules.css';

const PaymentSchedules = () => {
  const activeView = useSelector(selectActiveView);
  const isFormOpen = useSelector(selectIsFormOpen);

  return (
    <div className="payment-schedules">
      {/* Main Content */}
      <div className="payment-schedules-content">
        {activeView === 'list' && <PaymentSchedulesList />}
        {activeView === 'detail' && <PaymentScheduleDetail />}
      </div>

      {/* Form Modal/Sidebar */}
      {isFormOpen && (
        <div className="payment-schedule-form-overlay">
          <div className="payment-schedule-form-container">
            <PaymentScheduleForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSchedules;