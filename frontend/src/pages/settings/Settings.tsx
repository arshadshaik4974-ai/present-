import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { cameraService, Camera } from '../../services/cameraService';

export const Settings: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCamera, setNewCamera] = useState({ name: '', rtsp_url: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const data = await cameraService.getAll();
      setCameras(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCamera = async () => {
    if (!newCamera.name || !newCamera.rtsp_url) return;
    setIsSubmitting(true);
    try {
      const added = await cameraService.create(newCamera);
      setCameras([...cameras, added]);
      setNewCamera({ name: '', rtsp_url: '', location: '' });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this camera?')) return;
    try {
      await cameraService.delete(id);
      setCameras(cameras.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

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
          
          {loading ? (
            <div className="flex justify-center p-4"><Spinner /></div>
          ) : (
            <div className="space-y-4">
              {cameras.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No cameras configured.</p>
              ) : (
                cameras.map(camera => (
                  <div key={camera.id} className="flex items-center gap-4 p-4 border rounded-lg border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{camera.name} {camera.location && <span className="text-sm text-gray-500 font-normal">({camera.location})</span>}</p>
                      <p className="text-sm text-gray-500 font-mono mt-1 break-all">{camera.rtsp_url}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(camera.id)}>Delete</Button>
                  </div>
                ))
              )}
            </div>
          )}

          {showAdd ? (
            <div className="p-4 border rounded-lg border-gray-200 bg-gray-50 space-y-4 mt-4">
              <h4 className="font-medium text-sm">Add New Camera</h4>
              <Input 
                label="Camera Name" 
                placeholder="e.g. Main Gate Entry" 
                value={newCamera.name}
                onChange={e => setNewCamera({...newCamera, name: e.target.value})}
              />
              <Input 
                label="RTSP URL" 
                placeholder="rtsp://admin:pass@ip:port/stream" 
                value={newCamera.rtsp_url}
                onChange={e => setNewCamera({...newCamera, rtsp_url: e.target.value})}
              />
              <Input 
                label="Location (Optional)" 
                placeholder="e.g. Gate 1" 
                value={newCamera.location}
                onChange={e => setNewCamera({...newCamera, location: e.target.value})}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAddCamera} disabled={isSubmitting || !newCamera.name || !newCamera.rtsp_url}>
                  {isSubmitting ? 'Adding...' : 'Add Camera'}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" className="w-full mt-2" onClick={() => setShowAdd(true)}>
              Add New Camera
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
