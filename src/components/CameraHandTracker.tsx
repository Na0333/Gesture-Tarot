import { useEffect, useRef, useState } from "react";
import { Camera, Video } from "lucide-react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { GestureDetector, gestureLabel, type GestureStatus, type HandPoint } from "../utils/gesture";

type CameraHandTrackerProps = {
  enabled: boolean;
  paused: boolean;
  gestureStatus: GestureStatus;
  onGesture: (gesture: GestureStatus) => void;
  onCameraError: (message: string) => void;
};

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17]
] as const;

export default function CameraHandTracker({
  enabled,
  paused,
  gestureStatus,
  onGesture,
  onCameraError
}: CameraHandTrackerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const detectorRef = useRef(new GestureDetector());
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onGestureRef = useRef(onGesture);
  const onCameraErrorRef = useRef(onCameraError);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onGestureRef.current = onGesture;
  }, [onGesture]);

  useEffect(() => {
    onCameraErrorRef.current = onCameraError;
  }, [onCameraError]);

  useEffect(() => {
    let disposed = false;

    async function startCamera() {
      if (!enabled || loading || isReady) return;
      setLoading(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 960 },
            height: { ideal: 540 }
          },
          audio: false
        });

        if (disposed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
        );

        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
            delegate: "GPU"
          },
          numHands: 1,
          runningMode: "VIDEO"
        });

        setIsReady(true);
        setLoading(false);
        detectLoop();
      } catch (error) {
        const detail = error instanceof Error && error.message ? `（${error.message}）` : "";
        const message = `请允许浏览器摄像头权限。部分浏览器需要在 HTTPS 或 localhost 环境下使用摄像头。${detail}`;
        setLoading(false);
        setIsReady(false);
        onCameraErrorRef.current(message);
      }
    }

    if (enabled) {
      void startCamera();
    }

    return () => {
      disposed = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      detectorRef.current.reset();
    };
  }, [enabled]);

  function detectLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !canvas || !landmarker) {
      animationRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 360;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const result = landmarker.detectForVideo(video, performance.now());
    const landmarks = result.landmarks?.[0] as HandPoint[] | undefined;
    drawLandmarks(canvas, landmarks);

    if (landmarks?.length) {
      const gesture = detectorRef.current.detect(landmarks);
      if (gesture !== "idle") onGestureRef.current(gesture);
    }

    animationRef.current = requestAnimationFrame(detectLoop);
  }

  return (
    <section className="camera-panel" aria-label="摄像头手势识别区域">
      <div className="camera-meta">
        <span className={`camera-dot ${isReady ? "is-on" : ""}`} />
        <span>{isReady ? "摄像头已开启" : loading ? "摄像头启动中" : "摄像头未开启"}</span>
        <span className="camera-facing">前置摄像头</span>
      </div>
      <div className="camera-frame">
        <video ref={videoRef} className="camera-video" playsInline muted />
        <canvas ref={canvasRef} className="camera-canvas" />
        {!isReady && (
          <div className="camera-placeholder">
            {loading ? <Video size={34} aria-hidden="true" /> : <Camera size={34} aria-hidden="true" />}
            <span>{loading ? "正在唤醒镜头" : "等待开启摄像头"}</span>
          </div>
        )}
      </div>
      <div className="camera-gesture">
        当前手势：<strong>{paused ? gestureLabel("paused") : gestureLabel(gestureStatus)}</strong>
      </div>
    </section>
  );
}

function drawLandmarks(canvas: HTMLCanvasElement, landmarks?: HandPoint[]) {
  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks?.length) return;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = "rgba(217, 70, 239, 0.8)";
  context.shadowBlur = 12;
  context.strokeStyle = "rgba(246, 217, 139, 0.95)";
  context.lineWidth = Math.max(2, canvas.width * 0.004);

  HAND_CONNECTIONS.forEach(([start, end]) => {
    const a = landmarks[start];
    const b = landmarks[end];
    context.beginPath();
    context.moveTo(a.x * canvas.width, a.y * canvas.height);
    context.lineTo(b.x * canvas.width, b.y * canvas.height);
    context.stroke();
  });

  landmarks.forEach((point, index) => {
    const radius = index === 8 ? 7 : 4.5;
    context.beginPath();
    context.fillStyle = index === 8 ? "rgba(246, 217, 139, 0.98)" : "rgba(217, 70, 239, 0.9)";
    context.arc(point.x * canvas.width, point.y * canvas.height, radius, 0, Math.PI * 2);
    context.fill();
  });

  context.restore();
}
