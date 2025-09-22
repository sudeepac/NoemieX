import { useSelector } from 'react-redux';
import { useMemo } from 'react';

/**
 * usePermissions - Centralized permissions hook
 * Provides portal-aware permissions and user context
 */
export const usePermissions = () => {
  const { user } = useSelector(state => state.auth);
  
  const permissions = useMemo(() => {
    if (!user) return {};
    
    const { role, portalType } = user;
    
    // Base permissions by role
    const rolePermissions = {
      admin: {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canView: true,
        canManageUsers: true,
        canManageSettings: true,
        canViewReports: true,
        canExport: true
      },
      manager: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canView: true,
        canManageUsers: false,
        canManageSettings: false,
        canViewReports: true,
        canExport: true
      },
      user: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canView: true,
        canManageUsers: false,
        canManageSettings: false,
        canViewReports: false,
        canExport: false
      }
    };

    const basePerms = rolePermissions[role] || rolePermissions.user;
    
    // Portal-specific permissions
    const portalPermissions = {
      superadmin: {
        ...basePerms,
        canManageAccounts: true,
        canManageAgencies: true,
        canViewAllData: true,
        canManageSystem: true
      },
      account: {
        ...basePerms,
        canManageAgencies: role === 'admin',
        canViewAccountData: true,
        canManageAccountSettings: role === 'admin'
      },
      agency: {
        ...basePerms,
        canViewAgencyData: true,
        canManageAgencySettings: role === 'admin'
      }
    };

    return portalPermissions[portalType] || basePerms;
  }, [user]);

  // Specific domain permissions
  const domainPermissions = useMemo(() => ({
    // Students
    canCreateStudents: permissions.canCreate,
    canEditStudents: permissions.canEdit,
    canDeleteStudents: permissions.canDelete,
    canViewStudents: permissions.canView,
    
    // Offers
    canCreateOffers: permissions.canCreate,
    canEditOffers: permissions.canEdit,
    canDeleteOffers: permissions.canDelete,
    canViewOffers: permissions.canView,
    canSendOffers: permissions.canEdit,
    
    // Payments
    canCreatePayments: permissions.canCreate,
    canEditPayments: permissions.canEdit,
    canDeletePayments: permissions.canDelete,
    canViewPayments: permissions.canView,
    canProcessPayments: permissions.canEdit,
    
    // Agencies (only for superadmin and account portals)
    canCreateAgencies: permissions.canManageAgencies,
    canEditAgencies: permissions.canManageAgencies,
    canDeleteAgencies: permissions.canManageAgencies && permissions.canDelete,
    canViewAgencies: permissions.canManageAgencies || permissions.canView,
    
    // Reports
    canViewReports: permissions.canViewReports,
    canExportReports: permissions.canExport,
    
    // System
    canManageSystem: permissions.canManageSystem,
    canManageUsers: permissions.canManageUsers,
    canManageSettings: permissions.canManageSettings
  }), [permissions]);

  // Data scoping helper
  const getDataScope = () => {
    if (!user) return null;
    
    return {
      accountId: user.accountId,
      agencyId: user.agencyId,
      portalType: user.portalType,
      canViewAllAccounts: user.portalType === 'superadmin',
      canViewAllAgencies: user.portalType === 'superadmin' || 
                         (user.portalType === 'account' && user.role === 'admin')
    };
  };

  // Logout helper
  const logout = () => {
    // This would typically dispatch a logout action
    // For now, just clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return {
    user,
    permissions,
    ...domainPermissions,
    getDataScope,
    logout
  };
};