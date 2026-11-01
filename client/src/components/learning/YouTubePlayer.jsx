import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import useLearningTracking from '../../hooks/useLearningTracking.js';

/**
 * Robust YouTube video ID extractor and sanitizer (client-side fallback)
 * Ensures only clean 11-character alphanumeric IDs are processed.
 */
export const extractYouTubeId = (urlOrId) => {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  // If already exactly 11 characters alphanumeric/dashes/underscores
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard YouTube URLs
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Reusable YouTube Video Player Component with NeuroLearn Learning Telemetry
 *
 * Requirements:
 * - Uses validated 11-char YouTube ID (prevents arbitrary iframe HTML injection)
 * - Emits throttled learning telemetry: video_started, video_paused, video_resumed, video_seeked, video_progress, video_completed
 * - Renders helpful LMS errors for invalid, private, or embed-restricted videos
 * - Never claims video playback alone proves comprehension
 */
export const YouTubePlayer = ({
  videoId,
  videoUrl,
  title = 'Lesson Video',
  courseId,
  lessonId,
  sessionId,
  onProgress,
  onComplete,
}) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Interaction aggregates
  const pauseCountRef = useRef(0);
  const seekCountRef = useRef(0);
  const totalWatchedSecondsRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  const [resolvedVideoId, setResolvedVideoId] = useState(null);
  const [playerState, setPlayerState] = useState('unstarted'); // 'loading', 'playing', 'paused', 'ended', 'error'
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  // Hook for learning analytics
  const { trackVideoProgress } = useLearningTracking({
    courseId,
    lessonId,
    sessionId,
    autoTrackReading: false,
  });

  // Resolve and validate video ID
  useEffect(() => {
    const raw = videoId || videoUrl;
    const cleanId = extractYouTubeId(raw);

    if (!cleanId) {
      setErrorMessage(
        'Invalid or missing YouTube video link. Please verify that a standard YouTube URL or 11-character video ID is provided.'
      );
      setResolvedVideoId(null);
    } else {
      setErrorMessage(null);
      setResolvedVideoId(cleanId);
    }
  }, [videoId, videoUrl]);

  // Load YouTube IFrame API script if not present
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YT Player when resolvedVideoId is available
  useEffect(() => {
    if (!resolvedVideoId) return;

    let isSubscribed = true;
    let checkInterval = null;

    const initPlayer = () => {
      if (!isSubscribed || !containerRef.current) return;

      const playerElementId = `yt-player-${lessonId || 'default'}-${Math.random().toString(36).substring(2, 7)}`;
      containerRef.current.innerHTML = `<div id="${playerElementId}" class="w-full h-full"></div>`;

      try {
        playerRef.current = new window.YT.Player(playerElementId, {
          videoId: resolvedVideoId,
          playerVars: {
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (!isSubscribed) return;
              const dur = event.target.getDuration() || 0;
              setDuration(dur);
              setPlayerState('ready');
            },
            onStateChange: (event) => {
              if (!isSubscribed) return;
              handlePlayerStateChange(event.data);
            },
            onError: (event) => {
              if (!isSubscribed) return;
              handlePlayerError(event.data);
            },
          },
        });
      } catch (err) {
        console.error('[YouTubePlayer] Error initializing player:', err);
        setErrorMessage('Unable to initialize YouTube player. Please check your browser permissions.');
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 150);
    }

    return () => {
      isSubscribed = false;
      if (checkInterval) clearInterval(checkInterval);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore cleanup errors
        }
        playerRef.current = null;
      }
    };
  }, [resolvedVideoId, lessonId]);

  // Handle YouTube Player Error Codes
  const handlePlayerError = (errorCode) => {
    setPlayerState('error');
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    switch (errorCode) {
      case 2:
        setErrorMessage('Invalid video parameter. The YouTube video ID is malformed or invalid.');
        break;
      case 5:
        setErrorMessage('HTML5 player error. The video cannot be played in this browser.');
        break;
      case 100:
        setErrorMessage('Video not found. This video may have been deleted or set to private by its author.');
        break;
      case 101:
      case 150:
        setErrorMessage(
          'Embedding restricted. The owner of this video has disabled playback inside third-party applications.'
        );
        break;
      default:
        setErrorMessage(`An unexpected playback error occurred (Error code ${errorCode}).`);
        break;
    }
  };

  // Start periodic progress tracker
  const startProgressTracking = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    progressTimerRef.current = setInterval(() => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;

      try {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || duration;

        // Detect seek / replay
        if (lastTimeRef.current > 0 && Math.abs(cur - lastTimeRef.current) > 3) {
          seekCountRef.current += 1;
          trackVideoProgress({
            eventType: 'video_seeked',
            durationSeconds: dur,
            playbackPosition: cur,
            seekCount: seekCountRef.current,
          });
        }

        // Accumulate active watch time
        const delta = cur - lastTimeRef.current;
        if (delta > 0 && delta < 5) {
          totalWatchedSecondsRef.current += delta;
        }

        lastTimeRef.current = cur;
        setCurrentTime(cur);
        if (dur > 0 && dur !== duration) setDuration(dur);

        const completionPct = dur > 0 ? Math.min(100, Math.round((cur / dur) * 100)) : 0;

        // Throttled video progress event
        trackVideoProgress({
          eventType: 'video_progress',
          durationSeconds: dur,
          watchedDuration: totalWatchedSecondsRef.current,
          playbackPosition: cur,
          playbackSpeed: playerRef.current.getPlaybackRate ? playerRef.current.getPlaybackRate() : 1,
          pauseCount: pauseCountRef.current,
          seekCount: seekCountRef.current,
          completionPercentage: completionPct,
        });

        if (onProgress) {
          onProgress({ currentTime: cur, duration: dur, completionPct });
        }

        // Check completion milestone (>= 90% watched)
        if (completionPct >= 90 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          trackVideoProgress({
            eventType: 'video_completed',
            durationSeconds: dur,
            watchedDuration: totalWatchedSecondsRef.current,
            playbackPosition: cur,
            completionPercentage: 100,
            immediate: true,
          });
          if (onComplete) onComplete();
        }
      } catch (err) {
        console.warn('[YouTubePlayer] Progress tick error:', err);
      }
    }, 8000); // Throttled every 8 seconds
  }, [duration, trackVideoProgress, onProgress, onComplete]);

  // Handle Player State Changes
  const handlePlayerStateChange = useCallback(
    (stateCode) => {
      if (!playerRef.current) return;
      const YT = window.YT;
      if (!YT) return;

      const dur = playerRef.current.getDuration() || duration;
      const cur = playerRef.current.getCurrentTime() || 0;

      if (stateCode === YT.PlayerState.PLAYING) {
        setPlayerState('playing');
        lastTimeRef.current = cur;

        if (!hasStartedRef.current) {
          hasStartedRef.current = true;
          trackVideoProgress({
            eventType: 'video_started',
            durationSeconds: dur,
            playbackPosition: cur,
            playbackSpeed: playerRef.current.getPlaybackRate ? playerRef.current.getPlaybackRate() : 1,
            immediate: true,
          });
        } else {
          trackVideoProgress({
            eventType: 'video_resumed',
            durationSeconds: dur,
            playbackPosition: cur,
            playbackSpeed: playerRef.current.getPlaybackRate ? playerRef.current.getPlaybackRate() : 1,
            pauseCount: pauseCountRef.current,
          });
        }

        startProgressTracking();
      } else if (stateCode === YT.PlayerState.PAUSED) {
        setPlayerState('paused');
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);

        pauseCountRef.current += 1;
        trackVideoProgress({
          eventType: 'video_paused',
          durationSeconds: dur,
          playbackPosition: cur,
          pauseCount: pauseCountRef.current,
        });
      } else if (stateCode === YT.PlayerState.ENDED) {
        setPlayerState('ended');
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);

        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          trackVideoProgress({
            eventType: 'video_completed',
            durationSeconds: dur,
            watchedDuration: totalWatchedSecondsRef.current,
            playbackPosition: dur,
            completionPercentage: 100,
            immediate: true,
          });
          if (onComplete) onComplete();
        }
      }
    },
    [duration, startProgressTracking, trackVideoProgress, onComplete]
  );

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const completionPct = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;

  return (
    <div className="w-full space-y-3">
      {/* 16:9 Video Player Container */}
      <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-neuro-border shadow-subtle group">
        {errorMessage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50 border-2 border-dashed border-rose-200 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Video Playback Unavailable</h4>
            <p className="text-xs text-rose-600 max-w-md mb-4">{errorMessage}</p>
            {resolvedVideoId && (
              <a
                href={`https://www.youtube.com/watch?v=${resolvedVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neuro-purple bg-neuro-lavender hover:bg-neuro-lavenderDark rounded-xl transition-colors"
              >
                <span>Open Video Directly on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : (
          <>
            {/* The mounting container for the YouTube IFrame API */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Loading Overlay */}
            {playerState === 'unstarted' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs text-white">
                <Loader2 className="w-8 h-8 animate-spin text-neuro-purpleLight mb-2" />
                <span className="text-xs font-medium text-slate-200">Initializing YouTube Stream...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Telemetry & Playback Status Bar */}
      {!errorMessage && (
        <div className="bg-white rounded-2xl border border-neuro-border p-3.5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-neuro-text font-semibold">
              <Clock className="w-4 h-4 text-neuro-purple" />
              <span>
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </span>
            </div>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-2">
              <span className="text-neuro-textMuted text-[11px]">Progress:</span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-neuro-purple transition-all duration-300 rounded-full"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="font-bold text-neuro-text text-[11px]">{completionPct}%</span>
            </div>

            {hasCompletedRef.current && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>

          {/* Scientific Disclaimer (Requirement 7: Do not claim video playback proves attention/understanding) */}
          <div className="text-[11px] text-neuro-textMuted italic flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-neuro-purple shrink-0" />
            <span>Playback telemetry logged for curriculum progression. Video watch does not assess comprehension.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
