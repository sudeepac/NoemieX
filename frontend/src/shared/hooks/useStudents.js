import { useSelector } from 'react-redux';
import useApi from './useApi';
import { useMemo } from 'react';

/**
 * useStudents - Portal-aware hook for fetching students
 * Applies business rules for data scoping based on user context
 */
export const useStudents = ({ 
  accountId, 
  agencyId, 
  portalType, 
  filters = {},
  enabled = true 
}) => {
  const { user } = useSelector(state => state.auth);
  
  // Apply business rules for data scoping
  const scopedParams = useMemo(() => {
    const params = { ...filters };
    
    switch (portalType) {
      case 'superadmin':
        // Superadmin can see all students, optionally filtered by account/agency
        if (accountId) params.accountId = accountId;
        if (agencyId) params.agencyId = agencyId;
        break;
        
      case 'account':
        // Account users can only see students in their account
        params.accountId = user.accountId;
        if (agencyId) params.agencyId = agencyId;
        break;
        
      case 'agency':
        // Agency users can only see students in their agency
        params.accountId = user.accountId;
        params.agencyId = user.agencyId;
        break;
        
      default:
        // Default to user's scope
        params.accountId = user.accountId;
        if (user.agencyId) params.agencyId = user.agencyId;
    }
    
    return params;
  }, [portalType, accountId, agencyId, user, filters]);

  const {
    data,
    loading,
    error,
    refetch
  } = useApi('/api/students', {
    params: scopedParams,
    enabled: enabled && !!user
  });

  return {
    students: data?.students || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch
  };
};

/**
 * useStudentManagement - Hook for student CRUD operations
 */
export const useStudentManagement = () => {
  const { user } = useSelector(state => state.auth);
  
  const createStudent = async (studentData) => {
    // Ensure proper scoping
    const scopedData = {
      ...studentData,
      accountId: user.accountId,
      ...(user.agencyId && { agencyId: user.agencyId })
    };
    
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(scopedData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create student');
    }
    
    return response.json();
  };

  const updateStudent = async (studentId, updates) => {
    const response = await fetch(`/api/students/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update student');
    }
    
    return response.json();
  };

  const deleteStudent = async (studentId) => {
    const response = await fetch(`/api/students/${studentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete student');
    }
    
    return response.json();
  };

  return {
    createStudent,
    updateStudent,
    deleteStudent
  };
};