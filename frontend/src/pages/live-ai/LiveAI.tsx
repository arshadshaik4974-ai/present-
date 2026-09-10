import React, { useEffect, useState } from 'react';
import { Camera, Activity, AlertCircle, AlertTriangle, Power, PowerOff } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { AIStatus, AIEvent } from '../../types/ai';
import { aiService } from '../../services/aiService';
import { wsService } from '../../services/wsService';

export const LiveAI: React.FC = () => {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [events, setEvents] = useState<AIEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [statusData, eventsData] = await Promise.all([
          aiService.getStatus(),
          aiService.getEvents(),
        ]);
        setStatus(statusData);
        setEvents(eventsData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to load AI status.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    load();

    // Set up WebSocket connection
    wsService.connect();
    const unsubMessage = wsService.onMessage((data) => {
      try {
        const event = JSON.parse(data) as AIEvent;
        setEvents(prev => [event, ...prev].slice(0, 50));
      } catch {
        // Non-JSON message, ignore
      }
    });
    const unsubStatus = wsService.onStatusChange(setWsConnected);

    // Poll AI status every 10 seconds
    const interval = setInterval(async () => {
      try {
        const s = await aiService.getStatus();
        setStatus(s);
      } catch {
        // Silently fail polling
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      unsubMessage();
      unsubStatus();
      wsService.disconnect();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
        <p className="text-lg font-medium">{error}</p>
        <p className="text-sm mt-2">Please ensure the backend server is running.</p>
      </div>
    );
  }

  const isInactive = status?.status === 'not_initialized' || status?.status === 'stopped';

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader 
        title="Live AI Monitor" 
        description="Real-time face recognition and attendance tracking."
      />
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Left Column: Camera Feed Area */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
          <Card className="flex-1 flex flex-col min-h-0 bg-gray-900 border-gray-800">
            <CardHeader className="border-gray-800 flex justify-between items-center py-3">
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Camera className="h-5 w-5 text-gray-400" />
                AI Camera Feed
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={wsConnected ? 'success' : 'default'} className="text-[10px]">
                  WS: {wsConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative flex items-center justify-center bg-black">
              {isInactive ? (
                <div className="absolute inset-0 border-4 border-dashed border-gray-700 m-8 rounded-xl flex flex-col items-center justify-center text-gray-500">
                  <PowerOff className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">AI Engine Not Active</p>
                  <p className="text-sm mt-2 opacity-75">
                    Status: {status?.status ?? 'unknown'}
                  </p>
                  <p className="text-xs mt-4 opacity-50 max-w-md text-center">
                    {status?.message ?? 'The AI engine will be available in the next phase.'}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 border-4 border-dashed border-gray-700 m-8 rounded-xl flex flex-col items-center justify-center text-gray-500">
                  <Camera className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Camera Feed</p>
                  <p className="text-sm mt-2 opacity-75">AI engine is {status?.status}. Awaiting camera integration.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status & Events */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full overflow-y-auto pr-2">
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">AI Engine</span>
                <Badge variant={status?.status === 'running' ? 'success' : 'default'}>
                  {status?.status ?? 'unknown'}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">WebSocket</span>
                <Badge variant={wsConnected ? 'success' : 'danger'} className="text-[10px]">
                  {wsConnected ? 'LIVE' : 'OFFLINE'}
                </Badge>
              </div>
              <div className="pt-2 flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1 text-xs py-1"
                  onClick={async () => {
                    try {
                      const s = await aiService.start();
                      setStatus(s);
                    } catch { /* handled by api client */ }
                  }}
                >
                  <Power className="h-3 w-3 mr-1" /> Start
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-xs py-1"
                  onClick={async () => {
                    try {
                      const s = await aiService.stop();
                      setStatus(s);
                    } catch { /* handled by api client */ }
                  }}
                >
                  <PowerOff className="h-3 w-3 mr-1" /> Stop
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                Recent Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              {events.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  No AI events recorded yet.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {events.map(evt => (
                    <li key={evt.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {evt.event_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {evt.confidence != null && (
                          <Badge variant={evt.confidence > 0.8 ? 'success' : 'warning'}>
                            {Math.round(evt.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
