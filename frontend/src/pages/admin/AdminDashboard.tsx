import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Admin Dashboard" 
        description="System overview and management"
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
      </div>
    </div>
  );
};
