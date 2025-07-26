import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPlay, 
  FaPause, 
  FaExpand, 
  FaCompress, 
  FaVolumeUp, 
  FaVolumeMute,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaSpinner,
  FaCog,
  FaClosedCaptioning,
  FaShare,
  FaHeart,
  FaBookmark,
  FaStepBackward,
  FaStepForward,
  FaVideo,
  FaExternalLinkAlt
} from 'react-icons/fa';

const CustomVideoPlayer = ({
  video,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  courseTitle = "Course Video",
  userName = "User"
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState(0);
  const [displayUserName, setDisplayUserName] = useState('');

  const iframeRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const watermarkTimerRef = useRef(null);

  // Simulated video state for custom controls
  const [videoState, setVideoState] = useState({
    ready: false,
    canPlay: false,
    seeking: false,
    error: null
  });

  useEffect(() => {
    if (isOpen && video) {
      initializeVideo();
      startControlsTimer();
      checkDeviceType();
      startWatermarkTimer();
    }
    
    return () => {
      clearControlsTimer();
      clearTimeUpdateInterval();
      clearWatermarkTimer();
    };
  }, [isOpen, video]);

  // Check if device is mobile and handle orientation
  useEffect(() => {
    const checkDeviceType = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      
      if (isMobileDevice) {
        // Request fullscreen and landscape on mobile
        requestFullscreenAndLandscape();
      }
    };

    const handleOrientationChange = () => {
      setIsLandscape(window.orientation === 90 || window.orientation === -90);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    checkDeviceType();
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const initializeVideo = () => {
    setIsLoading(true);
    setCurrentTime(0);
    setIsPlaying(false);
    setShowControls(true);
    setVideoState({ ready: false, canPlay: false, seeking: false, error: null });
    setIframeLoaded(false);
    
    // Extract YouTube video ID
    const videoUrl = getVideoUrl(video);
    const videoId = extractYouTubeVideoId(videoUrl);
    
    if (videoId) {
      console.log('YouTube video detected with ID:', videoId);
      setYoutubeVideoId(videoId);
      setDuration(180); // Default duration, will be updated
    } else {
      console.log('No YouTube video found');
      setYoutubeVideoId(null);
    }
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getVideoUrl = (video) => {
    if (video?.lecture?.youtubeUrl) {
      return video.lecture.youtubeUrl;
    }
    if (video?.youtubeUrl) {
      return video.youtubeUrl;
    }
    return video?.lecture?.secure_url || video?.secure_url || '';
  };

  const getYouTubeEmbedUrl = (videoId) => {
    if (!videoId) return '';
    // Create embed URL with minimal parameters to prevent YouTube branding
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&fs=0&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    setShowSettings(false);
    
    // Send playback rate command to iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'setPlaybackRate',
            args: [rate]
          }),
          '*'
        );
        console.log(`Playback rate set to ${rate}x`);
      } catch (error) {
        console.log('PostMessage not available for playback rate');
      }
    }
  };

  const getVideoTitle = (video) => {
    return video?.title || video?.lecture?.title || "Video Player";
  };

  const getVideoDescription = (video) => {
    return video?.description || video?.lecture?.description || "";
  };

  const startControlsTimer = () => {
    clearControlsTimer();
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const clearControlsTimer = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  };

  const clearTimeUpdateInterval = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  // Simulate time updates for custom progress bar
  useEffect(() => {
    if (isPlaying && !isDragging && videoState.canPlay) {
      timeUpdateIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearTimeUpdateInterval();
    }

    return () => clearTimeUpdateInterval();
  }, [isPlaying, isDragging, videoState.canPlay, duration]);

  // Simulate buffering
  useEffect(() => {
    if (isPlaying && videoState.canPlay) {
      const interval = setInterval(() => {
        setBuffered(prev => Math.min(prev + Math.random() * 5, 100));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, videoState.canPlay]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'Home':
          e.preventDefault();
          seekTo(0);
          break;
        case 'End':
          e.preventDefault();
          seekTo(duration);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isPlaying, volume, isMuted, duration]);

  const handleMouseMove = () => {
    setShowControls(true);
    startControlsTimer();
  };

  const togglePlay = () => {
    if (!videoState.canPlay) return;
    
    setIsPlaying(!isPlaying);
    
    // Send play/pause command to iframe via postMessage
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: []
          }),
          '*'
        );
      } catch (error) {
        console.log('PostMessage not available, using simulated controls');
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Send mute/unmute command to iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isMuted ? 'unMute' : 'mute';
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: []
          }),
          '*'
        );
      } catch (error) {
        console.log('PostMessage not available, using simulated controls');
      }
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen toggle failed:', error);
    }
  };

  const seek = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    seekTo(newTime);
  };

  const seekTo = (time) => {
    const newTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(newTime);
    setVideoState(prev => ({ ...prev, seeking: true }));
    
    // Send seek command to iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [newTime, true]
          }),
          '*'
        );
      } catch (error) {
        console.log('PostMessage not available, using simulated controls');
      }
    }
    
    setTimeout(() => {
      setVideoState(prev => ({ ...prev, seeking: false }));
    }, 500);
  };

  const adjustVolume = (change) => {
    const newVolume = Math.max(0, Math.min(1, volume + change));
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    
    // Send volume command to iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'setVolume',
            args: [newVolume * 100]
          }),
          '*'
        );
      } catch (error) {
        console.log('PostMessage not available, using simulated controls');
      }
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    
    // Send volume command to iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'setVolume',
            args: [newVolume * 100]
          }),
          '*'
        );
      } catch (error) {
        console.log('PostMessage not available, using simulated controls');
      }
    }
  };

  const handleProgressClick = (e) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressWidth = rect.width;
    const clickPercent = clickX / progressWidth;
    const newTime = clickPercent * duration;
    
    seekTo(newTime);
  };

  const handleProgressDrag = (e) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const progressWidth = rect.width;
    const clickPercent = clickX / progressWidth;
    const newTime = clickPercent * duration;
    
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Video Player',
        text: getVideoDescription(video) || 'Check out this video!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      console.log('Link copied to clipboard');
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    // Exit fullscreen if in fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    onClose();
  };

  const checkDeviceType = () => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
    
    if (isMobileDevice) {
      // Request fullscreen and landscape on mobile
      requestFullscreenAndLandscape();
    }
  };

  const requestFullscreenAndLandscape = async () => {
    try {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
      
      // Try to lock orientation to landscape (works on some mobile browsers)
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock('landscape');
        } catch (error) {
          console.log('Orientation lock not supported');
        }
      }
    } catch (error) {
      console.log('Fullscreen request failed:', error);
    }
  };

  // Watermark system for video protection
  const startWatermarkTimer = () => {
    clearWatermarkTimer();
    setDisplayUserName(userName);
    
    // Change watermark position every 5 seconds
    watermarkTimerRef.current = setInterval(() => {
      setWatermarkPosition(prev => (prev + 1) % 8); // 8 different positions
    }, 5000);
    
    // Cleanup timestamp interval when component unmounts
    return () => {
      clearInterval(watermarkTimerRef.current);
    };
  };

  const clearWatermarkTimer = () => {
    if (watermarkTimerRef.current) {
      clearInterval(watermarkTimerRef.current);
      watermarkTimerRef.current = null;
    }
  };

  const getWatermarkStyle = () => {
    const positions = [
      { top: '10%', left: '10%' },
      { top: '10%', right: '10%' },
      { bottom: '10%', left: '10%' },
      { bottom: '10%', right: '10%' },
      { top: '50%', left: '10%', transform: 'translateY(-50%)' },
      { top: '50%', right: '10%', transform: 'translateY(-50%)' },
      { left: '50%', top: '10%', transform: 'translateX(-50%)' },
      { left: '50%', bottom: '10%', transform: 'translateX(-50%)' }
    ];
    
    return positions[watermarkPosition];
  };

  const handleIframeLoad = () => {
    console.log('YouTube iframe loaded');
    setIsLoading(false);
    setIframeLoaded(true);
    setVideoState(prev => ({ ...prev, ready: true, canPlay: true }));
  };

  if (!isOpen || !video) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 ${isFullscreen ? 'z-[9999]' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-90" onClick={handleClose}></div>
      
      {/* Video Container */}
      <div className={`relative w-full h-full flex items-center justify-center p-4 ${isFullscreen ? 'p-0' : ''}`}>
        <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full max-h-[80vh]'}`}>
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-center">
                <FaSpinner className="animate-spin text-white text-4xl mx-auto mb-4" />
                <p className="text-white">Loading video...</p>
                <p className="text-white text-sm mt-2">Initializing player...</p>
                {isMobile && (
                  <p className="text-white text-sm mt-2">Rotate device for better viewing</p>
                )}
              </div>
            </div>
          )}

          {/* Mobile Rotation Indicator */}
          {isMobile && !isLandscape && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
              <div className="text-center">
                <FaVideo className="text-white text-4xl mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">Rotate Device</p>
                <p className="text-white text-sm">Please rotate your device to landscape mode for the best viewing experience</p>
                <button
                  onClick={requestFullscreenAndLandscape}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Enter Fullscreen
                </button>
              </div>
            </div>
          )}

          {/* Video Player */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {youtubeVideoId ? (
              <div className="absolute inset-0">
                <iframe
                  ref={iframeRef}
                  src={getYouTubeEmbedUrl(youtubeVideoId)}
                  title={getVideoTitle(video)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                  onError={() => {
                    console.error('YouTube iframe failed to load');
                    setIsLoading(false);
                    setVideoState(prev => ({ ...prev, error: 'Failed to load video' }));
                  }}
                />
                {/* Custom overlay to prevent YouTube interaction */}
                <div className="absolute inset-0 pointer-events-none z-20"></div>
                
                {/* Dynamic Watermark */}
                {iframeLoaded && (
                  <div 
                    className="absolute pointer-events-none z-25 select-none"
                    style={{
                      ...getWatermarkStyle(),
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                      fontFamily: 'Arial, sans-serif',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                  >
                    <div className="bg-black bg-opacity-60 px-3 py-1 rounded">
                      {displayUserName}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <FaVideo className="text-6xl mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Video Player</h3>
                  <p className="text-sm text-gray-400 mt-2">No video source available</p>
                </div>
              </div>
            )}
          </div>

          {/* Always Visible Close Button */}
          <div className="absolute top-4 left-4 z-40 pointer-events-auto">
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/50 rounded-lg bg-black/30 backdrop-blur-sm"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Custom Video Controls Overlay */}
          {showControls && iframeLoaded && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-30">
              
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-4">
                  <div className="text-white">
                    <h3 className="font-semibold text-lg">Video Player</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-lg transition-colors ${
                      isLiked ? 'text-red-500 bg-red-500/20' : 'text-white hover:bg-black/30'
                    }`}
                  >
                    <FaHeart className="text-lg" />
                  </button>
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2 rounded-lg transition-colors ${
                      isBookmarked ? 'text-blue-500 bg-blue-500/20' : 'text-white hover:bg-black/30'
                    }`}
                  >
                    <FaBookmark className="text-lg" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/30 rounded-lg"
                  >
                    <FaShare className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <button
                  onClick={togglePlay}
                  disabled={!videoState.canPlay}
                  className={`bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors ${
                    !videoState.canPlay ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isPlaying ? (
                    <FaPause className="text-white text-4xl" />
                  ) : (
                    <FaPlay className="text-white text-4xl ml-2" />
                  )}
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-auto">
                {hasPrevious && (
                  <button
                    onClick={onPrevious}
                    className="bg-black/50 text-white p-3 rounded-r-lg hover:bg-black/70 transition-colors"
                  >
                    <FaChevronLeft className="text-xl" />
                  </button>
                )}
              </div>
              
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-auto">
                {hasNext && (
                  <button
                    onClick={onNext}
                    className="bg-black/50 text-white p-3 rounded-l-lg hover:bg-black/70 transition-colors"
                  >
                    <FaChevronRight className="text-xl" />
                  </button>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div 
                    ref={progressBarRef}
                    className="w-full bg-white/30 rounded-full h-1 cursor-pointer relative"
                    onClick={handleProgressClick}
                    onMouseDown={(e) => {
                      setIsDragging(true);
                      handleProgressDrag(e);
                    }}
                    onMouseMove={(e) => {
                      if (isDragging) {
                        handleProgressDrag(e);
                      }
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                  >
                    {/* Buffered progress */}
                    <div 
                      className="bg-white/50 h-1 rounded-full absolute top-0 left-0"
                      style={{ width: `${buffered}%` }}
                    ></div>
                    {/* Played progress */}
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-200 relative z-10"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                    {/* Progress indicator */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg z-20"
                      style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-6px' }}
                    ></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      disabled={!videoState.canPlay}
                      className={`text-white hover:text-gray-300 transition-colors ${
                        !videoState.canPlay ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
                    </button>
                    
                    <button
                      onClick={() => seek(-10)}
                      disabled={!videoState.canPlay}
                      className={`text-white hover:text-gray-300 transition-colors ${
                        !videoState.canPlay ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FaStepBackward className="text-lg" />
                    </button>
                    
                    <button
                      onClick={() => seek(10)}
                      disabled={!videoState.canPlay}
                      className={`text-white hover:text-gray-300 transition-colors ${
                        !videoState.canPlay ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FaStepForward className="text-lg" />
                    </button>
                    
                    <div className="flex items-center gap-2 relative">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300 transition-colors"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        {isMuted ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
                      </button>
                      
                      <div 
                        className={`absolute bottom-full left-0 mb-2 bg-black/90 rounded-lg p-2 transition-opacity ${
                          showVolumeSlider ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <input
                          ref={volumeSliderRef}
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            handleVolumeChange(parseFloat(e.target.value));
                          }}
                          className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                          }}
                        />
                        <div className="text-white text-xs text-center mt-1">
                          {Math.round((isMuted ? 0 : volume) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-white text-sm">
                      <FaClock className="text-gray-400" />
                      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCaptions(!showCaptions)}
                      className={`p-2 rounded-lg transition-colors ${
                        showCaptions ? 'text-blue-500 bg-blue-500/20' : 'text-white hover:bg-black/30'
                      }`}
                    >
                      <FaClosedCaptioning className="text-lg" />
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/30 rounded-lg"
                      >
                        <FaCog className="text-lg" />
                      </button>
                      
                      {showSettings && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 text-white rounded-lg p-2 min-w-[120px]">
                          <div className="text-sm mb-2">Playback Speed</div>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`block w-full text-left px-2 py-1 rounded text-sm ${
                                playbackRate === rate ? 'bg-blue-500' : 'hover:bg-white/20'
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/30 rounded-lg"
                    >
                      {isFullscreen ? <FaCompress className="text-lg" /> : <FaExpand className="text-lg" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer; 