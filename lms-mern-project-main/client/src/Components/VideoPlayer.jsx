import React, { useState, useEffect } from 'react';
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
  FaVideo,
  FaSpinner,
  FaCog,
  FaClosedCaptioning,
  FaDownload,
  FaShare,
  FaHeart,
  FaBookmark
} from 'react-icons/fa';

const VideoPlayer = ({ 
  video, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious,
  courseTitle = "Course Video"
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

  const iframeRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setCurrentTime(0);
      setIsPlaying(false);
      setShowControls(true);
      
      // Auto-hide controls after 3 seconds
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, video]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
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
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isPlaying, volume, isMuted]);

  const getVideoUrl = (video) => {
    if (video?.lecture?.youtubeUrl) {
      // Extract video ID from YouTube URL and create embed URL
      const videoId = video.lecture.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}` : video.lecture.youtubeUrl;
    }
    return video?.lecture?.secure_url || '';
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // YouTube iframe API would be used here for actual play/pause
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const seek = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    // YouTube iframe API would be used here for actual seeking
  };

  const adjustVolume = (change) => {
    const newVolume = Math.max(0, Math.min(1, volume + change));
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    // Auto-hide controls after 3 seconds of no movement
    clearTimeout(window.controlsTimer);
    window.controlsTimer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title || 'Course Video',
        text: video?.description || 'Check out this video from the course!',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (!isOpen || !video) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 ${isFullscreen ? 'z-[9999]' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-90" onClick={onClose}></div>
      
      {/* Video Container */}
      <div className={`relative w-full h-full flex items-center justify-center p-4 ${isFullscreen ? 'p-0' : ''}`}>
        <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full max-h-[80vh]'}`}>
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-center">
                <FaSpinner className="animate-spin text-white text-4xl mx-auto mb-4" />
                <p className="text-white">Loading video...</p>
              </div>
            </div>
          )}

          {/* Video Player */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              ref={iframeRef}
              src={getVideoUrl(video)}
              title={video?.title || "Video Player"}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              onLoad={handleIframeLoad}
            ></iframe>
          </div>

          {/* Video Controls Overlay */}
          {showControls && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
              
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-4">
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/30 rounded-lg"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                  <div className="text-white">
                    <h3 className="font-semibold text-lg">{video?.title || "Video Player"}</h3>
                    <p className="text-sm text-gray-300">{courseTitle}</p>
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
                  className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors"
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
                  <div className="w-full bg-white/30 rounded-full h-1 cursor-pointer">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-200"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        {isMuted ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
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
                              onClick={() => {
                                setPlaybackRate(rate);
                                setShowSettings(false);
                              }}
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

          {/* Video Info Panel */}
          {showControls && video?.description && (
            <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white pointer-events-auto">
              <h4 className="font-semibold mb-2">{video.title}</h4>
              <p className="text-sm text-gray-300">{video.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 