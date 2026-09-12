import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Student } from '../../types/student';
import { studentService } from '../../services/studentService';

import { useNavigate } from 'react-router-dom';

export const Students: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentService.getAll()
      .then(data => {
        setStudents(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unable to load students.');
        setIsLoading(false);
      });
  }, []);

  const columns: Column<Student>[] = [
    { header: 'Roll No', accessorKey: 'roll_number' },
    { 
      header: 'Name', 
      cell: (row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mr-3">
            {row.full_name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{row.full_name}</span>
        </div>
      ) 
    },
    { 
      header: 'Class', 
      cell: (row) => <span>{row.class_id ? `${row.class_id.substring(0, 8)}…` : '-'} {row.section ? `- ${row.section}` : ''}</span> 
    },
    { header: 'Contact', accessorKey: 'contact' },
    { 
      header: 'Status', 
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      ) 
    },
    { 
      header: 'Face ID', 
      cell: (row) => (
        <Badge variant={row.face_enrolled ? 'success' : 'warning'}>
          {row.face_enrolled ? 'enrolled' : 'pending'}
        </Badge>
      ) 
    },
  ];

  if (error) {
    return (
      <div>
        <PageHeader title="Students" description="Manage all student records and face enrollments." />
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
        title="Students" 
        description="Manage all student records and face enrollments."
        action={
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        }
      />
      
      <DataTable 
        data={students} 
        columns={columns} 
        keyExtractor={(row) => row.id} 
        isLoading={isLoading}
        onRowClick={(row) => navigate(row.id)}
      />
    </div>
  );
};
