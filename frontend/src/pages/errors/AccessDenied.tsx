import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-surface p-6">
      <div className="flex max-w-md flex-col items-center rounded-2xl bg-card p-8 text-center shadow-lg border border-border">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
          <AlertTriangle size={32} />
        </div>
        
        <h1 className="mb-2 text-2xl font-bold text-text">Access Denied</h1>
        
        <p className="mb-8 text-text-secondary">
          You don't have permission to access this page. If you believe this is a mistake, please contact your administrator.
        </p>
        
        <Button 
          variant="primary" 
          onClick={() => navigate('/dashboard')}
          className="w-full justify-center"
        >
          <Home size={18} className="mr-2" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
