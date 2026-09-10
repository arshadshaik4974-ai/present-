import React from 'react';
import { cn } from '../../utils/cn';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  onRowClick,
  isLoading 
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                scope="col" 
                className={cn("px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr 
                key={keyExtractor(row)} 
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "transition-colors",
                  onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                )}
              >
                {columns.map((col, i) => (
                  <td key={i} className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-900", col.className)}>
                    {col.cell ? col.cell(row) : (col.accessorKey ? row[col.accessorKey] as React.ReactNode : null)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
