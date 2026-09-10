import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, AlertCircle, ArrowLeft, RefreshCw, CheckCircle, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { studentService } from '../../services/studentService';

export const FaceEnrollment: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState('Student');
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!studentId) return;
    try {
      setIsLoading(true);
      const student = await studentService.getById(studentId);
      setStudentName(student.full_name);
      
      try {
        const status = await studentService.getFaceEnrollmentStatus(studentId);
        setEnrollmentStatus(status.enrollment_status);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setEnrollmentStatus('pending');
        } else {
          setEnrollmentStatus('unknown');
        }
      }
    } catch (err: any) {
      setEnrollError(err.message || 'Failed to load student details');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
    return () => {
      stopCamera();
    };
  }, [loadData]);

  const startCamera = async () => {
    setCameraError(null);
    setEnrollError(null);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError('Camera access denied or unavailable. Please check your permissions.');
      setCameraActive(false);
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
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(base64Image);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setEnrollError(null);
    startCamera();
  };

  const enrollFace = async () => {
    if (!studentId || !capturedImage) return;
    setIsEnrolling(true);
    setEnrollError(null);
    try {
      await studentService.enrollFace(studentId, capturedImage);
      setEnrollmentStatus('enrolled');
      setCapturedImage(null);
    } catch (err: any) {
      setEnrollError(err.response?.data?.detail || err.message || 'Enrollment failed');
    } finally {
      setIsEnrolling(false);
    }
  };

  const removeEnrollment = async () => {
    if (!studentId) return;
    if (!window.confirm('Are you sure you want to remove the face profile for this student?')) return;
    
    setIsLoading(true);
    try {
      await studentService.deleteFaceEnrollment(studentId);
      setEnrollmentStatus('pending');
    } catch (err: any) {
      setEnrollError(err.message || 'Failed to remove enrollment');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Student
      </Button>

      <PageHeader 
        title={`Face Enrollment`} 
        description={`Manage biometric enrollment for ${studentName}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <Badge 
                variant={enrollmentStatus === 'enrolled' ? 'success' : 'warning'}
                className="text-sm px-3 py-1"
              >
                {enrollmentStatus?.toUpperCase()}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <ul className="list-disc list-inside space-y-1">
                <li>Look directly at the camera</li>
                <li>Ensure good lighting</li>
                <li>Remove glasses or masks</li>
                <li>Only one person in frame</li>
              </ul>
            </div>

            {enrollmentStatus === 'enrolled' && (
              <Button 
                variant="danger" 
                className="w-full mt-4"
                onClick={removeEnrollment}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove Profile
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="mr-2 h-5 w-5 text-gray-500" />
              Camera Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start text-sm">
                <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
                <p>{enrollError}</p>
              </div>
            )}

            <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center border border-gray-200">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
                  />
                  {!cameraActive && (
                    <div className="text-gray-500 text-center flex flex-col items-center">
                      <Camera className="h-12 w-12 mb-2 opacity-50" />
                      <p>{cameraError || "Camera is inactive"}</p>
                    </div>
                  )}
                  {cameraActive && (
                    <div className="absolute inset-0 border-4 border-dashed border-white/30 m-8 rounded-lg pointer-events-none"></div>
                  )}
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-6 flex justify-center gap-4">
              {!capturedImage ? (
                <>
                  {!cameraActive ? (
                    <Button onClick={startCamera} variant="primary">
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button onClick={captureFrame} variant="primary">
                        Capture Photo
                      </Button>
                      <Button onClick={stopCamera} variant="outline">
                        Stop Camera
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button 
                    onClick={enrollFace} 
                    variant="primary"
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? <Spinner size="sm" className="mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Confirm & Enroll
                  </Button>
                  <Button onClick={retake} variant="outline" disabled={isEnrolling}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Retake
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
