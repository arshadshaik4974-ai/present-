import React, { useEffect, useState } from 'react';
import { Download, Filter, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { AttendanceRecord } from '../../types/attendance';
import { attendanceService } from '../../services/attendanceService';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';

export const Attendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    attendanceService.getAll()
      .then(data => {
        setRecords(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unable to load attendance records.');
        setIsLoading(false);
      });
  }, []);

  const columns: Column<AttendanceRecord>[] = [
    { 
      header: 'Date', 
      cell: (row) => <span>{formatDate(row.date)}</span> 
    },
    { header: 'Student ID', accessorKey: 'student_id' },
    { header: 'Class ID', accessorKey: 'class_id' },
    { 
      header: 'Status', 
      cell: (row) => {
        const variants = {
          present: 'success',
          absent: 'danger',
          late: 'warning',
          excused: 'info'
        } as const;
        return (
          <Badge variant={variants[row.status]}>
            {row.status}
          </Badge>
        );
      } 
    },
    { 
      header: 'Time', 
      cell: (row) => <span>{row.check_in_time ? formatTime(row.check_in_time) : '-'}</span> 
    },
    { 
      header: 'Source', 
      cell: (row) => (
        <span className="uppercase text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {row.source}
        </span>
      ) 
    }
  ];

  if (error) {
    return (
      <div>
        <PageHeader title="Attendance Records" description="View and manage daily attendance logs." />
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
        title="Attendance Records" 
        description="View and manage daily attendance logs."
        action={
          <div className="flex space-x-3">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="primary">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        }
      />
      
      <DataTable 
        data={records} 
        columns={columns} 
        keyExtractor={(row) => row.id} 
        isLoading={isLoading}
      />
    </div>
  );
};
