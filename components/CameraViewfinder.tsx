'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface CameraViewfinderProps {
  onCapture: (imageBase64: string) => void;
  shouldCapture: boolean;
}

export default function CameraViewfinder({ onCapture, shouldCapture }: CameraViewfinderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const hasCaptured = useRef(false);

  const captureFrame = useCallback(() => {
    if (hasCaptured.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraReady) {
      // Fallback: call with empty string (no image)
      hasCaptured.current = true;
      onCapture('');
      return;
    }
    hasCaptured.current = true;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(imageData);
    } else {
      onCapture('');
    }
  }, [cameraReady, onCapture]);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (mounted) setCameraReady(true);
          };
        }
      } catch (err) {
        console.warn('Camera error:', err);
        if (mounted) {
          setCameraError('Camera access denied or unavailable');
          setCameraReady(true); // allow flow to continue without camera
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (shouldCapture && cameraReady && !hasCaptured.current) {
      const timer = setTimeout(captureFrame, 800);
      return () => clearTimeout(timer);
    }
  }, [shouldCapture, cameraReady, captureFrame]);

  return (
    <div className="relative w-full h-full min-h-[50vh] bg-gray-950">
      {/* Video feed */}
      {!cameraError ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ minHeight: '50vh' }}
        />
      ) : (
        <div className="w-full min-h-[50vh] flex items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="text-4xl mb-3">📷</div>
            <p className="text-gray-600 text-sm">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Scan overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner markers */}
        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-20 left-8 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-20 right-8 w-8 h-8 border-b-2 border-r-2 border-amber-400" />

        {/* Scan line */}
        <div className="absolute left-8 right-8 top-8 bottom-20 overflow-hidden">
          <div
            className="absolute left-0 right-0 h-px bg-amber-400/60 animate-scan"
            style={{ top: 0 }}
          />
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
