import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { adminService } from '../../../services/adminService';
import { User } from '../../../types/auth';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Name',
      accessorKey: 'full_name',
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (user) => (
        <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'principal' ? 'warning' : 'info'}>
          {user.role}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (user) => (
        <Badge variant={user.is_active ? 'success' : 'default'}>
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="User Management" 
        description="Manage system administrators, principals, and teachers"
      />
      {error && (
        <div className="rounded-md bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(user) => user.id}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
