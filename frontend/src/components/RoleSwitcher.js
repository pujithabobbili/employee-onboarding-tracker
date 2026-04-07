import React, { useState } from 'react';
import { apiClient } from '../services/api';

const RoleSwitcher = () => {
  const [currentRole, setCurrentRole] = useState(() => 
    localStorage.getItem('userRole') || 'employee'
  );

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    apiClient.setUserRole(newRole);
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <span className="text-sm font-medium text-gray-700">Current Role:</span>
      <div className="flex space-x-2">
        <button
          onClick={() => handleRoleChange('employee')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentRole === 'employee' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Employee
        </button>
        <button
          onClick={() => handleRoleChange('admin')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentRole === 'admin' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Admin
        </button>
      </div>
      <div className="text-sm text-gray-500">
        {currentRole === 'admin' 
          ? '✓ Full access to all features' 
          : '○ Limited access to view tasks'
        }
      </div>
    </div>
  );
};

export default RoleSwitcher;
