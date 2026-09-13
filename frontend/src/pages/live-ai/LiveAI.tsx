import React, { useEffect, useState, useRef } from 'react';
import { Camera, AlertCircle, AlertTriangle, Power, PowerOff, Users, Play, Square, Video } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { AIStatus } from '../../types/ai';
import { aiService } from '../../services/aiService';
import { wsService } from '../../services/wsService';
import { classService } from '../../services/classService';
import { attendanceService } from '../../services/attendanceService';
import { cameraService, Camera as CCTVCamera } from '../../services/cameraService';
import { Class } from '../../types/class';

export const LiveAI: React.FC = () => {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);

  // Session Management
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Camera Management
  const [cctvCameras, setCctvCameras] = useState<CCTVCamera[]>([]);
  const [cameraSource, setCameraSource] = useState<'local' | 'rtsp'>('local');
  const [selectedRTSP, setSelectedRTSP] = useState<string>('');
  const [rtspFrameBase64, setRtspFrameBase64] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [statusData, eventsData, classesData, sessionsData, cctvData] = await Promise.all([
          aiService.getStatus(),
          aiService.getEvents(),
          classService.getAll(),
          attendanceService.getActiveSessions(),
          cameraService.getAll()
        ]);
        setStatus(statusData);
        setEvents(eventsData);
        setClasses(classesData);
        setCctvCameras(cctvData);
        
        if (cctvData.length > 0) {
          setSelectedRTSP(cctvData[0].id);
        }

        if (sessionsData && sessionsData.length > 0) {
          setActiveSession(sessionsData[0]);
          setSelectedClass(sessionsData[0].class_id);
        } else if (classesData.length > 0) {
          setSelectedClass(classesData[0].id);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to load data.';
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
        const result = JSON.parse(data);
        if (result.type === "RTSP_FRAME") {
          setRtspFrameBase64(result.image);
        } else if (result.type === "STATUS") {
          // Handled elsewhere or ignore
        } else if (result.type) {
          setRecognitionResult(result);
          if (result.type === "FACE_RECOGNIZED" || result.type === "FACE_UNKNOWN") {
            setEvents(prev => [result, ...prev].slice(0, 50));
          }
        }
      } catch { }
    });
    const unsubStatus = wsService.onStatusChange(setWsConnected);

    const interval = setInterval(async () => {
      try {
        const s = await aiService.getStatus();
        setStatus(s);
      } catch { }
    }, 10000);

    return () => {
      clearInterval(interval);
      unsubMessage();
      unsubStatus();
      wsService.disconnect();
      stopCamera();
    };
  }, []);

  const handleStartSession = async () => {
    if (!selectedClass) return;
    setSessionLoading(true);
    try {
      const session = await attendanceService.startSession(selectedClass);
      setActiveSession(session);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    setSessionLoading(true);
    try {
      await attendanceService.endSession(activeSession.id);
      setActiveSession(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Local Camera capture loop
  useEffect(() => {
    let captureInterval: ReturnType<typeof setInterval>;

    if (cameraSource === 'local' && status?.status === 'running' && wsConnected) {
      if (!streamRef.current) {
        startCamera();
      }
      
      captureInterval = setInterval(() => {
        if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);
            wsService.send(JSON.stringify({ type: 'FRAME', image: base64Image }));
          }
        }
      }, 500);
    } else {
      stopCamera();
      if (cameraSource === 'local') {
        setRecognitionResult(null);
      }
    }

    return () => {
      if (captureInterval) clearInterval(captureInterval);
    };
  }, [cameraSource, status?.status, wsConnected]);

  // Handle RTSP Engine State
  const startRTSPEngine = () => {
    if (selectedRTSP) {
      setRtspFrameBase64(null);
      wsService.send(JSON.stringify({ type: 'START_RTSP', camera_id: selectedRTSP }));
      // Optimistically update status to running
      setStatus({ status: 'running', message: '' });
    }
  };

  const stopRTSPEngine = () => {
    wsService.send(JSON.stringify({ type: 'STOP_RTSP' }));
    setRtspFrameBase64(null);
    setStatus({ status: 'stopped', message: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const isInactive = !status || status?.status === 'not_initialized' || status?.status === 'stopped' || status?.status === 'error';

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader 
        title="Live AI Monitor" 
        description="Real-time face recognition and attendance tracking."
      />
      
      {_error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm">{_error}</p>
          </div>
        </div>
      )}

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
                {activeSession && (
                  <Badge variant="success" className="animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    Recording Attendance
                  </Badge>
                )}
                <Badge variant={wsConnected ? 'success' : 'default'} className="text-[10px]">
                  WS: {wsConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative flex items-center justify-center bg-black overflow-hidden rounded-b-xl">
              
              {/* Local Camera */}
              {cameraSource === 'local' && (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-contain ${isInactive ? 'hidden' : 'block'}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}

              {/* RTSP Camera */}
              {cameraSource === 'rtsp' && !isInactive && rtspFrameBase64 && (
                <img 
                  src={rtspFrameBase64} 
                  alt="CCTV Stream" 
                  className="w-full h-full object-contain"
                />
              )}
              {cameraSource === 'rtsp' && !isInactive && !rtspFrameBase64 && (
                <div className="text-gray-500 flex flex-col items-center">
                  <Spinner />
                  <p className="mt-2 text-sm">Connecting to CCTV Stream...</p>
                </div>
              )}

              {/* Overlay results */}
              {!isInactive && recognitionResult && (
                <div className="absolute top-4 left-4 right-4 flex flex-col items-center gap-2 pointer-events-none">
                  {recognitionResult.type === 'FACE_RECOGNIZED' && (
                    <div className="bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-sm">
                      <span className="font-bold text-lg">✓ {recognitionResult.student_name}</span>
                      <span className="text-sm opacity-90">({(recognitionResult.similarity * 100).toFixed(1)}%)</span>
                    </div>
                  )}
                  {recognitionResult.attendance?.type === 'ATTENDANCE_MARKED' && (
                    <div className="bg-blue-500/90 text-white px-4 py-1 rounded-full shadow-lg text-xs font-bold animate-bounce">
                      Attendance Marked!
                    </div>
                  )}
                  {recognitionResult.attendance?.type === 'ATTENDANCE_ALREADY_MARKED' && (
                    <div className="bg-gray-700/90 text-gray-200 px-4 py-1 rounded-full shadow-lg text-xs">
                      Already Marked Present
                    </div>
                  )}
                  {recognitionResult.type === 'FACE_UNKNOWN' && (
                    <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-sm">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-bold">⚠ Unknown person</span>
                    </div>
                  )}
                  {recognitionResult.type === 'NO_FACE' && (
                    <div className="bg-gray-800/80 text-gray-200 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm text-sm">
                      No face detected
                    </div>
                  )}
                  {recognitionResult.type === 'MULTIPLE_FACES' && (
                    <div className="bg-amber-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-sm text-sm">
                      <AlertCircle className="h-5 w-5" />
                      Multiple faces detected
                    </div>
                  )}
                  {recognitionResult.type === 'FACE_LOW_QUALITY' && (
                    <div className="bg-orange-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm text-sm">
                      Face quality too low
                    </div>
                  )}
                  {recognitionResult.processing_time_ms && (
                    <div className="absolute top-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
                      {recognitionResult.processing_time_ms}ms
                    </div>
                  )}
                </div>
              )}

              {isInactive && (
                <div className="absolute inset-0 m-8 rounded-xl flex flex-col items-center justify-center text-gray-500">
                  <PowerOff className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">AI Engine Not Active</p>
                  <p className="text-sm mt-2 opacity-75">
                    Status: {status?.status ?? 'unknown'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status & Events */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-y-auto pr-2">
          
          {/* Camera Source Selector */}
          <Card>
            <CardHeader className="py-3 border-b pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                Video Source
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2">
                <Button 
                  variant={cameraSource === 'local' ? 'primary' : 'outline'} 
                  className="flex-1 text-xs py-1"
                  onClick={() => {
                    if (!isInactive) {
                      cameraSource === 'rtsp' ? stopRTSPEngine() : stopCamera();
                    }
                    setCameraSource('local');
                  }}
                >
                  Local Webcam
                </Button>
                <Button 
                  variant={cameraSource === 'rtsp' ? 'primary' : 'outline'} 
                  className="flex-1 text-xs py-1"
                  onClick={() => {
                    if (!isInactive) {
                      cameraSource === 'local' ? stopCamera() : stopRTSPEngine();
                    }
                    setCameraSource('rtsp');
                  }}
                >
                  CCTV (RTSP)
                </Button>
              </div>

              {cameraSource === 'rtsp' && (
                <div className="mt-3">
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Select Camera</label>
                  <select 
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm"
                    value={selectedRTSP}
                    onChange={(e) => setSelectedRTSP(e.target.value)}
                    disabled={!isInactive}
                  >
                    {cctvCameras.length === 0 && <option value="">No cameras found</option>}
                    {cctvCameras.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex gap-2 border-t mt-2">
                <Button
                  variant="primary"
                  className="flex-1 text-xs py-1"
                  onClick={async () => {
                    if (cameraSource === 'rtsp') {
                      startRTSPEngine();
                    } else {
                      try {
                        const s = await aiService.start();
                        setStatus(s);
                      } catch { }
                    }
                  }}
                  disabled={!isInactive || (cameraSource === 'rtsp' && !selectedRTSP)}
                >
                  <Power className="h-3 w-3 mr-1" /> Start
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-xs py-1"
                  onClick={async () => {
                    if (cameraSource === 'rtsp') {
                      stopRTSPEngine();
                    } else {
                      try {
                        const s = await aiService.stop();
                        setStatus(s);
                      } catch { }
                    }
                  }}
                  disabled={isInactive}
                >
                  <PowerOff className="h-3 w-3 mr-1" /> Stop
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Session */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Attendance Session
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {!activeSession ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Select Class</label>
                    <select 
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full text-sm py-2"
                    onClick={handleStartSession}
                    disabled={sessionLoading || !selectedClass}
                  >
                    <Play className="h-4 w-4 mr-2" /> Start Session
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-primary font-semibold mb-1">SESSION ACTIVE</p>
                    <p className="text-sm font-medium">
                      {classes.find(c => c.id === activeSession.class_id)?.name} - {classes.find(c => c.id === activeSession.class_id)?.section}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Started: {new Date(activeSession.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    className="w-full text-sm py-2"
                    onClick={handleEndSession}
                    disabled={sessionLoading}
                  >
                    <Square className="h-4 w-4 mr-2" /> End Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Recognition */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                Recent Recognition
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              {events.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  No recognition events recorded yet.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {events.map((evt, idx) => (
                    <li key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm font-medium ${evt.type === 'FACE_RECOGNIZED' ? 'text-green-600' : 'text-amber-600'}`}>
                            {evt.type === 'FACE_RECOGNIZED' ? evt.student_name : 'Unknown Person'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {evt.timestamp ? new Date(evt.timestamp * 1000).toLocaleTimeString() : 'Just now'}
                          </p>
                          {evt.attendance?.type === 'ATTENDANCE_MARKED' && (
                            <p className="text-[10px] text-blue-600 font-bold mt-1">✓ Logged as Present</p>
                          )}
                        </div>
                        {evt.similarity != null && (
                          <Badge variant={evt.similarity > 0.6 ? 'success' : 'warning'}>
                            {Math.round(evt.similarity * 100)}%
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
