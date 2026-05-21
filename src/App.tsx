import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { SiteProvider, useSite } from './context/SiteContext';
import { ChevronLeft, ChevronRight, Settings, ExternalLink, MoveHorizontal, X, FileText } from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { CustomCursor } from './components/CustomCursor';

const getGoogleDriveFileId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  const dMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }
  return null;
};

function MainContent() {
  const { config } = useSite();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMainMediaHovered, setIsMainMediaHovered] = useState(false);
  const [activePdfId, setActivePdfId] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>('');
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const totalPages = config.pages.length;

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  useEffect(() => {
    setIsMainMediaHovered(false);
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePdfId(null);
      }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div 
      className="relative h-screen w-full overflow-hidden transition-colors duration-500 cursor-none"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <CustomCursor />
      
      {/* Logo */}
      <AnimatePresence>
        {currentPage !== 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-4 left-4 md:top-8 md:left-8 z-50"
          >
            <button 
              onClick={() => setCurrentPage(0)}
              className="group focus:outline-none cursor-none"
            >
              <img 
                src={config.logoUrl} 
                alt="Logo" 
                className="h-10 md:h-20 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Trigger */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <button 
          onClick={() => setIsAdminOpen(true)}
          className="p-4 opacity-0 hover:opacity-40 transition-all duration-500 cursor-none rounded-full"
          style={{ color: 'inherit' }}
          title="Admin Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Navigation Arrows */}
      <AnimatePresence>
        {currentPage > 0 && (
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.4, x: 0 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onClick={handlePrev}
            className="nav-arrow absolute left-0 md:left-12 top-1/2 -translate-y-1/2 z-40 p-2 md:p-4 focus:outline-none cursor-none md:bg-transparent md:backdrop-blur-none md:shadow-none"
            aria-label="Previous page"
          >
            <ChevronLeft size={36} className="md:w-16 md:h-16" strokeWidth={1} style={{ color: 'rgb(93, 55, 42)' }} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentPage < totalPages - 1 && (
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.4, x: 0 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onClick={handleNext}
            className="nav-arrow absolute right-0 md:right-12 top-1/2 -translate-y-1/2 z-40 p-2 md:p-4 focus:outline-none cursor-none md:bg-transparent md:backdrop-blur-none md:shadow-none"
            aria-label="Next page"
          >
            <ChevronRight size={36} className="md:w-16 md:h-16" strokeWidth={1} style={{ color: 'rgb(93, 55, 42)' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Pages Container */}
      <div className="h-full w-full relative overflow-hidden">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%' }),
              center: { x: 0 },
              exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%' })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -100) handleNext();
              else if (info.offset.x > 100) handlePrev();
            }}
            transition={{ 
              x: { type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.8 },
              opacity: { duration: 0.4 }
            }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 text-center"
          >
            <div className="max-w-7xl w-full flex flex-col items-center gap-6 md:gap-12">
              {/* Media Section */}
              <motion.div 
                className={`relative overflow-hidden group flex items-center justify-center
                  ${config.pages[currentPage].id !== 1 ? 'orange-hover' : ''}
                  ${config.pages[currentPage].id === 1 ? 'w-[70%] md:w-[33%] shadow-none border-none' : 'rounded-lg shadow-2xl'}
                  ${[3, 4].includes(config.pages[currentPage].id) ? 'w-fit max-w-[70vw] md:max-w-2xl' : ''}
                  ${config.pages[currentPage].mediaType === 'video' ? 'w-full md:w-[85%] aspect-video h-auto max-h-[60vh] md:max-h-[80vh] bg-black' : ''}
                  ${[2, 5].includes(config.pages[currentPage].id) ? 'w-[40%] md:w-[25%]' : ''}
                  ${[2, 3, 4, 5].includes(config.pages[currentPage].id) ? 'h-auto max-h-[45vh] md:max-h-[60vh]' : ''}
                `}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  const rawLink = config.pages[currentPage].externalLink;
                  if (rawLink) {
                    const driveId = getGoogleDriveFileId(rawLink);
                    if (driveId) {
                      const titleLower = (config.pages[currentPage].title || '').toLowerCase();
                      const isVideo = titleLower.includes('showreel') || 
                                      titleLower.includes('video') || 
                                      titleLower.includes('film') || 
                                      config.pages[currentPage].id === 4;
                      
                      if (isVideo) {
                        // For videos on Google Drive, open using Google Drive's built-in player
                        window.open(`https://drive.google.com/file/d/${driveId}/view?usp=sharing`, '_blank');
                      } else {
                        // For documents/PDFs (like page 3 Artworks), open with the direct embedding viewer
                        const directViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(`https://drive.google.com/uc?id=${driveId}`)}&embedded=true`;
                        window.open(directViewerUrl, '_blank');
                      }
                    } else {
                      window.open(rawLink, '_blank');
                    }
                  }
                }}
                onMouseEnter={() => setIsMainMediaHovered(true)}
                onMouseLeave={() => setIsMainMediaHovered(false)}
              >
                {config.pages[currentPage].mediaType === 'image' ? (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={config.pages[currentPage].mediaUrl} 
                      alt={config.pages[currentPage].title}
                      className={`max-w-full max-h-full object-contain transition-all duration-700 
                        ${config.pages[currentPage].id === 1 ? '' : 'group-hover:scale-105'}
                        ${[3, 4].includes(config.pages[currentPage].id) ? 'block w-auto h-auto' : ''}
                        ${config.pages[currentPage].mediaUrlHover && isMainMediaHovered ? 'opacity-0' : 'opacity-100'}
                      `}
                    />
                    {config.pages[currentPage].mediaUrlHover && (
                      <img 
                        src={config.pages[currentPage].mediaUrlHover} 
                        alt={`${config.pages[currentPage].title} Hover`}
                        className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 
                          ${config.pages[currentPage].id === 1 ? '' : 'group-hover:scale-105'}
                          ${[3, 4].includes(config.pages[currentPage].id) ? 'block w-auto h-auto' : ''}
                          ${isMainMediaHovered ? 'opacity-100' : 'opacity-0'}
                        `}
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative w-full aspect-video flex items-center justify-center overflow-hidden bg-black">
                    {config.pages[currentPage].mediaUrl.includes('drive.google.com') ? (
                      <iframe
                        src={`${config.pages[currentPage].mediaUrl.replace('/view', '/preview')}&vq=hd1080`}
                        className="absolute inset-0 w-full h-full border-none"
                        allow="autoplay; fullscreen"
                        title={config.pages[currentPage].title}
                      />
                    ) : (
                      <video 
                        src={config.pages[currentPage].mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    )}
                    {/* Overlay for mouse capture on video/iframe */}
                    <div className="absolute inset-0 z-10 cursor-none" />
                  </div>
                )}
                
                {config.pages[currentPage].externalLink && (
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />
                )}
              </motion.div>

              {/* Text Section */}
              <div className="space-y-4 w-full">
                {config.pages[currentPage].title && (
                  <motion.h1 
                    className={`${config.pages[currentPage].styles.titleSize} ${config.pages[currentPage].styles.fontFamily} font-bold tracking-tighter whitespace-pre-wrap break-words`}
                    style={{ color: config.pages[currentPage].styles.titleColor }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {config.pages[currentPage].title}
                  </motion.h1>
                )}
                {config.pages[currentPage].description && (
                  <motion.p 
                    className={`${config.pages[currentPage].styles.descriptionSize} ${config.pages[currentPage].styles.fontFamily} ${config.pages[currentPage].id === 2 ? 'max-w-5xl page-2-description font-serif' : 'max-w-2xl text-balance'} mx-auto whitespace-pre-wrap break-words`}
                    style={{ color: config.pages[currentPage].styles.descriptionColor }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {config.pages[currentPage].description}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe Indicator for Mobile */}
      {currentPage === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="md:hidden absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-40 pointer-events-none"
        >
          <motion.div
            animate={{ x: [-10, 10, -10] }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: "easeInOut"
            }}
          >
            <MoveHorizontal size={18} style={{ color: '#ff4d00' }} className="opacity-90" />
          </motion.div>
          <span className="text-[9px] font-sans tracking-[0.25em] pl-[0.25em] text-[#ff4d00]/80 uppercase font-medium">
            Swipe
          </span>
        </motion.div>
      )}

      {/* Pagination Dots */}
      <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 z-40">
        {config.pages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (idx !== currentPage) {
                setDirection(idx > currentPage ? 1 : -1);
                setCurrentPage(idx);
              }
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-none ${
              currentPage === idx ? 'bg-black scale-125' : 'bg-black/20 hover:bg-black/40'
            }`}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>

      {/* PDF Lightbox Modal */}
      <AnimatePresence>
        {activePdfId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-3 md:p-8 backdrop-blur-md cursor-auto"
            onClick={() => setActivePdfId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-6xl h-[88vh] bg-[#FFF8F2] rounded-2xl shadow-2xl overflow-hidden flex flex-col cursor-default border border-gray-200/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-4 md:px-8 py-4 border-b border-gray-100/60 bg-[#FFEEDF]/60 backdrop-blur-md">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1 px-2 rounded bg-[#ff4d00]/10">
                    <FileText size={16} className="text-[#ff4d00]" />
                  </div>
                  <span className="text-[11px] md:text-sm font-sans font-bold text-gray-800 tracking-[0.1em] uppercase">
                    {activePdfTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3 md:gap-5">
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(`https://drive.google.com/uc?id=${activePdfId}`)}&embedded=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] md:text-xs text-gray-500 hover:text-[#ff4d00] flex items-center gap-1 font-sans font-semibold transition-colors cursor-none py-1.5 px-3 rounded-full hover:bg-[#ff4d00]/5 border border-gray-200"
                  >
                    새 창으로 보기 <ExternalLink size={11} className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setActivePdfId(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-none p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                    aria-label="Close document"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              {/* PDF Content Area */}
              <div className="flex-1 bg-[#1a1a1a] relative">
                {isPdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF8F2] gap-3 z-10">
                    <div className="w-10 h-10 border-4 border-[#ff4d00]/10 border-t-[#ff4d00] rounded-full animate-spin" />
                    <span className="text-[10px] font-sans tracking-[0.2em] text-[#ff4d00] font-bold animate-pulse uppercase">
                      Document Loading...
                    </span>
                  </div>
                )}
                <iframe
                  src={`https://drive.google.com/file/d/${activePdfId}/preview`}
                  className="w-full h-full border-none"
                  onLoad={() => setIsPdfLoading(false)}
                  title="Document Preview"
                  allow="autoplay"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>
      
      <style>{`
        .cursor-none * {
          cursor: none !important;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <MainContent />
    </SiteProvider>
  );
}
