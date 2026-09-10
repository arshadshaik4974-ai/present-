import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Teacher } from '../../types/teacher';
import { teacherService } from '../../services/teacherService';

export const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    teacherService.getAll()
      .then(data => {
        setTeachers(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unable to load teachers.');
        setIsLoading(false);
      });
  }, []);

  const columns: Column<Teacher>[] = [
    { header: 'Emp ID', accessorKey: 'teacher_id' },
    { 
      header: 'Name', 
      cell: (row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3">
            {row.full_name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{row.full_name}</span>
        </div>
      ) 
    },
    { header: 'Subject', accessorKey: 'subject' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Contact', accessorKey: 'phone' },
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
        <PageHeader title="Teachers" description="Manage teaching staff and assignments." />
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
        title="Teachers" 
        description="Manage teaching staff and assignments."
        action={
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" /> Add Teacher
          </Button>
        }
      />
      
      <DataTable 
        data={teachers} 
        columns={columns} 
        keyExtractor={(row) => row.id} 
        isLoading={isLoading}
      />
    </div>
  );
};
