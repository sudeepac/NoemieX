import { useSelector } from 'react-redux';
import useApi from './useApi';
import { useMemo } from 'react';

/**
 * useOffers - Portal-aware hook for fetching offers
 * Applies business rules for data scoping based on user context
 */
export const useOffers = ({ 
  accountId, 
  agencyId, 
  studentId,
  portalType, 
  filters = {},
  enabled = true 
}) => {
  const { user } = useSelector(state => state.auth);
  
  // Apply business rules for data scoping
  const scopedParams = useMemo(() => {
    const params = { ...filters };
    
    // Add student filter if specified
    if (studentId) params.studentId = studentId;
    
    switch (portalType) {
      case 'superadmin':
        // Superadmin can see all offers, optionally filtered by account/agency
        if (accountId) params.accountId = accountId;
        if (agencyId) params.agencyId = agencyId;
        break;
        
      case 'account':
        // Account users can only see offers in their account
        params.accountId = user.accountId;
        if (agencyId) params.agencyId = agencyId;
        break;
        
      case 'agency':
        // Agency users can only see offers in their agency
        params.accountId = user.accountId;
        params.agencyId = user.agencyId;
        break;
        
      default:
        // Default to user's scope
        params.accountId = user.accountId;
        if (user.agencyId) params.agencyId = user.agencyId;
    }
    
    return params;
  }, [portalType, accountId, agencyId, studentId, user, filters]);

  const {
    data,
    loading,
    error,
    refetch
  } = useApi('/api/offers', {
    params: scopedParams,
    enabled: enabled && !!user
  });

  return {
    offers: data?.offers || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch
  };
};

/**
 * useOfferManagement - Hook for offer CRUD operations
 */
export const useOfferManagement = () => {
  const { user } = useSelector(state => state.auth);
  
  const createOffer = async (offerData) => {
    // Ensure proper scoping
    const scopedData = {
      ...offerData,
      accountId: user.accountId,
      ...(user.agencyId && { agencyId: user.agencyId }),
      createdBy: user.id
    };
    
    const response = await fetch('/api/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(scopedData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create offer');
    }
    
    return response.json();
  };

  const updateOffer = async (offerId, updates) => {
    const response = await fetch(`/api/offers/${offerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update offer');
    }
    
    return response.json();
  };

  const deleteOffer = async (offerId) => {
    const response = await fetch(`/api/offers/${offerId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete offer');
    }
    
    return response.json();
  };

  const sendOffer = async (offerId) => {
    const response = await fetch(`/api/offers/${offerId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to send offer');
    }
    
    return response.json();
  };

  const acceptOffer = async (offerId) => {
    const response = await fetch(`/api/offers/${offerId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to accept offer');
    }
    
    return response.json();
  };

  const declineOffer = async (offerId, reason) => {
    const response = await fetch(`/api/offers/${offerId}/decline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ reason })
    });
    
    if (!response.ok) {
      throw new Error('Failed to decline offer');
    }
    
    return response.json();
  };

  return {
    createOffer,
    updateOffer,
    deleteOffer,
    sendOffer,
    acceptOffer,
    declineOffer
  };
};