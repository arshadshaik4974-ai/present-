import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { adminService, AuditLog } from '../../../services/adminService';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'created_at',
      cell: (log) => new Date(log.created_at).toLocaleString(),
    },
    {
      header: 'User ID',
      accessorKey: 'user_id',
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (log) => (
        <Badge variant="default">
          {log.action}
        </Badge>
      ),
    },
    {
      header: 'Entity Type',
      accessorKey: 'entity_type',
    },
    {
      header: 'Entity ID',
      accessorKey: 'entity_id',
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Audit Logs" 
        description="System activity and security events"
      />
      {error && (
        <div className="rounded-md bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <DataTable
          columns={columns}
          data={logs}
          keyExtractor={(log) => log.id}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
