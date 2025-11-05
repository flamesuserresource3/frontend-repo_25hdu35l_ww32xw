import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, Video } from 'lucide-react';

export default function VideoPreview({ track, settings }) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState('');

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const mediaDestRef = useRef(null);

  // Setup audio graph when track changes
  useEffect(() => {
    if (!track?.url || !audioRef.current) return;

    const setup = async () => {
      // Clean up previous context if any
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ac = new AudioContext();
      audioContextRef.current = ac;

      const audioEl = audioRef.current;
      const source = ac.createMediaElementSource(audioEl);
      sourceRef.current = source;

      const analyser = ac.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;

      const mediaDest = ac.createMediaStreamDestination();
      mediaDestRef.current = mediaDest;

      // routing: source -> analyser -> destination (+ mediaDest for recording)
      source.connect(analyser);
      analyser.connect(ac.destination);
      analyser.connect(mediaDest);

      // Prepare canvas drawing
      startDrawing();
    };

    setup();

    return () => {
      stopDrawing();
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.url]);

  const startDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; // sharp rendering
        canvas.height = height;
      }

      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, 'rgba(0,0,0,0.95)');
      bgGrad.addColorStop(1, 'rgba(10,10,10,0.95)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      analyser.getByteFrequencyData(dataArray);

      const color = settings.color;
      const sens = settings.sensitivity;

      if (settings.style === 'bars') {
        const barCount = Math.floor(width / 8);
        const step = Math.floor(bufferLength / barCount);
        const barWidth = (width / barCount) * 0.7;
        for (let i = 0; i < barCount; i++) {
          const v = dataArray[i * step] / 255;
          const barHeight = Math.max(2, v * height * 0.8 * (sens / 8));
          const x = i * (width / barCount) + (width / barCount - barWidth) / 2;
          const y = height - barHeight;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.9;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else if (settings.style === 'wave') {
        analyser.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // 0..2
          const y = (v - 1) * height * 0.35 * (sens / 8) + height / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (settings.style === 'circle') {
        const radius = Math.min(width, height) * 0.28;
        const cx = width / 2;
        const cy = height / 2;
        const points = 128;
        const step = Math.floor(bufferLength / points);
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const v = dataArray[i * step] / 255;
          const r = radius + v * radius * 0.6 * (sens / 8);
          const angle = (i / points) * Math.PI * 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopDrawing = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const togglePlay = async () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (!isPlaying) {
      // Ensure context resumes on user interaction
      try { await audioContextRef.current?.resume(); } catch {}
      await audioEl.play();
      setIsPlaying(true);
    } else {
      audioEl.pause();
      setIsPlaying(false);
    }
  };

  const startRecording = () => {
    if (!canvasRef.current || !mediaDestRef.current) return;

    const canvasStream = canvasRef.current.captureStream(30);
    const audioStream = mediaDestRef.current.stream;

    const combined = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    const rec = new MediaRecorder(combined, { mimeType: 'video/webm;codecs=vp9,opus' });
    const chunks = [];

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setIsRecording(false);
    };

    rec.start();
    setRecorder(rec);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  useEffect(() => {
    return () => {
      stopDrawing();
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
          <Video className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <p className="text-sm text-white/70">Step 3</p>
          <h3 className="text-lg font-medium">Preview & export</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black/70">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={!track?.url}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                track?.url
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'bg-white/10 text-white/60 cursor-not-allowed'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {isPlaying ? 'Pause' : 'Play'}
            </button>

            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={!track?.url}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  track?.url
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white/10 text-white/60 cursor-not-allowed'
                }`}
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-white text-black hover:bg-white/90"
              >
                Stop & Save
              </button>
            )}

            {recordedUrl && (
              <a
                href={recordedUrl}
                download={(track?.name || 'music-video') + '.webm'}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-white/10 text-white hover:bg-white/15 border border-white/10"
              >
                <Download className="h-4 w-4" /> Download
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-white/10 p-4 bg-black/30">
            <p className="text-sm text-white/70">Track</p>
            <p className="font-medium truncate">{track?.name || 'No file selected'}</p>
            <audio ref={audioRef} src={track?.url || ''} controls className="mt-3 w-full" />
            <p className="mt-3 text-xs text-white/50">
              Tip: Press Play to preview the synced visualizer. Start Recording to export a video (WebM).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
