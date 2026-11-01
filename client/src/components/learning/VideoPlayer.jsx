import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import useLearningTracking from '../../hooks/useLearningTracking.js';

/**
 * Reusable VideoPlayer Component with Learning Analytics Telemetry
 * Measures active watch time, pause counts, seek actions, playback speed changes,
 * and completion milestones without spamming the backend.
 */
export const VideoPlayer = ({
  src,
  poster,
  title,
  courseId,
  lessonId,
  sessionId,
  initialTime = 0,
  onProgress,
  onComplete,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);

  // Interaction aggregates
  const pauseCountRef = useRef(0);
  const seekCountRef = useRef(0);
  const totalWatchedSecondsRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  const { trackVideoProgress } = useLearningTracking({
    courseId,
    lessonId,
    sessionId,
    autoTrackReading: false,
  });

  // Handle initial resume time
  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  // Periodic aggregated update (every 10 seconds of active playback)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && duration > 0) {
        const completionPct = Math.round((currentTime / duration) * 100);
        trackVideoProgress({
          eventType: 'video_progress',
          durationSeconds: duration,
          watchedDuration: totalWatchedSecondsRef.current,
          playbackPosition: currentTime,
          playbackSpeed,
          pauseCount: pauseCountRef.current,
          seekCount: seekCountRef.current,
          completionPercentage: completionPct,
        });

        if (onProgress) {
          onProgress({ currentTime, duration, completionPct });
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, playbackSpeed, trackVideoProgress, onProgress]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);

      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        trackVideoProgress({
          eventType: 'video_started',
          durationSeconds: duration,
          playbackPosition: videoRef.current.currentTime,
          playbackSpeed,
          immediate: true,
        });
      } else {
        trackVideoProgress({
          eventType: 'video_resumed',
          durationSeconds: duration,
          playbackPosition: videoRef.current.currentTime,
          playbackSpeed,
          pauseCount: pauseCountRef.current,
        });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      pauseCountRef.current += 1;

      trackVideoProgress({
        eventType: 'video_paused',
        durationSeconds: duration,
        playbackPosition: videoRef.current.currentTime,
        playbackSpeed,
        pauseCount: pauseCountRef.current,
      });
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const targetTime = Number(e.target.value);
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
    seekCountRef.current += 1;

    trackVideoProgress({
      eventType: 'video_seeked',
      durationSeconds: duration,
      playbackPosition: targetTime,
      seekCount: seekCountRef.current,
    });
  };

  const handleSpeedChange = (speed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const nowTime = videoRef.current.currentTime;
    const delta = nowTime - lastTimeRef.current;
    if (delta > 0 && delta < 2) {
      totalWatchedSecondsRef.current += delta;
    }
    lastTimeRef.current = nowTime;
    setCurrentTime(nowTime);

    // Completion detection (>= 95% of video watched)
    if (duration > 0 && (nowTime / duration) >= 0.95 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      trackVideoProgress({
        eventType: 'video_completed',
        durationSeconds: duration,
        watchedDuration: totalWatchedSecondsRef.current,
        playbackPosition: nowTime,
        playbackSpeed,
        completionPercentage: 100,
        immediate: true,
      });
      if (onComplete) onComplete();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-slate-900 border border-neuro-border shadow-card relative group">
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            trackVideoProgress({
              eventType: 'video_completed',
              durationSeconds: duration,
              watchedDuration: totalWatchedSecondsRef.current,
              completionPercentage: 100,
              immediate: true,
            });
            if (onComplete) onComplete();
          }
        }}
        onClick={togglePlay}
        className="w-full h-auto aspect-video cursor-pointer"
      />

      {/* Control Overlay Bar */}
      <div className="p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2">
        {/* Scrubber */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-neuro-purple"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white fill-white" />}
            </button>

            <span className="text-white/80 font-mono text-[11px]">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md text-[11px]">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-1.5 py-0.5 rounded ${
                    playbackSpeed === speed ? 'bg-neuro-purple text-white font-bold' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
