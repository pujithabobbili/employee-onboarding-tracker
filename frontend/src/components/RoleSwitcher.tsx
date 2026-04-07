import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { UserRole } from '../types';

const RoleSwitcher: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => 
    (localStorage.getItem('userRole') as UserRole) || 'employee'
  );

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    apiClient.setUserRole(newRole);
  };

  return (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <span className="text-sm font-medium text-gray-700">Current Role:</span>
      <div className="flex space-x-2">
        <button
          onClick={() => handleRoleChange('employee')}
          className={`btn btn-sm ${
            currentRole === 'employee' 
              ? 'btn-primary' 
              : 'btn-secondary'
          }`}
        >
          Employee
        </button>
        <button
          onClick={() => handleRoleChange('admin')}
          className={`btn btn-sm ${
            currentRole === 'admin' 
              ? 'btn-primary' 
              : 'btn-secondary'
          }`}
        >
          Admin
        </button>
      </div>
      <div className="text-sm text-gray-500">
        {currentRole === 'admin' 
          ? 'Full access to all features' 
          : 'Limited access to view tasks'
        }
      </div>
    </div>
  );
};

export default RoleSwitcher;
