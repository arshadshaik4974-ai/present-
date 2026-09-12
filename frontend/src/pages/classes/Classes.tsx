import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Class } from '../../types/class';
import { classService } from '../../services/classService';
import { AddClassModal } from '../../components/modals/AddClassModal';

export const Classes: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadClasses = () => {
    setIsLoading(true);
    classService.getAll()
      .then(data => {
        setClasses(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unable to load classes.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const columns: Column<Class>[] = [
    { 
      header: 'Class Name', 
      cell: (row) => <span className="font-medium">{row.name} - {row.section}</span> 
    },
    { header: 'Room', accessorKey: 'room' },
    { header: 'Academic Year', accessorKey: 'academic_year' },
    { 
      header: 'Status', 
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      ) 
    }
  ];

  if (error) {
    return (
      <div>
        <PageHeader title="Classes" description="Manage classes, sections, and class teachers." />
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm mt-2">Please ensure the backend server is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Classes" 
        description="Manage classes, sections, and class teachers."
        action={
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Class
          </Button>
        }
      />
      
      <DataTable 
        data={classes} 
        columns={columns} 
        keyExtractor={(row) => row.id} 
        isLoading={isLoading}
        onRowClick={(row) => navigate(row.id)}
      />

      <AddClassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={loadClasses}
      />
    </div>
  );
};
