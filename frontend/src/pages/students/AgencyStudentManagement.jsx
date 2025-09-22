import React from 'react';
import StudentsList from '../../components/students/StudentsList';

const AgencyStudentManagement = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student Management</h1>
        <p>Manage students and their applications</p>
      </div>
      
      <div className="page-content">
        <StudentsList 
          showActions={true}
          showSummary={true}
          portalType="agency"
        />
      </div>
    </div>
  );
};

export default AgencyStudentManagement;