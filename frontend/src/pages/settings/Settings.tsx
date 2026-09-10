import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Settings" 
        description="Manage school profile, AI camera configurations, and system preferences."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="School Name" defaultValue="Greenwood High International" />
            <Input label="Registration Number" defaultValue="GHI-100234" />
            <Input label="Principal Name" defaultValue="Dr. Robert Peterson" />
            <Input label="Contact Email" defaultValue="admin@greenwood.edu" />
          </div>
          <div className="pt-4 flex justify-end">
            <Button variant="primary">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Camera Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">Connect and calibrate RTSP streams for live face recognition.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg border-gray-200">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Main Gate Entry Camera</p>
                <p className="text-sm text-gray-500 font-mono mt-1">rtsp://admin:pass@192.168.1.100:554/stream1</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg border-gray-200">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Hallway Block A</p>
                <p className="text-sm text-gray-500 font-mono mt-1">rtsp://admin:pass@192.168.1.101:554/stream1</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
          <Button variant="secondary" className="w-full mt-2">Add New Camera</Button>
        </CardContent>
      </Card>
    </div>
  );
};
